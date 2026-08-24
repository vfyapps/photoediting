import { redirect } from "next/navigation";

import { CostPerEditCard } from "@/components/dashboard/cost-per-edit-card";
import { EditorPerformanceTable } from "@/components/dashboard/editor-performance-table";
import { ExportLink } from "@/components/dashboard/export-link";
import { GoalUsageChart } from "@/components/dashboard/goal-usage-chart";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { MonthlyVolumeChart } from "@/components/dashboard/monthly-volume-chart";
import { RecentActivity, type ActivityRow } from "@/components/dashboard/recent-activity";
import { TopIssuesChart } from "@/components/dashboard/top-issues-chart";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    redirect("/");
  }

  const supabase = await createClient();
  const [
    statusResult,
    editorResult,
    goalResult,
    volumeResult,
    completedResult,
    issuesResult,
    teamAverageResult,
    savingsResult,
    settingsResult,
  ] = await Promise.all([
    supabase.from("v_dashboard_status").select("*"),
    supabase.from("v_editor_performance").select("*").order("editor"),
    supabase.from("v_goal_usage").select("*"),
    supabase.from("v_monthly_volume").select("*"),
    supabase.from("v_monthly_completed").select("*"),
    supabase.from("v_qc_issue_frequency").select("*"),
    // v_cycle_time meet doorlooptijd via lead() over status_events-overgangen:
    // voor een eindstatus als "approved" bestaat vrijwel nooit een vólgende
    // overgang, dus die rij valt structureel weg (BUILDPLAN-V4 §WP5.4 — de
    // tegel toonde daardoor altijd "—", ook met 130 goedgekeurde opdrachten).
    // v_team_average.gem_doorlooptijd_dagen middelt wél gewoon
    // date_completed - request_date en is de juiste bron voor dit getal.
    supabase.from("v_team_average").select("gem_doorlooptijd_dagen").maybeSingle(),
    supabase.from("v_savings").select("*").maybeSingle(),
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["avoided_shoot_cost_eur", "monthly_editing_cost_eur"]),
  ]);

  // V5 "Studio" (BUILDPLAN-V5 §WP6.4): laatste 8 statuswijzigingen team-breed
  // — zelfde bron als de tijdlijn op het opdrachtdetail (V5-WP4).
  const { data: activityRows } = await supabase
    .from("status_events")
    .select("id, assignment_id, to_status, created_at, assignment:assignments(acco_id), actor:app_users(full_name)")
    .order("created_at", { ascending: false })
    .limit(8);
  const activity: ActivityRow[] = (activityRows ?? []).flatMap((row) => {
    const accoId = (row.assignment as { acco_id: string } | null)?.acco_id;
    if (!accoId) return [];
    return [
      {
        id: row.id,
        assignmentId: row.assignment_id,
        accoId,
        toStatus: row.to_status,
        actorName: (row.actor as { full_name: string } | null)?.full_name ?? null,
        createdAt: row.created_at,
      },
    ];
  });

  const statusRows = statusResult.data ?? [];
  const approvedRow = statusRows.find((row) => row.status === "approved");
  const deniedRow = statusRows.find((row) => row.status === "denied");
  const decided = (approvedRow?.aantal ?? 0) + (deniedRow?.aantal ?? 0);
  const approvalPct = decided > 0 ? Math.round(((approvedRow?.aantal ?? 0) / decided) * 1000) / 10 : null;
  const totalPhotosCompleted = (completedResult.data ?? []).reduce(
    (sum, row) => sum + (row.afgerond_fotos ?? 0),
    0,
  );

  const settingsByKey = new Map((settingsResult.data ?? []).map((s) => [s.key, s.value]));
  const avoidedShootCostEur = Number.parseFloat(settingsByKey.get("avoided_shoot_cost_eur") ?? "") || 137;
  const monthlyEditingCostEur = Number.parseFloat(settingsByKey.get("monthly_editing_cost_eur") ?? "") || 215.55;

  const completedMonths = [...(completedResult.data ?? [])].sort(
    (a, b) => new Date(b.maand ?? 0).getTime() - new Date(a.maand ?? 0).getTime(),
  );
  const completedThisMonth = completedMonths[0]?.afgerond_woningen ?? 0;
  const completedLastMonth = completedMonths[1]?.afgerond_woningen ?? null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        description="Alleen gelezen uit de views — dezelfde cijfers als los gedraaid in de SQL editor."
        eyebrow="Overzicht"
        title="Dashboard"
      />

      <HeroStats
        approvalPct={approvalPct}
        approvedSavingsCount={savingsResult.data?.approved_summer_to_winter ?? 0}
        avgCycleDays={teamAverageResult.data?.gem_doorlooptijd_dagen ?? null}
        avoidedShootCostEur={avoidedShootCostEur}
        costCard={
          <CostPerEditCard
            avoidedShootCostEur={avoidedShootCostEur}
            completedLastMonth={completedLastMonth}
            completedThisMonth={completedThisMonth}
            monthlyEditingCostEur={monthlyEditingCostEur}
          />
        }
        statusRows={statusRows}
        totalPhotosCompleted={totalPhotosCompleted}
      />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Top QC-issues</h2>
          <ExportLink label="QC-issues" view="issues" />
        </div>
        <TopIssuesChart rows={issuesResult.data ?? []} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Gebruik per editing goal</h2>
            <ExportLink label="Goal-gebruik" view="goals" />
          </div>
          <GoalUsageChart rows={goalResult.data ?? []} />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Maandvolume</h2>
            <div className="flex gap-2">
              <ExportLink label="Aangevraagd" view="volume" />
              <ExportLink label="Afgerond" view="completed" />
            </div>
          </div>
          <MonthlyVolumeChart completed={completedResult.data ?? []} volume={volumeResult.data ?? []} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Performance per editor</h2>
            <ExportLink label="Editors" view="editors" />
          </div>
          <EditorPerformanceTable rows={editorResult.data ?? []} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Recente activiteit</h2>
          <RecentActivity rows={activity} />
        </section>
      </div>
    </div>
  );
}
