# Documentation routes

Start at the [project router](../README.md) or one [feature guide](../FEATURE_MAP.md).
Do not read all planning/history before a focused fix.

| Need | Authority / route |
| --- | --- |
| Feature ownership, contracts, test routing | [architecture.json](architecture.json); generated [feature index](../FEATURE_MAP.md) and feature folders |
| Cross-feature bug | [Connections](architecture/CONNECTIONS.md); [boot graph](architecture/MODULE_GRAPH.md) only if needed |
| Engineering decisions and growth boundaries | [ENGINEERING.md](ENGINEERING.md) |
| Run, backup, validate | [Delivery operations](../features/delivery/OPERATIONS.md) |
| Owner decision timing and evidence | [OWNER_REVIEWS](../OWNER_REVIEWS.md); source [review-gates.json](review-gates.json) |
| Full launch scope and implementation audit | [Scope](<../Commercial MVP scope.md>) includes one PvP mode, Android/iOS apps, both stores and remaining guideline adaptations; [feature cards](../FEATURE_BACKLOG.md), [traceability](../FEATURE_TRACEABILITY.md), [acceptance](../VALIDATION_PLAN.md) |
| Creature design, data, animation | [Content](../features/content/README.md), [animation](../features/animation/README.md) |
| World design and implementation | [World](../features/world/README.md), [exploration](../features/exploration/README.md) |
| Actual stat formulas | [Companion stats](<../Companion stats.md>) |
| Deferred ideas | [Game notes](<../Game notes.md>); not authorization to implement |
| How to play | [PLAYER_GUIDE](PLAYER_GUIDE.md); current source wins over outdated pass descriptions |
| Previous implementations or superseded plans | Git history; current contracts stay in feature guides |
| Local artifacts and repository cleanup | [Storage policy](../features/delivery/OPERATIONS.md#repository-storage) |

Keep detailed explanations in the owning feature folder or its linked
specification. Existing root specifications retain their paths to preserve
references/evidence; do not duplicate them into another competing source.
Generated catalogs and reports are outputs, not places to edit gameplay.
