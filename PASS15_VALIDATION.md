# Pass 15 — world delivery and owner validation
2026-09-11 · Local implementation technically verified in Chrome and Edge.
Commercial art approval and release acceptance remain open.

## Delivered for this request

Six regions with 24 authored exploration layouts and six compact towns:
Mosslight, Willowbrook, Amber Hollow, Moonwell, Windstep and Ashen Reach.
The new world includes illustrated ground/scenery, 30 hero landmarks, 94 fixed
wild-species habitats, bridge/cave collision, continuous camera movement,
click-to-walk navigation and physical multi-map itineraries.

Trail Keepers, existing challenges, rest/preparation, caches, town supplies and
Inner Sea access remain connected to the playable hunt/summon/loadout loop.
A field journal records 78 landmarks without changing stats or loot odds.
Biomes provide matching arena scenery; terminal wild wins still return directly
to the world with the earned loot popup.

See [WORLD_IMPLEMENTATION.md](WORLD_IMPLEMENTATION.md) for architecture, coverage
and explicit unfinished commercial requirements. This is not a claim that the
entire commercial game, 100 final creature packages or online boss system is done.

## What you should validate

1. Open the normal game and hard-refresh (Ctrl+F5). Walk Firstlight with WASD;
   click a fox, fight, dismiss loot and keep moving. Confirm the map feels more
   like a place and that labels do not hide the creatures.
2. Click the town gate or its route button. You should walk to it before changing
   maps. In town, walk up to the cave and forest structures; enter both.
3. Click across a river: your trainer should route over a bridge. In Rootveil,
   follow the cave floor and try clicking through a wall. There must be no
   teleportation, invisible water crossing or permanent stuck state.
4. Follow a discovery marker, record it, open Field journal, then reload.
   Your location, companions, inventory and journal should remain.
5. In the isolated test adventure, grant and summon a level100 Echo to unlock
   later regions. Review one forest, landmark and cave in every region.
   Tell me which biome feels strongest and where the scenery repeats too much.
6. Try your normal screen and a narrow phone-sized layout. Use Wide exploration,
   Scenery: Low and your system's reduced-motion preference. Check taps, labels,
   map panning and the portrait/loadout screens.
7. Verify existing duplicates, builds, formation and skill trees still work.
   Boss altars remain visibly reward-free tests with selectable level1–100.

Your style/feel judgment is required; automated route checks cannot establish
Sword x Staff production quality, fun, accessibility or commercial success.

## Evidence

Pinned build results:

| Check group | Chrome | Edge |
| --- | ---: | ---: |
| World exploration / delivery recovery | 85 / 85 | 85 / 85 |
| Combat, skills, individual companions and saves | 2,079 / 2,079 | 2,079 / 2,079 |
| Total | 2,164 / 2,164 | 2,164 / 2,164 |
| JavaScript errors / missing assets | 0 / 0 | 0 / 0 |

The world checks include 574 approach targets across 30 maps, including all
282 fixed wildlife slot positions, gates and points of interest. Regression
fixtures additionally check 96 directed opposite-edge routes across the
24 large maps and reciprocal gate arrivals. Two full crossings run through
the movement loop, not profile teleports. Root source hashes are pinned in each
report, and each suite asserts they remain unchanged throughout its run.

Documentation integrity: 30 / 30; commercial acceptance checkboxes remain zero.
All 100 creature reference rows now match the current browser export, including
94 relocated habitat centers. Runtime-export hashes prevent stale-data checks
from passing after untested source changes.

Reports: tests/artifacts/pass15-chrome.json, pass15-edge.json,
pass15-regression-chrome.json, pass15-regression-edge.json.
Test profiles and ephemeral HTTP servers are isolated from the owner's normal
save and browser profile. Screenshot names without a browser suffix are the
latest generated examples; the per-browser JSON is the authoritative result.

Commands:

```powershell
python tests/world15_check.py --full
python tests/world15_check.py --full --browser edge
python tests/world15_check.py --trace-only --performance-seconds 300
python tests/world15_check.py --delivery-only
python tests/scope_docs_check.py
python scripts/creature_reference.py --check
```

The world suite covers scene loading, path reachability, two movement-loop
crossings, gate travel/cancellation, discovery/reload, 100 map remounts,
390px overflow, persistent quality preference and asset failure/retry.
The regression suite preserves 1,000 seeded battles, all species/skill assignments,
duplicate individuals, migration, loot idempotency, no-drop/storage failure,
pack completion and trainer-duel behavior.

A real-time headless-browser route sample is separate from the accelerated-clock
functional checks. It does not certify a physical Android device or a release
hardware tier. The 100-remount stress test is not a 30-minute real-time soak.
No commercial criterion checkbox has been marked accepted.

## Performance observations (not release hardware certification)

The initial lazy-loading pass reduced the measured starter download from
15,875,958 to 9,694,930 bytes (about 9.25 MiB). In a fresh headless Chrome profile
at 10Mbps / 50ms simulated network latency, controls were available in 0.97s;
roughly 0.37 MiB of code/styles had completed at that point. Full scenery arrives
later with a visible loading message. This is not a claim that all art loads in
0.97s. Offscreen wildlife portraits and exploration animation sheets are requested
on demand; combat animation mounting retains immediate loading.

Final-build trace: tests/artifacts/pass15-trace-chrome.json, Chrome 152.0.7977.83.
300.17 real seconds, 17,900 observed frame intervals; p95 16.9ms and p99 17.0ms.
All six biomes' field/cave pairs were sampled, with two actual combat/loot returns.
Scenery-render work p95 was at most 2.7ms in the recorded samples; at most 28 ground
chunks, two logical scene sheets and 46 visible prop nodes. Sampled JS heap ranged
about 9.6–22.0 MiB; this is **not** whole-process/GPU memory. No JS errors and all
44 root runtime source hashes remained unchanged. Edge 152.0.4191.66 passed the
functional suites; no equivalent five-minute Edge trace or physical-phone
certification is claimed.
The standalone tests/index.html mechanics page also passes 2,041 / 2,041 checks
in a fresh browser context (recorded in pass15-delivery-chrome.json).
