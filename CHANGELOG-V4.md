# V4 — UX- en visuele optimalisatie

Op basis van een kritische review van live screenshots (alle acht schermen,
echte data: 164 opdrachten, 104 kaartlocaties) is een geprioriteerd plan
opgesteld ([BUILDPLAN-V4.md](BUILDPLAN-V4.md)) en in zeven werkpakketten
uitgevoerd. Elke WP is los gecommit en geverifieerd met `tsc --noEmit`,
`eslint`, `vitest` en `next build`.

## WP1 — Microcopy, labels, paginakop-inconsistentie
- Zoekveld-placeholder uitgebreid naar "Zoek op acco-ID, editor of expert"
  (dekte de bestaande zoekscope niet meer sinds V3-WP7.1).
- QC-paginakop rechtgetrokken naar het patroon van de andere schermen
  (eyebrow kort, titel voluit).

## WP2 — loading.tsx per route
- Eén generieke centrale skeleton dekte alle routes; elke navigatie zag er
  daardoor niet uit als de pagina waar je heen ging.
- Eigen `loading.tsx` per hoofdroute die de echte lay-out spiegelt: bord,
  opdrachtdetail, QC, dashboard, academy-index + module, kaart, beheer.
- Leaflet-kaartcontainer kreeg een achtergrond zodat laden niet als een gat
  oogt.

## WP3 — Bord rustiger en schaalbaar
- Prioriteitsbadge: alleen Hoog krijgt kleur; Gemiddeld een stil stipje;
  Laag niets — voorheen droeg vrijwel elke kaart dezelfde amberbadge.
- Leeftijd kleurt vanaf een drempel (>30d amber, >90d rood).
- Kolomcap (25) met "Toon alle N"-knop i.p.v. 160+ kaarten in één keer.
- Zwevende bulk-balk krijgt ruimte i.p.v. over de laatste rij te vallen.
- Permanente uitlegtekst vervangen door een tooltip op de disabled chip.
- Dubbele "Wacht op fotonummers"-weergave (attentiekaart + losse chip)
  opgelost: de chip is verborgen tenzij al actief via de URL.

## WP4 — Detailkop: gevaarlijke acties uit het zicht
- "Annuleren" hernoemd naar "Opdracht annuleren" — voorkomt de vrijwel
  gegarandeerde verwarring met "deze handeling afbreken".
- "Opdracht annuleren" en "Verwijderen" verhuisd naar een ⋯-overflowmenu,
  elk nog steeds achter hun bevestigingsdialoog.
- Losse potlood-icoon bij de Magnific-link kreeg een zichtbaar label.

## WP5 — Dashboard: hiërarchie en een echte databug
- Besparing-hero en Kosten per bewerking staan nu naast elkaar i.p.v. als
  losse blokken met de statustegels verdrukt ernaast.
- Statusstrip is nu klikbaar, met correcte archief-flag per status.
- **Bug gevonden en gefixt**: "Gem. doorlooptijd" toonde altijd "—" ondanks
  130 goedgekeurde opdrachten. `v_cycle_time` meet via `lead()` over
  status-overgangen, en voor een eindstatus als "approved" bestaat
  vrijwel nooit een vólgende overgang — de rij viel structureel weg.
  Databron vervangen door de al bestaande `v_team_average.gem_doorlooptijd_dagen`.
  Geen migratie nodig.
- Grafiekkleuren bleken bij inspectie al token-conform — geen wijziging.

## WP6 — Academy: dichtheid en voortgang
- Onboarding-track nummert rijen; tabbalk toont "X van Y gelezen".
- Elke rij toont een eerste-regel preview van de module-body.
- Concepten in een aparte sectie i.p.v. tussen gepubliceerde modules.
- "Gelezen"-knop is nu een echte toggle (nieuwe server action
  `unmarkGuidelineRead`) i.p.v. een knop die na klikken permanent
  disabled oogde.
- Auto-slug in de module-editor bleek al aanwezig.

## WP7 — Kaart en Beheer: afwerking
- Hardcoded hex-kleuren op de kaart vervangen door `--chart-2`/`--chart-7`.
  De zijbalk-legenda bleek daarbij zelfs de verkeerde tokens te dragen
  t.o.v. de echte markerkleuren — nu overal consistent.
- Mini-legenda toegevoegd op het kaartvlak zelf.
- Beheer-layout van `max-w-4xl` naar `max-w-6xl`.
- Alias-lijst naar een tweekoloms grid met compact icoon i.p.v. tekstknop.

---

**Herkomst**: opgesteld op basis van live screenshots van alle acht
schermen (Vercel-deploy, admin-account) plus code-review. Zeven commits op
`main`, allemaal met groene `tsc`/`eslint`/`vitest`/`build`.
