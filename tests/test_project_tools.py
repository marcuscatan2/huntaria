"""Mutation tests for architecture gates; all edits use disposable fixture copies."""
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import project


class ProjectToolsTests(unittest.TestCase):
    def setUp(self):
        # Keep disposable copies outside synced workspaces and their file locks.
        self.temp = tempfile.TemporaryDirectory(prefix="bond-bolt-architecture-")
        self.root = Path(self.temp.name)
        self.model = project.manifest()
        files = set(project.runtime_files(project.ROOT))
        files.update(("README.md", "AGENTS.md", project.MAP, project.MANIFEST,
                      "FEATURE_BACKLOG.md", "VALIDATION_PLAN.md",
                      "docs/ENGINEERING.md", "scripts/project.py"))
        files.update(("OWNER_REVIEWS.md", "docs/review-gates.json",
                      "data/creature-reference.json", "scripts/review_gates.py"))
        files.update(d for f in self.model["features"] for d in f["docs"])
        files.update(n for f in self.model["features"] for n in f["files"])
        files.update(d["command"][0] for d in self.model["suites"].values())
        files.update(p.name for p in project.ROOT.glob("*.md"))
        files.update(p.relative_to(project.ROOT).as_posix()
                     for folder in ("docs", "features")
                     for p in (project.ROOT / folder).rglob("*.md"))
        files.update(project.navigation.CONTAINERS)
        for name in files:
            dest = self.root / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(project.ROOT / name, dest)
        for paths in self.model["assets"].values():
            for name in paths:
                (self.root / name).mkdir(parents=True, exist_ok=True)

    def tearDown(self):
        self.temp.cleanup()

    def append(self, name, text):
        path = self.root / name
        path.write_text(project.read(self.root, name) + "\n" + text, encoding="utf-8")

    def errors(self):
        return "\n".join(project.validate(self.root, self.model))

    def test_actual_repository_passes(self):
        self.assertEqual(project.validate(), [])

    def test_new_runtime_file_needs_owner(self):
        (self.root / "new-feature.js").write_text("root.BondNew={};", encoding="utf-8")
        self.assertIn("exactly one primary owner", self.errors())

    def test_duplicate_owner_rejected(self):
        self.model["features"][1]["files"].append("game.js")
        self.assertIn("duplicate owners", self.errors())

    def test_boot_order_rejected(self):
        path = self.root / "index.html"
        value = project.read(self.root, "index.html").replace('src="content.js"', 'src="SWAP"')
        value = value.replace('src="rules.js"', 'src="content.js"').replace('src="SWAP"', 'src="rules.js"')
        path.write_text(value, encoding="utf-8")
        self.assertIn("Boot order", self.errors())

    def test_unknown_global_rejected(self):
        self.append("app.js", "BondUndeclared.run();")
        self.assertIn("unknown project global BondUndeclared", self.errors())

    def test_pure_model_cannot_use_dom(self):
        self.append("game.js", "document.querySelector('x');")
        self.assertIn("deterministic boundary violation", self.errors())

    def test_pure_model_cannot_use_wall_clock_randomness(self):
        self.append("game.js", "Math.random(); Date.now();")
        self.assertIn("deterministic boundary violation", self.errors())

    def test_pure_model_cannot_depend_on_view(self):
        self.append("game.js", "CombatView.draw(1);")
        self.assertIn("pure module depends on animation", self.errors())

    def test_ui_cannot_add_storage_authority(self):
        self.append("inventory-menu.js", "localStorage.setItem('coins','100');")
        self.assertIn("unauthorized storage access", self.errors())

    def test_stale_generated_map_rejected(self):
        self.append(project.MAP, "Unreviewed change")
        self.assertIn("FEATURE_MAP.md is stale", self.errors())

    def test_broken_readme_link_rejected(self):
        self.append("README.md", "[Missing](not-a-real-file.md)")
        self.assertIn("broken link", self.errors())

    def test_missing_backlog_route_rejected(self):
        self.model["features"][0]["backlog"].pop()
        self.assertIn("Commercial feature coverage", self.errors())

    def test_missing_connection_rejected(self):
        self.model["connections"][0]["via"].append("ghost.js")
        self.assertIn("unowned connector", self.errors())

    def test_css_impact_includes_explicit_connection(self):
        result = project.impact(["world-v15.css"])
        self.assertIn("animation", result["features"])
        self.assertIn("exploration", result["features"])
        self.assertIn("boundaries", result["suites"])

    def test_unknown_impact_is_not_silently_empty(self):
        with self.assertRaises(ValueError):
            project.impact(["not-a-file.js"])

    def test_map_is_deterministic(self):
        self.assertEqual(project.render(), project.render())

    def test_child_failure_propagates(self):
        with patch.object(project.subprocess, "run") as run:
            run.return_value.returncode = 7
            with redirect_stdout(io.StringIO()), self.assertRaises(RuntimeError):
                project.run(["fake-test.py"])

    def test_backup_is_unique_verified_and_excludes_private_generated_data(self):
        for name in (".env", "credentials-test.json", "bond-bolt-save-user.json", "debug.log", "old.zip"):
            (self.root / name).write_text("private fixture", encoding="utf-8")
        artifacts = self.root / "tests" / "artifacts"
        artifacts.mkdir(parents=True)
        (artifacts / "generated.json").write_text("{}", encoding="utf-8")
        (self.root / "backup").mkdir()
        (self.root / "backup" / "old.txt").write_text("old backup", encoding="utf-8")
        with redirect_stdout(io.StringIO()):
            a, b = project.backup(self.root), project.backup(self.root)
        self.assertNotEqual(a, b)
        with zipfile.ZipFile(b) as archive:
            names = archive.namelist()
            self.assertIn("README.md", names)
            self.assertIn("BACKUP_MANIFEST.json", names)
            self.assertFalse(any(n.startswith(("backup/", "backups/", "tests/artifacts/")) for n in names))
            self.assertNotIn(".env", names)
            self.assertNotIn("credentials-test.json", names)
            self.assertNotIn("bond-bolt-save-user.json", names)
            self.assertNotIn("debug.log", names)
            self.assertNotIn("old.zip", names)
            self.assertTrue(json.loads(archive.read("BACKUP_MANIFEST.json"))["sha256"])

    def test_git_rejects_force_added_ignored_artifacts(self):
        self.assertEqual(project.repository_hygiene(self.root), [])
        subprocess.run(["git", "init", "--quiet", str(self.root)], check=True)
        shutil.copy2(project.ROOT / ".gitignore", self.root / ".gitignore")
        (self.root / "tests/artifacts").mkdir(parents=True)
        paths = ["tests/artifacts/report.json", "debug.log", "old.zip", "PASS99_VALIDATION.md"]
        for name in paths:
            (self.root / name).write_text("disposable", encoding="utf-8")
        subprocess.run(["git", "add", "README.md", ".gitignore"], cwd=self.root, check=True)
        self.assertEqual(project.repository_hygiene(self.root), [])
        subprocess.run(["git", "add", "--force", *paths], cwd=self.root, check=True)
        errors = project.repository_hygiene(self.root)
        self.assertEqual(len(errors), len(paths))
        for name in paths:
            self.assertTrue(any(name in error for error in errors))


if __name__ == "__main__":
    unittest.main()
