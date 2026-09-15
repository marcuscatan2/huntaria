# Commercial scope v2 — Traceability

> Current prototype override — Patch20 (2026-09-13): all configured Echo chances
> are **15% for testing**, with faster wild levels/XP and persistent injuries.
> The visual World Atlas, direct information signs, physical Supply Store and
> free village recovery, the player cap60/engine curve100 boundary, open roads,
> six boss domains and Sheet-backed creature placement are implemented locally.
> See [current playtest walkthrough](<features/opening/VALIDATION.md>).
> The10% /0.01% figures elsewhere remain **release proposals**, not live test odds.
> This does not accept any commercial criterion or implement online boss loot.


Updated 2026-09-13. Commercial traceability, with zero accepted commercial criteria. F-001–F-016 now have a local implementation pass; see [current playtest walkthrough](<features/opening/VALIDATION.md>). Sources: [active scope](<Commercial MVP scope.md>), [feature cards](FEATURE_BACKLOG.md) and [validation](VALIDATION_PLAN.md). Git history retains superseded plans and their evidence context.

Coverage: **66 features, 64 P0 + two P1, 264 criteria; 28 source items; 18 scope sections; 15 protocols; eight design locks; six release gates.** F-001–F-057 keep their IDs but v2 semantics replace conflicting v1 requirements. New F-058–F-066 address the expanded world, rates, groups, ultra-rare reward economy, roster production, abuse and rebaseline.

The local world includes authored layouts, illustrated scenery, physical itinerary
walking, cave/bridge navigation and persistent landmark discovery. See
[world implementation](<WORLD_IMPLEMENTATION.md>). This extends local evidence
for F-016/F-017/F-018/F-027/F-058; it does not accept their commercial criteria,
complete online groups, or approve all 100 creature art packages.

## 1. Source delivery item → feature cards

Local campaign and presentation work covers parts of F-017–F-026. See
[campaign contract](<features/campaign/README.md>) for campaign, trainers, packs,
recovery, practice bosses, personal challenges and presentation evidence.
The real group/realm and production-art requirements remain open; zero
commercial acceptance boxes have been checked.

| Source | Active v2 requirement | Features |
| --- | --- | --- |
| MVP-01 | Correct six attributes | [F-001](FEATURE_BACKLOG.md#f-001), [F-002](FEATURE_BACKLOG.md#f-002), [F-003](FEATURE_BACKLOG.md#f-003), [F-004](FEATURE_BACKLOG.md#f-004), [F-007](FEATURE_BACKLOG.md#f-007) |
| MVP-02 | Spatial world entrances | [F-016](FEATURE_BACKLOG.md#f-016), [F-017](FEATURE_BACKLOG.md#f-017), [F-018](FEATURE_BACKLOG.md#f-018), [F-027](FEATURE_BACKLOG.md#f-027) |
| MVP-03 | Reference combat and visual bible | [F-004](FEATURE_BACKLOG.md#f-004), [F-008](FEATURE_BACKLOG.md#f-008), [F-024](FEATURE_BACKLOG.md#f-024), [F-026](FEATURE_BACKLOG.md#f-026), [F-051](FEATURE_BACKLOG.md#f-051) |
| MVP-04 | 100-species presentation | [F-006](FEATURE_BACKLOG.md#f-006), [F-025](FEATURE_BACKLOG.md#f-025), [F-026](FEATURE_BACKLOG.md#f-026), [F-027](FEATURE_BACKLOG.md#f-027), [F-028](FEATURE_BACKLOG.md#f-028), [F-064](FEATURE_BACKLOG.md#f-064) |
| MVP-05 | Six-region adventure | [F-005](FEATURE_BACKLOG.md#f-005), [F-006](FEATURE_BACKLOG.md#f-006), [F-016](FEATURE_BACKLOG.md#f-016), [F-018](FEATURE_BACKLOG.md#f-018), [F-019](FEATURE_BACKLOG.md#f-019), [F-020](FEATURE_BACKLOG.md#f-020), [F-021](FEATURE_BACKLOG.md#f-021), [F-022](FEATURE_BACKLOG.md#f-022), [F-023](FEATURE_BACKLOG.md#f-023), [F-027](FEATURE_BACKLOG.md#f-027) |
| MVP-06 | Early-to-late progression | [F-003](FEATURE_BACKLOG.md#f-003), [F-006](FEATURE_BACKLOG.md#f-006), [F-007](FEATURE_BACKLOG.md#f-007), [F-009](FEATURE_BACKLOG.md#f-009), [F-010](FEATURE_BACKLOG.md#f-010), [F-011](FEATURE_BACKLOG.md#f-011), [F-013](FEATURE_BACKLOG.md#f-013), [F-022](FEATURE_BACKLOG.md#f-022), [F-023](FEATURE_BACKLOG.md#f-023), [F-051](FEATURE_BACKLOG.md#f-051) |
| MVP-07 | Trainer-alone Echo onboarding | [F-011](FEATURE_BACKLOG.md#f-011), [F-013](FEATURE_BACKLOG.md#f-013), [F-014](FEATURE_BACKLOG.md#f-014), [F-015](FEATURE_BACKLOG.md#f-015), [F-029](FEATURE_BACKLOG.md#f-029), [F-051](FEATURE_BACKLOG.md#f-051), [F-060](FEATURE_BACKLOG.md#f-060) |
| MVP-08 | Preparation, collection and inventory UX | [F-003](FEATURE_BACKLOG.md#f-003), [F-005](FEATURE_BACKLOG.md#f-005), [F-008](FEATURE_BACKLOG.md#f-008), [F-010](FEATURE_BACKLOG.md#f-010), [F-012](FEATURE_BACKLOG.md#f-012), [F-013](FEATURE_BACKLOG.md#f-013), [F-029](FEATURE_BACKLOG.md#f-029), [F-030](FEATURE_BACKLOG.md#f-030) |
| MVP-09 | Inner Sea and appearance equipment | [F-023](FEATURE_BACKLOG.md#f-023), [F-027](FEATURE_BACKLOG.md#f-027), [F-031](FEATURE_BACKLOG.md#f-031), [F-032](FEATURE_BACKLOG.md#f-032) |
| MVP-10 | Production client/runtime pipeline | [F-034](FEATURE_BACKLOG.md#f-034), [F-035](FEATURE_BACKLOG.md#f-035), [F-036](FEATURE_BACKLOG.md#f-036), [F-046](FEATURE_BACKLOG.md#f-046) |
| MVP-11 | Accounts, home realm and recovery | [F-037](FEATURE_BACKLOG.md#f-037), [F-038](FEATURE_BACKLOG.md#f-038), [F-041](FEATURE_BACKLOG.md#f-041), [F-045](FEATURE_BACKLOG.md#f-045) |
| MVP-12 | Authoritative gameplay and loot | [F-011](FEATURE_BACKLOG.md#f-011), [F-014](FEATURE_BACKLOG.md#f-014), [F-018](FEATURE_BACKLOG.md#f-018), [F-036](FEATURE_BACKLOG.md#f-036), [F-039](FEATURE_BACKLOG.md#f-039), [F-040](FEATURE_BACKLOG.md#f-040), [F-045](FEATURE_BACKLOG.md#f-045), [F-060](FEATURE_BACKLOG.md#f-060) |
| MVP-13 | Eight-product cosmetic catalog | [F-032](FEATURE_BACKLOG.md#f-032), [F-033](FEATURE_BACKLOG.md#f-033) |
| MVP-14 | Payments and entitlements | [F-042](FEATURE_BACKLOG.md#f-042), [F-043](FEATURE_BACKLOG.md#f-043), [F-044](FEATURE_BACKLOG.md#f-044), [F-045](FEATURE_BACKLOG.md#f-045) |
| MVP-15 | Analytics and feedback | [F-050](FEATURE_BACKLOG.md#f-050) |
| MVP-16 | Production operations | [F-041](FEATURE_BACKLOG.md#f-041), [F-044](FEATURE_BACKLOG.md#f-044), [F-046](FEATURE_BACKLOG.md#f-046), [F-047](FEATURE_BACKLOG.md#f-047), [F-048](FEATURE_BACKLOG.md#f-048), [F-049](FEATURE_BACKLOG.md#f-049), [F-053](FEATURE_BACKLOG.md#f-053) |
| MVP-17 | Device/accessibility/security QA | [F-004](FEATURE_BACKLOG.md#f-004), [F-007](FEATURE_BACKLOG.md#f-007), [F-028](FEATURE_BACKLOG.md#f-028), [F-030](FEATURE_BACKLOG.md#f-030), [F-035](FEATURE_BACKLOG.md#f-035), [F-045](FEATURE_BACKLOG.md#f-045), [F-049](FEATURE_BACKLOG.md#f-049), [F-052](FEATURE_BACKLOG.md#f-052) |
| MVP-18 | Launch package | [F-053](FEATURE_BACKLOG.md#f-053), [F-054](FEATURE_BACKLOG.md#f-054) |
| MVP-19 | Controlled commercial release | [F-051](FEATURE_BACKLOG.md#f-051), [F-053](FEATURE_BACKLOG.md#f-053), [F-055](FEATURE_BACKLOG.md#f-055), [F-066](FEATURE_BACKLOG.md#f-066) |
| MVP-20 | PT-BR | [F-056](FEATURE_BACKLOG.md#f-056) |
| MVP-21 | Wider browser support | [F-057](FEATURE_BACKLOG.md#f-057) |
| MVP-22 | World atlas and large maps | [F-027](FEATURE_BACKLOG.md#f-027), [F-058](FEATURE_BACKLOG.md#f-058) |
| MVP-23 | Map-wide populations and rare respawns | [F-039](FEATURE_BACKLOG.md#f-039), [F-059](FEATURE_BACKLOG.md#f-059), [F-060](FEATURE_BACKLOG.md#f-060) |
| MVP-24 | Cooperative group bosses | [F-022](FEATURE_BACKLOG.md#f-022), [F-039](FEATURE_BACKLOG.md#f-039), [F-061](FEATURE_BACKLOG.md#f-061), [F-062](FEATURE_BACKLOG.md#f-062) |
| MVP-25 | Repeatable ultra-rare boss essences | [F-022](FEATURE_BACKLOG.md#f-022), [F-047](FEATURE_BACKLOG.md#f-047), [F-063](FEATURE_BACKLOG.md#f-063) |
| MVP-26 | 100-species production | [F-006](FEATURE_BACKLOG.md#f-006), [F-025](FEATURE_BACKLOG.md#f-025), [F-064](FEATURE_BACKLOG.md#f-064) |
| MVP-27 | Rare-economy anti-abuse | [F-065](FEATURE_BACKLOG.md#f-065) |
| MVP-28 | Scale, cash and schedule rebaseline | [F-049](FEATURE_BACKLOG.md#f-049), [F-066](FEATURE_BACKLOG.md#f-066) |

## 2. Whole scope section → features and validation

| Section | Coverage | Features | Required protocols |
| --- | --- | --- | --- |
| §1 | Executive decision | [F-006](FEATURE_BACKLOG.md#f-006), [F-014](FEATURE_BACKLOG.md#f-014), [F-058](FEATURE_BACKLOG.md#f-058), [F-060](FEATURE_BACKLOG.md#f-060), [F-063](FEATURE_BACKLOG.md#f-063), [F-066](FEATURE_BACKLOG.md#f-066) | VP-01, VP-02, VP-03, VP-06, VP-07, VP-09, VP-10, VP-11, VP-13, VP-14, VP-15 |
| §2 | Prototype / version boundary | [F-038](FEATURE_BACKLOG.md#f-038), [F-052](FEATURE_BACKLOG.md#f-052), [F-055](FEATURE_BACKLOG.md#f-055) | VP-01, VP-02, VP-03, VP-05, VP-06, VP-07, VP-08, VP-09, VP-10, VP-11, VP-13, VP-14, VP-15 |
| §3 | Product and core loop | [F-013](FEATURE_BACKLOG.md#f-013), [F-015](FEATURE_BACKLOG.md#f-015), [F-019](FEATURE_BACKLOG.md#f-019), [F-029](FEATURE_BACKLOG.md#f-029), [F-051](FEATURE_BACKLOG.md#f-051) | VP-01, VP-02, VP-03, VP-05, VP-10, VP-13, VP-14, VP-15 |
| §4 | Inclusions and exclusions | [F-031](FEATURE_BACKLOG.md#f-031), [F-033](FEATURE_BACKLOG.md#f-033), [F-055](FEATURE_BACKLOG.md#f-055), [F-056](FEATURE_BACKLOG.md#f-056), [F-057](FEATURE_BACKLOG.md#f-057), [F-061](FEATURE_BACKLOG.md#f-061) | VP-01, VP-03, VP-04, VP-05, VP-06, VP-07, VP-08, VP-09, VP-10, VP-11, VP-12, VP-14 |
| §5 | Combat and attributes | [F-001](FEATURE_BACKLOG.md#f-001), [F-002](FEATURE_BACKLOG.md#f-002), [F-003](FEATURE_BACKLOG.md#f-003), [F-004](FEATURE_BACKLOG.md#f-004), [F-005](FEATURE_BACKLOG.md#f-005), [F-006](FEATURE_BACKLOG.md#f-006), [F-007](FEATURE_BACKLOG.md#f-007), [F-008](FEATURE_BACKLOG.md#f-008), [F-021](FEATURE_BACKLOG.md#f-021), [F-062](FEATURE_BACKLOG.md#f-062) | VP-01, VP-02, VP-03, VP-05, VP-06, VP-07, VP-13, VP-14, VP-15 |
| §6 | World atlas and content | [F-016](FEATURE_BACKLOG.md#f-016), [F-017](FEATURE_BACKLOG.md#f-017), [F-018](FEATURE_BACKLOG.md#f-018), [F-019](FEATURE_BACKLOG.md#f-019), [F-020](FEATURE_BACKLOG.md#f-020), [F-021](FEATURE_BACKLOG.md#f-021), [F-022](FEATURE_BACKLOG.md#f-022), [F-023](FEATURE_BACKLOG.md#f-023), [F-058](FEATURE_BACKLOG.md#f-058), [F-059](FEATURE_BACKLOG.md#f-059), [F-064](FEATURE_BACKLOG.md#f-064) | VP-01, VP-02, VP-03, VP-04, VP-05, VP-06, VP-07, VP-10, VP-13, VP-14, VP-15 |
| §7 | Progression, Echoes and economy | [F-009](FEATURE_BACKLOG.md#f-009), [F-010](FEATURE_BACKLOG.md#f-010), [F-011](FEATURE_BACKLOG.md#f-011), [F-012](FEATURE_BACKLOG.md#f-012), [F-013](FEATURE_BACKLOG.md#f-013), [F-014](FEATURE_BACKLOG.md#f-014), [F-015](FEATURE_BACKLOG.md#f-015), [F-040](FEATURE_BACKLOG.md#f-040), [F-060](FEATURE_BACKLOG.md#f-060), [F-063](FEATURE_BACKLOG.md#f-063) | VP-01, VP-02, VP-03, VP-05, VP-07, VP-09, VP-10, VP-14, VP-15 |
| §8 | Graphics, animation and audio | [F-024](FEATURE_BACKLOG.md#f-024), [F-025](FEATURE_BACKLOG.md#f-025), [F-026](FEATURE_BACKLOG.md#f-026), [F-027](FEATURE_BACKLOG.md#f-027), [F-028](FEATURE_BACKLOG.md#f-028), [F-035](FEATURE_BACKLOG.md#f-035), [F-064](FEATURE_BACKLOG.md#f-064) | VP-01, VP-02, VP-04, VP-05, VP-06, VP-10, VP-12, VP-13, VP-14, VP-15 |
| §9 | UX and Inner Sea | [F-005](FEATURE_BACKLOG.md#f-005), [F-010](FEATURE_BACKLOG.md#f-010), [F-012](FEATURE_BACKLOG.md#f-012), [F-013](FEATURE_BACKLOG.md#f-013), [F-029](FEATURE_BACKLOG.md#f-029), [F-030](FEATURE_BACKLOG.md#f-030), [F-031](FEATURE_BACKLOG.md#f-031) | VP-01, VP-02, VP-03, VP-04, VP-05, VP-10, VP-12 |
| §10 | Cosmetics and commerce | [F-032](FEATURE_BACKLOG.md#f-032), [F-033](FEATURE_BACKLOG.md#f-033), [F-042](FEATURE_BACKLOG.md#f-042), [F-043](FEATURE_BACKLOG.md#f-043), [F-044](FEATURE_BACKLOG.md#f-044) | VP-01, VP-02, VP-03, VP-05, VP-07, VP-08, VP-09 |
| §11 | Architecture and boss reward integrity | [F-034](FEATURE_BACKLOG.md#f-034), [F-036](FEATURE_BACKLOG.md#f-036), [F-037](FEATURE_BACKLOG.md#f-037), [F-038](FEATURE_BACKLOG.md#f-038), [F-039](FEATURE_BACKLOG.md#f-039), [F-040](FEATURE_BACKLOG.md#f-040), [F-041](FEATURE_BACKLOG.md#f-041), [F-045](FEATURE_BACKLOG.md#f-045), [F-046](FEATURE_BACKLOG.md#f-046), [F-047](FEATURE_BACKLOG.md#f-047), [F-061](FEATURE_BACKLOG.md#f-061), [F-062](FEATURE_BACKLOG.md#f-062), [F-063](FEATURE_BACKLOG.md#f-063), [F-065](FEATURE_BACKLOG.md#f-065) | VP-01, VP-02, VP-03, VP-06, VP-07, VP-08, VP-09, VP-11, VP-13, VP-14, VP-15 |
| §12 | QA, performance and capacity | [F-035](FEATURE_BACKLOG.md#f-035), [F-036](FEATURE_BACKLOG.md#f-036), [F-045](FEATURE_BACKLOG.md#f-045), [F-047](FEATURE_BACKLOG.md#f-047), [F-049](FEATURE_BACKLOG.md#f-049), [F-052](FEATURE_BACKLOG.md#f-052), [F-057](FEATURE_BACKLOG.md#f-057), [F-066](FEATURE_BACKLOG.md#f-066) | VP-01, VP-02, VP-03, VP-05, VP-06, VP-07, VP-08, VP-09, VP-10, VP-11, VP-12, VP-13, VP-14, VP-15 |
| §13 | Player validation and release | [F-050](FEATURE_BACKLOG.md#f-050), [F-051](FEATURE_BACKLOG.md#f-051), [F-052](FEATURE_BACKLOG.md#f-052), [F-055](FEATURE_BACKLOG.md#f-055), [F-066](FEATURE_BACKLOG.md#f-066) | VP-01, VP-02, VP-03, VP-05, VP-06, VP-07, VP-08, VP-09, VP-10, VP-11, VP-13, VP-14, VP-15 |
| §14 | Work packages and schedule | [F-024](FEATURE_BACKLOG.md#f-024), [F-036](FEATURE_BACKLOG.md#f-036), [F-058](FEATURE_BACKLOG.md#f-058), [F-064](FEATURE_BACKLOG.md#f-064), [F-066](FEATURE_BACKLOG.md#f-066) | VP-01, VP-02, VP-04, VP-05, VP-06, VP-07, VP-09, VP-10, VP-11, VP-13, VP-14, VP-15 |
| §15 | Cash and owner resources | [F-049](FEATURE_BACKLOG.md#f-049), [F-053](FEATURE_BACKLOG.md#f-053), [F-066](FEATURE_BACKLOG.md#f-066) | VP-06, VP-07, VP-09, VP-10, VP-11, VP-13, VP-14, VP-15 |
| §16 | Commercial / rights / safety | [F-041](FEATURE_BACKLOG.md#f-041), [F-045](FEATURE_BACKLOG.md#f-045), [F-048](FEATURE_BACKLOG.md#f-048), [F-053](FEATURE_BACKLOG.md#f-053), [F-054](FEATURE_BACKLOG.md#f-054), [F-065](FEATURE_BACKLOG.md#f-065) | VP-05, VP-07, VP-08, VP-09, VP-11, VP-13, VP-14, VP-15 |
| §17 | Backlog / accountability | [F-001](FEATURE_BACKLOG.md#f-001), [F-002](FEATURE_BACKLOG.md#f-002), [F-003](FEATURE_BACKLOG.md#f-003), [F-004](FEATURE_BACKLOG.md#f-004), [F-005](FEATURE_BACKLOG.md#f-005), [F-006](FEATURE_BACKLOG.md#f-006), [F-007](FEATURE_BACKLOG.md#f-007), [F-008](FEATURE_BACKLOG.md#f-008), [F-009](FEATURE_BACKLOG.md#f-009), [F-010](FEATURE_BACKLOG.md#f-010), [F-011](FEATURE_BACKLOG.md#f-011), [F-012](FEATURE_BACKLOG.md#f-012), [F-013](FEATURE_BACKLOG.md#f-013), [F-014](FEATURE_BACKLOG.md#f-014), [F-015](FEATURE_BACKLOG.md#f-015), [F-016](FEATURE_BACKLOG.md#f-016), [F-017](FEATURE_BACKLOG.md#f-017), [F-018](FEATURE_BACKLOG.md#f-018), [F-019](FEATURE_BACKLOG.md#f-019), [F-020](FEATURE_BACKLOG.md#f-020), [F-021](FEATURE_BACKLOG.md#f-021), [F-022](FEATURE_BACKLOG.md#f-022), [F-023](FEATURE_BACKLOG.md#f-023), [F-024](FEATURE_BACKLOG.md#f-024), [F-025](FEATURE_BACKLOG.md#f-025), [F-026](FEATURE_BACKLOG.md#f-026), [F-027](FEATURE_BACKLOG.md#f-027), [F-028](FEATURE_BACKLOG.md#f-028), [F-029](FEATURE_BACKLOG.md#f-029), [F-030](FEATURE_BACKLOG.md#f-030), [F-031](FEATURE_BACKLOG.md#f-031), [F-032](FEATURE_BACKLOG.md#f-032), [F-033](FEATURE_BACKLOG.md#f-033), [F-034](FEATURE_BACKLOG.md#f-034), [F-035](FEATURE_BACKLOG.md#f-035), [F-036](FEATURE_BACKLOG.md#f-036), [F-037](FEATURE_BACKLOG.md#f-037), [F-038](FEATURE_BACKLOG.md#f-038), [F-039](FEATURE_BACKLOG.md#f-039), [F-040](FEATURE_BACKLOG.md#f-040), [F-041](FEATURE_BACKLOG.md#f-041), [F-042](FEATURE_BACKLOG.md#f-042), [F-043](FEATURE_BACKLOG.md#f-043), [F-044](FEATURE_BACKLOG.md#f-044), [F-045](FEATURE_BACKLOG.md#f-045), [F-046](FEATURE_BACKLOG.md#f-046), [F-047](FEATURE_BACKLOG.md#f-047), [F-048](FEATURE_BACKLOG.md#f-048), [F-049](FEATURE_BACKLOG.md#f-049), [F-050](FEATURE_BACKLOG.md#f-050), [F-051](FEATURE_BACKLOG.md#f-051), [F-052](FEATURE_BACKLOG.md#f-052), [F-053](FEATURE_BACKLOG.md#f-053), [F-054](FEATURE_BACKLOG.md#f-054), [F-055](FEATURE_BACKLOG.md#f-055), [F-056](FEATURE_BACKLOG.md#f-056), [F-057](FEATURE_BACKLOG.md#f-057), [F-058](FEATURE_BACKLOG.md#f-058), [F-059](FEATURE_BACKLOG.md#f-059), [F-060](FEATURE_BACKLOG.md#f-060), [F-061](FEATURE_BACKLOG.md#f-061), [F-062](FEATURE_BACKLOG.md#f-062), [F-063](FEATURE_BACKLOG.md#f-063), [F-064](FEATURE_BACKLOG.md#f-064), [F-065](FEATURE_BACKLOG.md#f-065), [F-066](FEATURE_BACKLOG.md#f-066) | VP-01, VP-02, VP-03, VP-04, VP-05, VP-06, VP-07, VP-08, VP-09, VP-10, VP-11, VP-12, VP-13, VP-14, VP-15 |
| §18 | Risks and decision rules | [F-051](FEATURE_BACKLOG.md#f-051), [F-053](FEATURE_BACKLOG.md#f-053), [F-055](FEATURE_BACKLOG.md#f-055), [F-060](FEATURE_BACKLOG.md#f-060), [F-063](FEATURE_BACKLOG.md#f-063), [F-064](FEATURE_BACKLOG.md#f-064), [F-065](FEATURE_BACKLOG.md#f-065), [F-066](FEATURE_BACKLOG.md#f-066) | VP-01, VP-02, VP-04, VP-05, VP-06, VP-07, VP-08, VP-09, VP-10, VP-11, VP-13, VP-14, VP-15 |

## 3. Validation protocol → feature cards

| Protocol | Purpose | Features |
| --- | --- | --- |
| VP-01 | Data, roster and content contracts | [F-001](FEATURE_BACKLOG.md#f-001), [F-006](FEATURE_BACKLOG.md#f-006), [F-010](FEATURE_BACKLOG.md#f-010), [F-013](FEATURE_BACKLOG.md#f-013), [F-018](FEATURE_BACKLOG.md#f-018), [F-019](FEATURE_BACKLOG.md#f-019), [F-020](FEATURE_BACKLOG.md#f-020), [F-027](FEATURE_BACKLOG.md#f-027), [F-033](FEATURE_BACKLOG.md#f-033), [F-034](FEATURE_BACKLOG.md#f-034), [F-046](FEATURE_BACKLOG.md#f-046), [F-052](FEATURE_BACKLOG.md#f-052), [F-058](FEATURE_BACKLOG.md#f-058), [F-059](FEATURE_BACKLOG.md#f-059), [F-060](FEATURE_BACKLOG.md#f-060), [F-064](FEATURE_BACKLOG.md#f-064) |
| VP-02 | Mechanics and numerical correctness | [F-001](FEATURE_BACKLOG.md#f-001), [F-002](FEATURE_BACKLOG.md#f-002), [F-003](FEATURE_BACKLOG.md#f-003), [F-004](FEATURE_BACKLOG.md#f-004), [F-005](FEATURE_BACKLOG.md#f-005), [F-006](FEATURE_BACKLOG.md#f-006), [F-007](FEATURE_BACKLOG.md#f-007), [F-009](FEATURE_BACKLOG.md#f-009), [F-010](FEATURE_BACKLOG.md#f-010), [F-011](FEATURE_BACKLOG.md#f-011), [F-014](FEATURE_BACKLOG.md#f-014), [F-015](FEATURE_BACKLOG.md#f-015), [F-020](FEATURE_BACKLOG.md#f-020), [F-021](FEATURE_BACKLOG.md#f-021), [F-022](FEATURE_BACKLOG.md#f-022), [F-023](FEATURE_BACKLOG.md#f-023), [F-032](FEATURE_BACKLOG.md#f-032), [F-036](FEATURE_BACKLOG.md#f-036), [F-052](FEATURE_BACKLOG.md#f-052), [F-060](FEATURE_BACKLOG.md#f-060), [F-062](FEATURE_BACKLOG.md#f-062), [F-064](FEATURE_BACKLOG.md#f-064) |
| VP-03 | Browser flows, inventory and persistence | [F-002](FEATURE_BACKLOG.md#f-002), [F-003](FEATURE_BACKLOG.md#f-003), [F-004](FEATURE_BACKLOG.md#f-004), [F-005](FEATURE_BACKLOG.md#f-005), [F-008](FEATURE_BACKLOG.md#f-008), [F-011](FEATURE_BACKLOG.md#f-011), [F-012](FEATURE_BACKLOG.md#f-012), [F-013](FEATURE_BACKLOG.md#f-013), [F-014](FEATURE_BACKLOG.md#f-014), [F-015](FEATURE_BACKLOG.md#f-015), [F-016](FEATURE_BACKLOG.md#f-016), [F-017](FEATURE_BACKLOG.md#f-017), [F-018](FEATURE_BACKLOG.md#f-018), [F-019](FEATURE_BACKLOG.md#f-019), [F-021](FEATURE_BACKLOG.md#f-021), [F-022](FEATURE_BACKLOG.md#f-022), [F-023](FEATURE_BACKLOG.md#f-023), [F-029](FEATURE_BACKLOG.md#f-029), [F-031](FEATURE_BACKLOG.md#f-031), [F-032](FEATURE_BACKLOG.md#f-032), [F-033](FEATURE_BACKLOG.md#f-033), [F-034](FEATURE_BACKLOG.md#f-034), [F-037](FEATURE_BACKLOG.md#f-037), [F-038](FEATURE_BACKLOG.md#f-038), [F-039](FEATURE_BACKLOG.md#f-039), [F-052](FEATURE_BACKLOG.md#f-052), [F-061](FEATURE_BACKLOG.md#f-061) |
| VP-04 | Presentation rubric and impact synchronization | [F-024](FEATURE_BACKLOG.md#f-024), [F-025](FEATURE_BACKLOG.md#f-025), [F-026](FEATURE_BACKLOG.md#f-026), [F-027](FEATURE_BACKLOG.md#f-027), [F-028](FEATURE_BACKLOG.md#f-028), [F-031](FEATURE_BACKLOG.md#f-031), [F-064](FEATURE_BACKLOG.md#f-064) |
| VP-05 | Usability, accessibility and input | [F-008](FEATURE_BACKLOG.md#f-008), [F-010](FEATURE_BACKLOG.md#f-010), [F-012](FEATURE_BACKLOG.md#f-012), [F-015](FEATURE_BACKLOG.md#f-015), [F-016](FEATURE_BACKLOG.md#f-016), [F-017](FEATURE_BACKLOG.md#f-017), [F-024](FEATURE_BACKLOG.md#f-024), [F-028](FEATURE_BACKLOG.md#f-028), [F-029](FEATURE_BACKLOG.md#f-029), [F-030](FEATURE_BACKLOG.md#f-030), [F-031](FEATURE_BACKLOG.md#f-031), [F-033](FEATURE_BACKLOG.md#f-033), [F-051](FEATURE_BACKLOG.md#f-051), [F-052](FEATURE_BACKLOG.md#f-052), [F-054](FEATURE_BACKLOG.md#f-054), [F-056](FEATURE_BACKLOG.md#f-056) |
| VP-06 | Physical performance, loading and streaming | [F-021](FEATURE_BACKLOG.md#f-021), [F-025](FEATURE_BACKLOG.md#f-025), [F-026](FEATURE_BACKLOG.md#f-026), [F-034](FEATURE_BACKLOG.md#f-034), [F-035](FEATURE_BACKLOG.md#f-035), [F-052](FEATURE_BACKLOG.md#f-052), [F-057](FEATURE_BACKLOG.md#f-057), [F-058](FEATURE_BACKLOG.md#f-058), [F-066](FEATURE_BACKLOG.md#f-066) |
| VP-07 | Authority, security and transaction races | [F-014](FEATURE_BACKLOG.md#f-014), [F-018](FEATURE_BACKLOG.md#f-018), [F-022](FEATURE_BACKLOG.md#f-022), [F-032](FEATURE_BACKLOG.md#f-032), [F-036](FEATURE_BACKLOG.md#f-036), [F-037](FEATURE_BACKLOG.md#f-037), [F-038](FEATURE_BACKLOG.md#f-038), [F-039](FEATURE_BACKLOG.md#f-039), [F-040](FEATURE_BACKLOG.md#f-040), [F-041](FEATURE_BACKLOG.md#f-041), [F-042](FEATURE_BACKLOG.md#f-042), [F-045](FEATURE_BACKLOG.md#f-045), [F-046](FEATURE_BACKLOG.md#f-046), [F-048](FEATURE_BACKLOG.md#f-048), [F-049](FEATURE_BACKLOG.md#f-049), [F-050](FEATURE_BACKLOG.md#f-050), [F-052](FEATURE_BACKLOG.md#f-052), [F-059](FEATURE_BACKLOG.md#f-059), [F-060](FEATURE_BACKLOG.md#f-060), [F-061](FEATURE_BACKLOG.md#f-061), [F-062](FEATURE_BACKLOG.md#f-062), [F-063](FEATURE_BACKLOG.md#f-063), [F-065](FEATURE_BACKLOG.md#f-065) |
| VP-08 | Checkout, ownership, refunds and purchase recovery | [F-042](FEATURE_BACKLOG.md#f-042), [F-043](FEATURE_BACKLOG.md#f-043), [F-044](FEATURE_BACKLOG.md#f-044), [F-047](FEATURE_BACKLOG.md#f-047), [F-048](FEATURE_BACKLOG.md#f-048), [F-052](FEATURE_BACKLOG.md#f-052), [F-055](FEATURE_BACKLOG.md#f-055), [F-057](FEATURE_BACKLOG.md#f-057) |
| VP-09 | Operations, load, cost and restore | [F-041](FEATURE_BACKLOG.md#f-041), [F-044](FEATURE_BACKLOG.md#f-044), [F-046](FEATURE_BACKLOG.md#f-046), [F-047](FEATURE_BACKLOG.md#f-047), [F-048](FEATURE_BACKLOG.md#f-048), [F-049](FEATURE_BACKLOG.md#f-049), [F-052](FEATURE_BACKLOG.md#f-052), [F-055](FEATURE_BACKLOG.md#f-055), [F-063](FEATURE_BACKLOG.md#f-063), [F-065](FEATURE_BACKLOG.md#f-065), [F-066](FEATURE_BACKLOG.md#f-066) |
| VP-10 | Balance, rare-drop pacing and outside-player evidence | [F-009](FEATURE_BACKLOG.md#f-009), [F-013](FEATURE_BACKLOG.md#f-013), [F-019](FEATURE_BACKLOG.md#f-019), [F-020](FEATURE_BACKLOG.md#f-020), [F-023](FEATURE_BACKLOG.md#f-023), [F-029](FEATURE_BACKLOG.md#f-029), [F-050](FEATURE_BACKLOG.md#f-050), [F-051](FEATURE_BACKLOG.md#f-051), [F-052](FEATURE_BACKLOG.md#f-052), [F-055](FEATURE_BACKLOG.md#f-055), [F-064](FEATURE_BACKLOG.md#f-064), [F-066](FEATURE_BACKLOG.md#f-066) |
| VP-11 | Owner, business, rights and external approvals | [F-041](FEATURE_BACKLOG.md#f-041), [F-053](FEATURE_BACKLOG.md#f-053), [F-054](FEATURE_BACKLOG.md#f-054), [F-055](FEATURE_BACKLOG.md#f-055), [F-066](FEATURE_BACKLOG.md#f-066) |
| VP-12 | Device/browser and optional locale certification | [F-030](FEATURE_BACKLOG.md#f-030), [F-035](FEATURE_BACKLOG.md#f-035), [F-056](FEATURE_BACKLOG.md#f-056), [F-057](FEATURE_BACKLOG.md#f-057) |
| VP-13 | Large-map traversal, habitats and respawn integrity | [F-016](FEATURE_BACKLOG.md#f-016), [F-017](FEATURE_BACKLOG.md#f-017), [F-018](FEATURE_BACKLOG.md#f-018), [F-021](FEATURE_BACKLOG.md#f-021), [F-027](FEATURE_BACKLOG.md#f-027), [F-035](FEATURE_BACKLOG.md#f-035), [F-039](FEATURE_BACKLOG.md#f-039), [F-049](FEATURE_BACKLOG.md#f-049), [F-051](FEATURE_BACKLOG.md#f-051), [F-052](FEATURE_BACKLOG.md#f-052), [F-058](FEATURE_BACKLOG.md#f-058), [F-059](FEATURE_BACKLOG.md#f-059), [F-065](FEATURE_BACKLOG.md#f-065) |
| VP-14 | Real cooperative boss rooms and network recovery | [F-022](FEATURE_BACKLOG.md#f-022), [F-026](FEATURE_BACKLOG.md#f-026), [F-035](FEATURE_BACKLOG.md#f-035), [F-036](FEATURE_BACKLOG.md#f-036), [F-039](FEATURE_BACKLOG.md#f-039), [F-049](FEATURE_BACKLOG.md#f-049), [F-051](FEATURE_BACKLOG.md#f-051), [F-052](FEATURE_BACKLOG.md#f-052), [F-061](FEATURE_BACKLOG.md#f-061), [F-062](FEATURE_BACKLOG.md#f-062), [F-063](FEATURE_BACKLOG.md#f-063), [F-065](FEATURE_BACKLOG.md#f-065) |
| VP-15 | Ultra-rare RNG, guaranteed summon and repeatable boss drops | [F-011](FEATURE_BACKLOG.md#f-011), [F-014](FEATURE_BACKLOG.md#f-014), [F-015](FEATURE_BACKLOG.md#f-015), [F-022](FEATURE_BACKLOG.md#f-022), [F-039](FEATURE_BACKLOG.md#f-039), [F-040](FEATURE_BACKLOG.md#f-040), [F-047](FEATURE_BACKLOG.md#f-047), [F-049](FEATURE_BACKLOG.md#f-049), [F-051](FEATURE_BACKLOG.md#f-051), [F-052](FEATURE_BACKLOG.md#f-052), [F-060](FEATURE_BACKLOG.md#f-060), [F-062](FEATURE_BACKLOG.md#f-062), [F-063](FEATURE_BACKLOG.md#f-063), [F-064](FEATURE_BACKLOG.md#f-064), [F-065](FEATURE_BACKLOG.md#f-065) |

## 4. Release quantities and mandatory changes

| Requirement | Active launch baseline | Principal acceptance |
| --- | --- | --- |
| Distinct summonable species | At least 100; planning 94 wild + six boss species; no recolor counting | F-006, F-064; VP-01/04 |
| Trainer classes and kit | Four classes; each class/species five active choices, three equipped | F-004, F-006 |
| Skill/innate/tree coverage | 520 active assignments; 100 innates; 104 trees ×18 nodes =1,872 | F-006, F-010, F-064 |
| New-player party | Trainer alone; zero-to-two companions supported; all four classes solo-beat starters | F-004, F-009, F-015 |
| World | 24 large maps across six regions: 18 outdoor + six caves; six compact hubs and six compact boss domains; danger never invisibly locks roads | F-016–018, F-058 |
| Crossing | At least 30 seconds at base speed, target 45–90; shortest opposite-side routes; no load/combat/idle padding | F-058; VP-13 |
| Habitat identity | 94 wild species assigned source populations with roaming and durable spawn life/respawn | F-059; VP-13 |
| Narrative / opposition | Six chapters/48 steps; 60 trainer/faction compositions; 12 packs; six optional bosses | F-019–023 |
| Starter Echoes | 10% per eligible killed spawn life; no guaranteed first drop or pity | F-014–015, F-060; VP-15 |
| Mid/late Echoes and every very-rare row | 0.01% = one in 10,000; spawn rarity separate | F-060; VP-15 |
| Summoning | 100% legal success; consume Echo once, no additional RNG/papyrus/paid fee | F-014, F-040; VP-15 |
| Loot persistence | Committed per-kill loot survives later loss, exit and reconnect | F-011, F-039–040 |
| Group bosses | Two–three real players; cross-party support; max 13 actors; server clock and own-party elimination | F-022, F-061–062; VP-14 |
| Boss essence | One 0.01% roll per eligible group victory, including later victories; one recipient per success; no server-wide copy cap | F-063; VP-15 |
| Consume / deletion / restore | Reconcile each victory/reward/summon receipt without duplicating old rewards or disabling independent future drops | F-041, F-047, F-063 |
| Progression | Hard player/owned ceiling60, engine/wild curve100; high-source summons clamp safely; trainer highest owned or 1; story possible with ordinary roster | F-009, F-019, F-051 |
| Presentation | 104 character state sets, six boss phase sets, 24 large maps/six hubs/six boss domains and fixed Inner Sea | F-024–028, F-064 |
| Cosmetics | Eight paid products + ≥3 earned rewards; no power, Echo or luck sales | F-032–033, F-042–044 |
| Full-scale runtime | Lazy loading; physical dense-map/13-actor tests; 100-account staged load | F-034–036, F-049 |
| Resource reality | Withdraw old small-MVP schedule/cost allowance; measured pilot and funded rebaseline | F-066 |
| Optional platforms/language | PT-BR and Safari/iOS remain two P1 cards, not advertised untested | F-056–057 |

Numbers remain commercial requirements, not automatic acceptance. Pass 14 supplies a 100-species local test manifest, independent companions/portrait picker/immediate wild loot and 24-map/six-hub runtime. Production art, kit distinctness, group-boss sources and world-quality review remain pending; see features/delivery/REMAINING_SCOPE.md.

## 5. Superseded and deferred boundaries

- V1 small-release quantities, proposed level20 cap, first-capture guarantee/pity, consumable contract rolls and board-based three-encounter routes are not active v2 commercial requirements.
- Pass 13 replaces the old live contract/route system with local Soul Echo summoning and spatial maps. README, PROGRESS and Companion stats document actual behavior; server/group criteria are still planned.
- GN-009 cooperative boss fights are now **planned for commercial v2**, not implemented. GN-001 account buffs and GN-002 quest evolution remain stashed.
- Shared public exploration/towns, PvP, trading, guilds/chat, housing construction, water exploration and paid gameplay advantages remain outside scope.
- Boss rarity is not guaranteed superior power. Encounter raid stats/phase behavior are separate from a summoned companion's balanced playable kit.
- A smaller free pilot can validate the work; it cannot satisfy the at-least-100 commercial launch requirement. The old time/cash estimate cannot be reused for this expanded scope.

## 6. Integrity audit

Run `python tests/scope_docs_check.py`. It verifies IDs, four criteria/card, metadata, acyclic dependencies, all source/section/protocol links, gate/lock counts and selected v2 design invariants. The audit also checks source-to-feature and protocol-to-feature mappings against actual card metadata.

All 264 acceptance criteria remain unchecked until their real evidence is produced. A successful documentation check does not constitute browser, art, security, multiplayer, payment or commercial acceptance.
