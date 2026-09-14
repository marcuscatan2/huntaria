# Local save contract

[Feature owner and commands](README.md).

Profile: `bond-bolt-profile-v7`. Loadout: `bond-bolt-build-v4`.
QA adds `-sandbox`. Older keys are migration inputs, not disposable clutter.
Storage is scoped to browser origin; a different host/port has different progress.

Use **Settings → Download save backup** (also available in Explore) for a local
profile backup. It does not include the separate practice/loadout or device
preferences keys. Import UI is not
implemented. Project ZIPs/Git do not capture browser storage or Google Sheets.
Tests must use fresh contexts and never open/reset a personal browser profile.

## Identity and writes

All required rule/content globals must be present before profile initialization.
A failed script download must not be treated as a corrupt save: startup aborts
before normalization/writes and exposes Reload. Packaged-browser tests block
combat, growth, campaign and roster modules with a real active-fight save plus
a benched expanded-roster individual and check byte-for-byte preservation.

`haven` is an additive version1 layout in the v7 profile. It stores two display
individual IDs, three earned-decoration slots and a sky; validation and critical
write behavior are in [Inner Sea](../inner-sea/DISPLAY.md). No new cloud schema
or paid entitlements are implied. Audio/visual device preferences use their own
`bond-bolt-settings-v1` key and never modify this profile.

Profile v7 now has an additive character record. Fresh profiles store null until
creation succeeds; older saves without the field normalize to a legacy marker.
An unnamed legacy marker or literal `Apprentice` placeholder opens a one-time
name-only screen. Its atomic `nameCharacter` write changes only the display name;
it preserves any created appearance/weapon as well as the
existing class, companions, XP, inventory, world position, health, receipts and
reserved encounter. Legacy profiles are not reset or forced into the new
apprentice opening.

Species ID chooses shared content/art. Individual ID chooses ownership, XP,
skills and passive ranks. Spawn-life ID identifies one encounter incarnation;
receipt/request IDs deduplicate its accepted operations. Keep these identities
distinct and stable through renames, retries and migrations.

Owned individuals have a hard launch cap of Lv60 (177,000 active XP), while the
engine and wild-source curve remain defined through Lv100. Normalization moves
legacy active XP above the launch cap into additive `deferredXP` instead of
deleting it. Summoning a Lv61–100 Echo creates a Lv60 individual and records the
original value in `sourceLevel`. Neither field currently grants combat power;
they preserve migration/provenance for a later explicit cap patch.

`BondProfile.snapshot()` is a clone, not write authority. Call the relevant
profile command and handle its documented false/pending/result return.
UI refresh and loot popups are not receipts. Persisted encounter inputs and
accepted rewards must survive reload/replay without rerolling or duplicate grants.

`profile.js` owns the local profile document; `app.js` writes the separate
loadout key and `region.js` writes display preferences. No new storage writer
without an explicit reviewed authority boundary and regression.

## Migration and future authority

Additive apprenticeXP stores up to1000 hunting XP (Lv5) for created apprentices.
Missing fields normalize to0; legacy profiles keep companion-only leveling.
Accepted wild kill receipts contain trainerXP; retries/reloads never pay twice.
No phantom companion is created. Earned XP and injuries are independent.

Explore and Loadout only change views; active fights continue with their original
build. Run persists a request before starting the three-second retreat. Escape
checkpoints injuries and accepted kills before releasing the reservation; it
does not grant victory rewards, rescue or healing. Ended fights settle first,
including defeat rescue. Critical
save failures retain the reservation. Browser-hidden, Pause and reload preserve
resumable encounters; there is no offline simulation.

Additive encounterSave.anchor stores map, trainer position and actor positions.
encounterSave.joins stores enemy entries and insertion ticks; initial options stay
unchanged. joinBattle reserves the exact live spawn before simulator insertion.
restoreBattle replays joins at their recorded ticks. NPC and joined-wild rewards
settle separately with existing receipt/claim deduplication. Older saves without
anchors use their existing position; no profile reset is required.

Optional encounterSave.escape stores the request tick and count of joins already
accepted at that tick. Replay inserts it in the same order relative to joined
enemies. Checkpointing/reloading cannot shorten the remaining escape window.
Older encounters without this additive field keep their normal behavior.

Firstlight (`clearing-0`) adventure defeats record `campRecovery: true` on the
accepted result, return to BondOpening.start and restore all owned vitality.
Other maps keep injured regional-town rescue. Rest uses the same proximity-checked
command for the forest camp and town sanctuaries; normal-play victories never
auto-heal. Isolated `?test=1` adventure victories and defeats recover the entire
owned party after accepted settlement; successful escapes retain injuries.
Saved residents outside Firstlight's difficulty bands relocate without changing
their life/seed/loot roll. Reserved lives remain frozen until settlement/abandonment.
No profile version reset or character recreation is required for this change.

Only `?test=1` exposes `BondProfile.testing.restart()` and `heal()`. Restart
atomically replaces the sandbox profile with fresh state, then invalidates the
old combat view and reopens creation. It clears active tickets only after the
write is accepted. Heal only changes saved vitality and revision, restores all
owned individuals, and rejects uncreated profiles or reserved encounters.
Neither command writes normal/migration keys or consumes supplies/currency.
Their visible controls are described in [delivery operations](../delivery/OPERATIONS.md#test-controls).
The QA shell also calls `heal()` after accepted non-escape adventure settlement;
normal storage keys and combat receipts remain unchanged.

Preserve individual XP/skills/trees, inventory, positions, vitality, reservations
and receipts. Normalize legacy fixtures in disposable tests. Never silently
reset a corrupt/old save to make validation green.

Local save data is editable and local receipts are not server anti-cheat.
A future server must own accepted rewards and migration policy; see
[online boundary](../online/README.md). Do not import local rare loot/currency
as trusted online wealth.
