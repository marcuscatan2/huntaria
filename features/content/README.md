# Species, skills, passives and reference data

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Defines species and skills; supplies combat, progression, art and the reviewed catalog.

## Entry and responsibility

`BondContent; BondRoster.manifest / validate`

Runtime content is assembled at boot. Stable species/skill IDs survive display renames. The owner-maintained Bond & Bolt Google Sheet is the source of truth for creature identity, design role, combat identity, element, region, wild/source level, encounter source, rarity and attack basis; a reviewed revision/fingerprint is imported locally and never fetched during play. The mon-skills tab is empty, so existing runtime stats/kits remain authoritative until reviewed Sheet data exists. The starter map is an explicit level/population override. 100 entries do not mean 100 approved animation packages; generated JSON/tables must agree with the reviewed runtime snapshot.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [content.js](<../../content.js>) | `BondContent` |
| [roster.js](<../../roster.js>) | `BondRoster` |
| [data/creature-reference.json](<../../data/creature-reference.json>) | Owned source/configuration; inspect before editing. |
| [scripts/creature_reference.py](<../../scripts/creature_reference.py>) | Owned source/configuration; inspect before editing. |
| [scripts/refresh_pass18_reference.py](<../../scripts/refresh_pass18_reference.py>) | Owned source/configuration; inspect before editing. |
| [data/monster-roster.json](<../../data/monster-roster.json>) | Owned source/configuration; inspect before editing. |
| [scripts/inspect_roster_workbook.py](<../../scripts/inspect_roster_workbook.py>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [combat](<../../features/combat/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [exploration](<../../features/exploration/README.md>), [growth](<../../features/growth/README.md>), [legacy](<../../features/legacy/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [recovery](<../../features/recovery/README.md>), [world](<../../features/world/README.md>)

No explicit cross-feature connection recorded; check the observed dependencies above.

Shared shapes: [Individual: progression.js / profile.js](<../../docs/architecture/CONNECTIONS.md#interface-3>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python scripts/creature_reference.py --check` — Reviewed 100-species snapshot and four generated outputs agree with Chrome export.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/monster_sprites_check.py --browser chrome` — 100 supplied sprites, workbook identity, unchanged mechanics, shared rendering, poses, facing and save preservation.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [CREATURE_REFERENCE.md](<../../CREATURE_REFERENCE.md>)
- [CREATURE_DROPS.md](<../../CREATURE_DROPS.md>)
- [CREATURE_FAMILIES.md](<../../CREATURE_FAMILIES.md>)
- [CREATURE_DESIGN.md](<../../CREATURE_DESIGN.md>)
- [features/animation/SUPPLIED_SPRITES.md](<../../features/animation/SUPPLIED_SPRITES.md>)
- Commercial cards: [F-006](<../../FEATURE_BACKLOG.md>), [F-064](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-01](<../../OWNER_REVIEWS.md#or-01>), [OR-05](<../../OWNER_REVIEWS.md#or-05>), [OR-07](<../../OWNER_REVIEWS.md#or-07>) Use the live board/preflight for status, not an approval copied here.
