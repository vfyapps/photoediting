# VfY Photo Editing App

Interne fotobewerkingsapp van Villa for You, ter vervanging van de Excel-tracker. De app
gebruikt Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui en Supabase met
`@supabase/ssr`. Vijf schermen: Opdrachten (bord + tabel, de default), Opdrachtdetail,
QC (toetsenbord-eerst triage), Dashboard en Academy (leermateriaal + de QC-feedbackloop).
Zie `AGENTS.md` voor de functionele spec per scherm en `BUILDPLAN.md` voor de
uitvoeringsgeschiedenis per werkpakket.

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
- `SUPABASE_SERVICE_ROLE_KEY`: uitsluitend voor scripts. Importeer deze nooit in app-code.

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

Importeer de repository in Vercel, voeg de twee publieke Supabase-variabelen toe aan de
gewenste environments en deploy. Voeg de service-role key alleen toe wanneer een expliciet
deployscript die nodig heeft; app-code mag hem niet gebruiken.

## Als een deploy mislukt

1. Draai lokaal `npm run lint` en `npm run build`.
2. Controleer in Vercel of de publieke Supabase-variabelen bestaan voor de juiste omgeving.
3. Controleer of `lib/database.types.ts` opnieuw is gegenereerd na een schemawijziging.
4. Bekijk de eerste concrete fout in de Vercel-buildlog; latere fouten zijn vaak gevolgschade.
