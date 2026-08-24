# Design V5 — "Studio", een alternatieve visuele richting

Dit is een **fork van VfY 2.0**, geen vervanging. VfY 2.0 (`vfy-app-design`-skill)
blijft de huisstijl voor VfY-tools; V5 is een alternatieve, rijkere richting voor
déze app, opgesteld op basis van de mockups in
`docs/mockups-v5/` (`01_assignments_board.png` t/m `07_admin_settings.png`).

Wat V5 loslaat t.o.v. VfY 2.0: de teal-accent, de "hairlines, geen schaduw"-regel,
en de strikte Linear-dichtheid. Wat blijft: tokens als enige bron van kleur, geen
losse hexen in componenten, semantische kleur alleen voor status, en de
toegankelijkheidsregels (focus-ring, aria-labels, `Intl.*`, URL-state).

---

## 1. De drie verschuivingen

**Donkere chrome, licht canvas.** De zijbalk wordt bijna-zwart met lichte tekst,
een logo-merk bovenaan en een gebruikersblok onderaan. Het werkvlak blijft licht.
Dit is *chrome*, geen dark mode — de app blijft light-only.

**Groen in plaats van teal.** Eén accent, dieper en warmer dan de huidige teal.
Draagt de primaire actie, het actieve nav-item en het besparingsverhaal.

**Meer lucht, meer diepte.** Grotere radii, zachte schaduw op kaarten, ruimere
padding. Kaarten mogen als objecten lezen in plaats van als tabelrijen.

### Token-delta (alleen wat verandert t.o.v. `app/globals.css`)

```
--v5-chrome:        #101820   /* zijbalk */
--v5-chrome-raised: #1a242c   /* hover in de zijbalk */
--v5-chrome-active: #14432c   /* actief nav-item, groen getint */
--v5-chrome-ink:    #e8edf0   /* tekst op chrome */
--v5-chrome-muted:  #8b979f   /* secundaire tekst op chrome */

--v5-green-600: #14804a       /* primair: knoppen, actieve staat */
--v5-green-700: #0f6b3d       /* hover */
--v5-green-800: #0b5230       /* hero-gradient eindpunt */
--v5-green-100: #e7f4ec       /* tint */

--radius-md: 8px              /* was 6 */
--radius-lg: 14px             /* was 10 */
--shadow-card: 0 1px 2px rgb(16 24 32 / .04), 0 4px 12px rgb(16 24 32 / .06)
```

De acht `--chart-*`-tinten blijven ongewijzigd — die zijn gevalideerd en dragen
in V5 extra gewicht (zie §2). Contrast van elke nieuwe groen/chrome-combinatie
wordt in WP0 nagerekend, niet op het oog aangenomen.

---

## 2. Het beeldloze systeem — de kern van V5

De mockups leunen zwaar op foto's: thumbnails op bordkaarten, een hero-beeld en
before/after op het detailscherm, een grote viewer in QC, een bannerfoto op de
Academy. **Dat kan deze app niet leveren**: er is geen Ares-API en de foto's
opslaan op een tweede plek is niet in verhouding. Er komt bewust nooit een
fotobestand in deze app (AGENTS.md, Storage = alleen academy-lesmateriaal).

De vervanging is geen grijs vlak waar een foto had gemoeten. De app gaat over
**welke bewerking** op **welke fotonummers** — dus dat wordt het beeld. Drie
nieuwe primitieven, alle drie gedekt door data die er al is:

### `GoalTile` — vervangt de thumbnail

`editing_goals.icon` is al geseed met lucide-namen (`snowflake`, `sun`,
`sparkles`, `cloud`, `bed`, `eraser`, `leaf`) en `editing_goals.code` krijgt een
**vast** slot in het chart-palet — niet gehasht, zodat "Zomer naar winter" overal
in de app dezelfde kleur en hetzelfde glyph draagt.

Drie maten:
- `strip` — een band van ~44px bovenaan een bordkaart, in de goal-tint, met het
  glyph en (bij meerdere doelen) een `+2`. Neemt de plek en de silhouet van de
  thumbnail uit de mockup over.
- `panel` — één paneel per doel op het detailscherm, glyph groot, fotonummers
  eronder.
- `tile` — grote tegel in de QC-review-canvas.

Dit is *informatiever* dan een thumbnail: een foto van een slaapkamer vertelt je
niet dat het om "bed opmaken" gaat, een glyph wel.

### `PhotoPips` — vervangt de voortgangsbalk en de before/after

`edit_items` heeft `photo_number` en `done`. Klein: een rij vierkantjes, gevuld =
af, omlijnd = open — in één blik zie je 3/8 zonder een getal te lezen. Groot:
klikbare genummerde chips (`#12`), die in QC de bevinding per foto dragen.

### `AccoMark` — vervangt de visuele identiteit van een foto

Het acco-id in mono, met een kleurspine ontleend aan `avatarColorVar(accoId)` —
die hash-functie bestaat al (`lib/avatar-color.ts`). Elke woning krijgt zo een
stabiele visuele vingerafdruk over alle schermen heen: je herkent AT.5730.22 aan
zijn kleur, precies wat een thumbnail zou doen.

### Eén signature-moment per scherm

De VfY-skill's regel "spend boldness in one place" blijft staan:

| Scherm | Het moment |
|---|---|
| Bord | de goal-strip als gekleurde kop op elke kaart |
| Opdrachtdetail | het goal-board (grote panelen) + de tijdlijn |
| QC | de review-canvas met grote genummerde tegels |
| Dashboard | de besparings-hero (groene gradient, groot getal) |
| Academy | de typografische hero — tekst op groen, geen bannerfoto |
| Kaart | de kaart zelf, verder rustig |
| Beheer | geen — blijft bewust stil |

---

## 3. Dichtheid: de mockup vs. 164 opdrachten

De mockups tonen 3 royale kaarten per kolom. De werkelijkheid is 162 in "Nieuw".
Zonder ingreep betekent mockup-dichtheid eindeloos scrollen.

Daarom: **twee dichtheden, in de URL** (`?density=comfortable|compact`).
- *Comfortable* — de mockup-kaart met goal-strip. Standaard.
- *Compact* — de huidige V4-rij, één regel per opdracht.
- De tabelweergave blijft onveranderd de dichtste modus.
- De kolomcap uit V4-WP3 (25 + "Toon alle N") blijft in beide.

---

## 4. Wat er in de mockups staat en we bewust niet bouwen

- **Foto's, thumbnails, before/after, bannerbeelden** — zie §2.
- **"Calendar"-tab op het bord** — die functie bestaat niet.
- **"Message"-knop op het detailscherm** — er is geen berichtenfunctie.
- **Satellietkaart** — Leaflet draait op OSM-rastertegels (stratenkaart);
  satelliet vereist een andere aanbieder met eigen licentie en kosten.
- **De spaarvarken-illustratie** op het dashboard — vervangen door typografie.
- **"Requested 2h ago"** waar de database alleen een datum heeft (`request_date`
  is een `date`). Relatieve tijd alleen waar we een `timestamptz` hebben
  (`status_events.created_at`).
- **"−78%"** als headline op het dashboard — een percentage vraagt een
  gedefinieerde noemer. Te berekenen uit `monthly_editing_cost_eur` vs. vermeden
  shootkosten, maar dat is een inhoudelijke keuze die de eigenaar maakt, geen
  ontwerpkeuze. Tot die keuze er is: het absolute bedrag, zoals nu.

---

## 5. Herkomst

Mockups gegenereerd door ChatGPT op basis van een conceptbeschrijving, augustus
2026. Ze zijn richtinggevend voor sfeer, lay-out en hiërarchie — niet voor
functionaliteit: waar een mockup iets toont dat de app niet heeft of niet kan
leveren, wint de app (zie §4).
