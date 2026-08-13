-- =============================================================================
-- VfY AI Photo Editing App - hotfix: ontbrekende table-grants voor `authenticated`
--
-- Gevonden na een live test door de eigenaar (2026-08-13): élke schrijfactie
-- als ingelogde admin gaf "Alleen de coördinator kan...", ook waar dat evident
-- niet klopte. Root cause: db/01_schema.sql zet overal RLS-policies neer, maar
-- Postgres controleert tabel-grants vóór RLS - zonder een GRANT INSERT/UPDATE/
-- DELETE aan de rol `authenticated` wijst Postgres elke write af met
-- "permission denied for table x" (SQLSTATE 42501), nog vóórdat een policy
-- ooit wordt geëvalueerd. RLS was dus vanaf het begin correct, maar kon nooit
-- iets toestaan omdat de deur zelf op slot zat.
--
-- Waarom dit nooit opviel: db/03_seed_data.sql draait als de schema-owner
-- (postgres), die grants niet nodig heeft en dus altijd werkte. De v2-migratie
-- (db/04_v2_academy.sql) zette voor de twee nieuwe tabellen wél expliciete
-- GRANT-statements neer (academy_prompts, academy_reads) - die twee werkten
-- daardoor altijd. Elke andere tabel uit het originele schema (assignments,
-- edit_items, qc_reviews, guidelines, editors, ...) miste dezelfde regel.
-- `status_events` blijft bewust zonder insert-grant: die tabel wordt gevuld
-- door een `security definer`-trigger (log_status_change), nooit rechtstreeks
-- door de app - precies zoals AGENTS.md voorschrijft ("status_events niet
-- handmatig beschrijven").
--
-- Idempotent: GRANT zonder voorwaarde is altijd veilig om twee keer te draaien.
-- =============================================================================

grant insert, update, delete on app_users        to authenticated;
grant insert, update, delete on editors           to authenticated;
grant insert, update, delete on rental_experts    to authenticated;
grant insert, update, delete on editing_goals     to authenticated;
grant insert, update, delete on assignments       to authenticated;
grant insert, update, delete on edit_items        to authenticated;
grant insert, update, delete on qc_reviews        to authenticated;
grant insert, update, delete on qc_findings       to authenticated;
grant insert, update, delete on qc_issue_types    to authenticated;
grant insert, update, delete on guidelines        to authenticated;
grant insert, update, delete on guideline_examples to authenticated;
grant insert, update, delete on app_settings      to authenticated;

-- Miste ook een SELECT-grant sinds de v2-migratie hem aanmaakte (nog niet
-- gebruikt door de app, maar hoort net als v_editor_performance/v_team_average
-- leesbaar te zijn voor coordinator/admin - de view-definitie zelf filtert al).
grant select on v_qc_issues_per_editor to authenticated;
