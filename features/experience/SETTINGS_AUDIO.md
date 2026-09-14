# Preferences and audio

Settings is available in the top bar on every main screen. Device preferences
live under `bond-bolt-settings-v1`, with a separate `-sandbox` key in test mode.
They never enter the combat snapshot, change gameplay or grant progress.

## Settings contract

Master/music/effects levels are integers 0–100; mute defaults on. Quiet FX,
reduced motion, camera shake and impact flashes persist. The operating system's
reduced-motion preference always wins over an unchecked in-game option. Quiet FX
and the battle shortcut use the same value. Storage failure keeps the current
session usable and displays a warning. Native dialogs contain focus; closing
Settings returns to its opener. Save export downloads only the current local
profile after a click; no upload, account-data export or cloud restore is implied.

`settings.js` owns validation and DOM classes; `combat-view.js` and `region.js`
read those preferences. `experience.css` suppresses CSS motion while preserving
status text, telegraphs, HP and item notifications. Preferences do not pause a
fight merely because the Settings dialog is open.

## Playback contract

`audio.js` owns one lazily unlocked AudioContext and master/music/effects buses.
Sound starts after an unmute/user gesture. Three original 16-second loops are
loaded only on demand: exploration, combat, Inner Sea. Scene changes crossfade;
old sources disconnect when ended. At most eight short effect voices are active,
with a 40ms admission interval. Impact cues arrive through CombatView's displayed
contact timeline, not by moving the simulation's damage event.

Browser hidden and explicit battle pause stop sources and suspend audio. Main
screen changes select their own music; background combat still runs. Returning
restarts the selected loop, not an accumulating copy. Mute clears sources. Failed
music loading leaves effects usable and can retry after another interaction.
No essential warning is audio-only. `BondAudio.inspect()` is diagnostic state,
not telemetry. The procedural cue set is a reference sound design, not owner
acceptance of final music/mix quality.

## Reproduce and verify

`python scripts/audio_assets.py --check` proves loops match the original scores.
Without `--check`, it regenerates those three assets. No outside samples or
recordings are used. Provenance: [audio assets](../../assets/audio/README.md).

`python tests/experience_check.py --browser chrome` checks settings persistence,
gesture unlock, mute cleanup, dialog focus, local exports and responsive controls.
Physical speaker/headphone, assistive-technology and supported-device acceptance
remain owner/tester work under OR-04/OR-06; automated checks cannot approve them.
