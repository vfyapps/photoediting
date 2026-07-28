import type { Enums, Tables } from "@/lib/database.types";

export const assignmentStatuses = [
  "backlog",
  "new",
  "in_process",
  "qc",
  "approved",
  "denied",
  "ai_rejected",
] as const satisfies readonly Enums<"assignment_status">[];

export const priorities = [
  "low",
  "medium",
  "high",
] as const satisfies readonly Enums<"priority_level">[];

export type AssignmentStatus = (typeof assignmentStatuses)[number];
export type Priority = (typeof priorities)[number];
export type ViewMode = "board" | "table";

export type AssignmentFilters = {
  status: AssignmentStatus | "";
  editor: string;
  expert: string;
  priority: Priority | "";
  goal: string;
  search: string;
  showBacklog: boolean;
};

export type AssignmentListItem = {
  id: string;
  accoId: string;
  status: AssignmentStatus;
  priority: Priority;
  requestDate: string | null;
  completedDate: string | null;
  createdAt: string;
  editorName: string | null;
  rentalExpertName: string | null;
  photoCount: number;
  goals: string[];
};

export type EditorOption = Pick<Tables<"editors">, "id" | "name">;
export type RentalExpertOption = Pick<Tables<"rental_experts">, "id" | "name">;
export type GoalOption = Pick<Tables<"editing_goals">, "code" | "label_nl">;

export const priorityLabels: Record<Priority, string> = {
  low: "Laag",
  medium: "Gemiddeld",
  high: "Hoog",
};

export function isAssignmentStatus(value: string): value is AssignmentStatus {
  return assignmentStatuses.some((status) => status === value);
}

export function isPriority(value: string): value is Priority {
  return priorities.some((priority) => priority === value);
}

export function toAssignmentListItem(
  row: Tables<"v_assignments">,
): AssignmentListItem | null {
  if (
    !row.id ||
    !row.acco_id ||
    !row.status ||
    !row.priority ||
    !row.created_at
  ) {
    return null;
  }

  return {
    id: row.id,
    accoId: row.acco_id,
    status: row.status,
    priority: row.priority,
    requestDate: row.request_date,
    completedDate: row.date_completed,
    createdAt: row.created_at,
    editorName: row.editor_name,
    rentalExpertName: row.rental_expert_name,
    photoCount: row.photo_count ?? 0,
    goals: row.goals ?? [],
  };
}
