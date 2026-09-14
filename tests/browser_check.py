"""Run local browser checks; Playwright is a development-only dependency.

Install: python -m pip install playwright
Run:     python tests/browser_check.py [--browser edge] [--inspect | --engine-only]
Uses installed Chrome/Edge; no browser download and no app dependencies.
"""

import argparse
from datetime import datetime, timedelta, timezone
import functools
import http.server
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import threading

# Prefer the active environment. Legacy temporary tools are a fallback only.
try:
    from playwright.sync_api import sync_playwright
except ModuleNotFoundError:
    sys.path.append(str(Path(tempfile.gettempdir()) / "bond-bolt-test-tools"))
    from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "tests" / "artifacts"
ARTIFACTS.mkdir(parents=True, exist_ok=True)


def legacy_adventure(page):
    """Exercise migration/established gameplay without the new-character dialog."""
    page.add_init_script("""if(new URLSearchParams(location.search).get('test')==='1'&&!localStorage.getItem('bond-bolt-profile-v7-sandbox')){
        localStorage.setItem('bond-bolt-profile-v7-sandbox',JSON.stringify({version:7,character:{legacy:true,name:'QA Trainer'},inventory:{biscuit:2}}));
    }""")


class QuietServer(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def find_browser(name):
    if name not in ("chrome", "edge"):
        raise ValueError("Supported browser names: chrome, edge")
    override = os.environ.get("BOND_BROWSER_" + name.upper())
    if override:
        path = Path(override)
        if not path.is_file():
            raise RuntimeError("Configured browser does not exist: " + str(path))
        return str(path)
    if name == "chrome" and os.environ.get("BOND_USE_BUNDLED_CHROMIUM") == "1":
        # None asks Playwright to use its installed Chromium executable.
        return None
    candidates = {
        "chrome": [Path(os.environ.get("PROGRAMFILES", "C:/Program Files")) / "Google/Chrome/Application/chrome.exe"],
        "edge": [Path(os.environ.get("PROGRAMFILES(X86)", "C:/Program Files (x86)")) / "Microsoft/Edge/Application/msedge.exe"],
    }
    for path in candidates[name]:
        if path.is_file():
            return str(path)
    names = ("google-chrome", "chromium", "chromium-browser") if name == "chrome" else ("microsoft-edge",)
    for executable in names:
        found = shutil.which(executable)
        if found:
            return found
    raise RuntimeError(f"{name} not found. Set BOND_BROWSER_{name.upper()} to its executable, "
                       "or install Playwright Chromium and set BOND_USE_BUNDLED_CHROMIUM=1.")


def inspect(page, url):
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(url)
    page.wait_for_function("!!window.BondApp")
    page.locator('#tab-loadout').click()
    page.add_script_tag(path=str(ROOT / "tests" / "engine-tests.js"))
    checks = page.evaluate("runCombatTests()")
    print("Combat checks:", json.dumps({"passed":checks["passed"],"failed":checks["failed"],"failures":[r for r in checks["results"] if not r["pass"]],"metrics":checks["metrics"]}), flush=True)
    page.screenshot(path=str(ARTIFACTS / "loadout-desktop.png"), full_page=True)
    print("Initial load:", json.dumps({"cards": page.locator('.unit-editor').count(), "skills": page.locator('.skill').count(), "overflow": page.evaluate("document.documentElement.scrollWidth > innerWidth")}), flush=True)
    print("Default simulation:", json.dumps(page.evaluate("""() => {
        const b = new BondGame.Battle(BondGame.defaultBuild()).run();
        return {winner:b.winner,time:b.time,reason:b.reason,units:b.units.map(u=>({name:u.name,side:u.side,hp:u.hp,damage:u.damage,healing:u.healing,casts:u.casts})),events:b.events.length};
    }""")), flush=True)
    page.locator('#fight').click()
    page.wait_for_function("BondApp.getBattle().time >= 8")
    page.locator('#pause').click()
    page.screenshot(path=str(ARTIFACTS / "battle-desktop.png"), full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    page.screenshot(path=str(ARTIFACTS / "battle-mobile.png"), full_page=True)
    page.locator('#tab-loadout').click()
    page.screenshot(path=str(ARTIFACTS / "loadout-mobile.png"), full_page=True)
    print("Mobile overflow:", page.evaluate("document.documentElement.scrollWidth > innerWidth"), flush=True)
    print("JavaScript errors:", json.dumps(errors), flush=True)
    assert not errors, errors


def graphics_checks(browser, url, browser_name, check, watch):
    animated_context = browser.new_context(viewport={"width": 1440, "height": 1050}, reduced_motion="no-preference")
    animated = animated_context.new_page()
    watch(animated)
    animated.goto(url)
    animated.locator('#tab-loadout').click()
    simulation = animated.evaluate("""(()=>{const b=new BondGame.Battle(BondGame.defaultBuild()).run();
        return {result:{winner:b.winner,time:b.time,hp:b.units.map(u=>u.hp)},
        fox:b.events.find(e=>e.kind==='damage'&&e.actor==='0-1'&&Number.isFinite(e.reach)).time,
        stone:b.events.find(e=>e.kind==='damage'&&e.actor==='0-2'&&Number.isFinite(e.reach)).time,
        bypass:b.events.find(e=>e.kind==='cast'&&e.bypass).time};})()""")
    expected = simulation['result']
    animated.locator('#fight').click()
    animated.wait_for_function("[...document.querySelectorAll('.character-sprite')].every(i=>i.complete&&i.naturalWidth>0)")
    check("All six combatants load distinct high-resolution illustrated sprites", animated.evaluate("CombatView.inspect().rigs===6&&document.querySelectorAll('.fighter .character-sprite').length===6&&new Set([...document.querySelectorAll('.fighter .character-sprite')].map(i=>i.src)).size===6&&[...document.querySelectorAll('.fighter .character-sprite')].every(i=>i.naturalWidth>=1024)"))
    check("Sprite cutouts have genuine transparent alpha, not baked backgrounds", animated.evaluate("""(()=>{
        return [...document.querySelectorAll('.fighter .character-sprite')].every(img=>{
            const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
            const c=canvas.getContext('2d');c.drawImage(img,0,0,64,64);const data=c.getImageData(0,0,64,64).data;
            let clear=0,opaque=0;for(let n=3;n<data.length;n+=4){if(data[n]===0)clear++;if(data[n]>240)opaque++;}
            return clear>400&&opaque>600&&data[3]===0&&data[(63*64+63)*4+3]===0;
        });})()"""))
    check("Loadout, rail and inspection portraits share the actual battle artwork", animated.evaluate("""(()=>{
        const images=[...document.querySelectorAll('.character-sprite')];
        return ['.portrait','.initiative-unit','.dock-portrait'].every(s=>document.querySelector(s+' .character-sprite'))&&images.every(i=>i.src.endsWith('/assets/art-v6/'+i.dataset.character+'.png'));
    })()"""))
    check("The painted arena background loads locally", animated.evaluate("""async()=>{
        const bg=getComputedStyle(document.querySelector('#arena')).backgroundImage,src=bg.match(/url\\(["']?(.*?)["']?\\)/)[1];
        const img=new Image();img.src=src;await img.decode();return src.endsWith('/assets/art-v6/arena.png')&&img.naturalWidth>=1440;
    }"""))
    check("Bloomslime has a visibly smaller silhouette than the tank", animated.evaluate("document.querySelector('.fighter[data-type=bloomslime] .character-sprite').getBoundingClientRect().height < document.querySelector('.fighter[data-type=stonehorn] .character-sprite').getBoundingClientRect().height*.75"))
    check("The shared interface keeps unique DOM IDs", animated.evaluate("(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.length===new Set(ids).size;})()"))
    animated.clock.run_for(800)
    check("Combat moves actual simulation positions and exposes walking state", animated.evaluate("BondApp.getBattle().units[1].position.x > 38 && CombatView.inspect().walking.includes('0-1')"))
    sprite_before = animated.evaluate("[...document.querySelectorAll('.fighter .character-sprite')].map(e=>e.style.transform)")
    movement_samples = []
    for _ in range(5):
        animated.clock.run_for(16)
        movement_samples.append(animated.evaluate("({time:BondApp.getBattle().time,left:document.querySelector('[data-id=\"0-1\"]').style.left})"))
    check("Walking interpolates between fixed simulation ticks", any(a['time'] == b['time'] and a['left'] != b['left'] for a,b in zip(movement_samples,movement_samples[1:])))
    check("Illustrated sprites retain subtle living poses during movement", animated.evaluate("[...document.querySelectorAll('.fighter .character-sprite')].map(e=>e.style.transform)") != sprite_before)
    # Sample a real melee event; movement and slow now determine its timestamp.
    animated.clock.run_for(max(0, round((simulation['fox'] + .10 - animated.evaluate('BondApp.getBattle().time')) * 1000)))
    state = animated.evaluate("({...CombatView.inspect(), time:BondApp.getBattle().time, reduced:matchMedia('(prefers-reduced-motion: reduce)').matches, pose:document.querySelector('[data-id=\"0-1\"] .fighter-art').style.transform})")
    print("Animation sample:", json.dumps(state), flush=True)
    check("Normal-motion mode renders live effects and a melee lunge", state['effects'] > 0 and state['motions'] > 0 and not state['reduced'])
    samples = []
    for _ in range(5):
        animated.clock.run_for(16)
        samples.append(animated.evaluate("({time:BondApp.getBattle().time,visual:CombatView.inspect().visualTime,pose:document.querySelector('[data-id=\"0-1\"]').style.transform})"))
    check("Animation interpolates smoothly between fixed combat ticks", any(a['time'] == b['time'] and b['visual'] > a['visual'] and a['pose'] != b['pose'] for a,b in zip(samples,samples[1:])))
    check("The fighter and its attached health bar move together", animated.locator('.fighter[data-id="0-1"]').evaluate("e=>Math.abs(new DOMMatrix(getComputedStyle(e).transform).m41 + e.offsetWidth/2) > 1"))
    animated.locator('#pause').click()
    frozen_pose = animated.locator('.fighter[data-id="0-1"] .fighter-art').get_attribute('style')
    frozen_fighter = animated.locator('.fighter[data-id="0-1"]').get_attribute('style')
    frozen_canvas = animated.locator('#combat-canvas').evaluate("c=>c.toDataURL()")
    frozen_positions = animated.evaluate("BondApp.getBattle().units.map(u=>u.position)")
    frozen_rigs = animated.evaluate("[...document.querySelectorAll('.fighter .character-sprite')].map(e=>e.style.transform)")
    animated.clock.run_for(500)
    check("Pause freezes presentation effects as well as combat", animated.locator('.fighter[data-id="0-1"] .fighter-art').get_attribute('style') == frozen_pose and animated.locator('.fighter[data-id="0-1"]').get_attribute('style') == frozen_fighter and animated.locator('#combat-canvas').evaluate("c=>c.toDataURL()") == frozen_canvas)
    check("Pause freezes actual movement positions", animated.evaluate("BondApp.getBattle().units.map(u=>u.position)") == frozen_positions)
    check("Pause also freezes every illustrated sprite pose", animated.evaluate("[...document.querySelectorAll('.fighter .character-sprite')].map(e=>e.style.transform)") == frozen_rigs)
    check("Fire, lightning, nature and stone have distinct effect themes", {'fire','lightning','nature','stone'}.issubset(set(state['themes'])))
    animated.screenshot(path=str(ARTIFACTS / f"{browser_name}-graphics-desktop.png"), full_page=True)
    animated.set_viewport_size({"width": 390, "height": 844})
    animated.clock.run_for(32)
    animated.screenshot(path=str(ARTIFACTS / f"{browser_name}-graphics-mobile.png"), full_page=True)
    check("Canvas adapts to the mobile arena", animated.evaluate("CombatView.inspect().width === document.querySelector('#arena').clientWidth"))
    check("Resizing changes projection without changing combat positions", animated.evaluate("BondApp.getBattle().units.map(u=>u.position)") == frozen_positions)
    check("Selected-unit dock explains range and movement speed", 'Reach' in animated.locator('#selected-movement').inner_text() and 'Speed' in animated.locator('#selected-movement').inner_text())
    animated.locator('#start-battle').click()
    animated.locator('[data-speed="2"]').click()
    animated.clock.run_for(40000)
    actual = animated.evaluate("({winner:BondApp.getBattle().winner,time:BondApp.getBattle().time,hp:BondApp.getBattle().units.map(u=>u.hp)})")
    check("Normal-motion combat preserves the verified outcome", animated.evaluate("BondApp.getBattle().ended") and actual == expected)
    check("Transient effects are released after the fight", animated.evaluate("CombatView.inspect().effects === 0 && CombatView.inspect().motions === 0 && CombatView.inspect().casts === 0"))
    check("Displayed impact health converges exactly to final combat health", animated.evaluate("CombatView.inspect().health.every(h=>h.pending===0&&h.shown===BondApp.getBattle().units.find(u=>u.id===h.id).hp)"))
    check("Survivors celebrate and fallen units finish their defeat poses", animated.evaluate("BondApp.getBattle().units.every(u=>document.querySelector(`[data-id='${u.id}']`).dataset.motion===(u.hp<=0?'defeated':u.side===BondApp.getBattle().winner?'victory':'idle'))"))
    animated.locator('#restart').click()
    animated.clock.run_for(round((simulation['bypass'] + .12) * 500))
    check("Skyneedle displays a trainer-bypass cue while monsters still live", animated.evaluate("CombatView.inspect().effectTypes.includes('bypass') && BondApp.getBattle().team(0).filter(u=>u.slot>0).length === 2"))
    animated.clock.run_for(max(0, round((simulation['stone'] + .24 - animated.evaluate('BondApp.getBattle().time')) * 500)))
    animated.locator('#pause').click()
    check("Stonehorn uses its heavier, longer attack animation", animated.evaluate("document.querySelector('[data-id=\"0-2\"]').classList.contains('is-acting') && CombatView.inspect().motions > 0"))
    animated.locator('#initiative [data-unit="0-2"]').click()
    check("Action-rail portraits can inspect units during crowded combat", animated.evaluate("CombatView.inspect().selected === '0-2'") and animated.locator('#initiative [data-unit="0-2"]').get_attribute('aria-pressed') == 'true')
    check("Inspecting a monster reveals its current nearest target", animated.evaluate("CombatView.inspect().focus === BondApp.getBattle().target(BondApp.getBattle().units[2]).id"))
    animated.screenshot(path=str(ARTIFACTS / f"{browser_name}-movement-mobile.png"), full_page=True)
    # Reset to a known living formation before the controlled death fixture.
    animated.locator('#restart').click()
    animated.clock.run_for(300)
    animated.locator('#pause').click()
    animated.locator('.fighter[data-id="0-2"]').click()
    # Controlled mid-fight fixture: defeat one opponent and observe the real
    # engine event reaching the UI on its next normal animation frame.
    animated.evaluate("(()=>{const b=BondApp.getBattle();b.damage(b.trainer(0),b.units.find(u=>u.id==='1-2'),9999,'Retarget regression')})()")
    animated.locator('#start-battle').click()
    animated.clock.run_for(150)
    animated.locator('#pause').click()
    check("Losing one enemy monster retargets Stonehorn to Stormowl in the UI", animated.evaluate("BondApp.getBattle().units.find(u=>u.id==='0-2').targetId==='1-1' && CombatView.inspect().focus==='1-1'") and 'Stormowl' in animated.locator('#selected-target').inner_text())
    check("Target switching produces a visible retarget effect and journal entry", animated.evaluate("CombatView.inspect().effectTypes.includes('retarget')") and animated.locator('#combat-log li.retarget').count() > 0)
    animated.screenshot(path=str(ARTIFACTS / f"{browser_name}-retarget-mobile.png"), full_page=True)
    # Verify moving combat remains readable at the narrowest supported viewport.
    animated.set_viewport_size({"width": 320, "height": 844})
    animated.locator('#restart').click()
    animated.clock.run_for(1500)
    animated.locator('#pause').click()
    animated.screenshot(path=str(ARTIFACTS / f"{browser_name}-movement-320.png"), full_page=True)
    check("The narrow mobile brand fits inside its header without clipping", animated.evaluate("""(()=>{
        const brand=document.querySelector('.brand').getBoundingClientRect(),bar=document.querySelector('.topbar').getBoundingClientRect();
        return brand.top>=bar.top&&brand.bottom<=bar.bottom&&brand.right<=bar.right;})()"""))
    check("Moving fighters stay inside the narrow mobile arena", animated.evaluate("""(()=>{
        const arena=document.querySelector('#arena').getBoundingClientRect();
        return [...document.querySelectorAll('.fighter')].every(e=>{const r=e.getBoundingClientRect();return r.left>=arena.left-1&&r.right<=arena.right+1&&r.top>=arena.top+110&&r.bottom<=arena.bottom-18;});})()"""))
    quiet_state = animated.evaluate("JSON.stringify(BondApp.getBattle())")
    animated.locator('#fx-mode').click()
    animated.clock.run_for(32)
    check("Quiet FX disables camera shake without changing the fight", animated.evaluate("CombatView.inspect().quietFX && new DOMMatrix(getComputedStyle(document.querySelector('#battle-world')).transform).m41===0") and animated.evaluate("JSON.stringify(BondApp.getBattle())") == quiet_state)
    animated.locator('#fx-mode').click()

    # Isolate an actual legal melee cast: model damage resolves immediately, but
    # the presentation and accessible health wait for the visible contact frame.
    animated.locator('#restart').click()
    animated.locator('#sound').check()
    animated.evaluate("""(()=>{const b=BondApp.getBattle();b.units.forEach(u=>{u.actionRemaining=10000;u.moveSpeed=0;});
        const fox=b.units[1],owl=b.units[4];fox.position={x:owl.position.x-11,y:owl.position.y};fox.previousPosition={...fox.position};
        b.cast(fox,BondGame.SKILLS.pounce);BondApp.renderBattle();CombatView.draw(0,0);})()""")
    check("Damage health waits for contact rather than changing during wind-up", animated.evaluate("BondApp.getBattle().units[4].hp===460&&CombatView.inspect().health.find(h=>h.id==='1-1').shown===570&&+document.querySelector('[data-id=\"1-1\"] .fighter-hp').getAttribute('aria-valuenow')===570"))
    animated.clock.run_for(180)
    check("Contact updates visible and accessible health together", animated.evaluate("CombatView.inspect().health.find(h=>h.id==='1-1').shown===460&&+document.querySelector('[data-id=\"1-1\"] .fighter-hp').getAttribute('aria-valuenow')===460"))
    check("Optional impact sound is triggered by the contact timeline", animated.evaluate("BondApp.inspectSound().count>0"))
    animated.locator('#pause').click()
    animated.wait_for_function("BondApp.inspectSound().state==='suspended'")
    check("Pause suspends optional impact audio", animated.evaluate("BondApp.inspectSound().state==='suspended'"))
    animated.locator('#sound').uncheck()

    # Test particles and every rig pose without mutating the simulator.
    fixture = animated.evaluate("JSON.stringify(BondApp.getBattle())")
    animated.evaluate("CombatView.draw(1234,.03)")
    check("The complete animation renderer never mutates the combat model", animated.evaluate("JSON.stringify(BondApp.getBattle())") == fixture)
    check("Every spell-effect family renders across all eight element palettes", animated.evaluate("""(()=>{
        const canvas=document.createElement('canvas');canvas.width=300;canvas.height=220;const c=canvas.getContext('2d');
        const positions=new Map([['a',{x:60,y:90,foot:130}],['b',{x:190,y:105,foot:150}]]);
        for(const theme of Object.keys(CombatVFX.themes))for(const type of ['sigil','projectile','burst','slash','shockwave','nova','heal','vines','ward','dust','defeat']){
            c.clearRect(0,0,300,220);CombatVFX.draw(c,{type,theme,born:0,life:.7,source:'a',target:'b',serial:4},.21,positions,300,false);
            const data=c.getImageData(0,0,300,220).data;let pixels=0;for(let i=3;i<data.length;i+=4)if(data[i]>0)pixels++;
            if(pixels<10)throw Error(type+' '+theme+' rendered no effect');
        }return true;})()"""))
    animated.emulate_media(reduced_motion='reduce')
    animated.locator('#restart').click()
    animated.clock.run_for(300)
    reduced_parts = animated.evaluate("[...document.querySelectorAll('.fighter .character-sprite')].map(e=>e.style.transform)")
    animated.clock.run_for(200)
    check("Reduced motion keeps real movement but suppresses decorative sprite animation", animated.evaluate("BondApp.getBattle().units[1].position.x>33&&new DOMMatrix(getComputedStyle(document.querySelector('#battle-world')).transform).m41===0") and animated.evaluate("[...document.querySelectorAll('.fighter .character-sprite')].map(e=>e.style.transform)") == reduced_parts)
    animated_context.close()


def verify(browser, context, page, url, browser_name, graphics_only=False):
    passed, errors, failed_requests, external_requests = [], [], [], []

    def check(name, condition):
        assert condition, name
        passed.append(name)
        print("PASS:", name, flush=True)

    def watch(p):
        p.on("pageerror", lambda e: errors.append(str(e)))
        p.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        p.on("response", lambda r: failed_requests.append(f"{r.status} {r.url}") if r.status >= 400 else None)
        p.on("request", lambda r: external_requests.append(r.url) if r.url.startswith(("http:", "https:")) and not r.url.startswith(url) else None)
        # Drive real requestAnimationFrame callbacks with virtual browser time.
        # This exercises app playback, not just calling the simulator's run().
        start_time = datetime.now(timezone.utc) + timedelta(seconds=1)
        p.clock.install(time=start_time)
        # Leave a generous future boundary: under CPU load, pausing at the exact
        # installed instant can race wall time and fail before the app even loads.
        p.clock.pause_at(start_time + timedelta(seconds=60))

    if graphics_only:
        graphics_checks(browser, url, browser_name, check, watch)
        check("No JavaScript or console errors", not errors)
        check("No missing application assets", not failed_requests)
        check("Application makes no external network requests", not external_requests)
        report = {"browser": browser_name, "version": browser.version, "passed": len(passed), "checks": passed, "errors": errors}
        (ARTIFACTS / f"{browser_name}-graphics-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"VERIFIED: {len(passed)} graphics checks in {browser_name}", flush=True)
        return

    def build(p=page):
        return p.evaluate("BondApp.getBuild()")

    def battle_time(p=page):
        return p.evaluate("BondApp.getBattle().time")

    def card(side, slot, p=page):
        return p.locator(f'.unit-editor[data-side="{side}"][data-slot="{slot}"]')

    watch(page)
    page.goto(url)
    page.wait_for_function("!!window.BondApp")
    page.locator('#tab-loadout').click()
    default = page.evaluate("BondGame.defaultBuild()")
    check("Initial load: six unit editors and eighteen skill choices", page.locator('.unit-editor').count() == 6 and page.locator('.skill').count() == 18)
    check("Every loadout shows base attack range and walking speed", page.locator('.movement-stats').count() == 6 and 'MOVE 4.8' in card(0,2).locator('.movement-stats').inner_text())
    page.add_script_tag(path=str(ROOT / "tests" / "engine-tests.js"))
    engine = page.evaluate("runCombatTests()")
    print("Combat checks:", json.dumps(engine), flush=True)
    check("All combat regression checks and the 500-build sweep pass", engine["failed"] == 0)
    page.screenshot(path=str(ARTIFACTS / f"{browser_name}-loadout-desktop.png"), full_page=True)

    card(0, 0).locator('[data-skill="bramble"]').click()
    check("Unequipped skill replaces the second slot", build()[0][0]["skills"] == ["mend", "bramble"])
    card(0, 0).locator('[data-skill="bramble"]').click()
    check("Equipped skill promotes to first priority", build()[0][0]["skills"] == ["bramble", "mend"])
    check("Skill editing preserves keyboard focus", page.evaluate("document.activeElement.dataset.skill === 'bramble'"))
    card(0, 0).locator('.swap-priority').click()
    check("Swap reverses the two priorities", build()[0][0]["skills"] == ["mend", "bramble"])
    card(0, 0).locator('select').select_option("mage")
    check("Class selection changes class and legal skills", build()[0][0] == {"type": "mage", "skills": ["frost", "nova"]})
    check("Class selection preserves keyboard focus", page.evaluate("document.activeElement.matches('select')"))
    card(0, 1).locator('select').select_option("stormowl")
    card(0, 2).locator('select').select_option("stormowl")
    check("Selecting an existing monster swaps lanes without duplicates", [u["type"] for u in build()[0][1:]] == ["stonehorn", "stormowl"])
    saved = build()
    page.reload()
    check("Custom loadout persists after reload", build() == saved)
    page.locator('#tab-loadout').click()
    page.locator('#reset-loadouts').click()
    check("Reset restores both default teams", build() == default)

    page.locator('#tab-loadout').focus()
    page.keyboard.press("ArrowRight")
    check("Keyboard tab navigation opens a ready six-unit arena", page.locator('#panel-battle').is_visible() and page.locator('.fighter').count() == 6 and battle_time() == 0)
    check("Combat HUD includes both trainer bars and six action previews", page.locator('.bond-health').count() == 2 and page.locator('.initiative-unit').count() == 6)
    check("A selected unit exposes its two equipped skills", page.locator('.dock-skill').count() == 2 and page.locator('.selected-unit strong').inner_text() == 'Druid')
    page.locator('.fighter[data-id="1-0"]').click()
    check("Clicking the enemy trainer inspects its skills without changing builds", page.locator('.selected-unit strong').inner_text() == 'Mage' and build() == default)
    page.locator('.fighter[data-id="0-2"]').focus()
    page.keyboard.press("Enter")
    check("Keyboard inspection selects a monster", page.locator('.selected-unit strong').inner_text() == 'Stonehorn')
    check("Normal focus indicator selects the nearest monster", page.evaluate("CombatView.inspect().focus === '1-2' && document.querySelector('[data-id=\"1-2\"]').classList.contains('targeted')"))
    page.locator('#tab-battle').focus()
    page.keyboard.press("Home")
    check("Home returns to Explore with correct tab state", page.locator('#tab-region').get_attribute('aria-selected') == 'true')
    page.locator('#tab-loadout').click()
    page.locator('#fight').click()
    page.clock.run_for(3000)
    check("Enter arena starts real animated combat", battle_time() >= 2.8 and page.evaluate("BondApp.getBattle().units.some(u=>u.hp < u.maxHp)"))
    check("Reduced-motion mode preserves real movement without cosmetic bobbing", page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches && BondApp.getBattle().units[1].position.x > 33 && document.querySelector('[data-id=\"0-1\"]').style.left !== '33%'"))
    page.locator('#pause').click()
    paused = battle_time()
    page.clock.run_for(1000)
    check("Pause freezes simulation", battle_time() == paused and page.locator('#battle-state-label').inner_text() == "PAUSED")
    page.locator('#start-battle').click()
    page.clock.run_for(1000)
    normal_delta = battle_time() - paused
    check("Resume advances at 1x", .9 <= normal_delta <= 1.1)
    before = battle_time()
    page.locator('[data-speed="2"]').click()
    page.clock.run_for(1000)
    check("2x playback doubles simulation speed", 1.9 <= battle_time() - before <= 2.1)
    page.locator('#pause').click()
    page.screenshot(path=str(ARTIFACTS / f"{browser_name}-battle-desktop.png"), full_page=True)
    page.locator('#start-battle').click()
    page.locator('#tab-loadout').click()
    paused = battle_time()
    page.clock.run_for(1000)
    check("Editing tab automatically pauses an active fight", battle_time() == paused)
    page.locator('#tab-battle').click()
    page.locator('#start-battle').click()
    page.clock.run_for(40000)
    first_result = page.evaluate("({winner:BondApp.getBattle().winner,time:BondApp.getBattle().time})")
    check("Animated combat reaches the expected complete result", page.evaluate("BondApp.getBattle().ended") and first_result == {"winner": engine["metrics"]["default"]["winner"], "time": engine["metrics"]["default"]["time"]})
    check("Result contains six statistics rows and a rematch action", page.locator('#scoreboard').is_visible() and page.locator('#scoreboard tbody tr:not(.team-divider)').count() == 6 and page.locator('#try-build').is_visible())
    check("Journal stays bounded and ends with the victory event", 0 < page.locator('#combat-log li').count() <= 65 and 'end' in page.locator('#combat-log li').first.get_attribute('class'))
    check("Rendered health bars match the simulation", page.evaluate("BondApp.getBattle().units.every(u=>+document.querySelector(`[data-id='${u.id}'] .fighter-hp`).getAttribute('aria-valuenow')===u.hp)"))
    check("Trainer HUD agrees with the final combat state", page.evaluate("[0,1].every(s=>document.querySelector(s?'#dusk-bond-text':'#grove-bond-text').textContent.includes(BondApp.getBattle().trainer(s).hp+'/'+BondApp.getBattle().trainer(s).maxHp))"))
    finished = battle_time()
    page.clock.run_for(1000)
    check("Finished battle stops advancing", battle_time() == finished)
    page.screenshot(path=str(ARTIFACTS / f"{browser_name}-result-desktop.png"), full_page=True)
    page.locator('#start-battle').click()
    check("Play again resets to a fresh battle", battle_time() == 0 and page.locator('#scoreboard').is_hidden())
    page.clock.run_for(1000)
    page.locator('#restart').click()
    check("Restart clears prior combat state and events", battle_time() == 0 and page.evaluate("BondApp.getBattle().events.length") == 0)
    page.clock.run_for(40000)
    check("Rematch reproduces the same winner and duration", page.evaluate("({winner:BondApp.getBattle().winner,time:BondApp.getBattle().time})") == first_result)

    page.locator('#try-build').click()
    counter = next(v for v in engine["metrics"]["groveVariants"]["best"] if v["winner"] == 0)
    for slot, skills in enumerate(counter["skills"]):
        # Adding a new skill replaces slot 2; promote it before adding the other.
        for skill in [skills[0], skills[0], skills[1], skills[0]]:
            card(0, slot).locator(f'[data-skill="{skill}"]').click()
    check("Skill choices alone can construct a winning Grove counter", [u["skills"] for u in build()[0]] == counter["skills"] and page.evaluate("BondApp.getBattle() === null"))
    page.locator('#fight').click()
    page.clock.run_for(40000)
    check("The revised loadout wins through browser playback", page.evaluate("BondApp.getBattle().ended && BondApp.getBattle().winner === 0"))

    for width in [320, 375, 390, 768, 1024, 1440]:
        page.set_viewport_size({"width": width, "height": 844})
        for tab in ["loadout", "battle"]:
            page.locator(f'#tab-{tab}').click()
            check(f"{tab.capitalize()} fits {width}px without page overflow", page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
            if tab == "battle":
                check(f"Combat controls and skill dock fit {width}px", page.evaluate("['.battle-controls','.combat-dock'].every(s=>{const e=document.querySelector(s);return e.scrollWidth <= e.clientWidth + 1})"))
        if width == 390:
            page.screenshot(path=str(ARTIFACTS / f"{browser_name}-result-mobile.png"), full_page=True)
            page.locator('#tab-loadout').click()
            page.screenshot(path=str(ARTIFACTS / f"{browser_name}-loadout-mobile.png"), full_page=True)

    page.evaluate("localStorage.setItem('bond-bolt-build-v1', '{broken json')")
    page.reload()
    check("Malformed saved JSON recovers to a playable default", build() == default)
    page.evaluate("localStorage.setItem('bond-bolt-build-v1', JSON.stringify([[null], {}]))")
    page.reload()
    check("Invalid saved build also recovers safely", build() == default)
    page.locator('#tab-loadout').click()

    # Preserve old saved skill IDs while applying the new monster-first meaning.
    card(0, 1).locator('[data-skill="pierce"]').click()
    page.reload()
    check("Existing Wild Lunge loadouts stay valid and explain monster-first reach", build()[0][1]["skills"] == ["pounce", "pierce"] and "closest enemy monster" in card(0,1).locator('[data-skill="pierce"]').get_attribute('title'))
    page.locator('#tab-loadout').click()
    check("Bloomslime's loadout shows its reduced 500 HP", "500" in card(1,2).locator('.stats').inner_text())
    page.locator('#fight').click()
    page.locator('[data-speed="1"]').click()
    page.clock.run_for(5000)
    page.locator('#pause').click()
    page.locator('#initiative [data-unit="0-1"]').click()
    check("Saved Pounce + Wild Lunge hits Stormowl twice and the dock never pursues Mage", page.evaluate("""(()=>{
        const b=BondApp.getBattle(),hits=b.events.filter(e=>e.kind==='damage'&&e.actor==='0-1');
        return hits.length===2&&hits.every(e=>e.target==='1-1')&&b.units[1].moveTargetId==='1-1'&&CombatView.inspect().focus==='1-1';})()""") and "Stormowl" in page.locator('#selected-target').inner_text())
    page.screenshot(path=str(ARTIFACTS / f"{browser_name}-fox-targeting.png"), full_page=True)

    file_context = browser.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
    local = file_context.new_page()
    watch(local)
    local.goto((ROOT / 'index.html').as_uri())
    check("Double-click file mode loads all units without a server", local.locator('.unit-editor').count() == 6)
    local.locator('#tab-loadout').click()
    card(1, 0, local).locator('[data-skill="hex"]').click()
    file_saved = build(local)
    local.reload()
    check("File-mode loadouts persist in the tested browser", build(local) == file_saved)
    local.locator('#tab-loadout').click()
    local.wait_for_function("[...document.querySelectorAll('.portrait .character-sprite')].every(i=>i.complete&&i.naturalWidth>0)")
    check("All six illustrated portraits also load in offline file mode", local.locator('.portrait .character-sprite').count() == 6)
    local.locator('#fight').click()
    local.locator('[data-speed="2"]').click()
    local.clock.run_for(40000)
    check("File mode completes animated combat and renders a result", local.evaluate("BondApp.getBattle().ended") and local.locator('#scoreboard').is_visible())
    file_context.close()

    blocked_context = browser.new_context(reduced_motion="reduce")
    blocked_context.add_init_script("Object.defineProperty(window, 'localStorage', {get(){throw new DOMException('Storage blocked', 'SecurityError')}})")
    blocked = blocked_context.new_page()
    watch(blocked)
    blocked.goto(url)
    blocked.locator('#tab-loadout').click()
    card(0, 0, blocked).locator('[data-skill="bramble"]').click()
    check("Blocked storage retains edits in session and explains the limitation", build(blocked)[0][0]["skills"] == ["mend", "bramble"] and "Session only" in blocked.locator('#save-status').inner_text())
    blocked.locator('#fight').click()
    blocked.locator('[data-speed="2"]').click()
    blocked.clock.run_for(40000)
    check("Combat remains playable with browser storage disabled", blocked.evaluate("BondApp.getBattle().ended") and blocked.locator('#scoreboard').is_visible())
    blocked_context.close()

    graphics_checks(browser, url, browser_name, check, watch)
    check("No JavaScript or console errors", not errors)
    check("No missing application assets", not failed_requests)
    check("Application makes no external network requests", not external_requests)
    report = {"browser": browser_name, "version": browser.version, "uiPassed": len(passed), "uiChecks": passed, "engine": engine, "errors": errors, "missingAssets": failed_requests, "externalRequests": external_requests}
    (ARTIFACTS / f"{browser_name}-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"VERIFIED: {len(passed)} browser checks + {engine['passed']} combat checks in {browser_name} {browser.version}", flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--inspect", action="store_true")
    parser.add_argument("--engine-only", action="store_true", help="Only run the fast simulator regression checks")
    parser.add_argument("--graphics-only", action="store_true", help="Only run the normal-motion graphics checks and playthrough")
    parser.add_argument("--browser", choices=["chrome", "edge"], default="chrome")
    args = parser.parse_args()
    if not args.engine_only:
        # Keep pass-07 routines above as historical fixtures. The normal entry
        # point now exercises the expanded UI instead of obsolete two-slot cards.
        from trail_check import run
        run(args.browser, args.inspect)
        return
    ARTIFACTS.mkdir(exist_ok=True)
    handler = functools.partial(QuietServer, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{server.server_port}/"
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=find_browser(args.browser), headless=True)
            context = browser.new_context(viewport={"width": 1440, "height": 1050}, reduced_motion="reduce")
            page = context.new_page()
            if args.engine_only:
                page.goto(url + "tests/index.html")
                page.locator('#run').click()
                checks = json.loads(page.locator('#output').inner_text())
                print(json.dumps(checks), flush=True)
                assert checks["failed"] == 0, "Combat regressions failed"
                (ARTIFACTS / f"{args.browser}-engine-report.json").write_text(json.dumps(checks, indent=2), encoding="utf-8")
                print(f"VERIFIED: {checks['passed']} combat checks", flush=True)
            elif args.inspect:
                inspect(page, url)
            else:
                verify(browser, context, page, url, args.browser, args.graphics_only)
            print("Browser:", browser.version, flush=True)
            context.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
