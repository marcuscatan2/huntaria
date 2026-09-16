# Character art, pose animation and combat feedback

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Draws characters and combat feedback; consumes combat events and exploration movement.

## Entry and responsibility

`CharacterRig.mount / pose / trigger; CombatView.onEvent / draw / impactAudit; BondPresentation.timing`

Simulation events determine damage; visual time determines pose/VFX/HP display. Joining actors are measured before their first visible frame without resetting existing rigs, selection or pending impact cues. Shared rig serves battle, portraits and exploration. All 100 species use supplied PNGs with transform-based motion. Druid, Mage, Hunter and Swordsman use painted 16-pose sheets; Apprentice selects painted dagger/bow action sheets. Character creation, static menus and the Inner Sea use the painted hair/expression atlas with palette tinting. Animated scenes preload and begin on the canonical action-sheet idle frame, never the visibly different creator figure; the same sheet continues through walk/combat and is cached for world return. The retired Apprentice SVG is not loaded. Coverage is not approval. Sound impact callback to BondApp is intentional. Hunter/Swordsman portraits reuse their explicitly clipped sheet idle frame; animated rigs hide replaced HTML/SVG portraits through the DOM hidden attribute; Inner Sea exports receive a cached canvas. NPC appearance routing reserves class art for masters and selects four stable civilian sprites for ordinary people in field, dialogue, previews and combat. Final visual acceptance remains pending. city-art frames nine upright right-facing residents, eight roof-dominant buildings and four roofless room floor plans using measured source boundaries. Native sprite alpha and room aspect ratios are preserved. Generation prompts, project-owned NPC/Hunter references, source hashes, per-frame review and provenance limits are retained in assets/cities/prompts.json; city-perspective-v3 awaits visual acceptance. Residents share the class camera; city buildings and rooms retain overhead scenery. Knight walking uses a separate native-alpha 2x2 sheet; static portraits explicitly clip the idle source rectangle.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [character-rig.js](<../../character-rig.js>) | `CharacterRig` |
| [creature-art.js](<../../creature-art.js>) | `BondCreatureArt` |
| [animation-data.js](<../../animation-data.js>) | `BondAnimationData` |
| [animation-coverage.js](<../../animation-coverage.js>) | `BondAnimationCoverage` |
| [combat-vfx.js](<../../combat-vfx.js>) | `CombatVFX` |
| [presentation-contract.js](<../../presentation-contract.js>) | `BondPresentation` |
| [combat-view.js](<../../combat-view.js>) | `CombatView` |
| [combat.css](<../../combat.css>) | Owned source/configuration; inspect before editing. |
| [reference-scene.js](<../../reference-scene.js>) | `BondReference` |
| [monster-sprites.js](<../../monster-sprites.js>) | `BondMonsterSprites` |
| [scripts/capture_character_reference.py](<../../scripts/capture_character_reference.py>) | Owned source/configuration; inspect before editing. |
| [scripts/monster_sprites.py](<../../scripts/monster_sprites.py>) | Owned source/configuration; inspect before editing. |
| [tests/monster_sprites_check.py](<../../tests/monster_sprites_check.py>) | Owned source/configuration; inspect before editing. |
| [tests/trainer_animation_check.py](<../../tests/trainer_animation_check.py>) | Owned source/configuration; inspect before editing. |
| [city-art.js](<../../city-art.js>) | `BondCityArt` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [experience](<../../features/experience/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>), [world](<../../features/world/README.md>)
- Used by: [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [exploration](<../../features/exploration/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>)

- [combat-feedback](<../../docs/architecture/CONNECTIONS.md#combat-feedback>) (combat → animation): Battle.events -> app renderBattle -> CombatView.onEvent -> timing/rig/VFX. Compare event.time/actor/target with impactAudit before changing simulation timing.
- [world-facing](<../../docs/architecture/CONNECTIONS.md#world-facing>) (exploration → animation): Region movement/follower facing -> shared CharacterRig.pose and CSS facing transform. Verify left and right in world and arena.
- [device-presentation](<../../docs/architecture/CONNECTIONS.md#device-presentation>) (experience → animation): Settings changes invalidate visual preferences only; CombatView sends contact-timed cues. Device preference storage cannot alter battle/profile authority.

Shared shapes: [Combat event: game.js Battle.emit](<../../docs/architecture/CONNECTIONS.md#interface-1>), [View invalidation signals](<../../docs/architecture/CONNECTIONS.md#interface-5>), [Space/time units](<../../docs/architecture/CONNECTIONS.md#interface-6>).

## Diagnose here

- Wrong pose, sliding, missing frames: Check CharacterRig.inspect and CombatView.inspect; compare movement flags and facing before editing art. First owner: [animation](<../../features/animation/README.md>).
- Damage number / sound arrives before impact: Compare Battle.events with CombatView.impactAudit; reduced motion intentionally changes visual delay. First owner: [animation](<../../features/animation/README.md>).
- Sound stuck, duplicate music, settings not retained: Inspect BondAudio lifecycle and BondSettings state; verify impact and scene callers. First owner: [experience](<../../features/experience/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/field_polish_check.py --browser chrome` — Live joined-actor placement/continuity, phone/fast/reduced-motion combat, fixed-lifetime loot, world HP, foliage, escape, persistence failures and ordered replay.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/monster_sprites_check.py --browser chrome` — 100 supplied sprites, workbook identity, unchanged mechanics, shared rendering, poses, facing and save preservation.
- `python tests/trainer_animation_check.py --browser chrome` — All five trainer classes and both Apprentice weapons: pose frames, painted creator, transparency, real Hunter/Swordsman world/combat visibility, keyboard motion, clipped fallbacks, provenance and coverage.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.
- `python tests/city_world_check.py --browser chrome` — Cartesian borders, themed city rooms, arrival healing, physical teleport authority and save failures.
- `python tests/field_encounters_check.py --browser chrome` — All-map tripled populations, pack preview/cancel/challenge/reload/escape and the current-trainer aggression boundary.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [ART_BIBLE.md](<../../ART_BIBLE.md>)
- [CREATURE_DESIGN.md](<../../CREATURE_DESIGN.md>)
- [features/animation/SUPPLIED_SPRITES.md](<../../features/animation/SUPPLIED_SPRITES.md>)
- [features/animation/TRAINER_SPRITES.md](<../../features/animation/TRAINER_SPRITES.md>)
- [assets/characters/README.md](<../../assets/characters/README.md>)
- [features/world/CITIES.md](<../../features/world/CITIES.md>)
- [assets/cities/README.md](<../../assets/cities/README.md>)
- Art and provenance: [assets/art-v6](<../../assets/art-v6>)
- Art and provenance: [assets/art-v8](<../../assets/art-v8>)
- Art and provenance: [assets/art-v9](<../../assets/art-v9>)
- Art and provenance: [assets/art-v10](<../../assets/art-v10>)
- Art and provenance: [assets/art-v16](<../../assets/art-v16>)
- Art and provenance: [assets/art-v21](<../../assets/art-v21>)
- Art and provenance: [assets/art-v22](<../../assets/art-v22>)
- Art and provenance: [assets/monsters](<../../assets/monsters>)
- Art and provenance: [assets/characters](<../../assets/characters>)
- Art and provenance: [assets/cities](<../../assets/cities>)
- Commercial cards: [F-024](<../../FEATURE_BACKLOG.md>), [F-025](<../../FEATURE_BACKLOG.md>), [F-026](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-01](<../../OWNER_REVIEWS.md#or-01>), [OR-04](<../../OWNER_REVIEWS.md#or-04>), [OR-05](<../../OWNER_REVIEWS.md#or-05>), [OR-06](<../../OWNER_REVIEWS.md#or-06>), [OR-09](<../../OWNER_REVIEWS.md#or-09>) Use the live board/preflight for status, not an approval copied here.
