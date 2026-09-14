# Retired capture and expedition compatibility

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **retired**. Retains retired capture compatibility; do not treat it as an active acquisition system.

## Entry and responsibility

`Bonding no-op facade; unloaded BondWild / BondExpeditionData`

bonding.js remains a no-op for app callers. wild-data.js and expedition-data.js are not loaded by the game. Old papyrus items are keepsakes. Do not revive old capture tests/mechanics accidentally.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [bonding.js](<../../bonding.js>) | `Bonding` |
| [bonding.css](<../../bonding.css>) | Owned source/configuration; inspect before editing. |
| [wild-data.js](<../../wild-data.js>) | `BondWild` |
| [expedition-data.js](<../../expedition-data.js>) | `BondExpeditionData` |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [content](<../../features/content/README.md>), [world](<../../features/world/README.md>)
- Used by: [shell](<../../features/shell/README.md>)

No explicit cross-feature connection recorded; check the observed dependencies above.

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [Game notes.md](<../../Game notes.md>)
- Commercial cards: Cross-cutting implementation; no separate acceptance card.
- Owner review routes: Shared release policy applies. Use the live board/preflight for status, not an approval copied here.
