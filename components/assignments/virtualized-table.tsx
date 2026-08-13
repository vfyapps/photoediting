"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight } from "lucide-react";

import { PriorityBadge, StatusBadge } from "@/components/assignments/assignment-card";
import { EditItemsChecklist } from "@/components/assignments/edit-items-checklist";
import { ProgressBar } from "@/components/assignments/progress-bar";
import { avatarColorVar } from "@/lib/avatar-color";
import type { AssignmentListItem, EditItem, GroupMode } from "@/lib/assignments";
import { cn } from "@/lib/utils";

export type AssignmentGroup = {
  key: string;
  label: string;
  assignments: AssignmentListItem[];
};

type Row =
  | { type: "header"; key: string; group: AssignmentGroup }
  | { type: "assignment"; key: string; assignment: AssignmentListItem }
  | { type: "photos"; key: string; assignment: AssignmentListItem };

/**
 * 352 opdrachten is ruim boven de 50-rijen-drempel uit vfy-app-design, dus
 * dit is een echte @tanstack/react-virtual-tabel, geen kaartenlijst. Rijen
 * hebben variabele hoogte (uitgeklapte foto's), dus dynamische meting i.p.v.
 * een vaste estimateSize.
 */
export function VirtualizedTable({
  groups,
  group,
  goalLabels,
  editItemsByAssignment,
  canBulkManage,
  selectedIds,
  setSelectedIds,
  toggleSelection,
  qcReminderDays,
  today,
  allAssignments,
}: {
  groups: AssignmentGroup[];
  group: GroupMode;
  goalLabels: Map<string, string>;
  editItemsByAssignment: Map<string, EditItem[]>;
  canBulkManage: boolean;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  toggleSelection: (id: string, checked: boolean) => void;
  qcReminderDays: number;
  today: string;
  allAssignments: AssignmentListItem[];
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);
  const allSelected = allAssignments.length > 0 && selectedIds.size === allAssignments.length;

  const rows = useMemo(() => {
    const flat: Row[] = [];
    groups.forEach((assignmentGroup) => {
      flat.push({ type: "header", key: `h-${assignmentGroup.key}`, group: assignmentGroup });
      assignmentGroup.assignments.forEach((assignment) => {
        flat.push({ type: "assignment", key: assignment.id, assignment });
        if (expandedIds.has(assignment.id)) {
          flat.push({ type: "photos", key: `p-${assignment.id}`, assignment });
        }
      });
    });
    return flat;
  }, [groups, expandedIds]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (rows[index]?.type === "assignment" ? 52 : rows[index]?.type === "header" ? 33 : 140),
    overscan: 8,
  });

  function toggleExpanded(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-md border border-border">
      <div className="flex border-b border-border bg-muted/30 text-left text-xs font-medium text-muted-foreground">
        {canBulkManage ? (
          <div className="flex w-10 shrink-0 items-center px-3 py-2">
            <input
              aria-label="Selecteer alle zichtbare opdrachten"
              checked={allSelected}
              className="size-3.5 rounded-sm border-input accent-primary"
              onChange={(event) =>
                setSelectedIds(
                  event.target.checked ? new Set(allAssignments.map(({ id }) => id)) : new Set(),
                )
              }
              type="checkbox"
            />
          </div>
        ) : null}
        <div className="w-6 shrink-0 px-1 py-2" />
        <div className="flex-1 px-3 py-2">Opdracht</div>
        <div className="w-48 shrink-0 px-3 py-2">Workflow</div>
        <div className="w-40 shrink-0 px-3 py-2">Editor</div>
        <div className="w-40 shrink-0 px-3 py-2">Voortgang</div>
        <div className="w-16 shrink-0 px-3 py-2 text-right">Open</div>
      </div>

      <div className="max-h-[70vh] overflow-auto" ref={parentRef}>
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            return (
              <div
                className="absolute left-0 top-0 w-full"
                data-index={virtualRow.index}
                key={row.key}
                ref={virtualizer.measureElement}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.type === "header" ? (
                  <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-3 py-1.5 text-xs font-medium">
                    {group === "status" ? (
                      <StatusBadge status={row.group.label as AssignmentListItem["status"]} />
                    ) : (
                      <span>{row.group.label}</span>
                    )}
                    <span className="text-muted-foreground">{row.group.assignments.length}</span>
                  </div>
                ) : row.type === "assignment" ? (
                  <TableRow
                    assignment={row.assignment}
                    canBulkManage={canBulkManage}
                    editItems={editItemsByAssignment.get(row.assignment.id) ?? []}
                    expanded={expandedIds.has(row.assignment.id)}
                    goalLabels={goalLabels}
                    onExpand={() => toggleExpanded(row.assignment.id)}
                    onSelect={toggleSelection}
                    qcReminderDays={qcReminderDays}
                    selected={selectedIds.has(row.assignment.id)}
                    today={today}
                  />
                ) : (
                  <div className="border-b border-border bg-muted/10 pl-16">
                    <EditItemsChecklist
                      goalLabels={goalLabels}
                      items={editItemsByAssignment.get(row.assignment.id) ?? []}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TableRow({
  assignment,
  goalLabels,
  editItems,
  canBulkManage,
  selected,
  onSelect,
  expanded,
  onExpand,
  qcReminderDays,
  today,
}: {
  assignment: AssignmentListItem;
  goalLabels: Map<string, string>;
  editItems: EditItem[];
  canBulkManage: boolean;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  expanded: boolean;
  onExpand: () => void;
  qcReminderDays: number;
  today: string;
}) {
  const days = daysBetween(assignment.requestDate ?? assignment.createdAt, assignment.completedDate ?? today);
  const needsQcAttention = assignment.status === "qc" && days > qcReminderDays;
  const editorName = assignment.editorName ?? "Niet toegewezen";
  const done = editItems.filter((item) => item.done).length;
  const total = editItems.length || assignment.photoCount;
  const displayedGoals = assignment.goals.slice(0, 2).map((code) => goalLabels.get(code) ?? code);
  const extraGoals = assignment.goals.length - displayedGoals.length;

  return (
    <div
      className={cn(
        "flex items-center border-b border-border text-sm last:border-b-0 hover:bg-muted/30",
        selected && "bg-accent",
        needsQcAttention && "bg-warning-tint hover:bg-warning-tint",
      )}
    >
      {canBulkManage ? (
        <div className="flex w-10 shrink-0 items-center px-3 py-2.5">
          <input
            aria-label={`Selecteer opdracht ${assignment.accoId}`}
            checked={selected}
            className="size-3.5 rounded-sm border-input accent-primary"
            onChange={(event) => onSelect(assignment.id, event.target.checked)}
            type="checkbox"
          />
        </div>
      ) : null}
      <div className="w-6 shrink-0 px-1">
        {editItems.length > 0 ? (
          <button
            aria-expanded={expanded}
            aria-label={expanded ? "Foto's verbergen" : "Foto's tonen"}
            className="grid size-6 place-items-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            onClick={onExpand}
            type="button"
          >
            <ChevronRight className={cn("size-3.5 transition-transform duration-fast", expanded && "rotate-90")} />
          </button>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{assignment.accoId}</span>
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
      <div className="w-48 shrink-0 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={assignment.status} />
          <PriorityBadge priority={assignment.priority} />
        </div>
      </div>
      <div className="w-40 shrink-0 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="grid size-5 shrink-0 place-items-center rounded-full border-2 bg-muted font-mono text-[9px] font-semibold text-muted-foreground"
            style={{ borderColor: avatarColorVar(editorName) }}
          >
            {initials(editorName)}
          </span>
          <span className="truncate text-xs text-muted-foreground">{editorName}</span>
        </div>
      </div>
      <div className="w-40 shrink-0 px-3 py-2.5">
        {total > 0 ? <ProgressBar done={done} total={total} /> : null}
      </div>
      <div className="w-16 shrink-0 px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
        {needsQcAttention ? <span className="mr-1 text-warning">!</span> : null}
        {days}d
      </div>
    </div>
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
