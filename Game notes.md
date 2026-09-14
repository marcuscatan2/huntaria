# Game notes

Deferred ideas and design decisions for Bond & Bolt.
Created: 2026-09-10.

## How we use this file

- When the user says **stash in game notes**, **add to game notes**, or an
  equivalent, record the idea here and confirm it was saved. Do not implement
  it just because it was recorded.
- If it is unclear whether an idea is for now or later, ask the user before
  changing gameplay. It is safe to record the idea while awaiting clarification.
- An explicit request to implement a note promotes that note into active work.
  Keep the original intent and update its status when work starts or ships.
- Separate user requirements from proposed defaults, examples and open questions.
  Example numbers are not final balance values.
- Append future ideas rather than overwriting unrelated notes. Use stable
  GN identifiers so a note can be referenced later.

## Current implementation boundary

Pass 11 implements GN-003–GN-008. The notes were initially documentation only; the user
then confirmed: “Stash 2–3; implement 4–9 now.”

User items 2–3 explicitly requested storage for later and are **stashed**.
Items 4–9 are **authorized for implementation**, confirmed explicitly by the user.
Their implementation choices and verification are recorded in PROGRESS.md and
Companion stats.md. Original proposals below are preserved as design history.

Commercial v2 planning update (2026-09-10): the user has now asked to edit the
features for a large habitat-based world, Soul Echo drops and 100 launch species.
GN-003's contract acquisition and GN-008's board routes remain implemented
prototype history, but are superseded for the future commercial design by
[Commercial scope v2](<Commercial MVP scope.md>). No gameplay changed in this
planning pass. GN-001 and GN-002 remain STASHED. GN-009 is planned, not implemented.

Related design reference: [Companion stats](<Companion stats.md>).
That document now describes the actual implemented formulas.

## GN-001 — Account-wide monster mastery

Status: PARTIALLY PROMOTED on 2026-09-14. The strongest-current-individual aggregation now supplies Inner Sea power; the original per-species flat attribute proposal below remains stashed. Source: user item 2 and the explicit Inner Sea implementation request.

- Each monster species' level contributes an account-wide attribute benefit.
- The benefit applies to the trainer and all of the account's monsters, not
  just the species that earned it or the currently equipped party.
- Example: a support species grants **+10 HP per level**. A level-100 Lumimoth
  therefore contributes **+1,000 HP** to the trainer and every monster.
- Only the **highest-level individual of each species** counts. Duplicates of
  the same species do not stack.
- Example: Lumimoth at levels 100 and 60 contributes +1,000 HP total, not +1,600.
  Raising the highest Lumimoth from 100 to 101 raises that contribution by 10 HP.
- Working interpretation: different species may each contribute their own
  once-per-species achievement bonus. The non-stacking rule is within a species.
- The support/HP mapping and +10 value are illustrative. Other roles' attributes
  and all actual values still need balancing.

Open decisions:

- Does the achievement remember the highest level ever earned, or only the
  highest level among currently owned monsters?
- If evolution changes the species ID, do both forms count, or does the whole
  evolution family share a single achievement?
- At what point in stat calculation are flat account bonuses applied? Prevent
  accidental repeated scaling or re-transmission through Leadership.

## GN-002 — Quest-led evolution

Status: STASHED. Source: user item 3.

- Evolution unlocks after a species-appropriate level threshold.
- NPCs guide the player through evolution quests.
- The particular monster that will evolve must participate in the quest.
- Completing that journey evolves that monster; reaching a level alone does
  not automatically evolve it.

Still to define: species thresholds, participation rules, quest examples,
form choices, and preservation of levels, builds, mastery and account achievements.

## GN-003 — Opt-in, post-encounter catching

Status: IMPLEMENTED IN PASS 11 — 2026-09-10. Source: user item 4.

Implemented replacement for pass 10's low-HP ritual:

1. Enter an encounter containing an eligible catchable monster.
2. During the encounter, enable **Try to catch**.
3. Win the encounter and defeat the eligible monster normally.
4. At the end, automatically resolve one capture chance if the option was enabled.
5. On success, the monster joins the collection / Inner Haven.

- No requirement to stop at a particular HP percentage.
- No manually timed low-health capture window.
- Do not add an extra required end-of-fight click: the in-encounter toggle is
  the player's opt-in; resolution at the end is automatic.
- This introduces a capture chance, unlike pass 10's deterministic ritual.
- The papyrus / Bond Contract / inner-world fiction can remain; its presentation
  must fit the new encounter-end resolution instead of implying the old rules.
- Encounter rarity probabilities in GN-008 are **not capture success odds**.

Open decisions: actual capture odds; scroll tiers and their effects; when paper
is reserved or consumed; failure refunds; consequences of trainer defeat;
and which monster is selected if an encounter has multiple catchable enemies.
Do not silently assume the old success-only consumption rule carries over.

## GN-004 — Speed replaces the Action stat

Status: IMPLEMENTED IN PASS 11 — 2026-09-10. Source: user item 5.

- Replace the character-card **Action** stat with a positive **Speed** stat.
- Higher Speed should translate to a shorter time between actions.
- Document the relationship in a companion Markdown file, including examples.
- Keep action Speed distinct from physical movement speed and skill cooldowns.

Draft conversion, chosen to be simple and preserve current timing when migrated:

```text
100 action-meter points = one action
base seconds per action = 100 / Speed
effective seconds per action = 100 / (Speed × action-rate modifiers)
```

Example: Speed 50 → 2.0 seconds; Speed 80 → 1.25 seconds;
Speed 100 → 1.0 second. These are ready-action intervals, not a guarantee of
attacking while out of range or channeling.

Detailed semantics and migration constraints: [Companion stats](<Companion stats.md>).
This conversion is implemented; see the current companion reference.

## GN-005 — Trainer levels, attributes and Leadership

Status: IMPLEMENTED IN PASS 11 — 2026-09-10. Source: user item 6.

- The trainer's level matches the level of their highest-level monster.
- The trainer has distributable attribute points.
- Attribute growth and allocation should feel **very similar to Ragnarok
  Online**, with deliberate builds and increasingly expensive high attributes.
- Use STR, AGI, VIT, INT and DEX, with **Leadership replacing LUK**.
- Initial Leadership concept: each point transfers **0.5% of the trainer's
  other eligible stats** to their monsters.
- Illustrative transfer: Leadership 20 → 10%; Leadership 100 → 50%.
  These values are starting ideas, explicitly subject to balancing.

The exact Ragnarok-like stat-point grant curve, allocation costs, caps and
derived-stat formulas are not yet specified. Similarity is a design target,
not a claim that the current game implements Ragnarok's formulas.

Open decisions: level/XP progression for monsters; highest-ever versus
currently-owned level; whether trainer level can decrease; respec policy;
eligible transferred stats; active-party versus all-owned recipients;
rounding; and interactions with GN-001.

Draft calculation guidance lives in [Companion stats](<Companion stats.md>).

## GN-006 — Four-element system

Status: IMPLEMENTED IN PASS 11 — 2026-09-10. Source: user item 7.

Keep four elements and a small, readable matchup table.

Proposed default: **Water beats Fire; Fire beats Earth; Earth beats Wind;
Wind beats Water.** Each element has one advantage and one disadvantage.
Same-element and opposite-element matchups are neutral.

Rows attack; columns defend. Numbers below are provisional damage multipliers:

| Attacker / Defender | Water | Fire | Earth | Wind |
| --- | ---: | ---: | ---: | ---: |
| Water | 1.00 | 1.20 | 1.00 | 0.80 |
| Fire | 0.80 | 1.00 | 1.20 | 1.00 |
| Earth | 1.00 | 0.80 | 1.00 | 1.20 |
| Wind | 1.20 | 1.00 | 0.80 | 1.00 |

The cycle is the proposed design choice; ±20% is only an initial balance
proposal. Avoid adding a large secondary typing chart.

Still to define: whether element belongs to the monster, each skill, or both;
trainer element handling; and whether any non-damage effects use the chart.

## GN-007 — Larger, rankable passive skill trees

Status: IMPLEMENTED IN PASS 11 — 2026-09-10. Source: user item 8.

- Aim for **15–20 passive nodes for each class and each monster**.
- Some nodes can be ranked to **3**, some to **5**, and some to **10**.
- Retain meaningful build choices rather than assuming every node is maxed.
- These are passive trees, separate from the three equipped active skills and
  each monster's innate passive.

Still to define: point income, per-rank costs, prerequisites, individual node
effects, class/species identity, respecs, and migration of the current nine-node
trees. Preserve existing investments or refund them when changing the tree.

## GN-008 — City-based exploration and regional encounter/loot pools

Status: IMPLEMENTED IN PASS 11 — 2026-09-10. Source: user item 9.

### Starting structure

- Each city offers **Explore a nearby cave** and **Explore a nearby forest**.
- Water exploration comes later.
- An exploration contains a few encounters, not all of them catchable.
- Some encounters involve trainers from an original hostile faction attacking.
  These can award basic coins. The Pokémon comparison is a functional reference,
  not a request to reuse Team Rocket's name, designs or characters.
- Define encounter availability and loot using the pair
  **(region, exploration type)**.
- Different regions and cave/forest routes can therefore have distinct species,
  encounters and prize pools.

### Example: caves near Moonwell

These are the user's example probabilities, not committed balance:

**Non-catchable encounters**

| Reward | Example |
| --- | --- |
| Gold / basic coins | x–y per encounter; range not chosen |
| Special food | 20%; XP boosts or quest-battle boosts |
| Rare catching scrolls | 5% |
| Additional reward, not yet defined | 2% |

Whether the percentage rewards are independent rolls or mutually exclusive
loot-table entries remains undecided. Gold may be a separate baseline reward;
do not infer that all these rows form one 100% table.

**Rarity distribution, conditional on a catchable encounter**

| Availability tier | Chance |
| --- | ---: |
| Common | 80% |
| Uncommon | 10% |
| Rare | 5% |
| Very rare | 2.5% |
| Epic | 2% |
| Legendary | 0.5% |
| Total | 100% |

The chance that an encounter is catchable in the first place is still TBD.
Species selection within a tier and capture success odds are separate decisions.

### What rarity means

- Rarity primarily describes availability, not guaranteed power.
- A legendary monster is not necessarily stronger than a common one.
- Rare monsters may be more visually striking and may be attractive PvP picks,
  but common monsters should also be viable and appear in the meta.
- Visible rarity labels are optional; this can be internal encounter data.
- Region pools need not contain every rarity. A region may contain only one
  particular species.
- Handle absent tiers explicitly: configure a valid local distribution rather
  than accidentally rolling a tier with no available monster.

Still to define: encounters per expedition, exit/return behavior, losses,
hostile-faction identity, reward claim rules and actual regional pool contents.

## Pass 11 implementation decisions

- GN-001 account-wide mastery and GN-002 quest evolution remain STASHED.
- Catch selection is above the arena. Arm during combat; resolve once after victory.
  Standard contracts: 65%; illuminated: 90%. Successful AND failed rolls consume
  one contract. Loss, leaving, no opt-in or existing ownership consume none.
- One catchable species per wild fight; one owned companion per species for now.
  No HP gate or channeling. Grass keeps its two visible local residents.
- Speed = 100 / seconds per ready action, with separate movement and cooldowns.
- Monster levels 1–100; trainer follows the highest currently owned level, including
  benched companions. No release system. Six attributes, escalating costs, free
  respec and 0.5%-per-point Leadership sharing of the other five raw attributes.
- Four fixed unit elements; damage inherits the attacker’s element; ±20% matchup.
- 18 nodes per class/species, caps 3/5/10. Shared template with class/role affinity,
  not twelve entirely bespoke trees. Separate rank budget per type.
- Ten region+route pools: cave and forest in all five regions. Three encounters per
  route, full recovery between battles, original Hollow Seal faction. One wild,
  one faction and a third 60%-wild encounter. Water exploration stays deferred.
- Local wild availability weights use 80/10/5/2.5/2/0.5%; rarity gives no stats.
  Pool selection supports absent tiers and a single-species pool.
- Region-specific coin ranges. Moonwell cave: 24–39. Faction wins independently
  roll 20% food, 5% illuminated contract, 2% Starseed keepsake. Food is either
  +120 companion XP or a prepared one-battle +10% party-HP ration.
- v5 migration retains ownership, items, claims and valid learned node ranks.
  XP starts at level 1 for legacy monsters. Old save keys remain.
- Cave routes currently reuse the region arena with a darker treatment, not new
  walkable dungeons. Numerical balance is provisional.

The open questions in individual notes above describe the initial design stage;
these shipped decisions resolve them for the prototype. They are not commitments
about final commercial balance.

## Future additions

Append new ideas below with a GN identifier, date and status. Recording a note
does not authorize implementation.

## GN-009 — Cooperative boss fights

Status: PLANNED FOR COMMERCIAL V2 — not implemented. Originally stashed
2026-09-10; promoted into the feature plan by the user's subsequent request for
rare group bosses and extremely rare essences. The user subsequently clarified
that rarity does not impose a one-copy-per-server limit.

- Boss encounters can be team fights involving friends and their monsters.
- Your monsters can help your friends' monsters; everyone fights the same boss.
- Preserve cross-party cooperation as a design goal, not merely parallel solo damage.
- Planned defaults: two–three-player private parties; support can help friends;
  one trainer falling eliminates their party while surviving friends continue.
- Every eligible group boss victory independently rolls 0.01% once; one eligible
  member receives an essence on success. Summoning is 100%. Previous drops,
  summons and anyone's ownership never reduce or disable future chances.
- There is no server-wide copy cap: multiple players may own the same boss,
  and a player may obtain repeat essence items. Deduplicate retries of a victory,
  not legitimate drops from new victories.
- Full planned rules, reconnect, eligibility and recovery tests: F-022 and
  F-061–F-063 in [the backlog](FEATURE_BACKLOG.md).
- This is a feature-plan promotion, NOT implementation or deployment authority.

## GN-010 — Habitat world and Soul Echo summoning

Status: MOVED INTO ACTIVE COMMERCIAL SCOPE — local implementation exists; online
authority and release tuning remain pending. Added 2026-09-10, updated 2026-09-13.

User requirements recorded in the active feature plan:

- Monsters inhabit known maps; rare monsters are themselves difficult to find.
- A defeated eligible wild creature can drop its species' Soul Echo. Legal
  summoning into the Inner Sea succeeds 100%; there is no second capture roll.
- Starting creatures can be killed by the trainer alone; starter Echo baseline
  is 10%. Mid/late Echoes and every very-rare drop use 0.01%.
- Large exploration maps take at least 30 seconds to cross at base walking
  speed; commercial launch includes at least 100 distinct species.
- Rare group bosses can yield extremely rare essences, with no global copy limit;
  see GN-009. 'One of a kind' was figurative, as clarified by the user.

Current active baseline: 24 large maps across six regions plus six compact hubs
and six compact boss domains,
94 wild + six boss species, zero-to-two companion slots, no added pity/guaranteed
first drop, personal field instances and a shared persistent realm boss ledger.
Fixed habitat does not mean immobile creature; spawn availability and per-kill
Echo odds are separate. The local build has the complete spatial/content
skeleton; production-quality art, final balance and server-owned lives/rewards
are still future work.

The v1 small-launch time/cost estimate is withdrawn. See F-066 for the measured
pilot and rebaseline before a new commercial commitment. GN-001 account buffs,
GN-002 quest evolution, PvP and water exploration stay deferred.

## GN-011 — Inner Sea farm and lunar defenses

Status: ACTIVE; first local implementation authorized 2026-09-14. The owner
explicitly requested scoping and implementation of AFK training while clean,
five-monster daily defense, moon-scaled attacks, XP loss and item repairs,
independent habitat upgrades and strongest-species power. These mechanics are
no longer stashed. [FARM_SCOPE.md](features/inner-sea/FARM_SCOPE.md) owns the
contract and provisional tuning; boss/dungeon habitat equipment is the next batch.
GN-002 evolution and GN-001's original flat species-stat proposal remain deferred.
