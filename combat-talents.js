/* Passive class event rules. Secondary packets cannot recursively become player actions. */
(function(root){
'use strict';
const alive=u=>root.BondCombatEffects.alive(u),rank=(u,id)=>u.talents?.[id]||0,value=(u,id,a,b)=>rank(u,id)===2?b:rank(u,id)?a:0;
function trainer(f,u){return u.slot===0&&!u.temporary?u:f.trainer(u);}
function put(f,u,t,key,kind,amount,seconds,extra={}){return f.put(u,t,key,kind,amount,seconds,extra);}
function start(f,u){
 if(u.slot!==0||u.storyMaster)return;
 const profile=u.side===0?f.battle.ownerProfiles[u.ownerIndex]:null;u.talents=f.battle.classTrees===1?root.BondClassTrees.clean(u.type,profile?.growth?.[u.type],root.BondClassTrees.budget(u.level)):{};
 if(rank(u,'KR1'))u.kit.Resolve=1;
 if(rank(u,'KB2'))put(f,u,u,'Measured Blow','nextDirectDR',value(u,'KB2',.12,.2),3,{once:true});
 deploy(f,u);quarry(f,u,true);
}
function deploy(f,u){
 const E=root.BondCombatEntities,entities=f.entities.filter(e=>alive(e)&&e.master===u);
 if(rank(u,'MA1')&&!entities.some(e=>e.profile==='astral-lens')&&E.placement(f,u,E.profiles['astral-lens'])&&f.ready(u,'lensDeploy',8)){
  const e=E.spawn(f,u,'astral-lens',{attack:value(u,'MA1',.18,.3),hpMultiplier:1+value(u,'MA3',.25,.5)});if(e&&rank(u,'MA3'))f.shield(u,u,value(u,'MA3',.02,.04)*u.maxHp,2,'Prismatic Housing');
 }
 if(rank(u,'DG1')&&!entities.some(e=>e.profile==='heartwood')){
  const front=[...f.core(u)].sort((a,b)=>u.side?a.position.x-b.position.x:b.position.x-a.position.x||a.id.localeCompare(b.id))[0];
  if(!E.placement(f,u,E.profiles.heartwood,{assigned:front})||!f.ready(u,'treeDeploy',10))return;
  const e=E.spawn(f,u,'heartwood',{assigned:front,heal:value(u,'DG1',.15,.25)});if(e){
   if(rank(u,'DG3'))for(const t of [u,f.lowest(u,f.others(u))].filter(alive))f.shield(u,t,value(u,'DG3',.2,.35)*f.stats(u).M+.01*u.maxHp,3,'Sheltering Bough');
   if(rank(u,'DG5'))E.spawn(f,u,'barkling',{assigned:front,parent:e});
  }
 }
}
function tick(f,u){if(u.slot===0&&!u.storyMaster)quarry(f,u);}
function focus(f,u){f.put(u,u,'Patient Aim','crit',(u.kit.Focus||0)*value(u,'HD1',.03,.05),75,{replace:true});}
function quarry(f,u,initial=false){
 if(u.type!=='hunter')return;const t=f.battle.target(u),old=f.battle.units.find(t=>t.id===u.kit.quarryOrigin);
 if(t&&!t.temporary&&(initial||!u.kit.quarryOrigin||old&&!alive(old))){u.kit.quarryOrigin=t.id;u.kit.Focus=value(u,'HD3',1,2);focus(f,u);}
}
function beforeCast(f,c){
 const u=c.u;if(u.slot!==0)return;const damaging=c.s.kind==='hit';
 if(damaging){
  const script=f.remove(u,'Illuminated Script');if(script){c.mods.script=true;c.mods.scriptMode=script.mode;c.mods.bonus+=(value(u,'MG1',.4,.7)*c.M)*(rank(u,'MG5')&&script.mode==='damage'?1.5:1);u.kit.script={};}
  for(const key of ['Borrowed Syntax','Prismatic Refusal','Red Ledger','Call and Answer']){const e=f.remove(u,key);if(e)c.mods.bonus+=e.value;}
  if(rank(u,'HD4')&&(u.kit.Focus||0)>=3){u.kit.Focus--;focus(f,u);c.mods.bonus+=value(u,'HD4',.3,.5)*c.A;}
  if(f.remove(u,'Perfect Arrow'))c.mods.perfectArrow=true;
 }
}
function outgoing(f,u,t,amount,d){
 if(d.proc||u.temporary)return amount;
 const owner=trainer(f,u);
 if(owner?.type==='hunter'&&u!==owner){const signal=f.get(t,'Hunting Signal');if(signal?.source===owner.id)amount*=1+value(owner,'HP1',.06,.1);}
 if(d.basic){
  const rally=f.remove(u,'Rallying Standard');if(rally)amount+=rally.value;
  if(u.slot===0&&rank(u,'KR1')&&(u.kit.Resolve||0)>=3){u.kit.Resolve-=3;d.reprisal=value(u,'KR1',.3,.5)*f.stats(u).A;}
  if(u.slot===0){const cross=f.remove(u,'Crossfire');if(cross)amount+=cross.value;}
 }
 return amount;
}
function hitBonus(f,u,t,d){
 if(u.slot===0&&u.type==='hunter')return 10;
 const knight=f.core(u).find(a=>a.type==='swordsman'&&a.slot===0);
 return knight&&knight!==u&&knight.targetId===t.id?value(knight,'KN2',12,20):0;
}
function incoming(f,actor,u,raw,d){
 if(d.direct===false||d.dot||d.transfer||d.debt)return raw;
 const k=f.core(u).find(v=>v.type==='swordsman'&&v.slot===0&&v!==u&&v.shield>0);if(k)raw*=1-value(k,'KB3',.05,.09);
 if(u.type==='hunter'&&u.slot===0&&f.others(u).filter(v=>v.slot>0).length===2)raw*=1-value(u,'HP3',.03,.05);
 return raw;
}
function barrier(f,actor,u,raw,d){
 if(d.transfer||d.debt)return raw;
 for(const p of f.barriers.filter(p=>p.owner.owner===u.owner&&p.owner.side===u.side&&p.until>f.battle.time&&p.amount>0).sort((a,b)=>a.until-b.until||a.owner.id.localeCompare(b.owner.id))){const used=Math.min(raw,p.amount);raw-=used;p.amount-=used;f.battle.emit('absorb',p.owner,u,'Prism Sanctuary',used);}
 return raw;
}
function beforeHP(f,actor,u,raw,d){
 if(d.direct===false||d.dot||d.transfer||d.debt||!actor||actor.side===u.side)return raw;
 const seed=f.get(u,'Mending Seed');if(!seed||raw<.12*u.maxHp)return raw;const owner=f.battle.units.find(v=>v.id===seed.source);
 if(alive(owner)&&rank(owner,'DL4')){const prevented=raw*value(owner,'DL4',.1,.18);f.remove(u,'Mending Seed');seed.consumed=true;seed.owner=owner;d.consumedSeed=seed;return raw-prevented;}
 return raw;
}
function stagger(f,actor,u,raw,d){
 if(u.slot!==0||!rank(u,'KB4')||d.direct===false||d.dot||d.transfer||d.debt)return raw;
 const outstanding=u.debt.filter(e=>e.kind==='stagger').reduce((n,e)=>n+e.amount,0),deferred=Math.max(0,Math.min(raw*value(u,'KB4',.12,.2),u.maxHp*.2-outstanding));
 for(let i=1;i<=3&&deferred>0;i++){
  const debt={id:++f.sequence,kind:'stagger',amount:deferred/3,due:f.battle.time+i};u.debt.push(debt);
  f.later(actor,u,i,()=>{const current=u.debt.find(e=>e.id===debt.id);if(current){u.debt=u.debt.filter(e=>e!==current);f.loss(actor,u,current.amount,'Stagger',{debt:true,direct:false});}},{label:'Stagger'});
 }
 if(deferred)f.battle.emit('debt',u,u,'Stagger',deferred,{due:f.battle.time+3});return raw-deferred;
}
function replant(f,owner,target){
 if(!rank(owner,'DL5')||owner.kit['replant:'+target.id]||!alive(target))return;
 owner.kit['replant:'+target.id]=true;put(f,owner,target,'Mending Seed','seed',.6*f.stats(owner).M+.03*owner.maxHp,4,{greater:true});
}
function damaged(f,actor,u,amount,absorbed,d){
 if(f.battle.ended||!alive(u)||d.transfer||d.debt||d.dot||d.direct===false)return;
 if(rank(u,'MP5')&&!u.kit.sanctuary&&u.hp/u.maxHp<.45){u.kit.sanctuary=true;const amount=.12*u.maxHp+.8*f.stats(u).M;f.barriers.push({owner:u,amount,until:f.battle.time+4});f.battle.emit('shield',u,u,'Prism Sanctuary',amount,{granted:amount,shared:true});}
 if(rank(u,'KR1')&&(amount>0||absorbed>0)&&f.ready(u,'resolveCD',1))f.add(u,'Resolve',1,3);
 const seed=d.consumedSeed||amount>0&&f.remove(u,'Mending Seed');
 if(seed){const owner=f.battle.units.find(v=>v.id===seed.source);if(alive(owner)){
  if(!d.consumedSeed){const actual=f.heal(owner,u,seed.value,'Mending Seed');const other=f.lowest(owner,f.core(owner).filter(v=>v!==u));if(actual&&other&&rank(owner,'DL3'))f.heal(owner,other,actual*value(owner,'DL3',.4,.6),'Borrowed Spring',{alreadyScaled:true});}
  replant(f,owner,u);
 }}
 const briar=f.get(u,'Briar Gift');if(briar&&d.basic&&actor&&actor.side!==u.side){const owner=f.battle.units.find(v=>v.id===briar.source);if(alive(owner)&&rank(owner,'DT2'))spendBriar(f,owner,u,actor,briar,true);}
}
function broken(f,actor,u,p,d){
 if(u.slot===0&&rank(u,'MP4')&&u.pools.filter(x=>x.amount>0&&x.key!==p.key).length===0&&f.ready(u,'fractureCD',6))put(f,u,u,'Fracture Memory','nextDirectDR',value(u,'MP4',.15,.25),3,{once:true});
}
function healed(f,source,target,actual,o){
 if(rank(target,'KB5')&&actual>0){let budget=.25*actual;for(const debt of target.debt.filter(e=>e.kind==='stagger').sort((a,b)=>a.due-b.due||a.id-b.id)){const used=Math.min(budget,debt.amount);debt.amount-=used;budget-=used;if(budget<=0)break;}target.debt=target.debt.filter(e=>e.amount>0);}
 if(!o.primary||source.slot!==0||source.type!=='druid')return;
 if(rank(source,'DL2')&&o.offered>actual)f.shield(source,target,(o.offered-actual)*value(source,'DL2',.25,.4),3,'Gentle Excess',{cap:.06*target.maxHp});
}
function spendBriar(f,owner,wearer,target,e,retaliation=false){
 if(!e.charges||!f.ready(wearer,'briarSpendCD',.75))return;
 e.charges--;const M=f.stats(owner).M,amount=(retaliation?value(owner,'DT2',.08,.14):value(owner,'DT1',.12,.2))*M;
 f.proc(owner,target,amount,'magic','Briar Gift');if(!e.charges)f.remove(wearer,'Briar Gift');
 if(rank(owner,'DT3'))f.shield(owner,wearer,value(owner,'DT3',.08,.14)*M,2,'Thornsilk',{accumulate:true,cap:.05*owner.maxHp});
 if(rank(owner,'DT4')){put(f,owner,target,'Sour Sap healing','healReceived',-value(owner,'DT4',.1,.18),3,{harmful:true});put(f,owner,target,'Sour Sap strike','nextOutgoingDR',value(owner,'DT4',.05,.09),3,{harmful:true});}
 if(rank(owner,'DT5')&&f.ready(owner,'brambleHealCD',1))f.heal(owner,wearer,.01*owner.maxHp,'Crown of Brambles');
}
function landed(f,u,t,result,d){
 if(d.proc||u.temporary||f.battle.ended)return;
 const {A,M}=f.stats(u);
 if(u.slot===0&&d.basic){
  if(u.type==='mage'){const conduit=f.remove(u,'Arcane Conduit');if(conduit)f.proc(u,t,conduit.value,'magic','Arcane Conduit');}
  if(d.reprisal){const hit=f.proc(u,t,d.reprisal,'melee','Reprisal');if(rank(u,'KR2'))f.heal(u,u,Math.min(.02*u.maxHp,(hit.damage||0)*value(u,'KR2',.1,.18)),'Iron Appetite');
   if(rank(u,'KR3'))put(f,u,t,'Duelist Claim','basicDamage',-value(u,'KR3',.06,.1),2,{harmful:true});
   if(rank(u,'KR4'))put(f,u,u,'Red Ledger','charge',value(u,'KR4',.25,.45)*A,4);
   if(rank(u,'KR5')){f.shield(u,u,.04*u.maxHp,2,"King's Answer");for(const e of f.nearby(u,t,18,3,t).filter(e=>e!==t))f.proc(u,e,.35*d.reprisal,'melee',"King's Answer",{area:true,secondary:true});}
  }
  if(u.type==='hunter'){quarry(f,u);if(rank(u,'HD1')&&t.id===u.kit.quarryOrigin){f.add(u,'Focus',1,3);focus(f,u);}
   if(result.critical&&rank(u,'HD2')&&f.ready(u,'needleCD',.75))f.proc(u,t,value(u,'HD2',.08,.14)*A,'melee','Needlepoint');
   if(result.critical&&rank(u,'HD5')){f.add(u,'criticalBasics',1,3);if(u.kit.criticalBasics>=3){u.kit.criticalBasics=0;put(f,u,u,'Perfect Arrow','charge',1,75);}}
  }
 }
 const briar=f.get(u,'Briar Gift');if(briar){const owner=f.battle.units.find(v=>v.id===briar.source);if(alive(owner))spendBriar(f,owner,u,t,briar);}
 const owner=trainer(f,u);if(!owner)return;
 if(owner.type==='hunter'&&u!==owner){const mark=f.get(t,'Hunting Signal');if(mark?.source===owner.id){
  if(rank(owner,'HP2')){put(f,owner,owner,'Predator:'+u.id,'contributor',value(owner,'HP2',.04,.07),3);}
  if(rank(owner,'HP4')){owner.kit.crossfire||={};owner.kit.crossfire[u.id]={at:f.battle.time,target:t.id};const both=f.others(owner).filter(v=>v.slot>0);if(both.length===2&&both.every(v=>owner.kit.crossfire[v.id]?.target===t.id&&f.battle.time-owner.kit.crossfire[v.id].at<=2)&&f.ready(owner,'crossfireCD',2)){put(f,owner,owner,'Crossfire','nextBasic',value(owner,'HP4',.3,.5)*f.stats(owner).A,3);owner.kit.crossfire={};}}
 }}
 if(owner.type==='swordsman'&&rank(owner,'KN5')){owner.kit.banner||={};owner.kit.banner[u.id]={at:f.battle.time,target:t.id};const core=f.core(owner);if(core.length===3&&core.every(v=>owner.kit.banner[v.id]?.target===t.id&&f.battle.time-owner.kit.banner[v.id].at<=3)&&f.ready(owner,'bannerCD',4)){owner.kit.banner={};const [p1,p2]=f.others(owner).map(v=>f.stats(v).P);f.proc(owner,t,.7*f.stats(owner).A+.15*p1+.15*p2,'melee','Banner of Three');}}
}
function attachSnare(f,u,t,secondary=false){
 const existing=f.get(t,'Anchorline:'+u.id);if(existing)return;
 const active=f.enemies(u).filter(v=>f.has(v,'Anchorline:'+u.id));if(active.length>=3)return;
 const payload=value(u,'HT1',.15,.25)*f.stats(u).A*(secondary?.5:1);
 const e=put(f,u,t,'Anchorline:'+u.id,'snare',payload,2.05,{secondary,harmful:true});f.later(u,t,2,()=>snap(f,u,t,e),{ownerRequired:true,label:'Anchorline'});
}
function snap(f,u,t,e){
 if(!alive(u)||!alive(t)||f.battle.ended||f.get(t,'Anchorline:'+u.id)!==e)return;f.remove(t,'Anchorline:'+u.id);
 if(rank(u,'HT2'))put(f,u,t,'Tension Wire','nextOutgoingDR',value(u,'HT2',.08,.14),3,{harmful:true});
 f.proc(u,t,e.value,'melee','Anchorline',{guaranteed:true});
 if(rank(u,'HT4')){put(f,u,u,'Surefooted evasion','flee',value(u,'HT4',10,18),2);put(f,u,u,'Surefooted aim','hit',value(u,'HT4',8,12),2);}
 if(rank(u,'HT5')&&!e.secondary){u.kit.killingGround=++f.sequence;const token=u.kit.killingGround,point={position:{...t.position}},amount=.12*f.stats(u).A;
  for(const delay of [0,1,2])f.later(u,t,delay,()=>{if(u.kit.killingGround!==token)return;for(const enemy of f.nearby(u,point,18,3))f.proc(u,enemy,amount,'melee','Killing Ground',{area:true});},{ownerRequired:true,label:'Killing Ground'});
  f.zones=f.zones.filter(z=>z.owner!==u);f.zones.push({owner:u,position:point.position,radius:18,until:f.battle.time+3});
  f.battle.emit('zone',u,t,'Killing Ground',0,{position:point.position,radius:18,until:f.battle.time+3});
 }
}
function launch(f,u,t,d){for(const enemy of f.battle.team(1-u.side)){const e=f.get(u,'Anchorline:'+enemy.id);if(e)snap(f,enemy,u,e);}}
function afterCast(f,c){
 const u=c.u,owner=trainer(f,u);if(u.storyMaster||!owner||f.battle.ended)return;
 if(u!==owner){
  const M=f.stats(owner).M;
  if(rank(owner,'MG2')&&f.ready(owner,'syntaxCD',2))put(f,owner,owner,'Borrowed Syntax','charge',value(owner,'MG2',.12,.2)*M,4);
  if(rank(owner,'KN4')&&f.ready(owner,'answerCountCD',.75)&&!f.has(owner,'Call and Answer')){f.add(owner,'AnswerCount',1,3);if(owner.kit.AnswerCount>=3){owner.kit.AnswerCount=0;put(f,owner,owner,'Call and Answer','charge',value(owner,'KN4',.3,.5)*f.stats(owner).A,4);}}
  const lens=f.entities.find(e=>alive(e)&&e.master===owner&&e.profile==='astral-lens');if(lens&&rank(owner,'MA5')&&!lens.contributors[u.id]){lens.contributors[u.id]=true;const t=f.battle.target(owner);if(alive(t)&&f.battle.distance(lens,t)<=lens.entityReach)f.proc(lens,t,lens.attack*lens.snapshot.M+.25*M,'magic','Grand Orrery',{reach:lens.entityReach,ignoreRange:false});}
  return;
 }
 deploy(f,u);
 const {A,M,H}=f.stats(u),primary=c.primary,damage=primary?.kind==='damage',defensive=primary?.kind==='shield'||primary?.kind==='heal'&&primary.target===u||['guard','selfshield','selfheal'].includes(c.s.kind);
 if(u.type==='mage')put(f,u,u,'Arcane Conduit','charge',.15*M,3);
 if(u.type==='druid'){
  const target=f.lowest(u),e=put(f,u,target,'Living Sap','hot',.06*M,2.05);if(e)for(const delay of [1,2])f.later(u,target,delay,()=>{if(f.get(target,'Living Sap')===e)f.heal(u,target,e.value,'Living Sap');},{ownerRequired:true,label:'Living Sap'});
 }
 if(u.type==='swordsman')put(f,u,u,'Guard Memory','nextDirectDR',.08,2,{once:true});
 if(rank(u,'MG1')){
  if(!f.has(u,'Illuminated Script')){u.kit.script||={};u.kit.script[c.s.id]=damage;if(Object.keys(u.kit.script).length>=3){const mode=Object.values(u.kit.script).every(Boolean)?'damage':'support';put(f,u,u,'Illuminated Script','charge',1,75,{mode});}}
  if(c.mods.script&&c.results.some(r=>r.primary&&r.hit)){const target=primary.target;
   if(rank(u,'MG4'))f.later(u,target,.5,()=>{if(alive(target)&&f.battle.inRange(u,target))f.proc(u,target,value(u,'MG4',.2,.35)*M,'magic','Arcane Punctuation');},{ownerRequired:true,label:'Arcane Punctuation'});
   if(rank(u,'MG5')&&c.mods.scriptMode==='support')f.shield(u,f.lowest(u),.7*M,3,'Grand Conjunction');
  }
 }
 if(rank(u,'MG3')&&!damage)f.shield(u,u,value(u,'MG3',.2,.35)*M+.01*H,2,'Quiet Equation');
 if(rank(u,'MP1')){const granted=f.shield(u,u,value(u,'MP1',.25,.4)*M+value(u,'MP1',.01,.015)*H,3,'Faceted Skin',{accumulate:true,cap:.15*H});
  if(granted>0&&rank(u,'MP2')&&f.ready(u,'refusalCD',3))put(f,u,u,'Prismatic Refusal','charge',value(u,'MP2',.15,.25)*M,3);
  if(granted>0&&rank(u,'MP3'))f.shield(u,f.lowest(u,f.others(u).filter(v=>v.slot>0)),granted*value(u,'MP3',.25,.4),3,'Sheltercasting');
 }
 if(rank(u,'MA2')&&damage&&c.results.some(r=>r.primary&&r.hit))put(f,u,primary.target,'Lens mark','mark',1,3,{harmful:true});
 const lens=f.entities.find(e=>alive(e)&&e.master===u&&e.profile==='astral-lens');if(lens&&rank(u,'MA4')){lens.personalCasts=(lens.personalCasts||0)+1;if(lens.personalCasts%2===0)lens.charge=value(u,'MA4',.3,.5)*M;}
 const recipients=(c.receivers||[]).filter(r=>r.target&&r.target.owner===u.owner),target=recipients.sort((a,b)=>(a.before??a.target.hp/a.target.maxHp)-(b.before??b.target.hp/b.target.maxHp)||(a.target.slot===0?-1:b.target.slot===0?1:0)||a.target.id.localeCompare(b.target.id))[0]?.target;
 if(!damage&&primary?.kind==='heal'&&target&&rank(u,'DL1')&&f.ready(u,'seed:'+target.id,2))put(f,u,target,'Mending Seed','seed',value(u,'DL1',.2,.35)*M,4);
 if(!damage&&['heal','shield'].includes(primary?.kind)&&target&&rank(u,'DT1'))put(f,u,target,'Briar Gift','briar',1,4,{charges:rank(u,'DT5')?3:2});
 const tree=f.entities.find(e=>alive(e)&&e.master===u&&e.profile==='heartwood');if(tree&&rank(u,'DG4')&&['heal','shield'].includes(primary?.kind))tree.charge=value(u,'DG4',.12,.22)*M;
 if(rank(u,'KB1'))f.shield(u,u,value(u,'KB1',.02,.035)*H,3,'Layered Guard',{accumulate:true,cap:.08*H});
 if(rank(u,'KB2')&&defensive&&f.ready(u,'measuredCD',4))put(f,u,u,'Measured Blow','nextDirectDR',value(u,'KB2',.12,.2),3,{once:true});
 if(rank(u,'KR1')&&f.ready(u,'resolveCD',1))f.add(u,'Resolve',1,3);
 if(rank(u,'KN1')&&f.ready(u,'standardCD',2))for(const ally of f.core(u))put(f,u,ally,'Rallying Standard','charge',value(u,'KN1',.08,.14)*f.stats(ally).P,4);
 if(rank(u,'KN3')&&defensive)for(const ally of f.others(u).filter(v=>v.slot>0))f.shield(u,ally,value(u,'KN3',.015,.025)*H,2,'Shielded March');
 if(damage&&c.results.some(r=>r.primary&&r.hit)){
  const t=primary.target,marked=f.get(t,'Hunting Signal');
  if(rank(u,'HP1')){for(const enemy of f.enemies(u))if(enemy!==t&&f.get(enemy,'Hunting Signal')?.source===u.id)f.remove(enemy,'Hunting Signal');put(f,u,t,'Hunting Signal','mark',1,3,{harmful:true});}
  if(marked?.source===u.id&&rank(u,'HP5')&&f.ready(u,'alphaCD',4))for(const ally of f.others(u).filter(v=>v.slot>0))if(f.battle.inRange(ally,t))f.proc(ally,t,.4*f.stats(ally).P,ally.basicCategory,"Alpha's Command",{ignoreRange:false});
  if(rank(u,'HT1')&&f.ready(u,'snareCD',3)){attachSnare(f,u,t);for(const enemy of f.nearby(u,t,18,1+value(u,'HT3',1,2),t).filter(v=>v!==t)){const chance=BondRules.dodgeChance(enemy.effective,u.effective,u.basicCategory,enemy.level,u.level);if(f.battle.random()>=chance)attachSnare(f,u,enemy,true);}}
 }
 if(c.mods.perfectArrow&&damage&&alive(primary.target))f.proc(u,primary.target,.9*A,'melee','One Perfect Arrow',{guaranteed:true,ignoreRange:false});
 quarry(f,u);
}
function treePulse(f,e){const u=e.master;if(!rank(u,'DG2'))return;const t=f.entities.filter(t=>alive(t)&&t.side===u.side&&t.owner===u.owner&&t.profile!=='heartwood'&&t.hp<t.maxHp&&f.battle.distance(e,t)<=36).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id.localeCompare(b.id))[0];if(t){const amount=Math.min(t.maxHp-t.hp,value(u,'DG2',.005,.01)*u.maxHp);t.hp+=amount;f.battle.emit('repair',u,t,'Nurse Roots',amount,{temporary:true});}}
root.BondClassTalents={start,tick,beforeCast,outgoing,hitBonus,incoming,barrier,beforeHP,stagger,damaged,broken,healed,landed,launch,afterCast,treePulse};
})(globalThis);
