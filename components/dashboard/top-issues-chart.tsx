"use client";

import { useRouter } from "next/navigation";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/ui/empty-state";
import { AlertTriangle } from "lucide-react";

type IssueRow = { code: string | null; label_nl: string | null; aantal: number | null };

/**
 * De belangrijkste grafiek van de app (AGENTS.md, Screen 6): wat hier
 * bovenaan staat hoort in de academy en in de standaardprompts. Magnitude
 * over een handvol categorieën -> horizontale bar, sequentiële kleur (één
 * hue), klikbaar door naar de betrokken opdrachten.
 */
export function TopIssuesChart({ rows }: { rows: IssueRow[] }) {
  const router = useRouter();
  const data = rows
    .filter((row): row is { code: string; label_nl: string; aantal: number } =>
      Boolean(row.code && row.label_nl && (row.aantal ?? 0) > 0),
    )
    .slice(0, 8)
    .map((row) => ({ code: row.code, label: row.label_nl, aantal: row.aantal }));

  if (data.length === 0) {
    return (
      <EmptyState
        description="Zodra er QC-bevindingen zijn, verschijnt hier welk fouttype het vaakst voorkomt."
        icon={<AlertTriangle aria-hidden="true" />}
        title="Nog geen QC-bevindingen"
      />
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
        >
          <XAxis
            allowDecimals={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            tickLine={false}
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="label"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
            tickLine={false}
            type="category"
            width={160}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
              color: "var(--foreground)",
            }}
            formatter={(value) => [`${value} bevindingen`, ""]}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
          />
          <Bar
            barSize={20}
            className="cursor-pointer"
            dataKey="aantal"
            onClick={(entry) => {
              const code = (entry as unknown as { code: string }).code;
              router.push(`/?qc_issue=${encodeURIComponent(code)}`);
            }}
            radius={[0, 4, 4, 0]}
          >
            {data.map((entry) => (
              <Cell fill="var(--chart-1)" key={entry.code} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
