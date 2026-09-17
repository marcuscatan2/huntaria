"""Upgrade a cached older menu on the same origin without clearing progress."""
import argparse
import functools
import io
import json
import re
import sys
import tempfile
from pathlib import Path
import threading
import traceback
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

from browser_check import ROOT, ARTIFACTS, find_browser, legacy_adventure, sync_playwright

sys.path.insert(0, str(ROOT / 'scripts'))
from serve_game import GameHandler, version_entry


class CachedMenu(GameHandler):
    def log_message(self, *_args):
        pass

    def send_head(self):
        self.server.requests.append(self.path)
        name = urlsplit(self.path).path.lstrip('/') or 'index.html'
        if self.server.legacy and name in ('index.html', 'region.js', 'menu.js'):
            source = (ROOT / name).read_text(encoding='utf-8-sig')
            if name == 'index.html':
                source = re.sub(r'\s*<script src="upgrade-notices.js" defer></script>', '', source)
                source = re.sub(r'\s*<link rel="stylesheet" href="menu-navigation.css">', '', source)
            else:
                source = source.replace('BondUpgradeNotices.refresh();', '')
                source = re.sub(r'<img class="destination-icon"[^>]*>', '<span class="old-icon">Old</span>', source)
            body = source.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html' if name.endswith('.html') else 'text/javascript')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Last-Modified', self.date_time_string((ROOT / name).stat().st_mtime))
            self.end_headers()
            return io.BytesIO(body)
        return super().send_head()

    def end_headers(self):
        if self.server.legacy:
            self.send_header('Cache-Control', 'public, max-age=86400')
            SimpleHTTPRequestHandler.end_headers(self)
        else:
            super().end_headers()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--browser', choices=['chrome', 'edge'], default='chrome')
    args = parser.parse_args()
    checks, errors = [], []

    def check(name, result):
        checks.append({'name': name, 'pass': bool(result)})
        print(('PASS ' if result else 'FAIL ') + name, flush=True)

    with tempfile.TemporaryDirectory(prefix='bond-entry-version-') as folder:
        root = Path(folder)
        path = root / 'menu.js'
        entry = '<script src="menu.js" defer></script>'
        path.write_text('const menuVersion=1;', encoding='utf-8')
        first = version_entry(entry, root)
        path.write_text('const menuVersion=2;', encoding='utf-8')
        second = version_entry(entry, root)
        check('Changed scripts get a new URL without editing the entry', first != second)
        check('Unchanged source keeps a deterministic script URL', second == version_entry(entry, root))

    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(CachedMenu, directory=str(ROOT)))
    server.legacy, server.requests = True, []
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
            page = browser.new_page(viewport={'width': 390, 'height': 844})
            legacy_adventure(page)
            page.add_init_script("if(!localStorage.getItem('bond-bolt-profile-v7'))localStorage.setItem('bond-bolt-profile-v7','normal-save-sentinel')")
            page.on('pageerror', lambda error: errors.append(str(error)))
            url = f'http://127.0.0.1:{server.server_port}/?test=1'
            page.goto(url)
            page.wait_for_function('!!window.BondApp')
            page.evaluate("""()=>{const s=BondProfile.fresh();s.character={name:'Refresh tester',weapon:'dagger'};
                s.progression.specialization='mage';s.trainerXP=BondProgress.threshold(25);s.coins=73;
                s.journey.early.introFightWon=true;s.journey.early.mageGate=true;s.journey.early.tidecrown=true;
                s.inventory['weapon:class:mage']=1;s.equipment.weapon='weapon:class:mage';
                s.companions=[{id:'refresh:1',type:'acornboar',xp:BondProgress.threshold(5),skills:BondContent.UNITS.acornboar.default,growth:{}}];
                BondProfile.testing.replace(s);BondApp.switchTab('region');}""")
            check('Older cached menu lacks both SVG icons and upgrade badges', page.locator('#world-action-menu .old-icon').count() == 3 and page.locator('.upgrade-dot').count() == 0)
            saved = page.evaluate('BondProfile.snapshot()')
            server.legacy, server.requests = False, []
            response = page.reload()
            page.wait_for_function('!!window.BondApp && !!window.BondUpgradeNotices')
            check('Normal refresh retrieves a fresh entry at the same URL', response.status == 200 and page.url == url and 'no-store' in response.headers.get('cache-control', ''))
            check('Refresh bypasses old cached menu scripts with content-specific URLs', all(any(urlsplit(p).path == '/' + name and 'v=' in urlsplit(p).query for p in server.requests) for name in ['region.js', 'menu.js', 'upgrade-notices.js', 'menu-navigation.css']))
            check('Bottom-menu icons decode and only Inner Sea marks upgrades', page.locator('#world-action-menu .destination-icon').count() == 3 and page.locator('#world-action-menu .upgrade-dot').count() == 1)
            check('Icon images decode and badges are visibly red', page.evaluate("async()=>{await Promise.all([...document.querySelectorAll('#world-action-menu img')].map(i=>i.decode()));return [...document.querySelectorAll('#world-action-menu .upgrade-dot')].every(e=>getComputedStyle(e).backgroundColor==='rgb(228, 68, 72)'&&e.getBoundingClientRect().width>=10);}"))
            page.locator('#world-action-menu').screenshot(path=str(ARTIFACTS / f'refresh-navigation-{args.browser}.png'))
            page.locator('[data-world-menu="inventory"]').click()
            check('Bag stays inventory-only and its Inner Sea destination marks upgrades', page.locator('#teams>.menu-nav').count() == 0 and page.locator('[data-frame-menu="collection"] > .upgrade-dot').count() == 1)
            page.locator('[data-frame-menu="collection"]').click()
            check('Inner Sea routes badges to attributes and companion talents', page.locator('[data-sea-tab="trainer"] > .upgrade-dot').count() == 1 and page.locator('[data-sea-tab="party"] > .upgrade-dot').count() == 1)
            current = page.evaluate('BondProfile.snapshot()')
            check('Refresh retains character, points, individuals, items and equipped weapon', all(saved[k] == current[k] for k in ['character', 'trainerXP', 'coins', 'attributes', 'growth', 'companions', 'inventory', 'equipment']))
            check('Normal save remains untouched', page.evaluate("localStorage.getItem('bond-bolt-profile-v7')==='normal-save-sentinel'"))
            headers = page.request.get(url, headers={'If-Modified-Since': 'Thu, 31 Dec 2099 23:59:59 GMT'})
            check('Entry revalidates dependencies even with a newer cached HTML date', headers.status == 200 and 'region.js?v=' in headers.text())
            script = page.request.get(f'http://127.0.0.1:{server.server_port}/region.js')
            check('Unversioned local code also stops being stored as fresh', 'no-store' in script.headers.get('cache-control', ''))
            browser.close()
    except Exception:
        errors.append(traceback.format_exc())
    finally:
        server.shutdown()
        server.server_close()
    check('No browser or harness errors', not errors)
    (ARTIFACTS / f'server-refresh-{args.browser}.json').write_text(json.dumps({'checks': checks, 'errors': errors}, indent=2), encoding='utf-8')
    print(json.dumps(errors, indent=2))
    return 0 if checks and all(c['pass'] for c in checks) and not errors else 1


if __name__ == '__main__':
    raise SystemExit(main())
