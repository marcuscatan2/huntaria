# Development tools

Use `python scripts/project.py --help` from the project root.

| Command | Purpose |
| --- | --- |
| `context <feature / file / global / F-### / connection>` | Focused source, guide and test route |
| `context --list` | Feature IDs with one-line responsibility |
| `impact <owned file ...>` | Conservative downstream change/test scope |
| `doctor` | Read-only environment report |
| `check` / `verify --browser chrome` | Structure / full browser gate |
| `map --write` | Regenerate feature guides, index, connections and module graph |
| `reviews` / `reviews --work … --enforce` | Owner priorities / dependent-work preflight |
| `reviews --write` | Regenerate owner board; never grants approval |
| `backup` | On explicit request: verified source/art ZIP, not browser saves |

[Operations](../features/delivery/OPERATIONS.md) owns setup and caveats.
[Engineering](../docs/ENGINEERING.md#content-updates) owns authorized
`refresh_pass18_reference.py` / `creature_reference.py` publication.
Do not update reviewed data merely to conceal a runtime/reference mismatch.

`project.py` orchestrates checks; `navigation.py` owns routing generation;
`review_gates.py` owns owner-decision validation. Their maintained inputs are
`docs/architecture.json` and `docs/review-gates.json`.
Use stdlib for routing/check tools; new dependencies need a concrete benefit.

`monster_sprites.py --write --check` generates and validates the supplied
roster's stable-ID/name/PNG overlay (stdlib only).
After a fresh mechanics export, its `--publish-reference` option publishes
authorized names and art metadata to the reference JSON, not gameplay tuning.
`inspect_roster_workbook.py <path.xlsx>` is a read-only, optional openpyxl
utility for reviewing workbook values, formulas, styles and validation lists.
It never writes the workbook or updates the game/Google Sheet by itself.

`capture_character_reference.py` uses the shared browser renderer to capture a
transparent Apprentice identity reference for controlled art generation. It does
not change a profile or transform shipped art.
