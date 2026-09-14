# Playable trainer sprite pipeline

The playable trainer roster is Apprentice, Druid, Mage, Hunter and Swordsman.
Swordsman retains its stable ID and is drawn as a knight. The owner requested
Hunter/knight art matching the current Druid and Mage on 2026-09-14.

## Runtime route

| Trainer | Source | Runtime behavior |
| --- | --- | --- |
| Druid | `assets/art-v10/druid-sheet.png` | Approved-by-owner visual benchmark; 16 painted poses |
| Mage | `assets/art-v21/mage-sheet.png` | Native transparent RGBA; 16 painted poses |
| Apprentice dagger | `assets/art-v21/apprentice-dagger-sheet.png` | Canonical painted dagger motion; generated neutral backdrop isolated on load |
| Apprentice bow | `assets/art-v21/apprentice-bow-sheet.png` | Canonical painted bow motion; generated neutral backdrop isolated on load |
| Hunter / Swordsman | `assets/characters/*-sheet.png` | Native transparent RGBA; 16 painted poses; idle frame also supplies portraits |
| Civilian NPCs | `assets/characters/npc-*.png` | Four reusable people; transform motion in battle |
| Apprentice creation | `assets/art-v22/apprentice-*-creation.png` | Painted 3x3 hair/expression atlases; palette tint is applied in-browser |

`BondApprenticePreview` owns the creation-only painted preview. Rows select crop,
sweep or braid; columns select calm, bright or focused; the saved palette is
applied to connected hair and skin regions. Dagger and bow have separate atlases.
The old SVG is no longer displayed in character creation.

`CharacterRig` selects the Apprentice action sheet from the saved weapon. Animated
scenes preload it and begin on its idle frame; they never display the visibly
different creator portrait while waiting for movement. The cached sheet is reused
when exploration rebuilds after combat. Static menus and the Inner Sea retain the
painted creator source. The retired SVG renderer is not loaded. Painted
action poses currently use the canonical swept-hair, medium-skin appearance; do
not imply that all selected cosmetics carry into the 16-pose motion atlas yet.

The built-in generator produced native alpha for Mage but repeatedly rendered a
neutral checker into otherwise acceptable Apprentice sheets. Shipped originals
are preserved. On load, the renderer flood-selects only neutral edge-connected
background, makes it transparent in an offscreen canvas, and keeps the largest
connected figure in each cell. A failed safety threshold leaves the painted
canvas empty instead of displaying the source backdrop. This is a bounded prototype
compatibility step, not the preferred production export pipeline.

## NPC appearances and class portraits

`CharacterRig.npcAppearance` reserves class artwork for entries with
`masterClass`. Ordinary trainers use one of four stable civilian appearances;
keepers use the ledger-carrying elder. Monsters keep their species art. Field
actors, dialogue portraits, opponent previews and battle HUD/rigs use the same
selector. NPC names, combat classes, skills, quests and rewards are unchanged.
Player characters continue to use their selected class artwork.

Hunter/Swordsman static portraits display frame 13 through an SVG viewport over
the painted PNG. Animated scenes use the same sheet on canvas.
`CharacterRig.portraitSource` provides a cached transparent canvas for Inner Sea
rendering/export, without serializing external image references into data URLs.

## Pose contract

All trainer sheets use the same indices and fixed 300-unit foot anchor:

- 0–3 walk; 4–7 attack; 8–11 cast/technique.
- 12 hit; 13 idle; 14 defeated; 15 victory.
- Right-facing art is canonical. World and combat facing transforms flip it;
  frame selection never changes simulation, reward or timing authority.
- Reduced motion returns to the stable idle/reaction frame contract.

Exact selected prompts and generated-source paths are recorded in
`assets/art-v21/prompts.json`, `assets/art-v22/prompts.json` and
`assets/characters/prompts.json`. Historical
rejected Mage alpha attempts remain in `assets/art-v16` and are never loaded.

## Validation and owner boundary

Run `python tests/trainer_animation_check.py --browser chrome`, then the full
project gate. The trainer test renders every frame on a colored background,
checks four distinct walk/attack/cast images for Druid, Mage, Hunter, Swordsman and both Apprentice
weapons, checks transparent output, verifies the eager idle-frame handoff and
verifies honest coverage metadata.
`tests/opening_check.py` separately proves the creator uses canvas art and that
every appearance/weapon control produces a distinct painted preview.

The owner explicitly chose the Druid art/motion as the direction for other
trainers. The new named Hunter/knight/civilian batch is explicitly authorized
for creation and integration using Druid/Mage as references. Its finished look,
Mage and both Apprentice weapon sheets still need an
Approve/Revise review at actual world and combat size. This does not approve
creature animation, impact synchronization, selected cosmetics in action frames,
other future class designs or commercial production assets. Review the new
human sheet and actual NPC/master scenes before commissioning more variants;
technical fixes can continue while broader art/release gates remain pending.
