"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Columns3,
  FilterX,
  List,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { initialBulkActionState } from "@/app/assignment-bulk-state";
import { updateAssignmentsBulk } from "@/app/actions";
import {
  AssignmentCard,
  createGoalLabels,
  PriorityBadge,
  StatusBadge,
} from "@/components/assignments/assignment-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  assignmentStatuses,
  type AssignmentFilters,
  type AssignmentListItem,
  type EditorOption,
  type GoalOption,
  type GroupMode,
  priorities,
  priorityLabels,
  type RentalExpertOption,
  type ViewMode,
} from "@/lib/assignments";
import { cn } from "@/lib/utils";

type AssignmentsScreenProps = {
  assignments: AssignmentListItem[];
  editors: EditorOption[];
  assignableEditors: EditorOption[];
  rentalExperts: RentalExpertOption[];
  goals: GoalOption[];
  filters: AssignmentFilters;
  view: ViewMode;
  group: GroupMode;
  canBulkManage: boolean;
  currentEditorName: string | null;
  qcReminderDays: number;
  today: string;
};

type AssignmentGroup = {
  key: string;
  label: string;
  assignments: AssignmentListItem[];
};

const inputClassName =
  "h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/25";

const openStatuses = new Set(["new", "in_process", "qc", "denied"]);
const archiveStatuses = new Set(["approved", "ai_rejected"]);

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start.slice(0, 10)}T00:00:00Z`);
  const endDate = new Date(`${end.slice(0, 10)}T00:00:00Z`);
  return Math.max(
    0,
    Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000),
  );
}

function getDaysOpen(assignment: AssignmentListItem, today: string) {
  return daysBetween(
    assignment.requestDate ?? assignment.createdAt,
    assignment.completedDate ?? today,
  );
}

export function AssignmentsScreen({
  assignments,
  editors,
  assignableEditors,
  rentalExperts,
  goals,
  filters,
  view,
  group,
  canBulkManage,
  currentEditorName,
  qcReminderDays,
  today,
}: AssignmentsScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const runBulkAction = useCallback(
    async (previousState: typeof initialBulkActionState, formData: FormData) => {
      const nextState = await updateAssignmentsBulk(previousState, formData);
      if (nextState.status === "success") setSelectedIds(new Set());
      return nextState;
    },
    [],
  );
  const [bulkState, bulkAction, isBulkPending] = useActionState(
    runBulkAction,
    initialBulkActionState,
  );
  const goalLabels = useMemo(() => createGoalLabels(goals), [goals]);

  const replaceParams = useCallback(
    (changes: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined) return;
        if (value) next.set(key, value);
        else next.delete(key);
      });
      const query = next.toString();
      startNavigation(() => router.replace(query ? `${pathname}?${query}` : pathname));
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (searchDraft === filters.search) return;
    const timeout = window.setTimeout(
      () => replaceParams({ q: searchDraft.trim() || null }),
      350,
    );
    return () => window.clearTimeout(timeout);
  }, [filters.search, replaceParams, searchDraft]);

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const activeFilterCount = [
    filters.status,
    filters.editor,
    filters.expert,
    filters.priority,
    filters.goal,
    filters.search,
    filters.mine,
    filters.qcOverdue,
  ].filter(Boolean).length;
  const groups = groupAssignments(assignments, group, filters);

  const clearFilters = () =>
    replaceParams({
      status: null,
      editor: null,
      expert: null,
      priority: null,
      goal: null,
      q: null,
      mine: null,
      qc_overdue: null,
    });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              VfY Fotobewerking
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <h1 className="text-xl font-semibold tracking-tight">Opdrachten</h1>
              <span className="text-sm text-muted-foreground">
                {assignments.length} {assignments.length === 1 ? "opdracht" : "opdrachten"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              label="Weergave"
              onChange={(nextView) => replaceParams({ view: nextView })}
              options={[
                { icon: Columns3, label: "Bord", value: "board" },
                { icon: List, label: "Tabel", value: "table" },
              ]}
              value={view}
            />
            <SegmentedControl
              label="Groeperen"
              onChange={(nextGroup) => replaceParams({ group: nextGroup })}
              options={[
                { icon: Columns3, label: "Status", value: "status" },
                { icon: UserRound, label: "Editor", value: "editor" },
              ]}
              value={group}
            />
          </div>
        </header>

        <section className="border-b py-3">
          <div className="flex flex-wrap items-center gap-2">
            <QuickFilter
              active={filters.mine}
              disabled={!currentEditorName}
              label="Mijn opdrachten"
              onClick={() =>
                replaceParams({
                  mine: filters.mine ? null : "1",
                  editor: filters.mine ? undefined : null,
                })
              }
            />
            <QuickFilter
              active={filters.priority === "high"}
              label="Hoge prioriteit"
              onClick={() =>
                replaceParams({ priority: filters.priority === "high" ? null : "high" })
              }
            />
            <QuickFilter
              active={filters.qcOverdue}
              label={`Langer dan ${qcReminderDays} dagen in QC`}
              onClick={() =>
                replaceParams({
                  qc_overdue: filters.qcOverdue ? null : "1",
                  status: filters.qcOverdue ? null : "qc",
                })
              }
            />
            {!currentEditorName ? (
              <span className="text-xs text-muted-foreground">
                Mijn opdrachten is beschikbaar zodra je aan een editorprofiel bent gekoppeld.
              </span>
            ) : null}
          </div>
        </section>

        <section className="border-b py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SlidersHorizontal className="size-4" /> Filters
              {activeFilterCount > 0 ? <Badge variant="secondary">{activeFilterCount}</Badge> : null}
            </div>
            {activeFilterCount > 0 ? (
              <Button onClick={clearFilters} size="sm" variant="ghost">
                <FilterX className="size-4" /> Wissen
              </Button>
            ) : null}
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(5,minmax(130px,1fr))]">
            <label className="relative">
              <span className="sr-only">Zoeken op acco ID</span>
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <input
                className={cn(inputClassName, "w-full pl-8")}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Zoek op acco ID"
                type="search"
                value={searchDraft}
              />
            </label>
            <FilterSelect
              label="Status"
              onChange={(value) =>
                replaceParams({
                  status: value || null,
                  backlog: value === "backlog" ? "1" : undefined,
                  archive:
                    value === "approved" || value === "ai_rejected" ? "1" : undefined,
                })
              }
              options={assignmentStatuses.map((status) => ({ label: status, value: status }))}
              value={filters.status}
            />
            <FilterSelect
              label="Editor"
              onChange={(value) => replaceParams({ editor: value || null, mine: null })}
              options={editors.map((editor) => ({ label: editor.name, value: editor.name }))}
              value={filters.editor}
            />
            <FilterSelect
              label="Verhuurexpert"
              onChange={(value) => replaceParams({ expert: value || null })}
              options={rentalExperts.map((expert) => ({ label: expert.name, value: expert.name }))}
              value={filters.expert}
            />
            <FilterSelect
              label="Prioriteit"
              onChange={(value) => replaceParams({ priority: value || null })}
              options={priorities.map((priority) => ({
                label: priorityLabels[priority],
                value: priority,
              }))}
              value={filters.priority}
            />
            <FilterSelect
              label="Editing goal"
              onChange={(value) => replaceParams({ goal: value || null })}
              options={goals.map((goal) => ({ label: goal.label_nl, value: goal.code }))}
              value={filters.goal}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <Toggle
              checked={filters.showArchive}
              label="Archief tonen"
              onChange={(checked) => replaceParams({ archive: checked ? "1" : null })}
            />
            <Toggle
              checked={filters.showBacklog}
              label="Backlog tonen"
              onChange={(checked) =>
                replaceParams({
                  backlog: checked ? "1" : null,
                  status: !checked && filters.status === "backlog" ? null : undefined,
                })
              }
            />
          </div>
        </section>

        <div
          className={cn(
            "pt-4 transition-opacity",
            isNavigating && "pointer-events-none opacity-60",
          )}
        >
          {assignments.length === 0 ? (
            <div className="border border-dashed px-6 py-14 text-center">
              <h2 className="font-medium">Geen opdrachten gevonden</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pas de filters aan of toon ook het archief of de backlog.
              </p>
            </div>
          ) : view === "board" ? (
            <div className="overflow-x-auto pb-3">
              <div className="flex min-w-max items-start gap-3">
                {groups.map((assignmentGroup) => (
                  <section className="w-[330px] border bg-background" key={assignmentGroup.key}>
                    <GroupHeader assignmentGroup={assignmentGroup} group={group} />
                    <div>
                      {assignmentGroup.assignments.length > 0 ? (
                        assignmentGroup.assignments.map((assignment) => (
                          <AssignmentCard
                            assignment={assignment}
                            daysOpen={getDaysOpen(assignment, today)}
                            goalLabels={goalLabels}
                            key={assignment.id}
                            needsQcAttention={
                              assignment.status === "qc" &&
                              getDaysOpen(assignment, today) > qcReminderDays
                            }
                            onSelect={toggleSelection}
                            selectable={canBulkManage}
                            selected={selectedIds.has(assignment.id)}
                          />
                        ))
                      ) : (
                        <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                          Geen opdrachten
                        </p>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <CompactTable
              assignments={assignments}
              canBulkManage={canBulkManage}
              goalLabels={goalLabels}
              groups={groups}
              group={group}
              qcReminderDays={qcReminderDays}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              today={today}
              toggleSelection={toggleSelection}
            />
          )}
        </div>

        {canBulkManage && selectedIds.size > 0 ? (
          <form
            action={bulkAction}
            className="sticky bottom-3 z-20 mt-4 flex flex-col gap-2 border bg-background p-3 sm:flex-row sm:items-end"
          >
            {[...selectedIds].map((id) => (
              <input key={id} name="assignmentId" type="hidden" value={id} />
            ))}
            <div className="min-w-28 text-sm font-medium">{selectedIds.size} geselecteerd</div>
            <label className="grid flex-1 gap-1 text-xs font-medium text-muted-foreground">
              Toewijzen aan editor
              <select className={inputClassName} defaultValue="" name="editorId">
                <option disabled value="">Kies editor</option>
                {assignableEditors.map((editor) => (
                  <option key={editor.id} value={editor.id}>{editor.name}</option>
                ))}
              </select>
            </label>
            <Button disabled={isBulkPending} name="operation" type="submit" value="assign">
              Toewijzen
            </Button>
            <label className="grid flex-1 gap-1 text-xs font-medium text-muted-foreground">
              Prioriteit wijzigen
              <select className={inputClassName} defaultValue="" name="priority">
                <option disabled value="">Kies prioriteit</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priorityLabels[priority]}</option>
                ))}
              </select>
            </label>
            <Button disabled={isBulkPending} name="operation" type="submit" value="priority">
              Wijzigen
            </Button>
            <Button onClick={() => setSelectedIds(new Set())} variant="ghost">Annuleren</Button>
            {bulkState.message ? (
              <p
                aria-live="polite"
                className={cn(
                  "text-xs",
                  bulkState.status === "error" && "text-red-700",
                  bulkState.status === "success" && "text-emerald-700",
                )}
              >
                {bulkState.message}
              </p>
            ) : null}
          </form>
        ) : null}
      </div>
    </main>
  );
}

function groupAssignments(
  assignments: AssignmentListItem[],
  group: GroupMode,
  filters: AssignmentFilters,
): AssignmentGroup[] {
  if (group === "editor") {
    const grouped = new Map<string, AssignmentListItem[]>();
    assignments.forEach((assignment) => {
      const label = assignment.editorName ?? "Niet toegewezen";
      grouped.set(label, [...(grouped.get(label) ?? []), assignment]);
    });
    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right, "nl"))
      .map(([label, groupedAssignments]) => ({
        key: `editor-${label}`,
        label,
        assignments: groupedAssignments,
      }));
  }

  const availableStatuses = assignmentStatuses.filter((status) => {
    if (filters.status) return status === filters.status;
    if (status === "backlog") return filters.showBacklog;
    if (archiveStatuses.has(status)) return filters.showArchive;
    return openStatuses.has(status);
  });
  return availableStatuses.map((status) => ({
    key: status,
    label: status,
    assignments: assignments.filter((assignment) => assignment.status === status),
  }));
}

function GroupHeader({
  assignmentGroup,
  group,
}: {
  assignmentGroup: AssignmentGroup;
  group: GroupMode;
}) {
  return (
    <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-2">
        {group === "status" ? (
          <StatusBadge status={assignmentGroup.label as AssignmentListItem["status"]} />
        ) : (
          <span className="text-sm font-medium">{assignmentGroup.label}</span>
        )}
      </div>
      <Badge variant="secondary">{assignmentGroup.assignments.length}</Badge>
    </div>
  );
}

function CompactTable({
  assignments,
  groups,
  group,
  goalLabels,
  canBulkManage,
  selectedIds,
  setSelectedIds,
  toggleSelection,
  qcReminderDays,
  today,
}: {
  assignments: AssignmentListItem[];
  groups: AssignmentGroup[];
  group: GroupMode;
  goalLabels: Map<string, string>;
  canBulkManage: boolean;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  toggleSelection: (id: string, checked: boolean) => void;
  qcReminderDays: number;
  today: string;
}) {
  const allSelected = assignments.length > 0 && selectedIds.size === assignments.length;

  return (
    <div className="overflow-x-auto border">
      <table className="w-full min-w-[780px] border-collapse text-sm">
        <thead className="border-b bg-muted/30 text-left text-xs font-medium text-muted-foreground">
          <tr>
            {canBulkManage ? (
              <th className="w-10 px-3 py-2">
                <input
                  aria-label="Selecteer alle zichtbare opdrachten"
                  checked={allSelected}
                  className="size-3.5 accent-[#1D9E75]"
                  onChange={(event) =>
                    setSelectedIds(
                      event.target.checked
                        ? new Set(assignments.map(({ id }) => id))
                        : new Set(),
                    )
                  }
                  type="checkbox"
                />
              </th>
            ) : null}
            <th className="px-3 py-2">Opdracht</th>
            <th className="w-44 px-3 py-2">Workflow</th>
            <th className="w-40 px-3 py-2">Editor</th>
            <th className="w-20 px-3 py-2 text-right">Open</th>
          </tr>
        </thead>
        {groups.map((assignmentGroup) => (
          <tbody key={assignmentGroup.key}>
            <tr className="border-y bg-muted/20">
              <th className="px-3 py-1.5 text-left text-xs font-medium" colSpan={canBulkManage ? 5 : 4}>
                <span className="flex items-center gap-2">
                  {group === "status" ? (
                    <StatusBadge status={assignmentGroup.label as AssignmentListItem["status"]} />
                  ) : (
                    assignmentGroup.label
                  )}
                  <span className="text-muted-foreground">{assignmentGroup.assignments.length}</span>
                </span>
              </th>
            </tr>
            {assignmentGroup.assignments.map((assignment) => {
              const days = getDaysOpen(assignment, today);
              const needsQcAttention = assignment.status === "qc" && days > qcReminderDays;
              return (
                <tr
                  className={cn(
                    "border-b last:border-b-0 hover:bg-muted/30",
                    selectedIds.has(assignment.id) && "bg-teal-50/70",
                    needsQcAttention && "bg-amber-50/70 hover:bg-amber-50",
                  )}
                  key={assignment.id}
                >
                  {canBulkManage ? (
                    <td className="px-3 py-2.5">
                      <input
                        aria-label={`Selecteer opdracht ${assignment.accoId}`}
                        checked={selectedIds.has(assignment.id)}
                        className="size-3.5 accent-[#1D9E75]"
                        onChange={(event) => toggleSelection(assignment.id, event.target.checked)}
                        type="checkbox"
                      />
                    </td>
                  ) : null}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{assignment.accoId}</span>
                      <span className="text-xs text-muted-foreground">
                        {assignment.rentalExpertName ?? "Onbekend"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {assignment.photoCount} {assignment.photoCount === 1 ? "foto" : "foto's"}
                      {assignment.goals.length > 0
                        ? ` · ${assignment.goals
                            .map((goal) => goalLabels.get(goal) ?? goal)
                            .join(", ")}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={assignment.status} />
                      <PriorityBadge priority={assignment.priority} />
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <EditorIdentity name={assignment.editorName ?? "Niet toegewezen"} />
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                    {needsQcAttention ? <span className="mr-1 text-amber-700">!</span> : null}
                    {days}d
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function EditorIdentity({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="grid size-5 place-items-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-700">
        {name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
      </span>
      <span className="truncate text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { label: string; value: T; icon: LucideIcon }[];
  onChange: (value: T) => void;
}) {
  return (
    <div aria-label={label} className="inline-flex border p-0.5" role="group">
      {options.map(({ icon: Icon, label: optionLabel, value: optionValue }) => (
        <button
          aria-pressed={value === optionValue}
          className={cn(
            "inline-flex h-7 items-center gap-1 px-2 text-xs font-medium",
            value === optionValue
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          key={optionValue}
          onClick={() => onChange(optionValue)}
          type="button"
        >
          <Icon className="size-3.5" /> {optionLabel}
        </button>
      ))}
    </div>
  );
}

function QuickFilter({
  active,
  disabled = false,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "h-8 border px-2.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-teal-50 text-primary"
          : "bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
      <input
        checked={checked}
        className="size-3.5 accent-[#1D9E75]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        className={inputClassName}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{label}: alle</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
