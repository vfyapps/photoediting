"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { deleteGuidelineExample, upsertGuideline, uploadGuidelineExample } from "@/app/(app)/academy/actions";
import { Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { guidelineTracks, trackLabels, type GuidelineDetail, type GuidelineTrack } from "@/lib/academy";

type GoalOption = { code: string; label_nl: string };

export type ExampleRow = { id: string; url: string; caption: string | null; isGood: boolean };

const inputClassName =
  "h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25";

const allowedExampleMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const maxExampleFileBytes = 5 * 1024 * 1024;

/**
 * Eén platte markdown-editor met live preview, voor zowel aanmaken als
 * bewerken. Bewust geen block-editor: markdown blijft leesbaar en
 * overdraagbaar (AGENTS.md, Academy - Editing).
 */
export function GuidelineEditor({
  guideline,
  goals,
  examples = [],
}: {
  guideline: GuidelineDetail | null;
  goals: GoalOption[];
  examples?: ExampleRow[];
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

      <div className="border-t border-border pt-4">
        <h2 className="mb-2 text-sm font-semibold">Goed/fout-voorbeelden</h2>
        {guideline ? (
          <ExampleManager examples={examples} guidelineId={guideline.id} />
        ) : (
          <p className="text-xs text-muted-foreground">
            Sla de module eerst op om voorbeeldafbeeldingen toe te voegen.
          </p>
        )}
      </div>
    </div>
  );
}

function ExampleManager({ guidelineId, examples }: { guidelineId: string; examples: ExampleRow[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [isGood, setIsGood] = useState(true);
  const [isPending, startTransition] = useTransition();

  function pickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!allowedExampleMimeTypes.includes(file.type)) {
      toast.error("Alleen JPG, PNG of WEBP.");
      return;
    }
    if (file.size > maxExampleFileBytes) {
      toast.error("Bestand mag maximaal 5 MB zijn.");
      return;
    }

    startTransition(async () => {
      const result = await uploadGuidelineExample({
        guidelineId,
        isGood,
        caption: caption.trim() || null,
        file,
      });
      if (result.ok) {
        toast.success("Afbeelding geüpload.");
        setCaption("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function remove(exampleId: string) {
    startTransition(async () => {
      const result = await deleteGuidelineExample(exampleId);
      if (result.ok) {
        toast.success("Afbeelding verwijderd.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {examples.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {examples.map((example) => (
            <li className="flex flex-col gap-2 rounded-md border border-border bg-card p-2" key={example.id}>
              {/* eslint-disable-next-line @next/next/no-img-element -- lesmateriaal uit Supabase Storage, geen next/image-optimalisatie nodig voor deze schaal */}
              <img
                alt={example.caption ?? ""}
                className="h-32 w-full rounded-sm border border-border object-cover"
                src={example.url}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Chip status={example.isGood ? "success" : "critical"}>{example.isGood ? "Goed" : "Fout"}</Chip>
                  {example.caption ? <span className="truncate text-xs text-muted-foreground">{example.caption}</span> : null}
                </div>
                <button
                  aria-label="Afbeelding verwijderen"
                  className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                  disabled={isPending}
                  onClick={() => remove(example.id)}
                  type="button"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Nog geen voorbeelden geüpload.</p>
      )}

      <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-input p-3">
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">
          Bijschrift (optioneel)
          <input
            className={inputClassName}
            onChange={(event) => setCaption(event.target.value)}
            type="text"
            value={caption}
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">
          Type
          <select
            className={inputClassName}
            onChange={(event) => setIsGood(event.target.value === "good")}
            value={isGood ? "good" : "bad"}
          >
            <option value="good">Goed voorbeeld</option>
            <option value="bad">Fout voorbeeld</option>
          </select>
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <Button disabled={isPending} onClick={pickFile} size="sm" type="button" variant="secondary">
          <Upload className="size-3.5" />
          {isPending ? "Bezig…" : "Afbeelding kiezen"}
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
      className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
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
