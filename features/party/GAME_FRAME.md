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
My companions. The main menu has Inner Sea, Inventory and Class Skill Tree.
Inner Sea contains Homestead, Party, Formation, Attributes, My companions and
Species guide. Companion mastery opens within Inner Sea; Class Skill Tree never
mixes class and companion trees. Existing `BondMenu.open('party'|'formation'|
'trainer')` calls route to Inner Sea subsections. `current()` returns the main
screen and `section()` returns the Inner Sea subsection.

Party contains the [Dummy test](../combat/TRAINING.md), including its incoming
damage toggle. The button is unavailable while an adventure is reserved.
Player copy names actions, costs, skill effects and quest destinations. Release
plans, implementation notes and duplicate tutorials stay out of these screens.

Exploration input stops during preparation. A live encounter continues to tick
and settle in the background; completion does not pull the player out of a menu.
Opening, closing, drawing and exporting these screens cannot award inventory.
Profile and build formats remain unchanged.

`tests/game_frame_check.py --browser chrome` covers field-button navigation,
shared bounds, keyboard and modal cancellation, summoning, habitat selection,
upgrades, defenders, 320/390/768/1440px layouts, live combat and save isolation.
The full current gate also checks opening, party, farm, export and bundle flows.
`tests/player_experience_check.py` covers copy, menu routing, dummy rates and
one-time NPC wins.

Owner review: follow Bag → select an item → summon, then Inner Sea → Homestead
→ select a habitat → assign defenders. Review legibility and control density on
the intended device before adopting this as the wider UI standard. The current
request authorizes implementation; device certification and final visual
acceptance remain separate decisions under OR-06.

## Conversations and class choice

`game-frame.css` bounds master, relic and resident conversations to the visible
playfield. Conversations sit near its lower edge with a compact portrait and
44px-or-larger actions; long dialogue scrolls inside the panel. The class-choice
panel uses four columns on desktop and two on phones. `region.js` owns class-test
confirmation; `campaign-menu.js` displays four city directions after Tidecrown;
`relic-quest-view.js` opens the alarm before starting the reserved raid.

Formation selectors are independent: any number of party slots can share a row.
The preview displays every assigned member; combat spreads shared-row actors at
separate Y coordinates. Nearest-target combat uses actual positions, not row names.
