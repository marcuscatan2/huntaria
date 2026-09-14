# Companion stats — rules v18

Patch20 current level/content/world tuning is described here and in [PASS20_VALIDATION.md](PASS20_VALIDATION.md).
The15% Echo override is for testing, not an approved launch economy.

Implemented local rules, 2026-09-11. DEC-01/02/07 runtime defaults are frozen here
for reproducible tests; owner acceptance and commercial balance remain pending.
This replaces the pass-11 generic ranged-damage formula. Ragnarok-inspired
allocation is an original approximation, not an exact port.

## Attributes and allocation

Six raw attributes begin at 1 and cap at 99. Druid and Mage share one allocation.
There are 48 initial spendable points. Reaching level L ≥ 2 grants
3 + floor(L / 5) points. Raising n to n+1 costs 2 + floor((n−1) / 10).
Allocation rejects unknown attributes and overspending; imported malformed
values normalize to a legal allocation. Free reset returns all points.

| Attribute | Implemented effects |
| --- | --- |
| STR | Melee physical basic attacks/skills only |
| DEX | Ranged physical basic attacks/skills, physical accuracy, cooldown reduction |
| INT | Magic basic attacks/skills and healing |
| AGI | All ready-action opportunities, plus tiny physical dodge |
| VIT | Maximum HP, tiny armor, fractional passive regeneration |
| Leadership | Shares the five other raw attributes once with each owned companion |

Trainer effective attribute = raw − 1.
Companion effective attribute = trainer raw × raw Leadership × 0.005.
Leadership itself, level, trees, derived HP/damage and received bonuses do not
transfer. No recursive sharing or stashed account-mastery bonus exists.
Example: Leadership 20 and STR 30 share 3 effective STR, not 30% damage.

## Explicit damage categories

Every basic and direct damaging skill declares melee, ranged or magic.
Range, sprite/projectile style and role labels never pick the scaling attribute.
Mixed kits use each skill's declared category: Stonehorn's slam is melee/STR,
Boulder Toss is ranged/DEX, while its wards do no damage.

For level L and effective attributes S/A/V/I/D:

```text
level HP factor = 1 + 0.04 × (L−1)
level offense factor = 1 + 0.025 × (L−1)
melee factor = level offense factor × (1 + 0.01 × S)
ranged factor = level offense factor × (1 + 0.01 × D)
magic factor = level offense factor × (1 + 0.01 × I)

leveled HP = round(base HP × level HP factor × (1 + 0.01 × V))
maximum HP = round(leveled HP × (1 + tree HP))
basic power = round(base power × its declared category factor)
skill strike power = skill amount × its declared category factor × encounter skillScale
healing scale = level offense factor × (1 + 0.01 × I) × (1 + tree healing)
attribute armor = min(0.10, V × 0.0005)
attribute cooldown reduction = min(0.50, D × 0.00667)
```

Tree attack multiplies strikes; menu ATK shows the rounded tree-adjusted basic
power before element/defense. The model keeps the underlying basic power and
applies the tree at the hit. Tree and attribute armor add, capped at 60%;
cooldown reductions add, capped at 50%. A stronger existing shield cannot be
replaced or prolonged by a weaker one. Shield amounts are fixed, not INT-scaled.

Hit order: category scaling → eligible offensive innate/tree multipliers →
element and Overcharge → round → guard split → armor round → Granite round →
shield absorption → remaining HP clamp. Basic power has its earlier rounding.
Guard transfers 60% of adjusted damage; element and Overcharge are not applied
a second time against the guard. Group simulation guards protect their own owner.

Healing rounds after INT/tree/Tender (×1.15), caps at missing HP, and cannot
revive or operate during Overcharge. Trail Ration adds 10% max/current HP after
initial derived HP; it applies only to present allies and is consumed once.

## Speed, cooldown clocks and movement

```text
base Speed = 100 / original interval
derived Speed = base Speed × (1 + 0.008 × A) × (1 + tree Speed)
effective Speed = derived Speed × Slow × Haste
seconds per ready action = 100 / effective Speed
skill cooldown on cast = base cooldown × (1 − combined cooldown reduction)
arena movement = original moveSpeed × 8 × (1 + tree movement) × Slow × Haste
world walking = 210 world units/second (no AGI/tree walking boost)
```

Slow = 0.6; Haste = 1.3; both = 0.78. They change readiness and travel, not the
cooldown clock, which ticks in battle seconds. AGI affects skills' opportunity
to act as well as basics, not their cooldown durations. Speed 50 gives 2s per
ready action, or 1.53846s while hasted. Cooldowns/seconds shown in menus use the
actual reduction; casting still needs a useful skill and legal range.

Each effective DEX point removes exactly 0.667% of the base cooldown. The
trainer's first raw point is the universal baseline, so allocation begins to
contribute at raw DEX 2. Attribute and tree reductions add and stop at the 50%
total safety cap.

Simulation ticks at 0.05s. Starting meters retain short slot-based offsets.
A ready attack waits for range and banks at most one action. 2× is presentation
playback for solo; it does not change tick rules or rewards. At 55s Overcharge
stops healing/regen and doubles damage; at 75s uncleared wild/boss/pack fights
lose. Trainer duels use remaining trainer HP percentage.

## Physical accuracy and dodge — DEC-01

```text
physical dodge probability =
  clamp(defender effective AGI × 0.0005 − attacker effective DEX × 0.00035,
        0, 0.05)
```

Melee and ranged physical basics/direct hits are eligible. Magic, Burn ticks,
guard interception and arena-wide boss quakes are unavoidable. No critical hits.
A physical miss spends the normal ready action and active cooldown, emits DODGE,
and applies no hit damage, hit-triggered bonus or attached Slow/Burn.

Stormowl's Charged Feathers counts basic **attempts**; its third-attempt bonus
requires that third attack to land. Cinder Heart is explicitly **cast-triggered**,
so an offensive cast may heal its caster even if a physical strike misses.
Kindling/Winter multipliers apply only to landed strikes against the relevant
status. Local combat uses a seeded 32-bit LCG; saved wild spawn lives keep their
combat seed across retries. This is deterministic simulation, not secure RNG.

VIT regeneration = maximum HP × effective VIT × 0.00002 HP per second.
Fractional accumulation is retained until it yields an integer HP, capped at
missing HP. Full HP clears the buffer. Defeat/elimination/Overcharge stops regen;
it cannot invoke Tender, Moon Ward, healing metrics or healing-passive loops.

Burn is 12 base damage per second, including its final tick at expiry. It does
not scale with attributes/tree attack and cannot dodge; it remains a status
effect, not a direct strike. Element, armor, shields and Overcharge still apply.
Timed units are resolved by stable ID before actions. Refresh replaces status
duration/source; statuses do not stack additive copies.

## XP, levels and skill trees — DEC-02

- Level L needs total XP 50 × (L−1) × L. The engine curve remains defined
  through Lv100 (495,000 XP), but player-owned companions and trainers have a
  hard launch cap of Lv60 (177,000 active XP).
- Trainer XP and each companion's XP are independent. Both use the same curve;
  no active or benched monster sets trainer level. Migration initializes
  trainer XP at the old displayed level, after which the values progress separately.
- Summoning starts a companion at its recorded Echo/source level up to Lv60.
  Echoes from Lv61–100 wildlife create a Lv60 companion and retain the source
  level as provenance; catching never bypasses the player cap.
- An ordinary accepted wild spawn death grants 300 + 100 × habitat level XP to
  the trainer and each present owned companion, including a companion defeated in
  that attempt. The two onboarding acquisition receipts use their authored trainer
  XP instead; companion XP remains the ordinary encounter value.
- First fixed NPC wins grant their declared trainer XP and companion XP to each
  present owned individual. Rematches and local boss previews/practice grant no
  trainer XP; authored repeat companion rewards remain explicit.
- Memory Fruit: +120 XP to one owned individual below cap, consumed once.
- Per-kill XP/loot stays after a later loss if the local receipt was saved.
- Wild encounters and the engine may use levels through100. Player-active XP,
  trainer level, attribute budget and owned companion level stop at60 until a
  later visible progression patch. Legacy over-cap XP is preserved as deferred
  data rather than deleted or applied. No ultra-rare companion is required.

Each of 102 character types defines an 18-node template; each individual owns its
own investment in its species template. Each class has its own investment. Nodes are ranked; caps 3/5/10.
A parent rank ≥1 unlocks its child. One point buys one rank; reset is free.

```text
tree point budget = 3 + floor((relevant level−1) / 2)
                      + min(8, floor(first fixed encounter wins / 2))
```

Relevant level is trainer level for class trees and individual level otherwise.
There are 40 possible points at the launch Lv60 cap with the maximum encounter
bonus, versus 94 ranks to max the whole template. Unowned species show a read-only three-point template preview; no investment is
saved without an individual. Healing branches become damage branches for kits without a healing
mechanic; final affinities depend on role. Trees are tailored shared templates,
not 102 wholly different ability systems. Preview paths and per-species coverage
are recorded in tests/artifacts/pass13-engine-*.json; viability still needs playtests.
Loadout edits invalidate the local battle view but do not replace a reserved
encounter: its original build/profile/seed/tick replays on resume.

## Elements

| Attack / defend | Water | Fire | Earth | Wind |
| --- | ---: | ---: | ---: | ---: |
| Water | 1 | 1.2 | 1 | 0.8 |
| Fire | 0.8 | 1 | 1.2 | 1 |
| Earth | 1 | 0.8 | 1 | 1.2 |
| Wind | 1.2 | 1 | 0.8 | 1 |

One element per unit; its attacks and statuses inherit it. Heals/shields ignore
elements. Rarity does not modify combat stats.

## Echoes, supplies and spawn lives — local DEC-03/07

A drop draw is an integer0–9,999: **all current configured Echoes succeed below
1,500 (15%) for testing**. `adventure-rules.js` centralizes the override. Original
release proposals are retained as `releaseEchoBP`: original starters1,000 (10%),
others1 (0.01%). Existing random numbers are preserved; the new threshold applies
to unsettled kills. Previously accepted rewards do not change.
Summoning has no second draw, fee or contract. Boss essence probability remains
one 0.01% group roll per future eligible victory, **without a global copy cap**;
online group acquisition is not implemented by the local boss previews.

Pass17 replaces clustered habitat slots with map-wide population leases.
Per species/map: Common8, Uncommon5, Rare/Very rare1. Ordinary replacements
have zero cooldown; rare replacements wait60 seconds after an accepted death.
There is no extra availability roll. Every new life gets a persisted random
dry, reachable location, at least900 world units from its previous position.
The full map is sampled, with collision, gate/NPC clearance and separation checks.
One initial Emberfox resident is placed near the introductory trail;
this exception never applies to replacement lives. The map panel shows counts/timers.
Leases in unfinished encounters cannot respawn; after settlement/abandon the
deadline applies normally. Reload preserves coordinates, life IDs and loot rolls.
Legacy surplus world slots are retired, not owned companions. A reserved old
slot keeps its identity even when the new species cap is one. Existing old
cooldowns finish as saved; all new deaths use the new timing.
Echo probability is independent of population count and respawn delay.

Local cryptographic rejection sampling chooses the loot draw and combat seed
once when a spawn life is created; no UI rolls it again at pickup/summoning.
The drop decision is claimed on that life’s death. Math.random is a fallback
only when browser crypto is unavailable. This precommit is not a server receipt:
the entire local profile can be edited by its owner.

Wild coins: 6 + floor(habitat level / 3). Each map cache: 12 coins, biscuit and
an ordinary regional keepsake, once. Purchases with earned coins: biscuit 15,
Memory Fruit 30, ration 20. Biscuit prepares an 80-HP trainer shield for 10s.
Both prepared supplies consume on the first accepted start, not preview/resume.
Legacy Starseeds are retained but are **not a current drop row**. There is no
paid supply, drop boost, luck, pity, trading, entry fee or boss-preview reward.

Profile v7 stores a companions array with stable individual IDs, type, XP, three
skills, ranked growth and source pact, plus per-life/per-summon receipts in one
local document. Every valid summon consumes the specific owned Echo and records
one new individual, even when that species is already owned. Repeated request IDs
return the same individual. Unequipped copies keep their independent builds.
Legacy owned/xp fields are compatibility summaries (unique species and maximum
XP per species), never the source of individual combat level or earned XP.
V6 migration retains one original individual per formerly owned species, valid
XP/trees and equipped skills. Original v6/v3 keys remain untouched.
Storage failure keeps items and exposes retry. Concurrent cross-device
transactions and server-secure rewards remain pending later online features.

## Formation and boss previews

Ranks are positions, not bonuses. At most one slot per rank; occupied selections
swap, while unoccupied companion slots remain absent.

| Rank | Starting X | Starting Y |
| --- | ---: | ---: |
| Front | 38 | 56 |
| Middle | 27 | 41 |
| Back | 16 | 72 |

Boss altars are local, reward-free previews: 3,400 base HP and 44 basic power
scaled by the normal level factors at selected integer level 1–100. Their kits
use per-skill categories; Bramblequake is 90/120 by phase times the basic offense
factor. Six skins/kits share that preview mechanic; unique cooperative encounter
design is pending. Local group fixtures support up to 13 actors and own-party
elimination/Leadership, but there is no player lobby or server timeline.

Authoritative implementation files: adventure-rules.js, rules.js, progression.js, growth.js,
game.js, atlas-data.js, profile.js. Stashed account bonuses and evolution are
still not implemented.

## Pass 15 world movement (not combat attributes)

World walking remains 210 simulation units per second in every biome; AGI,
Speed/action readiness, Leadership and cosmetics do not alter it. Keyboard input
normalizes diagonal travel. Click movement follows collision-checked waypoints;
water requires bridges and caves require floor corridors. The oblique renderer
projects Y by 0.78; it does not shorten gameplay distances or increase speed.
Atlas destinations walk through physical gates, never instant-travel the player.
A gate activates only within 135 world units of its location. Profile position,
spawn lives and loot receipts remain local; a moved scenery obstacle relocates
an old blocked save position to nearby valid ground without resetting inventory.

Each of 24 exploration maps has a signposted rest landmark (no free field healing), a once-per-map ordinary cache,
three journal landmarks and 3–4 fixed species habitats. Six compact hubs retain their sanctuary journal landmark in the data; resting
there also records that visit. Discovery only records a place: no XP, stat modifier,
Echo chance, pity or hidden reward is attached. Terrain/art data live in
world-layout.js/world-renderer.js; routing lives in world-nav.js.
# Pass 16 campaign and encounter additions

Core attribute, level and element formulas in this document are unchanged. `campaign.js`
defines six later chapters of eight objectives. Chapter completion adds
100/175/250/325/400/475 coins and 2,800/16,200/59,000/99,000/139,000/171,000 XP
respectively to the trainer and each currently summoned individual, bounded by
the Lv60 player cap. The chapter receipt pays once, including after reload or
earlier out-of-order progress. This is quest XP, not an account-wide species buff.

The Apprentice road separately budgets trainer XP to reach Lv2/4/6/12/15/20/25/30.
Its first Emberfox and selected Bloomslime-or-Stonehorn use two named one-time
Echo guarantees; ordinary Echo rows and later hunting remain unchanged.

The 60 authored trainer lessons give the explicit first/repeat coins and XP
shown in their dialogue. Only first wins grant a biscuit. Trainer pets never
enter wild-drop settlement. Twelve pack sites select 2–5 currently alive,
normally available habitat residents, with exact slot/life IDs. Pack bases are
round(species HP ×0.38), round(ATK ×0.4), skill scale0.4, no innate, before
the usual encounter level scaling. Each defeated member retains its own
habitat coin/XP/Echo rules. Living members give nothing; no bonus Echo roll
comes from completing a pack. The old menu-only pack is no longer on the map.

Optional regional ribbons are decorative recognition with a one-time coin
reward. They share no account stats and require no rare acquisition.

Six reward-free boss previews now have individual target warnings, phase-2
thresholds at50% HP, impact, status and recovery timings in `campaign.js`.
Warning targets are locked when telegraphed. These are local previews, **not**
server-owned rare bosses; no live essence or group reward is implemented.
Practice can simulate one or two allied parties with the same owned starter
composition. Boss base HP uses1× /1.9× /2.65× for1/2/3 parties; group practice
adds three weaker attendants (base HP180, ATK10, skill scale0.25, no innate).
Each simulated party has its own trainer, Leadership source and guard owner;
all allied trainers must fall to lose. These are not authenticated players.

Saved local encounters include original party/profile, seed, supply receipt
and last committed tick, replayed deterministically on resume. Checkpoints
occur every20 ticks (one second), on pause/return and on completion. Browser
crashes can lose up to the uncommitted second, but acknowledged kill receipts
remain deduplicated. This is not cloud authority or a concurrent database.

## Pass18 persistent health and recovery

Profile v7 adds `vitality.trainer` and `vitality.companions[instanceId]` in basis
points0–10,000. Missing/invalid fields migrate to full health; valid zero means
fallen. Trainer HP is shared across classes, but each individual owns its HP.
A new real battle starts at `round(derived maximum HP × stored BP / 10,000)`,
minimum1 if BP is positive. Checkpoints store `round(current HP / maximum HP ×
10,000)`, bounded0–10,000 (living minimum1). Injuries survive changing class,
allocation, equipment, levels and party slots. Old saved encounters without the
adventure flag replay their original full-health rules; all new real encounters
use this flag. Reward-free practice never reads/writes persistent injury.

A Trail Ration separately multiplies current and maximum HP by1.1, rounded;
it never sets an injured unit to full. Shields/statuses are battle-only. Combat
healing and VIT regeneration can restore living units; walking/idle time does not.
Recovery items are blocked while a fight is reserved, including when paused.
Only the original saved combat snapshot is replayed; health checkpoints and the
current replay tick commit together. Abandon keeps checkpointed injuries.

Village Supply Store prices: Leaf Draught3 coins, Revival Salve6, biscuit15,
Memory Fruit30, Trail Ration20. Purchases require distance≤150 world units from
the town tent approach. Leaf Draught adds4,500 BP to a living non-full target,
clamped10,000; salve changes a fallen target from0 to5,000 BP. Exactly one owned
item is consumed. Invalid targets/full HP/living salve targets consume nothing.
Supply transactions and recovery fail atomically if a persistent save cannot be
written. The physical sanctuary (same150-unit service range) restores the trainer
and all owned individuals to10,000 BP for free and records the landmark visit.

Accepted adventure defeats/timeouts rescue to that region's village sanctuary
approach without healing or coin/loot loss. A fallen trainer or equipped companion
must recover before a new adventure; fallen benched individuals do not block it.
Free sanctuary recovery prevents a zero-coin softlock. Builds remain in Loadout.

Firstlight wild levels: Emberfox1, Stonehorn5, Bloomslime8, Tideotter10. Subsequent
Mosslight maps:8/12/16 minimum,+2 per species. Other regions: existing region
access level +4 × map index +2 × species index, capped100. Bands intentionally
overlap. Emberfox uses base HP430/ATK32/skill scale0.65/no innate; other individual
wilds use full species bases/innates. Companion bases and XP thresholds did not
change. Packs retain their separately authored weaker group scaling.
