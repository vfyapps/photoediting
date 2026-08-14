-- =============================================================================
-- Testaccounts - ALLEEN voor de lokale wegwerpdatabase van `supabase start`
-- =============================================================================
-- Draait niet mee in de Supabase SQL editor en hoort daar ook nooit te draaien:
-- de wachtwoorden staan hieronder in platte tekst. Dit bestand bestaat zodat
-- Playwright kan inloggen en de RLS-test een echte editor-sessie heeft in
-- plaats van de service-role key, die overal langs RLS heen gaat.
--
-- Vier rollen: een coordinator die alles ziet, twee editors die elkaar niet
-- mogen zien (schemawijziging 5 uit AGENTS.md), en een viewer voor de
-- beheer-toegangstest (V3-WP8) - editor en viewer moeten allebei alle
-- /beheer-writes geblokkeerd zien door RLS, niet alleen door een verborgen
-- knop in de UI.
--
--   coordinator@villaforyou.test  ->  coordinator
--   jill@villaforyou.test         ->  editor, gekoppeld aan editor "Jill"
--   kaylee@villaforyou.test       ->  editor, gekoppeld aan editor "Kaylee"
--   viewer@villaforyou.test       ->  viewer
--
-- Wachtwoord voor alle vier: testtest123
-- =============================================================================

do $seed$
declare
  v_password text := 'testtest123';
  v_user     record;
begin
  for v_user in
    select *
    from (values
      ('11111111-1111-4111-8111-111111111111'::uuid, 'coordinator@villaforyou.test', 'Test Coordinator', 'coordinator'::app_role, null),
      ('22222222-2222-4222-8222-222222222222'::uuid, 'jill@villaforyou.test',        'Jill (test)',      'editor'::app_role,      'Jill'),
      ('33333333-3333-4333-8333-333333333333'::uuid, 'kaylee@villaforyou.test',      'Kaylee (test)',    'editor'::app_role,      'Kaylee'),
      ('44444444-4444-4444-8444-444444444444'::uuid, 'viewer@villaforyou.test',      'Viewer (test)',    'viewer'::app_role,      null)
    ) as t(id, email, full_name, role, editor_name)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    )
    values (
      '00000000-0000-0000-0000-000000000000', v_user.id, 'authenticated', 'authenticated',
      v_user.email, crypt(v_password, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_user.full_name)
    )
    on conflict (id) do nothing;

    -- Zonder identity-rij weigert GoTrue het wachtwoord, ook al staat de hash
    -- in auth.users. Dat kost je een uur zoeken als je het overslaat.
    insert into auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    )
    values (
      v_user.id::text, v_user.id,
      jsonb_build_object('sub', v_user.id::text, 'email', v_user.email, 'email_verified', true),
      'email', now(), now(), now()
    )
    on conflict (provider, provider_id) do nothing;

    insert into app_users (id, full_name, email, role)
    values (v_user.id, v_user.full_name, v_user.email, v_user.role)
    on conflict (id) do update set role = excluded.role;

    if v_user.editor_name is not null then
      update editors set user_id = v_user.id where name = v_user.editor_name;
    end if;
  end loop;
end $seed$;
