import Link from "next/link";
import { History } from "lucide-react";

import { AccoMark } from "@/components/ui/acco-mark";
import { EmptyState } from "@/components/ui/empty-state";
import { statusLabelsNl, type AssignmentStatus } from "@/lib/assignments";

const relativeFormatter = new Intl.RelativeTimeFormat("nl-NL", { numeric: "auto" });

function relativeLabel(iso: string): string {
  const diffMinutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(diffMinutes) < 60) return relativeFormatter.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeFormatter.format(diffHours, "hour");
  return relativeFormatter.format(Math.round(diffHours / 24), "day");
}

export type ActivityRow = {
  id: string;
  assignmentId: string;
  accoId: string;
  toStatus: AssignmentStatus;
  actorName: string | null;
  createdAt: string;
};

/**
 * V5 "Studio" (BUILDPLAN-V5 §WP6.4): status_events voedt hier de laatste ~8
 * gebeurtenissen — dezelfde tabel als de tijdlijn op het opdrachtdetail
 * (V5-WP4), nu team-breed i.p.v. per opdracht. Geen thumbnails: AccoMark
 * draagt de identiteit (DESIGN-V5.md §2).
 */
export function RecentActivity({ rows }: { rows: ActivityRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        description="Zodra de status van een opdracht wijzigt, verschijnt dat hier."
        icon={<History aria-hidden="true" />}
        title="Nog geen activiteit"
      />
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-md border border-border bg-card">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
            href={`/opdrachten/${row.assignmentId}`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <AccoMark accoId={row.accoId} size="sm" />
              <span className="text-muted-foreground">→ {statusLabelsNl[row.toStatus]}</span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {row.actorName ? `${row.actorName} · ` : ""}
              {relativeLabel(row.createdAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
