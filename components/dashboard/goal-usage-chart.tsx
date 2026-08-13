"use client";

import { BarChart as BarChartIcon } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/ui/empty-state";

type GoalRow = { code: string | null; label_nl: string | null; fotos: number | null };

export function GoalUsageChart({ rows }: { rows: GoalRow[] }) {
  const data = rows
    .filter((row): row is { code: string; label_nl: string; fotos: number } =>
      Boolean(row.code && row.label_nl && (row.fotos ?? 0) > 0),
    )
    .sort((a, b) => b.fotos - a.fotos)
    .map((row) => ({ code: row.code, label: row.label_nl, fotos: row.fotos }));

  if (data.length === 0) {
    return (
      <EmptyState
        description="Zodra er foto's per editing goal zijn bewerkt, staat de verdeling hier."
        icon={<BarChartIcon aria-hidden="true" />}
        title="Nog geen gebruik"
      />
    );
  }

  return (
    <div style={{ height: Math.max(180, data.length * 32) }} className="w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
          <XAxis
            allowDecimals={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="label"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
            tickLine={false}
            type="category"
            width={140}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--foreground)",
            }}
            formatter={(value) => [`${value} foto's`, ""]}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
          />
          <Bar barSize={16} dataKey="fotos" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell fill="var(--chart-3)" key={entry.code} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
