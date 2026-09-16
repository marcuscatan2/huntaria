# Bond & Bolt — start here

Local browser monster-taming prototype. Online accounts, authoritative rewards,
real multiplayer and payments are not implemented.

## Start

1. Read [AGENTS.md](AGENTS.md) for the change contract.
2. Choose one route below or in [FEATURE_MAP.md](FEATURE_MAP.md).
3. Read that feature's guide and actual source; follow connections only as needed.
4. Check affected tests and [owner gates](OWNER_REVIEWS.md) before dependent work.

## Find the feature

| Task | Start here | Connection |
| --- | --- | --- |
| Creation, Lv1–30 route, first Echoes and class choice | [Opening](features/opening/README.md) / [Campaign](features/campaign/README.md) | The first-Brimble summon and Forest Mage lead to four Lv20 classes, then [the courtyard raid and sacred treasures](features/campaign/SACRED_TREASURES.md). Farm and monster trees remain available at Lv25/30. |
| Test-mode travel, recovery, restart or playback speed | [Test controls](features/delivery/OPERATIONS.md#test-controls) | QA alone uses 3× travel, post-combat recovery and 5× playback; normal saves and tuning stay separate. |
| Background fights, Run, joiners, targets or stuck encounters | [Live encounters](features/shell/ENCOUNTERS.md) / [Combat](features/combat/README.md) | Anchors and ordered join/escape requests connect simulation, persistence and rewards. |
| Poses, class/NPC sprites, hit feedback | [Animation](features/animation/README.md) / [Supplied roster](features/animation/SUPPLIED_SPRITES.md) | Painted class sheets, cropped portraits and civilian NPCs share the rig with species sprites. |
| Square maps, cities, portals, walking or scenery crops | [World](features/world/README.md) / [Exploration](features/exploration/README.md) | The 36-square grid and four ghost-tower interiors connect portals and saved position; [landscapes](features/world/LANDSCAPES.md) define each map's scenery; [cities](features/world/CITIES.md) add buildings, rooms, healing and waystones. |
| Spawn density, wild levels, free healing | [Populations](features/population/README.md) / [Recovery](features/recovery/README.md) | Tripled roaming populations attack everywhere except Firstlight; saved lives connect to camp and village services. |
| Monsters, skills, levels, builds | [Content](features/content/README.md) / [Growth](features/growth/README.md) / [Party](features/party/README.md) | The reviewed Google Sheet snapshot owns creature identity; stable species/individual IDs and the Lv60 player/Lv100 engine boundary flow into combat. |
| Inventory, item popups, summoning, lost/duplicate progress | [Collection](features/collection/README.md) / [Game frame](features/party/GAME_FRAME.md) | Framed Bag actions and loot presentation use profile-owned items and individuals. |
| Sound, Settings, reduced motion | [Preferences/audio](features/experience/README.md) | Device choices affect presentation, never combat rules. |
| Inner Sea farming, defense or picture export | [Inner Sea](features/inner-sea/README.md) | A painted homestead inside the game frame connects habitats, training, defenses and care to saved progress. |
| Other features or an unclear bug | [Feature index](FEATURE_MAP.md) | Symptoms route to the owner and its connecting boundary. |

Feature guides link to root browser modules; do not create parallel copies.
For an exact route: `python scripts/project.py context combat`.
Also accepts `game.js`, `BondGame`, `F-002` or `combat-feedback`.

## Run and check

From this folder; Python 3.12+. No game package install or build step.

```powershell
python -m http.server 8765 --bind 127.0.0.1
python scripts/project.py check
```

The server runs until stopped; run checks in another terminal.
Open [play](http://127.0.0.1:8765/) or [isolated QA](http://127.0.0.1:8765/?test=1).
Use **Settings → Test mode** to switch between them inside the local game.
Keep normal saves untouched. [Setup, browser tests, Git checkpoints and troubleshooting](features/delivery/OPERATIONS.md).

## Other routes

- [Owner decisions](OWNER_REVIEWS.md): reviews due before dependent production.
- [Remaining scope](features/delivery/REMAINING_SCOPE.md): all 66 cards, delivered work and blocking decisions/resources.
- [Client package](features/delivery/CLIENT_BUILD.md) / [runtime probe](features/combat/RUNTIME.md): reproducible local build and browser/Node parity.
- [Development and scaling policy](docs/ENGINEERING.md): architecture decisions, authority and release boundaries.
- [Documentation index](docs/README.md): active scope and design references; past handoffs live in Git history.
- [Storage policy](features/delivery/OPERATIONS.md#repository-storage): disposable outputs and Git exclusions.
- [Tests](tests/README.md), [tools](scripts/README.md), [assets](assets/README.md), [data](data/README.md): container-specific instructions.
- [Deferred ideas](<Game notes.md>): stashed ideas are not implementation requests.

Update feature contracts in [architecture.json](docs/architecture.json); regenerate the index
and feature guides with `python scripts/project.py map --write`.
`project.py check` rejects stale routes, broken links and oversized entry guides.
