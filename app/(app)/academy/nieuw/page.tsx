import { redirect } from "next/navigation";

import { GuidelineEditor } from "@/components/academy/guideline-editor";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewGuidelinePage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    redirect("/academy");
  }

  const supabase = await createClient();
  const { data: goals } = await supabase
    .from("editing_goals")
    .select("code, label_nl")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader description="Platte markdown, geen block-editor." eyebrow="Academy" title="Nieuwe module" />
      <GuidelineEditor goals={goals ?? []} guideline={null} />
    </div>
  );
}
