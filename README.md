# VfY Photo Editing App

Technisch fundament voor de interne fotobewerkingsapp van Villa for You. De app gebruikt
Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui en Supabase met `@supabase/ssr`.
Er zijn nog geen functionele schermen toegevoegd.

## Lokaal draaien

Vereisten: Node.js 20.9 of nieuwer en npm.

1. Installeer de pakketten met `npm install`.
2. Kopieer `.env.example` naar `.env.local` en vul de Supabase-waarden in.
3. Start de ontwikkelserver met `npm run dev`.

## Omgevingsvariabelen

- `NEXT_PUBLIC_SUPABASE_URL`: URL van het Supabase-project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publieke anon key voor browser en server.
- `SUPABASE_SERVICE_ROLE_KEY`: uitsluitend voor scripts. Importeer deze nooit in app-code.

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

## Deployen naar Vercel

Importeer de repository in Vercel, voeg de twee publieke Supabase-variabelen toe aan de
gewenste environments en deploy. Voeg de service-role key alleen toe wanneer een expliciet
deployscript die nodig heeft; app-code mag hem niet gebruiken.

## Als een deploy mislukt

1. Draai lokaal `npm run lint` en `npm run build`.
2. Controleer in Vercel of de publieke Supabase-variabelen bestaan voor de juiste omgeving.
3. Controleer of `lib/database.types.ts` opnieuw is gegenereerd na een schemawijziging.
4. Bekijk de eerste concrete fout in de Vercel-buildlog; latere fouten zijn vaak gevolgschade.
