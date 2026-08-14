"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type PaletteAssignment = {
  id: string;
  accoId: string;
  status: string;
  editorName: string | null;
};

/**
 * Voedt de command palette (Ctrl-K). RLS filtert vanzelf tot wat de
 * ingelogde gebruiker mag zien (AGENTS.md schemawijziging 5), dus deze
 * action hoeft zelf geen rolcheck te doen. Zoekt op acco-id, editornaam en
 * verhuurexpertnaam (V3-WP7.1) - niet alleen acco-id, want "geef me Daniels
 * opdrachten" is een net zo natuurlijke zoekvraag.
 */
export async function searchAssignments(query: string): Promise<PaletteAssignment[]> {
  const trimmed = query.trim().slice(0, 100).replace(/[,()]/g, "");
  if (trimmed.length < 2) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("v_assignments")
    .select("id, acco_id, status, editor_name")
    .or(`acco_id.ilike.%${trimmed}%,editor_name.ilike.%${trimmed}%,rental_expert_name.ilike.%${trimmed}%`)
    .order("acco_id")
    .limit(8);

  return (data ?? []).flatMap((row) =>
    row.id && row.acco_id && row.status
      ? [{ id: row.id, accoId: row.acco_id, status: row.status, editorName: row.editor_name }]
      : [],
  );
}
