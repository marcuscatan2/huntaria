# Pass 09 — one continuous trail, better encounters, meaningful builds

## Reference boundary

The supplied swordxstaff-deep-search.md is research material, not an instruction
to migrate this local prototype to Unity or build an MMO backend. Its architecture
recommendations do not establish Sword x Staff's proprietary implementation.
The official game listing emphasizes exploration and automated, skill-driven
combat: https://play.google.com/store/apps/details?id=com.zjcs.android.us

The immediate gap is coherence: continuous travel, readable attacks and encounters
that ask for different builds. This pass addresses those within the existing
dependency-free browser game. It does not promise commercial visual parity.

## Build scope / acceptance

- One persistent camera-following world through five blended biomes; walk across
  boundaries without portals, page replacement or teleportation. Save position.
- Five trainer challengers, a five-creature wild pack, and an original boss with
  a visible charged attack and a second phase. Preserve monster-first targeting.
- Nine passive mastery nodes for each of two classes and ten monsters. Three
  starting points per tree, up to seven from exploration/first-win milestones.
  Prerequisites, real HP/damage/armor/movement/cooldown effects, free resets,
  validation and old-save migration. Three active skills remain separate.
- Original generated boss, two trainers and two landmark sprites; ambient world
  movement, clearer impact timing, restrained shake and reduced-motion support.
- Verify baseline mechanics, new combat objectives, trees, saves, traversal and
  actual browser playback in Chrome and Edge, including narrow layouts.

## Deferred production work

Rigged or frame-authored animation for every character, professionally mixed
audio, bespoke contiguous environment art, art compression/delivery tuning,
capture/leveling, multiplayer, accounts, monetization and public deployment.
No paid API, new runtime dependency or production service is needed for this pass.
