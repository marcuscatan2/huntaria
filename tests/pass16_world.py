"""Pass15 world integration and traversal checks; isolated browser, no personal save."""
import argparse,functools,json,threading,traceback,hashlib,sys,runpy,time
from datetime import datetime,timedelta,timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome');parser.add_argument('--full',action='store_true');parser.add_argument('--trace-only',action='store_true');parser.add_argument('--delivery-only',action='store_true');parser.add_argument('--performance-seconds',type=int,default=0);args=parser.parse_args()
if args.trace_only:
    sys.argv=['tests/world15_trace.py','--browser',args.browser,'--seconds',str(args.performance_seconds or 300)]
    runpy.run_path(str(ROOT/'tests/world15_trace.py'),run_name='__main__')
    raise SystemExit(0)
if args.delivery_only:
    sys.argv=['tests/world15_delivery.py','--browser',args.browser]
    runpy.run_path(str(ROOT/'tests/world15_delivery.py'),run_name='__main__')
    raise SystemExit(0)
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/?test=1'
checks=[];errors=[];missing=[]
source_hashes=lambda:{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
source_start=source_hashes()
def check(name,value):
    checks.append({'name':name,'pass':bool(value)})
    if not value: print('FAIL '+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1100})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=60))
    try:
        page.goto(url);page.wait_for_function('!!window.BondApp',timeout=20000)
        page.wait_for_function('!WorldRenderer.inspect().loading',timeout=20000)
        page.clock.run_for(300)
        check('World modules mounted with scenery',page.evaluate('BondAtlas.maps.length===30&&document.querySelectorAll(".world-prop").length>0'))
        check('Atlas validates',page.evaluate('BondAtlas.validate().length===0'))
        page.screenshot(path=str(ARTIFACTS/'pass16-baseline-firstlight.png'),full_page=True)
        # Real nearest starter approach and immediate reward return.
        sp=page.evaluate('BondProfile.population().find(s=>s.present&&s.type==="emberfox").id')
        page.locator('[data-object="'+sp+'"]').click();page.clock.run_for(6000)
        check('Click-to-walk reaches first creature and opens encounter',page.locator('#npc-dialog').is_visible())
        if page.locator('#npc-dialog').is_visible():
            page.locator('#npc-fight').click();page.clock.run_for(40000)
            check('World-art combat wins and returns with loot',page.evaluate('BondApp.getTab()==="region"&&BondApp.getBattle().winner===0') and page.locator('#loot-popup').is_visible())
            page.locator('#loot-continue').click()
        # Unlock maps in isolated QA; preserves normal profile.
        page.evaluate('BondProfile.summon("emberfox","druid",BondProfile.testing.grantEcho("emberfox",100))')
        nav=page.evaluate('''()=>BondAtlas.maps.map(m=>{
          const targets=[...m.habitats.flatMap(h=>[0,1,2].map(i=>({x:h.x+(i-1)*115,y:h.y+(i%2?80:-60)}))),...m.neighbors,m.guide,m.cache,m.shelter,...m.landmarks.map(l=>({x:l.x,y:l.y+160})),...(m.index===2?[{x:m.hero.x+210,y:m.hero.y+200}]:[])];
          return {id:m.id,paths:targets.map(target=>{const before=performance.now(),r=BondNav.find(m.id,m.entry,target);return {target,ok:r.ok,reason:r.reason,endpointGap:r.ok?Math.hypot(r.path.at(-1).x-target.x,r.path.at(-1).y-target.y):null,distance:r.distance,visited:r.visited};})};
        })''')
        (ARTIFACTS/('pass16-baseline-nav-'+args.browser+'.json')).write_text(json.dumps(nav,indent=2),encoding='utf-8')
        for m in nav:
            check(m['id']+' all gates, three resident slots and POIs reachable',all(p['ok'] and p['endpointGap']<=115 for p in m['paths']))
            bad=[p for p in m['paths'] if not p['ok'] or p['endpointGap']>115]
            if bad: print(json.dumps({'map':m['id'],'failed':bad}),flush=True)

        # All biome/hub/cave rendering, assets and look at screenshots.
        for region in ['clearing','brook','hollow','ruins','rise','ashen']:
            for suffix in ['0','1','2','3','hub']:
                target=region+'-'+suffix
                page.evaluate('id=>{BondProfile.travel(id);BondRegion.enter(BondApp.getBuild());}',target)
                page.clock.run_for(350);page.wait_for_function('!WorldRenderer.inspect().loading',timeout=20000)
                page.clock.run_for(200)
                check(target+' live render',page.evaluate('BondRegion.inspect().map==="'+target+'"&&document.querySelectorAll(".world-prop").length>0'))
                if suffix=='0' or region=='clearing':page.screenshot(path=str(ARTIFACTS/('pass16-baseline-'+target+'.png')),full_page=True)
                if suffix=='2':
                    page.evaluate('id=>{const m=BondAtlas.get(id);BondProfile.travel(id,BondAtlas.safePoint(id,{x:m.hero.x-250,y:m.hero.y-250}));BondRegion.enter(BondApp.getBuild());}',target)
                    page.clock.run_for(200)
                    page.screenshot(path=str(ARTIFACTS/('pass16-baseline-hero-'+region+'.png')),full_page=True)
        # Real walked gate: saved position must transition at the gate, not selection.
        page.evaluate('BondProfile.travel("clearing-0");BondRegion.enter(BondApp.getBuild());BondRegion.travelTo("clearing-hub")')
        check('Atlas selection starts walking, not teleportation',page.evaluate('BondRegion.inspect().map==="clearing-0"&&!!BondRegion.inspect().destination'))
        page.clock.run_for(3500)
        check('Physical route arrives in town',page.evaluate('BondRegion.inspect().map==="clearing-hub"'))
        check('Town service and gate approaches are reachable',page.evaluate('[[520,820],[900,520],[1260,820],...BondAtlas.get("clearing-hub").neighbors.map(g=>[g.x,g.y])].every(([x,y])=>BondNav.find("clearing-hub",BondRegion.inspect().position,{x,y}).ok)'))
        # Multi-gate routing must be cancellable by manual clicks.
        page.evaluate('BondRegion.travelTo("clearing-2");BondRegion.moveTo({x:900,y:930})')
        check('Manual route cancels remaining atlas itinerary',page.evaluate('BondRegion.inspect().travelPlan.length===0'))
        # Discovery uses an actual world click / approach, then survives reload.
        page.evaluate('BondProfile.travel("clearing-0");BondRegion.enter(BondApp.getBuild());BondRegion.approachId("sight:clearing-0:spring")')
        page.clock.run_for(16000)
        check('Landmark approach opens journal entry',page.locator('#exploration-dialog').is_visible())
        check('Discovery recorded once',page.evaluate('BondProfile.snapshot().sights.filter(x=>x==="clearing-0:spring").length===1'))
        page.keyboard.press('Escape')
        saved=page.evaluate('({position:BondProfile.snapshot().position,sights:BondProfile.snapshot().sights,coins:BondProfile.snapshot().coins,inventory:Object.fromEntries(Object.entries(BondProfile.snapshot().inventory).filter(([,n])=>n>0))})')
        page.reload();page.wait_for_function('!!window.BondApp');page.clock.run_for(200)
        check('Reload retains position, landmarks and inventory',page.evaluate('({position:BondProfile.snapshot().position,sights:BondProfile.snapshot().sights,coins:BondProfile.snapshot().coins,inventory:Object.fromEntries(Object.entries(BondProfile.snapshot().inventory).filter(([,n])=>n>0))})')==saved)
        # Walk a full opposite-edge route under the real movement loop (accelerated clock).
        for map_id in ['clearing-0','clearing-3']:
            path=page.evaluate('''id=>{const m=BondAtlas.get(id);BondProfile.travel(id,{x:80,y:m.height/2});BondRegion.enter(BondApp.getBuild());const target={x:m.width-80,y:m.height/2},r=BondNav.find(id,BondRegion.inspect().position,target);BondRegion.moveTo(target);return {seconds:r.distance/210,target};}''',map_id)
            check(map_id+' crossing route takes at least 30 seconds',path['seconds']>=30)
            page.clock.run_for(int((path['seconds']+3)*1000))
            check(map_id+' full walk reaches opposite edge without teleport',page.evaluate('p=>Math.hypot(BondRegion.inspect().position.x-p.x,BondRegion.inspect().position.y-p.y)<30',path['target']))
        # 100 map remounts: bound retained chunk/sheet cache and DOM counts.
        for i in range(100):
            page.evaluate('i=>{const m=BondAtlas.maps[i%30];BondProfile.travel(m.id);BondRegion.enter(BondApp.getBuild());}',i)
            page.clock.run_for(20)
        check('100 transitions keep chunk/sheet caches and DOM bounded',page.evaluate('WorldRenderer.inspect().chunkCount<=28&&WorldRenderer.inspect().sheetCount<=2&&document.querySelectorAll("#world-actors").length===1&&document.querySelectorAll(".world-prop").length<200'))
        page.set_viewport_size({'width':390,'height':844})
        page.evaluate('BondProfile.travel("clearing-0");BondRegion.enter(BondApp.getBuild())');page.clock.run_for(300)
        check('390px world has no page overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
        page.screenshot(path=str(ARTIFACTS/'pass16-baseline-mobile.png'),full_page=True)
        page.locator('#world-quality').click();check('Low-effects toggle applies',page.evaluate('BondRegion.inspect().graphics==="low"'))
        page.reload();page.wait_for_function('!!window.BondApp')
        check('Low-effects preference survives reload',page.evaluate('BondRegion.inspect().graphics==="low"'))
        page.emulate_media(reduced_motion='reduce');page.clock.run_for(100)
        check('Reduced motion stops wildlife CSS bob',page.evaluate('[...document.querySelectorAll(".map-object.wild .world-art")].every(e=>getComputedStyle(e).animationName==="none")'))
        page.emulate_media(reduced_motion='no-preference')
        # Explicit scenery failure in a separate profile; gameplay stays available.
        fallback=browser.new_page(viewport={'width':1000,'height':900})
        failed_errors=[];fallback.on('pageerror',lambda e:failed_errors.append(str(e)))
        fallback.route('**/assets/world-v15/*-atlas.png',lambda r:r.abort())
        fallback.goto(url);fallback.wait_for_function('!!window.BondApp&&WorldRenderer.inspect().fallback&&document.querySelector("#world-load-state").textContent.includes("unavailable")')
        check('Asset failure keeps world usable and explains retry',fallback.evaluate('!!BondRegion&&WorldRenderer.inspect().fallback') and 'unavailable' in fallback.locator('#world-load-state').inner_text())
        fallback.unroute('**/assets/world-v15/*-atlas.png');fallback.locator('#world-retry-art').click()
        fallback.wait_for_function('!WorldRenderer.inspect().fallback&&WorldRenderer.inspect().terrainReady')
        check('Scenery retry recovers without JS errors or reset',not failed_errors and fallback.evaluate('BondRegion.inspect().map==="clearing-0"&&BondProfile.snapshot().companions.length===0'))
        fallback.close()
        if args.performance_seconds:
            live=browser.new_page(viewport={'width':1440,'height':1000})
            live.on('pageerror',lambda e:errors.append(str(e)))
            cdp=live.context.new_cdp_session(live)
            cdp.send('Network.enable');cdp.send('Network.setCacheDisabled',{'cacheDisabled':True})
            cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':50,'downloadThroughput':1250000,'uploadThroughput':1250000})
            start=time.monotonic();live.goto(url,wait_until='domcontentloaded');live.wait_for_function('!!window.BondApp')
            first_play=time.monotonic()-start
            live.wait_for_function('WorldRenderer.inspect().terrainReady&&!WorldRenderer.inspect().loading')
            payload=live.evaluate('performance.getEntriesByType("resource").reduce((n,r)=>n+r.encodedBodySize,0)')
            cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':0,'downloadThroughput':-1,'uploadThroughput':-1})
            cdp.send('Network.setCacheDisabled',{'cacheDisabled':False})
            live.evaluate('''()=>{BondProfile.summon("emberfox","druid",BondProfile.testing.grantEcho("emberfox",100));window.traceFrames=[];let last=performance.now();function sample(now){traceFrames.push(now-last);last=now;requestAnimationFrame(sample);}requestAnimationFrame(sample);}''')
            perf_start=time.monotonic(); samples=[]
            while time.monotonic()-perf_start<args.performance_seconds:
                idx=len(samples)%24
                live.evaluate('''idx=>{const m=BondAtlas.maps.filter(m=>m.kind!=="hub")[idx];BondProfile.travel(m.id);BondRegion.enter(BondApp.getBuild());BondRegion.moveTo({x:m.width-80,y:m.height/2});}''',idx)
                live.wait_for_timeout(min(20000,max(1000,(args.performance_seconds-(time.monotonic()-perf_start))*1000)))
                samples.append(live.evaluate('({map:BondRegion.inspect().map,renderer:WorldRenderer.inspect(),heap:performance.memory?.usedJSHeapSize})'))
                print('REALTIME_SAMPLE '+str(len(samples)),flush=True)
            frames=live.evaluate('traceFrames')
            frames.sort()
            perf={'seconds':time.monotonic()-perf_start,'firstInteractiveSecondsAt10Mbps50ms':first_play,'progressiveInitialPayloadBytes':payload,'frames':len(frames),'p95FrameIntervalMs':frames[int(len(frames)*.95)],'samples':samples,'physicalDevice':False}
            (ARTIFACTS/('pass16-baseline-performance-'+args.browser+'.json')).write_text(json.dumps(perf,indent=2),encoding='utf-8')
            print('PERFORMANCE '+json.dumps({k:v for k,v in perf.items() if k!='samples'}),flush=True)
            check('Real-time route sample retains bounded render caches',all(x['renderer']['chunkCount']<=28 and x['renderer']['sheetCount']<=2 for x in samples))
            live.close()
    except Exception as e:
        errors.append(str(e));traceback.print_exc()
    check('No JavaScript errors',not errors);check('No missing assets',not missing)
    check('Runtime sources unchanged during entire suite',source_start==source_hashes())
    report={'browser':args.browser,'browser_version':browser.version,'utc':datetime.now(timezone.utc).isoformat(),'checks':checks,'errors':errors,'missing':missing,'source_sha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}}
    (ARTIFACTS/('pass16-baseline-'+args.browser+'.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'errors':errors,'missing':missing},indent=2),flush=True);browser.close()
server.shutdown()
if not all(c['pass'] for c in checks): raise SystemExit(1)
if args.full:
    sys.argv=['tests/pass16_regression.py','--browser',args.browser]
    runpy.run_path(str(ROOT/'tests/pass16_regression.py'),run_name='__main__')
