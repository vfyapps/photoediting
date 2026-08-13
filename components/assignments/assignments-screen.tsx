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
import { toast } from "sonner";

import { initialBulkActionState } from "@/app/assignment-bulk-state";
import { updateAssignmentsBulk, updateAssignmentStatus } from "@/app/actions";
import { AttentionStrip, type AttentionData } from "@/components/assignments/attention-strip";
import { Board } from "@/components/assignments/board";
import { createGoalLabels } from "@/components/assignments/assignment-card";
import { VirtualizedTable, type AssignmentGroup } from "@/components/assignments/virtualized-table";
import { Button } from "@/components/ui/button";
import {
  assignmentStatuses,
  type AssignmentFilters,
  type AssignmentListItem,
  type AssignmentStatus,
  type EditItem,
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
  attention: AttentionData;
  editItemsByAssignment: Map<string, EditItem[]>;
};

const inputClassName =
  "h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/25";

const openStatuses = new Set(["new", "in_process", "qc", "denied"]);
const archiveStatuses = new Set(["approved", "ai_rejected"]);

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
  attention,
  editItemsByAssignment,
}: AssignmentsScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startNavigation] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [statusOverrides, setStatusOverrides] = useState<Map<string, AssignmentStatus>>(
    new Map(),
  );

  const handleStatusChange = useCallback(
    async (assignmentId: string, nextStatus: AssignmentStatus) => {
      setStatusOverrides((current) => new Map(current).set(assignmentId, nextStatus));
      const result = await updateAssignmentStatus(assignmentId, nextStatus);
      setStatusOverrides((current) => {
        const next = new Map(current);
        next.delete(assignmentId);
        return next;
      });
      if (!result.ok) {
        toast.error(result.message);
      } else {
        toast.success("Status bijgewerkt.");
        router.refresh();
      }
    },
    [router],
  );

  const effectiveAssignments = useMemo(
    () =>
      statusOverrides.size === 0
        ? assignments
        : assignments.map((assignment) =>
            statusOverrides.has(assignment.id)
              ? { ...assignment, status: statusOverrides.get(assignment.id)! }
              : assignment,
          ),
    [assignments, statusOverrides],
  );

  const runBulkAction = useCallback(
    async (previousState: typeof initialBulkActionState, formData: FormData) => {
      const nextState = await updateAssignmentsBulk(previousState, formData);
      if (nextState.status === "success") {
        setSelectedIds(new Set());
        toast.success(nextState.message);
      } else if (nextState.status === "error") {
        toast.error(nextState.message);
      }
      return nextState;
    },
    [],
  );
  const [, bulkAction, isBulkPending] = useActionState(
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
    filters.qcIssue,
    filters.missingPhotos,
  ].filter(Boolean).length;
  const groups = groupAssignments(effectiveAssignments, group, filters);

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
      qc_issue: null,
      missing_photos: null,
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
            <QuickFilter
              active={filters.missingPhotos}
              label="Wacht op fotonummers"
              onClick={() =>
                replaceParams({ missing_photos: filters.missingPhotos ? null : "1" })
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
              {activeFilterCount > 0 ? <CountPill value={activeFilterCount} /> : null}
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

        <AttentionStrip attention={attention} />

        <div
          className={cn(
            "pt-4 transition-opacity",
            isNavigating && "pointer-events-none opacity-60",
          )}
        >
          {effectiveAssignments.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-6 py-14 text-center">
              <h2 className="font-medium">Geen opdrachten gevonden</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pas de filters aan of toon ook het archief of de backlog.
              </p>
            </div>
          ) : view === "board" ? (
            <Board
              assignments={effectiveAssignments}
              canBulkManage={canBulkManage}
              editItemsByAssignment={editItemsByAssignment}
              goalLabels={goalLabels}
              isCoordinator={canBulkManage}
              onSelect={toggleSelection}
              onStatusChange={handleStatusChange}
              qcReminderDays={qcReminderDays}
              selectedIds={selectedIds}
              today={today}
            />
          ) : (
            <VirtualizedTable
              allAssignments={effectiveAssignments}
              canBulkManage={canBulkManage}
              editItemsByAssignment={editItemsByAssignment}
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
            className="fixed inset-x-0 bottom-4 z-20 mx-auto flex w-fit max-w-[calc(100%-2rem)] flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-lg sm:flex-row sm:items-end"
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

// A count is not a status, so it gets neither Chip nor Badge (both carry
// semantic meaning) — just the mono system voice on a muted surface.
function CountPill({ value }: { value: number }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
      {value}
    </span>
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
            "inline-flex h-7 items-center gap-1 px-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
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
        "h-8 border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
        active
          ? "border-primary bg-accent text-primary"
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
        className="size-3.5 accent-primary"
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
