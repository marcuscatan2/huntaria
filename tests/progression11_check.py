"""Pass 11 isolated browser integration checks; no real player save is touched."""
import argparse
from datetime import datetime, timedelta, timezone
import functools
import json
import threading
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright
from http.server import ThreadingHTTPServer

parser = argparse.ArgumentParser()
parser.add_argument('--browser', default='chrome')
parser.add_argument('--smoke', action='store_true')
args = parser.parse_args()
server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/'
results, errors, missing = [], [], []

def check(name, value):
    results.append({'name': name, 'pass': bool(value)})
    print(('PASS ' if value else 'FAIL ') + name, flush=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    # Fixed route seed in this isolated test only. Production uses browser crypto.
    context.add_init_script('crypto.getRandomValues=a=>{a[0]=123;return a;}')
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('response', lambda r: missing.append(r.url) if r.status >= 400 else None)
    now = datetime.now(timezone.utc)
    page.clock.install(time=now)
    page.clock.pause_at(now + timedelta(seconds=60))
    page.goto(url)
    print('Startup errors:', errors, flush=True)
    check('Application starts', page.evaluate('!!window.BondApp'))
    if page.evaluate('!!window.BondApp'):
        page.locator('#tab-loadout').click()
        page.locator('[data-menu="trainer"]').click()
        check('Trainer ledger opens', page.locator('[data-stat]').count() == 6)
        page.locator('[data-stat="agi"]').click()
        check('Attribute point purchased', page.evaluate('BondProfile.snapshot().attributes.agi===2'))
        page.locator('[data-menu="trees"]').click()
        check('18 ranked nodes', page.locator('[data-learn]').count() == 18)
        page.locator('[data-learn="bond"]').click()
        check('Rank purchased', page.evaluate('BondProfile.snapshot().growth.druid.bond===1'))
        page.locator('#tab-region').click()
        page.locator('[data-route="cave"]').click()
        check('Cave pool displays six tiers', page.locator('.route-pool article').count() == 6)
        page.locator('[data-route-start]').click()
        check('Route starts combat', page.evaluate('BondApp.getTab()==="battle" && BondApp.getEncounter().startsWith("exp:")'))
        if args.smoke:
            page.clock.run_for(86000)
        else:
            page.evaluate('BondApp.getBattle().run(); BondApp.renderBattle(); BondApp.finish()')
        print('Fight:', page.evaluate('({ended:BondApp.getBattle().ended,winner:BondApp.getBattle().winner,time:BondApp.getBattle().time,reason:BondApp.getBattle().reason})'), flush=True)
        check('Playback completes' if args.smoke else 'Integrated combat completes', page.evaluate('BondApp.getBattle().ended'))
        page.screenshot(path=str(ARTIFACTS / (args.browser+'-v11-smoke.png')), full_page=True)
        if not args.smoke:
            for script, fn in [('engine-tests.js','runCombatTests'), ('progression-engine-tests.js','runProgressionTests')]:
                page.add_script_tag(path=str(ROOT / 'tests' / script))
                model = page.evaluate(fn+'()')
                check(fn+' all checks pass ('+str(model['passed'])+')', model['failed'] == 0)
                print(json.dumps({'suite':fn,'failures':[r for r in model['results'] if not r['pass']], 'metrics':model['metrics']}), flush=True)
                (ARTIFACTS / (args.browser+'-v11-'+fn+'.json')).write_text(json.dumps(model,indent=2),encoding='utf-8')

            def fixture(extra=None, version=5):
                data = page.evaluate('BondProfile.normalize(null)')
                data.update(extra or {})
                data['version'] = version
                page.evaluate('({data,version})=>{localStorage.removeItem("bond-bolt-profile-v5");localStorage.setItem("bond-bolt-profile-v"+version,JSON.stringify(data));}', {'data':data,'version':version})
                page.reload()
                page.wait_for_function('!!window.BondApp')

            def start_wild(roll, item='bondcontract', owned=False):
                fixture({'wildTicket':{'key':'ritual:clearing:bloomslime','id':1,'roll':roll,'settled':False},'inventory':{'bondcontract':3,'rarecontract':1},'owned':['emberfox','stonehorn']+(['bloomslime'] if owned else [])})
                page.evaluate('BondApp.startRegionBattle("ritual:clearing:bloomslime")')
                if item:
                    page.locator('#catch-choice').select_option(item)

            def finish():
                page.evaluate('BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()')

            start_wild(.1)
            check('Contract can be armed at full enemy HP', page.evaluate('BondApp.getBattle().catchItem==="bondcontract" && BondApp.getBattle().units.at(-1).hp===BondApp.getBattle().units.at(-1).maxHp'))
            finish()
            check('Winning armed roll catches and spends exactly one paper', page.evaluate('BondProfile.owns("bloomslime") && BondProfile.snapshot().inventory.bondcontract===2'))
            check('Victory grants XP to both active companions', page.evaluate('BondProfile.snapshot().xp.emberfox===60 && BondProfile.snapshot().xp.stonehorn===60'))
            before = page.evaluate('JSON.stringify(BondProfile.snapshot())')
            page.evaluate('BondApp.finish();BondApp.finish()')
            check('Repeated result cannot duplicate rewards', before == page.evaluate('JSON.stringify(BondProfile.snapshot())'))
            page.reload()
            check('Catch and XP persist on reload', page.evaluate('BondProfile.owns("bloomslime") && BondProfile.snapshot().xp.emberfox===60'))
            start_wild(.95)
            finish()
            check('Failed roll spends one but does not unlock companion', page.evaluate('!BondProfile.owns("bloomslime") && BondProfile.snapshot().inventory.bondcontract===2'))
            start_wild(.1, item=None)
            finish()
            check('Unarmed win does not catch or spend paper', page.evaluate('!BondProfile.owns("bloomslime") && BondProfile.snapshot().inventory.bondcontract===3'))
            start_wild(.8, item='rarecontract')
            finish()
            check('Illuminated contract uses 90% chance and correct item', page.evaluate('BondProfile.owns("bloomslime") && BondProfile.snapshot().inventory.rarecontract===0 && BondProfile.snapshot().inventory.bondcontract===3'))
            start_wild(.1)
            page.evaluate('const b=BondApp.getBattle();b.damage(b.units.at(-1),b.trainer(0),99999,"fixture defeat");BondApp.renderBattle();BondApp.finish()')
            check('Defeat preserves contract and grants no XP', page.evaluate('BondProfile.snapshot().inventory.bondcontract===3 && BondProfile.snapshot().xp.emberfox===0 && !BondProfile.owns("bloomslime")'))
            start_wild(.33)
            page.locator('#return-region').click()
            page.reload()
            check('Abandon/reload keeps paper and same pending catch roll', page.evaluate('BondProfile.snapshot().inventory.bondcontract===3 && BondProfile.snapshot().wildTicket.roll===.33 && !BondProfile.snapshot().wildTicket.settled'))
            start_wild(.1, item=None, owned=True)
            check('Already owned species cannot be armed', page.locator('#catch-choice').is_disabled())
            finish()
            check('Owned-species rematch earns XP without duplicate/paper use', page.evaluate('BondProfile.snapshot().owned.length===3 && BondProfile.snapshot().inventory.bondcontract===3 && BondProfile.snapshot().xp.emberfox===60'))

            fixture({'owned':['emberfox','stonehorn','lumimoth'],'xp':{'emberfox':0,'stonehorn':0,'lumimoth':4500},'inventory':{'trailfood':1,'battlefood':1,'bondcontract':3}})
            page.locator('#tab-loadout').click()
            page.locator('[data-menu="trainer"]').click()
            check('Benched highest companion sets trainer level 10', 'Level 10' in page.locator('.trainer-ledger h3').inner_text())
            page.locator('[data-stat="leadership"]').click()
            check('Leadership allocation updates visible sharing', '1.0% shared' in page.locator('.leadership-preview').inner_text())
            page.locator('[data-stat-reset]').click()
            check('Free attribute respec returns points', page.evaluate('BondProfile.snapshot().attributes.leadership===1'))
            page.locator('[data-menu="inventory"]').click()
            page.locator('[data-item="trailfood"]').click()
            page.locator('#feed-companion').select_option('emberfox')
            page.locator('[data-feed]').click()
            check('Memory Fruit is consumed and grants 120 XP', page.evaluate('BondProfile.snapshot().inventory.trailfood===0 && BondProfile.snapshot().xp.emberfox===120'))
            page.locator('[data-item="battlefood"]').click()
            page.locator('[data-boost]').click()
            page.locator('#fight').click()
            check('Prepared ration consumed at fresh battle start', page.evaluate('BondProfile.snapshot().inventory.battlefood===0 && !BondProfile.snapshot().boost'))
            check('Ration increases all three party maximum HP', page.evaluate('(()=>{const s=BondProfile.snapshot();return BondApp.getBattle().team(0).every(u=>u.maxHp===Math.round(BondProgress.derived(u.type,s).hp*1.1));})()'))
            page.evaluate('BondApp.getBattle().step();BondApp.renderBattle()')
            check('Boosted HP bars expose correct accessible maximum', page.evaluate('BondApp.getBattle().team(0).every(u=>Number(document.querySelector(\'.fighter[data-id="\'+u.id+\'"] .fighter-hp\').getAttribute("aria-valuemax"))===u.maxHp)'))
            page.locator('#pause').click()
            page.locator('#start-battle').click()
            check('Resume does not consume another ration', page.evaluate('BondProfile.snapshot().inventory.battlefood===0'))
            page.locator('#pause').click()

            fixture({'owned':['emberfox','stonehorn','tideotter'],'growth':{'druid':['bond','might','might2']},'coins':31,'inventory':{'bondcontract':2,'biscuit':1}}, version=4)
            check('Real v4 save migrates ownership, ranks, inventory and coins', page.evaluate('(()=>{const s=BondProfile.snapshot();return s.version===5 && s.owned.includes("tideotter") && s.growth.druid.might2===1 && s.inventory.bondcontract===2 && s.coins===31;})()'))
            check('Migration retains old save key', page.evaluate('!!localStorage.getItem("bond-bolt-profile-v4")'))
            fixture({'xp':{'emberfox':4500,'stonehorn':4500},'attributes':{'str':1,'agi':1,'vit':11,'int':21,'dex':1,'leadership':6},'growth':{t:{'bond':5,'might':4,'guard':3} for t in ['mage','emberfox','stonehorn']},'inventory':{'bondcontract':50,'rarecontract':10}})
            page.evaluate('BondApp.changeUnit(0,0,"mage")')
            check('Prepared route build uses only earned attribute points',page.evaluate('BondProgress.spent(BondProfile.snapshot().attributes)<=BondProgress.statBudget(10)'))
            check('Prepared route mastery stays within each level budget',page.evaluate('(()=>{const s=BondProfile.snapshot();return ["mage","emberfox","stonehorn"].every(t=>BondGrowth.used(s.growth[t])===BondGrowth.budget(s,t));})()'))
            page.locator('[data-route="forest"]').click()
            page.locator('[data-route-start]').click()
            check('Forest route displays regional arena name', 'FOREST' in page.locator('.scene-label').inner_text())
            for i in range(3):
                if page.locator('#catch-choice').is_visible() and not page.locator('#catch-choice').is_disabled():
                    page.locator('#catch-choice').select_option('rarecontract')
                finish()
                won = page.evaluate('BondApp.getBattle().winner===0')
                check('Expedition fight '+str(i+1)+' is winnable with prepared party', won)
                if not won:
                    break
                if i < 2:
                    if i == 0:
                        saved = page.evaluate('JSON.stringify(BondProfile.snapshot().expedition)')
                        page.reload()
                        check('Expedition reload preserves next encounter and rolls', saved == page.evaluate('JSON.stringify(BondProfile.snapshot().expedition)'))
                        page.locator('[data-route-resume]').click()
                    else:
                        page.locator('#next-encounter').click()
            check('Three victories complete route and save coins', page.evaluate('BondProfile.snapshot().expedition.complete && BondProfile.snapshot().expedition.index===3 && BondProfile.snapshot().coins>0'))
            check('Completed expedition cannot be restarted for same reward', page.locator('#restart').is_disabled())
            page.locator('#return-region').click()
            for area, x in [('clearing',280),('brook',1280),('hollow',2280),('ruins',3280),('rise',4280)]:
                page.evaluate('([a,x])=>{BondProfile.travel(a,{x,y:430});BondApp.switchTab("region");}',[area,x])
                check(area+' has cave and forest routes', page.locator('[data-route]').count()==2)
            page.locator('#tab-loadout').click()
            page.locator('[data-menu="trees"]').click()
            for t in page.evaluate('BondGrowth.TYPES'):
                page.locator('[data-tree-type="'+t+'"]').click()
                check(t+' renders 18-node tree', page.locator('[data-learn]').count()==18)
            page.locator('[data-tree-type="druid"]').click()
            page.locator('[data-learn="bond"]').click()
            page.locator('[data-learn="bond"]').click()
            check('Same node can gain multiple ranks', page.evaluate('BondProfile.snapshot().growth.druid.bond===2'))
            page.locator('[data-respec]').click()
            check('Tree reset refunds all ranks', page.evaluate('BondGrowth.used(BondProfile.snapshot().growth.druid)===0'))
            for width in [320,390,768,1440]:
                page.set_viewport_size({'width':width,'height':920})
                for menu in ['trainer','trees','inventory','collection','party']:
                    page.evaluate('(m)=>BondMenu.open(m)',menu)
                    check(str(width)+'px '+menu+' no overflow', page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
                if width in [390,1440]:
                    page.evaluate('BondMenu.open("trainer")')
                    page.screenshot(path=str(ARTIFACTS / (args.browser+'-v11-trainer-'+str(width)+'.png')), full_page=True)
            page.set_viewport_size({'width':1440,'height':1000})
            page.evaluate('BondMenu.open("trees")')
            page.screenshot(path=str(ARTIFACTS / (args.browser+'-v11-trees.png')), full_page=True)
    check('No JavaScript errors', not errors)
    check('No missing resources', not missing)
    print(json.dumps({'errors': errors, 'missing': missing}), flush=True)
    (ARTIFACTS / (args.browser+('-v11-smoke-report.json' if args.smoke else '-v11-report.json'))).write_text(json.dumps({'results': results, 'errors': errors, 'missing': missing}, indent=2), encoding='utf-8')
    browser.close()
server.shutdown()
raise SystemExit(0 if all(r['pass'] for r in results) else 1)
