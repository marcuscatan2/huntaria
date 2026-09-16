# Creature drops and habitats — all 100 species

Generated from [data/creature-reference.json](data/creature-reference.json). Revision 11, 2026-09-16.
Every row below distinguishes **LIVE prototype loot** from **PLANNED, NOT LIVE**.
Stats/kit definitions: [CREATURE_REFERENCE.md](CREATURE_REFERENCE.md).

## Live drop contract

Wild coins = 6 + floor(reserved source level / 3), guaranteed for an accepted kill.
The listed species Echo uses a persisted0..9999 draw: below1500 succeeds (15%).
This is a temporary TEST override for all species. Release proposals remain
10% for the original starters and0.01% for others, preserved in releaseEchoBP;
they are not the current live odds. Each success grants exactly one Echo.
XP = 300 + 100 x reserved source level to each participating individual, not an inventory item;
created apprentices also earn hunting XP up to1000 total (Lv5), even solo.
Beyond that starter floor trainer level follows companions. Rarity labels do not increase power.
Firstlight's three species can also drop the listed recovery items. Their rolls
use a separate seeded stream per saved spawn life; the same accepted kill cannot
reroll or pay twice. Other maps do not yet have ordinary supply/material drops.

Species are assigned to maps; creatures are not tied to little habitat clusters.
Selected ghosts repeat across tower floors; each habitat is listed below.
The sacred-treasures quest guarantees only its outstanding requested Echoes.
CSV level/loot fields describe the primary habitat; all_habitats_json lists every location.
Firstlight has144 Brimble,96 Bloomslime and48 Rattlebit (288 residents). Elsewhere,
per species/map: Common24, Uncommon15, Rare/Very rare3 residents. Ordinary defeated
lives are replaced immediately elsewhere; rare lives wait60s. No extra availability
roll. Each replacement is a saved dry, walkable point, at least900 world units from
its prior position. The initial starter population has one nearby introductory
Brimble resident. Firstlight replacements sample broad difficulty bands with a
wildlife-free camp; other maps sample their full walkable area. Towns have no wildlife.
Pending encounters retain their lives until settled/abandoned. Old surplus slots
are retired from the map population without removing any owned companions.
All roaming species attack outside Firstlight, regardless of trainer level.
Coordinates in JSON/CSV are ecology anchors, not spawn locations.

Six bosses have **no live acquisition source**: the local altars are reward-free
previews. The configured future essence contract is one 0.01% group roll per eligible
real victory, one selected eligible recipient, no realm copy cap. Their ordinary
group loot/XP has not been tuned; do not interpret a blank as a released zero-reward boss.

## Proposed ordinary reward layer — not implemented

Each wild row proposes one unit of a regional cosmetic-crafting material at25%,
rolled independently of the Echo. These are common materials, NOT very-rare items.
Names/uses below are a content proposal; no crafting UI, item or drop was added.
No additional consumable or very-rare reward is silently inserted.
The current test tuning explicitly authorizes temporary Echo/XP changes, not these proposals.
All economy claims are local only; authoritative online receipts remain pending.

## Mosslight

| Species ID | Source / level | Map population / replacement delay | LIVE drops | LIVE XP / individual | PLANNED ONLY |
| --- | --- | --- | --- | --- | --- |
| emberfox | Firstlight Meadow (clearing-0) / Lv2 | Common / 144 residents / immediate elsewhere | 6 coins @100%; 1 Brimble Echo @15%; 1 leafdraught @35% | 500 | 1 Meadow Fiber @25% |
| stonehorn | Firstlight Meadow (clearing-0) / Lv5 | Common / 48 residents / immediate elsewhere | 7 coins @100%; 1 Rattlebit Echo @15%; 1 leafdraught @45%; 1 revivalsalve @10% | 800 | 1 Meadow Fiber @25% |
| bloomslime | Firstlight Meadow (clearing-0) / Lv3 | Common / 96 residents / immediate elsewhere | 7 coins @100%; 1 Bloomslime Echo @15%; 1 leafdraught @60% | 600 | 1 Meadow Fiber @25% |
| tideotter | Fernpath Woods (clearing-1) / Lv10 | Common / 24 residents / immediate elsewhere | 9 coins @100%; 1 Tideotter Echo @15% | 1300 | 1 Meadow Fiber @25% |
| seedhare | Elderroot Glade (clearing-2) / Lv8 | Very rare / 3 residents / 60s | 8 coins @100%; 1 Seedskit Echo @15% | 1100 | 1 Meadow Fiber @25% |
| mossling | Rootveil Cave (clearing-3) / Lv10 | Uncommon / 15 residents / immediate elsewhere | 9 coins @100%; 1 Mossling Echo @15% | 1300 | 1 Meadow Fiber @25% |
| acornboar | Fernpath Woods (clearing-1) / Lv12 | Uncommon / 15 residents / immediate elsewhere | 10 coins @100%; 1 Tuskettle Echo @15% | 1500 | 1 Meadow Fiber @25% |
| pebblepup | Elderroot Glade (clearing-2) / Lv14 | Uncommon / 15 residents / immediate elsewhere | 10 coins @100%; 1 Pebblepup Echo @15% | 1700 | 1 Meadow Fiber @25% |
| dewfin | Rootveil Cave (clearing-3) / Lv12 | Rare / 3 residents / 60s | 10 coins @100%; 1 Dewloop Echo @15% | 1500 | 1 Meadow Fiber @25% |
| cloverbug | Fernpath Woods (clearing-1) / Lv14 | Uncommon / 15 residents / immediate elsewhere | 10 coins @100%; 1 Cloverguard Echo @15% | 1700 | 1 Meadow Fiber @25% |
| ferncoil | Elderroot Glade (clearing-2) / Lv16 | Uncommon / 15 residents / immediate elsewhere | 11 coins @100%; 1 Ferncoil Echo @15% | 1900 | 1 Meadow Fiber @25% |
| honeybat | Rootveil Cave (clearing-3) / Lv18 | Uncommon / 15 residents / immediate elsewhere | 12 coins @100%; 1 Honeylark Echo @15% | 2100 | 1 Meadow Fiber @25% |
| reedwren | Fernpath Woods (clearing-1) / Lv16 | Rare / 3 residents / 60s | 11 coins @100%; 1 Snipstream Echo @15% | 1900 | 1 Meadow Fiber @25% |
| briarcrab | Elderroot Glade (clearing-2) / Lv18 | Uncommon / 15 residents / immediate elsewhere | 12 coins @100%; 1 Grinroot Echo @15% | 2100 | 1 Meadow Fiber @25% |
| glowcap | Rootveil Cave (clearing-3) / Lv20 | Uncommon / 15 residents / immediate elsewhere | 12 coins @100%; 1 Glowcap Echo @15% | 2300 | 1 Meadow Fiber @25% |
| leafmantis | Fernpath Woods (clearing-1) / Lv22 | Very rare / 3 residents / 60s | 13 coins @100%; 1 Leafmantis Echo @15% | 2500 | 1 Meadow Fiber @25% |
| elderroot | Mosslight boss / future group encounter | Boss / no wild slot | NONE: reward-free preview | 0 | 1 Elderroot essence @0.01% per future group victory; ordinary loot TBD |

## Windstep

| Species ID | Source / level | Map population / replacement delay | LIVE drops | LIVE XP / individual | PLANNED ONLY |
| --- | --- | --- | --- | --- | --- |
| stormowl | Windstep Prairie (rise-0) / Lv60 | Rare / 3 residents / 60s | 26 coins @100%; 1 Tempestool Echo @15% | 6300 | 1 Wind Thread @25% |
| galeibex | Windstep Prairie (rise-0) / Lv62 | Very rare / 3 residents / 60s | 26 coins @100%; 1 Hornvault Echo @15% | 6500 | 1 Wind Thread @25% |
| cloudfin | Windstep Prairie (rise-0) / Lv64 | Rare / 3 residents / 60s | 27 coins @100%; 1 Cloudfin Echo @15% | 6700 | 1 Wind Thread @25% |
| thunderbeetle | Windstep Prairie (rise-0) / Lv66 | Uncommon / 15 residents / immediate elsewhere | 28 coins @100%; 1 Brontobug Echo @15% | 6900 | 1 Wind Thread @25% |
| skyrabbit | Skybough Forest (rise-1) / Lv64 | Uncommon / 15 residents / immediate elsewhere | 27 coins @100%; 1 Hopgrit Echo @15% | 6700 | 1 Wind Thread @25% |
| razorswift | Skybough Forest (rise-1) / Lv66 | Uncommon / 15 residents / immediate elsewhere | 28 coins @100%; 1 Razorwing Echo @15% | 6900 | 1 Wind Thread @25% |
| tempestcub | Skybough Forest (rise-1) / Lv68 | Rare / 3 residents / 60s | 28 coins @100%; 1 Squallcub Echo @15% | 7100 | 1 Wind Thread @25% |
| bouldereagle | Skybough Forest (rise-1) / Lv70 | Uncommon / 15 residents / immediate elsewhere | 29 coins @100%; 1 Cragbeak Echo @15% | 7300 | 1 Wind Thread @25% |
| whistleweasel | Highwind Escarpment (rise-2) / Lv68 | Uncommon / 15 residents / immediate elsewhere | 28 coins @100%; 1 Whistlepod Echo @15% | 7100 | 1 Wind Thread @25% |
| stormstilt | Highwind Escarpment (rise-2) / Lv70 | Uncommon / 15 residents / immediate elsewhere | 29 coins @100%; 1 Windlass Echo @15% | 7300 | 1 Wind Thread @25% |
| kitejelly | Highwind Escarpment (rise-2) / Lv72 | Rare / 3 residents / 60s | 30 coins @100%; 1 Kiteskulk Echo @15% | 7500 | 1 Wind Thread @25% |
| fluffyak | Highwind Escarpment (rise-2) / Lv74 | Uncommon / 15 residents / immediate elsewhere | 30 coins @100%; 1 Fluffyak Echo @15% | 7700 | 1 Wind Thread @25% |
| zephyrlynx | Thunderhollow Cave (rise-3) / Lv72 | Very rare / 3 residents / 60s | 30 coins @100%; 1 Velvimp Echo @15% | 7500 | 1 Wind Thread @25% |
| prismwasp | Thunderhollow Cave (rise-3) / Lv74 | Uncommon / 15 residents / immediate elsewhere | 30 coins @100%; 1 Prismspear Echo @15% | 7700 | 1 Wind Thread @25% |
| skycorolla | Thunderhollow Cave (rise-3) / Lv76 | Rare / 3 residents / 60s | 31 coins @100%; 1 Skycorolla Echo @15% | 7900 | 1 Wind Thread @25% |
| tempestrook | Windstep boss / future group encounter | Boss / no wild slot | NONE: reward-free preview | 0 | 1 Tempestrook essence @0.01% per future group victory; ordinary loot TBD |

## Moonwell

| Species ID | Source / level | Map population / replacement delay | LIVE drops | LIVE XP / individual | PLANNED ONLY |
| --- | --- | --- | --- | --- | --- |
| frostfang | Moonlit Gardens (ruins-0) / Lv40 | Rare / 3 residents / 60s | 19 coins @100%; 1 Shardclaw Echo @15% | 4300 | 1 Moon Chalk @25% |
| moonrabbit | Moonlit Gardens (ruins-0) / Lv42 | Rare / 3 residents / 60s | 20 coins @100%; 1 Pillowisp Echo @15% | 4500 | 1 Moon Chalk @25% |
| runecrab | Moonlit Gardens (ruins-0) / Lv44 | Uncommon / 15 residents / immediate elsewhere | 20 coins @100%; 1 Cairnclamp Echo @15% | 4700 | 1 Moon Chalk @25% |
| starnewt | Moonlit Gardens (ruins-0) / Lv46 | Uncommon / 15 residents / immediate elsewhere | 21 coins @100%; 1 Starfrog Echo @15% | 4900 | 1 Moon Chalk @25% |
| veilray | Whisperwood (ruins-1) / Lv44 | Uncommon / 15 residents / immediate elsewhere | 20 coins @100%; 1 Veilora Echo @15% | 4700 | 1 Moon Chalk @25% |
| duskmarten | Whisperwood (ruins-1) / Lv46 | Very rare / 3 residents / 60s | 21 coins @100%; 1 Inkmarten Echo @15% | 4900 | 1 Moon Chalk @25% |
| opalowl | Whisperwood (ruins-1) / Lv48 | Uncommon / 15 residents / immediate elsewhere | 22 coins @100%; 1 Hushowl Echo @15% | 5100 | 1 Moon Chalk @25% |
| lanternslug | Whisperwood (ruins-1) / Lv50 | Uncommon / 15 residents / immediate elsewhere | 22 coins @100%; 1 Maskin Echo @15% | 5300 | 1 Moon Chalk @25% |
| mirrormantis | Fallen Observatory (ruins-2) / Lv48 | Uncommon / 15 residents / immediate elsewhere | 22 coins @100%; 1 Mirrormantis Echo @15% | 5100 | 1 Moon Chalk @25% |
| crystalurchin | Fallen Observatory (ruins-2) / Lv50 | Rare / 3 residents / 60s | 22 coins @100%; 1 Hexurchin Echo @15% | 5300 | 1 Moon Chalk @25% |
| dreamtapir | Fallen Observatory (ruins-2) / Lv52 | Uncommon / 15 residents / immediate elsewhere | 23 coins @100%; 1 Dreamtapir Echo @15% | 5500 | 1 Moon Chalk @25% |
| moongolem | Fallen Observatory (ruins-2) / Lv54 | Uncommon / 15 residents / immediate elsewhere | 24 coins @100%; 1 Cairnkin Echo @15% | 5700 | 1 Moon Chalk @25% |
| astralfox | Moonstone Cave (ruins-3) / Lv52 | Uncommon / 15 residents / immediate elsewhere | 23 coins @100%; 1 Lunaskein Echo @15% | 5500 | 1 Moon Chalk @25% |
| echochime | Ghost Tower · Floor 3 (ghost-tower-3) / Lv28 | Rare / 3 residents / 60s | 15 coins @100%; 1 Echochime Echo @15% | 3100 | 1 Moon Chalk @25% |
| pearlwyrm | Moonstone Cave (ruins-3) / Lv56 | Uncommon / 15 residents / immediate elsewhere | 24 coins @100%; 1 Pearlweaver Echo @15% | 5900 | 1 Moon Chalk @25% |
| inksprite | Moonstone Cave (ruins-3) / Lv58 | Uncommon / 15 residents / immediate elsewhere | 25 coins @100%; 1 Inksprite Echo @15% | 6100 | 1 Moon Chalk @25% |
| moonweaver | Moonwell boss / future group encounter | Boss / no wild slot | NONE: reward-free preview | 0 | 1 Moonweaver essence @0.01% per future group victory; ordinary loot TBD |

## Amber Hollow

| Species ID | Source / level | Map population / replacement delay | LIVE drops | LIVE XP / individual | PLANNED ONLY |
| --- | --- | --- | --- | --- | --- |
| cindrake | Amber Heath (hollow-0) / Lv20 | Rare / 3 residents / 60s | 12 coins @100%; 1 Ashskate Echo @15% | 2300 | 1 Amber Resin @25% |
| thornstag | Amber Heath (hollow-0) / Lv22 | Rare / 3 residents / 60s | 13 coins @100%; 1 Thornmaw Echo @15% | 2500 | 1 Amber Resin @25% |
| copperhog | Amber Heath (hollow-0) / Lv24 | Uncommon / 15 residents / immediate elsewhere | 14 coins @100%; 1 Bellowsnout Echo @15% | 2700 | 1 Amber Resin @25% |
| amberkite | Amber Heath (hollow-0) / Lv26 | Uncommon / 15 residents / immediate elsewhere | 14 coins @100%; 1 Amberkite Echo @15% | 2900 | 1 Amber Resin @25% |
| cindermole | Copperleaf Forest (hollow-1) / Lv24 | Rare / 3 residents / 60s | 14 coins @100%; 1 Cindertroop Echo @15% | 2700 | 1 Amber Resin @25% |
| sunscarab | Copperleaf Forest (hollow-1) / Lv26 | Uncommon / 15 residents / immediate elsewhere | 14 coins @100%; 1 Sunscarab Echo @15% | 2900 | 1 Amber Resin @25% |
| embersalam | Copperleaf Forest (hollow-1) / Lv28 | Uncommon / 15 residents / immediate elsewhere | 15 coins @100%; 1 Puffiend Echo @15% | 3100 | 1 Amber Resin @25% |
| ochrewisp | Ghost Tower Entrance (hollow-2) / Lv22 | Uncommon / 15 residents / immediate elsewhere | 13 coins @100%; 1 Casketot Echo @15% | 2500 | 1 Amber Resin @25% |
| ochrewisp | Ghost Tower · Floor 1 (ghost-tower-1) / Lv23 | Uncommon / 15 residents / immediate elsewhere | 13 coins @100%; 1 Casketot Echo @15% | 2600 | 1 Amber Resin @25% |
| ochrewisp | Ghost Tower · Floor 2 (ghost-tower-2) / Lv25 | Uncommon / 15 residents / immediate elsewhere | 14 coins @100%; 1 Casketot Echo @15% | 2800 | 1 Amber Resin @25% |
| ochrewisp | Ghost Tower · Floor 4 · Rooftop Cemetery (ghost-tower-4) / Lv28 | Uncommon / 15 residents / immediate elsewhere | 15 coins @100%; 1 Casketot Echo @15% | 3100 | 1 Amber Resin @25% |
| bronzebuck | Ghost Tower Entrance (hollow-2) / Lv28 | Rare / 3 residents / 60s | 15 coins @100%; 1 Gonglet Echo @15% | 3100 | 1 Amber Resin @25% |
| thistlehare | Ghost Tower · Floor 2 (ghost-tower-2) / Lv26 | Very rare / 3 residents / 60s | 14 coins @100%; 1 Pinstitch Echo @15% | 2900 | 1 Amber Resin @25% |
| ashporcupine | Ghost Tower · Floor 1 (ghost-tower-1) / Lv24 | Uncommon / 15 residents / immediate elsewhere | 14 coins @100%; 1 Wickeep Echo @15% | 2700 | 1 Amber Resin @25% |
| ashporcupine | Ghost Tower · Floor 3 (ghost-tower-3) / Lv27 | Uncommon / 15 residents / immediate elsewhere | 15 coins @100%; 1 Wickeep Echo @15% | 3000 | 1 Amber Resin @25% |
| ashporcupine | Ghost Tower · Floor 4 · Rooftop Cemetery (ghost-tower-4) / Lv29 | Uncommon / 15 residents / immediate elsewhere | 15 coins @100%; 1 Wickeep Echo @15% | 3200 | 1 Amber Resin @25% |
| resinroach | Ghost Tower Entrance (hollow-2) / Lv34 | Uncommon / 15 residents / immediate elsewhere | 17 coins @100%; 1 Resinrook Echo @15% | 3700 | 1 Amber Resin @25% |
| marigoldia | Emberglass Cave (hollow-3) / Lv32 | Rare / 3 residents / 60s | 16 coins @100%; 1 Marigloom Echo @15% | 3500 | 1 Amber Resin @25% |
| flintjackal | Emberglass Cave (hollow-3) / Lv34 | Uncommon / 15 residents / immediate elsewhere | 17 coins @100%; 1 Cinderknuckle Echo @15% | 3700 | 1 Amber Resin @25% |
| dunecoil | Emberglass Cave (hollow-3) / Lv36 | Uncommon / 15 residents / immediate elsewhere | 18 coins @100%; 1 Ribwhirl Echo @15% | 3900 | 1 Amber Resin @25% |
| saffronmoth | Emberglass Cave (hollow-3) / Lv38 | Uncommon / 15 residents / immediate elsewhere | 18 coins @100%; 1 Saffrune Echo @15% | 4100 | 1 Amber Resin @25% |
| ambercolossus | Amber Hollow boss / future group encounter | Boss / no wild slot | NONE: reward-free preview | 0 | 1 Ambercolossus essence @0.01% per future group victory; ordinary loot TBD |

## Willowbrook

| Species ID | Source / level | Map population / replacement delay | LIVE drops | LIVE XP / individual | PLANNED ONLY |
| --- | --- | --- | --- | --- | --- |
| ironback | Brookside Fields (brook-0) / Lv8 | Uncommon / 15 residents / immediate elsewhere | 8 coins @100%; 1 Ironback Echo @15% | 1100 | 1 River Glass @25% |
| lumimoth | Brookside Fields (brook-0) / Lv10 | Uncommon / 15 residents / immediate elsewhere | 9 coins @100%; 1 Lumimoth Echo @15% | 1300 | 1 River Glass @25% |
| rillrook | Brookside Fields (brook-0) / Lv12 | Rare / 3 residents / 60s | 10 coins @100%; 1 Keepsake Echo @15% | 1500 | 1 River Glass @25% |
| shellsnail | Brookside Fields (brook-0) / Lv14 | Uncommon / 15 residents / immediate elsewhere | 10 coins @100%; 1 Shellsnail Echo @15% | 1700 | 1 River Glass @25% |
| brooktoad | Rainwillow Forest (brook-1) / Lv12 | Uncommon / 15 residents / immediate elsewhere | 10 coins @100%; 1 Brooktoad Echo @15% | 1500 | 1 River Glass @25% |
| glassshrimp | Rainwillow Forest (brook-1) / Lv14 | Uncommon / 15 residents / immediate elsewhere | 10 coins @100%; 1 Snapglass Echo @15% | 1700 | 1 River Glass @25% |
| lotusmanta | Rainwillow Forest (brook-1) / Lv16 | Rare / 3 residents / 60s | 11 coins @100%; 1 Lotusmanta Echo @15% | 1900 | 1 River Glass @25% |
| ripplelynx | Rainwillow Forest (brook-1) / Lv18 | Uncommon / 15 residents / immediate elsewhere | 12 coins @100%; 1 Rillblade Echo @15% | 2100 | 1 River Glass @25% |
| rainram | Reedwatch Banks (brook-2) / Lv16 | Uncommon / 15 residents / immediate elsewhere | 11 coins @100%; 1 Pluvault Echo @15% | 1900 | 1 River Glass @25% |
| driftjelly | Reedwatch Banks (brook-2) / Lv18 | Uncommon / 15 residents / immediate elsewhere | 12 coins @100%; 1 Driftjelly Echo @15% | 2100 | 1 River Glass @25% |
| mudmole | Reedwatch Banks (brook-2) / Lv20 | Rare / 3 residents / 60s | 12 coins @100%; 1 Burrowlug Echo @15% | 2300 | 1 River Glass @25% |
| heronveil | Reedwatch Banks (brook-2) / Lv22 | Uncommon / 15 residents / immediate elsewhere | 13 coins @100%; 1 Veilheron Echo @15% | 2500 | 1 River Glass @25% |
| siltwyrm | Springwater Cave (brook-3) / Lv20 | Very rare / 3 residents / 60s | 12 coins @100%; 1 Silkstep Echo @15% | 2300 | 1 River Glass @25% |
| coralimp | Springwater Cave (brook-3) / Lv22 | Uncommon / 15 residents / immediate elsewhere | 13 coins @100%; 1 Reefvault Echo @15% | 2500 | 1 River Glass @25% |
| lilydeer | Springwater Cave (brook-3) / Lv24 | Rare / 3 residents / 60s | 14 coins @100%; 1 Lilydeer Echo @15% | 2700 | 1 River Glass @25% |
| mistseal | Springwater Cave (brook-3) / Lv26 | Uncommon / 15 residents / immediate elsewhere | 14 coins @100%; 1 Mistmelt Echo @15% | 2900 | 1 River Glass @25% |
| tidecrown | Willowbrook boss / future group encounter | Boss / no wild slot | NONE: reward-free preview | 0 | 1 Tidecrown essence @0.01% per future group victory; ordinary loot TBD |

## Ashen Reach

| Species ID | Source / level | Map population / replacement delay | LIVE drops | LIVE XP / individual | PLANNED ONLY |
| --- | --- | --- | --- | --- | --- |
| magmatoad | Ashgrass Expanse (ashen-0) / Lv80 | Uncommon / 15 residents / immediate elsewhere | 32 coins @100%; 1 Crucibulk Echo @15% | 8300 | 1 Cooled Glass @25% |
| obsidianram | Ashgrass Expanse (ashen-0) / Lv82 | Uncommon / 15 residents / immediate elsewhere | 33 coins @100%; 1 Cairnox Echo @15% | 8500 | 1 Cooled Glass @25% |
| pyrewolf | Ashgrass Expanse (ashen-0) / Lv84 | Uncommon / 15 residents / immediate elsewhere | 34 coins @100%; 1 Pyreling Echo @15% | 8700 | 1 Cooled Glass @25% |
| emberorchid | Ashgrass Expanse (ashen-0) / Lv86 | Rare / 3 residents / 60s | 34 coins @100%; 1 Emberorchid Echo @15% | 8900 | 1 Cooled Glass @25% |
| cindercentipede | Cinderwood (ashen-1) / Lv84 | Uncommon / 15 residents / immediate elsewhere | 34 coins @100%; 1 Kilncoil Echo @15% | 8700 | 1 Cooled Glass @25% |
| basalturtle | Cinderwood (ashen-1) / Lv86 | Uncommon / 15 residents / immediate elsewhere | 34 coins @100%; 1 Slagbud Echo @15% | 8900 | 1 Cooled Glass @25% |
| ashbasilisk | Cinderwood (ashen-1) / Lv88 | Uncommon / 15 residents / immediate elsewhere | 35 coins @100%; 1 Ashbasilisk Echo @15% | 9100 | 1 Cooled Glass @25% |
| glassphoenix | Cinderwood (ashen-1) / Lv90 | Rare / 3 residents / 60s | 36 coins @100%; 1 Glassphoenix Echo @15% | 9300 | 1 Cooled Glass @25% |
| coalbadger | Obsidian Approach (ashen-2) / Lv88 | Very rare / 3 residents / 60s | 35 coins @100%; 1 Slagjaw Echo @15% | 9100 | 1 Cooled Glass @25% |
| steamaxolotl | Obsidian Approach (ashen-2) / Lv90 | Uncommon / 15 residents / immediate elsewhere | 36 coins @100%; 1 Steamaxolotl Echo @15% | 9300 | 1 Cooled Glass @25% |
| lavaurchin | Obsidian Approach (ashen-2) / Lv92 | Uncommon / 15 residents / immediate elsewhere | 36 coins @100%; 1 Cinderwink Echo @15% | 9500 | 1 Cooled Glass @25% |
| volcanomoth | Obsidian Approach (ashen-2) / Lv94 | Rare / 3 residents / 60s | 37 coins @100%; 1 Mournmantle Echo @15% | 9700 | 1 Cooled Glass @25% |
| sootimp | Deepember Cave (ashen-3) / Lv92 | Uncommon / 15 residents / immediate elsewhere | 36 coins @100%; 1 Coalgrub Echo @15% | 9500 | 1 Cooled Glass @25% |
| moltencoil | Deepember Cave (ashen-3) / Lv94 | Uncommon / 15 residents / immediate elsewhere | 37 coins @100%; 1 Moltencoil Echo @15% | 9700 | 1 Cooled Glass @25% |
| auroradrake | Deepember Cave (ashen-3) / Lv96 | Uncommon / 15 residents / immediate elsewhere | 38 coins @100%; 1 Auroradrake Echo @15% | 9900 | 1 Cooled Glass @25% |
| cinderempress | Ashen Reach boss / future group encounter | Boss / no wild slot | NONE: reward-free preview | 0 | 1 Cinderempress essence @0.01% per future group victory; ordinary loot TBD |

## Proposed material uses

| Region | Material ID / name | Proposed use |
| --- | --- | --- |
| Mosslight | meadowfiber / Meadow Fiber | Woven Inner Sea mats |
| Windstep | windthread / Wind Thread | Decorative pennants |
| Moonwell | moonchalk / Moon Chalk | Moonwell wall patterns |
| Amber Hollow | amberresin / Amber Resin | Warm lantern housings |
| Willowbrook | riverpearl / River Glass | Water-themed Inner Sea ornaments |
| Ashen Reach | coolglass / Cooled Glass | Ashen garden ornaments |
