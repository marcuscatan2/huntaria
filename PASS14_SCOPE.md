# Pass 14 — quicker hunting, individual companions, commercial design

User request: implement immediate region return + reward popup, allow independent
same-species companions, replace party dropdowns with a visual picker; plan the
commercial world and every creature in detail.

Implementation: one agent, no external spend/deployment. Upgrade local profile
v6 -> v7 without overwriting the source save. Stable companion IDs own XP, three
active priorities, and tree ranks. Two different individuals of the same species
may occupy both party slots; the same individual cannot occupy both. Old species
progress migrates to one individual; existing duplicates of Echo items remain.

Successful wild/pack/boss creature encounters return immediately to exploration
and show drops, including no-Echo outcomes and pending-save retry. Trainer duels
retain their existing result screen. No auto-return in the middle of a pack.

Design deliverables (planning, not final art production): WORLD_DESIGN.md,
CREATURE_DESIGN.md and a maintained 100-row creature reference with live stats,
habitats, live loot and separately labeled proposed loot/design. No promises of
commercial success; require measurable player tests and approved reference art.
Do not import the attached reference's large-MMO budgets or proprietary-engine
assumptions into this small browser project.

Verify migration, individual XP/trees/skills, duplicate summoning/idempotency,
same-species pair combat, visual picker/search/empty/swap/focus, immediate return,
no-drop and failed-save popup, persisted loot, mobile layouts and 100-row data
integrity. Keep account buffs/evolution stashed.
