-- Gegenereerd door migration/migrate_xlsx.py. Niet handmatig aanpassen.
-- Bron: VfY_FotoBewerking_Tracker.xlsx
-- Gegenereerd: 2026-07-27T15:57:31
-- Draaien na 01_schema.sql en 02_seed_reference.sql.

begin;

-- Verhuurexperts
insert into rental_experts (name, is_team) values ('Georg Stiegler', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Daniel Hell', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Ilse Heijnen', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Carl-Peter Echtermeijer', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Mark van Bruggen', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Jacqueline Kunst-Dubois', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Verhuur Nederland', true) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Koen van Tuijn', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Karin Wagemans', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Phyllis Muschalik', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Karl Vannerem', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Monique van der Stap', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Sabine van Tuijn', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Wim Westerdijk', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Paula Huizenga', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Matthias Hauer', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Michael Fritz', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Brigitte Bruijnse', false) on conflict (name) do nothing;
insert into rental_experts (name, is_team) values ('Martijn de Jongh', false) on conflict (name) do nothing;

-- Editors
insert into editors (name) values ('Jill') on conflict (name) do nothing;
insert into editors (name) values ('Wouter') on conflict (name) do nothing;
insert into editors (name) values ('Kaylee') on conflict (name) do nothing;
insert into editors (name) values ('Rosalynn') on conflict (name) do nothing;
insert into editors (name) values ('Edward') on conflict (name) do nothing;

-- Opdrachten en foto's
-- Elke opdracht krijgt een tijdelijke sleutel via de variabele v_id.
do $migratie$
declare
  v_id uuid;
begin
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6364.53', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-03-16', '2026-03-16', '2026-03-20',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 7);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6370.09', (select id from rental_experts where name = 'Daniel Hell'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-03-16', '2026-03-16', '2026-03-20',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 5);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9971.14', (select id from rental_experts where name = 'Daniel Hell'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-03-16', '2026-03-16', '2026-03-25',
    'Vervormingen en AI errors'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 62);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 64);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 66);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6336.01', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-03-16', '2026-03-16', '2026-03-27',
    'Bij foto 68 en 69 is de tekst op het VfY-bord vervormd.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 52);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 53);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 55);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.10', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-03-16', '2026-03-16', '2026-03-31',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 74);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 85);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.47', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-03-16', '2026-03-16', '2026-03-31',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 24);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 31);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.2159.02', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-03-26', '2026-03-26', '2026-03-31',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 36);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 39);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 52);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 55);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.2159.01', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-03-26', '2026-03-26', '2026-03-31',
    'Terrastafel sfeervoller aankleden volgende x'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 41);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 60);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 77);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 78);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 79);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 104);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 107);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 108);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 109);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.03', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-03', '2026-04-03', '2026-04-15',
    'Bij foto 58 zijn 2 schoorstenen toegevoegd die ik op het origineel niet zie'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 48);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 49);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 50);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 51);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 52);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 54);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 55);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 56);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 48);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 49);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 50);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 51);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 54);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.15', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    'Foto 3 oogt te kunstmatig + er zijn dingen toegevoegd die er niet zijn (blik naar binnen bijv. - in het origineel zijn de deuren gesloten).'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 52);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 62);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.16', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    'Kun je foto 52 nog eens proberen, en in je prompt ook specifiek een omschrijving van een huisnummerbord verwerken?'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 41);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 51);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 52);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.181', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    'Kun je foto 58 nog eens proberen, en in je prompt ook specifiek een omschrijving van een huisnummerbord verwerken?'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 58);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 60);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 78);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.03', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 43);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 58);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 59);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.211', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 50);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.02', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 70);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.05', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-13',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 41);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 43);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 70);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.06', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-13',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 67);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 69);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.08', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-13',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 49);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 52);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.10', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-13',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 65);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 67);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.11', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-13',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 62);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 72);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.12', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-13',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 69);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.14', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-13',
    'Misschien groene blaadjes toevoegen.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 52);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.201', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 43);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 57);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.202', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 41);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 54);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.223', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 40);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.241', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 39);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 52);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.242', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-09', '2026-04-09', '2026-04-15',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 70);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5094.02', (select id from rental_experts where name = 'Mark van Bruggen'), (select id from editors where name = 'Wouter'),
    'approved', 'high',
    '2026-04-09', '2026-04-10', '2026-04-10',
    '3: 2 eenpersoonsbedden aan elkaar, nachtkastje+lamp beide zijden, rolgordijn raam, kast rechts weg · 4/5: idem maar zonder kast verwijderen · 6: badkamer lichter/mooier maken · 7: idem badkamer + opstapkrukje voor het bad · 8: muur waar 4p eettafel komt · 9: TV-muur, rechts bank+tafeltjes, links 2 stoelen · 12: rechts 4p eettafel, links TV aan muur naast deur, bank+salontafel+2 stoelen, vloer blijft grijs, draai plafondlamp weg · 17: kapotte kast → glans wit zoals rest, cups koffiemachine+waterkoker erop · 18: eetmeubilair op terras, zit-loungebank, terras helemaal schoonmaken, klein voorkorfje, evt 2 ligstoelen op gras, schutting hoek naast schuur tot huis (privacy) · 25: geen mensen in zwembad'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'make_beds', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'make_beds', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'make_beds', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 25);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5171.12', (select id from rental_experts where name = 'Mark van Bruggen'), (select id from editors where name = 'Wouter'),
    'approved', 'high',
    '2026-04-09', '2026-04-10', '2026-04-10',
    'Woning in aanbouw; verwijder bouwmateriaal, voeg luxe meubels/inrichting toe, maak alles volledig afgewerkt.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 14);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.34210.34', (select id from rental_experts where name = 'Jacqueline Kunst-Dubois'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-15', '2026-04-15', '2026-04-22',
    'Kun je foto 69 de tafel dekken?'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 19);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6341.01', (select id from rental_experts where name = 'Daniel Hell'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-16', '2026-04-16', '2026-04-22',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 6);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6370.27', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-21', '2026-04-21', '2026-04-24',
    'Tandenborstel verwijderen -> tandenborstel alleen weghalen lukte niet dus ik heb dat hele ding weggehaalt.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 24);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 25);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.03', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-04-21', '2026-04-21', '2026-04-24',
    'Dozen verwijderen'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 64);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4491.02', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-16',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 17);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.32', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-04-09', '2026-05-06',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 24);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 25);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 37);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.14', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-05-04', '2026-05-06',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 82);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 83);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 84);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8813.36', (select id from rental_experts where name = 'Koen van Tuijn'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    '2026-05-04', '2026-05-04', '2026-05-06',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 46);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 47);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 100);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 101);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 102);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.07', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'new', 'high',
    '2026-07-08', '2026-07-08', null,
    'Improve summer: gras vol maken. Winter: buitenfoto''s ogen wat somber, graag zonniger/frisser maken met iets meer sneeuw.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 80);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 82);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 83);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 85);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 86);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 89);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 96);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 97);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 100);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 102);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 106);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 107);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 109);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8785.07', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    '2026-05-04', '2026-05-04', '2026-05-06',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 10);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4491.14', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-16',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 152);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 154);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 155);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 156);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 163);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 165);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.34', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-16',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 24);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 25);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 50);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.14', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-17',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 22);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.30', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-17',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 25);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 59);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 61);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4491.06', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-17',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 41);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 43);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 44);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 48);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4491.20', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-17',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 33);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 40);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4491.17', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-22',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 28);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.31', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-17',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 37);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.29', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-17',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 33);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 35);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.25', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-17',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 19);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4356.03', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-17',
    'foto 8 en 6 zijn dezelfde foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 17);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4491.04', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-17',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 13);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.24', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-22',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 13);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4356.02', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-22',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 22);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4491.21', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-22',
    'verwijder alle vermeldingen van ''''Zilt'''' in foto''s'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 18);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.8630.01', (select id from rental_experts where name = 'Karin Wagemans'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-06', '2026-05-06', '2026-05-22',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 37);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.8630.02', (select id from rental_experts where name = 'Karin Wagemans'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-06', '2026-05-06', '2026-05-22',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 33);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5531.02', null, (select id from editors where name = 'Jill'),
    'approved', 'high',
    null, '2026-05-07', '2026-05-23',
    'Roze orchidee in woonkamerfoto''s verwijderen, theedoeken in keukenfoto''s verwijderen, fruitschaaltje op aanrecht verwijderen.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 52);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 53);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 56);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 57);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 58);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 60);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 61);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 65);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 70);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 81);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.09', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'new', 'high',
    '2026-07-08', '2026-07-08', null,
    'Gras bijwerken'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 114);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 115);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 119);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 120);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 123);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.15', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'new', 'high',
    '2026-07-08', '2026-07-08', null,
    'Gras bijwerken'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 62);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 82);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 83);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 84);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 86);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 102);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 103);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 104);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 107);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 108);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 109);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 110);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 111);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5752.10', (select id from rental_experts where name = 'Phyllis Muschalik'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-11', '2026-05-11', '2026-05-23',
    'gras groener'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 12);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9971.13', (select id from rental_experts where name = 'Daniel Hell'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    null, '2026-05-04', '2026-06-11',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 48);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6526.01', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-09',
    'Ik heb extra op de bomen gelet dus ik hoop dat het zo goed is'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 70);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 75);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8785.08', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-09',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 31);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8785.09', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-09',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 16);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8785.11', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-09',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 18);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8785.13', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-09',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 57);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 58);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8785.14', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-09',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 53);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 57);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 58);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8785.17', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-04', '2026-05-04', '2026-05-09',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 55);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 57);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6370.27', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    null, '2026-05-04', '2026-05-09',
    'bij foto 47 en 53, 52 loopt het gras te ver door over de stenen'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 36);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 37);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 39);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 40);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.7573.02', null, (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-19', '2026-05-12', '2026-05-23',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 70);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 71);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 95);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 96);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 99);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6364.90', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-05-08', '2026-05-08', '2026-06-08',
    'Kun je deze opnieuw doen? De woning wordt gezandstraald waardoor het hout lichter van kleur wordt aan de buitenkant.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 21);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 21);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 9);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6372.02', (select id from rental_experts where name = 'Daniel Hell'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-05', '2026-06-05', '2026-06-10',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 28);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.7955.01', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-05', '2026-06-05', '2026-06-09',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 49);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 50);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 51);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 53);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 61);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 62);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4265.02', (select id from rental_experts where name = 'Mark van Bruggen'), (select id from editors where name = 'Jill'),
    'approved', 'high',
    '2026-05-07', '2026-05-07', '2026-05-08',
    '38: glazen douchewand. 42/52/62/67: gras groen. 48: gordijnen voor ramen. 50/55: toiletbril erop. 54: helderder + bloemen/fruitmand. 56: gras groen + helderder. 58: spot plafond. 64: rolgordijn. 65: tv in hoek + belichting. 71: helderder + tv links in hoek.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 54);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 56);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 65);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 71);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 42);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 48);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 50);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 52);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 54);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 55);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 56);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 58);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 62);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 64);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 65);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 67);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 71);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 38);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.3690.08', (select id from rental_experts where name = 'Karin Wagemans'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-05', '2026-06-05', '2026-06-12',
    'Probeer de foto''s minder oranje te maken bij de volgende opdrachten'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 56);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 58);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 59);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 60);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 71);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 73);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 74);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6364.91', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-05-12', '2026-05-12', '2026-06-19',
    'zwembad verwijderen'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 43);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 44);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 46);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.11700.02', (select id from rental_experts where name = 'Jacqueline Kunst-Dubois'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-05-08', '2026-05-08', '2026-06-10',
    'Gaat voornamelijk om het schoonmaken van het gebouw/huis en de algehele uitstraling te verbeteren'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 46);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 47);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 48);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 49);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 46);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 47);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 48);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 49);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.6940.14', (select id from rental_experts where name = 'Karl Vannerem'), (select id from editors where name = 'Kaylee'),
    'new', 'high',
    '2026-07-10', '2026-07-10', null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 31);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.34210.32', (select id from rental_experts where name = 'Monique van der Stap'), (select id from editors where name = 'Rosalynn'),
    'new', 'high',
    '2026-07-17', '2026-07-17', null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 21);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.34210.25', (select id from rental_experts where name = 'Monique van der Stap'), (select id from editors where name = 'Rosalynn'),
    'new', 'high',
    '2026-07-17', '2026-07-17', null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 20);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.34210.03', (select id from rental_experts where name = 'Monique van der Stap'), (select id from editors where name = 'Rosalynn'),
    'new', 'high',
    '2026-07-17', '2026-07-17', null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 37);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 60);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 61);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5671.02', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-18', '2026-06-18', '2026-06-26',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 20);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.3950.02', (select id from rental_experts where name = 'Karin Wagemans'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-25', '2026-06-25', '2026-06-29',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 118);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 119);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 120);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 121);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 128);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6365.66', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-19', '2026-06-19', '2026-06-29',
    'Ik heb foto 31 offline gehaald omdat die kwalitatief niet goed genoeg is. Kun je daar nog eens naar kijken?'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 5);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6365.14', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-22', '2026-06-22', '2026-06-30',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 42);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8862.07', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-05-13', '2026-05-13', null,
    'Foto 6 en 10 lijken niet genoeg op realiteit, foto 48 te donker'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 21);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 22);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 24);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 25);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 28);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 32);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 33);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 36);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 37);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 39);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 21);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 22);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 24);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 25);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 28);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 32);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 33);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 36);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 37);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 39);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5453.02', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'approved', 'high',
    '2026-07-07', '2026-07-07', '2026-07-11',
    'Te donker en een witte rand aan de bovenkant'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 83);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 97);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5453.03', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'approved', 'high',
    '2026-07-07', '2026-07-07', '2026-07-11',
    'Te donker'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 63);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5453.06', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'approved', 'high',
    '2026-07-07', '2026-07-07', '2026-07-11',
    'Te donker en een witte rand aan de bovenkant'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 107);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.7671.02', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'approved', 'high',
    '2026-07-08', '2026-07-08', '2026-07-11',
    'Foto 174, 175 en 177: Witte rand aan de bovenkant'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 48);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 55);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 146);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 161);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 48);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 55);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 146);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 161);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5661.04', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-22', '2026-06-22', null,
    'Kun je hier nog even kijken naar sorteren en het offline halen van de originele foto''s?'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 59);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 60);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 83);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 84);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 85);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6365.20', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-22', '2026-06-22', null,
    'Ik heb foto 4 offline gehaald omdat het tuinmeubilair (en het terras in het algemeen) te veel afwijkt van de realiteit. Heb er zelf ook 1 toegevoegd (foto x).'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 40);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5753.17', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'approved', 'high',
    '2026-07-07', '2026-07-07', '2026-07-10',
    'Ik vind ze nog steeds te donker; zie uitleg Teams'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 67);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 77);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 81);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5753.19', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'approved', 'high',
    '2026-07-07', '2026-07-07', '2026-07-10',
    'Ik vind ze nog steeds te donker; zie uitleg Teams'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 112);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 122);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 123);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6292.04', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'approved', 'medium',
    null, '2026-06-22', '2026-07-02',
    'Die stenen voor de ingang zijn er niet in het echt'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 33);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5453.01', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Kaylee'),
    'approved', 'high',
    '2026-07-07', '2026-07-07', '2026-07-10',
    'Ik vind deze nog steeds te donker; zie uitleg Teams'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 89);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5570.24', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-05-04', '2026-05-25',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 40);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9971.12', (select id from rental_experts where name = 'Daniel Hell'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-03-16', '2026-05-01',
    'Planten/bomen zien er zomers uit'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 56);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 57);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 59);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5453.04', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-03-25', '2026-04-07',
    'Tafels sfeervoller aankleden volgende x. Je hebt nu alleen de belichting aangepast.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 13);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5542.01', (select id from rental_experts where name = 'Wim Westerdijk'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-03-25', '2026-04-07',
    'Probeer de oranje gloed iets te beperken volgende x. Een beetje is wel mooi, maar teveel valt op'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 22);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 25);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 16);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5570.22', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-03-25', '2026-04-15',
    'Goed, maar kun je de tafels dekken op de terrasfoto''s? Bijv. met wijn, een karaf water etc. Alsof er mensen verblijven op dat moment.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 43);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 38);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6323.01', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-03-25', '2026-04-20',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 23);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5570.33', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-03-25', '2026-04-22',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 39);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.10', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-04-03', '2026-04-22',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 45);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 46);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 47);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 50);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 51);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 52);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 53);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 54);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 55);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.15', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-04-03', '2026-04-22',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 36);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 37);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 40);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 41);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.08', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-04-03', '2026-04-22',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 76);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 77);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 78);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 79);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 81);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 84);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.29', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-04-09', '2026-05-01',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 52);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 57);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 58);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 60);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 61);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 62);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.6660.01', null, (select id from editors where name = 'Wouter'),
    'approved', 'medium',
    '2026-04-16', '2026-04-16', '2026-04-17',
    'Foto 2: fornuis -> koelvriescombi. Foto 27: sticker verwijderen'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 27);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4484.06', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Edward'),
    'approved', 'medium',
    null, '2026-04-17', '2026-04-17',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 6);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.33', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Edward'),
    'approved', 'medium',
    null, '2026-04-17', '2026-04-17',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 41);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 42);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.16', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Edward'),
    'approved', 'medium',
    null, '2026-04-17', '2026-04-17',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 26);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4354.01', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Edward'),
    'approved', 'medium',
    null, '2026-04-17', '2026-04-17',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 112);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4356.01', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Edward'),
    'approved', 'medium',
    null, '2026-04-17', '2026-04-17',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 36);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4491.15', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Edward'),
    'approved', 'medium',
    null, '2026-04-17', '2026-04-17',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 31);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4491.09', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Edward'),
    'approved', 'medium',
    null, '2026-04-17', '2026-04-17',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 23);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4493.18', (select id from rental_experts where name = 'Verhuur Nederland'), (select id from editors where name = 'Edward'),
    'approved', 'medium',
    null, '2026-04-17', '2026-04-17',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'remove_object', 8);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5570.31', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Jill'),
    'approved', 'medium',
    null, '2026-05-04', '2026-05-25',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 57);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 39);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 49);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 49);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 57);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.31', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'approved', 'medium',
    null, '2026-06-22', '2026-07-01',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 45);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.46120.09', (select id from rental_experts where name = 'Jacqueline Kunst-Dubois'), (select id from editors where name = 'Kaylee'),
    'approved', 'high',
    '2026-07-06', '2026-07-06', '2026-07-07',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 21);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 22);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 24);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6361.116', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Kaylee'),
    'approved', 'high',
    '2026-07-06', '2026-07-06', '2026-07-07',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 42);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 44);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 47);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6335.01', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Wouter'),
    'approved', 'high',
    '2026-07-10', '2026-07-10', '2026-07-10',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 80);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 81);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 82);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 84);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6300.15', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-30', '2026-06-30', '2026-07-01',
    'Ik vind deze winterfoto''s een beetje te donker/grauw. Kun je hier opnieuw naar kijken?'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 37);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 38);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.17470.01', (select id from rental_experts where name = 'Jacqueline Kunst-Dubois'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-25', '2026-07-02', null,
    'Ik heb ''m alleen bij improve lighting gezet, maar sommige foto''s kunnen ook wel wat meer sfeer gebruiken. Dat laat ik aan jouw oordeel over.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 10);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 21);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 22);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 24);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 25);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 28);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 32);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 36);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 37);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.16320.01', (select id from rental_experts where name = 'Jacqueline Kunst-Dubois'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-06-25', '2026-07-02', null,
    'Foto 29 heb je een raam erbij getoverd links. Foto 30 is wat te donker. Foto 35 had je getagged als exterieur, maar is meer terras (laatste heb ik al aangepast).'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 7);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 25);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.34210.33', (select id from rental_experts where name = 'Monique van der Stap'), (select id from editors where name = 'Rosalynn'),
    'approved', 'high',
    '2026-07-17', '2026-07-17', null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9542.01', (select id from rental_experts where name = 'Carl-Peter Echtermeijer'), (select id from editors where name = 'Rosalynn'),
    'in_process', 'medium',
    null, '2026-04-07', null,
    'ik kan foto 76 niet vinden'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 2);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6370.28', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'medium',
    null, '2026-06-12', null,
    'Ambiance: terras aankleden'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 39);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 40);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 41);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 9);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5571.12', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Kaylee'),
    'approved', 'low',
    null, '2026-07-07', null,
    'Witte rand aan de bovenkant'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 42);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 41);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5571.05', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Kaylee'),
    'approved', 'low',
    null, '2026-07-07', null,
    'Witte rand aan de bovenkant'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 17);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5571.09', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Kaylee'),
    'approved', 'low',
    null, '2026-07-07', null,
    'Witte rand aan de bovenkant'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 59);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 60);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 61);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 71);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 72);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5571.10', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Kaylee'),
    'approved', 'low',
    null, '2026-07-07', null,
    'Witte rand aan de bovenkant'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 23);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5571.04', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Kaylee'),
    'approved', 'low',
    null, '2026-07-07', null,
    'Witte rand aan de bovenkant'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 52);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 53);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 54);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 55);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 56);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6361.83', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Kaylee'),
    'approved', 'low',
    null, '2026-07-07', null,
    'Witte rand aan de bovenkant'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 25);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 28);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 31);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5531.07', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'approved', 'medium',
    null, '2026-05-04', null,
    'Je hebt winter -> zomer gedaan. De winterfoto''s die hier staan zijn niet zo mooi omdat de sneeuw al aan het smelten was, dat willen we iets mooier maken.'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 80);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 83);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 85);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5550.01', (select id from rental_experts where name = 'Wim Westerdijk'), (select id from editors where name = 'Rosalynn'),
    'denied', 'medium',
    null, '2026-05-04', null,
    'Ik vind 34 en 35 wel erg geel/oranje. Kun je daar nog eens naar kijken?'
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 25);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 28);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 1);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5453.03', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'qc', 'medium',
    null, '2026-05-04', null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 46);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 51);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 49);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 49);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5505.04', (select id from rental_experts where name = 'Ilse Heijnen'), (select id from editors where name = 'Rosalynn'),
    'qc', 'medium',
    null, '2026-05-04', null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 77);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 35);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.9976.03', (select id from rental_experts where name = 'Paula Huizenga'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 35);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 56);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'make_beds', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'make_beds', 45);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6335.01', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 40);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 44);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 45);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 46);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6300.09', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 22);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 24);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 30);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5771.18', (select id from rental_experts where name = 'Matthias Hauer'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 32);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5771.17', (select id from rental_experts where name = 'Matthias Hauer'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 20);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'DE.72178.01', (select id from rental_experts where name = 'Matthias Hauer'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 20);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 10);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'DE.06493.08', (select id from rental_experts where name = 'Matthias Hauer'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 4);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6365.46', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 50);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 45);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6365.47', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 24);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 32);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 59);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 60);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 61);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6365.48', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 32);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 72);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 73);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 75);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6365.49', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 21);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 50);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 53);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 54);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6365.50', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 39);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 43);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 45);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 46);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 47);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5771.19', (select id from rental_experts where name = 'Matthias Hauer'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 34);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5771.20', (select id from rental_experts where name = 'Matthias Hauer'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 36);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5771.21', (select id from rental_experts where name = 'Matthias Hauer'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 33);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 50);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 58);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5771.22', (select id from rental_experts where name = 'Matthias Hauer'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 35);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6391.06', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 27);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6391.07', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 2);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6235.02', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 36);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6235.04', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 47);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6235.05', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 9);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 78);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 79);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6235.09', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 46);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 47);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 29);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6235.10', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 33);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 56);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 46);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 47);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6235.11', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 16);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 4);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6361.82', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Rosalynn'),
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 28);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 40);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 41);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5602.02', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 47);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 2);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5630.01', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 28);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5630.05', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 31);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5630.06', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 8);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 23);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5661.01', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 87);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 50);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 51);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 88);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 91);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5700.29', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 15);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5700.31', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 5);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 12);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5700.32', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 3);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5700.35', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 14);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 22);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 23);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5710.11', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 19);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 23);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5710.30', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 44);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5710.36', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5710.37', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 57);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 4);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 6);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 8);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5721.18', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 33);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 36);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5721.24', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 3);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 34);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5721.50', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 45);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 44);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 56);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5722.05', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 62);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 64);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 66);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 69);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5722.07', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 48);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 54);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 58);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5722.09', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 46);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5722.12', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 26);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 32);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 61);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 64);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5722.15', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 28);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 31);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5723.01', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 32);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 33);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 35);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5730.02', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 12);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 21);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 22);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 25);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5743.03', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 27);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 11);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 28);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 29);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5743.06', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 57);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 58);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 65);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5754.05', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'ai_rejected', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6391.08', (select id from rental_experts where name = 'Georg Stiegler'), (select id from editors where name = 'Kaylee'),
    'approved', 'low',
    null, '2026-07-03', '2026-07-03',
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'summer_to_winter', 2);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 47);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 48);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5743.11', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 36);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 24);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5743.12', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 21);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 30);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 31);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 32);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5743.18', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 36);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 38);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 39);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 40);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 17);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5752.14', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 41);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 42);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 65);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 66);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 67);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5752.25', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 13);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 14);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5752.32', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 53);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 54);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5754.03', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 29);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_ambiance', 45);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_summer', 23);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5754.09', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'new', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 1);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 15);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 34);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 18);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 19);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5571.13', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Kaylee'),
    'qc', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'improve_lighting', 23);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 17);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 75);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5571.15', (select id from rental_experts where name = 'Sabine van Tuijn'), (select id from editors where name = 'Kaylee'),
    'qc', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 42);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 43);
  insert into edit_items (assignment_id, goal_code, photo_number) values (v_id, 'replace_sky', 44);
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5761.02', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5761.03', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5761.16', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.5771.02', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6181.01', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6236.04', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6236.41', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6260.04', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6260.05', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6274.06', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6274.09', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6280.11', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6280.24', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6284.02', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6290.07', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6292.04', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6300.07', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6300.09', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6311.22', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6334.01', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6361.25', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6361.79', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6361.84', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6361.85', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6361.92', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6363.29', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6363.33', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6364.18', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6364.29', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6365.45', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6370.01', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6370.20', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6380.09', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6424.01', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6432.01', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6555.13', (select id from rental_experts where name = 'Georg Stiegler'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6731.01', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6752.02', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6773.06', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6782.03', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.6874.01', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8785.06', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8861.34', (select id from rental_experts where name = 'Koen van Tuijn'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.05', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.08', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.10', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.20', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.22', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.27', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.29', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8953.30', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8965.02', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8967.21', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8967.23', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8967.27', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8967.29', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8967.35', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8967.36', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8967.37', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8967.41', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.8967.45', (select id from rental_experts where name = 'Wim Westerdijk'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9620.05', (select id from rental_experts where name = 'Sabine van Tuijn'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9863.03', (select id from rental_experts where name = 'Sabine van Tuijn'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'AT.9971.06', (select id from rental_experts where name = 'Michael Fritz'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.2300.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.2330.04', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.2440.02', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.3621.04', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.3630.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.3660.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.3941.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.4990.02', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.4990.04', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.8430.02', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.8620.05', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.9690.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'BE.9750.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'DE.23968.02', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'DE.23999.05', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'DE.23999.06', (select id from rental_experts where name = 'Phyllis Muschalik'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'DE.34305.01', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.04360.01', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.06560.02', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.08200.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.08430.01', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.08430.02', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.08430.03', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.08430.04', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.11200.01', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.11700.03', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.20111.01', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.46120.16', (select id from rental_experts where name = 'Jacqueline Kunst-Dubois'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.46140.02', (select id from rental_experts where name = 'Jacqueline Kunst-Dubois'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.46340.02', (select id from rental_experts where name = 'Mark van Bruggen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.50450.01', (select id from rental_experts where name = 'Jacqueline Kunst-Dubois'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.66310.01', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83120.02', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83240.01', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83380.04', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83420.01', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83420.02', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83440.05', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83440.06', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83440.07', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83510.01', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83570.02', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83583.01', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83600.03', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83780.01', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.83860.03', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.84200.01', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.84210.01', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.84500.01', (select id from rental_experts where name = 'Monique van der Stap'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'FR.84700.01', (select id from rental_experts where name = 'Brigitte Bruijnse'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.1759.04', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.1851.01', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.1851.02', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.1851.03', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.1865.01', (select id from rental_experts where name = 'Mark van Bruggen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.1871.02', (select id from rental_experts where name = 'Mark van Bruggen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.3255.01', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.3781.02', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.3881.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.3881.02', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.3881.03', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4311.01', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4316.02', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4316.04', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4538.01', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4697.01', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4891.01', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.4904.01', (select id from rental_experts where name = 'Mark van Bruggen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5096.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5131.01', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5131.02', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5131.04', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5406.10', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5406.11', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5406.12', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5409.01', (select id from rental_experts where name = 'Martijn de Jongh'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5411.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5424.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.5427.01', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.6276.02', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.6627.02', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.6627.03', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.7711.02', (select id from rental_experts where name = 'Ilse Heijnen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.8072.01', (select id from rental_experts where name = 'Mark van Bruggen'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.8077.04', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.8077.07', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.8077.14', (select id from rental_experts where name = 'Karin Wagemans'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.8538.04', (select id from rental_experts where name = 'Paula Huizenga'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
  insert into assignments (acco_id, rental_expert_id, editor_id, status, priority, request_date, date_assigned, date_completed, legacy_notes) values (
    'NL.9642.01', (select id from rental_experts where name = 'Paula Huizenga'), null,
    'backlog', 'low',
    null, null, null,
    null
  ) returning id into v_id;
end
$migratie$;

commit;
