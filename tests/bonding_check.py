"""Pass 10: isolated real-browser catch loop, illustrated inventory, animation and saves."""
import argparse
from datetime import datetime, timedelta, timezone
import functools
import http.server
import json
import threading
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright

def run(browser_name='chrome'):
    checks, errors, missing, external = [], [], [], []
    report = {}
    def check(name, value):
        checks.append(dict(name=name, passed=bool(value)))
        print(('PASS ' if value else 'FAIL ')+name, flush=True)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=find_browser(browser_name), headless=True)
        def page(ctx):
            p = ctx.new_page()
            p.on('pageerror', lambda e: errors.append(str(e)))
            p.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
            p.on('response', lambda r: missing.append(r.url) if r.status >= 400 else None)
            p.on('request', lambda r: external.append(r.url) if not r.url.startswith(('http://127.0.0.1:', 'file:', 'data:')) else None)
            now = datetime.now(timezone.utc)
            p.clock.install(time=now); p.clock.pause_at(now+timedelta(seconds=60))
            return p
        def images(p):
            p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
            p.evaluate('CharacterRig.ready()'); p.clock.run_for(50)
        def shot(p, name):
            images(p); p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v10-{name}.png'), full_page=True)
        ctx = browser.new_context(viewport=dict(width=1440, height=1050))
        p = page(ctx); p.goto(url)
        p.add_script_tag(path=str(ROOT/'tests/ritual-engine-tests.js'))
        report['engine'] = p.evaluate('runRitualTests()')
        check('All new ritual and migration model checks pass', report['engine']['failed'] == 0)
        check('Fresh adventure owns only two starter companions', p.evaluate("BondProfile.snapshot().owned.join(',')==='emberfox,stonehorn'"))
        check('Five persistent grass patches, one per biome', p.locator('.region-grass').count() == 5)
        check('Unbound companions cannot be equipped through app API', not p.evaluate("BondApp.changeUnit(0,1,'stormowl')"))
        images(p)
        check('Three animation sheets load for the world party', p.evaluate("CharacterRig.inspect().filter(s=>s.ready&&!s.error).length===3"))
        p.locator('#region-map').focus(); p.keyboard.down('d')
        frames = []
        for _ in range(6):
            p.clock.run_for(170)
            frames.append(p.locator('#region-player canvas').get_attribute('data-frame'))
        p.keyboard.up('d')
        check('Druid walking uses distinct actual sprite frames', len(set(frames)) >= 3)
        shot(p, 'world')
        p.locator('#tab-loadout').click(); p.locator('[data-menu="inventory"]').click()
        shot(p, 'inventory')
        check('Satchel shows real item stacks and illustrated icons', p.locator('.satchel-slot').count() == 2 and p.locator('.bag-icon').count() >= 3)
        p.locator('[data-item="biscuit"]').click(); p.locator('[data-prepare]').click()
        check('Biscuit preparation reserves without consuming', p.evaluate('BondProfile.snapshot().prepared&&BondProfile.snapshot().inventory.biscuit===2'))
        p.locator('[data-unprepare]').click()
        p.locator('[data-bag-filter="Rituals"]').click()
        check('Ritual category filters to contract stack', p.locator('.satchel-slot').count() == 1 and p.locator('[data-item="bondcontract"]').count() == 1)
        p.locator('[data-menu="collection"]').click(); p.locator('[data-collection="stormowl"]').click()
        check('Inner Haven distinguishes bonded and unbound spirits', p.locator('.collection-card.unbound').count() == 8 and p.locator('[data-add="1"]').is_disabled())
        p.locator('#tab-region').click()
        p.locator('[data-object="grass-clearing"]').click(); p.clock.run_for(4000)
        check('Walking to grass opens native habitat dialog', p.locator('#grass-dialog').is_visible())
        shot(p, 'habitat')
        check('Already bonded starter is not farmable', p.locator('[data-wild="emberfox"]').is_disabled())
        p.locator('[data-wild="bloomslime"]').click()
        check('Grass starts a single-spirit ritual encounter', p.evaluate("BondApp.getBattle().encounter.kind==='ritual'&&BondApp.getBattle().units.length===4"))
        p.clock.run_for(14000)
        check('Battle automatically pauses at the bonding window', p.evaluate('BondApp.getBattle().ritualReady()') and p.locator('#pause').is_disabled())
        frozen = p.evaluate('BondApp.getBattle().time'); p.clock.run_for(1000)
        check('Ready window cannot be missed while combat is paused', p.evaluate('BondApp.getBattle().time') == frozen)
        shot(p, 'ritual-ready')
        p.locator('#begin-ritual').click(); p.clock.run_for(1600)
        check('Begin contract channels and leaves inventory untouched', p.evaluate("BondApp.getBattle().ritual.state==='channeling'&&BondProfile.snapshot().inventory.bondcontract===3"))
        check('Druid holds an actual ritual casting pose', p.locator('.fighter[data-id="0-0"] canvas').get_attribute('data-pose') == 'ritual')
        shot(p, 'ritual-channel')
        p.locator('#pause').click(); elapsed = p.evaluate('BondApp.getBattle().time'); p.clock.run_for(2000)
        check('Manual pause freezes ritual progress', p.evaluate('BondApp.getBattle().time') == elapsed)
        p.locator('#start-battle').click(); p.clock.run_for(4000)
        check('Successful ritual adds one companion and consumes one contract', p.evaluate("BondApp.getBattle().ritual.state==='complete'&&BondProfile.owns('bloomslime')&&BondProfile.snapshot().inventory.bondcontract===2"))
        check('Success is a pact, not a defeated wild monster', p.evaluate("BondApp.getBattle().units[3].hp>0&&BondApp.getBattle().events.filter(e=>e.kind==='bound').length===1"))
        p.evaluate('BondApp.finish(); BondApp.finish()')
        check('Repeated result handling cannot duplicate or consume again', p.evaluate("BondProfile.snapshot().owned.length===3&&BondProfile.snapshot().inventory.bondcontract===2"))
        shot(p, 'pact')
        p.locator('#result-haven').click(); p.locator('[data-collection="bloomslime"]').click()
        check('Pact provenance appears in the Haven', 'Mosslight' in p.locator('.pact-origin').inner_text())
        shot(p, 'haven')
        p.locator('[data-add="2"]').click()
        check('Caught companion can join either party slot', p.evaluate("BondApp.getBuild()[0][2].type==='bloomslime'"))
        p.reload()
        check('Reload persists pact, contract count and equipped companion', p.evaluate("BondProfile.owns('bloomslime')&&BondProfile.snapshot().inventory.bondcontract===2&&BondApp.getBuild()[0][2].type==='bloomslime'"))
        check('No repeat ritual for an already bonded species', not p.evaluate("BondApp.startRegionBattle('ritual:clearing:bloomslime')"))
        p.evaluate("BondApp.startRegionBattle('ritual:brook:tideotter')")
        p.clock.run_for(18000); p.locator('#begin-ritual').click()
        p.evaluate("const b=BondApp.getBattle(); b.trainer(0).hp=1; b.trainer(0).shield=0; b.units.forEach(u=>{u.status={};u.actionRemaining=100;});")
        p.clock.run_for(1200)
        check('Trainer death aborts ritual with no item loss or capture', p.evaluate("BondApp.getBattle().winner===1&&!BondProfile.owns('tideotter')&&BondProfile.snapshot().inventory.bondcontract===2"))
        p.evaluate("BondApp.startRegionBattle('ritual:brook:tideotter')"); p.clock.run_for(1200)
        p.locator('#tab-loadout').click(); elapsed = p.evaluate('BondApp.getBattle().time'); p.clock.run_for(500)
        check('Leaving battle pauses an unfinished wild encounter', p.evaluate('BondApp.getBattle().time') == elapsed)
        p.evaluate("BondApp.startRegionBattle('ritual:brook:tideotter')")
        check('Returning to same wild encounter resumes its state', p.evaluate('BondApp.getBattle().time') == elapsed)
        p.reload()
        check('Reloading an abandoned ritual never consumes a contract', p.evaluate('BondProfile.snapshot().inventory.bondcontract===2&&!BondApp.getBattle()'))
        # Atomic inscription and treasure rewards on a fresh, isolated profile.
        p.evaluate("BondProfile.reward('mira')")
        before = p.evaluate('BondProfile.snapshot()')
        p.locator('#tab-loadout').click(); p.locator('[data-menu="inventory"]').click(); p.locator('[data-scribe]').click()
        check('Inscription atomically trades ten earned coins for one paper', p.evaluate('BondProfile.snapshot().coins') == before['coins']-10 and p.evaluate('BondProfile.snapshot().inventory.bondcontract') == before['inventory']['bondcontract']+1)
        p.evaluate("BondProfile.collect('clearing'); BondProfile.collect('clearing')")
        check('Treasure grants two contracts only once', p.evaluate('BondProfile.snapshot().inventory.bondcontract') == before['inventory']['bondcontract']+3)
        # Animation state coverage independently of random-looking combat timing.
        anim = p.evaluate("""()=>{
          const host=document.createElement('div');host.innerHTML=CharacterRig.art('druid');document.body.append(host);
          const r=CharacterRig.mount(host,'druid'),seen={};
          for(const [name,state] of Object.entries({idle:{},walk:{walking:true},windup:{windup:.8},ritual:{channeling:true},defeat:{fallen:1},victory:{victory:true}})){
            CharacterRig.pose(r,{time:10,rate:1,...state});seen[name]={frame:r.frame,mode:r.mode};
          }
          for(const name of ['attack','cast','hit']){CharacterRig.trigger(r,name,20,.6);seen[name]=[];
            for(const t of [20,20.06,20.13,20.25,20.48]){CharacterRig.pose(r,{time:t});seen[name].push(r.frame);}
          }
          CharacterRig.pose(r,{time:30,walking:true,reduced:true});seen.reduced=r.mode;
          host.remove();return seen;
        }""")
        report['animation'] = anim
        check('Attack and cast each contain four drawn poses', len(set(anim['attack'])) == 4 and len(set(anim['cast'])) == 4)
        check('Hit, defeat, victory and ritual have dedicated poses', anim['defeat']['frame'] == 14 and anim['victory']['frame'] == 15 and anim['ritual']['frame'] == 10 and 12 in anim['hit'])
        check('Reduced motion suppresses walking cycles', anim['reduced'] == 'idle')
        for width in [320,390,768,1440]:
            p.set_viewport_size(dict(width=width,height=900))
            p.evaluate("BondApp.switchTab('loadout')")
            for menu in ['inventory','collection']:
                p.evaluate(f"BondMenu.open('{menu}')"); p.clock.run_for(40)
                check(f'{width}px {menu}: no document overflow', p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
                if width == 390: shot(p, menu+'-mobile')
            p.evaluate("BondApp.switchTab('region');Bonding.open('brook')"); p.clock.run_for(40)
            check(f'{width}px habitat dialog fits viewport', p.locator('#grass-dialog').bounding_box()['width'] <= width)
            p.locator('.grass-close').click()
        # Migration preserves existing equipment but does not unlock practice enemies.
        legacy = browser.new_context()
        q = page(legacy)
        q.add_init_script("""localStorage.setItem('bond-bolt-profile-v3',JSON.stringify({version:3,inventory:{biscuit:4},growth:{druid:['bond']},collected:['clearing'],coins:20,position:{x:1700,y:410}}));""")
        q.goto(url); q.evaluate("""localStorage.removeItem('bond-bolt-profile-v4');const b=BondGame.defaultBuild();b[0][1]={type:'tideotter',skills:[...BondGame.UNITS.tideotter.default]};localStorage.setItem('bond-bolt-build-v2',JSON.stringify(b));"""); q.reload()
        check('Real v3 save migration retains equipped monster, progress and legacy key', q.evaluate("BondProfile.owns('tideotter')&&!BondProfile.owns('stormowl')&&BondProfile.snapshot().inventory.bondcontract===5&&BondProfile.snapshot().growth.druid[0]==='bond'&&localStorage.getItem('bond-bolt-profile-v3')!==null"))
        legacy.close()
        # No-paper state: keeps inscription and treasure recovery discoverable.
        empty = browser.new_context(); q=page(empty)
        q.add_init_script("localStorage.setItem('bond-bolt-profile-v4',JSON.stringify({version:4,owned:['emberfox','stonehorn'],inventory:{},coins:0}))")
        q.goto(url); q.evaluate("Bonding.open('clearing')")
        check('No paper disables catch and explains free recovery sources', q.locator('[data-wild="bloomslime"]').is_disabled() and 'Treasure' in q.locator('.grass-empty').inner_text())
        check('No-paper API cannot start a ritual', not q.evaluate("BondApp.startRegionBattle('ritual:clearing:bloomslime')"))
        empty.close()
        # Reduced motion, unavailable storage, and mobile touch capture.
        mobile = browser.new_context(viewport=dict(width=390,height=844),is_mobile=True,has_touch=True,reduced_motion='reduce')
        q=page(mobile);q.add_init_script("Storage.prototype.getItem=Storage.prototype.setItem=function(){throw Error('Unavailable')}")
        q.goto(url);q.locator('[data-waypoint="0"]').tap();q.clock.run_for(1600);q.locator('[data-object="grass-clearing"]').tap();q.clock.run_for(5000)
        q.locator('[data-wild="bloomslime"]').tap();q.clock.run_for(14000);q.locator('#begin-ritual').tap();q.clock.run_for(4500)
        check('Touch ritual completes in reduced motion without storage', q.evaluate("BondProfile.owns('bloomslime')&&!BondProfile.persistent()"))
        check('Mobile ritual controls do not cause document overflow', q.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        shot(q,'mobile-pact');mobile.close()
        check('No JavaScript or console errors', not errors)
        check('No missing assets', not missing)
        check('No external runtime requests', not external)
        report.update(browser=browser_name,version=browser.version,checks=checks,errors=errors,missing=missing,external=external)
        (ARTIFACTS/f'{browser_name}-v10-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
        print(json.dumps(dict(passed=sum(c['passed'] for c in checks),failed=[c for c in checks if not c['passed']],errors=errors)),flush=True)
        browser.close()
    server.shutdown()
    assert all(c['passed'] for c in checks), 'Pass 10 browser checks failed'

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--browser',choices=['chrome','edge'],default='chrome')
    run(ap.parse_args().browser)
