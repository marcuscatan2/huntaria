# Chapters, NPCs, packs and simulated bosses

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Defines quests, NPC encounters and simulated bosses; connects reservations to combat and rewards.

## Entry and responsibility

`BondCampaign.reconcile / bosses; BondCampaignMenu; BondProfile.reserveBattle / restoreBattle`

Campaign definitions feed encounters; profile reserves party/seed/supplies and accepted kills. BondCampaign.questMarker deterministically maps the current receipt-backed objective to `offer`, `delivery` or no marker; presentation does not infer or award quest state. The early route records two acquisitions, a Forest Mage meeting/proof gate, four distinct Druid/Mage/Hunter/Swordsman demonstrations, fixed Lv15 Tidecrown, one rewarded master acceptance battle, confirmed Lv20 specialization, an ability-change/counter loop, fixed Lv30 Amber guardian and monster-tree proof. Authored trainer XP reaches thresholds100/600/1500/6600/10500/19000/30000/43500 without repeat grinding; monster XP remains separate. One tiny in-frame current objective and its destination region/map guide the opening; the Mage proof is the only opening road lock and later levels communicate danger without invisible gates. Launch story trainers clamp to the Lv60 player ceiling while preserving sourceLevel. Practice boss scaling is reward-free and separate from progression bosses; no human multiplayer or essence source exists. Hunter and Swordsman are playable specializations. The master fights as its offered class; the player retains the current Apprentice party and confirms after victory at Lv20. Farm establishment joins the route at Lv25. Class masters occupy matching starting-city courtyards; the quest destination after acceptance follows the defeated master’s city. Trial/reward IDs and battle kits are unchanged. The current main quest continues immediately after class ascension: an alarm conversation and guaranteed Lv100 master rescue against three Lv60 enemies, a bounded Echo hand-in, active-party Casketot communication with Tully atop four ghost-tower floors, then one class-specific inventory weapon. The final tracker ends here; old regional and Amber lessons remain optional. relic-quest.js owns the stage rules and relic-quest-view.js displays profile-owned actions. Tidecrown completion presents four class portraits and city directions. NPC class tests require an explicit class choice followed by Ok; ascension has its own in-frame confirmation.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [campaign.js](<../../campaign.js>) | `BondCampaign` |
| [campaign-menu.js](<../../campaign-menu.js>) | `BondCampaignMenu` |
| [campaign.css](<../../campaign.css>) | Owned source/configuration; inspect before editing. |
| [relic-quest.js](<../../relic-quest.js>) | `BondRelicQuest` |
| [relic-quest-view.js](<../../relic-quest-view.js>) | `BondRelicView` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [exploration](<../../features/exploration/README.md>), [growth](<../../features/growth/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)
- Used by: [combat](<../../features/combat/README.md>), [exploration](<../../features/exploration/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>)

- [campaign-encounter](<../../docs/architecture/CONNECTIONS.md#campaign-encounter>) (campaign → combat): Authored encounter -> requirement check -> saved temporary/fixed build and seed -> simulator -> accepted trainer/companion rewards and milestone reconciliation. Progression bosses use fixed levels; simulated practice parties never grant real acquisition.
- [early-progression](<../../docs/architecture/CONNECTIONS.md#early-progression>) (opening → campaign): Accepted first Firstlight Brimble claim -> guaranteed ordinary Echo -> highlighted Bag/Echo/Summon path and auto-party -> Forest Mage meeting -> guaranteed second-role Echo and second summon -> easy Mage proof that opens physical roads -> four recorded class demonstrations -> fixed Tidecrown -> easy master acceptance battle -> Lv20 specialization -> adaptation encounters -> Lv30 monster-tree proof. Trainer XP and monster XP remain independent; UI hints and travel never grant milestones. Four classes are available; explicit farm establishment at Lv25 precedes Amber mastery.

Shared shapes: [Profile read and command: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-2>), [Spawn life / reservation: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-4>).

## Diagnose here

- Quest not advancing / pack replay wrong: Inspect reconciliation and accepted per-kill/completion receipt; preserve saved rules inputs. First owner: [campaign](<../../features/campaign/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/field_polish_check.py --browser chrome` — Fixed-lifetime loot under focus/hover, thin live world HP, foliage isolation, timed escape, pursuit damage, persistence failures and ordered replay.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.
- `python tests/city_world_check.py --browser chrome` — Cartesian borders, themed city rooms, arrival healing, physical teleport authority and save failures.
- `python tests/relic_quest_check.py --browser chrome` — Four-class guaranteed rescue, saved replay, atomic Echo delivery, ghost party condition, connected tower floors and one-time class weapon reward.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [features/opening/EARLY_PROGRESSION_SCOPE.md](<../../features/opening/EARLY_PROGRESSION_SCOPE.md>)
- [features/opening/VALIDATION.md](<../../features/opening/VALIDATION.md>)
- [features/world/CITIES.md](<../../features/world/CITIES.md>)
- [features/campaign/SACRED_TREASURES.md](<../../features/campaign/SACRED_TREASURES.md>)
- Commercial cards: [F-019](<../../FEATURE_BACKLOG.md>), [F-020](<../../FEATURE_BACKLOG.md>), [F-021](<../../FEATURE_BACKLOG.md>), [F-022](<../../FEATURE_BACKLOG.md>), [F-023](<../../FEATURE_BACKLOG.md>), [F-062](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-02](<../../OWNER_REVIEWS.md#or-02>), [OR-03](<../../OWNER_REVIEWS.md#or-03>), [OR-08](<../../OWNER_REVIEWS.md#or-08>) Use the live board/preflight for status, not an approval copied here.
