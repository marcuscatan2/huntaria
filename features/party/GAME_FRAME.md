# In-frame preparation screens

`index.html` places `#region-map` and `#panel-loadout` inside the same
`#game-frame`. `BondApp.switchTab` shows one of them and keeps the region shell
visible for preparation. Both occupy the same responsive rectangle. Existing
`region`, `loadout` and `battle` IDs remain navigation contracts.

`menu.js` renders a wood-and-brass frame using `game-frame.css`: a fixed title,
screen navigation, an internally scrolling content area and fixed Explore / Bag /
Inner Sea destinations. Close and Escape restore exploration and focus its
corresponding destination. Modal dialogs keep native focus trapping and cancel
behavior; their bounds and backdrop follow the game frame. Escape closes the
active dialog before it can close preparation.

Inventory keeps its existing profile commands and item categories. At widths up
to 850px, selecting an item opens its detail within the frame; Back to items
returns to the selected slot. On larger screens, categories, items and the
selected detail appear alongside each other. Summoning consumes the same Echo,
automatically fills an available party slot and opens the new individual under
My companions. The Homestead, My companions and Species guide are separate
Inner Sea views.

Exploration input stops during preparation. A live encounter continues to tick
and settle in the background; completion does not pull the player out of a menu.
Opening, closing, drawing and exporting these screens cannot award inventory.
Profile and build formats remain unchanged.

`tests/game_frame_check.py --browser chrome` covers field-button navigation,
shared bounds, keyboard and modal cancellation, summoning, habitat selection,
upgrades, defenders, 320/390/768/1440px layouts, live combat and save isolation.
The full current gate also checks opening, party, farm, export and bundle flows.

Owner review: follow Bag → select an item → summon, then Inner Sea → Homestead
→ select a habitat → assign defenders. Review legibility and control density on
the intended device before adopting this as the wider UI standard. The current
request authorizes implementation; device certification and final visual
acceptance remain separate decisions under OR-06.
