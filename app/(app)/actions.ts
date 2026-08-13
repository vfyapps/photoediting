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
};

/**
 * Voedt de command palette (Ctrl-K). RLS filtert vanzelf tot wat de
 * ingelogde gebruiker mag zien (AGENTS.md schemawijziging 5), dus deze
 * action hoeft zelf geen rolcheck te doen.
 */
export async function searchAssignments(query: string): Promise<PaletteAssignment[]> {
  const trimmed = query.trim().slice(0, 100);
  if (trimmed.length < 2) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("v_assignments")
    .select("id, acco_id, status")
    .ilike("acco_id", `%${trimmed}%`)
    .order("acco_id")
    .limit(8);

  return (data ?? []).flatMap((row) =>
    row.id && row.acco_id && row.status
      ? [{ id: row.id, accoId: row.acco_id, status: row.status }]
      : [],
  );
}
