"""Follow point badges through the real menus using disposable browser saves."""
import argparse, functools, json, threading, traceback
from http.server import ThreadingHTTPServer
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, legacy_adventure, sync_playwright

parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome',choices=['chrome','edge']);args=parser.parse_args()
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];errors=[]
def check(name,value):
    checks.append({'name':name,'pass':bool(value)});print(('PASS ' if value else 'FAIL ')+name,flush=True)

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
    page=browser.new_page(viewport={'width':390,'height':844});legacy_adventure(page)
    page.add_init_script("localStorage.setItem('bond-bolt-profile-v7','normal-save-sentinel')")
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/?test=1');page.wait_for_function('!!window.BondApp')
        page.evaluate("""()=>{window.upgradeFixture=(level=60)=>{const P=BondProfile,G=BondGrowth,R=BondProgress,s=P.fresh();
          s.character={name:'Menu tester',weapon:'dagger'};s.progression.specialization='mage';s.trainerXP=R.threshold(level);
          s.journey.early.introFightWon=true;s.journey.early.mageGate=true;s.journey.early.tidecrown=true;s.journey.relic={stage:'complete'};
          s.attributes=R.cleanAttributes(Object.fromEntries(R.ATTRS.map(k=>[k,99])),level);
          let left=R.statBudget(level)-R.spent(s.attributes);for(const k of R.ATTRS)while(s.attributes[k]<99&&left>=R.cost(s.attributes[k])){left-=R.cost(s.attributes[k]);s.attributes[k]++;}
          s.growth.mage=G.clean('mage',Object.fromEntries(G.nodes('mage').map(n=>[n.id,n.max])),G.budget(s,'mage'));return s;};BondProfile.testing.replace(upgradeFixture());BondApp.switchTab('region');}""")
        dot=lambda selector:page.locator(selector+' > .upgrade-dot').count()>0
        check('No upgrade badges when every spendable point is used',not dot('[data-world-menu="inventory"]') and not dot('[data-world-menu="collection"]'))
        check('A new uncreated profile has no upgrade route',page.evaluate('!BondUpgradeNotices.read(BondProfile.fresh()).any'))
        check('An Apprentice does not advertise a locked class tree',page.evaluate("()=>{const s=upgradeFixture();s.progression.specialization=null;s.character.legacy=false;return !BondUpgradeNotices.read(s).trainer.available;}"))
        page.evaluate('BondProfile.testing.replace(upgradeFixture(58))')
        check('A fully allocated trainer has no badge before leveling',not dot('[data-world-menu="inventory"]'))
        page.evaluate('BondProfile.testing.setTrainerXP(BondProgress.threshold(59))')
        check('Trainer level-up immediately reveals new attribute and class points',dot('[data-world-menu="inventory"]') and page.evaluate('()=>{const n=BondUpgradeNotices.read(BondProfile.snapshot());return n.stats.size>0&&n.trainer.available;}'))
        page.evaluate("""()=>{const s=upgradeFixture(),G=BondGrowth,type='acornboar';s.companions=[{id:'level-up',type,xp:BondProgress.threshold(4),skills:BondContent.UNITS[type].default,growth:{}}];s.companions[0].growth=G.clean(type,Object.fromEntries(G.nodes(type).map(n=>[n.id,1])),G.budget(s,'level-up'));BondProfile.testing.replace(s);}""")
        check('A fully allocated companion has no badge before leveling',not dot('[data-world-menu="inventory"]'))
        page.evaluate("BondProfile.testing.setXP('level-up',BondProgress.threshold(5))")
        check('Companion level-up immediately reveals its new talent point',dot('[data-world-menu="collection"]') and page.evaluate("BondUpgradeNotices.read(BondProfile.snapshot()).companions.get('level-up').available"))
        # Give exactly the cost of one attribute upgrade by undoing a legal rank.
        stat=page.evaluate("""()=>{const s=upgradeFixture(),k=BondProgress.ATTRS.find(k=>s.attributes[k]>1);s.attributes[k]--;BondProfile.testing.replace(s);return k;}""")
        check('Unspent attributes mark both bottom-menu entry routes',dot('[data-world-menu="inventory"]') and dot('[data-world-menu="collection"]'))
        page.locator('[data-world-menu="inventory"]').click()
        check('Bag leads to the Inner Sea tab, not an unrelated inventory category',dot('.menu-nav [data-menu="collection"]') and not dot('.menu-nav [data-menu="inventory"]'))
        page.locator('.menu-nav [data-menu="collection"]').click()
        check('Inner Sea marks Attributes',dot('[data-collection-mode="trainer"]'))
        page.locator('[data-collection-mode="trainer"]').click()
        check('Affordable stat upgrades carry the final badge',dot('[data-stat="'+stat+'"]') and page.locator('[data-stat]:disabled.has-upgrade').count()==0)
        check('Phone attribute points sit below the level label',page.locator('#attribute-points').evaluate('(e)=>e.getBoundingClientRect().top>=e.previousElementSibling.getBoundingClientRect().bottom'))
        page.locator('#panel-loadout').screenshot(path=str(ARTIFACTS/f'upgrade-attributes-{args.browser}.png'))
        page.locator('[data-stat="'+stat+'"]').click()
        check('Spending the last affordable points clears the entire route',not dot('[data-frame-menu="inventory"]') and not dot('[data-collection-mode="trainer"]') and page.locator('[data-stat].has-upgrade').count()==0)
        # Refund the final learned node without invalidating its prerequisites.
        target=page.evaluate("""()=>{const s=upgradeFixture(),id=Object.keys(s.growth.mage).at(-1);delete s.growth.mage[id];BondProfile.testing.replace(s);return id;}""")
        check('Class points light Bag and the class tab without lighting Inner Sea',dot('[data-frame-menu="inventory"]') and dot('.menu-nav [data-menu="trees"]') and not dot('[data-frame-menu="collection"]'))
        page.locator('.menu-nav [data-menu="trees"]').click()
        branch=page.evaluate('id=>Math.floor(BondGrowth.nodes("mage").findIndex(n=>n.id===id)/5)',target)
        check('Class branch has a badge leading toward an available node',dot('[data-talent-branch="'+str(branch)+'"]'))
        page.locator('[data-talent-branch="'+str(branch)+'"]').click()
        check('Only purchasable nodes have badges',dot('[data-talent-node="'+target+'"]') and page.locator('.talent-node.locked.has-upgrade,.talent-node.mastered.has-upgrade').count()==0)
        page.locator('[data-talent-node="'+target+'"]').click()
        check('Description marks its enabled Learn control',dot('.talent-dialog [data-talent-learn]'))
        page.locator('#panel-loadout').screenshot(path=str(ARTIFACTS/f'upgrade-class-{args.browser}.png'))
        while not page.locator('.talent-dialog [data-talent-learn]').is_disabled():page.locator('.talent-dialog [data-talent-learn]').click()
        page.keyboard.press('Escape')
        check('Class spending clears the class route',not dot('[data-frame-menu="inventory"]') and not dot('.menu-nav [data-menu="trees"]'))
        # A same-species individual on page two is the only companion with points.
        page.evaluate("""()=>{const s=upgradeFixture(),type='acornboar',G=BondGrowth;s.companions=Array.from({length:21},(_,i)=>({id:'notice:'+i,type,xp:BondProgress.threshold(60),skills:BondContent.UNITS[type].default,growth:G.clean(type,Object.fromEntries(G.nodes(type).map(n=>[n.id,1])),15)}));delete s.companions[20].growth[Object.keys(s.companions[20].growth).at(-1)];BondProfile.testing.replace(s);BondApp.switchTab('region');}""")
        page.locator('[data-world-menu="inventory"]').click();page.locator('.menu-nav [data-menu="collection"]').click()
        check('Companion point routes mark My companions without unrelated Attributes',dot('[data-collection-mode="companions"]') and not dot('[data-collection-mode="trainer"]'))
        page.locator('[data-collection-mode="companions"]').click()
        check('Next page points to an off-screen companion without flagging its spent copies',dot('[data-page="1"]') and page.locator('[data-instance].has-upgrade').count()==0)
        page.locator('[data-page="1"]').click()
        check('Only the individual with remaining points is marked',dot('[data-instance="notice:20"]'))
        page.locator('[data-instance="notice:20"]').click()
        check('Selected companion details lead to its Mastery tree',dot('[data-open-tree="notice:20"]'))
        page.locator('[data-open-tree="notice:20"]').click()
        check('The tree uses the selected individual budget, not its species or first copy',page.locator('.talent-screen').get_attribute('data-talent-ref')=='notice:20' and page.locator('.talent-node.has-upgrade').count()>0)
        branch=page.locator('[data-talent-branch].has-upgrade').first.get_attribute('data-talent-branch');page.locator('[data-talent-branch="'+branch+'"]').click()
        page.locator('.class-talent-branch.current .talent-node.has-upgrade').first.click();page.locator('.talent-dialog [data-talent-learn]').click();page.keyboard.press('Escape')
        check('Companion purchase clears the last badge everywhere',not dot('[data-frame-menu="inventory"]') and not dot('[data-frame-menu="collection"]'))
        saved=page.evaluate('BondProfile.export()');page.reload();page.wait_for_function('!!window.BondApp')
        # Boot increments the profile revision; allocations and earned XP must survive.
        before=json.loads(saved);after=json.loads(page.evaluate('BondProfile.export()'))
        check('Reload derives the cleared state from saved allocations',not dot('[data-world-menu="inventory"]') and all(before[k]==after[k] for k in ['attributes','growth','companions','trainerXP','journey']))
        page.evaluate("BondApp.switchTab('loadout');BondTree.select('notice:20')");page.locator('[data-respec]').click()
        check('A free reset immediately restores the individual point route',dot('[data-frame-menu="inventory"]') and page.locator('.talent-node.has-upgrade').count()>0)
        # Repaint, navigation and inspection are read-only.
        saved=page.evaluate('BondProfile.export()');page.evaluate('BondUpgradeNotices.refresh();BondUpgradeNotices.refresh()')
        check('Refreshing badges never writes progress or duplicates dots',page.evaluate('BondProfile.export()')==saved and page.evaluate('Array.from(document.querySelectorAll(".has-upgrade")).every(e=>e.querySelectorAll(":scope > .upgrade-dot").length===1)'))
        check('All three shared vector icons decode',page.evaluate("async()=>{const paths=['bag','inner-sea','explore'];return (await Promise.all(paths.map(async name=>{const i=new Image();i.src='assets/interface/'+name+'.svg';await i.decode();return i.naturalWidth>0;}))).every(Boolean);}"))
        for width in [320,390,768,1440]:
            page.set_viewport_size({'width':width,'height':844 if width<1000 else 1000});page.evaluate("BondApp.switchTab('region')")
            check(f'Exploration icons and badges fit {width}px',page.locator('#world-action-menu .destination-icon').count()==3 and page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
            check(f'World messages stay above the larger icons at {width}px',page.evaluate("()=>{const e=document.querySelector('#world-status'),saved=e.textContent;e.textContent='Cache collected';const fits=e.getBoundingClientRect().bottom+4<=document.querySelector('#world-action-menu').getBoundingClientRect().top;e.textContent=saved;return fits;}"))
            if width==390:page.locator('#world-action-menu').screenshot(path=str(ARTIFACTS/'upgrade-navigation-phone.png'))
            page.locator('[data-world-menu="inventory"]').click()
            check(f'Menu icons and badges fit {width}px',page.locator('.frame-destinations .destination-icon').count()==3 and page.evaluate('document.documentElement.scrollWidth<=innerWidth+1') and page.locator('.frame-destinations button').evaluate_all('(nodes)=>nodes.every(e=>e.getBoundingClientRect().height>=43)'))
            if width==390:page.locator('#panel-loadout').screenshot(path=str(ARTIFACTS/'upgrade-bag-phone.png'))
        check('Normal save remains untouched',page.evaluate("localStorage.getItem('bond-bolt-profile-v7')==='normal-save-sentinel'"))
    except Exception:errors.append(traceback.format_exc())
    check('No browser or harness errors',not errors);browser.close()
server.shutdown()
(ARTIFACTS/f'menu-upgrades-{args.browser}.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2),encoding='utf-8')
print(json.dumps(errors,indent=2));raise SystemExit(0 if checks and all(c['pass'] for c in checks) and not errors else 1)
