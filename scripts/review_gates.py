"""Owner decisions and production gates. Never grants or fabricates approval."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "docs/review-gates.json"
BOARD = "OWNER_REVIEWS.md"
SAFE_WORK = {"prototype", "diagnostics", "review-packet"}


def load(root=ROOT):
    return json.loads((root / SOURCE).read_text(encoding="utf-8"))


def species_ids(root=ROOT):
    rows = json.loads((root / "data/creature-reference.json").read_text(encoding="utf-8"))
    return {r["id"] for r in rows["creatures"]}


def evidence_current(record, root=ROOT):
    if not record.get("evidence"):
        return False
    for evidence in record["evidence"]:
        path = (root / evidence["path"]).resolve()
        if not path.is_relative_to(root.resolve()) or not path.is_file():
            return False
        if hashlib.sha256(path.read_bytes()).hexdigest() != evidence["sha256"]:
            return False
    return True


def approved(gate, scope="*", root=ROOT):
    decisions = [d for d in gate["decisions"] if scope in d["scope"]]
    if not decisions:
        return False
    latest = decisions[-1]
    return (latest["result"] == "approved" and bool(latest["reference"].strip())
            and bool(latest["quote"].strip()) and evidence_current(latest, root))


def status(gate, root=ROOT):
    if gate["per_species"]:
        total = species_ids(root)
        count = sum(approved(gate, s, root) for s in total)
        return f"{count}/{len(total)} species approved"
    if approved(gate, root=root):
        return "Approved (current evidence)"
    latest = next((d for d in reversed(gate["decisions"]) if "*" in d["scope"]), None)
    if latest and latest["result"] == "defer":
        return "Deferred; dependent commitment still blocked"
    if latest and latest["result"] == "revise":
        return "Needs revision"
    if any(d["result"] == "approved" for d in gate["decisions"]):
        return "Re-review required"
    return "Needs revision" if gate["state"] == "revise" else "Pending review packet / decision"


def assess(root=ROOT, work=None, features=None, species=None):
    model = load(root)
    feature_ids = {f["id"] for f in json.loads((root / "docs/architecture.json").read_text(encoding="utf-8"))["features"]}
    unknown = set(features or []) - feature_ids
    if unknown:
        raise ValueError("Unknown review feature(s): " + ", ".join(sorted(unknown)))
    work_types = {w for g in model["gates"] for w in g["work"]} | SAFE_WORK
    if work is not None and work not in work_types:
        raise ValueError("Unknown milestone; choose: " + ", ".join(sorted(work_types)))
    selected = set(species or [])
    if selected - species_ids(root):
        raise ValueError("Unknown species IDs: " + ", ".join(sorted(selected - species_ids(root))))
    if work == "public-launch":
        selected = species_ids(root)
    gates = model["gates"]
    if work and work not in SAFE_WORK:
        # A milestone always checks all its gates. Feature filtering cannot
        # hide a cross-cutting prerequisite.
        gates = [g for g in gates if work in g["work"]]
    elif features:
        gates = [g for g in gates if set(features) & set(g["features"])]
    pending, cleared = [], []
    for gate in gates:
        required = selected if gate["per_species"] else {"*"}
        missing = sorted(s for s in required if not approved(gate, s, root))
        no_scope = gate["per_species"] and not required
        priority = "now" if work in gate["work"] else gate["timing"]
        item = {"id": gate["id"], "title": gate["title"], "priority": priority,
                "status": status(gate, root), "before": gate["before"],
                "why_late_costs_more": gate["why"], "next_packet": gate["packet"][0],
                "missing_scope": missing, "needs_species_scope": no_scope}
        if missing or no_scope:
            pending.append(item)
        else:
            cleared.append(gate["id"])
    pending.sort(key=lambda g: ({"now": 0, "next": 1, "later": 2}[g["priority"]], g["id"]))
    return {"milestone": work or "advisory only", "features": features or [],
            "blocked": bool(work and work not in SAFE_WORK and pending),
            "needs_you_now": [g for g in pending if g["priority"] == "now"][:3],
            "coming_next": [g for g in pending if g["priority"] == "next"],
            "later": [g for g in pending if g["priority"] == "later"],
            "pending": pending, "cleared": cleared,
            "safe_work": "Diagnostics, technical tests, review packets and reversible prototypes may continue.",
            "notice": "Approval is owner- and evidence-scoped; this tool cannot authenticate a conversation or infer task intent."}


def validate(root=ROOT, freshness=True):
    errors = []
    try:
        model = load(root)
        features = {f["id"] for f in json.loads((root / "docs/architecture.json").read_text(encoding="utf-8"))["features"]}
        species = species_ids(root)
        gates = model["gates"]
        ids = [g["id"] for g in gates]
        if model["version"] != 1 or len(ids) != len(set(ids)):
            errors.append("Review schema version or duplicate gate ID")
        for gate in gates:
            prefix = gate["id"] + ": "
            for field in ("title", "before", "why", "packet", "owner_accept",
                          "continue_work", "later", "reopen", "refs", "work"):
                if not gate.get(field):
                    errors.append(prefix + "missing " + field)
            if gate["timing"] not in {"now", "next", "later"} or gate["state"] not in {"pending", "revise"}:
                errors.append(prefix + "invalid priority/baseline state; approval comes from decisions")
            if not set(gate["features"]) <= features:
                errors.append(prefix + "unknown architecture feature")
            for ref in gate["refs"]:
                if not (root / ref).is_file():
                    errors.append(prefix + "missing reference " + ref)
            for decision in gate["decisions"]:
                if decision["result"] not in {"approved", "revise", "defer"}:
                    errors.append(prefix + "invalid owner decision")
                allowed = species if gate["per_species"] else {"*"}
                if not decision["scope"] or not set(decision["scope"]) <= allowed:
                    errors.append(prefix + "invalid or unscoped decision")
                if not decision["reference"].strip() or not decision["quote"].strip():
                    errors.append(prefix + "decision needs an explicit owner source and statement")
                if decision["result"] == "approved" and not decision["evidence"]:
                    errors.append(prefix + "approval needs pinned evidence")
                for evidence in decision["evidence"]:
                    path = Path(evidence["path"])
                    if path.is_absolute() or ".." in path.parts or not re.fullmatch(r"[a-f0-9]{64}", evidence["sha256"]):
                        errors.append(prefix + "invalid evidence path/hash")
            # Changed/missing approved evidence is a re-review, not a reason
            # to block all technical tests. assess() blocks dependent work.
        if freshness:
            if not (root / BOARD).is_file() or (root / BOARD).read_text(encoding="utf-8") != render(root):
                errors.append("OWNER_REVIEWS is stale; run project.py reviews --write")
    except (OSError, KeyError, TypeError, ValueError) as error:
        errors.append("Review data invalid: " + str(error))
    return errors


def summary(report):
    """Keep routine AI preflights short; full review packets live in the board."""
    return {
        "milestone": report["milestone"], "blocked": report["blocked"],
        "pending": [{k: item[k] for k in ("id", "title", "priority", "status",
                                        "needs_species_scope", "missing_scope")}
                    for item in report["pending"]],
        "cleared": report["cleared"], "board": BOARD,
        "safe_work": report["safe_work"]
    }


def render(root=ROOT):
    model = load(root)
    out = ["# Owner review gates — what needs your decision, and when", "",
           "Generated from [docs/review-gates.json](docs/review-gates.json).",
           "This is your decision queue, not a list of engineering chores. The AI",
           "prepares the evidence; you judge the product and authorize commitments.",
           "It complements [existing release gates G0–G5](VALIDATION_PLAN.md); it does",
           "not replace technical tests or automatically accept commercial criteria.", "",
           "## Your current priorities", "",
           "| When | Review | Current state | Stop before |",
           "| --- | --- | --- | --- |"]
    for gate in model["gates"]:
        out.append(f"| {gate['timing'].upper()} | [{gate['id']} — {gate['title']}](#{gate['id'].lower()}) | {status(gate, root)} | {gate['before']} |")
    current = assess(root)
    out += ["", "## What happens next", ""]
    for item in current["needs_you_now"]:
        out.append(f"- **{item['id']} — {item['title']}** ({item['status']}). {item['next_packet']}")
    if not current["needs_you_now"]:
        out.append("No immediate review remains in the recorded queue. Check the next work milestone before production.")
    out += ["", "Coming next: " + (", ".join(g["id"] for g in current["coming_next"]) or "none recorded") + ".",
            "The AI prepares a named packet before asking for approval. A pending gate",
            "is not a claim that a fresh packet already exists. For a selected work",
            "milestone, every unmet prerequisite becomes due now even if normally later.",
            "Approve standards once before repeating them; review the remaining species",
            "in 5–10-creature batches and unlock only the specifically approved scope.", "",
            "You do **not** need to approve all 100 finished monsters now. All 100 need",
            "scoped concept approval before their own final production and asset acceptance",
            "before release. Approving one sheet does not approve every species or its motion.", "",
            "## How I will keep you updated", "",
            "- Before relevant work: name the due gate, why delay creates rework,",
            "  the exact packet/decision needed and the dependent work that would pause.",
            "- At every substantive development handoff: **Needs you now** (max three),",
            "  **Coming next** (trigger, not a guessed date), **Safe to defer**.",
            "  If unchanged, say so briefly; do not repeat the whole register.",
            "- Notify again when a trigger is reached, evidence changes or your decision",
            "  is needed to proceed. Updates happen during project work, not as autonomous",
            "  background reminders while no assistant is running.",
            "- An approval applies only to the stated revision and scope. No reply, green",
            "  tests or general encouragement cannot approve another batch or release.",
            "- Rejected work stays rejected until a replacement is explicitly approved.",
            "  Never relabel a dependent production task as a prototype to bypass a gate.", "",
            "## What may continue / safely wait", "",
            "Engineering tests, bug fixes, performance diagnostics, rough concepts and",
            "reversible prototypes can continue. Do not wait for final art to test mechanics.",
            "A deliberately labeled prototype/user-feedback session is not a claim of",
            "polished quality; G0 safety/consent requirements still apply.",
            "",
            "Safe to defer now: final art for distant batches, incidental props, extra idle",
            "animations, cosmetic variants, exact late-game numbers, optional languages/",
            "browsers and final launch copy. Revisit them at their named production/release",
            "boundary. Stable species IDs, ownership and approved body/rig standards are",
            "not similarly cheap to change. Deferred Game notes remain deferred.", "",
            "## Gate details"]
    for gate in model["gates"]:
        out += ["", f'<a id="{gate["id"].lower()}"></a>', f"### {gate['id']} — {gate['title']}", "",
                f"Priority: **{gate['timing'].upper()}**. State: **{status(gate, root)}**.",
                "", "**Review before:** " + gate["before"],
                "", "**Why it becomes expensive later:** " + gate["why"],
                "", "**AI prepares:**", ""]
        out += ["- " + item for item in gate["packet"]]
        out += ["", "**You validate / acceptance:**", ""]
        out += ["- " + item for item in gate["owner_accept"]]
        out += ["", "**May continue:** " + gate["continue_work"],
                "", "**Can wait:** " + gate["later"],
                "", "**Reopen when:** " + gate["reopen"],
                "", "**Related specifications:** " + ", ".join(f"[{ref}](<{ref}>)" for ref in gate["refs"]) + "."]
    out += ["", "## Developer enforcement and decision records", "",
            "Commands from the project root:", "",
            chr(96)*3 + "powershell",
            "python scripts/project.py reviews",
            "python scripts/project.py reviews --feature animation",
            "python scripts/project.py reviews --work creature-production --species emberfox stonehorn --enforce",
            "python scripts/project.py reviews --work prototype --feature animation --enforce",
            "python scripts/project.py reviews --write",
            chr(96)*3, "",
            "Use the honest work milestone. The enforcement form exits nonzero if its",
            "applicable approvals are missing, rejected, deferred or stale. Production",
            "requiring per-species approval must name the species; public-launch always",
            "checks the complete roster. Feature filters cannot hide milestone gates.",
            "Normal project.py check validates this register's structure/freshness but",
            "does not require every review to be approved before technical testing.",
            "",
            "After an explicit owner decision, append a decision to the relevant JSON gate:",
            "result (approved/revise/defer), exact owner statement and conversation reference,",
            "scope (stable species IDs, or * only for global standards), and evidence",
            "files with SHA-256 hashes. Approvals require pinned evidence; never invent",
            "an owner statement. Hashes bind artifacts, not the truth of consent.",
            "Keep small per-batch evidence files so a changed species does not needlessly",
            "invalidate unrelated approvals. A later rejection/deferral supersedes approval",
            "for that scope. Changed evidence automatically requires re-review; semantic",
            "changes under each gate's reopen rule also require explicit re-review.",
            "",
            "This is a local preflight and mandatory assistant workflow, not an unbypassable",
            "production deployment control. Remote release enforcement remains future work.", ""]
    return "\n".join(out)
