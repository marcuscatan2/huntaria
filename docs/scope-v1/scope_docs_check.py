"""Read-only integrity checks for the commercial MVP planning documents.

Run: python tests/scope_docs_check.py
These validate documentation structure and traceability, not gameplay or launch readiness.
"""
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
NAMES = ("FEATURE_BACKLOG.md", "VALIDATION_PLAN.md", "FEATURE_TRACEABILITY.md")
docs = {name: (ROOT / name).read_text(encoding="utf-8") for name in NAMES}
backlog, validation, trace = (docs[name] for name in NAMES)
source = (ROOT / "Commercial MVP scope.md").read_text(encoding="utf-8")
expected_features = {f"F-{n:03d}" for n in range(1, 58)}
expected_items = {f"MVP-{n:02d}" for n in range(1, 22)}
expected_suites = {f"VP-{n:02d}" for n in range(1, 13)}
checks = []


def check(name, condition):
    checks.append({"name": name, "pass": bool(condition)})


matches = list(re.finditer(r"^### (F-\d{3}) — (.+)$", backlog, re.M))
ids = [m.group(1) for m in matches]
check("57 unique feature cards with stable IDs", len(ids) == len(set(ids)) == 57 and set(ids) == expected_features)
cards = {}
for i, match in enumerate(matches):
    cards[match.group(1)] = backlog[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(backlog)]

all_ac = re.findall(r"^- \[[ xX]\] (F-\d{3}-AC\d+): (.+)$", backlog, re.M)
check("228 unique numbered acceptance criteria", len(all_ac) == 228 and len({a for a, _ in all_ac}) == 228)
check("Four nonempty criteria per feature", all(
    {a for a, text in all_ac if a.startswith(feature + "-")} == {f"{feature}-AC{n}" for n in range(1, 5)}
    for feature in expected_features
))
check("55 P0 and 2 optional P1 cards", len(re.findall(r"^Priority: P0 ", backlog, re.M)) == 55 and len(re.findall(r"^Priority: P1 ", backlog, re.M)) == 2)

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
check("All 21 source items are covered by feature cards", item_coverage == expected_items)
check("All 12 validation protocols are used", suite_coverage == expected_suites)
check("Traceability maps all 21 actual source backlog items",
      set(re.findall(r"^\| (MVP-\d{2}) \|", source, re.M)) ==
      set(re.findall(r"^\| (MVP-\d{2}) \|", trace, re.M)) == expected_items)
check("All 18 scope sections are mapped", set(re.findall(r"^\| §(\d+) \|", trace, re.M)) == {str(n) for n in range(1, 19)})
check("12 detailed validation protocol definitions", set(re.findall(r"^### (VP-\d{2}) —", validation, re.M)) == expected_suites)
check("Six release gates defined", set(re.findall(r"^### (G[0-5]) —", validation, re.M)) == {f"G{n}" for n in range(6)})
check("Six design locks defined", set(re.findall(r"^\| (DEC-\d{2}) \|", validation, re.M)) == {f"DEC-{n:02d}" for n in range(1, 7)})

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
check("All criterion checkboxes use a supported state", len(marks) == 228 and all(mark in (" ", "x", "X") for mark in marks))

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
