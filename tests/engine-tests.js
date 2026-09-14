/* Behavioral regression checks. Loaded by browser_check.py or tests/index.html. */
(function () {
  'use strict';
  window.runCombatTests = function ({ sweep = true } = {}) {
    const G = BondGame, results = [];
    const test = (name, fn) => { try { fn(); results.push({ name, pass: true }); } catch (error) { results.push({ name, pass: false, error: error.message }); } };
    const assert = (condition, message = 'Assertion failed') => { if (!condition) throw new Error(message); };
    // Isolate established mechanics from new passive modifiers. Real passives are
    // exercised individually below and enabled throughout the 1,000-build sweep.
    const fresh = () => {
      const build=G.defaultBuild();
      [['mend','bark','bramble'],['pounce','burn','pierce'],['guard','slam','fortify'],['frost','nova','hex'],['chain','snipe','gust'],['bloom','haste','cleanse']].forEach((skills,i)=>build[Math.floor(i/3)][i%3].skills=skills);
      const b=new G.Battle(G.migrateBuild(build));b.units.forEach(u=>u.passive=null);return b;
    };
    const advance = (b, time) => { while (!b.ended && b.time < time) b.step(); };
    const quiet = b => { b.units.forEach(u => { u.actionRemaining = 10000; u.moveSpeed = 0; }); return b; };
    const unit = (b, id) => b.units.find(u => u.id === id);
    const close = (a, b) => { a.position = {x: b.position.x - 11, y: b.position.y}; };
    test('Both classes and all ten monsters have five legal skills', () => {
      assert(Object.keys(G.UNITS).length === 12);
      Object.values(G.UNITS).forEach(u => { assert(u.skills.length === 5); assert(new Set(u.skills).size === 5); u.skills.forEach(s => assert(G.SKILLS[s]?.cd > 0)); });
    });
    test('Default builds are valid and independent', () => { const a=G.defaultBuild(), b=G.defaultBuild(); a[0][0].skills.reverse(); assert(G.validBuild(a)); assert(a[0][0].skills[0] !== b[0][0].skills[0]); });
    test('Malformed builds and duplicate monsters or skills are rejected', () => {
      const invalid=[null, {}, [], [null,null]];
      let b=G.defaultBuild(); b[0][1].type='invalid'; invalid.push(b);
      b=G.defaultBuild(); b[0][2]=b[0][1]; invalid.push(b);
      b=G.defaultBuild(); b[0][0].skills=['mend','mend']; invalid.push(b);
      b=G.defaultBuild(); b[0][0].skills=['frost','nova']; invalid.push(b);
      invalid.forEach(build=>{assert(!G.validBuild(build));let rejected=false;try{new G.Battle(G.migrateBuild(build));}catch(_){rejected=true;}assert(rejected);});
    });
    test('A battle never mutates its input build',()=>{const build=G.defaultBuild(), before=JSON.stringify(build);new G.Battle(G.migrateBuild(build)).run();assert(JSON.stringify(build)===before);});
    test('The complete event log repeats exactly for the same build',()=>{const a=fresh().run(),b=fresh().run();assert(JSON.stringify(a.events)===JSON.stringify(b.events));assert(JSON.stringify(a.units)===JSON.stringify(b.units));});
    test('Monsters retarget another living monster when their first opponent falls',()=>{const b=fresh(),actor=unit(b,'0-1');assert(b.target(actor).id==='1-1');unit(b,'1-1').hp=0;assert(b.target(actor).id==='1-2');assert(b.trainer(1).hp>0);});
    test('Monsters choose the closest monster, not a fixed slot or lowest HP',()=>{const b=fresh(),actor=unit(b,'0-1'),near=unit(b,'1-2');near.position={x:actor.position.x+1,y:actor.position.y};unit(b,'1-1').hp=1;assert(b.target(actor).id===near.id);});
    test('A nearby trainer cannot override a more distant surviving monster',()=>{const b=fresh(),actor=unit(b,'0-2');b.trainer(1).position={...actor.position};unit(b,'1-2').hp=0;assert(b.target(actor).id==='1-1');});
    test('Equal-distance monsters use stable slot ordering',()=>{const b=fresh(),actor=unit(b,'0-1');unit(b,'1-2').position={...unit(b,'1-1').position};assert(b.target(actor).id==='1-1');});
    test('Normal targeting reaches the trainer only after both monsters fall on either side',()=>{for(const side of [0,1]){const b=fresh();b.team(1-side).filter(u=>u.slot).forEach(u=>u.hp=0);assert(b.target(unit(b,side+'-1')).id===(1-side)+'-0');}});
    test('A death immediately publishes the new monster target, without duplicates',()=>{const b=fresh();b.damage(b.trainer(0),unit(b,'1-2'),9999,'Test');assert(unit(b,'0-2').targetId==='1-1');const events=b.events.filter(e=>e.kind==='retarget'&&e.actor==='0-2');assert(events.length===1&&events[0].target==='1-1');b.refreshTargets();assert(b.events.filter(e=>e.kind==='retarget'&&e.actor==='0-2').length===1);});
    test('Normal damaging skills also respect monster-first targeting',()=>{const b=fresh();unit(b,'1-1').hp=0;close(unit(b,'0-1'),unit(b,'1-2'));b.cast(unit(b,'0-1'),G.SKILLS.pounce);assert(unit(b,'1-2').hp===unit(b,'1-2').maxHp-110);assert(b.trainer(1).hp===b.trainer(1).maxHp);});
    test('A real basic-attack tick hits the remaining monster instead of a 1-HP trainer',()=>{const b=quiet(fresh()),actor=unit(b,'0-2');unit(b,'1-2').hp=0;b.trainer(1).hp=1;close(actor,unit(b,'1-1'));actor.cds=[100,100,100];actor.actionRemaining=0;b.step();assert(unit(b,'1-1').hp===unit(b,'1-1').maxHp-actor.power);assert(b.trainer(1).hp===1&&!b.ended);});
    test('Skyneedle still bypasses both monsters and declares the exception',()=>{const b=fresh();close(unit(b,'1-1'),b.trainer(0));b.cast(unit(b,'1-1'),G.SKILLS.snipe);assert(b.trainer(0).hp===b.trainer(0).maxHp-115);assert(b.team(0).filter(u=>u.slot).every(u=>u.hp===u.maxHp));const e=b.events.find(e=>e.kind==='cast');assert(e.bypass&&e.target==='0-0'&&e.skillName==='Skyneedle');});
    test('Skyneedle bypasses monsters, while Guard can still intercept it',()=>{const b=fresh();b.cast(unit(b,'0-2'),G.SKILLS.guard);close(unit(b,'1-1'),b.trainer(0));b.cast(unit(b,'1-1'),G.SKILLS.snipe);assert(b.trainer(0).hp===b.trainer(0).maxHp-46);assert(unit(b,'0-2').hp===unit(b,'0-2').maxHp-69);});
    test('Wild Lunge is a longer-reach monster strike, not a trainer bypass',()=>{const b=fresh(),a=unit(b,'0-1'),t=unit(b,'1-1');a.position={x:t.position.x-17,y:t.position.y};assert(!b.cast(a,G.SKILLS.pounce));assert(b.cast(a,G.SKILLS.pierce));assert(t.hp===t.maxHp-105&&b.trainer(1).hp===b.trainer(1).maxHp);const cast=b.events.find(e=>e.kind==='cast');assert(!cast.bypass&&cast.target===t.id);});
    test('Every Emberfox skill order stays monster-first for both navigation and damage',()=>{
      for(const first of G.UNITS.emberfox.skills)for(const second of G.UNITS.emberfox.skills.filter(s=>s!==first)){
        const build=G.defaultBuild();build[0][1].skills=[first,second];const b=new G.Battle(G.migrateBuild(build));
        let count=0;while(!b.ended){const start=b.events.length;b.step();const fox=b.units[1];
          if(fox.hp>0&&b.team(1).some(u=>u.slot))assert(fox.moveTargetId!=='1-0','Unexpected Mage pursuit with '+first+'/'+second);
          for(const e of b.events.slice(start))if(e.kind==='damage'&&e.actor===fox.id){count++;if(e.target==='1-0')assert(!b.team(1).some(u=>u.slot),'Early trainer damage: '+e.text);}}
        assert(count>1,'Fixture did not exercise repeated attacks');
      }
    });
    test('Pounce followed by Wild Lunge hits Stormowl twice without a Mage detour',()=>{const build=G.defaultBuild();build[0][1].skills=['pounce','pierce'];const b=new G.Battle(G.migrateBuild(build));advance(b,5);const hits=b.events.filter(e=>e.kind==='damage'&&e.actor==='0-1');assert(hits.length>=2&&hits.slice(0,2).every(e=>e.target==='1-1'));assert(hits[1].text.includes('Wild Lunge'));assert(b.units[1].moveTargetId==='1-1');});
    test('Bloomslime is less durable than either DPS but retains a full support heal',()=>{const b=fresh(),slime=unit(b,'1-2'),owl=unit(b,'1-1');assert(slime.maxHp===500&&slime.maxHp<G.UNITS.emberfox.hp&&slime.maxHp<G.UNITS.stormowl.hp);owl.hp-=200;assert(b.cast(slime,G.SKILLS.bloom));assert(owl.hp===owl.maxHp-75&&slime.healing===125);});
    test('Trainer targets the most injured enemy monster, then the trainer',()=>{const b=fresh(),a=b.trainer(0);unit(b,'1-2').hp=100;assert(b.target(a).id==='1-2');unit(b,'1-2').hp=0;unit(b,'1-1').hp=0;assert(b.target(a).id==='1-0');});
    test('Trainer defeat ends the battle while all four monsters can still live',()=>{const b=fresh();b.damage(b.trainer(0),b.trainer(1),9999,'Test');assert(b.ended&&b.winner===0);assert(b.units.filter(u=>u.slot&&u.hp>0).length===4);const log=b.events.length,time=b.time;b.step();assert(b.events.length===log&&b.time===time);});
    test('Defeating both enemy monsters does not itself win',()=>{const b=fresh();b.damage(b.trainer(0),unit(b,'1-1'),9999,'Test');b.damage(b.trainer(0),unit(b,'1-2'),9999,'Test');assert(!b.ended);});
    test('Healing caps at maximum HP and never revives',()=>{const b=fresh(),target=unit(b,'0-1');target.hp=target.maxHp-10;b.heal(b.trainer(0),target,110,'Mend');assert(target.hp===target.maxHp);assert(b.trainer(0).healing===10);target.hp=0;b.heal(b.trainer(0),target,110,'Mend');assert(target.hp===0);});
    test('Mend heals the living ally with the lowest percentage',()=>{const b=fresh();unit(b,'0-1').hp=200;unit(b,'0-2').hp=250;b.cast(b.trainer(0),G.SKILLS.mend);assert(unit(b,'0-2').hp===360);assert(unit(b,'0-1').hp===200);});
    test('Full-health healing is skipped, so the second useful skill fires',()=>{const b=fresh();advance(b,.6);const first=b.events.find(e=>e.kind==='cast'&&e.actor==='0-0');assert(first.text.includes('Barkskin'), first?.text);});
    test('Shields absorb damage before health and do not stack',()=>{const b=fresh(),t=unit(b,'0-2');b.cast(t,G.SKILLS.fortify);b.cast(t,G.SKILLS.fortify);assert(t.shield===200);b.damage(b.trainer(1),t,250,'Test');assert(t.hp===t.maxHp-50&&t.shield===0&&t.blocked===200);});
    test('An expired shield never absorbs an incoming hit',()=>{const b=fresh(),t=unit(b,'0-2');t.shield=200;t.shieldUntil=1;b.time=1;b.damage(b.trainer(1),t,50,'Test');assert(t.hp===t.maxHp-50&&t.shield===0,'Expired shield incorrectly blocked damage');});
    test('Guard redirects 60 percent from trainer to tank',()=>{const b=fresh(),t=unit(b,'0-2'),leader=b.trainer(0);b.cast(t,G.SKILLS.guard);b.damage(b.trainer(1),leader,100,'Test');assert(leader.hp===leader.maxHp-40&&t.hp===t.maxHp-60);});
    test('Guard applies the overtime damage multiplier exactly once',()=>{const b=fresh(),t=unit(b,'0-2'),leader=b.trainer(0);b.cast(t,G.SKILLS.guard);b.overcharge=true;b.damage(b.trainer(1),leader,100,'Test');assert(leader.hp===leader.maxHp-80&&t.hp===t.maxHp-120);});
    test('A defeated tank cannot guard',()=>{const b=fresh(),t=unit(b,'0-2'),leader=b.trainer(0);b.cast(t,G.SKILLS.guard);t.hp=0;b.damage(b.trainer(1),leader,100,'Test');assert(leader.hp===leader.maxHp-100);});
    test('Slow affects the pending action immediately',()=>{const b=quiet(fresh()),t=unit(b,'0-1');close(t,unit(b,'1-1'));t.actionRemaining=.6;b.effect(b.trainer(1),t,'slow',5);advance(b,.8);assert(!b.events.some(e=>e.actor===t.id&&e.kind==='cast'),'Slowed unit still acted at original deadline');advance(b,1.1);assert(b.events.some(e=>e.actor===t.id&&e.kind==='cast'));});
    test('Haste accelerates a pending action',()=>{const b=quiet(fresh()),t=unit(b,'0-1');close(t,unit(b,'1-1'));t.actionRemaining=1;b.effect(b.trainer(0),t,'haste',5);advance(b,.8);assert(b.events.some(e=>e.actor===t.id&&e.kind==='cast'),'Haste did not accelerate the pending action');});
    test('Action progress returns to normal immediately when slow expires',()=>{const b=quiet(fresh()),t=unit(b,'0-1');b.effect(b.trainer(1),t,'slow',.5);advance(b,.5);const remaining=t.actionRemaining;advance(b,1);assert(Math.abs(remaining-t.actionRemaining-.5)<.00001);});
    test('Action progress returns to normal immediately when haste expires',()=>{const b=quiet(fresh()),t=unit(b,'0-1');b.effect(b.trainer(0),t,'haste',.5);advance(b,.5);const remaining=t.actionRemaining;advance(b,1);assert(Math.abs(remaining-t.actionRemaining-.5)<.00001);});
    test('Cleanse restores normal pending action speed without resetting progress',()=>{const b=quiet(fresh()),t=unit(b,'1-1');b.effect(b.trainer(0),t,'slow',5);advance(b,.5);const remaining=t.actionRemaining;b.cast(unit(b,'1-2'),G.SKILLS.cleanse);advance(b,1);assert(Math.abs(remaining-t.actionRemaining-.5)<.00001);});
    test('Slow does not change real-time skill cooldowns',()=>{const b=quiet(fresh()),t=unit(b,'0-1');t.cds=[5,5,5];b.effect(b.trainer(1),t,'slow',5);advance(b,1);assert(Math.abs(t.cds[0]-4)<.001);});
    test('Burn deals exactly five ticks including its expiry boundary',()=>{const b=quiet(fresh()),t=unit(b,'1-1');b.effect(b.trainer(0),t,'burn',5);advance(b,5.1);assert(t.hp===t.maxHp-60, 'Burn damage = '+(t.maxHp-t.hp));assert(b.events.filter(e=>e.kind==='damage'&&e.target===t.id).length===5);});
    test('Burn continues after its source is defeated',()=>{const b=quiet(fresh()),source=unit(b,'0-1'),t=unit(b,'1-1');b.effect(source,t,'burn',5);source.hp=0;advance(b,5.1);assert(t.hp===t.maxHp-60);});
    test('Cleanse removes burn and slow from the whole team',()=>{const b=fresh();const slime=unit(b,'1-2');b.team(1).forEach(u=>{u.hp-=100;b.effect(b.trainer(0),u,'burn',5);b.effect(b.trainer(0),u,'slow',5);});b.cast(slime,G.SKILLS.cleanse);b.team(1).forEach(u=>{assert(!b.has(u,'burn')&&!b.has(u,'slow'));assert(u.hp===u.maxHp-35);});});
    test('Chain Spark hits both monsters in range and excludes a guarded trainer',()=>{const b=fresh();unit(b,'1-1').position={x:48,y:56};b.cast(unit(b,'1-1'),G.SKILLS.chain);assert(b.trainer(0).hp===b.trainer(0).maxHp);b.team(0).filter(u=>u.slot).forEach(u=>assert(u.hp===u.maxHp-85));});
    test('Chain Spark targets the trainer after both monsters fall',()=>{const b=fresh();unit(b,'0-1').hp=0;unit(b,'0-2').hp=0;close(unit(b,'1-1'),b.trainer(0));b.cast(unit(b,'1-1'),G.SKILLS.chain);assert(b.trainer(0).hp===b.trainer(0).maxHp-85);});
    test('Direct attacks reach a trainer with both monsters alive',()=>{const b=fresh();close(b.trainer(1),b.trainer(0));b.cast(b.trainer(1),G.SKILLS.hex);assert(b.trainer(0).hp===b.trainer(0).maxHp-115);b.team(0).filter(u=>u.slot).forEach(u=>assert(u.hp===u.maxHp));});
    test('An area attack stops resolving as soon as its trainer hit wins',()=>{const b=fresh();b.trainer(1).position={x:35,y:56};b.trainer(0).hp=1;b.cast(b.trainer(1),G.SKILLS.nova);assert(b.ended&&b.winner===1);b.team(0).filter(u=>u.slot).forEach(u=>assert(u.hp===u.maxHp));assert(b.events.at(-1).kind==='end');});
    test('An out-of-range melee skill cannot cast or damage remotely',()=>{const b=fresh(),a=unit(b,'0-1');assert(!b.cast(a,G.SKILLS.pounce));assert(a.casts===0&&b.events.length===0);});
    test('A ready basic attack waits for range without banking extra attacks',()=>{const b=quiet(fresh()),a=unit(b,'0-1');a.cds=[100,100,100];a.actionRemaining=0;advance(b,5);assert(a.damage===0&&a.actionRemaining===0);close(a,unit(b,'1-1'));b.step();assert(a.damage===a.power);advance(b,5.5);assert(a.damage===a.power);});
    test('A ready skill keeps its cooldown until it reaches the enemy',()=>{const b=quiet(fresh()),a=unit(b,'0-1');a.actionRemaining=0;advance(b,2);assert(a.cds[0]===0&&a.casts===0);a.moveSpeed=1.5;advance(b,6);assert(a.casts>0&&a.cds[0]>0);});
    test('Melee closes the gap while ranged units hold casting distance',()=>{const b=quiet(fresh()),fox=unit(b,'0-1'),owl=unit(b,'1-1');fox.moveSpeed=1.5;owl.moveSpeed=1.1;const start=fox.position.x,owlStart={...owl.position};advance(b,1);assert(fox.position.x>start+5&&fox.moving);assert(b.distance(owl,{position:owlStart})<.3);});
    test('A walking unit stops at melee range instead of passing through its target',()=>{const b=quiet(fresh()),a=unit(b,'0-1');a.moveSpeed=1.5;advance(b,8);const distance=b.distance(a,b.target(a));assert(distance<=b.reach(a)&&distance>=G.FIELD.spacing-.01);assert(!a.moving);});
    test('Slow and haste change travel distance by their stated multipliers',()=>{const traveled=effect=>{const b=quiet(fresh()),a=unit(b,'0-1');a.moveSpeed=1.5;const start={...a.position};if(effect)b.effect(b.trainer(0),a,effect,5);advance(b,.5);return b.distance(a,{position:start});};const normal=traveled(null);assert(Math.abs(traveled('slow')/normal-.6)<.001);assert(Math.abs(traveled('haste')/normal-1.3)<.001);});
    test('Stonehorn walks more slowly than Emberfox',()=>{const travel=id=>{const b=quiet(fresh()),a=unit(b,id),start={...a.position};a.moveSpeed=G.UNITS[a.type].moveSpeed;advance(b,.5);return b.distance(a,{position:start});};assert(Math.abs(travel('0-2')/travel('0-1')-.4)<.001);});
    test('Cleanse restores walking speed on the next tick',()=>{const b=quiet(fresh()),a=unit(b,'0-1');a.moveSpeed=1.5;b.effect(b.trainer(1),a,'slow',5);advance(b,.5);b.cast(b.trainer(0),G.SKILLS.cleanse);const start={...a.position};b.step();assert(Math.abs(b.distance(a,{position:start})-1.5*8*G.DT)<.001);});
    test('Trainer-strike skills navigate toward the trainer but normal focus stays monster-first',()=>{const b=quiet(fresh()),a=unit(b,'1-1');a.skills=['snipe','chain'];a.moveSpeed=1.1;a.actionRemaining=0;b.step();assert(a.moveTargetId==='0-0'&&a.targetId==='0-1'&&a.casts===0);advance(b,3);const strike=b.events.find(e=>e.kind==='damage'&&e.actor===a.id&&e.target==='0-0');assert(strike&&strike.distance<=46.001,JSON.stringify(strike));});
    test('Even Skyneedle must close to its extended range',()=>{const b=fresh(),a=unit(b,'1-1');assert(!b.cast(a,G.SKILLS.snipe));a.position={x:60,y:56};assert(b.cast(a,G.SKILLS.snipe));assert(b.events.find(e=>e.kind==='damage').reach===46);});
    test('Area spells exclude enemies outside casting range',()=>{const b=fresh(),a=b.trainer(1);a.position={x:60,y:41};assert(b.cast(a,G.SKILLS.nova));assert(unit(b,'0-1').hp===unit(b,'0-1').maxHp-60);assert(unit(b,'0-2').hp===unit(b,'0-2').maxHp);assert(b.trainer(0).hp===b.trainer(0).maxHp);});
    test('Movement separates overlapping units without NaN or leaving the clearing',()=>{const b=quiet(fresh());b.units.forEach(u=>u.position={x:50,y:56});advance(b,1);b.units.forEach(u=>assert(Number.isFinite(u.position.x)&&Number.isFinite(u.position.y)));for(const a of b.units)for(const other of b.units)if(a!==other)assert(b.distance(a,other)>9.8);});
    test('Movement does not alter previous-position snapshots or move defeated units',()=>{const b=fresh(),a=unit(b,'0-1'),start={...a.position};b.step();assert(JSON.stringify(a.previousPosition)===JSON.stringify(start));assert(a.position.x>start.x);a.hp=0;const fallen=JSON.stringify(a.position);advance(b,2);assert(JSON.stringify(a.position)===fallen);});
    test('Overcharge begins at 55 seconds and doubles damage',()=>{const b=quiet(fresh());advance(b,55);assert(b.overcharge);const t=b.trainer(0);b.damage(b.trainer(1),t,20,'Test');assert(t.hp===t.maxHp-40);});
    test('No healing, including cleanse healing, works in overcharge',()=>{const b=fresh(),t=b.trainer(0);t.hp=300;b.overcharge=true;b.heal(t,t,110,'Mend');assert(t.hp===300);assert(!b.usable(t,G.SKILLS.mend));b.cast(t,G.SKILLS.cleanse);assert(t.hp===300);});
    test('Time limit gives a draw for equal trainer health percentages',()=>{const b=quiet(fresh()).run();assert(b.time===75&&b.winner===null&&b.ended);});
    test('Time limit uses percentage, not raw trainer health',()=>{const b=quiet(fresh());b.trainer(0).hp=400;b.trainer(1).hp=370;b.run();assert(b.winner===1&&b.time===75);});
    const defaultResult=new G.Battle(G.defaultBuild()).run();
    const metrics={default:{winner:defaultResult.winner,time:defaultResult.time,hp:defaultResult.units.map(u=>u.hp)}};

    test('Legacy two-slot builds migrate without losing first or second priority',()=>{
      const old=G.defaultBuild();old.flat().forEach(u=>u.skills.pop());
      const migrated=G.migrateBuild(old);assert(G.validBuild(migrated));assert(!G.validBuild(old));
      old.flat().forEach((u,i)=>assert(JSON.stringify(u.skills)===JSON.stringify(migrated.flat()[i].skills.slice(0,2))));
      assert(G.migrateBuild({})===null&&G.migrateBuild([['bad']])===null);
    });
    test('Exactly three distinct active skills are required',()=>{
      for(const size of [0,1,2,4,5]){const b=G.defaultBuild();b[0][0].skills=G.UNITS.druid.skills.slice(0,size);assert(!G.validBuild(b));}
      const b=G.defaultBuild();b[0][0].skills=['mend','mend','bark'];assert(!G.validBuild(b));
    });
    const passiveFixture=type=>{
      const build=G.defaultBuild();build[0][1]={type,skills:[...G.UNITS[type].default]};if(type==='stonehorn')build[0][2]={type:'emberfox',skills:[...G.UNITS.emberfox.default]};
      const b=new G.Battle(build),a=b.units[1],t=b.units[4];a.position={x:t.position.x-11,y:t.position.y};return {b,a,t};
    };
    test('All ten monsters have one documented and unique passive',()=>{
      assert(G.MONSTERS.length===10&&new Set(G.MONSTERS.map(k=>G.UNITS[k].passive)).size===10);
      G.MONSTERS.forEach(k=>assert(G.PASSIVES[G.UNITS[k].passive]?.description));
    });
    test('Kindling increases strikes against Burn, not periodic Burn itself',()=>{const {b,a,t}=passiveFixture('emberfox');b.effect(a,t,'burn',5);b.strike(a,t,100,'Test',G.SKILLS.pounce);assert(t.maxHp-t.hp===115);b.damage(a,t,12,'Burn');assert(t.maxHp-t.hp===127);});
    test('Granite Hide reduces incoming and intercepted damage',()=>{const {b,a}=passiveFixture('stonehorn');b.damage(b.trainer(1),a,100,'Test');assert(a.maxHp-a.hp===90);b.cast(a,G.SKILLS.guard);b.damage(b.trainer(1),b.trainer(0),100,'Test');assert(a.maxHp-a.hp===144);});
    test('Charged Feathers procs on every third basic attack only',()=>{const {b,a,t}=passiveFixture('stormowl');for(let i=0;i<3;i++)b.strike(a,t,20,'Basic attack');assert(t.maxHp-t.hp===95);b.strike(a,t,20,'Skill',G.SKILLS.chain);assert(t.maxHp-t.hp===115&&a.basics===3);});
    test('Tender Care increases actual healing, not maximum HP',()=>{const {b,a,t}=passiveFixture('bloomslime');a.hp-=200;b.heal(a,a,125,'Test');assert(a.hp===444&&a.healing===144&&a.maxHp===500);});
    test('Winter Hunt increases strikes against Slow',()=>{const {b,a,t}=passiveFixture('frostfang');b.effect(a,t,'slow',5);b.strike(a,t,100,'Test',G.SKILLS.frostbite);assert(t.maxHp-t.hp===120);});
    test('Cinder Heart heals after offensive casts, never during Overcharge',()=>{const {b,a}=passiveFixture('cindrake');a.hp-=100;b.cast(a,G.SKILLS.fireball);assert(a.hp===a.maxHp-82);b.overcharge=true;b.cast(a,G.SKILLS.fireball);assert(a.hp===a.maxHp-82);});
    test('Shell Reserve applies a timed opening shield every fresh battle',()=>{const {b,a}=passiveFixture('ironback');assert(a.shield===160&&a.shieldUntil===12);b.time=12;b.damage(b.trainer(1),a,100,'Test');assert(a.shield===0&&a.hp===a.maxHp-100);});
    test('Last Grove triggers once, never revives a defeated monster',()=>{const {b,a}=passiveFixture('thornstag');b.damage(b.trainer(1),a,600,'Test');assert(a.shield===140&&a.passiveUsed);a.shield=0;b.damage(b.trainer(1),a,10,'Test');assert(a.shield===0);const f=passiveFixture('thornstag');f.b.damage(f.b.trainer(1),f.a,9999,'Test');assert(f.a.hp===0&&f.a.shield===0);});
    test('Gentle Current removes Slow only when restoring another ally’s HP',()=>{const {b,a}=passiveFixture('tideotter'),t=b.trainer(0);b.effect(a,t,'slow',5);b.heal(a,t,110,'Test');assert(b.has(t,'slow'));t.hp-=100;b.heal(a,t,110,'Test');assert(!b.has(t,'slow'));b.effect(a,a,'slow',5);a.hp-=100;b.heal(a,a,110,'Test');assert(b.has(a,'slow'));});
    test('Moon Ward never extends or replaces a stronger shield',()=>{const {b,a}=passiveFixture('lumimoth'),t=b.trainer(0);t.hp-=100;b.heal(a,t,20,'Test');assert(t.shield===40&&t.shieldUntil===4);b.shield(a,t,200,8,'Test');b.time=1;b.heal(a,t,20,'Test');assert(t.shield===200&&t.shieldUntil===8);});
    test('Weaker active shields also preserve stronger existing shields',()=>{const b=fresh(),a=b.trainer(0);b.shield(a,a,200,8,'A');b.time=1;b.shield(a,a,40,20,'B');assert(a.shield===200&&a.shieldUntil===8);});
    for(const [type,info] of Object.entries(G.UNITS))for(const id of info.skills)test(info.name+' / '+G.SKILLS[id].name+' resolves its advertised effect',()=>{
      const build=G.defaultBuild(),slot=info.role==='Trainer'?0:1;build[0][slot]={type,skills:[...info.default]};if(type==='stonehorn')build[0][2]={type:'emberfox',skills:[...G.UNITS.emberfox.default]};
      const b=new G.Battle(build),a=b.units[slot],s=G.SKILLS[id];b.units.forEach((u,i)=>{u.position={x:46+i,y:50};u.hp-=200;u.shield=0;u.status={};u.passive=null;});
      if(s.kind==='cleanse')b.team(0).forEach(u=>b.effect(a,u,'burn',5));
      const before=b.events.length;assert(b.cast(a,s));const ev=b.events.slice(before);assert(ev.some(e=>e.kind==='cast'&&e.skillName===s.name));
      if(['hit','trainer','aoe','frontaoe'].includes(s.kind))assert(ev.some(e=>e.kind==='damage'&&e.amount>0));
      if(s.kind.includes('heal')||s.kind==='cleanse')assert(ev.some(e=>e.kind==='heal'&&e.amount>0));
      if(s.kind.includes('shield'))assert(ev.some(e=>e.kind==='shield'&&e.amount===s.amount));
      if(['haste','selfhaste','guard'].includes(s.kind))assert(ev.some(e=>e.kind==='status'));
      if(s.effect)assert(ev.some(e=>e.kind==='status'&&e.text.includes(s.effect)));
    });
    test('Monster-only area status effects do not reach out-of-range enemies or trainers',()=>{
      const {b,a,t}=passiveFixture('frostfang');b.trainer(1).position={...t.position};b.units[5].position={x:88,y:78};
      b.cast(a,G.SKILLS.snowfall);assert(b.has(t,'slow')&&!b.has(b.units[5],'slow')&&!b.has(b.trainer(1),'slow'));
    });
    if(sweep){
      test('1,000 varied builds finish safely with all ten passives enabled',()=>{
        let seed=2026;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed>>>12)%n;};
        let wins=[0,0],draws=0,shortest=75,longest=0;const seen=new Set();
        for(let i=0;i<1000;i++){
          const build=G.defaultBuild();
          for(const team of build){const a=random(10),b=(a+1+random(9))%10;[random(2)?'druid':'mage',G.MONSTERS[a],G.MONSTERS[b]].forEach((type,slot)=>{seen.add(type);const pool=[...G.UNITS[type].skills],skills=[];for(let j=0;j<3;j++)skills.push(pool.splice(random(pool.length),1)[0]);team[slot]={type,skills};});}
          const b=new G.Battle(build).run();assert(b.ended&&b.time<=75);assert(b.events.at(-1)?.kind==='end');assert(b.events.filter(e=>e.kind==='end').length===1);
          b.units.forEach(u=>{assert(Number.isFinite(u.hp)&&u.hp>=0&&u.hp<=u.maxHp&&u.shield>=0&&u.damage>=0&&u.healing>=0);assert(Number.isFinite(u.position.x)&&Number.isFinite(u.position.y)&&u.position.x>=G.FIELD.minX&&u.position.x<=G.FIELD.maxX&&u.position.y>=G.FIELD.minY&&u.position.y<=G.FIELD.maxY);});
          assert(b.events.filter(e=>e.kind==='heal').every(e=>e.time<55));
          const fallen=new Set();
          for(const e of b.events){
            if(e.kind==='damage'&&!/: (Burn|Guard intercept) ·/.test(e.text))assert(Number.isFinite(e.distance)&&e.distance<=e.reach+.001,'Out of range: '+e.text);
            if(e.kind==='damage'&&e.actor?.endsWith('-0')===false&&e.target?.endsWith('-0')&&[1,2].some(slot=>!fallen.has(e.target[0]+'-'+slot)))assert(/: Skyneedle ·/.test(e.text),'Unpermitted bypass: '+e.text);
            if(e.kind==='defeat')fallen.add(e.target);
          }
          b.winner===null?draws++:wins[b.winner]++;shortest=Math.min(shortest,b.time);longest=Math.max(longest,b.time);
        }
        assert(seen.size===12,'Sweep must cover both classes and all monsters: '+[...seen]);metrics.variedBuilds={count:1000,wins,draws,shortest,longest};
      });
      if(window.BondWorld){
        metrics.npcs={};
        for(const [id,npc] of Object.entries(BondWorld.NPCS)){
          if(!npc.team)continue; // Wild encounters have their own objective tests.
          const b=G.defaultBuild();b[1]=npc.team;const r=new G.Battle(b).run();
          metrics.npcs[id]={defaultWinner:r.winner,time:r.time};
          test(id+' has a valid, distinct three-unit encounter',()=>assert(G.validBuild(b)&&r.ended));
        }
      }
    }
    return {passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,results,metrics};
  };
})();
