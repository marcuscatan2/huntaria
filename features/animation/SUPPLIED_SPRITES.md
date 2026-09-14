# Supplied creature roster and sprites

## Source and identity

The owner supplied 100 numbered originals in [assets/monsters](../../assets/monsters).
The owner-maintained [Google Sheet](https://docs.google.com/spreadsheets/d/16cPx2V69RCrvfmTmqYtP1zUBezq9zvl_UUiVE7Osqho/edit?gid=765633262#gid=765633262)
is the creature-design source of truth. [data/monster-roster.json](../../data/monster-roster.json)
preserves reviewed `Roster!A:S` values plus the Sheet revision/fingerprint; the
earlier workbook hash remains archived provenance. Roster number selects the PNG; Stable ID selects
the existing species. Never infer identity from a silhouette or filename spelling.
For example Brimble retains `emberfox`, Rattlebit retains `stonehorn`, and
Pinstitch uses the owner's filename `24-Pinstritch.png`.

The browser never fetches mutable Sheet data during play. Reviewed Sheet changes
are imported into versioned local data/runtime modules and validated. At revision
262 the `mon-skills` tab is empty, so role/combat-identity rows guide future kit
work but do not replace the implemented skills. Sheet status is not final art or
balance approval.

## Runtime route

`data/monster-roster.json` + numbered PNGs →
`python scripts/monster_sprites.py --write --check` →
[monster-sprites.js](../../monster-sprites.js), loaded immediately after roster.js.
This generated overlay changes display name, subtitle and visualFamily only.
It leaves stable IDs, individual saves, skill IDs, passives, combat stats, elements,
wild levels, populations and loot untouched. Legacy `family` / `shape` fields
remain historical allocation/vector metadata; menus use `visualFamily`.

CharacterRig prioritizes the supplied PNG in portraits, collection, inventory,
exploration and combat. Mount/pose must never swap it back to the old SVG or
Emberfox/Stonehorn pose sheets. Trainer pose sheets are separate and documented
in [TRAINER_SPRITES.md](TRAINER_SPRITES.md).
Supplied art faces right (`--sprite-native:1`); facing is CSS scale, independent
of pose transforms. Browser tests cover decode and shared consumers.

All supplied files are single-pose 1254px square PNGs. Transform-based breathing,
walk bounce, windup, attack/cast, recoil, defeat and victory are presentation only.
`BondAnimationCoverage` reports `supplied-raster`, not authored frame animation.
Reduced motion disables oscillation. Originals are not rewritten; existing lazy
world loading and paginated collection avoid eagerly loading the full catalog.
The source catalog is approximately178MB; web-size derivative assets and actual
multi-frame motion remain production work, not a claimed download budget.

After the mechanics suite exports the current runtime, publish authorized reference
names/visual metadata with `python scripts/monster_sprites.py --publish-reference`,
then `python scripts/creature_reference.py --write --check`. The publisher verifies
the export hashes and leaves live balance and loot fields unchanged.

## Validation and review boundary

`python tests/monster_sprites_check.py --browser chrome` checks the 100-row
mapping, unchanged mechanics, PNG decode, shared rendering, poses and stable saves,
and produces neutral contact sheets in tests/artifacts. Run the full project
browser gate for changes affecting content, presentation or saved consumers.

The user authorized integration of these supplied designs, not final commercial
art/animation approval. Review starter silhouettes and scale in world/combat now;
approve a motion reference before producing 100 animation packages.
Other owner gates remain governed by [OWNER_REVIEWS.md](../../OWNER_REVIEWS.md).
