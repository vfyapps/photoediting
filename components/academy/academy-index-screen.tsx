"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { EditorProgressCard } from "@/components/academy/editor-progress-card";
import { Badge, Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  type GuidelineSummary,
  type GuidelineTrack,
  guidelineTracks,
  isGuidelineTrack,
  trackDescriptions,
  trackLabels,
} from "@/lib/academy";
import { cn } from "@/lib/utils";

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
}: {
  guidelines: GuidelineSummary[];
  readIds: Set<string>;
  readCount: number;
  canEdit: boolean;
  isEditor: boolean;
  editorStats: EditorStatsRow;
  teamAverage: TeamAverageRow;
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          canEdit ? (
            <Button asChild>
              <Link href="/academy/nieuw">
                <Plus aria-hidden="true" className="size-4" />
                Nieuwe module
              </Link>
            </Button>
          ) : undefined
        }
        description="Het proces van 1 tot 100, modules per editing goal, en tips van de coördinator."
        eyebrow="Kennisbank"
        title="Academy"
      />

      {isEditor ? <EditorProgressCard readCount={readCount} stats={editorStats} teamAverage={teamAverage} /> : null}

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
      <p className="-mt-4 text-sm text-muted-foreground">{trackDescriptions[activeTrack]}</p>

      {modules.length === 0 ? (
        <EmptyState
          description="Zodra hier content voor staat, verschijnt die in deze lijst."
          icon={<span className="font-display text-lg">?</span>}
          title="Nog geen modules in deze track"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {modules.map((guideline) => (
            <li key={guideline.id}>
              <Link
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 transition-[transform,box-shadow] duration-fast ease-standard hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                href={`/academy/${guideline.slug}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{guideline.title}</span>
                  {readIds.has(guideline.id) ? <Chip status="success">Gelezen</Chip> : null}
                  {!guideline.isPublished ? <Badge status="warning">Concept</Badge> : null}
                  {guideline.origin === "qc_suggested" ? (
                    <Badge status="neutral">Auto, uit QC</Badge>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
