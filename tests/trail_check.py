"""Pass 09: continuous world, mastery, varied encounters, real animated playback."""
import argparse
from datetime import datetime, timedelta, timezone
import functools
import http.server
import json
import threading
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright

def run(browser_name='chrome', smoke=False):
    checks,errors,missing,external=[],[],[],[]
    report={}
    def check(name,value):
        checks.append(dict(name=name,passed=bool(value)))
        print(('PASS ' if value else 'FAIL ')+name,flush=True)
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(executable_path=find_browser(browser_name),headless=True)
            context=browser.new_context(viewport=dict(width=1440,height=1050))
            def new_page(ctx):
                p=ctx.new_page()
                p.on('pageerror',lambda e:errors.append(str(e)))
                p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
                p.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
                p.on('request',lambda r:external.append(r.url) if not r.url.startswith(('http://127.0.0.1:','file:','data:')) else None)
                now=datetime.now(timezone.utc);p.clock.install(time=now);p.clock.pause_at(now+timedelta(seconds=60))
                return p
            p=new_page(context);p.goto(url);p.wait_for_function('!!window.BondApp')
            p.add_script_tag(path=str(ROOT/'tests/engine-tests.js'))
            engine=p.evaluate('runCombatTests()');report['engine']=engine
            print(json.dumps({'enginePassed':engine['passed'],'failures':[r for r in engine['results'] if not r['pass']]}),flush=True)
            check('Baseline engine regressions and 1000-build sweep pass',engine['failed']==0)
            p.add_script_tag(path=str(ROOT/'tests/trail-engine-tests.js'))
            trail=p.evaluate('runTrailTests()');report['trailEngine']=trail
            print(json.dumps({'trailEnginePassed':trail['passed'],'failures':[r for r in trail['results'] if not r['pass']],'metrics':trail['metrics']}),flush=True)
            check('New mastery and encounter mechanics plus 500-build sweep pass',trail['failed']==0)
            check('One persistent world contains five biomes and seven encounters',p.evaluate("document.querySelectorAll('.world-biome').length===5&&Object.keys(BondWorld.NPCS).length===7&&document.querySelectorAll('[data-object]').length===17"))
            check('No page-travel portals remain',p.locator('.region-exit').count()==0)
            p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
            p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v9-world.png'),full_page=True)
            p.locator('#tab-loadout').click();p.locator('[data-menu="trees"]').click()
            check('Twelve selectable trees with nine nodes',p.locator('[data-tree-type]').count()==12 and p.locator('[data-learn]').count()==9)
            for type_ in p.evaluate('BondGrowth.TYPES'):
                p.locator(f'[data-tree-type="{type_}"]').click()
                check(f'{type_}: dependent node locked initially',p.locator('[data-learn="might2"]').is_disabled())
                for node in ['bond','might','might2']:p.locator(f'[data-learn="{node}"]').click()
                check(f'{type_}: three points spent, no overspend',p.evaluate(f"BondProfile.snapshot().growth['{type_}'].length===3&&!BondProfile.learn('{type_}','guard')"))
            check('Trees leave three active skill slots untouched',p.evaluate('BondGame.validBuild(BondApp.getBuild())'))
            p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v9-tree.png'),full_page=True)
            p.reload();p.locator('#tab-loadout').click();p.locator('[data-menu="trees"]').click()
            check('Allocated class and monster trees persist on reload',p.evaluate("BondGrowth.TYPES.every(t=>BondProfile.snapshot().growth[t].length===3)"))
            p.locator('[data-tree-type="druid"]').click();p.locator('[data-respec]').click()
            check('Free reset restores points only for selected tree',p.evaluate("BondProfile.snapshot().growth.druid.length===0&&BondProfile.snapshot().growth.mage.length===3"))
            p.locator('[data-learn="bond"]').click()
            p.locator('#tab-battle').click()
            check('Mastery HP and damage bonuses copied into player only',p.evaluate("BondApp.getBattle().trainer(0).maxHp===848&&BondApp.getBattle().units[1].growth.attack===.14&&BondApp.getBattle().trainer(1).growth.hp===0"))
            p.locator('#start-battle').click();p.clock.run_for(1800);p.locator('#tab-loadout').click()
            p.locator('[data-menu="trees"]').click();p.locator('[data-respec]').click()
            check('Respec invalidates paused battle',p.evaluate('BondApp.getBattle()===null'))
            simulations=p.evaluate("""()=>{
                const out={};
                for(const [id,n] of Object.entries(BondWorld.NPCS)){
                    const build=BondGame.defaultBuild();if(n.team)build[1]=n.team;
                    const b=new BondGame.Battle(build,{encounter:n.kind?n:null,growth:BondProfile.snapshot().growth}).run();
                    out[id]={winner:b.winner,time:b.time,reason:b.reason,units:b.units.length,hp:b.units.map(u=>u.hp),quakes:b.events.filter(e=>e.kind==='quake').length,phase:b.bossPhase};
                }return out;
            }""")
            report['encounters']=simulations;print(json.dumps(simulations),flush=True)
            check('All seven encounter simulations terminate',all(0<v['time']<=75 for v in simulations.values()))
            if not smoke:
                full_checks(p,context,browser,new_page,url,check,report,browser_name)
            p.evaluate("BondApp.switchTab('region')")
            p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
            for width in [320,390,768,1440]:
                p.set_viewport_size(dict(width=width,height=900));p.clock.run_for(80)
                for tab in ['region','loadout','battle']:
                    p.evaluate(f"BondApp.switchTab('{tab}')");p.clock.run_for(32)
                    check(f'{width}px {tab}: no document overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
                p.locator('#tab-loadout').click();p.locator('[data-menu="trees"]').click()
                check(f'{width}px skill tree: no overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
                if width==390:
                    p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
                    p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v9-tree-mobile.png'),full_page=True)
                    p.locator('#tab-region').click();p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v9-world-mobile.png'),full_page=True)
            check('No JavaScript or console errors',not errors)
            check('No missing assets',not missing)
            check('No external app requests',not external)
            report.update(browser=browser_name,version=browser.version,checks=checks,errors=errors,missing=missing,external=external)
            (ARTIFACTS/f'{browser_name}-v9-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
            print(json.dumps({'passed':sum(c['passed'] for c in checks),'failed':[c for c in checks if not c['passed']],'errors':errors}),flush=True)
            context.close();browser.close()
            assert all(c['passed'] for c in checks),'Browser checks failed'
    finally:server.shutdown();server.server_close()

def full_checks(p,context,browser,new_page,url,check,report,browser_name):
    p.locator('#tab-region').click()
    p.once('dialog',lambda d:d.accept());p.locator('#region-reset').click()
    check('Adventure reset also clears mastery',p.evaluate('Object.keys(BondProfile.snapshot().growth).length===0'))
    p.locator('#region-map').focus();before=p.evaluate('BondRegion.inspect().position.y')
    p.keyboard.down('w');p.clock.run_for(150);p.keyboard.up('w')
    check('Cardinal keyboard movement works',p.evaluate('BondRegion.inspect().position.y')<before-10)
    p.locator('[data-waypoint="4"]').click();p.clock.run_for(500);p.keyboard.press('Escape')
    stopped=p.evaluate('BondRegion.inspect().position');p.clock.run_for(500)
    check('Escape stops auto-walking from trail-map button',p.evaluate('BondRegion.inspect().position')==stopped)
    p.evaluate("window.originalWorld=document.querySelector('#world-layer')")
    p.locator('[data-waypoint="1"]').click()
    samples=[]
    for _ in range(28):
        p.clock.run_for(250);samples.append(p.evaluate('BondRegion.inspect().position.x'))
    check('Crossing a biome never teleports the party',all(abs(b-a)<60 for a,b in zip(samples,samples[1:])))
    check('World layer survives biome crossing and camera follows',p.evaluate("originalWorld===document.querySelector('#world-layer')&&BondRegion.inspect().area==='brook'&&BondRegion.inspect().camera>600&&BondProfile.snapshot().visited.includes('brook')"))
    p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v9-brook.png'),full_page=True)
    saved=p.evaluate('BondRegion.inspect().position');p.reload()
    check('Global position and area persist across reload',p.evaluate('BondRegion.inspect().position')==saved and p.evaluate("BondRegion.inspect().area==='brook'"))
    # Spend starter points through real UI for the adventuring party.
    p.locator('#tab-loadout').click();p.locator('[data-menu="trees"]').click()
    for type_ in ['druid','emberfox','stonehorn']:
        p.locator(f'[data-tree-type="{type_}"]').click()
        for node in ['bond','might','guard']:p.locator(f'[data-learn="{node}"]').click()
    p.locator('[data-menu="inventory"]').click();p.locator('[data-item="biscuit"]').click();p.locator('[data-prepare]').click()
    check('Inventory can reserve a biscuit without consumption',p.evaluate('BondProfile.snapshot().prepared&&BondProfile.snapshot().inventory.biscuit===2'))
    p.locator('#tab-region').click()
    scenes=p.evaluate('BondWorld.SCENES.map(s=>s.id)')
    actual={}
    for i,area in enumerate(scenes):
        p.locator(f'[data-waypoint="{i}"]').click();p.clock.run_for(7500)
        p.locator(f'[data-object="treasure-{area}"]').click();p.clock.run_for(2000)
        check(f'{area}: treasure collected by walking to it',p.evaluate(f"BondProfile.snapshot().collected.includes('{area}')"))
        ids=p.evaluate(f"Object.entries(BondWorld.NPCS).filter(([id,n])=>n.area==='{area}').map(([id])=>id)")
        for id_ in ids:
            p.locator(f'[data-object="{id_}"]').click();p.clock.run_for(4000)
            check(f'{id_}: proximity interaction opens encounter dialogue',p.locator('#npc-dialog').is_visible())
            p.locator('#npc-advice').click()
            check(f'{id_}: tactical advice is available',len(p.locator('#npc-dialogue').inner_text())>40)
            count=p.evaluate('BondProfile.snapshot().inventory.biscuit||0')
            p.locator('#npc-fight').click()
            if id_=='mira':
                check('First start consumes prepared biscuit exactly once',p.evaluate(f"BondProfile.snapshot().inventory.biscuit==={count-1}&&BondApp.getBattle().trainer(0).shield===80"))
                p.clock.run_for(1000);p.locator('#return-region').click()
                paused=p.evaluate('BondApp.getBattle().time')
                p.locator('[data-object="mira"]').click();p.clock.run_for(300)
                check('Returning to the same keeper offers resume',p.locator('#npc-fight').inner_text().startswith('Resume'))
                p.locator('#npc-fight').click()
                check('Resume preserves fight and does not consume again',p.evaluate(f"BondApp.getBattle().time==={paused}&&BondProfile.snapshot().inventory.biscuit==={count-1}"))
            p.locator('[data-speed="1"]').click()
            if id_=='wildpack':
                check('Pack battle renders eight real combatants, no enemy trainer',p.locator('.fighter').count()==8 and p.evaluate('!BondApp.getBattle().trainer(1)'))
                p.clock.run_for(4500)
                p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
                p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v9-pack.png'),full_page=True)
            if id_=='elderroot':
                p.clock.run_for(8500)
                check('Boss charge visibly warns before impact',p.locator('#boss-warning').is_visible() and p.evaluate("BondApp.getBattle().events.some(e=>e.kind==='telegraph')&&!BondApp.getBattle().events.some(e=>e.kind==='quake')"))
                p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
                p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v9-boss-charge.png'),full_page=True)
                p.locator('#pause').click();time=p.evaluate('BondApp.getBattle().time');p.clock.run_for(1000)
                check('Pause freezes the boss telegraph and combat clock',p.evaluate('BondApp.getBattle().time')==time)
                p.locator('#start-battle').click()
            p.locator('[data-speed="2"]').click();p.clock.run_for(40000)
            result=p.evaluate('({winner:BondApp.getBattle().winner,time:BondApp.getBattle().time,reason:BondApp.getBattle().reason,phase:BondApp.getBattle().bossPhase})')
            actual[id_]=result
            check(f'{id_}: real animated playthrough completes with a victory',p.evaluate('BondApp.getBattle().ended&&BondApp.getBattle().winner===0') and p.locator('#scoreboard').is_visible())
            check(f'{id_}: first-win reward claimed once',p.evaluate(f"BondProfile.snapshot().defeated.includes('{id_}')&&!BondProfile.reward('{id_}')"))
            if id_=='elderroot':
                check('Boss reaches phase two and clears its warning on defeat',result['phase']==2 and p.locator('#boss-warning').is_hidden())
                p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v9-boss-result.png'),full_page=True)
            p.locator('#result-region').click()
    report['actualPlaythroughs']=actual
    check('Full trail awards five treasures, seven unique victories, seven tree points',p.evaluate('BondProfile.snapshot().collected.length===5&&BondProfile.snapshot().defeated.length===7&&BondGrowth.budget(BondProfile.snapshot())===7'))
    check('All five areas discovered without page travel',p.evaluate('BondProfile.snapshot().visited.length===5'))
    p.reload()
    check('All adventure and mastery progress persists',p.evaluate('BondProfile.snapshot().defeated.length===7&&BondProfile.snapshot().growth.druid.length===3'))
    # Migration in a fresh isolated profile, not the test playthrough's save.
    legacy=browser.new_context();old=new_page(legacy)
    old.add_init_script("""localStorage.setItem('bond-bolt-profile-v2',JSON.stringify({version:2,area:'ruins',position:{x:400,y:400},visited:['clearing','ruins'],collected:['clearing'],defeated:['mira'],inventory:{biscuit:4,mossbloom:1,grovebadge:1},coins:20,prepared:true}));""")
    old.goto(url)
    check('Actual v2 storage migrates to v4 while retaining original',old.evaluate("BondProfile.snapshot().version===4&&BondRegion.inspect().position.x===3400&&BondProfile.snapshot().coins===20&&localStorage.getItem('bond-bolt-profile-v2')!==null"))
    legacy.close()
    blocked=browser.new_context(reduced_motion='reduce',viewport=dict(width=390,height=844));q=new_page(blocked)
    q.add_init_script("Storage.prototype.getItem=Storage.prototype.setItem=function(){throw Error('Storage unavailable')}")
    q.goto(url)
    check('Blocked storage has a visible session-only notice',not q.evaluate('BondProfile.persistent()') and 'Session only' in q.locator('#region-save-status').inner_text())
    q.locator('#tab-loadout').click();q.locator('[data-menu="trees"]').click();q.locator('[data-learn="bond"]').click()
    check('Trees remain usable without storage',q.evaluate("BondProfile.snapshot().growth.druid.includes('bond')"))
    q.evaluate("BondApp.startRegionBattle('elderroot')")
    q.clock.run_for(8500)
    check('Reduced-motion mode retains essential boss warning',q.locator('#boss-warning').is_visible())
    q.locator('[data-speed="2"]').click();q.clock.run_for(40000)
    check('Reduced-motion mobile boss fight finishes without storage',q.evaluate('BondApp.getBattle().ended'))
    blocked.close()
    # A forced defeat tests reward wiring independently of balance.
    lossctx=browser.new_context();q=new_page(lossctx);q.goto(url);q.evaluate("BondApp.startRegionBattle('wildpack')")
    q.evaluate("BondApp.getBattle().damage(BondApp.getBattle().team(1)[0],BondApp.getBattle().trainer(0),9999,'Test defeat')")
    q.clock.run_for(100)
    check('Defeat ends encounter without awarding coins or progress',q.evaluate('BondProfile.snapshot().coins===0&&BondProfile.snapshot().defeated.length===0&&BondApp.getBattle().winner===1'))
    lossctx.close()
    filectx=browser.new_context();q=new_page(filectx);q.goto((ROOT/'index.html').as_uri())
    q.evaluate("BondApp.startRegionBattle('wildpack')");q.locator('[data-speed="2"]').click();q.clock.run_for(40000)
    check('Double-click file mode plays new encounters without a server',q.evaluate('BondApp.getBattle().ended') and q.locator('#scoreboard').is_visible())
    filectx.close()

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--browser',choices=['chrome','edge'],default='chrome');ap.add_argument('--smoke',action='store_true')
    args=ap.parse_args();run(args.browser,args.smoke)
