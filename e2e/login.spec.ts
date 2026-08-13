import { expect, test } from "@playwright/test";

/**
 * Rooktest. Draait zonder database, want /login rendert ook als Supabase niet
 * is ingesteld. Hij bewijst dat de Playwright-opzet zelf werkt, zodat een
 * falende doorlooptest hieronder over de app gaat en niet over de runner.
 */
test.describe("Login", () => {
  test("toont beide inlogmethodes", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("button", { name: "Magic link" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Wachtwoord" })).toBeVisible();
    await expect(page.getByLabel("E-mailadres")).toBeVisible();
  });

  test("stuurt een uitgelogde bezoeker van / naar /login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login/);
  });
});
