# Exploration input, camera, atlas and scenery

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Handles walking, camera, atlas and scenery; connects world geometry to profile and shared rigs.

## Entry and responsibility

`BondRegion.enter / leave / frame; WorldRenderer.mount / dispose / draw; BondWorldMap`

Owns input/camera, physical encounter anchors, crossed-swords markers and proximity. Exploration uses an in-frame current objective with its destination region/map, upper-right minimap/Atlas entry, event-only status line and three-destination bottom menu; legacy external travel cards are hidden on this screen. Authored map-description prose remains world-building data and is not shown automatically on entry, in the HUD, or in sign/Keeper panels. Successful progressive scenery loading is silent; an actual asset failure remains concise and visible. Campaign rules expose `offer`/`delivery` state: the field and local minimap render a yellow ! at the current quest giver's real map position and a yellow ? on the NPC ready for delivery, with the same meaning in accessible field labels. Roaming wild species nameplates are hidden while accessible labels and the combat HUD retain identity. Player contact with clicked wildlife and hostile wildlife contact immediately start the reserved fight; the designated opening Emberfox is temporarily hostile. The Forest Mage and physical locked-exit badges expose the only opening road gate. NPC/pack/boss entries use concise dialogue. Progression bosses have fixed authored levels/rewards; later altar rematches retain selectable reward-free practice levels. Engaged trainers cannot move. Hostile pursuit continues during an active fight across in-game tabs; contact joins the same saved attempt as an enemy. The mandatory Forest Mage onboarding trial is the sole protected encounter and cannot receive roaming joins. No online participants. Discovery text omits backend tuning. Fixed thin HP tracks read live combat or saved vitality for the trainer and selected companions. In-frame notices are click-through except for their explicit controls, so reminders never block world interaction.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [region.js](<../../region.js>) | `BondRegion` |
| [world-renderer.js](<../../world-renderer.js>) | `WorldRenderer` |
| [world-atlas.js](<../../world-atlas.js>) | `BondWorldMap` |
| [region.css](<../../region.css>) | Owned source/configuration; inspect before editing. |
| [world.css](<../../world.css>) | Owned source/configuration; inspect before editing. |
| [world-v15.css](<../../world-v15.css>) | Owned source/configuration; inspect before editing. |
| [wild-behavior.js](<../../wild-behavior.js>) | `BondWildBehavior` |
| [scripts/world_assets.py](<../../scripts/world_assets.py>) | Owned source/configuration; inspect before editing. |
| [assets/world-runtime/manifest.json](<../../assets/world-runtime/manifest.json>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [content](<../../features/content/README.md>), [experience](<../../features/experience/README.md>), [growth](<../../features/growth/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [population](<../../features/population/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)
- Used by: [campaign](<../../features/campaign/README.md>), [shell](<../../features/shell/README.md>)

- [world-facing](<../../docs/architecture/CONNECTIONS.md#world-facing>) (exploration → animation): Region movement/follower facing -> shared CharacterRig.pose and CSS facing transform. Verify left and right in world and arena.
- [world-collision](<../../docs/architecture/CONNECTIONS.md#world-collision>) (world → exploration): One authored geometry feeds collision/routing and scenery; use renderer bounds for painted service hit targets, not unrelated marker rectangles.
- [territorial-encounter](<../../docs/architecture/CONNECTIONS.md#territorial-encounter>) (exploration → persistence): Notice -> warning -> chase/contact -> reserve existing spawn life. With an active fight, joinBattle saves entry and tick before Battle.addEnemy. In-game tabs/modals do not pause active-fight pursuit; explicit Pause/browser-hidden does. Leash and line of sight apply. No visual reward authority.

Shared shapes: [Profile read and command: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-2>), [View invalidation signals](<../../docs/architecture/CONNECTIONS.md#interface-5>), [Space/time units](<../../docs/architecture/CONNECTIONS.md#interface-6>).

## Diagnose here

- Wrong pose, sliding, missing frames: Check CharacterRig.inspect and CombatView.inspect; compare movement flags and facing before editing art. First owner: [animation](<../../features/animation/README.md>).
- Invisible bridge, blocked road, bad atlas destination: Compare world geometry, neighbor gates, nav path and renderer bounds. First owner: [exploration](<../../features/exploration/README.md>).
- Creature attacks through a wall or while a menu is open: Check line of sight, warning/leash, modal pause and same spawn-life reservation. First owner: [exploration](<../../features/exploration/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/field_polish_check.py --browser chrome` — Fixed-lifetime loot under focus/hover, thin live world HP, foliage isolation, timed escape, pursuit damage, persistence failures and ordered replay.
- `python tests/onboarding_check.py --browser chrome` — Background fights, frozen live builds, world anchors, hostile joins/replay, mixed rewards, level feedback, temporary loot, recovery and opening navigation.
- `python tests/opening_check.py --browser chrome` — Fresh creation, apprentice combat, quiet hunts, pursuit, death, loot/reload, isolated restart/heal safety and narrow-screen UI.
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [WORLD_DESIGN.md](<../../WORLD_DESIGN.md>)
- [WORLD_IMPLEMENTATION.md](<../../WORLD_IMPLEMENTATION.md>)
- [assets/world-runtime/README.md](<../../assets/world-runtime/README.md>)
- Art and provenance: [assets/world-v15](<../../assets/world-v15>)
- Art and provenance: [assets/world-v17](<../../assets/world-v17>)
- Art and provenance: [assets/world-runtime](<../../assets/world-runtime>)
- Commercial cards: [F-027](<../../FEATURE_BACKLOG.md>), [F-035](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-01](<../../OWNER_REVIEWS.md#or-01>), [OR-03](<../../OWNER_REVIEWS.md#or-03>), [OR-06](<../../OWNER_REVIEWS.md#or-06>) Use the live board/preflight for status, not an approval copied here.
