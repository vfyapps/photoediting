"use server";

import { revalidatePath } from "next/cache";

import { buildAresImportCandidates, parseAresWorkbook, type ImportCandidate } from "@/lib/ares-import";
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

export type PreviewResult =
  | {
      ok: true;
      candidates: ImportCandidate[];
      ignoredNonAt: number;
      ignoredNotQualifying: number;
    }
  | { ok: false; message: string };

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
  const [{ data: existing }, { data: aliases }] = await Promise.all([
    supabase.from("assignments").select("acco_id"),
    supabase.from("ares_expert_aliases").select("alias"),
  ]);

  const funnel = buildAresImportCandidates({
    rows: parseResult.rows,
    existingAccoIds: new Set((existing ?? []).map((r) => r.acco_id)),
    knownAliases: new Set((aliases ?? []).map((r) => r.alias.toLowerCase())),
  });

  return { ok: true, ...funnel };
}

export type CommitResult =
  | { ok: true; createdCount: number; skippedCount: number }
  | { ok: false; message: string };

/**
 * Stap 2: de gebruiker heeft de preview gezien en een selectie bevestigd.
 * Herhaalt de "al in de app"-check op het moment van committen (niet het
 * moment van preview) om een race met een import van iemand anders af te
 * vangen, en maakt alles in één transactie-achtige reeks server-side calls
 * aan via Zod-gevalideerde invoer.
 */
export async function commitAresImport(input: {
  fileName: string;
  candidates: {
    rowKey: string;
    accoId: string;
    priority: "low" | "medium" | "high";
    expertAlias: string;
    requestDate: string | null;
  }[];
}): Promise<CommitResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = commitAresImportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const [{ data: existing }, { data: aliases }] = await Promise.all([
    supabase.from("assignments").select("acco_id"),
    supabase.from("ares_expert_aliases").select("alias, rental_expert_id"),
  ]);

  const existingAccoIds = new Set((existing ?? []).map((r) => r.acco_id));
  const aliasToExpertId = new Map((aliases ?? []).map((r) => [r.alias.toLowerCase(), r.rental_expert_id]));

  const toCreate = parsed.data.candidates.filter((c) => !existingAccoIds.has(c.accoId));
  const skippedCount = parsed.data.candidates.length - toCreate.length;

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
    file_name: parsed.data.fileName,
    created_count: toCreate.length,
    skipped_count: skippedCount,
  });

  revalidatePath("/");
  revalidatePath("/beheer/import");
  return { ok: true, createdCount: toCreate.length, skippedCount };
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
