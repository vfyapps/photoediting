import { statusLabelsNl } from "@/lib/assignments";
import { cn } from "@/lib/utils";

type StatusRow = { status: string | null; aantal: number | null; pct: number | null };

/**
 * Eén primair getal, de rest ondergeschikt — precies het omgekeerde van het
 * oude Excel-dashboard, waar zes blokken even luid waren (AGENTS.md,
 * Screen 6). "Open in QC" is het getal dat een coördinator dagelijks checkt,
 * dus dat is de hero; approval rate, doorlooptijd en foto's staan er klein
 * naast.
 */
export function HeroStats({
  statusRows,
  approvalPct,
  avgCycleDays,
  totalPhotosCompleted,
}: {
  statusRows: StatusRow[];
  approvalPct: number | null;
  avgCycleDays: number | null;
  totalPhotosCompleted: number;
}) {
  const openInQc = statusRows.find((row) => row.status === "qc")?.aantal ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
      <div className="rounded-md border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Open in QC
        </p>
        <p className="mt-1 font-display text-5xl font-extrabold tabular-nums text-foreground">
          {openInQc}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {openInQc === 0
            ? "Niets wacht op beoordeling."
            : openInQc === 1
              ? "opdracht wacht op beoordeling."
              : "opdrachten wachten op beoordeling."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
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
