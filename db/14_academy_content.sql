-- =============================================================================
-- VfY AI Photo Editing App - Academy vullen met content
-- De guidelines-tabel kreeg in 04_v2_academy.sql een track-kolom
-- (onboarding/goal/tips), maar niemand heeft de bestaande rijen ooit
-- omgezet - ze staan allemaal nog op de default 'tips'. Dit script:
--   1. zet de bestaande rijen op het juiste track (bugfix, geen contentwijziging)
--   2. vult onboarding aan tot een samenhangend "stap 1 tot 100"-verhaal
--   3. seedt de tot nu toe lege academy_prompts-tabel met een startset
--
-- Nieuwe modules en prompts gaan als CONCEPT de deur uit (is_published =
-- false / geen publish-datum-equivalent nodig, academy_prompts heeft geen
-- publish-vlag en is dus meteen zichtbaar - zie opmerking hieronder).
-- Een coordinator reviewt en publiceert de guidelines-concepten zelf via
-- Beheer > Academy voordat editors ze zien.
--
-- Draaien in de Supabase SQL editor, na 04_v2_academy.sql. Idempotent: elke
-- insert gaat via slug/titel-conflict, updates zijn 'where'-gescopet.
-- =============================================================================

begin;

-- =============================================================================
-- 1. Bestaande rijen op het juiste track zetten
-- =============================================================================

-- De zeven per-doel-richtlijnen horen bij track 'goal', niet 'tips'.
update guidelines
set track = 'goal'
where goal_code is not null
  and track = 'tips';

-- Vier van de vijf werkwijze/kwaliteit-richtlijnen zijn fundamenteel genoeg
-- om bij onboarding te horen (het proces van 1 tot 100), niet bij tips
-- ("wat de coordinator tussendoor deelt"). "Veelgemaakte fouten" blijft een
-- tip: het is een naslagwerk dat je er tussendoor bij pakt, geen eerste stap.
update guidelines
set track = 'onboarding'
where slug in ('fotoselectie', 'werkwijze-status', 'grens-realiteit', 'prompten')
  and track = 'tips';

-- =============================================================================
-- 2. Onboarding aanvullen: het proces van 1 tot 100
-- =============================================================================
-- sort_order 1-5 bestaat al (fotoselectie, werkwijze-status, grens-realiteit,
-- prompten liggen verspreid over 1/2/3/5 - zie db/02_seed_reference.sql).
-- Deze twee sluiten de cirkel: de eerste opdracht, en wat er gebeurt als QC
-- hem terugstuurt.

insert into guidelines (slug, title, category, track, sort_order, is_published, body_md)
select
  'eerste-opdracht', 'Je eerste opdracht, stap voor stap', 'werkwijze', 'onboarding', 6, false,
  E'Dit is de kortste route van een nieuwe opdracht naar een goedgekeurd resultaat.\n\n'
  '1. **Open de opdracht** vanaf het bord of de tabel. Je ziet de woning, de aangevraagde '
  'doelen en de aangeleverde foto''s.\n'
  '2. **Zet de opdracht op In process** zodra je begint - dat is zichtbaar voor de coordinator '
  'en houdt het bord kloppend.\n'
  '3. **Lees de doel-richtlijnen** rechts in het scherm voordat je in Magnific begint. Elk doel '
  'heeft een eigen kaart met wat wel en niet mag.\n'
  '4. **Bewerk per foto**, niet per woning in één keer - zie de richtlijn "Prompten in Magnific".\n'
  '5. **Vink elke foto af** zodra hij klaar is. Pas als alles is afgevinkt kan de opdracht naar QC.\n'
  '6. **Zet de opdracht op QC.** De coordinator beoordeelt en zet hem op Approved of Denied.\n'
  '7. **Bij Denied**: de bevindingen staan per foto in het QC-tabblad van de opdracht. Los ze op '
  'en zet de opdracht opnieuw op QC - niet terug naar In process.\n\n'
  '> Twijfel je halverwege of iets binnen de regels valt? Zie "De grens: wat mag AI wel en niet". '
  'Bij twijfel: QC met een notitie, niet gokken.'
where not exists (select 1 from guidelines where slug = 'eerste-opdracht');

insert into guidelines (slug, title, category, track, sort_order, is_published, body_md)
select
  'qc-leercirkel', 'QC-feedback: hoe de leercirkel werkt', 'werkwijze', 'onboarding', 7, false,
  E'De Academy en QC zijn met elkaar verbonden - dat is bewust zo opgezet.\n\n'
  '- Elke afkeurreden bij QC heeft een vaste categorie, bijvoorbeeld "Te donker of grauw" of '
  '"Toegevoegde elementen".\n'
  '- Komt een categorie opvallend vaak voor over het hele team, dan signaleert de app dat op het '
  'opdrachtenscherm - niet gekoppeld aan een naam, dit is geen persoonlijke beoordeling.\n'
  '- Diezelfde categorieen kunnen een academy-module voorstellen ("QC-suggested"). Een coordinator '
  'beoordeelt en publiceert die - de app publiceert nooit zelf.\n'
  '- Jouw eigen QC-geschiedenis staat bij je opdrachten. Team-gemiddeldes zie je geanonimiseerd; '
  'cijfers van individuele collega''s zie je niet - dat is een bewuste RLS-keuze, geen bug.\n\n'
  'Kortom: hoe vaker eenzelfde fout voorkomt, hoe groter de kans dat er een Academy-module over '
  'verschijnt. Lees ze - ze zijn geschreven naar aanleiding van echte afkeuringen.'
where not exists (select 1 from guidelines where slug = 'qc-leercirkel');

-- =============================================================================
-- 3. Startset Magnific-prompts per doel
-- =============================================================================
-- academy_prompts heeft geen is_published-vlag (zie 04_v2_academy.sql) en is
-- dus voor iedereen direct zichtbaar zodra de rij bestaat. Dit is een
-- startset die het team mag verfijnen zodra er ervaring mee is opgebouwd -
-- notes_md zegt dat er expliciet bij.

insert into academy_prompts (goal_code, title, prompt_text, notes_md, sort_order)
select * from (values
  ('summer_to_winter', 'Winterversie - buitenaanzicht',
   'Transform this summer exterior photo into a realistic winter scene: add fresh snow on the roof, '
   'ground and visible ledges (not on vertical walls), overcast pale-blue winter sky, bare or '
   'snow-dusted trees. Keep all architecture, windows, doors and signage exactly as in the original. '
   'Preserve natural daylight brightness - avoid a dark or grey result.',
   'Startprompt. Controleer altijd: sneeuw niet tegen verticale muren, resultaat niet te donker (zie richtlijn "Veelgemaakte fouten").', 1),
  ('summer_to_winter', 'Winterversie - terras/tuin',
   'Convert this garden/terrace photo to winter: snow-covered ground and furniture surfaces, remove '
   'summer foliage color and replace with bare branches or light snow cover, cool winter light. Do not '
   'remove or add furniture that is not in the original.',
   'Startprompt.', 2),
  ('improve_lighting', 'Donkere hoeken corrigeren',
   'Brighten the dark areas of this interior photo evenly without flattening the overall contrast. '
   'Keep window light natural and realistic - do not blow out window views. Avoid introducing any '
   'warm/orange color cast.',
   'Startprompt. Beoordeel achteraf altijd op kleurzweem (zie richtlijn "Veelgemaakte fouten").', 1),
  ('improve_ambiance', 'Terras: gedekte tafel',
   'Add an inviting table setting to this terrace/outdoor dining table: wine glasses, a water carafe, '
   'and glasses, as if guests are about to arrive. Keep the existing table and chairs exactly as they '
   'are - do not add or change furniture.',
   'Startprompt. Zie richtlijn "Sfeer verbeteren": accessoires toevoegen, geen meubilair.', 1),
  ('improve_ambiance', 'Loungehoek: kussens en parasol',
   'Add cushions to the existing outdoor lounge furniture and open the parasol if one is present in '
   'the photo. Do not add furniture pieces that are not already there.',
   'Startprompt.', 2),
  ('replace_sky', 'Bewolkte lucht vervangen',
   'Replace the grey/overcast sky with a clear blue sky with light clouds, matching the season and '
   'the light direction and shadows already visible in the photo. Blend the horizon and treeline '
   'naturally - avoid a visible halo around rooflines or trees.',
   'Startprompt. Let op schaduwrichting: een strakblauwe lucht bij zware schaduwen klopt niet.', 1),
  ('make_beds', 'Bed opmaken',
   'Make the bed neatly: straighten the duvet, plump and align the pillows upright. Keep the exact '
   'same number and type of beds as in the original photo - do not change a twin setup into a double '
   'bed.',
   'Startprompt. Opgerolde handdoeken op bed mag (VfY-stijl), zie richtlijn "Bedden opmaken".', 1),
  ('remove_object', 'Storend object verwijderen',
   'Remove the [object, e.g. car / bin / hose] from this photo and reconstruct the background behind '
   'it naturally and consistently with the surrounding materials and lighting.',
   'Startprompt, vul het object zelf in per foto. Lukt het niet netjes, verwijder liever het hele vlak dan een half resultaat - zie richtlijn "Object verwijderen".', 1),
  ('improve_summer', 'Gras en beplanting opfrissen',
   'Make the lawn greener and the planting fuller and more vibrant, adding depth and color while '
   'staying realistic. Do not let grass extend over paved areas, terraces or paths.',
   'Startprompt. "Gras loopt door over stenen" is een terugkerende afkeurreden.', 1)
) as t(goal_code, title, prompt_text, notes_md, sort_order)
where not exists (
  select 1 from academy_prompts p where p.goal_code = t.goal_code and p.title = t.title
);

commit;

-- =============================================================================
-- Controle achteraf, los te draaien in de SQL editor
-- =============================================================================
-- select track, is_published, count(*) from guidelines group by 1, 2 order by 1, 2;
-- select goal_code, count(*) from academy_prompts group by 1 order by 1;
