"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const assignmentIdsSchema = z
  .array(z.string().uuid("Ongeldig opdracht-ID"))
  .min(1, "Selecteer ten minste één opdracht")
  .max(500, "Selecteer maximaal 500 opdrachten tegelijk");

const bulkActionSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("assign"),
    assignmentIds: assignmentIdsSchema,
    editorId: z.string().uuid("Selecteer een geldige editor"),
  }),
  z.object({
    operation: z.literal("priority"),
    assignmentIds: assignmentIdsSchema,
    priority: z.enum(["low", "medium", "high"], {
      error: "Selecteer een geldige prioriteit",
    }),
  }),
]);

export type BulkActionState = {
  status: "idle" | "success" | "error";
  message: string;
  submissionId: number;
};

export const initialBulkActionState: BulkActionState = {
  status: "idle",
  message: "",
  submissionId: 0,
};

export async function updateAssignmentsBulk(
  _previousState: BulkActionState,
  formData: FormData,
): Promise<BulkActionState> {
  const operation = formData.get("operation");
  const parsed = bulkActionSchema.safeParse({
    operation,
    assignmentIds: formData.getAll("assignmentId"),
    editorId: formData.get("editorId"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Controleer de invoer",
      submissionId: Date.now(),
    };
  }

  const supabase = await createClient();
  const update =
    parsed.data.operation === "assign"
      ? { editor_id: parsed.data.editorId }
      : { priority: parsed.data.priority };

  const { data, error } = await supabase
    .from("assignments")
    .update(update)
    .in("id", parsed.data.assignmentIds)
    .select("id");

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze opdrachten te wijzigen."
          : "De opdrachten konden niet worden gewijzigd. Controleer je verbinding en probeer opnieuw.",
      submissionId: Date.now(),
    };
  }

  if (data.length !== parsed.data.assignmentIds.length) {
    return {
      status: "error",
      message:
        "Niet alle opdrachten zijn gewijzigd. Controleer of je hiervoor rechten hebt.",
      submissionId: Date.now(),
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    message: `${data.length} ${data.length === 1 ? "opdracht is" : "opdrachten zijn"} gewijzigd.`,
    submissionId: Date.now(),
  };
}
