# Pass 10 — living companions and Bond Contracts

Implemented and verified. One agent. Pass 09 gameplay and legacy saves preserved.

- Real pose-sheet animation for Druid, Emberfox and Stonehorn: locomotion,
  attack anticipation/contact/recovery, spellcast, hit, defeat and celebration.
- Illustrated satchel with categories, stack counts and useful item actions.
- One grass habitat per biome, covering ten species; two starter companions.
- Deterministic ritual: weaken to 35% HP after four seconds; trainer channels
  four seconds without acting. Four 9%-max-HP trial pulses can be guarded,
  armored and shielded. Companions continue fighting. Wild damage is restrained
  to 1 HP. Paper is consumed only on a successful, unique bond.
- Three starter contracts, two per treasure; inscribe another for ten earned
  coins. No paid items, loot rolls, purchases or external runtime services.
- Version 4 atomic profile: owned collection + pact records + inventory.
  Preserve legacy inventory, growth, exploration and equipped player monsters.
- Inner Haven collection screen establishes the inner-world fiction. Walkable
  hideout, decorations, chores, AFK rewards and duplicate breeding are deferred.
- Verify pure combat regressions, migrations, ritual success/failure, actual
  grass-to-collection browser play, animation frames and responsive inventory.

Art: original generated bitmaps; exact prompts and provenance in
assets/art-v10/prompts.json. No claim of shipped-game animation parity.
