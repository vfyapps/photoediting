# VfY Photo Editing App

Internal tool for Villa for You that replaces the file `VfY_FotoBewerking_Tracker.xlsx`.
Users: 3 to 5 AI photo editors, 1 coordinator, colleagues who read along. Single-language
interface, Dutch (see Rules section). Read this file on every task. Do not deviate from it
without explicitly flagging that you are doing so.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase: Postgres, Auth (magic link), Storage
- Hosting: Vercel
- No extra state library. Server components for reads, server actions for writes.
- `@supabase/ssr` for session management. Never use the service-role key in client code.

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
| `guidelines` | guidelines in markdown, optionally linked to a goal |
| `editing_goals`, `qc_issue_types` | reference data, extendable through the app |
| `app_settings` | includes `magnific_base_url`. Never hardcode URLs |

Read dashboard figures from the views (`v_assignments`, `v_dashboard_status`,
`v_editor_performance`, `v_goal_usage`, `v_qc_issue_frequency`, `v_cycle_time`,
`v_monthly_volume`, `v_monthly_completed`). Do not reimplement that logic in TypeScript.

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
- `date_completed` is set by the database. Do not write it from the app.

## Screens

### 1. Login
- Email-only login with a Supabase magic link.
- After opening the link, the user is signed in and redirected to the assignments overview.
- Every route except `/login` and the auth callback requires a valid session. Users without
  a valid session are always redirected to `/login`.

### 2. Assignments (home screen)
Two views on the same data, with a toggle: **board** (columns per status) and **table**.
Table is the default once there are more than 50 rows.

- Filters: status, editor, rental expert, priority, editing goal, search by acco ID.
- Filter state lives in the URL, so a filtered view is shareable.
- Backlog is hidden by default, with a separate toggle.
- Visible per row: acco ID, rental expert, photo count, goals as badges, priority, editor,
  days open.
- A row older than `qc_reminder_days` while in status `qc` gets a visual flag.
- Bulk action: select rows and assign to an editor, or change priority.

### 3. Assignment detail
Three columns on desktop, stacked on mobile.

- **Left**: acco ID, rental expert, dates, priority, editor, status buttons.
- **Middle**: photos per goal. Adding or removing numbers must be fast. The input field
  accepts `12, 15, 18` in one go and turns that into individual `edit_items` rows. Show a
  warning above `max_photos_per_property`, do not block.
- **Right**: contextual guidelines. Automatically show the guidelines whose `goal_code`
  matches a goal on this assignment, plus the general guidelines. Collapsible panel,
  markdown rendered, no popup.
- A button **Open in Magnific** at the top. Uses `assignments.magnific_url` if set,
  otherwise `app_settings.magnific_base_url`. Opens in a new tab. The `magnific_url` field
  is inline-editable on the detail screen.
- A **QC** tab with the review history, see below.
- Only show the `legacy_notes` field when it is populated, labeled "Notitie uit Excel"
  (Dutch UI label — see Rules), clearly marked as read-only history.

### 4. QC
Coordinator and admin only.

- Queue of everything in status `qc`, oldest first.
- Review screen: add a finding per photo with a photo number, an issue category from
  `qc_issue_types`, and a free-text comment. Multiple findings per review.
- Close with **Approve** or **Deny**. On deny, the assignment goes back to `in_process` and
  the editor sees the findings as a checkable list on the detail screen.
- Rounds are shown side by side: round 1, round 2, and so on. The round number is set by
  the database.
- A finding without a category is not allowed. Category `other` requires a comment.

### 5. Guidelines
- Overview by category, markdown rendered, searchable.
- Coordinator can edit in a simple markdown editor with live preview.
- Images from the Supabase Storage bucket `guidelines`, labelable per guideline as a good
  or bad example, shown side by side.
- Every guideline has a stable URL so it can be linked to from Teams.

### 6. Dashboard
Reads exclusively from the views. Must contain at minimum:
- Counts per status, approval rate, average cycle time, total photos.
- Performance per editor.
- Usage per editing goal.
- **Top QC issues** from `v_qc_issue_frequency`, with click-through to the affected
  assignments. This is the most important chart in the app: whatever sits at the top here
  belongs in the guidelines and in the standard prompts.
- Monthly volume, requested versus completed.
- CSV export button per view.

## Permissions

Roles live in `app_users.role`. RLS in the database is the source of truth; the UI only
hides what would be denied anyway. Do not build a separate authorization layer in the app.

| Role | Allowed to |
| --- | --- |
| `admin` | everything, including user management |
| `coordinator` | all assignments, review QC, edit guidelines |
| `editor` | update own assignments, check off findings, read everything |
| `viewer` | read-only |

## Rules

1. No ARES integration. Out of scope.
2. No photo file uploads. The app manages numbers and status, not the images themselves.
3. No email or Teams notifications in version 1.
4. Interface language is Dutch. Status labels stay exactly as in the table above, because
   that is what the editors already know from Excel.
5. Must work on tablet. Editors often work on a second screen next to Magnific.
6. Every write goes through a server action with Zod validation. No direct inserts from
   the client.
7. Optimistic UI on status changes, with rollback on error.
8. Error messages in Dutch and concrete: "Fotonummer moet groter zijn dan 0", not
   "Invalid input".

## Definition of done

- `npm run build` runs clean, no TypeScript errors, no `any`.
- An assignment can go through the full flow: create, assign, in progress, QC, deny with
  findings, resubmit, approve. `status_events` then contains seven rows.
- Dashboard figures match the views when run standalone in the SQL editor.
- README describes: running locally, environment variables, deploying to Vercel, and what
  to do if a deploy fails. This app must be maintainable without its original builder.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # scripts only, never import into app code
```
