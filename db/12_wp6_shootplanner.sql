-- =============================================================================
-- VfY AI Photo Editing App - V3-WP6: shootplanner-kaart
-- Idempotent: create-if-not-exists, drop-if-exists voor policies.
-- =============================================================================

-- ── Alle Ares-shoots, niet alleen de kandidaten ─────────────────────────────
-- De import bewaart voortaan elke rij uit Data_Fototool, niet alleen wat
-- summer_to_winter-kandidaat is. Zonder deze tabel bestaan openstaande shoots
-- (Assigned/Readytoshoot/Signedup/Onhold) helemaal niet in de app - het zijn
-- geen editing-opdrachten (BUILDPLAN-V3.md V3-WP6.1).
create table if not exists ares_shoots (
  ares_row_key      text primary key,
  acco_id           text not null,
  land              text not null,
  postcode          text not null,
  status            text not null,
  tasks             text[] not null default '{}',
  photographer_alias text,
  expert_alias      text,
  request_date      date,
  imported_at       timestamptz not null default now()
);

create index if not exists ares_shoots_acco_idx           on ares_shoots(acco_id);
create index if not exists ares_shoots_land_postcode_idx  on ares_shoots(land, postcode);
create index if not exists ares_shoots_status_idx         on ares_shoots(status);

alter table ares_shoots enable row level security;

drop policy if exists read_all_ares_shoots on ares_shoots;
create policy read_all_ares_shoots on ares_shoots for select to authenticated using (true);

drop policy if exists write_ares_shoots on ares_shoots;
create policy write_ares_shoots on ares_shoots for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

grant select on ares_shoots to authenticated;
grant insert, update, delete on ares_shoots to authenticated;

-- ── Fotografen ───────────────────────────────────────────────────────────────
-- Vestigingslocatie via dezelfde land+postcode-vorm als acco-id's, zodat de
-- kaart en de postcode-lookup zonder apart geocoding-pad werken.
create table if not exists photographers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  ares_alias  text unique,
  land        text,
  postcode    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table photographers enable row level security;

drop policy if exists read_all_photographers on photographers;
create policy read_all_photographers on photographers for select to authenticated using (true);

drop policy if exists write_photographers on photographers;
create policy write_photographers on photographers for all to authenticated
  using (is_coordinator()) with check (is_coordinator());

grant select on photographers to authenticated;
grant insert, update, delete on photographers to authenticated;
