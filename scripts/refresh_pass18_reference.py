"""Publish an authorized live export into the reviewed creature reference.

The Google Sheet snapshot owns creature identity/design fields. Existing runtime
stats and kits remain local until their Sheet tabs contain reviewed data.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
live = json.loads((ROOT / "tests/artifacts/pass18-reference-chrome.json").read_text(encoding="utf-8"))
assert live["version"] == 18
for name, digest in live["source_sha256"].items():
    assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == digest, "Stale runtime export: " + name

roster = json.loads((ROOT / "data/monster-roster.json").read_text(encoding="utf-8"))
assert roster["source"]["authority"] == "Google Sheets"
target = ROOT / "data/creature-reference.json"
data = json.loads(target.read_text(encoding="utf-8"))
lookup = {r["id"]: r for r in data["creatures"]}
actual = {u["id"]: u for u in live["species"]}
assert len(lookup) == 100 and set(lookup) == set(actual)

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--combat-workbooks', action='store_true', help='Publish the explicitly authorized workbook kits; preserve identity, bases and habitats')
args = parser.parse_args()
if args.combat_workbooks:
    from combat_workbooks import catalog
    reviewed, _ = catalog()
    for sid, u in actual.items():
        r = lookup[sid]
        b = r['base']
        source = reviewed['species'][sid]
        assert (b['hp'], b['attack'], b['intervalSeconds'], b['moveMultiplier']) == (u['hp'], u['power'], u['interval'], u['moveSpeed']), sid
        assert u['passive'] == source['passive']['id']
        assert u['range'] == (1 if source['delivery'].startswith('Melee') else 4)
        own = [s['id'] for s in reviewed['skills'].values() if s['owner'] == sid]
        assert u['default'] == own[:3] and set(own).issubset(u['skills'])
        assert set(s['id'] for s in r['skills']).issubset(u['skills']), 'Lost legacy skill: ' + sid
        r['skills'] = [{'id': s['id'], 'name': s['name'], 'kind': s['kind'], 'category': s.get('category'), 'baseCooldownSeconds': s['cd']} for s in u['kit']]
        r['defaultSkills'] = u['default']
        r['passive'] = {'id': u['passive'], 'name': u['passiveInfo']['name'], 'description': u['trait']}
        b.update(rangeTier=u['range'], reach={1: 12, 3: 27, 4: 34}[u['range']], critChance=.05)
    data['combatSource'] = reviewed['source']
    data['revision'] = 11
    data['date'] = '2026-09-16'
    data['sourceFiles'] = list(dict.fromkeys(data['sourceFiles'] + ['combat-catalog.js', 'combat-kits.js', 'combat-passives.js', 'combat-effects.js', 'combat-entities.js']))
    target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print('Published authorized workbook kits; preserved species identity, base tuning, habitats, loot and legacy skill IDs.')
    raise SystemExit(0)

# Preserve the separately labelled future material proposal by destination region
# when Sheet rows move. It is not a live loot source.
region_loot = {}
for row in data["creatures"]:
    if row.get("proposedOrdinaryLoot") and row.get("region") not in region_loot:
        region_loot[row["region"]] = copy.deepcopy(row["proposedOrdinaryLoot"])
regions = {n: region for n, region in enumerate(live["regions"])}

for u in live["species"]:
    r = lookup[u["id"]]
    b, h = r["base"], u["habitat"]
    assert (b["hp"], b["attack"], b["intervalSeconds"], b["moveMultiplier"], b["rangeTier"]) == (
        u["hp"], u["power"], u["interval"], u["moveSpeed"], u["range"]
    )
    assert r["passive"]["id"] == u["passive"]
    assert [skill["id"] for skill in r["skills"]] == u["skills"] and r["defaultSkills"] == u["default"]
    assert u["echoBP"] == 1500

    region = regions[u["region"]]
    r.setdefault("mechanicalRole", r["role"])
    r.update({
        "name": u["name"],
        "designRole": u["designRole"],
        "combatIdentity": u["combatIdentity"],
        "element": u["element"],
        "region": region["name"],
        "regionId": region["id"],
        "source": u["source"],
        "sourceWildLevel": u["sourceWildLevel"],
        "encounterSource": u["encounterSource"],
        "rarity": u["rarity"],
        "attackBase": u["attackBase"],
        "basicCategory": u["basicCategory"],
        "starter": u["starter"],
    })
    if r["source"] == "wild":
        r["proposedOrdinaryLoot"] = copy.deepcopy(region_loot[region["name"]])
    r.setdefault("releaseEchoBP", r["configuredEchoBP"])
    assert r["releaseEchoBP"] in [1, 1000]
    r["configuredEchoBP"] = u["echoBP"]

    if h:
        r["habitat"] = {
            "map": h["map"],
            "mapName": next(m["name"] for m in live["maps"] if m["id"] == h["map"]),
            "level": h["level"],
            "spawnSlots": h["count"],
            "spawnChanceBP": h["spawnBP"],
            "respawnSeconds": h["respawnSeconds"],
            "x": h["x"],
            "y": h["y"],
            "radiusWorldUnits": h["radius"],
        }
        r["liveLoot"] = [
            {"id": "coins", "quantity": 6 + h["level"] // 3, "chanceBP": 10000},
            {"id": "echo:" + r["id"], "quantity": 1, "chanceBP": 1500},
        ]
        r["liveLoot"] += [
            {"id": item["id"], "quantity": 1, "chanceBP": item["bp"]}
            for item in u.get("openingDrops", [])
        ]
        r["xpPerParticipatingIndividual"] = 300 + 100 * h["level"]
    else:
        r["habitat"] = None
        assert r["liveLoot"] == [] and r["xpPerParticipatingIndividual"] == 0

data["revision"] = 8
data["date"] = "2026-09-13"
data["designSource"] = copy.deepcopy(roster["source"])
data["temporaryTestTuning"] = {
    "patch": 20,
    "echoBP": 1500,
    "releaseRatesPreserved": True,
    "playerLevelCap": 60,
    "engineLevelCap": 100,
    "wildXP": "300 + 100 * reserved source level",
    "soloIntroduction": "Brimble at Lv2; HP430 / ATK32 / skillScale0.65 / no innate before level scaling",
    "firstMap": "96 residents: 48 Brimble Lv2, 32 Bloomslime Lv3 and 16 Rattlebit Lv5",
    "otherWild": "Sheet source levels, full species bases and innate, then encounter-level scaling",
    "bosses": "Reward-free previews in six spatial domains. Configured test odds do not create an acquisition source.",
}
target.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Updated the reviewed creature reference from the live Sheet-backed runtime export.")
