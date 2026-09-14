# Commercial MVP — Validation and acceptance plan

Version 1.0 · 10 September 2026  
Applies to: [Feature backlog](FEATURE_BACKLOG.md)  
Source boundary: [Commercial MVP scope](<Commercial MVP scope.md>)  
Coverage: [Traceability](FEATURE_TRACEABILITY.md)

## 1. What acceptance means

This is a **test specification, not a test report**. No new gameplay tests, purchases, load tests, user study or physical-device certification were performed during this documentation pass.

Separate three questions:

1. **Functional acceptance:** does the defined feature behave correctly, including failures and recovery?
2. **Experience validation:** can intended players understand it, enjoy it and make useful choices?
3. **Commercial readiness:** can the owner safely operate, sell, recover, support and afford it?

One does not prove another. Passing a deterministic combat test does not prove enjoyment; a successful checkout preview does not prove paid entitlement delivery; Chrome/Edge on one machine does not prove phone performance.

### Evidence and status rules

Every criterion in FEATURE_BACKLOG.md starts Not run. Use Pass, Fail, Waiting for evidence or N/A with an explicit justification. Mandatory P0 criteria cannot be quietly declared N/A or passed with missing hardware/player evidence.

A feature is:

- Planned: card and acceptance contract exist.
- In progress: implementation work started.
- Implemented: code/content exists, but required validation is incomplete.
- Verified: all applicable technical criteria passed against the named build.
- Accepted: required technical, experience and owner review criteria passed and evidence is recorded.
- Needs work: a criterion fails.
- Waiting for evidence: a necessary device, person, cohort, account or approval is unavailable.

P1 may be explicitly excluded from the release. A useful earlier slice of a feature may ship to a limited test without the complete feature being Accepted; the stage record must say which criteria remain.

### Shared definition of done

For every accepted feature:

- Its numbered criteria have current evidence and no unresolved prerequisite contract.
- Source, rules, content/schema and build versions are recorded.
- Positive, boundary, negative and recovery paths relevant to that feature pass.
- UI copy, error states, accessibility and save behavior agree with implemented rules.
- No new secret, broken asset, fatal console error, duplicate ID or unexpected outside request is introduced.
- Existing affected behavior is regressed; intentionally changed tests have a documented rule-change reason, never deleted merely to get green.
- Applicable docs and migration behavior are updated; test artifacts do not modify real player saves.
- Zero open S0/S1 issues affect the feature.
- Any owner/visual/device/legal review is explicitly named; the agent cannot self-certify someone else's approval.
- Evidence is reproducible. A screenshot alone does not establish timing, a database screenshot does not establish concurrency, and a historic pass does not validate a new build.

## 2. Design locks and test data

The source leaves a few numerical/business decisions provisional. Freeze the following before affected criteria are marked Verified. This is not a request to stop all work or to obtain new purchases.

| Lock | Record required | Needed before | Accountable |
| --- | --- | --- | --- |
| DEC-01 | STR/DEX/INT basic/skill categories; exact attribute coefficients/caps; AGI basic-only versus shared action-meter policy; dodge eligibility/formula; VIT regen cadence/Overcharge; Leadership rounding | F-001–F-003 final fixtures, server replay agreement | Implementer proposes; owner accepts design; fixtures and Companion stats.md record it |
| DEC-02 | Release cap/XP table, tree budgets, encounter level bands, supply prices/rewards, capture tutorial exception, boss preset unlocks, rematch/challenge reward rules | Progression/economy/campaign acceptance | Owner/product review with measured tuning |
| DEC-03 | Ticket lifetime, capture opt-in cutoff, cancellation/consumable semantics, allowed 2×/pause timing, online guest merge and stale-client policy | Online reward/security verification | Implementer documents; owner accepts product tradeoffs |
| DEC-04 | Legal seller/territories, supported currencies, eight SKUs/bundles/prices, overlapping ownership policy, refund/dispute treatment, tax responsibility | Live checkout and public commercial release | Owner; provider/adviser approval where needed |
| DEC-05 | Named desktop/low-end/Android devices and browsers, effects presets, accessibility targets, measurement tooling and support statement | Device certification and marketing claims | Owner/testers and implementer |
| DEC-06 | Study recruitment/consent/data policy, cohort windows, analytics retention, support coverage, cash/campaign stop thresholds and beta-to-launch save policy | Outside data collection, cohorts and release gate | Owner |

Planning defaults already in the scope remain defaults: level 20 proposed for release, trainer maximum-owned level, free respec, standard/illuminated 65%/90% capture, four-element ±20% cycle, 0.5%-per-Leadership-point sharing. Do not silently describe them as newly shipped.

No pass criterion may say “matches expected stats” until the expected formula/version is written independently of the function being tested. If a coefficient changes, regenerate the *reference reasoning* and review deltas rather than snapshotting whatever the new code outputs.

### Reusable fixture pack

Define stable fixture IDs, legal states and deterministic seeds. Keep private data out of the repository.

| Fixture | Purpose |
| --- | --- |
| FIX-FRESH | Brand-new guest/profile with default party, no tutorial completion or claimed rewards |
| FIX-RULES | One isolated attack/skill per damage category plus stat-boundary and mixed-kit cases |
| FIX-COMBAT | Normal trainer fight, explicit bypass, no-enemy-trainer wild, two pack variants and both boss phases |
| FIX-FORMATION | All six assignments; front trainer remains loss objective |
| FIX-STATS | Minimum/cap/budget-boundary attributes and XP; legal highest-benched companion; fractional Leadership; tiny regen |
| FIX-CAPTURE | Rolls just below/at/above 0.65 and 0.90; forced success/failure; tutorial guarantee; zero/one paper and duplicate ownership |
| FIX-ROUTES | Ten area/type pools, all three-step result paths, empty/omitted/single-species tiers and one saved deterministic route |
| FIX-SAVE | Current, legacy, malformed, overspent, high-level sandbox and stale account-revision states |
| FIX-ACCOUNTS | Anonymous, guest, user A, user B and operator with separate credentials |
| FIX-PAYMENT | Eight SKUs, overlapping grants, pending/paid/refunded/disputed orders and signed/invalid sandbox event records |
| FIX-NETWORK | Delayed, dropped, reordered and duplicate requests; expired auth; missing/corrupt asset; offline startup/return |
| FIX-COHORT | Known activation/return/payment timestamps at every D1/D7/D30 window boundary, plus internal traffic |

Freeze a golden corpus covering the full rule surface and keep the existing 1,000-build combat sample as regression input. Test sources and seeds are versioned; random tests must print the failing seed and inputs.

## 3. Protocol index

| Protocol | Main validation | Evidence |
| --- | --- | --- |
| VP-01 | Content, schema and asset/build validation | Machine-readable enumeration, invalid fixtures, manifest and coverage report |
| VP-02 | Pure combat/progression mechanics | Assertions, independent expected values, seed/state trace and aggregate simulation results |
| VP-03 | Browser journeys, UI and persistence | Isolated-context results, screenshots, meaningful actual playback and request traces |
| VP-04 | Art, animation, VFX and audio | State coverage sheets, frame/event timings, clips and owner rubric |
| VP-05 | Usability, accessibility and input | Automated findings, manual task sheets, device observations and review |
| VP-06 | Download, frame time, stalls and memory | Network/performance traces, raw samples, device/settings and soak log |
| VP-07 | Backend, authorization and atomic gameplay | API/DB assertions, race/fault logs, canonical replay hashes and security matrix |
| VP-08 | Checkout, grants, refunds and recovery | Sandbox order/event matrix, entitlement ledger and separately approved live check |
| VP-09 | Deployment, restore, load and incident operations | Runbooks, restore reconciliation, measured load, alert/rollback drill |
| VP-10 | Pacing, balance, cohorts and commercial learning | Defined queries/denominators, interviews, build examples and decision record |
| VP-11 | Owner/business/rights/launch-material review | Signed decision/checklist and restricted provenance/policy evidence |
| VP-12 | Browser/platform/localization certification | Named real-device journeys, locale coverage and support matrix |

Every feature card points to at least one protocol and adds its own required scenarios. Protocol coverage is not permission to replace the feature's specific assertions with a generic “test suite passed.”

## 4. Detailed validation protocols

### VP-01 — Data and content contract

Run on every content/build change:

- Enumerate two classes, ten monsters, five skill choices each, three-equipped legality, ten innate passives and twelve eighteen-node trees.
- Validate stable references, element/category enums, ranges, finite numbers, nonnegative cooldowns, unique IDs and valid prerequisites; reject cycles in trees.
- Enumerate ten trainer encounters, two packs, one two-phase boss/three public presets, five chapters/fifteen steps, five grass habitats/treasures, ten entrances/pools and three post-story challenges.
- Validate eight paid products with exact bundle contents plus at least three earned appearance sources. Check no gameplay-stat field is supplied by an appearance.
- Reject unknown/unavailable species, impossible prerequisite references and empty reward pools.
- Confirm every shipped asset/dependency has a manifest/provenance entry and every runtime reference resolves.
- Inspect the release bundle for secrets, source/history assets, test profiles and unintended public files.

Pass: exact required counts/contracts, zero broken references, all deliberately malformed fixtures rejected and coverage omissions reported. Source quantity checks are not proof that animation or balance is good.

### VP-02 — Mechanics and numerical correctness

Use a DOM-free runner and independent expected values. Include:

- Damage category delta tests at identical position/range, level and target defense.
- Speed examples: 50 → 2 seconds, 100 → 1 second before modifiers; Slow/Haste and cooldown clocks tested separately.
- Leadership example: raw eligible attribute 20 × Leadership 10 × 0.005 = 1 shared point, applied once. Use a legal profile for full integration.
- All element pairs, shield expiry, guarded elemental/Overcharge damage, status refresh and defeat interruption.
- Forced dodge consumes an attempted action but applies no hit-only effect. Cast-trigger and basic-attempt passives use their declared trigger.
- VIT fractional accumulation, full-health cap, death, Overcharge and healing-passive exclusion.
- XP thresholds, allocation/rank budgets, free respec, default migration and owned/unowned constraints.
- Capture boundary rolls under the declared comparison operator, first-tutorial guarantee and every consumption exclusion.
- All sixty skills and ten passives with positive and exclusion/boundary coverage.

Run at least the existing 1,000 varied standard builds and a documented expedition/pack/boss set. Assert valid HP, finite values, deterministic outcome and termination at each sampled tick. Do not insist historical win counts remain identical after an intentional balance change; record and explain their change.

For weighted selection/capture/loot checks use boundary fixtures plus 100,000 seeded samples per distinct distribution family. For expected count n×p, a diagnostic tolerance is max(5, 5×sqrt(n×p×(1−p))) counts. Record denominators and distinguish conditional species rarity from chance an encounter is wild. This is an implementation-sanity test, not market evidence or proof of perfect randomness.

Pass: all rule fixtures and invariants pass; any changed baseline has an approved rules explanation and valid new oracle.

### VP-03 — Browser flows and saves

Use isolated profiles and a loopback/staging origin. Never import or overwrite the user's actual local-storage save.

Required flow matrix:

1. Fresh start → walk → interact → loadout → actual fight → result → return to the same allowed world position.
2. Both classes, owned-monster swap, all six formations, skill reorder and stat/tree edits.
3. Every entrance by click/approach; keyboard E and touch coverage on representative entrances; inspect all ten correct pool bindings.
4. Each route step with win/loss/abandon/reload; already-active route from another area.
5. Capture unarmed/armed/changed/disarmed, standard/illuminated, win/loss, duplicate/insufficient paper and tutorial exception.
6. Every immediate/prepared consumable, cancel, resume, double activation and storage/request failure.
7. Readable empty/unowned/insufficient/offline/login-expired/pending/failed states.
8. Return from external checkout, changed class/appearance and cross-tab conflict after backend integration.

Inspect at 320, 390, 768 and 1440 CSS pixels. Require no unintended page overflow or unreachable controls.

At least one representative trainer, wild/capture, pack and boss sequence must run through actual animation-frame playback; use fast model advancement for repeated assertions where appropriate. Reports must label which is which. Screenshot assets must finish decoding before visual inspection.

Pass: asserted data/UI outcomes agree, no unexpected JS/resource errors and no duplicate claims/consumption. Record whether checks used local or authoritative state; local success cannot close F-039/F-040.

### VP-04 — Presentation rubric and event synchronization

Review the same versioned reference encounters with effects on/off, 1×/2×, pause and reduced motion. Use actual-size footage on declared hardware.

Score each dimension 0 (unacceptable), 1 (usable but inconsistent) or 2 (meets reference):

| Dimension | A score of 2 requires |
| --- | --- |
| Identity and style | Consistent proportions/lighting/palette; trainer, tanks, DPS and supports identifiable |
| Pose integrity | Correct alpha, no clipping/sheet bleed/scale pumping, stable ground anchor |
| Motion and weight | Readable anticipation/impact/recovery, appropriate flight/tank motion, no persistent sliding/twitching |
| Impact truth | Contact/projectile, HP change and reaction represent the same event |
| Battlefield readability | Trainer/objective, targets and health remain identifiable at peak effects |
| Timing/control | Pause, speed changes and state transitions do not leave stale or duplicated animation |
| Audio | No clipping/orphan loops; useful differentiated cues in sync with the action |
| World continuity | Traversal/entrances/return retain location and feel spatial rather than page-based |

Reference fight acceptance: all dimensions score 2, owner signs against build/video, and the G1 player task gate passes. The rest of the roster meets the same floor; a mean score cannot hide one unacceptable character.

For ordinary visible impacts, compare presented contact, displayed HP update, hit reaction and audio onset. Target offset ≤50 ms at 1× and ≤50 ms wall time at 2× on supported settings, with frame-resolution uncertainty recorded. Original simulation may calculate results earlier; presentation must not expose damage ahead of its matching visible impact. Document intentional instantaneous/nonphysical spell exceptions, not blanket exemptions.

If audio timing cannot be measured by the chosen capture system, record the limitation and perform a recorded human sync review; do not claim precise timing from silent screenshots. Cross-platform audio-output latency may need calibration.

Coverage: twelve core characters × seven required states, plus Elderroot's base states/charge/phase/recovery. Contract/spawn effects are covered separately. Inspect all paid skins against their base-state coverage, including movement and hit.

Pass: no failing rubric dimension, complete state coverage, event alignment within the tested tolerance or explicitly reviewed physical-device calibration, and no altered combat result.

### VP-05 — Usability, accessibility and input

Manual checks supplement automated checks:

- Keyboard-only flow from play to party changes, capture, route, Haven and purchase preview. Focus is visible, order sensible, dialogs contain/restore focus and Escape behaves predictably.
- Controls have meaningful labels and status messages expose loading/error/results. Screen-reader spot checks cover top-level navigation, selected character, inventory use and results.
- Project target: text contrast ≥4.5:1, large text ≥3:1 and essential nontext UI indicators ≥3:1. These are internal acceptance targets, not a claim of comprehensive standards certification.
- Interactive touch targets target at least 44×44 CSS pixels, including expanded invisible hit areas where visual icons are smaller. Any exception needs a demonstrated accessible equivalent and explicit review.
- Test 200% text zoom and required widths; no essential text/control is clipped or reachable only by hover.
- Disable sound, color cues, motion and optional flashes independently; essential meaning remains.
- Repeat all core workflows on actual phones, including browser backgrounding and checkout return.

The first-ten-minute study uses a written neutral task sheet. Observe rather than teach. Record success, time, hesitation, wrong turns, accessibility issues and the player's explanation of trainer defeat/capture. Do not correct the player during a scored task.

Pass: no essential blocked task, no unresolved critical accessibility/input defect and applicable G1 comprehension results recorded. It is acceptable to record larger research as Waiting for evidence.

### VP-06 — Performance, loading and memory

Freeze hardware, browser version, effects preset, resolution, operating-system power mode and build before measurement. Use the same worst-case roster/route each time.

Cold load:

- Clear cache and service-worker state in an isolated profile.
- Shape connection to 10 Mbps with the tool's documented 100-ms latency setting; record whether the tool models round trip or per-request latency.
- Measure transferred compressed bytes until first playable input, excluding unrelated provider tooling; **≤8,000,000 bytes**.
- Measure navigation start → playable input ≤8 seconds.
- Perform five cold runs on each required performance tier; report every run, median and worst case. Pass budget when at least four of five meet it, and investigate the outlier.
- Warm-cache and missing-asset runs must still show safe loading/fallback states.

Battle frame time:

- Use actual normal animation-frame playback, not a stepped fake clock.
- Warm required assets, then record a repeated worst-case eight-unit encounter with spells/HP bars/particles for at least 60 seconds of observed playback across repeats.
- Target desktop 60 FPS with p95 frame interval ≤20 ms; chosen midrange Android 30 FPS with p95 ≤40 ms.
- Publish raw distribution, long-frame count and preset. Averaged FPS alone cannot pass this check.
- Play a warmed ten-minute route loop. “No repeated >100-ms stalls” means at most one such unplanned stall in the measured window, no recurring action-correlated stall and an investigated cause for any outlier. Exclude deliberate pause/background transitions, not ordinary interaction.

Memory/soak:

- Preload the test route/roster, then run the same explore→fight→result→return cycle for 30 minutes.
- Sample retained actors, listeners, canvases, sheets and heap/process memory at comparable idle checkpoints.
- Require no tab crash and no steadily increasing retained object counts. Final comparable heap should remain within max(10%, 5 MB) of the post-warm comparable baseline where a reliable heap measure is available.
- On devices without equivalent heap tooling, record the limitation and use retained-object counters plus process-memory/OS observations; owner must review before calling memory acceptance complete.

These are test-plan operational definitions of the source quality budgets, not new claims about today's performance.

### VP-07 — Server correctness, security and race conditions

Run only against isolated local or approved staging data.

Maintain an endpoint/role matrix for anonymous, guest, user A, user B and operator. Test every read/write/claim/equip/order/export/delete action with both valid and invalid identities. Include unknown IDs, credential expiry, oversized/malformed bodies and injections.

Replay:

- Execute identical golden snapshots/seeds in Chrome, Edge and server.
- Compare canonical winner/tick/unit state plus relevant event/seed decisions; avoid accepting floating-point drift merely because the winner matches.
- Measure replay CPU independently of request latency; p95 <200 ms on the chosen hosted runtime.
- Re-run when rules, arithmetic, targeting, RNG or runtime versions change.

Atomicity:

- Submit the same battle claim at least 50 times concurrently; expect exactly one transaction and a stable receipt.
- Submit different stale claims for the same account revision/route step.
- Drop connections and inject faults before the transaction, during the transaction, after commit and before the response.
- Expected state is no committed mutation or the entire settled transaction—never a partial reward.
- Test respec/food/equip/capture opt-in racing with settlement.
- Reject forged levels, balances, winner, content version, elapsed time and other-account ticket IDs.
- Recover the exact receipt after disconnect or retry.

Protect secrets through source/build scans and actual network/log inspection. Server keys, card data and authentication tokens must not appear in public artifacts or normal diagnostic logs.

Pass: zero unauthorized access/grants; all race/recovery invariants pass; explicit residual casual-solo risks (such as clients inspecting deterministic outcomes) are documented, not falsely described as eliminated.

### VP-08 — Payment/ownership acceptance matrix

Ordinary automated testing uses sandbox events and test accounts only.

| Scenario | Required result |
| --- | --- |
| Successful settled payment | Exactly the purchased bundle granted once to the bound account |
| Success URL without verified payment | No entitlement |
| Decline/cancel/incomplete challenge | No grant; clear recoverable status |
| Delayed payment | Pending until verified completion; eventual single fulfillment |
| User closes tab after paying | Account still receives and restores the grant |
| Duplicate/concurrent callback | No duplicate fulfillment |
| Out-of-order callback | State machine resolves correctly; no false resurrection/revocation |
| Invalid signature/wrong environment | Rejected and logged safely; no mutation |
| Modified SKU/price/currency/account | Rejected before inappropriate charge/grant |
| Failure during fulfillment | Retryable durable event; no partially lost bundle |
| Full/partial refund or dispute | Policy-correct source-grant change and audit history |
| Another valid ownership source exists | Remaining earned/paid grant preserved |
| Refunded appearance equipped | Safe default; gameplay untouched |
| New device/reinstall/relogin | Ownership restored from server |
| Gameplay reset/deletion/restore | Declared retention policy applied without corrupting the payment ledger |

Run the relevant matrix for every SKU and bundle composition, with at least one fifty-delivery concurrent webhook test. Correlate provider-event IDs, order IDs, grant IDs and account IDs in restricted artifacts.

Before monetized invitations, perform **one owner-approved live purchase and refund** of a controlled SKU/account. Record actual settlement, delivered entitlement, revoke/restore behavior, cost and receipt. No real charge is implied by this specification. If approval/eligibility is missing, the live criterion is Waiting, not passed from sandbox evidence.

Pass: sandbox matrix complete, no lost/incorrect entitlement, and required separately approved live check before selling to others.

### VP-09 — Operational readiness, load and recovery

Deployment drill: build staging from documented configuration, inspect environment isolation, publish a new client/content version, simulate stale clients and roll back safely. Database rollback cannot be assumed reversible; exercise its chosen migration recovery path.

Restore drill: create known progression/payment/deletion records around a backup point; restore into a clean staging system; apply deletion tombstones; reconcile provider transactions twice. Compare account balances, receipts and entitlements with expected snapshots. Record actual restore time and ordinary-progress recovery point, targeting ≤24 hours of ordinary progression exposure.

Load drill: approved staging only. Simulate 100 active-session equivalents, ~1.7 average battle settlements/s, then 20 settlements/s for fifteen minutes with representative login/save activity. Use unique legitimate tickets for capacity testing, duplicate tickets for a separate idempotency test. Record p95 API <1 second, replay CPU, errors, contention, ledger correctness and estimated cost.

Incident drill: inject a server/checkout/email fault, verify an alert reaches the named owner, disable the affected store/route, recover a pending paid order and roll back if appropriate. Do not disable legitimate purchase reconciliation when disabling new checkout.

Cost drill: set actual alerts/limits after the owner selects provider plans and budget. Demonstrate an invitation/rate/campaign stop path rather than assuming a vendor spending cap blocks every charge.

Pass: runbooks executed, not merely written; correct state after recovery, alerts delivered, measured tested capacity and owner can perform the required mitigation. This does not certify 24/7 staffing or unlimited traffic.

### VP-10 — Balance, pacing and market evidence

Build viability:

- Register two materially different legal builds per class before the final campaign trial. A different core tactic must be evidenced by changed species, skill choices/priority or development path; a cosmetic or harmless point swap does not count.
- Each registered build can finish the campaign with a documented affordable progression path; no developer levels, invisible inventory grants or paid gameplay.
- Every species participates in at least one useful winning campaign/challenge composition and makes a documented role contribution.
- Preserve losing cases and dominant/stalling builds for review; sampled 50/50 win rates are not a PvE design requirement.

Timing targets:

- Start measurement from first playable input for gameplay pacing; loading is independently measured in VP-06.
- Target median first battle start ≤2 minutes, first additional companion ≤10 minutes and three meaningfully different usable party choices by 30–45 minutes.
- Target median first story ending 2–4 hours of active play and directed collection/challenge arc 6–10 hours.
- Report sample size, distribution, dropouts and unfinished/censored runs. Do not report a median based on an undisclosed tiny group of expert completers.
- These are tuning hypotheses, not a requirement to pad short enjoyable play with waiting.

Cohort metrics:

- Activation = first real battle completion; also report visitors, loaded clients and playable clients.
- D1: a qualifying play session in [24h,48h) after activation.
- D7: qualifying play in [168h,192h).
- D30: qualifying play in [720h,744h).
- Denominator: activated new players whose entire corresponding observation window has elapsed.
- Define a qualifying play session as at least one battle started or at least two minutes of meaningful exploration/preparation; merely reopening a tab/purchase return does not count.
- A session ends after thirty minutes of inactivity or explicit sign-out; resumed browser focus alone does not generate a new session.
- User/account reconciliation, internal/test exclusions and acquisition source are fixed before analysis.
- Unexpected-error-free session rate excludes expected validation rejections/cancelled checkouts, but includes fatal or uncaught game failures.

Targets from the scope: first battle completion ≥85% of playable arrivals; guided contract completion ≥70% of onboarding starters; D1 ≥25%, D7 ≥10%; D30 observed with ≥5% aspiration. Report count/denominator and uncertainty (for example, a Wilson interval), not just a favorable percentage.

Business learning: report confirmed payer count, net revenue after known fees/refunds/taxes, operating cost, activated-player acquisition cost and actual cohort revenue window. Ten unrelated voluntary purchasers are an initial signal only; do not count internal, reimbursed or purchased-to-meet-a-test transactions.

Pass for instrumentation/report features means accurate measurements and a documented owner decision. Missing diagnostic targets trigger iteration or an explicitly limited experiment, **not a false metric pass**. Critical safety gates cannot be waived to improve conversion.

### VP-11 — Owner and external approvals

Before the relevant release stage, record:

- Seller country/identity, approved audience/territories and age/data handling.
- Provider/product/payout eligibility and who controls the accounts.
- Reviewed privacy/terms, support/refund, retention/deletion and applicable tax/consumer checklist.
- Asset/font/audio/dependency provenance and required attribution; product-name/branding review.
- Cash reserve, approved spending, campaign-stop thresholds and incident/support coverage.
- Truthful release media and supported-device statements.
- Explicit permissions for public data collection, deployment, live transactions and advertising.

An agent-created checklist is not legal approval. Mark unknowns Waiting and keep the affected capability disabled. Local code, mock checkout and free internal testing may continue where safe.

No new legal/pricing advice is established here; the source scope contains its researched context. Reverify provider terms and territory requirements before execution because they can change.

### VP-12 — Device, browser and optional locale certification

Required matrix for main launch:

- Ordinary Windows laptop: installed Chrome and Edge.
- Lower-powered laptop or an explicitly constrained performance profile, labeled honestly.
- Two physical Android phones of different performance tiers; record model/OS/browser and selected effects mode.

On each supported device perform play → traversal/entrance → preparation → trainer/wild/pack/boss → capture/result → save/relogin → Haven/export → checkout-return/recovery under approved test conditions. Inspect portrait/narrow widths as supported; label any orientation limitation.

Optional PT-BR: string/placeholder coverage, formatting, overflow and a fluent-reader task review. External checkout/policy language needs its declared support scope.

Optional Safari/iOS: physical iPhone testing, not just WebKit emulation. If untested, leave P1 unaccepted and remove support claims; do not delay an honestly scoped main-platform release solely for it.

## 5. Milestone and release gates

Milestones organize engineering; gates authorize a **specific release exposure**, not blanket action. Feature numbering is not execution order.

| Milestone | Main output | Main feature groups |
| --- | --- | --- |
| M0 | Correct rules, world entrances, content contract and early runtime spike | F-001–F-004, F-006, F-017, early F-034/F-036 |
| M1 | Approved reference loop and first-time usability | F-005, F-008, F-012, F-014/F-015, F-016/F-017, F-024, early F-029/F-050/F-051 |
| M2 | Complete small adventure, roster, progression and scenes | F-009–F-013, F-018–F-023, F-025–F-029, F-031 |
| M3 | Online accounts/state, authoritative play and deployment | F-034, F-036–F-041, F-045/F-046, F-050 |
| M4 | Earned/paid appearance, shop, grants and operator recovery | F-032/F-033, F-042–F-044, F-048 |
| M5 | Integrated performance/security/device checks, cohorts and controlled launch | F-030/F-035, F-047/F-049, F-051–F-055 |
| Later | Only if selected after P0 | F-056/F-057 |

Early data contracts, tests and mocked flows can be prepared before their final milestone. F-036 can be spiked against the current model in M0, but final equivalence is rerun after the new rules. F-050 can have a local event contract before production authentication. These are deliberate slices, not contradictory acceptance dependencies.

### G0 — Ready for a bounded test

Hard requirements: named build/owner/test environment, scope boundary, fixture isolation, relevant design locks, budget/permissions and approved data policy for any outsiders. No S0/S1 affecting the tested path.

Allows: local/internal testing; explicitly approved outside reference sessions with appropriate privacy controls. Does not allow unapproved deployment, advertising, accounts/data collection or live charges.

### G1 — Reference loop accepted

Hard product gate: F-024 reference quality rubric plus the relevant combat/capture/entrance/first-loop criteria; 10–15 outside participants, with the preselected first ten yielding at least eight successful uncoached complete task sets.

Allows: extending the approved art pipeline across the roster and progressing to a free alpha. Failure returns to the reference loop; do not hide it by averaging polished screenshots with weak motion.

### G2 — Free alpha evaluated

Hard requirements: first-loop progression/save safety and relevant access/privacy controls; 20–50 invited players observed over 2–3 weeks; no live payments; reproducible report of blockers and voluntary return/experimentation.

Decision: owner records expand/iterate/stop with specific changes. No fabricated retention conclusion from a positive first-session comment. Full production features may remain incomplete if their absence is disclosed and access is bounded.

### G3 — Free beta evaluated / commerce candidate

Hard requirements: complete first adventure, recoverable online accounts for the authoritative beta, protected progression, supported-device core flows and permitted data collection. If an earlier local-only alpha was used, its saves are not silently trusted as online records.

Evidence: 100–300 new players with mature seven-day cohorts, valid funnel/retention/pacing analysis, returner and leaver feedback. D1/D7 and pacing targets are diagnostic; missed targets require an explicit iteration/limited-experiment decision, not relabeling the test as passed.

Allows: finalizing commerce readiness and preparing a small invited monetized test—not charging automatically.

### G4 — Allowed to sell to an invited cohort

Non-negotiable safety requirements:

- All in-scope P0 functional criteria needed for the sold product verified; business/account/device gaps cannot be hidden as “beta.”
- F-042–F-044 payment/entitlement/refund matrix passes.
- Owner-approved controlled live purchase/refund completed successfully.
- Account recovery, atomic rewards, operator tools, restore/reconciliation and store kill switch verified.
- Zero open S0/S1; RC performance/device checks and ≥99% unexpected-error-free rate across at least 500 supported-client sessions recorded.
- Seller/policies/rights/budget/support approvals and explicit live-commerce permission recorded.

Retention is evaluated separately; no favorable retention metric can override incorrect entitlements or unauthorized access.

### G5 — Small public commercial launch / expansion decision

Hard requirements: G4 still valid, truthful F-054 materials, incident/support coverage, controlled cohort purchase/support results and owner approval of public rollout.

Commercial evidence target: at least ten unrelated voluntary purchasers, real acquisition/revenue/refund data and an affordable runway. This is not proof of profitability. If the target is not met, keep F-055 commercially unaccepted and choose iterate, remain limited or stop; any changed target needs an explicit scope/gate revision.

Paid acquisition expands only through a recorded budget decision using measured cohorts. An invite cap, campaign stop or store disable remains available. First-month work prioritizes bugs/balance; no new-content cadence is implied.

### What cannot be waived

No public selling with known lost/incorrect purchased ownership, cross-account access, undisclosed paid gameplay advantage or an unresolved material data-loss defect. No “acceptance” based on a test that was never run. Optional scope can be cut honestly; safety cannot be silently reclassified as optional.

## 6. Defects, regressions and evidence

### Severity

| Severity | Meaning | Release treatment |
| --- | --- | --- |
| S0 | Unauthorized money/access, leaked secrets, broad data loss or materially incorrect paid ownership | Stop affected exposure/commerce, mitigate immediately; cannot release |
| S1 | Core progression softlock, wrong economic transaction, broken required combat rule, repeatable supported-device crash, inaccessible essential workflow | Fix and rerun affected criteria before the relevant release gate |
| S2 | Nonblocking incorrect behavior or noticeable quality/performance problem with a safe workaround | Named owner/plan; assess whether it violates a hard acceptance budget |
| S3 | Minor visual/copy issue not breaking contract/readability | Track; owner may accept with disclosure where relevant |

Severity does not override a failing hard criterion: a “minor” bug that violates an acceptance requirement still needs correction or an explicit scope revision.

### Minimum regression selection

| Change | Always rerun |
| --- | --- |
| Stats, skills, AI, elements or RNG | VP-01/02, snapshot/replay agreement, capture/status/guard paths, representative actual playback |
| Formation, menus or persistence | VP-03/05, all six formations, paused-fight invalidation and saved route identity |
| Art, animation, VFX or skins | VP-01/04/06, pause/2×/reduced motion, cosmetic invariance |
| XP, loot, capture or quest rewards | VP-02/03/07, distributions/claim races, new-account campaign and zero-supply recovery |
| Auth, schemas, backend or deployment | VP-07/09, migrations/restore, guest linking, two-account isolation, stale clients |
| Prices, SKUs, webhooks, grants or refunds | VP-08 plus security, restored ownership and overlapping-grant cases |
| Analytics/event definitions | VP-10 synthetic cohorts, deduplication, privacy/retention and denominator review |
| Scope text or backlog edits | Feature/criterion IDs, references, dependency cycles, traceability and gate consistency |

Full launch candidate runs the complete applicable P0 matrix even if incremental checks passed earlier.

### Evidence template

Use one record per feature/build. Paths below are planned conventions, not existing test results.

```text
Feature: F-___
Build / source revision:
Rules / content / schema versions:
Date, tester and environment:
Device / OS / browser / effects preset:
Dependencies and their evidence:
Criterion ID | Status | Protocol/case | Expected | Observed | Evidence path
Commands / fixture IDs / seeds:
Negative and recovery cases exercised:
Actual playback vs model fast-forward:
Open defects and severity:
Limitations / unrun checks:
Owner or specialist review required:
Acceptance decision, reviewer and date:
```

Suggested public-safe location: tests/artifacts/features/F-___/<build-id>/.
Use screenshots, clips, JSON assertions and traces appropriate to the criterion. Store participant identity, raw provider records and private support data separately with access control; link only redacted references in the repository.

### Launch decision template

```text
Gate: G_
Release candidate and intended audience/cap:
Prerequisite features/criteria passed:
Safety, device and purchase evidence:
Cohort dates, maturity, source and denominators:
Targets met / missed / waiting:
Open risks and allowed limitations:
Budget/reserve, stop conditions and incident owner:
Decision: proceed / iterate / remain limited / stop
Explicit external actions approved:
Owner approval and date:
```

## 7. Scope-control and evidence boundary

This plan operationalizes the existing scope; it does not hire a team, select paid subscriptions, authorize external messages or change gameplay. Detailed internal measurement conventions (for example five cold-load repetitions, fifty duplicate claims and the presentation rubric) are acceptance definitions, not new gameplay systems or market benchmarks.

Existing pass-12 reports remain historical baseline evidence. New corrections, entrances, accounts and commerce are still pending. Keep the game-note stashes unchanged.

When implementation begins, complete the source MVP-01/MVP-02 feature group first, update actual formula/control documentation and attach current regression evidence. Then prove the reference loop before expanding content or selling anything.
