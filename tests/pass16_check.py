"""Isolated pass16 content/recovery checks; never opens a personal profile."""
import argparse, functools, json, threading, hashlib, traceback
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright
from http.server import ThreadingHTTPServer
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome');args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1100})
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
        page.wait_for_function('!!window.BondApp',timeout=15000)
        print(json.dumps(page.evaluate('({campaign:BondCampaign.validate(),atlas:BondAtlas.validate(),roles:[...new Set(BondContent.MONSTERS.map(t=>BondContent.UNITS[t].role))]})')),flush=True)
        checks=page.evaluate((ROOT/'tests/pass16_cases.js').read_text(encoding='utf-8'))
        page.evaluate('BondApp.cancelRegionBattle();BondApp.switchTab("region");BondCampaignMenu.open()')
        page.screenshot(path=str(ARTIFACTS/('pass16-journal-'+args.browser+'.png')),full_page=True)
    except Exception:
        errors.append(traceback.format_exc())
    print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'failures':[c for c in checks if not c['pass']],'errors':errors},indent=2),flush=True)
    result={'browser':browser.version,'checks':checks,'errors':errors,'sourceHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}}
    (ARTIFACTS/('pass16-'+args.browser+'.json')).write_text(json.dumps(result,indent=2),encoding='utf-8')
    browser.close()
server.shutdown()
raise SystemExit(0 if checks and all(c['pass'] for c in checks) and not errors else 1)
