import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Auditspoor voor beheeracties (BUILDPLAN-V3.md V3-WP7.4): status_events dekt
 * opdrachten, maar een rolwijziging of verwijderde gebruiker was nergens
 * terug te zien. Best-effort: een mislukte logregel mag de eigenlijke actie
 * nooit blokkeren, dus fouten hier worden bewust geslikt, niet doorgegooid.
 */
export async function logAdminEvent(
  supabase: SupabaseClient<Database>,
  actorId: string | undefined,
  action: string,
  target: string,
): Promise<void> {
  try {
    await supabase.from("admin_events").insert({ actor_id: actorId ?? null, action, target });
  } catch {
    // best-effort, zie hierboven
  }
}
