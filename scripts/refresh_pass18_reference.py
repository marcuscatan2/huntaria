"""Publish an authorized live export into the reviewed creature reference.

The Google Sheet snapshot owns creature identity/design fields. Existing runtime
stats and kits remain local until their Sheet tabs contain reviewed data.
"""
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
