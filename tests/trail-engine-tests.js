/* Pass-09 pure mechanics, independent of live profile state. */
window.runTrailTests=function(){
  const G=BondGame,T=BondGrowth,W=BondWorld,out=[],metrics={};
  const test=(name,fn)=>{try{fn();out.push({name,pass:true});}catch(e){out.push({name,pass:false,error:e.message});}};
  const assert=(v,m='Assertion failed')=>{if(!v)throw Error(m);};
  const fresh=(id,growth={})=>new G.Battle(G.defaultBuild(),{encounter:W.NPCS[id],growth});
  const setup=(type,ids)=>{const build=G.defaultBuild(),slot=G.MONSTERS.includes(type)?1:0;if(slot&&type===build[0][2].type)build[0][2]={type:'bloomslime',skills:G.UNITS.bloomslime.default};build[0][slot]={type,skills:G.UNITS[type].default};const b=new G.Battle(build,{growth:{[type]:ids}});return {b,a:b.units[slot],t:b.units[4]};};
  for(const type of T.TYPES){
    test(type+' has an independent 9-node valid tree',()=>{assert(T.NODES.length===9&&T.clean(type,T.NODES.map(n=>n.id)).length===7);assert(T.clean(type,['might2','bad']).length===0);});
    test(type+' HP node changes real maximum health',()=>{const {a}=setup(type,['bond']);assert(a.hp===Math.round(G.UNITS[type].hp*1.06));});
    test(type+' attack nodes boost actual strikes',()=>{const {b,a,t}=setup(type,['bond','might','might2']);a.passive=null;t.passive=null;t.shield=0;a.position={...t.position};b.strike(a,t,100,'Test',{reach:12});assert(t.maxHp-t.hp===114);});
    test(type+' armor nodes reduce actual damage',()=>{const {b,a,t}=setup(type,['bond','guard','guard2']);a.passive=null;a.shield=0;b.damage(t,a,100,'Test');assert(a.maxHp-a.hp===92);});
    test(type+' movement nodes increase simulation speed',()=>{const {a,b}=setup(type,['bond','stride','stride2']);assert(Math.abs(b.speed(a)-G.UNITS[type].moveSpeed*8*1.14)<.000001);});
    test(type+' cooldown nodes shorten cast recovery',()=>{const {b,a}=setup(type,['bond','focus','focus2']);for(const u of b.units){u.position={x:50,y:50};u.hp-=100;u.actionRemaining=999;}a.actionRemaining=0;b.step();assert(a.casts===1);const first=a.cds.findIndex(cd=>cd>0);assert(Math.abs(a.cds[first]-G.SKILLS[a.skills[first]].cd*.9)<.000001);});
  }
  test('Wild pack contains exactly five living monsters and no enemy trainer',()=>{const b=fresh('wildpack');assert(b.units.length===8&&!b.trainer(1)&&b.team(1).every(u=>u.slot>0));});
  test('Pack does not end when only the first monster dies',()=>{const b=fresh('wildpack');b.damage(b.trainer(0),b.team(1)[0],9999,'Test');assert(!b.ended&&b.team(1).length===4);});
  test('Pack requires every enemy defeated',()=>{const b=fresh('wildpack');for(const u of b.team(1))b.damage(b.trainer(0),u,9999,'Test');assert(b.ended&&b.winner===0&&b.reason==='Pack defeated'&&b.events.filter(e=>e.kind==='end').length===1);});
  test('Player trainer death still ends a wild encounter immediately',()=>{const b=fresh('wildpack');b.damage(b.team(1)[0],b.trainer(0),9999,'Test');assert(b.ended&&b.winner===1&&b.team(0).length===2);});
  test('Pack normal attacks always select the closest enemy monster',()=>{const b=fresh('wildpack');for(let i=0;i<600&&!b.ended;i++){b.step();if(b.ended)break;for(const a of b.units.filter(u=>u.slot&&u.hp>0)){const monsters=b.team(1-a.side).filter(u=>u.slot);if(monsters.length)assert(b.distance(a,b.target(a))<=Math.min(...monsters.map(t=>b.distance(a,t)))+.00001);}}});
  test('Trainer-bypass skills sensibly fall back to a wild monster',()=>{const build=G.defaultBuild();build[0][0]={type:'mage',skills:['hex','frost','aegis']};const b=new G.Battle(build,{encounter:W.NPCS.wildpack}),a=b.trainer(0),t=b.priorityTarget(a);a.position={...t.position};assert(b.cast(a,G.SKILLS.hex));assert(t.hp<t.maxHp&&!b.events.find(e=>e.kind==='cast').bypass);});
  test('A boss charge cannot damage before its telegraph deadline',()=>{const b=fresh('elderroot'),boss=b.team(1)[0];b.time=8;b.bossStep();assert(b.bossCharge.until===10);b.time=9.95;b.bossStep();assert(!b.events.some(e=>e.kind==='quake'));b.time=10;b.bossStep();assert(b.events.filter(e=>e.kind==='quake').length===1);assert(b.events.filter(e=>e.arenaWide).length===3);});
  test('Slow lengthens the next boss windup',()=>{const b=fresh('elderroot'),boss=b.team(1)[0];b.time=8;b.effect(b.trainer(0),boss,'slow',5);b.bossStep();assert(b.bossCharge.until>11.3);});
  test('Phase two triggers exactly once and increases threat',()=>{const b=fresh('elderroot'),boss=b.team(1)[0],power=boss.power;boss.hp=boss.maxHp*.49;b.bossStep();b.bossStep();assert(b.bossPhase===2&&boss.power>power&&b.events.filter(e=>e.kind==='phase').length===1);});
  test('Killing a charging boss cancels the charge and all subsequent actions',()=>{const b=fresh('elderroot');b.time=8;b.bossStep();b.damage(b.trainer(0),b.team(1)[0],99999,'Test');const count=b.events.length;b.step();b.bossStep();assert(b.ended&&b.winner===0&&!b.bossCharge&&count===b.events.length);});
  test('Uncleared wild encounters lose at timeout, not win by trainer HP',()=>{const b=fresh('wildpack');b.tick=1499;for(const u of b.units)u.actionRemaining=999;b.step();assert(b.time===75&&b.winner===1&&b.reason.includes('not cleared'));});
  test('Mastery budget cannot exceed seven, including after many victories',()=>{assert(T.budget({})===3&&T.budget({defeated:['a','b']})===4&&T.budget({defeated:Array(100),collected:Array(5)})===7);});
  test('Old profile migrates region coordinates, inventory and unique claims',()=>{const s=BondProfile.normalize({version:2,area:'ruins',position:{x:350,y:410},visited:['ruins'],defeated:['mira','mira','bad'],collected:['clearing'],inventory:{biscuit:3,moonshard:1},coins:25});assert(s.version===4&&s.position.x===3350&&s.area==='ruins'&&s.inventory.biscuit===3&&s.defeated.length===1&&s.coins===25);});
  test('Malformed and overspent growth saves are normalized safely',()=>{const s=BondProfile.normalize({version:3,position:{x:Infinity,y:-999},growth:{druid:T.NODES.map(n=>n.id),mage:['might2']},inventory:{biscuit:-4},coins:-10});assert(s.growth.druid.length===3&&s.growth.mage.length===0&&s.position.x===280&&s.position.y===205&&!s.inventory.biscuit&&s.coins===0);});
  test('500 varied wild/boss builds complete with finite state and one ending',()=>{
    let seed=91271;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};
    metrics.varied={count:500,packWins:0,bossWins:0,losses:0};
    for(let i=0;i<500;i++){
      const build=G.defaultBuild(),a=G.MONSTERS[rand(10)],others=G.MONSTERS.filter(k=>k!==a),types=[rand(2)?'druid':'mage',a,others[rand(9)]];
      build[0]=types.map(type=>{const skills=[...G.UNITS[type].skills];for(let n=skills.length-1;n>0;n--){const j=rand(n+1);[skills[n],skills[j]]=[skills[j],skills[n]];}return {type,skills:skills.slice(0,3)};});
      const id=i%2?'elderroot':'wildpack',growth=Object.fromEntries(types.map(t=>[t,T.NODES.slice(0,3+rand(5)).map(n=>n.id)]));
      const b=new G.Battle(build,{growth,encounter:W.NPCS[id]}).run();
      assert(b.ended&&b.time<=75&&b.events.filter(e=>e.kind==='end').length===1);
      for(const u of b.units)assert(Number.isFinite(u.hp)&&u.hp>=0&&u.hp<=u.maxHp&&Number.isFinite(u.position.x)&&u.position.x>=10&&u.position.x<=90&&u.position.y>=32&&u.position.y<=78);
      for(const e of b.events)if(e.kind==='damage'&&!e.arenaWide&&!/: (Burn|Guard intercept) ·/.test(e.text))assert(Number.isFinite(e.distance)&&e.distance<=e.reach+.001);
      if(b.winner===0){assert(b.team(1).length===0);metrics.varied[id==='elderroot'?'bossWins':'packWins']++;}else metrics.varied.losses++;
    }
  });
  return {passed:out.filter(r=>r.pass).length,failed:out.filter(r=>!r.pass).length,results:out,metrics};
};
