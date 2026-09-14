"""Pass 14 instance/picker/loot journeys in isolated browser contexts."""
import argparse,functools,json,threading,traceback,hashlib
from datetime import datetime,timedelta,timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome');args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/?test=1'
checks=[];errors=[];missing=[]
def check(name,value):
    checks.append({'name':name,'pass':bool(value)})
    if not value: print('FAIL '+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page()
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=60))
    try:
        page.goto(url);page.wait_for_function('!!window.BondApp',timeout=12000)
        check('Fresh v7 adventure starts trainer-only',page.evaluate('BondProfile.snapshot().version===7&&BondProfile.snapshot().companions.length===0&&BondApp.getBuild()[0].filter(Boolean).length===1'))
        # Pure rules plus legacy and instance fixtures; no gameplay state mutation.
        source=(ROOT/'tests'/'pass14-engine.js').read_text(encoding='utf-8')
        page.add_script_tag(content=source)
        engine=page.evaluate('runPass14Engine()')
        for row in engine['results']:
            check(row['name'],row['pass'])
            if not row['pass']: print(row.get('detail'),flush=True)
        check('Two Echoes summon independent copies of the same species',page.evaluate('''()=>{
          window.echoA=BondProfile.testing.grantEcho('emberfox',1);window.monA=BondProfile.summon('emberfox','druid',echoA);
          window.echoB=BondProfile.testing.grantEcho('emberfox',10);window.monB=BondProfile.summon('emberfox','druid',echoB);
          const a=BondProfile.getCompanion(monA.instanceId),b=BondProfile.getCompanion(monB.instanceId);
          return a.id!==b.id&&a.type===b.type&&a.xp===0&&b.xp===4500&&BondProfile.snapshot().inventory['echo:emberfox']===0;
        }'''))
        check('Retrying summon receipt returns same individual',page.evaluate('BondProfile.summon("emberfox","druid",echoA).instanceId===monA.instanceId&&BondProfile.companions().length===2'))
        page.locator('#tab-loadout').click();page.locator('[data-slot="1"]').click()
        check('Click slot opens owned portrait picker, no dropdown',page.locator('#companion-picker').is_visible() and page.locator('#party-type').count()==0 and page.locator('[data-pick^="companion:"]').count()==2)
        mon_a=page.evaluate('monA.instanceId');mon_b=page.evaluate('monB.instanceId')
        page.locator('[data-pick="'+mon_a+'"]').click()
        page.locator('[data-slot="2"]').click();page.locator('[data-pick="'+mon_b+'"]').click()
        check('Two same-species individuals occupy separate slots',page.evaluate('BondApp.getBuild()[0][1].instanceId===monA.instanceId&&BondApp.getBuild()[0][2].instanceId===monB.instanceId'))
        page.locator('#fight').click();page.clock.run_for(1000);page.locator('#pause').click()
        check('Same-species pair has independent combat level/identity',page.evaluate('BondApp.getBattle().units.find(u=>u.instanceId===monA.instanceId).level===1&&BondApp.getBattle().units.find(u=>u.instanceId===monB.instanceId).level===10'))
        page.screenshot(path=str(ARTIFACTS/'pass14-combat.png'),full_page=True)
        page.locator('#tab-loadout').click()
        check('Per-instance skill change leaves other copy unchanged',page.evaluate('''()=>{
          const before=BondProfile.getCompanion(monB.instanceId).skills.join('|');
          BondProfile.setSkills(monA.instanceId,['quickstep','firefan','pierce']);
          return BondProfile.getCompanion(monA.instanceId).skills[0]==='quickstep'&&BondProfile.getCompanion(monB.instanceId).skills.join('|')===before&&BondApp.getBuild()[0][1].skills[0]==='quickstep';
        }'''))
        check('Individual tree investments do not leak',page.evaluate('''()=>{BondProfile.learn(monA.instanceId,'bond');BondProfile.learn(monA.instanceId,'might');return BondProfile.getCompanion(monA.instanceId).growth.might===1&&Object.keys(BondProfile.getCompanion(monB.instanceId).growth).length===0;}'''))
        page.locator('[data-slot="1"]').click();page.locator('#picker-search').fill('#2')
        check('Visual picker search distinguishes copies',page.locator('[data-pick]').count()==1)
        page.screenshot(path=str(ARTIFACTS/'pass14-picker.png'),full_page=True)
        page.locator('[data-pick="'+mon_b+'"]').click()
        check('Selecting already-equipped individual swaps, never duplicates',page.evaluate('BondApp.getBuild()[0][1].instanceId===monB.instanceId&&BondApp.getBuild()[0][2].instanceId===monA.instanceId'))
        page.reload()
        check('Save restores independent copies, XP, skills, trees and party',page.evaluate('''()=>{const s=BondProfile.snapshot(),a=s.companions.find(m=>m.ordinal===1),b=s.companions.find(m=>m.ordinal===2);return s.companions.length===2&&a.xp===0&&b.xp===4500&&a.skills[0]==='quickstep'&&a.growth.might===1&&!b.growth.might&&BondApp.getBuild()[0][1].instanceId===b.id;}'''))
        page.locator('#tab-loadout').click();page.evaluate('BondMenu.open("collection")')
        check('Inner Sea shows individual portrait cards',page.locator('[data-instance]').count()==2)
        page.screenshot(path=str(ARTIFACTS/'pass14-inner-sea.png'),full_page=True)
        # Trainer-only fixed hunt -> immediate region + persistent reward popup.
        page.evaluate('BondApp.changeUnit(0,1,null);BondApp.changeUnit(0,2,null);BondProfile.travel("clearing-0",{x:190,y:5040});BondApp.switchTab("region")')
        spawn=page.evaluate('BondProfile.population().find(x=>x.present&&x.type==="emberfox").id')
        page.evaluate('id=>BondProfile.testing.setRoll(id,0)',spawn)
        page.locator('[data-object="'+spawn+'"]').click();page.clock.run_for(3000);page.locator('#npc-fight').click()
        page.clock.run_for(35000)
        check('Wild victory returns immediately to Explore with loot popup',page.evaluate('BondApp.getTab()==="region"&&BondApp.getBattle().ended&&BondApp.getBattle().winner===0') and page.locator('#loot-popup').is_visible())
        check('Popup shows coins, Echo and separate summon instruction','Soul Echo' in page.locator('#loot-popup').inner_text() and '6 coins' in page.locator('#loot-popup').inner_text())
        page.screenshot(path=str(ARTIFACTS/'pass14-loot.png'),full_page=True)
        coins=page.evaluate('BondProfile.snapshot().coins')
        page.locator('#loot-continue').click()
        check('Dismissing popup does not regrant rewards',page.evaluate('BondProfile.snapshot().coins')==coins)
        page.evaluate('BondApp.finish()')
        check('Repeated finish does not reopen dismissed popup',not page.locator('#loot-popup').is_visible())
        # Export the actual, live species/stat/habitat/loot reference inputs.
        manifest=page.evaluate('''()=>({version:14,species:BondRoster.manifest().map(u=>({...u,habitat:BondAtlas.home(u.id),passiveInfo:BondContent.PASSIVES[u.passive],kit:u.skills.map(id=>({id,...BondContent.SKILLS[id]}))})),maps:BondAtlas.maps,regions:BondAtlas.REGIONS})''')
        (ARTIFACTS/'pass14-reference.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
        for tab in ['party','collection','inventory','trees','trainer','formation']:
            page.locator('#tab-loadout').click();page.evaluate('tab=>BondMenu.open(tab)',tab)
            check('Render '+tab,'undefined' not in page.locator('#teams').inner_text() and 'NaN' not in page.locator('#teams').inner_text())
        page.set_viewport_size({'width':390,'height':844})
        page.evaluate('BondMenu.open("party")');page.locator('[data-slot="1"]').click()
        check('Mobile picker fits viewport',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
        page.screenshot(path=str(ARTIFACTS/'pass14-mobile-picker.png'),full_page=True)
        page.keyboard.press('Escape')
        check('Escape closes picker and restores party-slot focus',not page.locator('#companion-picker').is_visible() and page.evaluate('document.activeElement?.dataset.slot==="1"'))

        check('XP food affects only selected individual; capped feed preserves item',page.evaluate('''()=>{
          const P=BondProfile,s=P.snapshot(),a=s.companions[0],b=s.companions[1];
          s.inventory.trailfood=2;P.testing.replace(s);
          const first=P.feed(a.id),after=P.snapshot();P.testing.setXP(b.id,495000);
          const blocked=P.feed(b.id)===false&&P.snapshot().inventory.trailfood===1;
          P.testing.replace(s);return first&&after.companions[0].xp===a.xp+120&&after.companions[1].xp===b.xp&&blocked;
        }'''))
        check('Failed duplicate summon preserves Echo; retry creates one individual',page.evaluate('''()=>{
          const P=BondProfile,original=P.snapshot(),id=P.testing.grantEcho('emberfox',3),before=P.companions().length;
          const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===P.KEY)throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v);};
          let failed;try{failed=P.summon('emberfox','druid',id)===false&&P.companions().length===before&&P.snapshot().echoes.emberfox.some(e=>e.id===id);}finally{Storage.prototype.setItem=set;}
          const result=P.summon('emberfox','druid',id),repeat=P.summon('emberfox','druid',id),ok=failed&&result.instanceId===repeat.instanceId&&P.companions().length===before+1;
          P.testing.replace(original);return ok;
        }'''))
        # Saved kill receipt retries: a failure must never claim successful persistence.
        page.evaluate('''()=>{
          BondApp.changeUnit(0,1,null);BondApp.changeUnit(0,2,null);BondProfile.travel('clearing-0',{x:190,y:5040});
          const sp=BondProfile.population().find(s=>s.present&&s.type==='stonehorn');BondProfile.testing.setRoll(sp.id,9999);
          const e=BondProfile.beginHunt(sp.id);BondApp.startRegionBattle(e.id);const b=BondApp.getBattle();b.run();
          window.saveItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===BondProfile.KEY)throw new DOMException('Full','QuotaExceededError');return saveItem.call(this,k,v);};
          BondApp.finish();
        }''')
        check('No-drop victory returns immediately even if save is pending',page.evaluate('BondApp.getTab()==="region"') and page.locator('#loot-popup').is_visible() and 'not saved yet' in page.locator('#loot-popup').inner_text().lower())
        page.evaluate('()=>{Storage.prototype.setItem=window.saveItem;}')
        page.locator('#loot-retry').click()
        check('Retry settles no-Echo coins honestly without new roll',page.evaluate('!BondProfile.complete(BondApp.getBattle(),BondApp.getEncounter()).pending') and 'No Soul Echo' in page.locator('#loot-popup').inner_text() and '6 coins' in page.locator('#loot-popup').inner_text())
        page.locator('#loot-continue').click()
        check('Earned XP credits two individuals, not species or benched copy',page.evaluate('''()=>{
          const P=BondProfile,original=P.snapshot(),a=original.companions[0],b=original.companions[1],third=P.summon('emberfox','druid',P.testing.grantEcho('emberfox',1));
          BondApp.changeUnit(0,1,a.id);BondApp.changeUnit(0,2,b.id);P.travel('clearing-0');
          const sp=P.population().find(s=>s.present&&s.type==='bloomslime'),e=P.beginHunt(sp.id);
          const fight=new BondGame.Battle(BondApp.getBuild(),{profile:P.snapshot(),encounter:e,seed:17}).run();P.complete(fight,e.id);
          const ok=fight.winner===0&&P.getCompanion(a.id).xp===a.xp+50&&P.getCompanion(b.id).xp===b.xp+50&&P.getCompanion(third.instanceId).xp===0;
          P.testing.replace(original);return ok;
        }'''))
        check('Multi-monster pack does not return after its first kill',page.evaluate('''()=>{
          const [id]=Object.entries(BondWorld.NPCS).find(([,e])=>e.kind==='pack');
          BondApp.startRegionBattle(id);const b=BondApp.getBattle(),first=b.units.find(u=>u.side===1);
          b.damage(b.trainer(0),first,1e7,'test');BondApp.finish();
          return !b.ended&&BondApp.getTab()==='battle'&&!document.querySelector('#loot-popup').open;
        }'''))
        check('Pack returns only after its final monster dies',page.evaluate('''()=>{
          const b=BondApp.getBattle();for(const u of b.units.filter(u=>u.side===1&&u.hp>0))b.damage(b.trainer(0),u,1e7,'test');BondApp.finish();
          return b.ended&&b.winner===0&&BondApp.getTab()==='region'&&document.querySelector('#loot-popup').open;
        }'''))
        page.locator('#loot-continue').click()
        check('Trainer-duel victory retains its result screen',page.evaluate('''()=>{
          const [id]=Object.entries(BondWorld.NPCS).find(([,e])=>!e.kind);
          BondApp.startRegionBattle(id);const b=BondApp.getBattle();b.damage(b.trainer(0),b.trainer(1),1e7,'test');BondApp.finish();
          return b.ended&&b.winner===0&&BondApp.getTab()==='battle'&&!document.querySelector('#loot-popup').open;
        }'''))
        # Real old keys -> startup migration, then restore the isolated v7 fixture.
        page.evaluate('''()=>{
          window.backupProfile=BondProfile.export();window.backupBuild=localStorage.getItem(BondProfile.BUILD_KEY);
          sessionStorage.setItem('p14-backup',JSON.stringify({profile:backupProfile,build:backupBuild}));
          const legacy={version:6,owned:['emberfox'],xp:{emberfox:4500},growth:{emberfox:{bond:1,might:1}},coins:73,inventory:{biscuit:2},echoes:{emberfox:[{id:'old:echo',level:2,map:'clearing-0'}]},summons:{'old:used':'emberfox'}};
          const build=BondGame.soloBuild('druid');build[0][1]={type:'emberfox',skills:['quickstep','firefan','pierce']};
          localStorage.setItem('bond-bolt-profile-v6-sandbox',JSON.stringify(legacy));localStorage.setItem('bond-bolt-build-v3-sandbox',JSON.stringify(build));
          localStorage.removeItem(BondProfile.KEY);localStorage.removeItem(BondProfile.BUILD_KEY);
        }''')
        page.reload()
        check('Real v6 startup migrates saved kit and preserves original keys',page.evaluate('''()=>{
          const P=BondProfile,m=P.companions()[0],old=JSON.parse(localStorage.getItem('bond-bolt-profile-v6-sandbox'));
          return m.id==='legacy:emberfox'&&m.xp===4500&&m.growth.might===1&&m.skills[0]==='quickstep'&&BondApp.getBuild()[0][1].instanceId===m.id&&P.snapshot().coins===73&&old.version===6&&old.xp.emberfox===4500;
        }'''))
        check('Legacy consumed Echo retry cannot create a second copy',page.evaluate('BondProfile.summon("emberfox","druid","old:used").instanceId==="legacy:emberfox"&&BondProfile.companions().length===1'))
        check('Legacy species can summon a genuinely new individual',page.evaluate('BondProfile.summon("emberfox","druid","old:echo").instanceId!=="legacy:emberfox"&&BondProfile.companions().length===2'))
        page.evaluate('''()=>{const b=JSON.parse(sessionStorage.getItem('p14-backup'));BondProfile.testing.replace(JSON.parse(b.profile));localStorage.setItem(BondProfile.BUILD_KEY,b.build);sessionStorage.removeItem('p14-backup');}''')
        page.reload()
    except Exception as e:
        errors.append(str(e));traceback.print_exc()
    check('No JavaScript errors',not errors);check('No missing assets',not missing)
    report={'browser':args.browser,'browser_version':browser.version,'utc':datetime.now(timezone.utc).isoformat(),'checks':checks,'errors':errors,'missing':missing,'source_sha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}}
    (ARTIFACTS/('pass14-'+args.browser+'.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'errors':errors,'missing':missing},indent=2),flush=True)
    browser.close()
server.shutdown()
raise SystemExit(0 if all(c['pass'] for c in checks) else 1)
