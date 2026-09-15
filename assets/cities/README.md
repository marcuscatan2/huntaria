# City artwork — overhead revision

Review scope: **city-overhead-v2**. All 21 city frames replace the frontal
`world-grid-cities-v1` artwork from Git commit `82bc828` at the owner's request.
Generated with built-in imagegen from the [exact written briefs](prompts.json).

| Source | Frames | Camera and framing |
| --- | --- | --- |
| `buildings.png` | Eight: four halls, four shops | Roofs, canopy tops and open parapets dominate; small south entrances remain visible. Four columns, rows split at y=444 of 887. |
| `residents.png` | Nine distinct citizens | Visible crowns/hat tops, shoulders and foreshortened bodies looking down. Three columns, row boundaries y=414 and 812 of 1254. |
| `interiors.png` | Seed archive, library, tracking lodge, practice hall | Overhead floor plans with furniture tops, low cutaway walls and a south exit. Two columns, rows split at y=580 of 1254. |

`city-art.js` crops measured source boundaries and preserves native RGBA alpha
for buildings and residents. It does not remove colors. Opaque room crops keep
their source proportions on desktop and phones; click targets follow the props.
All selected source files are copied byte-for-byte from the generation outputs.

## Provenance and copying

No external artwork, existing game assets, named artists or franchise references
were supplied to these three text-only generation calls. No tracing or extraction
from another game's artwork was used. Each frame has a separate pixel hash and
visual perspective review in `prompts.json`; the three source images have SHA-256
hashes. No exact file match was found among 162 other repository image assets.
This records provenance and local duplicate checks; it is not an exhaustive
similarity search across external artworks or a guarantee of worldwide uniqueness.

Final owner visual acceptance remains pending. Use the generated
`tests/artifacts/city-review.html` gallery after running the city-world check.
