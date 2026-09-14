# Bond & Bolt — Small Commercial MVP Scope

Version 1.0 · 10 September 2026  
Status: proposed production baseline, not an implementation-complete report.  
Owner: project founder. Delivery assumption: one implementation agent, owner-led decisions and testing.

Implementation breakdown: [Feature backlog](FEATURE_BACKLOG.md),
[Validation and acceptance plan](VALIDATION_PLAN.md), and
[Scope traceability](FEATURE_TRACEABILITY.md). These expand the 21 delivery items
below into 57 feature/capability cards and 228 numbered acceptance criteria;
they do not mark any new gameplay or commercial feature as delivered.

## 1. Executive decision

Build a **small, polished, single-player browser monster-tamer**, free to play, with direct-purchase cosmetics only. Ship a complete first adventure, not an MMO platform.

The launch promise:

> Explore the Mosslight Trail, form contracts with ten distinctive companions, and build a three-member party whose trainer fights alongside its monsters. Protect the trainer, tune your strategy, and make your Inner Haven your own.

The strongest identity is the combination of **trainer-as-defeat-objective, two-companion preparation, Leadership and post-victory contracts**. None of those ingredients is entirely unprecedented; their execution together can feel distinctive. “Like Pokémon, with prettier battles” is not a sufficient positioning statement.

The existing prototype has enough *categories of gameplay systems*. It does not yet have sufficient production consistency, progression direction, commercial infrastructure or outside-player evidence. Adding many more categories would increase risk.

### Recommended release boundary

- One continuous region containing the existing five named areas.
- Druid and Mage; ten monsters; five active choices per character, three equipped in priority order; one innate passive per monster.
- Front/middle/back formation, movement/range, six corrected trainer attributes, four elements, eighteen-node passive trees.
- A short guided adventure, ten authored trainer encounters, two pack configurations and one polished two-phase guardian boss.
- Ten regional cave/forest expedition pools accessed through physical world entrances.
- Earned post-victory contracts, inventory, collection and a very small customizable Haven scene.
- Approximately 2–4 hours to the first story ending; a target of 6–10 hours of worthwhile collection/build/challenge play. These are design targets to measure, not existing playtime claims.
- Reliable accounts/cloud progression and a small, permanent cosmetic catalog.
- Desktop web first; specifically tested Android-browser support. No native mobile or Steam release in this scope.
- No PvP, co-op, shared towns, trading, AFK economy, evolution, additional class or additional catchable species at launch.

**Planning envelope:** roughly 5–8 months at about 30 productive project hours per week, including iteration and a controlled launch; roughly 9–15 months at 15 hours per week. These are uncertain project estimates, not a promise of unattended agent execution.

The original USD 1,000–2,000 can fund a carefully controlled validation/launch attempt if creation labor remains unpaid. It cannot buy the labor, guarantee an audience, or eliminate payment, legal and operating obligations.

## 2. What exists, what does not, and what was actually reviewed

Evidence: current source, README, PROGRESS.md, Companion stats.md, Game notes.md, and saved pass-12 Chrome/Edge reports. This planning pass did not rerun the game, certify production security, or conduct a new player study.

| Area | Current evidence | Commercial gap |
| --- | --- | --- |
| Combat | Fixed-step automatic combat, skill priorities, movement, monster-first targeting, trainer defeat, packs and boss | Readability, balanced progression and broader real-device QA |
| Roster | Two trainers, ten species, 60 skill definitions, ten innate passives | Roster-wide visual consistency and demonstrated useful builds |
| Formation | All six assignments, saved; changes actual deployment | Tutorial must explain that ranks are starting positions, not permanent lanes |
| World | Five paintings blended into one camera-following trail; five trainer NPCs, one pack, Elderroot | Local hubs, spatial entrances, authored objectives and more encounter compositions |
| Expeditions | Ten cave/forest pools, three encounters each, saved route progress | Currently sidebar-driven; no separate walkable dungeon interiors |
| Capture | Opt in during eligible combat; resolve after victory; 65%/90% contracts | Tutorial, feedback, economic tuning and server-owned resolution |
| Progression | Trainer follows highest owned monster; XP, six attributes, Leadership, elements | Correct latest attribute request; revise pacing and level ceiling for a small release |
| Trees | Eighteen ranked nodes per class/species | Mostly shared numerical template; not twelve independently designed trees |
| Inventory/Haven | Illustrated inventory and collection/pact screen | Cosmetic equipment, a small Haven display scene, production empty/error states |
| Animation | Druid, Emberfox and Stonehorn use pose sheets | Nine other core characters and the boss need the same quality floor |
| Accounts/economy | Local browser storage, local reward transactions | No accounts, authoritative rewards, cross-device recovery or cheat resistance |
| Commerce | None | Catalog, checkout, entitlement ledger, refunds and customer support |
| Operations | Local preview and automated regression tooling | Public deployment, monitoring, recovery drills, privacy and release process |

Saved pass-12 reports contain **51/51 checks in Chrome and 51/51 in Edge**. The handoff also records 141 baseline plus 72 progression model checks. Those are useful regression evidence, not evidence of market demand, payment safety or phone performance.

The assets directory currently totals **58,364,703 bytes across 36 files**—about 58.4 MB decimal. That includes source/history assets; it is **not a measured first-load download**. Several individual backgrounds are roughly 3 MB, so a runtime asset budget and staged loading are necessary.

### Pending requests: do not mistake these for completed work

The latest attribute corrections and cave/forest entrance images were inspected, but **not implemented before the request changed to this scope analysis**. They are P0 backlog items below. No gameplay or art files were changed by this scoping pass.

### Relationship to the Sword x Staff research document

The supplied research document describes an MMO-oriented design with a 100,000-DAU target, dedicated fleets and a large technical team. Those are that document's design assumptions, not requirements for this project and not verified facts about Sword x Staff's internal architecture.

The official game listing is useful as a reference for an interactive world, build preparation, character customization and mobile auto-battle presentation. It is not evidence that we need its full feature count, business model or backend. [Official Sword x Staff listing](https://play.google.com/store/apps/details?hl=en&id=com.zjcs.android.us)

## 3. Product, audience and success hypothesis

Primary audience: players who enjoy collecting creatures, experimenting with party builds and watching readable automatic battles in short sessions. Target teen/adult tastes in presentation and messaging, but finalize the lawful age/territory policy before account collection or sales; a label alone does not settle child-directed-service obligations.

This is a **preparation-driven RPG**, not a reflex combat game. The player walks, chooses encounters, orders skills, sets formation, develops builds and opts into contracts. Combat then plays out automatically.

### Core loop

Explore → inspect an encounter → prepare party/formation → watch the plan resolve → earn XP/coins and possibly form a contract → improve the party/Haven → choose the next objective.

Each 5–12-minute session should accomplish at least one clear thing: meet a companion, clear a local objective, improve a build, or attempt a challenge. No daily punishment or energy gate.

Three hypotheses must be validated separately:

1. **Fun:** changing preparation produces understandable, interesting outcomes.
2. **Attachment:** players care about particular companions and their trainer's appearance.
3. **Business:** some players voluntarily buy appearance items, and enough return to support continued operation.

Good combat does not automatically prove the second or third hypothesis.

## 4. Scope priorities and deliberate exclusions

P0 means required for the monetized MVP. P1 means desirable only after P0 passes. Deferred means not part of this release.

| Feature | Priority | Boundary |
| --- | --- | --- |
| Correct attributes and skill damage categories | P0 | Correct current mechanics; no equipment/weapon system |
| Continuous region, cave and forest entrances | P0 | Five areas of one region; no five independent cities |
| Two classes / ten monsters | P0 | Freeze roster until external tests establish a need |
| Existing three-skill priority system | P0 | No programmable AI conditions or manual combat hotbar |
| Formation, elements and movement | P0 | No formation stat bonuses or extra element chart |
| Eighteen-node trees | P0 | Reuse systems; make role branches useful; no 216 bespoke effects |
| Guided first adventure and challenge rematches | P0 | Small authored campaign; reusable encounter data |
| Contracts, inventory, collection | P0 | One owned companion per species; no breeding or release system |
| Small Haven scene and cosmetic equipment | P0 | Fixed display sockets; no construction simulation |
| Accounts, authoritative rewards, purchases | P0 | Small HTTPS backend, not persistent multiplayer servers |
| Consistent animation, audio and accessible UI | P0 | Complete quality floor before expanding spectacle |
| PT-BR localization | P1 | English first; use string IDs from the start |
| Additional boss/species/class | Deferred | Only after measured demand and production throughput |
| Evolution quests | Deferred | GN-002 remains stashed |
| Account-wide species mastery buffs | Deferred | GN-001 remains stashed |
| Cooperative boss fights | Deferred | GN-009 remains stashed; future targeting/reward model needs its own scope |
| PvP, trading, chat, guilds, shared towns | Deferred | Adds networking, moderation and abuse burdens |
| AFK rewards, chores, water exploration | Deferred | Additional economy/content systems |
| Native apps, Steam, console, controller support | Deferred | Separate platform budgets and certification |
| Battle pass, subscriptions, premium currency, paid random rewards | Excluded from this MVP | Direct cosmetics only; no paid power or paid acceleration |

No speculative multiplayer infrastructure “for later.” Stable IDs and a clean simulation boundary are enough future-proofing now.

## 5. Combat and attribute specification

### Preserve the battle identity

- Party: trainer plus two monsters.
- Trainer death immediately ends that side's participation/result, even if monsters survive.
- Ordinary monster targeting chooses the nearest living enemy monster. Only explicitly labeled abilities/passives bypass this protection.
- Front/middle/back affects deployment. Characters subsequently move according to range and targeting.
- Five skill choices per character, three equipped in priority order. A useful ready skill takes priority over a basic attack.
- Skills must state targeting exceptions, damage category, reach, cooldown and major status effects in plain language.
- Pause and 1×/2× remain available in solo combat. Playback speed must not affect results.
- Normal fights target 25–60 seconds at 1×. Preserve a hard resolution limit; tune the current 55-second Overcharge/75-second timeout using observed stalls, not arbitrary longer fights.
- Packs and bosses require clearing their enemies; do not imply a manual dodge mechanic where only preparation can influence the outcome.

### Corrected attribute contract — pending implementation

| Attribute | Required identity | Implementation boundary |
| --- | --- | --- |
| STR | Physical melee damage | Does not increase all damage just because a unit is close to its target |
| DEX | Ranged physical/finesse damage, accuracy, cooldown reduction | Bows/crossbows are future examples, not an equipment feature request |
| INT | Magic damage | A projectile can be magical; range alone does not determine its attribute. Healing scaling must be explicitly described |
| AGI | Attack speed and a tiny dodge benefit | Keep movement separate. Active cooldown reduction belongs to DEX |
| VIT | HP, a very small defense benefit, HP regeneration | No regeneration after death; regeneration obeys the anti-stall/Overcharge rule |
| Leadership | Shares a fraction of eligible attributes with companions | Keep the current 0.5% per point as a provisional tuning value, not a permanent promise |

Every basic attack and damaging skill needs an explicit category: melee physical, ranged physical or magic. Mixed kits can legitimately use different attributes for different skills. This corrects the current shortcut that treats all ranged-unit damage as INT and adds generic DEX damage.

Keep the recognizable Speed-to-seconds display. Specify exactly how attack opportunities and skill cooldowns interact: the existing meter governs ready actions; increasing its rate must never silently shorten a skill's cooldown as well. If AGI is made basic-attack-only, that is an explicit scheduler change with new tests, not merely a renamed tooltip.

For the first correction pass, use a small, bounded physical-evasion model: DEX improves accuracy against AGI dodge; magical damage, damage-over-time and scripted unavoidable boss effects are clearly identified. Use deterministic seeded resolution so replays remain reproducible. Exact coefficients require a short balance pass; do not introduce a large default miss rate that makes attacks feel unresponsive.

Regeneration must accumulate fractional gains predictably, stop at maximum HP, and not accidentally trigger heal-on-heal/shield loops. Leadership shares raw eligible attributes once; no recursive or double sharing.

### Balance acceptance

- Both classes clear the campaign with at least two documented, materially different legal builds.
- Every monster appears in at least one useful campaign/challenge composition.
- The starter team is viable; supports should not win by being stronger tanks than actual tanks.
- Trainer-targeting attacks have explicit tells and available defensive answers.
- For every loss in a tutorial encounter, the result screen can explain one actionable reason using battle data.
- Automated matchup samples find stalls, invalid states and severe dominance; human tests establish whether choices are enjoyable.
- No promise that all builds beat all encounters or that class win rates must equal 50% in asymmetric PvE.

## 6. World, encounters and content budget

### Geography

Retain one continuously traversed Mosslight Trail with five neighborhoods, rather than constructing five fully fledged towns.

| Area | Main lesson / identity | Required content |
| --- | --- | --- |
| Mosslight Clearing | Trainer protection, preparation, first contract | Starter camp, first keeper, easy expedition |
| Willowbrook | Healing, shields and elemental advantage | River landmark, defensive trainer matchup |
| Amber Hollow | Movement and area damage | Fast enemy team and five-weak-monster pack |
| Moonwell Ruins | Status effects and contract discovery | Ruin landmark, sustain/status matchup |
| Windstep Rise | Trainer bypass and complete builds | Advanced challenger and Elderroot finale |

Each area contains a recognizable local gathering point, one cave entrance prop, one forest entrance prop, its grass habitat and existing treasure. Shared prop kits are acceptable; meaningful placement, paths, depth and landmarks are mandatory.

Click/tap an entrance to approach it; walk nearby and press E as an alternative. On arrival, open the correct **area + exploration type** selection panel, displaying encounters, local species and rewards. Opening or closing the panel cannot reroll an active route.

If an expedition is already active, offer to resume it or explicitly abandon it. Do not silently replace it or present a Begin button that does nothing.

### Interiors: an explicit cut

Cave/forest expeditions remain three-encounter journeys. Give them a short illustrated departure, a route-progress display and distinct cave/forest battle staging. They are **not new walkable dungeon maps** in this MVP.

Budget two reusable expedition arena treatments—a real cave interior and a forest clearing—with palette/prop variants for the five areas. A dark overlay on an unrelated landscape is insufficient as the final cave presentation.

### Authored content count

- Ten trainer encounters total: retain the five existing keepers and add five original faction/challenger compositions. Reuse class rigs and outfit accents where appropriate.
- Two authored pack configurations: the existing five-small-monster lesson plus one different composition requiring a different response.
- One boss: Elderroot, two phases, readable warning/impact/recovery and three unlocked difficulty presets.
- Fifteen short objective steps across five chapters, plus onboarding/finale framing. Use a generic objective tracker, not a branching quest engine.
- Ten repeatable region/type pools, using the same ten-species roster.
- Five treasure points and a few noninteractive landmark/foreground props. No gather-everything crafting map.

This is **13 authored combat configurations**, plus generated expedition fights and boss difficulty variants—not thirteen unique monster species or thirteen bespoke arenas.

### Repeatability and boss difficulty

After the first ending, unlock three fixed challenge presets using existing encounters, level bands and party-composition objectives. They should award earned coins/recognition cosmetics without requiring a daily login.

The current arbitrary boss level 1–100 control stays in developer/testing mode. Public progression uses unlocked Normal/Veteran/Mastery presets, with reward rules independent of developer controls. Test fights never issue production rewards.

Do not build an elaborate seasonal challenge framework. A small authored challenge list is sufficient.

## 7. Progression, capture and earned economy

### Release ceiling and pacing

Proposed launch level ceiling: **20**, with the story finale around levels 12–15 and optional mastery challenges above it. This is a deliberate reduction from the prototype's level-100 ceiling; it has not been applied.

A high numeric cap is not additional content. Increasing it later is easier than filling an uninteresting level-100 grind now. Keep XP tables and caps data-driven. If test profiles already exceed the commercial cap, preserve their local sandbox saves; do not silently destroy or downgrade them.

- Trainer level continues to equal the highest owned monster's level.
- No separate trainer XP grind.
- Both active companions receive XP on victory, including a defeated companion in a winning party.
- Catch levels and earned XP food make trying another species reasonably quick.
- Attributes remain escalating-cost allocations; both classes can be switched freely.
- Respec remains free at launch. Discovery and build experimentation are part of the product.
- Keep eighteen nodes per tree, with caps 3/5/10, but adjust rank budgets to the launch ceiling.
- Remove dead-end healing branches from characters that cannot use them, or explicitly provide a relevant alternative. Renamed copies must not masquerade as bespoke behavior.

### Contract rules

Keep the user's chosen identity: select Try to catch during a catchable encounter; after defeating the wild monster, resolve the contract automatically. No low-HP capture puzzle.

For initial tuning retain 65% standard / 90% illuminated chances. Show the chance and consumption rule before opting in. A resolved attempt consumes one contract, including failure; losing, abandoning before resolution and an already-owned species consume none.

Mandatory onboarding exception: the first guided capture is guaranteed and disclosed as a tutorial bond. Thereafter use the advertised chances. Make repeat sightings affordable and retain grass habitats as a targetable collection route.

No paid contracts, paid rarity boosts, paid XP food or paid catch retries.

### Important current rarity distinction

The expedition weights 80/10/5/2.5/2/0.5% describe **local encounter availability**, not power. All ten species currently also have explicit grass-habitat appearances. Thus the 0.5% expedition tier does **not** currently make that species globally almost unobtainable.

Do not remove those accessible routes without redesigning collection pacing. If a species existed only at 0.5% wild availability and a 65% capture chance, success probability would be 0.325% per independent wild encounter—about **308 wild encounters on average**. That would be a poor default for completing a ten-monster launch roster. This calculation is illustrative, not the current global acquisition rate.

Target first additional companion within 10 minutes; three meaningful party choices within 30–45 minutes; all ten attainable through directed play without a paid or extremely rare bottleneck.

### Economy boundary

One earned coin currency. Contracts, biscuits, XP food and battle food remain earned gameplay supplies. Materials/trophies either have an explained collection purpose or are removed from the main progression path; do not make players hoard dozens of items “for later.”

Sources: authored first wins, expedition wins and challenge rewards. Sinks: ordinary contract inscription and clearly priced earned supplies. Keep an accessible repeatable source of coins so running out of paper never blocks progress.

A balance sheet must list each reward, price, XP curve, expected session income and time-to-next-goal. Server-controlled reward transactions must prevent duplicate claims. No auction house, crafting professions, paid convenience slots or premium economic currency.

## 8. Graphics, animation, fluidity and audio

### What “Sword x Staff level” should mean for this release

Use the reference as a **quality direction for a small slice**, not a claim of full production parity. We can aim for similarly clear, appealing motion in a compact roster without matching its breadth, content budget or social features.

Approval is based on playing the same reference encounter in our game on actual target hardware. A prettier static screenshot is not proof that combat is enjoyable.

### Art-production deliverables

- One short art bible: proportions, silhouettes, palettes, lighting, outlines, ground anchors, scale and UI typography.
- A consistent treatment for all twelve core characters plus Elderroot.
- Reuse the five area paintings where they hold up; add purposeful paths, local landmarks and foreground occlusion rather than replacing everything.
- Two entrance props; two expedition arena treatments; one Haven backdrop with fixed decoration sockets.
- Reusable skill-icon system, standardized inventory cards and rarity/element markers that are not color-only.
- An asset manifest recording origin, permission/license, prompt/source where relevant, edits, exported runtime files and attribution.

### Animation floor

Every core character needs readable idle, movement, basic attack, skill cast, hit, defeat and victory states. Spawn/contract presentation can share a small effect library. The boss also needs charge, phase transition and recovery states.

Improve Druid/Emberfox/Stonehorn into the reference fight first, then use the approved pipeline for the other nine characters. Do not generate the entire roster before checking production consistency.

Required qualities:

- Fixed feet/ground anchors and consistent scale; no frame-to-frame resizing, clipped limbs or neighboring-sprite bleed.
- Anticipation, impact and recovery distinguish attacks from generic bobbing.
- Melee contact, projectile arrival, HP change, hit response and sound correspond to the same logical impact.
- No visual projectile still traveling after its damage appears, unless deliberately documented as a nonphysical spell effect.
- Units accelerate/turn naturally enough to avoid obvious sliding and twitchy target changes.
- Layering preserves silhouettes, trainer identity and health bars.
- Heavy tanks feel heavy; flying creatures and support casts have distinct motion.
- Pause, 2× playback, tab suspension and reduced-motion settings remain coherent.
- Combat outcomes remain independent of rendering frame rate.

A small palette of roughly eight reusable VFX families can cover the sixty skills: physical impact, physical projectile, elemental bolt, area burst, heal, ward, movement/status and contract. Shape/timing/audio carry identity; each skill does not need a unique cinematic.

### World fluidity

Keep the continuous camera. Add clearly navigable paths, soft camera easing, landmark continuity and short enter/exit transitions. Path collision/navigation need only handle the few solid landmarks actually placed; do not build a general-purpose open-world navigation platform.

Companions should follow without overlapping the trainer, and preserve world position after menus/battles. World entrances should read as places, not floating menu buttons.

### Audio scope

Three short reusable music loops: exploration, normal combat, boss/Haven variation as appropriate; approximately 20–30 reusable sound cues. No voice acting.

Required sounds: movement/selection, light/heavy impacts, spells, heal/shield, warning, contract resolve, victory/defeat and UI confirmation. Add master/music/effects controls; no autoplay dependency before user interaction. Use original or explicitly licensed assets and retain attribution.

### Performance targets to verify

These are acceptance budgets, not claims about current performance:

- Initial playable download target ≤8 MB; lazy-load unused areas, roster sheets and shop previews.
- First playable interaction within 8 seconds on a stated 10-Mbps/100-ms test connection.
- First-battle assets loaded before the encounter begins; no blank characters or mid-hit decode stalls.
- Representative desktop: target 60 FPS, p95 frame time ≤20 ms during worst-case eight-unit combat.
- Chosen midrange physical Android test phone: target 30 FPS, p95 frame time ≤40 ms, with a low-effects mode.
- No repeated >100-ms stalls during a warmed ten-minute exploration/combat run.
- No tab crash or continually growing retained memory during a thirty-minute repeated route test.
- Explicit supported-device list recorded after tests. iOS Safari is not advertised as supported until physically tested.

Runtime compression/export and cached manifests are mandatory. Keep editable/source art out of the initial public download. Do not claim a particular memory ceiling or concurrent capacity without measurement.

## 9. UI, onboarding and the smallest useful Haven

Retain three primary destinations: Explore, Party & Bag, Battle. Avoid adding ten top-level tabs.

Party & Bag contains party/formation, skill selection, trainer attributes, passive trees, inventory, collection/Haven and appearance. These can use the current sub-navigation.

### Mandatory UX work

- Useful starting loadout and skippable contextual tutorial.
- First battle within roughly two minutes; the first fight teaches protecting the trainer.
- Introduce capture, formation, elements and trees progressively, not in one opening lecture.
- Show expected effect of a stat/rank purchase before committing.
- Clear empty inventory, unowned monster, full collection, insufficient coins, loading, offline, expired login and purchase-pending states.
- Retain selection/scroll position after small edits.
- Inventory filters, stack quantities, item uses and confirmed consumption.
- A post-battle explanation: trainer damage source, healing/shield contributions and suggested preparation change.
- Keyboard navigation, visible focus, sensible touch targets, readable scaling, contrast, reduced motion, optional shake/flashes and separate audio controls.
- Essential information must not depend solely on animation, sound or element color.
- No destructive reset beside ordinary play controls in the public build.

### Haven MVP

One illustrated scene viewed from a fixed camera, showing the trainer and selected companions. Three fixed decoration sockets and one background/style selection. Click a socket to equip a decoration already owned; no dragging, grid building or furniture collision.

The Haven is a small expression/reward surface for contracts and cosmetics, **not** a walkable second game. No chores, AFK accumulation or simulated economy.

Allow a local screenshot/export of the player's party scene. No public image hosting, user uploads, visiting friends or social moderation system.

## 10. Cosmetics-only commercial model

A small, fixed catalog of **eight paid products**:

- Two trainer outfit/palette sets: one per class.
- Two companion appearance variants for popular, already-polished species.
- Two contract visual styles.
- Two Haven decoration bundles.

Also provide at least three attractive earned appearance rewards, not merely the default look. Cosmetic variants must preserve silhouette, combat readability, skill timing and all numerical stats.

Initial price hypotheses, to test—not pricing commitments: approximately USD 3–5 for a small visual item and USD 7–10 for a bundle, with deliberate regional pricing where supported. Avoid low-value microtransactions dominated by fixed payment fees.

### Store behavior

- Direct local-currency prices; no premium currency or confusing conversion.
- Preview owned/unowned appearances on the real character or scene.
- Show what each purchase contains and where it can be equipped.
- Require a recoverable account before payment.
- Restore ownership automatically after sign-in/reinstall.
- No sold duplicates, randomized purchases, fake scarcity, gameplay subscriptions or paid inventory capacity.
- Store is not forced into the tutorial; introduce it only after the player has experienced the game.
- No paid power, faster leveling, improved catch odds, extra skill points, stronger monsters or superior targeting visibility.

### Fulfillment is a launch blocker

Payment confirmation and cosmetic ownership come from server-side verified payment events, not a success URL or browser flag. Handle duplicate/concurrent events exactly once, delayed events, disconnect after payment, refunds and disputes. A receipt and “purchase pending” state must survive browser closure. This follows the payment provider's fulfillment guidance. [Stripe fulfillment documentation](https://docs.stripe.com/checkout/fulfillment)

Maintain an append-only purchase/event record with unique provider IDs and auditable entitlement grants/revocations. Never erase payment history when a player resets gameplay.

### Business reality

Without co-op or shared towns, players have fewer social opportunities to display purchases. The bet is on attachment, self-expression, the Haven and shareable screenshots. That may work, but must be tested. Multiplayer is not justified solely as a speculative way to sell more skins.

Illustrative monthly arithmetic—not a forecast:

| Monthly active players | Monthly payer assumption | Spend per payer | Gross monthly revenue |
| ---: | ---: | ---: | ---: |
| 500 | 2% | USD 10 | USD 100 |
| 2,000 | 2% | USD 10 | USD 400 |
| 5,000 | 3% | USD 12 | USD 1,800 |

These figures exclude payment fees, taxes, refunds, hosting, marketing and labor. An eight-item catalog does not imply repeat spending forever.

For acquisition, a separate illustrative cohort assumption of 2% buying USD 10 within 90 days yields only **USD 0.20 gross revenue per acquired player**. Spending more than that per acquired player cannot pay back in that window under those assumptions, even before other costs. Measure actual cohort revenue before buying traffic at scale.

The first commercial success criterion is modest: voluntary purchases from unrelated players and operation that does not exhaust the cash reserve. Full-time income is a later, much higher bar.

## 11. Production architecture: small, authoritative where it matters

### Recommended starting stack

Keep the browser client and existing JavaScript simulation. Extract explicit modules and data schemas incrementally; do not replace the project with Unity or a different engine simply to feel “production-ready.”

Use:

- Static client/assets on Cloudflare's static hosting/CDN.
- Supabase Auth + Postgres + server functions for accounts, gameplay state and purchase entitlements.
- One production backend region chosen after the first audience's location is known.
- A hosted checkout provider; default integration candidate is Stripe Checkout, conditional on the owner's seller country, product approval, payout eligibility and tax setup.
- A transactional email service connected to managed authentication.
- Lightweight server error reporting and first-party event aggregation. No advertising SDK or analytics warehouse.

Cloudflare documents free static-asset requests, with dynamic execution billed separately. Supabase Pro currently starts at USD 25/month; its free tier is useful for development but includes inactivity pausing and is not the production promise here. These prices are starting points, not unlimited-service guarantees. [Cloudflare static hosting](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Supabase pricing](https://supabase.com/pricing)

Production email delivery needs deliberate setup: Supabase's default SMTP is restricted and intended for non-production use. Configure the sender domain, delivery monitoring, abuse limits and recovery flow before public registration. [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp)

### Client/server responsibility

| Client owns | Server owns |
| --- | --- |
| Rendering, audio, camera, input, menus | Account identity and permissions |
| Local movement presentation | Authoritative ownership, XP, coins, inventory and unlocks |
| Predicted automatic combat playback | Battle ticket, legal loadout/stat snapshot and accepted result |
| Cosmetic preview | Actual cosmetic entitlement |
| Offline practice/sandbox | Production reward RNG and transaction history |
| Temporary cache and pending UI | Purchase/refund fulfillment and durable progression |

No continuous socket connection, zone server, Redis cluster, Kubernetes or real-time battle fleet is required for solo automatic encounters.

### Authoritative battle flow

1. Client asks to begin an eligible encounter using a saved legal party.
2. Server snapshots account revision, rules version, encounter, seed and consumables; issues a unique battle ticket. Reward/capture rolls are not entrusted to the client.
3. Client runs the same deterministic simulator for responsive visual playback.
4. Capture opt-in is recorded against the active ticket before settlement. One flag/item choice is sufficient; no channeling minigame.
5. Server recomputes/validates the encounter using the ticket, rather than accepting a submitted winner, damage total or reward amount.
6. One database transaction settles the ticket, consumes the appropriate items, grants XP/coins/ownership and advances the route.
7. Duplicate completion requests return the already-recorded receipt. Client reconnect retrieves that receipt.

Snapshot input excludes later respecs/food/formation edits. Editing preparation either cancels the unfinished ticket or creates an explicitly new attempt; it cannot upgrade the snapshot while keeping a favorable result.

Pause and 2× are presentation features. Since combat is automatic, a modified client can inspect predicted outcomes; pretending to conceal all strategy is not a sensible anti-cheat objective. Protect awarded state, paid entitlements, time/claim limits and randomness instead. Document the server's minimum completion/attempt policy, including permitted 2× playback, rather than trusting a client timestamp.

Repeated practice can remain local and instant, with no production rewards. Online progress requires a connection; do not promise offline earnings or merge arbitrary offline results into the authoritative account.

### Prove the runtime before committing

Run a short compatibility/performance spike: the same battle snapshot must produce the same result in Chrome, Edge and the chosen server runtime, including targeting tie-breaks and any new seeded dodge.

Supabase currently documents a two-second active CPU limit per server-function request. Measure full worst-case replay cost with headroom; target p95 replay CPU under 200 ms. If it does not fit reliably, use one small dedicated validation service or optimize the simulator before expanding architecture. Do not deploy an assumed-compatible replay backend. [Server-function limits](https://supabase.com/docs/guides/functions/limits)

### Minimum persistent data model

- Account/profile and authentication linkage.
- Monster ownership/XP and class/monster tree ranks.
- Trainer attributes, saved loadout and formation.
- Inventory/coin balances with economy transactions.
- World/chapter unlocks, first-win claims and expedition state.
- Battle tickets and immutable completion receipts.
- Cosmetic catalog, entitlements and equipped appearance.
- Payment events/orders/refunds, using unique external IDs.
- Rules/content version and schema migration history.
- Minimal analytics events and support audit entries.

Use stable IDs, schema validation, foreign-key/unique constraints and transaction boundaries. Never use the display name as identity. State changes use account revisions to stop cross-tab lost updates; server permissions prevent reading or changing another account.

### Accounts and save migration

Guest play should not require giving an email before the first fight. For the production game, guest progression must already be server-issued if it can later merge into a registered account. Link it once using a tested account-recovery flow.

Existing local prototype saves are untrusted sandboxes, not proof of purchased cosmetics or earned online currency. Keep them playable/exportable separately. Decide and communicate the beta-to-launch progression policy before invites; do not silently reset it.

No wipes of paid ownership. No live payment collection before entitlement restoration and migration behavior are tested.

### Deployment, security and operations

- Separate development/test/live environments, keys, databases and checkout modes.
- Build/test pipeline, explicit versioned content manifests, cache busting and rollback.
- HTTPS, input validation, access controls, request limits and secret scanning.
- Never ship a database service key or payment secret to the browser.
- Verify webhook signatures; record and safely replay failed events.
- Signed/server-validated prices and SKUs; client price edits cannot alter purchases.
- Recover after network loss, multi-tab use, expired login and stale client version.
- Small protected operator tool: find account, inspect receipt, reprocess webhook, disable store/encounter and grant a documented correction with an audit reason.
- Backup plus tested restore, error alerts, storage/CPU/billing thresholds and a status/support page.
- Store/route kill switches and an invite/rate limit to contain incidents.
- No dependence on the founder's laptop remaining on for public availability.

Daily database backups alone imply possible loss since the last backup. Set a modest documented progress-recovery objective (up to 24 hours for an initial low-cost deployment) and a tested restore procedure. Paid entitlements must also be reconstructible by reconciling provider payment records with stable account/order IDs. Never advertise zero data loss without infrastructure and tests that support it.

## 12. Quality assurance and definition of done

The existing tests are an asset. Keep them, update intentionally superseded assertions, and add production tests. Passing local mechanics tests is necessary but not sufficient.

### Required automated coverage

- Each of the 60 skills, all ten innate passives, both classes, every formation and element pair.
- Correct STR/DEX/INT categories; AGI/DEX interaction; VIT regen caps/Overcharge; Leadership applies once.
- Ranked trees and all allocation/cap/prerequisite validation.
- Trainer-first defeat handling; no dead-unit actions; finite battles and valid HP at every difficulty.
- Capture opt-in, loss, insufficient paper, duplicate ownership, failed/successful roll and one-time consumption.
- Encounter/route generation, first-win limits, loot distributions and a coin-exhaustion recovery path.
- Client/server replay agreement and rules-version compatibility.
- Concurrent/duplicate reward claims, forged tickets, malformed requests and account isolation.
- Checkout success/failure/cancel/delay, repeated webhook, refunds, revocation and restored purchases.
- Save migrations, tab conflicts, disconnect/reconnect, expired auth and backup restore.
- Asset loading/fallback, keyboard/focus, responsive layout and reduced motion.
- Cosmetic equality: equipping every paid item leaves combat stats, timing, rewards and outcomes unchanged.

### Human/device tests

At minimum: one ordinary Windows laptop, one lower-powered laptop or constrained profile, and two actual Android phones of different performance tiers, borrowed if necessary. Chrome and Edge on the same Windows machine are not independent device-performance evidence.

Manually play the full campaign and all challenge presets from fresh accounts. Test touch input, browser backgrounding, incoming interruptions, poor connectivity, long sessions, audio enablement, text size and external checkout return. Add Safari/iPhone only when a device is available and it passes; otherwise state the support boundary honestly.

### Small-launch load model

Design the first controlled release around **up to 100 simultaneously active sessions**, not 10,000 concurrent MMO players. This is a test target, not a demand prediction or provider capacity guarantee.

At one battle completion per player per minute, 100 active players imply about 1.7 settlements/second on average. Test a synchronized burst of 20 settlements/second plus login and save traffic for at least 15 minutes in an approved staging environment. Verify p95 API latency, replay CPU, database contention, duplicate prevention and cost. Static asset load is separate.

Suggested initial API target: p95 under 1 second for ordinary save/start/settle operations at the tested load. Checkout/provider delays need an explicit pending state rather than a false instant-success promise.

### Technical release gate

- Zero known data-loss, unauthorized-access or incorrect-entitlement defects.
- Zero critical progression blockers in the supported campaign.
- All purchase/refund/recovery scenarios pass in sandbox; a controlled live transaction/refund is performed only with explicit owner approval.
- At least 99% crash/error-free sessions over 500 observed supported-client sessions, with definition and sample size reported.
- Performance budgets met on named hardware.
- Restore, rollback and store-disable drills completed.
- Known minor issues documented; no hidden “restart your save” workaround.

## 13. Validation, launch stages and measurement

### Stage A — enjoyable reference slice

One polished Druid/Emberfox/Stonehorn battle, one Mage opposition, one contract and one region entrance. Test with 10–15 people who did not build the game.

Pass when at least 8 of 10 observed newcomers can identify their trainer, explain why the battle ended, make one useful loadout change and find the exploration entrance without verbal coaching. Use this to fix presentation before multiplying assets.

### Stage B — free closed alpha

20–50 invited players over 2–3 weeks. Full first loop, provisional progression, no real shop payments. Preserve logs of confusion and abandoned flows.

Look for repeated *voluntary* sessions, not a single “looks good” comment. Interview both returners and leavers. Do not recruit only friends willing to be polite.

### Stage C — controlled free beta

Target 100–300 new players in trackable cohorts. Add reliable accounts, the full campaign and cosmetic previews. Mature at least a seven-day cohort before judging retention.

Proposed internal diagnostic targets—not published genre benchmarks:

| Signal | Initial target | Interpretation |
| --- | --- | --- |
| First battle completed | ≥85% of players who reach playable input | Below this, fix loading/tutorial friction |
| First guided contract completed | ≥70% of players who begin onboarding | Tests whether the core identity lands |
| D1 return | ≥25% of activated new players | Return in the 24–48-hour window after activation |
| D7 return | ≥10% of activated new players | Return in the 168–192-hour window |
| D30 return | Observe; aspiration ≥5% | Diagnostic for the replay loop, not a launch-day requirement |
| Understandable losses | ≥8/10 observed test players | Player can name a preparation change |
| Build experimentation | A substantial observed group voluntarily tries a second composition | Requires qualitative review; do not reward empty menu clicks |

Activation means first real battle completion. Track the entire visitor→loaded→battle funnel too, so retention is not inflated by ignoring everyone who could not start.

Always report denominators, cohort dates, acquisition source and excluded internal traffic. A handful of friends or a tiny sample is not reliable market validation. Do not use these thresholds as guarantees of financial viability.

### Stage D — monetized soft launch

After technical and ownership/legal gates, enable the small catalog for an invited cohort. Watch fulfillment, support load, actual conversion, refunds and net revenue.

Seek at least ten voluntary purchases from unrelated players as an initial signal—not proof of sustainable demand. Do not compensate people for purchasing just to satisfy a metric.

Keep paid acquisition experimental. Measure cost per activated player and realized cohort revenue; expand only when the numbers justify it. If people return but do not buy, test cosmetic desirability and presentation without adding paid power.

### Stage E — small public launch

Release publicly only with a complete adventure, honest supported-device statement, working account recovery, trusted store and support coverage. Cap registration or suspend campaigns if costs/quality exceed the tested envelope.

No commitment to weekly new monsters. First month: bug fixes, balance adjustments, one small cosmetic/content experiment only if service health permits.

### Events to instrument

Minimum first-party events: game_loaded, playable_ready, first_battle_started/completed, trainer_defeated, loadout_changed, formation_changed, contract_armed/resolved, companion_bound, expedition_started/completed/abandoned, chapter_completed, boss_completed, haven_equipped, cosmetic_previewed, checkout_started, purchase_confirmed, refund_recorded and session_error.

Use event versions and pseudonymous IDs. Record rule/content version and meaningful outcomes, not raw email addresses or chat text. Payment confirmation is a server event. Keep the dataset small, define retention, and avoid fingerprinting/session-replay recordings by default.

## 14. Work packages, order and estimates

These estimates represent combined implementation, asset integration, verification and owner review effort. They are planning judgments from the inspected prototype, not vendor quotes or measured AI productivity. Re-estimate after the reference fight.

| Work package | Base effort | Dependency | Completion evidence |
| --- | ---: | --- | --- |
| Rules, corrected attributes and combat clarity | 40–65 hours | Scope lock | Updated stat reference, mechanics tests, understandable battle |
| World entrances, chapters and encounter content | 50–80 hours | Stable combat rules | Full route from new account to ending |
| Roster art/animation, effects and audio | 100–160 hours | Approved reference fight | All twelve core characters + boss meet visual floor |
| Menus, onboarding and small Haven | 40–65 hours | Content/schema decisions | Uncoached player walkthrough; responsive/focus checks |
| Accounts, authoritative game state and deployment | 100–150 hours | Replay spike and schema | Cross-device restore, valid server rewards, staging/live separation |
| Cosmetic catalog, checkout and operations UI | 50–80 hours | Accounts and approved merchant setup | Fulfillment/refund/restoration matrix passes |
| Integrated QA, performance, accessibility and tuning | 60–100 hours | Feature-complete build | Device, recovery, load and cohort reports |
| Launch material, support/runbooks and controlled release | 20–35 hours | All release gates | Public landing/support pages, rollback drill, monitored cohort |
| **Base total** | **460–735 hours** | | |
| **25% uncertainty allowance** | **115–184 hours** | | |
| **Planning total** | **575–919 hours** | | |

Legal/business setup time is not guaranteed by this estimate. An account rejection, rights problem or major art-pipeline failure can extend the schedule.

### Suggested milestone sequence

1. **M0 — Lock the reference and measure:** audit, test hardware, latest attribute/entrance corrections, a reproducible reference encounter and server-runtime spike.
2. **M1 — Make one loop attractive:** polish three reference characters, contract, entrance, inventory and first ten minutes. Outside tests begin here.
3. **M2 — Complete the small game:** the rest of the roster, chapters, encounters, cave/forest treatments, launch-level pacing and challenges.
4. **M3 — Make progression trustworthy:** accounts, server-owned state, recovery, guest conversion and deployment.
5. **M4 — Make ownership sellable:** Haven, eight cosmetics, preview, checkout, entitlement/refund flows and support tools.
6. **M5 — Verify and soft launch:** device/load/recovery tests, mature player cohorts, fixes, then tightly controlled paid acquisition.

One implementation agent works serially; do not assume hidden parallel engineering teams. Owner testing/recruitment can happen while implementation continues.

A stronger **free alpha in roughly 6–10 focused weeks** is a useful intermediate target. It is not the same deliverable as the monetized commercial MVP.

At roughly 30 productive hours/week, the planning total is 19–31 workweeks, hence approximately 5–8 months including cohort scheduling. At 15 hours/week, allow approximately 9–15 months. If only a few hours per week are available, stretch the calendar rather than removing account/payment safety.

## 15. Cash budget and resource requirements

### Recurring planning allowance

Plan **USD 35–75/month** for a small initial production footprint, including database/auth, static hosting, transactional email, domain amortization and modest monitoring. This is a planning allowance for low traffic, not a guarantee under load or abuse.

Supabase's current starting Pro price is USD 25/month. Cloudflare's Workers paid plan starts at USD 5/month if dynamic usage requires it; pure static requests have a different/free billing treatment. Avoid paying two providers to duplicate the same dynamic backend without a reason. [Supabase pricing](https://supabase.com/pricing), [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

Authentication email, logs, storage, overages, currency conversion and taxes can change the bill. Configure alerts and application-level limits; do not assume every provider “spend cap” is a universal hard stop.

### Preserve the original cash constraint

| Allocation | USD 1,000 envelope | USD 2,000 envelope |
| --- | ---: | ---: |
| Hosting/domain/email reserve | 300 | 450 |
| Audience validation and staged marketing | 250 | 750 |
| Operating/refund/compliance contingency | 450 | 800 |
| **Total** | **1,000** | **2,000** |

The larger contingency is intentional. A small F2P launch should not spend the last dollar on ads.

No paid asset packs, hired production labor or new paid creation subscriptions are assumed. Existing tools and unpaid owner labor are dependencies; “free creation” does not mean they consume no time, capacity or existing subscription allowance.

Transaction charges are additional variable costs. For example, Stripe's Brazil pricing currently lists 3.99% + R$0.39 for domestic cards, with an additional international-card charge. That example applies only if the actual seller/account is Brazilian; seller country has not been confirmed. [Stripe Brazil pricing](https://stripe.com/br/pricing)

Business registration, necessary legal/tax assistance or other mandatory setup may exceed the contingency. If that happens, remain a free beta or obtain an explicitly larger budget; do not quietly treat compliance as optional.

### What the owner must provide

- Final approval of scope, game name/art direction and target audience.
- Regular hands-on playtesting and timely approval of representative art/audio.
- A primary launch language; this plan uses existing English. Review PT-BR later if chosen.
- Access to named target devices, borrowed where possible.
- Recruitment of outside testers and permission to collect the agreed minimal feedback/events.
- Seller country, business identity, payout account and approved launch territories before commerce.
- Ownership/control of domain, hosting, auth-email and payment accounts; secrets entered through secure configuration, not chat or source files.
- Approval of prices, refunds, privacy/terms and any required professional review.
- A monitored support inbox and capacity for launch-week incidents.
- Explicit approval before public deployment, real transactions or advertising spend.

The agent can implement, test and prepare materials. It cannot supply the owner's legal identity, assume financial responsibility, guarantee market response or substitute for the owner's approvals.

## 16. Commercial, rights and safety gates

This section is a launch checklist, not jurisdiction-specific legal advice. Applicable requirements depend on the seller and countries actually served.

Before collecting account data or money:

- Identify the legal seller, approved territories and applicable consumer/tax obligations.
- Publish clear terms, privacy notice, refund/support process, contact details and retention/deletion policy.
- Define age handling and data minimization. Avoid children's targeting by assumption; assess actual artwork, marketing and audience.
- Use hosted payment collection; do not handle or store card numbers.
- Decide how taxes are calculated, registered, reported and remitted. Standard payment processing must not be confused with a separately contracted merchant-of-record service.
- Review every shipped asset, font, sound, code dependency and game name. Retain a rights/provenance register; no copied franchise names, characters or extracted reference-game assets.
- Make the marketing truthful: no multiplayer, offline earnings, walkable dungeons or production-parity claim for features not delivered.
- Define shutdown/migration communication and preservation of purchase records.

For U.S.-facing services, FTC guidance explains that COPPA applicability can depend on child-directed content and actual knowledge, not simply an age label. For Brazilian operations, ANPD's small-organization regulation still requires essential security measures. These are examples of territory-dependent work, not a determination that either regime alone covers the project. [FTC compliance guidance](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business), [ANPD small-organization regulation](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022)

AI-assisted art still needs provenance and rights review. Commercial-use permission and copyright exclusivity are different questions; human authorship can matter to protection. Do not promise that a generated image is exclusive merely because we generated it. [U.S. Copyright Office report announcement](https://www.copyright.gov/newsnet/2025/1060.html)

If these gates cannot be met inside the current budget, the honest release is **free public beta without purchases**, not a falsely “commercial-ready” shop.

## 17. Delivery backlog with acceptance criteria

All items below are planned unless their existing baseline is explicitly stated. This file does not mark implementation as done.

| ID | Priority | Deliverable | Done when |
| --- | --- | --- | --- |
| MVP-01 | P0 | Correct six attributes | Skill/basic categories, tiny dodge/regen, tooltips, formula docs and focused tests agree |
| MVP-02 | P0 | Ten spatial expedition entrances | Cave + forest in each area; walk/click/E selects correct pool; active routes cannot be silently replaced |
| MVP-03 | P0 | Reference fight and visual bible | Owner approves one representative complete fight; external viewers understand impacts and outcome |
| MVP-04 | P0 | Full roster animation | Twelve core characters and boss meet the approved quality floor on target devices |
| MVP-05 | P0 | Complete first adventure | Five chapters, fifteen objective steps, ten trainers, two pack templates and boss ending play through |
| MVP-06 | P0 | Small-release progression | Level-20 proposal tuned, useful trees, two viable builds per class and affordable directed collection |
| MVP-07 | P0 | Capture onboarding | Guaranteed disclosed first bond; ordinary rules/consumption explained; repeated attempts cannot softlock |
| MVP-08 | P0 | Inventory and preparation UX | Role stats, item use, comparison, focus/empty states and loss explanations are clear |
| MVP-09 | P0 | Haven + appearance equipment | Fixed scene/sockets, owned-only equipment, screenshot export and three earned appearance rewards |
| MVP-10 | P0 | Production client pipeline | Versioned builds, runtime asset budget, lazy loading, error handling and rollback |
| MVP-11 | P0 | Accounts and recovery | Managed auth, guest conversion, cross-device saves, recovery and deletion work |
| MVP-12 | P0 | Authoritative gameplay | Replay agreement, server RNG, atomic claim receipts, concurrency tests and abuse limits pass |
| MVP-13 | P0 | Eight-product cosmetic catalog | Real previews, clear prices, no duplicate sales, all cosmetic invariance tests pass |
| MVP-14 | P0 | Payments and entitlements | Signed events, idempotency, delayed/repeated events, refunds and restoration verified |
| MVP-15 | P0 | Analytics and feedback | Versioned minimal funnel/retention/economy events, exclusions and retention policy documented |
| MVP-16 | P0 | Production operations | Alerts, backup restore, entitlement reconciliation, admin audit and kill switches demonstrated |
| MVP-17 | P0 | Device/accessibility/security QA | Named devices pass; critical issues closed; no cross-account access or lost purchases |
| MVP-18 | P0 | Launch package | Landing page, 30–45-second real-game trailer, 6–8 screenshots, support/terms/privacy and known issues |
| MVP-19 | P0 | Controlled release | Matured external cohorts, limited actual purchases and documented go/no-go review |
| MVP-20 | P1 | PT-BR | All player-facing strings localized and reviewed if adopted |
| MVP-21 | P1 | Wider browser support | Physical Safari/iOS testing and fixes before advertising support |

### Immediate next execution batch

Implement only MVP-01 and MVP-02 first: the pending attribute correction and physical expedition entrances. Verify existing formation, boss difficulty, capture and save behavior still work. Update Companion stats.md to describe actual new formulas, not this proposal.

Then MVP-03: one reference-quality encounter and its first-ten-minute onboarding. Only after that passes should we multiply animation work across the roster or add the five new trainers.

### Scope-change rule

No new class, species, system or platform enters this baseline without naming what is removed or how time/budget changes. Keep numerical tuning data-driven.

Game notes remains the place for deferred ideas. GN-001, GN-002 and GN-009 remain stashed; this scope does not authorize implementing them.

## 18. Principal risks and decision rules

| Risk | Early warning | Response |
| --- | --- | --- |
| Attractive screenshots, dull play | Players watch one fight and do not change builds or return | Improve readable choices and encounter lessons before adding content |
| Inconsistent character art/motion | New sheets fail the three-character reference | Stop roster expansion; fix anchors/style/export pipeline |
| Too much progression complexity | New players ignore attributes/trees or make irreversible-feeling errors | Progressive disclosure, useful presets, free respec |
| Cosmetic-only revenue too weak | Returners preview but rarely purchase | Test desirability/pricing; do not add paid power or assume multiplayer solves it |
| Short content exhausted quickly | Players finish and see no meaningful challenge | Tune existing build challenges; avoid arbitrary level grind |
| Content schedule becomes unmanageable | Updates require new bespoke art for every encounter | Reuse rigs, encounter compositions, arena kits and cosmetic systems |
| Server/economy tampering | Impossible rewards or duplicate claims | Authoritative settlement, revisions, tickets and audit logs |
| Unexpected operating cost | Email abuse, replay CPU or asset traffic spikes | Rate limits, staged invitations, billing alerts and campaign stop |
| Rights or merchant setup unresolved | Missing licenses, seller eligibility or tax policy | Keep sales disabled and remain a free beta |
| Founder overload | Support/review blocks every milestone | Reduce release scope and audience; do not promise an MMO cadence |

### Final evaluation

The concept is **worth a disciplined small-market test**. Its most promising element is not the number of monsters; it is the relationship between trainer survival, party protection, build preparation and forming contracts with companions.

The existing prototype is a useful foundation, but I would not currently bet on commercial success merely because it is playable. We have not yet established retention, cosmetic demand or acquisition economics.

I would bet the proposed *limited validation budget* on improving the first loop and collecting that evidence. I would not bet a large production budget, a multiplayer roadmap or a full-time-income expectation before the cohorts support it.

**Definition of the commercial MVP:** a small complete adventure that strangers can understand, enjoy, return to, safely keep their progress in, and optionally support through appearances—with an owner able to operate it. Everything beyond that must earn its place.
