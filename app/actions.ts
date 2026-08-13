"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { BulkActionState } from "@/app/assignment-bulk-state";
import { boardStatuses, type AssignmentStatus } from "@/lib/assignments";
import { createClient } from "@/lib/supabase/server";
import { bulkActionSchema } from "@/lib/validation";
import { canDeny, canSubmitToQc } from "@/lib/workflow";

export async function updateAssignmentsBulk(
  _previousState: BulkActionState,
  formData: FormData,
): Promise<BulkActionState> {
  const operation = formData.get("operation");
  const parsed = bulkActionSchema.safeParse({
    operation,
    assignmentIds: formData.getAll("assignmentId"),
    editorId: formData.get("editorId"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de invoer",
      submissionId: Date.now(),
    };
  }

  const supabase = await createClient();
  const update =
    parsed.data.operation === "assign"
      ? { editor_id: parsed.data.editorId }
      : { priority: parsed.data.priority };

  const { data, error } = await supabase
    .from("assignments")
    .update(update)
    .in("id", parsed.data.assignmentIds)
    .select("id");

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze opdrachten te wijzigen."
          : "De opdrachten konden niet worden gewijzigd. Controleer je verbinding en probeer opnieuw.",
      submissionId: Date.now(),
    };
  }

  if (data.length !== parsed.data.assignmentIds.length) {
    return {
      status: "error",
      message:
        "Niet alle opdrachten zijn gewijzigd. Controleer of je hiervoor rechten hebt.",
      submissionId: Date.now(),
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    message: `${data.length} ${data.length === 1 ? "opdracht is" : "opdrachten zijn"} gewijzigd.`,
    submissionId: Date.now(),
  };
}

export type StatusChangeResult = { ok: true } | { ok: false; message: string };

const statusChangeSchema = z.object({
  assignmentId: z.string().uuid("Ongeldig opdracht-ID"),
  nextStatus: z.enum(boardStatuses, { error: "Ongeldige status" }),
});

/**
 * Statuswijziging vanaf het bord (slepen) of een sneltoets. Editors mogen
 * alleen naar in_process of qc — RLS staat op tabelniveau meer toe dan de
 * workflow bedoelt (AGENTS.md, Status flow), dus die regel wordt hier
 * gehandhaafd, niet alleen client-side.
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  nextStatus: AssignmentStatus,
): Promise<StatusChangeResult> {
  const parsed = statusChangeSchema.safeParse({ assignmentId, nextStatus });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige aanvraag" };
  }

  const supabase = await createClient();
  const { data: role } = await supabase.rpc("current_app_role");
  const isCoordinator = role === "admin" || role === "coordinator";

  if (!isCoordinator && parsed.data.nextStatus !== "in_process" && parsed.data.nextStatus !== "qc") {
    return {
      ok: false,
      message: "Alleen de coördinator kan een opdracht op deze status zetten.",
    };
  }

  if (parsed.data.nextStatus === "qc") {
    const { count: total } = await supabase
      .from("edit_items")
      .select("id", { count: "exact", head: true })
      .eq("assignment_id", parsed.data.assignmentId);
    const { count: open } = await supabase
      .from("edit_items")
      .select("id", { count: "exact", head: true })
      .eq("assignment_id", parsed.data.assignmentId)
      .eq("done", false);

    const guard = canSubmitToQc({
      totalPhotos: total ?? 0,
      donePhotos: (total ?? 0) - (open ?? 0),
    });
    if (!guard.ok) return { ok: false, message: guard.message };
  }

  if (parsed.data.nextStatus === "denied") {
    // Best-effort: telt bevindingen over alle rondes van deze opdracht. De
    // echte, rondegebonden variant hoort bij de QC-review-flow (WP3); dit is
    // het vangnet zolang "denied" ook los van die flow gezet kan worden.
    const { count: findingCount } = await supabase
      .from("qc_findings")
      .select("id, qc_reviews!inner(assignment_id)", { count: "exact", head: true })
      .eq("qc_reviews.assignment_id", parsed.data.assignmentId);

    const guard = canDeny({ findingCount: findingCount ?? 0 });
    if (!guard.ok) return { ok: false, message: guard.message };
  }

  const { error } = await supabase
    .from("assignments")
    .update({ status: parsed.data.nextStatus })
    .eq("id", parsed.data.assignmentId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze opdracht te wijzigen."
          : "De status kon niet worden gewijzigd. Probeer opnieuw.",
    };
  }

  revalidatePath(`/opdrachten/${parsed.data.assignmentId}`);
  revalidatePath("/");
  return { ok: true };
}

const toggleEditItemSchema = z.object({
  editItemId: z.string().uuid("Ongeldig foto-ID"),
  done: z.boolean(),
});

export async function toggleEditItemDone(
  editItemId: string,
  done: boolean,
): Promise<StatusChangeResult> {
  const parsed = toggleEditItemSchema.safeParse({ editItemId, done });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige aanvraag" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("edit_items")
    .select("assignment_id")
    .eq("id", parsed.data.editItemId)
    .maybeSingle();

  const { error } = await supabase
    .from("edit_items")
    .update({ done: parsed.data.done, done_at: parsed.data.done ? new Date().toISOString() : null })
    .eq("id", parsed.data.editItemId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze foto af te vinken."
          : "Kon de foto niet bijwerken. Probeer opnieuw.",
    };
  }

  if (existing?.assignment_id) revalidatePath(`/opdrachten/${existing.assignment_id}`);
  revalidatePath("/");
  return { ok: true };
}
