# Owner review gates — what needs your decision, and when

Generated from [docs/review-gates.json](docs/review-gates.json).
This is your decision queue, not a list of engineering chores. The AI
prepares the evidence; you judge the product and authorize commitments.
It complements [existing release gates G0–G5](VALIDATION_PLAN.md); it does
not replace technical tests or automatically accept commercial criteria.

## Your current priorities

| When | Review | Current state | Stop before |
| --- | --- | --- | --- |
| NOW | [OR-01 — Approve the visual direction with a small creature set](#or-01) | Needs revision | Before expanded-roster concepts become final portraits, rigs, world populations or marketing. |
| NOW | [OR-02 — Approve the first 20–30 minutes and core combat feel](#or-02) | Pending review packet / decision | Before repeating the current combat/progression loop across more regions, monsters and quests. |
| NEXT | [OR-03 — Approve one complete world slice before repeating it](#or-03) | Pending review packet / decision | Before producing the remaining full-detail maps, quest routes or region-wide art placement. |
| NEXT | [OR-04 — Approve the animation and impact reference](#or-04) | Pending review packet / decision | After direction/concept approval, before mass rigging or animation production. |
| NEXT | [OR-05 — Approve each creature's design before producing its assets](#or-05) | 0/100 species approved | For each batch, before its final art, rig, animations, fixed world presentation or promotional use. |
| NEXT | [OR-06 — Approve target devices and the main interaction layout](#or-06) | Pending review packet / decision | Before locking asset detail/texture budgets or expanding screens and control patterns. |
| LATER | [OR-07 — Approve release economy and rarity expectations](#or-07) | Pending review packet / decision | Before promising permanent progress, launching persistent economy tests or publishing acquisition claims. |
| LATER | [OR-08 — Approve account, persistence and real multiplayer rules](#or-08) | Pending review packet / decision | Before committing to cloud save schemas, real group sessions or importing prototype profiles. |
| LATER | [OR-09 — Approve the representative slice for a polished external test](#or-09) | Pending review packet / decision | Before presenting a build to outside players as representative of intended quality or commissioning launch media. |
| LATER | [OR-10 — Approve store, rights, player promises and support readiness](#or-10) | Pending review packet / decision | Before paid marketing/public commercial claims, taking money or production personal-data collection. |
| LATER | [OR-11 — Approve capacity, operating cost and recovery before expansion](#or-11) | Pending review packet / decision | Before admitting a larger persistent cohort, raising player caps or increasing operating spend. |
| LATER | [OR-12 — Final release go/no-go](#or-12) | Pending review packet / decision | Before a public commercial release. |

## What happens next

- **OR-01 — Approve the visual direction with a small creature set** (Needs revision). The owner supplied 100 replacement PNGs and a numbered stable-ID workbook; integration is authorized, final commercial art approval is not recorded. Current source and 100-species contact sheets are routed through features/animation/SUPPLIED_SPRITES.md. Review the supplied starter set in actual world/combat/collection sizes before dependent production.
- **OR-02 — Approve the first 20–30 minutes and core combat feel** (Pending review packet / decision). Use features/opening/PASS26_VALIDATION.md for the current fresh-save walkthrough. Review both weapons, the first guaranteed Brimble Echo, in-frame Bag guidance, automatic party placement, the Forest Mage's two-companion proof and the visibly locked-then-open Firstlight roads.

Coming next: OR-03, OR-04, OR-05, OR-06.
The AI prepares a named packet before asking for approval. A pending gate
is not a claim that a fresh packet already exists. For a selected work
milestone, every unmet prerequisite becomes due now even if normally later.
Approve standards once before repeating them; review the remaining species
in 5–10-creature batches and unlock only the specifically approved scope.

You do **not** need to approve all 100 finished monsters now. All 100 need
scoped concept approval before their own final production and asset acceptance
before release. Approving one sheet does not approve every species or its motion.

## How I will keep you updated

- Before relevant work: name the due gate, why delay creates rework,
  the exact packet/decision needed and the dependent work that would pause.
- At every substantive development handoff: **Needs you now** (max three),
  **Coming next** (trigger, not a guessed date), **Safe to defer**.
  If unchanged, say so briefly; do not repeat the whole register.
- Notify again when a trigger is reached, evidence changes or your decision
  is needed to proceed. Updates happen during project work, not as autonomous
  background reminders while no assistant is running.
- An approval applies only to the stated revision and scope. No reply, green
  tests or general encouragement cannot approve another batch or release.
- Rejected work stays rejected until a replacement is explicitly approved.
  Never relabel a dependent production task as a prototype to bypass a gate.

## What may continue / safely wait

Engineering tests, bug fixes, performance diagnostics, rough concepts and
reversible prototypes can continue. Do not wait for final art to test mechanics.
A deliberately labeled prototype/user-feedback session is not a claim of
polished quality; G0 safety/consent requirements still apply.

Safe to defer now: final art for distant batches, incidental props, extra idle
animations, cosmetic variants, exact late-game numbers, optional languages/
browsers and final launch copy. Revisit them at their named production/release
boundary. Stable species IDs, ownership and approved body/rig standards are
not similarly cheap to change. Deferred Game notes remain deferred.

## Gate details

<a id="or-01"></a>
### OR-01 — Approve the visual direction with a small creature set

Priority: **NOW**. State: **Needs revision**.

**Review before:** Before expanded-roster concepts become final portraits, rigs, world populations or marketing.

**Why it becomes expensive later:** A silhouette/proportion change propagates into portraits, crops, pivots, animation, hit/readability cues, world scale and screenshots. Repeating an unapproved style across 100 species multiplies that rework.

**AI prepares:**

- The owner supplied 100 replacement PNGs and a numbered stable-ID workbook; integration is authorized, final commercial art approval is not recorded. Current source and 100-species contact sheets are routed through features/animation/SUPPLIED_SPRITES.md. Review the supplied starter set in actual world/combat/collection sizes before dependent production.
- Show actual combat/world thumbnail sizes on the same background, not only attractive large illustrations. Include tank/support/DPS, land/bird/insect/aquatic and a less conventional body.
- Use the current expanded-roster rejection as a baseline to improve, not as permission to choose a final style silently.

**You validate / acceptance:**

- I want to collect these creatures; they belong in the same game.
- Each silhouette is distinct; support does not look as bulky as tank; faces and trainer remain readable at play size.
- Approve one named, versioned direction and representative sheet. A style approval does not approve all 100 designs.

**May continue:** Explore alternative concepts, fix logic, improve tools and run technical tests.

**Can wait:** Final designs for the remaining roster; cosmetic variants and incidental detail.

**Reopen when:** Change to visual language, proportions, viewing angle or reference-set identity.

**Related specifications:** [ART_BIBLE.md](<ART_BIBLE.md>), [CREATURE_DESIGN.md](<CREATURE_DESIGN.md>), [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>), [features/animation/SUPPLIED_SPRITES.md](<features/animation/SUPPLIED_SPRITES.md>).

<a id="or-02"></a>
### OR-02 — Approve the first 20–30 minutes and core combat feel

Priority: **NOW**. State: **Pending review packet / decision**.

**Review before:** Before repeating the current combat/progression loop across more regions, monsters and quests.

**Why it becomes expensive later:** Boring or unreadable combat, excessive walking, unrewarding hunts or forced recovery become embedded in encounter levels, rewards, quest scripts and content volume.

**AI prepares:**

- Use features/opening/PASS26_VALIDATION.md for the current fresh-save walkthrough. Review both weapons, the first guaranteed Brimble Echo, in-frame Bag guidance, automatic party placement, the Forest Mage's two-companion proof and the visibly locked-then-open Firstlight roads.
- Replay victory, defeat, a selected fallen sole companion, reload and interrupted-menu routes. Firstlight defeat must preserve bearings at the same forest camp, fully recovered. Confirm ordinary Echo odds remain separate from the two disclosed onboarding guarantees.
- Continue later review sessions through the four class demonstrations, Tidecrown, both temporary class trials, Druid/Mage commitment, the ability-change proof and the Lv30 individual tree proof. Record time, deaths, recovery trips, retries and the observed reason for each class/boss loss.

**You validate / acceptance:**

- Preparation produces understandable differences, encounters feel like battles, and the trainer-loss rule is clear.
- Returning to recover feels like a useful decision, not tedious mandatory travel. The one-objective route, independent trainer level, Inventory summon, role signs and numbered exits remain understandable without a guide chain.
- The hunt → Echo → individual companion → stronger challenge loop is worth repeating. This does not approve final numerical balance or release odds.

**May continue:** Bounded balance experiments, bug fixes and small prototype encounters.

**Can wait:** Exact late-game coefficients and competitive balance across all 100 species.

**Reopen when:** Changing combat control model, battle length, progression curve, healing/travel friction or onboarding loop.

**Related specifications:** [Companion stats.md](<Companion stats.md>), [features/opening/PASS26_VALIDATION.md](<features/opening/PASS26_VALIDATION.md>), [PASS24_VALIDATION.md](<PASS24_VALIDATION.md>), [PASS20_VALIDATION.md](<PASS20_VALIDATION.md>), [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>), [features/opening/DESIGN.md](<features/opening/DESIGN.md>), [features/opening/EARLY_PROGRESSION_SCOPE.md](<features/opening/EARLY_PROGRESSION_SCOPE.md>), [features/opening/VALIDATION.md](<features/opening/VALIDATION.md>), [features/delivery/REMAINING_SCOPE.md](<features/delivery/REMAINING_SCOPE.md>).

<a id="or-03"></a>
### OR-03 — Approve one complete world slice before repeating it

Priority: **NEXT**. State: **Pending review packet / decision**.

**Review before:** Before producing the remaining full-detail maps, quest routes or region-wide art placement.

**Why it becomes expensive later:** Map scale and visual language constrain camera, gates, collision, pathfinding, prop sizes, spawn density, recovery trips and quest travel.

**AI prepares:**

- AI prepares one coherent village → field → forest/cave slice with roads, bridge, service, landmark, varied enemies and a return route.
- Show a walk-through and minimap/atlas; measure actual representative crossings and recovery travel, preserving the existing ≥30-second large-map requirement.
- Use final-candidate art in a small area and blockout elsewhere; do not decorate all 24 fields to request this review.

**You validate / acceptance:**

- It feels like a place, not connected pages; destinations and traversable space are legible.
- Travel has encounters/landmarks without empty padding; monster density and village access support the intended difficulty.
- Approve the reference slice and scale/navigation rules, not every unreleased region.

**May continue:** Greybox layouts, routing/collision tests and alternatives within the reference slice.

**Can wait:** Decoration and exact population tuning of later regions.

**Reopen when:** Camera/perspective, scale, traversal speed, map topology or biome kit changes.

**Related specifications:** [WORLD_DESIGN.md](<WORLD_DESIGN.md>), [WORLD_IMPLEMENTATION.md](<WORLD_IMPLEMENTATION.md>), [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>).

<a id="or-04"></a>
### OR-04 — Approve the animation and impact reference

Priority: **NEXT**. State: **Pending review packet / decision**.

**Review before:** After direction/concept approval, before mass rigging or animation production.

**Why it becomes expensive later:** Sprite framing, ground anchors, rig proportions, attack timing and VFX origins get copied into every character package. Fixing the template late means re-exporting many assets.

**AI prepares:**

- AI presents Druid plus the supplied Brimble (emberfox) and Rattlebit (stonehorn) designs with Mage/ranged/support context: idle, both walking directions, attack, cast, hit, defeat and victory. These new PNGs currently use transform motion; the retired monster frame sheets are not their animation reference.
- Show actual play at 1× and 2×, crowded combat, Quiet FX and reduced motion. Include impact/sound/HP synchronization evidence.
- Show the same creatures in the world and inventory, not only the arena.

**You validate / acceptance:**

- Movement has weight and contact; left/right facing is correct; support/tank/attacker actions read differently.
- Projectile/contact, damage display and sound agree; important targets and warnings remain visible.
- Approve the versioned rig/clip standard; approval of a still image alone does not approve motion.

**May continue:** Prototype rigs, single-character experiments and event-timing regressions.

**Can wait:** Extra idle variations, rare flourish animations and cosmetic-only effects.

**Reopen when:** Rig topology, frame crop/pivot, timing conventions, presentation delay or camera scale changes.

**Related specifications:** [ART_BIBLE.md](<ART_BIBLE.md>), [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>).

<a id="or-05"></a>
### OR-05 — Approve each creature's design before producing its assets

Priority: **NEXT**. State: **0/100 species approved**.

**Review before:** For each batch, before its final art, rig, animations, fixed world presentation or promotional use.

**Why it becomes expensive later:** A weak concept becomes expensive once its portrait, all poses, effects and habitat presentation are built. Different species must not collapse into recolors of one body.

**AI prepares:**

- AI submits batches of 5–10, identified by stable species IDs, with silhouette, face, element, role, distinctive feature and an in-game-size preview.
- Start with 6–8 reference creatures under OR-01; after approval, production advances only for specifically approved individuals/species in the batch.
- Supply a side-by-side contact sheet of approved references and the proposed batch. Keep rejected versions and change notes outside the short owner board.

**You validate / acceptance:**

- Every named species has a collectible identity and readable role; it belongs in the chosen art direction.
- Approve/Revise/Replace per species; partial approval unlocks only those approved, never the entire roster.
- All 100 launch species require scoped concept approval before their final production/release; not all must be reviewed today.

**May continue:** Concept exploration and placeholder-backed gameplay/testing for unapproved species.

**Can wait:** Finished art/animation for distant batches; display-name polishing while stable IDs remain unchanged.

**Reopen when:** Any approved species' silhouette, proportions, signature anatomy or role-linked appearance changes.

**Related specifications:** [CREATURE_DESIGN.md](<CREATURE_DESIGN.md>), [CREATURE_FAMILIES.md](<CREATURE_FAMILIES.md>), [CREATURE_REFERENCE.md](<CREATURE_REFERENCE.md>).

<a id="or-06"></a>
### OR-06 — Approve target devices and the main interaction layout

Priority: **NEXT**. State: **Pending review packet / decision**.

**Review before:** Before locking asset detail/texture budgets or expanding screens and control patterns.

**Why it becomes expensive later:** Changing screen density, touch/mouse assumptions or the minimum device later affects asset sizes, camera distance, labels, effects, input, layouts and performance budgets.

**AI prepares:**

- AI proposes a concrete supported desktop/browser baseline and an explicit mobile promise or deferral, with costs/limitations explained.
- Show the Patch 26 in-frame exploration objective, upper-right minimap/Atlas entry and bottom three-destination menu alongside party picker, skill editing, inventory, summoning and recovery on desktop and a narrow layout.
- Owner/real testers check the chosen physical devices before certification; emulated viewports alone cannot approve hardware.
- Settings/audio and the local three-socket Inner Sea editor/export are available for review; see features/delivery/REMAINING_SCOPE.md (C3) and the feature guides. Automated 320/390/768/1440-width checks do not certify a physical phone. Confirm whether Android is mandatory for the initial launch.

**You validate / acceptance:**

- The intended launch devices are explicitly chosen; essential controls and combat information are readable and usable.
- I can set a party, change skills, summon and recover without confusing steps.
- The proposed art/performance budget supports those devices. Production baseline approval is not device certification.

**May continue:** Responsive prototypes and accessibility/performance diagnostics.

**Can wait:** Secondary screen polish and optional extra browser/localization support already marked optional in the backlog.

**Reopen when:** Minimum hardware, browser promise, input model, UI density or asset budgets change.

**Related specifications:** [ART_BIBLE.md](<ART_BIBLE.md>), [features/opening/PASS26_VALIDATION.md](<features/opening/PASS26_VALIDATION.md>), [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>).

<a id="or-07"></a>
### OR-07 — Approve release economy and rarity expectations

Priority: **LATER**. State: **Pending review packet / decision**.

**Review before:** Before promising permanent progress, launching persistent economy tests or publishing acquisition claims.

**Why it becomes expensive later:** Progression rates and scarcity set player expectations; correcting permanent wealth or extremely rare drops after launch may require wipes, compensation or trust-damaging changes.

**AI prepares:**

- AI presents starter-to-late progression scenarios, recovery costs and expected acquisition time including rare encounter availability and kills/hour.
- Separate current 15% testing from release proposals; show unlucky streaks and duplicate outcomes, not only averages or forced grants.
- Preserve the agreed 100% summon/no-pity rules and proposed 10%/0.01% odds unless you explicitly authorize a change.

**You validate / acceptance:**

- I understand and accept the actual grind and unlucky-player experience, not just the percentage.
- The economy supports ordinary progression without requiring rare/meta drops or purchases.
- A clear test-wipe/persistence policy is communicated before people invest time.

**May continue:** Disposable-save balance experiments and theoretical rarity simulations.

**Can wait:** Precise final tuning while no permanent-value promise exists.

**Reopen when:** Odds, source availability, XP, price/supply sinks, progression promises or reset policy changes.

**Related specifications:** [CREATURE_DROPS.md](<CREATURE_DROPS.md>), [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>).

<a id="or-08"></a>
### OR-08 — Approve account, persistence and real multiplayer rules

Priority: **LATER**. State: **Pending review packet / decision**.

**Review before:** Before committing to cloud save schemas, real group sessions or importing prototype profiles.

**Why it becomes expensive later:** Identity, ownership, reward receipts and room lifecycle constrain database/API design. Reworking them after accounts or purchases exist risks progress and financial reconciliation.

**AI prepares:**

- AI supplies a short player-facing policy: guest upgrade, save ownership, allowed devices, wipes/imports, pause/2× rules, disconnect/rejoin and group loot eligibility.
- Add technical recommendations for versioned authoritative commands, idempotent receipts and migration/restore tests; owner is not asked to review implementation code.
- Compare costs and tradeoffs before choosing paid providers or accepting a multiplayer promise.

**You validate / acceptance:**

- I approve what players are promised about progress, disconnects, groups and shared boss rewards.
- Prototype saves cannot mint trusted online wealth; repeat boss drops remain possible, with no server-wide one-copy cap.
- Scope/budget/provider decisions are explicit; later external account purchases still need authorization.

**May continue:** Headless simulation tests, disposable server spikes and interface proposals.

**Can wait:** Provider rollout and real room implementation until the rules/policies are approved.

**Reopen when:** Ownership, reward eligibility, account migration, room model or persistence policy changes.

**Related specifications:** [docs/ENGINEERING.md](<docs/ENGINEERING.md>), [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>), [features/delivery/REMAINING_SCOPE.md](<features/delivery/REMAINING_SCOPE.md>).

<a id="or-09"></a>
### OR-09 — Approve the representative slice for a polished external test

Priority: **LATER**. State: **Pending review packet / decision**.

**Review before:** Before presenting a build to outside players as representative of intended quality or commissioning launch media.

**Why it becomes expensive later:** If the advertised sample misrepresents final quality or masks the real loop, feedback and marketing investment can optimize the wrong game.

**AI prepares:**

- AI packages one approved loop/world slice with a pinned build and exactly which species/screens are included.
- List known limitations and the questions being tested; provide a short launch-to-recovery play path and blocker summary.
- Request explicit go/no-go for that audience/build. Uncoached newcomer checks required by the existing art/validation plan remain real human evidence.

**You validate / acceptance:**

- The sample honestly represents the intended look, feel and main loop.
- No known blocker prevents the intended test; incomplete areas are disclosed rather than presented as finished.
- Approve the bounded session/audience, not commercial launch. Early prototype feedback remains allowed before this gate.

**May continue:** All engineering QA, owner reviews and clearly labeled bounded prototype/usability feedback.

**Can wait:** Full launch content, monetization and mass recruitment.

**Reopen when:** Representative assets/loop change, new test audience, material blockers or misleading known limitations.

**Related specifications:** [ART_BIBLE.md](<ART_BIBLE.md>), [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>).

<a id="or-10"></a>
### OR-10 — Approve store, rights, player promises and support readiness

Priority: **LATER**. State: **Pending review packet / decision**.

**Review before:** Before paid marketing/public commercial claims, taking money or production personal-data collection.

**Why it becomes expensive later:** Branding/assets without cleared provenance, misleading cosmetics, refunds or privacy/support gaps become public trust and operational liabilities once players spend or sign up.

**AI prepares:**

- AI prepares the cosmetics-only catalog, real previews, ownership/refund/support behavior and purchase-failure evidence.
- Provide asset provenance/brand checks and a list of owner/provider/adviser approvals still required; do not invent legal clearance.
- Present the exact player-facing promises, territories, data/retention policy and spend authorization.

**You validate / acceptance:**

- No product grants gameplay advantage; previews and ownership claims are accurate.
- Necessary external reviews and purchase/recovery tests are documented before selling.
- Explicit authorization covers the actual release/store/spend scope, not a generic approval of this plan.

**May continue:** Unpaid mockups, sandbox purchase tests and provenance collection.

**Can wait:** Cosmetic variants, final pricing and launch copy before public commitments.

**Reopen when:** Asset rights/brand, paid catalog, data collection, territories or refund/support promises change.

**Related specifications:** [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>), [docs/ENGINEERING.md](<docs/ENGINEERING.md>).

<a id="or-11"></a>
### OR-11 — Approve capacity, operating cost and recovery before expansion

Priority: **LATER**. State: **Pending review packet / decision**.

**Review before:** Before admitting a larger persistent cohort, raising player caps or increasing operating spend.

**Why it becomes expensive later:** Unbounded concurrency, lost rewards or an untested restore become incidents involving real players rather than cheap disposable test failures.

**AI prepares:**

- AI shows measured target-cohort load/soak results, room/DB bottlenecks, per-player/room costs and spending/admission limits.
- Demonstrate backup restoration, reward reconciliation, alerting, kill switches and rollback in staging.
- Owner chooses the specific player cap, spending ceiling, support coverage and rollback/stop conditions.

**You validate / acceptance:**

- Evidence covers the proposed cap and budget with stated headroom, not an invented player-count promise.
- Restore/rollback and rare-reward reconciliation have actually been exercised.
- Authorize that cap/spend only; higher limits require a new review.

**May continue:** Local performance profiling and bounded staging/load experiments within authorized spend.

**Can wait:** Large-scale infrastructure before load measurements justify it.

**Reopen when:** Player cap, provider/pricing, room size, retained data, spend or operational responsibility changes.

**Related specifications:** [docs/ENGINEERING.md](<docs/ENGINEERING.md>), [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>).

<a id="or-12"></a>
### OR-12 — Final release go/no-go

Priority: **LATER**. State: **Pending review packet / decision**.

**Review before:** Before a public commercial release.

**Why it becomes expensive later:** Shipping unresolved critical issues converts development rework into player harm, reputation loss and support obligations.

**AI prepares:**

- AI presents existing G0–G5 gate status, applicable acceptance criteria, unresolved blockers, all launch art approvals and outside-player/device evidence.
- Include versioned build, staged rollout, rollback, support and budget plan; separate technical passes from owner acceptance.
- No blanket auto-approval from green tests. All launch species need scoped design coverage and final asset acceptance evidence under the existing protocols.

**You validate / acceptance:**

- Required technical, owner, device, business and external gates are genuinely met for this release.
- I explicitly authorize the named build, audience/cap and launch plan.
- Anything deferred is visible and compatible with the player-facing promise.

**May continue:** Fixing blockers and validating a candidate without publishing it.

**Can wait:** Post-launch feature expansion, optional content and cosmetic extras.

**Reopen when:** Release build/scope changes materially or prior approvals become stale.

**Related specifications:** [VALIDATION_PLAN.md](<VALIDATION_PLAN.md>), [FEATURE_BACKLOG.md](<FEATURE_BACKLOG.md>).

## Developer enforcement and decision records

Commands from the project root:

```powershell
python scripts/project.py reviews
python scripts/project.py reviews --feature animation
python scripts/project.py reviews --work creature-production --species emberfox stonehorn --enforce
python scripts/project.py reviews --work prototype --feature animation --enforce
python scripts/project.py reviews --write
```

Use the honest work milestone. The enforcement form exits nonzero if its
applicable approvals are missing, rejected, deferred or stale. Production
requiring per-species approval must name the species; public-launch always
checks the complete roster. Feature filters cannot hide milestone gates.
Normal project.py check validates this register's structure/freshness but
does not require every review to be approved before technical testing.

After an explicit owner decision, append a decision to the relevant JSON gate:
result (approved/revise/defer), exact owner statement and conversation reference,
scope (stable species IDs, or * only for global standards), and evidence
files with SHA-256 hashes. Approvals require pinned evidence; never invent
an owner statement. Hashes bind artifacts, not the truth of consent.
Keep small per-batch evidence files so a changed species does not needlessly
invalidate unrelated approvals. A later rejection/deferral supersedes approval
for that scope. Changed evidence automatically requires re-review; semantic
changes under each gate's reopen rule also require explicit re-review.

This is a local preflight and mandatory assistant workflow, not an unbypassable
production deployment control. Remote release enforcement remains future work.
