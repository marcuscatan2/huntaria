/* Species innate event handlers. Only natural/primary core events generate resources. */
(function(root){
'use strict';
const alive=u=>root.BondCombatEffects.alive(u),n=u=>u?.kit?.number||0;
const put=(f,u,t,key,kind,value,seconds,extra={})=>f.put(u,t,key,kind,value,seconds,extra);
const stat=f=>u=>f.stats(u);
function start(f,u){
 u.kit.number=u.passive==='innate-'+u.type?u.workbookNumber:0;
 u.kit.targetSince=f.battle.time;u.kit.originalTarget=f.battle.target(u)?.id||null;u.kit.losses=[];
 const {H}=f.stats(u);
 if(n(u)===1)f.shield(u,u,.1*H,75,'Acorn Aegis');
 if(n(u)===12)u.kit.Ribs=3;
 if(n(u)===21)u.kit.Seeds=3;
 if(n(u)===42)u.kit.Puff=2;
 if(n(u)===44)u.kit.Star=1;
 if(n(u)===46)root.BondCombatEntities.spawn(f,u,'soldier-ant');
 if(n(u)===47)u.kit.Clover=1;
 if(n(u)===63)put(f,u,u,'Shroud','shroud',1,2);
}
function tick(f,u){
 const b=f.battle,t=b.target(u),old=b.units.find(v=>v.id===u.kit.originalTarget);
 if(old&&!alive(old)&&t&&!t.temporary){
  u.kit.originalTarget=t.id;u.kit.targetSince=b.time;u.kit.freshUsed=false;
  if(!f.remove(u,'Locked axle'))u.kit.Flywheel=0;
  u.kit.Haunt=0;u.kit.rootStarted=null;delete u.effects['Set Roots'];
  if(n(u)===63&&f.ready(u,'shroudCD',3))put(f,u,u,'Shroud','shroud',1,2);
 }
 if(!u.kit.originalTarget&&t&&!t.temporary){u.kit.originalTarget=t.id;u.kit.targetSince=b.time;}
 if(n(u)===15&&u.kit.rootStarted!=null&&b.time-u.kit.rootStarted>=2&&alive(old))put(f,u,u,'Set Roots','dr',.12,.1);
 if(n(u)===18&&!u.kit.flare&&alive(f.trainer(u))&&t&&!t.temporary&&t.hp/t.maxHp<=.5)flare(f,u);
 for(const [key,resource] of [['Grit duration','Grit'],['Gust duration','Gust'],['Precision','Precision']])if(u.kit[resource]&&u.effects[key]&&!f.has(u,key))u.kit[resource]=0;
}
function flare(f,u){if(u.kit.flare||!alive(u)||!alive(f.trainer(u)))return;u.kit.flare=true;put(f,u,u,'Fed by Embers','physicalPower',.15,3);f.shield(u,u,.06*u.maxHp,3,'Fed by Embers');}
function dreamSipper(f,e){const u=f.battle.units.find(v=>v.id===e.source);if(alive(u)&&n(u)===6&&f.ready(u,'dreamSipperCD',2))f.heal(u,u,.35*f.stats(u).M,'Dream Sipper');}
function beforeCast(f,c){
 const mods={bonus:0,supportBonus:0},u=c.u;
 if(n(u)===3){mods.damageMultiplier=f.has(u,'Wax')?1.15:1;mods.healMultiplier=mods.shieldMultiplier=f.has(u,'Wane')?1.2:1;}
 if(n(u)===27)mods.hit=u.kit.bracedHit||0;
 return mods;
}
function primary(f,c,kind,amount){
 const u=c.u,{A,M}=c,t=c.t;let bonus=0,multiplier=1;
 if(kind==='damage'){
  if(n(u)===3)f.remove(u,'Wax');
  if(n(u)===5)bonus+=.3*A*f.take(u,'Pressure');
  if(n(u)===20&&f.remove(u,'Precision')){bonus+=.6*A;c.mods.precision=true;}
  if(n(u)===23&&f.remove(u,'Gust duration'))bonus+=.6*A*f.take(u,'Gust');
  if(n(u)===43)bonus+=f.take(u,'Slag');
  if(n(u)===44)bonus+=.2*M*f.take(u,'Star');
  if(n(u)===70)bonus+=f.take(u,'Haunt');
  if(n(u)===74)bonus+=.2*A*f.take(u,'Droplet');
  if(n(u)===75)bonus+=.25*M*f.take(u,'Thread');
  if(n(u)===91)bonus+=.2*M*f.take(u,'Crosswind');
  if(n(u)===100&&f.remove(u,'Coil')){bonus+=.35*A;c.mods.coil=true;}
  if(n(u)===27)u.kit.bracedHit=0;
 }else if(kind==='heal'||kind==='shield'){
  if(n(u)===3)f.remove(u,'Wane');
  if(n(u)===10&&f.take(u,'Fleece',1))multiplier*=1.25;
  if(n(u)===13&&kind==='heal')bonus+=.25*M*f.take(u,'Bud');
  if(n(u)===28&&kind==='shield')bonus+=.3*M*f.take(u,'Note');
  if(n(u)===64)multiplier*=1+.15*f.take(u,'Sprout');
  if(n(u)===74&&kind==='heal')bonus+=.3*M*f.take(u,'Droplet');
 }
 if(n(u)===99&&u.casts%3===0&&['damage','heal','shield'].includes(kind))bonus+=.4*M;
 const inscription=f.remove(u,'Inscription');if(inscription)multiplier*=1.12;
 return (amount+bonus)*multiplier;
}
function outgoing(f,u,t,amount,d){
 const {A,M,H}=f.stats(u),id=n(u),trainer=f.trainer(u);let mult=1;
 if(id===2&&alive(trainer)&&trainer.hp/trainer.maxHp<.6&&d.category!=='magic')mult*=1.12;
 if(id===8&&f.has(u,'Tailblanket fury')&&d.category!=='magic')mult*=1.15;
 if(id===17&&f.get(t,'Loyal Bark')?.source===u.id)mult*=1.1;
 if(id===38&&t.id===u.kit.originalTarget&&d.category!=='magic')mult*=1+.04*(u.kit.Flywheel||0);
 if(id===39&&d.category!=='magic')mult*=1+.08*(u.kit.stormThresholds||[]).length;
 if(id===40&&d.category==='magic'&&(t.shield>0||Object.values(t.effects).some(e=>e.until>f.battle.time&&e.value>0&&e.harmful!==true)))mult*=1.12;
 if(id===50&&d.primary&&f.remove(u,'Ambush'))mult*=1.2;
 if(id===56&&d.category!=='magic'&&Object.values(u.effects).some(e=>e.kind==='dot'&&e.until>f.battle.time))mult*=1.1;
 if(id===59&&d.category==='magic'&&t.hp/t.maxHp<.5)mult*=1.15;
 if(id===69&&d.basic)mult*=1.25;
 if(id===95&&d.category!=='magic'&&f.value(t,'hit')<0)mult*=1.12;
 if(id===29&&u.kit.phoenixUsed&&d.category==='magic')mult*=.9;
 if(id===29&&u.shield>0&&f.has(u,'Luminous Seams')&&d.category==='magic')mult*=1.1;
 if(id===11&&d.category!=='magic')d.shieldBonus=Math.max(d.shieldBonus||0,.25);
 let penetration=0;
 if(id===30&&t.hp/t.maxHp>.8)penetration=.08;
 if(id===48&&u.hp/u.maxHp>.6)penetration=.06;
 if(id===7&&f.get(t,'Black Margin')?.source===u.id)penetration=.08;
 if(id===11&&f.remove(u,'Fault opening'))penetration=.08;
 d.penetration=penetration;
 if(d.basic){
  if(id===9&&(u.kit.Heat||0)>0){f.take(u,'Heat',1);amount+=.35*M;f.shield(u,u,.2*M,2,'Banked Heat');}
  if(id===21)amount+=.25*A*f.take(u,'Seeds',1);
  if(id===42)amount+=.3*A*f.take(u,'Puff',1);
  if(id===80){const rib=(u.kit.ribCycle||0)%2===1;mult*=rib?.85:1.15;if(rib)f.shield(u,u,.25*M,2,'Skull and Rib');u.kit.ribCycle=(u.kit.ribCycle||0)+1;}
  for(const key of ['Good as New','Watchful Mask','Grit','Recoil']){
   const e=f.remove(u,key);if(!e)continue;
   amount+=key==='Good as New'?.45*A:key==='Watchful Mask'?.35*A:key==='Grit'?.4*A:.25*A;
  }
  for(const e of Object.values(u.effects).filter(e=>e.kind==='nextBasic'&&e.until>f.battle.time)){amount+=e.value;delete u.effects[e.key];}
  const nectar=f.remove(u,'Nectar');if(nectar)mult*=1.15;
  const wax=f.get(t,'Waxpin');if(wax?.source===u.id){amount+=wax.value;f.remove(t,'Waxpin');}
 }
 if(id===7&&!u.kit.freshUsed&&t.id===u.kit.originalTarget&&!t.temporary){amount+=.5*A;u.kit.freshUsed=true;}
 if(id===34&&u.kit.CutReserve){amount+=u.kit.CutReserve;u.kit.CutReserve=0;d.spentReserve=true;}
 return amount*mult;
}
function hitBonus(f,u,t,d){
 let hit=0;
 const trainer=f.trainer(u);
 if(n(u)===2&&alive(trainer)&&trainer.hp/trainer.maxHp<.6)hit+=15;
 if(n(u)===7&&!u.kit.freshUsed&&t.id===u.kit.originalTarget)hit+=25;
 if(n(u)===17&&trainer?.targetId===u.targetId)hit+=15;
 if(d.basic&&f.has(u,'Grit'))hit+=20;
 if(d.basic&&f.has(u,'Recoil'))hit+=40;
 if(d.basic){for(const e of Object.values(u.effects).filter(e=>e.kind==='nextBasicHit'&&e.until>f.battle.time)){hit+=e.value;delete u.effects[e.key];}}
 const signal=f.get(t,'Signal Seed');if(signal&&f.core(u).some(a=>a.id===signal.source))hit+=20;
 const moth=f.core(u).find(v=>n(v)===51);if(moth){hit+=15;if(u.pools?.some(p=>p.source===moth.id)||f.has(u,'Beacon aim'))hit+=10;}
 return hit;
}
function incoming(f,actor,u,raw,d){
 if(!actor||actor.side===u.side||d.transfer||d.debt)return raw;
 const id=n(u),{A,M,H}=f.stats(u),direct=d.direct!==false&&!d.dot;
 if(d.dot){if(id===56||id===77){const prevented=raw*.25;raw-=prevented;if(id===77)f.shield(u,u,prevented*.5,3,'Charred Leaves',{accumulate:true,cap:.05*H});}return raw;}
 if(!direct)return raw;
 if(id===4&&!u.kit.jaw){u.kit.jaw=true;raw*=.5;put(f,u,u,'Jaw Lock','physicalDR',.15,3);}
 if(id===8&&u.hp/H>.7)raw*=.9;
 if(id===10&&d.basic&&d.category!=='magic'&&!u.kit['fleece:'+actor.id]){u.kit['fleece:'+actor.id]=true;raw*=.6;f.add(u,'Fleece',1,2);}
 if(id===12&&(u.kit.Ribs||0)>0&&f.ready(u,'ribCD',.5)){f.take(u,'Ribs',1);raw*=.8;d.ribCounter=.3*M;}
 if(id===17&&f.trainer(u)?.targetId===u.targetId)raw*=.9;
 if(id===47&&f.take(u,'Clover',1))raw*=.8;
 if(id===66&&d.category!=='magic')raw-=Math.min(.2*raw,(f.has(u,'Locked facets')?.3:.2)*A);
 if(id===72){if(d.category==='magic'){if(!(u.shield>0&&f.has(u,'Close the Hollow')))raw*=1.1;}else raw*=.88;}
 if(id===82&&f.ready(u,'carapaceCD',3)){raw*=.7;u.kit.carapaceAt=f.battle.time;}
 if(id===97&&d.category==='magic')raw*=.85;
 if(id===98&&f.get(u,'Remembered attacker')?.target===actor.id)raw*=.88;
 if(id===100&&d.critical)raw*=.8;
 for(const ally of f.core(u)){
  if(n(ally)===1&&u.slot===0&&ally.shield>0)raw*=.9;
  if(n(ally)===71&&d.secondary&&d.active)raw*=.8;
 }
 if(u.slot===0)raw*=1+Math.min(0,f.value(actor,'trainerDamage'));
 if(u.shield>0&&f.has(actor,'Thread'))raw*=.88;
 return raw;
}
function beforeHP(f,actor,u,raw,d){
 if(!actor||actor.side===u.side||d.transfer||d.debt)return raw;
 const direct=d.direct!==false&&!d.dot,H=u.maxHp;
 if(direct){
  if(n(u)===92&&raw>.08*H&&f.ready(u,'corePreventCD',3))raw-=Math.min(raw-.08*H,.06*H);
  for(const ally of f.core(u))if(n(ally)===65&&!ally.kit['air:'+u.id]&&raw>=.1*H){
   ally.kit['air:'+u.id]=true;const amount=Math.min(raw*.2,.8*f.stats(ally).M),debt={id:++f.sequence,amount,kind:'air',due:f.battle.time+1.5};u.debt.push(debt);raw-=amount;
   f.battle.emit('debt',ally,u,'Air Pocket',amount,{due:debt.due});f.later(actor,u,1.5,()=>{const current=u.debt.find(e=>e.id===debt.id);if(current){u.debt=u.debt.filter(e=>e!==current);f.loss(actor,u,current.amount,'Air Pocket',{debt:true,direct:false});}},{label:'Air Pocket'});break;
  }
 }
 return raw;
}
function finalHP(f,u,raw,d){
 const H=u.maxHp;
 if(n(u)===29&&!u.kit.phoenixUsed&&raw>=u.hp&&!d.transfer&&!d.debt){u.kit.phoenixUsed=true;raw=Math.max(0,u.hp-Math.round(.2*H));f.battle.emit('prevent',u,u,'Cracked, Not Gone');}
 return raw;
}
function emergency(f,actor,u,raw,d){
 if(u.slot!==0||d.direct===false||d.dot||!actor||actor.side===u.side)return;
 for(const ally of f.core(u))if(n(ally)===35&&!ally.kit.keepsake&&u.hp-Math.max(0,raw-u.shield)<.3*u.maxHp){ally.kit.keepsake=true;f.shield(ally,u,.08*ally.maxHp,3,'Held Dear');break;}
}
function guard(f,u,target){return n(u)===85&&u.hp/u.maxHp>.5&&target.slot===0?.15:0;}
function afterDamage(f,actor,u,amount,absorbed,d){
 if(d.transfer||d.debt||!actor||actor.side===u.side)return;
 if(!u.temporary){u.kit.losses=(u.kit.losses||[]).filter(e=>e.time>=f.battle.time-2);if(amount>0)u.kit.losses.push({time:f.battle.time,amount});}
 if(!alive(u)||f.battle.ended)return;
 const id=n(u),{A,M,H}=f.stats(u),direct=d.direct!==false&&!d.dot;
 if(id===8&&u.hp/H<.7&&!u.kit.tailFury){u.kit.tailFury=true;put(f,u,u,'Tailblanket fury','resource',1,3);}
 if(id===16||id===90){const key=id===16?'Fragment':'Seedling',threshold=(id===16?.12:.1)*H;u.kit.lossBank=(u.kit.lossBank||0)+amount;if(u.kit.lossBank>=threshold){u.kit.lossBank-=threshold;f.add(u,key,1,id===16?2:3);}}
 if(id===19)f.add(u,'Water',amount*.2,.1*H);
 if(id===23&&amount>=.06*H&&f.ready(u,'gustCD',3)){u.kit.Gust=1;put(f,u,u,'Gust duration','resource',1,3);}
 if(id===43)f.add(u,'Slag',absorbed*.25,M);
 if(id===39){u.kit.stormThresholds||=[];for(const threshold of [.7,.4])if(u.hp/H<threshold&&!u.kit.stormThresholds.includes(threshold))u.kit.stormThresholds.push(threshold);}
 if(id===93&&!u.kit.bloom&&u.hp/H<.5){u.kit.bloom=true;for(const t of f.others(u))f.heal(u,t,.8*M,'Emergency Bloom');f.heal(u,u,.05*H,'Emergency Bloom');}
 if(!direct)return;
 if(id===27)u.kit.bracedHit=Math.min(30,(u.kit.bracedHit||0)+10);
 if(id===28){u.kit.noteHits=(u.kit.noteHits||0)+1;if(u.kit.noteHits%2===0&&f.ready(u,'noteCD',1))f.add(u,'Note',1,2);}
 if(id===98)put(f,u,u,'Remembered attacker','memory',1,2,{target:actor.id});
 if(id===100&&d.critical&&f.ready(u,'coilCD',2))put(f,u,u,'Coil','resource',1,3);
 if(d.proc)return;
 if(d.ribCounter&&alive(actor))f.proc(u,actor,d.ribCounter,'magic','Rib Reserve');
 if(id===25&&d.basic&&f.ready(u,'thornCD',.75))f.proc(u,actor,Math.min(.65*A,.25*A+.01*H),'melee','Biting Thorns');
 if(id===52&&d.active&&d.shieldBefore>0&&f.ready(u,'mirrorCD',2))f.proc(u,actor,Math.min(.6*A,.2*(amount+absorbed)),'melee','False Torso');
 if(id===54&&d.basic)put(f,u,actor,'Clinging Resin','basicPenalty',.1,2,{harmful:true});
 if(id===97&&d.active&&d.category==='magic'&&!u.kit.lining){u.kit.lining=true;f.shield(u,f.trainer(u),.65*M,3,'Soul Lining');}
}
function broken(f,actor,u,p,d){
 if(d.transfer||d.debt)return;
 if(n(actor)===11&&f.ready(actor,'faultCD',3))put(f,actor,actor,'Fault opening','resource',1,3);
 if(n(u)===83&&p.source===u.id&&f.ready(u,'ringCD',2))put(f,u,u,'Cast-Off Ring','guaranteedCrit',1,3);
 for(const ally of f.core(u))if(n(ally)===75&&f.ready(ally,'threadCD',2))f.add(ally,'Thread',1,2);
}
function healAmount(f,source,target,amount,o){
 if(n(source)===57&&source.hp/source.maxHp>.5)amount*=1.15;
 if(n(target)===57&&target.hp/target.maxHp<=.5)amount*=1.15;
 if(n(target)===86)amount*=1.1;
 if(n(source)===89&&o.primary&&target.hp/target.maxHp<=.4)amount*=1.25;
 return amount;
}
function healed(f,source,target,actual,o){
 if(f.battle.ended||!alive(target))return;
 if(n(target)===22&&actual>0){target.kit.heals=(target.kit.heals||[]).filter(e=>e.at>=f.battle.time-2);target.kit.heals.push({at:f.battle.time,amount:actual});if(target.kit.heals.reduce((a,e)=>a+e.amount,0)>=.03*target.maxHp&&f.ready(target,'repairedCD',3)){put(f,target,target,'Good as New','resource',1,10);target.kit.heals=[];}}
 if(n(target)===86&&o.offered>actual)f.shield(target,target,.5*(o.offered-actual),3,'Old Growth',{cap:.08*target.maxHp});
 for(const enemy of f.battle.team(1-target.side))if(n(enemy)===70&&enemy.targetId===target.id&&actual>0)f.add(enemy,'Haunt',actual*.2,.9*f.stats(enemy).M);
 if(!o.primary)return;
 if(n(source)===14&&actual>0&&f.ready(source,'padding:'+target.id,2))put(f,source,target,'Padding','nextDirectDR',.12,2,{once:true});
 if(n(source)===31&&actual>0)put(f,source,target,'Nectar','nextBasicMultiplier',.15,3);
 if(n(source)===41&&!o.stored)f.add(source,'Water',.5*Math.max(0,o.offered-actual),.9*f.stats(source).M);
}
function cleansed(f,source,target,count){if(n(source)===84&&count&&f.ready(source,'steam:'+target.id,2))f.shield(source,target,.35*f.stats(source).M,3,'Clean Steam');}
function ember(f,u,t){
 const old=f.get(t,'Little Embers'),stacks=Math.min(3,(old?.stacks||0)+1),M=f.stats(u).M;
 f.dot(u,t,'Little Embers',stacks*.1*M*3,3,'magic');if(t.effects['Little Embers'])t.effects['Little Embers'].stacks=stacks;
}
function pollen(f,u,t){
 const old=f.get(t,'Pollen'),stacks=(old?.stacks||0)+1;
 if(stacks>=3){f.remove(t,'Pollen');f.proc(u,t,.6*f.stats(u).M,'magic','Ignition Pollen');put(f,u,t,'Pollen denial','healReceived',-.2,2,{harmful:true});}
 else put(f,u,t,'Pollen','resource',1,5,{stacks});
}
function spore(f,u,t){if(f.ready(u,'spore:'+t.id,2))put(f,u,t,'Pressure Spore','spore',.4*f.stats(u).M,3,{harmful:true});}
function landed(f,u,t,result,d){
 if(d.proc||u.temporary||f.battle.ended)return;
 const id=n(u),{A,M,H}=f.stats(u);
 if(d.basic){
  u.kit.landedBasics=(u.kit.landedBasics||0)+1;
  const count=u.kit.landedBasics;
  if(id===5&&count%2===0)f.add(u,'Pressure',1,2);
  if(id===20&&count%3===0)put(f,u,u,'Precision','resource',1,3);
  if(id===33&&result.critical)f.dot(u,t,'Serrated Bleed',.4*A,2,'melee');
  if(id===34&&!d.spentReserve&&count%3===0)u.kit.CutReserve=Math.max(u.kit.CutReserve||0,.2*A);
  if(id===38&&t.id===u.kit.originalTarget)f.add(u,'Flywheel',1,3);
  if(id===49)ember(f,u,t);
  if(id===58&&count%3===0){f.shield(u,u,.03*H,2,'Marching Beat');f.shield(u,f.trainer(u),.02*H,2,'Marching Beat');}
  if(id===60)f.add(u,'Beat',1,3);
  if(id===62&&!result.critical){const value=Math.min(.12,(f.get(u,'Polished Patience')?.value||0)+.04);put(f,u,u,'Polished Patience','crit',value,75);}
  if(id===64&&count%2===0)f.add(u,'Sprout',1,2);
  if(id===74&&count%2===0)f.add(u,'Droplet',1,2);
 }
 if(id===15&&u.kit.rootStarted==null&&t.id===u.kit.originalTarget)u.kit.rootStarted=f.battle.time;
 if(id===62&&result.critical)f.remove(u,'Polished Patience');
 if(id===73)put(f,u,t,'Grip','trainerDamage',-.12,1.5,{harmful:true});
 if(id===76&&result.critical&&d.category!=='magic')put(f,u,t,'Calcify','flee',-20,3,{harmful:true});
 if(id===34&&!d.spentReserve&&!alive(t)&&!t.temporary)u.kit.CutReserve=Math.max(u.kit.CutReserve||0,Math.min(.7*A,result.overkill||0));
 for(const ally of f.core(u)){
  if(n(ally)===24){const stitch=f.get(t,'Stitch');if(stitch?.source===ally.id&&!stitch.used[u.id]){stitch.used[u.id]=true;stitch.count++;f.proc(ally,t,.2*f.stats(ally).A,'melee','Loose Thread');}}
  if(n(ally)===91&&ally!==u&&d.category!=='magic'&&ally.targetId===t.id&&f.ready(ally,'crosswindCD',1))f.add(ally,'Crosswind',1,2);
 }
 const script=f.get(t,'Saffron Script');if(script&&f.core(u).some(v=>v.id===script.source)){f.remove(t,'Saffron Script');const owner=f.battle.units.find(v=>v.id===script.source);if(alive(owner))f.proc(owner,t,script.value,'magic','Saffron Script');}
 root.BondCombatEntities.primary(f,u,t,d);
 root.BondClassTalents?.landed(f,u,t,result,d);
}
function missed(f,u,t,d){
 if(d.proc||u.temporary)return;
 if(d.basic){u.kit.landedBasics=0;if(n(u)===81){if(f.has(u,'Recoil'))f.remove(u,'Recoil');else put(f,u,u,'Recoil','recoil',1,10);}if(n(t)===47)f.add(t,'Clover',1,2);}
}
function afterCast(f,c){
 const u=c.u,id=n(u),{M}=c,primary=c.primary,landedPrimary=c.results.find(r=>r.primary&&r.hit);
 if(id===3&&primary){if(primary.kind==='damage')put(f,u,u,'Wane','empowerment',1,75);else if(['heal','shield'].includes(primary.kind))put(f,u,u,'Wax','empowerment',1,75);}
 if(id===9&&primary?.kind==='damage')f.add(u,'Heat',1,3);
 if(id===13&&landedPrimary)f.add(u,'Bud',c.mods.buds||1,3);
 if(id===37&&landedPrimary)spore(f,u,landedPrimary.target);
 if(id===42&&primary?.kind==='damage'&&c.s.cd===12)u.kit.Puff=2;
 if(id===45&&primary?.kind==='damage'){const total=c.results.reduce((n,r)=>n+(r.damage||0),0);f.heal(u,f.lowest(u),Math.min(.45*M,.2*total),'Dawn Exchange');}
 if(id===50&&primary?.kind!=='damage')put(f,u,u,'Ambush','ambush',.2,3);
 if(id===53&&landedPrimary&&landedPrimary.category!=='magic'&&f.ready(u,'afterimageCD',1))f.proc(u,landedPrimary.target,.2*c.A,'magic','Spectral Afterimage');
 if(id===55){u.kit.inscriptions||={};u.kit.inscriptions[c.s.id]=true;if(Object.keys(u.kit.inscriptions).length>=3&&f.ready(u,'inscriptionCD',6)){u.kit.inscriptions={};for(const t of f.others(u))put(f,u,t,'Inscription','empowerment',.12,4);}}
 if(id===59&&landedPrimary&&landedPrimary.target.hp/landedPrimary.target.maxHp>=.5)put(f,u,landedPrimary.target,'Scent of Sorrow','healReceived',-.1,2,{harmful:true});
 if(id===61&&landedPrimary)put(f,u,landedPrimary.target,'Thread','thread',.12,3,{harmful:true});
 if(id===67&&primary?.kind==='heal'&&c.receivers.filter(r=>r.kind==='heal').length===1&&c.receivers[0]?.actual>0){const other=f.lowest(u,f.core(u).filter(v=>v!==primary.target));f.shield(u,other,.35*M,2,'Water Finds a Way');}
 if(id===68&&landedPrimary)put(f,u,landedPrimary.target,'Numb','crit',-.1,3,{harmful:true});
 if(id===78){const stack=f.get(u,'Crown Heat');put(f,u,u,'Crown Heat','magicPower',Math.min(.12,(stack?.value||0)+.04),4);}
 if(id===79&&landedPrimary&&!landedPrimary.target.temporary){f.add(u,'Spark',1,3);if(u.kit.Spark>=3)refund(f,u,1);}
 if(id===87&&landedPrimary)pollen(f,u,landedPrimary.target);
 if(id===99&&u.casts%3===0&&primary?.kind==='deployment')f.shield(u,f.trainer(u),.4*M,3,'Three Little Voices');
 for(const ally of f.core(u)){
  if(ally===u)continue;
  if(n(ally)===44&&f.ready(ally,'starCD',1))f.add(ally,'Star',1,3);
  if(n(ally)===94&&u.slot===0&&primary&&['damage','heal','shield'].includes(primary.kind)&&!c.s.id?.startsWith('sig-echochime'))put(f,ally,ally,'Remembered Note','record',1,3,{record:{kind:primary.kind,amount:primary.amount,category:primary.category}});
 }
 const sp=f.remove(u,'Pressure Spore');if(sp){const source=f.battle.units.find(v=>v.id===sp.source);if(alive(source))f.proc(source,u,sp.value,'magic','Pressure Spore');}
 for(const enemy of f.battle.team(1-u.side))if(enemy.targetId===u.id){
  if(n(enemy)===32&&f.ready(enemy,'watchfulCD',2))put(f,enemy,enemy,'Watchful Mask','resource',1,2);
  if(n(enemy)===36&&f.ready(enemy,'gritCD',2))put(f,enemy,enemy,'Grit','resource',1,3);
 }
}
function refund(f,u,seconds){if(!f.ready(u,'sparkCD',3))return;const index=u.skills.findIndex(id=>root.BondContent.SKILLS[id].cd===4);if(index>=0)u.cds[index]=Math.max(0,u.cds[index]-seconds);u.kit.Spark=0;}
function death(f,actor,victim,d){
 if(victim.temporary||f.battle.ended)return;
 const scorch=f.remove(victim,'Scorchline');if(scorch){const owner=f.battle.units.find(u=>u.id===scorch.source),next=alive(owner)&&f.battle.target(owner);if(alive(next)&&!next.temporary&&f.battle.inRange(owner,next))f.proc(owner,next,.5*scorch.value,'magic','Scorchline');}
 for(const u of f.battle.units.filter(alive)){
  if(u.side!==victim.side){if(n(u)===18)flare(f,u);if(n(u)===79)refund(f,u,2);}
  if(n(u)===96&&u.side===victim.side&&u.owner===victim.owner&&victim.slot>0&&!victim.storyMaster&&!u.kit.watching){u.kit.watching=true;f.shield(u,f.trainer(u),.1*u.maxHp,4,'Still Watching');put(f,u,u,'Still Watching','dr',.15,3);}
 }
}
root.BondCombatPassives={dreamSipper,start,tick,beforeCast,primary,outgoing,hitBonus,incoming,beforeHP,finalHP,emergency,guard,afterDamage,broken,healAmount,healed,cleansed,ember,pollen,spore,landed,missed,afterCast,death};
})(globalThis);
