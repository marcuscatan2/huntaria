/* Pure ritual and profile-normalization regressions; does not mutate live saves. */
function runRitualTests(){
  const results=[],metrics={captures:[]},G=BondGame;
  const assert=(x,m='Assertion failed')=>{if(!x)throw Error(m);};
  const test=(name,fn)=>{try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}};
  const make=(type='bloomslime',trainer='druid')=>{
    const build=G.defaultBuild();build[0][0]={type:trainer,skills:[...G.UNITS[trainer].default]};
    return new G.Battle(build,{encounter:BondWild.encounter('ritual:'+BondWild.home(type).area+':'+type)});
  };
  function ready(b){while(!b.ended&&!b.ritualReady())b.step();return b.ritualReady();}
  test('Five habitats cover all ten species exactly once',()=>assert(BondWild.HABITATS.length===5&&new Set(BondWild.HABITATS.flatMap(h=>h.types)).size===10));
  test('Invalid habitats and NPC capture IDs rejected',()=>assert(!BondWild.encounter('mira')&&!BondWild.encounter('ritual:clearing:elderroot')&&!BondWild.encounter('ritual:rise:bloomslime')&&!BondWild.encounter('ritual:clearing:emberfox:bad')));
  test('A ritual has one wild spirit, no enemy trainer',()=>{const b=make();assert(b.units.length===4&&!b.trainer(1)&&b.objective(1).label==='WILD');});
  test('No early or high-health channel',()=>{const b=make();assert(!b.beginRitual());b.time=4;assert(!b.beginRitual());b.units[3].hp=1;b.time=3.95;assert(!b.beginRitual());b.time=4;assert(b.beginRitual()&&!b.beginRitual());});
  test('Lethal hits and repeated burn retain one wild HP',()=>{const b=make(),w=b.units[3],a=b.units[1];b.damage(a,w,99999,'Test restraint');assert(w.hp===1&&!b.ended);b.effect(a,w,'burn',3);for(let i=0;i<65;i++)b.step();assert(w.hp>=1&&!b.events.some(e=>e.kind==='defeat'&&e.target===w.id));});
  for(const trainer of ['druid','mage'])for(const type of G.MONSTERS){
    test(trainer+' can bond with '+type+' using starter companions',()=>{
      const b=make(type,trainer);assert(ready(b),'Never reached ritual window');
      const at=b.time,trainerPos={...b.trainer(0).position};assert(b.beginRitual());
      while(!b.ended)b.step();
      assert(b.winner===0&&b.ritual.state==='complete'&&b.ritual.pulses===4,'Ritual failed');
      assert(Math.abs(b.time-at-4)<.001&&b.units[3].hp>0,'Incorrect duration or lethal capture');
      assert(b.trainer(0).position.x===trainerPos.x&&b.trainer(0).position.y===trainerPos.y,'Trainer moved during channel');
      assert(!b.events.some(e=>e.actor==='0-0'&&e.time>at&&['cast','heal'].includes(e.kind)),'Trainer acted during channel');
      assert(b.events.filter(e=>e.kind==='heartbeat').length===4&&b.events.filter(e=>e.kind==='bound').length===1);
      const count=b.events.length;b.step();assert(b.events.length===count&&!b.beginRitual(),'Result repeated');
      metrics.captures.push({trainer,type,time:b.time,hp:b.trainer(0).hp});
    });
  }
  test('Ritual pulses explicitly bypass monsters and respect guard',()=>{
    const b=make();assert(ready(b));const t=b.trainer(0),w=b.units[3],guard=b.units[2];
    for(const u of b.units){u.actionRemaining=100;u.status={};u.shield=0;}t.hp=t.maxHp;guard.hp=guard.maxHp;
    b.effect(guard,guard,'guard',10);b.beginRitual();for(let i=0;i<20;i++)b.step();
    assert(t.hp===t.maxHp-29&&guard.hp===guard.maxHp-39,'Expected 60% redirect then Granite Hide');
    assert(b.events.some(e=>e.ritualPulse&&e.arenaWide&&e.target===t.id&&e.actor===w.id));
  });
  test('Armor and shields reduce the arena-wide trial',()=>{
    const b=make();assert(ready(b));const t=b.trainer(0);
    for(const u of b.units){u.actionRemaining=100;u.status={};u.shield=0;}t.hp=t.maxHp;t.growth.armor=.1;b.shield(t,t,100,10,'Protection');b.beginRitual();for(let i=0;i<20;i++)b.step();
    assert(t.hp===t.maxHp&&t.shield===35&&b.ritual.pulses===1);
  });
  test('Death on the final heartbeat fails, never binds',()=>{
    const b=make();assert(ready(b));for(const u of b.units){u.actionRemaining=100;u.status={};u.shield=0;}
    b.trainer(0).hp=288;b.beginRitual();while(!b.ended)b.step();
    assert(b.ritual.pulses===4&&b.winner===1&&b.ritual.state==='failed'&&!b.events.some(e=>e.kind==='bound'));
  });
  test('An unopened ritual times out without a fake victory',()=>{const b=make();b.run();assert(b.winner===1&&b.ritual.state==='failed'&&b.reason==='Ritual timed out');});
  test('Same party and channel timing produce identical outcomes',()=>{const a=make('stormowl'),b=make('stormowl');for(const x of [a,b]){ready(x);x.beginRitual();x.run();}assert(JSON.stringify(a.events)===JSON.stringify(b.events));});
  test('Only ritual encounters restrain lethal enemy damage',()=>{const b=new G.Battle(G.defaultBuild());b.damage(b.units[1],b.units[4],99999,'Lethal');assert(b.units[4].hp===0);});
  test('Fresh profile has two companions and three papers',()=>{const s=BondProfile.normalize(null);assert(s.version===4&&s.owned.join(',')==='emberfox,stonehorn'&&s.inventory.bondcontract===3);});
  test('Legacy migration keeps equipped player species and progress',()=>{
    const s=BondProfile.normalize({version:3,area:'brook',position:{x:1600,y:400},collected:['clearing','brook'],defeated:['mira'],inventory:{biscuit:4,moonshard:2},coins:37,growth:{druid:['bond']}},['stormowl','tideotter']);
    assert(s.owned.join(',')==='emberfox,stonehorn,stormowl,tideotter'&&s.inventory.bondcontract===7&&s.inventory.biscuit===4&&s.coins===37&&s.growth.druid[0]==='bond'&&s.position.x===1600);
  });
  test('V4 ownership and valid pact records round-trip without new paper',()=>{
    const s=BondProfile.normalize({version:4,owned:['lumimoth','lumimoth','bad'],inventory:{bondcontract:1},pacts:{lumimoth:{area:'ruins',trainerClass:'mage'},emberfox:{area:'bad',trainerClass:'mage'}}});
    assert(s.owned.length===3&&s.pacts.lumimoth.trainerClass==='mage'&&!s.pacts.emberfox&&s.inventory.bondcontract===1);
    const again=BondProfile.normalize(s,['cindrake']);assert(JSON.stringify(s)===JSON.stringify(again));
  });
  test('Malformed ownership, counts and unknown pact fields are rejected',()=>{
    const s=BondProfile.normalize({version:4,owned:'all',inventory:{bondcontract:-1,coinshop:7},pacts:{stonehorn:{area:'ruins',trainerClass:'bad'}}});
    assert(s.owned.length===2&&!s.inventory.bondcontract&&!s.inventory.coinshop&&!s.pacts.stonehorn);
  });
  return {passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results,metrics};
}
