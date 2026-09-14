# World definitions, walkable geometry and routing

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Defines maps, geometry and paths; supplies exploration and population placement.

## Entry and responsibility

`BondAtlas.get / maps / collision; BondWorldLayout; BondNav.find`

36 connected places: 24 large maps, six compact hubs and six compact boss domains; world units differ from arena units. world-layout augments BondAtlas geometry/validation during boot. Atlas neighbors and physical gates must agree. Firstlight exits are visibly locked until the Forest Mage proof; after that, roads remain open and nonlinear cross-region links reduce corridor dependence. The illustrated atlas derives each reach's average habitat level and compares it with trainer level (green at/below, yellow +1–5, red +6 or more); these are danger warnings, never later invisible progression locks. A displayed destination never grants teleport authority.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [world-data.js](<../../world-data.js>) | `BondWorld` |
| [atlas-data.js](<../../atlas-data.js>) | `BondAtlas` |
| [world-layout.js](<../../world-layout.js>) | `BondWorldLayout` |
| [world-nav.js](<../../world-nav.js>) | `BondNav` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [content](<../../features/content/README.md>), [recovery](<../../features/recovery/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [exploration](<../../features/exploration/README.md>), [legacy](<../../features/legacy/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [population](<../../features/population/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>)

- [world-collision](<../../docs/architecture/CONNECTIONS.md#world-collision>) (world → exploration): One authored geometry feeds collision/routing and scenery; use renderer bounds for painted service hit targets, not unrelated marker rectangles.

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

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [WORLD_DESIGN.md](<../../WORLD_DESIGN.md>)
- [WORLD_IMPLEMENTATION.md](<../../WORLD_IMPLEMENTATION.md>)
- Commercial cards: [F-016](<../../FEATURE_BACKLOG.md>), [F-017](<../../FEATURE_BACKLOG.md>), [F-018](<../../FEATURE_BACKLOG.md>), [F-058](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-03](<../../OWNER_REVIEWS.md#or-03>), [OR-09](<../../OWNER_REVIEWS.md#or-09>) Use the live board/preflight for status, not an approval copied here.
