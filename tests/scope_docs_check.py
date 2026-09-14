"""Read-only integrity checks for the commercial MVP planning documents.

Run: python tests/scope_docs_check.py
These validate documentation structure and traceability, not gameplay or launch readiness.
"""
import json
import math
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
NAMES = ("FEATURE_BACKLOG.md", "VALIDATION_PLAN.md", "FEATURE_TRACEABILITY.md")
docs = {name: (ROOT / name).read_text(encoding="utf-8") for name in NAMES}
backlog, validation, trace = (docs[name] for name in NAMES)
source = (ROOT / "Commercial MVP scope.md").read_text(encoding="utf-8")
expected_features = {f"F-{n:03d}" for n in range(1, 67)}
expected_items = {f"MVP-{n:02d}" for n in range(1, 29)}
expected_suites = {f"VP-{n:02d}" for n in range(1, 16)}
checks = []


def check(name, condition):
    checks.append({"name": name, "pass": bool(condition)})


matches = list(re.finditer(r"^### (F-\d{3}) — (.+)$", backlog, re.M))
ids = [m.group(1) for m in matches]
check("66 unique feature cards with stable IDs", len(ids) == len(set(ids)) == 66 and set(ids) == expected_features)
cards = {}
for i, match in enumerate(matches):
    cards[match.group(1)] = backlog[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(backlog)]

all_ac = re.findall(r"^- \[[ xX]\] (F-\d{3}-AC\d+): (.+)$", backlog, re.M)
check("264 unique numbered acceptance criteria", len(all_ac) == 264 and len({a for a, _ in all_ac}) == 264)
check("Four nonempty criteria per feature", all(
    {a for a, text in all_ac if a.startswith(feature + "-")} == {f"{feature}-AC{n}" for n in range(1, 5)}
    for feature in expected_features
))
check("64 P0 and 2 optional P1 cards", len(re.findall(r"^Priority: P0 ", backlog, re.M)) == 64 and len(re.findall(r"^Priority: P1 ", backlog, re.M)) == 2)

deps, item_coverage, suite_coverage = {}, set(), set()
metadata_complete = True
for feature, body in cards.items():
    d = re.search(r"^Dependencies: (.+)$", body, re.M)
    s = re.search(r"^Source items: (.+)$", body, re.M)
    v = re.search(r"^Required protocols: (.+?)\. Evidence:", body, re.M)
    metadata_complete &= all((d, s, v, re.search(r"^Accountability: .+", body, re.M), re.search(r"^Validation: .+", body, re.M), re.search(r"^Baseline: .+", body, re.M)))
    deps[feature] = re.findall(r"F-\d{3}", d.group(1)) if d else []
    items = set(re.findall(r"MVP-\d{2}", s.group(1))) if s else set()
    suites = set(re.findall(r"VP-\d{2}", v.group(1))) if v else set()
    metadata_complete &= bool(items) and items <= expected_items and bool(suites) and suites <= expected_suites
    item_coverage.update(items)
    suite_coverage.update(suites)
check("Each card has baseline, dependency, source, owner and validation metadata", metadata_complete)
check("Every dependency points to another valid feature", all(d in expected_features and d != feature for feature, values in deps.items() for d in values))

visiting, done = set(), set()
def visit(feature):
    if feature in visiting:
        raise ValueError("Cycle at " + feature)
    if feature in done:
        return
    if feature not in deps:
        raise ValueError("Missing dependency " + feature)
    visiting.add(feature)
    for dependency in deps[feature]:
        visit(dependency)
    visiting.remove(feature)
    done.add(feature)

acyclic = True
try:
    for feature in deps:
        visit(feature)
except ValueError:
    acyclic = False
check("Dependency graph is acyclic", acyclic)
check("All 28 source items are covered by feature cards", item_coverage == expected_items)
check("All 15 validation protocols are used", suite_coverage == expected_suites)
check("Traceability maps all 28 actual source backlog items",
      set(re.findall(r"^\| (MVP-\d{2}) \|", source, re.M)) ==
      set(re.findall(r"^\| (MVP-\d{2}) \|", trace, re.M)) == expected_items)
check("All 18 scope sections are mapped", set(re.findall(r"^\| §(\d+) \|", trace, re.M)) == {str(n) for n in range(1, 19)})
check("15 detailed validation protocol definitions", set(re.findall(r"^### (VP-\d{2}) —", validation, re.M)) == expected_suites)
check("Six release gates defined", set(re.findall(r"^### (G[0-5]) —", validation, re.M)) == {f"G{n}" for n in range(6)})
check("Eight design locks defined", set(re.findall(r"^\| (DEC-\d{2}) \|", validation, re.M)) == {f"DEC-{n:02d}" for n in range(1, 9)})

docs["Commercial MVP scope.md"] = source
link_errors = []
for name, text in docs.items():
    for raw in re.findall(r"\[[^\]]+\]\((<[^>]+>|[^)\s]+)\)", text):
        target = raw.strip("<>")
        if re.match(r"^[a-z]+://", target, re.I) or target.startswith("mailto:"):
            continue
        path_part, sep, anchor = target.partition("#")
        dest = ROOT / (path_part or name)
        if not dest.is_file():
            link_errors.append(f"{name}: missing {target}")
        elif sep and anchor:
            target_text = dest.read_text(encoding="utf-8")
            if f'id="{anchor}"' not in target_text:
                link_errors.append(f"{name}: missing anchor {target}")
check("Local document links and explicit feature anchors resolve", not link_errors)
check("No replacement characters or internal web citation tokens", all("\ufffd" not in text and "cite" not in text for text in docs.values()))
marks = re.findall(r"^- \[([^\]]*)\] F-\d{3}-AC\d+:", backlog, re.M)
check("All criterion checkboxes use a supported state", len(marks) == 264 and all(mark in (" ", "x", "X") for mark in marks))


# V2 structural mappings must agree with actual feature metadata, not just counts.
source_members = {item: set() for item in expected_items}
suite_members = {suite: set() for suite in expected_suites}
for feature, body in cards.items():
    for item in re.findall(r"MVP-\d{2}", re.search(r"^Source items: (.+)$", body, re.M).group(1)):
        source_members[item].add(feature)
    for suite in re.findall(r"VP-\d{2}", re.search(r"^Required protocols: (.+?)\. Evidence:", body, re.M).group(1)):
        suite_members[suite].add(feature)

def trace_members(prefix):
    return {
        m.group(1): set(re.findall(r"F-\d{3}", m.group(2)))
        for m in re.finditer(r"^\| (" + prefix + r"-\d{2}) \| (.+)$", trace, re.M)
    }

check("Source-to-feature trace matches every card exactly", trace_members("MVP") == source_members)
check("Protocol-to-feature trace matches every card exactly", trace_members("VP") == suite_members)
check("All inline feature references resolve", all(
    ref in expected_features for doc in docs.values() for ref in re.findall(r"F-\d{3}", doc)
))
check("Scope explicitly retains 100 species and large-map floor",
      "At least 100" in source and "24 large" in source and "**at least 30 seconds**" in source)
check("Core documents carry starter, ultra-rare and guaranteed-summon rates", all(
    all(rate in doc for rate in ("10%", "0.01%", "100%")) for doc in docs.values()
))
check("No-pity and trainer-alone rules are explicit",
      "no pity" in source and "trainer alone" in source and "zero, one or two" in source)
check("Boss drops repeat without a global cap and deduplicate only one victory",
      all(token in source for token in ("Every eligible group victory", "0.01%",
                                       "no server-wide copy limit", "(victory_id, loot_row_id)",
                                       "two distinct victories", "Multiple accounts")))
check("Active plans reject the superseded lifetime-essence cap",
      all(re.search(r"no (?:server-wide|global) (?:copy|supply) (?:cap|limit)", doc, re.I)
          for doc in docs.values())
      and not any(phrase in doc for doc in docs.values() for phrase in (
          "One lifetime issuance per named essence",
          "at most one lifetime issuance per (realm_id, essence_id)",
          "while that named essence is unissued",
          "unique boss availability overrides chance to zero",
          "one lifetime lineage per named boss essence",
          "Summoning cannot free the issuance slot",
          "at most one realm essence lineage",
      )))
check("Full roster counts are arithmetically coherent",
      94 + 6 == 100 and (100 + 2) * 5 == 510 and (100 + 2) * 18 == 1836
      and all(token in source for token in ("510", "100 innate", "1,836", "102")))
odds = [(0.1, 10, 7, 29), (0.0001, 10000, 6932, 29956)]
check("Published independent-roll mean/median/95-percent thresholds are correct", all(
    math.isclose(1 / p, mean)
    and math.ceil(math.log(0.5) / math.log1p(-p)) == median
    and math.ceil(math.log(0.05) / math.log1p(-p)) == p95
    and 1 - (1 - p) ** (p95 - 1) < 0.95 <= 1 - (1 - p) ** p95
    for p, mean, median, p95 in odds
) and all(token in source for token in ("6,932", "29,956", "63.21%")))
check("Old small-launch estimate is explicitly withdrawn",
      "The v1 estimate is withdrawn" in source and "F-066" in backlog
      and "$1–2k" in source and "unproven" in source)
obsolete_positive_clauses = (
    "Guaranteed disclosed first bond",
    "Each of twelve core characters has",
    "All sixty skills use",
    "guided contract ≥70%",
    "capture tutorial exception",
    "standard/illuminated 65%/90% capture",
)
check("Superseded positive commercial requirements are absent", all(
    phrase not in doc for phrase in obsolete_positive_clauses for doc in docs.values()
))
archive = ROOT / "docs" / "scope-v1"
archive_names = ("Commercial MVP scope.md", "FEATURE_BACKLOG.md", "VALIDATION_PLAN.md",
                 "FEATURE_TRACEABILITY.md", "scope_docs_check.py", "README.md")
check("V1 planning archive remains separate with original 57-card baseline",
      all((archive / name).is_file() for name in archive_names)
      and len(re.findall(r"^### F-\d{3} —", (archive / "FEATURE_BACKLOG.md").read_text(encoding="utf-8"), re.M)) == 57)

report = {
    "kind": "documentation-integrity-only",
    "features": len(ids),
    "criteria": len(all_ac),
    "checked_criteria": sum(mark in ("x", "X") for mark in marks),
    "checks": checks,
    "passed": sum(c["pass"] for c in checks),
    "failed": sum(not c["pass"] for c in checks),
    "link_errors": link_errors,
}
print(json.dumps(report, indent=2, ensure_ascii=False))
raise SystemExit(1 if report["failed"] else 0)
