"use client";

import { CalendarRange } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/ui/empty-state";

type VolumeRow = { maand: string | null; aangevraagd_woningen: number | null };
type CompletedRow = { maand: string | null; afgerond_woningen: number | null };

const monthFormatter = new Intl.DateTimeFormat("nl-NL", { month: "short", year: "2-digit" });

/**
 * Twee losse views (aangevraagd, afgerond) leveren allebei al hun eigen
 * aggregatie per maand — hier alleen samenvoegen op maandsleutel voor de
 * grafiek, geen nieuwe berekening.
 */
export function MonthlyVolumeChart({
  volume,
  completed,
}: {
  volume: VolumeRow[];
  completed: CompletedRow[];
}) {
  const months = new Set([
    ...volume.map((row) => row.maand).filter((m): m is string => Boolean(m)),
    ...completed.map((row) => row.maand).filter((m): m is string => Boolean(m)),
  ]);
  const volumeByMonth = new Map(volume.map((row) => [row.maand, row.aangevraagd_woningen ?? 0]));
  const completedByMonth = new Map(completed.map((row) => [row.maand, row.afgerond_woningen ?? 0]));

  const data = [...months]
    .sort()
    .map((maand) => ({
      maand,
      label: monthFormatter.format(new Date(`${maand}T00:00:00Z`)),
      aangevraagd: volumeByMonth.get(maand) ?? 0,
      afgerond: completedByMonth.get(maand) ?? 0,
    }));

  if (data.length === 0) {
    return (
      <EmptyState
        description="Zodra er opdrachten met een aanvraagdatum zijn, verschijnt het maandoverzicht hier."
        icon={<CalendarRange aria-hidden="true" />}
        title="Nog geen volumedata"
      />
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
          <Line
            dataKey="aangevraagd"
            dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 0 }}
            name="Aangevraagd"
            stroke="var(--chart-1)"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="afgerond"
            dot={{ r: 4, fill: "var(--chart-2)", strokeWidth: 0 }}
            name="Afgerond"
            stroke="var(--chart-2)"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
