"""Pass17: isolated saves, actual Chromium runtime, source-hashed evidence."""
import argparse,functools,json,threading,hashlib,traceback,time
from datetime import datetime,timedelta,timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome');args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
hashes=lambda:{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
source=hashes();checks=[];errors=[];missing=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=10))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
        page.wait_for_function('!!window.BondApp',timeout=30000)
        checks=page.evaluate((ROOT/'tests/pass17_cases.js').read_text(encoding='utf-8'))
        page.add_script_tag(content=(ROOT/'tests/pass15-engine.js').read_text(encoding='utf-8'))
        engine=page.evaluate('runPass15Engine()');checks.extend(engine['results'])
        manifest=page.evaluate("""()=>({version:17,species:BondRoster.manifest().map(u=>({...u,habitat:BondAtlas.home(u.id),passiveInfo:BondContent.PASSIVES[u.passive],kit:u.skills.map(id=>({id,...BondContent.SKILLS[id]}))})),maps:BondAtlas.maps.map(({scenery,collisionBuckets,obstacles,...m})=>m),regions:BondAtlas.REGIONS,families:BondRoster.families})""")
        manifest['source_sha256']=source
        (ARTIFACTS/('pass17-reference-'+args.browser+'.json')).write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
    except Exception:
        errors.append(traceback.format_exc())
    checks.extend([{'name':'No JavaScript errors','pass':not errors},{'name':'No missing runtime assets','pass':not missing},{'name':'Runtime unchanged throughout checks','pass':source==hashes()}])
    report={'browser':args.browser,'version':browser.version,'utc':datetime.now(timezone.utc).isoformat(),'checks':checks,'errors':errors,'missing':missing,'source_sha256':source}
    (ARTIFACTS/('pass17-'+args.browser+'.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'failures':[c for c in checks if not c['pass']],'errors':errors},indent=2),flush=True)
    browser.close()
server.shutdown()
raise SystemExit(0 if checks and all(c['pass'] for c in checks) else 1)
