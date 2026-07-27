-- =============================================================================
-- VfY AI Photo Editing App - schema
-- Doel: vervangt VfY_FotoBewerking_Tracker.xlsx
-- Draaien in Supabase SQL editor, in deze volgorde:
--   01_schema.sql -> 02_seed_reference.sql -> 03_seed_data.sql
-- =============================================================================

-- ── Extensies ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────────
-- backlog = kandidaatwoning uit de shortlist, nog geen opdracht (was: lege
-- statusrij in Excel). Telt niet mee in KPI's, net als in het oude dashboard.
create type assignment_status as enum (
  'backlog', 'new', 'in_process', 'qc', 'approved', 'denied', 'ai_rejected'
);

create type priority_level as enum ('low', 'medium', 'high');

create type app_role as enum ('admin', 'coordinator', 'editor', 'viewer');

create type qc_decision as enum ('approved', 'denied');

-- ── Gebruikers ───────────────────────────────────────────────────────────────
-- Gekoppeld aan auth.users. Rol bepaalt rechten, zie RLS onderaan.
create table app_users (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text unique,
  role         app_role not null default 'editor',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Editors die (nog) geen account hebben, of historische editors uit Excel.
-- assignments.assigned_to_name is de bron van waarheid voor rapportage,
-- assigned_to_user vult aan zodra iemand een account heeft.
create table editors (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  user_id      uuid references app_users(id) on delete set null,
  is_active    boolean not null default true
);

-- ── Verhuurexperts ───────────────────────────────────────────────────────────
create table rental_experts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  email        text,
  country      text,
  is_team      boolean not null default false,
  is_active    boolean not null default true
);

-- ── Editing goals ────────────────────────────────────────────────────────────
create table editing_goals (
  code         text primary key,
  label_nl     text not null,
  label_en     text not null,
  description  text,
  icon         text,
  sort_order   int not null default 0,
  is_active    boolean not null default true
);

-- ── Opdrachten ───────────────────────────────────────────────────────────────
create table assignments (
  id                 uuid primary key default gen_random_uuid(),
  acco_id            text not null,
  rental_expert_id   uuid references rental_experts(id) on delete set null,
  status             assignment_status not null default 'new',
  priority           priority_level not null default 'low',

  editor_id          uuid references editors(id) on delete set null,

  request_date       date,
  date_assigned      date,
  date_completed     date,

  -- Briefing vooraf aan de editor. In Excel zat dit door elkaar met QC-feedback
  -- in kolom "Notes QC"; hier bewust gescheiden.
  briefing           text,

  -- Onbewerkte inhoud van kolom "Notes QC" uit Excel. Alleen historie, niet
  -- gebruiken voor nieuwe opdrachten.
  legacy_notes       text,

  -- Directe link naar het Magnific-project of de map voor deze woning.
  magnific_url       text,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references app_users(id) on delete set null,

  constraint acco_id_not_blank check (length(trim(acco_id)) > 0)
);

create index assignments_status_idx        on assignments(status);
create index assignments_editor_idx        on assignments(editor_id);
create index assignments_rental_expert_idx on assignments(rental_expert_id);
create index assignments_acco_idx          on assignments(acco_id);
create index assignments_request_date_idx  on assignments(request_date);

-- Eén regel per foto per goal. Vervangt de komma-strings in kolom B t/m H.
-- Eén foto mag meerdere goals hebben, dus de unieke sleutel is de combinatie.
create table edit_items (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references assignments(id) on delete cascade,
  goal_code      text not null references editing_goals(code),
  photo_number   int  not null,
  is_hero        boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (assignment_id, goal_code, photo_number),
  constraint photo_number_positive check (photo_number > 0)
);

create index edit_items_assignment_idx on edit_items(assignment_id);
create index edit_items_goal_idx       on edit_items(goal_code);

-- ── Statushistorie ───────────────────────────────────────────────────────────
-- Wordt automatisch gevuld door een trigger. Hiermee meet je doorlooptijd per
-- fase in plaats van alleen request_date -> date_completed.
create table status_events (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references assignments(id) on delete cascade,
  from_status    assignment_status,
  to_status      assignment_status not null,
  actor_id       uuid references app_users(id) on delete set null,
  created_at     timestamptz not null default now()
);

create index status_events_assignment_idx on status_events(assignment_id, created_at);

-- ── QC ───────────────────────────────────────────────────────────────────────
-- Vaste categorieën voor terugkerende fouten. Hiermee kun je per editor en per
-- goal zien welk type fout het vaakst terugkomt, en daar de prompts op aanpassen.
create table qc_issue_types (
  code         text primary key,
  label_nl     text not null,
  description  text,
  sort_order   int not null default 0,
  is_active    boolean not null default true
);

-- Eén review per QC-ronde. Bij 'denied' gaat de opdracht terug naar in_process
-- en volgt er later een tweede review met round = 2.
create table qc_reviews (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references assignments(id) on delete cascade,
  round          int not null default 1,
  decision       qc_decision not null,
  summary        text,
  reviewer_id    uuid references app_users(id) on delete set null,
  created_at     timestamptz not null default now(),
  unique (assignment_id, round)
);

create index qc_reviews_assignment_idx on qc_reviews(assignment_id);

-- Concrete bevinding, bij voorkeur gekoppeld aan een fotonummer.
create table qc_findings (
  id             uuid primary key default gen_random_uuid(),
  review_id      uuid not null references qc_reviews(id) on delete cascade,
  photo_number   int,
  issue_code     text references qc_issue_types(code),
  comment        text,
  is_resolved    boolean not null default false,
  created_at     timestamptz not null default now()
);

create index qc_findings_review_idx on qc_findings(review_id);
create index qc_findings_issue_idx  on qc_findings(issue_code);

-- ── Guidelines ───────────────────────────────────────────────────────────────
-- Richtlijnen in de app zelf, in markdown. Optioneel gekoppeld aan een editing
-- goal, zodat de juiste richtlijn naast de opdracht getoond kan worden.
create table guidelines (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  category     text not null default 'algemeen',
  body_md      text not null,
  goal_code    text references editing_goals(code) on delete set null,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references app_users(id) on delete set null
);

create index guidelines_goal_idx     on guidelines(goal_code);
create index guidelines_category_idx on guidelines(category);

-- Voorbeeldafbeeldingen bij een richtlijn (goed/fout). Bestanden in Supabase
-- Storage bucket 'guidelines'.
create table guideline_examples (
  id            uuid primary key default gen_random_uuid(),
  guideline_id  uuid not null references guidelines(id) on delete cascade,
  storage_path  text not null,
  caption       text,
  is_good       boolean not null default true,
  sort_order    int not null default 0
);

-- ── Instellingen ─────────────────────────────────────────────────────────────
-- Voor o.a. de Magnific-basis-URL en andere snelkoppelingen, zodat je die niet
-- in de code hardcodeert.
create table app_settings (
  key         text primary key,
  value       text,
  description text,
  updated_at  timestamptz not null default now()
);

-- =============================================================================
-- Triggers
-- =============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger assignments_set_updated_at
  before update on assignments
  for each row execute function set_updated_at();

create trigger guidelines_set_updated_at
  before update on guidelines
  for each row execute function set_updated_at();

-- Schrijft elke statuswijziging weg en zet date_completed automatisch.
create or replace function log_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into status_events (assignment_id, from_status, to_status, actor_id)
    values (new.id, null, new.status, auth.uid());
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into status_events (assignment_id, from_status, to_status, actor_id)
    values (new.id, old.status, new.status, auth.uid());

    if new.status = 'approved' and new.date_completed is null then
      new.date_completed = current_date;
    end if;

    if new.status in ('in_process', 'qc', 'denied') then
      new.date_completed = null;
    end if;
  end if;

  return new;
end;
$$;

create trigger assignments_log_status_insert
  after insert on assignments
  for each row execute function log_status_change();

create trigger assignments_log_status_update
  before update on assignments
  for each row execute function log_status_change();

-- Zet automatisch het rondenummer van een QC-review.
create or replace function set_qc_round()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.round is null or new.round = 1 then
    select coalesce(max(round), 0) + 1
      into new.round
      from qc_reviews
     where assignment_id = new.assignment_id;
  end if;
  return new;
end;
$$;

create trigger qc_reviews_set_round
  before insert on qc_reviews
  for each row execute function set_qc_round();

-- =============================================================================
-- Views (vervangen de Dashboard-tab)
-- =============================================================================

-- Basisregel: 'backlog' telt niet mee in KPI's. Dat komt overeen met de
-- COUNTIFS(...,"<>") filters in het oude Excel-dashboard.

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
  a.updated_at
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

create or replace view v_dashboard_status as
select
  status,
  count(*)                                                     as aantal,
  round(100.0 * count(*) / nullif(sum(count(*)) over (), 0), 1) as pct
from assignments
where status <> 'backlog'
group by status;

create or replace view v_editor_performance as
select
  e.name                                                            as editor,
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
group by e.name;

create or replace view v_goal_usage as
select
  g.code,
  g.label_nl,
  count(distinct ei.assignment_id) as opdrachten,
  count(ei.id)                     as fotos
from editing_goals g
left join edit_items ei on ei.goal_code = g.code
left join assignments a on a.id = ei.assignment_id and a.status <> 'backlog'
group by g.code, g.label_nl
order by g.sort_order;

create or replace view v_monthly_volume as
select
  date_trunc('month', a.request_date)::date       as maand,
  count(*) filter (where a.request_date is not null) as aangevraagd_woningen,
  sum(ei.photo_count)                                as aangevraagd_fotos
from assignments a
left join lateral (
  select count(distinct photo_number) as photo_count
  from edit_items where assignment_id = a.id
) ei on true
where a.status <> 'backlog' and a.request_date is not null
group by 1
order by 1;

create or replace view v_monthly_completed as
select
  date_trunc('month', a.date_completed)::date as maand,
  count(*)                                    as afgerond_woningen,
  sum(ei.photo_count)                         as afgerond_fotos
from assignments a
left join lateral (
  select count(distinct photo_number) as photo_count
  from edit_items where assignment_id = a.id
) ei on true
where a.date_completed is not null
group by 1
order by 1;

-- Frequentste QC-fouten. Dit is de feedbackloop: wat hier bovenaan staat,
-- hoort in de guidelines en in de standaardprompts.
create or replace view v_qc_issue_frequency as
select
  t.code,
  t.label_nl,
  count(f.id)                          as aantal,
  count(distinct r.assignment_id)      as opdrachten,
  count(distinct e.name)               as editors
from qc_issue_types t
left join qc_findings f  on f.issue_code = t.code
left join qc_reviews r   on r.id = f.review_id
left join assignments a  on a.id = r.assignment_id
left join editors e      on e.id = a.editor_id
group by t.code, t.label_nl
order by aantal desc;

create or replace view v_qc_issues_per_editor as
select
  e.name    as editor,
  t.label_nl as fout,
  count(f.id) as aantal
from qc_findings f
join qc_reviews r    on r.id = f.review_id
join assignments a   on a.id = r.assignment_id
join editors e       on e.id = a.editor_id
join qc_issue_types t on t.code = f.issue_code
group by e.name, t.label_nl
order by e.name, aantal desc;

-- Doorlooptijd per fase, uit status_events. Hiermee zie je of tijd verloren
-- gaat bij toewijzen, bewerken of QC.
create or replace view v_cycle_time as
with pairs as (
  select
    assignment_id,
    to_status,
    created_at,
    lead(created_at) over (partition by assignment_id order by created_at) as next_at
  from status_events
)
select
  to_status                                            as fase,
  count(*)                                             as overgangen,
  round(avg(extract(epoch from (next_at - created_at)) / 86400)::numeric, 1) as gem_dagen
from pairs
where next_at is not null
group by to_status;

-- =============================================================================
-- RLS
-- =============================================================================

alter table app_users         enable row level security;
alter table editors           enable row level security;
alter table rental_experts    enable row level security;
alter table editing_goals     enable row level security;
alter table assignments       enable row level security;
alter table edit_items        enable row level security;
alter table status_events     enable row level security;
alter table qc_issue_types    enable row level security;
alter table qc_reviews        enable row level security;
alter table qc_findings       enable row level security;
alter table guidelines        enable row level security;
alter table guideline_examples enable row level security;
alter table app_settings      enable row level security;

-- Helper. security definer om recursie op app_users te voorkomen.
create or replace function current_app_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from app_users where id = auth.uid();
$$;

create or replace function is_coordinator()
returns boolean
language sql
stable
as $$
  select current_app_role() in ('admin', 'coordinator');
$$;

-- Iedereen die is ingelogd mag lezen. Het gaat om interne operationele data,
-- niet om persoonsgegevens van gasten.
create policy read_all_app_users      on app_users         for select to authenticated using (true);
create policy read_all_editors        on editors           for select to authenticated using (true);
create policy read_all_experts        on rental_experts    for select to authenticated using (true);
create policy read_all_goals          on editing_goals     for select to authenticated using (true);
create policy read_all_assignments    on assignments       for select to authenticated using (true);
create policy read_all_edit_items     on edit_items        for select to authenticated using (true);
create policy read_all_status_events  on status_events     for select to authenticated using (true);
create policy read_all_issue_types    on qc_issue_types    for select to authenticated using (true);
create policy read_all_qc_reviews     on qc_reviews        for select to authenticated using (true);
create policy read_all_qc_findings    on qc_findings       for select to authenticated using (true);
create policy read_all_settings       on app_settings      for select to authenticated using (true);
create policy read_pub_guidelines     on guidelines        for select to authenticated
  using (is_published or is_coordinator());
create policy read_all_examples       on guideline_examples for select to authenticated using (true);

-- Schrijven op opdrachten: coördinator alles, editor alleen de eigen opdracht.
create policy write_assignments_coord on assignments for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

create policy update_own_assignment on assignments for update to authenticated
  using (
    editor_id in (select id from editors where user_id = auth.uid())
  )
  with check (
    editor_id in (select id from editors where user_id = auth.uid())
  );

create policy write_edit_items on edit_items for all to authenticated
  using (
    is_coordinator()
    or exists (
      select 1 from assignments a
      join editors e on e.id = a.editor_id
      where a.id = edit_items.assignment_id and e.user_id = auth.uid()
    )
  )
  with check (
    is_coordinator()
    or exists (
      select 1 from assignments a
      join editors e on e.id = a.editor_id
      where a.id = edit_items.assignment_id and e.user_id = auth.uid()
    )
  );

-- QC beoordelen doet alleen de coördinator.
create policy write_qc_reviews on qc_reviews for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

create policy write_qc_findings on qc_findings for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

-- Editors mogen een bevinding wel afvinken als opgelost.
create policy resolve_qc_findings on qc_findings for update to authenticated
  using (
    exists (
      select 1 from qc_reviews r
      join assignments a on a.id = r.assignment_id
      join editors e on e.id = a.editor_id
      where r.id = qc_findings.review_id and e.user_id = auth.uid()
    )
  )
  with check (true);

create policy write_guidelines on guidelines for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

create policy write_examples on guideline_examples for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

create policy write_reference_goals on editing_goals for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

create policy write_reference_issues on qc_issue_types for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

create policy write_editors on editors for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

create policy write_experts on rental_experts for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

create policy write_settings on app_settings for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

create policy write_app_users on app_users for all to authenticated
  using (current_app_role() = 'admin') with check (current_app_role() = 'admin');
