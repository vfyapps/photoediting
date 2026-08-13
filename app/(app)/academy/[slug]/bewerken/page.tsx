import { notFound, redirect } from "next/navigation";

import { GuidelineEditor } from "@/components/academy/guideline-editor";
import { PageHeader } from "@/components/ui/page-header";
import { toGuidelineDetail } from "@/lib/academy";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditGuidelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    redirect(`/academy/${slug}`);
  }

  const supabase = await createClient();
  const [{ data: guidelineRow }, { data: goals }] = await Promise.all([
    supabase.from("guidelines").select("*").eq("slug", slug).maybeSingle(),
    supabase.from("editing_goals").select("code, label_nl").eq("is_active", true).order("sort_order"),
  ]);

  if (!guidelineRow) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader description="Platte markdown, geen block-editor." eyebrow="Academy" title="Module bewerken" />
      <GuidelineEditor goals={goals ?? []} guideline={toGuidelineDetail(guidelineRow)} />
    </div>
  );
}
