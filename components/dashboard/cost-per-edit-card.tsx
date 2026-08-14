import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Maandkosten AI-editing gedeeld door goedgekeurde bewerkingen die maand,
 * naast het ingestelde shoot-tarief: zakt de kostprijs per bewerking richting
 * dat tarief, dan verdwijnt de businesscase — dat wil je zien vóórdat het
 * gebeurt (BUILDPLAN-V3.md §V3-WP4.4).
 */
export function CostPerEditCard({
  monthlyEditingCostEur,
  avoidedShootCostEur,
  completedThisMonth,
  completedLastMonth,
}: {
  monthlyEditingCostEur: number;
  avoidedShootCostEur: number;
  completedThisMonth: number;
  completedLastMonth: number | null;
}) {
  const costThisMonth = completedThisMonth > 0 ? monthlyEditingCostEur / completedThisMonth : null;
  const costLastMonth =
    completedLastMonth && completedLastMonth > 0 ? monthlyEditingCostEur / completedLastMonth : null;

  const ratio = costThisMonth !== null ? costThisMonth / avoidedShootCostEur : null;
  const tone = ratio === null ? "neutral" : ratio < 0.5 ? "good" : ratio < 0.8 ? "warning" : "critical";

  let trend: "up" | "down" | "flat" | null = null;
  if (costThisMonth !== null && costLastMonth !== null) {
    if (costThisMonth > costLastMonth * 1.02) trend = "up";
    else if (costThisMonth < costLastMonth * 0.98) trend = "down";
    else trend = "flat";
  }

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kosten per bewerking</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="font-display text-3xl font-extrabold tabular-nums text-foreground">
          {costThisMonth !== null ? `€${costThisMonth.toFixed(2)}` : "—"}
        </p>
        {trend ? <TrendIcon trend={trend} /> : null}
      </div>
      <p
        className={cn(
          "mt-1 text-sm",
          tone === "good" && "text-success",
          tone === "warning" && "text-warning",
          tone === "critical" && "text-destructive",
          tone === "neutral" && "text-muted-foreground",
        )}
      >
        {costThisMonth !== null
          ? `vs. €${avoidedShootCostEur.toLocaleString("nl-NL")} per vermeden fotoshoot`
          : "Nog geen goedgekeurde bewerkingen deze maand."}
      </p>
    </div>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "flat") return <Minus aria-label="Gelijk aan vorige maand" className="size-4 text-muted-foreground" />;
  if (trend === "up") return <ArrowUpRight aria-label="Hoger dan vorige maand" className="size-4 text-destructive" />;
  return <ArrowDownRight aria-label="Lager dan vorige maand" className="size-4 text-success" />;
}
