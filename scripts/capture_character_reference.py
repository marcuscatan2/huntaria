"""Capture a transparent character reference from the live shared renderer."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tests"))

from browser_check import find_browser, sync_playwright  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:8765/?test=1")
    parser.add_argument("--browser", default="chrome")
    parser.add_argument("--output", type=Path, default=ROOT / "tests" / "artifacts" / "apprentice-reference.png")
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=find_browser(args.browser), headless=True)
        page = browser.new_page(viewport={"width": 360, "height": 360}, device_scale_factor=2)
        page.goto(args.url)
        page.wait_for_function("!!window.BondApprenticePreview && !!window.BondOpening")
        page.evaluate("""async()=>{
            document.documentElement.style.background='transparent';
            document.body.style.cssText='margin:20px;background:transparent;overflow:hidden';
            document.body.innerHTML='<div id="character-reference"></div>';
            const host=document.querySelector('#character-reference');
            host.style.cssText='width:320px;height:320px;background:transparent';
            host.innerHTML=BondApprenticePreview.markup(BondOpening.defaultLook,'dagger');
            const sprite=host.firstElementChild;
            sprite.style.cssText='display:block;width:320px;height:320px;background:transparent';
            await BondApprenticePreview.paintCanvas(sprite,BondOpening.defaultLook,'dagger');
        }""")
        page.locator("#character-reference").screenshot(path=str(args.output), omit_background=True)
        browser.close()
    print(args.output.resolve())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
