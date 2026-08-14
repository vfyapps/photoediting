-- =============================================================================
-- VfY AI Photo Editing App - V3-WP4: besparingsview voor het dashboard
-- Telt AT-woningen met een summer_to_winter-bewerking (via edit_items, dus
-- pas zodra er echt fotonummers onder dat doel hangen - een net
-- geimporteerde Ares-opdracht op "0 van 0" telt hier nog niet mee, en dat is
-- correct: er is nog geen bewerking om als besparing te tellen).
--
-- Bewust géén is_coordinator()-filter: dit is, net als v_dashboard_status en
-- v_goal_usage, een pure aggregaatteller zonder namen. De paginagate in
-- app/(app)/dashboard/page.tsx is hier de grens, zoals bij die twee views ook
-- al het geval was.
-- =============================================================================

create or replace view v_savings as
select
  count(*) filter (where a.status = 'approved') as approved_summer_to_winter,
  count(*)                                       as total_summer_to_winter
from assignments a
where a.acco_id like 'AT.%'
  and exists (
    select 1 from edit_items ei where ei.assignment_id = a.id and ei.goal_code = 'summer_to_winter'
  );

grant select on v_savings to authenticated;
