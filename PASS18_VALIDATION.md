# Pass18 — adventure tuning and world services

Local implementation, 2026-09-11. One agent. **PLAYABLE AND VERIFIED.**
This is not commercial acceptance or a production economy change.

## What changed

- Temporary 15% Echo chance for all 100 configured species / 94 wild sources.
  Six boss previews remain reward-free: no essence acquisition was added.
  Existing precommitted random numbers and accepted receipts remain intact.
- Firstlight: Emberfox Lv1, Stonehorn Lv5, Bloomslime Lv8, Tideotter Lv10.
  Other Mosslight maps start at8/12/16 with +2 levels per resident species;
  other reaches start at their existing access level +4 per map +2 per species,
  capped at100. Regions overlap; crossing a level gate does not promise safety.
- Emberfox is a solo introduction (430 base HP /32 attack /0.65 skill scale,
  no innate). Other individual wild encounters use full species bases/innates.
  Optional resident pack encounters deliberately retain their weaker group bases.
- Wild XP is300 +100 × source level per participating individual. A new Lv1
  companion reaches Lv3 after one Emberfox kill, Lv5 after three. Trainer level
  still equals the highest owned individual. A trainer alone earns no XP.
- Current HP persists across real battles, pauses, reloads, abandoned encounters,
  class changes and level-ups. Trainer health is shared across both classes;
  each duplicate/benched companion has its own injury percentage. Old saves
  without health fields begin full. Saved pre-Pass18 encounters replay their
  original rules; new encounters use persistent injuries. Practice stays separate.
- Defeat rescues the party to its regional village without healing or removing
  accepted drops. The existing sanctuary building offers free collection-wide
  recovery. It cannot be used remotely or during a reserved encounter.
- The existing painted trade tent is now the Supply Store. Leaf Draught costs3
  coins and heals45% maximum HP; Revival Salve costs6 and revives at50%. These
  are between-encounter supplies. Old biscuits/fruit/rations are sold here too;
  inventory no longer offers remote purchases. No paid gameplay or new NPC names.
- The lookout's painted road sign itself opens local information. No duplicate
  green icon. Service hit targets track the actual sprite bounds; essential
  signs/tents/sanctuaries remain visible in low-effects mode.
- World Atlas is a geographical six-reach map with30 native button destinations,
  actual road connections, current/visited/unexplored/locked states, keyboard
  selection, touch panning and destination details. Walk here follows gates;
  it does not teleport. Defeat rescue is a separate recovery rule.

## Owner playchecks

1. Ctrl+F5 the normal localhost preview. No save reset is needed. Inspect a wild
   creature: the dialog and collection should show15% Echo chance.
2. Open World Atlas, select an unlocked map, then Walk here. Inspect a locked
   reach too. The route should use physical gates and cancel with WASD/Escape.
3. Read the painted road sign in Fernpath Woods. It should list local creatures,
   levels, populations and15% odds without a green duplicate marker.
4. Fight two appropriate-level creatures without healing. Watch individual HP
   carry over. Try a higher-level opponent and compare builds/formations. Report
   encounters that feel trivial, overly slow or unfair; not every fight is narrow.
   Use a low-level save to judge the opening: trainer level follows the highest
   owned monster, even when benched, so a late-game trainer still overpowers Mosslight.
5. Enter the village, click its trade tent, buy a Leaf Draught for3 coins and
   use it from Recovery items or Inventory. Click the sanctuary for free healing.
   Fallen members need a salve or sanctuary; changing class does not heal.

## Evidence and limits

Final browser assertions: **4,225 /4,225 passing** across the following runs.

| Suite | Chrome | Edge |
| --- | ---: | ---: |
| Pass18 mechanics + retained combat/roster/world regression | 2,067 | 2,067 |
| Played hunts, reload, injury, shopping, rescue, signs, atlas and responsive UI | 29 | 29 |
| Retained campaign, pack and receipt regression | 33 | — |

All five reports pin the same55 runtime JS/CSS/HTML files. No unexpected
JavaScript errors or missing runtime assets in the main/played suites. Planning
integrity30/30, with66 cards /264 criteria and **zero commercial criteria accepted**.
The100-species JSON and four generated reference tables agree with the current
source-hashed browser export. Local preview port8765 returns HTTP200.

Opening balance, default unallocated solo trainers, no prepared supplies:
Druid beats Emberfox in35.65s with78.4% HP; Mage in15.85s with75.8% HP. Mage
beats Lv5 Stonehorn in68.95s with29.6% HP; Lv10 Tideotter defeats it. A played
two-hunt Mage sequence leaves75.83%, then51.67% health across the two fights.
These are starting fixtures, not a guarantee of outcomes for custom trees,
attributes, parties or higher-level saves. The retained campaign fixtures use
fresh-health teams to check content/receipts; they do not certify full-campaign
endurance balance under the new health rules.

Automated reports and screenshots are in tests/artifacts/pass18-*.
The suites use isolated temporary browser contexts and sandbox saves, not the
owner's normal save. Fixed-roll fixtures prove boundaries/receipts, not naturally
observed drop frequency. Seeded unallocated-trainer balance samples have identical
results across30 seeds because effective dodge is zero in that opening build.

No online authority, payment system, new monster animation package, stashed
account buffs, evolution or AFK rewards were added. A sudden crash may still lose
the most recent uncommitted second of combat; accepted kill receipts are retained.
The100-species/final campaign balance and physical mobile-device acceptance remain
open. Historical Pass17 checks describe earlier odds/services and are not current
Pass18 acceptance evidence.
