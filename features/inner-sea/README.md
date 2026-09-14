# Inner Sea scene and local earned decorations

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-reference**. Displays owned companions and earned decorations; profile saves the layout and the renderer exports a local picture.

## Entry and responsibility

`BondHaven.clean / valid / available; BondInnerSea.draw / edit / exportPicture; BondProfile.setHaven`

One fixed scene, three owned decoration sockets, two individual display slots and two free skies. Existing progress facts unlock three local decorations. Draft cancel is nonmutating; profile validates critical writes. PNG export reuses the canvas and contains no account identity. No paid grants, cloud ownership, AFK output or final-art approval.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [inner-sea-rules.js](<../../inner-sea-rules.js>) | `BondHaven` |
| [inner-sea.js](<../../inner-sea.js>) | `BondInnerSea` |
| [inner-sea.css](<../../inner-sea.css>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [animation](<../../features/animation/README.md>), [experience](<../../features/experience/README.md>), [opening](<../../features/opening/README.md>), [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>), [shell](<../../features/shell/README.md>)
- Used by: [party](<../../features/party/README.md>), [persistence](<../../features/persistence/README.md>)

- [haven-layout](<../../docs/architecture/CONNECTIONS.md#haven-layout>) (inner-sea → persistence): Progress facts determine decoration availability; owned individual IDs and three sockets validate before a critical profile write. Draft/export never consume items or change combat.

## Diagnose here

- Wrong displayed companion, lost decoration or failed picture export: Check draft versus profile.haven, eligibility and canvas readiness before changing profile data. First owner: [inner-sea](<../../features/inner-sea/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/experience_check.py --browser chrome` — Preferences/audio lifecycle, owned scene drafting/persistence, PNG export and responsive input.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [features/inner-sea/DISPLAY.md](<../../features/inner-sea/DISPLAY.md>)
- Commercial cards: [F-031](<../../FEATURE_BACKLOG.md>), [F-032](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-01](<../../OWNER_REVIEWS.md#or-01>), [OR-06](<../../OWNER_REVIEWS.md#or-06>), [OR-08](<../../OWNER_REVIEWS.md#or-08>), [OR-09](<../../OWNER_REVIEWS.md#or-09>), [OR-10](<../../OWNER_REVIEWS.md#or-10>) Use the live board/preflight for status, not an approval copied here.
