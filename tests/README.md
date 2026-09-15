# Test routes

[Delivery operations](../features/delivery/OPERATIONS.md) owns setup.
[Feature index](../FEATURE_MAP.md) routes affected suites; commands run at project root.

| Need | Run / entry |
| --- | --- |
| Structure, routes and documentation | `python scripts/project.py check` |
| Full current browser gate | `python scripts/project.py verify --browser chrome` (or edge) |
| Fresh character and first forest | `python tests/opening_check.py --browser chrome` (or edge) |
| Post-death/withdrawal clicks, starter XP, first Echo and exits | `python tests/onboarding_check.py --browser chrome` |
| Pack previews, cave escape, all-map populations and aggression level boundary | `python tests/field_encounters_check.py --browser chrome` |
| Mechanics and runtime reference export | `python tests/pass18_check.py --browser chrome` |
| Square maps, cities and teleport/save safety | `python tests/city_world_check.py --browser chrome` |
| Played UI flows | `python tests/pass18_ui.py --browser chrome` |
| Campaign/replay integration | `python tests/pass18_campaign.py --browser chrome` |
| Boot/headless/presentation boundaries | `python tests/architecture_browser.py --browser chrome` |
| Supplied roster, 100 sprites, poses and saved copies | `python tests/monster_sprites_check.py --browser chrome` |
| Playable trainer sheets, painted creator, alpha isolation and weapon poses | `python tests/trainer_animation_check.py --browser chrome` |
| Reviewed catalog integrity | `python scripts/creature_reference.py --check` |
| Settings, audio, Inner Sea drafting and PNG export | `python tests/experience_check.py --browser chrome` |
| Classes, farm training, lunar defense and repairs | `python tests/farm_classes_check.py --browser chrome` |
| Framed Inventory / Inner Sea, modal focus and responsive navigation | `python tests/game_frame_check.py --browser chrome` |
| 1,000 browser/Node outcomes and CPU probe | `python tests/runtime_check.py --browser chrome` |
| Repeatable local package and startup smoke | `python tests/client_build_check.py --browser chrome` |

The [architecture manifest](../docs/architecture.json) owns current suite commands.
The current established-adventure suites seed a legacy profile explicitly so
creation does not mask their migration/UI assertions. The opening suite separately
uses truly fresh storage and exercises creation, weapon-specific combat, pursuit,
loot, summoning, death, sanctuary recovery, isolated restart/heal safety and
narrow-screen browser layouts.
Some current tests deliberately reuse older cases; an older filename alone does
not mean an assertion is obsolete. Tests outside these routes are not automatically
current. Do not run every historical pass and try to restore retired capture rules.

`test_project_tools.py`, `test_review_gates.py` and `test_navigation.py` use
uniquely named disposable fixtures in the system temporary directory, outside
synced workspace folders to avoid copy/cleanup locks. Browser tests use isolated contexts
and ephemeral local servers. Never reuse a personal browser profile.
Add a regression in the owner and test its connections; run the full gate for
cross-cutting changes. Do not alter expected results solely to make a test pass.

`artifacts/` contains generated reports, screenshots and runtime exports.
Never hand-edit reports. Match source hashes before treating browser results as
current evidence. Documentation checks are not gameplay, art or release acceptance.
