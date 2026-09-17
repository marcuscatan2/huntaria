"""Supplied-art regression checks. Only disposable QA contexts; never normal saves."""
import argparse
import functools
import hashlib
from http.server import ThreadingHTTPServer
import json
import sys
import threading
import traceback

from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, legacy_adventure, sync_playwright
sys.path.insert(0, str(ROOT / "scripts"))
import monster_sprites
import project


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser", default="chrome")
    args = parser.parse_args()
    assert monster_sprites.build() == (ROOT / "monster-sprites.js").read_text(encoding="utf-8")
    roster = json.loads((ROOT / "data/monster-roster.json").read_text(encoding="utf-8"))
    rows = roster["rows"]
    before = {n: hashlib.sha256((ROOT / n).read_bytes()).hexdigest() for n in project.runtime_files(ROOT)}
    server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietServer, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    checks, errors, missing = [], [], []
    def check(name, value):
        checks.append(dict(name=name, pass_=bool(value)))
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
            page = browser.new_page(viewport=dict(width=1440, height=1000))
            legacy_adventure(page)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("response", lambda r: missing.append(r.url) if r.status >= 400 else None)
            page.goto(f"http://127.0.0.1:{server.server_port}/?test=1")
            page.wait_for_function("!!window.BondApp")
            mapping = page.evaluate("BondMonsterSprites.manifest()")
            check("Reviewed Sheet source and revision are explicit", roster["source"]["authority"] == "Google Sheets" and roster["source"]["sheet"] == "Roster" and roster["source"]["snapshotRange"] == "A1:S101" and roster["source"]["snapshotRows"] == 100 and bool(roster["source"]["reviewedRevision"]))
            check("100 Sheet names and stable IDs match runtime", [(r[17], r[1]) for r in rows] == [(r["id"], r["name"]) for r in mapping])
            baseline = "\n".join((ROOT / n).read_text(encoding="utf-8") for n in ["content.js", "rules.js", "roster.js"])
            overlay = (ROOT / 'monster-sprites.js').read_text(encoding='utf-8')
            check("Overlay changes only reviewed Sheet creature fields", page.evaluate("""({source,overlay})=>{
                const context={};
                new Function('globalThis',source)(context);
                const original=JSON.parse(JSON.stringify(context.BondContent));
                new Function('globalThis','BondContent',overlay)(context,context.BondContent);
                return context.BondContent.MONSTERS.every(id=>{
                    const a=original.UNITS[id],b=context.BondContent.UNITS[id];
                    const reviewed=['name','subtitle','element','region','source','rarity','basicCategory'];
                    return Object.keys(a).filter(k=>!reviewed.includes(k)).every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]))&&b.designRole&&b.combatIdentity&&b.attackBase&&b.encounterSource&&('sourceWildLevel' in b);
                });
            }""", dict(source=baseline,overlay=overlay)))
            state = page.evaluate("""()=>{
                const P=BondProfile;
                const a=P.summon('emberfox','druid',P.testing.grantEcho('emberfox',1));
                const old=P.snapshot();old.companions.push({...structuredClone(old.companions[0]),id:'legacy:second',ordinal:2});P.testing.replace(old);
                P.testing.setXP(a.instanceId,1250);
                return P.snapshot();
            }""")
            page.reload()
            page.wait_for_function("!!window.BondApp")
            after = page.evaluate("BondProfile.snapshot()")
            check("Two legacy same-species individuals stay independent", len(after['companions'])==2 and after['companions'][0]['id']!=after['companions'][1]['id'] and after['companions'][0]['xp']!=after['companions'][1]['xp'])
            check("Owned copies and XP survive reload with stable IDs", state["companions"] == after["companions"])
            page.evaluate("BondApp.switchTab('loadout')")
            page.locator('[data-frame-menu="collection"]').click();page.locator('[data-sea-tab="party"]').click();page.locator('[data-collection-mode="catalog"]').click()
            page.evaluate("Promise.all([...document.querySelectorAll('#loadout img[src]')].map(i=>i.decode().catch(()=>{})))")
            check("Loadout uses supplied images", page.locator('img.supplied-monster').count() > 0)
            page.screenshot(path=str(ARTIFACTS / "monster-sprites-loadout.png"), full_page=True)
            page.evaluate("""()=>{
                const ids=BondProfile.snapshot().companions.map(m=>m.id);
                BondApp.changeUnit(0,1,ids[0]);BondApp.changeUnit(0,2,ids[1]);
                BondApp.prepareBattle();BondApp.switchTab('battle');
                const b=BondApp.getBattle();for(let i=0;i<100&&!b.ended;i++)b.step();
                BondApp.renderBattle();CombatView.draw(1000,.5);
            }""")
            check("Combat uses supplied monster art without obsolete monster sheets", page.evaluate("""()=>{
                return document.querySelectorAll('.fighter img.supplied-monster').length>=2 &&
                    CharacterRig.inspect().every(x=>['druid','mage','apprentice-dagger','apprentice-bow'].includes(x.type));
            }"""))
            page.evaluate("Promise.all([...document.querySelectorAll('img.supplied-monster[src]')].map(i=>i.decode()))")
            page.screenshot(path=str(ARTIFACTS / "monster-sprites-combat.png"), full_page=True)
            page.evaluate("BondApp.switchTab('region')")
            page.evaluate("Promise.all([...document.querySelectorAll('img.supplied-monster[src]')].map(i=>i.decode()))")
            page.screenshot(path=str(ARTIFACTS / "monster-sprites-world.png"), full_page=True)
            decoded = page.evaluate("""async()=>{
                const out=[];
                for(const entry of BondMonsterSprites.manifest()){
                    const holder=document.createElement('div');holder.innerHTML=CharacterRig.art(entry.id);
                    const rig=CharacterRig.mount(holder,entry.id),img=rig.sprite;
                    await img.decode();
                    const src=img.getAttribute('src'),poses=[];
                    for(const mode of ['idle','walk','attack','cast','hit','defeated','victory']){
                        rig.action=null;
                        if(['attack','cast','hit'].includes(mode))CharacterRig.trigger(rig,mode,0,.6);
                        CharacterRig.pose(rig,{time:.15,walking:mode==='walk',fallen:mode==='defeated'?1:0,victory:mode==='victory',reduced:false});
                        poses.push(rig.mode===mode&&img.getAttribute('src')===src&&!rig.vector&&!rig.canvas);
                    }
                    rig.action=null;CharacterRig.pose(rig,{time:1,walking:true,reduced:true});
                    const reduced=img.style.transform==='translateY(0px) rotate(0deg) scale(1, 1)';
                    out.push({id:entry.id,decoded:img.naturalWidth>0,poses:poses.every(Boolean),
                        reduced:reduced||img.style.transform==='translateY(0px) rotate(0deg) scale(1)',
                        native:img.style.getPropertyValue('--sprite-native')});
                }
                return out;
            }""")
            for item in decoded:
                check(item["id"] + ": original PNG decodes and remains visible across all poses", item["decoded"] and item["poses"])
                check(item["id"] + ": explicit right-facing art baseline", item["native"] == "1")
                check(item["id"] + ": reduced motion has no bounce or tilt", item['reduced'])
            check('World and combat flip the same raster independently of pose', page.evaluate("""()=>{
                return ['world-node','fighter'].every(className=>{
                    const h=document.createElement('div');h.className=className;
                    h.innerHTML='<div class="fighter-art">'+CharacterRig.art('emberfox')+'</div>';document.body.append(h);
                    const rig=CharacterRig.mount(h,'emberfox');CharacterRig.pose(rig,{time:.15,walking:true});
                    const a=getComputedStyle(rig.sprite).scale,pose=rig.sprite.style.transform;
                    h.classList.add('facing-left');const b=getComputedStyle(rig.sprite).scale;
                    const result=parseFloat(a)>0&&parseFloat(b)<0&&pose===rig.sprite.style.transform;h.remove();return result;
                });
            }"""))
            check('Missing artwork fallback and retry preserve the mapped sprite', page.evaluate("""async()=>{
                const h=document.createElement('div');h.innerHTML=CharacterRig.art('emberfox');document.body.append(h);
                const img=h.firstElementChild;await img.decode();const url=img.src;
                img.dispatchEvent(new Event('error'));const fallback=!!img.dataset.artFallback&&img.src.startsWith('data:');
                CharacterRig.retry();await img.decode();const restored=img.src===url&&!img.dataset.artFallback;h.remove();return fallback&&restored;
            }"""))
            check("Raster coverage is reported honestly, not painted animation", page.evaluate("BondAnimationCoverage.manifest().filter(x=>x.mode==='supplied-raster').length===100"))
            check("Only playable trainers request pose sheets", page.evaluate("CharacterRig.inspect().every(x=>['druid','mage','apprentice-dagger','apprentice-bow'].includes(x.type))"))
            # Render all originals on a neutral review sheet, no source image edits.
            page.evaluate("""()=>{
                document.body.innerHTML='<main id="sprite-review"></main>';
                const style=document.createElement('style');style.textContent=
                    'body{margin:0;background:#183c35;color:#fff;font:16px sans-serif}#sprite-review{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:12px}.sample{background:#e1dccb;color:#183c35;text-align:center;border-radius:12px;height:205px}.sample img{display:block;width:175px;height:175px;object-fit:contain;margin:auto}';
                document.head.append(style);
            }""")
            for start in range(0, 100, 20):
                page.evaluate("""start=>{
                    document.querySelector('#sprite-review').innerHTML=BondMonsterSprites.manifest().slice(start,start+20).map(x=>
                        '<div class="sample">'+CharacterRig.art(x.id)+'<b>'+x.number+' · '+x.name+'</b></div>').join('');
                }""", start)
                page.evaluate("Promise.all([...document.images].map(i=>i.decode()))")
                page.screenshot(path=str(ARTIFACTS / f"monster-sprites-roster-{start+1:03d}.png"))
            check("No normal save created", page.evaluate("!localStorage.getItem('bond-bolt-profile-v7')"))
            browser.close()
    except Exception:
        errors.append(traceback.format_exc())
    finally:
        server.shutdown()
        server.server_close()
    check("No JS/test errors", not errors)
    check("No missing runtime assets", not missing)
    check("Runtime unchanged during test", all(hashlib.sha256((ROOT/n).read_bytes()).hexdigest()==v for n,v in before.items()))
    normalized = [{"name":c["name"],"pass":c["pass_"]} for c in checks]
    report = dict(checks=normalized, errors=errors, missing=missing, source_sha256=before)
    (ARTIFACTS / f"monster-sprites-{args.browser}.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(dict(passed=sum(c["pass"] for c in normalized),total=len(normalized),failures=[c for c in normalized if not c["pass"]],errors=errors),indent=2))
    return 0 if normalized and all(c["pass"] for c in normalized) else 1


if __name__ == "__main__":
    raise SystemExit(main())
