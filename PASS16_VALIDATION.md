# Pass 16 — next ten cards (F-017–F-026)

Current batch: local implementation and verification, **not ten commercially accepted features**. One agent; no purchases, public deployment, accounts or personal-browser save changes.

## Delivery matrix

| Card | Implemented in this batch | Still required by the full card |
| --- | --- | --- |
| F-017 | Existing physical map gates retained; unresolved encounters block replacement/transition with resume/abandon guidance; safe routes tested | Server-owned lifecycle, physical touch/device and outside-player evidence |
| F-018 | Saved original battle build/profile/seed/tick/supplies; deterministic resume; cave/forest populations and precommitted drops retained; partial kills kept; rarity/availability shown separately | Server authority and cross-device/concurrent request recovery |
| F-019 | Six chapters, 48 receipt-driven steps, journal destinations, ending, once-only chapter XP/coins; both classes tested with only starter companions | Owner approval of story, pacing and new-player playtest |
| F-020 | 60 named trainer lessons across six regions, legal regional parties/priorities, dialogue/advice, first/repeat rewards; no wild loot from pets | Narrative/presentation/balance approval and production receipt authority |
| F-021 | 12 forest/cave pack sites, 2–5 actual eligible resident lives, weakened pack stats, partial reward retention; legacy fake pack removed from map | Online lifecycle and final crowded-device readability |
| F-022 | Six distinct boss warning/target/impact/recovery/phase patterns, reward-free selectable-level previews; one/two/three simulated practice parties and up to13 actors with declared local scaling | **Not implemented:** real 2–3 authenticated players, rare realm access/schedules, server group scaling/eligibility, live .01% essence settlement (F-037–040/F-061–063) |
| F-023 | 18 optional personal challenges, durable once-only coins and decorative ribbons; no rare-roll bonus/account buff | Group challenge conditions and authoritative realm receipts |
| F-024 | Versioned art bible, isolated reproducible encounter and summon path, played reference recording harness | Owner approval on pinned clip, 8/10 actual newcomers, named physical target devices |
| F-025 | Explicit102-character coverage manifest tested against actual renderer mounts;3 painted pose rigs,71 moving vector-joint rigs; painted attack release aligned; recoverable missing-portrait fallback/retry | 28 simpler fallbacks remain (18 vector,10 portrait, including retained Elderroot art); all102 production assets/state clips, six production boss animations and approval. Roster production remains reference-gated |
| F-026 | Explicit510 skill assignment categories, innate coverage, element-aware VFX for the full roster, common0.26s logical impact deadline, reduced/quiet support, impact timing instrumentation | Network-buffered group presentation,13-actor played/device and acoustic-onset evidence |

All commercial acceptance boxes remain unchecked. A local fixture is not a realm server, a human observer or an art signoff. These missing portions are not silently downgraded.

## New playable route

Open the usual local game, refresh, then **Explore → Story & challenges**. Walk to the Mosslight Town Keeper, follow the forest and cave objectives, challenge Tavi/Aster and return to the Keeper. Optional trainer lessons and packs are visible near route services. Accepted kills are kept after a loss or abandon. Chapter rewards advance an accessible starter party into the next region.

Resume an interrupted fight from **Story & challenges**; it uses the original reserved build. Abandon there to unlock other encounters/maps. Editing a loadout does not replace that saved snapshot. This remains a single local profile, not multi-tab transactional storage.

## Test strategy and evidence

- `python tests/pass16_check.py [--browser edge]`:33 new data, paths, campaign, receipt/recovery and animation-manifest checks. Includes120 trainer/class matchups (one alternate-skill retest), two complete36-battle story routes, all72 new approach points and six boss phase boundary fixtures. Starter Echo grants are explicitly isolated QA setup; they do not assert natural drop acquisition time.
- `python tests/pass16_world.py --full [--browser edge]`: prior85 world checks and2079 engine/profile/UI regression checks against the new sources. Writes pass16 evidence, preserving pass15 artifacts.
- `python tests/pass16_visual.py`: actual-time 1×/2×/reduced reference clips and impact traces; no fake-clock playback. Reports headless desktop, not a physical-phone pass.
- `python tests/pass16_ui.py [--browser edge]`:24 UI checks, including full-page reload, keyboard interaction, mobile journal, six13-actor simulated boss previews with zero wealth and missing-portrait retry. Storage-write failure boundaries are also retained in the2079-check regression suite.
- Runtime source hashes are included; final result counts are recorded below after the frozen build runs.

## Common-roster preparation used for balance checks

Druid: Mend / Barkskin / Bramble. Mage: Aegis / Comet / Frostbolt. Emberfox: Pounce / Cinderbite / Firefan. Stonehorn: Bondguard / Pebble Slam / Rallying Ward. Spend the available attribute budget toward INT, then VIT, Leadership and AGI; no rare companions or paid items. The optional Willowbrook armor lesson is beaten by Mage with Crown Hex / Comet / Aegis instead. These are reproducible viable builds, not a proof that all builds are equal or final balance is approved.

## Art provenance and unresolved approval

The imagegen skill was used for a new Mage sheet and a correction attempt. Both outputs contained a baked checkerboard, failed alpha inspection and are **not shipped as gameplay sprites**. Candidates and exact prompts are in `assets/art-v16/`; approval for local background cleanup was requested. Existing Mage art remains intact. The skill's asset-generation work did not justify marking the full animation feature complete.

Read [ART_BIBLE.md](ART_BIBLE.md) before authoring more roster art. GN-001 account buffs and evolution stay stashed.

## Frozen-build results

All50 runtime JS/CSS/index hashes match across these reports:

| Suite | Chrome152.0.7977.83 | Edge152.0.4191.66 |
| --- | --- | --- |
| New campaign/content/receipt/102-renderer checks |33/33 |33/33 |
| New interaction/reload/mobile/fallback/practice UI checks |24/24 |24/24 |
| Existing full mechanics/profile/UI regression |2079/2079 |2079/2079 |
| Full world/navigation/streaming regression |85/85 |Not rerun for this pass; new72 approach paths and UI are covered above |

Total: **4,357 automated checks across both browsers**, no unexpected JS errors
or missing-asset failures in the final suites. This counts assertions, not
independent human sessions or commercial acceptance criteria. The world test's
missing-scenery status wait was corrected to await the asynchronous UI update;
the behavior assertion was retained and passes. A development run while sources
were being edited was correctly rejected by its hash-stability guard.

Artifacts: `tests/artifacts/pass16-{chrome,edge}.json`,
`pass16-ui-{chrome,edge}.json`, `pass16-regression-{chrome,edge}.json`,
`pass16-baseline-chrome.json`, `pass16-baseline-nav-chrome.json`, plus screenshots.
Documentation integrity:30/30, zero checked commercial criteria. The100-species
reference generator agrees with the fresh runtime export and committed tables.
Existing preview verified HTTP200 at `http://127.0.0.1:8765/`.

Final played reference: **3/3 recordings passed** on the same50-file frozen
build. All three finished with the same winner and38.00-second canonical
result;96 presented HP-impact deadlines were measured per recording.

| Recording | p95 frame interval | Maximum lateness against the shared logical deadline |
| --- | --- | --- |
|1× normal |16.8ms |16.7ms |
|2× normal |16.9ms |73.1ms |
|1× reduced motion |16.8ms |16.7ms |

The1× recording also shows an explicitly controlled test Echo drop, immediate
world/loot return, Inventory, confirmation and a third independent companion.
Capture platform: Windows11 build26200, reported Intel64 Family6 Model140
Stepping1; headless Chrome. This is desktop observation, not a named physical
phone benchmark. Sound requests share the presented deadline; recorded acoustic
output/onset was not measured. P95 and maximum lag are separate metrics.

Report: `tests/artifacts/pass16-visual-chrome.json`. Clips:
[normal](tests/artifacts/pass16-reference-1x-False.webm),
[double speed](tests/artifacts/pass16-reference-2x-False.webm),
[reduced motion](tests/artifacts/pass16-reference-1x-True.webm).
These do **not** establish owner approval, acceptable13-actor overlap, network
timing, production art quality, physical-phone performance or8/10 novice understanding.

## What the owner should try

1. Refresh the game; open **Explore → Story & challenges** and follow the
   Mosslight chapter through its Keeper, trainers, forest and cave.
2. Start a pack, pause/return, reload the page and resume from the journal.
   Then try abandoning after a kill: accepted loot stays, untouched foes do not pay.
3. At a boss altar choose a level and **three simulated parties**. Judge warning
   clarity, trainer identification and overlap; do not mistake this for online coop.
4. Review the played art reference. Production expansion and the failed-alpha
   Mage cleanup still need the explicit approvals described above.
