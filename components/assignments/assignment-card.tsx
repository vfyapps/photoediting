"use client";

import type { ComponentProps } from "react";
import { AlertTriangle } from "lucide-react";

import { Badge, Chip } from "@/components/ui/badge";
import type { AssignmentListItem, GoalOption } from "@/lib/assignments";
import { priorityLabels } from "@/lib/assignments";
import { cn } from "@/lib/utils";

type ChipStatus = NonNullable<ComponentProps<typeof Chip>["status"]>;
type BadgeStatus = NonNullable<ComponentProps<typeof Badge>["status"]>;

type AssignmentCardProps = {
  assignment: AssignmentListItem;
  goalLabels: Map<string, string>;
  selected: boolean;
  selectable: boolean;
  daysOpen: number;
  needsQcAttention: boolean;
  onSelect: (id: string, checked: boolean) => void;
};

// Status renders as a solid Chip, priority as a soft dotted Badge, so the two
// stay distinguishable at a glance (AGENTS.md, Design direction). Both map onto
// the semantic tokens only — no hue outside globals.css.
const statusChip: Record<AssignmentListItem["status"], ChipStatus> = {
  backlog: "neutral",
  new: "neutral",
  in_process: "info",
  qc: "warning",
  approved: "success",
  denied: "critical",
  ai_rejected: "neutral",
};

const priorityBadge: Record<AssignmentListItem["priority"], BadgeStatus> = {
  high: "critical",
  medium: "warning",
  low: "neutral",
};

export function createGoalLabels(goals: GoalOption[]) {
  return new Map(goals.map((goal) => [goal.code, goal.label_nl]));
}

export function AssignmentCard({
  assignment,
  goalLabels,
  selected,
  selectable,
  daysOpen,
  needsQcAttention,
  onSelect,
}: AssignmentCardProps) {
  const editorName = assignment.editorName ?? "Niet toegewezen";
  const displayedGoals = assignment.goals.slice(0, 2).map((goal) => goalLabels.get(goal) ?? goal);
  const extraGoals = assignment.goals.length - displayedGoals.length;

  return (
    <article
      className={cn(
        "group flex min-w-0 items-center gap-2 border-b px-3 py-2.5 last:border-b-0 hover:bg-muted/40",
        selected && "bg-accent",
        needsQcAttention && "bg-warning-tint hover:bg-warning-tint",
      )}
    >
      {selectable ? (
        <input
          aria-label={`Selecteer opdracht ${assignment.accoId}`}
          checked={selected}
          className="size-3.5 shrink-0 rounded-sm border-input accent-primary"
          onChange={(event) => onSelect(assignment.id, event.target.checked)}
          type="checkbox"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold">{assignment.accoId}</h3>
          <span className="truncate text-xs text-muted-foreground">
            {assignment.rentalExpertName ?? "Onbekend"}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {assignment.photoCount} {assignment.photoCount === 1 ? "foto" : "foto's"}
          {displayedGoals.length > 0 ? ` · ${displayedGoals.join(", ")}` : ""}
          {extraGoals > 0 ? ` +${extraGoals}` : ""}
        </p>
      </div>

      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        <StatusBadge status={assignment.status} />
        <PriorityBadge priority={assignment.priority} />
      </div>

      <div className="hidden min-w-0 shrink-0 items-center gap-1.5 md:flex">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted font-mono text-[9px] font-semibold text-muted-foreground">
          {initials(editorName)}
        </span>
        <span className="max-w-24 truncate text-xs text-muted-foreground">
          {editorName}
        </span>
      </div>

      <div className="flex w-10 shrink-0 items-center justify-end gap-1 text-right text-xs tabular-nums">
        {needsQcAttention ? (
          <AlertTriangle
            aria-label="QC wacht langer dan ingesteld"
            className="size-3.5 text-warning"
          />
        ) : null}
        <span className={ageColorClassName(daysOpen)}>{daysOpen}d</span>
      </div>
    </article>
  );
}

export function StatusBadge({ status }: { status: AssignmentListItem["status"] }) {
  return <Chip status={statusChip[status]}>{status}</Chip>;
}

// Alleen Hoog krijgt een gekleurde badge. Op het bord draagt vrijwel elke
// kaart "Gemiddeld" — als alles opvalt, valt niets meer op (BUILDPLAN-V4
// §WP3.1). Gemiddeld wordt een stil stipje met tooltip, Laag toont niets.
export function PriorityBadge({ priority }: { priority: AssignmentListItem["priority"] }) {
  if (priority === "high") {
    return <Badge status={priorityBadge[priority]}>{priorityLabels[priority]}</Badge>;
  }
  if (priority === "medium") {
    return (
      <span
        aria-label={priorityLabels.medium}
        className="size-1.5 shrink-0 rounded-full bg-warning/60"
        title={priorityLabels.medium}
      />
    );
  }
  return null;
}

const ageThresholds = { warn: 30, critical: 90 };

// Leeftijd kleurt vanaf een drempel, zodat "213d" opvalt naast "2d" zonder
// er nog een badge bij te zetten (BUILDPLAN-V4 §WP3.2).
export function ageColorClassName(days: number) {
  if (days > ageThresholds.critical) return "text-destructive font-semibold";
  if (days > ageThresholds.warn) return "text-warning";
  return "text-muted-foreground";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
