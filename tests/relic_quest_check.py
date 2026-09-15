"""Class rescue, persistent relic quest, tower travel and played dialogue."""
import argparse, functools, json, threading, traceback
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT, ARTIFACTS, QuietServer, find_browser, sync_playwright, legacy_adventure


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--browser', default='chrome')
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietServer, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    checks, errors = [], []

    def check(name, value, detail=None):
        checks.append({'name': name, 'pass': bool(value), 'detail': detail})
        print(('PASS ' if value else 'FAIL ') + name, flush=True)

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=find_browser(args.browser), headless=True)
            page = browser.new_page(viewport={'width': 1440, 'height': 1000})
            page.on('pageerror', lambda error: errors.append(str(error)))
            legacy_adventure(page)
            now = datetime.now(timezone.utc)
            page.clock.install(time=now)
            page.clock.pause_at(now + timedelta(seconds=1))
            page.goto(f'http://127.0.0.1:{server.server_port}/?test=1')
            page.wait_for_function('!!window.BondApp')
            check('Tully stays silent before class choice and never opens a battle preview', page.evaluate("BondRelicQuest.dialogue(BondProfile.snapshot(),BondRelicQuest.TULLY,[]).action===null&&!!BondCampaign.requirement(BondRelicQuest.tully,BondProfile.snapshot())"))
            check('World and campaign validate with 36 atlas cells and four tower interiors', page.evaluate("!BondAtlas.validate().length&&!BondCampaign.validate().length&&BondAtlas.maps.filter(m=>!m.interior).length===36&&BondAtlas.maps.filter(m=>m.interior).length===4"))
            check('Tower walls block shortcuts and every stair, habitat and memorial remains reachable',page.evaluate("""()=>BondAtlas.maps.filter(m=>m.interior).every(m=>m.towerWalls.length>=4&&m.towerWalls.every(w=>BondAtlas.collision(m.id,{x:(w.a.x+w.b.x)/2,y:(w.a.y+w.b.y)/2}))&&[...m.neighbors,...m.habitats,{x:1800,y:780}].every(p=>BondNav.find(m.id,m.entry,p).ok)&&m.neighbors.every(g=>g.kind==='stairs'))"""))
            check('Selected ghosts move exclusively to the cemetery and tower, retaining their primary spawn IDs', page.evaluate("""()=>BondGhostTower.species.every(type=>{
              const homes=BondAtlas.maps.flatMap(m=>m.habitats).filter(h=>h.type===type);
              return homes.length&&homes.every(h=>h.map==='hollow-2'||BondAtlas.get(h.map).interior)&&new Set(homes.map(h=>h.id)).size===homes.length;
            })&&BondAtlas.home('ochrewisp').id==='hollow-1:ochrewisp'"""))
            results = page.evaluate("""()=>{
              const out=[];for(const type of BondContent.CLASSES)for(const level of [20,25,30,60])for(const seed of [1,2,17,999]){
                const s=BondProfile.snapshot();s.trainerXP=BondProgress.threshold(level);s.progression.specialization=type;
                s.companions=['emberfox','stonehorn'].map((type,i)=>({id:'test:'+i,type,ordinal:1,xp:BondProgress.threshold(level),growth:{},skills:[...BondContent.UNITS[type].default]}));
                const team=[{type,skills:[...BondContent.UNITS[type].default]},...s.companions.map(m=>({type:m.type,instanceId:m.id,skills:m.skills}))],build=[team,BondGame.defaultBuild()[1]],e=BondWorld.NPCS['relic:raid:'+type];
                const options={encounter:e,profile:s,seed,enemyLevel:60},b=new BondGame.Battle(build,options);b.run();const replay=new BondGame.Battle(build,options).run();
                out.push({type,level,seed,time:b.time,ok:b.winner===0&&b.units.filter(u=>u.side===0&&!u.storyMaster).every(u=>u.hp===0)&&b.units.find(u=>u.storyMaster).hp>=b.units.find(u=>u.storyMaster).maxHp*.39&&b.units.find(u=>u.storyMaster).level===100&&b.units.filter(u=>u.side===1).length===3&&b.units.filter(u=>u.side===1).every(u=>u.level===60)&&JSON.stringify(b.events)===JSON.stringify(replay.events)});
              }return out;
            }""")
            check('Every class survives through its Lv100 master; player and companions fall; 64 seeded replays match', all(r['ok'] and r['time'] <= 14 for r in results), [r for r in results if not r['ok']])
            page.evaluate("""()=>{
              const s=BondProfile.snapshot();s.character={name:'Relic Tester',weapon:'dagger',legacy:false};s.trainerXP=BondProgress.threshold(20);s.journey.early={...s.journey.early,firstSummon:true,secondSummon:true,introFightWon:true,mageMet:true,mageGate:true,tidecrown:true,demonstrations:Object.values(BondCampaign.DEMONSTRATIONS),trials:{druid:false,mage:true,hunter:false,swordsman:false}};
              s.journey.wins=Object.fromEntries(Object.keys(BondCampaign.DEMONSTRATIONS).map(id=>[id,1]));s.progression.specialization=null;s.companions=['emberfox','stonehorn'].map((type,i)=>({id:'story:'+i,type,ordinal:1,xp:BondProgress.threshold(20),growth:{},skills:[...BondContent.UNITS[type].default]}));
              BondProfile.testing.replace(s);BondApp.changeUnit(0,1,'story:0');BondApp.changeUnit(0,2,'story:1');const m=BondWorld.NPCS['early:master:mage'];BondProfile.travel(m.map,{x:m.x,y:m.y+100});BondApp.switchTab('region');
            }""")
            page.clock.run_for(100)
            check('Tidecrown completion presents four illustrated class destinations',page.evaluate("document.querySelector('#class-choice-dialog').open&&document.querySelectorAll('[data-class-map]').length===4&&document.querySelectorAll('.class-choice-art .character-sprite').length===4&&document.querySelectorAll('.class-directions li').length===4"))
            page.set_viewport_size({'width':393,'height':852})
            page.clock.run_for(100)
            bounded="""selector=>{const d=document.querySelector(selector),r=d.getBoundingClientRect(),f=document.querySelector('#game-frame').getBoundingClientRect();return r.left>=Math.max(0,f.left)&&r.right<=Math.min(innerWidth,f.right)&&r.top>=Math.max(0,f.top)&&r.bottom<=Math.min(innerHeight,f.bottom)&&d.scrollWidth<=d.clientWidth;}"""
            check('Four class choices fit inside the phone game frame',page.evaluate(bounded,'#class-choice-dialog'))
            page.screenshot(path=str(ARTIFACTS / f'class-choice-phone-{args.browser}.png'))
            page.locator('#class-choice-close').click()
            page.evaluate("""()=>{window.beforeKnight=BondProfile.snapshot();const m=BondWorld.NPCS['early:master:swordsman'];BondProfile.travel(m.map,{x:m.x,y:m.y+100});BondApp.switchTab('region');}""")
            page.clock.run_for(100)
            page.locator('[data-object="early:master:swordsman"]').click()
            check('Knight asks explicitly for the chosen class without advice or rewards',page.locator('#npc-fight').inner_text()=='Yes, I want to be a knight' and page.evaluate("!document.querySelector('#npc-advice')&&!document.querySelector('#npc-reward')"))
            check('NPC conversation fits the phone frame',page.evaluate(bounded,'#npc-dialog'))
            page.locator('#npc-fight').click()
            check('Class acceptance explains the test and waits for Ok',page.locator('#npc-fight').inner_text()=='Ok' and page.evaluate("!BondApp.isRunning()&&document.querySelector('#npc-dialogue').textContent.includes('Defeat me')"))
            page.screenshot(path=str(ARTIFACTS / f'knight-dialogue-phone-{args.browser}.png'))
            page.locator('#npc-fight').click()
            check('Ok starts the knight test',page.evaluate("BondApp.isRunning()&&BondProfile.snapshot().encounterSave.id==='early:master:swordsman'"))
            page.evaluate("BondApp.cancelRegionBattle();BondProfile.testing.replace(beforeKnight);BondApp.switchTab('region')")
            page.clock.run_for(100)
            page.locator('[data-object="early:master:mage"]').click()
            page.on('dialog', lambda d: d.accept())
            page.locator('#npc-transform').click()
            page.locator('#npc-transform').click()
            page.clock.run_for(1200)
            check('Ascension shows the alarm conversation before starting combat',page.evaluate("!BondApp.isRunning()&&document.querySelector('#relic-dialog').open&&document.querySelector('.relic-line').textContent.includes('Monsters attacking!?')"))
            check('Raid conversation fits inside the phone frame',page.evaluate(bounded,'#relic-dialog'))
            page.locator('#relic-next').click()
            page.locator('#relic-next').click()
            check('Accepting the alarm conversation starts the rescue battle', page.evaluate("BondApp.getBattle()?.rescue&&BondApp.isRunning()&&BondProfile.snapshot().encounterSave?.id==='relic:raid:mage'"))
            page.locator('#pause').click()
            page.screenshot(path=str(ARTIFACTS / f'relic-raid-{args.browser}.png'))
            check('The authored rescue cannot be escaped and exposes the master at Lv100', page.evaluate("document.querySelector('#run-battle').disabled&&!BondApp.runFromBattle()&&BondApp.getBattle().units.find(u=>u.storyMaster).level===100"))
            replay = page.evaluate("""()=>{const b=BondApp.getBattle();for(let i=0;i<180;i++)b.step();BondProfile.checkpoint(b);const c=BondProfile.restoreBattle('relic:raid:mage');return {ok:JSON.stringify(b.events)===JSON.stringify(c.events)&&b.units.every((u,i)=>u.hp===c.units[i].hp),attempt:b._attemptId};}""")
            check('Checkpoint/replay preserves the master and fallen party exactly', replay['ok'])
            page.reload()
            page.wait_for_function('!!window.BondApp')
            page.evaluate("BondApp.startRegionBattle('relic:raid:mage')")
            check('Reload resumes the same saved attempt', page.evaluate('BondApp.getBattle()._attemptId') == replay['attempt'])
            page.evaluate('()=>{BondApp.getBattle().run();BondApp.renderBattle();BondApp.finish();}')
            check('Victory restores the party, advances once and opens the master conversation', page.evaluate("BondProfile.snapshot().journey.relic.stage==='aftermath'&&BondProfile.snapshot().vitality.trainer===10000&&!BondProfile.snapshot().encounterSave&&document.querySelector('#relic-dialog').open"))
            check('A completed rescue and another class master cannot be replayed for quest progress', page.evaluate("!!BondProfile.requirement('relic:raid:mage',BondApp.getBuild()[0])&&!!BondProfile.requirement('relic:raid:druid',BondApp.getBuild()[0])"))

            def finish_dialogue():
                for _ in range(12):
                    button = page.locator('#relic-next')
                    if not button.is_visible():
                        return
                    button.click()
                raise AssertionError('Dialogue did not terminate')

            finish_dialogue()
            check('Accepting the hunt list sets a destination-specific tracker', page.evaluate("BondProfile.snapshot().journey.relic.stage==='hunt'&&BondCampaign.next(BondProfile.snapshot()).label.startsWith('Hunt for Bellowsnout in Amber Heath')"))
            check('A quest hunt guarantees only its outstanding ordinary Echoes', page.evaluate("""()=>{const s=BondProfile.snapshot(),h=BondRelicQuest.HUNTS[0];const before=BondRelicQuest.forceEcho(s,h.type,h.map);s.echoes[h.type]=[{id:'a'},{id:'b'}];return before&&!BondRelicQuest.forceEcho(s,h.type,h.map)&&!BondRelicQuest.forceEcho(s,'emberfox','clearing-0');}"""))
            page.evaluate("()=>{for(const h of BondRelicQuest.HUNTS)for(let i=0;i<h.count;i++)BondProfile.testing.grantEcho(h.type,24);}")
            check('Echo delivery fails atomically when storage fails', page.evaluate("""()=>{
              const before=JSON.stringify(BondProfile.snapshot()),save=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota')};
              const result=BondProfile.relicAction('early:master:mage','deliver',BondApp.getBuild()[0]);Storage.prototype.setItem=save;
              return result===false&&JSON.stringify(BondProfile.snapshot())===before;
            }"""))
            page.evaluate("BondRelicView.open('early:master:mage')")
            page.locator('#relic-next').click()
            check('Delivery consumes exact Echo records and inventory counts', page.evaluate("BondProfile.snapshot().journey.relic.stage==='briefing'&&BondRelicQuest.HUNTS.every(h=>!BondProfile.snapshot().echoes[h.type].length&&!BondProfile.snapshot().inventory[BondEchoes.key(h.type)])"))
            seen=[]
            for _ in range(6):
                seen.append(page.locator('.relic-line').inner_text())
                page.locator('#relic-next').click()
            check('The dead-hero exchange leads to the named Casketot quest', any('How will I ask a dead person' in line for line in seen) and page.evaluate("BondProfile.snapshot().journey.relic.stage==='ghost'"))
            page.evaluate("()=>{BondProfile.testing.grantEcho('ochrewisp',22);BondProfile.summon('ochrewisp');const t=BondRelicQuest.tully;BondProfile.travel(t.map,{x:t.x,y:t.y+100});BondApp.switchTab('region');}")
            page.clock.run_for(100)
            check('Owned Casketot outside the active party cannot unlock Tully', page.evaluate("""()=>{const s=BondProfile.snapshot(),party=[BondApp.getBuild()[0][0],null,null];return s.companions.some(m=>m.type==='ochrewisp')&&!BondRelicQuest.hasGhost(s,party)&&!BondProfile.relicAction(BondRelicQuest.TULLY,'hear-tully',party)&&s.journey.relic.stage==='ghost';}"""))
            page.evaluate("()=>{const ghost=BondProfile.snapshot().companions.find(m=>m.type==='ochrewisp');BondApp.changeUnit(0,1,ghost.id);}")
            page.locator('[data-object="relic:tully"]').click()
            page.screenshot(path=str(ARTIFACTS / f'relic-tully-{args.browser}.png'))
            finish_dialogue()
            check('Active Casketot lets Tully reveal the hatch and sets the return objective', page.evaluate("BondProfile.snapshot().journey.relic.stage==='report'&&BondCampaign.next(BondProfile.snapshot()).map==='brook-hub'"))
            page.evaluate("()=>{const m=BondWorld.NPCS['early:master:mage'];BondProfile.travel(m.map,{x:m.x,y:m.y+100});BondApp.switchTab('region');BondRelicView.open(m.id);}")
            check('A failed weapon save retains the report stage and grants nothing', page.evaluate("""()=>{
              const before=JSON.stringify(BondProfile.snapshot()),save=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota')};
              const result=BondProfile.relicAction('early:master:mage','claim-weapon',BondApp.getBuild()[0]);Storage.prototype.setItem=save;
              return result===false&&JSON.stringify(BondProfile.snapshot())===before;
            }"""))
            finish_dialogue()
            check('Master gives one class weapon and ends the main quest', page.evaluate("BondProfile.snapshot().inventory['weapon:class:mage']===1&&BondCampaign.next(BondProfile.snapshot()).complete&&document.querySelector('#relic-done')"))
            check('Repeated reward commands cannot duplicate the weapon', page.evaluate("!BondProfile.relicAction('early:master:mage','claim-weapon',BondApp.getBuild()[0])&&BondProfile.snapshot().inventory['weapon:class:mage']===1"))
            page.locator('#relic-done').click()
            page.reload()
            page.wait_for_function('!!window.BondApp')
            check('Completed quest and inventory weapon survive reload', page.evaluate("BondProfile.snapshot().journey.relic.stage==='complete'&&BondProfile.snapshot().inventory['weapon:class:mage']===1"))
            check('Every class receives its own once-only inventory weapon', page.evaluate("""()=>BondContent.CLASSES.every(type=>{
              const s=BondProfile.snapshot(),m=BondWorld.NPCS['early:master:'+type];s.progression.specialization=type;s.journey.relic={stage:'report'};s.inventory={};s.map=m.map;s.position={x:m.x,y:m.y};
              const r=BondRelicQuest.command(s,m.id,'claim-weapon',[]);return r?.item==='weapon:class:'+type&&s.inventory[r.item]===1&&!BondRelicQuest.command(s,m.id,'claim-weapon',[])&&BondRelicQuest.next(s).complete;
            })"""))
            tower = page.evaluate("""()=>{
              const out=[];for(const m of BondAtlas.maps.filter(m=>m.interior||m.cemetery)){
                const all=BondProfile.population(m.id);out.push({map:m.id,population:all.filter(x=>x.present).length,quota:BondPopulation.total(m),gates:m.neighbors.every(g=>!BondAtlas.collision(m.id,g)&&!BondAtlas.collision(g.to,g.arrival)&&BondNav.find(m.id,m.entry,g).ok)});
              }return out;
            }""")
            check('Every floor fills its quota and both stair directions are reachable', all(t['population']==t['quota'] and t['gates'] for t in tower), tower)
            check('Ghost levels fit the authored tower progression', page.evaluate("""()=>{
              const expected={'hollow-2':{ochrewisp:22},'ghost-tower-1':{ashporcupine:24,ochrewisp:23},'ghost-tower-2':{thistlehare:26,ochrewisp:25},'ghost-tower-3':{echochime:28,ashporcupine:27},'ghost-tower-4':{ochrewisp:28,ashporcupine:29}};
              return Object.entries(expected).every(([map,types])=>Object.entries(types).every(([type,level])=>BondAtlas.get(map).habitats.some(h=>h.type===type&&h.level===level)));
            }"""))
            for origin, destination in [('hollow-2','ghost-tower-1'),('ghost-tower-1','ghost-tower-2'),('ghost-tower-2','ghost-tower-3'),('ghost-tower-3','ghost-tower-4'),('ghost-tower-4','ghost-tower-3')]:
                page.evaluate("""([from,to])=>{const g=BondAtlas.get(from).neighbors.find(g=>g.to===to);BondProfile.travel(from,{x:g.x+90,y:g.y});BondApp.switchTab('region');}""", [origin,destination])
                page.clock.run_for(100)
                page.locator('[data-object="'+origin+'>'+destination+'"]').click()
                page.clock.run_for(100)
                check('Physical stair '+origin+' -> '+destination, page.evaluate('BondProfile.snapshot().map')==destination)
            page.evaluate("()=>{BondProfile.travel('ghost-tower-4');BondApp.switchTab('region');}")
            page.clock.run_for(100)
            page.locator('#open-atlas').click()
            check('Atlas opens from interior floors without overlapping extra world cells', page.locator('[data-atlas-select]').count()==36)
            page.keyboard.press('Escape')
            page.set_viewport_size({'width':390,'height':844})
            page.evaluate("()=>{const t=BondRelicQuest.tully;BondProfile.travel(t.map,{x:t.x,y:t.y+100});BondApp.switchTab('region');BondRelicView.open(t.id);}")
            page.clock.run_for(100)
            check('Phone dialogue fits the game viewport with usable controls', page.evaluate("()=>{const d=document.querySelector('#relic-dialog'),r=d.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height<=innerHeight&&d.querySelector('button').getBoundingClientRect().height>=32;}"))
            check('No browser errors throughout the played quest', not errors, errors)
            browser.close()
    except Exception:
        check('Quest browser flow completed', False, traceback.format_exc())
        traceback.print_exc()
    finally:
        server.shutdown()
    (ARTIFACTS / f'relic-quest-{args.browser}.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2),encoding='utf-8')
    return 0 if checks and all(c['pass'] for c in checks) else 1


if __name__=='__main__':
    raise SystemExit(main())
