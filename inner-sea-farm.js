/* Deterministic farm rules. Callers supply UTC milliseconds and commit the result. */
(function(root){
'use strict';
const C=BondContent,R=BondProgress,DAY=86400000,MINUTE=60000;
const habitats=Object.freeze({
 barn:{name:'Barn',residents:'Land creatures',x:260,y:280},
 cellar:{name:'Haunted cellar',residents:'Ghosts, undead and impish creatures',x:710,y:205},
 aviary:{name:'Bird roost',residents:'Birds and winged creatures',x:755,y:365},
 garden:{name:'Insect garden',residents:'Insects and small garden creatures',x:260,y:405},
 pond:{name:'Pond',residents:'Aquatic creatures',x:515,y:425}
});
const ids=Object.keys(habitats),int=(v,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=0?Math.min(max,v):0;
const fresh=()=>({version:1,owned:false,lastAt:0,cleanUntil:0,nextAttack:0,damaged:false,defenders:[null,null,null,null,null],levels:Object.fromEntries(ids.map(id=>[id,1])),carry:{},lastDefense:null});
function clean(raw,s){const f=fresh();if(!raw||raw.version!==1)return f;
 f.owned=raw.owned===true;for(const k of ['lastAt','cleanUntil','nextAttack'])f[k]=int(raw[k]);f.damaged=raw.damaged===true;
 const seen=new Set();f.defenders=f.defenders.map((_,i)=>{const id=raw.defenders?.[i];if(!s.companions.some(m=>m.id===id)||seen.has(id))return null;seen.add(id);return id;});
 for(const id of ids)f.levels[id]=Math.max(1,int(raw.levels?.[id],5));
 for(const m of s.companions)f.carry[m.id]=int(raw.carry?.[m.id],MINUTE-1);
 const report=raw.lastDefense;
 if(report&&Number.isSafeInteger(report.at)&&report.at>0&&Array.isArray(report.actors)&&report.actors.length<=10&&report.actors.every(a=>a&&/^[01]-[1-5]$/.test(a.id)&&C.MONSTERS.includes(a.type)&&[0,1].includes(a.side)&&int(a.maxHp)>0)&&new Set(report.actors.map(a=>a.id)).size===report.actors.length&&Array.isArray(report.events)){
   const actors=report.actors.map(a=>({id:a.id,type:a.type,name:typeof a.name==='string'?a.name.slice(0,100):C.UNITS[a.type].name,side:a.side,maxHp:int(a.maxHp,1000000000)})),duration=Number.isFinite(report.duration)?Math.max(0,Math.min(75,report.duration)):0;
   const events=report.events.filter(e=>e&&['damage','heal','regen','defeat','end'].includes(e.kind)&&Number.isFinite(e.time)&&e.time>=0&&e.time<=duration).slice(0,5000).map(e=>({time:e.time,kind:e.kind,target:actors.some(a=>a.id===e.target)?e.target:undefined,amount:int(e.amount,1000000000),text:typeof e.text==='string'?e.text.slice(0,300):''}));
   f.lastDefense={at:report.at,won:report.won===true,level:Math.max(1,int(report.level,100)),moon:moon(report.at).name,loot:Object.fromEntries(Object.entries(report.loot||{}).filter(([id,n])=>(id==='coins'||Object.hasOwn(BondWorld.ITEMS,id))&&int(n)>0)),xpLost:Object.fromEntries(Object.entries(report.xpLost||{}).filter(([id,n])=>s.companions.some(m=>m.id===id)&&int(n)>0)),actors,events,duration};
 }
 return f;
}
function habitat(type){const u=C.UNITS[type]||{},shape=u.artSpec?.shape||u.shape||'',family=(u.visualFamily||u.family||'').toLowerCase();
 if(/haunted|afterlife|ghost|undead|demon|fiend|impish/.test(family))return 'cellar';
 if(/fish|otter|seal|shrimp|axolotl|turtle|crab|frog|toad/.test(shape)||/aquatic|amphibian/.test(family))return 'pond';
 if(/moth|butterfly|bee|beetle|ant$|spider|centipede|snail|slug/.test(shape)||/insect|bug|arachnid/.test(family))return 'garden';
 if(/owl|bird|hawk|raven|crow|bat|eagle|heron|crane/.test(shape)||/avian|bird/.test(family))return 'aviary';
 return 'barn';
}
function strongest(s){const best={};for(const m of s.companions||[]){const old=best[m.type];if(!old||R.level(m.xp)>R.level(old.xp))best[m.type]=m;}return best;}
function power(s){return Object.values(strongest(s)).reduce((n,m)=>n+R.level(m.xp),0);}
function residents(s){const best={};for(const m of s.companions||[]){const h=habitat(m.type);if(!best[h]||R.level(m.xp)>R.level(best[h].xp))best[h]=m;}return best;}
function bonuses(s){const f=s?.farm;if(!f?.owned||f.damaged)return {hp:0,defense:0};return {hp:Math.min(.05,power(s)*.0001),defense:ids.reduce((n,id)=>n+(Math.max(1,f.levels?.[id]||1)-1)*.02,0)};}
function moon(at){
 const points=root.BondMoonCalendar||[],after=points.findIndex(p=>p[0]>at);let phase;
 if(after>0){const a=points[after-1],b=points[after];phase=(a[1]+(at-a[0])/(b[0]-a[0])*.25)%1;}
 else phase=(((at-947182440000)/DAY/29.530588)%1+1)%1;
 const illumination=(1-Math.cos(phase*Math.PI*2))/2,names=['New moon','Waxing crescent','First quarter','Waxing gibbous','Full moon','Waning gibbous','Last quarter','Waning crescent'];
 return {phase,illumination,name:names[Math.round(phase*8)%8],strength:.75+.5*illumination,count:3+Math.round(2*illumination),calendar:after>0};
}
function forecast(s,at=s.farm?.nextAttack){const m=moon(at||s.farm?.lastAt||0);return {...m,at,level:R.trainerLevel(s)};}
function training(s,end){const f=s.farm,start=f.lastAt,until=Math.min(end,f.cleanUntil);if(!f.owned||f.damaged||until<=start)return;
 for(const m of s.companions){const rate=1+(f.levels[habitat(m.type)]-1),total=(until-start)*rate+(f.carry[m.id]||0),gain=Math.floor(total/MINUTE);m.xp=R.clampPlayerXP(m.xp+gain);f.carry[m.id]=total%MINUTE;}
}
function attack(s,at){const f=s.farm,phase=moon(at),level=R.trainerLevel(s),seed=BondAtlas.hash('inner-sea:'+at),random=BondRules.rng(seed),pool=C.MONSTERS.filter(type=>C.UNITS[type].source!=='boss');
 const enemies=Array.from({length:phase.count},()=>{const type=pool[Math.floor(random()*pool.length)],u=C.UNITS[type];return {type,level,skills:[...u.default],hp:Math.round(u.hp*phase.strength),power:Math.round(u.power*phase.strength),skillScale:phase.strength};});
 const defenders=f.defenders.map(id=>s.companions.find(m=>m.id===id)).filter(Boolean).map(m=>({type:m.type,instanceId:m.id,skills:[...m.skills]}));
 const b=defenders.length?new BondGame.Battle(BondGame.soloBuild(),{profile:s,seed,defenders,encounter:{kind:'pack',enemies}}):null;
 const actors=b?b.units.map(u=>({id:u.id,type:u.type,name:u.name,side:u.side,maxHp:u.maxHp})):enemies.map((u,i)=>({id:'1-'+(i+1),type:u.type,name:C.UNITS[u.type].name,side:1,maxHp:u.hp}));
 if(b)b.run();const won=b?.winner===0,loot={},xpLost={};
 if(won){for(const [i,e] of enemies.entries()){
   const map=BondAtlas.home(e.type)?.map||'clearing-0',claim='sea:'+at+':'+i;
   const drops={...BondOpening.loot(e.type,map,(seed+i)>>>0),...BondEquipment.loot(e.type,claim)};for(const [id,n] of Object.entries(drops)){s.inventory[id]=(s.inventory[id]||0)+n;loot[id]=(loot[id]||0)+n;}
   const coins=6+Math.floor(level/3);s.coins=Math.min(1000000000,s.coins+coins);loot.coins=(loot.coins||0)+coins;
   if(BondEchoes.qualifies(Math.floor(random()*10000),C.UNITS[e.type].echoBP)){s.echoes[e.type]||=[];s.echoes[e.type].push({id:claim,level,map});const key=BondEchoes.key(e.type);s.inventory[key]=s.echoes[e.type].length;loot[key]=(loot[key]||0)+1;}
 }}else{
   f.damaged=true;
   for(const m of s.companions){const l=R.level(m.xp),loss=Math.min(m.xp,Math.max(1,Math.round((R.threshold(Math.min(100,l+1))-R.threshold(l))*.1)));m.treeLevel=Math.max(m.treeLevel||1,l);m.xp-=loss;xpLost[m.id]=loss;}
 }
 const events=(b?.events||[]).filter(e=>['damage','heal','regen','defeat','end'].includes(e.kind)).map(e=>({time:e.time,kind:e.kind,target:e.target,amount:e.amount,text:e.text}));
 f.lastDefense={at,won,level,moon:phase.name,loot,xpLost,actors,events,duration:b?.time||0};return f.lastDefense;
}
function advance(s,now){const f=s.farm;if(!f?.owned||!Number.isSafeInteger(now)||now<=f.lastAt)return false;
 if(!f.lastAt){f.lastAt=now;f.cleanUntil=now+2*DAY;f.nextAttack=(Math.floor(now/DAY)+2)*DAY;return true;}
 // A damaged farm has already stopped training and further unattended losses.
 if(f.damaged){f.lastAt=now;return true;}
 if(!f.nextAttack)f.nextAttack=(Math.floor(now/DAY)+2)*DAY;
 let count=0;
 while(f.nextAttack<=now&&count<7&&!f.damaged){training(s,f.nextAttack);f.lastAt=f.nextAttack;attack(s,f.nextAttack);f.nextAttack+=DAY;count++;}
 // Keep outstanding days for the next settlement instead of discarding attacks.
 if(f.nextAttack<=now&&!f.damaged)return true;
 training(s,now);f.lastAt=now;return true;
}
function establish(s,now){if(s.farm?.owned||R.trainerLevel(s)<25)return false;const f=fresh();Object.assign(f,{owned:true,lastAt:now,cleanUntil:now+2*DAY,nextAttack:(Math.floor(now/DAY)+2)*DAY});s.farm=f;s.inventory.repairkit=(s.inventory.repairkit||0)+2;return true;}
function command(s,action,value,now){const f=s.farm;if(action==='establish')return establish(s,now);if(!f?.owned)return false;
 if(!f.damaged&&f.nextAttack<=now)return false;
 if(action==='clean'){if(f.damaged)return false;f.cleanUntil=now+2*DAY;return true;}
 if(action==='defenders'){if(!Array.isArray(value)||value.length!==5||new Set(value.filter(Boolean)).size!==value.filter(Boolean).length||value.some(id=>id!==null&&!s.companions.some(m=>m.id===id)))return false;f.defenders=[...value];return true;}
 if(action==='repair'){if(!f.damaged||!(s.inventory.repairkit>0))return false;s.inventory.repairkit--;f.damaged=false;f.lastAt=now;f.cleanUntil=now+2*DAY;f.nextAttack=(Math.floor(now/DAY)+1)*DAY;return true;}
 if(action==='upgrade'){if(f.damaged||!ids.includes(value)||f.levels[value]>=5)return false;const cost=f.levels[value]*2;if(!(s.inventory.timber>=cost))return false;s.inventory.timber-=cost;f.levels[value]++;return true;}
 if(action==='buy'){const prices={timber:25,repairkit:50};if(!Object.hasOwn(prices,value)||s.coins<prices[value])return false;s.coins-=prices[value];s.inventory[value]=(s.inventory[value]||0)+1;return true;}
 return false;
}
root.BondFarm={DAY,MINUTE,habitats,fresh,clean,habitat,strongest,power,residents,bonuses,moon,forecast,training,attack,advance,command};
})(globalThis);
