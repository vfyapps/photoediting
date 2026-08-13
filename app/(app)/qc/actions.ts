"use server";

import { revalidatePath } from "next/cache";

import { submitQcReviewSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { canDeny } from "@/lib/workflow";

export type QcActionResult = { ok: true } | { ok: false; message: string };

export type QcFindingInput = {
  photoNumber: number | null;
  issueCode: string;
  comment: string | null;
};

/**
 * Sluit een QC-ronde af: schrijft de bevindingen en zet de opdrachtstatus in
 * één moeite door. Geen bevestigingsdialoog nodig — afkeuren is hier een
 * normale workflow-actie, geen destructieve (AGENTS.md, Screen 4).
 */
export async function submitQcReview(
  assignmentId: string,
  decision: "approved" | "denied",
  findings: QcFindingInput[],
): Promise<QcActionResult> {
  const parsed = submitQcReviewSchema.safeParse({ assignmentId, decision, findings });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  if (parsed.data.decision === "denied") {
    const guard = canDeny({ findingCount: parsed.data.findings.length });
    if (!guard.ok) return { ok: false, message: guard.message };
  }

  const supabase = await createClient();

  const { data: review, error: reviewError } = await supabase
    .from("qc_reviews")
    .insert({ assignment_id: parsed.data.assignmentId, decision: parsed.data.decision })
    .select("id")
    .single();

  if (reviewError || !review) {
    return {
      ok: false,
      message:
        reviewError?.code === "42501"
          ? "Alleen de coördinator kan een QC-ronde afsluiten."
          : "De review kon niet worden opgeslagen. Probeer opnieuw.",
    };
  }

  if (parsed.data.findings.length > 0) {
    const { error: findingsError } = await supabase.from("qc_findings").insert(
      parsed.data.findings.map((finding) => ({
        review_id: review.id,
        photo_number: finding.photoNumber,
        issue_code: finding.issueCode,
        comment: finding.comment,
      })),
    );
    if (findingsError) {
      return { ok: false, message: "De bevindingen konden niet worden opgeslagen. Probeer opnieuw." };
    }
  }

  const { error: statusError } = await supabase
    .from("assignments")
    .update({ status: parsed.data.decision })
    .eq("id", parsed.data.assignmentId);

  if (statusError) {
    return {
      ok: false,
      message: "De review is opgeslagen, maar de status kon niet worden bijgewerkt. Ververs de pagina.",
    };
  }

  revalidatePath("/qc");
  revalidatePath(`/opdrachten/${parsed.data.assignmentId}`);
  revalidatePath("/");
  return { ok: true };
}
