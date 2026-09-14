"""1,000 deterministic browser/Node outcomes. Uses Node already in test tooling."""
import argparse,functools,hashlib,json,os,shutil,subprocess,threading,traceback
from pathlib import Path
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright
import playwright

def node_path():
    found=os.environ.get('BOND_NODE') or shutil.which('node')
    if found:return found
    candidate=Path(playwright.__file__).parent/'driver'/('node.exe' if os.name=='nt' else 'node')
    if candidate.is_file():return str(candidate)
    raise RuntimeError('Node not found. Set BOND_NODE to an installed Node executable.')
def main():
    p=argparse.ArgumentParser();p.add_argument('--browser',choices=['chrome','edge'],default='chrome');a=p.parse_args()
    modules=json.loads((ROOT/'data/simulator-modules.json').read_text(encoding='utf-8'))
    inputs=[*modules,'data/simulator-modules.json','tests/runtime_cases.js','scripts/simulator.cjs']
    hashes=lambda:{n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in inputs};source=hashes()
    checks=[];errors=[];node=None
    server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    def check(name,ok):checks.append({'name':name,'pass':bool(ok)})
    try:
        process=subprocess.run([node_path(),str(ROOT/'scripts/simulator.cjs'),'1000'],cwd=ROOT,text=True,capture_output=True,timeout=300)
        if process.returncode:raise RuntimeError(process.stderr)
        node=json.loads(process.stdout);print('Node corpus complete: '+json.dumps(node['cpu']),flush=True)
        with sync_playwright() as pw:
            browser=pw.chromium.launch(executable_path=find_browser(a.browser),headless=True)
            page=browser.new_page();page.goto(f'http://127.0.0.1:{server.server_port}/data/simulator-modules.json')
            for name in [*modules,'tests/runtime_cases.js']:page.add_script_tag(path=str(ROOT/name))
            actual=[]
            for start in range(0,1000,50):
                actual.extend(page.evaluate('''async start=>{const out=[];for(let i=start;i<start+50;i++){const r=BondRuntimeFixtures.run(i),bytes=new TextEncoder().encode(BondRuntimeFixtures.canonical(r));const digest=await crypto.subtle.digest('SHA-256',bytes);out.push([...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join(''));}return out;}''',start))
                print(f'Compared {start+50}/1000 fights',flush=True)
            for i,(expected,result) in enumerate(zip(node['hashes'],actual)):check(f'Corpus {i}: canonical browser/Node parity',expected==result)
            check('13-combatant group fixture',page.evaluate('BondRuntimeFixtures.run(0).units.length===13'))
            browser.close()
        check('Maximum replay bounded under local 200ms p95 target',node['cpu']['replayP95ms']<200)
        check('Node used the same source as the browser',all(source[n]==v for n,v in node['sourceHashes'].items()))
    except Exception:errors.append(traceback.format_exc())
    finally:server.shutdown();server.server_close()
    check('No runtime/test errors',not errors);check('Corpus sources unchanged',source==hashes())
    report={'checks':checks,'errors':errors,'node':node,'source_sha256':source}
    (ARTIFACTS/f'runtime-{a.browser}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'passed':sum(x['pass'] for x in checks),'total':len(checks),'failures':[x for x in checks if not x['pass']],'errors':errors},indent=2))
    return 0 if checks and all(x['pass'] for x in checks) else 1
if __name__=='__main__':raise SystemExit(main())
