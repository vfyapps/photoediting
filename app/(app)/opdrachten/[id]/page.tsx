import { notFound } from "next/navigation";

import { AssignmentDetailScreen } from "@/components/assignment-detail/assignment-detail-screen";
import {
  toAssignmentDetail,
  toEditItem,
  type EditItem,
} from "@/lib/assignments";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser();

  const [
    assignmentResult,
    editItemsResult,
    goalsResult,
    settingsResult,
    reviewsResult,
    findingsResult,
    issueTypesResult,
  ] = await Promise.all([
    supabase.from("v_assignments").select("*").eq("id", id).maybeSingle(),
    supabase.from("edit_items").select("*").eq("assignment_id", id).order("photo_number"),
    supabase.from("editing_goals").select("code, label_nl, sort_order").eq("is_active", true).order("sort_order"),
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["magnific_base_url", "max_photos_per_property"]),
    supabase.from("qc_reviews").select("*").eq("assignment_id", id).order("round", { ascending: false }),
    supabase.from("qc_findings").select("*, qc_reviews!inner(assignment_id)").eq("qc_reviews.assignment_id", id),
    supabase.from("qc_issue_types").select("code, label_nl"),
  ]);

  if (!assignmentResult.data) notFound();

  const assignment = toAssignmentDetail(assignmentResult.data);
  if (!assignment) notFound();

  const editItems: EditItem[] = (editItemsResult.data ?? []).map(toEditItem);
  const settings = new Map((settingsResult.data ?? []).map((row) => [row.key, row.value ?? ""]));
  const maxPhotos = Number.parseInt(settings.get("max_photos_per_property") ?? "", 10) || 5;
  const magnificBaseUrl = settings.get("magnific_base_url") || null;

  const issueLabels = new Map((issueTypesResult.data ?? []).map((row) => [row.code, row.label_nl]));
  const findingsByReview = new Map<string, { photoNumber: number | null; issueLabel: string; comment: string | null }[]>();
  (findingsResult.data ?? []).forEach((finding) => {
    const list = findingsByReview.get(finding.review_id) ?? [];
    list.push({
      photoNumber: finding.photo_number,
      issueLabel: finding.issue_code ? issueLabels.get(finding.issue_code) ?? finding.issue_code : "Overig",
      comment: finding.comment,
    });
    findingsByReview.set(finding.review_id, list);
  });
  const rounds = (reviewsResult.data ?? []).map((review) => ({
    id: review.id,
    round: review.round,
    decision: review.decision,
    summary: review.summary,
    createdAt: review.created_at,
    findings: findingsByReview.get(review.id) ?? [],
  }));

  // Contextuele academy-modules: gepubliceerd, en gekoppeld aan één van de
  // goals op deze opdracht, of een algemene module zonder specifieke goal.
  // Twee losse queries i.p.v. een handgebouwde .or()-string, zodat er geen
  // PostgREST-filtersyntax met goal-codes samengeplakt hoeft te worden.
  const baseGuidelineQuery = () =>
    supabase
      .from("guidelines")
      .select("id, slug, title, goal_code, sort_order")
      .eq("is_published", true)
      .eq("track", "goal");

  const [goalGuidelinesResult, generalGuidelinesResult, promptsResult] = await Promise.all([
    assignment.goals.length > 0
      ? baseGuidelineQuery().in("goal_code", assignment.goals).order("sort_order")
      : Promise.resolve({ data: [], error: null }),
    baseGuidelineQuery().is("goal_code", null).order("sort_order"),
    assignment.goals.length > 0
      ? supabase.from("academy_prompts").select("*").in("goal_code", assignment.goals).order("sort_order")
      : Promise.resolve({ data: [], error: null }),
  ]);
  const guidelinesResult = {
    data: [...(goalGuidelinesResult.data ?? []), ...(generalGuidelinesResult.data ?? [])],
  };

  return (
    <AssignmentDetailScreen
      assignment={assignment}
      canManageStatus={user?.role === "admin" || user?.role === "coordinator"}
      editItems={editItems}
      goals={goalsResult.data ?? []}
      guidelines={guidelinesResult.data ?? []}
      magnificBaseUrl={magnificBaseUrl}
      maxPhotosPerProperty={maxPhotos}
      prompts={promptsResult.data ?? []}
      qcRounds={rounds}
    />
  );
}
