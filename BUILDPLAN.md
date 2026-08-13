# Buildplan v2 — van "werkende tracker" naar een app waar je blij van wordt

**Status:** goedgekeurd door Wouter, 2026-08-12
**Uitvoering:** dit plan is geschreven om door een ander Claude-model (bijv. Sonnet)
uitgevoerd te worden, werkpakket voor werkpakket. Lees eerst `AGENTS.md`, dan dit
bestand. Bij conflict wint dit bestand — het is de jongste beslissing van de eigenaar,
en afwijkingen van AGENTS.md die hieronder staan zijn daarmee expliciet gesanctioneerd.
Werk na afloop van elk werkpakket de checklist onderaan bij (vink af in dit bestand).

---

## 1. Waarom de app nu "te basic" voelt — de diagnose

De kritiek van de eigenaar: het huidige resultaat is niet duidelijk beter of
aantrekkelijker dan de Excel. Die kritiek klopt, en de oorzaak is meetbaar, niet
een smaakkwestie:

1. **Er bestaat 1 van de 5 schermen.** Alles wat deze app beter maakt dan Excel —
   het bord, de uitklapbare foto-rijen, de QC-feedbackloop, het dashboard, de
   academy — zit in de 80% die nog niet gebouwd is. Excel verliest pas als die
   dingen er staan.
2. **Het ene scherm dat er is, heeft de meest generieke compositie die er bestaat:**
   een filterbalk boven een tabel. Dat ís Excel, maar dan in een browser. De spec
   schrijft nota bene een bordweergave als default voor, met uitklapbare rijen,
   voortgang per opdracht en een QC-callout — geen daarvan is gebouwd.
3. **Er is geen app-shell.** Geen navigatie, geen gebruikersmenu, geen thema-schakelaar,
   geen sneltoetsen. Het voelt als een losse pagina, niet als een applicatie.

**Conclusie voor de aanpak:** het probleem is niet de VfY-huisstijl. De tokens
(Sen/Noto/Plex Mono, teal-ink, hairlines) zijn precies het Linear-achtige fundament
dat de spec vraagt. Het probleem is ambitieniveau in compositie en het ontbreken van
de onderscheidende features. We blijven dus óp het tokensysteem bouwen, maar breiden
het bewust uit waar het te karig is (zie §3), en we bouwen elk scherm met een
"signature moment" in plaats van het sjabloonantwoord.

---

## 2. Wat "blown away" concreet betekent — het toetskader

Elk werkpakket wordt hieraan getoetst. Dit is de definitie van klaar op productniveau,
naast de technische Definition of done in AGENTS.md:

- [ ] **Opent als een applicatie.** Persistente shell met zijnavigatie, gebruikersmenu,
      thema-schakelaar. Navigeren voelt instant (geen full-page flashes).
- [ ] **⌘K/Ctrl-K command palette.** Spring naar een opdracht op acco-id, wissel van
      scherm, voer een actie uit. Dit is het goedkoopste "dit is geen Excel"-signaal
      dat er bestaat.
- [ ] **Het bord is de default en is aanraakbaar.** Kolommen per status, kaarten
      slepen om status te wijzigen (optimistisch, met rollback), kolomtellers,
      werkdruk in één oogopslag.
- [ ] **Voortgang is zichtbaar en beweegt.** "7 van 11 af" als mini-voortgangsbalk
      op de rij én op de kaart; een foto afvinken laat hem vloeiend oplopen.
- [ ] **De app vertelt je wat aandacht nodig heeft** vóór je iets aanklikt: een
      attentiestrook bovenaan ("3 opdrachten langer dan 5 dagen in QC", "9× witte
      rand dit seizoen → module") in plaats van zes even luide statistiekblokken.
- [ ] **De QC-feedbackloop is zichtbaar in het dagelijkse scherm.** De callout die
      QC-data aan een academy-module koppelt is hét bestaansrecht van deze app —
      die verdient opvallende, verzorgde vormgeving.
- [ ] **QC-triage is toetsenbord-eerst.** j/k door de wachtrij, a = goedkeuren,
      d = afkeurformulier, zichtbare hint. Sneller dan Excel ooit kon.
- [ ] **Donkere modus die er bewust uitziet**, niet als een inversie-bijproduct.
- [ ] **Elke lege, ladende en fouttoestand is ontworpen** (EmptyState/LoadingState/
      ErrorState uit de starter) met concrete Nederlandse microcopy.
- [ ] **Density als kwaliteit:** 40 rijen scanbaar zonder scrollen op 1280px,
      zoals Linear. Geen kaarten met lucht waar een editor rijen wil.

---

## 3. Uitbreidingen op de huisstijl (gesanctioneerde afwijkingen)

De eigenaar heeft expliciet gezegd: het eindresultaat gaat boven strikte naleving
van `vfy-app-design`. We gooien het systeem niet weg — we breiden het uit. Alle
uitbreidingen landen in `app/globals.css` als tokens (nooit inline), en worden bij
oplevering als changelog-regel in `AGENTS.md` bijgeschreven zodat de twee documenten
niet uit elkaar lopen. Concreet gesanctioneerd:

1. **Avatarpalet.** Eén grijze initialencirkel voor iedereen is anoniem. Voeg een
   klein, gedempt categorisch palet toe (6–8 tinten, afgeleid met de kleurmethode
   uit de `dataviz`-skill) zodat elke editor een vaste, herkenbare kleur heeft —
   op het bord zie je dan in één blik wie wat heeft.
2. **Grafiekpalet.** Tokens voor de dashboardcharts (`--chart-1` … `--chart-n`),
   gevalideerd met de `dataviz`-skill, beide thema's.
3. **Voortgangs- en heatmap-tinten.** Een token voor de voortgangsbalk en voor de
   "te lang in QC"-achtergrondtint die AGENTS.md al noemt.
4. **Eén signature-element per scherm mag buiten de bestaande compositiepatronen
   vallen** (bijv. de attentiestrook, de QC-callout, het hero-getal op het
   dashboard) — zolang kleur/typografie uit de tokens komt.
5. **Motion mag iets ruimer** dan de skill voorschrijft voor micro-feedback
   (voortgangsbalk, kaart-drop op het bord, palette-open), altijd binnen de
   bestaande duration-tokens en met `prefers-reduced-motion`-respect.

Niet gesanctioneerd (blijft verboden): hex-waarden buiten `globals.css`, een tweede
accentkleur naast teal voor acties, fonts buiten Sen/Noto/Plex Mono, shadows buiten
de scale. Dat zijn de dingen die een app er ná drie maanden onderhoud goedkoop
uit laten zien.

---

## 4. Vaste afspraken voor het uitvoerende model

- **Lees per sessie eerst:** `AGENTS.md`, dit bestand, en de skill-invocaties die het
  werkpakket noemt. `docs/concept-mockup.html` is de layoutreferentie;
  `../toeristenbelasting-scraper/review-app` toont de starter in een echt project.
- **Skills:** `vfy-app-design` bij elk scherm (de verificatieronde in §4 daarvan is
  verplicht, ook onder dit plan); `supabase-postgres-best-practices` bij elke wijziging
  in `db/`; `supabase` bij auth/SSR-werk; `dataviz` vóór de eerste grafiek.
- **Nieuwe dependencies zijn vastgelegd, improviseer er geen:**
  `@dnd-kit/core` + `@dnd-kit/sortable` (bord), `@tanstack/react-virtual` (tabel),
  `cmdk` (command palette), `sonner` (toasts), `recharts` (dashboard),
  `react-markdown` + `remark-gfm` (academy). Iets anders nodig → eerst voorleggen.
- **Elke write via een server action met Zod** (schema's in `lib/validation.ts`,
  guards in `lib/workflow.ts` — herbruiken, niet dupliceren). Optimistisch met
  rollback op statuswijziging en afvinken.
- **Testregime per werkpakket:** `npm test` en `npm run build` groen vóór oplevering;
  nieuwe workflow-regels krijgen een Vitest-test; de visuele verificatieronde
  (375/768/1280, licht+donker, leeg/laden/fout écht getriggerd) wordt gedraaid en
  in de sessie gerapporteerd, niet beloofd.
- **Wat je niet doet:** `db/01`–`03` aanraken; fotobestanden of uploads toevoegen
  (permanent verboden, AGENTS.md regel 2); `status_events` handmatig beschrijven;
  een blok-editor voor de academy; notificaties.

---

## 5. Werkpakketten

De volgorde is dwingend: elk pakket bouwt op het vorige. Eén pakket per sessie is
de veilige maat; WP1 mag over twee sessies (1a bord+shell-integratie, 1b tabel+callout).

### WP0 — Fundament: database toepassen + app-shell + tokens *(klein, maar alles hangt eraan)*

1. **Database:** draai `db/04_v2_academy.sql` op het gelinkte project (Supabase SQL
   editor of `supabase db push`-equivalent — het script is idempotent). Regenereer
   daarna types: `npm run types:generate`. Commit beide.
2. **Token-uitbreidingen** uit §3 in `app/globals.css`: avatarpalet, chartpalet,
   voortgangs-/attentietinten. Beide thema's. Valideer contrast met de
   `dataviz`-methode.
3. **App-shell** (`components/shell/`): smalle zijnavigatie (Opdrachten, QC,
   Academy, Dashboard, Instellingen — rechten-bewust: QC/Dashboard alleen
   coordinator/admin), gebruikersmenu met uitloggen, thema-schakelaar
   (licht/donker/systeem, persistent), en de paginatitel in een consistente
   `PageHeader`. Mobiel/tablet: navigatie klapt in tot iconen.
4. **Command palette** (`cmdk`): schermen, "zoek opdracht op acco-id" (client-side
   over de al geladen lijst is genoeg voor nu), en de thema-toggle. Ctrl-K/⌘K,
   zichtbaar als hint in de shell.
5. **Toasts** (`sonner`), gestyled op tokens; alle bestaande server-action-feedback
   (bulk-acties) verhuist van inline tekst naar toast + inline waar relevant.

**Klaar wanneer:** types gecommit na echte migratie; alle bestaande tests groen;
shell + palette + thema werken op 375/768/1280 in beide thema's; geen route zonder
shell behalve `/login`.

### WP1 — Opdrachtenscherm v2: het bord als hart van de app

Referentie: `docs/concept-mockup.html` (statistiekenrij, filterchips, tabel met
uitklapbare foto-rijen, QC-callout) + AGENTS.md scherm 2.

1. **Attentiestrook** boven alles (het signature-element van dit scherm): compacte
   chips met échte aantallen — "X in QC langer dan `qc_reminder_days` dagen",
   "X hoge prioriteit zonder editor", en de QC-callout ("*Witte rand aan de
   bovenkant* — 9 QC-notities dit seizoen → **module openen**") zodra een issue de
   drempel uit `app_settings` kruist. Elke chip is een klik naar de gefilterde lijst.
2. **Bordweergave als default** (`@dnd-kit`): kolommen per status (zonder backlog
   en archief, conform default scope), kaarten met acco-id, expert, voortgangsbalk,
   prioriteit-badge, editor-avatar (gekleurd). Slepen wijzigt status via de
   bestaande guards: naar `qc` slepen met open foto's toont de concrete blokkade
   als toast (`canSubmitToQc`); `approved`/`denied`/`ai_rejected`-kolommen zijn
   voor editors niet-droppable. Optimistisch + rollback.
3. **Tabel v2:** gevirtualiseerd (`@tanstack/react-virtual`), rijen uitklapbaar
   naar de `edit_items` met done-checkboxen (één server action per vinkje,
   optimistisch), voortgang als mini-balk + "7 van 11", status als Chip, prioriteit
   als Badge, dagen-open rechts met de attentietint uit WP0 voor QC-overschrijders.
4. **Grouping en filters:** bestaande status/editor-grouping en URL-filters blijven;
   quick filters worden visueel chips in de attentiestrook-stijl.
5. **Bulk-balk:** zwevende selectiebalk onderaan (aantal, toewijzen, prioriteit,
   annuleren) in plaats van de huidige inline formulieren.

**Klaar wanneer:** bord default en sleepbaar mét geblokkeerde-drop feedback; rij
uitklapbaar en afvinkbaar met bewegende voortgang; callout zichtbaar bij drempel
(test door de drempel in `app_settings` tijdelijk op 1 te zetten); tabel blijft
vloeiend met 352 rijen; verificatieronde gedraaid.

### WP2 — Opdrachtdetail

AGENTS.md scherm 3, integraal: drie kolommen (links meta + statusknoppen volgens
rolrechten, midden foto's per goal met snelle invoer "12, 15, 18" → losse
`edit_items` + warn boven `max_photos_per_property`, rechts contextuele
academy-modules en kopieerbare prompts), "Openen in Magnific"-knop
(`magnific_url` → fallback `app_settings.magnific_base_url`, inline bewerkbaar),
QC-tab met rondes naast elkaar, `legacy_notes` alleen indien gevuld ("Notitie uit
Excel", read-only), en de zelfcheck-dialoog vóór inleveren naar QC (niet
gepersisteerd). Statusovergangen via `lib/workflow.ts`-guards, foutmeldingen
concreet Nederlands.

**Klaar wanneer:** de volledige editor-flow (openen → afvinken → zelfcheck →
naar QC) klikbaar is zonder dode einden; sneltoets-navigatie vanuit de lijst
(enter opent, esc terug); verificatieronde gedraaid.

### WP3 — QC-scherm

AGENTS.md scherm 4, integraal, met toetsenbord als eersteklas burger: wachtrij
oudste-eerst, j/k of pijltjes, a = goedkeuren, d = afkeurformulier, zichtbare
sneltoets-hint. Bevindingen per foto (nummer, categorie uit `qc_issue_types`,
commentaar; `other` vereist commentaar; zonder categorie kan niet). Afkeuren
zonder bevinding is geblokkeerd via `canDeny`. Géén bevestigingsdialoog op
afkeuren (triage-wachtrij). Na afkeuren ziet de editor de bevindingen als
afvinklijst op het detailscherm.

**Klaar wanneer:** een volledige QC-ronde kan zonder muis; de e2e-doorlooptest
uit `e2e/assignment-journey.spec.ts` kan van `fixme` af en is groen tegen
`supabase start` (zeven `status_events`-rijen); verificatieronde gedraaid.

### WP4 — Dashboard

AGENTS.md scherm 6. Invoke `dataviz` vóór de eerste grafiek. Eén hero-getal
(aantal open in QC of approval rate — kies wat de coördinator dagelijks checkt)
met de rest ondergeschikt; **Top QC-issues** als belangrijkste grafiek met
klik-door naar de gefilterde opdrachtenlijst; performance per editor (alleen
hier zichtbaar); usage per goal; maandvolume aangevraagd vs. afgerond; CSV-export
per view. Alles leest uit de views, niets herberekend in TypeScript. Chartkleuren
uit de WP0-tokens.

**Klaar wanneer:** cijfers exact gelijk aan de views los gedraaid in de SQL editor;
RLS-test uit `tests/rls/` groen gedraaid tegen `supabase start` vóór oplevering
(AGENTS.md: vóór het dashboard, niet erna); verificatieronde gedraaid.

### WP5 — Academy

AGENTS.md scherm 5, integraal: drie tracks (onboarding strikt geordend, goal per
goal, tips nieuwste eerst), module = kalm document (ruime regelafstand, markdown,
goed/fout-voorbeelden naast elkaar, stabiele URL, "gelezen"-knop →
`academy_reads`), promptbibliotheek per goal met kopieerknop, eigen voortgang
zonder vergelijking (alleen teamgemiddelde uit `v_team_average`, en verberg het
als de groep < 3 is), markdown-editor met live preview voor de coördinator, en
de auto-voorgestelde conceptmodule wanneer een issue de drempel kruist zonder
gepubliceerde module (`origin = 'qc_suggested'`, nooit auto-publiceren).

**Klaar wanneer:** een nieuwe editor kan het onboarding-track van 1 tot 100 lezen;
een prompt kopiëren kost één klik; de QC-callout uit WP1 linkt naar een échte
module; verificatieronde gedraaid.

### WP6 — Polijst- en waarheidsronde

1. Micro-interacties nalopen: hover/focus op alles, voortgangsanimatie, palette,
   toasts — en overal `prefers-reduced-motion` gecheckt.
2. Alle schermen nogmaals door de verificatieronde, nu als geheel (navigatiestromen,
   niet losse pagina's), beide thema's, drie breekpunten, met lange echte data
   (langste acco-id, langste expertnaam).
3. Volledige testsuite: Vitest, RLS-test, e2e-doorloop, `npm run build` — allemaal
   groen in één sessie gerapporteerd.
4. README bijwerken (lokaal draaien, env-vars, Vercel-deploy, wat te doen bij een
   mislukte deploy) en de §3-afwijkingen als changelog-regel in `AGENTS.md`.
5. Restpunten uit fase 0 die nog open staan: de 5 migratiewaarschuwingen uit
   `docs/migratie_log.txt` handmatig afwerken (of expliciet doorschuiven met reden).

---

## 6. Voortgang

| WP | Omschrijving | Status |
|---|---|---|
| 0 | DB toepassen, shell, tokens, palette, toasts | ✅ |
| 1 | Opdrachtenscherm v2 (bord, tabel, callout) | ✅ |
| 2 | Opdrachtdetail | ✅ |
| 3 | QC-scherm + e2e-doorloop groen | ⚠️ gebouwd, e2e nog niet live geverifieerd (geen Docker in deze sandbox) |
| 4 | Dashboard + RLS-test groen | ⚠️ dashboard gebouwd, RLS-test nog niet live geverifieerd (geen Docker in deze sandbox) |
| 5 | Academy | ✅ |
| 6 | Polijstronde, README, AGENTS.md-changelog | ⬜ |
