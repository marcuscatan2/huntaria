# Six Reaches — local world implementation
Patch20 update over the Pass15 authored world · 2026-09-13. Not commercial acceptance.
Current topology and city behavior: [Square world and cities](features/world/CITIES.md).
Current map scenery and asset budgets: [Landscape identity](features/world/LANDSCAPES.md).
Adventure tuning: [current playtest walkthrough](<features/opening/VALIDATION.md>).

## What is built

| World capability | Implementation | Validation |
| --- | --- | --- |
| 24 large maps / six towns / six boss domains | Stable IDs, 24 authored route specifications, six compact boss arenas, Cartesian grid and reciprocal border portals | 36-place atlas count/connectivity; reciprocal gates; route fixtures |
| Readable varied scenery | Forty landscape profiles, six regional atlases, two shared tree/ridge/ruin atlases, nine ground materials and themed city buildings | All-map landscape/navigation suite; desktop/phone screenshots; owner art review pending |
| Continuous exploration | Follow camera, 0.78 oblique Y projection, click routing, keyboard movement, physical multi-gate itineraries | Real movement-loop crossings and gate journey; no atlas teleport |
| Cave and water navigation | Walkable cave rooms/corridors, visible rock rims, water masks and explicit bridge polygons | Collision and A* reachability to gates, residents, landmarks, rest/cache/guide |
| Map-wide wildlife populations | 94 wild species retain source maps; Common8/Uncommon5/Rare1 per species, persisted random reachable positions; ordinary0s/rare60s replacement | Pass17 quotas, reachability, death/respawn, reload, reserved legacy-slot and write-failure checks |
| Environmental motion | Leaf/mote drift, tree sway, pool ripples, bounded idle wander | Reduced-motion/low-effects controls; frame sample; final motion review pending |
| Layering | Ground chunks below foot-Y-sorted props/actors; nearby occluder fade | Scene walkthrough/screenshots; collision footprint independent from sprite rectangle |
| Discovery | 72 wilderness + six town landmark identities; persistent visited maps and sightings | Walk up, discover, dismiss, reload; no hidden stat or loot reward |
| Town and trail interactions | Physical gates, Keepers, fighting NPCs and direct painted road signs. Enterable city shops sell earned-coin supplies; arrival heals the party automatically. City waystones connect the four starting cities. Edit builds and summon only in Loadout | Played city room/shop/waystone and field-recovery flows; optional packs still use resident lives |
| Battle continuity | Biome/cave-aware arena backgrounds; existing immediate wild-win return and loot popup | Real starter fight plus full pack/duel/save-failure regressions |
| Delivery resilience | Chunk LRU, two regional and two shared landscape sheets, ground fallback, silent progressive loading and concise failure/retry feedback | Bounded map transitions; aborted asset request/retry; real-time browser sample |
| World HUD | Cartesian 36-square atlas with shared-border roads, six boss domains, trainer-relative average-level hover/focus cards, local minimap, travel health, recovery and journal | Desktop/mobile, keyboard/modal, graph and exact green/yellow/red boundary checks; danger never becomes an invisible lock |
| Adventure stakes | Trainer-only opening values remain intact; lone wilds scale from 1× to 2.6× HP and 1.3× offense as the deployed party grows to three. HP persists across fights/reloads/build changes; Firstlight defeat restores at camp and other defeat rescues restore at their city | Exact scaling fixtures, seeded opening samples, played hunts, health/replay/migration/transaction assertions |
| Painted bridge and facing | Original timber bitmap aligned to actual crossing polygons, fallback/retry; sprite size independent of directional mirror, followers track actual movement | Pass17 played crossing/screenshots and canvas/portrait/vector left/right checks |

Current detail: [current playtest walkthrough](<features/opening/VALIDATION.md>). Historical population/facing detail: [population contract](<MAP_POPULATIONS.md>). Source-map species
assignments are fixed, but old habitat x/y values are ecology anchors only.
The world no longer draws fixed-spawn group markers. Birth coordinates live in
the profile, not the atlas. A four-map bounded connectivity cache avoids repeating
full-map path searches for every spawn.

No custom engine dependency, new account service, purchase, deployment or paid asset
was introduced. Bitmap scenery was produced with the imagegen skill; exact prompts,
source images and project asset paths are recorded in assets/world-v15/prompts.json.
These are original generated game assets, not extracted Ragnarok or Sword x Staff art.

## Source ownership

- atlas-data.js retains stable map IDs, dimensions and Echo rules; Sheet-backed
  creature region/source-level/availability fields drive non-starter habitats.
- world-layout.js supplies authored routes, landmark/habitat placement, bridge geometry,
  cave floors, deterministic scenery dressing and compact collision footprints.
- world-scenery.js supplies forty scenery profiles, measured prop frames, guarded
  verge placement and continuous world-space ground patches.
- world-nav.js performs bounded A* and collision-checked path simplification.
  Four maps of neighbor-edge tests are cached; art/camera never change movement speed.
- world-renderer.js paints ground chunks, clips atlas objects at runtime and mounts
  only visible scenery. It cannot grant items or write profile progress.
- region.js owns world controls, camera, interaction dialogs and combat entry.
  Authored `map.info` prose stays available to world-building tools but is not
  emitted on map entry or repeated in player-facing signs and Keeper panels.
- world-atlas.js renders the actual graph as an illustrated chart and derives
  region averages/status colors from current habitat and trainer levels.
- profile.js retains local save authority and adds only persistent landmark sightings.
- world-v15.css owns the presentation overrides.

The 24 large-map route/habitat/hero specifications and six compact boss arenas are authored; most small foliage dressing
is deterministic procedural placement within those layouts. Do not describe each
small prop as hand-placed or each generated image as a manually painted asset.

## Rendering and navigation budgets

World coordinates remain independent from CSS pixels. Base movement is 210 units/s;
hubs are exempt from the user's minimum 30-second opposite-edge crossing rule.
The sidebar displays authored route length. Tests additionally find actual valid
routes and check the Euclidean lower bound between opposite edges, which proves
no shorter-than-30-second route can cross the map. A smoothed grid route is not a
mathematical proof of the globally shortest walkable path.

Chunks cover 1,024 world units, rasterized at 512 square pixels, with at most 28
retained canvases (28 MiB for those RGBA backing stores). One-ring prefetch is
limited to one new chunk per visual interval. Six scene atlases are 1,254 square;
at most two are logically retained (about 12 MiB decoded). Two shared landscape
atlases add about 12 MiB. The material atlas plus
nine 384-square crops adds about 11 MiB. Browser/GPU/image caches, DOM surfaces,
combat assets and runtime overhead are additional: these estimates are not a
measured total-process memory claim.

Standard mode caps raster DPR at 1.5; low mode uses DPR1 and omits fine props and
ambient effects. Reduced motion stops scenery sway, motes and wildlife wander.
Click movement checks the same 20-unit actor collision radius as the movement loop.
A* caps exploration at 18,000 nodes and reports a failed path instead of teleporting.
Scenery download failure does not delete saves or produce an invisible progress gate.

## Scope boundaries that remain open

The original world plan's *commercial definition of completion* also references
the rest of the product. This local delivery does **not** complete those gates:

- All 100 final creature art/animation packages and six bespoke online group bosses.
- Server-authored spawn/kill/loot receipts, accounts, reconnect and group acquisition.
- The proposed ordinary material drop/crafting loop; current cache/coin/XP/Echo rules
  remain unchanged. Starter Echo10%, all other current wild Echo rows0.01%.
- Final soundscape, moving landmark mechanisms such as the waterwheel, directional
  production sprites and a proper elevated walkable-layer system.
- Approved final art, per-map blind recognition, uncoached outside-player pacing
  and collection testing. Repeated dressing is still visible; generated atlases
  are a shared production pass, not proof of a premium title's polish.
- Named physical phone/laptop performance, complete accessibility/rights review,
  production network failure certification and a 30-minute real-time release soak.
- Legal/commerce/operations/retention gates in the commercial backlog.

Nothing above is silently marked accepted. No authority to spend the owner's
server/marketing budget has been inferred. The stashed mastery/evolution ideas
remain untouched.

## Owner walkthrough

Use features/opening/VALIDATION.md for the current checklist and exact test evidence.
Review Firstlight at the normal start; then use the separate test adventure to
summon a level100-source QA Echo (owned at the launch cap60) and walk all six biomes. Test mode is isolated from the
normal profile, not an admin shortcut in a released economy.
