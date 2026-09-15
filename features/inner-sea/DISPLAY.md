# Inner Sea farm presentation and decoration

[Farm scope](FARM_SCOPE.md) owns training, habitat assignment, strongest-species
power, daily defense, upgrades, repairs and next equipment work.

`inner-sea.js` renders the farm, trainer and one highest-level resident per
habitat using `BondFarmView.paint` and the supplied creature portraits. The
painted [homestead asset](../../assets/inner-sea/README.md) supplies the cottage,
barn, Haunted cellar, bird roost, insect garden and pond. Presentation coordinates
in `BondFarmView.places` position residents independently of deterministic rules.
The canvas also supplies local PNG export without identity or remote uploads.
Habitat residents are automatic; ties retain the first saved individual.

The Homestead opens [inside the game frame](../party/GAME_FRAME.md). Habitat
labels focus their management cards. A separate care panel scrolls on desktop;
on narrow screens the same controls follow the scene inside the frame. Power,
condition and the next attack's moon phase remain visible. My companions and
Species guide have their own navigation beside Homestead.

`profile.haven` retains the original three decorative sockets, Dawn/Dusk style
and two legacy selected IDs without rewriting old saves. The retired manual
display selectors are no longer shown. Decorations remain earned from the first
hunt, first summon and three landmarks. Paid ownership is not implemented.
Arrange scene creates a draft, Save commits, and Cancel/Escape discards it.
Decorations have no gameplay effects; farm progression is separately persisted
under `profile.farm` and administered only by profile commands.

The portrait cache holds at most eight entries. Render tokens reject stale
asynchronous draws, and missing portraits or scenery prevent a blank image
download. The shared scene loader retries after a failed request. Dawn/Dusk,
damage and dirt are canvas presentation layers shared with the PNG export. Farm
controls show cleanliness, exact next attack time, moon phase, habitat levels,
resources and five independent defense slots. The last-defense dialog plays
saved events with scrubbing/pause; it does not rerun reward settlement.

Run `python tests/experience_check.py --browser chrome` for decoration,
settings, cancel/reload, export and responsive controls. Run
`python tests/farm_classes_check.py --browser chrome` for farm commands,
progression, defenses, replay and save failures. Final visual acceptance and
server-owned state remain separate release requirements.
