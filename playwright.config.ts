import { defineConfig, devices } from "@playwright/test";

import { config } from "dotenv";

config({ path: ".env.test.local", quiet: true });
config({ path: ".env.local", quiet: true });

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
// localhost en niet 127.0.0.1: Next dev blokkeert HMR-requests van een host
// die niet in allowedDevOrigins staat, en dat is puur ruis in de testoutput.
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    // Editors werken op een tweede scherm naast Magnific en op tablet
    // (Rules, punt 6). 1280 is de desktopmaat uit de verificatieronde.
    viewport: { width: 1280, height: 800 },
    locale: "nl-NL",
    timezoneId: "Europe/Amsterdam",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
