"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, GraduationCap, Plus } from "lucide-react";

import { EditorProgressCard } from "@/components/academy/editor-progress-card";
import { Badge, Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  type GuidelineSummary,
  type GuidelineTrack,
  guidelineTracks,
  isGuidelineTrack,
  trackDescriptions,
  trackLabels,
} from "@/lib/academy";
import { getGoalVisual } from "@/lib/goal-visuals";
import { cn } from "@/lib/utils";

type TopIssue = { code: string; label: string; count: number; moduleSlug: string | null };

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

export function AcademyIndexScreen({
  guidelines,
  readIds,
  readCount,
  canEdit,
  isEditor,
  editorStats,
  teamAverage,
  topIssues,
}: {
  guidelines: GuidelineSummary[];
  readIds: Set<string>;
  readCount: number;
  canEdit: boolean;
  isEditor: boolean;
  editorStats: EditorStatsRow;
  teamAverage: TeamAverageRow;
  topIssues: TopIssue[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trackParam = searchParams.get("track");
  const activeTrack: GuidelineTrack = trackParam && isGuidelineTrack(trackParam) ? trackParam : "onboarding";

  function setTrack(track: GuidelineTrack) {
    const params = new URLSearchParams(searchParams.toString());
    if (track === "onboarding") params.delete("track");
    else params.set("track", track);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const modules = orderedModules(guidelines, activeTrack);
  const publishedModules = modules.filter((guideline) => guideline.isPublished);
  const conceptModules = modules.filter((guideline) => !guideline.isPublished);
  const readInTrack = publishedModules.filter((guideline) => readIds.has(guideline.id)).length;

  return (
    <div className="flex flex-col gap-6">
      {/* V5 "Studio" typografische hero (BUILDPLAN-V5 §WP7.1): geen
          bannerfoto — er zijn geen foto's in de app (DESIGN-V5.md §2). */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 rounded-lg p-6 text-white shadow-v5-card"
        style={{ background: "linear-gradient(135deg, var(--color-v5-hero-from) 0%, var(--color-v5-hero-to) 100%)" }}
      >
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
            <GraduationCap aria-hidden="true" className="size-4" />
            Kennisbank
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Academy</h1>
          <p className="mt-1 max-w-prose text-sm text-white/80">
            Het proces van 1 tot 100, modules per editing goal, en tips van de coördinator.
          </p>
        </div>
        {canEdit ? (
          <Button asChild variant="secondary">
            <Link href="/academy/nieuw">
              <Plus aria-hidden="true" className="size-4" />
              Nieuwe module
            </Link>
          </Button>
        ) : null}
      </div>

      {isEditor ? <EditorProgressCard readCount={readCount} stats={editorStats} teamAverage={teamAverage} /> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          <div aria-label="Tracks" className="inline-flex w-fit rounded-md border border-border p-0.5" role="tablist">
            {guidelineTracks.map((track) => (
              <button
                aria-selected={activeTrack === track}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                  activeTrack === track
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                key={track}
                onClick={() => setTrack(track)}
                role="tab"
                type="button"
              >
                {trackLabels[track]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{trackDescriptions[activeTrack]}</p>
            {isEditor && publishedModules.length > 0 ? (
              <span className="font-mono text-xs text-muted-foreground">
                {readInTrack} van {publishedModules.length} gelezen
              </span>
            ) : null}
          </div>

          {modules.length === 0 ? (
            <EmptyState
              description="Zodra hier content voor staat, verschijnt die in deze lijst."
              icon={<span className="font-display text-lg">?</span>}
              title="Nog geen modules in deze track"
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {publishedModules.map((guideline, index) => (
                  <ModuleCard
                    guideline={guideline}
                    key={guideline.id}
                    number={activeTrack === "onboarding" ? index + 1 : null}
                    read={readIds.has(guideline.id)}
                  />
                ))}
              </div>

              {conceptModules.length > 0 && canEdit ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Concepten</p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {conceptModules.map((guideline) => (
                      <ModuleCard guideline={guideline} key={guideline.id} number={null} read={false} />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        <TopIssuesPanel issues={topIssues} />
      </div>
    </div>
  );
}

function ModuleCard({
  guideline,
  number,
  read,
}: {
  guideline: GuidelineSummary;
  number: number | null;
  read: boolean;
}) {
  const goalVisual = guideline.track === "goal" && guideline.goalCode ? getGoalVisual(guideline.goalCode) : null;

  return (
    <Link
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border p-4 shadow-v5-card transition-[transform,box-shadow] duration-fast ease-standard hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        guideline.isPublished ? "bg-card" : "bg-muted/30",
      )}
      href={`/academy/${guideline.slug}`}
    >
      {goalVisual ? (
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full border-2 bg-muted"
          style={{ borderColor: `var(--chart-${goalVisual.chartSlot})` }}
        >
          <goalVisual.icon aria-hidden="true" className="size-5" style={{ color: `var(--chart-${goalVisual.chartSlot})` }} />
        </span>
      ) : number !== null ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-muted-foreground">
          {number}
        </span>
      ) : (
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
          <GraduationCap aria-hidden="true" className="size-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-display font-bold">{guideline.title}</span>
          {read ? <Chip status="success">Gelezen</Chip> : null}
          {!guideline.isPublished ? <Badge status="warning">Concept</Badge> : null}
          {guideline.origin === "qc_suggested" ? <Badge status="neutral">Auto, uit QC</Badge> : null}
        </div>
        {guideline.bodyPreview ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{guideline.bodyPreview}</p>
        ) : null}
      </div>
      <span className="text-[11px] text-muted-foreground">
        {guideline.readingMinutes} min leestijd
      </span>
    </Link>
  );
}

function TopIssuesPanel({ issues }: { issues: TopIssue[] }) {
  if (issues.length === 0) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Veelgemaakte fouten
        </h2>
        <p className="text-xs text-muted-foreground">Nog geen QC-bevindingen dit seizoen.</p>
      </div>
    );
  }

  return (
    <div className="flex h-fit flex-col gap-2 rounded-md border border-border bg-card p-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Veelgemaakte fouten
      </h2>
      <ul className="flex flex-col divide-y divide-border">
        {issues.map((issue) => {
          const content = (
            <>
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-warning" />
              <span className="min-w-0 flex-1">
                <span className="block text-foreground">{issue.label}</span>
                <span className="text-[11px] text-muted-foreground">{issue.count} keer dit seizoen</span>
              </span>
            </>
          );
          return (
            <li className="py-2 first:pt-0 last:pb-0" key={issue.code}>
              {issue.moduleSlug ? (
                <Link
                  className="flex items-start gap-2 rounded-sm text-xs hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
                  href={`/academy/${issue.moduleSlug}`}
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-start gap-2 text-xs">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function orderedModules(guidelines: GuidelineSummary[], track: GuidelineTrack): GuidelineSummary[] {
  const inTrack = guidelines.filter((guideline) => guideline.track === track);
  if (track === "tips") {
    return [...inTrack].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  if (track === "goal") {
    return [...inTrack].sort((a, b) => (a.goalCode ?? "").localeCompare(b.goalCode ?? "") || a.sortOrder - b.sortOrder);
  }
  return [...inTrack].sort((a, b) => a.sortOrder - b.sortOrder);
}
