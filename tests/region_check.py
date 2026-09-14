"""Exercise the real exploration UI in isolated browser storage."""
import argparse
from datetime import datetime, timedelta, timezone
import functools
import http.server
import json
import threading
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--browser', choices=['chrome', 'edge'], default='chrome')
    args = parser.parse_args()
    # Pass-08 supersedes the single-scout/two-object UI. Retain old routines below
    # for history, but route this familiar command to the current full workflows.
    from trail_check import run
    run(args.browser, False)
    return
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f'http://127.0.0.1:{server.server_port}/'
    checks, errors, missing, external = [], [], [], []

    def check(name, condition):
        assert condition, name
        checks.append(name)
        print('PASS:', name, flush=True)

    def watch(page):
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('response', lambda r: missing.append(r.url) if r.status >= 400 else None)
        page.on('request', lambda r: external.append(r.url) if r.url.startswith(('http:', 'https:')) and not r.url.startswith(url) else None)
        now = datetime.now(timezone.utc)
        page.clock.install(time=now)
        page.clock.pause_at(now + timedelta(seconds=60))

    def state(page):
        return page.evaluate('BondRegion.inspect()')

    def point(page, x, y, touch=False):
        box = page.locator('#region-map').bounding_box()
        px, py = box['x'] + box['width'] * x / 1000, box['y'] + box['height'] * y / 650
        if touch:
            page.touchscreen.tap(px, py)
        else:
            page.mouse.click(px, py)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=find_browser(args.browser), headless=True)
            context = browser.new_context(viewport={'width':1440,'height':1050}, has_touch=True, reduced_motion='reduce')
            page = context.new_page()
            watch(page)
            page.goto(url)
            page.wait_for_function("!!window.BondRegion&&!!window.BondApp")
            page.wait_for_function("[...document.querySelectorAll('#region-map img')].every(i=>i.complete&&i.naturalWidth>0)")
            original = page.evaluate('BondApp.getBuild()')
            stats = page.evaluate('JSON.stringify(BondGame.UNITS)')
            check('Explore is the entry screen with three accessible tabs', page.locator('#panel-region').is_visible() and page.locator('[role=tab]').count() == 3 and page.locator('[role=tab][aria-selected=true]').count() == 1)
            check('The selected trainer, companions and scout use the illustrated sprites', page.locator('#region-map img').count() == 4 and page.locator('#region-player img').get_attribute('data-character') == 'druid')
            check('A new clearing starts with one uncollected item and no cleared challenge', not state(page)['itemCollected'] and not state(page)['scoutDefeated'])
            page.screenshot(path=str(ARTIFACTS / f'{args.browser}-region-desktop.png'), full_page=True)
            page.locator('#region-map').focus()
            before = state(page)['position']
            page.keyboard.down('d')
            page.clock.run_for(1000)
            page.keyboard.up('d')
            page.clock.run_for(32)
            moved = state(page)['position']
            check('WASD walks the trainer at the configured speed', 150 < moved['x'] - before['x'] < 175 and moved['y'] == before['y'])
            before = moved
            page.keyboard.down('w')
            page.keyboard.down('d')
            page.clock.run_for(500)
            page.keyboard.up('w')
            page.keyboard.up('d')
            page.clock.run_for(32)
            moved = state(page)['position']
            diagonal = ((moved['x']-before['x'])**2 + (moved['y']-before['y'])**2)**.5
            check('Diagonal movement is normalized instead of faster', 72 < diagonal < 94)
            page.keyboard.down('ArrowLeft')
            page.clock.run_for(150)
            page.locator('#tab-loadout').click()
            frozen = state(page)['position']
            page.clock.run_for(600)
            page.keyboard.up('ArrowLeft')
            check('Leaving Explore stops held movement and does not affect loadout controls', state(page)['position'] == frozen and not state(page)['active'])
            page.locator('#tab-region').click()
            point(page, 340, 465)
            page.clock.run_for(1600)
            check('Clicking ground walks to the chosen location', abs(state(page)['position']['x']-340) < 1 and abs(state(page)['position']['y']-465) < 1)
            page.locator('#region-flower').click()
            check('Clicking a distant item approaches instead of collecting remotely', not state(page)['itemCollected'] and state(page)['pending'] == 'flower')
            page.clock.run_for(1500)
            check('Arriving at the flower collects it and updates the satchel', state(page)['itemCollected'] and page.locator('#region-flower').is_hidden() and page.locator('#region-item-count').inner_text() == '1 / 1')
            check('Pickup gives an on-map confirmation, also visible on phones', page.locator('#region-toast').is_visible() and '+1 Mossbloom' in page.locator('#region-toast').inner_text())
            check('Item pickup does not change combat stats or loadouts', page.evaluate('BondApp.getBuild()') == original and page.evaluate('JSON.stringify(BondGame.UNITS)') == stats)
            page.keyboard.press('e')
            check('The collectible cannot be farmed by repeated interaction', page.locator('#region-item-count').inner_text() == '1 / 1')
            saved_position = state(page)['position']
            page.reload()
            check('Collected item and walking position persist after reload', state(page)['itemCollected'] and state(page)['position'] == saved_position)
            page.locator('#region-scout').click()
            check('Clicking a distant NPC queues a walk, not a remote battle', page.evaluate('BondApp.getTab()') == 'region' and state(page)['pending'] == 'scout')
            page.clock.run_for(3500)
            check('Reaching the scout starts an actual six-unit encounter', page.evaluate("BondApp.getTab()==='battle'&&BondApp.getEncounter()==='dusk-scout'&&BondApp.getBattle().time>0&&BondApp.getBattle().units.length===6"))
            check('The encounter uses exactly the editable teams and skills', page.evaluate('BondApp.getBattle().build') == original)
            page.locator('#return-region').click()
            paused = page.evaluate('BondApp.getBattle().time')
            page.clock.run_for(1000)
            check('Returning to the clearing pauses battle and does not immediately relaunch it', page.evaluate('BondApp.getTab()') == 'region' and page.evaluate('BondApp.getBattle().time') == paused and state(page)['pending'] is None)
            page.locator('#region-scout').click()
            page.clock.run_for(200)
            check('Clicking the scout again resumes the unfinished encounter', page.evaluate('BondApp.getBattle().time') > paused)
            page.locator('[data-speed="2"]').click()
            page.clock.run_for(40000)
            check('The default region encounter completes through normal combat playback', page.evaluate('BondApp.getBattle().ended&&BondApp.getBattle().winner===1'))
            page.locator('#result-region').click()
            check('Losing returns safely, retains the item and keeps the challenge available', not state(page)['scoutDefeated'] and state(page)['itemCollected'] and 'scout won' in page.locator('#region-message').inner_text())
            page.locator('#tab-loadout').click()
            counter = [['mend','bramble'],['burn','pounce'],['fortify','slam']]
            for slot, skills in enumerate(counter):
                for skill in [skills[0],skills[0],skills[1],skills[0]]:
                    page.locator(f'.unit-editor[data-side="0"][data-slot="{slot}"] [data-skill="{skill}"]').click()
            check('Editing skills clears the old encounter without resetting region progress', page.evaluate('BondApp.getBattle()===null&&BondApp.getEncounter()===null') and state(page)['itemCollected'])
            page.locator('#tab-region').click()
            page.locator('#region-scout').click()
            page.clock.run_for(30000)
            check('A winning region counter completes through normal combat playback', page.evaluate('BondApp.getBattle().ended&&BondApp.getBattle().winner===0'))
            page.locator('#result-region').click()
            check('Victory completes the quest and leaves a replayable scout', state(page)['scoutDefeated'] and page.locator('#region-goal-scout').get_attribute('class') == 'done' and page.locator('#region-scout-action').inner_text() == 'SPAR AGAIN')
            page.reload()
            check('Both adventure objectives survive a page reload', state(page)['scoutDefeated'] and state(page)['itemCollected'])
            kept_build = page.evaluate('BondApp.getBuild()')
            page.once('dialog', lambda dialog: dialog.accept())
            page.locator('#region-reset').click()
            check('Explicit adventure reset restores the item and spawn but preserves loadouts', not state(page)['itemCollected'] and not state(page)['scoutDefeated'] and state(page)['position'] == {'x':245,'y':510} and page.evaluate('BondApp.getBuild()') == kept_build)
            page.locator('#tab-loadout').click()
            page.locator('#fight').click()
            page.evaluate("(()=>{const b=BondApp.getBattle();b.damage(b.trainer(0),b.trainer(1),9999,'Practice credit fixture');BondApp.renderBattle();BondApp.finish();})()")
            page.locator('#return-region').click()
            check('Winning a sandbox practice battle does not clear the region scout', not state(page)['scoutDefeated'])
            page.locator('#region-scout').click()
            page.evaluate("window.dispatchEvent(new Event('blur'))")
            frozen = state(page)['position']
            page.clock.run_for(1000)
            check('Window focus loss cancels travel and queued NPC interaction', state(page)['position'] == frozen and state(page)['pending'] is None and page.evaluate('BondApp.getTab()') == 'region')
            page.locator('#region-flower').click()
            page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))")
            frozen = state(page)['position']
            page.clock.run_for(1000)
            page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))")
            check('Backgrounding the page stops exploration without catch-up travel', state(page)['position'] == frozen and state(page)['destination'] is None)
            page.locator('#region-map').focus()
            page.keyboard.down('ArrowLeft')
            page.clock.run_for(4000)
            page.keyboard.up('ArrowLeft')
            page.keyboard.down('ArrowUp')
            page.clock.run_for(4000)
            page.keyboard.up('ArrowUp')
            check('Movement clamps to the walkable clearing boundary', state(page)['position'] == {'x':110,'y':205})
            point(page, 5, 5)
            page.clock.run_for(500)
            check('Out-of-bounds clicks clamp rather than trapping navigation', state(page)['position'] == {'x':110,'y':205} and state(page)['destination'] is None)
            for width in [320,390,768,1440]:
                page.set_viewport_size({'width':width,'height':1000})
                check(f'Explore and its controls fit {width}px', page.evaluate("document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.region-controls').scrollWidth<=document.querySelector('.region-controls').clientWidth"))
                if width in [320,390]:
                    point(page, 345, 480, touch=True)
                    page.clock.run_for(2200)
                    check(f'Touch-to-move reaches the destination at {width}px', abs(state(page)['position']['x']-345) < 1 and abs(state(page)['position']['y']-480) < 1)
                    page.screenshot(path=str(ARTIFACTS / f'{args.browser}-region-{width}.png'), full_page=True)
            page.set_viewport_size({'width':390,'height':1000})
            page.locator('#region-flower').tap()
            page.clock.run_for(1800)
            check('Touch interaction collects the item on a narrow screen', state(page)['itemCollected'])
            page.locator('#region-scout').tap()
            page.clock.run_for(4000)
            check('Touch interaction starts the NPC encounter', page.evaluate("BondApp.getTab()==='battle'&&BondApp.getEncounter()==='dusk-scout'"))
            page.locator('#return-region').click()
            page.locator('#tab-region').focus()
            page.keyboard.press('ArrowRight')
            check('Tab arrow navigation moves from Explore to Loadout without walking', page.evaluate("BondApp.getTab()==='loadout'&&document.activeElement.id==='tab-loadout'"))
            page.keyboard.press('End')
            page.keyboard.press('Home')
            check('Home and End navigate all three tabs with correct selected state', page.evaluate("BondApp.getTab()==='region'&&document.activeElement.id==='tab-region'") and page.locator('[role=tab][aria-selected=true]').count() == 1)
            page.evaluate("localStorage.setItem('bond-bolt-region-v1','{broken')")
            page.reload()
            check('Malformed exploration storage recovers without damaging loadouts', not state(page)['itemCollected'] and page.evaluate('BondApp.getBuild()') == kept_build)
            page.evaluate("localStorage.setItem('bond-bolt-region-v1',JSON.stringify({version:1,itemCollected:true,scoutDefeated:false,position:{x:99999,y:-99}}))")
            page.reload()
            check('Persisted positions are clamped to valid map bounds', state(page)['position'] == {'x':880,'y':205})
            for kind in ['offline','storage-blocked']:
                extra = browser.new_context(viewport={'width':390,'height':1000},reduced_motion='reduce')
                if kind == 'storage-blocked':
                    extra.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}})")
                local = extra.new_page()
                watch(local)
                local.goto((ROOT/'index.html').as_uri() if kind == 'offline' else url)
                if kind == 'offline':
                    point(local,450,420)
                    local.clock.run_for(2200)
                    local.keyboard.press('e')
                else:
                    local.locator('#region-flower').click()
                    local.clock.run_for(2500)
                check(f'The region and item collection work in {kind} mode', state(local)['itemCollected'] and local.locator('#region-item-count').inner_text() == '1 / 1')
                if kind == 'storage-blocked':
                    check('Unavailable storage is explained while session progress remains playable', 'Session only' in local.locator('#region-save-status').inner_text())
                extra.close()
            check('No JavaScript or console errors', not errors)
            check('No missing assets', not missing)
            check('No external application requests', not external)
            report={'browser':args.browser,'version':browser.version,'passed':len(checks),'checks':checks,'errors':errors,'missingAssets':missing,'externalRequests':external}
            (ARTIFACTS/f'{args.browser}-region-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
            print(f'VERIFIED: {len(checks)} region checks in {args.browser}',flush=True)
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)


if __name__ == '__main__':
    main()
