"""Real-time frame and cache sample on a pinned local build, not a hardware certificate."""
import argparse,functools,json,threading,time,hashlib
from datetime import datetime,timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
p=argparse.ArgumentParser();p.add_argument('--browser',default='chrome');p.add_argument('--seconds',type=int,default=300);args=p.parse_args()
sources=lambda:{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
before=sources();errors=[]
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    page=b.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
    page.wait_for_function('!!window.BondApp&&WorldRenderer.inspect().terrainReady&&!WorldRenderer.inspect().loading')
    page.evaluate('''()=>{BondProfile.summon("emberfox","druid",BondProfile.testing.grantEcho("emberfox",100));window.traceFrames=[];let last=performance.now();function sample(now){traceFrames.push(now-last);last=now;requestAnimationFrame(sample);}requestAnimationFrame(sample);}''')
    maps=[r+'-'+suffix for r in ['clearing','brook','hollow','ruins','rise','ashen'] for suffix in ['0','3']]
    start=time.monotonic();samples=[];combats=0
    while time.monotonic()-start<args.seconds:
        target=maps[len(samples)%len(maps)]
        page.evaluate('''id=>{const m=BondAtlas.get(id);BondProfile.travel(m.id);BondRegion.enter(BondApp.getBuild());BondRegion.moveTo({x:m.width-80,y:m.height/2});}''',target)
        if target=='clearing-0':
            page.evaluate('''()=>{const sp=BondProfile.population().find(s=>s.present&&s.type==="emberfox");if(sp){const e=BondProfile.beginHunt(sp.id);BondApp.startRegionBattle(e.id);}}''')
            page.wait_for_timeout(3500)
            if page.locator('#loot-popup').is_visible():page.locator('#loot-continue').click();combats+=1
            page.evaluate('BondRegion.moveTo({x:10000,y:5040})')
        page.wait_for_timeout(min(20000,max(1000,(args.seconds-(time.monotonic()-start))*1000)))
        samples.append(page.evaluate('({map:BondRegion.inspect().map,renderer:WorldRenderer.inspect(),nav:BondNav.inspect(),heap:performance.memory?.usedJSHeapSize,props:document.querySelectorAll(".world-prop").length})'))
        print('TRACE '+str(len(samples))+' '+target,flush=True)
    frames=page.evaluate('traceFrames');frames.sort()
    result={'browser':args.browser,'browser_version':b.version,'utc':datetime.now(timezone.utc).isoformat(),'seconds':time.monotonic()-start,'frames':len(frames),'p95FrameIntervalMs':frames[int(len(frames)*.95)],'p99FrameIntervalMs':frames[int(len(frames)*.99)],'combatReturns':combats,'samples':samples,'errors':errors,'source_sha256':before,'sourceUnchanged':before==sources(),'physicalDevice':False,'conditions':'Headless desktop 1440x1000, real clock, localhost, default effects, six biomes field/cave routes'}
    (ARTIFACTS/('pass15-trace-'+args.browser+'.json')).write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k not in ['samples','source_sha256']},indent=2),flush=True)
    assert not errors and result['sourceUnchanged']
    assert all(x['renderer']['chunkCount']<=28 and x['renderer']['sheetCount']<=2 and x['nav']['cachedMaps']<=4 and x['props']<200 for x in samples)
    b.close()
server.shutdown()
