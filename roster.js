/* Original v13 species manifest. Kits reuse mechanics, not species IDs/skins. */
(function(root){
'use strict';
const C=root.BondContent;
const rows=[
 [
  "seedhare",
  "Seedhare",
  "rabbit",
  "Earth",
  "Melee DPS",
  "pounce quickstep spore bark renewal",
  "Petal",
  "Long ears shelter a pouch of sleeping seeds",
  0
 ],
 [
  "mossling",
  "Mossling",
  "sprout",
  "Earth",
  "Support",
  "bloom petalward rootbind cleanse renewal",
  "Sprout",
  "A walking garden that shares its morning dew",
  0
 ],
 [
  "acornboar",
  "Acornboar",
  "boar",
  "Earth",
  "Tank",
  "slam fortify guard antler lifebud",
  "Acorn",
  "An oak-armored forager with curling wooden tusks",
  0
 ],
 [
  "pebblepup",
  "Pebblepup",
  "hound",
  "Earth",
  "Melee DPS",
  "pounce boulder quickstep fortify pierce",
  "Pebble",
  "A stone-footed puppy that chases falling stars",
  0
 ],
 [
  "dewfin",
  "Dewfin",
  "fish",
  "Water",
  "Support",
  "ripples bubbleward riptide rivercleanse springwater",
  "Dew",
  "A floating pond fish carried by its own water ring",
  0
 ],
 [
  "cloverbug",
  "Cloverbug",
  "beetle",
  "Earth",
  "Tank",
  "shellbash carapace shellguard spore lifebud",
  "Clover",
  "Four clover plates fold over a stubborn beetle",
  0
 ],
 [
  "ferncoil",
  "Ferncoil",
  "snake",
  "Earth",
  "Ranged DPS",
  "rootbind spore entangle quickstep boulder",
  "Fern",
  "Its fern-frond tail scatters needle-sharp seeds",
  0
 ],
 [
  "honeybat",
  "Honeylark",
  "bird",
  "Wind",
  "Support",
  "moondust lantern cleanse moonbeam petalward",
  "Honey",
  "A nectar-feeding lark with a honeycomb throat pouch and golden feather fans.",
  0
 ],
 [
  "reedwren",
  "Reedwren",
  "bird",
  "Wind",
  "Ranged DPS",
  "snipe gust tailwind chain quickstep",
  "Reed",
  "A reed-beaked songbird that whistles arrows",
  0
 ],
 [
  "briarcrab",
  "Briarcrab",
  "crab",
  "Earth",
  "Tank",
  "guard shellbash fortify rootbind rally",
  "Briar",
  "A bramble claw and broad shell guard the shallows",
  0
 ],
 [
  "glowcap",
  "Glowcap",
  "mushroom",
  "Earth",
  "Support",
  "spore bloom cleanse petalward ripples",
  "Glow",
  "A luminous mushroom whose spores soothe weary travelers",
  0
 ],
 [
  "leafmantis",
  "Leafmantis",
  "mantis",
  "Wind",
  "Melee DPS",
  "antler pierce quickstep rootbind snowhide",
  "Leaf",
  "Its leaf-shaped blades dance between tall stalks",
  0
 ],
 [
  "rillrook",
  "Rillrook",
  "bird",
  "Water",
  "Ranged DPS",
  "riptide snipe tailwind frost bubbleward",
  "Rill",
  "A kingfisher wearing a crown of river reeds",
  1
 ],
 [
  "shellsnail",
  "Shellsnail",
  "snail",
  "Water",
  "Tank",
  "carapace shellguard riptide lifebud ironward",
  "Spiral",
  "A spiral shell stores water for an entire woodland",
  1
 ],
 [
  "brooktoad",
  "Brooktoad",
  "frog",
  "Water",
  "Support",
  "springwater bubbleward spore rivercleanse ripples",
  "Brook",
  "A round-cheeked toad that nurses river seedlings",
  1
 ],
 [
  "glassshrimp",
  "Glasshrimp",
  "shrimp",
  "Water",
  "Ranged DPS",
  "snipe frost riptide quickstep bubbleward",
  "Glass",
  "Translucent pincers bend sunlight into sharp needles",
  1
 ],
 [
  "lotusmanta",
  "Lotusmanta",
  "manta",
  "Water",
  "Support",
  "ripples springwater lantern aurora bubbleward",
  "Lotus",
  "Wide lotus wings skim the river without a ripple",
  1
 ],
 [
  "ripplelynx",
  "Ripplelynx",
  "cat",
  "Water",
  "Melee DPS",
  "frostbite icepounce packrush snowhide pierce",
  "Ripple",
  "Water trails from the tufts of its pointed ears",
  1
 ],
 [
  "rainram",
  "Rainram",
  "ram",
  "Water",
  "Tank",
  "antler fortify guard riptide lifebud",
  "Rain",
  "Coiled blue horns gather rainclouds",
  1
 ],
 [
  "driftjelly",
  "Driftjelly",
  "jelly",
  "Water",
  "Support",
  "moondust bubbleward riptide cleanse aurora",
  "Drift",
  "A bell of clear water shelters a tiny pearl",
  1
 ],
 [
  "mudmole",
  "Mudmole",
  "mole",
  "Earth",
  "Tank",
  "boulder slam carapace wildguard lifebud",
  "Mud",
  "Wide digging claws build safe tunnels below the river",
  1
 ],
 [
  "heronveil",
  "Heronveil",
  "heron",
  "Wind",
  "Ranged DPS",
  "snipe chain gust tailwind snowhide",
  "Heron",
  "A tall silver heron wrapped in mist ribbons",
  1
 ],
 [
  "siltwyrm",
  "Siltspider",
  "spider",
  "Earth",
  "Melee DPS",
  "pierce antler rootbind fortify pounce",
  "Silt",
  "An eight-legged riverbank spider with shovel-shaped front feet and a silk-wrapped abdomen.",
  1
 ],
 [
  "coralimp",
  "Coralhopper",
  "grasshopper",
  "Water",
  "Ranged DPS",
  "frost nova riptide bubbleward comet",
  "Coral",
  "A reef-colored grasshopper with long springing hind legs and coral-patterned antennae.",
  1
 ],
 [
  "lilydeer",
  "Lilydeer",
  "deer",
  "Earth",
  "Support",
  "renewal petalward rootbind lifebud haste",
  "Lily",
  "Lilies bloom along the antlers of this gentle grazer",
  1
 ],
 [
  "mistseal",
  "Mistseal",
  "seal",
  "Water",
  "Support",
  "springwater ripples snowhide cleanse frost",
  "Mist",
  "A whiskered seal that rolls through shallow clouds",
  1
 ],
 [
  "copperhog",
  "Copperhog",
  "boar",
  "Fire",
  "Tank",
  "slam fortify guard scorch rally",
  "Copper",
  "Warm copper scales rattle when it charges",
  2
 ],
 [
  "amberkite",
  "Amberkite",
  "bird",
  "Wind",
  "Ranged DPS",
  "snipe gust chain quickstep tailwind",
  "Amber",
  "Amber vanes turn every gust into a cutting current",
  2
 ],
 [
  "cindermole",
  "Cinderant",
  "ant",
  "Fire",
  "Melee DPS",
  "burn pounce pierce ashveil boulder",
  "Cinder",
  "A low six-legged ant with glowing mandibles and a soot-dark segmented abdomen.",
  2
 ],
 [
  "sunscarab",
  "Sunscarab",
  "beetle",
  "Fire",
  "Tank",
  "carapace shellbash firefan ironward shellguard",
  "Solar",
  "A sun-disc shell warms companions through cold nights",
  2
 ],
 [
  "embersalam",
  "Embertoad",
  "frog",
  "Fire",
  "Ranged DPS",
  "scorch fireball emberbreath ashveil wingdraft",
  "Ember",
  "A squat ember-speckled toad with an inflatable throat sac and broad hopping legs.",
  2
 ],
 [
  "ochrewisp",
  "Ochrewisp",
  "wisp",
  "Earth",
  "Support",
  "moondust bloom petalward rootbind cleanse",
  "Ochre",
  "An amber lantern floats over a braid of old roots",
  2
 ],
 [
  "bronzebuck",
  "Bronzecrane",
  "heron",
  "Earth",
  "Tank",
  "antler rootbind wildguard fortify greencanopy",
  "Bronze",
  "A heavy crane with bronze beak plates, broad guarding wings and long stilt legs.",
  2
 ],
 [
  "thistlehare",
  "Thistlehare",
  "rabbit",
  "Earth",
  "Melee DPS",
  "pounce spore quickstep pierce rootbind",
  "Thistle",
  "Thistle spines stand upright along its long ears",
  2
 ],
 [
  "ashporcupine",
  "Ashporcupine",
  "porcupine",
  "Fire",
  "Tank",
  "boulder carapace scorch guard shellbash",
  "Ash",
  "Its charcoal quills glow when it protects a friend",
  2
 ],
 [
  "resinroach",
  "Resinroach",
  "beetle",
  "Earth",
  "Ranged DPS",
  "spore boulder rootbind quickstep ironward",
  "Resin",
  "A resin-winged crawler with a long seed cannon",
  2
 ],
 [
  "marigoldia",
  "Marigoldia",
  "flower",
  "Earth",
  "Support",
  "bloom renewal petalward cleanse entangle",
  "Marigold",
  "Its broad flower face follows every patch of sunlight",
  2
 ],
 [
  "flintjackal",
  "Flintjackal",
  "hound",
  "Fire",
  "Melee DPS",
  "burn pierce pounce quickstep firefan",
  "Flint",
  "Stone teeth strike sparks against its flint collar",
  2
 ],
 [
  "dunecoil",
  "Dunecoil",
  "snake",
  "Earth",
  "Ranged DPS",
  "boulder rootbind spore snowhide gust",
  "Dune",
  "A sand sail rises above the coils of this patient hunter",
  2
 ],
 [
  "saffronmoth",
  "Saffronmoth",
  "moth",
  "Wind",
  "Support",
  "moondust lantern aurora moonbeam cleanse",
  "Saffron",
  "Saffron eyespots shimmer like tiny evening suns",
  2
 ],
 [
  "moonrabbit",
  "Moonrabbit",
  "rabbit",
  "Water",
  "Support",
  "moondust aurora snowhide frost lantern",
  "Moon",
  "Crescent ears reflect the light of the Moonwell",
  3
 ],
 [
  "runecrab",
  "Runecrab",
  "crab",
  "Earth",
  "Tank",
  "ironward shellguard shellbash stonewave carapace",
  "Rune",
  "Old runes travel over the surface of its stone claw",
  3
 ],
 [
  "starnewt",
  "Starfrog",
  "frog",
  "Water",
  "Ranged DPS",
  "frost comet riptide bubbleward nova",
  "Star",
  "A squat pond frog with star-shaped cheek markings, webbed toes and powerful folded hind legs.",
  3
 ],
 [
  "veilray",
  "Veilray",
  "manta",
  "Wind",
  "Support",
  "lantern aurora moonbeam bubbleward cleanse",
  "Veil",
  "Its trailing ribbons trace forgotten constellations",
  3
 ],
 [
  "duskmarten",
  "Duskmarten",
  "marten",
  "Water",
  "Melee DPS",
  "frostbite pierce icepounce quickstep snowhide",
  "Dusk",
  "A long, silver-tailed guardian of ruined libraries",
  3
 ],
 [
  "opalowl",
  "Opalowl",
  "owl",
  "Wind",
  "Ranged DPS",
  "chain snipe staticbolt tailwind frost",
  "Opal",
  "Opal eye rings focus distant starlight into needles",
  3
 ],
 [
  "lanternslug",
  "Lanternslug",
  "slug",
  "Earth",
  "Support",
  "bloom moondust petalward rootbind cleanse",
  "Lantern",
  "A tiny lantern grows from the end of its feelers",
  3
 ],
 [
  "mirrormantis",
  "Mirrormantis",
  "mantis",
  "Wind",
  "Melee DPS",
  "pierce antler quickstep snowhide frostbite",
  "Mirror",
  "Faceted forearms reflect the movement of its opponent",
  3
 ],
 [
  "crystalurchin",
  "Crystalurchin",
  "urchin",
  "Water",
  "Tank",
  "carapace boulder fortify frost guard",
  "Crystal",
  "A ring of pale crystals surrounds a warm beating core",
  3
 ],
 [
  "dreamtapir",
  "Dreamtapir",
  "tapir",
  "Water",
  "Support",
  "lull ripples moondust bubbleward rivercleanse",
  "Dream",
  "A curled trunk drinks mist from the sleeping well",
  3
 ],
 [
  "moongolem",
  "Moongolem",
  "golem",
  "Earth",
  "Tank",
  "fortify slam guard boulder rally",
  "Moonstone",
  "A small moonstone guardian with floating ring shoulders",
  3
 ],
 [
  "astralfox",
  "Astralfox",
  "fox",
  "Wind",
  "Melee DPS",
  "pounce pierce quickstep moonbeam snowhide",
  "Astral",
  "Its split fan tail draws bright arcs through moonlight",
  3
 ],
 [
  "echochime",
  "Echochime",
  "bell",
  "Wind",
  "Support",
  "aurora lantern cleanse moonbeam petalward",
  "Chime",
  "A living bell carries the voices of friendly spirits",
  3
 ],
 [
  "pearlwyrm",
  "Pearlweaver",
  "spider",
  "Water",
  "Ranged DPS",
  "frost riptide comet ashveil snowfall",
  "Pearl",
  "An eight-legged cave spider with pearl spinnerets and a bead-patterned oval abdomen.",
  3
 ],
 [
  "inksprite",
  "Inksprite",
  "imp",
  "Water",
  "Ranged DPS",
  "hex nova frost bubbleward moonbeam",
  "Ink",
  "Ink-brush horns sketch harmless trails behind each spell",
  3
 ],
 [
  "galeibex",
  "Galeibex",
  "ram",
  "Wind",
  "Tank",
  "antler wildguard fortify gust rally",
  "Gale",
  "Swept-back horns help it brace against cliff winds",
  4
 ],
 [
  "cloudfin",
  "Cloudfin",
  "fish",
  "Wind",
  "Support",
  "lantern aurora bubbleward ripples gust",
  "Cloud",
  "Feathered fins keep this sky fish aloft",
  4
 ],
 [
  "thunderbeetle",
  "Thunderbeetle",
  "beetle",
  "Wind",
  "Tank",
  "carapace shellbash staticbolt ironward guard",
  "Thunder",
  "Forked antennae collect charge beneath a heavy carapace",
  4
 ],
 [
  "skyrabbit",
  "Skyquail",
  "bird",
  "Wind",
  "Melee DPS",
  "quickstep pounce pierce gust snowhide",
  "Sky",
  "A round prairie quail whose sail-shaped crest steadies its long gliding hops.",
  4
 ],
 [
  "razorswift",
  "Razorswift",
  "bird",
  "Wind",
  "Ranged DPS",
  "snipe gust tailwind chain staticbolt",
  "Razor",
  "A swept-wing swift with a needle-shaped beak",
  4
 ],
 [
  "tempestcub",
  "Tempestcub",
  "bear",
  "Wind",
  "Melee DPS",
  "pounce staticbolt quickstep pierce ashveil",
  "Tempest",
  "Thunder rolls inside its fluffy cloud mane",
  4
 ],
 [
  "bouldereagle",
  "Bouldereagle",
  "eagle",
  "Earth",
  "Tank",
  "boulder fortify ironward antler wildguard",
  "Boulder",
  "Stone flight feathers make it a patient protector",
  4
 ],
 [
  "whistleweasel",
  "Whistlecicada",
  "cicada",
  "Wind",
  "Support",
  "haste moondust cleanse gust petalward",
  "Whistle",
  "A broad-winged cicada whose ribbed chest hums warnings across the prairie.",
  4
 ],
 [
  "stormstilt",
  "Stormstilt",
  "heron",
  "Wind",
  "Ranged DPS",
  "snipe chain staticbolt gust tailwind",
  "Storm",
  "Long stilts keep its charged plumage above the water",
  4
 ],
 [
  "kitejelly",
  "Kitejelly",
  "jelly",
  "Wind",
  "Support",
  "lantern aurora moonbeam bubbleward haste",
  "Kite",
  "A diamond bell and streaming cords catch the high wind",
  4
 ],
 [
  "fluffyak",
  "Fluffyak",
  "yak",
  "Earth",
  "Tank",
  "guard fortify slam lifebud rally",
  "Fluff",
  "A shaggy little yak shelters travelers in its warm coat",
  4
 ],
 [
  "zephyrlynx",
  "Zephyrshrike",
  "bird",
  "Wind",
  "Melee DPS",
  "pounce pierce quickstep frostbite gust",
  "Zephyr",
  "A swift cliff shrike with a hooked beak, forked feather tail and ribbon crest.",
  4
 ],
 [
  "prismwasp",
  "Prismwasp",
  "wasp",
  "Wind",
  "Ranged DPS",
  "snipe staticbolt chain quickstep moonbeam",
  "Prism",
  "A crystal sting separates lightning into seven colors",
  4
 ],
 [
  "skycorolla",
  "Skycorolla",
  "flower",
  "Wind",
  "Support",
  "renewal haste petalward moonbeam cleanse",
  "Corolla",
  "Its petals turn slowly like a little windmill",
  4
 ],
 [
  "magmatoad",
  "Magmatoad",
  "frog",
  "Fire",
  "Tank",
  "fortify burn firefan guard lifebud",
  "Magma",
  "Pebbled cheeks shelter cool water beneath warm lava armor",
  5
 ],
 [
  "obsidianram",
  "Obsidianram",
  "ram",
  "Earth",
  "Tank",
  "antler guard fortify boulder rally",
  "Obsidian",
  "Polished obsidian horns form a shield above its face",
  5
 ],
 [
  "pyrewolf",
  "Pyrewolf",
  "hound",
  "Fire",
  "Melee DPS",
  "burn pounce pierce quickstep firefan",
  "Pyre",
  "A tall flame mane lights the path through ashfall",
  5
 ],
 [
  "emberorchid",
  "Emberorchid",
  "flower",
  "Fire",
  "Support",
  "renewal petalward scorch cleanse bloom",
  "Orchid",
  "Cool amber sap runs through heat-resistant petals",
  5
 ],
 [
  "cindercentipede",
  "Cindercentipede",
  "centipede",
  "Fire",
  "Melee DPS",
  "burn pierce quickstep antler ashveil",
  "Cinder",
  "Many tiny ember feet leave a dotted trail in the dark",
  5
 ],
 [
  "basalturtle",
  "Basalturtle",
  "turtle",
  "Earth",
  "Tank",
  "carapace shellguard shellbash boulder ironward",
  "Basalt",
  "A terraced basalt shell holds a miniature stone garden",
  5
 ],
 [
  "ashbasilisk",
  "Ashbasilisk",
  "lizard",
  "Fire",
  "Ranged DPS",
  "scorch fireball emberbreath ashveil hex",
  "Basilisk",
  "A fan-shaped ash crest opens before each spell",
  5
 ],
 [
  "glassphoenix",
  "Glassphoenix",
  "eagle",
  "Fire",
  "Ranged DPS",
  "fireball emberbreath comet wingdraft ashveil",
  "Phoenix",
  "Glass-edged wings refract the heat rising from the ground",
  5
 ],
 [
  "coalbadger",
  "Coalbadger",
  "badger",
  "Earth",
  "Tank",
  "slam wildguard fortify boulder lifebud",
  "Coal",
  "White stone stripes brighten a coal-dark burrower",
  5
 ],
 [
  "steamaxolotl",
  "Steamaxolotl",
  "axolotl",
  "Water",
  "Support",
  "springwater ripples bubbleward rivercleanse frost",
  "Steam",
  "Soft steam rises from its branching turquoise gills",
  5
 ],
 [
  "lavaurchin",
  "Lavafirefly",
  "firefly",
  "Fire",
  "Ranged DPS",
  "scorch boulder firefan ashveil staticbolt",
  "Lava",
  "A six-legged firefly with an amber lantern abdomen beneath dark glass wing cases.",
  5
 ],
 [
  "volcanomoth",
  "Volcanomoth",
  "moth",
  "Fire",
  "Support",
  "aurora moondust scorch lantern petalward",
  "Volcano",
  "Dark wings hide rings of warm volcanic light",
  5
 ],
 [
  "sootimp",
  "Sootweevil",
  "beetle",
  "Fire",
  "Ranged DPS",
  "hex fireball nova ashveil scorch",
  "Soot",
  "A soot-dusted weevil with a long curved snout and speckled ember wing cases.",
  5
 ],
 [
  "moltencoil",
  "Moltencoil",
  "snake",
  "Fire",
  "Melee DPS",
  "burn pierce antler ashveil firefan",
  "Molten",
  "Copper fins ripple along a long ember-red body",
  5
 ],
 [
  "auroradrake",
  "Auroradrake",
  "dragon",
  "Water",
  "Ranged DPS",
  "frost snowfall comet bubbleward wingdraft",
  "Aurora",
  "An ice-plumed drake nesting where hot and cold winds meet",
  5
 ],
 [
  "elderroot",
  "Elderroot",
  "treant",
  "Earth",
  "Tank",
  "guard rootbind greencanopy antler lifebud",
  "Ancient",
  "The patient guardian at the heart of Mosslight",
  0,
  "boss"
 ],
 [
  "tidecrown",
  "Tidecrown",
  "serpent",
  "Water",
  "Support",
  "ripples springwater rivercleanse bubbleward riptide",
  "Tidecrown",
  "A crowned river serpent tending the oldest springs",
  1,
  "boss"
 ],
 [
  "ambercolossus",
  "Ambercolossus",
  "golem",
  "Earth",
  "Tank",
  "fortify boulder slam guard rally",
  "Colossus",
  "Amber chambers glow inside a stone titan",
  2,
  "boss"
 ],
 [
  "moonweaver",
  "Moonweaver",
  "spider",
  "Water",
  "Support",
  "aurora petalward lull moonbeam cleanse",
  "Moonweave",
  "A silk-crowned guardian of the Moonwell constellations",
  3,
  "boss"
 ],
 [
  "tempestrook",
  "Tempestrook",
  "eagle",
  "Wind",
  "Ranged DPS",
  "chain snipe staticbolt tailwind gust",
  "Tempest",
  "A storm-winged keeper of the highest watchtower",
  4,
  "boss"
 ],
 [
  "cinderempress",
  "Cinderempress",
  "lizard",
  "Fire",
  "Melee DPS",
  "burn pierce emberbreath ashveil firefan",
  "Empress",
  "A massive ember-monitor lizard with a crownlike dorsal crest, four planted claws and a long muscular tail.",
  5,
  "boss"
 ]
];
const palettes={Earth:['#75966a','#c7d9a0'],Water:['#619ca9','#bbdedc'],Wind:['#8b96bb','#d1d7f0'],Fire:['#b76f58','#f2c180']};
const stats={
 'Melee DPS':[600,44,1.65,1.25,1,'melee','winter'],
 'Ranged DPS':[545,40,1.85,1,4,'magic','charged'],
 Tank:[960,25,2.2,.7,1,'melee','granite'],
 Support:[485,22,1.9,1,3,'magic','tender']
};
const initial={
 emberfox:[0,'Fire',true,'fox'],stonehorn:[0,'Earth',true,'rhino'],bloomslime:[0,'Earth',true,'slime'],tideotter:[0,'Water',true,'otter'],
 ironback:[1,'Earth',false,'turtle'],lumimoth:[1,'Wind',false,'moth'],cindrake:[2,'Fire',false,'dragon'],thornstag:[2,'Earth',false,'deer'],
 frostfang:[3,'Water',false,'cat'],stormowl:[4,'Wind',false,'owl']
};
for(const [id,[region,element,starter,shape]] of Object.entries(initial))Object.assign(C.UNITS[id],{region,element,starter,source:'wild',shape,rarity:starter?'Common':region<2?'Uncommon':'Rare',echoBP:starter?1000:1});
for(const [index,row] of rows.entries()){
 const [id,name,shape,element,role,kit,prefix,subtitle,region,source='wild']=row;
 const [hp,power,interval,moveSpeed,range,basicCategory,defaultPassive]=stats[role],pool=[];
 for(const [i,base] of kit.split(' ').entries()){
  const skillId=id+'_'+i,s=C.SKILLS[base];
  if(!s)throw Error('Unknown source skill '+base+' for '+id);
  C.SKILLS[skillId]={...s,name:prefix+' '+s.name};pool.push(skillId);
 }
 const passive=role==='Tank'?['granite','shell','lastgrove'][index%3]:role==='Support'?['tender','current','moonward'][index%3]:element==='Fire'?'kindling':role==='Melee DPS'?'winter':'charged';
 const canExploit=passive==='kindling'?pool.some(k=>C.SKILLS[k].effect==='burn'):passive==='winter'?pool.some(k=>C.SKILLS[k].effect==='slow'):true;
 const innate=canExploit?passive:role==='Melee DPS'?'cinder':defaultPassive;
 const finalPassive=innate==='cinder'&&!pool.some(k=>root.BondRules.damaging(C.SKILLS[k]))?'charged':innate;
 const colors=palettes[element],variation=(index%7)-3;
 C.UNITS[id]={name,subtitle,role,hp:hp+variation*8,power:power+Math.floor(variation/2),interval:interval+(index%3)*.025,moveSpeed,range,basicCategory,
  color:colors[0],skills:pool,default:pool.slice(0,3),passive:finalPassive,trait:C.PASSIVES[finalPassive].description,
  element,region,source,starter:false,shape,rarity:source==='boss'?'Boss':index%11===0?'Very rare':index%4===0?'Rare':'Uncommon',echoBP:1,
  artSpec:{shape,element,accent:colors[1],index:index+1,crest:index%5,tail:index%4}};
}
C.MONSTERS=Object.keys(C.UNITS).filter(k=>C.UNITS[k].role!=='Trainer');
// One inspiration family per species; family is not rarity or a power tier.
const families=[
 {
  "id": "Land",
  "label": "Land animal",
  "count": 25,
  "species": [
   "emberfox",
   "stonehorn",
   "thornstag",
   "frostfang",
   "seedhare",
   "acornboar",
   "pebblepup",
   "ripplelynx",
   "rainram",
   "mudmole",
   "lilydeer",
   "copperhog",
   "thistlehare",
   "ashporcupine",
   "flintjackal",
   "moonrabbit",
   "duskmarten",
   "dreamtapir",
   "astralfox",
   "galeibex",
   "tempestcub",
   "fluffyak",
   "obsidianram",
   "pyrewolf",
   "coalbadger"
  ]
 },
 {
  "id": "Bird",
  "label": "Bird",
  "count": 15,
  "species": [
   "stormowl",
   "reedwren",
   "rillrook",
   "heronveil",
   "amberkite",
   "opalowl",
   "razorswift",
   "bouldereagle",
   "stormstilt",
   "glassphoenix",
   "tempestrook",
   "honeybat",
   "skyrabbit",
   "bronzebuck",
   "zephyrlynx"
  ]
 },
 {
  "id": "Frog",
  "label": "Frog",
  "count": 4,
  "species": [
   "brooktoad",
   "magmatoad",
   "starnewt",
   "embersalam"
  ]
 },
 {
  "id": "Mythic",
  "label": "Mythic",
  "count": 1,
  "species": [
   "auroradrake"
  ]
 },
 {
  "id": "Insect",
  "label": "Insect",
  "count": 15,
  "species": [
   "lumimoth",
   "cloverbug",
   "leafmantis",
   "sunscarab",
   "resinroach",
   "saffronmoth",
   "mirrormantis",
   "thunderbeetle",
   "prismwasp",
   "volcanomoth",
   "cindermole",
   "whistleweasel",
   "lavaurchin",
   "coralimp",
   "sootimp"
  ]
 },
 {
  "id": "Spider",
  "label": "Spider",
  "count": 3,
  "species": [
   "moonweaver",
   "siltwyrm",
   "pearlwyrm"
  ]
 },
 {
  "id": "Aquatic",
  "label": "Aquatic",
  "count": 12,
  "species": [
   "tideotter",
   "dewfin",
   "briarcrab",
   "glassshrimp",
   "lotusmanta",
   "driftjelly",
   "mistseal",
   "runecrab",
   "veilray",
   "crystalurchin",
   "cloudfin",
   "kitejelly"
  ]
 },
 {
  "id": "Reptile",
  "label": "Reptile / newt",
  "count": 10,
  "species": [
   "ironback",
   "cindrake",
   "ferncoil",
   "dunecoil",
   "basalturtle",
   "ashbasilisk",
   "steamaxolotl",
   "moltencoil",
   "tidecrown",
   "cinderempress"
  ]
 },
 {
  "id": "Plant",
  "label": "Plant / fungus",
  "count": 6,
  "species": [
   "mossling",
   "glowcap",
   "marigoldia",
   "skycorolla",
   "emberorchid",
   "elderroot"
  ]
 },
 {
  "id": "Spirit",
  "label": "Spirit / construct",
  "count": 6,
  "species": [
   "bloomslime",
   "ochrewisp",
   "moongolem",
   "echochime",
   "inksprite",
   "ambercolossus"
  ]
 },
 {
  "id": "OtherInvertebrate",
  "label": "Other invertebrate",
  "count": 3,
  "species": [
   "shellsnail",
   "lanternslug",
   "cindercentipede"
  ]
 }
];
for(const family of families)for(const id of family.species)C.UNITS[id].family=family.label;
// Retain stable save/skill IDs. This former drake is now a reptile-inspired skink.
Object.assign(C.UNITS.cindrake,{name:'Cinderskink',shape:'lizard',subtitle:'A four-legged skink with ember scales, a low frilled collar and a long balancing tail.',
 artSpec:{shape:'lizard',element:'Fire',accent:'#f2c180',index:101,crest:0,tail:2}});
C.ROSTER_VERSION=17;
const errors=root.BondRules.validate(C);
if(errors.length)throw Error('Content contract: '+errors.join('; '));
root.BondRoster={rows,families,validate:()=>[...root.BondRules.validate(C),...(families.reduce((n,f)=>n+f.species.length,0)!==100||new Set(families.flatMap(f=>f.species)).size!==100?['Family coverage']:[])],manifest:()=>C.MONSTERS.map(id=>({id,...C.UNITS[id]}))};
})(globalThis);
