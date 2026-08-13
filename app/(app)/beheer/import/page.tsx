import { ImportScreen } from "@/components/beheer/import-screen";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BeheerImportPage() {
  const supabase = await createClient();
  const [{ data: aliases }, { data: experts }, { data: recentRuns }, { data: costSetting }] = await Promise.all([
    supabase.from("ares_expert_aliases").select("alias, rental_expert_id, rental_experts(name)").order("alias"),
    supabase.from("rental_experts").select("id, name").eq("is_active", true).order("name"),
    supabase.from("import_runs").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("app_settings").select("value").eq("key", "avoided_shoot_cost_eur").maybeSingle(),
  ]);

  const avoidedShootCostEur = Number.parseFloat(costSetting?.value ?? "") || 137;

  return (
    <ImportScreen
      aliases={(aliases ?? []).map((a) => ({
        alias: a.alias,
        rentalExpertId: a.rental_expert_id,
        rentalExpertName: (a.rental_experts as { name: string } | null)?.name ?? "—",
      }))}
      avoidedShootCostEur={avoidedShootCostEur}
      experts={experts ?? []}
      recentRuns={recentRuns ?? []}
    />
  );
}
