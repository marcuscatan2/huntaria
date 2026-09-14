# Inner Sea cosmetics and payments

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **planned**. Planned cosmetics and payment entitlements; depends on authoritative online services.

## Entry and responsibility

`Future appearance catalog / checkout / verified entitlements`

Cosmetics only; no gameplay advantage. Hosted payments and verified/refundable entitlements require backend authority. Current collection UI is not this feature.

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
- Commercial cards: [F-033](<../../FEATURE_BACKLOG.md>), [F-042](<../../FEATURE_BACKLOG.md>), [F-043](<../../FEATURE_BACKLOG.md>), [F-044](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-10](<../../OWNER_REVIEWS.md#or-10>) Use the live board/preflight for status, not an approval copied here.
