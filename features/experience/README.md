# Device preferences, accessibility and audio

Generated from [architecture.json](<../../docs/architecture.json>); edit that source, then `python scripts/project.py map --write`.
[All features](<../../FEATURE_MAP.md>) · [Workflow](<../../AGENTS.md>)

Status: **local-reference**. Owns sound and device settings; connects presentation preferences and combat-impact cues without changing rules.

## Entry and responsibility

`BondSettings.set / reduced / open; BondAudio.scene / impact / inspect`

Owns local device preferences and lazy gesture-unlocked audio, never gameplay. Three original loops and a procedural cue bank use separate volume buses; pause/hidden/mute stop sources. Combat and exploration consume persisted motion/FX flags. Local save export is a user-requested download, not cloud recovery or authenticated data export.

These are ownership containers, not duplicate runtime implementations.
The links below point to the actual source; root browser paths remain in use.

## Implementation

| File | Observed exports / role |
| --- | --- |
| [settings.js](<../../settings.js>) | `BondSettings` |
| [audio.js](<../../audio.js>) | `BondAudio` |
| [experience.css](<../../experience.css>) | Owned source/configuration; inspect before editing. |
| [scripts/audio_assets.py](<../../scripts/audio_assets.py>) | Owned source/configuration; inspect before editing. |

## Connections

Observed references include optional and late callbacks, not only boot dependencies.

- Uses: [persistence](<../../features/persistence/README.md>)
- Used by: [animation](<../../features/animation/README.md>), [collection](<../../features/collection/README.md>), [exploration](<../../features/exploration/README.md>), [inner-sea](<../../features/inner-sea/README.md>), [party](<../../features/party/README.md>), [shell](<../../features/shell/README.md>)

- [device-presentation](<../../docs/architecture/CONNECTIONS.md#device-presentation>) (experience → animation): Settings changes invalidate visual preferences only; CombatView sends contact-timed cues. Device preference storage cannot alter battle/profile authority.

## Diagnose here

- Sound stuck, duplicate music, settings not retained: Inspect BondAudio lifecycle and BondSettings state; verify impact and scene callers. First owner: [experience](<../../features/experience/README.md>).

## Validate

Commands run from the project root. Use disposable saves. These suites
cover this feature and shared boundaries; they are not isolated unit tests.

- `python tests/experience_check.py --browser chrome` — Preferences/audio lifecycle, owned scene drafting/persistence, PNG export and responsive input.
- `python tests/architecture_browser.py --browser chrome` — Boot globals, DOM-free rules, deterministic replay and view/model isolation.

For a cross-feature change, run `python scripts/project.py verify --browser chrome`; see [validation setup and limits](<../../features/delivery/OPERATIONS.md>).

## Specifications and decisions

- [features/experience/SETTINGS_AUDIO.md](<../../features/experience/SETTINGS_AUDIO.md>)
- [assets/audio/README.md](<../../assets/audio/README.md>)
- Art and provenance: [assets/audio](<../../assets/audio>)
- Commercial cards: [F-028](<../../FEATURE_BACKLOG.md>), [F-030](<../../FEATURE_BACKLOG.md>)
- Owner review routes: [OR-04](<../../OWNER_REVIEWS.md#or-04>), [OR-06](<../../OWNER_REVIEWS.md#or-06>), [OR-09](<../../OWNER_REVIEWS.md#or-09>) Use the live board/preflight for status, not an approval copied here.
