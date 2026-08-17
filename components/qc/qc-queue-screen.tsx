"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

import { submitQcReview, type QcFindingInput } from "@/app/(app)/qc/actions";
import { QcHistory, type QcRound } from "@/components/assignment-detail/qc-history";
import { FindingForm } from "@/components/qc/finding-form";
import { Badge, Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import type { AssignmentDetail, EditItem } from "@/lib/assignments";
import { priorityLabels } from "@/lib/assignments";
import { cn } from "@/lib/utils";

type IssueType = { code: string; label_nl: string };

export function QcQueueScreen({
  queue,
  editItemsByAssignment,
  goalLabels,
  issueTypes,
  roundsByAssignment,
}: {
  queue: AssignmentDetail[];
  editItemsByAssignment: Map<string, EditItem[]>;
  goalLabels: Map<string, string>;
  issueTypes: IssueType[];
  roundsByAssignment: Map<string, QcRound[]>;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const current = queue[Math.min(index, queue.length - 1)];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT";
      if (typing) return;
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        setIndex((i) => Math.min(i + 1, queue.length - 1));
      } else if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [queue.length]);

  function advance() {
    setIndex((i) => Math.min(i, Math.max(queue.length - 2, 0)));
    router.refresh();
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          description="De QC-wachtrij, met bevindingen per foto en sneltoetsen om snel door te lopen."
          eyebrow="Controle"
          title="Kwaliteitscontrole"
        />
        <EmptyState
          description="Er staat op dit moment niets in QC. Zodra een editor een opdracht inlevert, verschijnt die hier."
          icon={<ClipboardCheck aria-hidden="true" />}
          title="Wachtrij is leeg"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        description="Oudste eerst. j/k of pijltjes om te wisselen, a om goed te keuren, d voor het afkeurformulier."
        eyebrow="Kwaliteitscontrole"
        title="QC"
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <ol aria-label="QC-wachtrij" className="flex flex-col gap-1 rounded-md border border-border bg-card p-1">
          {queue.map((assignment, i) => (
            <li key={assignment.id}>
              <button
                aria-current={i === index}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                  i === index ? "bg-accent text-accent-foreground" : "hover:bg-muted/50",
                )}
                onClick={() => setIndex(i)}
                type="button"
              >
                <span className="truncate font-mono text-xs font-semibold">{assignment.accoId}</span>
                <Badge status={priorityBadge[assignment.priority]}>{priorityLabels[assignment.priority]}</Badge>
              </button>
            </li>
          ))}
        </ol>

        {current ? (
          <ReviewPanel
            assignment={current}
            editItems={editItemsByAssignment.get(current.id) ?? []}
            goalLabels={goalLabels}
            issueTypes={issueTypes}
            key={current.id}
            onDecided={advance}
            rounds={roundsByAssignment.get(current.id) ?? []}
          />
        ) : null}
      </div>
    </div>
  );
}

const priorityBadge = {
  high: "critical",
  medium: "warning",
  low: "neutral",
} as const;

/**
 * Eigen state per opdracht (bevindingen, afkeurformulier open/dicht) en de
 * a/d-sneltoetsen. Gekeyed op assignment.id vanuit de ouder, zodat wisselen
 * van opdracht die state vanzelf terugzet door te remounten — geen effect
 * nodig dat setState synchroon aanroept.
 */
function ReviewPanel({
  assignment,
  editItems,
  goalLabels,
  issueTypes,
  rounds,
  onDecided,
}: {
  assignment: AssignmentDetail;
  editItems: EditItem[];
  goalLabels: Map<string, string>;
  issueTypes: IssueType[];
  rounds: QcRound[];
  onDecided: () => void;
}) {
  const [findings, setFindings] = useState<QcFindingInput[]>([]);
  const [showDenyForm, setShowDenyForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      const result = await submitQcReview(assignment.id, "approved", []);
      if (result.ok) {
        toast.success(`${assignment.accoId} goedgekeurd.`);
        onDecided();
      } else {
        toast.error(result.message);
      }
    });
  }

  function deny() {
    startTransition(async () => {
      const result = await submitQcReview(assignment.id, "denied", findings);
      if (result.ok) {
        toast.success(`${assignment.accoId} afgekeurd met ${findings.length} bevinding(en).`);
        onDecided();
      } else {
        toast.error(result.message);
      }
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT";
      if (typing) return;
      if (event.key === "a") {
        event.preventDefault();
        approve();
      } else if (event.key === "d") {
        event.preventDefault();
        setShowDenyForm(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- approve() sluit over assignment.id, dat verandert alleen samen met een remount van dit component
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{assignment.accoId}</h2>
          <p className="text-xs text-muted-foreground">
            {assignment.rentalExpertName ?? "Onbekend"} · {assignment.editorName ?? "Niet toegewezen"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Chip status="warning">QC</Chip>
          <Badge status={priorityBadge[assignment.priority]}>{priorityLabels[assignment.priority]}</Badge>
        </div>
      </div>

      <PhotoReference editItems={editItems} goalLabels={goalLabels} />

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button disabled={isPending} onClick={approve} type="button">
          Goedkeuren <kbd className="ml-1 font-mono text-[10px] opacity-70">a</kbd>
        </Button>
        <Button
          disabled={isPending}
          onClick={() => setShowDenyForm((value) => !value)}
          type="button"
          variant="secondary"
        >
          Afkeuren <kbd className="ml-1 font-mono text-[10px] opacity-70">d</kbd>
        </Button>
      </div>

      {showDenyForm ? (
        <FindingForm
          editItems={editItems}
          findings={findings}
          issueTypes={issueTypes}
          isPending={isPending}
          onCancel={() => setShowDenyForm(false)}
          onChange={setFindings}
          onSubmit={deny}
        />
      ) : null}

      {rounds.length > 0 ? (
        <div className="border-t border-border pt-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Eerdere rondes
          </h3>
          <QcHistory rounds={rounds} />
        </div>
      ) : null}
    </div>
  );
}

function PhotoReference({
  editItems,
  goalLabels,
}: {
  editItems: EditItem[];
  goalLabels: Map<string, string>;
}) {
  if (editItems.length === 0) {
    return <p className="text-xs text-muted-foreground">Geen foto&apos;s geregistreerd op deze opdracht.</p>;
  }

  const byGoal = new Map<string, EditItem[]>();
  editItems.forEach((item) => {
    byGoal.set(item.goalCode, [...(byGoal.get(item.goalCode) ?? []), item]);
  });

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
      {[...byGoal.entries()].map(([goalCode, items]) => (
        <div key={goalCode}>
          <span className="font-semibold">{goalLabels.get(goalCode) ?? goalCode}:</span>{" "}
          <span className="font-mono text-muted-foreground">
            {items.map((item) => `#${item.photoNumber}`).join(", ")}
          </span>
        </div>
      ))}
    </div>
  );
}
