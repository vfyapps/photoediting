-- =============================================================================
-- VfY AI Photo Editing App - V3-WP3: Ares-import (summer -> winter)
-- Idempotent: twee keer draaien is veilig (kolommen/tabellen if-not-exists,
-- policies drop-if-exists, seed-aliassen on-conflict-do-nothing).
-- =============================================================================

-- ── Kolommen op assignments ──────────────────────────────────────────────────

-- Sorteersleutel uit de Ares-export: 865/865 uniek in de augustus-export,
-- dit is wat de import idempotent maakt (BUILDPLAN-V3.md §V3-WP3.1).
alter table assignments add column if not exists ares_row_key text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'assignments_ares_row_key_key') then
    alter table assignments add constraint assignments_ares_row_key_key unique (ares_row_key);
  end if;
end $$;

alter table assignments add column if not exists source text not null default 'manual';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'assignments_source_check') then
    alter table assignments add constraint assignments_source_check check (source in ('manual', 'ares_import'));
  end if;
end $$;

-- Hint voor welk editing goal deze opdracht bedoeld is, gezet bij import zodat
-- een editor weet welk doel hij moet kiezen bij het invoeren van fotonummers.
-- edit_items.goal_code blijft de bron van waarheid zodra er echt foto's aan
-- hangen (v_assignments.goals) - dit is uitsluitend een hint voor opdrachten
-- die nog op "0 van 0" staan (BUILDPLAN-V3.md §V3-WP3.6).
alter table assignments add column if not exists import_goal_code text references editing_goals(code) on delete set null;

create index if not exists assignments_source_idx on assignments(source);

-- ── Alias-tabel: Ares-inlognaam -> verhuurexpert ────────────────────────────
-- Permanent en beheerbaar (Beheer > Editors & experts of hier), want Ares
-- gebruikt inlognamen ("daniel") en de app volledige namen ("Daniel Hell") -
-- 0% exacte match, zie BUILDPLAN-V3.md beslispunt B.
create table if not exists ares_expert_aliases (
  alias             text primary key,
  rental_expert_id  uuid not null references rental_experts(id) on delete cascade,
  created_at        timestamptz not null default now()
);

alter table ares_expert_aliases enable row level security;

drop policy if exists read_all_ares_expert_aliases on ares_expert_aliases;
create policy read_all_ares_expert_aliases on ares_expert_aliases for select to authenticated using (true);

drop policy if exists write_ares_expert_aliases on ares_expert_aliases;
create policy write_ares_expert_aliases on ares_expert_aliases for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

grant select on ares_expert_aliases to authenticated;
grant insert, update, delete on ares_expert_aliases to authenticated;

-- 19 van de 23 aliassen uit de augustus-export zijn op naam te herleiden naar
-- een bestaande verhuurexpert. De resterende vier ("carlo", "dennis", "cedric",
-- "leon") komen niet voor in rental_experts en blijven bewust ongekoppeld: de
-- eerste import zal ze als "onbekende alias" tonen, de coördinator koppelt of
-- maakt ze zelf aan (BUILDPLAN-V3.md beslispunt B).
insert into ares_expert_aliases (alias, rental_expert_id)
select alias, id from rental_experts, (values
  ('brigitte',  'Brigitte Bruijnse'),
  ('carlpeter', 'Carl-Peter Echtermeijer'),
  ('daniel',    'Daniel Hell'),
  ('georg',     'Georg Stiegler'),
  ('ilse',      'Ilse Heijnen'),
  ('jacqueline','Jacqueline Kunst-Dubois'),
  ('karin',     'Karin Wagemans'),
  ('karl',      'Karl Vannerem'),
  ('koen',      'Koen van Tuijn'),
  ('markvb',    'Mark van Bruggen'),
  ('martijn',   'Martijn de Jongh'),
  ('matthias',  'Matthias Hauer'),
  ('michael',   'Michael Fritz'),
  ('monique',   'Monique van der Stap'),
  ('paula',     'Paula Huizenga'),
  ('phyllis',   'Phyllis Muschalik'),
  ('sabine',    'Sabine van Tuijn'),
  ('verhuurnl', 'Verhuur Nederland'),
  ('wim',       'Wim Westerdijk')
) as seed(alias, expert_name)
where rental_experts.name = seed.expert_name
on conflict (alias) do nothing;

-- ── Auditspoor per import ───────────────────────────────────────────────────
create table if not exists import_runs (
  id             uuid primary key default gen_random_uuid(),
  imported_by    uuid references app_users(id) on delete set null,
  file_name      text not null,
  created_count  int not null default 0,
  skipped_count  int not null default 0,
  created_at     timestamptz not null default now()
);

alter table import_runs enable row level security;

drop policy if exists read_import_runs on import_runs;
create policy read_import_runs on import_runs for select to authenticated using (is_coordinator());

drop policy if exists write_import_runs on import_runs;
create policy write_import_runs on import_runs for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

grant select on import_runs to authenticated;
grant insert, update, delete on import_runs to authenticated;

-- ── v_assignments: nieuwe kolommen mee laten lopen ──────────────────────────
-- create or replace (niet drop+create) zodat bestaande grants/policies op de
-- view intact blijven; dat betekent wel dat nieuwe kolommen achteraan moeten
-- staan, niet tussen de bestaande in.
create or replace view v_assignments as
select
  a.id,
  a.acco_id,
  a.status,
  a.priority,
  a.request_date,
  a.date_assigned,
  a.date_completed,
  a.briefing,
  a.legacy_notes,
  a.magnific_url,
  e.name  as editor_name,
  re.name as rental_expert_name,
  coalesce(ei.photo_count, 0)                as photo_count,
  coalesce(ei.goals, array[]::text[])        as goals,
  qc.last_decision,
  qc.rounds,
  a.created_at,
  a.updated_at,
  a.source,
  a.import_goal_code
from assignments a
left join editors e         on e.id = a.editor_id
left join rental_experts re on re.id = a.rental_expert_id
left join lateral (
  select count(distinct photo_number)                  as photo_count,
         array_agg(distinct goal_code order by goal_code) as goals
  from edit_items where assignment_id = a.id
) ei on true
left join lateral (
  select decision as last_decision, round as rounds
  from qc_reviews where assignment_id = a.id
  order by round desc limit 1
) qc on true;

alter view v_assignments set (security_invoker = on);
grant select on v_assignments to authenticated;
