"""Played pack interactions, population growth and level-based wildlife pursuit."""
import argparse, functools, hashlib, json, threading, traceback
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright, legacy_adventure


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--browser', default='chrome', choices=['chrome', 'edge'])
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    checks, errors = [], []
    hashes = lambda: {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                      for p in [*ROOT.glob('*.js'), *ROOT.glob('*.css'), ROOT/'index.html']}
    source = hashes()

    def check(name, value, detail=None):
        checks.append({'name': name, 'pass': bool(value), 'detail': detail})
        print(('PASS ' if value else 'FAIL ') + name, flush=True)

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
            page = browser.new_page(viewport={'width': 1440, 'height': 1000})
            page.on('pageerror', lambda e: errors.append(str(e)))
            legacy_adventure(page)
            now = datetime.now(timezone.utc)
            page.clock.install(time=now)
            page.clock.pause_at(now + timedelta(seconds=5))
            page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
            page.wait_for_function('!!window.BondApp')
            page.evaluate("()=>{const s=BondProfile.snapshot();s.journey.early.mageGate=true;s.journey.early.introFightWon=true;BondProfile.testing.replace(s);}")
            populations = page.evaluate("""()=>BondAtlas.maps.map(m=>{
              const expected=m.habitats.reduce((n,h)=>n+(m.id==='clearing-0'?{emberfox:144,bloomslime:96,stonehorn:48}[h.type]:h.rarity==='Common'?24:h.rarity==='Uncommon'?15:3),0);
              const live=BondProfile.population(m.id).filter(p=>p.present);
              return {map:m.id,expected,actual:live.length,valid:live.every(p=>!BondAtlas.collision(m.id,p,55)&&!BondWorldLayout.waterAt(m,p)&&BondOpening.groundAllowed(m.id,p.id,p))};
            })""")
            check('Every map fills its tripled quota on valid ground; cities and boss domains stay wildlife-free',
                  all(p['expected'] == p['actual'] and p['valid'] for p in populations), populations)
            check('All species obey the nine/ten-level boundary, including the introductory resident', page.evaluate("""()=>BondAtlas.maps.flatMap(m=>m.habitats).every(h=>{
              const actor={type:h.type,habitat:h,introHostile:h.type==='emberfox'},f=level=>BondWildBehavior.policy(h.map,h.type,actor,level);
              return f(h.level)&&f(h.level+9)&&!f(h.level+10)&&!f(h.level+20)&&f(Math.max(1,h.level-1));
            })"""))
            for pack in page.evaluate('BondCampaign.packs.map(p=>({id:p.id,map:p.map,name:p.name}))'):
                page.evaluate("id=>{const p=BondCampaign.packs.find(p=>p.id===id);BondProfile.travel(p.map,p);BondApp.switchTab('region');}", pack['id'])
                page.clock.run_for(100)
                before = page.evaluate('JSON.stringify({spawns:BondProfile.snapshot().spawns,coins:BondProfile.snapshot().coins,inventory:BondProfile.snapshot().inventory})')
                page.locator('[data-object="'+pack['id']+'"]').click()
                opened = page.locator('#npc-dialog').is_visible()
                check(pack['name']+' opens a complete preview without reserving a fight', opened and page.evaluate('!BondProfile.snapshot().encounterSave'))
                if not opened:
                    raise AssertionError('Pack preview failed: '+pack['id'])
                check(pack['name']+' uses a participating monster portrait', page.evaluate("()=>{const art=document.querySelector('#npc-portrait [data-character]').dataset.character;return [...document.querySelectorAll('#npc-team [data-character]')].some(el=>el.dataset.character===art)&&BondContent.UNITS[art].role!=='Trainer';}"))
                page.keyboard.press('Escape')
                after = page.evaluate('JSON.stringify({spawns:BondProfile.snapshot().spawns,coins:BondProfile.snapshot().coins,inventory:BondProfile.snapshot().inventory})')
                check(pack['name']+' cancels without changing lives, loot or inventory', before == after and page.evaluate('!BondProfile.snapshot().encounterSave'))
            # Repeat the reported cave flow through a real challenge, reload and retreat.
            page.evaluate("()=>{const p=BondCampaign.packs.find(p=>p.id==='pack:rise-3');const s=BondProfile.snapshot();s.trainerXP=BondProgress.threshold(60);BondProfile.testing.replace(s);BondProfile.travel(p.map,p);BondApp.switchTab('region');}")
            page.clock.run_for(100)
            page.locator('[data-object="pack:rise-3"]').click()
            page.screenshot(path=str(ARTIFACTS/f'field-cave-preview-{args.browser}.png'))
            page.locator('#npc-fight').click()
            check('Thunderhollow challenge starts the selected pack', page.evaluate("BondApp.isRunning()&&BondProfile.snapshot().encounterSave.encounter.packId==='pack:rise-3'"))
            page.locator('#pause').click()
            attempt = page.evaluate('BondProfile.snapshot().encounterSave.attempt')
            page.reload(); page.wait_for_function('!!window.BondApp')
            page.locator('#field-resume').click()
            check('Thunderhollow pack resumes the same saved attempt', page.evaluate('BondProfile.snapshot().encounterSave.attempt') == attempt)
            page.locator('#return-region').click(); page.locator('#field-withdraw').click()
            page.clock.run_for(3600)
            check('Running from the cave pack releases movement', page.evaluate('!BondProfile.snapshot().encounterSave&&BondApp.getBattle().escaped'))
            start = page.evaluate('BondRegion.inspect().position')
            page.keyboard.down('d'); page.clock.run_for(250); page.keyboard.up('d')
            check('Keyboard walking works after the cave encounter without reloading', page.evaluate('BondRegion.inspect().position') != start)
            # Level 12 versus Lv2: wait in contact range, then choose a manual attack.
            page.evaluate("""()=>{const P=BondProfile,s=P.snapshot();s.trainerXP=BondProgress.threshold(12);P.testing.replace(s);P.travel('clearing-0');
              window.passiveId=P.population().find(p=>p.type==='emberfox').id;const sp=P.population().find(p=>p.id===passiveId);
              P.position({x:sp.x+70,y:sp.y});BondApp.switchTab('region');}""")
            page.clock.run_for(6000)
            check('A monster exactly ten levels below does not attack at contact range', page.evaluate("!BondProfile.snapshot().encounterSave&&!BondRegion.inspect().actors.find(a=>a.id===passiveId).hostile"))
            check('Level changes update hostility on the same loaded map', page.evaluate("()=>{const P=BondProfile,s=P.snapshot();s.trainerXP=BondProgress.threshold(11);P.testing.replace(s);return BondRegion.inspect().actors.find(a=>a.id===passiveId).hostile;}"))
            page.clock.run_for(1600)
            check('A monster nine levels below initiates a real battle', page.evaluate('!!BondProfile.snapshot().encounterSave&&BondApp.isRunning()'))
            page.evaluate("()=>{BondApp.cancelRegionBattle();const s=BondProfile.snapshot();s.trainerXP=BondProgress.threshold(12);BondProfile.testing.replace(s);const sp=BondProfile.population().find(p=>p.id===passiveId);BondProfile.position({x:sp.x+70,y:sp.y});BondApp.switchTab('region');}")
            page.clock.run_for(100)
            passive_id = page.evaluate('passiveId')
            page.locator('[data-object="'+passive_id+'"]').click()
            check('Passive monsters remain available for a deliberate hunt', page.evaluate('BondApp.isRunning()&&!!BondProfile.snapshot().encounterSave'))
            check('Runtime source stayed unchanged during the check', source == hashes())
            browser.close()
    except Exception:
        errors.append(traceback.format_exc())
    finally:
        server.shutdown()
    check('No browser or test errors', not errors, errors)
    report = {'checks': checks, 'errors': errors, 'source_sha256': source}
    (ARTIFACTS/f'field-encounters-{args.browser}.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'passed': sum(c['pass'] for c in checks), 'total': len(checks), 'failures': [c for c in checks if not c['pass']]}, indent=2), flush=True)
    return 0 if checks and all(c['pass'] for c in checks) else 1


if __name__ == '__main__':
    raise SystemExit(main())
