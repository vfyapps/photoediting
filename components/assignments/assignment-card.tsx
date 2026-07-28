"use client";

import { AlertTriangle, Camera, Clock3, UserRound } from "lucide-react";

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
  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        selected && "border-primary ring-2 ring-primary/10",
        needsQcAttention && "border-amber-400 bg-amber-50/60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {selectable ? (
            <input
              aria-label={`Selecteer opdracht ${assignment.accoId}`}
              checked={selected}
              className="size-4 rounded border-input accent-foreground"
              onChange={(event) => onSelect(assignment.id, event.target.checked)}
              type="checkbox"
            />
          ) : null}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Acco ID
            </p>
            <h3 className="text-base font-bold tracking-tight">
              {assignment.accoId}
            </h3>
          </div>
        </div>
        <Badge
          className={cn(
            assignment.priority === "high" &&
              "border-red-200 bg-red-50 text-red-700",
            assignment.priority === "medium" &&
              "border-amber-200 bg-amber-50 text-amber-700",
            assignment.priority === "low" &&
              "border-slate-200 bg-slate-50 text-slate-600",
          )}
          variant="outline"
        >
          {priorityLabels[assignment.priority]}
        </Badge>
      </div>

      {needsQcAttention ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
          <AlertTriangle className="size-4" />
          QC wacht langer dan ingesteld
        </div>
      ) : null}

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserRound className="size-4 shrink-0" />
          <dt className="sr-only">Editor</dt>
          <dd className="truncate">
            {assignment.editorName ?? "Niet toegewezen"}
          </dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="flex size-4 shrink-0 items-center justify-center text-xs font-bold">
            V
          </span>
          <dt className="sr-only">Verhuurexpert</dt>
          <dd className="truncate">
            {assignment.rentalExpertName ?? "Onbekend"}
          </dd>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Camera className="size-4" />
            <dt className="sr-only">Foto&apos;s</dt>
            <dd>{assignment.photoCount}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="size-4" />
            <dt className="sr-only">Dagen open</dt>
            <dd>{daysOpen} d</dd>
          </div>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {assignment.goals.length > 0 ? (
          assignment.goals.map((goal) => (
            <Badge key={goal} variant="secondary">
              {goalLabels.get(goal) ?? goal}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">Geen editing goals</span>
        )}
      </div>
    </article>
  );
}
