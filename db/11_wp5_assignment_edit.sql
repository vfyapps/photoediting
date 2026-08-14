-- =============================================================================
-- VfY AI Photo Editing App - V3-WP5: opdrachten bewerken/annuleren/verwijderen
-- Idempotent: kolom if-not-exists, view via create-or-replace.
-- =============================================================================

-- Reden bij handmatig annuleren (status -> ai_rejected buiten de QC-flow om).
-- QC-afkeuren blijft via qc_findings lopen; dit is uitsluitend voor de
-- coordinator die een opdracht direct als niet-bruikbaar markeert (bv. een
-- verkeerd geimporteerde of gedupliceerde opdracht).
alter table assignments add column if not exists cancel_reason text;

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
  a.import_goal_code,
  a.cancel_reason
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
