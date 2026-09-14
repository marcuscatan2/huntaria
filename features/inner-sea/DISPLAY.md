# Inner Sea farm presentation and decoration

[Farm scope](FARM_SCOPE.md) owns training, habitat assignment, strongest-species
power, daily defense, upgrades, repairs and next equipment work.

`inner-sea.js` renders the farm, trainer and one highest-level resident per
habitat using `BondFarmView.paint` and the supplied creature portraits. The
canvas also supplies local PNG export without identity or remote uploads.
Habitat residents are automatic; ties retain the first saved individual.

`profile.haven` retains the original three decorative sockets, Dawn/Dusk style
and two legacy selected IDs without rewriting old saves. The retired manual
display selectors are no longer shown. Decorations remain earned from the first
hunt, first summon and three landmarks. Paid ownership is not implemented.
Arrange scene creates a draft, Save commits, and Cancel/Escape discards it.
Decorations have no gameplay effects; farm progression is separately persisted
under `profile.farm` and administered only by profile commands.

The portrait cache holds at most eight entries. Render tokens reject stale
asynchronous draws, and missing assets prevent a blank image download. Farm
controls show cleanliness, exact next attack time, moon phase, habitat levels,
resources and five independent defense slots. The last-defense dialog plays
saved events with scrubbing/pause; it does not rerun reward settlement.

Run `python tests/experience_check.py --browser chrome` for decoration,
settings, cancel/reload, export and responsive controls. Run
`python tests/farm_classes_check.py --browser chrome` for farm commands,
progression, defenses, replay and save failures. Final visual acceptance and
server-owned state remain separate release requirements.
