"""Fixed-lifetime loot, field HP, foliage crops and saved combat escape regressions."""
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
        page.locator('#character-name').fill('Wayfarer');page.locator('#create-character').click()
        setup="""()=>{
          window.qaHunt=()=>{BondApp.cancelRegionBattle();BondProfile.travel('clearing-0');BondProfile.testing.heal();
            const P=BondProfile,s=P.snapshot();s.apprenticeXP=1000;P.testing.replace(s);
            const sp=P.population().find(p=>p.type==='emberfox'&&p.present);
            P.position(BondAtlas.safePoint(s.map,{x:sp.x-70,y:sp.y}));BondApp.switchTab('region');
            BondApp.startRegionBattle(P.beginHunt(sp.id).id);return sp.id;};
          window.qaShape=b=>JSON.stringify({tick:b.tick,units:b.units,events:b.events,escape:b.escape,escaped:b.escaped,ended:b.ended,winner:b.winner});
        }"""
        page.evaluate(setup)
        # Simulated ordinary battle, without a receipt stub: focus and hover
        # were both capable of cancelling the old timer forever.
        page.evaluate('qaHunt();BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()')
        check('Victory returns directly to the field',page.evaluate('BondApp.getTab()==="region"&&!BondProfile.snapshot().encounterSave'))
        # Inspect transient loot in a sanctuary: nearby roaming enemies can otherwise
        # start another battle and hide the field while a screenshot is settling.
        page.evaluate("BondProfile.travel('clearing-hub');BondApp.switchTab('region')")
        saved=page.evaluate('BondProfile.export()')
        page.evaluate('window.qaFirstToasts=[...document.querySelectorAll(".loot-toast")]');page.locator('.loot-dismiss').first.focus();page.locator('.loot-dismiss').first.hover()
        check('Loot pickups are contained inside the exploration frame',page.evaluate('''()=>{
          const h=document.querySelector('#loot-notifications'),f=document.querySelector('#region-map'),a=h.getBoundingClientRect(),b=f.getBoundingClientRect();
          return h.parentElement===f&&a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom;
        }'''))
        check('Loot presents as icon pickups without a browser-card border',page.locator('.loot-toast').first.evaluate('(e)=>{const s=getComputedStyle(e);return s.borderTopStyle==="none"&&getComputedStyle(e.querySelector(".loot-toast-icon")).borderRadius==="50%";}'))
        page.clock.run_for(2900)
        check('Hovered/focused loot remains readable before its deadline',page.locator('.loot-toast').count()>0)
        page.clock.run_for(200)
        check('Each hovered/focused item expires after three seconds',page.evaluate('qaFirstToasts.every(e=>!e.isConnected)'))
        check('Dismissing a notification does not change inventory',page.evaluate('BondProfile.export()')==saved)
        check('Loot uses individual articles, not a battle window',page.evaluate('!document.querySelector("#loot-popup,.loot-heading,.loot-grid")&&document.querySelector("#loot-toasts").getAttribute("role")==="log"'))
        # Presentation-only fixtures: the real receipt/storage path above and
        # below is unchanged. No fixture grants items through the UI.
        page.evaluate("""()=>{window.qaNotify=result=>{const original=BondProfile.complete,b={};try{BondProfile.complete=()=>result;BondLoot.show(b,'toast-fixture');BondLoot.show(b,'toast-fixture');}finally{BondProfile.complete=original;}};}""")
        page.evaluate('qaNotify({loot:{},coins:6,xp:100})')
        check('Coins and XP each get their own popup without duplicates',page.locator('.loot-toast').count()==2 and page.locator('.loot-toast[data-item="coins"] .loot-quantity').inner_text()=='+6' and page.locator('.loot-toast[data-item="xp"] .loot-quantity').inner_text()=='+100')
        page.locator('[data-world-menu="inventory"]').click()
        check('Reward popups leave the underlying Bag navigation clickable',page.evaluate('BondApp.getTab()==="loadout"&&BondMenu.current()==="inventory"'))
        page.locator('.frame-destinations [data-menu-close]').click();page.evaluate("BondApp.switchTab('region')")
        page.clock.run_for(1000);page.evaluate('qaNotify({loot:{leafdraught:2},coins:0,xp:0})')
        check('An item stack shows its own icon, name and quantity',page.locator('.loot-toast[data-item="leafdraught"] .bag-icon').count()==1 and page.locator('.loot-toast[data-item="leafdraught"] .loot-quantity').inner_text()=='×2')
        page.clock.run_for(2100)
        check('Later loot neither resets nor inherits earlier timers',page.locator('.loot-toast').count()==1 and page.locator('.loot-toast[data-item="leafdraught"]').is_visible())
        page.clock.run_for(1000);check('Later item expires on its own deadline',page.locator('.loot-toast').count()==0)
        page.evaluate('qaNotify({loot:{leafdraught:1,biscuit:1,mossbloom:1,riverstone:1,amberleaf:1,moonshard:1},coins:3,xp:40});window.qaWave=[...document.querySelectorAll(".loot-toast")];')
        check('Large drops display at most four independent popups',page.locator('.loot-toast').count()==4)
        page.clock.run_for(200)
        page.screenshot(path=str(ARTIFACTS/f'loot-items-{args.browser}.png'))
        page.clock.run_for(2900)
        check('Queued items appear after earlier items expire',page.locator('.loot-toast').count()==4 and page.evaluate('qaWave.every(e=>!e.isConnected)'))
        page.clock.run_for(1800)
        check('Queued items get their own full three seconds',page.locator('.loot-toast').count()==4)
        page.set_viewport_size({'width':390,'height':844})
        check('Individual loot stack fits a phone viewport',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2&&document.querySelector("#loot-notifications").getBoundingClientRect().top>=0'))
        page.locator('#loot-notifications').screenshot(path=str(ARTIFACTS/f'loot-items-phone-{args.browser}.png'))
        page.clock.run_for(1200);page.set_viewport_size({'width':1440,'height':1000})
        check('All queued popups disappear without inventory changes',page.locator('.loot-toast').count()==0 and page.evaluate('BondProfile.export()')==saved)
        # Return to a field before testing injury thresholds: city arrival heals.
        page.evaluate("BondProfile.travel('clearing-0',BondOpening.start.position);BondApp.switchTab('region')")
        # World health reads saved vitality outside combat and live HP in it.
        for value,tone in [(10000,'green'),(5001,'green'),(5000,'yellow'),(3500,'yellow'),(3499,'red'),(0,'red')]:
            page.evaluate('(hp)=>{const s=BondProfile.snapshot();s.vitality.trainer=hp;BondProfile.testing.replace(s);BondApp.switchTab("region");}',value)
            check('Health threshold '+str(value),page.locator('.world-player-hp').get_attribute('data-tone')==tone)
            check('Health fill '+str(value),abs(page.locator('.world-player-hp i').evaluate('(e)=>parseFloat(e.style.width)')-value/100)<.001)
        check('Health track is a fixed 46px by 3px line',page.locator('.world-player-hp').evaluate('(e)=>{const s=getComputedStyle(e);return s.width==="46px"&&s.height==="3px";}'))
        page.evaluate('qaHunt();BondApp.getBattle().trainer(0).hp=BondApp.getBattle().trainer(0).maxHp*.4;BondApp.switchTab("region")')
        # Change HP after checkpoint: the field must use live, not persisted HP.
        page.evaluate('BondApp.getBattle().trainer(0).hp=BondApp.getBattle().trainer(0).maxHp*.3;BondRegion.frame(performance.now()+16)')
        check('World bar follows live combat HP',page.locator('.world-player-hp').get_attribute('aria-valuenow')=='30')
        page.locator('#region-map').screenshot(path=str(ARTIFACTS/f'field-health-{args.browser}.png'))
        # Pure mechanics: close, fast pursuer can land an ordinary hit; allies
        # still cover, attacks/guards/dodge retain the ordinary resolution path.
        outcomes=page.evaluate("""()=>{
          const G=BondGame,out=[],test=(name,pass)=>out.push({name,pass:!!pass});
          const b=new G.Battle(G.defaultBuild()),t=b.trainer(0),enemy=b.units.find(u=>u.id==='1-1');
          t.position={x:45,y:55};enemy.position={x:57,y:55};enemy.moveSpeed=10;enemy.skills=[];enemy.cds=[];enemy.power=10;enemy.actionRemaining=0;
          b.units.filter(u=>u.side===1&&u!==enemy).forEach(u=>{u.skills=[];u.cds=[];u.power=0;u.actionRemaining=999;});
          const before=t.hp,startX=t.position.x;
          test('Escape request accepted once',b.requestEscape()&&!b.requestEscape());
          test('Pursuer explicitly targets the fleeing trainer',b.target(enemy)===t);
          for(let i=0;i<59;i++)b.step();
          test('Escape does not finish early',!b.ended);
          test('Trainer retreats toward the left boundary',t.position.x<startX);
          test('Enemies can damage the fleeing trainer',t.hp<before&&b.events.some(e=>e.kind==='damage'&&e.target===t.id));
          test('Fleeing trainer does not attack or cast',t.damage===0&&t.casts===0);
          test('Companions keep covering the escape',b.units.some(u=>u.side===0&&u.slot>0&&(u.damage>0||u.casts>0)));
          b.step();test('Surviving 60 ticks ends in escape, not victory',b.escaped&&b.ended&&b.winner===null&&b.tick===60);
          const lost=new G.Battle(G.soloBuild()),lt=lost.trainer(0);lt.hp=1;lost.requestEscape();lt.status.burn={next:.05,until:2,source:'1-1'};lost.step();
          test('Lethal damage during retreat defeats the trainer',lost.ended&&!lost.escaped&&lost.winner===1);
          const win=new G.Battle(G.defaultBuild());win.requestEscape();win.damage(win.units[1],win.trainer(1),100000,false);win.step();
          test('Enemy defeat during retreat remains a normal victory',win.ended&&win.winner===0&&!win.escaped);
          return out;
        }""")
        for c in outcomes: check(c['name'],c['pass'])
        spawn=page.evaluate('qaHunt()');before=page.evaluate('BondProfile.snapshot().coins')
        page.locator('#run-battle').click()
        check('Run button begins a saved escape and stays in combat',page.evaluate('!!BondProfile.snapshot().encounterSave.escape&&BondApp.isRunning()&&!BondApp.getBattle().ended') and page.locator('#run-battle').is_disabled())
        page.clock.run_for(900)
        page.locator('#tab-loadout').click();page.clock.run_for(400)
        check('Running continues behind Loadout',page.evaluate('BondApp.getBattle().tick>=24&&BondApp.isRunning()'))
        page.evaluate('BondProfile.checkpoint(BondApp.getBattle())')
        shape=page.evaluate('qaShape(BondApp.getBattle())')
        check('Escape replay is identical',page.evaluate('qaShape(BondProfile.restoreBattle(BondApp.getEncounter()))')==shape)
        page.reload();page.wait_for_function('!!window.BondApp');page.evaluate(setup)
        page.locator('#field-resume').click()
        check('Reload resumes the same escape tick and state',page.evaluate('qaShape(BondApp.getBattle())')==shape)
        page.locator('#tab-loadout').click();page.clock.run_for(2200)
        check('Background escape releases the encounter without changing tabs',page.evaluate('BondApp.getBattle().escaped&&!BondProfile.snapshot().encounterSave&&BondApp.getTab()==="loadout"'))
        check('Escape grants no unearned coins or recovery',page.evaluate('BondProfile.snapshot().coins')==before and page.evaluate('!BondProfile.complete(BondApp.getBattle(),BondApp.getEncounter()).rescued'))
        check('Escaped-from creature retains its spawn life',page.evaluate('(id)=>BondProfile.snapshot().spawns[id].present',spawn))
        check('Escape with no drops creates no empty loot popup',page.locator('.loot-toast').count()==0)
        page.locator('.frame-destinations [data-menu-close]').click();page.keyboard.down('d');page.clock.run_for(300);page.keyboard.up('d')
        check('Exploration accepts walking again after escape',page.evaluate('BondRegion.moveTo(BondOpening.start.position)'))
        # Failure to persist the request must not change the simulation.
        page.evaluate('qaHunt()');page.locator('#pause').click()
        page.evaluate("()=>{window.qaSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===BondProfile.KEY)throw Error('QA full');return qaSet.call(this,k,v);};}")
        before=page.evaluate('BondProfile.export()');page.locator('#run-battle').click()
        check('Failed escape write retains state and reservation',page.evaluate('BondProfile.export()')==before and page.evaluate('!BondApp.getBattle().escape&&!BondApp.isRunning()'))
        page.evaluate('()=>{Storage.prototype.setItem=qaSet;}');page.locator('#run-battle').click();page.clock.run_for(3400)
        check('Retry after storage recovery can escape',page.evaluate('!!BondApp.getBattle().escaped&&!BondProfile.snapshot().encounterSave'))
        # Replaying joins on either side of an escape request in the SAME tick
        # must preserve event order as well as final HP/positions.
        for order in ['before','after']:
            ok=page.evaluate("""(order)=>{qaHunt();const P=BondProfile,b=BondApp.getBattle(),s=P.population().find(x=>x.present&&!b.units.some(u=>u.spawnId===x.id));
              if(order==='before')P.joinBattle(b,s.id,{x:s.x,y:s.y});
              P.requestEscape(b);
              if(order==='after')P.joinBattle(b,s.id,{x:s.x,y:s.y});
              for(let i=0;i<12;i++)b.step();P.checkpoint(b);
              return qaShape(b)===qaShape(P.restoreBattle(BondApp.getEncounter()));}""",order)
            check('Same-tick join '+order+' escape replays identically',ok)
        # Real receipt failure remains visible until a successful retry.
        page.evaluate('qaHunt();BondApp.getBattle().run();Storage.prototype.setItem=function(k,v){if(k===BondProfile.KEY)throw Error("QA full");return qaSet.call(this,k,v);};BondApp.renderBattle();BondApp.finish()')
        page.clock.run_for(7000)
        check('Unaccepted rewards remain visible with saving retry',page.locator('.loot-retry').is_visible() and page.evaluate('!!BondProfile.snapshot().encounterSave'))
        page.evaluate('()=>{Storage.prototype.setItem=qaSet;}');page.locator('.loot-retry').click();page.evaluate("BondProfile.travel('clearing-hub');BondApp.switchTab('region')");page.locator('.loot-dismiss').first.focus();page.clock.run_for(6100)
        check('Accepted retry expires even with focus',page.locator('.loot-toast').count()==0 and page.evaluate('!BondProfile.snapshot().encounterSave'))
        # Escape keeps actual partial kills, not an NPC victory bonus.
        receipts=page.evaluate("""()=>{
          BondApp.cancelRegionBattle();BondProfile.travel('clearing-0');BondProfile.testing.heal();const P=BondProfile,out=[],test=(name,pass)=>out.push({name,pass:!!pass});
          const npc=BondCampaign.trainers.find(e=>e.map===P.snapshot().map);BondApp.startRegionBattle(npc.id);
          const b=BondApp.getBattle(),sp=P.population().find(x=>x.present&&x.type==='emberfox');P.testing.setRoll(sp.id,0);
          BondApp.joinWild(sp.id,{x:sp.x,y:sp.y});const enemy=b.units.find(u=>u.spawnId===sp.id),before=P.snapshot().coins;
          b.damage(b.trainer(0),enemy,100000,'QA partial kill');P.settleKills(b,npc.id);
          b.units.filter(u=>u.side===1).forEach(u=>{u.actionRemaining=999;});
          const hp=b.trainer(0).hp;P.requestEscape(b);b.run();BondApp.renderBattle();BondApp.finish();
          const r=P.complete(b,npc.id),snapshot=P.export();
          test('Partial escape keeps one accepted kill and its Echo',r.escaped&&r.kills===1&&r.echo&&P.snapshot().coins===before+6);
          test('Partial escape never grants NPC victory credit',!P.snapshot().defeated.includes(npc.id));
          test('Partial escape does not heal or rescue',!r.rescued&&b.trainer(0).hp===hp);
          P.complete(b,npc.id);test('Escape receipt retries cannot duplicate rewards',P.export()===snapshot);
          return out;
        }""")
        for c in receipts: check(c['name'],c['pass'])
        page.evaluate('qaHunt();BondApp.getBattle().trainer(0).hp=1;BondProfile.requestEscape(BondApp.getBattle());BondApp.getBattle().trainer(0).status.burn={next:.05,until:2,source:"1-1"};BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish()')
        check('Dying while fleeing still uses normal camp recovery',page.evaluate('!BondApp.getBattle().escaped&&!BondProfile.snapshot().encounterSave&&BondAdventure.health(BondProfile.snapshot())===10000&&BondProfile.snapshot().map===BondOpening.start.map'))
        page.evaluate('qaHunt();BondApp.switchTab("region");BondCampaignMenu.open()')
        page.locator('#campaign-abandon').click()
        check('Journal Run uses the same timed escape',page.evaluate('!!BondApp.getBattle().escape&&!BondApp.getBattle().ended&&!!BondProfile.snapshot().encounterSave'))
        page.clock.run_for(3400)
        page.evaluate("document.querySelectorAll('.loot-dismiss').forEach(b=>b.click())")
        page.evaluate('qaHunt()')
        for width in [390,768,1440]:
            page.set_viewport_size({'width':width,'height':1000});page.clock.run_for(100)
            check('Run control fits viewport '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth+2') and page.locator('#run-battle').is_visible())
        page.locator('#run-battle').click();page.clock.run_for(400)
        page.screenshot(path=str(ARTIFACTS/f'field-escape-{args.browser}.png'))
        page.evaluate('BondApp.cancelRegionBattle();BondApp.switchTab("region")')
        # Original files remain intact; render measured foliage cards through
        # the actual shared CSS path for owner inspection of all six biomes.
        page.evaluate("""()=>{const d=document.createElement('div');d.id='qa-foliage';d.style='position:fixed;inset:0;z-index:99999;background:#344e48;overflow:auto;padding:20px';document.body.append(d);}""")
        for theme in ['mosslight','willowbrook','amber','moonwell','windstep','ashen']:
            page.evaluate('(id)=>WorldRenderer.prefetch(id)',theme)
            page.wait_for_function("(id)=>{const e=document.createElement('div');WorldRenderer.spriteStyle(e,id,0,200);return e.style.backgroundImage!=='none';}",arg=theme)
            crops=page.evaluate("""(id)=>{const row=document.createElement('section');row.style='display:flex;align-items:end;gap:12px;height:310px';row.innerHTML='<strong style="color:white;width:100px">'+id+'</strong>';document.querySelector('#qa-foliage').append(row);return Array.from({length:4},(_,i)=>{const el=document.createElement('div');WorldRenderer.spriteStyle(el,id,i,200);row.append(el);return {clip:el.style.clipPath,width:el.style.width,bg:el.style.backgroundPosition};});}""",theme)
            check(theme+' foliage uses four isolated silhouettes',all(c['clip'].startswith('polygon(') and c['width']=='200px' for c in crops))
            if theme=='mosslight': check('Birch crop excludes neighboring oak leaves',abs(float(crops[1]['bg'].split(' ')[0][:-2])+356*200/249)<.01)
        page.locator('#qa-foliage').evaluate('(e)=>{e.style.position="relative";e.style.height="auto";}')
        page.locator('#qa-foliage').screenshot(path=str(ARTIFACTS/f'field-foliage-{args.browser}.png'))
    except Exception:
        errors.append(traceback.format_exc())
    check('No browser or harness errors',not errors)
    check('Runtime unchanged during validation',source==hashes())
    browser.close()
server.shutdown()
report={'checks':checks,'errors':errors,'source_sha256':source}
(ARTIFACTS/f'field-polish-{args.browser}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(errors),flush=True)
raise SystemExit(0 if checks and all(c['pass'] for c in checks) else 1)
