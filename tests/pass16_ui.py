"""UI reload, keyboard, practice-group and missing-art checks in test-only saves."""
import argparse,functools,json,threading,traceback,hashlib
from datetime import datetime,timedelta,timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome');args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/?test=1';checks=[];errors=[]
hashes=lambda:{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
before=hashes()
def check(name,value):
    checks.append({'name':name,'pass':bool(value)})
    if not value:print('FAIL '+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1000});page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=60))
    try:
        page.goto(url);page.wait_for_function('!!window.BondReference');page.evaluate('BondReference.setup();BondApp.switchTab("region")')
        page.locator('#open-campaign').click();check('Journal opens with 48 objectives and 18 optional challenges',page.locator('.campaign-chapter li').count()==48 and page.locator('[data-challenge]').count()==18)
        page.keyboard.press('Escape');check('Escape returns focus to Story button',page.evaluate('document.activeElement.id==="open-campaign"'))
        page.evaluate('BondProfile.travel("clearing-hub",BondAtlas.get("clearing-hub").guide);BondApp.switchTab("region")');page.clock.run_for(200);page.locator('#region-map').focus();page.keyboard.press('e')
        check('E interacts with nearby Town Keeper and records first story step',page.locator('#exploration-dialog').is_visible() and page.evaluate('BondProfile.snapshot().journey.steps.includes("ch1:keeper")'))
        page.keyboard.press('Escape');page.evaluate('BondRegion.approachId("story:clearing:0")');page.clock.run_for(8000)
        check('New trainer is approached physically and opens legal team dialogue',page.locator('#npc-dialog').is_visible() and page.locator('#npc-title').inner_text()=='Tavi' and page.locator('#npc-team>div').count()==3)
        page.locator('#npc-fight').click();page.clock.run_for(2300);page.locator('#pause').click();page.evaluate('BondApp.switchTab("region")')
        saved=page.evaluate('({tick:BondProfile.snapshot().encounterSave.tick,units:BondApp.getBattle().units})')
        page.reload();page.wait_for_function('!!window.BondApp');page.locator('#open-campaign').click();check('Full reload exposes saved trainer encounter',page.locator('#campaign-resume').is_visible())
        page.locator('#campaign-resume').click();page.locator('#pause').click()
        check('Resume restores exact saved fight and original party',page.evaluate('BondApp.getBattle().tick')==saved['tick'] and page.evaluate('BondApp.getBattle().units')==saved['units'])
        page.evaluate('BondApp.switchTab("region")');page.locator('#open-campaign').click();page.once('dialog',lambda d:d.accept());page.locator('#campaign-abandon').click();page.locator('#campaign-close').click();check('Abandon releases reservation',page.evaluate('!BondProfile.snapshot().encounterSave'))
        # Reward-free group previews use simulated allies, never online participants.
        page.evaluate('BondReference.setup();BondProfile.testing.setXP(BondProfile.companions()[0].id,495000);BondProfile.testing.setXP(BondProfile.companions()[1].id,495000);BondApp.switchTab("region")')
        practice=[]
        for defn in page.evaluate('Object.values(BondCampaign.bosses).map(b=>({type:b.type,region:b.region}))'):
            page.evaluate('r=>{BondApp.cancelRegionBattle();BondProfile.travel(r.region+"-2");BondApp.switchTab("region");BondApp.startRegionBattle("practice:"+r.type,{bossLevel:1,practiceParties:3});}',defn)
            check(defn['type']+' three-party practice mounts 13 actors',page.evaluate('BondApp.getBattle().group&&BondApp.getBattle().units.length===13&&document.querySelectorAll(".fighter").length===13'))
            if defn['type']=='elderroot':page.clock.run_for(2000);page.screenshot(path=str(ARTIFACTS/'pass16-group-practice.png'),full_page=True)
            wealth=page.evaluate('({coins:BondProfile.snapshot().coins,echoes:BondProfile.snapshot().echoes,companions:BondProfile.snapshot().companions})')
            page.evaluate('BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()');page.clock.run_for(50)
            check(defn['type']+' practice victory gives no wealth',page.evaluate('({coins:BondProfile.snapshot().coins,echoes:BondProfile.snapshot().echoes,companions:BondProfile.snapshot().companions})')==wealth)
            if page.locator('#loot-popup').is_visible():page.locator('#loot-continue').click()
        # Phone-width reachable journal controls, not physical-phone certification.
        page.set_viewport_size({'width':390,'height':844});page.evaluate('BondApp.cancelRegionBattle();BondApp.switchTab("region")');page.locator('#open-campaign').click()
        check('390px journal has no page overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2&&document.querySelector("#campaign-dialog").getBoundingClientRect().width<=innerWidth'))
        page.screenshot(path=str(ARTIFACTS/'pass16-journal-mobile.png'),full_page=True);page.keyboard.press('Escape')
        # Deliberately fail the Druid portrait and pose sheet, then retry without resetting.
        fallback=browser.new_page(viewport={'width':1000,'height':900});fallback.on('pageerror',lambda e:errors.append(str(e)))
        fallback.route('**/assets/art-v6/druid.png',lambda r:r.abort());fallback.route('**/assets/art-v10/druid-sheet.png',lambda r:r.abort());fallback.goto(url);fallback.wait_for_function('!!window.BondApp&&document.querySelector("img[data-art-fallback]")')
        check('Missing portrait has a nonblank labelled fallback',fallback.evaluate('document.querySelector("img[data-art-fallback]").src.startsWith("data:image/svg+xml")'))
        fallback.unroute('**/assets/art-v6/druid.png');fallback.unroute('**/assets/art-v10/druid-sheet.png');fallback.locator('#world-retry-art').click();fallback.wait_for_function('!document.querySelector("img[data-art-fallback]")');check('Retry artwork restores without changing save',fallback.evaluate('BondProfile.snapshot().companions.length===0'));fallback.close()
    except Exception:errors.append(traceback.format_exc())
    check('No unexpected JavaScript/test errors',not errors);check('Sources frozen throughout UI tests',before==hashes());browser.close()
server.shutdown();result={'checks':checks,'errors':errors,'sourceHashes':before};(ARTIFACTS/('pass16-ui-'+args.browser+'.json')).write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'failures':[c for c in checks if not c['pass']],'errors':errors},indent=2),flush=True)
raise SystemExit(0 if all(c['pass'] for c in checks) else 1)
