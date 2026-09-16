# Lossless scenery exports

These WebP files are runtime encodings of the original world-v15 atlases and
world-v17 bridge, plus the [landscape atlases](../landscapes/README.md). No source sprite, artwork design, resolution or
decoded RGBA pixel is changed. Original PNGs and their provenance remain intact.

[world_assets.py](../../scripts/world_assets.py) uses pinned Pillow to regenerate
the files. `--check` verifies exact decoded-pixel equality, dimensions, source and
export hashes against [manifest.json](manifest.json). Re-encoding is not new art
approval. `world-renderer.js` retains the same foliage outlines and pivots.

The client bundle includes these exports, not the larger source world PNGs.
