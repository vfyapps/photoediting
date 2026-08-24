import { AcademyIndexScreen } from "@/components/academy/academy-index-screen";
import { toGuidelineSummary } from "@/lib/academy";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // RLS (read_pub_guidelines) filtert al: een editor/viewer ziet alleen
  // gepubliceerde modules, coordinator/admin ziet ook concepten. Geen
  // aparte rolcheck nodig voor de lijst zelf.
  const [
    guidelinesResult,
    editorPerformanceResult,
    teamAverageResult,
    readsResult,
    issueFrequencyResult,
    issueGuidelinesResult,
  ] = await Promise.all([
    supabase.from("guidelines").select("*"),
    user
      ? supabase.from("v_editor_performance").select("*").maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("v_team_average").select("*").maybeSingle(),
    user
      ? supabase.from("academy_reads").select("guideline_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as const }),
    // V5 "Studio" (BUILDPLAN-V5 §WP7.3): echte QC-cijfers i.p.v. een verzonnen
    // lijstje zoals in de mockup — dezelfde leercirkel-bron als de
    // attentiestrook op het bord (app/(app)/page.tsx).
    supabase.from("v_qc_issue_frequency").select("code, label_nl, aantal"),
    supabase.from("guidelines").select("slug, qc_issue_code").not("qc_issue_code", "is", null),
  ]);

  const guidelines = (guidelinesResult.data ?? []).map(toGuidelineSummary);
  const readIds = new Set((readsResult.data ?? []).map((row) => row.guideline_id));

  const moduleSlugByIssueCode = new Map(
    (issueGuidelinesResult.data ?? [])
      .filter((row): row is { slug: string; qc_issue_code: string } => Boolean(row.qc_issue_code))
      .map((row) => [row.qc_issue_code, row.slug]),
  );
  const topIssues = (issueFrequencyResult.data ?? [])
    .filter((row): row is { code: string; label_nl: string; aantal: number } => Boolean(row.code && row.label_nl))
    .sort((left, right) => right.aantal - left.aantal)
    .slice(0, 5)
    .map((row) => ({
      code: row.code,
      label: row.label_nl,
      count: row.aantal,
      moduleSlug: moduleSlugByIssueCode.get(row.code) ?? null,
    }));

  return (
    <AcademyIndexScreen
      canEdit={user?.role === "admin" || user?.role === "coordinator"}
      editorStats={editorPerformanceResult.data}
      guidelines={guidelines}
      isEditor={user?.role === "editor"}
      readCount={readIds.size}
      readIds={readIds}
      teamAverage={teamAverageResult.data}
      topIssues={topIssues}
    />
  );
}
