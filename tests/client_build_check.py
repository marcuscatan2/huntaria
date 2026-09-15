"""Allowlisted repeatable client bundle and packaged-browser smoke. No deployment."""
import argparse,functools,hashlib,json,sys,tempfile,threading,traceback
from pathlib import Path
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
sys.path.insert(0,str(ROOT/'scripts'))
import client_build

def main():
    p=argparse.ArgumentParser();p.add_argument('--browser',choices=['chrome','edge'],default='chrome');args=p.parse_args()
    checks=[];errors=[];missing=[];server=None;metrics={}
    build_temp=tempfile.TemporaryDirectory(prefix='bond-client-package-')
    build_parent=Path(build_temp.name)
    def check(name,ok):checks.append({'name':name,'pass':bool(ok)});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
    try:
        folder,manifest=client_build.build_to(parent=build_parent)
        folder2,manifest2=client_build.build_to(parent=build_parent)
        check('Unchanged sources reproduce the same immutable build',folder==folder2 and manifest==manifest2)
        check('Every bundled file verifies its declared SHA-256',client_build.verify(folder)==manifest)
        names=manifest['files'];check('No test tools, reference scenes, docs or source metadata shipped',not any(n.startswith(('tests/','docs/','scripts/','.')) or n.endswith('.md') or n in ('test-controls.js','reference-scene.js') for n in names))
        check('Build explicitly remains local-preview, not production',manifest['build']['mode']=='local-preview' and manifest['build']['profileSchema']==7)
        check('All 100 supplied portraits available on demand',sum(n.startswith('assets/monsters/') for n in names)==100)
        with tempfile.TemporaryDirectory(prefix='bond-build-check-') as temporary:
            fixture=Path(temporary);(fixture/'assets').mkdir()
            (fixture/'assets/tiny.png').write_bytes(b'fixture');(fixture/'data').mkdir()
            config={'schema':1,'mode':'local-preview','profile_schema':7,'exclude_scripts':['test-controls.js'],'asset_patterns':['assets/*.png'],'rules':['game.js']}
            (fixture/'data/client-build.json').write_text(json.dumps(config),encoding='utf-8')
            (fixture/'index.html').write_text('<head><script src="game.js" defer></script><script src="test-controls.js" defer></script></head>',encoding='utf-8')
            (fixture/'game.js').write_text('const version=1;',encoding='utf-8')
            first,_,_=client_build.assemble(fixture);(fixture/'game.js').write_text('const version=2;',encoding='utf-8');second,_,_=client_build.assemble(fixture)
            check('Changing a rule produces a different build identity',first!=second)
            bad,_=client_build.build_to(fixture,fixture/'output');(bad/'game.js').write_text('tampered',encoding='utf-8')
            rejected=False
            try:client_build.verify(bad)
            except ValueError:rejected=True
            check('Tampered build files fail validation',rejected)
            (bad/'extra.txt').write_text('extra',encoding='utf-8');rejected=False
            try:client_build.verify(bad)
            except ValueError:rejected=True
            check('Unmanifested additions fail validation',rejected)
        server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(folder)))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        with sync_playwright() as pw:
            browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
            page=browser.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
            page.goto(f'http://127.0.0.1:{server.server_port}/');page.wait_for_function('!!window.BondApp')
            check('Packaged entry boots its exact manifest identity',page.evaluate('BondBuild.id')==manifest['build']['id'])
            check('Normal package has no QA grants or developer controls',page.evaluate('BondProfile.testing===null&&!document.querySelector("#test-controls")&&typeof BondReference==="undefined"'))
            page.locator('#character-name').fill('Trailwalker');page.locator('#create-character').click()
            page.wait_for_function('BondProfile.snapshot().character?.name==="Trailwalker"')
            check('Packaged fresh character reaches the starting map',page.evaluate('BondProfile.snapshot().map===BondOpening.start.map&&BondApp.getTab()==="region"'))
            page.wait_for_timeout(1200)
            metrics=page.evaluate('''()=>{const r=performance.getEntriesByType('resource');return {observedBytes:r.reduce((s,x)=>s+x.transferSize,0),requestedPortraits:r.filter(x=>x.name.includes('/assets/monsters/')).length,audioRequested:r.some(x=>x.name.includes('/assets/audio/')),resources:r.length,largest:r.filter(x=>x.transferSize>500000).map(x=>({path:new URL(x.name).pathname,bytes:x.transferSize}))};}''')
            check('Startup does not request all portraits or audio',metrics['requestedPortraits']<20 and not metrics['audioRequested'])
            page.evaluate('BondApp.switchTab("loadout");BondMenu.open("collection")');page.wait_for_function('document.querySelector("#haven-scene").dataset.ready==="true"')
            check('Packaged Inner Sea renders without developer files',page.locator('#haven-scene').count()==1)
            active_save=page.evaluate('''()=>{const P=BondProfile,sp=P.population().find(x=>x.type==='emberfox'&&x.present);P.position(BondAtlas.safePoint(P.snapshot().map,{x:sp.x-70,y:sp.y}));if(!BondApp.startRegionBattle(P.beginHunt(sp.id).id))throw Error('Could not reserve failure fixture');const s=P.snapshot();s.coins=73;s.companions.push({id:'fixture:benched',type:'ashbasilisk',ordinal:1,xp:100,skills:[...BondContent.UNITS.ashbasilisk.default],growth:{},pact:{map:s.map,trainerClass:'druid'}});return JSON.stringify(s);}''')
            for module in ['game.js','growth.js','campaign.js','roster.js']:
                failed=browser.new_page();failed.clock.install()
                failed.add_init_script('if(!localStorage.getItem("bond-bolt-profile-v7"))localStorage.setItem("bond-bolt-profile-v7",'+json.dumps(active_save)+')')
                failed.route('**/'+module,lambda route:route.abort())
                failed.goto(f'http://127.0.0.1:{server.server_port}/');failed.clock.run_for(8200)
                check(module+': missing essential script gives a recoverable error',failed.locator('#boot-status').is_visible() and 'could not finish loading' in failed.locator('#boot-status').inner_text())
                check(module+': failed loading preserves the entire active save byte-for-byte',failed.evaluate('localStorage.getItem("bond-bolt-profile-v7")')==active_save)
                failed.unroute('**/'+module);failed.locator('#boot-status a').click();failed.wait_for_function('globalThis.BondBoot?.inspect().ready')
                check(module+': reload recovers progress and the reserved fight',not failed.locator('#boot-status').is_visible() and failed.evaluate('BondProfile.snapshot().coins===73&&!!BondProfile.snapshot().encounterSave&&BondProfile.companions().some(m=>m.id==="fixture:benched")'))
                failed.close()
            browser.close()
    except Exception:errors.append(traceback.format_exc())
    finally:
        if server:server.shutdown();server.server_close()
        build_temp.cleanup()
    check('Validation removes its temporary game packages',not build_parent.exists())
    check('No package/browser errors',not errors);check('No missing packaged requests',not missing)
    report={'checks':checks,'errors':errors,'missing':missing,'metrics':metrics,'manifest':locals().get('manifest')}
    (ARTIFACTS/f'client-build-{args.browser}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'passed':sum(x['pass'] for x in checks),'total':len(checks),'metrics':metrics,'failures':[x for x in checks if not x['pass']],'errors':errors},indent=2))
    return 0 if checks and all(x['pass'] for x in checks) else 1
if __name__=='__main__':raise SystemExit(main())
