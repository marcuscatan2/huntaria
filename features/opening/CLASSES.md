# Four launch classes and master acceptance

The owner requested Hunter and Swordsman on 2026-09-14. Apprentice remains the
starting class, and the two normal companion slots remain unchanged.

| Class | Basic damage | Five abilities | Default priorities |
| --- | --- | --- | --- |
| Druid | Magic / INT | Mend, Barkskin, Bramble, Grove Renewal, Entangle | Mend, Bramble, Barkskin |
| Mage | Magic / INT | Frostbolt, Arc Nova, Crown Hex, Arcane Aegis, Comet | Frostbolt, Arc Nova, Arcane Aegis |
| Hunter | Ranged physical / DEX | Pinning shot, Arrow volley, Longshot, Hunting call, Trail ward | Pinning shot, Longshot, Trail ward |
| Swordsman | Melee physical / STR | Cleave, Sword lunge, Parry, Rallying cry, Second wind | Cleave, Parry, Sword lunge |

The four demonstrations are Tavi/Druid, Rain/Mage, Lina/Hunter and
Wren/Swordsman. Old `druid-area` and `mage-bypass` demonstration receipts migrate
to the replacement meanings; a progressed save never has to repeat those wins.

After Tidecrown, masters appear in their city courtyards: Druid in Mosslight,
Mage in Willowbrook, Hunter in Amber Crossing and Swordsman in Moonwell. The
city waystones link these four choices; quest directions return to the city of
the master whose acceptance battle you won. Each master's actual
opponent class matches the class being offered. The player fights with their
current Apprentice and real companions. The master says:

> Defeat me in battle and I'll accept you as a Mage. Don't worry, I'll go very easy on you.

The class name changes for the other masters. The easy acceptance battle is
protected from roaming joiners and returns to the field after settlement. Only
the first accepted master win awards the shared 8,500 trainer XP; trying another
master cannot farm that reward. Winning does not change class immediately.
Return to the defeated master and choose **Become [class]** at player Lv20.
The confirmation commits the class once and preserves identity, inventory,
individuals, formations, level and progress. The post-class encounter then uses
the chosen class. Normal menus do not switch a created character's class.

`BondContent.CLASSES` owns the four specialization IDs; `TRAINERS` also includes
Apprentice. Build validation, summoning provenance, saved growth, class pickers
and specialization normalize against these lists. Every class has its own
18-node trainer tree. Hunter and the knight-styled Swordsman use painted
16-pose sheets matching the Druid/Mage reference style. Regular NPCs use civilian
art; only class masters among NPCs wear the class appearances. See the
[trainer sprite contract](../animation/TRAINER_SPRITES.md). Final visual acceptance
remains pending.

Final permanence/retraining policy remains a release decision. No paid retraining
is introduced. The first farm implementation is specified in
[Inner Sea farm scope](../inner-sea/FARM_SCOPE.md).

Validate both opening weapons and second-companion branches against each master,
all four class paths through Lv30, save/reload and exactly-once class rewards.
Use `tests/farm_classes_check.py`, `tests/pass18_campaign.py` and
`tests/pass18_ui.py`, then the full gate. Owner walkthrough: defeat a master,
read its acceptance message, return, commit, and verify the class's effect in
the next fight.

## After ascension

Confirming a class opens the alarm dialogue before the [courtyard raid and sacred treasures quest](../campaign/SACRED_TREASURES.md). The same master joins at Lv100 and guarantees the rescue. The route ends with one inventory weapon for the chosen class.

After Tidecrown, four illustrated cards show each class and city. The in-frame
tracker lists all four routes until specialization. Choosing a card starts
physical travel; it does not grant a class. A master first asks for the desired
class, explains the test, and waits for `Ok`. After victory, the player confirms
permanent ascension in the same dialogue frame. `swordsman` remains the Knight's
stable ID. NPC dialogue has no advice button or reward preview.
