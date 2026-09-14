"""Targeted opening lifecycle regressions in a disposable browser context."""
import argparse, functools, hashlib, json, threading, traceback
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--browser',default='chrome',choices=['chrome','edge'])
args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[]
hashes=lambda:{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
source=hashes()
def check(name,value):
    checks.append({'name':name,'pass':bool(value)})
    print(('PASS ' if value else 'FAIL ')+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.on('pageerror',lambda e:errors.append(str(e)))
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=5))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
        page.wait_for_function('!!window.BondApp')
        page.locator('#character-name').fill('Lifecycle');page.locator('#create-character').click()
        setup="""()=>{window.qaApproach=(type='emberfox',skip=null)=>{
          const P=BondProfile;const sp=P.population().find(p=>p.type===type&&p.present&&p.id!==skip);
          P.position(BondAtlas.safePoint('clearing-0',{x:sp.x-70,y:sp.y}));BondApp.switchTab('region');return sp.id;
        };window.qaFinish=()=>{const b=BondApp.getBattle();b.run();BondApp.renderBattle();BondApp.finish();};}"""
        page.evaluate(setup)
        page.evaluate("const s=BondProfile.snapshot();s.vitality.trainer=1;BondProfile.testing.replace(s)")
        first=page.evaluate('qaApproach()')
        page.locator('[data-object="'+first+'"]').click()
        check('First clicked fox starts combat',page.evaluate('BondApp.isRunning()'))
        page.evaluate('qaFinish()')
        check('Defeat clears reservation and heals at camp',page.evaluate('!BondProfile.snapshot().encounterSave&&BondAdventure.health(BondProfile.snapshot())===10000&&BondApp.getTab()==="region"'))
        second=page.evaluate('qaApproach()')
        page.locator('[data-object="'+second+'"]').click()
        check('Clicking the same surviving fox after defeat starts a new battle',page.evaluate('BondApp.isRunning()&&!BondApp.getBattle().ended'))
        page.locator('#return-region').click()
        check('Back to region keeps combat running',page.evaluate('!!BondProfile.snapshot().encounterSave&&BondApp.isRunning()'))
        page.locator('#field-withdraw').click()
        page.clock.run_for(3400)
        third=page.evaluate("qaApproach('bloomslime')")
        page.locator('[data-object="'+third+'"]').click()
        check('Another species can be clicked after withdrawal',page.evaluate('BondApp.isRunning()&&BondApp.getEncounter().includes("bloomslime")'))
        page.clock.run_for(2000)
        hp=page.evaluate('BondAdventure.health(BondProfile.snapshot())')
        page.locator('#return-region').click();page.locator('#field-withdraw').click()
        page.clock.run_for(3400)
        check('Running keeps injuries rather than healing',page.evaluate('!!BondApp.getBattle().escaped') and page.evaluate('BondAdventure.health(BondProfile.snapshot())')<=hp)
        # Completed loss through real frame scheduling, followed by real walking from camp.
        page.evaluate("const s=BondProfile.snapshot();s.vitality.trainer=1;BondProfile.testing.replace(s)")
        fox=page.evaluate('qaApproach()');page.locator('[data-object="'+fox+'"]').click();page.clock.run_for(5000)
        check('Frame-driven loss returns healed with no reserved encounter',page.evaluate('BondApp.getTab()==="region"&&!BondProfile.snapshot().encounterSave&&BondAdventure.health(BondProfile.snapshot())===10000'))
        page.locator('[data-object="'+fox+'"]').dispatch_event('click');page.clock.run_for(5000)
        check('Walking from camp to the fox after death really starts combat',page.evaluate('BondApp.isRunning()&&BondApp.getTab()==="battle"'))
        page.evaluate("()=>{window.qaSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===BondProfile.KEY)throw Error('QA full');return qaSet.call(this,k,v);}}")
        page.locator('#tab-loadout').click()
        check('Failed checkpoint does not cancel combat when viewing loadout',page.evaluate('BondApp.getTab()==="loadout"&&BondApp.isRunning()&&!!BondProfile.snapshot().encounterSave'))
        page.evaluate('()=>{Storage.prototype.setItem=qaSet;}')
        page.locator('#tab-loadout').click()
        check('Opening loadout preserves the reservation',page.evaluate('!!BondProfile.snapshot().encounterSave&&BondApp.isRunning()'))
        original=page.evaluate('JSON.stringify(BondApp.getBattle().build)');tick=page.evaluate('BondApp.getBattle().tick')
        page.evaluate("()=>{const skills=BondApp.getBuild()[0][0].skills;BondApp.changeSkills(0,0,[...skills].reverse());}")
        page.clock.run_for(500)
        check('Loadout edits leave the live build intact while ticks advance',page.evaluate('JSON.stringify(BondApp.getBattle().build)')==original and page.evaluate('BondApp.getBattle().tick')>tick)
        page.locator('#tab-region').click();page.locator('#field-withdraw').click()
        page.clock.run_for(3400)
        target=page.evaluate("qaApproach('bloomslime')");page.locator('[data-object="'+target+'"]').click()
        check('Hunt starts after loadout skill editing',page.evaluate('BondApp.isRunning()&&BondApp.getEncounter().includes("bloomslime")'))
        page.evaluate('BondApp.cancelRegionBattle();BondApp.switchTab("region")')
        target=page.evaluate('qaApproach()');page.locator('[data-object="'+target+'"]').click()
        page.locator('#pause').click()
        check('Explicit Pause preserves the encounter',page.evaluate('!BondApp.isRunning()&&!!BondProfile.snapshot().encounterSave'))
        attempt=page.evaluate('BondProfile.snapshot().encounterSave.attempt')
        page.reload();page.wait_for_function('!!window.BondApp');page.evaluate(setup)
        check('Reload exposes the saved battle for resuming',page.locator('#encounter-notice').is_visible())
        page.locator('#field-resume').click()
        check('Resume keeps the original attempt',page.evaluate('BondProfile.snapshot().encounterSave.attempt')==attempt and page.evaluate('BondApp.isRunning()'))
        page.locator('#pause').click();page.reload();page.wait_for_function('!!window.BondApp');page.evaluate(setup)
        before=page.evaluate('BondProfile.export()')
        page.evaluate("()=>{window.qaSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===BondProfile.KEY)throw Error('QA full');return qaSet.call(this,k,v);}}")
        page.locator('#field-withdraw').click()
        check('Failed withdrawal preserves the reservation',page.evaluate('BondProfile.export()')==before and page.locator('#encounter-notice').is_visible())
        page.evaluate('()=>{Storage.prototype.setItem=qaSet;}');page.locator('#field-withdraw').click()
        page.clock.run_for(3400)
        check('Saved-fight banner allows successful withdrawal',not page.locator('#encounter-notice').is_visible() and page.evaluate('!BondProfile.snapshot().encounterSave'))
        for index in range(2):
            page.evaluate('BondProfile.testing.heal()');fox=page.evaluate('qaApproach()')
            page.evaluate('(id)=>BondProfile.testing.setRoll(id,9999)',fox)
            page.locator('[data-object="'+fox+'"]').click();page.evaluate('qaFinish()')
            check(('Introductory victory grants Lv2 and one Emberfox Echo' if index==0 else 'Next ordinary hunt advances trainer XP without duplicating the guarantee'),page.evaluate('BondProgress.trainerLevel(BondProfile.snapshot())')==[2,4][index] and page.evaluate('BondProfile.snapshot().echoes.emberfox.length===1') and page.evaluate('BondProfile.snapshot().journey.early.introFightWon'))
            before=page.evaluate('BondProfile.export()');page.evaluate('BondProfile.complete(BondApp.getBattle(),BondApp.getEncounter())')
            check('Accepted progression does not duplicate on settlement retry '+str(index+1),page.evaluate('BondProfile.export()')==before)
            check('Actual trainer level gain names the event and new level '+str(index+1),page.locator('#level-toast').is_visible() and 'LEVEL UP' in page.locator('#level-toast').inner_text() and 'LV. '+str([2,4][index]) in page.locator('#level-toast').inner_text() and page.locator('#level-toast').evaluate('(e)=>e.parentElement.id')=='region-map')
            if index==0: page.screenshot(path=str(ARTIFACTS/f'onboarding-level-{args.browser}.png'))
            page.evaluate("document.querySelectorAll('.loot-dismiss').forEach(b=>b.click())")
        page.evaluate('BondProfile.testing.heal()');fox=page.evaluate('qaApproach()');page.evaluate('(id)=>BondProfile.testing.setRoll(id,0)',fox)
        page.locator('[data-object="'+fox+'"]').click();page.evaluate('qaFinish()')
        check('Ordinary hunt XP remains separate from the retired Apprentice field',page.evaluate('BondProfile.snapshot().trainerXP===1100&&BondProfile.snapshot().apprenticeXP===0&&BondProgress.trainerLevel(BondProfile.snapshot())===5&&BondProfile.snapshot().echoes.emberfox.length===2'))
        check('First Echo teaches explicit inventory summoning',page.locator('.first-echo-note').is_visible() and 'Inventory' in page.locator('.first-echo-note').inner_text())
        page.locator('#loot-toasts').screenshot(path=str(ARTIFACTS/f'onboarding-echo-{args.browser}.png'))
        page.locator('.loot-inventory').click()
        check('Echo action selects the real owned item and its summon button',page.locator('[data-bag-filter="Echoes"]').get_attribute('aria-pressed')=='true' and page.locator('.satchel-detail [data-summon="emberfox"]').is_visible())
        page.locator('#tab-region').click();page.reload();page.wait_for_function('!!window.BondApp')
        check('Independent trainer XP and unsummoned Echo reminder survive reload',page.evaluate('BondProfile.snapshot().trainerXP===1100&&BondProfile.snapshot().apprenticeXP===0&&BondProgress.trainerLevel(BondProfile.snapshot())===5') and page.locator('#echo-notice').is_visible())
        page.locator('#field-echo').click();page.locator('.satchel-detail [data-summon="emberfox"]').click();page.locator('#confirm-summon').click()
        page.locator('#tab-region').click()
        check('Summoning ends the beginner prompt without reducing trainer level',not page.locator('#echo-notice').is_visible() and page.evaluate('BondProfile.companions("emberfox").length===1&&BondProgress.trainerLevel(BondProfile.snapshot())===5'))
        check('Every map exit has a matching numbered world marker and destination button',page.evaluate('document.querySelectorAll("#map-exits [data-exit]").length===BondAtlas.get(BondProfile.snapshot().map).neighbors.length&&document.querySelectorAll(".gate-badge").length===document.querySelectorAll("#map-exits [data-exit]").length'))
        page.screenshot(path=str(ARTIFACTS/f'onboarding-exits-{args.browser}.png'),full_page=True)
        for width in [390,768]:
            page.set_viewport_size({'width':width,'height':844});page.clock.run_for(200)
            check('Exit navigation fits width '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
        page.set_viewport_size({'width':1440,'height':1000});page.clock.run_for(200)
        page.evaluate("()=>{BondProfile.position({x:620,y:4900});BondApp.switchTab('region')}")
        mini=page.locator('#world-minimap canvas').bounding_box()
        point=page.evaluate("(()=>{const m=BondAtlas.get('clearing-0'),g=m.neighbors.find(g=>g.to==='clearing-hub');return {x:Math.max(8,Math.min(152,g.x/m.width*160)),y:Math.max(8,Math.min(112,g.y/m.height*120))}})()")
        page.locator('#world-minimap canvas').click(position={'x':point['x']/160*mini['width'],'y':point['y']/120*mini['height']});page.clock.run_for(4000)
        check('Numbered minimap exit stays locked until the Forest Mage trial',page.evaluate('BondProfile.snapshot().map==="clearing-0"&&!BondAtlas.unlocked(BondProfile.snapshot(),"clearing-hub")') and 'LOCKED' in page.locator('.gate-badge').first.inner_text())
        page.locator('#region-map').screenshot(path=str(ARTIFACTS/f'onboarding-gate-{args.browser}.png'))
        recovery_companion=page.evaluate('BondProfile.companions()[0].id');page.evaluate('BondApp.changeUnit(0,1,null)')
        page.evaluate("""()=>{const P=BondProfile;P.travel('clearing-0',BondOpening.start.position);const s=P.snapshot();s.vitality.trainer=1;P.testing.replace(s);BondApp.switchTab('region');
          const sp=P.population().find(p=>p.type==='emberfox'&&p.present);BondApp.startRegionBattle(P.beginHunt(sp.id).id);const b=BondApp.getBattle();b.run();P.checkpoint(b);
        }""")
        before=page.evaluate('BondProfile.snapshot().trainerXP')
        page.reload();page.wait_for_function('!!window.BondApp')
        check('Interrupted terminal fight exposes recovery controls after reload',page.locator('#encounter-notice').is_visible())
        page.locator('#field-withdraw').click()
        check('Withdrawing from a saved completed defeat settles camp rescue',page.evaluate('!BondProfile.snapshot().encounterSave&&BondAdventure.health(BondProfile.snapshot())===10000&&BondProfile.snapshot().map==="clearing-0"'))
        check('Defeat does not grant trainer XP',page.evaluate('BondProfile.snapshot().trainerXP')==before)
        check('Recovered companion can return to the party after reload',page.evaluate('(id)=>BondApp.autoAssign(id)',recovery_companion))
        page.evaluate(setup)
        fox=page.evaluate('qaApproach()');page.locator('[data-object="'+fox+'"]').click()
        page.locator('#pause').click();page.reload();page.wait_for_function('!!window.BondApp');page.evaluate(setup)
        saved_attempt=page.evaluate('BondProfile.snapshot().encounterSave.attempt')
        page.locator('#field-resume').click();page.locator('#tab-region').click()
        check('Explore retains the resumed attempt',page.evaluate('BondProfile.snapshot().encounterSave.attempt')==saved_attempt and page.evaluate('BondApp.isRunning()'))
        check('World participants carry crossed swords',page.locator('#region-player').get_attribute('class').find('world-battling')>=0 and page.locator('.map-object.world-battling').count()>=1)
        anchor=page.evaluate('BondRegion.inspect().position')
        page.keyboard.press('d');page.clock.run_for(200)
        check('Engaged trainer cannot walk away',page.evaluate('BondRegion.inspect().position')==anchor)
        page.locator('#field-withdraw').click()
        page.clock.run_for(3400)
        sign=page.evaluate("""()=>{const m=BondAtlas.get('clearing-0');BondProfile.position(BondAtlas.safePoint(m.id,{x:m.shelter.x,y:m.shelter.y+90}));BondApp.switchTab('region');return 'sight:'+m.id+':spring';}""")
        node=page.locator('[data-object="'+sign+'"]')
        check('Sheltered spring uses the painted road sign, not a green marker',node.locator('.landmark-art').count()==0 and 'road-sign' in node.get_attribute('class'))
        check('Spring sign hit bounds match the rendered sign',page.evaluate("""()=>{const p=WorldRenderer.bounds('clearing-0:rest'),e=document.querySelector('[data-object="sight:clearing-0:spring"]');return !!p&&Math.abs(parseFloat(e.style.left)-p.x)<1&&Math.abs(parseFloat(e.style.width)-p.width)<1;}"""))
        node.click();page.clock.run_for(300)
        check('Clicking the painted spring sign opens local information',page.locator('#exploration-dialog').is_visible())
        text=page.locator('#exploration-title').evaluate('(e)=>e.parentElement.textContent')
        check('Local description omits replacement and Echo probability text','Sheltered spring' in text and 'immediate replacement' not in text and 'per kill' not in text and '15%' not in text)
        page.locator('#exploration-title').locator('..').screenshot(path=str(ARTIFACTS/f'onboarding-sign-{args.browser}.png'))
        page.locator('#explore-close').click()
        page.evaluate("""()=>{
          BondProfile.testing.heal();
          const P=BondProfile,pop=P.population(),fox=pop.find(x=>x.type==='emberfox'),stone=pop.find(x=>x.type==='stonehorn');
          const actor=BondRegion.inspect().actors.find(x=>x.id===stone.id),point=BondAtlas.safePoint('clearing-0',{x:(actor?.x??stone.x)-110,y:actor?.y??stone.y});
          P.position(point);BondApp.switchTab('region');
          window.joinId=stone.id;
          window.joinEncounter=P.beginHunt(fox.id).id;BondApp.startRegionBattle(joinEncounter);
          window.live=BondApp.getBattle();window.liveNode=document.querySelector('.fighter[data-id="0-0"]');window.anchorStart=BondRegion.inspect().position;
        }""")
        page.locator('#tab-loadout').click();page.clock.run_for(2500)
        check('Territorial monster reaches and joins while viewing Loadout',page.evaluate('live.units.some(u=>u.spawnId===joinId)&&BondProfile.snapshot().encounterSave.joins.length===1'))
        check('Join does not replace the battle or move its anchor',page.evaluate('BondApp.getBattle()===live&&JSON.stringify(BondProfile.snapshot().encounterSave.anchor.position)===JSON.stringify(anchorStart)'))
        check('Joining preserves existing animated actor nodes',page.evaluate('document.querySelector(\'.fighter[data-id="0-0"]\')===liveNode&&CombatView.inspect().rigs===live.units.length'))
        check('Same spawn cannot join twice',page.evaluate('!BondProfile.joinBattle(live,joinId,anchorStart)'))
        page.evaluate('BondProfile.checkpoint(live)')
        check('Join replay restores identical combat state',page.evaluate("""()=>{
          const replay=BondProfile.restoreBattle(joinEncounter);
          const shape=b=>JSON.stringify({tick:b.tick,units:b.units,events:b.events,winner:b.winner});
          return shape(replay)===shape(live);
        }"""))
        page.locator('#tab-region').click();page.clock.run_for(200)
        page.locator('#region-map').screenshot(path=str(ARTIFACTS/f'onboarding-anchored-{args.browser}.png'))
        page.locator('#field-withdraw').click()
        page.clock.run_for(3400)
        page.evaluate('BondProfile.testing.heal()');fox=page.evaluate('qaApproach()')
        page.locator('[data-object="'+fox+'"]').click();page.locator('#tab-loadout').click();page.evaluate('qaFinish()')
        check('Background victory does not pull player out of Loadout',page.evaluate('BondApp.getTab()==="loadout"&&!BondProfile.snapshot().encounterSave'))
        check('Reward notification is nonmodal',page.evaluate('document.querySelectorAll(".loot-toast").length>0&&!document.querySelector("#loot-popup")'))
        page.mouse.move(0,0);page.clock.run_for(7000)
        check('Reward notification disappears automatically',not page.locator('#loot-toasts').is_visible())
        check('Ordinary UI omits obsolete summoning claims and odds',page.evaluate('!/(echo.{0,24}(100%|15%)|summon.{0,24}100%|certain bond|No capture toggle|papyrus)/i.test(document.querySelector("#panel-loadout").innerText)'))
        page.evaluate("""()=>{
          BondApp.cancelRegionBattle();BondProfile.testing.heal();
          const P=BondProfile,npc=BondCampaign.trainers.find(e=>e.map==='clearing-0');
          window.rewardNpc=npc;BondApp.startRegionBattle(npc.id);
          window.rewardBattle=BondApp.getBattle();window.rewardSpawn=P.population().find(x=>x.type==='emberfox'&&x.present);
          P.testing.setRoll(rewardSpawn.id,0);
          window.rewardBefore=P.snapshot().coins;
          window.saveWrite=Storage.prototype.setItem;
          Storage.prototype.setItem=function(k,v){if(k===P.KEY)throw Error('QA full');return saveWrite.call(this,k,v);};
        }""")
        check('Failed join save leaves simulator unchanged',page.evaluate('!BondApp.joinWild(rewardSpawn.id,BondRegion.inspect().position)&&!rewardBattle.units.some(u=>u.spawnId===rewardSpawn.id)'))
        page.evaluate('()=>{Storage.prototype.setItem=saveWrite;}')
        check('Joining an NPC fight succeeds after storage recovers',page.evaluate('!!BondApp.joinWild(rewardSpawn.id,BondRegion.inspect().position)'))
        page.evaluate("""()=>{
          for(const u of rewardBattle.units.filter(u=>u.side===1))u.hp=0;
          rewardBattle.checkEnd();BondApp.renderBattle();BondApp.finish();
        }""")
        check('NPC victory plus joined wild kill pay separate rewards',page.evaluate('BondProfile.snapshot().coins===rewardBefore+rewardNpc.coins+6&&BondProfile.snapshot().defeated.includes(rewardNpc.id)'))
        receipt=page.evaluate('BondProfile.export()');page.evaluate('BondProfile.complete(rewardBattle,rewardNpc.id)')
        check('Mixed encounter retry cannot duplicate rewards',page.evaluate('BondProfile.export()')==receipt)
    except Exception:
        errors.append(traceback.format_exc())
    check('No browser or harness errors',not errors)
    check('Runtime unchanged',source==hashes())
    browser.close()
server.shutdown()
report={'checks':checks,'errors':errors,'source_sha256':source}
(ARTIFACTS/f'onboarding-{args.browser}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report['errors']),flush=True)
raise SystemExit(0 if checks and all(c['pass'] for c in checks) else 1)
