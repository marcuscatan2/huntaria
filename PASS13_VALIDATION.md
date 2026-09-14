# Pass 13 — owner validation

2026-09-11. One agent. **Playable local implementation, not completion of all
sixteen commercial contracts.** Their server/group criteria and commercial
content acceptance remain unfinished. No deployment, purchases, or personal
browser save resets were performed.

## What you should validate

Use [the isolated test adventure](http://127.0.0.1:8765/?test=1), with the local
server running as described in [README.md](README.md). It has a separate save.
Expand the yellow QA panel for controlled rare items; do not grind for a
0.01% drop to test an interface.

1. **First hunt:** begin with empty companion slots, approach an Emberfox and
   start a hunt. Try Druid, then Mage. Both should win without supplies. Try
   pause/resume and 2×; judge whether targeting, hits and results are readable.
   Trainer death must end a solo attempt immediately.
2. **Echo versus summon:** starter drops are 10%, with no guaranteed first drop.
   To test reliably, grant a level-1 test Echo. Inventory → Echoes shows species,
   source, level and 100% summoning. Cancel once: keep the item. Confirm: exactly
   one Echo disappears and one companion joins the Inner Sea. Choose a party
   slot separately; summoning does not silently equip it.
3. **Party/formation:** equip one, then two different species; empty a slot.
   Reorder three skills, including swapping an already-equipped skill. Swap
   front/middle/back, including empty positions. Refresh: the party, priorities
   and formation should remain as you left them.
4. **Attributes/trees:** try the six attributes and free resets. Compare previews
   to battle behavior. Check both class trees and a damage/tank/support species.
   Are prerequisites, rank caps, available points and Leadership understandable?
5. **Inventory:** prepare a biscuit. Preview keeps it, starting consumes one,
   resuming consumes no more. Buy supplies with earned coins, feed a companion,
   inspect duplicates and empty filters. No real-money gameplay purchases exist.
6. **World feel:** walk horizontally and vertically; camera follows, solid
   trees/rocks block you, the minimap walks instead of teleporting. Enter town
   cave/forest gates. Refresh after movement and kills; position and accepted
   rewards stay. Do maps feel explorable, or too empty/repetitive?
7. **Roster/late regions:** grant and summon a level-100 test Echo to unlock the
   atlas. Browse all five collection pages, try new species and a reward-free
   boss altar at levels 1 and 100. Judge silhouettes, visual consistency and kit
   identity—not just whether there are 100 names.
8. **Your device:** repeat important screens on your actual browser/phone with
   touch/keyboard where applicable. Emulated 390px tests do not certify real
   hardware performance, accessibility or animation quality.

Report **pass / needs changes / bug**, with map/species/class, party and skills,
steps, expected versus actual, and a screenshot/video for visual issues.

## First sixteen feature status

“Local” means implemented and covered by local automated evidence, not owner
or commercial acceptance. Full acceptance checkboxes remain unchanged.

| Feature | Available now | Unfinished / what needs validation |
| --- | --- | --- |
| F-001 categories | Melee/STR, ranged/DEX, magic/INT per basic/skill; mixed kits, labels, independent numeric fixtures | Approve coefficients and clarity |
| F-002 Speed/dodge/regen | All-action Speed/seconds, DEX cooldown/accuracy, seeded physical dodge, fractional VIT regen | Feel, tuning and actual-device animation |
| F-003 attributes | Costs/caps/budget, highest-owned trainer, sharing once, preview/reset | Group-ready locks and server validation |
| F-004 combat | Zero–two companions, trainer defeat, targeting, wild identity, obstacles; 13-actor group simulation | Real synchronized timeline, multiplayer elimination/reconnect |
| F-005 loadout | Five choices/three priorities, empty slots, swaps, six formations, persistence | Online ready/unready and post-pull locks |
| F-006 roster | 100 test-playable species, 510 assignments, 100 innates, 1,836 nodes; all exercised | Prototype art/kit distinctness NOT accepted; six boss acquisition sources pending |
| F-007 statuses | Sixteen element pairs, Slow/Haste/Burn, shields, guard, healing/Overcharge | Broader balance/exploit review |
| F-008 results | Solo controls, inspection, loss advice, kill/Echo feedback, failed-save retry | Server confirmation, group timeline/reconnect |
| F-009 levels | Cap100, per-kill companion XP, highest-owned trainer, no phantom solo XP, XP food | Timed early/mid/late campaign study with ordinary teams |
| F-010 trees | Eighteen role-usable ranked nodes per type, prerequisites/budget/reset, suggested paths | Competitive path viability and full-roster balance |
| F-011 economy | Earned coins/supplies, exact 10%/0.01% Echo tables, per-life local receipts, zero-supply recovery | Authoritative/group rewards, cross-device recovery, broader item loot tables |
| F-012 inventory | Echo provenance/counts, separate guaranteed summon, cancel/error/retry, prepared items | Cross-client atomicity, real boss receipts, production commerce states |
| F-013 collection | 100 entries, 94 fixed habitat sources, one companion/species, duplicate storage | Six cooperative sources, server ownership and multi-account tests |
| F-014 summoning | No catch toggle/paper/second roll; local idempotent inventory-to-ownership commit | Secure per-death RNG, concurrent transactions, boss-victory claims |
| F-015 tutorial | Both classes soloable, four starters, honest rarity and saved milestones | Outside-player comprehension/unlucky-streak study |
| F-016 world | 24 large 2D maps + six hubs; gates/camera/collision/followers; saved position/spawns | Density/layout quality, all-route actual-device timing, authoritative lifecycle |

See [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md) for all commercial contracts.
No commercial checkbox is accepted by this pass.

## Evidence

Final frozen build: **2,083/2,083 checks in Chrome and 2,083/2,083 in Edge**,
zero JavaScript errors/missing assets. Both reports have matching source hashes.
Planning integrity: 30/30. These are technical checks, not commercial acceptance.

Run from the project folder:

```powershell
python tests/pass13_check.py
python tests/pass13_check.py --browser edge
python tests/scope_docs_check.py
```

- Independent mechanics/content fixtures plus 1,000 reproducible generated fights.
- All 100 species full-battle tested, test-summoned, equipped and shown in
  collection; all 510 assignments invoked and 102 trees checked for valid ranks,
  prerequisites and role applicability. Execution coverage is not proof of
  distinct competitive identity.
- Exact 10,000-outcome probability enumeration; not a lucky sample estimate.
- Fresh saves, deliberate storage failure, idempotent summon, preserved migration
  input, partial parties, both trainer starts, playback/pause, mobile layouts,
  missing-asset and JavaScript-error monitoring.
- Every map's shortest central axes checked for collision/distance at 210 world
  units/s. Representative horizontal and vertical walks additionally run through
  browser movement/camera. The remaining directed paths have geometry evidence,
  not timed physical-device play sessions.
- Reports, per-species suggested paths and screenshots:
  tests/artifacts/pass13-*.json/png. Final counts appear in PROGRESS.md.
- Planning lint checks document integrity only. Earlier ten-species capture
  suites remain historical and cannot validate the new rules.

## Known boundaries

Local saves are editable; a local receipt is not security. No accounts, online
server, lobby, synchronized group play or cross-device atomic transactions.

Boss altars share a preview mechanic with different kits/portraits. They grant
no coins, XP or essence. Test Echo grants exercise companion forms only; real
boss essences remain planned at 0.01% per eligible group victory, with no global
copy cap.

Maps are structurally large but reuse terrain/layout motifs. Density, authored
encounter progression and polish require another pass. Ninety new species use
prototype SVG portraits, shared anatomy families and reused effect code. These
are not yet a unified commercial art direction with the older painted sprites.

Inner Sea is a collection screen, not a customizable walkable home. Account
mastery and evolution remain stashed. Import UI, cloud backup, cosmetics,
payments, anti-cheat, hardware certification and public release are outside this
pass. Keep the local server running; localhost is not public hosting.
