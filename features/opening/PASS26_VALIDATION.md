# Patch 26 opening review

Status: **ready for owner review; not commercially approved**.

This is the current OR-02 hands-on review. Use the isolated test save at
`http://127.0.0.1:8765/?test=1`, choose **Restart progress**, and play without
using test Echo grants. Test-mode movement, automatic post-combat healing and
5x combat speed are conveniences; judge the normal combat decisions, route and
information clarity rather than their accelerated timing.

## Firstlight walkthrough

1. Create and name an Apprentice. Confirm the small objective, minimap, Atlas
   control and Explore / Bag / Inner Sea menu all sit inside the game frame.
2. Defeat one Brimble. Its first Soul Echo must drop, each loot item must appear
   as its own temporary in-frame notification, and the objective must direct
   you to Bag.
3. Open Bag, select the highlighted Brimble Echo and Summon it. Brimble must
   enter the first party slot automatically, follow in the world and show a
   thin HP line.
4. Find the Forest Mage. The road markers and Atlas travel out of Firstlight
   must remain visibly unavailable. The Mage must ask for a second companion.
5. Defeat a Bloomslime or Stonehorn, summon its guaranteed Echo, and return to
   the Mage. The deliberately easy trial must return immediately to the field,
   open the roads and change the objective to Tavi.
6. Enter the next map and confirm that the old authored progression continues.

## Injury regression

In the isolated save, leave only one companion selected and reduce that
companion to zero HP with the QA state fixture or a normal loss. Starting the
next fight must still work: the fallen companion remains selected and visible
with a red HP line, but is benched from the encounter and the trainer fights
alone. A fallen trainer must still block a new fight until recovery.

## Approval questions

- Is the opening understandable with only the tiny current objective and
  contextual highlights?
- Does earning and summoning the first Echo feel satisfying enough to anchor
  the acquisition loop?
- Does the Mage gate feel like a natural readiness check rather than a tutorial
  wall?
- Are the field HP lines useful without making exploration visually noisy?
- Is this in-frame HUD the right direction to propagate to combat and loadout?

Approval of this packet accepts the opening interaction pattern, not final art,
late-game balance, real-device certification, production saves, payments or
online systems.
