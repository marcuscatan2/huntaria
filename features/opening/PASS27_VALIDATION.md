# Quest wayfinding validation

Status: **implemented and browser-verified local prototype**.

## Player contract

- The compact main-quest tracker shows the objective followed by its destination
  region and map when the objective has a valid map.
- Yellow `!` means that the marked NPC offers the current objective.
- Yellow `?` means that the marked NPC is ready for the current delivery or
  turn-in interaction.
- The same symbol appears at the NPC's actual position on the local minimap.
- An NPC has no marker while its accepted field requirement is still incomplete.
- Markers are campaign-derived presentation only. They do not advance objectives
  or grant rewards, and their accessible button label carries the same meaning.

## Firstlight walkthrough

1. Start a fresh test adventure. Confirm the first objective shows
   `Mosslight · Firstlight Meadow` and no NPC marker is present.
2. Summon the guaranteed Brimble. Confirm the Forest Mage appears with `!` in
   the field and on the minimap.
3. Speak to the Mage. Confirm the objective becomes **Get a second companion**
   and the marker disappears.
4. Summon a second companion. Confirm the objective becomes **Return to the
   Mage** and the Mage displays `?` in the field and on the minimap.
5. Win the proof. Confirm the tracker advances to Tavi and the completed Mage no
   longer has a quest marker.

Automated coverage lives in `tests/opening_cases.js` and
`tests/opening_check.py`. This verifies state mapping, live browser updates,
layout and accessibility; it is not owner approval of final icon art.
