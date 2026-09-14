# Character creation and quiet apprentice opening

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-prototype**. Creates a named apprentice or names an older migrated trainer without resetting it; connects identity, appearance and weapon choice to combat and the first forest.

## Entry and responsibility

`BondCreation.open / required; BondOpening.character / needsIdentity / build / loot; BondProfile.createCharacter / nameCharacter; BondApp.beginOpening`

Fresh profiles require creation; existing profiles retain progress/classes. Solo weapon builds begin at forest camp. One nearby Emberfox attacks after a movement-safe grace period; the first accepted Firstlight Emberfox victory grants the one-time Echo and Lv2 trainer threshold. The in-frame objective highlights Bag, the Brimble Echo and Summon; explicit summoning auto-fills an empty party slot. The Forest Mage then asks for any second companion, runs a deliberately easy protected proof battle, returns immediately to exploration and unlocks the physical exits. Existing pre-gate progressed saves remain ahead. Ordinary Echo odds stay unchanged. Four class demonstrations, Tidecrown, four easy master acceptance battles and a Lv20 confirmed specialization continue the authored route. Hunter and Swordsman are playable specializations. The master fights as its offered class; the player retains the current Apprentice party and confirms after victory at Lv20. Farm establishment joins the route at Lv25.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [opening-rules.js](<../../opening-rules.js>) | `BondOpening` |
| [character-creation.js](<../../character-creation.js>) | `BondCreation` |
| [apprentice-preview.js](<../../apprentice-preview.js>) | `BondApprenticePreview` |
| [opening.css](<../../opening.css>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [combat](<../../features/combat/README.md>), [exploration](<../../features/exploration/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [population](<../../features/population/README.md>), [recovery](<../../features/recovery/README.md>), [shell](<../../features/shell/README.md>)

- [early-progression](<../../docs/architecture/CONNECTIONS.md#early-progression>) (opening → campaign): Accepted first Firstlight Brimble claim -> guaranteed ordinary Echo -> highlighted Bag/Echo/Summon path and auto-party -> Forest Mage meeting -> guaranteed second-role Echo and second summon -> easy Mage proof that opens physical roads -> four recorded class demonstrations -> fixed Tidecrown -> easy master acceptance battle -> Lv20 specialization -> adaptation encounters -> Lv30 monster-tree proof. Trainer XP and monster XP remain independent; UI hints and travel never grant milestones. Four classes are available; explicit farm establishment at Lv25 precedes Amber mastery.
- [created-apprentice](<../../docs/architecture/CONNECTIONS.md#created-apprentice>) (opening → persistence): Fresh path: validated name/palette/weapon -> painted creation preview -> createCharacter atomic local commit at BondOpening.start forest camp -> saved apprentice build and weapon-derived combat. Migration path: an unnamed legacy marker or literal Apprentice placeholder opens a one-time name-only screen -> nameCharacter updates only identity while preserving class/build, appearance, progress, location and encounter; it cannot be repeated. UI cannot create starter items independently.

Shared shapes: [Profile read and command: profile.js](<../../docs/architecture/CONNECTIONS.md#interface-2>), [View invalidation signals](<../../docs/architecture/CONNECTIONS.md#interface-5>).

## Diagnose here

- Creator repeats, wrong name, hair or starter weapon: Check character normalization, BondCreation.required, BondApprenticePreview.inspect, profile commit and weapon-specific build before avatar/UI. Real named profiles skip creation; unnamed legacy saves and literal Apprentice placeholders must complete the non-destructive name-only screen. First owner: [opening](<../../features/opening/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/onboarding_check.py --browser chrome` — Background fights, frozen live builds, world anchors, hostile joins/replay, mixed rewards, level feedback, temporary loot, recovery and opening navigation.
- `python tests/opening_check.py --browser chrome` — Fresh creation, apprentice combat, quiet hunts, pursuit, death, loot/reload, isolated restart/heal safety and narrow-screen UI.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_ui.py --browser chrome` — Played hunt, loot, recovery, atlas and viewport flows.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [features/opening/DESIGN.md](<../../features/opening/DESIGN.md>)
- [features/opening/EARLY_PROGRESSION_SCOPE.md](<../../features/opening/EARLY_PROGRESSION_SCOPE.md>)
- [features/opening/VALIDATION.md](<../../features/opening/VALIDATION.md>)
- [features/opening/PASS26_VALIDATION.md](<../../features/opening/PASS26_VALIDATION.md>)
- [features/opening/PASS27_VALIDATION.md](<../../features/opening/PASS27_VALIDATION.md>)
- [PASS24_VALIDATION.md](<../../PASS24_VALIDATION.md>)
- [features/opening/CLASSES.md](<../../features/opening/CLASSES.md>)
- Commercial cards: [F-029](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-02](<../../OWNER_REVIEWS.md#or-02>), [OR-06](<../../OWNER_REVIEWS.md#or-06>), [OR-09](<../../OWNER_REVIEWS.md#or-09>) Use the live board/preflight for status, not an approval copied here.
