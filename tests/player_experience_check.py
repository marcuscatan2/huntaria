"""Player copy, Inner Sea routes, dummy metrics and one-time NPC victories."""
import argparse,functools,json,threading,traceback
from datetime import datetime,timedelta,timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,legacy_adventure,sync_playwright

parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome',choices=['chrome','edge']);args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[]
def check(name,value):
    checks.append({'name':name,'pass':bool(value)});print(('PASS ' if value else 'FAIL ')+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1000});legacy_adventure(page)
    page.on('pageerror',lambda e:errors.append(str(e)))
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=1))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1');page.wait_for_function('!!window.BondApp')
        page.evaluate("""()=>{const P=BondProfile,s=P.snapshot();s.trainerXP=BondProgress.threshold(30);s.journey.early.mageGate=true;s.journey.early.introFightWon=true;
          s.companions=['emberfox','bloomslime'].map((type,i)=>({id:'copy:'+i,type,ordinal:1,xp:BondProgress.threshold(30),growth:{},skills:BondContent.UNITS[type].default}));
          s.inventory.biscuit=2;P.testing.replace(s);BondApp.changeUnit(0,1,'copy:0');BondApp.changeUnit(0,2,'copy:1');P.prepare();
          BondApp.switchTab('loadout');BondMenu.open('party');}""")
        check('Party management is inside Inner Sea',page.evaluate('BondMenu.current()==="collection"&&BondMenu.section()==="party"') and page.locator('.game-menu-heading h2').inner_text()=='Inner Sea')
        check('Main menu separates Class Skill Tree from party controls',page.locator('.menu-nav button').all_text_contents()==['Inner Sea','Inventory','Class Skill Tree'])
        page.locator('.menu-content').evaluate('(e)=>e.scrollTop=e.scrollHeight')
        page.evaluate("BondMenu.open('formation')")
        check('Switching Inner Sea sections starts at the top',page.locator('.menu-content').evaluate('(e)=>e.scrollTop')==0)
        page.evaluate("BondMenu.open('party')")
        check('Skills have a concise heading and attack basis',page.locator('.ability-heading h3').inner_text()=='Combat Skills' and page.locator('.reach-note').inner_text()=='Atk: INT Based')
        page.evaluate("BondTree.select('copy:0')")
        check('Companion mastery stays in the Inner Sea',page.evaluate('BondMenu.current()==="collection"&&BondMenu.section()==="mastery"') and page.locator('.tree-pickers [data-class-tree]').count()==0)
        page.locator('[data-menu="trees"]').click()
        check('Class Skill Tree contains classes only',page.locator('.game-menu-heading h2').inner_text()=='Class Skill Tree' and page.locator('#pick-tree-companion').count()==0 and 'Brimble #1' not in page.locator('.library-heading').inner_text())
        banned=['launch cap','launch level','prototyp','changes affect','independent','per ready action','adventure health','choose the order','your opening moves','three skills. your priorities','enemies aim','formation sets']
        for route in ['trainer','formation','party','inventory','trees','collection']:
            page.evaluate('(route)=>BondMenu.open(route)',route)
            text=page.locator('#teams').inner_text().lower()
            check('Concise player text: '+route,not any(word in text for word in banned))
        page.evaluate("BondMenu.open('party')");before=page.evaluate('BondProfile.export()')
        page.locator('#fight').click()
        check('Dummy test starts against one stationary dummy',page.evaluate('BondApp.isRunning()&&BondApp.getBattle().training&&BondApp.getBattle().team(1).length===1&&BondApp.getBattle().team(1)[0].appearance==="training-dummy"'))
        check('Zero-time rates are finite',page.evaluate('Object.values(BondTraining.report(BondApp.getBattle()).total).every(x=>typeof x!=="number"||Number.isFinite(x))'))
        page.clock.run_for(1000);page.locator('#pause').click();tick=page.evaluate('BondApp.getBattle().tick');page.clock.run_for(500)
        check('Dummy pause holds simulation and metrics',page.evaluate('BondApp.getBattle().tick')==tick)
        page.locator('#start-battle').click();page.locator('#qa-speed-5').click();page.clock.run_for(250)
        check('Dummy supports accelerated playback',page.evaluate('BondApp.getBattle().tick')>tick+12)
        page.evaluate('BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()')
        report=page.evaluate('BondTraining.report(BondApp.getBattle())')
        check('Thirty-second test reports party and every individual',report['seconds']==30 and len(report['rows'])==3 and report['total']['dps']>0 and report['total']['hps']>0 and report['total']['sps']>0)
        check('Dummy stats replace the ordinary battle sidebar',page.locator('.battle-sidebar').is_hidden() and page.locator('#training-results').is_visible())
        for field,rate in [('damage','dps'),('healing','hps'),('shield','sps')]:
            check(field+' totals and rates agree',sum(r[field] for r in report['rows'])==report['total'][field] and abs(report['total'][field]/30-report['total'][rate])<1e-9)
        check('Training preserves health, XP, inventory and prepared supplies',page.evaluate('BondProfile.export()')==before)
        check('Dummy never moves or triggers ordinary overtime',page.evaluate('!BondApp.getBattle().overcharge&&BondApp.getBattle().team(1)[0].position.x===76&&BondApp.getBattle().team(1)[0].position.y===56'))
        page.locator('#training-results').screenshot(path=str(ARTIFACTS/f'dummy-results-desktop-{args.browser}.png'))
        for width in [320,390,768]:
            page.set_viewport_size({'width':width,'height':844});page.clock.run_for(32)
            check('Dummy report fits width '+str(width),page.locator('#training-results').evaluate('(e)=>e.scrollWidth<=e.clientWidth+2') and page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
            if width==390: page.locator('#training-results').screenshot(path=str(ARTIFACTS/f'dummy-results-phone-{args.browser}.png'))
        page.evaluate("BondApp.switchTab('loadout');BondMenu.open('party')");page.locator('#dummy-pressure').uncheck();page.locator('#fight').click()
        page.evaluate('BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()')
        check('Incoming damage can be disabled',page.evaluate('BondApp.getBattle().team(0).every(u=>u.hp===u.maxHp)&&BondTraining.report(BondApp.getBattle()).total.healing===0'))
        math=page.evaluate("""()=>{const b=new BondGame.Battle(BondApp.getBuild(),{training:true,profile:BondProfile.snapshot(),trainingPressure:false}),t=b.trainer(0);
          b.events=[];t.shield=0;b.shield(t,t,100,5,'First');b.shield(t,t,140,5,'Refresh');b.time=2;
          const r=BondTraining.report(b);return r.total.shield===140&&r.total.sps===70;}""")
        check('Shield rate counts added protection without double-counting refreshes',math)
        page.set_viewport_size({'width':1440,'height':1000});page.evaluate("BondApp.cancelRegionBattle();BondProfile.travel('clearing-hub');BondProfile.testing.heal();BondApp.startRegionBattle('story:clearing:0');BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()")
        check('NPC victory displays a banner after accepted settlement',page.evaluate('BondApp.getBattle().winner===0&&BondProfile.snapshot().defeated.includes("story:clearing:0")') and page.locator('#victory-banner').is_visible())
        check('Ordinary battles keep their journal',page.locator('.battle-sidebar .journal').is_visible())
        page.clock.run_for(1900);check('Victory remains for two real seconds at 5x playback',page.evaluate('BondApp.getTab()==="battle"'))
        page.clock.run_for(150);check('Victory returns automatically to exploration',page.evaluate('BondApp.getTab()==="region"') and page.locator('#victory-banner').is_hidden())
        check('Defeated NPC cannot be challenged again',page.evaluate('!BondProfile.validEncounter("story:clearing:0")&&!BondApp.startRegionBattle("story:clearing:0")'))
        page.reload();page.wait_for_function('!!window.BondApp')
        check('NPC completion survives reload',page.evaluate('!BondProfile.validEncounter("story:clearing:0")'))
        page.evaluate("()=>{const n=BondWorld.NPCS['story:clearing:0'];BondProfile.position({x:n.x,y:n.y+80});BondApp.switchTab('region');}")
        page.clock.run_for(100);page.locator('[data-object="story:clearing:0"]').click();page.clock.run_for(100)
        check('Defeated NPC dialogue has no challenge action',page.locator('#npc-fight').is_hidden())
        fresh=browser.new_page(viewport={'width':390,'height':844})
        fresh.on('pageerror',lambda e:errors.append(str(e)))
        fresh.goto(f'http://127.0.0.1:{server.server_port}/?test=1');fresh.wait_for_function('!!window.BondApp')
        fresh.locator('#character-name').fill('New adventurer');fresh.locator('#create-character').click()
        fresh.evaluate("BondApp.switchTab('loadout');BondMenu.open('trees')")
        text=fresh.locator('#teams').inner_text()
        check('A new trainer sees class requirements without companion summoning instructions','Choose a class at Lv 20.' in text and 'SUMMON TO TRAIN' not in text and 'Summon this companion' not in text)
        fresh.close()
    except Exception:
        errors.append(traceback.format_exc())
    check('No browser or harness errors',not errors);browser.close()
server.shutdown()
(ARTIFACTS/f'player-experience-{args.browser}.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2),encoding='utf-8')
print(json.dumps(errors,indent=2));raise SystemExit(0 if checks and all(c['pass'] for c in checks) and not errors else 1)
