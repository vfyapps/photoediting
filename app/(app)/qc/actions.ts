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

    await suggestGuidelinesForFrequentIssues(
      supabase,
      [...new Set(parsed.data.findings.map((finding) => finding.issueCode))],
    );
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

/**
 * "Wanneer een issue de drempel kruist en geen gepubliceerde module het
 * qc_issue_code draagt, maakt de app een concept aan" (AGENTS.md, Academy).
 * Draait mee op het moment dat de drempel het meest waarschijnlijk wordt
 * gekruist: net na een nieuwe bevinding. Nooit publiceren, nooit een tweede
 * concept voor hetzelfde issue aanmaken — dat schrijft de coördinator zelf.
 * Best-effort: een mislukte suggestie mag de QC-afronding niet blokkeren.
 */
async function suggestGuidelinesForFrequentIssues(
  supabase: Awaited<ReturnType<typeof createClient>>,
  issueCodes: string[],
) {
  try {
    const [{ data: threshold }, { data: frequency }, { data: existing }] = await Promise.all([
      supabase.from("app_settings").select("value").eq("key", "qc_issue_callout_threshold").maybeSingle(),
      supabase.from("v_qc_issue_frequency").select("code, label_nl, aantal").in("code", issueCodes),
      supabase.from("guidelines").select("qc_issue_code, is_published").in("qc_issue_code", issueCodes),
    ]);

    const minCount = Number.parseInt(threshold?.value ?? "", 10) || 3;
    const existingByCode = new Map(existing?.map((row) => [row.qc_issue_code, row]) ?? []);

    for (const issue of frequency ?? []) {
      if (!issue.code || !issue.label_nl) continue;
      if ((issue.aantal ?? 0) < minCount) continue;
      if (existingByCode.has(issue.code)) continue; // al een concept of gepubliceerde module

      const { data: affectedFindings } = await supabase
        .from("qc_findings")
        .select("qc_reviews!inner(assignment_id)")
        .eq("issue_code", issue.code)
        .limit(10);
      const assignmentIds = [
        ...new Set(
          (affectedFindings ?? [])
            .map((row) => row.qc_reviews?.assignment_id)
            .filter((id): id is string => Boolean(id)),
        ),
      ];
      const { data: affectedAssignments } =
        assignmentIds.length > 0
          ? await supabase.from("assignments").select("acco_id").in("id", assignmentIds)
          : { data: [] as { acco_id: string }[] };
      const accoIds = (affectedAssignments ?? []).map((row) => row.acco_id);

      await supabase.from("guidelines").insert({
        slug: `concept-${issue.code}-${Date.now()}`,
        title: `Concept: ${issue.label_nl}`,
        track: "tips",
        origin: "qc_suggested",
        is_published: false,
        qc_issue_code: issue.code,
        body_md:
          `Automatisch voorgesteld: **${issue.label_nl}** komt inmiddels in ${issue.aantal} QC-bevindingen voor.\n\n` +
          "Schrijf hier de les en publiceer als hij klaar is.\n\n" +
          (accoIds.length > 0
            ? `Gevonden bij onder meer: ${accoIds.map((id) => `\`${id}\``).join(", ")}`
            : ""),
      });
    }
  } catch {
    // Best-effort: de QC-ronde is al opgeslagen, dit mag geen foutmelding geven.
  }
}
