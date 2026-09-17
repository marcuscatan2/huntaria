# Deterministic simulation and damage rules

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local**. Simulates targeting, damage and outcomes; sends events to animation and results to persistence.

## Entry and responsibility

`BondGame.Battle.step / emit / run; BondRules`

Owns targeting, range, HP, damage, cooldowns, encounter outcomes and seeded randomness. Adventure wilds scale by deployed player-party size: 1/1.8/2.6× HP and 1/1.15/1.3× offense for one/two/three player actors; trainer-only opening values remain intact. Trusted authored opponent entries may apply bounded power, skill and health tuning; player-side entries cannot supply those modifiers. 20-Hz simulation uses arena units, never CSS pixels or wall-clock RNG. Shared browser/Node generated corpus verifies canonical outcomes; offline probe is not a live authoritative server. Explicit escape runs for60 ticks: trainers stop acting and retreat, companions cover, enemies may pursue the trainer using ordinary attack rules. Death/victory precede escape settlement. Explicit defenders mode accepts one to five owned monster individuals, removes trainer actors, protects allied monsters with Guard, and ends on total side defeat; normal adventure builds retain their trainer objective. The class rescue uses two raiders, a boss and a Lv100 master; old seven-enemy reservations remain accepted. raid-rules.js guarantees player-party defeat at 8 seconds and the master's victory by 14 seconds; saved tick replay uses the same deterministic choreography. Normal attacks choose the closest living enemy, including trainers; explicit skills can override this target. training.js configures a stationary neutral dummy and optional two-second party damage pulses. Training lasts 30 simulation seconds, prevents defeat, skips overtime and reports event-based DPS, effective healing and newly granted shield rates by party and individual. combat-effects.js applies 5% physical crit at 1.4x after accuracy, named shields capped at 25% HP, one post-shield interceptor capped at 35%, and nonrecursive delayed loss. combat-entities.js keeps finite summons outside encounter/reward actors. combat-passives.js and combat-talents.js own event triggers; class talents load from each trainer owner profile at battle initialization. Saved encounters pin the class-tree rules version; pre-migration fights retain their legacy class bonuses until settlement. companion-talents.js supplies explicit handlers for all 100 species trees. Shared shield reservoirs obey every recipient's 25% HP allowance and count one granted amount in metrics. Proc packets do not recursively trigger direct-hit talents; rolling caps, owner death, one-use effects and temporary entity lifetimes use simulation time. New encounters pin monsterRules=1; old reservations without the marker use version0 linear stats and generic mastery through replay. Equipment rules pin separate frozen loadouts; named buffs refresh and item-generated events cannot recursively trigger item effects. Equipment rates multiply basic attacks per second. Core-party effects exclude temporary entities and story masters.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [game.js](<../../game.js>) | `BondGame` |
| [rules.js](<../../rules.js>) | `BondRules` |
| [scripts/simulator.cjs](<../../scripts/simulator.cjs>) | Owned source/configuration; inspect before editing. |
| [data/simulator-modules.json](<../../data/simulator-modules.json>) | Owned source/configuration; inspect before editing. |
| [tests/runtime_cases.js](<../../tests/runtime_cases.js>) | Owned source/configuration; inspect before editing. |
| [tests/runtime_check.py](<../../tests/runtime_check.py>) | Owned source/configuration; inspect before editing. |
| [raid-rules.js](<../../raid-rules.js>) | `BondRaidRules` |
| [training.js](<../../training.js>) | `BondTraining` |
| [combat-effects.js](<../../combat-effects.js>) | `BondCombatEffects` |
| [combat-entities.js](<../../combat-entities.js>) | `BondCombatEntities` |
| [combat-passives.js](<../../combat-passives.js>) | `BondCombatPassives` |
| [combat-talents.js](<../../combat-talents.js>) | `BondClassTalents` |
| [tests/combat_workbooks_cases.js](<../../tests/combat_workbooks_cases.js>) | Owned source/configuration; inspect before editing. |
| [tests/combat_workbooks_check.cjs](<../../tests/combat_workbooks_check.cjs>) | Owned source/configuration; inspect before editing. |
| [tests/combat_workbooks_check.py](<../../tests/combat_workbooks_check.py>) | Owned source/configuration; inspect before editing. |
| [companion-talents.js](<../../companion-talents.js>) | `BondCompanionTalents` |
| [combat-hooks.js](<../../combat-hooks.js>) | `BondCombatHooks` |
| [equipment-effects.js](<../../equipment-effects.js>) | `BondEquipmentEffects` |
| [equipment-passives.js](<../../equipment-passives.js>) | Owned source/configuration; inspect before editing. |
| [held-passives.js](<../../held-passives.js>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [content](<../../features/content/README.md>), [growth](<../../features/growth/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [recovery](<../../features/recovery/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [content](<../../features/content/README.md>), [exploration](<../../features/exploration/README.md>), [growth](<../../features/growth/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>)

- [combat-feedback](<../../docs/architecture/CONNECTIONS.md#combat-feedback>) (combat → animation): Battle.events -> app renderBattle -> CombatView.onEvent -> timing/rig/VFX. Compare event.time/actor/target with impactAudit before changing simulation timing.
- [encounter-settlement](<../../docs/architecture/CONNECTIONS.md#encounter-settlement>) (combat → persistence): reserveBattle -> seeded Battle -> settleKills/checkpoint -> complete -> map/loot. A returned popup is not a receipt; retries must not pay twice.
- [derived-stats](<../../docs/architecture/CONNECTIONS.md#derived-stats>) (growth → combat): Profile snapshot + species bases + individual XP/ranks + formation -> battle initialization. UI preview must use the same derived formulas.
- [campaign-encounter](<../../docs/architecture/CONNECTIONS.md#campaign-encounter>) (campaign → combat): Authored encounter -> requirement check -> saved temporary/fixed build and seed -> simulator -> accepted trainer/companion rewards and milestone reconciliation. Progression bosses use fixed levels; simulated practice parties never grant real acquisition.
- [farm-defense](<../../docs/architecture/CONNECTIONS.md#farm-defense>) (inner-sea → combat): Explicit UTC phase/attack timestamp + saved five-individual defense loadout -> trainer-free deterministic Battle -> one committed XP/loot/damage outcome and read-only replay. Profile owns clock and storage; ordinary adventures use frozen profile snapshots.

Shared shapes: [Combat event: game.js Battle.emit](<../../docs/architecture/CONNECTIONS.md#interface-1>), [Individual: progression.js / profile.js](<../../docs/architecture/CONNECTIONS.md#interface-3>), [Spawn life / reservation: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-4>), [Space/time units](<../../docs/architecture/CONNECTIONS.md#interface-6>).

## Diagnose here

- Damage number / sound arrives before impact: Compare Battle.events with CombatView.impactAudit; reduced motion intentionally changes visual delay. First owner: [animation](<../../features/animation/README.md>).
- Wrong target, reach, damage or cooldown: Reproduce seeded Battle without rendering; inspect profile-derived factors and explicit target exceptions. First owner: [combat](<../../features/combat/README.md>).
- Duplicate/lost loot, Echo or replay rewards: Inspect life/ticket/claim IDs and command result; do not fix only the popup. First owner: [persistence](<../../features/persistence/README.md>).
- Quest not advancing / pack replay wrong: Inspect reconciliation and accepted per-kill/completion receipt; preserve saved rules inputs. First owner: [campaign](<../../features/campaign/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/field_polish_check.py --browser chrome` — Live joined-actor placement/continuity, phone/fast/reduced-motion combat, fixed-lifetime loot, world HP, foliage, escape, persistence failures and ordered replay.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/runtime_check.py --browser chrome` — 1,000 canonical Chrome/Edge versus Node battles and local replay CPU.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.
- `python tests/relic_quest_check.py --browser chrome` — Four-class guaranteed rescue, saved replay, atomic Echo delivery, ghost party condition, connected tower floors and one-time class weapon reward.
- `python tests/player_experience_check.py --browser chrome` — Concise player copy, Inner Sea/class-tree routing, dummy DPS/healing/shield rates, save isolation, responsive reports and one-time NPC victory return.
- `python tests/combat_workbooks_check.py --browser chrome` — Imported workbook integrity, shield/guardian/debt/critical/entity contracts, all proposed loadouts and responsive summon presentation.
- `python tests/monster_progression_check.py --browser chrome` — Exact 10,000-row CSV stats, 100 talent kits, quest budgets, shared shields, effect regressions, legacy/current encounter replay and responsive individual trees.
- `python tests/equipment_ui_check.py --browser chrome` — All 200 item loadouts, independent drops, ownership, effect contracts, frozen combat gear, failed-save rollback and phone equipment menus.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [Companion stats.md](<../../Companion stats.md>)
- [features/combat/RUNTIME.md](<../../features/combat/RUNTIME.md>)
- [features/campaign/SACRED_TREASURES.md](<../../features/campaign/SACRED_TREASURES.md>)
- [features/combat/TRAINING.md](<../../features/combat/TRAINING.md>)
- [features/content/COMBAT_WORKBOOKS.md](<../../features/content/COMBAT_WORKBOOKS.md>)
- [features/collection/EQUIPMENT.md](<../../features/collection/EQUIPMENT.md>)
- Commercial cards: [F-001](<../../FEATURE_BACKLOG.md>), [F-002](<../../FEATURE_BACKLOG.md>), [F-004](<../../FEATURE_BACKLOG.md>), [F-007](<../../FEATURE_BACKLOG.md>), [F-036](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-02](<../../OWNER_REVIEWS.md#or-02>), [OR-04](<../../OWNER_REVIEWS.md#or-04>), [OR-08](<../../OWNER_REVIEWS.md#or-08>), [OR-09](<../../OWNER_REVIEWS.md#or-09>) Use the live board/preflight for status, not an approval copied here.
