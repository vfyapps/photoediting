# VfY Photo Editing App

Interne fotobewerkingsapp van Villa for You, ter vervanging van de Excel-tracker. De app
gebruikt Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui en Supabase met
`@supabase/ssr`. Zes schermen: Opdrachten (bord + tabel, de default), Opdrachtdetail,
QC (toetsenbord-eerst triage), Dashboard, Academy (leermateriaal + de QC-feedbackloop)
en Beheer (accounts, editors/verhuurexperts, instellingen, referentiedata —
coordinator/admin). Zie `AGENTS.md` voor de functionele spec per scherm, `BUILDPLAN.md`
voor WP0–WP6 en `BUILDPLAN-V3.md` voor de uitvoeringsgeschiedenis daarna.

## Lokaal draaien

Vereisten: Node.js 20.9 of nieuwer en npm.

1. Installeer de pakketten met `npm install`.
2. Kopieer `.env.example` naar `.env.local` en vul de Supabase-waarden in.
3. Start de ontwikkelserver met `npm run dev`.

> **Let op (bekende sandbox-eigenaardigheid):** in sommige containerized dev-omgevingen
> hangt `next dev` (Turbopack) met oplopend geheugengebruik. Werkt `npm run dev` niet
> soepel, gebruik dan `npm run build && npm run start` (production-server) om te
> verifiëren — dat pad is stabiel gebleken. Op een gewone lokale machine (zoals bij het
> bouwen van deze app is getest) draait `npm run dev` gewoon goed.

## Omgevingsvariabelen

- `NEXT_PUBLIC_SUPABASE_URL`: URL van het Supabase-project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publieke anon key voor browser en server.
- `SUPABASE_SERVICE_ROLE_KEY`: uitsluitend nodig voor het Beheer-scherm (gebruikers
  uitnodigen/activeren, `/beheer/gebruikers`) en losse scripts. Eén bestand in de
  app-code mag deze importeren: `lib/supabase/admin.ts` — nergens anders (zie
  AGENTS.md-changelog, amendement V3-WP2). Ontbreekt de key, dan blijft de rest van
  de app gewoon werken; alleen accountbeheer toont een nette melding in plaats van
  te crashen.

## Magic-link-inlog instellen

Voeg in Supabase onder **Authentication → URL Configuration** de callback-URL toe aan de
redirect-allowlist:

- lokaal: `http://localhost:3000/auth/callback`
- productie: `https://<vercel-domein>/auth/callback`

Stel de productie-URL ook in als Site URL. De standaard magic-link-template moet de
`ConfirmationURL` gebruiken. Alleen bestaande Supabase-gebruikers kunnen inloggen; de app
maakt via het inlogformulier geen nieuwe accounts aan.

## Databasetypes genereren

`db/01_schema.sql` is de gezaghebbende bron voor het schema. Koppel de Supabase CLI eerst
met `npx supabase login` en `npx supabase link --project-ref <project-ref>`. Genereer daarna
de types met:

```bash
npm run types:generate
```

Voor een draaiende lokale Supabase-stack kan dit ook met:

```bash
npm run types:generate:local
```

Beide scripts vervangen `lib/database.types.ts` alleen wanneer de CLI-opdracht slaagt.

## Testen

- `npm test` — Vitest, unit tests voor `lib/workflow.ts`, `lib/validation.ts` en
  `lib/assignments.ts`. Geen database nodig.
- `npm run test:e2e` — Playwright, de volledige opdrachtdoorloop
  (`e2e/assignment-journey.spec.ts`) en de inlogflow. Vereist een draaiende lokale
  Supabase-stack: `npm run db:start` (Docker) en daarna `npm run db:reset` om de
  seeds uit `supabase/seeds/` te laden.
- RLS-isolatietest in `tests/rls/editor-isolation.test.ts` — controleert dat een
  editor alleen eigen/gepubliceerde rijen ziet. Draait ook tegen `npm run db:start`.
- `npm run lint` en `npm run build` — altijd vóór een deploy, zie hieronder.

Beide `db:*`-scripts en de e2e/RLS-tests hebben Docker nodig (voor de lokale
Supabase-stack) en zijn dus niet overal te draaien — bijvoorbeeld niet in een
CLI-only sandbox zonder Docker. Draai ze op een machine met Docker vóór een release.

## Deployen naar Vercel

Importeer de repository in Vercel, voeg de twee publieke Supabase-variabelen toe aan alle
gewenste environments en deploy.

### De service-role key: alleen op Production

`SUPABASE_SERVICE_ROLE_KEY` omzeilt alle RLS. Vercel zet environment variables
standaard op *alle* omgevingen — dat wil je hier expliciet niet, want dan krijgt
elke preview-deploy van elke branch (ook een niet-gereviewde) volledige
adminrechten op de productiedatabase, op een openbaar raadbare `*.vercel.app`-URL.

1. Zet de key in Vercel **uitsluitend op Production**, niet op Preview of
   Development (`Settings → Environment Variables`, environment-vinkjes).
2. Zonder de key blijft de rest van de app werken; alleen `/beheer/gebruikers` toont
   dan "accountbeheer is hier niet beschikbaar" in plaats van te crashen — dat is
   opzettelijk, geen bug.
3. Zet **Deployment Protection** aan voor preview-deploys
   (`Settings → Deployment Protection`), zodat preview-URL's sowieso niet publiek
   benaderbaar zijn — een extra laag, los van punt 1.
4. Roteren: genereer een nieuwe service-role key in Supabase
   (`Project Settings → API`), werk hem bij in Vercel (Production), en redeploy.
   De oude key blijft geldig totdat je hem in Supabase intrekt.
5. Zie AGENTS.md-changelog (amendement V3-WP2) en `lib/supabase/admin.ts` voor de
   volledige onderbouwing van deze uitzondering op de "scripts only"-regel.

## Als een deploy mislukt

1. Draai lokaal `npm run lint` en `npm run build`.
2. Controleer in Vercel of de publieke Supabase-variabelen bestaan voor de juiste omgeving.
3. Controleer of `lib/database.types.ts` opnieuw is gegenereerd na een schemawijziging.
4. Bekijk de eerste concrete fout in de Vercel-buildlog; latere fouten zijn vaak gevolgschade.
