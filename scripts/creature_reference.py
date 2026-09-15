"""Regenerate committed design tables from the reviewed reference JSON.
--check also compares all live rows to the latest browser runtime export.
Run tests/pass18_check.py --browser chrome before --check after changing runtime content.
This generator only writes its four named reference artifacts with --write.
"""
import argparse,csv,io,json,math,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'data/creature-reference.json').read_text(encoding='utf-8'))
rows=data['creatures']
parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');parser.add_argument('--check',action='store_true')
args=parser.parse_args()
def number(n):
    return f'{n:.2f}'.rstrip('0').rstrip('.')
def rate(bp):
    return number(bp/100)+'%'
def table(headers,values):
    return '\n'.join(['| '+' | '.join(headers)+' |','| '+' | '.join(['---']*len(headers))+' |']+['| '+' | '.join(str(v).replace('|','/').replace('\n',' ') for v in row)+' |' for row in values])+'\n'
assert len(rows)==100 and len({r['id'] for r in rows})==100
assert sum(r['source']=='wild' for r in rows)==94
assert all(len(r['skills'])==5 and len(set(r['defaultSkills']))==3 for r in rows)
assert all(math.isfinite(v) for r in rows for v in r['base'].values())
stats="""# Creature reference — all 100 species

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
All species have zero base armor and no critical-hit system; innate reductions
and VIT/tree armor are separate. Physical dodge depends on effective AGI/DEX.
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

"""
drops="""# Creature drops and habitats — all 100 species

Generated from [data/creature-reference.json](data/creature-reference.json). Revision 9, 2026-09-15.
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
Firstlight has144 Brimble,96 Bloomslime and48 Rattlebit (288 residents). Elsewhere,
per species/map: Common24, Uncommon15, Rare/Very rare3 residents. Ordinary defeated
lives are replaced immediately elsewhere; rare lives wait60s. No extra availability
roll. Each replacement is a saved dry, walkable point, at least900 world units from
its prior position. The initial starter population has one nearby introductory
Brimble resident. Firstlight replacements sample broad difficulty bands with a
wildlife-free camp; other maps sample their full walkable area. Towns have no wildlife.
Pending encounters retain their lives until settled/abandoned. Old surplus slots
are retired from the map population without removing any owned companions.
All roaming species attack unless at least ten levels below the trainer.
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

"""
regions=list(dict.fromkeys(r['region'] for r in rows))
for region in regions:
    group=[r for r in rows if r['region']==region]
    stats+='## '+region+'\n\n'+table(['ID / creature','Inspiration family','Design role / property','Prototype mechanic profile','HP','ATK / basis','Speed / Ready s','Move / Reach','Innate'],[
      [r['id']+' / '+r['name'],r.get('visualFamily',r['family']),r['designRole']+' / '+r['element'],r['mechanicalRole'],r['base']['hp'],str(r['base']['attack'])+' / '+r['attackBase'],
       number(r['base']['speed'])+' / '+number(r['base']['intervalSeconds']),number(r['base']['arenaMovePerSecond'])+' / '+str(r['base']['reach']),r['passive']['name']] for r in group])+'\n'
    values=[]
    for r in group:
        h=r['habitat']
        if h:
            coins=r['liveLoot'][0]['quantity'];mat=r['proposedOrdinaryLoot'][0]
            values.append([r['id'],h['mapName']+' ('+h['map']+') / Lv'+str(h['level']),r['rarity']+' / '+str(h['spawnSlots'])+' residents / '+(str(h['respawnSeconds'])+'s' if h['respawnSeconds'] else 'immediate elsewhere'),str(coins)+' coins @100%; 1 '+r['name']+' Echo @'+rate(r['configuredEchoBP'])+''.join('; 1 '+x['id']+' @'+rate(x['chanceBP']) for x in r['liveLoot'][2:]),r['xpPerParticipatingIndividual'],'1 '+mat['name']+' @'+rate(mat['chanceBP'])])
        else: values.append([r['id'],r['region']+' boss / future group encounter','Boss / no wild slot','NONE: reward-free preview',0,'1 '+r['name']+' essence @0.01% per future group victory; ordinary loot TBD'])
    drops+='## '+region+'\n\n'+table(['Species ID','Source / level','Map population / replacement delay','LIVE drops','LIVE XP / individual','PLANNED ONLY'],values)+'\n'
drops+='## Proposed material uses\n\n'+table(['Region','Material ID / name','Proposed use'],[[g, next(r for r in rows if r['region']==g and r['habitat'])['proposedOrdinaryLoot'][0]['id']+' / '+next(r for r in rows if r['region']==g and r['habitat'])['proposedOrdinaryLoot'][0]['name'],next(r for r in rows if r['region']==g and r['habitat'])['proposedOrdinaryLoot'][0]['use']] for g in regions])
stream=io.StringIO(newline='')
columns=['id','name','family','region','design_role','combat_identity','prototype_mechanical_role','element','attack_base','basic_category','base_hp','base_attack','speed','ready_seconds','arena_move_per_second','basic_reach','passive_id','passive','passive_description','five_skills','default_three','habitat','source_level','sheet_source_level','encounter_source','map_species_count','availability_percent','recheck_seconds','echo_percent','live_loot_json','xp_per_participating_individual','future_boss_essence_json','proposed_not_live_loot_json','silhouette_brief','animation_brief','art_status']
writer=csv.writer(stream,lineterminator='\n');writer.writerow(columns)
for r in rows:
    h=r['habitat'];b=r['base']
    writer.writerow([r['id'],r['name'],r.get('visualFamily',r['family']),r['region'],r['designRole'],r['combatIdentity'],r['mechanicalRole'],r['element'],r['attackBase'],r['basicCategory'],b['hp'],b['attack'],b['speed'],b['intervalSeconds'],b['arenaMovePerSecond'],b['reach'],r['passive']['id'],r['passive']['name'],r['passive']['description'],'; '.join(s['id']+'='+s['name'] for s in r['skills']),'; '.join(r['defaultSkills']),h['map'] if h else 'FUTURE GROUP BOSS',h['level'] if h else '',r['sourceWildLevel'] if r['sourceWildLevel'] is not None else '',r['encounterSource'],h['spawnSlots'] if h else '',h['spawnChanceBP']/100 if h else '',h['respawnSeconds'] if h else '',r['configuredEchoBP']/100,json.dumps(r['liveLoot'],ensure_ascii=False),r['xpPerParticipatingIndividual'],json.dumps(r['futureBossEssence'],ensure_ascii=False),json.dumps(r['proposedOrdinaryLoot'],ensure_ascii=False),r['design']['silhouette'],r['design']['animation'],r['design']['assetStatus']])
families='# Creature visual families — Sheet-backed roster\n\nCurrent names, visual families, roles, properties, regions and source levels come from the reviewed Bond & Bolt Google Sheet snapshot.\nThe older 25/15/4/1 taxonomy is retained only as legacy runtime metadata.\nAll 100 supplied PNGs are integrated; animation and commercial art review remain pending.\nStable IDs preserve individual XP, builds, trees and Echo inventory through renames.\nSee [sprite source and mapping](features/animation/SUPPLIED_SPRITES.md).\n\n'
visual_families=list(dict.fromkeys(r.get('visualFamily',r['family']) for r in rows))
families+=table(['Visual family','Species'],[[f,sum(r.get('visualFamily',r['family'])==f for r in rows)] for f in visual_families])+'\n'
for family in visual_families:
    group=[r for r in rows if r.get('visualFamily',r['family'])==family]
    families+='## '+family+'\n\n'+table(['Stable ID','Current creature','Visual body','Design role / property','Previous name'],[[r['id'],r['name'],r.get('visualBody',r['shape']),r['designRole']+' / '+r['element'],', '.join(r.get('previousNames',[])) or '—'] for r in group])+'\n'
outputs={'CREATURE_FAMILIES.md':families,'CREATURE_REFERENCE.md':stats,'CREATURE_DROPS.md':drops,'CREATURE_REFERENCE.csv':stream.getvalue()}
if args.write:
    for filename,content in outputs.items(): (ROOT/filename).write_text(content,encoding='utf-8',newline='\n')
if args.check:
    for filename,content in outputs.items():
        assert (ROOT/filename).read_text(encoding='utf-8')==content, 'Generated table drift: '+filename
    live=json.loads((ROOT/'tests/artifacts/pass18-reference-chrome.json').read_text(encoding='utf-8'))
    assert live['version']==18
    for name,digest in live['source_sha256'].items():
        assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest, 'Stale runtime export: '+name
    lookup={u['id']:u for u in live['species']}
    assert set(lookup)=={r['id'] for r in rows}
    for r in rows:
        u=lookup[r['id']];b=r['base'];h=u['habitat']
        assert r['family']==u['family']
        assert r.get('visualFamily')==u.get('visualFamily')
        assert (r['name'],r['designRole'],r['combatIdentity'],r['element'],r['mechanicalRole'],r['attackBase'],r['basicCategory'],r['shape'],r['source'],r['sourceWildLevel'],r['encounterSource'],r['rarity'],r['starter'])==(u['name'],u['designRole'],u['combatIdentity'],u['element'],u['role'],u['attackBase'],u['basicCategory'],u['shape'],u['source'],u['sourceWildLevel'],u['encounterSource'],u['rarity'],u['starter']), r['id']
        assert (b['hp'],b['attack'],b['intervalSeconds'],b['speed'],b['moveMultiplier'],b['rangeTier'])==(u['hp'],u['power'],u['interval'],u['speed'],u['moveSpeed'],u['range']), r['id']
        assert r['configuredEchoBP']==u['echoBP'] and r['passive']['id']==u['passive'] and r['passive']['description']==u['trait']
        assert [s['id'] for s in r['skills']]==u['skills'] and r['defaultSkills']==u['default']
        assert [(s['name'],s['kind'],s['baseCooldownSeconds']) for s in r['skills']]==[(s['name'],s['kind'],s['cd']) for s in u['kit']]
        if h:
            assert r['habitat']['spawnSlots']==h['count']
            assert (r['habitat']['map'],r['habitat']['level'],r['habitat']['spawnChanceBP'],r['habitat']['respawnSeconds'],r['habitat']['x'],r['habitat']['y'])==(h['map'],h['level'],h['spawnBP'],h['respawnSeconds'],h['x'],h['y'])
            assert r['liveLoot']==[{'id':'coins','quantity':6+h['level']//3,'chanceBP':10000},{'id':'echo:'+r['id'],'quantity':1,'chanceBP':h['echoBP']}]+[{'id':x['id'],'quantity':1,'chanceBP':x['bp']} for x in u.get('openingDrops',[])]
            assert r['xpPerParticipatingIndividual']==300+100*h['level']
        else: assert r['liveLoot']==[] and r['xpPerParticipatingIndividual']==0
    print('PASS: 100 unique species, 94 wild + 6 future boss sources; live data and four generated artifacts agree.')
elif args.write: print('Wrote CREATURE_REFERENCE.md, CREATURE_DROPS.md, CREATURE_REFERENCE.csv and CREATURE_FAMILIES.md (100 rows).')
else: parser.print_help()
