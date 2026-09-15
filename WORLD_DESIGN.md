# The Six Reaches — commercial world design

> Current prototype override — Patch20 (2026-09-13): all configured Echo chances
> are **15% for testing**, with faster wild levels/XP and persistent injuries.
> The visual World Atlas, direct information signs, physical Supply Store and
> free village recovery, open roads, six spatial boss domains and Sheet-backed
> creature placement are implemented locally. See [Patch20 delivery and validation](PASS20_VALIDATION.md).
> The10% /0.01% figures elsewhere remain **release proposals**, not live test odds.
> This does not accept any commercial criterion or implement online boss loot.

Design revision 2 · 2026-09-11 · **Local world implementation in pass 15; commercial acceptance pending**

## Decision and product promise

Build a compact, handcrafted **2.5D illustrated world** for the existing browser game:
painted ground, layered scenery, directional character sprites, soft contact shadows,
and readable paths. The appeal is “find a creature living somewhere believable,
earn its Echo, and bring an individual home.” Combat preparation supplies depth;
exploration supplies curiosity and attachment.

Use Ragnarok Online as a spatial/readability reference and Sword x Staff as a
presentation/fluidity reference, not as an asset source or a promise of equivalent
production quality. The [official Sword x Staff page](https://swordxstaff.boltray.com/)
is the product reference; its proprietary implementation is not established here.
The supplied deep-search document is reference material, not authorization for its
Unity/cloud/100,000-DAU architecture. Keep the browser prototype and its tested
combat model; do not start an engine rewrite to solve an art problem.

Launch scope stays **100 species, six regions, 24 large exploration maps, six
towns and six compact boss domains**. Region levels communicate danger but do
not invisibly lock roads. This is materially larger than a cheap two-class combat demo. There is
no honest assurance that solo, zero-paid-asset production reaches this quality
on a short schedule. Stage production and measure throughput before committing
to a release date. The user's $1–2k server/marketing allowance is not an art budget.

Pass 15 implements the local world layer: authored route geometry and habitats,
six illustrated biome atlases, a shared nine-material ground atlas, 30 landmarks,
physical gate walking, cave collision, chunk rendering and a persistent field journal.
See [implementation and owner validation](PASS15_VALIDATION.md) for exact coverage
and outstanding quality gates. Production targets below remain targets, not a
claim of accepted commercial artwork or player-tested pacing. Ordinary material
drop proposals, final creature animation packages, online authority, groups,
monetization and release certification remain separate unfinished work.

## What changes from the placeholder

| Current limitation | Final design requirement | Validation |
| --- | --- | --- |
| Repeated tree circles and cross-shaped routes | Each map has an authored silhouette, landmark and route topology | Identify 20/24 unlabeled map thumbnails in an internal blind review |
| Tiny isolated habitats in large empty spaces | Multiple visible resident pockets and sensible travel routes | Time ten actual hunting circuits per map; no unintended empty travel over 15s on the primary route |
| “Menu destination” feeling | Physical town exits, continuous camera movement, consistent neighboring geography | Walk all exits both directions; preserve arrival direction and location |
| Generic combat backdrop | Battle clearing inherits biome, weather palette and landmark cues | Six matching combat environment kits; no jump to an unrelated scene |
| Repetitive SVG body families | A separately approved creature silhouette and signature action for every species | See CREATURE_DESIGN.md, not a count of recolors |
| Large result interruption | Return on the simulation's terminal win tick; loot over the restored world | Implemented this pass for monster encounters; test no-drop and save failure |

These are project acceptance targets, not achieved usability scores.

## Art direction: “a sanctuary beyond the trail”

Mood: welcoming adventure with pockets of mystery; no gritty photorealism.
Objects have a broad readable silhouette, one secondary detail group and restrained
surface texture. Faces and interactables receive the highest local contrast.
Backgrounds are quieter and slightly less saturated than actors. Avoid a glow
around every rare thing: rarity should not wash out composition.

Camera: fixed oblique overhead, north stays up, no rotation; approximately 35°
downward visual projection as the first art test, not a required 3D camera.
Keep simulation coordinates in existing world units and separate render projection.
Actors anchor at their feet, not the center of the illustration. Ground ellipses
establish scale; foreground canopy fades when it would cover the trainer or target.

Layer contract, back to front:

1. Distant backdrop/parallax beyond playable boundaries.
2. Ground tile chunks: grass, soil, path, shallow water, rock.
3. Flat decals: roots, flowers, stepping stones, tracks.
4. World actors, trunks, props and lower walls sorted by ground-contact Y.
5. Overhangs/canopy/bridge occluders, with explicit fade volumes.
6. Local lights, restrained particles and weather.
7. Names, interaction outlines and HUD; never baked into art.

Current exploration presentation deliberately omits wild species nameplates so
the field reads as a habitat rather than a stack of UI tags. Accessible labels
and the combat HUD still identify creatures. The World Atlas is a drawn nautical
chart over the real road graph: each reach has its own coastline, terrain marks,
water/current detail and a hover/focus card with its average resident level.
That level is green at or below the trainer, yellow up to five levels above, and
red beyond five; the color is guidance, not an unlock or combat modifier.

Cliffs and water have authored collision boundaries matching their visible edges.
Do not use decorative trees as invisible walls. Elevated paths use explicit
walkable layers and ramps; prohibit walk-under/walk-over ambiguity until the
layer system exists. Rivers are shore/bridge play at launch; no swimming, boat
or underwater traversal is added.

### Six biome kits

| Region / level entry | Palette, shape language and materials | Signature scene / ambient motion | Town character |
| --- | --- | --- | --- |
| Mosslight / 1 | Sage, buttercream, warm bark; rounded hills, broad leaves | Giant hollow oak, sunlit seed motes, slow branch sway | Cottage roofs wrapped around a communal seed garden |
| Willowbrook / 8 | Teal, silver, wet clay; ribbons and arching reeds | Working waterwheel, reflected willow canopy, ripples | Raised timber walkways and a dry central market |
| Amber Hollow / 20 | Ochre, copper, dusty violet; fans, terraces, exposed strata | Resin quarry and copperleaf groves, falling leaves | Clay courtyard, terraced kiln workshops; safe warm light |
| Moonwell / 40 | Indigo, pale jade, moonstone; circles, broken arcs | Tilted observatory rings reflected in a still basin | Sanctuary built inside a repaired astronomical ruin |
| Windstep / 60 | Sky blue, chalk, desaturated gold; diagonals and swept forms | Giant wind harp, moving cloud shadows, bending grasses | Low shelters tied to stone anchors; windbreak market |
| Ashen Reach / 80 | Charcoal, rust, turquoise vents; fractured slabs and heat-shaped curls | Glass caldera with a living orchid oasis; light ash | Heat-shielded basalt settlement around a cool spring |

Each kit budget: 6 ground material families with edge/corner transitions,
8 tree/large-foliage silhouettes where appropriate, 8 rocks/cliffs, 12 small props,
6 medium props, 4 ruin/architecture modules, 3 water/edge treatments, and 3 restrained
ambient effects. Reuse compatible shapes within a biome, with authored placement.
These are production caps to test, not justification for making every map identical.
Add one hero landmark per exploration map and one per hub: **30 hero landmarks**.

Town service layout is consistent in function, distinct in architecture:
arrival → Keeper/information → enterable shops and themed halls → city waystone.
Current city/grid behavior is owned by [the city contract](features/world/CITIES.md).
Forest/cave exits are visible physical structures, not a row of text buttons.
At least one exit is visible on arrival. Reading signs and accessing services is
possible without crossing hostile habitats.

## Topology, scale and traversal

A region has an open field, forest, landmark area and cave, plus its town.
Connect neighboring regions through believable roads at landmark areas.
Keep existing IDs for save migration, but replace the generated four-map ring
with authored connections as each map is rebuilt. Maintain full connectivity;
do not silently send a returning player to an arbitrary town.

Measure **shortest valid opposite-edge walking routes**, not map image width.
At 210 units/s, minimum 30s requires 6,300 traversable units. Target 45–90s for
ordinary edge-to-edge travel, 2–4 minutes for a useful local loop including
several fights. Hubs are intentionally smaller and exempt. No stamina, paid
mount advantage, or mandatory daily travel tax.

Per exploration map:

- One clear primary through-route with a strong destination landmark.
- Two optional loops: a safe ordinary hunt and a riskier/later habitat route.
- Three landmark tiers: skyline anchor, local navigation marker, close discovery.
- Species rosters are assigned per map. Individual lives occupy random dry,
  reachable positions across that map, not fixed habitat pockets. Pass17 quotas
  are Common8/Uncommon5/Rare1 per species; test density before commercial approval.
- A sheltered pause point and one ordinary reward/discovery point.
- One contextual NPC role (lore, route warning or challenge) when useful; reused
  characters can travel, rather than commissioning a unique speaking cast of 24.
- An accessible return route. No dead-end trap that requires defeating a rare enemy.
- Rare species have one resident and a real60s replacement timer after death.
  Ordinary residents are replaced elsewhere immediately, never at the corpse.

### Authored map roster

Residents are the exact live IDs in CREATURE_DROPS.md. Authored ecology below
informs scenery and species inspiration, not hard-bounded spawn pockets.
Pass17 random placement excludes water and unreachable cave rock. Future flying/
swimming locomotion can broaden this only after its navigation is implemented.
The “hook” column is a planned encounter/layout distinction, not a new loot promise.

| Map ID / name | Main landmark and route geometry | Habitat and encounter hook | Target crossing |
| --- | --- | --- | --- |
| clearing-0 · Firstlight Meadow | Hollow oak beside a curved farm road; two creek bridges | Four solo-safe starter pockets, separated by visible terrain | 50–65s |
| clearing-1 · Fernpath Woods | Split fallen tree; figure-eight under two canopy gaps | Acornboar foraging loop, moss nursery; Seedhare seed bed off the main trail | 55–75s |
| clearing-2 · Elderroot Glade | Living root cathedral; crescent around a shallow pool | Dewfin over the pool, Cloverbug roots; five-small-enemy challenge in a clear side arena | 55–70s |
| clearing-3 · Rootveil Cave | Roof-open sinkhole and hanging roots; ring plus short spur | Reedwren/Leafmantis at daylight shafts, Glowcap darkness, Briarcrab seep | 55–80s |
| brook-0 · Brookside Fields | Waterwheel and braided banks; two bridges with distinct silhouettes | River residents remain near water; Lumimoth near shaded mill garden | 50–70s |
| brook-1 · Rainwillow Forest | Bent willow tunnel; river fork and bank circuit | Lotusmanta pool, Glassshrimp light shafts, Ripplelynx stepping stones | 60–80s |
| brook-2 · Reedwatch Banks | Raised reed watchpost; long levee with dry side loops | Rainram wet meadow, Heronveil bank, Mudmole exposed burrows | 50–70s |
| brook-3 · Springwater Cave | Twin spring chambers; broad lower path and upper dry gallery | Siltwyrm channel, Lilydeer at skylit spring, Mistseal vapor shelf | 60–85s |
| hollow-0 · Amber Heath | Exposed amber ridge; terraced S-road | Copperhog warm banks; Cindrake nest is a visible optional climb | 50–75s |
| hollow-1 · Copperleaf Forest | Copperleaf crown over a disused kiln; horseshoe paths | Sunscarab sun patches, Ochrewisp shaded roots; trainer challenge near kiln | 55–75s |
| hollow-2 · Sunfall Basin | Broken aqueduct and resin pools; outer rim and basin shortcut | Bronzebuck ridge, Thistlehare thorn island; no damage from decorative resin | 60–80s |
| hollow-3 · Emberglass Cave | Glass-lit fissure; two connected chambers | Marigoldia/Saffronmoth in sun fissure, Flintjackal dry cave floor | 60–85s |
| ruins-0 · Moonlit Gardens | Broken moon dial; axial avenue with garden loops | Moonrabbit reflective lawns, Runecrab masonry moat, Frostfang shade | 50–70s |
| ruins-1 · Whisperwood | Suspended library fragments; bent path around shallow fog basin | Duskmarten library den; Lanternslug trails mark the return path | 55–80s |
| ruins-2 · Fallen Observatory | Tilted armillary sphere; concentric arcs with three radial cuts | Mirrormantis glass court, Dreamtapir mist pond, Moongolem stones | 60–85s |
| ruins-3 · Moonstone Cave | Underground bell vault; asymmetric double loop | Echochime vault, Pearlwyrm stream, Inksprite abandoned scribe niche | 60–85s |
| rise-0 · Windstep Prairie | Colossal wind harp; broad diagonal grass paths | Stormowl perch and Galeibex ledges visible from safe ground | 50–75s |
| rise-1 · Skybough Forest | Wind-bent trees spanning a ravine; two grounded routes | Skyrabbit gliding displays, Tempestcub sheltered hollow | 55–80s |
| rise-2 · Highwind Escarpment | Ruined signal mast; switchback plus broad inner shelf | Fluffyak windbreak, Kitejelly updraft, Stormstilt seep pools | 60–90s |
| rise-3 · Thunderhollow Cave | Daylight chimney and suspended mineral sails; ring around shaft | Zephyrlynx ledge, Prismwasp mineral nest, Skycorolla air current | 60–85s |
| ashen-0 · Ashgrass Expanse | Cooled lava river and green oasis; braided safe ridges | Emberorchid cooling pools, Magmatoad warm stones, Pyrewolf ash trail | 50–75s |
| ashen-1 · Cinderwood | Charred orchard with fresh shoots; branching loops | Basalturtle gardens, Glassphoenix high perch, centipede fallen trunks | 55–80s |
| ashen-2 · Obsidian Approach | Cooling tower ruins; terraces with an open basin | Coalbadger cooling burrows, Steamaxolotl vents; final road warning | 60–90s |
| ashen-3 · Deepember Cave | Glass caldera seen through cold-water fault; two large chambers | Auroradrake at thermal boundary, Moltencoil hot ledge, Sootimp ash alcove | 65–90s |

### First production map: Firstlight Meadow blockout

Keep the current 10,500 × 10,080 simulation envelope initially. Coordinates
below document the original blockout proposal. Pass 15 keeps its principal starter
and oak placements; authoritative current positions are in world-layout.js.

| Anchor | Proposed world coordinate | Purpose |
| --- | --- | --- |
| West arrival | (180, 5040) | Sightline to road, Keeper marker, first fox; 2–4s to first interaction |
| Emberfox pocket | (750, 5100) | Immediate optional fight; off the safe center of the road |
| Old cart / fork | (1900, 4700) | Choose creek or oak; map introduction without forced modal |
| Stonehorn pocket | (2650, 3900) | Rock outcrop previews tank silhouette |
| Hollow oak hero landmark | (4900, 4600) | Visible from three route segments; gathering point |
| Bloomslime nursery | (5200, 6100) | Circular flower patch; teaches support ecology |
| Tideotter shallows | (7000, 4400) | Waterbank animation and second route bridge |
| Eastern lookout | (9250, 5100) | Destination visible before the final approach |
| East exit | (10320, 5040) | Continues geographical road into the next map |
| Northern exit approach | (5300, 180) | Ordinary path to a future connected landmark |
| Southern approach | (5000, 9900) | Independent traversal axis, not a short teleport |

Primary west-east polyline length: approximately 10,500–12,000 units after
collision-safe bends, 50–57s at base speed. Verify with the actual pathfinder;
this estimate is not a measured result. North-south routing must independently
meet the minimum. The first local fox/cart/oak loop should be useful without
requiring the whole crossing.

Start with four silhouettes at combat scale, a road/grass blend, one large oak,
one creek module, one bridge, one cart and six foliage props. Validate composition
in grayscale before detailed painting. Do not polish a vast single background
image: it cannot support occlusion, camera scale changes or editable habitat layout.

### Cave production slice: Rootveil

Three connected spaces: daylight mouth → root gallery → sinkhole chamber.
A returning loop reconnects the sinkhole to the entrance rather than forcing
a complete backtrack. Roof gaps establish why birds and mantises live here.
Mushrooms mark safe edges; a shallow stream distinguishes the crab pocket.
The visible end of a dark branch contains a discovery, not an empty corridor.
Fog never hides targeting or collision. Cave entrances remain readable at 390px.

## Encounters and uninterrupted play

Wild actors idle/wander inside a home polygon, return to it, and never block a
required exit. Occupied/defeated/pending states are distinct. Initial release
keeps click-to-engage rather than surprise auto-aggro; packs are explicitly labeled.
The final render layer can reuse the same actors and ground region for the arena
transition, but combat still runs through the tested simulation contract.

Transition targets: input feedback within 100ms, cached battle preparation
within 300ms, no unskippable camera spectacle. On terminal victory, restore
saved position/camera and show earned drops immediately; no manual result gate.
This pass implements the functional return. Production rendering must preserve it.

Do not leave a pack after its first monster dies: victory requires clearing the
encounter with the trainer alive. Trainer duels retain results. Losses show the
reason and a clear retry/return action; previously accepted kills stay accepted.

The loot popup must remain honest on failure: show pending, not “saved.”
For production, confirmation is server receipt state; current browser confirmation
means local storage only. Repeated clicks cannot issue additional loot draws.

Boss locations: Elderroot in the glade's root arena; Tidecrown at the oldest spring;
Ambercolossus below the resin quarry; Moonweaver in the observatory vault;
Tempestrook at the signal summit; Cinderempress in the caldera garden.
These are six bespoke group encounters to design and implement later, not merely
enlarged wild sprites. Practice remains visibly separate and reward-free.
A boss essence is extraordinarily rare, **not limited to one per realm**.

## Technical art and browser delivery plan

Retain immutable content IDs and combat events. Introduce a renderer boundary
(WorldRenderer.mount/update/dispose) and chunk manifest without moving economy
into drawing code. Separate collision/paths, encounter data, art placements and
ambient effects so art iteration cannot rewrite loot or saves.

Start with a small Canvas2D world-rendering spike behind the existing interface;
keep accessible DOM controls for menus/interaction and a low-detail fallback.
Profile it before choosing WebGL acceleration or a third-party renderer. No
framework, library license or GPU compatibility claim is assumed here.

Use spatial 1024-world-unit chunks, visible set plus one-ring prefetch, and a
bounded least-recently-used asset cache. Keep simulation persistent outside the
rendered set. Prefetch destinations near exits; world streaming stays silent
while fallback ground remains interactive. An actual unavailable asset shows a
truthful failure state without teleporting or resetting spawn lives. A 2048² RGBA texture
alone is approximately 16 MiB uncompressed, so compressed download size is not
a memory budget. Avoid loading all 100 full-resolution creature sheets on startup.

Primary-source rationale: separating design/art layers and streaming nearby
world content is described in Jane Ng's
[Making the World of Firewatch](https://media.gdcvault.com/gdc2016/Presentations/Ng_Jane_MakingTheWorld.pdf),
slides 22–38. We apply that general organization principle; its Unity tools,
team size and delivery schedule are not ours.

| Budget / quality gate | Proposed target and measurement |
| --- | --- |
| Desktop animation | 60fps target; p95 frame interval ≤20ms on an agreed integrated-GPU reference laptop, 5-minute route/combat trace |
| Mobile fallback | Stable 30fps target, p95 frame interval ≤40ms on an owner-selected physical Android device; reduced weather/canopy |
| Main-thread animation work | Target under 10ms at 60Hz, measured with browser performance traces |
| Cold first play | ≤3 MiB critical first-play payload, ≤10 MiB total starter payload loaded progressively; ≤5s interactive under a defined 10Mbps/50ms test profile, with a visible loading state |
| New biome download | ≤6 MiB compressed plus on-demand creature sheets; prefetch only likely next content |
| Runtime memory | Starter-scene working-set growth ≤200 MiB over blank game shell, peak resident textures ≤128 MiB; instrument, do not infer from file size |
| Interaction and movement | Visible acknowledgment ≤100ms; no one-frame input lock on loot dismissal |
| Touch / readability | ≥44 CSS-pixel primary targets, visible focus, 390px no horizontal page overflow; element also encoded by icon/text |
| Accessibility | Reduced motion stops bob/shake/weather; contrast and keyboard task audit; no vital cue depends on sound or color alone |
| Stability | 30-minute map/battle/menu soak, 100 travel transitions, no unbounded entity/listener/texture growth |

The browser pipeline has only about 16.7ms per 60Hz frame; Google recommends
leaving browser overhead and avoiding unnecessary layout/paint work.
See [Rendering performance](https://web.dev/articles/rendering-performance).
The numbers above are our proposed acceptance budgets, not measured current results.

## Economy and commercial-risk gate

Keep gameplay free and cosmetics cosmetic. No paid Echoes, drop boosters, stat
skins, faster movement, encounter access, competitive storage advantages or
paid fixes for low drop rates. Duplicate individuals are legitimate build choices;
do not turn the second copy into a purchase or forced merge mechanic.

For independent probability p, chance of ≥1 drop after n kills = 1−(1−p)^n.
Expected kills = 1/p; q-quantile = ceil(log(1−q)/log(1−p)).

| Echo chance per eligible kill | Mean kills | Median | 95th-percentile kills |
| --- | ---: | ---: | ---: |
| 10% starter | 10 | 7 | 29 |
| 0.01% other current Echo rows | 10,000 | 6,932 | 29,956 |

At a hypothetical **six eligible kills/minute**, 0.01% averages 27.8 hours of
killing; 95th percentile is 83.2 hours. Actual rare-species search/availability,
travel and grouping add time. This is math, not a forecast of player behavior.
Pass17 rare species have one map resident and a60s replacement delay, followed
by searching for the replacement elsewhere. Ordinary species have larger counts
and no cooldown. The former3%/240s availability checks are retired. Do not describe
all nonstarters as realistically collectable in a short campaign; none of these
population changes modifies their0.01% Echo rate.

Release risk: four easy-to-acquire starters and 90 nonstarter wild species at
0.01% can make the collection system feel absent for ordinary players. We are
**not changing that rule without approval**. Require a blind playtest showing
satisfying common-team progression and build variety during sustained no-Echo
sessions. If it fails, revisit acquisition with the owner before launch, rather
than monetizing frustration or adding concealed pity. New ordinary material
proposals in CREATURE_DROPS.md reward hunts but do not solve lack of companion variety.

Cosmetic opportunities: trainer outfits, readable alternate palettes/materials,
Inner Sea scenery and ritual flourishes with identical timing. No cosmetics
hide targeting, alter silhouettes beyond identification, or make rarity mean power.
Do not scope a full furnishing/AFK minigame before the hunting loop is enjoyable.
The stashed mastery/evolution systems remain separate.

## Production sequence and exit gates

| Stage | Deliverable | Exit evidence |
| --- | --- | --- |
| W0 · composition lock | Firstlight grayscale blockout, one battle clearing, Druid + Emberfox + Stonehorn lineup | Owner approves actual 390px/1440px screenshots; path timing and silhouette tests pass |
| W1 · reference slice | One fully dressed map, town entrance, four starter creatures, all required animation states and loot-return flow | 5–8 outside players can find/fight/summon/equip without coaching; record failures, not just preference ratings |
| W2 · repeatability | Rootveil plus one Willowbrook map; first 12 creature production packages | Art style transfers to cave/water; timing/memory budgets pass; log person-hours and rework |
| W3 · region batches | Finish Mosslight/Willowbrook, then one region at a time; all 100 species and 30 landmarks | Per-map and per-creature matrix, no placeholder accepted as production |
| W4 · campaign + groups | Ordinary-team route progression, six real boss sources, server receipts/reconnect | Commercial F-001–F-066 dependencies and group tests, not local simulation alone |
| W5 · release candidate | Physical devices, accessibility, asset rights, beta, support and operations | 30–50-player closed playtest for qualitative/operational evidence; formal G3 free beta still requires 100–300 newcomers and mature cohorts under VALIDATION_PLAN.md |

Critical path: approve style → prove a repeatable asset pipeline → produce remaining
maps/creatures → balance real campaign → release gates. Implementation and art can
iterate together but not count unfinished assets as accepted to accelerate a date.

Estimate from measured W2 throughput:
remaining effort = remaining creature packages × observed median hours/package
+ remaining map kits × observed median hours/map
+ unique landmarks + integration + test/rework allowance.
Track concept, paint, rig, animation, export and rejection separately. Do not
multiply the time for a generated portrait by 100 and call that a production estimate.
Keep at least 25% planning contingency until two biomes demonstrate repeatability;
this is a planning allowance, not a promised schedule.

Commercial hypotheses to test: creatures are recognizable and desirable; ordinary
combat gives meaningful build choices; hunting remains enjoyable without an Echo;
the world makes players curious; some players want purely cosmetic personalization.
Measure voluntary return, session reasons and confusion with consent. A beautiful
screenshot is useful marketing material, not evidence of retention or profitability.

## Definition of world completion

All 24 maps have distinct approved layouts, biome art and hero landmarks; all six
towns have physical readable exits and services; 94 wild species occupy authored
habitats; six boss species have real group acquisition; all 100 creature packages
pass CREATURE_DESIGN.md; timings/performance/accessibility meet the agreed device
matrix; no route or progression requires an ultra-rare drop; save/loot receipts
survive failure; commercial/server/legal/operations gates in the backlog pass.

Current implementation: pass 15 builds the 24 local route layouts and six hubs
together, with the six shared scene kits. The next acceptance step is an owner
walkthrough of Firstlight, Rootveil and a contrasting biome. Do not bypass the
outside-player, final-creature-art, physical-device or online gates just because
all maps now have illustrated scenery. See PASS15_VALIDATION.md.
