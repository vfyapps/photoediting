"use client";

import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AssignmentListItem, GoalOption } from "@/lib/assignments";
import { priorityLabels } from "@/lib/assignments";
import { cn } from "@/lib/utils";

type AssignmentCardProps = {
  assignment: AssignmentListItem;
  goalLabels: Map<string, string>;
  selected: boolean;
  selectable: boolean;
  daysOpen: number;
  needsQcAttention: boolean;
  onSelect: (id: string, checked: boolean) => void;
};

const statusClasses = {
  backlog: "border-slate-200 bg-slate-50 text-slate-500",
  new: "border-slate-300 bg-slate-100 text-slate-700",
  in_process: "border-violet-200 bg-violet-50 text-violet-700",
  qc: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  denied: "border-red-200 bg-red-50 text-red-700",
  ai_rejected: "border-slate-300 bg-slate-100 text-slate-600",
} as const;

const priorityClasses = {
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
} as const;

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
        selected && "bg-teal-50/70",
        needsQcAttention && "bg-amber-50/70 hover:bg-amber-50",
      )}
    >
      {selectable ? (
        <input
          aria-label={`Selecteer opdracht ${assignment.accoId}`}
          checked={selected}
          className="size-3.5 shrink-0 rounded border-input accent-[#1D9E75]"
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
        <Badge className={statusClasses[assignment.status]} variant="outline">
          {assignment.status}
        </Badge>
        <Badge className={priorityClasses[assignment.priority]} variant="outline">
          {priorityLabels[assignment.priority]}
        </Badge>
      </div>

      <div className="hidden min-w-0 shrink-0 items-center gap-1.5 md:flex">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-700">
          {initials(editorName)}
        </span>
        <span className="max-w-24 truncate text-xs text-muted-foreground">
          {editorName}
        </span>
      </div>

      <div className="flex w-10 shrink-0 items-center justify-end gap-1 text-right text-xs tabular-nums text-muted-foreground">
        {needsQcAttention ? (
          <AlertTriangle
            aria-label="QC wacht langer dan ingesteld"
            className="size-3.5 text-amber-600"
          />
        ) : null}
        <span>{daysOpen}d</span>
      </div>
    </article>
  );
}

export function StatusBadge({ status }: { status: AssignmentListItem["status"] }) {
  return (
    <Badge className={statusClasses[status]} variant="outline">
      {status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: AssignmentListItem["priority"] }) {
  return (
    <Badge className={priorityClasses[priority]} variant="outline">
      {priorityLabels[priority]}
    </Badge>
  );
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
