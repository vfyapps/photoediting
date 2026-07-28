import { AssignmentsScreen } from "@/components/assignments/assignments-screen";
import {
  type AssignmentFilters,
  isAssignmentStatus,
  isPriority,
  toAssignmentListItem,
  type ViewMode,
} from "@/lib/assignments";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseFilters(params: SearchParams): AssignmentFilters {
  const status = first(params.status);
  const priority = first(params.priority);

  return {
    status: isAssignmentStatus(status) ? status : "",
    editor: first(params.editor).slice(0, 150),
    expert: first(params.expert).slice(0, 150),
    priority: isPriority(priority) ? priority : "",
    goal: first(params.goal).slice(0, 100),
    search: first(params.q).trim().slice(0, 100),
    showBacklog:
      first(params.backlog) === "1" || isAssignmentStatus(status) && status === "backlog",
  };
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg rounded-2xl border bg-background p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Supabase is nog niet ingesteld</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in
            om de opdrachten te laden.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  let assignmentsQuery = supabase
    .from("v_assignments")
    .select("*")
    .order("request_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!filters.showBacklog) assignmentsQuery = assignmentsQuery.neq("status", "backlog");
  if (filters.status) assignmentsQuery = assignmentsQuery.eq("status", filters.status);
  if (filters.editor) assignmentsQuery = assignmentsQuery.eq("editor_name", filters.editor);
  if (filters.expert) {
    assignmentsQuery = assignmentsQuery.eq(
      "rental_expert_name",
      filters.expert,
    );
  }
  if (filters.priority) {
    assignmentsQuery = assignmentsQuery.eq("priority", filters.priority);
  }
  if (filters.goal) assignmentsQuery = assignmentsQuery.contains("goals", [filters.goal]);
  if (filters.search) {
    assignmentsQuery = assignmentsQuery.ilike("acco_id", `%${filters.search}%`);
  }

  let defaultViewCountQuery = supabase
    .from("v_assignments")
    .select("id", { count: "exact", head: true });
  if (!filters.showBacklog) {
    defaultViewCountQuery = defaultViewCountQuery.neq("status", "backlog");
  }

  const [
    assignmentsResult,
    defaultViewCountResult,
    editorsResult,
    expertsResult,
    goalsResult,
    reminderResult,
    roleResult,
  ] = await Promise.all([
    assignmentsQuery,
    defaultViewCountQuery,
    supabase.from("editors").select("id, name, is_active").order("name"),
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
    assignmentsResult.error,
    defaultViewCountResult.error,
    editorsResult.error,
    expertsResult.error,
    goalsResult.error,
  ].find(Boolean);

  if (firstError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg rounded-2xl border bg-background p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Opdrachten konden niet worden geladen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Controleer de Supabase-configuratie en of je bent ingelogd.
          </p>
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {firstError?.message}
          </p>
        </div>
      </main>
    );
  }

  const assignments = (assignmentsResult.data ?? [])
    .map(toAssignmentListItem)
    .filter((assignment) => assignment !== null);
  const requestedView = first(params.view);
  const view: ViewMode =
    requestedView === "board" || requestedView === "table"
      ? requestedView
      : (defaultViewCountResult.count ?? assignments.length) > 50
        ? "table"
        : "board";
  const configuredReminder = Number.parseInt(reminderResult.data?.value ?? "", 10);
  const qcReminderDays = Number.isFinite(configuredReminder)
    ? configuredReminder
    : 5;

  return (
    <AssignmentsScreen
      assignments={assignments}
      assignableEditors={(editorsResult.data ?? [])
        .filter((editor) => editor.is_active)
        .map(({ id, name }) => ({ id, name }))}
      canBulkManage={
        roleResult.data === "admin" || roleResult.data === "coordinator"
      }
      editors={(editorsResult.data ?? []).map(({ id, name }) => ({ id, name }))}
      filters={filters}
      goals={goalsResult.data ?? []}
      key={[
        filters.status,
        filters.editor,
        filters.expert,
        filters.priority,
        filters.goal,
        filters.search,
        filters.showBacklog ? "backlog" : "zonder-backlog",
        view,
      ].join("|")}
      qcReminderDays={qcReminderDays}
      rentalExperts={expertsResult.data ?? []}
      today={new Date().toISOString().slice(0, 10)}
      view={view}
    />
  );
}
