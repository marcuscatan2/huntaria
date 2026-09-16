# Tooling, quality gates, release and operations

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **partial-tooling**. Owns navigation tooling and checks; routes release, owner-review and operations requirements.

## Entry and responsibility

`scripts/project.py; Git/CI configuration; future operator services`

Local architecture/review tooling, Git source checkpoints, on-request ZIP backups and reproducible immutable client packages exist; packages remain local-preview. No deployment, production auth/payment/telemetry, restored cloud backups, certified capacity or external acceptance. Current remaining-work/decision audit is routed in REMAINING_SCOPE.md. Generated reports, local packages and pass histories stay outside Git; project checks reject tracked ignored files. Browser package tests use disposable temporary output and clean it up after validation.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [scripts/project.py](<../../scripts/project.py>) | Owned source/configuration; inspect before editing. |
| [scripts/review_gates.py](<../../scripts/review_gates.py>) | Owned source/configuration; inspect before editing. |
| [docs/review-gates.json](<../../docs/review-gates.json>) | Owned source/configuration; inspect before editing. |
| [tests/test_review_gates.py](<../../tests/test_review_gates.py>) | Owned source/configuration; inspect before editing. |
| [tests/test_project_tools.py](<../../tests/test_project_tools.py>) | Owned source/configuration; inspect before editing. |
| [tests/architecture_browser.py](<../../tests/architecture_browser.py>) | Owned source/configuration; inspect before editing. |
| [tests/browser_check.py](<../../tests/browser_check.py>) | Owned source/configuration; inspect before editing. |
| [docs/architecture.json](<../../docs/architecture.json>) | Owned source/configuration; inspect before editing. |
| [requirements-dev.txt](<../../requirements-dev.txt>) | Owned source/configuration; inspect before editing. |
| [.gitignore](<../../.gitignore>) | Owned source/configuration; inspect before editing. |
| [.gitattributes](<../../.gitattributes>) | Owned source/configuration; inspect before editing. |
| [.githooks/pre-commit](<../../.githooks/pre-commit>) | Owned source/configuration; inspect before editing. |
| [.github/workflows/validate.yml](<../../.github/workflows/validate.yml>) | Owned source/configuration; inspect before editing. |
| [scripts/navigation.py](<../../scripts/navigation.py>) | Owned source/configuration; inspect before editing. |
| [tests/test_navigation.py](<../../tests/test_navigation.py>) | Owned source/configuration; inspect before editing. |
| [.ignore](<../../.ignore>) | Owned source/configuration; inspect before editing. |
| [tests/opening_check.py](<../../tests/opening_check.py>) | Owned source/configuration; inspect before editing. |
| [tests/onboarding_check.py](<../../tests/onboarding_check.py>) | Owned source/configuration; inspect before editing. |
| [tests/opening_cases.js](<../../tests/opening_cases.js>) | Owned source/configuration; inspect before editing. |
| [tests/field_polish_check.py](<../../tests/field_polish_check.py>) | Owned source/configuration; inspect before editing. |
| [scripts/client_build.py](<../../scripts/client_build.py>) | Owned source/configuration; inspect before editing. |
| [data/client-build.json](<../../data/client-build.json>) | Owned source/configuration; inspect before editing. |
| [tests/client_build_check.py](<../../tests/client_build_check.py>) | Owned source/configuration; inspect before editing. |
| [tests/experience_check.py](<../../tests/experience_check.py>) | Owned source/configuration; inspect before editing. |
| [tests/farm_classes_check.py](<../../tests/farm_classes_check.py>) | Owned source/configuration; inspect before editing. |
| [tests/farm_classes_cases.js](<../../tests/farm_classes_cases.js>) | Owned source/configuration; inspect before editing. |
| [tests/field_encounters_check.py](<../../tests/field_encounters_check.py>) | Owned source/configuration; inspect before editing. |
| [tests/relic_quest_check.py](<../../tests/relic_quest_check.py>) | Owned source/configuration; inspect before editing. |
| [tests/landscapes_check.py](<../../tests/landscapes_check.py>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: None observed.
- Used by: None observed.

No explicit cross-feature connection recorded; check the observed dependencies above.

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python scripts/project.py check` — Ownership, map freshness, links, checker regressions and scope integrity.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.
- `python tests/client_build_check.py --browser chrome` — Allowlisted immutable bundle, file integrity and packaged-browser loading.
- `python tests/farm_classes_check.py --browser chrome` — Four-class acceptance, AFK timing/cleanliness, lunar five-monster defense, repair/loot idempotency, replay and responsive farm controls.
- `python tests/game_frame_check.py --browser chrome` — Shared exploration/preparation bounds, framed Bag summoning and item inspection, painted farm controls, modal focus, responsive layouts and background battle settlement.
- `python tests/relic_quest_check.py --browser chrome` — Four-class guaranteed rescue, saved replay, atomic Echo delivery, ghost party condition, connected tower floors and one-time class weapon reward.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [docs/ENGINEERING.md](<../../docs/ENGINEERING.md>)
- [VALIDATION_PLAN.md](<../../VALIDATION_PLAN.md>)
- [OWNER_REVIEWS.md](<../../OWNER_REVIEWS.md>)
- [features/delivery/OPERATIONS.md](<../../features/delivery/OPERATIONS.md>)
- [features/delivery/CLIENT_BUILD.md](<../../features/delivery/CLIENT_BUILD.md>)
- [features/delivery/REMAINING_SCOPE.md](<../../features/delivery/REMAINING_SCOPE.md>)
- Commercial cards: [F-034](<../../FEATURE_BACKLOG.md>), [F-046](<../../FEATURE_BACKLOG.md>), [F-047](<../../FEATURE_BACKLOG.md>), [F-048](<../../FEATURE_BACKLOG.md>), [F-049](<../../FEATURE_BACKLOG.md>), [F-050](<../../FEATURE_BACKLOG.md>), [F-051](<../../FEATURE_BACKLOG.md>), [F-052](<../../FEATURE_BACKLOG.md>), [F-053](<../../FEATURE_BACKLOG.md>), [F-054](<../../FEATURE_BACKLOG.md>), [F-055](<../../FEATURE_BACKLOG.md>), [F-056](<../../FEATURE_BACKLOG.md>), [F-057](<../../FEATURE_BACKLOG.md>), [F-066](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-09](<../../OWNER_REVIEWS.md#or-09>), [OR-10](<../../OWNER_REVIEWS.md#or-10>), [OR-11](<../../OWNER_REVIEWS.md#or-11>), [OR-12](<../../OWNER_REVIEWS.md#or-12>) Use the live board/preflight for status, not an approval copied here.
