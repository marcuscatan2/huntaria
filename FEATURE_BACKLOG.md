# Commercial scope v2 — Feature backlog

> Current prototype override — Patch20 (2026-09-13): all configured Echo chances
> are **15% for testing**, with faster wild levels/XP and persistent injuries.
> The visual World Atlas, direct information signs, physical Supply Store and
> free village recovery, the player cap60/engine curve100 boundary, open roads,
> six boss domains and Sheet-backed creature placement are implemented locally.
> See [current playtest walkthrough](<features/opening/VALIDATION.md>).
> The10% /0.01% figures elsewhere remain **release proposals**, not live test odds.
> This does not accept any commercial criterion or implement online boss loot.


Status: **Local implementations are not commercial acceptance.**
See the [current implementation scope](features/delivery/REMAINING_SCOPE.md)
for delivered work and remaining decisions.

There are **66 feature cards: 64 P0, two optional P1, 264 acceptance criteria**.
F-001 through F-057 retain their identifiers; v2 criteria supersede v1.
F-058 through F-066 add the expanded systems. Superseded plans and pass reports
are retained in Git history, not as additional active requirements.

Read with [scope](<Commercial MVP scope.md>), [validation plan](VALIDATION_PLAN.md)
and [traceability](FEATURE_TRACEABILITY.md). Current runtime ownership and checks
are routed through [FEATURE_MAP](FEATURE_MAP.md).

## Release contract

- At least 100 distinct summonable species; planning allocation 94 wild and six boss species. Four trainer classes, five skills/three equipped each, one innate per species, 18 passive nodes per character type.
- Planning baseline: 24 large maps across six regions, six compact hubs. Large maps must take at least 30 seconds to cross at base walking speed; target 45–90 seconds. Hubs are exempt.
- Trainer can begin alone. Starter Echo drops: 10%. Designated mid/late Echoes and every very-rare drop: 0.01%. A legal Echo summon: 100%. No pity or second summoning roll.
- Two–three-player optional boss fights; one 0.01% group essence roll on every eligible victory. Boss essences are extremely rare but have no server-wide copy limit; previous drops/ownership/summons do not change the chance.
- F2P, cosmetics only. No trading, paid luck, full shared open-world presence or PvP. GN-001 account buffs and GN-002 evolution remain stashed.
- The earlier small-MVP timeline and budget are withdrawn; F-066 rebaselines the larger release. A smaller free pilot is allowed but does not satisfy the commercial roster/world floor.

## Delivery and evidence

M0 locks rules, atlas and a bounded technical spike. M1 proves the trainer-alone hunt → Echo → Inner Sea → prepared battle reference. M2 produces world/roster/story batches. M3 builds online authority and cooperative rooms; its prototypes can run alongside M1/M2. M4 integrates commerce and cosmetics. M5 completes content, testing, operations and release decisions. Labels are workstreams, not a promise to build all art before proving networking.

Dependencies identify blocking implementation inputs, not permission to skip a feature referenced in a criterion. Cross-system acceptance requires all referenced systems and final-scale regression even where that would make a dependency graph cyclic. No P0 can be silently downgraded to keep the old estimate.

Each criterion starts unchecked. Allowed evidence states: Planned, In progress, Implemented/unverified, Verified technically, Accepted, Blocked. Only a named reviewer may mark acceptance after the required protocols pass on a pinned build. Missing accounts, devices, outside participants, money or approvals remain missing evidence—not a simulated pass.

Accountability labels allocate future work; they do not spawn agents or authorize external actions. Use one implementation agent unless the owner changes that instruction.

## Feature index

| Feature | Priority | Workstream | Title |
| --- | --- | --- | --- |
| [F-001](#f-001) | P0 | M0 | Explicit damage categories and STR / DEX / INT |
| [F-002](#f-002) | P0 | M0 | Speed, accuracy, tiny dodge and VIT regeneration |
| [F-003](#f-003) | P0 | M0 | Trainer allocation, Leadership and stat previews |
| [F-004](#f-004) | P0 | M0 | Automatic combat with trainer-only, party and group modes |
| [F-005](#f-005) | P0 | M1 | Party selection, three-skill priorities and formation |
| [F-006](#f-006) | P0 | M0 | 100-species roster, skill and passive content contract |
| [F-007](#f-007) | P0 | M1 | Four elements, statuses, shields and guard |
| [F-008](#f-008) | P0 | M1 | Battle controls, inspection and actionable results |
| [F-009](#f-009) | P0 | M2 | Progression for early, middle and late world regions |
| [F-010](#f-010) | P0 | M2 | Eighteen-node ranked mastery trees |
| [F-011](#f-011) | P0 | M2 | Earned economy, per-kill loot and empty-supply recovery |
| [F-012](#f-012) | P0 | M1 | Inventory, consumables and item-use UX |
| [F-013](#f-013) | P0 | M2 | 100-species collection and habitat discovery |
| [F-014](#f-014) | P0 | M1 | Soul Echo drop and guaranteed Inner Sea summoning |
| [F-015](#f-015) | P0 | M1 | Trainer-alone first hunt and honest rarity tutorial |
| [F-016](#f-016) | P0 | M1 | Large-map traversal, local hubs and world transitions |
| [F-017](#f-017) | P0 | M1–M2 | Spatial entrances linking actual field, forest and cave maps |
| [F-018](#f-018) | P0 | M2 | Explorable cave/forest habitats and return persistence |
| [F-019](#f-019) | P0 | M2 | Six-region progression chapters and an accessible main ending |
| [F-020](#f-020) | P0 | M2 | Sixty authored trainer and faction compositions |
| [F-021](#f-021) | P0 | M2 | Twelve pack encounter templates across the world |
| [F-022](#f-022) | P0 | M2 | Six rare group bosses, phases and reward-free practice |
| [F-023](#f-023) | P0 | M2 | Optional regional mastery and group-hunt challenges |
| [F-024](#f-024) | P0 | M1 | Art bible and approved reference encounter |
| [F-025](#f-025) | P0 | M2 | Animation for 100 species and both trainer classes |
| [F-026](#f-026) | P0 | M2 | Impact-synchronized VFX and combat feedback |
| [F-027](#f-027) | P0 | M2 | Six-region world, cave and Inner Sea art |
| [F-028](#f-028) | P0 | M2 | Music, sound effects and audio controls |
| [F-029](#f-029) | P0 | M1–M2 | Onboarding and coherent menu navigation |
| [F-030](#f-030) | P0 | M5 | Accessibility and input/settings quality |
| [F-031](#f-031) | P0 | M2 | Inner Sea farm, daily defense and local screenshot export |
| [F-032](#f-032) | P0 | M4 | Appearance ownership, equipment and earned cosmetics |
| [F-033](#f-033) | P0 | M4 | Eight-product catalog and real previews |
| [F-034](#f-034) | P0 | M0–M3 | Versioned client build and runtime asset pipeline |
| [F-035](#f-035) | P0 | M5 | Supported-device performance and browser layout |
| [F-036](#f-036) | P0 | M0–M3 | Shared simulator and server-runtime compatibility spike |
| [F-037](#f-037) | P0 | M3 | Managed accounts, server guests and recovery |
| [F-038](#f-038) | P0 | M3 | Cloud profile, concurrent saves and prototype migration |
| [F-039](#f-039) | P0 | M3 | Authoritative spawn-bound battles and live boss sessions |
| [F-040](#f-040) | P0 | M3 | Atomic kill loot, Echo consumption and progression ledger |
| [F-041](#f-041) | P0 | M3 | Data export, account deletion and retention controls |
| [F-042](#f-042) | P0 | M4 | Hosted checkout and purchase initiation |
| [F-043](#f-043) | P0 | M4 | Verified payment events and cosmetic entitlements |
| [F-044](#f-044) | P0 | M4 | Refunds, disputes and purchase support |
| [F-045](#f-045) | P0 | M3 | Authentication boundaries and abuse controls |
| [F-046](#f-046) | P0 | M3 | Reproducible deployment, environment isolation and rollback |
| [F-047](#f-047) | P0 | M5 | Backups, restore and purchase/rare-reward reconciliation |
| [F-048](#f-048) | P0 | M4 | Minimal operator tools and kill switches |
| [F-049](#f-049) | P0 | M5 | Monitoring, bounded concurrency and world/group operating costs |
| [F-050](#f-050) | P0 | M1 instrumentation plan; M3–M5 delivery | Minimal analytics and reliable cohort measurement |
| [F-051](#f-051) | P0 | M1–M5 | Outside-player studies and product decision reports |
| [F-052](#f-052) | P0 | M5 | Integrated release regression and defect closure |
| [F-053](#f-053) | P0 | Before public data collection / live commerce | Business, privacy, rights and budget readiness |
| [F-054](#f-054) | P0 | M5 | Landing page, launch media and support materials |
| [F-055](#f-055) | P0 | M5 | Controlled launch, commercial learning and first-month operations |
| [F-056](#f-056) | P1 | After P0 | PT-BR localization |
| [F-057](#f-057) | P1 | After P0 | Safari / iOS and wider-browser certification |
| [F-058](#f-058) | P0 | M0 design; M2–M5 production | World atlas and 24 genuinely large maps |
| [F-059](#f-059) | P0 | M2–M3 | Fixed habitats, rare spawns and durable respawn lives |
| [F-060](#f-060) | P0 | M0 lock; M3 authority | Exact Echo odds and honest independent loot tables |
| [F-061](#f-061) | P0 | M3 | Private boss parties, readiness and reconnect |
| [F-062](#f-062) | P0 | M3–M4 | Cooperative boss simulation and cross-party support |
| [F-063](#f-063) | P0 | M3–M4 | Repeatable ultra-rare boss essences and claim deduplication |
| [F-064](#f-064) | P0 | M0 pipeline; M2–M5 completion | 100-species production manifest and quality batches |
| [F-065](#f-065) | P0 | M3–M5 | Spawn farming, automation and rare-loot abuse defenses |
| [F-066](#f-066) | P0 | M0 pilot estimate; M5 release recheck | World-scale production, load and cash rebaseline |

## A · Combat and preparation

<a id="f-001"></a>

### F-001 — Explicit damage categories and STR / DEX / INT

Priority: P0 · Milestone: M0 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local categories and numeric/UI fixtures; owner approval pending
Dependencies: F-006
Source items: MVP-01
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-001-AC1: Every basic attack and every damaging skill declares melee physical, ranged physical or magic. Validation rejects missing/unknown categories; projectile appearance or distance cannot choose the category.
- [ ] F-001-AC2: With other inputs held fixed, STR changes melee physical scaling only, DEX ranged physical scaling only, and INT magic scaling only. A mixed kit can use different attributes for its separate skills.
- [ ] F-001-AC3: Skill cards and the selected-fighter inspector display the actual category and governing attribute. Healing's INT relationship is explicitly documented rather than inferred from range.
- [ ] F-001-AC4: Independent numeric fixtures match the formula version in Companion stats.md before rounding and after final damage rounding; no old generic DEX damage bonus remains.

Validation: Test one basic and one skill in each category, mixed-kit skills, range changes, minimum/maximum legal attributes and malformed content. Derive expected numbers independently of the production helper.
Required protocols: VP-01, VP-02. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-002"></a>

### F-002 — Speed, accuracy, tiny dodge and VIT regeneration

Priority: P0 · Milestone: M0 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local Speed/dodge/VIT regeneration; DEX cooldown is 0.667% per
effective point with a 50% combined safety cap; remaining tuning pending
Dependencies: F-001, F-004
Source items: MVP-01
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-002-AC1: The locked rule sheet states whether AGI changes all ready-action opportunities or basic attacks only. The UI shows Speed and seconds consistently; AGI does not silently reduce cooldowns or increase travel speed.
- [ ] F-002-AC2: DEX reduces active cooldowns and counters AGI dodge under the recorded physical-hit formula. Magic, damage-over-time and unavoidable effects obey explicit eligibility rules. Bounds and coefficients are frozen in DEC-01 before verification.
- [ ] F-002-AC3: A dodged strike consumes its normal action/cooldown, shows a miss/dodge outcome and does not apply damage, on-hit Slow/Burn or hit-triggered bonuses. Cast-triggered and attempt-count passives follow their documented trigger, not accidental hit success.
- [ ] F-002-AC4: VIT increases HP and the recorded small defense/regen benefits. Fractional regen is retained, capped at maximum HP, stops on defeat and Overcharge, and cannot create healing-passive feedback loops. Same inputs/seed reproduce the same dodge sequence.

Validation: Use forced hit/miss RNG fixtures, boundary stats, 1×/2× playback, full/partial/dead HP, fractional multi-tick recovery and Overcharge transitions. Compare action counts and actual cooldown clocks separately.
Required protocols: VP-02, VP-03. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-003"></a>

### F-003 — Trainer allocation, Leadership and stat previews

Priority: P0 · Milestone: M0 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local allocation/Leadership/preview; group locks pending
Dependencies: F-001, F-002, F-009
Source items: MVP-01, MVP-06, MVP-08
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-003-AC1: STR/AGI/VIT/INT/DEX/Leadership have validated base values, increasing allocation costs, caps and a level-dependent budget. Invalid/negative/fractional/overspent allocations cannot be committed.
- [ ] F-003-AC2: Trainer and companion XP are independent values using the same cumulative curve. No active or benched monster sets trainer level. Migration initializes independent trainer XP at the previously displayed level without changing companion XP. Classes share the chosen trainer allocation unless a versioned design introduces separate presets.
- [ ] F-003-AC3: Leadership shares the five eligible raw attributes once at the documented provisional fraction. It excludes Leadership itself, derived HP/damage, tree bonuses and recursively received stats.
- [ ] F-003-AC4: Preview equals committed stats; insufficient points disables allocation and free reset refunds exactly. Build edits are disabled after group readiness/pull; changing a solo preparation cannot reroll spawn or loot state.

Validation: Independent budget/fractional-sharing fixtures including zero companions, highest benched level, allocate/respec/reload, and no double share from trees, food or class changes.
Required protocols: VP-02, VP-03. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-004"></a>

### F-004 — Automatic combat with trainer-only, party and group modes

Priority: P0 · Milestone: M0 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local solo and 13-actor group model; online timeline pending
Dependencies: F-006
Source items: MVP-01, MVP-03, MVP-17
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-004-AC1: Solo parties contain one trainer and zero, one or two owned monsters; an empty companion slot is legal. Trainer death ends that player's solo attempt immediately. Group elimination rules are defined by F-062.
- [ ] F-004-AC2: Ordinary monster attacks choose the closest eligible living enemy monster with stable tie-breaking, then a trainer only when protection is absent; explicitly labeled exceptions remain. Wild encounters have no enemy trainer.
- [ ] F-004-AC3: Movement respects range, bounds, obstacles and separation; dead units cannot act. Engaging a fixed habitat creature snapshots its spawn identity; aggressive nearby monsters can join the same anchored fight through an explicitly reserved spawn life and recorded join command; passive/unrelated creatures do not join.
- [ ] F-004-AC4: Solo 1×/2×/pause cannot alter accepted results. Group combat uses one server timeline, no unilateral pause/speed/restart. All modes terminate with valid state, including up to thirteen actors in the group-boss stress fixture.

Validation: Test zero/one/two companions, nearest-target ties, explicit bypass, partial defeats, packs, and group elimination. Record eligible wild kills even if the trainer later falls; reward replay must agree with F-040.
Required protocols: VP-02, VP-03. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-005"></a>

### F-005 — Party selection, three-skill priorities and formation

Priority: P0 · Milestone: M1 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local individual portrait picker, partial/full party and formation; online locks pending
Dependencies: F-006
Source items: MVP-05, MVP-08
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-005-AC1: Created characters begin as apprentices; legacy/prepared specialized teams use Druid or Mage, pending the separate class-specialization decision. The player selects zero to two different owned individuals; two of the same species are legal, enabling trainer-alone hunting. Each present character has five skill choices and exactly three distinct equipped priorities; absent slots remain absent. Clicking a party slot opens a searchable/filterable portrait picker; selecting an equipped individual swaps slots.
- [ ] F-005-AC2: Front/middle/back has at most one member per position. Occupied-rank selection swaps; empty ranks are legal. Preview and initial coordinates agree without inventing monsters or changing the trainer defeat objective.
- [ ] F-005-AC3: Full parties support all six formations; partial parties retain rank and identity across class/individual changes and restore without being forced into a starter pair.
- [ ] F-005-AC4: Solo edits change future builds only; the active fight continues with its saved build and persistent spawn/loot identities. Group readiness locks the submitted build; post-ready edits require unready before the pull. Focus and saves remain correct.

Validation: Zero/one/two companion loadouts, all six full formations, empty-rank swaps, reload and invalid input; ready/unready and post-pull mutation tests. Do not fill an empty slot from the legacy default.
Required protocols: VP-02, VP-03. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-006"></a>

### F-006 — 100-species roster, skill and passive content contract

Priority: P0 · Milestone: M0 · Status: Local implementation / commercial criteria incomplete.
Baseline: 100 local species and 520 assignments; commercial art/boss sources pending
Dependencies: None (foundational contract).
Source items: MVP-04, MVP-05, MVP-06, MVP-26
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-006-AC1: Launch contains at least 100 distinct summonable monster species plus four trainer classes. Working manifest: 94 wild species and six group-boss essence species. Color variants, skins, ages and encounter-only copies do not count as new species.
- [ ] F-006-AC2: Every species and class has five authored active-skill assignments, three equipped per present actor; the 100-species baseline requires 520 assignments, 100 innate passive assignments and 104 eighteen-node trees (1,872 nodes). Shared effect code is allowed; 520 unique engine effects are not required.
- [ ] F-006-AC3: Every species has a stable ID, silhouette/portrait, role, element, attributes, movement/range, legal kit, innate passive and discoverable habitat or boss source. Content rejects unknown references, invalid numbers and role-inapplicable tree branches.
- [ ] F-006-AC4: All 100 species are playable after a test-authorized summon and validated in battle, menus and Inner Sea; no placeholder art/kit counts toward launch acceptance. Coverage enumerates all 520 assignments, passives and trees, not just the original ten.

Validation: Validate the F-064 roster manifest and per-species acceptance matrix. Use controlled test inventory to cover ultra-rare species; test injection cannot mint a production Echo or boss essence.
Required protocols: VP-01, VP-02. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-007"></a>

### F-007 — Four elements, statuses, shields and guard

Priority: P0 · Milestone: M1 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local elements/statuses/guard/Overcharge reverified
Dependencies: F-004
Source items: MVP-01, MVP-06, MVP-17
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-007-AC1: The four-unit-element cycle is Water > Fire > Earth > Wind > Water; all sixteen pairs have the documented multiplier and rarity supplies no power bonus.
- [ ] F-007-AC2: Slow/Haste affect the documented movement/action rates, not skill cooldown clocks. Burn timing and expiry do not depend on actor update order.
- [ ] F-007-AC3: Guard redirects the documented share of trainer damage and applies element/overtime adjustment once; shields absorb correctly and weaker shields cannot replace or extend stronger ones.
- [ ] F-007-AC4: Heals cannot revive; Overcharge prevents healing/regen as specified. Cleanses, stacked status refreshes, innate passives and defeat interrupt safely without negative HP or shield values.

Validation: Sixteen-pair table, element-adjusted guard recursion, simultaneous expiry/hit, stronger/weaker wards, Slow+Haste, damage-over-time defeat and multi-target skill tests.
Required protocols: VP-02. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-008"></a>

### F-008 — Battle controls, inspection and actionable results

Priority: P0 · Milestone: M1 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local controls/inspection/results; server confirmation pending
Dependencies: F-001, F-002, F-004, F-007
Source items: MVP-03, MVP-08
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-008-AC1: Solo pause/resume and 1×/2× keep presentation and simulation coherent; browser backgrounding pauses solo presentation under its declared policy. A group session continues on server time and exposes reconnect/elimination instead of allowing a local pause.
- [ ] F-008-AC2: Inspection shows character owner where relevant, target, level/element, HP/statuses, Speed/seconds, range and cooldowns. Party members can distinguish their trainer and their own companions.
- [ ] F-008-AC3: A terminal monster-encounter victory immediately restores the region with a loot popup; packs wait for the final enemy and trainer duels retain results. Results report accepted kills, ordinary loot, any Soul Echo and server confirmation. An Echo drop is not a recruited companion; summoning happens in the Inner Sea. Useful loss advice is backed by recorded events.
- [ ] F-008-AC4: Leaving/retrying cannot restore a defeated spawn, reroll loot or duplicate a kill claim. Lost group connectivity does not stop other players or discard a committed reward; returning resolves from server state.

Validation: Real solo trainer-only/wild/pack and synchronized group fights; pause/projectile/background/reconnect cases, kill-then-defeat, Echo result vs summon state and repeat claims.
Required protocols: VP-03, VP-05. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## B · Progression, collection and economy

<a id="f-009"></a>

### F-009 — Progression for early, middle and late world regions

Priority: P0 · Milestone: M2 · Status: Local implementation / commercial criteria incomplete.
Baseline: Independent trainer/monster XP, launch player cap60, engine/wild curve100 and authored Lv1–30 route; pacing study pending
Dependencies: F-006
Source items: MVP-06
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-009-AC1: Player trainers, owned companions, active XP, attributes and trees stop at the visible launch cap60. The engine and wild-source curve remain valid through100; a Lv61–100 Echo summons at60 while retaining source provenance, and legacy excess XP is preserved but inactive until a later visible cap patch.
- [ ] F-009-AC2: Accepted encounters grant explicitly declared trainer XP and participating-individual XP as separate receipt fields. The authored early route reaches Lv2/4/6/12/15/20/25/30 thresholds without repeat grinding; optional combat may put a player ahead. Retries never duplicate either XP stream, and no phantom companion XP or automatic healing is added.
- [ ] F-009-AC3: Eligible defeated wild monsters grant documented XP independently to present owned individuals, never to every copy of a species, including those defeated later in the attempt; trainer-duel objectives retain their declared win condition. Kill-source and amount/cap rules are independently tested.
- [ ] F-009-AC4: Measure progress and useful build choice without requiring an ultra-rare Echo. No fixed ten-hour full-collection promise remains; record long unsuccessful hunts honestly, with no hidden pity or paid acceleration.

Validation: No-owned baseline, first summon at declared spawn level, maximum benched level, XP/cap/kill-source tests and timed early/mid/late progression using common-species teams.
Required protocols: VP-02, VP-10. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-010"></a>

### F-010 — Eighteen-node ranked mastery trees

Priority: P0 · Milestone: M2 · Status: Local implementation / commercial criteria incomplete.
Baseline: 104 role-usable trees; path viability review pending
Dependencies: F-003, F-009
Source items: MVP-06, MVP-08
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-010-AC1: Each of the four classes and at least100 monster species exposes eighteen ranked nodes with stable IDs, valid prerequisites and caps3/5/10. Monster trees unlock at player Lv30; each species has five named-skill nodes and an innate-identity node over shared validated effect primitives.
- [ ] F-010-AC2: Each individual owns separate ranked investment in its species template; the committed Druid/Mage class tree unlocks with Lv20 transformation. No purchase exceeds budget/cap or bypasses progression/prerequisites. Free respec refunds exactly; migration preserves valid investments and grandfathers access where needed.
- [ ] F-010-AC3: Every offered branch has a usable effect for that character, including healing branches. Previewed rank changes agree with battle values and cap interactions.
- [ ] F-010-AC4: At the locked progression budgets, at least two distinct development paths per class are viable and every species has one documented useful path. Unlimited respec remains free; the UI does not imply all nodes can be maxed.

Validation: Enumerate all 104 trees; traverse prerequisites, reject cap/budget exploits, check fractional attribute stacking and role affinities. Cover the 100-species roster in staged test batches.
Required protocols: VP-01, VP-02, VP-05. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-011"></a>

### F-011 — Earned economy, per-kill loot and empty-supply recovery

Priority: P0 · Milestone: M2 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local earned economy/spawn receipts; server ledger pending
Dependencies: F-004
Source items: MVP-06, MVP-07, MVP-12
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-011-AC1: One earned coin currency has documented sources/sinks and per-item loot rows. Soul Echoes, boss essences, drop boosts and gameplay supplies are never sold for money; there is no paid luck, pity or paid entry advantage.
- [ ] F-011-AC2: Each eligible spawn death has one loot decision per configured item. Starter Echo rate is 10%; designated mid/late Echoes and every very-rare item use 0.01%, independently of spawn rarity. F-060 fixes exact denominators and group roll scope.
- [ ] F-011-AC3: A persisted loot receipt binds drops to the eligible account or selected boss recipient. World pickup feedback cannot lose a rare item: leaving, death, disconnect or a full display queue recover it to inventory without rolling again.
- [ ] F-011-AC4: An account with no monsters, Echoes, supplies or coins can defeat accessible starter wildlife using any of the four trainer classes alone and earn ordinary rewards. Progress cannot require obtaining a 0.01% drop.

Validation: Exact integer drop boundaries, dead-spawn deduplication, zero-supply trainer-only loops, kill-then-loss, pickup/leave/disconnect recovery and per-row loot independence. See VP-15 for rare-event tests.
Required protocols: VP-02, VP-03, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-012"></a>

### F-012 — Inventory, consumables and item-use UX

Priority: P0 · Milestone: M1 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local Echo inventory/idempotency; cross-client atomicity pending
Dependencies: F-009, F-011
Source items: MVP-08
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-012-AC1: Inventory shows Soul Echo species, quantity, provenance and guaranteed-summon action, alongside coins/supplies/trophies. Boss essence cards show source, owner binding and item/receipt state; no realm-wide claimed/unavailable state or contract catch chance is implied.
- [ ] F-012-AC2: Immediate XP food uses an individual portrait picker and validates that individual's target/cap; prepared supplies consume once at an accepted fresh fight and not on resume. Trainer-only parties cannot feed a nonexistent companion.
- [ ] F-012-AC3: Echo summoning is an atomic inventory-to-ownership operation, not a probability roll; cancel/error/retry cannot consume an Echo without recorded ownership. Existing species ownership does not block a new independent summon. Only explicit confirmation consumes a specific owned Echo; the no-trade policy remains.
- [ ] F-012-AC4: Filters, empty/pending/offline states, quantities and selection/focus work at supported widths. Auto-recovered drops and revoked cosmetics have explicit feedback; decorative items do not imply stats.

Validation: Every item use, Echo preview/summon/cancel/retry, duplicate species, boss-reward receipt, prepared-item group ready/start and disconnected pickup recovery.
Required protocols: VP-03, VP-05. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-013"></a>

### F-013 — Independent companions, 100-species guide and habitats

Priority: P0 · Milestone: M2 · Status: Local implementation / commercial criteria incomplete.
Baseline: 100 local entries/94 habitats; six cooperative sources pending
Dependencies: F-006, F-009
Source items: MVP-06, MVP-07, MVP-08
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-013-AC1: The collection has at least 100 distinct species entries, starting with no owned monsters on a new production profile. Only a valid Soul Echo/essence summon grants a species; prototype starter ownership is not an online entitlement.
- [ ] F-013-AC2: Every wild species has an actual map/habitat source and every boss species its group encounter. Player cards show useful habitat/source information and a summon action for an owned Echo. Backend drop rates and removed acquisition mechanics stay out of ordinary player copy; rare-source information can be revealed by exploration.
- [ ] F-013-AC3: Multiple companions of the same species are allowed, with stable individual IDs and separate XP/levels, active priorities and tree investment. My companions and the species guide are separate views; same-species pairs are legal but the same individual cannot occupy two slots. No automatic fusion, account-stat stacking, breeding or trade is added.
- [ ] F-013-AC4: All 100 species remain obtainable by every eligible player, including boss species already owned by other players. Catalog UI shows personal ownership and sources, never a realm-exclusive lock. Core progression and rewards do not require completing all 100.

Validation: Manifest-to-world coverage for all 100, each species test-summoned and equipped, duplicate/forged summon and repeat boss ownership across accounts. Test grants must be confined to sandbox.
Required protocols: VP-01, VP-03, VP-10. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-014"></a>

### F-014 — Soul Echo drop and guaranteed Inner Sea summoning

Priority: P0 · Milestone: M1 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local Echo drops and guaranteed summon; server claims pending
Dependencies: F-004, F-011, F-013
Source items: MVP-07, MVP-12
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-014-AC1: Eligible wild deaths may leave a species-specific Soul Echo according to the fixed drop table. There is no Try to catch toggle, low-HP gate, papyrus consumption or post-victory 65%/90% catch roll in the new release.
- [ ] F-014-AC2: An owned valid Echo summons its species in the Inner Sea with 100% success. No second RNG check, premium cost, failure animation or hidden attribute requirement can prevent a legal summon.
- [ ] F-014-AC3: Every successful new summon consumes exactly one specific owned Echo and grants one persistent individual/pact once, using an idempotent receipt. Cancellation consumes nothing; failures roll back; retries restore the same result.
- [ ] F-014-AC4: Drop RNG happens exactly once per eligible death/victory and is unaffected by later death, reload, pickup order or summoning UI. Existing species ownership permits another individual; cancellation/error cannot consume an Echo accidentally; future distinct victories can award more boss essences under F-063.

Validation: Forced drop/no-drop, zero/one/multiple Echoes, duplicate species, cancel, concurrent summon, disconnect at commit and repeat group-essence award tests. Remove old capture assertions from current release suites, retaining historical tests separately.
Required protocols: VP-02, VP-03, VP-07, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-015"></a>

### F-015 — Trainer-alone first hunt and honest rarity tutorial

Priority: P0 · Milestone: M1 · Status: Local implementation / commercial criteria incomplete.
Baseline: Local solo start, two one-time teaching guarantees and ordinary rarity outside them; outside-player study pending
Dependencies: F-014
Source items: MVP-07
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-015-AC1: New players create a named Apprentice with a dagger or bow, zero monsters, an effective starter loadout and no paid/rare requirement. One nearby Emberfox attacks after an orientation grace period; both weapons can win. Four Druid/Mage demonstrations lead to trials and confirmed specialization at player Lv20.
- [ ] F-015-AC2: The first accepted introductory Emberfox victory grants one guaranteed normal Emberfox Echo. After its explicit Inventory summon and one companion fight, the first accepted Bloomslime-or-Stonehorn choice grants that chosen normal Echo. These guarantees use unique receipts and never display backend odds.
- [ ] F-015-AC3: Outside the two named onboarding receipts, ordinary Echo rows, rare hunting and independent rolls remain unchanged: no global pity counter, escalating probability, guaranteed-after-N rule or paid retry. Reload, defeat and replay cannot regenerate either guarantee.
- [ ] F-015-AC4: Tutorial progress survives reloads and interrupted saves, teaches Inventory summoning, auto-fills empty party slots and uses two physical signs for the second role choice. A naturally obtained Echo or alternate owned party can satisfy the usable-companion result without creating a softlock.

Validation: Both Apprentice weapons, deterministic no-natural-drop fixtures, duplicate receipt/reload, first and second summon, both signed role routes, no supply softlock and rest/retry. Score comprehension separately from ordinary rare-hunt timing.
Required protocols: VP-02, VP-03, VP-05, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## C · World and encounters

<a id="f-016"></a>

### F-016 — Large-map traversal, local hubs and world transitions

Priority: P0 · Milestone: M1 · Status: Local implementation / commercial criteria incomplete.
Baseline: 24 large maps/six hubs/six boss domains; density/device timing/server lifecycle pending
Dependencies: F-058
Source items: MVP-02, MVP-05
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-016-AC1: The world atlas contains the F-058 baseline of 24 large monster-bearing maps, six compact safe hubs and six compact boss domains across six regions. These are separate navigable spaces, not menu cards or crops of one corridor.
- [ ] F-016-AC2: Each large map's designated opposite-side traversals take at least 30 seconds at base unbuffed walking speed along the shortest valid path; target 45–90 seconds. Loading, combat, idle time and detour padding do not count.
- [ ] F-016-AC3: Maps contain authored routes, landmarks and fixed habitats with meaningful two-dimensional movement. Keyboard/click/tap walking, interruption, collision, followers and camera continuity work across transitions.
- [ ] F-016-AC4: Transition/reload/menus preserve allowed map/position and cannot teleport into locked content, resurrect cleared spawns or create extra rare-spawn attempts. Hubs are explicitly exempt from the large-combat-map crossing budget.

Validation: Instrument shortest path length/speed and actual walk times across every map in both directions; verify portal topology, collision, corners, focus/background and persisted spawn/position state.
Required protocols: VP-03, VP-05, VP-13. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-017"></a>

### F-017 — Spatial entrances linking actual field, forest and cave maps

Priority: P0 · Milestone: M1–M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Physical gates/atlas and saved-encounter lock verified locally; realm lifecycle/device acceptance pending; see features/campaign/README.md
Dependencies: F-016
Source items: MVP-02
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-017-AC1: Every region hub/field has visible, labeled routes to its configured neighboring fields/forest and cave map; the world atlas makes their connections discoverable.
- [ ] F-017-AC2: Walking or clicking/tapping an entrance approaches and transitions to the mapped destination, with a clear destination/difficulty prompt where needed. E is an equivalent nearby action; no three-fight route menu is substituted for the destination map.
- [ ] F-017-AC3: Return entrances preserve a consistent origin/destination and safe arrival point. Cancel/load failure restores position/focus without consuming resources or rolling loot.
- [ ] F-017-AC4: Transitions cannot duplicate map spawns or reset their server-owned lifecycle; inaccessible/boss-reserved destinations explain requirements without silently replacing an active encounter.

Validation: Every bidirectional connection, wrong/locked map ID, cancel/loading failure, keyboard/touch and persisted population across repeated crossings.
Required protocols: VP-03, VP-05, VP-13. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-018"></a>

### F-018 — Explorable cave/forest habitats and return persistence

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Local cave/forest lives, reserved kill receipts and deterministic encounter resume; no server authority; see features/campaign/README.md
Dependencies: F-004, F-009, F-011, F-014, F-017
Source items: MVP-02, MVP-05, MVP-12
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-018-AC1: The v1 fixed three-encounter route generator is retired from the commercial path. Each region's cave and forest destinations are actual large navigable maps with their own creature populations, trainers and loot rows.
- [ ] F-018-AC2: Players choose visible resident targets and can leave/return; map state records spawn life IDs, remaining populations, respawn clocks, current encounter and reserved drops, rather than only a three-step cursor.
- [ ] F-018-AC3: Individual eligible kills persist loot/XP under the new per-kill rules. Losing or leaving does not discard already committed drops, restore defeated creatures or grant rewards for untouched enemies.
- [ ] F-018-AC4: Map-specific spawn rarity, Echo chance and loot class are separately inspectable. Missing/unavailable species rows fail validation; offline/return behavior cannot farm spawn checks or bypass encounters.

Validation: All cave/forest maps, path/spawn/loot manifests, leave/reenter/reload, kill-then-loss and request races; verify retired board-route fields cannot generate online rewards.
Required protocols: VP-01, VP-03, VP-07, VP-13. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-019"></a>

### F-019 — Six-region progression chapters and an accessible main ending

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Six chapters / 48 objectives / accessible ending and once-only rewards; common-starter paths covered for all four classes in tests/pass16_cases.js; current evidence in features/delivery/REMAINING_SCOPE.md
Dependencies: F-016, F-020, F-021
Source items: MVP-05
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-019-AC1: Six regional chapters contain a working budget of 48 authored objective steps, with a main ending and optional group-boss objectives. Objectives are data-driven with stable prerequisites and receipt sources.
- [ ] F-019-AC2: The journal points to real maps, resident habitats and NPCs; it distinguishes guaranteed objective progress from rare optional Echo hunting and does not require all 100 species.
- [ ] F-019-AC3: The main route is completable using accessible/common-species builds, without requiring a 0.01% drop, boss companion or a group when no teammates are available. Group boss chapters are optional.
- [ ] F-019-AC4: Kill/interact/transition/reward events advance only eligible objectives once; reload, prior collection, out-of-order exploration and changed population state cannot create a quest softlock.

Validation: All 48 step definitions and six chapter paths; common-roster campaigns, no-Echo early streaks, precompleted world events, solo ending and optional-boss independence.
Required protocols: VP-01, VP-03, VP-10. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-020"></a>

### F-020 — Sixty authored trainer and faction compositions

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: 60 local trainer lessons with legal regional teams, dialogue and first/repeat rewards; no wild pet drops; see features/campaign/README.md
Dependencies: F-004, F-006, F-007
Source items: MVP-05
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-020-AC1: Working content budget is 60 original trainer/faction encounter compositions across six regions, using the launch roster, appropriate skill/level bands, dialogue and explicit rewards.
- [ ] F-020-AC2: Matchups teach distinct preparation choices, not only increasing HP; stable content validation rejects illegal parties, missing art and impossible unlocks.
- [ ] F-020-AC3: Both classes have documented common-roster paths through the main progression. NPC-owned companions do not drop Soul Echoes; only declared wild/boss sources qualify.
- [ ] F-020-AC4: First-clear and repeatable objective rewards remain idempotent. Defeating incidental trainer-owned monsters cannot be exploited as extra wild-kill or rare-drop rolls.

Validation: 60-content coverage matrix, common-roster class builds, no-Echo NPC-pet kills, first/rematch/stale claims and tactical-lesson review.
Required protocols: VP-01, VP-02, VP-10. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-021"></a>

### F-021 — Twelve pack encounter templates across the world

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: 12 resident-backed forest/cave packs; partial kills persist and untouched lives remain; see features/campaign/README.md
Dependencies: F-004, F-006
Source items: MVP-05
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-021-AC1: Twelve authored pack templates, two per region, use up to five weaker enemies and distinct preparation responses; their exact eligible spawn members are snapshotted on engage.
- [ ] F-021-AC2: Solo trainer defeat ends the attempt; accepted wild kills before defeat still retain their per-kill loot. Unkilled members do not issue rewards, and trainer-target skills fall back to monsters.
- [ ] F-021-AC3: Pack members reference real habitat/spawn life IDs or explicitly reward-free practice IDs. Restarting cannot clone members or reroll a killed member's loot.
- [ ] F-021-AC4: All templates terminate and remain readable at eight actors in solo full-party mode; group boss/add stress up to thirteen actors is independently covered by F-062.

Validation: Twelve seeded packs, partial clear→death/leave, member-ID duplicate races, AoE results and spawn-state persistence, plus actual playback.
Required protocols: VP-02, VP-03, VP-06, VP-13. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-022"></a>

### F-022 — Six rare group bosses, phases and reward-free practice

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Six phased reward-free previews, including simulated 2–3-party practice; real groups/realm access/essence not implemented; see features/campaign/README.md
Dependencies: F-004, F-007, F-009
Source items: MVP-05, MVP-06, MVP-24, MVP-25
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-022-AC1: Six original boss species are included in the 100-species baseline, each attached to a rare realm-owned spawn/access event and requiring a group of two or three ready players for live rewards.
- [ ] F-022-AC2: Each boss has a readable phase mechanic, warning/impact/recovery and declared group scaling. Common-roster groups can defeat it; owning another boss companion is not a prerequisite. Its summoned companion uses a normal balanced roster profile, not the encounter's raid HP, damage or phase-only powers.
- [ ] F-022-AC3: Live access, respawn schedule, eligibility and rewards are server-controlled. Developer level 1–100 tests and practice previews can never mint a live Echo, essence, spawn life or realm claim.
- [ ] F-022-AC4: Every eligible group victory has one independent 0.01% essence opportunity. Previous essence drops, item consumption and any player's ownership never disable or lower this chance; there is no server-wide supply cap.

Validation: All six boss phases and spawn/access schedules; two/three players, locked/not-ready/solo-reward rejection, test/live isolation, unchanged odds after previous drops and F-063 duplicate-claim versus new-victory races.
Required protocols: VP-02, VP-03, VP-07, VP-14, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-023"></a>

### F-023 — Optional regional mastery and group-hunt challenges

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: 18 personal receipt-based challenges and decorative ribbons; group realm conditions not implemented; see features/campaign/README.md
Dependencies: F-011, F-019, F-022
Source items: MVP-05, MVP-06, MVP-09
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-023-AC1: Each region has optional mastery objectives using existing habitats, encounter compositions and group hunts; these are not mandatory daily chores or a prerequisite for the main solo ending.
- [ ] F-023-AC2: Party/composition and kill conditions are checked against the accepted encounter snapshot and realm receipt, not a later loadout or client statement.
- [ ] F-023-AC3: Earned coins and recognition cosmetics are obtainable without an ultra-rare companion. Duplicate challenge rewards are deduplicated and never create extra rare-item rolls beyond the declared loot table.
- [ ] F-023-AC4: The UI distinguishes personal and group goals and records legitimate repeat boss drops. Completion of all 100 species is not required for ordinary account power or feature access.

Validation: Region goal unlocks, group vs personal receipts, composition swaps, repeated rewards and common-roster accessibility. GN-001 account-wide mastery remains unimplemented.
Required protocols: VP-02, VP-03, VP-10. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## D · Presentation and usability

<a id="f-024"></a>

### F-024 — Art bible and approved reference encounter

Priority: P0 · Milestone: M1 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Art bible and reproducible played reference capture; owner/newcomer/device approval pending; see features/campaign/README.md
Dependencies: F-004, F-008
Source items: MVP-03
Accountability: Owner: art/product approval; agent: implementation and evidence

Acceptance criteria:

- [ ] F-024-AC1: A versioned art bible fixes proportions, silhouettes, palette, lighting, ground anchors, scale, typography and icon rules using original/cleared reference material.
- [ ] F-024-AC2: One reproducible encounter shows Druid, Emberfox and Stonehorn against Mage opposition, including movement, attacks, healing/shields, hit, defeat/victory and a separate Soul Echo drop and guaranteed summoning example.
- [ ] F-024-AC3: The VP-04 rubric has no failing dimension, owner sign-off is recorded against a build/video, and at least 8/10 observed newcomers identify trainer/objective and one useful preparation change.
- [ ] F-024-AC4: Approval is for a played slice on named hardware, not a screenshot or a claim of complete Sword x Staff parity. Roster-wide production waits for this pipeline reference.

Validation: Capture the same seed/build at normal, 2× and reduced-motion settings; review the timed-impact/anchor rubric and uncoached user task sheet. Preserve the approved clip for later comparisons.
Required protocols: VP-04, VP-05. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-025"></a>

### F-025 — Animation for 100 species and both trainer classes

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: 3 painted pose rigs, 71 vector-joint rigs, 28 simpler fallbacks; 104-row coverage explicit, production gate open; see features/campaign/README.md
Dependencies: F-024
Source items: MVP-04, MVP-26
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-025-AC1: All 100 distinct species and all four classes have idle, movement, basic attack, cast, hit, defeat and victory states mapped to real events; each of six boss species additionally supports charge, phase transition and recovery.
- [ ] F-025-AC2: Every state has stable ground anchors and scale, no clipped body parts or sheet bleed, and timings approved under the reference rubric. Recolor-only variants cannot count as new species.
- [ ] F-025-AC3: Turning, approach, melee recovery and flight remain readable at actual size. Depth and health bars follow actors; defeated actors stop acting. Reusable rigs are allowed, but whole-portrait bobbing alone does not satisfy attack animation.
- [ ] F-025-AC4: Solo pause/2×, live group clock, background/resume, low effects and reduced motion preserve correct state. All 104 character asset sets load or show a recoverable nonblank failure.

Validation: Character-by-state coverage manifest and actual clips for all 104 characters, six boss phase sequences, anchor checks and representative 13-combatant group playback.
Required protocols: VP-04, VP-06. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-026"></a>

### F-026 — Impact-synchronized VFX and combat feedback

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: 520 explicit visual assignments and shared solo impact deadline; live group/network/device signoff pending; see features/campaign/README.md
Dependencies: F-008, F-024
Source items: MVP-03, MVP-04
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-026-AC1: All 520 skill assignments map to readable reusable physical, projectile, elemental, area, heal, ward and status VFX; innate triggers and each boss warning are identified. Assignments need not be unique engine effects.
- [ ] F-026-AC2: Visible contact/projectile arrival, HP delta, hit reaction and sound share one logical impact event. Solo 1×/2× and network-interpolated group presentation meet VP-04; effects never alter authoritative simulation.
- [ ] F-026-AC3: Damage, guarding, healing and dodge remain distinguishable in the 13-combatant worst case. Ownership labels distinguish allies; effects cannot hide a trainer or boss warning.
- [ ] F-026-AC4: Solo pause freezes local presentation; group clients cannot pause the server. Low-effects/reduced-motion preserve essential warnings, loot confirmation and guaranteed summoning outcome.

Validation: Event/frame timing, projectile/defeat races, stacked heals/guards, group latency and 13-actor stress videos.
Required protocols: VP-04, VP-06, VP-14. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-027"></a>

### F-027 — Six-region world, cave and Inner Sea art

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.
Baseline: World paintings exist; new treatments required
Dependencies: F-016, F-017, F-024
Source items: MVP-02, MVP-04, MVP-05, MVP-09, MVP-22
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-027-AC1: Twenty-four large exploration maps and six compact hubs have coherent landmarks, traversable paths and readable boundaries; cave and forest gates have actual destinations and correct depth sorting.
- [ ] F-027-AC2: Six cave maps contain genuine navigable interiors, not darkened outdoor paintings. Eighteen field/forest maps use region-specific layouts and prop/palette sets; shared assets are allowed without identical maze layouts.
- [ ] F-027-AC3: One fixed Inner Sea scene supports three cosmetic decoration sockets, trainer/companion display and the guaranteed Echo summoning ritual; full walkable housing is excluded.
- [ ] F-027-AC4: Runtime exports, alpha edges, streaming chunks and source provenance match the art bible. Map tiling/collision do not create visible seams, blocked exits or unsupported download growth.

Validation: Every map/hub screenshot and traversal, streaming seams, cave/outdoor contrast, actual-size visibility and licensed asset manifest.
Required protocols: VP-01, VP-04, VP-13. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-028"></a>

### F-028 — Music, sound effects and audio controls

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Three original loops/procedural cues, persistent audio buses and lifecycle tests; listening acceptance pending
Dependencies: F-026
Source items: MVP-04, MVP-17
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-028-AC1: Three short loop assets and a reusable set of approximately 20–30 cues cover exploration, combat/boss/Inner Sea usage, attacks, spells, guard/heal, warning, Soul Echo summoning, results and UI; no voice acting requirement.
- [ ] F-028-AC2: Sound starts only after permitted user interaction, loops transition without obvious clipping/gaps, and excessive simultaneous cues are limited so impacts remain distinguishable.
- [ ] F-028-AC3: Master/music/effects controls and mute persist; pause/background policies do not leave orphaned sounds or create duplicate loops on return.
- [ ] F-028-AC4: Every audio asset has cleared provenance and correct runtime export; muting removes no essential gameplay information.

Validation: Headphone/speaker review at quiet/loud settings, overlapping hits, repeated tab changes, blocked-autoplay and reload; compare impact timing with VP-04 and inventory of licensed cues.
Required protocols: VP-04, VP-05. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-029"></a>

### F-029 — Onboarding and coherent menu navigation

Priority: P0 · Milestone: M1–M2 · Status: Planned / not commercially accepted.
Baseline: One-objective Lv1–30 Apprentice/class route implemented; outside-player pacing incomplete
Dependencies: F-008, F-010, F-012, F-015, F-019
Source items: MVP-07, MVP-08
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-029-AC1: Explore, Party & Bag and Battle remain primary destinations with coherent access to inventory, 100-species collection, trees, formation, Inner Sea, atlas and optional group lobby.
- [ ] F-029-AC2: A fresh profile starts with the trainer alone; a named Apprentice with a dagger/bow wakes in the forest without a guide chain. The first attacker, one-time Echo receipt, Inventory summon and signed Bloomslime/Stonehorn fork are concise and in-world. The first fight starts within the VP-10 two-minute target.
- [ ] F-029-AC3: Zero, one and two owned/equipped companion states are useful rather than errors. First/second summons fill empty slots; portrait selection remains authoritative. Four demonstrations, fixed Tidecrown, temporary class trials, Lv20 confirmation, an ability-change proof and Lv30 tree proof each expose one current objective without closing roads.
- [ ] F-029-AC4: Empty, loading, offline, login-expired, map-unavailable, group-disconnected, no-drop, additional-copy summon and pending-receipt states have truthful recovery actions; neither UI nor tutorial invents ownership.

Validation: Fresh and returning-user task scripts, skipped/restarted tutorial, all specified UI states, keyboard/touch walkthrough; late Inner Sea/shop screens inherit and are checked under the same navigation Soul Echo summoning.
Required protocols: VP-03, VP-05, VP-10. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-030"></a>

### F-030 — Accessibility and input/settings quality

Priority: P0 · Milestone: M5 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Persistent motion/FX/shake/flash/audio controls and responsive/focus checks; full human/device certification pending
Dependencies: F-026, F-028, F-029, F-031, F-033, F-042
Source items: MVP-08, MVP-17
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-030-AC1: All launch screens and dialogs can be completed with keyboard alone, have visible focus, correctly labeled controls, modal focus containment/restoration and no pointer-only essential action.
- [ ] F-030-AC2: At 320/390/768/1440 CSS-pixel widths and 200% text zoom, required controls/content remain accessible without unintended horizontal page overflow; touch actions have the VP-05 target size.
- [ ] F-030-AC3: Text/icon contrast meets the project targets, and element/status/win-loss meaning is not conveyed solely by color, sound or animation.
- [ ] F-030-AC4: Reduced motion, effects/flash/shake options and audio controls persist. Essential warnings survive those settings; no known repeated flashing hazard is shipped.

Validation: Automated DOM/accessibility checks plus manual keyboard, zoom, screen-reader spot checks and two physical-phone flows. Automated scans alone do not certify accessibility.
Required protocols: VP-05, VP-12. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## E · Inner Sea and cosmetics

<a id="f-031"></a>

### F-031 — Inner Sea farm, daily defense and local screenshot export

Priority: P0 · Milestone: M2 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Local farm, five automatic habitat displays, AFK training, daily defenses, upgrades/repairs, decoration drafts and PNG export; equipment and release acceptance pending
Dependencies: F-013, F-025, F-027
Source items: MVP-09
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-031-AC1: One farm scene contains a wooden house, barn, cellar, bird roost, insect garden and pond, displaying the highest-level compatible owned individual per habitat with stable first-individual ties. Retain three cosmetic sockets and one style selector.
- [ ] F-031-AC2: Selecting a socket previews/equips only eligible owned decorations; unequip/replace/cancel works and the layout survives returning from combat and reloading.
- [ ] F-031-AC3: A local image export reproduces the player's scene without private email/account identifiers, remote upload, blank assets or browser-tainted-canvas failure.
- [ ] F-031-AC4: Clean, intact farms train every owned copy; power sums one maximum level per species. Five chosen monsters defend without a trainer against daily trainer-level, lunar-scaled attacks. Successful defenses settle normal attacker loot once; failure removes XP from all owned monsters and suspends training/bonuses until item repair. Habitats upgrade separately; future boss/dungeon habitat equipment must strengthen account/defense without selling power. Validate offline time, normalization, replay and idempotency under the detailed farm scope.

Validation: Every socket/background state, empty ownership, rapid replace, locked decoration, reload and screenshot pixel/content review at desktop/mobile resolutions.
Required protocols: VP-03, VP-04, VP-05. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-032"></a>

### F-032 — Appearance ownership, equipment and earned cosmetics

Priority: P0 · Milestone: M4 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Three local earned scene decorations; authoritative/paid ownership and outfits still absent
Dependencies: F-031, F-040
Source items: MVP-09, MVP-13
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-032-AC1: Appearance slots accept only owned compatible items; class/individual changes restore valid defaults rather than applying an incompatible skin.
- [ ] F-032-AC2: At least three attractive earned appearance rewards have documented attainable sources and are distinct from merely retaining the default outfit.
- [ ] F-032-AC3: All appearance settings persist to the correct account and restore on another device. Gameplay reset cannot erase purchase history or paid ownership.
- [ ] F-032-AC4: For every paid and earned appearance, identical combat snapshot/seed produces identical stats, targeting, timing, outcomes and reward probabilities; rendered visibility remains within the same readability floor.

Validation: Cross-account/unowned/incompatible equip requests, reward duplication, class swap and save restoration; automated cosmetic-invariance matrix plus visual checks, not only a zero-stat field audit.
Required protocols: VP-02, VP-03, VP-07. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-033"></a>

### F-033 — Eight-product catalog and real previews

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-025, F-032
Source items: MVP-13
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-033-AC1: The launch catalog contains eight paid products: two trainer sets, two companion variants, two summoning-ritual visual styles and two Inner Sea bundles; contents, compatible characters and ownership state are explicit.
- [ ] F-033-AC2: Every item previews on its actual character/scene, including motion where relevant, without granting/equipping an unowned paid entitlement.
- [ ] F-033-AC3: Prices are direct supported local-currency amounts from approved server catalog data. No premium currency, randomized purchases, fake scarcity, gameplay advantage or duplicate-owned sale is offered.
- [ ] F-033-AC4: Preview, cancel, owned, unavailable, expired price and pending purchase states are usable; the store is not forced into onboarding before the first real gameplay experience.

Validation: Catalog/schema and price-version fixtures; preview each SKU, verify exact bundle members, duplicate/overlapping ownership behavior and purchase-disabled states. Final price/currency policy is DEC-04.
Required protocols: VP-01, VP-03, VP-05. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## F · Client and online foundation

<a id="f-034"></a>

### F-034 — Versioned client build and runtime asset pipeline

Priority: P0 · Milestone: M0–M3 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Immutable allowlisted local-preview builds, manifests, lazy loading and lossless scenery exports; production acceptance pending
Dependencies: F-024
Source items: MVP-10
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-034-AC1: One reproducible build produces a versioned client/content manifest with stable asset hashes, appropriate cache policy and no development/test files or secrets in the public bundle.
- [ ] F-034-AC2: Only needed starter/world/first-battle assets block initial play; other areas, unused sheets, shop previews and source-art/history are excluded from that initial transfer.
- [ ] F-034-AC3: Assets have optimized runtime exports, load/error states and nonblank fallbacks; a missing essential encounter asset prevents a broken battle start with a recoverable explanation.
- [ ] F-034-AC4: Client, schema and rules versions are explicit. Stale cached versions cannot combine incompatible content or award online progress under unknown rules.

Validation: Repeat build/hash comparison, cold/warm cache and offline/missing-asset tests; inspect network transfer and exported file manifest; retain source assets unmodified.
Required protocols: VP-01, VP-03, VP-06. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-035"></a>

### F-035 — Supported-device performance and browser layout

Priority: P0 · Milestone: M5 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Unthrottled loading diagnostics and lossless scenery compression; physical certification missing
Dependencies: F-025, F-026, F-027, F-031, F-034
Source items: MVP-10, MVP-17
Accountability: Agent: measurement tooling; owner/testers: physical devices and sign-off

Acceptance criteria:

- [ ] F-035-AC1: Named supported hardware passes initial download ≤8 MB and first playable ≤8 seconds under the VP-06 10-Mbps/100-ms cold-load protocol; the full 100-species/24-map asset set is not loaded up front.
- [ ] F-035-AC2: Representative desktop targets 60 FPS/p95 frame ≤20 ms and chosen physical midrange Android 30 FPS/p95 ≤40 ms at documented effects settings, including 13 active combatants and the busiest approved habitat.
- [ ] F-035-AC3: Ten-minute traversal/combat traces show no repeated >100-ms main-thread stalls; thirty-minute multi-map/group loops show no tab crashes or persistent retained-memory growth. Streaming and simulation are measured separately.
- [ ] F-035-AC4: First-battle assets preload. Background/resume, resizing, touch and poor-network recovery pass; supported device/model/browser versions are published. Viewport emulation does not establish physical certification.

Validation: Cold-load traces, physical device videos, dense-map and 13-actor group traces, streamed asset residency and 30-minute soak.
Required protocols: VP-06, VP-12, VP-13, VP-14. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-036"></a>

### F-036 — Shared simulator and server-runtime compatibility spike

Priority: P0 · Milestone: M0–M3 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: 1,000-case shared browser/Node corpus and local CPU probe; actual hosted concurrency untested
Dependencies: F-001, F-002, F-003, F-004, F-007, F-010
Source items: MVP-10, MVP-12
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-036-AC1: The same versioned mechanics/content module runs without DOM, assets or local storage in browser, solo validator and authoritative group host; presentation cannot influence rules.
- [ ] F-036-AC2: A golden corpus yields identical canonical outcomes across Chrome, Edge and server: ticks, unit state, targeting and seeded decisions. Network arrival cannot let clients choose a boss seed or outcome.
- [ ] F-036-AC3: Benchmark maximum-duration capped-build solo replays and the 13-actor group simulation. Solo p95 replay CPU <200 ms; proposed 20-Hz group host stays within its 50-ms tick budget at the accepted room count with ≥30% headroom.
- [ ] F-036-AC4: Measure the deployment runtime rather than assume a replay-only/serverless backend supports live rooms. Record a bounded runtime/optimization decision before feature-wide integration and repeat at final roster scale.

Validation: At least 1,000 generated fights plus edge goldens; cross-runtime hashes, CPU/tick traces, seeded group replay and measured concurrent-room limits.
Required protocols: VP-02, VP-07, VP-14. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-037"></a>

### F-037 — Managed accounts, server guests and recovery

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: None (foundational contract).
Source items: MVP-11
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-037-AC1: An online guest can reach the first fight without email. Its durable identity/progress is server-issued if it can later link to a registered account.
- [ ] F-037-AC2: Registration/sign-in/recovery/sign-out use managed authentication and a tested production email sender; invalid/expired/reused credentials or links produce safe recoverable messages.
- [ ] F-037-AC3: Guest conversion transfers the correct progress once. Linking to an existing account uses an explicit conflict/merge policy and cannot attach another user's state.
- [ ] F-037-AC4: A recoverable verified account is required before purchase; sessions expire/revoke correctly and logout does not destroy saved ownership. Abuse controls are validated with F-045.

Validation: Fresh/returning account, guest→new/existing account, expired token, password/link recovery, concurrent linking and lost email scenarios; live email/public registration requires separate owner approval.
Required protocols: VP-03, VP-07. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-038"></a>

### F-038 — Cloud profile, concurrent saves and prototype migration

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.
Baseline: Local saves exist; cloud authority new
Dependencies: F-003, F-010, F-012, F-013, F-019, F-037
Source items: MVP-11
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-038-AC1: Versioned cloud records cover 100-species ownership/XP, zero-companion trainer state, builds/formation, map positions and unlocks, inventory, Echo reward/summon receipts, realm affiliation and appearance; server records are authoritative.
- [ ] F-038-AC2: Acknowledged changes appear on another device; transactions/revisions prevent stale writes and concurrent tabs from overwriting inventory or claiming one drop twice.
- [ ] F-038-AC3: Reload, map travel, death, session expiry and disconnect preserve committed rewards and pending-operation status. Malformed, negative, unknown or locally fabricated profile values cannot become online ownership.
- [ ] F-038-AC4: Legacy local saves remain separately playable/exportable. No local contract, boss test grant, seeded Echo or debug level imports into the live economy; conversion/wipe policies are explicit before invites.

Validation: Two-device/two-tab interleavings, reordered/offline requests, corrupted and older schemas, high-level local profiles and recoverable migration failure; compare full semantic snapshots after restore.
Required protocols: VP-03, VP-07. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-039"></a>

### F-039 — Authoritative spawn-bound battles and live boss sessions

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-036, F-037, F-038, F-045
Source items: MVP-12, MVP-23, MVP-24
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-039-AC1: A solo ticket binds account, realm, habitat spawn life ID, legal zero-to-two companion party, rules version, seed and consumables. The server validates encounter access, movement/elapsed time and spawn availability.
- [ ] F-039-AC2: The server determines death/loot events and checks solo results; a browser cannot forge winner, damage, monster identity, location, clock or rewards. Group bosses use the live authoritative host, not conflicting solo replays.
- [ ] F-039-AC3: One eligible spawn death creates one reward opportunity with a durable result, even if the trainer later dies. Retry, resume, cancellation, client 2× playback and map re-entry cannot reroll, resurrect or settle the same life again.
- [ ] F-039-AC4: Reconnection retrieves the active encounter/receipt; offline practice remains reward-free. Graceful server failure and expired tickets have explicit recovery without lost rare loot or fabricated victories.

Validation: Tampered clocks, teleporting, duplicate spawn claims, stale builds, mid-pack death, interrupted settlement and group client result spoofing.
Required protocols: VP-03, VP-07, VP-13, VP-14, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-040"></a>

### F-040 — Atomic kill loot, Echo consumption and progression ledger

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.
Baseline: Local atomic profile transactions only
Dependencies: F-014, F-018, F-039
Source items: MVP-12
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-040-AC1: Each eligible kill/encounter ID commits its declared coins, XP, drops and progression exactly once. Uniform loot RNG is server-owned and its committed result survives retry or crash.
- [ ] F-040-AC2: An ordinary Echo summon atomically consumes one owned item and creates an independent individual/receipt with 100% success. Duplicate clicks, full/invalid destination and failed writes cannot destroy an Echo or duplicate a companion.
- [ ] F-040-AC3: Boss rewards deduplicate the same victory/loot-row transaction under F-063. Distinct eligible victories may each award the same essence, even to previous recipients. Summoning consumes a particular item once without disabling future loot.
- [ ] F-040-AC4: Fifty concurrent/repeated requests, reordered acknowledgements, disconnects and failure at each transaction boundary yield either no committed mutation or one complete recoverable receipt. Operator corrections are audited.

Validation: Concurrent kill/drop/summon races, inventory recovery and independent ledger reconciliation; include ordinary Echoes and repeat boss-essence items.
Required protocols: VP-07, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-041"></a>

### F-041 — Data export, account deletion and retention controls

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-038
Source items: MVP-11, MVP-16
Accountability: Agent: implementation/tests; owner/adviser: retention policy

Acceptance criteria:

- [ ] F-041-AC1: An authenticated user can request their own readable account/progression data and deletion through an explained flow; authentication is reconfirmed for destructive actions.
- [ ] F-041-AC2: Deletion follows the owner-approved category/retention policy, revokes sessions and removes/anonymizes appropriate gameplay/analytics identifiers without exposing another account.
- [ ] F-041-AC3: Any legally required payment/audit retention is disclosed, restricted and separated from active gameplay identity; the system does not promise to erase records that must be retained. Apply the approved normal reward/receipt retention policy; no special realm-wide essence issuance/retirement tombstones are required.
- [ ] F-041-AC4: Deletion/export failure is retryable with a tracked status; restore procedures reapply deletion records so a backup restore does not silently resurrect an active deleted account.

Validation: Own/other account requests, expired sessions, duplicate deletion, partial provider failure and restored backup with deletion tombstones; privacy-policy owner review supplies legal retention values.
Required protocols: VP-07, VP-09, VP-11. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## G · Commerce

<a id="f-042"></a>

### F-042 — Hosted checkout and purchase initiation

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-033, F-037, F-045
Source items: MVP-14
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-042-AC1: An authenticated recoverable account can buy only an eligible server-priced SKU/currency/version through hosted checkout; no card data or payment secret enters game storage/client code.
- [ ] F-042-AC2: Account, order and provider-session IDs are bound server-side. Forged price, account, currency, quantity or owned/disabled SKU requests are rejected before charging.
- [ ] F-042-AC3: Success redirect alone grants nothing. Cancel, decline, authentication challenge, delayed payment and browser closure have distinct recoverable states; reopening retrieves pending order status.
- [ ] F-042-AC4: Checkout initiation is idempotent against double-click/retry and prevents unintended concurrent duplicate purchases. Test/live environments are isolated; real charges remain disabled until the separate commercial authorization gate.

Validation: Provider sandbox for all checkout states, mismatched IDs/price versions, two tabs and closed-return page; a real transaction is not part of ordinary automated acceptance.
Required protocols: VP-07, VP-08. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-043"></a>

### F-043 — Verified payment events and cosmetic entitlements

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-040, F-042
Source items: MVP-14
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-043-AC1: Server verifies provider authenticity and paid/settled status before fulfilling; only verified events for the matching live/test environment, account and order can create a grant.
- [ ] F-043-AC2: Duplicate and concurrent events produce one durable order fulfillment and exactly the bundle's entitlements. Out-of-order/delayed events cannot revert to an incorrect unpaid/paid state.
- [ ] F-043-AC3: Paid users recover ownership after reload, sign-in on a new device and payment completion with no return-page visit; pending UI reconciles to the server record.
- [ ] F-043-AC4: Append-only provider-event/order/grant records retain unique IDs and status history. Failed fulfillment is visible and retryable, and grants cannot be fabricated by local storage or catalog edits.

Validation: Replay valid/invalid signatures and event orders, 50 duplicate/concurrent deliveries, delayed success, missing redirect, partial fulfillment failure and cross-device restoration for all eight SKUs.
Required protocols: VP-08. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-044"></a>

### F-044 — Refunds, disputes and purchase support

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-043, F-048
Source items: MVP-14, MVP-16
Accountability: Agent: implementation/tests; owner: support and live-charge approval

Acceptance criteria:

- [ ] F-044-AC1: Supported refund/dispute transitions update the order and affected grants under the approved policy; repeat or out-of-order events cannot duplicate a refund or revoke unrelated ownership.
- [ ] F-044-AC2: If an appearance has another valid earned/paid grant, revoking one source does not remove that remaining entitlement. An equipped revoked item falls back safely without affecting gameplay.
- [ ] F-044-AC3: Support can trace an order, inspect its events and reprocess a failed fulfillment/refund with authorization and an audit reason; the player receives clear purchase/pending/support information.
- [ ] F-044-AC4: Sandbox full/partial/refused refund and dispute cases pass where supported. Any live transaction/refund test requires separate owner approval and records the actual costs/outcome; gameplay reset never destroys payment history.

Validation: Order/grant state-machine matrix, overlapping bundles/earned ownership, equipped revocation, repeated support retry and a denied non-operator request.
Required protocols: VP-08, VP-09. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## H · Operations and security

<a id="f-045"></a>

### F-045 — Authentication boundaries and abuse controls

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-037
Source items: MVP-11, MVP-12, MVP-14, MVP-17
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-045-AC1: Every protected API/database operation checks identity and ownership, including profile, battle, inventory, appearance, order and operator routes. Guessing another ID never reveals or changes that account.
- [ ] F-045-AC2: Inputs have schema/range/size validation; sensitive configuration is server-side and absent from public artifacts/logs. Access/refresh/operator sessions follow the recorded expiry/revocation policy.
- [ ] F-045-AC3: Rate/attempt/request-size limits cover anonymous signup/email, login, battle starts/settlement, purchase initiation and export; rejected requests do not partially mutate state.
- [ ] F-045-AC4: Failure messages avoid secret exposure and account enumeration where practical. Security tests include expired/forged credentials, injection/XSS strings, replay and least-privilege denied operations; no known critical authorization defect remains.

Validation: Two real isolated test accounts plus anonymous/operator roles, endpoint permission matrix, malicious payload corpus, secret scan and approved staged abuse burst; new endpoints inherit the matrix.
Required protocols: VP-07. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-046"></a>

### F-046 — Reproducible deployment, environment isolation and rollback

Priority: P0 · Milestone: M3 · Status: Local/partial implementation · commercial criteria incomplete.
Baseline: Reproducible local package only; no deployment, production environments or rollback drill
Dependencies: F-034
Source items: MVP-10, MVP-16
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-046-AC1: Development, staging and production have separate databases, secrets, auth callbacks, payment modes and visible environment labels; a test purchase/ticket cannot mutate live state.
- [ ] F-046-AC2: A reproducible build passes required checks before deployment; assets/client/rules/schema are versioned and served over HTTPS without depending on the owner's laptop.
- [ ] F-046-AC3: Compatible upgrades preserve active accounts/tickets; incompatible versions are rejected or migrated with an explained restart/recovery path rather than mixed-rule settlement.
- [ ] F-046-AC4: A staging rollout and rollback drill restores the previous client/content safely, including stale caches. Database migrations use a documented forward/recovery strategy; rollback cannot discard paid grants.

Validation: Clean build/deploy manifest, cross-environment requests, stale client/cache, interrupted release and rollback rehearsal; production deployment itself needs owner permission.
Required protocols: VP-01, VP-07, VP-09. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-047"></a>

### F-047 — Backups, restore and purchase/rare-reward reconciliation

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-038, F-040, F-043, F-046
Source items: MVP-16, MVP-25
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-047-AC1: Automated backups cover profiles, maps/spawn claims, groups, rewards, orders and ownership; ordinary progression has a documented ≤24-hour recovery-point target, with backup failure alerts.
- [ ] F-047-AC2: A clean staging restore passes profile/economy consistency checks and records achieved recovery time/point. Durable reward and summon receipts reconcile grants and item consumption beyond the ordinary snapshot boundary.
- [ ] F-047-AC3: Verified payment events reconstruct missing paid grants once. Accepted victory/reward/summon receipts likewise reconcile earned boss items without duplicating an old result; affected settlement remains disabled while recovery is uncertain.
- [ ] F-047-AC4: Issue and consume an essence after backup, then restore and retry its victory claim: no duplicate reward or restored consumed item. A new eligible victory still rolls 0.01% and can award another essence. Restore reapplies account deletion records.

Validation: Restore around paid grants, boss rewards/summoning and account deletion; repeat reconciliation twice, retry an old claim and settle a new victory.
Required protocols: VP-08, VP-09, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-048"></a>

### F-048 — Minimal operator tools and kill switches

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-040, F-043, F-045
Source items: MVP-16
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-048-AC1: Authorized operators can find an account/order, inspect receipts/events, retry fulfillment and issue a justified correction; ordinary players cannot access these actions.
- [ ] F-048-AC2: Corrections, retries and entitlement decisions record operator identity, reason, timestamp and before/after/reference IDs; repeated requests remain idempotent.
- [ ] F-048-AC3: Server-side store, map/habitat, group-entry and boss-reward settlement kill switches block new affected operations, including direct requests, while preserving committed rewards, ordinary play where safe and payment reconciliation.
- [ ] F-048-AC4: Players see a safe temporary-unavailable/support message and can access unaffected parts of the game; toggles cannot turn off recovery of a legitimately paid order.

Validation: Role-denial checks, audited correction/retry, toggles during active battle/checkout and repeated toggles; verify client and API behavior independently.
Required protocols: VP-07, VP-08, VP-09. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-049"></a>

### F-049 — Monitoring, bounded concurrency and world/group operating costs

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-039, F-040, F-043, F-046
Source items: MVP-16, MVP-17, MVP-28
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-049-AC1: Metrics cover auth/errors, replay CPU, host tick/latency, realm boss state, spawn/loot rates, DB contention, duplicate claim conflicts, email/checkout failures and bandwidth/spend without sensitive payload logging.
- [ ] F-049-AC2: Initial staging capacity target: 100 active accounts total, including ten concurrent three-player boss rooms using isolated test realms/fixtures, 1.7 average and 20 peak settlements/s for 15 minutes plus spawn/save traffic. Boss schedule capacity is separately bounded per real realm.
- [ ] F-049-AC3: At that profile, start/save/settle API p95 <1 second; declared group tick/network and no-duplication objectives pass. Traffic for 100 species and 24 streamed maps is included in cost forecasts, not just static front-page visits.
- [ ] F-049-AC4: F-066 records measured monthly unit costs, invitation limits, campaign stop thresholds and reserve. An injected cost or service alert reaches the owner; capacity remains capped if the original cash envelope cannot cover it.

Validation: Approved staging load with real schema/tickets, synthetic test-only realm separation, host+DB traces, bandwidth/cost worksheet and alert rehearsal.
Required protocols: VP-07, VP-09, VP-13, VP-14, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## I · Validation and launch

<a id="f-050"></a>

### F-050 — Minimal analytics and reliable cohort measurement

Priority: P0 · Milestone: M1 instrumentation plan; M3–M5 delivery · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-037
Source items: MVP-15
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-050-AC1: Pseudonymous versioned events cover first playable/solo kill, habitat exposure, eligible kills, exact drop-table version, Echo no-drop/drop/summon, map travel, builds, groups, repeated boss drops and store/payment outcomes.
- [ ] F-050-AC2: Only server-confirmed economic events count as rewards. Dedupe by event/receipt IDs; avoid raw email, card data, private combat chat or device fingerprint collection.
- [ ] F-050-AC3: Fixtures reproduce expected activation and D1/D7/D30 windows with mature denominators and internal/test exclusions. Report encounter rarity, per-kill drop chance and time-to-first-Echo separately.
- [ ] F-050-AC4: Reports retain unsuccessful/no-Echo players and all failed loads, and distinguish test-granted/tutorial fixtures from real random drops. Retention/deletion comply with the approved notice.

Validation: Synthetic event timelines at window boundaries, duplicate delivery, clock/time-zone issues, consent/collection modes and known internal accounts; reconcile purchase metrics against provider ledger.
Required protocols: VP-07, VP-10. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-051"></a>

### F-051 — Outside-player studies and product decision reports

Priority: P0 · Milestone: M1–M5 · Status: Planned / not commercially accepted.
Baseline: No commercial player evidence established
Dependencies: F-050
Source items: MVP-03, MVP-06, MVP-07, MVP-19
Accountability: Owner: recruitment and product decision; agent: protocol, analysis and fixes

Acceptance criteria:

- [ ] F-051-AC1: Observe 10–15 uninvolved reference players; at least 8 of the first 10 understand trainer protection, build changes, navigation and the distinction between rare drop and guaranteed summon without coaching.
- [ ] F-051-AC2: Free pilot uses 20–50 invited players over 2–3 weeks; later beta uses 100–300 new players with mature seven-day cohorts and real group sessions. A pilot subset is explicitly not the 100-species commercial release.
- [ ] F-051-AC3: Report first-battle completion target ≥85%, time/eligible kills to first Echo, starter unlucky tails, no-Echo abandonment, map traversal boredom, group completion and D1 ≥25%/D7 ≥10% diagnostic targets. Do not treat a random drop rate as a tutorial-completion guarantee.
- [ ] F-051-AC4: Ultra-rare probabilities are verified deterministically, not by waiting for playtesters to win them. The owner records proceed/iterate/stop; changing 10%/0.01% or adding pity requires explicit new approval.

Validation: Uncoached sessions, verified VP-10 cohort queries, leaver interviews, exact RNG tests and starter-tail statistics.
Required protocols: VP-05, VP-10, VP-13, VP-14, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-052"></a>

### F-052 — Integrated release regression and defect closure

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.
Baseline: Existing prototype suites; commercial suites missing
Dependencies: F-008, F-023, F-030, F-035, F-040, F-041, F-044, F-047, F-049, F-050, F-058, F-059, F-060, F-061, F-062, F-063, F-064, F-065, F-066
Source items: MVP-17
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-052-AC1: The final version-pinned RC passes all applicable P0 suites across 100 species, 24 large maps, six hubs and six group bosses, plus a fresh trainer-alone campaign using a normal obtainable roster. Test rare grants are isolated from production.
- [ ] F-052-AC2: Zero open S0/S1 defects remain under the severity definitions in VALIDATION_PLAN.md; minor known issues have owners, workarounds where valid and a public-facing disclosure if relevant.
- [ ] F-052-AC3: At least 500 observed supported-client sessions meet ≥99% unexpected-error-free rate, with session definition and denominator shown; expected validation errors and checkout cancellations are not crashes.
- [ ] F-052-AC4: Current source/build and rules hashes match the evidence; changing a dependency invalidates affected acceptance and triggers targeted regression plus required end-to-end checks.

Validation: Run the VP suite matrix, device campaign and incident scenarios; collate failing and passing reports, not only test counts. Validate the final RC after fixes, not a historical prototype build.
Required protocols: VP-01, VP-02, VP-03, VP-05, VP-06, VP-07, VP-08, VP-09, VP-10, VP-13, VP-14, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-053"></a>

### F-053 — Business, privacy, rights and budget readiness

Priority: P0 · Milestone: Before public data collection / live commerce · Status: Planned / not commercially accepted.
Baseline: Pending owner decisions; no commercial setup
Dependencies: None (foundational contract).
Source items: MVP-16, MVP-18, MVP-19
Accountability: Owner and qualified adviser where required; agent prepares/checks implementation

Acceptance criteria:

- [ ] F-053-AC1: The owner records seller identity, approved territories/age policy, payment eligibility, primary language, cash envelope and accountable support/incident contact; unresolved items are visibly blocking the relevant release stage.
- [ ] F-053-AC2: Terms, privacy, refund/support, data retention/deletion and applicable tax/consumer obligations have an approved implementation checklist, with professional review where needed; generic copied text is not treated as clearance.
- [ ] F-053-AC3: A provenance/license register covers every shipped asset, sound, font, dependency and product name; required attribution is included and disputed/uncleared content is excluded.
- [ ] F-053-AC4: Account/domain/email/payment ownership and secret configuration are controlled by the owner. No paid tool, public deployment, live purchase, ad spend or data collection beyond approved conditions is authorized merely by this backlog.

Validation: Owner/adviser sign-off register, asset/dependency manifest audit, platform eligibility checklist and budget worksheet. This is evidence of a review process, not an agent's legal-compliance certification.
Required protocols: VP-11. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-054"></a>

### F-054 — Landing page, launch media and support materials

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-024, F-029, F-033, F-053
Source items: MVP-18
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-054-AC1: A playable-game landing page contains a clear pitch, correct supported platforms, real screenshots, account/play entry, support/contact and approved policy links.
- [ ] F-054-AC2: A 30–45-second trailer and 6–8 screenshots show the actual release candidate and its distinctive loop; no feature or graphical-parity claim exceeds what ships.
- [ ] F-054-AC3: Known issues, patch notes and a support/status page explain connectivity, account/purchase recovery, refunds and the small-service support expectations.
- [ ] F-054-AC4: Campaign links allow the approved minimal source attribution; no advertising launch/spend occurs without owner approval and the staged-launch gates.

Validation: Review all media against RC footage and screenshots; keyboard/mobile link check, support ticket rehearsal, contact routing and privacy/marketing owner review.
Required protocols: VP-05, VP-11. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-055"></a>

### F-055 — Controlled launch, commercial learning and first-month operations

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.
Baseline: New
Dependencies: F-049, F-051, F-052, F-053, F-054, F-064, F-066
Source items: MVP-19
Accountability: Owner: commercial authorization/operation; agent: implementation and evidence

Acceptance criteria:

- [ ] F-055-AC1: Reference → free alpha → free beta → monetized invitation cohort → public release follows G0–G5. Every transition records build, evidence, limits, owner decision and unresolved risks.
- [ ] F-055-AC2: Monetized cohort uses approved live commerce only after safety gates; report at least ten voluntary purchases from unrelated players as an initial signal, not proof of profitability or a quota to manipulate.
- [ ] F-055-AC3: Acquisition spend is capped and staged against measured activated-player cost, cohort revenue, refunds, fees and operating costs. Missing evidence or exceeded reserve stops expansion rather than adding paid power.
- [ ] F-055-AC4: A first-month plan names monitoring/support coverage, incident/rollback/refund procedure and a realistic bug/balance cadence; no promised weekly roster growth, full public-world multiplayer or always-on human support is implied; the planned private group-boss service is staffed and monitored.

Validation: Gate-record audit, approved live payment/refund check, cohort/accounting report and simulated incident. Owner alone authorizes external launch, spending and the commercial go/no-go.
Required protocols: VP-08, VP-09, VP-10, VP-11. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## J · Optional post-P0 features

<a id="f-056"></a>

### F-056 — PT-BR localization

Priority: P1 · Milestone: After P0 · Status: Planned / not commercially accepted.
Baseline: Deferred P1
Dependencies: F-029, F-033, F-054
Source items: MVP-20
Accountability: Agent: implementation; owner/fluent reviewer: language approval

Acceptance criteria:

- [ ] F-056-AC1: If adopted, all player-facing strings, tooltips, tutorial, shop/policies where applicable and launch materials have reviewed PT-BR text through stable string IDs; English fallback is intentional.
- [ ] F-056-AC2: Currency/number/time formatting and pluralization are consistent and no key/raw placeholder leaks into the UI.
- [ ] F-056-AC3: Language selection persists; long translated strings fit supported layouts/zoom and keyboard/screen-reader labels remain meaningful.
- [ ] F-056-AC4: A fluent reviewer completes first fight, Echo collection, preparation and purchase-preview flows with no critical mistranslation; checkout language/support scope is accurately disclosed.

Validation: String coverage and placeholder checks, locale/format fixtures, narrow-screen screenshots and a fluent-reader walkthrough. Do not advertise PT-BR before acceptance.
Required protocols: VP-05, VP-12. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-057"></a>

### F-057 — Safari / iOS and wider-browser certification

Priority: P1 · Milestone: After P0 · Status: Planned / not commercially accepted.
Baseline: Not physically verified
Dependencies: F-052
Source items: MVP-21
Accountability: Owner/testers: hardware; agent: fixes and validation

Acceptance criteria:

- [ ] F-057-AC1: If included, a named physical iPhone/Safari pair passes the required game/account/checkout-return journey, audio interaction, asset rendering and local screenshot export.
- [ ] F-057-AC2: Touch navigation, background/resume, memory/performance and poor-network handling meet a recorded support-tier budget; desktop resize emulation is not accepted as iOS evidence.
- [ ] F-057-AC3: Any platform-specific unsupported behavior has a visible safe fallback, and support/marketing claims list the tested versions.
- [ ] F-057-AC4: The optional platform cannot weaken account/payment safety or block the declared desktop/Android MVP if it remains unverified and unadvertised.

Validation: Physical-device VP-12 certification plus targeted performance and payment tests; preserve videos/traces and record actual device/browser versions.
Required protocols: VP-06, VP-08, VP-12. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

## K · Expanded world, Echoes and cooperative bosses

<a id="f-058"></a>

### F-058 — World atlas and 24 genuinely large maps

Priority: P0 · Milestone: M0 design; M2–M5 production · Status: Planned / not commercially accepted.
Baseline: New v2 planning; not implemented
Dependencies: None (foundational contract).
Source items: MVP-22
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-058-AC1: A versioned atlas contains six connected regions, each with three outdoor field/forest maps, one cave, one compact safe hub and one compact boss domain: 24 large exploration maps plus12 compact spaces. It records adjacency, gates, landmarks, habitats and danger guidance. Region level is a warning, not an invisible travel lock.
- [ ] F-058-AC2: Every large map's shortest valid opposite-side traversal at base unbuffed walking speed is ≥30 seconds; target 45–90 seconds. Measure both meaningful axes/directions with combat, idle, loads and artificial detour padding excluded.
- [ ] F-058-AC3: Maps have two-dimensional navigable space, collision, branching paths and readable landmarks, not enlarged static pages or one thin panorama. All exits are reachable and reciprocal unless explicitly one-way with a safe return.
- [ ] F-058-AC4: Streaming preserves world position and object state across map boundaries. No unseen spawn, loot reset or broken gate occurs after backtracking, reload, fast movement or failed chunk loading.

Validation: Atlas graph audit plus measured input replays for every map/axis, shortest-path distance checks, streaming failure and return tests.
Required protocols: VP-01, VP-06, VP-13. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-059"></a>

### F-059 — Map-wide populations, rare spawns and durable respawn lives

Priority: P0 · Milestone: M2–M3 · Status: Planned / not commercially accepted.
Baseline: New v2 planning; not implemented
Dependencies: F-058
Source items: MVP-23
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-059-AC1: Each map declares its resident species, per-species count, valid random placement domain, level and respawn timing. All 94 wild species have a source map; six boss sources are separate. Lives are not bound to small fixed spawn groups.
- [ ] F-059-AC2: Current target quotas are Common24/Uncommon15/Rare or Very rare3 per species/map; Firstlight overrides these with144 Brimble,96 Bloomslime and48 Rattlebit. Ordinary deaths are replaced elsewhere immediately; rare deaths wait60s. Positions are reachable, avoid blockers and persist per life, at least900 world units from the prior position. Quotas/delays are separate from Echo odds; no old board-route or availability roll.
- [ ] F-059-AC3: The server issues stable spawn life IDs, reserves an engaged life and enforces death/respawn times. Refresh, region hopping, device changes and overlapping requests cannot accelerate a respawn or duplicate a life/reward.
- [ ] F-059-AC4: Personal exploration instances prevent kill stealing and cap actors per map/species; realm group bosses follow shared realm schedules. The UI shows current/target counts and real cooldowns. Legacy surplus world slots retire without deleting companions or changing reserved encounter/loot identities; server RNG is not exposed.

Validation: Coverage manifest, seeded spawn distribution, server-time tests, reload/parallel-session life claims and 24-map density/performance sweep.
Required protocols: VP-01, VP-07, VP-13. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-060"></a>

### F-060 — Exact Echo odds and honest independent loot tables

Priority: P0 · Milestone: M0 lock; M3 authority · Status: Planned / not commercially accepted.
Baseline: New v2 planning; not implemented
Dependencies: F-059
Source items: MVP-07, MVP-12, MVP-23
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-060-AC1: Starter Echoes roll at 10% per eligible kill; designated mid/late Echoes and every very-rare item roll at 0.01%. Use uniform integers 0–9,999 with respectively 1,000 and one successful outcomes, not floating-point percent ambiguity.
- [ ] F-060-AC2: Normal kills can roll coins/materials and an Echo independently under explicit versioned rows. A trainer-owned enemy companion never supplies a wild Echo. Table validation distinguishes per-kill, per-player and per-group scopes; multiple rare rows are not advertised as 0.01% total.
- [ ] F-060-AC3: No pity, first-kill guarantee, hidden streak modifier, paid luck or paid gameplay item changes rates. A legal owned Echo summons with 100% success; spawn availability is separately disclosed.
- [ ] F-060-AC4: Exact boundary/exhaustive tests prove probabilities; statistical sanity tests are secondary. Reload, duplicate settlement, changed loadout and failed summon writes cannot reroll one victory; each distinct eligible victory still gets its normal independent 0.01% chance regardless of previous drops or ownership.

Validation: Exhaust all 10,000 roll inputs per threshold; reject malformed tables; test eligible/ineligible deaths and duplicate receipts; independently reproduce probability quantiles.
Required protocols: VP-01, VP-02, VP-07, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-061"></a>

### F-061 — Private boss parties, readiness and reconnect

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.
Baseline: New v2 planning; not implemented
Dependencies: F-037, F-038, F-045
Source items: MVP-24
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-061-AC1: Two or three accounts on the same logical realm form an invite-only lobby, select class and zero-to-two owned companions each, view boss/scaling/reward rules and ready a legal build. One account cannot occupy multiple party slots.
- [ ] F-061-AC2: All ready members agree before the server reserves an available realm boss life; no joining a completed/in-progress fight, cross-realm joining or client-selected boss difficulty in production. Test level controls remain sandbox-only.
- [ ] F-061-AC3: Departure before pull cancels readiness safely. During combat the server auto-battle continues for disconnected players, permits authenticated reconnect for up to 120 seconds or until result, and persists receipts even if they do not return.
- [ ] F-061-AC4: Leader loss transfers lobby control without resetting a live fight. Invite expiry, rejection, full lobby, stale readiness, server unavailability and duplicate join/start requests have recoverable UI and no duplicate room or reward.

Validation: Two/three real test clients, invite/auth matrix, simultaneous joins/readies/starts, leader departure and timed reconnect with no leaked private state.
Required protocols: VP-03, VP-07, VP-14. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-062"></a>

### F-062 — Cooperative boss simulation and cross-party support

Priority: P0 · Milestone: M3–M4 · Status: Planned / not commercially accepted.
Baseline: New v2 planning; not implemented
Dependencies: F-004, F-036, F-061
Source items: MVP-24
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-062-AC1: The authoritative room supports at most three trainers and six companions against one boss and up to three adds: 13 combatants. Proposed 20-Hz host sends ordered versioned snapshots/events; clients cannot pause, accelerate, restart or decide results.
- [ ] F-062-AC2: Heals, shields and valid support may target living allied parties using documented priority, range and caps. Leadership shares only within its owner's party, never recursively across other trainers. Targeting allegiance and ownership remain visible.
- [ ] F-062-AC3: A trainer's death eliminates that trainer's companions from acting, but surviving friends continue. All trainers dead loses; boss dead with a surviving trainer wins; simultaneous deaths follow the versioned ordering rule and never settle both ways.
- [ ] F-062-AC4: Rewards require readiness at pull and at least one server-recorded valid attack or effective support contribution; shield absorption counts. Defeated/disconnected members retain eligibility earned before the result; late/spectator accounts do not. Ordinary group loot and the single group essence roll settle once.

Validation: Deterministic team-support/elimination fixtures, actual multi-client boss wins/losses, support-only eligibility, disconnects and latency/order/tampering tests.
Required protocols: VP-02, VP-07, VP-14, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-063"></a>

### F-063 — Repeatable ultra-rare boss essences and claim deduplication

Priority: P0 · Milestone: M3–M4 · Status: Planned / not commercially accepted.
Baseline: New v2 planning; not implemented
Dependencies: F-040, F-062, F-060
Source items: MVP-25
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-063-AC1: Every eligible group boss victory independently rolls 0.01% once for the group. Boss essences have no server-wide copy limit: previous drops, prior summoning, realm population and anyone's ownership do not change the chance.
- [ ] F-063-AC2: On a successful roll, the server chooses one eligible member uniformly and persists one reserved award for that victory. Inventory capacity, disconnect or already owning the boss cannot reroll the winner; a repeat essence remains an inventory item.
- [ ] F-063-AC3: Idempotency is keyed to the server-owned victory and loot row, not realm/species. Fifty repeated or concurrent claims of one victory produce one settled roll and at most one award; two distinct victories forced successful in isolated tests produce two legitimate essence items of the same species.
- [ ] F-063-AC4: Legal summoning succeeds 100% and consumes a specific owned Echo once; requests to summon another owned species create a new individual only on confirmation, while cancel/error preserves the item. Restart, deletion and backup recovery reconcile ordinary reward/summon receipts without duplicating old awards or blocking new victories. Multiple accounts in the same realm may own the boss; no global issuance or retirement ledger exists.

Validation: Race 50 claims of one victory, then force successful drops on distinct victories in one test realm; verify several owners, repeat recipient, consumption, restore and normal future odds.
Required protocols: VP-07, VP-09, VP-14, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-064"></a>

### F-064 — 100-species production manifest and quality batches

Priority: P0 · Milestone: M0 pipeline; M2–M5 completion · Status: Planned / not commercially accepted.
Baseline: New v2 planning; not implemented
Dependencies: F-006, F-024, F-058
Source items: MVP-04, MVP-26
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-064-AC1: The launch manifest lists at least100 genuinely distinct summonable species (94 wild/six boss). The initial100 use25 land,15 bird,4 frog,1 mythic,15 insect,3 spider,12 aquatic,10 reptile/newt,6 plant/fungus,6 spirit/construct and3 other-invertebrate inspirations. Each records source map, element, role, silhouette/art, five skills, innate,18-node tree and acquisition rules; skins/recolors do not count.
- [ ] F-064-AC2: All 520 skill assignments, 100 innates and 104 trees totaling 1,872 nodes are defined and validated. Shared mechanics and tree templates are allowed; each species needs a coherent identity and at least one tested useful build, with stronger balance sampling across class/role matchups.
- [ ] F-064-AC3: Produce and accept batches of ten after a first reference batch; each has animation/event clips, provenance, collision/anchor checks, working Echo summon and loadout tests. Completion is species-by-species, not a numeric placeholder counter.
- [ ] F-064-AC4: Commercial gates require all 100 complete; the final batch receives the same rubric. A smaller free prototype/pilot is explicitly labeled a test, never presented as satisfying this launch floor; boss species are tested in isolated grant-enabled realms.

Validation: Machine-readable roster checklist and per-batch evidence; all-species content/summon/animation traversal; stratified balance simulations and human reference review.
Required protocols: VP-01, VP-02, VP-04, VP-10, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-065"></a>

### F-065 — Spawn farming, automation and rare-loot abuse defenses

Priority: P0 · Milestone: M3–M5 · Status: Planned / not commercially accepted.
Baseline: New v2 planning; not implemented
Dependencies: F-039, F-045, F-059, F-061
Source items: MVP-27
Accountability: Implementation agent; owner accepts

Acceptance criteria:

- [ ] F-065-AC1: Server rules cap movement, fight start rate, spawn lifetimes and valid elapsed simulation, including explicitly supported solo 2× playback. Client teleport, clock edits, repeated disconnect and parallel tabs cannot generate extra eligible kills.
- [ ] F-065-AC2: Threat model covers scripted farming, account factories, boss-slot hoarding, support tagging, repeated invites and forged ownership. Rate/session controls and suspicious-action review are versioned and protect ordinary keyboard/touch accessibility.
- [ ] F-065-AC3: One home realm/account remains the launch routing policy; boss encounter access and spawn rules are server-authoritative without an essence-ownership cap. Private invites and the absence of trade/chat/markets keep the original bounded service scope.
- [ ] F-065-AC4: Staging adversarial tests show no known critical economic exploit. Suspicion never silently changes advertised drop odds; restrictions have a clear message and appeal/support route. Telemetry uses minimal approved data.

Validation: Unauthorized/rapid/spawn-race corpus, long legitimate farming control runs, multiple-account scenarios, rate-limit false positives and audited operator intervention.
Required protocols: VP-07, VP-09, VP-13, VP-14, VP-15. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.

<a id="f-066"></a>

### F-066 — World-scale production, load and cash rebaseline

Priority: P0 · Milestone: M0 pilot estimate; M5 release recheck · Status: Planned / not commercially accepted.
Baseline: New v2 planning; not implemented
Dependencies: F-024, F-036, F-053, F-058
Source items: MVP-28, MVP-19
Accountability: Agent: measurements and forecast; owner: time, budget and go/no-go

Acceptance criteria:

- [ ] F-066-AC1: The v1 ten-species/five-area solo estimate and recurring-cost allowance are explicitly withdrawn for v2. The 100-species/24-map/live-group scope is not represented as achievable within the old schedule or $1–2k total launch envelope.
- [ ] F-066-AC2: A bounded pilot measures time for a complete ten-species batch, one finished large map, a three-client boss, live spawn/loot service and rare-reward recovery. Record actual throughput, rework, asset size and host/database/bandwidth consumption.
- [ ] F-066-AC3: Reforecast remaining 90 species, 23 maps, hubs/encounters and online/commerce/QA work with dependencies, owner availability, contingency and a funded operations reserve. Distinguish unpaid labor hours from cash; do not treat AI output or existing assets as zero integration/QA effort.
- [ ] F-066-AC4: Before expensive production or launch, the owner accepts a dated schedule/capacity/budget or explicitly delays/releases a smaller labeled free pilot. Retaining all requirements is allowed, but uncertainty is visible and no service, ads or tools are purchased merely by this plan.

Validation: Pilot evidence and unit-cost/throughput worksheet, risk/contingency review and owner-approved forecast; repeat before G4/G5.
Required protocols: VP-06, VP-09, VP-10, VP-11. Evidence: pinned build/rules, fixtures/seeds, observed versus expected, failures, artifacts and reviewer; see VALIDATION_PLAN.md.
## Design references

Independent companion copies and visual party selection are implemented locally.
Current delivery boundaries are in features/delivery/REMAINING_SCOPE.md. WORLD_DESIGN.md scopes authored maps; CREATURE_DESIGN.md
scopes production art and per-species motion. CREATURE_REFERENCE.md and
CREATURE_DROPS.md enumerate all 100 live definitions separately from proposed
ordinary materials. Their data is checked against the runtime export.
Existing commercial criteria remain unchecked; planning is not final art delivery.
