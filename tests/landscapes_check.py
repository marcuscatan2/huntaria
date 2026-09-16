"""Landscape geometry, chunk-edge shading, atlas loading and phone presentation."""
import argparse
import functools
import hashlib
import json
import threading
import traceback
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, legacy_adventure, sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser', choices=['chrome', 'edge'], default='chrome')
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    checks, errors, missing = [], [], []
    hashes = lambda: {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in [*ROOT.glob('*.js'), *ROOT.glob('*.css'), ROOT/'index.html']}
    source = hashes()

    def check(name, value, detail=None):
        checks.append({'name': name, 'pass': bool(value), 'detail': detail})
        print(('PASS ' if value else 'FAIL ') + name, flush=True)

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
            page = browser.new_page(viewport={'width': 1440, 'height': 1000})
            legacy_adventure(page)
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('response', lambda r: missing.append(r.url) if r.status >= 400 else None)
            now = datetime.now(timezone.utc)
            page.clock.install(time=now)
            page.clock.pause_at(now + timedelta(seconds=1))
            page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
            page.wait_for_function('!!window.BondApp')
            page.evaluate("""()=>{const s=BondProfile.snapshot();s.journey.early.mageGate=true;s.journey.early.introFightWon=true;BondProfile.testing.replace(s);}""")
            check('Every existing map has an individual landscape identity', page.evaluate("""()=>{
              const maps=BondAtlas.maps;return maps.length===40&&new Set(maps.map(m=>m.landscape.identity)).size===40&&maps.every(m=>m.scenery.some(s=>s.sceneryAtlas)&&m.scenery.some(s=>s.key.includes(':landscape:')));
            }"""))
            check('Every crossing ground patch is present on both sides of a texture seam', page.evaluate("""()=>{
              const sample=BondScenery.groundPatches;
              return BondAtlas.maps.every(m=>[1024,4096,7168].every(edge=>{
                const left=sample(m.id,edge-1024,2048,edge,3072),right=sample(m.id,edge,2048,edge+1024,3072);
                const crosses=p=>p.x-p.radius<edge&&p.x+p.radius>edge;
                const keys=xs=>xs.filter(crosses).map(p=>JSON.stringify(p)).sort().join('|');
                return keys(left)===keys(right)&&left.some(crosses);
              }));
            }"""))
            check('Scenery never leaks cropped legacy rock fragments or floating gate icons', page.evaluate("""()=>BondAtlas.maps.every(m=>m.scenery.filter(p=>/:prop\\d|:edge\\d|:wall:\\d/.test(p.key)&&!p.towerWall).every(p=>p.art!==5||p.sceneryAtlas))"""))
            check('All landscape frames remain within their original source sheet', page.evaluate("""()=>Object.values(BondScenery.FRAMES).every(frames=>frames.length===12&&frames.every(([x,y,r,b])=>x>=0&&y>=0&&r<=1448&&b<=1086&&r>x&&b>y))"""))
            maps = page.evaluate('BondAtlas.maps.map(m=>m.id)')
            captures = {'clearing-0','clearing-1','brook-0','hollow-1','hollow-2','ruins-1','ruins-2','rise-2','ashen-1','ashen-3','brook-hub','ghost-tower-2','ghost-tower-4'}
            for map_id in maps:
                result = page.evaluate("""id=>{
                  const m=BondAtlas.get(id),failures=[];
                  for(const g of m.neighbors)if(BondAtlas.collision(id,g)||BondAtlas.collision(g.to,g.arrival)||!BondNav.find(id,m.entry,g).ok)failures.push('gate '+g.to);
                  const targets=[m.cache,m.guide,...m.habitats,...(m.buildings||[]).map(b=>b.door),...BondCampaign.trainers.filter(n=>n.map===id),...BondCampaign.earlyEncounters.filter(n=>n.map===id)];
                  if(id===BondRelicQuest.tully.map)targets.push(BondRelicQuest.tully);
                  for(const p of targets)if(!BondNav.find(id,m.entry,BondAtlas.safePoint(id,p)).ok)failures.push('service '+(p.id||p.type||JSON.stringify(p)));
                  const pop=BondProfile.population(id);if(pop.filter(p=>p.present).length!==BondPopulation.total(m))failures.push('population quota');
                  if(pop.some(p=>p.present&&BondAtlas.collision(id,p)))failures.push('blocked population');
                  BondProfile.travel(id,{x:m.hero.x,y:m.hero.y+180});BondApp.switchTab('region');
                  return failures;
                }""", map_id)
                check(map_id + ': gates, services and full populations remain accessible', not result, result)
                page.clock.run_for(100)
                page.wait_for_function('!WorldRenderer.inspect().loading&&WorldRenderer.inspect().landscapeReady&&WorldRenderer.inspect().terrainReady')
                page.clock.run_for(80)
                check(map_id + ': painted scenery loads without placeholder markers', page.locator('.landmark-art,.world-gate-visual').count()==0 and page.evaluate("[...document.querySelectorAll('.world-prop')].some(e=>e.style.backgroundImage.includes('-atlas.webp'))"))
                if map_id in captures:
                    page.locator('#region-map').screenshot(path=str(ARTIFACTS/f'landscape-{map_id}-{args.browser}.png'))
            # Two general landscape sheets plus the tower-only stonework sheet.
            check('Repeated map changes retain bounded textures and visible props', page.evaluate("""()=>{const s=WorldRenderer.inspect();return s.chunkCount<=28&&s.sheetCount<=2&&s.landscapeSheetCount===3&&s.decodedLandscapeBytes<=19*1024*1024&&document.querySelectorAll('.world-prop').length<200;}"""))
            stairs = page.evaluate("BondAtlas.maps.flatMap(m=>m.neighbors.filter(g=>g.kind==='stairs').map(g=>[m.id,g.to]))")
            for origin, destination in stairs:
                page.evaluate("""([from,to])=>{const g=BondAtlas.get(from).neighbors.find(g=>g.to===to);BondProfile.travel(from,{x:g.x+90,y:g.y});BondApp.switchTab('region');}""", [origin,destination])
                page.clock.run_for(100)
                page.wait_for_function('WorldRenderer.inspect().landscapeReady')
                page.clock.run_for(80)
                gate = page.locator('[data-object="'+origin+'>'+destination+'"]')
                check(origin+' -> '+destination+': stair tap area follows the painted steps', gate.evaluate("""e=>{const p=WorldRenderer.bounds(e.dataset.object+':stairs');return p&&Math.abs(parseFloat(e.style.width)-p.width)<1&&Math.abs(parseFloat(e.style.height)-p.height)<1&&Math.abs(parseFloat(e.style.top)-p.y)<1&&e.querySelector('.world-label').textContent.includes('GO ');}"""))
                box = gate.bounding_box()
                gate.click(position={'x':box['width']*.25,'y':box['height']*.55})
                page.clock.run_for(100)
                check(origin+' -> '+destination+': tapping the side of the steps changes floors', page.evaluate('BondProfile.snapshot().map')==destination)
            page.evaluate("()=>{BondProfile.travel('ghost-tower-4',{x:2100,y:1150});BondApp.switchTab('region');document.querySelector('#world-quality').click();}")
            page.clock.run_for(100)
            check('Low effects keeps all four grave silhouettes visible', page.evaluate("""()=>{const graves=[...document.querySelectorAll('[data-tower-art="burial"]')];return BondRegion.inspect().graphics==='low'&&new Set(graves.map(e=>e.dataset.towerFrame)).size===4&&graves.every(e=>e.style.backgroundImage.includes('ghost-tower-atlas.webp'));}"""))
            page.locator('#region-map').screenshot(path=str(ARTIFACTS/f'tower-burials-low-{args.browser}.png'))
            page.evaluate("document.querySelector('#world-quality').click()")
            check('QA validation used only disposable sandbox storage', page.evaluate("!Object.keys(localStorage).includes('bond-bolt-profile-v7')"))
            # Ordinary mobile play has no developer panels above its game frame.
            snapshot = page.evaluate('BondProfile.export()')
            phone = browser.new_page(viewport={'width':390,'height':844})
            phone.on('pageerror', lambda e: errors.append(str(e)))
            phone.add_init_script('localStorage.setItem("bond-bolt-profile-v7",' + json.dumps(snapshot) + ')')
            phone.clock.install(time=now)
            phone.clock.pause_at(now + timedelta(seconds=1))
            phone.goto(f'http://127.0.0.1:{server.server_port}/')
            phone.wait_for_function('!!window.BondApp')
            page = phone
            page.emulate_media(reduced_motion='reduce')
            for map_id in ['clearing-1','hollow-2','ghost-tower-4']:
                page.evaluate("""id=>{const m=BondAtlas.get(id);BondProfile.travel(id,{x:m.hero.x,y:m.hero.y+180});BondApp.switchTab('region');}""", map_id)
                page.clock.run_for(100)
                page.wait_for_function('!WorldRenderer.inspect().loading&&WorldRenderer.inspect().landscapeReady')
                page.clock.run_for(80)
                check(map_id + ': phone scene and controls fit, with motion disabled', page.evaluate("""()=>{const r=document.querySelector('#region-map').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+2&&r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&[...document.querySelectorAll('.world-prop')].every(e=>!e.style.transform.includes('rotate(')||e.style.transform.includes('rotate(0deg)'));}"""))
                page.screenshot(path=str(ARTIFACTS/f'landscape-{map_id}-phone-{args.browser}.png'))
            failure = browser.new_page()
            legacy_adventure(failure)
            failure.clock.install(time=now)
            failure.clock.pause_at(now + timedelta(seconds=1))
            failure.route('**/nature-atlas.webp', lambda route: route.abort())
            failure.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
            failure.wait_for_function('!!window.BondApp')
            failure.clock.run_for(100)
            failure.wait_for_function('WorldRenderer.inspect().fallback')
            failure.clock.run_for(100)
            check('A failed landscape download appears as a recoverable asset failure', failure.locator('#world-load-state').is_visible())
            failure.unroute('**/nature-atlas.webp')
            failure.evaluate('WorldRenderer.retry()')
            failure.wait_for_function('WorldRenderer.inspect().landscapeReady&&!WorldRenderer.inspect().fallback')
            failure.clock.run_for(100)
            check('Retry loads the missing landscape without changing the save', failure.evaluate('BondProfile.snapshot().map==="clearing-0"&&!WorldRenderer.inspect().fallback'))
            failure.route('**/ghost-tower-atlas.webp', lambda route: route.abort())
            failure.evaluate("()=>{const s=BondProfile.snapshot();s.journey.early.mageGate=true;s.journey.early.introFightWon=true;BondProfile.testing.replace(s);const m=BondAtlas.get('hollow-2'),g=m.neighbors.find(g=>g.kind==='stairs');BondProfile.travel(m.id,{x:g.x+90,y:g.y});BondApp.switchTab('region');}")
            failure.clock.run_for(100)
            failure.wait_for_function('WorldRenderer.inspect().fallback')
            failure.clock.run_for(100)
            failure.locator('#region-map').screenshot(path=str(ARTIFACTS/f'tower-stairs-fallback-{args.browser}.png'))
            failure.locator('[data-object="hollow-2>ghost-tower-1"]').click()
            failure.clock.run_for(100)
            check('An unavailable stonework atlas preserves usable fallback stairs', failure.evaluate("BondProfile.snapshot().map==='ghost-tower-1'&&WorldRenderer.inspect().fallback"))
            before_retry = failure.evaluate('BondProfile.export()')
            failure.unroute('**/ghost-tower-atlas.webp')
            failure.evaluate('WorldRenderer.retry()')
            failure.wait_for_function('WorldRenderer.inspect().landscapeReady&&!WorldRenderer.inspect().fallback')
            failure.clock.run_for(100)
            check('Stonework retry restores painted steps without changing the save', failure.evaluate('BondProfile.export()')==before_retry and failure.evaluate("[...document.querySelectorAll('[data-tower-art=stairs]')].some(e=>e.style.backgroundImage.includes('ghost-tower-atlas.webp'))"))
            failure.close()
            check('No browser errors or missing assets', not errors and not missing, {'errors':errors,'missing':missing})
            browser.close()
    except Exception:
        check('Landscape browser flow completed', False, traceback.format_exc())
        traceback.print_exc()
    finally:
        server.shutdown()
    check('Runtime sources stayed fixed during validation', source==hashes())
    (ARTIFACTS/f'landscapes-{args.browser}.json').write_text(json.dumps({'checks':checks},indent=2),encoding='utf-8')
    return 0 if checks and all(c['pass'] for c in checks) else 1


if __name__ == '__main__':
    raise SystemExit(main())
