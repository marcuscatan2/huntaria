# Commercial scope v2 — Validation and acceptance plan

> Current prototype override — Patch20 (2026-09-13): all configured Echo chances
> are **15% for testing**, with faster wild levels/XP and persistent injuries.
> The visual World Atlas, direct information signs, physical Supply Store and
> free village recovery, the player cap60/engine curve100 boundary, open roads,
> six boss domains and Sheet-backed creature placement are implemented locally.
> See [Patch20 delivery and validation](PASS20_VALIDATION.md).
> The10% /0.01% figures elsewhere remain **release proposals**, not live test odds.
> This does not accept any commercial criterion or implement online boss loot.


Updated 2026-09-11. Acceptance plan; local evidence is tracked separately in [PASS13_VALIDATION.md](PASS13_VALIDATION.md). **No commercial feature is accepted by this document.** Read [scope](<Commercial MVP scope.md>), [66-card backlog](FEATURE_BACKLOG.md) and [traceability](FEATURE_TRACEABILITY.md). The [v1 plan](docs/scope-v1/README.md) is superseded, including its capture guarantees, small roster, replay-only architecture assumptions and cost/effort estimates.

Pass 15 adds authored local world layouts, illustrated scenery, physical itinerary
walking, cave/bridge navigation and persistent landmark discovery. See
[world delivery and validation](PASS15_VALIDATION.md). This extends local evidence
for F-016/F-017/F-018/F-027/F-058; it does not accept their commercial criteria,
complete online groups, or approve all 100 creature art packages.

## 1. Acceptance and evidence rules

For the owner's time-sensitive decision queue, see
[OWNER_REVIEWS.md](OWNER_REVIEWS.md). Those gates identify what becomes costly
to change after dependent production starts; they supplement G0–G5 and do not
replace the technical protocols or accept any commercial criterion. Prototype
tests and bounded early feedback do not require all final art to be approved.

Four numbered criteria per feature, 264 total, begin unchecked. Distinguish Planned, In progress, Implemented/unverified, Verified technically, Accepted and Blocked. Tests must reference feature/criterion IDs, build and rules hash, environment, fixtures/seeds, independently derived expected values, actual results, raw artifacts and reviewer.

Acceptance requires code/content present, relevant automated and manual protocols passed, recoverable error states, documentation matching the implementation, no applicable S0/S1 defects and required owner/device/business evidence. A documentation lint pass is not gameplay acceptance. Simulated users cannot stand in for outside-player studies; emulated viewports cannot stand in for physical hardware. Legacy pass-12 evidence is historical, and v1 evidence is invalidated wherever requirements changed.

User-locked requirements: ≥100 launch species, ≥30-second large-map crossing, starter 10% Echo drop, mid/late Echoes and all very-rare drops 0.01%, legal summoning 100%, no added pity, and extraordinarily rare group-boss essences. User clarification: extreme rarity is not exclusivity. Every eligible boss victory retains its independent 0.01% chance; multiple copies and owners can exist on the same realm. Definitions in the active scope and locks below make these executable without mistaking local implementation for commercial acceptance.

## 2. Design locks and fixture pack

Pass 13 freezes implemented local DEC-01/02/07 coefficients, budgets and atlas in
[Companion stats.md](<Companion stats.md>), rules.js and atlas-data.js. DEC-03 has
local-only spawn precommit/receipt semantics. These tested defaults await owner
approval; they do not close server/group design locks or release gates.


| Lock | Required record | Needed before | Accountable |
| --- | --- | --- | --- |
| DEC-01 | Damage categories; exact stat coefficients/caps; AGI readiness/basic-only choice; dodge eligibility; VIT regen/anti-stall; Leadership rounding | Mechanics fixtures, shared simulator | Implementer proposes; owner accepts; update actual Companion stats only when implemented |
| DEC-02 | XP curves, hard player cap60/engine-wild curve100, per-kill XP, high-source summon clamping, tree budgets, consumable prices, story and boss scaling | Progression/content balancing | Owner/product review; later cap changes must be player-visible and may not override locked 10%/0.01% rates |
| DEC-03 | Spawn-bound tickets, pause/2× elapsed-time policy, cancellation/consumables, guest linking and stale-client recovery | Authoritative solo rewards and saves | Implementer documents; owner accepts tradeoffs |
| DEC-04 | Seller, territories/currencies, eight cosmetic SKUs/prices, grants, refund/dispute/tax policy | Public commerce | Owner/provider/adviser as required |
| DEC-05 | Named physical hardware/browser tiers, presets, accessibility and measurement tooling | Performance certification/marketing | Owner/testers and implementer |
| DEC-06 | Recruitment/consent, data retention, cohort windows, support coverage, reserve/spend thresholds, beta-save policy | Outside studies, release gates | Owner |
| DEC-07 | Versioned 36-place atlas (24 large/six hubs/six boss domains), crossing routes/base speed, open-road danger guidance, six-region habitat/respawn tables and Sheet-backed 100-species manifest | World/content production acceptance | Implementer supplies; owner accepts defaults and quality |
| DEC-08 | Persistent home realm, boss schedules/scaling, two–three-player eligibility, tick/reconnect budgets, repeat-drop scope, per-victory deduplication/recovery | Live group/economy safety | Implementer and owner; no server-wide copy cap; retries must not duplicate a victory reward |

Planning defaults are explicit: 24 large maps/six hubs/six boss domains, 94 wild + six boss species, hard player cap60 with engine/wild curve100, 18 nodes per type, four-element ±20%, provisional 0.5% Leadership sharing, private fields, two–three-player groups, 20-Hz host and 120-second reconnect grace. Freeze exact tunables before marking related criteria verified. Do not copy whatever code outputs into an expected-value fixture.

| Fixture | Required cases |
| --- | --- |
| FIX-FRESH | Both level-1 classes, zero companions, starter build, no completed tutorial/rewards |
| FIX-RULES | Every category/status, level/stat/rank boundaries, all four elements, no-enemy-trainer and bypass |
| FIX-FORMATION | Six full deployments; zero/one companion; group locked build |
| FIX-ECHO | All 10,000 integer inputs; starter, ultra-rare, ordinary duplicate, invalid summon and no-drop tutorial |
| FIX-WORLD | All 24 large maps/six hubs/six boss domains; shortest large-map crossings, reciprocal gates, habitat/source/life/respawn records |
| FIX-PACK | Twelve templates, partial kills then defeat/disconnect, untouched enemies |
| FIX-GROUP | Two/three accounts, six bosses, 13 actors, support eligibility and trainer elimination |
| FIX-BOSS-LOOT | Fifty concurrent claims of one victory; multiple distinct successful victories and owners on one realm; reward/summon/restore boundary |
| FIX-SAVE | Legacy separate local profile, malformed values, revisions, zero companions, Lv60 active cap, preserved excess XP, Lv61–100 source provenance, realm affiliation |
| FIX-ACCOUNTS | Anonymous, guest, user A, user B, third group user and operator with isolated credentials |
| FIX-PAYMENT | Eight SKUs, overlapping grants, signed/invalid events, pending/refunded/disputed orders |
| FIX-NETWORK | Delays, jitter, dropped/repeated requests, transport reconnect, expired auth and missing chunks |
| FIX-COHORT | Activation/return/drop/payment timestamps, failed/no-Echo users, internal forced grants |

Test grants and deterministic rare drops are restricted to test builds/realms. They cannot mint a live gameplay item, migrate online wealth or count as organic cohort success.

## 3. Protocol index

| Protocol | Coverage |
| --- | --- |
| [VP-01](#vp-01) | Data, roster and content contracts |
| [VP-02](#vp-02) | Mechanics and numerical correctness |
| [VP-03](#vp-03) | Browser flows, inventory and persistence |
| [VP-04](#vp-04) | Presentation rubric and impact synchronization |
| [VP-05](#vp-05) | Usability, accessibility and input |
| [VP-06](#vp-06) | Physical performance, loading and streaming |
| [VP-07](#vp-07) | Authority, security and transaction races |
| [VP-08](#vp-08) | Checkout, ownership, refunds and purchase recovery |
| [VP-09](#vp-09) | Operations, load, cost and restore |
| [VP-10](#vp-10) | Balance, rare-drop pacing and outside-player evidence |
| [VP-11](#vp-11) | Owner, business, rights and external approvals |
| [VP-12](#vp-12) | Device/browser and optional locale certification |
| [VP-13](#vp-13) | Large-map traversal, habitats and respawn integrity |
| [VP-14](#vp-14) | Real cooperative boss rooms and network recovery |
| [VP-15](#vp-15) | Ultra-rare RNG, guaranteed summon and repeatable boss drops |

## 4. Detailed protocols

<a id="vp-01"></a>

### VP-01 — Data, roster and content contracts

Validate the release manifest, stable IDs, all references and allowed numeric ranges. Enumerate 100 distinct species (94 wild + six bosses), four classes, 520 skill assignments, 100 innates, 104 trees/1,872 nodes, 24 exploration maps, six hubs, 60 trainer/faction compositions, 12 pack templates, six bosses and 48 objective steps. A placeholder/recolor is not a species. Every species has a habitat or boss source; every map exit resolves and every skill has an explicit category. Companion boss stats use normal roster budgets, not raid HP. Test malformed, missing, duplicate, empty-pool and incompatible schema entries. Review provenance/runtime exports and eight cosmetic SKUs. Pass: complete enumerated coverage with no invalid content; a valid manifest alone does not establish art quality or fun.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-02"></a>

### VP-02 — Mechanics and numerical correctness

Derive expected STR/DEX/INT, DEX cooldown/accuracy, AGI readiness/dodge, VIT HP/defense/regen and Leadership results independently from the implementation after DEC-01. Exercise level 1/20/60/100, zero owned companions, highest benched level, respec/budget/rank caps, all 16 element pairs, all six full formations and partial formations. Test every active/passive assignment; guard, shield, heal, cleanses, anti-stall, dodge on-hit suppression, nearest-monster priority, explicit bypass and no-enemy-trainer fallback. Include solo kill-then-trainer-death and multi-trainer elimination. At least 1,000 seeded generated fights supplement boundary fixtures; print failing seeds. Cosmetics, render rate and solo 1×/2× cannot change canonical outcomes. Pass: no undefined/negative states, wrong event ordering, resource creation or unexplained cross-runtime divergence. Rare probability proof is VP-15, not a lucky random sample.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-03"></a>

### VP-03 — Browser flows, inventory and persistence

Run fresh Druid and Mage profiles from zero monsters: walk → solo kill → inspect ordinary/no-drop loot → obtain a controlled test Echo → view inventory → summon → equip one/two companions → choose skills/formation/tree → fight → return to Inner Sea. Separately verify genuine production tutorial RNG has no guarantee. Test owned/unowned species and independent duplicate individuals, same-species pairs with different XP/skills/trees, portrait picker search/swap/Escape focus, invalid summon preserving the item, prepared supply reserve/consume once, loss after a kill, map leave/re-entry, context cancellation, login expiry, two tabs and device recovery. Complete the six-chapter solo story with a normally obtainable roster, all gates and full collection UI. Group flows use VP-14 and genuine separate clients. Legacy local saves stay separate; fixtures cannot inject live wealth. Pass: truthful UI and durable exactly-once acknowledged state through every interruption, with no forced two-companion requirement.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-04"></a>

### VP-04 — Presentation rubric and impact synchronization

Pass16 evidence candidate: `tests/pass16_visual.py`, recorded WebM clips and
`tests/artifacts/pass16-visual-chrome.json`; reference contract in ART_BIBLE.md.
Headless desktop timing is not owner approval, a novice study, physical-phone
performance, live group networking or acoustic-onset measurement. See
[the pass16 matrix](PASS16_VALIDATION.md) for remaining protocol gaps.

Approve one played reference encounter plus an Echo/summon sequence using original/cleared art. Score silhouette/identity, consistent scale/ground anchor/depth, readable motion, distinct attack/cast/hit/defeat, impact timing, target/owner clarity, UI hierarchy and effect restraint. Every dimension must be acceptable to the owner; keep video, build and hardware. Impact visual versus presented HP/reaction/audio should differ by ≤50 ms at 1× and ≤100 ms at solo 2×; buffered group presentation uses the same logical event and keeps essential event order. Network transport delay is measured separately, not hidden as animation time. Require character×state coverage for 104 characters, six boss phase sequences, 24 large maps, six hubs, six boss domains and Inner Sea. Test 13-actor effects, overlap, low effects, reduced motion, pause/resume where legal and missing sprites. At least 8/10 novice reference viewers identify the trainer/objective and a useful preparation change. A screenshot or resemblance claim is insufficient.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-05"></a>

### VP-05 — Usability, accessibility and input

Observe the first ten prespecified uncoached newcomers (recruit 10–15 total): objective, preparation, map/cave entrance, drop-versus-summon and recovery tasks. Target ≥8/10 understanding/completion for deterministic tasks. Do not score a failed random drop as user error; controlled Echo UI tasks are visibly test-only. Complete all launch screens with keyboard, visible focus, labeled controls, modal focus restoration and no essential pointer-only action. Check 320/390/768/1440 CSS-pixel widths and 200% text zoom; no unreachable controls or unintended horizontal page scroll. Project targets: 44×44 CSS-pixel touch targets for principal controls, text contrast ≥4.5:1 (large text ≥3:1), meaningful graphical controls ≥3:1, redundant status cues, persistent audio/reduced-motion/flash settings. Automated DOM scans plus manual screen-reader spot checks and physical phones are required. Include 100-species filters, empty bag, claimed essence, lobby and disconnected states. Record any exception; automated scans do not certify universal accessibility.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-06"></a>

### VP-06 — Physical performance, loading and streaming

Record named hardware/browser/version, resolution, effects preset, network shaping and build. Five clean-cache trials/device at 10 Mbps down/100-ms RTT: blocking transfer ≤8 MB and p95 first playable ≤8 s (with five samples, use the worst observed value and report all trials). First playable means the trainer can move and begin the first battle with required assets, not a painted loading screen. Target desktop 60 FPS/p95 frame ≤20 ms; physical midrange Android 30 FPS/p95 ≤40 ms. Trace dense habitats and 13-actor group fights; solo fast-forward does not count as rendering evidence. Warm ten-minute loops must avoid repeated >100-ms main-thread stalls. Run thirty-minute repeated map/group loops, sample retained heap after comparable idle/collection points: no monotonic retained growth across the final five checkpoints and ≤10% net retained growth relative to the warmed baseline, with explanations for finite caches. Test missing chunks, background/foreground, touch, resize and audio. Group host: proposed 20 Hz, 50-ms tick, measured p95 CPU ≤35 ms at accepted room count; solo replay p95 <200 ms. Record raw traces, no fabricated physical-device pass.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-07"></a>

### VP-07 — Authority, security and transaction races

Use anonymous, guest, two normal accounts and operator roles against an endpoint/message permission matrix covering maps/spawns, profile, group invitations/rooms, battle settlement, Echo/summon, boss rewards, appearances, orders, export/deletion and admin. Reject wrong realm, unowned IDs, forged/stale/expired credentials, client RNG/clock/winner edits, teleport/spawn reuse, malformed/oversized/injection payloads and forged operator requests. Verify origin, auth/session expiry, message authorization and rate/size limits for live sockets. Secrets never enter public bundles or sensitive logs. Run 50 concurrent/repeated kill/claim/summon/start requests, injected failure at each transaction boundary and stale profile revisions. A commit is complete once or absent, with a recoverable receipt—not partially duplicated. Recompute ≥1,000 golden fights across browser/server and profile worst replay CPU. Cross-environment/test grants cannot reach production. Pass: no known critical authorization/economic exploit, no lost/duplicate committed rewards, and explicit bounded limits with legitimate-play controls.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-08"></a>

### VP-08 — Checkout, ownership, refunds and purchase recovery

In provider sandbox, cover all eight SKUs and actual bundle contents with server catalog/price versions. Test anonymous/unverified/account mismatch, duplicate owned purchase, preview-only access, pending/cancel/failure/success, lost redirect, double-click/two tabs and network retry. Only authenticated provider events grant paid rights; valid/invalid signatures and environment IDs, 50 duplicate/concurrent events, late/out-of-order events and partial fulfillment failures are mandatory. Verify cross-device restore, equipped appearance, overlapping paid/earned grants, full/partial/refused refunds where supported and disputes. Revoke only the relevant grant; gameplay reset/deletion handling cannot erase required purchase audit history. Reconciliation must recover lost grants once without trusting local save data. Pass: consistent ledger/provider status and cosmetics-only invariance. Live payment/refund is a separate owner-authorized action with actual costs recorded, never an automatic test permission.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-09"></a>

### VP-09 — Operations, load, cost and restore

Deploy only approved staging with isolated auth, DB, realms, payment mode and secrets. Rehearse versioned upgrade/rollback, stale clients, migration failure, operator denial/audit, encounter/group/reward/store kill switches and alert delivery. Load: 100 active-account equivalents total, including ten concurrent three-player boss rooms on isolated test realms, 1.7 average/20 peak settlements/s for 15 minutes plus spawn/save traffic. Do not manufacture extra production boss lives to pass a benchmark. API p95 <1 s; host tick and no-loss/no-duplicate objectives hold; measure CDN/roster/map bandwidth separately. Record forecast, invitation caps and spend/incident thresholds; F-066 must replace the old allowance. Back up, then create known purchases, boss rewards/summons and deletions beyond the snapshot. Restore clean staging: ordinary RPO ≤24 h; reconcile payment and accepted victory/reward/summon receipts before writes reopen. Retry an old successful claim without duplicating its item, then force a new eligible victory successful in the test realm: another legitimate essence must be allowed. Pass: no lost/duplicated acknowledged rewards, no restored consumed items or resurrected accounts, unchanged future 0.01% odds, visible unresolved cases and a rehearsed runbook.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-10"></a>

### VP-10 — Balance, rare-drop pacing and outside-player evidence

Both classes need useful distinct builds and solo-beatable initial wildlife. Each species needs at least one useful tested build; rare/boss companions are not automatically stronger. Simulations sample role/class/build interactions and stalls; real players establish enjoyment. Observe 10–15 reference players, then 20–50 free pilot users over 2–3 weeks, then 100–300 free beta newcomers with mature seven-day cohorts. Report first battle ≤2 min target, first-battle completion ≥85%, starter kills/time to Echo, ≥29-kill unlucky starter tail, no-Echo abandonment, route/travel boredom, group formation/completion and leaver feedback. D1 ≥25%/D7 ≥10% are diagnostic targets; measure D30 with 5% aspiration, not guaranteed performance. Define D1/D7/D30 as return during [24,48), [168,192), [720,744) hours after first playable; publish denominators including failed activation separately and exclude internal/test traffic. Verified purchase/refund revenue is separate from intent surveys. Report uncertainty and mature windows. Controlled rare test grants never count as organic acquisition; do not demand all 100 collection completion, infer guaranteed outcomes from means or quietly add pity. Owner records proceed/iterate/stop with rationale.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-11"></a>

### VP-11 — Owner, business, rights and external approvals

Collect dated decisions for seller/provider eligibility, territories, age/language/platform scope, cash and time, support/incident ownership, data collection/retention/deletion, refund/consumer/tax responsibilities and relevant adviser review. Audit provenance/licenses for art, sound, fonts, code and branding. Verify approved policy links and owner-controlled accounts/secrets without committing secrets. F-066 rebaseline is required: one complete batch/map/group/restore pilot, remaining scope forecast, actual bandwidth/host costs and reserve. Pass: explicit approvals for the relevant stage and no unresolved blocking dependency; a checklist is not an agent's legal certification. Public deployment, ads, third-party signup, data collection and live charges each require appropriate owner authorization.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-12"></a>

### VP-12 — Device/browser and optional locale certification

Primary launch support is named Chrome/Edge desktop and Chrome on a physical midrange Android, subject to DEC-05 confirmation. Record actual versions/models; emulator viewport and file-mode smoke tests do not certify physical performance or online payment recovery. Complete fresh solo hunt, Echo summon, collection/loadout, map transition, real group/reconnect, account restore and checkout return. Retest audio policies, screenshot export, background memory and touch. If PT-BR is adopted, review stable-string coverage, placeholders, plurals/numbers/prices, long layouts and a fluent-reader journey. If Safari/iOS is adopted, a named physical iPhone must pass its supported tier; otherwise do not advertise it. Neither P1 may weaken P0 purchase/account safety.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-13"></a>

### VP-13 — Large-map traversal, habitats and respawn integrity

Pass17 specification override: species rosters and counts are per map; positions
are random reachable dry points persisted per life, not fixed clusters.
Check Common8/Uncommon5/Rare1, ordinary0s/rare60s, at least900 units between
successive locations, exact map totals, cooldown display, reload stability,
retired legacy surplus slots and reserved old encounters. Keep availability/
placement distinct from unchanged10% starter and0.01% other Echo odds.
Local test evidence does not replace the server/device/concurrency gates below.

Validate atlas adjacency, all 24 large maps/six hubs/six boss domains and every reciprocal gate; danger guidance must never become an invisible region lock. For each large map, determine shortest valid opposite-edge routes along both meaningful axes, both directions; compute distance at locked base speed and perform timed walks. Exclude combat, idle, load delay and detour padding. Pass minimum ≥30 s everywhere; report target 45–90 s and genuine landmarks/choices, not a long empty corridor. Compact hubs/boss domains are exempt; buffs may shorten. Test true 2D collision/roaming, path interruption, corners, safe arrival, chunk seams/failures and repeated crossings. Every one of 94 wild species has a declared Sheet-backed source; rare slots/windows and spawn probability are separate from Echo rate. Test server life reservations, respawn wall time, logout/reload/two devices, defeated members of packs, map reset and concurrent entry. No extra rare attempt or loot life may be created. Record density/streaming performance and outside-player travel feedback.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-14"></a>

### VP-14 — Real cooperative boss rooms and network recovery

Use two and three independently authenticated clients, not three AI parties in one solo simulator. Cover invite-only same-realm lobby, readiness/build locks, duplicate/start races, owner permissions, invalid party count, leader exit and joining late. One server room owns the realm boss life. Exercise all six bosses, two/three-player scaling, 13 actors, heals/shields across parties, own-only Leadership, targeting, one trainer eliminated while others win, all eliminated, simultaneous endings and support-only loot eligibility. Solo pause/2× must not affect group time. At nominal 100-ms RTT, target presented authoritative events within 250 ms p95 after server emission; record clock synchronization/error. Inject 300-ms RTT with jitter, delayed/out-of-order application messages, transport interruption and expired sessions: no state divergence or duplicate result, with truthful delayed/reconnect UI. Underlying reliable sockets do not imply application requests/acknowledgements arrive once. Reconnect within 120 s or result while server auto-battle continues; later recover receipts. Ordinary loot and the single group essence roll settle once; a disconnected/defeated eligible member is not rerolled away. Pass functional and measured host/network requirements, not a locally simulated group screenshot.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

<a id="vp-15"></a>

### VP-15 — Ultra-rare RNG, guaranteed summon and repeatable boss drops

Exhaust integers 0–9,999: starter threshold accepts exactly 1,000, very-rare threshold one; test boundary 0/1/999/1,000/9,999, zero/100% rows and malformed percent units. Supplement with a seeded statistical sanity test, never use a flaky observed rarity threshold as the only proof. Independently verify mean and quantiles: 10% → mean 10, median 7, 95% 29; 0.01% → mean 10,000, median 6,932, 95% 29,956. No first-kill/pity/streak/paid modifier or reroll-on-retry. Validate each per-kill/per-group scope and multiple-row aggregate disclosure. Guarantee legal summon atomically: consume a specific item and grant its companion once, or preserve the item; already-owned species may be explicitly summoned into another independent individual; cancel/error preserves the item. Every eligible named boss victory gets one independent 0.01% group roll with uniform eligible-recipient selection, including after earlier drops, summoning and other players acquiring the species. Concurrency fixture: 50 retries of one accepted victory yield one roll and at most one award. Separately force two distinct victories successful on the same realm: both must grant an essence. Test different recipients and the same already-owning recipient; ownership changes neither drop chance nor recipient eligibility. Verify several accounts can summon the same boss, later drops remain enabled, and no globally claimed/unavailable UI appears. Restore and repeat old receipts without duplicate grants; new eligible victories still roll normally. Scope of deduplication is (victory_id, loot_row_id), never (realm_id, essence_id). No global issuance/retirement ledger is needed. Production debug grants remain impossible. Pass exact math, lifecycle/race/recovery cases and truthful UI; organic ultra-rare success is not required to execute QA.

Evidence: pinned build/rules, inputs/seeds, raw observations/traces, expected versus actual, failures and dated reviewer decision.

## 5. Milestones and release gates

### G0 — Ready for a bounded test

Owner approves a bounded pilot, test-data policy and any external service/spend; M0 records user-locked constraints, atlas/roster manifest, DEC-01/03/07/08 proposals and runtime/reward-ledger risk. Test-only rare grants and isolated realms are explicit. No production commerce is enabled. Unknown full-release budget stays unknown.

### G1 — Reference loop accepted

One large starter map passes crossing/navigation checks, trainer-alone kills work for all four classes, a real drop path and controlled guaranteed summon work, and the polished reference meets VP-04/05. First ten-species batch and three-client boss/reward-recovery spike supply measured throughput/cost data for F-066. Owner accepts the reference and a revised full-release forecast or limits further work. This is not a 100-species launch.

### G2 — Free pilot evaluated

20–50 invited players over 2–3 weeks, with authorized data collection and no live purchases. Stable accounts/rewards and actual small-group play pass applicable security/reconnect tests. Report no-Echo attrition, navigation, builds and unresolved defects. Clearly label the content subset. Reforecast before multiplying art/maps, not after the budget is gone.

### G3 — Full-content free beta evaluated / commerce candidate

All 100 species, 24 large maps, six hubs, six boss domains and six group bosses are content-complete and testable; ultra-rare species are verified through isolated test grants. 100–300 beta newcomers have mature seven-day data. Full-scale VP-01–VP-15 relevant safety/device/restore tests run, payment sandbox passes and all S0/S1 defects are closed. If content is incomplete, remain a pilot rather than relabeling it a launch-ready beta.

### G4 — Allowed to sell to an invited cohort

Owner separately approves live selling, provider/business policies, budget/operations and a bounded cohort after G3. Verified payments/refunds/restore, rare-reward recovery, supported devices, support tools and kill switches pass on the candidate build. Record voluntary purchases from unrelated players (initial signal: ten, not a quota or proof of profitability). No paid power or probability advantage is introduced.

### G5 — Public commercial release / controlled expansion

All 64 P0 cards and 256 P0 criteria are accepted; optional P1 support is advertised only if accepted. Verify the complete world/roster, 500 supported sessions with ≥99% unexpected-error-free rate, live-service safety, mature cohorts and measured funded operating limits. The owner records proceed/iterate/delay with actual revenue/refunds/fees/costs and uncertainty. A quiet small launch does not waive content or payment/rare-economy safety.

Cannot waive: server authority, no duplication/loss of acknowledged rare/paid ownership, repeatable independent drops with per-victory deduplication, required approvals, zero known S0/S1 and the user's content/rate constraints. Missing cohort maturity, devices, funds or business permission is missing evidence—not a fabricated pass or permission to spend.

## 6. Defects, regression and evidence templates

S0: security/data exposure, fraudulent grants, replayed/forged essence reward or widespread irreversible ownership loss—disable affected operation immediately under the approved runbook.
S1: reproducible blocked core journey, systematic wrong rewards, unavailable supported platform, group desync/incorrect winner, unusable map or purchase recovery—release blocker.
S2: material but recoverable defect with a known workaround; owner and target fix required.
S3: cosmetic/minor defect not obscuring mechanics or contradicting product claims.

Unexpected-error-free session: first playable until 30 minutes inactivity or explicit logout, joined across transient reconnects. Numerator excludes sessions with an unhandled client/server gameplay exception, unrecoverable blank/crash, lost acknowledged progress or state-desync requiring reset. Expected declines/cancellations/validation messages are not crashes. Report failed-load activation separately; do not exclude it from funnel reporting.

Rule changes rerun VP-01/02/07 and affected 03/14/15. Spawn/world changes rerun 01/03/06/13/15. Loot/boss-reward changes rerun 02/03/07/09/14/15. Renderer/assets rerun 04/05/06/12 plus event-invariance. Identity/profile/restore rerun 03/07/08/09/14/15. Commerce changes rerun 07/08/09/11. Final integration reruns required journeys on the actual RC after the last fix.

Feature evidence record:

- Feature/criterion IDs; state; owner/reviewer; date.
- Build/content/rules/schema hashes and environment/realm (no secrets).
- Fixtures/seeds, devices/browser/network settings and protocol steps.
- Independently derived expected outcome; observed outcome and raw artifact links.
- Failed cases, defect severity/owner, limitations and retest result.
- Acceptance decision and which later changes invalidate this evidence.

Gate decision record:

- Gate/build; full or pilot content inventory; prior gates and outstanding conditions.
- Protocol reports, accepted/failed/not-run criteria, live-service and rights approvals.
- Cohort dates/maturity/denominators, first-Echo tails, retention/revenue uncertainty.
- Actual production/capacity/cash forecast and support/incident limits.
- Owner's proceed/iterate/delay decision, specific authorization and next review.

## 7. Documentation integrity boundary

Run `python tests/scope_docs_check.py` for read-only checks of 66 IDs, 264 criteria, 28 source items, 18 scope sections, 15 protocols, eight locks, six gates, dependencies, links and v2 design invariants. It does not execute combat, prove statistical randomness of a deployed RNG, test the database, certify devices or mark any criterion delivered.

Current gameplay remains pass12. The active commercial scope supersedes v1 planning; live README/progress/formula references and the immutable v1 archive remain historical evidence of their respective versions.
