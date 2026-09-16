# Illustrated trainer skill trees

## Ownership and assets

`talent-tree-view.js` renders the four trainer diagrams and their inspectors;
`talent-tree.css` owns their presentation. `tree-menu.js` routes selection,
branch changes and purchases through `BondProfile.learn` / `respec`.
`class-trees.js` and `growth.js` remain authoritative for ranks, prerequisites
and the [workbook talent budget](../content/COMBAT_WORKBOOKS.md).
Companion trees stay in the Inner Sea and share the diagram renderer; their
[24-node layout and CSV rules](COMPANION_TREES.md) are specified separately.

`assets/talents/sanctuary.png` is an original painted sanctuary background.
The Mage, Druid, Knight (`swordsman`) and Hunter each have a 5-column, 3-row
illustrated atlas: one row per branch, one cell per talent, ordered as in
`combat-catalog.js`. CSS displays these cells without separate icon downloads.
[The manifest](../../assets/talents/manifest.json) records exact built-in
imagegen prompts, original filenames and SHA-256 hashes. Runtime packaging
includes these files through `data/client-build.json`.

## Diagram and interaction contract

Each branch progresses from top to bottom:

```text
             Opening
              /   \
         Fork A   Fork B
              \   /
             Advanced
                |
             Capstone
```

- Each fork needs Opening rank 2. Both forks may be learned.
- Advanced needs Opening rank 2, either fork at rank 2, and 4 earlier branch points.
- Capstone needs Opening and Advanced at rank 2, and 7 earlier branch points.
- Lines become dashed when the source prerequisite is complete, and gold when
  that completed source connects to a learned destination. An unused alternative
  fork never appears to have been completed because Advanced is learned.
- Node names and rank badges remain visible. Locked nodes can be inspected.
  Selecting a node never spends a point; the inspector has a separate Learn or
  Improve button. Requirements show their current completion state.
- Pressed nodes keep their position and hit area through pointer release. The
  shared button animation must not replace the diagram's centering transform.
- Desktop displays all branches and a side inspector. At widths up to 1000px,
  branch buttons show one complete path at a time and details use a modal sheet
  within the game frame. Closing it, including Escape, returns focus to the node.
- Rendering and changing branches do not alter saved progress. The painted
  assets are optional presentation: download failure leaves controls, names,
  ranks, connections and requirements usable.

## Visual references

[Last Epoch's official Acolyte tree](https://support.lastepoch.com/hc/en-us/articles/46362899182875-Acolyte-Skill-Tree)
uses compact illustrated nodes, larger notable nodes and visible connecting
paths. Its [specialization preview](https://forum.lastepoch.com/t/tempest-strike-specialization-tree-preview/15863)
keeps descriptions in a selection tooltip rather than on every node.
[Blizzard's September 2020 development tree](https://news.blizzard.com/en-us/article/23529210/diablo-iv-quarterly-updateseptember-2020)
explores a painted environment behind branching skills and distinguishes node
roles by shape. These are presentation references, not Huntaria rule sources.
No reference screenshots or other games' assets ship with Huntaria.

## Verification

`python tests/talent_tree_check.py --browser chrome` checks all four graphs,
real point spending and alternative prerequisites, held mouse/touch input,
keyboard/modal behavior,
save preservation, asset failure and 320–1440px layouts. Captures and reports
stay in ignored `tests/artifacts/`. `tests/combat_workbooks_check.py` retains
combat behavior, migration and reserved-battle checks.

The owner requested this visual revision after rejecting the card layout in
commit `1bc3e7a`. That authorizes implementation, not final art or physical-phone
acceptance; broader review gates remain open.
