"""Opening UI/mechanics in disposable contexts. Never opens normal player profiles."""
import argparse, functools, hashlib, json, threading, traceback
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--browser',default='chrome',choices=['chrome','edge'])
parser.add_argument('--smoke',action='store_true')
args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[];missing=[]
hashes=lambda:{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
source=hashes()
def check(name,value,detail=None):
    checks.append({'name':name,'pass':bool(value),'detail':detail})
    if not value: print('FAIL '+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page()
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=5))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
        page.wait_for_function('!!window.BondApp',timeout=20000)
        check('Test mode starts with +200% exploration movement speed',page.evaluate('BondRegion.inspect().speed===BondAtlas.BASE_SPEED*3'))
        check('Test mode installs a combat-only 5x playback control',page.locator('#qa-speed-5').count()==1 and not page.locator('#qa-speed-5').is_visible() and page.evaluate('BondApp.playbackSpeed()===1'))
        check('Fresh save opens required creation',page.locator('#character-creation').is_visible())
        page.wait_for_function("document.querySelector('#creation-avatar')?.dataset.previewState==='ready'",timeout=20000)
        check('Creator uses painted Apprentice art instead of old SVG placeholder',page.locator('#creation-avatar canvas.painted-apprentice-preview').is_visible() and page.locator('#creation-avatar svg').count()==0)
        check('Healing requires a created character',page.locator('#qa-heal').is_disabled() and page.evaluate('BondProfile.testing.heal()===false'))
        page.screenshot(path=str(ARTIFACTS/f'opening-creation-{args.browser}.png'))
        print(json.dumps(page.evaluate("""()=>({rules:BondRules.validate(),presentation:BondPresentation.validate(),build:BondApp.getBuild(),
          balance:['dagger','bow'].map(weapon=>{const profile=BondProfile.fresh();profile.character={name:'Rowan',weapon,look:BondOpening.defaultLook};profile.attributes=BondOpening.attributes(weapon);
          return {weapon,fights:['emberfox','stonehorn','tideotter'].map(type=>{let wins=0,hps=[],times=[];
          for(let seed=1;seed<=20;seed++){const build=BondGame.soloBuild('apprentice');build[0][0]=BondOpening.build(profile.character);const h=BondAtlas.home(type),b=new BondGame.Battle(build,{adventure:true,profile,seed,encounter:{kind:'wild',enemies:[{type,level:h.level,skills:BondContent.UNITS[type].default,...BondAdventure.wild(type)}]}}).run();wins+=b.winner===0;hps.push(b.trainer(0).hp/b.trainer(0).maxHp);times.push(b.time);}
          return {type,wins,hp:Math.min(...hps),seconds:times[0]};})};})})"""),indent=2),flush=True)
        check('Content and presentation rules accept apprentice',page.evaluate('!BondRules.validate().length&&!BondPresentation.validate().length'))
        page.locator('#character-name').fill('Rowan')
        preview_variants=[page.locator('#creation-avatar canvas').evaluate('(c)=>c.toDataURL()')]
        page.locator('[data-creation-choice="hair"][data-value="braid"]').click()
        page.wait_for_function("document.querySelector('#creation-avatar')?.dataset.previewState==='ready'")
        preview_variants.append(page.locator('#creation-avatar canvas').evaluate('(c)=>c.toDataURL()'))
        page.locator('[data-creation-choice="face"][data-value="bright"]').click()
        page.wait_for_function("document.querySelector('#creation-avatar')?.dataset.previewState==='ready'")
        preview_variants.append(page.locator('#creation-avatar canvas').evaluate('(c)=>c.toDataURL()'))
        page.locator('[data-creation-choice="hairColor"][data-value="3"]').click()
        page.wait_for_function("document.querySelector('#creation-avatar')?.dataset.previewState==='ready'")
        preview_variants.append(page.locator('#creation-avatar canvas').evaluate('(c)=>c.toDataURL()'))
        page.locator('[data-creation-choice="skinColor"][data-value="4"]').click()
        page.wait_for_function("document.querySelector('#creation-avatar')?.dataset.previewState==='ready'")
        preview_variants.append(page.locator('#creation-avatar canvas').evaluate('(c)=>c.toDataURL()'))
        page.locator('[data-creation-choice="weapon"][data-value="bow"]').click()
        page.wait_for_function("document.querySelector('#creation-avatar')?.dataset.previewState==='ready'")
        preview_variants.append(page.locator('#creation-avatar canvas').evaluate('(c)=>c.toDataURL()'))
        check('Hair, expression, palette and weapon choices visibly repaint preview',len(set(preview_variants))==len(preview_variants))
        page.locator('#create-character').click()
        page.clock.run_for(600)
        check('Creation enters forest alone with chosen name and weapon',page.evaluate("BondProfile.snapshot().character.name==='Rowan'&&BondApp.getBuild()[0][0].type==='apprentice'&&BondApp.getBuild()[0][0].weapon==='bow'&&BondApp.getBuild()[0].slice(1).every(u=>u===null)&&BondProfile.snapshot().map==='clearing-0'"))
        page.wait_for_function("document.querySelector('#region-player canvas.animated-sprite:not([hidden])')?.dataset.frame==='13'",timeout=20000)
        check('Login immediately shows one canonical animated idle sprite',page.evaluate("""()=>{const art=document.querySelector('#region-player .world-art'),visible=[...art.querySelectorAll('.character-sprite')].filter(n=>getComputedStyle(n).display!=='none');return art.querySelectorAll('svg').length===0&&visible.length===1&&visible[0].classList.contains('animated-sprite')&&visible[0].dataset.frame==='13'&&art.querySelector('.painted-apprentice-static').hidden;}""") and 'Rowan' in page.locator('#region-player').inner_text())
        page.keyboard.down('d');page.clock.run_for(300)
        walking_frame=page.locator('#region-player canvas.animated-sprite').get_attribute('data-frame')
        page.keyboard.up('d');page.clock.run_for(300)
        check('First movement animates the same sole sprite without a character swap',walking_frame in {'0','1','2','3'} and page.evaluate("""()=>{const art=document.querySelector('#region-player .world-art'),visible=[...art.querySelectorAll('.character-sprite')].filter(n=>getComputedStyle(n).display!=='none');return visible.length===1&&visible[0].classList.contains('animated-sprite')&&art.querySelector('.painted-apprentice-static').hidden;}"""))
        check('First map renders 96 residents across exactly three low-level species',page.locator('.map-object.wild').count()==96 and page.evaluate('BondProfile.population().every(p=>p.habitat.level>=2&&p.habitat.level<=5)&&new Set(BondProfile.population().map(p=>p.type)).size===3'))
        check('No initial guide NPC and only one tiny main objective',page.locator('.map-object.guide').count()==0 and not page.locator('#region-objectives').is_visible() and page.locator('#world-quest').is_visible() and page.locator('#world-objective').inner_text()=='Hunt Brimbles for a Soul Echo')
        check('Quest tracker names its destination region and map',page.locator('#world-objective-location').inner_text()=='Mosslight · Firstlight Meadow')
        check('No NPC quest marker appears before an NPC objective',page.locator('.quest-marker').count()==0)
        check('Only short awakening text appears in-frame',page.locator('#region-message').inner_text()=='You wake up feeling lost. Where am I?' and page.locator('#world-status').inner_text()=='You wake up feeling lost. Where am I?')
        check('Exploration HUD keeps the three destinations and mapped location in-frame',page.locator('#world-action-menu button').count()==3 and page.locator('#world-minimap').is_visible() and page.locator('#world-map-name').inner_text().lower()=='firstlight meadow' and page.locator('#open-atlas').is_visible())
        page.screenshot(path=str(ARTIFACTS/f'opening-forest-{args.browser}.png'))
        page.reload();page.wait_for_function('!!window.BondApp');page.clock.run_for(200)
        check('Reload preserves identity and does not reopen creator',not page.locator('#character-creation').is_visible() and page.evaluate("BondProfile.snapshot().character.look.skinColor===4&&BondApp.getBuild()[0][0].weapon==='bow'"))
        if not args.smoke:
            checks.extend(page.evaluate((ROOT/'tests/opening_cases.js').read_text(encoding='utf-8')))
            # Exercise the actual first hunt from the saved apprentice, not a
            # forced simulator outcome. Only the QA roll/loot seed is controlled.
            spawn=page.evaluate("""()=>{
              const P=BondProfile,sp=P.population().find(x=>x.present&&x.type==='emberfox');
              const raw=P.snapshot();let seed=1;while(!BondOpening.loot('emberfox','clearing-0',seed).leafdraught)seed++;
              raw.spawns[sp.id].seed=seed;raw.spawns[sp.id].roll=1499;P.testing.replace(raw);
              P.position(BondAtlas.safePoint('clearing-0',{x:sp.x-170,y:sp.y}));BondApp.switchTab('region');return sp;
            }""")
            page.clock.run_for(200)
            page.locator('[data-object="'+spawn['id']+'"]').click()
            page.clock.run_for(3000)
            check('Clicking first wild starts combat without dialogue',page.evaluate('BondApp.isRunning()&&BondApp.getTab()==="battle"') and not page.locator('#npc-dialog').is_visible())
            page.locator('#qa-speed-5').click()
            check('5x combat control changes only playback rate',page.evaluate('BondApp.playbackSpeed()===5') and page.locator('#qa-speed-5').get_attribute('aria-pressed')=='true')
            page.evaluate('BondApp.setPlaybackSpeed(1)')
            check('Named apprentice and weapon render in real combat',page.locator('.fighter[data-id="0-0"] .apprentice-sprite').count()==1 and 'Rowan' in page.locator('.fighter[data-id="0-0"] .fighter-name').inner_text())
            for _ in range(160):
                page.clock.run_for(250)
                if page.evaluate('BondApp.getBattle().ended'): break
            check('Played victory returns immediately with individual loot notifications',page.evaluate('BondApp.getBattle().winner===0&&BondApp.getTab()==="region"') and page.locator('#loot-toasts').is_visible() and page.locator('.loot-toast.echo-drop').count()==1)
            check('First Echo advances the in-frame objective and highlights Bag',page.locator('#world-objective').inner_text()=='Summon Brimble from your Bag' and page.locator('[data-world-menu="inventory"]').evaluate('(b)=>b.classList.contains("tutorial-target")'))
            check('Completed test victory automatically restores the party',page.evaluate('BondAdventure.health(BondProfile.snapshot())===10000&&BondProfile.companions().every(m=>BondAdventure.health(BondProfile.snapshot(),m.id)===10000)'))
            page.wait_for_function("document.querySelector('#region-player canvas.animated-sprite:not([hidden])')?.dataset.frame==='13'",timeout=20000)
            check('Combat return restores the same canonical idle sprite without creator flash',page.evaluate("""()=>{const art=document.querySelector('#region-player .world-art'),visible=[...art.querySelectorAll('.character-sprite')].filter(n=>getComputedStyle(n).display!=='none');return visible.length===1&&visible[0].classList.contains('animated-sprite')&&visible[0].dataset.frame==='13'&&art.querySelector('.painted-apprentice-static').hidden;}"""))
            check('Earned coin, supply and Echo appear as field pickups',page.evaluate('BondProfile.snapshot().coins===6&&BondProfile.snapshot().inventory.leafdraught===3') and 'Leaf Draught' in page.locator('#loot-toasts').inner_text())
            page.screenshot(path=str(ARTIFACTS/f'opening-loot-{args.browser}.png'))
            before=page.evaluate('BondProfile.export()')
            page.evaluate("document.querySelectorAll('.loot-dismiss').forEach(b=>b.click());BondApp.switchTab('battle')")
            page.evaluate('BondApp.finish()')
            check('Reopening battle details does not duplicate loot',page.evaluate('BondProfile.export()')==before)
            # Reproduce the owner's unassisted first-win / second-loss loop.
            coins=page.evaluate('BondProfile.snapshot().coins')
            page.evaluate("""()=>{BondApp.switchTab('region');const P=BondProfile,s=P.snapshot();s.vitality.trainer=100;P.testing.replace(s);const sp=P.population().find(p=>p.type==='emberfox'&&p.present);P.position(BondAtlas.safePoint('clearing-0',{x:sp.x-160,y:sp.y}));BondApp.switchTab('region');if(!BondApp.startRegionBattle(P.beginHunt(sp.id).id))throw Error('Second hunt failed');}""")
            page.clock.run_for(40000)
            check('Forced low-health defeat returns to familiar camp without visiting town',page.evaluate('BondApp.getBattle().winner===1&&BondProfile.snapshot().map==="clearing-0"&&!BondProfile.snapshot().visited.includes("clearing-hub")&&BondAdventure.health(BondProfile.snapshot())===10000') and page.evaluate('BondProfile.snapshot().coins')==coins)
            check('Camp and mapped location remain visible after defeat',page.locator('[data-object="sanctuary:clearing-0"]').is_visible() and page.locator('#world-map-name').inner_text().lower()=='firstlight meadow')
            check('Defeat message names camp and confirms full recovery',page.locator('#region-message').inner_text()=='You recover at Forest camp. Your party is fully rested.')
            page.screenshot(path=str(ARTIFACTS/f'opening-camp-{args.browser}.png'))
            page.locator('[data-world-menu="inventory"]').click()
            check('Bag tutorial highlights the earned Brimble Echo',page.evaluate('BondApp.getTab()==="loadout"&&BondMenu.current()==="inventory"') and page.locator('[data-item="echo:emberfox"].tutorial-target').is_visible())
            page.locator('[data-item="echo:emberfox"]').click()
            check('Selecting the Echo highlights its Summon action',page.locator('[data-summon="emberfox"].tutorial-target').is_visible())
            page.locator('[data-summon="emberfox"]').click();page.locator('#confirm-summon').click()
            check('Apprentice can summon an earned Echo into an independent companion',page.evaluate("BondProfile.companions('emberfox').length===1&&BondProfile.snapshot().inventory['echo:emberfox']===0"))
            check('First summoned companion automatically fills the first open party slot',page.evaluate("BondApp.getBuild()[0][1]?.instanceId===BondProfile.companions('emberfox')[0].id"))
            page.locator('#tab-region').click();page.clock.run_for(300)
            check('The objective finds the Mage while exits remain locked',page.locator('#world-objective').inner_text()=='Find the Mage' and page.locator('[data-object="early:forest-mage"]').count()==1 and not page.evaluate("BondAtlas.unlocked(BondProfile.snapshot(),'clearing-hub')"))
            check('Mage offer is marked by a yellow exclamation mark',page.locator('[data-object="early:forest-mage"][data-quest-marker="offer"] .quest-marker').inner_text()=='!')
            check('Mage offer is also a yellow exclamation mark on the minimap',page.evaluate("""()=>{const q=BondRegion.inspect().questMarkers.find(x=>x.id==='early:forest-mage'),m=BondAtlas.get(BondRegion.inspect().map);if(!q||q.type!=='offer'||q.symbol!=='!')return false;const c=document.querySelector('#world-minimap canvas'),d=c.getContext('2d').getImageData(Math.max(0,Math.round(q.x/m.width*160)-7),Math.max(0,Math.round(q.y/m.height*120)-7),15,15).data;let yellow=0;for(let i=0;i<d.length;i+=4)if(d[i]>230&&d[i+1]>170&&d[i+2]<100&&d[i+3]>0)yellow++;return yellow>20;}"""))
            page.evaluate("""()=>{const e=BondProfile.encounter('early:forest-mage');BondProfile.position(BondAtlas.safePoint('clearing-0',{x:e.x+150,y:e.y}));BondApp.switchTab('region');BondRegion.approachId(e.id);}""");page.clock.run_for(2500)
            check('Mage asks for a second companion and updates the quest',page.locator('#npc-dialog').is_visible() and 'too dangerous' in page.locator('#npc-dialogue').inner_text() and page.locator('#npc-fight').is_disabled() and page.locator('#world-objective').inner_text()=='Get a second companion')
            check('Offer marker clears from field and minimap after the quest is accepted',page.locator('[data-object="early:forest-mage"] .quest-marker').count()==0 and page.evaluate('BondRegion.inspect().questMarkers.length===0'))
            page.locator('#npc-close').click()
            page.evaluate("""()=>{const P=BondProfile,sp=P.population().find(x=>x.type==='bloomslime'&&x.present);P.position(BondAtlas.safePoint('clearing-0',{x:sp.x-160,y:sp.y}));BondApp.switchTab('region');if(!BondApp.startRegionBattle(P.beginHunt(sp.id).id))throw Error('Bloomslime hunt failed');}""")
            page.locator('#qa-speed-5').click();page.clock.run_for(80000)
            check('First second-role victory leaves its guaranteed Echo',page.evaluate("BondApp.getTab()==='region'&&BondProfile.snapshot().inventory['echo:bloomslime']===1"))
            page.locator('[data-world-menu="inventory"]').click();page.locator('[data-item="echo:bloomslime"]').click();page.locator('[data-summon="bloomslime"]').click();page.locator('#confirm-summon').click();page.locator('#tab-region').click();page.clock.run_for(300)
            check('Second summon fills the remaining party slot and updates the quest',page.evaluate("BondApp.getBuild()[0].slice(1).filter(Boolean).length===2") and page.locator('#world-objective').inner_text()=='Return to the Mage' and page.locator('.world-companion-hp').count()==2)
            check('Mage delivery is marked by a yellow question mark in the field and minimap',page.locator('[data-object="early:forest-mage"][data-quest-marker="delivery"] .quest-marker').inner_text()=='?' and page.evaluate("BondRegion.inspect().questMarkers.some(q=>q.id==='early:forest-mage'&&q.type==='delivery'&&q.symbol==='?')"))
            page.evaluate("""()=>{const e=BondProfile.encounter('early:forest-mage');BondProfile.position(BondAtlas.safePoint('clearing-0',{x:e.x+150,y:e.y}));BondApp.switchTab('region');BondRegion.approachId(e.id);}""");page.clock.run_for(2500)
            check('Mage trial becomes available to a two-companion party',page.locator('#npc-dialog').is_visible() and not page.locator('#npc-fight').is_disabled() and 'Two companions' in page.locator('#npc-dialogue').inner_text())
            page.locator('#npc-fight').click();page.locator('#qa-speed-5').click();page.clock.run_for(80000)
            mage_result=page.evaluate("()=>({winner:BondApp.getBattle().winner,reason:BondApp.getBattle().reason,enemies:BondApp.getBattle().units.filter(u=>u.side===1).map(u=>({type:u.type,spawnId:u.spawnId||null})),gate:BondProfile.snapshot().journey.early.mageGate,objective:document.querySelector('#world-objective').textContent})")
            check('Mage trial opens the world and advances to existing progression',mage_result['winner']==0 and mage_result['gate'] and page.evaluate("BondAtlas.unlocked(BondProfile.snapshot(),'clearing-hub')") and 'Tavi' in mage_result['objective'],mage_result)
            page.evaluate("""()=>{const P=BondProfile,party=BondApp.getBuild()[0],dead=party[1].instanceId;BondApp.changeUnit(0,2,null);const s=P.snapshot();s.vitality.companions[dead]=0;P.testing.replace(s);BondApp.switchTab('region');const sp=P.population().find(x=>x.type==='emberfox'&&x.present),e=P.beginHunt(sp.id);window.deadSelected=dead;if(!BondApp.startRegionBattle(e.id))throw Error('Dead-companion hunt did not start');}""")
            check('A dead sole companion is benched without blocking browser combat',page.evaluate("BondApp.isRunning()&&BondApp.getBuild()[0][1].instanceId===deadSelected&&BondApp.getBattle().build[0][1]===null&&BondApp.getBattle().wildPartySize===1"))
            page.evaluate("""()=>{BondApp.cancelRegionBattle();BondProfile.testing.heal();const bloom=BondProfile.companions('bloomslime')[0];BondApp.changeUnit(0,2,bloom.id);BondApp.switchTab('region');}""");page.clock.run_for(300)
            # Unassign for the deliberate territorial defeat scenario.
            page.evaluate("""()=>{BondApp.changeUnit(0,1,null);BondApp.changeUnit(0,2,null);const P=BondProfile,s=P.snapshot();s.vitality.trainer=100;P.testing.replace(s);
              const sp=P.population().find(x=>x.type==='stonehorn'&&x.present);let p;
              for(let i=0;i<24;i++){const q={x:sp.x+150*Math.cos(i*Math.PI/12),y:sp.y+150*Math.sin(i*Math.PI/12)};
                if(!BondAtlas.collision('clearing-0',q)&&BondNav.clear('clearing-0',sp,q,20)){p=q;break;}}
              if(!p)throw Error('No clear QA approach');P.position(p);BondApp.switchTab('region');
            }""")
            page.clock.run_for(500)
            actor=page.evaluate("BondRegion.inspect().actors.find(x=>x.type==='stonehorn'&&Math.hypot(x.x-BondRegion.inspect().position.x,x.y-BondRegion.inspect().position.y)<320)")
            page.evaluate('BondApp.setPlaybackSpeed(1)')
            page.locator('#open-settings').click()
            page.clock.run_for(6000)
            check('An open menu prevents territorial attacks',page.evaluate('BondApp.getTab()==="region"&&!BondApp.isRunning()') and page.locator('#settings-dialog').is_visible())
            page.keyboard.press('Escape')
            warning_seen=False
            for _ in range(80):
                page.clock.run_for(50)
                if page.locator('.wild.alert,.wild.chase').count()>0:
                    warning_seen=True;break
            check('Territorial creature shows a warning before contact',warning_seen and page.evaluate('BondApp.getTab()==="region"'))
            contact_seen=False
            for _ in range(240):
                page.clock.run_for(50)
                if page.evaluate('BondApp.getTab()==="battle"&&BondApp.isRunning()'):
                    contact_seen=True;break
            check('Territorial approach starts real combat without a click',contact_seen and page.evaluate('BondApp.getEncounter().includes("stonehorn")'))
            page.clock.run_for(80000)
            check('Played Firstlight death returns immediately to the forest camp fully healed',page.evaluate('BondApp.getBattle().winner===1&&BondApp.getTab()==="region"&&BondProfile.snapshot().map==="clearing-0"&&BondAdventure.health(BondProfile.snapshot())===10000'))
            page.clock.run_for(300)
            check('Forest camp remains the nearby free recovery service after defeat',page.locator('[data-object="sanctuary:clearing-0"]').count()==1 and page.evaluate('BondProfile.canService("sanctuary")&&BondAdventure.health(BondProfile.snapshot())===10000'))
            for width in [390,768]:
                page.set_viewport_size({'width':width,'height':844});page.clock.run_for(200)
                check(str(width)+'px opening world has no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
            # A second fresh context proves dagger creation and phone layout.
            phone=context.browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
            small=phone.new_page();small.on('pageerror',lambda e:errors.append(str(e)))
            small.goto(f'http://127.0.0.1:{server.server_port}/?test=1');small.wait_for_function('!!window.BondApp')
            small.keyboard.press('Escape')
            check('Creator cannot be dismissed into an uncreated save',small.locator('#character-creation').is_visible())
            small.locator('#character-name').fill('<b>');small.locator('#create-character').click()
            check('Invalid name is explained inline without creating a profile',small.locator('#creation-error').inner_text()!='' and small.evaluate('BondProfile.snapshot().character===null'))
            check('Phone creator fits without horizontal overflow',small.evaluate('document.documentElement.scrollWidth<=innerWidth+2&&document.querySelector("#character-creation").scrollWidth<=document.querySelector("#character-creation").clientWidth+2'))
            small.screenshot(path=str(ARTIFACTS/f'opening-phone-{args.browser}.png'))
            small.locator('#character-name').fill('Ash')
            small.locator('[data-creation-choice="hair"][data-value="crop"]').click()
            small.locator('#create-character').click()
            check('Phone dagger creation preserves distinct choices',small.evaluate("BondApp.getBuild()[0][0].weapon==='dagger'&&BondProfile.snapshot().character.look.hair==='crop'"))
            phone.close()
            # Older saves keep their progress but must claim a real display name once.
            legacy=context.browser.new_context(viewport={'width':768,'height':844})
            legacy.add_init_script("""localStorage.setItem('bond-bolt-profile-v6-sandbox',JSON.stringify({version:6,coins:14,owned:['emberfox'],xp:{emberfox:600},inventory:{biscuit:3}}));""")
            old=legacy.new_page();old.on('pageerror',lambda e:errors.append(str(e)))
            old.goto(f'http://127.0.0.1:{server.server_port}/?test=1');old.wait_for_function('!!window.BondApp')
            check('Migrated adventure opens a one-time name screen',old.locator('#character-creation[data-mode="identity"]').is_visible() and old.locator('[data-creation-choice]').count()==0)
            old.locator('#character-name').fill('Apprentice');old.locator('#create-character').click()
            check('Default Apprentice is rejected as a personal name',old.locator('#character-creation').is_visible() and old.locator('#creation-error').inner_text()!='')
            old.locator('#character-name').fill('Ari');old.locator('#create-character').click();old.wait_for_function("BondProfile.snapshot().character?.name==='Ari'")
            check('Naming a migrated trainer preserves progress and labels the world',old.evaluate("BondProfile.snapshot().coins===14&&BondProfile.snapshot().companions[0].id==='legacy:emberfox'&&BondProfile.snapshot().companions[0].xp===600") and 'Ari' in old.locator('#region-player').inner_text())
            old.reload();old.wait_for_function('!!window.BondApp');old.wait_for_function("BondBoot.inspect().ready")
            check('Claimed legacy name survives reload without reopening the screen',not old.locator('#character-creation').is_visible() and old.evaluate("BondProfile.snapshot().character.name==='Ari'"))
            legacy.close()
            # Visible QA shortcuts must mutate only isolated test progress.
            check('Test UI exposes restart and heal while retaining the combat-only 5x control',page.locator('.test-controls #qa-new-character').is_visible() and page.locator('#qa-new-character').count()==1 and page.locator('#qa-heal').is_visible() and page.locator('#qa-speed-5').count()==1 and not page.locator('#qa-speed-5').is_visible())
            page.evaluate("""()=>{
              localStorage.setItem('bond-bolt-profile-v7',JSON.stringify({version:7,coins:321,character:{legacy:true,name:'Normal Save'}}));
              localStorage.setItem('bond-bolt-build-v4','normal-build-sentinel');
              localStorage.setItem('bond-bolt-profile-v6-sandbox','legacy-test-sentinel');
              const P=BondProfile;P.testing.grantEcho('bloomslime');P.summon('bloomslime');
              const s=P.snapshot();s.vitality.trainer=1234;for(const m of s.companions)s.vitality.companions[m.id]=0;P.testing.replace(s);
            }""")
            untouched=page.evaluate("[localStorage.getItem('bond-bolt-profile-v7'),localStorage.getItem('bond-bolt-build-v4'),localStorage.getItem('bond-bolt-profile-v6-sandbox')]")
            before=page.evaluate('BondProfile.snapshot()')
            page.locator('#qa-heal').click()
            healed=page.evaluate('BondProfile.snapshot()')
            check('Heal restores trainer and all owned companions including fallen reserves',healed['vitality']['trainer']==10000 and len(healed['companions'])>=2 and all(healed['vitality']['companions'][m['id']]==10000 for m in healed['companions']))
            check('Free test heal changes only health and save revision',all(healed[k]==v for k,v in before.items() if k not in ['vitality','revision']))
            check('Heal displays its accepted outcome', 'Fully healed' in page.locator('#test-controls-status').inner_text())
            page.reload();page.wait_for_function('!!window.BondApp')
            check('Test healing persists after reload',page.evaluate('BondProfile.snapshot().vitality.trainer===10000&&BondProfile.companions().every(m=>BondAdventure.health(BondProfile.snapshot(),m.id)===10000)'))
            page.locator('[data-world-menu="inventory"]').click()
            check('Both test controls stay available from the loadout',page.locator('#qa-new-character').is_visible() and page.locator('#qa-heal').is_visible())
            page.locator('#tab-region').click()
            check('Test bar fits narrow screen without horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
            page.set_viewport_size({'width':390,'height':844})
            check('390px test bar fits without horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2') and page.locator('#qa-heal').is_visible())
            page.screenshot(path=str(ARTIFACTS/f'test-controls-{args.browser}.png'))
            page.evaluate("""()=>{const P=BondProfile,s=P.snapshot();s.vitality.trainer=1234;P.testing.replace(s);
              window.qaOriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===P.KEY)throw Error('QA storage full');return window.qaOriginalSet.call(this,k,v);};
            }""")
            page.locator('#qa-heal').click()
            check('Failed save does not falsely heal or claim success',page.evaluate('BondProfile.snapshot().vitality.trainer===1234') and 'Could not save' in page.locator('#test-controls-status').inner_text())
            page.evaluate('Storage.prototype.setItem=window.qaOriginalSet;delete window.qaOriginalSet')
            page.locator('#qa-heal').click()
            page.evaluate("""()=>{BondProfile.travel('clearing-0');BondApp.switchTab('region');
              const sp=BondProfile.population().find(x=>x.type==='emberfox'&&x.present);
              const ticket=BondProfile.beginHunt(sp.id);if(!ticket||!BondApp.startRegionBattle(ticket.id))throw Error('QA fight did not reserve');
            }""")
            check('Reserved fight disables heal and profile command also refuses it',page.locator('#qa-heal').is_disabled() and page.evaluate('BondProfile.testing.heal()===false&&!!BondProfile.snapshot().encounterSave'))
            before=page.evaluate('BondProfile.export()')
            page.once('dialog',lambda dialog:dialog.dismiss());page.locator('#qa-new-character').click()
            check('Cancelled restart retains progress and active fight',page.evaluate('BondProfile.export()')==before and not page.locator('#character-creation').is_visible())
            page.evaluate("""()=>{window.qaOriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===BondProfile.KEY)throw Error('QA storage full');return window.qaOriginalSet.call(this,k,v);};}""")
            page.once('dialog',lambda dialog:dialog.accept());page.locator('#qa-new-character').click()
            check('Failed restart preserves progress and active reservation',page.evaluate('BondProfile.export()')==before and page.evaluate('BondApp.isRunning()') and 'Could not save' in page.locator('#test-controls-status').inner_text())
            page.evaluate('Storage.prototype.setItem=window.qaOriginalSet;delete window.qaOriginalSet')
            page.once('dialog',lambda dialog:dialog.accept());page.locator('#qa-new-character').click()
            check('Confirmed restart from combat reopens creation and stops old fight',page.locator('#character-creation').is_visible() and page.evaluate('!BondApp.isRunning()&&!BondApp.getBattle()&&BondApp.getTab()==="region"'))
            check('Restart clears earned test progress and reservations',page.evaluate("""(()=>{const s=BondProfile.snapshot();return !s.character&&!s.encounterSave&&!s.coins&&!s.companions.length&&!s.tutorial.kills&&!s.tutorial.summons&&!Object.keys(s.claims).length&&!Object.keys(s.summons).length&&!s.defeated.length&&s.map==='clearing-0'&&Object.values(s.echoes).every(x=>!x.length)})()"""))
            check('Restart and heal leave normal and migration keys untouched',page.evaluate("[localStorage.getItem('bond-bolt-profile-v7'),localStorage.getItem('bond-bolt-build-v4'),localStorage.getItem('bond-bolt-profile-v6-sandbox')]")==untouched)
            page.reload();page.wait_for_function('!!window.BondApp')
            check('Restart persists instead of reviving old character on reload',page.locator('#character-creation').is_visible() and page.evaluate('!BondProfile.snapshot().character'))
            page.locator('#character-name').fill('New Journey');page.locator('#create-character').click()
            check('Restarted opening starts alone with default fresh supplies',page.evaluate("BondProfile.snapshot().character.name==='New Journey'&&BondApp.getBuild()[0].slice(1).every(u=>u===null)&&BondProfile.snapshot().inventory.leafdraught===2&&!BondProfile.snapshot().coins"))
            normal=context.new_page();normal.on('pageerror',lambda e:errors.append(str(e)))
            normal.goto(f'http://127.0.0.1:{server.server_port}/');normal.wait_for_function('!!window.BondApp')
            check('Normal mode exposes neither test controls nor testing commands',normal.locator('.test-controls').count()==0 and normal.locator('#qa-speed-5').count()==0 and normal.evaluate('!BondProfile.TEST&&BondProfile.testing===null&&BondProfile.snapshot().coins===321'))
            check('Normal mode keeps standard travel and rejects 5x playback',normal.evaluate('BondRegion.inspect().speed===BondAtlas.BASE_SPEED&&BondApp.playbackSpeed()===1&&!BondApp.setPlaybackSpeed(5)&&BondApp.playbackSpeed()===1'))
            normal.evaluate("""()=>{const s=BondProfile.snapshot();s.map='clearing-hub';s.position=BondAdventure.service(BondAtlas.get(s.map),'sanctuary');s.coins=0;s.inventory={};s.vitality.trainer=0;s.journey.early.introFightWon=true;localStorage.setItem(BondProfile.KEY,JSON.stringify(s));}""")
            normal.reload();normal.wait_for_function('!!window.BondApp');normal.locator('.map-object.sanctuary').click()
            normal.locator('[data-sanctuary-rest]').click()
            check('Normal-mode town healing works for a fallen broke player with no supplies',normal.evaluate('BondProfile.snapshot().coins===0&&Object.keys(BondProfile.snapshot().inventory).length===0&&BondAdventure.health(BondProfile.snapshot())===10000') and 'free' in normal.locator('[data-sanctuary-rest]').inner_text())
            normal.keyboard.press('Escape');normal.locator('#open-atlas').click();normal.locator('[data-atlas-select="clearing-0"]').click();normal.locator('[data-world-travel="clearing-0"]').click()
            check('Town return route starts walking, not teleporting',normal.evaluate('BondProfile.snapshot().map==="clearing-hub"'))
            normal.clock.run_for(12000)
            normal.wait_for_function('BondProfile.snapshot().map==="clearing-0"',timeout=30000)
            check('Clearly labeled town route reaches the starting meadow',normal.evaluate('BondRegion.inspect().map==="clearing-0"'))
            normal.evaluate("BondRegion.approachId('sanctuary:clearing-0')")
            for _ in range(8):
                normal.clock.run_for(5000)
                if normal.locator('#recovery-dialog').is_visible(): break
            normal.locator('#recovery-dialog').wait_for(state='visible',timeout=30000)
            check('Return-to-camp control walks to the real free recovery service',normal.evaluate('BondProfile.canService("sanctuary")') and normal.locator('#recovery-title').inner_text()=='Forest camp')
            normal.close()
    except Exception:
        errors.append(traceback.format_exc())
    check('No JavaScript/test errors',not errors,errors)
    check('No missing assets',not missing,missing)
    check('Runtime unchanged during verification',source==hashes())
    browser.close()
server.shutdown()
report={'browser':args.browser,'checks':checks,'errors':errors,'source_sha256':source}
(ARTIFACTS/f'opening-{args.browser}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'failures':[c for c in checks if not c['pass']],'errors':errors},indent=2),flush=True)
raise SystemExit(0 if checks and all(c['pass'] for c in checks) else 1)
