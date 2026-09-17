"""Apprentice progression, personal bonuses, atomic saves and illustrated menus."""
import argparse
import functools
import json
import subprocess
import sys
import threading
import traceback
from http.server import ThreadingHTTPServer
from pathlib import Path
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, legacy_adventure, sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--browser', default='chrome', choices=['chrome', 'edge'])
args = parser.parse_args()
node = Path(sys.executable).parent.parent / 'Lib/site-packages/playwright/driver/node.exe'
subprocess.run([str(node), str(ROOT / 'tests/apprentice_tree_check.cjs')], cwd=ROOT, check=True)
server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []


def check(name, passed):
    checks.append({'name': name, 'pass': bool(passed)})
    print(('PASS ' if passed else 'FAIL ') + name, flush=True)


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    legacy_adventure(page)
    page.add_init_script("localStorage.setItem('bond-bolt-profile-v7','normal-save-sentinel')")
    page.on('pageerror', lambda error: errors.append(str(error)))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
        page.wait_for_function('!!window.BondApp')
        page.evaluate("""()=>{window.apprenticeFixture=(level=18,full=false)=>{
          const s=BondProfile.fresh(),R=BondProgress;s.character={name:'Apprentice tester',weapon:'dagger'};s.trainerXP=R.threshold(level);
          s.journey.early.introFightWon=true;s.journey.early.mageGate=true;
          s.attributes=R.cleanAttributes(Object.fromEntries(R.ATTRS.map(k=>[k,99])),level);
          let left=R.statBudget(level)-R.spent(s.attributes);for(const k of R.ATTRS)while(s.attributes[k]<99&&left>=R.cost(s.attributes[k])){left-=R.cost(s.attributes[k]);s.attributes[k]++;}
          s.growth.apprentice=full?Object.fromEntries(BondApprenticeTree.nodes.map(n=>[n.id,3])):{};return s;
        };BondProfile.testing.replace(apprenticeFixture(1));BondApp.switchTab('region');}""")
        dot = lambda selector: page.locator(selector + ' > .upgrade-dot').count() > 0
        check('First-level Apprentice has one training point and an Inner Sea badge', page.evaluate('BondUpgradeNotices.read(BondProfile.snapshot()).trainer.points===1') and dot('[data-world-menu="collection"]'))
        page.locator('[data-world-menu="collection"]').click();page.locator('[data-sea-tab="trainer"]').click()
        check('Trainer marks Class Skill Tree for the new point', dot('[data-collection-mode="trees"]'))
        page.locator('[data-collection-mode="trees"]').click()
        check('Six illustrated talents form three connected paths', page.locator('[data-talent-node]').count() == 6 and page.locator('[data-from]').count() == 3 and page.locator('.talent-threshold').count() == 0)
        check('Each talent uses a different cell of the Apprentice atlas', page.evaluate("()=>new Set([...document.querySelectorAll('.talent-node>.talent-icon')].map(e=>e.getAttribute('style'))).size===6&&[...document.querySelectorAll('.talent-node>.talent-icon')].every(e=>getComputedStyle(e).backgroundSize==='200% 300%')"))
        check('Apprentice illustrations decode', page.evaluate("async()=>{const i=new Image();i.src='assets/talents/apprentice.png';await i.decode();return i.naturalWidth===1024&&i.naturalHeight===1536;}"))
        before = page.evaluate('JSON.stringify(BondProfile.snapshot())')
        page.locator('[data-talent-node="apprentice:force"]').click()
        check('Locked talent is inspectable without spending', page.locator('.talent-inspector [data-talent-learn]').is_disabled() and 'Practice Strikes' in page.locator('.talent-requirements').first.inner_text() and page.evaluate('JSON.stringify(BondProfile.snapshot())') == before)
        page.locator('[data-talent-node="apprentice:practice"]').click()
        page.locator('.talent-inspector [data-talent-learn]').click()
        check('Learning uses the only point and clears its route badge', page.evaluate("BondProfile.snapshot().growth.apprentice['apprentice:practice']===1&&!BondUpgradeNotices.read(BondProfile.snapshot()).trainer.available") and not dot('[data-collection-mode="trees"]'))
        page.evaluate('BondProfile.testing.setTrainerXP(BondProgress.threshold(2))')
        check('Level two immediately adds a new training point and badge', dot('[data-collection-mode="trees"]') and page.evaluate('BondUpgradeNotices.read(BondProfile.snapshot()).trainer.points===1'))
        page.evaluate("BondProfile.testing.replace(apprenticeFixture());BondTree.select('apprentice')")
        for width in [1440, 1024, 768, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1000 if width > 1000 else 844})
            geometry = page.evaluate("""()=>{const ns=[...document.querySelectorAll('[data-talent-node]')].filter(e=>e.getClientRects().length);
              return document.documentElement.scrollWidth<=innerWidth+1&&ns.length===(innerWidth>1000?6:2)&&ns.every(e=>{const r=e.getBoundingClientRect(),p=e.closest('.class-talent-branch').getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=p.left&&r.right<=p.right;});}""")
            check(f'Apprentice graph fits with readable touch targets at {width}px', geometry)
            if width in [1440, 390]:
                page.locator('#panel-loadout').screenshot(path=str(ARTIFACTS / f'apprentice-tree-{width}-{args.browser}.png'))
        # Buy every rank with the real phone controls, including branch changes.
        ids = page.evaluate('BondApprenticeTree.nodes.map(n=>n.id)')
        for branch in range(3):
            page.locator(f'[data-talent-branch="{branch}"]').click()
            for node_id in ids[branch*2:branch*2+2]:
                page.locator(f'[data-talent-node="{node_id}"]').click()
                check(node_id + ' opens on one click with three ranks', page.locator('.talent-dialog').evaluate('(d)=>d.open') and page.locator('.talent-dialog .talent-rank-descriptions section').count() == 3)
                for _ in range(3):
                    page.locator('.talent-dialog [data-talent-learn]').click()
                page.keyboard.press('Escape')
                check(node_id + ' returns keyboard focus after learning', page.evaluate('id=>document.activeElement.dataset.talentNode===id', node_id))
        check('Level eighteen completes all six talents and three gold paths', page.evaluate("BondGrowth.used(BondProfile.snapshot().growth.apprentice)===18&&!BondUpgradeNotices.read(BondProfile.snapshot()).trainer.available") and page.locator('.talent-node.mastered').count() == 6 and page.locator('.talent-edge.learned').count() == 3)
        saved = page.evaluate('BondProfile.snapshot().growth.apprentice')
        fixture_source = page.evaluate('apprenticeFixture.toString()')
        page.reload()
        page.wait_for_function('!!window.BondApp')
        page.evaluate('window.apprenticeFixture=' + fixture_source)
        page.evaluate("BondApp.switchTab('loadout');BondTree.select('apprentice')")
        check('Training ranks survive refresh', page.evaluate('BondProfile.snapshot().growth.apprentice') == saved)
        page.locator('[data-respec]').click()
        check('Free reset refunds eighteen points and restores the badge', page.evaluate('BondUpgradeNotices.read(BondProfile.snapshot()).trainer.points===18') and page.locator('.talent-edge.learned').count() == 0 and dot('[data-collection-mode="trees"]'))
        check('A failed save cannot spend a point', page.evaluate("""()=>{const old=Storage.prototype.setItem,before=BondProfile.export();Storage.prototype.setItem=()=>{throw Error('storage full')};let ok;try{ok=BondProfile.learn('apprentice','apprentice:practice');}finally{Storage.prototype.setItem=old;}return !ok&&BondProfile.export()===before;}"""))
        # Actual class commands must disable training and preserve the new class budget.
        for cls in ['swordsman', 'mage', 'hunter', 'druid']:
            check(cls + ' class choice disables Apprentice training', page.evaluate("""type=>{const s=apprenticeFixture(20,true);s.journey.early.tidecrown=true;s.journey.early.demonstrations=Object.values(BondCampaign.DEMONSTRATIONS);s.journey.early.trials[type]=true;BondProfile.testing.replace(s);
              if(!BondProfile.specialize(type))return false;const now=BondProfile.snapshot();return BondGrowth.used(now.growth.apprentice)===18&&!BondGrowth.unlocked(now,'apprentice')&&!BondProfile.learn('apprentice','apprentice:practice')&&!BondProfile.respec('apprentice')&&BondGrowth.budget(now,type)===2&&BondGrowth.used(now.growth[type])===0;
            }""", cls))
            page.evaluate('type=>BondTree.select(type)', cls)
            check(cls + ' shows its own fifteen talents and new point count', page.locator('[data-talent-node]').count() == 15 and page.locator('#tree-points b').inner_text() == '2')
        for version in [0, 1]:
            frozen = page.evaluate("""version=>{const P=BondProfile,G=BondGame;P.abandonBattle();P.testing.replace(apprenticeFixture(18,true));const sp=P.population().find(x=>x.present),e=P.beginHunt(sp.id),options={profile:P.snapshot(),adventure:true,seed:e.seed,encounter:e,apprenticeTrees:version},b=new G.Battle(G.soloBuild('apprentice'),options);if(!P.reserveBattle(b,e.id,options))return false;
              for(let n=0;n<8&&!b.ended;n++)b.step();P.checkpoint(b);P.respec('apprentice');const raw=P.snapshot();if(!version)delete raw.encounterSave.options.apprenticeTrees;P.testing.replace(raw);const restored=P.restoreBattle(e.id),ok=restored.apprenticeTrees===version&&JSON.stringify(b.events)===JSON.stringify(restored.events)&&b.trainer(0).maxHp===restored.trainer(0).maxHp&&b.trainer(0).interval===restored.trainer(0).interval;P.abandonBattle();return ok;}""", version)
            check(f'Version {version} reserved fights replay frozen training after a reset', frozen)
        check('Old generic Apprentice ranks refund without losing possessions', page.evaluate("""()=>{const s=apprenticeFixture(5);s.growth.apprentice={bond:3,might:2};s.coins=123;s.inventory.potion=7;BondProfile.testing.replace(s);const now=BondProfile.snapshot();return !BondGrowth.used(now.growth.apprentice)&&BondUpgradeNotices.read(now).trainer.points===5&&now.coins===123&&now.trainerXP===s.trainerXP;}"""))
        check('Normal save remains untouched', page.evaluate("localStorage.getItem('bond-bolt-profile-v7')==='normal-save-sentinel'"))
    except Exception:
        errors.append(traceback.format_exc())
    check('No browser or harness errors', not errors)
    browser.close()
server.shutdown()
(ARTIFACTS / f'apprentice-tree-{args.browser}.json').write_text(json.dumps({'checks': checks, 'errors': errors}, indent=2), encoding='utf-8')
print(json.dumps(errors, indent=2))
raise SystemExit(0 if checks and all(c['pass'] for c in checks) and not errors else 1)
