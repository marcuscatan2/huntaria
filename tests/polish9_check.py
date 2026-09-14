"""Focused final checks: art sizing, mobile pack controls, tree/party integration."""
import argparse
from datetime import datetime,timedelta,timezone
import functools,http.server,json,threading
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright

def run(name):
    checks=[];errors=[]
    def check(label,value):
        checks.append(dict(name=label,passed=bool(value)));print(('PASS ' if value else 'FAIL ')+label,flush=True)
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as pw:
            b=pw.chromium.launch(executable_path=find_browser(name),headless=True)
            ctx=b.new_context(viewport=dict(width=390,height=844),is_mobile=True,has_touch=True,device_scale_factor=1)
            p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
            now=datetime.now(timezone.utc);p.clock.install(time=now);p.clock.pause_at(now+timedelta(seconds=60));p.goto(url)
            p.locator('[data-object="treasure-clearing"]').tap();p.clock.run_for(1800)
            check('Touch approach collects treasure',p.evaluate("BondProfile.snapshot().collected.includes('clearing')"))
            p.locator('[data-waypoint="4"]').tap();p.clock.run_for(21000)
            check('Touch trail-map traverses all five biomes continuously',p.evaluate("BondProfile.snapshot().visited.length===5&&BondRegion.inspect().area==='rise'"))
            p.locator('[data-object="elderroot"]').tap();p.clock.run_for(1800)
            check('Boss approach stops outside its large silhouette',p.locator('#npc-dialog').is_visible() and p.evaluate("Math.hypot(BondRegion.inspect().position.x-4780,BondRegion.inspect().position.y-450)>110"))
            p.locator('#npc-close').tap();p.locator('#tab-loadout').tap()
            p.locator('[data-open-tree="druid"]').tap()
            check('Character card opens its own mastery tree',p.locator('[data-tree-type="druid"]').get_attribute('aria-pressed')=='true' and p.locator('[data-learn]').count()==9)
            p.locator('[data-learn="bond"]').tap();p.locator('[data-learn="focus"]').tap();p.locator('[data-learn="focus2"]').tap()
            p.locator('[data-menu="party"]').tap();p.locator('#party-type').select_option('mage')
            check('Switching class retains separate saved trees',p.evaluate("BondProfile.snapshot().growth.druid.length===3&&!BondProfile.snapshot().growth.mage?.length&&BondApp.getBuild()[0][0].type==='mage'"))
            p.locator('[data-priority="2"]').tap();p.locator('[data-skill="hex"]').tap()
            check('Three active skill choices still work after tree addition',p.evaluate("BondApp.getBuild()[0][0].skills[2]==='hex'&&BondGame.validBuild(BondApp.getBuild())"))
            p.locator('[data-menu="collection"]').tap();p.locator('[data-filter="Support"]').tap()
            check('Collection support filter retains three monsters',p.locator('.collection-card').count()==3)
            p.locator('[data-collection="lumimoth"]').tap();p.locator('[data-open-tree="lumimoth"]').tap()
            check('Collection links to the selected monster tree',p.locator('[data-tree-type="lumimoth"]').get_attribute('aria-pressed')=='true')
            p.evaluate("BondApp.startRegionBattle('wildpack')");p.clock.run_for(4200)
            for width in [320,390]:
                p.set_viewport_size(dict(width=width,height=844));p.clock.run_for(50)
                check(f'{width}px: all eight initiative buttons remain inside arena',p.evaluate("(()=>{const a=document.querySelector('#arena').getBoundingClientRect();return [...document.querySelectorAll('.initiative-unit')].every(e=>{const r=e.getBoundingClientRect();return r.left>=a.left&&r.right<=a.right;});})()"))
                check(f'{width}px: pack and controls do not overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
            p.locator('[data-unit="1-5"]').tap()
            check('Fifth wild monster can be selected on touch screen',p.evaluate("CombatView.inspect().selected==='1-5'") and p.locator('.dock-skills').is_visible())
            p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
            p.screenshot(path=str(ARTIFACTS/f'{name}-v9-pack-final-mobile.png'),full_page=True)
            p.locator('#pause').tap();before=p.evaluate('BondApp.getBattle().time');p.clock.run_for(400)
            check('Pause holds variable-size pack battle',p.evaluate('BondApp.getBattle().time')==before)
            p.evaluate("BondApp.startRegionBattle('elderroot')");p.clock.run_for(8500)
            for width in [390,1440]:
                p.set_viewport_size(dict(width=width,height=1050 if width>600 else 844));p.clock.run_for(50)
                check(f'{width}px: boss sprite is visibly larger than trainer',p.evaluate("document.querySelector('.fighter.boss .character-sprite').getBoundingClientRect().height>document.querySelector('[data-id=\"0-0\"] .character-sprite').getBoundingClientRect().height*1.5"))
                check(f'{width}px: boss warning stays inside arena',p.evaluate("(()=>{const a=document.querySelector('#arena').getBoundingClientRect(),r=document.querySelector('#boss-warning').getBoundingClientRect();return !document.querySelector('#boss-warning').hidden&&r.left>=a.left&&r.right<=a.right;})()"))
                p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
                p.screenshot(path=str(ARTIFACTS/f'{name}-v9-boss-final-{width}.png'),full_page=True)
            p.locator('#fx-mode').click()
            check('Quiet FX remains selectable during boss encounter',p.evaluate('CombatView.inspect().quietFX'))
            p.locator('[data-speed="2"]').click();p.clock.run_for(40000)
            check('Mage trainer with direct-target fallback completes boss fight',p.evaluate("BondApp.getBattle().ended&&BondApp.getBattle().events.some(e=>e.kind==='cast'&&e.skillName==='Crown Hex')"))
            # Direct file-open manual test page exercises both model suites.
            q=ctx.new_page();q.goto(url+'tests/index.html');q.locator('#run').click();model=json.loads(q.locator('#output').inner_text())
            check('Manual regression page runs all 263 mechanics checks',model['passed']==263 and model['failed']==0)
            check('No JavaScript errors in final polish workflows',not errors)
            report=dict(browser=name,checks=checks,errors=errors,modelPassed=model['passed'])
            (ARTIFACTS/f'{name}-v9-polish-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
            print(json.dumps(dict(passed=sum(c['passed'] for c in checks),failed=[c for c in checks if not c['passed']],errors=errors)),flush=True)
            ctx.close();b.close();assert all(c['passed'] for c in checks)
    finally:server.shutdown();server.server_close()
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--browser',choices=['chrome','edge'],default='chrome');run(ap.parse_args().browser)
