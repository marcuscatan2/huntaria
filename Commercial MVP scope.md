# Bond & Bolt — Commercial scope v2: World and Soul Echoes

> Current prototype override — Patch20 (2026-09-13): all configured Echo chances
> are **15% for testing**, with faster wild levels/XP and persistent injuries.
> The visual World Atlas, direct information signs, physical Supply Store and
> free village recovery, the player cap60/engine curve100 boundary, open roads,
> six boss domains and Sheet-backed creature placement are implemented locally.
> See [current playtest walkthrough](<features/opening/VALIDATION.md>).
> The10% /0.01% figures elsewhere remain **release proposals**, not live test odds.
> This does not accept any commercial criterion or implement online boss loot.


Updated 2026-09-12. Active **commercial requirements**, not a completed release. Supersedes the v1 plan retained in Git history. The user subsequently authorized F-001–F-016 implementation; [current implementation scope](<features/delivery/REMAINING_SCOPE.md>) covers their local playable portions. Online dependencies, production art and commercial acceptance remain pending. No public deployment or purchases were authorized.

Companions: [feature backlog](FEATURE_BACKLOG.md), [validation plan](VALIDATION_PLAN.md), [traceability](FEATURE_TRACEABILITY.md), [current prototype](README.md), [current implementation scope](<features/delivery/REMAINING_SCOPE.md>), [game notes](<Game notes.md>).

## 1. Executive decision

The release is now a substantial browser monster-tamer with a large connected, map-based world and optional cooperative bosses—not the former ten-monster solo MVP. Preserve its identity: automatic tactical combat, a vulnerable participating trainer, two companion slots, build preparation and an Inner Sea for summoned creatures.

User requirements now locked into the plan:

- Soul Echo acquisition is random; summoning a legally owned Echo is **100% successful**.
- Starting creatures have higher Echo chances, using **10%** as the baseline, and can be defeated by the trainer alone.
- Mid/late Echoes use **0.01%**, also the standard for every item designated very rare. Rare creatures are themselves hard to find; rarity of appearance and drop probability are separate.
- Rare group bosses can yield exceptionally scarce essences. The user clarified that 'one of a kind' means extreme rarity, not a server-wide copy limit.
- A large world has many large maps, fixed monster habitats and at least **30 seconds** to cross each exploration map.
- **At least 100 distinct monster species at commercial launch.**
- F2P and paid cosmetics only remain mandatory.

Planning decisions made here: six regions, 24 large maps, six compact hubs and
six compact boss domains; 94 wild species plus six summonable boss species;
two–three-player private boss parties; repeatable independent boss-essence drops
with no realm-wide supply cap. These counts and policies beyond the user's
minimums are explicit defaults, not claims the user chose every detail.

There is no hidden pity, guaranteed first drop, second summoning gamble or automatic rate increase. A smaller free pilot may validate development, but cannot be called completion of this commercial launch scope.

## 2. Current prototype and scope boundary

The current local build has quiet named Apprentice creation (dagger/bow),
four-class practice, specialization and legacy classes, 100 species definitions/supplied sprites,
24 large maps/six hubs/six boss domains, independent copies, skills/trees/formation, Soul Echo
summoning, six local campaign chapters and simulated boss practice. Active fights
continue behind menus, retain their world anchor, admit reserved aggressive
joiners and offer a timed Run. Local earned Inner Sea decorations, picture export,
persistent settings/audio, immutable preview packages and browser/Node simulator
checks are now implemented. See the [current implementation scope](features/delivery/REMAINING_SCOPE.md).

It does **not** have approved final art/motion, live groups, authoritative
accounts/loot, payments or commercial acceptance. The expanded class spreadsheet
remains a proposal with unresolved cap/stat/actor-budget conflicts. Existing
attributes and physical entrances are implemented; [Companion stats](<Companion stats.md>)
describes live formulas. Character sprites were not changed by the latest batch.

The Sword x Staff and Ragnarok comparisons express presentation/navigation goals. They do not authorize copied art, maps, names or implementation of a full MMO. Local research files are references, not instructions overriding the user's request.

## 3. Product and core loop

Walk to a recognizable habitat → choose a visible creature → watch a prepared automatic fight → collect ordinary loot and occasionally its Soul Echo → summon that species with certainty in the Inner Sea → adjust party/skills/formation → explore further or join friends for a boss.

Creatures have predictable homes, with local roaming and persistent respawns. Players can deliberately hunt a species rather than repeatedly choose a menu page and receive a random encounter. Valuable drops give a reason to revisit locations.

Rarity controls access, not an automatic stat advantage. Common species must remain useful. A summoned boss uses a balanced companion profile, not its encounter's raid HP, damage or phase-only powers. Story progress, necessary combat roles and ordinary builds cannot demand a 0.01% drop. All 100 species, including the six boss species, remain obtainable by any eligible player; another player's success never locks a species out. Completing all 100 is not required for ordinary progression, because acquisition can still take an extremely long time.

## 4. Included work and deliberate exclusions

P0 includes the world/roster below, four classes, automatic solo and private group combat, fixed habitats, Echo acquisition, inventory/Inner Sea, progression/trees, production graphics/audio, browser usability, authoritative accounts/loot, eight cosmetic products, payment safety, operations and commercial validation.

Private personal exploration instances are the efficient launch default. The map world is geographically connected; it does not require every exploring player to share one simulation. Bosses use shared realm scheduling and real synchronized group sessions. Town crowds, open-world kill stealing and server-wide player movement are excluded.

Also excluded: PvP, trading/auction house, guilds, public chat, water exploration, walkable housing construction, a paid battle pass, loot-box sales, paid gameplay supplies, premium luck and paid boss entry. PT-BR and physical Safari/iOS certification remain P1 unless promoted before marketing them.

GN-001 account-wide species-level buffs and GN-002 quest evolution remain stashed. GN-009 cooperative bosses are promoted into this commercial plan, not retroactively implemented.

## 5. Combat and attribute contract

Solo parties contain the trainer and **zero, one or two** companions. A fresh profile creates a named level-1 Apprentice alone, chooses a dagger or bow and starts in the forest without a guide chain. Both weapons must defeat the introductory Emberfox without a paid/rare consumable. Druid, Mage, Hunter and Swordsman are the launch specializations: four demonstrations, Tidecrown and easy master acceptance battles lead to a confirmed choice at player Lv20. Legacy Druid/Mage profiles remain usable. General menus accept zero-to-two companions; authored party trials may require two.

Each actor has five active choices and equips three in priority order. Each species has one innate passive. Front/middle/back sets initial deployment; movement, range and target changes then happen normally. All party members may share a row. Ordinary attacks choose the nearest living enemy, including trainers. Explicit skills/passives can select another target. Wild fights with no enemy trainer have valid fallback targets.

| Attribute | Required identity |
| --- | --- |
| STR | Classic melee ATK, multiples-of-ten bonus and secondary ranged ATK |
| DEX | Classic ranged ATK, secondary melee ATK, HIT, attack speed and cast-time scaling; no cooldown reduction |
| INT | Classic MATK minimum/maximum and soft MDEF; authored healing relationship specified |
| AGI | Classic attack-delay reduction and FLEE |
| VIT | Classic HP multiplier, soft defense, standing HP recovery and healing-item bonus |
| Leadership | Share eligible raw stats once with the trainer's own monsters |

Every damaging basic/skill declares melee physical, ranged physical or magic; a projectile alone does not imply DEX or INT. Keep Speed displayed as seconds per ready action: current reference is 100 / Speed. DEC-01 locks whether AGI affects all readiness or basics only, exact coefficients, bounds, dodge and regen. Provisional Leadership remains 0.5% per point of the five other eligible raw attributes, excluding itself, derived stats, tree bonuses and received shares.

Four elements remain Water > Fire > Earth > Wind > Water, provisional 1.20 advantage / 0.80 disadvantage / 1.00 otherwise. Test all 16 combinations, redirects and damage-over-time; rarity itself adds no damage bonus.

Solo trainer death ends that attempt, but **previously accepted eligible wild kills retain their per-kill loot**. Untouched enemies award nothing. NPC-owned monsters do not drop wild Echoes. Packs are explicit groups of up to five weak enemies. Aggressive creatures may approach an anchored active fight and join after their spawn life is reserved and their command order recorded; passive/unrelated creatures do not silently join.

Solo pause and 1×/2× are allowed, with no changed result or extra reward roll. Normal trainer battles initially target 25–60 seconds; starter solo hunts should be shorter and measured separately. Retain deterministic timeout/anti-stall rules and validate level-cap builds before locking durations. No manual dodge mechanic is implied by animated boss warnings.

For groups, up to three trainers plus six companions face one boss and up to three adds: **13 actors**. One trainer dying eliminates their own party from acting, not their friends. All trainers dead loses; boss dead with a surviving trainer wins. Ordering resolves simultaneous defeat once. Heals/shields may aid living allied parties under explicit range/priority rules. Leadership never cascades between trainers. Group time cannot be paused, sped up or restarted by a client.

## 6. World atlas, geography and content budget

Working geography: **24 large exploration maps across six regions**, composed of 18 outdoor field/forest maps and six caves, plus **six compact safe hubs and six compact boss domains**.

| Region / hub | Outdoor maps (three each) | Cave map | Wild species assigned* |
| --- | --- | --- | ---: |
| Mosslight / Mosslight Village | Firstlight Meadow; Fernpath Woods; Elderroot Glade | Rootveil Cave | 16 |
| Willowbrook / Willowbrook Town | Brookside Fields; Rainwillow Forest; Reedwatch Banks | Springwater Cave | 16 |
| Amber Hollow / Amber Crossing | Amber Heath; Copperleaf Forest; Sunfall Basin | Emberglass Cave | 16 |
| Moonwell / Moonwell Sanctuary | Moonlit Gardens; Whisperwood; Fallen Observatory | Moonstone Cave | 16 |
| Windstep / Windstep Outpost | Windstep Prairie; Skybough Forest; Highwind Escarpment | Thunderhollow Cave | 15 |
| Ashen Reach / Ashenwatch | Ashgrass Expanse; Cinderwood; Obsidian Approach | Deepember Cave | 15 |
| Total | 18 outdoor maps | 6 cave maps | 94 |

*Species may inhabit several maps; these are primary-region production allocations totaling 94, not 94 copies or mandatory exclusivity. Each region also has one group-boss species, bringing the baseline to 100. Names are original working labels, subject to rights/creative review, not finished content.

Main travel spine: Mosslight ↔ Willowbrook ↔ Amber Hollow ↔ Moonwell ↔ Windstep ↔ Ashen Reach, with additional reciprocal cross-region roads so exploration is not a single corridor. Inside each region, the hub connects to all four large maps; outdoor maps connect in a loop and each cave reaches its own boss domain. The atlas records exact reciprocal exits and danger guidance. Region levels never act as invisible travel locks. Cave/forest gates lead into actual walkable maps, not a three-battle board.

Every large map must take **at least 30 seconds** along the shortest valid opposite-side route at unbuffed base walking speed; target **45–90 seconds**. Test both meaningful axes and directions. Loading, fighting, idling and deliberate obstruction padding are excluded. Speed buffs may reduce traversal time. Compact safe hubs are exempt. At a hypothetical 210 world-units/second, the raw 30-second distance is 6,300 units; use actual locked runtime speed, not this illustrative value, for validation.

Large means navigable two-dimensional terrain, branching paths, landmarks, collision, shortcuts and several habitat spaces—not scaling up a background or extending an empty corridor. Chunk streaming, camera tracking and landmark visibility maintain continuity. Production acceptance measures both travel and whether the path contains interesting choices; length alone is not fun.

Each map declares species, levels, per-species population targets and respawn timing. Individual lives appear at persisted random reachable dry locations throughout their source map, not fixed small groups. Pass17 targets Common8/Uncommon5/Rare or Very rare1 per species/map, ordinary immediate replacement elsewhere and rare60s cooldown, independently of Echo rates. The server must own each spawn life, engagement reservation, death and next respawn; local implementation is not online authority. Reloads, transitions and second devices cannot accelerate respawns or duplicate lives. Personal field instances avoid kill stealing; rare boss opportunities remain shared at realm scope.

Authored launch budget: six chapters with 48 objective steps; 60 trainer/faction encounter compositions (ten per region); 12 pack templates (two per region); six group bosses. Chapter completion has a solo-capable trainer/faction ending. Group bosses and ultra-rare collections are optional mastery goals. The Hollow Seal remains an original faction, not a renamed borrowed team.

## 7. Progression, Soul Echoes and earned economy

The launch has a hard **player cap of Lv60** for trainers, owned companions,
active XP, attributes and trees. The engine and world remain designed through
Lv100 so wild creatures can exceed60 and later cap patches do not require a
rewrite. A Lv61–100 Echo becomes a Lv60 owned individual while retaining its
source level. Old excess XP is preserved but inactive. Any future cap increase
must be an explicit, player-visible patch; DEC-02 still freezes pacing after
measured play without changing locked drop probabilities.

Trainer XP and each owned individual's XP are independent values on the same cumulative curve. Migration initializes trainer XP at the old visible level without changing companion XP. Accepted encounters declare trainer and participating-companion XP separately; the authored opening route reaches the Lv2/4/6/12/15/20/25/30 thresholds without a generic grind gate. A summoned individual starts at its declared drop-source level under the locked rule. Benched individuals receive no encounter XP by assumption.

### Drop and summoning rules

| Source/action | Probability and scope | Consequence |
| --- | --- | --- |
| First accepted introductory Emberfox victory | One named, receipt-backed guarantee | One ordinary Emberfox Echo; never repeats |
| First accepted Bloomslime-or-Stonehorn onboarding choice | One named, receipt-backed guarantee | One ordinary Echo of the selected species; never awards both |
| Designated starter wild species | 10% per eligible killed spawn life | An ordinary species Echo item |
| Designated mid/late species Echo | 0.01% per eligible killed spawn life | Rare species item, not an automatic roster grant |
| Any item tagged very rare | 0.01% per eligible table row | Independent rows explicitly declared |
| Named group-boss essence | 0.01% once per eligible group victory, every time | One eligible recipient chosen uniformly on success; no global copy cap |
| Later eligible victories against the same boss | Still 0.01%, independent of past drops or ownership | Multiple players and repeated victories can produce further essence items |
| Legal owned Echo summoned in Inner Sea | 100% | Consume one Echo, create one independent individual, persist receipt |

A 0.01% probability is **0.0001**, or **1 in 10,000** eligible rolls. The server samples a uniform integer 0–9,999: 10% accepts 1,000 outcomes, 0.01% accepts one, and guaranteed summoning needs no RNG at all. Enforce table versions and explicit per-kill/per-player/per-group scopes.

Starter species should cover early roles; initial candidates are Emberfox, Stonehorn, Bloomslime and Tideotter. All are deliberately solo-beatable. Starting species may remain at their starter rate when revisited; do not silently nerf a row merely because the player leveled. Intermediate-source rates are tunable, but anything designated mid/late Echo or very rare must follow the locked 0.01% policy unless the user approves a revision.

There is **no pity**, first-kill exception, guaranteed-after-N reward or rare-food/luck boost. The first tutorial Echo is not guaranteed. Tutorial hints and normal coin/objective progress continue through unlucky streaks. Test-only inventory grants may exercise summoning UX without claiming a real drop.

Coins/materials and Echoes can roll independently. If a table has several 0.01% rows, the chance of any rare reward is higher than 0.01%; do not present the per-row number as the aggregate. Species encounter probability and Echo probability conditional on the kill are reported separately. An absent habitat tier must not create an invalid roll.

### Honest odds and pacing risk

For independent identical eligible rolls, P(at least one drop after n) = 1 − (1 − p)^n; expected kills = 1/p. These are probabilities, not guarantees:

| Per-kill chance | Mean kills | Median threshold (≥50%) | ≥95% threshold |
| --- | ---: | ---: | ---: |
| 10% | 10 | 7 | 29 |
| 0.01% | 10,000 | 6,932 | 29,956 |

After 10,000 kills at 0.01%, the chance of at least one drop is only about 63.21%. Rare spawns increase elapsed hunting time further. If a particular realm boss permits ten eligible victories/day, expected time to its first essence is 1,000 days, and the 95% threshold is about 2,996 days, assuming the rate and schedule remain unchanged. This illustrates risk, not a proposed spawn schedule.

Keep those tails visible in studies. No guarantee of completing the roster in a fixed number of hours is credible. Each successful group roll awards one item to one eligible recipient, but future victories still roll normally. Neither a finite kill count nor the average guarantees an individual a drop.

### Items and summon transactions

Defeated wild creatures can show a local loot/echo remnant. The server commits a personal reserved reward first; clicking acknowledges collection. Leaving, losing or disconnecting auto-recovers committed rare loot to the bag. There is no public ground-loot race or second pickup roll.

At the Inner Sea altar, one owned Echo performs a short summoning ritual and creates a new independent individual with certainty. It consumes no papyrus, paid currency or additional chance item. Invalid/cancelled requests preserve the Echo; valid retried request IDs retrieve the original individual receipt. Existing species ownership does not block a new summon using another Echo. Ordinary duplicate Echoes can be stored or used for independent copies with separate XP, skills and tree investment. No trading or account-stat stacking is added.

Prepared earned consumables retain reserve → consume-on-start → receipt semantics, but no food increases Echo chances. Food, respec and coins cannot become paid advantages. Economy tests include lost fights after kills, zero companions and no inventory capacity loss for rare drops.

## 8. Graphics, animation, fluidity and audio

A coherent original reference fight is the quality gate: Druid, Emberfox and Stonehorn facing Mage opposition, a Soul Echo drop, a summon and representative group support. Approval requires actual play/video on named hardware, not a still image or unsupported Sword x Staff parity claim.

The art bible fixes silhouette, proportions, lighting/palette, ground anchors, scale, depth, icons and typography. All **100 species and four classes** need idle, move, basic attack, cast, hit, defeat and victory states; each of six bosses needs warning/charge, phase and recovery. Shared rigs, effects and tree templates reduce labor, but recolors do not count as distinct monsters and whole-portrait bobbing does not satisfy an attack.

The baseline has **520 skill assignments, 100 innate assignments and 104 eighteen-node trees = 1,872 nodes**. It does not require 520 different engine implementations. Every assignment still needs semantic, visual and timing QA.

Use event-driven effects: projectile arrival, HP update, reaction and sound express the same impact. Low-effects/reduced-motion retain essential information. Cross-party ownership and boss warnings stay legible with 13 actors. Produce species in batches of ten and maps from a measured reusable pipeline; the last batch must meet the first batch's approved floor.

Plan three short music loops with regional arrangement reuse and approximately 20–30 reusable SFX cues; no voice acting. Rights, source files and runtime exports are tracked. Audio begins after browser-permitted interaction, has persistent volume controls and conveys no indispensable audio-only mechanic.

## 9. UX, inventory, onboarding and Inner Sea

Primary navigation remains Explore, Party & Bag and Battle. Atlas, collection/Inner Sea, inventory, trees, formation and group lobby are coherent subpages. The bag separates supplies/materials/Echoes/cosmetics and displays species, source, exact chance, quantity, ownership and pending-receipt status where relevant.

Zero-monster inventory/party screens are intentional. The tutorial teaches movement, solo combat, ordinary rewards, the 10% starter drop and guaranteed summoning. First combat targets ≤2 minutes for newcomers; first random Echo has no forced deadline. Loss reports use observed events to explain one preparation change.

The Inner Sea is a Lv25 farm with a wooden house, five habitats, strongest-resident displays, cleanliness-based AFK training and strongest-species power. Five assigned monsters defend it each day against trainer-level attackers scaled by real lunar phases. Defeat removes XP from all owned monsters and damages the farm; item repairs restore training and account bonuses. Habitats upgrade independently, while cosmetic sockets/styles and local PNG export remain stat-free. See [farm scope](features/inner-sea/FARM_SCOPE.md) for the initial implementation and later boss/dungeon habitat equipment. Visiting and walkable construction remain deferred.

Keyboard-only completion, visible focus, correctly labeled modals, meaningful empty/error/pending states, 200% text zoom, non-color-only status indicators and reduced motion are mandatory. Support 320/390/768/1440 CSS-pixel layouts and named physical devices.

## 10. Cosmetics-only commercial model

Eight initial paid products remain a reasonable bounded catalog: two trainer sets, two monster appearance variants, two summoning-ritual styles and two Inner Sea decoration bundles. Also provide at least three attainable earned cosmetics. Not every monster requires a paid skin at launch.

Use transparent direct prices and actual character/scene previews. No premium-stat gear, Echo/essence sales, paid rare-entry priority, drop boosters, extra paid rolls, randomized paid products or manufactured store scarcity. Cosmetic variants must leave simulation, loot probabilities, silhouette readability and targeting equivalent.

Server-verified provider events—not a browser checkout return—grant ownership. Payment and refund flows must be idempotent, recoverable and auditable, including overlapping ownership and cross-device restoration. Seller/provider eligibility, taxes and policy approval are external launch dependencies, not presumed solved by a feature list. This plan authorizes no purchases or live charges.

## 11. Architecture: personal fields, shared boss realms

A browser client handles rendering, inputs, interpolation, menus and solo prediction. Server-owned identity, movement/access checks, spawn lifecycle, RNG, inventory, progression and receipts prevent the local prototype from deciding online wealth.

A persistent **logical realm** is a stable service identity, not a machine, browser tab, physical process or disposable fight instance. Begin with one production realm and one home realm/account. Personal exploration maps belong to account instances within it. Realm boss scheduling and encounter reward receipts are shared by all workers. No launch trading, realm transfers or mergers are included; realm identity does not impose any essence supply cap.

Use managed authentication, a transactional database and a versioned static asset/CDN pipeline. Do not freeze a vendor or presume a stateless replay endpoint supports synchronized groups: F-036 measures a live-room runtime early. Solo battles can predict locally and validate against a spawn-bound ticket; groups use an authoritative proposed 20-Hz host with versioned ordered snapshots/events and reconnect.

Two–three-player boss parties are invite-only. Every ready member locks a legal build before pull. The server reserves one realm boss life, checks requirements and sets difficulty/scaling. Production excludes the current arbitrary boss-level testing controls. One live encounter owns a realm boss life; no parallel instances farm the same opportunity.

Disconnects do not pause the automatic group simulation. Reconnect grace is 120 seconds or the encounter's end, whichever is earlier; completed receipts remain recoverable afterward. A member who was ready at pull and made a valid attack or effective support contribution qualifies for loot; absorbed shielding counts. Defeated/disconnected members retain earned eligibility. Late joiners/spectators do not. No damage-only policy penalizes support classes.

### Repeatable ultra-rare boss essence rewards

Every eligible group victory rolls **0.01%** once for the group, not once per player. Previous drops, another player's ownership, a past summon or the number of existing essences never reduce or disable that chance. There is **no server-wide copy limit**. On success, choose one eligible member uniformly and persist their reserved award.

Distinguish a new victory from a retried claim. Each accepted boss life/victory has its own server-owned ID; deduplicate reward processing by (victory_id, loot_row_id), not by (realm, boss species). Fifty retries of one victory must resolve one roll and at most one award; two distinct victories may both legitimately award the same essence. One encounter's rare reward cannot be duplicated by concurrent requests, but future rewards must remain possible.

An item follows reserved → inventory → consumed by a legal 100% summon, with durable reward/summon receipts. Allow multiple independent companions per species: already owning a boss does not remove loot eligibility or change RNG; a repeat essence can be stored or explicitly summoned into another individual. Multiple accounts on one realm can own the same boss species.

Backup restore reconciles accepted victory, reward and summon receipts so it neither loses acknowledged loot nor replays an old reward. New eligible victories after recovery continue at 0.01%. Deletion records prevent restored accounts from reappearing; there is no realm-wide issuance slot, permanent scarcity ledger or special essence-retirement record to maintain. Test grants stay isolated from production.

WebSocket transport needs authenticated/authorized connections and messages, origin checks, expiry/revocation, schema/size/rate limits and safe logs; trusting a connected socket alone is insufficient. [OWASP WebSocket Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)

Data model includes account/home realm, profile revision, character ownership/XP, build/tree/formation, map position, habitat/spawn life, battle/group session, loot receipt, Echo item, summon receipt, boss reward receipt, cosmetic grant, order/provider event and audited operator action. Legacy local saves stay separate and confer no online value.

## 12. QA, performance and definition of done

All P0 cards require evidence on a pinned final build/rules version. Automated tests prove mechanics/data/transactions; actual browser/device sessions prove input, rendering and recovery; outside players inform enjoyment and retention. These are different claims.

Mandatory numerical tests include every skill assignment/passive/tree reference, all elements, levels/budgets, trainer-only starts, wild/duel/pack/group defeat rules, per-life loot and atomic summoning. Exhaust all 10,000 integer RNG inputs for the configured thresholds. Real players need not grind 30,000 kills to validate a rare row.

Initial targets: ≤8 MB blocking cold transfer, first playable ≤8 seconds at 10 Mbps/100 ms; desktop 60 FPS/p95 frame ≤20 ms; named midrange Android 30 FPS/p95 ≤40 ms. Test dense habitats, streamed travel and 13-actor groups. Load only nearby map/needed roster assets; never require downloading all 100 species before first play.

Initial staged capacity: 100 active-account equivalents total; include ten concurrent three-player test boss rooms on isolated test realms, 1.7 average/20 peak settlements per second for 15 minutes plus real spawn/save traffic. A single production realm still respects its actual boss schedule. API p95 <1 second; proposed host 20 Hz/50-ms tick with ≥30% measured CPU headroom. Rebaseline costs from measurements.

Replay, security, payment, spawn, network and backup tests must show no duplicated/lost economic commits. Fifty concurrent claims for one victory still produce one settled roll/award at most, while distinct victories can independently drop the same essence. Restore must reconcile purchases and earned reward/summon receipts before reopening. Release requires zero S0/S1 defects and at least 500 observed supported sessions with ≥99% unexpected-error-free rate.

See the 15 protocols, eight locks and six gates in [validation](VALIDATION_PLAN.md). A documentation audit does not establish any of these gameplay results.

## 13. Player validation and release stages

G0 approves a bounded test and its data/spend conditions. G1 accepts the reference hunt/summon/combat slice. G2 evaluates a 20–50-player free pilot over 2–3 weeks. G3 evaluates a full-content free beta with 100–300 new players and mature seven-day cohorts. G4 separately authorizes a limited paid-cosmetic cohort after safety/business gates. G5 requires all 100 species, 24 maps and six bosses accepted, sustainable operation and an explicit commercial go/no-go.

A pilot may contain one large map and a ten-species batch, provided its limited status is clear. It must exercise trainer-alone onboarding, repeatable hunting, 100% summoning, three-client cooperation and rare-reward recovery early enough to expose technical risks.

Observe 10–15 reference players; at least 8 of the first 10 should understand protection, preparation, navigation and drop-versus-summon probability without coaching. Track first-battle completion (diagnostic target ≥85%), D1 ≥25%, D7 ≥10%, mature D30, first-Echo kill/time distribution, no-Echo abandonment, travel boredom and actual group completion. Targets are decision signals, not proof of profit or excuses to manipulate cohorts.

Telemetry must count unsuccessful hunts and failed loads, separate spawn availability from conditional drops, and exclude internal forced-drop accounts from organic data. Show sample size and uncertainty. Product changes to the user's rates or pity policy require an explicit new decision, even if studies show frustration.

## 14. Work packages and schedule rebaseline

| Workstream | Deliverable / sequencing |
| --- | --- |
| M0 | Rule/odds locks, atlas, 100-species manifest, runtime/reward-transaction spike and cost/throughput pilot plan |
| M1 | Corrected attributes, trainer-alone hunt, one large map and polished Echo → Inner Sea → party combat reference |
| M2 | Ten-species production batches, 24-map pipeline, hubs, six chapters, encounter/pack/boss content |
| M3 | Managed accounts, server spawns/loot, groups, cross-party mechanics, repeatable rare rewards, abuse controls and recovery |
| M4 | Full cosmetic presentation, catalog, payment/ownership/refund integration and operator tools |
| M5 | Finish all content; full-scale device/network/security/restore tests; outside cohorts and release review |

Networking and content-production spikes happen before committing to full roster output. Do not postpone live group feasibility until the 100th monster is drawn.

**The v1 estimate is withdrawn:** 460–735 base hours / 575–919 with contingency and its 5–8-month framing described a much smaller solo scope. It is not an estimate for this release. No credible new completion date is asserted before F-066 measures a complete ten-species batch, one final-quality map, a three-client boss and the production backend/restore path.

Forecast remaining 90 species, 23 maps, hubs/story, online systems, art/audio, QA, launch and support using observed throughput, rework and contingency. Distinguish unpaid creation time from cash cost and staged pilot completion from full commercial completion.

## 15. Cash and owner resources

The original $1–2k server/marketing envelope remains an owner's constraint, not evidence that it funds this expanded commercial release. It may support a bounded local prototype or controlled pilot; feasibility for 100-species live operations is unproven. The v1 $35–75/month planning allowance is also withdrawn pending actual asset bandwidth, active rooms, storage, backups, email and support measurements.

F-066 must produce measured cost per active player/hour and per room, initial concurrency/invitation limits, forecast reserve, incident spending thresholds and a dated rebaseline approved by the owner. No paid tool or service is necessary merely to edit these documents. Do not quietly replace cosmetic-only monetization with paid progression to close a budget gap.

Owner inputs before relevant external work: art/product approvals, target devices and testers, seller/account ownership and secrets entered securely, territories/age/support policies, availability for outside studies, launch limits and a funded operating reserve. A local coding prototype cannot substitute for these resources.

If time/cash is insufficient, explicitly delay the full release or run a labeled smaller free pilot. Do not delete the 100-species floor or claim a smaller build fulfills it without a new user decision.

## 16. Commercial, rights and safety gates

Original/cleared art, music, fonts, code and branding need a provenance register. Provider eligibility, payment/refund policy, privacy/data collection/retention, consumer/tax responsibilities and support coverage require owner/adviser approval as applicable.

No public deployment, live charge/refund, email campaign, account registration with third parties, advertising spend or player-data collection is authorized by this scope alone. Test and production realms, seeds, credentials and payment modes remain isolated. Public debug drops, rare spawn controls and boss level sliders are disabled.

Rare economy safeguards include server spawn/time/access checks, controlled guest/account creation, one home realm, rate limits, suspicious-farming review and no trade economy. Do not silently reduce an account's advertised odds as an anti-bot measure. Restriction, support and appeal flows must be explainable.

## 17. Delivery backlog and acceptance ownership

The feature decomposition has **66 cards, 64 P0 + two P1, and 264 individually numbered criteria**. IDs MVP-01–MVP-21 remain traceable but their scope is revised; new world/group/production items are MVP-22–MVP-28. V1 acceptance evidence is invalid wherever behavior changes.

| Item | Priority | Delivery | Acceptance summary |
| --- | --- | --- | --- |
| MVP-01 | P0 | Correct six attributes | Classic stat contributions, Speed/seconds, accuracy/recovery, Leadership and numeric tests agree |
| MVP-02 | P0 | Spatial world entrances | Actual field/forest/cave maps reached by visible gates, with safe return and durable populations |
| MVP-03 | P0 | Reference combat and visual bible | Played fight, Echo/summon and group readability pass an owner-approved original-art rubric |
| MVP-04 | P0 | 100-species presentation | All species/classes animate and all six bosses meet phase/readability requirements |
| MVP-05 | P0 | Six-region adventure | Six chapters, 48 objectives, 60 trainer/faction fights, 12 pack templates and optional group bosses |
| MVP-06 | P0 | Early-to-late progression | Hard launch player cap60 with engine/wild curve100, useful trees/builds; ordinary progression never requires ultra-rare ownership |
| MVP-07 | P0 | Trainer-alone Echo onboarding | Solo-beatable first wildlife; 10% starter drop and 100% summon explained without pity |
| MVP-08 | P0 | Preparation, collection and inventory UX | Zero-to-two companions, formation, trees, Echo items and failure states work |
| MVP-09 | P0 | Inner Sea and appearance equipment | Fixed scene, three sockets, guaranteed summon, export and three earned cosmetic rewards |
| MVP-10 | P0 | Production client/runtime pipeline | Versioned builds, lazy loading, error handling, server compatibility and rollback |
| MVP-11 | P0 | Accounts, home realm and recovery | Managed guest/account auth, cloud state, recovery, export and deletion |
| MVP-12 | P0 | Authoritative gameplay and loot | Server-owned spawn/death/RNG, per-kill receipts and atomic summoning |
| MVP-13 | P0 | Eight-product cosmetic catalog | Actual previews and clear prices; no paid power, luck, Echoes or duplicate sales |
| MVP-14 | P0 | Payments and entitlements | Verified events, idempotency, refunds and cross-device restoration |
| MVP-15 | P0 | Analytics and feedback | Activation/retention, habitat/kill/drop/summon and group funnels with honest denominators |
| MVP-16 | P0 | Production operations | Alerts, backups, rare-reward/purchase reconciliation, audited tools and kill switches |
| MVP-17 | P0 | Device/accessibility/security QA | Full-scale supported-device tests and no critical access/economy defects |
| MVP-18 | P0 | Launch package | Real-game media, landing page, support and owner-approved policies |
| MVP-19 | P0 | Controlled commercial release | External cohorts, full launch content, funded operation and explicit go/no-go |
| MVP-20 | P1 | PT-BR | Reviewed localization if adopted |
| MVP-21 | P1 | Wider browser support | Physical Safari/iOS certification before advertising support |
| MVP-22 | P0 | World atlas and large maps | 24 large maps across six regions plus six hubs and six boss domains; every large map ≥30-second crossing; danger does not lock roads |
| MVP-23 | P0 | Fixed habitats and rare spawns | 94 wild species assigned habitats; stable respawn lives; rarity separate from drops |
| MVP-24 | P0 | Cooperative group bosses | Six bosses, two–three players, cross-party support and authoritative elimination/reconnect |
| MVP-25 | P0 | Repeatable ultra-rare boss essences | One 0.01% group roll on every eligible victory; no global copy limit; deduplicate only the same victory |
| MVP-26 | P0 | 100-species production | Complete species manifest and batch-by-batch acceptance, not recolors or placeholders |
| MVP-27 | P0 | Rare-economy anti-abuse | Spawn/clock/claim automation defenses and home-realm restrictions |
| MVP-28 | P0 | Scale, cash and schedule rebaseline | Measured pilot throughput, network capacity and funded operating forecast |

All criteria start unchecked. Read [traceability](FEATURE_TRACEABILITY.md) for every section/item → feature → validation mapping. [The feature cards](FEATURE_BACKLOG.md) contain dependencies, baseline gaps, accountable roles, concrete scenarios and evidence requirements.

Next implementation batch, once requested: lock the atlas/content schema and odds; correct attributes and zero-companion flow; create one true large starter map with server-safe spawn IDs; implement drop → inventory → guaranteed summon; in parallel workstreams (not extra agents), spike a three-client boss and rare-reward recovery. Only then extrapolate content production and operating costs.

## 18. Principal risks and decision rules

The stronger concept is a geographically grounded collecting world with meaningful preparation and a distinctive Inner Sea identity. Originality alone is not evidence of commercial demand.

Largest risks: 90 additional species and large-map content throughput; rare-on-rare acquisition frustrating players; long empty traversal; bots exploiting valuable scarcity; costly group authority/recovery; and acquisition times that can remain prohibitive despite unlimited potential copies. Previous boss drops do not exhaust the reward pool; ordinary rewards, challenge and cooperation should still make unsuccessful hunts worthwhile.

Keep these requirements rather than silently weakening them. Validate the ordinary experience first, measure tails honestly, prevent replayed rewards without restricting legitimate future drops and rebaseline resources before production/launch commitments. Market only what is actually accepted. No current document claims this expanded release has shipped, been funded or been verified.
## Pass 14 presentation and roster production addendum

Party identity is now individual-based, not one companion per species. Clicking
a slot opens owned portraits; builds and XP stay with the selected individual.
Wild/pack victories immediately return to the region and show settled loot.
Plans for final art are WORLD_DESIGN.md (24 authored maps/six towns) and
CREATURE_DESIGN.md (100 production packages and motion briefs). Live stats and
per-species loot are CREATURE_REFERENCE.md / CREATURE_DROPS.md, with a maintained
CSV/JSON baseline. Proposed ordinary crafting drops are not runtime rewards.
No visual-quality, online-service or commercial-success gate is accepted by this addendum.
