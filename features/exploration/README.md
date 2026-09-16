# Exploration input, camera, atlas and scenery

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Handles walking, camera, atlas and scenery; connects world geometry to profile and shared rigs.

## Entry and responsibility

`BondRegion.enter / leave / frame; WorldRenderer.mount / dispose / draw; BondWorldMap`

Owns input/camera, physical encounter anchors, crossed-swords markers and proximity. Exploration uses an in-frame current objective with its destination region/map, upper-right minimap/Atlas entry, event-only status line and three-destination bottom menu; legacy external travel cards are hidden on this screen. Authored map-description prose remains world-building data and is not shown automatically on entry, in the HUD, or in sign/Keeper panels. Successful progressive scenery loading is silent; an actual asset failure remains concise and visible. Campaign rules expose `offer`/`delivery` state: the field and local minimap render a yellow ! at the current quest giver's real map position and a yellow ? on the NPC ready for delivery, with the same meaning in accessible field labels. Roaming wild species nameplates are hidden while accessible labels and the combat HUD retain identity. Player contact with clicked wildlife and hostile wildlife contact immediately start the reserved fight; every roaming species is hostile outside Firstlight at every trainer level; the starting map remains passive. The Forest Mage and physical locked-exit badges expose the only opening road gate. NPC/pack/boss entries use concise dialogue. Pack previews use a participating monster portrait and reserve lives only on Challenge; cancelling preserves walking and loot. Progression bosses have fixed authored levels/rewards; later altar rematches retain selectable reward-free practice levels. Engaged trainers cannot move. Hostile pursuit continues during an active fight across in-game tabs; contact joins the same saved attempt as an enemy. The Forest Mage onboarding trial and four class-master acceptance battles are protected from roaming joins. No online participants. Discovery text omits backend tuning. Fixed thin HP tracks read live combat or saved vitality for the trainer and selected companions. In-frame notices are click-through except for their explicit controls, so reminders never block world interaction. Ordinary NPCs and keepers use civilian art; class masters retain their class portrait through the shared CharacterRig appearance selector. City buildings use painted hit bounds and clear doorway proximity. Enterable overhead rooms retain source proportions on desktop and phones and contain resident conversations, prop interactions and profile-owned supply purchases; closing/reload returns outside. Cities replace generic markers with painted buildings, people, companions, waystones and chest objects. The Cartesian atlas draws equal squares and actual shared-border routes; waystone travel is a separate physical interaction. Landscape props use two general lossless atlases and a tower stonework atlas loaded on first visit, all with measured silhouette frames. Painted ascending/descending stairs retain physical gate positions and use their full painted tap bounds; four burial silhouettes remain visible in low effects. Ground-painted tower props provide a loading/error fallback; retry clears their cached chunks. Three shared sheets stay below 19 MiB decoded RGBA. Ground shading includes world-space patch halos across chunk boundaries. world-passages.js describes destination-specific cave, city, cemetery, forest, mountain, ruin, sanctuary and meadow approaches over existing roads. Shared atlas props frame open border gaps; passage tap areas and labels stay within the game frame. Walking toward a border gate crosses at contact through the profile transition; stationary arrivals never bounce back, and rejected walking attempts latch until backing away. Explicit taps can retry immediately. Existing locks, critical-save failures and safe arrivals are preserved. Scenery services retain their real hit bounds without generic icon markers.

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
| [city-view.js](<../../city-view.js>) | `BondCityView` |
| [city.css](<../../city.css>) | Owned source/configuration; inspect before editing. |
| [world-passages.js](<../../world-passages.js>) | `BondPassages` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [experience](<../../features/experience/README.md>), [growth](<../../features/growth/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [population](<../../features/population/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)
- Used by: [campaign](<../../features/campaign/README.md>), [shell](<../../features/shell/README.md>)

- [world-facing](<../../docs/architecture/CONNECTIONS.md#world-facing>) (exploration → animation): Region movement/follower facing -> shared CharacterRig.pose and CSS facing transform. Verify left and right in world and arena.
- [world-collision](<../../docs/architecture/CONNECTIONS.md#world-collision>) (world → exploration): One authored geometry feeds collision/routing and scenery; use renderer bounds for painted service hit targets, not unrelated marker rectangles.
- [territorial-encounter](<../../docs/architecture/CONNECTIONS.md#territorial-encounter>) (exploration → persistence): Every roaming species attacks outside Firstlight at every player level. Notice -> warning -> chase/contact -> reserve existing spawn life. Firstlight residents stay passive and accept clicked hunts. With an active fight, joinBattle saves entry and tick before Battle.addEnemy. In-game tabs/modals do not pause active-fight pursuit; explicit Pause/browser-hidden does. Leash and line of sight apply. No visual reward authority. A clicked wild target stays selected while it moves; approach routes update and contact is checked even when the player has stopped moving.

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
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.
- `python tests/city_world_check.py --browser chrome` — Cartesian borders, themed city rooms, arrival healing, physical teleport authority and save failures.
- `python tests/field_encounters_check.py --browser chrome` — All-map tripled populations, pack preview/cancel/challenge/reload/escape and the current-trainer aggression boundary.
- `python tests/relic_quest_check.py --browser chrome` — Four-class guaranteed rescue, saved replay, atomic Echo delivery, ghost party condition, connected tower floors and one-time class weapon reward.
- `python tests/landscapes_check.py --browser chrome` — Forty map profiles, seamless ground patches, reachable services, destination-specific passage taps/walking, lock/save retry, stairs, asset recovery, phone touch and bounded landscape caches.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [WORLD_DESIGN.md](<../../WORLD_DESIGN.md>)
- [WORLD_IMPLEMENTATION.md](<../../WORLD_IMPLEMENTATION.md>)
- [assets/world-runtime/README.md](<../../assets/world-runtime/README.md>)
- [features/world/CITIES.md](<../../features/world/CITIES.md>)
- [features/world/LANDSCAPES.md](<../../features/world/LANDSCAPES.md>)
- [assets/landscapes/README.md](<../../assets/landscapes/README.md>)
- Art and provenance: [assets/world-v15](<../../assets/world-v15>)
- Art and provenance: [assets/world-v17](<../../assets/world-v17>)
- Art and provenance: [assets/world-runtime](<../../assets/world-runtime>)
- Art and provenance: [assets/landscapes](<../../assets/landscapes>)
- Commercial cards: [F-027](<../../FEATURE_BACKLOG.md>), [F-035](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-01](<../../OWNER_REVIEWS.md#or-01>), [OR-03](<../../OWNER_REVIEWS.md#or-03>), [OR-06](<../../OWNER_REVIEWS.md#or-06>) Use the live board/preflight for status, not an approval copied here.
