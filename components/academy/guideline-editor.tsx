"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { upsertGuideline } from "@/app/(app)/academy/actions";
import { Button } from "@/components/ui/button";
import { guidelineTracks, trackLabels, type GuidelineDetail, type GuidelineTrack } from "@/lib/academy";

type GoalOption = { code: string; label_nl: string };

const inputClassName =
  "h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25";

/**
 * Eén platte markdown-editor met live preview, voor zowel aanmaken als
 * bewerken. Bewust geen block-editor: markdown blijft leesbaar en
 * overdraagbaar (AGENTS.md, Academy - Editing).
 */
export function GuidelineEditor({
  guideline,
  goals,
}: {
  guideline: GuidelineDetail | null;
  goals: GoalOption[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(guideline?.slug ?? "");
  const [title, setTitle] = useState(guideline?.title ?? "");
  const [track, setTrack] = useState<GuidelineTrack>(guideline?.track ?? "onboarding");
  const [goalCode, setGoalCode] = useState(guideline?.goalCode ?? "");
  const [bodyMd, setBodyMd] = useState(guideline?.bodyMd ?? "");
  const [isPublished, setIsPublished] = useState(guideline?.isPublished ?? false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();

  function slugFromTitle(value: string) {
    setTitle(value);
    if (!guideline) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  }

  function save() {
    startTransition(async () => {
      const result = await upsertGuideline({
        id: guideline?.id ?? null,
        slug,
        title,
        track,
        goalCode: track === "goal" ? goalCode || null : null,
        bodyMd,
        isPublished,
        sortOrder: guideline?.sortOrder ?? 0,
      });
      if (result.ok) {
        toast.success(guideline ? "Module opgeslagen." : "Module aangemaakt.");
        router.push(`/academy/${result.slug}`);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">
          Titel
          <input
            className={inputClassName}
            onChange={(event) => slugFromTitle(event.target.value)}
            type="text"
            value={title}
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">
          Slug (stabiele URL)
          <input
            className={inputClassName}
            onChange={(event) => setSlug(event.target.value)}
            type="text"
            value={slug}
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">
          Track
          <select
            className={inputClassName}
            onChange={(event) => setTrack(event.target.value as GuidelineTrack)}
            value={track}
          >
            {guidelineTracks.map((option) => (
              <option key={option} value={option}>
                {trackLabels[option]}
              </option>
            ))}
          </select>
        </label>
        {track === "goal" ? (
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Editing goal
            <select className={inputClassName} onChange={(event) => setGoalCode(event.target.value)} value={goalCode}>
              <option value="">Kies een goal</option>
              {goals.map((goal) => (
                <option key={goal.code} value={goal.code}>
                  {goal.label_nl}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <div aria-label="Weergave" className="inline-flex rounded-md border border-border p-0.5" role="tablist">
          <ToggleTab active={!showPreview} onClick={() => setShowPreview(false)}>
            Bewerken
          </ToggleTab>
          <ToggleTab active={showPreview} onClick={() => setShowPreview(true)}>
            Voorbeeld
          </ToggleTab>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <input
            checked={isPublished}
            className="size-3.5 rounded-sm border-input accent-primary"
            onChange={(event) => setIsPublished(event.target.checked)}
            type="checkbox"
          />
          Gepubliceerd
        </label>
      </div>

      {showPreview ? (
        <div className="prose prose-sm min-h-64 max-w-none rounded-md border border-border bg-card p-4 leading-7 prose-headings:font-display">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd || "*Nog geen inhoud.*"}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="min-h-64 w-full rounded-md border border-input bg-background p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/25"
          onChange={(event) => setBodyMd(event.target.value)}
          placeholder="## Titel&#10;&#10;Schrijf hier de module in markdown…"
          value={bodyMd}
        />
      )}

      <div className="flex items-center gap-2">
        <Button
          disabled={isPending || !slug || !title || !bodyMd}
          onClick={save}
          type="button"
        >
          {isPending ? "Bezig…" : "Opslaan"}
        </Button>
      </div>
    </div>
  );
}

function ToggleTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-selected={active}
      className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {children}
    </button>
  );
}
