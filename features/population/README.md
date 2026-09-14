# Map populations and spawn-life placement

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local**. Chooses map-wide spawn positions; persistence owns each life, timer and reserved encounter.

## Entry and responsibility

`BondPopulation.keys / selected / position; BondProfile.population / beginHunt`

Per-map quotas and saved random positions; Firstlight overrides rarity quotas, guarantees one reachable Emberfox inside the opening ring, and uses BondOpening difficulty bands/camp clearance. That stable first life is the only introductory attacker; the first accepted Firstlight Emberfox kill is the reward trigger even if the player chose another resident. Replacement lives follow ordinary behavior. A new life replaces a dead life elsewhere. Incompatible unreserved positions relocate without rerolling life/seed/loot; reserved lives remain frozen. Spawn ID prefixes are identities, not map authority. Profile owns clocks/RNG/receipts.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [map-population.js](<../../map-population.js>) | `BondPopulation` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [opening](<../../features/opening/README.md>), [world](<../../features/world/README.md>)
- Used by: [exploration](<../../features/exploration/README.md>), [persistence](<../../features/persistence/README.md>)

- [spawn-reservation](<../../docs/architecture/CONNECTIONS.md#spawn-reservation>) (population → persistence): Quota and placement policy -> persisted life/seed/roll/position -> reserved encounter. Map reload/build edits cannot reroll an accepted life.

Shared shapes: [Spawn life / reservation: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-4>).

## Diagnose here

- Monster respawns beside the kill or rerolls: Check reserved life and map-wide selected slot before changing delays. First owner: [population](<../../features/population/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/opening_check.py --browser chrome` — Fresh creation, apprentice combat, quiet hunts, pursuit, death, loot/reload, isolated restart/heal safety and narrow-screen UI.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [MAP_POPULATIONS.md](<../../MAP_POPULATIONS.md>)
- Commercial cards: [F-059](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-03](<../../OWNER_REVIEWS.md#or-03>), [OR-07](<../../OWNER_REVIEWS.md#or-07>) Use the live board/preflight for status, not an approval copied here.
