"""Current v13 journey checks, isolated browser contexts and saves."""
import argparse,functools,json,threading,traceback,hashlib
from datetime import datetime,timedelta,timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--browser',default='chrome')
args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/?test=1'
checks=[];errors=[];missing=[]
def check(name,result):
    checks.append({'name':name,'pass':bool(result)})
    if not result: print('FAIL '+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    print('Running '+args.browser+' v13 isolated checks...',flush=True)
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page()
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=60))
    try:
        page.goto(url);page.wait_for_function('!!window.BondApp',timeout=15000)
        check('Fresh isolated save has no companions',page.evaluate('BondProfile.snapshot().owned.length===0&&BondApp.getBuild()[0].filter(Boolean).length===1'))
        check('100 species and complete world manifest validate',page.evaluate('BondContent.MONSTERS.length===100&&!BondRoster.validate().length&&!BondAtlas.validate().length'))
        page.add_script_tag(path=str(ROOT/'tests'/'pass13-engine.js'))
        engine=page.evaluate('runPass13Engine()')
        for result in engine['results']:
            check(result['name'],result['pass'])
            if not result['pass']: print(result.get('detail'),flush=True)
        (ARTIFACTS/('pass13-engine-'+args.browser+'.json')).write_text(json.dumps(engine,indent=2),encoding='utf-8')
        page.clock.run_for(100)
        page.screenshot(path=str(ARTIFACTS/'pass13-world.png'),full_page=True)
        page.locator('#tab-loadout').click()
        page.screenshot(path=str(ARTIFACTS/'pass13-loadout.png'),full_page=True)
        page.evaluate('BondMenu.open("collection")')
        page.screenshot(path=str(ARTIFACTS/'pass13-collection.png'),full_page=True)
        page.evaluate('BondMenu.open("inventory")')
        page.screenshot(path=str(ARTIFACTS/'pass13-inventory.png'),full_page=True)
        page.evaluate('BondMenu.open("formation")')
        check('Formation tolerates empty slots',page.locator('[data-formation-slot]').count()==3)
        page.evaluate('BondMenu.open("trees")')
        page.locator('#fight').click()
        page.clock.run_for(2000)
        check('Battle playback advances',page.evaluate('BondApp.getBattle().time>1'))
        page.locator('#pause').click()
        page.screenshot(path=str(ARTIFACTS/'pass13-combat.png'),full_page=True)
        # Player journey: physical gates, persistent hunt, drop and separate summon.
        page.locator('#tab-region').click()
        start=page.evaluate('BondRegion.inspect().position')
        page.locator('#region-map').focus();page.keyboard.down('d');page.clock.run_for(1000);page.keyboard.up('d')
        moved=page.evaluate('BondRegion.inspect().position')
        check('Keyboard walks at 210 world units/s',180<moved['x']-start['x']<220)
        page.evaluate('BondProfile.travel("clearing-0",{x:190,y:5040});BondApp.switchTab("region")')
        page.locator('[data-route="clearing-0>clearing-hub"]').click();page.clock.run_for(1800)
        check('Physical gate walks into the town hub',page.evaluate('BondRegion.inspect().map==="clearing-hub"'))
        page.locator('[data-route="clearing-hub>clearing-1"]').click();page.clock.run_for(2500)
        check('Town forest gate opens a real large map',page.evaluate('BondRegion.inspect().map==="clearing-1"'))
        page.evaluate('BondProfile.travel("clearing-0",{x:190,y:5040});BondApp.switchTab("region")')
        spawn=page.evaluate('BondProfile.population().find(x=>x.present&&x.type==="emberfox").id')
        page.evaluate('id=>BondProfile.testing.setRoll(id,0)',spawn)
        page.locator('[data-object="'+spawn+'"]').click();page.clock.run_for(3000)
        check('Click wildlife approaches and opens a hunt',page.locator('#npc-dialog').is_visible())
        page.locator('#npc-fight').click();page.clock.run_for(1200)
        check('Wild hunt has trainer plus ONE enemy, no imaginary companions',page.evaluate('BondApp.getBattle().units.length===2'))
        page.locator('#pause').click();paused=page.evaluate('BondApp.getBattle().time');page.clock.run_for(1500)
        check('Pause freezes solo battle simulation',page.evaluate('BondApp.getBattle().time')==paused)
        page.locator('[data-speed="2"]').click();page.locator('#start-battle').click();page.clock.run_for(35000)
        check('Real animated trainer-only hunt completes',page.evaluate('BondApp.getBattle().ended&&BondApp.getBattle().winner===0'))
        check('Kill grants one Echo, coins and NO automatic companion',page.evaluate('BondProfile.snapshot().inventory["echo:emberfox"]===1&&BondProfile.snapshot().coins===6&&BondProfile.snapshot().owned.length===0'))
        check('Dead spawn cannot be replayed',page.locator('#restart').is_disabled() and page.locator('#start-battle').is_disabled())
        check('Results distinguish Echo discovery from ownership','Soul Echo' in page.locator('#result').inner_text())
        page.locator('#result-summon').click()
        page.locator('[data-summon="emberfox"]').click();page.locator('#cancel-summon').click()
        check('Cancelling summon keeps Echo',page.evaluate('BondProfile.snapshot().inventory["echo:emberfox"]===1&&!BondProfile.owns("emberfox")'))
        page.locator('[data-summon="emberfox"]').click();page.locator('#confirm-summon').click()
        check('100% summon grants ownership and consumes exactly one Echo',page.evaluate('BondProfile.owns("emberfox")&&BondProfile.snapshot().inventory["echo:emberfox"]===0'))
        page.locator('[data-add="1"]').click()
        check('Companion is equipped only after user chooses a slot',page.evaluate('BondApp.getBuild()[0][1].type==="emberfox"&&BondApp.getBuild()[0][2]===null'))
        page.reload()
        check('Reload preserves partial party, ownership and kill receipt',page.evaluate('BondApp.getBuild()[0][1]?.type==="emberfox"&&BondApp.getBuild()[0][2]===null&&BondProfile.snapshot().tutorial.kills===1&&Object.keys(BondProfile.snapshot().claims).length===1'))
        check('Normal save key is untouched by sandbox',page.evaluate('localStorage.getItem("bond-bolt-profile-v6")===null'))
        # Atomic local save and idempotency, including a quota failure.
        check('Duplicate summon request is idempotent, duplicate Echo stays stored',page.evaluate('''()=>{
          const first=Object.keys(BondProfile.snapshot().summons)[0];BondProfile.testing.grantEcho('emberfox');
          return BondProfile.summon('emberfox','druid',first).repeated===true&&!BondProfile.summon('emberfox')&&BondProfile.snapshot().inventory['echo:emberfox']===1;
        }'''))
        check('Failed storage commit cannot consume a summon; retry succeeds',page.evaluate('''()=>{
          const id=BondProfile.testing.grantEcho('stonehorn'),original=Storage.prototype.setItem;
          let failed,kept;try{Storage.prototype.setItem=function(){throw Error('test quota');};failed=!BondProfile.summon('stonehorn','druid',id);kept=!BondProfile.owns('stonehorn')&&BondProfile.snapshot().inventory['echo:stonehorn']===1;}finally{Storage.prototype.setItem=original;}
          return failed&&kept&&BondProfile.summon('stonehorn','druid',id).ok&&BondProfile.summon('stonehorn','druid',id).repeated;
        }'''))
        check('Forged/empty/duplicate summon input rejected',page.evaluate('!BondProfile.summon("missing")&&!BondProfile.summon("stormowl","druid","fake")&&!BondProfile.summon("stonehorn")'))
        check('Prepared supplies consumed once, never on preview/resume',page.evaluate('''()=>{
          BondProfile.prepare();const before=BondProfile.snapshot().inventory.biscuit,b=new BondGame.Battle(BondApp.getBuild(),{profile:BondProfile.snapshot()});
          const untouched=BondProfile.snapshot().inventory.biscuit===before;
          const first=BondProfile.consumePrepared(b),second=BondProfile.consumePrepared(b);
          return untouched&&first.biscuit&&first===second&&BondProfile.snapshot().inventory.biscuit===before-1;
        }'''))
        check('Attribute free reset refunds budget; invalid allocation rejected',page.evaluate('''()=>{BondProfile.allocate('dex');const raised=BondProfile.snapshot().attributes.dex===2;BondProfile.resetAttributes();return raised&&BondProfile.snapshot().attributes.dex===1&&!BondProfile.allocate('other')&&BondProgress.spent(BondProfile.snapshot().attributes)===0;}'''))
        check('Trees enforce parents and budget; free reset exact',page.evaluate('''()=>{const p=BondProfile,t=BondGrowth;p.respec('druid');const blocked=!p.learn('druid','mastery');p.learn('druid','bond');p.learn('druid','might');p.learn('druid','might2');const full=!p.learn('druid','mastery');p.respec('druid');return blocked&&full&&t.used(p.snapshot().growth.druid)===0;}'''))
        print('Rules and core player journey passed; checking 100 summons and traversal...',flush=True)
        # Every species is test-summoned, committed, equipped and shown in its menu.
        all_species=page.evaluate('BondContent.MONSTERS')
        for species in all_species:
            ok=page.evaluate('''t=>{
              if(!BondProfile.owns(t)){const id=BondProfile.testing.grantEcho(t);if(!BondProfile.summon(t,'druid',id))return false;}
              BondApp.changeUnit(0,1,t);BondMenu.selectCollection(t);
              return BondProfile.owns(t)&&BondApp.getBuild()[0][1].type===t&&document.querySelector('[data-collection="'+t+'"]')!==null&&BondMenu.detail(t).includes(BondContent.UNITS[t].name);
            }''',species)
            check('F006/F013 test summon, equip and collection '+species,ok)
        page.evaluate('BondProfile.testing.setXP("emberfox",495000);BondApp.changeUnit(0,1,"emberfox");BondApp.changeUnit(0,2,"stonehorn")')
        check('Highest benched level raises trainer and allows late regions',page.evaluate('BondProgress.trainerLevel(BondProfile.snapshot())===100&&BondAtlas.unlocked(BondProfile.snapshot(),"ashen-3")'))
        page.locator('#tab-loadout').click();page.evaluate('BondMenu.open("trees")')
        page.locator('#tree-type').select_option('cinderempress')
        check('All 102 trees accessible with eighteen visible nodes',page.locator('#tree-type option').count()==102 and page.locator('.tree-node').count()==18)
        page.evaluate('BondMenu.open("trainer")');page.screenshot(path=str(ARTIFACTS/'pass13-trainer.png'),full_page=True)
        # Actual spatial walking/camera persistence; setup position is test-only.
        page.evaluate('BondProfile.travel("clearing-0",{x:80,y:5040});BondApp.switchTab("region");BondRegion.moveTo({x:10420,y:5040});')
        page.clock.run_for(49100)
        cross=page.evaluate('BondRegion.inspect()')
        check('Actual cross-map walk takes ~49s and camera follows both axes',10350<cross['position']['x']<10420 and cross['camera']['x']>8000)
        page.clock.run_for(1000);page.locator('#tab-loadout').click()
        saved_pos=page.evaluate('BondProfile.snapshot().position')
        page.reload()
        check('Reload restores exact allowed world position',page.evaluate('BondRegion.inspect().position')==saved_pos)
        page.evaluate('BondProfile.travel("clearing-0",{x:5250,y:80});BondApp.switchTab("region");BondRegion.moveTo({x:5250,y:10000})')
        page.clock.run_for(46500)
        check('Vertical traversal is genuine, not a horizontal page strip',page.evaluate('BondRegion.inspect().position.y>9750&&BondRegion.inspect().camera.y>8500'))
        # Spatial collision, locked entry and persisted spawn roll tests.
        check('Collision rejects obstacle centers and out-of-region progression',page.evaluate('''()=>{
          const a=BondAtlas,o=a.get('clearing-0').obstacles[0],before=BondProfile.snapshot().map;
          const rejects=!BondProfile.travel('clearing-0',{x:o.x,y:o.y});
          const s=BondProfile.fresh();return rejects&&!a.unlocked(s,'ashen-3')&&a.unlocked(s,'clearing-3')&&BondProfile.snapshot().map===before;
        }'''))
        check('Spawn identity and pending loot do not reroll when revisiting',page.evaluate('''()=>{
          BondProfile.travel('clearing-0');const first=BondProfile.population().map(x=>[x.id,x.life,x.roll,x.seed]);
          BondProfile.travel('clearing-hub');BondProfile.travel('clearing-0');
          return JSON.stringify(first)===JSON.stringify(BondProfile.population().map(x=>[x.id,x.life,x.roll,x.seed]));
        }'''))
        page.evaluate('BondProfile.travel("clearing-hub");BondApp.switchTab("region")')
        page.clock.run_for(100);page.screenshot(path=str(ARTIFACTS/'pass13-hub.png'),full_page=True)
        page.evaluate('BondProfile.travel("ruins-3",{x:480,y:5355});BondApp.switchTab("region")')
        page.clock.run_for(100);page.screenshot(path=str(ARTIFACTS/'pass13-cave.png'),full_page=True)
        # Mobile and keyboard menu coverage without changing any normal browser profile.
        page.set_viewport_size({'width':390,'height':844})
        page.locator('#tab-loadout').click()
        for tab in ['party','collection','inventory','trees','trainer','formation']:
            page.evaluate('tab=>BondMenu.open(tab)',tab)
            check('Mobile '+tab+' fits viewport',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
        page.evaluate('BondMenu.open("inventory")');page.screenshot(path=str(ARTIFACTS/'pass13-mobile-inventory.png'),full_page=True)
        page.locator('#tab-region').click();page.clock.run_for(100)
        check('Mobile world fits viewport',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
        page.screenshot(path=str(ARTIFACTS/'pass13-mobile-world.png'),full_page=True)
        # No test tools in a normal new local profile; migration preserves original input.
        normal=context.new_page();normal.on('pageerror',lambda e:errors.append(str(e)))
        normal.goto(url.replace('?test=1',''))
        check('Normal fresh save starts alone with no test grant controls',normal.evaluate('BondProfile.snapshot().owned.length===0&&BondProfile.testing===null') and normal.locator('.qa-panel').count()==0)
        normal.evaluate('''()=>{localStorage.removeItem(BondProfile.KEY);localStorage.setItem('bond-bolt-profile-v5',JSON.stringify({version:5,owned:['emberfox','stonehorn'],xp:{emberfox:300},inventory:{bondcontract:4,biscuit:3},coins:55,area:'clearing',growth:{druid:{bond:2}},formation:['back','front','middle']}));}''')
        normal.reload()
        check('Legacy migration preserves coins/owned/items and old save',normal.evaluate('BondProfile.snapshot().coins===55&&BondProfile.owns("stonehorn")&&BondProfile.snapshot().inventory.bondcontract===4&&!!BondProfile.snapshot().migration&&localStorage.getItem("bond-bolt-profile-v5")!==null'))
        normal.close()
        current_tests=context.new_page()
        current_tests.on('pageerror',lambda e:errors.append(str(e)))
        current_tests.goto(url.replace('/?test=1','/tests/index.html?test=1'))
        current_tests.locator('#run').click()
        check('Current standalone mechanics page works',json.loads(current_tests.locator('#output').inner_text())['failures']==[])
        current_tests.close()

    except Exception as exc:
        errors.append(str(exc));traceback.print_exc()
    check('No browser JavaScript errors',not errors)
    check('No missing assets',not missing)
    hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(list(ROOT.glob('*.js'))+list(ROOT.glob('*.css')))}
    report={'browser':args.browser,'browser_version':browser.version,'utc':datetime.now(timezone.utc).isoformat(),'source_sha256':hashes,'checks':checks,'errors':errors,'missing':missing}
    (ARTIFACTS/('pass13-'+args.browser+'.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'errors':errors,'missing':missing},indent=2),flush=True)
    browser.close()
server.shutdown()
raise SystemExit(0 if all(c['pass'] for c in checks) else 1)
