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

  const { data: exampleRows } = await supabase
    .from("guideline_examples")
    .select("*")
    .eq("guideline_id", guidelineRow.id)
    .order("sort_order");

  // Zelfde reden als de modulepagina: de bucket is private, dus tijdelijke
  // signed URLs in plaats van een permanente publieke link.
  const rows = exampleRows ?? [];
  const signedUrls = rows.length
    ? await supabase.storage
        .from("guidelines")
        .createSignedUrls(
          rows.map((row) => row.storage_path),
          3600,
        )
    : { data: null };
  const urlByPath = new Map(
    (signedUrls.data ?? [])
      .filter((entry): entry is typeof entry & { signedUrl: string } => Boolean(entry.signedUrl))
      .map((entry) => [entry.path, entry.signedUrl]),
  );
  const examples = rows
    .filter((row) => urlByPath.has(row.storage_path))
    .map((row) => ({
      id: row.id,
      url: urlByPath.get(row.storage_path)!,
      caption: row.caption,
      isGood: row.is_good,
    }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader description="Platte markdown, geen block-editor." eyebrow="Academy" title="Module bewerken" />
      <GuidelineEditor examples={examples} goals={goals ?? []} guideline={toGuidelineDetail(guidelineRow)} />
    </div>
  );
}
