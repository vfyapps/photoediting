/**
 * V3-WP8: "een editor en een viewer krijgen een 403/redirect op elke
 * /beheer-route en op elke adminserveractie - niet alleen dat het
 * menu-item verborgen is." De pagina's zelf gaten al af via
 * app/(app)/beheer/layout.tsx (server-side redirect), maar dit bewijst de
 * échte grens: RLS blokkeert de onderliggende tabel-writes zelf, dus zelfs
 * een server action zonder eigen rolcheck zou hier nog steeds vastlopen.
 *
 * Zelfde opzet als editor-isolation.test.ts: draait tegen de wegwerpdatabase
 * van `supabase start`, met echte sessies, en slaat zichzelf over zonder
 * lokale Supabase in plaats van te falen.
 *
 *   npx supabase start
 *   npx supabase status -o env   # url en anon key in .env.test.local zetten
 *   npm run test
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url =
  process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey =
  process.env.SUPABASE_TEST_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?/.test(url);
const canRun = isLocal && anonKey.length > 0;

const password = "testtest123";

async function signIn(email: string): Promise<SupabaseClient> {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      `Inloggen als ${email} mislukt: ${error.message}. Draait 99_test_users.sql mee in de seed?`,
    );
  }
  return client;
}

describe.skipIf(!canRun)("RLS: beheer-writes zijn dicht voor editor en viewer", () => {
  let jill: SupabaseClient; // editor
  let viewer: SupabaseClient;
  let coordinator: SupabaseClient;

  beforeAll(async () => {
    [jill, viewer, coordinator] = await Promise.all([
      signIn("jill@villaforyou.test"),
      signIn("viewer@villaforyou.test"),
      signIn("coordinator@villaforyou.test"),
    ]);
  });

  afterAll(async () => {
    await Promise.all([jill?.auth.signOut(), viewer?.auth.signOut(), coordinator?.auth.signOut()]);
  });

  const tables = ["photographers", "ares_expert_aliases", "editing_goals", "qc_issue_types"] as const;

  for (const table of tables) {
    it(`blokkeert een insert op ${table} voor een editor`, async () => {
      const { error } = await jill.from(table).insert({ name: "__rls_test__" } as never);
      expect(error?.code).toBe("42501");
    });

    it(`blokkeert een insert op ${table} voor een viewer`, async () => {
      const { error } = await viewer.from(table).insert({ name: "__rls_test__" } as never);
      expect(error?.code).toBe("42501");
    });
  }

  it("blokkeert een insert op admin_events voor een editor", async () => {
    const { error } = await jill
      .from("admin_events")
      .insert({ action: "__rls_test__", target: "x" });
    expect(error?.code).toBe("42501");
  });

  it("laat zelfs de coordinator admin_events niet verwijderen (geen delete-grant)", async () => {
    const { error } = await coordinator.from("admin_events").delete().eq("action", "__none__");
    expect(error?.code).toBe("42501");
  });

  it("laat de coordinator wél een fotograaf aanmaken (positieve controle)", async () => {
    const { error } = await coordinator
      .from("photographers")
      .insert({ name: `__rls_test_${Date.now()}__` });
    expect(error).toBeNull();
    await coordinator.from("photographers").delete().eq("name", `__rls_test_${Date.now()}__`);
  });
});
