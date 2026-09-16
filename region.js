/* Spatial exploration: local simulation, persistent spawn lives, physical gates. */
(function(){
'use strict';
const $=s=>document.querySelector(s),P=BondProfile,A=BondAtlas,C=BondContent,W=BondWorld,E=BondEchoes,host=$('#region-map');
const reduced={get matches(){return BondSettings.reduced();}};
let active=false,m=A.get(P.snapshot().map),pos={...P.snapshot().position},camera={x:0,y:0},scale=.78,last=0,lastSave=0,lastPopulation=0,dirty=false,dest=null,pending=null,keys=new Set(),objects=[],followers=[],rigs=[],party=[],dialogId=null,route=[],travelPlan=[],lastHud=0,graphics='standard',followTarget=null,prefetchedGate=null;
const VERTICAL=.78,TEST_MOVE_MULTIPLIER=P.TEST?3:1,citizenRoutes=new Map();let playerLeft=false,aggroGrace=3,walkedGate=null;
const quiet=()=>{const s=P.snapshot();return !!s.character&&!s.character.legacy&&!s.journey?.early?.introFightWon;};
try{graphics=JSON.parse(localStorage.getItem('bond-bolt-world-settings'+(P.TEST?'-test':'')))?.graphics||'standard';}catch(_){}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const miniGate=g=>({x:Math.max(8,Math.min(152,g.x/m.width*160)),y:Math.max(8,Math.min(112,g.y/m.height*120))});
const wayfinding=document.createElement('div');wayfinding.id='opening-wayfinding';wayfinding.innerHTML='<span id="opening-location"></span><button id="opening-route" class="button secondary"></button>';$('.region-layout').before(wayfinding);
const encounterNotice=document.createElement('div');encounterNotice.id='encounter-notice';encounterNotice.className='field-notice';encounterNotice.innerHTML='<span>Battle in progress.</span><button class="button secondary" id="field-resume">View battle</button><button class="button secondary" id="field-withdraw">Run</button>';wayfinding.after(encounterNotice);
const echoNotice=document.createElement('div');echoNotice.id='echo-notice';echoNotice.className='field-notice';echoNotice.innerHTML='<span>Soul Echo found. Summon it from Inventory.</span><button class="button primary" id="field-echo">Find my Echo →</button>';encounterNotice.after(echoNotice);
const exits=document.createElement('nav');exits.id='map-exits';exits.setAttribute('aria-label','Map exits. Numbers match the map and minimap.');echoNotice.after(exits);
host.innerHTML='<canvas id="world-ground" aria-hidden="true"></canvas><div id="world-actors"></div><div class="region-map-heading"></div><div id="world-quest" class="world-quest"><small>MAIN QUEST</small><span id="world-objective"></span><small id="world-objective-location" class="world-objective-location"></small></div><button id="world-minimap" aria-label="Local map. Choose a destination."><canvas width="160" height="120" aria-hidden="true"></canvas><span id="world-map-name"></span></button><button id="open-atlas" class="world-atlas-button" aria-label="Open World Atlas"><span aria-hidden="true">✦</span><small>WORLD ATLAS</small></button><span id="world-coordinates" aria-hidden="true"></span><div id="world-weather"></div><div id="world-load-state" role="status"></div><div id="world-status" role="status" aria-live="polite"></div><nav id="world-action-menu" aria-label="Game menu"><button data-world-menu="region" class="selected" aria-current="page"><span class="world-menu-icon compass-icon" aria-hidden="true"></span><small>Explore</small></button><button data-world-menu="inventory"><span class="world-menu-icon bag-icon-simple" aria-hidden="true"></span><small>Bag</small></button><button data-world-menu="collection"><span class="world-menu-icon creature-icon" aria-hidden="true"><i></i></span><small>Inner Sea</small></button></nav><div id="region-toast" class="region-toast" hidden></div>';
host.append(encounterNotice,echoNotice);
const canvas=$('#world-ground'),ctx=canvas.getContext('2d'),layer=$('#world-actors'),mini=$('#world-minimap canvas'),mc=mini.getContext('2d');
const atlas=document.createElement('dialog');atlas.id='atlas-dialog';atlas.setAttribute('aria-label','World Atlas');atlas.innerHTML='<div class="atlas-titlebar"><h2 tabindex="-1">The Six Reaches</h2><button class="button secondary" id="close-atlas">Close map ×</button></div><p>Six reaches, thirty-six places to discover. Follow the roads, prepare in town, and choose your next hunt.</p><div id="atlas-regions"></div>';document.body.append(atlas);
function stop(save=true){keys.clear();dest=null;pending=null;route=[];followTarget=null;last=0;if(dirty){if(save)P.position(pos);dirty=false;}}
function message(t){$('#region-message').textContent=t;$('#world-status').textContent=t;}
function canChallengeNpc(id,s=P.snapshot()){
 const e=W.NPCS[id];return !!e&&!e.storyOnly&&(e.practice||!s.defeated.includes(id))&&!(e.openingGate&&s.journey.early.mageGate)&&!(e.masterClass&&s.journey.early.trials[e.masterClass]);
}
function cacheArt(){return `<svg class="world-chest" viewBox="0 0 120 100" aria-hidden="true" focusable="false">
 <defs>
  <linearGradient id="cache-lid" x2=".3" y2="1"><stop stop-color="#d8ae70"/><stop offset=".5" stop-color="#af7844"/><stop offset="1" stop-color="#855333"/></linearGradient>
  <linearGradient id="cache-front" x2="0" y2="1"><stop stop-color="#a16b3f"/><stop offset="1" stop-color="#543a2a"/></linearGradient>
  <linearGradient id="cache-brass" x2=".7" y2="1"><stop stop-color="#ffdfa0"/><stop offset=".45" stop-color="#c79b53"/><stop offset="1" stop-color="#8b6336"/></linearGradient>
  <radialGradient id="cache-shadow"><stop stop-color="#172820" stop-opacity=".65"/><stop offset="1" stop-color="#172820" stop-opacity="0"/></radialGradient>
 </defs>
 <ellipse cx="61" cy="83" rx="57" ry="16" fill="url(#cache-shadow)"/>
 <g stroke="#3c3027" stroke-width="2" stroke-linejoin="round">
  <path d="M15 46 80 60 105 43V70L80 88 15 74Z" fill="url(#cache-front)"/>
  <path d="M80 60 105 43V70L80 88Z" fill="#62472f"/>
  <path d="M16 58 79 72M16 66 79 80M82 71 103 57M82 80 103 66" stroke="#372b22" stroke-width="1.3"/>
  <path d="m34 63 11 2m16 5 10 2M34 72l17 4" stroke="#d29d60" stroke-opacity=".4" stroke-width="1"/>
  <path d="M12 37 40 18 108 32 80 53Z" fill="url(#cache-lid)"/>
  <path d="M12 37 80 53V63L12 48Z" fill="#96643c"/>
  <path d="m80 53 28-21v11L80 63Z" fill="#6a4a30"/>
  <path d="m21 31 66 15M31 25l67 15M36 34l15 3m10 2 12 3" fill="none" stroke="#6e4b2e" stroke-width="1.2"/>
  <path d="M22 39 50 20 58 22 30 41v10l-8-2Zm42 10 29-20 8 1-29 21v10l-8-2Z" fill="url(#cache-brass)" stroke-width="1.2"/>
  <path d="m22 51 8 2v22l-8-2Zm42 9 8 2v22l-8-2Z" fill="url(#cache-brass)" stroke-width="1.2"/>
  <path d="M14 38 80 54l26-20M16 49l63 14" fill="none" stroke="#ebc18a" stroke-width="1.3"/>
  <path d="m42 51 16 4v16l-16-4Z" fill="url(#cache-brass)" stroke-width="1.5"/>
  <path d="M49 58a2.4 2.4 0 1 0 2 4l1 4-5-1 1-4a2.4 2.4 0 0 1 1-3Z" fill="#342c25" stroke="none"/>
  <path d="m89 57 9-6v7l-9 6Z" fill="#302c25" stroke="#c19b60" stroke-width="1.5"/>
 </g>
 <g fill="#fbe0a0"><circle cx="26" cy="44" r="1.2"/><circle cx="26" cy="69" r="1.2"/><circle cx="68" cy="54" r="1.2"/><circle cx="68" cy="78" r="1.2"/></g>
 <path d="m105 16 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#fff0c1" opacity=".9"/>
</svg>`;}
function sidebar(){
 const s=P.snapshot(),r=A.REGIONS[m.regionIndex];
 encounterNotice.hidden=!s.encounterSave;echoNotice.hidden=!!s.tutorial.summons||!Object.keys(s.inventory).some(k=>k.startsWith('echo:')&&s.inventory[k]>0);
 const fleeing=!!window.BondApp?.getBattle()?.escape&&!window.BondApp?.getBattle()?.ended;
 $('#field-withdraw').disabled=fleeing||BondRaidRules.applies(s.encounterSave?.encounter);$('#field-withdraw').textContent=fleeing?'Running…':'Run';
 exits.innerHTML='<span>EXITS</span>'+m.neighbors.map((g,i)=>{const d=A.get(g.to),levels=d.habitats.map(h=>h.level),danger=levels.length?Math.round(levels.reduce((n,v)=>n+v,0)/levels.length):d.level,delta=danger-BondProgress.trainerLevel(s);return '<button class="exit-route" data-exit="'+g.id+'"><b>'+(i+1)+' '+({east:'→',west:'←',north:'↑',south:'↓',up:'↑',down:'↓'}[g.direction])+'</b> '+d.name+'<small>'+(d.kind==='hub'?'Safe town':d.kind==='boss'?'Training grounds':delta>5?'Danger · Avg Lv '+danger:delta>0?'Challenge · Avg Lv '+danger:'Avg Lv '+danger)+'</small></button>';}).join('');
 wayfinding.hidden=!['clearing-0','clearing-hub'].includes(m.id);$('#opening-route').textContent=m.id==='clearing-hub'?'Firstlight Meadow · starting area →':'Return to camp · free rest';$('#opening-location').textContent=m.id==='clearing-hub'?'Mosslight Village · safe town':BondOpening.zone(pos);
 const levels=m.habitats.map(h=>h.level);$('#region-heading').textContent=m.name;$('#region-subtitle').textContent=r.name+' · '+(m.kind==='hub'?BondCities.theme(m).title:m.kind==='boss'?'Training grounds':m.kind+' · wildlife level '+Math.min(...levels)+'–'+Math.max(...levels))+'';
 $('.region-map-heading').innerHTML='';$('#world-map-name').textContent=m.name;
 $('#world-route').innerHTML=m.neighbors.map(g=>'<button class="route-gate text-button" data-route="'+g.id+'">'+({east:'→',west:'←',north:'↑',south:'↓',up:'↑',down:'↓'}[g.direction])+' '+g.label+'</button>').join('')+'<small>Choosing a route walks to its gate.</small>';
 const next=BondCampaign.next(s),target=next?.map&&A.get(next.map),targetRegion=target&&A.REGIONS[target.regionIndex];
 $('#world-objective').replaceChildren();if(next?.choices){const list=document.createElement('ul');list.className='class-directions';for(const choice of next.choices){const item=document.createElement('li');item.textContent=choice.label;list.append(item);}$('#world-objective').append(list);}else $('#world-objective').textContent=next?.label||'Explore the Six Reaches';$('#world-objective-location').textContent=targetRegion?targetRegion.name+' · '+target.name:'';$('#world-objective-location').hidden=!targetRegion;$('#world-quest').dataset.step=next?.id||'free';
 updateQuestMarkers(s,next);
 $('#world-action-menu [data-world-menu="inventory"]').classList.toggle('tutorial-target',next?.id==='ep:summon1'||next?.id==='ep:summon2');
 $('#region-objectives').innerHTML='<li>'+(next?'→ '+next.label:'✓ Early progression complete')+'</li><li>'+s.owned.length+' / 100 species · Trainer Lv '+BondProgress.trainerLevel(s)+' / 60</li><li>'+s.companions.length+' summoned companions</li><li>'+s.visited.length+' / '+A.maps.length+' maps discovered</li><li>'+s.sights.length+' landmarks recorded</li>';
 $('#region-supplies').textContent=s.coins+' coins · '+Object.values(s.echoes).reduce((n,x)=>n+x.length,0)+' Soul Echoes · '+(s.inventory.biscuit||0)+' Biscuits';
 $('#field-vitality').innerHTML=BondRecovery.bars(party);
 $('#region-save-status').textContent=P.error()||(P.persistent()?'Saved on this browser.':'Session only. Export before closing.');
 if(atlas.open)BondWorldMap.render($('#atlas-regions'));
}
function residentRoute(r){
 if(!r.route)return undefined;if(citizenRoutes.has(r.id))return citizenRoutes.get(r.id);
 const points=[r.route[0]];for(let i=1;i<=r.route.length;i++){const end=r.route[i%r.route.length],path=BondNav.find(m.id,points.at(-1),end);if(!path.ok)return undefined;points.push(...path.path);}
 points.pop();citizenRoutes.set(r.id,points);return points;
}
function buildObjects(){
 const state=P.snapshot(),currentQuest=BondCampaign.next(state),oldFocus=document.activeElement?.dataset?.object,previousActors=new Map(objects.filter(o=>o.kind==='wild').map(o=>[o.id+':'+o.life,o])),previousResidents=new Map(objects.filter(o=>o.kind==='resident').map(o=>[o.id,o]));
 objects=m.neighbors.map(g=>({...g,kind:'gate',gateKind:g.kind,passage:BondPassages.forMap(m).find(p=>p.gate.id===g.id),label:g.label,locked:!A.unlocked(state,g.to)}));
 for(const s of P.population(m.id))if(s.present){const old=previousActors.get(s.id+':'+s.life),introHostile=s.id==='clearing-0:emberfox:0'&&!state.journey.early.introFightWon;objects.push({...s,...(old?{x:old.x,y:old.y,mode:old.mode,warning:old.warning,facingLeft:old.facingLeft}:{}),introHostile,kind:'wild',label:C.UNITS[s.type].name,homeX:s.x,homeY:s.y});}
 if(m.kind!=='boss'&&!P.snapshot().collected.includes(m.id))objects.push({id:'cache:'+m.id,kind:'cache',...m.cache,label:'Wayfarer cache'});
 if(m.kind!=='boss'&&!(quiet()&&m.id==='clearing-0'))objects.push({id:'guide:'+m.id,kind:'guide',questKeeperMap:m.id,...m.guide,label:m.kind==='hub'?'Town Keeper':'Trail Keeper'});
 for(const l of m.landmarks)if(!['hub','boss'].includes(m.kind)){const spring=l.kind==='spring',sign=spring||l.kind==='lookout',anchor=spring?m.shelter:l;objects.push({...l,id:'sight:'+l.id,sightId:l.id,kind:'discovery',sceneryService:true,sceneryKey:spring?m.id+':rest':l.id,roadSign:sign,x:anchor.x,y:anchor.y+(sign?70:160),label:l.kind==='lookout'?'Road sign · local information':spring?l.name+' · road sign':l.name});}
 if(m.id==='clearing-0'&&state.journey.early.firstSummon&&!state.journey.early.secondChoice){
  const bloom=A.safePoint(m.id,{x:3000,y:m.height/2-170}),stone=A.safePoint(m.id,{x:6420,y:m.height/2-170});
  objects.push({id:'opening-sign:bloom',kind:'openingSign',...bloom,label:'Bloomgrove',openingText:'Bloomslime restores allies but needs protection. Continue east to find it.'},
   {id:'opening-sign:stone',kind:'openingSign',...stone,label:'Deepwood',openingText:'Stonehorn is a slow frontline protector. Continue east to find it; Bloomslime lives to the west.'});
 }
 for(const e of [...BondCampaign.trainers,...BondCampaign.earlyEncounters.filter(e=>!e.kind),BondRelicQuest.tully].filter(e=>e.map===m.id&&BondCampaign.visible(e,state)&&!(quiet()&&m.id==='clearing-0')))objects.push({id:e.id,kind:'npc',x:e.x,y:e.y,masterClass:e.masterClass,applicationClass:e.applicationClass,label:e.name+(e.masterClass?' · CLASS MASTER':e.storyOnly?' · SPIRIT':'')});
 for(const p of BondCampaign.packs.filter(p=>p.map===m.id&&!(quiet()&&m.id==='clearing-0')))objects.push({...p,kind:'pack',label:p.name});
 if(m.kind==='hub'){
  for(const b of m.buildings)objects.push({id:b.id,kind:'building',...b.door,sceneryService:true,sceneryKey:b.id,label:b.name});
  for(const r of m.residents){const old=previousResidents.get(r.id);objects.push({...r,route:residentRoute(r),...(old?{x:old.x,y:old.y,routeIndex:old.routeIndex,wait:old.wait,facingLeft:old.facingLeft}:{}),kind:'resident',label:r.name});}
  if(m.teleport)objects.push({id:m.id+':waystone',kind:'waystone',...m.teleport,sceneryService:true,sceneryKey:m.id+':teleport',label:'City waystone'});
  const keeper=Object.keys(W.NPCS).find(id=>W.NPCS[id].area===m.region&&!W.NPCS[id].kind);
  if(keeper)objects.push({id:keeper,kind:'npc',x:520,y:820,label:W.NPCS[keeper].name});
  // Legacy reward-generating pack removed from the world; new packs use actual resident lives.

 }else if(m.kind==='boss'){
  const type=m.boss,u=C.UNITS[type],id='practice:'+type;
  W.NPCS[id]={id,name:u.name,appearance:type,title:'Training guardian',area:m.region,map:m.id,kind:'boss',practice:true,level:'LOCAL PRACTICE',coins:0,
   greeting:'The altar summons a guardian for training.',
   advice:'Watch the charged area attack. Try a tank, shielding and a defensive formation.',
   enemies:[{type,skills:[...u.default],hp:3400,power:44,boss:true,passive:u.passive}]};
  const progression=BondCampaign.earlyEncounters.find(e=>e.kind==='boss'&&e.map===m.id&&BondCampaign.visible(e,state)&&!state.journey.wins[e.id]);
  objects.push(progression?{id:progression.id,kind:'npc',x:progression.x,y:progression.y,label:progression.name+' · PROGRESSION BOSS'}:{id,kind:'npc',x:m.hero.x,y:m.hero.y+260,label:u.name+' altar'});
 }
 if(m.id===BondOpening.start.map)objects.push({id:'sanctuary:'+m.id,kind:'sanctuary',...BondOpening.camp,sceneryService:true,sceneryKey:m.id+':old-camp',label:'Forest camp · free rest'});
 layer.innerHTML='<div id="region-destination" hidden></div><div id="region-player" class="world-node region-player"><div class="world-art">'+CharacterRig.art(party[0]?.type||'druid')+'</div><div class="world-player-hp" role="progressbar" aria-label="Your health" aria-valuemin="0" aria-valuemax="100"><i></i></div><span class="world-label">'+(P.snapshot().character?.name||'YOU')+'</span></div>'+followers.map((u,i)=>'<div id="follower-'+i+'" class="world-node region-companion" data-type="'+u.type+'" aria-hidden="true"><div class="world-art">'+CharacterRig.art(u.type)+'</div><div class="world-companion-hp" role="progressbar" aria-label="Companion health" aria-valuemin="0" aria-valuemax="100"><i></i></div></div>').join('')+
 objects.map(o=>{
  let visual='';
  if(o.sceneryService)visual='';else if(o.kind==='guide')visual='<div class="world-art">'+CharacterRig.art('npc-keeper')+'</div>';else if(o.kind==='wild'||o.kind==='npc')visual='<div class="world-art">'+CharacterRig.art(o.type||CharacterRig.npcAppearance(W.NPCS[o.id],o.id))+'</div>';
  else if(o.kind==='resident')visual='<div class="world-art">'+CharacterRig.art(o.appearance)+residentTool(o.activity)+'</div>'+(o.pet?'<div class="city-pet" aria-hidden="true">'+CharacterRig.art(o.pet)+'</div>':'');
  else if(o.kind==='pack')visual='<div class="world-art">'+CharacterRig.art(m.habitats[0]?.type||'emberfox')+'</div>';
  else if(o.kind==='cache')visual=cacheArt();
  else if(o.kind==='openingSign')visual='<span class="opening-sign-art" aria-hidden="true"><i></i><b></b></span>';
  else if(o.kind==='gate')visual=(o.gateKind==='stairs'?'<span class="tower-stair-hitbox" aria-hidden="true"></span>':'<span class="world-exit-hitbox" aria-hidden="true"></span>')+'<span class="gate-badge" aria-hidden="true">'+(o.gateKind==='stairs'?(o.direction==='up'?'↑ UPSTAIRS':'↓ DOWNSTAIRS'):(m.neighbors.findIndex(g=>g.id===o.id)+1)+' · '+(o.locked?'LOCKED':o.passage.title.toUpperCase()))+'</span>';
  if(o.kind==='wild'||o.kind==='npc')visual=visual.replace(' src="',' data-world-src="');
  const label=o.kind==='wild'?'':'<span class="world-label">'+o.label+'<small>'+(o.kind==='building'?'ENTER':o.kind==='waystone'?'TRAVEL TO A CITY':o.kind==='resident'?'TALK':o.kind==='gate'?(o.gateKind==='stairs'?'GO '+o.direction.toUpperCase():o.locked?'COMPLETE THE FOREST MAGE TRIAL':'FOLLOW THE PASSAGE'):o.kind==='habitat'?'FIXED SPAWNS':o.kind==='pack'?'CHALLENGE PACK':o.kind==='npc'?'TALK / CHALLENGE':o.kind==='cache'?'OPEN':o.kind==='shop'?'BUY SUPPLIES':o.kind==='sanctuary'?'REST':o.roadSign||o.kind==='openingSign'?'READ THE SIGN':'INTERACT')+'</small></span>';
  const aria=o.kind==='wild'?'Wild creature, level '+(o.habitat?.level||''):o.label;o.baseAria=aria;
  return '<button class="world-node map-object '+o.kind+(o.kind==='wild'&&BondWildBehavior.policy(m.id,o.type,o,BondProgress.trainerLevel(state))?' hostile':'')+(o.sceneryService?' scenery-service':'')+(o.roadSign?' road-sign':'')+(o.passage?' passage':'')+'" '+(o.passage?'data-passage="'+o.passage.type+'" ':'')+'data-object="'+o.id+'" aria-label="'+aria+'">'+visual+label+'</button>';
 }).join('');
 objects.forEach(o=>{o.el=layer.querySelector('[data-object="'+o.id+'"]');if(o.kind==='resident')o.el.dataset.activity=o.activity||'idle';});
 updateQuestMarkers(state,currentQuest);
 rigs=[CharacterRig.mount($('#region-player .world-art'),party[0]?.type||'druid'),...followers.map((u,i)=>CharacterRig.mount($('#follower-'+i+' .world-art'),u.type,{lazy:true}))];
 WorldRenderer.mount(layer,m);
 if(oldFocus)objects.find(o=>o.id===oldFocus)?.el.focus({preventScroll:true});
}
function updateQuestMarkers(state=P.snapshot(),current=BondCampaign.next(state)){
 for(const o of objects.filter(o=>o.kind==='npc'||o.kind==='guide')){
  const type=BondCampaign.questMarker(o,state,current),el=o.el;o.questMarker=type;if(!el)continue;
  if(o.kind==='npc')el.querySelector('.world-label small').textContent=canChallengeNpc(o.id,state)?'TALK / CHALLENGE':'TALK';
  let marker=el.querySelector('.quest-marker');
  if(type&&!marker){marker=document.createElement('span');marker.className='quest-marker';marker.setAttribute('aria-hidden','true');el.prepend(marker);}
  if(marker){if(type){marker.textContent=type==='delivery'?'?':'!';marker.dataset.questMarker=type;}else marker.remove();}
  if(type)el.dataset.questMarker=type;else el.removeAttribute('data-quest-marker');
  el.setAttribute('aria-label',(o.baseAria||o.label)+(type?(type==='delivery'?'. Quest delivery ready.':'. Quest available.') :''));
 }
}
function loadMap(){
 walkedGate=null;
 const s=P.snapshot();document.body.classList.toggle('quiet-opening',quiet());aggroGrace=s.encounterSave?0:3;m=A.get(s.map);pos=A.safePoint(m.id,s.encounterSave?.anchor?.position||s.position);const opponent=s.encounterSave?.anchor?.actors?.[0];if(opponent)playerLeft=opponent.x<pos.x;stop();lastPopulation=0;lastHud=0;prefetchedGate=null;WorldRenderer.prefetch(m.id);
 followers=party.slice(1).filter(Boolean).map((u,i)=>({type:u.type,instanceId:u.instanceId,...A.clamp(m.id,{x:pos.x-48*(i+1),y:pos.y+28})}));
 buildObjects();sidebar();paint(performance.now());message((quiet()&&!s.tutorial.kills&&m.id==='clearing-0'?BondOpening.text:''));$('#world-weather').textContent=(m.kind==='cave'?'UNDERGROUND · ':m.kind==='hub'?'CITY · ':m.kind==='boss'?'BOSS DOMAIN · ':'ON THE TRAIL · ')+A.REGIONS[m.regionIndex].name;
}
function project(p){return {x:(p.x-camera.x)*scale,y:(p.y-camera.y)*scale*VERTICAL};}
function residentTool(activity){
 const shapes={carrying:'<path d="M8 15 26 11 36 17 18 22Z" fill="#c99b62"/><path d="M8 15 18 22 36 17v17l-18 6-10-8Z" fill="#986a43"/><path d="m14 20 0 15m10-14v16m-13-9 24-6" fill="none" stroke="#e0b677"/>',reading:'<path d="M7 19q9-5 17 0 8-5 16 0v18q-9-5-16 0-8-5-17 0Z" fill="#f0e2b7" stroke="#685343"/><path d="M24 19v18m-13-14 9 0m-9 4h9m8-4h8m-8 4h8" stroke="#9c8f6a"/>',gardening:'<path d="M12 23h18v14H12Z" fill="#8caa9a" stroke="#4d7066"/><path d="m30 26 10-9m-25 6v-6h12v6" fill="none" stroke="#779587" stroke-width="4"/><path d="m39 22 3 7m-7-5 2 9" stroke="#b5e4df" stroke-width="2"/>',working:'<path d="m20 36 6-25" stroke="#987044" stroke-width="5"/><path d="m17 10 18 5-2 7-18-5Z" fill="#a8afb0" stroke="#505862"/>'};
 return shapes[activity]?'<svg class="citizen-tool" viewBox="0 0 48 48" aria-hidden="true">'+shapes[activity]+'</svg>':'';
}
function place(el,p){const q=project(p);el.style.left=q.x+'px';el.style.top=q.y+'px';el.style.zIndex=Math.round(q.y+300);}
function paint(now){
 const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
 const dpr=Math.min(devicePixelRatio||1,graphics==='low'?1:1.5);if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
 scale=width<600?.65:.83;camera={x:Math.max(0,Math.min(m.width-width/scale,pos.x-width/scale*.43)),y:Math.max(0,Math.min(m.height-height/(scale*VERTICAL),pos.y-height/(scale*VERTICAL)*.55))};
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=m.theme.ground;ctx.fillRect(0,0,width,height);
 WorldRenderer.draw(ctx,m,camera,scale,width,height,now,pos,{vertical:VERTICAL,reduced:reduced.matches,mode:graphics,focus:pending,route:dest?[dest,...route]:[]});
 place($('#region-player'),pos);$('#region-player').classList.toggle('facing-left',playerLeft);CharacterRig.pose(rigs[0],{time:now/1000,walking:!!(dest||keys.size),reduced:reduced.matches});
 followers.forEach((u,i)=>{const el=$('#follower-'+i);place(el,u);el.classList.toggle('facing-left',!!u.facingLeft);CharacterRig.pose(rigs[i+1],{time:now/1000,walking:!!u.walking,reduced:reduced.matches});});
 const saved=P.snapshot().encounterSave,anchor=saved?.anchor;
 const engaged=!!saved&&saved.encounter.map===m.id;
 const fight=window.BondApp?.getBattle(),trainer=engaged&&fight?._attemptId===saved.attempt?fight.trainer(0):null;
 const health=Math.max(0,Math.min(100,trainer?100*trainer.hp/trainer.maxHp:BondAdventure.health(P.snapshot())/100));
 const hp=$('#region-player .world-player-hp');hp.dataset.tone=health<35?'red':health<=50?'yellow':'green';hp.setAttribute('aria-valuenow',Math.round(health*10)/10);hp.firstElementChild.style.width=health+'%';
 followers.forEach((u,i)=>{const live=engaged&&fight?._attemptId===saved.attempt?fight.units.find(v=>v.side===0&&v.instanceId===u.instanceId):null,value=Math.max(0,Math.min(100,live?100*live.hp/live.maxHp:BondAdventure.health(P.snapshot(),u.instanceId)/100)),bar=$('#follower-'+i+' .world-companion-hp');if(!bar)return;bar.dataset.tone=value<35?'red':value<=50?'yellow':'green';bar.setAttribute('aria-valuenow',Math.round(value*10)/10);bar.firstElementChild.style.width=value+'%';});
 $('#region-player').classList.toggle('world-battling',engaged);
 markBattle($('#region-player'),engaged);
 const discovered=new Set(P.snapshot().sights),trainerLevel=BondProgress.trainerLevel(P.snapshot()),cityPaused=!!document.querySelector('dialog[open]');
 for(const o of objects){
  if(o.kind==='resident'){o.el.classList.toggle('facing-left',!!o.facingLeft);o.el.classList.toggle('citizen-walking',!!o.walking&&!cityPaused&&!reduced.matches);o.el.classList.toggle('citizen-working',!o.walking&&pending?.id!==o.id&&!cityPaused&&!reduced.matches);}
  const pinned=anchor?.actors?.find(p=>p.id===o.id);o.engaged=engaged&&!!pinned;
  o.el.classList.toggle('world-battling',o.engaged);
  markBattle(o.el,o.engaged);
  if(o.engaged){o.x=pinned.x;o.y=pinned.y;o.facingLeft=o.x>pos.x;o.el.classList.toggle('facing-left',o.facingLeft);}
  if(o.kind==='wild'&&!o.engaged&&(!o.mode||o.mode==='idle')){
   const q={x:o.homeX+(reduced.matches?0:Math.sin(now/4200+A.hash(o.id)%32)*28),y:o.homeY+(reduced.matches?0:Math.cos(now/5300+A.hash(o.id)%29)*18)};
   if(!A.collision(m.id,q)){o.x=q.x;o.y=q.y;}
   o.el.classList.toggle('facing-left',Math.cos(now/4200+A.hash(o.id)%32)<0);
  }
  if(o.kind==='wild'){o.el.classList.toggle('hostile',!!BondWildBehavior.policy(m.id,o.type,o,trainerLevel));o.el.classList.toggle('alert',o.mode==='alert');o.el.classList.toggle('chase',o.mode==='chase');if(o.mode&&o.mode!=='idle')o.el.classList.toggle('facing-left',!!o.facingLeft);}
  place(o.el,o);const q=project(o),visible=q.x>-240&&q.x<width+140&&q.y>-90&&q.y<height+260;o.el.hidden=!visible;o.el.tabIndex=visible?0:-1;if(visible)for(const img of o.el.querySelectorAll('img[data-world-src]')){img.src=img.dataset.worldSrc;delete img.dataset.worldSrc;}o.el.classList.toggle('nearby',distance(pos,o)<=150);
  if(o.sceneryService&&visible){const key=o.sceneryKey||(o.roadSign?o.sightId:o.kind==='shop'?m.id+':shop':m.hero.id),p=WorldRenderer.bounds(key);if(p){o.el.style.left=p.x+'px';o.el.style.top=p.y+'px';o.el.style.width=p.width+'px';o.el.style.height=p.height+'px';o.el.style.marginTop='0';o.el.style.transform='translate(-50%,-94%)';}}
  if(o.kind==='gate'&&o.gateKind==='stairs'&&visible){const p=WorldRenderer.bounds(o.id+':stairs');if(p?.width>0&&p.height>0){o.el.style.left=p.x+'px';o.el.style.top=p.y+'px';o.el.style.width=p.width+'px';o.el.style.height=p.height+'px';o.el.style.transform='translate(-50%,-94%)';}}
  if(o.passage){
   const points=[[-150,0],[150,0],[-150,640],[150,640]].map(([side,depth])=>project(BondPassages.point(o.passage,side,depth))),xs=points.map(p=>p.x),ys=points.map(p=>p.y),label=project(o.passage.label);
   label.x=Math.max(100,Math.min(width-100,label.x));label.y=Math.max(width<600?185:115,Math.min(height-125,label.y));
   const left=Math.min(...xs,label.x-100),top=Math.min(...ys,label.y-24),right=Math.max(...xs,label.x+100),bottom=Math.max(...ys,label.y+52);
   const shown=Math.max(...xs)>0&&Math.min(...xs)<width&&Math.max(...ys)>0&&Math.min(...ys)<height;o.el.hidden=!shown;o.el.tabIndex=shown?0:-1;
   Object.assign(o.el.style,{left:left+'px',top:top+'px',width:(right-left)+'px',height:(bottom-top)+'px',transform:'none',zIndex:'auto'});
   o.el.style.setProperty('--passage-label-x',(label.x-left)+'px');o.el.style.setProperty('--passage-label-y',(label.y-top)+'px');
  }
  if(o.kind==='discovery')o.el.classList.toggle('recorded',discovered.has(o.sightId));
 }
 if(now-lastHud>150){
  if(m.id===BondOpening.start.map)$('#opening-location').textContent=BondOpening.zone(pos);
  $('#world-coordinates').textContent=Math.round(pos.x)+' / '+Math.round(pos.y);
  WorldRenderer.mini(mc,m);
  for(const o of objects){mc.fillStyle=o.kind==='gate'?'#fff0be':o.kind==='wild'?'#f1bc77':'#dce9c1';mc.fillRect(o.x/m.width*160-1.5,o.y/m.height*120-1.5,3,3);}
  for(const [i,g] of m.neighbors.entries()){const {x,y}=miniGate(g);mc.fillStyle=A.unlocked(P.snapshot(),g.to)?'#ffe9a4':'#bcc5be';mc.strokeStyle='#193e36';mc.lineWidth=2;mc.beginPath();mc.arc(x,y,7,0,Math.PI*2);mc.fill();mc.stroke();mc.fillStyle='#173b31';mc.font='bold 10px sans-serif';mc.textAlign='center';mc.textBaseline='middle';mc.fillText(String(i+1),x,y);}
  for(const o of objects.filter(o=>o.questMarker)){const x=o.x/m.width*160,y=o.y/m.height*120;mc.fillStyle='#ffd83d';mc.strokeStyle='#593d09';mc.lineWidth=1.5;mc.beginPath();mc.arc(x,y,6.5,0,Math.PI*2);mc.fill();mc.stroke();mc.fillStyle='#3b2909';mc.font='900 9px system-ui';mc.textAlign='center';mc.textBaseline='middle';mc.fillText(o.questMarker==='delivery'?'?':'!',x,y+.5);}
  mc.strokeStyle='#fff7d877';mc.lineWidth=1;mc.strokeRect(camera.x/m.width*160,camera.y/m.height*120,width/scale/m.width*160,height/(scale*VERTICAL)/m.height*120);
  mc.fillStyle='#fff8d0';mc.beginPath();mc.arc(pos.x/m.width*160,pos.y/m.height*120,3,0,Math.PI*2);mc.fill();
  const exit=m.neighbors.filter(g=>distance(pos,g)<650).sort((a,b)=>distance(pos,a)-distance(pos,b))[0];
  if(exit&&exit.id!==prefetchedGate&&A.unlocked(P.snapshot(),exit.to)){WorldRenderer.prefetch(exit.to);prefetchedGate=exit.id;}
  const population=P.snapshot().spawns,lines=m.habitats.map(h=>{const entries=BondPopulation.selected(h,population).map(id=>population[id]).filter(Boolean),live=entries.filter(x=>x.present).length,wait=entries.filter(x=>!x.present).map(x=>Math.max(0,Math.ceil((x.readyAt-Date.now())/1000)));return '<li>'+C.UNITS[h.type].name+' <strong>'+live+' / '+h.count+'</strong>'+(wait.some(n=>n>0)?' · '+Math.min(...wait.filter(n=>n>0))+'s':'')+'</li>';}).join('');
  $('#world-population').innerHTML=m.kind==='hub'?'No wild creatures in town.':m.kind==='boss'?'No roaming wildlife in this domain.':'<strong>Map population · '+objects.filter(o=>o.kind==='wild').length+' / '+BondPopulation.total(m)+'</strong><ul>'+lines+'</ul><small></small>';
 const near=nearest();$('#region-interact').disabled=!near;$('#region-interact').textContent=near?(near.kind==='wild'?'Attack creature':'Interact: '+near.label):'Nothing nearby';
  const metrics=WorldRenderer.inspect();$('#world-load-state').textContent=metrics.fallback||metrics.terrainError||metrics.bridgeError?'Scenery unavailable. Your progress is safe.':'';
  lastHud=now;
 }
}

function markBattle(el,on){let badge=el.querySelector('.battle-marker');if(on&&!badge){badge=document.createElement('span');badge.className='battle-marker';badge.textContent='⚔';badge.setAttribute('aria-label','In battle');el.append(badge);}if(badge)badge.hidden=!on;}
function nearest(){return objects.filter(o=>o.kind!=='habitat'&&distance(pos,o)<120).sort((a,b)=>distance(pos,a)-distance(pos,b))[0];}
function walkTo(p,continuing=false){if(P.snapshot().encounterSave){message('In battle. View it or retreat to move.');return false;}stop();if(!continuing)travelPlan=[];const result=BondNav.find(m.id,pos,A.clamp(m.id,p));if(!result.ok){message(result.reason);return false;}route=result.path;dest=route.shift()||null;host.focus({preventScroll:true});return true;}
function approach(o,continuing=false){if(!o)return;const saved=P.snapshot().encounterSave;if(saved){BondApp.startRegionBattle(saved.id);return;}if(!continuing)travelPlan=[];if(distance(pos,o)<=115){interact(o);return;}if(!walkTo(o,continuing))return;pending=o;}
const bossControls=document.createElement('div');bossControls.id='boss-test-controls';bossControls.hidden=true;bossControls.innerHTML='<label>Guardian level <input id="boss-test-level" type="number" min="1" max="100" step="1" value="1"></label><button id="boss-match-level" class="text-button">Match trainer level</button><p id="boss-test-preview"></p>';$('#npc-team').after(bossControls);
bossControls.insertAdjacentHTML('beforeend','<label>Allied parties <select id="boss-practice-parties"><option value="1">Your party only</option><option value="2">Two parties</option><option value="3">Three parties</option></select></label><p>Training encounter · No rewards</p>');
const trialControls=document.createElement('div');trialControls.id='trial-skill-controls';trialControls.hidden=true;bossControls.after(trialControls);
const transformButton=document.createElement('button');transformButton.id='npc-transform';transformButton.className='button primary';transformButton.hidden=true;$('#npc-fight').after(transformButton);
let classConfirmed=false,transformConfirmed=false;
const className=type=>type==='swordsman'?'knight':C.UNITS[type].name.toLowerCase();
function talk(id){if(BondRelicView.open(id))return;
 stop();classConfirmed=false;transformConfirmed=false;dialogId=id;const e=P.encounter(id);if(!e)return;if(e.openingGate&&!P.snapshot().journey.early.mageMet)P.meetOpeningMage();
 $('#npc-portrait').innerHTML=CharacterRig.art(CharacterRig.npcAppearance(e,id));$('#npc-title').textContent=e.name;$('#npc-tier').textContent=e.kind==='wild'?'WILD · Lv '+e.level+' · '+e.rarity:e.title;
 $('#npc-dialogue').textContent=e.kind==='wild'?'Challenge this wild creature.':e.greeting;
 $('#npc-team').hidden=!!e.masterClass;$('#npc-team').innerHTML=(e.enemies||e.team||[]).filter(Boolean).map(u=>'<div>'+CharacterRig.art(C.UNITS[u.type].role==='Trainer'?CharacterRig.npcAppearance(e,id):u.type)+'<strong>'+(C.UNITS[u.type].role==='Trainer'?e.name:C.UNITS[u.type].name)+'</strong><small>'+u.skills.map(k=>C.SKILLS[k].name).join(' · ')+'</small></div>').join('');
 if(e.packId)$('#npc-dialogue').textContent=e.advice;
 const gatePassed=e.openingGate&&P.snapshot().journey.early.mageGate,requirement=P.requirement(id,party),injury=!e.practice&&!P.snapshot().encounterSave&&BondAdventure.readiness(P.snapshot(),party);if(gatePassed)$('#npc-dialogue').textContent='The forest road is open.';else if(injury)$('#npc-dialogue').textContent=injury;else if(requirement)$('#npc-dialogue').textContent=e.openingGate?'It is too dangerous to go farther with only one ally. Return with two companions.':requirement;else if(e.openingGate)$('#npc-dialogue').textContent='Two companions. Good. Show me your bond, and I will open the road.';else if(e.kind==='wild'&&e.level>BondProgress.trainerLevel(P.snapshot())+3)$('#npc-dialogue').textContent+=' Danger: '+(e.level-BondProgress.trainerLevel(P.snapshot()))+' levels above your trainer. Prepare a full party before challenging it.';
 const defeated=!e.practice&&P.snapshot().defeated.includes(id);
 if(defeated&&!e.masterClass)$('#npc-dialogue').textContent='Well fought.';
 const trialComplete=e.masterClass&&P.snapshot().journey.early.trials[e.masterClass],canTransform=e.masterClass&&P.canSpecialize(e.masterClass);transformButton.hidden=!trialComplete||!!P.snapshot().progression.specialization;transformButton.disabled=!canTransform;transformButton.textContent=canTransform?'Become '+C.UNITS[e.masterClass].name:'Transformation requires player Lv 20';
 if(trialComplete&&!P.snapshot().progression.specialization)$('#npc-dialogue').textContent=canTransform?'Well fought. You are ready to become a '+className(e.masterClass)+'.':'Well fought. Return at player Lv 20 to become a '+C.UNITS[e.masterClass].name+'.';
 trialControls.hidden=true;trialControls.replaceChildren();
 bossControls.hidden=e.kind!=='boss'||!e.practice;$('#boss-test-level').value=P.snapshot().bossLevel;$('#npc-fight').hidden=defeated||!!gatePassed||!!trialComplete&&!P.snapshot().progression.specialization;$('#npc-fight').disabled=!P.validEncounter(id)||!!injury||!!requirement;$('#npc-fight').textContent=e.openingGate?'Begin trial →':e.practice?'Train':e.masterClass?'Yes, I want to be a '+className(e.masterClass):'Challenge';
 $('#npc-dialog').showModal();
}
function beginHunt(id){
 const target=P.hunt(id);if(!target)return null;
 const saved=P.snapshot().encounterSave;
 if(saved&&saved.id!==target.id)return null;
 return P.beginHunt(id);
}
function interact(o){
 if(!o||!active||distance(pos,o)>135)return;
 if(o.kind==='gate'){stop(false);if(P.transition(o.id,pos)){loadMap();continueTravel();}else message(P.snapshot().encounterSave?'Finish the battle or use Run before leaving this map.':!A.unlocked(P.snapshot(),o.to)?'Complete the Forest Mage trial to open this road.':P.error()||'Could not travel. Try the passage again.');return;}
 stop();P.position(pos);
 if(o.kind==='cache'){if(P.collect(m.id)){buildObjects();sidebar();message('Cache collected: 12 coins, a Bond Biscuit and a regional keepsake.');}}
 else if(o.kind==='wild'){const e=beginHunt(o.id);if(e){if(!BondApp.startRegionBattle(e.id))message(BondAdventure.readiness(P.snapshot(),party)||P.error()||'Could not start this hunt. Retry saving the previous encounter.');}else{buildObjects();message(P.error()||(P.snapshot().encounterSave?'You are already in battle.':'That creature is gone.'));}}
 else if(o.kind==='pack'){const e=P.beginPack(o.id);if(e)talk(e.id);else message(P.snapshot().encounterSave?'Finish the battle or use Run first.':'Not enough creatures nearby for this encounter.');}
 else if(o.kind==='npc')talk(o.id);
 else if(o.kind==='building')BondCityView.enter(o.id);
 else if(o.kind==='resident')BondCityView.resident(o.id);
 else if(o.kind==='waystone')BondCityView.teleport();
 else if(o.kind==='shop'||o.kind==='sanctuary')BondRecovery.open(o.kind);
 else if(['guide','discovery','openingSign'].includes(o.kind))exploreInfo(o);
}
host.addEventListener('click',e=>{
 if(!active||document.querySelector('dialog[open]'))return;
 const menu=e.target.closest('[data-world-menu]');if(menu){if(menu.dataset.worldMenu==='inventory'){BondApp.switchTab('loadout');BondMenu.open('inventory');}else if(menu.dataset.worldMenu==='collection'){BondApp.switchTab('loadout');BondMenu.open('collection');}else host.focus({preventScroll:true});return;}
 if(e.target.closest('#open-atlas')){stop();BondWorldMap.render($('#atlas-regions'));atlas.showModal();atlas.querySelector('h2').focus({preventScroll:true});atlas.scrollTop=0;BondWorldMap.center(P.snapshot().map);return;}
 if(e.target.closest('#world-minimap')){const r=mini.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*160,y=(e.clientY-r.top)/r.height*120,gate=m.neighbors.find(g=>distance(miniGate(g),{x,y})<9);if(gate)approach(objects.find(o=>o.id===gate.id));else walkTo({x:x/160*m.width,y:y/120*m.height});return;}
 const b=e.target.closest('[data-object]');if(b){approach(objects.find(o=>o.id===b.dataset.object));return;}
 const r=host.getBoundingClientRect();walkTo({x:(e.clientX-r.left)/scale+camera.x,y:(e.clientY-r.top)/(scale*VERTICAL)+camera.y});
});
$('#world-route').onclick=e=>{const b=e.target.closest('[data-route]');if(b)approach(objects.find(o=>o.id===b.dataset.route));};
$('#close-atlas').onclick=()=>atlas.close();atlas.addEventListener('close',()=>host.focus({preventScroll:true}));
$('#region-interact').onclick=()=>interact(nearest());
$('#opening-route').onclick=()=>{if(m.id==='clearing-hub')travelTo('clearing-0');else approach(objects.find(o=>o.id==='sanctuary:clearing-0'));};
$('#field-resume').onclick=()=>{const id=P.snapshot().encounterSave?.id;if(id&&!BondApp.startRegionBattle(id))message(P.error()||'Unable to resume the saved battle.');};
$('#field-withdraw').onclick=()=>{if(BondApp.runFromBattle()){if(!BondApp.getBattle()?.ended)message('Running! Enemies can still hit you.');}else message(P.error()||'Could not start running. Try again.');};
$('#field-echo').onclick=()=>BondInventory.openEcho();
exits.onclick=e=>{const b=e.target.closest('[data-exit]');if(b)approach(objects.find(o=>o.id===b.dataset.exit));};
$('#npc-close').onclick=()=>$('#npc-dialog').close();
transformButton.onclick=()=>{const e=P.encounter(dialogId);if(!e?.masterClass||!P.canSpecialize(e.masterClass))return;if(!transformConfirmed){transformConfirmed=true;$('#npc-dialogue').textContent='Join us as a '+className(e.masterClass)+'? This is your permanent class.';transformButton.textContent='Ok';$('#npc-fight').hidden=true;return;}const result=P.specialize(e.masterClass);if(result){$('#npc-dialog').close();party=BondApp.getBuild()[0];loadMap();message('Class transformed: '+C.UNITS[e.masterClass].name+'.');}};
$('#boss-match-level').onclick=()=>{$('#boss-test-level').value=BondProgress.trainerLevel(P.snapshot());};
$('#npc-fight').onclick=()=>{const id=dialogId,e=P.encounter(id),options={};if(!e){$('#npc-dialog').close();message('That encounter is no longer available.');return;}if(e.masterClass&&!classConfirmed){classConfirmed=true;$('#npc-dialogue').textContent='Then face my class test. Defeat me to prove you are ready to become a '+className(e.masterClass)+'.';$('#npc-fight').textContent='Ok';$('#npc-team').hidden=true;return;}if(e.kind==='boss'&&e.practice){const input=$('#boss-test-level');if(!input.reportValidity())return;options.bossLevel=input.valueAsNumber;options.practiceParties=Number($('#boss-practice-parties').value);}$('#npc-dialog').close();if(!BondApp.startRegionBattle(id,options))message(P.requirement(id,party)||BondAdventure.readiness(P.snapshot(),party)||'Unable to start battle. Resume your current fight or try again.');};
$('#npc-dialog').addEventListener('close',()=>{stop();if(active)host.focus({preventScroll:true});});
$('#region-reset').onclick=()=>{if(!confirm('Reset your adventure? All character progress and items will be lost.'))return;stop();BondApp.cancelRegionBattle();if(P.reset()){party=BondApp.getBuild()[0];loadMap();BondCreation.open();}};
const exportButton=document.createElement('button');exportButton.className='text-button';exportButton.textContent='Export local save ↓';$('#region-reset').before(exportButton);
exportButton.onclick=()=>{stop();const url=URL.createObjectURL(new Blob([P.export()],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='bond-bolt-local-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
const dirs={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]};
document.addEventListener('keydown',e=>{if(!active||P.snapshot().encounterSave||document.hidden||document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(dirs[k]){e.preventDefault();keys.add(k);dest=null;pending=null;route=[];travelPlan=[];}else if(k==='escape'){stop();travelPlan=[];}else if(k==='e'){e.preventDefault();interact(nearest());}});
document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
document.addEventListener('bond-profile',()=>{
 if(active)sidebar();
 if(W.NPCS[dialogId]&&!canChallengeNpc(dialogId)){$('#npc-fight').hidden=true;$('#npc-fight').disabled=true;}
 const shortcut=$('#explore-challenge');if(shortcut&&!canChallengeNpc(shortcut.dataset.npc))shortcut.remove();
});
function motionStep(p,dx,dy){
 const q=A.clamp(m.id,{x:p.x+dx,y:p.y+dy});if(!A.collision(m.id,q))return q;
 const x={x:q.x,y:p.y},y={x:p.x,y:q.y};if(!A.collision(m.id,x)&&Math.abs(dx)>.01)return x;if(!A.collision(m.id,y)&&Math.abs(dy)>.01)return y;
 // Slide along a blocking obstacle's tangent for click-to-walk.
 if(dest){const o=m.obstacles.find(o=>distance(p,o)<o.radius+45);if(o){const nx=p.x-o.x,ny=p.y-o.y,n=Math.hypot(nx,ny)||1,sign=(dest.x-p.x)*(-ny)+(dest.y-p.y)*nx>=0?1:-1;const t=A.clamp(m.id,{x:p.x-ny/n*Math.hypot(dx,dy)*sign,y:p.y+nx/n*Math.hypot(dx,dy)*sign});if(!A.collision(m.id,t))return t;}}
 return p;
}
function frame(now){
 const fighting=!!P.snapshot().encounterSave;if(!active&&!fighting)return;const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
 if((fighting||!document.querySelector('dialog[open]'))&&!document.hidden){
  if(active&&!fighting)for(const o of objects)if(o.kind==='resident')BondCities.stepResident(o,dt,pending?.id===o.id||document.activeElement===o.el);
  if(fighting){keys.clear();dest=null;pending=null;route=[];travelPlan=[];const anchor=P.snapshot().encounterSave.anchor;if(anchor?.map===m.id)pos={...anchor.position};}
  if(pending){
   if(distance(pos,pending)<=115){interact(pending);return;}
   const goal=route.at(-1)||dest;
   if(pending.kind==='wild'&&(!goal||distance(goal,pending)>80)){
    const target=pending;if(!walkTo(target,true))return;pending=target;
   }
  }
  let dx=0,dy=0;for(const k of keys){dx+=dirs[k][0];dy+=dirs[k][1];}
  if(dest&&!keys.size){dx=dest.x-pos.x;dy=dest.y-pos.y;}
  const length=Math.hypot(dx,dy);if(length>.1){const step=Math.min(A.BASE_SPEED*TEST_MOVE_MULTIPLIER*dt,dest&&!keys.size?length:Infinity),next=motionStep(pos,dx/length*step,dy/length*step);if(distance(pos,next)>.001){if(Math.abs(next.x-pos.x)>.01)playerLeft=next.x<pos.x;pos=next;dirty=true;}
   if(pending&&distance(pos,pending)<=115){const o=pending;interact(o);}else if(dest&&distance(pos,dest)<3){dest=route.shift()||null;if(!dest){if(pending&&distance(pos,pending)<=135)interact(pending);else if(pending?.kind!=='wild')pending=null;}}
  }
  if(walkedGate&&distance(pos,walkedGate)>180)walkedGate=null;
  if(!fighting&&!pending&&length>.1){
   const gate=objects.find(o=>o.passage&&o.id!==walkedGate?.id&&distance(pos,o)<95&&dx*o.passage.inward.x+dy*o.passage.inward.y<0);
   if(gate){walkedGate=gate;interact(gate);return;}
  }
  aggroGrace=Math.max(0,aggroGrace-dt);
 const pursuitProfile=P.snapshot(),trainerLevel=BondProgress.trainerLevel(pursuitProfile),protectedFight=fighting&&pursuitProfile.encounterSave?.encounter?.protectedEncounter===true,
  canPursue=(fighting?BondApp.isRunning()&&!protectedFight:aggroGrace===0)&&BondAdventure.health(pursuitProfile)>0;
  for(const o of objects.filter(o=>o.kind==='wild')){
   if(pursuitProfile.encounterSave?.encounter.enemies?.some(e=>e.spawnId===o.id&&e.life===o.life))continue;
   const hit=BondWildBehavior.step(o,pos,dt,{enabled:canPursue,trainerLevel,clear:(a,b)=>BondNav.clear(m.id,a,b,20),
    move:(q,a)=>!A.collision(m.id,q)?q:!A.collision(m.id,{x:q.x,y:a.y})?{x:q.x,y:a.y}:!A.collision(m.id,{x:a.x,y:q.y})?{x:a.x,y:q.y}:a});
   if(hit&&fighting){BondApp.joinWild(o.id,{x:o.x,y:o.y});continue;}
   if(hit){stop();P.position(pos);const e=P.beginHunt(o.id);if(e&&BondApp.startRegionBattle(e.id))return;aggroGrace=3;break;}
  }
  let previous=pos;followers.forEach(u=>{u.walking=false;if(distance(u,previous)>52){const k=1-Math.exp(-5*dt),next=motionStep(u,(previous.x-u.x)*k,(previous.y-u.y)*k);u.walking=distance(u,next)>.01;if(Math.abs(next.x-u.x)>.01)u.facingLeft=next.x<u.x;u.x=next.x;u.y=next.y;}previous=u;});
 }
 if(dirty&&now-lastSave>800){P.position(pos);dirty=false;lastSave=now;}
 if(now-lastPopulation>1200&&!document.querySelector('dialog[open]')){const lives=P.population(m.id).filter(o=>o.present).map(o=>o.id+':'+o.life).sort().join('|'),shown=objects.filter(o=>o.kind==='wild').map(o=>o.id+':'+o.life).sort().join('|');if(lives!==shown){const id=pending?.id;buildObjects();if(id)pending=objects.find(o=>o.id===id)||null;}lastPopulation=now;}
 if(active)paint(now);
}

const info=document.createElement('dialog');info.id='exploration-dialog';info.setAttribute('aria-labelledby','exploration-title');document.body.append(info);
function exploreInfo(o){
 stop();const isSight=o.kind==='discovery',npc=Object.entries(W.NPCS).find(([,e])=>e.area===m.region&&!e.kind);
 if(isSight)P.discover(o.sightId);if(o.kind==='guide')P.talkKeeper(m.id);
 const residents=m.habitats.map(h=>C.UNITS[h.type].name+' · Lv '+h.level+' · '+h.count+' residents').join('<br>');
 const detail=o.openingText?'<p>'+o.openingText+'</p>':isSight?'<p>This discovery is saved in your field journal.</p>':'';
 info.innerHTML='<p class="eyebrow">'+(o.openingText?'TRAIL SIGN':o.roadSign?'TRAIL SIGN · LOCAL INFORMATION':isSight?'FIELD JOURNAL':'KEEPER OF '+A.REGIONS[m.regionIndex].name.toUpperCase())+'</p><h2 id="exploration-title">'+o.label+'</h2>'+detail+(!o.openingText&&residents?'<h3>Local residents</h3><p>'+residents+'</p>':'')+'<div class="npc-actions"><button id="explore-close" class="button primary">Continue exploring</button>'+(!isSight&&!o.openingText&&npc&&canChallengeNpc(npc[0])?'<button id="explore-challenge" data-npc="'+npc[0]+'" class="button secondary">Challenge '+npc[1].name+'</button>':'')+'</div>';
 info.querySelector('#explore-close').onclick=()=>info.close();
 if(npc&&info.querySelector('#explore-challenge'))info.querySelector('#explore-challenge').onclick=()=>{info.close();talk(npc[0]);};
 info.showModal();sidebar();
}
info.addEventListener('close',()=>{if(active)host.focus({preventScroll:true});});
function travelTo(target){
 if(!A.get(target)||!A.unlocked(P.snapshot(),target)){message('That route is unavailable.');return false;}
 const queue=[[m.id]],seen=new Set();let result=null;
 while(queue.length){const path=queue.shift(),id=path.at(-1);if(id===target){result=path;break;}if(seen.has(id))continue;seen.add(id);for(const g of A.get(id).neighbors)if(!seen.has(g.to)&&A.unlocked(P.snapshot(),g.to))queue.push([...path,g.to]);}
 if(!result)return false;travelPlan=result.slice(1);if(atlas.open)atlas.close();continueTravel();return true;
}
function continueTravel(){
 if(!travelPlan.length)return;const next=travelPlan.shift(),gate=objects.find(o=>o.kind==='gate'&&o.to===next);if(!gate){travelPlan=[];return;}approach(gate,true);message('Walking to '+A.get(next).name+'. WASD or Escape cancels the route.');
 WorldRenderer.prefetch(next);
}
$('#atlas-regions').addEventListener('click',e=>{const b=e.target.closest('[data-world-travel]');if(b)travelTo(b.dataset.worldTravel);});
const vitality=document.createElement('div');vitality.innerHTML='<div id="field-vitality"></div><button class="button secondary" data-open-recovery>Recovery items</button>';$('#region-supplies').after(vitality);
const settings=document.createElement('div');settings.className='world-settings';settings.innerHTML='<button id="world-quality" class="button secondary"></button><button id="world-retry-art" class="text-button">Retry scenery</button><button id="world-immersive" class="text-button">Wide exploration</button><button id="world-journal" class="text-button">Field journal</button>';
$('.region-controls').after(settings);
function qualityLabel(){$('#world-quality').textContent='Scenery: '+(graphics==='low'?'Low effects':'Standard');}
qualityLabel();$('#world-quality').onclick=()=>{graphics=graphics==='low'?'standard':'low';qualityLabel();try{localStorage.setItem('bond-bolt-world-settings'+(P.TEST?'-test':''),JSON.stringify({graphics}));}catch(_){}};
$('#world-retry-art').textContent='Retry artwork';$('#world-retry-art').onclick=()=>{WorldRenderer.retry();CharacterRig.retry();};
$('#world-immersive').onclick=()=>{document.body.classList.toggle('world-immersive');$('#world-immersive').textContent=document.body.classList.contains('world-immersive')?'Show travel sidebar':'Wide exploration';};
$('#world-journal').onclick=()=>{stop();const s=P.snapshot();info.innerHTML='<p class="eyebrow">FIELD JOURNAL</p><h2 id="exploration-title">Places worth remembering</h2><p>'+s.sights.length+' recorded landmarks · '+s.visited.length+' / '+A.maps.length+' maps visited.</p><div class="world-journal-list">'+A.maps.filter(map=>s.visited.includes(map.id)).map(map=>'<button data-journal-map="'+map.id+'"><span>'+map.name+'<small> · '+map.landmarks.filter(l=>s.sights.includes(l.id)).length+' / '+map.landmarks.length+' landmarks</small></span></button>').join('')+'</div><div class="npc-actions"><button id="journal-close" class="button primary">Close journal</button></div>';info.querySelector('#journal-close').onclick=()=>info.close();info.querySelectorAll('[data-journal-map]').forEach(b=>b.onclick=()=>{info.close();travelTo(b.dataset.journalMap);});info.showModal();};

if(P.TEST){const qa=document.createElement('details');qa.className='qa-panel';qa.innerHTML='<summary>ISOLATED TEST SAVE · QA tools</summary><p>No effect on your normal save. Test grants do not test drop probability.</p><label>Species <select id="qa-species">'+C.MONSTERS.map(t=>'<option value="'+t+'">'+C.UNITS[t].name+'</option>').join('')+'</select></label><label>Echo level <input id="qa-level" type="number" value="1" min="1" max="100"></label><button id="qa-echo" class="button secondary">Grant test Echo</button><p id="qa-status" role="status"></p>';$('#panel-region').prepend(qa);$('#qa-echo').onclick=()=>{const input=$('#qa-level');if(!input.reportValidity())return;const t=$('#qa-species').value;if(P.testing.grantEcho(t,input.valueAsNumber)){$('#qa-status').textContent='Test Echo added. Open Inventory → Echoes → summon it. Assign it manually to your party.';sidebar();}};}
new ResizeObserver(()=>{if(active)paint(performance.now());}).observe(host);
window.BondRegion={anchor(encounter){const actors=(encounter?.enemies||[]).map(e=>objects.find(o=>o.id===e.spawnId)).filter(Boolean);const npc=objects.find(o=>o.id===encounter?.id);if(npc)actors.push(npc);return {map:m.id,position:{...pos},actors:actors.map(o=>({id:o.id,x:o.x,y:o.y}))};},enter(build){party=(P.snapshot().encounterSave?.build||build)[0];active=true;loadMap();},leave(){stop();active=false;},frame,notice:message,
 inspect:()=>({map:m.id,position:{...pos},camera:{...camera},destination:dest?{...dest}:null,route:route.map(p=>({...p})),travelPlan:[...travelPlan],graphics,renderer:WorldRenderer.inspect(),visible:objects.filter(o=>!o.el.hidden).map(o=>o.id),followers:followers.map(u=>({...u})),questMarkers:objects.filter(o=>o.questMarker).map(o=>({id:o.id,type:o.questMarker,symbol:o.questMarker==='delivery'?'?':'!',x:o.x,y:o.y})),speed:A.BASE_SPEED*TEST_MOVE_MULTIPLIER,actors:objects.filter(o=>o.kind==='wild').map(o=>({id:o.id,life:o.life,type:o.type,x:o.x,y:o.y,homeX:o.homeX,homeY:o.homeY,mode:o.mode||'idle',level:o.habitat.level,hostile:!!BondWildBehavior.policy(m.id,o.type,o,BondProgress.trainerLevel(P.snapshot()))}))}),
 escapeGrace(){aggroGrace=6;for(const o of objects.filter(o=>o.kind==='wild')){o.mode='idle';o.warning=0;}},
 residentPosition(id){const r=objects.find(o=>o.kind==='resident'&&o.id===id);return r?{x:r.x,y:r.y}:null;},
 citizens:()=>objects.filter(o=>o.kind==='resident').map(o=>({id:o.id,x:o.x,y:o.y,walking:!!o.walking,activity:o.activity||'idle'})),
 moveTo:walkTo,travelTo,approachId:id=>approach(objects.find(o=>o.id===id))};
})();
