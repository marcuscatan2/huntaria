"""Workbook rules in Node/Chrome, disposable saves and mobile summon presentation."""
import argparse
import functools
import json
import subprocess
import threading
import traceback
from http.server import ThreadingHTTPServer
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, legacy_adventure, sync_playwright

p=argparse.ArgumentParser();p.add_argument('--browser',default='chrome',choices=['chrome','edge']);args=p.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[]
def check(name,value):
    checks.append({'name':name,'pass':bool(value)});print(('PASS ' if value else 'FAIL ')+name,flush=True)
node=ROOT/'.venv/Lib/site-packages/playwright/driver/node.exe'
result=subprocess.run([str(node),str(ROOT/'tests/combat_workbooks_check.cjs')],capture_output=True,text=True,encoding='utf-8',timeout=120)
check('Node combat contracts',result.returncode==0)
if result.returncode:errors.append(result.stderr)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1000});legacy_adventure(page)
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1');page.wait_for_function('!!window.BondApp')
        page.add_script_tag(path=str(ROOT/'tests/combat_workbooks_cases.js'))
        actual=page.evaluate('BondWorkbookTests.run()');expected=json.loads(result.stdout) if result.returncode==0 else {}
        check('Chrome and Node agree on all workbook cases',actual==expected)
        check('Normal profile key is untouched',page.evaluate("localStorage.getItem('bond-bolt-profile-v7')===null"))
        page.evaluate("""()=>{const s=BondProfile.snapshot();s.trainerXP=BondProgress.threshold(30);s.journey.early.mageGate=true;s.journey.early.introFightWon=true;
          s.companions=['cindermole','glowcap'].map((type,i)=>({id:'workbook:'+i,type,ordinal:1,xp:BondProgress.threshold(30),growth:{},skills:BondContent.UNITS[type].default}));
          BondProfile.testing.replace(s);BondApp.changeUnit(0,1,'workbook:0');BondApp.changeUnit(0,2,'workbook:1');BondApp.switchTab('loadout');BondMenu.open('party');}""")
        page.locator('#fight').click();page.wait_for_timeout(500);page.locator('#pause').click()
        page.evaluate("""()=>{const b=BondApp.getBattle();for(let i=0;i<120&&!b.ended;i++)b.step();BondApp.renderBattle();
          const u=b.units[1];for(const e of b.effects.entities)b.effects.despawn(e,'preview');
          let i=0;for(const profile of Object.keys(BondCombatEntities.profiles)){const x=18+(i%5)*15,y=34+Math.floor(i/5)*10;u.position={x,y};BondCombatEntities.spawn(b.effects,u,profile,{assigned:b.trainer(0),anchor:b.units.find(e=>e.side===1)});i++;}CombatView.draw(performance.now());}""")
        ids=page.evaluate('Object.keys(BondCombatEntities.profiles)')
        page.evaluate('ids=>Promise.all(ids.map(id=>BondSummonView.ensure(id).promise))',ids)
        check('All twenty summon sprites decode',page.evaluate('BondSummonView.cacheInfo().failed.length===0&&BondSummonView.cacheInfo().decoded===20'))
        check('Decoded summon cache stays below 2 MiB',page.evaluate('BondSummonView.cacheInfo().bytes<=2097152'))
        alpha=page.evaluate("""()=>Object.keys(BondCombatEntities.profiles).map(id=>{const c=BondSummonView.ensure(id).canvas,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let empty=0;for(let i=3;i<d.length;i+=4)if(d[i]===0)empty++;return {id,clear:empty/(c.width*c.height)};})""")
        check('Every summon has a clear cutout background',all(x['clear']>.2 for x in alpha))
        for width in [1440,390,320]:
            page.set_viewport_size({'width':width,'height':1000 if width==1440 else 844})
            page.evaluate('CombatView.draw(performance.now()+50)');page.wait_for_timeout(120)
            check('Combat fits width '+str(width),page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
            page.locator('#arena').screenshot(path=str(ARTIFACTS/f'workbook-combat-{width}-{args.browser}.png'))
        preview=page.evaluate("""()=>{BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish();BondApp.switchTab('loadout');const s=BondProfile.snapshot();s.trainerXP=BondProgress.threshold(59);s.progression.specialization='mage';s.growth.mage={bond:1,might:1};
          BondProfile.testing.replace(s);const retained=BondProfile.snapshot().growth.mage.might===1;BondClassTrees.active=true;BondProfile.testing.replace(BondProfile.snapshot());
          const refunded=Object.keys(BondProfile.snapshot().growth.mage).length===0,budget=BondGrowth.budget(BondProfile.snapshot(),'mage');
          const blocked=!BondProfile.learn('mage','MA4'),opening=BondProfile.learn('mage','MA1')&&BondProfile.learn('mage','MA1'),fork=BondProfile.learn('mage','MA2');BondTree.select('mage');
          return {retained,refunded,budget,blocked,opening,fork};}""")
        check('Unapproved class switch stays inactive until explicitly set in this disposable context',preview['retained'])
        check('Prepared class refund and prerequisites work without changing companion trees',preview['refunded'] and preview['budget']==15 and preview['blocked'] and preview['opening'] and preview['fork'])
        check('Prepared class menu contains fifteen talents',page.locator('[data-learn]').count()==15)
        check('Prepared class menu fits a phone',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
        page.screenshot(path=str(ARTIFACTS/'workbook-class-preview-phone.png'))
        page.evaluate('BondClassTrees.active=false')
        check('Normal save is still untouched after the class preview',page.evaluate("localStorage.getItem('bond-bolt-profile-v7')===null"))
        page.set_viewport_size({'width':1200,'height':1000})
        page.evaluate("""()=>{document.body.innerHTML='<main id="gallery" style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;padding:20px;background:#263b3f;color:#f7eed9;font:14px sans-serif"></main>';const gallery=document.querySelector('#gallery');for(const [id,p] of Object.entries(BondCombatEntities.profiles)){const fig=document.createElement('figure');fig.style.margin='0';const canvas=BondSummonView.ensure(id).canvas.cloneNode();canvas.getContext('2d').drawImage(BondSummonView.ensure(id).canvas,0,0);canvas.style.width='100%';fig.append(canvas);const cap=document.createElement('figcaption');cap.textContent=p.name;fig.append(cap);gallery.append(fig);}}""")
        page.locator('#gallery').screenshot(path=str(ARTIFACTS/'summon-cutout-gallery.png'))
    except Exception:
        errors.append(traceback.format_exc())
    check('No browser or harness errors',not errors);browser.close()
server.shutdown()
(ARTIFACTS/f'combat-workbooks-{args.browser}.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2),encoding='utf-8')
print(json.dumps(errors,indent=2));raise SystemExit(0 if checks and all(c['pass'] for c in checks) and not errors else 1)
