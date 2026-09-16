# The sacred treasures — post-ascension main quest

Implemented local scope requested by the owner on 2026-09-15. The current main
quest ends with a class weapon in the Bag. Regional chapters, Amber training,
the Lv25 Inner Sea and Lv30 monster trees remain optional progression. This
does not approve commercial pacing, final art or online rewards.

## Route

1. Confirm any of the four classes with its defeated master. The alarm conversation
   appears immediately, including after a reload between class choice and combat.
   Combat begins when the player chooses to stand with the master.
2. Two Lv60 monsters and a Lv60 Ambercolossus attack. The same class master joins
   at Lv100. The player's party falls; the master wins and restores the party.
3. Accept the master's hunt list: two Bellowsnout Echoes in Amber Heath, two
   Sunscarab Echoes in Copperleaf Forest, and one Amberkite Echo in Amber Heath.
   The tracker says `Hunt for <creature> in <map>` with the outstanding count.
   Each eligible kill supplies an outstanding Echo through normal kill settlement.
   Existing Echoes count. Delivery consumes the exact records and stack counts.
4. The master asks about Tully's hidden sacred treasures. The dialogue reveals
   that Tully is dead and directs the player to catch and summon Casketot.
5. Bring a summoned Casketot in an active companion slot to Tully on the fourth
   floor's rooftop cemetery. Merely owning Casketot or holding its Echo is
   insufficient. The first outstanding Casketot Echo is guaranteed during this
   quest; the player still hunts, summons and chooses their active party.
6. Tully reveals a hatch below the knight's room. Return to the same class master.
   The master keeps the relics and gives the player one class weapon:

| Class | Bag item | Stable item ID |
| --- | --- | --- |
| Druid | Warden's Branch | `weapon:class:druid` |
| Mage | Emberglass Wand | `weapon:class:mage` |
| Hunter | Watchkeeper Bow | `weapon:class:hunter` |
| Knight | Oathkeeper Blade | `weapon:class:swordsman` |

Weapons are inventory items. Equipment slots and combat bonuses are outside this
scope. The final tracker and Journey screen state that the main quest is complete.

## Cemetery and ghost tower

`hollow-2` retains its stable world identity and border connections; its displayed
name changes from Sunfall Basin to **Ghost Tower Entrance**. One physical stair
connects it to four separate interiors, `ghost-tower-1` through `ghost-tower-4`.
Each floor has a return stair; floors 1–3 also have an upward stair. The atlas
retains 36 world squares and projects interior locations onto the entrance square.
Floor positions, discoveries, populations and encounter anchors save normally.
Offset stone stairways connect divided rooms; solid internal walls have open
doorways, and paths reach each habitat, return stair and rooftop memorial.

| Place | Ghost populations |
| --- | --- |
| Entrance | Casketot Lv22 |
| Floor 1 | Wickeep Lv24, Casketot Lv23 |
| Floor 2 | Pinstitch Lv26, Casketot Lv25 |
| Floor 3 | Echochime Lv28, Wickeep Lv27 |
| Floor 4 / rooftop cemetery | Casketot Lv28, Wickeep Lv29; Tully |

The four chosen haunted species stop spawning on their previous maps. Other
species remain available. Each primary relocated habitat retains its old spawn
prefix; additional populations have distinct floor prefixes. Every habitat keeps
the current rarity quota (24 common, 15 uncommon, 3 rare/very rare). Existing
reserved encounters retain their original map, levels, lives and rolls. The
reviewed roster's source levels remain historical source metadata; the habitat
reference records current world levels and every additional habitat.

The tower uses stone floor materials with painted stairs and varied burial
markers. [Landscape contracts](../world/LANDSCAPES.md#ghost-tower-stonework) own
the stonework art, interaction bounds and loading fallback. Casketot is the
chosen coffin spirit.

## Authority and replay

- `relic-quest.js` owns definitions, objective selection, dialogue conditions and
  commands on a profile transaction draft. `BondProfile.relicAction` commits
  nearby NPC interactions, Echo consumption and the once-only weapon grant.
- `journey.relic.stage` is normalized to a known stage. Old specialized saves
  begin at the raid objective without an unexpected forced fight; their master
  remains available. New specialization saves an alarm-dialogue flag atomically. The player
  reads the alarm exchange and chooses to stand with the master before combat.
- `raid-rules.js` owns the bounded rescue choreography. At 4 seconds the boss
  warns; at 8 seconds its howl defeats every player-owned combatant. The master
  remains alive and, if enemies remain, ends the raid with a class finisher at
  14 seconds. The boss cannot fall before the howl. These guarantees belong only
  to this authored story encounter; ordinary combat rules stay independent.
- The three enemies and master are real simulation units. Reserved build,
  encounter, seed and tick replay through the same rules after reload. The raid
  has no wild spawn lives, Echo drops or repeat rewards. Run is disabled during
  the rescue; pause, leaving the battle view and resuming remain available.
- Successful raid settlement advances to the aftermath and restores vitality in
  the same critical save. Failed saves retain the previous stage and inventory.
  Repeated delivery, Tully and weapon commands cannot repeat their effects.
- The UI displays accepted results; closing a conversation before its final
  action leaves the objective available. Dialogue may be revisited at the NPC.

## Validation and owner review

Run `python tests/relic_quest_check.py --browser chrome` for seeded four-class
rescue outcomes, replay, automatic ascension, dialogue, transaction failures,
active-party checks, tower access and the final item. Run the full project gate
for changes crossing combat, persistence and exploration.

Review **class-flow-v2** in the local game: the rescue pace, hunt directions,
tower navigation and dialogue. The named implementation request authorizes this
route. Wider quest/map production still needs the opening/world review decisions;
final visual acceptance, devices and release work remain separate gates.
