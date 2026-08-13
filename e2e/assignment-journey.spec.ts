import { createClient } from "@supabase/supabase-js";
import { expect, type Page, test } from "@playwright/test";

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
 *   npx supabase start   (seedt ook supabase/seeds/99_test_users.sql)
 *   npx supabase status -o env   -> url, anon key en service-role key in
 *                                   .env.test.local
 *
 * Login gebeurt als coordinator@villaforyou.test / testtest123 (zie
 * supabase/seeds/99_test_users.sql) — een coördinator mag zowel toewijzen
 * als de QC-ronde afsluiten, zodat deze test één sessie nodig heeft.
 */

const url = process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?/.test(url);

const COORDINATOR_EMAIL = "coordinator@villaforyou.test";
const TEST_PASSWORD = "testtest123";
const EDITOR_NAME = "Jill";

async function loginAsCoordinator(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Wachtwoord" }).click();
  await page.getByLabel("E-mailadres").fill(COORDINATOR_EMAIL);
  await page.getByLabel("Wachtwoord").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Inloggen" }).click();
  await page.waitForURL("/");
}

async function submitSelfCheckAndGoToQc(page: Page) {
  await page.getByRole("button", { name: /^Naar QC/ }).click();
  const dialog = page.getByRole("dialog", { name: "Voor je inlevert" });
  const checkboxes = dialog.getByRole("checkbox");
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    await checkboxes.nth(i).check();
  }
  await dialog.getByRole("button", { name: "Bevestig en zet naar QC" }).click();
  await expect(page.getByText("Opdracht staat nu in QC.")).toBeVisible();
}

test.describe("Doorloop van een opdracht", () => {
  test.skip(!isLocal || !serviceKey, "Vereist `supabase start` en .env.test.local.");

  test("aanmaken tot goedkeuren levert zeven status_events op", async ({ page }) => {
    // De service-role key gaat langs RLS heen en hoort daarom alleen in de
    // test te zitten, nooit in app-code (AGENTS.md, Environment variables).
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const accoId = `NL.9${Date.now().toString().slice(-6)}.01`;

    // 1. aanmaken (status new -> event 1, door de insert-trigger)
    const { data: assignment, error: insertError } = await admin
      .from("assignments")
      .insert({ acco_id: accoId, status: "new", priority: "high" })
      .select("id")
      .single();
    expect(insertError).toBeNull();
    const assignmentId = assignment!.id;

    // Twee foto's om af te vinken — het aanmaken van edit_items zelf is de
    // "12, 15, 18"-invoer uit AGENTS.md, hier al gedekt door de unit-tests
    // van parsePhotoNumbers; deze e2e-test focust op de statusovergangen.
    const { error: photosError } = await admin.from("edit_items").insert([
      { assignment_id: assignmentId, goal_code: "improve_lighting", photo_number: 1 },
      { assignment_id: assignmentId, goal_code: "improve_lighting", photo_number: 2 },
    ]);
    expect(photosError).toBeNull();

    await loginAsCoordinator(page);

    // 2. toewijzen aan Jill, via het bord: selecteren + bulk-toewijzen
    await page.getByLabel("Zoeken op acco ID").fill(accoId);
    const card = page.getByRole("checkbox", { name: `Selecteer opdracht ${accoId}` });
    await card.waitFor();
    await card.check();
    await page.getByLabel("Toewijzen aan editor").selectOption({ label: EDITOR_NAME });
    await page.getByRole("button", { name: "Toewijzen" }).click();
    await expect(page.getByText(/is gewijzigd/)).toBeVisible();

    await page.goto(`/opdrachten/${assignmentId}`);

    // 3. in behandeling (event 2)
    await page.getByRole("button", { name: "In behandeling" }).click();
    await expect(page.getByText("Status bijgewerkt.")).toBeVisible();

    // 4. alle foto's afvinken
    await page.getByRole("checkbox", { name: "Foto 1 afvinken" }).check();
    await page.getByRole("checkbox", { name: "Foto 2 afvinken" }).check();

    // 5. naar QC (event 3) - mag pas als alles is afgevinkt
    await submitSelfCheckAndGoToQc(page);

    // 6. afkeuren met minstens één bevinding (event 4: qc -> denied)
    await page.goto("/qc");
    await page.getByRole("button", { name: /^Afkeuren/ }).click();
    await page.getByLabel("Categorie").selectOption({ label: "Te donker of grauw" });
    await page.getByRole("button", { name: "Toevoegen" }).click();
    await page.getByRole("button", { name: "Bevestig afkeuren" }).click();
    await expect(page.getByText(/afgekeurd met 1 bevinding/)).toBeVisible();

    // 7. opnieuw inleveren (events 5 en 6: denied -> in_process -> qc)
    await page.goto(`/opdrachten/${assignmentId}`);
    await page.getByRole("button", { name: "Opnieuw oppakken" }).click();
    await expect(page.getByText("Status bijgewerkt.")).toBeVisible();
    await submitSelfCheckAndGoToQc(page);

    // 8. goedkeuren (event 7)
    await page.goto("/qc");
    await page.getByRole("button", { name: /^Goedkeuren/ }).click();
    await expect(page.getByText(/goedgekeurd/)).toBeVisible();

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
