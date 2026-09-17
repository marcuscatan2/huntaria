/* Deterministic effect ledger. Core actors, temporary entities and proc packets stay distinct. */
(function(root){
'use strict';
const alive=u=>!!u&&u.hp>0&&!u.eliminated;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
class Effects{
 constructor(battle){this.battle=battle;this.queue=[];this.sequence=0;this.entities=[];this.barriers=[];this.zones=[];this.post=[];this.depth=0;}
 begin(){this.depth++;}
 after(fn){const run=this.itemDepth?()=>root.BondEquipmentEffects.H.isolated(this,fn):fn;if(this.depth)this.post.push(run);else if(!this.battle.ended)run();}
 finish(){this.depth=Math.max(0,this.depth-1);if(this.depth)return;while(this.post.length&&!this.battle.ended){const fn=this.post.shift();fn();}if(this.battle.ended)this.post=[];}
 init(u){u.effects={};u.pools=[];u.kit={};u.debt=[];u.critChance=.05+(u.itemStats?.crit||0)/100;u.encounterActor=!u.temporary;root.BondEquipmentEffects?.init(this,u);}
 core(u){return this.battle.team(u.side).filter(v=>v.owner===u.owner&&!v.storyMaster);}
 trainer(u){return this.core(u).find(v=>v.slot===0);}
 others(u){return this.core(u).filter(v=>v!==u);}
 lowest(u,list=this.core(u)){return [...list].filter(alive).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||(a.slot===0?-1:b.slot===0?1:0)||a.id.localeCompare(b.id))[0];}
 threatened(u){return alive(u)&&this.battle.units.some(v=>alive(v)&&v.side!==u.side&&this.battle.target(v)?.id===u.id);}
 enemies(u){return [...this.battle.team(1-u.side),...this.entities.filter(v=>alive(v)&&!v.untargetable&&v.side!==u.side)];}
 nearby(u,point,radius,cap=3,primary=null){return this.enemies(u).filter(v=>this.battle.distance(point,v)<=radius+.001).sort((a,b)=>(a===primary?-1:b===primary?1:0)||this.battle.distance(point,a)-this.battle.distance(point,b)||a.id.localeCompare(b.id)).slice(0,cap);}
 stats(u){
  if(u.snapshot)return u.snapshot;
  const base=root.BondContent.UNITS[u.type],basis=(u.attackBase||base?.attackBase||'STR').toUpperCase(),category=basis.startsWith('INT')?'magic':basis.startsWith('DEX')?'ranged':'melee';
  const innate=u.basePower||base?.power||u.power,scale=u.skillScale??1;
  const A=innate*(u.factors?.[category==='magic'?'melee':category]||1)*scale*(1+this.value(u,'physicalPower'));
  const M=(innate*(u.factors?.magic||1)*scale+(u.itemMagicFlat||0))*(1+this.value(u,'magicPower'));
  return {A,M,H:u.maxHp,P:category==='magic'?M:A,category,hit:Math.floor(u.effective?.dex||0)+u.level+this.value(u,'hit'),def:root.BondProgress?.physicalDefense(u.effective?.vit||0,0)||0,mdef:root.BondProgress?.classic(u.effective||{},u.level).magicDefense||0};
 }
 has(u,key){return !!u?.effects?.[key]&&u.effects[key].until>this.battle.time;}
 get(u,key){return this.has(u,key)?u.effects[key]:null;}
 value(u,kind){let positive=0,negative=0;for(const e of Object.values(u?.effects||{}))if(e.until>this.battle.time&&e.kind===kind&&(!e.poolKey||u.pools?.some(p=>p.key===e.poolKey&&p.amount>0&&p.until>this.battle.time))&&(!e.requiresEffect||this.has(u,e.requiresEffect))&&(!e.requiresStatus||this.battle.has(u,e.requiresStatus))){positive=Math.max(positive,e.value||0);negative=Math.min(negative,e.value||0);}return positive+negative;}
 put(source,target,key,kind,value,duration,extra={}){
  if(!alive(target)||this.battle.ended)return null;
  if(this.itemDepth)extra={...extra,item:true};
  const packet={source,target,key,kind,value,duration,extra};root.BondCombatHooks?.each(this,'effect',packet);if(packet.cancel)return null;value=packet.value;duration=packet.duration;kind=packet.kind;extra=packet.extra;
  const old=this.get(target,key),amount=old&&old.kind===kind&&!extra.replace?(value>=0?Math.max(old.value,value):Math.min(old.value,value)):value;
  const e={key,kind,value:amount,source:source.id,until:this.battle.time+duration,...extra};target.effects[key]=e;
  root.BondCombatHooks?.each(this,'effected',source,target,e,old);
  this.battle.emit('status',source,target,key,0,{effect:key,duration});return e;
 }
 remove(u,key){const e=this.get(u,key);if(e)delete u.effects[key];return e;}
 ready(u,key,seconds){const now=this.battle.time;if((u.kit[key]??-Infinity)>now+1e-8)return false;u.kit[key]=now+seconds;return true;}
 add(u,key,n,max=Infinity){max=root.BondCombatHooks?.change(this,'capacity',max,u,key)??max;return u.kit[key]=clamp((u.kit[key]||0)+n,0,max);}
 take(u,key,max=Infinity){const n=Math.min(u.kit[key]||0,max);u.kit[key]=(u.kit[key]||0)-n;return n;}
 later(source,target,delay,fn,{ownerRequired=false,label='Delayed effect'}={}){const run=this.itemDepth?()=>root.BondEquipmentEffects.H.isolated(this,fn):fn;this.queue.push({id:++this.sequence,at:this.battle.time+delay,source,target,fn:run,ownerRequired,label});}
 start(u){root.BondCompanionTalents?.own(this,'prepare',u);root.BondCombatPassives?.start(this,u);root.BondClassTalents?.start(this,u);root.BondCompanionTalents?.own(this,'start',u);root.BondEquipmentEffects?.start(this,u);}
 tick(){
  const b=this.battle;
  this.zones=this.zones.filter(z=>alive(z.owner)&&z.until>b.time);
  for(const u of b.units){
   this.syncShield(u);
   if(!alive(u))continue;
   for(const [key,e] of Object.entries(u.effects))if(e.until<b.time-1e-8||e.until<=b.time+1e-8&&e.kind!=='dot'){delete u.effects[key];if(e.expire)e.expire();root.BondCombatHooks?.each(this,'effectExpired',u,e);}
   root.BondCombatPassives?.tick(this,u);
   root.BondClassTalents?.tick(this,u);
   root.BondCompanionTalents?.own(this,'tick',u);root.BondEquipmentEffects?.tick(this,u);
  }
  const due=this.queue.filter(e=>e.at<=b.time+1e-8).sort((a,b)=>a.at-b.at||a.id-b.id);
  this.queue=this.queue.filter(e=>e.at>b.time+1e-8);
  for(const e of due){if(b.ended)break;if(!e.ownerRequired||alive(e.source))e.fn();}
  if(!b.ended)root.BondCombatEntities?.step(this);
  if(b.ended)this.clear();
 }
 clear(){this.queue=[];this.post=[];this.zones=[];for(const e of this.entities)if(alive(e))this.despawn(e,'battle-end');this.barriers=[];}
 syncShield(u){
  if(!u.pools)return;
  // Import a legacy initial shield only once; ordinary subsequent grants use this ledger.
  const expired=u.pools.filter(p=>p.until<=this.battle.time+1e-8&&p.amount>0);
  u.pools=u.pools.filter(p=>p.until>this.battle.time+1e-8&&p.amount>0);
  u.shield=u.pools.reduce((n,p)=>n+p.amount,0);u.shieldUntil=Math.max(0,...u.pools.map(p=>p.until));
  for(const p of expired)root.BondCombatHooks?.each(this,'expired',u,p);
 }
 shield(source,target,amount,duration,label,options={}){
  if(this.itemDepth)options={...options,item:true};
  if(!alive(target)||this.battle.ended)return 0;
  this.syncShield(target);
  const grant={source,target,amount,duration,label,options};root.BondCombatHooks?.each(this,'shield',grant);amount=grant.amount;duration=grant.duration;
  const key=options.key||source.id+':'+label,old=target.pools.find(p=>p.key===key),before=old?.amount||0;
  let desired=Math.max(0,Math.round(amount*(1+this.value(source,'shieldOutput'))*(1+this.value(target,'shieldReceived'))));
  const brittle=this.get(target,'Brittle');if(brittle){const owner=this.battle.units.find(u=>u.id===brittle.source),weakness=root.BondCompanionTalents?.own(this,'brittle',owner,target,brittle);if(weakness===undefined){this.remove(target,'Brittle');desired=Math.round(desired*.75);}else desired=Math.round(desired*(1-weakness));}
  desired=options.accumulate?before+desired:Math.max(before,desired);
  desired=Math.min(desired,before+Math.floor(options.maximum??Infinity),options.cap??Infinity,Math.max(0,Math.floor(target.maxHp*.25)-(target.shield-before)));
  const granted=Math.max(0,desired-before);
  if(options.sharedDraft){options.sharedDraft.push({target,old,before,desired,duration,key});return granted;}
  if(desired<=0)return 0;
  const pool={key,label,source:source.id,amount:desired,capacity:desired,until:this.battle.time+duration,cast:source.casts||0,talent:!!options.talent,item:!!options.item,active:!!options.active,itemPrimary:!!options.itemPrimary,absorbed:0};
  if(old)Object.assign(old,pool);else target.pools.push(pool);
  this.syncShield(target);this.battle.emit('shield',source,target,label,desired,{granted,pool:key});
  root.BondCombatHooks?.each(this,'shielded',source,target,granted,label,old||pool,options);
  return granted;
 }
 sharedShield(source,targets,amount,duration,label,options={}){
  const drafts=[],recipients=[...new Set(targets)].filter(alive);
  for(const [index,target] of recipients.entries())this.shield(source,target,amount,duration,label,{...options,itemPrimary:!!options.itemPrimary&&index===0,sharedDraft:drafts});
  if(!drafts.length)return 0;
  // One reservoir must fit every recipient's remaining shield allowance.
  const capacity=Math.min(...drafts.map(d=>d.desired)),before=Math.max(0,...drafts.map(d=>d.before)),granted=Math.max(0,capacity-before),shared={remaining:capacity,splashCost:options.splashCost||1};
  for(const d of drafts){
   const p={key:d.key,label,source:source.id,amount:capacity,capacity,until:this.battle.time+d.duration,cast:source.casts||0,talent:!!options.talent,item:!!options.item,active:!!options.active,itemPrimary:!!options.itemPrimary,absorbed:0,shared};
   if(d.old)Object.assign(d.old,p);else if(capacity>0)d.target.pools.push(p);
   d.pool=d.old||p;this.syncShield(d.target);
  }
  drafts.forEach((d,i)=>{
   if(capacity<=0)return;
   this.battle.emit('shield',source,d.target,label,capacity,{granted:i===0?granted:0,pool:d.key});
   root.BondCombatHooks?.each(this,'shielded',source,d.target,Math.max(0,capacity-d.before),label,d.pool,{...options,itemPrimary:!!options.itemPrimary&&i===0});
  });
  return granted;
 }
 absorb(target,raw,actor,details){
  this.syncShield(target);let remaining=raw,absorbed=0;
  for(const p of [...target.pools].sort((a,b)=>a.until-b.until||a.key.localeCompare(b.key))){
   if(remaining<=0)break;
   const bonus=Math.max(0,details.shieldBonus||0),cost=details.active&&details.secondary?(p.shared?.splashCost||1):1;
   const itemCost=root.BondEquipmentEffects.change(this,'shieldCost',1,actor,target,p,details),normal=Math.min(remaining,p.amount/(cost*Math.max(.05,itemCost))),used=Math.min(p.amount,Math.round(normal*cost*itemCost*(1+bonus)));
   p.amount-=used;if(p.shared){p.shared.remaining=Math.max(0,p.shared.remaining-used);for(const ally of this.battle.units){for(const peer of ally.pools||[])if(peer!==p&&peer.shared===p.shared)peer.amount=Math.min(peer.amount,p.shared.remaining);ally.shield=(ally.pools||[]).reduce((n,p)=>n+p.amount,0);}}remaining-=normal;absorbed+=this.battle.monsterRules===1?normal:used;
   p.absorbed=(p.absorbed||0)+normal;this.after(()=>root.BondCombatHooks?.each(this,'absorbed',actor,target,p,normal,details,used));
   if(p.amount<=0&&actor&&actor.side!==target.side)this.after(()=>{root.BondCombatPassives?.broken(this,actor,target,p,details);root.BondClassTalents?.broken(this,actor,target,p,details);root.BondCombatHooks?.each(this,'broken',actor,target,p,details);});
  }
  this.syncShield(target);return {remaining:Math.max(0,Math.round(remaining)),absorbed};
 }
 reduction(target,actor,raw,details){
  const direct=details.direct!==false&&!details.dot&&!details.transfer&&!details.debt;
  if(details.transfer||details.debt)return raw;
  const original=raw;let multiplier=1;
  for(const e of Object.values(target.effects||{})){
   if(e.until<=this.battle.time)continue;
   if(e.requiresPool&&!target.pools.some(p=>p.amount>0&&p.source===e.source&&p.label===e.requiresPool))continue;
   const applies=e.kind==='dr'&&direct||e.kind==='physicalDR'&&direct&&details.category!=='magic'||e.kind==='magicDR'&&direct&&details.category==='magic'||e.kind==='basicDR'&&details.basic||e.kind==='nextDirectDR'&&direct||e.kind==='nextActiveDR'&&details.active||e.kind==='dotDR'&&details.dot||e.kind==='nextDotDR'&&details.dot||e.kind==='critDR'&&details.critical;
   if(applies){multiplier*=1-e.value;if(e.once){delete target.effects[e.key];this.after(()=>root.BondCombatHooks?.each(this,'defenseConsumed',target,e,actor,details));}}
  }
  raw*=Math.max(.4,multiplier);
  raw=root.BondCombatPassives?.incoming(this,actor,target,raw,details)??raw;
  raw=root.BondClassTalents?.incoming(this,actor,target,raw,details)??raw;
  raw=root.BondCombatHooks?.change(this,'incoming',raw,actor,target,details)??raw;
  return Math.max(0,Math.round(Math.max(original*.4,raw)));
 }
 beforeHP(actor,target,raw,details){
  if(details.transfer||details.debt)return raw;
  raw=root.BondClassTalents?.barrier(this,actor,target,raw,details)??raw;
  raw=root.BondCombatPassives?.beforeHP(this,actor,target,raw,details)??raw;
  raw=root.BondClassTalents?.beforeHP(this,actor,target,raw,details)??raw;
  raw=root.BondCombatHooks?.change(this,'beforeHP',raw,actor,target,details)??raw;
  const direct=details.direct!==false&&!details.dot;
  if(direct&&raw>0&&details.intercept!==false){
   const candidates=[];
   for(const u of this.core(target)){
    if(u===target)continue;
    const old=this.battle.has(u,'guard')&&(target.slot===0||this.battle.defense)?.35:0;
    const guard=this.get(u,'Intercept'),passive=root.BondCombatPassives?.guard(this,u,target)||0;
    if((guard?.target===target.id||guard?.target==='trainer'&&target.slot===0)&&u.hp/u.maxHp>(guard.minHP||0)&&(!guard.singleTarget||!details.area&&!details.arenaWide&&!details.secondary))candidates.push({u,rate:guard.value});
    if(old||passive)candidates.push({u,rate:Math.max(old,passive)});
   }
   if(!details.area&&!details.arenaWide)for(const e of this.entities)if(alive(e)&&e.guards===target.id&&e.side===target.side&&alive(e.master))candidates.push({u:e,rate:e.intercept});
   candidates.sort((a,b)=>b.rate-a.rate||b.u.hp/b.u.maxHp-a.u.hp/a.u.maxHp||a.u.id.localeCompare(b.u.id));
   if(candidates.length){const {u,rate}=candidates[0],amount=Math.min(u.hp,Math.round(raw*Math.min(.35,rate)));raw-=amount;this.loss(actor,u,amount,'Intercept',{transfer:true,direct:false});this.battle.emit('guard',u,target,'Intercept',amount);}
  }
  raw=root.BondClassTalents?.stagger(this,actor,target,raw,details)??raw;
  return Math.max(0,Math.round(raw));
 }
 loss(actor,target,amount,label,details={}){
  // Debt and intercepted HP loss never run defenses, resource hooks or recursion.
  if(!alive(target)||this.battle.ended)return 0;
  const b=this.battle,floor=b.training?1:b.rescue?root.BondRaidRules.floor(b,target):0,dealt=Math.min(Math.max(0,target.hp-floor),Math.max(0,Math.round(amount)));
  target.hp-=dealt;if(actor)actor.damage=(actor.damage||0)+dealt;
  if(target.temporary)this.after(()=>root.BondCompanionTalents?.own(this,'entityLoss',target.master,target,dealt,details));
  b.emit('damage',actor,target,label,dealt,{...details,temporary:!!target.temporary});
  if(target.hp<=0)this.defeated(actor,target,details);
  b.checkEnd();if(b.ended)this.clear();return dealt;
 }
 defeated(actor,target,details={}){
  if(target.temporary){this.despawn(target,details.transfer?'intercept':'destroyed');return;}
  this.after(()=>root.BondCompanionTalents?.departed(this,target,actor,details));
  target.hp=0;target.shield=0;target.pools=[];target.status={};
  for(const u of this.battle.units)for(const [key,e] of Object.entries(u.effects||{}))if(e.ownerRequired&&e.source===target.id)delete u.effects[key];
  this.battle.emit('defeat',actor,target,target.name+' fell.');
  if(target.slot===0&&this.battle.group)for(const companion of this.battle.units.filter(v=>v.owner===target.owner&&v.side===target.side&&v.slot>0))companion.eliminated=true;
  for(const e of this.entities)if(e.master===target)this.despawn(e,'owner-death');
 }
 despawn(e,reason){if(e.removed)return;const remaining=e.hp;e.hp=0;e.removed=true;e.removedAt=this.battle.time;e.reason=reason;this.battle.emit('despawn',e.master,e,reason,0,{entity:e.id,temporary:true,reason});for(const child of this.entities.filter(v=>v.parent===e))this.despawn(child,'parent-death');this.after(()=>root.BondCompanionTalents?.own(this,'entityEnded',e.master,e,reason,remaining));if(reason==='destroyed')this.after(()=>root.BondCombatEntities?.destroyed(this,e));}
 heal(source,target,amount,label,options={}){
  if(this.itemDepth)options={...options,item:true};
  if(!alive(target)||this.battle.ended||this.battle.overcharge)return 0;
  const before=target.hp,base=Math.max(0,amount),factor=(1+this.value(source,'healOutput'))*(1+this.value(target,'healReceived'))*(options.legacy||options.alreadyScaled?1:1+(source.growth?.healing||0));options.itemBaseHeal=base*(1+this.value(source,'healOutput'))*(options.legacy||options.alreadyScaled?1:1+(source.growth?.healing||0));
  let tuned=root.BondCombatPassives?.healAmount(this,source,target,base*factor,options)??base*factor;
  tuned=root.BondCombatHooks?.change(this,'healAmount',tuned,source,target,options,label)??tuned;
  const offered=Math.max(0,Math.min(Math.floor(options.maximum??Infinity),Math.round(tuned))),effective=Math.min(offered,target.maxHp-before);target.hp+=effective;source.healing=(source.healing||0)+effective;
  if(options.receipt)Object.assign(options.receipt,{offered,effective});
  if(effective)this.battle.emit('heal',source,target,label,effective,{primary:!!options.primary,proc:!options.primary});
  root.BondClassTalents?.healed(this,source,target,effective,{...options,offered,before});
  root.BondCombatPassives?.healed(this,source,target,effective,{...options,offered,before});
  root.BondCombatHooks?.each(this,'healed',source,target,effective,label,{...options,offered,before});
  return effective;
 }
 direct(source,target,amount,label,options={}){
  if(this.itemDepth)options={...options,item:true};
  if(!alive(source)||!alive(target)||this.battle.ended)return {hit:false,damage:0};
  const transaction=this.battle.monsterRules===1;if(transaction)this.begin();
  try{
  const category=options.category||source.basicCategory;
  if(source.temporary)amount=root.BondEquipmentEffects.change(this,'entityOutgoing',amount,source,target,options);
  if(source.temporary)amount=root.BondCompanionTalents?.own(this,'entityOutgoing',source.master,amount,source,target,options)??amount;
  if(!options.ignoreRange&&!this.battle.inRange(source,target,{reach:options.reach||this.battle.reach(source)}))return {hit:false,damage:0};
  options.category=category;options.primary=options.primary!==false&&!options.proc;root.BondEquipmentEffects.each(this,'launch',source,target,options);
  if(!options.proc&&options.primary!==false)root.BondClassTalents?.launch(this,source,target,options);
  if(this.battle.ended)return {hit:false,damage:0};
  const rolled=!options.proc&&!options.statusOnly?root.BondCompanionTalents?.own(this,'criticalRoll',source,options):undefined;
  const bonus=!options.proc?root.BondCombatPassives.hitBonus(this,source,target,options)+(root.BondClassTalents?.hitBonus(this,source,target,options)||0)+(root.BondCombatHooks?.change(this,'hitBonus',0,source,target,options)||0)+(rolled?.hitBonus||0):0;
  const shroud=options.basic&&category!=='magic'&&this.remove(target,'Shroud');
  const hit=!shroud&&(category==='magic'||target.temporary&&target.structure||options.guaranteed||this.battle.random()>=1-clamp((80+source.level+Math.floor(source.effective?.dex||0)+(source.itemStats?.hit||0)+this.value(source,'hit')+(options.hitBonus||0)+bonus-target.level-Math.floor(target.effective?.agi||0)-(target.itemStats?.flee||0)-(options.targetFleeBonus||0)-this.value(target,'flee'))/100,.05,.95));
  if(!hit){const missed=shroud?{...options,shroudEvaded:shroud}:options;this.battle.emit('dodge',source,target,'Miss',0,{category});root.BondCombatPassives.missed(this,source,target,options);root.BondCombatHooks?.each(this,'missed',source,target,missed);if(!options.proc&&options.primary!==false)root.BondCombatHooks?.each(this,'attempted',source,target,options);return {hit:false,damage:0};}
  if(options.statusOnly)return {hit:true,damage:0,absorbed:0};
  const forced=options.basic&&!options.proc&&this.remove(source,'Cast-Off Ring');
  const critical=!options.noCritical&&!options.proc&&category!=='magic'&&(!!forced||options.critical===true||(rolled?rolled.critical:this.battle.random()<clamp(source.critChance+this.value(source,'crit')+(options.critBonus||0),0,1)));
  const details={direct:true,primary:options.primary!==false&&!options.proc,active:!!options.active,basic:!!options.basic,proc:!!options.proc,area:!!options.area,secondary:!!options.secondary,shieldBonus:options.shieldBonus||0,distance:this.battle.distance(source,target),reach:options.reach||this.battle.reach(source),...options,category,critical};
  if(!options.proc){amount=root.BondCombatPassives.outgoing(this,source,target,amount,details);amount=root.BondClassTalents?.outgoing(this,source,target,amount,details)??amount;}
  if(!options.proc)amount=root.BondCombatHooks?.change(this,'outgoing',amount,source,target,details)??amount;
  if(details.itemSuppressed)return {hit:true,damage:0,absorbed:0};
  let power=amount*(critical?1.4:1)*(1+this.value(source,'damage'))*(category==='magic'?1+this.value(source,'magicDamage'):1);
  if(details.basic)power*=1+this.value(source,'basicDamage');
  if(details.active){power*=1+this.value(source,'activeDamage');const sleepy=this.get(source,'Drowsy'),owner=sleepy&&this.battle.units.find(u=>u.id===sleepy.source),handled=sleepy?root.BondCompanionTalents?.own(this,'drowsy',owner,source,sleepy,details):undefined;if(handled!==undefined&&handled!==false)power*=1-handled;else {const next=this.remove(source,'Drowsy')||this.remove(source,'Weakened active');if(next){power*=1-next.value;this.after(()=>root.BondCombatHooks?.each(this,'offenseConsumed',source,target,next,details));if(next.key==='Drowsy')this.after(()=>root.BondCombatPassives?.dreamSipper(this,next));}}}
  if(details.basic){const next=this.remove(source,'Weakened basic');if(next){power*=1-next.value;this.after(()=>root.BondCombatHooks?.each(this,'offenseConsumed',source,target,next,details));}}
  if(details.active&&category==='magic'){const next=this.remove(source,'Hinge Hex');if(next)power*=1-next.value;}
  if(details.primary&&!details.proc){const wire=this.remove(source,'Tension Wire'),sap=this.remove(source,'Sour Sap strike');if(wire)power*=1-wire.value;if(sap)power*=1-sap.value;}
  details.preMitigation=power;const result=this.battle.damage(source,target,power,label,true,details)||{damage:0,absorbed:0};
  if(source.temporary)this.after(()=>{root.BondCompanionTalents?.own(this,'entityLanded',source.master,source,target,{hit:true,critical,...result},details);root.BondEquipmentEffects.each(this,'entityLanded',source,target,{hit:true,critical,...result},details);});
  if(!details.proc&&details.primary)this.after(()=>{root.BondCombatPassives.landed(this,source,target,{hit:true,critical,...result},details);root.BondCombatHooks?.each(this,'landed',source,target,{hit:true,critical,...result},details);});
  if(!details.proc&&details.primary)this.after(()=>root.BondCombatHooks?.each(this,'attempted',source,target,details));
  return {hit:true,critical,preMitigation:power,...result};
  }finally{if(transaction)this.finish();}
 }
 proc(source,target,amount,category,label,options={}){return this.direct(source,target,amount,label,{category,proc:true,ignoreRange:true,...options});}
 dot(source,target,key,total,duration,category,options={}){
  if(this.itemDepth)options={...options,item:true};
  options={dotKind:root.BondEquipmentEffects.dotKind(key,options.label),...options};
  if(this.battle.monsterRules)return this.managedDot(source,target,key,total,duration,category,options);
  const existing=this.get(target,key),interval=1,e=this.put(source,target,key,'dot',total/duration,duration,{category,...options,next:existing?.next||this.battle.time+interval});if(!e)return;
  if(existing)return;
  // Tick at the written endpoint before expiry; the queue owns the tick, not the status cleaner.
  const pulseAt=()=>{const current=target.effects?.[key];if(!current||!alive(target)||current.until<this.battle.time-1e-8)return;if(current.ownerRequired&&!alive(source)){delete target.effects[key];return;}current.next+=interval;const result=this.battle.damage(source,target,current.value,current.label||key,false,{category,dot:true,direct:false,proc:true,item:!!current.item,dotKey:current.key,dotEffect:current});if(current.afterTick)current.afterTick(result);if(current.next<=current.until+1e-8)this.later(source,target,interval,pulseAt,{label:key});};
  this.later(source,target,Math.max(.05,e.next-this.battle.time),pulseAt,{label:key});
 }
 managedDot(source,target,key,total,duration,category,options={}){
  const old=this.get(target,key),token=old?.dotToken||++this.sequence;
  const e=this.put(source,target,key,'dot',total/duration,duration,{...options,category,dotToken:token,next:old?.next??this.battle.time+1,queued:old?.queued||false});if(!e||e.queued)return;
  const schedule=current=>{if(current.next>current.until+1e-8)return;current.queued=true;this.later(source,target,Math.max(.05,current.next-this.battle.time),pulse,{label:current.label||key});};
  const pulse=()=>{
   let current=target.effects?.[key];if(!current||current.dotToken!==token)return;current.queued=false;
   if(!alive(target)||current.until<this.battle.time-1e-8)return;
   if(current.ownerRequired&&!alive(source)){delete target.effects[key];return;}
   current.next=this.battle.time+1;
   const result=this.battle.damage(source,target,current.tickAmount?current.tickAmount(current):current.value,current.label||key,false,{category,dot:true,direct:false,proc:true,item:!!current.item,dotKey:current.key,dotEffect:current});
   if(current.afterTick)current.afterTick(result);
   current=target.effects?.[key];if(current?.dotToken===token&&!current.queued)schedule(current);
  };
  schedule(e);
 }
 extendDot(source,target,key,seconds){
  const e=this.get(target,key);if(!e||e.kind!=='dot')return false;
  const duration=e.until-this.battle.time+seconds;this.dot(source,target,key,e.value*duration,duration,e.category,{...e,until:this.battle.time+duration});return true;
 }
 cleanse(source,target,category=null,all=false){
  if(!alive(target))return 0;
  const priority=e=>e.kind==='control'?0:e.kind==='healReceived'?1:e.kind==='dot'?2:3;
  const items=Object.values(target.effects||{}).filter(e=>(!this.battle.monsterRules||!e.unremovable&&e.removable!==false)&&e.until>this.battle.time&&e.harmful!==false&&(e.harmful===true||e.value<0||['dot','control','basicPenalty','incomingMark'].includes(e.kind))&&(!category||category==='dot'&&e.kind==='dot'||category==='heal'&&e.kind==='healReceived'||category==='blind'&&e.kind==='hit'||category==='tempo'&&['basicPenalty','nextBasicDelay'].includes(e.kind))).sort((a,b)=>priority(a)-priority(b)||a.key.localeCompare(b.key));
  const removed=[];let n=0;for(const e of items.slice(0,all?items.length:1)){delete target.effects[e.key];removed.push(e);n++;}
  if(!category||category==='dot'){if(this.battle.has(target,'burn')&&(all||!n)){delete target.status.burn;removed.push({kind:'dot',key:'burn'});n++;}}
  if(!category&&this.battle.has(target,'slow')&&(all||!n)){delete target.status.slow;removed.push({kind:'basicPenalty',key:'slow'});n++;}
  if(n){this.battle.emit('status',source,target,'Cleansed',n);root.BondCombatPassives?.cleansed(this,source,target,n);}
  if(n)root.BondEquipmentEffects.each(this,'cleansed',source,target,removed,n);
  return n;
 }
 control(source,target,key,seconds){
  if(!alive(target)||target.boss&&target.controlImmune?.includes(key)||this.get(target,'Immunity:'+key))return false;
  this.put(source,target,key,'control',1,seconds,{harmful:true});this.put(source,target,'Immunity:'+key,'immunity',1,seconds+2,{harmful:false});return true;
 }
 taunt(source,target,seconds){if(!alive(target)||target.boss&&target.controlImmune?.includes('taunt')||!this.battle.inRange(target,source))return false;return this.put(source,target,'Taunt','taunt',1,seconds,{target:source.id,harmful:true});}
 target(actor){const t=this.get(actor,'Taunt'),u=t&&this.battle.units.find(u=>u.id===t.target);return alive(u)&&this.battle.inRange(actor,u)?u:null;}
 basicInterval(u){const pack=Object.values(u.effects||{}).filter(e=>e.kind==='contributor'&&e.until>this.battle.time).reduce((n,e)=>n+e.value,0),base=clamp(1-Math.max(pack,this.value(u,'basicTempo')),.7,1)*Math.max(1,1+this.value(u,'basicPenalty'))*(u.kit.number===69?1.15:1);return root.BondEquipmentEffects.interval(this,u,Math.max(.7,root.BondCombatHooks?.change(this,'basicInterval',base,u)??base));}
}
root.BondCombatEffects={Effects,alive,clamp};
})(globalThis);
