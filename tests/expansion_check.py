"""Pass 08: actual browser workflows and engine regressions; isolated test profiles.
Run: python tests/expansion_check.py [--browser edge] [--smoke]
"""
import argparse
from datetime import datetime, timedelta, timezone
import functools
import http.server
import json
import threading
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright


def run(browser_name, smoke):
    checks, errors, missing, external = [], [], [], []
    def check(name, value):
        checks.append({"name": name, "pass": bool(value)})
        print(('PASS ' if value else 'FAIL ') + name, flush=True)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
    ARTIFACTS.mkdir(exist_ok=True)
    report = {}
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=find_browser(browser_name), headless=True)
            context = browser.new_context(viewport={"width":1440,"height":1050})
            p = context.new_page()
            def watch(page):
                page.on('pageerror', lambda err: errors.append(str(err)))
                page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
                page.on('response', lambda r: missing.append(r.url) if r.status >= 400 else None)
                page.on('request', lambda r: external.append(r.url) if not r.url.startswith(('http://127.0.0.1:', 'file:', 'data:')) else None)
            watch(p)
            now=datetime.now(timezone.utc)
            p.clock.install(time=now)
            p.clock.pause_at(now+timedelta(seconds=60))
            p.goto(url)
            p.wait_for_function('!!window.BondApp')
            check('Explore opens with five route stops', p.locator('.route-stop').count()==5)
            p.add_script_tag(path=str(ROOT/'tests/engine-tests.js'))
            engine=p.evaluate('runCombatTests()')
            report['engine']=engine
            print(json.dumps({'enginePassed':engine['passed'],'failures':[r for r in engine['results'] if not r['pass']],'metrics':engine['metrics']}),flush=True)
            check('All engine regressions pass',engine['failed']==0)
            p.locator('#tab-loadout').click()
            check('Party has three members and five skill choices',p.locator('.party-member').count()==3 and p.locator('.ability-choice').count()==5)
            check('Three priorities equipped',p.locator('.priority-slot').count()==3)
            p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-party.png'),full_page=True)
            p.locator('[data-menu="collection"]').click()
            check('Collection shows all ten monsters',p.locator('.collection-card').count()==10)
            p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
            check('All ten collection illustrations decode',p.locator('.collection-card img').evaluate_all('(images)=>images.every(i=>i.complete&&i.naturalWidth>0)'))
            p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-collection.png'),full_page=True)
            p.locator('[data-filter="Support"]').click()
            check('Support filter has three monsters',p.locator('.collection-card').count()==3)
            p.locator('[data-collection="lumimoth"]').click()
            check('Collection explains Moon Ward',p.locator('.passive-card').inner_text().find('Moon Ward')>=0)
            p.locator('[data-add="1"]').click()
            check('Collection equips chosen companion',p.evaluate("BondApp.getBuild()[0][1].type==='lumimoth'"))
            p.locator('[data-priority="2"]').click()
            p.locator('[data-skill="aurora"]').click()
            check('A chosen skill replaces priority three',p.evaluate("BondApp.getBuild()[0][1].skills[2]==='aurora'"))
            p.locator('[data-skill="moondust"]').click()
            check('Equipped skills swap without duplicates',p.evaluate("BondGame.validBuild(BondApp.getBuild()) && BondApp.getBuild()[0][1].skills[2]==='moondust'"))
            p.locator('[data-menu="inventory"]').click()
            check('Two starter biscuits in inventory',p.evaluate('BondProfile.snapshot().inventory.biscuit===2'))
            p.locator('[data-prepare]').click()
            check('Preparing reserves but does not consume',p.evaluate('BondProfile.snapshot().prepared && BondProfile.snapshot().inventory.biscuit===2'))
            p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-inventory.png'),full_page=True)
            p.reload()
            check('Build and prepared supply survive reload',p.evaluate("BondApp.getBuild()[0][1].type==='lumimoth' && BondProfile.snapshot().prepared"))
            p.locator('#tab-battle').click()
            check('Preview does not consume the supply',p.evaluate('BondProfile.snapshot().inventory.biscuit===2'))
            p.locator('#start-battle').click()
            check('Starting consumes exactly one biscuit and grants shield',p.evaluate('BondProfile.snapshot().inventory.biscuit===1 && !BondProfile.snapshot().prepared && BondApp.getBattle().trainer(0).shield===80'))
            p.clock.run_for(6000)
            p.locator('#pause').click()
            p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-battle.png'),full_page=True)
            check('Combat runs with six units and three cooldowns each',p.evaluate('BondApp.getBattle().time>5 && BondApp.getBattle().units.every(u=>u.cds.length===3)'))
            check('Combat dock shows three skills',p.locator('.dock-skill').count()==3)
            p.locator('#start-battle').click()
            p.clock.run_for(1000)
            check('Resume does not consume again',p.evaluate('BondProfile.snapshot().inventory.biscuit===1'))
            p.locator('#tab-region').click()
            if not smoke:
                full_checks(p,context,browser,url,watch,check,browser_name)
            for width in [1440,768,390,320]:
                p.set_viewport_size({'width':width,'height':900})
                for tab in ['region','loadout','battle']:
                    p.locator('#tab-'+tab).click()
                    check(f'{tab} fits {width}px',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
                p.locator('#tab-loadout').click()
                for sub in ['party','collection','inventory']:
                    p.locator('[data-menu="'+sub+'"]').click()
                    check(f'{sub} menu fits {width}px',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
                if width in [390,320]:
                    p.locator('[data-menu="party"]').click()
                    p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-party-{width}.png'),full_page=True)
            check('No missing assets',not missing)
            check('No JavaScript or console errors',not errors)
            check('No external application requests',not external)
            report.update(browser=browser.version,checks=checks,errors=errors,missing=missing,external=external)
            browser.close()
    finally:
        server.shutdown()
        report.update(checks=checks,errors=errors,missing=missing,external=external)
        (ARTIFACTS/f'{browser_name}-v8-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    assert not [c for c in checks if not c['pass']], 'Some checks failed; inspect report'


def full_checks(p,context,browser,url,watch,check,browser_name):
    def advance(ms=4500):
        p.clock.run_for(ms)
    def loaded(page):
        page.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
    p.locator('#tab-loadout').click()
    p.locator('#reset-loadouts').click()
    p.locator('[data-menu="party"]').click()
    p.locator('#party-type').select_option('mage')
    check('Mage class has its own five skills',p.locator('.ability-choice').count()==5 and p.locator('[data-skill="comet"]').count()==1)
    p.locator('#party-type').select_option('druid')
    p.locator('[data-slot="1"]').click()
    p.locator('#party-type').select_option('stonehorn')
    check('Choosing an already equipped monster swaps party slots',p.evaluate("BondApp.getBuild()[0][1].type==='stonehorn' && BondApp.getBuild()[0][2].type==='emberfox'"))
    p.locator('#reset-loadouts').click()
    p.locator('[data-side-toggle]').click()
    p.locator('#party-type').select_option('druid')
    check('Practice opponent can still be edited independently',p.evaluate("BondApp.getBuild()[1][0].type==='druid'"))
    p.locator('#tab-region').click()
    p.locator('#region-map').focus()
    start=p.evaluate('BondRegion.inspect().position')
    p.keyboard.down('d');advance(600);p.keyboard.up('d')
    end=p.evaluate('BondRegion.inspect().position')
    check('Keyboard movement actually moves the trainer',end['x']>start['x']+70)
    p.keyboard.down('w');p.keyboard.down('d');advance(600);p.keyboard.up('w');p.keyboard.up('d')
    diagonal=p.evaluate('BondRegion.inspect().position')
    direct=((end['x']-start['x'])**2+(end['y']-start['y'])**2)**.5
    diag=((diagonal['x']-end['x'])**2+(diagonal['y']-end['y'])**2)**.5
    check('Diagonal walking is normalized',abs(direct-diag)<8)
    p.locator('[data-object="mira"]').click()
    p.keyboard.press('Escape')
    advance()
    check('Escape cancels queued NPC approach',not p.locator('#npc-dialog').evaluate('(d)=>d.open'))
    npc_results={}
    for index,area in enumerate(['clearing','brook','hollow','ruins','rise']):
        if index:
            p.locator('[data-object="'+area+'"]').click()
            advance(5000)
        check(area+' reached by walking to its trail sign',p.evaluate('BondRegion.inspect().area')==area)
        p.locator('[data-object="treasure"]').click()
        advance(2000)
        check(area+' treasure collected in range',p.evaluate('(id)=>BondProfile.snapshot().collected.includes(id)',area))
        check(area+' pickup confirmation visible',not p.locator('#region-toast').is_hidden())
        check(area+' pickup cannot duplicate',not p.evaluate('(id)=>BondProfile.collect(id)',area))
        if area in ['clearing','brook','rise']:
            npc={'clearing':'mira','brook':'orin','rise':'vesper'}[area]
            # Find a reproducible successful party; use legitimate legal skills,
            # then play the whole fight via the same UI and simulation as a player.
            winning=p.evaluate("""(id)=>{
                const G=BondGame;
                for(const trainer of ['druid','mage'])for(const dps of ['emberfox','stormowl','frostfang','cindrake'])for(const tank of ['stonehorn','ironback','thornstag']){
                    const build=[[trainer,dps,tank].map(type=>({type,skills:[...G.UNITS[type].default]})),BondWorld.NPCS[id].team];
                    const b=new G.Battle(build).run();if(b.winner===0)return build[0];
                }return null;
            }""",npc)
            check(npc+' can be defeated with a legal ordinary party',winning is not None)
            assert winning, npc+' has no winning baseline party'
            p.evaluate('(team)=>team.forEach((u,i)=>{BondApp.changeUnit(0,i,u.type);BondApp.changeSkills(0,i,u.skills);})',winning)
            p.locator('[data-object="'+npc+'"]').click()
            advance()
            check(npc+' opens a conversation, not an immediate battle',p.locator('#npc-dialog').evaluate('(d)=>d.open') and p.evaluate("BondApp.getTab()==='region'"))
            loaded(p)
            if npc=='mira':
                p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-dialog.png'),full_page=True)
            text=p.locator('#npc-dialogue').inner_text()
            p.locator('#npc-advice').click()
            check(npc+' gives distinct tactical advice',p.locator('#npc-dialogue').inner_text()!=text)
            p.locator('#npc-fight').click()
            check(npc+' uses its own team, independent of practice edits',p.evaluate('(id)=>JSON.stringify(BondApp.getBattle().build[1])===JSON.stringify(BondWorld.NPCS[id].team)',npc))
            check(npc+' has its own battle portrait',p.locator('.fighter[data-id="1-0"] img').get_attribute('data-character')==npc)
            check(npc+' fights in its own location',area in p.locator('.scene-label').inner_text().lower().replace('mosslight clearing','clearing').replace('willowbrook','brook').replace('windstep rise','rise'))
            advance(1500)
            p.locator('#return-region').click()
            saved_time=p.evaluate('BondApp.getBattle().time')
            advance(2000)
            check(npc+' pauses when returning to exploration',p.evaluate('BondApp.getBattle().time')==saved_time)
            p.locator('[data-object="'+npc+'"]').click();advance()
            check(npc+' conversation offers resume',p.locator('#npc-fight').inner_text()=='Resume battle →')
            p.locator('#npc-fight').click()
            check(npc+' resumes the same battle',p.evaluate('BondApp.getBattle().time')==saved_time)
            p.locator('[data-speed="2"]').click()
            advance(39000)
            check(npc+' full animated battle completes with a win',p.evaluate('BondApp.getBattle().ended && BondApp.getBattle().winner===0'))
            check(npc+' first victory grants its emblem',p.evaluate('(id)=>BondProfile.snapshot().defeated.includes(id)&&BondProfile.snapshot().inventory[BondWorld.NPCS[id].badge]===1',npc))
            reward=p.evaluate('BondProfile.snapshot()')
            p.evaluate('BondApp.finish()')
            check(npc+' completion cannot duplicate rewards',p.evaluate('BondProfile.snapshot()')==reward and not p.evaluate('(id)=>BondProfile.reward(id)',npc))
            npc_results[npc]=p.evaluate('({time:BondApp.getBattle().time,party:BondApp.getBattle().build[0]})')
            p.locator('#result-region').click()
            check(npc+' returns to the same region',p.evaluate('BondRegion.inspect().area')==area)
        loaded(p)
        p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-region-{area}.png'),full_page=True)
    print('NPC WINNING PARTIES '+json.dumps(npc_results),flush=True)
    profile=p.evaluate('BondProfile.snapshot()')
    check('Entire trail has five treasures and three victories',len(profile['collected'])==5 and len(profile['defeated'])==3 and profile['coins']==105)
    p.reload()
    check('All region progress, inventory and area persist',p.evaluate('BondProfile.snapshot()')==profile)
    p.locator('[data-object="ruins"]').click();advance(5000)
    check('Return trail signs allow backtracking',p.evaluate("BondRegion.inspect().area==='ruins'"))
    p.locator('[data-object="hollow"]').click()
    p.locator('#tab-loadout').click();advance(5000)
    check('Leaving Explore cancels pending travel',p.evaluate("BondRegion.inspect().area==='ruins' && !BondRegion.inspect().pending"))
    p.locator('[data-menu="inventory"]').click();p.locator('[data-filter="Trophies"]').click()
    check('Inventory trophy filter contains all three emblems',p.locator('.inventory-item').count()==3)
    p.locator('[data-filter="Materials"]').click()
    check('Inventory materials filter contains five distinct keepsakes',p.locator('.inventory-item').count()==5)
    p.locator('[data-filter="All"]').click();loaded(p)
    p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-inventory-full.png'),full_page=True)
    p.locator('#fight').click();advance(39000)
    check('Practice battles cannot award NPC loot',p.evaluate('BondProfile.snapshot().coins===105'))
    p.locator('#tab-region').click()
    p.once('dialog',lambda d:d.dismiss());p.locator('#region-reset').click()
    check('Canceling reset preserves inventory',p.evaluate('BondProfile.snapshot().coins===105'))
    builds=p.evaluate('BondApp.getBuild()')
    p.once('dialog',lambda d:d.accept());p.locator('#region-reset').click()
    check('Confirmed reset clears only adventure and inventory',p.evaluate('BondProfile.snapshot().coins===0 && BondProfile.snapshot().collected.length===0') and p.evaluate('BondApp.getBuild()')==builds)
    p.set_viewport_size({'width':390,'height':844});loaded(p)
    p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-region-390.png'),full_page=True)
    p.locator('[data-object="mira"]').click();advance()
    loaded(p);p.screenshot(path=str(ARTIFACTS/f'{browser_name}-v8-dialog-390.png'),full_page=True)
    check('Mobile NPC dialog stays within viewport',p.locator('#npc-dialog').evaluate('(d)=>d.getBoundingClientRect().width<=innerWidth'))
    p.keyboard.press('Escape')
    check('Escape closes NPC dialog',not p.locator('#npc-dialog').evaluate('(d)=>d.open'))
    # A real mobile/touch context, not just a smaller desktop viewport.
    touch=browser.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    t=touch.new_page();watch(t);now=datetime.now(timezone.utc);t.clock.install(time=now);t.clock.pause_at(now+timedelta(seconds=60));t.goto(url)
    t.locator('[data-object="treasure"]').tap();t.clock.run_for(4000)
    check('Touch can approach and collect treasure',t.evaluate("BondProfile.snapshot().collected.includes('clearing')"))
    touch.close()
    # Independent save fixtures: no live player data is touched.
    for mode in ['legacy','malformed','blocked','file']:
        ctx=browser.new_context(reduced_motion='reduce');q=ctx.new_page();watch(q)
        if mode=='legacy':
            legacy=[[{'type':t,'skills':s} for t,s in team] for team in [[('mage',['hex','frost']),('emberfox',['pierce','burn']),('stonehorn',['fortify','guard'])],[('druid',['mend','bark']),('stormowl',['gust','chain']),('bloomslime',['cleanse','bloom'])]]]
            ctx.add_init_script('localStorage.setItem("bond-bolt-build-v1",'+json.dumps(json.dumps(legacy))+');localStorage.setItem("bond-bolt-region-v1",JSON.stringify({version:1,itemCollected:true,scoutDefeated:true,position:{x:500,y:420}}));')
        elif mode=='malformed':
            ctx.add_init_script('localStorage.setItem("bond-bolt-profile-v2","{");localStorage.setItem("bond-bolt-build-v2","null");')
        elif mode=='blocked':
            ctx.add_init_script('Storage.prototype.getItem=Storage.prototype.setItem=function(){throw new Error("Blocked storage fixture");};')
        q.goto((ROOT/'index.html').as_uri() if mode=='file' else url)
        q.wait_for_function('!!window.BondApp')
        check(mode+' storage/startup remains playable',q.evaluate('BondGame.validBuild(BondApp.getBuild())'))
        if mode=='legacy':
            check('Legacy build preserves chosen class and first two skills',q.evaluate("BondApp.getBuild()[0][0].type==='mage' && BondApp.getBuild()[0][0].skills.slice(0,2).join(',')==='hex,frost'"))
            check('Legacy keepsake and scout victory migrate without rewarding twice',q.evaluate("BondProfile.snapshot().inventory.mossbloom===1 && BondProfile.snapshot().defeated.includes('mira') && BondProfile.snapshot().coins===0"))
            check('Legacy source keys are retained',q.evaluate('!!localStorage.getItem("bond-bolt-build-v1") && !!localStorage.getItem("bond-bolt-region-v1")'))
        if mode=='blocked':
            check('Blocked storage displays session-only notice','Session only' in q.locator('#save-status').inner_text())
        q.locator('#tab-loadout').click()
        q.locator('[data-menu="collection"]').click()
        q.evaluate('Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))')
        ctx.set_offline(True)
        q.locator('[data-menu="party"]').click()
        q.locator('[data-menu="collection"]').click()
        check(mode+' works offline with collection',q.locator('.collection-card').count()==10)
        # File mode reads bundled assets even while network access is disabled.
        if mode=='file':
            q.evaluate('Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))')
            check('File mode has all ten decoded collection images',q.locator('.collection-card img').evaluate_all('(images)=>images.every(i=>i.complete&&i.naturalWidth>0)'))
        ctx.close()


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--browser',choices=['chrome','edge'],default='chrome')
    parser.add_argument('--smoke',action='store_true')
    args=parser.parse_args()
    run(args.browser,args.smoke)
