type EditorStatsRow = {
  approval_pct: number | null;
  gem_doorlooptijd_dagen: number | null;
  toegewezen: number | null;
} | null;

type TeamAverageRow = {
  editors: number | null;
  approval_pct: number | null;
  gem_doorlooptijd_dagen: number | null;
} | null;

/**
 * Alleen eigen cijfers, optioneel het teamgemiddelde ernaast — nooit een
 * naam, positie of ranglijst (AGENTS.md, Academy: "Progress, and what it
 * deliberately does not do"). Het teamgemiddelde verbergt zichzelf onder de
 * 3 editors, anders is "gemiddelde" in de praktijk gewoon iemands naam.
 */
export function EditorProgressCard({
  readCount,
  stats,
  teamAverage,
}: {
  readCount: number;
  stats: EditorStatsRow;
  teamAverage: TeamAverageRow;
}) {
  const showTeamAverage = (teamAverage?.editors ?? 0) >= 3;

  return (
    <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-4">
      <Stat label="Modules gelezen" value={readCount} />
      <Stat
        label="Eigen approval rate"
        value={stats?.approval_pct !== null && stats?.approval_pct !== undefined ? `${stats.approval_pct}%` : "—"}
        compare={showTeamAverage && teamAverage?.approval_pct !== null ? `team ${teamAverage?.approval_pct}%` : undefined}
      />
      <Stat
        label="Eigen doorlooptijd"
        value={
          stats?.gem_doorlooptijd_dagen !== null && stats?.gem_doorlooptijd_dagen !== undefined
            ? `${stats.gem_doorlooptijd_dagen}d`
            : "—"
        }
        compare={
          showTeamAverage && teamAverage?.gem_doorlooptijd_dagen !== null
            ? `team ${teamAverage?.gem_doorlooptijd_dagen}d`
            : undefined
        }
      />
      <Stat label="Opdrachten" value={stats?.toegewezen ?? 0} />
    </div>
  );
}

function Stat({ label, value, compare }: { label: string; value: string | number; compare?: string }) {
  return (
    <div>
      <p className="font-mono text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">
        {label}
        {compare ? ` · ${compare}` : ""}
      </p>
    </div>
  );
}
