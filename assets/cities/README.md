# City artwork — scenery and character perspectives

Review scope: **city-perspective-v3**. The eight buildings and four rooms retain
their overhead view; nine city residents match the classes' upright right-facing
perspective. Generated with built-in imagegen from the [exact prompts](prompts.json)
and the project's NPC/Hunter references.

| Source | Frames | Camera and framing |
| --- | --- | --- |
| `buildings.png` | Eight: four halls, four shops | Roofs, canopy tops and open parapets dominate; small south entrances remain visible. Four columns, rows split at y=444 of 887. |
| `residents.png` | Nine distinct citizens | Upright three-quarter view facing right; clear faces, complete bodies and boots. Three columns; measured row boundaries y=414 and812 of1254, with transparent separation. |
| `interiors.png` | Seed archive, library, tracking lodge, practice hall | Overhead floor plans with furniture tops, low cutaway walls and a south exit. Two columns, rows split at y=580 of 1254. |

`city-art.js` crops measured source boundaries and preserves native RGBA alpha
for buildings and residents. It does not remove colors. Opaque room crops keep
their source proportions on desktop and phones; click targets follow the props.
All selected source files are copied byte-for-byte from the generation outputs.

## Provenance and copying

Buildings and rooms came from text-only briefs. The resident correction uses
the project's prior NPC sheet for identities and the Hunter sheet for style and
camera. The selected image is copied without pixel changes; discarded generation
outputs stay outside the runtime. Each frame has a separate pixel hash and visual
perspective review in `prompts.json`; source images and input references have
SHA-256 hashes. This records provenance, not an exhaustive similarity search
across external artworks or a guarantee of worldwide uniqueness.

Final owner visual acceptance remains pending. Use the generated
`tests/artifacts/city-review.html` gallery after running the city-world check.

## Neighborhood and street furniture atlases

Scope **city-neighborhoods-v1** adds twenty original frames from the built-in
imagegen tool, using this project's building sheet as a style/camera reference.
Exact prompts, reference/source SHA-256 hashes, crop bounds and pixel hashes:
[neighborhoods.json](neighborhoods.json) and
[street-furniture.json](street-furniture.json).

- `neighborhoods.png`: twelve frames, four columns; rows split at y=378/731
  of 1086. Four themed homes, four workshops and four stalls. The selected
  source has the requested magenta key; `city-art.js` removes the key and its
  edge spill while decoding. Earlier checkerboard outputs are excluded.
- `street-furniture.png`: eight frames, four columns; rows split at y=420 of
  887. Fountain, flower bed, bench, lamp, cart, well, practice rack and seedlings.
  Native transparency is preserved.

Both selected PNGs are copied byte-for-byte from generation. Atlas decoding is
cached; runtime sources are included by the existing client asset allowlist.
These are scoped city revisions, not approval of broader art production.
