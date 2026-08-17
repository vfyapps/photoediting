"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Link as LinkIcon, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { markGuidelineRead, unmarkGuidelineRead } from "@/app/(app)/academy/actions";
import { PromptCard, type PromptRow } from "@/components/academy/prompt-card";
import { Badge, Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GuidelineDetail } from "@/lib/academy";
import { trackLabels } from "@/lib/academy";
import { selfCheckItems } from "@/lib/assignments";

type Example = { id: string; isGood: boolean; caption: string | null; url: string };

export function ModuleScreen({
  guideline,
  examples,
  prompts,
  goalLabel,
  isRead,
  canEdit,
}: {
  guideline: GuidelineDetail;
  examples: Example[];
  prompts: PromptRow[];
  goalLabel: string | null;
  isRead: boolean;
  canEdit: boolean;
}) {
  const [read, setRead] = useState(isRead);
  const [isPending, startTransition] = useTransition();
  const [linkCopied, setLinkCopied] = useState(false);

  function toggleRead() {
    startTransition(async () => {
      const result = read
        ? await unmarkGuidelineRead(guideline.id)
        : await markGuidelineRead(guideline.id);
      if (result.ok) setRead(!read);
      else toast.error(result.message);
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  }

  const goodExamples = examples.filter((example) => example.isGood);
  const badExamples = examples.filter((example) => !example.isGood);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          href="/academy"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Terug naar Academy
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge status="neutral">{trackLabels[guideline.track]}</Badge>
              {goalLabel ? <Badge status="neutral">{goalLabel}</Badge> : null}
              {!guideline.isPublished ? <Chip status="warning">Concept</Chip> : null}
            </div>
            <h1 className="text-2xl">{guideline.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              aria-label="Kopieer link naar deze module"
              className="rounded-md border border-input p-2 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              onClick={copyLink}
              type="button"
            >
              {linkCopied ? <Check aria-hidden="true" className="size-4 text-success" /> : <LinkIcon aria-hidden="true" className="size-4" />}
            </button>
            {canEdit ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={`/academy/${guideline.slug}/bewerken`}>
                  <Pencil aria-hidden="true" className="size-4" />
                  Bewerken
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Kalm document: ruime regelafstand, leesbare breedte (AGENTS.md, Design direction). */}
      <div className="prose prose-sm max-w-none font-body leading-7 text-foreground prose-headings:font-display prose-headings:font-bold prose-a:text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{guideline.bodyMd}</ReactMarkdown>
      </div>

      {examples.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <ExampleColumn examples={goodExamples} label="Goed voorbeeld" tone="success" />
          <ExampleColumn examples={badExamples} label="Fout voorbeeld" tone="critical" />
        </div>
      ) : null}

      {guideline.track === "goal" ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Zelfcheck</h2>
          <ul className="flex flex-col gap-1.5 rounded-md border border-border bg-card p-4">
            {selfCheckItems.map((item) => (
              <li className="flex items-start gap-2 text-sm" key={item}>
                <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {prompts.length > 0 ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Prompts</h2>
          <ul className="flex flex-col gap-2">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-t border-border pt-4">
        <Button
          disabled={isPending}
          onClick={toggleRead}
          title={read ? "Klik om als ongelezen te markeren" : undefined}
          type="button"
          variant={read ? "secondary" : "primary"}
        >
          <Check aria-hidden="true" className="size-4" />
          {read ? "Gelezen" : "Markeer als gelezen"}
        </Button>
      </div>
    </div>
  );
}

function ExampleColumn({
  examples,
  label,
  tone,
}: {
  examples: Example[];
  label: string;
  tone: "success" | "critical";
}) {
  if (examples.length === 0) return null;

  return (
    <div>
      <Chip status={tone}>{label}</Chip>
      <div className="mt-2 flex flex-col gap-2">
        {examples.map((example) => (
          // eslint-disable-next-line @next/next/no-img-element -- lesmateriaal uit Supabase Storage, geen next/image-optimalisatie nodig voor deze schaal
          <img
            alt={example.caption ?? label}
            className="w-full rounded-md border border-border"
            height={300}
            key={example.id}
            src={example.url}
            width={400}
          />
        ))}
      </div>
    </div>
  );
}
