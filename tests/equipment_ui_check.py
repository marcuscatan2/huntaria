"""Equipment ownership, resumable battles and real mobile menus in disposable saves."""
import argparse,functools,json,subprocess,sys,threading,traceback
from pathlib import Path
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,legacy_adventure,sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome',choices=['chrome','edge']);parser.add_argument('--ui-only',action='store_true');args=parser.parse_args()
if not args.ui_only:
    node=Path(sys.executable).parent.parent/'Lib/site-packages/playwright/driver/node.exe'
    subprocess.run([str(node),str(ROOT/'tests/equipment_check.cjs')],cwd=ROOT,check=True)
for command in ['equipment_catalog.py','item_icons.py']:
    subprocess.run([sys.executable,str(ROOT/'scripts'/command),'--check'],cwd=ROOT,check=True)
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[]
def check(name,ok):
    checks.append({'name':name,'pass':bool(ok)});print(('PASS ' if ok else 'FAIL ')+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    page=browser.new_page(viewport={'width':390,'height':844});legacy_adventure(page)
    page.add_init_script("localStorage.setItem('bond-bolt-profile-v7','equipment-normal-save-sentinel')")
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1');page.wait_for_function('!!window.BondApp')
        page.evaluate("""()=>{const P=BondProfile,s=P.fresh();s.character={name:'Rowan',weapon:'dagger'};s.progression.specialization='swordsman';s.trainerXP=BondProgress.threshold(60);s.journey.early.introFightWon=true;s.journey.early.tidecrown=true;s.journey.early.mageGate=true;
        s.companions=['acornboar','acornboar','bloomslime'].map((type,n)=>({id:'equipment:'+n,type,xp:BondProgress.threshold(60),skills:[...BondContent.UNITS[type].default],growth:{}}));
        for(const item of BondEquipment.list())s.inventory[item.id]=1;P.testing.replace(s);BondEquipmentView.open();}""")
        check('Existing relic rewards appear as equippable weapons',page.locator('[data-gear-item="weapon:class:swordsman"]').count()==1 and page.evaluate("BondProfile.equip('swordsman','weapon:class:swordsman','weapon')"))
        check('Equipment is an Inner Sea section with six trainer slots',page.evaluate("BondMenu.current()==='collection'&&BondMenu.section()==='equipment'") and page.locator('[data-gear-slot]').count()==6)
        page.locator('[data-gear-slot="offhand"]').click();page.locator('[data-gear-item="equipment:acornboar"]').click();page.locator('[data-equip-item]').click()
        check('A real click equips an owned shield without consuming its inventory copy',page.evaluate("BondProfile.snapshot().equipment.offhand==='equipment:acornboar'&&BondProfile.snapshot().inventory['equipment:acornboar']===1"))
        page.locator('[data-gear-slot="body"]').click();page.locator('[data-gear-item="equipment:astralfox"]').click()
        check('The UI cannot equip class-restricted gear',page.locator('[data-equip-item]').is_disabled())
        page.locator('#equipment-owner').select_option('equipment:0');page.locator('[data-gear-item="held:acornboar"]').click();page.locator('[data-equip-item]').click()
        check('A companion has exactly one held slot',page.locator('[data-gear-slot]').count()==1 and page.evaluate("BondProfile.getCompanion('equipment:0').heldItem==='held:acornboar'"))
        page.locator('#equipment-owner').select_option('equipment:1');page.locator('[data-gear-item="held:acornboar"]').click()
        check('A second individual cannot borrow an equipped copy',page.locator('[data-equip-item]').is_disabled() and 'All copies equipped' in page.locator('[data-equip-item]').inner_text())
        page.locator('#equipment-owner').select_option('equipment:0');page.locator('[data-unequip]').click();page.locator('#equipment-owner').select_option('equipment:1');page.locator('[data-gear-item="held:acornboar"]').click();page.locator('[data-equip-item]').click()
        check('Unequipping frees the copy for another individual',page.evaluate("!BondProfile.getCompanion('equipment:0').heldItem&&BondProfile.getCompanion('equipment:1').heldItem==='held:acornboar'"))
        page.locator('#equipment-owner').select_option('equipment:2');page.locator('[data-gear-item="held:acornboar"]').click()
        check('Held family restrictions are enforced in the picker',page.locator('[data-equip-item]').is_disabled())
        page.reload();page.wait_for_function('!!window.BondApp')
        check('Trainer and individual held assignments survive reload',page.evaluate("BondProfile.snapshot().equipment.offhand==='equipment:acornboar'&&BondProfile.getCompanion('equipment:1').heldItem==='held:acornboar'"))
        check('All 204 item and quest-weapon icons decode',page.evaluate("async()=>{const items=BondEquipment.list();return items.length===204&&(await Promise.all(items.map(async item=>{const i=new Image();i.src=item.icon;await i.decode();return i.naturalWidth>0;}))).every(Boolean);}"))
        check('Failed persistence cannot change a slot',page.evaluate("""()=>{const old=Storage.prototype.setItem,before=BondProfile.export();Storage.prototype.setItem=()=>{throw Error('storage full')};let accepted;try{accepted=BondProfile.equip('swordsman',null,'offhand');}finally{Storage.prototype.setItem=old;}return !accepted&&BondProfile.export()===before;}"""))
        check('Equipment changes leave an existing battle frozen',page.evaluate("""()=>{const p=BondProfile.snapshot(),build=BondGame.defaultBuild();build[0][0]={type:'swordsman',skills:[...BondContent.UNITS.swordsman.default]};build[0][1]={type:'acornboar',instanceId:'equipment:1',skills:[...BondContent.UNITS.acornboar.default]};build[0][2]={type:'bloomslime',instanceId:'equipment:2',skills:[...BondContent.UNITS.bloomslime.default]};const b=new BondGame.Battle(build,{profile:p,seed:17}),hp=b.units[0].maxHp,gear=b.units[0].gear.items.map(x=>x.item.id);BondProfile.equip('swordsman',null,'offhand');return b.units[0].maxHp===hp&&JSON.stringify(b.units[0].gear.items.map(x=>x.item.id))===JSON.stringify(gear)&&!BondProfile.snapshot().equipment.offhand;}"""))
        page.evaluate("()=>{const s=BondProfile.snapshot();for(const slot of BondEquipment.SLOTS){const item=Object.values(BondItemCatalog.items).filter(i=>i.kind==='equipment'&&i.slot===slot&&BondEquipment.allowed(i,'swordsman',60)).sort((a,b)=>b.level-a.level)[0];BondProfile.equip('swordsman',item.id,slot);}BondEquipmentView.open('equipment:1','held:acornboar');}")
        for width in [320,390,768,1440]:
            page.set_viewport_size({'width':width,'height':844 if width<1000 else 1000});page.evaluate("BondEquipmentView.open('swordsman','equipment:acornboar')")
            check(f'Equipment fits the {width}px game frame',page.evaluate("()=>{const e=document.querySelector('.equipment-view'),r=e.getBoundingClientRect(),f=document.querySelector('#game-frame').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&r.left>=f.left-1&&r.right<=f.right+1&&e.scrollWidth<=e.clientWidth+1;}"))
            if width in [390,1440]:page.locator('#panel-loadout').screenshot(path=str(ARTIFACTS/f'equipment-{width}-{args.browser}.png'))
        page.evaluate("BondInventory.select('held:acornboar');BondMenu.open('inventory')")
        check('Bag has equipment categories, artwork and management action',page.locator('[data-bag-filter="Equipment"]').count()==1 and page.locator('[data-bag-filter="Held items"]').count()==1 and page.locator('.satchel-detail .item-art').count()==1 and page.locator('[data-gear-id="held:acornboar"]').count()==1)
        check('Ordinary item UI does not expose drop odds', '1%' not in page.locator('.satchel-detail').inner_text())
        page.locator('[data-gear-id="held:acornboar"]').click()
        check('Bag held-item action opens an individual held slot',page.locator('[data-gear-slot="held"]').count()==1)
        check('Normal browser save remains untouched',page.evaluate("localStorage.getItem('bond-bolt-profile-v7')==='equipment-normal-save-sentinel'"))
        for version in [0,1]:
            frozen=page.evaluate("""version=>{const P=BondProfile,G=BondGame;P.abandonBattle();const sp=P.population().find(x=>x.present),e=P.beginHunt(sp.id),build=G.soloBuild('swordsman'),options={profile:P.snapshot(),adventure:true,seed:e.seed,encounter:e,equipmentRules:version},b=new G.Battle(build,options);if(!P.reserveBattle(b,e.id,options))return false;for(let n=0;n<8&&!b.ended;n++)b.step();P.checkpoint(b);P.equip('swordsman',null,'offhand');const raw=P.snapshot();if(!version)delete raw.encounterSave.options.equipmentRules;P.testing.replace(raw);const restored=P.restoreBattle(e.id),ok=restored.equipmentRules===version&&JSON.stringify(b.events)===JSON.stringify(restored.events)&&b.units[0].maxHp===restored.units[0].maxHp;P.abandonBattle();return ok;}""",version)
            check(f'Reserved version {version} replays its frozen equipment rules and stats',frozen)
        check('Real wild equipment drops settle once after a failed-save retry',page.evaluate("""()=>{const P=BondProfile,G=BondGame;P.abandonBattle();const sp=P.population().find(x=>x.present),type=sp.type;let seed=1;while(Object.keys(BondEquipment.loot(type,seed)).length!==2&&seed<500000)seed++;if(seed===500000)return false;const raw=P.snapshot();raw.spawns[sp.id].seed=seed;P.testing.replace(raw);const e=P.beginHunt(sp.id),options={profile:P.snapshot(),adventure:true,seed:e.seed,encounter:e},b=new G.Battle(G.soloBuild('swordsman'),options);if(!P.reserveBattle(b,e.id,options))return false;const before=P.snapshot().inventory;b.run();if(b.winner!==0)return false;const set=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('disk full')};let failed;try{failed=P.complete(b,e.id);}finally{Storage.prototype.setItem=set;}const unchanged=Object.keys(BondEquipment.loot(type,seed)).every(id=>P.snapshot().inventory[id]===before[id]);const receipt=P.complete(b,e.id),once=P.snapshot().inventory;P.complete(b,e.id);const after=P.snapshot().inventory;return failed?.pending&&unchanged&&!receipt.pending&&Object.keys(BondEquipment.loot(type,seed)).every(id=>once[id]===(before[id]||0)+1&&after[id]===once[id]);}"""))
        page.locator('#qa-equipment').click()
        check('The test-only samples button supplies all items through a profile command',page.evaluate("BondEquipment.list().every(i=>BondProfile.snapshot().inventory[i.id]>=(i.kind==='held'?2:1))&&BondMenu.section()==='equipment'"))
        before=page.evaluate('JSON.stringify(BondProfile.snapshot().inventory)');page.locator('#qa-equipment').click()
        check('Repeated sample grants keep existing quantities without duplication',page.evaluate('JSON.stringify(BondProfile.snapshot().inventory)')==before)
        # A standalone contact sheet makes all final silhouettes reviewable.
        gallery=browser.new_page(viewport={'width':1100,'height':1600});gallery.goto(f'http://127.0.0.1:{server.server_port}/?test=1');gallery.wait_for_function('!!window.BondApp')
        for kind in ['equipment','held']:
            gallery.evaluate("""kind=>{document.body.innerHTML='<main style="padding:20px;background:#efe9d5;display:grid;grid-template-columns:repeat(10,1fr);gap:10px">'+Object.values(BondItemCatalog.items).filter(i=>i.kind===kind).map(i=>'<div style="text-align:center;color:#354e43;font:10px Georgia"><img width="80" height="80" src="'+i.icon+'"><div>'+i.number+'. '+i.name+'</div></div>').join('')+'</main>';}
            """,kind)
            gallery.evaluate("async()=>{await Promise.all([...document.images].map(i=>i.decode()));}")
            gallery.screenshot(path=str(ARTIFACTS/f'{kind}-icons.png'),full_page=True)
        gallery.close()
    except Exception:errors.append(traceback.format_exc())
    check('No browser or harness errors',not errors);browser.close()
server.shutdown();(ARTIFACTS/f'equipment-{args.browser}.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2),encoding='utf-8')
print(json.dumps(errors,indent=2));raise SystemExit(0 if checks and all(c['pass'] for c in checks) and not errors else 1)
