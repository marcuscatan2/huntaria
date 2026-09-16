"""CSV contracts, individual migration, encounter replay and phone talent diagrams."""
import argparse
import functools
import json
import subprocess
import threading
import traceback
from http.server import ThreadingHTTPServer
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, legacy_adventure, sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--browser', default='chrome', choices=['chrome', 'edge'])
args = parser.parse_args()
checks, errors = [], []


def check(name, passed):
    checks.append({'name': name, 'pass': bool(passed)})
    print(('PASS ' if passed else 'FAIL ') + name, flush=True)


node = ROOT / '.venv/Lib/site-packages/playwright/driver/node.exe'
result = subprocess.run([str(node), str(ROOT / 'tests/monster_progression_check.cjs')], capture_output=True, text=True, encoding='utf-8', timeout=180)
check('Deterministic CSV and talent regressions', result.returncode == 0)
if result.returncode:
    errors.append(result.stdout + result.stderr)
server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    legacy_adventure(page)
    page.add_init_script("localStorage.setItem('bond-bolt-profile-v7','normal-save-sentinel')")
    page.on('pageerror', lambda e: errors.append(str(e)))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
        page.wait_for_function('!!window.BondApp')
        check('CSV level and tree coverage reaches the browser', page.evaluate('Object.keys(BondMonsterProgression.levels).length===100&&Object.keys(BondCompanionTalents.definitions).length===100'))
        migrated = page.evaluate("""()=>{const s=BondProfile.snapshot();s.trainerXP=BondProgress.threshold(60);s.progression.specialization='mage';s.journey.early.tidecrown=true;s.journey.early.mageGate=true;s.journey.early.introFightWon=true;s.journey.relic.stage='complete';
          s.companions=['acornboar','astralfox','lanternslug'].map((type,i)=>({id:'csv:'+i,type,ordinal:1,xp:BondProgress.threshold(60),growth:{bond:3,might:2},skills:BondContent.UNITS[type].default}));
          s.coins=321;const formation=JSON.stringify(s.formation);BondProfile.testing.replace(s);const n=BondProfile.snapshot();return n.coins===321&&JSON.stringify(n.formation)===formation&&n.companions.every((m,i)=>m.id==='csv:'+i&&m.xp===177000&&Object.keys(m.growth).length===0&&BondGrowth.budget(n,m.id)===15&&m.skills.join()===s.companions[i].skills.join());}""")
        check('Migration refunds old nodes and preserves IDs, XP, loadouts, coins and formation', migrated)
        page.evaluate("BondApp.switchTab('loadout');BondTree.select('csv:0')")
        ids = page.evaluate("BondCompanionTrees.nodes('acornboar').map(n=>n.id)")
        check('Companion graph has 24 nodes and all 24 prerequisite lines', page.locator('[data-talent-node]').count() == 24 and page.locator('[data-from]').count() == 24)
        for index in range(3):
            page.evaluate('id=>BondTree.select(id)', f'csv:{index}')
            for width in [1440, 390, 320]:
                page.set_viewport_size({'width': width, 'height': 1000 if width > 1000 else 844})
                geometry = page.evaluate("""()=>{const nodes=[...document.querySelectorAll('[data-talent-node]')].filter(e=>e.getClientRects().length),intersects=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;return document.documentElement.scrollWidth<=innerWidth+1&&nodes.length===(innerWidth>1000?24:8)&&nodes.every(e=>{const r=e.getBoundingClientRect(),p=e.closest('.class-talent-branch').getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=p.left&&r.right<=p.right&&nodes.every(o=>o===e||!intersects(e.querySelector('.talent-name').getBoundingClientRect(),o.querySelector('.talent-name').getBoundingClientRect())&&!intersects(e.querySelector('.talent-name').getBoundingClientRect(),o.getBoundingClientRect()));});}""")
                check(f'Companion {index+1} readable touch diagram at {width}px', geometry)
        page.evaluate("BondTree.select('csv:0')")
        before = page.evaluate('JSON.stringify(BondProfile.snapshot())')
        page.locator(f'[data-talent-node="{ids[7]}"]').click()
        check('Locked final talent is inspectable without spending', page.locator('.talent-dialog [data-talent-learn]').is_disabled() and page.evaluate('JSON.stringify(BondProfile.snapshot())') == before)
        page.keyboard.press('Escape')
        page.locator(f'[data-talent-node="{ids[0]}"]').click()
        page.locator('.talent-dialog [data-talent-learn]').click()
        page.keyboard.press('Escape')
        check('Phone learning spends one point on only the chosen individual', page.evaluate("BondProfile.snapshot().companions[0].growth[BondCompanionTrees.nodes('acornboar')[0].id]===1&&BondProfile.snapshot().companions.slice(1).every(m=>!Object.keys(m.growth).length)"))
        saved = page.evaluate('BondProfile.snapshot().companions')
        page.reload(); page.wait_for_function('!!window.BondApp')
        check('Companion talents and quest awards survive reload', page.evaluate('BondProfile.snapshot().companions') == saved and page.evaluate("BondGrowth.budget(BondProfile.snapshot(),'csv:0')===15"))
        page.evaluate("BondApp.switchTab('loadout');BondTree.select('csv:0')")
        page.locator('#panel-loadout').screenshot(path=str(ARTIFACTS / 'companion-tree-phone.png'))
        frozen = page.evaluate("""()=>{const P=BondProfile,G=BondGame;P.abandonBattle();const s=P.snapshot();s.companions[0].growth={bond:3};const sp=P.population().find(x=>x.present),e=P.beginHunt(sp.id),build=G.soloBuild();build[0][1]={type:'acornboar',instanceId:'csv:0',skills:BondContent.UNITS.acornboar.default};const options={profile:s,adventure:true,seed:e.seed,encounter:e,monsterRules:0},b=new G.Battle(build,options);if(!P.reserveBattle(b,e.id,options))return false;for(let i=0;i<30&&!b.ended;i++)b.step();P.checkpoint(b);const raw=P.snapshot();delete raw.encounterSave.options.monsterRules;P.testing.replace(raw);const restored=P.restoreBattle(e.id),ok=restored.monsterRules===0&&JSON.stringify(b.events)===JSON.stringify(restored.events)&&b.units[1].maxHp===restored.units[1].maxHp;P.abandonBattle();return ok;}""")
        check('Old reserved monster fights replay with their frozen stats and generic nodes', frozen)
        current = page.evaluate("""()=>{const P=BondProfile,G=BondGame,s=P.snapshot(),id=BondCompanionTrees.nodes('acornboar')[0].id;s.companions[0].growth={[id]:1};P.testing.replace(s);const sp=P.population().find(x=>x.present),e=P.beginHunt(sp.id),build=G.soloBuild();build[0][1]={type:'acornboar',instanceId:'csv:0',skills:BondContent.UNITS.acornboar.default};const options={profile:P.snapshot(),adventure:true,seed:e.seed,encounter:e},b=new G.Battle(build,options);if(!P.reserveBattle(b,e.id,options))return false;for(let i=0;i<30&&!b.ended;i++)b.step();P.checkpoint(b);P.respec('csv:0');P.testing.replace(P.snapshot());const restored=P.restoreBattle(e.id);return restored.monsterRules===1&&JSON.stringify(b.events)===JSON.stringify(restored.events)&&restored.units[1].talents[id]===1&&!Object.keys(P.snapshot().companions[0].growth).length;}""")
        check('Current reserved fights retain their talent snapshot after a reset', current)
        check('Normal saves remain untouched', page.evaluate("localStorage.getItem('bond-bolt-profile-v7')==='normal-save-sentinel'"))
    except Exception:
        errors.append(traceback.format_exc())
    check('No browser or harness errors', not errors)
    browser.close()
server.shutdown()
(ARTIFACTS / f'monster-progression-{args.browser}.json').write_text(json.dumps({'checks': checks, 'errors': errors}, indent=2), encoding='utf-8')
print(json.dumps(errors, indent=2))
raise SystemExit(0 if checks and all(c['pass'] for c in checks) and not errors else 1)
