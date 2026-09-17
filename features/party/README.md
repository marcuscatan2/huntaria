# Loadout, companion picker and formation

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local**. Selects individuals, skills and formation; connects saved builds to battle initialization.

## Entry and responsibility

`BondMenu.render; BondPicker; BondFormation.assign; BondApp.changeUnit / changeSkills`

UI chooses up to two individual companions and three distinct skills each. Summoning fills the first empty companion slot; later selection remains explicit. Same species may occupy both slots, same individual may not. A created Apprentice cannot use the class picker; confirmed specialization supplies its persistent Druid/Mage build. Class trials preserve the current Apprentice party. Any party slots may share a formation row; shared rows spread actors vertically. Formation is an opening position, not a targeting override. Profile owns saved skills/trees. Preparation shares the exploration game frame. Native framed menus retain internal scrolling and focus; mobile item details return to their item grid. Bag contains Inventory. Inner Sea groups Sea land (Homestead), Trainer (attributes, Class Skill Tree, Equipment) and Party (My companions, Formation, Species Guide). Formation owns substitutions and Dummy test. current()/section()/group() expose routing. Red badges guide affordable stat/talent upgrades and empty compatible held slots through Inner Sea. Companion pages put Mastery tree first and show held item artwork/name. Signature skills have distinct color and labels; unknown planned moves show levels. City services teach active companions General moves or reset any owned companion for a matching Echo through profile commands. Exploration and preparation share SVG destination icons. Inner Sea Equipment manages six trainer slots and each individual held item. Character selection, owned-copy availability and class/level/family eligibility stay in frame.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [menu.js](<../../menu.js>) | `BondMenu` |
| [companion-picker.js](<../../companion-picker.js>) | `BondPicker` |
| [formation.js](<../../formation.js>) | `BondFormation` |
| [formation-menu.js](<../../formation-menu.js>) | `BondFormationView` |
| [menu.css](<../../menu.css>) | Owned source/configuration; inspect before editing. |
| [formation.css](<../../formation.css>) | Owned source/configuration; inspect before editing. |
| [pass14.css](<../../pass14.css>) | Owned source/configuration; inspect before editing. |
| [game-frame.css](<../../game-frame.css>) | Owned source/configuration; inspect before editing. |
| [tests/player_experience_check.py](<../../tests/player_experience_check.py>) | Owned source/configuration; inspect before editing. |
| [upgrade-notices.js](<../../upgrade-notices.js>) | `BondUpgradeNotices` |
| [menu-navigation.css](<../../menu-navigation.css>) | Owned source/configuration; inspect before editing. |
| [assets/interface/bag.svg](<../../assets/interface/bag.svg>) | Owned source/configuration; inspect before editing. |
| [assets/interface/inner-sea.svg](<../../assets/interface/inner-sea.svg>) | Owned source/configuration; inspect before editing. |
| [assets/interface/explore.svg](<../../assets/interface/explore.svg>) | Owned source/configuration; inspect before editing. |
| [tests/menu_upgrades_check.py](<../../tests/menu_upgrades_check.py>) | Owned source/configuration; inspect before editing. |
| [companion-services.js](<../../companion-services.js>) | `BondCompanionServices` |
| [tests/companion_services_check.py](<../../tests/companion_services_check.py>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [experience](<../../features/experience/README.md>), [growth](<../../features/growth/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [opening](<../../features/opening/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [exploration](<../../features/exploration/README.md>), [growth](<../../features/growth/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>)

- [owned-build](<../../docs/architecture/CONNECTIONS.md#owned-build>) (party → persistence): Visual picker chooses instance ID; migrateParty/setSkills validates ownership; bond-growth invalidates stale builds while preserving reservations.

Shared shapes: [Profile read and command: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-2>), [Individual: progression.js / profile.js](<../../docs/architecture/CONNECTIONS.md#interface-3>), [View invalidation signals](<../../docs/architecture/CONNECTIONS.md#interface-5>).

## Diagnose here

- Same-species copies overwrite each other: Trace individual IDs through picker, saved skills, ranks and battle build. First owner: [party](<../../features/party/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/experience_check.py --browser chrome` — Preferences/audio lifecycle, owned scene drafting/persistence, PNG export and responsive input.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.
- `python tests/game_frame_check.py --browser chrome` — Shared exploration/preparation bounds, framed Bag summoning and item inspection, painted farm controls, modal focus, responsive layouts and background battle settlement.
- `python tests/player_experience_check.py --browser chrome` — Concise player copy, Inner Sea/class-tree routing, dummy DPS/healing/shield rates, save isolation, responsive reports and one-time NPC victory return.
- `python tests/monster_progression_check.py --browser chrome` — Exact 10,000-row CSV stats, 100 talent kits, quest budgets, shared shields, effect regressions, legacy/current encounter replay and responsive individual trees.
- `python tests/menu_upgrades_check.py --browser chrome` — Read-only upgrade routes, independent trainer/companion level-ups, affordable points, individual pagination, purchases, resets, reload and responsive shared SVG navigation.
- `python tests/equipment_ui_check.py --browser chrome` — All 200 item loadouts, independent drops, ownership, effect contracts, frozen combat gear, failed-save rollback and phone equipment menus.
- `python tests/companion_services_check.py --browser chrome` — Companion move unlocks, tutor and Echo reset transactions, class attribute refunds, duplicate prevention, responsive navigation and held badges.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [Companion stats.md](<../../Companion stats.md>)
- [features/party/GAME_FRAME.md](<../../features/party/GAME_FRAME.md>)
- [features/collection/EQUIPMENT.md](<../../features/collection/EQUIPMENT.md>)
- [features/growth/COMPANION_MOVES.md](<../../features/growth/COMPANION_MOVES.md>)
- Commercial cards: [F-005](<../../FEATURE_BACKLOG.md>), [F-013](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-06](<../../OWNER_REVIEWS.md#or-06>), [OR-09](<../../OWNER_REVIEWS.md#or-09>) Use the live board/preflight for status, not an approval copied here.
