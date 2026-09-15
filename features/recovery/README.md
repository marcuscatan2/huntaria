# Adventure tuning, injuries, medicine and village services

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-test-tuning**. Defines test tuning and recovery UI; connects combat injuries to saved vitality and supplies.

## Entry and responsibility

`BondAdventure; BondRecovery; BondProfile.buy / recover / rest`

Test odds/XP/level policy is explicit. Health persists as basis points per trainer/individual. Entering any city restores trainer and every owned companion for free; existing injured city saves heal on load between encounters. No city sanctuary/heal action is exposed. Firstlight defeat restores everyone at forest camp; other defeats restore everyone at their rescue city. Field camp rest and shop purchases require proximity; portable medicine is separate. A fallen trainer blocks adventure; selected fallen companions remain selected but are benched until revived. Field class/build changes do not heal. Practice is health-independent.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [adventure-rules.js](<../../adventure-rules.js>) | `BondAdventure` |
| [recovery-menu.js](<../../recovery-menu.js>) | `BondRecovery` |
| [adventure.css](<../../adventure.css>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [content](<../../features/content/README.md>), [opening](<../../features/opening/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)
- Used by: [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [exploration](<../../features/exploration/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)

- [injury-and-supplies](<../../docs/architecture/CONNECTIONS.md#injury-and-supplies>) (recovery → persistence): Battle injury ratios -> checkpoint/complete -> vitality. Firstlight defeat records campRecovery and full camp revival; later defeats rescue to regional town with injuries. Before a new adventure, deploy removes selected zero-HP companions from the encounter copy but never from the saved loadout; trainer health remains the readiness gate. Buy/recover/rest validate proximity, resources and no active reservation; forest camp is a real rest service.

Shared shapes: [Profile read and command: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-2>).

## Diagnose here

- Switching builds heals / recovery not working: Check vitality, active reservation, service proximity and accepted storage write. First owner: [recovery](<../../features/recovery/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/opening_check.py --browser chrome` — Fresh creation, apprentice combat, quiet hunts, pursuit, death, loot/reload, isolated restart/heal safety and narrow-screen UI.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python scripts/creature_reference.py --check` — Reviewed 100-species snapshot and four generated outputs agree with Chrome export.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/city_world_check.py --browser chrome` — Cartesian borders, themed city rooms, arrival healing, physical teleport authority and save failures.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [PASS18_VALIDATION.md](<../../PASS18_VALIDATION.md>)
- [features/world/CITIES.md](<../../features/world/CITIES.md>)
- Commercial cards: Cross-cutting implementation; no separate acceptance card.
- Owner review routes: [OR-02](<../../OWNER_REVIEWS.md#or-02>), [OR-07](<../../OWNER_REVIEWS.md#or-07>) Use the live board/preflight for status, not an approval copied here.
