# Buildplan v3 — beheer, Ares-import en de businesscase zichtbaar maken

**Status:** concept, wacht op akkoord van Wouter
**Datum:** 2026-08-13
**Voorganger:** `BUILDPLAN.md` (v2, WP0–WP6, volledig afgerond)
**Uitvoering:** geschreven om werkpakket voor werkpakket uitgevoerd te worden.
Leesvolgorde voor het uitvoerende model: `AGENTS.md` → `BUILDPLAN.md` → dit bestand.
Bij conflict wint dit bestand; het is de jongste beslissing van de eigenaar.

---

## 1. Wat er gevraagd is

1. Een adminscherm voor de coördinator (`myvilla@villaforyou.com`): accounts
   toevoegen en beheren, plus wat er verder logisch bij hoort.
2. Foto's kunnen toevoegen in de Academy.
3. Bulk-import vanuit `Data_Fototool` (Ares-export) om summer→winter-opdrachten
   aan te maken.
4. Kosten ergens kwijt kunnen, alleen zichtbaar voor de coördinator.
5. Bestaande opdrachten kunnen aanpassen.
6. Overig optimalisatieadvies.

---

## 2. Wat ik heb geverifieerd vóór dit plan

Niet aangenomen maar gemeten, op de echte xlsx en de live database:

| Bevinding | Waarde | Gevolg voor het plan |
|---|---|---|
| Rijen in `Data_Fototool` | 865 (van 3000 regels blad) | Import moet lege staartrijen negeren |
| Statussen | Completed 543, Assigned 290, Rejected 18, Readytoshoot 11, Signedup 2, Onhold 1 | Alleen `Completed` telt, conform jouw regel |
| Tasks-waarden | `ExteriorWinter` 289, `Interior` 614, `ExteriorSummer` 603, `Drone` 254 | Vaste woordenlijst, pipe-gescheiden — veilig te parsen |
| **Wintershoots per land** | **AT 285 — geen enkele in BE/NL/FR/DE** | Winterbewerkingen zijn per definitie AT-only |
| AT-rijen in de export | 564 | Alleen deze zijn kandidaat |
| Completed + summer, geen winter op de rij | 154 | Jouw regel, binnen AT |
| Daarvan met ergens al een winter-regel | 44 (35 Completed, 11 Assigned) | **Beslispunt A**, zie §4 |
| Netto kandidaten | 110 | |
| Daarvan al in de app-database | 14 | Import moet die overslaan, niet dubbel aanmaken |
| **Netto nieuw voor de app** | **96 opdrachten** | Dit is de echte omvang van één import |
| `Sorteersleutel (hulp)` | 865 waarden, **865 uniek**, 0 leeg | Perfecte natuurlijke sleutel voor idempotente import |
| Verhuurexperts in xlsx vs. app | 23 vs. 19, **0 exacte matches** | **Blokkerend**, zie §4 beslispunt B |
| `summer_to_winter` als editing goal | Bestaat al | Import kan er direct op koppelen |
| Storage bucket `guidelines` | Bestaat, maar is **private** | **Latente bug**, zie §3 |
| Gebruikers in `app_users` | 1 (`myvilla@villaforyou.com`, rol `admin`) | Geen account aan te maken; rol klopt al |
| Drone bij losse AT-wintershoots | 32 van 145 = **22%** | Relevant voor het tarief, zie hieronder |
| Kosten per wintershoot (tarieven Wouter) | € 137 = € 50 buiten + € 55 drone + € 32 reistoeslag | Vervangt mijn eerdere afleiding |
| Kosten AI-editing per maand (blad Personeel & tools) | € 215,55 | Tegenhanger van de besparing |

### De businesscase — gecorrigeerd

**Mijn eerste versie van dit plan zat er een factor 3,5 naast** en dat is de
moeite waard om vast te leggen. Ik rekende 234 kandidaten × € 195 ≈ € 45.600. Twee
fouten:

1. **€ 195 was het verkeerde tarief.** Dat is het gemengde gemiddelde over álle
   shoots uit de Rapportage-tab (€ 81.951 ÷ 420), gedomineerd door volle
   binnen+buiten-shoots. Een wintershoot is een losse buitenshoot. Het echte
   tarief is € 137 (€ 50 buiten + € 55 drone + € 32 reistoeslag 0–50 km).
2. **Ik rekende met kandidaten buiten Oostenrijk.** Alle 285 wintershoots in de
   export staan in AT; in BE, NL, FR en DE gebeuren ze niet. Wouter heeft
   bevestigd dat winterimpressies daar ook nooit nodig zijn (beslispunt E). Die
   138 woningen vallen dus helemaal weg als kandidaat, niet alleen uit de
   besparing. De historie bevestigt het: van de 48 bestaande
   summer→winter-opdrachten in de database staan er 48 in AT en nul daarbuiten.

**De eerlijke som: 96 AT-kandidaten × € 137 ≈ € 13.200 vermeden fotografiekosten**,
tegenover € 2.587 AI-editingkosten per jaar. Ruim een factor 5 rendement — een
stuk minder spectaculair dan € 45.600, maar dit getal houdt wél stand als iemand
ernaar vraagt. En dat is precies wat je wilt van een getal dat groot op een
dashboard komt te staan.

**Kanttekening bij de € 137.** Die som gaat uit van drone erbij en de laagste
reisband. In de data zit bij losse AT-wintershoots maar in 22% van de gevallen
drone. Gewogen kom je op € 94 (dichtbij) tot € 126 (middenband 51–100 km). Het
bedrag wordt daarom een instelling die de coördinator zelf zet — € 137 is de
startwaarde omdat het van de eigenaar komt, niet van een schatting van mij.

---

## 3. Eén bug die eerst moet

**De Academy kan nu geen foto's tonen.** `app/(app)/academy/[slug]/page.tsx:49`
gebruikt `getPublicUrl()`, maar de bucket `guidelines` staat op private. Elke
voorbeeldafbeelding zou als gebroken plaatje renderen. Het is nooit opgevallen
omdat er nog geen enkele voorbeeldafbeelding in staat.

Dat blokkeert vraag 2 rechtstreeks, dus het wordt WP1. Aanbeveling: **bucket
private houden en signed URLs gebruiken** (`createSignedUrl`, ~1 uur geldig,
server-side aangemaakt). Lesmateriaal over klantwoningen hoort niet
publiek-indexeerbaar op internet te staan, en de kosten van signed URLs zijn
nihil.

---

## 4. Beslispunten — besloten door Wouter, 2026-08-13

**A. De 44 acco-id's met een summer-shoot én ergens een winter-regel.** ✅ *Besloten:
tonen maar standaard uitgevinkt.*
Jouw regel is per rij geformuleerd. Maar 44 acco-id's hebben een afgeronde
summer-rij *en* elders een winter-rij (35 al Completed, 11 nog Assigned). Voor
die woningen bestaan er dus al echte winterfoto's, of komen ze eraan.
Ze verschijnen als aparte groep in de importpreview met de melding "heeft al een
winter-shoot (Completed/Assigned)", standaard uitgevinkt. Jij vinkt per geval aan
wat je alsnog wilt.

**B. Verhuurexpert-namen matchen voor geen meter.** *Voorstel, geen bezwaar
gemaakt — wordt zo gebouwd.*
De xlsx gebruikt Ares-inlognamen (`daniel`, `carlpeter`, `markvb`, `verhuurnl`),
de app gebruikt volledige namen (`daniel hell`, `carl-peter echtermeijer`,
`mark van bruggen`, `verhuur nederland`). **Nul exacte matches.** Automatisch
raden op voornaam gaat fout bij `markvb`, `carlpeter` en `verhuurnl`. Bovendien
bestaan `carlo`, `dennis`, `leon` en `cedric` nog helemaal niet in de app.
Oplossing: een expliciete, permanente aliastabel (`ares_expert_aliases`),
beheerbaar in het adminscherm. Bij de eerste import doe je eenmalig 23
koppelingen (ik zet een voorstel klaar op basis van naamgelijkenis, jij
bevestigt); daarna onthoudt de app het. De import weigert te draaien zolang er
onbekende aliassen in het bestand zitten — beter dan stilletjes opdrachten
zonder expert aanmaken.

**C. Service-role key in app-code.** ✅ *Besloten: toestaan in één afgeschermd
bestand, met de Vercel-randvoorwaarden uit §5 hieronder.*
`AGENTS.md` (Environment variables) zegt nu: service-role key is "scripts only,
never import into app code". Accounts uitnodigen kan alleen via de Supabase Admin
API, en die vereist die key server-side. Toegestaan in precies één bestand,
`lib/supabase/admin.ts`, met `import "server-only"`, uitsluitend aangeroepen door
role-gated server actions. Wordt als amendement-regel in de AGENTS.md-changelog
vastgelegd. Wouter heeft er terecht bij aangetekend dat de app uiteindelijk live
gaat op Vercel — dat verandert de aanpak niet, maar wél wat er omheen moet. Zie
§5.

**D. Nieuwe dependency voor xlsx-parsing.** ✅ *Besloten: SheetJS (`xlsx`),
alleen server-side.*
Je uploadt straks gewoon het bestand dat je toch elke maand bijwerkt; geen extra
exportstap.

**E. Kandidaten buiten Oostenrijk.** ✅ *Besloten: alleen AT, hard gefilterd.*
Wouter: "we hebben nooit winterimpressies nodig voor andere landen dan AT." Dat
is dus geen keuze per import maar een permanente regel. `acco_id` begint met
`AT.` wordt onderdeel van de kandidaatdefinitie zelf — de 138 woningen in BE, NL,
FR en DE komen niet in de preview voor en zijn ook geen uitvinkbare groep. Dat
scheelt een hele groep in de importpreview en maakt de besparingsberekening
eenduidig.

De historie ondersteunt de regel: van de 48 bestaande summer→winter-opdrachten
in de database liggen er 48 in AT en nul daarbuiten.

---

## 5. Live gaan op Vercel met een service-role key

De service-role key omzeilt alle RLS. Zolang die alleen lokaal in `.env.local`
stond was dat overzichtelijk; op Vercel is het een echte productiesleutel. De
aanpak blijft zoals besloten in beslispunt C, maar deze regels horen er
onlosmakelijk bij en worden onderdeel van de Definition of done van WP2.

**De echte valkuil is niet de key zelf, maar preview-deployments.** Vercel zet
environment variables standaard op *alle* omgevingen. Zonder ingrijpen krijgt
elke preview-deploy van elke branch — inclusief een branch die nog nooit is
gereviewd — volledige admin-rechten op de productiedatabase, op een openbaar
raadbare `*.vercel.app`-URL. Dat is het scenario dat je wilt voorkomen.

1. **Alleen in Production.** Zet `SUPABASE_SERVICE_ROLE_KEY` in Vercel uitsluitend
   op de omgeving Production, niet op Preview of Development. De adminfuncties
   detecteren een ontbrekende key en tonen dan een nette melding ("accountbeheer
   is alleen beschikbaar in de productieomgeving") in plaats van te crashen.
2. **Nooit `NEXT_PUBLIC_`.** Vanzelfsprekend, maar het is de fout die het vaakst
   wordt gemaakt en die de key in de browserbundle zet. WP7 krijgt een
   controle die de build laat falen als de key ooit buiten `lib/supabase/admin.ts`
   wordt geïmporteerd.
3. **Node runtime, geen edge.** De adminroutes expliciet op de Node-runtime, zodat
   de key niet in een edge-bundle terechtkomt.
4. **Rolcheck vóór de key, niet erna.** Elke server action die de adminclient
   gebruikt, controleert eerst via de gewone (RLS-gebonden) client of de
   aanroeper `admin` of `coordinator` is. De adminclient wordt pas daarna
   aangemaakt.
5. **Deployment protection aanzetten** op preview-deploys (Vercel-instelling), zodat
   preview-URL's sowieso niet publiek benaderbaar zijn.
6. **Sleutel roteerbaar houden.** Noteer in de README hoe je de key roteert in
   Supabase en bijwerkt in Vercel; dat moet je kunnen doen zonder in de code te
   kijken.

**Overwogen en niet gekozen:** de invite-actie in een Supabase Edge Function
zetten, waar de service-role key automatisch beschikbaar is en Vercel hem dus
nooit hoeft te kennen. Dat is veiliger op papier — de gevaarlijkste sleutel
blijft binnen Supabase — maar het voegt een tweede deploy-artefact toe dat apart
onderhouden, gedeployed en gedebugd moet worden. Voor een interne tool met vijf
gebruikers en één beheerder weegt die complexiteit niet op tegen de winst,
zeker niet omdat de maatregelen hierboven het realistische risico (preview-
deploys, key in de bundle) al afdekken. Blijkt later dat er meer privileged
operaties bij komen dan alleen uitnodigen, dan is dit het moment om alsnog over
te stappen.

---

## 6. Werkpakketten

Volgorde is dwingend. WP1 is klein en deblokkeert WP2; WP3 is het grootste.

### V3-WP1 — Academy-foto's *(deblokkeert vraag 2)*

1. Signed URLs in plaats van `getPublicUrl` in `app/(app)/academy/[slug]/page.tsx`.
2. Storage-RLS op de bucket `guidelines`: iedereen die is ingelogd mag lezen,
   alleen coordinator/admin mag schrijven. Nu ontbreekt dat.
3. Upload-UI in de bestaande `GuidelineEditor`: slepen of kiezen, per afbeelding
   een bijschrift en de keuze goed/fout, volgorde met de bestaande `sort_order`.
   Client-side validatie op type (jpg/png/webp) en grootte (max 5 MB), plus een
   `file_size_limit` en `allowed_mime_types` op de bucket zelf — validatie in de
   browser is een vriendelijkheid, niet een grens.
4. Verwijderen van een afbeelding haalt ook het bestand uit Storage weg, niet
   alleen de rij (anders lekt de bucket vol).

**Klaar wanneer:** een coördinator een goed- en een fout-voorbeeld kan uploaden,
die zichtbaar zijn op de modulepagina voor een editor, en een verwijderde
afbeelding ook echt weg is uit de bucket.

### V3-WP2 — Adminscherm, fundament *(vraag 1)*

Nieuwe route `/beheer`, alleen `admin` en `coordinator`, met subtabs. Toevoegen
aan `nav-config.ts` (die het item "Instellingen" uit de WP0-spec nooit heeft
gekregen).

1. **Gebruikers.** Lijst met naam, e-mail, rol, actief, laatste login. Rol
   wijzigen, deactiveren (nooit hard verwijderen — `app_users.id` hangt aan
   `auth.users` en aan `status_events.actor_id`). Uitnodigen per e-mail conform
   beslispunt C. Een admin kan zichzelf niet degraderen of deactiveren — anders
   sluit je jezelf buiten en is er geen weg terug zonder SQL.
2. **Editors & verhuurexperts.** CRUD op `editors` en `rental_experts`, en een
   editor koppelen aan een gebruikersaccount (`editors.user_id`). Nu alleen via
   SQL te doen. Deactiveren in plaats van verwijderen.
3. **Instellingen.** De vijf bestaande `app_settings`-sleutels als echt formulier
   met uitleg per veld, in plaats van SQL: `qc_reminder_days`,
   `max_photos_per_property`, `qc_issue_callout_threshold`, `magnific_base_url`,
   `ares_base_url`.
4. **Editing goals & QC-issuetypes.** Toevoegen/hernoemen/deactiveren zonder SQL.
   Dit is belangrijker dan het lijkt: de QC-issuetypes voeden de hele
   feedbackloop naar de Academy, en die lijst hoort mee te groeien met wat QC
   in de praktijk tegenkomt.

**Klaar wanneer:** de coördinator een nieuwe editor van niets tot werkend account
kan brengen zonder één regel SQL; een nieuw QC-issuetype kan toevoegen dat direct
in het QC-scherm bruikbaar is; en alle zes de Vercel-randvoorwaarden uit §5 zijn
geïmplementeerd en in de README beschreven — inclusief de nette melding wanneer de
service-role key ontbreekt, zodat een preview-deploy niet crasht maar netjes zegt
dat accountbeheer daar niet beschikbaar is.

### V3-WP3 — Ares-import summer→winter *(vraag 3, grootste pakket)*

1. **Schema:** `assignments.ares_row_key text unique` (uit `Sorteersleutel`,
   865/865 uniek — dit maakt de import idempotent) en `assignments.source`
   (`manual` | `ares_import`). Plus tabel `ares_expert_aliases` (alias →
   `rental_expert_id`) en `import_runs` (wie, wanneer, welk bestand, hoeveel
   aangemaakt/overgeslagen) voor een auditspoor.
2. **Upload & parse**, server-side. Tabblad `Data_Fototool` wordt op naam
   gezocht, niet op index. Kolomkoppen worden op naam gelezen, niet op positie —
   Ares kan van kolomvolgorde veranderen en dan moet de import klagen, niet
   stilletjes de verkeerde velden vullen.
3. **Alleen AT.** `acco_id like 'AT.%'` zit in de kandidaatdefinitie (beslispunt
   E). Rijen uit andere landen worden stil overgeslagen; de preview meldt wel
   hoeveel er om die reden zijn genegeerd, zodat het geen onzichtbaar filter is.
4. **Preview vóór commit** — nooit blind importeren. Drie groepen, elk met
   telling en uitklapbare rijen:
   - *Nieuw* (~96): worden aangemaakt, standaard aangevinkt.
   - *Al in de app* (~14, match op `ares_row_key` of acco-id): overgeslagen.
   - *Heeft al een winter-shoot* (~44): standaard uitgevinkt, beslispunt A.
   - *Probleem*: onbekende expert-alias of onleesbare datum. Blokkeert de import
     tot het is opgelost, met een directe link naar de aliaskoppeling.

   De preview toont per groep ook de bijbehorende besparing, zodat je vóór het
   importeren ziet wat de selectie oplevert.
5. **Aanmaken:** status `new`, goal `summer_to_winter`, prioriteit uit kolom C
   (`High`/`Medium`/`Low` → `high`/`medium`/`low`, `?` → `low`), verhuurexpert via
   de aliastabel, `request_date` uit `datum invoer` (dd/mm/yy), `source =
   'ares_import'`. Alles in één transactie via een server action met Zod.
6. **Geen fotonummers.** De Ares-export bevat ze niet, dus deze opdrachten
   starten op "0 van 0". Dat is correct en al goed afgevangen: `canSubmitToQc`
   blokkeert inleveren met een concrete melding. Wel toevoegen: een quick filter
   "wacht op fotonummers" op het opdrachtenscherm, anders verdwijnen de
   geïmporteerde opdrachten in de massa.

**Klaar wanneer:** dezelfde xlsx twee keer achter elkaar importeren levert de
tweede keer nul nieuwe opdrachten op; een bestand met een onbekende expert
weigert netjes; en na import staan de geselecteerde opdrachten erin met de
juiste expert en prioriteit.

### V3-WP4 — Kosten en besparing *(vraag 4)*

Coördinator/admin-only. Bewust klein gehouden: jouw maandrapportage in Excel is
goed en blijft leidend. De app rekent niet de financiën na, hij laat alleen zien
wat operationeel stuurt.

1. Twee nieuwe `app_settings`, beheerbaar in WP2: `avoided_shoot_cost_eur`
   (**default 137**, met de opbouw € 50 buiten + € 55 drone + € 32 reistoeslag als
   hulptekst bij het veld) en `monthly_editing_cost_eur` (215,55). Beide zonder
   deploy aanpasbaar.
2. **Dashboard-hero wordt de besparing:** "€ X vermeden fotografiekosten dit
   seizoen" = aantal goedgekeurde summer→winter-opdrachten **op AT-woningen** ×
   het ingestelde bedrag. Het bedrag staat als leesbare aanname onder het getal
   ("96 vermeden shoots × € 137"), niet verstopt in de code — dan kan iedereen die
   ernaar kijkt de som narekenen en de aanname bestrijden.
3. **Vangnet in de view.** Sinds beslispunt E importeert de app geen niet-AT
   kandidaten meer, dus in de praktijk is alles AT. De besparingsview filtert
   toch expliciet op `acco_id like 'AT.%'`, zodat een handmatig aangemaakte
   uitzondering de euro's niet stilletjes kan opblazen. Bij oplevering telt die
   view 39 al goedgekeurde AT-opdrachten — het dashboard staat dus vanaf dag één
   op ongeveer € 5.300, niet op nul.
4. Kaart "Kosten per bewerking": maandkosten gedeeld door goedgekeurde
   bewerkingen die maand, met de trend. Zakt die richting het ingestelde
   shoot-tarief, dan is de businesscase weg — dat wil je zien vóórdat het gebeurt.
5. Optioneel losse tabel `cost_entries` als je echte factuurregels in de app wilt
   bijhouden. **Advies: niet doen.** Dat is dubbel werk naast Exact en je
   maandrapportage, en het is precies het soort feature dat de app langzaam in
   een slechte boekhouding verandert.

**Klaar wanneer:** een editor het hele blok niet ziet, en de coördinator het
besparingsgetal kan narekenen tegen de views in de SQL editor.

### V3-WP5 — Opdrachten bewerken *(vraag 5)*

Op het detailscherm een "Bewerken"-paneel voor coordinator/admin: acco-id
corrigeren, verhuurexpert, prioriteit, editor, aanvraagdatum en briefing. Plus
een opdracht annuleren (naar `ai_rejected` met verplichte reden) en — alleen
admin — echt verwijderen, met bevestigingsdialoog die de acco-id laat intypen.
Verwijderen is de enige destructieve actie in de app en verdient die wrijving.

Elke wijziging via server action met Zod, en wijzigingen aan status blijven via
de bestaande guards lopen zodat het auditspoor in `status_events` klopt.

**Klaar wanneer:** een verkeerd geïmporteerde opdracht volledig te corrigeren is
zonder SQL, en een verwijdering niet per ongeluk kan gebeuren.

### V3-WP6 — Optimalisaties uit de review

Op volgorde van opbrengst:

1. **Zoeken verbreden.** Nu alleen `ilike` op acco-id. Uitbreiden naar
   expertnaam en editornaam, in de lijst én in de command palette.
2. **Bulk-acties op de import-oogst.** Tientallen opdrachten in één klap toewijzen aan
   een editor moet kunnen; de zwevende bulkbalk kan dat al, maar "selecteer alle
   resultaten van dit filter" ontbreekt nog.
3. **Attentiestrook uitbreiden** met "X opdrachten wachten op fotonummers", zodat
   de import niet stilvalt.
4. **Auditspoor voor beheeracties.** `status_events` dekt opdrachten, maar een
   rolwijziging of verwijderde gebruiker is nergens terug te zien. Tabel
   `admin_events` (actor, actie, doel, tijdstip).
5. **Bordprestaties bij ~590 opdrachten.** De tabel is gevirtualiseerd, het bord
   niet. Na de import verdubbelt het volume bijna. Meten en zo nodig per kolom
   virtualiseren.
6. **De vijf migratiewaarschuwingen** uit `docs/migratie_log.txt` staan nog open
   bij jou (WP6 heeft ze gedocumenteerd, niet opgelost) — vijf acco-id's waar een
   Excel-kommagetal misschien verkeerd als twee fotonummers is gelezen.

### V3-WP7 — Waarheidsronde

Zoals v2-WP6: volledige testsuite in één sessie, verificatieronde over alle
schermen in beide thema's op drie breekpunten, `AGENTS.md` bijwerken met de
nieuwe schermen en de gesanctioneerde afwijkingen uit §4, README bijwerken.

**Belangrijk:** de e2e- en RLS-tests zijn sinds v2-WP3 nooit live gedraaid omdat
er in de bouwomgeving geen Docker beschikbaar was. Met een adminscherm dat rollen
en accounts beheert wordt de RLS-test niet langer optioneel — dat is precies de
code waar een fout stille gevolgen heeft. Deze ronde moet draaien op een machine
met Docker.

Daarnaast, omdat de app na deze ronde live gaat:

- Een lint-/buildcontrole die faalt als `SUPABASE_SERVICE_ROLE_KEY` ergens buiten
  `lib/supabase/admin.ts` wordt geïmporteerd, of ooit met een `NEXT_PUBLIC_`-prefix
  opduikt. Dit is een permanente vangrail, geen eenmalige check.
- Een gerichte test dat een `editor` en een `viewer` een 403/redirect krijgen op
  elke `/beheer`-route en op elke adminserveractie — niet alleen dat het menu-item
  verborgen is. Een verborgen knop is geen autorisatie.
- Een deployrepetitie naar Vercel Production met de env-vars zoals in §5, en
  daarna één echte uitnodiging versturen om te bevestigen dat de flow end-to-end
  werkt met de redirect-URL's uit de README.

---

## 7. Wat ik bewust níét voorstel

- **Ares-koppeling via API.** `AGENTS.md` regel 1 sluit dat uit, en de
  maandelijkse xlsx-export werkt. Import blijft handmatig gestart.
- **Werkfoto's in de app.** `AGENTS.md` regel 2 is permanent. WP1 gaat
  uitsluitend over lesmateriaal in de Academy — dat is de uitzondering die al in
  de regel staat (`guideline_examples`), niet een verruiming ervan.
- **Boekhouding in de app.** Zie WP4 punt 4.
- **Notificaties.** `AGENTS.md` regel 4, en niets in deze ronde vraagt erom.

---

## 8. Inschatting

Met Sonnet 5 in faster/low, in dezelfde stijl als v2 (build + typecheck + lint +
tests per pakket, commit per pakket):

| WP | Omvang | Sessies |
|---|---|---|
| 1 — Academy-foto's | klein | 1 |
| 2 — Adminscherm | groot | 2 |
| 3 — Ares-import | groot | 2 |
| 4 — Kosten | klein | 1 |
| 5 — Opdrachten bewerken | middel | 1 |
| 6 — Optimalisaties | middel | 1–2 |
| 7 — Waarheidsronde | middel | 1 |

**Totaal 9–10 sessies.** Ter kalibratie: v2 (WP0–WP6) was vergelijkbaar van
omvang en kostte ongeveer evenveel. De token- en tijdinschatting van v2 bleek
redelijk te kloppen; ik verwacht hier hetzelfde orde van grootte.

De volgorde is zo gekozen dat je na WP3 al het meeste plezier hebt: dan staan de
de geïmporteerde opdrachten erin en is het beheer op orde. WP4 is klein maar levert het
verhaal waar de app om vraagt.

---

## 9. Voortgang

| WP | Omschrijving | Status |
|---|---|---|
| 1 | Academy-foto's (signed URLs, upload, storage-RLS) | ✅ |
| 2 | Adminscherm (gebruikers, editors, instellingen, referentiedata) | ⬜ |
| 3 | Ares-import summer→winter | ⬜ |
| 4 | Kosten en besparing | ⬜ |
| 5 | Opdrachten bewerken | ⬜ |
| 6 | Optimalisaties | ⬜ |
| 7 | Waarheidsronde | ⬜ |
