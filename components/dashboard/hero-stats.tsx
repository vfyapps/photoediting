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
 */
export function HeroStats({
  statusRows,
  approvalPct,
  avgCycleDays,
  totalPhotosCompleted,
  approvedSavingsCount,
  avoidedShootCostEur,
}: {
  statusRows: StatusRow[];
  approvalPct: number | null;
  avgCycleDays: number | null;
  totalPhotosCompleted: number;
  approvedSavingsCount: number;
  avoidedShootCostEur: number;
}) {
  const openInQc = statusRows.find((row) => row.status === "qc")?.aantal ?? 0;
  const totalSavings = approvedSavingsCount * avoidedShootCostEur;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SubordinateStat label="Open in QC" value={openInQc} />
        <SubordinateStat label="Approval rate" value={approvalPct !== null ? `${approvalPct}%` : "—"} />
        <SubordinateStat
          label="Gem. doorlooptijd"
          value={avgCycleDays !== null ? `${avgCycleDays}d` : "—"}
        />
        <SubordinateStat label="Foto's afgerond" value={totalPhotosCompleted} />
      </div>

      <div className="lg:col-span-2">
        <StatusBreakdown rows={statusRows} />
      </div>
    </div>
  );
}

function SubordinateStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-3 text-center">
      <p className="font-mono text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
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

function StatusBreakdown({ rows }: { rows: StatusRow[] }) {
  const byStatus = new Map(rows.map((row) => [row.status, row]));

  return (
    <div className="flex flex-wrap gap-4 rounded-md border border-border bg-card px-4 py-3">
      {statusOrder.map((status) => {
        const row = byStatus.get(status);
        return (
          <div className="flex items-center gap-2 text-sm" key={status}>
            <span className={cn("size-2 rounded-full", statusDotClass[status])} />
            <span className="text-muted-foreground">{statusLabelsNl[status]}</span>
            <span className="font-mono font-semibold tabular-nums">{row?.aantal ?? 0}</span>
          </div>
        );
      })}
    </div>
  );
}
