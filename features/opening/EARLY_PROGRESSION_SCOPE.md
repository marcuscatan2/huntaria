# Early progression scope: arrival through player level 30

Status: **implemented locally, including four classes and the first EP-10 farm;
commercial playtest acceptance remains pending**.
This document scopes the progression direction supplied on 2026-09-13. The
implemented runtime contract is summarized in `DESIGN.md`; this file retains the
detailed rationale, target pacing and human validation gates.

The purpose of this sequence is to take a fresh player from an unexplained
arrival to a stable personal loop: recruit companions, understand four launch
classes, commit to one at player level 20, learn to adapt a familiar monster,
establish the Inner Sea at player level 25, and unlock monster skill trees at
player level 30.

## Decisions and adaptations

### Four launch specializations

The owner expanded the class scope on 2026-09-14: Druid, Mage, Hunter and
Swordsman follow Apprentice. Four demonstrations now teach one class each.
Four masters offer easy acceptance battles using the player's current party,
then explicit specialization at player Lv20. See [CLASSES.md](CLASSES.md).

### Separate trainer and monster progression

The old `trainer level = highest owned monster level` rule is retired. Trainer
and monster XP become independent values, but use the same existing cumulative
curve for now:

`XP required for level L = 50 x (L - 1) x L`

Important thresholds are: Lv2 `100`, Lv3 `300`, Lv4 `600`, Lv5 `1,000`, Lv10
`4,500`, Lv15 `10,500`, Lv20 `19,000`, Lv25 `30,000`, and Lv30 `43,500`.
The player/owned-monster launch cap remains Lv60; the engine and wild-monster
curve remain valid through Lv100.

Every accepted encounter can award trainer XP and participating-monster XP as
separate receipt fields. Quest rewards may award trainer XP and bounded XP to
participating companions, but they must never set one level from the other.
Required content supplies enough trainer XP to reach each milestone without a
generic grind objective.

### Preserve open-world travel after one visible opening gate

Firstlight begins as an enclosed tutorial area. Its physical exits are visibly
locked until the player meets the Forest Mage, summons a second companion and
wins the Mage's easy proof battle. This is the only opening road lock. Once it is
cleared, roads remain physically open: Atlas danger colors warn rather than
silently level-gating travel. A player may explore ahead, lose, retreat or return;
the authored route remains the reliable path through the level milestones.

### Keep Soul Echo rarity outside the introduction

The first companion and one second-companion choice use explicit one-time reward
guarantees. They grant the normal species Echo through an accepted encounter
receipt; they do not create a second capture item or alter ordinary Echo odds.
All ordinary wild lives continue to use the current configured drop table.

## Target pace and guaranteed trainer-XP budget

Times are playtest targets, not timers or player gates. Optional combat may put a
player ahead of the minimum level. The authored route must never leave them below
the next required milestone.

| Phase | Target elapsed play | Minimum trainer-XP state | Intended outcome |
| --- | ---: | ---: | --- |
| Arrival and first summon | 0-12 min | 100 / Lv2 | Player has summoned Emberfox from Inventory |
| Mage meeting, second choice and proof | 12-30 min | 600 / Lv4 | Two usable monsters are in the party and Firstlight exits are open |
| First trainer | 30-45 min | 1,500 / Lv6 | First class demonstration completed |
| Willowbrook route and remaining demonstrations | 45-120 min | 6,600 / Lv12 | Four distinct demonstrations completed |
| First creature boss | 2-3 h | 10,500 / Lv15 | Tidecrown defeated; route to masters established |
| Class trial and transformation | 3-5 h | 19,000 / Lv20 | Player joins one of four classes |
| Counter-building and ability lesson | 5-8 h | 30,000 / Lv25 | Player adapts a monster and earns Inner Sea ownership |
| Amber Hollow progression | 8-12 h | 43,500 / Lv30 | Species-specific monster trees unlock |

Recommended authored minimum reward slices:

| Completed content | Trainer XP | Minimum cumulative XP |
| --- | ---: | ---: |
| Introductory Emberfox | 100 | 100 |
| First companion proof encounter | 200 | 300 |
| Chosen second-companion encounter | 300 | 600 |
| Tavi's first trainer lesson | 900 | 1,500 |
| Three demonstrations, discoveries and one preparation encounter | 5,100 | 6,600 |
| Tidecrown victory | 3,900 | 10,500 |
| Master route, chosen trial and master duel | 8,500 | 19,000 |
| Post-transformation encounters through Inner Sea eligibility | 11,000 | 30,000 |
| Post-Hideout Amber Hollow route | 13,500 | 43,500 |

These are initial pacing constants, not promises for the release economy. Split
the grouped rewards across meaningful objectives during content authoring. Never
add a `gain more levels` step to compensate for an underfunded route.

## Detailed progression sequence

Every subsection separates actual player-facing progression gates from developer
validation gates. Validation findings must never be converted into hidden player
requirements.

### EP-01 - Arrival and introductory attack

**Entry conditions**

- Fresh named Apprentice profile at the Firstlight forest camp.
- No introductory-reward receipt and no first companion.

**Encounter and interaction**

- Retain the short awakening: the player cannot remember how they arrived.
- Do not add a cutscene, guide dialogue chain or invented lore explanation.
- A one-time introductory Emberfox notices and attacks the player after a short
  movement-safe grace period. Normal Emberfox residents remain passive.
- Use the existing Apprentice dagger or bow build and normal automatic combat.
  Do not teach a temporary manual-action system.
- Defeat uses the established Firstlight camp recovery and resumes this step.

**Reward and state change**

- The first accepted Firstlight Emberfox victory awards 100 trainer XP and
  exactly one guaranteed Brimble Echo through a unique receipt. The designated
  nearby attacker remains the default discovery path, but another Brimble kill
  cannot strand the objective.
- The Echo appears as its own three-second in-world pickup notification and in
  Inventory. The ordinary loot receipt remains idempotent.
- Set `opening.introFightWon`; never regenerate the guarantee after reload,
  restart of UI, retreat after settlement, or revisiting the spawn.

**Progression gate**

- Introductory encounter resolved by victory.

**Validation gates**

- The fight is readable and winnable with both starting weapons without items.
- The player is not attacked before they can orient and move.
- Defeat cannot consume the one-time reward or leave the encounter reserved.
- Ordinary Emberfox drop odds are unchanged.

### EP-02 - Inventory summon and first party member

**Entry conditions**

- `opening.introFightWon` and the introductory Echo is owned or its summon has
  already been accepted.

**Encounter and interaction**

- Show one minimal in-frame objective and sequential visual emphasis: choose Bag,
  select the Brimble Echo, choose **Summon**.
- The existing Echo item and summoning command are used. No paper, ball, ritual
  minigame or Inner Sea access is introduced here.
- The inventory opens to Echoes with the relevant item selected. If the player
  closes it, the objective remains available without taking over the screen.

**Reward and state change**

- Summoning atomically consumes one Echo and creates one independent Emberfox.
- If a party slot is empty, this first summon joins it automatically; a brief
  `Emberfox joined your party` confirmation is sufficient.
- Record `opening.firstSummon`; duplicate clicks or save retries cannot create a
  second individual from the guaranteed item.

**Progression gate**

- A usable summoned monster exists in the active party.

**Validation gates**

- A player can identify the Echo, complete the summon and explain what changed.
- Closing Inventory, reloading and interrupted critical saves are recoverable.
- The collection, party picker and world follower reference the same individual.

### EP-03 - Prove the companion and choose a second role

**Entry conditions**

- First summon is in the party.

**Encounter and interaction**

- After the first summon, place the Forest Mage between the camp and the locked
  exit. Speaking once records the meeting and changes the objective to obtaining
  a second companion. The Mage uses one concise line, not a guide sequence.
- Place a suitable ordinary fight on the route out of the camp where Emberfox's
  movement and Pounce/Cinderbite contribution is visually obvious.
- Defaults are already equipped. Ability selection remains available from the
  first summon but is not fully explained yet.
- At a fork, use existing scenery signs to identify two accessible choices in
  concise mechanical language:
  - Bloomslime: restores allies; fragile support.
  - Stonehorn: protects the trainer; slow frontline tank.
- The first victory against either designated introductory candidate consumes
  the one-time second-acquisition guarantee and grants that species' normal Echo.
  The other species remains obtainable through ordinary rules. This makes the
  choice spatial and playable instead of a selection dialog.

**Reward and state change**

- Companion-proof fight: 200 trainer XP minimum.
- Chosen acquisition fight: 300 trainer XP minimum and one guaranteed selected
  Echo. The summoned individual joins the second empty party slot automatically.
- Record the selected species and both accepted encounter receipts.

**Progression gate**

- Two living, usable individuals occupy the two companion party slots.

**Validation gates**

- Both Bloomslime and Stonehorn routes are viable with the starter Emberfox.
- The player can notice at least one role difference without opening a glossary.
- A natural Echo obtained early cannot break the step; any two usable monsters
  satisfy the party gate.
- The one-time guarantee cannot award both choices through simultaneous/replayed
  completion.

### EP-04 - Forest gate proof and first class demonstration

**Entry conditions**

- Two usable party companions. The Forest Mage states this requirement when
  challenged; interaction before it is met returns to the second-companion
  objective.

**Encounter and interaction**

- First, run a deliberately easy Forest Mage battle. It grants no progression
  reward; its accepted victory opens the physical Firstlight exits. The player
  still wins only by protecting their trainer.
- Reuse Tavi as the first class-demonstration trainer in Mosslight Village.
- Tavi is a Druid whose actual behavior shows support from behind the monsters:
  Mend/Barkskin sustain and Bramble control must occur during the fight.
- Before combat, give one short identity line. Do not explain the full kit.
- Make formation or skill priority consequential. The Bloomslime and Stonehorn
  choices must both have a credible winning arrangement.

**Reward and state change**

- The Mage proof records `mageGate` once and changes no XP budget. Tavi's first
  victory grants 900 trainer XP minimum and records demonstration ID
  `druid-sustain`, not merely `defeated Tavi`.
- Defeat returns the player to nearby free recovery with a concise hint based on
  the actual loss pattern. Retry does not replay acquisitions.

**Progression gate**

- Defeat the Forest Mage, then defeat Tavi with two usable companions.

**Validation gates**

- Testers can find the Mage, understand why the exit is locked, and see it open
  after the proof without mistaking the gate for a level requirement.
- Testers can identify that the Druid kept its monsters fighting.
- The encounter cannot be won or lost solely because one second-companion choice
  was secretly correct.
- Rewards and demonstration credit are granted once.

### EP-05 - Willowbrook route and four demonstrations

**Entry conditions**

- Tavi defeated. The Forest Mage gate is already open; the authored route and
  current objective move into Willowbrook.

**Encounter and interaction**

- Use the existing Willowbrook maps and trainer roster. Reposition selected
  existing trainers along a coherent Brookside Fields -> Rainwillow Forest ->
  Reedwatch Banks -> Springwater Cave route instead of making the player bounce
  between arbitrary generated locations.
- Complete these four total pre-transformation demonstrations:

| Demonstration | Existing class | Required visible identity | Player response taught |
| --- | --- | --- | --- |
| Tavi / `druid-sustain` | Druid | Heal/ward monsters from the rear | Apply enough focused pressure |
| Rain / `mage-control` | Mage | Slow movement and action tempo | Cleanse, haste or use ranged reach |
| Lina / `hunter-range` | Hunter | Pinning shot and ranged pressure | Protection, reach and closing the distance |
| Wren / `swordsman-frontline` | Swordsman | Sword lunge and Parry beside companions | Wait out protection and adjust frontline pressure |

- Each trainer gets one pre-fight line and one accurate retry hint. The mechanics,
  teams and arena setup—not dialogue alone—differentiate them.
- Include exploration discoveries and one supported preparation encounter between
  trainers so the route supplies a useful response before it is assumed.

**Reward and state change**

- The route after Tavi awards at least 5,100 combined trainer XP, bringing the
  authored minimum to Lv12.
- Record four unique demonstration IDs in a set. Repeated wins may use ordinary
  repeat rewards but never duplicate demonstration progress.

**Progression gate**

- Complete the Willowbrook authored route and all four demonstration IDs.

**Validation gates**

- Testers can describe one useful difference among Druid, Mage, Hunter and
  Swordsman without recalling skill names.
- Hints name the observed mechanic and a category of response, not a mandatory
  species or undisclosed loadout.
- Required XP comes from first-time purposeful content; no repeated wild farming
  is necessary.

### EP-06 - First single-creature boss: Tidecrown

**Entry conditions**

- The Willowbrook route reaches the existing Springwater Cave boss approach.
- No player-level check is applied to entering or attempting the fight.

**Encounter and interaction**

- Use Tidecrown, Willowbrook's existing boss species, as a single enemy with no
  trainer. Preserve the player's trainer plus two-monster party and normal
  trainer-death loss rule.
- Initial balancing parameter: enemy Lv15. This is not an entry requirement.
- Reuse the existing readable rear-pressure pattern: **Tidal Return** warns, then
  threatens the trainer/rear rank. Guard, ward or formation is the learned answer.
- Do not add multiple new resources, break bars or manual dodge controls. The
  encounter needs one telegraph, one consequence and one learned response.
- Defeat presents the actual reason and permits immediate retry from the cave
  approach without repeating trainer demonstrations.

**Reward and state change**

- First victory grants at least 3,900 trainer XP, bringing the authored minimum
  to Lv15, plus ordinary bounded loot.
- Record a unique progression-boss receipt. This introductory boss does not grant
  live boss essence or pretend to be an online group kill.

**Progression gate**

- Defeat Tidecrown.

**Validation gates**

- Players can see the warning, connect it to the hit and make a relevant change.
- A prepared player below Lv15 can attempt and can win; the fight is not only a
  numerical check.
- Retrying never requires unrelated route repetition.

### EP-07 - Masters, class trials and Lv20 transformation

**Entry conditions**

- Tidecrown defeated and all four class demonstrations complete.
- The player may meet and begin any master's quest before Lv20.

**Encounter and interaction**

- Place four launch masters in Amber Crossing: Druid, Mage, Hunter and Swordsman. Their names remain
  a content dependency; do not invent established lore in implementation.
- Inspect all four offers before committing. Defeating one master does not permanently
  lock the other until final confirmation.
- Defeat the chosen master with the player's current Apprentice party. The
  master actually uses the offered class and explicitly promises an easy battle.
  Winning returns to the field; return to the master and confirm **Become [class]**.
  The shared XP reward pays once across all four master victories. There is no
  temporary player-class swap or additional trial skill-selection screen.
- Do not require a named species or both companions at Lv20. The quest may
  recommend roles and accessible habitats, but success in the actual class trial
  proves readiness.
- The master route, preparation encounters, trial and final master duel award a
  combined minimum of 8,500 trainer XP. A player completing all required content
  therefore reaches Lv20 without filler combat.
- After the chosen trial and Lv20, show the final confirmation with the actual
  class identity, equipped kit preview and consequence. Normal gameplay does not
  offer free class switching.

**Reward and state change**

- Atomically change Apprentice to the chosen launch class, preserve appearance, name,
  inventory, monsters, formations and accepted receipts, and initialize the
  chosen class's valid default build.
- Record specialization and transformation receipt once.
- Immediately offer one short, favorable application encounter using the chosen
  class and existing party.

**Progression gate**

- All four demonstration IDs, chosen class quest, chosen master duel, player
  Lv20, and explicit final confirmation.

**Validation gates**

- The player can explain what their class contributes and name one party/build
  decision affected by it.
- Both early second-companion choices can defeat each of the four masters.
- Transformation is atomic, resumable and cannot duplicate rewards or erase the
  active party.
- The post-transform fight lets the new class succeed before difficulty rises.

**Commercial decision before implementation**

The brief calls the choice permanent. A technically irreversible choice is risky
before class balance and alternate-character support exist. Recommended launch
policy: persistent commitment with no free menu switching, but retain a server-
controlled retraining/migration path that is not sold for money. The final
player-facing permanence wording needs owner approval before production copy.

### EP-08 - Post-class counter-building loop

**Entry conditions**

- Specialized class and successful application encounter.

**Encounter and interaction**

- Progress through stronger trainers, one mini-boss and Amber Hollow exploration
  using the recurring loop:

  `read problem -> identify response -> explore/recruit/train/adjust -> retry`

- Each authored challenge exposes one existing interaction: slow/haste/cleanse,
  trainer bypass/guard/ward, area pressure/team sustain, or reach/formation.
- Hints explain why a response works. They can identify an accessible habitat or
  example species, but the gate checks victory rather than exact ownership.
- Include one introductory counter-building quest with a bounded acquisition
  route. If the required answer is not already owned, a designated encounter can
  guarantee one appropriate normal Echo once. Other acquisition retains ordinary
  rarity.
- New summons start at their accepted source level under existing level-cap rules,
  avoiding disproportionate catch-up grinding.

**Reward and state change**

- This loop, the ability lesson below and the regional resolution award 11,000
  minimum trainer XP from Lv20 to the Lv25 threshold.
- Record investigation, counter-acquisition eligibility and mini-boss victory
  separately so a player who already owns a solution can skip only redundant
  acquisition—not the challenge.

**Progression gate**

- Defeat the relevant mini-boss and complete its associated investigation/route.

**Validation gates**

- At least two viable solutions work for every required encounter.
- A prescribed example species is never the hidden gate.
- Reliable teaching acquisition is bounded; ordinary rare hunting remains rare.
- A loss gives an accurate, actionable reason.

### EP-09 - Formal monster ability-selection lesson

**Entry conditions**

- Post-class progression, before Inner Sea ownership, with at least one familiar
  monster that has a meaningful alternative among its five abilities.

**Encounter and interaction**

- Ability selection remains fully available from the first summon: five known
  choices, three equipped priorities. It is not unlocked here.
- Select a lesson variant from owned monsters:
  - Bloomslime can replace a less relevant action with Fresh Start against status;
  - Stonehorn can bring Bondguard/Rallying Ward against rear pressure;
  - future species need an authored `abilityLesson` mapping before serving as the
    tutorial subject.
- Guide the player through the existing monster detail/loadout, make one change,
  then run a proof encounter where its effect is visible.
- If the player already changed an ability and the current build satisfies the
  lesson, acknowledge discovery and proceed directly to the proof encounter.

**Reward and state change**

- Record `abilitySelectionUnderstood` from the accepted proof encounter, not from
  opening/closing the menu.
- Grant a portion of the Lv20-25 authored XP budget; do not grant a new feature.

**Progression gate**

- Complete the associated proof encounter or demonstrate its already-configured
  valid counter in that encounter.

**Validation gates**

- Curious players can use ability selection before this lesson without misleading
  locks or disabled controls.
- The choice is situational, not an obvious permanent upgrade.
- Players can distinguish equipped battle abilities from passive skill-tree nodes.

### EP-10 - Inner Sea ownership at player Lv25

Implemented as the first local farm batch following the owner's 2026-09-14
request. At Lv25, establish the farm from the Inner Sea screen. The current
objective leads there after the Amber route resolution, before Amber mastery.
One house and five habitats display the highest-level compatible residents.
Cleanliness enables AFK training of every owned copy; species maxima contribute
power. Five individually assigned defenders face daily, lunar-scaled monster
attacks at trainer level. Defeat removes XP from all owned monsters and damages the farm;
item repair restores training and bonuses. Successful defense grants ordinary
attacker loot and a read-only replay.

[Farm scope and tuning](../inner-sea/FARM_SCOPE.md) owns exact local defaults,
clock/save contracts, migration, validation and the later habitat-equipment batch.
Decoration never sells power. Equipment from bosses/dungeons remains future work.

### EP-11 - Species-specific monster trees at player Lv30

**Entry conditions**

- Player Lv30. Ability selection remains separate and continues to work.

**Encounter and interaction**

- Before Lv30, monster detail shows only a restrained `Skill tree - unlocks at
  player Lv30` preview. It does not display a wall of unusable nodes.
- At Lv30, introduce the tree through a monster already used by the player. Spend
  one point and run a short proof encounter showing its consequence.
- Retain the existing 18-node, ranked, per-individual model and current point
  resource. Do not add a new currency solely for onboarding.
- Replace the current one-size-fits-all tree with data-driven species definitions:
  - 18 nodes per launch species;
  - ranks use the existing 3/5/10 patterns;
  - general survivability/offense branches may share tested effect primitives;
  - at least six nodes per species must express that species' passive or named
    abilities, so trees are genuinely species-specific;
  - no tree may invalidate the monster's initial role or require a single build.
- Points remain attached to each independent individual. A newly summoned
  high-level monster receives the point budget appropriate to its own level; it
  is not made useless by account age.
- The specialized trainer's class tree is a separate system. It may become
  available with class transformation at Lv20; it must not be described as a
  monster species tree.

**Reward and state change**

- Set the player-level feature unlock at Lv30. Purchases remain individual,
  validated and persisted through existing growth commands.

**Progression gate**

- Player Lv30 for access; existing individual point/prerequisite rules for node
  purchases.

**Validation gates**

- The first upgrade has a measurable, understandable effect.
- Starter species trees contain real species interactions, not only renamed stats.
- Respec cannot duplicate points. Reload and multiple copies remain independent.
- All 100 launch species require valid tree data before commercial launch, but
  production can be delivered and tested in roster batches.

## Persistence and migration contract

The progression must be receipt-driven and interruption-safe. UI events do not
grant rewards or milestone credit.

Minimum saved state:

- independent `trainerXP` and each companion's existing independent `xp`;
- ordered opening step/state plus unique accepted reward receipts;
- consumed intro guarantees and selected second-acquisition species;
- set of class-demonstration IDs;
- chosen/active/completed class trial and permanent specialization receipt;
- ability-lesson completion;
- `farm.owned` and the player-level monster-tree access rule;
- tutorial/hint acknowledgement only for presentation, never as progression proof.

Migration rules:

1. On first migration, initialize trainer XP at the threshold of the trainer level
   shown by the old build. This avoids level loss, after which progression is
   independent.
2. Preserve every companion's XP, source level, build, tree, health and identity.
3. Existing Druid/Mage saves remain specialized and do not replay transformation.
4. Existing saves with a persisted Inner Sea layout are grandfathered as owners.
5. Existing saves with invested monster-tree nodes retain access and effects even
   if their migrated trainer level is below 30.
6. Introductory guarantees are never retroactively awarded to progressed saves.
7. Active/reserved encounters either resume under their saved rules version or
   settle before migration; never change their party or reward table mid-fight.

## Player-facing presentation

- One active objective at a time; optional details/hints remain available.
- Use world signs, route placement, enemy behavior and combat animation before
  explanatory panels.
- Pre-fight trainer dialogue: one line. Retry advice: one observed problem and one
  category of response.
- Never show Echo odds, respawn implementation, receipt language, hidden scaling
  or internal gate counters in ordinary UI.
- Level and feature milestones use the existing in-frame visual language.
- Locked feature previews state only the real level requirement and purpose.
- Do not name systems or lore that have not been established in content data.

## Implementation work packages

| Order | Package | Primary owners | Deliverable |
| ---: | --- | --- | --- |
| 1 | Independent trainer progression | growth, persistence, combat, UI | `trainerXP`, migration, separate rewards and Lv60 cap |
| 2 | Opening state/receipt model | opening, persistence, collection | Resumable steps and one-time guarantees |
| 3 | Intro fight and first summon | opening, population, combat, collection | EP-01/02 complete with both weapons |
| 4 | Second role choice | opening, world, population, party | Spatial choice, second guarantee, auto-party |
| 5 | Four class demonstrations | campaign, combat, world | Four authored encounters and saved IDs |
| 6 | Tidecrown progression boss | campaign, combat, persistence | Single-boss route, telegraph and retry |
| 7 | Class masters/trial/specialization | campaign, content, party, growth, animation | Two previews, four master battles and atomic transformation |
| 8 | Post-class counter loop | campaign, world, collection | One bounded acquisition/counter sequence and mini-boss |
| 9 | Ability-selection lesson | party, campaign, content | Dynamic familiar-monster lesson and proof fight |
| 10 | Inner Sea Lv25 farm | inner-sea, growth, persistence, combat | Farm establishment, training, power, five-defender daily attacks, upgrades, repairs and replay |
| 11 | Species-tree Lv30 system | growth, content, collection | Unlock, first lesson and batchable species definitions |
| 12 | Full regression and playtest packet | delivery and all affected owners | Automated invariants plus human pacing evidence |

Packages 1-11 are implemented locally. Habitat equipment is the next farm batch. Species trees use
the shared stable18-node topology with five named-skill nodes and one innate
identity node for all100 runtime species; commercial content/balance approval is
still required by roster batch.

## Automated acceptance

- Trainer and monster XP use the same curve but never derive from each other.
- Fresh and migrated saves reach correct levels; excess XP and Lv60 boundaries
  remain safe.
- Both intro guarantees settle exactly once and ordinary Echo odds do not change.
- Summoning is atomic; two same-species individuals remain independent.
- Any two usable companions satisfy the first trainer gate.
- Four demonstration IDs require four accepted victories and survive reload.
- Tidecrown has no level-entry check and its telegraphed action is deterministic.
- Class trials start below Lv20; specialization cannot commit before Lv20 or
  before prerequisites; duplicate commits are harmless.
- Ability selection works from first summon and prior discovery skips redundant
  menu instruction.
- Inner Sea establishment checks Lv25 and saves ownership once.
- Monster trees check player Lv30, while node budget/prerequisites use the owned
  individual's state; duplicate species do not share purchases.
- Defeat, retreat, background navigation, loadout use, reload and critical-save
  failure cannot strand or duplicate any progression step.

## Human validation gates

### Gate A - First 30 minutes

Test both weapons with genuinely fresh saves. At least 4 of 5 uninvolved testers
should summon the first companion without help, understand the second-species
choice, and reach or understand Tavi's two-monster requirement. Record time,
deaths, recovery trips, menu confusion and which second species they chose.

### Gate B - Class readability

After the four demonstrations, at least 4 of 5 testers should describe the core
difference among all four classes and a useful behavior for each. If they only
remember dialogue, the encounters fail even if tests are green.

### Gate C - Boss comprehension

On the second Tidecrown attempt, at least 4 of 5 testers should identify rear
pressure and make a relevant formation/guard/ward response without being given a
complete solution. Measure retries and the stated reason for each loss.

### Gate D - Class commitment

Players must understand what their chosen class does, what it changes, and the
commitment policy before confirmation. Validate all four class completion rates
with both early companion branches. This gate is required before permanence copy
or later class-content production is locked.

### Gate E - Adaptation loop

Players should recognize why they changed a monster ability and see its effect in
the proof fight. Owning a different viable solution must not create a dead end or
force a duplicate acquisition.

### Gate F - Lv25/Lv30 comprehension

When those batches exist, players distinguish Inner Sea cosmetics from practical
benefits, and distinguish equipped abilities from species-tree development. New
monsters must still feel worth recruiting after the tree tutorial.

## Explicitly outside this scope

- Classes beyond Druid, Mage, Hunter and Swordsman, final class animation sets or unapproved class lore.
- Public servers, human parties/guilds, shared boss rooms and boss essence drops.
- Paid items, power-selling, class-change sales or a release economy rebalance.
- A new capture minigame or an alternate item to Soul Echoes.
- Manual combat controls, boss dodge mechanics or a replacement combat engine.
- Habitat equipment drops from bosses/dungeons until the next equipment batch.
- Final balance for every boss, class, creature and node. Mechanics and viable
  routes are required; release tuning follows playtest evidence.

## Decisions required before dependent production

1. **Class commitment wording and recovery policy:** approve true permanence or
   the recommended persistent-but-server-retrainable policy before EP-07 ships.
2. **Inner Sea tuning and quality:** review the implemented farm/training/defense loop
   before permanent progression or the later equipment batch. The development
   mechanics are explicitly authorized; release tuning remains unapproved.
3. **Species-tree content gate:** approve the first Emberfox/Bloomslime/Stonehorn
   trees as the production pattern before generating the remaining roster batches.

None of these decisions blocks independent trainer XP, the first two acquisitions,
the four class demonstrations, Tidecrown or the ability-selection lesson.
