# Companion moves and city services

`companion-moves.js` owns pure species learning plans and individual move
knowledge. `profile.js` validates and persists lessons, loadouts and resets.
`city-data.js` places one Move tutor and one Reset talents resident in every
city; `companion-services.js` presents their framed, keyboard-accessible menus.

## Learning

New companions equip one species signature, Quick Strike and either Brace
(physical species) or Basic Ward (magical species). Three-signature species
learn signatures at levels 1, 24 and 48, with basic lessons at 12 and 36.
Four-signature species learn signatures at 1, 16, 32 and 48, with basics at
8, 24 and 40. Extra basics follow the species' tank, support or damage role.
Every planned move is known by level 48. Learning never replaces equipped moves.

The tutor teaches the eleven workbook General moves to either active companion,
without a fee. A move already known cannot be taught again. The saved party,
ownership, NPC proximity and absence of a reserved encounter are checked inside
the profile command. Signature moves are violet and explicitly labeled in the
loadout. Unknown planned moves show their required level.

Individuals save `movesVersion`, `moveLevel`, `taughtMoves` and `legacyMoves`.
Previously equipped valid moves are retained during migration; historical
copies keep their stable IDs. Earned move knowledge survives farm XP loss.
Combat accepts all General moves without changing authored enemy skill pools.
Frozen older encounters keep their original inputs; current owned loadouts must
contain three distinct known moves.

## Echoes and resets

An owned species cannot be summoned again. Existing summon receipt retries
return the original individual without consuming another Echo. Existing duplicate
individuals remain playable, but names no longer carry ordinal suffixes.

Reset talents offers all owned companions. It refunds the selected individual's
talents for one matching species Echo, consuming the lowest-level Echo first.
No invested points or no matching Echo means no charge and no reset. Commands
are atomic: a failed save preserves the Echo and ranks. Trainer talent resets
remain free. Choosing a class resets trainer attributes to one and refunds the
full earned attribute budget; companion allocations and archived Apprentice
talents are preserved.

## Navigation

Bag contains Inventory. Inner Sea has three top-level tabs:

- Sea land: Homestead.
- Trainer: attribute overview, Class Skill Tree and Equipment.
- Party: My companions, Formation and Species Guide.

Formation owns companion substitution and Dummy test. The companion overview
starts with Mastery tree and shows its held item beneath the level. Red badges
lead through Inner Sea to affordable upgrades, or to an empty held slot when a
compatible unassigned item exists. Inspecting a badge never consumes it.

`tests/companion_services_check.py --browser chrome` checks learning plans,
transactions, city reachability, navigation, held items, save isolation and
responsive layouts. Existing opening, replay and menu suites cover the connected
contracts. These are local checks, not online reward authority or device approval.
