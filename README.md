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
| Creation, Lv1–30 route, first Echoes and class choice | [Opening](features/opening/README.md) / [Campaign](features/campaign/README.md) | Receipt-backed milestones connect the first-Brimble Bag summon, Forest Mage road gate, demonstrations, fixed bosses, four Lv20 classes, the Lv25 farm and Lv30 monster trees. |
| Test-mode travel, recovery, restart or playback speed | [Test controls](features/delivery/OPERATIONS.md#test-controls) | QA alone uses 3× travel, post-combat recovery and 5× playback; normal saves and tuning stay separate. |
| Background fights, Run, joiners, targets or stuck encounters | [Live encounters](features/shell/ENCOUNTERS.md) / [Combat](features/combat/README.md) | Anchors and ordered join/escape requests connect simulation, persistence and rewards. |
| Poses, hit feedback, creature art | [Animation](features/animation/README.md) / [Supplied roster](features/animation/SUPPLIED_SPRITES.md) | Numbered sprites map to stable species IDs; shared by combat, exploration and portraits. |
| Maps, signs, walking, quest markers, field HP or scenery crops | [World](features/world/README.md) / [Exploration](features/exploration/README.md) | The 36-place graph connects maps and saved position; campaign state supplies objective destinations and NPC `!`/`?` markers. |
| Spawn density, wild levels, free healing | [Populations](features/population/README.md) / [Recovery](features/recovery/README.md) | Map quotas and encounter tuning connect to saved lives, camp and village services. |
| Monsters, skills, levels, builds | [Content](features/content/README.md) / [Growth](features/growth/README.md) / [Party](features/party/README.md) | The reviewed Google Sheet snapshot owns creature identity; stable species/individual IDs and the Lv60 player/Lv100 engine boundary flow into combat. |
| Inventory, item popups, summoning, lost/duplicate progress | [Collection](features/collection/README.md) / [Persistence](features/persistence/README.md) | Loot presentation reads accepted receipts; profile commits items and individuals. |
| Sound, Settings, reduced motion | [Preferences/audio](features/experience/README.md) | Device choices affect presentation, never combat rules. |
| Inner Sea farming, defense or picture export | [Inner Sea](features/inner-sea/README.md) | Habitat residents, AFK training, five-monster defenses, repairs and upgrades connect to saved progress. |
| Other features or an unclear bug | [Feature index](FEATURE_MAP.md) | Symptoms route to the owner and its connecting boundary. |

Feature folders contain focused guidance and links to the actual implementation.
Browser modules still live at the root; do not create parallel copies.
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
Keep normal saves untouched. [Setup, browser tests, Git checkpoints and troubleshooting](features/delivery/OPERATIONS.md).

## Other routes

- [Owner decisions](OWNER_REVIEWS.md): reviews due before dependent production.
- [Remaining scope](features/delivery/REMAINING_SCOPE.md): all 66 cards, delivered work and blocking decisions/resources.
- [Client package](features/delivery/CLIENT_BUILD.md) / [runtime probe](features/combat/RUNTIME.md): reproducible local build and browser/Node parity.
- [Development and scaling policy](docs/ENGINEERING.md): architecture decisions, authority and release boundaries.
- [Documentation index](docs/README.md): active scope, design references and historical evidence.
- [Tests](tests/README.md), [tools](scripts/README.md), [assets](assets/README.md), [data](data/README.md): container-specific instructions.
- [Deferred ideas](<Game notes.md>): stashed ideas are not implementation requests.

Keep this file a router, not a feature manual. Update the owning feature's
contract in [architecture.json](docs/architecture.json); regenerate the index
and feature guides with `python scripts/project.py map --write`.
`project.py check` rejects stale routes, broken links and oversized entry guides.
