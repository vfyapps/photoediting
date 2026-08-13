"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AlertTriangle, ChevronDown } from "lucide-react";

import { PriorityBadge } from "@/components/assignments/assignment-card";
import { EditItemsChecklist } from "@/components/assignments/edit-items-checklist";
import { ProgressBar } from "@/components/assignments/progress-bar";
import { avatarColorVar } from "@/lib/avatar-color";
import type { AssignmentListItem, AssignmentStatus, EditItem } from "@/lib/assignments";
import { boardStatuses } from "@/lib/assignments";
import { cn } from "@/lib/utils";

const statusLabels: Record<AssignmentStatus, string> = {
  backlog: "Backlog",
  new: "Nieuw",
  in_process: "In behandeling",
  qc: "QC",
  approved: "Goedgekeurd",
  denied: "Afgekeurd",
  ai_rejected: "AI afgewezen",
};

// Editors mogen alleen naar deze twee kolommen slepen (AGENTS.md, Status
// flow: "Editor mag zetten: in_process, qc"). Coordinator/admin mag alle
// vier — RLS blokkeert een niet-toegestane write alsnog als laatste vangnet.
const editorDroppableStatuses = new Set<AssignmentStatus>(["in_process", "qc"]);

export function Board({
  assignments,
  goalLabels,
  editItemsByAssignment,
  isCoordinator,
  qcReminderDays,
  today,
  selectedIds,
  canBulkManage,
  onSelect,
  onStatusChange,
}: {
  assignments: AssignmentListItem[];
  goalLabels: Map<string, string>;
  editItemsByAssignment: Map<string, EditItem[]>;
  isCoordinator: boolean;
  qcReminderDays: number;
  today: string;
  selectedIds: Set<string>;
  canBulkManage: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onStatusChange: (assignmentId: string, nextStatus: AssignmentStatus) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    const nextStatus = event.over?.id as AssignmentStatus | undefined;
    const assignmentId = event.active.id as string;
    if (!nextStatus) return;
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (!assignment || assignment.status === nextStatus) return;
    onStatusChange(assignmentId, nextStatus);
  }

  const groups = boardStatuses.map((status) => ({
    key: status,
    label: statusLabels[status],
    assignments: assignments.filter((assignment) => assignment.status === status),
  }));

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="overflow-x-auto pb-3">
        <div className="flex min-w-max items-start gap-3">
          {groups.map((group) => {
            const status = group.key as AssignmentStatus;
            const droppable = isCoordinator || editorDroppableStatuses.has(status);
            return (
              <BoardColumn droppable={droppable} key={status} status={status}>
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
                  <span className="text-sm font-medium">{group.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {group.assignments.length}
                  </span>
                </div>
                {!droppable ? (
                  <p className="border-b border-border bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
                    Alleen coördinator kan hierheen zetten
                  </p>
                ) : null}
                <div className="min-h-24">
                  {group.assignments.length === 0 ? (
                    <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                      Geen opdrachten
                    </p>
                  ) : (
                    group.assignments.map((assignment) => (
                      <BoardCard
                        assignment={assignment}
                        canBulkManage={canBulkManage}
                        editItems={editItemsByAssignment.get(assignment.id) ?? []}
                        goalLabels={goalLabels}
                        key={assignment.id}
                        onSelect={onSelect}
                        qcReminderDays={qcReminderDays}
                        selected={selectedIds.has(assignment.id)}
                        today={today}
                      />
                    ))
                  )}
                </div>
              </BoardColumn>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}

function BoardColumn({
  status,
  droppable,
  children,
}: {
  status: AssignmentStatus;
  droppable: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: !droppable });

  return (
    <section
      className={cn(
        "w-[330px] shrink-0 rounded-md border border-border bg-background transition-colors duration-fast ease-standard",
        droppable && isOver && "border-primary bg-accent/40",
        !droppable && "opacity-90",
      )}
      ref={setNodeRef}
    >
      {children}
    </section>
  );
}

function BoardCard({
  assignment,
  goalLabels,
  editItems,
  selected,
  canBulkManage,
  onSelect,
  qcReminderDays,
  today,
}: {
  assignment: AssignmentListItem;
  goalLabels: Map<string, string>;
  editItems: EditItem[];
  selected: boolean;
  canBulkManage: boolean;
  onSelect: (id: string, checked: boolean) => void;
  qcReminderDays: number;
  today: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: assignment.id,
  });
  const days = daysBetween(assignment.requestDate ?? assignment.createdAt, assignment.completedDate ?? today);
  const needsQcAttention = assignment.status === "qc" && days > qcReminderDays;
  const editorName = assignment.editorName ?? "Niet toegewezen";
  const done = editItems.filter((item) => item.done).length;
  const total = editItems.length || assignment.photoCount;

  return (
    <article
      className={cn(
        "border-b border-border last:border-b-0",
        selected && "bg-accent",
        needsQcAttention && "bg-warning-tint",
        isDragging && "opacity-50",
      )}
      style={transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined}
    >
      <div className="flex items-start gap-2 px-3 py-2.5">
        {canBulkManage ? (
          <input
            aria-label={`Selecteer opdracht ${assignment.accoId}`}
            checked={selected}
            className="mt-1 size-3.5 shrink-0 rounded-sm border-input accent-primary"
            onChange={(event) => onSelect(assignment.id, event.target.checked)}
            type="checkbox"
          />
        ) : null}
        <button
          aria-label={`Sleep opdracht ${assignment.accoId} naar een andere status`}
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded-sm text-muted-foreground/50 hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring active:cursor-grabbing"
          ref={setNodeRef}
          type="button"
          {...listeners}
          {...attributes}
        >
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
            <circle cx="5" cy="4" fill="currentColor" r="1.3" />
            <circle cx="5" cy="8" fill="currentColor" r="1.3" />
            <circle cx="5" cy="12" fill="currentColor" r="1.3" />
            <circle cx="11" cy="4" fill="currentColor" r="1.3" />
            <circle cx="11" cy="8" fill="currentColor" r="1.3" />
            <circle cx="11" cy="12" fill="currentColor" r="1.3" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                className="truncate text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                href={`/opdrachten/${assignment.id}`}
              >
                {assignment.accoId}
              </Link>
              <span className="truncate text-xs text-muted-foreground">
                {assignment.rentalExpertName ?? "Onbekend"}
              </span>
            </div>
            <PriorityBadge priority={assignment.priority} />
          </div>

          {total > 0 ? <ProgressBar className="mt-2" done={done} total={total} /> : null}

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className="grid size-5 shrink-0 place-items-center rounded-full border-2 bg-muted font-mono text-[9px] font-semibold text-muted-foreground"
                style={{ borderColor: avatarColorVar(editorName) }}
              >
                {initials(editorName)}
              </span>
              <span className="max-w-28 truncate text-xs text-muted-foreground">{editorName}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
              {needsQcAttention ? (
                <AlertTriangle aria-label="QC wacht langer dan ingesteld" className="size-3.5 text-warning" />
              ) : null}
              {days}d
            </div>
          </div>

          {editItems.length > 0 ? (
            <button
              aria-expanded={expanded}
              className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              onClick={() => setExpanded((value) => !value)}
              type="button"
            >
              <ChevronDown className={cn("size-3 transition-transform duration-fast", expanded && "rotate-180")} />
              Foto&apos;s {expanded ? "verbergen" : "tonen"}
            </button>
          ) : null}
        </div>
      </div>
      {expanded ? <EditItemsChecklist goalLabels={goalLabels} items={editItems} /> : null}
    </article>
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

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start.slice(0, 10)}T00:00:00Z`);
  const endDate = new Date(`${end.slice(0, 10)}T00:00:00Z`);
  return Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000));
}
