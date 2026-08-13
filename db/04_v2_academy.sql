-- =============================================================================
-- VfY AI Photo Editing App - v2: academy + per-foto afvinken + RLS-aanscherping
-- Doel: de vier schemawijzigingen uit AGENTS.md v2.0 ("Schema changes required
--       for v2"). 01_schema.sql is al toegepast en geseed en blijft ongemoeid.
--
-- Draaien in Supabase SQL editor, na:
--   01_schema.sql -> 02_seed_reference.sql -> 03_seed_data.sql
--
-- Het script is idempotent: twee keer draaien is veilig.
-- Duur: alle alters zijn metadata-only (Postgres 11+ schrijft geen defaults
-- terug), dus de ACCESS EXCLUSIVE lock op edit_items en guidelines duurt
-- milliseconden, ook met 947 edit_items.
-- =============================================================================

begin;

-- =============================================================================
-- 1. Per-foto afvinken op edit_items
-- =============================================================================
-- Editors vinken foto's af tijdens het werk. Dit is een vinkje, geen tweede
-- statusmachine: geen trigger, geen status_events, geen effect op een view.
-- De status zelf blijft op assignments staan (AGENTS.md, Status flow).
--
-- done_at wordt door de server action gezet, samen met done. Bewust geen
-- trigger en geen check-constraint die de twee koppelt: dat zou van een
-- checkbox alsnog een statusmachine maken, en het maakt de optimistische
-- update in de UI duurder dan hij hoeft te zijn.

alter table edit_items
  add column if not exists done    boolean not null default false,
  add column if not exists done_at timestamptz;

-- De regel "een opdracht mag pas naar qc als alle foto's af zijn" wordt per
-- opdracht gecontroleerd met: select count(*) from edit_items
--   where assignment_id = $1 and not done.
-- Partiële index, want zodra een opdracht af is verdwijnen de rijen eruit:
-- de index blijft klein en krimpt naarmate er meer werk klaar is.
create index if not exists edit_items_open_idx
  on edit_items (assignment_id)
  where not done;

comment on column edit_items.done is
  'Foto afgevinkt door de editor. Checkbox, geen status: geen trigger, geen status_events.';
comment on column edit_items.done_at is
  'Wanneer done op true is gezet. Wordt door de server action geschreven, niet door de database.';

-- =============================================================================
-- 2. Academy-velden op guidelines
-- =============================================================================
-- De academy is een uitbreiding van guidelines, geen parallelle tabel:
-- slug/title/category/body_md/goal_code/sort_order/is_published bestaan al.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'guideline_track') then
    create type guideline_track as enum ('onboarding', 'goal', 'tips');
  end if;
  if not exists (select 1 from pg_type where typname = 'guideline_origin') then
    create type guideline_origin as enum ('manual', 'qc_suggested');
  end if;
end $$;

alter table guidelines
  add column if not exists track         guideline_track  not null default 'tips',
  add column if not exists origin        guideline_origin not null default 'manual',
  add column if not exists qc_issue_code text references qc_issue_types(code) on delete set null;

-- Elk track heeft zijn eigen leesvolgorde (onboarding strikt op sort_order,
-- goal per goal, tips nieuwste eerst). Deze index bedient de trackpagina's;
-- partieel op is_published omdat de editor alleen gepubliceerde modules ziet
-- en concepten een handvol rijen zijn.
create index if not exists guidelines_track_idx
  on guidelines (track, sort_order)
  where is_published;

-- Foreign key zonder index kost een seq scan bij elke on delete set null en
-- bij de auto-suggestie hieronder. Partieel: alleen een minderheid van de
-- modules hangt aan een QC-fout.
create index if not exists guidelines_qc_issue_idx
  on guidelines (qc_issue_code)
  where qc_issue_code is not null;

comment on column guidelines.track is
  'onboarding = het proces van 1 tot 100, goal = per editing goal, tips = wat de coordinator tussendoor deelt.';
comment on column guidelines.origin is
  'qc_suggested = door de app aangemaakt uit v_qc_issue_frequency. De app publiceert nooit zelf.';
comment on column guidelines.qc_issue_code is
  'De QC-fout die deze module behandelt. Dit is de feedbackloop tussen QC en de academy.';

-- =============================================================================
-- 3. Promptbibliotheek
-- =============================================================================
-- Eén goal kan meerdere prompts dragen, dus een eigen tabel. Vervangt de
-- externe ChatGPT-promptgenerator uit stap 5.2 van de oude tutorial.

create table if not exists academy_prompts (
  id           uuid primary key default gen_random_uuid(),
  goal_code    text references editing_goals(code) on delete cascade,
  title        text not null,
  prompt_text  text not null,
  notes_md     text,
  sort_order   int not null default 0,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references app_users(id) on delete set null
);

-- De enige leesquery is "alle prompts voor deze goals, op volgorde", zowel op
-- het detailscherm als in de academy. Composite index in precies die vorm.
create index if not exists academy_prompts_goal_idx
  on academy_prompts (goal_code, sort_order);

-- FK-index, anders scant on delete set null de hele tabel.
create index if not exists academy_prompts_updated_by_idx
  on academy_prompts (updated_by);

-- Zelfde updated_at-conventie als assignments en guidelines.
drop trigger if exists academy_prompts_set_updated_at on academy_prompts;
create trigger academy_prompts_set_updated_at
  before update on academy_prompts
  for each row execute function set_updated_at();

comment on table academy_prompts is
  'Herbruikbare Magnific-prompts per editing goal. Alleen tekst: er komen nooit fotobestanden in de app.';

-- =============================================================================
-- 4. Leesvoortgang
-- =============================================================================
-- Eén rij per editor per module. Verder niets: geen XP, geen scores, geen
-- ranglijst (AGENTS.md, Academy - "Progress, and what it deliberately does not do").

create table if not exists academy_reads (
  user_id      uuid not null references app_users(id) on delete cascade,
  guideline_id uuid not null references guidelines(id) on delete cascade,
  read_at      timestamptz not null default now(),
  primary key (user_id, guideline_id)
);

-- De primary key dekt (user_id, ...) al, dus "wat heb ik gelezen" is snel.
-- De andere kant - "wie heeft deze module gelezen", en de cascade als een
-- module wordt verwijderd - heeft een eigen index nodig.
create index if not exists academy_reads_guideline_idx
  on academy_reads (guideline_id);

-- =============================================================================
-- 5. RLS: editors zien elkaars cijfers niet
-- =============================================================================
-- read_all_app_users en read_all_assignments stonden op using (true) voor
-- iedere ingelogde gebruiker. Een editor kon dus de cijfers van een collega
-- opvragen, ook al verbergt de UI ze. Dit is de reparatie.
--
-- Twee dingen zijn hiervoor nodig, en alleen samen werken ze:
--   a. de policies op de basistabellen aanscherpen, en
--   b. de views die eroverheen liggen op security_invoker zetten. Een view
--      draait standaard met de rechten van de eigenaar (postgres) en negeert
--      daarmee de RLS van de onderliggende tabellen. Alleen (a) doen laat het
--      gat via v_assignments gewoon openstaan.
--
-- Rolverdeling, conform de Permissions-tabel in AGENTS.md:
--   admin / coordinator -> alles, inclusief het onderlinge vergelijk
--   viewer              -> leest mee, maar geen cijfers per editor
--   editor              -> eigen rijen, plus wat nog niet is toegewezen,
--                          plus het geanonimiseerde teamgemiddelde

-- ── Helpers ──────────────────────────────────────────────────────────────────
-- security definer, zodat de lookup zelf niet weer door RLS gaat en er geen
-- recursie ontstaat op app_users. De functie kijkt uitsluitend naar de
-- aanroeper (auth.uid()), dus hij kan niet gebruikt worden om iets van een
-- ander op te vragen.
create or replace function is_current_user_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- Onbekende gebruiker (geen app_users-rij) wordt als editor behandeld:
  -- het strengste geval, zodat een half aangemaakt account niets lekt.
  select coalesce(
    (select role from app_users where id = (select auth.uid())) = 'editor',
    true
  );
$$;

revoke execute on function is_current_user_editor() from public, anon;
grant execute on function is_current_user_editor() to authenticated;

-- editors.user_id is een foreign key zonder index en wordt nu bij elke
-- RLS-check op assignments geraadpleegd.
create index if not exists editors_user_id_idx
  on editors (user_id)
  where user_id is not null;

-- ── a. Basistabellen ─────────────────────────────────────────────────────────

-- app_users: een editor ziet alleen de eigen rij. Namen van collega's komen op
-- de schermen uit editors.name, niet hieruit, dus dit breekt niets.
drop policy if exists read_all_app_users on app_users;
create policy read_app_users_scoped on app_users for select to authenticated
  using (
    not (select is_current_user_editor())
    or id = (select auth.uid())
  );

-- assignments: een editor ziet de eigen opdrachten en alles wat nog niet is
-- toegewezen. Zonder de rijen van collega's valt hun approval rate en
-- doorlooptijd ook niet meer met de hand na te rekenen - dat is het punt.
drop policy if exists read_all_assignments on assignments;
create policy read_assignments_scoped on assignments for select to authenticated
  using (
    not (select is_current_user_editor())
    or editor_id is null
    -- Zelfde vorm als de bestaande update_own_assignment-policy: één subplan
    -- dat Postgres eenmalig uitvoert, geen functieaanroep per rij.
    or editor_id in (select id from editors where user_id = (select auth.uid()))
  );

-- ── b. Views ─────────────────────────────────────────────────────────────────

-- v_assignments is wat de app leest. Zonder security_invoker draait hij als
-- postgres en levert hij alsnog alle 352 rijen aan een editor.
alter view v_assignments set (security_invoker = on);

-- De ongefilterde berekening verhuist naar een schema dat niet via PostgREST
-- bereikbaar is. Alleen de twee views hieronder komen eraan, en die bepalen
-- zelf wie wat ziet.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- De publieke view krijgt er een kolom bij (user_id, zodat de filter op een
-- uuid draait en niet op een naam). create or replace kan geen kolom invoegen,
-- dus hij gaat er eerst af.
drop view if exists v_editor_performance;

create or replace view private.v_editor_performance_all as
select
  e.name                                                            as editor,
  e.user_id,
  count(a.id)                                                       as toegewezen,
  count(*) filter (where a.status = 'approved')                     as approved,
  count(*) filter (where a.status = 'denied')                       as denied,
  count(*) filter (where a.status = 'in_process')                   as in_process,
  round(
    100.0 * count(*) filter (where a.status = 'approved')
    / nullif(count(*) filter (where a.status in ('approved','denied')), 0), 1
  )                                                                 as approval_pct,
  round(avg(a.date_completed - a.request_date)
        filter (where a.date_completed is not null), 1)             as gem_doorlooptijd_dagen,
  coalesce(sum(ei.photo_count), 0)                                  as fotos
from editors e
join assignments a on a.editor_id = e.id and a.status <> 'backlog'
left join lateral (
  select count(distinct photo_number) as photo_count
  from edit_items where assignment_id = a.id
) ei on true
group by e.name, e.user_id;

-- Bewust géén security_invoker: deze view moet over alle opdrachten kunnen
-- rekenen. De afscherming zit in de where-clause van de twee views eronder.
revoke all on private.v_editor_performance_all from public, anon, authenticated;

-- Coordinator en admin zien iedereen. Een editor ziet uitsluitend de eigen rij.
-- Een viewer heeft geen editors-koppeling en ziet dus niets: "read-only, geen
-- cijfers per editor" uit de Permissions-tabel.
create or replace view v_editor_performance as
select *
from private.v_editor_performance_all p
where (select is_coordinator())
   or p.user_id = (select auth.uid());

-- Het enige vergelijkingscijfer dat een editor te zien krijgt: het gemiddelde
-- van het team, zonder namen. editors telt mee zodat de UI het getal kan
-- verbergen als de groep te klein is om echt anoniem te zijn.
create or replace view v_team_average as
select
  count(*)                                    as editors,
  round(avg(approval_pct), 1)                 as approval_pct,
  round(avg(gem_doorlooptijd_dagen), 1)       as gem_doorlooptijd_dagen,
  round(avg(fotos), 1)                        as fotos,
  round(avg(toegewezen), 1)                   as toegewezen
from private.v_editor_performance_all;

grant select on v_editor_performance to authenticated;
grant select on v_team_average       to authenticated;

-- Zelfde afscherming, zelfde reden: dit is een cijfer per editor.
create or replace view v_qc_issues_per_editor as
select
  e.name     as editor,
  t.label_nl as fout,
  count(f.id) as aantal
from qc_findings f
join qc_reviews r     on r.id = f.review_id
join assignments a    on a.id = r.assignment_id
join editors e        on e.id = a.editor_id
join qc_issue_types t on t.code = f.issue_code
where (select is_coordinator())
   or e.user_id = (select auth.uid())
group by e.name, t.label_nl
order by e.name, aantal desc;

-- v_qc_issue_frequency blijft bewust ongefilterd en zonder namen: de
-- QC-callout op het opdrachtenscherm ("komt dit seizoen in 9 QC-notities
-- voor") telt over het hele team en is voor iedereen zichtbaar. Er staat geen
-- editor in, dus er lekt geen cijfer per persoon.

-- =============================================================================
-- 6. RLS op de nieuwe tabellen
-- =============================================================================

alter table academy_prompts enable row level security;
alter table academy_reads   enable row level security;

revoke all on academy_prompts from anon;
revoke all on academy_reads   from anon;
grant select on academy_prompts to authenticated;
grant insert, update, delete on academy_prompts to authenticated;
grant select, insert, update, delete on academy_reads to authenticated;

-- Prompts zijn lesmateriaal: iedereen die is ingelogd leest ze, de coordinator
-- beheert ze. Zelfde verdeling als guidelines.
drop policy if exists read_all_academy_prompts on academy_prompts;
create policy read_all_academy_prompts on academy_prompts for select to authenticated
  using (true);

drop policy if exists write_academy_prompts on academy_prompts;
create policy write_academy_prompts on academy_prompts for all to authenticated
  using ((select is_coordinator())) with check ((select is_coordinator()));

-- Leesvoortgang is per persoon. Een editor ziet en schrijft alleen de eigen
-- rijen; coordinator en admin lezen mee voor het dashboard, maar vinken niets
-- namens een ander af.
drop policy if exists read_own_academy_reads on academy_reads;
create policy read_own_academy_reads on academy_reads for select to authenticated
  using (user_id = (select auth.uid()) or (select is_coordinator()));

drop policy if exists write_own_academy_reads on academy_reads;
create policy write_own_academy_reads on academy_reads for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

commit;

-- =============================================================================
-- Controle achteraf, los te draaien in de SQL editor
-- =============================================================================
-- select track, origin, count(*) from guidelines group by 1, 2;
-- select count(*) filter (where done) as af, count(*) as totaal from edit_items;
-- select * from v_team_average;
--
-- En de test die AGENTS.md vraagt, met een echte editor-sessie (niet met de
-- service-role key, die gaat overal langs RLS heen):
--   select * from v_editor_performance;   -- exact één rij, de eigen
--   select count(*) from v_assignments;   -- alleen eigen + niet-toegewezen
