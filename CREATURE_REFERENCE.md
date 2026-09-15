# Creature reference — all 100 species

Generated from [data/creature-reference.json](data/creature-reference.json). Revision 9, 2026-09-15.
Creature identity, design role, element, region, source level, availability and
attack basis come from the reviewed Bond & Bolt Google Sheet snapshot. Runtime
stats and kits are captured from the prototype because `mon-skills` is still empty.
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
All species have zero base armor and no critical-hit system; innate reductions,
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
Five-skill IDs/names, defaults, exact rates and briefs are also in JSON/CSV.
Family allocations: [CREATURE_FAMILIES.md](CREATURE_FAMILIES.md). Ecology x/y anchors
in JSON are not creature spawn points; each life has its own saved random position.

## Mosslight

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| emberfox / Brimble | Demon / fiend | Fighter / Fire | Melee DPS | 610 | 49 / Strength-based | 64.52 / 1.55 | 12 / 12 | Kindling |
| stonehorn / Rattlebit | Skeletal / undead | Fighter / Earth | Tank | 1100 | 26 / Strength-based | 43.48 / 2.3 | 4.8 / 12 | Granite Hide |
| bloomslime / Bloomslime | Elemental / abstract | Tank / Supp / Earth | Support | 500 | 20 / Int-Based | 52.63 / 1.9 | 6.4 / 27 | Tender Care |
| tideotter / Tideotter | Beast | Fighter / Supp / Water | Support | 510 | 23 / Strength-based | 54.05 / 1.85 | 8 / 27 | Gentle Current |
| seedhare / Seedskit | Plant / fungus | DPS / Earth | Melee DPS | 576 | 42 / Strength-based | 60.61 / 1.65 | 10 / 12 | Winter Hunt |
| mossling / Mossling | Plant / fungus | Tank / Supp / Earth | Support | 469 | 21 / Strength-based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| acornboar / Tuskettle | Beast | Tank / Earth | Tank | 952 | 24 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| pebblepup / Pebblepup | Beast | Fighter / Earth | Melee DPS | 600 | 44 / Strength-based | 60.61 / 1.65 | 10 / 12 | Cinder Heart |
| dewfin / Dewloop | Elemental / abstract | Supp / Water | Support | 493 | 22 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| cloverbug / Cloverguard | Invertebrate | Tank / Earth | Tank | 976 | 26 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| ferncoil / Ferncoil | Plant / fungus | DPS / Earth | Ranged DPS | 569 | 41 / Dex-Based | 54.05 / 1.85 | 8 / 34 | Charged Feathers |
| honeybat / Honeylark | Avian | Supp / Wind | Support | 461 | 20 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| reedwren / Snipstream | Elemental / abstract | DPS / Wind | Ranged DPS | 529 | 39 / Dex-Based | 52.63 / 1.9 | 8 / 34 | Charged Feathers |
| briarcrab / Grinroot | Demon / fiend | Fighter / Supp / Earth | Tank | 952 | 24 / Strength-based | 45.45 / 2.2 | 5.6 / 12 | Granite Hide |
| glowcap / Glowcap | Plant / fungus | Supp / Earth | Support | 485 | 22 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| leafmantis / Leafmantis | Invertebrate | DPS / Wind | Melee DPS | 608 | 44 / Dex-Based | 58.82 / 1.7 | 10 / 12 | Winter Hunt |
| elderroot / Elderroot | Plant / fungus | Tank / Earth | Tank | 936 | 23 / Strength-based | 45.45 / 2.2 | 5.6 / 12 | Granite Hide |

## Windstep

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| stormowl / Tempestool | Plant / fungus | DPS / Supp / Wind | Ranged DPS | 570 | 46 / Int-Based | 60.61 / 1.65 | 8.8 / 34 | Charged Feathers |
| galeibex / Hornvault | Skeletal / undead | Tank / Wind | Tank | 984 | 26 / Int-Based | 44.94 / 2.23 | 5.6 / 12 | Shell Reserve |
| cloudfin / Cloudfin | Aquatic | Supp / Wind | Support | 461 | 20 / Int-Based | 51.28 / 1.95 | 8 / 27 | Moon Ward |
| thunderbeetle / Brontobug | Invertebrate | Fighter / Wind | Tank | 944 | 24 / Strength-based | 45.45 / 2.2 | 5.6 / 12 | Granite Hide |
| skyrabbit / Hopgrit | Avian | Fighter / Wind | Melee DPS | 592 | 43 / Strength-based | 59.7 / 1.67 | 10 / 12 | Winter Hunt |
| razorswift / Razorwing | Invertebrate | DPS / Wind | Ranged DPS | 545 | 40 / Dex-Based | 52.63 / 1.9 | 8 / 34 | Charged Feathers |
| tempestcub / Squallcub | Beast | Fighter / Wind | Melee DPS | 608 | 44 / Strength-based | 60.61 / 1.65 | 10 / 12 | Cinder Heart |
| bouldereagle / Cragbeak | Avian | Tank / Earth | Tank | 976 | 26 / Dex-Based | 44.94 / 2.23 | 5.6 / 12 | Shell Reserve |
| whistleweasel / Whistlepod | Plant / fungus | Supp / Wind | Support | 509 | 23 / Dex-Based | 51.28 / 1.95 | 8 / 27 | Moon Ward |
| stormstilt / Windlass | Construct | Fighter / Wind | Ranged DPS | 521 | 38 / Strength-based | 54.05 / 1.85 | 8 / 34 | Charged Feathers |
| kitejelly / Kiteskulk | Afterlife spirit | DPS / Wind | Support | 469 | 21 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| fluffyak / Fluffyak | Beast | Tank / Supp / Earth | Tank | 952 | 24 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| zephyrlynx / Velvimp | Demon / fiend | DPS / Wind | Melee DPS | 600 | 44 / Int-Based | 60.61 / 1.65 | 10 / 12 | Winter Hunt |
| prismwasp / Prismspear | Construct | DPS / Wind | Ranged DPS | 553 | 40 / Dex-Based | 53.33 / 1.88 | 8 / 34 | Charged Feathers |
| skycorolla / Skycorolla | Plant / fungus | DPS / Wind | Support | 501 | 23 / Int-Based | 51.28 / 1.95 | 8 / 27 | Moon Ward |
| tempestrook / Tempestrook | Mythic | DPS / Wind | Ranged DPS | 553 | 40 / Strength-based | 53.33 / 1.88 | 8 / 34 | Charged Feathers |

## Moonwell

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| frostfang / Shardclaw | Beast | DPS / Water | Melee DPS | 620 | 45 / Dex-Based | 62.5 / 1.6 | 11.6 / 12 | Winter Hunt |
| moonrabbit / Pillowisp | Elemental / abstract | Supp / Water | Support | 501 | 23 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| runecrab / Cairnclamp | Construct | Tank / Earth | Tank | 984 | 26 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| starnewt / Starfrog | Reptile / amphibian | DPS / Water | Ranged DPS | 521 | 38 / Int-Based | 54.05 / 1.85 | 8 / 34 | Charged Feathers |
| veilray / Veilora | Afterlife spirit | Tank / Supp / Wind | Support | 469 | 21 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| duskmarten / Inkmarten | Beast | DPS / Water | Melee DPS | 592 | 43 / Dex-Based | 58.82 / 1.7 | 10 / 12 | Winter Hunt |
| opalowl / Hushowl | Avian | DPS / Supp / Wind | Ranged DPS | 545 | 40 / Strength-based | 54.05 / 1.85 | 8 / 34 | Charged Feathers |
| lanternslug / Maskin | Afterlife spirit | DPS / Supp / Earth | Support | 493 | 22 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| mirrormantis / Mirrormantis | Invertebrate | DPS / Wind | Melee DPS | 616 | 45 / Strength-based | 58.82 / 1.7 | 10 / 12 | Winter Hunt |
| crystalurchin / Hexurchin | Aquatic | Tank / Water | Tank | 984 | 26 / Strength-based | 45.45 / 2.2 | 5.6 / 12 | Granite Hide |
| dreamtapir / Dreamtapir | Beast | Supp / Water | Support | 461 | 20 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| moongolem / Cairnkin | Skeletal / undead | Tank / Earth | Tank | 944 | 24 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| astralfox / Lunaskein | Elemental / abstract | DPS / Supp / Wind | Melee DPS | 592 | 43 / Int-Based | 60.61 / 1.65 | 10 / 12 | Cinder Heart |
| echochime / Echochime | Haunted object | Supp / Wind | Support | 485 | 22 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| pearlwyrm / Pearlweaver | Invertebrate | DPS / Water | Ranged DPS | 553 | 40 / Dex-Based | 52.63 / 1.9 | 8 / 34 | Charged Feathers |
| inksprite / Inksprite | Elemental / abstract | DPS / Supp / Water | Ranged DPS | 561 | 41 / Dex-Based | 54.05 / 1.85 | 8 / 34 | Charged Feathers |
| moonweaver / Moonweaver | Mythic | DPS / Supp / Water | Support | 485 | 22 / Int-Based | 52.63 / 1.9 | 8 / 27 | Tender Care |

## Amber Hollow

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| cindrake / Ashskate | Reptile / amphibian | DPS / Fire | Ranged DPS | 600 | 42 / Int-Based | 54.05 / 1.85 | 8 / 27 | Cinder Heart |
| thornstag / Thornmaw | Plant / fungus | Fighter / Tank / Earth | Tank | 940 | 32 / Strength-based | 47.62 / 2.1 | 6.8 / 12 | Last Grove |
| copperhog / Bellowsnout | Beast | Fighter / Fire | Tank | 976 | 26 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| amberkite / Amberkite | Construct | DPS / Wind | Ranged DPS | 569 | 41 / Int-Based | 54.05 / 1.85 | 8 / 34 | Charged Feathers |
| cindermole / Cindertroop | Collective | Fighter / Fire | Melee DPS | 576 | 42 / Strength-based | 59.7 / 1.67 | 10 / 12 | Kindling |
| sunscarab / Sunscarab | Invertebrate | Tank / Supp / Fire | Tank | 944 | 24 / Int-Based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| embersalam / Puffiend | Demon / fiend | DPS / Supp / Fire | Ranged DPS | 537 | 39 / Dex-Based | 54.05 / 1.85 | 8 / 34 | Kindling |
| ochrewisp / Casketot | Haunted object | Tank / Earth | Support | 485 | 22 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| bronzebuck / Gonglet | Construct | Tank / Supp / Earth | Tank | 968 | 25 / Int-Based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| thistlehare / Pinstitch | Haunted object | DPS / Supp / Earth | Melee DPS | 616 | 45 / Dex-Based | 60.61 / 1.65 | 10 / 12 | Winter Hunt |
| ashporcupine / Wickeep | Haunted object | Supp / Fire | Tank | 984 | 26 / Dex-Based | 44.94 / 2.23 | 5.6 / 12 | Shell Reserve |
| resinroach / Resinrook | Construct | Tank / Earth | Ranged DPS | 521 | 38 / Strength-based | 52.63 / 1.9 | 8 / 34 | Charged Feathers |
| marigoldia / Marigloom | Afterlife spirit | Supp / Earth | Support | 469 | 21 / Int-Based | 52.63 / 1.9 | 8 / 27 | Tender Care |
| flintjackal / Cinderknuckle | Demon / fiend | Fighter / Fire | Melee DPS | 592 | 43 / Int-Based | 59.7 / 1.67 | 10 / 12 | Kindling |
| dunecoil / Ribwhirl | Skeletal / undead | Fighter / Earth | Ranged DPS | 545 | 40 / Int-Based | 52.63 / 1.9 | 8 / 34 | Charged Feathers |
| saffronmoth / Saffrune | Plant / fungus | Supp / Wind | Support | 493 | 22 / Int-Based | 52.63 / 1.9 | 8 / 27 | Tender Care |
| ambercolossus / Ambercolossus | Construct | Tank / Earth | Tank | 952 | 24 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |

## Willowbrook

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ironback / Ironback | Reptile / amphibian | Tank / Earth | Tank | 1060 | 24 / Strength-based | 41.67 / 2.4 | 4.4 / 12 | Shell Reserve |
| lumimoth / Lumimoth | Invertebrate | Supp / Wind | Support | 470 | 25 / Int-Based | 55.56 / 1.8 | 8.8 / 34 | Moon Ward |
| rillrook / Keepsake | Afterlife spirit | Supp / Water | Ranged DPS | 561 | 41 / Int-Based | 54.05 / 1.85 | 8 / 34 | Charged Feathers |
| shellsnail / Shellsnail | Aquatic | Fighter / Water | Tank | 984 | 26 / Strength-based | 44.94 / 2.23 | 5.6 / 12 | Shell Reserve |
| brooktoad / Brooktoad | Reptile / amphibian | Supp / Water | Support | 461 | 20 / Int-Based | 51.28 / 1.95 | 8 / 27 | Moon Ward |
| glassshrimp / Snapglass | Invertebrate | DPS / Water | Ranged DPS | 529 | 39 / Strength-based | 54.05 / 1.85 | 8 / 34 | Charged Feathers |
| lotusmanta / Lotusmanta | Aquatic | Supp / Water | Support | 477 | 21 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| ripplelynx / Rillblade | Aquatic | DPS / Water | Melee DPS | 600 | 44 / Dex-Based | 58.82 / 1.7 | 10 / 12 | Winter Hunt |
| rainram / Pluvault | Construct | Tank / Supp / Water | Tank | 968 | 25 / Int-Based | 45.45 / 2.2 | 5.6 / 12 | Granite Hide |
| driftjelly / Driftjelly | Aquatic | DPS / Supp / Water | Support | 501 | 23 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| mudmole / Burrowlug | Plant / fungus | Tank / Earth | Tank | 984 | 26 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| heronveil / Veilheron | Avian | DPS / Wind | Ranged DPS | 521 | 38 / Dex-Based | 54.05 / 1.85 | 8 / 34 | Charged Feathers |
| siltwyrm / Silkstep | Skeletal / undead | DPS / Earth | Melee DPS | 584 | 43 / Dex-Based | 59.7 / 1.67 | 10 / 12 | Winter Hunt |
| coralimp / Reefvault | Invertebrate | DPS / Water | Ranged DPS | 537 | 39 / Strength-based | 52.63 / 1.9 | 8 / 34 | Charged Feathers |
| lilydeer / Lilydeer | Beast | Supp / Earth | Support | 485 | 22 / Int-Based | 52.63 / 1.9 | 8 / 27 | Tender Care |
| mistseal / Mistmelt | Elemental / abstract | Tank / Supp / Water | Support | 493 | 22 / Strength-based | 51.95 / 1.92 | 8 / 27 | Gentle Current |
| tidecrown / Tidecrown | Mythic | Tank / Supp / Water | Support | 469 | 21 / Int-Based | 51.95 / 1.92 | 8 / 27 | Gentle Current |

## Ashen Reach

| ID / creature | Inspiration family | Design role / property | Prototype mechanic profile | HP | ATK / basis | Speed / Ready s | Move / Reach | Innate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| magmatoad / Crucibulk | Construct | Tank / Fire | Tank | 984 | 26 / Int-Based | 45.45 / 2.2 | 5.6 / 12 | Granite Hide |
| obsidianram / Cairnox | Skeletal / undead | Fighter / Tank / Earth | Tank | 936 | 23 / Strength-based | 44.94 / 2.23 | 5.6 / 12 | Shell Reserve |
| pyrewolf / Pyreling | Demon / fiend | DPS / Fire | Melee DPS | 584 | 43 / Strength-based | 58.82 / 1.7 | 10 / 12 | Kindling |
| emberorchid / Emberorchid | Plant / fungus | DPS / Fire | Support | 477 | 21 / Int-Based | 52.63 / 1.9 | 8 / 27 | Tender Care |
| cindercentipede / Kilncoil | Invertebrate | Fighter / Fire | Melee DPS | 600 | 44 / Strength-based | 59.7 / 1.67 | 10 / 12 | Kindling |
| basalturtle / Slagbud | Plant / fungus | Tank / Earth | Tank | 968 | 25 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| ashbasilisk / Ashbasilisk | Reptile / amphibian | DPS / Fire | Ranged DPS | 561 | 41 / Strength-based | 54.05 / 1.85 | 8 / 34 | Kindling |
| glassphoenix / Glassphoenix | Mythic | DPS / Fire | Ranged DPS | 569 | 41 / Int-Based | 53.33 / 1.88 | 8 / 34 | Kindling |
| coalbadger / Slagjaw | Construct | Tank / Earth | Tank | 936 | 23 / Strength-based | 44.44 / 2.25 | 5.6 / 12 | Last Grove |
| steamaxolotl / Steamaxolotl | Reptile / amphibian | Supp / Water | Support | 469 | 21 / Int-Based | 52.63 / 1.9 | 8 / 27 | Tender Care |
| lavaurchin / Cinderwink | Afterlife spirit | Supp / Fire | Ranged DPS | 537 | 39 / Int-Based | 53.33 / 1.88 | 8 / 34 | Kindling |
| volcanomoth / Mournmantle | Demon / fiend | Supp / Fire | Support | 485 | 22 / Int-Based | 51.28 / 1.95 | 8 / 27 | Moon Ward |
| sootimp / Coalgrub | Invertebrate | Fighter / Fire | Ranged DPS | 553 | 40 / Strength-based | 54.05 / 1.85 | 8 / 34 | Kindling |
| moltencoil / Moltencoil | Reptile / amphibian | Fighter / Fire | Melee DPS | 616 | 45 / Dex-Based | 59.7 / 1.67 | 10 / 12 | Kindling |
| auroradrake / Auroradrake | Mythic | Fighter / Supp / Water | Ranged DPS | 569 | 41 / Int-Based | 52.63 / 1.9 | 8 / 34 | Charged Feathers |
| cinderempress / Cinderempress | Mythic | Fighter / Fire | Melee DPS | 616 | 45 / Int-Based | 58.82 / 1.7 | 10 / 12 | Kindling |

