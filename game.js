/* Pure deterministic combat model. No DOM, networking, or third-party dependencies. */
(function (root) {
  'use strict';
  const DT = 0.05;
  // Simulation-space units, never CSS pixels. All viewports play the same fight.
  const FIELD = {minX: 10, maxX: 90, minY: 32, maxY: 78, spacing: 10};
  const REACH = {1: 12, 3: 27, 4: 34};
  const {UNITS, SKILLS, PASSIVES, MONSTERS} = root.BondContent;
  const FORMATION = [[{x:16,y:56},{x:33,y:41},{x:33,y:72}], [{x:84,y:56},{x:67,y:41},{x:67,y:72}]];
  function defaultBuild() { return [['druid', 'emberfox', 'stonehorn'], ['mage', 'stormowl', 'bloomslime']].map(team => team.map(type => ({type, skills: [...UNITS[type].default]}))); }
  function validTeam(team) {
    return Array.isArray(team)&&team.length===3&&team[0]&&BondContent.TRAINERS.includes(team[0].type)&&
      (!team[1]||!team[2]||(team[1].instanceId&&team[2].instanceId?team[1].instanceId!==team[2].instanceId:team[1].type!==team[2].type))&&team.every((u,i)=>i>0&&u===null||
        u&&(u.type!=='apprentice'||root.BondOpening&&Object.hasOwn(root.BondOpening.weapons,u.weapon)&&u.skills?.every(k=>root.BondOpening.weapons[u.weapon].skills.includes(k)))&&(i===0?BondContent.TRAINERS:MONSTERS).includes(u.type)&&Array.isArray(u.skills)&&u.skills.length===3&&
        new Set(u.skills).size===3&&u.skills.every(k=>UNITS[u.type].skills.includes(k)));
  }
  function validBuild(build) {return Array.isArray(build)&&build.length===2&&build.every(validTeam);}
  function soloBuild(type='druid'){const b=defaultBuild();b[0]=[type==='apprentice'?root.BondOpening.build({weapon:'dagger'}):{type,skills:[...UNITS[type].default]},null,null];return b;}
  function authoredOpponentTuning(entry) {
    return {
      power:Number.isFinite(entry.power)?Math.max(1,Math.round(entry.power)):UNITS[entry.type].power,
      skillScale:Number.isFinite(entry.skillScale)?Math.max(.1,Math.min(3,entry.skillScale)):1,
      healthScale:Number.isFinite(entry.healthScale)?Math.max(.1,Math.min(3,entry.healthScale)):1
    };
  }
  function migrateBuild(value) {
    if (!Array.isArray(value)) return null;
    const candidate = JSON.parse(JSON.stringify(value));
    for (const team of candidate) {
      if (!Array.isArray(team)) return null;
      for (const [i,u] of team.entries()) {
        if(i>0&&u===null)continue;
        if (!u || !Object.hasOwn(UNITS,u.type) || !Array.isArray(u.skills)) return null;
        if (u.skills.length===2 && new Set(u.skills).size===2 && u.skills.every(s=>UNITS[u.type].skills.includes(s))) {
          u.skills.push([...UNITS[u.type].default,...UNITS[u.type].skills].find(s=>!u.skills.includes(s)));
        }
      }
    }
    return validBuild(candidate) ? candidate : null;
  }
  class Battle {
    constructor(build, options = {}) {
      this.classTrees=options.classTrees===0?0:root.BondClassTrees.active?1:0;
      this.monsterRules=options.monsterRules===0?0:1;
      this.equipmentRules=options.equipmentRules===0?0:1;
      if (!validBuild(build)) throw new Error('Invalid team or skill selection');
      this.build = JSON.parse(JSON.stringify(build)); this.time = 0; this.tick = 0; this.events = []; this.ended = false; this.winner = null; this.reason = ''; this.overcharge = false;
      this.adventure=options.adventure===true;
      this.training=options.training===true;
      this.random=root.BondRules?.rng(options.seed??1)||(()=>.5);this.seed=options.seed??1;this.group=!!options.groupParties;this.ownerProfiles=[options.profile];
      this.obstacles=(options.obstacles||[]).filter(o=>Number.isFinite(o.x)&&Number.isFinite(o.y)&&Number.isFinite(o.radius)&&o.radius>0).map(o=>({...o}));
      this.units = build.flatMap((team, side) => team.flatMap((u, slot) => u ? ({ ...UNITS[u.type], ...(u.type==='apprentice'?root.BondOpening.base(u.weapon):{}), ...(side===1?authoredOpponentTuning(u):{}), weapon:u.weapon, instanceId:u.instanceId||null, id: `${side}-${slot}`, type: u.type, side, slot, position: {...FORMATION[side][slot]}, previousPosition: {...FORMATION[side][slot]}, moving: false, moveTargetId: null, moveSkill: null, recoveryUntil: 0, targetId: null, maxHp: UNITS[u.type].hp, hp: UNITS[u.type].hp, skills: [...u.skills], cds: [0, 0, 0], basics: 0, passiveUsed: false, actionRemaining: 0.6 + slot * 0.15, status: {}, shield: 0, shieldUntil: 0, damage: 0, healing: 0, blocked: 0, casts: 0, owner:side===0?'player-0':'enemy', ownerIndex:0, eliminated:false, regenBuffer:0 }) : []));
      const owned=(team,profile)=>!profile||team.slice(1).filter(Boolean).every(u=>Array.isArray(profile.companions)?profile.companions.some(m=>m.id===u.instanceId&&m.type===u.type):!profile.owned||profile.owned.includes(u.type));
      if(!owned(build[0],options.profile))throw Error('Unowned companion instance');
      this.defense=Array.isArray(options.defenders);
      if(this.defense){
        const defenders=options.defenders;
        if(this.group||defenders.length<1||defenders.length>5||new Set(defenders.map(u=>u.instanceId)).size!==defenders.length||defenders.some(u=>!MONSTERS.includes(u.type)||!options.profile?.companions?.some(m=>m.id===u.instanceId&&m.type===u.type)||!Array.isArray(u.skills)||u.skills.length!==3||new Set(u.skills).size!==3||!u.skills.every(k=>UNITS[u.type].skills.includes(k))))throw Error('Invalid Inner Sea defenders');
        const template=this.units.find(u=>u.side===0);
        this.units=this.units.filter(u=>u.side===1).concat(defenders.map((u,i)=>{
          const position={x:i<3?33:17,y:36+(i%3)*17},def=UNITS[u.type];
          return {...template,...def,id:'0-'+(i+1),type:u.type,instanceId:u.instanceId,slot:i+1,side:0,weapon:undefined,position,previousPosition:{...position},hp:def.hp,maxHp:def.hp,skills:[...u.skills],cds:[0,0,0],status:{},shield:0,shieldUntil:0};
        }));
      }
      if(this.group){
        if(!Array.isArray(options.groupParties)||options.groupParties.length<1||options.groupParties.length>2)throw Error('Group needs two or three parties');
        options.groupParties.forEach((party,i)=>{
          if(!validTeam(party.team))throw Error('Invalid allied party');
          if(!owned(party.team,party.profile))throw Error('Unowned allied companion instance');
          const proxy=new Battle([party.team,defaultBuild()[1]],{formation:party.formation,seed:this.seed,monsterRules:0,classTrees:0});
          this.ownerProfiles.push(party.profile);
          for(const u of proxy.units.filter(u=>u.side===0)){u.id='0-p'+(i+1)+'-'+u.slot;u.owner='player-'+(i+1);u.ownerIndex=i+1;u.position.y=35+i*20+u.slot*5;u.previousPosition={...u.position};this.units.push(u);}
        });
      }
      this.wildPartySize=Math.max(1,Math.min(3,Number.isInteger(options.wildPartySize)?options.wildPartySize:this.units.filter(u=>u.side===0&&u.ownerIndex===0).length));
      const deployment=options.formation??options.profile?.formation;
      this.formation=deployment&&root.BondFormation?BondFormation.clean(deployment):null;
      if(this.formation&&!this.defense)for(const u of this.units.filter(u=>u.side===0&&u.ownerIndex===0)){
        u.rank=this.formation[u.slot];u.position=BondFormation.position(this.formation,u.slot);u.previousPosition={...u.position};
      }
      this.encounter = options.encounter?.kind ? options.encounter : null;
      this.rescue=root.BondRaidRules?.applies(this.encounter)||false;
      this.spawnOptions=options;
      this.bossCharge = null; this.nextBossCharge = 8; this.bossPhase = 1;
      if (this.encounter) {
        if (!['pack','boss','wild'].includes(this.encounter.kind) || !Array.isArray(this.encounter.enemies) || !this.encounter.enemies.length || this.encounter.enemies.length>(this.rescue?7:this.group?4:5) || (this.encounter.kind==='wild'&&this.encounter.enemies.length!==1)) throw new Error('Invalid encounter');
        const template=this.units.find(u=>u.side===1&&u.slot>0)||this.units.find(u=>u.side===1);
        this.units=this.units.filter(u=>u.side===0).concat(this.encounter.enemies.map((entry,i)=>{
          if(!MONSTERS.includes(entry.type)||!Array.isArray(entry.skills)||entry.skills.length!==3||!entry.skills.every(s=>Object.hasOwn(SKILLS,s)))throw new Error('Invalid encounter monster');
          const pos={x:68+(i%2)*14,y:35+(i%5)*9},def=UNITS[entry.type];
          const hp=entry.hp||def.hp;
          return {...template,...def,...entry,id:'1-'+(i+1),type:entry.type,side:1,slot:i+1,
            hp,maxHp:hp,position:pos,previousPosition:{...pos},skills:[...entry.skills],cds:[0,0,0],
            status:{},shield:0,shieldUntil:0,actionRemaining:.8+i*.18};
        }));
      }
      if(this.rescue)BondRaidRules.attach(this);
      this.ritual=null;
      this.catchItem=null;this.elements=!!options.profile||options.elements===true;
      for(const u of this.units) {
        const profile=u.storyMaster?(options.profile||{}):u.side===0?this.ownerProfiles[u.ownerIndex]:options.profile;
        const companion=u.side===0&&u.instanceId?root.BondProgress?.instance(profile||{},u.instanceId):null;
        if(u.side===0&&!u.storyMaster&&u.slot===0&&profile?.character?.name)u.name=profile.character.name;
        if(companion)u.name=UNITS[u.type].name+' #'+companion.ordinal;
        const bonus=u.side===0&&!u.storyMaster&&root.BondGrowth?root.BondGrowth.stats(u.type,companion?companion.growth:(profile?.growth||options.growth)?.[u.type],this.classTrees===0,this.monsterRules===0):{hp:0,attack:0,armor:0,move:0,cooldown:0};
        u.talents=this.monsterRules&&companion?root.BondCompanionTrees.clean(u.type,companion.growth,root.BondCompanionTrees.budget(profile,companion.id)):{};
        u.growth=bonus;u.basePower=u.power;
        const base={...UNITS[u.type],...u,hp:u.maxHp,equipment:!!this.equipmentRules};
        const derived=(profile||this.monsterRules&&MONSTERS.includes(u.type))&&root.BondProgress?BondProgress.derived(u.type,profile||{},base,u.storyMaster?u.level:u.side===1?(u.level||options.enemyLevel||1):null,this.monsterRules===0):null;
        u.hardDefense=derived?.hardDefense||0;u.hardMagicDefense=derived?.hardMagicDefense||0;u.itemStats=derived?.itemStats||{};
        u.level=derived?.level||1;u.element=root.BondProgress?.ELEMENT[u.type]||null;
        u.effective=derived?.effective||{str:0,agi:0,vit:0,int:0,dex:0};u.factors=derived?.factors||{melee:1,ranged:1,magic:1};
        const wildScale=this.adventure&&u.side===1&&this.encounter?.kind==='wild'&&root.BondAdventure?BondAdventure.wildScale(this.wildPartySize):null;
        u.offense=derived?.offense||1;u.healScale=(derived?.healing||1)*(1+(bonus.healing||0))*(wildScale?.power||1);
        u.power=Math.round((derived?.power||u.power)*(wildScale?.power||1));
        u.hp=u.maxHp=Math.round((derived?.hp||u.maxHp)*(1+bonus.hp)*(wildScale?.hp||1)*(u.healthScale??1));u.moveSpeed*=1+bonus.move;
        if(this.defense&&u.side===0){const defenseBonus=root.BondFarm?.bonuses(profile).defense||0;u.hp=u.maxHp=Math.round(u.maxHp*(1+defenseBonus));}
        if(wildScale)u.skillScale=(u.skillScale??1)*wildScale.power;
        u.growth.armor=Math.min(.6,(bonus.armor||0)+(derived?.armor||0));u.growth.cooldown=Math.min(.5,(bonus.cooldown||0)+(derived?.cooldown||0));
        u.speed=(derived?.speed||100/u.interval)*(1+(bonus.speed||0));u.interval=100/u.speed;
        u.statRules=!!derived;u.magicRange=derived?.magicRange;u.regenPerSecond=derived?BondProgress.hpRecovery(u.maxHp,u.effective.vit)/6:0;u.regenBuffer=0;
        u.spawnId=u.side===1?(u.spawnId||null):null;
      }
      if(this.adventure&&root.BondAdventure)for(const u of this.units.filter(u=>u.side===0&&u.ownerIndex===0)){const hp=BondAdventure.health(options.profile||{},u.slot===0?'trainer':u.instanceId);u.hp=hp===0?0:Math.max(1,Math.round(u.maxHp*hp/10000));}
      this.refreshTargets();
      if(this.training)root.BondTraining.attach(this);
      this.effects=new root.BondCombatEffects.Effects(this);
      for(const u of this.units)this.effects.init(u);
      for (const u of this.units) if (u.passive==='shell') this.shield(u,u,160,12,'Shell Reserve');
      for(const u of this.units)this.effects.start(u);
    }
    addEnemy(entry) {
      if(this.training||this.ended||!entry?.spawnId||this.units.some(u=>u.spawnId===entry.spawnId&&u.life===entry.life))return false;
      // Reuse the same stat/passive initialization as an initial wild encounter.
      const proxy=new Battle(soloBuild(),{profile:this.spawnOptions.profile,seed:this.seed,
        adventure:this.adventure,wildPartySize:this.wildPartySize,classTrees:this.classTrees,monsterRules:this.monsterRules,equipmentRules:this.equipmentRules,encounter:{kind:'wild',enemies:[entry]}});
      const u=proxy.units.find(u=>u.side===1),slot=Math.max(0,...this.units.filter(u=>u.side===1).map(u=>u.slot))+1;
      u.id='1-'+slot;u.slot=slot;u.position={x:86,y:36+(slot%5)*8};u.previousPosition={...u.position};
      this.units.push(u);this.effects.init(u);this.effects.start(u);this.refreshTargets();
      this.emit('join',u,null,u.name+' joins the battle.');
      return u;
    }
    team(side) { return this.units.filter(u => u.side === side && u.hp > 0 && !u.eliminated); }
    trainer(side) { return this.units.find(u => u.side === side && u.slot === 0); }
    objective(side) {
      if(this.rescue&&side===0){const u=this.units.find(u=>u.storyMaster);return {hp:u.hp,maxHp:u.maxHp,label:u.name};}
      if(this.defense){const units=this.units.filter(u=>u.side===side);return {hp:units.reduce((n,u)=>n+Math.max(0,u.hp),0),maxHp:units.reduce((n,u)=>n+u.maxHp,0),label:side?'ATTACKERS':'DEFENDERS'};}
      if(this.group&&side===0){const trainers=this.units.filter(u=>u.side===0&&u.slot===0);return {hp:trainers.reduce((n,u)=>n+Math.max(0,u.hp),0),maxHp:trainers.reduce((n,u)=>n+u.maxHp,0),label:'ALLIED TRAINERS'};}
      const trainer=this.trainer(side);
      if(trainer)return {hp:trainer.hp,maxHp:trainer.maxHp,label:trainer.name};
      const units=this.units.filter(u=>u.side===side);
      return {hp:units.reduce((n,u)=>n+u.hp,0),maxHp:units.reduce((n,u)=>n+u.maxHp,0),label:this.ritual?'WILD':this.encounter?.kind==='boss'?'BOSS':'PACK'};
    }
    priorityTarget(actor) {return this.team(1-actor.side).find(u=>u.slot===0)||this.target(actor);}
    channeling(){return false;}
    ritualReady(){return false;}
    beginRitual(){return false;}
    ritualStep(){}
    emit(kind, actor, target, text, amount = 0, details = {}) { this.events.push({time: this.time, kind, actor: actor?.id, target: target?.id, side: actor?.side, text, amount, ...(actor?.temporary?{creditActor:actor.master.id}:{}), ...details});if(kind==='end')this.effects?.clear(); }
    requestEscape() {
      if(this.rescue||this.defense||this.ended||this.escape||this.trainer(0)?.hp<=0)return false;
      this.escape={tick:this.tick,untilTick:this.tick+60};
      this.emit('escape',this.trainer(0),null,'Retreating! Survive for 3 seconds.');
      this.refreshTargets();return true;
    }
    fleeing(u) {return !!this.escape&&u.side===0&&u.slot===0;}
    target(actor) {
      const distance = u => (u.position.x - actor.position.x) ** 2 + (u.position.y - actor.position.y) ** 2;
      const forced=this.effects?.target(actor);if(forced)return forced;
      return (this.effects?this.effects.enemies(actor):this.team(1-actor.side)).sort((a,b)=>distance(a)-distance(b)||a.slot-b.slot||a.id.localeCompare(b.id))[0];
    }
    refreshTargets() {
      if (this.ended) return;
      for (const actor of this.units.filter(u => u.hp > 0 && !u.eliminated)) {
        const target = this.target(actor), previousTarget = actor.targetId;
        if(!target)continue;
        actor.targetId = target.id;
        if (previousTarget && previousTarget !== target.id) this.emit('retarget', actor, target, `${actor.name} switches to ${target.name}.`, 0, {previousTarget});
      }
    }
    wounded(side) { return this.team(side).sort((a, b) => a.hp/a.maxHp - b.hp/b.maxHp || a.slot - b.slot || a.id.localeCompare(b.id))[0]; }
    has(u, effect) { return u.status[effect]?.until > this.time; }
    rate(u) { return (this.has(u, 'slow') ? .6 : 1) * (this.has(u, 'haste') ? 1.3 : 1); }
    speed(u) { return u.moveSpeed * 8 * this.rate(u); }
    distance(a, b) { return Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y); }
    reach(actor, skill) { return skill?.reach || actor.entityReach || REACH[actor.range]; }
    inRange(actor, target, skill) { return !!target && target.hp > 0 && this.distance(actor, target) <= this.reach(actor, skill) + .001; }
    offensive(skill) { return !skill || ['hit', 'trainer', 'aoe', 'frontaoe'].includes(skill.kind); }
    skillId(actor,skill){return skill?.id||actor.skills.find(id=>SKILLS[id]===skill)||null;}
    intent(actor) {
      const disabled=this.effects?.has(actor,'Interrupt');
      if(disabled)return {index:-1,skill:null,target:this.target(actor)};
      const index = actor.skills.findIndex((s, i) => actor.cds[i] <= .001 && this.usable(actor, SKILLS[s]));
      const skill = index < 0 ? null : {...SKILLS[actor.skills[index]],id:actor.skills[index]};
      if(skill){const support=root.BondCompanionTalents?.own(this.effects,'support',actor,skill);if(support!==undefined)skill.kind=support?'utility':'hit';}
      const target = skill?.kind === 'trainer' ? this.priorityTarget(actor) : this.target(actor);
      return {index, skill, target};
    }
    move() {
      // Plan from the same snapshot, then apply together: neither side gets to
      // chase the other's already-updated position. Gentle steering skirts units
      // without a navigation grid; the clearing deliberately has no obstacles.
      const alive = this.units.filter(u => u.hp > 0&&!u.eliminated);
      const plans = alive.map(u => {
        if(this.training&&u.side===1)return {u,x:u.position.x,y:u.position.y};
        if(this.fleeing(u)){u.moveTargetId=null;u.moveSkill=null;return {u,x:u.position.x-this.speed(u)*DT,y:u.position.y};}
        const {skill, target} = this.intent(u), reach = this.reach(u, this.offensive(skill) ? skill : null);
        if(!target)return {u,x:u.position.x,y:u.position.y};
        u.moveTargetId = target.id; u.moveSkill = this.offensive(skill) ? skill?.name || null : null;
        const dx = target.position.x - u.position.x, dy = target.position.y - u.position.y, distance = Math.hypot(dx, dy);
        let vx = 0, vy = 0;
        if((u.boss&&this.bossCharge)||this.channeling(u))return {u,x:u.position.x,y:u.position.y};
        if (distance > reach - .2 && this.time >= u.recoveryUntil) {
          vx = dx / distance; vy = dy / distance;
          for (const other of alive) {
            if (other === u || other === target) continue;
            const ox = other.position.x - u.position.x, oy = other.position.y - u.position.y;
            const ahead = ox * vx + oy * vy, across = ox * -vy + oy * vx;
            if (ahead > 0 && ahead < FIELD.spacing * 1.7 && Math.abs(across) < FIELD.spacing) {
              const turn = Math.abs(across) < .01 ? (u.slot % 2 ? -1 : 1) : -Math.sign(across);
              const push = (1 - Math.abs(across) / FIELD.spacing) * (1 - ahead / (FIELD.spacing * 1.7));
              const nx = -vy, ny = vx; vx += nx * turn * push * 2; vy += ny * turn * push * 2;
            }
          }
          for(const o of this.obstacles){
            const ox=o.x-u.position.x,oy=o.y-u.position.y,ahead=ox*vx+oy*vy,cross=ox*-vy+oy*vx;
            if(ahead>0&&ahead<o.radius+12&&Math.abs(cross)<o.radius+4){
              const turn=Math.abs(cross)<.1?(u.slot%2?-1:1):-Math.sign(cross),nx=-vy,ny=vx;vx+=nx*turn*2;vy+=ny*turn*2;
            }
          }
          const magnitude = Math.hypot(vx, vy), travel = Math.min(this.speed(u) * DT, distance - reach + .2);
          vx *= travel / magnitude; vy *= travel / magnitude;
        }
        return {u, x: u.position.x + vx, y: u.position.y + vy};
      });
      // Symmetric soft separation prevents centre stacking. No teleports or
      // random tie-breaks; defeated units no longer obstruct the arena.
      for (let pass = 0; pass < 3; pass++) {
        const pushes = plans.map(() => ({x: 0, y: 0}));
        for (let i = 0; i < plans.length; i++) for (let j = i + 1; j < plans.length; j++) {
          const a = plans[i], b = plans[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
          if (d >= FIELD.spacing) continue;
          const angle = (i * 7 + j * 3) * 2.399963;
          const nx = d > .0001 ? dx / d : Math.cos(angle), ny = d > .0001 ? dy / d : Math.sin(angle), amount = (FIELD.spacing - d) * .5;
          pushes[i].x -= nx * amount; pushes[i].y -= ny * amount;
          pushes[j].x += nx * amount; pushes[j].y += ny * amount;
        }
        plans.forEach((p, i) => { p.x = Math.max(FIELD.minX, Math.min(FIELD.maxX, p.x + pushes[i].x)); p.y = Math.max(FIELD.minY, Math.min(FIELD.maxY, p.y + pushes[i].y)); });
      }
      for (const p of plans) {
        if(this.training&&p.u.side===1)continue;
        if(this.channeling(p.u)){p.u.moving=false;continue;}
        p.u.moving = Math.hypot(p.x - p.u.position.x, p.y - p.u.position.y) > .001;
        for(const o of this.obstacles){const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy),r=o.radius+2;if(d<r){p.x=o.x+(d?dx/d:1)*r;p.y=o.y+(d?dy/d:0)*r;}}
        p.u.position = {x:Math.max(FIELD.minX,Math.min(FIELD.maxX,p.x)),y:Math.max(FIELD.minY,Math.min(FIELD.maxY,p.y))};
      }
      this.refreshTargets();
    }
    checkEnd() {
      const alive = [0, 1].map(s => this.objective(s).hp > 0);
      if (alive.every(Boolean)) return;
      if(this.defense){this.ended=true;this.winner=alive[0]?0:1;this.reason=alive[0]?'Inner Sea defended':'Defenders defeated';this.emit('end',null,null,alive[0]?'Your defenders held the farm.':'The defenders fell. Your farm needs repairs.');return;}
      this.ended = true; this.winner = alive[0] ? 0 : alive[1] ? 1 : null; this.reason = this.encounter && alive[0] ? (this.encounter.kind==='boss'?'Guardian defeated':this.encounter.kind==='wild'?'Wild spirit defeated':'Pack defeated') : 'Trainer defeated';
      this.bossCharge=null;
      if(this.ritual)this.ritual.state=this.winner===0?'defeated':'failed';
      this.emit('end', null, null, this.winner === null ? 'Both bonds broke. A draw.' : this.encounter && this.winner===0 ? 'The encounter is cleared. Your bond held!' : `${this.winner === 0 ? 'Grove' : 'Dusk'} wins. The opposing trainer fell.`);
    }
    damage(actor, target, amount, label, intercept = true, details = {}) {
      if (!target || target.hp<=0 || target.eliminated || this.ended) return {damage:0,absorbed:0};
      const f=this.effects,d={direct:!details.dot&&!details.debt&&!details.transfer,...details},element=this.elements&&!d.elementApplied?BondProgress.multiplier(actor?.element,target.element):1;
      if(this.monsterRules)f.begin();
      let raw=Math.max(0,Math.round(amount*element*(this.overcharge?2:1)));
      if(actor)raw=root.BondCombatHooks.change(f,'damageAmount',raw,actor,target,d);
      if(actor)raw=root.BondCombatEntities.interceptProjectile(f,actor,target,raw,d);
      const exposure=f.value(target,d.category==='magic'?'magicExposure':'physicalExposure')+(d.penetration||0)+(d.category==='magic'?d.magicBypassPoints||0:0);
      if(target.growth?.armor||exposure)raw=Math.round(raw*(1-Math.max(0,(target.growth?.armor||0)-exposure)));
      if(d.category&&target.statRules&&!(d.ignorePhysicalDefense&&d.category!=='magic')){
        let defense=d.category==='magic'?BondProgress.classic(target.effective,target.level).magicDefense:BondProgress.physicalDefense(target.effective.vit,this.random());
        if(d.category!=='magic')raw*=1-Math.max(0,(target.hardDefense||0)-exposure);
        else if(this.monsterRules){raw*=1-Math.max(0,(target.hardMagicDefense||0)-exposure);const bonusShare=Math.min(1,(d.penetratingMagicBonus||0)/Math.max(1,amount));defense=Math.max(0,defense*(1-(d.magicPenetration||0)-bonusShare*(d.magicBonusPenetration||0))-raw*exposure);}
        raw=Math.max(1,raw-defense);
      }
      if(target.temporary&&!target.structure)raw=Math.max(0,raw-.5*(d.category==='magic'?target.snapshot.mdef:target.snapshot.def));
      if(target.passive==='granite')raw=Math.round(raw*.9);
      raw=f.reduction(target,actor,raw,d);root.BondCombatPassives.emergency(f,actor,target,raw,d);
      d.shieldBefore=target.shield;
      const bypass=Math.round(raw*Math.max(0,Math.min(1,d.shieldBypass||0)));let {remaining,absorbed}=f.absorb(target,raw-bypass,actor,d);target.blocked+=absorbed;
      d.intercept=intercept;let hpDamage=f.beforeHP(actor,target,remaining+bypass,d);
      if(d.extraAbsorbed){absorbed+=d.extraAbsorbed;target.blocked+=d.extraAbsorbed;}
      hpDamage=root.BondCombatPassives.finalHP(f,target,hpDamage,d);
      const before=target.hp,floor=this.training?1:this.rescue?BondRaidRules.floor(this,target):0,dealt=Math.min(Math.max(0,before-floor),Math.max(0,hpDamage));
      target.hp-=dealt;d.hpAfter=target.hp;d.overkill=Math.max(0,hpDamage-before);if(actor)actor.damage=(actor.damage||0)+dealt;
      this.emit('damage',actor,target,label,dealt,{...d,absorbed,temporary:!!target.temporary,creditActor:actor?.temporary?actor.master.id:actor?.id});
      if(target.hp<=0)f.defeated(actor,target,d);
      if(target.hp<=0&&target.slot===0&&this.group){for(const companion of this.units.filter(u=>u.side===target.side&&u.owner===target.owner&&u.slot>0)){companion.eliminated=true;companion.moving=false;this.emit('eliminate',target,companion,companion.name+' withdraws because their trainer fell.');}}
      this.checkEnd();
      if(this.ended){f.clear();if(this.monsterRules)f.finish();return {damage:dealt,absorbed,overkill:Math.max(0,hpDamage-before)};}
      f.after(()=>{root.BondCombatPassives.afterDamage(f,actor,target,dealt,absorbed,d);root.BondClassTalents?.damaged(f,actor,target,dealt,absorbed,d);root.BondCombatHooks?.each(f,'damaged',actor,target,dealt,absorbed,d);});
      if(!this.ended&&target.hp>0&&target.hp<target.maxHp*.4&&target.passive==='lastgrove'&&!target.passiveUsed){target.passiveUsed=true;this.shield(target,target,140,6,'Last Grove');}
      if(target.hp<=0){f.after(()=>{root.BondCombatPassives.death(f,actor,target,d);root.BondCombatHooks?.each(f,'death',actor,target,d);});this.refreshTargets();}
      if(this.monsterRules)f.finish();
      return {damage:dealt,absorbed,overkill:Math.max(0,hpDamage-before)};
    }
    heal(actor, target, amount, label) {
      if (!target || target.hp <= 0 || target.eliminated || this.overcharge || this.ended) return;
      const cc=this.effects.currentCast,primary=cc?.u===actor&&!cc.primary;
      if(primary)cc.primary={kind:'heal',amount:amount*(actor.healScale||1),target};
      let offered=amount*(actor.passive==='tender'?1.15:1)*(actor.healScale||1);if(primary)offered=root.BondCombatHooks?.change(this.effects,'primary',offered,cc,'heal')??offered;
      const before=target.hp/target.maxHp,actual=this.effects.heal(actor,target,offered,label,{primary:true,active:cc?.u===actor,itemPrimary:primary,castId:cc?.itemCastId,legacy:true});
      if(cc?.u===actor)cc.receivers.push({kind:'heal',target,actual,primary,before});
      if (actual) {
        if(actor.passive==='current' && target!==actor) delete target.status.slow;
        if(actor.passive==='moonward') this.shield(actor,target,40,4,'Moon Ward');
      }
    }
    shield(actor,target,amount,duration,label) {
      const cc=this.effects.currentCast,primary=cc?.u===actor&&!cc.primary;if(primary)cc.primary={kind:'shield',amount,target};
      if(primary)amount=root.BondCombatHooks?.change(this.effects,'primary',amount,cc,'shield')??amount;
      const actual=this.effects.shield(actor,target,amount,duration,label,{active:cc?.u===actor,itemPrimary:primary,castId:cc?.itemCastId});if(cc?.u===actor)cc.receivers.push({kind:'shield',target,actual,primary});return actual;
    }
    effect(actor, target, effect, duration) {
      if (!target || target.hp <= 0 || target.eliminated || this.ended) return;
      const old=target.status[effect],packet={source:actor,target,key:effect,kind:effect==='burn'?'dot':effect==='slow'?'basicPenalty':effect,value:effect==='slow'?.25:1,duration,extra:{active:!!this.effects.currentCast,harmful:actor.side!==target.side}};
      root.BondEquipmentEffects.each(this.effects,'effect',packet);duration=packet.duration;
      target.status[effect] = {until: this.time + duration, source: actor.id, next: this.time + 1,applied:this.time,itemBurnTicks:old?.until>this.time?old.itemBurnTicks||0:0};
      root.BondEquipmentEffects.each(this.effects,'effected',actor,target,{...target.status[effect],key:effect,kind:packet.kind,value:packet.value,legacyStatus:effect,active:packet.extra.active},old);
      this.emit('status', actor, target, `${target.name} gains ${effect} for ${duration}s.`);
    }
    usable(actor, skill) {
      if(this.effects?.has(actor,'Silence'))return false;
      if(skill.workbook)return root.BondCombatKits.usable(this.effects,actor,skill);
      if (['heal','teamheal'].includes(skill.kind)) return !this.overcharge && this.effects.core(actor).some(u => u.maxHp - u.hp >= 25);
      if (skill.kind === 'selfheal') return !this.overcharge && actor.maxHp-actor.hp>=25;
      if (skill.kind === 'cleanse') return this.team(actor.side).some(u => this.has(u, 'slow') || this.has(u, 'burn') || (!this.overcharge && u.maxHp - u.hp >= 30));
      return true;
    }
    strike(actor, target, amount, label, skill) {
      this.lastStrikeHit=false;
      if(!skill)target=root.BondCombatEntities.lure(this.effects,actor,target);
      if(!this.inRange(actor,target,skill)||actor.eliminated)return false;
      const category=skill?.category||actor.basicCategory;
      if(!skill)actor.basics++;
      if(actor.passive==='kindling'&&this.has(target,'burn'))amount*=1.15;
      if(actor.passive==='winter'&&this.has(target,'slow'))amount*=1.2;
      if(!skill&&actor.passive==='charged'&&actor.basics%3===0)amount+=35;
      if(skill)amount*=(actor.factors?.[category]||1)*(actor.skillScale??1)*(1+(actor.growth?.skillPower?.[this.skillId(actor,skill)]||0));
      if(category==='magic'&&actor.magicRange){const [min,max]=actor.magicRange,mean=(min+max)/2;if(max>min)amount*=(min+Math.floor(this.random()*(Math.floor(max-min)+1)))/(skill?mean:Math.round(mean));}
      if(category==='magic')amount+=actor.itemMagicFlat||0;
      amount*=(1+(actor.growth?.attack||0))*(1+this.effects.value(actor,category==='magic'?'magicPower':'physicalPower'));
      const cc=this.effects.currentCast,primary=!skill||!cc?.primary;
      if(skill&&cc?.u===actor&&primary){cc.primary={kind:'damage',amount,category,target};amount=root.BondCombatHooks?.change(this.effects,'primary',amount,cc,'damage')??amount;amount+=(cc.mods.bonus||0);}
      const result=this.effects.direct(actor,target,amount,label,{category,active:!!skill,basic:!skill,primary,castId:cc?.itemCastId,secondary:!primary,area:['aoe','frontaoe'].includes(skill?.kind),reach:this.reach(actor,skill),blockable:actor.delivery==='ranged'&&!['aoe','frontaoe'].includes(skill?.kind)});
      if(skill&&cc?.u===actor){cc.results.push({...result,target,primary,category});if(primary)cc.primary.result=result;}
      this.lastStrikeHit=result.hit;
      return true;
    }
    cast(actor, skill) {
      if (actor.hp <= 0 || actor.eliminated || this.ended) return false;
      if(skill.workbook)return root.BondCombatKits.cast(this.effects,actor,skill);
      const target = this.target(actor);
      const castTarget = skill.kind === 'trainer' ? this.priorityTarget(actor) : skill.kind === 'hit' ? target : actor;
      if (this.offensive(skill) && !this.inRange(actor, skill.kind === 'trainer' ? castTarget : target, skill)) return false;
      const c=new root.BondCombatKits.Context(this.effects,actor,{...skill,id:this.skillId(actor,skill),kind:this.offensive(skill)?'hit':skill.kind});c.mods=root.BondCombatPassives.beforeCast(this.effects,c);root.BondClassTalents.beforeCast(this.effects,c);root.BondCombatHooks?.each(this.effects,'beforeCast',c);this.effects.currentCast=c;this.effects.begin();
      const bypass=skill.kind==='trainer'&&!!this.trainer(1-actor.side);
      actor.casts++; this.emit('cast', actor, castTarget, `${actor.name} uses ${skill.name}${bypass ? ' — targets the trainer directly' : ''}.`, 0, {skillName: skill.name, skillKind: skill.kind, bypass});
      root.BondEquipmentEffects.each(this.effects,'castStarted',c);if(actor.hp<=0||this.ended){this.effects.currentCast=null;this.effects.finish();return true;}
      const supportAmount=skill.amount*(1+(actor.growth?.skillPower?.[this.skillId(actor,skill)]||0));
      if (['hit', 'trainer'].includes(skill.kind)) {
        const victim = skill.kind === 'trainer' ? this.priorityTarget(actor) : target;
        this.strike(actor, victim, skill.amount, skill.name, skill);
        if (this.lastStrikeHit&&skill.effect) this.effect(actor, victim, skill.effect, skill.duration);
      } else if (['aoe', 'frontaoe'].includes(skill.kind)) {
        let victims = this.effects.enemies(actor);
        if (skill.kind === 'frontaoe' && victims.some(u => u.slot > 0)) victims = victims.filter(u => u.slot > 0);
        for (const victim of victims) if(this.strike(actor, victim, skill.amount, skill.name, skill) && this.lastStrikeHit && skill.effect) this.effect(actor,victim,skill.effect,skill.duration);
      } else if (skill.kind === 'heal') this.heal(actor, this.effects.lowest(actor), supportAmount, skill.name);
      else if (skill.kind === 'teamheal') this.effects.core(actor).forEach(u=>this.heal(actor,u,supportAmount,skill.name));
      else if (skill.kind === 'selfheal') this.heal(actor,actor,supportAmount,skill.name);
      else if (skill.kind === 'teamshield') this.effects.core(actor).forEach(u=>this.shield(actor,u,supportAmount,skill.duration,skill.name));
      else if (skill.kind === 'selfhaste') this.effect(actor,actor,'haste',skill.duration);
      else if (['shield', 'selfshield'].includes(skill.kind)) {
        const victim = skill.kind === 'selfshield' ? actor : this.effects.lowest(actor);
        this.shield(actor,victim,supportAmount,skill.duration,skill.name);
      } else if (skill.kind === 'guard') this.effect(actor, actor, 'guard', skill.duration);
      else if (skill.kind === 'haste') this.effects.core(actor).forEach(u => this.effect(actor, u, 'haste', skill.duration));
      else if (skill.kind === 'cleanse') this.effects.core(actor).forEach(u => { if(!this.effects.itemUsers?.length){delete u.status.slow;delete u.status.burn;}this.effects.cleanse(actor,u,null,true);this.heal(actor, u, supportAmount, skill.name); this.emit('status', actor, u, `${u.name} is cleansed of slow and burn.`); });
      if(actor.passive==='cinder' && this.offensive(skill)) this.heal(actor,actor,18,'Cinder Heart');
      this.effects.currentCast=null;this.effects.finish();
      if(!this.ended){root.BondCombatPassives.afterCast(this.effects,c);root.BondClassTalents.afterCast(this.effects,c);root.BondCombatHooks?.each(this.effects,'afterCast',c);}
      return true;
    }
    bossStep() {
      const boss=this.units.find(u=>u.boss&&u.hp>0);
      if(!boss||this.ended)return;
      const pattern=root.BondCampaign?.bosses[boss.type];
      if(pattern){
        if(this.bossPhase===1&&boss.hp<boss.maxHp*pattern.phaseAt){this.bossPhase=2;this.emit('phase',boss,boss,boss.name+' awakens: '+pattern.name+' accelerates.');}
        if(this.bossCharge){
          if(this.time+.001>=this.bossCharge.until){
            const charge=this.bossCharge;this.bossCharge=null;
            this.emit('quake',boss,boss,pattern.name+' lands. Recovery window: '+pattern.recovery.toFixed(1)+' seconds.',0,{pattern:pattern.target});
            for(const id of charge.targets){const target=this.units.find(u=>u.id===id)||this.effects.entities.find(u=>u.id===id);if(!target||target.hp<=0||target.eliminated)continue;
              this.damage(boss,target,pattern.damage*(this.bossPhase===2?pattern.phaseDamage:1)*(boss.offense||1),pattern.name,true,{arenaWide:true});
              if(!this.ended)this.effect(boss,target,pattern.effect,3);
            }
            boss.actionRemaining=Math.max(boss.interval,pattern.recovery);boss.recoveryUntil=this.time+pattern.recovery;
            this.nextBossCharge=this.time+pattern.interval*(this.bossPhase===2?pattern.phaseInterval:1);
            this.emit('recovery',boss,boss,boss.name+' is recovering.',0,{until:boss.recoveryUntil});
          }
        }else if(this.time>=this.nextBossCharge){
          const allies=[...this.team(0),...this.effects.entities.filter(e=>e.side===0&&e.hp>0&&!e.untargetable)],xs=allies.map(u=>u.position.x),edge=pattern.target==='front'?Math.max(...xs):Math.min(...xs);
          const targets=pattern.target==='all'?allies:allies.filter(u=>Math.abs(u.position.x-edge)<16);
          const until=this.time+pattern.warning/this.rate(boss);
          this.bossCharge={until,started:this.time,name:pattern.name,hint:pattern.hint,pattern:pattern.target,targets:targets.map(u=>u.id)};
          this.emit('telegraph',boss,boss,pattern.name+' — '+pattern.hint+'. Marked targets are locked until impact.',0,{until,targets:this.bossCharge.targets});
        }
        return;
      }
      if(this.bossPhase===1&&boss.hp<boss.maxHp*.5) {
        this.bossPhase=2;boss.power=Math.round(boss.power*1.2);
        this.emit('phase',boss,boss,boss.name+' awakens! Quakes now charge more often.');
      }
      if(this.bossCharge) {
        if(this.time+0.001>=this.bossCharge.until) {
          this.bossCharge=null;
          this.emit('quake',boss,boss,'Bramblequake crashes across the arena. Shields and armor soften the blow.');
          for(const target of [...this.team(0),...this.effects.entities.filter(e=>e.side===0&&e.hp>0&&!e.untargetable)])this.damage(boss,target,(this.bossPhase===2?120:90)*(boss.offense||1),'Bramblequake',true,{arenaWide:true});
          boss.actionRemaining=boss.interval;boss.recoveryUntil=this.time+.7;
          this.nextBossCharge=this.time+(this.bossPhase===2?7:10);
        }
      } else if(this.time>=this.nextBossCharge) {
        const until=this.time+2/this.rate(boss);
        this.bossCharge={until,started:this.time};
        this.emit('telegraph',boss,boss,boss.name+' is charging Bramblequake — an arena-wide strike!',0,{until});
      }
    }
    step() {
      if (this.ended) return;
      this.tick++; this.time = Math.round(this.tick * DT * 100) / 100;
      for (const u of this.units) { u.previousPosition = {...u.position}; u.wasMoving=u.moving; u.moving = false; }
      if(this.training){root.BondTraining.step(this);if(this.ended){this.effects.clear();return;}}
      if(this.rescue){BondRaidRules.step(this);if(this.ended)return;}
      this.effects.tick();if(this.ended)return;
      this.refreshTargets();
      if (!this.overcharge && this.time >= 55) { this.overcharge = true; this.emit('overcharge', null, null, 'OVERCHARGE · Healing stops. All damage doubles.'); }
      // Resolve timed effects for everyone before actions. Cooldowns use real battle
      // seconds; slow/haste instead change how quickly the action meter advances.
      for (const u of [...this.units].sort((a,b)=>a.id.localeCompare(b.id))) {
        if (u.hp <= 0 || u.eliminated || this.ended) continue;
        u.cds = u.cds.map(cd => Math.max(0, cd - DT));
        if (u.shieldUntil <= this.time) u.shield = 0;
        if(!this.overcharge&&u.hp<u.maxHp&&u.regenPerSecond>0&&!u.wasMoving){
          u.regenBuffer+=DT;
          if(u.regenBuffer>=6-1e-9){u.regenBuffer-=6;const gain=Math.min(u.maxHp-u.hp,BondProgress.hpRecovery(u.maxHp,u.effective.vit));u.hp+=gain;this.emit('regen',u,u,u.name+' regenerates '+gain+' HP.',gain);}
        }else u.regenBuffer=0;
        const burn = u.status.burn;
        if (burn && burn.next <= this.time + 0.001 && burn.next <= burn.until + 0.001) { burn.next += 1; const source = this.units.find(v => v.id === burn.source); this.damage(source, u, 12, 'Burn',false,{dot:true,direct:false,proc:true,category:'magic',dotKey:'burn',dotEffect:burn}); }
        if (u.hp <= 0 || this.ended) continue;
        for (const effect of Object.keys(u.status)) if (u.status[effect].until <= this.time) delete u.status[effect];
        // Keep at most one ready action while walking; never bank a burst of hits.
        u.actionRemaining = Math.max(-DT, u.actionRemaining - DT * this.rate(u));
      }
      if (this.ended) return;
      this.bossStep();
      this.ritualStep();
      if(this.ended)return;
      this.move();
      // Fixed alternation avoids giving the same side every tied action. Keeping
      // meter overshoot avoids cumulative rounding drift at the 50ms tick size.
      const order = this.units.filter(u => u.hp > 0 && !u.eliminated && u.actionRemaining <= 0.00001)
        .sort((a, b) => a.actionRemaining - b.actionRemaining || ((a.side + this.tick) % 2) - ((b.side + this.tick) % 2) || a.slot - b.slot);
      for (const u of order) {
        if (u.hp <= 0 || u.eliminated || this.ended || this.fleeing(u) || (u.boss && (this.bossCharge||this.time<u.recoveryUntil)) || this.channeling(u) || this.effects.has(u,'Interrupt')) continue;
        const {index, skill, target} = this.intent(u);
        if(!skill&&this.effects.value(u,'nextBasicDelay')>0){u.actionRemaining+=u.interval*this.effects.value(u,'nextBasicDelay');for(const [key,e] of Object.entries(u.effects))if(e.kind==='nextBasicDelay')delete u.effects[key];continue;}
        const acted = skill ? this.cast(u, skill) : this.strike(u, target, u.power, 'Basic attack');
        if (!acted) { u.actionRemaining = 0; continue; }
        if (index >= 0&&!skill.workbook) u.cds[index] = skill.cd*(1-Math.min(.5,(u.growth?.cooldown||0)+(u.growth?.skillCooldown?.[skill.id]||0)));
        u.recoveryUntil = this.time + (u.type === 'stonehorn' ? .5 : u.range === 1 ? .3 : .2);
        u.moving = false;
        u.actionRemaining += 100/u.speed*(skill?1:this.effects.basicInterval(u));
      }
      if(!this.ended&&this.escape&&this.trainer(0).hp<=0){this.ended=true;this.winner=1;this.reason='Trainer defeated';this.emit('end',null,null,'Your trainer fell before escaping.');}
      if(!this.ended&&this.escape&&this.tick>=this.escape.untilTick){
        this.ended=true;this.escaped=true;this.winner=null;this.reason='Escaped';this.bossCharge=null;
        this.emit('end',this.trainer(0),null,'Escaped.');
      }
      if (!this.ended && this.time >= 75) {
        const a = this.objective(0), b = this.objective(1), delta = a.hp/a.maxHp - b.hp/b.maxHp;
        this.winner = Math.abs(delta) < 0.00001 ? null : delta > 0 ? 0 : 1; this.ended = true; this.reason = 'Time limit · trainer health %';
        if(this.encounter){this.winner=1;this.reason='Time limit · encounter not cleared';}
        if(this.ritual){this.ritual.state='failed';this.reason='Time limit · wild spirit escaped';}
        this.emit('end', null, null, this.encounter ? 'Time limit. Clear all enemies before 75 seconds to win.' : this.winner === null ? 'Time limit. Equal trainer health: draw.' : `Time limit. ${this.winner === 0 ? 'Grove' : 'Dusk'} wins on trainer health percentage.`);
      }
    }
    run() { while (!this.ended) this.step(); return this; }
  }
  root.BondGame = { UNITS, SKILLS, PASSIVES, MONSTERS, DT, FIELD, REACH, Battle, defaultBuild, soloBuild, validTeam, validBuild, migrateBuild };
})(globalThis);
