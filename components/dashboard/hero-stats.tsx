"use client";

import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { statusLabelsNl } from "@/lib/assignments";
import { cn } from "@/lib/utils";

type StatusRow = { status: string | null; aantal: number | null; pct: number | null };

/**
 * Eén primair getal, de rest ondergeschikt — precies het omgekeerde van het
 * oude Excel-dashboard, waar zes blokken even luid waren (AGENTS.md,
 * Screen 6). Sinds V3-WP4 is de besparing de hero: dat is het antwoord op de
 * begrotingsoverschrijding uit de eigen rapportage van de eigenaar
 * (BUILDPLAN-V3.md §2), en dus het signature-moment van dit scherm. "Open in
 * QC" — de vorige hero — schuift door naar de ondergeschikte rij.
 *
 * De besparing en de kosten-per-bewerking zijn hetzelfde verhaal (dezelfde
 * businesscase, twee kanten van de rekensom) en staan sinds V4-WP5 daarom
 * naast elkaar in één rij, i.p.v. als twee losse blokken onder elkaar met de
 * vier statustegels verdrukt ernaast (BUILDPLAN-V4 §WP5.1).
 */
export function HeroStats({
  statusRows,
  approvalPct,
  avgCycleDays,
  totalPhotosCompleted,
  approvedSavingsCount,
  avoidedShootCostEur,
  costCard,
}: {
  statusRows: StatusRow[];
  approvalPct: number | null;
  avgCycleDays: number | null;
  totalPhotosCompleted: number;
  approvedSavingsCount: number;
  avoidedShootCostEur: number;
  costCard: React.ReactNode;
}) {
  const openInQc = statusRows.find((row) => row.status === "qc")?.aantal ?? 0;
  const totalSavings = approvedSavingsCount * avoidedShootCostEur;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* V5 "Studio" signature-moment (BUILDPLAN-V5 §WP6.1): groen gradient
            i.p.v. een neutrale kaart, geen illustratie — het getal draagt
            het verhaal, geen spaarvarken (DESIGN-V5.md §4). */}
        <div
          className="rounded-lg p-6 text-white shadow-v5-card"
          style={{ background: "linear-gradient(135deg, var(--color-v5-hero-from) 0%, var(--color-v5-hero-to) 100%)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            Vermeden fotografiekosten dit seizoen
          </p>
          <p className="mt-1 font-display text-5xl font-extrabold tabular-nums">
            €{totalSavings.toLocaleString("nl-NL")}
          </p>
          <p className="mt-1 text-sm text-white/80">
            {approvedSavingsCount} vermeden shoots × €{avoidedShootCostEur.toLocaleString("nl-NL")} — alleen
            goedgekeurde AI-winterimpressies op AT-woningen.
          </p>
        </div>

        {costCard}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SubordinateStat label="Open in QC" value={openInQc} />
        <SubordinateStat label="Approval rate" value={approvalPct !== null ? `${approvalPct}%` : "—"} />
        <SubordinateStat
          label="Gem. doorlooptijd"
          value={avgCycleDays !== null ? `${avgCycleDays}d` : "—"}
        />
        <SubordinateStat label="Foto's afgerond" value={totalPhotosCompleted} />
      </div>

      <WorkloadBreakdown rows={statusRows} />
    </div>
  );
}

function SubordinateStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col justify-center gap-1 rounded-md border border-border bg-card px-3 py-4 text-center">
      <p className="font-mono text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

const statusOrder = ["new", "in_process", "qc", "denied", "approved", "ai_rejected"] as const;

const statusDotClass: Record<string, string> = {
  new: "bg-muted-foreground",
  in_process: "bg-info",
  qc: "bg-warning",
  denied: "bg-destructive",
  approved: "bg-success",
  ai_rejected: "bg-muted-foreground",
};

// Zelfde vijf kleuren als statusDotClass, als raw CSS-vars voor Recharts
// (dat leest geen Tailwind-classNamen). success/warning/info staan direct in
// het statische @theme-blok (--color-success etc.); destructive/muted-
// foreground zijn theme-afhankelijk en hebben dus de raw, niet-geprefixte
// naam nodig — zelfde precedent als var(--chart-1) in monthly-volume-chart.
const statusFillVar: Record<string, string> = {
  new: "var(--muted-foreground)",
  in_process: "var(--color-info)",
  qc: "var(--color-warning)",
  denied: "var(--destructive)",
  approved: "var(--color-success)",
  ai_rejected: "var(--muted-foreground)",
};

// approved/ai_rejected zitten standaard achter het archieffilter op het bord
// (assignments-screen.tsx) — de link moet dat filter meteen aanzetten, anders
// klik je door naar een lege lijst (BUILDPLAN-V4 §WP5.3).
const archiveStatuses = new Set(["approved", "ai_rejected"]);

function statusHref(status: string) {
  const params = new URLSearchParams({ status });
  if (archiveStatuses.has(status)) params.set("archive", "1");
  return `/?${params.toString()}`;
}

/**
 * V5 "Studio" (BUILDPLAN-V5 §WP6.2): een donut naast de bestaande klikbare
 * statuslijst — die lijst blijft ongewijzigd en dient nu als de legenda
 * (dataviz-skill: "een legenda is altijd aanwezig bij ≥2 series", hier is
 * de legenda zelf al interactief). Status is een vaste, betekenisvolle set
 * (5 statussen), geen categorische reeks — daarom de semantische
 * status-kleuren, niet het chart-palet.
 */
function WorkloadBreakdown({ rows }: { rows: StatusRow[] }) {
  const byStatus = new Map(rows.map((row) => [row.status, row]));
  const total = statusOrder.reduce((sum, status) => sum + (byStatus.get(status)?.aantal ?? 0), 0);
  const chartData = statusOrder
    .map((status) => ({ status, aantal: byStatus.get(status)?.aantal ?? 0 }))
    .filter((entry) => entry.aantal > 0);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card px-3 py-3 sm:flex-row sm:items-center">
      <div className="relative mx-auto size-28 shrink-0 sm:mx-0">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="aantal"
              innerRadius="70%"
              nameKey="status"
              outerRadius="100%"
              paddingAngle={chartData.length > 1 ? 2 : 0}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell fill={statusFillVar[entry.status]} key={entry.status} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--foreground)",
              }}
              formatter={(value, _name, entry) => [
                `${value} opdrachten`,
                statusLabelsNl[(entry.payload as { status: keyof typeof statusLabelsNl }).status],
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold tabular-nums text-foreground">{total}</span>
          <span className="text-[10px] text-muted-foreground">totaal</span>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap gap-1">
        {statusOrder.map((status) => {
          const row = byStatus.get(status);
          return (
            <Link
              className="flex items-center gap-2 rounded-sm px-2 py-1 text-sm transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
              href={statusHref(status)}
              key={status}
            >
              <span className={cn("size-2 rounded-full", statusDotClass[status])} />
              <span className="text-muted-foreground">{statusLabelsNl[status]}</span>
              <span className="font-mono font-semibold tabular-nums">{row?.aantal ?? 0}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
