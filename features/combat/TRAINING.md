# Dummy test

Inner Sea → Party → Dummy test starts a 30-second local simulation of the selected
trainer and companions. `training.js` owns deterministic setup, pressure and rate
calculation; `game.js` supplies ordinary targeting, movement, skills and damage.
`training-view.js` displays the totals and individual rows. `app.js` owns controls
and keeps this battle outside encounter reservation and settlement.

The stationary, neutral dummy has no armor, regeneration or attacks. Optional
incoming damage applies a pulse every two simulation seconds to each party member.
Pulses use ordinary damage/shield resolution and cannot reduce actors below 1 HP.
Every selected actor starts at full health. The simulation neither reads saved
injuries into combat nor writes wounds, XP, drops or prepared-item consumption.
Training cannot replace a reserved adventure or accept roaming joiners.

DPS counts damage dealt; healing per second counts HP restored by healing skills;
shield per second counts protection added by the granting actor. Refreshing a
shield counts only its capacity increase. Passive HP regeneration is excluded
from healing throughput. Rates divide by elapsed simulation time, include travel
time and return zero at time zero. Party totals equal the sum of individual rows.
The dummy test ends at 30 seconds, without ordinary overtime or victory rewards.
Pause and playback speed use the normal clock; End test permits a shorter sample.

`tests/player_experience_check.py` checks these rates, shield refreshes, pressure,
save isolation, party navigation, narrow viewports and NPC victory transitions.
Physical-device acceptance remains under OR-06; a browser viewport is not device
performance certification.
