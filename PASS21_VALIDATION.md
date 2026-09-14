# Patch21 owner validation — playable trainer motion

Open [isolated QA](http://127.0.0.1:8765/?test=1). This review covers the new
Mage and Apprentice art only; the Druid is the unchanged reference you selected.

## Apprentice dagger and bow

Use **Restart progress** and create one character with each weapon. Walk left and
right, then fight the first nearby creature.

- Does the character feel like the same humble Apprentice in creation, travel and
  combat, even though the detailed painted poses begin when movement loads?
- Dagger should read as a quick forward thrust/slash. Bow should visibly plant,
  draw, aim and release rather than moving like a dagger user.
- Check idle, walking, attack/technique, hit, defeat and victory. Look for sliding,
  clipping, gray checker pixels, loose fragments or a wrong left/right facing.

The creator still shows all hair, face, hair-color and skin-color choices, but the
painted action sheets currently use one canonical swept-hair, medium-skin look.
Decide whether this is acceptable for the MVP or whether selected cosmetics must
also alter every painted action frame now. Building that variant system becomes
more expensive after equipment/cosmetics are attached to trainer sheets.

## Mage

In TEST MODE expand **ART REFERENCE** and play the reference encounter. Watch the
Mage at 1× and 2× with full and quiet effects.

- Walk cycle, staff attack, arcane cast, hit, defeat and victory should match the
  Druid's scale, anchor, warm painted rendering and readable anticipation/recovery.
- The hat, staff and crystal should stay inside the character frame with no loose
  fragments. Spell effects should still land with the existing HP/damage timing.

## Decision requested

Reply **Approve** or **Revise** for Mage, Apprentice dagger and Apprentice bow.
Separately answer whether canonical Apprentice action appearance is enough for the
MVP. This does not approve the 100 creature designs, creature motion, future
classes, final cosmetics, physical-device performance or commercial release art.
