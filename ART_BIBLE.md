# Bond & Bolt art reference — revision 1 / pass 16

Status: **candidate reference, not owner-approved production art**. Original painted assets and original code-native creature drawings coexist. Do not expand the production roster against an unapproved screenshot.

## Visual rules

| Dimension | Contract |
| --- | --- |
| Proportion | Small readable bodies, roughly 2.5-head trainers; one recognizable silhouette per species. Broad tank stance, compact support, directed attacker. Never count a recolor as another species. |
| Palette | Mosslight jade/cream/gold; trainer Druid leaf green, Mage violet/ivory. Fire amber, Water pale blue, Earth ochre, Wind mint. Enemy ownership also has text/side cues. |
| Lighting | Soft upper-left key; restrained warm highlights, cool contact shadows. Painted assets may not bring their own opaque rectangle. |
| Ground | 320-unit character canvas, fixed 300-unit ground anchor for pose sheets. Constant per-character scale; crop alpha bounds, never auto-fit each frame. Druid canvas is displayed at1.15× about its foot anchor; Mage and both Apprentice weapons share the same anchor contract. Flying creatures retain an explicit ground shadow. |
| Depth | Feet determine exploration depth. Combat names and HP render above VFX. Trainer identity and boss warnings must remain visible. |
| Motion | Distinct anticipation, release/contact, recovery. Idle is restrained; walking has foot/wing motion. A complete portrait bob is not an attack. Existing SVG limbs now have explicit pivots; these are technical placeholders, not approved painted animation. |
| Impact | One presented deadline, 0.26 logical seconds after the event. Projectile arrival, contact, HP, hit reaction and sound request share that deadline. Reduced motion presents it immediately. Canonical combat does not depend on effects. Solo playback caps real catch-up at40ms per render frame; severe stalls slow presentation rather than skipping a long burst of effects. Terminal wild victory still returns immediately, as requested. |
| Typography | Clear sans-serif for gameplay, restrained serif for headings; 44px principal controls, visible focus, readable contrast. Long skill names stay in the inspector/journal. |
| Effect restraint | Heal +, damage −, BLOCK, DODGE, ward icon, explicit marked-boss label. Quiet/reduced settings retain warnings and outcomes. Do not cover trainers with area effects. |

## Reference reproduction

Open `/?test=1&reference=16`, expand **ART REFERENCE**, then **Play reference encounter**. This explicitly resets only the isolated test profile. Druid + Emberfox + Stonehorn versus Mage + Stormowl + Bloomslime, level 1, seed 16. Record at 1×, 2×, Quiet FX and reduced motion. Inspect movement, basic attacks, heal, ward, hit, defeat and victory. The separate test-Echo button feeds the actual Inventory → Summon flow; it does not demonstrate organic drop probability.

`tests/pass16_visual.py` captures played reference clips and impact-deadline traces. Build hashes and browser/hardware belong to that report; screenshots alone cannot pass VP-04.

## Provenance and coverage

- Existing painted reference sprites: `assets/art-v6`, `assets/art-v10`; original prompts retained there.
- Pass16 Mage candidates remain rejected historical sources: both contain a baked checkerboard and are excluded from gameplay. Pass21 replaces them with a true-alpha Mage atlas and two weapon-specific Apprentice action atlases. Pass22 adds painted dagger/bow creator atlases. Exact prompts, source paths and alpha handling are in `assets/art-v21/prompts.json`, `assets/art-v22/prompts.json` and [the trainer pipeline](features/animation/TRAINER_SPRITES.md).
- Roster drawings: `creature-art.js`, original code-native anatomy with explicit joint pivots. They are not claimed to match the final painted look.
- `BondAnimationCoverage.manifest()` distinguishes painted trainer poses, supplied-raster transform motion, vector-joints, vector-fallback and portrait-fallback for all 103 characters (100 monsters, two specializations and the apprentice). Every row remains `approved: false` until reviewed.
- The Apprentice creator, initial world state, static menus and Inner Sea use painted 3x3 dagger/bow atlases for the three hairstyles and expressions, with whitelisted hair/skin palette tinting. Movement/combat use canonical painted 16-pose dagger or bow atlases. The retired Apprentice SVG is not loaded. Hair/skin/face variations are not yet authored in action sheets; this is an explicit prototype limitation, not approval of a final customization system.
- No borrowed game screenshots, extracted Sword x Staff sprites or external copyrighted character assets are included.

## Owner / newcomer review sheet

Use [owner gates](OWNER_REVIEWS.md): OR-01 approves the visual direction,
OR-04 the motion reference, and OR-05 each named creature batch before its final
production. The owner has rejected the current expanded-roster design quality;
existing files/technical coverage are not a production approval. Concepts and
technical tests may continue while revised candidates are prepared.

Pin the build hash and clip, hardware and reviewer date. Mark **acceptable / revise** for silhouette, scale/anchor, depth, motion, state distinction, impact timing, owner/target clarity, UI hierarchy and effect restraint. Any revise blocks roster-wide production. Recruit the first ten uncoached viewers and ask: Which character must survive? What ends the fight? What preparation would you change? Require 8/10 to identify trainer/objective and a useful change. Automated fixtures are not viewers.

Owner decision: pending. Newcomer observations: not conducted. Physical-phone approval: pending. No claim of Sword x Staff quality parity is made.
