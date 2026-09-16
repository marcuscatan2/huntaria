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
        page.evaluate("BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish();BondApp.switchTab('loadout')")
        migration=page.evaluate("""()=>{const P=BondProfile,s=P.snapshot();s.trainerXP=BondProgress.threshold(59);s.coins=321;s.growth=Object.fromEntries(BondContent.CLASSES.map(t=>[t,{bond:3,might:2}]));s.companions[0].growth={bond:1,might:1};const before=JSON.stringify(s.companions);
          P.testing.replace(s);const clean=P.snapshot();return {reset:BondContent.CLASSES.every(t=>Object.keys(clean.growth[t]).length===0&&BondGrowth.budget(clean,t)===15),companions:JSON.stringify(clean.companions)===before,coins:clean.coins===321,xp:clean.trainerXP===s.trainerXP,formation:JSON.stringify(clean.formation)===JSON.stringify(s.formation)};}""")
        check('Old class ranks reset into the new budget while companions, XP, coins and formation survive',all(migration.values()))
        for cls in ['mage','druid','swordsman','hunter']:
            preview=page.evaluate("""type=>{const P=BondProfile,nodes=BondClassTrees.nodes(type),first=nodes[0],fork=nodes[1],advanced=nodes[3],cap=nodes[4],s=P.snapshot();s.progression.specialization=type;P.testing.replace(s);
              const blocked=!P.learn(type,advanced.id),opening=P.learn(type,first.id)&&P.learn(type,first.id),learnedFork=P.learn(type,fork.id);BondTree.select(type);
              return {blocked,opening,learnedFork,capBlocked:!P.learn(type,cap.id)};}""",cls)
            check(cls+' enforces branch prerequisites',all(preview.values()))
            check(cls+' shows fifteen talents in three branches',page.locator('[data-learn]').count()==15 and page.locator('.class-talent-branch').count()==3)
            check(cls+' tree fits a phone',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
            saved=page.evaluate('BondProfile.snapshot().growth');page.reload();page.wait_for_function('!!window.BondApp')
            check(cls+' allocation survives reload',page.evaluate('BondProfile.snapshot().growth')==saved)
            page.evaluate('type=>{BondApp.switchTab("loadout");BondTree.select(type);}',cls)
            page.screenshot(path=str(ARTIFACTS/f'trainer-talents-{cls}-{args.browser}.png'))
            check(cls+' free reset restores its points',page.evaluate('type=>BondProfile.respec(type)&&BondGrowth.used(BondProfile.snapshot().growth[type])===0',cls))
        page.set_viewport_size({'width':1440,'height':1000})
        check('Desktop branches keep full-width readable talent cards',page.evaluate('()=>[...document.querySelectorAll(".class-talent-branch .tree-node")].every(n=>n.getBoundingClientRect().width>=250)'))
        frozen=page.evaluate("""()=>{const P=BondProfile,G=BondGame,s=P.snapshot();s.progression.specialization='mage';P.testing.replace(s);const sp=P.population().find(x=>x.present),e=P.beginHunt(sp.id),old=P.snapshot();old.growth.mage={bond:2,might:2};const build=G.soloBuild('mage'),options={profile:old,adventure:true,seed:e.seed,encounter:e,classTrees:0},b=new G.Battle(build,options);
          if(!P.reserveBattle(b,e.id,options))return false;for(let i=0;i<30;i++)b.step();P.checkpoint(b);const raw=P.snapshot();raw.growth.mage=old.growth.mage;delete raw.encounterSave.options.classTrees;P.testing.replace(raw);const restored=P.restoreBattle(e.id),same=JSON.stringify(b.events)===JSON.stringify(restored.events)&&b.trainer(0).maxHp===restored.trainer(0).maxHp;
          const reset=Object.keys(P.snapshot().growth.mage).length===0;P.abandonBattle();const current=new G.Battle(build,{profile:P.snapshot()});return same&&reset&&restored.classTrees===0&&current.classTrees===1&&b.trainer(0).maxHp>current.trainer(0).maxHp;}""")
        check('An old reserved fight preserves its original class bonuses after migration',frozen)
        current=page.evaluate("""()=>{const P=BondProfile,G=BondGame,s=P.snapshot();s.growth.mage={MA1:2};P.testing.replace(s);const sp=P.population().find(x=>x.present),e=P.beginHunt(sp.id),build=G.soloBuild('mage'),options={profile:P.snapshot(),adventure:true,seed:e.seed,encounter:e},b=new G.Battle(build,options);
          if(!P.reserveBattle(b,e.id,options))return false;for(let i=0;i<70&&!b.ended;i++)b.step();P.checkpoint(b);P.respec('mage');P.testing.replace(P.snapshot());const restored=P.restoreBattle(e.id),same=JSON.stringify(b.events)===JSON.stringify(restored.events);
          return same&&P.snapshot().encounterSave.options.classTrees===1&&restored.trainer(0).talents.MA1===2&&Object.keys(P.snapshot().growth.mage).length===0;}""")
        check('A current saved fight keeps its talent snapshot when the player resets their tree',current)
        check('Normal save remains untouched by trainer migration checks',page.evaluate("localStorage.getItem('bond-bolt-profile-v7')===null"))
        page.evaluate('ids=>Promise.all(ids.map(id=>BondSummonView.ensure(id).promise))',ids)
        page.set_viewport_size({'width':1200,'height':1000})
        page.evaluate("""()=>{document.body.innerHTML='<main id="gallery" style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;padding:20px;background:#263b3f;color:#f7eed9;font:14px sans-serif"></main>';const gallery=document.querySelector('#gallery');for(const [id,p] of Object.entries(BondCombatEntities.profiles)){const fig=document.createElement('figure');fig.style.margin='0';const canvas=BondSummonView.ensure(id).canvas.cloneNode();canvas.getContext('2d').drawImage(BondSummonView.ensure(id).canvas,0,0);canvas.style.width='100%';fig.append(canvas);const cap=document.createElement('figcaption');cap.textContent=p.name;fig.append(cap);gallery.append(fig);}}""")
        page.locator('#gallery').screenshot(path=str(ARTIFACTS/'summon-cutout-gallery.png'))
    except Exception:
        errors.append(traceback.format_exc())
    check('No browser or harness errors',not errors);browser.close()
server.shutdown()
(ARTIFACTS/f'combat-workbooks-{args.browser}.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2),encoding='utf-8')
print(json.dumps(errors,indent=2));raise SystemExit(0 if checks and all(c['pass'] for c in checks) and not errors else 1)
