# Inner Sea farm, training and defenses

Owner-authorized expansion, 2026-09-14. Implemented as a local first version;
final art, pacing, penalties and online authority remain release review gates.
The user explicitly requested AFK training, cleanliness, five-monster defense,
moon-scaled daily attacks, repairs, habitat upgrades and strongest-species power.
This promotes those mechanics into active work. Paid cosmetics remain stat-free.

## Player loop

At player Lv25, choose **Establish your Inner Sea**. The farm contains a wooden
house, barn, cellar, bird roost, insect garden and pond. Existing decoration
layouts and PNG export remain available. Choose five owned individuals for
defense; the adventure party still has two companion slots.

Each habitat displays only its highest-level compatible owned individual. Ties
use the first individual in saved collection order. Display is automatic and
does not restrict training: every owned monster, including every duplicate in
the bag, trains while the farm is clean and intact. Family/shape metadata maps
aquatic creatures to the pond, insects to the garden, birds to the roost,
burrowing/construct creatures to the cellar, and other land creatures to the barn.

Power is the sum of the current highest individual level of each owned species.
Duplicates do not add power. The example of ten species at Lv100 gives 1,000
power mathematically; this change retains the current player/owned cap60.
Sea level is a display tier: `1 + floor(power / 100)`.

## Initial local tuning

These are implementation defaults, not owner-approved release balance:

| Mechanic | First version |
| --- | --- |
| Cleanliness | Cleaning is free and lasts 48 hours; dirt stops training |
| Training | Habitat level XP per minute per compatible owned individual |
| Habitats | Independently upgrade from Lv1 to Lv5 |
| Upgrade cost | Twice current habitat level in timber |
| Supplies | Timber costs 25 earned coins; repair kit costs 50 |
| Account bonus | +0.01% maximum HP per power, capped at +5%, applied once to own trainer/companions |
| Defense upgrades | +2% defender HP per habitat upgrade, across all habitats |
| First attack | Second UTC midnight after establishment; at least 24 hours to prepare |
| Later attacks | Once per UTC day; next timestamp is shown in the device's local timezone |
| Attack level | Current saved trainer level, independent of farm power |
| Moon strength | Three attackers/0.75× base stats near new moon; five/1.25× near full moon; interpolation between |
| Loss | Every owned monster loses 10% of one current-level XP interval, bounded at zero XP |
| Damage | First loss damages the whole farm; training and all farm bonuses stop |
| Recovery | One repair kit restores the farm and cleanliness; two kits accompany establishment |

Defenses resolve automatically during play or on return after closing the game.
They use the real deterministic combat engine and the selected individuals'
equipped skills, levels and builds. There is no trainer actor on either side.
All five defenders must fall to lose before the normal 75-second limit; failing
to clear attackers by the limit also loses. Guard redirects damage from another
allied defender. Adventure health and the adventure party are not rewritten.

An intact but dirty farm still defends. A damaged farm pauses further attacks
until repaired, preventing repeated unattended XP losses against broken defenses.
After repair the next attack is the following UTC midnight. Up to seven pending
days settle per transaction; further days remain queued, never skipped or paid
twice. Care/build commands wait for that backlog to finish settling.

Successful defenses grant the attacking wild species' normal coins, ordinary
item drops and configured Echo chance. Boss species never enter this attacker
pool. This is separate from live boss essences and from the opening guarantees.
Watching or scrubbing the last defense is read-only and never settles it again.
A loss can lower monster levels, but earned tree-point budgets and investments
are retained through `treeLevel`; XP loss never erases the trainer’s XP.

## Calendar and authority

`moon-calendar.js` pins NASA/GSFC's 2025–2031 phase instants. Interpolation meets
the real new/full/quarter timestamps; outside this window a mean 29.530588-day
cycle supplies an estimate. Source: [NASA phase catalog](https://eclipse.gsfc.nasa.gov/phase/phases2001.html).
The calendar is bundled; play never requests a network astronomy service.

`inner-sea-farm.js` accepts explicit UTC milliseconds and contains no ambient
clock, DOM, storage or unseeded RNG. `profile.js` supplies the device time and
settles elapsed time before mutations. Saved timestamps, fractional XP, next
attack and last outcome make normal reloads/retries idempotent. Rolling the
clock backward grants no time. Local device time and saves remain untrusted;
online launch requires a server clock, authoritative reward ledger and migration
policy. No local rare ownership can be imported as trusted online wealth.

Farm state is additive under v7 `profile.farm`; `profile.haven` retains legacy
styles, sockets and selected IDs. Old arranged scenes are grandfathered as farm
owners and start their first clock on load, without retroactive attacks. New
profiles establish at Lv25. Existing individual IDs, XP, deferred XP and health
are retained. Failed persisted farm writes keep the previous XP/items/outcome.
Reserved adventure battles continue from their original frozen profile snapshot.

## Later equipment batch

Bosses and dungeons will drop habitat equipment. Equipment must declare compatible
habitats, account stat contributions and defense contributions; replacement,
stacking caps and duplicate ownership need a separate content specification.
Damage disables all equipment-derived account/defense bonuses as well as farm
bonuses. Paid appearances must never occupy this gameplay equipment role.

Equipment drops, equipment inventory/equip UI, dungeon sources, public accounts,
social visiting and cloud defenses are not implemented in this first batch.
This is the explicit next implementation boundary, rather than a fake drop source.

## Validation and next review

Run `python tests/farm_classes_check.py --browser chrome` for farm rules, failed
writes, progression, defense, replay, all four classes and responsive controls.
`tests/experience_check.py` covers decoration drafts, cancel, export and settings.
The full cross-feature gate remains `python scripts/project.py verify --browser chrome`.

Review the farm composition, highest-resident choices, XP pace and five-defender
loop before extending habitat equipment or commissioning final farm/class art.
Review the first loss and repair cost before accepting permanent progression.
No automated result approves those product or release decisions.
