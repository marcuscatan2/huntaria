# Creature reference — all 100 species

Generated from [data/creature-reference.json](data/creature-reference.json). Revision 11, 2026-09-16.
Creature identity, design role, element, region, source level, availability and
attack basis come from the reviewed Bond & Bolt Google Sheet snapshot. Runtime
species bases remain local. The two reviewed combat workbooks supply kits and
innates; see [workbook contract](features/content/COMBAT_WORKBOOKS.md).
Regenerate: `python scripts/creature_reference.py --write`.
After runtime edits run the current browser suite, update reviewed JSON live fields,
then `python scripts/creature_reference.py --check`; it rejects drift.

## Reading the table

HP/ATK are **level-1 prototype species bases**, before Leadership, trees, innates, elements
or enemy overrides. ATK is the basic attack's base amount, not DPS or skill damage.
Speed = 100 / interval; Ready = seconds per base action. Move is arena units/s
(move multiplier x8); Reach is basic-attack range in arena units. World walking
is 210 units/s, not this Move column. Property means the Sheet-listed element.
Design role and attack basis are Sheet-owned. Prototype mechanic profile describes
the older simulation archetype still used by current skills; it is not allowed to
overwrite the design role.
All species have zero base armor. Physical hits have 5% base critical chance
and deal 1.4x damage after accuracy; Leadership contributes none. Innate reductions,
VIT defense and tree armor are separate. Physical dodge uses level and AGI/DEX.
No independent species STR/DEX/etc. distribution or randomized IVs is invented.

See [Companion stats.md](<Companion stats.md>) for exact level, attributes,
cooldown, damage, healing, armor, elemental and rounding formulas. Wild encounters
use a solo introductory Brimble (Lv2: HP430/ATK32 bases, skill scale0.65, no innate);
other individual wild encounters use full species bases and innate, then their
Sheet source level. Firstlight alone keeps the explicit Lv2/3/5 starter override.
Pack variants remain weaker. Saved encounters retain their reserved source level.
Boss previews use HP3400/ATK44 before level scaling, not the companion bases here,
and give no rewards. These are prototype balancing numbers, not approved final tuning.

Each summon creates an individual with its own XP/skills/tree. Species bases are
shared definitions, not shared progress. Same-species individuals may fill both
slots; the same individual cannot fill both.

**Loot/source table for every species:** [CREATURE_DROPS.md](CREATURE_DROPS.md).
**Spreadsheet:** [CREATURE_REFERENCE.csv](CREATURE_REFERENCE.csv).
**Art/animation briefs:** [CREATURE_DESIGN.md](CREATURE_DESIGN.md).
Skill IDs/names, defaults, exact rates and briefs are also in JSON/CSV.
Family allocations: [CREATURE_FAMILIES.md](CREATURE_FAMILIES.md). Ecology x/y anchors
in JSON are not creature spawn points; each life has its own saved random position.

## Mosslight

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| emberfox / Brimble | Demon / fiend | Fighter / Fire | Melee DPS | 610 | 49 / Strength-based | 64.52 / 1.55 | 12 / 12 | Tailblanket |
| stonehorn / Rattlebit | Skeletal / undead | Fighter / Earth | Tank | 1100 | 26 / Strength-based | 43.48 / 2.3 | 4.8 / 12 | Good as New |
| bloomslime / Bloomslime | Elemental / abstract | Tank / Supp / Earth | Support | 500 | 20 / Int-Based | 52.63 / 1.9 | 6.4 / 34 | Emergency Bloom |
| tideotter / Tideotter | Beast | Fighter / Supp / Water | Support | 510 | 23 / Strength-based | 54.05 / 1.85 | 8 / 12 | Pocket Droplets |
| seedhare / Seedskit | Plant / fungus | DPS / Earth | Melee DPS | 576 | 42 / Strength-based | 60.61 / 1.65 | 10 / 34 | Packed Pod |
| mossling / Mossling | Plant / fungus | Tank / Supp / Earth | Support | 469 | 21 / Strength-based | 51.95 / 1.92 | 8 / 12 | Patchwork Garden |
| acornboar / Tuskettle | Beast | Tank / Earth | Tank | 952 | 24 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Acorn Aegis |
| pebblepup / Pebblepup | Beast | Fighter / Earth | Melee DPS | 600 | 44 / Strength-based | 60.61 / 1.65 | 10 / 12 | Stay Close |
| dewfin / Dewloop | Elemental / abstract | Supp / Water | Support | 493 | 22 / Int-Based | 51.95 / 1.92 | 8 / 34 | Water Finds a Way |
| cloverbug / Cloverguard | Invertebrate | Tank / Earth | Tank | 976 | 26 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Lucky Leaf |
| ferncoil / Ferncoil | Plant / fungus | DPS / Earth | Ranged DPS | 569 | 41 / Dex-Based | 54.05 / 1.85 | 8 / 12 | Elastic Recoil |
| honeybat / Honeylark | Avian | Supp / Wind | Support | 461 | 20 / Int-Based | 51.95 / 1.92 | 8 / 34 | Sweet Follow-Through |
| reedwren / Snipstream | Elemental / abstract | DPS / Wind | Ranged DPS | 529 | 39 / Dex-Based | 52.63 / 1.9 | 8 / 34 | Waste Nothing |
| briarcrab / Grinroot | Demon / fiend | Fighter / Supp / Earth | Tank | 952 | 24 / Strength-based | 45.45 / 2.2 | 5.6 / 12 | Helping Hands |
| glowcap / Glowcap | Plant / fungus | Supp / Earth | Support | 485 | 22 / Int-Based | 51.95 / 1.92 | 8 / 34 | Little Nightlight |
| leafmantis / Leafmantis | Invertebrate | DPS / Wind | Melee DPS | 608 | 44 / Dex-Based | 58.82 / 1.7 | 10 / 12 | Folded Ambush |
| elderroot / Elderroot | Plant / fungus | Tank / Earth | Tank | 936 | 23 / Strength-based | 45.45 / 2.2 | 5.6 / 12 | Old Growth |

## Windstep

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| stormowl / Tempestool | Plant / fungus | DPS / Supp / Wind | Ranged DPS | 570 | 46 / Int-Based | 60.61 / 1.65 | 8.8 / 34 | Pressure Spores |
| galeibex / Hornvault | Skeletal / undead | Tank / Wind | Tank | 984 | 26 / Int-Based | 44.94 / 2.23 | 5.6 / 12 | Rib Reserve |
| cloudfin / Cloudfin | Aquatic | Supp / Wind | Support | 461 | 20 / Int-Based | 51.28 / 1.95 | 8 / 34 | Air Pocket |
| thunderbeetle / Brontobug | Invertebrate | Fighter / Wind | Tank | 944 | 24 / Strength-based | 45.45 / 2.2 | 5.6 / 12 | Marching Beat |
| skyrabbit / Hopgrit | Avian | Fighter / Wind | Melee DPS | 592 | 43 / Strength-based | 59.7 / 1.67 | 10 / 12 | Dig in the Heels |
| razorswift / Razorwing | Invertebrate | DPS / Wind | Ranged DPS | 545 | 40 / Dex-Based | 52.63 / 1.9 | 8 / 12 | Serrated Edge |
| tempestcub / Squallcub | Beast | Fighter / Wind | Melee DPS | 608 | 44 / Strength-based | 60.61 / 1.65 | 10 / 12 | Storm Shoulders |
| bouldereagle / Cragbeak | Avian | Tank / Earth | Tank | 976 | 26 / Dex-Based | 44.94 / 2.23 | 5.6 / 12 | Wing-Braced Aim |
| whistleweasel / Whistlepod | Plant / fungus | Supp / Wind | Support | 509 | 23 / Dex-Based | 51.28 / 1.95 | 8 / 34 | Keep the Beat |
| stormstilt / Windlass | Construct | Fighter / Wind | Ranged DPS | 521 | 38 / Strength-based | 54.05 / 1.85 | 8 / 12 | Flywheel |
| kitejelly / Kiteskulk | Afterlife spirit | DPS / Wind | Support | 469 | 21 / Int-Based | 51.95 / 1.92 | 8 / 34 | Unpaid Debt |
| fluffyak / Fluffyak | Beast | Tank / Supp / Earth | Tank | 952 | 24 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Deep Fleece |
| zephyrlynx / Velvimp | Demon / fiend | DPS / Wind | Melee DPS | 600 | 44 / Int-Based | 60.61 / 1.65 | 10 / 34 | Envious Grin |
| prismwasp / Prismspear | Construct | DPS / Wind | Ranged DPS | 553 | 40 / Dex-Based | 53.33 / 1.88 | 8 / 34 | Spectral Afterimage |
| skycorolla / Skycorolla | Plant / fungus | DPS / Wind | Support | 501 | 23 / Int-Based | 51.28 / 1.95 | 8 / 34 | Cross-Pollination |
| tempestrook / Tempestrook | Mythic | DPS / Wind | Ranged DPS | 553 | 40 / Strength-based | 53.33 / 1.88 | 8 / 34 | Shed the Storm |

## Moonwell

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| frostfang / Shardclaw | Beast | DPS / Water | Melee DPS | 620 | 45 / Dex-Based | 62.5 / 1.6 | 11.6 / 12 | Fault Finder |
| moonrabbit / Pillowisp | Elemental / abstract | Supp / Water | Support | 501 | 23 / Int-Based | 51.95 / 1.92 | 8 / 34 | Soft Landing |
| runecrab / Cairnclamp | Construct | Tank / Earth | Tank | 984 | 26 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Protective Grip |
| starnewt / Starfrog | Reptile / amphibian | DPS / Water | Ranged DPS | 521 | 38 / Int-Based | 54.05 / 1.85 | 8 / 34 | Pocket Constellation |
| veilray / Veilora | Afterlife spirit | Tank / Supp / Wind | Support | 469 | 21 / Int-Based | 51.95 / 1.92 | 8 / 34 | Frayed Mercy |
| duskmarten / Inkmarten | Beast | DPS / Water | Melee DPS | 592 | 43 / Dex-Based | 58.82 / 1.7 | 10 / 12 | Fresh Page |
| opalowl / Hushowl | Avian | DPS / Supp / Wind | Ranged DPS | 545 | 40 / Strength-based | 54.05 / 1.85 | 8 / 34 | Watchful Mask |
| lanternslug / Maskin | Afterlife spirit | DPS / Supp / Earth | Support | 493 | 22 / Int-Based | 51.95 / 1.92 | 8 / 34 | Three Little Voices |
| mirrormantis / Mirrormantis | Invertebrate | DPS / Wind | Melee DPS | 616 | 45 / Strength-based | 58.82 / 1.7 | 10 / 12 | False Torso |
| crystalurchin / Hexurchin | Aquatic | Tank / Water | Tank | 984 | 26 / Strength-based | 45.45 / 2.2 | 5.6 / 12 | Hexagonal Plates |
| dreamtapir / Dreamtapir | Beast | Supp / Water | Support | 461 | 20 / Int-Based | 51.95 / 1.92 | 8 / 34 | Dream Sipper |
| moongolem / Cairnkin | Skeletal / undead | Tank / Earth | Tank | 944 | 24 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Still Watching |
| astralfox / Lunaskein | Elemental / abstract | DPS / Supp / Wind | Melee DPS | 592 | 43 / Int-Based | 60.61 / 1.65 | 10 / 34 | Wax and Wane |
| echochime / Echochime | Haunted object | Supp / Wind | Support | 485 | 22 / Int-Based | 51.95 / 1.92 | 8 / 34 | Remember the Note |
| pearlwyrm / Pearlweaver | Invertebrate | DPS / Water | Ranged DPS | 553 | 40 / Dex-Based | 52.63 / 1.9 | 8 / 34 | Polished Patience |
| inksprite / Inksprite | Elemental / abstract | DPS / Supp / Water | Ranged DPS | 561 | 41 / Dex-Based | 54.05 / 1.85 | 8 / 34 | Smudged Advantage |
| moonweaver / Moonweaver | Mythic | DPS / Supp / Water | Support | 485 | 22 / Int-Based | 52.63 / 1.9 | 8 / 34 | Lunar Loom |

## Amber Hollow

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| cindrake / Ashskate | Reptile / amphibian | DPS / Fire | Ranged DPS | 600 | 42 / Int-Based | 54.05 / 1.85 | 8 / 34 | Carry the Spark |
| thornstag / Thornmaw | Plant / fungus | Fighter / Tank / Earth | Tank | 940 | 32 / Strength-based | 47.62 / 2.1 | 6.8 / 12 | Biting Thorns |
| copperhog / Bellowsnout | Beast | Fighter / Fire | Tank | 976 | 26 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Bellows Cycle |
| amberkite / Amberkite | Construct | DPS / Wind | Ranged DPS | 569 | 41 / Int-Based | 54.05 / 1.85 | 8 / 34 | Carry the Forecast |
| cindermole / Cindertroop | Collective | Fighter / Fire | Melee DPS | 576 | 42 / Strength-based | 59.7 / 1.67 | 10 / 12 | Colony Command |
| sunscarab / Sunscarab | Invertebrate | Tank / Supp / Fire | Tank | 944 | 24 / Int-Based | 44.44 / 2.25 | 5.6 / 12 | Solar Balance |
| embersalam / Puffiend | Demon / fiend | DPS / Supp / Fire | Ranged DPS | 537 | 39 / Dex-Based | 54.05 / 1.85 | 8 / 34 | Puffed Cheeks |
| ochrewisp / Casketot | Haunted object | Tank / Earth | Support | 485 | 22 / Int-Based | 51.95 / 1.92 | 8 / 34 | Soul Lining |
| bronzebuck / Gonglet | Construct | Tank / Supp / Earth | Tank | 968 | 25 / Int-Based | 44.44 / 2.25 | 5.6 / 34 | Resonant Rim |
| thistlehare / Pinstitch | Haunted object | DPS / Supp / Earth | Melee DPS | 616 | 45 / Dex-Based | 60.61 / 1.65 | 10 / 34 | Loose Thread |
| ashporcupine / Wickeep | Haunted object | Supp / Fire | Tank | 984 | 26 / Dex-Based | 44.94 / 2.23 | 5.6 / 34 | Keep the Flame |
| resinroach / Resinrook | Construct | Tank / Earth | Ranged DPS | 521 | 38 / Strength-based | 52.63 / 1.9 | 8 / 12 | Clinging Resin |
| marigoldia / Marigloom | Afterlife spirit | Supp / Earth | Support | 469 | 21 / Int-Based | 52.63 / 1.9 | 8 / 34 | Bloom in Sorrow |
| flintjackal / Cinderknuckle | Demon / fiend | Fighter / Fire | Melee DPS | 592 | 43 / Int-Based | 59.7 / 1.67 | 10 / 12 | Banked Heat |
| dunecoil / Ribwhirl | Skeletal / undead | Fighter / Earth | Ranged DPS | 545 | 40 / Int-Based | 52.63 / 1.9 | 8 / 12 | Skull and Rib |
| saffronmoth / Saffrune | Plant / fungus | Supp / Wind | Support | 493 | 22 / Int-Based | 52.63 / 1.9 | 8 / 34 | Threefold Inscription |
| ambercolossus / Ambercolossus | Construct | Tank / Earth | Tank | 952 | 24 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Protected Core |

## Willowbrook

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ironback / Ironback | Reptile / amphibian | Tank / Earth | Tank | 1060 | 24 / Strength-based | 41.67 / 2.4 | 4.4 / 12 | Tilted Carapace |
| lumimoth / Lumimoth | Invertebrate | Supp / Wind | Support | 470 | 25 / Int-Based | 55.56 / 1.8 | 8.8 / 34 | Guiding Lanterns |
| rillrook / Keepsake | Afterlife spirit | Supp / Water | Ranged DPS | 561 | 41 / Int-Based | 54.05 / 1.85 | 8 / 34 | Held Dear |
| shellsnail / Shellsnail | Aquatic | Fighter / Water | Tank | 984 | 26 / Strength-based | 44.94 / 2.23 | 5.6 / 12 | Backward Spiral |
| brooktoad / Brooktoad | Reptile / amphibian | Supp / Water | Support | 461 | 20 / Int-Based | 51.28 / 1.95 | 8 / 34 | Bowl of Plenty |
| glassshrimp / Snapglass | Invertebrate | DPS / Water | Ranged DPS | 529 | 39 / Strength-based | 54.05 / 1.85 | 8 / 12 | Oversized Claw |
| lotusmanta / Lotusmanta | Aquatic | Supp / Water | Support | 477 | 21 / Int-Based | 51.95 / 1.92 | 8 / 34 | Lotus Shelter |
| ripplelynx / Rillblade | Aquatic | DPS / Water | Melee DPS | 600 | 44 / Dex-Based | 58.82 / 1.7 | 10 / 12 | Clean Current |
| rainram / Pluvault | Construct | Tank / Supp / Water | Tank | 968 | 25 / Int-Based | 45.45 / 2.2 | 5.6 / 34 | Rain Reserve |
| driftjelly / Driftjelly | Aquatic | DPS / Supp / Water | Support | 501 | 23 / Int-Based | 51.95 / 1.92 | 8 / 34 | Numbing Film |
| mudmole / Burrowlug | Plant / fungus | Tank / Earth | Tank | 984 | 26 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Set Roots |
| heronveil / Veilheron | Avian | DPS / Wind | Ranged DPS | 521 | 38 / Dex-Based | 54.05 / 1.85 | 8 / 34 | Pristine Opening |
| siltwyrm / Silkstep | Skeletal / undead | DPS / Earth | Melee DPS | 584 | 43 / Dex-Based | 59.7 / 1.67 | 10 / 12 | Threaded Entrance |
| coralimp / Reefvault | Invertebrate | DPS / Water | Ranged DPS | 537 | 39 / Strength-based | 52.63 / 1.9 | 8 / 12 | Long Lever |
| lilydeer / Lilydeer | Beast | Supp / Earth | Support | 485 | 22 / Int-Based | 52.63 / 1.9 | 8 / 34 | Antler Buds |
| mistseal / Mistmelt | Elemental / abstract | Tank / Supp / Water | Support | 493 | 22 / Strength-based | 51.95 / 1.92 | 8 / 12 | Hollow Body |
| tidecrown / Tidecrown | Mythic | Tank / Supp / Water | Support | 469 | 21 / Int-Based | 51.95 / 1.92 | 8 / 34 | Bearer of the Crown |

## Ashen Reach

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| magmatoad / Crucibulk | Construct | Tank / Fire | Tank | 984 | 26 / Int-Based | 45.45 / 2.2 | 5.6 / 34 | Recast the Slag |
| obsidianram / Cairnox | Skeletal / undead | Fighter / Tank / Earth | Tank | 936 | 23 / Strength-based | 44.94 / 2.23 | 5.6 / 12 | Loose Assembly |
| pyrewolf / Pyreling | Demon / fiend | DPS / Fire | Melee DPS | 584 | 43 / Strength-based | 58.82 / 1.7 | 10 / 12 | Fed by Embers |
| emberorchid / Emberorchid | Plant / fungus | DPS / Fire | Support | 477 | 21 / Int-Based | 52.63 / 1.9 | 8 / 34 | Ignition Pollen |
| cindercentipede / Kilncoil | Invertebrate | Fighter / Fire | Melee DPS | 600 | 44 / Strength-based | 59.7 / 1.67 | 10 / 12 | Overlapping Plates |
| basalturtle / Slagbud | Plant / fungus | Tank / Earth | Tank | 968 | 25 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Charred Leaves |
| ashbasilisk / Ashbasilisk | Reptile / amphibian | DPS / Fire | Ranged DPS | 561 | 41 / Strength-based | 54.05 / 1.85 | 8 / 12 | Calcifying Bite |
| glassphoenix / Glassphoenix | Mythic | DPS / Fire | Ranged DPS | 569 | 41 / Int-Based | 53.33 / 1.88 | 8 / 34 | Cracked, Not Gone |
| coalbadger / Slagjaw | Construct | Tank / Earth | Tank | 936 | 23 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Jaw Lock |
| steamaxolotl / Steamaxolotl | Reptile / amphibian | Supp / Water | Support | 469 | 21 / Int-Based | 52.63 / 1.9 | 8 / 34 | Clean Steam |
| lavaurchin / Cinderwink | Afterlife spirit | Supp / Fire | Ranged DPS | 537 | 39 / Int-Based | 53.33 / 1.88 | 8 / 34 | Little Embers |
| volcanomoth / Mournmantle | Demon / fiend | Supp / Fire | Support | 485 | 22 / Int-Based | 51.28 / 1.95 | 8 / 34 | Scent of Sorrow |
| sootimp / Coalgrub | Invertebrate | Fighter / Fire | Ranged DPS | 553 | 40 / Strength-based | 54.05 / 1.85 | 8 / 12 | Charproof Hide |
| moltencoil / Moltencoil | Reptile / amphibian | Fighter / Fire | Melee DPS | 616 | 45 / Dex-Based | 59.7 / 1.67 | 10 / 12 | Cast-Off Ring |
| auroradrake / Auroradrake | Mythic | Fighter / Supp / Water | Ranged DPS | 569 | 41 / Int-Based | 52.63 / 1.9 | 8 / 12 | Dawn Exchange |
| cinderempress / Cinderempress | Mythic | Fighter / Fire | Melee DPS | 616 | 45 / Int-Based | 58.82 / 1.7 | 10 / 12 | Crown Heat |

