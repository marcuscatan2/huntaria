# Loadout, companion picker and formation

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local**. Selects individuals, skills and formation; connects saved builds to battle initialization.

## Entry and responsibility

`BondMenu.render; BondPicker; BondFormation.assign; BondApp.changeUnit / changeSkills`

UI chooses up to two individual companions and three distinct skills each. Summoning fills the first empty companion slot; later selection remains explicit. Same species may occupy both slots, same individual may not. A created Apprentice cannot use the class picker; confirmed specialization supplies its persistent Druid/Mage build. Class trials use a temporary three-of-five trainer build and never overwrite the Apprentice. Formation is an opening position, not a targeting override. Profile owns saved skills/trees.

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

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [experience](<../../features/experience/README.md>), [growth](<../../features/growth/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [opening](<../../features/opening/README.md>), [persistence](<../../features/persistence/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [exploration](<../../features/exploration/README.md>), [growth](<../../features/growth/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>)

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

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [Companion stats.md](<../../Companion stats.md>)
- Commercial cards: [F-005](<../../FEATURE_BACKLOG.md>), [F-013](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-06](<../../OWNER_REVIEWS.md#or-06>), [OR-09](<../../OWNER_REVIEWS.md#or-09>) Use the live board/preflight for status, not an approval copied here.
