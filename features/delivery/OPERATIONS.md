# Local development and validation

[Feature owner](README.md) · [Architecture policy](../../docs/ENGINEERING.md)

Commands run from the project root. The browser game uses local JS/CSS and
assets; no runtime npm package, bundler or build step is required.

## Start and troubleshoot

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Keep this terminal running; use another for checks. Open
[normal play](http://127.0.0.1:8765/) or [QA](http://127.0.0.1:8765/?test=1).
Connection refused means the server is not listening; check the terminal/process,
not the save. Hard-refresh after source changes. Storage is origin-specific:
changing the port/host does not move progress.

QA uses sandbox storage keys, not the normal save. Browser automation additionally
uses disposable contexts and an ephemeral loopback server. Never point tests
at a personal browser profile. [Save rules](../persistence/SAVES.md).

## Test controls

In `?test=1`, the visible **TEST MODE** bar above the tabs contains:

- **3× travel**: exploration movement uses three times the normal base speed
  (+200%). It does not change collision, routes, encounters or saved positions.
- **Automatic recovery**: every settled adventure victory or defeat restores the
  trainer and all owned companions. A successful Run keeps its injuries because
  it is an escape, not a completed fight.
- **5× combat**: appears beside the normal 1× and 2× playback controls. It advances
  the same deterministic simulation faster; rules, rewards and saved encounter
  inputs are unchanged.
- **Restart progress**: confirms before clearing the isolated character,
  companions, levels, inventory, coins and active encounter, then reopens
  character creation. This test progress cannot be recovered from the button.
- **Heal party**: restores the trainer and every owned companion, including
  fallen or unequipped ones, for free anywhere between encounters. No items,
  coins, XP or location changes. Disabled while an encounter is reserved.

The visible shortcuts work across the exploration/loadout/battle tabs. Normal
play keeps standard movement, 1×/2× playback and intended recovery pacing; it
exposes neither this bar nor the testing command object. Historical migration
saves remain untouched. Echo grants stay in the collapsed QA tools.

`test-controls.js` owns the QA UI, `region.js` owns the effective travel rate,
and `app.js` owns playback and post-settlement recovery.
`BondProfile.testing.restart / heal` owns saved mutations. Critical storage
failures keep existing progress and show an error. The opening browser suite
covers the buttons and rates, recovery, cancellation, failure, reload,
active-encounter restrictions, narrow layouts and normal-mode isolation.

## Environment

Python 3.12+; structural checks use the standard library.
Inspect, without installing, using `python scripts/project.py doctor`.

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-dev.txt
.venv\Scripts\python scripts/project.py verify --browser chrome
```

Installed Chrome/Edge work on Windows. For Linux CI, install test Chromium with
`python -m playwright install --with-deps chromium` and set
`BOND_USE_BUNDLED_CHROMIUM=1`. These are test dependencies, not game dependencies.
CI configuration exists; it does not imply a configured remote or running CI.

Pillow is development-only for pixel-identical scenery export checks. Node parity
uses an installed Node (`BOND_NODE` override) or the runtime already bundled with
Playwright. No separate game dependency is installed. Optional immutable local
packages are documented in [CLIENT_BUILD.md](CLIENT_BUILD.md).

## Choose the smallest useful context

```powershell
python scripts/project.py context animation
python scripts/project.py context character-rig.js
python scripts/project.py context combat-feedback
python scripts/project.py impact character-rig.js
```

`context` resolves an exact feature, owned path, global, acceptance card or
connection. It returns the guide, entrypoints, source and relevant tests.
`impact` follows conservative transitive consumers for change validation.
Neither proves all dynamic dependencies or imports an entire feature into context.
Search the returned files first: `rg -n "pose|trigger" character-rig.js combat-view.js`.
Use `context --list` or the [symptom index](../../FEATURE_MAP.md#symptoms) if unsure.

## Gates and completion

```powershell
python scripts/project.py reviews
python scripts/project.py reviews --work creature-production --species emberfox --enforce
python scripts/project.py check
python scripts/project.py verify --browser chrome
```

Choose the honest review milestone; this example does not authorize production.
Pending owner gates block dependent commitments, not diagnostics/prototypes.
`check` checks ownership, deterministic/storage boundaries, routing freshness,
local links, entry-document size, tooling regressions and scope integrity.
`verify` adds current browser boundary, mechanics, played UI, campaign, opening and
content-reference suites. It stops at failure and never automatically approves
art, accepts commercial criteria or updates reviewed creature data.

Use `--browser edge` for Edge. The reference check consumes a Chrome export, so
the Edge full gate also runs Chrome mechanics. Full suites and current reuse of
older assertions are routed in [tests](../../tests/README.md).

Update the owning manifest contracts and feature-local specifications when
behavior changes. Run `python scripts/project.py map --write` to regenerate all
feature guides, the compact index, connections and observed module graph.
Update owner-decision data only from explicit scoped owner statements, then
`python scripts/project.py reviews --write`. Finish with `project.py check`
and affected browser suites. No cosmetic documentation edits when facts are unchanged.

## Backups, data publication and release

- `python scripts/project.py backup` creates a unique verified source/art ZIP.
  It excludes test artifacts, environments and obvious secrets. It does not
  back up browser storage, Google Sheets or provide off-device recovery.
- [Content publication](../../docs/ENGINEERING.md#content-updates) is
  runtime → current export → reviewed JSON → generated tables; Sheets is a review copy.
- [Git, release and growth policy](../../docs/ENGINEERING.md) owns repository
  setup, authority boundaries and operational requirements. No remote deployment,
  accounts, paid services or credentials are implied by these local commands.
