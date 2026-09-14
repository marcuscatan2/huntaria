"""Played reference recordings. Browser observation, not owner/newcomer approval."""
import argparse,functools,json,threading,time,platform,hashlib,traceback
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome');args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/?test=1&reference=16'
records=[];errors=[]
source=lambda:{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
start_hash=source()
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    for speed,reduced in [(1,False),(2,False),(1,True)]:
        context=browser.new_context(viewport={'width':1280,'height':1000},reduced_motion='reduce' if reduced else 'no-preference',record_video_dir=str(ARTIFACTS/'pass16-clips'),record_video_size={'width':1280,'height':1000})
        page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
        try:
            page.goto(url);page.wait_for_function('!!window.BondReference');page.evaluate('BondReference.play()')
            page.locator(f'[data-speed="{speed}"]').click()
            page.evaluate('''()=>{window.visualFrames=[];window.visualModes={};let last=performance.now();function sample(now){visualFrames.push(now-last);last=now;for(const r of CombatView.inspect().animation){const key=r.type+':'+r.mode;visualModes[key]=(visualModes[key]||0)+1;}requestAnimationFrame(sample);}requestAnimationFrame(sample);}''')
            deadline=time.monotonic()+90;n=0
            while time.monotonic()<deadline and not page.evaluate('BondApp.getBattle().ended'):
                page.wait_for_timeout(5000);n+=1
                if n%2==0:print(f'REFERENCE {speed}x reduced={reduced} {n*5}s',flush=True)
                if n==2:page.screenshot(path=str(ARTIFACTS/f'pass16-reference-{speed}x-{reduced}.png'),full_page=True)
            page.wait_for_timeout(1100)
            report=page.evaluate('''()=>{const b=BondApp.getBattle(),f=visualFrames.slice(5).sort((a,b)=>a-b),a=CombatView.impactAudit();return {ended:b.ended,winner:b.winner,time:b.time,events:[...new Set(b.events.map(e=>e.kind))],modes:visualModes,frameCount:f.length,p95FrameMs:f[Math.floor(f.length*.95)],p99FrameMs:f[Math.floor(f.length*.99)],impactCount:a.length,maxImpactLateMs:Math.max(0,...a.map(x=>x.lateMs)),audit:a};}''')
            report.update({'speed':speed,'reduced':reduced,'browser':browser.version})
            if speed==1 and not reduced:
                page.evaluate('''()=>{BondApp.switchTab('region');const sp=BondProfile.population().find(s=>s.present&&s.type==='emberfox');BondProfile.testing.setRoll(sp.id,0);BondApp.startRegionBattle(BondProfile.beginHunt(sp.id).id);}''')
                page.wait_for_function('BondApp.getBattle().ended&&BondApp.getTab()==="region"',timeout=30000)
                report['controlledEchoDropShown']=page.locator('#loot-popup').is_visible() and 'Soul Echo' in page.locator('#loot-popup').inner_text()
                page.locator('#loot-inventory').click();page.locator('[data-bag-filter="Echoes"]').click();page.locator('[data-item="echo:emberfox"]').click();page.locator('[data-summon="emberfox"]').click();page.locator('#confirm-summon').click();page.wait_for_timeout(1800)
                report['summonCreatesThirdIndividual']=page.evaluate('BondProfile.snapshot().companions.length===3')
                page.screenshot(path=str(ARTIFACTS/'pass16-reference-summon.png'),full_page=True)
            video=page.video;context.close();target=ARTIFACTS/f'pass16-reference-{speed}x-{reduced}.webm';video.save_as(str(target));report['clip']=target.name
            report['pass']=report['ended'] and report['impactCount']>0 and report['maxImpactLateMs']<=(100 if speed==2 else 50) and report.get('summonCreatesThirdIndividual',True) and report.get('controlledEchoDropShown',True)
            records.append(report)
        except Exception:
            errors.append(traceback.format_exc());context.close()
    browser.close()
server.shutdown()
result={'records':records,'errors':errors,'platform':platform.platform(),'processor':platform.processor(),'sourceHashes':start_hash,'sourcesStable':start_hash==source(),'headlessDesktop':True,'physicalPhone':False,'ownerApproved':False,'newcomerObservers':0}
(ARTIFACTS/('pass16-visual-'+args.browser+'.json')).write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({**result,'records':[{k:v for k,v in r.items() if k not in ['audit','modes']} for r in records],'sourceHashes':len(start_hash)},indent=2),flush=True)
raise SystemExit(0 if len(records)==3 and all(r['pass'] for r in records) and not errors and result['sourcesStable'] else 1)
