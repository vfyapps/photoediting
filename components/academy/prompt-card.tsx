"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export type PromptRow = { id: string; title: string; prompt_text: string; goal_code: string | null };

export function PromptCard({ prompt }: { prompt: PromptRow }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <li className="rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{prompt.title}</p>
        <button
          aria-label={`Kopieer prompt: ${prompt.title}`}
          className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          onClick={copy}
          type="button"
        >
          {copied ? <Check aria-hidden="true" className="size-4 text-success" /> : <Copy aria-hidden="true" className="size-4" />}
        </button>
      </div>
      <p className="mt-1.5 whitespace-pre-wrap font-mono text-xs text-muted-foreground">{prompt.prompt_text}</p>
    </li>
  );
}
