"""Reviewed pass17 mechanical update: identity/family/spawn fields, never balance."""
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
live=json.loads((ROOT/'tests/artifacts/pass17-reference-chrome.json').read_text(encoding='utf-8'))
assert live['version']==17
for name,digest in live['source_sha256'].items():
    assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest, 'Stale runtime export: '+name
target=ROOT/'data/creature-reference.json'
data=json.loads(target.read_text(encoding='utf-8'))
lookup={r['id']:r for r in data['creatures']}
assert set(lookup)=={u['id'] for u in live['species']} and len(lookup)==100
motions={
 'frog':'Compress both folded hind legs, hop forward, plant webbed feet and settle the throat sac',
 'spider':'Plant eight legs in alternating pairs, lift the abdomen and cast from the spinnerets',
 'bird':'Take a short perch step, fan the feather tail and open one clear wing downbeat',
 'heron':'Fold the long neck, brace the stilt legs and sweep the broad guarding wings',
 'ant':'Brace six feet, lower the segmented abdomen and snap the mandibles',
 'cicada':'Brace six feet, vibrate the ribbed chest and spread the translucent wings',
 'firefly':'Open the wing cases, pulse the lantern abdomen and settle onto six feet',
 'grasshopper':'Fold the long hind legs, spring forward and land on the front legs',
 'beetle':'Brace six feet, lift the snout and close the wing cases after the action',
 'lizard':'Plant four claws, lower the dorsal crest and counterbalance the strike with the long tail'}
brief=ROOT/'CREATURE_DESIGN.md';text=brief.read_text(encoding='utf-8')
for u in live['species']:
    r=lookup[u['id']];b=r['base']
    assert (b['hp'],b['attack'],b['intervalSeconds'],b['moveMultiplier'],b['rangeTier'])==(u['hp'],u['power'],u['interval'],u['moveSpeed'],u['range'])
    assert r['configuredEchoBP']==u['echoBP'] and r['passive']['id']==u['passive']
    assert [s['id'] for s in r['skills']]==u['skills'] and r['defaultSkills']==u['default']
    if r['name']!=u['name'] or r['shape']!=u['shape']:
        if r['name']!=u['name']:r['previousNames']=list(dict.fromkeys([*r.get('previousNames',[]),r['name']]))
        r['design']['silhouette']=u['subtitle'];r['design']['animation']=motions[u['shape']]
        r['design']['assetStatus']='Pass17 code-native prototype anatomy; painted production package pending'
    r['name']=u['name'];r['shape']=u['shape'];r['family']=u['family']
    h=u['habitat']
    if h:
        r['habitat'].update(spawnSlots=h['count'],spawnChanceBP=h['spawnBP'],respawnSeconds=h['respawnSeconds'],
            x=h['x'],y=h['y'],positionPolicy='Persisted random walkable point across the source map; x/y are legacy ecology anchors, not spawn locations')
    pattern=r'^\| [^|]*\('+re.escape(r['id'])+r'\) / [^|]*\|.*$'
    replacement='| '+r['name']+' ('+r['id']+') / '+r['shape']+' | '+r['design']['silhouette']+' | '+r['design']['animation']+' | '+r['design']['signatureSkill']+' |'
    text,n=re.subn(pattern,lambda m:replacement,text,flags=re.M);assert n==1,r['id']
data['revision']=3;data['families']=live['families']
data['spawnPolicy']='Map quotas: Common8, Uncommon5, Rare/Very rare1. Ordinary immediate; rare60s. Random dry reachable placement per life, at least900 units from previous location. No availability roll.'
target.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
brief.write_text(text,encoding='utf-8')
print('Updated only pass17 identity/family/spawn fields and matching species brief rows; combat stats, kits and Echo odds unchanged.')
