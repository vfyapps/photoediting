-- =============================================================================
-- VfY AI Photo Editing App - V3-WP4: instellingen voor de besparingsberekening
-- Bedragen komen van de eigenaar (echte vendortarieven), niet geschat door de
-- bouwer - zie BUILDPLAN-V3.md §2 (businesscase, gecorrigeerd na navraag) en
-- §V3-WP4.1. Beide zonder deploy aanpasbaar via Beheer > Instellingen.
-- =============================================================================

insert into app_settings (key, value, description) values
  ('avoided_shoot_cost_eur', '137',
   'Vermeden kosten per fotoshoot bij een AI-winterimpressie (AT: €50 buiten + €55 drone + €32 reistoeslag 0-50km). Alleen AT-woningen tellen mee, wintershoots gebeuren nergens anders.'),
  ('monthly_editing_cost_eur', '215.55',
   'Maandelijkse kosten AI-editing (personeel + Magnific), voor de tegenhanger van de besparing op het dashboard.')
on conflict (key) do nothing;
