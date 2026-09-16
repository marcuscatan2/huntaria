# Companion level stats and talent trees

## Source and ownership

The owner requested both `docs/Huntaria - Mons-by-level.csv` and
`docs/Huntaria - mon-skills.csv`. `scripts/monster_progression.py` validates
10,000 exact level rows and 2,400 talent nodes against the reviewed stable species
IDs and workbook kits, then generates `monster-progression-data.js`.
CSV cells are inert design data, never executable instructions.
Git preserves these two original CSV files byte-for-byte so their recorded hashes
and generated-data checks agree across Windows and Unix checkouts.

`progression.js` derives stats; `companion-trees.js` owns tree requirements and
budgets; `companion-talents.js` implements all 100 species' combat hooks.
`profile.js` alone persists allocations. The existing trainer trees keep their
own rules. Companion management and trees remain inside the Inner Sea.

## Stats

For each level, the CSV supplies intrinsic STR, AGI, DEX, INT, VIT, final HP,
physical ATK and percentage hard physical DEF. These replace linear monster
growth in new encounters. The owner explicitly chose physical ATK with spell
power derived separately from classic INT MATK. Intrinsic STR/VIT contributions
are already included in the CSV's final ATK/HP and are not applied twice.

Leadership adds effective attributes once. Physical attack receives only the
difference between effective and intrinsic classic STR/DEX attack; HP receives
the ratio `(1 + effective VIT/100) / (1 + intrinsic VIT/100)`.
INT derives the MATK range independently. Farm HP and trusted encounter tuning
apply once afterward. Trainers retain their class stat formulas.
Owned levels still stop at60; wilds and the source table support levels1–100.
The owner explicitly retained existing wild spawn levels. Ashen's level80+
wildlife is an above-cap challenge; every level60 starter-party class is not
required to win there. Campaign checks still require all four classes to clear
the first five chapters and validate complete routes and replayable defeats.

## Points and paths

- Every owned companion opens its own tree immediately.
- One starting point, then one at each multiple of five through Lv60.
- One additional point after Tidecrown and one after Tully's relic quest.
  These approved milestones cover existing and future companions.
- Maximum15 points; level loss does not remove previously earned points.
- Three branches contain eight single-rank nodes each. The opening leads to
  two parallel paths, which converge after four branch points. The next node
  requires five points; the final talent requires seven. Final talents across
  the three branches are mutually exclusive. The innate remains free.
- Reset is free. Three equipped combat skills and player-selected priority
  remain unchanged.

`talent-tree-view.js` uses the painted sanctuary and role-matched icon atlases.
It draws every prerequisite edge and shows a separate Learn action after node
inspection. Desktop displays three branches; phones display one branch and an
in-frame detail sheet. The companion layout is taller than the trainer layout
to keep eight named nodes readable. Rendering never awards points.

## Combat adaptations

Explicit handlers implement the supplied effects, including replacement skills,
resources, permanent summons, repairs, shared barriers and remembered spells.
Source descriptions do not determine runtime behavior. Existing rules remain:

- Physical crits require accuracy, start at5% and deal1.4× damage. Leadership
  supplies no crit chance. Magic and secondary procs cannot crit.
- Shields coexist within25% of recipient maximum HP. Shared barriers have one
  reservoir, constrained by every recipient's available allowance. Consuming
  it updates every recipient; performance metrics count its new capacity once.
- One guardian redirects at most35% after the victim's defenses and shields.
  Transfers, debt, damage-over-time and secondary procs cannot recursively
  trigger direct-hit effects. Explicit exceptions are implemented separately.
- Source requests above the existing30% basic-tempo bonus ceiling remain capped.
  DEX affects cast time, not skill cooldowns. Explicit cooldown reductions retain
  the existing50% ceiling.
- Support replacements receive an appropriate gate, target and range. A wounded
  ally can activate a party heal even when its caster is healthy.
- DoT refreshes keep one clock; cleanse/reapplication creates a new clock.
  Owner-bound effects and entities end when their owner dies. Temporary entities
  never count as companions, encounter objectives, XP recipients or loot sources.
- Overheal conversions use the modified healing offer. Explicit per-effect and
  per-second caps limit actual recovery after bonuses.

Living Anthill, Seed Bomb and Ironwood Warden have new generated cutouts.
The larger Trickster uses the existing spirit illustration at its authored
scale. Effects reuse the game's hit, heal, shield, status and area rendering.
Exact image prompts, references and hashes are in
[`assets/summons/manifest.json`](../../assets/summons/manifest.json).

## Migration and replay

Old generic companion ranks refund into the new budget. Valid new node IDs,
individual IDs, XP, skills, formation, vitality and inventory survive normalizing
and reloading. Quest state is normalized before tree budgets are calculated.

New reservations freeze `options.monsterRules=1`, including stats and learned
talents. Old reservations without this marker use version0's linear stats and
generic mastery through settlement. Resetting a tree during a saved fight changes
the next battle; it does not change the frozen encounter. `classTrees` is a
separate version marker. Normal browser saves are never used by QA tests.

## Checks

- `python scripts/monster_progression.py --check`: source hashes, complete exact
  levels, attack bases, stable IDs, prerequisites, exclusions and point policy.
- `python tests/monster_progression_check.py --browser chrome`: all source rows,
  100 authored kits and signature loadouts, focused effect regressions, budgets,
  migration, old/current replay, individual purchases and phone layouts.
- `python scripts/project.py verify --browser chrome`: connected combat,
  progression, campaign, persistence, UI and package checks.

Local checks establish implementation behavior, not final balance or physical
device acceptance. The named CSV implementation authority is recorded in
`docs/review-gates.json`; broader release and art approvals remain separate.
