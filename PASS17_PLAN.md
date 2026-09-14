# Pass 17 — map populations and creature families

User-directed changes, one agent; preserve saves, builds and Echo rates.

- Per-map species quotas: Common 8, Uncommon 5, Rare/Very rare 1. Ordinary replacement has no cooldown; rare replacement waits 60 seconds. Every new life receives a persisted random walkable position across the map, not a habitat cluster. Keep pending encounters/reward rolls stable and migrate older slots safely.
- Remove preparation-only world interactions; party, inventory and build editing remain available in Loadout. Keep story Keepers, discoveries and battle NPCs.
- Correct sprite orientation for trainer, followers and wild creatures; preserve animation transforms and labels.
- Add an original painted rectangular bridge surface sprite, aligned with the actual walkable crossing. Built-in image generation only; no local bitmap editing.
- Allocate exactly 100 species into the requested families and a documented remainder. Keep stable species/individual/skill IDs and combat tuning; change prototype anatomy/name where needed for honest classification.

Validation: map quotas, valid/reachable dispersed coordinates, immediate/60s respawns, stable reload/migration/encounters/loot, no world build services, left/right DOM and visual checks, bridge loading/crossing, exact family counts, rules regression and current reference export. Commercial art acceptance is still a human gate.
