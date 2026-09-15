/* Post-ascension story rules. Commands operate only on a profile transaction draft. */
(function(root){
'use strict';
const C=BondContent,A=BondAtlas,W=BondWorld,GHOST='ochrewisp',TULLY='relic:tully';
const HUNTS=[{type:'copperhog',map:'hollow-0',count:2},{type:'sunscarab',map:'hollow-1',count:2},{type:'amberkite',map:'hollow-0',count:1}];
const WEAPONS={druid:['Warden\'s Branch','A living staff entrusted to you by the Druid Master.'],mage:['Emberglass Wand','A wand entrusted to you by the Mage Master.'],hunter:['Watchkeeper Bow','A bow entrusted to you by the Hunter Master.'],swordsman:['Oathkeeper Blade','A sword entrusted to you by the Swordsman Master.']};
for(const [type,[name,description]] of Object.entries(WEAPONS))W.ITEMS['weapon:class:'+type]={name,description,icon:type==='hunter'?'➶':type==='swordsman'?'⚔':'✦',category:'Weapons'};
const masterId=s=>'early:master:'+s.progression?.specialization;
const raidId=s=>'relic:raid:'+s.progression?.specialization;
for(const type of C.CLASSES){
 const master=W.NPCS['early:master:'+type],monsters=['copperhog','copperhog','cindermole','cindermole','cindrake','cindrake','ambercolossus'];
 W.NPCS['relic:raid:'+type]={id:'relic:raid:'+type,name:'Raid at the class courtyard',title:'Stand with your master',kind:'pack',scenario:BondRaidRules.SCENARIO,
  allyClass:type,level:60,seed:6070,protectedEncounter:true,autoReturn:true,noReward:true,map:master.map,area:master.area,x:master.x,y:master.y,
  enemies:monsters.map((id,i)=>({type:id,skills:[...C.UNITS[id].default],level:60,hp:i===6?2000:C.UNITS[id].hp,power:i===6?100:C.UNITS[id].power,boss:i===6,passive:C.UNITS[id].passive}))};
}
const top=A.get('ghost-tower-4');
const tully={id:TULLY,name:'Tully',appearance:'npc-captain',title:'Hero of the sacred watch',storyOnly:true,map:top.id,area:top.region,x:top.width/2,y:780};
W.NPCS[TULLY]=tully;
const fresh=()=>({stage:'raid',autostart:false});
function clean(raw){return {stage:['raid','aftermath','hunt','briefing','ghost','report','complete'].includes(raw?.stage)?raw.stage:'raid',autostart:raw?.autostart===true};}
const state=s=>clean(s.journey?.relic);
const active=s=>C.CLASSES.includes(s.progression?.specialization);
const ready=s=>HUNTS.every(h=>(s.echoes[h.type]||[]).length>=h.count);
function hasGhost(s,party){return Array.isArray(party)&&party.slice(1).some(u=>u?.type===GHOST&&s.companions.some(m=>m.id===u.instanceId&&m.type===GHOST));}
function next(s){
 if(!active(s))return null;
 const stage=state(s).stage,master=W.NPCS[masterId(s)],atMaster={id:master.id,map:master.map};
 if(stage==='raid')return {...atMaster,label:'Stand with your class master against the raid'};
 if(stage==='aftermath')return {...atMaster,label:'Speak with your class master after the raid'};
 if(stage==='hunt'){
  const h=HUNTS.find(h=>(s.echoes[h.type]||[]).length<h.count);
  return h?{id:'relic:hunt:'+h.type,map:h.map,label:'Hunt for '+C.UNITS[h.type].name+' in '+A.get(h.map).name+' · Echoes '+Math.min(h.count,(s.echoes[h.type]||[]).length)+'/'+h.count}:{...atMaster,label:'Deliver the Echoes to your class master'};
 }
 if(stage==='briefing')return {...atMaster,label:'Ask your class master about Tully'};
 if(stage==='ghost')return s.companions.some(m=>m.type===GHOST)?{id:TULLY,map:top.id,label:'Bring Casketot in your active party to Tully'}:(s.echoes[GHOST]||[]).length?{id:'relic:summon',map:s.map,label:'Summon Casketot from your Bag'}:{id:'relic:catch',map:'hollow-2',label:'Hunt for Casketot in Ghost Tower Entrance'};
 if(stage==='report')return {...atMaster,label:'Tell your class master where Tully hid the relics'};
 return {id:'relic:complete',map:master.map,label:'Main quest complete · The sacred treasures',complete:true};
}
function dialogue(s,id,party){
 if(!active(s)&&id!==TULLY)return null;
 const stage=state(s).stage,isMaster=id===masterId(s);
 if(id===TULLY){
  if(stage!=='ghost'||!hasGhost(s,party))return {lines:['Tully gazes across the cemetery. His spirit does not respond.'],hint:stage==='ghost'?'Put Casketot in your active party to speak with him.':'',action:null};
  return {lines:['Casketot raises its spectral arms. Tully turns toward you.','Tully: Oh, the relics are in the hatch right below the knight\'s room. Mind the loose stair on your way out.'],action:'hear-tully',button:'Remember the location'};
 }
 if(!isMaster)return null;
 if(stage==='raid')return {lines:['The alarm! A raid is coming. Stay close to me.'],action:'raid',button:'Stand with your master'};
 if(stage==='aftermath')return {lines:['Easy now. You and your companions are safe. I have restored your strength.','The monster raids have been constant. We could really use your help gathering a few Echoes. Hunt these creatures and bring their Echoes back to me.'],list:HUNTS,action:'accept-hunt',button:'Take the hunt list'};
 if(stage==='hunt')return {lines:[ready(s)?'You have the Echoes. May I take them?':'We still need the Echoes on this list.'],list:HUNTS,action:ready(s)?'deliver':null,button:'Give the Echoes'};
 if(stage==='briefing')return {lines:['We need the sacred treasures in this time of crisis. Ask Tully where he hid them.','You: Where can I find him?',"Master: Oh, he's dead of course, didn't you know? He's a hero, how did you not get this news?",'You: How will I ask a dead person then!?','Master: … Of course, with any ghost type mon? Go catch Casketot. Its spectral arms can reach him.','You will find Casketot around the Ghost Tower entrance in the cemetery. Summon it and keep it in your active party. Tully waits at the top, on the fourth floor.'],action:'seek-tully',button:'Find Casketot and Tully'};
 if(stage==='ghost')return {lines:['Bring Casketot in your active party to Tully, at the rooftop cemetery on the fourth floor.'],action:null};
 if(stage==='report')return {lines:["You: Tully says the relics are in the hatch right below the knight's room.",'Master: Thanks.',"Master: Oh, you want the relics!? Are you crazy? They're for me, of course. You can have this though."],action:'claim-weapon',button:'Receive '+WEAPONS[s.progression.specialization][0]};
 return {lines:['Keep that weapon. You earned it.'],hint:'The main quest is complete for now.',action:null};
}
function command(s,id,action,party){
 if(!active(s)||s.encounterSave)return false;
 const npc=W.NPCS[id];if(!npc||npc.map!==s.map||Math.hypot(s.position.x-npc.x,s.position.y-npc.y)>160)return false;
 const d=dialogue(s,id,party);if(!d?.action||d.action!==action||action==='raid')return false;
 const q=s.journey.relic=clean(s.journey.relic);
 if(action==='accept-hunt')q.stage='hunt';
 if(action==='deliver'){
  if(!ready(s))return false;
  for(const h of HUNTS){s.echoes[h.type].splice(0,h.count);s.inventory[BondEchoes.key(h.type)]=s.echoes[h.type].length;}
  q.stage='briefing';
 }
 if(action==='seek-tully')q.stage='ghost';
 if(action==='hear-tully')q.stage='report';
 if(action==='claim-weapon'){
  const item='weapon:class:'+s.progression.specialization;s.inventory[item]=(s.inventory[item]||0)+1;q.stage='complete';
  return {ok:true,item};
 }
 return {ok:true};
}
function forceEcho(s,type,map){
 if(!active(s))return false;
 const stage=state(s).stage,h=HUNTS.find(h=>h.type===type&&h.map===map);
 return stage==='hunt'&&!!h&&(s.echoes[type]||[]).length<h.count||stage==='ghost'&&type===GHOST&&!s.companions.some(m=>m.type===GHOST)&&!(s.echoes[GHOST]||[]).length;
}
root.BondRelicQuest={GHOST,TULLY,HUNTS,WEAPONS,tully,fresh,clean,state,active,ready,hasGhost,next,dialogue,command,forceEcho,masterId,raidId};
})(globalThis);
