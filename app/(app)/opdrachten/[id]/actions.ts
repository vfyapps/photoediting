"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import {
  addEditItemsSchema,
  cancelAssignmentSchema,
  deleteAssignmentSchema,
  deleteEditItemSchema,
  updateAssignmentDetailsSchema,
  updateMagnificUrlSchema,
} from "@/lib/validation";

export type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * "12, 15, 18" wordt op het scherm al naar een getallenlijst geparsed
 * (lib/assignments.ts, parsePhotoNumbers) — deze action krijgt dus al een
 * schone array en hoeft alleen te schrijven. on conflict do nothing, want de
 * unieke sleutel (assignment_id, goal_code, photo_number) staat al in het
 * schema; een dubbel ingevoerd nummer is geen fout, gewoon een no-op.
 */
export async function addEditItems(
  assignmentId: string,
  goalCode: string,
  photoNumbers: number[],
): Promise<ActionResult> {
  const parsed = addEditItemsSchema.safeParse({ assignmentId, goalCode, photoNumbers });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("edit_items").upsert(
    parsed.data.photoNumbers.map((photo_number) => ({
      assignment_id: parsed.data.assignmentId,
      goal_code: parsed.data.goalCode,
      photo_number,
    })),
    { onConflict: "assignment_id,goal_code,photo_number", ignoreDuplicates: true },
  );

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om foto's aan deze opdracht toe te voegen."
          : "De foto's konden niet worden toegevoegd. Probeer opnieuw.",
    };
  }

  revalidatePath(`/opdrachten/${parsed.data.assignmentId}`);
  revalidatePath("/");
  return { ok: true };
}

/**
 * Vraagt eerst het assignment_id van het edit_item op, zodat we na het
 * verwijderen precies dát detailscherm (en de lijst) kunnen revalideren.
 */
export async function deleteEditItem(editItemId: string): Promise<ActionResult> {
  const parsed = deleteEditItemSchema.safeParse({ editItemId });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("edit_items")
    .select("assignment_id")
    .eq("id", parsed.data.editItemId)
    .maybeSingle();

  const { error } = await supabase.from("edit_items").delete().eq("id", parsed.data.editItemId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze foto te verwijderen."
          : "De foto kon niet worden verwijderd. Probeer opnieuw.",
    };
  }

  if (existing?.assignment_id) revalidatePath(`/opdrachten/${existing.assignment_id}`);
  revalidatePath("/");
  return { ok: true };
}

export async function updateMagnificUrl(
  assignmentId: string,
  magnificUrl: string,
): Promise<ActionResult> {
  const parsed = updateMagnificUrlSchema.safeParse({ assignmentId, magnificUrl });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige URL" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .update({ magnific_url: parsed.data.magnificUrl || null })
    .eq("id", parsed.data.assignmentId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze opdracht te wijzigen."
          : "De Magnific-link kon niet worden opgeslagen. Probeer opnieuw.",
    };
  }

  revalidatePath(`/opdrachten/${parsed.data.assignmentId}`);
  return { ok: true };
}

async function requireCoordinator() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    return { ok: false as const, message: "Alleen de coördinator kan een opdracht bewerken." };
  }
  return { ok: true as const, user };
}

/**
 * Het "Bewerken"-paneel (BUILDPLAN-V3.md V3-WP5): de velden die bij een
 * verkeerd geimporteerde of handmatig aangemaakte opdracht correctie nodig
 * kunnen hebben. Statuswijzigingen lopen bewust niet via deze action - die
 * blijven bij updateAssignmentStatus (app/actions.ts) zodat de guards
 * (canSubmitToQc, canDeny) niet omzeild kunnen worden.
 */
export async function updateAssignmentDetails(input: {
  assignmentId: string;
  accoId: string;
  rentalExpertId: string | null;
  editorId: string | null;
  priority: "low" | "medium" | "high";
  requestDate: string | null;
  briefing: string | null;
}): Promise<ActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = updateAssignmentDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .update({
      acco_id: parsed.data.accoId,
      rental_expert_id: parsed.data.rentalExpertId,
      editor_id: parsed.data.editorId,
      priority: parsed.data.priority,
      request_date: parsed.data.requestDate,
      briefing: parsed.data.briefing,
    })
    .eq("id", parsed.data.assignmentId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze opdracht te wijzigen."
          : "De opdracht kon niet worden opgeslagen. Probeer opnieuw.",
    };
  }

  revalidatePath(`/opdrachten/${parsed.data.assignmentId}`);
  revalidatePath("/");
  return { ok: true };
}

/**
 * Direct annuleren buiten de QC-flow om (bv. dubbel geimporteerd, verkeerde
 * woning). Andere route dan een QC-afkeuring: geen qc_findings, wel een
 * verplichte vrije-tekst-reden zodat er nooit een stille ai_rejected ontstaat.
 */
export async function cancelAssignment(input: { assignmentId: string; reason: string }): Promise<ActionResult> {
  const gate = await requireCoordinator();
  if (!gate.ok) return gate;

  const parsed = cancelAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .update({ status: "ai_rejected", cancel_reason: parsed.data.reason })
    .eq("id", parsed.data.assignmentId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze opdracht te annuleren."
          : "Annuleren is mislukt. Probeer opnieuw.",
    };
  }

  revalidatePath(`/opdrachten/${parsed.data.assignmentId}`);
  revalidatePath("/");
  return { ok: true };
}

/**
 * De enige destructieve actie in de app (BUILDPLAN-V3.md V3-WP5) - alleen
 * admin, ook al staat RLS coordinator hier al toe: de extra rolcheck hier is
 * de echte grens voor dit specifieke onderscheid. De acco-id moet exact
 * overgetypt zijn (ook server-side gecontroleerd, niet alleen in de dialoog).
 */
export async function deleteAssignment(input: {
  assignmentId: string;
  accoId: string;
  confirmAccoId: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { ok: false, message: "Alleen een admin kan een opdracht verwijderen." };
  }

  const parsed = deleteAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("assignments").delete().eq("id", parsed.data.assignmentId);

  if (error) {
    return {
      ok: false,
      message: error.code === "42501" ? "Alleen een admin kan een opdracht verwijderen." : "Verwijderen mislukt. Probeer opnieuw.",
    };
  }

  revalidatePath("/");
  return { ok: true };
}
