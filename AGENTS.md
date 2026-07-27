# VfY Photo Editing App

Interne tool voor Villa for You die het bestand `VfY_FotoBewerking_Tracker.xlsx` vervangt.
Gebruikers: 3 tot 5 AI-foto-editors, 1 coördinator, meelezende collega's. Nederlands, één taal.
Lees dit bestand bij elke taak. Wijk hier niet van af zonder dat expliciet te melden.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase: Postgres, Auth (magic link), Storage
- Hosting: Vercel
- Geen extra state-library. Server components voor lezen, server actions voor schrijven.
- `@supabase/ssr` voor sessiebeheer. Geen service-role key in clientcode.

## Database

Het schema staat in `db/01_schema.sql` en is leidend. Verzin geen tabellen of kolommen bij.
Genereer types met `supabase gen types typescript` naar `lib/database.types.ts` en gebruik die overal.

Kern:

| Tabel | Betekenis |
| --- | --- |
| `assignments` | één opdracht = één woning in één ronde. Zelfde `acco_id` mag vaker voorkomen |
| `edit_items` | één regel per foto per editing goal. Vervangt de komma-strings uit Excel |
| `status_events` | automatisch gevuld door trigger, nooit handmatig schrijven |
| `qc_reviews` / `qc_findings` | QC-ronde met bevindingen per foto |
| `guidelines` | richtlijnen in markdown, optioneel gekoppeld aan een goal |
| `editing_goals`, `qc_issue_types` | referentiedata, uitbreidbaar via de app |
| `app_settings` | onder andere `magnific_base_url`. Nooit URL's hardcoden |

Lees dashboardcijfers uit de views (`v_assignments`, `v_dashboard_status`,
`v_editor_performance`, `v_goal_usage`, `v_qc_issue_frequency`, `v_cycle_time`,
`v_monthly_volume`, `v_monthly_completed`). Bouw die logica niet na in TypeScript.

## Statusflow

```
backlog → new → in_process → qc → approved
                    ↑          ↓
                    └──────  denied
                               → ai_rejected (eindstatus, bewerking niet haalbaar)
```

- `backlog` = kandidaatwoning uit de shortlist, nog geen opdracht. Telt niet mee in KPI's.
- Editor mag zetten: `in_process`, `qc`.
- Coördinator mag alles zetten. Alleen coördinator zet `approved`, `denied` en `ai_rejected`.
- `denied` zonder minstens één QC-bevinding is niet toegestaan. Blokkeer dit in de UI.
- `date_completed` wordt door de database gezet. Niet vanuit de app schrijven.

## Schermen

### 1. Opdrachten (startscherm)
Twee weergaven op dezelfde data, met een schakelaar: **bord** (kolommen per status) en **tabel**.
Tabel is de standaard bij meer dan 50 rijen.

- Filters: status, editor, verhuurexpert, prioriteit, editing goal, zoeken op acco ID.
- Filterstatus in de URL, zodat een filter deelbaar is.
- Backlog is standaard verborgen, met een aparte schakelaar.
- Per rij zichtbaar: acco ID, verhuurexpert, aantal foto's, goals als badges, prioriteit, editor, dagen open.
- Rij ouder dan `qc_reminder_days` in status `qc` krijgt een markering.
- Bulkactie: selecteren en toewijzen aan een editor, of prioriteit wijzigen.

### 2. Opdrachtdetail
Drie kolommen op desktop, gestapeld op mobiel.

- **Links**: acco ID, verhuurexpert, datums, prioriteit, editor, statusknoppen.
- **Midden**: foto's per goal. Nummers toevoegen of verwijderen moet snel gaan.
  Invoerveld accepteert `12, 15, 18` in één keer en maakt daar losse `edit_items` van.
  Toon een waarschuwing boven `max_photos_per_property`, blokkeer niet.
- **Rechts**: contextuele richtlijnen. Toon automatisch de guidelines waarvan `goal_code`
  overeenkomt met een goal in deze opdracht, plus de algemene richtlijnen. Inklapbaar paneel,
  markdown gerenderd, geen popup.
- Bovenin een knop **Openen in Magnific**. Gebruikt `assignments.magnific_url` als die gevuld is,
  anders `app_settings.magnific_base_url`. Opent in een nieuw tabblad. Het veld `magnific_url`
  is inline bewerkbaar op het detailscherm.
- Tabblad **QC** met de reviewhistorie, zie hieronder.
- Veld `legacy_notes` alleen tonen wanneer het gevuld is, met het label "Notitie uit Excel"
  en duidelijk als alleen-lezen historie.

### 3. QC
Alleen coördinator en admin.

- Wachtrij van alles in status `qc`, oudste eerst.
- Reviewscherm: per foto een bevinding toevoegen met fotonummer, foutcategorie uit
  `qc_issue_types` en een vrije opmerking. Meerdere bevindingen per review.
- Afsluiten met **Goedkeuren** of **Afkeuren**. Bij afkeuren gaat de opdracht terug naar
  `in_process` en ziet de editor de bevindingen als afvinkbare lijst op het detailscherm.
- Rondes zijn zichtbaar naast elkaar: ronde 1, ronde 2, enzovoort. Het rondenummer zet de database.
- Een bevinding zonder categorie is niet toegestaan. Categorie `other` vereist een opmerking.

### 4. Richtlijnen
- Overzicht per categorie, markdown gerenderd, doorzoekbaar.
- Coördinator kan bewerken in een eenvoudige markdown-editor met voorbeeldweergave.
- Afbeeldingen uit Supabase Storage bucket `guidelines`, per richtlijn te labelen als goed of fout
  voorbeeld en naast elkaar te tonen.
- Elke richtlijn heeft een vaste URL zodat je er in Teams naar kunt linken.

### 5. Dashboard
Leest uitsluitend uit de views. Bevat minimaal:
- Aantallen per status, approval rate, gemiddelde doorlooptijd, totaal foto's.
- Prestaties per editor.
- Gebruik per editing goal.
- **Top QC-fouten** uit `v_qc_issue_frequency`, met doorklik naar de betreffende opdrachten.
  Dit is de belangrijkste grafiek van de app: wat hier bovenaan staat, hoort in de richtlijnen
  en in de standaardprompts.
- Volume per maand, aangevraagd naast afgerond.
- Exportknop naar CSV per view.

## Rechten

Rollen staan in `app_users.role`. RLS in de database is de bron van waarheid, de UI verbergt
alleen wat toch geweigerd zou worden. Bouw geen eigen autorisatielaag in de app.

| Rol | Mag |
| --- | --- |
| `admin` | alles, inclusief gebruikersbeheer |
| `coordinator` | alle opdrachten, QC beoordelen, richtlijnen bewerken |
| `editor` | eigen opdrachten bijwerken, bevindingen afvinken, alles lezen |
| `viewer` | alleen lezen |

## Regels

1. Geen ARES-integratie. Buiten scope.
2. Geen fotobestanden uploaden. De app beheert nummers en status, niet de beelden zelf.
3. Geen e-mail- of Teams-notificaties in versie 1.
4. Nederlands in de interface. Statuslabels blijven zoals in de tabel hierboven, want die
   kennen de editors uit Excel.
5. Werkt op tablet. De editors werken deels op een tweede scherm naast Magnific.
6. Elke schrijfactie via een server action met validatie in Zod. Geen directe inserts vanuit de client.
7. Optimistische UI bij statuswissel, met terugdraaien bij een fout.
8. Foutmeldingen in het Nederlands en concreet: "Fotonummer moet groter zijn dan 0", niet "Invalid input".

## Definition of done

- `npm run build` draait schoon, geen TypeScript-fouten, geen `any`.
- Een opdracht kan de volledige flow door: aanmaken, toewijzen, in bewerking, QC, afkeuren met
  bevindingen, opnieuw indienen, goedkeuren. `status_events` bevat dan zeven regels.
- Dashboardcijfers komen overeen met de views wanneer je die los in de SQL-editor draait.
- README beschrijft: lokaal draaien, omgevingsvariabelen, deploy naar Vercel, en wat te doen
  als een deploy faalt. Deze app moet zonder de oorspronkelijke bouwer te onderhouden zijn.

## Omgevingsvariabelen

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # alleen voor scripts, nooit importeren in app-code
```
