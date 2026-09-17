()=>{
 const checks=[],check=(name,value,detail=null)=>checks.push({name,pass:!!value,detail});
 const P=BondProfile,C=BondCampaign,G=BondGame,A=BondAtlas;
 const learnedKit=m=>{const known=BondCompanionMoves.learned(m);return [...known.filter(BondCompanionMoves.signature),...known.filter(id=>!BondCompanionMoves.signature(id))].slice(0,3);};
 const allocate=(s,cls)=>{if(cls==='swordsman')s.formation=['front','middle','front'];s.growth[cls]=BondGrowth.clean(cls,Object.fromEntries(BondGrowth.nodes(cls).map(n=>[n.id,n.max])),BondGrowth.budget(s,cls));for(const m of s.companions)m.growth=BondGrowth.clean(m.type,Object.fromEntries(BondGrowth.nodes(m.type).map(n=>[n.id,1])),BondGrowth.budget(s,m.id));return s;};
 check('60 trainer / 12 pack / 48 objective rows validate',C.validate().length===0,C.validate());
 check('30-map graph validates',A.validate().length===0);
 P.reset();
 const id=P.summon('emberfox','druid',P.testing.grantEcho('emberfox',100)).instanceId;
 const tank=P.summon('stonehorn','druid',P.testing.grantEcho('stonehorn',100)).instanceId;
 const team=[{type:'druid',skills:[...G.UNITS.druid.default]},{type:'emberfox',instanceId:id,skills:[...G.UNITS.emberfox.default]},{type:'stonehorn',instanceId:tank,skills:[...G.UNITS.stonehorn.default]}];
 let sp=P.population().find(s=>s.present&&s.type==='emberfox'),e=P.beginHunt(sp.id);
 const build=[team,G.defaultBuild()[1]],options={profile:P.snapshot(),encounter:e,seed:e.seed};
 let b=new G.Battle(build,options);P.reserveBattle(b,e.id,options);b._supplyReceipt=P.consumePrepared(b);
 for(let i=0;i<60;i++)b.step();P.checkpoint(b);
 const saved=P.snapshot();P.testing.replace(saved);const restored=P.restoreBattle(e.id);
 check('Encounter replay restores exact units and time',JSON.stringify(b.units)===JSON.stringify(restored.units)&&b.tick===restored.tick);
 check('Map transition blocked while encounter reserved',!P.travel('clearing-1'));
 b.run();P.settleKills(b,e.id);const before=P.snapshot().coins,result=P.complete(b,e.id),again=P.complete(b,e.id);
 check('Kill reward once after recovery',result.kills===1&&again.coins===result.coins&&P.snapshot().coins===before);
 check('Completion releases reservation',!P.snapshot().encounterSave);
 for(const p of C.packs){P.travel(p.map);e=P.beginPack(p.id);check(p.id+' uses 2–5 unique living habitat lives',e&&e.enemies.length>=2&&e.enemies.length<=5&&new Set(e.enemies.map(u=>u.spawnId)).size===e.enemies.length,e?.enemies.length);}
 check('Explicit VFX coverage for all 525 assignments',BondPresentation.validate().length===0);
 const summary=[];
 for(const cls of BondContent.CLASSES)for(const ch of C.chapters){
  const level=A.REGIONS.find(r=>r.id===ch.region).level+3;
  P.abandonBattle();P.testing.setXP(id,BondProgress.threshold(level));P.testing.setXP(tank,BondProgress.threshold(level));
  const raw=P.snapshot();raw.trainerXP=BondProgress.threshold(Math.min(BondProgress.PLAYER_LEVEL_CAP,level));raw.attributes=BondProgress.cleanAttributes({[cls==='hunter'?'dex':cls==='swordsman'?'str':'int']:65,vit:40,leadership:40,agi:20},level);allocate(raw,cls);P.testing.replace(raw);
  const commonTeam=[{type:cls,skills:cls==='druid'?['mend','bark','bramble']:cls==='mage'?['aegis','comet','frost']:[...G.UNITS[cls].default]},{type:'emberfox',instanceId:id,skills:[...G.UNITS.emberfox.default]},{type:'stonehorn',instanceId:tank,skills:[...G.UNITS.stonehorn.default]}];
  for(const t of C.trainers.filter(t=>t.area===ch.region)){
   let fight=new G.Battle([commonTeam,t.team],{profile:P.snapshot(),enemyLevel:t.level,seed:16}).run(),variation='balanced';
   if(fight.winner!==0&&cls==='mage'){const alternate=JSON.parse(JSON.stringify(commonTeam));alternate[0].skills=['hex','comet','aegis'];fight=new G.Battle([alternate,t.team],{profile:P.snapshot(),enemyLevel:t.level,seed:16}).run();variation='Crown Hex / Comet / Aegis against armor';}
   if(fight.winner!==0&&cls==='hunter'){const alternate=JSON.parse(JSON.stringify(commonTeam));alternate[0].skills=['huntersmark','huntingcall','longshot'];fight=new G.Battle([alternate,t.team],{profile:P.snapshot(),enemyLevel:t.level,seed:16}).run();variation='Pinning shot / Hunting call / Longshot for focused pressure';}
   summary.push({cls,id:t.id,level,winner:fight.winner,time:fight.time,variation});
  }
 }
 check('Four classes can beat all 60 trainer lessons with legal talents and starter-only party',summary.every(s=>s.winner===0),summary.filter(s=>s.winner!==0));
 const bossEvidence=[];
 for(const def of Object.values(C.bosses)){
  const u=G.UNITS[def.type],enc={kind:'boss',practice:true,enemies:[{type:def.type,skills:[...u.default],boss:true,hp:100000,power:2}]};
  const fight=new G.Battle(G.defaultBuild(),{encounter:enc,seed:2});for(const ally of fight.team(0))ally.hp=ally.maxHp=100000;
  while(fight.time<9)fight.step();const telegraph=fight.events.find(e=>e.kind==='telegraph');
  const start=fight.time;while(fight.time<14)fight.step();const quake=fight.events.find(e=>e.kind==='quake');
  fight.units.find(u=>u.boss).hp=fight.units.find(u=>u.boss).maxHp*.49;fight.step();
  bossEvidence.push({type:def.type,telegraph:!!telegraph,impact:!!quake,phase:fight.bossPhase,recovery:!!fight.events.find(e=>e.kind==='recovery')});
 }
 check('Six bosses warn, impact, recover and enter phase two',bossEvidence.every(e=>e.telegraph&&e.impact&&e.recovery&&e.phase===2),bossEvidence);
 const storyRuns=[];
 for(const cls of BondContent.CLASSES){
  P.reset();const fox=P.summon('emberfox',cls,P.testing.grantEcho('emberfox',1)).instanceId,stone=P.summon('stonehorn',cls,P.testing.grantEcho('stonehorn',1)).instanceId;
  const party=[{type:cls,skills:cls==='druid'?['mend','bark','bramble']:cls==='mage'?['aegis','comet','frost']:[...G.UNITS[cls].default]},{type:'emberfox',instanceId:fox,skills:[...G.UNITS.emberfox.default]},{type:'stonehorn',instanceId:stone,skills:[...G.UNITS.stonehorn.default]}];
  const outcomes=[];
  function fight(e){const raw=P.snapshot(),level=Math.min(BondProgress.PLAYER_LEVEL_CAP,e.level||BondProgress.trainerLevel(raw));raw.trainerXP=Math.max(raw.trainerXP,BondProgress.threshold(level));raw.attributes=BondProgress.cleanAttributes({[cls==='hunter'?'dex':cls==='swordsman'?'str':'int']:65,vit:40,leadership:40,agi:20},level);allocate(raw,cls);P.testing.replace(raw);
   for(const unit of party.slice(1))unit.skills=learnedKit(P.getCompanion(unit.instanceId));
   const opts={profile:P.snapshot(),encounter:e.kind?e:null,enemyLevel:e.level,seed:e.seed||16},b=new G.Battle([party,e.team||G.defaultBuild()[1]],opts);P.reserveBattle(b,e.id,opts);P.consumePrepared(b);b.run();let replayStable=true;if(b.winner!==0){P.checkpoint(b);const restored=P.restoreBattle(e.id);replayStable=!!restored&&restored.winner===b.winner&&JSON.stringify(restored.events)===JSON.stringify(b.events);}const result=P.complete(b,e.id);outcomes.push({id:e.id,winner:b.winner,time:b.time,level:BondProgress.trainerLevel(raw),aboveCapAshen:e.kind==='wild'&&A.get(e.map)?.region==='ashen'&&e.enemies.every(u=>u.level>BondProgress.PLAYER_LEVEL_CAP),replayStable,settled:!!result&&!P.snapshot().encounterSave});return b.winner===0;}
  for(const chapter of C.chapters){for(const step of chapter.steps){
   if(!P.travel(step.map)){outcomes.push({id:step.id,error:'locked route',level:BondProgress.trainerLevel(P.snapshot())});break;}
   if(['talk','return'].includes(step.kind)){P.position(A.get(step.map).guide);P.talkKeeper(step.map);}
   else if(step.kind==='kill'){for(let n=0;n<2;n++){const residents=P.population(),sp=residents.find(s=>s.present&&s.habitat.spawnBP===10000);if(!sp){outcomes.push({id:step.id,error:'No normally available resident'});break;}const encounter=P.beginHunt(sp.id);if(!fight(encounter))break;}}
   else if(step.kind==='trainer')fight(P.encounter(step.target));
  }}
  const end=P.snapshot(),before=end.coins;P.position(end.position);P.testing.replace(P.snapshot());P.position(P.snapshot().position);
  storyRuns.push({cls,chapters:end.journey.chapters.length,steps:end.journey.steps.length,rewardStable:P.snapshot().coins===before,outcomes});
 }
 check('Four classes clear the first five chapters; only above-cap Ashen wildlife may defeat the starter party',storyRuns.every(r=>r.chapters>=5&&r.steps>=40&&r.rewardStable&&r.outcomes.every(o=>o.settled&&o.replayStable&&(o.winner===0||o.aboveCapAshen))),storyRuns);
 check('Winning routes complete all 48 steps and retain chapter rewards through reload',storyRuns.some(r=>r.chapters===6&&r.steps===48)&&storyRuns.filter(r=>r.chapters===6).every(r=>r.steps===48&&r.rewardStable&&r.outcomes.every(o=>o.winner===0)),storyRuns.map(({cls,chapters,steps,rewardStable})=>({cls,chapters,steps,rewardStable})));
 check('Ashen wildlife retains its authored above-cap source levels',A.maps.filter(m=>m.region==='ashen').flatMap(m=>m.habitats).some(h=>h.level>=80)&&A.maps.filter(m=>m.region==='ashen').flatMap(m=>m.habitats).every(h=>h.level===BondContent.UNITS[h.type].sourceWildLevel));
 const navigation=[...C.trainers,...C.packs].map(o=>({id:o.id,...BondNav.find(o.map,A.get(o.map).entry,o)}));
 check('All 72 new trainer/pack interaction points reachable',navigation.every(n=>n.ok),navigation.filter(n=>!n.ok));
 const earlyBalance=[];
 function earlyFight(id,trainer,level,branch,weapon='dagger'){
  const e=P.encounter(id),profile=P.fresh(),ids=['early-fox','early-'+branch];profile.character={version:1,name:'Route Tester',weapon,look:BondOpening.defaultLook};profile.trainerXP=BondProgress.threshold(level);profile.progression={version:2,specialization:trainer==='apprentice'?null:trainer,treeGrandfathered:false};profile.attributes=BondProgress.cleanAttributes(trainer==='apprentice'?(weapon==='bow'?{dex:30,agi:18,vit:24,leadership:16}:{str:30,agi:18,vit:24,leadership:16}):{...(trainer==='hunter'?{dex:32}:trainer==='swordsman'?{str:32,dex:18}:{int:32,dex:18}),vit:28,agi:18,leadership:22},level);
  profile.companions=[{id:ids[0],type:'emberfox',ordinal:1,xp:BondProgress.threshold(level),skills:[...G.UNITS.emberfox.default],growth:{},pact:{map:'clearing-0',trainerClass:trainer}},{id:ids[1],type:branch,ordinal:1,xp:BondProgress.threshold(level),skills:[...G.UNITS[branch].default],growth:{},pact:{map:'clearing-0',trainerClass:trainer}}];
  for(const m of profile.companions){m.movesVersion=1;m.skills=BondCompanionMoves.initial(m.type);m.skills=learnedKit(m);}
  allocate(profile,trainer);
  const trainerUnit=trainer==='apprentice'?BondOpening.build(profile.character):{type:trainer,skills:[...G.UNITS[trainer].default]},team=[trainerUnit,{type:'emberfox',instanceId:ids[0],skills:[...profile.companions[0].skills]},{type:branch,instanceId:ids[1],skills:[...profile.companions[1].skills]}],opts={profile,formation:profile.formation,enemyLevel:e.level,seed:e.seed||16,encounter:e.kind?e:null},b=new G.Battle([team,e.team||G.defaultBuild()[1]],opts).run();
  earlyBalance.push({id,trainer,level,branch,weapon,winner:b.winner,time:b.time,reason:b.reason,trainerHP:Math.round(100*b.trainer(0).hp/b.trainer(0).maxHp)});
 }
 for(const branch of ['bloomslime','stonehorn'])for(const weapon of ['dagger','bow']){
  earlyFight('story:clearing:0','apprentice',4,branch,weapon);earlyFight('story:brook:1','apprentice',6,branch,weapon);earlyFight('story:brook:3','apprentice',8,branch,weapon);earlyFight('story:brook:4','apprentice',10,branch,weapon);earlyFight('early:boss:tidecrown','apprentice',12,branch,weapon);
 }
 for(const branch of ['bloomslime','stonehorn'])for(const cls of BondContent.CLASSES){
  for(const weapon of ['dagger','bow'])earlyFight('early:master:'+cls,'apprentice',15,branch,weapon);earlyFight('early:application:'+cls,cls,20,branch);earlyFight('early:counter',cls,21,branch);earlyFight('early:ability',cls,23,branch);earlyFight('early:resolution',cls,24,branch);earlyFight('early:amber:1',cls,25,branch);earlyFight('early:amber:2',cls,27,branch);earlyFight('early:amber:3',cls,28,branch);earlyFight('early:boss:amber',cls,29,branch);earlyFight('early:tree-proof',cls,31,branch);
 }
 check('Both starter-role branches and launch classes clear the opening route and optional Lv31 talent proof',earlyBalance.every(x=>x.winner===0),earlyBalance.filter(x=>x.winner!==0));
 P.reset();const member=P.summon('emberfox','mage',P.testing.grantEcho('emberfox',100)).instanceId,tankMember=P.summon('stonehorn','mage',P.testing.grantEcho('stonehorn',100)).instanceId;
 const actor=[{type:'mage',skills:['aegis','comet','frost']},{type:'emberfox',instanceId:member,skills:[...G.UNITS.emberfox.default]},{type:'stonehorn',instanceId:tankMember,skills:[...G.UNITS.stonehorn.default]}];
 const trained=P.snapshot();trained.trainerXP=BondProgress.threshold(60);P.testing.replace(trained);
 const t=C.trainers[0];P.travel(t.map);
 const attempt=()=>{const options={profile:P.snapshot(),enemyLevel:t.level,seed:16},b=new G.Battle([actor,t.team],options);P.reserveBattle(b,t.id,options);b.run();return {b,result:P.complete(b,t.id)};};
 const startCoins=P.snapshot().coins,first=attempt(),afterFirst=P.export(),twice=P.complete(first.b,t.id);
 check('NPC victory pays once with no companion Echo rolls',first.result.coins===t.coins&&P.snapshot().coins===startCoins+t.coins&&Object.keys(P.snapshot().claims).length===0&&Object.values(P.snapshot().echoes).every(x=>x.length===0));
 const repeatOptions={profile:P.snapshot(),enemyLevel:t.level,seed:16},repeatBattle=new G.Battle([actor,t.team],repeatOptions);
 check('Defeated NPC cannot reserve a rematch',!P.validEncounter(t.id)&&!P.reserveBattle(repeatBattle,t.id,repeatOptions)&&P.export()===afterFirst);
 check('NPC receipt retry cannot pay twice',twice.coins===t.coins&&P.export()===afterFirst);
 // Snapshot a pack, accept one real killed member, then force trainer death as a boundary fixture.
 P.travel('clearing-1');e=P.beginPack('pack:clearing-1');const opts={profile:P.snapshot(),encounter:e,seed:e.seed};b=new G.Battle([actor,G.defaultBuild()[1]],opts);P.reserveBattle(b,e.id,opts);
 const victim=b.units.find(u=>u.side===1);victim.hp=0;P.settleKills(b,e.id);const partial=P.snapshot();
 const reservedLife=P.population('clearing-1',Date.now()+999999).find(s=>s.id===victim.spawnId);
 check('Reserved pack member cannot respawn while fight is unresolved',!reservedLife.present&&reservedLife.life===victim.life);
 b.trainer(0).hp=0;b.checkEnd();const loss=P.complete(b,e.id);
 check('Pack loss retains only accepted partial kills',loss.kills===1&&loss.coins===6+Math.floor(victim.level/3)&&P.snapshot().tutorial.kills===1&&!P.snapshot().journey.packs[e.packId]);
 check('Other pack members remain alive with unchanged lives',e.enemies.filter(u=>u.spawnId!==victim.spawnId).every(u=>P.snapshot().spawns[u.spawnId].present&&P.snapshot().spawns[u.spawnId].life===u.life));
 P.travel('clearing-1');e=P.beginPack('pack:clearing-1');const packOptions={profile:P.snapshot(),encounter:e,seed:e.seed};b=new G.Battle([actor,G.defaultBuild()[1]],packOptions);P.reserveBattle(b,e.id,packOptions);for(let i=0;i<40;i++)b.step();P.checkpoint(b);P.testing.replace(P.snapshot());
 check('Pack snapshot and combat survive normalization/recovery',!!P.snapshot().encounterSave&&JSON.stringify(P.restoreBattle(e.id).units)===JSON.stringify(b.units));P.abandonBattle();
 const c=C.challenges.find(c=>c.kind==='tactician'),beforeChallenge=P.snapshot();beforeChallenge.journey.wins[C.trainers[0].id]=1;beforeChallenge.journey.wins[C.trainers[1].id]=2;P.testing.replace(beforeChallenge);const initial=P.snapshot().coins;
 check('Optional challenge uses receipts and grants once, without rare rolls',P.claimChallenge(c.id)&&!P.claimChallenge(c.id)&&P.snapshot().coins===initial+c.coins&&P.snapshot().inventory[c.item]===1&&P.snapshot().tutorial.kills===1);
 const manifest=BondAnimationCoverage.manifest();check('105 character rows disclose actual animation tier',manifest.length===105&&manifest.every(m=>m.approved===false&&m.states.length===7),Object.fromEntries([...new Set(manifest.map(m=>m.mode))].map(mode=>[mode,manifest.filter(m=>m.mode===mode).length])));
 check('Malformed added journey fields do not discard the old profile',P.normalize({...P.snapshot(),journey:{steps:'bad',chapters:4,challenges:['unknown']}}).companions.length===P.snapshot().companions.length);
 // A coverage tier must agree with the renderer, including legacy Elderroot art.
 const holder=document.createElement('div');document.body.append(holder);const mismatch=[];
 for(const row of manifest){holder.innerHTML=CharacterRig.art(row.type);const rig=CharacterRig.mount(holder,row.type);if((row.mode==='vector-joints')!==!!(rig.vector&&rig.animated))mismatch.push(row.type);for(const state of row.states){CharacterRig.trigger(rig,state,0,.6);CharacterRig.pose(rig,{time:.15,walking:state==='walk',attack:state==='attack'?1:0,casting:state==='cast'?1:0,fallen:state==='defeated'?1:0,victory:state==='victory',reduced:false});}}
 holder.remove();check('105 renderer mounts match declared animation tiers and accept state cues',!mismatch.length,mismatch);
 return checks;
}
