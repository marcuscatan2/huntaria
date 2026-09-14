"""Routing regressions; mutate disposable fixtures, never game source/saves."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import navigation
import project
import test_project_tools as fixtures


class NavigationTests(unittest.TestCase):
    def setUp(self):
        self.fixture = fixtures.ProjectToolsTests()
        self.fixture.setUp()
        self.root = self.fixture.root
        self.model = self.fixture.model

    def tearDown(self):
        self.fixture.tearDown()

    def errors(self):
        return "\n".join(project.validate(self.root, self.model))

    def test_all_features_have_current_local_guides(self):
        self.assertEqual(project.validate(), [])
        for feature in self.model["features"]:
            self.assertTrue((project.ROOT / navigation.guide(feature["id"])).is_file())

    def test_feature_source_global_and_card_have_same_primary_route(self):
        for query in ("combat", "game.js", "./game.js", "BondGame", "F-002",
                      "features/combat/README.md", "features\\combat\\README.md",
                      str(self.root / "game.js")):
            result = project.context(query, self.root)
            self.assertEqual([x["feature"] for x in result["start_here"]], ["combat"], query)
            self.assertEqual(result["start_here"][0]["guide"], "features/combat/README.md")

    def test_connection_routes_both_sides_and_trace_files(self):
        result = project.context("combat-feedback", self.root)
        self.assertEqual({f["feature"] for f in result["start_here"]}, {"combat", "animation"})
        connection = next(c for c in result["inspect_if_crossing_boundary"] if c["id"] == "combat-feedback")
        self.assertIn("app.js", connection["via"])
        self.assertIn("boundaries", result["tests"])

    def test_shared_spec_routes_all_document_owners(self):
        result = project.context("Companion stats.md", self.root)
        self.assertEqual({f["feature"] for f in result["start_here"]}, {"combat", "growth", "party"})

    def test_unknown_or_external_context_is_not_a_false_match(self):
        for query in ("missing-feature", "F-999", "../game.js", str(self.root.parent / "game.js")):
            with self.assertRaises(ValueError):
                project.context(query, self.root)

    def test_context_is_read_only(self):
        files = list(self.root.rglob("*"))
        before = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in files if p.is_file()}
        project.context("animation", self.root)
        after = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in files if p.is_file()}
        self.assertEqual(before, after)

    def test_feature_context_does_not_dump_unrelated_implementation(self):
        result = project.context("animation", self.root)
        sources = result["start_here"][0]["files"]
        self.assertIn("character-rig.js", sources)
        self.assertNotIn("profile.js", sources)
        self.assertNotIn("all_features", result)
        self.assertIn("OR-04", result["owner_gates"])

    def test_stale_local_guide_rejected(self):
        self.fixture.append("features/combat/README.md", "Unreviewed extra rules")
        self.assertIn("features/combat/README.md is stale", self.errors())

    def test_stale_connection_reference_rejected(self):
        self.fixture.append(navigation.CONNECTIONS, "Changed outside manifest")
        self.assertIn(navigation.CONNECTIONS + " is stale", self.errors())

    def test_broken_feature_local_manual_link_rejected(self):
        self.fixture.append("features/persistence/SAVES.md", "[Missing](gone.md)")
        self.assertIn("features/persistence/SAVES.md: broken link", self.errors())

    def test_registered_manual_guides_are_checked_too(self):
        path = self.root / "features/combat/DETAIL.md"
        path.write_text("# Detail\n\n[Missing](gone.md)\n", encoding="utf-8")
        next(f for f in self.model["features"] if f["id"] == "combat")["docs"].append("features/combat/DETAIL.md")
        self.assertIn("features/combat/DETAIL.md: broken link", self.errors())

    def test_missing_feature_guide_rejected(self):
        (self.root / "features/combat/README.md").unlink()
        self.assertIn("Missing routing document features/combat/README.md", self.errors())

    def test_unregistered_detail_is_not_silent(self):
        path = self.root / "features/combat/DETAIL.md"
        path.write_text("# New manual detail\n", encoding="utf-8")
        self.assertIn("Unrouted feature detail features/combat/DETAIL.md", self.errors())

    def test_readme_cannot_grow_into_feature_manual(self):
        self.fixture.append("README.md", "explanation " * 601)
        self.assertIn("README routing budget exceeded", self.errors())

    def test_feature_index_has_size_budget(self):
        self.fixture.append(project.MAP, "explanation " * 1301)
        self.assertIn("FEATURE_MAP routing budget exceeded", self.errors())

    def test_interface_must_route_real_feature(self):
        self.model["interfaces"][0]["features"] = ["not-an-owner"]
        self.assertIn("Interface has missing/unknown feature routes", self.errors())

    def test_summary_must_stay_compact(self):
        self.model["features"][0]["summary"] = "x" * 181
        self.assertIn("routing summary", self.errors())

    def test_unsafe_feature_ids_block_generation(self):
        self.model["features"][0]["id"] = "../escape"
        (self.root / project.MANIFEST).write_text(json.dumps(self.model), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "Unsafe feature"):
            project.write_maps(self.root)
        self.assertFalse((self.root / "escape").exists())

    def test_orphan_feature_container_is_not_silent(self):
        path = self.root / "features/ghost/README.md"
        path.parent.mkdir()
        path.write_text("# Unregistered\n", encoding="utf-8")
        self.assertIn("Unrouted feature container ghost", self.errors())

    def test_regeneration_updates_all_routes_without_runtime_changes(self):
        files = project.runtime_files(self.root)
        before = {n: (self.root / n).read_bytes() for n in files}
        next(f for f in self.model["features"] if f["id"] == "combat")["summary"] = "Changed routing description for a fixture only."
        (self.root / project.MANIFEST).write_text(json.dumps(self.model), encoding="utf-8")
        generated = project.write_maps(self.root)
        self.assertEqual(len(generated), len(self.model["features"]) + 3)
        self.assertIn("Changed routing description", project.read(self.root, project.MAP))
        self.assertIn("Changed routing description", project.read(self.root, "features/combat/README.md"))
        self.assertEqual(project.validate(self.root), [])
        self.assertEqual(before, {n: (self.root / n).read_bytes() for n in files})
        self.assertEqual(generated, project.write_maps(self.root))

    def test_impact_points_to_local_guide(self):
        result = project.impact(["character-rig.js"], self.root)
        self.assertEqual(result["start_here"][0]["guide"], "features/animation/README.md")

    def test_root_map_routes_instead_of_dumping_boot_graph(self):
        compact = project.render(self.root)
        self.assertIn("features/combat/README.md", compact)
        self.assertNotIn("| Boot | Module", compact)
        self.assertLessEqual(len(compact.split()), 1300)
        self.assertIn("| Boot | Module", project.read(self.root, navigation.MODULES))

    def test_actual_context_cli_success_and_failure(self):
        command = [sys.executable, str(project.ROOT / "scripts/project.py"), "context"]
        for query, expected in ((["BondGame"], 0), (["--list"], 0),
                                (["missing"], 1), ([], 1), (["combat", "--list"], 1)):
            result = subprocess.run(command + query, cwd=self.root, capture_output=True, text=True)
            self.assertEqual(result.returncode, expected, result.stderr)
            if expected == 0:
                self.assertTrue(json.loads(result.stdout))


if __name__ == "__main__":
    unittest.main()
