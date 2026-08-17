import Link from "next/link";

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
        <div className="rounded-md border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Vermeden fotografiekosten dit seizoen
          </p>
          <p className="mt-1 font-display text-5xl font-extrabold tabular-nums text-foreground">
            €{totalSavings.toLocaleString("nl-NL")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
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

      <StatusBreakdown rows={statusRows} />
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

// approved/ai_rejected zitten standaard achter het archieffilter op het bord
// (assignments-screen.tsx) — de link moet dat filter meteen aanzetten, anders
// klik je door naar een lege lijst (BUILDPLAN-V4 §WP5.3).
const archiveStatuses = new Set(["approved", "ai_rejected"]);

function statusHref(status: string) {
  const params = new URLSearchParams({ status });
  if (archiveStatuses.has(status)) params.set("archive", "1");
  return `/?${params.toString()}`;
}

function StatusBreakdown({ rows }: { rows: StatusRow[] }) {
  const byStatus = new Map(rows.map((row) => [row.status, row]));

  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-border bg-card px-3 py-2">
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
  );
}
