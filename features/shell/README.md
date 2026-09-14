# Application lifecycle and navigation

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local**. Coordinates screens and ticks; connects combat, presentation and profile settlement.

## Entry and responsibility

`BondApp.prepareBattle / renderBattle / finish / switchTab`

Owns screen transitions, scheduling and settlement. Explore/Loadout do not stop running fights; edits affect future builds. Adventure deployment benches selected fallen companions without removing them from the saved loadout; only the fallen trainer blocks a new adventure. All player Run controls request a saved three-second retreat; successful escape keeps wounds/accepted drops without victory rewards or rescue. Internal cancel is lifecycle/QA cleanup. Browser-hidden/Pause and reload remain resumable. Events feed CombatView; visuals cannot grant rewards. Isolated ?test=1 alone uses 3× world travel, automatic recovery after settled adventure wins/losses and visible 5× playback; normal mode keeps standard travel, 1×/2× playback and normal recovery. Player-visible patch notes announce material progression/world changes. Delegates audio/device preferences to experience; new creation does not mount the old world first.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [index.html](<../../index.html>) | Owned source/configuration; inspect before editing. |
| [style.css](<../../style.css>) | Owned source/configuration; inspect before editing. |
| [app.js](<../../app.js>) | `BondApp` |
| [test-controls.js](<../../test-controls.js>) | Owned source/configuration; inspect before editing. |
| [boot-status.js](<../../boot-status.js>) | `BondBoot` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [experience](<../../features/experience/README.md>), [exploration](<../../features/exploration/README.md>), [legacy](<../../features/legacy/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [recovery](<../../features/recovery/README.md>), [world](<../../features/world/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [exploration](<../../features/exploration/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [recovery](<../../features/recovery/README.md>)

No explicit cross-feature connection recorded; check the observed dependencies above.

Shared shapes: [Combat event: game.js Battle.emit](<../../docs/architecture/CONNECTIONS.md#interface-1>), [View invalidation signals](<../../docs/architecture/CONNECTIONS.md#interface-5>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/field_polish_check.py --browser chrome` — Fixed-lifetime loot under focus/hover, thin live world HP, foliage isolation, timed escape, pursuit damage, persistence failures and ordered replay.
- `python tests/onboarding_check.py --browser chrome` — Background fights, frozen live builds, world anchors, hostile joins/replay, mixed rewards, level feedback, temporary loot, recovery and opening navigation.
- `python tests/opening_check.py --browser chrome` — Fresh creation, apprentice combat, quiet hunts, pursuit, death, loot/reload, isolated restart/heal safety and narrow-screen UI.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/experience_check.py --browser chrome` — Preferences/audio lifecycle, owned scene drafting/persistence, PNG export and responsive input.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [docs/PLAYER_GUIDE.md](<../../docs/PLAYER_GUIDE.md>)
- [features/delivery/OPERATIONS.md](<../../features/delivery/OPERATIONS.md>)
- [features/shell/ENCOUNTERS.md](<../../features/shell/ENCOUNTERS.md>)
- Commercial cards: [F-008](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-04](<../../OWNER_REVIEWS.md#or-04>), [OR-06](<../../OWNER_REVIEWS.md#or-06>) Use the live board/preflight for status, not an approval copied here.
