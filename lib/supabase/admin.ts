import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * De enige plek in de codebase die `SUPABASE_SERVICE_ROLE_KEY` mag
 * importeren (AGENTS.md, amendement V3-WP2 / BUILDPLAN-V3.md §5). Deze
 * client omzeilt RLS volledig, dus elke aanroeper controleert eerst zelf via
 * de gewone (RLS-gebonden) client of de ingelogde gebruiker admin/coordinator
 * is - deze functie doet geen eigen autorisatiecheck.
 *
 * De key staat in Vercel bewust alleen op Production (BUILDPLAN-V3.md §5.1),
 * dus op Preview/Development ontbreekt hij. `getAdminClient()` gooit dan een
 * gewone Error in plaats van een cryptische Supabase-fout; de aanroepende
 * server action vangt die op en toont een Nederlandse melding in plaats van
 * te crashen.
 */
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY_MISSING");
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
