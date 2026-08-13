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

// De vier kolommen die het bord toont: zonder backlog en archief, conform
// AGENTS.md Screen 2 ("Bordweergave als default... zonder backlog en archief").
export const boardStatuses = ["new", "in_process", "qc", "denied"] as const;
export type BoardStatus = (typeof boardStatuses)[number];
export type Priority = (typeof priorities)[number];
export type ViewMode = "board" | "table";
export type GroupMode = "status" | "editor";

export type AssignmentFilters = {
  status: AssignmentStatus | "";
  editor: string;
  expert: string;
  priority: Priority | "";
  goal: string;
  search: string;
  showBacklog: boolean;
  showArchive: boolean;
  mine: boolean;
  qcOverdue: boolean;
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

export type EditItem = {
  id: string;
  assignmentId: string;
  goalCode: string;
  photoNumber: number;
  done: boolean;
};

export function toEditItem(row: Tables<"edit_items">): EditItem {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    goalCode: row.goal_code,
    photoNumber: row.photo_number,
    done: row.done,
  };
}

export type AssignmentDetail = {
  id: string;
  accoId: string;
  status: AssignmentStatus;
  priority: Priority;
  requestDate: string | null;
  dateAssigned: string | null;
  completedDate: string | null;
  createdAt: string;
  briefing: string | null;
  legacyNotes: string | null;
  magnificUrl: string | null;
  editorName: string | null;
  rentalExpertName: string | null;
  photoCount: number;
  goals: string[];
};

export function toAssignmentDetail(row: Tables<"v_assignments">): AssignmentDetail | null {
  if (!row.id || !row.acco_id || !row.status || !row.priority || !row.created_at) {
    return null;
  }

  return {
    id: row.id,
    accoId: row.acco_id,
    status: row.status,
    priority: row.priority,
    requestDate: row.request_date,
    dateAssigned: row.date_assigned,
    completedDate: row.date_completed,
    createdAt: row.created_at,
    briefing: row.briefing,
    legacyNotes: row.legacy_notes,
    magnificUrl: row.magnific_url,
    editorName: row.editor_name,
    rentalExpertName: row.rental_expert_name,
    photoCount: row.photo_count ?? 0,
    goals: row.goals ?? [],
  };
}

export const statusLabelsNl: Record<AssignmentStatus, string> = {
  backlog: "Backlog",
  new: "Nieuw",
  in_process: "In behandeling",
  qc: "QC",
  approved: "Goedgekeurd",
  denied: "Afgekeurd",
  ai_rejected: "AI afgewezen",
};

// De vaste kwaliteitseisen uit de Legenda-tab / Academy-sectie van AGENTS.md.
// Statisch, niet per goal — vandaar hier en niet in de database.
/**
 * Zet "12, 15, 18" (of met spaties/puntkomma's) om naar unieke, positieve
 * fotonummers, op volgorde van eerste voorkomen. Puur en test baar zonder
 * database — het detailscherm en de server action gebruiken dezelfde functie
 * zodat de preview nooit afwijkt van wat er echt wordt opgeslagen.
 */
export function parsePhotoNumbers(input: string): number[] {
  const seen = new Set<number>();
  const result: number[] = [];
  for (const token of input.split(/[,;\s]+/)) {
    if (!token) continue;
    const n = Number.parseInt(token, 10);
    if (!Number.isFinite(n) || n <= 0) continue;
    if (!seen.has(n)) {
      seen.add(n);
      result.push(n);
    }
  }
  return result;
}

export const selfCheckItems = [
  "Landscape georiënteerd",
  "Minimaal 2048 × 1536 pixels",
  "Geen personen of kentekens zichtbaar",
  "Geen watermerk",
  "Goed belicht",
  "Natuurlijke kleuren",
  "Geen elementen toegevoegd die niet in het origineel stonden",
  "Geen AI-artefacten langs de randen",
] as const;

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
