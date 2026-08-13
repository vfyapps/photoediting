import { ClipboardCheck } from "lucide-react";

import { Chip } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export type QcRound = {
  id: string;
  round: number;
  decision: "approved" | "denied";
  summary: string | null;
  createdAt: string;
  findings: { photoNumber: number | null; issueLabel: string; comment: string | null }[];
};

/**
 * Alleen-lezen geschiedenis. De echte review-flow (bevindingen toevoegen,
 * goed-/afkeuren) hoort op het QC-scherm, WP3.
 */
export function QcHistory({ rounds }: { rounds: QcRound[] }) {
  if (rounds.length === 0) {
    return (
      <EmptyState
        description="Zodra deze opdracht een keer naar QC is geweest, staat de beoordeling hier."
        icon={<ClipboardCheck aria-hidden="true" />}
        title="Nog geen QC-rondes"
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rounds.map((review) => (
        <article className="rounded-md border border-border p-3" key={review.id}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Ronde {review.round}</h3>
            <Chip status={review.decision === "approved" ? "success" : "critical"}>
              {review.decision === "approved" ? "Goedgekeurd" : "Afgekeurd"}
            </Chip>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(new Date(review.createdAt))}
          </p>
          {review.summary ? <p className="mt-2 text-sm text-muted-foreground">{review.summary}</p> : null}
          {review.findings.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2">
              {review.findings.map((finding, index) => (
                <li className="text-xs" key={index}>
                  {finding.photoNumber ? (
                    <span className="font-mono font-semibold">#{finding.photoNumber}</span>
                  ) : null}{" "}
                  <span className="font-medium">{finding.issueLabel}</span>
                  {finding.comment ? (
                    <span className="text-muted-foreground"> — {finding.comment}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}
