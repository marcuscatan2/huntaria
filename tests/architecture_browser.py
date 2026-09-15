"""Current integration boundaries, using a fresh browser and a DOM-free worker."""
import argparse
import functools
import hashlib
from http.server import ThreadingHTTPServer
import json
import sys
import threading
import traceback

from browser_check import legacy_adventure, ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright
sys.path.insert(0, str(ROOT / "scripts"))
import project


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser", choices=["chrome", "edge"], default="chrome")
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", 0),
                                 functools.partial(QuietServer, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    checks, errors, missing = [], [], []
    def check(name, value):
        checks.append({"name": name, "pass": bool(value)})
    inputs = project.runtime_files(ROOT)
    hashes = {n: hashlib.sha256((ROOT / n).read_bytes()).hexdigest() for n in inputs}
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            page = context.new_page()
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("response", lambda r: missing.append(r.url) if r.status >= 400 else None)
            legacy_adventure(page)
            page.goto(f"http://127.0.0.1:{server.server_port}/?test=1")
            page.wait_for_function("!!window.BondApp")
            model = project.manifest()
            observed = project.observe(ROOT, model)
            active = [n for n, _ in observed["entry"].scripts]
            globals_ = [s for n in active for s in observed["exports"][n] if s != "BondReference"]
            check("Every active runtime export exists after ordered boot",
                  page.evaluate("xs=>xs.every(x=>typeof globalThis[x]!=='undefined')", globals_))
            check("QA profile and loadout use sandbox keys",
                  page.evaluate("BondProfile.TEST && BondProfile.KEY.endsWith('-sandbox') && BondProfile.BUILD_KEY.endsWith('-sandbox')"))
            check("Legacy capture code is unloaded or no-op",
                  page.evaluate("typeof BondWild==='undefined' && typeof BondExpeditionData==='undefined' && Bonding.shouldPause()===false"))
            check("Content, atlas and presentation contracts validate",
                  page.evaluate("!BondRoster.validate().length && !BondAtlas.validate().length && !BondPresentation.validate().length"))
            # A Worker has no document/window/localStorage. Disable ambient IO,
            # clock and unseeded RNG before loading any game module.
            pure = ["content.js", "rules.js", "roster.js", "monster-sprites.js", "opening-rules.js", "adventure-rules.js",
                    "progression.js", "formation.js", "raid-rules.js", "game.js", "growth.js"]
            source = """
                self.fetch=()=>{throw Error('Unexpected network');};
                self.XMLHttpRequest=class{constructor(){throw Error('Unexpected XHR');}};
                self.WebSocket=class{constructor(){throw Error('Unexpected socket');}};
                Math.random=()=>{throw Error('Unseeded randomness');};
                Date.now=()=>{throw Error('Wall clock');};
            """ + "\n".join((ROOT / n).read_text(encoding="utf-8") for n in pure) + """
                const snap=b=>({time:b.time,tick:b.tick,winner:b.winner,
                    hp:b.units.map(u=>u.hp),events:b.events});
                const a=new BondGame.Battle(BondGame.defaultBuild(),{seed:701}).run();
                const b=new BondGame.Battle(BondGame.defaultBuild(),{seed:701}).run();
                postMessage({noDOM:typeof document==='undefined'&&typeof localStorage==='undefined',
                    same:JSON.stringify(snap(a))===JSON.stringify(snap(b)),
                    finished:a.ended&&a.time<=75.1,dt:BondGame.DT,
                    snapshot:snap(a)});
            """
            worker = page.evaluate("""source=>new Promise((resolve,reject)=>{
                const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
                const worker=new Worker(url);
                const timeout=setTimeout(()=>{close();reject(Error('Headless simulation exceeded 20s'));},20000);
                const close=()=>{clearTimeout(timeout);worker.terminate();URL.revokeObjectURL(url);};
                worker.onmessage=e=>{close();resolve(e.data);};
                worker.onerror=e=>{close();reject(Error(e.message));};
            })""", source)
            check("Simulation runs with no DOM/storage/network or wall-clock RNG", worker["noDOM"])
            check("Headless simulation is deterministic and bounded at 20Hz",
                  worker["same"] and worker["finished"] and worker["dt"] == 0.05)
            browser_result = page.evaluate("""()=>{const b=new BondGame.Battle(BondGame.defaultBuild(),{seed:701}).run();
                return {time:b.time,tick:b.tick,winner:b.winner,hp:b.units.map(u=>u.hp),events:b.events};}""")
            check("Worker and browser produce identical simulation events/outcome", browser_result == worker["snapshot"])
            page.evaluate("""()=>{
                for(const type of ['emberfox','stonehorn']){
                    const echo=BondProfile.testing.grantEcho(type,1);
                    const result=BondProfile.summon(type,'druid',echo);
                    BondApp.changeUnit(0,type==='emberfox'?1:2,result.instanceId);
                }
                BondApp.prepareBattle(); BondApp.switchTab('battle');
            }""")
            page.wait_for_function("CharacterRig.inspect().filter(x=>['druid','emberfox','stonehorn'].includes(x.type)).every(x=>x.ready)")
            for width, reduced in ((1440, "no-preference"), (390, "reduce")):
                page.set_viewport_size({"width": width, "height": 1000})
                page.emulate_media(reduced_motion=reduced)
                result = page.evaluate("""()=>{
                    const b=BondApp.getBattle();
                    for(let i=0;i<100&&!b.ended;i++)b.step();
                    const before=JSON.stringify({units:b.units,events:b.events,time:b.time,tick:b.tick});
                    BondApp.renderBattle();
                    for(let i=0;i<60;i++)CombatView.draw(i*16.67,.5);
                    return {same:before===JSON.stringify({units:b.units,events:b.events,time:b.time,tick:b.tick}),
                        rigs:CombatView.inspect().rigs,errors:CharacterRig.inspect().filter(s=>s.error)};
                }""")
                check(f"{width}px/{reduced}: presentation never changes simulation",
                      result["same"] and result["rigs"] == 6 and not result["errors"])
            page.screenshot(path=str(ARTIFACTS / f"architecture-{args.browser}.png"), full_page=True)
            for _ in range(3):
                page.evaluate("BondApp.switchTab('region');BondApp.switchTab('loadout');BondApp.switchTab('battle')")
            check("Screen lifecycle keeps unique DOM IDs",
                  page.evaluate("(()=>{const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);return ids.length===new Set(ids).size;})()"))
            check("No normal profile key was created in isolated tests",
                  page.evaluate("!localStorage.getItem('bond-bolt-profile-v7')&&!localStorage.getItem('bond-bolt-build-v4')"))
            browser.close()
    except Exception:
        errors.append(traceback.format_exc())
    finally:
        server.shutdown()
        server.server_close()
    check("No JavaScript/test errors", not errors)
    check("No missing runtime assets", not missing)
    check("Runtime source unchanged during boundary tests",
          hashes == {n: hashlib.sha256((ROOT / n).read_bytes()).hexdigest() for n in inputs})
    report = {"checks": checks, "errors": errors, "missing": missing, "source_sha256": hashes}
    (ARTIFACTS / f"architecture-{args.browser}.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"passed": sum(c["pass"] for c in checks), "total": len(checks),
                      "failures": [c for c in checks if not c["pass"]], "errors": errors}, indent=2))
    return 0 if checks and all(c["pass"] for c in checks) else 1


if __name__ == "__main__":
    raise SystemExit(main())
