import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Expliciet, want Playwright-specs in e2e/ matchen anders het
    // standaardpatroon van Vitest en worden door de verkeerde runner opgepakt.
    include: ["tests/unit/**/*.test.ts", "tests/rls/**/*.test.ts"],
    // Alleen nodig voor de RLS-test, die tegen de lokale Supabase praat.
    setupFiles: ["tests/setup-env.ts"],
  },
});
