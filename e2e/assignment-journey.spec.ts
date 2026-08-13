import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

/**
 * De doorlooptest uit Definition of done, tegen een lokaal geseede Supabase:
 *
 *   aanmaken -> toewijzen -> in behandeling -> alle foto's afvinken -> QC ->
 *   afkeuren met bevindingen -> opnieuw inleveren -> goedkeuren
 *
 * Daarna staan er zeven rijen in status_events. Dat aantal is de eigenlijke
 * assertie: het bewijst dat de trigger elke overgang heeft geschreven, en dat
 * er geen stap is overgeslagen.
 *
 * Voorwaarden:
 *   npx supabase start
 *   npx supabase status -o env   -> url, anon key en service-role key in
 *                                   .env.test.local
 *
 * De stappen staan hieronder al uitgeschreven, maar ze hangen aan het
 * opdrachtdetail- en het QC-scherm. Die bestaan nog niet (fase 1 bouwt eerst
 * het schema en de opzet), dus de test staat op `fixme`: hij wordt
 * gerapporteerd als "nog te doen" in plaats van stilletjes over te slaan.
 * Haal de fixme weg zodra scherm 3 en 4 er zijn.
 */

const url = process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?/.test(url);

test.describe("Doorloop van een opdracht", () => {
  test.fixme(
    true,
    "Wacht op het opdrachtdetail-scherm (3) en het QC-scherm (4).",
  );

  test.skip(!isLocal || !serviceKey, "Vereist `supabase start` en .env.test.local.");

  test("aanmaken tot goedkeuren levert zeven status_events op", async ({ page }) => {
    // De service-role key gaat langs RLS heen en hoort daarom alleen in de
    // test te zitten, nooit in app-code (AGENTS.md, Environment variables).
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const accoId = `NL.9${Date.now().toString().slice(-6)}.01`;

    // 1. aanmaken (status new -> event 1)
    const { data: assignment } = await admin
      .from("assignments")
      .insert({ acco_id: accoId, status: "new", priority: "high" })
      .select("id")
      .single();

    const assignmentId = assignment!.id;

    // 2. toewijzen aan Jill, via de UI
    await page.goto("/login");
    // … inloggen als coordinator, opdracht zoeken, toewijzen …

    // 3. in behandeling (event 2)
    // 4. alle foto's afvinken op het detailscherm
    // 5. naar QC (event 3) - mag pas als alles is afgevinkt
    // 6. afkeuren met minstens één bevinding (event 4: qc -> denied)
    // 7. opnieuw inleveren (events 5 en 6: denied -> in_process -> qc)
    // 8. goedkeuren (event 7)

    const { data: events } = await admin
      .from("status_events")
      .select("from_status,to_status")
      .eq("assignment_id", assignmentId)
      .order("created_at");

    expect(events).toHaveLength(7);
    expect(events?.at(-1)?.to_status).toBe("approved");

    await admin.from("assignments").delete().eq("id", assignmentId);
  });
});
