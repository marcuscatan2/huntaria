# Pass 14 — owner validation and implementation boundary
2026-09-11 · Local browser prototype, not a commercial release.

## Implemented in this pass

1. A won wild/monster encounter immediately returns to the region and opens a
   loot dialog. It shows coins, any actual Echo/items and participating-individual
   XP. A pack waits for the final enemy; trainer duels keep their result screen.
   No-drop and failed-save cases are explicit. Viewing/dismissing/retrying cannot
   reroll rewards or grant them twice.
2. Profile v7 stores independent companions: stable ID, species, XP/level, three
   priorities, tree investment and source pact. Multiple copies can be summoned
   and the same species can fill both slots; the same ID cannot fill two slots.
   Summon retries return the original individual; another Echo creates another.
3. Clicking a party slot opens a portrait picker with search, role filters,
   pagination, empty-slot action and selected/assigned labels. Picking an
   already-equipped individual swaps slots. Escape closes and restores focus.
   Class selection, XP-food targeting and tree companion selection also use it.
4. Inner Sea separates My companions from the 100-species guide. Copies have
   numbered labels and independent skill editing, including while benched.

## Please validate these five things

Use [the normal adventure](http://127.0.0.1:8765/) for your existing save.
Refresh with Ctrl+F5. Normal/test saves and browser origins are separate.
For deterministic duplicate tests, use [the isolated QA adventure](http://127.0.0.1:8765/?test=1):
expand the QA panel and grant two Emberfox Echoes (try different source levels),
then actually summon both from Inventory. This does not grant anything to your
normal save and does not test natural drop probability.

| Task | Expected result |
| --- | --- |
| Win a wild fight | Map appears immediately with the correct loot popup; dismiss and keep walking; no result-screen return click |
| Summon two Emberfoxes and equip both | Two numbered individuals, each in its own slot; selecting the already-equipped copy swaps slots |
| Change one copy's skills/tree and feed it | Only that copy changes; the other retains its XP/build; trainer follows the highest owned individual's level |
| Reload and inspect old progress | Copies, party, levels, skills and trees restore; your original v6 profile/v3 build keys remain untouched |
| Use picker on desktop/mobile | Search/filters make selection easy; no horizontal overflow; Escape/close restores usable focus |

Also try the five-enemy pack: its first kill must not end the encounter.
“Battle details” in the loot dialog remains available when you want the report.
Boss previews are reward-free and do not grant an essence.

## Design deliverables — scoped, not implemented final artwork

- [WORLD_DESIGN.md](WORLD_DESIGN.md): six biomes, all 24 maps/six towns, authored
  route/landmark plan, Firstlight coordinates, cave slice, environment asset kit,
  camera/depth/occlusion, streaming and measurable performance/quality gates.
- [CREATURE_DESIGN.md](CREATURE_DESIGN.md): art direction, seven-state animation
  packages, six future boss designs, all 100 silhouette/motion briefs and approval gates.
- [CREATURE_REFERENCE.md](CREATURE_REFERENCE.md): actual level-1 bases for all 100.
- [CREATURE_DROPS.md](CREATURE_DROPS.md): each species' live rewards and exact
  chances, habitat/availability, with future boss/ordinary loot clearly separate.
- [CREATURE_REFERENCE.csv](CREATURE_REFERENCE.csv): complete 100-row spreadsheet.
- [data/creature-reference.json](data/creature-reference.json): machine-readable
  baseline including five choices, defaults, passives, loot and art briefs.

No final map art, 100 commercial creature packages, new material drops, crafting,
server authority, multiplayer, purchases, stashed mastery or quest evolution was
implemented. The 0.01% acquisition risk is documented, not silently changed.
Recommend implementing the fully polished Firstlight/four-starter reference
slice next; it establishes the quality bar and measurable production throughput.

## Reproduce automated verification

```powershell
python tests/pass14_check.py
python tests/pass14_check.py --browser edge
python tests/scope_docs_check.py
python scripts/creature_reference.py --check
```

Browser suite uses isolated contexts and an ephemeral HTTP server, never your
personal Chrome/Edge profile. It includes 1,000 seeded fights, all 510 skill
assignments, all 100 species as two-copy battles, formula/targeting/formation
fixtures, actual UI hunt/picker/reload journeys, v6 startup migration, XP food,
save-quota failure/retry, per-individual XP, no-drop loot, pack timing and duels.
All-map geometry validates existing scale; it does not validate proposed layouts.

Reports: tests/artifacts/pass14-chrome.json and pass14-edge.json. Source hashes
cover all root JavaScript/CSS and index.html. Screenshots: pass14-picker,
pass14-inner-sea, pass14-loot, pass14-combat and pass14-mobile-picker.png.
Screenshots establish local layout, not physical-phone performance or final
commercial visual acceptance. tests/pass13_check.py remains historical; the
current standalone mechanics page loads pass14-engine.js.

The reference checker validates 100 distinct IDs, 94 wild/six future boss sources,
runtime base stats/skills/passives/habitats/drop math, and generated Markdown/CSV
consistency. Proposed art/material fields are design data, not live rewards.
## Final verification result

- Chrome 152.0.7977.83: **2,078 / 2,078 passed**.
- Edge 152.0.4191.66: **2,078 / 2,078 passed**.
- Both: zero JavaScript errors and zero missing assets. Identical SHA-256 hashes
  for all 40 root JS/CSS/HTML sources; those hashes match the files on disk.
- Final runs: 2026-09-11 04:57 UTC. Desktop/picker/loot/Inner Sea and 390px
  screenshots reviewed. Physical-device acceptance is still pending.
- Commercial-document integrity: 30/30; 66 feature cards, 264 criteria, none
  marked commercially accepted by this pass.
- Creature reference: all 100 runtime rows and all three generated artifacts agree.
- Local preview http://127.0.0.1:8765/ returned HTTP 200 during handoff.
