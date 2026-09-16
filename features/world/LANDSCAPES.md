# Landscape identity

`landscape-identity-v1` is the owner-requested scenery revision of the existing
forty maps. It is available in the local game; final visual and device acceptance
remain with OR-03 and OR-06. Use the World Atlas to plan a walk to each place.

## Map identities

| Region | Fields, forest and cave | Town / boss domain |
| --- | --- | --- |
| Mosslight | Firstlight: birch farmland and an abandoned windmill; Fernpath: pine canopy and an ivy gateway; Elderroot: standing stones and a root grove; Rootveil: root-hung galleries and buried masonry | Birch village green / elder stone circle |
| Willowbrook | Brookside: old mill and waterworks; Rainwillow: willow tunnel and drowned walls; Reedwatch: river watchtower and levee ruins; Springwater: limestone chambers and ancient aqueducts | Willow water gardens / sunken river sanctuary |
| Amber Hollow | Amber Heath: sandstone quarry and kilns; Copperleaf: autumn pottery works; Ghost Tower Entrance: cypresses, cemetery and memorials; Emberglass: warm mineral fault and buried kilns | Potters' market gardens / sandstone monument court |
| Moonwell | Moonlit Gardens: formal sculpture garden; Whisperwood: ruined library under dark trees; Fallen Observatory: armillary and broken obelisks; Moonstone Cave: blue crystal vault | Sanctuary cloisters / celestial court |
| Windstep | Windstep Prairie: broken windmills and gold grass; Skybough: wind-bent pines and viaduct; Highwind: alpine ridges and a ruined watchtower; Thunderhollow: storm-carved mineral chambers | Highland signal post / shattered summit shrine |
| Ashen Reach | Ashgrass: cooled basalt and old thermal works; Cinderwood: charred orchard with new growth; Obsidian Approach: ruined citadel road; Deepember: turquoise-veined basalt and buried waterworks | Reclaimed ash courtyard / broken basalt throne |
| Ghost Tower | Floor 1: memorial gallery; floor 2: mortuary library; floor 3: astronomers' belfry; floor 4: rooftop cypress memorial | The existing entrance and reciprocal stairs connect all floors |

## Source and placement

- [world-scenery.js](../../world-scenery.js) owns the forty identity profiles,
  measured sprite rectangles and deterministic placement beside main routes.
  This is authored map direction with procedural dressing, not hand placement
  of every tree. Large trees, ridges and architectural remains use two shared
  twelve-object atlases; low plants retain the regional foliage art.
- [world-layout.js](../../world-layout.js) calls scenery placement before deriving
  obstacle buckets. The placement excludes roads, water, gates, habitat cores,
  service approaches, tower walls and the cemetery. Existing service keys,
  map IDs, spawn identities and quest destinations are retained. Layout revision
  22 revalidates saved positions through the existing migration path.
- [world-renderer.js](../../world-renderer.js) paints worn foundations beneath
  the ruins and uses world-anchored shading with a halo around each ground chunk.
  Patches crossing a chunk boundary are painted on both sides. Atlas rectangles
  isolate real silhouettes rather than assuming equal source cells.
- Tall props fade when they cover the player or focused target. Reduced motion
  stops their sway; low detail omits small props. Physical stone posts mark exits;
  nearby destination labels, exit badges and keyboard focus remain available.
  Obsolete floating gate thumbnails and generic scenery glyphs are removed.

## Assets and budgets

Original generations and exact built-in imagegen prompts are in
[assets/landscapes](../../assets/landscapes/README.md). The existing
[lossless export tool](../../scripts/world_assets.py) produces the runtime WebP
files and verifies decoded RGBA equality. No source bitmap is resampled or edited.

The renderer retains at most two regional atlases plus two general landscape
atlases and one tower stonework atlas, loaded on first visiting the cemetery or
tower. The three shared sheets occupy about 18 MiB of decoded RGBA data (the
tower sheet adds 6 MiB); the regression bound is 19 MiB. Ground chunks retain
the existing 28-canvas bound (28 MiB), with one prefetch per visual interval.
These are backing-store estimates, not total browser/GPU memory measurements.
Physical-device budget acceptance remains open; do not infer it from desktop tests.

## Ghost tower stonework

`ghost-tower-stonework-v1` uses a six-prop transparent atlas: ascending stairs with
a broken arch, a recessed descending stairwell, a carved burial chest, two
headstones and a broken obelisk. Weathered limestone, moss and worn edges match
the surrounding painted architecture. The entrance and rooftop use all four
burial silhouettes; rooftop rows clear the interior wall.

`world-renderer.js` owns these visual props and measured atlas rectangles. Stairs
sit beneath actors; upright grave markers use foot-depth sorting and fade when
covering the player. Low effects retains both stairs and burial markers.
`region.js` fits each stair interaction to the painted bounds and routes taps to
the existing gate position. Direction and nearby destination labels sit on the
steps, leaving the approach clear. IDs, arrivals, collision and saved positions
are unchanged; this revision needs no layout migration.

During loading or a failed atlas request, ground-painted stairs and graves remain
available. Retry replaces the fallback and clears cached ground chunks without
changing the save. Source and prompt: [tower assets](../../assets/landscapes/README.md).

## Verification and review

Run `python tests/landscapes_check.py --browser chrome` for all forty maps:
reciprocal gate reachability, services, wildlife quotas/positions, world-space
shading continuity, atlas loading, bounded caches and ordinary phone viewports.
Tower checks exercise all eight stair transitions by tapping the side of the
painting, low-effects grave visibility, and failed stonework download/retry.
The suite uses disposable browser contexts. Screenshots and reports are generated
under ignored `tests/artifacts/`; they do not belong in Git.

Review the birch meadow, willow mill, copperleaf kiln, lost library, mountain
watch, basalt cave and rooftop cemetery in play. Check that landmarks are
recognizable, paths and targets remain readable, and large props feel correctly
scaled on the intended phone. This named implementation request does not approve
the final art direction, physical-device budget or external release.
