/* v7 instance-based local profile. One document per commit; online authority is a later feature. */
(function(root){
'use strict';
// A partial client must never normalize or overwrite an otherwise valid save.
for(const dependency of ['BondContent','BondRules','BondRoster','BondProgress','BondAtlas','BondWorld','BondEchoes','BondPopulation','BondAdventure','BondGrowth','BondCampaign','BondOpening','BondFormation','BondHaven','BondGame','BondTraining','BondCombatCatalog','BondCombatEffects','BondCombatEntities','BondCombatPassives','BondCombatKits','BondClassTrees','BondApprenticeTree','BondClassTalents','BondMonsterProgression','BondCompanionTrees','BondCompanionMoves','BondCompanionTalents','BondItemCatalog','BondEquipment','BondEquipmentEffects','BondCombatHooks']){
 if(!root[dependency])throw Error('Required game module unavailable: '+dependency);
}
const C=BondContent,R=BondProgress,A=BondAtlas,W=BondWorld,E=BondEchoes,Q=BondPopulation,clone=x=>JSON.parse(JSON.stringify(x));
const T=BondAdventure;Object.assign(W.ITEMS,T.items);BondEquipment.install(W);
if(!root.BondFarm||!root.BondMoonCalendar)throw Error('Required Inner Sea module unavailable');
W.ITEMS.timber={name:'Timber',icon:'▤',category:'Materials',description:'Used to upgrade an Inner Sea habitat.'};
W.ITEMS.repairkit={name:'Farm repair kit',icon:'⚒',category:'Materials',description:'Repairs the Inner Sea after a failed defense.'};
const TEST=typeof location!=='undefined'&&new URLSearchParams(location.search).get('test')==='1';
const KEY='bond-bolt-profile-v7'+(TEST?'-sandbox':''),BUILD_KEY='bond-bolt-build-v4'+(TEST?'-sandbox':'');
const integer=(v,max=1000000000)=>Number.isSafeInteger(v)&&v>0?Math.min(max,v):0;
for(const type of C.MONSTERS)W.ITEMS[E.key(type)]=E.item(type);
for(const k of ['bondcontract','rarecontract'])W.ITEMS[k]={...W.ITEMS[k],category:'Legacy',description:'An old papyrus keepsake.'};
W.ITEMS.starseed.description='A legacy expedition keepsake. Preserved from an earlier save; not a current drop. Decorative, with no hidden stat bonus.';
W.ITEMS.ashglass={name:'Ashglass',icon:'◇',category:'Materials',description:'A smoky piece of ordinary volcanic glass from an Ashen Reach cache. Decorative; no stat bonus.'};
const validSkills=(type,skills)=>Array.isArray(skills)&&skills.length===3&&new Set(skills).size===3&&skills.every(k=>C.MONSTERS.includes(type)?BondCompanionMoves.validID(type,k):C.UNITS[type]?.skills.includes(k));
function summarize(s){
 for(const m of s.companions)BondCompanionMoves.clean(m);
 s.owned=[...new Set(s.companions.map(m=>m.type))];s.xp={};s.pacts={};
 for(const mon of s.companions){s.xp[mon.type]=Math.max(s.xp[mon.type]||0,mon.xp);s.pacts[mon.id]=mon.pact;}
}
const resolve=(s,id)=>s.companions.find(m=>m.id===id)||null;
const fresh=()=>({version:7,revision:0,character:null,map:'clearing-0',area:'clearing',position:{...A.get('clearing-0').entry},visited:['clearing-0'],
 vitality:{trainer:10000,companions:{}},trainerXP:0,apprenticeXP:0,progression:{version:2,specialization:null,treeGrandfathered:false},companions:[],equipment:{},formation:[...BondFormation.DEFAULT],bossLevel:1,growth:{},owned:[],xp:{},attributes:R.cleanAttributes(null,1),pacts:{},
 haven:BondHaven.fresh(),farm:BondFarm.fresh(),sights:[],collected:[],defeated:[],inventory:{biscuit:2},echoes:{},coins:0,prepared:false,boost:false,sequence:0,
 journey:root.BondCampaign?.fresh()||{},encounterSave:null,encounterReceipts:{},spawns:{},claims:{},summons:{},tutorial:{moved:false,kills:0,summons:0},migration:null});
function normalize(raw){
 const s=fresh();if(!raw||![2,3,4,5,6,7].includes(raw.version))return s;
 s.character=Object.hasOwn(raw,'character')?BondOpening.character(raw.character):{legacy:true};
 s.apprenticeXP=s.character&&!s.character.legacy?Math.min(R.threshold(5),integer(raw.apprenticeXP)):0;
 s.owned=[...new Set((Array.isArray(raw.owned)?raw.owned:[]).filter(t=>C.MONSTERS.includes(t)))];
 const isV7=raw.version===7;
 const seeds=isV7?(Array.isArray(raw.companions)?raw.companions:[]):s.owned.map(type=>({id:'legacy:'+type,type,xp:raw.xp?.[type],skills:C.UNITS[type].default,growth:raw.growth?.[type],pact:raw.pacts?.[type]}));
 const seen=new Set(),ordinals={};let cappedCompanions=0;
 for(const m of seeds){
  if(!m||!C.MONSTERS.includes(m.type)||typeof m.id!=='string'||m.id.length>180||!m.id||seen.has(m.id))continue;
  seen.add(m.id);ordinals[m.type]=(ordinals[m.type]||0)+1;
  const skills=validSkills(m.type,m.skills)?[...m.skills]:[...C.UNITS[m.type].default],pact=m.pact,engineXP=R.clampXP(m.xp),excess=Math.max(0,engineXP-R.PLAYER_MAX_XP);
  if(excess)cappedCompanions++;
  s.companions.push({id:m.id,type:m.type,ordinal:ordinals[m.type],xp:R.clampPlayerXP(engineXP),treeLevel:Number.isInteger(m.treeLevel)?Math.max(R.level(engineXP),Math.min(60,integer(m.treeLevel))):undefined,deferredXP:Math.max(integer(m.deferredXP,R.ENGINE_MAX_XP),excess),sourceLevel:Number.isInteger(m.sourceLevel)?Math.max(1,Math.min(R.ENGINE_LEVEL_CAP,m.sourceLevel)):undefined,skills,movesVersion:m.movesVersion,taughtMoves:m.taughtMoves,legacyMoves:m.legacyMoves,moveLevel:m.moveLevel,growth:m.growth||{},heldItem:m.heldItem||null,pact:{map:A.get(pact?.map)?pact.map:'clearing-0',trainerClass:BondContent.TRAINERS.includes(pact?.trainerClass)?pact.trainerClass:'druid'}});
 }
 summarize(s);
 s.journey=root.BondCampaign?.clean(raw.journey)||{};
 const currentProgression=raw.progression?.version>=2;
 const oldApprentice=s.character&&!s.character.legacy?Math.min(5,R.level(s.apprenticeXP)):1;
 const oldShown=Math.max(oldApprentice,...s.companions.map(m=>R.level(m.xp)));
 s.trainerXP=currentProgression?R.clampPlayerXP(integer(raw.trainerXP,R.PLAYER_MAX_XP)):R.threshold(oldShown);
 s.progression={version:2,specialization:BondContent.CLASSES.includes(raw.progression?.specialization)?raw.progression.specialization:null,
  treeGrandfathered:raw.progression?.treeGrandfathered===true||!currentProgression&&seeds.some(m=>m?.growth&&BondGrowth.used(m.growth)>0)};
 s.inventory={};
 for(const k of Object.keys(W.ITEMS))if(!k.startsWith('echo:')&&integer(raw.inventory?.[k]))s.inventory[k]=integer(raw.inventory[k]);
 BondEquipment.clean(s,raw);
 s.coins=integer(raw.coins);s.sequence=integer(raw.sequence);s.revision=integer(raw.revision);
 s.formation=BondFormation.clean(raw.formation);s.bossLevel=Number.isInteger(raw.bossLevel)&&raw.bossLevel>=1&&raw.bossLevel<=100?raw.bossLevel:1;
 s.attributes=R.cleanAttributes(raw.attributes,R.trainerLevel(s));
 s.defeated=[...new Set((Array.isArray(raw.defeated)?raw.defeated:[]).filter(k=>Object.hasOwn(W.NPCS,k)))];
 s.sights=[...new Set((Array.isArray(raw.sights)?raw.sights:[]).filter(id=>A.maps.some(m=>m.landmarks.some(l=>l.id===id))))];
 s.collected=[...new Set((Array.isArray(raw.collected)?raw.collected:[]).filter(k=>A.get(k)||A.REGIONS.some(r=>r.id===k)))];
 let refunded=0;for(const type of BondContent.TRAINERS){s.growth[type]=BondGrowth.clean(type,raw.growth?.[type],BondGrowth.budget(s,type));refunded+=Math.max(0,BondGrowth.used(raw.growth?.[type])-BondGrowth.used(s.growth[type]));}
 for(const mon of s.companions){const ranks=BondGrowth.clean(mon.type,mon.growth,BondGrowth.budget(s,mon.id));refunded+=Math.max(0,BondGrowth.used(mon.growth)-BondGrowth.used(ranks));mon.growth=ranks;}
 const requested=raw.version>=6?raw.map:(A.REGIONS.some(r=>r.id===raw.area)?raw.area:'clearing')+'-0';
 // Preserve the location of existing/debug saves. Player-facing routes still use
 // Atlas.unlocked and cannot leave Firstlight before the Mage trial.
 s.map=A.get(requested)?requested:'clearing-0';s.area=A.get(s.map).region;
 s.position=raw.version>=6?A.clamp(s.map,raw.position):{...A.get(s.map).entry};
 if(A.collision(s.map,s.position))s.position=A.safePoint?A.safePoint(s.map,s.position):{...A.get(s.map).entry};
 s.visited=[...new Set(['clearing-0',s.map,...(Array.isArray(raw.visited)?raw.visited:[]).filter(id=>A.get(id))])];
 s.prepared=raw.prepared===true&&!!s.inventory.biscuit;s.boost=raw.boost===true&&!!s.inventory.battlefood;
 if(raw.version>=6){
  for(const type of C.MONSTERS){
   const entries=Array.isArray(raw.echoes?.[type])?raw.echoes[type]:[];
   s.echoes[type]=entries.filter(e=>typeof e.id==='string'&&e.id.length<180&&Number.isInteger(e.level)&&e.level>=1&&e.level<=100&&A.get(e.map)).map(e=>({id:e.id,level:e.level,map:e.map}));
   if(s.echoes[type].length)s.inventory[E.key(type)]=s.echoes[type].length;
  }
  const ids=new Set(A.maps.flatMap(m=>m.habitats.flatMap(Q.keys)));
  for(const [id,sp] of Object.entries(raw.spawns||{}))if(ids.has(id)&&Number.isSafeInteger(sp.life)&&sp.life>0&&Number.isFinite(sp.readyAt)&&Number.isInteger(sp.roll)&&sp.roll>=0&&sp.roll<10000){
   s.spawns[id]={life:sp.life,readyAt:Math.max(0,sp.readyAt),present:sp.present===true,roll:sp.roll,seed:integer(sp.seed,4294967295),empty:sp.empty===true,activeSlot:sp.activeSlot===true,locationRevision:sp.locationRevision===Q.REVISION?Q.REVISION:0,
    ...(Number.isFinite(sp.x)&&Number.isFinite(sp.y)?{x:sp.x,y:sp.y}:{})};
  }
  for(const [id,c] of Object.entries(raw.claims||{}))if(typeof id==='string'&&id.length<200&&c&&C.MONSTERS.includes(c.type)&&A.get(c.map)&&Number.isInteger(c.level)){
   s.claims[id]={type:c.type,map:c.map,level:Math.max(1,Math.min(100,c.level)),coins:integer(c.coins),xp:integer(c.xp),trainerXP:integer(c.trainerXP,R.PLAYER_MAX_XP),echo:c.echo===true,loot:Object.fromEntries(Object.entries(c.loot||{}).filter(([k,n])=>Object.hasOwn(W.ITEMS,k)&&!k.startsWith('echo:')&&integer(n))),at:integer(c.at,9007199254740991)};
  }
  for(const [id,receipt] of Object.entries(raw.summons||{})){
   const type=typeof receipt==='string'?receipt:receipt?.type,instanceId=typeof receipt==='string'?'legacy:'+type:receipt?.instanceId;
   if(id.length<200&&s.companions.some(m=>m.id===instanceId&&m.type===type))s.summons[id]={type,instanceId};
  }
  s.tutorial={moved:raw.tutorial?.moved===true,kills:integer(raw.tutorial?.kills),summons:integer(raw.tutorial?.summons)};
  const capNotice=cappedCompanions?'Launch cap applied: '+cappedCompanions+' companion'+(cappedCompanions===1?' was':'s were')+' reduced to Lv 60. Previous excess XP is preserved separately for a future progression review.':null;
  s.migration=isV7?(typeof raw.migration==='string'?raw.migration:null):'Your existing companions are now individuals with separate levels, skills and trees. Older profile/build saves are untouched. '+refunded+' invalid/excess tree ranks refunded.';
  if(capNotice&&!s.migration)s.migration=capNotice;else if(capNotice&&!s.migration.includes('Launch cap applied'))s.migration+=' '+capNotice;
 }else s.migration='Your earlier companions, items, coins and builds were retained. The original save is untouched. A new world awaits; '+refunded+' out-of-budget tree ranks were removed from this migrated copy.';
 s.encounterReceipts=Object.fromEntries(Object.entries(raw.encounterReceipts||{}).filter(([id,v])=>id.length<220&&v&&Number.isInteger(v.coins)&&v.coins>=0));
 const saved=raw.encounterSave;
 if(saved&&saved.encounter&&A.get(saved.encounter.map)&&typeof saved.id==='string'&&saved.id.length<220&&(!saved.build||BondGame.validBuild(saved.build))&&Number.isInteger(saved.tick)&&saved.tick>=0&&saved.tick<=1500){s.encounterSave=clone(saved);s.encounterSave.options||={};s.encounterSave.options.classTrees??=0;s.encounterSave.options.apprenticeTrees??=0;s.encounterSave.options.monsterRules??=0;s.encounterSave.options.equipmentRules??=0;s.encounterSave.options.profile||={};if(!Number.isSafeInteger(s.encounterSave.options.profile.trainerXP))s.encounterSave.options.profile.trainerXP=s.trainerXP;}
 for(const m of A.maps)for(const h of m.habitats){
  const selected=new Set(Q.selected(h,s.spawns,s.encounterSave?.encounter?.enemies));
  for(const id of Q.keys(h))if(s.spawns[id])s.spawns[id].activeSlot=selected.has(id);
 }
 s.vitality=T.clean(s,raw.vitality);s.haven=BondHaven.clean(raw.haven,s);s.farm=BondFarm.clean(raw.farm,s);
 if(A.get(s.map).kind==='hub'&&!s.encounterSave)healArrival(s);
 if(!raw.farm&&raw.haven&&(s.haven.slots.some(Boolean)||s.haven.companions.some(Boolean)))s.farm.owned=true;
 summarize(s);return s;
}
let state=fresh(),persistent=true,lastError='';
try{const suffix=TEST?'-sandbox':'';const saved=localStorage.getItem(KEY)||localStorage.getItem('bond-bolt-profile-v6'+suffix)||(!TEST&&(localStorage.getItem('bond-bolt-profile-v5')||localStorage.getItem('bond-bolt-profile-v4')));if(saved)state=normalize(JSON.parse(saved));}catch(_){persistent=false;}
function sync(){if(!persistent)return;try{const raw=JSON.parse(localStorage.getItem(KEY));if(raw?.version===7&&raw.revision>state.revision)state=normalize(raw);}catch(_){}}
function notify(growth=false){if(typeof document==='undefined')return;document.dispatchEvent(new CustomEvent('bond-profile'));if(growth)document.dispatchEvent(new CustomEvent('bond-growth'));}
function commit(fn,{growth=false,quiet=false,critical=false}={}){
 sync();const next=clone(state);const farmChanged=BondFarm.advance(next,Date.now());const result=fn(next);if(result===false||result===null)return result;
 root.BondCampaign?.reconcile(next);summarize(next);next.revision=state.revision+1;
 try{localStorage.setItem(KEY,JSON.stringify(next));persistent=true;lastError='';}
 catch(_){if((critical||farmChanged)&&persistent){lastError='Could not save this change. Your items were kept. Free browser storage and retry.';if(!quiet)notify();return false;}persistent=false;lastError='Session only: browser storage is unavailable. Export your progress before closing.';}
 state=next;if(!quiet)notify(growth);return result===undefined?true:result;
}
const add=(s,id,n=1)=>{s.inventory[id]=integer((s.inventory[id]||0)+n);};
const grantXP=(s,ids,n)=>{for(const id of new Set(ids)){const mon=resolve(s,id);if(mon)mon.xp=R.clampPlayerXP(mon.xp+n);}};
const grantTrainerXP=(s,n)=>{s.trainerXP=R.clampPlayerXP((s.trainerXP||0)+integer(n,R.PLAYER_MAX_XP));};
const allHabitats=A.maps.flatMap(m=>m.habitats),habitat=id=>allHabitats.find(h=>id.startsWith(h.id+':'));
function population(mapId=state.map,now=Date.now()){
 sync();const m=A.get(mapId);if(!m||!A.unlocked(state,mapId))return [];
 let change=false;const next=clone(state),reserved=next.encounterSave?.encounter?.enemies||[];
 const selection=m.habitats.flatMap(h=>Q.selected(h,next.spawns,reserved).map(id=>({id,h})));
 const occupied=selection.map(({id})=>next.spawns[id]).filter(sp=>sp?.present&&sp.locationRevision===Q.REVISION&&Number.isFinite(sp.x));
 for(const {id,h} of selection){
  const old=next.spawns[id],held=reserved.some(e=>e.spawnId===id);
  if(old&&!old.activeSlot){old.activeSlot=true;change=true;}
  if((!old||(!old.present&&now>=old.readyAt))&&!held){
   const seed=(E.roll()*429496+E.roll())>>>0;
   const point=Q.position(m,id,seed,occupied,Number.isFinite(old?.x)?old:null,!old&&C.UNITS[h.type].starter&&id.endsWith(':0'));
   if(!point)continue;
   next.spawns[id]={life:(old?.life||0)+1,readyAt:0,present:true,empty:false,activeSlot:true,locationRevision:Q.REVISION,roll:E.roll(),seed,...point};occupied.push(point);change=true;
  }else if(old?.present&&!held&&(old.locationRevision!==Q.REVISION||!Number.isFinite(old.x)||A.collision(m.id,old,55)||BondWorldLayout.waterAt(m,old)||!BondOpening.groundAllowed(m.id,id,old))){
   const point=Q.position(m,id,old.seed,occupied);
   if(point){Object.assign(old,point,{locationRevision:Q.REVISION});occupied.push(point);change=true;}
  }
 }
 if(change)commit(s=>{s.spawns=next.spawns;},{quiet:true,critical:true});
 return selection.map(({id,h})=>({id,type:h.type,habitat:h,...state.spawns[id]})).filter(o=>o.life&&Number.isFinite(o.x));
}
function hunt(id){
 sync();const sp=state.spawns[id],h=habitat(id);if(!sp?.present||!sp.activeSlot||!h||h.map!==state.map)return null;
 const u=C.UNITS[h.type],key='hunt:'+id+':'+sp.life;
 
 return {id:key,spawnId:id,life:sp.life,type:h.type,area:A.get(h.map).region,map:h.map,kind:'wild',name:u.name,title:'Wild '+u.role,rarity:h.rarity,echoBP:h.echoBP,
  level:h.level,seed:sp.seed,catchable:false,enemies:[{type:h.type,skills:[...u.default],spawnId:id,life:sp.life,level:h.level,...T.wild(h.type)}]};
}
const active=new Map();
function encounter(id){
 if(state.encounterSave?.id===id)return clone(state.encounterSave.encounter);
 if(active.has(id))return clone(active.get(id));
 if(id?.startsWith('hunt:')){for(const [sp,entry] of Object.entries(state.spawns)){if('hunt:'+sp+':'+entry.life===id){const e=hunt(sp);if(e){active.set(id,e);return clone(e);}return null;}}return null;}
 return W.NPCS[id]?clone(W.NPCS[id]):null;
}
function beginHunt(id){const e=hunt(id);if(!e)return null;if(state.encounterSave&&state.encounterSave.id!==e.id)return null;active.set(e.id,e);return e;}
function beginPack(id){
 const p=root.BondCampaign?.packs.find(p=>p.id===id&&p.map===state.map);if(!p||state.encounterSave)return null;
 const members=population(p.map).filter(x=>x.present&&['Common','Uncommon'].includes(x.habitat.rarity)).slice(0,p.count);
 if(members.length<2)return null;
 const enemies=members.map(x=>{const h=hunt(x.id).enemies[0];return {...h,hp:Math.round(C.UNITS[h.type].hp*.38),power:Math.round(C.UNITS[h.type].power*.4),skillScale:.4,passive:null};});
 const key=id+':'+A.hash(members.map(x=>x.id+':'+x.life).join('|')),e={id:key,packId:id,kind:'pack',map:p.map,area:p.region,name:p.name,title:'Resident pack · '+enemies.length+' foes',level:Math.max(...enemies.map(x=>x.level)),seed:members.reduce((n,x)=>(n^x.seed)>>>0,16),enemies,advice:p.lesson,greeting:p.lesson+''};
 active.set(key,e);return clone(e);
}
function validEncounter(id){sync();const e=encounter(id);return !!e&&(!W.NPCS[id]||e.practice||!state.defeated.includes(id)||state.encounterSave?.id===id)&&(!state.encounterSave||state.encounterSave.id===id)&&(!e.enemies?.some(u=>u.spawnId)||e.enemies.filter(u=>u.spawnId).every(u=>(state.spawns[u.spawnId]?.life===u.life&&state.spawns[u.spawnId]?.present)||(state.encounterSave?.id===id&&state.claims[u.spawnId+':'+u.life])));}
function reserveBattle(b,id,options){
 if(!id)return !state.encounterSave;
 if(b.adventure&&!state.encounterSave&&T.readiness(state,b.build[0]))return false;
 const e=encounter(id);if(!e||!validEncounter(id))return false;
 if(BondCampaign.requirement(e,state,b.build[0]))return false;
 if(state.encounterSave?.id===id){b._attemptId=state.encounterSave.attempt;return true;}
 const profile=clone(options.profile);delete profile.encounterSave;delete profile.encounterReceipts;delete profile.claims;delete profile.spawns;
 const saved={id,attempt:'attempt:'+(state.sequence+1),encounter:e,build:clone(b.build),options:{...clone(options),profile,classTrees:b.classTrees,apprenticeTrees:b.apprenticeTrees,monsterRules:b.monsterRules,equipmentRules:b.equipmentRules},tick:0,supply:null,joins:[],anchor:clone(options.worldAnchor||{map:state.map,position:state.position,actors:[]})};
 const ok=commit(s=>{if(s.encounterSave)return false;s.sequence++;s.encounterSave=saved;return true;},{critical:true});
 if(ok)b._attemptId=saved.attempt;return ok;
}
function checkpoint(b){if(!b?._attemptId||state.encounterSave?.attempt!==b._attemptId)return false;return commit(s=>{s.encounterSave.tick=b.tick;s.encounterSave.supply=b._supplyReceipt||null;T.record(s,b);},{quiet:true,critical:true});}
function requestEscape(b){
 if(!b||b.rescue||b.ended||b.escape||!(b.trainer(0)?.hp>0))return false;
 if(!b._attemptId)return !state.encounterSave&&b.requestEscape();
 if(state.encounterSave?.attempt!==b._attemptId||state.encounterSave.escape)return false;
 const ok=commit(s=>{const saved=s.encounterSave;saved.escape={tick:b.tick,joins:(saved.joins||[]).length};saved.tick=b.tick;saved.supply=b._supplyReceipt||null;T.record(s,b);return true;},{critical:true});
 return !!ok&&b.requestEscape();
}
function restoreBattle(id){
 const saved=state.encounterSave;if(!saved?.build||saved.id!==id)return null;
 const b=new BondGame.Battle(saved.build,saved.options);b._attemptId=saved.attempt;b._supplyReceipt=saved.supply;
 if(saved.supply?.biscuit)b.shield(b.trainer(0),b.trainer(0),80,10,'Bond Biscuit');
 if(saved.supply?.ration)for(const u of b.team(0)){u.hp=Math.round(u.hp*1.1);u.maxHp=Math.round(u.maxHp*1.1);}
 let joined=0;
 for(let t=0;t<=saved.tick&&!b.ended;t++){
  if(saved.escape?.tick===t&&saved.escape.joins===joined)b.requestEscape();
  for(const j of saved.joins||[])if(j.tick===t){b.addEnemy(j.entry);joined++;if(saved.escape?.tick===t&&saved.escape.joins===joined)b.requestEscape();}
  if(t<saved.tick)b.step();
 }
 return b;
}
function joinBattle(b,spawnId,position){
 const saved=state.encounterSave,e=hunt(spawnId);
 if(!b||b.ended||!saved||saved.attempt!==b._attemptId||!e||e.map!==saved.encounter.map||
   saved.encounter.enemies?.some(u=>u.spawnId===spawnId&&u.life===e.life))return false;
 const entry=clone(e.enemies[0]);
 const ok=commit(s=>{
  s.encounterSave.joins||=[];s.encounterSave.joins.push({tick:b.tick,entry});
  s.encounterSave.encounter.enemies||=[];s.encounterSave.encounter.enemies.push(entry);
  s.encounterSave.anchor||={map:s.map,position:clone(s.position),actors:[]};
  s.encounterSave.anchor.actors.push({id:spawnId,...A.clamp(s.map,position)});
  s.encounterSave.tick=b.tick;s.encounterSave.supply=b._supplyReceipt||null;T.record(s,b);return true;
 },{critical:true});
 if(!ok)return false;
 active.set(saved.id,clone(state.encounterSave.encounter));return b.addEnemy(entry);
}
function abandonBattle(){return commit(s=>{s.encounterSave=null;return true;},{critical:true});}
function settleKills(b,id){
 const e=encounter(id);if(!e?.enemies?.some(u=>u.spawnId)||!b||e.practice)return [];
 const killed=b.units.filter(u=>u.side===1&&u.hp<=0&&u.spawnId);
 if(!killed.length)return [];
 const fresh=killed.filter(u=>e.enemies.some(v=>v.spawnId===u.spawnId&&v.life===u.life&&v.type===u.type)&&!state.claims[u.spawnId+':'+u.life]);if(!fresh.length)return [];
 return commit(s=>{
  const rewards=[];
  for(const u of fresh){
   const sp=s.spawns[u.spawnId],h=habitat(u.spawnId),claim=u.spawnId+':'+u.life;
   if(!sp?.present||sp.life!==u.life||!h||s.claims[claim])continue;
   const source=e.enemies.find(v=>v.spawnId===u.spawnId&&v.life===u.life),level=source.level||h.level,map=e.map||h.map;
   const r={type:u.type,map,level,coins:6+Math.floor(level/3),xp:T.xp(level),echo:E.qualifies(sp.roll,h.echoBP),loot:{...BondOpening.loot(u.type,map,sp.seed),...(b.equipmentRules?BondEquipment.loot(u.type,sp.seed):{})},at:Date.now()};
   const progress=BondCampaign.wildProgress(s,{spawnId:u.spawnId,type:u.type,map,claim,xp:r.xp});r.trainerXP=progress.trainerXP;r.echo||=progress.forceEcho;grantTrainerXP(s,r.trainerXP);
   if(r.echo){s.echoes[u.type]||=[];s.echoes[u.type].push({id:claim,level,map});s.inventory[E.key(u.type)]=s.echoes[u.type].length;}
   for(const [key,n] of Object.entries(r.loot))add(s,key,n);
   s.coins=integer(s.coins+r.coins);grantXP(s,b.build[0].slice(1).filter(Boolean).map(x=>x.instanceId),r.xp);
   s.claims[claim]=r;s.tutorial.kills++;sp.present=false;sp.readyAt=Date.now()+h.respawnSeconds*1000;
   rewards.push(r);
  }
  return rewards;
 },{critical:true})||[];
}
const completeReceipts=new WeakMap();
function complete(b,id){
 if(!b?.ended)return null;
 settleKills(b,id);if(completeReceipts.has(b))return completeReceipts.get(b);
 const e=encounter(id);if(!e)return null;
 if(BondRaidRules.applies(e)&&(!b.rescue||!b._attemptId||b.winner!==0))return null;
 let result={coins:0,xp:0,trainerXP:0,loot:{},echo:false,kills:0,type:e.type,local:true,...(b.escaped?{escaped:true}:{})};
 const npcReward={coins:0,xp:0,trainerXP:0,loot:{}};
 if(b._attemptId&&state.encounterReceipts[b._attemptId])return clone(state.encounterReceipts[b._attemptId]);
 if(e.enemies?.some(u=>u.spawnId)){
  for(const u of e.enemies.filter(u=>u.spawnId)){
   const r=state.claims[u.spawnId+':'+u.life];
   if(r){result.coins+=r.coins;result.xp+=r.xp;result.trainerXP+=r.trainerXP||0;result.kills++;result.echo||=r.echo;for(const [key,n] of Object.entries(r.loot||{}))result.loot[key]=(result.loot[key]||0)+n;if(r.echo)result.loot[E.key(r.type)]=(result.loot[E.key(r.type)]||0)+1;}
   else if(b.units.some(v=>v.spawnId===u.spawnId&&v.life===u.life&&v.hp<=0))return {...result,pending:true,error:lastError||'Reward save pending. Retry before leaving.'};
  }
 }
 if(b.winner===0&&W.NPCS[id]&&!e.practice){
  const first=!state.defeated.includes(id);
   if(first&&!e.noReward){
   npcReward.coins=first?e.coins||0:e.repeatCoins||0;npcReward.xp=first?e.xp||150:e.repeatXP||0;
   npcReward.trainerXP=first?(e.trialClass&&state.journey.early.trialRewarded?0:e.trainerXP??e.xp??150):0;
   if(first){npcReward.loot.biscuit=1;if(e.badge)npcReward.loot[e.badge]=1;}
   for(const enemy of b.units.filter(u=>u.side===1&&u.hp<=0&&!u.spawnId&&!u.temporary&&C.MONSTERS.includes(u.type))){for(const [key,n] of Object.entries(b.equipmentRules?BondEquipment.loot(enemy.type,id+':'+b.seed+':'+enemy.id):{}))npcReward.loot[key]=(npcReward.loot[key]||0)+n;}
   result.coins+=npcReward.coins;result.xp+=npcReward.xp;result.trainerXP+=npcReward.trainerXP;
   for(const [key,n] of Object.entries(npcReward.loot))result.loot[key]=(result.loot[key]||0)+n;
  }
 }
 if(!e.practice){
  const accepted=commit(s=>{
   if(b._attemptId&&s.encounterReceipts[b._attemptId])return false;
   if(W.NPCS[id]&&b.winner===0){
    s.coins=integer(s.coins+npcReward.coins);grantTrainerXP(s,npcReward.trainerXP);grantXP(s,b.build[0].slice(1).filter(Boolean).map(x=>x.instanceId),npcReward.xp);
    for(const [key,n] of Object.entries(npcReward.loot))add(s,key,n);
    if(!s.defeated.includes(id))s.defeated.push(id);
    if(e.authored||e.earlyKey||e.trialClass)s.journey.wins[id]=++s.journey.sequence;
    BondCampaign.recordWin(s,e);
   }
   T.record(s,b);
   if(b.rescue&&b.winner===0){healArrival(s);result.masterRescue=true;}
   if(b.adventure&&b.winner!==0&&!b.escaped){if(e.map===BondOpening.start.map){s.map=BondOpening.start.map;s.area=A.get(s.map).region;s.position={...BondOpening.start.position};s.vitality={trainer:10000,companions:Object.fromEntries(s.companions.map(m=>[m.id,10000]))};result.campRecovery=true;}else{const town=A.get(e.area+'-hub')||A.get(A.get(s.map).region+'-hub');s.map=town.id;s.area=town.region;s.position={...town.entry};healArrival(s);if(!s.visited.includes(town.id))s.visited.push(town.id);}result.rescued=true;}
   if(e.packId&&b.winner===0)s.journey.packs[e.packId]=++s.journey.sequence;
   if(b._attemptId)s.encounterReceipts[b._attemptId]=clone(result);
   if(s.encounterSave?.id===id)s.encounterSave=null;
   return true;
  },{critical:true});
  if(!accepted&&!state.encounterReceipts[b._attemptId])return {...result,pending:true,error:lastError};
 }else if(state.encounterSave?.id===id)abandonBattle();
 completeReceipts.set(b,result);return result;
}
function summon(type,trainerClass='druid',requestId){
 if(!C.MONSTERS.includes(type)||!BondContent.TRAINERS.includes(trainerClass))return false;
 return commit(s=>{
  const previous=requestId?s.summons[requestId]:null;
  if(previous?.type===type)return {ok:true,repeated:true,type,instanceId:previous.instanceId,id:requestId};
  if(s.companions.some(m=>m.type===type))return false;
  const echoIndex=requestId?(s.echoes[type]||[]).findIndex(e=>e.id===requestId):0;
  const echo=s.echoes[type]?.[echoIndex];if(!echo)return false;
  let instanceId;do{instanceId='companion:'+(++s.sequence);}while(resolve(s,instanceId));
  const ordinal=1+s.companions.filter(m=>m.type===type).length;
  const ownedLevel=Math.min(R.PLAYER_LEVEL_CAP,echo.level);
  s.companions.push({id:instanceId,type,ordinal,xp:R.threshold(ownedLevel),deferredXP:0,sourceLevel:echo.level,heldItem:null,movesVersion:1,taughtMoves:[],legacyMoves:[],moveLevel:ownedLevel,skills:BondCompanionMoves.initial(type),growth:{},pact:{map:echo.map,trainerClass}});
  s.echoes[type].splice(echoIndex,1);s.inventory[E.key(type)]=s.echoes[type].length;
  s.summons[echo.id]={type,instanceId};s.tutorial.summons++;BondCampaign.recordSummon(s);
  return {ok:true,type,instanceId,id:echo.id,level:ownedLevel,sourceLevel:echo.level};
 },{critical:true,growth:true});
}
function healArrival(s){s.vitality={trainer:10000,companions:Object.fromEntries(s.companions.map(m=>[m.id,10000]))};}
function arrive(s,map,p){const next=A.clamp(map,p);if(A.collision(map,next))return false;const changed=s.map!==map;s.map=map;s.area=A.get(map).region;s.position=next;if(!s.visited.includes(map))s.visited.push(map);if(changed&&A.get(map).kind==='hub')healArrival(s);return true;}
function moveTo(map,p,bypassGate=false){return commit(s=>{if(!A.get(map)||s.encounterSave&&map!==s.map||!bypassGate&&!A.unlocked(s,map))return false;return arrive(s,map,p);},{critical:true});}
function teleport(map){return commit(s=>{if(!BondCities.destinations(s).includes(map))return false;const city=A.get(map),p=A.safePoint(map,{x:city.teleport.x,y:city.teleport.y+110});return arrive(s,map,p);},{critical:true});}
function transition(id,position){return commit(s=>{const m=A.get(s.map),g=m.neighbors.find(g=>g.id===id),p=position||s.position;if(!g||s.encounterSave||!Number.isFinite(p.x)||!Number.isFinite(p.y)||A.collision(m.id,p)||Math.hypot(p.x-g.x,p.y-g.y)>135||!A.unlocked(s,g.to))return false;if(position)s.tutorial.moved=true;return arrive(s,g.to,g.arrival);},{critical:true});}
function consumePrepared(b){
 if(b._supplyReceipt)return b._supplyReceipt;
 const receipt=commit(s=>{const out={biscuit:!!(s.prepared&&s.inventory.biscuit),ration:!!(s.boost&&s.inventory.battlefood)};if(out.biscuit)s.inventory.biscuit--;if(out.ration)s.inventory.battlefood--;s.prepared=false;s.boost=false;if(s.encounterSave)s.encounterSave.supply=out;return out;},{critical:true});
 if(receipt)b._supplyReceipt=receipt;return receipt;
}
function nearService(s,kind){const p=T.service(A.get(s.map),kind);return !!p&&Math.hypot(s.position.x-p.x,s.position.y-p.y)<=150;}
function activeCompanions(s=state){
 try{const build=BondGame.migrateBuild(JSON.parse(localStorage.getItem(BUILD_KEY)));return [...new Set((build?.[0]||[]).slice(1).filter(u=>u&&resolve(s,u.instanceId)?.type===u.type).map(u=>u.instanceId))];}catch(_){return [];}
}
root.BondProfile={
 activeCompanions:()=>{sync();return activeCompanions();},
 teachMove(npc,id,skill){return commit(s=>{const m=resolve(s,id);if(!m||!BondCities.service(s,npc,'moves')||!activeCompanions(s).includes(id)||!BondCompanionMoves.general.includes(skill)||BondCompanionMoves.learned(m).includes(skill))return false;m.taughtMoves.push(skill);return {ok:true,skill};},{critical:true,growth:true});},
 resetCompanionTalents(npc,id){return commit(s=>{const m=resolve(s,id);if(!m||!BondCities.service(s,npc,'talents')||!BondGrowth.used(m.growth))return false;const echoes=s.echoes[m.type]||[],echo=[...echoes].sort((a,b)=>a.level-b.level||a.id.localeCompare(b.id))[0];if(!echo)return false;echoes.splice(echoes.findIndex(e=>e.id===echo.id),1);s.inventory[E.key(m.type)]=echoes.length;m.growth={};return {ok:true,echo:echo.id};},{critical:true,growth:true});},
 KEY,BUILD_KEY,TEST,fresh,normalize,snapshot:()=>{sync();return clone(state);},persistent:()=>persistent,error:()=>lastError,owns:t=>state.owned.includes(t),getCompanion:id=>{sync();const m=resolve(state,id);return m?clone(m):null;},companions:type=>{sync();return clone(state.companions.filter(m=>!type||m.type===type));},label:m=>m?C.UNITS[m.type].name:'Empty slot',
 createCharacter(raw){const c=BondOpening.character(raw);if(!c||c.legacy)return false;return commit(s=>{if(s.character||s.encounterSave||s.companions.length||s.tutorial.kills||s.coins)return false;s.character=c;s.attributes=BondOpening.attributes(c.weapon);s.map=BondOpening.start.map;s.area=A.get(s.map).region;s.position=A.safePoint(s.map,BondOpening.start.position);s.visited=[s.map];s.inventory={leafdraught:2};s.growth.apprentice={};return true;},{critical:true,growth:true});},
 nameCharacter(value){const name=BondOpening.name(value);if(!BondOpening.validName(name)||name.toLocaleLowerCase()==='apprentice')return false;return commit(s=>{if(!s.character||!BondOpening.needsIdentity(s.character))return false;s.character=s.character.legacy?{legacy:true,name}:{...s.character,name};return true;},{critical:true});},
 canSpecialize(type){sync();const e=state.journey.early;return BondContent.CLASSES.includes(type)&&!state.progression.specialization&&R.trainerLevel(state)>=20&&e?.tidecrown===true&&e.demonstrations.length===4&&e.trials[type]===true;},
 specialize(type){if(!this.canSpecialize(type))return false;return commit(s=>{if(s.progression.specialization)return false;s.progression.specialization=type;s.attributes=R.cleanAttributes(null,R.trainerLevel(s));s.growth[type]||={};s.journey.relic={stage:'raid',autostart:true};healArrival(s);return {ok:true,type};},{critical:true,growth:true});},
 requirement(id,party){const e=encounter(id);return e?BondCampaign.requirement(e,state,party):'Encounter unavailable.';},
 setSkills(id,skills){return commit(s=>{const m=resolve(s,id);if(!m||!BondCompanionMoves.validLoadout(m,skills))return false;m.skills=[...skills];BondCampaign.recordAbility(s,m);},{critical:true,growth:true});},
 migrateParty(team){return team.map((u,slot)=>{if(!slot&&state.character&&!state.character.legacy){const start=BondOpening.build(state.character,state.progression.specialization);if(u?.type===start.type&&(!start.weapon||u.weapon===start.weapon)&&validSkills(start.type,u.skills))start.skills=[...u.skills];return start;}if(!u||!slot)return u;const m=resolve(state,u.instanceId)||(!u.instanceId?state.companions.find(m=>m.type===u.type):null);if(!m||m.type!==u.type)return null;if(!u.instanceId&&validSkills(m.type,u.skills)&&(m.legacyMoves.length||BondCompanionMoves.validLoadout(m,u.skills)))commit(s=>{const saved=resolve(s,m.id);if(saved.legacyMoves.length)saved.legacyMoves=[...new Set([...saved.legacyMoves,...u.skills])];saved.skills=[...u.skills];},{quiet:true,critical:true});return {type:m.type,instanceId:m.id,skills:[...resolve(state,m.id).skills]};});},
 relicAction(id,action,party){return commit(s=>BondRelicQuest.command(s,id,action,party),{critical:true});},
 encounter,beginHunt,beginPack,hunt,validEncounter,population,settleKills,complete,summon,consumePrepared,transition,teleport,reserveBattle,checkpoint,restoreBattle,abandonBattle,joinBattle,requestEscape,
  talkKeeper(map){return commit(s=>{const m=A.get(map);if(map!==s.map||Math.hypot(s.position.x-m.guide.x,s.position.y-m.guide.y)>150)return false;s.journey.talks[map]=++s.journey.sequence;return true;},{critical:true});},
  meetOpeningMage(){return commit(s=>{if(s.map!=='clearing-0'||!s.journey?.early?.firstSummon)return false;BondCampaign.recordMageMeeting(s);return true;},{critical:true});},
 claimChallenge(id){const c=root.BondCampaign?.challenges.find(c=>c.id===id);return commit(s=>{if(!c||s.journey.challenges.includes(id)||BondCampaign.challengeCount(s,c)<c.count)return false;s.journey.challenges.push(id);s.coins+=c.coins;add(s,c.item);return true;},{critical:true});},
 ticket:id=>{const e=encounter(id);return e?.spawnId?{id:e.life,seed:e.seed}:null;},
 setFormation(slot,rank){return commit(s=>{const next=BondFormation.assign(s.formation,slot,rank);if(!next)return false;s.formation=next;},{growth:true});},
 setBossLevel(level){return commit(s=>{if(!Number.isInteger(level)||level<1||level>100)return false;s.bossLevel=level;});},
  position(p){return commit(s=>{const next=A.clamp(s.map,p);if(A.collision(s.map,next))return false;s.position=next;s.tutorial.moved=true;},{quiet:true});},
  // Direct travel is a local diagnostic/fixture command. Gameplay uses physical
  // transition gates and BondRegion.travelTo, both of which enforce unlocks.
  travel(id,p){const map=A.get(id)?id:id+'-0';return moveTo(map,p||A.get(map)?.entry,true);},
 discover(id){return commit(s=>{if(!A.get(s.map).landmarks.some(l=>l.id===id)||s.sights.includes(id))return false;s.sights.push(id);},{critical:true});},
 collect(map){return commit(s=>{if(map!==s.map||s.collected.includes(map))return false;s.collected.push(map);s.coins=integer(s.coins+12);add(s,'biscuit');add(s,W.SCENES.find(x=>x.id===s.area)?.item||'ashglass');},{critical:true});},
 prepare(){return commit(s=>{if(!s.inventory.biscuit||s.prepared)return false;s.prepared=true;});},
 unprepare(){return commit(s=>{s.prepared=false;});},
 prepareBoost(){return commit(s=>{if(!s.inventory.battlefood||s.boost)return false;s.boost=true;});},
 feed(id){return commit(s=>{const m=resolve(s,id);if(!m||!s.inventory.trailfood||R.monLevel(s,id)>=R.PLAYER_LEVEL_CAP)return false;s.inventory.trailfood--;grantXP(s,[id],120);},{critical:true,growth:true});},
 buy(id){const price=T.prices[id];return commit(s=>{if(!price||s.coins<price||s.encounterSave||!nearService(s,'shop'))return false;s.coins-=price;add(s,id);return true;},{critical:true});},
 recover(id,target){return commit(s=>{const item=T.items[id];if(!item||s.encounterSave||!s.inventory[id]||(target!=='trainer'&&!resolve(s,target)))return false;const hp=T.health(s,target);if(item.revive?hp!==0:hp===0||hp===10000)return false;T.setHealth(s,target,item.revive||Math.min(10000,hp+T.recovery(s,target,item)));s.inventory[id]--;return true;},{critical:true});},
 rest(){return commit(s=>{if(s.encounterSave||!nearService(s,'sanctuary'))return false;s.vitality={trainer:10000,companions:Object.fromEntries(s.companions.map(m=>[m.id,10000]))};if(A.get(s.map).kind==='hub'){const sight=A.get(s.map).hero.id;if(!s.sights.includes(sight))s.sights.push(sight);}return true;},{critical:true});},
 canService:kind=>nearService(state,kind)&&!state.encounterSave,
 equip(ref,id,slot){return commit(s=>BondEquipment.command(s,ref,id,slot),{critical:true,growth:true});},
 allocate(k){return commit(s=>{const a=R.attributes(s);if(!R.ATTRS.includes(k)||a[k]>=99||R.statBudget(R.trainerLevel(s))-R.spent(a)<R.cost(a[k]))return false;a[k]++;s.attributes=a;},{growth:true});},
 resetAttributes(){return commit(s=>{s.attributes=R.cleanAttributes(null,1);},{growth:true});},
 learn(ref,id){return commit(s=>{
  const mon=resolve(s,ref),type=mon?.type||ref;if(!mon&&!BondContent.TRAINERS.includes(type))return false;
  if(!BondGrowth.unlocked(s,ref))return false;
  const n=BondGrowth.nodes(type).find(n=>n.id===id),r=mon?mon.growth:s.growth[type]||{};
  if(!n||(r[id]||0)>=n.max||BondGrowth.used(r)>=BondGrowth.budget(s,ref)||!BondGrowth.gate(type,id,r))return false;
  const next={...r,[id]:(r[id]||0)+1};if(mon)mon.growth=next;else s.growth[type]=next;
 },{critical:true,growth:true});},
 respec(ref){return commit(s=>{if(!BondGrowth.unlocked(s,ref))return false;const m=resolve(s,ref);if(m)return false;else{if(!BondContent.TRAINERS.includes(ref)||!BondGrowth.used(s.growth[ref]))return false;s.growth[ref]={};}},{critical:true,growth:true});},
 reset(){active.clear();return commit(s=>{for(const k of Object.keys(s))delete s[k];Object.assign(s,fresh());},{growth:true});},
 setHaven(layout){return commit(s=>{if(!BondHaven.valid(layout,s))return false;s.haven=clone(layout);return true;},{critical:true});},
 farmAction(action,value){return commit(s=>BondFarm.command(s,action,value,Math.max(Date.now(),s.farm.lastAt)),{critical:true,growth:true});},
 settleFarm(){sync();if(!state.farm.owned||Date.now()-state.farm.lastAt<60000)return false;return commit(()=>true,{critical:true,growth:true});},
 export:()=>{sync();return JSON.stringify(state,null,2);},
 startExpedition:()=>false,abandonExpedition:()=>false,scribe:()=>false,
 testing:TEST?{
  restart(){const result=commit(s=>{for(const k of Object.keys(s))delete s[k];Object.assign(s,fresh());},{quiet:true,critical:true});if(result){active.clear();notify(true);}return result;},
  heal(){return commit(s=>{if(!s.character||s.encounterSave)return false;s.vitality={trainer:10000,companions:Object.fromEntries(s.companions.map(m=>[m.id,10000]))};return true;},{critical:true});},
  grantEcho(type,level=1){if(!C.MONSTERS.includes(type)||!Number.isInteger(level)||level<1||level>100)return false;return commit(s=>{const id='test:'+type+':'+(++s.sequence);s.echoes[type]||=[];s.echoes[type].push({id,level,map:A.home(type)?.map||A.REGIONS[C.UNITS[type].region].id+'-0'});s.inventory[E.key(type)]=s.echoes[type].length;return id;},{critical:true});},
  grantItem(id,count=1){if(!BondEquipment.get(id)||!Number.isSafeInteger(count)||count<1||count>100)return false;return commit(s=>{add(s,id,count);return true;},{critical:true});},
  equipmentSamples(){return commit(s=>{if(!s.character)return false;for(const item of BondEquipment.list())s.inventory[item.id]=Math.max(s.inventory[item.id]||0,item.kind==='held'?2:1);return true;},{critical:true});},
  setXP(id,xp){return commit(s=>{const m=resolve(s,id);if(!m)return false;const engineXP=R.clampXP(xp);m.xp=R.clampPlayerXP(engineXP);m.deferredXP=Math.max(0,engineXP-R.PLAYER_MAX_XP);},{growth:true});},
  setTrainerXP(xp){return commit(s=>{s.trainerXP=R.clampPlayerXP(xp);},{growth:true});},
  setRoll(id,roll){return commit(s=>{if(!s.spawns[id]||!Number.isInteger(roll)||roll<0||roll>=10000)return false;s.spawns[id].roll=roll;});},
  replace(raw){active.clear();return commit(s=>{for(const k of Object.keys(s))delete s[k];Object.assign(s,normalize(raw));},{growth:true});}
 }:null
};
if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key===KEY){sync();notify();}});
commit(()=>true,{quiet:true});
})(globalThis);
