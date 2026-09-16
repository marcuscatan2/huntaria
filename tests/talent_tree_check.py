"""Illustrated trainer diagrams, real allocation controls and disposable mobile saves."""
import argparse
import functools
import json
import threading
import traceback
from http.server import ThreadingHTTPServer
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, legacy_adventure, sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--browser', default='chrome', choices=['chrome', 'edge'])
args = parser.parse_args()
server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
checks, errors = [], []


def check(name, value):
    checks.append({'name': name, 'pass': bool(value)})
    print(('PASS ' if value else 'FAIL ') + name, flush=True)


def held_pointer(page, node_id, label, touch=None):
    node = page.locator('[data-talent-node="' + node_id + '"]')
    node.scroll_into_view_if_needed()
    before = node.bounding_box()
    name = node.locator('.talent-name').inner_text()
    x, y = before['x'] + before['width']/2, before['y'] + before['height']/2
    saved = page.evaluate('JSON.stringify(BondProfile.snapshot())')
    if touch:
        touch.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
    else:
        page.mouse.move(x, y)
        page.mouse.down()
    page.wait_for_timeout(220)
    pressed = node.bounding_box()
    hit = page.evaluate('p=>document.elementFromPoint(p.x,p.y)?.closest("[data-talent-node]")?.dataset.talentNode', {'x': x, 'y': y})
    check(label + ' stays in place while pressed', all(abs(before[k]-pressed[k]) < .5 for k in ['x', 'y', 'width', 'height']) and hit == node_id)
    if touch:
        touch.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    else:
        page.mouse.up()
    page.wait_for_timeout(180)
    mobile = page.viewport_size['width'] <= 1000
    details = page.locator('.talent-dialog' if mobile else '.talent-inspector')
    opened = not mobile or details.evaluate('(e)=>e.open')
    check(label + ' opens the correct description on one release', opened and details.locator('h3').inner_text() == name and node.get_attribute('aria-pressed') == 'true')
    check(label + ' inspection leaves points and progress unchanged', page.evaluate('JSON.stringify(BondProfile.snapshot())') == saved)
    if mobile and opened:
        page.keyboard.press('Escape')


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    legacy_adventure(page)
    page.add_init_script("if(!localStorage.getItem('bond-bolt-profile-v7'))localStorage.setItem('bond-bolt-profile-v7','normal-save-sentinel')")
    page.on('pageerror', lambda error: errors.append(str(error)))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
        page.wait_for_function('!!window.BondApp')
        decoded = page.evaluate("""async()=>Promise.all(['sanctuary','mage','druid','swordsman','hunter'].map(async id=>{
            const img=new Image();img.src='assets/talents/'+id+'.png';await img.decode();return img.naturalWidth>=1024&&img.naturalHeight>=1024;
        }))""")
        check('Background and all sixty illustrated talent cells decode', all(decoded))
        for cls in ['mage', 'druid', 'swordsman', 'hunter']:
            page.evaluate("""type=>{const s=BondProfile.snapshot();s.trainerXP=BondProgress.threshold(59);s.character={name:'Tree tester',weapon:'dagger'};s.progression.specialization=type;
                s.growth[type]={};BondProfile.testing.replace(s);BondApp.switchTab('loadout');BondTree.select(type);}""", cls)
            ids = page.evaluate('type=>BondClassTrees.nodes(type).map(n=>n.id)', cls)
            check(cls + ' has fifteen nodes and no class-switch controls', page.locator('[data-talent-node]').count() == 15 and page.locator('[data-class-tree]').count() == 0)
            actual = page.evaluate("()=>[...document.querySelectorAll('[data-from]')].map(e=>[e.dataset.from,e.dataset.to])")
            expected = []
            for offset in [0, 5, 10]:
                expected.extend([[ids[offset+a], ids[offset+b]] for a, b in [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4)]])
            check(cls + ' draws the opening, both alternative forks and capstone dependencies', actual == expected)
            unique = page.evaluate("""()=>new Set([...document.querySelectorAll('.talent-node>.talent-icon')].map(e=>e.getAttribute('style'))).size""")
            check(cls + ' uses fifteen distinct illustrations', unique == 15)
            for width in [1440, 1024, 1000, 768, 390, 320]:
                page.set_viewport_size({'width': width, 'height': 1000 if width > 1000 else 844})
                page.wait_for_timeout(60)
                geometry = page.evaluate("""()=>{
                    const visible=e=>!!e.getClientRects().length,buttons=[...document.querySelectorAll('[data-talent-node]')].filter(visible);
                    const intersect=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
                    return {fit:document.documentElement.scrollWidth<=innerWidth+1,count:buttons.length,
                      targets:buttons.every(e=>{const r=e.getBoundingClientRect(),p=e.closest('.class-talent-branch').getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=p.left&&r.right<=p.right;}),
                      labels:buttons.every(e=>buttons.every(other=>e===other||!intersect(e.querySelector('.talent-name').getBoundingClientRect(),other.getBoundingClientRect()))),
                      siblings:buttons.every(e=>buttons.every(other=>e===other||!intersect(e.querySelector('.talent-name').getBoundingClientRect(),other.querySelector('.talent-name').getBoundingClientRect())))};
                }""")
                check(cls + ' readable graph and touch targets at ' + str(width), geometry['fit'] and geometry['targets'] and geometry['labels'] and geometry['siblings'] and geometry['count'] == (15 if width > 1000 else 5))
                if width in (1440, 390):
                    for index in [1, 4]:
                        held_pointer(page, ids[index], f'{cls} node {index+1} mouse at {width}px')
                if width in (1440, 320):
                    page.locator('#panel-loadout').screenshot(path=str(ARTIFACTS / f'talent-tree-{cls}-{width}.png'))
            before = page.evaluate('JSON.stringify(BondProfile.snapshot())')
            page.locator('[data-talent-node="' + ids[4] + '"]').click()
            dialog = page.locator('.talent-dialog')
            check(cls + ' locked capstone is inspectable and cannot be purchased', dialog.evaluate('(e)=>e.open') and dialog.locator('[data-talent-learn]').is_disabled())
            check(cls + ' inspection does not change the save', page.evaluate('JSON.stringify(BondProfile.snapshot())') == before)
            check(cls + ' dialog stays within the game frame', page.evaluate("""()=>{const d=document.querySelector('.talent-dialog').getBoundingClientRect(),f=document.querySelector('#panel-loadout').getBoundingClientRect();return d.left>=f.left&&d.right<=f.right&&d.top>=f.top&&d.bottom<=f.bottom;}"""))
            page.keyboard.press('Escape')
            check(cls + ' Escape closes details and restores node focus', page.evaluate('id=>!document.querySelector(".talent-dialog").open&&document.activeElement.dataset.talentNode===id', ids[4]))
            for index in [2, 1, 0]:
                page.locator('[data-talent-branch="' + str(index) + '"]').click()
                check(cls + ' branch ' + str(index+1) + ' exposes its own five nodes', page.locator('.class-talent-branch.current [data-talent-node]').count() == 5 and page.locator('.class-talent-branch.current').get_attribute('id') == 'talent-branch-' + str(index))
        # Purchase with the actual phone controls: complete the right fork, then the capstone point threshold.
        page.evaluate("""()=>{const s=BondProfile.snapshot();s.progression.specialization='mage';s.growth.mage={};BondProfile.testing.replace(s);BondTree.select('mage');}""")

        def inspect(node):
            page.locator('[data-talent-node="' + node + '"]').click()
            return page.locator('.talent-dialog [data-talent-learn]')

        inspect('MG1').click()
        check('Learning spends exactly one point and keeps details open', page.evaluate('BondProfile.snapshot().growth.mage.MG1===1&&document.querySelector(".talent-dialog").open') and '14' in page.locator('#tree-points').inner_text())
        page.keyboard.press('Escape')
        check('Opening rank one leaves both forks locked', page.locator('[data-talent-node="MG2"].locked').count() == 1 and page.locator('[data-talent-node="MG3"].locked').count() == 1)
        inspect('MG1').click()
        page.keyboard.press('Escape')
        check('Opening rank two lights both available paths', page.locator('[data-from="MG1"].ready').count() == 2)
        inspect('MG3').click()
        page.locator('.talent-dialog [data-talent-learn]').click()
        page.keyboard.press('Escape')
        check('The right fork alone unlocks the advanced node', page.locator('[data-talent-node="MG4"].available').count() == 1 and page.evaluate('!BondProfile.snapshot().growth.mage.MG2'))
        inspect('MG4').click()
        page.locator('.talent-dialog [data-talent-learn]').click()
        page.keyboard.press('Escape')
        check('Advanced rank two still needs seven branch points for the capstone', inspect('MG5').is_disabled())
        page.keyboard.press('Escape')
        inspect('MG2').click()
        page.keyboard.press('Escape')
        inspect('MG5').click()
        page.keyboard.press('Escape')
        check('Seven branch points unlock the capstone without forcing both forks to max', page.evaluate('BondProfile.snapshot().growth.mage.MG5===1&&BondProfile.snapshot().growth.mage.MG2===1'))
        check('Only the completed fork has a learned line into Advanced', page.locator('[data-from="MG3"][data-to="MG4"].learned').count() == 1 and page.locator('[data-from="MG2"][data-to="MG4"].learned').count() == 0)
        saved = page.evaluate('BondProfile.snapshot().growth.mage')
        page.reload()
        page.wait_for_function('!!window.BondApp')
        page.evaluate("BondApp.switchTab('loadout');BondTree.select('mage')")
        check('Ranks and learned paths survive reload', page.evaluate('BondProfile.snapshot().growth.mage') == saved and page.locator('.talent-edge.learned').count() == 4)
        page.locator('[data-respec]').click()
        check('Free reset clears ranks and all learned connections', page.evaluate('BondGrowth.used(BondProfile.snapshot().growth.mage)===0') and page.locator('.talent-edge.learned').count() == 0)
        # Keyboard-only inspection and purchase on desktop.
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.locator('[data-talent-node="MG1"]').focus()
        page.keyboard.press('Enter')
        check('Desktop keyboard inspection keeps focus and opens the side inspector', page.evaluate('document.activeElement.dataset.talentNode==="MG1"&&!document.querySelector(".talent-dialog").open'))
        page.locator('.talent-inspector [data-talent-learn]').focus()
        page.keyboard.press('Enter')
        check('Desktop keyboard purchase uses the same one-point rule', page.evaluate('BondProfile.snapshot().growth.mage.MG1===1'))
        page.evaluate("""()=>{const s=BondProfile.snapshot();s.companions=[{id:'press-companion',type:'acornboar',xp:BondProgress.threshold(60),skills:BondContent.UNITS.acornboar.default,growth:{}}];BondProfile.testing.replace(s);BondTree.select('press-companion');}""")
        companion_ids = page.locator('.class-talent-branch.current [data-talent-node]').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.talentNode)')
        for width in [1440, 390]:
            page.set_viewport_size({'width': width, 'height': 1000 if width > 1000 else 844})
            for node_id in [companion_ids[1], companion_ids[-1]]:
                held_pointer(page, node_id, f'Companion {node_id} mouse at {width}px')
        # Use touch input, including its held :active state, in a separate phone context.
        touch_context = browser.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
        phone = touch_context.new_page()
        legacy_adventure(phone)
        phone.on('pageerror', lambda error: errors.append(str(error)))
        phone.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
        phone.wait_for_function('!!window.BondApp')
        phone.evaluate("""()=>{const s=BondProfile.snapshot();s.trainerXP=BondProgress.threshold(60);s.progression.specialization='mage';
          s.journey.early.tidecrown=true;s.journey.relic.stage='complete';
          s.companions=[{id:'touch-companion',type:'acornboar',xp:BondProgress.threshold(60),skills:BondContent.UNITS.acornboar.default,growth:{}}];
          BondProfile.testing.replace(s);BondApp.switchTab('loadout');}""")
        touch = touch_context.new_cdp_session(phone)
        for ref in ['mage', 'touch-companion']:
            phone.evaluate('ref=>BondTree.select(ref)', ref)
            ids = phone.locator('.class-talent-branch.current [data-talent-node]').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.talentNode)')
            for node_id in [ids[1], ids[-1]]:
                held_pointer(phone, node_id, f'{ref} {node_id} touch', touch)
        touch_context.close()
        # A failed cosmetic download must never block the tree or its controls.
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.route('**/assets/talents/*.png', lambda route: route.abort())
        page.reload()
        page.wait_for_function('!!window.BondApp')
        page.evaluate("BondApp.switchTab('loadout');BondTree.select('mage')")
        page.locator('[data-talent-node="MG3"]').click()
        check('Missing art leaves named nodes, paths and requirements usable', page.locator('[data-talent-node]').count() == 15 and 'Threefold Script' in page.locator('.talent-inspector').inner_text())
        check('Normal save remains untouched', page.evaluate("localStorage.getItem('bond-bolt-profile-v7')==='normal-save-sentinel'"))
    except Exception:
        errors.append(traceback.format_exc())
    check('No browser or harness errors', not errors)
    browser.close()
server.shutdown()
(ARTIFACTS / f'talent-tree-{args.browser}.json').write_text(json.dumps({'checks': checks, 'errors': errors}, indent=2), encoding='utf-8')
print(json.dumps(errors, indent=2))
raise SystemExit(0 if checks and all(c['pass'] for c in checks) and not errors else 1)
