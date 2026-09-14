/* Authored local campaign. Receipt facts, never UI clicks, settle objectives. */
(function(root){
'use strict';
const C=BondContent,A=BondAtlas,W=BondWorld,R=BondProgress;
const LESSONS=[
 ['front','Hold the line','A tank buys time, but cannot win alone.','Put a damage dealer behind a tank. Prioritize damage before a second defensive spell.', ['Tank','DPS'],'druid',[0,1,2]],
 ['cleanse','Break the snare','Our bindings slow both feet and action meters.','Bring a cleanse or haste; cooldown reduction is different from Speed.', ['Support','DPS'],'mage',[1,3,0]],
 ['pressure','Cinder Court scouts','The Court wants every Echo for itself. We will not let them take this road.','Two attackers race your defenses. A shield first can protect your opening.', ['DPS','DPS'],'mage',[0,2,4]],
 ['sustain','A long breath','A full health bar is not a victory. Find the opening between heals.','Focus damage; healing stops at 55 seconds. Do not bring only healers.', ['Support','Tank'],'druid',[0,4,2]],
 ['bypass','Watch your bond','Some spells ignore the monsters and reach the trainer.','Keep your trainer back and use guard or ward against explicit trainer strikes.', ['DPS','Support'],'mage',[4,0,1]],
 ['armor','The stone test','Armor makes small strikes feel smaller.','Compare damage elements. A faster attack is not necessarily a harder one.', ['Tank','Tank'],'druid',[2,0,3]],
 ['tempo','A quicker answer','Speed fills the next-action meter, not the skill cooldowns.','Haste improves attacks and movement; DEX shortens skill cooldowns.', ['DPS','Tank'],'druid',[3,1,4]],
 ['area','No safe crowd','Spread your preparation against sweeping attacks.','Team shields and healing help against area damage; keep an attacker equipped.', ['Support','DPS'],'mage',[3,2,0]],
 ['attrition','Court quartermaster','These stolen wards keep our patrol on this road.','Break through their sustain before Overcharge. You do not need rare monsters.', ['Tank','Support'],'mage',[2,4,1]],
 ['final','The road is yours','Show me a bond that can stand without the Court.','Use a balanced common party, allocate attributes and spend your tree points.', ['DPS','Tank'],'druid',[4,3,0]]
];
const NAMES=[
 ['Tavi','Briar','Nox','Hana','Pell','Flint','June','Cora','Rusk','Aster'],
 ['Neri','Rain','Murk','Lina','Wren','Slate','Fenn','Nami','Brine','Orris'],
 ['Cairn','Sable','Scoria','Meli','Ash','Beryl','Pip','Sol','Grint','Topaz'],
 ['Ione','Wisp','Umbra','Elara','Nyx','Mica','Lune','Vela','Veil','Auren'],
 ['Kite','Zeph','Gale','Eira','Hawk','Crag','Aeri','Cirra','Squall','Altair'],
 ['Asha','Cress','Varr','Suri','Ember','Basalt','Spark','Pyra','Cinder','Dawn']
];
const chapterText=[
 ['A bond in the grass','Mosslight Keepers have found Court markers on the forest road. Learn the paths and protect the first relay.','Mosslight keeps its lantern lit. The river road is open to your growing bond.'],
 ['The river remembers','The Court has dammed the old relay. Follow the water from forest to cave and recover its rhythm.','Water moves through the relay again. Amber Crossing sends for your help.'],
 ['Under amber skies','Court patrols are collecting glass that holds the memories of lost travelers. Find their camp.','The travelers have their memories back. Moonwell can read the next signal.'],
 ['Letters to the moon','The observatory received a warning from the Inner Sea. Reconnect its buried listening stones.','Moonwell hears the world again. The warning points above the clouds.'],
 ['Where the wind turns','The last mountain relay is silent. Climb the forest road and trace its signal underground.','The relays speak together. One stolen beacon remains in the Ashen Reach.'],
 ['A sea within','The Court believes bonds can be owned. Reach its last patrol and bring the beacon home.','The six beacons answer. No bond belongs to the Court. Your Inner Sea is your own. THE END — the world remains open.']
];
const trainers=[],packs=[],chapters=[],challenges=[],bosses={};
const teamEntry=(type,order)=>({type,skills:order.map(i=>C.UNITS[type].skills[i])});
for(const [r,region] of A.REGIONS.entries()){
 const available=C.MONSTERS.filter(t=>C.UNITS[t].source==='wild'&&C.UNITS[t].region===r);
 const byRole=role=>available.filter(t=>role==='DPS'?C.UNITS[t].role.endsWith('DPS'):C.UNITS[t].role===role);
 for(let i=0;i<10;i++){
  const [lesson,title,greeting,advice,roles,trainer,order]=LESSONS[i],id='story:'+region.id+':'+i;
  const types=roles.map((role,n)=>{const pool=byRole(role);return pool[(i+n)%pool.length]||available[(i+n)%available.length];});
  if(types[0]===types[1])types[1]=available.find(t=>t!==types[0]&&C.UNITS[t].role===roles[1])||available.find(t=>t!==types[0]);
  const map=region.id+'-'+(i===0?'hub':i===9?'3':i<4?'1':i<7?'0':'2');
  const m=A.get(map),point=A.safePoint(map,{x:m.guide.x+180+(i%3)*150,y:m.guide.y+180+Math.floor(i/3)*130});
  const sourceLevel=Math.min(R.ENGINE_LEVEL_CAP,region.level+(i===9?2:0));
  const e={id,name:NAMES[r][i],appearance:trainer,title:region.name+' · '+title,area:region.id,map,sourceLevel,level:Math.min(R.PLAYER_LEVEL_CAP,sourceLevel),
   greeting,advice,lesson,authored:true,main:i===0||i===9,coins:25+r*15+i*3,xp:150+r*90,repeatCoins:5+r*2,repeatXP:35+r*15,
   team:[teamEntry(trainer,order),...types.map((t,n)=>teamEntry(t,[order[n],order[(n+1)%3],order[(n+2)%3]]))],...point};
  W.NPCS[id]=e;trainers.push(e);
 }
 for(const [i,route] of ['forest','cave'].entries()){
  const map=region.id+'-'+(i?3:1),m=A.get(map),point=A.safePoint(map,{x:m.shelter.x+170,y:m.shelter.y+90});
  packs.push({id:'pack:'+map,map,region:region.id,route,name:region.name+(i?' cave convergence':' forest foragers'),
   lesson:i?'Five weakened residents: sustain and area damage help.':'Three swift residents: protect your opening, then focus damage.',count:i?5:3,...point});
 }
 const [title,intro,ending]=chapterText[r],hub=region.id+'-hub',forest=region.id+'-1',cave=region.id+'-3';
 const steps=[
  ['keeper','Speak with the Town Keeper',hub,'talk',hub,1],
  ['forest','Enter '+A.get(forest).name,forest,'visit',forest,1],
  ['forest-kills','Defeat two forest residents',forest,'kill',forest,2],
  ['first-duel','Complete '+NAMES[r][0]+"'s lesson",hub,'trainer','story:'+region.id+':0',1],
  ['cave','Enter '+A.get(cave).name,cave,'visit',cave,1],
  ['cave-kills','Defeat two cave residents',cave,'kill',cave,2],
  ['road-duel','Defeat '+NAMES[r][9]+' at the cave',cave,'trainer','story:'+region.id+':9',1],
  ['return','Return to the Town Keeper',hub,'return',hub,1]
 ].map(([key,label,map,kind,target,count],n)=>({id:'ch'+(r+1)+':'+key,label,map,kind,target,count,prerequisite:n?'ch'+(r+1)+':'+stepsKey(n-1):r?'ch'+r+':return':null}));
 chapters.push({id:'chapter-'+(r+1),region:region.id,title,intro,ending,steps,coins:100+r*75,xp:[2800,16200,59000,99000,139000,171000][r]});
 for(const kind of ['naturalist','tactician','convergence']){
  const id=region.id+':'+kind,item='honor:'+id;W.ITEMS[item]={name:region.name+' '+kind+' ribbon',icon:'✧',category:'Trophies',description:'Earned recognition. Decorative only; no account stat buff.'};
  challenges.push({id,region:region.id,kind,item,coins:60+r*20,label:kind==='naturalist'?'Defeat five residents':kind==='tactician'?'Win two different trainer lessons':'Clear the forest and cave packs',count:kind==='naturalist'?5:2,scope:'Personal · local receipts'});
 }
 const type=C.MONSTERS.find(t=>C.UNITS[t].source==='boss'&&C.UNITS[t].region===r);
 const patterns=[['Bramblequake','all','Shield the whole party',2.4,90,'slow'],['Tidal Return','rear','Protect your rear-rank trainer',2.8,150,'slow'],['Glassfall','front','Brace your frontline',2.2,160,'burn'],['Eclipse Bell','all','Cleanse the moonfire',3,100,'burn'],['Skybreaker','rear','Keep a ward on your trainer',1.8,145,'slow'],['Last Furnace','all','Recover between furnace waves',3.2,125,'burn']];
 const [name,target,hint,warning,damage,effect]=patterns[r];
 bosses[type]={type,region:region.id,name,target,hint,warning,damage,effect,recovery:1.1+r*.12,interval:11-r*.4,phaseAt:.5,phaseDamage:1.25,phaseInterval:.72,
  hp:3400,scale:players=>players===3?2.65:players===2?1.9:1,essenceBP:1,live:false};
}
const DEMONSTRATIONS={
 'story:clearing:0':'druid-sustain','story:brook:1':'mage-control','story:brook:3':'druid-area','story:brook:4':'mage-bypass'
};
for(const [id,map,trainerXP,greeting,advice] of [
 ['story:clearing:0','clearing-hub',900,'My monsters hold the line. I keep them fighting.','Focus pressure through the healing; formation and damage priority matter.'],
 ['story:brook:1','brook-0',1600,'Cold changes the pace of a fight.','Cleanse or haste answers Slow; ranged reach can keep attacking while others close.'],
 ['story:brook:3','brook-1',1800,'Roots buy my companions another breath.','Entangle controls your monsters. Keep enough focused damage to break the sustain.'],
 ['story:brook:4','brook-2',1700,'Your monsters are not the only target.','Crown Hex reaches trainers. Guard, ward or move your trainer to the back.']
 ]){
 const e=W.NPCS[id],m=A.get(map),point=A.safePoint(map,{x:m.guide.x+260,y:m.guide.y+210});
 Object.assign(e,{map,area:m.region,trainerXP,greeting,advice,demonstration:DEMONSTRATIONS[id],requiresWin:id==='story:brook:1'?'story:clearing:0':id==='story:brook:3'?'story:brook:1':id==='story:brook:4'?'story:brook:3':null,requiresCompanions:id==='story:clearing:0'?2:0,...point});
 if(id==='story:clearing:0'||id==='story:brook:1'){const scale=id==='story:clearing:0'?.5:.48;e.team=e.team.map(entry=>({...entry,power:Math.round(C.UNITS[entry.type].power*scale),skillScale:scale,healthScale:.68}));}
}

const earlyEncounters=[];
function addEarly(e){W.NPCS[e.id]=e;earlyEncounters.push(e);return e;}
function placed(map,p={}){const m=A.get(map);return {...A.safePoint(map,{x:p.x||m.guide.x+320,y:p.y||m.guide.y+220}),map,area:m.region};}
function trainerTeam(type,a='emberfox',b='stonehorn'){
 return [{type,skills:[...C.UNITS[type].default]},{type:a,skills:[...C.UNITS[a].default]},{type:b,skills:[...C.UNITS[b].default]}];
}
addEarly({id:'early:forest-mage',name:'Forest Mage',appearance:'mage',title:'Keeper of the forest road',level:3,seed:103,openingGate:true,protectedEncounter:true,autoReturn:true,earlyKey:'mageGate',noReward:true,
 greeting:'The road ahead is dangerous. Bring two companions, then show me your bond.',advice:'A balanced pair is enough for this trial.',requiresCompanions:2,
 team:[{...teamEntry('mage',[0,1,2]),power:8,skillScale:.2,healthScale:.35},null,null],...placed('clearing-0',{x:820,y:5040})});
const tidecrown=C.MONSTERS.find(t=>C.UNITS[t].source==='boss'&&C.UNITS[t].region===1);
const ambercolossus=C.MONSTERS.find(t=>C.UNITS[t].source==='boss'&&C.UNITS[t].region===2);
addEarly({id:'early:boss:tidecrown',name:C.UNITS[tidecrown].name,appearance:tidecrown,title:'Willowbrook guardian · Lv 15',kind:'boss',level:15,seed:1515,earlyKey:'tidecrown',trainerXP:3900,coins:80,
 greeting:'The water gathers around one powerful creature.',advice:'Tidal Return marks the rear. Guard, ward or change formation before it lands.',requiresDemonstrations:4,
 enemies:[{type:tidecrown,skills:[...C.UNITS[tidecrown].default],hp:2500,power:36,boss:true,passive:C.UNITS[tidecrown].passive}],...placed('brook-boss',{x:A.get('brook-boss').hero.x,y:A.get('brook-boss').hero.y+240})});
for(const type of ['druid','mage']){
 const enemy=type==='druid'?'mage':'druid';
 addEarly({id:'early:master:'+type,name:(type==='druid'?'Druid':'Mage')+' Master',appearance:type,title:'Class trial',level:15,seed:type==='druid'?201:202,trialClass:type,masterClass:type,trainerXP:8500,coins:100,
  greeting:type==='druid'?'Keep your companions standing. Let the bond do the work.':'Control the opening, then turn it into pressure.',
  advice:type==='druid'?'Try Mend, Barkskin and one control skill. Your real companions fight beside the temporary Druid build.':'Try Frostbolt or Arc Nova with Aegis. Your real companions remain part of the solution.',
  requiresCompanions:2,team:trainerTeam(enemy,type==='druid'?'stonehorn':'emberfox',type==='druid'?'bloomslime':'cindrake').map(entry=>({...entry,power:Math.round(C.UNITS[entry.type].power*.62),skillScale:.62,healthScale:.8})),...placed('hollow-hub',{x:type==='druid'?700:1450,y:type==='druid'?620:700})});
}
for(const type of ['druid','mage'])addEarly({id:'early:application:'+type,name:'Amber Trialkeeper',appearance:type==='druid'?'mage':'druid',title:'Use your new class',level:20,seed:type==='druid'?301:302,applicationClass:type,earlyKey:'application',trainerXP:1500,coins:35,
 greeting:'Show what your new class adds to this team.',advice:type==='druid'?'Sustain one attacker long enough to break the frontline.':'Use control and pressure before the opposing support stabilizes.',
 team:trainerTeam(type==='druid'?'mage':'druid','stonehorn','bloomslime'),...placed('hollow-0')});
addEarly({id:'early:counter',name:'Amber Pathwarden',appearance:'mage',title:'Counter-building trial',level:22,seed:401,earlyKey:'counter',trainerXP:3500,coins:50,
 greeting:'This formation reaches past the frontline.',advice:'Guard or ward the trainer; a different companion or ability can solve the same problem.',team:trainerTeam('mage','stormowl','bloomslime'),...placed('hollow-1')});
addEarly({id:'early:ability',name:'Copperleaf Tactician',appearance:'druid',title:'Ability proof',level:23,seed:402,earlyKey:'ability',trainerXP:2000,coins:50,requiresAbilityChange:true,
 greeting:'Bring a changed companion build and let the result speak.',advice:'In Party & bag, replace one equipped monster ability. Bloomslime can bring Fresh Start; Stonehorn can bring Bondguard or Rallying Ward.',team:trainerTeam('druid','cindrake','stonehorn'),...placed('hollow-2')});
addEarly({id:'early:resolution',name:'Amber Gatekeeper',appearance:'mage',title:'Amber route resolution',level:24,seed:403,earlyKey:'resolution',trainerXP:4000,coins:70,
 greeting:'Keep the answer you built. Finish the route.',advice:'Use the class, formation and companion adjustment that worked in the earlier trials.',team:trainerTeam('mage','cindrake','ironback'),...placed('hollow-3')});
for(const [n,map,xp,level] of [[1,'hollow-0',3000,26],[2,'hollow-1',2500,27],[3,'hollow-2',3000,28]])addEarly({id:'early:amber:'+n,name:'Amber Challenger '+n,appearance:n===2?'mage':'druid',title:'Amber mastery '+n,level,seed:500+n,earlyKey:'amber'+n,trainerXP:xp,coins:60,
 greeting:['Read the formation before choosing your response.','A familiar answer can work in a harder fight.','Bring the whole build together.'][n-1],advice:'Inspect the team, adjust one priority or formation rank, then retry.',team:trainerTeam(n===2?'mage':'druid',n===1?'ironback':'cindrake',n===3?'lumimoth':'thornstag'),...placed(map)});
addEarly({id:'early:boss:amber',name:C.UNITS[ambercolossus].name,appearance:ambercolossus,title:'Amber guardian · Lv 30',kind:'boss',level:30,seed:3030,earlyKey:'amberBoss',trainerXP:5000,coins:120,
 greeting:'The colossus seals the last lesson of Amber Hollow.',advice:'Glassfall marks the frontline. Brace it, then use the recovery window.',requiresEarly:'amber3',
 enemies:[{type:ambercolossus,skills:[...C.UNITS[ambercolossus].default],hp:3400,power:42,boss:true,passive:C.UNITS[ambercolossus].passive}],...placed('hollow-boss',{x:A.get('hollow-boss').hero.x,y:A.get('hollow-boss').hero.y+240})});
addEarly({id:'early:tree-proof',name:'Amber Naturalist',appearance:'druid',title:'Skill-tree proof',level:30,seed:3060,earlyKey:'treeProof',trainerXP:0,coins:20,requiresTreeInvestment:true,
 greeting:'Let your companion show what changed.',advice:'Spend one point in an owned companion tree, then return.',team:trainerTeam('druid','stonehorn','bloomslime'),...placed('hollow-hub',{x:900,y:1120})});

const earlyFresh=()=>({introFightWon:false,introClaim:null,firstSummon:false,companionProof:false,proofClaim:null,secondChoice:null,secondClaim:null,secondSummon:false,mageMet:false,mageGate:false,demonstrations:[],tidecrown:false,trials:{druid:false,mage:false},trialRewarded:false,abilityChanged:false,application:false,counter:false,counterEcho:false,ability:false,resolution:false,amber1:false,amber2:false,amber3:false,amberBoss:false,treeProof:false});
function earlyClean(raw){const e=earlyFresh();if(!raw||typeof raw!=='object')return e;for(const k of ['introFightWon','firstSummon','companionProof','secondSummon','mageMet','mageGate','tidecrown','trialRewarded','abilityChanged','application','counter','counterEcho','ability','resolution','amber1','amber2','amber3','amberBoss','treeProof'])e[k]=raw[k]===true;
 for(const k of ['introClaim','proofClaim','secondClaim'])if(typeof raw[k]==='string'&&raw[k].length<220)e[k]=raw[k];if(['bloomslime','stonehorn'].includes(raw.secondChoice))e.secondChoice=raw.secondChoice;
 e.demonstrations=[...new Set((Array.isArray(raw.demonstrations)?raw.demonstrations:[]).filter(x=>Object.values(DEMONSTRATIONS).includes(x)))];for(const type of ['druid','mage'])e.trials[type]=raw.trials?.[type]===true;
 // Saves made before the forest gate existed must not be pulled backward.
 if(!Object.hasOwn(raw,'mageMet')&&e.secondSummon){e.mageMet=true;e.mageGate=true;}
 return e;}
function wildProgress(s,{spawnId,type,map,claim,xp}){
 const e=s.journey.early||=earlyFresh();let trainerXP=xp,forceEcho=false;
 if(map==='clearing-0'&&type==='emberfox'&&!e.introFightWon){e.introFightWon=true;e.introClaim=claim;trainerXP=100;forceEcho=!s.companions.some(m=>m.type==='emberfox')&&!(s.echoes.emberfox||[]).length;}
 else if(e.firstSummon&&!e.companionProof){e.companionProof=true;e.proofClaim=claim;trainerXP=200;if(['bloomslime','stonehorn'].includes(type)&&!e.secondChoice){e.secondChoice=type;e.secondClaim=claim;trainerXP+=300;forceEcho=!s.companions.some(m=>m.type===type)&&!(s.echoes[type]||[]).length;}}
 else if(e.companionProof&&!e.secondChoice&&['bloomslime','stonehorn'].includes(type)){e.secondChoice=type;e.secondClaim=claim;trainerXP=300;forceEcho=!s.companions.some(m=>m.type===type)&&!(s.echoes[type]||[]).length;}
 if(s.progression?.specialization&&e.application&&!e.counterEcho&&A.get(map)?.region==='hollow'){e.counterEcho=true;forceEcho=!s.companions.some(m=>m.type===type)&&!(s.echoes[type]||[]).length;}
 return {trainerXP,forceEcho};
}
function recordSummon(s){const e=s.journey.early||=earlyFresh();e.firstSummon=true;if(s.tutorial.summons>=2)e.secondSummon=true;}
function recordMageMeeting(s){const e=s.journey.early||=earlyFresh();e.mageMet=true;}
function recordAbility(s,mon){const e=s.journey.early||=earlyFresh();if(mon&&mon.skills.some((id,i)=>id!==C.UNITS[mon.type].default[i]))e.abilityChanged=true;}
function recordWin(s,encounter){const e=s.journey.early||=earlyFresh(),demo=DEMONSTRATIONS[encounter.id];if(demo&&!e.demonstrations.includes(demo))e.demonstrations.push(demo);
 if(encounter.trialClass){e.trials[encounter.trialClass]=true;e.trialRewarded=true;}
 if(encounter.earlyKey&&Object.hasOwn(e,encounter.earlyKey))e[encounter.earlyKey]=true;
}
function requirement(encounter,s,party=null){const e=s.journey?.early||earlyFresh(),wins=s.journey?.wins||{};
 if(encounter.openingGate&&!e.mageMet)return 'Speak with the Mage first.';
 if(encounter.requiresWin&&!wins[encounter.requiresWin])return 'Complete the previous class demonstration first.';
 if(encounter.requiresDemonstrations&&e.demonstrations.length<encounter.requiresDemonstrations)return 'Complete the four class demonstrations first.';
 if(encounter.trialClass&&e.demonstrations.length<4)return 'Complete the four class demonstrations first.';
 if(encounter.trialClass&&!e.tidecrown)return 'Defeat Tidecrown first.';
 if(encounter.applicationClass&&s.progression?.specialization!==encounter.applicationClass)return 'Choose this specialization first.';
 if(encounter.id==='early:counter'&&!e.application)return 'Complete your new-class encounter first.';
 if(encounter.id==='early:ability'&&!e.counter)return 'Defeat the Amber Pathwarden first.';
 if(encounter.requiresAbilityChange&&!e.abilityChanged)return 'Change one equipped companion ability in Party & bag first.';
 if(encounter.id==='early:resolution'&&!e.ability)return 'Complete the ability proof first.';
 if(encounter.id==='early:amber:1'&&(!e.resolution||R.trainerLevel(s)<25))return 'Reach player level 25 and finish the Amber route first.';
 if(encounter.id==='early:amber:2'&&!e.amber1)return 'Defeat Amber Challenger 1 first.';
 if(encounter.id==='early:amber:3'&&!e.amber2)return 'Defeat Amber Challenger 2 first.';
 if(encounter.requiresEarly&&!e[encounter.requiresEarly])return 'Complete the preceding Amber challenge first.';
 if(encounter.requiresTreeInvestment&&!s.companions.some(m=>BondGrowth.used(m.growth)))return 'Invest one point in an owned companion tree first.';
 if(encounter.requiresCompanions&&party&&party.slice(1).filter(Boolean).length<encounter.requiresCompanions)return 'Bring two summoned companions in your party.';
 return '';
}
function visible(encounter,s){const e=s.journey?.early||earlyFresh(),spec=s.progression?.specialization;
 if(encounter.openingGate)return e.firstSummon;
 if(encounter.trialClass)return e.tidecrown&&e.demonstrations.length===4&&!spec;
 if(encounter.applicationClass)return spec===encounter.applicationClass&&!e.application;
 if(encounter.id==='early:counter')return e.application&&!e.counter;
 if(encounter.id==='early:ability')return e.counter&&!e.ability;
 if(encounter.id==='early:resolution')return e.ability&&!e.resolution;
 if(encounter.id==='early:amber:1')return e.resolution&&!e.amber1;
 if(encounter.id==='early:amber:2')return e.amber1&&!e.amber2;
 if(encounter.id==='early:amber:3')return e.amber2&&!e.amber3;
 if(encounter.id==='early:tree-proof')return e.amberBoss&&!e.treeProof;
 return true;
}
function earlyNext(s){const e=s.journey?.early||earlyFresh(),wins=s.journey?.wins||{};
 if(!e.introFightWon)return {id:'ep:intro',label:'Hunt Brimbles for a Soul Echo',map:'clearing-0'};
 if(!e.firstSummon)return {id:'ep:summon1',label:'Summon Brimble from your Bag',map:s.map};
 if(!e.mageMet)return {id:'ep:mage',label:'Find the Mage',map:'clearing-0'};
 if(!e.secondSummon)return {id:'ep:summon2',label:'Get a second companion',map:'clearing-0'};
 if(!e.mageGate)return {id:'early:forest-mage',label:'Return to the Mage',map:'clearing-0'};
 for(const [id,label,map] of [['story:clearing:0','Defeat Tavi with two companions','clearing-hub'],['story:brook:1','Face Rain and learn control','brook-0'],['story:brook:3','Face Lina in Rainwillow Forest','brook-1'],['story:brook:4','Face Wren at Reedwatch Banks','brook-2']])if(!wins[id])return {id,label,map};
 if(!e.tidecrown)return {id:'early:boss:tidecrown',label:'Defeat Tidecrown',map:'brook-boss'};
 if(!e.trials.druid&&!e.trials.mage)return {id:'ep:masters',label:'Choose a class trial in Amber Crossing',map:'hollow-hub'};
 if(!s.progression?.specialization)return {id:'ep:transform',label:'Return to a completed master and choose your class',map:'hollow-hub'};
 if(!e.application)return {id:'ep:application',label:'Use your new class in Amber Hollow',map:'hollow-0'};
 if(!e.counter)return {id:'early:counter',label:'Defeat the Amber Pathwarden',map:'hollow-1'};
 if(!e.abilityChanged)return {id:'ep:ability-change',label:'Change one companion ability in Party & bag',map:s.map};
 if(!e.ability)return {id:'early:ability',label:'Prove the changed ability',map:'hollow-2'};
 if(!e.resolution)return {id:'early:resolution',label:'Finish the Amber route',map:'hollow-3'};
 if(!e.amber1)return {id:'early:amber:1',label:'Defeat Amber Challenger 1',map:'hollow-0'};
 if(!e.amber2)return {id:'early:amber:2',label:'Defeat Amber Challenger 2',map:'hollow-1'};
 if(!e.amber3)return {id:'early:amber:3',label:'Defeat Amber Challenger 3',map:'hollow-2'};
 if(!e.amberBoss)return {id:'early:boss:amber',label:'Defeat the Amber Colossus',map:'hollow-boss'};
 if(!s.companions.some(m=>BondGrowth.used(m.growth)))return {id:'ep:tree',label:'Spend a point in an owned companion skill tree',map:s.map};
 if(!e.treeProof)return {id:'early:tree-proof',label:'Prove the monster-tree upgrade',map:'hollow-hub'};
 return null;
}
function stepsKey(n){return ['keeper','forest','forest-kills','first-duel','cave','cave-kills','road-duel','return'][n];}
const fresh=()=>({talks:{},wins:{},packs:{},steps:[],chapters:[],challenges:[],sequence:0,early:earlyFresh()});
function clean(raw){const s=fresh();for(const k of ['talks','wins','packs'])for(const [id,v] of Object.entries(raw?.[k]||{}))if(Number.isSafeInteger(v)&&v>0)s[k][id]=v;
 const known={steps:chapters.flatMap(c=>c.steps.map(s=>s.id)),chapters:chapters.map(c=>c.id),challenges:challenges.map(c=>c.id)};
 for(const k of ['steps','chapters','challenges'])s[k]=[...new Set((Array.isArray(raw?.[k])?raw[k]:[]).filter(id=>known[k].includes(id)))];s.sequence=Number.isSafeInteger(raw?.sequence)?Math.max(0,raw.sequence):0;s.early=earlyClean(raw?.early);return s;}
function facts(s,step){const j=s.journey||fresh();if(step.kind==='talk')return j.talks[step.target]?1:0;if(step.kind==='visit')return s.visited.includes(step.target)?1:0;
 if(step.kind==='kill')return Object.values(s.claims).filter(c=>c.map===step.target).length;
 if(step.kind==='trainer')return j.wins[step.target]||s.defeated.includes(step.target)?1:0;
 if(step.kind==='return'){const r=A.get(step.map).region;return (j.talks[step.target]||0)>(j.wins['story:'+r+':9']||Infinity)?1:0;}return 0;}
function challengeCount(s,c){const j=s.journey||fresh();if(c.kind==='naturalist')return Object.values(s.claims).filter(x=>A.get(x.map).region===c.region).length;
 if(c.kind==='tactician')return trainers.filter(t=>t.area===c.region&&j.wins[t.id]).length;
 return packs.filter(p=>p.region===c.region&&j.packs[p.id]).length;}
function reconcile(s){const j=s.journey||=fresh();j.early=earlyClean(j.early);for(const [id,demo] of Object.entries(DEMONSTRATIONS))if((j.wins[id]||s.defeated?.includes(id))&&!j.early.demonstrations.includes(demo))j.early.demonstrations.push(demo);
 if((s.tutorial?.summons||0)>0)j.early.firstSummon=true;if((s.tutorial?.summons||0)>1)j.early.secondSummon=true;
 if(s.companions?.some(m=>m.skills.some((id,i)=>id!==C.UNITS[m.type].default[i])))j.early.abilityChanged=true;
 for(const ch of chapters){for(const step of ch.steps){if(step.prerequisite&&!j.steps.includes(step.prerequisite))return;if(!j.steps.includes(step.id)){if(facts(s,step)<step.count)return;j.steps.push(step.id);}}
  if(!j.chapters.includes(ch.id)){j.chapters.push(ch.id);s.coins+=ch.coins;s.trainerXP=R.clampPlayerXP((s.trainerXP||0)+ch.xp);for(const mon of s.companions)mon.xp=BondProgress.clampPlayerXP(mon.xp+ch.xp);}}
}
function next(s){return earlyNext(s)||chapters.flatMap(c=>c.steps).find(o=>!s.journey?.steps.includes(o.id))||null;}
function questMarker(subject,s,current=next(s)){
 if(!subject||!current)return null;
 const id=typeof subject==='string'?subject:subject.id,e=s.journey?.early||earlyFresh();
 // Chapter keepers use the map as their stable target; returning is a delivery.
 if(subject.questKeeperMap===current.target){
  if(current.kind==='talk')return 'offer';
  if(current.kind==='return')return 'delivery';
 }
 if(current.id==='ep:mage'&&id==='early:forest-mage')return 'offer';
 if(current.id==='early:forest-mage'&&id==='early:forest-mage')return 'delivery';
 if(current.id==='ep:masters'&&subject.masterClass&&!e.trials[subject.masterClass])return 'offer';
 if(current.id==='ep:transform'&&subject.masterClass&&e.trials[subject.masterClass])return 'delivery';
 if(current.id==='ep:application'&&subject.applicationClass===s.progression?.specialization)return 'offer';
 if(current.id==='early:tree-proof'&&id==='early:tree-proof')return 'delivery';
 if(current.kind==='trainer'&&current.target===id)return 'offer';
 return current.id===id?'offer':null;
}
function validate(){const errors=[];if(trainers.length!==60||packs.length!==12||chapters.flatMap(c=>c.steps).length!==48)errors.push('content count');
 for(const t of trainers){if(!BondGame.validTeam(t.team))errors.push(t.id+' illegal team');if(!A.get(t.map)||A.collision(t.map,t))errors.push(t.id+' unreachable');}
 for(const p of packs)if(!A.get(p.map).habitats.length||A.collision(p.map,p))errors.push(p.id+' no habitat');
 const ids=new Set(chapters.flatMap(c=>c.steps.map(s=>s.id)));for(const c of chapters)for(const s of c.steps)if(!A.get(s.map)||(s.prerequisite&&!ids.has(s.prerequisite)))errors.push(s.id+' bad objective');
 for(const e of earlyEncounters){if(!A.get(e.map)||A.collision(e.map,e))errors.push(e.id+' unreachable');if(e.team&&!BondGame.validTeam(e.team))errors.push(e.id+' illegal team');}return errors;}
root.BondCampaign={trainers,packs,chapters,challenges,bosses,earlyEncounters,DEMONSTRATIONS,fresh,clean,facts,challengeCount,reconcile,next,earlyNext,questMarker,wildProgress,recordSummon,recordMageMeeting,recordAbility,recordWin,requirement,visible,validate};
})(globalThis);
