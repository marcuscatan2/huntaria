# Engineering and growth contract

## Architecture decision

Keep the working dependency-free browser client and deterministic simulation.
Make ownership/connections checkable before moving files or choosing a framework.
This is a **modular local prototype**, not a scalable server. `profile.js`,
`app.js` and `region.js` remain integration hotspots, not isolated services.

Use README as a light router, FEATURE_MAP as a compact index, and
features/<owner>/README.md as the local contract/source/test entry. These are
ownership containers; existing browser modules remain at their working root
paths. No duplicate implementations or new framework are introduced merely
to change directory appearance.

`project.py context` resolves a feature, owned path, exported global, F-### card
or connection; `impact` expands transitive affected consumers. Read the selected
feature's actual source before following its boundary. The complete observed
graph lives in docs/architecture/MODULE_GRAPH.md, not the root README.

Extract a hotspot when a change gives it
an independently testable responsibility. A module move must update HTML, CSS
URLs, tests, tools, script ordering and ownership together; regenerate runtime
evidence. Never keep duplicate implementations or compatibility facades without
named consumers and a removal condition.

## Feature and bug workflow

Owner decision timing is maintained in [OWNER_REVIEWS](../OWNER_REVIEWS.md).
Select the honest work milestone and run its preflight before dependent
production. Missing approvals block only that commitment, not tests, review
packets or reversible prototypes. At handoff report Needs you now, Coming next
and Safe to defer; avoid repeating unchanged lists. Artifact hashes detect stale
evidence, while semantic changes also require reopening the affected decision.
Gates complement existing G0–G5; they cannot authenticate consent or enforce
remote deployments. Never turn automated checks into owner approval.

1. Route with `project.py context` and read one feature guide; use `impact` for
   affected consumers. Detailed operation/setup instructions live in
   [delivery](../features/delivery/OPERATIONS.md); save rules in
   [persistence](../features/persistence/SAVES.md).
2. Define inputs, outputs, state owner and failure behavior; link acceptance IDs.
3. Reproduce in a disposable save and keep a small regression.
4. Change rules or presentation in the owning layer, not both by default.
5. Verify connections: replay/settlement for combat; combat and exploration for
   shared rigs; migrations/receipts for profile changes.
6. Update the architecture manifest and regenerate the index and feature guides
   if facts changed. Put deeper detail beside the relevant feature guide.
   Review README; record significant decisions here, not a task transcript.
7. Run `project.py check`, affected suites, and the full gate for integration work.
   Report real test evidence and unverified external gates.

UI selection/camera/modal state is not authority. Battle state is not a receipt.
Only accepted profile operations mutate local inventory/progress. Do not use DOM
events as an untyped gameplay command bus: existing `bond-profile`, `bond-growth`
and `bond-art-ready` events invalidate views; consumers reread current state.
Use operation results/receipts to determine whether a command succeeded.

Echo qualification is deterministic, but `echoes.js` also provides local
spawn-roll entropy (Web Crypto with an offline Math.random fallback). That module
is not classified as a pure combat rule. Profile persists each roll before use;
a future authoritative service must supply and own its own randomness.

## Reproducible validation

`requirements-dev.txt` pins browser automation. A virtual environment is
recommended; the old temporary installation is a fallback, not the required
setup. The game itself has no runtime package dependency.

- `python scripts/project.py doctor`: inspect Python, dependencies, browsers and
  Git; never installs/downloads anything.
- `python scripts/project.py check`: standard-library structural checks and
  negative tests of the checker itself.
- `python scripts/project.py verify --browser chrome`: current full gate.
  Edge uses `--browser edge`; every child failure stops the command.
- Browser tests host an ephemeral loopback server and use fresh contexts. They
  never reuse an interactive server or personal Chrome/Edge profile.
- Reports go to tests/artifacts. Historical reports cannot certify changed
  source. Current suites hash their runtime inputs.
- GitHub Actions configuration is provided, but **CI is not running until this
  project is in a repository with Actions enabled**. It uses Linux Chromium;
  local Chrome/Edge and owner device checks remain separate.

Do not run retired capture/contract/pass assertions as current rules. Current
test routing lives in the manifest. The browser boundary test checks that the
simulation works without document/storage/network, and presentation preserves
simulation results. Static checks are deliberately narrower than a JS parser.

## Content updates

1. Edit runtime definitions in their content/world/tuning modules.
2. Run `python tests/pass18_check.py --browser chrome` for a current export.
3. Review the intended data changes. Run
   `python scripts/refresh_pass18_reference.py` only when those updates are
   authorized; inspect its JSON diff.
4. Run `python scripts/creature_reference.py --write --check` to publish tables.
5. Run the full gate. Label test tuning separately from release proposals.

The owner-maintained Bond & Bolt Google Sheet is the external creature-design
source of truth. It is deliberately not a live browser dependency: import only a
reviewed revision into versioned local data/runtime modules, preserve Stable IDs,
record the revision/fingerprint in `data/monster-roster.json`, regenerate derived
tables and run the full gate. Sheet ideas still require implementation and tests.
Do not tune live odds by changing only generated tables. The retained opening
Lv2/Lv3/Lv5 starters are an explicit local override.

## Version control, backups and assets

`.gitignore` excludes environments, secrets, exported saves and test artifacts,
not source artwork or reviewed data. `.gitattributes` normalizes text and marks
binary assets. Keep a single repository rooted at this game folder, **not the
parent business workspace**. Use a private remote when authorized and small
task commits. Confirm the intended author identity before using inherited work
credentials. These tools never configure a remote or public sharing.

```powershell
python scripts/project.py backup
```

Use Git commits as routine source checkpoints. Push to the authorized remote
when requested for an off-device copy; uncommitted files are outside Git history.
Do not create routine ZIP archives. Both `backup/` and `backups/` stay ignored.

Only on explicit owner request, this command creates a unique source/art/document ZIP in backups, checks CRCs and embedded
per-file SHA-256 hashes, and never overwrites an archive. Excludes its own output,
Git internals, environments, obvious secrets and generated test artifacts.
A local checkpoint is not off-device disaster recovery. Export player saves
separately; preserve Google Sheets separately. Keep art provenance with sources.
Use LFS/object storage only when asset history warrants the added complexity.

Optional guard after repository initialization:
`git config --local core.hooksPath .githooks`. The pre-commit hook runs check.
Hooks are bypassable and inspect the working tree, not a proof of the staged
patch; clean CI is the merge gate. Neither replaces semantic review.

## Path to a small commercial service — planned, not implemented

Start with one modular authoritative backend and a transactional database, not
microservices. Reuse the deterministic engine through a tested headless boundary;
keep presentation client-side. Select providers after measuring concurrency,
cost and shared-engine compatibility, not before. None is chosen/purchased here.
Commercial acceptance IDs remain in FEATURE_BACKLOG.

| Boundary | Required before online release | Growth lever / validation |
| --- | --- | --- |
| Identity | Managed auth, guest upgrade, recovery, per-command authorization | Abuse limits and concurrent sessions; never trust client owner IDs |
| Profiles | Versioned schemas/migrations, revision checks, atomic writes | Account/individual indexes; conflict/retry/rollback tests |
| Encounters | Server reserves map life, seed, party and rules version | Bounded rooms/queues; replay, reconnect, timeout tests |
| Rewards | Idempotency keys, unique receipts, atomic kill/XP/Echo ledger | Concurrent/repeated/reordered commands; rare-reward reconciliation |
| Groups | Server-owned membership, readiness and disconnect policy | Room admission limits; queue latency and simulation duration |
| World | Explicit map-instance policy; client culling is not server spawning | Profile hotspots, partition active rooms only when measured |
| Assets | Versioned CDN build, provenance, failed-load fallback | Payload/texture budgets and actual low-end device tests |
| Purchases | Hosted checkout, verified events, cosmetics-only entitlements | Deduplication, refunds, support; no gameplay stat effects |
| Operations | Environment isolation, external secrets, alerts and kill switches | Load/soak, restore drill, staged rollout and rollback |
| Cost/privacy | Retention rules, bounded logs, minimal analytics, spending alerts | Cost per player/room; no raw profiles/tokens in logs |

Prototype saves are editable: **never trust their currency, rare drops or paid
entitlements on a future server**. Decide migration policy before accounts
launch. Version encounter rules so patches cannot silently change reserved
fights during replay. Local receipt checks are not anti-cheat or transactions.

Before raising caps measure p95 command/room latency, error rate, DB contention,
room memory and egress cost, then test failures/restores. Derive admission limits
and operating budgets from evidence. Local assertion counts do not certify
capacity, Safari/mobile, final art, payment safety or commercial readiness.

## Documentation quality gate

README routes (max600 words); FEATURE_MAP indexes features/symptoms (max1300).
Feature READMEs explain local ownership, entrypoints, connections, specs and
tests. Detailed manual documents live beside the owning guide and are registered
in its docs list. docs/architecture.json is the single maintained routing source;
`project.py map --write` regenerates the registered feature guides, the compact map,
connection contracts and observed module graph. No duplicate balance tables
or test definitions belong in these generated outputs.

The documentation check catches stale generated guides, missing routes, broken
local links, oversized root guides and invalid interface ownership. Mutation
tests exercise those failures and focused context lookup. The manual container
guides route scripts/tests/assets/data/docs without requiring a whole-repo read.
Normal rg searches exclude generated artifacts, backups and the scope-v1 archive;
use an explicit path or `rg --no-ignore` for deliberate evidence/history work.

File/global/event references are observed from code; intent is reviewed text.
The lexical scanner detects many mistakes but is not proof of all dependencies.
If the project adopts a new module style, extend the checks rather than bypassing
them. No automatic timestamps, diaries, redundant balance tables or copied pass
history belong in these two entry documents.
