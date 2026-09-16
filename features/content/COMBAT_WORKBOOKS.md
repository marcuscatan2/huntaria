# Workbook combat contract

## Source and scope

The owner requested implementation of [monster combat](../../docs/Huntaria_Combat_Design_v2.xlsx)
and [class talents](../../docs/Huntaria_Trainer_Passive_Trees.xlsx).
`scripts/combat_workbooks.py` reads every sheet as data, validates the numbered
100-species mapping against `data/monster-roster.json`, checks 200 monster
loadouts and recomputes the 12 class allocations. It never executes spreadsheet
formulas or external links. Source hashes are pinned in `combat-catalog.js`.

The combat workbook contains 304 signature moves, 11 shared moves and 100
innates. Its claim of 80 retained kits refers to an external draft: these were
not the game's existing kits. Every proposed move has an explicit implementation
in `combat-kits.js`; no runtime code interprets prose.

## Adopted rules and compatibility

| Workbook assumption | Implemented contract |
| --- | --- |
| Critical hits need Luck | Owner approved 5% base chance and 1.4× physical damage, after accuracy. Explicit skill/talent bonuses only. Leadership contributes no critical chance. Magic, DoTs, transfers and secondary procs cannot crit. |
| Shields and interception | Owner approved named shield pools sharing a 25% recipient-max-HP ceiling. Same source refreshes its own pool; other pools coexist. Earliest expiry absorbs first. One interceptor takes at most 35% of post-defense, post-shield damage, capped by its remaining HP, with no second mitigation or transfer chain. |
| Locked targets and independent actions | Preserve continuous nearest-target selection and existing action meters. Explicit taunt/lure requires reach. Basic-tempo effects change basic recovery, not cooldowns. DEX continues to affect cast time only. |
| One skill from each cooldown tier | Keep three unique equipped skills in player-selected priority order, including repeated cooldown tiers. Three-distinct-cast effects count skill IDs. Brood Call can be placed before Royal Mandate by the player. |
| Attack stat determines reach | Attack basis and delivery are separate. Ranged STR, melee DEX and melee magic work without changing classic stat formulas. |
| Individual attribute builds | Companions retain their actual level/base/mastery plus trainer-attribute sharing through Leadership. No invented IVs, Luck, SP or equipment system. |
| Multi-hit prose | The written damage total is one primary packet; it does not multiply resource/critical triggers. Area secondary packets resolve before retaliation and post-hit recovery. |
| Support target shortcuts | Use the lowest living HP percentage in the owner's party, with trainer priority on exact ties; explicit trainer-only skills keep that target. |
| Temporary allies | Entities are separate from encounter actors. They cannot earn XP, drop loot, occupy party slots, count as a victory objective or survive their owner. Ordinary support excludes them; explicit repairs can reach them. |

New companions and fresh enemies use their first three signatures. Existing
individuals retain valid selected legacy skills, XP and formation. The newer
[companion CSV revision](../growth/COMPANION_TREES.md) replaces their level stats
and generic mastery with 24-node species trees. The five legacy skills remain available per species. Brimble's existing
wild encounter override preserves introductory fight pacing with its new kit.
Authored Tidecrown, Amber guardian and
Amber Challenger 2 tuning in `campaign.js` preserves the tested starter route
with the new kits; this does not alter their shared species bases or rewards. Old reserved fights retain generic mastery through replay; new encounters
use the authored species talent hooks. Ordinary gameplay UI shows concise tooltips; complete
source prose remains in the catalog for review.

`combat-effects.js` owns effect lifetimes, shields, control, healing and delayed
HP loss. `combat-passives.js` owns species triggers. `combat-entities.js` owns
finite summons and constructs. Damage debt bypasses later shields and defenses;
trainer defeat ends the battle before pending recovery can save it. These modules
use seeded simulation time only, and ship in both browser and Node module lists.

## Class talents and migration

`class-trees.js` supplies 15 talents for each of the four classes, grouped into
three branches with ranked prerequisites. The approved class budget starts at
two points at Lv20, then adds one every three levels through Lv59, capped at 15.
`combat-talents.js` applies learned talents from the trainer owner's profile.
Class Skill Tree supports spending points and a free reset.

Profile normalization clears the old class-node IDs and makes the new budget
available; valid new talent ranks survive reload. Companion migration follows the newer CSV contract. Saved encounters pin `options.classTrees`: absent in
old reservations means legacy version 0, while new reservations use version 1.
Only those old battles retain their frozen generic class bonuses through replay
and settlement. New battles use the current allocation.

Mage's Astral Lens and Druid's Heartwood appear at battle start and can redeploy
on a personal active after their deployment cooldown; they cannot respawn from
idle time alone. Hunter Focus grows against its living Quarry, and Hunting
Signal marks one enemy per hunter. Four free class traits remain: Mage's magic
rider, Druid's short healing effect, Knight's brief defense and Hunter's accuracy.

## Visuals

Trainer menus use [illustrated prerequisite diagrams](../growth/TALENT_TREE.md)
with a painted sanctuary and 60 class-specific node illustrations. Selection
opens details; spending remains a separate profile action.

23 individual generated images cover monster entities, the class
Lens, Heartwood and Barkling, and the Anthill, Seed Bomb and Ironwood variants. [The asset manifest](../../assets/summons/manifest.json)
records built-in imagegen prompts, reference hashes and final source hashes.
Images are keyed and decoded on demand into a bounded 160×160 canvas cache
(all 23: 2,355,200 decoded bytes). `summon-view.js` draws lifetime/HP bars,
protection links, area radii, delayed HP and Echochime's remembered action.
The existing combat VFX supplies hit, heal, ward and spell effects.
Generated sources are production inputs; galleries and validation captures stay
under ignored `tests/artifacts/`.

## Validation and publication

- `python scripts/combat_workbooks.py --check`: source/catalog and allocation checks.
- `python tests/combat_workbooks_check.py --browser chrome`: all 315 legal casts,
  200 loadouts, 12 class builds, behavioral contracts, browser/Node equality,
  cutout decoding, save isolation and phone widths.
- `python scripts/project.py verify --browser chrome`: affected connections,
  campaign, persistence, runtime parity and packaged-client checks.
- After a fresh mechanics export, `python scripts/refresh_pass18_reference.py
  --combat-workbooks` publishes only authorized kit/range/crit fields while
  asserting unchanged base stats and retaining legacy skill IDs. Then run
  `python scripts/creature_reference.py --write` and `--check`.

Local simulations do not certify final balance or physical-device performance.
The scoped implementation request and combat/class approvals are recorded in
`docs/review-gates.json`; broad art, core-loop and device approvals remain open.
