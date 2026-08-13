"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";

import { updateAssignmentStatus } from "@/app/actions";
import { updateMagnificUrl } from "@/app/(app)/opdrachten/[id]/actions";
import { AcademyContextPanel } from "@/components/assignment-detail/academy-context-panel";
import { GoalPhotosPanel } from "@/components/assignment-detail/goal-photos-panel";
import { QcHistory, type QcRound } from "@/components/assignment-detail/qc-history";
import { SelfCheckDialog } from "@/components/assignment-detail/self-check-dialog";
import { Badge, Chip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AssignmentDetail, AssignmentStatus, EditItem } from "@/lib/assignments";
import { priorityLabels, statusLabelsNl } from "@/lib/assignments";
import { canSubmitToQc } from "@/lib/workflow";
import { cn } from "@/lib/utils";

type GuidelineSummary = { id: string; slug: string; title: string; goal_code: string | null };
type PromptRow = { id: string; title: string; prompt_text: string; goal_code: string | null };
type GoalOption = { code: string; label_nl: string };

export function AssignmentDetailScreen({
  assignment,
  editItems,
  goals,
  guidelines,
  prompts,
  magnificBaseUrl,
  maxPhotosPerProperty,
  canManageStatus,
  qcRounds,
}: {
  assignment: AssignmentDetail;
  editItems: EditItem[];
  goals: GoalOption[];
  guidelines: GuidelineSummary[];
  prompts: PromptRow[];
  magnificBaseUrl: string | null;
  maxPhotosPerProperty: number;
  canManageStatus: boolean;
  qcRounds: QcRound[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "qc" ? "qc" : "opdracht";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.push("/");
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  function setTab(next: "opdracht" | "qc") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "opdracht") params.delete("tab");
    else params.set("tab", "qc");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const totalPhotos = new Set(editItems.map((item) => item.photoNumber)).size;
  const donePhotos = new Set(editItems.filter((item) => item.done).map((item) => item.photoNumber)).size;
  const qcGuard = canSubmitToQc({ totalPhotos, donePhotos });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          href="/"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Terug naar opdrachten
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl">{assignment.accoId}</h1>
            <Chip status={statusChip[assignment.status]}>{statusLabelsNl[assignment.status]}</Chip>
            <Badge status={priorityBadge[assignment.priority]}>{priorityLabels[assignment.priority]}</Badge>
            {assignment.importGoalCode && !assignment.goals.includes(assignment.importGoalCode) ? (
              <Badge status="neutral">
                Doel: {goals.find((g) => g.code === assignment.importGoalCode)?.label_nl ?? assignment.importGoalCode}{" "}
                (nog geen foto&apos;s)
              </Badge>
            ) : null}
          </div>
          <MagnificButton assignmentId={assignment.id} baseUrl={magnificBaseUrl} url={assignment.magnificUrl} />
        </div>
      </div>

      <div aria-label="Tabbladen" className="inline-flex w-fit rounded-md border border-border p-0.5" role="tablist">
        <TabButton active={tab === "opdracht"} onClick={() => setTab("opdracht")}>
          Opdracht
        </TabButton>
        <TabButton active={tab === "qc"} onClick={() => setTab("qc")}>
          QC {qcRounds.length > 0 ? `(${qcRounds.length})` : ""}
        </TabButton>
      </div>

      {tab === "opdracht" ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
          <div className="flex flex-col gap-4">
            <MetaPanel assignment={assignment} />
            <StatusPanel
              assignment={assignment}
              canManageStatus={canManageStatus}
              qcGuard={qcGuard}
            />
            {assignment.legacyNotes ? (
              <div>
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Notitie uit Excel
                </h2>
                <p className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  {assignment.legacyNotes}
                </p>
              </div>
            ) : null}
          </div>

          <GoalPhotosPanel
            assignmentId={assignment.id}
            editItems={editItems}
            goals={goals}
            maxPhotosPerProperty={maxPhotosPerProperty}
          />

          <AcademyContextPanel guidelines={guidelines} prompts={prompts} />
        </div>
      ) : (
        <QcHistory rounds={qcRounds} />
      )}
    </div>
  );
}

const statusChip = {
  backlog: "neutral",
  new: "neutral",
  in_process: "info",
  qc: "warning",
  approved: "success",
  denied: "critical",
  ai_rejected: "neutral",
} as const;

const priorityBadge = {
  high: "critical",
  medium: "warning",
  low: "neutral",
} as const;

function TabButton({
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
      className={cn(
        "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {children}
    </button>
  );
}

function MetaPanel({ assignment }: { assignment: AssignmentDetail }) {
  const formatter = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" });

  return (
    <dl className="grid gap-2.5 text-sm">
      <Row label="Verhuurexpert" value={assignment.rentalExpertName ?? "Onbekend"} />
      <Row label="Editor" value={assignment.editorName ?? "Niet toegewezen"} />
      <Row
        label="Aangevraagd"
        value={assignment.requestDate ? formatter.format(new Date(assignment.requestDate)) : "—"}
      />
      <Row
        label="Toegewezen"
        value={assignment.dateAssigned ? formatter.format(new Date(assignment.dateAssigned)) : "—"}
      />
      <Row
        label="Afgerond"
        value={assignment.completedDate ? formatter.format(new Date(assignment.completedDate)) : "—"}
      />
      {assignment.briefing ? (
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Briefing</dt>
          <dd className="mt-1 text-sm">{assignment.briefing}</dd>
        </div>
      ) : null}
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function StatusPanel({
  assignment,
  canManageStatus,
  qcGuard,
}: {
  assignment: AssignmentDetail;
  canManageStatus: boolean;
  qcGuard: { ok: boolean; message?: string };
}) {
  const [isPending, startTransition] = useTransition();

  function changeStatus(nextStatus: AssignmentStatus) {
    startTransition(async () => {
      const result = await updateAssignmentStatus(assignment.id, nextStatus);
      if (result.ok) toast.success("Status bijgewerkt.");
      else toast.error(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status wijzigen</h2>
      <div className="flex flex-wrap gap-2">
        {assignment.status === "new" ? (
          <Button disabled={isPending} onClick={() => changeStatus("in_process")} type="button">
            In behandeling
          </Button>
        ) : null}
        {assignment.status === "in_process" ? (
          <SelfCheckDialog
            disabled={!qcGuard.ok}
            disabledReason={qcGuard.message}
            onConfirm={() => updateAssignmentStatus(assignment.id, "qc")}
          />
        ) : null}
        {assignment.status === "qc" && canManageStatus ? (
          <Button
            disabled={isPending}
            onClick={() => changeStatus("in_process")}
            type="button"
            variant="secondary"
          >
            Terug naar in behandeling
          </Button>
        ) : null}
        {assignment.status === "denied" ? (
          <Button disabled={isPending} onClick={() => changeStatus("in_process")} type="button">
            Opnieuw oppakken
          </Button>
        ) : null}
      </div>
      {assignment.status === "in_process" && !qcGuard.ok ? (
        <p className="text-xs text-warning">{qcGuard.message}</p>
      ) : null}
    </div>
  );
}

function MagnificButton({
  assignmentId,
  url,
  baseUrl,
}: {
  assignmentId: string;
  url: string | null;
  baseUrl: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(url ?? "");
  const [isPending, startTransition] = useTransition();
  const resolvedUrl = url || baseUrl;

  function save() {
    startTransition(async () => {
      const result = await updateMagnificUrl(assignmentId, value.trim());
      if (result.ok) {
        toast.success("Magnific-link opgeslagen.");
        setEditing(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          aria-label="Magnific-URL"
          className="h-9 w-64 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25"
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://magnific.ai/project/…"
          type="url"
          value={value}
        />
        <Button disabled={isPending} onClick={save} size="sm" type="button">
          Opslaan
        </Button>
        <Button onClick={() => setEditing(false)} size="sm" type="button" variant="ghost">
          Annuleren
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button asChild disabled={!resolvedUrl}>
        <a href={resolvedUrl ?? undefined} rel="noreferrer" target="_blank">
          <ExternalLink aria-hidden="true" className="size-4" />
          Openen in Magnific
        </a>
      </Button>
      <button
        aria-label="Magnific-link bewerken"
        className="rounded-sm p-2 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => setEditing(true)}
        type="button"
      >
        <Pencil className="size-4" />
      </button>
    </div>
  );
}
