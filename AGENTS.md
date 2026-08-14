# VfY Photo Editing App

Internal tool for Villa for You that replaces the file `VfY_FotoBewerking_Tracker.xlsx`.
Users: 3 to 5 AI photo editors, 1 coordinator, colleagues who read along. Single-language
interface, Dutch (see Rules section). Read this file on every task. Do not deviate from it
without explicitly flagging that you are doing so.

**Version:** 2.0
**Last updated:** 2026-08-11
**Owner:** Wouter Man in 't Veld

This file is the single authoritative build spec. The copy in the `AI MDs` repo
(`projects/photo-editing/photo-editing.md`) is a pointer to this file, not a second source.

## Where things live

This repo sits in `Support projects/07 Tools and Code/Tools and scripts/photoediting`.
Paths below are relative to that, so `../../AI MDs/` is the agent-context repo
(`github.com/vfyapps/vfy-agent-context`) two levels up.

| Path | What it is |
|---|---|
| `../../AI MDs/vfy-context.md` | company-wide context |
| `../../AI MDs/projects/photo-editing/app-voorbereiding.md` | the reasoning behind the decisions here. Read once before starting |
| `../../AI MDs/skills/vfy-app-design/` | binding design system, including `starter/` |
| `../toeristenbelasting-scraper/review-app` | the starter applied in a real VfY project |
| `docs/` | source material: the Excel tracker, the old tutorial, the concept mockup, the migration log |

From `vfy-context.md`, applicable here: the acco-id convention (§3) and the writing
conventions (§6). **Not** applicable: the je/u form rule in §5, since this is an internal
work tool with no guest or homeowner contact.

## Skills this project expects

| Skill | Use it for | Where it comes from |
|---|---|---|
| `vfy-app-design` | every screen. Binding, see Design direction | `../../AI MDs/skills/` |
| `supabase-postgres-best-practices` | every change to `db/`: RLS policies, indexes, query shape. Not optional on the RLS work — there are 20+ policies and a wrong one fails silently | see below |
| `supabase` | `@supabase/ssr`, auth, session handling | see below |
| `dataviz` | the dashboard charts. `vfy-app-design` covers tokens and components, not axes, legends or colour within a chart | bundled with Claude |

The Supabase skills are installed globally, not vendored into the context repo, because
they are externally maintained and we do not adapt them. Installed as a checkout plus
junctions, mirroring how `vfy-app-design` is wired up:

```
~/.claude/skills-external/supabase-agent-skills   git clone (MIT)
~/.claude/skills/supabase                         junction
~/.claude/skills/supabase-postgres-best-practices junction
```

Update with `git -C ~/.claude/skills-external/supabase-agent-skills pull`. If the skills
are missing on a given machine, redo those three steps; the `claude plugin` route works
too where the CLI is on PATH.

---

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4 + React 19
- Supabase: Postgres, Auth (magic link + password), Storage (guideline images only)
- Hosting: Vercel
- No extra state library. Server components for reads, server actions for writes.
- `@supabase/ssr` for session management. Never use the service-role key in client code.
- **Charts:** Recharts. See the Dashboard section.
- **Tests:** Vitest + Playwright. See Definition of done.

## Design direction

`../../AI MDs/skills/vfy-app-design/SKILL.md` is binding and takes precedence over
everything in this section. Copy its `starter/` into the project (tokens, fonts, and the
twelve `components/ui/` files) and build from those. The two hand-written components
currently in `components/ui/` (`button.tsx`, `badge.tsx`) get replaced by the starter
versions, not merged with them.

Three references worth reading before building a screen:
- `../../AI MDs/skills/vfy-app-design/starter/README.md` for the known gotchas.
- `../toeristenbelasting-scraper/review-app` for how the starter is applied in a real VfY
  project. First place to look, ahead of any external template.
- `docs/concept-mockup.html` for the intended screen layout of both the tracker and the
  academy. It already uses the correct tokens. See `docs/README.md` for the two things in
  it that are deliberately not built.

**What this section adds on top of the skill**, none of which conflicts with it:

This is an operational workflow tracker with a review step, not a consumer app or a
marketing dashboard. Think issue tracker, not landing page: an assignment is a ticket,
`status` is the workflow, QC is the review gate.

**Composition reference: Linear.** Match its density and restraint:
- Compact row height. Editors scan 40 rows, they do not admire 6 cards.
- Hairline borders rather than drop shadows to separate rows and sections.
- Keyboard shortcuts are a first-class feature on the QC screen, not an afterthought.

**Composition reference for the Academy only: a calm document.** Generous line height,
readable long-form markdown next to compact metadata. Not a dashboard.

**Color comes from the token set, with no exceptions.** Status and priority both use
semantic tokens (`success` / `warning` / `info` / `destructive` / neutral). Priority must
stay visually distinguishable from status at a glance: status renders as a solid `Chip`,
priority as a soft `Badge` with a dot. Do not introduce a hue that is not in
`globals.css` — earlier drafts of this file specified a raw hex accent and a violet
`in_process`, and both violate the skill. If a screen genuinely needs a colour that is not
there, that is a deliberate change to `starter/globals.css`, not an inline value.

---

## Database

The schema lives in `db/01_schema.sql` and is authoritative. Do not invent extra tables or
columns. Generate types with `supabase gen types typescript` into `lib/database.types.ts`
and use those everywhere.

Core tables:

| Table | Meaning |
| --- | --- |
| `assignments` | one assignment = one property in one round. The same `acco_id` may recur |
| `edit_items` | one row per photo per editing goal. Replaces the comma-separated strings from Excel |
| `status_events` | filled automatically by a trigger, never write to it manually |
| `qc_reviews` / `qc_findings` | a QC round with findings per photo |
| `guidelines` | the academy content store, see the Academy section |
| `guideline_examples` | good/bad example images per guideline |
| `editing_goals`, `qc_issue_types` | reference data, extendable through the app |
| `app_settings` | includes `magnific_base_url`. Never hardcode URLs |

Read dashboard figures from the views (`v_assignments`, `v_dashboard_status`,
`v_editor_performance`, `v_goal_usage`, `v_qc_issue_frequency`, `v_cycle_time`,
`v_monthly_volume`, `v_monthly_completed`). Do not reimplement that logic in TypeScript.

### Schema changes required for v2

These are the only schema changes sanctioned by this spec. Write them as
`db/04_v2_academy.sql`; do not edit `01_schema.sql` in place, since it has already been
applied and seeded.

**1. Per-photo completion on `edit_items`.** Editors need to tick photos off while working.
Status itself stays on `assignments` — see Status flow.

```
alter table edit_items
  add column done    boolean not null default false,
  add column done_at timestamptz;
```

**2. Academy fields on `guidelines`.** The academy is an expansion of `guidelines`, not a
parallel table. Reuse it rather than duplicating slug/title/category/body_md/goal_code/
sort_order/is_published, which already exist.

```
create type guideline_track  as enum ('onboarding', 'goal', 'tips');
create type guideline_origin as enum ('manual', 'qc_suggested');

alter table guidelines
  add column track          guideline_track  not null default 'tips',
  add column origin         guideline_origin not null default 'manual',
  add column qc_issue_code  text references qc_issue_types(code) on delete set null;
```

**3. Prompt library.** One goal can carry several prompts, so this is its own table.

```
create table academy_prompts (
  id           uuid primary key default gen_random_uuid(),
  goal_code    text references editing_goals(code) on delete cascade,
  title        text not null,
  prompt_text  text not null,
  notes_md     text,
  sort_order   int not null default 0,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references app_users(id) on delete set null
);
```

**4. Read progress.** One row per editor per module. Nothing more — no XP table, no scores.

```
create table academy_reads (
  user_id      uuid not null references app_users(id) on delete cascade,
  guideline_id uuid not null references guidelines(id) on delete cascade,
  read_at      timestamptz not null default now(),
  primary key (user_id, guideline_id)
);
```

**5. RLS: editors must not see each other's figures.** The current policies
`read_all_app_users` and `read_all_assignments` are `using (true)` for every authenticated
user, so an editor can query a colleague's numbers even when the UI hides them. Hiding it
in the interface is not enough. Restrict `v_editor_performance` and the per-editor columns
to `coordinator` and `admin`. An editor may read their own row and the anonymous team
average, nothing else. See the Academy section for why.

---

## Status flow

```
backlog → new → in_process → qc → approved
                    ↑          ↓
                    └──────  denied
                               → ai_rejected (end state, edit not feasible)
```

- `backlog` = candidate property from the shortlist, not yet an assignment. Excluded from KPIs.
- Editor may set: `in_process`, `qc`.
- Coordinator may set anything. Only the coordinator sets `approved`, `denied`, and `ai_rejected`.
- `denied` without at least one QC finding is not allowed. Block this in the UI.
- **An assignment may only move to `qc` once every `edit_items` row has `done = true`.**
  Block this in the UI the same way, with a concrete message naming how many photos are
  still open.
- `date_completed` is set by the database. Do not write it from the app.

The unit of work is the property, not the photo. `edit_items.done` is a checkbox, not a
second status machine: no trigger, no `status_events` rows, no effect on any view.

---

## Screens

### 1. Login
- Email-only login with a Supabase magic link.
- Temporary email-and-password login for admin testing, alongside the magic-link flow.
- After opening the link, the user is signed in and redirected to the assignments overview.
- Every route except `/login` and the auth callback requires a valid session. Users without
  a valid session are always redirected to `/login`.

### 2. Assignments (home screen)
The primary daily workspace, not an archive browser. Optimize for "what needs my attention
right now", not for showing every row that has ever existed.

**Default scope:** only open work — statuses `new`, `in_process`, `qc`, `denied`. Completed
and closed work (`approved`, `ai_rejected`) sits behind an "Archief" toggle, off by
default. `backlog` keeps its own toggle, also off by default. This matters more than it
looks: Excel had no way to hide finished rows, so everyone scrolled past 126 completed rows
to find the 4 that needed action.

**Default view:** board (columns per status). The board makes workload visible at a glance,
which a table cannot do without counting. Table stays available as a toggle and becomes the
better choice once a filter narrows the set below roughly 50 rows. The table gets
virtualized with `@tanstack/react-virtual` — 352 assignments is past the threshold in the
design skill.

**Grouping switch:** group by **status** (default) or by **editor**. Status grouping answers
"where is work stuck", editor grouping answers "what does each person have open".

**Row content, compact rather than column-heavy:**
- Primary line: acco ID, rental expert.
- Subline (smaller, muted): photo count and goals together, e.g. "12 foto's · Sfeer,
  Belichting" rather than separate columns for each.
- Progress as "7 van 11 af" once any `edit_items` row is done. This replaces the
  "4 statussen" idea from the mockup.
- Status and priority as badges (see Design direction).
- Editor as a small initials circle plus name.
- Days open, right-aligned. A row past `qc_reminder_days` while in `qc` gets a subtle
  background tint, not just a different text colour.

**Expandable photo rows.** A row expands to show its `edit_items`: photo number, goal, the
instruction, and a checkbox for `done`. Ticking a box is a single server action, optimistic.

**QC callout in the table.** When an issue type from `v_qc_issue_frequency` crosses a
threshold, show an inline callout in the list: "Witte rand aan de bovenkant, komt dit
seizoen in 9 QC-notities voor", with a link to the academy module carrying that
`qc_issue_code`. This is the feedback loop the whole app exists for. Threshold lives in
`app_settings`, not in code.

**Filters:** status, editor, rental expert, priority, editing goal, search by acco ID.
Filter state lives in the URL. Above them, one-click quick filters: "Mijn opdrachten",
"Hoge prioriteit", and "Langer dan qc_reminder_days in QC". Quick filters set the same
filter state, they are not a separate mechanism.

**Bulk action:** select rows and assign to an editor, or change priority.

### 3. Assignment detail
Three columns on desktop, stacked on mobile.

- **Left**: acco ID, rental expert, dates, priority, editor, status buttons.
- **Middle**: photos per goal with their `done` checkboxes. Adding or removing numbers must
  be fast: the input accepts `12, 15, 18` in one go and turns that into individual
  `edit_items`. Warn above `max_photos_per_property`, do not block.
- **Right**: contextual academy modules. Automatically show modules whose `goal_code`
  matches a goal on this assignment, plus the general ones, plus the prompts for those
  goals in a copyable block. Collapsible panel, markdown rendered, no popup.
- A button **Openen in Magnific** at the top. Uses `assignments.magnific_url` if set,
  otherwise `app_settings.magnific_base_url`. Opens in a new tab, inline-editable here.
- A **QC** tab with the review history.
- Show `legacy_notes` only when populated, labeled "Notitie uit Excel", clearly read-only.
- **Before submitting to QC**, show the self-check list for the goals on this assignment
  (see Academy). The editor ticks it off in the submit dialog. Not persisted in v1: it is a
  prompt to look again, not an audit trail.

### 4. QC
Coordinator and admin only.

- Queue of everything in status `qc`, oldest first.
- Review screen: add a finding per photo with photo number, an issue category from
  `qc_issue_types`, and a free-text comment. Multiple findings per review.
- Close with **Goedkeuren** or **Afkeuren**. On deny, the assignment returns to
  `in_process` and the editor sees the findings as a checkable list on the detail screen.
- Rounds shown side by side: round 1, round 2, and so on. The round number is set by the
  database.
- A finding without a category is not allowed. Category `other` requires a comment.
- Keyboard shortcuts to move through the queue: `j`/`k` or arrow keys for next/previous, a
  shortcut to approve, and one to open the deny form. Show the shortcuts as a small hint.
- Rejecting is a normal workflow action here, not a destructive one. No confirmation
  dialog — see the design skill on why gating a triage queue fights its purpose.

### 5. Academy
Replaces the Guidelines screen. Two audiences in one place: a new editor learning the
process end to end, and an experienced editor looking something up.

**Three tracks**, from `guidelines.track`:

| Track | What it holds | Ordering |
| --- | --- | --- |
| `onboarding` | the process from 1 to 100: what Magnific is, downloading from ARES, editing, upscaling to 2048 × 1536, uploading back, setting status | strict, by `sort_order` |
| `goal` | one module per editing goal: approach, pitfalls, good and bad example, common mistake | by goal |
| `tips` | what the coordinator shares in passing | newest first |

**Per module:** markdown body, good/bad examples side by side from `guideline_examples`,
and a stable URL so it can be pasted into Teams. Mark as read (`academy_reads`) at the
bottom.

**Prompt library.** Per editing goal, the prompts from `academy_prompts`, each with a copy
button. This replaces the external ChatGPT prompt generator in step 5.2 of the old tutorial,
which is currently the only part of the quality chain that lives nowhere.

**Self-check list.** Static per goal, rendered on the module and again in the QC submit
dialog on the detail screen (see Screen 3). Sourced from the quality requirements: landscape,
at least 2048 × 1536, no people or number plates, no watermark, well lit, natural colours,
no elements added that are not in the original, no AI artefacts along the edges.

**Auto-suggested modules.** When an issue type crosses the threshold in
`v_qc_issue_frequency` and no published module carries that `qc_issue_code`, the app creates
a draft in `guidelines` with `origin = 'qc_suggested'`, `is_published = false`, a title
derived from the issue label, and links to the assignments it came from. The coordinator
writes and publishes it. The app never publishes on its own. Without this the academy only
grows when someone makes time for it, and that does not happen.

**Progress, and what it deliberately does not do.** An editor sees only their own figures:
modules read, own approval rate, own cycle time, optionally against their own previous
month. No colleague names, no ranking, no XP, no leaderboard. If a comparison figure is
shown at all it is the anonymous team average. The mockup's leaderboard moves to the
Dashboard, which is coordinator and admin only. This is enforced in RLS, not just in the
UI — see schema change 5.

**Editing.** Coordinator and admin edit in a plain markdown editor with live preview. Do not
add a block editor: markdown stays readable and portable, block-editor JSON does not.

### 6. Dashboard
Coordinator and admin only. Reads exclusively from the views.

Charts use **Recharts**. Invoke the `dataviz` skill before writing the first chart:
`vfy-app-design` covers tokens and components but says nothing about axes, legends, or
colour within a chart, and this screen is chart-heavy.

Contains at minimum:
- Counts per status, approval rate, average cycle time, total photos. One primary number
  with the rest subordinate, not six equally loud blocks — that is what the Excel dashboard
  got wrong.
- **Top QC issues** from `v_qc_issue_frequency`, with click-through to the affected
  assignments. The most important chart in the app: whatever sits at the top belongs in the
  academy and in the standard prompts.
- Performance per editor, including the comparison the editors themselves do not see.
- Usage per editing goal.
- Monthly volume, requested versus completed.
- CSV export per view.

---

## Permissions

Roles live in `app_users.role`. RLS in the database is the source of truth; the UI only
hides what would be denied anyway. Do not build a separate authorization layer in the app.

| Role | Allowed to |
| --- | --- |
| `admin` | everything, including user management |
| `coordinator` | all assignments, review QC, edit academy content, see the dashboard |
| `editor` | update own assignments, tick photos off, check off findings, read the academy, see own figures only |
| `viewer` | read-only, no per-editor figures |

---

## Rules

1. No ARES integration. Out of scope.
2. **No photo files in the app, ever.** No uploads, no Supabase Storage for working files,
   no Magnific API. The app manages acco-ids, photo numbers, status, and QC findings. The
   images stay in ARES and on the editor's laptop. This is a permanent principle, not a v1
   boundary, and it is not up for reopening. The only exception already in the schema is
   `guideline_examples`, which holds a handful of teaching images, not working files.
3. Editing happens in **Magnific**. Not Nano Banana — that link in the old tracker and the
   reference in the mockup are stale and go. Academy content documents Magnific only.
4. No email or Teams notifications in version 1.
5. Interface language is Dutch. Status labels stay exactly as in the table above, because
   that is what the editors already know from Excel.
6. Must work on tablet. Editors often work on a second screen next to Magnific.
7. Every write goes through a server action with Zod validation. No direct inserts from the
   client.
8. Optimistic UI on status changes and on ticking a photo off, with rollback on error.
9. Error messages in Dutch and concrete: "Fotonummer moet groter zijn dan 0", not
   "Invalid input".

---

## Definition of done

- `npm run build` runs clean, no TypeScript errors, no `any`.
- **Vitest** covers the server actions and the Zod schemas, including the two rules that are
  easy to regress: `denied` without a finding, and `qc` with photos still open.
- **Playwright** covers one end-to-end path against a locally seeded Supabase (`supabase` is
  already a devDependency, so `supabase start` gives a disposable database): create, assign,
  in progress, tick all photos, QC, deny with findings, resubmit, approve. `status_events`
  then contains seven rows. This is the test the old spec asked for but had no runner for.
- An RLS test confirms an `editor` session cannot read another editor's figures. Write it
  before the dashboard, not after.
- Every screen has been through the visual verification loop in `vfy-app-design` §4,
  including empty, loading, and error states actually triggered and looked at, at 375px,
  768px, and 1280px, in both light and dark.
- Dashboard figures match the views when run standalone in the SQL editor.
- README describes: running locally, environment variables, deploying to Vercel, and what to
  do if a deploy fails. This app must be maintainable without its original builder.

---

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # see the amendment below (V3-WP2) - one exception, everywhere else still scripts-only
```

---

## Changelog

| Date | Change |
|---|---|
| 2026-07-30 | v1.0. Header referencing vfy-context.md (acco-id applies, language/tone rule does not). |
| 2026-08-07 | Translated to English. Rule on Dutch interface and the literal UI strings stay Dutch. |
| 2026-08-11 | v2.0. Merged the three diverging copies into this one file. Added the Academy (screen 5, replacing Guidelines), the required v2 schema changes, the charts and testing decisions, and the permanent no-photo-files rule. Rewrote Design direction to defer to `vfy-app-design`: the raw hex accent and the violet `in_process` both violated it and are gone. |
| 2026-08-13 | WP0–WP6 built per `BUILDPLAN.md`, whose §3 sanctioned five deviations from `vfy-app-design` (owner's explicit call — end result over strict compliance): an avatar palette (6–8 muted hues, one per editor, derived with the `dataviz` skill's color method) so the board shows at a glance who has what; a chart palette (`--chart-1`…`--chart-8`) for the dashboard, validated both themes; progress-bar and QC-overdue-attention tint tokens; one signature element per screen allowed outside the standard composition patterns (attention strip, QC callout, dashboard hero number) as long as color/type still come from tokens; and slightly roomier motion for micro-feedback (progress fill, board card drop, palette open), always within the existing duration tokens and with `prefers-reduced-motion` respected — enforced globally in `app/globals.css` since WP6. Still not sanctioned: hex outside `globals.css`, a second accent color, fonts outside Sen/Noto/Plex Mono, shadows outside the scale. |
| 2026-08-13 | **Amendment to the Environment variables rule (V3-WP2), owner-approved (`BUILDPLAN-V3.md` beslispunt C / §5):** `SUPABASE_SERVICE_ROLE_KEY` may be imported in exactly one file, `lib/supabase/admin.ts` (`import "server-only"`), used only by role-gated server actions under `app/(app)/beheer/` — account invitation and activation need the Auth Admin API, which the anon key can't reach. Every other file stays scripts-only as before. Six Vercel-specific safeguards apply once this ships (env var scoped to Production only, never `NEXT_PUBLIC_`, Node runtime not edge, the role check runs before the admin client is constructed, Preview deployment protection on, rotation documented in the README) — full rationale in `BUILDPLAN-V3.md` §5. Rule 4 ("no email or Teams notifications in v1") still stands for app-level notifications; the invite email is a transactional Supabase Auth email, the same mechanism the existing magic-link login already uses, not a new notification feature. |
| 2026-08-13 | **Hotfix, found by the owner testing V3-WP2 live:** every write on every screen failed with a permission error, including for the admin account. Root cause was in `db/01_schema.sql` since v1, not in RLS or in this session's work — Postgres checks table-level grants *before* row-level security, and the base schema never granted `INSERT`/`UPDATE`/`DELETE` on any of its tables to the `authenticated` role (only `SELECT`). It went unnoticed this long because `db/03_seed_data.sql` runs as the schema owner, which bypasses grants entirely, and because the two tables added in the v2 migration (`academy_prompts`, `academy_reads`) happened to get explicit grants and so always worked. Fixed in `db/07_hotfix_table_grants.sql`, applied live; verified both that the previously-failing write now succeeds and that the underlying RLS policies (unchanged, always correct) still block a session with no `app_users` role. `status_events` intentionally still has no grant — it's written only by the `security definer` trigger, never directly, per the existing rule against hand-writing it. |
| 2026-08-14 | **Amendment to rule 1 and scope, owner-requested (V3-WP6, `BUILDPLAN-V3.md`):** added screen 7, Kaart (`/kaart`, coordinator/admin) — a shootplanner showing open Ares shoots and photographer locations on a proportional-symbol map of West/Central Europe, so the coordinator can see which shoots a photographer can combine by distance. This is a deliberate widening from AI editing into photography planning, because the gap sits in Ares and the owner asked for it directly. Rule 1 ("no ARES integration") still holds in spirit: nothing talks to Ares live: shoot data rides the same monthly xlsx import as the summer→winter feature (extended so every row is now kept, not only the candidates — table `ares_shoots`), and photographer locations are entered by hand (table `photographers`, beheer tab). Geocoding is a committed lookup table generated once from GeoNames (`lib/postcode-coords.json`, `scripts/generate-postcode-coords.mjs`) and country outlines are a committed simplified GeoJSON (`lib/europe-countries.json`, `scripts/generate-europe-countries.mjs`) — no runtime API, no key, no network dependency in production, consistent with the no-photo-files spirit of rule 2 (don't reach out to third parties for things that can be resolved once and committed). Distances are haversine (`lib/geo.ts`), always labelled "hemelsbreed" — not routing, by design: the coordinator has the geography in view and can judge road distance herself, and a routing API would add cost and a rate limit for marginal benefit. Assigning a shoot to a photographer still happens in Ares; the map only informs that decision. |
