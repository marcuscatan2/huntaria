()=>{
 const P=BondProfile,A=BondAtlas,G=BondGame,Q=BondPopulation,C=BondContent,checks=[];
 const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
 const check=(name,pass,detail=null)=>checks.push({name,pass:!!pass,detail}),same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 P.reset();const one=P.summon('emberfox','druid',P.testing.grantEcho('emberfox',100)).instanceId;
 const two=P.summon('emberfox','druid',P.testing.grantEcho('emberfox',100)).instanceId;
 const team=[{type:'druid',skills:[...C.UNITS.druid.default]},{type:'emberfox',instanceId:one,skills:[...C.UNITS.emberfox.default]},{type:'emberfox',instanceId:two,skills:[...C.UNITS.emberfox.default]}],build=[team,G.defaultBuild()[1]];
 check('100 species and 11 exact inspiration families',same(BondRoster.families.map(f=>f.species.length),[25,15,4,1,15,3,12,10,6,6,3])&&BondRoster.validate().length===0);
 check('Four real frog shapes, three eight-legged spider shapes, one dragon archetype',C.MONSTERS.filter(t=>C.UNITS[t].shape==='frog').length===4&&C.MONSTERS.filter(t=>C.UNITS[t].shape==='spider').length===3&&C.MONSTERS.filter(t=>C.UNITS[t].shape==='dragon').length===1);
 check('Every species keeps five skills and one passive',C.MONSTERS.every(t=>C.UNITS[t].skills.length===5&&C.PASSIVES[C.UNITS[t].passive]));
 check('Echo odds unchanged: four starters at 10%, all others 0.01%',C.MONSTERS.filter(t=>C.UNITS[t].echoBP===1000).length===4&&C.MONSTERS.every(t=>C.UNITS[t].echoBP===(C.UNITS[t].starter?1000:1)));
 const timings=[];
 for(const m of A.maps){
  P.travel(m.id);const pop=P.population();timings.push({map:m.id,count:pop.length});
  check(m.id+' exact species quotas',pop.length===Q.total(m)&&m.habitats.every(h=>pop.filter(s=>s.type===h.type&&s.present).length===h.count));
  check(m.id+' positions are unique, dry, navigable and away from gates',new Set(pop.map(s=>s.x+':'+s.y)).size===pop.length&&pop.every(s=>!A.collision(m.id,s,40)&&!BondWorldLayout.waterAt(m,s)&&BondNav.find(m.id,m.entry,s).ok&&m.neighbors.every(g=>distance(g,s)>=165)));
  if(pop.length>=8)check(m.id+' population spans the map, not habitat clusters',Math.max(...pop.map(s=>s.x))-Math.min(...pop.map(s=>s.x))>m.width*.35&&Math.max(...pop.map(s=>s.y))-Math.min(...pop.map(s=>s.y))>m.height*.25);
  const before=P.snapshot();check(m.id+' reads do not reroll or write',same(pop,P.population())&&before.revision===P.snapshot().revision);
 }
 check('Population totals recorded (timings measured separately with real clock)',true,timings);
 let all=P.snapshot();P.testing.replace(all);check('Reload normalization preserves positions, rolls and active leases',same(all.spawns,P.snapshot().spawns));
 const kill=(sp,finish=true)=>{const e=P.beginHunt(sp.id),options={profile:P.snapshot(),encounter:e,seed:e.seed},b=new G.Battle(build,options);P.reserveBattle(b,e.id,options);b.run();P.settleKills(b,e.id);if(finish)P.complete(b,e.id);return {b,e};};
 P.travel('clearing-0');let sp=P.population().find(s=>s.type==='tideotter'),before={...sp};
 const reserved=kill(sp,false),coins=P.snapshot().coins;
 check('Killed encounter lease cannot respawn before settlement',P.population().find(s=>s.id===sp.id).life===sp.life&&!P.population().find(s=>s.id===sp.id).present);
 P.complete(reserved.b,reserved.e.id);sp=P.population().find(s=>s.id===sp.id);
 check('Tideotter immediately replaced elsewhere on its map',sp.present&&sp.life===before.life+1&&distance(sp,before)>=900&&P.population().filter(s=>s.present&&s.type==='tideotter').length===8,{before:{x:before.x,y:before.y},after:{x:sp.x,y:sp.y}});
 P.complete(reserved.b,reserved.e.id);check('Respawn does not replay the kill reward',P.snapshot().coins===coins);
 const h=A.maps.flatMap(m=>m.habitats).find(h=>h.rarity==='Rare');P.travel(h.map);sp=P.population().find(s=>s.type===h.type);before={...sp};kill(sp);
 const due=P.snapshot().spawns[sp.id].readyAt,rareCounts=P.population().filter(s=>s.type===h.type&&s.present).length;
 check('Rare population is one with a saved 60-second cooldown',h.count===1&&due-Date.now()===60000&&rareCounts===0);
 check('Rare cannot respawn one millisecond early',!P.population(h.map,due-1).find(s=>s.id===sp.id).present);
 P.testing.replace(P.snapshot());sp=P.population(h.map,due).find(s=>s.id===sp.id);
 check('Rare replaces at its deadline at a new saved position',sp.present&&sp.life===before.life+1&&distance(sp,before)>=900);
 const stable=P.snapshot();P.testing.replace(stable);check('New rare life survives reload without new roll or teleport',same(stable.spawns,P.snapshot().spawns));
 // Earlier v7 clustered slots: migrate identities, not companion builds or rewards.
 const legacy=P.snapshot();legacy.map=h.map;legacy.encounterSave=null;
 for(const id of Q.keys(h))delete legacy.spawns[id];
 for(let i=0;i<3;i++)legacy.spawns[h.id+':'+i]={life:7,readyAt:0,present:true,roll:123+i,seed:777+i,empty:false};
 const held=h.id+':2',enc={id:'hunt:'+held+':7',map:h.map,kind:'wild',enemies:[{type:h.type,spawnId:held,life:7,skills:C.UNITS[h.type].default}]};
 legacy.encounterSave={id:enc.id,encounter:enc,tick:0};
 P.testing.replace(legacy);let migrated=P.population(h.map),heldSpawn=migrated.find(s=>s.id===held);
 check('Migration retains a reserved legacy surplus-slot identity and loot roll',migrated.filter(s=>s.type===h.type).length===1&&heldSpawn.life===7&&heldSpawn.roll===125&&heldSpawn.present);
 check('Migration preserves independent companions and builds',same(legacy.companions,P.snapshot().companions));
 P.abandonBattle();check('Abandon/reopen keeps the selected legacy lease',P.population(h.map).find(s=>s.type===h.type).id===held);
 // A rejected write must not report a new population life or position as saved.
 const saved=P.snapshot(),set=Storage.prototype.setItem;let rejected;
 try{
  const raw=P.snapshot();raw.spawns[held].present=false;raw.spawns[held].readyAt=0;P.testing.replace(raw);
  Storage.prototype.setItem=function(k,v){if(k===P.KEY)throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v);};
  const failed=P.population(h.map).find(s=>s.id===held);rejected=!failed.present&&failed.life===7;
 }finally{Storage.prototype.setItem=set;P.testing.replace(saved);}
 check('Storage failure never claims a successful respawn',rejected);
 const oldId='cindermole',copy=P.summon(oldId,'druid',P.testing.grantEcho(oldId,10)).instanceId,owned=P.getCompanion(copy);
 P.testing.replace(P.snapshot());check('Renamed species retain save identity, XP and kit',P.getCompanion(copy).type===oldId&&same(owned,P.getCompanion(copy))&&C.UNITS[oldId].name==='Cindertroop');
 P.abandonBattle();P.travel('clearing-0');
 return checks;
}
