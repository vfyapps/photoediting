import { redirect } from "next/navigation";

import { QcQueueScreen } from "@/components/qc/qc-queue-screen";
import type { QcRound } from "@/components/assignment-detail/qc-history";
import { toAssignmentDetail, toEditItem, type EditItem } from "@/lib/assignments";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function QcPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: queueRows } = await supabase
    .from("v_assignments")
    .select("*")
    .eq("status", "qc")
    .order("updated_at", { ascending: true });

  const queue = (queueRows ?? [])
    .map(toAssignmentDetail)
    .filter((assignment) => assignment !== null);

  const ids = queue.map((assignment) => assignment.id);

  const [goalsResult, issueTypesResult, editItemsResult, reviewsResult, findingsResult] =
    await Promise.all([
      supabase.from("editing_goals").select("code, label_nl").order("sort_order"),
      supabase.from("qc_issue_types").select("code, label_nl").eq("is_active", true).order("sort_order"),
      ids.length > 0
        ? supabase.from("edit_items").select("*").in("assignment_id", ids).order("photo_number")
        : Promise.resolve({ data: [] as const }),
      ids.length > 0
        ? supabase
            .from("qc_reviews")
            .select("*")
            .in("assignment_id", ids)
            .order("round", { ascending: false })
        : Promise.resolve({ data: [] as const }),
      ids.length > 0
        ? supabase.from("qc_findings").select("*, qc_reviews!inner(assignment_id)").in("qc_reviews.assignment_id", ids)
        : Promise.resolve({ data: [] as const }),
    ]);

  const goalLabels = new Map((goalsResult.data ?? []).map((goal) => [goal.code, goal.label_nl]));
  const issueLabels = new Map((issueTypesResult.data ?? []).map((row) => [row.code, row.label_nl]));

  const editItemsByAssignment = new Map<string, EditItem[]>();
  (editItemsResult.data ?? []).forEach((row) => {
    const item = toEditItem(row);
    editItemsByAssignment.set(item.assignmentId, [
      ...(editItemsByAssignment.get(item.assignmentId) ?? []),
      item,
    ]);
  });

  const findingsByReview = new Map<
    string,
    { photoNumber: number | null; issueLabel: string; comment: string | null }[]
  >();
  (findingsResult.data ?? []).forEach((finding) => {
    const list = findingsByReview.get(finding.review_id) ?? [];
    list.push({
      photoNumber: finding.photo_number,
      issueLabel: finding.issue_code ? issueLabels.get(finding.issue_code) ?? finding.issue_code : "Overig",
      comment: finding.comment,
    });
    findingsByReview.set(finding.review_id, list);
  });

  const roundsByAssignment = new Map<string, QcRound[]>();
  (reviewsResult.data ?? []).forEach((review) => {
    const list = roundsByAssignment.get(review.assignment_id) ?? [];
    list.push({
      id: review.id,
      round: review.round,
      decision: review.decision,
      summary: review.summary,
      createdAt: review.created_at,
      findings: findingsByReview.get(review.id) ?? [],
    });
    roundsByAssignment.set(review.assignment_id, list);
  });

  return (
    <QcQueueScreen
      editItemsByAssignment={editItemsByAssignment}
      goalLabels={goalLabels}
      issueTypes={issueTypesResult.data ?? []}
      queue={queue}
      roundsByAssignment={roundsByAssignment}
    />
  );
}
