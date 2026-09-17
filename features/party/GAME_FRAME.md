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
My companions. Bag contains Inventory. Inner Sea has Sea land (Homestead),
Trainer (attribute overview, Class Skill Tree and Equipment) and Party
(My companions, Formation and Species Guide). Companion mastery opens within
Party; Class Skill Tree contains trainer trees. `BondMenu.open('party')` routes
to Formation, which holds companion substitution and Dummy test. `current()`
returns Inventory or Inner Sea, `section()` its leaf and `group()` its tab.

`upgrade-notices.js` derives red badges from the current profile's affordable
attribute upgrades and unlocked class/individual talent nodes. Inner Sea marks all
available upgrades; Bag remains Inventory only. Empty held slots also mark a
route when a compatible unassigned item is owned. The route
continues through the relevant tab, individual companion and pagination,
tree branch, node and Learn control. Badges survive inspection and reload;
spending points clears them and a reset restores them. They never write progress
or change budgets. `menu-navigation.css` styles the badges and shared SVG
destination artwork in `assets/interface/` for exploration and preparation.

Formation contains the [Dummy test](../combat/TRAINING.md), including its incoming
damage toggle. The button is unavailable while an adventure is reserved.
Player copy names actions, costs, skill effects and quest destinations. Release
plans, implementation notes and duplicate tutorials stay out of these screens.

Exploration input stops during preparation. A live encounter continues to tick
and settle in the background; completion does not pull the player out of a menu.
Opening, closing, drawing and exporting these screens cannot award inventory.
Stable profile and build identifiers remain unchanged.

`tests/game_frame_check.py --browser chrome` covers field-button navigation,
shared bounds, keyboard and modal cancellation, summoning, habitat selection,
upgrades, defenders, 320/390/768/1440px layouts, live combat and save isolation.
The full current gate also checks opening, party, farm, export and bundle flows.
`tests/player_experience_check.py` covers copy, menu routing, dummy rates and
one-time NPC wins.
`tests/menu_upgrades_check.py` follows badge routes through real controls,
trainer/companion level-ups, repeated species, pagination, spending, resets,
reload and 320/390/768/1440px icon layouts using isolated saves.

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
