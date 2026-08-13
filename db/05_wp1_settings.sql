-- =============================================================================
-- VfY AI Photo Editing App - WP1: drempel voor de QC-callout
-- Het opdrachtenscherm toont een callout zodra een QC-fout deze drempel
-- kruist (AGENTS.md, Screen 2: "Threshold lives in app_settings, not in
-- code."). Idempotent: twee keer draaien is veilig.
-- =============================================================================

insert into app_settings (key, value, description)
values (
  'qc_issue_callout_threshold',
  '3',
  'Vanaf hoeveel QC-bevindingen van hetzelfde type de attentiestrook op het opdrachtenscherm een callout toont.'
)
on conflict (key) do nothing;
