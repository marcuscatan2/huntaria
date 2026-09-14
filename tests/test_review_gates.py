"""Decision-gate tests. Fake approvals exist only in disposable fixture copies."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import review_gates as reviews


class ReviewGateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="bond-bolt-owner-gate-")
        self.root = Path(self.temp.name)
        self.data = reviews.load()
        files = {reviews.SOURCE, "docs/architecture.json", "data/creature-reference.json"}
        files.update(ref for g in self.data["gates"] for ref in g["refs"])
        for name in files:
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(reviews.ROOT / name, target)
        self.evidence = self.root / "review-sample.txt"
        self.evidence.write_text("TEST FIXTURE ONLY; no real owner approval", encoding="utf-8")
        self.save()

    def tearDown(self):
        self.temp.cleanup()

    def save(self):
        (self.root / reviews.SOURCE).write_text(json.dumps(self.data), encoding="utf-8")
        (self.root / reviews.BOARD).write_text(reviews.render(self.root), encoding="utf-8")

    def gate(self, id_):
        return next(g for g in self.data["gates"] if g["id"] == id_)

    def approve(self, id_, scope=None):
        self.gate(id_)["decisions"].append({
            "result": "approved", "scope": scope or ["*"],
            "reference": "Unit-test synthetic owner source; not real consent",
            "quote": "Synthetic test approval of the named fixture",
            "evidence": [{"path": self.evidence.name,
                          "sha256": hashlib.sha256(self.evidence.read_bytes()).hexdigest()}]})
        self.save()

    def test_current_board_and_schema_pass(self):
        self.assertEqual(reviews.validate(), [])

    def test_rejected_art_blocks_production(self):
        result = reviews.assess(self.root, "creature-production", species=["emberfox"])
        self.assertTrue(result["blocked"])
        self.assertIn("OR-01", [g["id"] for g in result["pending"]])

    def test_prototypes_and_tests_remain_allowed(self):
        for work in reviews.SAFE_WORK:
            result = reviews.assess(self.root, work, features=["animation"])
            self.assertFalse(result["blocked"])
            self.assertTrue(result["pending"])

    def test_explicit_revision_scoped_approval(self):
        self.approve("OR-01")
        self.assertTrue(reviews.approved(self.gate("OR-01"), root=self.root))
        self.evidence.write_text("changed candidate", encoding="utf-8")
        self.assertFalse(reviews.approved(self.gate("OR-01"), root=self.root))
        self.assertIn("Re-review", reviews.status(self.gate("OR-01"), self.root))

    def test_species_approval_is_not_roster_approval(self):
        self.approve("OR-05", ["emberfox"])
        self.assertTrue(reviews.approved(self.gate("OR-05"), "emberfox", self.root))
        self.assertFalse(reviews.approved(self.gate("OR-05"), "stonehorn", self.root))
        self.assertEqual(reviews.status(self.gate("OR-05"), self.root), "1/100 species approved")

    def test_species_production_must_name_scope(self):
        result = reviews.assess(self.root, "animation-production")
        self.assertTrue(next(g for g in result["pending"] if g["id"] == "OR-05")["needs_species_scope"])

    def test_launch_always_checks_full_roster(self):
        self.approve("OR-05", ["emberfox"])
        result = reviews.assess(self.root, "public-launch", species=["emberfox"])
        batch = next(g for g in result["pending"] if g["id"] == "OR-05")
        self.assertEqual(len(batch["missing_scope"]), 99)

    def test_feature_filter_cannot_hide_milestone_gates(self):
        result = reviews.assess(self.root, "creature-production", features=["legacy"], species=["emberfox"])
        self.assertTrue(result["blocked"])
        self.assertIn("OR-01", [g["id"] for g in result["pending"]])

    def test_milestone_promotes_later_gate_to_due_now(self):
        result = reviews.assess(self.root, "capacity-expansion")
        self.assertEqual(result["pending"][0]["priority"], "now")

    def test_approved_gate_leaves_immediate_queue(self):
        self.approve("OR-01")
        result = reviews.assess(self.root)
        self.assertNotIn("OR-01", [g["id"] for g in result["needs_you_now"]])
        self.assertIn("Approved (current evidence)", reviews.render(self.root))

    def test_latest_defer_overrides_old_approval(self):
        self.approve("OR-01")
        self.gate("OR-01")["decisions"].append({
            "result": "defer", "scope": ["*"], "reference": "Synthetic later decision",
            "quote": "Wait for a new direction", "evidence": []})
        self.save()
        self.assertFalse(reviews.approved(self.gate("OR-01"), root=self.root))

    def test_approval_without_evidence_is_invalid(self):
        self.approve("OR-01")
        self.gate("OR-01")["decisions"][-1]["evidence"] = []
        self.save()
        self.assertTrue(any("pinned evidence" in x for x in reviews.validate(self.root)))

    def test_unscoped_roster_approval_is_invalid(self):
        self.approve("OR-05", ["*"])
        self.assertTrue(any("unscoped decision" in x for x in reviews.validate(self.root)))

    def test_missing_owner_statement_is_invalid(self):
        self.approve("OR-01")
        self.gate("OR-01")["decisions"][-1]["quote"] = ""
        self.save()
        self.assertTrue(any("explicit owner source" in x for x in reviews.validate(self.root)))

    def test_unknown_feature_rejected(self):
        with self.assertRaises(ValueError):
            reviews.assess(self.root, features=["imaginary"])

    def test_unknown_milestone_rejected(self):
        with self.assertRaises(ValueError):
            reviews.assess(self.root, work="unknown-production")

    def test_unknown_species_rejected(self):
        with self.assertRaises(ValueError):
            reviews.assess(self.root, "creature-production", species=["unknown"])

    def test_approval_does_not_write_decisions(self):
        before = (self.root / reviews.SOURCE).read_bytes()
        reviews.assess(self.root, "public-launch")
        self.assertEqual(before, (self.root / reviews.SOURCE).read_bytes())

    def test_stale_board_detected(self):
        (self.root / reviews.BOARD).write_text("old board", encoding="utf-8")
        self.assertTrue(any("stale" in x for x in reviews.validate(self.root)))

    def test_cli_blocks_production_but_not_diagnostics(self):
        command = [sys.executable, str(reviews.ROOT / "scripts/project.py"), "reviews"]
        blocked = subprocess.run(command + ["--work", "creature-production",
                                           "--species", "emberfox", "--enforce"],
                                 cwd=reviews.ROOT, capture_output=True, text=True)
        allowed = subprocess.run(command + ["--work", "diagnostics", "--enforce"],
                                 cwd=reviews.ROOT, capture_output=True, text=True)
        self.assertEqual(blocked.returncode, 2, blocked.stderr)
        self.assertEqual(allowed.returncode, 0, allowed.stderr)


if __name__ == "__main__":
    unittest.main()
