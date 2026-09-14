"""Cold HTTP delivery timing; no fake clock, fresh isolated browser profile."""
import argparse,functools,json,threading,time,hashlib
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
p=argparse.ArgumentParser();p.add_argument('--browser',default='chrome');args=p.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    page=b.new_page(viewport={'width':1440,'height':1000});cdp=page.context.new_cdp_session(page)
    cdp.send('Network.enable');cdp.send('Network.setCacheDisabled',{'cacheDisabled':True})
    cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':50,'downloadThroughput':1250000,'uploadThroughput':1250000})
    start=time.monotonic();page.goto(f'http://127.0.0.1:{server.server_port}/?test=1',wait_until='domcontentloaded')
    page.wait_for_function('!!window.BondApp')
    interactive=time.monotonic()-start
    critical=page.evaluate('performance.getEntriesByType("resource").filter(r=>r.responseEnd<=performance.now()).map(r=>({url:r.name.split("/").slice(3).join("/"),bytes:r.encodedBodySize,end:r.responseEnd}))')
    page.wait_for_load_state('networkidle');page.wait_for_timeout(1000)
    resources=page.evaluate('performance.getEntriesByType("resource").map(r=>({url:r.name.split("/").slice(3).join("/"),bytes:r.encodedBodySize,end:r.responseEnd}))')
    navigation=page.evaluate('''()=>BondAtlas.maps.filter(m=>m.kind!=="hub").map(m=>{const t=performance.now(),r=BondNav.find(m.id,m.entry,{x:m.width-80,y:m.height/2});return {id:m.id,ms:performance.now()-t,ok:r.ok,distance:r.distance};})''')
    result={'interactiveSeconds':interactive,'criticalBytes':sum(x['bytes'] for x in critical),'totalInitialBytes':sum(x['bytes'] for x in resources),'resources':resources,'nav':navigation,'profile':'10Mbps throughput / 50ms latency, no HTTP cache; headless desktop','actualFrameBudgetCertified':False}
    result['source_sha256']={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted([*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html'])}
    mechanics=b.new_page()
    mechanics_errors=[];mechanics.on('pageerror',lambda e:mechanics_errors.append(str(e)))
    mechanics.goto(f'http://127.0.0.1:{server.server_port}/tests/index.html?test=1')
    mechanics.locator('#run').click()
    mechanics.wait_for_function('document.querySelector("#output").textContent!=="Ready."')
    result['standaloneMechanics']=json.loads(mechanics.locator('#output').inner_text())
    assert not mechanics_errors and result['standaloneMechanics']['passed']==result['standaloneMechanics']['total']
    mechanics.close()
    (ARTIFACTS/('pass15-delivery-'+args.browser+'.json')).write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result,indent=2),flush=True)
    b.close()
server.shutdown()
