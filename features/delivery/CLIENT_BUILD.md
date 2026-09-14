# Reproducible local client package

`python scripts/client_build.py` creates `dist/<content-hash>/`. The same inputs
reuse the same verified immutable directory; changed input produces a new one.
Existing builds are never overwritten or deleted. Nothing is published.

The package is deliberately **local-preview**, not a production deployment.
`data/client-build.json` allowlists HTML scripts/styles and runtime media. The
developer control/reference scripts, test sources, documentation, prompts,
secrets and world source PNGs are excluded. Local profile code remains editable
and cannot be a future online authority. Debug URL handling is not anti-cheat.

`build-info.js` exposes build ID, profile schema and the content/rules digest.
`build-manifest.json` records every shipped file's hash/bytes and cache policy:
revalidate entry/manifest, immutable caching only inside that immutable build
directory. A deployment must implement those headers and switch the complete
versioned path atomically. No service worker, production origin, live schema
migration, active-ticket upgrade or offline-play promise is introduced.

`python scripts/client_build.py --verify dist/<id>` rejects modified, missing or
extra files. It is integrity checking, not an authenticity signature. Do not
serve the business workspace or source repository as a public web root.

## Loading

Hidden preparation menus render only when opened. New character creation does
not first render the old village/legacy trainer. Roster portraits and audio are
loaded on demand, not all100 at startup. The package includes only the active
Druid/Mage/Apprentice trainer sheets; rejected historical `art-v16` candidates
are excluded. Scenery uses lossless pixel-identical
WebP exports; sources remain in their original folders. `world_assets.py --check`
checks those exports. Existing scenery/portrait fallback/retry remains in the
renderer and CharacterRig. First-battle asset readiness under failed networks
and physical device acceptance are still incomplete F-034/F-035 requirements.

The startup notice offers Reload if boot does not finish. Profile loading checks
its required rules modules before reading or normalizing a save, so an incomplete
download cannot be mistaken for corrupt progress. Packaged-browser tests block
essential modules with a saved active hunt and a benched companion, then verify
byte-for-byte preservation and recovery after reloading.

`python tests/client_build_check.py --browser chrome` verifies repeatable output,
tamper/addition rejection and actual packaged creation/scene flows. Its observed
resource bytes are an unthrottled loopback diagnostic, **not** VP-06's physical
10Mbps/100ms first-playable certificate. Reports retain the largest transfers.
No approved permanent-save release, CDN, hosting or deployment rollback is implied.
