# Opening and class-choice review

Current owner walkthrough for OR-02. Approval remains pending; automated checks
do not establish fun, pacing, final art quality or physical-device readiness.

## Firstlight

Open `http://127.0.0.1:8765/?test=1` and choose **Restart progress**. This uses
isolated test storage. Test travel, recovery and combat acceleration are described
in [Operations](../delivery/OPERATIONS.md#test-controls); evaluate normal pacing
separately. Record elapsed time, deaths, recovery trips and confusing moments.

1. Create a named dagger Apprentice. Confirm the objective, minimap, Atlas and
   Explore / Bag / Inner Sea controls fit inside the game frame.
2. Defeat a Brimble, follow its first guaranteed Echo into Bag, and summon it.
   Each drop has a temporary notification; Brimble joins the first open party
   slot, follows the player and shows its HP line.
3. Find the Forest Mage. Firstlight roads remain locked until the proof battle.
   The Mage asks for a second companion; summon the guaranteed Bloomslime or
   Stonehorn Echo, return and win the proof. The roads open and Tavi becomes the
   next objective.
4. Confirm the tracker names the destination. Yellow `!` marks an offered
   objective and `?` marks a ready delivery in both the field and minimap.
   Accepted but incomplete requirements have no NPC marker.
5. Repeat with the bow and the other second companion. Check that both weapons
   feel viable and that the next action is understandable without a guide chain.

## Classes and the main quest

1. Follow the class demonstrations through Tavi, Rain, Lina and Wren. Describe
   how each class fights, then prepare for Tidecrown in Springwater Cave.
2. After Tidecrown, visit a class master's city courtyard. Win the acceptance
   fight with the current Apprentice party, then confirm a specialization at
   player level 20. All four classes are available; see [Classes](CLASSES.md).
3. Follow [the sacred-treasures walkthrough](../campaign/SACRED_TREASURES.md):
   master rescue, Echo hunting, the ghost tower, Tully and the class weapon.
4. Reload between milestones and verify class, companions, inventory and quest
   progress. The farm opens at Lv25; individual monster trees open at Lv31;
   the earlier Amber and regional lessons are optional.

Review the first moment that feels confusing, unfair or dull. Current owner
decisions and production boundaries live in [OWNER_REVIEWS](../../OWNER_REVIEWS.md).

## Regression coverage

`tests/opening_check.py` and `tests/opening_cases.js` cover fresh creation,
guaranteed opening Echoes, atomic summoning, quest markers, Mage gating, independent
XP, injuries, isolated test controls, reloads and narrow layouts. A fallen selected
companion stays in the party but is benched from combat; a fallen trainer must
recover before starting another encounter. Trial and farm coverage is routed
through `tests/farm_classes_check.py`; the main continuation uses
`tests/relic_quest_check.py`.

Firstlight's Brimble has an explicit encounter modifier, separate from its owned
CSV stats. Both starter weapons must win all 30 introductory regression seeds,
finish within 40 seconds and retain more than 25% HP; average remaining HP stays
below 80% so recovery has a purpose.

Run these browser suites with `--browser chrome` or use
`python scripts/project.py verify --browser chrome` for the full current gate.
Reports and screenshots are regenerated in ignored `tests/artifacts/`. Match
their source hashes before treating them as current evidence. Durable contracts
belong in feature guides; past reports and handoffs are recoverable from Git.
