# World definitions, walkable geometry and routing

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Defines maps, geometry and paths; supplies exploration and population placement.

## Entry and responsibility

`BondAtlas.get / maps / collision; BondWorldLayout; BondNav.find`

36 stable places occupy unique Cartesian cells: 24 existing large maps, six square safe cities and six boss domains. GRID_EDGES owns reciprocal north/east/south/west border portals; world-layout derives physical gates and safe arrivals. City links exist only across their authored shared borders; no field-wide town shortcuts. Firstlight exits stay locked until the Forest Mage proof; subsequent level bands warn of danger. The atlas draws the same grid and plans walking through gates. city-data owns themed city buildings, doorway/service points, civilian companions and the four-city waystone allowlist. Interior view state does not create new world maps or alter field geometry. Ghost Tower Entrance retains hollow-2 and its Cartesian borders; four separate saved interiors connect by reciprocal stairs. Primary ghost habitats retain their spawn prefixes; repeated floor populations use distinct IDs. The atlas projects interiors onto the entrance cell.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [world-data.js](<../../world-data.js>) | `BondWorld` |
| [atlas-data.js](<../../atlas-data.js>) | `BondAtlas` |
| [world-layout.js](<../../world-layout.js>) | `BondWorldLayout` |
| [world-nav.js](<../../world-nav.js>) | `BondNav` |
| [city-data.js](<../../city-data.js>) | `BondCities` |
| [ghost-tower.js](<../../ghost-tower.js>) | `BondGhostTower` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [content](<../../features/content/README.md>), [recovery](<../../features/recovery/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [exploration](<../../features/exploration/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [legacy](<../../features/legacy/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [population](<../../features/population/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>)

- [world-collision](<../../docs/architecture/CONNECTIONS.md#world-collision>) (world → exploration): One authored geometry feeds collision/routing and scenery; use renderer bounds for painted service hit targets, not unrelated marker rectangles.
- [city-travel](<../../docs/architecture/CONNECTIONS.md#city-travel>) (world → persistence): Authored doorway/waystone positions authorize proximity-bound room/service interactions and critical city teleport transactions. Arrival heals all owned lives; failed saves retain location/resources; atlas selection only plans physical walking.

Shared shapes: [Space/time units](<../../docs/architecture/CONNECTIONS.md#interface-6>).

## Diagnose here

- Invisible bridge, blocked road, bad atlas destination: Compare world geometry, neighbor gates, nav path and renderer bounds. First owner: [exploration](<../../features/exploration/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/city_world_check.py --browser chrome` — Cartesian borders, themed city rooms, arrival healing, physical teleport authority and save failures.
- `python tests/relic_quest_check.py --browser chrome` — Four-class guaranteed rescue, saved replay, atomic Echo delivery, ghost party condition, connected tower floors and one-time class weapon reward.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [WORLD_DESIGN.md](<../../WORLD_DESIGN.md>)
- [WORLD_IMPLEMENTATION.md](<../../WORLD_IMPLEMENTATION.md>)
- [features/world/CITIES.md](<../../features/world/CITIES.md>)
- [features/campaign/SACRED_TREASURES.md](<../../features/campaign/SACRED_TREASURES.md>)
- Commercial cards: [F-016](<../../FEATURE_BACKLOG.md>), [F-017](<../../FEATURE_BACKLOG.md>), [F-018](<../../FEATURE_BACKLOG.md>), [F-058](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-03](<../../OWNER_REVIEWS.md#or-03>), [OR-09](<../../OWNER_REVIEWS.md#or-09>) Use the live board/preflight for status, not an approval copied here.
