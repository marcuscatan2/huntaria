# Art and asset routes

- [Supplied roster](../features/animation/SUPPLIED_SPRITES.md): numbered
  `monsters/*.png` originals, stable-ID mapping and current rendering contract.

- [Animation owner](../features/animation/README.md): creature/trainer art,
  poses, portraits, combat effects and character asset directories.
- [Trainer pose sheets](../features/animation/TRAINER_SPRITES.md): Druid,
  Mage and weapon-specific Apprentice atlas routing, provenance and limitations.
- [Exploration owner](../features/exploration/README.md): scenery and world props.
- [Lossless scenery exports](world-runtime/README.md): pixel-identical runtime encoding; original images remain intact.
- [Original audio](audio/README.md): procedural scores and reproducible loop files.
- [Art Bible](../ART_BIBLE.md): visual conventions and acceptance, not an
  assertion that current art is approved.
- [Owner gates](../OWNER_REVIEWS.md): style reference, motion reference and
  species-scoped approval before dependent production.

Versioned asset folders are retained source/provenance, not permission to use
any arbitrary older image as the current standard. Trace the runtime loader and
the manifest's asset routes before editing. Keep provenance with each asset.
Technical manifest coverage does not equal acceptable design or animation.
Do not rename/remove referenced files, change frame geometry or bulk replace
creatures without checking shared combat/portrait/exploration consumers.

New bitmap generation has its own applicable tool/skill workflow; a documentation
or animation-logic task does not itself authorize changing approved artwork.
