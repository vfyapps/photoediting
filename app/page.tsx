import { AssignmentsScreen } from "@/components/assignments/assignments-screen";
import {
  type AssignmentFilters,
  type AssignmentListItem,
  type AssignmentStatus,
  type GroupMode,
  isAssignmentStatus,
  isPriority,
  toAssignmentListItem,
  type ViewMode,
} from "@/lib/assignments";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const openStatuses = ["new", "in_process", "qc", "denied"] as const;
const archiveStatuses = ["approved", "ai_rejected"] as const;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseFilters(params: SearchParams): AssignmentFilters {
  const status = first(params.status);
  const selectedStatus = isAssignmentStatus(status) ? status : "";
  const priority = first(params.priority);

  return {
    status: selectedStatus,
    editor: first(params.editor).slice(0, 150),
    expert: first(params.expert).slice(0, 150),
    priority: isPriority(priority) ? priority : "",
    goal: first(params.goal).slice(0, 100),
    search: first(params.q).trim().slice(0, 100),
    showBacklog:
      first(params.backlog) === "1" || selectedStatus === "backlog",
    showArchive:
      first(params.archive) === "1" ||
      selectedStatus === "approved" ||
      selectedStatus === "ai_rejected",
    mine: first(params.mine) === "1",
    qcOverdue: first(params.qc_overdue) === "1",
  };
}

function parseView(value: string): ViewMode {
  return value === "table" ? "table" : "board";
}

function parseGroup(value: string): GroupMode {
  return value === "editor" ? "editor" : "status";
}

function daysOpen(assignment: AssignmentListItem, today: string) {
  const start = assignment.requestDate ?? assignment.createdAt;
  const end = assignment.completedDate ?? today;
  const startDate = new Date(`${start.slice(0, 10)}T00:00:00Z`);
  const endDate = new Date(`${end.slice(0, 10)}T00:00:00Z`);
  return Math.max(
    0,
    Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000),
  );
}

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-lg border p-6 text-center">
          <h1 className="text-lg font-semibold">Supabase is nog niet ingesteld</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in
            om de opdrachten te laden.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const [{ data: claimsData }, editorsResult] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.from("editors").select("id, name, is_active, user_id").order("name"),
  ]);
  const currentUserId = claimsData?.claims.sub;
  const currentEditorName = (editorsResult.data ?? []).find(
    (editor) => editor.user_id === currentUserId,
  )?.name;

  const visibleStatuses: AssignmentStatus[] = [
    ...openStatuses,
    ...(filters.showArchive ? archiveStatuses : []),
    ...(filters.showBacklog ? (["backlog"] as AssignmentStatus[]) : []),
  ];
  let assignmentsQuery = supabase
    .from("v_assignments")
    .select("*")
    .in("status", visibleStatuses)
    .order("request_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (filters.status) assignmentsQuery = assignmentsQuery.eq("status", filters.status);
  if (filters.mine) {
    assignmentsQuery = currentEditorName
      ? assignmentsQuery.eq("editor_name", currentEditorName)
      : assignmentsQuery.eq("editor_name", "__geen_eigen_editor__");
  }
  if (filters.editor) assignmentsQuery = assignmentsQuery.eq("editor_name", filters.editor);
  if (filters.expert) {
    assignmentsQuery = assignmentsQuery.eq("rental_expert_name", filters.expert);
  }
  if (filters.priority) assignmentsQuery = assignmentsQuery.eq("priority", filters.priority);
  if (filters.goal) assignmentsQuery = assignmentsQuery.contains("goals", [filters.goal]);
  if (filters.search) assignmentsQuery = assignmentsQuery.ilike("acco_id", `%${filters.search}%`);

  const [assignmentsResult, expertsResult, goalsResult, reminderResult, roleResult] =
    await Promise.all([
      assignmentsQuery,
      supabase.from("rental_experts").select("id, name").order("name"),
      supabase
        .from("editing_goals")
        .select("code, label_nl")
        .order("sort_order"),
      supabase
        .from("app_settings")
        .select("value")
        .eq("key", "qc_reminder_days")
        .maybeSingle(),
      supabase.rpc("current_app_role"),
    ]);

  const firstError = [
    editorsResult.error,
    assignmentsResult.error,
    expertsResult.error,
    goalsResult.error,
  ].find(Boolean);

  if (firstError) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-lg border p-6 text-center">
          <h1 className="text-lg font-semibold">Opdrachten konden niet worden geladen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Controleer de Supabase-configuratie en of je bent ingelogd.
          </p>
          <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {firstError?.message}
          </p>
        </div>
      </main>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const configuredReminder = Number.parseInt(reminderResult.data?.value ?? "", 10);
  const qcReminderDays = Number.isFinite(configuredReminder)
    ? configuredReminder
    : 5;
  const allAssignments = (assignmentsResult.data ?? [])
    .map(toAssignmentListItem)
    .filter((assignment): assignment is AssignmentListItem => assignment !== null);
  const assignments = filters.qcOverdue
    ? allAssignments.filter(
        (assignment) =>
          assignment.status === "qc" &&
          daysOpen(assignment, today) > qcReminderDays,
      )
    : allAssignments;
  const view = parseView(first(params.view));
  const group = parseGroup(first(params.group));

  return (
    <AssignmentsScreen
      assignments={assignments}
      assignableEditors={(editorsResult.data ?? [])
        .filter((editor) => editor.is_active)
        .map(({ id, name }) => ({ id, name }))}
      canBulkManage={
        roleResult.data === "admin" || roleResult.data === "coordinator"
      }
      currentEditorName={currentEditorName ?? null}
      editors={(editorsResult.data ?? []).map(({ id, name }) => ({ id, name }))}
      filters={filters}
      goals={goalsResult.data ?? []}
      group={group}
      key={[
        filters.status,
        filters.editor,
        filters.expert,
        filters.priority,
        filters.goal,
        filters.search,
        filters.showBacklog ? "backlog" : "zonder-backlog",
        filters.showArchive ? "archief" : "zonder-archief",
        filters.mine ? "mijn" : "alle",
        filters.qcOverdue ? "qc-vertraagd" : "qc-alles",
        view,
        group,
      ].join("|")}
      qcReminderDays={qcReminderDays}
      rentalExperts={expertsResult.data ?? []}
      today={today}
      view={view}
    />
  );
}
