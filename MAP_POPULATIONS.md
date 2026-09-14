# Map populations — routing note

Do not maintain a second hand-written 94-species assignment table here.
[CREATURE_DROPS.md](CREATURE_DROPS.md) is the generated human-readable table;
[data/creature-reference.json](data/creature-reference.json) is its reviewed
machine-readable snapshot. Both are checked against the current browser export.

Authority and implementation:

- The reviewed Bond & Bolt Google Sheet snapshot in
  [data/monster-roster.json](data/monster-roster.json) owns each creature's
  region, source level, encounter source and rarity.
- [atlas-data.js](atlas-data.js) deterministically assigns each of 94 wild
  species to one large map within its Sheet region. Each of six Sheet boss
  species belongs to its region's compact boss domain and has no wild habitat.
- Firstlight is the only explicit content override: 48 Brimble at Lv2,
  32 Bloomslime at Lv3 and16 Rattlebit at Lv5.
- Outside Firstlight, a species contributes eight residents when Common, five
  when Uncommon and one when Rare/Very rare. Ordinary defeated lives are replaced
  elsewhere on their map immediately; rare lives wait60 seconds.
- [map-population.js](map-population.js) owns saved life/position/roll state.
  A moved species keeps its stable habitat prefix when required for save safety;
  that prefix is an identity, not a statement about its current map.

All configured Echo chances are temporarily15% for testing. Release proposals
remain separately labelled in the generated drop table. For validation and the
current owner walkthrough, see [PASS20_VALIDATION.md](PASS20_VALIDATION.md).
