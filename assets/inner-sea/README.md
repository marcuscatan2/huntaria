# Painted Inner Sea homestead

`homestead.png` is an opaque 16:9 environment generated with the built-in image
tool for the owner's in-frame Inventory / Inner Sea request. The supplied
`assets/world-runtime/mosslight-atlas.webp` was used as a style reference.
The exact prompt, original output filename and selected SHA-256 are recorded
in [prompts.json](prompts.json). The selected PNG is an unmodified copy.

The painting contains buildings and terrain. Resident portraits, the trainer,
decorations, dusk, damage and dirt are separate runtime layers. Interactive
labels and menu frames are native HTML/CSS; they remain responsive and do not
appear as a baked screenshot. `inner-sea-farm-view.js` owns loading and scenery
painting; `inner-sea.js` composes the same image for display and local PNG export.

This is the named local implementation batch. Final visual acceptance, target
device budgets and commercial asset clearance remain owner review items.
