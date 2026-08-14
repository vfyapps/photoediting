-- =============================================================================
-- VfY AI Photo Editing App - V3-WP7.4: auditspoor voor beheeracties
-- status_events dekt opdrachten, maar een rolwijziging of verwijderde
-- gebruiker was nergens terug te zien. Idempotent.
-- =============================================================================

create table if not exists admin_events (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references app_users(id) on delete set null,
  action      text not null,
  target      text not null,
  created_at  timestamptz not null default now()
);

create index if not exists admin_events_created_idx on admin_events(created_at desc);

alter table admin_events enable row level security;

drop policy if exists read_admin_events on admin_events;
create policy read_admin_events on admin_events for select to authenticated using (is_coordinator());

-- Alleen insert: een auditspoor dat je zelf kunt wijzigen of wissen is geen
-- auditspoor. Geen update/delete-policy, dus die blijven dicht.
drop policy if exists write_admin_events on admin_events;
create policy write_admin_events on admin_events for insert to authenticated with check (is_coordinator());

grant select, insert on admin_events to authenticated;
