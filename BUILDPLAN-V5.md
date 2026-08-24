# BUILDPLAN V5 — "Studio": de mockups omzetten naar de app

Uitvoering van [DESIGN-V5.md](DESIGN-V5.md). Lees die eerst — met name §2 (het
beeldloze systeem), want WP3 t/m WP7 leunen er allemaal op.

**Werkwijze**

1. **Werk op een branch** (`design-v5`), niet op `main`. Dit is een alternatieve
   versie: je wilt hem naast de huidige app kunnen zetten via een
   Vercel-preview-deploy voordat je hem tot standaard maakt.
2. De zeven mockups staan in `docs/mockups-v5/`.
3. Per WP: `npm run verify` + een screenshot ter controle, één commit,
   Nederlandstalige commitmessage.
4. De `vfy-app-design`-skill blijft gelden voor alles wat DESIGN-V5.md niet
   expliciet overschrijft (focus-ring, aria-labels, `Intl.*`, URL-state,
   empty/loading/error-states).

**Volgorde**: WP0 t/m WP2 zijn fundament en moeten eerst; daarna zijn de schermen
los uitvoerbaar, op volgorde van hoe vaak ze dagelijks gebruikt worden.

---

## V5-WP0 — Tokens en chrome-laag (model: Sonnet)

1. Voeg de V5-tokens uit DESIGN-V5.md §1 toe aan `app/globals.css`, in dezelfde
   `@theme inline`-vorm als de bestaande (let op de bekende valkuil: een plain
   `@theme` genereert stilzwijgend geen CSS voor theme-afhankelijke waarden).
2. **Reken contrast na, neem het niet aan.** Wit op `--v5-green-600` moet ≥ 4.5:1
   halen voor knoptekst; `--v5-chrome-muted` op `--v5-chrome` idem voor
   secundaire zijbalktekst. Corrigeer de tint als iets zakt, en noteer de
   gemeten waarde in een commentaarregel bij het token.
3. `--radius-md`/`--radius-lg` ophogen en `--shadow-card` toevoegen.
4. Zet `primary` op de nieuwe groen zodat bestaande `Button variant="primary"`
   meteen meebeweegt — géén losse groene knopvariant introduceren.

**Verificatie:** een bestaand scherm (bord) rendert onveranderd van structuur,
alleen in de nieuwe kleur; geen enkele hex buiten `globals.css`.

---

## V5-WP1 — App shell: donkere zijbalk, nieuwe paginakop (model: Sonnet)

Uit mockup 01 en 07.

1. **Zijbalk** wordt `--v5-chrome`: logo-merk bovenaan, nav-items met icoon,
   actief item op `--v5-chrome-active`, en onderaan een gebruikersblok
   (avatar-initialen + naam + rol) dat het huidige `UserMenu` uit de header
   overneemt.
2. **Header**: de mockups tonen geen aparte headerbalk. De command palette (Ctrl+K)
   mag *niet* verdwijnen — verplaats de trigger naar de zijbalk, direct onder het
   logo, als een compacte zoekknop met de `Ctrl K`-kbd.
3. **Paginakop**: titel groot links, view-tabs (Bord/Tabel) op dezelfde regel
   ernaast, primaire actie rechts. Vervangt de huidige `PageHeader`-eyebrow —
   die vervalt in V5.
4. Zijbalk blijft inklapbaar op smalle schermen (huidige `w-14 md:w-56` blijft).

**Verificatie:** alle acht schermen, 375/768/1280px; Ctrl+K werkt nog vanaf elk
scherm; toetsenbordnavigatie door de zijbalk toont een zichtbare focus-ring op
donkere ondergrond (die moet apart gecontroleerd — de huidige ring is voor licht).

---

## V5-WP2 — De beeldloze primitieven (model: Sonnet — kern van V5)

Bouw DESIGN-V5.md §2. Dit WP levert geen scherm op maar drie componenten waar
WP3 t/m WP7 op staan; los committen zodat ze apart reviewbaar zijn.

1. **`lib/goal-visuals.ts`** — mapping `goal_code` → lucide-icoon +
   vaste `--chart-*`-slot. Lees het icoon uit `editing_goals.icon` (al geseed:
   snowflake/sun/sparkles/cloud/bed/eraser/leaf) met een fallback voor een goal
   die later wordt toegevoegd zonder icoon.
2. **`components/ui/goal-tile.tsx`** — varianten `strip` | `panel` | `tile`.
3. **`components/ui/photo-pips.tsx`** — varianten `pips` (compact, decoratief,
   met een tekstueel `3/8` ernaast voor schermlezers) en `chips` (groot,
   genummerd, klikbaar, met `onSelect`).
4. **`components/ui/acco-mark.tsx`** — acco-id in mono + kleurspine via het
   bestaande `avatarColorVar`.

**Verificatie:** render alle drie in alle varianten met echte data, inclusief de
randgevallen: een opdracht met 0 fotonummers, met 1 doel, met 4 doelen, en een
acco-id van maximale lengte. Kleur mag nooit de enige drager van betekenis zijn —
elk glyph heeft een `aria-label` of zichtbaar label.

---

## V5-WP3 — Bord (model: Sonnet)

Uit mockup 01.

1. **Kaart** krijgt de `GoalTile strip` als gekleurde kop, prioriteitspil
   rechtsboven daarop, daaronder acco-id + woningnaam, `PhotoPips`, en onderaan
   editor-avatar + leeftijd. De V4-regels blijven: alleen Hoog krijgt een
   gekleurde pil, leeftijd kleurt vanaf de drempel.
2. **Dichtheidsschakelaar** `comfortable` | `compact` in de URL (DESIGN-V5.md §3),
   met de V4-kolomcap in beide.
3. Filterbalk in de mockup-vorm: dropdowns op één rij, zoekveld rechts.
4. Kolomkop met naam + telling, en de bestaande dnd blijft werken — controleer
   dat de nieuwe kaarthoogte de drop-zones niet breekt.

**Verificatie:** met de echte 164 opdrachten, beide dichtheden, slepen tussen
kolommen, en de bulk-balk onderaan (die mag de laatste kaart niet afdekken).

---

## V5-WP4 — Opdrachtdetail (model: Sonnet)

Uit mockup 02.

1. Kop: acco-id groot, prioriteitspil, statuschip. Actiebalk rechts blijft de
   V4-indeling (Magnific primair, Bewerken secundair, rest in het ⋯-menu).
2. **Goal-board**: één `GoalTile panel` per aangevraagd doel, met de fotonummers
   als `PhotoPips chips` erin. Vervangt de huidige "Foto's per goal"-lijst en is
   het signature-moment van dit scherm.
3. **Tijdlijn** (nieuw, uit de mockup): de statusgeschiedenis uit `status_events`
   — die tabel bestaat al en wordt nu nergens getoond. Relatieve tijd mag hier,
   `created_at` is een `timestamptz`.
4. Metadatablok rechts: verhuurexpert, editor, datums — compacter dan nu.

**Verificatie:** een opdracht met meerdere doelen, één met nul fotonummers, en
één met een lange statusgeschiedenis.

---

## V5-WP5 — QC-review (model: Sonnet)

Uit mockup 03.

1. **Review-canvas**: grote `GoalTile tile`-tegels met de fotonummers als grote
   genummerde chips. Klik op een chip = bevinding toevoegen voor die foto. Dit
   vervangt de fotoviewer uit de mockup en is het signature-moment hier.
2. Rechterkolom: opdrachtmeta, Goedkeuren (groen) / Afkeuren (rood), en het
   opmerkingenveld uit de mockup.
3. Vorige/volgende-knoppen expliciet in de kop, náást de bestaande sneltoetsen —
   de mockup toont ze en ze zijn nu alleen als `j`/`k` bereikbaar.
4. De sneltoetsen blijven werken en blijven Ctrl/Cmd/Alt negeren (de fix van
   vorige week).

**Verificatie:** een volledige goedkeur- en afkeurronde met bevindingen per foto;
sneltoetsen; Ctrl+K opent nog steeds de palette.

---

## V5-WP6 — Dashboard (model: Sonnet)

Uit mockup 05.

1. **Besparings-hero**: groot groen gradient-paneel, bedrag in display-type,
   ondertitel met de rekensom. Geen illustratie. Signature-moment.
2. **Werklast-donut** ernaast (Recharts, `--chart-*`-tokens): verdeling over
   statussen, met de klikbare legenda die V4 al heeft.
3. **Editor-performance** blijft een tabel, in de mockup-stijl (avatar + naam,
   rechts uitgelijnde getallen).
4. **Recente activiteit** (nieuw, uit de mockup): laatste ~8 events uit
   `status_events`, met acco-id en wie het deed. Zonder thumbnails —
   `AccoMark` draagt de identiteit.

**Verificatie:** dataviz-regels aanhouden (één as, tokens, legenda); vergelijk
vóór/na met een screenshot.

---

## V5-WP7 — Academy (model: Haiku volstaat)

Uit mockup 04.

1. **Typografische hero**: koptekst op een groen gradient-vlak, geen bannerfoto.
2. **Modulekaarten** in een grid van drie, met icoon, titel, één regel
   beschrijving (die preview bestaat sinds V4-WP6) en een **leestijd** —
   berekend uit de lengte van `body_md`, niet opgeslagen.
3. **"Veelgemaakte fouten"-kolom** rechts, gevoed door `v_qc_issue_frequency` —
   die view bestaat al en dit is precies de leercirkel die AGENTS.md beschrijft.
   Geen verzonnen lijstje zoals in de mockup.
4. Nummering, voortgang per track en de concepten-sectie uit V4-WP6 blijven.

---

## V5-WP8 — Kaart en Beheer (model: Haiku volstaat)

Uit mockup 06 en 07.

1. **Kaart**: markers van cirkels naar pin-vorm, in de bestaande tokenkleuren
   (locatie `--chart-2`, fotograaf `--chart-7`). Popover zonder foto: acco-id,
   plaats, status, aantal shoots. OSM-tegels blijven (zie DESIGN-V5.md §4).
2. **Beheer**: tabel in de mockup-stijl — avatar-initialen, rol, statuspil,
   laatst actief. Dit scherm blijft bewust het stilste van de app.

---

## Volgorde en inschatting

| Fase | WP's | Waarom |
|---|---|---|
| Fundament | WP0, WP1, WP2 | zonder deze drie kan de rest niet |
| Dagelijks werk | WP3, WP4, WP5 | de schermen waar het team in leeft |
| Rapportage | WP6, WP7 | minder vaak, meer vrijheid |
| Afwerking | WP8 | randen |

Na WP2 kun je stoppen en beoordelen: de shell en de primitieven zijn dan zichtbaar
op de preview-deploy, en dat is het punt waarop je nog goedkoop van richting kunt
veranderen. Beslis daar of V5 `main` wordt of een experiment blijft.

## Openstaand voor jou

- **Dashboard-percentage**: de mockup toont "−78%". Wil je zo'n percentage, dan
  moet je de noemer vaststellen (bewerkingskosten vs. vermeden shootkosten over
  welke periode?). Tot die keuze blijft het absolute bedrag staan.
- **Wordt V5 de standaard of een variant?** Bepaalt of WP0 de bestaande tokens
  overschrijft of ernaast komt te staan onder een `.studio`-klasse.
