# Commercial MVP — Feature backlog

Version 1.0 · 10 September 2026  
Source: [Commercial MVP scope](<Commercial MVP scope.md>)  
Companions: [Validation plan](VALIDATION_PLAN.md) · [Scope traceability](FEATURE_TRACEABILITY.md)

## How to use this backlog

This is the complete decomposition of the agreed planning scope: **57 feature/capability cards, 55 P0 and 2 optional P1, with 228 individually identified acceptance criteria**. Operations and business readiness are included because a commercial release needs them even though they are not player-facing screens.

This pass creates planning documents only. **Every acceptance checkbox starts unchecked.** “Existing prototype” describes a reusable baseline, not commercial acceptance. No new feature, test result, external account or release is claimed complete.

The three documents have different purposes:

- This file defines what each feature must deliver and its acceptance criteria.
- VALIDATION_PLAN.md defines test protocols, evidence, release gates and thresholds.
- FEATURE_TRACEABILITY.md maps every source delivery item and scope section here.

Priority P0 is required for the monetized MVP; it does not mean every P0 blocks a small free reference test. Stage gates define what can safely run earlier. P1 is optional and must not expand the main release without an explicit decision.

Dependencies name prerequisite feature contracts. Early development/spikes may use the existing baseline or isolated fixtures. A dependent feature cannot be commercially accepted against an unverified prerequisite. A multi-milestone feature may have a useful early slice without being accepted in full. No hidden parallel engineering team is assumed.

Acceptance IDs follow `F-001-AC1`. Validation suites `VP-01`–`VP-12`, design locks `DEC-01`–`DEC-06`, and release gates `G0`–`G5` are defined in VALIDATION_PLAN.md. Coefficients/tuning targets not fixed in the source require the stated design lock; a test cannot use an unspecified expected result.

Feature state workflow: **Planned → In progress → Implemented → Verified → Accepted**. Use **Waiting for evidence** when owner/device/cohort input is missing and **Needs work** after failure. Each criterion separately records Not run / Pass / Fail / Waiting / N/A with reason. A skipped check is not a pass. No blanket percentage-complete claim from checked boxes.

All features inherit the shared definition of done and safety rules in VALIDATION_PLAN.md. Stored evidence belongs in the proposed `tests/artifacts/features/<feature-id>/<build-id>/` location, with private player/payment evidence access-controlled outside public artifacts.

## Feature index

| ID | Feature | Priority | Milestone | Baseline |
| --- | --- | --- | --- | --- |
| [F-001](#f-001) | Explicit damage categories and STR / DEX / INT | P0 | M0 | Partial; correction pending |
| [F-002](#f-002) | Speed, accuracy, tiny dodge and VIT regeneration | P0 | M0 | Partial Speed; dodge/regen missing |
| [F-003](#f-003) | Trainer allocation, Leadership and stat previews | P0 | M0 | Existing prototype; production revalidation required |
| [F-004](#f-004) | Automatic combat, targeting and defeat rules | P0 | M0 | Existing prototype |
| [F-005](#f-005) | Party selection, three-skill priorities and formation | P0 | M1 | Existing prototype |
| [F-006](#f-006) | Roster, skill and innate-passive content contract | P0 | M0 | Existing prototype |
| [F-007](#f-007) | Four elements, statuses, shields and guard | P0 | M1 | Existing prototype |
| [F-008](#f-008) | Battle controls, inspection and actionable results | P0 | M1 | Existing controls; explanation improvements missing |
| [F-009](#f-009) | Companion XP, trainer level and release pacing | P0 | M2 | Existing level-100 prototype; level-20 release plan pending |
| [F-010](#f-010) | Eighteen-node ranked mastery trees | P0 | M2 | Existing shared-template prototype |
| [F-011](#f-011) | Earned coins, loot pools and recovery from empty supplies | P0 | M2 | Existing prototype; commercial tuning pending |
| [F-012](#f-012) | Inventory, consumables and item-use UX | P0 | M1 | Existing prototype; production UX pending |
| [F-013](#f-013) | Collection ownership and directed discovery | P0 | M2 | Existing prototype |
| [F-014](#f-014) | Post-victory contract capture | P0 | M1 | Existing local flow; server resolution pending |
| [F-015](#f-015) | Guaranteed first contract lesson | P0 | M1 | New launch exception |
| [F-016](#f-016) | Continuous traversal and five local hubs | P0 | M1 | Existing continuous trail; landmarks/navigation partial |
| [F-017](#f-017) | Physical cave and forest entrances | P0 | M0 | Requested; not implemented |
| [F-018](#f-018) | Three-encounter expeditions and route persistence | P0 | M2 | Existing prototype |
| [F-019](#f-019) | Five-chapter quest path and ending | P0 | M2 | New |
| [F-020](#f-020) | Ten authored trainer encounters | P0 | M2 | Five exist; five additional compositions planned |
| [F-021](#f-021) | Two five-enemy pack configurations | P0 | M2 | One exists; second planned |
| [F-022](#f-022) | Elderroot phases, public difficulty and developer isolation | P0 | M2 | Boss/test selector exist; public presets missing |
| [F-023](#f-023) | Three post-story challenges and earned recognition | P0 | M2 | New |
| [F-024](#f-024) | Art bible and approved reference encounter | P0 | M1 | Three pose-sheet characters exist; final reference unapproved |
| [F-025](#f-025) | Consistent full-roster and boss animation | P0 | M2 | Partial: three of twelve core characters |
| [F-026](#f-026) | Impact-synchronized VFX and combat feedback | P0 | M2 | Existing procedural effects; refinement needed |
| [F-027](#f-027) | World props, expedition arenas and Haven art | P0 | M2 | World paintings exist; new treatments required |
| [F-028](#f-028) | Music, sound effects and audio controls | P0 | M2 | Basic synthesized sound exists; production sound set missing |
| [F-029](#f-029) | Onboarding and coherent menu navigation | P0 | M1–M2 | Menus exist; guided first adventure incomplete |
| [F-030](#f-030) | Accessibility and input/settings quality | P0 | M5 | Partial responsive/reduced-motion support |
| [F-031](#f-031) | Small Haven display and local screenshot export | P0 | M2 | Collection screen exists; configurable scene new |
| [F-032](#f-032) | Appearance ownership, equipment and earned cosmetics | P0 | M4 | New |
| [F-033](#f-033) | Eight-product catalog and real previews | P0 | M4 | New |
| [F-034](#f-034) | Versioned client build and runtime asset pipeline | P0 | M0–M3 | Local dependency-free client; release pipeline new |
| [F-035](#f-035) | Supported-device performance and browser layout | P0 | M5 | Viewport checks exist; physical certification missing |
| [F-036](#f-036) | Shared simulator and server-runtime compatibility spike | P0 | M0–M3 | Pure client simulator exists; server runtime untested |
| [F-037](#f-037) | Managed accounts, server guests and recovery | P0 | M3 | New |
| [F-038](#f-038) | Cloud profile, concurrent saves and prototype migration | P0 | M3 | Local saves exist; cloud authority new |
| [F-039](#f-039) | Authoritative battle tickets and settlement requests | P0 | M3 | New |
| [F-040](#f-040) | Atomic economy settlement and durable receipts | P0 | M3 | Local atomic profile transactions only |
| [F-041](#f-041) | Data export, account deletion and retention controls | P0 | M3 | New |
| [F-042](#f-042) | Hosted checkout and purchase initiation | P0 | M4 | New |
| [F-043](#f-043) | Verified payment events and cosmetic entitlements | P0 | M4 | New |
| [F-044](#f-044) | Refunds, disputes and purchase support | P0 | M4 | New |
| [F-045](#f-045) | Authentication boundaries and abuse controls | P0 | M3 | New |
| [F-046](#f-046) | Reproducible deployment, environment isolation and rollback | P0 | M3 | Local preview only |
| [F-047](#f-047) | Backups, restore and entitlement reconciliation | P0 | M5 | New |
| [F-048](#f-048) | Minimal operator tools and kill switches | P0 | M4 | New |
| [F-049](#f-049) | Monitoring, cost controls and small-load capacity | P0 | M5 | New |
| [F-050](#f-050) | Minimal analytics and reliable cohort measurement | P0 | M1 instrumentation plan; M3–M5 delivery | New |
| [F-051](#f-051) | Outside-player studies and product decision reports | P0 | M1–M5 | No commercial player evidence established |
| [F-052](#f-052) | Integrated release regression and defect closure | P0 | M5 | Existing prototype suites; commercial suites missing |
| [F-053](#f-053) | Business, privacy, rights and budget readiness | P0 | Before public data collection / live commerce | Pending owner decisions; no commercial setup |
| [F-054](#f-054) | Landing page, launch media and support materials | P0 | M5 | New |
| [F-055](#f-055) | Controlled launch, commercial learning and first-month operations | P0 | M5 | New |
| [F-056](#f-056) | PT-BR localization | P1 | After P0 | Deferred P1 |
| [F-057](#f-057) | Safari / iOS and wider-browser certification | P1 | After P0 | Not physically verified |

## Detailed cards

## A · Combat and preparation

<a id="f-001"></a>

### F-001 — Explicit damage categories and STR / DEX / INT

Priority: P0 · Milestone: M0 · Status: Planned / not commercially accepted.  
Baseline: Partial; correction pending.  
Dependencies: F-006.  
Source items: MVP-01.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-001-AC1: Every basic attack and every damaging skill declares melee physical, ranged physical or magic. Validation rejects missing/unknown categories; projectile appearance or distance cannot choose the category.
- [ ] F-001-AC2: With other inputs held fixed, STR changes melee physical scaling only, DEX ranged physical scaling only, and INT magic scaling only. A mixed kit can use different attributes for its separate skills.
- [ ] F-001-AC3: Skill cards and the selected-fighter inspector display the actual category and governing attribute. Healing's INT relationship is explicitly documented rather than inferred from range.
- [ ] F-001-AC4: Independent numeric fixtures match the formula version in Companion stats.md before rounding and after final damage rounding; no old generic DEX damage bonus remains.

Validation: Test one basic and one skill in each category, mixed-kit skills, range changes, minimum/maximum legal attributes and malformed content. Derive expected numbers independently of the production helper.

Required protocols: VP-01, VP-02. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-002"></a>

### F-002 — Speed, accuracy, tiny dodge and VIT regeneration

Priority: P0 · Milestone: M0 · Status: Planned / not commercially accepted.  
Baseline: Partial Speed; dodge/regen missing.  
Dependencies: F-001, F-004.  
Source items: MVP-01.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-002-AC1: The locked rule sheet states whether AGI changes all ready-action opportunities or basic attacks only. The UI shows Speed and seconds consistently; AGI does not silently reduce cooldowns or increase travel speed.
- [ ] F-002-AC2: DEX reduces active cooldowns and counters AGI dodge under the recorded physical-hit formula. Magic, damage-over-time and unavoidable effects obey explicit eligibility rules. Bounds and coefficients are frozen in DEC-01 before verification.
- [ ] F-002-AC3: A dodged strike consumes its normal action/cooldown, shows a miss/dodge outcome and does not apply damage, on-hit Slow/Burn or hit-triggered bonuses. Cast-triggered and attempt-count passives follow their documented trigger, not accidental hit success.
- [ ] F-002-AC4: VIT increases HP and the recorded small defense/regen benefits. Fractional regen is retained, capped at maximum HP, stops on defeat and Overcharge, and cannot create healing-passive feedback loops. Same inputs/seed reproduce the same dodge sequence.

Validation: Use forced hit/miss RNG fixtures, boundary stats, 1×/2× playback, full/partial/dead HP, fractional multi-tick recovery and Overcharge transitions. Compare action counts and actual cooldown clocks separately.

Required protocols: VP-02, VP-03. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-003"></a>

### F-003 — Trainer allocation, Leadership and stat previews

Priority: P0 · Milestone: M0 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype; production revalidation required.  
Dependencies: F-001, F-002, F-009.  
Source items: MVP-01, MVP-06, MVP-08.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-003-AC1: STR/AGI/VIT/INT/DEX/Leadership have validated base values, increasing allocation costs, caps and a level-dependent budget. Invalid/negative/fractional/overspent allocations cannot be committed.
- [ ] F-003-AC2: Trainer level follows the highest owned companion, including benched species. Each class uses the same chosen trainer allocation unless a versioned design change explicitly introduces separate presets.
- [ ] F-003-AC3: Leadership shares the five eligible raw attributes once at the documented provisional fraction. It excludes Leadership itself, derived HP/damage, tree bonuses and recursively received stats.
- [ ] F-003-AC4: Allocation preview equals committed battle stats; insufficient points disables purchase, free reset refunds exactly, and edits invalidate unfinished combat without rerolling saved expedition content.

Validation: Independent budget and fractional-sharing examples at level/stat boundaries; change highest benched companion; allocate/respec/reload; verify no double share after trees, food or class changes.

Required protocols: VP-02, VP-03. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-004"></a>

### F-004 — Automatic combat, targeting and defeat rules

Priority: P0 · Milestone: M0 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype.  
Dependencies: F-006.  
Source items: MVP-01, MVP-03, MVP-17.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-004-AC1: Each ordinary side has exactly one trainer and two distinct monsters. Trainer death resolves the result immediately; monsters cannot continue to earn a later victory for a defeated trainer.
- [ ] F-004-AC2: Normal monster attacks select the closest living enemy monster with stable tie-breaking. Only explicitly declared exceptions target a trainer while its monsters live; no-trainer encounters fall back to valid monsters.
- [ ] F-004-AC3: Movement respects attack reach, arena bounds and separation. Out-of-range actors approach without banking a burst of attacks; dead units cannot act or obstruct targets.
- [ ] F-004-AC4: Normal, pack and boss fixtures end with finite valid state within the configured limit. Overcharge/time-limit rules are explicit; rendering rate, pause and playback speed cannot alter the result.

Validation: Nearest-distance ties, deaths during guarded/AoE damage, zero remaining monsters, five-enemy packs, exhausted cooldowns and at least the existing 1,000-build regression sample. Inspect an actual played battle as well as fast simulation.

Required protocols: VP-02, VP-03. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-005"></a>

### F-005 — Party selection, three-skill priorities and formation

Priority: P0 · Milestone: M1 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype.  
Dependencies: F-006.  
Source items: MVP-05, MVP-08.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-005-AC1: The player selects Druid or Mage and two different owned species. Each character has five selectable skills and exactly three distinct equipped priorities; duplicate selection swaps or is explicitly rejected without losing selections.
- [ ] F-005-AC2: Front/middle/back contains one party member each. Selecting an occupied position swaps members and updates preview and actual initial coordinates without changing identity or the trainer defeat objective.
- [ ] F-005-AC3: All six formations persist, survive class/species replacement and work in trainer, wild, pack and boss encounters. Formation grants no hidden bonus and does not override normal targeting.
- [ ] F-005-AC4: Edits retain focus and invalidate a paused fight; saved route identity/reward rolls remain unchanged. Invalid old values migrate to a documented safe default without clearing unrelated progress.

Validation: UI swap/reload/malformed-save cases, all six deployment permutations and each encounter type; assert model coordinates independently from displayed portraits.

Required protocols: VP-02, VP-03. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-006"></a>

### F-006 — Roster, skill and innate-passive content contract

Priority: P0 · Milestone: M0 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype.  
Dependencies: None; owner/external prerequisites still apply.  
Source items: MVP-04, MVP-05, MVP-06.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-006-AC1: The launch data lists exactly two classes and ten catchable species; each of the twelve characters has five skill choices, giving 60 definitions/assignments to validate, and each monster has one innate passive.
- [ ] F-006-AC2: Every skill exposes effect, amount, cooldown, target policy, range and damage category where relevant. Every passive states its trigger, eligible effects and per-battle limits.
- [ ] F-006-AC3: Stable IDs distinguish mechanics from names, portraits and cosmetic appearances. Content validation rejects unknown references, duplicate equipped skills and invalid numbers.
- [ ] F-006-AC4: All 60 skills and ten passives have at least one positive activation test and one relevant boundary or exclusion test; a changed tooltip cannot substitute for a functioning effect.

Validation: Enumerate content and test coverage by ID; direct skill/passive fixtures plus legal full-fight samples. Keep changing numeric balance in data rather than duplicating formulas in views.

Required protocols: VP-01, VP-02. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-007"></a>

### F-007 — Four elements, statuses, shields and guard

Priority: P0 · Milestone: M1 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype.  
Dependencies: F-004.  
Source items: MVP-01, MVP-06, MVP-17.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-007-AC1: The four-unit-element cycle is Water > Fire > Earth > Wind > Water; all sixteen pairs have the documented multiplier and rarity supplies no power bonus.
- [ ] F-007-AC2: Slow/Haste affect the documented movement/action rates, not skill cooldown clocks. Burn timing and expiry do not depend on actor update order.
- [ ] F-007-AC3: Guard redirects the documented share of trainer damage and applies element/overtime adjustment once; shields absorb correctly and weaker shields cannot replace or extend stronger ones.
- [ ] F-007-AC4: Heals cannot revive; Overcharge prevents healing/regen as specified. Cleanses, stacked status refreshes, innate passives and defeat interrupt safely without negative HP or shield values.

Validation: Sixteen-pair table, element-adjusted guard recursion, simultaneous expiry/hit, stronger/weaker wards, Slow+Haste, damage-over-time defeat and multi-target skill tests.

Required protocols: VP-02. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-008"></a>

### F-008 — Battle controls, inspection and actionable results

Priority: P0 · Milestone: M1 · Status: Planned / not commercially accepted.  
Baseline: Existing controls; explanation improvements missing.  
Dependencies: F-001, F-002, F-004, F-007.  
Source items: MVP-03, MVP-08.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-008-AC1: Pause/resume and 1×/2× keep animation/audio and simulation coherent. Switching away or hiding the browser follows a visible pause policy; return does not silently start a new encounter.
- [ ] F-008-AC2: Inspection shows selected character, target, level/element, HP, statuses, Speed/seconds, reach and skill cooldowns without relying on debug logs.
- [ ] F-008-AC3: Victory/defeat shows the correct objective, rewards/pending confirmation and trainer damage, healing and shielding contributions. A tutorial loss offers a concrete suggestion backed by the recorded battle.
- [ ] F-008-AC4: Restart, exit and loadout edits clearly distinguish a resumed fight from a fresh attempt. They cannot duplicate rewards, consume another reserved item on resume or claim an unplayed win.

Validation: Play real normal/wild/pack/boss fights; pause during cast/projectile and tab backgrounding; force tutorial losses and match explanations against event data. Server receipt acceptance is completed in F-040.

Required protocols: VP-03, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## B · Progression, collection and economy

<a id="f-009"></a>

### F-009 — Companion XP, trainer level and release pacing

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Existing level-100 prototype; level-20 release plan pending.  
Dependencies: F-006.  
Source items: MVP-06.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-009-AC1: A versioned release configuration supports the proposed level-20 cap, finale band 12–15 and explicit XP table; legacy level-100 sandbox saves stay separate and recoverable.
- [ ] F-009-AC2: Both active companions gain the exact eligible victory XP, even if one fell; losses/practice/forbidden rematches award none. Feeding and catch-level initialization follow the same cap.
- [ ] F-009-AC3: Trainer level is the maximum owned companion level, including benched species; no independent trainer XP or hidden rarity multiplier is introduced.
- [ ] F-009-AC4: On the defined novice cohort, measure median first ending against 2–4 hours and directed collection/challenge play against 6–10 hours. Record failures/leavers rather than counting only successful speedruns; tuning targets require the separate product review.

Validation: XP threshold/cap/overflow and food fixtures, benched-level changes, source-specific rewards; timed fresh-account campaigns and target-species collection diaries under VP-10.

Required protocols: VP-02, VP-10. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-010"></a>

### F-010 — Eighteen-node ranked mastery trees

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Existing shared-template prototype.  
Dependencies: F-003, F-009.  
Source items: MVP-06, MVP-08.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-010-AC1: Each class/species exposes eighteen valid nodes with stable IDs, prerequisites and rank caps from 3/5/10; separate budgets reflect its appropriate level and eligible achievements.
- [ ] F-010-AC2: No purchase exceeds budget/cap or bypasses prerequisites. Free respec refunds exactly; migration preserves valid investments or issues an explicit refund.
- [ ] F-010-AC3: Every offered branch has a usable effect for that character, including healing branches. Previewed rank changes agree with battle values and cap interactions.
- [ ] F-010-AC4: At the launch level budget, at least two distinct documented development paths per class are viable with legal companion builds; the UI does not imply all nodes can be maxed.

Validation: Enumerate all twelve trees, traverse prerequisites, over-rank/overspend attacks, type-specific affinity and tree/attribute stacking; prove example paths in campaign fixtures, then human review.

Required protocols: VP-01, VP-02, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-011"></a>

### F-011 — Earned coins, loot pools and recovery from empty supplies

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype; commercial tuning pending.  
Dependencies: F-004.  
Source items: MVP-06, MVP-07, MVP-12.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-011-AC1: One earned coin currency has a checked balance sheet of sources, sinks, XP/reward amounts and expected session income; no premium currency, paid supply or energy gate appears.
- [ ] F-011-AC2: Each region/type pair defines explicit species weights, coin range and independent/mutually exclusive loot rules. Empty tiers and single-species pools are supported; an entirely empty pool fails visibly.
- [ ] F-011-AC3: First wins, rematches, repeatable routes and challenges follow their declared reward rules. All balances/stacks remain nonnegative and safe integers.
- [ ] F-011-AC4: A fresh or exhausted account with zero coins and contracts can reach and win a documented free repeatable encounter to earn paper currency; catching or buying a missing species is not required to escape the empty-supply state.

Validation: Boundary RNG fixtures plus 100,000 seeded samples per distribution family; compare configured weights within the predeclared tolerance. Test a zero-everything account's full earn→inscribe→attempt loop, not just a price button.

Required protocols: VP-02, VP-03. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-012"></a>

### F-012 — Inventory, consumables and item-use UX

Priority: P0 · Milestone: M1 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype; production UX pending.  
Dependencies: F-009, F-011.  
Source items: MVP-08.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-012-AC1: All owned stacks show icon, name, quantity, category and actual use; filters and empty states work at 320/390/768/1440 CSS-pixel widths without hidden controls.
- [ ] F-012-AC2: Immediate XP food validates target and cap before consumption. Preparing a biscuit/ration reserves it; the first fresh eligible battle consumes once and applies the stated effect; resume does not consume again.
- [ ] F-012-AC3: Insufficient quantity, cancelled confirmation, failed save/request and duplicate activation cannot grant a free effect or lose an item without a recoverable receipt.
- [ ] F-012-AC4: Unbound/max-level targets are explained and disabled as appropriate. Decorative materials/trophies state that they lack combat effects; selection and scroll are retained after routine updates.

Validation: Mouse/keyboard/touch use of every consumable; double-click, reload, concurrent request, cap and insufficient-item tests; compare inventory delta with resulting XP/shield/HP values.

Required protocols: VP-03, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-013"></a>

### F-013 — Collection ownership and directed discovery

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype.  
Dependencies: F-006, F-009.  
Source items: MVP-06, MVP-07, MVP-08.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-013-AC1: Starter ownership and one-companion-per-species rules are explicit. Only owned species enter the player party; opponent/practice access cannot accidentally grant ownership.
- [ ] F-013-AC2: All ten species have a discoverable local habitat or directed route in the journal/collection. Expedition rarity is labeled availability, never a stat tier.
- [ ] F-013-AC3: Binding updates collection, XP/level, pact record and eligible party choices once. Duplicate species do not create stacked ownership or duplicate leveling benefits.
- [ ] F-013-AC4: The collection shows owned/unowned states, habitat guidance and ten-species completion without requiring extremely rare expedition rolls or purchases; reload preserves the same data.

Validation: Enumerate all ten acquisition routes; first/duplicate ownership and save reload; verify every species has a reachable source and useful legal composition in the balance coverage report.

Required protocols: VP-01, VP-03, VP-10. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-014"></a>

### F-014 — Post-victory contract capture

Priority: P0 · Milestone: M1 · Status: Planned / not commercially accepted.  
Baseline: Existing local flow; server resolution pending.  
Dependencies: F-004, F-011, F-013.  
Source items: MVP-07, MVP-12.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-014-AC1: Try to catch is available only for an eligible unowned wild spirit. The player opts in during active/paused combat, sees the chosen paper's chance and consumption rule, and can change/disarm before settlement.
- [ ] F-014-AC2: Normal capture resolves once after an actual victory, with 65% standard/90% illuminated initial rates; no low-HP threshold, damage floor, channeling or extra player action at the end.
- [ ] F-014-AC3: A winning armed attempt consumes one available contract on success or failure. Loss, abandonment before settlement, no opt-in and already-owned species consume none.
- [ ] F-014-AC4: Reload/resume/repeated result access cannot reroll the pending encounter or repeat consumption/ownership. The post-victory pull-to-Haven animation agrees with the confirmed result; pending server confirmation is never presented as a final catch.

Validation: Forced success/failure boundary rolls, every no-consumption branch, insufficient/reserved paper, opt-in changes, simultaneous tabs and disconnect before/after settlement; full receipt integration in F-040.

Required protocols: VP-02, VP-03, VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-015"></a>

### F-015 — Guaranteed first contract lesson

Priority: P0 · Milestone: M1 · Status: Planned / not commercially accepted.  
Baseline: New launch exception.  
Dependencies: F-014.  
Source items: MVP-07.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-015-AC1: One identifiable tutorial encounter explicitly advertises a guaranteed first bond and guides the player to opt in; it does not falsely display ordinary 65% odds.
- [ ] F-015-AC2: The guarantee grants exactly one intended species through the normal result/ownership path. Skipping or losing does not secretly exhaust the tutorial opportunity.
- [ ] F-015-AC3: After the tutorial bond, ordinary encounters use advertised rules, costs and probabilities; repeating/reloading the tutorial cannot farm ownership, free items or rewards.
- [ ] F-015-AC4: In the first-loop usability study, at least 8/10 newcomers can describe when capture happens and when paper is consumed without coaching; funnel/timing targets are evaluated separately in VP-10.

Validation: Fresh, skipped, failed, resumed and completed tutorial states; replay/duplicate-completion tests and a recorded first-time-user observation checklist.

Required protocols: VP-03, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## C · World and encounters

<a id="f-016"></a>

### F-016 — Continuous traversal and five local hubs

Priority: P0 · Milestone: M1 · Status: Planned / not commercially accepted.  
Baseline: Existing continuous trail; landmarks/navigation partial.  
Dependencies: None; owner/external prerequisites still apply.  
Source items: MVP-02, MVP-05.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-016-AC1: All five named areas are connected by traversable terrain with one following camera; crossing each boundary causes no teleport, replaced page or loss of party position.
- [ ] F-016-AC2: Each area has a recognizable local gathering point, landmark and clear trail. Solid placed obstacles cannot trap movement; no general-purpose dungeon/navigation platform is required.
- [ ] F-016-AC3: Keyboard, ground click/tap and trail-map walking can be interrupted; companions follow without persistent overlap or unbounded separation.
- [ ] F-016-AC4: Returning from menus/battles and reloading preserves an allowed world position. Dialogs/backgrounding stop movement; no stuck input remains after focus changes.

Validation: Walk the complete trail both directions; interrupt destination movement, boundary crossing, obstacle/edge clicks, modal/background events and reload; use an actual phone as well as viewport tests.

Required protocols: VP-03, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-017"></a>

### F-017 — Physical cave and forest entrances

Priority: P0 · Milestone: M0 · Status: Planned / not commercially accepted.  
Baseline: Requested; not implemented.  
Dependencies: F-016.  
Source items: MVP-02.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-017-AC1: There are exactly two accessible entrance objects per area: one cave and one forest, ten total, using recognizable small painted props rather than only sidebar buttons.
- [ ] F-017-AC2: Click/tap approaches the entrance; keyboard walking plus E interacts nearby. The panel opens only on interaction/arrival and identifies the exact area/type, species pool and reward information.
- [ ] F-017-AC3: Closing/cancelling restores world focus and position without consuming resources, starting combat or rerolling a route. Nearby prompts and offscreen focus/culling remain correct.
- [ ] F-017-AC4: An existing expedition is never silently replaced: the player can resume it or explicitly confirm abandonment. Leaving the current route preserves already-earned rewards.

Validation: Test both entrances in all five areas via actual approach; keyboard and touch cases, distant clicks, Esc, active route from another area and cancel; compare displayed pool with known data fixtures.

Required protocols: VP-03, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-018"></a>

### F-018 — Three-encounter expeditions and route persistence

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype.  
Dependencies: F-004, F-009, F-011, F-014, F-017.  
Source items: MVP-02, MVP-05, MVP-12.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-018-AC1: All ten area/type pools generate three legal encounters: one wild, one faction and a third 60%-wild choice, using versioned configuration and fixed saved seed.
- [ ] F-018-AC2: Departure and route progress clearly show encounter 1/2/3, full recovery between fights and local pool rules; caves/forests use the approved arena treatment without claiming walkable interiors.
- [ ] F-018-AC3: Winning advances one step and preserves rewards; losing closes the route without that fight's reward; confirmed abandonment retains earlier loot. Resume returns to the current valid step.
- [ ] F-018-AC4: Reload, preview, back/next, concurrent completion and loadout edits cannot skip a step, reroll species/loot or duplicate claims. The route's enemy level is fixed at creation under the locked release rule.

Validation: Enumerate ten pools, seeded route fixtures, omitted tiers, win/loss/abandon at every step, full-health reset, stale-step completion and reload; online authority in F-039/F-040.

Required protocols: VP-02, VP-03, VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-019"></a>

### F-019 — Five-chapter quest path and ending

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-016, F-020, F-021, F-022.  
Source items: MVP-05.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-019-AC1: Five chapters contain fifteen short objective steps total, plus onboarding/finale framing, with stable prerequisite/objective/reward IDs in data.
- [ ] F-019-AC2: The tracker names the current goal and reachable destination; collection, interaction and combat events advance only the matching eligible objective once.
- [ ] F-019-AC3: Every chapter and the final ending can be completed from a fresh legal account without a purchase, unavailable species, random-only bottleneck or developer control.
- [ ] F-019-AC4: Progress survives reload, repeated conversations and area revisits; missed/previously completed qualifying actions have an explicit recovery rule, and no quest softlocks behind an already-collected one-time item.

Validation: Full new-account campaign; prerequisite rejection, repeated event, pre-collected treasure/owned species and out-of-order exploration tests; trace each of fifteen objectives to its completion evidence.

Required protocols: VP-01, VP-03, VP-10. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-020"></a>

### F-020 — Ten authored trainer encounters

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Five exist; five additional compositions planned.  
Dependencies: F-004, F-006, F-007.  
Source items: MVP-05.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-020-AC1: Ten unique encounter IDs exist: five retained keepers and five original faction/challenger compositions, with appropriate area, dialogue/advice, legal party, level band and reward.
- [ ] F-020-AC2: Each matchup has a stated tactical lesson; at least one differs meaningfully in skills/roles from every other matchup rather than being only a larger HP number.
- [ ] F-020-AC3: Both classes can clear the campaign using the documented legal builds; trainer-targeting threats are labeled and have obtainable defensive answers.
- [ ] F-020-AC4: First-win reward/quest events are issued once; rematches remain available under declared reward rules and never reset first-win state.

Validation: Validate all parties and unique encounter definitions; matrix of two approved builds per class through the campaign; fresh/rematch/stale result cases and human tactical-lesson review.

Required protocols: VP-01, VP-02, VP-10. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-021"></a>

### F-021 — Two five-enemy pack configurations

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: One exists; second planned.  
Dependencies: F-004, F-006.  
Source items: MVP-05.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-021-AC1: Two authored pack IDs each use five weaker legal monsters and no enemy trainer; their compositions teach different preparation responses.
- [ ] F-021-AC2: All five enemies must be defeated within the encounter limit; player trainer death still loses immediately. Trainer-target skills find valid monster targets.
- [ ] F-021-AC3: The eight-unit arena keeps targets, portraits, HP bars and area effects readable and within bounds; no new species or unique arena is implied by a pack variant.
- [ ] F-021-AC4: Rewards are correct and issued once per eligible claim; both pack fixtures terminate for the approved build sample without invalid state or persistent movement stalls.

Validation: Five-to-zero enemy progression, AoE/trainer-skill fallback and timeout/death fixtures; real worst-case eight-unit playback feeds art/performance suites.

Required protocols: VP-02, VP-04, VP-06. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-022"></a>

### F-022 — Elderroot phases, public difficulty and developer isolation

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Boss/test selector exist; public presets missing.  
Dependencies: F-004, F-007, F-009.  
Source items: MVP-05, MVP-06.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-022-AC1: Elderroot has two functioning phases with visible charge, impact, phase change and recovery; the warning corresponds to actual damage and states preparation-based counterplay.
- [ ] F-022-AC2: Normal/Veteran/Mastery have explicit unlocks, level/stat configurations and reward rules. The first story ending is reachable within the release's intended finale band.
- [ ] F-022-AC3: The arbitrary level-1–100 selector exists only in a clearly separate development/practice mode. Test-mode flags and forged public levels cannot issue production XP, coins, ownership or challenge credit.
- [ ] F-022-AC4: Same-preset resume preserves a paused fight; switching/restarting creates an explicit fresh attempt. Both phases scale all intended attacks/skills/quake exactly once, with caps and no duplicate first-win claim.

Validation: All three public presets and both phases; legacy developer levels 1/5/25/100 in sandbox; direct API tampering, locked preset, cancel/resume/restart and reward-isolation checks.

Required protocols: VP-02, VP-03, VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-023"></a>

### F-023 — Three post-story challenges and earned recognition

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-011, F-019, F-022.  
Source items: MVP-05, MVP-06, MVP-09.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-023-AC1: Three fixed challenge definitions unlock after the ending, reuse existing encounters/level bands and state any party-composition objective before entry.
- [ ] F-023-AC2: Completion checks the actual frozen party/result, not a client claim or later loadout; ineligible parties are explained before commitment.
- [ ] F-023-AC3: Eligible challenges grant declared earned coins/recognition cosmetics; one-time appearance rewards are deduplicated and repeatable coin rules are explicit.
- [ ] F-023-AC4: Challenges can be attempted without daily login, subscription, energy, paid item or additional content system; at least two distinct strategies are demonstrated across the set.

Validation: Locked/unlocked transitions, party snapshot exploit, win/loss/rematch claims and legal strategy examples; connect appearance rewards to F-032/F-040.

Required protocols: VP-02, VP-03, VP-10. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## D · Presentation and usability

<a id="f-024"></a>

### F-024 — Art bible and approved reference encounter

Priority: P0 · Milestone: M1 · Status: Planned / not commercially accepted.  
Baseline: Three pose-sheet characters exist; final reference unapproved.  
Dependencies: F-004, F-008.  
Source items: MVP-03.  
Accountability: Owner: art/product approval; agent: implementation and evidence.

Acceptance criteria:

- [ ] F-024-AC1: A versioned art bible fixes proportions, silhouettes, palette, lighting, ground anchors, scale, typography and icon rules using original/cleared reference material.
- [ ] F-024-AC2: One reproducible encounter shows Druid, Emberfox and Stonehorn against Mage opposition, including movement, attacks, healing/shields, hit, defeat/victory and a separate contract example.
- [ ] F-024-AC3: The VP-04 rubric has no failing dimension, owner sign-off is recorded against a build/video, and at least 8/10 observed newcomers identify trainer/objective and one useful preparation change.
- [ ] F-024-AC4: Approval is for a played slice on named hardware, not a screenshot or a claim of complete Sword x Staff parity. Roster-wide production waits for this pipeline reference.

Validation: Capture the same seed/build at normal, 2× and reduced-motion settings; review the timed-impact/anchor rubric and uncoached user task sheet. Preserve the approved clip for later comparisons.

Required protocols: VP-04, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-025"></a>

### F-025 — Consistent full-roster and boss animation

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Partial: three of twelve core characters.  
Dependencies: F-024.  
Source items: MVP-04.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-025-AC1: Each of twelve core characters has idle, movement, basic attack, cast, hit, defeat and victory states, all mapped to real events. Elderroot additionally has charge, phase transition and recovery.
- [ ] F-025-AC2: Every state has a stable ground anchor/scale, no clipped body parts or sheet bleed, and appropriate timing; no character falls back to whole-portrait bobbing as its only attack animation.
- [ ] F-025-AC3: Turning, approach, melee recovery and flight remain readable at actual game size. Unit depth/health bars stay attached and dead characters cannot continue moving/attacking.
- [ ] F-025-AC4: Pause, 2×, browser suspension, low-effects and reduced-motion retain correct state; all required assets load, with a nonblank error fallback and no mechanics change.

Validation: Maintain a character×state coverage contact sheet plus actual clips for all thirteen characters; side-by-side reference rubric, pause/resize tests and asset-failure injection.

Required protocols: VP-04, VP-06. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-026"></a>

### F-026 — Impact-synchronized VFX and combat feedback

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Existing procedural effects; refinement needed.  
Dependencies: F-008, F-024.  
Source items: MVP-03, MVP-04.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-026-AC1: All sixty skills use an appropriate reusable VFX family from physical impact/projectile, elemental bolt, area burst, heal, ward, movement/status and contract; bypass and boss warning effects are distinguishable.
- [ ] F-026-AC2: Visible contact/projectile arrival, HP delta, hit reaction and sound share one logical impact event. Presented timing is within the VP-04 tolerance at 1×/2×; visual changes do not delay or alter authoritative simulation.
- [ ] F-026-AC3: Effects do not hide the trainer objective or permanently obscure targets/HP bars in eight-unit fights; healing, guarding, damage and dodging have distinguishable feedback.
- [ ] F-026-AC4: Pause freezes timed presentation; low-effects/reduced-motion disable optional shake/flashes while retaining essential tells, result information and contract outcome.

Validation: Event timestamps versus frame/video markers, forced overlaps, projectile+defeat, no-target casts, healing/guard/dodge events and eight-unit stress playback.

Required protocols: VP-04, VP-06. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-027"></a>

### F-027 — World props, expedition arenas and Haven art

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: World paintings exist; new treatments required.  
Dependencies: F-016, F-017, F-024.  
Source items: MVP-02, MVP-04, MVP-05, MVP-09.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-027-AC1: Five areas retain readable connecting paths and recognizable landmarks; cave and forest props are visually distinct, consistently scaled and correctly depth-sorted.
- [ ] F-027-AC2: One genuine cave-interior and one forest-clearing battle treatment exist, with area-appropriate prop/palette variants; cave presentation is not just a dark outdoor overlay.
- [ ] F-027-AC3: One fixed Haven backdrop supports three decoration sockets and the trainer/companion display without obscuring them.
- [ ] F-027-AC4: All new/exported assets conform to the art bible, alpha/edge requirements and runtime manifest; originals and attribution/provenance remain recoverable outside the initial download.

Validation: Visual inspection in each of ten route contexts and five world areas; alpha/edge/anchor checks, actual-size screenshots and asset-manifest audit.

Required protocols: VP-01, VP-04. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-028"></a>

### F-028 — Music, sound effects and audio controls

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Basic synthesized sound exists; production sound set missing.  
Dependencies: F-026.  
Source items: MVP-04, MVP-17.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-028-AC1: Three short loop assets and a reusable set of approximately 20–30 cues cover exploration, combat/boss/Haven usage, attacks, spells, guard/heal, warning, contract, results and UI; no voice acting requirement.
- [ ] F-028-AC2: Sound starts only after permitted user interaction, loops transition without obvious clipping/gaps, and excessive simultaneous cues are limited so impacts remain distinguishable.
- [ ] F-028-AC3: Master/music/effects controls and mute persist; pause/background policies do not leave orphaned sounds or create duplicate loops on return.
- [ ] F-028-AC4: Every audio asset has cleared provenance and correct runtime export; muting removes no essential gameplay information.

Validation: Headphone/speaker review at quiet/loud settings, overlapping hits, repeated tab changes, blocked-autoplay and reload; compare impact timing with VP-04 and inventory of licensed cues.

Required protocols: VP-04, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-029"></a>

### F-029 — Onboarding and coherent menu navigation

Priority: P0 · Milestone: M1–M2 · Status: Planned / not commercially accepted.  
Baseline: Menus exist; guided first adventure incomplete.  
Dependencies: F-008, F-010, F-012, F-015, F-019.  
Source items: MVP-07, MVP-08.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-029-AC1: Explore, Party & Bag and Battle remain the primary destinations. Relevant subpages cover preparation, formation, attributes, trees, inventory, collection/Haven and appearance without orphaned screens.
- [ ] F-029-AC2: A useful starter build and skippable contextual tutorial teach trainer protection, capture and later systems progressively; the first battle starts within the VP-10 two-minute target for the defined novice sample.
- [ ] F-029-AC3: Selections, focus and scroll survive small edits. Stat/rank previews equal committed effects and destructive resets are outside the ordinary public play controls with explicit confirmation.
- [ ] F-029-AC4: Required empty/error/loading/offline/login-expired/insufficient-resource/purchase-pending states have a clear recovery action and never fabricate success or silently discard progress.

Validation: Fresh and returning-user task scripts, skipped/restarted tutorial, all specified UI states, keyboard/touch walkthrough; late Haven/shop screens inherit and are checked under the same navigation contract.

Required protocols: VP-03, VP-05, VP-10. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-030"></a>

### F-030 — Accessibility and input/settings quality

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.  
Baseline: Partial responsive/reduced-motion support.  
Dependencies: F-026, F-028, F-029, F-031, F-033, F-042.  
Source items: MVP-08, MVP-17.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-030-AC1: All launch screens and dialogs can be completed with keyboard alone, have visible focus, correctly labeled controls, modal focus containment/restoration and no pointer-only essential action.
- [ ] F-030-AC2: At 320/390/768/1440 CSS-pixel widths and 200% text zoom, required controls/content remain accessible without unintended horizontal page overflow; touch actions have the VP-05 target size.
- [ ] F-030-AC3: Text/icon contrast meets the project targets, and element/status/win-loss meaning is not conveyed solely by color, sound or animation.
- [ ] F-030-AC4: Reduced motion, effects/flash/shake options and audio controls persist. Essential warnings survive those settings; no known repeated flashing hazard is shipped.

Validation: Automated DOM/accessibility checks plus manual keyboard, zoom, screen-reader spot checks and two physical-phone flows. Automated scans alone do not certify accessibility.

Required protocols: VP-05, VP-12. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## E · Haven and cosmetics

<a id="f-031"></a>

### F-031 — Small Haven display and local screenshot export

Priority: P0 · Milestone: M2 · Status: Planned / not commercially accepted.  
Baseline: Collection screen exists; configurable scene new.  
Dependencies: F-013, F-025, F-027.  
Source items: MVP-09.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-031-AC1: One fixed scene displays the trainer and selected owned companions with exactly three decoration sockets and one background/style selector.
- [ ] F-031-AC2: Selecting a socket previews/equips only eligible owned decorations; unequip/replace/cancel works and the layout survives returning from combat and reloading.
- [ ] F-031-AC3: A local image export reproduces the player's scene without private email/account identifiers, remote upload, blank assets or browser-tainted-canvas failure.
- [ ] F-031-AC4: No walkable housing map, drag-grid construction, chores, AFK production, visiting friends or public image hosting is introduced.

Validation: Every socket/background state, empty ownership, rapid replace, locked decoration, reload and screenshot pixel/content review at desktop/mobile resolutions.

Required protocols: VP-03, VP-04, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-032"></a>

### F-032 — Appearance ownership, equipment and earned cosmetics

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-031, F-040.  
Source items: MVP-09, MVP-13.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-032-AC1: Appearance slots accept only owned compatible items; class/species changes restore valid defaults rather than applying an incompatible skin.
- [ ] F-032-AC2: At least three attractive earned appearance rewards have documented attainable sources and are distinct from merely retaining the default outfit.
- [ ] F-032-AC3: All appearance settings persist to the correct account and restore on another device. Gameplay reset cannot erase purchase history or paid ownership.
- [ ] F-032-AC4: For every paid and earned appearance, identical combat snapshot/seed produces identical stats, targeting, timing, outcomes and reward probabilities; rendered visibility remains within the same readability floor.

Validation: Cross-account/unowned/incompatible equip requests, reward duplication, class swap and save restoration; automated cosmetic-invariance matrix plus visual checks, not only a zero-stat field audit.

Required protocols: VP-02, VP-03, VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-033"></a>

### F-033 — Eight-product catalog and real previews

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-025, F-032.  
Source items: MVP-13.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-033-AC1: The launch catalog contains eight paid products: two trainer sets, two companion variants, two contract visual styles and two Haven bundles; contents, compatible characters and ownership state are explicit.
- [ ] F-033-AC2: Every item previews on its actual character/scene, including motion where relevant, without granting/equipping an unowned paid entitlement.
- [ ] F-033-AC3: Prices are direct supported local-currency amounts from approved server catalog data. No premium currency, randomized purchases, fake scarcity, gameplay advantage or duplicate-owned sale is offered.
- [ ] F-033-AC4: Preview, cancel, owned, unavailable, expired price and pending purchase states are usable; the store is not forced into onboarding before the first real gameplay experience.

Validation: Catalog/schema and price-version fixtures; preview each SKU, verify exact bundle members, duplicate/overlapping ownership behavior and purchase-disabled states. Final price/currency policy is DEC-04.

Required protocols: VP-01, VP-03, VP-05. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## F · Client and online foundation

<a id="f-034"></a>

### F-034 — Versioned client build and runtime asset pipeline

Priority: P0 · Milestone: M0–M3 · Status: Planned / not commercially accepted.  
Baseline: Local dependency-free client; release pipeline new.  
Dependencies: F-024.  
Source items: MVP-10.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-034-AC1: One reproducible build produces a versioned client/content manifest with stable asset hashes, appropriate cache policy and no development/test files or secrets in the public bundle.
- [ ] F-034-AC2: Only needed starter/world/first-battle assets block initial play; other areas, unused sheets, shop previews and source-art/history are excluded from that initial transfer.
- [ ] F-034-AC3: Assets have optimized runtime exports, load/error states and nonblank fallbacks; a missing essential encounter asset prevents a broken battle start with a recoverable explanation.
- [ ] F-034-AC4: Client, schema and rules versions are explicit. Stale cached versions cannot combine incompatible content or award online progress under unknown rules.

Validation: Repeat build/hash comparison, cold/warm cache and offline/missing-asset tests; inspect network transfer and exported file manifest; retain source assets unmodified.

Required protocols: VP-01, VP-03, VP-06. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-035"></a>

### F-035 — Supported-device performance and browser layout

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.  
Baseline: Viewport checks exist; physical certification missing.  
Dependencies: F-025, F-026, F-027, F-031, F-034.  
Source items: MVP-10, MVP-17.  
Accountability: Agent: measurement tooling; owner/testers: physical devices and sign-off.

Acceptance criteria:

- [ ] F-035-AC1: The named supported hardware/browser matrix passes initial download ≤8 MB and first playable ≤8 seconds under the VP-06 10-Mbps/100-ms cold-load protocol.
- [ ] F-035-AC2: Representative desktop targets 60 FPS/p95 frame time ≤20 ms; chosen physical midrange Android targets 30 FPS/p95 ≤40 ms with documented effects settings in the worst eight-unit encounter.
- [ ] F-035-AC3: A warmed ten-minute exploration/combat loop has no repeated >100-ms stalls; a thirty-minute repeat-route soak has no tab crash or persistent retained-memory growth under VP-06.
- [ ] F-035-AC4: First-battle actors load before combat; touch, background/foreground, resize and poor-network recovery pass. The support statement lists actual tested models/versions and does not claim untested iOS/Safari support.

Validation: Recorded cold loads, performance traces, videos and memory samples on named real devices. Viewport emulation and model fast-forward cannot satisfy FPS/device acceptance.

Required protocols: VP-06, VP-12. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-036"></a>

### F-036 — Shared simulator and server-runtime compatibility spike

Priority: P0 · Milestone: M0–M3 · Status: Planned / not commercially accepted.  
Baseline: Pure client simulator exists; server runtime untested.  
Dependencies: F-001, F-002, F-003, F-004, F-007, F-010.  
Source items: MVP-10, MVP-12.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-036-AC1: Versioned combat/progression content runs without DOM/browser state in the chosen server runtime; display names, assets and local storage are not simulation dependencies.
- [ ] F-036-AC2: The fixed golden corpus produces the same canonical result across Chrome, Edge and server: winner, ticks, unit state, seed-driven decisions and claimed rule version.
- [ ] F-036-AC3: Worst-case replay benchmarks include maximum battle duration/eight units/capped builds; p95 replay CPU is <200 ms with documented runtime and headroom to configured limits.
- [ ] F-036-AC4: If equivalence or budget fails, record and implement a bounded optimization/runtime decision before authoritative launch; never accept a replay backend on assumption alone.

Validation: Golden/reference snapshots and at least 1,000 representative generated fights; cross-runtime result hashes and measured CPU, not wall-clock network latency. Run an early spike, repeat after final rules lock.

Required protocols: VP-02, VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-037"></a>

### F-037 — Managed accounts, server guests and recovery

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: None; owner/external prerequisites still apply.  
Source items: MVP-11.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-037-AC1: An online guest can reach the first fight without email. Its durable identity/progress is server-issued if it can later link to a registered account.
- [ ] F-037-AC2: Registration/sign-in/recovery/sign-out use managed authentication and a tested production email sender; invalid/expired/reused credentials or links produce safe recoverable messages.
- [ ] F-037-AC3: Guest conversion transfers the correct progress once. Linking to an existing account uses an explicit conflict/merge policy and cannot attach another user's state.
- [ ] F-037-AC4: A recoverable verified account is required before purchase; sessions expire/revoke correctly and logout does not destroy saved ownership. Abuse controls are validated with F-045.

Validation: Fresh/returning account, guest→new/existing account, expired token, password/link recovery, concurrent linking and lost email scenarios; live email/public registration requires separate owner approval.

Required protocols: VP-03, VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-038"></a>

### F-038 — Cloud profile, concurrent saves and prototype migration

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.  
Baseline: Local saves exist; cloud authority new.  
Dependencies: F-003, F-010, F-012, F-013, F-019, F-037.  
Source items: MVP-11.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-038-AC1: Server records cover ownership/XP, trainer attributes, trees, party/formation, inventory/coins, unlocks/routes and appearance using stable IDs/schema versions.
- [ ] F-038-AC2: A change confirmed on device A appears after sign-in on device B. Concurrent tabs use revisions/transactions; a stale write receives a recoverable conflict instead of overwriting newer progression.
- [ ] F-038-AC3: Network loss, reload and token expiry preserve the last acknowledged state and pending-operation status; invalid/negative/unowned values cannot be installed by arbitrary client save JSON.
- [ ] F-038-AC4: Legacy prototype saves remain separately playable/exportable and never become proof of online currency or paid entitlement. Migration/wipe policy is explicit before beta invites and no paid-ownership wipe is permitted.

Validation: Two-device/two-tab interleavings, reordered/offline requests, corrupted and older schemas, high-level local profiles and recoverable migration failure; compare full semantic snapshots after restore.

Required protocols: VP-03, VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-039"></a>

### F-039 — Authoritative battle tickets and settlement requests

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-036, F-037, F-038, F-045.  
Source items: MVP-12.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-039-AC1: Starting an eligible encounter snapshots legal party, stats, rules version, seed, account revision and consumables into a unique server-owned ticket; reward/capture RNG is never trusted from the browser.
- [ ] F-039-AC2: Client rendering predicts from the snapshot, while server recomputation establishes the accepted outcome. Forged winner, level, damage, unlock, seed or reward fields cannot change settlement.
- [ ] F-039-AC3: Capture opt-in is recorded before settlement; cancellation, respec and attempt timing follow the declared DEC-03 policy, including permitted 2× playback. Delayed/retried requests cannot edit an already settled ticket.
- [ ] F-039-AC4: Resume/reconnect retrieves the valid current ticket or receipt; local practice remains reward-free. Expired/stale/incompatible tickets fail safely without fabricated victory or unexplained item loss.

Validation: Tamper every economically meaningful field; alter client clock/time rate, switch build after start, retry opt-in/settlement around races, send another account's ticket and replay an old rules version.

Required protocols: VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-040"></a>

### F-040 — Atomic economy settlement and durable receipts

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.  
Baseline: Local atomic profile transactions only.  
Dependencies: F-014, F-018, F-039.  
Source items: MVP-12.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-040-AC1: One database transaction settles encounter result, inventory consumption, XP/coins, bound species, first-win/challenge claims and expedition step with an immutable receipt.
- [ ] F-040-AC2: At least 50 concurrent duplicate submissions for the same eligible ticket cause exactly one economic mutation and return the same settled receipt; losing/no-op paths consume only explicitly allowed items.
- [ ] F-040-AC3: Failure injected before/after each transaction boundary results in either no committed mutation or the complete receipt, never partial rewards or consumed paper without recorded outcome.
- [ ] F-040-AC4: Unique claim IDs, balance constraints and account ownership are enforced server-side; receipt recovery after disconnect produces the same state and cannot advance a route twice.

Validation: Concurrent/reordered requests, intentional process/connection failure, repeated result page, already-owned capture, prepared-item resume, quest reward and versioned receipt replay; reconcile ledger deltas with balances.

Required protocols: VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-041"></a>

### F-041 — Data export, account deletion and retention controls

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-038.  
Source items: MVP-11, MVP-16.  
Accountability: Agent: implementation/tests; owner/adviser: retention policy.

Acceptance criteria:

- [ ] F-041-AC1: An authenticated user can request their own readable account/progression data and deletion through an explained flow; authentication is reconfirmed for destructive actions.
- [ ] F-041-AC2: Deletion follows the owner-approved category/retention policy, revokes sessions and removes/anonymizes appropriate gameplay/analytics identifiers without exposing another account.
- [ ] F-041-AC3: Any legally required payment/audit retention is disclosed, restricted and separated from active gameplay identity; the system does not promise to erase records that must be retained.
- [ ] F-041-AC4: Deletion/export failure is retryable with a tracked status; restore procedures reapply deletion records so a backup restore does not silently resurrect an active deleted account.

Validation: Own/other account requests, expired sessions, duplicate deletion, partial provider failure and restored backup with deletion tombstones; privacy-policy owner review supplies legal retention values.

Required protocols: VP-07, VP-09, VP-11. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## G · Commerce

<a id="f-042"></a>

### F-042 — Hosted checkout and purchase initiation

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-033, F-037, F-045.  
Source items: MVP-14.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-042-AC1: An authenticated recoverable account can buy only an eligible server-priced SKU/currency/version through hosted checkout; no card data or payment secret enters game storage/client code.
- [ ] F-042-AC2: Account, order and provider-session IDs are bound server-side. Forged price, account, currency, quantity or owned/disabled SKU requests are rejected before charging.
- [ ] F-042-AC3: Success redirect alone grants nothing. Cancel, decline, authentication challenge, delayed payment and browser closure have distinct recoverable states; reopening retrieves pending order status.
- [ ] F-042-AC4: Checkout initiation is idempotent against double-click/retry and prevents unintended concurrent duplicate purchases. Test/live environments are isolated; real charges remain disabled until the separate commercial authorization gate.

Validation: Provider sandbox for all checkout states, mismatched IDs/price versions, two tabs and closed-return page; a real transaction is not part of ordinary automated acceptance.

Required protocols: VP-07, VP-08. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-043"></a>

### F-043 — Verified payment events and cosmetic entitlements

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-040, F-042.  
Source items: MVP-14.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-043-AC1: Server verifies provider authenticity and paid/settled status before fulfilling; only verified events for the matching live/test environment, account and order can create a grant.
- [ ] F-043-AC2: Duplicate and concurrent events produce one durable order fulfillment and exactly the bundle's entitlements. Out-of-order/delayed events cannot revert to an incorrect unpaid/paid state.
- [ ] F-043-AC3: Paid users recover ownership after reload, sign-in on a new device and payment completion with no return-page visit; pending UI reconciles to the server record.
- [ ] F-043-AC4: Append-only provider-event/order/grant records retain unique IDs and status history. Failed fulfillment is visible and retryable, and grants cannot be fabricated by local storage or catalog edits.

Validation: Replay valid/invalid signatures and event orders, 50 duplicate/concurrent deliveries, delayed success, missing redirect, partial fulfillment failure and cross-device restoration for all eight SKUs.

Required protocols: VP-08. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-044"></a>

### F-044 — Refunds, disputes and purchase support

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-043, F-048.  
Source items: MVP-14, MVP-16.  
Accountability: Agent: implementation/tests; owner: support and live-charge approval.

Acceptance criteria:

- [ ] F-044-AC1: Supported refund/dispute transitions update the order and affected grants under the approved policy; repeat or out-of-order events cannot duplicate a refund or revoke unrelated ownership.
- [ ] F-044-AC2: If an appearance has another valid earned/paid grant, revoking one source does not remove that remaining entitlement. An equipped revoked item falls back safely without affecting gameplay.
- [ ] F-044-AC3: Support can trace an order, inspect its events and reprocess a failed fulfillment/refund with authorization and an audit reason; the player receives clear purchase/pending/support information.
- [ ] F-044-AC4: Sandbox full/partial/refused refund and dispute cases pass where supported. Any live transaction/refund test requires separate owner approval and records the actual costs/outcome; gameplay reset never destroys payment history.

Validation: Order/grant state-machine matrix, overlapping bundles/earned ownership, equipped revocation, repeated support retry and a denied non-operator request.

Required protocols: VP-08, VP-09. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## H · Operations and security

<a id="f-045"></a>

### F-045 — Authentication boundaries and abuse controls

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-037.  
Source items: MVP-11, MVP-12, MVP-14, MVP-17.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-045-AC1: Every protected API/database operation checks identity and ownership, including profile, battle, inventory, appearance, order and operator routes. Guessing another ID never reveals or changes that account.
- [ ] F-045-AC2: Inputs have schema/range/size validation; sensitive configuration is server-side and absent from public artifacts/logs. Access/refresh/operator sessions follow the recorded expiry/revocation policy.
- [ ] F-045-AC3: Rate/attempt/request-size limits cover anonymous signup/email, login, battle starts/settlement, purchase initiation and export; rejected requests do not partially mutate state.
- [ ] F-045-AC4: Failure messages avoid secret exposure and account enumeration where practical. Security tests include expired/forged credentials, injection/XSS strings, replay and least-privilege denied operations; no known critical authorization defect remains.

Validation: Two real isolated test accounts plus anonymous/operator roles, endpoint permission matrix, malicious payload corpus, secret scan and approved staged abuse burst; new endpoints inherit the matrix.

Required protocols: VP-07. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-046"></a>

### F-046 — Reproducible deployment, environment isolation and rollback

Priority: P0 · Milestone: M3 · Status: Planned / not commercially accepted.  
Baseline: Local preview only.  
Dependencies: F-034.  
Source items: MVP-10, MVP-16.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-046-AC1: Development, staging and production have separate databases, secrets, auth callbacks, payment modes and visible environment labels; a test purchase/ticket cannot mutate live state.
- [ ] F-046-AC2: A reproducible build passes required checks before deployment; assets/client/rules/schema are versioned and served over HTTPS without depending on the owner's laptop.
- [ ] F-046-AC3: Compatible upgrades preserve active accounts/tickets; incompatible versions are rejected or migrated with an explained restart/recovery path rather than mixed-rule settlement.
- [ ] F-046-AC4: A staging rollout and rollback drill restores the previous client/content safely, including stale caches. Database migrations use a documented forward/recovery strategy; rollback cannot discard paid grants.

Validation: Clean build/deploy manifest, cross-environment requests, stale client/cache, interrupted release and rollback rehearsal; production deployment itself needs owner permission.

Required protocols: VP-01, VP-07, VP-09. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-047"></a>

### F-047 — Backups, restore and entitlement reconciliation

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-038, F-040, F-043, F-046.  
Source items: MVP-16.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-047-AC1: Automated backups cover the declared data categories and have visible success/failure status; the initial ordinary-progress recovery-point objective is at most 24 hours, explicitly documented.
- [ ] F-047-AC2: A clean staging environment restores a backup and passes account/progression/ledger consistency checks using a written runbook; duration and actual recovery point are recorded.
- [ ] F-047-AC3: Payment records reconcile to stable account/order IDs so missing paid grants can be reconstructed without duplicate grants; unresolved transactions enter a visible support queue rather than being silently omitted.
- [ ] F-047-AC4: Restore preserves/reapplies deletion records and operator restrictions. A backup file existing without a successful restore/reconciliation drill does not satisfy acceptance.

Validation: Create known accounts/orders/deletions around a backup boundary, simulate loss and restore, then replay verified payment history twice; compare balances, rights and receipt hashes.

Required protocols: VP-08, VP-09. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-048"></a>

### F-048 — Minimal operator tools and kill switches

Priority: P0 · Milestone: M4 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-040, F-043, F-045.  
Source items: MVP-16.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-048-AC1: Authorized operators can find an account/order, inspect receipts/events, retry fulfillment and issue a justified correction; ordinary players cannot access these actions.
- [ ] F-048-AC2: Corrections, retries and entitlement decisions record operator identity, reason, timestamp and before/after/reference IDs; repeated requests remain idempotent.
- [ ] F-048-AC3: Store and individual encounter/route kill switches prevent new affected operations server-side, including direct API calls, while preserving already-issued receipts and pending payment reconciliation.
- [ ] F-048-AC4: Players see a safe temporary-unavailable/support message and can access unaffected parts of the game; toggles cannot turn off recovery of a legitimately paid order.

Validation: Role-denial checks, audited correction/retry, toggles during active battle/checkout and repeated toggles; verify client and API behavior independently.

Required protocols: VP-07, VP-08, VP-09. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-049"></a>

### F-049 — Monitoring, cost controls and small-load capacity

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-039, F-040, F-043, F-046.  
Source items: MVP-16, MVP-17.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-049-AC1: Dashboards/alerts show server errors, replay CPU, DB contention, email/checkout failures and spending/usage thresholds without logging secrets or unnecessary personal data.
- [ ] F-049-AC2: The approved staging load profile supports 100 active-session equivalents, about 1.7 average settlements/s and a burst of 20 settlements/s for 15 minutes with representative login/save traffic.
- [ ] F-049-AC3: At that load, ordinary start/save/settle APIs have p95 latency <1 second, replay CPU stays in its budget and there are no lost/duplicate economic commits or cross-account effects.
- [ ] F-049-AC4: Alert thresholds, invitation/rate limits, campaign stop conditions and named incident owner are set within the cash envelope. An injected failure reaches the owner and the documented mitigation works.

Validation: Approved synthetic load with unique legitimate tickets, race/failure injection, cost forecast from measured usage, alert delivery and kill-switch/campaign-stop rehearsal; static CDN transfer measured separately.

Required protocols: VP-07, VP-09. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## I · Validation and launch

<a id="f-050"></a>

### F-050 — Minimal analytics and reliable cohort measurement

Priority: P0 · Milestone: M1 instrumentation plan; M3–M5 delivery · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-037.  
Source items: MVP-15.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-050-AC1: Versioned pseudonymous events cover loading/activation, combat, capture, loadout/formation, routes, chapters/boss, Haven, preview, checkout, confirmed purchase/refund and unexpected session errors.
- [ ] F-050-AC2: Server-originated economic events are deduplicated and distinguish confirmed from client-predicted outcomes. Raw emails, card data, device fingerprints and session-recording videos are not collected by default.
- [ ] F-050-AC3: A fixture cohort produces exact expected visitor→playable→battle funnels and D1/D7/D30 windows, with denominators, maturity dates, source and internal-traffic exclusions.
- [ ] F-050-AC4: Retention, deletion and collection policy match the approved notice; dashboards cannot inflate success by dropping failed loads, counting retries as new users or treating paid testers as organic purchasers.

Validation: Synthetic event timelines at window boundaries, duplicate delivery, clock/time-zone issues, consent/collection modes and known internal accounts; reconcile purchase metrics against provider ledger.

Required protocols: VP-07, VP-10. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-051"></a>

### F-051 — Outside-player studies and product decision reports

Priority: P0 · Milestone: M1–M5 · Status: Planned / not commercially accepted.  
Baseline: No commercial player evidence established.  
Dependencies: F-050.  
Source items: MVP-03, MVP-06, MVP-07, MVP-19.  
Accountability: Owner: recruitment and product decision; agent: protocol, analysis and fixes.

Acceptance criteria:

- [ ] F-051-AC1: Reference testing enrolls 10–15 uninvolved players; the first ten preselected novice observations score the specified tasks without coaching, with at least 8/10 completing trainer/objective/preparation/entrance tasks.
- [ ] F-051-AC2: Free alpha recruits 20–50 invited players over 2–3 weeks; beta records 100–300 new players with mature seven-day cohorts, returner and leaver feedback, plus collection/campaign timing.
- [ ] F-051-AC3: Reports separate hard functional blockers from diagnostic product targets: battle completion ≥85%, guided contract ≥70%, D1 ≥25%, D7 ≥10%, D30 observed with 5% aspiration. Dates/denominators and uncertainty are always shown.
- [ ] F-051-AC4: The owner records proceed/iterate/stop with reasons and follow-up feature IDs. Missing sample, missing devices or immature cohorts remain Not run/Waiting for evidence, never an invented pass.

Validation: VP-05 uncoached task sheets and VP-10 cohort queries/interviews; reference sessions may run manually before analytics delivery, while final beta acceptance requires verified telemetry.

Required protocols: VP-05, VP-10. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-052"></a>

### F-052 — Integrated release regression and defect closure

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.  
Baseline: Existing prototype suites; commercial suites missing.  
Dependencies: F-008, F-023, F-030, F-035, F-040, F-041, F-044, F-047, F-049, F-050.  
Source items: MVP-17.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-052-AC1: A version-pinned release candidate passes all applicable P0 functional/security/commerce suites and a full fresh-account campaign/challenge journey on supported devices.
- [ ] F-052-AC2: Zero open S0/S1 defects remain under the severity definitions in VALIDATION_PLAN.md; minor known issues have owners, workarounds where valid and a public-facing disclosure if relevant.
- [ ] F-052-AC3: At least 500 observed supported-client sessions meet ≥99% unexpected-error-free rate, with session definition and denominator shown; expected validation errors and checkout cancellations are not crashes.
- [ ] F-052-AC4: Current source/build and rules hashes match the evidence; changing a dependency invalidates affected acceptance and triggers targeted regression plus required end-to-end checks.

Validation: Run the VP suite matrix, device campaign and incident scenarios; collate failing and passing reports, not only test counts. Validate the final RC after fixes, not a historical prototype build.

Required protocols: VP-01, VP-02, VP-03, VP-05, VP-06, VP-07, VP-08, VP-09, VP-10. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-053"></a>

### F-053 — Business, privacy, rights and budget readiness

Priority: P0 · Milestone: Before public data collection / live commerce · Status: Planned / not commercially accepted.  
Baseline: Pending owner decisions; no commercial setup.  
Dependencies: None; owner/external prerequisites still apply.  
Source items: MVP-16, MVP-18, MVP-19.  
Accountability: Owner and qualified adviser where required; agent prepares/checks implementation.

Acceptance criteria:

- [ ] F-053-AC1: The owner records seller identity, approved territories/age policy, payment eligibility, primary language, cash envelope and accountable support/incident contact; unresolved items are visibly blocking the relevant release stage.
- [ ] F-053-AC2: Terms, privacy, refund/support, data retention/deletion and applicable tax/consumer obligations have an approved implementation checklist, with professional review where needed; generic copied text is not treated as clearance.
- [ ] F-053-AC3: A provenance/license register covers every shipped asset, sound, font, dependency and product name; required attribution is included and disputed/uncleared content is excluded.
- [ ] F-053-AC4: Account/domain/email/payment ownership and secret configuration are controlled by the owner. No paid tool, public deployment, live purchase, ad spend or data collection beyond approved conditions is authorized merely by this backlog.

Validation: Owner/adviser sign-off register, asset/dependency manifest audit, platform eligibility checklist and budget worksheet. This is evidence of a review process, not an agent's legal-compliance certification.

Required protocols: VP-11. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-054"></a>

### F-054 — Landing page, launch media and support materials

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-024, F-029, F-033, F-053.  
Source items: MVP-18.  
Accountability: Implementation agent; owner accepts.

Acceptance criteria:

- [ ] F-054-AC1: A playable-game landing page contains a clear pitch, correct supported platforms, real screenshots, account/play entry, support/contact and approved policy links.
- [ ] F-054-AC2: A 30–45-second trailer and 6–8 screenshots show the actual release candidate and its distinctive loop; no feature or graphical-parity claim exceeds what ships.
- [ ] F-054-AC3: Known issues, patch notes and a support/status page explain connectivity, account/purchase recovery, refunds and the small-service support expectations.
- [ ] F-054-AC4: Campaign links allow the approved minimal source attribution; no advertising launch/spend occurs without owner approval and the staged-launch gates.

Validation: Review all media against RC footage and screenshots; keyboard/mobile link check, support ticket rehearsal, contact routing and privacy/marketing owner review.

Required protocols: VP-05, VP-11. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-055"></a>

### F-055 — Controlled launch, commercial learning and first-month operations

Priority: P0 · Milestone: M5 · Status: Planned / not commercially accepted.  
Baseline: New.  
Dependencies: F-049, F-051, F-052, F-053, F-054.  
Source items: MVP-19.  
Accountability: Owner: commercial authorization/operation; agent: implementation and evidence.

Acceptance criteria:

- [ ] F-055-AC1: Reference → free alpha → free beta → monetized invitation cohort → public release follows G0–G5. Every transition records build, evidence, limits, owner decision and unresolved risks.
- [ ] F-055-AC2: Monetized cohort uses approved live commerce only after safety gates; report at least ten voluntary purchases from unrelated players as an initial signal, not proof of profitability or a quota to manipulate.
- [ ] F-055-AC3: Acquisition spend is capped and staged against measured activated-player cost, cohort revenue, refunds, fees and operating costs. Missing evidence or exceeded reserve stops expansion rather than adding paid power.
- [ ] F-055-AC4: A first-month plan names monitoring/support coverage, incident/rollback/refund procedure and a realistic bug/balance cadence; no promised weekly roster growth, multiplayer or always-on human support is implied.

Validation: Gate-record audit, approved live payment/refund check, cohort/accounting report and simulated incident. Owner alone authorizes external launch, spending and the commercial go/no-go.

Required protocols: VP-08, VP-09, VP-10, VP-11. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## J · Optional post-P0 features

<a id="f-056"></a>

### F-056 — PT-BR localization

Priority: P1 · Milestone: After P0 · Status: Planned / not commercially accepted.  
Baseline: Deferred P1.  
Dependencies: F-029, F-033, F-054.  
Source items: MVP-20.  
Accountability: Agent: implementation; owner/fluent reviewer: language approval.

Acceptance criteria:

- [ ] F-056-AC1: If adopted, all player-facing strings, tooltips, tutorial, shop/policies where applicable and launch materials have reviewed PT-BR text through stable string IDs; English fallback is intentional.
- [ ] F-056-AC2: Currency/number/time formatting and pluralization are consistent and no key/raw placeholder leaks into the UI.
- [ ] F-056-AC3: Language selection persists; long translated strings fit supported layouts/zoom and keyboard/screen-reader labels remain meaningful.
- [ ] F-056-AC4: A fluent reviewer completes first fight, capture, preparation and purchase-preview flows with no critical mistranslation; checkout language/support scope is accurately disclosed.

Validation: String coverage and placeholder checks, locale/format fixtures, narrow-screen screenshots and a fluent-reader walkthrough. Do not advertise PT-BR before acceptance.

Required protocols: VP-05, VP-12. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

<a id="f-057"></a>

### F-057 — Safari / iOS and wider-browser certification

Priority: P1 · Milestone: After P0 · Status: Planned / not commercially accepted.  
Baseline: Not physically verified.  
Dependencies: F-052.  
Source items: MVP-21.  
Accountability: Owner/testers: hardware; agent: fixes and validation.

Acceptance criteria:

- [ ] F-057-AC1: If included, a named physical iPhone/Safari pair passes the required game/account/checkout-return journey, audio interaction, asset rendering and local screenshot export.
- [ ] F-057-AC2: Touch navigation, background/resume, memory/performance and poor-network handling meet a recorded support-tier budget; desktop resize emulation is not accepted as iOS evidence.
- [ ] F-057-AC3: Any platform-specific unsupported behavior has a visible safe fallback, and support/marketing claims list the tested versions.
- [ ] F-057-AC4: The optional platform cannot weaken account/payment safety or block the declared desktop/Android MVP if it remains unverified and unadvertised.

Validation: Physical-device VP-12 certification plus targeted performance and payment tests; preserve videos/traces and record actual device/browser versions.

Required protocols: VP-06, VP-08, VP-12. Evidence: criterion-linked reports/fixtures and applicable screenshots, clips or review record under this feature ID; see the evidence template in VALIDATION_PLAN.md.

## First implementation sequence

1. Confirm the reusable F-006 roster/content contract and F-004 combat baseline.
2. Implement F-001/F-002, then F-003 using the existing XP baseline; lock numerical fixtures in Companion stats.md.
3. Implement F-017 using the existing F-016 traversal and route data; regress formation, inventory/capture and route persistence.
4. Build F-024's reference fight and the relevant early F-008/F-015/F-029 loop; run G1 before completing the remaining roster.
5. Follow M2 → M3 → M4 → M5 as mapped in the validation plan. An early F-036 server-compatibility spike is allowed before full production backend work.

The source MVP-01 maps to F-001–F-003; MVP-02 maps to F-016–F-018. This is the next coding scope, not work performed by this documentation turn.

## Explicitly not activated

GN-001 account-wide species mastery, GN-002 evolution quests and GN-009 cooperative bosses remain stashed in Game notes.md. PvP, trading/chat/guilds/shared towns, AFK/chores, water exploration, extra roster/classes, native apps/Steam/console/controller and paid gameplay/randomized commerce remain outside this release.

This decomposition adds verification detail, not permission to deploy, charge, spend, recruit through external messages, collect personal data or implement deferred systems. The original 460–735 base-hour / 575–919 buffered-hour estimate is not multiplied by the number of cards; re-estimate after the reference pipeline using actual throughput.
