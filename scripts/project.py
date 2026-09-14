"""Dependency-free navigation, architecture gates and safe source checkpoints."""
from __future__ import annotations

import argparse
from collections import defaultdict, deque
from datetime import datetime, timezone
import fnmatch
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import uuid
import zipfile
import review_gates
import navigation

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = "docs/architecture.json"
MAP = "FEATURE_MAP.md"
EXPORT = re.compile(r"\b(?:root|window|globalThis)\.([A-Za-z_$][\w$]*)\s*=\s*(?!=)")
SYMBOL = re.compile(r"\b(?:Bond[A-Z]\w*|Bonding|CharacterRig|CombatView|CombatVFX|WorldRenderer)\b")
EVENT = re.compile(r"(?:addEventListener|CustomEvent)\(\s*['\"](bond-[\w-]+)['\"]")
FORBIDDEN = re.compile(r"\b(?:document|window|localStorage|sessionStorage|fetch|XMLHttpRequest|WebSocket)\b|\b(?:Math\.random|Date\.now|performance\.now)\s*\(")


def read(root, name):
    return (root / name).read_text(encoding="utf-8-sig")


def manifest(root=ROOT):
    return json.loads(read(root, MANIFEST))


class Entry(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.scripts, self.styles = [], []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script" and a.get("src"):
            self.scripts.append((a["src"], "defer" in a))
        if tag == "link" and a.get("rel") == "stylesheet":
            self.styles.append(a["href"])


def code_only(source):
    # Lexical guard, not a JS parser. Keep template expressions. References
    # inside strings can conservatively add edges; see ENGINEERING limitations.
    return re.sub(r"/\*.*?\*/|//[^\n]*", "", source, flags=re.S)


def runtime_files(root):
    files = {p.relative_to(root).as_posix() for pattern in ("*.js", "*.css", "*.html")
             for p in root.glob(pattern) if p.is_file()}
    files.update(p.relative_to(root).as_posix() for p in (root / "src").rglob("*")
                 if p.is_file() and p.suffix in (".js", ".css", ".html"))
    return sorted(files)


def observe(root, model):
    owners = {name: f["id"] for f in model["features"] for name in f["files"]}
    entry = Entry(read(root, "index.html"))
    sources = {name: code_only(read(root, name)) for name in runtime_files(root)
               if name.endswith(".js")}
    exports = {name: sorted(set(EXPORT.findall(code))) for name, code in sources.items()}
    providers = {s: name for name, symbols in exports.items() for s in symbols}
    references = {name: sorted(set(SYMBOL.findall(code)) - set(exports[name]))
                  for name, code in sources.items()}
    dependencies = {name: sorted({providers[s] for s in refs if s in providers
                                 and providers[s] != name})
                    for name, refs in references.items()}
    events = {name: sorted(set(EVENT.findall(code))) for name, code in sources.items()}
    return dict(owners=owners, entry=entry, sources=sources, exports=exports,
                providers=providers, references=references, dependencies=dependencies,
                events=events)


def safe_path(root, name):
    p = Path(name)
    return not p.is_absolute() and ".." not in p.parts and (root / p).is_file()


def validate(root=ROOT, model=None, freshness=True):
    m = model or manifest(root)
    o = observe(root, m)
    errors = []
    def require(ok, message):
        if not ok:
            errors.append(message)
    require(m.get("version") == 1, "Unsupported architecture manifest version")
    features = m["features"]
    ids = [f["id"] for f in features]
    require(len(ids) == len(set(ids)), "Duplicate feature ID")
    file_owners = defaultdict(list)
    for f in features:
        for field in ("id", "title", "status", "entry", "contract"):
            require(bool(f.get(field)), f"{f.get('id')}: missing {field}")
        require(bool(f["tests"]) or f["status"] == "planned",
                f"{f['id']}: implemented feature has no validation route")
        for name in f["files"]:
            file_owners[name].append(f["id"])
            require(safe_path(root, name), f"{f['id']}: missing/unsafe owned file {name}")
        for name in f["docs"]:
            require(safe_path(root, name), f"{f['id']}: missing document {name}")
        for suite in f["tests"]:
            require(suite in m["suites"], f"{f['id']}: unknown suite {suite}")
    for name in runtime_files(root):
        require(len(file_owners[name]) == 1,
                f"{name}: needs exactly one primary owner (found {file_owners[name]})")
    for name, owners in file_owners.items():
        require(len(owners) == 1, f"{name}: duplicate owners {owners}")
    scripts = [name for name, _ in o["entry"].scripts]
    require(len(scripts) == len(set(scripts)), "Duplicate boot script")
    require(all(defer for _, defer in o["entry"].scripts), "Runtime scripts must use defer")
    for name in scripts + o["entry"].styles:
        require(safe_path(root, name), f"Missing/nonlocal entry resource: {name}")
        require(name in file_owners, f"Unowned entry resource: {name}")
    js = {name for name in runtime_files(root) if name.endswith(".js")}
    require(js == set(scripts) | set(m["unloaded"]), "Loaded/unloaded JS inventory drift")
    require(not set(scripts) & set(m["unloaded"]), "Retired script unexpectedly loaded")
    require({n for n in runtime_files(root) if n.endswith(".css")} == set(o["entry"].styles),
            "Stylesheet inventory/order requires review")
    providers = defaultdict(list)
    for name, symbols in o["exports"].items():
        for s in symbols:
            providers[s].append(name)
    for s, names in providers.items():
        require(len(names) == 1, f"Duplicate global provider {s}: {names}")
    for name, refs in o["references"].items():
        for symbol in refs:
            require(symbol in providers, f"{name}: unknown project global {symbol}")
    for name, symbols in m["boot_requires"].items():
        require(name in scripts, f"Boot requirement owner not loaded: {name}")
        for symbol in symbols:
            provider = o["providers"].get(symbol)
            require(provider in scripts and name in scripts and scripts.index(provider) < scripts.index(name),
                    f"Boot order: {name} requires earlier {symbol} ({provider})")
    for name in m["pure_files"]:
        require(name in o["sources"], f"Missing pure module {name}")
        # Ordinary UI-facing strings such as "Recovery window" are not IO.
        stripped = re.sub(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"",
                          "''", o["sources"].get(name, ""))
        bad = FORBIDDEN.search(stripped)
        require(not bad, f"{name}: deterministic boundary violation: {bad.group() if bad else ''}")
        for dependency in o["dependencies"].get(name, []):
            owner = o["owners"].get(dependency)
            require(owner not in {"shell", "animation", "exploration", "persistence"},
                    f"{name}: pure module depends on {owner} via {dependency}")
    for name, code in o["sources"].items():
        if re.search(r"\blocalStorage\s*(?:\.|\[)", code):
            require(name in m["storage_writers"], f"{name}: unauthorized storage access")
    for owner, paths in m["assets"].items():
        require(owner in ids, f"Unknown asset owner {owner}")
        for path in paths:
            require((root / path).is_dir(), f"Missing asset directory {path}")
    for suite, definition in m["suites"].items():
        require(safe_path(root, definition["command"][0]), f"{suite}: missing test entry")
    connection_ids = [c["id"] for c in m["connections"]]
    require(len(connection_ids) == len(set(connection_ids)), "Duplicate connection ID")
    for c in m["connections"]:
        require(c["from"] in ids and c["to"] in ids, f"{c['id']}: invalid feature connection")
        require(bool(c["contract"]), f"{c['id']}: missing boundary contract")
        for name in c["via"]:
            require(name in file_owners, f"{c['id']}: unowned connector {name}")
    for _, owner, connection, _ in m["symptoms"]:
        require(owner in ids and connection in connection_ids, "Invalid symptom route")
    expected = set(re.findall(r"^### (F-\d{3}) — ", read(root, "FEATURE_BACKLOG.md"), re.M))
    mapped = [card for f in features for card in f["backlog"]]
    require(set(mapped) == expected, "Commercial feature coverage differs from backlog")
    require(len(mapped) == len(set(mapped)), "Commercial card has multiple primary routes")
    errors.extend(navigation.validate(root, m, o, freshness=freshness))
    errors.extend(review_gates.validate(root, freshness=freshness))
    return errors


def link(name):
    return f"[{name}](<{name}>)"


def inline(text):
    return chr(96) + text + chr(96)


def render(root=ROOT, model=None):
    m = model or manifest(root)
    return navigation.render_map(root, m, observe(root, m))


def context(query, root=ROOT):
    m = manifest(root)
    return navigation.context(query, root, m, observe(root, m))


def write_maps(root=ROOT):
    m = manifest(root)
    # Validate before constructing paths or overwriting generated files.
    errors = navigation.validate_model(m)
    if errors:
        raise ValueError("\n".join(errors))
    outputs = navigation.documents(root, m, observe(root, m))
    for name in outputs:
        path = root / name
        if not path.resolve().is_relative_to(root.resolve()):
            raise ValueError("Generated document escapes project: " + name)
    for name, value in outputs.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value, encoding="utf-8", newline="\n")
    return sorted(outputs)


def impact(paths, root=ROOT):
    m = manifest(root)
    o = observe(root, m)
    requested = {p.replace("\\", "/").removeprefix("./") for p in paths}
    unknown = requested - set(o["owners"])
    if unknown:
        raise ValueError("No runtime owner for: " + ", ".join(sorted(unknown)) +
                         ". For tooling/data/docs use the full validation gate.")
    affected, queue = set(requested), deque(requested)
    reverse = defaultdict(set)
    for source, deps in o["dependencies"].items():
        for dep in deps:
            reverse[dep].add(source)
    for c in m["connections"]:
        for name in c["via"]:
            reverse[name].update(c["via"])
    while queue:
        for consumer in reverse[queue.popleft()] - affected:
            affected.add(consumer)
            queue.append(consumer)
    ids = {o["owners"][n] for n in affected}
    primary = [f for f in m["features"] if f["id"] in {o["owners"][n] for n in requested}]
    first = sorted(set().union(*(reverse[n] for n in requested)) - requested)
    return {"changed": sorted(requested),
            "start_here": [{"owner": f["id"], "entry": f["entry"], "guide": navigation.guide(f["id"]), "tests": f["tests"]} for f in primary],
            "inspect_next": first,
            "connections": [c["id"] for c in m["connections"] if requested & set(c["via"])],
            "owner_reviews": review_gates.summary(review_gates.assess(root, features=[f["id"] for f in primary])),
            "affected_files": sorted(affected),
            "features": sorted(ids),
            "suites": sorted({s for f in m["features"] if f["id"] in ids for s in f["tests"]}),
            "note": "Conservative transitive impact including explicit connectors, not proof of every dynamic reference."}


def run(args, root=ROOT):
    print("> " + " ".join(args), flush=True)
    result = subprocess.run([sys.executable, *args], cwd=root, check=False)
    if result.returncode:
        raise RuntimeError(f"Validation failed ({result.returncode}): {' '.join(args)}")


def check(root=ROOT):
    errors = validate(root)
    if errors:
        raise RuntimeError("\n".join(errors))
    run(["-m", "unittest", "discover", "-s", "tests", "-p", "test_project_tools.py"], root)
    run(["-m", "unittest", "discover", "-s", "tests", "-p", "test_review_gates.py"], root)
    run(["-m", "unittest", "discover", "-s", "tests", "-p", "test_navigation.py"], root)
    run(["tests/scope_docs_check.py"], root)
    print("PASS: architecture ownership, boundaries, map, links and planning integrity", flush=True)


def doctor():
    info = {"python": sys.version.split()[0], "python_supported": sys.version_info >= (3, 12),
            "project_root": str(ROOT), "git": shutil.which("git"),
            "bundled_chromium_requested": os.environ.get("BOND_USE_BUNDLED_CHROMIUM") == "1"}
    try:
        from playwright._repo_version import version
        info["playwright"] = version
    except (ImportError, PermissionError):
        info["playwright"] = "Not importable here; install requirements-dev.txt in .venv"
    info["browser_override"] = {n: os.environ.get("BOND_BROWSER_" + n.upper())
                                for n in ("chrome", "edge")}
    print(json.dumps(info, indent=2))


def backup(root=ROOT):
    excluded = {".git", ".venv", "venv", "node_modules", "__pycache__", "backups",
                ".pytest_cache", "dist", "build", "playwright-report", "test-results"}
    secrets = [".env", ".env.*", "*.pem", "*.key", "credentials*.json",
               "*local-save*.json", "bond-bolt-save*.json", "*.pyc", "*.pyo"]
    selected = []
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root)
        if not path.is_file() or excluded.intersection(relative.parts):
            continue
        if relative.parts[:2] == ("tests", "artifacts"):
            continue
        if any(fnmatch.fnmatch(path.name.lower(), pattern) for pattern in secrets):
            continue
        if any(part.startswith("browser-profile") for part in relative.parts):
            continue
        if not path.resolve().is_relative_to(root.resolve()):
            raise ValueError(f"Backup refuses external file: {relative}")
        selected.append(path)
    folder = root / "backups"
    folder.mkdir(exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    target = folder / f"bond-bolt-{stamp}-{uuid.uuid4().hex[:8]}.zip"
    hashes = {}
    with zipfile.ZipFile(target, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=3) as z:
        for path in selected:
            name = path.relative_to(root).as_posix()
            content = path.read_bytes()
            hashes[name] = hashlib.sha256(content).hexdigest()
            z.writestr(name, content)
        z.writestr("BACKUP_MANIFEST.json", json.dumps({"sha256": hashes}, indent=2))
    with zipfile.ZipFile(target) as z:
        if z.testzip() is not None:
            raise RuntimeError("Backup CRC verification failed: " + str(target))
        for name, digest in hashes.items():
            if hashlib.sha256(z.read(name)).hexdigest() != digest:
                raise RuntimeError("Backup hash mismatch: " + name)
    print(f"Verified backup: {target} ({len(hashes)} files). No browser saves or Google Sheets.")
    return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("doctor", "check", "backup"):
        sub.add_parser(name)
    mp = sub.add_parser("map")
    mp.add_argument("--write", action="store_true")
    ip = sub.add_parser("impact")
    ip.add_argument("files", nargs="+")
    cp = sub.add_parser("context", help="Focused route by feature, source, global, card or connection")
    cp.add_argument("query", nargs="?")
    cp.add_argument("--list", action="store_true", help="List feature IDs and one-line responsibilities")
    rp = sub.add_parser("reviews", help="Owner priorities and scoped production preflight")
    rp.add_argument("--feature", action="append", default=[])
    rp.add_argument("--work", help="Milestone, e.g. creature-production or prototype")
    rp.add_argument("--species", nargs="+", default=[])
    rp.add_argument("--enforce", action="store_true", help="Exit 2 for blocked milestone")
    rp.add_argument("--write", action="store_true", help="Regenerate OWNER_REVIEWS only")
    vp = sub.add_parser("verify")
    vp.add_argument("--browser", choices=["chrome", "edge"], default="chrome")
    args = parser.parse_args()
    try:
        if args.command == "doctor":
            doctor()
        elif args.command == "backup":
            backup()
        elif args.command == "impact":
            print(json.dumps(impact(args.files), indent=2))
        elif args.command == "context":
            if args.list and args.query:
                raise ValueError("Choose a query or --list, not both")
            if args.list:
                print(json.dumps([{"id": f["id"], "purpose": f["summary"],
                                   "guide": navigation.guide(f["id"])}
                                  for f in manifest()["features"]], indent=2))
            elif args.query:
                print(json.dumps(context(args.query), indent=2))
            else:
                raise ValueError("context requires a query or --list")
        elif args.command == "reviews":
            if args.write:
                if args.work or args.feature or args.species or args.enforce:
                    raise ValueError("--write cannot be combined with preflight filters")
                errors = review_gates.validate(ROOT, freshness=False)
                if errors:
                    raise ValueError("\n".join(errors))
                (ROOT / review_gates.BOARD).write_text(review_gates.render(ROOT), encoding="utf-8", newline="\n")
                print("Generated OWNER_REVIEWS.md. No approvals changed.")
            else:
                if args.enforce and not args.work:
                    raise ValueError("--enforce requires an explicit --work milestone")
                errors = review_gates.validate(ROOT)
                if errors:
                    raise ValueError("\n".join(errors))
                report = review_gates.assess(ROOT, args.work, args.feature, args.species)
                print(json.dumps(review_gates.summary(report), indent=2))
                if args.enforce and report["blocked"]:
                    return 2
        elif args.command == "map":
            if args.write:
                paths = write_maps()
                print(f"Generated {len(paths)} routing documents; semantic contracts still require review.")
            else:
                print(render())
        elif args.command == "check":
            check()
        elif args.command == "verify":
            check()
            m = manifest()
            run(["scripts/world_assets.py", "--check"])
            run(["scripts/audio_assets.py", "--check"])
            for suite in ("boundaries", "mechanics", "ui", "campaign", "opening", "onboarding", "sprites", "trainer-animation", "field-polish", "experience", "runtime", "client-build"):
                run([*m["suites"][suite]["command"], "--browser", args.browser])
            # Reference validation specifically reads the Chrome runtime export.
            if args.browser == "edge":
                run([*m["suites"]["mechanics"]["command"], "--browser", "chrome"])
            run(m["suites"]["reference"]["command"])
            print("PASS: full current gate. External release gates remain unverified.")
    except (ValueError, RuntimeError, OSError, KeyError) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
