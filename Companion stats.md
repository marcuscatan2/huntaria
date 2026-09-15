# Companion stats

## Classic attributes and allocation

STR, AGI, VIT, INT and DEX use classic/pre-Renewal stat contributions. Leadership
keeps Huntaria's companion-sharing rule and supplies no LUK, critical-hit or
perfect-dodge bonus. Class bases, skill kits, XP, level scaling, elements and
Leadership remain game-specific. Equipment, SP and spells with cast times are
not introduced by this revision.

Raw attributes start at 1 and cap at 99. All classes share the allocation.
There are 48 initial points; reaching level L grants `3 + floor(L/5)` points.
Raising n to n+1 costs `2 + floor((n-1)/10)`. Imports preserve legal allocations;
malformed allocations normalize within the level budget. Reset is free.

Trainer effective attributes equal raw values. Each companion receives raw
attribute times Leadership times 0.005, once. Integer stat formulas floor that
contribution. Leadership, derived damage, HP, trees and account bonuses do not
transfer. For example, STR30 and Leadership20 give a companion STR3.

## Stat formulas

Let S/A/V/I/D be nonnegative integer effective STR/AGI/VIT/INT/DEX and L be level.

```text
melee stat ATK = S + floor(S/10)^2 + floor(D/5)
ranged stat ATK = D + floor(D/10)^2 + floor(S/5)
minimum stat MATK = I + floor(I/7)^2
maximum stat MATK = I + floor(I/5)^2
HIT = L + D
FLEE = L + A
maximum HP multiplier = 1 + V/100
attack delay multiplier = 1 - (4*A + D)/1000
soft MDEF = I + floor(V/2)
HP recovery every 6 standing seconds = floor(V/5) + max(1, floor(maxHP/200))
healing item multiplier = 1 + 0.02*V
```

These follow the pre-Renewal branches of
[rAthena's stat implementation](https://github.com/rathena/rathena/blob/master/src/map/status.cpp).
This is a primary implementation reference, not an assertion of identical
Ragnarok class, equipment or server behavior.

Physical hit probability is `clamp((80 + attacker HIT - defender FLEE)/100,
0.05, 0.95)`. Magic bypasses this roll. Physical soft defense is
`floor(0.3*V) + floor(0.5*V) + randomInteger(0, max(0, floor(V*V/150) - floor(0.3*V) - 1))`.
See the pre-Renewal player branch of
[rAthena's battle implementation](https://github.com/rathena/rathena/blob/master/src/map/battle.cpp).
We apply that stat rule to companion contributions too; monsters' authored
base stats are separate from the player's allocation.

DEX cast time is `baseSeconds * max(0, 1-D/150)`, exposed by
`BondProgress.castTime`. It never changes a skill's cooldown. No existing
instant skill acquires a cast time. The future spell cast clock must be separate
from cooldown and action readiness, following the
[pre-Renewal cast calculation](https://github.com/rathena/rathena/blob/master/src/map/skill.cpp).

## Integration with the current combat engine

`progression.js` owns pure stat derivation; `rules.js` owns physical accuracy;
`game.js` applies seeded rolls, damage and recovery. `journey.js` and `menu.js`
present the same derived values. Actor levels and authored bases remain:

```text
level HP factor = 1 + 0.04*(L-1)
innate attack = base power * (1 + 0.025*(L-1))
category attack = innate attack + corresponding stat ATK/MATK
category factor = category attack / base power
maximum HP = round(base HP * level HP factor * HP multiplier * farm HP factor)
basic power = round(category attack)
skill strike = skill amount * category factor * encounter skillScale
healing scale = (1 + 0.025*(L-1)) * (1 + 0.01*I) * tree healing factor
```

Magic power displays the average of its range. Each magic strike samples the
integer MATK contribution with the encounter RNG. Each damaging skill declares
its category; range, art and role do not select an attribute. STR therefore also
adds a small ranged bonus, while DEX adds a small melee bonus.

The `campaign.js` trainingTuning table keeps early demonstrations and optional
lessons viable for starter parties under these stat and targeting rules.
Tree attack and eligible innates multiply strikes. Hit order is category/skill
scaling, offensive bonuses, element and Overcharge, round, Guard split, tree
armor, soft DEF/MDEF, Granite, shields, remaining HP. Positive direct damage
has a minimum of one after soft defense. Guard applies element and Overcharge
once; its redirected damage is already adjusted. A stronger existing shield
cannot be replaced or prolonged by a weaker one. Shields do not scale with INT.

Attack intervals use the stat delay multiplier and tree Speed, with a 0.2-second
minimum. Slow (0.6) and Haste (1.3) affect readiness and movement. Skill cooldowns
advance in fixed battle seconds; only explicit tree/skill bonuses reduce them,
with the existing 50% cap. AGI and DEX do not change world walking speed.

A miss consumes the action and cooldown, suppressing attached on-hit effects.
Charged Feathers counts basic attempts; its third-attempt bonus requires a hit.
Cinder Heart remains cast-triggered. Healing caps at missing HP, cannot revive,
and stops in Overcharge. Six-second HP recovery requires standing, resets on
movement/full health, and cannot trigger healing passives or metrics.
Leaf Draught recovery includes VIT; Revival Salve keeps its authored revival HP.

The 20-Hz seeded simulation resolves timed units by stable ID. Burn remains
12 base damage each second through its expiry tick, with no direct-strike dodge
or stat ATK. At 55 seconds Overcharge stops healing/recovery and doubles damage;
at 75 seconds uncleared wild/pack/boss encounters lose, and trainer duels compare
trainer HP percentages. Playback speed does not change these rules.

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

Each of 104 character types defines an 18-node template; each individual owns its
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
not 104 wholly different ability systems. Preview paths and per-species coverage
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

Rows set starting positions. Every slot independently chooses Front, Middle or
Back; all three can share a row. Shared rows spread members vertically so their
starting positions do not overlap. Empty companion slots remain absent. Normal
attacks choose the closest living enemy, including trainers. Explicit skills
may choose another target.

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
the town tent approach. Leaf Draught adds `round(4500 * (1 + 0.02 * effective VIT))` BP to a living non-full target,
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

## Inner Sea progression extension

Intact farm power adds maximum HP once to the account trainer and companions,
never to opponents. Power counts only the highest current individual level per
species. Defense-only HP comes from habitat upgrades. XP loss preserves already
earned monster-tree budgets through optional `treeLevel`. Exact initial farm
values and clock/repair contracts live in [FARM_SCOPE.md](features/inner-sea/FARM_SCOPE.md).
