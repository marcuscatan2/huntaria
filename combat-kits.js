/* Reviewed workbook skills. Explicit operations, never executable spreadsheet prose. */
(function(root){
'use strict';
const C=root.BondContent, catalog=root.BondCombatCatalog, definitions=new Map();
const alive=u=>root.BondCombatEffects.alive(u);
class Context{
 constructor(f,u,s){this.f=f;this.b=f.battle;this.u=u;this.s=s;const {A,M,H,P}=f.stats(u);Object.assign(this,{A,M,H,P});this.t=this.b.target(u);this.tr=f.trainer(u);this.all=f.core(u);this.low=f.lowest(u);this.other=f.others(u);this.primary=null;this.results=[];this.receivers=[];this.deployments=0;this.startHP=u.hp/u.maxHp;this.startShield=u.shield;this.resources={...u.kit};this.mods={};this.skillPower=1+(u.growth?.skillPower?.[s.id]||0);}
 r(k){return this.u.kit[k]||0;}
 add(k,n,max=Infinity){return this.f.add(this.u,k,n,max);}
 take(k,max=Infinity){return this.f.take(this.u,k,max);}
 hp(u=this.u){return u?u.hp/u.maxHp:1;}
 threat(u=this.u){return this.f.threatened(u);}
 wounded(p=.8){return this.all.some(u=>this.hp(u)<=p);}
 partyGate(p=.8){return this.hp(this.tr)<.6||this.all.filter(u=>this.hp(u)<p).length>=2;}
 trainerGate(p=.75){return alive(this.tr)&&(this.threat(this.tr)||this.hp(this.tr)<=p);}
 wardGate(p=.75){return this.all.some(u=>this.threat(u)||this.hp(u)<=p);}
 mark(key,t=this.t){return this.f.get(t,key);}
 buff(t,key,kind,value,duration,extra={}){return this.f.put(this.u,t,key,kind,value,duration,extra);}
 debuff(key,kind,value,duration,t=this.t,extra={}){if(!this.results.length||this.results[0].hit)return this.buff(t,key,kind,value,duration,{harmful:true,...extra});}
 hit(amount,options={}){
  const target=options.target||this.t,primary=!this.primary&&!options.secondary;
  if(primary)this.primary={kind:'damage',amount,category:options.category||this.u.basicCategory,target};
  if(primary)amount=root.BondCombatPassives.primary(this.f,this,'damage',amount);
  const bonus=primary?(this.mods.bonus||0):0;
  const power=(amount+bonus)*(primary?(this.mods.damageMultiplier||1):1)*this.skillPower*(1+(this.u.growth?.attack||0));
  const result=this.f.direct(this.u,target,power,this.s.name,{active:true,primary,blockable:this.u.delivery==='ranged'&&!options.area&&!options.secondary,...options,hitBonus:(options.hitBonus||0)+(this.mods.hit||0)});
  this.results.push({...result,target,primary,category:options.category||this.u.basicCategory});if(primary)this.primary.result=result;
  return result;
 }
 splash(amount,radius=18,cap=2,category=this.u.basicCategory){for(const v of this.f.nearby(this.u,this.t,radius,cap+1,this.t).filter(v=>v!==this.t).slice(0,cap))this.hit(amount,{target:v,category,secondary:true,primary:false,area:true,ignoreRange:true});}
 heal(target,amount,options={}){
  const primary=!this.primary;if(primary)this.primary={kind:'heal',amount,target};
  if(primary)amount=root.BondCombatPassives.primary(this.f,this,'heal',amount);
  const before=target?target.hp/target.maxHp:1,actual=this.f.heal(this.u,target,this.skillPower*(amount+(primary?(this.mods.supportBonus||0):0))*(this.mods.healMultiplier||1),this.s.name,{primary:true,skill:this.s,...options});
  this.receivers.push({kind:'heal',target,actual,primary,before});return actual;
 }
 shield(target,amount,duration=3,options={}){
  const primary=!this.primary;if(primary)this.primary={kind:'shield',amount,target};
  if(primary)amount=root.BondCombatPassives.primary(this.f,this,'shield',amount);
  const actual=this.f.shield(this.u,target,this.skillPower*(amount+(primary?(this.mods.supportBonus||0):0))*(this.mods.shieldMultiplier||1),duration,this.s.name,{primary:true,skill:this.s,...options});
  this.receivers.push({kind:'shield',target,actual,primary});return actual;
 }
 selfward(amount,duration=3){return this.shield(this.u,amount,duration);}
 teamheal(amount){for(const u of this.all)this.heal(u,amount);}
 teamward(amount,duration=3){for(const u of this.all)this.shield(u,amount,duration);}
 dot(key,amount,seconds,category=this.u.basicCategory){if(this.results[0]?.hit)this.f.dot(this.u,this.t,key,amount,seconds,category);}
 dr(value,duration=3,kind='dr',target=this.u,once=false){return this.buff(target,this.s.name,kind,value,duration,{once});}
 guard(value,duration=3,minHP=0,target=this.tr){if(target)this.buff(this.u,'Intercept','intercept',value,duration,{target:target.id,minHP});}
 cleanse(target=this.low,kind=null){return this.f.cleanse(this.u,target,kind);}
 taunt(all=true){for(const v of all?this.f.enemies(this.u):[this.t])this.f.taunt(this.u,v,2);}
 control(seconds,kind='Interrupt'){if(this.results[0]?.hit)this.f.control(this.u,this.t,kind,seconds);}
 deploy(id,options={}){if(!this.primary)this.primary={kind:'deployment',amount:0,target:this.u};const e=root.BondCombatEntities.spawn(this.f,this.u,id,options);if(e)this.deployments++;return e;}
 count(id){return this.f.entities.filter(e=>alive(e)&&e.master===this.u&&(e.profile===id||e.capGroup===id)).length;}
 best(){return [...this.other].sort((a,b)=>this.f.stats(b).P-this.f.stats(a).P||a.id.localeCompare(b.id))[0]||this.u;}
}
const hit=(act,gate=null)=>({kind:'hit',act,gate}),support=(act,gate)=>({kind:'utility',act,gate});
function species(number,list){const skills=Object.values(catalog.skills).filter(s=>s.number===number);if(skills.length!==list.length)throw Error('Missing skill definition: '+number);skills.forEach((s,i)=>definitions.set(s.id,{...s,...list[i]}));}
const attack=(coefficient,extra=null)=>hit(c=>{c.hit(coefficient*(c.u.basicCategory==='magic'?c.M:c.A));if(extra)extra(c);});
const selfHeal=(fraction,extra=null)=>support(c=>{c.heal(c.u,fraction*c.H);if(extra)extra(c);},c=>c.hp()<=.75);
const trainerWard=(fraction,threshold=.75)=>support(c=>c.shield(c.tr,fraction*c.H),c=>c.trainerGate(threshold));
const resourceWard=(amount,key,count,max)=>support(c=>{c.selfward(amount(c));c.add(key,count,max);},c=>c.threat()||c.hp()<=.7);
species(1,[hit(c=>{c.hit((c.startShield?1.65:1.3)*c.A);if(!c.startShield)c.selfward(.03*c.H);}),support(c=>{c.shield(c.tr,.08*c.H);c.dr(.15);},c=>c.trainerGate()),support(c=>{c.selfward(.16*c.H,4);c.taunt();},c=>c.threat()&&c.u.shield<.05*c.H)]);
species(2,[hit(c=>{c.hit(1.25*c.A);c.debuff('Waxpin','mark',.4*c.A,3);}),support(c=>{c.shield(c.tr,.9*c.A);c.buff(c.u,'Cupped Ember','hit',20,3);},c=>c.trainerGate(.7)),hit(c=>c.hit((c.hp(c.tr)<.6?3.6:3)*c.A))]);
species(3,[hit(c=>{c.hit(1.35*c.M);c.debuff('Crescent Cut','damage',-.08,2);}),support(c=>{c.heal(c.low,1.1*c.M);c.shield(c.low,.35*c.M);},c=>c.wounded()),hit(c=>{c.hit(2.3*c.M);c.shield(c.low,.8*c.M);})]);
species(4,[hit(c=>{c.hit(1.2*c.A);c.debuff('Armor exposure','physicalExposure',.05,3);}),hit(c=>{c.hit(1.5*c.A);c.debuff('Weakened active','activeWeakness',.2,3);}),support(c=>{c.selfward(.14*c.H,4);c.guard(.25,3,.4);},c=>c.hp()>.4&&c.threat(c.tr)||c.hp()<.65)]);
species(5,[hit(c=>{c.hit(1.35*c.A);c.add('Pressure',1,2);}),support(c=>{c.selfward(.07*c.H);c.add('Pressure',2,2);},c=>c.r('Pressure')<2&&(c.threat()||!c.u.skills.some((id,i)=>c.u.cds[i]<=0&&definitions.get(id)?.kind==='hit'))),hit(c=>{c.hit(2.5*c.A);c.control(.4);})]);
species(6,[hit(c=>{c.hit(1.1*c.M);c.debuff('Drowsy','activeWeakness',.15,3);}),support(c=>c.shield(c.low,c.M*(c.f.enemies(c.u).some(u=>c.mark('Drowsy',u))?1.25:1)),c=>c.wardGate(.8)),hit(c=>{const d=c.mark('Drowsy');c.hit(2.8*c.M);if(d)c.heal(c.low,.9*c.M);})]);
species(7,[hit(c=>{c.hit(1.4*c.A);c.buff(c.u,'Brushbite','flee',15,2);}),hit(c=>{c.hit(1.6*c.A);c.debuff('Black Margin','ownerExposure',.08,3);}),hit(c=>c.hit((c.hp(c.t)<.35?3.4:2.6)*c.A))]);
species(8,[hit(c=>{c.hit(1.35*c.A);if(c.hp()<.7)c.selfward(.03*c.H,2);}),selfHeal(.08,c=>c.dr(.1,2)),hit(c=>c.hit(2.4*c.A+Math.min(.8*c.A,.3*(c.u.kit.losses||[]).filter(e=>e.time>=c.b.time-2).reduce((n,e)=>n+e.amount,0))))]);
species(9,[attack(1.4),support(c=>{c.selfward(.8*c.M+.04*c.H);c.add('Heat',2,3);},c=>c.threat()&&c.r('Heat')<2||c.hp()<=.65),hit(c=>{c.hit(2.9*c.M);c.debuff('Magic exposure','magicExposure',.06,3);})]);
species(10,[hit(c=>{c.hit(1.2*c.A);c.debuff('Woolhorn','basicDamage',-.12,2);}),trainerWard(.08),support(c=>c.teamheal(.8*c.M+.02*c.H),c=>c.partyGate())]);
species(11,[attack(1.4),hit(c=>{c.hit(1.7*c.A);c.debuff('Brittle','shieldWeakness',.25,3);}),hit(c=>c.hit((c.t.shield>0?3.3:2.7)*c.A))]);
species(12,[hit(c=>{c.hit(1.3*c.M);if(!c.r('Ribs'))c.add('Ribs',1,3);}),support(c=>{c.add('Ribs',2,3);c.selfward(.65*c.M);},c=>c.r('Ribs')<=1),hit(c=>c.hit((2.3+.25*c.r('Ribs'))*c.M))]);
species(13,[attack(1.35),support(c=>c.heal(c.low,1.2*c.M),c=>c.wounded()),hit(c=>{c.hit(2.5*c.M);c.mods.buds=2;})]);
species(14,[support(c=>c.heal(c.low,.65*c.M),c=>c.wounded()),hit(c=>{c.hit(c.M);c.debuff('Weakened basic','basicWeakness',.35,3);}),support(c=>c.teamheal(.9*c.M),c=>c.partyGate())]);
species(15,[hit(c=>{c.hit(1.15*c.A);c.selfward(.03*c.H,2);}),support(c=>{c.heal(c.u,.1*c.H);if(c.mark('Set Roots',c.u))c.cleanse(c.u,'dot');},c=>c.hp()<=.7),support(c=>{c.shield(c.tr,.1*c.H,4);c.buff(c.u,'Tuber Rampart','hit',20,3);},c=>c.trainerGate(.7))]);
species(16,[hit(c=>c.hit((1.45+.35*c.take('Fragment',1))*c.A)),support(c=>c.heal(c.u,(.05+.03*c.take('Fragment'))*c.H),c=>c.hp()<=.65),hit(c=>{c.hit(2.4*c.A);c.debuff('Cairn Hammer','physicalPower',-.15,3);})]);
species(17,[hit(c=>c.hit((c.tr?.targetId===c.u.targetId?1.6:1.35)*c.A)),support(c=>{c.shield(c.tr,.06*c.H);const t=c.tr&&c.b.target(c.tr);if(t)c.buff(t,'Loyal Bark','ownerDamage',.1,3);},c=>c.trainerGate(.8)&&!!c.b.target(c.tr)),hit(c=>{const t=c.tr&&c.b.target(c.tr);c.hit(2.7*c.A,{target:alive(t)&&c.b.inRange(c.u,t)?t:c.t});c.selfward(.05*c.H);})]);
species(18,[hit(c=>{c.hit(1.3*c.A);c.dot('Mane Burn',.4*c.A,2,'magic');}),support(c=>{c.buff(c.u,'Feral Stoke','physicalPower',.15,3);c.buff(c.u,'Feral Aim','hit',15,3);},c=>alive(c.t)),hit(c=>c.hit((Object.values(c.t.effects).some(e=>e.kind==='dot'&&/Burn|Ember/.test(e.key))||c.b.has(c.t,'burn')?3.4:2.7)*c.A))]);
species(19,[hit(c=>{c.hit(1.2*c.M);c.add('Water',.25*c.M,.1*c.H);}),support(c=>c.heal(c.low,.9*c.M+c.take('Water')),c=>c.wounded(.75)),support(c=>{c.selfward(.15*c.H,4);c.shield(c.tr,.7*c.M);},c=>c.threat()||c.hp(c.tr)<=.65)]);
species(20,[hit(c=>c.hit(1.4*c.A,{hitBonus:20})),support(c=>{c.buff(c.u,'Silver Current aim','hit',25,3);c.buff(c.u,'Silver Current evasion','flee',20,3);},c=>alive(c.t)),hit(c=>{c.hit(2.8*c.A);if(c.mods.precision)c.debuff('Rill Sever','healReceived',-.2,3);})]);
species(21,[hit(c=>{c.hit(1.35*c.A);c.add('Seeds',1,3);}),support(c=>{c.add('Seeds',3,3);c.buff(c.u,'Pod Aim','nextBasicHit',25,10);},c=>!c.r('Seeds')),hit(c=>c.hit((2.4+.3*c.take('Seeds'))*c.A))]);
species(22,[hit(c=>{c.hit(1.3*c.A);c.heal(c.u,.02*c.H);}),selfHeal(.07,c=>c.dr(.15,2,'nextDirectDR',c.u,true)),hit(c=>{c.hit(2.3*c.A);c.shield(c.tr,.06*c.H);})]);
species(23,[attack(1.4),support(c=>{c.selfward(.09*c.H);c.add('Gust',1,1);c.buff(c.u,'Gust duration','resource',1,3);},c=>c.threat()||c.hp()<=.7),hit(c=>{c.hit(2.4*c.A,{area:true});c.splash(.45*c.A);})]);
species(24,[hit(c=>{c.hit(1.2*c.A);if(c.results[0].hit){const old=c.mark('Stitch');c.debuff('Stitch','mark',1,3,c.t,{used:old?.used||{},count:old?.count||0});}}),hit(c=>{c.hit(1.6*c.A);c.debuff('Hem Snare','basicPenalty',.15,3);}),hit(c=>c.hit((2.6+.25*Math.min(3,c.mark('Stitch')?.count||0))*c.A)),hit(c=>{c.hit(1.1*c.A);c.deploy('stitched-effigy',{linked:c.t.id});},c=>!c.count('stitched-effigy'))]);
species(25,[hit(c=>{c.hit(1.3*c.A);c.debuff('Briar Bite','healReceived',-.2,3);}),support(c=>{c.taunt();c.dr(.15,3,'basicDR');},c=>c.threat()||c.hp()>.4&&c.f.enemies(c.u).some(e=>e.targetId===c.tr?.id&&c.b.inRange(e,c.u))),hit(c=>{c.hit(2.5*c.A);c.heal(c.u,.08*c.H);})]);

function delayed(c,amount,seconds,ward=0){
 c.primary={kind:'damage',amount,category:'magic',target:c.t};const target=c.t,value=root.BondCombatPassives.primary(c.f,c,'damage',amount)+(c.mods.bonus||0),reach=c.b.reach(c.u);
 c.f.later(c.u,target,seconds,()=>{let t=target,power=value;if(!alive(t)&&c.u.kit.number===26){t=c.b.target(c.u);power*=.5;}if(alive(t)){const r=c.f.direct(c.u,t,power*c.skillPower*(1+(c.u.growth?.attack||0)),c.s.name,{category:'magic',active:true,primary:true,reach});}if(ward)c.f.shield(c.u,c.u,ward,3,c.s.name);},{label:c.s.name});
}
species(26,[hit(c=>delayed(c,1.5*c.M,.6)),hit(c=>delayed(c,1.9*c.M,.8,.5*c.M)),hit(c=>delayed(c,3.2*c.M,1.2))]);
species(27,[hit(c=>{if(c.hit(1.4*c.A).hit)c.selfward(.03*c.H,2);}),support(c=>{c.dr(.2,2,'physicalDR');c.buff(c.u,'Stonewing counter','nextBasic',.35*c.A,3);},c=>c.threat()),hit(c=>{c.hit(2.7*c.A);c.debuff('Quarry Beak','flee',-25,3);})]);
species(28,[hit(c=>{c.hit(1.15*c.M);c.add('Note',1,2);}),support(c=>c.shield(c.low,c.M+.03*c.H),c=>c.wardGate()),support(c=>{for(const u of [c.low,...c.all.filter(u=>u!==c.low)])c.shield(u,.65*c.M);},c=>c.threat(c.tr)||c.all.filter(u=>c.hp(u)<.85).length>=2)]);
species(29,[attack(1.45),support(c=>{c.selfward(c.M);c.buff(c.u,'Luminous Seams','shieldMagic',.1,3);},c=>c.threat()||c.r('phoenixUsed')),hit(c=>{c.hit(2.8*c.M,{area:true});c.splash(.5*c.M);})]);
species(30,[hit(c=>c.hit(1.35*c.A,{hitBonus:25})),support(c=>{c.buff(c.u,'Draped Wing','flee',25,3);c.selfward(.7*c.A);},c=>c.threat()||c.hp()<=.75),hit(c=>c.hit((c.hp(c.t)>.8?3.3:2.8)*c.A))]);
species(31,[support(c=>c.heal(c.low,.7*c.M),c=>c.wounded()),support(c=>{const t=c.best();c.heal(t,.8*c.M);c.buff(t,'Golden Duet','basicTempo',.12,3);},c=>alive(c.best())&&(c.hp(c.best())<1||alive(c.b.target(c.best())))),support(c=>{c.teamheal(.9*c.M);for(const t of c.all)c.buff(t,'Nectar','nextBasicMultiplier',.15,3);},c=>c.partyGate(.85))]);
species(32,[hit(c=>{c.hit(1.25*c.A);c.debuff('Weakened active','activeWeakness',.12,3);}),hit(c=>{c.hit(1.4*c.A);c.control(1,'Silence');}),hit(c=>{c.hit(2.8*c.A);c.debuff('Unspoken healing','healOutput',-.2,3);c.debuff('Unspoken shielding','shieldOutput',-.2,3);})]);
species(33,[hit(c=>c.hit((c.mark('Serrated Bleed')?1.6:1.35)*c.A)),support(c=>{c.buff(c.u,'Blade Poise critical','crit',.15,3);c.buff(c.u,'Blade Poise aim','hit',20,3);},c=>alive(c.t)),hit(c=>{c.hit(2.7*c.A);if(c.mark('Serrated Bleed'))c.debuff('Red Arc','healReceived',-.25,3);})]);
species(34,[attack(1.4),hit(c=>{c.hit(1.8*c.A);c.buff(c.u,'Slipstream Aim','nextBasicHit',25,3);}),attack(3)]);
species(35,[support(c=>c.shield(c.tr,.65*c.M),c=>c.trainerGate(.8)),support(c=>c.heal(c.low,(c.low===c.tr?1.5:1.3)*c.M),c=>c.wounded()),support(c=>{c.shield(c.tr,c.M+.06*c.H,4);c.dr(.1,2,'dr',c.tr);},c=>c.trainerGate(.65))]);
species(36,[attack(1.4),support(c=>{c.dr(.15);c.add('Grit',1,1);c.buff(c.u,'Grit duration','resource',1,3);},c=>c.threat()),hit(c=>{c.hit(2.7*c.A);c.control(.5);})]);
species(37,[attack(1.25),support(c=>{c.shield(c.low,.95*c.M);c.dr(.15,2,'magicDR',c.low);},c=>c.wounded(.75)||c.all.some(u=>c.f.enemies(u).some(e=>e.basicCategory==='magic'&&e.targetId===u.id))),support(c=>c.deploy('stormcap',{anchor:c.t}),c=>alive(c.t)&&c.b.inRange(c.u,c.t)&&!c.count('stormcap'))]);
species(38,[attack(1.4),support(c=>{c.selfward(.09*c.H);c.buff(c.u,'Locked axle','retainTarget',1,3);},c=>c.threat()||c.hp()<=.7),hit(c=>c.hit((2.7+.2*c.r('Flywheel'))*c.A))]);
species(39,[attack(1.45),support(c=>{c.selfward(.9*c.A);c.buff(c.u,'Wing Mantle','hit',15,3);},c=>c.threat()||c.hp()<=.7),hit(c=>{c.hit(3.1*c.A);if(c.hp()<.4)c.selfward(.05*c.H,2);})]);
species(40,[attack(1.35),hit(c=>{const buff=Object.values(c.t.effects).filter(e=>e.until>c.b.time&&e.value>0&&['physicalPower','magicPower','hit','basicTempo'].includes(e.kind)).sort((a,b)=>a.key.localeCompare(b.key))[0];if(buff){delete c.t.effects[buff.key];c.buff(c.u,'Borrowed Splendor','magicPower',.1,3);}else c.hit(1.45*c.M);}),hit(c=>{c.hit(2.8*c.M);c.debuff('Curtain Call','shieldReceived',-.25,3);})]);
species(41,[support(c=>c.heal(c.low,.75*c.M),c=>c.wounded(.85)),support(c=>c.heal(c.low,1.25*c.M+c.take('Water'),{stored:true}),c=>c.wounded(.7)),support(c=>c.teamheal(c.M),c=>c.partyGate(.85))]);
species(42,[hit(c=>{c.hit(1.35*c.A);c.add('Puff',1,2);}),support(c=>c.selfward((.6+.3*c.take('Puff'))*c.A),c=>c.threat()||c.hp()<=.7),attack(3)]);
species(43,[hit(c=>{c.hit(1.3*c.M);c.selfward(.3*c.M,2);}),support(c=>{c.shield(c.low,c.M+.03*c.H+c.take('Slag'));c.selfward(.03*c.H,2);},c=>c.wardGate()),support(c=>{if(c.deploy('kilnling',{extraHP:c.r('Slag')}))c.take('Slag');},c=>!c.count('kilnling')&&c.all.some(u=>c.threat(u))),hit(c=>{c.hit(2.7*c.M);c.heal(c.u,.05*c.H);})]);
species(44,[attack(1.3),support(c=>{c.selfward(.9*c.M);c.add('Star',1,3);},c=>c.threat()||c.r('Star')<2),hit(c=>{c.mods.bonus+=(c.resources.Star||0)*.1*c.M;c.hit(2.8*c.M);})]);
species(45,[attack(1.35),support(c=>{c.heal(c.u,.8*c.M+.04*c.H);c.shield(c.tr,.5*c.M);},c=>c.hp()<=.75||c.hp(c.tr)<=.65),hit(c=>{c.hit(2.5*c.M);c.debuff('Aurora Sweep','damage',-.12,3);})]);
species(46,[hit(c=>{c.hit(1.25*c.A);c.debuff('Queen mark','mark',20,3);}),support(c=>{while(c.count('soldier-ant')<3)if(!c.deploy('soldier-ant'))break;},c=>alive(c.t)&&c.count('soldier-ant')<3),support(c=>{c.deploy('shield-ant');c.selfward(.05*c.H);},c=>c.trainerGate()&&!c.count('shield-ant')),hit(c=>{c.hit(2*c.A);for(const e of c.f.entities.filter(e=>alive(e)&&e.master===c.u&&e.profile==='soldier-ant'&&e.targetId===c.t.id).slice(0,3))if(c.b.inRange(e,c.t))c.f.proc(e,c.t,.25*e.snapshot.A,'melee','Royal Mandate',{ignoreRange:false});})]);
species(47,[hit(c=>{c.hit(1.15*c.A);c.buff(c.u,'Leafplate Bump','flee',15,2);}),support(c=>{c.buff(c.u,'Clover Fold','flee',25,3);c.selfward(.07*c.H);},c=>c.threat()),support(c=>{c.shield(c.tr,.1*c.H);c.add('Clover',1,2);},c=>c.trainerGate(.7))]);
species(48,[attack(1.4),support(c=>{c.selfward(.9*c.A);c.buff(c.u,'Tendon Lock','hit',20,3);},c=>c.threat()||c.hp()<=.75),hit(c=>c.hit(2.9*c.A,{shieldBonus:.2}))]);
species(49,[hit(c=>{if(c.hit(1.15*c.M).hit)root.BondCombatPassives.ember(c.f,c.u,c.t);}),support(c=>{c.selfward(.8*c.M);if(c.b.inRange(c.u,c.t))root.BondCombatPassives.ember(c.f,c.u,c.t);},c=>alive(c.t)),hit(c=>{const emb=c.mark('Little Embers'),n=emb?.stacks||0;c.f.remove(c.t,'Little Embers');c.hit((2.2+.45*n)*c.M);},c=>(c.mark('Little Embers')?.stacks||0)>=2||c.b.time-(c.u.kit.targetSince||0)>=3)]);
species(50,[attack(1.4),support(c=>{c.selfward(.8*c.A);c.buff(c.u,'Closed Leaves','flee',20,3);},c=>c.threat()||!c.mark('Ambush',c.u)),hit(c=>{c.hit(2.8*c.A);c.debuff('Armor exposure','physicalExposure',.06,3);})]);
species(51,[hit(c=>{c.hit(1.05*c.M);c.debuff('Lantern Dust','flee',-20,3);}),support(c=>{c.shield(c.low,c.M);c.cleanse(c.low,'blind');},c=>c.wardGate()||c.all.some(u=>c.f.value(u,'hit')<0)),support(c=>{for(const t of [c.tr,...c.other.filter(u=>u.slot!==0)].filter(alive).slice(0,2))c.deploy('light-beacon',{assigned:t});},c=>c.other.some(u=>c.threat(u)||alive(c.b.target(u)))&&!c.count('light-beacon'))]);
species(52,[hit(c=>{c.hit(1.35*c.A);c.selfward(.25*c.A,2);}),support(c=>{c.selfward(c.A);c.dr(.2,3,'nextActiveDR',c.u,true);},c=>c.threat()),hit(c=>c.hit((c.startShield?3.2:2.8)*c.A))]);
species(53,[attack(1.4),hit(c=>{c.hit(c.A);c.f.proc(c.u,c.t,.8*c.A,'magic',c.s.name);}),hit(c=>{c.hit(1.6*c.A);c.f.proc(c.u,c.t,1.5*c.A,'magic',c.s.name);})]);
species(54,[hit(c=>{c.hit(1.2*c.A);if(c.mark('Clinging Resin'))c.debuff('Clinging Resin','basicPenalty',.1,3);}),support(c=>c.selfward(.12*c.H),c=>c.threat()&&c.u.shield<.05*c.H),support(c=>c.deploy('resin-screen'),c=>!c.count('resin-screen')&&root.BondCombatEntities.screenThreat(c.f,c.u))]);
species(55,[hit(c=>{c.hit(1.05*c.M);c.debuff('Saffron Script','rider',.2*c.M,2);}),support(c=>c.deploy('assault-rune',{assigned:alive(c.tr)&&alive(c.b.target(c.tr))?c.tr:c.other[0]}),c=>!c.count('assault-rune')&&c.all.some(u=>alive(c.b.target(u)))),support(c=>c.deploy('ward-rune',{assigned:c.f.lowest(c.u,c.all.filter(u=>c.threat(u)))||c.low}),c=>!c.count('ward-rune')&&c.wardGate())]);
species(56,[attack(1.35),support(c=>{c.cleanse(c.u,'dot');c.heal(c.u,.08*c.H);c.buff(c.u,'Vent the Coals','hit',15,3);},c=>c.hp()<=.55||c.hp()<=.75&&Object.values(c.u.effects).some(e=>e.kind==='dot')),hit(c=>{c.hit(2.7*c.A);c.selfward(.06*c.H);})]);
species(57,[hit(c=>{c.hit(1.15*c.M);c.heal(c.low,.3*c.M);}),support(c=>{c.selfward(.08*c.H+.6*c.M);c.shield(c.tr,.5*c.M);},c=>c.threat()||c.hp(c.tr)<=.7),support(c=>{c.teamheal(.9*c.M);c.heal(c.u,.04*c.H);},c=>c.hp()<.65||c.partyGate())]);
species(58,[attack(1.4),support(c=>{for(const t of c.all){c.buff(t,'Battle Drumming aim','hit',15,3);c.buff(t,'Battle Drumming power','physicalPower',.08,3);}},c=>c.all.some(u=>u.basicCategory!=='magic')),hit(c=>{c.hit(2.6*c.A);c.control(.5);})]);
species(59,[attack(1.35),hit(c=>{c.hit(1.8*c.M);c.selfward(.6*c.M);}),hit(c=>{const low=c.hp(c.t)<.5;c.hit(2.7*c.M);if(low)c.shield(c.low,.6*c.M);})]);
species(60,[hit(c=>{c.hit(1.1*c.A);c.debuff('Signal Seed','markedHit',20,3);}),support(c=>c.buff(c.best(),'Marching Whistle','basicTempo',.12,3+.3*c.take('Beat')),c=>alive(c.b.target(c.best()))),support(c=>{c.heal(c.low,1.6*c.M*(1+.1*c.take('Beat')));c.shield(c.low,.04*c.H);},c=>c.wounded(.7))]);
species(61,[hit(c=>{c.hit(1.2*c.M);c.debuff('Thread','thread',.12,3);}),support(c=>c.shield(c.low,1.15*c.M),c=>c.wardGate()),support(c=>c.deploy('silk-anchor',{anchor:c.t}),c=>alive(c.t)&&c.b.inRange(c.u,c.t)&&!c.count('silk-anchor'))]);
species(62,[attack(1.35),support(c=>{c.selfward(.9*c.A);c.buff(c.u,'Polished Shell','crit',.1,3);},c=>c.threat()||(c.mark('Polished Patience',c.u)?.value||0)>=.08),hit(c=>{if(c.hit(2.9*c.A).critical)c.selfward(.5*c.A,2);})]);
species(63,[hit(c=>c.hit(1.35*c.A,{hitBonus:20})),support(c=>{c.buff(c.u,'Loose Hem','flee',25,3);c.buff(c.u,'Silk counter','nextBasic',.4*c.A,3);},c=>alive(c.t)),hit(c=>{c.hit(2.8*c.A);c.debuff('Severed Stitch','hit',-20,3);})]);
species(64,[hit(c=>{c.hit(1.3*c.A);c.add('Sprout',1,2);}),support(c=>c.shield(c.tr,.7*c.A+.04*c.H),c=>c.trainerGate()),support(c=>{c.heal(c.low,1.7*c.M);c.cleanse(c.low,'dot');},c=>c.wounded(.7)||c.all.some(u=>c.hp(u)<.85&&Object.values(u.effects).some(e=>e.kind==='dot')))]);
species(65,[support(c=>c.heal(c.low,.7*c.M),c=>c.wounded()||c.all.some(u=>u.debt.some(d=>d.kind==='air'))),support(c=>{const t=c.f.lowest(c.u,c.all.filter(u=>u.debt.some(d=>d.kind==='air')))||c.low;c.heal(t,(t.debt.some(d=>d.kind==='air')?1.65:1.25)*c.M);},c=>c.wounded(.7)||c.all.some(u=>u.debt.some(d=>d.kind==='air'))),support(c=>{c.teamheal(.85*c.M);c.teamward(.4*c.M);},c=>c.partyGate())]);
species(66,[hit(c=>{c.hit(1.2*c.A);c.buff(c.u,'Hexaspine','hit',15,2);}),support(c=>{c.selfward(.1*c.H);c.buff(c.u,'Locked facets','plates',.3,3);},c=>c.threat()),support(c=>{c.guard(.25,3,.45);c.dr(.15,3,'magicDR');},c=>c.hp()>.45&&c.trainerGate(.65))]);
species(67,[support(c=>c.heal(c.low,.7*c.M),c=>c.wounded()),support(c=>{c.heal(c.low,1.25*c.M);c.shield(c.low,.35*c.M);},c=>c.wounded(.75)),support(c=>{const actual=c.heal(c.low,1.9*c.M);c.selfward(Math.min(.7*c.M,.5*Math.max(0,1.9*c.M-actual)));},c=>c.wounded(.65))]);
species(68,[attack(1.25),support(c=>{c.shield(c.low,.95*c.M);c.buff(c.low,'Jelly Veil','critDR',.2,3,{once:true});},c=>c.wardGate()),hit(c=>{const numb=c.mark('Numb');c.hit(2.7*c.M);if(numb)c.debuff('Deep Sting','hit',-20,3);})]);
species(69,[attack(1.5),support(c=>{c.buff(c.u,'Claw Cock aim','hit',20,3);c.buff(c.u,'Claw Cock','nextBasic',.7*c.A,3);},c=>alive(c.t)&&!c.mark('Claw Cock',c.u)),hit(c=>{c.hit(3.1*c.A);c.debuff('Armor exposure','physicalExposure',.05,3);})]);
species(70,[attack(1.35),hit(c=>{c.hit(1.8*c.M);c.debuff('Funeral Fold','healReceived',-.2,3);}),hit(c=>{c.mods.bonus+=(c.resources.Haunt||0)*.25;c.hit(2.9*c.M);})]);
species(71,[support(c=>{c.heal(c.low,.65*c.M);c.heal(c.u,.2*c.M);},c=>c.wounded()),support(c=>{for(const t of c.other)c.shield(t,.75*c.M);},c=>c.threat(c.tr)||c.other.length>=2&&c.other.every(u=>c.hp(u)<.85)),support(c=>{c.teamheal(.85*c.M);for(const t of c.all)c.cleanse(t,'dot');},c=>c.partyGate()||c.all.filter(u=>Object.values(u.effects).some(e=>e.kind==='dot')).length>=2)]);
species(72,[attack(1.35),support(c=>{c.selfward(.1*c.H);c.buff(c.u,'Close the Hollow','hollowClosed',1,3);},c=>c.threat()||c.hp()<=.7),hit(c=>{c.hit(2.7*c.A);c.debuff('Condensed Blow','basicDamage',-.15,3);})]);
species(73,[hit(c=>{c.hit(1.15*c.A);c.debuff('Grip','trainerDamage',-.12,3);}),hit(c=>{c.hit(1.5*c.A);c.taunt(false);c.dr(.1,2);}),hit(c=>c.hit(2.4*c.A+Math.min(.02*c.H,.8*c.A)))]);
species(74,[attack(1.35),support(c=>c.shield(c.tr,.8*c.A+.03*c.H),c=>c.trainerGate()),support(c=>{c.heal(c.low,1.6*c.M);c.cleanse(c.low,'dot');},c=>c.wounded(.7)||c.all.some(u=>c.hp(u)<.85&&Object.values(u.effects).some(e=>e.kind==='dot')))]);
species(75,[attack(1.3),support(c=>c.shield(c.low,1.05*c.M),c=>c.wardGate()),hit(c=>{c.hit(2.5*c.M);c.heal(c.low,.65*c.M);})]);
species(76,[hit(c=>c.hit(1.35*c.A,{hitBonus:15})),hit(c=>{c.hit(1.5*c.A);c.debuff('Calcify','flee',-20,3);c.control(.5);}),hit(c=>c.hit((c.mark('Calcify')?3.25:2.7)*c.A))]);
species(77,[hit(c=>{c.hit(1.15*c.A);c.debuff('Basalt Thorn','healReceived',-.15,3);}),support(c=>c.heal(c.u,.09*c.H),c=>c.hp()<=.7),support(c=>{c.shield(c.tr,.1*c.H,4);c.selfward(.05*c.H);},c=>c.trainerGate(.7))]);
species(78,[attack(1.35),support(c=>c.selfward(.9*c.M+.03*c.H),c=>c.threat()||c.hp()<=.7),support(c=>c.deploy('imperial-hearth'),c=>alive(c.t)&&c.b.inRange(c.u,c.t)&&!c.count('imperial-hearth'))]);
species(79,[attack(1.45),hit(c=>{c.hit(1.7*c.M);if(c.results[0].hit&&!c.t.temporary){const t=c.t,mark=c.buff(t,'Scorchline','deathMark',c.M,2.05,{harmful:true});c.f.later(c.u,t,2,()=>{if(c.f.get(t,'Scorchline')===mark){c.f.remove(t,'Scorchline');if(alive(t))c.f.proc(c.u,t,.25*mark.value,'magic','Scorchline');}},{ownerRequired:true,label:'Scorchline'});}}),hit(c=>{c.hit(2.9*c.M);c.selfward(.6*c.M,2);})]);
species(80,[attack(1.35),support(c=>{c.selfward(.85*c.M+.03*c.H);c.u.kit.ribCycle=1;},c=>c.threat()||c.hp()<=.7),hit(c=>c.hit((c.startShield?3.1:2.7)*c.M))]);
species(81,[attack(1.4),support(c=>{c.selfward(.85*c.A);c.buff(c.u,'Frond Fence','flee',20,3);c.buff(c.u,'Recoil','recoil',1,10);},c=>c.threat()||!c.mark('Recoil',c.u)),hit(c=>{c.hit(2.9*c.A);c.debuff('Fully Unfurled','hit',-20,3);})]);
species(82,[hit(c=>c.hit((c.b.time-(c.u.kit.carapaceAt??-10)<=2?1.5:1.2)*c.A)),support(c=>c.guard(.25,3,.45),c=>c.hp()>.45&&c.trainerGate(.65)),support(c=>{c.selfward(.18*c.H,4);c.dr(.1,2);},c=>c.threat()&&c.u.shield<.08*c.H||c.hp()<=.65)]);
species(83,[hit(c=>{c.hit(1.3*c.A);c.selfward(.25*c.A,2);}),support(c=>{if(!c.cleanse(c.u,'blind'))c.cleanse(c.u,'tempo');c.selfward(.9*c.A);},c=>c.threat()||c.hp()<.75||c.f.value(c.u,'hit')<0||c.f.value(c.u,'basicPenalty')>0),hit(c=>{c.hit(2.7*c.A);c.debuff('Molten Constriction','healReceived',-.2,3);})]);
species(84,[support(c=>c.heal(c.low,.7*c.M),c=>c.wounded()),support(c=>{const candidates=c.all.filter(u=>Object.values(u.effects).some(e=>e.harmful||e.value<0||e.kind==='dot'));const t=candidates.find(u=>u===c.tr)||c.f.lowest(c.u,candidates)||c.low;c.cleanse(t);c.heal(t,c.M);},c=>c.wounded(.65)||c.all.some(u=>Object.values(u.effects).some(e=>e.harmful||e.value<0||e.kind==='dot'))),support(c=>{for(const t of c.all){c.cleanse(t);c.heal(t,.8*c.M);}},c=>c.all.filter(u=>c.hp(u)<.75||Object.values(u.effects).some(e=>e.harmful||e.value<0||e.kind==='dot')).length>=2||c.tr&&Object.values(c.tr.effects).some(e=>e.kind==='control'||e.kind==='healReceived'&&e.value<0))]);
species(85,[hit(c=>{c.hit(1.15*c.M);c.heal(c.u,.3*c.M);}),support(c=>c.heal(c.u,.8*c.M+.07*c.H),c=>c.hp()<=.75),support(c=>{c.shield(c.tr,1.1*c.M+.04*c.H,4);c.heal(c.u,.6*c.M);},c=>c.trainerGate(.7))]);
species(86,[hit(c=>c.hit(1.15*c.A+Math.min(.02*c.H,.6*c.A))),support(c=>{c.heal(c.u,.08*c.H);c.dr(.1,3,'dr',c.tr);},c=>c.hp()<.75||c.threat(c.tr)),support(c=>{for(const t of [c.tr,c.u].filter(alive))c.deploy('sapling-warden',{assigned:t});},c=>!c.count('sapling-warden')&&(c.threat()||c.threat(c.tr)))]);
species(87,[attack(1.3),hit(c=>{c.hit(1.45*c.M,{area:true});c.splash(.35*c.M);c.selfward(.35*c.M);}),support(c=>c.deploy('seedjaw'),c=>alive(c.t)&&c.b.inRange(c.u,c.t)&&!c.count('seedjaw'))]);
species(88,[support(c=>{const t=c.low,amount=.7*c.M; c.primary={kind:'heal',amount,target:t};c.shield(t,.25*c.M,1);c.buff(t,'Pending Glowseed','pendingHeal',amount,1.05);c.f.later(c.u,t,1,()=>c.f.heal(c.u,t,amount,'Glowseed',{primary:true}),{label:'Glowseed'});},c=>c.wounded()&&(!c.mark('Pending Glowseed',c.low)||c.hp(c.low)<.55)),support(c=>c.deploy('nightlight-cap',{assigned:c.low}),c=>!c.count('nightlight-cap')&&c.wardGate(.85)),support(c=>{c.teamheal(.75*c.M);const e=c.f.entities.find(e=>alive(e)&&e.master===c.u&&e.profile==='nightlight-cap');if(e)root.BondCombatEntities.pulse(c.f,e,{heal:.6});},c=>c.partyGate())]);
species(89,[support(c=>{c.heal(c.low,.65*c.M);c.dr(.3,2,'nextDotDR',c.low,true);},c=>c.wounded()),support(c=>{const low=c.hp(c.low)<=.4;c.heal(c.low,1.2*c.M);if(low)c.shield(c.low,.4*c.M);},c=>c.wounded(.7)),support(c=>{c.cleanse(c.low,'heal');c.heal(c.low,2*c.M);},c=>c.wounded(.6)||c.all.some(u=>c.hp(u)<.8&&c.f.value(u,'healReceived')<0))]);
species(90,[hit(c=>{c.hit(1.1*c.A);c.heal(c.u,.02*c.H);}),support(c=>c.shield(c.tr,(.08+.02*c.take('Seedling'))*c.H),c=>c.trainerGate(.7)),support(c=>{const n=c.take('Seedling');for(const t of c.all)c.heal(t,(.75+(t===c.low?.25*n:0))*c.M);},c=>c.partyGate())]);
species(91,[attack(1.3),hit(c=>{c.hit(1.75*c.M);c.debuff('Magic exposure','magicExposure',.05,3);}),hit(c=>{c.mods.bonus+=(c.resources.Crosswind||0)*.15*c.M;c.hit(2.7*c.M,{area:true});c.splash(.4*c.M,24);})]);
species(92,[hit(c=>{c.hit(1.2*c.A);c.selfward(.03*c.H,2);}),trainerWard(.11,.7),support(c=>{c.heal(c.u,.06*c.H);c.guard(.3,3,.4);},c=>c.hp()>.4&&c.trainerGate(.6))]);
species(93,[hit(c=>{c.hit(1.15*c.M);c.selfward(.3*c.M,2);}),support(c=>c.shield(c.tr,c.M+.03*c.H),c=>c.trainerGate()),support(c=>{c.selfward(.12*c.H,4);c.heal(c.low,1.1*c.M);},c=>c.threat()&&c.hp()<.75||c.hp(c.tr)<.65)]);
function noteGate(c){const n=c.mark('Remembered Note',c.u);return !!n&&(n.record.kind==='damage'?alive(c.t)&&c.b.inRange(c.u,c.t):n.record.kind==='heal'?c.wounded():c.wardGate(.8));}
function echo(c,ratio,cap){const n=c.mark('Remembered Note',c.u);if(!n)return;const {kind,amount}=n.record,power=Math.min(cap*c.M,ratio*amount);if(kind==='damage')c.hit(power,{category:'magic',proc:true});else if(kind==='heal')c.heal(c.low,power,{echo:true});else c.shield(c.low,power,3,{echo:true});}
species(94,[hit(c=>{c.hit(1.1*c.M);if(c.mark('Remembered Note',c.u))c.selfward(.3*c.M,2);}),support(c=>echo(c,.45,1.3),noteGate),support(c=>{echo(c,.7,2);c.shield(c.tr,.5*c.M);},noteGate)]);
species(95,[hit(c=>{c.hit(1.2*c.A);c.debuff('Blot Flick','hit',-15,3);}),hit(c=>{c.hit(.9*c.A);c.deploy('ink-double',{linked:c.t.id});},c=>!c.count('ink-double')),hit(c=>{c.hit(2.8*c.A);c.debuff('Erase the Face','hit',-25,3);})]);
species(96,[hit(c=>{c.hit(1.15*c.A);c.selfward(.04*c.H,2);}),support(c=>{c.heal(c.u,.08*c.H);c.shield(c.tr,.04*c.H);},c=>c.hp()<.75||c.threat(c.tr)),support(c=>{c.guard(.3,3,.45);c.dr(.1,3,'physicalDR');},c=>c.hp()>.45&&c.trainerGate(.65))]);
species(97,[hit(c=>{c.hit(1.15*c.M);c.debuff('Hinge Hex','nextMagicWeakness',.12,3);}),support(c=>c.selfward(.1*c.H+.6*c.M),c=>c.threat()||c.hp()<=.7),support(c=>{c.heal(c.u,.08*c.H);c.shield(c.tr,1.2*c.M);},c=>c.hp()<.75||c.threat(c.tr))]);
species(98,[hit(c=>c.hit((c.mark('Remembered attacker',c.u)?.target===c.t.id?1.6:1.35)*c.A)),support(c=>{c.heal(c.u,.06*c.H);c.dr(.15,2);},c=>c.hp()<=.75||c.f.enemies(c.u).filter(e=>e.targetId===c.u.id).length>=2),hit(c=>{c.hit(2.7*c.A);c.debuff('Armor exposure','physicalExposure',.06,3);})]);
species(99,[hit(c=>{c.hit(1.2*c.M);c.debuff('Polite Mockery','damage',-.08,2);}),support(c=>{c.deploy('trickster-spirit');c.deploy('trickster-spirit');},c=>alive(c.t)&&!c.count('detached-spirit')),support(c=>{for(const t of [c.tr,...c.other.filter(u=>u.slot!==0)].filter(alive).slice(0,2))c.deploy('guardian-spirit',{assigned:t});},c=>!c.count('detached-spirit')&&c.other.some(u=>c.threat(u)||c.hp(u)<.8)),hit(c=>{c.hit(2.45*c.M);c.shield(c.low,.7*c.M);})]);
species(100,[attack(1.35),selfHeal(.08,c=>c.dr(.15,2,'physicalDR')),hit(c=>{c.hit(2.8*c.A);if(c.mods.coil)c.debuff('Armor exposure','physicalExposure',.05,3);})]);
const general={
 'Quick Strike':hit(c=>c.hit(1.25*c.P)), 'Brace':support(c=>c.dr(.15,2),c=>c.threat()),
 'Basic Ward':support(c=>c.shield(c.low,.6*c.M),c=>c.wardGate()),
 'Focused Attack':hit(c=>c.hit(1.9*c.P,{hitBonus:20})), 'Basic Heal':support(c=>c.heal(c.low,1.4*c.M),c=>c.wounded()),
 'Battle Rhythm':support(c=>c.buff(c.u,'Battle Rhythm','basicTempo',.12,3),c=>alive(c.t)),
 'Guard':support(c=>c.guard(.2,2,.5),c=>c.hp()>.5&&c.trainerGate(.65)),
 'Fortify':support(c=>c.selfward(.12*c.H,4),c=>c.threat()||c.hp()<=.65),
 'Rally':support(c=>c.buff(c.best(),'Rally','damage',.12,3),c=>alive(c.best())&&alive(c.b.target(c.best()))),
 'Greater Heal':support(c=>c.heal(c.low,2*c.M),c=>c.wounded(.65)), 'Heavy Attack':hit(c=>c.hit(2.8*c.P))
};
for(const s of Object.values(catalog.skills).filter(s=>!s.number)){if(!general[s.name])throw Error('Undefined general move: '+s.name);definitions.set(s.id,{...s,...general[s.name]});}
function install(){
 for(const [id,s] of definitions){
  const u=s.owner&&C.UNITS[s.owner],category=u?.basicCategory||'melee';
  C.SKILLS[id]={id,name:s.name,kind:s.kind==='hit'?'hit':'workbook',amount:0,cd:s.cd,category:s.kind==='hit'?category:null,icon:s.kind==='hit'?'✦':'✧',description:brief(s.proposal),workbook:true};
 }
 for(const [id,s] of Object.entries(catalog.species)){
  const u=C.UNITS[id],legacy=[...u.skills],own=[...definitions.values()].filter(d=>d.owner===id).map(d=>d.id),shared=catalog.builds.filter(b=>b.owner===id).flatMap(b=>b.skills).map(name=>[...definitions.values()].find(d=>d.name===name&&d.owner===null)?.id).filter(Boolean);
  u.legacySkills=legacy;u.skills=[...new Set([...own,...shared,...legacy])];u.default=own.slice(0,3);u.workbookNumber=s.number;u.passive=s.passive.id;C.PASSIVES[u.passive]={...s.passive,description:brief(s.passive.description)};
  u.trait=C.PASSIVES[u.passive].description;
  u.range=s.delivery.startsWith('Melee')?1:4;u.delivery=s.delivery.startsWith('Melee')?'melee':'ranged';
  // Damage category keeps the source attack basis; range independently controls delivery.
  u.basicCategory=s.attackBase==='INT'?'magic':s.attackBase==='DEX'?'ranged':'melee';
 }
}
function brief(text){
 const sentences=String(text||'').replace(/\bcore (ally|allies|monster|monsters|party)\b/g,'$1').replace(/target lock/g,'target').split(/(?<=\.)\s+(?=[A-Z])/);
 let out=sentences[0];if(sentences[1]&&out.length+sentences[1].length<230&&!/^(No |This |Maximum|It cannot|The [0-9])/.test(sentences[1]))out+=' '+sentences[1];
 out=out.replace(/([0-9]+(?:\.[0-9]+)?%?)\s*A\b/g,'$1 ATK').replace(/\bM\b/g,'MATK').replace(/\bH\b/g,'max HP').replace(/\bP\b/g,'primary ATK').replace(/([\d.]+)R\b/g,'$1× melee reach').replace(/\blowest-HP% ally\b/g,'most wounded ally').replace(/\bself-shielded\b/g,'shielded').replace(/\bself-shield\b/g,'shield').replace(/\bpercentage points\b/g,'points');
 return out;
}
const placements={
 'Thunderhead Totem':c=>['stormcap',{anchor:c.t}], 'Cast a Kilnling':c=>['kilnling',{}],
 'Brood Call':c=>['soldier-ant',{}], 'Resin Bastion':c=>['resin-screen',{}],
 'Two Lanterns':c=>['light-beacon',{assigned:c.tr}], 'Root Rune':c=>['assault-rune',{assigned:c.tr||c.other[0]}],
 'Petal Benediction':c=>['ward-rune',{assigned:c.f.lowest(c.u,c.all.filter(u=>c.threat(u)))||c.low}],
 'Crescent Loom':c=>['silk-anchor',{anchor:c.t}], 'Imperial Hearth':c=>['imperial-hearth',{}],
 'Old Forest Stand':c=>['sapling-warden',{assigned:c.tr||c.u}], 'Bloomjaw Turret':c=>['seedjaw',{}],
 'Floating Canopy':c=>['nightlight-cap',{assigned:c.low}], 'Unmask the Tricksters':c=>['trickster-spirit',{}],
 'False Smile':c=>['guardian-spirit',{assigned:c.tr}]
};
function fits(c){const fn=placements[c.s.name];if(!fn)return true;const [id,options]=fn(c);return !!root.BondCombatEntities.placement(c.f,c.u,root.BondCombatEntities.profiles[id],options);}
function usable(f,u,skill){const d=definitions.get(skill.id||u.skills.find(id=>C.SKILLS[id]===skill));if(!d)return null;if(f.has(u,'Silence'))return false;const c=new Context(f,u,d);return (!d.gate||d.gate(c))&&fits(c)&&(!f.battle.overcharge||d.kind==='hit'||!/heal/i.test(d.proposal));}
function cast(f,u,skill){
 const d=definitions.get(skill.id);if(!d)return null;const c=new Context(f,u,d);
 if(f.has(u,'Silence')||d.gate&&!d.gate(c)||!fits(c)||d.kind==='hit'&&!f.battle.inRange(u,c.t,skill))return false;
 c.mods=root.BondCombatPassives?.beforeCast(f,c)||{};root.BondClassTalents?.beforeCast(f,c);
 u.casts++;f.battle.emit('cast',u,d.kind==='hit'?c.t:u,d.name,0,{skillName:d.name,skillKind:skill.kind,skillId:d.id});
 // Set execution cooldown first; any explicit refund applies to this real timer.
 const index=u.skills.indexOf(d.id);if(index>=0)u.cds[index]=d.cd*(1-Math.min(.5,(u.growth?.cooldown||0)+(u.growth?.skillCooldown?.[d.id]||0)));
 f.begin();d.act(c);f.finish();
 if(c.primary?.kind==='deployment'&&!c.deployments&&!c.receivers.length){if(index>=0)u.cds[index]=0;u.casts--;return false;}
 if(!f.battle.ended){root.BondCombatPassives?.afterCast(f,c);root.BondClassTalents?.afterCast(f,c);}
 return true;
}
// Missing definitions fail boot; spreadsheet prose is never used as a fallback implementation.
root.BondCombatKits={Context,definitions,install,usable,cast};
install();
})(globalThis);
