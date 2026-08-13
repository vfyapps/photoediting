/**
 * De RLS-test uit Definition of done: een editor-sessie mag de cijfers van een
 * andere editor niet kunnen opvragen. Dit is de test die vóór het dashboard
 * geschreven hoort te worden, niet erna - een fout in een policy blijft
 * anders stil tot iemand hem toevallig vindt.
 *
 * Draait tegen de wegwerpdatabase van `supabase start`, met echte sessies.
 * Bewust niet met de service-role key: die gaat overal langs RLS heen en zou
 * de test altijd laten slagen.
 *
 *   npx supabase start
 *   npx supabase status -o env   # url en anon key in .env.test.local zetten
 *   npm run test
 *
 * Zonder lokale Supabase slaat de test zichzelf over in plaats van te falen,
 * en hij weigert tegen een niet-lokale URL te draaien.
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

describe.skipIf(!canRun)("RLS: editors zien elkaars cijfers niet", () => {
  let jill: SupabaseClient;
  let kaylee: SupabaseClient;
  let coordinator: SupabaseClient;

  beforeAll(async () => {
    [jill, kaylee, coordinator] = await Promise.all([
      signIn("jill@villaforyou.test"),
      signIn("kaylee@villaforyou.test"),
      signIn("coordinator@villaforyou.test"),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      jill?.auth.signOut(),
      kaylee?.auth.signOut(),
      coordinator?.auth.signOut(),
    ]);
  });

  it("geeft een editor precies één rij in v_editor_performance: de eigen", async () => {
    const { data, error } = await jill.from("v_editor_performance").select("editor");

    expect(error).toBeNull();
    expect(data?.map((row) => row.editor)).toEqual(["Jill"]);
  });

  it("geeft de coordinator wél het onderlinge vergelijk", async () => {
    const { data, error } = await coordinator.from("v_editor_performance").select("editor");

    expect(error).toBeNull();
    expect((data?.length ?? 0)).toBeGreaterThan(1);
    expect(data?.map((row) => row.editor)).toContain("Kaylee");
  });

  it("laat een editor de opdrachten van een collega niet lezen", async () => {
    const { data: mine } = await jill.from("v_assignments").select("editor_name");
    const namen = new Set((mine ?? []).map((row) => row.editor_name).filter(Boolean));

    expect([...namen]).toEqual(["Jill"]);
  });

  it("laat een editor de app_users-rij van een collega niet lezen", async () => {
    const { data } = await kaylee.from("app_users").select("email");

    expect(data?.map((row) => row.email)).toEqual(["kaylee@villaforyou.test"]);
  });

  it("geeft wel het teamgemiddelde, zonder namen", async () => {
    const { data, error } = await jill.from("v_team_average").select("*").single();

    expect(error).toBeNull();
    expect(data?.editors).toBeGreaterThan(1);
    expect(Object.keys(data ?? {})).not.toContain("editor");
  });

  it("laat de QC-frequentie voor het hele team zien, want daar staat geen editor in", async () => {
    // De callout op het opdrachtenscherm telt over iedereen. Dat mag: het is
    // een fout-per-type, geen cijfer per persoon.
    const { error } = await jill.from("v_qc_issue_frequency").select("code").limit(1);

    expect(error).toBeNull();
  });

  it("filtert ook v_qc_issues_per_editor op de eigen naam", async () => {
    const { data } = await kaylee.from("v_qc_issues_per_editor").select("editor");
    const namen = new Set((data ?? []).map((row) => row.editor));

    expect([...namen].filter((naam) => naam !== "Kaylee")).toEqual([]);
  });
});
