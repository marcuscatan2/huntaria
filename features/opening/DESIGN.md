# Apprentice road — implemented local prototype

The complete approved sequence and acceptance rationale live in
[EARLY_PROGRESSION_SCOPE.md](EARLY_PROGRESSION_SCOPE.md). This document records
the current runtime so an implementation agent can diagnose it without reading
historical passes.

Commercial play pacing and balance remain unapproved under OR-02. Automated
checks prove rules, routing and persistence; they do not prove that the route is
fun, clear or correctly timed for real players.

## Current player path

| Order | Proof required | Saved outcome | Authored trainer XP |
| ---: | --- | --- | ---: |
| 1 | Defeat the first Firstlight Brimble | One normal Brimble Echo, player Lv2 threshold | 100 |
| 2 | Summon it from Inventory | Independent companion; first open party slot filled | — |
| 3 | Find the Forest Mage, then defeat Bloomslime or Stonehorn | Chosen species Echo; player Lv4 threshold | 200 + 300 |
| 4 | Summon the second companion and win the Mage's easy proof | Firstlight exits open | — |
| 5 | Defeat Tavi | `druid-sustain`; player Lv6 threshold | 900 |
| 6 | Defeat Rain, Lina and Wren | Four distinct Druid/Mage demonstrations; player Lv12 threshold | 1,600 + 1,800 + 1,700 |
| 7 | Defeat fixed Lv15 Tidecrown | Class masters appear; player Lv15 threshold | 3,900 |
| 8 | Win either temporary class trial | Chosen master is eligible at Lv20 | 8,500 once across both trials |
| 9 | Confirm Druid or Mage | Persistent specialization and valid default class build | — |
| 10 | Application, counter, ability proof and route resolution | Player Lv25 threshold | 1,500 + 3,500 + 2,000 + 4,000 |
| 11 | Three Amber challenges and fixed Lv30 guardian | Player Lv30 threshold | 3,000 + 2,500 + 3,000 + 5,000 |
| 12 | Spend one owned-monster tree point and win its proof | Early progression complete | — |

Exploration displays one tiny current objective inside the game frame. Firstlight
is the only road gate: its exits open after the visible Forest Mage proof battle.
After that, region levels warn about danger rather than silently blocking travel.

## Opening presentation

- Creation saves a validated two-to-twenty-character name, a fixed appearance
  palette and dagger or bow. A migrated unnamed trainer receives only the
  non-destructive name screen.
- The player wakes at the Firstlight forest camp with no monster. The short
  awakening sentence remains the only introductory narration.
- Only spawn life `clearing-0:emberfox:0` is an introductory attacker. It becomes
  hostile after the normal entry grace and returns to ordinary Emberfox behavior
  after the accepted introductory victory.
- The guarantee belongs to the first accepted Firstlight Brimble kill, so choosing
  a different nearby Brimble cannot strand progression.
- The guaranteed reward is an ordinary Soul Echo in Inventory, not a second
  capture system. Summoning is explicit and atomic; the created individual is
  automatically placed in the first open companion slot.
- After the first summon, the Forest Mage appears on the road and asks for a
  second companion. Bloomslime and Stonehorn remain the reliable guaranteed
  second-role options. The Mage's short proof fight opens every Firstlight exit.
- Firstlight defeat returns to the real forest camp and fully heals the party.
  Later defeat returns to the region town under ordinary injury rules.

Ordinary Echo odds are not changed. The first Brimble and first selected
Bloomslime/Stonehorn rewards are the only onboarding guarantees. Their claims,
summons and reward receipts are idempotent through reload/retry.

The current field HUD owns the quest phrase, its destination region and map,
minimap and current-map name, Atlas entry, event-only status line, and
Explore/Bag/Inner Sea destinations. Map-entry prose does not occupy the status
line; the one-time awakening and actionable event/error feedback remain. A
yellow `!` appears only on an NPC who offers the current quest;
a yellow `?` appears when its objective is ready to deliver. Accepting an NPC
objective removes its marker while the player completes the field requirement.
Trainer and selected companions use fixed thin live/saved HP lines. Selected
fallen companions remain visible and selected, but are benched from new
adventures until revived.

## Progression and class rules

- `trainerXP` is independent of every companion's `xp`. Both use
  `50 × (level - 1) × level` and the visible player cap60.
- Migration seeds `trainerXP` at the old displayed trainer level, then progression
  becomes independent. Companion XP and higher source-level provenance are kept.
- Tavi, Rain, Lina and Wren are two Druid and two Mage demonstrations. A set of
  semantic demonstration IDs, not dialogue views, is the prerequisite.
- Tidecrown and the Amber guardian have fixed progression levels. Their later
  boss-domain altars remain separately configurable reward-free practice.
- A master trial can be attempted before Lv20 with the player's real two
  companions and a temporary three-of-five Druid or Mage skill selection. The
  temporary trainer never overwrites the Apprentice build.
- Only the first completed trial pays the shared 8,500-XP route reward. The player
  may inspect/try either class until final confirmation.
- Confirmation requires the four demonstrations, Tidecrown, that class's trial
  and player Lv20. It atomically sets Druid or Mage and initializes its class
  tree. Normal menu switching is not available to a created character.

The prototype uses persistent commitment, but a future server-controlled
retraining/migration path remains possible. Final permanence wording is an owner
decision; do not add a paid class-change product by assumption.

## Ability and tree lesson

Ability selection is available from the first summon: five known active skills,
three equipped priorities. The Amber lesson records a genuine changed companion
build and then requires an accepted proof encounter.

Monster trees remain visible as a small locked preview before player Lv30.
At Lv30 every individual can spend its own budget in its species tree:

- eighteen stable ranked node IDs and existing 3/5/10 caps;
- five nodes modify that species' named skills (power or cooldown);
- one node uses the species' innate identity;
- other nodes use shared offense, defense, movement and support primitives;
- duplicate species never share purchases or resets.

Previously invested migrated trees are grandfathered. The committed trainer
class tree unlocks at transformation and remains separate from monster trees.

## Intentionally deferred

The Lv25 Inner Sea ownership objective is not active. The current Inner Sea is a
local collection/cosmetic scene, and no bounded non-paid monster-development use
has been approved. Do not present it as the Lv25 reward or implement AFK/daily
power from deferred Game Notes.

Also absent: additional launch classes, permanent-choice production copy, online
players, authoritative group bosses, boss essence rewards and release economy
balance.

## Validation route

Run:

```powershell
python tests/opening_check.py --browser chrome
python tests/pass18_campaign.py --browser chrome
python tests/pass18_ui.py --browser chrome
python scripts/project.py verify --browser chrome
```

Then perform the human gates in the scope: first-30-minute discovery with both
weapons/second-role branches, class readability, Tidecrown telegraph response,
Druid/Mage commitment comprehension, ability adaptation and Lv30 tree clarity.
