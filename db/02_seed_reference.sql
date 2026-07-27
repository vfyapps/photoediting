-- =============================================================================
-- Referentiedata. Draaien na 01_schema.sql.
-- Bron: tab "Legenda" uit VfY_FotoBewerking_Tracker.xlsx + de QC-notities uit
-- kolom "Notes QC" van diezelfde tracker (71 notities geanalyseerd).
-- =============================================================================

-- ── Editing goals (kolom B t/m H uit Excel) ──────────────────────────────────
insert into editing_goals (code, label_nl, label_en, description, icon, sort_order) values
  ('summer_to_winter', 'Zomer naar winter', 'Summer to winter',
   'Foto is gemaakt in de zomer, maar een winterversie is nodig voor de listing.', 'snowflake', 1),
  ('improve_lighting', 'Belichting verbeteren', 'Improve lighting',
   'Foto is te donker, te licht of heeft storende schaduwen.', 'sun', 2),
  ('improve_ambiance', 'Sfeer verbeteren', 'Improve ambiance',
   'Foto is technisch goed maar voelt koud, leeg of onuitnodigend aan.', 'sparkles', 3),
  ('replace_sky', 'Lucht vervangen', 'Replace sky',
   'Lucht is bewolkt, grauw of saai.', 'cloud', 4),
  ('make_beds', 'Bedden opmaken', 'Make beds',
   'Bed ziet er rommelig of onopgemaakt uit.', 'bed', 5),
  ('remove_object', 'Object verwijderen', 'Remove object',
   'Storend element in beeld, zoals een auto, vuilnisbak of persoon.', 'eraser', 6),
  ('improve_summer', 'Zomer verbeteren', 'Improve summer',
   'Foto is gemaakt in de zomer maar oogt dof, vlak of weinig uitnodigend.', 'leaf', 7);

-- ── QC-foutcategorieën ───────────────────────────────────────────────────────
-- Afgeleid uit de terugkerende opmerkingen in de oude kolom "Notes QC".
-- Vul aan zodra er nieuwe patronen opduiken, verwijder niets met historie.
insert into qc_issue_types (code, label_nl, description, sort_order) values
  ('too_dark',        'Te donker of grauw',
   'Eindresultaat is donkerder of doffer dan gevraagd. Meest voorkomende afkeurreden.', 1),
  ('color_cast',      'Kleurzweem (te oranje of geel)',
   'Onnatuurlijke warme gloed over de foto.', 2),
  ('white_border',    'Witte rand',
   'Witte rand aan de rand van het beeld, meestal boven. Ontstaat bij uitsnede of upscaling.', 3),
  ('hallucination',   'Toegevoegde elementen',
   'AI heeft iets toegevoegd dat niet bestaat: extra raam, schoorsteen, stenen, meubels.', 4),
  ('distortion',      'Vervorming',
   'Vervormde tekst, borden, lijnen of vlakken.', 5),
  ('not_realistic',   'Wijkt af van de realiteit',
   'Beeld klopt niet meer met de woning. Gasten verwachten iets anders dan ze aantreffen.', 6),
  ('artificial_look', 'Oogt kunstmatig',
   'Technisch correct maar duidelijk AI-achtig.', 7),
  ('grass_issue',     'Gras of beplanting onnatuurlijk',
   'Gras loopt door over stenen, is te groen of ziet er nep uit.', 8),
  ('season_mismatch', 'Verkeerd seizoen',
   'Verkeerde richting bewerkt of seizoen komt niet overeen met de opdracht.', 9),
  ('goal_not_met',    'Doel niet gehaald',
   'Alleen deelbewerking uitgevoerd, bijvoorbeeld wel belichting maar geen sfeer.', 10),
  ('duplicate_photo', 'Dubbele of ontbrekende foto',
   'Zelfde foto twee keer aangeleverd, of gevraagde foto ontbreekt.', 11),
  ('other',           'Overig',
   'Past niet in een bestaande categorie. Toelichting verplicht.', 99);

-- ── Guidelines ───────────────────────────────────────────────────────────────
insert into guidelines (slug, title, category, sort_order, body_md) values
(
  'fotoselectie', 'Fotoselectie', 'werkwijze', 1,
  E'## Kies maximaal 3 tot 5 foto''s per woning\n\n'
  '**Prioriteit 1: potentiële hero images.**\n'
  'Buitenkant, zwembad, terras, spectaculair interieur. Dit levert het meeste rendement.\n\n'
  '**Prioriteit 2: USP''s of bijzondere ruimtes die technisch tegenvallen.**\n'
  'Slechte belichting, vlakke sfeer, rommelig. De ruimte zelf moet interessant genoeg zijn.\n\n'
  '> Sla gewone of saaie ruimtes met slechte foto''s over. We kunnen foto''s verbeteren met AI, '
  'de ruimte zelf niet.'
),
(
  'werkwijze-status', 'Statussen en werkwijze', 'werkwijze', 2,
  E'| Status | Betekenis |\n'
  '| --- | --- |\n'
  '| Backlog | Kandidaatwoning uit de shortlist, nog geen opdracht |\n'
  '| New | Opdracht aangemeld, nog niet opgepakt |\n'
  '| In process | Editor is actief bezig |\n'
  '| QC | Bewerking klaar, wacht op kwaliteitscontrole |\n'
  '| Approved | QC geslaagd, foto gepubliceerd in ARES |\n'
  '| Denied | Voldoet niet, editor bewerkt opnieuw |\n'
  '| AI Rejected | Bewerking is technisch niet haalbaar, opdracht vervalt |\n\n'
  'Zet een opdracht zelf op **In process** zodra je begint, en op **QC** zodra je klaar bent. '
  'De coördinator beoordeelt en zet daarna Approved of Denied. Bij Denied zie je de bevindingen '
  'per foto terug in het tabblad QC van de opdracht.'
),
(
  'grens-realiteit', 'De grens: wat mag AI wel en niet', 'kwaliteit', 3,
  E'De harde regel: **een gast moet de woning herkennen bij aankomst.**\n\n'
  '**Wel toegestaan**\n'
  '- Belichting, contrast en kleur corrigeren\n'
  '- Lucht vervangen door een realistische lucht\n'
  '- Seizoen omzetten wanneer dat expliciet gevraagd is\n'
  '- Storende losse objecten verwijderen: vuilnisbak, auto, snoer, tandenborstel\n'
  '- Bed opmaken, tafel dekken, bestaand meubilair netjes zetten\n'
  '- Gras en beplanting opfrissen binnen realistische grenzen\n\n'
  '**Niet toegestaan**\n'
  '- Ruimtes, ramen, schoorstenen of bouwdelen toevoegen die er niet zijn\n'
  '- Meubilair toevoegen dat niet in de woning staat\n'
  '- Voorzieningen suggereren die niet bestaan, zoals een zwembad of jacuzzi\n'
  '- Uitzicht vervangen door een ander uitzicht\n'
  '- Merknamen van andere partijen laten staan of toevoegen\n\n'
  'Twijfel je? Zet de opdracht op QC met een notitie in plaats van te gokken.'
),
(
  'veelgemaakte-fouten', 'Veelgemaakte fouten', 'kwaliteit', 4,
  E'Dit zijn de afkeurredenen die in de praktijk het vaakst terugkomen. '
  'Loop ze langs voordat je een opdracht op QC zet.\n\n'
  '1. **Te donker of grauw.** Vooral bij winterbewerkingen. Beoordeel op een scherm met normale helderheid.\n'
  '2. **Oranje of gele gloed.** Een beetje warmte is mooi, te veel valt direct op.\n'
  '3. **Witte rand aan de bovenkant.** Controleer altijd de vier randen van het eindresultaat.\n'
  '4. **Toegevoegde elementen.** Extra raam, tweede schoorsteen, stenen bij de ingang. '
  'Leg het resultaat naast het origineel voordat je inlevert.\n'
  '5. **Vervormde tekst.** Naamborden, huisnummers en het VfY-bord vervormen snel. '
  'Beschrijf zulke elementen expliciet in je prompt.\n'
  '6. **Gras dat doorloopt over stenen of terras.**\n'
  '7. **Alleen deelbewerking.** Staat er zowel belichting als sfeer in de opdracht, doe dan beide.'
),
(
  'prompten', 'Prompten in Magnific', 'werkwijze', 5,
  E'- Benoem expliciet wat behouden moet blijven, niet alleen wat er moet veranderen.\n'
  '- Beschrijf herkenbare elementen die snel vervormen: huisnummerbord, naambord, tekst op gevels.\n'
  '- Werk per foto, niet per woning. Eén prompt voor een hele set geeft wisselende resultaten.\n'
  '- Maximaal één referentieafbeelding per generatie bij Freepik. Magnific ondersteunt er meerdere.\n'
  '- Bewaar een prompt die goed werkt en hergebruik hem bij hetzelfde type ruimte.'
);

-- Goal-specifieke richtlijnen, zichtbaar naast de opdracht.
insert into guidelines (slug, title, category, goal_code, sort_order, body_md) values
(
  'goal-summer-to-winter', 'Zomer naar winter', 'per doel', 'summer_to_winter', 10,
  E'Doel: een geloofwaardige winterversie voor de wintermaanden in de listing.\n\n'
  '- Verse sneeuw en blauwe lucht, geen smeltende of grijze sneeuw.\n'
  '- Let op de lichtsterkte. Winterbeelden worden snel te donker of grauw.\n'
  '- Sneeuw hoort logisch te liggen: op daken, op de grond, niet tegen verticale muren.\n'
  '- Zomerse beplanting die blijft staan verraadt de bewerking. Controleer bomen en bloembakken.'
),
(
  'goal-improve-lighting', 'Belichting verbeteren', 'per doel', 'improve_lighting', 11,
  E'- Corrigeer donkere hoeken zonder de foto vlak te maken.\n'
  '- Houd het buitenlicht door de ramen realistisch, uitgebeten ramen zijn een afkeurreden.\n'
  '- Vermijd een oranje gloed. Beoordeel achteraf op kleurzweem.\n'
  '- Belichting alleen is vaak niet genoeg. Staat er ook sfeer in de opdracht, doe dat er ook bij.'
),
(
  'goal-improve-ambiance', 'Sfeer verbeteren', 'per doel', 'improve_ambiance', 12,
  E'- Tafel dekken op terrasfoto''s: wijn, karaf water, glazen. Alsof er op dat moment gasten zijn.\n'
  '- Kussens op tuinmeubilair, parasol open.\n'
  '- Iets kleins op de salontafel: kaarsen of bloemen.\n'
  '- Voeg geen meubilair toe dat er niet staat. Sfeer maak je met accessoires, niet met inrichting.'
),
(
  'goal-replace-sky', 'Lucht vervangen', 'per doel', 'replace_sky', 13,
  E'- Kies een lucht die past bij het seizoen en de lichtrichting in de foto.\n'
  '- Let op de schaduwen op de grond. Een strakblauwe lucht bij zware schaduwen klopt niet.\n'
  '- Controleer de overgang bij daklijnen en bomen op halo''s.'
),
(
  'goal-make-beds', 'Bedden opmaken', 'per doel', 'make_beds', 14,
  E'- Strak opgemaakt bed, kussens rechtop, dekbed glad.\n'
  '- Houd het aantal en type bedden gelijk aan het origineel. Van twee eenpersoonsbedden geen tweepersoonsbed maken tenzij dat expliciet gevraagd is.\n'
  '- Handdoeken opgerold op het bed mag, dat is de VfY-stijl.'
),
(
  'goal-remove-object', 'Object verwijderen', 'per doel', 'remove_object', 15,
  E'- Verwijder het object en vul de achtergrond logisch aan.\n'
  '- Lukt het niet netjes? Verwijder dan liever het hele vlak dan een half resultaat achter te laten, en meld het bij QC.\n'
  '- Merknamen en logo''s van andere partijen moeten altijd weg.\n'
  '- Kentekens onherkenbaar maken.'
),
(
  'goal-improve-summer', 'Zomer verbeteren', 'per doel', 'improve_summer', 16,
  E'- Groener gras, vollere beplanting, meer diepte en kleur.\n'
  '- Gras mag niet doorlopen over stenen, terras of paden. Dit is een terugkerende afkeurreden.\n'
  '- Blijf realistisch: een verbrand gazon mag frisser, geen golfbaan worden.'
);

-- ── Instellingen ─────────────────────────────────────────────────────────────
insert into app_settings (key, value, description) values
  ('magnific_base_url', 'https://magnific.ai/',
   'Basis-URL van Magnific. De app opent deze in een nieuw tabblad wanneer een opdracht geen eigen magnific_url heeft. Pas aan zodra het exacte projectpad bekend is.'),
  ('ares_base_url', '',
   'Optioneel. Later te vullen wanneer de ARES-koppeling wel in scope komt.'),
  ('qc_reminder_days', '5',
   'Aantal dagen dat een opdracht in QC mag staan voordat de app hem markeert als vertraagd.'),
  ('max_photos_per_property', '5',
   'Richtlijn voor het aantal foto''s per woning. De app waarschuwt bij overschrijding, blokkeert niet.');
