# Live encounters

## Lifecycle

Clicking a wild creature walks into contact and immediately reserves/starts its
encounter. The nearby action reads Attack. Every roaming species starts the same
flow on contact unless it is at least ten levels below the trainer. Wild encounters never open an optional
confirmation dialog; NPC conversations, pack entries and boss difficulty
selection remain deliberate interactions.

Pack previews use the first participating monster as their portrait. Opening or
closing a preview does not reserve its residents; only Challenge reserves the
selected lives. Cancel returns to walking. This applies to all forest/cave packs,
including Windstep cave convergence in Thunderhollow Cave.

Only a fallen trainer blocks a new adventure. A selected zero-HP companion stays
in the saved loadout and follows the trainer in the field with an empty HP line,
but `BondAdventure.deploy` removes it from the encounter copy until revival. It
therefore cannot block a trainer-only hunt or increase wild-party scaling. The
loadout selection returns automatically after recovery; no party mutation is
hidden in battle setup.

A lone adventure wild scales to the deployed player party: trainer-only keeps
its authored opening stats, one companion raises it to 1.8× HP and 1.15×
offense, and two companions raise it to 2.6× HP and 1.3× offense. This applies
to basic power and skill pressure without changing level, loot or Echo odds.
Roaming wild sprites do not expose species nameplates; combat still identifies
the opponent in its tactical HUD.

An in-game tab changes the view, not the battle. Loadout edits, attribute changes,
feeding and party selection prepare the next encounter; the active simulator
keeps its reserved build/profile. Explicit Pause stops simulation. Hiding the
browser tab checkpoints and pauses; no offline combat is simulated.

Explore shows the saved world anchor. The trainer cannot walk or travel during
an encounter. Crossed swords identify participants; clicking one opens combat.
Run starts a three-second retreat (60 simulation ticks, affected by playback
speed). Trainers stop acting and move left; companions keep fighting. During
retreat, enemies may target the player's trainer directly using ordinary range,
movement, cooldowns, damage, shields and dodge. This is an explicit exception to
monster-first targeting. Survive the window to escape; a lethal hit still loses
the encounter, and defeating the enemy first still wins normally.

The battle and field Run buttons, and Story & challenges' Run action, use the
same command. Pause also pauses escape. Failed storage writes keep the original
reservation and do not begin retreat. Successful escape keeps accepted drops and
wounds, grants no victory bonus or rescue/heal, and releases the world anchor.
Brief field pursuit grace allows walking away. Surviving spawn lives
retain their identity/roll; they are not rewarded or replaced. Internal cancel
remains a lifecycle/QA cleanup API, not a player-facing instant retreat.

## Joining

region.js advances existing territorial pursuit even when another in-game screen
is open. Contact calls app.joinWild -> profile.joinBattle -> Battle.addEnemy.
The profile first records the original spawn life, its world position and battle
tick atomically. Only then is the initialized enemy added to the simulator.
restoreBattle reconstructs initial inputs and inserts each join at its saved tick.
Initial encounter options must never be rewritten to contain later joiners.

Joined lives remain reserved. Their per-kill claims settle exactly once; NPC
challenge rewards remain separate. No online players, networking or allied
joining rules are implemented. Explicit Pause also stops incoming pursuit.

## Presentation and regression

loot-popup.js and loot.css display one compact in-frame pickup per accepted item
type, with icon, name and quantity. Coins and XP have their own pickups. Each item
expires three seconds after it becomes visible, regardless of hover/focus or
later rewards. At most four are visible; overflow waits for a free slot and
then receives its own full three seconds. There is no battle-summary window,
backdrop, browser-corner card or automatic focus change. Empty receipts produce
no notification.
Echo toasts can open that exact item in Inventory; the persistent first-Echo
world reminder remains available after expiry. Failed saves use a separate
persistent retry notice; accepted items are displayed only after settlement.
Notification visibility never controls rewards or removes inventory items.
Popup art/text let clicks reach the world and Bag beneath them; only their
explicit Dismiss/Inventory buttons intercept clicks.
Accepted profile level increases show a 4.2-second accessible LEVEL UP banner,
the new level and a gold actor ring, including companion levels. Reduced motion
uses static feedback.

Run tests/onboarding_check.py for background ticks, frozen builds, anchors,
territorial joins, replay, retreat, notifications and first-Echo flows. Run all
suites after changing persistence or simulation. Player-copy rules live in
AGENTS.md; odds and retired mechanics belong outside ordinary player UI.

Run tests/field_polish_check.py for focused/hovered notification expiry, field
health boundaries, saved escape/replay, same-tick joins and foliage crop evidence.
The world player has a fixed 46px by 3px HP track and selected companions use
fixed 40px by 3px tracks: green above 50%, yellow 35–50%, red below 35%. They use
live combat units when deployed and saved vitality outside combat; character art
size and facing do not resize or mirror the tracks.
