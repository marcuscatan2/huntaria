"""Complete the ten-species collection by actually walking, looting and bonding."""
import argparse
from datetime import datetime,timedelta,timezone
import functools,http.server,json,threading
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright

def run(name='chrome'):
    checks=[];errors=[];journey=[]
    def check(label,value):
        checks.append(dict(name=label,passed=bool(value)));print(('PASS ' if value else 'FAIL ')+label,flush=True)
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as pw:
            b=pw.chromium.launch(executable_path=find_browser(name),headless=True)
            ctx=b.new_context(viewport=dict(width=1440,height=1000))
            p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
            now=datetime.now(timezone.utc);p.clock.install(time=now);p.clock.pause_at(now+timedelta(seconds=60))
            p.goto(f'http://127.0.0.1:{server.server_port}/')
            for i,h in enumerate(p.evaluate('BondWild.HABITATS')):
                area=h['area']
                if i==3:
                    p.locator('#tab-loadout').click();p.locator('#party-type').select_option('mage');p.locator('#tab-region').click()
                p.locator(f'[data-waypoint="{i}"]').click();p.clock.run_for(6500)
                p.locator(f'[data-object="treasure-{area}"]').click();p.clock.run_for(1500)
                check(f'{area}: treasure provides two ritual papers',p.evaluate(f"BondProfile.snapshot().collected.includes('{area}')"))
                for type_ in h['types']:
                    if p.evaluate(f"BondProfile.owns('{type_}')"):continue
                    p.locator(f'[data-object="grass-{area}"]').click();p.clock.run_for(2500)
                    check(f'{type_}: discovered through its actual grass habitat',p.locator('#grass-dialog').is_visible() and p.locator(f'[data-wild="{type_}"]').is_enabled())
                    p.locator(f'[data-wild="{type_}"]').click()
                    p.locator('[data-speed="2"]').click();p.clock.run_for(16000)
                    check(f'{type_}: ready window safely pauses at 2x',p.locator('#begin-ritual').is_enabled() and p.evaluate('BondApp.getBattle().ritualReady()'))
                    p.locator('#begin-ritual').click();p.clock.run_for(2300)
                    check(f'{type_}: four-heartbeat pact succeeds',p.evaluate(f"BondProfile.owns('{type_}')&&BondApp.getBattle().ritual.state==='complete'"))
                    journey.append(p.evaluate("({type:BondApp.getBattle().encounter.type,time:BondApp.getBattle().time,trainer:BondApp.getBattle().trainer(0).type,hp:BondApp.getBattle().trainer(0).hp})"))
                    p.locator('#result-region').click()
            check('All ten companions at home with eight new pacts',p.evaluate('BondProfile.snapshot().owned.length===10&&Object.keys(BondProfile.snapshot().pacts).length===8'))
            check('No grind required: eight captures leave five free contracts',p.evaluate('BondProfile.snapshot().inventory.bondcontract===5&&BondProfile.snapshot().coins===0'))
            p.reload()
            check('Complete collection and all five visited biomes survive reload',p.evaluate('BondProfile.snapshot().owned.length===10&&BondProfile.snapshot().visited.length===5'))
            p.locator('#tab-loadout').click();p.locator('[data-menu="collection"]').click()
            p.locator('[data-collection="cindrake"]').click();p.locator('[data-add="1"]').click()
            check('Final captured species can be equipped and has five skills',p.evaluate("BondApp.getBuild()[0][1].type==='cindrake'") and p.locator('.ability-choice').count()==5)
            p.locator('#tab-region').click()
            p.once('dialog',lambda d:d.accept());p.locator('#region-reset').click()
            check('Confirmed adventure reset clears catches and repairs unbound party slots',p.evaluate("BondProfile.snapshot().owned.length===2&&Object.keys(BondProfile.snapshot().pacts).length===0&&BondApp.getBuild()[0].slice(1).every(u=>BondProfile.owns(u.type))&&BondGame.validBuild(BondApp.getBuild())"))
            check('No browser errors through the complete collection journey',not errors)
            report=dict(browser=name,checks=checks,journey=journey,errors=errors)
            (ARTIFACTS/f'{name}-v10-journey.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
            print(json.dumps(dict(passed=sum(c['passed'] for c in checks),failed=[c for c in checks if not c['passed']],errors=errors)),flush=True)
            b.close();assert all(c['passed'] for c in checks)
    finally:server.shutdown();server.server_close()

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--browser',choices=['chrome','edge'],default='chrome');run(ap.parse_args().browser)
