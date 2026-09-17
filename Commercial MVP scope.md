# Huntaria — Full launch scope, implementation audit and system guidelines

Updated **2026-09-17**. Canonical full-launch specification; the existing filename
is retained for stable links. Huntaria is the product name used here; the local
prototype still displays Bond & Bolt in some places. Final branding needs clearance.

**Launch includes the complete PvE/collection service, choose and implement one
PvP mode, an Android app published on Google Play, and an iOS app published on
the Apple App Store.** Browser delivery remains in scope. A responsive website,
local simulation, signed test build or store submission alone does not finish launch.

This revision reconciles the supplied *Huntaria Product Scope and System
Guidelines*, version 1.0, with current source and the owner's request. The request
overrides the attachment's deferred-PvP language. Its proposals, open questions
and brainstorms remain labeled; they are not all approved implementations.
Existing explicit decisions and stable save IDs take precedence over inferred
changes from reference wording. Scope alignment here is not a claim that missing
gameplay, apps or services have been implemented.

Read §2 for **done versus missing and specification conflicts**, §4 for the
single-PvP commitment, §7/§9 for progression and absence requirements, §16 for
mobile/store delivery, and §17 for the complete acceptance register.

> Current prototype override — Patch20 (2026-09-13): all configured Echo chances
> are **15% for testing**, with faster wild levels/XP and persistent injuries.
> The visual World Atlas, direct information signs, physical Supply Store and
> free village recovery, the player cap60/engine curve100 boundary, open roads,
> six boss domains and Sheet-backed creature placement are implemented locally.
> See [current playtest walkthrough](<features/opening/VALIDATION.md>).
> The10% /0.01% figures elsewhere remain **release proposals**, not live test odds.
> This does not accept any commercial criterion or implement online boss loot.


Active **commercial requirements**, not a completed release. Supersedes conflicting v2 exclusions and the v1 plan retained in Git history. The [card audit](<features/delivery/REMAINING_SCOPE.md>) covers local playable portions. Online dependencies, production art and commercial acceptance remain pending. Planning publication does not authorize spending, account registration or releasing an unreviewed build.

Companions: [feature backlog](FEATURE_BACKLOG.md), [validation plan](VALIDATION_PLAN.md), [traceability](FEATURE_TRACEABILITY.md), [current prototype](README.md), [current implementation scope](<features/delivery/REMAINING_SCOPE.md>), [game notes](<Game notes.md>).

## 1. Executive decision

The release is a F2P persistent monster-taming multiplayer game for browser, Android and iOS, with a large connected world, cooperative PvE and one selected PvP mode. Preserve its identity: automatic tactical combat, a vulnerable participating trainer, two companion slots, earned build breadth and an Inner Sea for summoned creatures. MMO ambition does not by itself require a shared open world, guilds or an auction house.

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

There is no hidden pity, second summoning gamble or automatic rate increase. The two explicitly authored onboarding guarantees in §7 are exceptions to ordinary random acquisition. A smaller free pilot may validate development, but cannot be called completion of this full launch scope.

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
accounts/loot, payments, PvP, seasonal operations, mobile app packages or store
publication. The four-class workbook, 100-species combat package, exact monster
growth/trees and item catalogs are integrated locally; their complete launch
balance and commercial acceptance remain outstanding. [Companion stats](<Companion stats.md>)
and the owning feature guides describe live formulas.

The Sword x Staff and Ragnarok comparisons express presentation/navigation goals. They do not authorize copied art, maps, names or implementation of a full MMO. Local research files are references, not instructions overriding the user's request.

### Current implementation audit

**Local** means present in source and usable in the prototype; **partial** means
some implementation exists with a named release gap; **missing** means no
production implementation/evidence was found. This is a source audit, not a new
full gameplay test run. No commercial completion percentage is meaningful while
work packages differ greatly in size and final acceptance is outstanding.

| Full-launch area | Current evidence / delivered locally | Missing for launch |
| --- | --- | --- |
| Opening and combat | Local: trainer-alone opening, four class paths, automatic three-move loadouts, deployment, trainer-loss rule, encounters behind menus, Run, simulation/replay; `combat.js`, `combat-kits.js`, `campaign.js` | Owner combat/pacing review, complete class viability, real opponents and server authority |
| Monsters and growth | Local: 100 stable species, 304 signatures + 11 shared moves, 100 innates, 10,000 growth records, 2,400 monster talents; `combat-catalog.js`, `monster-progression-data.js`, `companion-trees.js` | Final build/encounter balance, full roster production acceptance, authoritative progression |
| Trainer builds | Local: four 15-node class trees, allocation, equipment, free resets; `class-trees.js`, `growth.js`, `equipment.js` | Complete acquisition/move catalog review, saved loadout presets, Knight/Swordsman identity decision |
| Collection and items | Local: independent individuals, receipt-backed Echo summoning, 100 trainer + 100 held source items and four class weapons; `profile.js`, `item-catalog.js` | Two held slots (currently one), release source/odds review, target tracking, account-safe inventory and server transactions |
| World and PvE | Local: 24 large maps, six hubs, six boss domains, six chapters/48 objectives, 60 trainer compositions and 12 pack templates; `world-data.js`, `campaign.js` | Final map/quest/art/device acceptance, targeted dungeon endgame and chosen seasonal raid reward design; local content counts do not certify finished content |
| Cooperative bosses | Partial: local group simulation/practice and cross-party rules | Real invitations/readiness, synchronized clients, reconnect, live bosses and authoritative reward receipts |
| Inner Sea | Partial: Lv25 farm, five habitats/defenders, AFK training, bounded HP bonus, decorations/export; `inner-sea-farm.js`, `inner-sea-farm-view.js` | Absence-friendly redesign, return summary, habitat gear/source decisions, server time/claims |
| Seasons and bounded account growth | Partial: Lv60 owned cap and bounded farm bonus; source curve through Lv100 | Combined power budget, selected seasonal model, rollover/overflow/prestige/catch-up and audits |
| PvP | Missing: local NPC duels are not PvP | Choose and implement one mode, server validation, matchmaking/challenge entry, results/rewards, abuse and device testing |
| Presentation/accessibility | Partial: supplied sprites, motion/effects, procedural audio, settings, responsive controls, local QA | Approved final art/animation/audio, physical-device and assistive-technology validation, legal provenance |
| Online service/security | Missing: browser persistence is local and untrusted | Accounts/recovery, cloud saves, authoritative time/spawns/combat/rewards, concurrency, export/deletion, anti-abuse |
| Commerce | Partial: earned cosmetics and item presentation | Approved paid catalog, StoreKit/Play Billing/web checkout, verified durable entitlements, restore/refund/reconciliation |
| Delivery/operations | Partial: immutable local client package, CI/check tools, Node/browser simulator | Production environments, monitoring/support, backup restore, capacity/cost measurements, incident response |
| Android/iOS and stores | Missing: no Android/iOS app projects, signed release pipeline or store evidence found | Apps, platform integrations, real-device QA, policies/listings, beta/review resolution and publication on both stores |
| Commercial validation | Missing | Consented external cohorts, retention/economy evidence, funded operations and final owner/store release decisions |

Detailed routes: [combat package](features/content/COMBAT_WORKBOOKS.md),
[growth](features/growth/COMPANION_TREES.md), [equipment](features/collection/EQUIPMENT.md),
[farm](features/inner-sea/FARM_SCOPE.md), [runtime](features/combat/RUNTIME.md).

### Attachment compliance and required adaptations

| Guideline / status | Finding | Reconciled launch requirement |
| --- | --- | --- |
| Earned collection, fixed growth, automatic combat, trainer loss | Substantially aligned locally; no service proof | Retain earned breadth, three active slots, fixed species growth and source-aware nonrecursive bonuses |
| Four classes: Mage, Druid, Knight, Hunter | Partial: melee class uses stable `swordsman`; workbook includes Knight traits | Treat Knight as the reference melee path, not a fifth class. Confirm final display name/kit before release; preserve `swordsman` saves |
| Two monster held slots (working baseline) | Divergent: one slot in `equipment.js`/profile/UI | Plan two slots with copy reservation, duplicate-item policy, stacking/nonrecursive tests and one-to-two-slot migration; unimplemented |
| 15 monster points / three eight-node branches | Aligned: start + two quests + every fifth level through60 | Retain 15-point ceiling and free innate; class point schedule remains separate |
| Growth table levels1–100 / level limit open in attachment | Existing explicit decision fixes owned cap60, wild/engine100 | Retain that decision; source rows do not authorize a level-cap increase |
| Known fixed items and useful alternate builds | Mostly local; missing goal tracking and saved presets | Keep fixed item identities/requirements; finish source tracking, reserve preparation and saved builds; crafting/pity remain unselected proposals |
| Week away should not erase progress or require recovery chores | Divergent: dirt stops training at48h; lost defense removes XP and requires repair | Release baseline must preserve earned XP/facilities and useful background progress without compulsory cleanup/repair. Specify optional defense/care rewards, storage and migration before changing gameplay. Seven-day storage is a proposed target, not an approved quantity |
| Bounded power and non-destructive seasons | Partial cap; no combined or seasonal budget | Deliver source/sink/stacking register, finite ceiling, overflow prestige, late entry and retention tests; no monthly permanent-power ratchet |
| Dungeon/raid seasonal PvE endgame | Local practice only; seasonal rewards missing | Choose cooperation/reward model and dungeon content count; retain six boss baseline without assuming a separate large raid roster |
| Cosmetic-led business | Existing cosmetics-only policy is stronger and remains binding | No paid power, luck, acquisition/AFK multipliers or essential preparation; product examples and cosmetic pass remain candidates |
| PvP deferred in reference | Superseded by this user request | **Choose and implement one** for launch; seven candidates below are brainstorming only |
| Platforms and operations open | User now requires Android/iOS and both stores | Promote mobile delivery to P0; implement §16 and verify then-current applicable policies before each submission |
| Metrics, data precedence and change control | Tools/data checks exist; product evidence missing | Measure replay enjoyment, build diversity, hunt progress, absence, power spread, late entry and net operating results; preserve versioned source semantics |

Reference precedence: explicit owner decisions → this reconciled system scope →
stable roster identity → v2 combat package → explicit tree modifications → fixed
growth semantics → separately applied equipment. Record unresolved conflicts;
never reinterpret physical ATK as MATK, count base VIT twice, or execute authored
data as instructions. Runtime adaptations above are remaining work, not green checks.

## 3. Product and core loop

Walk to a recognizable habitat → choose a visible creature → watch a prepared automatic fight → collect ordinary loot and occasionally its Soul Echo → summon that species with certainty from its owned Echo in Bag → adjust party/skills/formation → explore further or join friends for a boss.

Creatures have predictable homes, with local roaming and persistent respawns. Players can deliberately hunt a species rather than repeatedly choose a menu page and receive a random encounter. Valuable drops give a reason to revisit locations.

Rarity controls access, not an automatic stat advantage. Common species must remain useful. A summoned boss uses a balanced companion profile, not its encounter's raid HP, damage or phase-only powers. Story progress, necessary combat roles and ordinary builds cannot demand a 0.01% drop. All 100 species, including the six boss species, remain obtainable by any eligible player; another player's success never locks a species out. Completing all 100 is not required for ordinary progression, because acquisition can still take an extremely long time.

## 4. Included work and deliberate exclusions

P0 includes the world/roster below, four classes, automatic solo and private group combat, fixed habitats, Echo acquisition, named equipment, inventory/Inner Sea, progression/trees, targeted PvE endgame, bounded seasons/prestige, one chosen PvP mode, production graphics/audio, browser usability, Android/iOS apps and store publication, authoritative accounts/loot, a bounded cosmetic catalog, payment safety, operations and commercial validation.

Private personal exploration instances are the efficient launch default. The map world is geographically connected; it does not require every exploring player to share one simulation. Bosses use shared realm scheduling and real synchronized group sessions. Town crowds, open-world kill stealing and server-wide player movement are excluded.

Excluded unless separately promoted: additional PvP modes, trading/auction house, guilds, public chat, water exploration, walkable housing construction, a paid battle pass, loot-box sales, paid gameplay supplies, premium luck and paid boss entry. PT-BR and additional browser/device families remain optional. Android and iOS apps and physical-device certification are mandatory. Basic invitations/party coordination and safety for any exposed player names are included; a broad social platform is not implied.

### PvP: choose and implement one

Select exactly one launch mode through a bounded comparison/prototype after
core combat and collection are legible. PvE-first is sequencing, not permission
to ship the full launch without PvP. All unselected candidates stay brainstorms:

| Candidate | Core idea / question to test |
| --- | --- |
| Arena duels / short series | Prepared teams; test live versus asynchronous play and between-round adaptation |
| Capture the flag / Relic Run | Escort/intercept a flag or relic; test movement, carrier and respawn rules |
| Shared PvE competition / Leviathan Hunt | Compete around a boss/prize; test ownership, third-party advantage and reward fairness |
| Parallel hunts with invasions | Progress on separate routes and interfere; test defense and disruption costs |
| Battle royale / Drowned Isles | Survive with temporary arena adaptations; test snowballing, routing and elimination |
| Escort / Caravan Siege | Attack/defend checkpoints; test spawn, summon and defender advantages |
| Asynchronous defenses / challenge expeditions | Challenge registered teams; test stale defenses, scouting and reward integrity |

Selection must define entry, player/team count, live/asynchronous topology,
match/life/engagement boundaries, trainer death, controls, allowed owned roster,
reserve/swap limits, stat treatment, win/tie/timeout, disconnects, scheduling,
opponent matching, rewards and anti-collusion. Ranking is required only if chosen
in that mode's specification. Ownership stays earned; neither universal free
inventory nor numerical normalization is assumed. PvP cannot be compulsory for
basic PvE readiness. Acceptance requires repeated enjoyable player decisions,
newcomer participation, authoritative result/award idempotency and cross-platform
latency/resume tests. OR-02/07/08 cover design/economy/network choices before
mode production; OR-06/09/10/11/12 cover devices, external tests and release.

GN-001 account-wide species-level buffs and GN-002 quest evolution remain stashed. GN-009 cooperative bosses are promoted into this commercial plan, not retroactively implemented.

## 5. Combat and attribute contract

Solo parties contain the trainer and **zero, one or two** companions. A fresh profile creates a named level-1 Apprentice alone, chooses a dagger or bow and starts in the forest without a guide chain. Both weapons must defeat the introductory Brimble without a paid/rare consumable. Druid, Mage, Hunter and Swordsman are the launch specializations: four demonstrations, Tidecrown and easy master acceptance battles lead to a confirmed choice at player Lv20. Legacy Druid/Mage profiles remain usable. General menus accept zero-to-two companions; authored party trials may require two.

Each actor equips three distinct active moves in priority order. Trainer kits currently have five choices; monsters have v2 signatures/shared moves plus supported legacy choices. Each species has one free innate passive. Front/middle/back sets initial deployment; movement, range and target changes then happen normally. All party members may share a row. Ordinary attacks choose the nearest living enemy, including trainers. Explicit skills/passives can select another target. Wild fights with no enemy trainer have valid fallback targets. Final reach, cooldown/readiness, collision, summon lifetime and expected fight-duration contracts need representative boss/group tests; the attachment's 4/8/12-second tiers do not override implemented scheduling.

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
| First accepted introductory Brimble victory | One named, receipt-backed guarantee | One ordinary Brimble Echo; never repeats |
| First accepted Bloomslime-or-Stonehorn onboarding choice | One named, receipt-backed guarantee | One ordinary Echo of the selected species; never awards both |
| Designated starter wild species | 10% per eligible killed spawn life | An ordinary species Echo item |
| Designated mid/late species Echo | 0.01% per eligible killed spawn life | Rare species item, not an automatic roster grant |
| Any item tagged very rare | 0.01% per eligible table row | Independent rows explicitly declared |
| Named group-boss essence | 0.01% once per eligible group victory, every time | One eligible recipient chosen uniformly on success; no global copy cap |
| Later eligible victories against the same boss | Still 0.01%, independent of past drops or ownership | Multiple players and repeated victories can produce further essence items |
| Legal owned Echo summoned in Inner Sea | 100% | Consume one Echo, create one independent individual, persist receipt |

A 0.01% probability is **0.0001**, or **1 in 10,000** eligible rolls. The server samples a uniform integer 0–9,999: 10% accepts 1,000 outcomes, 0.01% accepts one, and guaranteed summoning needs no RNG at all. Enforce table versions and explicit per-kill/per-player/per-group scopes.

Starter species should cover early roles; initial candidates are Emberfox, Stonehorn, Bloomslime and Tideotter. All are deliberately solo-beatable. Starting species may remain at their starter rate when revisited; do not silently nerf a row merely because the player leveled. Intermediate-source rates are tunable, but anything designated mid/late Echo or very rare must follow the locked 0.01% policy unless the user approves a revision.

There is **no pity**, guaranteed-after-N reward or rare-food/luck boost in ordinary hunting. Two named onboarding quest receipts guarantee the first companion and one second-companion choice. Their current roster identities follow the opening guide, not obsolete display names in older examples. These explicit quest awards do not change ordinary drop rows. Tutorial hints and normal coin/objective progress continue through unlucky streaks. Test-only inventory grants may exercise summoning UX without claiming a real drop.

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

From Bag, one owned Echo performs a short summoning ritual and creates a new independent individual with certainty. It consumes no papyrus, paid currency or additional chance item. Invalid/cancelled requests preserve the Echo; valid retried request IDs retrieve the original individual receipt. Existing species ownership does not block a new summon using another Echo. Ordinary duplicate Echoes can be stored or used for independent copies with separate XP, skills and tree investment. No trading or account-stat stacking is added.

Prepared earned consumables retain reserve → consume-on-start → receipt semantics, but no food increases Echo chances. Food, respec and coins cannot become paid advantages. Economy tests include lost fights after kills, zero companions and no inventory capacity loss for rare drops.

### Named equipment, power budgets and seasons

Deliver the 100 fixed trainer items and 100 fixed monster-held items, plus the
four implemented class quest weapons. Trainer slots are Weapon, Off-hand, Head,
Body, Feet and Accessory/Relic. Launch planning adopts the attachment's two held
slots per individual; current runtime has one. Finalize duplicate occupancy and
stacking before migration and balance tests. Item strength never scales with the
level of the enemy that dropped it. Tactical role tags are not equip restrictions.
Current item chances are a temporary owner-authorized 1%, not accepted launch odds.

Separate permanent collection breadth, ordinary capped development, explicitly
budgeted account/seasonal power, and prestige. Record every currency/resource's
source, sink, cap, rollover, ownership and claim identity without inventing six
mandatory wallets. Audit combined equipment, Leadership, farm, collection and
seasonal effects against fresh/developed/veteran accounts. Diminishing returns
must support an enforceable total bound; prestigious rewards cannot recycle
into unlimited stats, talent points or next-season power.

Non-destructive seasons and overflow are required launch systems. Approximately
30 days is a working reward interval, not a promise of monthly maps or raids.
Choose one cap model before backend implementation: finite permanent development
plus prestige; separately labeled seasonal PvE enhancements; or recoverable
installments toward a lifetime ceiling. Preserve monsters, named equipment,
ordinary levels and permanent unlocks. Define rollover, overflow conversion,
late-entry/catch-up, stockpiles, player explanation and reconciliation tests.
Temporary raid attunement is one proposal; permanent seasonal sidegrades are
another. Neither is silently selected. Missing a week must not permanently block
required seasonal strength. Test those boundaries on server-owned time.

Targeted dungeons/hunts need named sources, access, repeatability, previews,
difficulty and acquisition tracking. Raids need an approved cooperation scale,
loot/participation/lockout model and rewards useful in seasonal PvE without
invalidating the permanent item catalog. The six existing boss domains are the
starting content budget; dungeon count and any additional raid encounters remain
decisions. Max-level goals include missing species/items, reserve teams, alternate
builds, harder PvE, capped seasonal development, prestige and the selected PvP mode.

## 8. Graphics, animation, fluidity and audio

A coherent original reference fight is the quality gate: Druid, Emberfox and Stonehorn facing Mage opposition, a Soul Echo drop, a summon and representative group support. Approval requires actual play/video on named hardware, not a still image or unsupported Sword x Staff parity claim.

The art bible fixes silhouette, proportions, lighting/palette, ground anchors, scale, depth, icons and typography. All **100 species and four classes** need idle, move, basic attack, cast, hit, defeat and victory states; each of six bosses needs warning/charge, phase and recovery. Shared rigs, effects and tree templates reduce labor, but recolors do not count as distinct monsters and whole-portrait bobbing does not satisfy an attack.

The previous **520** skill-assignment / **104** eighteen-node-tree budget (**1,872** nodes) is superseded. Current sources contain **304 signatures, 11 shared moves, 100 innate passives, 2,400 companion talent nodes and 60 class talent nodes**, plus the separate Apprentice tree and supported legacy moves. Counts describe authored/integrated data, not approved production assets. Every available assignment still needs semantic, visual and timing QA.

Use event-driven effects: projectile arrival, HP update, reaction and sound express the same impact. Low-effects/reduced-motion retain essential information. Cross-party ownership and boss warnings stay legible with 13 actors. Produce species in batches of ten and maps from a measured reusable pipeline; the last batch must meet the first batch's approved floor.

Plan three short music loops with regional arrangement reuse and approximately 20–30 reusable SFX cues; no voice acting. Rights, source files and runtime exports are tracked. Audio begins after browser-permitted interaction, has persistent volume controls and conveys no indispensable audio-only mechanic.

## 9. UX, inventory, onboarding and Inner Sea

Navigation must consistently connect Explore, Bag, Inner Sea party/equipment/trees, collection/source tracking, group entry and the selected PvP mode. The bag separates supplies/materials/Echoes/cosmetics and displays species, source, requirements, quantity, ownership and actionable pending/error states. Ordinary game UI excludes drop odds and implementation/testing details; probability analysis belongs in developer/isolated QA material.

Zero-monster inventory/party screens are intentional. The tutorial teaches movement, solo combat, quest rewards and guaranteed summoning of owned Echoes. First combat targets ≤2 minutes for newcomers; ordinary random Echoes have no forced deadline. Loss reports use observed events to explain one preparation change. Deliver goal/source tracking, saved loadout presets, explicit free-respec behavior and reserve development without granting unearned ownership.

The Inner Sea is a Lv25 home with five habitats, strongest-resident displays,
reserve training, permanent quest unlocks, optional defense activity and bounded
account bonuses. Cosmetics/export remain stat-free. **Release adaptation required:**
baseline AFK production must remain useful after a week away; absence must not
remove earned XP, destroy facilities or require cleanup/repair before useful play.
The current 48-hour dirt stop, destructive defense loss and mandatory repair in
[farm scope](features/inner-sea/FARM_SCOPE.md) are prototype behavior to replace,
not accepted launch requirements. Specify storage/overflow, optional care/defense
bonuses, eligible outputs, return summary and safe conversion of existing damaged
farms before implementation. A full week of storage remains a proposed target.
Habitat equipment needs named sources, capped effects and replacement/duplicate
rules. Do not add social visits or construction by assumption.

Keyboard-only completion, visible focus, correctly labeled modals, meaningful empty/error/pending states, 200% text zoom, non-color-only status indicators and reduced motion are mandatory. Support 320/390/768/1440 CSS-pixel layouts and named physical devices.

## 10. Cosmetics-only commercial model

Eight initial paid products remain a bounded planning catalog: two trainer sets, two monster appearance variants, two summoning-ritual styles and two Inner Sea decoration bundles. Also provide at least three attainable earned cosmetics. Final products/prices require review. Equipment skins, banners, profile treatments and non-expiring cosmetic passes from the attachment are candidates, not additional launch commitments. Not every monster requires a paid skin at launch.

Use transparent direct prices and actual character/scene previews. No premium-stat gear, Echo/essence sales, paid rare-entry priority, drop boosters, extra paid rolls, randomized paid products or manufactured store scarcity. Cosmetic variants must leave simulation, loot probabilities, silhouette readability and targeting equivalent.

Server-verified provider events—not a browser checkout return—grant ownership. Payment and refund flows must be idempotent, recoverable and auditable, including overlapping ownership and cross-device restoration. Seller/provider eligibility, taxes and policy approval are external launch dependencies, not presumed solved by a feature list. This plan authorizes no purchases or live charges.

Mobile digital cosmetics use StoreKit and Google Play Billing as the baseline;
web checkout cannot automatically be reused inside store apps. Validate any
territory-specific exception before using it. Keep cross-platform entitlements
consistent with each store's rules. No paid stats, talent points, raid strength,
drop/AFK multipliers, exclusive counters or essential preparation convenience.
Evaluate net revenue after fees/taxes/refunds against content, infrastructure,
support and acquisition cost. MAU × payer share × spend is a planning identity,
not a forecast or proof of a sustainable business.

## 11. Architecture: personal fields, shared boss realms

Browser and mobile clients handle rendering, inputs, interpolation, menus and solo prediction. Server-owned identity, movement/access checks, spawn lifecycle, RNG, inventory, progression and receipts prevent the local prototype from deciding online wealth. Select native versus shared-engine/wrapper implementation through a physical-device spike; no framework is selected by this scope. The single PvP mode adds only its chosen authoritative session/result model.

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

Also require physical iOS/Android installs, secure login, background/termination
and network-change recovery, safe-area/touch/text/accessibility checks, thermal/
battery/memory/asset budgets, store purchase/restore/refund and app upgrade tests.
Record separate minimum OS versions and named low/mid/high device tiers; current
Android timing targets are planning budgets, not iPhone certification. Include
full roster/world scale, actual multiplayer and the selected PvP actor budget.

See the 15 protocols, eight locks and six gates in [validation](VALIDATION_PLAN.md),
plus all launch-extension acceptance in §17. A documentation audit does not
establish any of these gameplay results.

## 13. Player validation and release stages

G0 approves a bounded test and its data/spend conditions. G1 accepts the reference hunt/summon/combat slice. G2 evaluates a 20–50-player free pilot over 2–3 weeks. G3 evaluates a full-content free beta with 100–300 new players and mature seven-day cohorts. G4 separately authorizes a limited paid-cosmetic cohort after safety/business gates. G5 requires all 100 species, 24 maps and six bosses, the chosen PvP mode, seasonal/absence requirements, both mobile apps and store readiness accepted, sustainable operation and an explicit commercial go/no-go. Full launch is complete only after publication and post-publication smoke checks on both stores; review approval is an external dependency, not guaranteed by a schedule.

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

Full-launch extensions run through these workstreams: reconcile held slots and
absence rules before expanding dependent balance; choose power/season/raid and
PvP specifications before their backend production; prove mobile performance,
secure identity and store billing early; then complete both store pipelines,
beta tracks, reviews, publication and monitored support. The old browser-only
estimate does not cover this work. Rebaseline staffing, build hardware, device
access, store accounts/fees, testing and ongoing policy maintenance under F-066.

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

### Android/iOS apps and publication — mandatory delivery

Deliver installable, signed, production-supported Android and iOS apps connected
to the same authoritative account service. Browser support alone is insufficient.
Choose supported phone/OS tiers, orientation and tablet coverage before layout
lock. Scope includes installation, update/migration, authenticated deep links,
secure credential storage, lifecycle interruptions, connectivity recovery, audio,
touch/safe areas, accessibility and platform-native purchase/restore surfaces.
Offline/error states must explain recovery without granting unverified rewards.

Build/release engineering owns reproducible Android App Bundles, Play App Signing
and protected upload keys; the iOS pipeline needs macOS/Xcode access, bundle IDs,
certificates, provisioning and App Store Connect archives. Keep signing secrets
outside source and distinguish test/production services. Record dependency
licenses, SDK data behavior and release artifact hashes. [Android app signing](https://developer.android.com/studio/publish/app-signing)

The following is the initial applicability checklist, researched **2026-09-17**.
Release ownership must recheck the complete policies and both consoles for the
actual build, audience, countries and submission date; new applicable obligations
are in scope. Each item requires evidence or a justified not-applicable decision.
This checklist does not assert policy certification or guarantee acceptance.

| Area | Required work / acceptance evidence |
| --- | --- |
| Developer and seller setup | Owner-controlled Apple Developer/App Store Connect and Google Play Console accounts; identity/organization verification, roles/MFA, current agreements, paid-app/payment setup, banking/tax details, fees and renewals. Record territory/trader obligations; EU distribution includes applicable trader verification. [Apple requirements](https://developer.apple.com/news/upcoming-requirements/), [Play review preparation](https://support.google.com/googleplay/android-developer/answer/9859455) |
| Apple build baseline | Current upload rule: Xcode26+ and iOS26 SDK or later since 2026-04-28. This is a build SDK requirement, not automatically the minimum supported iPhone OS. Revalidate SDK/toolchain and updated age-rating questionnaire before upload. [Apple requirements](https://developer.apple.com/news/upcoming-requirements/) |
| Android build baseline | Current new-app/update target: Android16/API36+ from 2026-08-31. Select minSdk separately. Validate current architecture/page-size/SDK requirements, including 64-bit native dependencies and applicable 16KB compatibility; test the packaged engine and all libraries. [Target API](https://developer.android.com/google/play/requirements/target-sdk), [page sizes](https://developer.android.com/guide/practices/page-sizes) |
| Billing and entitlements | StoreKit/Play Billing integration; approved products/localized prices; verified server transactions, pending/cancelled/offline flows, acknowledgement/finish, purchase restoration, refund/revocation and reconciliation. No client-only grants. Play Billing7's ordinary submission deadline was 2026-08-31; use a supported version (8+ at this audit) and recheck before release. Regional alternative-billing eligibility is not assumed. [Apple review](https://developer.apple.com/app-store/review/guidelines/), [Play payments](https://support.google.com/googleplay/android-developer/answer/10281818), [Billing versions](https://developer.android.com/google/play/billing/deprecation-faq) |
| Privacy and SDKs | Public in-app/store privacy policy; truthful Apple privacy labels and Google Data safety matching actual first/third-party collection, sharing, security and retention. Audit SDK manifests/signatures and required-reason APIs where applicable; request tracking consent only if tracking is used, and keep denied permissions functional. [Apple privacy](https://developer.apple.com/app-store/app-privacy-details/), [Apple SDK requirements](https://developer.apple.com/support/third-party-SDK-requirements/), [Play user data](https://support.google.com/googleplay/android-developer/answer/10144311) |
| Account lifecycle | Recoverable sign-in, secure linking, export and deletion; Apple in-app deletion for account-creating apps; Google in-app and externally accessible web deletion routes where required. Delete associated data, explain lawful retention and prevent backup restoration from recreating deleted accounts. [Apple deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [Play deletion](https://support.google.com/googleplay/android-developer/answer/13327111) |
| Product and audience | Original licensed content; accurate ratings/target audience and permissions. Review child-directed obligations if that audience is selected. Validate login-service requirements, app functionality, user-name/UGC reporting/blocking/moderation as applicable, and avoid a thin website-only submission. [Apple review](https://developer.apple.com/app-store/review/guidelines/), [Play review preparation](https://support.google.com/googleplay/android-developer/answer/9859455) |
| Listings and review access | Final app name/IDs, icon/screenshots, description, support/privacy URLs, availability, prices, age declarations and export/encryption answers. Give reviewers working accounts/instructions and reachable backend; submit commerce products and app together as required. Claims must match the submitted build. [Apple review](https://developer.apple.com/app-store/review/guidelines/), [Play review preparation](https://support.google.com/googleplay/android-developer/answer/9859455) |
| Beta and production access | TestFlight/internal/external review as applicable and Play internal/closed tracks. For personal Play accounts created after 2023-11-13, current production-access prerequisite is at least12 opted-in testers continuously for14 days, then an application for production access; completing time alone is not approval. [Play testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465) |
| Submission to live release | Run physical-device and store sandbox journeys; submit both release candidates; respond to rejections and retest fixes; obtain review approvals; execute owner-approved regional rollout. Preserve review IDs, exact versions and public listing URLs. Verify real listing/install/update/login/PvE/PvP/purchase-restore/support paths. Plan staged rollout, pause controls and forward fixes because installed binaries cannot simply be rolled back like a server. |
| Ongoing compliance and support | Assign policy/dependency renewal owners, monitor crashes/ANRs, authentication, room health, payment backlog, deletion requests and player reports. Maintain compatibility, incident coverage, store responses, renewals and update submissions after launch. Budget this as recurring operations. |

Conditional features such as ads, tracking, subscriptions, public chat, child
targeting and push notifications are not added merely because a policy covers
them. If selected, their full policy/consent/moderation obligations must be met
before inclusion. Territory/privacy/consumer compliance needs actual audience
and seller decisions; store checklists do not replace that review.

## 17. Delivery backlog and acceptance ownership

The retained feature decomposition has **66 cards, 65 P0 + one P1, and 264 individually numbered criteria**. F-057/mobile is now P0; PT-BR is the remaining P1. IDs MVP-01–MVP-28 remain traceable. **These cards plus the ten mandatory launch packages below form the full scope**; completing the old browser backlog alone is insufficient. Earlier evidence is invalid wherever behavior changes.

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
| MVP-21 | P0 | Android/iOS apps and store delivery | Physical app certification, signed builds, store requirements and publication on Google Play and Apple App Store |
| MVP-22 | P0 | World atlas and large maps | 24 large maps across six regions plus six hubs and six boss domains; every large map ≥30-second crossing; danger does not lock roads |
| MVP-23 | P0 | Fixed habitats and rare spawns | 94 wild species assigned habitats; stable respawn lives; rarity separate from drops |
| MVP-24 | P0 | Cooperative group bosses | Six bosses, two–three players, cross-party support and authoritative elimination/reconnect |
| MVP-25 | P0 | Repeatable ultra-rare boss essences | One 0.01% group roll on every eligible victory; no global copy limit; deduplicate only the same victory |
| MVP-26 | P0 | 100-species production | Complete species manifest and batch-by-batch acceptance, not recolors or placeholders |
| MVP-27 | P0 | Rare-economy anti-abuse | Spawn/clock/claim automation defenses and home-realm restrictions |
| MVP-28 | P0 | Scale, cash and schedule rebaseline | Measured pilot throughput, network capacity and funded operating forecast |

All criteria start unchecked. Read [traceability](FEATURE_TRACEABILITY.md) for every section/item → feature → validation mapping. [The feature cards](FEATURE_BACKLOG.md) contain dependencies, baseline gaps, accountable roles, concrete scenarios and evidence requirements.

### Mandatory launch packages supplementing the retained cards

All are **P0, unaccepted**. Partial work is identified in §2. Engineering prepares
specifications/evidence; the product owner accepts named product/release scope;
platform reviewers decide store acceptance. Dependencies denote delivery order,
not an excuse to omit a package. Exact dates/budgets await the measured rebaseline.

| ID / owner | Deliverable and existing-card connection | Dependencies / acceptance evidence |
| --- | --- | --- |
| L-01 / growth + collection | Reconciled builds: two held slots, known fixed-item sources, target tracking, saved presets, reserve preparation and class identity; F-005/006/010/012/013 | Source/duplicate/stacking decisions and OR-02/07. Verify one-to-two-slot save migration, owned-copy accounting, respec/prerequisites, 15-point cap, fixed growth, nonrecursive effects and useful class/build variations |
| L-02 / Inner Sea | Absence-friendly home, outputs/storage/return summary and approved habitat-equipment scope; F-031/032 | L-01, OR-02/07. Seven-day return preserves earned progress, requires no repair chores, keeps background progress useful and cannot duplicate claims; migrate legacy dirty/damaged farms without losing ownership |
| L-03 / growth + campaign | Bounded account-power ledger, one selected seasonal model, overflow/prestige/catch-up; F-009/011/023/040 | L-01/02, OR-07/08. Simulate fresh/veteran and early/late entry; permanent collection survives rollover; retries/stockpiles cannot exceed caps or convert prestige to unlimited power |
| L-04 / campaign + combat | Targeted dungeon and cooperative raid endgame with seasonal rewards; F-019/022/023/061/062/063 | L-03 and authoritative accounts/rooms. Define dungeon quantity and six-boss/raid scope, participation, lockouts, support eligibility and reward budget; real clients finish/reconnect without lost/duplicate loot; ordinary viability never needs a very-rare drop |
| L-05 / combat + delivery | **Choose and implement one PvP mode**; candidates only in §4; F-036/039/040/045/049/050 | Core build evidence, L-03 power treatment, OR-02/07/08 and chosen-mode specification. Prove entry/matching, legal loadouts, win/tie/timeout/disconnect behavior, results/awards, anti-collusion and satisfying newcomer/veteran play; no second queue/mode by assumption |
| L-06 / delivery + experience | Production Android/iOS clients and physical device support; F-030/034/035/057 | OR-06 architecture/device packet and backend contract. Reproducible signed artifacts, lifecycle/network/secure-storage/accessibility/performance tests, supported OS/device list, update/save compatibility and playable full launch content |
| L-07 / delivery + commerce | Mobile billing, common account entitlements, privacy/deletion and regional compliance; F-037/041/042/043/044/045/053 | L-06, authoritative ledger and OR-10. Apple/Google sandbox buy/pending/cancel/restore/refund tests; server idempotency; complete policy/SDK/data declarations and deletion routes; no gameplay advantage from payment |
| L-08 / delivery + owner | Google Play and Apple App Store publication; F-054/055/057 | L-06/07, all required content, OR-09/10/11/12 and G5. Signed release IDs, completed beta/access requirements, reviewer access, resolved rejections, approvals, published listing URLs and successful post-publication installs on both platforms |
| L-09 / delivery + operators | Persistent safe service and post-launch operations; F-037–050/065 | OR-08/10/11. Authoritative time/rewards, crash/abuse/economy telemetry, restore/migration/rollback drills, support/moderation/deletion processes, measured capacity and funded on-call/policy maintenance |
| L-10 / delivery + owner | Product, production and business acceptance; F-024–028/051/052/053/066 | All packages, final art/rights, OR-01–12 as applicable. Versioned data/content audit, meaningful human build/hunt/absence/endgame/PvP evidence, supported-device RC sessions, net-cost model and explicit launch decision; no placeholders counted as accepted roster assets |

### Decisions before dependent implementation

Needs review now: (1) existing visual/first-loop packets OR-01/02, (2) L-01/02
equipment/class/absence reconciliation, (3) OR-06 mobile architecture/device
packet. The first packets are still due; this document does not claim new final
art/device evidence exists. Waiting until expanded production multiplies asset,
balance and migration rework. Dependent production pauses; diagnostics, tests,
scope preparation and reversible experiments may continue.

Coming next: cap/season/raid decisions before L-03/04; choose the PvP mode before
L-05 production; account topology/regions before service commitments; seller,
audience/countries, product prices and data policies before public data/money;
capacity/funding and final launch approval before external expansion/publication.
Safe to defer: unselected PvP candidates, optional languages, cosmetic passes,
guild/trading/social expansion and incidental art outside the approved batch.

Keep the attachment's remaining decisions explicit: targeting/collision/cooldowns;
trainer attribute/move/class-switch rules; item duplicates/binding/trading;
acquisition sources/release odds; combined power ceiling; AFK storage/outputs;
season model; raid scale/rewards; networking/social/audience; cosmetic catalog;
and production budget/cadence. Existing decisions (owned cap60, two companions,
100-species minimum, no launch trading, cosmetics only, both mobile stores and
one PvP mode) are not reopened merely because the attachment lists them as open.

For each future rule change record decision ID, previous/new rule, rationale,
affected source, migration, required validation and exact approving statement.
Technical test results cannot supply missing product or platform approvals.

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
