# Inner Sea farm, training, defenses and decoration

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Trains the owned collection and stages daily monster defenses; persistence commits farm care, upgrades and rewards.

## Entry and responsibility

`BondFarm.advance / command / attack; BondProfile.farmAction / settleFarm; BondFarmView; BondInnerSea.draw / exportPicture`

Lv25 farm ownership, wooden house and five independently upgraded habitats; each displays the highest-level compatible owned individual. All bag copies train while clean and intact. Power counts the strongest of each species once. Five separate defenders fight real daily monster-only battles at trainer level, scaled by bundled lunar phases. Success settles ordinary attacker loot once; loss removes XP from all owned monsters and damages the farm, suspending training/account bonuses until an item repair. Saved last outcome supplies a read-only replay. Original decoration drafts, styles, legacy selected IDs and local PNG export remain. Future habitat equipment and authoritative online settlement are unimplemented. Haunted cellar compatibility uses current ghost, undead, haunted-object and demon/fiend families before legacy animal shapes; saved cellar upgrades retain their key. Painted homestead scenery and resident placement share the PNG renderer. Clickable habitat labels focus their controls; native frames contain care, owned companions and catalog views.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [inner-sea-rules.js](<../../inner-sea-rules.js>) | `BondHaven` |
| [inner-sea.js](<../../inner-sea.js>) | `BondInnerSea` |
| [inner-sea.css](<../../inner-sea.css>) | Owned source/configuration; inspect before editing. |
| [inner-sea-farm.js](<../../inner-sea-farm.js>) | `BondFarm` |
| [inner-sea-farm-view.js](<../../inner-sea-farm-view.js>) | `BondFarmView` |
| [moon-calendar.js](<../../moon-calendar.js>) | `BondMoonCalendar` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [experience](<../../features/experience/README.md>), [growth](<../../features/growth/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)
- Used by: [combat](<../../features/combat/README.md>), [growth](<../../features/growth/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>)

- [haven-layout](<../../docs/architecture/CONNECTIONS.md#haven-layout>) (inner-sea → persistence): Owned progress validates three decoration sockets and legacy selections; pure farm rules separately compute training, strongest-species power, daily defenses and habitat residents. Profile settles timestamps, XP, repairs and rewards atomically. Drafts, export and defense replay cannot grant rewards.
- [farm-defense](<../../docs/architecture/CONNECTIONS.md#farm-defense>) (inner-sea → combat): Explicit UTC phase/attack timestamp + saved five-individual defense loadout -> trainer-free deterministic Battle -> one committed XP/loot/damage outcome and read-only replay. Profile owns clock and storage; ordinary adventures use frozen profile snapshots.

## Diagnose here

- Wrong displayed companion, lost decoration or failed picture export: Check draft versus profile.haven, eligibility and canvas readiness before changing profile data. First owner: [inner-sea](<../../features/inner-sea/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/experience_check.py --browser chrome` — Preferences/audio lifecycle, owned scene drafting/persistence, PNG export and responsive input.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.
- `python tests/game_frame_check.py --browser chrome` — Shared exploration/preparation bounds, framed Bag summoning and item inspection, painted farm controls, modal focus, responsive layouts and background battle settlement.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [features/inner-sea/DISPLAY.md](<../../features/inner-sea/DISPLAY.md>)
- [features/inner-sea/FARM_SCOPE.md](<../../features/inner-sea/FARM_SCOPE.md>)
- [assets/inner-sea/README.md](<../../assets/inner-sea/README.md>)
- Commercial cards: [F-031](<../../FEATURE_BACKLOG.md>), [F-032](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-01](<../../OWNER_REVIEWS.md#or-01>), [OR-02](<../../OWNER_REVIEWS.md#or-02>), [OR-06](<../../OWNER_REVIEWS.md#or-06>), [OR-08](<../../OWNER_REVIEWS.md#or-08>), [OR-09](<../../OWNER_REVIEWS.md#or-09>), [OR-10](<../../OWNER_REVIEWS.md#or-10>) Use the live board/preflight for status, not an approval copied here.
