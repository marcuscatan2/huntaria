"""Trainer pose-sheet, painted creator, alpha and weapon-variant browser checks."""
from __future__ import annotations

import argparse
import functools
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer
import hashlib
import json
import threading
import traceback

from PIL import Image

from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright
import sys
sys.path.insert(0, str(ROOT / "scripts"))
import project


def review_scenes(browser, url, check, errors, missing, browser_name):
    for trainer in ("hunter", "swordsman"):
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("response", lambda response: missing.append(response.url) if response.status >= 400 else None)
        now = datetime.now(timezone.utc)
        page.clock.install(time=now)
        page.clock.pause_at(now + timedelta(seconds=2))
        page.goto(url)
        page.wait_for_function("!!window.BondApp")
        page.evaluate("""type=>{
            const P=BondProfile,s=P.fresh();
            s.character={name:'Sprite QA',weapon:'dagger',look:BondOpening.defaultLook};
            s.trainerXP=BondProgress.threshold(25);s.progression.specialization=type;
            s.companions=['emberfox','bloomslime'].map((type,i)=>({id:'sprite:'+i,type,ordinal:1,xp:BondProgress.threshold(25),growth:{},skills:[...BondContent.UNITS[type].default],pact:{map:'clearing-0',trainerClass:'apprentice'}}));
            Object.assign(s.journey.early,{introFightWon:true,firstSummon:true,secondSummon:true,mageMet:true,mageGate:true,tidecrown:true,demonstrations:Object.values(BondCampaign.DEMONSTRATIONS)});
            P.testing.replace(s);P.travel('clearing-hub');
        }""", trainer)
        page.reload()
        page.wait_for_function("!!window.BondApp")
        page.evaluate("BondApp.changeUnit(0,1,'sprite:0');BondApp.changeUnit(0,2,'sprite:1')")
        page.evaluate("CharacterRig.ready()")
        page.clock.run_for(200)
        visible = "selector=>[...document.querySelectorAll(selector+' .character-sprite')].filter(n=>getComputedStyle(n).display!=='none').map(n=>({tag:n.tagName,frame:n.dataset.frame,pose:n.dataset.pose}))"
        world = page.evaluate(visible, "#region-player")
        check(f"{trainer} world idle shows exactly one canvas", len(world) == 1 and world[0]["tag"] == "CANVAS" and world[0]["frame"] == "13")
        before = page.evaluate("BondRegion.inspect().position")
        frames = []
        page.keyboard.down("d")
        for _ in range(4):
            page.clock.run_for(160)
            frames.append(page.locator("#region-player canvas.animated-sprite").get_attribute("data-frame"))
        page.keyboard.up("d")
        if trainer=='swordsman':
            check('Knight uses the dedicated walking source',page.evaluate("CharacterRig.inspect().some(s=>s.type==='swordsman-walk'&&s.ready)"))
        check(f"{trainer} keyboard movement advances visible walk frames", len(set(frames)) >= 3 and page.evaluate("BondRegion.inspect().position") != before and len(page.evaluate(visible, "#region-player")) == 1)
        page.locator("#region-map").screenshot(path=str(ARTIFACTS / f"{trainer}-world-{browser_name}.png"))
        started = page.evaluate("type=>{const e=BondProfile.encounter('early:master:'+type);BondProfile.travel(e.map,e);return {ok:BondApp.startRegionBattle(e.id),requirement:BondCampaign.requirement(e,BondProfile.snapshot(),BondApp.getBuild()[0]),error:BondProfile.error()};}", trainer)
        check(f"{trainer} real player and master battle starts", started["ok"])
        if not started["ok"]: print(started, flush=True)
        page.evaluate("CharacterRig.ready()")
        page.clock.run_for(250)
        for side in (0, 1):
            actor = page.evaluate(visible, f'.fighter[data-id="{side}-0"] .fighter-art')
            check(f"{trainer} combat side {side} shows one animated actor", len(actor) == 1 and actor[0]["tag"] == "CANVAS")
        check(f"{trainer} battle portraits keep a clipped viewport", page.evaluate("""()=>{
            const portraits=[...document.querySelectorAll('#arena [data-painted-portrait],#combat-dock [data-painted-portrait]')];
            return portraits.length>=4&&portraits.every(n=>getComputedStyle(n).overflow==='hidden');
        }"""))
        page.locator("#arena").screenshot(path=str(ARTIFACTS / f"{trainer}-combat-{browser_name}.png"))
        page.evaluate("BondApp.cancelRegionBattle();BondApp.switchTab('region')")
        page.clock.run_for(200)
        check(f"{trainer} world return keeps one actor", len(page.evaluate(visible, "#region-player")) == 1)
        # A pending or failed animation sheet must also keep the static fallback cropped.
        fallback = page.evaluate("""type=>{
            const host=document.createElement('div');host.className='fighter-art';host.innerHTML=CharacterRig.art(type);document.body.append(host);
            const rig=CharacterRig.mount(host,type,{lazy:true});CharacterRig.pose(rig,{time:0,walking:false,reduced:false});
            const pending=getComputedStyle(rig.original).display!=='none'&&getComputedStyle(rig.original).overflow==='hidden'&&getComputedStyle(rig.canvas).display==='none';
            rig.sheet={ready:false,error:true};CharacterRig.pose(rig,{time:1,walking:true,reduced:false});
            const failed=getComputedStyle(rig.original).display!=='none'&&getComputedStyle(rig.original).overflow==='hidden'&&getComputedStyle(rig.canvas).display==='none';
            host.remove();return pending&&failed;
        }""", trainer)
        check(f"{trainer} pending and failed animation retains one clipped fallback", fallback)
        page.close()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser", default="chrome")
    args = parser.parse_args()
    checks, errors, missing = [], [], []

    def check(name, value):
        checks.append({"name": name, "pass": bool(value)})

    mage = Image.open(ROOT / "assets" / "art-v21" / "mage-sheet.png")
    check("Mage source atlas has genuine transparent alpha", mage.mode == "RGBA" and mage.getchannel("A").getextrema() == (0, 255))
    for weapon in ("dagger", "bow"):
        image = Image.open(ROOT / "assets" / "art-v21" / f"apprentice-{weapon}-sheet.png")
        check(f"Apprentice {weapon} atlas is the expected 4x4 source canvas", image.size == (1301, 1209))
    prompts = json.loads((ROOT / "assets" / "art-v21" / "prompts.json").read_text(encoding="utf-8"))
    check("Selected trainer assets retain generator provenance", {a["key"] for a in prompts["assets"]} == {"mage", "apprentice-dagger", "apprentice-bow"})
    creator_prompts = json.loads((ROOT / "assets" / "art-v22" / "prompts.json").read_text(encoding="utf-8"))
    check("Painted creator assets retain grid and generator provenance", creator_prompts["grid"] == {"columns": ["calm", "bright", "focused"], "rows": ["crop", "sweep", "braid"]} and {a["key"] for a in creator_prompts["assets"]} == {"apprentice-dagger-creation", "apprentice-bow-creation"})
    dagger_creator = Image.open(ROOT / "assets" / "art-v22" / "apprentice-dagger-creation.png")
    bow_creator = Image.open(ROOT / "assets" / "art-v22" / "apprentice-bow-creation.png")
    check("Creation atlases share the exact 3x3 source canvas", dagger_creator.size == bow_creator.size == (1301, 1209))
    check("Dagger creator source preserves native transparent alpha", dagger_creator.mode == "RGBA" and dagger_creator.getchannel("A").getextrema() == (0, 255))

    humans = json.loads((ROOT / "assets/characters/prompts.json").read_text(encoding="utf-8"))
    check("Human sprites retain built-in generation prompts and selected hashes", humans["generator"] == "built-in image_gen.imagegen" and len(humans["assets"]) == 6 and all(a["prompt"] and a["transparency_prompt"] and hashlib.sha256((ROOT / a["path"]).read_bytes()).hexdigest() == a["sha256"] for a in humans["assets"]))
    for asset in humans["assets"]:
        source_image = Image.open(ROOT / asset["path"])
        check(f"{asset['key']} source has native transparent alpha", source_image.mode == "RGBA" and source_image.getchannel("A").getextrema() == (0, 255))

    walk=json.loads((ROOT/'assets/characters/swordsman-walk-prompts.json').read_text(encoding='utf-8'))
    check('Knight walk has reproducible built-in generation provenance',walk['frame_grid']==[2,2] and hashlib.sha256((ROOT/walk['output']).read_bytes()).hexdigest()==walk['output_sha256'])
    before = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in project.runtime_files(ROOT)}
    server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietServer, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=find_browser(args.browser), headless=True)
            review_scenes(browser, f"http://127.0.0.1:{server.server_port}/?test=1", check, errors, missing, args.browser)
            page = browser.new_page(viewport={"width": 1440, "height": 1000})
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("response", lambda response: missing.append(response.url) if response.status >= 400 else None)
            page.goto(f"http://127.0.0.1:{server.server_port}/?test=1")
            page.wait_for_function("!!window.CharacterRig && !!window.BondAnimationData")
            rendered = page.evaluate("""async()=>{
                document.body.innerHTML='<main id="trainer-review"></main>';
                const style=document.createElement('style');style.textContent='body{margin:0;background:#d7cfb8}#trainer-review{display:grid;grid-template-columns:repeat(8,150px);gap:10px;padding:20px}.sample{height:180px;background:linear-gradient(#b7d8c8,#748f67);border-radius:12px;display:grid;place-items:end center;color:#173b34;font:12px sans-serif}.sample canvas{width:140px;height:140px}.sample b{margin:4px}';document.head.append(style);
                const definitions=[['hunter',null],['swordsman',null],['druid',null],['mage',null],['apprentice','dagger'],['apprentice','bow']],out=[];
                for(const [type,weapon] of definitions){
                    const host=document.createElement('div');
                    host.innerHTML=type==='apprentice'?BondApprenticePreview.markup(BondOpening.defaultLook,weapon):CharacterRig.art(type);
                    document.body.append(host);const rig=CharacterRig.mount(host,type);await CharacterRig.ready();
                    const portrait=type==='hunter'||type==='swordsman'?await CharacterRig.portraitSource(type):null;const portraitOK=!portrait||portrait.getContext('2d').getImageData(0,0,1,1).data[3]===0;const samples={},record=(mode,time,state={})=>{rig.action=null;if(['attack','cast','hit'].includes(mode))CharacterRig.trigger(rig,mode,0,.7);CharacterRig.pose(rig,{time,walking:mode==='walk',fallen:mode==='defeated'?1:0,victory:mode==='victory',reduced:false,...state});const url=rig.canvas.toDataURL();samples[mode]=samples[mode]||[];samples[mode].push(url);const card=document.createElement('div');card.className='sample';const copy=document.createElement('canvas');copy.width=copy.height=320;copy.getContext('2d').drawImage(rig.canvas,0,0);card.append(copy);card.insertAdjacentHTML('beforeend','<b>'+rig.configKey+' · '+mode+'</b>');document.querySelector('#trainer-review').append(card);};
                    for(const time of [0,.16,.30,.46])record('walk',time);
                    for(const time of [.05,.15,.3,.5])record('attack',time);
                    for(const time of [.05,.15,.3,.5])record('cast',time);
                    for(const mode of ['hit','idle','defeated','victory'])record(mode,mode==='hit'?.05:1);
                    const corner=rig.ctx.getImageData(0,0,1,1).data[3];
                    out.push({key:rig.configKey,corner,portraitOK,walk:new Set(samples.walk).size,attack:new Set(samples.attack).size,cast:new Set(samples.cast).size,originalHidden:getComputedStyle(rig.original).display==='none',canvasVisible:!rig.canvas.hidden});host.remove();
                }
                const creator=document.createElement('div');document.body.append(creator);const previews=[];
                for(const choice of [{hair:'crop',face:'calm',hairColor:0,skinColor:0,weapon:'dagger'},{hair:'sweep',face:'bright',hairColor:3,skinColor:2,weapon:'dagger'},{hair:'braid',face:'focused',hairColor:5,skinColor:5,weapon:'bow'}]){
                    await BondApprenticePreview.render(creator,choice,choice.weapon);previews.push(creator.querySelector('canvas').toDataURL());
                }
                const previewCorner=creator.querySelector('canvas').getContext('2d').getImageData(0,0,1,1).data[3];
                const runtime=document.createElement('div');runtime.innerHTML=BondApprenticePreview.markup(BondOpening.defaultLook,'dagger');document.body.append(runtime);const runtimeRig=CharacterRig.mount(runtime,'apprentice');const creatorHiddenImmediately=runtimeRig.original.hidden&&!runtimeRig.canvas.hidden;await CharacterRig.ready();CharacterRig.pose(runtimeRig,{time:0,walking:false,reduced:false});const idleFrame=runtimeRig.canvas.dataset.frame;const idleVisible=[...runtime.querySelectorAll('.character-sprite')].filter(n=>getComputedStyle(n).display!=='none').length;CharacterRig.pose(runtimeRig,{time:.3,walking:true,reduced:false});const actionVisible=[...runtime.querySelectorAll('.character-sprite')].filter(n=>getComputedStyle(n).display!=='none').length;
                return {out,previews,previewCorner,creatorState:creator.dataset.previewState,creatorInspect:BondApprenticePreview.inspect(),runtime:{svg:runtime.querySelectorAll('svg').length,creatorHiddenImmediately,idleFrame,idleVisible,actionVisible,staticHidden:runtimeRig.original.hidden,actionShown:!runtimeRig.canvas.hidden},coverage:BondAnimationCoverage.manifest().filter(x=>['apprentice','druid','mage','hunter','swordsman'].includes(x.type)),inspect:CharacterRig.inspect()};
            }""")
            by_key = {row["key"]: row for row in rendered["out"]}
            for key in ("hunter", "swordsman", "druid", "mage", "apprentice-dagger", "apprentice-bow"):
                row = by_key[key]
                check(f"{key} draws transparent, visible four-frame motion", row["portraitOK"] and row["corner"] == 0 and row["walk"] >= 3 and row["attack"] == 4 and row["cast"] == 4 and row["originalHidden"] and row["canvasVisible"])
            inspect = {row["type"]: row for row in rendered["inspect"]}
            check("Both Apprentice source backdrops are isolated at runtime", inspect["apprentice-dagger"]["removed"] > .45 and inspect["apprentice-bow"]["removed"] > .45)
            creator_inspect = {row["weapon"]: row for row in rendered["creatorInspect"]}
            check("Creator renders distinct transparent painted choices", rendered["creatorState"] == "ready" and rendered["previewCorner"] == 0 and len(set(rendered["previews"])) == len(rendered["previews"]))
            check("Creator keeps native dagger alpha and safely removes bow checker", creator_inspect["dagger"]["nativeAlpha"] and creator_inspect["bow"]["removed"] > .45 and not creator_inspect["bow"]["error"])
            check("Animated scenes never expose the alternate creator figure", rendered["runtime"] == {"svg": 0, "creatorHiddenImmediately": True, "idleFrame": "13", "idleVisible": 1, "actionVisible": 1, "staticHidden": True, "actionShown": True})
            coverage = {row["type"]: row["mode"] for row in rendered["coverage"]}
            check("Coverage reports all playable trainer pose tiers honestly", coverage == {"apprentice": "painted-16-pose-painted-creator", "druid": "painted-16-pose", "mage": "painted-16-pose", "hunter": "painted-16-pose", "swordsman": "painted-16-pose"})
            page.screenshot(path=str(ARTIFACTS / f"trainer-animation-{args.browser}.png"), full_page=True)
            browser.close()
    except Exception:
        errors.append(traceback.format_exc())
    finally:
        server.shutdown()
        server.server_close()
    check("No JavaScript or browser errors", not errors)
    check("No missing runtime assets", not missing)
    check("Browser review did not mutate runtime sources", all(hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == digest for name, digest in before.items()))
    report = {"checks": checks, "errors": errors, "missing": missing}
    (ARTIFACTS / f"trainer-animation-{args.browser}.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"passed": sum(c["pass"] for c in checks), "total": len(checks), "failures": [c for c in checks if not c["pass"]], "errors": errors}, indent=2))
    return 0 if checks and all(c["pass"] for c in checks) else 1


if __name__ == "__main__":
    raise SystemExit(main())
