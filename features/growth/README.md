# Levels, attributes, Leadership and passive trees

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local**. Derives levels, attributes and passive bonuses; connects individual progress to combat and menus.

## Entry and responsibility

`BondProgress.derived / trainerLevel; BondGrowth.nodes / stats; BondTree`

Trainer and companion XP are independent values on the same cumulative curve, with a hard player launch cap60; no owned monster sets trainer level. The engine/wild curve remains valid through100. Lv61–100 Echoes summon as Lv60 individuals while preserving sourceLevel; migration initializes trainerXP at the previously displayed level and preserves older tree access. All four classes unlock 15 class-specific talents at transformation. The class budget starts with two points at Lv20 and adds one every three levels through Lv59, capped at15. Normalization resets old class ranks into this budget and preserves valid new allocations; companion trees use the owner-requested delayed point schedule. Talent branches have ranked prerequisites; trainer resets are free and companion resets cost one matching Echo at a city NPC. Each companion unlocks its 24-node species tree at individual Lv31: three branches of eight one-point talents, at most one capstone. Thirteen level points arrive at31,34,36,39,41,44,46,48,51,53,56,58,60; Tidecrown and the completed relic quest add one each, capped at15. Quest points also wait until31 and apply to existing and future companions. No talent badge or spending is available through30. Retired generic companion ranks refund; valid allocations beyond the new budget persist in deferredGrowth and automatically reactivate within the earned budget. City resets clear active and deferred ranks. Monster intrinsic attributes, final HP, physical ATK and hard physical DEF come from the exact level CSV rows; INT derives spell power, and Leadership contributes only the additional stat/HP delta. Classic/pre-Renewal STR/DEX stat ATK, INT MATK ranges, HIT/FLEE, VIT HP/recovery/soft defense and AGI/DEX attack delay use progression.js. DEX cast-time scaling is separate from cooldowns; only explicit tree/skill effects reduce cooldowns, capped at50%. Leadership sharing remains custom. Intact farm power adds capped account HP once, never to enemies. XP losses preserve already-earned individual tree budgets via optional treeLevel. Trainer and companion diagrams show opening-to-fork, alternative fork-to-advanced and advanced-to-capstone connections; point and rank gates stay authoritative in class-trees.js. Selection never allocates a point. Desktop uses a side inspector; phone branches and modal details retain touch targets and keyboard focus. Apprentice training has six three-rank talents in three two-node chains. One point per trainer level from1 through18 caps at18: +12% damage, +18% HP and +6 personal AGI. Second nodes require first-node rank3. Training is active and spendable only before class choice; archived ranks do not affect class budgets, stats or Leadership sharing. Companion move knowledge follows companion-moves.js: one signature plus two basics at acquisition, spaced signature/basic unlocks through48 and General move tutors. Earned moves survive XP loss; legacy equipped moves remain known. Class specialization refunds all trainer attributes.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [progression.js](<../../progression.js>) | `BondProgress` |
| [growth.js](<../../growth.js>) | `BondGrowth` |
| [tree-menu.js](<../../tree-menu.js>) | `BondTree` |
| [progression.css](<../../progression.css>) | Owned source/configuration; inspect before editing. |
| [pass13.css](<../../pass13.css>) | Owned source/configuration; inspect before editing. |
| [class-trees.js](<../../class-trees.js>) | `BondClassTrees` |
| [talent-tree-view.js](<../../talent-tree-view.js>) | `BondTalentView` |
| [talent-tree.css](<../../talent-tree.css>) | Owned source/configuration; inspect before editing. |
| [assets/talents/manifest.json](<../../assets/talents/manifest.json>) | Owned source/configuration; inspect before editing. |
| [companion-trees.js](<../../companion-trees.js>) | `BondCompanionTrees` |
| [tests/monster_progression_check.cjs](<../../tests/monster_progression_check.cjs>) | Owned source/configuration; inspect before editing. |
| [tests/monster_progression_check.py](<../../tests/monster_progression_check.py>) | Owned source/configuration; inspect before editing. |
| [apprentice-tree.js](<../../apprentice-tree.js>) | `BondApprenticeTree` |
| [tests/apprentice_tree_check.cjs](<../../tests/apprentice_tree_check.cjs>) | Owned source/configuration; inspect before editing. |
| [tests/apprentice_tree_check.py](<../../tests/apprentice_tree_check.py>) | Owned source/configuration; inspect before editing. |
| [companion-moves.js](<../../companion-moves.js>) | `BondCompanionMoves` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [content](<../../features/content/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>)
- Used by: [campaign](<../../features/campaign/README.md>), [collection](<../../features/collection/README.md>), [combat](<../../features/combat/README.md>), [exploration](<../../features/exploration/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [recovery](<../../features/recovery/README.md>)

- [derived-stats](<../../docs/architecture/CONNECTIONS.md#derived-stats>) (growth → combat): Profile snapshot + species bases + individual XP/ranks + formation -> battle initialization. UI preview must use the same derived formulas.

Shared shapes: [Individual: progression.js / profile.js](<../../docs/architecture/CONNECTIONS.md#interface-3>).

## Diagnose here

- Wrong target, reach, damage or cooldown: Reproduce seeded Battle without rendering; inspect profile-derived factors and explicit target exceptions. First owner: [combat](<../../features/combat/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/onboarding_check.py --browser chrome` — Background fights, frozen live builds, world anchors, hostile joins/replay, mixed rewards, level feedback, temporary loot, recovery and opening navigation.
- `python tests/pass18_check.py --browser chrome` — Current mechanics, population/progression/receipt regressions and content export.
- `python tests/pass18_campaign.py --browser chrome` — Current campaign/replay assertions (reuses pass16_cases.js).
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.
- `python tests/combat_workbooks_check.py --browser chrome` — Imported workbook integrity, shield/guardian/debt/critical/entity contracts, all proposed loadouts and responsive summon presentation.
- `python tests/talent_tree_check.py --browser chrome` — All four illustrated talent graphs, authoritative unlock lines, inspect-versus-learn behavior, responsive geometry, mobile dialog focus and save isolation.
- `python tests/monster_progression_check.py --browser chrome` — Exact 10,000-row CSV stats, 100 talent kits, quest budgets, shared shields, effect regressions, legacy/current encounter replay and responsive individual trees.
- `python tests/menu_upgrades_check.py --browser chrome` — Read-only upgrade routes, independent trainer/companion level-ups, affordable points, individual pagination, purchases, resets, reload and responsive shared SVG navigation.
- `python tests/equipment_ui_check.py --browser chrome` — All 200 item loadouts, independent drops, ownership, effect contracts, frozen combat gear, failed-save rollback and phone equipment menus.
- `python tests/apprentice_tree_check.py --browser chrome` — Apprentice level18 completion, personal combat bonuses, four class transitions, frozen replay, atomic saves, badges and responsive illustrated paths.
- `python tests/companion_services_check.py --browser chrome` — Companion move unlocks, tutor and Echo reset transactions, class attribute refunds, duplicate prevention, responsive navigation and held badges.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [Companion stats.md](<../../Companion stats.md>)
- [features/opening/VALIDATION.md](<../../features/opening/VALIDATION.md>)
- [features/content/COMBAT_WORKBOOKS.md](<../../features/content/COMBAT_WORKBOOKS.md>)
- [features/growth/TALENT_TREE.md](<../../features/growth/TALENT_TREE.md>)
- [features/growth/COMPANION_TREES.md](<../../features/growth/COMPANION_TREES.md>)
- [features/collection/EQUIPMENT.md](<../../features/collection/EQUIPMENT.md>)
- [features/growth/COMPANION_MOVES.md](<../../features/growth/COMPANION_MOVES.md>)
- Art and provenance: [assets/talents](<../../assets/talents>)
- Commercial cards: [F-003](<../../FEATURE_BACKLOG.md>), [F-009](<../../FEATURE_BACKLOG.md>), [F-010](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-02](<../../OWNER_REVIEWS.md#or-02>), [OR-07](<../../OWNER_REVIEWS.md#or-07>) Use the live board/preflight for status, not an approval copied here.
