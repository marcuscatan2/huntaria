# Species, skills, passives and reference data

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Defines species and skills; supplies combat, progression, art and the reviewed catalog.

## Entry and responsibility

`BondContent; BondRoster.manifest / validate`

Runtime content is assembled at boot. Stable species/skill IDs survive display renames. The owner-maintained Bond & Bolt Google Sheet is the source of truth for creature identity, design role, combat identity, element, region, wild/source level, encounter source, rarity and attack basis; a reviewed revision/fingerprint is imported locally and never fetched during play. The two reviewed docs/ combat workbooks supply 304 signatures, 11 shared moves and 100 innates through combat-catalog.js and explicit combat-kits.js rules. The two supplied CSVs own exact monster level rows and 24-node species trees through monster-progression-data.js. scripts/monster_progression.py validates all 10,000 rows, identities, prerequisite references, exclusions and budgets; cells are inert data. Legacy selected skills and acquisition rules remain valid. The starter map is an explicit level/population override. 100 entries do not mean 100 approved animation packages; generated JSON/tables must agree with the reviewed runtime snapshot. BondContent.CLASSES lists Druid, Mage, Hunter and Swordsman; TRAINERS also includes Apprentice.

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
| [combat-catalog.js](<../../combat-catalog.js>) | `BondCombatCatalog` |
| [combat-kits.js](<../../combat-kits.js>) | `BondCombatKits` |
| [scripts/combat_workbooks.py](<../../scripts/combat_workbooks.py>) | Owned source/configuration; inspect before editing. |
| [docs/Huntaria_Combat_Design_v2.xlsx](<../../docs/Huntaria_Combat_Design_v2.xlsx>) | Owned source/configuration; inspect before editing. |
| [docs/Huntaria_Trainer_Passive_Trees.xlsx](<../../docs/Huntaria_Trainer_Passive_Trees.xlsx>) | Owned source/configuration; inspect before editing. |
| [monster-progression-data.js](<../../monster-progression-data.js>) | `BondMonsterProgression` |
| [scripts/monster_progression.py](<../../scripts/monster_progression.py>) | Owned source/configuration; inspect before editing. |
| [docs/Huntaria - Mons-by-level.csv](<../../docs/Huntaria - Mons-by-level.csv>) | Owned source/configuration; inspect before editing. |
| [docs/Huntaria - mon-skills.csv](<../../docs/Huntaria - mon-skills.csv>) | Owned source/configuration; inspect before editing. |
| [item-catalog.js](<../../item-catalog.js>) | `BondItemCatalog` |
| [scripts/equipment_catalog.py](<../../scripts/equipment_catalog.py>) | Owned source/configuration; inspect before editing. |
| [docs/Huntaria - Equipment.csv](<../../docs/Huntaria - Equipment.csv>) | Owned source/configuration; inspect before editing. |
| [docs/Huntaria - Held_Items.csv](<../../docs/Huntaria - Held_Items.csv>) | Owned source/configuration; inspect before editing. |
| [scripts/item_icons.py](<../../scripts/item_icons.py>) | Owned source/configuration; inspect before editing. |
| [assets/items/manifest.json](<../../assets/items/manifest.json>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [combat](<../../features/combat/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [exploration](<../../features/exploration/README.md>), [growth](<../../features/growth/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [legacy](<../../features/legacy/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)

No explicit cross-feature connection recorded; check the observed dependencies above.

Shared shapes: [Individual: progression.js / profile.js](<../../docs/architecture/CONNECTIONS.md#interface-3>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python scripts/creature_reference.py --check` — Reviewed 100-species snapshot and four generated outputs agree with Chrome export.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/monster_sprites_check.py --browser chrome` — 100 supplied sprites, workbook identity, unchanged mechanics, shared rendering, poses, facing and save preservation.
- `python tests/combat_workbooks_check.py --browser chrome` — Imported workbook integrity, shield/guardian/debt/critical/entity contracts, all proposed loadouts and responsive summon presentation.
- `python tests/monster_progression_check.py --browser chrome` — Exact 10,000-row CSV stats, 100 talent kits, quest budgets, shared shields, effect regressions, legacy/current encounter replay and responsive individual trees.
- `python tests/equipment_ui_check.py --browser chrome` — All 200 item loadouts, independent drops, ownership, effect contracts, frozen combat gear, failed-save rollback and phone equipment menus.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [CREATURE_REFERENCE.md](<../../CREATURE_REFERENCE.md>)
- [CREATURE_DROPS.md](<../../CREATURE_DROPS.md>)
- [CREATURE_FAMILIES.md](<../../CREATURE_FAMILIES.md>)
- [CREATURE_DESIGN.md](<../../CREATURE_DESIGN.md>)
- [features/animation/SUPPLIED_SPRITES.md](<../../features/animation/SUPPLIED_SPRITES.md>)
- [features/content/COMBAT_WORKBOOKS.md](<../../features/content/COMBAT_WORKBOOKS.md>)
- [features/growth/COMPANION_TREES.md](<../../features/growth/COMPANION_TREES.md>)
- [features/collection/EQUIPMENT.md](<../../features/collection/EQUIPMENT.md>)
- Art and provenance: [assets/items](<../../assets/items>)
- Commercial cards: [F-006](<../../FEATURE_BACKLOG.md>), [F-064](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-01](<../../OWNER_REVIEWS.md#or-01>), [OR-05](<../../OWNER_REVIEWS.md#or-05>), [OR-07](<../../OWNER_REVIEWS.md#or-07>) Use the live board/preflight for status, not an approval copied here.
