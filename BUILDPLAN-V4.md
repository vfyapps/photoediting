# BUILDPLAN V4 — UX- en visuele optimalisatie

Beoordeling op basis van live screenshots (Vercel, ingelogd als admin, augustus 2026)
naast de code. V1–V3 staan functioneel; dit plan perfectioneert. Focus: UX en visueel —
informatiehiërarchie, rust, consistentie, foutpreventie en waargenomen snelheid.

**Werkwijze per WP** (zelfde discipline als V3):

1. Laad bij elk UI-WP eerst de skill `vfy-app-design` (verplichte visuele verificatie hoort daarbij).
2. Na afronden: `npm run verify` en een screenshot ter controle.
3. Eén commit per WP, Nederlandstalige commitmessage, zelfde vorm als eerdere WP-commits.

Volgorde is impact ÷ moeite. WP1–2 eerst; daarna is de rest los uitvoerbaar.
Per WP staat aangegeven of Haiku volstaat of Sonnet verstandig is.

---

## V4-WP1 — Snelle wins: microcopy, labels, disabled-states (model: Haiku volstaat)

Klein spul dat nu al zichtbaar rommelt. Laag risico, direct resultaat.

1. **Ontbrekende spaties in samengestelde teksten.** Op het opdrachtdetail staat
   "0 van max. 5foto's" (spatie ontbreekt tussen waarde en "foto's"); op de kaart
   rendert de waarschuwing als "10shoot(s) hebben een postcode…". Dit is de bekende
   JSX-valkuil: een regelafbreking tussen `{expressie}` en tekst slikt de spatie in.
   *Doen:* grep op `foto's`, `shoot(s)` en vergelijkbare `{var}`+tekst-combinaties
   in `components/` en herstel; render-check in de browser, niet alleen in de code.
2. **Zoekveld-placeholder ondervertelt.** Het bord-zoekveld zegt "Zoek op acco ID",
   maar V3-WP7.1 heeft zoeken verbreed naar editor én verhuurexpert (zie de `.or(…)`
   in `app/(app)/page.tsx`). *Doen:* placeholder wordt "Zoek op acco-ID, editor of expert".
3. **Icoon-knoppen zonder label.** Op het opdrachtdetail staat een los potlood-icoon
   naast de knop "Bewerken" (vermoedelijk: Magnific-link aanpassen); op de
   Academy-modulepagina een los link-icoon. Niemand kan raden wat ze doen.
   *Doen:* `aria-label` + tooltip (title of Tooltip-component) op elk icoon-only
   element; als het potlood hetzelfde doet als "Bewerken", voeg samen.
4. **Disabled-styling is te lief.** "Opslaan" (module-editor) en "Toevoegen"
   (foto's per goal) tonen in disabled-staat een bleekgroene tint die leest als een
   rare variant van de primaire knop, niet als "kan nog niet". *Doen:* disabled =
   muted/secondary met verlaagde opaciteit, duidelijk onderscheiden van enabled primary.
5. **QC-paginakop wijkt af van het patroon.** Overal is de eyebrow kort en de titel
   het volle woord ("Overzicht / Dashboard", "Planning / Kaart", "Kennisbank /
   Academy") — behalve QC, waar het omgekeerd is ("KWALITEITSCONTROLE / QC").
   *Doen:* eyebrow "Kwaliteitscontrole" laten staan kan, maar maak de titel dan
   consistent met de rest (bijv. titel "Kwaliteitscontrole" en eyebrow "Controle",
   of accepteer "QC" als titel en maak de eyebrow kort). Eén lijn kiezen.

**Verificatie:** screenshots van detail, kaart, QC en module-editor; `npm run verify`.

---

## V4-WP2 — Waargenomen snelheid: skeletons per route (model: Sonnet aanbevolen)

De gebruiker ervoer de app als traag. De regiofix (Vercel → EU) haalde de grootste
latency weg, maar elke route staat op `force-dynamic` en dus is élke navigatie een
serverroundtrip met meerdere Supabase-queries — en er is **geen enkele `loading.tsx`**
in het project. Tijdens het wachten bevriest de vorige pagina; dat vóelt traag,
ook als de server snel is.

1. Voeg per route een `loading.tsx` toe onder `app/(app)/…` met een skelet dat de
   echte lay-out spiegelt: paginakop-skelet + de grove blokken van dat scherm
   (bord: filterbalk + 4 kolommen; dashboard: herokaart + tegels + grafiekvlakken;
   detail: drie kolommen; academy: tabs + rijen; kaart: kaartvlak + zijbalk;
   beheer: subtabs + tabel).
2. Gebruik de bestaande tokens (`bg-secondary`, `animate-pulse`, afgeronde hoeken
   zoals de echte kaarten) — geen nieuw grijs verzinnen.
3. Kaart-specifiek: de Leaflet-container heeft geen eigen achtergrond tot de tegels
   binnen zijn. Geef de kaartcontainer een `bg-secondary` zodat het laden er niet
   uitziet als een gat.

**Verificatie:** throttle in devtools (Fast 3G), navigeer alle routes: overal direct
een skelet, nergens een bevroren scherm. `npm run verify`.

---

## V4-WP3 — Het bord rustiger en schaalbaar (model: Sonnet aanbevolen)

Het bord is het dagelijkse hoofdscherm en nu visueel het drukst, terwijl de
verhouding scheef is: 162 van de 164 kaarten staan in één kolom "Nieuw".

1. **Prioriteitsbadge alleen als hij iets betekent.** Elke kaart draagt nu een
   amberkleurige uppercase badge "GEMIDDELD" — 162 keer. Als alles aandacht vraagt,
   vraagt niets aandacht. *Doen:* alleen **Hoog** krijgt een gekleurde badge;
   gemiddeld wordt een neutraal stipje of niets; laag niets. In de tabelweergave
   mag de kolom blijven zoals hij is.
2. **Leeftijd kleuren op drempel.** "213d" staat er nu even neutraal bij als "2d".
   *Doen:* vanaf `qc_reminder_days`-achtige drempels (voorstel: >30d muted-amber,
   >90d rood accent) kleurt het getal mee. Subtiel — tekstkleur, geen extra badge.
3. **Kolomcap met "Toon meer".** 162 kaarten in één kolom renderen is traag en
   zinloos scrollen. *Doen:* render per kolom de eerste ~25, daaronder één knop
   "Toon alle 162". (De bordmeting uit V3-WP7.5 kan bevestigen wat dit scheelt.)
4. **Bulk-balk verstopt de onderste kaarten.** De zwevende balk valt over de laatste
   kaartrij en de editor-dropdown klapt er rommelig overheen uit. *Doen:*
   `padding-bottom` op de bordcontainer ter hoogte van de balk wanneer die zichtbaar
   is, en de select een vaste openrichting/`max-height` geven.
5. **Uitlegtekst "Mijn opdrachten is beschikbaar zodra…"** staat permanent in de
   filterbalk voor iedereen zonder editorprofiel — ook voor de admin die dat nooit
   krijgt. *Doen:* tekst weg uit de balk; tooltip op de disabled chip.
6. **Attentiestrook-chips ogen als labels, niet als acties.** Ze filteren wél bij
   klik (of horen dat te doen). *Doen:* hover-state + cursor-pointer + chevron of
   "Bekijk →" zodat de klik-affordance zichtbaar is. En check de duplicatie met de
   quick-filter "Wacht op fotonummers" die er direct boven staat — één van de twee
   mag de teller dragen, niet allebei even prominent.

**Verificatie:** bord met echte data (164 opdrachten) — druktebeeld vergelijken
vóór/na; bulk-selectie met dropdown openen onderaan de kolom; `npm run verify`.

---

## V4-WP4 — Detailkop: gevaarlijke acties uit het zicht (model: Sonnet aanbevolen)

De kop van het opdrachtdetail zet vijf acties op één rij, met gelijke visuele rang:
Openen in Magnific · potlood-icoon · Bewerken · Annuleren · Verwijderen.

1. **"Annuleren" is dubbelzinnig — en dat is gevaarlijk.** In elke Nederlandse UI
   betekent "Annuleren" *deze handeling afbreken*; hier betekent het *de opdracht
   annuleren* (V3-WP5, `cancel_reason`). Iemand die een bewerking wil afbreken klikt
   precies verkeerd. *Doen:* hernoem naar "Opdracht annuleren".
2. **Destructief hoort niet op de eerste rij.** *Doen:* "Opdracht annuleren" en
   "Verwijderen" verhuizen naar een "⋯"-overflowmenu rechts, elk met
   bevestigingsdialoog (die er voor Verwijderen vermoedelijk al is — check).
   Overblijvende rij: "Openen in Magnific" (primair) + "Bewerken" (secundair).
3. **Los potlood vs. "Bewerken"** — zie V4-WP1.3; los het hier definitief op.

**Verificatie:** screenshot kop; klikpad "Opdracht annuleren" en "Verwijderen"
doorlopen t/m bevestiging; `npm run verify`.

---

## V4-WP5 — Dashboard: hiërarchie en tokens (model: Sonnet aanbevolen)

1. **Twee losse geldkaarten → één businesscase-rij.** "Vermeden fotografiekosten"
   (hero) en "Kosten per bewerking" zijn hetzelfde verhaal maar staan als losse
   blokken onder elkaar, terwijl de vier kleine statustegels ernaast verdrukt staan.
   *Doen:* één rij: besparing-hero + kosten-per-bewerking naast elkaar; de vier
   tegels als evenwichtige rij eronder met iets meer lucht (waarde groot, label
   eronder, consistente hoogte).
2. **Grafiekkleuren uit de tokens.** Het maandvolume gebruikt blauw/oranje dat
   nergens anders in de app voorkomt. *Doen:* Recharts-kleuren op de
   `--chart-*`-tokens zetten (zie `globals.css`), consistent met de rest; check ook
   `components/dashboard/goal-usage-chart.tsx` en `top-issues-chart.tsx`.
3. **Status-strip klikbaar maken.** "Nieuw 162 · In behandeling 1 · …" is nu dode
   tekst. *Doen:* elk segment linkt naar het bord met dat statusfilter.
4. **Datacheck doorlooptijd.** De tegel "Gem. doorlooptijd" toont "—" terwijl er
   130 goedgekeurde opdrachten zijn. Dat is óf een view-bug óf massaal ontbrekende
   `request_date`/`date_completed`. *Doen:* `v_cycle_time` narekenen in de SQL
   editor; is het een databug, fixen; zijn het de data, dan de tegel een nette
   verklarende tooltip geven i.p.v. een kaal streepje.

**Verificatie:** dashboard-screenshot vóór/na; dataviz-skill-regels aanhouden bij
grafiekwijzigingen; `npm run verify`.

---

## V4-WP6 — Academy: dichtheid en voortgang (model: Haiku volstaat, Sonnet bij twijfel)

De index is nu een lijst kale titelbalken; de belofte "in volgorde, begin hier"
wordt visueel niet waargemaakt.

1. **Nummering + voortgang op de onboarding-track.** Rijen nummeren (1, 2, 3…) en
   bij de track-tabs een teller "2 van 6 gelezen". De data is er al
   (`academy_reads`).
2. **Rijen mogen meer vertellen.** Eén regel beschrijving (eerste zin van de module
   of een apart veld hoeft niet — truncate de body) onder de titel, leesstatus
   rechts uitgelijnd, consistent per rij.
3. **Concepten visueel apart.** Voor de coordinator staan CONCEPT-rijen nu tussen de
   gepubliceerde. *Doen:* aparte sectie "Concepten" onderaan de track, of een
   duidelijk afwijkende (gedimde) rij-stijl.
4. **"Gelezen"-knop met echte toestand.** Op de modulepagina oogt de knop als
   disabled terwijl hij een toggle is. *Doen:* ongelezen = secundaire knop
   "Markeer als gelezen"; gelezen = ✓ "Gelezen" met subtiele stijl en klik =
   ongedaan maken (tooltip zegt dat).
5. **Auto-slug in de module-editor.** Slug live meegenereren uit de titel
   (bewerkbaar blijven). Scheelt tikwerk en voorkomt rare slugs.

**Verificatie:** academy-index en modulepagina als coordinator én als editor
(concepten onzichtbaar); `npm run verify`.

---

## V4-WP7 — Kaart en Beheer: afwerking (model: Haiku volstaat)

1. **Hardcoded kleuren op de kaart → tokens.** In `components/kaart/map-screen.tsx`
   staan `#f97316` en `#6366f1` hardcoded in de Leaflet-`pathOptions` (bij de
   Leaflet-migratie ingeslopen). *Doen:* CSS-variabelen lezen
   (`getComputedStyle`/`var(--chart-1)`-waarden één keer resolven in het component)
   zodat de kaart de tokens volgt.
2. **Legenda op de kaart zelf.** Oranje = locatie, paars/ruit = fotograaf staat nu
   alleen in de zijbalk-uitleg. *Doen:* mini-legenda linksonder op het kaartvlak
   (zelfde stijl als de attribution-hoek).
3. **Beheer-schermen zijn te smal voor hun inhoud.** De Ares-importpagina perst een
   alias-lijst en importtabellen in een smalle gecentreerde kolom met enorme
   marges. *Doen:* beheer-layout een ruimere `max-w` geven (bijv. `max-w-6xl` of
   full-width binnen padding) — in elk geval voor Ares-import en Referentiedata.
4. **Alias-lijst compacter.** Eén rij per alias met een losse "Ontkoppelen"-knop
   wordt een lange lat. *Doen:* tweekoloms grid of compacte tabel; ontkoppelen als
   klein icoon met tooltip.

**Verificatie:** kaart-screenshot (tokens kloppen in het thema), importpagina op
een breed scherm; `npm run verify`.

---

## Buiten scope (bewust)

- **Dark mode** — de app is bewust light-only; niets in dit plan verandert dat.
- **Herontwerp van schermen** — alles hierboven is verfijning binnen het bestaande
  VfY 2.0-systeem, geen nieuwe lay-outs.
- **Functionele uitbreidingen** (notificaties, Ares-koppeling, e.d.) — apart traject.
- **Tabelweergave bord** — niet beoordeeld (geen screenshot); loop hem na afloop van
  V4-WP3 kort na op dezelfde punten (prioriteitsruis, leeftijdskleur).

## Herkomst

Opgesteld op basis van live screenshots van alle acht schermen (Vercel-deploy,
admin-account, echte data: 164 opdrachten, 104 kaartlocaties) plus de broncode.
Bevinding V4-WP5.4 (doorlooptijd "—") is een datavermoeden en moet eerst worden
nagerekend voordat er iets wordt gebouwd.
