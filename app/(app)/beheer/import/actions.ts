"use server";

import { revalidatePath } from "next/cache";

import {
  buildAresImportCandidates,
  parseAccoId,
  parseAresDate,
  parseAresWorkbook,
  type ImportCandidate,
  type ParsedAresRow,
} from "@/lib/ares-import";
import postcodeCoords from "@/lib/postcode-coords.json";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import {
  commitAresImportSchema,
  deleteAresExpertAliasSchema,
  uploadAresFileSchema,
  upsertAresExpertAliasSchema,
} from "@/lib/validation";

async function requireCoordinator() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    return { ok: false as const, message: "Alleen de coördinator kan importeren." };
  }
  return { ok: true as const, user };
}

/** Postcodes uit deze rijen die niet in lib/postcode-coords.json staan. */
function findUngeocoded(rows: ParsedAresRow[]): { land: string; postcode: string; count: number }[] {
  const counts = new Map<string, { land: string; postcode: string; count: number }>();
  for (const row of rows) {
    const parsed = parseAccoId(row.accoId);
    if (!parsed) continue;
    const key = `${parsed.land}.${parsed.postcode}`;
    if (key in postcodeCoords) continue;
    const existing = counts.get(key);
    if (existing) existing.count++;
    else counts.set(key, { land: parsed.land, postcode: parsed.postcode, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

async function fetchHistoricalWinterAccoIds(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from("ares_shoots").select("acco_id").contains("tasks", ["ExteriorWinter"]);
  return new Set((data ?? []).map((r) => r.acco_id));
}

export type PreviewResult =
  | {
      ok: true;
      candidates: ImportCandidate[];
      ignoredNonAt: number;
      ignoredNotQualifying: number;
      ungeocoded: { land: string; postcode: string; count: number }[];
      openShootCount: number;
    }
  | { ok: false; message: string };

const openStatuses = ["Assigned", "Readytoshoot", "Signedup", "Onhold"];

/**
 * Stap 1: parseert het bestand en berekent de vier groepen, maar schrijft
 * niets. Het bestand zelf wordt nergens opgeslagen (AGENTS.md regel 2 gaat
 * over foto's, maar dezelfde terughoudendheid past hier: de app onthoudt
 * alleen wat er geïmporteerd is, niet het brondocument).
 */
export async function previewAresImport(file: File): Promise<PreviewResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = uploadAresFileSchema.safeParse({ file });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldig bestand" };
  }

  const buffer = await file.arrayBuffer();
  const parseResult = parseAresWorkbook(buffer);
  if (!parseResult.ok) return { ok: false, message: parseResult.error };

  const supabase = await createClient();
  const [{ data: existing }, { data: aliases }, historicalWinterAccoIds] = await Promise.all([
    supabase.from("assignments").select("acco_id"),
    supabase.from("ares_expert_aliases").select("alias"),
    fetchHistoricalWinterAccoIds(supabase),
  ]);

  const funnel = buildAresImportCandidates({
    rows: parseResult.rows,
    existingAccoIds: new Set((existing ?? []).map((r) => r.acco_id)),
    knownAliases: new Set((aliases ?? []).map((r) => r.alias.toLowerCase())),
    historicalWinterAccoIds,
  });

  return {
    ok: true,
    ...funnel,
    ungeocoded: findUngeocoded(parseResult.rows),
    openShootCount: parseResult.rows.filter((r) => openStatuses.includes(r.status)).length,
  };
}

export type CommitResult =
  | { ok: true; createdCount: number; skippedCount: number; shootCount: number }
  | { ok: false; message: string };

/**
 * Stap 2: parseert het bestand opnieuw server-side (i.p.v. de
 * client-geselecteerde velden te vertrouwen — selectedRowKeys is alleen de
 * keuze van de gebruiker) en doet twee dingen in één import:
 * 1. Bewaart élke rij in ares_shoots (upsert op ares_row_key), zodat
 *    openstaande shoots - die geen editing-opdracht zijn en dus anders
 *    nergens bestaan - zichtbaar worden op de shootplanner-kaart.
 * 2. Maakt assignments aan voor de geselecteerde summer_to_winter-kandidaten,
 *    zoals in WP3.
 */
export async function commitAresImport(input: {
  file: File;
  selectedRowKeys: string[];
}): Promise<CommitResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = commitAresImportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const buffer = await parsed.data.file.arrayBuffer();
  const parseResult = parseAresWorkbook(buffer);
  if (!parseResult.ok) return { ok: false, message: parseResult.error };

  const supabase = await createClient();
  const [{ data: existing }, { data: aliases }, historicalWinterAccoIds] = await Promise.all([
    supabase.from("assignments").select("acco_id"),
    supabase.from("ares_expert_aliases").select("alias, rental_expert_id"),
    fetchHistoricalWinterAccoIds(supabase),
  ]);

  const existingAccoIds = new Set((existing ?? []).map((r) => r.acco_id));
  const aliasToExpertId = new Map((aliases ?? []).map((r) => [r.alias.toLowerCase(), r.rental_expert_id]));
  const knownAliases = new Set((aliases ?? []).map((r) => r.alias.toLowerCase()));

  const funnel = buildAresImportCandidates({
    rows: parseResult.rows,
    existingAccoIds,
    knownAliases,
    historicalWinterAccoIds,
  });

  const selectedKeys = new Set(parsed.data.selectedRowKeys);
  const toCreate = funnel.candidates.filter(
    (c) => selectedKeys.has(c.rowKey) && (c.group === "new" || c.group === "winter_overlap"),
  );
  const skippedCount = selectedKeys.size - toCreate.length;

  // 1. ares_shoots: elke rij, ongeacht kandidaatstatus (BUILDPLAN-V3.md V3-WP6.1).
  const shootRows = parseResult.rows
    .map((row) => {
      const location = parseAccoId(row.accoId);
      if (!location) return null;
      return {
        ares_row_key: row.rowKey,
        acco_id: row.accoId,
        land: location.land,
        postcode: location.postcode,
        status: row.status,
        tasks: row.tasks,
        photographer_alias: row.photographerAlias || null,
        expert_alias: row.expertAlias || null,
        request_date: parseAresDate(row.requestDateRaw),
        imported_at: new Date().toISOString(),
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (shootRows.length > 0) {
    const { error: shootsError } = await supabase
      .from("ares_shoots")
      .upsert(shootRows, { onConflict: "ares_row_key" });
    if (shootsError) {
      return {
        ok: false,
        message:
          shootsError.code === "42501"
            ? "Alleen de coördinator kan importeren."
            : "De shoots konden niet worden opgeslagen. Probeer opnieuw.",
      };
    }
  }

  // 2. Nieuwe summer_to_winter-opdrachten voor de geselecteerde kandidaten.
  if (toCreate.length > 0) {
    const { error: insertError } = await supabase.from("assignments").insert(
      toCreate.map((c) => ({
        acco_id: c.accoId,
        status: "new" as const,
        priority: c.priority,
        rental_expert_id: aliasToExpertId.get(c.expertAlias.trim().toLowerCase()) ?? null,
        request_date: c.requestDate,
        ares_row_key: c.rowKey,
        source: "ares_import" as const,
        import_goal_code: "summer_to_winter",
      })),
    );
    if (insertError) {
      return {
        ok: false,
        message:
          insertError.code === "42501"
            ? "Alleen de coördinator kan importeren."
            : "De import is mislukt. Probeer opnieuw.",
      };
    }
  }

  await supabase.from("import_runs").insert({
    imported_by: gate.user.id,
    file_name: parsed.data.file.name,
    created_count: toCreate.length,
    skipped_count: skippedCount,
  });

  revalidatePath("/");
  revalidatePath("/beheer/import");
  revalidatePath("/kaart");
  return { ok: true, createdCount: toCreate.length, skippedCount, shootCount: shootRows.length };
}

export type AliasActionResult = { ok: true } | { ok: false; message: string };

export async function upsertAresExpertAlias(input: {
  alias: string;
  rentalExpertId: string;
}): Promise<AliasActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = upsertAresExpertAliasSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ares_expert_aliases")
    .upsert({ alias: parsed.data.alias.toLowerCase(), rental_expert_id: parsed.data.rentalExpertId });
  if (error) return { ok: false, message: "Koppelen mislukt. Probeer opnieuw." };

  revalidatePath("/beheer/import");
  return { ok: true };
}

export async function deleteAresExpertAlias(alias: string): Promise<AliasActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = deleteAresExpertAliasSchema.safeParse({ alias });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ares_expert_aliases").delete().eq("alias", parsed.data.alias.toLowerCase());
  if (error) return { ok: false, message: "Verwijderen mislukt. Probeer opnieuw." };

  revalidatePath("/beheer/import");
  return { ok: true };
}
