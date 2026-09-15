"""Pass18 checks in disposable browser contexts, never the normal user's save."""
import argparse,functools,json,threading,hashlib,traceback
from datetime import datetime,timedelta,timezone
from http.server import ThreadingHTTPServer
from browser_check import legacy_adventure, ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome');parser.add_argument('--smoke',action='store_true');args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
hashes=lambda:{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
source=hashes();checks=[];errors=[];missing=[];metrics=[]
def check(name,value,detail=None):checks.append({'name':name,'pass':bool(value),'detail':detail})
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1000});page=context.new_page()
    page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=10))
    try:
        legacy_adventure(page)
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1');page.wait_for_function('!!window.BondApp',timeout=30000)
        page.locator('#open-patch-notes').click()
        check('Visible notes retain the launch cap and opening-gate disclosure',page.locator('#patch-notes').is_visible() and 'capped at Lv 60' in page.locator('#patch-notes').inner_text() and 'Forest Mage guards the road' in page.locator('#patch-notes').inner_text())
        page.locator('#close-patch-notes').click()
        metrics=page.evaluate("""()=>{const out=[];for(const trainer of ['druid','mage'])for(const type of ['emberfox','stonehorn','bloomslime','tideotter']){const h=BondAtlas.home(type),hp=[];let wins=0,times=[];for(let seed=1;seed<=30;seed++){const b=new BondGame.Battle(BondGame.soloBuild(trainer),{adventure:true,profile:BondProfile.fresh(),seed,encounter:{kind:'wild',enemies:[{type,level:h.level,skills:BondContent.UNITS[type].default,...BondAdventure.wild(type)}]}}).run();wins+=b.winner===0;hp.push(b.trainer(0).hp/b.trainer(0).maxHp);times.push(b.time);}out.push({trainer,type,level:h.level,wins,hpMin:Math.min(...hp),hpMax:Math.max(...hp),seconds:times[0]});}return out;}""")
        print(json.dumps({'balance':metrics},indent=2),flush=True)
        if not args.smoke:
            checks.extend(page.evaluate((ROOT/'tests/pass18_cases.js').read_text(encoding='utf-8')))
            page.add_script_tag(content=(ROOT/'tests/pass15-engine.js').read_text(encoding='utf-8'))
            checks.extend(page.evaluate('runPass15Engine().results'))
        page.locator('#open-atlas').click();page.screenshot(path=str(ARTIFACTS/f'pass18-atlas-{args.browser}.png'),full_page=True)
        check('Atlas has 36 clickable map places, not a list',page.locator('.atlas-place').count()==36 and page.locator('.atlas-map-link').count()==0)
        page.locator('[data-atlas-select="ashen-hub"]').click();check('The wider Atlas is unavailable until the Forest Mage trial',page.locator('.atlas-destination button').is_disabled() and 'Unavailable' in page.locator('.atlas-destination button').inner_text())
        page.locator('#close-atlas').click()
        page.evaluate("BondProfile.travel('clearing-hub',BondAdventure.service(BondAtlas.get('clearing-hub'),'shop'));BondApp.switchTab('region')")
        page.clock.run_for(300);page.locator('[data-object="clearing-hub:shop"]').click();page.clock.run_for(1000);page.locator('[data-city-supplies]').last.click()
        check('Painted city building opens an interior supply shop',page.locator('#city-dialog').is_visible() and page.locator('#recovery-dialog').is_visible() and page.locator('[data-store-buy]').count()==5)
        page.screenshot(path=str(ARTIFACTS/f'pass18-store-{args.browser}.png'),full_page=True)
        page.keyboard.press('Escape')
        manifest=page.evaluate("""()=>({version:18,species:BondRoster.manifest().map(u=>({...u,habitat:BondAtlas.home(u.id),habitats:BondAtlas.maps.flatMap(m=>m.habitats).filter(h=>h.type===u.id),openingDrops:BondAtlas.home(u.id)?.map==='clearing-0'?(BondOpening.drops[u.id]||[]):[],passiveInfo:BondContent.PASSIVES[u.passive],kit:u.skills.map(id=>({id,...BondContent.SKILLS[id]}))})),maps:BondAtlas.maps.map(({scenery,collisionBuckets,obstacles,...m})=>m),regions:BondAtlas.REGIONS,families:BondRoster.families})""")
        manifest['source_sha256']=source
        (ARTIFACTS/f'pass18-reference-{args.browser}.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
    except Exception:errors.append(traceback.format_exc())
    check('No JavaScript or test errors',not errors);check('No missing runtime assets',not missing);check('Runtime unchanged during checks',source==hashes());browser.close()
server.shutdown()
report={'browser':args.browser,'checks':checks,'errors':errors,'missing':missing,'balance':metrics,'source_sha256':source}
(ARTIFACTS/f'pass18-{args.browser}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'failures':[c for c in checks if not c['pass']],'errors':errors},indent=2),flush=True)
raise SystemExit(0 if checks and all(c['pass'] for c in checks) else 1)
