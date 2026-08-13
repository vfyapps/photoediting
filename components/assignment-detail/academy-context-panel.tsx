import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { PromptCard, type PromptRow } from "@/components/academy/prompt-card";
import { EmptyState } from "@/components/ui/empty-state";

type GuidelineSummary = { id: string; slug: string; title: string; goal_code: string | null };

export function AcademyContextPanel({
  guidelines,
  prompts,
}: {
  guidelines: GuidelineSummary[];
  prompts: PromptRow[];
}) {
  if (guidelines.length === 0 && prompts.length === 0) {
    return (
      <EmptyState
        description="Zodra er gepubliceerde modules of prompts voor deze goals zijn, verschijnen ze hier automatisch."
        icon={<GraduationCap aria-hidden="true" />}
        title="Nog geen academy-content"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {guidelines.length > 0 ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Relevante modules</h2>
          <ul className="flex flex-col gap-1.5">
            {guidelines.map((guideline) => (
              <li key={guideline.id}>
                <Link
                  className="block rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring"
                  href={`/academy/${guideline.slug}`}
                >
                  {guideline.title}
                </Link>
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
    </div>
  );
}
