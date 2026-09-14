# Shared-runtime probe

`data/simulator-modules.json` lists the same content/rule sources loaded by
the browser and the offline Node probe. World layout precedes campaign data
because authored encounter locations depend on it. No copied damage engine or
second balance table exists.

`scripts/simulator.cjs` loads those files into an isolated Node VM without DOM,
storage, network globals or unseeded randomness/wall-clock reads. It is a
development probe, not an HTTP server, security boundary or authoritative room.
`tests/runtime_cases.js` generates 1,000 seeded fixtures at levels1/5/20/60/100,
with different species, skill orders, partial parties, wild/pack encounters,
thirteen-actor bosses and escape commands. Browser and Node compare canonical
unit state, ordered events, ticks and outcomes by SHA-256.

Run `python tests/runtime_check.py --browser chrome` (or `edge`). The test uses
`BOND_NODE`, then installed Node, then the existing Playwright driver Node. It
never downloads a runtime or opens a game server. Reports include the actual
Node version, rule hashes, p95/max replay time and average-per-tick group time.
Timing uses elapsed time around each replay, so competing workloads affect it.
Run this probe without other automated browser suites for comparable timings;
retain failed measurements instead of treating parity as a performance pass.

The local replay target is p95 below 200ms. A per-fight average tick cost does
not prove 50ms scheduled host deadlines, 30% room headroom, network latency,
database throughput or any player-capacity claim. Those require the actual
deployment runtime and real clients after OR-08/OR-11. This probe resolves an
early compatibility risk without choosing a provider or trusting local rewards.
