# Patch 20 — level boundary, Sheet roster and open boss roads

Implementation date: 2026-09-13. Local browser validation only; commercial art,
balance, multiplayer and release acceptance remain open.

## Delivered contract

- Player trainers, owned companions, active XP, attribute budgets and trees have
  a hard launch cap of Lv60. The XP/encounter engine remains valid through Lv100.
- A Lv61–100 Soul Echo summons a Lv60 individual and retains its original
  `sourceLevel`. Legacy excess active XP becomes inactive `deferredXP`; it is not
  discarded and does not grant power before a visible future cap patch.
- The reviewed [Bond & Bolt Sheet](https://docs.google.com/spreadsheets/d/16cPx2V69RCrvfmTmqYtP1zUBezq9zvl_UUiVE7Osqho/edit?gid=765633262#gid=765633262)
  is the source of truth for creature identity, design role, combat identity,
  element, region, source level, encounter source, rarity and attack basis.
  Runtime uses a versioned local snapshot so play never depends on a live fetch.
  Reviewed source: revision262, `Roster!A1:S101`, 100 rows, fingerprint
  `e5a3ac70`. The empty `mon-skills` tab leaves existing kits/stats in place.
- Firstlight keeps its explicit opening override: Brimble Lv2, Bloomslime Lv3
  and Rattlebit Lv5, with the existing 48/32/16 population.
- The world contains 24 large hunting maps, six hubs and six compact boss
  domains. Every cave leads to its region's reward-free boss practice. Roads are
  open; green/yellow/red atlas states communicate danger rather than access.
- Patch 20 notes are visible from the top bar and state the cap, high-level Echo,
  open-road and boss-domain changes.

## Automated evidence

`python tests/pass18_check.py` passes **2,088 / 2,088** assertions in a fresh
Chrome context. It covers the 60/100 boundary, over-cap migration, high-source
summoning, all 100 Sheet-backed stable IDs, 94 habitats, six boss assignments,
36-place connectivity, open dangerous routes, combat/save/reward regressions and
runtime asset errors. The generated creature reference check confirms 100 unique
species, 94 wild sources and six boss sources agree with the browser export.

`python scripts/project.py verify --browser chrome` also passes the complete
current matrix: 34 UI,33 campaign,100 fresh-opening,315 supplied-sprite,37
experience and1,005 browser/Node parity checks plus onboarding, field-polish,
architecture, documentation, asset and immutable-package gates. The campaign
gate confirms both current classes can complete all60 trainer lessons and the
48-step story with ordinary starter companions at the launch cap.

This does not prove fun, final balance, final artwork, multiplayer authority or
production device/server readiness.

## Owner walkthrough

1. Open **Patch 20 notes** on desktop and a narrow browser window. Confirm the
   button is visible, the wording is clear and the dialog closes normally.
2. In `?test=1`, grant a Lv100 Echo and summon it. Confirm the resulting companion
   displays Lv60 and can be selected without altering the normal save.
3. Open **World Atlas**. Select green, yellow and red destinations and confirm all
   offer **Walk here**. Physically follow one cross-region shortcut.
4. Enter one cave and use its boss gate. Confirm the compact domain contains the
   correct regional boss altar, selectable Lv1–100 practice difficulty, and no
   ordinary wild population or reward promise.
5. Review several Sheet-moved creatures in the collection and their world region.
   Confirm the visible role/property and basic attack basis match the Sheet while
   the three existing skills still work.

Record Approve/Revise separately for the cap messaging, atlas/boss-domain UX and
Sheet-driven creature placement. Passing automation does not mark those owner
reviews accepted.
