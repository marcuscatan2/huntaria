"""Final rendering audit: real changing pixels, alpha, pause, fallback and file play."""
import argparse
from datetime import datetime,timedelta,timezone
import functools,http.server,json,threading
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright

def run(name='chrome'):
    checks=[];errors=[]
    def check(label,value):
        checks.append(dict(name=label,passed=bool(value)));print(('PASS ' if value else 'FAIL ')+label,flush=True)
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as pw:
            b=pw.chromium.launch(executable_path=find_browser(name),headless=True)
            ctx=b.new_context(viewport=dict(width=1440,height=1050));p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
            now=datetime.now(timezone.utc);p.clock.install(time=now);p.clock.pause_at(now+timedelta(seconds=60))
            p.goto(f'http://127.0.0.1:{server.server_port}/');p.evaluate('CharacterRig.ready()');p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))");p.clock.run_for(50)
            p.screenshot(path=str(ARTIFACTS/f'{name}-v10-world-final.png'),full_page=True)
            data=p.evaluate("""()=>{
              const out={};
              for(const type of ['druid','emberfox','stonehorn']){
                const n=document.createElement('div');n.innerHTML=CharacterRig.art(type);document.body.append(n);
                const rig=CharacterRig.mount(n,type),hashes=new Set(),walk=new Set(),attack=new Set(),cast=new Set();
                const record=set=>{set.add(rig.canvas.toDataURL());hashes.add(rig.canvas.toDataURL());};
                for(const time of [0,.16,.30,.46,.62]){CharacterRig.pose(rig,{time,walking:true,rate:1});record(walk);}
                for(const action of ['attack','cast']){CharacterRig.trigger(rig,action,1,.7);
                  for(const time of [1,1.06,1.13,1.25,1.48]){CharacterRig.pose(rig,{time});record(action==='attack'?attack:cast);}
                }
                const config=BondAnimationData[type];
                const inside=config.frames.every(f=>{const w=(f.rect[2]-f.rect[0])*config.scale,h=(f.rect[3]-f.rect[1])*config.scale;return 160-w*f.pivot>=0&&160+w*(1-f.pivot)<=320&&300-h>=0;});
                out[type]={walk:walk.size,attack:attack.size,cast:cast.size,unique:hashes.size,cornerAlpha:rig.ctx.getImageData(0,0,1,1).data[3],inside};
                n.remove();
              }return out;
            }""")
            for type_,d in data.items():
                check(f'{type_}: walk cycle changes actual pixels',d['walk']>=3)
                check(f'{type_}: attacks and casts each draw four distinct images',d['attack']==4 and d['cast']==4)
                check(f'{type_}: genuine transparent output and no frame clipping',d['cornerAlpha']==0 and d['inside'])
            p.locator('#tab-loadout').click();p.locator('#fight').click();p.clock.run_for(7200);p.locator('#pause').click()
            before=p.evaluate("JSON.stringify(CombatView.inspect().animation)")
            pixels=p.evaluate("JSON.stringify([...document.querySelectorAll('.fighter canvas')].map(c=>c.toDataURL()))")
            p.clock.run_for(1000)
            check('Pause freezes animation state and pixels',p.evaluate("JSON.stringify(CombatView.inspect().animation)")==before and p.evaluate("JSON.stringify([...document.querySelectorAll('.fighter canvas')].map(c=>c.toDataURL()))")==pixels)
            p.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
            p.screenshot(path=str(ARTIFACTS/f'{name}-v10-combat-final.png'),full_page=True)
            p.locator('#start-battle').click();p.clock.run_for(500)
            check('Resume advances actual animated combat again',p.evaluate("JSON.stringify(CombatView.inspect().animation)")!=before)
            # Failed sheet load keeps the original portrait visible; gameplay still runs.
            fallback=b.new_context();q=fallback.new_page()
            q.route('**/*-sheet.png',lambda route:route.abort())
            q.goto(f'http://127.0.0.1:{server.server_port}/');q.evaluate('CharacterRig.ready()')
            check('Missing animation sheets retain visible original artwork',q.evaluate("CharacterRig.inspect().every(s=>s.error)&&[...document.querySelectorAll('#world-layer .character-sprite:not(canvas)')].every(i=>!i.hidden)"))
            fallback.close()
            filectx=b.new_context();q=filectx.new_page();q.on('pageerror',lambda e:errors.append(str(e)))
            now=datetime.now(timezone.utc);q.clock.install(time=now);q.clock.pause_at(now+timedelta(seconds=60))
            q.goto((ROOT/'index.html').as_uri());q.evaluate("BondApp.startRegionBattle('ritual:clearing:bloomslime')");q.clock.run_for(14000)
            q.locator('#begin-ritual').click();q.clock.run_for(4500)
            check('Direct file-open completes a capture without a server',q.evaluate("BondProfile.owns('bloomslime')&&BondProfile.snapshot().inventory.bondcontract===2"))
            q.clock.run_for(1600)
            check('Bound spirit leaves the arena and its HUD shows the Haven',q.locator('.fighter[data-id="1-1"]').get_attribute('style').find('opacity: 0;')>=0 and 'BONDED' in q.locator('#dusk-bond-text').inner_text())
            q.screenshot(path=str(ARTIFACTS/f'{name}-v10-pact-final.png'),full_page=True)
            filectx.close()
            check('No JavaScript errors in final rendering and file-mode checks',not errors)
            report=dict(browser=name,checks=checks,rendering=data,errors=errors)
            (ARTIFACTS/f'{name}-v10-animation-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
            print(json.dumps(dict(passed=sum(c['passed'] for c in checks),failed=[c for c in checks if not c['passed']],errors=errors)),flush=True)
            b.close();assert all(c['passed'] for c in checks)
    finally:server.shutdown();server.server_close()

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--browser',choices=['chrome','edge'],default='chrome');run(ap.parse_args().browser)
