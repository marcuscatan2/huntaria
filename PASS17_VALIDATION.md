# Pass 17 — population, preparation, facing, bridge and roster

Status: locally playable and verified, 2026-09-11. One implementation agent.
No normal browser profile was opened or reset. No deployment/purchase/accounts added.

## Delivered

| Request | Implementation |
| --- | --- |
| Map populations | Common8 / Uncommon5 / Rare or Very rare1 per species on its existing source map. Ordinary0s and rare60s replacement; new dry reachable location at least900 units from the previous one. Exact map totals in [MAP_POPULATIONS.md](MAP_POPULATIONS.md). |
| Loadout-only preparation | Removed fixed-habitat markers and clickable rest/shop/Inner Sea preparation services, plus world preparation shortcuts. Party & bag retains inventory, Inner Sea, formation, skills and trees. Story Keepers, discoveries and fighting NPCs remain. Optional authored packs still reserve real map lives, not extra spawned clones. |
| Left/right movement | Druid scale no longer overrides mirroring. Followers update direction from actual movement. Sprite size/native orientation/facing are independent; canvas, image and code-native SVG tiers tested. Labels are never mirrored. |
| Bridge sprite | Built-in image generation produced an opaque painted timber deck. Runtime draws it along the actual bridge geometry; rails frame the walkable center. Original file preserved, no bitmap cleanup. Missing-image fallback and retry tested. |
| 100-species families | Exact25 land /15 bird /4 frog /1 mythic /15 insect /3 spider, plus12 aquatic /10 reptile-newt /6 plant-fungus /6 spirit-construct /3 other invertebrate. Names and prototype anatomy updated where needed; save/individual/skill IDs, XP, combat stats, kits and Echo odds preserved. Family search selects a matching detail. |

Rare labels and inspiration families are separate; “Mythic” is a body-design
allocation, not a new rarity or stat multiplier. Auroradrake is the sole mythic
dragon archetype. Cindrake's stable ID now displays Cinderskink. All rename aliases
are listed in [CREATURE_FAMILIES.md](CREATURE_FAMILIES.md).

Four introductory starter species retain10% Echo drops; all other configured
species retain0.01%. Summoning remains100% after obtaining an Echo. No pity added.

## Save/placement contract

- Coordinates are stored with the spawn life, not regenerated on redraw/reload.
- Placement samples the whole map, rejects blockers/water/unreachable points,
  separates residents, and avoids declared gate/NPC points.
- One initial resident per starter species is near the introductory trail;
  no replacement uses that hint. Towns contain no wildlife.
- Existing reserved encounter identity/seed/loot draws survive old-slot migration.
  Surplus old world slots retire; owned companions are never removed.
- Existing pre-pass17 cooldowns finish as saved. All new deaths use0s/60s.
- An unresolved battle pins its dead members until settlement/abandon; no member
  can respawn mid-encounter or grant the same accepted reward twice.
- A critical storage failure cannot report a successful new saved spawn.
- This is local browser authority, not secure server persistence.

## Verification

Final runtime source set:51 root JS/CSS/HTML files, hash-pinned in each report.
Bridge PNG SHA256:
`e0a53381cda26d9d065396451e4c3178e0f6816deab339d3829cef020ab3cb3f`.

| Suite | Chrome | Edge |
| --- | ---: | ---: |
| Population/migration plus combat/rules regression |2175/2175|2175/2175|
| Played browser/UI, direction, bridge, reload, family guide and kill return |26/26|26/26|
| Existing campaign/pack/recovery regression |33/33|Not rerun in this pass|

Total4435 passing assertions, including repeated cross-browser cases; not4435
independent player tests. No unexpected JavaScript errors. Documentation integrity
30/30; all100 live reference rows and four generated reference documents agree.
Commercial backlog remains66 cards/264 criteria, with no commercial AC accepted.

Actual UI journeys include keyboard movement in both directions, both followers,
a bridge crossing, Keeper interaction, inventory access, family filtering,
a Tideotter victory immediately returning to the map/drop popup and replacement
elsewhere. The played drop case deliberately sets a test Echo roll; it does not
measure natural acquisition timing. Full reload checks use isolated sandbox saves.

Reports: `tests/artifacts/pass17-{chrome,edge}.json`,
`pass17-ui-{chrome,edge}.json`, `pass17-campaign-chrome.json`.
Fresh content exports: `pass17-reference-{chrome,edge}.json`.
Screenshots: `pass17-walk-left/right-*.png`, `pass17-bridge-*.png`,
`pass17-frogs-*.png`, `pass17-population-*.png`, `pass17-mobile-*.png`.

Initial debugging found two order-sensitive JSON comparison failures (field values
were unchanged), an unremoved habitat marker, and a loaded-but-undrawn bridge.
Tests and rendering were corrected, then the full pinned suites were rerun.

## Remaining limits, not acceptance claims

The100-species family roster/prototype anatomy is implemented, not100 approved
painted animation packages. Shared rigs still need species-specific production
art. Existing Mage candidate sheets remain excluded; no unapproved image cleanup.

Random placement is synchronous at first population creation. A bounded four-map
connectivity cache reduces repeated searches, but a heavily concurrent test run
recorded up to1.36s for a first map population. This is not a clean single-device
performance benchmark or a60FPS certification. Initial placement should eventually
be scheduled incrementally/off-thread; already-saved lives do not rerun it.

No real online accounts, multiplayer authority, server clocks, payments or
commercial-device/player acceptance was added. Prior future-work limits in
[PASS16_VALIDATION.md](PASS16_VALIDATION.md) remain. No stashed account mastery,
evolution, AFK chores or game notes were implemented.

## What to validate yourself

1. Hard-refresh [the normal preview](http://127.0.0.1:8765/) with Ctrl+F5.
   Kill a Tideotter in Firstlight Meadow: immediate map return/drop popup;
   count returns to8, and its replacement is elsewhere, not beside the corpse.
2. Defeat a Rare creature: its species shows0/1 and a60s countdown, then1/1.
   Reload during the countdown; it should not reset the timer or reshuffle living mobs.
3. Walk left, then right with the Druid and two companions; check their facing.
4. Cross the creek on the Firstlight Meadow road and inspect the timber bridge.
5. Use Party & bag for builds/inventory. Inner Sea → Species guide: search Frog
   (4), Insect (15), Spider (3), Mythic (1), then inspect the matching detail.

## Reproduce

```powershell
python tests/pass17_check.py --browser chrome
python tests/pass17_check.py --browser edge
python tests/pass17_ui.py --browser chrome
python tests/pass17_ui.py --browser edge
python tests/pass17_campaign.py --browser chrome
python scripts/creature_reference.py --check
python tests/scope_docs_check.py
```

If runtime identity/spawn data changes, run the browser export first, review it,
then use `scripts/refresh_pass17_reference.py` and
`scripts/creature_reference.py --write --check`. The refresher deliberately
asserts unchanged combat stats/kits/odds and touches only named reference fields.

Bridge asset: [timber-bridge.png](assets/world-v17/timber-bridge.png).
Built-in mode and exact final prompt/provenance:
[assets/world-v17/prompts.json](assets/world-v17/prompts.json).
