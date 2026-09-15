# City artwork

Original game assets generated with the built-in imagegen tool for the owner's
square-map and class-themed city request. [Exact prompts](prompts.json).

- `buildings.png`: four columns (grove, academy, lodge, keep), two building rows.
- `residents.png`: nine different citizens in a 3×3 sheet.
- `interiors.png`: grove, library, lodge and training hall in a 2×2 sheet.

The resident/building source images contain an RGB neutral checker backdrop.
`city-art.js` frames them and isolates edge-connected neutral pixels into cached
transparent runtime sprites. `city-view.js` clips the interior sheet with CSS.
The source files stay unchanged. Final owner art acceptance remains pending.
