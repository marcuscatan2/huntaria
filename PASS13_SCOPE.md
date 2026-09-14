# Pass 13 — implementation of F-001 through F-016

Started 2026-09-10. One agent. Scope: implement the playable local browser
requirements, test them, and provide an explicit owner-validation checklist.
The complete commercial acceptance criteria remain in FEATURE_BACKLOG.md.

## Implementation sequence

1. Explicit damage categories; locked Speed/dodge/regen and Leadership formulas.
2. Zero-to-two companion parties, formation, statuses and deterministic combat.
3. One hundred species with five skills, an innate and a usable 18-node tree.
4. Versioned, recoverable local profile; persistent spawn/kill/loot receipts;
   10% starter and 0.01% ultra-rare Echo drops; guaranteed Inner Sea summoning.
5. Inventory, collection, inspection, onboarding and useful result feedback.
6. Twenty-four actual 2D exploration maps, six hubs, habitats, gates, collision,
   camera/followers and measured >=30-second unbuffed crossing distances.
7. Deterministic mechanics/data tests, real browser journeys, screenshots and
   save/viewport/error checks. Save a feature-by-feature validation handoff.

## Boundaries to report honestly

- Existing code is offline/local, with no online accounts, authoritative server
  rewards or multiplayer rooms. Criteria depending on F-037–040, F-061–063 and
  production security cannot be accepted merely by testing local storage.
- This batch may implement the shared group-combat rules/fixtures, but must not
  describe a local group simulation as synchronized multiplayer.
- New code-native creature art and map layouts require the owner's visual review;
  content enumeration alone is not commercial art or balance acceptance.
- Keep the 100-species and 24-map requirements; do not silently reduce the scope.
- Preserve old saves as migration inputs; never erase a real browser profile.
- No deployment, purchases, external accounts, ads or analytics collection.
- Account mastery and quest evolution remain stashed. Boss Echoes have no global
  copy cap; future eligible victories retain their independent 0.01% chance.

## Verification

Local implementation and automated verification are recorded in PROGRESS.md.
Owner checklist and remaining criteria: PASS13_VALIDATION.md. No commercial
criteria are marked accepted; online dependencies and production content remain.

Final verification: Chrome 2083/2083; Edge 2083/2083; no JavaScript errors or
missing assets. Matching source hashes. Planning integrity 30/30. Owner review
and the explicitly listed commercial requirements remain unfinished.
