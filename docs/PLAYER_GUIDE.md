# Player guide — apprentice opening

Fresh adventures now begin with character creation: a name, simple appearance
choices and a dagger or bow. You wake alone in Firstlight's forest. Click a
creature to approach and fight. Roaming monsters attack when you approach unless
they are at least ten levels below your trainer. You can still choose to fight
these weaker creatures.

Firstlight has288 residents:144 Brimble Lv2,96 Bloomslime Lv3 and48 Rattlebit Lv5.
You start at Forest camp. Nearby meadows contain Brimble; the middle grove has
Bloomslime; Rattlebit live deeper in the eastern forest. Wounds carry between
victories. **Return to camp ? free rest** walks you to the tent for free healing.
Firstlight defeats return you to camp fully recovered, with progress kept.
Defeats elsewhere return to a city; arriving in a city heals your entire party.
Portable recovery items are sold in city shops.
First-map drops include supplies.

Apprentices now earn hunting XP before summoning: two Lv2 Emberfox wins reach
Lv3 then Lv5, even with no Echo drop. This starter track caps at5; train your
companions to progress beyond that. Level gains show a brief gold effect.
Soul Echoes can be summoned from Inventory → Echoes.

Explore and Loadout keep a fight running. Loadout edits apply to the next fight.
Your trainer stays at the encounter location; crossed swords mark participants.
Nearby territorial monsters can approach and join as enemies. **Run** starts a
three-second escape: your trainer retreats, companions cover, and enemies can
still hit you. Survive to leave with your wounds and earned drops. **Pause**
stops it; reload offers **View battle** to resume. Each item appears in its own
three-second popup, with coins and XP shown separately. Your items stay in Inventory.
The thin health line beneath your character is green above 50%, yellow 35–50%,
and red below 35%.

Gold numbered exit badges match the larger minimap markers and destination
buttons above the map. Clicking either walks to the real gate; locked routes
show their required level. No minimap teleports are introduced.

Click the painted road signs to read local descriptions, including Sheltered
spring. Detached green location icons are removed; descriptions no longer show
respawn timing or Echo probabilities. Actual drop rates are unchanged.

Existing adventures keep their progress and do not reopen creation. To try the
new opening without resetting your normal save, open
[isolated QA](http://127.0.0.1:8765/?test=1) and confirm **Restart progress** in the
visible TEST MODE bar above the tabs. **Heal party** restores everyone for free
between encounters, anywhere on the map; it does not consume supplies.
These shortcuts affect only the isolated test adventure.
Specialization quests are not implemented yet.
The [opening design and play-review questions](../features/opening/DESIGN.md)
describe the intended first 30 minutes; pacing and fun still need owner review.

## Preserved Pass18 instructions

Preserved play instructions and historical pass context. For current developer
navigation and engineering commands use [README](../README.md).

# Bond & Bolt — The Six Reaches

Pass18 adds **15% test Echo odds**, a visual World Atlas, direct road-sign
information, faster wild levels/XP, persistent injuries, free village sanctuary
recovery and a physical **Supply Store** with3-coin healing /6-coin revival items.
Only Emberfox is Lv1; Firstlight's other residents are Lv5/8/10. Recovery items
work between encounters. Builds stay in Party & bag; changing class does not heal.
See [current behavior and owner playchecks](<../PASS20_VALIDATION.md>).
Hard-refresh http://127.0.0.1:8765/ with Ctrl+F5; no save reset is needed.

The following Pass17 and earlier notes are historical where Pass18 supersedes them.

Pass17 adds map-wide random respawns, per-species counts and rare60s cooldowns,
Loadout-only preparation, corrected left/right facing and a painted timber bridge.
The100-species guide is now organized into the requested inspiration families.
See [historical Pass17 validation](<../PASS17_VALIDATION.md>) and [creature families](<../CREATURE_FAMILIES.md>).
Hard-refresh the running preview with Ctrl+F5. Your normal save is not reset.

Pass 16 adds the local parts of F-017–F-026: six story chapters /48 objectives,
60 trainer lessons,12 resident-backed packs,18 optional recognition challenges,
saved encounter resume, six phased reward-free bosses and a reference-art pass.
See [delivery, test results and remaining work](<../PASS16_VALIDATION.md>). This is not
ten commercially completed features: real online groups and approved roster-wide
production animation remain missing. Two classes, zero-to-two individual companions, a 100-species catalog,
24 large maps, six town hubs and six boss domains, Soul Echo summoning, inventory, attributes,
formation and eighteen-node trees. Automatic arena combat retains the original
Druid/Emberfox/Stonehorn pose animation.

This is **not a commercially accepted release**. Ninety new species use
code-native prototype portraits and shared effect mechanics; art, distinctness
and balance need owner review. Six boss species can be tested, but their actual
online group acquisition is not implemented. No accounts, multiplayer authority,
payments, telemetry or external runtime dependencies.

## Play

From this folder:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open [the local game](http://127.0.0.1:8765/) or
[the isolated test adventure](http://127.0.0.1:8765/?test=1).
If connection is refused, restart that local server. Ctrl+F5 refreshes scripts.
You can also open index.html directly; browser/port/file origins have separate
saves. Do not switch origins expecting your progress to follow.

The test adventure has an expandable QA panel. Grant an Echo of any species at
a chosen source level, then **summon it from Inventory or Inner Sea**. A Lv61–100
test Echo summons as a Lv60 companion; its higher source level is retained in the
save. Firstlight opens after the Forest Mage trial; later roads remain open and
atlas colors warn about danger. Test grants never modify the
normal profile; they test UX, not natural drop probability.

## New in pass16

**Explore → Story & challenges** opens the campaign journal and optional goals.
Begin with the Town Keeper in Mosslight Village. Trainers and pack markers are
physical map encounters. Packs reuse current wildlife lives; losing or abandoning
keeps only accepted kills. Resume an interrupted fight from the same journal,
or use Run to attempt an escape. The original party/seed/supplies are
reserved, so changing the loadout does not silently restart that encounter.

Boss altars now have individual warning/impact/recovery phases and a choice of
one, two or three **simulated** practice parties. Three full parties plus boss
attendants make13 actors. This is local testing, not connected human players;
practice never awards XP, coins or essence.

Open [the isolated art reference](http://127.0.0.1:8765/?test=1&reference=16)
for the reproducible combat/summon sequence. [Art bible](<../ART_BIBLE.md>) and
coverage metadata distinguish prototype rigs from approved production animation.

## The first hunt

1. Start with a Druid and no monsters. Party & bag → Your party lets you choose
   Mage instead. Both can defeat a level-1 Emberfox without supplies.
2. Click a visible Emberfox to attack; combat starts on contact and is automatic.
   Pause/resume and 1×/2× are solo controls. A win immediately returns to the
   map and displays each earned item inside the field; no manual return is needed.
3. Each Emberfox kill gives six coins and a temporary15% Echo chance. There is **no**
   guaranteed first drop, escalating chance or pity.
4. An Echo is an item, not yet a companion. Inventory → Echoes → Summon, or
   Inner Sea → species → Summon, consumes one Echo with **100% success**.
5. Click an empty/occupied party portrait to open the visual picker, then choose
   an individual. Search by name/number/element and filter by role. Selecting an
   already-equipped individual swaps its slot. Each copy retains its own skills.
   Prepare three distinct priorities from its five choices.
6. Trainer level follows the highest owned individual, including benched ones.
   Spend attributes, choose formation, and invest in ranked passive trees.

Summon as many copies as you have Echoes: each is an independent individual with
its own XP, level, skills and tree. Two of the same species can fight together,
but one individual cannot occupy both slots. Inner Sea separates My companions
from the 100-species guide. Echoes cannot be traded.
Papyrus/65%/90% catch mechanics are retired. Existing papers become keepsakes.

## Explore

- WASD/arrows walk; click/tap ground to move; Escape stops; E interacts nearby.
- Click creatures, caches, Keepers or gates to approach; paths route around obstacles.
- Record landmark discoveries in your Field journal; preparation is in Party & bag.
- The local minimap issues walking destinations, never teleports. World atlas
  walks through connected gates to your chosen unlocked destination. WASD, Escape
  or a new ground click cancels the itinerary.
- Towns have cave/forest gates, a free-healing sanctuary, a clickable Supply Store,
  story Keepers and challengers. Buy healing items for3 coins or revival for6.
  Inventory, Inner Sea and build editing stay in Party & bag, not world NPCs.
- Each large map is a genuine 2D space. Base speed is 210 world units/second;
  every large-map opposite-edge route must exceed 30 seconds. Authored and
  pathfinder-measured lengths are different; the sidebar labels authored routes.
- Wildlife is distributed across each source map, not fixed habitat groups.
  Each species has8 Common/5 Uncommon/1 Rare or Very rare residents. Ordinary
  replacements appear elsewhere immediately; rare replacements wait60s.
  The sidebar shows current/target counts. All Echo chances are temporarily15%
  for testing. Release10% /0.01% proposals are preserved, not live.
- Six biome scene kits, nine textured ground materials, visible bridges and cave
  boundaries replace the old circle scenery. Foreground objects fade near the trainer.
- Scenery: Low reduces ambient work. Retry scenery recovers failed art downloads;
  walking remains available. Wide exploration hides the sidebar.
- Dead spawn lives, accepted kill receipts, coins and Echoes persist. Reopening
  a map or changing skills does not reroll an existing spawn.
- Six boss altars offer **reward-free local previews**, with levels 1–100.
  They do not stand in for multiplayer bosses or issue boss essences.

Inner Sea is still a collection/summoning screen, not a walkable hideout.
Account mastery, evolution quests, cosmetics and AFK chores are not implemented.

## Saves and boundaries

Normal profile: `bond-bolt-profile-v7`; test profile: same key plus `-sandbox`.
Builds use `bond-bolt-build-v4` with the corresponding sandbox suffix.
Old v6/v5/v4 profiles and v3/v2/v1 builds are migration inputs; originals are not
overwritten. Same-mode v6/v3 test saves migrate too; normal and test saves stay separate.
Existing companions become stable legacy individuals with valid XP, trees and
saved equipped skills. Coins/items and v6 atlas position are preserved;
invalid/excess ranks are reported in the migration notice.

Use Explore → Export local save for a JSON backup. Import UI is not implemented.
Reserved encounters persist their original build/profile/seed/supplies and last
committed tick, replayed on resume. Current HP persists separately between real
encounters. A crash can lose the uncommitted second; accepted kills do not pay twice.
A storage error is not a server confirmation: retry a pending reward/summon
before closing the page. Same-device receipts resist ordinary retries, **not**
developer-tools cheating, simultaneous cross-device writes or account forgery.

## Validate and develop

Current pass: `python tests/pass18_check.py` and `python tests/pass18_ui.py`,
with `--browser edge` for Edge. These run isolated sandbox saves. The check suite
also writes the runtime manifest for `python scripts/refresh_pass18_reference.py`
and `python scripts/creature_reference.py --write --check`. Do not reuse Pass17
source exports for current reference data. Planning check: `python tests/scope_docs_check.py`.


Your practical checklist and feature status:
[PASS20_VALIDATION.md](<../PASS20_VALIDATION.md>).
Actual rules and coefficients:
[Companion stats.md](<../Companion stats.md>).
Full commercial criteria remain in [FEATURE_BACKLOG.md](<../FEATURE_BACKLOG.md>).

```powershell
python tests/pass18_check.py
python tests/pass18_check.py --browser edge
python tests/pass18_ui.py
python tests/pass18_ui.py --browser edge
python tests/pass18_campaign.py
python tests/scope_docs_check.py
python scripts/creature_reference.py --check
```

Browser tests use isolated Chrome/Edge contexts, an ephemeral localhost server,
and the pre-existing temporary Playwright installation. They do not touch your
personal browser profile. Reports/screenshots go to tests/artifacts/.
[Current in-browser mechanics checks](<../tests/index.html?test=1>) run without Python.
Earlier pass-specific suites remain historical; their old capture, odds, spawn
and service assertions are not the current rules.

Main modules: rules.js (categories/RNG), roster.js (100-species content),
game.js (20-Hz simulation), adventure-rules.js (test tuning/health),
world-atlas.js (geographic atlas), recovery-menu.js (village/field supplies),
progression.js/growth.js (stats/trees),
atlas-data.js/world-layout.js (world geography), world-nav.js (routing),
world-renderer.js/region.js (illustrated exploration), echoes.js/profile.js (local inventory/receipts),
menu.js/companion-picker.js (individual selection), loot-popup.js (wild results),
inventory-menu.js (supplies/summoning), creature-art.js (new SVG art).
## World implementation and commercial design

[WORLD_DESIGN.md](<../WORLD_DESIGN.md>) scopes all 24 authored maps/six towns, biome
kits, first-map blockout, performance budgets, production gates and commercial risks.
Its local world layer is implemented in pass 15; the broader commercial definition
of completion is not. Generated bitmap scenery and exact prompts are in
[assets/world-v15/prompts.json](<../assets/world-v15/prompts.json>). Final visual acceptance
and rights/trademark review remain owner release gates.
[CREATURE_DESIGN.md](<../CREATURE_DESIGN.md>) has 100 silhouette/motion briefs and asset
acceptance requirements. [CREATURE_REFERENCE.md](<../CREATURE_REFERENCE.md>),
[CREATURE_DROPS.md](<../CREATURE_DROPS.md>) and [the CSV](<../CREATURE_REFERENCE.csv>)
record all 100 species' actual stats/loot and distinguish proposed ordinary drops.
No new wild material-drop rules or approved commercial art packages were added this pass.
