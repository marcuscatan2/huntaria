# Equipment and held items

The two original `docs/Huntaria - Equipment.csv` and
`docs/Huntaria - Held_Items.csv` files define 100 trainer items and 100 held
items. `scripts/equipment_catalog.py` imports their inert data into
`item-catalog.js`; `--check` detects stale output. Stable IDs use item kind and
the existing species ID, independently of display names.

## Ownership and eligibility

Each character has Weapon, Off-hand, Head, Body, Feet and Accessory slots.
Each individual companion has one held slot. Equipping reserves an owned copy;
inventory totals include reserved copies. A copy cannot occupy multiple slots.
Unequipping returns its availability without creating another item. Class,
minimum-level and explicit species/family restrictions come from the sheets.
The held sheet's Class column describes a role, not an eligibility restriction.
The named bird list is authoritative for bird-only items.

`equipment.js` owns pure eligibility, availability and assignment rules.
Profile commands own critical, atomic saves. Existing saves gain empty slots;
stable individual IDs, inventory, vitality and progression survive migration.
Encounter options freeze `equipmentRules` and the equipped profile. Changes to
gear affect later encounters; old reservations without the flag retain version0.

## Combat boundaries

`combat-hooks.js` dispatches shared events to existing companion talents and
the item modules. `equipment-effects.js` owns item state and common operations;
`equipment-passives.js` and `held-passives.js` implement authored effects.
No combat behavior is inferred from spreadsheet prose at runtime.

- Core allies are the trainer and two deployed companion slots of that owner.
  Temporary summons, story masters and the five-monster farm defense are not
  a three-member core party. Personal held effects can still work in defenses.
- Primary attack power is the species' designated physical ATK or MATK.
- Attack-rate modifiers multiply basic attacks per second. They do not add
  Ragnarok ASPD or shorten active cooldowns.
- Gear attributes affect the trainer personally. Leadership shares allocated
  base attributes; gear bonuses do not enter that shared contribution.
- Equipment DEF/MDEF add hard physical/magic mitigation percentage points;
  VIT/INT retain the existing soft defense formulas. CRIT adds chance points.
- Equal named buffs refresh one entry. Item-generated packets carry their
  origin through deferred effects and cannot create item-proc chains.
- Existing shield capacity (25% maximum HP), post-shield guard limit (35%),
  accuracy, critical damage and death rules remain authoritative.
- Genuine normal-target tracking changes after the old enemy dies. Temporary
  taunts, decoys and summon targets do not restart target-based item bonuses.

## Class quest weapons

The four existing `weapon:class:<class>` rewards are level-20 weapons, restricted
to their named class. Oathkeeper Blade gives ATK +12 and STR +2; Watchkeeper Bow
gives ATK +12 and DEX +2; Emberglass Wand and Warden's Branch give MATK +12 and
INT +2. Existing Bag copies keep their stable IDs and become equippable. These
weapons have no triggered effects or monster drops. The quest's once-only
reward remains authoritative. The importer defines these four explicit extras
separately from the 200 unchanged source-sheet rows.

## Acquisition

Each listed species has two independent 100/10,000 rolls: its equipment and
its held item. The explicit owner override sets every item to 1%. Rolls use
separate stable salts and never consume combat RNG. Wild drops settle once per
accepted spawn-life claim, including joined monsters. Authored monster rewards
settle with the first eligible encounter victory. Practice and rescue rewards
do not create equipment. Reload and failed-save retries retain the same result.
Successful Inner Sea defenses roll the same species items in their atomic
defense receipt. Item drops are excluded from version-0 reserved encounters.

The Bag displays accepted inventory. Equipment and held-item management stay
within the Inner Sea's party management flow. Ordinary player screens show
requirements and effects, not drop odds or implementation notes.

## Artwork and review

Item icons extend the game's small vector interface artwork. Original sources
remain resolution-independent; any later raster export can choose an explicit
phone texture budget. Higher-level equipment uses richer trim within the same
readable silhouettes. Item icons do not imply changing the class avatar sheets.
`scripts/item_icons.py --check` verifies all 204 files and the source manifest.

## Validation

`python tests/equipment_ui_check.py --browser chrome` runs deterministic item
loadouts, focused effect contracts, import/art checks and disposable browser
ownership, retry, replay and responsive-menu tests. `--ui-only` skips the Node
combat phase while iterating on menus. Run the full project gate for changes
across combat, progression, inventory and persistence.

The owner explicitly authorized this feature and the supplied sheet revision.
Broader combat pacing, final device budgets, release economy and final visual
acceptance remain under the existing owner review gates.
