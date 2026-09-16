# Square world and starting cities

Review scope: **world-grid-cities-v1**. Implementation requested by the owner;
final visual, pacing and commercial acceptance are separate owner decisions.
Current art correction: **city-perspective-v3**. Buildings and roofless rooms
use overhead scenery; the nine residents use the classes' upright, right-facing
three-quarter perspective, with clear faces and full standing silhouettes.

## World contract

`atlas-data.js` assigns all 36 stable place IDs unique integer cells in a 6×6
Cartesian grid. `GRID_EDGES` owns ordinary connections. `world-layout.js` derives
reciprocal portals from each pair's shared border: west/east and north/south.
At most one portal occupies each edge. There are no diagonal or distant links.
An unconnected neighboring cell has no portal across its border.

Every city occupies one full cell and a 3,600×3,600 world-unit map. Fields keep
their existing dimensions, terrain, habitats and species IDs. Town access is
through authored border portals; nearby fields have no generic return-to-town
shortcut. Boss domains connect to their cave. Firstlight's Forest Mage gate
still controls the opening. Regional wildlife levels remain danger warnings.

`world-atlas.js` draws the same cells/edges. Selecting a square never moves the
profile. **Walk here** follows real gates; WASD/Escape cancels walking.
The spatial inspiration is Ragnarok's [world map](https://irowiki.org/wiki/World_Map);
the generated artwork is original and not extracted from that game.

## City places

| Stable city | Theme | Enterable places |
| --- | --- | --- |
| `clearing-hub` / Mosslight Village | Druid grove | Elderbough Hall, Fern & Flask, The Conservatory |
| `brook-hub` / Willowbrook Town | Mage academy | Starfall Library, The Blue Retort, The Observatory |
| `hollow-hub` / Amber Crossing | Hunters' lodge | Wayfarers' Lodge, Trail & Tackle, The Tracking House |
| `ruins-hub` / Moonwell Sanctuary | Knight kingdom | Moonwell Keep, The Silver Anvil, Knight Training Hall |

Windstep and Ashenwatch retain their stable IDs and use the lodge/keep facilities.
`city-data.js` owns buildings, doors, resident dialogue, themed companion species
and the four-city waystone list. Class masters occupy the matching city
courtyards; campaign directions follow the master whose trial was won. Their
combat kits, rewards, trial IDs and specialization requirements are preserved.
Nine new human sprites supplement the four
existing civilians. [Asset sources and exact prompts](../../assets/cities/README.md).

## City neighborhoods

Scope **city-neighborhoods-v1** expands all six existing hubs from 2,400 to 3,600
units per side (2.25× the area). Each has the three
existing enterable public buildings, six homes, a workshop, three market stalls
and nineteen residents, in addition to its Keeper and campaign NPCs. Homes,
workshops and stalls dress the outdoor streets; the original hall, shop and
annex retain their room and supply interactions and stable IDs.

| City | New quarter | Layout and landmarks |
| --- | --- | --- |
| Mosslight | Orchard Green | Bent garden lanes, nursery, planted square and leafy homes |
| Willowbrook | Lantern Quay | Canal, bridges, blue-roofed homes and bookbinders |
| Amber Crossing | Caravan Market | Broad market circuit, timber yard and copperleaf trees |
| Moonwell | Banner Square | Formal streets, oath steps, armorers and practice yard |
| Windstep | Highwind Terrace | Angled terrace roads, pine trees and lodge houses |
| Ashenwatch | Ember Ward | Forge courtyards, replanted yards and stone houses |

`city-data.js` owns the neighborhood streets, outdoor buildings, furniture,
residents and deterministic `stepResident` routine. The exploration view routes
couriers and patrols through `BondNav` before advancing them, preserving their
positions across local actor rebuilds. Selecting a moving resident holds them
still while the player approaches. `city-view.js` validates conversation against
the resident's current visible position. Dialogues, hidden pages and inactive
exploration pause routines. Work/walk embellishments honor reduced motion.
These ambient routines never award items, change quests or write saves.

Hall/shop, master, Keeper, waystone and cache positions remain intact. The annex
and its nearby resident move south to clear the wider city's west approach;
their stable IDs and room roles remain unchanged. New door thresholds sit beyond
their building's collision footprint. Border approaches join an outer lane;
the six-cell adjacency is unchanged.
Canal collision and visible bridges use the same world geometry. Saved city
positions use the existing safe-point normalization if new scenery overlaps them.

Twenty new painted atlas frames provide homes, workshops, stalls, fountains,
benches, lamps, carts, wells, practice equipment and seedling beds. Furniture
remains visible in low effects. Each atlas decodes lazily and is cached once;
only visible scenery has DOM nodes. Sources, measured crops and prompts are in
`assets/cities/neighborhoods.json` and `assets/cities/street-furniture.json`.

### Class identity

Scope **city-identities-v1**, layout revision 24, gives each city its own road
material, gathering-place geometry and painted civic landmark. The same material
continues through the arrival courtyard, residential lanes and main square.

| City | Paving | Gathering place and daily use |
| --- | --- | --- |
| Mosslight / Druids | Irregular limestone stepping stones with living moss seams | The Listening Oak, an organic root grove where gardeners and herbalists tend and share plants |
| Willowbrook / Mages | Cool blue diamond mosaic with brass inlay | The Open Observatory, an octagonal study court with an armillary, charts and scholars |
| Amber Crossing / Hunters | Rough ochre setts in packed earth | The Expedition Table, an uneven provisioning yard where scouts plan routes and pack supplies |
| Moonwell / Knights | Orderly pale limestone blocks with slate borders | The Oath Steps, a rectangular muster square with standards, drill marks, a captain and an armorer |
| Windstep / Highland scouts | Layered blue-grey slate | The Wind Cairn, an angular terrace with a weather vane, route charts and climbing supplies |
| Ashenwatch / Smiths | Soot-worn terracotta brickwork | The Common Hearth, a communal forge yard with an anvil, charcoal and working smiths |

The class landmarks replace the shared fountain/paired-bench centerpiece.
Seedling beds belong to the druid gardens; the mage city retains a quiet seat
beside the canal. Resident IDs and all quest/service positions remain stable.
Each landmark has a solid footprint; attending residents remain reachable.

`world-renderer.js` paints the road network with six cached 256-square material
tiles from `assets/cities/civic-paving.png`. Pattern coordinates stay in world
space, including chunk edges; courtyard patterns use a stable local origin.
The source plus tile cache uses 7.5 MiB of decoded RGBA storage. A failed paving
download retains solid fallback colors and navigation; the renderer's existing
retry clears affected city chunks after loading. Landmark art decodes through
`city-art.js`; `assets/cities/civic-landmarks.json` and `civic-paving.json` record
source/reference hashes, original prompts and measured crops.

Buildings use their painted bounds as click targets and clear door points for
navigation/proximity. Entering opens an overhead interactive room: speak to
its resident, inspect the visible props, or leave through its door/Escape. Room
position is presentation-only; the saved player remains at the outdoor doorway,
so reload safely returns outside. Shops sell the existing usable supplies through
the profile-owned purchase operation. Equipment inventory is not introduced.
Library books, the armillary, seed archive, lodge racks and training dummies have
flavor interactions without XP or item grants.

`city-art.js` preserves native sprite transparency, measures the source row
boundaries and keeps each interior's original aspect ratio on desktop and phones.
Roofs, furniture tops and low wall caps establish the overhead environment view.
People share the playable trainers' camera and facing. Building/room sources use
text-only generation; resident edits use this project's NPC and Hunter artwork.
All 21 frames, exact prompts, source hashes and the limits of the local
duplicate audit are recorded in `assets/cities/prompts.json`.

## Recovery, travel and saves

Walking or using a waystone into a city heals the party silently; arrival adds no
persistent welcome/healing message to the exploration HUD.

`BondProfile.transition` validates proximity, unlock and active-encounter state
inside the same critical save transaction as arrival. Entering any city restores
the trainer and every owned companion, including fallen and unequipped copies.
Later defeat rescues also restore health at their destination city; Firstlight
still returns to camp. Existing injured city saves recover when loaded between
encounters. Cities have no heal button or sanctuary interaction. Field camp rest
and portable medicine remain available; changing class in the field does not heal.

The visible **City waystone** opens travel to the other three starting cities.
`BondProfile.teleport` rechecks physical waystone proximity, the opening gate,
destination allowlist and absence of an encounter inside a critical transaction.
Arrival is beside the destination waystone and heals the party. It costs nothing
and grants no loot, XP or spawn refresh. Save failure retains the origin and
possessions. Atlas selection and remote city-service calls grant no teleport.

## Validation and owner review

`field-interactions-v1` removes defeated NPC challenges from dialogue buttons,
field action labels and Keeper shortcuts. Existing open panels update when the
profile records victory; the NPC remains available for conversation and quests.
The profile still rejects rematches independently of presentation.

Wayfarer caches use the shaded three-quarter chest drawn by `region.js`, with
wood panels, brass bands, a keyhole and ground shadow. `city.css` supplies its
desktop/phone tap bounds and nearby highlight. The static SVG stays readable in
reduced motion and requires no additional texture. Collection remains a single
profile-owned reward; collected caches disappear and stay gone after reload.
City caches stand on the city paving, clear of waystone art and its tap bounds.
Collection IDs and the cache positions established by field-interactions-v1
are preserved by the neighborhood expansion.

Run `python tests/city_world_check.py --browser chrome` for grid/portal geometry,
door paths, played building entry, shopping, themed room objects, arrival healing,
teleport/reload/rejection/save-failure cases and desktop/mobile captures. Run
`python scripts/project.py verify --browser chrome` for affected shared systems.
Screenshots/reports are reproducible under `tests/artifacts/city-*`.

The same suite checks all six neighborhoods, citizen movement/collision,
selected-resident phone conversations, reduced motion, source/crop hashes and
bounded decoded atlases. Neighborhood captures are
`tests/artifacts/city-<region>-neighborhood-chrome.png` and
`tests/artifacts/city-neighborhood-phone-chrome.png`.

For owner review: walk from Firstlight into Mosslight, enter its hall/shop, use
the waystone to visit the library, lodge and knight training hall, then compare
the atlas with the gate directions. Judge city identity, building readability,
NPC scale and class-matched facing, scenery perspective and travel/recovery feel before repeating
this treatment in more regions. Review all three source sheets in the city gallery.
OR-02/03/04/06 remain pending; automated tests do not approve art or pacing.

## Class quest continuation

After specialization, the chosen master remains in its courtyard for the [sacred treasures quest](../campaign/SACRED_TREASURES.md): automatic raid, Echo hand-in, Tully directions and one class weapon. The cemetery entrance retains `hollow-2` and connects four ghost-tower interiors.
