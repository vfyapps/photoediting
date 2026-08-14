import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, ImageOff, UserX } from "lucide-react";

export type AttentionData = {
  qcOverdueCount: number;
  highPriorityUnassignedCount: number;
  missingPhotosCount: number;
  topIssue: { code: string; label: string; count: number; moduleSlug: string | null } | null;
};

/**
 * Vertelt vóór het klikken al wat aandacht nodig heeft, in plaats van dat de
 * gebruiker het scherm moet afspeuren (AGENTS.md, Screen 2). De QC-callout is
 * de belangrijkste kaart hier: dit is de feedbackloop waar de hele app om
 * draait (issue → academy-module).
 */
export function AttentionStrip({ attention }: { attention: AttentionData }) {
  const { qcOverdueCount, highPriorityUnassignedCount, missingPhotosCount, topIssue } = attention;
  if (qcOverdueCount === 0 && highPriorityUnassignedCount === 0 && missingPhotosCount === 0 && !topIssue) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 border-b border-border py-3">
      {qcOverdueCount > 0 ? (
        <AttentionCard
          count={qcOverdueCount}
          href="/?qc_overdue=1"
          icon={<Clock aria-hidden="true" className="size-4" />}
          label={
            qcOverdueCount === 1
              ? "opdracht langer dan de QC-termijn in QC"
              : "opdrachten langer dan de QC-termijn in QC"
          }
          tone="warning"
        />
      ) : null}
      {highPriorityUnassignedCount > 0 ? (
        <AttentionCard
          count={highPriorityUnassignedCount}
          href="/?priority=high"
          icon={<UserX aria-hidden="true" className="size-4" />}
          label={
            highPriorityUnassignedCount === 1
              ? "hoge prioriteit zonder editor"
              : "hoge prioriteit zonder editor"
          }
          tone="critical"
        />
      ) : null}
      {missingPhotosCount > 0 ? (
        <AttentionCard
          count={missingPhotosCount}
          href="/?missing_photos=1"
          icon={<ImageOff aria-hidden="true" className="size-4" />}
          label={missingPhotosCount === 1 ? "opdracht wacht op fotonummers" : "opdrachten wachten op fotonummers"}
          tone="warning"
        />
      ) : null}
      {topIssue ? (
        <Link
          className="group flex min-w-72 flex-1 items-center gap-3 rounded-md border border-info-tint bg-info-tint px-3 py-2.5 text-sm transition-[transform,box-shadow] duration-fast ease-standard hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          href={topIssue.moduleSlug ? `/academy/${topIssue.moduleSlug}` : "/academy"}
        >
          <AlertTriangle aria-hidden="true" className="size-4 shrink-0 text-info" />
          <span className="min-w-0 flex-1">
            <span className="font-medium text-foreground">{topIssue.label}</span>
            <span className="text-muted-foreground">
              {" "}
              — komt dit seizoen in {topIssue.count} QC-notities voor
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 font-medium text-info">
            {topIssue.moduleSlug ? "Module openen" : "Naar Academy"}
            <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ) : null}
    </div>
  );
}

function AttentionCard({
  count,
  label,
  href,
  icon,
  tone,
}: {
  count: number;
  label: string;
  href: string;
  icon: React.ReactNode;
  tone: "warning" | "critical";
}) {
  const toneClasses =
    tone === "warning"
      ? "border-warning-tint bg-warning-tint text-warning"
      : "border-coral-tint bg-coral-tint text-destructive";

  return (
    <Link
      className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-[transform,box-shadow] duration-fast ease-standard hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${toneClasses}`}
      href={href}
    >
      {icon}
      <span className="font-mono tabular-nums">{count}</span>
      <span className="font-body font-normal text-foreground">{label}</span>
    </Link>
  );
}
