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
individuals retain valid selected legacy skills and all XP, formation and mastery
ranks. The five legacy skills remain available per species. Brimble's existing
wild encounter override preserves introductory fight pacing with its new kit.
Authored Tidecrown and
Amber Challenger 2 tuning in `campaign.js` preserves the tested starter route
with the new kits; this does not alter their shared species bases or rewards. Skill-specific
companion mastery nodes follow the current skill catalog and preserve their
corresponding legacy-skill bonus; generic mastery keeps
its existing bonuses. Ordinary gameplay UI shows concise tooltips; complete
source prose remains in the catalog for review.

`combat-effects.js` owns effect lifetimes, shields, control, healing and delayed
HP loss. `combat-passives.js` owns species triggers. `combat-entities.js` owns
finite summons and constructs. Damage debt bypasses later shields and defenses;
trainer defeat ends the battle before pending recovery can save it. These modules
use seeded simulation time only, and ship in both browser and Node module lists.

## Class decision still pending

`class-trees.js` prepares 15 class-specific talents per class, branch prerequisites,
and a 15-point budget: two points at Lv20, then one every three levels through
Lv59. `combat-talents.js` implements their combat hooks. `BondClassTrees.active`
is false; the existing class menu, point budget and invested ranks stay active.
The owner's explicit approval of this replacement and refund is required before
enabling migration. Growth, profile and menu routing are prepared behind that
switch; the browser suite enables it only in a disposable context to exercise
refunds, purchasing prerequisites and the fifteen-node phone menu. Companion mastery does not use the new class budget.

Four class traits are independent of that point-budget choice: Mage primes a
magic rider after casting, Druid leaves a short heal-over-time, Knight remembers
a brief defense, and Hunter gains accuracy. They apply in combat now.

## Visuals

20 individual generated images cover all 17 monster entities and the class
Lens, Heartwood and Barkling. [The asset manifest](../../assets/summons/manifest.json)
records built-in imagegen prompts, reference hashes and final source hashes.
Images are keyed and decoded on demand into a bounded 160×160 canvas cache
(all 20: 2,048,000 decoded bytes). `summon-view.js` draws lifetime/HP bars,
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
The scoped implementation request and two combat approvals are recorded in
`docs/review-gates.json`; broad art, core-loop and device approvals remain open.
