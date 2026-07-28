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
} from "lucide-react";

import {
  initialBulkActionState,
  updateAssignmentsBulk,
} from "@/app/actions";
import {
  AssignmentCard,
  createGoalLabels,
} from "@/components/assignments/assignment-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  assignmentStatuses,
  type AssignmentFilters,
  type AssignmentListItem,
  type EditorOption,
  type GoalOption,
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
  canBulkManage: boolean;
  qcReminderDays: number;
  today: string;
};

const inputClassName =
  "h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30";

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start.slice(0, 10)}T00:00:00Z`);
  const endDate = new Date(`${end.slice(0, 10)}T00:00:00Z`);
  return Math.max(
    0,
    Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000),
  );
}

function getDaysOpen(assignment: AssignmentListItem, today: string) {
  const start = assignment.requestDate ?? assignment.createdAt;
  const end = assignment.completedDate ?? today;
  return daysBetween(start, end);
}

export function AssignmentsScreen({
  assignments,
  editors,
  assignableEditors,
  rentalExperts,
  goals,
  filters,
  view,
  canBulkManage,
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

  const allSelected =
    assignments.length > 0 && selectedIds.size === assignments.length;
  const activeFilterCount = [
    filters.status,
    filters.editor,
    filters.expert,
    filters.priority,
    filters.goal,
    filters.search,
  ].filter(Boolean).length;

  const statusColumns = assignmentStatuses.filter(
    (status) => filters.showBacklog || status !== "backlog",
  );

  const renderCard = (assignment: AssignmentListItem) => {
    const daysOpen = getDaysOpen(assignment, today);
    return (
      <AssignmentCard
        assignment={assignment}
        daysOpen={daysOpen}
        goalLabels={goalLabels}
        key={assignment.id}
        needsQcAttention={
          assignment.status === "qc" && daysOpen > qcReminderDays
        }
        onSelect={toggleSelection}
        selectable={canBulkManage}
        selected={selectedIds.has(assignment.id)}
      />
    );
  };

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              Villa for You · Fotobewerking
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Opdrachten</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {assignments.length} {assignments.length === 1 ? "opdracht" : "opdrachten"}
              {filters.showBacklog ? " inclusief backlog" : " zonder backlog"}
            </p>
          </div>
          <div className="inline-flex w-fit rounded-xl border bg-background p-1 shadow-sm">
            <Button
              aria-pressed={view === "board"}
              onClick={() => replaceParams({ view: "board" })}
              size="sm"
              variant={view === "board" ? "default" : "ghost"}
            >
              <Columns3 className="size-4" /> Bord
            </Button>
            <Button
              aria-pressed={view === "table"}
              onClick={() => replaceParams({ view: "table" })}
              size="sm"
              variant={view === "table" ? "default" : "ghost"}
            >
              <List className="size-4" /> Tabel
            </Button>
          </div>
        </header>

        <section className="mt-6 rounded-2xl border bg-background p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4" /> Filters
              {activeFilterCount > 0 ? (
                <Badge variant="secondary">{activeFilterCount}</Badge>
              ) : null}
            </div>
            {activeFilterCount > 0 ? (
              <Button
                onClick={() =>
                  replaceParams({
                    status: null,
                    editor: null,
                    expert: null,
                    priority: null,
                    goal: null,
                    q: null,
                  })
                }
                size="sm"
                variant="ghost"
              >
                <FilterX className="size-4" /> Wissen
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            <label className="relative md:col-span-2 xl:col-span-2">
              <span className="sr-only">Zoeken op acco ID</span>
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <input
                className={cn(inputClassName, "w-full pl-9")}
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
                })
              }
              options={assignmentStatuses.map((status) => ({
                label: status,
                value: status,
              }))}
              value={filters.status}
            />
            <FilterSelect
              label="Editor"
              onChange={(value) => replaceParams({ editor: value || null })}
              options={editors.map((editor) => ({
                label: editor.name,
                value: editor.name,
              }))}
              value={filters.editor}
            />
            <FilterSelect
              label="Verhuurexpert"
              onChange={(value) => replaceParams({ expert: value || null })}
              options={rentalExperts.map((expert) => ({
                label: expert.name,
                value: expert.name,
              }))}
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
              options={goals.map((goal) => ({
                label: goal.label_nl,
                value: goal.code,
              }))}
              value={filters.goal}
            />
          </div>

          <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              checked={filters.showBacklog}
              className="size-4 rounded border-input accent-foreground"
              onChange={(event) =>
                replaceParams({
                  backlog: event.target.checked ? "1" : null,
                  status:
                    !event.target.checked && filters.status === "backlog"
                      ? null
                      : undefined,
                })
              }
              type="checkbox"
            />
            Backlog tonen
          </label>
        </section>

        <div
          className={cn(
            "mt-6 transition-opacity",
            isNavigating && "pointer-events-none opacity-60",
          )}
        >
          {assignments.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-background px-6 py-16 text-center">
              <h2 className="font-semibold">Geen opdrachten gevonden</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pas de filters aan of toon ook de backlog.
              </p>
            </div>
          ) : view === "board" ? (
            <div className="overflow-x-auto pb-4">
              <div className="flex min-w-max items-start gap-4">
                {statusColumns.map((status) => {
                  const columnAssignments = assignments.filter(
                    (assignment) => assignment.status === status,
                  );
                  return (
                    <section className="w-[310px]" key={status}>
                      <div className="mb-3 flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold">{status}</h2>
                        <Badge variant="secondary">{columnAssignments.length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {columnAssignments.length > 0 ? (
                          columnAssignments.map(renderCard)
                        ) : (
                          <div className="rounded-xl border border-dashed bg-background/60 px-4 py-8 text-center text-xs text-muted-foreground">
                            Geen opdrachten
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse text-sm">
                  <thead className="bg-slate-100/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      {canBulkManage ? (
                        <th className="w-12 px-4 py-3">
                          <input
                            aria-label="Selecteer alle zichtbare opdrachten"
                            checked={allSelected}
                            className="size-4 accent-foreground"
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
                      <th className="px-4 py-3">Acco ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Verhuurexpert</th>
                      <th className="px-4 py-3">Foto&apos;s</th>
                      <th className="px-4 py-3">Editing goals</th>
                      <th className="px-4 py-3">Prioriteit</th>
                      <th className="px-4 py-3">Editor</th>
                      <th className="px-4 py-3 text-right">Dagen open</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {assignments.map((assignment) => {
                      const daysOpen = getDaysOpen(assignment, today);
                      const needsQcAttention =
                        assignment.status === "qc" && daysOpen > qcReminderDays;
                      return (
                        <tr
                          className={cn(
                            "transition-colors hover:bg-slate-50",
                            selectedIds.has(assignment.id) && "bg-slate-50",
                            needsQcAttention && "bg-amber-50 hover:bg-amber-100/70",
                          )}
                          key={assignment.id}
                        >
                          {canBulkManage ? (
                            <td className="px-4 py-3">
                              <input
                                aria-label={`Selecteer opdracht ${assignment.accoId}`}
                                checked={selectedIds.has(assignment.id)}
                                className="size-4 accent-foreground"
                                onChange={(event) =>
                                  toggleSelection(
                                    assignment.id,
                                    event.target.checked,
                                  )
                                }
                                type="checkbox"
                              />
                            </td>
                          ) : null}
                          <td className="px-4 py-3 font-bold">{assignment.accoId}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{assignment.status}</Badge>
                              {needsQcAttention ? (
                                <span
                                  aria-label="QC wacht langer dan ingesteld"
                                  className="size-2 rounded-full bg-amber-500"
                                  title="QC wacht langer dan ingesteld"
                                />
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {assignment.rentalExpertName ?? "Onbekend"}
                          </td>
                          <td className="px-4 py-3">{assignment.photoCount}</td>
                          <td className="px-4 py-3">
                            <div className="flex max-w-[260px] flex-wrap gap-1">
                              {assignment.goals.map((goal) => (
                                <Badge key={goal} variant="secondary">
                                  {goalLabels.get(goal) ?? goal}
                                </Badge>
                              ))}
                              {assignment.goals.length === 0 ? "—" : null}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {priorityLabels[assignment.priority]}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {assignment.editorName ?? "Niet toegewezen"}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {daysOpen} d
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {canBulkManage && selectedIds.size > 0 ? (
          <form
            action={bulkAction}
            className="sticky bottom-4 z-20 mx-auto mt-6 flex max-w-5xl flex-col gap-3 rounded-2xl border bg-background/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-end"
          >
            {[...selectedIds].map((id) => (
              <input key={id} name="assignmentId" type="hidden" value={id} />
            ))}
            <div className="min-w-32 self-center text-sm font-semibold">
              {selectedIds.size} geselecteerd
            </div>
            <label className="grid flex-1 gap-1 text-xs font-medium text-muted-foreground">
              Toewijzen aan editor
              <select className={inputClassName} defaultValue="" name="editorId">
                <option disabled value="">
                  Kies editor
                </option>
                {assignableEditors.map((editor) => (
                  <option key={editor.id} value={editor.id}>
                    {editor.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              disabled={isBulkPending}
              name="operation"
              type="submit"
              value="assign"
            >
              Toewijzen
            </Button>
            <label className="grid flex-1 gap-1 text-xs font-medium text-muted-foreground">
              Prioriteit wijzigen
              <select className={inputClassName} defaultValue="" name="priority">
                <option disabled value="">
                  Kies prioriteit
                </option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabels[priority]}
                  </option>
                ))}
              </select>
            </label>
            <Button
              disabled={isBulkPending}
              name="operation"
              type="submit"
              value="priority"
            >
              Wijzigen
            </Button>
            <Button onClick={() => setSelectedIds(new Set())} variant="ghost">
              Annuleren
            </Button>
            <p
              aria-live="polite"
              className={cn(
                "text-xs sm:absolute sm:bottom-full sm:left-4 sm:mb-2 sm:rounded-lg sm:px-3 sm:py-2 sm:shadow",
                bulkState.status === "error" && "bg-red-50 text-red-700",
                bulkState.status === "success" && "bg-emerald-50 text-emerald-700",
              )}
            >
              {bulkState.message}
            </p>
          </form>
        ) : null}
      </div>
    </main>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
