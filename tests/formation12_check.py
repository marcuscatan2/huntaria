"""Formation + boss-level checks in an isolated local browser context."""
import argparse
from datetime import datetime,timedelta,timezone
import functools,json,threading
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--browser',default='chrome')
args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/'
checks=[];errors=[];missing=[]
def check(name,result):
    checks.append({'name':name,'pass':bool(result)})
    print(('PASS ' if result else 'FAIL ')+name,flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page()
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
    now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=60))
    page.goto(url);page.wait_for_function('!!window.BondApp')
    check('Existing save fields get safe new defaults',page.evaluate('(()=>{const s=BondProfile.normalize({version:5,coins:23,owned:["emberfox","stonehorn","tideotter"],inventory:{bondcontract:2}});return s.bossLevel===1 && JSON.stringify(s.formation)===JSON.stringify(BondFormation.DEFAULT) && s.coins===23 && s.owned.includes("tideotter") && s.inventory.bondcontract===2;})()'))
    check('Malformed formation and level sanitize safely',page.evaluate('(()=>{const s=BondProfile.normalize({version:5,formation:["front","front","back"],bossLevel:Infinity});return BondFormation.valid(s.formation)&&s.bossLevel===1;})()'))
    page.locator('#tab-loadout').click()
    page.locator('.party-formation-button').click()
    check('Loadout opens three-rank formation page',page.locator('[data-formation-slot]').count()==3 and page.locator('.formation-place').count()==3)
    page.locator('[data-formation-slot="0"]').select_option('front')
    check('Selecting occupied front swaps trainer and tank',page.evaluate('JSON.stringify(BondProfile.snapshot().formation)===JSON.stringify(["front","middle","back"])'))
    check('Focus is retained after formation selection',page.evaluate('document.activeElement.dataset.formationSlot==="0"'))
    page.locator('#fight').click()
    check('Formation changes model and view starting positions',page.evaluate('(()=>{const b=BondApp.getBattle();return b.trainer(0).position.x===38 && b.units[2].position.x===16 && b.trainer(0).slot===0 && b.units[1].position.x===27;})()'))
    check('Front trainer still is the defeat objective',page.evaluate('(()=>{const b=new BondGame.Battle(BondGame.defaultBuild(),{profile:BondProfile.snapshot()});b.damage(b.units[4],b.trainer(0),99999,"test");return b.ended&&b.winner===1&&b.units[1].hp>0&&b.units[2].hp>0;})()'))
    check('Enemy normal targeting ignores exposed trainer while monsters live',page.evaluate('BondApp.getBattle().units.filter(u=>u.side===1).every(u=>BondApp.getBattle().target(u).slot>0)'))
    page.clock.run_for(2200)
    page.locator('#pause').click()
    check('Real playback advances with the selected formation',page.evaluate('BondApp.getBattle().time>1'))
    page.locator('#tab-loadout').click()
    page.evaluate('BondMenu.open("formation")')
    page.locator('[data-formation-slot="0"]').select_option('back')
    check('Formation editing discards paused battle',page.evaluate('BondApp.getBattle()===null'))
    page.reload()
    check('Formation persists through reload',page.evaluate('JSON.stringify(BondProfile.snapshot().formation)===JSON.stringify(["back","middle","front"])'))
    page.locator('#tab-loadout').click();page.evaluate('BondMenu.open("formation")')
    page.evaluate('BondApp.changeUnit(0,0,"mage")')
    check('Changing class keeps formation and refreshes portrait',page.evaluate('BondProfile.snapshot().formation[0]==="back"') and 'Mage' in page.locator('[data-formation-place="back"]').inner_text())
    permutations=page.evaluate('''()=>{
      const out=[];for(const a of BondFormation.RANKS)for(const b of BondFormation.RANKS)for(const c of BondFormation.RANKS)if(new Set([a,b,c]).size===3)out.push([a,b,c]);return out;
    }''')
    for ranks in permutations:
        result=page.evaluate('''ranks=>{
          const s=BondProfile.snapshot(),build=BondGame.defaultBuild();s.formation=ranks;
          const b=new BondGame.Battle(build,{profile:s});const initial=b.units.slice(0,3).every((u,i)=>u.rank===ranks[i]&&u.position.x===BondFormation.POSITIONS[ranks[i]].x&&u.position!==u.previousPosition);
          b.run();return initial&&b.ended&&b.units.every(u=>Number.isFinite(u.hp)&&u.hp>=0);
        }''',ranks)
        check('Permutation '+','.join(ranks)+' plays to completion',result)
    check('Invalid formation assignments do not alter save',page.evaluate('(()=>{const s=JSON.stringify(BondProfile.snapshot());return !BondProfile.setFormation(4,"front")&&!BondProfile.setFormation(0,"invalid")&&s===JSON.stringify(BondProfile.snapshot());})()'))
    page.evaluate('BondProfile.startExpedition("clearing","forest");BondApp.startRegionBattle(BondProfile.snapshot().expedition.steps[0].id)')
    page.locator('#tab-loadout').click();page.evaluate('BondMenu.open("formation")')
    run_before=page.evaluate('JSON.stringify(BondProfile.snapshot().expedition)')
    page.locator('[data-formation-slot="1"]').select_option('front')
    check('Formation edit keeps expedition and rolls',run_before==page.evaluate('JSON.stringify(BondProfile.snapshot().expedition)'))

    def visit_npc(npc,area,x,y):
        page.evaluate('([a,x,y])=>{BondProfile.travel(a,{x,y});BondApp.switchTab("region");}',[area,x,y])
        page.locator('[data-object="'+npc+'"]').click()
        page.wait_for_selector('#npc-dialog[open]')

    visit_npc('elderroot','rise',4690,450)
    check('Boss entry offers level selection and live stats',page.locator('#boss-test-controls').is_visible() and '3,300 HP' in page.locator('#boss-test-preview').inner_text())
    page.locator('#boss-test-level').fill('25')
    check('Level preview scales HP and quake', '6,468 HP' in page.locator('#boss-test-preview').inner_text() and '144 / 192' in page.locator('#boss-test-preview').inner_text())
    for invalid in ['0','101','1.5','']:
        page.locator('#boss-test-level').fill(invalid)
        check('Invalid boss level '+repr(invalid)+' cannot start',page.locator('#npc-fight').is_disabled())
    page.locator('#boss-test-level').fill('25')
    page.locator('#npc-close').click()
    check('Cancelling entry does not commit selected difficulty',page.evaluate('BondProfile.snapshot().bossLevel===1'))
    visit_npc('elderroot','rise',4690,450)
    page.locator('#boss-test-level').fill('25')
    page.locator('#npc-fight').click()
    check('Chosen boss level is applied, player level unchanged',page.evaluate('BondApp.getBattle().units.find(u=>u.boss).level===25 && BondApp.getBattle().units.find(u=>u.boss).maxHp===6468 && BondApp.getBattle().trainer(0).level===1'))
    check('Encounter heading shows selected level','25' in page.locator('#battle-description').inner_text())
    page.clock.run_for(1200)
    page.locator('#return-region').click()
    page.evaluate('window.__pausedBoss=BondApp.getBattle()')
    visit_npc('elderroot','rise',4690,450)
    check('Matching level offers resume','Resume Lv 25' in page.locator('#npc-fight').inner_text())
    page.locator('#npc-fight').click()
    check('Same level resumes same battle object',page.evaluate('window.__pausedBoss===BondApp.getBattle()'))
    page.locator('#return-region').click()
    visit_npc('elderroot','rise',4690,450)
    page.locator('#boss-test-level').fill('5')
    page.locator('#npc-fight').click()
    check('Changed level starts fresh model with new difficulty',page.evaluate('window.__pausedBoss!==BondApp.getBattle() && BondApp.getBattle().time===0 && BondApp.getBattle().units.find(u=>u.boss).level===5'))
    page.locator('#restart').click()
    check('Restart keeps selected boss level',page.evaluate('BondApp.getBattle().units.find(u=>u.boss).level===5'))
    page.reload()
    check('Boss level preference persists',page.evaluate('BondProfile.snapshot().bossLevel===5'))
    visit_npc('elderroot','rise',4690,450)
    page.locator('#boss-match-level').click()
    check('Match trainer uses actual trainer level',page.locator('#boss-test-level').input_value()=='1')
    page.locator('#npc-close').click()
    visit_npc('mira','clearing',620,410)
    check('Normal NPC dialog hides boss controls',page.locator('#boss-test-controls').is_hidden() and page.locator('#npc-fight').is_enabled())
    page.locator('#npc-close').click()
    check('Public entry rejects invalid boss levels without mutation',page.evaluate('(()=>{const s=JSON.stringify(BondProfile.snapshot());return [0,101,NaN,Infinity,1.5,"10"].every(v=>!BondApp.startRegionBattle("elderroot",{bossLevel:v}))&&s===JSON.stringify(BondProfile.snapshot());})()'))
    for level in [1,5,25,100]:
        check('Level '+str(level)+' boss scales and resolves safely',page.evaluate('''level=>{
          const s=BondProfile.snapshot(),b=new BondGame.Battle(BondGame.defaultBuild(),{profile:s,encounter:BondWorld.NPCS.elderroot,enemyLevel:level}),boss=b.units.find(u=>u.boss);
          const scaled=boss.maxHp===Math.round(3300*(1+.04*(level-1)))&&boss.power===Math.round(65*(1+.025*(level-1)));
          b.run();return scaled&&b.ended&&b.units.every(u=>Number.isFinite(u.hp)&&u.hp>=0);
        }''',level))
    check('Boss quake damage scales with level in both phases',page.evaluate('''()=>{
      for(const level of [1,25,100])for(const phase of [1,2]){
        const b=new BondGame.Battle(BondGame.defaultBuild(),{profile:BondProfile.normalize(null),encounter:BondWorld.NPCS.elderroot,enemyLevel:level});
        b.elements=false;for(const u of b.units){u.passive=null;u.shield=0;u.growth.armor=0;u.status={};}
        b.bossPhase=phase;b.bossCharge={until:0,started:0};b.bossStep();
        const damage=b.events.find(e=>e.kind==='damage'&&e.target==='0-0');if(damage.amount!==Math.round((phase===2?120:90)*(1+.025*(level-1))))return false;
      }return true;
    }'''))
    page.locator('#tab-loadout').click();page.evaluate('BondMenu.open("formation")')
    for width in [320,390,768,1440]:
        page.set_viewport_size({'width':width,'height':950})
        check(str(width)+'px formation fits',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        if width in [390,1440]:
            page.screenshot(path=str(ARTIFACTS/(args.browser+'-v12-formation-'+str(width)+'.png')),full_page=True)
    visit_npc('elderroot','rise',4690,450)
    page.locator('#boss-test-level').fill('25')
    page.screenshot(path=str(ARTIFACTS/(args.browser+'-v12-boss-dialog.png')),full_page=True)
    page.set_viewport_size({'width':320,'height':900})
    check('320px boss dialog fits',page.evaluate('document.documentElement.scrollWidth<=innerWidth && document.querySelector("#npc-dialog").getBoundingClientRect().right<=innerWidth'))
    page.locator('#npc-close').click()
    for script,fn in [('engine-tests.js','runCombatTests'),('progression-engine-tests.js','runProgressionTests')]:
        page.add_script_tag(path=str(ROOT/'tests'/script));report=page.evaluate(fn+'()')
        check(fn+' passes '+str(report['passed'])+' checks',report['failed']==0)
        print(json.dumps([r for r in report['results'] if not r['pass']]),flush=True)
    check('No JavaScript errors',not errors);check('No missing assets',not missing)
    (ARTIFACTS/(args.browser+'-v12-report.json')).write_text(json.dumps({'checks':checks,'errors':errors,'missing':missing},indent=2),encoding='utf-8')
    browser.close()
server.shutdown()
raise SystemExit(0 if all(c['pass'] for c in checks) else 1)
