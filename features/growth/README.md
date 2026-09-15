# Levels, attributes, Leadership and passive trees

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local**. Derives levels, attributes and passive bonuses; connects individual progress to combat and menus.

## Entry and responsibility

`BondProgress.derived / trainerLevel; BondGrowth.nodes / stats; BondTree`

Trainer and companion XP are independent values on the same cumulative curve, with a hard player launch cap60; no owned monster sets trainer level. The engine/wild curve remains valid through100. Lv61–100 Echoes summon as Lv60 individuals while preserving sourceLevel; migration initializes trainerXP at the previously displayed level and preserves older tree access. Class trees unlock for the committed Druid/Mage at transformation. Individual monster trees unlock at player Lv30. Every species keeps18 ranked nodes; five nodes modify named skills and a sixth expresses its innate identity. Each effective DEX point gives0.667% active cooldown reduction; attribute and tree reduction share a50% total cap. Intact farm power adds capped account HP once, never to enemies. XP losses preserve already-earned individual tree budgets via optional treeLevel.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [progression.js](<../../progression.js>) | `BondProgress` |
| [growth.js](<../../growth.js>) | `BondGrowth` |
| [tree-menu.js](<../../tree-menu.js>) | `BondTree` |
| [progression.css](<../../progression.css>) | Owned source/configuration; inspect before editing. |
| [pass13.css](<../../pass13.css>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>)
- Used by: [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [exploration](<../../features/exploration/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>)

- [derived-stats](<../../docs/architecture/CONNECTIONS.md#derived-stats>) (growth → combat): Profile snapshot + species bases + individual XP/ranks + formation -> battle initialization. UI preview must use the same derived formulas.

Shared shapes: [Individual: progression.js / profile.js](<../../docs/architecture/CONNECTIONS.md#interface-3>).

## Diagnose here

- Wrong target, reach, damage or cooldown: Reproduce seeded Battle without rendering; inspect profile-derived factors and explicit target exceptions. First owner: [combat](<../../features/combat/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/onboarding_check.py --browser chrome` — Background fights, frozen live builds, world anchors, hostile joins/replay, mixed rewards, level feedback, temporary loot, recovery and opening navigation.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [Companion stats.md](<../../Companion stats.md>)
- [features/opening/VALIDATION.md](<../../features/opening/VALIDATION.md>)
- Commercial cards: [F-003](<../../FEATURE_BACKLOG.md>), [F-009](<../../FEATURE_BACKLOG.md>), [F-010](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-02](<../../OWNER_REVIEWS.md#or-02>), [OR-07](<../../OWNER_REVIEWS.md#or-07>) Use the live board/preflight for status, not an approval copied here.
