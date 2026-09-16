# Landscape props

Original assets for `landscape-identity-v1`, generated with the built-in
`image_gen` tool. Exact prompts are retained in [prompts.json](prompts.json).
Both PNGs are 1448 × 1086 with transparency. These are original text-to-image
generations; no third-party image was supplied as a reference.

- [nature-atlas.png](nature-atlas.png): birch, willow, pine, cypress, copperleaf,
  regrowing burnt tree, limestone, sandstone, alpine ridge, veined basalt,
  root-hung cave rock and moonstone stalagmites.
- [ruins-atlas.png](ruins-atlas.png): ivy arch, watchtower, aqueduct, low wall,
  broken windmill, waterwheel, statue, library, armillary, kiln, dolmen and obelisk.

Rows read left to right, top to bottom. Runtime crops in
[world-scenery.js](../../world-scenery.js) follow measured silhouettes; the artwork
does not fit perfectly regular cells. Source files remain unaltered. Lossless
WebP encodings live in `assets/world-runtime/`, with source/export hashes in its
manifest. Regenerate with `python scripts/world_assets.py` and verify with `--check`.

[Landscape contracts and review](../../features/world/LANDSCAPES.md) describe
placement and acceptance. Generated screenshots remain disposable test artifacts.
