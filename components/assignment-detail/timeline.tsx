import { statusLabelsNl, type StatusEvent } from "@/lib/assignments";

const relativeFormatter = new Intl.RelativeTimeFormat("nl-NL", { numeric: "auto" });
const absoluteFormatter = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" });

function relativeLabel(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (Math.abs(diffMinutes) < 60) return relativeFormatter.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeFormatter.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return relativeFormatter.format(diffDays, "day");
}

/**
 * V5 "Studio" (BUILDPLAN-V5 §WP4.3): status_events bestond al sinds v1 —
 * elke overgang wordt automatisch gelogd — maar werd nergens getoond.
 * Relatieve tijd mag hier (created_at is een timestamptz, in tegenstelling
 * tot request_date dat maar een date is — zie DESIGN-V5.md §4).
 */
function Timeline({ events }: { events: StatusEvent[] }) {
  if (events.length === 0) {
    return <p className="text-xs text-muted-foreground">Nog geen statuswijzigingen.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {events.map((event) => (
        <li className="flex gap-2.5 text-sm" key={event.id}>
          <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-v5-green" />
          <div className="min-w-0 flex-1">
            <p className="text-foreground">
              {event.fromStatus ? (
                <>
                  <span className="text-muted-foreground">{statusLabelsNl[event.fromStatus]}</span>
                  {" → "}
                </>
              ) : (
                <span className="text-muted-foreground">Aangemaakt als </span>
              )}
              <span className="font-medium">{statusLabelsNl[event.toStatus]}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground" title={absoluteFormatter.format(new Date(event.createdAt))}>
              {event.actorName ? `${event.actorName} · ` : ""}
              {relativeLabel(event.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export { Timeline };
