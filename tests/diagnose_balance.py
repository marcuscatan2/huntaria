"""Read-only isolated combat experiments; never touches the user's saved build."""
import json
from browser_check import ROOT, ARTIFACTS, find_browser, sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=find_browser('chrome'), headless=True)
    page = browser.new_page()
    page.add_script_tag(path=str(ROOT / 'game.js'))
    page.add_script_tag(path=str(ROOT / 'tests' / 'engine-tests.js'))
    result = page.evaluate("""() => {
        const G=BondGame, original={hp:G.UNITS.bloomslime.hp, lunge:{...G.SKILLS.pierce}};
        const trace = () => {
            const build=G.defaultBuild();build[0][1].skills=['pounce','pierce'];
            const b=new G.Battle(build), nav=[];let last=null;
            while(!b.ended&&b.time<16){b.step();const u=b.units[1];
                if(u.hp>0&&u.moveTargetId!==last){nav.push({time:b.time,target:u.moveTargetId,skill:u.moveSkill,monsters:b.team(1).filter(x=>x.slot).map(x=>x.name)});last=u.moveTargetId;}}
            return {navigation:nav,hits:b.events.filter(e=>e.kind==='damage'&&e.actor==='0-1').map(e=>({time:e.time,target:e.target,text:e.text}))};
        };
        // Pin the previous behavior so this diagnostic stays reproducible after fixes.
        G.UNITS.bloomslime.hp=690;G.SKILLS.pierce.kind='trainer';delete G.SKILLS.pierce.reach;
        const before=trace(), candidates=[];
        G.SKILLS.pierce.kind='hit';G.SKILLS.pierce.reach=18;
        for(const hp of [690,570,530,500,480]){
            G.UNITS.bloomslime.hp=hp;
            const b=new G.Battle(G.defaultBuild()).run(), checks=runCombatTests();
            candidates.push({hp,default:checks.metrics.default,variants:checks.metrics.groveVariants,varied:checks.metrics.variedBuilds,
                slime:{healing:b.units[5].healing,damage:b.units[5].damage,death:b.events.find(e=>e.kind==='defeat'&&e.target==='1-2')?.time||null}});
        }
        G.UNITS.bloomslime.hp=500;const after=trace();
        G.UNITS.bloomslime.hp=original.hp;delete G.SKILLS.pierce.reach;Object.assign(G.SKILLS.pierce,original.lunge);
        return {original,before,after,candidates};
    }""")
    ARTIFACTS.mkdir(exist_ok=True)
    (ARTIFACTS / 'balance-v6.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2), flush=True)
    browser.close()
