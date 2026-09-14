# Accounts, authoritative economy and real group sessions

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **planned**. Planned account and server authority; will own multiplayer, profiles and accepted rewards.

## Entry and responsibility

`Future server commands / room lifecycle / transactional ledger`

No backend exists. Server must own auth, encounter validation, spawn lives, revisions and idempotent rewards. Never trust prototype saves as currency/essence authority. Shared deterministic smoke is only a prerequisite.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| No runtime implementation | Planned boundary; do not claim it exists. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: None observed.
- Used by: None observed.

No explicit cross-feature connection recorded; check the observed dependencies above.

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

No implemented test suite yet. Define service/acceptance tests with implementation.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [docs/ENGINEERING.md](<../../docs/ENGINEERING.md>)
- Commercial cards: [F-037](<../../FEATURE_BACKLOG.md>), [F-038](<../../FEATURE_BACKLOG.md>), [F-039](<../../FEATURE_BACKLOG.md>), [F-040](<../../FEATURE_BACKLOG.md>), [F-041](<../../FEATURE_BACKLOG.md>), [F-045](<../../FEATURE_BACKLOG.md>), [F-061](<../../FEATURE_BACKLOG.md>), [F-063](<../../FEATURE_BACKLOG.md>), [F-065](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-08](<../../OWNER_REVIEWS.md#or-08>), [OR-10](<../../OWNER_REVIEWS.md#or-10>), [OR-11](<../../OWNER_REVIEWS.md#or-11>) Use the live board/preflight for status, not an approval copied here.
