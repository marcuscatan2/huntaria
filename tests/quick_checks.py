"""Focused post-polish and negative-path checks, with isolated file-mode saves."""
import argparse
from datetime import datetime,timedelta,timezone
import json
from browser_check import ROOT,ARTIFACTS,find_browser,sync_playwright

def run(name):
    checks=[];errors=[]
    def check(label,value):
        checks.append({'name':label,'pass':bool(value)})
        assert value,label
        print('PASS '+label,flush=True)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=find_browser(name),headless=True)
        ctx=browser.new_context(viewport={'width':390,'height':844})
        p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
        now=datetime.now(timezone.utc);p.clock.install(time=now);p.clock.pause_at(now+timedelta(seconds=60))
        p.goto((ROOT/'index.html').as_uri());p.wait_for_function('!!window.BondApp')
        p.locator('[data-object="treasure"]').click();p.clock.run_for(2000)
        check('Pickup still shows a fresh notification',p.locator('#region-toast').is_visible())
        p.once('dialog',lambda d:d.accept());p.locator('#region-reset').click()
        check('Reset clears old travel or pickup notification',p.locator('#region-toast').is_hidden())
        p.locator('[data-object="mira"]').click();p.clock.run_for(4000)
        check('Arriving at NPC updates the walking message',p.locator('#region-message').inner_text()=='Speaking with Mira.')
        p.keyboard.press('Escape')
        p.locator('#region-map').focus();p.keyboard.down('a');p.clock.run_for(10000);p.keyboard.up('a')
        check('Keyboard movement clamps at the safe left boundary',p.evaluate('BondRegion.inspect().position.x===110'))
        p.evaluate("BondProfile.travel('clearing',{x:450,y:320});BondApp.switchTab('region')")
        p.locator('#region-map').focus();p.keyboard.press('e')
        check('E collects a nearby item exactly once',p.evaluate('BondProfile.snapshot().inventory.mossbloom===1'))
        p.keyboard.press('e');check('Repeated E does not duplicate loot',p.evaluate('BondProfile.snapshot().inventory.mossbloom===1'))
        p.evaluate('Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))')
        p.screenshot(path=str(ARTIFACTS/f'{name}-v8-region-polished-390.png'),full_page=True)
        losing=p.evaluate("""()=>{
            const G=BondGame;
            for(const trainer of ['mage','druid'])for(const first of G.MONSTERS)for(const second of G.MONSTERS.filter(k=>k!==first)){
                const team=[trainer,first,second].map(type=>({type,skills:[...G.UNITS[type].default]}));
                if(new G.Battle([team,BondWorld.NPCS.vesper.team]).run().winner===1)return team;
            }return null;
        }""")
        check('A reproducible losing party exists',losing is not None)
        p.evaluate("(team)=>{team.forEach((u,i)=>{BondApp.changeUnit(0,i,u.type);BondApp.changeSkills(0,i,u.skills)});BondApp.startRegionBattle('vesper');BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish();}",losing)
        check('An actual simulated loss grants no NPC reward',p.evaluate('BondApp.getBattle().winner===1 && BondProfile.snapshot().coins===0 && BondProfile.snapshot().defeated.length===0'))
        p.locator('#start-battle').click()
        check('Retry creates a fresh full-health battle',p.evaluate('!BondApp.getBattle().ended && BondApp.getBattle().time===0 && BondApp.getBattle().units.every(u=>u.hp===u.maxHp)'))
        p.locator('#return-region').click();p.evaluate('BondProfile.prepare()')
        count=p.evaluate('BondProfile.snapshot().inventory.biscuit')
        p.evaluate("BondApp.startRegionBattle('vesper')")
        check('A newly prepared supply is kept when resuming an existing fight',p.evaluate('BondProfile.snapshot().prepared && BondProfile.snapshot().inventory.biscuit')==count)
        p.locator('#restart').click()
        check('Restart consumes that preparation once',p.evaluate('!BondProfile.snapshot().prepared && BondApp.getBattle().trainer(0).shield===80 && BondProfile.snapshot().inventory.biscuit')==count-1)
        p.clock.run_for(5000);p.locator('#pause').click()
        p.locator('.fighter[data-id="0-1"]').click()
        check('Monster inspection has three readable cooldown slots',p.locator('.dock-skill').count()==3 and p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        p.locator('#fx-mode').click();check('Quiet FX remains available',p.evaluate('CombatView.inspect().quietFX'))
        p.screenshot(path=str(ARTIFACTS/f'{name}-v8-battle-polished-390.png'),full_page=True)
        check('No JavaScript errors in final focused checks',not errors)
        report={'browser':browser.version,'checks':checks,'errors':errors}
        (ARTIFACTS/f'{name}-v8-quick-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
        browser.close()

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--browser',choices=['chrome','edge'],default='chrome');args=parser.parse_args();run(args.browser)
