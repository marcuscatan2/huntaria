"""Pass17 played UI checks, isolated browser profile and sandbox storage only."""
import argparse,functools,json,threading,hashlib,traceback,time
from datetime import datetime,timedelta,timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome');args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/?test=1'
hashes=lambda:{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
source=hashes();checks=[];errors=[];measurements=[]
def check(name,value,detail=None):
    checks.append({'name':name,'pass':bool(value),'detail':detail})
    if not value:print('FAIL '+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=20))
    try:
        page.goto(url);page.wait_for_function('!!window.BondApp',timeout=30000)
        page.wait_for_function('WorldRenderer.inspect().bridgeReady',timeout=15000)
        check('Bridge sprite loads at full width',page.evaluate('WorldRenderer.inspect().bridgeReady&&!WorldRenderer.inspect().bridgeError'))
        saved=page.evaluate('BondProfile.population().map(s=>({id:s.id,life:s.life,x:s.x,y:s.y,roll:s.roll}))')
        page.reload();page.wait_for_function('!!window.BondApp')
        check('Real page reload keeps map positions and loot rolls',page.evaluate('BondProfile.population().map(s=>({id:s.id,life:s.life,x:s.x,y:s.y,roll:s.roll}))')==saved)
        check('No fixed habitat group markers or preparation services',page.locator('.map-object.habitat,.map-object.rest,.map-object.shop,.map-object.sea,#region-loadout,#region-inventory').count()==0)
        page.evaluate("""()=>{
          const P=BondProfile;
          for(const [slot,type] of [[1,'emberfox'],[2,'stonehorn']]){const mon=P.summon(type,'druid',P.testing.grantEcho(type,10));BondApp.changeUnit(0,slot,mon.instanceId);}
          P.travel('clearing-0',{x:1300,y:5040});BondApp.switchTab('region');
        }""")
        for direction,key in [('left','a'),('right','d')]:
            page.locator('#region-map').focus();start=page.evaluate('BondRegion.inspect().position.x')
            page.keyboard.down(key);page.clock.run_for(2400);page.keyboard.up(key);page.clock.run_for(100)
            facing=page.evaluate("""()=>({x:BondRegion.inspect().position.x,playerLeft:document.querySelector('#region-player').classList.contains('facing-left'),followers:BondRegion.inspect().followers.map(u=>u.facingLeft),scale:getComputedStyle(document.querySelector('#region-player canvas')).scale})""")
            wanted=direction=='left'
            check('Druid and both followers face '+direction,(facing['x']<start if wanted else facing['x']>start) and facing['playerLeft']==wanted and all(v==wanted for v in facing['followers']) and facing['scale'].startswith('-' if wanted else '1.15'),facing)
            page.screenshot(path=str(ARTIFACTS/f'pass17-walk-{direction}-{args.browser}.png'),full_page=True)
        # Every render tier must mirror independently of its pose transform.
        directions=page.evaluate("""()=>{
          const out=[];
          for(const type of ['druid','mage','emberfox','stonehorn','seedhare','brooktoad','siltwyrm']){
            const node=document.createElement('div');node.className='world-node';node.innerHTML=CharacterRig.art(type);document.body.append(node);
            const rig=CharacterRig.mount(node,type);CharacterRig.pose(rig,{time:1,walking:true});const sprite=rig.sprite;
            const right=getComputedStyle(sprite).scale;node.classList.add('facing-left');const left=getComputedStyle(sprite).scale;
            out.push({type,right,left,ok:Number(right.split(' ')[0])===-Number(left.split(' ')[0])});node.remove();
          }return out;
        }""")
        check('Painted canvas, portrait and vector rigs all mirror',all(r['ok'] for r in directions),directions)
        bridge=page.evaluate("""()=>{const m=BondAtlas.get('clearing-0'),b=m.bridges.find(b=>BondNav.clear(m.id,b.a,b.b));BondProfile.travel(m.id,b.a);BondApp.switchTab('region');return b;}""")
        page.evaluate('p=>BondRegion.moveTo(p)',bridge['b']);page.clock.run_for(500)
        check('Bridge bitmap actually drawn into world terrain',page.evaluate('WorldRenderer.inspect().bridgesPainted>0'))
        page.screenshot(path=str(ARTIFACTS/f'pass17-bridge-{args.browser}.png'),full_page=True)
        page.clock.run_for(12000)
        check('Actual click-walk crosses the painted bridge',page.evaluate('p=>Math.hypot(BondRegion.inspect().position.x-p.x,BondRegion.inspect().position.y-p.y)<10',bridge['b']))
        page.evaluate("BondProfile.travel('clearing-hub',BondAtlas.get('clearing-hub').guide);BondApp.switchTab('region')")
        page.clock.run_for(200);page.locator('#region-map').focus();page.keyboard.press('e')
        check('Town Keeper retains story dialogue but no build button',page.locator('#exploration-dialog').is_visible() and page.locator('#explore-build').count()==0 and page.evaluate('BondProfile.snapshot().journey.steps.includes("ch1:keeper")'))
        page.keyboard.press('Escape')
        check('Towns have no clickable loadout services',page.locator('.map-object.rest,.map-object.shop,.map-object.sea').count()==0)
        page.locator('#tab-loadout').click();page.evaluate("BondMenu.open('collection')");page.locator('[data-collection-mode="catalog"]').click()
        for family,count in [('Frog',4),('Insect',15),('Spider',3),('Mythic',1)]:
            page.locator('#collection-search').fill(family)
            check(family+' family searchable with correct count',page.locator('[data-collection]').count()==count)
            check(family+' search displays a matching species detail',family in page.locator('.companion-profile').inner_text())
        page.locator('#collection-search').fill('Frog');page.screenshot(path=str(ARTIFACTS/f'pass17-frogs-{args.browser}.png'),full_page=True)
        page.evaluate("BondMenu.open('inventory')")
        check('Inventory and supply preparation remain in Loadout',page.locator('.satchel-storage').is_visible() and page.locator('[data-prepare]').count()==1)
        # Controlled Echo roll is QA setup, not evidence of natural drop timing.
        target=page.evaluate("""()=>{
          BondProfile.travel('clearing-0');const sp=BondProfile.population().find(s=>s.type==='tideotter'&&s.present);
          BondProfile.testing.setRoll(sp.id,0);BondProfile.position(BondAtlas.safePoint('clearing-0',{x:sp.x-170,y:sp.y}));BondApp.switchTab('region');return sp;
        }""")
        page.clock.run_for(100);page.locator('[data-object="'+target['id']+'"]').click();page.clock.run_for(4000);page.locator('#npc-fight').click()
        page.clock.run_for(40000)
        check('Played Tideotter win immediately returns with drop popup',page.evaluate('BondApp.getTab()==="region"&&BondApp.getBattle().ended&&BondApp.getBattle().winner===0') and page.locator('#loot-popup').is_visible())
        page.locator('#loot-continue').click();page.clock.run_for(1500)
        replacement=page.evaluate('id=>BondProfile.population().find(s=>s.id===id)',target['id'])
        check('Played kill restores map count away from corpse',replacement['life']==target['life']+1 and ((replacement['x']-target['x'])**2+(replacement['y']-target['y'])**2)**.5>=900 and page.evaluate('BondProfile.population().filter(s=>s.present&&s.type==="tideotter").length===8'))
        page.screenshot(path=str(ARTIFACTS/f'pass17-population-{args.browser}.png'),full_page=True)
        page.set_viewport_size({'width':390,'height':844});page.clock.run_for(300)
        check('390px exploration and population panel fit',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
        page.screenshot(path=str(ARTIFACTS/f'pass17-mobile-{args.browser}.png'),full_page=True)
        # Separate untimed-clock page: genuine population initialization measurements.
        perf=browser.new_page();perf.on('pageerror',lambda e:errors.append(str(e)));perf.goto(url);perf.wait_for_function('!!window.BondApp')
        perf.evaluate("BondProfile.summon('emberfox','druid',BondProfile.testing.grantEcho('emberfox',100));BondApp.switchTab('loadout')")
        for map_id in perf.evaluate('BondAtlas.maps.filter(m=>m.kind!=="hub").map(m=>m.id)'):
            measurements.append(perf.evaluate("""id=>{BondProfile.travel(id);const t=performance.now(),p=BondProfile.population();return {map:id,ms:performance.now()-t,count:p.length};}""",map_id))
        perf.close()
        broken=browser.new_page();broken.on('pageerror',lambda e:errors.append(str(e)))
        broken.route('**/assets/world-v17/timber-bridge.png*',lambda r:r.abort());broken.goto(url);broken.wait_for_function('!!window.WorldRenderer&&WorldRenderer.inspect().bridgeError')
        check('Missing bridge uses fallback without disabling movement',broken.evaluate('!!window.BondRegion&&WorldRenderer.inspect().bridgeError&&!WorldRenderer.inspect().bridgeReady'))
        broken.unroute('**/assets/world-v17/timber-bridge.png*');broken.locator('#world-retry-art').click();broken.wait_for_function('WorldRenderer.inspect().bridgeReady')
        check('Retry restores bridge without resetting progress',broken.evaluate('!WorldRenderer.inspect().bridgeError&&BondProfile.snapshot().companions.length===0'));broken.close()
    except Exception:errors.append(traceback.format_exc())
    check('No unexpected JavaScript/test errors',not errors);check('Sources unchanged through UI tests',source==hashes());browser.close()
server.shutdown()
report={'browser':args.browser,'checks':checks,'errors':errors,'source_sha256':source,'populationInitMs':measurements,'bridge_sha256':hashlib.sha256((ROOT/'assets/world-v17/timber-bridge.png').read_bytes()).hexdigest()}
(ARTIFACTS/f'pass17-ui-{args.browser}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'failures':[c for c in checks if not c['pass']],'errors':errors},indent=2),flush=True)
raise SystemExit(0 if all(c['pass'] for c in checks) else 1)
