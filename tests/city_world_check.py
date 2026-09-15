"""Cartesian world, city entry and travel regressions in disposable browser saves."""
import argparse,functools,hashlib,json,threading,traceback
from PIL import Image
from datetime import datetime,timedelta,timezone
from http.server import ThreadingHTTPServer
from browser_check import ROOT,ARTIFACTS,QuietServer,find_browser,sync_playwright,legacy_adventure

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--browser',default='chrome');args=parser.parse_args()
 server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietServer,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 checks=[];errors=[]
 source={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [*ROOT.glob('*.js'),*ROOT.glob('*.css'),ROOT/'index.html']}
 def check(name,value):
  checks.append({'name':name,'pass':bool(value)})
  print(('PASS ' if value else 'FAIL ')+name,flush=True)
 packet=json.loads((ROOT/'assets/cities/prompts.json').read_text(encoding='utf-8'))
 check('All 21 reviewed frames match recorded generation sources',len(packet['frames'])==21 and all(hashlib.sha256((ROOT/'assets/cities'/name).read_bytes()).hexdigest()==value for name,value in packet['sha256'].items()))
 check('Resident perspective inputs match recorded project artwork',all(hashlib.sha256((ROOT/r['path']).read_bytes()).hexdigest()==r['sha256'] for r in packet['input_images'] if r.get('path')))
 check('Every recorded crop retains its own source pixels',all(hashlib.sha256(Image.open(ROOT/'assets/cities'/(f['kind']+'.png')).convert('RGBA').crop(f['crop_px']).tobytes()).hexdigest()==f['rgba_sha256'] for f in packet['frames']))
 check('Building and resident source sheets have genuine alpha',all(Image.open(ROOT/'assets/cities'/(kind+'.png')).mode=='RGBA' and Image.open(ROOT/'assets/cities'/(kind+'.png')).getchannel('A').getextrema()==(0,255) for kind in ['buildings','residents']))
 for f in [f for f in packet['frames'] if f['kind']=='residents']:
  alpha=Image.open(ROOT/'assets/cities/residents.png').crop(f['crop_px']).getchannel('A');w,h=alpha.size
  edges=[alpha.crop((0,0,w,1)),alpha.crop((0,h-1,w,h)),alpha.crop((0,0,1,h)),alpha.crop((w-1,0,w,h))]
  check(f['name']+' standing sprite fits its crop without cut heads, boots or neighboring pixels',all(e.getextrema()[1]<16 for e in edges))
 try:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(executable_path=find_browser(args.browser),headless=True)
   context=browser.new_context(viewport={'width':1440,'height':1000});page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   legacy_adventure(page);now=datetime.now(timezone.utc);page.clock.install(time=now);page.clock.pause_at(now+timedelta(seconds=10))
   page.goto(f'http://127.0.0.1:{server.server_port}/?test=1');page.wait_for_function('!!window.BondApp')
   check('All 36 places have unique integer grid cells and only reciprocal shared-border portals',page.evaluate('''()=>{const A=BondAtlas;return A.maps.length===36&&new Set(A.maps.map(m=>m.grid.x+','+m.grid.y)).size===36&&!A.validate().length&&A.maps.every(m=>Number.isInteger(m.grid.x)&&Number.isInteger(m.grid.y)&&m.neighbors.every(g=>{const d=A.get(g.to),dx=d.grid.x-m.grid.x,dy=d.grid.y-m.grid.y;return Math.abs(dx)+Math.abs(dy)===1&&d.neighbors.some(r=>r.to===m.id)&&g.direction===(dx===1?'east':dx===-1?'west':dy===1?'south':'north')&&(dx===1?g.x===m.width-80:dx===-1?g.x===80:dy===1?g.y===m.height-80:g.y===80);}));}'''))
   check('Cities occupy square maps and every doorway is walkable from arrival',page.evaluate("BondAtlas.maps.filter(m=>m.kind==='hub').every(m=>m.width===m.height&&m.buildings.length===3&&m.buildings.every(b=>!BondAtlas.collision(m.id,b.door)&&BondNav.find(m.id,m.entry,b.door).ok))"))
   check('Old forest-to-town shortcut is gone',page.evaluate("!BondAtlas.get('clearing-1').neighbors.some(g=>g.to==='clearing-hub')"))
   check('Firstlight gate still prevents early teleport and walking',page.evaluate("!BondProfile.teleport('brook-hub')&&!BondAtlas.unlocked(BondProfile.snapshot(),'clearing-hub')"))
   page.evaluate("()=>{const s=BondProfile.snapshot();s.journey.early.mageMet=true;s.journey.early.mageGate=true;s.coins=50;BondProfile.testing.replace(s);BondProfile.testing.grantEcho('emberfox',1);BondProfile.summon('emberfox');BondProfile.testing.grantEcho('stonehorn',1);BondProfile.summon('stonehorn');}")
   result=page.evaluate('''()=>{const P=BondProfile,A=BondAtlas,s=P.snapshot();s.vitality.trainer=2000;for(const m of s.companions)s.vitality.companions[m.id]=0;P.testing.replace(s);const g=A.get(s.map).neighbors.find(g=>g.to==='clearing-hub');P.position(g);const before=P.snapshot(),ok=P.transition(g.id),after=P.snapshot();return ok&&after.map==='clearing-hub'&&after.vitality.trainer===10000&&Object.values(after.vitality.companions).every(v=>v===10000)&&after.coins===before.coins&&JSON.stringify(after.inventory)===JSON.stringify(before.inventory)&&after.trainerXP===before.trainerXP;}''')
   check('Physical arrival revives trainer and every owned companion without costs or XP',result)
   check('City healing has no clickable sanctuary',page.evaluate("BondApp.switchTab('region');document.querySelectorAll('.map-object.sanctuary').length===0&&!BondProfile.rest()"))
   check('An old city save still needs the Forest Mage proof before teleporting',page.evaluate("()=>{const P=BondProfile,s=P.snapshot();s.journey.early.mageGate=false;P.testing.replace(s);P.position(BondAtlas.get(s.map).teleport);const blocked=!P.teleport('brook-hub');s.journey.early.mageGate=true;P.testing.replace(s);return blocked;}"))
   check('Teleport and room entry reject remote actions',page.evaluate("!BondProfile.teleport('brook-hub')&&!BondCityView.enter('clearing-hub:shop')"))
   for city in ['clearing','brook','hollow','ruins']:
    page.evaluate("id=>{BondProfile.travel(id+'-hub',{x:1200,y:1250});BondApp.switchTab('region');}",city)
    page.clock.run_for(500);page.wait_for_function("BondCityArt.ensure('buildings').ready&&BondCityArt.ensure('residents').ready")
    page.screenshot(path=str(ARTIFACTS/f'city-{city}-{args.browser}.png'))
    check(city+' has buildings, three varied citizens and no green placeholder icons',page.locator('.map-object.building').count()==3 and page.locator('.map-object.resident').count()==3 and page.locator('.map-object .landmark-art').count()==0)
    page.evaluate("id=>{const m=BondAtlas.get(id+'-hub'),b=m.buildings.find(b=>b.room==='hall');BondProfile.position({x:b.door.x,y:b.door.y+190});BondApp.switchTab('region');BondRegion.approachId(b.id);}",city)
    page.clock.run_for(1800)
    check(city+' enters its hall by walking to the door',page.locator('#city-dialog').is_visible())
    page.wait_for_function("document.querySelector('.city-room')?.dataset.cityRoomReady==='true'")
    check(city+' room keeps its overhead floor proportions',page.locator('.city-room').evaluate('e=>{const r=e.getBoundingClientRect();return Math.abs(r.width/r.height-Number(e.style.getPropertyValue("--city-room-ratio")))<.002;}'))
    page.locator('[data-city-exhibit="0"]').click();check(city+' has readable interior objects',len(page.locator('.city-room-message').inner_text())>30)
    page.screenshot(path=str(ARTIFACTS/f'city-{city}-interior-{args.browser}.png'));page.keyboard.press('Escape')
   for trainer in ['druid','mage','hunter','swordsman']:
    page.evaluate("type=>{const P=BondProfile,s=P.snapshot();s.journey.early.tidecrown=true;s.journey.early.demonstrations=Object.values(BondCampaign.DEMONSTRATIONS);P.testing.replace(s);const e=BondCampaign.earlyEncounters.find(e=>e.masterClass===type);P.travel(e.map,e);BondApp.switchTab('region');}",trainer);page.clock.run_for(300)
    page.locator('[data-object="early:master:'+trainer+'"]').click();page.clock.run_for(200)
    check(trainer+' master is directly clickable in the matching city courtyard',page.locator('#npc-dialog').is_visible() and page.evaluate('BondAtlas.get(BondProfile.snapshot().map).cityTheme')==trainer)
    page.locator('#npc-close').click()
   page.evaluate("()=>{BondProfile.travel('clearing-hub',BondAdventure.service(BondAtlas.get('clearing-hub'),'shop'));BondApp.switchTab('region');}");page.clock.run_for(500)
   # Click the painted building itself; its bounds supply the hit target.
   page.locator('[data-object="clearing-hub:shop"]').click();page.clock.run_for(400)
   check('Painted shop entrance opens its room',page.locator('#city-dialog').is_visible())
   page.locator('[data-city-supplies]').last.click();before=page.evaluate('BondProfile.snapshot().coins');quantity=page.evaluate('BondProfile.snapshot().inventory.leafdraught||0');page.locator('[data-store-buy="leafdraught"]').click()
   check('Indoor shop charges once and persists its supply',page.evaluate('BondProfile.snapshot().coins')==before-3 and page.evaluate('BondProfile.snapshot().inventory.leafdraught')==quantity+1)
   page.keyboard.press('Escape');check('Closing shop returns to the entered room',page.locator('#city-dialog').is_visible());page.keyboard.press('Escape')
   page.evaluate("()=>{const m=BondAtlas.get('clearing-hub');BondProfile.position({x:m.teleport.x-180,y:m.teleport.y});BondApp.switchTab('region');BondRegion.approachId(m.id+':waystone');}");page.clock.run_for(1400)
   check('Physical waystone offers the other three starting cities',page.locator('[data-city-teleport]').count()==3)
   page.locator('[data-city-teleport="brook-hub"]').click();page.clock.run_for(500)
   check('Waystone travels to selected city and restores the party',page.evaluate("BondProfile.snapshot().map==='brook-hub'&&BondAdventure.health(BondProfile.snapshot())===10000"))
   page.reload();page.wait_for_function('!!window.BondApp');check('Teleport arrival and shop purchase survive reload',page.evaluate("BondProfile.snapshot().map==='brook-hub'") and page.evaluate('BondProfile.snapshot().inventory.leafdraught')==quantity+1)
   check('Teleport rejects late cities, same city, fields and locked encounters without mutation',page.evaluate('''()=>{const P=BondProfile,m=BondAtlas.get('brook-hub');P.position(m.teleport);let before=P.export();if(P.teleport('ashen-hub')||P.teleport('brook-hub')||P.teleport('clearing-0')||before!==P.export())return false;const s=P.snapshot();s.encounterSave={id:'held',tick:0,encounter:{map:s.map,id:'held'}};P.testing.replace(s);before=P.export();const ok=!P.teleport('clearing-hub')&&P.export()===before;s.encounterSave=null;P.testing.replace(s);return ok;}'''))
   check('Failed critical save keeps teleport origin and all possessions',page.evaluate('''()=>{const P=BondProfile,m=BondAtlas.get(P.snapshot().map);P.position(m.teleport);const before=P.export(),native=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('quota');};let ok;try{ok=!P.teleport('clearing-hub')&&P.export()===before;}finally{Storage.prototype.setItem=native;}return ok;}'''))
   page.locator('#open-atlas').click();page.clock.run_for(200)
   check('Atlas shows 36 equal square cells and every physical edge',page.evaluate('''()=>{const A=BondAtlas,places=[...document.querySelectorAll('.atlas-place')],edges=new Set(A.maps.flatMap(m=>m.neighbors.map(g=>[m.id,g.to].sort().join('|'))));return places.length===36&&places.every(el=>{const r=el.getBoundingClientRect();return Math.abs(r.width-r.height)<1;})&&document.querySelectorAll('[data-atlas-road]').length===edges.size;}'''))
   page.set_viewport_size({'width':1440,'height':1400});page.screenshot(path=str(ARTIFACTS/f'city-grid-{args.browser}.png'));page.set_viewport_size({'width':1440,'height':1000});page.keyboard.press('Escape')
   page.set_viewport_size({'width':390,'height':844});page.evaluate("()=>{const m=BondAtlas.get('brook-hub');BondProfile.position(m.buildings[0].door);BondApp.switchTab('region');BondCityView.enter(m.buildings[0].id);}");page.clock.run_for(200)
   check('Mobile room fits the viewport and closes with Escape',page.locator('#city-dialog').evaluate('e=>e.getBoundingClientRect().width<=innerWidth'))
   page.wait_for_function("document.querySelector('.city-room')?.dataset.cityRoomReady==='true'")
   check('Phone layout preserves the same room proportions',page.locator('.city-room').evaluate('e=>{const r=e.getBoundingClientRect();return Math.abs(r.width/r.height-Number(e.style.getPropertyValue("--city-room-ratio")))<.002;}'))
   page.screenshot(path=str(ARTIFACTS/f'city-mobile-{args.browser}.png'));page.keyboard.press('Escape');check('Leaving restores world controls',not page.locator('#city-dialog').is_visible())
   check('All 17 isolated sprites preserve native transparent bounds',page.evaluate("[['residents',9],['buildings',8]].every(([kind,count])=>{const fs=BondCityArt.ensure(kind).frames;return fs.length===count&&new Set(fs.map(f=>f.url)).size===count&&fs.every(f=>f.transparent>.15&&f.transparent<.85);})"))
   check('Runtime uses every measured crop without stretching its source',page.evaluate("frames=>frames.every(f=>{const actual=BondCityArt.ensure(f.kind).frames[f.index],b=f.crop_px;return actual.width===b[2]-b[0]&&actual.height===b[3]-b[1];})",packet['frames']))
   check('No browser runtime errors',not errors);browser.close()
 except Exception:
  errors.append(traceback.format_exc());print(errors[-1],flush=True)
 finally:server.shutdown()
 report={'checks':checks,'errors':errors,'source_sha256':source,'asset_sha256':packet['sha256']};(ARTIFACTS/f'city-world-{args.browser}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
 if not errors and all(c['pass'] for c in checks):
  cards=''.join('<section><h2>'+name+'</h2><div><img src="city-'+city+'-'+args.browser+'.png" alt="'+name+' streets"><img src="city-'+city+'-interior-'+args.browser+'.png" alt="'+name+' interior"></div></section>' for city,name in [('clearing','Mosslight · Druid grove'),('brook','Willowbrook · Mage academy'),('hollow','Amber Crossing · Hunters’ lodge'),('ruins','Moonwell · Knight kingdom')])
  sheets=''.join('<section class="grid"><h2>'+label+'</h2><a href="../../assets/cities/'+kind+'.png"><img src="../../assets/cities/'+kind+'.png" alt="'+label+'"></a></section>' for kind,label in [('buildings','All eight overhead buildings'),('residents','All nine standing right-facing residents'),('interiors','All four overhead rooms')])
  gallery='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Square world and cities · Owner review</title><style>body{margin:0 auto;padding:32px;max-width:1500px;background:#152d2a;color:#f5e8c8;font:16px/1.6 system-ui}h1,h2{font-family:Georgia,serif}a{color:#e8c988}img{display:block;width:100%;border-radius:10px}section{margin:40px 0}section div{display:grid;grid-template-columns:1fr 1fr;gap:20px}.grid{max-width:1000px;margin:auto}@media(max-width:750px){body{padding:16px}section div{grid-template-columns:1fr}}</style><h1>Square world and starting cities</h1><p>Review scope: city-perspective-v3 · '+str(len(checks))+' city checks passed in '+args.browser+'.</p><p>Review overhead scenery, upright NPCs matching the class perspective, complete silhouettes, readable doors and matching interior objects. NPC references come from this project; scenery used text-only briefs. Provenance and local duplicate checks do not establish worldwide uniqueness. Screenshots use a disposable QA save. Technical checks do not approve final art or pacing.</p><p><a href="../../?test=1">Open isolated game</a> · <a href="../../features/world/CITIES.md">Behavior and review guide</a> · <a href="../../assets/cities/prompts.json">Generated artwork prompts and hashes</a></p>'+sheets+'<section class="grid"><h2>36 squares · Cardinal border portals</h2><img src="city-grid-'+args.browser+'.png" alt="Cartesian world atlas"></section>'+cards+'<section class="grid"><h2>Phone layout</h2><img style="max-width:390px" src="city-mobile-'+args.browser+'.png" alt="Mage library on a phone"></section></html>'
  (ARTIFACTS/'city-review.html').write_text(gallery,encoding='utf-8')
 return 1 if errors or any(not c['pass'] for c in checks) else 0
if __name__=='__main__':raise SystemExit(main())
