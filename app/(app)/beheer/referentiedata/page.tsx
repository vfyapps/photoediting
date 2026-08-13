import { ReferenceDataScreen } from "@/components/beheer/reference-data-screen";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BeheerReferentiedataPage() {
  const supabase = await createClient();
  const [{ data: goals }, { data: issueTypes }] = await Promise.all([
    supabase.from("editing_goals").select("*").order("sort_order"),
    supabase.from("qc_issue_types").select("*").order("sort_order"),
  ]);

  return <ReferenceDataScreen goals={goals ?? []} issueTypes={issueTypes ?? []} />;
}
