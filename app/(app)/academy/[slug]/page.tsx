import { notFound } from "next/navigation";

import { ModuleScreen } from "@/components/academy/module-screen";
import { toGuidelineDetail } from "@/lib/academy";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AcademyModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser();

  // RLS (read_pub_guidelines) laat een niet-coordinator alleen gepubliceerde
  // modules zien; een concept-slug rechtstreeks bezocht geeft dus gewoon
  // geen rij terug voor een editor, en dat wordt hieronder een 404.
  const { data: guidelineRow } = await supabase.from("guidelines").select("*").eq("slug", slug).maybeSingle();
  if (!guidelineRow) notFound();

  const guideline = toGuidelineDetail(guidelineRow);

  const [examplesResult, promptsResult, readResult, goalLabelResult] = await Promise.all([
    supabase.from("guideline_examples").select("*").eq("guideline_id", guideline.id).order("sort_order"),
    guideline.goalCode
      ? supabase.from("academy_prompts").select("*").eq("goal_code", guideline.goalCode).order("sort_order")
      : Promise.resolve({ data: [] as { id: string; title: string; prompt_text: string; goal_code: string | null }[] }),
    user
      ? supabase
          .from("academy_reads")
          .select("read_at")
          .eq("guideline_id", guideline.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    guideline.goalCode
      ? supabase.from("editing_goals").select("label_nl").eq("code", guideline.goalCode).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const examples = (examplesResult.data ?? []).map((row) => ({
    id: row.id,
    isGood: row.is_good,
    caption: row.caption,
    url: supabase.storage.from("guidelines").getPublicUrl(row.storage_path).data.publicUrl,
  }));

  return (
    <ModuleScreen
      canEdit={user?.role === "admin" || user?.role === "coordinator"}
      examples={examples}
      goalLabel={goalLabelResult.data?.label_nl ?? null}
      guideline={guideline}
      isRead={Boolean(readResult.data)}
      prompts={promptsResult.data ?? []}
    />
  );
}
