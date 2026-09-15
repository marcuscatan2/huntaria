# Human character sprites

Generated with the built-in image tool for the owner's Hunter, knight and
civilian NPC request of 2026-09-14. Swordsman is the knight's stable class ID.
The existing Druid and Mage sheets supplied the visual references.

- `hunter-sheet.png` and `swordsman-sheet.png`: four-by-four painted pose sheets.
  Frame 13 also supplies static portraits and Inner Sea picture exports.
- `npc-keeper.png`, `npc-villager.png`, `npc-merchant.png`, `npc-traveler.png`:
  reusable civilian portraits with transform motion when used in combat.
- [prompts.json](prompts.json): exact generation/edit prompts, reference hashes,
  selected source names and shipped asset hashes. Source originals are retained.

All six PNGs have native transparency. `animation-data.js` owns measured pose
rectangles and fixed scales; `CharacterRig.npcAppearance` selects civilian art
for ordinary people and class art for class masters. Combat kits are unchanged.

Review the class sheets at world and combat size before repeating this human
art direction. Creation authority does not mean final visual acceptance or
commercial approval. See the [trainer guide](../../features/animation/TRAINER_SPRITES.md).

## Knight walking revision

[swordsman-walk.png](swordsman-walk.png) supplies a separate 2x2 walking cycle,
generated with the built-in image tool. [Exact prompt and hashes](swordsman-walk-prompts.json)
record the original class sheet reference and selected output. Native transparent
pixels are retained. `character-rig.js` isolates detached pieces per cell at load;
`animation-data.js` provides measured bounds and one foot-anchored scale. Static
portraits explicitly clip the idle rectangle, including letterboxed SVG displays.
The existing 4x4 sheet still supplies combat and idle poses.
