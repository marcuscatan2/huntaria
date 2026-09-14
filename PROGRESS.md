# Bond & Bolt browser prototype — handoff

## Current handoff — Patch 29 minimap quest markers (2026-09-14)

The local minimap now mirrors the overhead quest marker at the quest NPC's real
map coordinates. A yellow `!` identifies the current quest giver and a yellow
`?` identifies a ready delivery; the symbol disappears from both field and
minimap while an accepted field requirement is incomplete. Both presentations
consume the same `BondCampaign.questMarker` result, so their state cannot drift.

`BondRegion.inspect().questMarkers` exposes stable ID, state, symbol and world
position for diagnostics. Browser coverage samples the actual minimap pixels at
the Forest Mage coordinate in addition to verifying the campaign state. The
focused opening route passed **143/143**, the maintained exploration UI passed
**41/41**, immutable packaging passed **27/27**, and project documentation/
architecture checks passed. The reproducible local-preview client is
`dist/ef12ac33b8bede68c220/`. No requested quest-marker work remains unfinished.

Verified backup after this batch:
`backups/bond-bolt-20260914T033802Z-ac377756.zip` (418 files; no browser saves or Google Sheets).

## Current handoff — Patch 28 quiet map entry (2026-09-14)

Passive map-description prose is no longer emitted into the bottom field status
when entering or returning to a map. It is also absent from the legacy route
panel and from road-sign, discovery and Keeper dialogs; signs retain actionable
opening guidance and local-resident information. Authored `map.info` text remains
in `world-layout.js` as world-building/source data rather than player-facing UI.

Successful scenery streaming is now silent. The field only shows a short
scenery message if an asset actually fails. Actionable event feedback remains:
the one-time awakening, combat/recovery results, navigation failures and other
direct responses still use the temporary field status.

The focused maintained exploration flow passed **41/41**. The complete Chrome
gate passed with no failed assertion, application error or missing packaged
request: 14 architecture, 2,089 mechanics, 41 UI, 34 campaign, 142 opening, 58
lifecycle, 315 creature-sprite, 19 trainer/creator-art, 73 field, 37 experience,
1,005 browser/runtime parity and 27 immutable-package checks (**3,854
browser/runtime assertions**). The reproducible local-preview client is
`dist/b219d945f7496de92776/`. External release and owner-art approval gates remain
unchanged.

Verified backup after this batch:
`backups/bond-bolt-20260914T031907Z-7a60b592.zip` (418 files; no browser saves or Google Sheets).

## Current handoff — Patch 27 quest wayfinding (2026-09-13)

The compact quest tracker now shows the destination region and map whenever the
current objective resolves to a world location. Quest NPCs use campaign-derived
yellow markers: `!` for an NPC offering the current objective and `?` when the
player has a delivery/turn-in ready. The Forest Mage therefore changes from `!`
on **Find the Mage**, to no marker during **Get a second companion**, to `?` on
**Return to the Mage**. Later trainer objectives, completed class masters,
monster-tree proof and chapter keeper offer/return steps use the same rule.

`BondCampaign.questMarker` owns the deterministic mapping from accepted campaign
state to `offer`, `delivery` or no marker. Exploration only renders that result
and mirrors it in the NPC's accessible label; icons cannot advance objectives or
grant rewards. Profile events refresh the tracker and marker in place without
rebuilding the world on every position save.

The focused opening suite passed **142/142**. The complete Chrome gate passed
with no failed assertion, application error or missing packaged request: 14
architecture, 2,089 mechanics, 39 UI, 34 campaign, 142 opening, 58 lifecycle,
315 creature-sprite, 19 trainer/creator-art, 73 field, 37 experience, 1,005
browser/runtime parity and 27 immutable-package checks (**3,852 browser/runtime
assertions**). The reproducible local-preview client is
`dist/3055e609cbc1b5719ab1/`. External release and owner-art approval gates remain
unchanged.

Verified backup after this batch:
`backups/bond-bolt-20260914T023316Z-fe255f4f.zip` (418 files; no browser saves or Google Sheets).

## Current handoff — Patch 26 in-frame opening and Forest Mage gate (2026-09-13)

Exploration now uses a compact in-frame mobile HUD: one tiny current objective,
an upper-right minimap with Atlas below it, the local map name, a short status
line and three bottom destinations for Explore, Bag and Inner Sea. The former
external travel cards and duplicated map headings are hidden on this screen.
Selected companions now carry fixed thin field HP lines using the same
green/yellow/red thresholds as the trainer. In-frame Echo/encounter notices are
click-through except for their own actions, so they cannot cover world targets.

The fresh route is now receipt-backed and explicit: the first accepted
Firstlight Brimble kill guarantees its normal Soul Echo, Bag/Echo/Summon receive
contextual highlights, summoning fills the first empty party slot, and the
objective leads to the Forest Mage. Firstlight roads are visibly locked until
the player summons any second companion and wins the deliberately easy Mage
proof. That protected onboarding trial cannot receive roaming wild joiners,
returns immediately to the field, opens the roads and hands off to the existing
Tavi/class progression. Older progressed saves remain forward-compatible.

Corrected injury behavior: a selected zero-HP companion stays in the saved
loadout and follows in the field, but is benched from the next encounter and
from wild-party scaling. Therefore a trainer with one selected dead companion
can fight alone; only a fallen trainer blocks a new adventure. Normal fights
still allow nearby territorial creatures to join across tabs.

The complete Chrome gate passed with no failed assertion, browser error or
missing packaged request: 14 architecture, 2,089 mechanics, 39 UI, 34 campaign,
136 opening, 58 lifecycle, 315 creature-sprite, 19 trainer/creator-art, 73 field,
37 experience, 1,005 browser/runtime parity and 27 immutable-package checks
(3,846 browser/runtime assertions). The reproducible local-preview client is
`dist/ee7d66832ac02fc96e95/`. Commercial clarity, feel and device approval remain
pending; use [features/opening/PASS26_VALIDATION.md](features/opening/PASS26_VALIDATION.md)
for the current OR-02 walkthrough.

Verified backup after this batch:
`backups/bond-bolt-20260914T013716Z-64a7dc42.zip` (417 files; no browser saves or Google Sheets).

## Current handoff — Patch 25 isolated QA acceleration (2026-09-13)

The `?test=1` profile now uses three times normal exploration movement speed
(+200%), restores the trainer and every owned companion after each settled
adventure victory or defeat, and exposes a combat-only 5× playback button beside
1×/2×. Successful Run remains a retreat and keeps injuries. Normal play retains
base movement, 1×/2× playback and the intended recovery economy; normal saves and
the immutable client expose no QA controls.

Validation covers effective movement rates, 5× selection/rejection, real played
victory recovery, repeated hunts, reload persistence, manual healing, storage
failure, restart, narrow screens and normal-mode isolation. All unchanged-source
gate components pass with no functional browser error or missing asset: 14
architecture, 2,089 mechanics, 39 UI, 34 campaign, 125 opening, 58 lifecycle,
315 creature-sprite, 19 trainer/creator-art, 73 field, 37 experience, 1,005
browser/runtime parity and 27 immutable-package checks (3,835 browser/runtime
assertions). One all-in-one run measured replay p95 at 207.7 ms against the local
200 ms guard under transient host load; the immediate isolated rerun passed all
1,005 checks at 79.1 ms p95. Packaging and the 100-species reference check then
passed. The reproducible local-preview client is `dist/4233d2bf2d8d72d8e0ec/`.

The browser tests also removed two fixture ambiguities: a post-recovery potion
test now creates its own injured trainer, and a normal-mode camp-route fixture
marks the introductory fight complete so the route cannot be intercepted by its
tutorial Emberfox. No game balance or normal-mode encounter rule changed.

## Current handoff — Patch 24 Apprentice road (2026-09-13)

Implemented the detailed arrival-to-level-30 progression as a receipt-backed,
open-world route. The player now earns and explicitly summons an introductory
Emberfox, chooses a guaranteed Bloomslime or Stonehorn through two physical
habitat signs, completes four playable Druid/Mage demonstrations, defeats fixed
Tidecrown, trials either real class build, commits at player level 20, changes a
companion ability, and unlocks individual monster trees at player level 30.

Trainer XP is independent from every companion's XP. Existing saves migrate at
their former displayed trainer level. The launch cap remains 60 and the engine /
wild curve remains valid through 100. All 100 species have an 18-node prototype
tree; five nodes affect named skills and one reflects the innate identity.
Trusted authored opponents now support bounded power, skill-effect and health
tuning without exposing those modifiers to player team data.

The complete Chrome gate passes with no failed assertion, browser error or
missing packaged request: 14 architecture, 2,089 mechanics, 39 UI, 34 campaign,
120 opening, 58 lifecycle, 315 creature-sprite, 19 trainer/creator-art, 73 field,
37 experience, 1,005 browser/runtime parity and 27 immutable-package checks.
That is 3,830 browser/runtime assertions. The campaign matrix covers both
Apprentice weapons, both second-companion branches and both specializations
through every authored milestone. The reproducible local-preview client is
`dist/982dc759f702dfbef343/`.

Owner walkthrough: [PASS24_VALIDATION.md](PASS24_VALIDATION.md). Commercial feel,
pacing and clarity remain pending under OR-02.

Explicitly deferred decisions: final permanence/retraining wording; the bounded
non-paid practical benefit for the level-25 Inner Sea ownership quest; and owner
approval of the first three species trees as the production pattern. No AFK/daily
power was promoted from Game Notes.

Backup before this batch:
`backups/bond-bolt-20260913T200131Z-58f9aae0.zip`.
Verified backup after this batch:
`backups/bond-bolt-20260913T214840Z-0be0a125.zip` (416 files; no browser saves or Google Sheets).

## Current handoff — Patch23 name and Apprentice lifecycle (2026-09-13)

Implemented:

- Character creation, initial login, static menus and the Inner Sea no longer
  display the original code-native Apprentice SVG. The retired renderer is no
  longer loaded by the game.
  Two painted 3x3 creator atlases cover dagger/bow, Crop/Sweep/Braid and
  Calm/Bright/Focused. All six hair and skin palettes repaint the selected art.
- `BondApprenticePreview` owns atlas loading, bounded neutral-background cleanup,
  connected hair/skin tint masks, stale-render protection and accessibility text.
  It changes presentation only; profile creation and combat authority are untouched.
- Unnamed migrated profiles and literal `Apprentice` placeholders now receive a one-time name-only entrance screen.
  The atomic identity write preserves their class, companions, progression,
  inventory, location and active encounter. Named profiles still enter directly.
- Animated Apprentice scenes preload and begin with action-sheet idle frame 13.
  The creator figure is never shown in the world/combat handoff, and the cached
  sheet is reused immediately after combat.
- Exact built-in generation prompts and source provenance are recorded in
  `assets/art-v22/prompts.json`. Patch notes, the AI routing map, opening/art
  contracts and immutable client allowlist include the new path.

Validation: the complete Chrome gate passed with no failed assertion, browser
error or missing request: documentation/routing and lossless assets; 14
architecture; 2,088 mechanics; 34 UI; 33 campaign; 110 opening; 57 onboarding;
315 creature-sprite; 19 trainer/creator-art; 73 field-polish; 37 experience;
1,005 browser/Node parity; and 27 immutable-package checks (3,812 browser/runtime
assertions). The packaged local-preview build is `dist/f371f59a081a35bf10a5/`.
Owner walkthrough: [PASS22_VALIDATION.md](PASS22_VALIDATION.md).

Explicit remaining boundary: world/combat action sheets still use the canonical
swept-hair Apprentice appearance. Creator cosmetics do not yet carry into its
16-pose motion atlas; animated scenes intentionally keep the canonical figure.

Backup before this batch:
`backups/bond-bolt-20260913T140837Z-128fd5e1.zip`.
Backup before the naming/idle lifecycle fix:
`backups/bond-bolt-20260913T175801Z-19dcb67d.zip`.

## Previous handoff — Patch21 playable trainer motion (2026-09-13)

Implemented and verified:

- The owner-chosen Druid sprite/motion remains unchanged as the trainer visual
  benchmark. Mage now uses a matching true-alpha 16-pose painted sheet for walk,
  attack, cast, hit, idle, defeat and victory.
- Apprentice now has separate 16-pose dagger and bow sheets. The saved starting
  weapon selects actual movement/attack/cast motion. The customizable SVG remains
  the creation/menu/loading fallback; painted motion currently uses one canonical
  swept-hair/skin appearance, an explicit prototype limitation.
- Generator checker backgrounds on the two otherwise accepted Apprentice sources
  are safely isolated in an offscreen canvas at load; unsafe cleanup retains the
  SVG instead. Detached generator specks are removed per frame. Originals and
  exact prompts remain in `assets/art-v21` provenance.
- The immutable bundle now includes active trainer sheets and excludes rejected
  historical `art-v16` Mage candidates. Visible Patch21 notes disclose the change.
- AI routing, animation ownership, test routes and the lightweight README route
  remain current. Only Apprentice, Druid and Mage exist as runtime trainer classes;
  no undefined future class was invented for this art pass.

Verification: all current gates passed on Chrome: documentation/routing; lossless
world/audio assets; 14 architecture; 2,088 mechanics; 34 UI; 33 campaign; 100
opening; 57 onboarding; 315 supplied-sprite; 13 trainer-animation; 73 field-polish;
37 experience; 1,005 browser/Node parity; and 27 immutable-package checks (3,796
browser/runtime assertions total). No test failure, browser error or missing
packaged request remains. The current local-preview bundle is
`dist/36a10a6ec95277b46ed3/`. Technical checks are not owner art acceptance.

Owner walkthrough: [PASS21_VALIDATION.md](PASS21_VALIDATION.md). Review Mage and
both Apprentice weapons at real play size, including left/right travel and action
readability. Decide whether the canonical Apprentice motion appearance is enough
for the MVP or whether selected hair/skin/face must carry into action sprites
before later trainer art. Creature visual/motion approval remains separate.

Backup before this batch:
`backups/bond-bolt-20260913T043002Z-aafb479e.zip`.

## Current handoff — Patch20 level boundary, Sheet roster and open boss roads (2026-09-13)

Implemented and verified:

- Player trainers, owned companions, active XP, attribute budgets and trees stop
  at the hard launch cap Lv60. The engine/wild curve remains valid through Lv100.
  Lv61–100 Echoes summon at60 with source provenance; legacy excess active XP is
  preserved as inactive `deferredXP`, not deleted or applied early.
- The owner-maintained Bond & Bolt Google Sheet is the creature-design source of
  truth. Reviewed revision262 (`Roster!A1:S101`, 100 rows, fingerprint
  `e5a3ac70`) now drives name, design role, combat identity, element, region,
  source level/source type, rarity and attack basis through the local generated
  overlay. The empty `mon-skills` tab intentionally leaves existing stats/kits.
- Firstlight remains the explicit 48 Brimble Lv2 /32 Bloomslime Lv3 /16 Rattlebit
  Lv5 override. The atlas now contains 24 large maps, six hubs and six compact
  boss domains; each cave reaches its region's reward-free practice altar.
  Roads are open and nonlinear; atlas colors warn about danger rather than lock.
- Player-visible Patch20 notes disclose the level boundary, high-source summon,
  open roads and boss domains. Authored launch-story trainers clamp to60 while
  preserving a future `sourceLevel`; wilds and selectable boss tests may exceed60.
- Generated creature JSON/Markdown/CSV references were republished from the live
  Sheet-backed browser export. `README.md`, `docs/architecture.json`, feature
  guides, scope, validation and save/world contracts were updated and regenerated.

Verification: `python scripts/project.py verify --browser chrome` passed the full
current matrix on Chrome152.0.7977.83: documentation/routing, lossless world/audio
assets,14 architecture checks,2,088 mechanics checks,34 UI,33 campaign,100 opening,
onboarding,315 sprite checks, field polish,37 experience,1,005 browser/Node parity
and27 immutable-package checks. No test failure, browser error or missing packaged
request remained. The current local-preview bundle is
`dist/255cdb690c897f61aab1/`. This is local evidence, not commercial acceptance.

Owner walkthrough: [PASS20_VALIDATION.md](PASS20_VALIDATION.md). Validate the
visible cap/high-source summon wording, danger-colored open travel, one cave→boss
domain, and a few Sheet-moved/retagged creatures. Final art, balance, physical
devices, online authority/multiplayer and release economy remain unfinished.

Backup before this batch:
`backups/bond-bolt-20260913T024742Z-3cbb2b0c.zip`.

## Previous handoff — DEX, wild pressure and illustrated Atlas (2026-09-12)

Implemented and ready for owner review:

- Each effective DEX point now reduces active skill cooldowns by exactly 0.667%.
  Attribute and tree reductions still share the existing 50% total safety cap.
  The allocation UI and canonical formula reference state the coefficient and cap.
- Adventure wild strength now follows the number of deployed player actors. A
  trainer alone retains 1× authored values; trainer plus one companion faces
  1.8× wild HP / 1.15× offense; a full trainer-and-two-companion party faces
  2.6× HP / 1.3× basic, skill and healing pressure. Level, rewards, Echo odds,
  map populations and the trainer-only opening are unchanged.
- Roaming wild creatures no longer draw species nameplates or reveal their name
  in the nearby action. Accessible labels retain level context, and the combat
  HUD still identifies opponents once combat begins.
- The World Atlas is now an illustrated nautical chart with six distinct organic
  coastlines, regional palettes, terrain, rivers, currents, cleaner pins and the
  real road graph. Each reach derives its average from its resident habitat
  levels. Hovering the land reveals `AVG LV.`: green at/below trainer level,
  yellow one to five levels above, red six or more above. The compact reach
  buttons repeat the level/color for touch and keyboard users.

### Verification and owner handoff

The complete Chrome cross-feature gate passed 3,771/3,771 checks after the rule
and Atlas implementation: 2,077 mechanics, 100 opening, 57 onboarding, 34 UI,
33 campaign, 14 boundaries, 314 sprites, 73 field-polish, 37 experience, 1,005
runtime and 27 packaged-build checks. The 1,000-fight shared corpus matched
exactly at 94.2815ms replay p95. A final viewport-only Atlas CSS adjustment was
then visually inspected and separately passed the final 34/34 UI and 27/27
package checks. The current immutable local-preview bundle is
`dist/19272a62cc7132054d32/`. Normal personal browser saves were never opened.

Needs owner now (maximum three):

1. Compare several active skill cooldowns before and after allocating DEX; confirm
   that the faster cadence is desirable before more class/monster tuning embeds it.
2. Fight the same appropriate-level wild with zero, one and two companions. The
   full party should win narrowly or need recovery/build changes, not erase a lone
   wild through raw action count; report species that become unfair or still trivial.
3. Open World Atlas at low and higher trainer levels. Hover each reach and judge
   the chart style, level averages, color readability and whole-world framing.

Coming next: tune the 2.6×/1.3× wild curve from played outcomes and apply any
Atlas art-direction feedback before adding maps or encounter content. Safe to
defer: individual-species difficulty modifiers, fog-of-war, animated Atlas art,
additional combat animation, online authority and public deployment.

## Previous handoff — immediate encounters and in-frame feedback (2026-09-12)

Implemented and ready for owner review:

- Clicking a wild creature now attacks immediately for fresh and migrated saves;
  territorial contact does the same. The nearby action reads `Attack`, and the
  obsolete `Start hunt` confirmation is gone. NPC conversations, pack challenges
  and bosses retain their intentional encounter prompts.
- A real level gain now produces a large in-frame `LEVEL UP` banner, the actor and
  new level, stars and a gold actor ring. It follows an automatic battle-to-world
  transition into the visible game frame and has a reduced-motion presentation.
- Every reward is now its own bottom-centre field pickup with an icon, name and
  quantity. Pickups have independent three-second lifetimes, queue above four
  visible items, and never create a browser-corner card or combined loot window.
  Persistent save failures remain separate because they require an explicit Retry.
- The first reachable Emberfox now uses a deterministic valid near-start placement
  search. This removes a rare population-seed failure without changing map quotas,
  replacement rules, combat tuning, XP, loot or the 15% test Echo probability.

### Verification and owner handoff

The complete Chrome gate passed 3,765/3,765 checks: 2,074 mechanics, 100 opening,
57 onboarding, 31 UI, 33 campaign, 14 boundaries, 314 sprites, 73 field-polish,
37 experience, 1,005 runtime and 27 packaged-build checks. The 1,000-fight shared
runtime corpus matched exactly and measured 94.1699ms replay p95. No browser,
harness, save, asset or package errors were reported. The final phone pickup row
was visually inspected; normal personal browser saves were never opened by tests.

Needs owner now (maximum three):

1. Click passive wildlife and let territorial wildlife reach you. Both should enter
   combat immediately, without a hunt popup; confirm that this feels intentional.
2. Defeat the first two starter creatures and judge the `LEVEL UP` banner, actor
   ring, timing and reduced-motion version for clarity without blocking play.
3. Win a fight with several rewards on desktop and a narrow window. Judge the
   in-world pickup size, placement and three-second reading time.

Coming next: incorporate that feel/readability review before expanding visual
feedback or encounter content. The broader class direction, target hardware and
commercial/online ownership decisions below remain unresolved. Safe to defer:
additional animation, distant creature production, paid cosmetics, real
multiplayer and public deployment.

## Previous handoff — sprite-independent scope (2026-09-12)

Implemented local scope additions:

- Settings: persistent master/music/effects volume, mute, quiet effects, reduced
  motion, camera shake and impact flashes. Native dialog focus restoration and
  local profile download; device preferences never change combat rules.
- Audio: three original on-demand loops and 25 procedural cues, synchronized
  impacts and scene switching. Pause, hidden-page and mute cleanup stop sources.
  Sound starts muted. The mix remains a reference awaiting a listening review.
- Inner Sea: fixed display scene, two owned individual companion slots, three
  decoration sockets, two skies and three earned decorations. Arrange, preview,
  cancel, save/reload and download the actual scene as PNG. Same-species copies
  remain independent; display choices do not change the party or combat stats.
- Delivery: allowlisted immutable local-preview bundles, build/file hashes,
  loading/reload feedback and a profile boot guard. Missing rules downloads cannot
  normalize away an active encounter or benched companion. No deployment.
- Loading: defer hidden menus, first-world rendering and offscreen bridges;
  eight pixel-identical WebP scenery exports total 15,892,230 bytes versus
  21,139,704 source bytes. Original scene and character/monster assets untouched.
- Simulation: one offline Node runner loads the browser's existing rules; a
  shared 1,000-case corpus covers varied levels, partial parties, packs,
  13-actor groups and escape without a second damage implementation.

Existing saves, stable IDs, gameplay tuning, 15% test Echo odds, three-second
item notifications and deferred Game notes are preserved. No paid ownership,
cloud accounts, telemetry collector or real multiplayer was introduced.

### Verification and limits

`python scripts/project.py verify --browser chrome` passed: 2074 mechanics,
99 opening,57 onboarding,31 UI,33 campaign,14 boundaries,314 sprites,
71 field-polish,37 experience,1005 runtime and27 packaged-build checks
(3762 total). The browser suites match the final 70-file runtime; the shared
corpus matches its 18 inputs. No unexpected browser/test errors. Structure
passed 18 tooling,20 review-gate,23 navigation and30 scope checks; generated
creature references, original audio reproduction and lossless scenery checks
passed. Normal personal browser saves were never used by tests.

Edge experience passed 37/37. Edge/Node matched all 1,000 combat outcomes, but
the latest separate run passed only 1004/1005 checks: replay p95 was 242.7052ms
against the unchanged 200ms target. Chrome's same-input probe passed at
164.7952ms. An earlier concurrent run reached 510.4577ms and is retained in
tests/artifacts/runtime-edge-concurrent.json; the separate failure remains in
runtime-edge.json. Timing is not consistently within target. Do not call this
performance certification or infer server capacity from deterministic parity.
Target-hardware/host performance work remains open; do not rerun to hide failures.

Verified local bundle: dist/90c953cef1063ea1ec9b/. Its packaged opening observed
9,048,353 transferred bytes including the nearby bridge, one monster portrait
and no audio downloads. This is an unthrottled loopback observation, not a
physical-device/network benchmark. Four blocked essential modules each preserved
an entire active save byte-for-byte and recovered after Reload. Desktop/phone
Inner Sea views were visually inspected. Preview http://127.0.0.1:8765/ and the
new runtime assets returned HTTP200.

### Scope and owner handoff

[REMAINING_SCOPE.md](features/delivery/REMAINING_SCOPE.md) accounts for all
66 cards and lists the missing decisions/resources; no commercial acceptance
checkbox or owner approval was inferred. README, ownership/dependency routes,
feature guides, review packets and full verification commands are updated.

Needs owner now (maximum three):

1. Validate Settings/audio and Party & bag → Inner Sea: arrange, cancel, save,
   reload and download. Review the first 20–30-minute gameplay/reference slice
   before repeated content production; this is not approval of all 100 sprites.
2. Choose class direction: recommend Apprentice → Druid/Mage first, cap100 and
   the current two-companion actor contract. The four-class proposal still has
   cap/stat-budget/summoned-actor conflicts; recheck its current revision only
   after this decision, before importing kits or adding specialization quests.
3. Confirm desktop-first versus Android-at-launch and name target hardware.
   Real-device performance/accessibility and release progression are unapproved.

Coming next: before online integration, approve wipe/persistence policy, monthly
operating cap, account-conflict policy and initial group scope; owner-controlled
hosting/identity accounts and privacy decisions are required. Seller/country/age,
prices, support, rights and consent decisions precede commerce/public testing.
Safe to defer: distant sprite batches, paid cosmetics, optional PT-BR/iOS and
final launch copy. Existing human review gates remain pending.

## Previous handoff — three-second item notifications

The combined loot dialog is replaced by individual icon/name/quantity toasts.
Each item type has its own three-second visible lifetime; coins and XP are
separate. Hover/focus and later drops do not extend existing timers. At most
four cards are visible; overflow gets its full lifetime when displayed. Empty
receipts show nothing. Echo actions select the exact inventory item, and the
first-Echo world reminder remains after notifications expire.

Failed-save retry notices remain separate and persistent until settlement.
Inventory/reward rules are unchanged. Rendering now lives in loot-popup.js and
collection-owned loot.css; obsolete combined-dialog CSS was removed from
style.css, opening.css and pass14.css, with no changes to their other controls.
Region modal checks no longer need the old loot-dialog exception.

Full Chrome verification passed: 2074 mechanics,99 opening,57 onboarding,30 UI,
33 campaign,14 boundaries,314 sprites and71 field-polish checks (2692 total).
Every report matches the final63-file runtime, with no browser errors. Tests
cover independent timing, quantities, duplicate-show protection, overflow
lifetime, narrow layout, save retries and unchanged inventory. Structure and
generated creature references also passed. Desktop/phone notifications were
visually inspected; the preview serves loot.css with HTTP200. Edge was not rerun.
Normal saves are untouched.
README, generated feature routing and the encounter guide reflect the new UI.
Review priorities unchanged: check popup readability now; broader opening/battle
feel review comes before expansion; additional animation remains safe to defer.

## Previous handoff — field feedback and combat escape

Implemented: accepted loot expires after 6.5 seconds even under focus/hover;
failed-save notifications keep Retry. World player health uses a fixed 46×3px
track with green above 50%, yellow 35–50% and red below 35%, reading live combat
HP or saved vitality. Twenty-four foliage props use individual atlas outlines
shared by CSS and canvas, excluding neighboring canopies; source PNGs untouched.

All player Run actions start a saved three-second retreat. Trainers stop acting,
companions cover, and enemies may pursue/hit the trainer. Survival escapes;
death/victory still settle normally. Escape preserves wounds/accepted kills,
never grants NPC victory credit or rescue, and keeps surviving spawn lives.
Reload replays the escape request in order with same-tick hostile joins.

Verified: `python scripts/project.py verify --browser chrome` passed the full
gate: 2074 mechanics,99 opening,57 onboarding,30 UI,33 campaign,14 boundaries,
314 supplied-sprite and61 field-polish checks (2682 total). Every report matches
the final62-file runtime; no browser errors. Structure passed18 tooling,20
owner-gate,23 navigation and30 planning checks; generated creature references
match live content. All seven scenery PNG hashes match their original manifest.
Field HP, the24-prop contact sheet and the Run control were visually inspected;
390/768/1440px controls passed. Preview http://127.0.0.1:8765/ returned200.
Edge was not rerun; technical coverage does not approve visual direction/balance.

Current routing:
features/shell/ENCOUNTERS.md, features/persistence/SAVES.md,
assets/world-v15/README.md and tests/field_polish_check.py. Architecture ownership,
generated feature guides and the full verification command include the new suite.
Normal player saves were not opened or reset. The proposed new classes remain
unimplemented pending the separate contradiction review decision.

Owner review: now check HP subtlety, foliage edges and retreat difficulty.
Next, approve the opening/battle feel before dependent animation/balance expansion.
Safe to defer: more art production, extra effects and online release work.
Existing review gates/approvals are unchanged by these prototype fixes.

## Previous handoff — supplied creature roster and sprites

All 100 owner-supplied PNGs are integrated through the numbered workbook's
stable-ID mapping. Display names and visual families changed; existing IDs,
individual progress, combat balance, kits, world levels and loot are preserved.
Shared world/combat/collection/inventory art uses the supplied image without
swapping back to old SVGs or monster sheets. Motion is transform-based, not
authored frame animation; Druid retains its painted poses. Originals are untouched.

The existing Google Sheet was replaced in place with New Roster, Roster Guide
and Original Roster. All populated values/formulas were read back against the
workbook, with no differences or guide formula errors. File link/sharing remain.
Old tabs were removed; Google version history is the recovery path.
Google styling/tables were checked through APIs, not an authenticated rendered view.

Source/provenance and maintenance: features/animation/SUPPLIED_SPRITES.md.
README/feature routing, owner review packets and generated creature references
reflect the new overlay. The full gate now includes monster_sprites_check.py.

Verified in disposable Chrome contexts: 2074 mechanics,99 opening,57 onboarding,
30 UI,33 campaign,14 boundaries and314 supplied-sprite checks (2621 total).
Reports match the final62-file runtime. Structure passed18 tooling,20 owner-gate,
23 navigation and30 planning checks. All100 PNGs decoded; contact sheets and
world/collection/combat views were visually inspected. Preview http://127.0.0.1:8765/
returned200. Normal saves remain untouched; Edge was not rerun.

Needs owner now: review starter size/readability at actual world/combat scale.
Coming next: approve a new motion reference before mass animation production;
the old Emberfox/Stonehorn frames do not match Brimble/Rattlebit. Safe to defer:
far-region polish and late-game balance. Single-pose animation limits and the
approximately178MB original catalog need production optimization, not hidden
claims of commercial readiness. Workbook role directions remain design proposals.

## Previous handoff — anchored background encounters

Implemented: in-game tab navigation retains active fights and their reserved
builds; explicit retreat remains safe. World anchors and crossed-swords markers
keep participants in place. Territorial creatures can join as enemies; saved
tick-stamped entries replay deterministically. NPC rewards and joined-wild claims
settle separately. Rewards use temporary nonmodal cards; accepted level gains
show gold feedback. AGENTS.md requires minimal current player copy.

Verified on 2026-09-11 in disposable Chrome contexts: 2074 mechanics, 57 focused
onboarding, 99 opening, 30 UI, 33 campaign and 14 boundary checks (2307 total).
All six reports match the final 61-file runtime. Project checks passed 18 tooling,
20 owner-gate, 23 navigation and 30 planning checks; four generated creature
references agree with live data. World swords and the nonmodal reward/level
presentation were visually inspected. The preview at http://127.0.0.1:8765/
responds successfully. Edge was not rerun.

Current route: features/shell/ENCOUNTERS.md. Normal player saves are untouched;
no multiplayer implementation is included. In-game tabs keep combat running;
explicit Pause or hiding the browser tab pauses it. Existing live builds stay
frozen while loadout edits prepare the next fight. No requested work remains
unfinished; balance and visual approval still need owner play review.

Needs owner now: fight -> Loadout -> edit -> Explore, observe the anchored
participants and a nearby territorial joiner; judge loot timing and level-up
feedback. Review priorities otherwise remain unchanged: opening/visual direction
now; world/animation/device references before production expansion; release
economy and online capacity can defer. Technical tests are not art approval.

## Previous handoff — loadout encounter lock and painted information signs

The loadout-specific failure was reproduced on the previous runtime: switching
to Loadout retained a persisted reservation; editing skills then invalidated the
in-memory battle without releasing it. Reload deliberately retained the saved
reservation, so cache refresh was not a cure. The focused regression failed both
loadout-release and subsequent-hunt checks before the fix.

Leaving combat for Explore or Loadout now safely withdraws before switching
screens. Entering Loadout also resolves an older saved attempt after reload.
Explicit Pause/background checkpoints remain resumable. Clicking another wild
creature withdraws the previous saved encounter through the same checked command;
the same surviving creature resumes its saved attempt. Injuries, accepted drops
and surviving spawn-life rolls are preserved. A failed save blocks withdrawal
and navigation. A completed saved defeat still settles rescue first.

Sheltered spring uses the nearby painted shelter road sign as its hit target,
retaining its discovery ID. Lookouts keep their painted signs; hero discoveries
use their own scenery bounds. Detached green discovery markers are removed.
Local descriptions retain flavor and resident species/levels/counts but omit
replacement timing, Echo odds and drop-debug explanations. Drop rules, XP,
populations and healing are unchanged.

Verified on2026-09-11: the focused onboarding suite passed40 checks, including
loadout/skill editing, failed-save navigation, old saved encounters and the sign's
actual painted bounds. The complete Chrome suite set passed2074 mechanics,99
opening,40 onboarding,30 UI,33 campaign and14 boundary checks (2290 assertions).
project.py check passed18 tooling,20 owner-gate,23 navigation and30 planning
checks. The current creature export and generated reference tables agree.
Edge was not rerun. The cleaned sign dialog was visually inspected. README,
generated feature routes and current save/opening/player guides describe the
corrected screen-leaving behavior. Normal browser saves were not opened/reset.
The local preview serves the corrected code. No requested work remains unfinished;
owner play review is still separate from technical verification.

Needs owner now: replay battle → Loadout → edit skills → Explore → another hunt,
without using Reset or manually abandoning first. Check the painted Sheltered
spring sign. Other review priorities are unchanged: opening/visual direction now,
world/animation/device references before production expansion; late economy can
defer. This regression fix does not approve commercial readiness or visual art.

## Previous handoff — encounter recovery, starter XP, first Echo and clear exits

Implemented and verified on2026-09-11. Back to region now explicitly withdraws
instead of silently leaving a blocking reservation. Injuries and accepted drops
are kept. Tab navigation still pauses; the region has visible Resume/Withdraw
controls, including after reload. Withdrawal settles an already-ended fight first,
so an interrupted Firstlight defeat receives camp rescue. Critical save failures
retain the encounter for retry rather than falsely claiming it was released.

The old Back button lock was reproduced by actual creature clicks. Both direct
and frame-driven deaths were tested, followed by clicking/walking to the same fox
and starting another species' encounter. The normal completed-death path did not
reproduce a separate lock in isolated testing; saved terminal-fight recovery and
honest failure messages now cover interrupted/reserved states as well.

Created apprentices earn300+100×source level hunting XP per accepted wild kill,
capped at1000 (Lv5). Two Lv2 Emberfox wins reach Lv3 then Lv5 without any Echo.
Trainer level uses the higher of this starter floor and the highest companion;
legacy profiles keep companion-only progression. XP receipts persist/deduplicate,
level-ups do not heal, and no phantom companion is created. Existing apprentices
begin earning the new track on their next accepted kills; no retroactive grants.

Until the first summon, Echo loot explains Inventory → Echoes → Summon a new
individual. Its button selects the real owned Echo; a region reminder survives
reload until summoning. Summoning remains explicit and100% successful. Echo odds
remain15%, without a forced drop or pity. Map exits now have numbered gold badges,
larger matching minimap markers and named destination buttons. Clicking an exit
walks through the actual gate; progression locks and normal ground walking remain.

Full current Chrome suite set passed:2074 mechanics,99 opening,30 onboarding,
30 UI,33 campaign and14 boundary checks (2280 assertions). All six reports match
all61 current runtime hashes. project.py check passed18 tooling,20 owner-gate,
23 navigation and30 planning checks. The creature export and four generated
tables agree. The focused onboarding suite is now routed and included in full
verification. Edge was not rerun; no normal browser saves were opened or reset.
First-Echo, exit and minimap screenshots were visually inspected. Preview at
http://127.0.0.1:8765/ serves the updated code; refresh with Ctrl+F5.

README, feature routing/contracts, save/opening/player guides, stat rules and
F-003/F-009 acceptance criteria describe the implemented starter exception.
OR-02 remains pending owner review. Needs owner now: replay death/withdrawal,
judge the first two wins' pace and find/summon an Echo using only the new UI.
Validate this opening before extending its loop to more content. Other review
priorities are unchanged: visual direction needs revision; world/animation and
device references are next before production expansion; late economy can defer.
No requested implementation remains unfinished; enjoyment and release approval
are not inferred from automated tests.

## Previous handoff — forest camp and gradual Firstlight exploration

Implemented on2026-09-11. New characters wake at the existing forest camp inside
Firstlight, away from the town gate. Defeat in Firstlight returns to this same
camp fully healed/revived, including benched companions, with accepted progress
kept. Outside Firstlight, defeat still rescues to the regional town with injuries.
Camp rest is free and proximity checked; it does not grant the distant landmark.

The location bar names camp/meadow/grove/deepwood. Return to camp · free rest
walks to the painted tent. In Mosslight, Firstlight Meadow · starting area walks
through the correct gate; the forest camp button continues to recovery. Neither
button teleports. No guide, dialogue chain or forced quest was added.

All96 residents remain:48 Emberfox Lv2 in the west,32 Bloomslime Lv3 in the
middle grove,16 Stonehorn Lv5 in the eastern deepwood. A400-unit camp clearing
excludes wildlife. Replacements remain random within broad species bands and
at least900 units from the previous life. Other maps/levels,430 total residents,
15% test Echo odds and creature stats/drops are unchanged. Existing incompatible
unreserved positions move without rerolling life/seed/loot; held lives remain
fixed until their reservation settles or is abandoned. No save reset required.

Verified on2026-09-11: the complete Chrome suite set passed2074 mechanics,99
opening,30 played UI,33 campaign and14 boundary checks (2250 assertions), with
no reported browser errors. project.py check passed18 tooling,20 owner-gate,
23 navigation and30 planning checks. The generated creature reference agrees
with the current browser export. Edge was not rerun for this pass.

The first-win/second-loss and both physical return routes passed browser replays,
including the corrected camp recovery message, reload/save preservation and
mobile layout checks. The camp screenshot was visually inspected. The existing
preview at http://127.0.0.1:8765/ serves the new start position; Ctrl+F5 suffices.
README, feature contracts/routes, opening design, population/save/player guides
and the pending OR-02 review packet reflect the new loop. No owner approval is
inferred from automated checks. Existing normal player saves were not opened.
No requested implementation remains unfinished; first-session enjoyment and
production visual quality still require owner review.

Needs owner now: replay the opening without test healing and judge whether camp
preserves orientation after defeat, recovery is discoverable after victory, and
difficulty increases naturally with exploration. Approve this loop before more
regions repeat it. Visual direction remains pending; coming next, world/animation
references and target devices before production expansion. Distant content and
final economy can defer. Other owner priorities are unchanged.

## Previous handoff — denser low-level Firstlight and free town healing

Implemented and verified on 2026-09-11. Firstlight now has96 residents instead
of32:48 Emberfox Lv2,32 Bloomslime Lv3 and16 territorial Stonehorn Lv5. Exactly
three species. Tideotter Lv10 moved to Fernpath Woods, which now has24 residents.
All other map quotas/levels and15% test Echo odds remain unchanged; the world
target is430 wild residents. Replacement still samples the map away from the
previous death location, not a fixed cluster beside the player.

Town sanctuary full healing/revival was already free. The UI now explicitly
says Heal party · free and no coins/items required; portable store supplies
remain separately priced. All six towns and a played zero-coin, zero-supply
normal-mode recovery were verified. Test shortcuts remain isolated to ?test=1.

Stable Tideotter spawn IDs are retained despite relocation. Existing low-density
saves fill new slots without rerolling retained lives/rolls or resetting progress.
Reward settlement uses the reserved source map/level, protecting pre-update
Emberfox/Tideotter encounters and their Echo levels. Pursuit reads one profile
snapshot per frame rather than cloning the larger profile for every resident.

Current Chrome gate coverage passed via individual suite commands:2074 mechanics,
87 opening,30 played UI,33 campaign and14 boundary checks (2238 assertions).
All five reports match all61 runtime hashes. project.py check passed18 tooling,
20 owner-gate,23 navigation and30 planning checks. Revision6 creature JSON and
four generated local tables agree with the browser export. Edge was not rerun
for this tuning pass. The first-map screenshot was visually inspected. Normal
player saves were not opened/reset; test browser contexts are disposable.

Preview serves the new levels at http://127.0.0.1:8765/; Ctrl+F5 is sufficient,
no reset needed. Current design routes: MAP_POPULATIONS.md, features/opening/
DESIGN.md and the recovery/population guides. README/manifest/generated routes
are updated. No requested work remains unfinished.

Needs owner now: judge density and difficulty spread in the opening; visual
direction remains pending revision. Next: world/animation references and target
devices before production expansion. Final economy/distant content can defer.
These checks do not approve first-session enjoyment or production art.

## Previous handoff — visible test restart and healing

Implemented and verified on 2026-09-11. In ?test=1, the TEST MODE bar above the
tabs exposes Restart progress (confirmed, irreversible sandbox reset returning
to creation) and Heal party (free full recovery/revival for the trainer and all
owned companions between reserved encounters). Normal/migration saves are
untouched. The old buried QA restart button was promoted, not duplicated.
Save-write failures retain progress and display an error; restart stops the old
fight only after its reset write is accepted. No combat tuning changed.

UI: test-controls.js, owned by shell; mutations: BondProfile.testing.restart /
heal in profile.js. Operations and save contracts, README routes and the
architecture manifest/generated guides are current. The opening suite covers
creation restrictions, normal-mode isolation, cancellation, save failures,
active fights, healed reserves, reload and narrow layouts.

Verified: project.py verify --browser chrome passed (14 boundaries, 2074
mechanics, 30 played UI, 33 campaign, 79 opening checks and catalog agreement).
Edge opening: 79/79. Total: 2309 browser assertions across six reports, all
matching all 61 runtime hashes. Final project.py check also passed: 18 tooling,
20 owner-gate, 23 navigation and 30 planning checks. Normal profiles were never
opened by automation; the normal-key isolation checks use disposable fixtures.
The 390px toolbar screenshot was visually inspected. Preview page and new
script return HTTP200 at http://127.0.0.1:8765/?test=1 (badge19).

Repeated Windows copy/cleanup locks in the synced fixture directory interrupted
earlier structural runs. Tooling/owner-gate/navigation fixtures now use uniquely
named system temporary directories; reruns passed without weakening assertions.
Game source and existing browser saves were not moved.

Review priorities unchanged: opening feel and visual direction need owner
review now; world/animation references and device scope precede mass production;
final economy/distant content can wait. Free test healing must not be used to
judge natural recovery pacing. No requested test-control work remains unfinished.

## Previous handoff — Pass19 quiet apprentice opening

Playable prototype verified on 2026-09-11. Start with README and
features/opening/README.md. Design and owner playchecks live in
features/opening/DESIGN.md; exact evidence/limits in its VALIDATION.md.

Fresh profiles create a named, visually customized apprentice, choose dagger
or bow and wake alone in the first forest. Legacy profiles keep their classes,
individual monsters and progress. The additive v7 character field needs no
save reset. No tutorial chain: only the short awakening text. Passive first
hunts, territorial Stonehorn/Tideotter warning and pursuit, first-map usable
drops, immediate town return on defeat and receipt-driven loot cards are live.
Specialization quests remain deferred. No owner art/fun approval is implied.

Chrome:2074 mechanics +30 played UI +33 campaign +14 boundaries +60 opening.
Edge:60 opening +30 played UI. Total2301 passing browser assertions; all seven
reports match all60 current runtime hashes. Edge's full mechanics/campaign/
boundary suites were not rerun this pass. Structural gate:18 tooling +20
owner-gate +23 navigation tests,30 planning checks;100-species reference agrees.
Opening tests include controlled loot/death fixtures; they do not certify
organic drop pacing, 30-minute enjoyment or physical mobile-device performance.

Preview: http://127.0.0.1:8765/?test=1 (badge19). For an existing QA profile,
expand QA tools and confirm New character · test save only. Normal browser
saves were not opened/reset by tests. One agent; no paid services/deployment.
Source-only backup: backups/bond-bolt-20260911T153826Z-1e43e730.zip.

New rules/UI: opening-rules.js, character-creation.js, opening.css;
shared avatar: apprentice-avatar.js; territorial rules: wild-behavior.js.
Routing now covers18 features and21 generated guides/index/connection/graph
documents. Current browser commands include tests/opening_check.py; project.py
verify runs it with the established suites. Older pass filenames remain
supported regression entrypoints, not evidence of an older runtime.

Needs owner now: OR-02 fresh opening play review; OR-01 visual direction still
needs revision. Next: world/animation reference and device scope before mass
production. Exact release economy and distant content remain safe to defer.
No commercial acceptance criteria were marked complete.

## Previous routing handoff — feature-local AI context

README is now a light router; FEATURE_MAP is a compact feature/symptom index.
Start there or use scripts/project.py context with a feature, source file,
exported global, F-### card or connection ID. The17 features/<owner>/README.md
guides route actual implementation, contracts, neighbors, specs and tests.
Runtime files remain at existing root paths; no duplicate source was created.

docs/architecture.json owns routing facts; scripts/navigation.py generates the
20 index/feature/connection/graph documents via project.py map --write.
Detailed operations and save rules now live beside their owning feature guides.
New container READMEs route docs/tools/tests/assets/data. The .ignore file keeps
generated reports, backups and archived scope out of ordinary rg searches.

Verified:18 existing tooling +20 owner-gate +23 navigation tests;30 planning
checks;100-species reference agreement. All55 runtime hashes match the start
of this task. Browser suites were not rerun for documentation/tooling changes.
No art, tuning, saves, owner approvals or commercial criteria changed.
Owner priorities remain OR-01 visual revision and OR-02 opening-loop review.

## Owner-review handoff — validation timing gates

Gameplay remains Pass18; no runtime, art, balance or normal save changed.
OWNER_REVIEWS.md is the owner-facing board; docs/review-gates.json owns its
12 gates and explicit decision records. Current expanded-roster art needs
revision (OR-01); first-session feel awaits review (OR-02). No owner approvals
were inferred and no new visual review packet was produced in this task.

Use scripts/project.py reviews before work; select the honest --work milestone
and --enforce before dependent production. Per-creature production requires
named species approvals. Approvals require explicit owner scope and pinned
evidence; changed evidence triggers re-review. Tests and reversible prototypes
can continue. Follow AGENTS.md for owner-priority updates at each handoff.

Verified:38 tooling tests (18 existing +20 owner-gate tests),30 planning checks,
generated board/map freshness and100-species reference agreement. Browser
suites were not rerun for this documentation/tooling-only task. Existing
engineering and Pass18 browser evidence below remains historical evidence.

## Engineering handoff — AI-maintainability foundation

Gameplay remains Pass18; no runtime JS/CSS/HTML or normal save was changed.
Start at README.md and FEATURE_MAP.md, not this historical log. The maintained
manifest is docs/architecture.json. Use scripts/project.py check / impact /
verify / backup; see docs/ENGINEERING.md for the change and commercial-growth
boundaries. The previous README play instructions are in docs/PLAYER_GUIDE.md.

Verified: Chrome and Edge full current gates, including14 new boundary checks
per browser;18 tooling mutation tests;30 planning checks;100-species reference
agreement. Detailed evidence and limits: docs/ENGINEERING_VALIDATION.md.
Git/CI scaffolding is prepared, not a remote deployment. Work-account author
identity was not silently used for a commit. No commercial cards were checked off.

## Current handoff — Pass18

Status: PASS18 PLAYABLE AND VERIFIED, 2026-09-11.
Final:2,067 mechanics/regression +29 played UI in Chrome, the same in Edge,
plus33 campaign/receipt regressions =4,225 passing browser assertions. All five
reports match55 runtime source hashes. Planning integrity30/30;100-species JSON
and four generated tables agree. Preview port8765 returns HTTP200, badge18.
One agent. The owner's normal save was not opened or reset by test browsers.

Latest request:15% temporary Echo odds; use painted signs for lookout information;
replace atlas list with a geographic map; faster/harder wild progression with
carried injuries; clickable village Supply Store with cheap recovery items.
See PASS18_VALIDATION.md for behavior, test caveats and five owner playchecks.

Core additions: adventure-rules.js, world-atlas.js, recovery-menu.js, adventure.css.
Integration: atlas-data.js, profile.js, game.js, app.js, region.js, world-renderer.js,
world-layout.js, menu.js, inventory-menu.js, journey.js and index.html (badge18).
Save v7 gains additive vitality basis points: one shared trainer health value and
per-instance companion values. Legacy saves initialize full; old reserved combat
snapshots replay their original rules. No individual IDs/XP/skills were removed.

Firstlight levels1/5/8/10; later per-species bands. Only Emberfox is introductory
Lv1 (HP430, ATK32, skills0.65, no innate). Other individual wilds use full bases.
Wild XP300 +100×source level; existing XP thresholds unchanged. All configured
Echo thresholds1500/10000 for testing; original release proposals retained in
releaseEchoBP. Source rolls/receipts persist. Boss previews still award nothing.

Injuries persist at checkpoint/completion/abandon; practice is health-independent.
Defeat rescues to the regional village without healing or lost accepted rewards.
Sanctuary free full recovery; Supply Store3-coin45% heal /6-coin50% revive, plus
old provisions. Medicine only between encounters; shop/rest require real service
proximity. Builds/summoning remain in Loadout. Ration preserves injury percentage.

Atlas uses actual30-map road graph, locked/current/visited states, native button
destinations and physical walking. Mobile reach navigation centers both axes.
Sign/tent/sanctuary click rectangles track the existing painted prop bounds;
essential service/sign art is retained in low-effects mode. No new raster art.

Validation entrypoints: tests/pass18_check.py, pass18_ui.py (Chrome/Edge),
pass18_campaign.py (legacy campaign/receipt regression). Artifacts pass18-*;
scripts/refresh_pass18_reference.py updates authorized reviewed live fields from
the current source-hashed Chrome manifest, then creature_reference.py --write --check.
Historical Pass17 evidence below is retained, not current proof of old odds/services.

Limits: local-only authority, reward-free simulated bosses, provisional100-species
art and overall campaign balance; no commercial AC accepted. No stashed notes
implemented. Abrupt crashes may lose the uncommitted combat second. Preview
http://127.0.0.1:8765/ is retained; Ctrl+F5, no reset needed.

## Previous handoff — Pass17

Status: PASS17 PLAYABLE AND VERIFIED, 2026-09-11. One agent.
Latest request completed: per-map random populations, Loadout-only preparation,
left/right sprite/follower fixes, a painted bridge, and the specified100-species
inspiration split. See PASS17_VALIDATION.md for exact behavior, evidence and the
five owner playchecks. Normal owner saves were not opened/reset by tests.

Final checks:2175 logic/regression +26 UI in Chrome and the same in Edge, plus33
campaign/pack/recovery checks in Chrome =4435 passing assertions. Documentation
integrity30/30;100-species reference and four generated tables agree. Final reports
pin51 runtime files. Preview http://127.0.0.1:8765/ returned HTTP200; Ctrl+F5.

Key files: map-population.js (random placement/connectivity), atlas-data.js
(species quotas), profile.js (persistent lives/migration), region.js (world UX,
population counter/followers), character-rig.js and world-v15.css (facing),
world-renderer.js + assets/world-v17 (bridge), roster.js/creature-art.js/menu.js
(families, prototype shapes, guide). MAP_POPULATIONS.md has30 map counts;
CREATURE_FAMILIES.md has100 assignments and rename aliases.

Quotas: Common8/Uncommon5/Rare or Very rare1. New ordinary deaths replace0s;
rare60s. New position≥900 world units from old; Echo10% starters/.01% others
unchanged. Unfinished encounters keep reserved identities, including old surplus
slots. No companion/individual/skill IDs were removed. Old cooldowns finish as saved.

Limits: initial population placement can briefly pause (up to1.36s under heavy
parallel test load); no physical-device/production performance certification.
Taxonomy/prototype bodies are not100 approved painted animation packages. No
online authority, real group acquisition, paid store or stashed notes added.
Generated bridge used built-in imagegen, not unapproved bitmap processing.

Previous handoff below is historical; do not treat its fixed-slot policy or
pass16 source hashes as the current implementation/evidence.

## Previous handoff — Pass16

Status: PASS 16 LOCAL BATCH PLAYABLE AND VERIFIED; full ten-card scope remains partial, 2026-09-11.
Current request: build and validate the next ten features, mapped to F-017–F-026.
Read PASS16_VALIDATION.md for the ten-card matrix. The local campaign is playable;
the full ten commercial cards are NOT complete. Real authenticated group bosses,
server rewards, approved 102-character production animation and external
owner/newcomer/device evidence remain unfinished. Do not hide these behind a
simulated group preview or a manifest count.

## Pass 16 — campaign, durable encounters and presentation

- One agent; no subagents, public deployment, purchases, accounts, payment keys
  or normal personal-browser profile use. All browser tests use isolated test
  saves. Existing localhost:8765 preview is retained.
- `campaign.js`: six named eight-step chapters, sixty trainer lessons with
  explicit parties/priorities/dialogue/advice and first/repeat rewards; twelve
  resident-backed forest/cave pack sites; eighteen optional personal challenges;
  six boss warning/target/impact/recovery/phase definitions. Main ending never
  requires rare companions, group wins or collecting all100.
- `campaign-menu.js` / `campaign.css`: Story & challenges, route guidance,
  per-objective progress, decorative-ribbon claims, resume/abandon controls.
  Trainers/packs are physically placed on the existing world maps.
- Profile v7 remains additive: `journey`, `encounterSave`, `encounterReceipts`.
  Older v7 saves initialize these fields without losing companions. Original
  battle party/profile/seed/supply receipt plus committed tick reconstruct the
  same fight. One-second and leave/end checkpoints. Reserved lives cannot
  respawn mid-fight; accepted partial kills survive defeat/abandon; untouched
  residents never pay. No cloud/concurrent-storage authority is claimed.
- Wild and pack victories retain immediate return+loot. Trainer pets do not
  enter wild loot settlement. First/repeat trainer receipts no longer invent
  a biscuit in the popup. Chapter XP is documented in Companion stats.md;
  this is quest XP, not the stashed account-mastery buff. Evolution stays stashed.
- Boss altars: level1–100 and1/2/3 **simulated** practice parties. Three full
  parties plus boss and three attendants =13 actors. These are reward-free;
  no connected-player service or essence ledger was added. Common party scaling
  definitions are local previews only, not a live realm implementation.
- `presentation-contract.js`: all510 skill assignments mapped;0.26-second
  presented impact deadline shared with projectile/contact/HP/hit/sound request;
  reduced motion uses immediate presentation. Solo catch-up is capped at40ms
  real delta/render frame, avoiding skipped effects after long frames. This can
  slow playback during severe stalls; canonical combat results do not change.
- `creature-art.js` / `character-rig.js`: explicit vector limb/wing/tail pivots;
  coverage audit:3 painted16-pose rigs,71 vector-joint rigs,18 vector fallback,
  10 portrait fallback (including the retained painted Elderroot portrait).
  All102 remain unapproved production art. Missing portraits get a labeled,
  nonblank original vector fallback; Retry artwork restores them.
- `reference-scene.js`: `?test=1&reference=16` offers a reproducible reference
  Druid/Emberfox/Stonehorn versus Mage and separate test-summon path. The test
  reference resets only the test save. ART_BIBLE.md defines approval rules.
- Imagegen skill used for two Mage-sheet attempts. Both have baked checkerboard
  RGB backgrounds, failed alpha inspection and are excluded from gameplay.
  Originals preserved, candidates and exact prompts under assets/art-v16.
  Asked permission for local cleanup; no answer received at this checkpoint.
  Do not process the bitmap locally until that authorization arrives.
- Development-only free Playwright FFmpeg/Winldd helpers installed for played
  WebM capture; no game runtime dependency added.
- New test commands: tests/pass16_check.py, pass16_ui.py, pass16_visual.py,
  pass16_world.py --full (and --browser edge where supported). Final totals and
  pinned hashes belong to PASS16_VALIDATION.md. Earlier development visual
  runs found/fixed2× deadline lag and completed the summon confirmation path.

### Remaining completion gates

Real account/realm authority and2–3-client boss sessions/essence receipts
(F-037–040/F-061–063) are not implemented. Group challenges are not implemented.
F-024 needs owner approval of the pinned played reference and8/10 real novice
observations; F-025 production remains gated on it, with28 simpler fallback
characters and unapproved rigs throughout. No physical-phone, live network,
production security or acoustic-onset certification has been performed.
These are genuine unfinished requirements, not accepted waivers.

Historical pass15 world work follows unchanged below.

### Final pass16 evidence

- Frozen50-file runtime: Chrome33/33 new +24/24 UI +2079/2079 regression
  +85/85 world; Edge33/33 new +24/24 UI +2079/2079 regression. Total4357
  passing assertions across browsers. Source hashes all match final files.
- Chrome reference recordings3/3: same38.00-second result,96 presented impact
  deadlines each. Maximum deadline lateness16.7ms at1×,73.1ms at2×,16.7ms
  reduced; p95 frame16.8/16.9/16.8ms. Controlled actual drop→loot→confirmed
  summon produced the third independent companion. Not acoustic/network or
  physical-phone/human-approval evidence. Final clips/reports under tests/artifacts.
- Docs30/30 with zero commercial criteria accepted. The100-species reference
  generator passes against fresh pass16 runtime export. PreviewHTTP200.
- One world fixture needed a proper asynchronous status wait; final85/85
  retains the missing-art/focus/retry assertion. Earlier edited-build and timing
  failures were fixed/retested, not relabeled as passes.
- Stop point: all implemented local paths verified and saved. Do not claim
  the remaining live group/realm, art-production and human/device gates complete.

## Pass 15 — illustrated Six Reaches world

- One agent; no subagents, purchases, paid asset orders, account setup, deployment
  or changes to the owner's personal browser profile. Existing localhost:8765
  preview was verified HTTP 200 with the current world scripts.
- All 24 authored exploration layouts and six towns preserve atlas IDs/dimensions,
  level gates and 94 fixed species habitats. New local graph, loops, physical
  forest/cave/town gates, road crossings, cave rooms and visible bridge geometry.
- Six original generated 4×4 biome prop atlases plus a 3×3 material atlas, each
  delivered 1254². Thirty hero landmarks, layered scenery/ground, cave rock rims,
  occlusion fading, ambient sway/motes/ripples and biome/cave arena backdrops.
  PNGs and exact prompts/provenance/hashes: assets/world-v15/prompts.json.
- World renderer boundary: 1024-unit chunks rasterized 512², 28-chunk LRU,
  at most two logical biome sheets, bounded nearby prefetch, visible-prop mounting.
  Low-effects/reduced-motion support, explicit loading/fallback/retry controls.
- Click A* routes around obstacles using the same 20-unit footprint as movement.
  Atlas destinations walk through real gates; manual click/WASD/Escape cancels.
  Two real movement-loop opposite-edge walks verified, plus 96 directed route fixtures.
- Keepers, caches, rest/preparation and existing town services/challenges retained.
  A persistent journal records 72 wilderness + six town landmarks; no new stat,
  XP, drop, pity or payment benefit. Existing spawn lives and rewards survive revisits.
- Offscreen wildlife images load when visible; exploration animation sheets load
  on first movement/action, preserving static portrait fallback. Combat sheets
  retain immediate mounting. Initial measured payload reduced15.9MB to9.7MB.
- Profile remains v7; saved position is moved only if new geometry blocks it.
  Independent companions, build v4, attributes, formation, skills, XP, Echo rules
  and local kill/summon receipts remain unchanged.
- data/creature-reference.json revision 2 now matches all 94 relocated habitats.
  Generator refreshes the three 100-species reference artifacts and rejects stale
  runtime exports using root source hashes. No proposed material drop was enabled.
- Updated world design status, README, stat notes, feature traceability/validation
  pointers, asset provenance and standalone browser mechanics page.

### Verification

- Chrome 152.0.7977.83 and Edge 152.0.4191.66: 85/85 world checks + 2,079/2,079
  combat/save checks each = 2,164/2,164 per browser. Zero JS/missing-asset errors.
- World navigation: 574 approach targets across 30 maps, including 282 fixed spawn
  slot positions; all reachable. 100-remount cache/DOM stress, discovery reload,
  actual gate arrival/cancellation, 390px layout, reduced motion, asset failure/retry.
- Regressions: 1,000 seeded fights; all 100 species and 510 skill assignments;
  same-species independent copies; legacy save migration; failed-write retry;
  immediate wild loot; packs wait for final enemy; trainer duels retain results.
- Final cold-load check at 10 Mbps / 50 ms: controls ready in 0.97 s,
  392,168 critical bytes; initial progressively loaded art/code 9,694,930 bytes.
  Standalone mechanics page passes 2,041 / 2,041 checks.
- Documentation integrity 30/30; all 100 live reference rows match the current export.
  All 44 root runtime files match both browsers' recorded SHA256 hashes.
- Final pinned five-minute real-time Chrome trace: 300.17 s, 17,900 frame intervals,
  p95 16.9ms /p99 17.0ms, six biomes plus caves, two battle/loot returns.
  Sampled render p95 <= 2.7 ms; caches bounded 28 chunks / 2 sheets, 46 visible prop nodes.
  Headless desktop measurements, not an Android/whole-GPU-memory certificate.
- Artifacts: tests/artifacts/pass15-{chrome,edge}.json,
  pass15-regression-{chrome,edge}.json, pass15-nav-{chrome,edge}.json,
  pass15-trace-chrome.json, pass15-delivery-chrome.json,
  pass15-regression-reference.json and pass15-*.png screenshots.
- Commands:
  python tests/world15_check.py --full
  python tests/world15_check.py --full --browser edge
  python tests/world15_check.py --trace-only --performance-seconds 300
  python tests/world15_check.py --delivery-only
  python tests/scope_docs_check.py
  python scripts/creature_reference.py --check

### Explicitly unfinished

Final 100-creature art/animation packages, landmark mechanism animation/soundscape,
ordinary material drop/crafting proposals, six bespoke online group bosses/essences,
accounts/authoritative receipts, approved physical devices, complete accessibility
and rights review, uncoached outside-player pacing/retention, 30-minute real-time
release soak, commerce and operations. These were not silently marked accepted.
All commercial criteria remain unchecked. The local region build is not a promise
of Sword x Staff production parity. Mastery/evolution game notes stay stashed.

Next useful action: owner walkthrough in PASS15_VALIDATION.md; approve or critique
the new world style before another art production batch. Use the isolated
?test=1 adventure to grant/summon a level 100 Echo and inspect the later regions.

## Historical pass14 handoff

Historical status: PASS 14 PLAYABLE LOCALLY AND VERIFIED, 2026-09-11.
Current request completed: immediate wild-win loot, independent duplicate
companions, visual selection, detailed world/100-creature production planning.
See PASS14_VALIDATION.md for the owner's checklist and implementation boundaries.
Historical sections below describe earlier builds, not current ownership rules.

## Pass 14 — independent companions, fluid rewards and production design

- One agent. No purchases, deployment, accounts or personal browser profile
  mutations. No new bitmap/art generation or monetization tools were used.
- Terminal monster-encounter wins return directly to the map with a loot dialog.
  No-drop, actual Echo/XP, pending save and retry states are explicit. Packs wait
  for the final monster; duels retain their results. Reopening cannot regrant.
- Profile v7 introduces stable companion IDs with independent XP, skills and tree
  investment. Repeated species are legal; the same individual cannot fill both
  party slots. Bench builds persist; XP/food target individuals, not species.
- Summoning consumes a specific owned Echo and creates one individual. Retry
  returns its original receipt; new Echoes can create further copies. Failed
  persistent writes retain the item and do not create the individual.
- Portrait picker replaces party dropdowns: search/role filters/pagination,
  empty slots, swaps, Escape/focus. It also selects trainer classes, tree
  companions and food recipients. Inner Sea separates individuals/species guide.
- Profile key bond-bolt-profile-v7; build key bond-bolt-build-v4, each with
  isolated -sandbox variant. Existing v6/v3 keys migrate without overwrite;
  v5/v4 legacy profiles still read. XP/trees/items/coins and saved equipped
  skills are retained. Version6 atlas position persists.
- WORLD_DESIGN.md: all 24 authored map briefs/six towns, six biome kits,
  Firstlight blockout, camera/layers, art/streaming budgets, production stages,
  commercial/no-Echo risk gates and performance acceptance targets.
- CREATURE_DESIGN.md: all 100 silhouette/motion briefs, production packages,
  role/property grammar, six future boss encounter concepts and art gates.
- CREATURE_REFERENCE.md / CREATURE_DROPS.md / CREATURE_REFERENCE.csv:
  all 100 actual bases, roles/elements, five skills/defaults/innates, live
  habitat/availability/drop rates. data/creature-reference.json maintains the
  baseline; scripts/creature_reference.py regenerates tables and checks runtime drift.
- Proposed ordinary material drops are **not live**. Existing Echo/coin/XP
  rates are unchanged. Boss previews remain reward-free; online essence
  acquisition is unfinished. No stashed account mastery or evolution added.
- Updated current scope/backlog/validation/traceability, README and stat rules.
  Historical archived plans/earlier test suites remain available.

### Final verification

Chrome 152.0.7977.83 and Edge 152.0.4191.66 each passed **2,078 / 2,078**,
with zero JavaScript errors/missing assets. Final runs 2026-09-11 04:57 UTC.
Forty root JS/CSS/index.html hashes match across both reports and current disk.
Includes 1,000 seeded battles, all 510 assignments, all 100 species as independent
two-copy battles, UI hunt/return/picker/reload, keyboard focus, v6 migration,
copy-specific XP/skills/tree/food, quota-failure recovery, no-drop, pack and duel.
Reviewed desktop and mobile-width screenshots.

Commercial-document integrity: 30/30, 66 features/264 criteria, zero marked
commercially accepted. Creature generator/checker passes all 100 runtime rows
and generated Markdown/CSV consistency. Local preview on 127.0.0.1:8765
returned HTTP 200; the already-running preview service was retained.

Commands: python tests/pass14_check.py; same with --browser edge;
python tests/scope_docs_check.py; python scripts/creature_reference.py --check.
Reports: tests/artifacts/pass14-{chrome,edge}.json; screenshots pass14-*.png.
Current standalone tests page references tests/pass14-engine.js.
Old pass13 suites describe historic species-level ownership and are not current UI acceptance.

### Deliberately unfinished / recommended next work

Final map artwork/layout implementation and 100 commercially approved creature
packages are **planned**, not delivered by this request to scope/design them.
Start the polished Firstlight/four-starter slice described in WORLD_DESIGN.md;
prove its quality and throughput before mass production. Real player groups,
server-authoritative saves/rewards, physical-device performance/accessibility,
campaign balance, asset rights and the remaining commercial backlog stay open.
The 0.01% nonstarter Echo policy creates a serious ordinary-player collection
risk; documented without changing user-approved odds or adding hidden pity.
No commercial-success guarantee or short production-time promise is made.

## Historical implementation record

## Pass 13 — local F-001–F-016 implementation

- One agent. No purchases, accounts, deployment, telemetry or personal browser
  profile edits. Existing v5/v4 local saves are migration inputs, not overwritten.
- Added explicit melee/STR, ranged/DEX and magic/INT categories, seeded physical
  dodge, tiny VIT armor/regen, locked Speed/seconds and category-aware previews.
- Zero–two companions, three distinct skill priorities, formation/empty swaps.
  Removed automatic starter ownership. Trainer level follows highest owned or 1.
- 100-species catalog (94 wild + six boss forms), five skills/three equipped each,
  100 innates, 102 role-usable eighteen-node trees. Ninety new code-native SVG
  portraits are prototype art, not commercially accepted distinct silhouettes.
- Added actual 24-map 2D atlas plus six town hubs. Physical cave/forest gates,
  camera, minimap walking, collisions/followers, fixed habitats and per-life
  spawn/loot state. Large-map axis distances are about 47–57s at 210 units/s.
- Replaced papyrus capture with 10% starter / 0.01% nonstarter Soul Echo drops.
  Separate 100% summon, one companion/species, stored duplicates, local receipts,
  coins/per-kill XP, inventory provenance, failed-save retry and consume-once food.
- Both classes can win against all four level-1 starters with no monsters/items.
  Tutorial makes no promise about first-drop timing and introduces no pity.
- Five original trainer challengers and five-foe pack retained. Six boss altars
  provide level-selectable reward-free previews. Real group acquisition remains
  pending; the 13-actor group fixture is a local rules simulation only.
- New isolated QA save at ?test=1 supports controlled Echo grants and source
  levels without changing the normal save. Export-local-save button added.
- Updated README, Companion stats, backlog status, commercial scope and validation
  plan. All 264 commercial checkboxes stay unchecked; no P0 requirement reduced.
- Stashed account mastery and quest evolution remain untouched.

### Verification — final frozen build

- Chrome: 2,083 / 2,083 checks passed; zero JavaScript errors or missing assets.
- Edge: 2,083 / 2,083 checks passed; zero JavaScript errors or missing assets.
- Each includes 1,000 generated battle seeds plus full content and browser
  journeys. The standalone current tests page also passes its mechanics suite.
- Reports include browser versions, UTC timestamps and SHA-256 hashes of all
  root JavaScript/CSS. Both browsers tested the same frozen source.
- Reviewed desktop world/collection/inventory/combat/cave and mobile screenshots.
  They confirm layout/function, not commercial art or accessibility acceptance.
- Local preview is running hidden on 127.0.0.1:8765 (Python PID 6800); HTTP 200
  verified for the game and validation file. This is not public hosting.


Current commands: python tests/pass13_check.py; same with --browser edge.
Reports: tests/artifacts/pass13-{chrome,edge}.json and engine companions.
Includes independent formulas, exact drop boundaries, all 510 assignments,
all species test-summoned/equipped, all trees, 1,000 generated battle seeds,
full browser hunt/summon/persistence, quota-failure recovery, migration,
partial formations, mobile widths, map crossings and missing-asset/JS checks.
Representative actual browser-clock walks supplement all-map geometry checks;
physical-device all-route travel/quality studies remain pending.
Documentation integrity: python tests/scope_docs_check.py — 30/30, 66 features,
264 criteria, zero accepted checkboxes.

### Commercial work still required

Authoritative accounts/rewards/spawns and synchronized groups (later dependencies),
six real boss acquisition sources, cross-client atomicity/reconnect, consistent
production-quality art/animation, world density/layout review, ordinary-roster
campaign pacing and outside-player/device acceptance. Local playability and
schema counts must not be presented as commercial completion of sixteen cards.


## Boss-essence rarity clarification — planning only, 2026-09-10

- User clarified that “one of a kind” meant extremely rare, not one copy per
  server. Removed the lifetime cap from scope, backlog, validation, traceability,
  README and GN-009/010. The original literal interpretation was incorrect.
- Every eligible boss victory retains one independent 0.01% group roll; previous
  drops, summons and ownership never disable it. Multiple owners and repeated
  essence items on the same realm are allowed. Legal summoning stays 100%.
- F-063 now validates per-victory claim deduplication, repeat drops and recovery;
  global claimed/unavailable states and special issuance/retirement tracking
  are removed. Normal account deletion and reward receipt safeguards remain.
- 66 features / 264 criteria remain planned and unchecked. Same world, roster,
  group scope and other drop rates; no gameplay/source/art/save changes.
- Verification: `python tests/scope_docs_check.py` passed 30/30 documentation
  checks, including rejection of the superseded cap and independent new-victory
  rewards. All 264 feature criteria remain unchecked; this is not gameplay QA.
- One agent; no deployment, external account creation, purchase or gameplay test.

## Commercial v2 world / Soul Echo revision — planning only, 2026-09-10

- User requested feature edits, not gameplay implementation. Updated the active
  Commercial MVP scope.md, FEATURE_BACKLOG.md, VALIDATION_PLAN.md and
  FEATURE_TRACEABILITY.md; preserved the previous files under docs/scope-v1/.
- Launch floor: 100 distinct summonable species (planning 94 wild + six bosses),
  two classes, 510 active assignments, 100 innates and 102 eighteen-node trees
  totaling 1,836 nodes. Recolors/placeholders cannot satisfy the roster floor.
- Planned atlas names 24 large maps across six regions, 18 outdoor + six caves,
  and six compact safe hubs. Large-map shortest opposite-side traversals must
  take ≥30 seconds at base speed, target 45–90, excluding loads/combat/idle.
  Fixed habitats roam locally and use durable server-owned spawn lives.
- Trainer-alone start and zero-to-two companion party support; starter Echo
  drops 10%, designated mid/late Echoes and all very-rare rows 0.01%. Legal
  summoning 100%, no extra roll/papyrus/pity/guaranteed first production drop.
  Committed per-kill loot survives later defeat or disconnection.
- Optional two–three-player group bosses need real shared authority, support,
  elimination and reconnect. Corrected after the user's clarification: every
  eligible boss victory rolls 0.01% independently. There is no global copy cap;
  multiple owners/repeat drops are allowed. Deduplicate each victory's claims.
- 66 feature cards (64 P0 + two P1), 264 unchecked criteria, 28 source items,
  18 scope sections, 15 protocols, eight design locks and six release gates.
  F-001–F-057 IDs retained with revised semantics; F-058–F-066 add new systems.
- Withdrawn the v1 small-scope effort/monthly-cost estimates. F-066 requires
  measured roster/map/group/backend throughput and a funded forecast. A smaller
  free pilot is allowed but cannot count as the 100-species commercial launch.
- README distinguishes live contracts/routes from future Echo/world rules.
  GN-009 promoted to PLANNED in commercial v2 only; GN-010 records the new
  design. GN-001 and GN-002 stay stashed; Companion stats.md unchanged.
- Verification: `python tests/scope_docs_check.py` passed 29/29 checks, 66 cards /
  264 criteria found, zero checked. Includes source/protocol mapping agreement,
  acyclic dependencies, local links, roster arithmetic, probability quantiles,
  v2 boundaries and separate v1 archive. This is documentation integrity only.
- One agent. No source-game/art/save edits, no new monsters/maps actually built,
  no gameplay suites rerun, no live deployment, accounts, payments or spend.
- Suggested next implementation when requested: M0 atlas/roster/rule schema and
  runtime spike; a polished trainer-alone starter hunt → drop → inventory →
  Inner Sea summon slice on one actual large map; early three-client boss and
  rare-reward restore proof before scaling production.

## V1 feature decomposition — historical planning, superseded by v2

- FEATURE_BACKLOG.md decomposes the complete commercial scope into 57 cards:
  55 P0, two optional P1, 228 uniquely identified acceptance criteria. Each card
  records baseline, milestone, dependencies, original MVP IDs, accountability,
  required scenarios, validation protocols and evidence expectations.
- VALIDATION_PLAN.md defines 12 validation protocols, six design locks, six
  release gates, fixtures, numeric measurement conventions, defect severity,
  regression selection and acceptance/launch evidence templates. Separates
  technical verification from human/device/business and cohort acceptance.
- FEATURE_TRACEABILITY.md covers all 21 original delivery items and all 18
  scope sections, plus source quantities and deferred-feature boundaries.
- No feature was implemented or commercially accepted in this pass. The next
  gameplay work remains corrected attributes (F-001–003) and spatial entrances
  (F-016–018), then the F-024 reference encounter. Existing game notes untouched.
- Added read-only tests/scope_docs_check.py to audit document IDs, criteria,
  dependencies/cycles, traceability and local links; this is not a gameplay test.
- Documentation audit: 17/17 checks passed, all 57 cards / 228 criteria found,
  all 21 source items and 18 scope sections covered, dependency graph acyclic,
  local links valid. Zero acceptance criteria checked as delivered. Command:
  `python tests/scope_docs_check.py`. No gameplay suites rerun for this pass.
- One agent; no source-game/art/save mutation, account creation, public deployment,
  payment, marketing spend or player study. Pass 12 remains the last game build.

## V1 commercial scope — historical planning, superseded by v2

- Created Commercial MVP scope.md at the user's request for a full, small
  commercial-launch scope. Contains current-state audit, bounded gameplay/content,
  graphics/audio standards, accounts/server authority, cosmetics, QA, release gates,
  costs, effort estimates, owner dependencies and a numbered delivery backlog.
- The proposed level-20 release ceiling, expanded encounters, Haven and online
  systems are planning decisions, NOT implemented gameplay changes. The current
  prototype remains pass 12 with its level-100 test/progression ceiling.
- Pending latest implementation request: corrected STR/DEX/INT damage categories,
  AGI attack speed/tiny dodge, VIT HP/tiny defense/regen, Leadership; cave/forest
  entrance props in every region. Inspected but no source edits made before the
  user requested this analysis. Resume with MVP-01 and MVP-02 in the scope file.
- Reviewed source/docs and saved pass-12 reports; checked current primary-provider
  documentation for costs and production constraints. No new gameplay tests or
  device certification claimed for this documentation-only pass.
- One agent; no deployment, payment, advertising spend, generated asset, account
  setup or real player-save change. Game notes and deferred GN-001/002/009 unchanged.

## Formation and boss test levels pass 12 — current

- Party & bag → Formation, also linked from Your party. Three illustrated rank
  cards and native selectors; one member per Front/Middle/Back position, automatic
  swap when occupied, keyboard focus retained. Default trainer back, companion I
  middle, companion II front. Rank changes real starting coordinates in all player
  battles, not stats/skill order/identity. Normal movement and targeting continue.
- Saved formation belongs to party slots; changing class/species updates portraits
  while keeping positions. Editing formation discards paused combat but preserves
  the expedition and its pre-rolled rewards. World following order is unchanged.
- Elderroot entry dialog: integer test levels 1–100, Match trainer level button,
  live HP/basic-power/phase-Quake preview, validation, and clear restart/resume copy.
  Same level resumes the paused boss; a changed level starts fresh; restart keeps
  the accepted level; cancelling does not commit changes. Normal NPCs hide controls.
- Boss HP/basic attacks/damaging skills scale using existing level formulas.
  Bramblequake now also uses the boss offense factor in both phases. Level 1 is
  unchanged. No player-level changes or new/repeatable reward entitlement.
- Additive formation/bossLevel fields in profile v5; missing/invalid data safely
  defaults without resetting prior ownership, XP, inventory or progression.
- GN-009 cooperative boss fights saved as STASHED in Game notes.md. No multiplayer
  or cross-player targeting implemented. Existing stashed ideas remain untouched.
- New formation.js, formation-menu.js and formation.css reuse existing character
  artwork. No image generation, new dependency, paid resource or external service.

### Verification

Chrome and Edge: **51/51** new formation/boss integration checks each, plus
**141 baseline + 72 progression mechanics checks** each. No JavaScript errors or
missing assets. All six deployments run to a valid result; a front trainer still
loses on death and normal attacks still target monsters first. Includes actual
short requestAnimationFrame playback, state invalidation, persistence, malformed
save/input rejection, class changes, resume/restart/cancel behavior and level
1/5/25/100 boss completion. Both Quake phases have verified level-scaled damage.

Formation fits 320/390/768/1440px; boss entry fits 320px. Desktop formation and boss
dialog screenshots visually inspected. These are browser viewport checks, not
physical-device performance certification. Chrome additionally reran the existing
82-check progression/capture/inventory/expedition suite successfully. The profile-
aware expedition sample now has 101 wins/19 losses across 120 finite, completed
fights due to the new starting formation; the 1,000-build legacy sample is unchanged.

Reports: tests/artifacts/chrome-v12-report.json and edge-v12-report.json.
Current existing-suite rerun: tests/artifacts/chrome-v11-report.json.
Run: python tests/formation12_check.py [--browser edge]. README.md and
Companion stats.md document controls, coordinates, scaling and save semantics.
Local preview returned HTTP 200 and serves formation-menu.js at handoff.

One agent used. All edits confined to monster-browser-prototype; test browser
profiles were isolated. No real user save, business file, deployment or purchase
was touched. Work saved and verified; no unfinished item in this requested scope.

## Progression and expeditions pass 11 — historical

User explicitly confirmed: stash items 2–3; implement 4–9 now. One agent used.
Game notes.md and AGENTS.md preserve the stash/clarification workflow. Account-wide
species achievements and quest evolution remain STASHED and are not in gameplay.
Companion stats.md now documents live formulas, not draft implementation requests.

### Delivered

- Post-victory capture: choose Try to catch above the arena while combat is active
  or paused. No HP gate, nonlethal damage floor, auto-pause, channel or trial pulses.
  Standard contract 65%; illuminated 90%. One paper used on a resolved winning
  attempt, even on a failed roll. Losing, leaving, unarmed fights and already-owned
  species use none. Catch once per species; saved rolls survive unfinished reloads.
- Speed replaces the Action stat: seconds per ready action = 100 / Speed; both
  are shown in menus/inspector. Movement and cooldowns remain separate. Original
  baseline timing, targeting exceptions and status semantics remain verified.
- Monster XP/levels 1–100; trainer equals the highest owned companion, including
  benched ones. STR/AGI/VIT/INT/DEX/Leadership, escalating point costs, level grants,
  free respec, visible fractional sharing at 0.5% per Leadership point. The six
  attribute identities are Ragnarok-inspired, not an exact damage/ASPD port.
- Four unit elements: Water > Fire > Earth > Wind > Water. Advantage 1.2×,
  disadvantage 0.8×, other matchups neutral. Actual damage uses the chart; guard
  does not apply it twice. Heals/shields and rarity do not gain elemental power.
- 18 nodes for each class/species, rank caps 3/5/10, prerequisites, independent
  point budgets and saved ranks, real stats, free reset. Shared simple template
  with a class/role affinity. Three active slots and innate passives stay separate.
- Cave/forest boards in all five regions; ten region/type pools, three encounters
  per route, full recovery between fights. Original Hollow Seal faction trainers
  alternate with catchable wilds. One wild, one faction, third 60%-wild. Local
  rarity weights 80/10/5/2.5/2/0.5%; picker handles absent/single-species tiers.
- Repeatable regional coins/XP; independent faction drops 20% food, 5% illuminated
  contract, 2% Starseed keepsake. Memory Fruit grants XP; Trail Ration prepares a
  one-fight 10% party-HP boost. No paid gameplay items or new runtime dependency.
- v5 atomic profile migrates old ownership, inventory, claims and valid node
  ranks; XP starts at level 1 for legacy companions. Old keys remain. Fixed NPC
  rewards cannot repeat; expedition cursor/receipts prevent duplicate claims.
- Trainer ledger, XP bars, element table, ranked-tree layout, updated inventory
  details, saved expedition resume/leave/next-encounter controls and reward summary.

### Verification

Current Chrome and Edge both pass the full progression browser suite and the
offline/storage-denied/touch suite. Exact counts are in the v11 report files below.
Zero reported JavaScript errors or missing resources; fallback suite confirms
zero external runtime requests. UI widths 320, 390, 768 and 1440px fit.

- 141 baseline combat checks + 72 new progression checks = 213, passing in both
  browsers and the manual tests/index.html page. 1,000 standard varied builds,
  120 expedition fights at levels 1–20, 100,000 rarity rolls, all 16 element pairs,
  all 12 trees, migration, attribute caps, Speed and Leadership formulas covered.
- All 120 expedition simulations terminate with finite health: 100 wins/20 losses
  in the specified sample. Not every default build wins every faction matchup.
- Real requestAnimationFrame smoke fight completed in Chrome at 16.95 seconds
  (10 smoke checks); comprehensive suites additionally exercise actual UI with
  model fast-forward for repeated combats. Do not describe every test as realtime.
- Armed success/failure, rare scroll, no opt-in, duplicate ownership, loss,
  abandon/reload, XP, food, ration/resume, stat/tree respec, old-key retention,
  independent simultaneous loot drops and repeated-result protection verified.
- Full three-fight route including reload between encounters verified in both
  browsers using a legal level-10 Mage/mastery build. A fixed seed exposed a
  losing default-Druid matchup against Druid/Fox/Otter; a separate balance probe
  confirmed a real counter-build, then the deterministic UI fixture was corrected.
  No battle winner, enemy HP or reward was forced to make that route pass.
- Direct file-open, blocked storage and mobile touch/reduced-motion mode finish
  combat and resolve a contract attempt. Catch choice is above the arena, not
  below the mobile fold. Boosted HP bars update their accessible maximum.
- Visually inspected combat, mobile trainer ledger and existing presentation.
  Local preview returned HTTP 200 and serves pass 11 scripts at handoff.

Reports: tests/artifacts/chrome-v11-report.json, edge-v11-report.json,
chrome-v11-final-report.json, edge-v11-final-report.json,
chrome-v11-smoke-report.json and *-v11-runCombatTests/runProgressionTests.json.
Commands: python tests/progression11_check.py [--browser edge] [--smoke],
python tests/final11_check.py [--browser edge]. tests/probe11.py documents the
fixed-seed matchup diagnostic. All browser saves used for tests were isolated.

### Boundaries

Numerical progression, catch odds and route difficulty are initial balance.
Cave routes are encounters using existing arena art with a darker treatment,
not separate walkable dungeons. Faction trainers reuse class appearances; new
item types reuse icons/papyrus or simple symbols. No new image generation.
The prior three-character animation pass is retained, not expanded this time.
No account mastery, evolution quests, water exploration, duplicate individuals,
walkable Haven, AFK system, multiplayer, server authority or commercial economy.
No Safari/Firefox/physical-device performance certification. Old v9/v10 suites
contain superseded nine-node/low-HP-ritual expectations and are historical only.

All edits are within monster-browser-prototype. No purchases, deployment, external
messages or unrelated business-file changes. Implementation is saved; stop here.

## Deferred design notes — 2026-09-10

Game notes.md now stores future ideas and the user's stash-versus-implement rule.
Companion stats.md originally contained a draft Speed-to-seconds conversion and trainer/
Leadership design reference. AGENTS.md preserves this workflow for future work.
Account mastery and quest evolution are explicitly stashed; user items 4–9
are now authorized for implementation by explicit user confirmation. Pass 11
changes gameplay and migrates to v5. Pass 10 below is historical evidence.

## Bonding and animation pass 10 — historical

Scope: PASS10_SCOPE.md. One agent. No new paid API/service or runtime dependency.

- Druid, Emberfox and Stonehorn: 16 actual poses each. Walk, staff strike/pounce/
  horn ram, cast, hit, defeat, victory; Druid ritual hold. Measured frame bounds
  in animation-data.js, fixed character scale/foot anchors, cached canvases,
  delayed impact synchronization, pause/reduced-motion behavior. NPC identities
  are preserved. Other roster members retain prior animation.
- Illustrated satchel: categories, item stacks, selection/detail panel, biscuit
  preparation and a 10-earned-coin contract inscription action. Materials and
  trophies are still keepsakes, not pretend equipment.
- Five persistent grass habitats cover ten species. Native discovery dialog,
  actual single-spirit encounter and deterministic four-heartbeat ritual.
  Start at <=35% spirit HP after four seconds; automatic first-window pause.
  Trainer cannot act/move while channeling. Each pulse is 9% maximum trainer HP
  before guard/armor/shield. Companions keep acting. Pulse-four death fails.
  Damage/Burn cannot kill the wild spirit; 75-second timeout fails.
- Success pulls the spirit toward the trainer and records its home pact.
  One contract spent only on a successful new bond; duplicates/results guarded.
  Three starter papers, two per treasure; no NPC/practice/boss catches.
- Fresh ownership is Emberfox + Stonehorn. v4 atomic profile preserves legacy
  progress, trees and equipped player monsters; prior unearned preview species
  become unbound. Old save keys remain. Reset explicitly clears catches and
  repairs unbound party slots. No changes to actual user's browser saves by tests.
- Inner Haven illustration + bonded/unbound collection and origin records.
  Unbound monsters remain inspectable and their mastery can be planned, but
  cannot be equipped. Walkable hideout/cosmetics/chores/AFK rewards deferred.
- Seven bundled original assets, including 48 character poses, in assets/art-v10.
  Built-in imagegen only. Initial checkerboard-background sheets were rejected;
  final assets have genuine RGBA transparency (landscape is intentionally RGB).
  Final prompt set and provenance: assets/art-v10/prompts.json.

### Verification

Chrome 152.0.7977.83 and Edge 152.0.4191.66; isolated local profiles only.

- Both browsers: existing full trail suite 111/111; new capture/inventory/save/
  responsive suite 54/54. Zero unexpected JS/console errors, missing assets
  or external runtime requests in these full suites.
- Pure mechanics: 141 baseline + 87 mastery/encounter + 35 ritual checks,
  all passing. Existing 1,000 standard-build and 500 pack/boss sweeps retained.
  The manual tests/index.html page now runs all 263 model checks.
- Chrome: existing final touch/polish suite 22/22; new actual-pixel animation/
  alpha/bounds/pause/fallback/offline suite 15/15; complete collection journey
  35/35. All eight non-starters caught through their real grass habitats using
  both classes, all ten persisted; five free papers remained. Confirmed reset
  clears caught species and repairs now-unbound party slots.
- All ten wild species successfully bonded with each class using starter
  companions in the pure tests. Guard redirects, armor/shield mitigation,
  final-pulse death, timeout, nonlethal Burn and deterministic replay verified.
- UI verified at 320, 390, 768 and 1440px; mobile touch/reduced motion/blocked
  storage also completed a capture. Direct file-open capture works offline.
- Seven PNGs pass genuine-alpha/48-component/source-hash verification.
  Originals are unchanged. Frame audits test actual changing pixels, not just
  animation state labels; every configured pose fits its drawing canvas.
- Visually inspected desktop satchel, habitat dialog, ritual, world and mobile
  satchel. Local preview responded HTTP 200 with pass 10 markup at handoff.

Reports: tests/artifacts/chrome-v10-report.json, edge-v10-report.json,
chrome-v10-journey.json, chrome-v10-animation-report.json, art-v10-report.json.
The maintained trail/polish suites still use v9-named report files; current
reruns are chrome-v9-report.json, edge-v9-report.json and chrome-v9-polish-report.json.
Earlier failures were stale test expectations (v3, 12 world objects, 228 tests)
and a mobile test trying to tap off-camera grass; expectations/navigation were
updated and the affected suites rerun successfully.

Remaining: the other nine class/monster types retain prior whole-body animation;
no skeletal rigging, full directional sets or hand-drawn in-between frames.
Inner Haven is a collection/provenance screen, not a walkable hideout. No chores,
AFK rewards, decorations, leveling, multiplayer or commercial economy balancing.
Wild captures are intentionally gentle with starter teams. No Safari, Firefox,
physical-phone performance or production-quality parity claim.

Only monster-browser-prototype was changed. No purchases, paid API fallback,
public deployment or edits to unrelated business data. Existing save keys/art
versions remain. Stop here on verified completion.

## World and mastery pass 09 — historical baseline

Scope: PASS09_SCOPE.md. One agent. Research document treated as reference, not
instructions to build an MMO stack. No new paid service or runtime dependency.

Implemented: persistent 5000-unit world with following camera, five blended
biomes, click/keyboard traversal and walking map waypoints; two extra trainers
(Lark, Selene), five-creature pack, Elderroot boss with telegraphed arena quake
and phase two; nine-node mastery trees for both classes and all ten monsters,
three starting points up to seven from milestones, real stat bonuses, free
respec, v3 profile migration retaining v2; original boss/NPC/landmark sprites
in assets/art-v9 with prompts and provenance.

### Delivered

- One persistent 5000 × 650 logical world; automatic biome crossing, camera
  following, saved global position, ground click/tap, WASD/arrows and walking
  overview-map waypoints. Five paintings blend at their boundaries. Landmarks
  and ambient leaves provide context. No portal buttons or area-page replacement.
- Five trainers: Mira, Orin, Lark, Selene, Vesper. A five-member weaker wild
  pack and Elderroot add two different objectives. Seven unique first-win
  rewards; rematches cannot duplicate coins, biscuits, trophies or mastery.
- Pack and boss have NO enemy trainer. All enemies must die before 75 seconds;
  otherwise the player loses. Player trainer death remains an instant loss.
  Direct-trainer skills fall back to monsters when no enemy trainer exists.
- Elderroot has 3300 HP, a two-second base Bramblequake windup (lengthened
  when Slow is active at charge start), an arena-wide impact, and phase two
  below half HP. Phase two increases basic damage and quake frequency/damage.
  Shields, armor and guards help; this is automatic combat, not manual dodging.
- Nine-node trees for each of twelve types: HP root and four two-node branches
  for attack, armor, movement and cooldowns. Three initial points, one per two
  first encounter wins and one for all five treasures, capped at seven per tree.
  Independent allocations, prerequisite checks, real model effects and free
  resets. Trees affect the player's party, never the fixed opposing team.
- v3 profile migration preserves v2 inventory/claims and converts local region
  coordinates to global coordinates; old keys remain. Growth edits discard
  paused combat. Adventure reset explicitly includes mastery; builds are kept.
- Presentation: an anticipation phase in melee lunges, less frantic role-based
  walking, boss warning/ground charge/phase cue/impact, readable large boss art,
  mobile eight-unit initiative sizing, and larger NPC interaction stand-off.
  UI/status/journal work skips duplicate simulation ticks; visuals interpolate.
- Five original genuine-alpha 1254 × 1254 PNGs in assets/art-v9, copied unchanged
  from built-in imagegen outputs. Exact prompts and original/bundled paths:
  assets/art-v9/prompts.json. Verified source/bundle hashes; total 7,178,108 bytes.
  The main agent used the imagegen skill and inspected all five outputs.

### Final verification

Chrome 152.0.7977.83 and Edge 152.0.4191.66, isolated profiles:

- Each passed 111 comprehensive browser checks, followed by 22 final
  mobile/touch/art/integration checks: **133 browser checks per browser**.
- Each passed 141 baseline mechanics checks plus 87 new mastery/encounter
  checks: **228 mechanics checks**, including 1,000 standard builds and
  500 varied wild/boss builds. Manual tests/index.html also runs all 228.
- Baseline combat results unchanged: default Grove victory at 38.15s;
  1,000-build sweep 501 Grove wins / 485 Dusk wins / 14 draws.
- Wild/boss random-build sample: 248/250 pack wins, 245/250 boss wins, 7 losses.
  These are intentionally forgiving prototype encounters, not evidence of
  commercial difficulty/balance. They demonstrate distinct objective mechanics.
- Full real requestAnimationFrame playthroughs: all five treasures, five
  regular trainers, pack, boss, first rewards, resume and final persistence.
  With Growing bond + Strength + Tough hide on the default party: Mira 47.6s
  (prepared biscuit), Orin 75s HP tiebreak, Lark 34.9s, pack 31s, Selene 40.15s,
  Vesper 28.8s, Elderroot 45.8s with phase two. Same results in both browsers.
- Verified continuous boundary movement without position jumps/replaced world,
  actual v2→v3 storage migration, free respec, no overspend, all five stat
  branches on all twelve types, paused-battle invalidation, loss/no-reward,
  blocked storage, file mode, keyboard controls, mobile touch interactions,
  quiet/reduced-motion essential warnings and 320–1440px layout checks.
- Zero JavaScript/console errors, missing assets or external application
  requests in comprehensive suites. Final polish workflows also had zero
  JavaScript errors. Desktop/mobile world, trees, pack and boss visually inspected.
- The final polish fixes (boss sprite sizing, mobile action rail, NPC stand-off)
  were tested in both browsers after the comprehensive runs.
- Local preview http://127.0.0.1:8765/ returned HTTP 200 with final region.js.
  It depends on the existing local server process; index.html also works directly.

Reports: tests/artifacts/chrome-v9-report.json, edge-v9-report.json,
chrome-v9-polish-report.json, edge-v9-polish-report.json, art-v9-report.json.
Screenshots use *-v9-*; final boss and pack captures include "final".

Run: python tests/trail_check.py [--browser edge],
python tests/polish9_check.py [--browser edge], python tests/art9_check.py.
README.md and PASS09_SCOPE.md describe rules, scope and reference boundaries.

### Honest remaining gap

This is a finished pass of the local prototype, not Sword x Staff production
parity. Artwork still uses one painted pose per character, not rigged limbs or
authored walk/attack/cast/hit/death frames. Melee groups, especially the large
boss on phones, can visually overlap; health and initiative remain inspectable.
The world is a continuous blended panorama, not bespoke seamless terrain or
obstacle navigation. No physical-phone profiling, Safari/Firefox certification,
capture/leveling, paid cosmetics, multiplayer or public deployment was attempted.
Next high-value work: authored character animation sets, cohesive environment
art, impact/audio polish, asset compression and real-device performance testing.
All requested world/encounter/tree features are implemented and verified.

Single agent used. No new purchases, external messages or production services.
No unfinished implementation blocker remains within this pass's scope.

## Region and collection pass 08 — historical

Requested: five connected scenarios, three NPC conversations/battles, two classes
with five skills each, ten monsters with five skills and one passive each, three
equipped active skills, a persistent inventory and redesigned collection/loadout.
All requested features implemented. All ten monsters are available initially;
there is no capture/unlock grind. No accounts, purchases, multiplayer, shop,
crafting, leveling or new runtime dependency. Existing art files were preserved.
One agent used; no subagents spawned. This is an incremental prototype upgrade,
not full Sword x Staff production parity or a commercial release.

### Implemented

- Five connected, walkable scenarios: Mosslight Clearing, Willowbrook, Amber
  Hollow, Moonwell Ruins and Windstep Rise. Click/tap trail signs to approach
  and travel; backtracking works. WASD/arrows, ground clicks, nearby E and the
  interaction button remain available. Two current companions follow the trainer.
- Three unique NPCs: Mira (clearing), Orin (brook), Vesper (rise). Native dialogs
  show their teams, tactical advice and first-win rewards. Each has an original
  portrait, a distinct fixed team and its location as the combat backdrop.
  Returning to Explore pauses; the same NPC can resume the exact unfinished fight.
- `content.js`: Druid and Mage each have five skills. Ten monsters each have five
  skills and exactly one passive. Exactly three unique active skills are equipped.
  Roster: Emberfox, Stormowl, Frostfang, Cindrake (damage); Stonehorn, Ironback,
  Thornstag (tank); Bloomslime, Tideotter, Lumimoth (support).
- `game.js`: new team-heal, team-shield, self-heal and self-haste behaviors;
  range-gated area debuffs; all ten passives execute in the deterministic model.
  Weaker shields cannot overwrite or extend stronger ones. Existing nearest-monster
  targeting and explicit Skyneedle/Crown Hex exceptions are preserved. Bloomslime
  remains 500 HP; its passive boosts healing rather than health.
- `menu.js` / `menu.css`: illustrated party strip and selected-unit detail panel,
  visible three-slot priorities, five skill descriptions, swapping/rotation,
  trainer/monster selectors, full ten-monster collection with role filters,
  collection-to-party assignment, inventory categories and item inspection.
  The practice opponent is separately editable; edits never alter NPC teams.
- `world-data.js` / `profile.js`: stack inventory, five region keepsakes, three
  trophies, trail coins and Bond Biscuits. Two starter biscuits; each treasure
  gives one more. Prepare/unprepare a biscuit from Inventory. A fresh battle
  consumes it once and grants the player's trainer 80 shield for 10 seconds.
  Preview/resume never consume it, including preparation during an existing fight.
- First victories award 20/35/50 coins, one unique emblem and one biscuit.
  Claims and inventory save atomically; repeated completion/rematches cannot
  duplicate rewards. Losses and practice battles give no NPC credit.
- Build key `bond-bolt-build-v2`, profile key `bond-bolt-profile-v2`. Legacy
  two-skill builds preserve the first two priorities and append a legal third.
  Legacy keepsake/scout progress migrates to clearing/Mira without repeat rewards.
  Old keys remain intact. Unknown/malformed data is normalized or safely reset;
  blocked storage permits session play and shows a notice. Confirmed adventure
  reset clears inventory/progress but preserves both team builds.
- Built-in imagegen generated six new monster sprites, three NPC sprites and
  four backgrounds. All thirteen are bundled unchanged in `assets/art-v8/`.
  Exact prompts and original/bundled paths: `assets/art-v8/prompts.json`.
  Read-only verification confirms nine genuine-alpha 1254×1254 RGBA sprites,
  four opaque 1536×1024 RGB scenes, and matching source/bundle SHA256 hashes.
  New PNGs total 26,024,735 bytes; no paid API/CLI fallback was used.

### Verification

- Chrome 152.0.7977.83 and Edge 152.0.4191.66 each passed **136 comprehensive
  browser checks + 139 combat checks**, followed by **14 focused browser checks**
  after the final notification polish: **150 browser checks per browser**.
- Engine tests retain isolated baseline mechanics and explicitly exercise all
  sixty skill effects, ten passives and save migration. Baseline fixtures disable
  passives to test original mechanics in isolation; passive tests and the complete
  1,000-build sweep enable real passives. Same results in both browsers:
  501 Grove wins, 485 Dusk wins, 14 draws; fights last 20.25–75 seconds.
- Default practice build: Grove wins in 38.15 seconds; HP [660,195,920,0,0,0].
  The default Druid/Emberfox/Stonehorn party beats Mira in 49.35s, Orin at the
  75s trainer-health tiebreak, and Vesper in 33.5s, without consumables.
- Actual mouse/keyboard/touch movement, normalized diagonals, safe bounds,
  canceled travel, nearby E, all five scenarios/treasures, NPC conversations,
  three full animated wins, pause/resume, one-time rewards, loss/retry, supply
  consumption, build/party changes, reload, reset, legacy/malformed/blocked saves,
  offline file mode, collection image decoding and 320–1440px layouts verified.
- No JavaScript/console errors, missing assets or external app requests in either
  comprehensive report. Focused post-polish checks also have no JavaScript errors.
- Visually inspected desktop party/collection/inventory, region and NPC dialog,
  plus mobile region/dialog/party/combat screenshots. Fixed cardinal keyboard
  movement, Escape focus handling, visited-order preservation on reload, mobile
  three-skill dock layout and stale notifications after resetting/arriving.
- Local preview `http://127.0.0.1:8765/` returned HTTP 200 with the expanded app.
  No permanent startup task, public hosting, or user-browser/profile mutation.

Reports: `tests/artifacts/chrome-v8-report.json`, `edge-v8-report.json`,
`chrome-v8-quick-report.json`, `edge-v8-quick-report.json`, `art-v8-report.json`.
Screenshots use `*-v8-*`; final mobile polish captures use `*-polished-390.png`.
Run `python tests/expansion_check.py [--browser edge]` for the full suite and
`python tests/quick_checks.py [--browser edge]` for final negative-path checks.
`tests/index.html` runs engine checks directly. Older browser/region commands
route to the current suite; their retained historical routines are not counted.

### Intentional limits / follow-up work

Nothing from the requested expansion remains unimplemented. This is still a
prototype, not release-balanced content. All creatures start available; no actual
capture/leveling. Materials/emblems are keepsakes and coins are progress markers,
not crafting/equipment/shop currency yet. Only biscuits are usable supplies.
Combat is not serialized across refresh. Saves are device/browser/origin-local.
Scenes have decorative edge scenery, not obstacle navigation or a seamless world.
Some defensive combinations reach the 75s limit; further balance/pacing playtests
are worthwhile. Sprites remain single-image characters with whole-body animation.
Delivery-size optimization of full-resolution PNGs remains a release-preparation
task; originals/alpha have deliberately not been destructively processed.

## Small region pass 07 — historical

User requested a very small walkable region, an item to collect, and an NPC/enemy
that starts battle when clicked. Implemented with one agent; reuses the existing
painted arena and illustrated roster. No image-generation or external asset calls,
new dependency, networking feature, or combat balance change.

- `region.js` / `region.css`: Mosslight Clearing, now the initial Explore tab.
  WASD/arrows or click/tap-to-move, normalized speed, bounded walkable ground,
  selected Grove trainer plus two following companions, one Mossbloom collectible,
  and a Dusk scout using the opposing trainer's artwork.
- Clicking an item/NPC approaches and automatically interacts within range.
  E or the nearby-interact button works when close. Escape, tab changes, window
  blur and page backgrounding cancel movement/queued interaction.
- Satchel stores one Mossbloom keepsake with no combat bonus. Pickup cannot repeat.
  An on-map pickup notification confirms collection without scrolling on phones.
  Item, challenge victory and bounded walking position save separately under
  `bond-bolt-region-v1`; blocked storage retains session-only play.
- Scout uses both current editable teams and skills. Returning to Explore pauses
  an unfinished encounter; clicking scout again resumes. Editing loadouts discards
  the paused encounter, not exploration progress. Wins clear the challenge but
  leave a sparring rematch. Loss/draw permits retry. Sandbox wins do not award
  scout progress. Explicit region reset requires confirmation and preserves builds.
- `app.js` integrates three tabs, encounter identity and return-to-clearing flow.
  `game.js` unchanged. Existing browser tests adapted to Explore as entry screen.
- New `tests/region_check.py` exercises actual keyboard/mouse/touch, saving,
  pickup, losses/wins, pause/resume and reset/offline/error recovery.

Verification complete:

- Chrome 152.0.7977.83: **48 exploration checks** passed, including actual
  keyboard/mouse/touch movement, normalization/bounds, approach-to-collect,
  pickup notification, save/reload, paused encounter resumption, full default
  loss and counter-build win, return/reset, no sandbox quest credit, canceled
  background movement, 320–1440px layouts, offline keyboard interaction and
  blocked/malformed storage recovery.
- Edge 152.0.4191.66: **47 exploration checks** passed. This run preceded the
  additional on-map pickup-notification assertion; that extra was checked in
  the final Chrome run. Edge includes the final keyboard E offline interaction.
- Full existing Chrome suite: **107 browser checks + 61 combat checks** passed,
  including 500 varied builds, 216 Grove variants, movement/targeting, saves,
  animations/health/audio, file mode, and all responsive combat layouts.
- No JavaScript/console errors, missing app assets, or external application
  requests in any final report. Tests used isolated browser profiles only.
- Visually inspected desktop, 390px and 320px exploration screenshots. Fixed a
  shared button :active transform which moved world click targets under pointer
  down; added map keyboard-focus styling and accurate interrupted-route messages.
- The local preview served the new region module with HTTP 200.
- Combat model hash is unchanged from pass 06:
  `04F70CF69AC508EB0A75D7025320C0796BE86CE339ABDBD0462FAB50B0416F1A`.

Reports: `tests/artifacts/chrome-region-report.json` (48),
`edge-region-report.json` (47), `chrome-report.json` (107 UI / 61 engine).
Screenshots: `chrome-region-desktop.png`, `chrome-region-390.png`,
`chrome-region-320.png` and Edge equivalents in `tests/artifacts/`.

No requested feature remains unfinished. This is deliberately one small clearing,
one collectible and one replayable NPC; no obstacle pathfinding, transitions to
other regions, consumable effects, XP, random encounters or new content system.
Physical phone and Safari/Firefox testing remain outside this pass.

Play: Ctrl+F5 at `http://127.0.0.1:8765/`, or open `index.html` directly.
Explore is the initial screen; Loadout and sandbox Battle remain available.

## Illustrated artwork + targeting/balance pass 06 — historical

User prioritized replacing rough images; animations are secondary. Used the
imagegen skill in built-in mode to generate six transparent character sprites and
one forest arena. No API/CLI fallback, no purchased assets, one agent. Shared
art module now renders local PNG images instead of the previous SVG cutouts.
All seven images are generated, visually reviewed and integrated. Exact prompts,
original output paths, bundle paths and verified SHA256 hashes are saved in
`assets/art-v6/prompts.json`. Source PNGs are unchanged; genuinely transparent
alpha was verified in browser canvas. Bundle is ~12.4 MB full-resolution PNGs.

The new `character-rig.js` retains its historical API but now emits `<img>`
sprites across loadout, combat, initiative portraits and the selected-unit dock.
Only subtle breathing is added within the sprite; existing whole-unit walking,
casting/hit reactions, impact-time health and canvas VFX remain. Do not claim
articulated limbs or bespoke frame animation for this single-image sprite pass.
Arena background now uses the painted raster, with smaller Bloomslime scale and
larger Stonehorn scale. The old forest SVG is preserved but no longer loaded.

Reproduced reported Emberfox behavior with Pounce + Wild Lunge: Pounce hit
Stormowl at 2.30s, navigation switched to Mage at 2.35s, Wild Lunge hit Mage at
4.85s. Cause: that equipped skill was explicitly kind=trainer, not a failure of
the nearest-monster selector. Wild Lunge now respects monster-first targeting
with extended reach 18 instead of ordinary melee 12. Same skill ID preserves
existing saved loadouts. Explicit Skyneedle and Crown Hex bypasses remain.

Compared Bloomslime at 690/570/530/500/480 HP. Selected 500 (down from 690),
leaving support skills unchanged. At 500 it heals 360 in the default battle but
falls at 26.05s; it no longer survives the default fight as a pseudo-tank.
With the lunge change, 112/216 Grove skill orders beat the default Dusk build;
500 varied builds give 268 Grove / 232 Dusk wins, zero draws. These are narrow
prototype regression samples, not proof of overall competitive balance.

Initial checks: 61 engine regressions, including all six Fox skill orders and
the exact Pounce-to-Wild-Lunge report; 41 focused Chrome graphics checks. Desktop,
390px and 320px combat plus desktop loadout screenshots inspected. A narrow
header text-clipping issue was also fixed. Full Chrome rerun is in progress;
the first full run exposed an old test's invalid menu-click sequence for the new
winning counter, not a gameplay failure. The test now correctly promotes a newly
added first-priority skill before adding the second one. Saved-skill compatibility
and the two-hit Fox regression have passed through browser playback.

Final verification completed:

- Full Chrome 152.0.7977.83: **106 browser checks + 61 combat checks** passed,
  including the 500-build invariant sweep, saved Wild Lunge behavior, full
  playthroughs/rematches, counter-build playback, offline file play, storage
  failure recovery, responsive layouts, and image loading/real alpha checks.
- Focused Edge 152.0.4191.66: **42 graphics checks** passed. Includes the final
  narrow-header clipping regression added after the Chrome full run started.
- No JavaScript/console errors, missing app assets or external application
  requests in either final run. All seven bundled image hashes match the
  generated originals. Local preview's new arena image returned HTTP 200.
- Final desktop, 390px and 320px captures visually reviewed, including the
  restored single-line narrow header and the actual Fox two-hit sequence.
- Canonical reports: `tests/artifacts/chrome-report.json` (106 UI / 61 engine),
  `edge-graphics-report.json` (42 graphics), `balance-v6.json` (five HP options
  and reproducible old/new Fox trace). The 41-check Chrome standalone graphics
  report is earlier; the extra narrow-header check was verified in final Edge.
- Screenshot of the specific fix: `tests/artifacts/chrome-fox-targeting.png`.
  General art: `chrome-graphics-desktop.png`, `chrome-graphics-mobile.png`,
  `edge-movement-320.png`, `chrome-loadout-desktop.png` in the same folder.
- Current engine SHA256:
  `04F70CF69AC508EB0A75D7025320C0796BE86CE339ABDBD0462FAB50B0416F1A`.

No requested work remains unverified. Animation remains intentionally secondary:
future work includes bespoke attack/idle frame sets, smaller web-delivery image
exports and physical-device/Safari/Firefox checks. No public deployment,
purchases, external API fallback, new app dependency or additional agent.
Seven built-in image-generation calls were used. User's saved builds were not
reset; test storage lived in isolated temporary browser contexts only.

Play: refresh `http://127.0.0.1:8765/` with Ctrl+F5, or open `index.html`.
New asset set and exact prompts: `assets/art-v6/prompts.json`.

## Articulated animation pass 05 — historical

User asked for combat animation approaching Sword x Staff quality. This pass
substantially improves the existing original 2D presentation; do not claim full
commercial-quality parity. Reviewed the official site/store description and
visually inspected a public combat screenshot. Reference file is temporary only
(`%TEMP%/bond-bolt-sxs-reference.jpg`), not shipped. No paid assets, packages,
image-generation calls, external application requests, or extra agents.

- `character-rig.js`: original shaded SVG cutouts for all six characters. Cached
  part rigs independently animate legs/arms, head/eyes, tails/ears, wings, staff,
  cape, horns, and flower. Poses cover idle, walk, anticipation, attacks/casts,
  hit reactions, defeat, and victory; all use presentation time and freeze on
  pause. Existing roster identity retained; loadouts and portrait rail share art.
- `combat-vfx.js`: eight element palettes and eleven effect families, including
  sigils, ice shards, lightning, fire slashes, stone shockwaves/cracks, healing
  motes, Bramble vines, wards, dust, and defeat particles. Bounded active effects.
- `combat-view.js`: contact-based animation timelines, short visual contact
  holds, anticipation before ready actions, articulated posing, subtle heavy-hit
  camera shake, and Quiet FX. Names/HP are drawn last above every sprite/effect;
  retained DOM health elements provide accessible progress values. Mobile numeric
  HP is selected-unit only; full values remain in the dock/trainer HUD.
- Visible/accessibility HP uses queued, versioned health snapshots at the visual
  impact. Optional sound follows the same impact timeline. The model/journal/
  cooldowns/statuses/result logic remain immediate. This is visual choreography,
  not interruptible casts, attack hitboxes, or dodgeable projectiles.
- `app.js`: shared rig artwork, themed synthesized impact sounds, audio pause,
  and removal of old immediate event beeps. No audio files or external services.
- `index.html` / `combat.css`: layered combat world, readable floating bars,
  independent HUD, Quiet FX button, and fully code-driven character animation.
- `tests/browser_check.py`: tests for rig articulation/freeze, gradient IDs,
  contact-time HP/audio, final HP convergence, victory/defeat poses, Quiet FX,
  reduced motion, model immutability, and every effect-family/palette combination.

`game.js` is byte-for-byte unchanged from pass 04; SHA-256:
`5F0E2109FFA11CBE268D376D5CF5946990EBF12721491290E4FE70B10DCDD53A`.
Default Dusk win 43.75s, documented Grove counter 58.35s, and the 500-build
regression outcomes therefore remain unchanged. Engine checks still pass (57).
Final full Chrome run passed **98 browser checks + 57 combat checks**, including
the 500-build sweep, offline/file play, saves/recovery, rematches, winning counter,
320–1440px layouts, and all new animation checks. Every combination of eleven
effect families and eight palettes rendered (88 combinations). No JavaScript or
console errors, missing assets, or external application requests. Final desktop,
390px, and 320px screenshots were visually inspected. Edge passed **37 focused
graphics checks**, also with no errors/missing assets/external app requests.
Canonical reports: `tests/artifacts/chrome-report.json` (98 UI / 57 engine) and
`edge-graphics-report.json` (37 graphics). The earlier 36-check standalone Chrome
graphics report is intermediate; the final full report includes the effect-matrix
test. Screenshots: `*-graphics-desktop.png`, `*-graphics-mobile.png`,
`*-movement-mobile.png`, `*-movement-320.png`, plus full UI result/loadout captures.

The local preview returned HTTP 200 with both new animation modules referenced.
Open http://127.0.0.1:8765/ and refresh (Ctrl+F5 if showing cached artwork).
No public deployment. All changes are inside `monster-browser-prototype`; the
public reference image alone was downloaded to the temporary directory.

Remaining quality gap: production art direction, more expressive bespoke motion,
finer animation transitions, audio mixing/listening, and real-device performance/
readability testing. This pass does not claim production-equivalent animation or
screen-reader/physical-phone certification. No new gameplay systems added.

## Movement and range pass 04 — historical

User approved building the next milestone: real movement, attack ranges, walking
animation, and a tank-protection versus trainer-strike balance check. No new
dependencies, purchased assets, classes, monsters, or online features.

- `game.js`: positions now advance on the deterministic 50ms tick. Simultaneous
  steering and symmetric soft separation keep units from stacking in the open
  clearing. No terrain/pathfinding grid or manual formation editor.
- Melee reach: 12 units; Bloomslime: 27; Druid/Mage/Stormowl: 34. Base movement:
  Emberfox 12 units/s, Stonehorn 4.8, trainers 8, Stormowl 8.8, Bloomslime 6.4.
  Units stop within reach, with brief post-action recovery. No retreat/kiting AI.
- Slow and haste affect walking and action progress immediately; real-time
  cooldowns are unchanged. Ready offensive skills wait for their actual target
  to enter range without consuming cooldown or accumulating extra attacks.
- Normal monster focus remains the nearest living opposing monster. Explicit
  trainer skills can pursue trainers; Wild Lunge must reach melee range,
  Skyneedle has range 46, Crown Hex uses Mage range. Arc Nova and Chain Spark
  now only damage enemies within caster range. Support spells and Bondguard
  deliberately remain whole-team/whole-arena magic, not proximity mechanics.
- `combat-view.js`: interpolated model positions, walking/bobbing, facing, short
  melee jabs instead of cosmetic arena-crossing lunges, reach ellipses, movement
  state/speed/range in the dock, and NEED RANGE skill labels. Real movement
  remains visible under reduced motion; decorative motion is suppressed.
- Clickable action-rail portraits give a reliable alternative to selecting
  overlapping combatants. Small nameplate offsets separate health numbers on
  narrow screens. Fallen, unselected units have reduced label clutter.
- `app.js` / `index.html` / `README.md`: base movement stats, current rules, and
  an updated reproducible Grove counter. Saved-loadout format is unchanged.

Engine verification: **57 passing checks**, including 13 new movement/range
checks and 500 varied builds. Direct attack events include distance and reach,
allowing the sweep to audit every normal attack and offensive spell. Existing
trainer-first exceptions, Guard, burn/cleanse, overtime, and determinism still pass.
The final Chrome run passed **83 browser checks + 57 engine checks**, including
real animation playback, the winning skill-only counter, offline file mode,
storage recovery, reduced motion, 320–1440px layouts, and deterministic rematches.
No JavaScript/console errors, missing assets, or external application requests.
Desktop and mobile screenshots were inspected, including the health-label fix.
Edge passed **22 focused graphics checks**, with the same clean error/asset/
network checks. Canonical final evidence: `tests/artifacts/chrome-report.json`
(83 UI / 57 engine), `chrome-engine-report.json` (57 engine), and
`edge-graphics-report.json` (22 graphics), plus `*-movement-mobile.png`,
`*-movement-320.png`, and the desktop/mobile graphics screenshots. The standalone
`chrome-graphics-report.json` is the earlier 21-check intermediate run; the final
Chrome report includes the updated 22-check graphics suite.

Balance observations: default Dusk wins at **43.75s**, final HP
`[0, 0, 0, 720, 236, 243]`. Grove Druid `[mend, bramble]`, Emberfox
`[burn, pounce]`, Stonehorn `[slam, guard]` wins at **58.35s**, Druid 771 HP.
27/216 Grove skill-order variants beat default Dusk; the 500 varied builds give
260 Grove / 240 Dusk wins, zero draws, durations 23.2–75s. No damage/HP buffs
were needed for this pass; range/pursuit already create meaningful tradeoffs.
These are regression samples, not a competitive-balance claim.

The local preview at http://127.0.0.1:8765/ returned HTTP 200 and served the
movement-enabled game.js. Refresh to load the changes. No public deployment.
Historical token accounting below belongs to the earlier completed budgeted
task, not this new request; no new goal or token budget was created.

No required work remains for this milestone. Deferred: obstacle-aware pathfinding,
manual formations, retreat/kiting AI, Druid fusion, and a production sprite/rig
animation pipeline. Mobile was checked with browser viewport emulation, not
physical phone hardware. Crowded spell effects still warrant human playtesting.

## Targeting and animation pass 03 — historical

User request: monsters switch to the closest surviving enemy monster before
targeting a trainer; only explicit abilities bypass this. Improve animation.
One agent used, with no new dependencies or paid assets.

- `game.js`: monsters choose the nearest living enemy monster using squared
  distance between fixed formation coordinates. Equal distances use slot order.
  Trainer fallback only occurs after both enemy monsters fall. Normal damaging
  skills share this rule; trainer AI still prioritizes lowest-HP-percentage monsters.
- Monster deaths immediately refresh normal targets and emit a readable retarget
  event. Changing focus does not reset an action meter or grant an extra attack.
- Skyneedle, Wild Lunge, and Crown Hex explicitly bypass monsters. Arc Nova still
  explicitly hits the full enemy team. Guard interception and trainer-death victory
  remain intact. No new passives were added. The user can still lose their Druid
  to Skyneedle while another Grove monster survives; this is an allowed exception.
- `combat-view.js`: separate quick-pounce and heavy windup/charge/contact/recovery
  profiles, casting poses, and interpolation between fixed simulation ticks.
  Fighters, ground rings, and health bars move together; effects follow their
  displayed positions. Pausing freezes both the model and presentation.
- Added normal-target text/ground marker, temporary retarget trails, and a
  TRAINER STRIKE cue for explicit bypass skills. Cast event metadata keeps long
  journal explanations out of the floating skill labels.
- `index.html` and `README.md` now explain monster-first targeting and exceptions.
  Animations remain cosmetic: no pathfinding, actual movement, or range gating.

Pass 03 complete: **74 browser checks + 44 engine checks passed in Chrome**,
including 500 varied builds checked for illegal normal trainer hits while monsters
survive. **15 focused graphics checks passed in both Chrome and Edge**, including
an actual UI retarget from Stonehorn to Stormowl after Bloomslime is defeated in
a controlled test fixture. No JavaScript/console errors, missing assets, or
external application requests. Desktop/mobile screenshots inspected; layouts
and controls verified from 320 to 1440px. The localhost preview returned HTTP 200.

Current balance samples: default Dusk still wins at 36.65s; the README Grove
counter still wins at 58.2s. 29 of 216 Grove skill-order variants beat default
Dusk. The 500 varied simulations lasted 22.2–75s (218 Grove wins, 282 Dusk wins).
These are deterministic regression samples, not competitive-balance claims.

Evidence in `tests/artifacts/`: `chrome-report.json` (74 UI / 44 engine checks),
`chrome-engine-report.json`, `chrome-graphics-report.json`,
`edge-graphics-report.json`, and `*-retarget-mobile.png` / `*-graphics-*.png`.
Older sections below describe previous verification runs.

Recommended next milestone: actual movement plus attack ranges and walking states,
followed by playtesting/balance of tank protection versus trainer-bypass skills.

## Graphics pass 02 — historical Sword x Staff-inspired presentation

Requested after the initial verified prototype. One agent; no new packages or paid assets.

- Inspected a public Sword x Staff combat screenshot and its official site. References are linked in `README.md`. The reference image was kept in the temporary directory only; no third-party game art is shipped.
- Added `forest-arena.svg`: original tiled forest clearing, stone ring/ruins, trees, foliage, and atmospheric depth.
- Added `combat.css`: opposing formations, ground shadows/team rings, compact battle header, trainer health bars, estimated next-action portraits, and a selected-unit skill dock. Loadout styling is retained.
- Added `combat-view.js`: canvas spell travel, lightning, melee lunges, hit reactions, heal/guard rings, readable numeric popups, cast labels, and ambient particles. Effects freeze on pause, resize while paused, clean themselves up after battle, and honor reduced motion. Settled result screens stop repainting.
- Fighters are selectable by click or Enter/Space to inspect skills and action progress. The combat tab hides the large introductory banner to give the battlefield more room.
- `game.js` is unchanged. Default Dusk victory remains 36.65s; the documented Grove counter remains 58.2s. The original 35 engine checks and 500-build sweep still pass.
- These are cosmetic lunges, not movement/pathfinding mechanics. Character SVG designs are retained; this is a lightweight 2D interpretation, not a production-quality recreation of the reference game's sprites or animation pipeline.

Graphics pass complete: **66 browser checks + 35 combat checks passed in Chrome**. The focused **8 graphics checks also passed in Chrome and Edge**. Zero JavaScript/console errors, missing assets, or external application requests were reported. Desktop/mobile screenshots were visually inspected; layouts and controls were checked at 320–1440px.

New evidence: `tests/artifacts/chrome-graphics-report.json`, `edge-graphics-report.json`, and matching `*-graphics-desktop.png` / `*-graphics-mobile.png`. `chrome-report.json` records the successful final 66-check run. The earlier Edge full-run report below belongs to the original prototype verification.

The test harness was also corrected: pausing its virtual clock at the exact installation instant could race wall time under load, and the first lunge assertion originally sampled before Frostbolt's slow allowed Emberfox to act. Neither issue required changing the simulator.

Useful focused command: `python tests/browser_check.py --graphics-only` (add `--browser edge` for Edge).

## Open locally

Open `index.html` in Chrome or Edge. All application code, styling, and character SVGs are local; no build or package installation is required. Local save availability depends on browser settings.

For a localhost preview, run from this folder:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765/ . This is a local server, not a public deployment. A preview was started at this address and returned HTTP 200 at handoff; it lasts only while that local process runs. Test servers close automatically after each run. Only this preview remains running.

`README.md` contains controls, rules, test commands, and a verified winning counter-build.

## Original prototype handoff — historical

Everything below is the original saved handoff and token audit. Its fixed-lane
mechanics, deferred-movement notes, timings, and test counts have been superseded
by pass 04 above; they are retained only as project history.

### Files written

- `index.html`: Loadout and Battle tabs, six unit slots, arena, controls, journal, and results containers.
- `game.js`: deterministic fixed-step combat, two classes (Druid/Mage), four monsters (Emberfox/Stonehorn/Stormowl/Bloomslime), three skills per unit with two equipped, lane targeting, healing, shields, slow, haste, burn, cleanse, guard interception, trainer-defeat victory, overtime, and timeout.
- `app.js`: editable teams, skill priorities, local saves, original vector character illustrations, battle animation, pause/restart/speed controls, optional synthesized sound, journal, and results table.
- `style.css`: responsive parchment/green visual theme, arena styling, animation and reduced-motion handling.
- `tests/engine-tests.js` and `tests/index.html`: dependency-free simulator regression suite and manual test page.
- `tests/browser_check.py`: real browser interaction tests using installed Chrome/Edge and development-only Playwright.
- `tests/artifacts/`: JSON test reports and desktop/mobile screenshots.
- `README.md`: player and developer documentation.

Default teams: Druid + Emberfox + Stonehorn versus Mage + Stormowl + Bloomslime. Both teams can be edited. Selecting an already selected monster within a team swaps the two slots. Physical movement and Druid fusion are intentionally deferred.

## Fixes in this continuation

- Replaced scheduled action deadlines with continuously advancing action meters. Slow and haste now affect pending actions on the next 50ms tick and stop affecting progress when expired or cleansed. Cooldowns remain real battle time.
- Expired shields can no longer absorb hits because of unit processing order. Timed effects resolve before actions; meter overshoot is retained to avoid accumulated timing drift.
- The main action becomes **Play again** after a result instead of a disabled **Resume**. Restart, result clearing, and deterministic rematches were verified.
- Trainer/monster dropdown edits preserve keyboard focus.
- Removed the empty stylesheet import, added a self-contained favicon, and clarified useful-skill selection and healing thresholds in the field guide.
- Added reproducible browser/engine tests, screenshots, and player/developer docs.

## Verification evidence

Installed Chrome **152.0.7977.83** and Edge **152.0.4191.66**, Windows, headless.

- **50 browser checks passed in each browser**, using real DOM interactions and requestAnimationFrame playback driven by the browser test clock, not just a simulator result.
- Full UI suites each included the original **31 passing combat checks**. Four additional status-expiry/instant-victory regressions were then added; the final **35-check engine suite passed in both Chrome and Edge**. Separate engine reports record the expanded suite.
- **500 varied valid builds** completed in 20.4–75 battle seconds with finite, bounded health, exactly one final result, and no healing after overcharge.
- **216 Grove skill-order variants** were checked against default Dusk; 28 won. This is a scoped counter-build check, not a general competitive balance study.
- Complete browser playthroughs verified default Dusk victory at **36.65s** and a skill-only Grove counter victory at **58.2s**. Same-build rematches reproduce winner and duration.
- Tested skill replacement/priority, class selection, duplicate-monster swapping, keyboard tabs, focus, local saves/reload/reset, malformed saves, blocked storage, pause/resume, 1x/2x, Loadout auto-pause, restart, results, and six-unit statistics.
- Tested **320, 375, 390, 768, 1024, and 1440px** viewports without document overflow. The result table scrolls within its container on narrow screens.
- Zero JavaScript/console errors, missing assets, or external application requests in either full browser suite. File mode completed combat and saved loadouts.
- Visually inspected desktop loadout/battle/results and mobile battle/results.

Reports: `tests/artifacts/chrome-report.json`, `edge-report.json`, `chrome-engine-report.json`, and `edge-engine-report.json`. Matching PNG screenshots are in the same directory.

```powershell
python tests/browser_check.py
python tests/browser_check.py --browser edge
python tests/browser_check.py --engine-only
```

The agent installed Playwright and dependencies into `%TEMP%/bond-bolt-test-tools`, not the application or global Python environment. No browser download or paid service was used. Players need none of these test dependencies. The manual `tests/index.html` page also needs no installation.

## Known limitations / intentionally unfinished

- No physical movement, pathfinding, movement-speed gameplay, or Druid fusion. Slow/haste currently change action cadence only.
- No capture/taming loop, progression, campaign, multiplayer, accounts, cosmetics, store, purchases, marketing integration, or public hosting.
- The default matchup favors Dusk. Commercial balance and longer-term replayability have not been established.
- Chrome and Edge are both Chromium browsers. No Safari, Firefox, physical-phone, screen-reader, or production performance certification was performed.
- Optional synthesized sound exists but subjective audio quality was not assessed.
- Browser storage availability varies. Denial is handled with session-only edits; battles are not persisted. File mode and localhost saves are separate.
- The working title is not trademark-cleared. Functional testing does not establish commercial readiness or likelihood of success.

No known blocking defect remains within the requested two-tab combat prototype.

## Budget audit — original prototype continuation

The continuation received a fresh **5,000,000-token** goal allocation. Pre-handoff tracker checkpoint: **100,496 tokens used**, **4,899,504 remaining**, with one agent. The final completion reading is reported in the chat; this checkpoint excludes final documentation/test/reporting calls. This is task tracker usage, not a measurement of the user's weekly account allowance.

Historical note: the previous handoff recorded **30,810 tokens against a 20,000 budget** and stopped without verification. That earlier overrun is not being relabelled as part of this fresh allocation. Current work stopped on verified completion, far below its newly authorized budget.

All source/test/documentation changes are confined to `monster-browser-prototype`. Unrelated business/workspace files were left untouched. No public deployment, external messages, purchases, or advertising spend occurred.
