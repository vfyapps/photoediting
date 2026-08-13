import { Users } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

type EditorRow = {
  editor: string | null;
  toegewezen: number | null;
  approved: number | null;
  denied: number | null;
  approval_pct: number | null;
  gem_doorlooptijd_dagen: number | null;
  fotos: number | null;
};

/**
 * Meer dan een handvol metrics per editor -> een tabel, geen grafiek
 * (dataviz-skill, "Is it even a chart?"). Dit is de vergelijking die
 * editors zelf niet te zien krijgen (AGENTS.md, Academy en schemawijziging 5).
 */
export function EditorPerformanceTable({ rows }: { rows: EditorRow[] }) {
  const data = rows.filter((row) => row.editor);

  if (data.length === 0) {
    return (
      <EmptyState
        description="Zodra editors opdrachten toegewezen krijgen, staat de vergelijking hier."
        icon={<Users aria-hidden="true" />}
        title="Nog geen cijfers"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="border-b border-border bg-muted/30 text-left text-xs font-medium text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Editor</th>
            <th className="px-3 py-2 text-right">Toegewezen</th>
            <th className="px-3 py-2 text-right">Goedgekeurd</th>
            <th className="px-3 py-2 text-right">Afgekeurd</th>
            <th className="px-3 py-2 text-right">Approval rate</th>
            <th className="px-3 py-2 text-right">Gem. doorlooptijd</th>
            <th className="px-3 py-2 text-right">Foto&apos;s</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr className="border-b border-border last:border-b-0" key={row.editor}>
              <td className="px-3 py-2 font-medium">{row.editor}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{row.toegewezen ?? 0}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{row.approved ?? 0}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{row.denied ?? 0}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">
                {row.approval_pct !== null ? `${row.approval_pct}%` : "—"}
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">
                {row.gem_doorlooptijd_dagen !== null ? `${row.gem_doorlooptijd_dagen}d` : "—"}
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{row.fotos ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
