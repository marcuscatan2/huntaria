# Local profile, migrations and operation receipts

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-only**. Owns local saves, migrations and receipts; accepts mutations requested by gameplay and UI.

## Entry and responsibility

`BondProfile.commit (private); normalize / reserveBattle / checkpoint / restoreBattle / settleKills / complete / summon`

Owns local profile commands, migration, independent trainerXP/companion XP, early milestone state including Forest Mage meeting/gate, spawn-life reservations and idempotent receipts. Owned active XP is capped at Lv60; normalization initializes trainerXP from the previously displayed migrated level, preserves older excess as deferredXP and records Lv61–100 Echo sourceLevel. Intro/second-choice guarantees, Mage gate, trainer rewards, trial credit and specialization mutate only through accepted commands/receipts. Existing saves from before the Mage fields that already summoned two companions keep their forward progress. Saved encounters freeze the deployed living party/options, world anchor and tick-stamped joins; the saved loadout remains unchanged when a fallen companion is benched. Wild claims and authored NPC rewards settle separately; storage failures must not discard fights or double-pay. Escape preserves command order and never triggers defeat rescue. Missing required modules abort before reading or writing a save. City arrivals and waystone teleports are critical save transactions: validate proximity, opening gate, allowed destination and encounter exclusion before changing location or healing; failure preserves origin and possessions. Normalized journey.relic stages and critical nearby relicAction transactions own Echo delivery and the one-time class weapon. Rescue settlement restores vitality and advances the story atomically; no raid Echo or repeat loot is issued. Border transitions optionally accept the current walked position, validate finite coordinates/collision/proximity and commit arrival atomically; exploration does not issue a separate position write before this critical save.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [profile.js](<../../profile.js>) | `BondProfile` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [growth](<../../features/growth/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [population](<../../features/population/README.md>), [recovery](<../../features/recovery/README.md>), [world](<../../features/world/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [experience](<../../features/experience/README.md>), [exploration](<../../features/exploration/README.md>), [growth](<../../features/growth/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>)

- [encounter-settlement](<../../docs/architecture/CONNECTIONS.md#encounter-settlement>) (combat → persistence): reserveBattle -> seeded Battle -> settleKills/checkpoint -> complete -> map/loot. A returned popup is not a receipt; retries must not pay twice.
- [spawn-reservation](<../../docs/architecture/CONNECTIONS.md#spawn-reservation>) (population → persistence): Quota and placement policy -> persisted life/seed/roll/position -> reserved encounter. Map reload/build edits cannot reroll an accepted life.
- [owned-build](<../../docs/architecture/CONNECTIONS.md#owned-build>) (party → persistence): Visual picker chooses instance ID; migrateParty/setSkills validates ownership; bond-growth invalidates stale builds while preserving reservations.
- [echo-to-individual](<../../docs/architecture/CONNECTIONS.md#echo-to-individual>) (collection → persistence): Echo item/receipt -> profile.summon -> consume one Echo and create one instance atomically locally -> refresh collection and picker.
- [injury-and-supplies](<../../docs/architecture/CONNECTIONS.md#injury-and-supplies>) (recovery → persistence): Battle injury ratios -> checkpoint/complete -> vitality. Firstlight defeat records campRecovery and full camp revival; later defeats rescue to regional town with injuries. Before a new adventure, deploy removes selected zero-HP companions from the encounter copy but never from the saved loadout; trainer health remains the readiness gate. Buy/recover/rest validate proximity, resources and no active reservation; forest camp is a real rest service.
- [created-apprentice](<../../docs/architecture/CONNECTIONS.md#created-apprentice>) (opening → persistence): Fresh path: validated name/palette/weapon -> painted creation preview -> createCharacter atomic local commit at BondOpening.start forest camp -> saved apprentice build and weapon-derived combat. Migration path: an unnamed legacy marker or literal Apprentice placeholder opens a one-time name-only screen -> nameCharacter updates only identity while preserving class/build, appearance, progress, location and encounter; it cannot be repeated. UI cannot create starter items independently.
- [territorial-encounter](<../../docs/architecture/CONNECTIONS.md#territorial-encounter>) (exploration → persistence): Every roaming species attacks outside Firstlight at every player level. Notice -> warning -> chase/contact -> reserve existing spawn life. Firstlight residents stay passive and accept clicked hunts. With an active fight, joinBattle saves entry and tick before Battle.addEnemy. In-game tabs/modals do not pause active-fight pursuit; explicit Pause/browser-hidden does. Leash and line of sight apply. No visual reward authority. A clicked wild target stays selected while it moves; approach routes update and contact is checked even when the player has stopped moving.
- [haven-layout](<../../docs/architecture/CONNECTIONS.md#haven-layout>) (inner-sea → persistence): Owned progress validates three decoration sockets and legacy selections; pure farm rules separately compute training, strongest-species power, daily defenses and habitat residents. Profile settles timestamps, XP, repairs and rewards atomically. Drafts, export and defense replay cannot grant rewards.
- [city-travel](<../../docs/architecture/CONNECTIONS.md#city-travel>) (world → persistence): Authored doorway/waystone positions authorize proximity-bound room/service interactions and critical city teleport transactions. Arrival heals all owned lives; failed saves retain location/resources; atlas selection only plans physical walking.

Shared shapes: [Profile read and command: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-2>), [Individual: progression.js / profile.js](<../../docs/architecture/CONNECTIONS.md#interface-3>), [Spawn life / reservation: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-4>), [View invalidation signals](<../../docs/architecture/CONNECTIONS.md#interface-5>).

## Diagnose here

- Duplicate/lost loot, Echo or replay rewards: Inspect life/ticket/claim IDs and command result; do not fix only the popup. First owner: [persistence](<../../features/persistence/README.md>).
- Same-species copies overwrite each other: Trace individual IDs through picker, saved skills, ranks and battle build. First owner: [party](<../../features/party/README.md>).
- Monster respawns beside the kill or rerolls: Check reserved life and map-wide selected slot before changing delays. First owner: [population](<../../features/population/README.md>).
- Switching builds heals / recovery not working: Check vitality, active reservation, service proximity and accepted storage write. First owner: [recovery](<../../features/recovery/README.md>).
- Creator repeats, wrong name, hair or starter weapon: Check character normalization, BondCreation.required, BondApprenticePreview.inspect, profile commit and weapon-specific build before avatar/UI. Real named profiles skip creation; unnamed legacy saves and literal Apprentice placeholders must complete the non-destructive name-only screen. First owner: [opening](<../../features/opening/README.md>).
- Creature attacks through a wall or while a menu is open: Check line of sight, warning/leash, modal pause and same spawn-life reservation. First owner: [exploration](<../../features/exploration/README.md>).
- Wrong displayed companion, lost decoration or failed picture export: Check draft versus profile.haven, eligibility and canvas readiness before changing profile data. First owner: [inner-sea](<../../features/inner-sea/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/field_polish_check.py --browser chrome` — Live joined-actor placement/continuity, phone/fast/reduced-motion combat, fixed-lifetime loot, world HP, foliage, escape, persistence failures and ordered replay.
- `python tests/onboarding_check.py --browser chrome` — Background fights, frozen live builds, world anchors, hostile joins/replay, mixed rewards, level feedback, temporary loot, recovery and opening navigation.
- `python tests/opening_check.py --browser chrome` — Fresh creation, apprentice combat, quiet hunts, pursuit, death, loot/reload, isolated restart/heal safety and narrow-screen UI.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/experience_check.py --browser chrome` — Preferences/audio lifecycle, owned scene drafting/persistence, PNG export and responsive input.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.
- `python tests/city_world_check.py --browser chrome` — Cartesian borders, themed city rooms, arrival healing, physical teleport authority and save failures.
- `python tests/field_encounters_check.py --browser chrome` — All-map tripled populations, pack preview/cancel/challenge/reload/escape and the current-trainer aggression boundary.
- `python tests/relic_quest_check.py --browser chrome` — Four-class guaranteed rescue, saved replay, atomic Echo delivery, ghost party condition, connected tower floors and one-time class weapon reward.
- `python tests/landscapes_check.py --browser chrome` — Forty map profiles, seamless ground patches, reachable services, destination-specific passage taps/walking, lock/save retry, stairs, asset recovery, phone touch and bounded landscape caches.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [features/persistence/SAVES.md](<../../features/persistence/SAVES.md>)
- [docs/ENGINEERING.md](<../../docs/ENGINEERING.md>)
- [features/world/CITIES.md](<../../features/world/CITIES.md>)
- [features/campaign/SACRED_TREASURES.md](<../../features/campaign/SACRED_TREASURES.md>)
- Commercial cards: Cross-cutting implementation; no separate acceptance card.
- Owner review routes: [OR-08](<../../OWNER_REVIEWS.md#or-08>), [OR-11](<../../OWNER_REVIEWS.md#or-11>) Use the live board/preflight for status, not an approval copied here.
