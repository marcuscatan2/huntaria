# Creature design bible — 100 species, individual companions
Design revision 4 · 2026-09-11 · **Supplied single-pose art; production motion pending**

## Current visual roster

The owner-maintained Bond & Bolt Google Sheet and 100 numbered PNGs supersede the
earlier visual allocation below. The reviewed Sheet snapshot owns names, visual
families/bodies, design roles, combat identities, elements, regions, source levels,
encounter sources, availability and attack basis. [CREATURE_FAMILIES.md](CREATURE_FAMILIES.md)
lists the current catalog. [Supplied sprite contract](features/animation/SUPPLIED_SPRITES.md)
owns the mapping, provenance and rendering limits. The empty `mon-skills` tab means
existing prototype stats, passives and kits remain in force until reviewed data exists.

## Historical inspiration allocation — superseded by supplied roster

25 land animals,15 birds,4 frogs,1 mythic,15 insects,3 spiders; the remaining37
are12 aquatic,10 reptiles/newts,6 plants/fungi,6 spirits/constructs and3 other
invertebrates. This is the previous allocation, not the current visual catalog.
These are primary design inspirations, not rarity tiers or scientific taxonomy.
Pass17 updates prototype anatomy and names where needed while retaining all
species/individual/skill IDs, stats, levels, trees and drops. Auroradrake is the
single mythic dragon archetype; Cinderskink and Cinderempress are lizard-inspired.
Shared prototype rigs still need individual painted production design approval.

## Creative direction

A creature should look like it belongs to a place and does something there.
Use animals, local plants, materials and one memorable impossible feature.
A name or tint alone is not a species. The roster identity is the relationship
between **body shape + local ecology + signature feature + combat behavior**.

Our visual direction is illustrated, tactile and readable: expressive faces,
clear feet/contact points, restrained interior detail, and enough softness to
invite attachment. Monsters can be fierce without being grotesque. Bosses
need stature and a distinct rhythm, not merely larger hit points.

The three original production candidates were Druid, Emberfox and Stonehorn.
Add Bloomslime and Tideotter before approving the starter set. Existing artwork
and pose rigs are useful starting points, not automatic commercial approval.
All 100 species now use supplied PNGs; old SVG anatomy and monster pose sheets
remain legacy assets. Brimble and Rattlebit retain the emberfox/stonehorn IDs.
Their new appearances require a new motion reference before animation production.

The user's approved minimum is **100 species**, not 100 owned individuals.
Copies are separate companions with their own XP, three-skill priority loadout
and tree investment. Two Emberfoxes can have different builds and occupy both
slots. This does not add IVs, breeding, evolution, fusion, duplicate-account
mastery bonuses, trading or paid collection capacity.

## Authoritative reference and maintenance

- [CREATURE_REFERENCE.md](CREATURE_REFERENCE.md): every species' base stats,
  role, element/property, action interval, movement/range and innate.
- [CREATURE_DROPS.md](CREATURE_DROPS.md): every species' live loot, rates,
  habitat level/availability and separately labeled proposed rewards.
- [CREATURE_REFERENCE.csv](CREATURE_REFERENCE.csv): spreadsheet with 100 rows,
  all five skill names/IDs, three defaults, exact rates and individual briefs.
- [data/monster-roster.json](data/monster-roster.json): reviewed Sheet revision,
  fingerprint and stable-ID rows used to generate the runtime overlay.
- [data/creature-reference.json](data/creature-reference.json): reviewed machine-readable
  runtime snapshot plus clearly separated planned art/loot fields. The browser uses
  local reviewed data and never fetches the mutable Sheet during play.
- Run the browser suite to export actual runtime data, update the reviewed live
  fields when balancing, then run `python scripts/creature_reference.py --write --check`.
  The checker compares all 100 against the fresh export and rejects stale tables.
  It does not automatically approve a balance change.

No current numbers are a final balance guarantee. This pass deliberately preserves
the combat tuning and drop rates while changing identity/selection/reward UX.

## Shape, property and role grammar

Four properties only: Water → Fire → Earth → Wind → Water. Icons and patterns
reinforce color; keep the damage table in Companion stats.md. A Water creature
may use ice or mist imagery, and a Wind creature thunder, without creating
additional elements. Rarity is encounter/acquisition scarcity, not a stat multiplier.

| Role | Readable body language | Animation priority | Balance risk to test |
| --- | --- | --- | --- |
| Melee damage | Forward lean, visible legs/contact tool, lean center | Anticipation → travel/contact → recovery | Spending the fight running; illegal trainer bypass |
| Ranged damage | Upright or stable hover, identifiable shot origin | Aim → release → follow-through; projectile reaches target | Projectiles/impact disconnected; all ranged damage wrongly using INT |
| Tank | Broad grounded shape, deliberate weight, readable guard motif | Brace and impact reaction; movement must feel heavy but functional | Cannot reach anything; protection too strong when stacked |
| Support | Smaller/open shape, friendly expression, readable aid source | Cast origin and recipient response | A healer's body reads like a tank; too much sustain makes timeouts routine |

All 100 share a technical animation vocabulary, not identical motion. Species may
share skeleton/effect code while differing in proportions, feature, timing,
recovery and combat purpose. The role distribution is a starting dataset, not
proof every species is competitively distinct.

Each species needs at least one demonstrable useful build. Class trees need two
distinct viable paths under the existing backlog. Same-species pairs must be
tested for stacking/targeting exploits; two support copies must not create a
mandatory infinite-sustain answer. Do not weaken duplicates simply because they
are duplicates without a separately approved rule.

## Asset package for each creature

Stable directory contract: `assets/creatures/<species-id>/`.
Production manifest separates source, exports, sizes and event timing.

| Deliverable | Minimum acceptance |
| --- | --- |
| Concept sheet | Grayscale silhouette, 3/4 view, material/color callouts, scale beside trainer |
| Signature detail | One feature readable at 64px and full combat size; not only a lore sentence |
| Portrait | Transparent 512px source, clean 128px export; cropped consistently without cutting signature features |
| Rig / sprite source | Editable layers, fixed ground anchor, named pivots, source/license provenance |
| Direction coverage | Four exploration directions; mirrored only for symmetric features; left/right combat faces |
| Motion set | Idle, movement, basic attack, cast, hit, defeat, victory; seven real event-driven states |
| Combat skill coverage | Five assignments have a readable casting gesture/projectile or effect mapping; three equipped priorities remain distinguishable |
| In-world behavior | One short species-specific idle action and a map-wide dry/reachable spawn policy |
| VFX/audio mapping | Shared elemental effect kit permitted; clear source/target/impact; no sound-only rules |
| QA sheet | Atlas bleed, silhouette scale, depth sorting, contact sliding, event timing, reduced motion, mobile |
| Provenance manifest | Creator/source, date, tool and license/permission if external; do not copy commercial reference assets |

Start source rigs around 1024px body-height equivalent, then export at the smallest
size that passes actual combat/portrait review. Do not ship 100 layered 4K images.
Use packed sheets per biome/nearby set, load portraits separately, and evict unused
animation sheets. A shared skeleton accelerates production, but its species still
needs approved silhouette and bespoke motion accents.

No paid image/video tool is assumed. Future bitmap-generation work uses the
available image-generation workflow only when authorized/available; AI output
still needs cleanup, consistency, rights review and rigging. The zero-paid-asset
constraint does not make these production steps disappear.

## Motion direction and timing

Keep authoritative combat timing independent of playback. Match animation to
existing cast/damage/status/defeat events instead of delaying damage to finish
an attractive pose. A cast wind-up can begin from an explicit cast-start event;
if no such event exists, add a tested presentation event contract first.

Indicative art timing at normal playback:

- Idle: a 2–4s low-amplitude breathing cycle, irregular species accent.
- Walk/run: footfalls match traveled distance; choose cadence by body type.
- Basic attack: 80–140ms readable anticipation, contact cue, 140–240ms recovery.
  These are visual envelopes fitted to actual action readiness, not new cooldowns.
- Support cast: gesture clearly names the source before a recipient pulse; no
  damaging-looking full-screen explosion for a small heal.
- Hit: short directional reaction, never full-body spasms on every tick.
- Defeat: 250–450ms visible settling in retained battle detail, but **never delay
  the immediate world return/loot popup** waiting for it.
- Victory: optional short expression, not an unskippable results ceremony.
- Overlapping events: authoritative defeat cancels cast/hit; new strikes cannot
  resurrect a dead actor. Reduced-motion mode preserves state clarity.

Use a per-action contact marker, projectile muzzle point and impact target anchor.
Do not align every event to sprite center. Separate slow heavy movement from
slow attack readiness. Bloomslime should have modest height/mass and a flexible
body, not a giant glowing health sponge. Keep targeting “closest living monster”
unless an explicitly described skill bypasses the frontline.

## Six boss production briefs

Encounter mechanics below are proposals for later real group fights. Current
previews share a simplified mechanic and award nothing. Summoned boss forms
use the balanced companion bases from the reference, not raid HP or raid-wide powers.

| Boss / proposed arena | Signature silhouette | Distinct encounter proposal / readability gate |
| --- | --- | --- |
| Elderroot / living root cathedral | Root feet, asymmetrical branch arms, hollow heart window | Alternating exposed-root and shelter phases; quake lanes have clear ground markers |
| Tidecrown / spring circle | Crown fin above a broad serpent coil | Rotating current lanes and healing spring adds; distinguish safe current from damage |
| Ambercolossus / resin quarry | Uneven amber chambers inside stone mass | Exposed chamber windows rotate after heavy slams; damage window visible without tiny text |
| Moonweaver / observatory vault | Crescent silk crown above low spider body | Web tethers and constellation nodes; no unreadable screen-wide web mesh |
| Tempestrook / signal summit | Long leading feathers and broken-halo wing shape | Wing-charge lanes and wind shelter positions; telegraph survives low-effects mode |
| Cinderempress / caldera garden | Massive four-clawed monitor lizard with an ember-garden dorsal crest | Hot/cool arena halves alternate with clearly staged hatchlings; no unavoidable spawn-on-player hit |

Group targeting, readiness, elimination, server timing and rare-loot recipient
selection must be implemented/tested before these count as commercial encounters.
Every eligible victory can roll its 0.01% essence; prior ownership or drops do not
disable future awards. Summoning another boss copy is legal and consumes another
owned essence. No one-per-server cap.

## Per-species production briefs

These use the existing authored identity sentences plus a concrete motion brief.
They are a **starting assignment for concept/animation production**, not evidence
that the current shared SVGs already realize them. Each row's first signature
skill is an existing assignment to stage visibly; shared effect code is permitted.
Habitat ecology must satisfy WORLD_DESIGN.md (for example, cave birds occupy
daylight shafts rather than inexplicable deep-cave perches).

### Mosslight

| Creature / body | Defining silhouette / material feature | Motion brief | First skill to stage |
| --- | --- | --- | --- |
| Emberfox (emberfox) / fox | A spark with sharp teeth | Coil the tail before a low pounce; tail settles after the feet land | Pounce |
| Stonehorn (stonehorn) / rhino | A steadfast little mountain | Lower the horn, plant the forefeet, then drive a short heavy lunge | Bondguard |
| Bloomslime (bloomslime) / slime | A pocket-sized ray of sunshine | Compress around the core, open the crown, then settle with one soft wobble | Little Bloom |
| Tideotter (tideotter) / otter | Go gently. Go together. | Brace on the tail, scoop water with both paws, and flick a narrow arc | Springwater |
| Seedhare (seedhare) / rabbit | Long ears shelter a pouch of sleeping seeds | Fold the long ears, compress the hind legs, then spring and land | Petal Pounce |
| Mossling (mossling) / sprout | A walking garden that shares its morning dew | Plant the root feet, unfurl the leaf crown, and release a small burst | Sprout Little Bloom |
| Acornboar (acornboar) / boar | An oak-armored forager with curling wooden tusks | Sniff and paw first; tuck the head into a short tusk-led charge | Acorn Pebble Slam |
| Pebblepup (pebblepup) / hound | A stone-footed puppy that chases falling stars | Shift weight into the rear legs, snap forward, then recover low | Pebble Pounce |
| Dewfin (dewfin) / fish | A floating pond fish carried by its own water ring | Curl the whole spine into an S, fan the fins, then release forward | Dew Healing Ripples |
| Cloverbug (cloverbug) / beetle | Four clover plates fold over a stubborn beetle | Lock the leg stance, raise the carapace motif, and snap it shut | Clover Shell Bash |
| Ferncoil (ferncoil) / snake | Its fern-frond tail scatters needle-sharp seeds | Coil into a readable S, raise the head and tail motif, then whip forward | Fern Rootbind |
| Honeylark (honeybat) / bird | A nectar-feeding lark with a honeycomb throat pouch and golden feather fans. | Take a short perch step, fan the feather tail and open one clear wing downbeat | Honey Moondust |
| Reedwren (reedwren) / bird | A reed-beaked songbird that whistles arrows | Lean into a perch step, fan the tail, and thrust the beak/wing motif | Reed Skyneedle |
| Briarcrab (briarcrab) / crab | A bramble claw and broad shell guard the shallows | Brace three legs, lift the signature claw, then close with a clean impact | Briar Bondguard |
| Glowcap (glowcap) / mushroom | A luminous mushroom whose spores soothe weary travelers | Draw the cap down, swell the stem, then vent from the cap rim | Glow Spore Toss |
| Leafmantis (leafmantis) / mantis | Its leaf-shaped blades dance between tall stalks | Fold the forearms into silhouette, pause, then make one sharp diagonal cut | Leaf Antler Rush |
| Elderroot (elderroot) / treant | The patient guardian at the heart of Mosslight | Brace the root feet and rotate one heavy branch; recover with leaf settling | Ancient Bondguard |

### Windstep

| Creature / body | Defining silhouette / material feature | Motion brief | First skill to stage |
| --- | --- | --- | --- |
| Stormowl (stormowl) / owl | Quiet wings. Loud thunder. | Hunch the shoulders, frame the eyes with a wing flare, then loose the shot | Chain Spark |
| Galeibex (galeibex) / ram | Swept-back horns help it brace against cliff winds | Angle the horn silhouette, stamp once, then drive from planted rear legs | Gale Antler Rush |
| Cloudfin (cloudfin) / fish | Feathered fins keep this sky fish aloft | Curl the whole spine into an S, fan the fins, then release forward | Cloud Guiding Lantern |
| Thunderbeetle (thunderbeetle) / beetle | Forked antennae collect charge beneath a heavy carapace | Lock the leg stance, raise the carapace motif, and snap it shut | Thunder Carapace |
| Skyquail (skyrabbit) / bird | A round prairie quail whose sail-shaped crest steadies its long gliding hops. | Take a short perch step, fan the feather tail and open one clear wing downbeat | Sky Quickstep |
| Razorswift (razorswift) / bird | A swept-wing swift with a needle-shaped beak | Lean into a perch step, fan the tail, and thrust the beak/wing motif | Razor Skyneedle |
| Tempestcub (tempestcub) / bear | Thunder rolls inside its fluffy cloud mane | Sink into the cloud mane, raise one paw, then bring body weight forward | Tempest Pounce |
| Bouldereagle (bouldereagle) / eagle | Stone flight feathers make it a patient protector | Brace the talons, spread the leading feathers, then sweep one wing | Boulder Boulder Toss |
| Whistlecicada (whistleweasel) / cicada | A broad-winged cicada whose ribbed chest hums warnings across the prairie. | Brace six feet, vibrate the ribbed chest and spread the translucent wings | Whistle Springstep |
| Stormstilt (stormstilt) / heron | Long stilts keep its charged plumage above the water | Bend the neck into an S, plant one long leg, then release a precise thrust | Storm Skyneedle |
| Kitejelly (kitejelly) / jelly | A diamond bell and streaming cords catch the high wind | Compress the bell and gather tendrils; expand into one directional pulse | Kite Guiding Lantern |
| Fluffyak (fluffyak) / yak | A shaggy little yak shelters travelers in its warm coat | Brace the broad hooves, toss the shaggy head, then deliver a grounded shove | Fluff Bondguard |
| Zephyrshrike (zephyrlynx) / bird | A swift cliff shrike with a hooked beak, forked feather tail and ribbon crest. | Take a short perch step, fan the feather tail and open one clear wing downbeat | Zephyr Pounce |
| Prismwasp (prismwasp) / wasp | A crystal sting separates lightning into seven colors | Tuck the forelegs, align the crystal sting, then make one controlled dart | Prism Skyneedle |
| Skycorolla (skycorolla) / flower | Its petals turn slowly like a little windmill | Turn the face toward the target, close the petals, then open in sequence | Corolla Grove Renewal |
| Tempestrook (tempestrook) / eagle | A storm-winged keeper of the highest watchtower | Brace the talons, spread the leading feathers, then sweep one wing | Tempest Chain Spark |

### Moonwell

| Creature / body | Defining silhouette / material feature | Motion brief | First skill to stage |
| --- | --- | --- | --- |
| Frostfang (frostfang) / cat | A winter wind with paws | Crouch with ear-tuft anticipation, spring, and land into a poised stance | Frostbite |
| Moonrabbit (moonrabbit) / rabbit | Crescent ears reflect the light of the Moonwell | Fold the long ears, compress the hind legs, then spring and land | Moon Moondust |
| Runecrab (runecrab) / crab | Old runes travel over the surface of its stone claw | Brace three legs, lift the signature claw, then close with a clean impact | Rune Iron Ward |
| Starfrog (starnewt) / frog | A squat pond frog with star-shaped cheek markings, webbed toes and powerful folded hind legs. | Compress both folded hind legs, hop forward, plant webbed feet and settle the throat sac | Star Frostbolt |
| Veilray (veilray) / manta | Its trailing ribbons trace forgotten constellations | Cup the wide wings, ripple outward from the body, then return to level | Veil Guiding Lantern |
| Duskmarten (duskmarten) / marten | A long, silver-tailed guardian of ruined libraries | Arch the long back, coil the tail, then dart forward and rebound | Dusk Frostbite |
| Opalowl (opalowl) / owl | Opal eye rings focus distant starlight into needles | Hunch the shoulders, frame the eyes with a wing flare, then loose the shot | Opal Chain Spark |
| Lanternslug (lanternslug) / slug | A tiny lantern grows from the end of its feelers | Anchor the body, raise the feelers, then send a wave to the lantern tip | Lantern Little Bloom |
| Mirrormantis (mirrormantis) / mantis | Faceted forearms reflect the movement of its opponent | Fold the forearms into silhouette, pause, then make one sharp diagonal cut | Mirror Wild Lunge |
| Crystalurchin (crystalurchin) / urchin | A ring of pale crystals surrounds a warm beating core | Draw spines inward around the core, rotate once, then extend toward target | Crystal Carapace |
| Dreamtapir (dreamtapir) / tapir | A curled trunk drinks mist from the sleeping well | Curl the trunk, gather mist, then uncurl into a soft directed breath | Dream Lullaby |
| Moongolem (moongolem) / golem | A small moonstone guardian with floating ring shoulders | Separate and align heavy plates, plant the feet, then deliver a slow weighty blow | Moonstone Fortify |
| Astralfox (astralfox) / fox | Its split fan tail draws bright arcs through moonlight | Coil the tail before a low pounce; tail settles after the feet land | Astral Pounce |
| Echochime (echochime) / bell | A living bell carries the voices of friendly spirits | Lean against the hanging axis, swing through center, then damp the oscillation | Chime Aurora |
| Pearlweaver (pearlwyrm) / spider | An eight-legged cave spider with pearl spinnerets and a bead-patterned oval abdomen. | Plant eight legs in alternating pairs, lift the abdomen and cast from the spinnerets | Pearl Frostbolt |
| Inksprite (inksprite) / imp | Ink-brush horns sketch harmless trails behind each spell | Wind up the horns/tail motif, throw with the whole torso, and overbalance briefly | Ink Crown Hex |
| Moonweaver (moonweaver) / spider | A silk-crowned guardian of the Moonwell constellations | Plant the front legs, lift the silk crown, and draw a clear web arc | Moonweave Aurora |

### Amber Hollow

| Creature / body | Defining silhouette / material feature | Motion brief | First skill to stage |
| --- | --- | --- | --- |
| Cinderskink (cindrake) / lizard | A four-legged skink with ember scales, a low frilled collar and a long balancing tail. | Plant four claws, lower the dorsal crest and counterbalance the strike with the long tail | Ember Breath |
| Thornstag (thornstag) / deer | Guardian of the wild paths | Lower the crown of antlers, step diagonally, and recover with a head lift | Antler Rush |
| Copperhog (copperhog) / boar | Warm copper scales rattle when it charges | Sniff and paw first; tuck the head into a short tusk-led charge | Copper Pebble Slam |
| Amberkite (amberkite) / bird | Amber vanes turn every gust into a cutting current | Lean into a perch step, fan the tail, and thrust the beak/wing motif | Amber Skyneedle |
| Cinderant (cindermole) / ant | A low six-legged ant with glowing mandibles and a soot-dark segmented abdomen. | Brace six feet, lower the segmented abdomen and snap the mandibles | Cinder Cinderbite |
| Sunscarab (sunscarab) / beetle | A sun-disc shell warms companions through cold nights | Lock the leg stance, raise the carapace motif, and snap it shut | Solar Carapace |
| Embertoad (embersalam) / frog | A squat ember-speckled toad with an inflatable throat sac and broad hopping legs. | Compress both folded hind legs, hop forward, plant webbed feet and settle the throat sac | Ember Scorch |
| Ochrewisp (ochrewisp) / wisp | An amber lantern floats over a braid of old roots | Dim and compress the lantern core, brighten once, and release a short trail | Ochre Moondust |
| Bronzecrane (bronzebuck) / heron | A heavy crane with bronze beak plates, broad guarding wings and long stilt legs. | Fold the long neck, brace the stilt legs and sweep the broad guarding wings | Bronze Antler Rush |
| Thistlehare (thistlehare) / rabbit | Thistle spines stand upright along its long ears | Fold the long ears, compress the hind legs, then spring and land | Thistle Pounce |
| Ashporcupine (ashporcupine) / porcupine | Its charcoal quills glow when it protects a friend | Brace the round body and fan quills outward before a guarded shove | Ash Boulder Toss |
| Resinroach (resinroach) / beetle | A resin-winged crawler with a long seed cannon | Lock the leg stance, raise the carapace motif, and snap it shut | Resin Spore Toss |
| Marigoldia (marigoldia) / flower | Its broad flower face follows every patch of sunlight | Turn the face toward the target, close the petals, then open in sequence | Marigold Little Bloom |
| Flintjackal (flintjackal) / hound | Stone teeth strike sparks against its flint collar | Shift weight into the rear legs, snap forward, then recover low | Flint Cinderbite |
| Dunecoil (dunecoil) / snake | A sand sail rises above the coils of this patient hunter | Coil into a readable S, raise the head and tail motif, then whip forward | Dune Boulder Toss |
| Saffronmoth (saffronmoth) / moth | Saffron eyespots shimmer like tiny evening suns | Close the wings to show the motif, then unfold one broad pulse | Saffron Moondust |
| Ambercolossus (ambercolossus) / golem | Amber chambers glow inside a stone titan | Separate and align heavy plates, plant the feet, then deliver a slow weighty blow | Colossus Fortify |

### Willowbrook

| Creature / body | Defining silhouette / material feature | Motion brief | First skill to stage |
| --- | --- | --- | --- |
| Ironback (ironback) / turtle | The river’s oldest shield | Brace the shell, extend the head, and drive a short shield-like shove | Shellguard |
| Lumimoth (lumimoth) / moth | A lantern for lost friends | Close the wings to show the motif, then unfold one broad pulse | Moonbeam |
| Rillrook (rillrook) / bird | A kingfisher wearing a crown of river reeds | Lean into a perch step, fan the tail, and thrust the beak/wing motif | Rill Riptide |
| Shellsnail (shellsnail) / snail | A spiral shell stores water for an entire woodland | Anchor the foot, tilt the shell, and extend feelers into the action | Spiral Carapace |
| Brooktoad (brooktoad) / frog | A round-cheeked toad that nurses river seedlings | Inflate the cheek sacs, gather the hind legs, then release the stored motion | Brook Springwater |
| Glasshrimp (glassshrimp) / shrimp | Translucent pincers bend sunlight into sharp needles | Fold the segmented tail, align the transparent pincers, then snap | Glass Skyneedle |
| Lotusmanta (lotusmanta) / manta | Wide lotus wings skim the river without a ripple | Cup the wide wings, ripple outward from the body, then return to level | Lotus Healing Ripples |
| Ripplelynx (ripplelynx) / cat | Water trails from the tufts of its pointed ears | Crouch with ear-tuft anticipation, spring, and land into a poised stance | Ripple Frostbite |
| Rainram (rainram) / ram | Coiled blue horns gather rainclouds | Angle the horn silhouette, stamp once, then drive from planted rear legs | Rain Antler Rush |
| Driftjelly (driftjelly) / jelly | A bell of clear water shelters a tiny pearl | Compress the bell and gather tendrils; expand into one directional pulse | Drift Moondust |
| Mudmole (mudmole) / mole | Wide digging claws build safe tunnels below the river | Plant the broad claws, sweep one scoop, then duck into a low recovery | Mud Boulder Toss |
| Heronveil (heronveil) / heron | A tall silver heron wrapped in mist ribbons | Bend the neck into an S, plant one long leg, then release a precise thrust | Heron Skyneedle |
| Siltspider (siltwyrm) / spider | An eight-legged riverbank spider with shovel-shaped front feet and a silk-wrapped abdomen. | Plant eight legs in alternating pairs, lift the abdomen and cast from the spinnerets | Silt Wild Lunge |
| Coralhopper (coralimp) / grasshopper | A reef-colored grasshopper with long springing hind legs and coral-patterned antennae. | Fold the long hind legs, spring forward and land on the front legs | Coral Frostbolt |
| Lilydeer (lilydeer) / deer | Lilies bloom along the antlers of this gentle grazer | Lower the crown of antlers, step diagonally, and recover with a head lift | Lily Grove Renewal |
| Mistseal (mistseal) / seal | A whiskered seal that rolls through shallow clouds | Rock the torso, gather foreflippers, then release a rolling splash | Mist Springwater |
| Tidecrown (tidecrown) / serpent | A crowned river serpent tending the oldest springs | Lift the crown above a wide coil and send a wave down the spine | Tidecrown Healing Ripples |

### Ashen Reach

| Creature / body | Defining silhouette / material feature | Motion brief | First skill to stage |
| --- | --- | --- | --- |
| Magmatoad (magmatoad) / frog | Pebbled cheeks shelter cool water beneath warm lava armor | Inflate the cheek sacs, gather the hind legs, then release the stored motion | Magma Fortify |
| Obsidianram (obsidianram) / ram | Polished obsidian horns form a shield above its face | Angle the horn silhouette, stamp once, then drive from planted rear legs | Obsidian Antler Rush |
| Pyrewolf (pyrewolf) / hound | A tall flame mane lights the path through ashfall | Shift weight into the rear legs, snap forward, then recover low | Pyre Cinderbite |
| Emberorchid (emberorchid) / flower | Cool amber sap runs through heat-resistant petals | Turn the face toward the target, close the petals, then open in sequence | Orchid Grove Renewal |
| Cindercentipede (cindercentipede) / centipede | Many tiny ember feet leave a dotted trail in the dark | Send a wave from front to rear feet, lift the head, then surge | Cinder Cinderbite |
| Basalturtle (basalturtle) / turtle | A terraced basalt shell holds a miniature stone garden | Brace the shell, extend the head, and drive a short shield-like shove | Basalt Carapace |
| Ashbasilisk (ashbasilisk) / lizard | A fan-shaped ash crest opens before each spell | Lift the crest/gills, curve the long tail, then straighten into the action | Basilisk Scorch |
| Glassphoenix (glassphoenix) / eagle | Glass-edged wings refract the heat rising from the ground | Brace the talons, spread the leading feathers, then sweep one wing | Phoenix Fireball |
| Coalbadger (coalbadger) / badger | White stone stripes brighten a coal-dark burrower | Dig in both forepaws, roll the shoulders, then drive a short low shove | Coal Pebble Slam |
| Steamaxolotl (steamaxolotl) / axolotl | Soft steam rises from its branching turquoise gills | Spread the gill branches, gather a breath, then pulse the water forward | Steam Springwater |
| Lavafirefly (lavaurchin) / firefly | A six-legged firefly with an amber lantern abdomen beneath dark glass wing cases. | Open the wing cases, pulse the lantern abdomen and settle onto six feet | Lava Scorch |
| Volcanomoth (volcanomoth) / moth | Dark wings hide rings of warm volcanic light | Close the wings to show the motif, then unfold one broad pulse | Volcano Aurora |
| Sootweevil (sootimp) / beetle | A soot-dusted weevil with a long curved snout and speckled ember wing cases. | Brace six feet, lift the snout and close the wing cases after the action | Soot Crown Hex |
| Moltencoil (moltencoil) / snake | Copper fins ripple along a long ember-red body | Coil into a readable S, raise the head and tail motif, then whip forward | Molten Cinderbite |
| Auroradrake (auroradrake) / dragon | An ice-plumed drake nesting where hot and cold winds meet | Open the throat/crest and wings, hold a readable charge, then release | Aurora Frostbolt |
| Cinderempress (cinderempress) / lizard | A massive ember-monitor lizard with a crownlike dorsal crest, four planted claws and a long muscular tail. | Plant four claws, lower the dorsal crest and counterbalance the strike with the long tail | Empress Cinderbite |

## Production order and approval gates

1. Druid + four starters: lock scale, body language, cast/impact pipeline and the
   exact look of ordinary gameplay screenshots. Mage follows the same event contract.
2. Next eight species must exercise different bodies (winged, segmented, floating,
   long-bodied, shell, plant) before mass production. Include a visually rare species
   so rarity is tested as design detail, not more particles.
3. Build regional batches, approximately 12–18 species at a time. Keep concept,
   rig, motion, integration and acceptance statuses separate.
4. Boss packages only after group combat event requirements are known.
5. Full-roster contact sheet and all-species battlefield tests; fix look-alike
   pairs and weak silhouettes before final exports.

Per-species sign-off record: ID, reference revision, artist/source, concept approved,
portrait approved, seven states present, five skills mapped, innate exercised,
useful build demonstrated, habitat approved, all loot rows checked, accessibility/
device issues, owner decision. Store failures and rework, not only checkmarks.

At 64px grayscale, reviewers should distinguish similar-body neighbors by silhouette
or feature, without names or elemental color. At combat scale, observers should
identify attacker, target and outcome after one event. Five outside players is a
useful early qualitative check, not a statistically reliable commercial prediction.

Commercial acceptance is **0/100 production packages signed off in this document**.
The prototype has 100 playable species definitions, but a content count is not
a finished art direction, balanced campaign or success forecast.
