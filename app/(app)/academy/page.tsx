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
  const [guidelinesResult, editorPerformanceResult, teamAverageResult, readsResult] =
    await Promise.all([
      supabase.from("guidelines").select("*"),
      user
        ? supabase.from("v_editor_performance").select("*").maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("v_team_average").select("*").maybeSingle(),
      user
        ? supabase.from("academy_reads").select("guideline_id").eq("user_id", user.id)
        : Promise.resolve({ data: [] as const }),
    ]);

  const guidelines = (guidelinesResult.data ?? []).map(toGuidelineSummary);
  const readIds = new Set((readsResult.data ?? []).map((row) => row.guideline_id));

  return (
    <AcademyIndexScreen
      canEdit={user?.role === "admin" || user?.role === "coordinator"}
      editorStats={editorPerformanceResult.data}
      guidelines={guidelines}
      isEditor={user?.role === "editor"}
      readCount={readIds.size}
      readIds={readIds}
      teamAverage={teamAverageResult.data}
    />
  );
}
