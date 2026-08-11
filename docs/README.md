# Source material

Frozen reference material for the app. These are inputs, not living documents. When
something here contradicts `../AGENTS.md`, the spec wins.

| File | What it is | Status |
|---|---|---|
| `VfY_FotoBewerking_Tracker.xlsx` | The Excel tracker this app replaces. Copy taken 2026-08-11 | Still the live system until fase 3 |
| `Tutorial_Magnific.docx` | The current editor handbook, 8 sections | **Out of date.** Describes columns `Photo no.` and `Editing goal` that the tracker no longer has. Source for the `onboarding` academy track, to be rewritten rather than pasted |
| `concept-mockup.html` | Static "VfY Foto Ops + Academy" concept, on the correct VfY tokens | Layout reference for the tracker and academy screens. Two things in it are deliberately **not** built: per-photo status (the unit of work is the property) and the editor leaderboard (moved to the Dashboard). It also names Nano Banana, which is stale |
| `migratie_log.txt` | Output of `migrate_xlsx.py` | 5 open warnings where Excel read a cell like `46.51` as a number. Resolve manually before fase 3 |

The original of `concept-mockup.html` lives in
`Tools and scripts/ai-photo-editing/` and can be removed once this copy is committed.
