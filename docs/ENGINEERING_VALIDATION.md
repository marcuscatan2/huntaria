# AI-maintainability foundation — validation

Validated locally on 2026-09-11. This is engineering infrastructure, not a new
gameplay pass or commercial feature acceptance.

## Delivered

- README is the short AI entry point; previous play instructions were preserved
  in PLAYER_GUIDE. FEATURE_MAP is generated from docs/architecture.json plus
  observed source references.
- Seventeen ownership areas route all55 root runtime inputs (40 JS,14 CSS and
  index.html), shared interfaces, connectors, asset locations and all66 existing
  commercial acceptance cards. Two retired JS files are explicitly unloaded.
- project.py provides doctor, map generation, impact routing, structural checks,
  the full validation runner and non-overwriting CRC/SHA-256-verified ZIP backups.
- AGENTS requires fact-based updates in the same change. Documentation checks
  reject missing/duplicate ownership, selected forbidden dependencies, stale maps,
  broken local links and missing commercial feature routes.
- Test setup prefers a pinned environment; existing temporary tools remain a
  fallback. Chrome/Edge discovery supports explicit paths and Linux CI Chromium.
  Git ignore/attributes, optional pre-commit guard and GitHub Actions are prepared.

## Executed evidence

| Suite | Chrome | Edge |
| --- | --- | --- |
| Current mechanics/regressions (pass18_check) | 2067 /2067 | 2067 /2067 |
| Played UI (pass18_ui) | 29 /29 | 29 /29 |
| Campaign/receipts (pass18_campaign) | 33 /33 | 33 /33 |
| New architecture/browser boundary tests | 14 /14 | 14 /14 |

Both complete browser gates passed. The final boundary test was also rerun in
Chrome after adding a20-second worker timeout.18 standard-library mutation tests
for the tooling and30 planning-integrity checks passed. The reviewed100-species
JSON and four generated tables agree with the current source-hashed export.

The new browser test checks ordered global boot, sandbox keys, retired capture,
existing content/atlas/presentation contracts, worker/browser deterministic
agreement, rendering without simulation mutation at1440/390px, reduced motion,
repeat screen transitions and missing/error responses. It creates no normal save.

Mutation tests deliberately introduce missing/duplicate owners, bad boot order,
unknown globals, DOM/RNG/view access in pure code, unauthorized UI storage,
stale/broken documents, absent feature/connection routes and failed child
processes. Backup tests check unique archives and excluded secrets/generated data.

Reports are regenerated in tests/artifacts/architecture-*, pass18-* and the
existing scope report. No gameplay source, normal browser profile, monster
reference data or Google spreadsheet was changed.

## Limits / remaining authority

- Local Git author/remote setup is not silently inherited from the work account.
  CI configuration has not run on GitHub or certified a clean Linux runner.
- The lexical guard is not a complete JS parser; dynamic references and semantic
  documentation accuracy still require review. Hooks are optional/bypassable.
- The server design is a plan: no accounts, database, payments, multiplayer,
  cloud migration, production telemetry or player-capacity claim is implemented.
- The local backup command excludes browser saves and Google Sheets and does
  not create off-device disaster recovery. Export player saves separately.
- Existing integration hotspots remain. Extract them incrementally when changing
  behavior; do not mistake the ownership map for enforced language-level isolation.
