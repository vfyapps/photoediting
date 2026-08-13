"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  addEditItemsSchema,
  deleteEditItemSchema,
  updateMagnificUrlSchema,
} from "@/lib/validation";

export type ActionResult = { ok: true } | { ok: false; message: string };

/**
 * "12, 15, 18" wordt op het scherm al naar een getallenlijst geparsed
 * (lib/assignments.ts, parsePhotoNumbers) — deze action krijgt dus al een
 * schone array en hoeft alleen te schrijven. on conflict do nothing, want de
 * unieke sleutel (assignment_id, goal_code, photo_number) staat al in het
 * schema; een dubbel ingevoerd nummer is geen fout, gewoon een no-op.
 */
export async function addEditItems(
  assignmentId: string,
  goalCode: string,
  photoNumbers: number[],
): Promise<ActionResult> {
  const parsed = addEditItemsSchema.safeParse({ assignmentId, goalCode, photoNumbers });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("edit_items").upsert(
    parsed.data.photoNumbers.map((photo_number) => ({
      assignment_id: parsed.data.assignmentId,
      goal_code: parsed.data.goalCode,
      photo_number,
    })),
    { onConflict: "assignment_id,goal_code,photo_number", ignoreDuplicates: true },
  );

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om foto's aan deze opdracht toe te voegen."
          : "De foto's konden niet worden toegevoegd. Probeer opnieuw.",
    };
  }

  revalidatePath(`/opdrachten/${parsed.data.assignmentId}`);
  revalidatePath("/");
  return { ok: true };
}

/**
 * Vraagt eerst het assignment_id van het edit_item op, zodat we na het
 * verwijderen precies dát detailscherm (en de lijst) kunnen revalideren.
 */
export async function deleteEditItem(editItemId: string): Promise<ActionResult> {
  const parsed = deleteEditItemSchema.safeParse({ editItemId });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("edit_items")
    .select("assignment_id")
    .eq("id", parsed.data.editItemId)
    .maybeSingle();

  const { error } = await supabase.from("edit_items").delete().eq("id", parsed.data.editItemId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze foto te verwijderen."
          : "De foto kon niet worden verwijderd. Probeer opnieuw.",
    };
  }

  if (existing?.assignment_id) revalidatePath(`/opdrachten/${existing.assignment_id}`);
  revalidatePath("/");
  return { ok: true };
}

export async function updateMagnificUrl(
  assignmentId: string,
  magnificUrl: string,
): Promise<ActionResult> {
  const parsed = updateMagnificUrlSchema.safeParse({ assignmentId, magnificUrl });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige URL" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignments")
    .update({ magnific_url: parsed.data.magnificUrl || null })
    .eq("id", parsed.data.assignmentId);

  if (error) {
    return {
      ok: false,
      message:
        error.code === "42501"
          ? "Je hebt geen rechten om deze opdracht te wijzigen."
          : "De Magnific-link kon niet worden opgeslagen. Probeer opnieuw.",
    };
  }

  revalidatePath(`/opdrachten/${parsed.data.assignmentId}`);
  return { ok: true };
}
