"""Pass 11 file-mode, denied storage, touch and independent reward checks."""
import argparse
from datetime import datetime, timedelta, timezone
import functools
from http.server import ThreadingHTTPServer
import json
import threading
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--browser',default='chrome')
args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/'
results=[]
errors=[]
external=[]
def check(name,value):
    results.append({'name':name,'pass':bool(value)})
    print(('PASS ' if value else 'FAIL ')+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    for mode in ['offline','blocked','touch']:
        context=browser.new_context(viewport={'width':390 if mode=='touch' else 1280,'height':900},is_mobile=mode=='touch',has_touch=mode=='touch',reduced_motion='reduce')
        if mode=='blocked':
            context.add_init_script('Storage.prototype.getItem=function(){throw new Error("denied")};Storage.prototype.setItem=function(){throw new Error("denied")};')
        page=context.new_page()
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda r:external.append(r.url) if r.url.startswith('http') and not r.url.startswith('http://127.0.0.1:') else None)
        now=datetime.now(timezone.utc)
        page.clock.install(time=now)
        page.clock.pause_at(now+timedelta(seconds=60))
        page.goto(ROOT.joinpath('index.html').as_uri() if mode=='offline' else url)
        page.wait_for_function('!!window.BondApp')
        check(mode+' application starts',page.evaluate('BondProfile.snapshot().version===5'))
        if mode=='blocked':
            check('Denied storage has a visible session-only notice','Session only' in page.locator('#region-save-status').inner_text())
        click=lambda locator:locator.tap() if mode=='touch' else locator.click()
        click(page.locator('#tab-loadout'))
        click(page.locator('[data-menu="trainer"]'))
        click(page.locator('[data-stat="int"]'))
        check(mode+' stat allocation works',page.evaluate('BondProfile.snapshot().attributes.int===2'))
        click(page.locator('#tab-region'))
        click(page.locator('[data-route="cave"]'))
        check(mode+' route modal fits viewport',page.evaluate('document.documentElement.scrollWidth<=innerWidth && document.querySelector("#expedition-dialog").getBoundingClientRect().right<=innerWidth'))
        click(page.locator('[data-route-start]'))
        page.evaluate('BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()')
        check(mode+' combat has a valid result',page.evaluate('BondApp.getBattle().ended && Number.isFinite(BondApp.getBattle().time)'))
        if mode=='touch':
            page.screenshot(path=str(ARTIFACTS/(args.browser+'-v11-touch-result.png')),full_page=True)
        page.evaluate('BondApp.cancelRegionBattle();BondProfile.abandonExpedition();BondApp.switchTab("region")')
        check(mode+' route can be left and restarted',page.locator('[data-route]').count()==2)
        page.evaluate('BondApp.startRegionBattle("ritual:clearing:bloomslime")')
        check(mode+' catch choice appears above arena',page.evaluate('document.querySelector("#ritual-panel").getBoundingClientRect().bottom<=document.querySelector("#arena").getBoundingClientRect().top+1'))
        page.locator('#catch-choice').select_option('bondcontract')
        page.evaluate('BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()')
        check(mode+' post-battle catch attempt consumes exactly one contract',page.evaluate('BondProfile.snapshot().inventory.bondcontract===2'))
        context.close()
    context=browser.new_context()
    page=context.new_page()
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url)
    page.wait_for_function('!!window.BondApp')
    fixture=page.evaluate('''()=>{
      const s=BondProfile.normalize(null);
      for(let seed=0;seed<100000;seed++){
        const e=BondExpeditionData.make('ruins','cave',seed,1,1);
        const i=e.steps.findIndex(x=>x.loot.rarecontract && (x.loot.trailfood||x.loot.battlefood) && x.loot.starseed);
        if(i>=0){e.index=i;s.expedition=e;s.xp={emberfox:4500,stonehorn:4500};return s;}
      }throw Error('No independent-drop fixture found');
    }''')
    page.evaluate('(s)=>localStorage.setItem("bond-bolt-profile-v5",JSON.stringify(s))',fixture)
    page.reload()
    page.locator('[data-route-resume]').click()
    check('Faction encounter has no catch controls',page.locator('#ritual-panel').is_hidden())
    page.evaluate('BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()')
    check('Independent loot rolls can award food, rare contract and keepsake together',page.evaluate('(()=>{const s=BondProfile.snapshot();return s.inventory.rarecontract===1 && s.inventory.starseed===1 && ((s.inventory.trailfood||0)+(s.inventory.battlefood||0))===1 && s.coins>=24;})()'))
    before=page.evaluate('JSON.stringify(BondProfile.snapshot())')
    page.evaluate('BondApp.finish()')
    check('Faction reward receipt cannot be claimed twice',before==page.evaluate('JSON.stringify(BondProfile.snapshot())'))
    page.locator('#tab-loadout').click()
    page.locator('[data-menu="inventory"]').click()
    page.screenshot(path=str(ARTIFACTS/(args.browser+'-v11-inventory-loot.png')),full_page=True)
    page.goto(url+'tests/index.html')
    page.locator('#run').click()
    output=json.loads(page.locator('#output').inner_text())
    check('Manual test page passes all 213 mechanics checks',output['failed']==0 and output['passed']==213)
    check('No external runtime requests',not external)
    check('No JavaScript errors',not errors)
    (ARTIFACTS/(args.browser+'-v11-final-report.json')).write_text(json.dumps({'results':results,'errors':errors,'external':external},indent=2),encoding='utf-8')
    browser.close()
server.shutdown()
raise SystemExit(0 if all(r['pass'] for r in results) else 1)
