# Square world and starting cities

Review scope: **world-grid-cities-v1**. Implementation requested by the owner;
final visual, pacing and commercial acceptance are separate owner decisions.

## World contract

`atlas-data.js` assigns all 36 stable place IDs unique integer cells in a 6×6
Cartesian grid. `GRID_EDGES` owns ordinary connections. `world-layout.js` derives
reciprocal portals from each pair's shared border: west/east and north/south.
At most one portal occupies each edge. There are no diagonal or distant links.
An unconnected neighboring cell has no portal across its border.

Every city occupies one full cell and a 2,400×2,400 world-unit map. Fields keep
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

Buildings use their painted bounds as click targets and clear door points for
navigation/proximity. Entering opens an illustrated interactive room: speak to
its resident, inspect the visible props, or leave through its door/Escape. Room
position is presentation-only; the saved player remains at the outdoor doorway,
so reload safely returns outside. Shops sell the existing usable supplies through
the profile-owned purchase operation. Equipment inventory is not introduced.
Library books, the armillary, seed archive, lodge racks and training dummies have
flavor interactions without XP or item grants.

## Recovery, travel and saves

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

Run `python tests/city_world_check.py --browser chrome` for grid/portal geometry,
door paths, played building entry, shopping, themed room objects, arrival healing,
teleport/reload/rejection/save-failure cases and desktop/mobile captures. Run
`python scripts/project.py verify --browser chrome` for affected shared systems.
Screenshots/reports are reproducible under `tests/artifacts/city-*`.

For owner review: walk from Firstlight into Mosslight, enter its hall/shop, use
the waystone to visit the library, lodge and knight training hall, then compare
the atlas with the gate directions. Judge city identity, building readability,
NPC scale and travel/recovery feel before repeating this treatment in more regions.
OR-02/03/04/06 remain pending; automated tests do not approve art or pacing.
