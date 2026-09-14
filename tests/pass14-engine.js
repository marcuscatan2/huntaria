/* Independent local acceptance fixtures. Pass 14: legacy compatibility plus independent individuals. */
window.runPass14Engine=()=>{
 const C=BondContent,G=BondGame,R=BondProgress,T=BondGrowth,A=BondAtlas,P=BondProfile,E=BondEchoes,rules=BondRules;
 const results=[],coverage=[],check=(name,fn)=>{try{const ok=fn();results.push({name,pass:ok===true,detail:ok===true?null:JSON.stringify(ok)});}catch(e){results.push({name,pass:false,detail:e.stack});}},near=(a,b)=>Math.abs(a-b)<1e-8;
 const state=()=>({...P.fresh(),companions:undefined,owned:[...C.MONSTERS],xp:{},growth:{},attributes:Object.fromEntries(R.ATTRS.map(k=>[k,1]))});
 const entry=t=>({type:t,skills:[...C.UNITS[t].default]});
 const make=(type='emberfox',profile=state())=>{const build=G.defaultBuild();if(type==='druid'||type==='mage')build[0][0]=entry(type);else {build[0][1]=entry(type);if(type==='stonehorn')build[0][2]=entry('emberfox');}return new G.Battle(build,{profile,seed:42});};
 const ready=(b)=>{for(const u of b.units){u.position={x:50+(u.side?2:0),y:50};u.hp=u.maxHp=10000;u.passive=null;u.shield=0;u.growth.armor=0;u.effective={};}b.elements=false;};
 check('F001 content rejects missing category',()=>{const c=JSON.parse(JSON.stringify(C));delete c.SKILLS.pounce.category;return rules.validate(c).some(x=>x.includes('pounce'));});
 check('F001 content rejects unknown basic category and non-finite stats',()=>{const c=JSON.parse(JSON.stringify(C));c.UNITS.emberfox.basicCategory='projectile';c.UNITS.emberfox.hp=NaN;return rules.validate(c).length===2;});
 for(const [type,cat,attr,skill] of [['emberfox','melee','str','pounce'],['stormowl','ranged','dex','snipe'],['mage','magic','int','comet']]){
  for(const changed of ['str','dex','int'])check('F001 '+cat+' independent '+changed+' scaling',()=>{const s=state();s.xp.emberfox=495000;s.attributes[changed]=31;s.attributes.leadership=20;const d=R.derived(type,s),effective=type==='mage'?(changed===attr?30:0):(changed===attr?31:1)*.1,level=type==='mage'||type==='emberfox'?100:1,expected=(1+.025*(level-1))*(1+effective*.01);return near(d.factors[cat],expected)&&d.power===Math.round(C.UNITS[type].power*expected);});
  check('F001 '+cat+' final skill rounding independent fixture',()=>{const s=state();s.xp.emberfox=495000;s.attributes[attr]=31;s.attributes.leadership=20;const b=make(type,s),u=b.units.find(x=>!x.side&&x.type===type);ready(b);const target=b.priorityTarget(u),before=target.hp;b.strike(u,target,C.SKILLS[skill].amount,skill,C.SKILLS[skill]);const eff=type==='mage'?30:3.1,level=type==='mage'||type==='emberfox'?100:1;return before-target.hp===Math.round(C.SKILLS[skill].amount*(1+.025*(level-1))*(1+eff*.01));});
 }
 check('F002 AGI changes actions, not movement or cooldown',()=>{const s=state();s.attributes.agi=11;const d=R.derived('druid',s);return near(d.speed,100/C.UNITS.druid.interval*1.08)&&d.cooldown===0&&C.UNITS.druid.moveSpeed===make('druid',s).trainer(0).moveSpeed;});
 check('F002 physical accuracy exact bounds; magic unavoidable',()=>near(rules.dodgeChance({agi:40},{dex:10},'melee'),.0165)&&rules.dodgeChance({agi:10000},{dex:0},'ranged')===.05&&rules.dodgeChance({agi:20},{dex:100},'melee')===0&&rules.dodgeChance({agi:1000},{},'magic')===0);
 check('F002 dodged skill spends action and CD, suppresses on-hit Burn',()=>{const b=make();ready(b);const u=b.units.find(x=>x.type==='emberfox');u.skills=['burn','pounce','pierce'];u.cds=[0,999,999];u.actionRemaining=0;for(const x of b.units){x.effective.agi=100;x.actionRemaining=x===u?0:999;}b.random=()=>0;b.move=()=>{};b.step();return b.events.some(e=>e.kind==='dodge'&&e.actor===u.id)&&u.cds[0]>7&&u.actionRemaining>1&&!b.units.some(x=>x.status.burn)&&b.units.every(x=>x.hp===10000);});
 check('F002 fractional VIT regen accumulates without heal passive',()=>{const b=make();ready(b);const u=b.trainer(0);for(const x of b.units)x.actionRemaining=999;u.hp=9900;u.regenPerSecond=.5;u.passive='moonward';for(let i=0;i<60;i++)b.step();return u.hp===9901&&near(u.regenBuffer,.5)&&u.shield===0;});
 check('F002 regeneration caps and stops in Overcharge',()=>{const b=make();ready(b);const u=b.trainer(0);for(const x of b.units)x.actionRemaining=999;u.hp=9999;u.regenPerSecond=100;b.step();const full=u.hp;b.overcharge=true;u.hp=9900;b.step();return full===10000&&u.hp===9900;});
 check('F003 costs and level budget independently accumulated',()=>{let budget=48;for(let l=2;l<=100;l++)budget+=3+Math.floor(l/5);return R.cost(1)===2&&R.cost(11)===3&&R.cost(91)===11&&R.statBudget(100)===budget&&!R.validAttributes({str:100},100)&&!R.validAttributes({str:2.2},100);});
 check('F003 legacy array tree migration has a finite refund notice',()=>{const s=P.normalize({version:4,owned:['emberfox'],growth:{druid:['bond','might']}});return s.growth.druid.bond===1&&s.growth.druid.might===1&&!s.migration.includes('NaN');});
 check('F003 highest benched companion and no-owned baseline',()=>{const s=state();s.xp.stormowl=495000;return R.trainerLevel(s)===100&&R.trainerLevel({...s,owned:[]})===1;});
 check('F003 Leadership uses five raw stats once',()=>{const s=state();s.xp.emberfox=495000;s.attributes={str:30,agi:20,vit:10,int:40,dex:50,leadership:20};const d=R.derived('stonehorn',s);return near(d.shared.str,3)&&near(d.shared.agi,2)&&near(d.shared.vit,1)&&near(d.shared.int,4)&&near(d.shared.dex,5)&&!Object.hasOwn(d.shared,'leadership');});
 for(const count of [0,1,2])check('F004 '+count+' companions terminate safely',()=>{const s=state(),b=G.defaultBuild();if(count<2)b[0][2]=null;if(count<1)b[0][1]=null;const fight=new G.Battle(b,{profile:s}).run();return fight.ended&&fight.units.filter(u=>u.side===0).length===count+1&&fight.units.every(u=>Number.isFinite(u.hp)&&u.hp>=0);});
 check('F004 no unowned companions or duplicate skill slots',()=>{let rejected=0;try{new G.Battle(G.defaultBuild(),{profile:P.fresh()});}catch(_){rejected++;}const b=G.defaultBuild();b[0][1].skills[1]=b[0][1].skills[0];return rejected===1&&!G.validBuild(b);});
 check('F004 closest monster before exposed trainer; bypass remains explicit',()=>{const b=make(),fox=b.units[1],mon=b.units.find(u=>u.side===1&&u.type==='stormowl'),trainer=b.trainer(1);fox.position={x:50,y:50};trainer.position={x:51,y:50};mon.position={x:56,y:50};return b.target(fox)===mon&&b.priorityTarget(fox)===trainer;});
 check('F004 dead trainer immediately ends solo, living mons remain',()=>{const b=make();b.damage(b.trainer(1),b.trainer(0),1e7,'test');return b.ended&&b.winner===1&&b.units[1].hp>0;});
 check('F004 13 actor group simulation and owner elimination (not network)',()=>{const s=state(),build=G.defaultBuild(),e={kind:'boss',enemies:['elderroot','seedhare','dewfin','mossling'].map((t,i)=>({...entry(t),boss:i===0,hp:i===0?5000:700}))},b=new G.Battle(build,{profile:s,groupParties:[{team:build[0],profile:s},{team:build[0],profile:s}],encounter:e});const n=b.units.length;b.damage(b.units.at(-1),b.trainer(0),1e7,'test');const withdrawn=b.units.filter(u=>u.owner==='player-0'&&u.slot>0).every(u=>u.eliminated);return n===13&&withdrawn&&!b.ended&&b.run().ended;});
 check('F004 arena circle collision keeps living actors outside',()=>{const b=new G.Battle(G.defaultBuild(),{profile:state(),obstacles:[{x:50,y:55,radius:7}]});let valid=true;while(!b.ended){b.step();if(b.units.some(u=>u.hp>0&&Math.hypot(u.position.x-50,u.position.y-55)<8.999))valid=false;}return valid;});
 check('F007 Burn expiry independent of unit array order',()=>{const a=make(),b=make();for(const fight of [a,b]){ready(fight);for(const u of fight.units)u.actionRemaining=999;fight.units[1].status.burn={until:2,next:1,source:'1-0'};}b.units.reverse();for(let i=0;i<41;i++){a.step();b.step();}return JSON.stringify(a.events.filter(e=>e.kind==='damage'))===JSON.stringify(b.events.filter(e=>e.kind==='damage'))&&a.units.find(u=>u.id==='0-1').hp===9976;});
 check('F004 same seed reproduces whole event sequence',()=>{const s=state();s.attributes.agi=20;const a=make('emberfox',s).run(),b=make('emberfox',s).run();return JSON.stringify(a.events)===JSON.stringify(b.events);});
 for(const first of BondFormation.RANKS)for(const second of BondFormation.RANKS.filter(r=>r!==first)){const ranks=[first,second,BondFormation.RANKS.find(r=>r!==first&&r!==second)];check('F005 formation '+ranks.join('/'),()=>{const s=state();s.formation=ranks;const b=make('emberfox',s);return b.units.filter(u=>u.side===0).every((u,i)=>u.position.x===BondFormation.POSITIONS[ranks[i]].x)&&b.run().ended;});}
 for(let seed=1;seed<=1000;seed++)check('F004 generated battle seed '+seed,()=>{
  const random=rules.rng(seed),build=G.soloBuild(seed%2?'druid':'mage'),s=state();
  for(let side=0;side<2;side++){const available=[...C.MONSTERS];for(let slot=1;slot<3;slot++){const type=available.splice(Math.floor(random()*available.length),1)[0];build[side][slot]=seed%(slot+2)===0?null:entry(type);if(build[side][slot]){const pool=[...C.UNITS[type].skills],skills=[];for(let k=0;k<3;k++)skills.push(pool.splice(Math.floor(random()*pool.length),1)[0]);build[side][slot].skills=skills;}if(!side)s.xp[type]=R.threshold(1+Math.floor(random()*100));}}
  const b=new G.Battle(build,{profile:s,seed,enemyLevel:1+seed%100}).run();
  return b.ended&&b.time<=75&&b.units.every(u=>Number.isFinite(u.hp)&&u.hp>=0&&u.hp<=u.maxHp&&Number.isFinite(u.shield)&&u.shield>=0&&u.position.x>=G.FIELD.minX&&u.position.x<=G.FIELD.maxX&&u.position.y>=G.FIELD.minY&&u.position.y<=G.FIELD.maxY);
 });
 const speciesCoverage=[];
 for(const type of Object.keys(C.UNITS)){
  const u=C.UNITS[type],isMon=C.MONSTERS.includes(type);
  check('F006 '+type+' kit, portrait, innate and 18 nodes',()=>u.skills.length===5&&new Set(u.skills).size===5&&(!isMon||!!C.PASSIVES[u.passive])&&T.nodes(type).length===18&&CharacterRig.art(type).includes('src='));
  for(const id of u.skills)check('F006 assignment '+type+'/'+id+' executes',()=>{const b=make(type),actor=b.units.find(x=>x.type===type&&!x.side);ready(b);for(const x of b.units){x.hp=9000;x.status.burn={until:10,source:actor.id,next:1};x.status.slow={until:10,source:actor.id,next:1};}actor.passive=u.passive;const accepted=b.cast(actor,C.SKILLS[id]);return accepted&&actor.casts===1&&b.units.every(x=>Number.isFinite(x.hp)&&x.hp>=0&&Number.isFinite(x.shield));});
  if(isMon){check('F006 '+type+' full battle finite',()=>{const b=make(type).run();return b.ended&&b.units.every(x=>Number.isFinite(x.hp)&&Number.isFinite(x.position.x)&&Number.isFinite(x.position.y));});speciesCoverage.push({id:type,role:u.role,element:u.element,passive:u.passive,assignments:[...u.skills],nodes:T.nodes(type).map(n=>n.id),source:A.home(type)?.map||'future-group:'+A.REGIONS[u.region].id,usefulPath:u.role==='Tank'?['bond','guard','guard2','resolve']:u.role==='Support'?['bond','focus','care','care2']:['bond','might','might2','mastery'],artAcceptance:'owner review pending',bossOnlinePending:u.source==='boss'});}
  check('F010 '+type+' prerequisites, caps, usable branches',()=>{const cleaned=T.clean(type,{mastery:10,care2:5},20),all=T.clean(type,Object.fromEntries(T.nodes(type).map(n=>[n.id,999])),1000),nodes=T.nodes(type),hasHealing=u.skills.some(k=>['heal','teamheal','selfheal','cleanse'].includes(C.SKILLS[k].kind))||u.passive==='cinder';return T.used(cleaned)===0&&nodes.every(n=>all[n.id]===n.max&&[3,5,10].includes(n.max)&&(n.stat!=='healing'||hasHealing))&&T.used(T.clean(type,all,3))===3;});
 }
 for(let i=0;i<4;i++)for(let j=0;j<4;j++)check('F007 element '+R.ELEMENTS[i]+'/'+R.ELEMENTS[j],()=>R.multiplier(R.ELEMENTS[i],R.ELEMENTS[j])===(j===(i+1)%4?1.2:i===(j+1)%4?.8:1));
 check('F007 guard applies element and overtime once',()=>{const b=make();ready(b);b.elements=true;b.overcharge=true;const actor=b.trainer(1),target=b.trainer(0),guard=b.units[2];actor.element='Fire';target.element='Earth';guard.element='Wind';guard.status.guard={until:10};b.damage(actor,target,100,'test');return target.hp===10000-96&&guard.hp===10000-144;});
 check('F007 weaker shield preserves strength and expiry',()=>{const b=make(),u=b.trainer(0);b.shield(u,u,200,10,'strong');b.time=1;b.shield(u,u,100,50,'weak');return u.shield===200&&u.shieldUntil===10;});
 check('F007 heal cannot revive; cleanse clears status during Overcharge',()=>{const b=make();ready(b);const u=b.units[1];u.hp=0;b.heal(b.trainer(0),u,300,'test');const dead=u.hp;b.overcharge=true;b.trainer(0).hp=9000;b.trainer(0).status.slow={until:20};b.cast(b.trainer(0),C.SKILLS.cleanse);return dead===0&&!b.trainer(0).status.slow&&b.trainer(0).hp===9000;});
 check('F007 Slow and Haste change action/movement, not cooldown time',()=>{const b=make(),u=b.trainer(0);u.status.slow={until:10};u.status.haste={until:10};u.actionRemaining=10;u.cds=[10,10,10];const speed=b.speed(u);b.step();return near(b.rate(u),.78)&&near(speed,C.UNITS.druid.moveSpeed*8*.78)&&near(u.cds[0],9.95)&&near(u.actionRemaining,10-.05*.78);});
 check('F009 independent XP thresholds and cap',()=>R.level(0)===1&&R.level(99)===1&&R.level(100)===2&&R.level(299)===2&&R.level(300)===3&&R.level(494999)===99&&R.level(495000)===100&&R.clampXP(99999999)===495000);
 check('F011 exact 10,000-outcome starter/ultra-rare table',()=>{let starter=0,rare=0;for(let i=0;i<10000;i++){if(E.qualifies(i,1000))starter++;if(E.qualifies(i,1))rare++;}return starter===1000&&rare===1&&!E.qualifies(-1,1)&&!E.qualifies(10000,1);});
 for(const type of C.MONSTERS.filter(t=>C.UNITS[t].starter))for(const trainer of ['druid','mage'])check('F015 '+trainer+' alone defeats '+type+' without items',()=>{const s=P.fresh(),u=C.UNITS[type],b=new G.Battle(G.soloBuild(trainer),{profile:s,encounter:{kind:'wild',enemies:[{type,skills:[...u.default],hp:175,power:12,skillScale:.25,passive:null,level:1}]},seed:17}).run();return b.winner===0&&b.time<75&&b.units.filter(x=>!x.side).length===1;});
 check('F016 atlas 24 large maps / six hubs / 94 actual habitats',()=>A.validate().length===0&&A.maps.filter(m=>m.kind!=='hub').length===24&&A.maps.filter(m=>m.kind==='hub').length===6&&A.maps.flatMap(m=>m.habitats).length===94);
 for(const m of A.maps){
  check('F016 '+m.id+' reciprocal usable gates',()=>m.neighbors.every(g=>A.get(g.to).neighbors.some(reverse=>reverse.to===m.id)&&!A.collision(m.id,g)&&!A.collision(g.to,g.arrival)));
  if(m.kind!=='hub')check('F016 '+m.id+' shortest four directed edge walks >=30s',()=>{
   // Each sampled central straight corridor is unobstructed; Euclidean distance is a
   // lower bound on every possible path, making this also the shortest valid path.
   let clear=true;for(let p=80;p<m.width-80;p+=20)if(A.collision(m.id,{x:p,y:m.height/2}))clear=false;for(let p=80;p<m.height-80;p+=20)if(A.collision(m.id,{x:m.width/2,y:p}))clear=false;
   return clear&&(m.width-160)/210>=30&&(m.height-160)/210>=30;
  });
 }
 check('F016 all thirty maps connected through physical gates',()=>{const seen=new Set(),queue=['clearing-0'];while(queue.length){const id=queue.shift();if(seen.has(id))continue;seen.add(id);queue.push(...A.get(id).neighbors.map(g=>g.to));}return seen.size===30;});

 check('P14 v6 migration retains XP, class/individual tree, Echo and receipts',()=>{
  const raw={version:6,owned:['emberfox','emberfox','stonehorn'],xp:{emberfox:4500,stonehorn:100},
   growth:{druid:{bond:1},emberfox:{bond:1,might:1}},inventory:{biscuit:2},coins:83,
   echoes:{emberfox:[{id:'old-echo',level:4,map:'clearing-0'}]},summons:{'consumed-echo':'emberfox'}};
  const s=P.normalize(raw),a=s.companions[0];
  return s.version===7&&s.companions.length===2&&a.id==='legacy:emberfox'&&a.xp===4500&&a.growth.might===1&&s.growth.druid.bond===1&&s.coins===83&&s.inventory['echo:emberfox']===1&&s.summons['consumed-echo'].instanceId===a.id&&raw.version===6&&R.trainerLevel(s)===10;
 });
 for(const type of C.MONSTERS)check('P14 '+type+' two independent copies in actual combat',()=>{
  const raw=P.fresh(),u=C.UNITS[type];
  raw.companions=[{id:'copy:1',type,xp:0,skills:u.default,growth:{}},{id:'copy:2',type,xp:4500,skills:u.default,growth:{bond:1,might:1}}];
  const s=P.normalize(raw),build=G.soloBuild('druid');
  build[0][1]={...entry(type),instanceId:'copy:1'};build[0][2]={...entry(type),instanceId:'copy:2'};
  const b=new G.Battle(build,{profile:s,seed:42}),a=b.units.find(x=>x.instanceId==='copy:1'),second=b.units.find(x=>x.instanceId==='copy:2');
  return a.level===1&&second.level===10&&second.power>a.power&&a.name.endsWith('#1')&&second.name.endsWith('#2')&&b.run().ended;
 });
 check('P14 duplicate individual and wrong-species reference rejected',()=>{
  const s=P.fresh(),u=C.UNITS.emberfox;s.companions=[{id:'copy:1',type:'emberfox',xp:0,skills:u.default,growth:{}}];
  const b=G.soloBuild('druid');b[0][1]={...entry('emberfox'),instanceId:'copy:1'};b[0][2]={...b[0][1]};
  const duplicate=!G.validBuild(b);b[0][2]=null;b[0][1]={...entry('stonehorn'),instanceId:'copy:1'};
  try{new G.Battle(b,{profile:s});return false;}catch(_){return duplicate;}
 });
 return {results,speciesCoverage,counts:{species:C.MONSTERS.length,assignments:Object.values(C.UNITS).reduce((n,u)=>n+u.skills.length,0),innates:C.MONSTERS.length,treeNodes:T.TYPES.length*18,maps:A.maps.length},localOnly:true};
};
