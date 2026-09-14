# Pass 15 scenery assets

Seven original generated PNG atlases: six biome sheets (4×4 props) and one
shared material sheet (3×3 textures). All delivered images are 1254×1254;
the requested prompt sizes were not the delivered dimensions. The six prop
sheets carry PNG RGBA transparency; the terrain sheet is treated as opaque.

See prompts.json for every exact prompt, tool-generated source path, final
project path, measured dimensions/bytes, SHA256 and review status. The built-in
image generation tool produced the images. No external game assets were copied,
and no CLI/API fallback or paid asset purchase was used.

Source PNGs are preserved. world-renderer.js uses individual measured outlines
for the 24 foliage props in the first row of the six atlases. Their unequal
canopy widths must not be cropped as four equal columns: that includes pieces
of neighboring trees. The same outlines clip CSS scenery and canvas battle
backdrops. Other props retain row-band/gutter crops. Cropping changes rendering,
not the source images. tests/field_polish_check.py renders the 24-prop review sheet.
Only the current/nearby biome sheets are requested; do not preload all seven.

These assets need owner art approval and normal release rights/trademark review.
Generated output and successful browser loading are not a legal clearance or a
promise of equivalence to Sword x Staff's final presentation.
