"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { logAdminEvent } from "@/lib/admin-events";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import {
  inviteUserSchema,
  linkEditorToUserSchema,
  setUserActiveSchema,
  updateSettingSchema,
  updateUserRoleSchema,
  upsertEditingGoalSchema,
  upsertEditorSchema,
  upsertExpertSchema,
  upsertPhotographerSchema,
  upsertQcIssueTypeSchema,
} from "@/lib/validation";

export type BeheerActionResult = { ok: true } | { ok: false; message: string };

/**
 * Elke actie hier controleert eerst zelf de rol via de gewone (RLS-gebonden)
 * client, ook al dekt RLS de tabel-writes al: bij de admin-client (invite,
 * deactivate-account) is er geen RLS die het tegenhoudt, dus de rolcheck moet
 * vóór de aanroep staan, niet erna (BUILDPLAN-V3.md §5.4).
 */
async function requireCoordinator() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    return { ok: false as const, message: "Alleen de coördinator kan dit beheren." };
  }
  return { ok: true as const, user };
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { ok: false as const, message: "Alleen een admin kan dit beheren." };
  }
  return { ok: true as const, user };
}

function friendlyAdminError(error: unknown): string {
  if (error instanceof Error && error.message === "SUPABASE_SERVICE_ROLE_KEY_MISSING") {
    return "Accountbeheer is hier niet beschikbaar (geen service-role key in deze omgeving).";
  }
  return "Er ging iets mis. Probeer opnieuw.";
}

// ── Gebruikers ───────────────────────────────────────────────────────────────

/**
 * Nodigt een nieuwe gebruiker uit via de Supabase Admin API en zet meteen de
 * app_users-rij klaar met de gekozen rol, zodat de eerste keer inloggen al
 * de juiste rechten geeft.
 */
export async function inviteUser(input: {
  email: string;
  fullName: string;
  role: "admin" | "coordinator" | "editor" | "viewer";
}): Promise<BeheerActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = inviteUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const origin = (await headers()).get("origin");
  if (!origin) return { ok: false, message: "Kon de uitnodiging niet voorbereiden. Probeer opnieuw." };

  let admin: ReturnType<typeof getAdminClient>;
  try {
    admin = getAdminClient();
  } catch (error) {
    return { ok: false, message: friendlyAdminError(error) };
  }

  const invited = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback`,
    data: { full_name: parsed.data.fullName },
  });
  if (invited.error || !invited.data.user) {
    return {
      ok: false,
      message:
        invited.error?.code === "email_exists"
          ? "Er bestaat al een account met dit e-mailadres."
          : "De uitnodiging kon niet worden verstuurd. Probeer opnieuw.",
    };
  }

  const { error: profileError } = await admin.from("app_users").insert({
    id: invited.data.user.id,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    role: parsed.data.role,
  });
  if (profileError) {
    // Auth-account bestaat al, profiel niet - opruimen zodat de uitnodiging
    // herhaalbaar is in plaats van een halve gebruiker achter te laten.
    await admin.auth.admin.deleteUser(invited.data.user.id);
    return { ok: false, message: "Het gebruikersprofiel kon niet worden aangemaakt. Probeer opnieuw." };
  }

  await logAdminEvent(admin, gate.user.id, "invite_user", `${parsed.data.email} (${parsed.data.role})`);
  revalidatePath("/beheer/gebruikers");
  return { ok: true };
}

export type AdminUserRow = {
  id: string;
  fullName: string;
  email: string | null;
  role: "admin" | "coordinator" | "editor" | "viewer";
  lastSignInAt: string | null;
  isActive: boolean;
};

/**
 * app_users heeft geen is_active/last_sign_in_at kolom (zie schema): dat zit
 * in auth.users, alleen bereikbaar via de Admin API. Deze action combineert
 * beide bronnen zodat de gebruikerslijst er in één keer compleet uitkomt.
 * Coordinator mag kijken, alleen admin mag wijzigen (zie de andere acties).
 */
export async function listUsersWithAuthMeta(): Promise<
  { ok: true; users: AdminUserRow[] } | { ok: false; message: string }
> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("app_users")
    .select("id, full_name, email, role")
    .order("full_name");
  if (error) return { ok: false, message: "Gebruikers konden niet worden geladen." };

  let admin: ReturnType<typeof getAdminClient>;
  try {
    admin = getAdminClient();
  } catch (error) {
    // Geen service-role key in deze omgeving (bv. een Preview-deploy): toon
    // de profielen zonder auth-metadata in plaats van de hele lijst te laten
    // mislukken.
    void error;
    return {
      ok: true,
      users: (profiles ?? []).map((p) => ({
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        role: p.role,
        lastSignInAt: null,
        isActive: true,
      })),
    };
  }

  const authById = new Map<string, { last_sign_in_at: string | null; banned_until: string | null }>();
  let page = 1;
  for (;;) {
    const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (listError || !data) break;
    for (const u of data.users) {
      authById.set(u.id, {
        last_sign_in_at: u.last_sign_in_at ?? null,
        banned_until: (u as unknown as { banned_until?: string | null }).banned_until ?? null,
      });
    }
    if (data.users.length < 200) break;
    page += 1;
  }

  const users: AdminUserRow[] = (profiles ?? []).map((p) => {
    const meta = authById.get(p.id);
    const bannedUntil = meta?.banned_until;
    const isBanned = Boolean(bannedUntil && (bannedUntil === "none" ? false : new Date(bannedUntil).getTime() > Date.now()));
    return {
      id: p.id,
      fullName: p.full_name,
      email: p.email,
      role: p.role,
      lastSignInAt: meta?.last_sign_in_at ?? null,
      isActive: !isBanned,
    };
  });

  return { ok: true, users };
}

export async function updateUserRole(input: {
  userId: string;
  role: "admin" | "coordinator" | "editor" | "viewer";
}): Promise<BeheerActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  if (parsed.data.userId === gate.user.id && parsed.data.role !== "admin") {
    return { ok: false, message: "Je kunt jezelf niet degraderen. Vraag een andere admin." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("app_users").update({ role: parsed.data.role }).eq("id", parsed.data.userId);
  if (error) return { ok: false, message: "De rol kon niet worden gewijzigd. Probeer opnieuw." };

  await logAdminEvent(supabase, gate.user.id, "update_user_role", `${parsed.data.userId} -> ${parsed.data.role}`);
  revalidatePath("/beheer/gebruikers");
  return { ok: true };
}

export async function setUserActive(input: { userId: string; isActive: boolean }): Promise<BeheerActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = setUserActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  if (parsed.data.userId === gate.user.id && !parsed.data.isActive) {
    return { ok: false, message: "Je kunt jezelf niet deactiveren. Vraag een andere admin." };
  }

  let admin: ReturnType<typeof getAdminClient>;
  try {
    admin = getAdminClient();
  } catch (error) {
    return { ok: false, message: friendlyAdminError(error) };
  }

  // is_active staat niet op app_users (zie schema) - "deactiveren" van een
  // account betekent hier: inloggen blokkeren via de Auth Admin API, de rol
  // en historie blijven intact voor status_events.actor_id.
  const { error } = await admin.auth.admin.updateUserById(parsed.data.userId, {
    ban_duration: parsed.data.isActive ? "none" : "876000h", // ~100 jaar, Supabase kent geen permanente ban
  });
  if (error) return { ok: false, message: friendlyAdminError(error) };

  await logAdminEvent(
    admin,
    gate.user.id,
    parsed.data.isActive ? "activate_user" : "deactivate_user",
    parsed.data.userId,
  );
  revalidatePath("/beheer/gebruikers");
  return { ok: true };
}

// ── Editors ──────────────────────────────────────────────────────────────────

export async function upsertEditor(input: { id: string | null; name: string; isActive: boolean }): Promise<BeheerActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = upsertEditorSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const payload = { name: parsed.data.name, is_active: parsed.data.isActive };
  const { error } = parsed.data.id
    ? await supabase.from("editors").update(payload).eq("id", parsed.data.id)
    : await supabase.from("editors").insert(payload);

  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "Er bestaat al een editor met deze naam." : "Opslaan mislukt. Probeer opnieuw.",
    };
  }

  await logAdminEvent(supabase, gate.user.id, parsed.data.id ? "update_editor" : "create_editor", parsed.data.name);
  revalidatePath("/beheer/editors");
  return { ok: true };
}

export async function linkEditorToUser(input: { editorId: string; userId: string | null }): Promise<BeheerActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = linkEditorToUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("editors")
    .update({ user_id: parsed.data.userId })
    .eq("id", parsed.data.editorId);
  if (error) return { ok: false, message: "Koppelen mislukt. Probeer opnieuw." };

  await logAdminEvent(supabase, gate.user.id, "link_editor_to_user", `${parsed.data.editorId} -> ${parsed.data.userId ?? "geen"}`);
  revalidatePath("/beheer/editors");
  return { ok: true };
}

// ── Verhuurexperts ───────────────────────────────────────────────────────────

export async function upsertExpert(input: {
  id: string | null;
  name: string;
  email: string | null;
  country: string | null;
  isActive: boolean;
}): Promise<BeheerActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = upsertExpertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const payload = {
    name: parsed.data.name,
    email: parsed.data.email || null,
    country: parsed.data.country || null,
    is_active: parsed.data.isActive,
  };
  const { error } = parsed.data.id
    ? await supabase.from("rental_experts").update(payload).eq("id", parsed.data.id)
    : await supabase.from("rental_experts").insert(payload);

  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "Er bestaat al een verhuurexpert met deze naam." : "Opslaan mislukt. Probeer opnieuw.",
    };
  }

  await logAdminEvent(supabase, gate.user.id, parsed.data.id ? "update_expert" : "create_expert", parsed.data.name);
  revalidatePath("/beheer/editors");
  return { ok: true };
}

// ── Fotografen (V3-WP6) ──────────────────────────────────────────────────────

export async function upsertPhotographer(input: {
  id: string | null;
  name: string;
  aresAlias: string | null;
  land: string | null;
  postcode: string | null;
  isActive: boolean;
}): Promise<BeheerActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = upsertPhotographerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const payload = {
    name: parsed.data.name,
    ares_alias: parsed.data.aresAlias || null,
    land: parsed.data.land || null,
    postcode: parsed.data.postcode || null,
    is_active: parsed.data.isActive,
  };
  const { error } = parsed.data.id
    ? await supabase.from("photographers").update(payload).eq("id", parsed.data.id)
    : await supabase.from("photographers").insert(payload);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "23505"
          ? "Er bestaat al een fotograaf met deze naam of Ares-alias."
          : "Opslaan mislukt. Probeer opnieuw.",
    };
  }

  await logAdminEvent(supabase, gate.user.id, parsed.data.id ? "update_photographer" : "create_photographer", parsed.data.name);
  revalidatePath("/beheer/fotografen");
  revalidatePath("/kaart");
  return { ok: true };
}

// ── Instellingen ─────────────────────────────────────────────────────────────

export async function updateSetting(input: { key: string; value: string }): Promise<BeheerActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = updateSettingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("app_settings").update({ value: parsed.data.value }).eq("key", parsed.data.key);
  if (error) return { ok: false, message: "Opslaan mislukt. Probeer opnieuw." };

  await logAdminEvent(supabase, gate.user.id, "update_setting", `${parsed.data.key} = ${parsed.data.value}`);
  revalidatePath("/beheer/instellingen");
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ── Editing goals ────────────────────────────────────────────────────────────

export async function upsertEditingGoal(input: {
  code: string;
  labelNl: string;
  labelEn: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}): Promise<BeheerActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = upsertEditingGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("editing_goals").upsert({
    code: parsed.data.code,
    label_nl: parsed.data.labelNl,
    label_en: parsed.data.labelEn,
    description: parsed.data.description,
    is_active: parsed.data.isActive,
    sort_order: parsed.data.sortOrder,
  });
  if (error) return { ok: false, message: "Opslaan mislukt. Probeer opnieuw." };

  await logAdminEvent(supabase, gate.user.id, "upsert_editing_goal", parsed.data.code);
  revalidatePath("/beheer/referentiedata");
  return { ok: true };
}

// ── QC-issuetypes ────────────────────────────────────────────────────────────

export async function upsertQcIssueType(input: {
  code: string;
  labelNl: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}): Promise<BeheerActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = upsertQcIssueTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("qc_issue_types").upsert({
    code: parsed.data.code,
    label_nl: parsed.data.labelNl,
    description: parsed.data.description,
    is_active: parsed.data.isActive,
    sort_order: parsed.data.sortOrder,
  });
  if (error) return { ok: false, message: "Opslaan mislukt. Probeer opnieuw." };

  await logAdminEvent(supabase, gate.user.id, "upsert_qc_issue_type", parsed.data.code);
  revalidatePath("/beheer/referentiedata");
  revalidatePath("/qc");
  return { ok: true };
}
