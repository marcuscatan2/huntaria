# Inventory, Soul Echoes, summoning and loot presentation

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local**. Shows inventory and Soul Echo summoning; persistence owns drops and individual creation.

## Entry and responsibility

`BondEchoes.qualifies / key; BondInventory; BondJourney; BondLoot; BondProfile.summon / complete`

Profile grants once locally; menus and individual in-field pickups display accepted receipts. Inventory stays authoritative after notifications expire. Level gains show a transient accessible LEVEL UP effect with the new level and an actor ring. The accepted first Firstlight Brimble receipt can force one Emberfox Echo; the accepted second-role receipt can force one Bloomslime or Stonehorn Echo. Both use ordinary Echo items, are consumed once and do not change normal drop odds. During the first summon objective, the in-frame Bag destination, owned Brimble Echo and Summon action are highlighted in sequence. Summon consumes one Echo for one independent individual and auto-fills an empty party slot. Player copy never exposes backend odds or receipt language. Each item/coin/XP type has an independent three-second in-frame pickup; overflow waits for its full lifetime. Bag categories, item details and summoning stay in the game frame; up to 850px item inspection replaces the grid until Back to items.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [echoes.js](<../../echoes.js>) | `BondEchoes` |
| [inventory-menu.js](<../../inventory-menu.js>) | `BondInventory` |
| [journey.js](<../../journey.js>) | `BondJourney` |
| [loot-popup.js](<../../loot-popup.js>) | `BondLoot` |
| [journey.css](<../../journey.css>) | Owned source/configuration; inspect before editing. |
| [loot.css](<../../loot.css>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [content](<../../features/content/README.md>), [experience](<../../features/experience/README.md>), [growth](<../../features/growth/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)
- Used by: [exploration](<../../features/exploration/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>)

- [echo-to-individual](<../../docs/architecture/CONNECTIONS.md#echo-to-individual>) (collection → persistence): Echo item/receipt -> profile.summon -> consume one Echo and create one instance atomically locally -> refresh collection and picker.

Shared shapes: [Profile read and command: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-2>), [Individual: progression.js / profile.js](<../../docs/architecture/CONNECTIONS.md#interface-3>), [View invalidation signals](<../../docs/architecture/CONNECTIONS.md#interface-5>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/field_polish_check.py --browser chrome` — Fixed-lifetime loot under focus/hover, thin live world HP, foliage isolation, timed escape, pursuit damage, persistence failures and ordered replay.
- `python tests/onboarding_check.py --browser chrome` — Background fights, frozen live builds, world anchors, hostile joins/replay, mixed rewards, level feedback, temporary loot, recovery and opening navigation.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python scripts/creature_reference.py --check` — Reviewed 100-species snapshot and four generated outputs agree with Chrome export.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/game_frame_check.py --browser chrome` — Shared exploration/preparation bounds, framed Bag summoning and item inspection, painted farm controls, modal focus, responsive layouts and background battle settlement.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [CREATURE_DROPS.md](<../../CREATURE_DROPS.md>)
- Commercial cards: [F-011](<../../FEATURE_BACKLOG.md>), [F-012](<../../FEATURE_BACKLOG.md>), [F-014](<../../FEATURE_BACKLOG.md>), [F-015](<../../FEATURE_BACKLOG.md>), [F-060](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-02](<../../OWNER_REVIEWS.md#or-02>), [OR-06](<../../OWNER_REVIEWS.md#or-06>), [OR-07](<../../OWNER_REVIEWS.md#or-07>), [OR-09](<../../OWNER_REVIEWS.md#or-09>) Use the live board/preflight for status, not an approval copied here.
