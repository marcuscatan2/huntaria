/* Authored companion talent events. No rule is inferred from player-facing prose. */
(function(root){
'use strict';
const definitions={},prefix=Object.fromEntries(Object.entries(root.BondMonsterProgression.talents).map(([type,nodes])=>[type,nodes[0].id.slice(0,-3)]));
const alive=u=>root.BondCombatEffects.alive(u),has=(u,id)=>u?.talents?.[prefix[u.type]+id]===1;
const allies=(u,v)=>!!v&&u.side===v.side&&u.owner===v.owner&&!v.temporary&&!v.storyMaster;
const pool=(u,source,label)=>u?.pools?.find(p=>p.source===source.id&&p.label===label&&p.amount>0);
const skill=(u,name)=>u.skills.findIndex(id=>root.BondContent.SKILLS[id]?.name===name);
const refund=(u,name,seconds)=>{const i=skill(u,name);if(i>=0)u.cds[i]=Math.max(0,u.cds[i]-seconds);};
const active=(f,u)=>f.battle.monsterRules===1&&alive(u)&&!u.temporary&&Object.keys(u.talents||{}).length>0;
function each(f,event,...args){if(f.battle.monsterRules===1&&event==='landed'&&args[3]?.basic)args[0].kit.talentBasics=(args[0].kit.talentBasics||0)+1;for(const u of f.battle.units)if(active(f,u))definitions[u.type]?.[event]?.(f,u,...args);}
function change(f,event,amount,...args){
 if(event==='outgoing'&&args[2]?.basic){const [actor,target]=args;for(const e of Object.values(actor.effects||{}))if(e.kind==='physicalBasicCharge'&&e.until>f.battle.time){f.remove(actor,e.key);f.after(()=>f.proc(actor,target,e.value,'melee',e.key));}}
 for(const u of f.battle.units)if(active(f,u))amount=definitions[u.type]?.[event]?.(f,u,amount,...args)??amount;return amount;
}
function own(f,event,u,...args){return active(f,u)?definitions[u.type]?.[event]?.(f,u,...args):undefined;}
function ward(f,u,t,amount,duration,label,options={}){return f.shield(u,t,amount,duration,label,{talent:true,...options});}
function heal(f,u,t,amount,label,maximum=Infinity){return f.heal(u,t,amount,label,{talent:true,maximum});}
function buff(f,u,t,label,kind,value,duration,extra={}){return f.put(u,t,label,kind,value,duration,extra);}
function charge(f,u,t,label,amount){return buff(f,u,t,label,t?.basicCategory==='magic'?'physicalBasicCharge':'nextBasic',amount,75);}
function spend(u,key){const value=u.kit[key]||0;u.kit[key]=0;return value;}
function limited(f,u,key,amount,cap,apply){const ledger=(u.kit[key]||[]).filter(e=>e.at>f.battle.time-1+1e-8),allowed=Math.max(0,Math.min(amount,cap-ledger.reduce((n,e)=>n+e.amount,0))),actual=allowed>0?apply(allowed):0;ledger.push({at:f.battle.time,amount:actual||0});u.kit[key]=ledger;return actual;}
function register(type,rules){if(definitions[type])throw Error('Duplicate companion talents: '+type);definitions[type]=rules;}

const aegis=u=>u.shield>0||has(u,'B08')&&(u.kit.shellAmmo||0)>0;
function splinters(f,u,amount){u.kit.splinters=Math.min(.7*f.stats(u).A,(u.kit.splinters||0)+amount*.3);}
register('acornboar',{
 prepare(f,u){u.kit.autumnAt=f.battle.time+4;},
 tick(f,u){
  if(has(u,'A07')&&f.battle.time+1e-8>=u.kit.autumnAt){u.kit.autumnAt+=4;if(aegis(u))ward(f,u,f.lowest(u),.02*u.maxHp,4,'Banked Autumn');}
  const tr=f.trainer(u);
  if(has(u,'C03')&&alive(tr)&&tr.hp<tr.maxHp*.5&&!u.kit.patientEmber){u.kit.patientEmber=true;refund(u,'Cup the Flame',3);if(has(u,'C05'))ward(f,u,tr,.03*u.maxHp,3,'Patient Ember');}
 },
 beforeHP(f,u,raw,actor,t,d){if(has(u,'A01')&&t===f.trainer(u)&&actor?.side!==u.side&&raw>0&&d.direct!==false&&!d.dot&&aegis(u)&&f.ready(u,'livingCup',4))return raw*.85;return raw;},
 incoming(f,u,raw,actor,t,d){
  if(actor?.side===u.side||d.direct===false||d.dot)return raw;
  if(has(u,'A05')&&t===u&&d.basic&&pool(u,u,'Acorn Bunker'))raw*=.88;
  if(has(u,'A08')&&allies(u,t)&&t!==u&&t.slot!==0&&aegis(u))raw*=.9;
  if(has(u,'B08')&&t===f.trainer(u)&&u.shield<=0&&aegis(u))raw*=.9;
  return raw;
 },
 shield(f,u,g){
  if(g.source!==u||g.options.talent)return;
  if(g.label==='Cup the Flame'&&has(u,'C08')){g.amount*=.5;g.duration=4;}
  if(g.target===u&&g.options.skill){
   if(has(u,'A08')){g.duration=1e6;if(g.label==='Acorn Bunker'&&has(u,'A03'))g.amount*=1.25;}
   if(has(u,'B08')){const gain=Math.max(0,Math.min(.2*u.maxHp-(u.kit.shellAmmo||0),g.amount));u.kit.shellAmmo=(u.kit.shellAmmo||0)+gain;splinters(f,u,gain);g.amount=0;}
  }
 },
 shielded(f,u,source,t,amount,label,p,o){
  if(source!==u||o.talent)return;
  if(label==='Cup the Flame'){
   if(has(u,'A02')&&amount>0)for(const other of f.others(u).filter(v=>v!==t))ward(f,u,other,amount*.5,p.until-f.battle.time,label);
   if(has(u,'C04'))p.courage=true;
  }
 },
 expired(f,u,t,p){if(p.source===u.id&&p.label==='Acorn Bunker'&&t===u&&has(u,'A03')&&!has(u,'A08'))ward(f,u,u,p.amount*.25,1e6,'Layered Husk');},
 absorbed(f,u,actor,t,p,amount,d){
  if(actor?.side===u.side||p.source!==u.id||d.transfer||d.debt)return;
  if(t===u&&has(u,'B01'))splinters(f,u,amount);
  if(has(u,'A04')&&p.label==='Cup the Flame'&&p.absorbed>=.03*u.maxHp&&!p.reserve){p.reserve=true;if(alive(t))heal(f,u,t,.02*u.maxHp,'Lantern Reserve');}
 },
 broken(f,u,actor,t,p,d){
  if(p.source!==u.id||actor?.side===u.side||d.transfer||d.debt)return;
  if(t===u&&p.label==='Acorn Bunker'&&has(u,'A05'))u.kit.defiance=.35*f.stats(u).A;
  if(t!==u&&p.label==='Cup the Flame'&&has(u,'C07')&&!p.relay&&alive(t)){p.relay=true;f.syncShield(u);let transfer=ward(f,u,t,Math.min(.04*u.maxHp,u.shield*.25),3,'Aegis Relay');for(const own of u.pools){const n=Math.min(transfer,own.amount);own.amount-=n;transfer-=n;}f.syncShield(u);}
 },
 hitBonus(f,u,bonus,actor,target){if(has(u,'C02')&&allies(u,actor)&&pool(actor,u,'Cup the Flame')&&target===f.battle.target(u))return bonus+20;return bonus;},
 outgoing(f,u,amount,actor,t,d){
  const {A}=f.stats(u);
  if(actor===u){
   if(has(u,'A08'))amount*=.75;
   if(d.active&&f.currentCompanionCast?.u===u&&f.currentCompanionCast.s.name==='Tusk Tuck'&&u.kit.spentSplinters&&has(u,'B02'))d.penetration=Math.max(d.penetration||0,.08);
   if(d.basic&&has(u,'B05')&&pool(f.trainer(u),u,'Cup the Flame')&&f.ready(u,'burningEscort',2))amount+=.2*A;
  }
  if(d.active&&d.primary&&actor===f.trainer(u)&&has(u,'C04')){const p=pool(actor,u,'Cup the Flame');if(p?.courage){p.courage=false;amount+=.3*A;}}
  return amount;
 },
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Tusk Tuck')u.kit.spentSplinters=0;},
 primary(f,u,amount,c,kind){
  if(c.u!==u||c.s.name!=='Tusk Tuck'||kind!=='damage')return amount;
  if(has(u,'B01')){u.kit.spentSplinters=spend(u,'splinters');amount+=u.kit.spentSplinters;}
  amount+=spend(u,'defiance')+spend(u,'bunkerBurst');
  if(has(u,'B08')){const ammo=Math.min(u.kit.shellAmmo||0,1.5*c.A);u.kit.shellAmmo-=ammo;amount+=ammo;}
  return amount;
 },
 cast(f,u,c){
  if(c.s.name==='Acorn Bunker'&&has(u,'C06')){c.selfward(.16*c.H,4);for(const t of c.other)c.shield(t,.04*c.H,3);return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;
  if(c.s.name==='Tusk Tuck'){
   if(has(u,'A06')&&!c.startShield)ward(f,u,c.tr,.03*c.H,3,'Acorn Cradle');
   if(c.results.some(r=>r.primary&&r.hit)){
    const i=skill(u,'Cup the Flame');if(has(u,'C01')&&(i<0||u.cds[i]>0))ward(f,u,c.tr,.02*c.H,3,'Second Wick');
    if(u.kit.spentSplinters){if(has(u,'B04'))buff(f,u,c.t,'Cracked Foundation','physicalExposure',.06,3,{harmful:true});if(has(u,'B07'))heal(f,u,u,Math.min(.04*c.H,.15*(c.results.find(r=>r.primary)?.damage||0)),'Reclaimed Splinters');}
   }
  }
  if(c.s.name==='Acorn Bunker'&&has(u,'B06'))u.kit.bunkerBurst=.6*c.A;
  if(c.s.name==='Cup the Flame'){
   if(has(u,'B03'))charge(f,u,u,'Furnace Cup',.3*c.A);
   if(has(u,'C08')){heal(f,u,c.tr,.02*c.H,'Carry the Lantern');for(let i=1;i<=3;i++)f.later(u,c.tr,i,()=>heal(f,u,c.tr,.02*c.H,'Carry the Lantern'),{ownerRequired:true});}
  }
 }
});
function blackLantern(f,u,t){buff(f,u,t,'Blackened Lantern','healReceived',-.25,4,{harmful:true});if(has(u,'C05'))buff(f,u,t,'Doused Fuse','shieldOutput',-.2,4,{harmful:true});}
function soot(f,u,t){buff(f,u,t,'Soot Script','talentWeakness',.12,3,{harmful:true});}
function waxConsume(f,u,actor,t,d){
 const e=f.get(t,'Waxpin');if(!e||e.source!==u.id||!d.basic||actor!==u&&!(actor===f.trainer(u)&&has(u,'C04')))return 0;
 const {A}=f.stats(u),endless=has(u,'A08');let amount=actor===u&&endless?.35*A:0;
 if((e.bank||[]).length){amount+=e.bank.shift();e.consumed=(e.consumed||0)+1;
  if(has(u,'A04')&&e.consumed===2)buff(f,u,t,'Pierced Seal','physicalExposure',.06,3,{harmful:true});
  if(has(u,'B02')&&!e.cradle){e.cradle=true;const granted=ward(f,u,f.trainer(u),.25*A,3,'Wax Cradle');if(has(u,'B04'))ward(f,u,u,granted,3,'Two Safe Hands');}
  if(has(u,'C02'))buff(f,u,t,'Blinding Wax','hit',-18,2,{harmful:true});
 }
 if(!endless&&!e.bank?.length)f.remove(t,'Waxpin');
 return amount;
}
register('ashporcupine',{
 wax(){return true;},
 support(f,u,s){if(s.name==='Last Light Volley'&&has(u,'B08'))return true;},
 gate(f,u,c){if(c.s.name==='Last Light Volley'&&has(u,'B08'))return alive(c.tr);},
 tick(f,u){const tr=f.trainer(u);if(has(u,'B05')&&alive(tr)&&tr.hp/tr.maxHp<.6&&!u.kit.emergencyCandle){u.kit.emergencyCandle=true;u.kit.emberPrimer=true;}if(has(u,'A06')&&pool(tr,u,'Cupped Ember'))buff(f,u,u,'Cupped Aim','basicTempo',.15,.1);},
 effect(f,u,g){if(g.source===u&&g.key==='Waxpin'){if(has(u,'A08'))g.duration=1e6;else if(u.kit.longCandle)g.duration+=2;}},
 effected(f,u,source,t,e,old){
  if(source!==u||e.key!=='Waxpin')return;
  const {A}=f.stats(u),count=has(u,'A01')?2:1,extra=has(u,'A08')&&u.kit.longCandle?.1*A:0;
  e.bank=[...(has(u,'A08')?old?.bank||[]:[]),...Array(count).fill(.4*A+extra)];e.consumed=0;e.cradle=false;u.kit.longCandle=false;
  if(has(u,'C01'))soot(f,u,t);
 },
 hitBonus(f,u,bonus,actor,t,d){const e=f.get(t,'Waxpin');return has(u,'A02')&&actor===u&&d.basic&&e?.source===u.id&&e.bank?.length?bonus+25:bonus;},
 outgoing(f,u,amount,actor,t,d){
  amount+=waxConsume(f,u,actor,t,d);
  if(d.active&&d.primary){const e=f.get(actor,'Soot Script');if(e?.source===u.id){f.remove(actor,e.key);amount*=1-e.value;if(has(u,'C07'))u.kit.watchFlame=true;}}
  return amount;
 },
 incoming(f,u,raw,actor,t,d){return has(u,'B03')&&t===u&&d.direct!==false&&!d.dot&&f.trainer(u)?.hp<f.trainer(u)?.maxHp*.6?raw*.85:raw;},
 shield(f,u,g){if(g.source===u&&g.label==='Cupped Ember'&&u.kit.emberPrimer){g.amount*=1.4;u.kit.emberPrimer=false;}},
 shielded(f,u,source,t,amount,label){if(has(u,'B07')&&source===u&&t===f.trainer(u)&&amount>0&&t.hp<t.maxHp*.6&&f.ready(u,'borrowedWick',3))heal(f,u,u,.25*f.stats(u).A,'Borrowed Wick');},
 cast(f,u,c){
  if(c.s.name==='Waxpin'&&has(u,'A08')){c.primary={kind:'utility',amount:0,target:c.t};if(c.markHit())c.buff(c.t,'Waxpin','mark',.4*c.A,1e6,{harmful:true});return true;}
  if(c.s.name!=='Last Light Volley')return;
  const darts=has(u,'A03')?5:4;
  if(has(u,'B08')){c.heal(c.tr,(1.6+(darts===5?.45:0))*c.A);c.shield(c.tr,(.8+(has(u,'B06')?.18*darts:0))*c.A);return true;}
  const targets=has(u,'C08')?f.enemies(u).filter(t=>f.battle.inRange(u,t)).sort((a,b)=>(a===c.t?-1:b===c.t?1:0)||a.id.localeCompare(b.id)).slice(0,4):[c.t];
  let landed=0;const touched=new Set();
  for(let i=0;i<targets.length;i++){
   const target=targets[i];if(!alive(target))continue;
   const assigned=Array.from({length:darts},(_,j)=>j).filter(j=>j%targets.length===i),coefficient=assigned.reduce((sum,j)=>sum+(j===4?.45:c.hp(c.tr)<.6?.9:.75),0);
   const result=c.hit(coefficient*c.A*(has(u,'B06')?.75:1)*(has(u,'C08')?.5:1),{target,secondary:i>0,primary:i===0});
   if(result.hit){landed+=assigned.length;touched.add(target);}
  }
  if(has(u,'B06'))c.shield(c.tr,.18*c.A*landed);
  if(has(u,'C08'))for(const t of touched){soot(f,u,t);blackLantern(f,u,t);}
  else if(has(u,'C03')&&touched.has(c.t))blackLantern(f,u,c.t);
  if(has(u,'A05')&&alive(c.t)){u.kit.longCandle=true;refund(u,'Waxpin',1e6);}
  return true;
 },
 afterCast(f,u,c){
  if(c.u!==u)return;
  if(c.s.name==='Cupped Ember'){
   if(has(u,'B01'))heal(f,u,c.tr,.25*c.A,'Warm Vigil');
   if(has(u,'C06'))buff(f,u,c.tr,'Covering Smoke','flee',20,3);
   if(has(u,'B08'))refund(u,c.s.name,2);
  }
  if(c.s.name==='Waxpin'&&u.kit.watchFlame){u.kit.watchFlame=false;ward(f,u,f.lowest(u),.4*c.A,3,'Watch the Flame');}
 },
 death(f,u,actor,victim){
  if(!has(u,'A07'))return;const e=victim.effects?.Waxpin;if(e?.source!==u.id||!e.bank?.length)return;
  const next=f.battle.target(u);if(!alive(next)||next===victim)return;
  const moved=buff(f,u,next,'Waxpin','mark',e.value,3,{harmful:true});if(moved){moved.until=f.battle.time+3;moved.bank=[...e.bank];moved.consumed=e.consumed;moved.cradle=e.cradle;moved.transferred=true;}
 }
});
const moonCurse=(u,t)=>t?.effects?.['Black Thread:'+u.id];
function blackThread(f,u,t,c=null){
 if(!alive(t)||!has(u,'B01'))return;
 const key='Black Thread:'+u.id,existing=f.get(t,key),M=f.stats(u).M,tick=(has(u,'B08')?.3:.15)*M,duration=has(u,'B08')?1e6:3;
 const leech=result=>{if(has(u,'B04')&&alive(u)&&result?.damage)limited(f,u,'nightLeech',.2*result.damage,.2*M,n=>heal(f,u,u,n,'Night Leech',n));};
 if(existing&&has(u,'B07')&&c&&!c.closingNight){c.closingNight=true;leech(f.battle.damage(u,t,tick,'Closing Night',false,{category:'magic',dot:true,direct:false,proc:true}));}
 f.dot(u,t,key,tick*duration,duration,'magic',{ownerRequired:true,label:'Black Thread',afterTick:leech});
}
register('astralfox',{
 waxWane(){return true;},
 support(f,u,s){if(s.name==='Eclipse Ribbon'&&has(u,'C08'))return true;},
 beforeCast(f,u,c){
  if(c.u!==u)return;
  const wax=has(u,'A08')?(u.kit.waxCharges||0):f.has(u,'Wax')?1:0,wane=has(u,'A08')?(u.kit.waneCharges||0):f.has(u,'Wane')?1:0;
  c.moonKind=c.s.name==='Moon Hem'||c.s.name==='Eclipse Ribbon'&&(has(u,'C08')||has(u,'A06')&&!wax)?'support':'damage';
  c.moonWax=wax;c.moonWane=wane;c.moonSpent=c.moonKind==='damage'?wax>0:wane>0;
  c.mods.damageMultiplier=c.moonKind==='damage'&&wax?1.15:1;c.mods.healMultiplier=c.mods.shieldMultiplier=c.moonKind==='support'&&wane?1.2:1;
  c.lateMoon=u.kit.lateMoon;
 },
 primary(f,u,amount,c,kind){
  if(c.u!==u)return amount;
  if(!c.moonConsumed){c.moonConsumed=true;const key=c.moonKind==='damage'?'waxCharges':'waneCharges',opposite=key==='waxCharges'?'waneCharges':'waxCharges';
   if(has(u,'A08')&&c.moonSpent){u.kit[key]=Math.max(0,(u.kit[key]||0)-1);if(!u.kit[key])u.kit[opposite]=Math.min(2,(u.kit[opposite]||0)+1);}
   else f.remove(u,c.moonKind==='damage'?'Wax':'Wane');
  }
  if(kind==='damage'){
   if(c.s.name==='Crescent Cut'&&has(u,'A01')&&c.moonSpent)amount+=.25*c.M;
   if(c.s.name==='Crescent Cut'&&has(u,'C01'))amount*=.75;
   if(c.s.name==='Eclipse Ribbon'&&has(u,'B03')&&moonCurse(u,c.t))amount+=.5*c.M;
  }
  return amount;
 },
 effect(f,u,g){if(g.source===u&&g.key==='Crescent Cut'&&has(u,'B02')&&has(u,'B01'))g.duration=has(u,'B08')?1e6:3;},
 shield(f,u,g){
  if(g.source!==u||g.options.talent)return;const c=f.currentCompanionCast;
  if(g.label==='Moon Hem'){
   if(has(u,'B06')){g.amount=0;return;}
   if(has(u,'C02')&&c?.u===u)g.amount+=Math.min(.5*c.M,.35*(c.moonOverheal||0));
  }
  if(g.label==='Eclipse Ribbon'&&has(u,'C03')&&g.target.hp<g.target.maxHp*.5)g.amount+=.4*f.stats(u).M;
 },
 healed(f,u,source,t,actual,label,o){
  if(source!==u||o.talent||!o.primary)return;const c=f.currentCompanionCast;if(c?.u!==u)return;
  if(label==='Moon Hem'){
   c.moonOverheal=Math.max(0,o.offered-actual);
   if(actual>0&&has(u,'C04'))buff(f,u,t,'Hemmed Courage','basicTempo',.12,2);
  }
  if(has(u,'C06')&&t!==u&&actual>0){const amount=Math.min(.2*actual,.4*c.M-(c.sharedBlanket||0));c.sharedBlanket=(c.sharedBlanket||0)+amount;ward(f,u,u,amount,3,'Shared Blanket',{accumulate:true});}
 },
 broken(f,u,actor,t,p){if(has(u,'C05')&&p.source===u.id&&p.label==='Eclipse Ribbon'&&!p.moonHealed&&alive(t)){p.moonHealed=true;heal(f,u,t,.45*f.stats(u).M,'Veiled Recovery');}},
 damaged(f,u,actor,t,amount){if(has(u,'C07')&&amount>0&&allies(u,t)&&t!==u&&alive(t)&&t.hp<t.maxHp*.4&&!u.kit.lateMoonUsed){u.kit.lateMoonUsed=true;u.kit.lateMoon=t.id;}},
 cast(f,u,c){
  if(c.s.name==='Crescent Cut'&&has(u,'B08')){c.primary={kind:'damage',amount:0,target:c.t,category:'magic'};root.BondCompanionTalents.change(f,'primary',0,c,'damage');blackThread(f,u,c.t,c);c.buff(c.t,'Crescent Cut','damage',-.08,1e6,{harmful:true});return true;}
  if(c.s.name==='Eclipse Ribbon'&&has(u,'C08')){c.heal(c.low,1.2*c.M);const amount=c.shield(c.low,.8*c.M);for(const t of c.all.filter(t=>t!==c.low))ward(f,u,t,.5*amount,3,'Eclipse Ribbon');return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const landed=c.results.find(r=>r.primary&&r.hit);
  if(c.s.name==='Crescent Cut'&&landed){blackThread(f,u,c.t,c);if(has(u,'C01'))heal(f,u,f.lowest(u),.45*c.M,'Gentle Crescent');}
  if(c.s.name==='Moon Hem'){
   if(has(u,'B06')&&alive(c.t)&&c.b.inRange(u,c.t))blackThread(f,u,c.t,c);
   if(has(u,'A02')&&c.moonSpent){const first=c.receivers.find(r=>r.kind==='heal'),other=f.lowest(u,c.all.filter(t=>t!==first?.target&&t.hp<t.maxHp));if(first&&other){heal(f,u,other,.4*first.actual,'Supportive Seam');if(has(u,'A04'))ward(f,u,other,.4*(c.receivers.find(r=>r.kind==='shield')?.actual||0),3,'Shared Moonrise');}}
  }
  if(c.s.name==='Eclipse Ribbon'&&landed&&has(u,'B05')&&moonCurse(u,c.t))for(const t of f.nearby(u,c.t,18,3,c.t).filter(t=>t!==c.t))blackThread(f,u,t,c);
  if(has(u,'A03')&&c.moonKind==='damage'&&c.moonWane)ward(f,u,u,.25*c.M,3,'Evening Return');
  if(has(u,'A05')&&c.moonSpent&&f.ready(u,'nightArithmetic',2))for(const id of u.skills){const name=root.BondContent.SKILLS[id].name,kind=name==='Moon Hem'?'support':'damage';if(id!==c.s.id&&id.startsWith('sig-')&&kind!==c.moonKind)refund(u,name,.5);}
  if(has(u,'A07')){const sequence=u.kit.orbit||[];if(sequence[sequence.length-1]===c.moonKind)sequence.length=0;sequence.push(c.moonKind);if(sequence.join(',')==='damage,support,damage'){heal(f,u,u,.6*c.M,'Unbroken Orbit');sequence.length=0;}else if(sequence.length>=3)sequence.shift();u.kit.orbit=sequence;}
  if(c.lateMoon){const t=c.all.find(t=>t.id===c.lateMoon);if(alive(t))ward(f,u,t,.7*c.M,3,'Late Moonrise');u.kit.lateMoon=null;}
  const key=c.moonKind==='damage'?'waneCharges':'waxCharges';if(has(u,'A08'))u.kit[key]=Math.min(2,(u.kit[key]||0)+1);else buff(f,u,u,c.moonKind==='damage'?'Wane':'Wax','empowerment',1,75);
 }
});
function consumeMaw(f,u,t){
 const e=f.get(t,'Weakened active');if(e?.source!==u.id)return null;f.remove(t,e.key);f.remove(t,'Silenced Appetite');const {A,H}=f.stats(u);
 if(has(u,'A03'))f.after(()=>ward(f,u,u,.03*H,3,'Close the Gate'));
 if(has(u,'A05'))buff(f,u,f.trainer(u),'Turned Aside','dr',.12,2);
 if(has(u,'C03'))f.after(()=>ward(f,u,f.lowest(u),.4*A,3,'Stone Witness'));
 if(has(u,'C05'))charge(f,u,u,'Measured Rebuke',.3*A);
 if(has(u,'C08'))f.after(()=>ward(f,u,f.trainer(u),.8*A,3,'Devour the Spell'));
 return e;
}
register('coalbadger',{
 prepare(f,u){if(has(u,'B08'))u.kit.jaw=true;},
 incoming(f,u,raw,actor,t,d){
  if(d.direct===false||d.dot||actor?.side===u.side)return raw;
  const p=pool(t,u,'Pillar Brace'),lining=p?.shared||p;if(lining&&d.active&&has(u,'A02')&&!lining.stoneLining){lining.stoneLining=true;raw*=.8;}
  if(t!==u)return raw;
  if(u.kit.secondHinge){u.kit.secondHinge=false;d.jawPrevented=(d.jawPrevented||0)+raw*.25;raw*=.75;}
  return raw;
 },
 damaged(f,u,actor,t,amount,absorbed,d){
  if(t===u&&alive(u)){
   if(has(u,'A01')&&d.jawPrevented)heal(f,u,u,Math.min(.06*u.maxHp,d.jawPrevented*.3),'Hinged Recovery');
   if(has(u,'A07')&&!u.kit.hingeRestored&&u.hp<u.maxHp*.4){u.kit.hingeRestored=true;u.kit.secondHinge=true;}
  }
  if(d.fractureOwner===u.id&&has(u,'B05')&&amount>0)heal(f,u,u,Math.min(.03*u.maxHp,.15*amount),'Widening Crack');
 },
 effect(f,u,g){
  if(g.source!==u)return;
  if(g.key==='Armor exposure'){
   if(has(u,'B01')){g.value=.09;g.duration=2;}
   if(has(u,'B08')&&u.kit.quarryTarget===g.target.id)g.duration=1e6;
  }
  if(g.key==='Intercept'&&has(u,'A04'))g.duration+=1;
  if(g.key==='Weakened active'&&has(u,'C08')){g.value=.35;g.duration=5;}
 },
 effected(f,u,source,t,e){
  if(source!==u)return;
  if(e.key==='Armor exposure')e.brittleJoint=false;
  if(e.key==='Weakened active'){
   if(has(u,'B03'))buff(f,u,t,'Stress Fracture','fracture',.06,e.until-f.battle.time,{harmful:true});
   if(has(u,'C07'))buff(f,u,t,'Silenced Appetite','healReceived',-.25,e.until-f.battle.time,{harmful:true});
  }
 },
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Basalt Bite'&&has(u,'B08')&&!u.kit.quarryTarget){u.kit.quarryTarget=c.t?.id;c.openQuarry=true;}},
 primary(f,u,amount,c,kind){
  if(c.u===u&&c.s.name==='Basalt Bite'&&kind==='damage')amount+=spend(u,'braceBreak');
  if(c.u.side!==u.side&&['heal','shield'].includes(kind)&&(has(u,'C01')||has(u,'C08'))){const e=consumeMaw(f,u,c.u);if(e)amount*=1-e.value;}
  return amount;
 },
 outgoing(f,u,amount,actor,t,d){
  if(d.primary&&d.active&&actor.side!==u.side){const e=consumeMaw(f,u,actor);if(e)amount*=1-e.value;}
  if(d.primary&&d.category!=='magic'){
   const fracture=f.get(t,'Stress Fracture');if(fracture?.source===u.id){f.remove(t,fracture.key);d.penetration=(d.penetration||0)+.06;d.fractureOwner=u.id;}
  }
  if(actor!==u)return amount;
  if(d.active&&d.primary&&f.currentCompanionCast?.u===u&&f.currentCompanionCast.openQuarry){d.penetration=1;d.ignorePhysicalDefense=true;}
  const bite=f.get(t,'Armor exposure');
  if(d.basic&&has(u,'B02')&&bite?.source===u.id&&!bite.brittleJoint){bite.brittleJoint=true;amount+=.35*f.stats(u).A;if(has(u,'B04')){const other=f.nearby(u,t,18,2,t).find(v=>v!==t);if(other)f.after(()=>f.proc(u,other,.175*f.stats(u).A,'melee','Rubble Spray'));}}
  return amount;
 },
 hitBonus(f,u,bonus,actor,t){return has(u,'C06')&&actor!==u&&allies(u,actor)&&f.has(actor,'Pillar Council')&&f.get(t,'Armor exposure')?.source===u.id?bonus+20:bonus;},
 landed(f,u,actor,t,result,d){if(actor===u&&d.basic&&has(u,'B07')){u.kit.grindCount=u.kit.grindTarget===t.id?(u.kit.grindCount||0)+1:1;u.kit.grindTarget=t.id;if(u.kit.grindCount>=3){u.kit.grindCount=0;const e=f.get(t,'Armor exposure');if(e?.source===u.id)e.until=Math.max(e.until,f.battle.time+2);}}},
 cast(f,u,c){
  if(c.s.name==='Clamped Maw'&&has(u,'C08')){c.primary={kind:'utility',amount:0,target:c.t};if(c.markHit())c.buff(c.t,'Weakened active','activeWeakness',.35,5,{harmful:true});return true;}
  if(c.s.name==='Pillar Brace'&&has(u,'A08')){
   c.sharedShield([u,c.tr].filter(alive),.21*c.H,4);
   return true;
  }
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Basalt Bite'&&hit){
   if(has(u,'A06')&&u.shield>0)heal(f,u,u,.02*c.H,'Basalt Stitch');
   if(has(u,'C02')){buff(f,u,c.t,'Heavy Words','nextBasicDelay',.2,75,{harmful:true});if(has(u,'C04')){const t=f.nearby(u,c.t,18,2,c.t).find(t=>t!==c.t);if(t)buff(f,u,t,'Echoing Weight','nextBasicDelay',.1,75,{harmful:true});}}
  }
  if(c.s.name==='Pillar Brace'){
   if(has(u,'B06'))u.kit.braceBreak=Math.min(.04*c.H,.8*c.A);
   if(has(u,'C06'))for(const t of c.other)buff(f,u,t,'Pillar Council','conditionalHit',20,4);
  }
 }
});
register('copperhog',{
 capacity(f,u,max,owner,key){return owner===u&&key==='Pressure'&&has(u,'A01')?3:max;},
 pressureBasics(f,u){return has(u,'A08');},
 support(f,u,s){if(s.name==='Boiler Bellow'&&has(u,'C08'))return true;},
 gate(f,u,c){if(c.s.name==='Deep Intake')return c.r('Pressure')<(has(u,'A01')?3:2)&&(c.threat()||!u.skills.some((id,i)=>u.cds[i]<=0&&root.BondCombatKits.definitions.get(id)?.kind==='hit'));},
 beforeCast(f,u,c){if(c.u===u){c.pressure=c.resources.Pressure||0;c.pressureSpent=false;}},
 primary(f,u,amount,c,kind){
  if(c.u!==u||kind!=='damage')return amount;c.pressureSpent=true;
  if(has(u,'A08'))amount-=.1*c.A*c.pressure;
  if(has(u,'B08'))amount-=(has(u,'A08')?.2:.3)*c.A*c.pressure;
  if(has(u,'A03'))amount+=spend(u,'hotChamber');
  if(c.s.name==='Boiler Bellow'&&has(u,'A06')&&!has(u,'B08'))amount+=.25*c.A*c.pressure;
  return amount;
 },
 shield(f,u,g){if(g.source===u&&g.label==='Deep Intake'&&!g.options.talent&&has(u,'B03'))g.amount+=.04*u.maxHp;},
 cast(f,u,c){
  if(c.s.name!=='Boiler Bellow')return;
  if(has(u,'C08')){c.pressure=f.take(u,'Pressure');c.pressureSpent=true;for(const t of c.all){c.heal(t,.01*c.H*c.pressure);c.shield(t,.15*c.A*c.pressure);c.buff(t,'Breath for the Band','basicTempo',.15,3);}return true;}
  c.hit(2.5*c.A);if(!has(u,'A06'))c.control(.4);
  if(has(u,'C06')){const extra=f.nearby(u,c.t,18,3,c.t).filter(t=>t!==c.t);for(const t of extra)c.hit(.5*(c.primary.offered||0)/extra.length,{target:t,secondary:true,primary:false,area:true,ignoreRange:true});}
  return true;
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const spent=c.pressureSpent?c.pressure:0;
  if(spent){
   if(has(u,'B01'))ward(f,u,u,.02*c.H*spent,c.s.name==='Boiler Bellow'&&has(u,'B06')?5:3,'Sealed Chest');
   if(has(u,'B08')){ward(f,u,u,.02*c.H*spent,c.s.name==='Boiler Bellow'&&has(u,'B06')?5:3,'No-Spark Boiler');heal(f,u,u,.01*c.H*spent,'No-Spark Boiler');}
   if(has(u,'C01'))buff(f,u,c.tr,'Command Pressure','command',spent,75);
   if(has(u,'A07')&&c.primary?.kind==='damage'){u.kit.pressureFeed=spent>=2?(u.kit.pressureFeed||0)+1:0;if(u.kit.pressureFeed>=2){u.kit.pressureFeed=0;f.add(u,'Pressure',2,has(u,'A01')?3:2);}}
  }else if(c.primary?.kind==='damage')u.kit.pressureFeed=0;
  if(c.s.name==='Snout Piston'){
   if(has(u,'A02')&&spent>=2)f.add(u,'Pressure',1,2);
   if(has(u,'A04')&&spent===3)u.kit.hammerRhythm=true;
   if(has(u,'B02')&&spent){heal(f,u,u,.02*c.H,'Piston Packing');if(has(u,'B04'))buff(f,u,u,'Low-Pressure Valve','basicDR',.15,2,{once:true});}
   if(has(u,'C02')&&c.results.some(r=>r.primary&&r.hit))buff(f,u,c.t,'Piston Signal','signal',20,3,{harmful:true,extended:false});
  }
  if(c.s.name==='Deep Intake'){
   if(has(u,'A03'))u.kit.hotChamber=.4*c.A;
   if(has(u,'A05'))f.add(u,'Pressure',3,has(u,'A01')?3:2);
   if(has(u,'B03')){const i=skill(u,c.s.name);if(i>=0)u.cds[i]+=2;}
   if(has(u,'C03')){const t=f.lowest(u,c.other),amount=.5*(c.receivers.find(r=>r.kind==='shield'&&r.target===u)?.actual||0);ward(f,u,t,amount,3,'Shared Intake');}
  }
 },
 basicInterval(f,u,base,actor){if(actor===u&&u.kit.hammerRhythm){u.kit.hammerRhythm=false;return base*.6;}return base;},
 hitBonus(f,u,bonus,actor,t){return has(u,'C02')&&allies(u,actor)&&f.get(t,'Piston Signal')?.source===u.id?bonus+20:bonus;},
 outgoing(f,u,amount,actor,t,d){
  if(actor===f.trainer(u)&&d.basic&&has(u,'C01')){const e=f.get(actor,'Command Pressure');if(e?.source===u.id){f.remove(actor,e.key);amount+=.15*f.stats(u).A*e.value;if(has(u,'C07')&&f.ready(u,'wellTimedCheer',2))f.after(()=>heal(f,u,actor,.01*u.maxHp*e.value,'Well-Timed Cheer'));}}
  if(d.active&&d.primary&&has(u,'C05')&&actor!==u&&allies(u,actor)){const p=pool(actor,u,'Shared Intake');if(p&&!p.heldBreath){p.heldBreath=true;amount*=1.12;}}
  return amount;
 },
 landed(f,u,actor,t,result,d){
  if(!d.basic)return;
  if(actor===u){if(has(u,'A08'))f.add(u,'Pressure',1,2);if(has(u,'B07')&&u.shield>0){u.kit.coolingBasics=(u.kit.coolingBasics||0)+1;if(u.kit.coolingBasics%2===0&&f.ready(u,'coolingCycle',2))heal(f,u,u,.01*u.maxHp,'Cooling Cycle');}}
  if(actor===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Piston Signal');if(e?.source===u.id&&!e.extended){e.extended=true;e.until+=2;}}
 },
 broken(f,u,actor,t,p){if(has(u,'B05')&&t===u&&p.source===u.id&&p.label==='Deep Intake'&&!p.safeRelease){p.safeRelease=true;f.add(u,'Pressure',1,2);ward(f,u,f.trainer(u),.02*u.maxHp,3,'Safe Release');}}
});
function sipDream(f,u,fraction=.35,insurance=false){
 if(!f.ready(u,'dreamSipperCD',2))return false;
 const t=f.lowest(u),M=f.stats(u).M,low=t&&t.hp<t.maxHp*.5,actual=heal(f,u,t,fraction*M,'Dream Sipper');
 if(has(u,'B01')&&actual>0)heal(f,u,u,actual*.5,'Gentle Sipper');
 if(has(u,'B07')&&low&&f.ready(u,'tuckedIn',3))ward(f,u,t,.25*M,3,'Tucked In');
 if(insurance&&has(u,'B05'))buff(f,u,t,'Light Sleeper','flee',20,2);
 return true;
}
function applyDrowsy(f,u,t){if(alive(t))buff(f,u,t,'Drowsy','activeWeakness',.15,3,{harmful:true});}
register('dreamtapir',{
 sipper(f,u){return sipDream(f,u);},
 effect(f,u,g){if(g.source===u&&g.key==='Drowsy'){if(has(u,'C01')){g.value=.1;g.duration=5;}if(has(u,'C08')){g.value=.12;g.duration=4;}}},
 effected(f,u,source,t,e,old){
  if(source!==u||e.key!=='Drowsy')return;e.charges=has(u,'C01')?2:1;e.consumed=0;e.sipped=false;
  if(has(u,'C02'))buff(f,u,t,'Heavy Eyelids','basicPenalty',.12,e.until-f.battle.time,{harmful:true});
  const c=f.currentCompanionCast;
  if(has(u,'A07')&&old&&c?.u===u&&!c.dreamResidue){c.dreamResidue=true;f.after(()=>f.proc(u,t,.3*f.stats(u).M,'magic','Dream Residue'));}
  if(has(u,'A02')&&c?.u===u&&c.s.name==='Drowsy Bubble')buff(f,u,t,'Dream Bite','dreamBite',2,e.until-f.battle.time,{harmful:true});
 },
 drowsy(f,u,t,e,d){
  if(!d.primary||d.proc)return 0;
  e.consumed++;
  if(!has(u,'C08')){e.charges--;if(e.charges<=0){f.remove(t,'Drowsy');f.remove(t,'Heavy Eyelids');}}
  if(!has(u,'C08')||!e.sipped)f.after(()=>{if(sipDream(f,u))e.sipped=true;});
  if(has(u,'C07')&&!u.kit['yawn:'+t.id]){u.kit['yawn:'+t.id]=true;const other=f.nearby(u,t,18,4,t).find(v=>v!==t&&f.get(v,'Drowsy')?.source===u.id);const next=other&&f.get(other,'Drowsy');if(next){next.until+=2;const heavy=f.get(other,'Heavy Eyelids');if(heavy)heavy.until=next.until;}}
  return e.value;
 },
 effectExpired(f,u,t,e){if(e.key==='Drowsy'&&e.source===u.id&&has(u,'B03')&&!e.consumed)sipDream(f,u,.175,true);},
 outgoing(f,u,amount,actor,t,d){
  if(actor===u&&d.basic&&has(u,'A02')){const e=f.get(t,'Dream Bite');if(e?.source===u.id&&e.value>0){amount+=.15*f.stats(u).M;e.value--;if(!e.value){f.remove(t,e.key);if(has(u,'A04'))f.after(()=>heal(f,u,u,.25*f.stats(u).M,'Open Mouth'));}}}
  return amount;
 },
 attempted(f,u,actor,t,d){if(has(u,'C04')&&d.basic&&actor.side!==u.side&&f.get(actor,'Drowsy')?.source===u.id&&f.ready(u,'noRest:'+actor.id,1))f.proc(u,actor,.1*f.stats(u).M,'magic','No Rest');},
 incoming(f,u,raw,actor,t,d){const p=pool(t,u,'Pillow Pocket');if(has(u,'C03')&&actor?.side!==u.side&&d.direct!==false&&!d.dot&&p&&!p.unquiet){p.unquiet=true;f.after(()=>{if(!alive(t))return;applyDrowsy(f,u,actor);if(has(u,'C05')){const other=f.nearby(u,actor,18,2,actor).find(v=>v!==actor);if(other)applyDrowsy(f,u,other);}});}return raw;},
 shield(f,u,g){if(g.source===u&&g.label==='Pillow Pocket'&&!g.options.talent&&has(u,'B08')){g.amount*=.75;g.duration=1e6;}},
 absorbed(f,u,actor,t,p,amount){if(has(u,'A03')&&p.source===u.id&&p.label==='Pillow Pocket'&&amount>0){u.kit.feastPrimer={cast:p.cast,until:has(u,'A05')?1e6:p.until};}},
 expired(f,u,t,p){if(p.source===u.id&&p.label==='Pillow Pocket'&&!has(u,'A05')&&u.kit.feastPrimer?.cast===p.cast)u.kit.feastPrimer=null;},
 broken(f,u,actor,t,p){
  if(p.source!==u.id||p.label!=='Pillow Pocket')return;
  if(!has(u,'A05')&&u.kit.feastPrimer?.cast===p.cast)u.kit.feastPrimer=null;
  if(has(u,'B04')&&alive(t))heal(f,u,t,.4*f.stats(u).M,'Soft Landing');
  if(has(u,'B08')){u.kit.dreamWards||={};u.kit.dreamWards[t.id]=p.cast;}
 },
 damaged(f,u,actor,t,amount,absorbed,d){
  if(actor?.side===u.side||d.transfer||d.debt||!alive(t))return;
  if(has(u,'B08')&&amount>0&&u.kit.dreamWards&&Object.hasOwn(u.kit.dreamWards,t.id)){delete u.kit.dreamWards[t.id];heal(f,u,t,.6*f.stats(u).M,'Dream Ward');}
 },
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Nightmare Feast'){c.drowsyFeast=!!f.get(c.t,'Drowsy');c.feastPrimed=u.kit.feastPrimer?.until>f.battle.time;if(c.feastPrimed)u.kit.feastPrimer=null;}},
 primary(f,u,amount,c,kind){
  if(c.u!==u||c.s.name!=='Nightmare Feast'||kind!=='damage')return amount;
  if(has(u,'A01')&&c.drowsyFeast)amount+=.5*c.M;
  if(c.feastPrimed)amount*=1.2;
  if(has(u,'B06'))amount*=.7;
  return amount;
 },
 cast(f,u,c){
  if(c.s.name!=='Nightmare Feast')return;
  if(has(u,'A08'))c.primary={kind:'damage',amount:0,target:c.t,category:'magic'};else c.hit(2.8*c.M);
  if(c.drowsyFeast||has(u,'B06'))c.heal(c.low,(c.drowsyFeast?.9:.45)*c.M);
  if(has(u,'A01')&&c.drowsyFeast)heal(f,u,u,.35*c.M,'Sweet Terror');
  if(has(u,'A06')){const duration=has(u,'A08')?1e6:3,tick=(has(u,'A08')?.4:.2)*c.M;f.dot(u,c.t,'Slow Digestion:'+u.id,tick*duration,duration,'magic',{ownerRequired:true,label:'Slow Digestion'});}
  if(has(u,'C06')){buff(f,u,c.t,'Bad Dream healing','healOutput',-.2,4,{harmful:true});buff(f,u,c.t,'Bad Dream shielding','shieldOutput',-.2,4,{harmful:true});}
  return true;
 },
 afterCast(f,u,c){if(c.u===u&&c.s.name==='Pillow Pocket'&&has(u,'B02'))heal(f,u,c.low,.35*c.M,'Stuffed Pocket');}
});
function freshPage(f,u,t,d){return !u.kit.freshUsed&&t.id===u.kit.originalTarget&&!t.temporary&&d.primary!==false&&(!has(u,'A08')||d.active&&f.currentCompanionCast?.u===u);}
register('duskmarten',{
 freshPage(){return true;},
 freshAllowed(f,u,t,d){return freshPage(f,u,t,d);},
 effect(f,u,g){if(g.source===u){if(g.key==='Brushbite'&&has(u,'B02')&&!g.extra.counter)g.duration+=1;if(g.key==='Black Margin'&&has(u,'C08')&&!g.extra.immediate&&!g.extra.secondary)g.duration=6;}},
 outgoing(f,u,amount,actor,t,d){
  const e=f.get(t,'Black Margin');
  if(e?.source===u.id&&allies(u,actor)&&d.category!=='magic'){
   const bypass=has(u,'C08')?.08:actor===u?.08:has(u,'C01')?.04:0;d.penetration=Math.max(d.penetration||0,bypass);
   if(actor===f.trainer(u)&&bypass&&has(u,'C04')&&!e.annotation){e.annotation=true;ward(f,u,actor,.25*f.stats(u).A,3,'Helpful Annotation');}
  }
  const marked=f.get(actor,'Black Margin');if(has(u,'C08')&&marked?.source===u.id&&d.active&&d.primary&&!marked.ledger){marked.ledger=true;amount*=.8;}
  if(actor!==u)return amount;const {A}=f.stats(u);
  if(d.basic&&has(u,'A08'))amount*=.8;
  if(freshPage(f,u,t,d)){
   u.kit.freshUsed=true;d.freshMarten=u.id;amount+=((has(u,'A08')?1.5:.5)+(has(u,'A01')?.35:0))*A;
   if(has(u,'A02'))buff(f,u,t,'Black Margin','ownerExposure',.08,2,{harmful:true,immediate:true});
   if(has(u,'C07')){const positive=Object.values(t.effects).filter(e=>e.until>f.battle.time&&e.value>0&&['basicTempo','hit'].includes(e.kind)).sort((a,b)=>(a.kind==='basicTempo'?0:1)-(b.kind==='basicTempo'?0:1)||a.key.localeCompare(b.key));if(positive[0])f.remove(t,positive[0].key);}
  }
  if(d.basic&&u.kit.moreLine?.target===t.id){amount+=u.kit.moreLine.amount;u.kit.moreLine=null;}
  if(d.basic&&u.kit.slipperyCounter){amount+=spend(u,'slipperyCounter');d.slipperyMarten=u.id;}
  return amount;
 },
 primary(f,u,amount,c,kind){if(c.u===u&&kind==='damage'&&c.s.name==='Brushbite'&&has(u,'A04')&&f.get(c.t,'Black Margin')?.immediate&&!u.kit['blank:'+c.t.id]){u.kit['blank:'+c.t.id]=true;amount+=.35*c.A;}return amount;},
 incoming(f,u,raw,actor,t,d){
  if(t!==u||d.direct===false||d.dot)return raw;const e=f.get(actor,'Black Margin');if(e?.source!==u.id)return raw;
  if(has(u,'B03')&&d.basic&&actor===f.battle.target(u))raw*=.88;
  if(has(u,'B05')&&d.active&&!e.blurred){e.blurred=true;raw*=.85;}return raw;
 },
 missed(f,u,actor,t,d){if(t===u&&d.basic&&has(u,'B02')&&f.has(u,'Brushbite')&&!u.kit.slipperyUsed){u.kit.slipperyUsed=true;u.kit.slipperyCounter=.3*f.stats(u).A;}},
 landed(f,u,actor,t,result,d){
  if(actor!==u)return;
  if(d.freshMarten===u.id&&has(u,'A06')&&alive(t))u.kit.moreLine={target:t.id,amount:.4*f.stats(u).A};
  if(d.slipperyMarten===u.id&&has(u,'B04'))buff(f,u,u,'Brushbite','flee',15,2,{counter:true});
  if(has(u,'A07')&&d.basic&&alive(t)){
   u.kit.manuscriptBasics=u.kit.manuscriptTarget===t.id?(u.kit.manuscriptBasics||0)+1:1;u.kit.manuscriptTarget=t.id;
   if(u.kit.manuscriptBasics>=6&&u.kit.freshUsed&&f.ready(u,'oldManuscript',8)){u.kit.manuscriptBasics=0;u.kit.freshUsed=false;}
  }
 },
 damaged(f,u,actor,t,amount,absorbed,d){
  if(t===u&&has(u,'B07')&&!u.kit.noFatal&&alive(u)&&u.hp<u.maxHp*.35){u.kit.noFatal=true;u.kit.freshUsed=true;ward(f,u,u,.8*f.stats(u).A+.03*u.maxHp,3,'No Fatal Flourish');}
  if(actor===u&&has(u,'B08')&&d.primary&&d.direct!==false&&!d.proc&&f.has(u,'Living Manuscript'))limited(f,u,'manuscriptHealing',.2*amount,.03*u.maxHp,n=>heal(f,u,u,n,'Living Manuscript',n));
 },
 cast(f,u,c){
  if(c.s.name==='Final Stroke'){c.hit((!has(u,'B08')&&c.hp(c.t)<(has(u,'A03')?.5:.35)?3.4:2.6)*c.A);return true;}
  if(c.s.name==='Black Margin'&&has(u,'C08')){c.primary={kind:'utility',amount:0,target:c.t};if(c.markHit())c.buff(c.t,'Black Margin','ownerExposure',.08,6,{harmful:true});return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.find(r=>r.primary&&r.hit);
  if(c.s.name==='Brushbite'){
   u.kit.slipperyUsed=false;
   if(hit&&has(u,'B01'))heal(f,u,u,Math.min(.04*c.H,.15*hit.damage),'Wet Ink');
   if(hit&&has(u,'C02'))buff(f,u,c.t,'Crossed Names','hit',-20,3,{harmful:true});
  }
  if(c.s.name==='Final Stroke'){
   if(hit&&!alive(c.t)&&!c.t.temporary&&has(u,'A05')){refund(u,'Brushbite',2);ward(f,u,u,.4*c.A,3,'Finishing Receipt');}
   if(alive(c.t)&&has(u,'B06'))heal(f,u,u,.6*c.A,'Measured Finish');
   if(has(u,'B08'))buff(f,u,u,'Living Manuscript','flee',25,4);
   if(hit&&has(u,'C03')){buff(f,u,c.t,'Unhealed Wound','healReceived',-.3,4,{harmful:true});if(has(u,'C05'))buff(f,u,c.t,'Redaction','shieldReceived',-.2,4,{harmful:true});}
  }
  if(c.s.name==='Black Margin'&&has(u,'C06')&&(hit||c.statusLanded)){const t=f.nearby(u,c.t,18,2,c.t).find(v=>v!==c.t);if(t){const e=buff(f,u,t,'Black Margin','ownerExposure',.08,has(u,'C08')?3:1.5,{harmful:true,secondary:true});}}
 }
});
function rage(f,u){
 if(has(u,'B08')||!u.kit.rageArmed||u.hp>=u.maxHp*.7||!f.ready(u,'rageCD',6))return;
 u.kit.rageArmed=false;buff(f,u,u,'Tailblanket fury','resource',1,3);
 if(has(u,'C03'))buff(f,u,f.trainer(u),'Shared Temper','primaryPower',.12,3);
 if(has(u,'C05'))charge(f,u,f.trainer(u),'Hot Encouragement',.25*f.stats(u).A);
}
register('emberfox',{
 tailblanket(){return true;},
 gate(f,u,c){if(c.s.name==='Blanket Curl'&&has(u,'C08'))return c.all.some(t=>c.hp(t)<=.75);},
 prepare(f,u){u.kit.rageArmed=true;},
 tick(f,u){if(has(u,'A01')&&u.hp>u.maxHp*.85)u.kit.rageArmed=true;rage(f,u);},
 incoming(f,u,raw,actor,t,d){
  if(actor?.side===u.side||d.direct===false||d.dot)return raw;
  if(t===u&&!has(u,'A08')&&(has(u,'B08')||u.hp>u.maxHp*.7))raw*=.9;
  const e=f.get(actor,'Spade Escort');if(has(u,'C02')&&t===f.trainer(u)&&d.basic&&e?.source===u.id){f.remove(actor,e.key);raw*=.8;if(has(u,'C04'))f.after(()=>heal(f,u,t,.02*u.maxHp,'Cushioned Reply'));}
  return raw;
 },
 outgoing(f,u,amount,actor,t,d){
  if(actor===u&&d.category!=='magic'){
   if(has(u,'A08'))amount*=u.hp<u.maxHp*.7?1.15:1.1;else if(!has(u,'B08')&&f.has(u,'Tailblanket fury'))amount*=1.15;
   if(has(u,'A07')&&u.hp<u.maxHp*.7&&d.active&&d.primary&&f.ready(u,'reasonRage',4))d.penetration=Math.max(d.penetration||0,.06);
  }
  if(actor===f.trainer(u)&&d.primary&&d.direct!==false&&f.get(actor,'Shared Temper')?.source===u.id)amount*=1.12;
  return amount;
 },
 effect(f,u,g){if(g.source===u&&g.key==='Blanket Curl'&&has(u,'B01')){g.duration+=1;g.extra={...g.extra,expire:()=>buff(f,u,g.target,'Thick Fold','basicDR',.1,75,{once:true})};}},
 damaged(f,u,actor,t,amount,absorbed,d){if(t!==u||actor?.side===u.side||d.transfer||d.debt)return;u.kit.reprisalLosses=(u.kit.reprisalLosses||[]).filter(e=>e.at>=f.battle.time-4);if(amount>0)u.kit.reprisalLosses.push({at:f.battle.time,amount});rage(f,u);},
 beforeCast(f,u,c){if(c.u!==u)return;c.rageFlick=has(u,'A08')||!has(u,'B08')&&f.has(u,'Tailblanket fury');if(c.s.name==="Imp's Reprisal")c.reprisalBonus=Math.min(.8*c.A,.3*(u.kit.reprisalLosses||[]).filter(e=>e.at>=f.battle.time-(has(u,'A03')?4:2)).reduce((sum,e)=>sum+e.amount,0));},
 primary(f,u,amount,c,kind){if(c.u!==u||kind!=='damage')return amount;if(c.s.name==='Spade Flick'&&has(u,'A02')&&c.rageFlick)amount+=.4*c.A;return amount+spend(u,'halfBlanket');},
 cast(f,u,c){
  if(c.s.name==='Spade Flick'){c.hit(1.35*c.A);if(c.hp()<.7||has(u,'B02'))c.selfward((c.hp()<.7?.03:.015)*c.H,2);return true;}
  if(c.s.name==='Blanket Curl'){
   const recipients=has(u,'C08')?c.all:[u],amount=.08*c.H*(has(u,'A06')?.5:1)/recipients.length;
   for(const t of recipients){c.heal(t,amount);c.dr(.1,2,'dr',t);}
   return true;
  }
  if(c.s.name==="Imp's Reprisal"){
   const bonus=c.reprisalBonus||0,healing=has(u,'B06')?bonus*.5:0,shield=has(u,'C06')?bonus-healing:0;c.hit(2.4*c.A+bonus-healing-shield);
   if(healing)heal(f,u,u,healing,'Measured Reprisal');if(shield)ward(f,u,f.lowest(u),shield,3,'Gentle Reprisal');
   if(has(u,'A05')&&bonus>=.8*c.A){const e=f.get(u,'Tailblanket fury');if(e)e.until+=2;const shared=f.get(c.tr,'Shared Temper');if(shared?.source===u.id)shared.until+=2;}
   return true;
  }
 },
 healed(f,u,source,t,actual,label,o){if(source===u&&label==='Blanket Curl'&&has(u,'B07')&&o.offered>actual){const c=f.currentCompanionCast,amount=Math.min(.05*u.maxHp-(c?.blanketOverflow||0),o.offered-actual);if(c)c.blanketOverflow=(c.blanketOverflow||0)+amount;ward(f,u,u,amount,3,'Mended Blanket',{accumulate:true,cap:.05*u.maxHp});}},
 broken(f,u,actor,t,p){if(t===u&&p.source===u.id&&p.label==='Spade Flick'&&has(u,'B04'))heal(f,u,u,.01*u.maxHp,'Folded Edge');},
 afterCast(f,u,c){
  if(c.u!==u)return;
  if(c.s.name==='Spade Flick'){
   if(has(u,'A04')&&c.rageFlick)charge(f,u,u,'Angry Cushion',.2*c.A);
   if(has(u,'C02')&&c.results.some(r=>r.primary&&r.hit))buff(f,u,c.t,'Spade Escort','escort',.2,3,{harmful:true});
  }
  if(c.s.name==='Blanket Curl'){
   if(has(u,'A06'))u.kit.halfBlanket=.6*c.A;
   if(has(u,'B03'))for(let i=1;i<=2;i++)f.later(u,u,i,()=>{heal(f,u,u,.02*c.H,'Warm Nap');if(has(u,'B05'))buff(f,u,u,'No Chill','basicDR',.1,2,{once:true});},{ownerRequired:true});
   if(has(u,'B08'))heal(f,u,c.tr,.03*c.H,'Never Uncovered');
   const other=f.lowest(u,c.other);if(has(u,'C01'))ward(f,u,other,.03*c.H,3,'Friendly Blanket');
   if(has(u,'C07')&&c.hp(c.tr)<.5&&!u.kit.gatheredBlanket){u.kit.gatheredBlanket=true;const third=c.other.find(t=>t!==other);if(third)ward(f,u,third,.03*c.H,3,'Gather Around');}
  }
 }
});
function spendHeat(f,u,recipient,t,count,d){
 const {M,H}=f.stats(u),damage=(has(u,'B08')?0:has(u,'A08')?.7:.35)*M*count;
 if(!has(u,'A08'))ward(f,u,recipient,(has(u,'B08')?.4:.2)*M*count,has(u,'B01')?4:2,'Banked Heat',{accumulate:has(u,'B01'),cap:has(u,'B01')?.1*H:Infinity});
 if(has(u,'B08'))f.after(()=>heal(f,u,u,.01*H*count,'Heat Without Flame'));
 if(has(u,'A05')){u.kit.heatSpent=(u.kit.heatSpent||0)+count;const restored=Math.floor(u.kit.heatSpent/3);u.kit.heatSpent%=3;if(restored)f.after(()=>f.add(u,'Heat',restored,3));}
 if(has(u,'A07')&&count>=2)f.after(()=>f.dot(u,t,'Burning Knuckleprints:'+u.id,.45*M,3,'magic',{ownerRequired:true,label:'Burning Knuckleprints'}));
 if(recipient===u){if(has(u,'A03')){d.penetratingMagicBonus=damage;d.magicBonusPenetration=.2;}return damage;}
 if(damage)f.after(()=>f.proc(u,t,damage,'magic','The Other Fists',{magicPenetration:has(u,'A03')?.2:0}));return 0;
}
register('flintjackal',{
 bankedHeat(){return true;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Heat'&&has(u,'A01')?5:max;},
 beforeHP(f,u,raw,actor,t,d){if(t===u&&raw>0&&actor?.side!==u.side&&!d.transfer&&!d.debt&&has(u,'B07')&&(u.kit.Heat||0)>0&&f.ready(u,'glowingReserve',2)){f.take(u,'Heat',1);return raw*.85;}return raw;},
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Coal Jab')c.jabIgnition=f.get(c.t,'Magic exposure')?.source===u.id;},
 outgoing(f,u,amount,actor,t,d){
  if(!d.primary)return amount;
  if(actor===u&&d.basic){
   if(!has(u,'C08')){const count=f.take(u,'Heat',has(u,'A01')?2:1);if(count)amount+=spendHeat(f,u,u,t,count,d);}
   amount+=spend(u,'jabCross');
  }
  if(actor===f.trainer(u)){
   const lesson=f.get(t,'Lessons in Heat');if(lesson?.source===u.id){f.remove(t,lesson.key);f.after(()=>f.proc(u,t,.3*f.stats(u).M,'magic','Lessons in Heat'));if(has(u,'C04'))f.add(u,'Heat',1,3);}
   if(d.basic&&has(u,'C08')&&(u.kit.Heat||0)>0&&f.ready(u,'otherFists',1))spendHeat(f,u,actor,t,f.take(u,'Heat',1),d);
  }
  if(d.basic&&allies(u,actor)){const e=f.remove(actor,'Ember charge:'+u.id);if(e){f.after(()=>{f.proc(u,t,.3*f.stats(u).M,'magic','Kindled Partner');ward(f,u,actor,.2*f.stats(u).M,3,'Kindled Partner');if(has(u,'C07'))buff(f,u,actor,'Warmed Hands','healReceived',.1,3);});}}
  return amount;
 },
 hitBonus(f,u,bonus,actor,t){return has(u,'C01')&&allies(u,actor)&&f.get(t,'Magic exposure')?.source===u.id?bonus+20:bonus;},
 broken(f,u,actor,t,p){if(t===u&&p.source===u.id&&p.label==='Kiln Stance'&&has(u,'B05'))ward(f,u,f.trainer(u),.5*f.stats(u).M,3,'Shared Ash');},
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Coal Jab'){
   if(hit&&has(u,'A02')&&c.jabIgnition)f.add(u,'Heat',1,3);
   if(has(u,'A04'))u.kit.jabCross=.25*c.M;
   if(has(u,'B02')&&pool(u,u,'Kiln Stance')){const actual=heal(f,u,u,.25*c.M,'Cooling Jab');if(actual&&has(u,'B04'))buff(f,u,u,'Steam Padding','basicDR',.15,2,{once:true});}
   if(hit&&has(u,'C02'))buff(f,u,c.t,'Lessons in Heat','lesson',.3*c.M,3,{harmful:true});
  }
  if(c.s.name==='Kiln Stance'){
   if(has(u,'B03')){f.add(u,'Heat',1,3);ward(f,u,c.tr,.02*c.H,3,'Deep Kiln');}
   if(has(u,'C03'))for(const t of c.other.filter(t=>t.slot>0||has(u,'C05')))buff(f,u,t,'Ember charge:'+u.id,'emberCharge',1,75);
  }
  if(c.s.name==='Furnace Uppercut'){
   if(has(u,'A06'))f.add(u,'Heat',2,3);
   if(hit&&has(u,'B06'))buff(f,u,c.t,'Weakened active','activeWeakness',.15,3,{harmful:true});
   if(hit&&has(u,'C06'))for(const t of f.nearby(u,c.t,18,3,c.t).filter(t=>t!==c.t))buff(f,u,t,'Magic exposure','magicExposure',.06,1.5,{harmful:true});
  }
 }
});
function mendShield(f,u,t,p,amount){f.syncShield(t);if(!t.pools.includes(p))return 0;const gain=Math.max(0,Math.min(amount,(p.capacity??Infinity)-p.amount,Math.floor(t.maxHp*.25)-t.shield));p.amount+=gain;f.syncShield(t);if(gain)f.battle.emit('shield',u,t,p.label,p.amount,{granted:gain,pool:p.key,repaired:true});return gain;}
register('fluffyak',{
 fleece(){return true;},
 prepare(f,u){u.kit.renewFleeceAt=f.battle.time+4;},
 tick(f,u){
  if(has(u,'A01')&&f.battle.time+1e-8>=u.kit.renewFleeceAt){u.kit.renewFleeceAt+=4;if(!u.kit.Fleece)f.add(u,'Fleece',1,2);}
  if(has(u,'A04')&&pool(u,u,'Horn Shelter'))buff(f,u,u,'Quiet Horns','flee',20,.1);
  if(has(u,'A08'))for(const t of f.core(u))for(const p of [...t.pools])if(p.source===u.id&&p.label==='Fleece Wrap'&&p.winterAt<=f.battle.time+1e-8){p.winterAt+=1;mendShield(f,u,t,p,.01*u.maxHp);}
 },
 shield(f,u,g){if(g.source===u&&g.label==='Fleece Wrap'&&!g.options.talent&&has(u,'A08')){g.amount*=.75;g.duration=1e6;}},
 shielded(f,u,source,t,amount,label,p,o){
  if(source!==u||label!=='Fleece Wrap')return;
  if(has(u,'A08')){p.capacity=p.amount;p.winterAt=f.battle.time+1;}
  if(has(u,'A03')&&t===f.trainer(u)&&!o.talent)ward(f,u,u,.4*amount,p.until-f.battle.time,'Fleece Wrap');
 },
 incoming(f,u,raw,actor,t,d){return has(u,'A05')&&d.basic&&t===f.trainer(u)&&pool(t,u,'Fleece Wrap')?raw*.9:raw;},
 beforeCast(f,u,c){if(c.u===u){c.fleeceHeld=u.kit.Fleece||0;c.hornShelter=f.get(c.t,'Woolhorn')?.source===u.id;}},
 primary(f,u,amount,c,kind){
  if(c.u!==u)return amount;
  if(kind==='damage'){
   if(c.s.name==='Woolhorn'){c.shearing=spend(u,'angryShearing');amount+=c.shearing;if(has(u,'C02'))amount*=.75;}
   if(has(u,'B08')){c.fleeceSpent=f.take(u,'Fleece');amount+=.7*c.A*c.fleeceSpent;}
  }else if(!has(u,'B08')){c.fleeceSpent=f.take(u,'Fleece',1);if(c.fleeceSpent)amount*=1.25;if(c.fleeceSpent&&kind==='heal'&&has(u,'C07'))c.lanolinTarget=c.primary.target;}
  return amount;
 },
 outgoing(f,u,amount,actor,t,d){if(actor===u&&d.primary&&d.active&&has(u,'B02')&&!u.kit.Fleece&&f.currentCompanionCast?.s.name==='Woolhorn')d.penetration=Math.max(d.penetration||0,.08);return amount;},
 cast(f,u,c){if(c.s.name==='Warmth of the Herd'){c.teamheal((.8*c.M+.02*c.H+(has(u,'A06')?.01*c.H*Math.min(2,c.fleeceHeld):0))*(has(u,'C08')?.5:1));return true;}},
 healed(f,u,source,t,actual,label,o){if(source===u&&label==='Warmth of the Herd'&&has(u,'C03')&&o.offered>actual)ward(f,u,t,Math.min(.03*u.maxHp,.35*(o.offered-actual)),3,'Warmth Reserve');},
 damaged(f,u,actor,t,amount,absorbed,d){if(t===u&&d.basic&&amount+absorbed>0&&has(u,'B04')&&u.kit.shornCounter){u.kit.shornCounter=false;charge(f,u,u,'Shorn Counter',.3*f.stats(u).A);}},
 broken(f,u,actor,t,p){
  if(t===u&&has(u,'A07')&&u.shield<=0&&f.ready(u,'patchSkirt',4))f.add(u,'Fleece',1,2);
  if(p.source===u.id&&p.label==='Fleece Wrap'&&has(u,'C06'))heal(f,u,t,.5*f.stats(u).M,'Soft Landing');
 },
 landed(f,u,actor,t,result,d){
  if(actor!==u||!d.basic)return;
  if(has(u,'B08')&&(u.kit.talentBasics||0)%3===0)f.add(u,'Fleece',1,2);
  if(has(u,'B05')&&f.has(u,'Battle Wrap')&&(u.kit.wrapExtensions||0)<2){const e=f.get(t,'Woolhorn');if(e?.source===u.id){e.until+=1;u.kit.wrapExtensions=(u.kit.wrapExtensions||0)+1;}}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.find(r=>r.primary&&r.hit);
  if(has(u,'B01')&&c.fleeceSpent)u.kit.angryShearing=Math.min(.8*c.A,(u.kit.angryShearing||0)+.4*c.A*c.fleeceSpent);
  if(c.lanolinTarget)buff(f,u,c.lanolinTarget,'Lanolin Care','healReceived',.15,3);
  if(c.s.name==='Woolhorn'){
   if(hit&&has(u,'A02')&&c.hornShelter)ward(f,u,u,.02*c.H,3,'Horn Shelter');
   if(has(u,'B04'))u.kit.shornCounter=true;
   if(hit&&c.shearing&&has(u,'B07'))heal(f,u,u,Math.min(.04*c.H,.15*hit.damage),'Horn Renewal');
   if(hit&&has(u,'C02')){heal(f,u,f.lowest(u),.3*c.M,'Kind Horn');if(has(u,'C04')){const p=pool(c.tr,u,'Fleece Wrap');if(p&&(p.wrapExtra||0)<2){p.until+=1;p.wrapExtra=(p.wrapExtra||0)+1;}}}
  }
  if(c.s.name==='Fleece Wrap'){
   if(has(u,'B03')){buff(f,u,u,'Battle Wrap','basicTempo',.15,3);u.kit.wrapExtensions=0;}
   if(has(u,'C01'))heal(f,u,c.tr,.4*c.M,'Living Quilt');
  }
  if(c.s.name==='Warmth of the Herd'){
   const healed=c.receivers.filter(r=>r.kind==='heal'&&r.actual>0).map(r=>r.target),primed=new Set();
   const prime=t=>{if(has(u,'B06')&&!primed.has(t.id)){primed.add(t.id);charge(f,u,t,"Herd's Charge",.15*c.A);}};healed.forEach(prime);
   if(has(u,'C05'))for(const t of healed)f.later(u,t,2,()=>heal(f,u,t,.2*c.M,'Long Winter Supper'),{ownerRequired:true});
   if(has(u,'C08')){const token=(u.kit.hearthAura||0)+1;u.kit.hearthAura=token;buff(f,u,u,'Hearth of the Herd','aura',1,4);for(let i=1;i<=4;i++)f.later(u,u,i,()=>{if(u.kit.hearthAura!==token)return;for(const t of f.core(u).filter(t=>f.battle.distance(u,t)<=18))if(heal(f,u,t,.25*c.M,'Hearth of the Herd')>0)prime(t);},{ownerRequired:true});}
  }
 }
});
function shardWard(f,u,amount){limited(f,u,'stolenShards',amount*.2,.04*u.maxHp,n=>ward(f,u,u,n,3,'Stolen Shards',{accumulate:true,maximum:n}));}
register('frostfang',{
 tick(f,u){if(has(u,'B04')&&pool(u,u,'Safe Rake'))buff(f,u,u,'Polished Edge','flee',20,.1);},
 effect(f,u,g){if(g.source===u&&g.key==='Brittle'&&has(u,'C08')){g.value=g.extra.half?.175:.35;g.duration=5;}},
 effected(f,u,source,t,e){if(source===u&&e.key==='Brittle'){e.cast=u.casts;e.extensions=0;if(has(u,'C03'))buff(f,u,t,'Poisoned Repairs','healReceived',-.25,e.until-f.battle.time,{harmful:true});}},
 brittle(f,u,t,e){
  if(!has(u,'C08')){f.remove(t,'Brittle');f.remove(t,'Poisoned Repairs');}
  const key='repairTax:'+e.cast+':'+t.id;if(has(u,'C05')&&!u.kit[key]){u.kit[key]=true;f.after(()=>ward(f,u,f.trainer(u),.4*f.stats(u).A,3,'Repair Tax'));}
  return e.value;
 },
 beforeCast(f,u,c){if(c.u===u){c.faultReady=f.has(u,'Fault opening');c.startBrittle=!!f.get(c.t,'Brittle');}},
 primary(f,u,amount,c,kind){if(c.u===u&&kind==='damage'){if(c.s.name==='Crystal Rake'&&has(u,'A02')&&c.faultReady)amount+=.3*c.A;if(c.s.name==='Splinter Wedge'&&has(u,'C08'))amount*=.5;}return amount;},
 outgoing(f,u,amount,actor,t,d){
  if(actor===u){
   if(has(u,'B08'))d.shieldBonus=0;
   if(has(u,'A08')&&d.active&&d.primary&&f.currentCompanionCast?.s.name==='Fracture Pounce')d.shieldBypass=.35;
   if(has(u,'A04')&&d.basic){const e=f.get(t,'Fracture Map');if(e?.source===u.id){f.remove(t,e.key);amount+=.3*f.stats(u).A;}}
  }
  if(has(u,'C01')&&actor===f.trainer(u)&&d.primary&&d.category!=='magic'&&t===f.battle.target(u)&&f.remove(u,'Fault opening'))d.penetration=Math.max(d.penetration||0,.08);
  return amount;
 },
 incoming(f,u,raw,actor,t,d){if(t===u&&d.basic){const e=f.get(actor,'Prism Shelter');if(e?.source===u.id){f.remove(actor,e.key);raw*=.75;if(has(u,'B05'))charge(f,u,u,'Refracted Threat',.25*f.stats(u).A);}}return raw;},
 hitBonus(f,u,bonus,actor,t){return has(u,'C04')&&allies(u,actor)&&f.get(t,'Marked Rake')?.source===u.id?bonus+15:bonus;},
 absorbed(f,u,actor,t,p,amount,d,removed){if(actor===u&&t.side!==u.side&&has(u,'B01'))shardWard(f,u,removed??amount);},
 broken(f,u,actor,t,p,d){
  if(actor===u&&t.side!==u.side&&has(u,'A07')&&f.ready(u,'shardRefund',3))refund(u,'Crystal Rake',1);
  if(t===u&&has(u,'B07')&&u.shield<=0&&!d.proc&&alive(actor)&&f.ready(u,'reflectedSplinter',3))f.proc(u,actor,.35*f.stats(u).A,'melee','Reflected Splinter');
 },
 damaged(f,u,actor,t,amount,absorbed,d){if(actor===u&&has(u,'B08')&&d.direct!==false&&!d.dot&&!d.transfer&&!d.debt)limited(f,u,'wholeAgain',.12*(amount+absorbed),.03*u.maxHp,n=>heal(f,u,u,n,'Whole Again',n));},
 landed(f,u,actor,t,result,d){
  if(actor!==u||!d.basic)return;
  if(has(u,'A01')&&!d.shieldBefore){u.kit.hairlineCount=u.kit.hairlineTarget===t.id?(u.kit.hairlineCount||0)+1:1;u.kit.hairlineTarget=t.id;if(u.kit.hairlineCount>=3&&f.ready(u,'faultCD',3)){u.kit.hairlineCount=0;buff(f,u,u,'Fault opening','resource',1,3);}}
  else u.kit.hairlineCount=0;
  if(result.critical&&has(u,'B04')){const p=pool(u,u,'Safe Rake');if(p&&!p.edgeHeal){p.edgeHeal=true;heal(f,u,u,.02*u.maxHp,'Polished Edge');}}
  if(result.critical&&has(u,'C07')){const e=f.get(t,'Brittle');if(e?.source===u.id&&(e.extensions||0)<2){e.extensions=(e.extensions||0)+1;e.until+=1;const poisoned=f.get(t,'Poisoned Repairs');if(poisoned?.source===u.id)poisoned.until=e.until;}}
 },
 cast(f,u,c){
  if(c.s.name==='Splinter Wedge'&&has(u,'A03')){const result=f.absorb(c.t,.5*c.A,u,{proc:true,direct:false,shieldRemoval:true});if(result.absorbed)f.battle.emit('status',u,c.t,'Wedge and Break',result.absorbed);else if(has(u,'A05'))u.kit.emptyShell=.3*c.A;}
  if(c.s.name==='Fracture Pounce'){c.hit((has(u,'A08')||c.t.shield>0?3.3:2.7)*c.A+spend(u,'emptyShell'));return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);if(!hit)return;
  if(c.s.name==='Crystal Rake'){
   if(has(u,'A04')&&c.faultReady)buff(f,u,c.t,'Fracture Map','fractureMap',1,3,{harmful:true});
   if(has(u,'B02')&&c.t.shield<=0)ward(f,u,u,.3*c.A,3,'Safe Rake');
   if(has(u,'C02'))buff(f,u,c.t,'Marked Rake','hit',-18,3,{harmful:true});
  }
  if(c.s.name==='Splinter Wedge'&&has(u,'B03'))buff(f,u,c.t,'Prism Shelter','prismShelter',.25,3,{harmful:true});
  if(c.s.name==='Fracture Pounce'){
   if(has(u,'A06'))buff(f,u,c.t,'Brittle','shieldWeakness',.25,3,{harmful:true});
   if(has(u,'B06')&&(c.startBrittle||f.has(c.t,'Brittle')))heal(f,u,u,.6*c.A,'Careful Pounce');
   if(has(u,'C06'))for(const t of f.nearby(u,c.t,18,3,c.t).filter(t=>t!==c.t))buff(f,u,t,'Brittle','shieldWeakness',.125,3,{harmful:true,half:true});
  }
 }
});
register('galeibex',{
 ribReserve(){return true;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Ribs'&&has(u,'B01')?4:max;},
 incoming(f,u,raw,actor,t,d){
  if(t!==u||actor?.side===u.side||d.direct===false||d.dot)return raw;
  if(!has(u,'A08')&&!has(u,'B08')&&(u.kit.Ribs||0)>0&&f.ready(u,'ribCD',.5)){f.take(u,'Ribs',1);d.hornRibOwner=u.id;raw*=.8;}
  if(d.basic&&has(u,'B04')){const p=pool(u,u,'Ribbed Sigil');if(p&&!p.settled){p.settled=true;raw*=.85;}}
  return raw;
 },
 beforeHP(f,u,raw,actor,t,d){if(has(u,'B08')&&t===f.trainer(u)&&actor?.side!==u.side&&d.direct!==false&&!d.dot&&!d.area&&!d.secondary&&!d.arenaWide&&raw>0&&(u.kit.Ribs||0)>0&&f.ready(u,'ribCD',1)){f.take(u,'Ribs',1);d.hornRibOwner=u.id;return raw*.8;}return raw;},
 damaged(f,u,actor,t,amount,absorbed,d){
  if(d.hornRibOwner!==u.id||!alive(t))return;
  if(has(u,'B07'))heal(f,u,u,.01*u.maxHp,'Careful Assembly');
  if(!d.proc&&alive(actor)){f.proc(u,actor,.3*f.stats(u).M,'magic','Rib Reserve');if(has(u,'C01'))buff(f,u,actor,'Resonant Skull','magicDamage',-.1,3,{harmful:true});}
 },
 outgoing(f,u,amount,actor,t,d){
  if(actor===u&&d.basic){
   if(has(u,'A08'))amount+=.5*f.stats(u).M*f.take(u,'Ribs',1);
   if(u.kit.orbitEdges>0){const second=u.kit.orbitEdges===1;amount+=.2*f.stats(u).M;if(second&&has(u,'A05')&&u.kit.orbitTarget===t.id)amount+=.2*f.stats(u).M;u.kit.orbitEdges--;if(!second)u.kit.orbitTarget=t.id;}
  }
  if(d.active&&d.primary&&actor.side!==u.side){
   if(has(u,'C04')&&f.get(actor,'Hollow Curse')?.source===u.id)amount*=.9;
   const silence=f.get(actor,'Silent Ossuary');if(silence?.source===u.id&&silence.value>0){amount*=.75;silence.value--;if(!silence.value)f.remove(actor,silence.key);f.add(u,'Ribs',1,3);f.after(()=>heal(f,u,f.trainer(u),.35*f.stats(u).M,'Silent Ossuary'));}
  }
  if(actor===f.trainer(u)&&has(u,'C05')&&t===f.battle.target(u)){const e=f.get(actor,'Bone Choir');if(e?.source===u.id&&!e.response){e.response=true;f.add(u,'Ribs',1,3);}}
  return amount;
 },
 hitBonus(f,u,bonus,actor,t){return has(u,'C03')&&actor!==u&&allies(u,actor)&&f.get(actor,'Bone Choir')?.source===u.id&&t===f.battle.target(u)?bonus+20:bonus;},
 landed(f,u,actor,t,result,d){if(actor===u&&d.basic&&has(u,'A07')&&(u.kit.talentBasics||0)%4===0&&f.ready(u,'recoveredBone',4))f.add(u,'Ribs',1,3);},
 broken(f,u,actor,t,p){if(t===u&&p.source===u.id&&p.label==='Bone Orbit'&&has(u,'B05'))f.add(u,'Ribs',1,3);},
 effectExpired(f,u,t,e){if(e.source===u.id&&e.key==='Hollow Curse'&&has(u,'C07'))ward(f,u,f.lowest(u),.3*f.stats(u).M,3,'Patient Watch');},
 cast(f,u,c){
  if(c.s.name==='Horn Sigil'){c.hit(1.3*c.M);if(c.r('Ribs')<(has(u,'A02')?2:1)){c.add('Ribs',1,3);c.ribRestored=true;}return true;}
  if(c.s.name==='Vaultbreaker'){
   if(has(u,'C08')){c.primary={kind:'utility',amount:0,target:c.t};c.buff(c.t,'Silent Ossuary','silentOssuary',2,5,{harmful:true});return true;}
   const held=c.r('Ribs'),spent=has(u,'A01')?c.take('Ribs',1):0;c.hit((2.3+.25*held+.6*spent)*c.M*(has(u,'B06')?.8:1));
   if(has(u,'A06'))c.splash(.2*c.M*(c.resources.Ribs||0)*(has(u,'B06')?.8:1));return true;
  }
 },
 afterCast(f,u,c){
  if(c.u!==u){const curse=f.get(c.u,'Hollow Curse');if(curse?.source===u.id){f.remove(c.u,curse.key);f.proc(u,c.u,.25*f.stats(u).M,'magic','Hollow Curse');}return;}
  const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Horn Sigil'){
   if(c.ribRestored&&has(u,'A04')&&hit)buff(f,u,c.t,'Carved Sign','magicExposure',.06,3,{harmful:true});
   if(c.ribRestored&&has(u,'B02'))ward(f,u,u,.3*c.M,3,'Ribbed Sigil');
   if(hit&&has(u,'C02'))buff(f,u,c.t,'Hollow Curse','hollowCurse',1,3,{harmful:true});
  }
  if(c.s.name==='Bone Orbit'){
   if(has(u,'A03'))u.kit.orbitEdges=2;
   if(has(u,'A08'))refund(u,c.s.name,2);
   if(has(u,'B03')){c.add('Ribs',1,3);ward(f,u,c.tr,.3*c.M,3,'Interlocking Bones');}
   if(has(u,'C03'))for(const t of c.other)buff(f,u,t,'Bone Choir','choir',20,3);
  }
  if(c.s.name==='Vaultbreaker'){
   if(has(u,'B06'))ward(f,u,f.lowest(u),.25*c.M*c.r('Ribs'),3,'Vault of Safety');
   if(has(u,'C06')&&(hit||has(u,'C08'))){buff(f,u,c.t,'Funeral Seal healing','healOutput',-.2,4,{harmful:true});buff(f,u,c.t,'Funeral Seal shielding','shieldOutput',-.2,4,{harmful:true});}
  }
 }
});
function nectar(f,u,t,count){if(!alive(t)||count<=0)return;const key='Gifted Nectar:'+u.id,old=f.get(t,key);buff(f,u,t,key,'giftedNectar',Math.min(3,(old?.value||0)+count),75,{replace:true});}
function growBuds(f,u,count){if(has(u,'A08')&&!f.ready(u,'budGeneration',2))return 0;const before=u.kit.Bud||0;f.add(u,'Bud',count,3);return (u.kit.Bud||0)-before;}
register('lilydeer',{
 antlerBuds(){return true;},
 overchargeAllowed(f,u,s){return s.name==='Shelf of Blossoms'&&has(u,'B08');},
 capacity(f,u,max,owner,key){return owner===u&&key==='Bud'&&has(u,'A01')?4:max;},
 gate(f,u,c){if(c.s.name==='Shelf of Blossoms'&&has(u,'B08'))return alive(c.t)&&f.battle.inRange(u,c.t);},
 beforeCast(f,u,c){if(c.u===u)c.heldBuds=c.resources.Bud||0;},
 primary(f,u,amount,c,kind){
  if(c.u!==u)return amount;
  if(kind==='damage'&&has(u,'B01'))amount+=.15*c.M*c.heldBuds;
  if(kind==='heal'){
   c.budsSpent=has(u,'A08')?0:f.take(u,'Bud');amount+=(has(u,'A08')?.15*c.heldBuds:.25*c.budsSpent)*c.M;
   if(has(u,'C08')&&c.s.name==='Shelf of Blossoms')amount*=.5;
  }
  return amount;
 },
 healAmount(f,u,amount,source,t,o){return source===u&&o.primary&&has(u,'C07')&&f.get(t,'Gifted Nectar:'+u.id)?.value>0?amount*1.1:amount;},
 healed(f,u,source,t,actual,label,o){if(source===u&&label==='Shelf of Blossoms'&&has(u,'A03')&&o.offered>actual)ward(f,u,t,Math.min(.8*f.stats(u).M,.4*(o.offered-actual)),3,'Blossom Overflow');},
 incoming(f,u,raw,actor,t,d){if(t===u&&d.active&&d.primary&&(u.kit.Bud||0)>=(has(u,'A01')?4:3)&&has(u,'B07')&&f.ready(u,'closedGarden',4))return raw*.85;return raw;},
 hitBonus(f,u,bonus,actor,t){return has(u,'C02')&&actor!==u&&allies(u,actor)&&f.get(t,'Guiding Petals')?.source===u.id?bonus+20:bonus;},
 outgoing(f,u,amount,actor,t,d){
  if(!d.basic)return amount;
  if(actor===u&&has(u,'B02')&&(u.kit.Bud||0)>0){const e=f.get(t,'Pollen Lance');if(e?.source===u.id){amount+=.15*f.stats(u).M;e.consumed=(e.consumed||0)+1;if(e.consumed===3&&has(u,'B04'))refund(u,'Petal Lance',1);}}
  if(allies(u,actor)){const e=f.get(actor,'Gifted Nectar:'+u.id);if(e?.value>0){e.value--;if(!e.value)f.remove(actor,e.key);f.after(()=>{f.proc(u,t,(has(u,'C08')?.25:.15)*f.stats(u).M,'magic','Gifted Nectar');if(has(u,'C05')&&f.ready(u,'honeyedBark:'+actor.id,1))ward(f,u,actor,.1*f.stats(u).M,3,'Honeyed Bark');});}}
  return amount;
 },
 landed(f,u,actor,t,result,d){if(has(u,'C04')&&d.basic&&actor.slot>0&&allies(u,actor)){const e=f.get(t,'Guiding Petals');if(e?.source===u.id&&!e.pollinated){e.pollinated=true;f.add(u,'Bud',1,3);}}},
 cast(f,u,c){
  if(c.s.name==='Shelf of Blossoms'&&has(u,'B08')){c.budsSpent=f.take(u,'Bud');c.hit((1.2+.5*c.budsSpent)*c.M);return true;}
  if(c.s.name==='Blooming Antlers'&&has(u,'A06')){c.budsEarly=true;growBuds(f,u,3);c.hit(2.5*c.M);return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit),healing=c.primary?.kind==='heal',spent=c.budsSpent||0;
  const generated=hit&&!c.budsEarly?growBuds(f,u,c.s.name==='Blooming Antlers'?2:1):0;
  if(c.s.name==='Petal Lance'&&hit){
   if(generated&&has(u,'A02')){heal(f,u,u,.2*c.M,'Petal Nectar');if(has(u,'A04'))ward(f,u,f.lowest(u,c.other),.15*c.M,3,'Dew on Petals');}
   if(has(u,'B02'))buff(f,u,c.t,'Pollen Lance','pollenLance',1,3,{harmful:true,consumed:0});
   if(has(u,'C02'))buff(f,u,c.t,'Guiding Petals','guidingPetals',20,3,{harmful:true});
  }
  if(c.s.name==='Blooming Antlers'){
   if(hit&&has(u,'B06'))for(const t of f.nearby(u,c.t,18,3,c.t).filter(t=>t!==c.t))f.direct(u,t,.4*c.M,c.s.name,{category:'magic',active:true,secondary:true,primary:false,area:true,ignoreRange:true});
   if(has(u,'C06'))for(const t of c.other)nectar(f,u,t,1);
  }
  if(c.s.name==='Shelf of Blossoms'&&healing){
   const recipient=c.primary.target;
   if(has(u,'A05')&&(has(u,'A08')?c.heldBuds:spent)>=3){const second=f.lowest(u,c.all.filter(t=>t!==recipient&&t.hp<t.maxHp));heal(f,u,second,.5*c.M,'Second Shelf');}
   if(has(u,'B03')&&spent&&alive(c.t)&&f.battle.inRange(u,c.t)){const result=f.proc(u,c.t,.2*c.M*spent,'magic','Bitter Medicine');if(has(u,'B05'))heal(f,u,u,Math.min(.4*c.M,.2*(result.damage||0)),'Sap Reclaimed');}
   if(has(u,'C03')&&spent)buff(f,u,recipient,'Growing Together','basicTempo',.12,3);
   if(has(u,'C08'))for(const t of c.other)nectar(f,u,t,spent);
  }
  if(healing){
   if(has(u,'C01')&&spent)nectar(f,u,c.primary.target,spent);
   if(has(u,'A07')){if(has(u,'A08')){if((u.kit.Bud||0)<(has(u,'A01')?4:3))f.add(u,'Bud',1,3);else ward(f,u,c.primary.target,.2*c.M,3,'Seed Saving');}else if(spent>=2)f.add(u,'Bud',1,3);}
  }
 }
});
function padding(f,u,t,rate=.12){if(alive(t)&&f.ready(u,'padding:'+t.id,2))buff(f,u,t,'Padding','nextDirectDR',rate,2,{once:true});}
function stuffing(f,u,t){if(!alive(t)||!has(u,'B01'))return;const M=f.stats(u).M,seconds=has(u,'B08')?1e6:3;f.dot(u,t,'Heavy Stuffing:'+u.id,(has(u,'B08')?.28:.18)*M*seconds,seconds,'magic',{ownerRequired:true,label:'Heavy Stuffing',afterTick:r=>{if(has(u,'B07')&&r?.damage)limited(f,u,'dreamSiphon',.15*r.damage,.25*M,n=>heal(f,u,f.lowest(u),n,'Dream Siphon',n));}});}
register('moonrabbit',{
 overchargeAllowed(f,u,s){return s.name==='Pillow Patch'&&has(u,'A08')||s.name==='Dream Quilt'&&has(u,'C08');},
 gate(f,u,c){if(c.s.name==='Pillow Patch'&&has(u,'A08')||c.s.name==='Dream Quilt'&&has(u,'C08'))return c.wardGate(.8);},
 effect(f,u,g){if(g.source===u&&g.key==='Padding'&&has(u,'A01'))g.duration=4;},
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Pillow Patch')c.patchPadded=f.has(c.low,'Padding');},
 primary(f,u,amount,c,kind){
  if(allies(u,c.u)&&['damage','heal','shield'].includes(kind)){const e=f.get(c.u,'Dream Inspiration');if(e?.source===u.id){f.remove(c.u,e.key);amount*=1.2;}}
  if(c.u===u&&kind==='damage'&&c.s.name==='Drowsy Fold'&&has(u,'B06')&&f.has(c.t,'Heavy Stuffing:'+u.id))amount+=.5*c.M;
  return amount;
 },
 healAmount(f,u,amount,source,t,o){return source===u&&o.primary&&has(u,'B08')?amount*.75:amount;},
 defenseConsumed(f,u,t,e){if(e.source!==u.id||e.key!=='Padding')return;if(has(u,'A07')&&f.ready(u,'softRecovery',1))heal(f,u,t,.2*f.stats(u).M,'Soft Recovery');if(has(u,'C01'))buff(f,u,t,'Wake Gently','basicTempo',.12,2);},
 offenseConsumed(f,u,actor,t,e){if(has(u,'C07')&&e.source===u.id&&e.key==='Weakened basic'&&allies(u,t))buff(f,u,t,'Interrupted Rest','flee',20,2);},
 outgoing(f,u,amount,actor,t,d){
  if(!allies(u,actor))return amount;
  if(d.active&&d.primary&&has(u,'C04')){const e=f.get(actor,'Dream Instruction');if(e?.source===u.id&&!e.restedAim){e.restedAim=true;d.penetration=Math.max(d.penetration||0,.06);}}
  if(d.basic){const e=f.remove(actor,'Morning Quilt:'+u.id);if(e)f.after(()=>f.proc(u,t,.2*f.stats(u).M,'magic','Morning Quilt'));}
  return amount;
 },
 expired(f,u,t,p){if(p.source===u.id&&p.label==='Quilt Before the Blow')heal(f,u,t,.35*f.stats(u).M,'Quilt Before the Blow');},
 broken(f,u,actor,t,p){if(p.source!==u.id)return;if(p.label==='Stitched Patch'&&has(u,'A04'))padding(f,u,t,.06);if(p.label==='Quilt Before the Blow')heal(f,u,t,.35*f.stats(u).M,'Quilt Before the Blow');},
 cast(f,u,c){
  if(c.s.name==='Pillow Patch'&&has(u,'A08')){c.shield(c.low,c.M,4);const p=pool(c.low,u,c.s.name);if(p)p.label='Quilt Before the Blow';padding(f,u,c.low);return true;}
  if(c.s.name==='Drowsy Fold'&&has(u,'B08')){c.primary={kind:'utility',amount:0,target:c.t};c.buff(c.t,'Weakened basic','basicWeakness',.35,3,{harmful:true});stuffing(f,u,c.t);return true;}
  if(c.s.name==='Dream Quilt'&&has(u,'C08')){for(const t of c.all){c.shield(t,.7*c.M,4);padding(f,u,t);c.buff(t,'Dream Inspiration','inspiration',.2,4);}return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Pillow Patch'){
   if(has(u,'A02')&&c.patchPadded)ward(f,u,c.low,.2*c.M,3,'Stitched Patch');
   if(has(u,'B02')&&alive(c.t)&&f.battle.inRange(u,c.t))f.proc(u,c.t,(.3+(has(u,'B04')&&f.has(c.t,'Heavy Stuffing:'+u.id)?.2:0))*c.M,'magic','Needled Patch');
   if(has(u,'C02'))buff(f,u,c.low,'Dream Instruction','hit',20,3);
  }
  if(c.s.name==='Drowsy Fold'&&(hit||has(u,'B08'))){
   if(has(u,'A06'))buff(f,u,c.t,'Weakened active','activeWeakness',.12,3,{harmful:true});
   if(!has(u,'B08'))stuffing(f,u,c.t);
   const protectedAlly=f.battle.target(c.t);if(has(u,'C03')&&allies(u,protectedAlly)){const amount=ward(f,u,protectedAlly,.35*c.M,3,'Safe Hand');if(has(u,'C05')&&protectedAlly===c.tr)ward(f,u,u,amount*.5,3,'Tucked Partner');}
  }
  if(c.s.name==='Dream Quilt'){
   if(has(u,'A03')&&!has(u,'C08'))c.heal(f.lowest(u),.4*c.M);
   if(has(u,'A05'))for(const r of c.receivers.filter(r=>r.kind==='heal'&&r.actual>0))f.cleanse(u,r.target,'blind');
   if(has(u,'B03')&&alive(c.t)&&f.battle.inRange(u,c.t)){stuffing(f,u,c.t);if(has(u,'B05')){const next=f.nearby(u,c.t,18,2,c.t).find(t=>t!==c.t);if(next)stuffing(f,u,next);}}
   if(has(u,'C06'))for(const t of c.all)buff(f,u,t,'Morning Quilt:'+u.id,'quiltCharge',1,75);
  }
 }
});
register('mudmole',{
 setRoots(){return true;},
 gate(f,u,c){if(c.s.name==='Earth Pantry'&&has(u,'B08'))return c.wounded(.7);},
 tick(f,u){
  if(u.kit.rootPrevious!==undefined&&u.kit.rootPrevious!==u.kit.originalTarget&&u.kit.rootWasActive&&has(u,'A01'))u.kit.rootCarry=f.battle.time+2;
  u.kit.rootPrevious=u.kit.originalTarget;
  const established=u.kit.rootStarted!=null&&f.battle.time-u.kit.rootStarted>=(has(u,'A01')?1:2)&&alive(f.battle.units.find(t=>t.id===u.kit.originalTarget));
  if(established)u.kit.rootEstablished=true;
  const rooted=established||has(u,'A08')&&u.kit.rootEstablished||has(u,'A01')&&(u.kit.rootCarry||0)>f.battle.time;
  if(rooted){
   buff(f,u,u,'Set Roots','roots',1,.1);
   if(has(u,'C08'))buff(f,u,u,'Roots into Hammers','basicTempo',.2,.1);
   if(!u.kit.rootWasActive)u.kit.oldRootsAt=f.battle.time+4;
   if(has(u,'A07')&&f.battle.time+1e-8>=u.kit.oldRootsAt){u.kit.oldRootsAt+=4;heal(f,u,u,.02*u.maxHp,'Old Roots');f.cleanse(u,u,'tempo');}
  }else{f.remove(u,'Set Roots');u.kit.harvestCount=0;}
  u.kit.rootWasActive=!!rooted;
 },
 incoming(f,u,raw,actor,t,d){
  if(actor?.side===u.side||d.direct===false||d.dot)return raw;
  if(f.has(u,'Set Roots')&&!has(u,'C08')){if(t===u)raw*=has(u,'A08')?.82:.88;else if(t===f.trainer(u)&&has(u,'B08'))raw*=.94;}
  if(t===u&&d.basic&&has(u,'A04')){const p=pool(u,u,'Root-Mitten Thump');if(p&&!p.hardKnuckles){p.hardKnuckles=true;raw*=.8;}}return raw;
 },
 shield(f,u,g){if(g.source===u&&g.label==='Root-Mitten Thump'&&has(u,'A02')&&f.has(u,'Set Roots'))g.duration+=1;},
 shielded(f,u,source,t,amount,label,p,o){
  if(source!==u||o.talent)return;
  if(label==='Root-Mitten Thump'&&t===u&&has(u,'B02'))ward(f,u,f.trainer(u),amount*.5,p.until-f.battle.time,"Trainer's Mittens");
  if(label==='Tuber Rampart'&&has(u,'A06'))ward(f,u,u,amount*.4,p.until-f.battle.time,'Underground Brace');
 },
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Root-Mitten Thump')c.harvestRampart=spend(u,'harvestRampart');},
 hitBonus(f,u,bonus,actor,t){
  if(actor===u&&f.currentCompanionCast?.u===u&&f.currentCompanionCast.harvestRampart)bonus+=25;
  if(has(u,'B04')&&actor!==u&&allies(u,actor)&&f.get(actor,'Shared Soil')?.source===u.id&&t===f.battle.target(u))bonus+=15;return bonus;
 },
 primary(f,u,amount,c,kind){if(c.u===u&&kind==='damage'&&c.s.name==='Root-Mitten Thump'){amount+=c.harvestRampart||0;if(has(u,'C02')&&f.has(u,'Set Roots')){c.stoneMitten=true;amount+=Math.min(.02*c.H,.45*c.A);}}return amount;},
 outgoing(f,u,amount,actor,t,d){
  if(actor!==u)return amount;const {A}=f.stats(u);
  if(has(u,'A08'))amount*=.8;
  if(d.basic){
   if(has(u,'C01')&&f.has(u,'Set Roots')){u.kit.harvestCount=(u.kit.harvestCount||0)+1;if(u.kit.harvestCount%3===0){amount+=.45*A;if(has(u,'C07'))for(const next of f.nearby(u,t,18,3,t).filter(v=>v!==t))f.after(()=>f.proc(u,next,.225*A,'melee','Whole Field'));}}
   if(u.kit.workingLunch>0){u.kit.workingLunch--;amount+=.25*A;if(!u.kit.workingLunch&&has(u,'C05'))f.after(()=>heal(f,u,u,.25*A,'Fed for Work'));}
  }
  return amount;
 },
 damaged(f,u,actor,t,amount,absorbed,d){if(actor===u&&has(u,'C08')&&f.has(u,'Set Roots')&&d.primary&&d.category!=='magic'&&!d.proc)limited(f,u,'hammerHealing',.15*amount,.03*u.maxHp,n=>heal(f,u,u,n,'Roots into Hammers',n));},
 healed(f,u,source,t,actual,label,o){if(source===u&&label==='Earth Pantry'&&has(u,'A05')&&o.offered>actual){const c=f.currentCompanionCast,extra=Math.min(.05*u.maxHp-(c?.cellarReserve||0),o.offered-actual);if(c)c.cellarReserve=(c.cellarReserve||0)+extra;ward(f,u,u,extra,3,'Cellar Reserves',{accumulate:true,cap:.05*u.maxHp});}},
 broken(f,u,actor,t,p){if(p.source===u.id&&p.label==='Tuber Rampart'&&has(u,'B07'))heal(f,u,t,.03*u.maxHp,'Sealed Cellar');},
 cast(f,u,c){if(c.s.name==='Earth Pantry'){const amount=(.1+(has(u,'A03')&&c.hp()<.5?.03:0))*c.H*(has(u,'B08')?.5:1);for(const t of has(u,'B08')?c.all:[u])c.heal(t,amount);if(f.has(u,'Set Roots'))c.cleanse(u,'dot');return true;}},
 afterCast(f,u,c){
  if(c.u!==u)return;
  if(c.s.name==='Root-Mitten Thump'){
   if(has(u,'B04'))for(const t of c.other.filter(t=>t.slot>0))buff(f,u,t,'Shared Soil','conditionalHit',15,3);
   if(c.stoneMitten&&has(u,'C04')&&c.results.some(r=>r.primary&&r.hit))buff(f,u,c.t,'Crushed Clod','physicalExposure',.05,3,{harmful:true});
  }
  if(c.s.name==='Earth Pantry'){
   if(has(u,'B01'))heal(f,u,c.tr,.03*c.H,'Communal Pantry');
   if(has(u,'B06')&&f.has(u,'Set Roots'))f.cleanse(u,c.tr,'dot');
   if(has(u,'C03'))u.kit.workingLunch=2;
  }
  if(c.s.name==='Tuber Rampart'){
   if(has(u,'B03'))buff(f,u,c.tr,'Rainproof Rampart','dotDR',.3,4);
   if(has(u,'B05')&&c.hp(c.tr)<.5&&!u.kit.emergencyStores){u.kit.emergencyStores=true;heal(f,u,c.tr,.04*c.H,'Emergency Stores');}
   if(has(u,'C06'))u.kit.harvestRampart=.6*c.A;
  }
 }
});
register('obsidianram',{
 looseAssembly(){return true;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Fragment'&&has(u,'A01')?3:max;},
 gate(f,u,c){if(c.s.name==='Rattle Refit'&&has(u,'C08'))return c.wounded(.65);},
 tick(f,u){if(has(u,'B07')&&u.hp<u.maxHp*.4&&!u.kit.reconstructionBudget){u.kit.reconstructionBudget=true;f.add(u,'Fragment',2,2);}},
 incoming(f,u,raw,actor,t,d){return t===u&&has(u,'B08')&&d.direct!==false&&!d.dot?raw*(1-.05*(u.kit.Fragment||0)):raw;},
 effect(f,u,g){if(g.source===u&&g.key==='Cairn Hammer'&&has(u,'B06'))g.value=-.2;},
 effected(f,u,source,t,e){if(source===u&&e.key==='Cairn Hammer'&&has(u,'C03'))buff(f,u,t,'Pebble Vow','magicDamage',e.value*.5,e.until-f.battle.time,{harmful:true});},
 damaged(f,u,actor,t,amount,absorbed,d){
  if(t===u&&actor?.side!==u.side&&!d.transfer&&!d.debt&&amount>0){const threshold=(has(u,'B01')?.09:.12)*u.maxHp;u.kit.lossBank=(u.kit.lossBank||0)+amount;if(u.kit.lossBank>=threshold){u.kit.lossBank-=threshold;f.add(u,'Fragment',1,2);}}
  if(has(u,'C05')&&t===f.trainer(u)&&amount+absorbed>0&&alive(t)){const e=f.get(actor,'Cairn Hammer');if(e?.source===u.id&&!e.smallCairn){e.smallCairn=true;ward(f,u,t,.02*u.maxHp,3,'Small Cairn');}}
 },
 healed(f,u,source,t,actual,label,o){
  if(t===u&&source!==u&&allies(u,source)&&o.primary&&has(u,'C07')&&actual>=.03*u.maxHp&&f.ready(u,'piecesKindness',4))f.add(u,'Fragment',1,2);
  if(source===u&&label==='Rattle Refit'&&f.currentCompanionCast?.u===u)f.currentCompanionCast.refitOverheal=Math.max(0,o.offered-actual);
 },
 hitBonus(f,u,bonus,actor,t){return has(u,'C02')&&allies(u,actor)&&f.get(t,'Helping Hand')?.source===u.id?bonus+20:bonus;},
 outgoing(f,u,amount,actor,t,d){
  if(actor===u&&d.basic&&u.kit.aggressiveRefit){amount+=spend(u,'aggressiveRefit');if(has(u,'A05'))f.after(()=>f.add(u,'Fragment',1,2));}
  if(actor===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Helping Hand');if(e?.source===u.id&&!e.guided){e.guided=true;f.after(()=>heal(f,u,u,.02*u.maxHp,'Guided Knuckles'));}}
  return amount;
 },
 landed(f,u,actor,t,result,d){if(actor===u&&d.basic&&has(u,'A07')&&(u.kit.talentBasics||0)%4===0&&f.ready(u,'borrowedBone',3))f.add(u,'Fragment',1,2);},
 cast(f,u,c){
  if(c.s.name==='Great-Arm Clout'){c.fragmentsSpent=has(u,'B08')?0:c.take('Fragment',has(u,'A08')?Infinity:has(u,'A02')?2:1);c.hit((1.45+(has(u,'A08')?.7:.35)*c.fragmentsSpent*(has(u,'C08')?.5:1))*c.A);return true;}
  if(c.s.name==='Rattle Refit'){c.fragmentsSpent=c.take('Fragment');c.heal(has(u,'C08')?c.low:u,(.05+.03*c.fragmentsSpent*(has(u,'A08')?.5:1))*c.H);return true;}
  if(c.s.name==='Cairn Hammer'){c.hit(2.4*c.A*(has(u,'B06')?.8:1));c.debuff('Cairn Hammer','physicalPower',-.15,3);if(has(u,'A06'))c.splash(.2*c.A*c.r('Fragment'));return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const spent=c.fragmentsSpent||0,hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Great-Arm Clout'&&spent){
   if(hit&&spent>=2&&has(u,'A04'))buff(f,u,c.t,'Crushed Assembly','physicalExposure',.07,3,{harmful:true});
   if(has(u,'B02')){heal(f,u,u,.02*c.H,'Mended Clout');if(has(u,'B04'))buff(f,u,u,'Loose Knuckle','basicDR',.2,2,{once:true});}
   if(hit&&has(u,'C02'))buff(f,u,c.t,'Helping Hand','helpingHand',20,3,{harmful:true});
  }
  if(c.s.name==='Rattle Refit'){
   if(has(u,'A03'))u.kit.aggressiveRefit=.3*c.A*Math.min(3,spent);
   const shield=(has(u,'B03')?.02*c.H*spent:0)+(has(u,'B05')?Math.min(.04*c.H,.5*(c.refitOverheal||0)):0);if(shield)ward(f,u,has(u,'C08')?c.primary.target:u,shield,3,'Wrapped Ribs');
   if(has(u,'C01')&&spent)ward(f,u,c.tr,.02*c.H*spent,3,'Gifted Fragment');
   if(has(u,'C06')&&spent)heal(f,u,f.lowest(u,c.other),.01*c.H*spent,'Shared Reconstruction');
  }
 }
});
const closeToTrainer=(f,u)=>!!f.trainer(u)&&u.targetId===f.trainer(u).targetId;
function puppyTarget(f,u){const tr=f.trainer(u),target=tr&&f.battle.target(tr);return f.enemies(u).find(t=>t===target&&f.get(t,'Loyal Bark')?.source===u.id)||f.enemies(u).find(t=>f.get(t,'Loyal Bark')?.source===u.id)||target||f.battle.target(u);}
function commandedBasic(f,actor,t,scale,label){if(!alive(actor)||!alive(t)||!f.battle.inRange(actor,t))return;const category=actor.basicCategory,power=actor.power*(1+(actor.growth?.attack||0))*(1+f.value(actor,category==='magic'?'magicPower':'physicalPower'));return f.proc(actor,t,power*scale,category,label,{basic:true,blockable:actor.delivery==='ranged'});}
register('pebblepup',{
 stayClose(){return true;},
 support(f,u,s){if(s.name==='Stone Fetch'&&has(u,'C08'))return true;},
 gate(f,u,c){if(c.s.name==='Stone Fetch'&&has(u,'C08')){const t=puppyTarget(f,u);return alive(t)&&c.all.some(ally=>f.battle.inRange(ally,t));}},
 tick(f,u){
  const same=closeToTrainer(f,u),first=f.battle.target(u),second=f.trainer(u)&&f.battle.target(f.trainer(u)),a=first&&f.battle.target(first),b=second&&f.battle.target(second);
  const protects=same||has(u,'B01')&&allies(u,a)&&a===b;u.kit.closeProtection=!!protects;if(protects)u.kit.closeUntil=f.battle.time+2;
  if(has(u,'C07')&&same&&first&&!first.temporary&&!u.kit['packReunion:'+first.id]){u.kit['packReunion:'+first.id]=true;buff(f,u,first,'Loyal Bark','ownerDamage',.1,2,{harmful:true});}
 },
 incoming(f,u,raw,actor,t,d){
  if(actor?.side===u.side||d.direct===false||d.dot)return raw;
  if(t===u&&(u.kit.closeProtection||closeToTrainer(f,u)||has(u,'B07')&&(u.kit.closeUntil||0)>f.battle.time))raw*=.9;
  const e=f.get(actor,'Distracting Paw');if(has(u,'C02')&&d.basic&&t!==u&&allies(u,t)&&e?.source===u.id){f.remove(actor,e.key);raw*=.8;if(has(u,'C04'))f.after(()=>heal(f,u,t,.02*u.maxHp,'Nose for Trouble'));}return raw;
 },
 beforeCast(f,u,c){if(c.u===u)c.pupClose=closeToTrainer(f,u);},
 primary(f,u,amount,c,kind){if(c.u===u&&kind==='damage'&&c.s.name==='Paddle-Paw'&&c.pupClose&&has(u,'A02'))amount+=.3*c.A;return amount;},
 hitBonus(f,u,bonus,actor,t){
  if(has(u,'C01')&&actor.slot>0&&allies(u,actor)&&f.get(t,'Loyal Bark')?.source===u.id)bonus+=20;
  if(has(u,'A04')&&(actor===u||actor===f.trainer(u))&&f.get(t,'Mud on the Paw')?.source===u.id)bonus+=20;
  if(actor===u&&!closeToTrainer(f,u)&&u.kit.neverDrop&&t===f.battle.target(u))bonus+=15;return bonus;
 },
 outgoing(f,u,amount,actor,t,d){
  const bark=f.get(t,'Loyal Bark');
  if(actor===u&&d.basic){const close=closeToTrainer(f,u)||u.kit.neverDrop&&t===f.battle.target(u);if(close&&has(u,'A01')&&f.ready(u,'togetherBite',1))amount+=.15*f.stats(u).A;if(u.kit.neverDrop&&t===f.battle.target(u))u.kit.neverDrop=false;}
  if(actor===f.trainer(u)&&d.basic&&has(u,'A03')&&bark?.source===u.id){amount*=1.1;if(has(u,'A05')&&!bark.returnThrow){bark.returnThrow=true;charge(f,u,u,'Return the Throw',.3*f.stats(u).A);}}
  return amount;
 },
 landed(f,u,actor,t,result,d){
  if(actor===u||actor===f.trainer(u)){u.kit.fetchHits||={};u.kit.fetchHits[t.id]||={};u.kit.fetchHits[t.id][actor===u?'pup':'trainer']=f.battle.time;}
  if(actor===f.trainer(u)&&d.basic&&has(u,'A08')&&closeToTrainer(f,u)){
   u.kit.sharedTrainerBasics=(u.kit.sharedTrainerBasics||0)+1;if(u.kit.sharedTrainerBasics%3===0&&f.battle.inRange(u,t)&&f.ready(u,'twoFangs',2))commandedBasic(f,u,t,.6,'One Mind, Two Fangs');
  }
 },
 death(f,u,actor,t){if(has(u,'A07')&&t.side!==u.side&&!t.temporary&&t.id===u.kit.originalTarget&&f.trainer(u)?.targetId===t.id)u.kit.neverDrop=true;},
 shielded(f,u,source,t,amount,label,p,o){if(source!==u||o.talent)return;if(label==='Loyal Bark'&&has(u,'B03'))ward(f,u,u,amount*.5,3,'Bedrock Bark');if(label==='Stone Fetch'&&t===u&&has(u,'C03'))ward(f,u,f.trainer(u),amount*.5,3,'Encouraging Fetch');},
 broken(f,u,actor,t,p){if(p.source!==u.id)return;if(p.label==='Loyal Bark'&&t===f.trainer(u)&&has(u,'B05'))buff(f,u,u,'Reassuring Growl','dr',.15,2);if(p.label==='Encouraging Fetch'&&has(u,'C05'))charge(f,u,t,'Good Catch',.3*f.stats(u).A);},
 cast(f,u,c){
  if(c.s.name!=='Stone Fetch')return;
  if(has(u,'C08')){c.primary={kind:'utility',amount:0,target:u};const t=puppyTarget(f,u);for(const ally of c.all)commandedBasic(f,ally,t,.7,'Everybody Fetch');}
  else {const target=c.tr&&c.b.target(c.tr),t=alive(target)&&c.b.inRange(u,target)?target:c.t,hits=u.kit.fetchHits?.[t.id],heavy=has(u,'A06')&&hits?.pup>=c.b.time-2&&hits?.trainer>=c.b.time-2;c.hit((2.7+(heavy?.6:0))*c.A*(has(u,'B08')?.5:1),{target:t});}
  if(!has(u,'A08'))c.selfward(.05*c.H);
  if(has(u,'B08')&&alive(c.tr))buff(f,u,u,'Intercept','intercept',.25,4,{target:c.tr.id,singleTarget:true});
  return true;
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Paddle-Paw'){
   if(hit&&c.pupClose&&has(u,'A04'))buff(f,u,c.t,'Mud on the Paw','conditionalHit',20,3,{harmful:true});
   if(has(u,'B02')&&pool(c.tr,u,'Loyal Bark')){heal(f,u,u,.02*c.H,'Padded Paw');if(has(u,'B04'))buff(f,u,u,'Careful Step','nextActiveDR',.15,3,{once:true});}
   if(hit&&has(u,'C02'))buff(f,u,c.t,'Distracting Paw','distractingPaw',.2,3,{harmful:true});
  }
  if(c.s.name==='Stone Fetch'&&has(u,'B06')&&c.pupClose)heal(f,u,u,.04*c.H,'Stone Nap');
  if(c.s.name==='Loyal Bark'&&has(u,'C06')){const t=c.tr&&c.b.target(c.tr);if(alive(t))buff(f,u,t,'Weakened active','activeWeakness',.12,3,{harmful:true});}
 }
});
const pyreBurn=(f,u,t)=>f.get(t,'Mane Burn:'+u.id);
const burning=(f,t)=>!!t&&(Object.values(t.effects||{}).some(e=>e.kind==='dot'&&e.until>f.battle.time&&/Burn|Ember|burn/i.test(e.key))||f.battle.has(t,'burn'));
function maneBurn(f,u,t){
 if(!alive(t))return;const {A}=f.stats(u),duration=has(u,'B08')?1e6:has(u,'B01')?4:2,tick=.2*A*(has(u,'B08')?2:1);
 f.dot(u,t,'Mane Burn:'+u.id,tick*duration,duration,'magic',{ownerRequired:true,label:'Mane Burn',extensions:0,oiled:false,
  tickAmount:e=>e.value*(has(u,'B03')&&f.has(u,'Feral Stoke')?1.4:1),
  afterTick:()=>{if(has(u,'C04')&&pyreBurn(f,u,t)?.warning&&f.ready(u,'warmTrail',2))ward(f,u,f.trainer(u),.01*u.maxHp,3,'Warm Trail');}});
}
register('pyrewolf',{
 tick(f,u){const tr=f.trainer(u);if(has(u,'C07')&&alive(tr)&&tr.hp<tr.maxHp*.5&&!u.kit.packSurvival){u.kit.packSurvival=true;refund(u,'Feral Stoke',3);}},
 shield(f,u,g){if(g.source===u&&g.target===u&&g.label==='Fed by Embers'&&has(u,'C01')&&!g.options.talent)ward(f,u,f.trainer(u),.06*u.maxHp,3,'Ember Escort');},
 effect(f,u,g){if(g.source===u&&g.key==='Feral Stoke'&&has(u,'C08')){g.kind='emberStoke';g.value=1;}},
 incoming(f,u,raw,actor,t,d){
  if(t===u&&d.basic&&has(u,'B07')&&f.enemies(u).some(t=>pyreBurn(f,u,t)))raw*=.88;
  if(t===f.trainer(u)&&d.direct!==false&&!d.dot&&has(u,'C02')&&pyreBurn(f,u,actor)?.warning)raw*=.9;return raw;
 },
 beforeCast(f,u,c){
  if(c.u!==u)return;
  if(c.s.kind==='hit'&&u.kit.stokedAccuracy){c.stokedAccuracy=true;u.kit.stokedAccuracy=false;}
  if(c.s.name==='Pyre Fang'){c.pyreBurning=burning(f,c.t);c.ownBurn=pyreBurn(f,u,c.t);}
 },
 hitBonus(f,u,bonus,actor){return actor===u&&f.currentCompanionCast?.u===u&&f.currentCompanionCast.stokedAccuracy?bonus+35:bonus;},
 outgoing(f,u,amount,actor,t,d){
  if(actor===u&&d.active&&d.primary&&f.currentCompanionCast?.stokedAccuracy)d.penetration=Math.max(d.penetration||0,.05);
  if(actor===f.trainer(u)&&d.active&&d.primary){
   if(has(u,'A07')&&!u.kit.borrowedSpark&&t===f.battle.target(u)){u.kit.borrowedSpark=true;charge(f,u,u,'Borrowed Spark',.4*f.stats(u).A);}
   const e=f.get(actor,'Shared Stoke');if(has(u,'C05')&&e?.source===u.id&&!e.courage){e.courage=true;ward(f,u,u,.03*u.maxHp,3,'Courage from Flame');}
  }
  return amount;
 },
 landed(f,u,actor,t,result,d){
  if(actor!==u||!d.basic||!has(u,'B02'))return;const e=pyreBurn(f,u,t);
  if(e&&(e.extensions||0)<2){e.extensions=(e.extensions||0)+.5;f.extendDot(u,t,e.key,.5);if(has(u,'B04')&&f.ready(u,'sootFeeding',1))heal(f,u,u,.01*u.maxHp,'Soot Feeding');}
 },
 cast(f,u,c){
  if(c.s.name==='Mane Lash'){
   if(has(u,'B08')){c.primary={kind:'utility',amount:0,target:c.t};if(c.markHit())maneBurn(f,u,c.t);}
   else{c.hit(1.3*c.A);if(c.results[0]?.hit)maneBurn(f,u,c.t);}return true;
  }
  if(c.s.name==='Pyre Fang'){
   let bonus=0;if(u.kit.fangPrimer?.target===c.t.id){bonus=u.kit.fangPrimer.amount*(has(u,'A04')&&f.has(u,'Fed by Embers')?2:1);u.kit.fangPrimer=null;}
   c.hit(((c.pyreBurning?3.4:2.7)*c.A+bonus)*(has(u,'C06')?.8:1));
   if(has(u,'A08')&&c.ownBurn&&c.results[0]?.hit){const e=c.ownBurn;f.remove(c.t,e.key);const ticks=Math.max(0,Math.floor(e.until-e.next+1e-8)+1),amount=e.tickAmount?e.tickAmount(e):e.value;for(let i=0;i<ticks&&alive(c.t)&&!f.battle.ended;i++)f.battle.damage(u,c.t,amount,'All at Once',false,{category:'magic',dot:true,direct:false,proc:true});refund(u,'Mane Lash',2);}
   return true;
  }
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.find(r=>r.primary&&r.hit);
  if(c.s.kind==='hit'){
   u.kit.earlyEmbers=(u.kit.earlyEmbers||0)+1;if(has(u,'A01')&&u.kit.earlyEmbers>=3)root.BondCombatPassives.flare(f,u);
   const fed=f.get(u,'Fed by Embers');if(has(u,'A05')&&f.has(u,'Feral Stoke')&&fed&&(u.kit.stokeExtensions||0)<2){u.kit.stokeExtensions=(u.kit.stokeExtensions||0)+1;fed.until+=1;}
  }
  if(c.s.name==='Mane Lash'&&(hit||c.statusLanded)){
   if(has(u,'A02'))u.kit.fangPrimer={target:c.t.id,amount:.4*c.A};
   if(has(u,'C02')){const e=pyreBurn(f,u,c.t);if(e)e.warning=true;}
  }
  if(c.s.name==='Feral Stoke'){
   if(has(u,'A03'))u.kit.stokedAccuracy=true;
   if(has(u,'B05')){const next=f.nearby(u,c.t,18,2,c.t).find(t=>t!==c.t);if(next)maneBurn(f,u,next);}
   if(has(u,'C03')){buff(f,u,c.tr,'Shared Stoke','physicalPower',.075,3);buff(f,u,c.tr,'Shared Stoke aim','hit',15,3);}
   if(has(u,'C08'))for(const t of c.all){ward(f,u,t,.04*c.H,3,'Bonfire for the Pack');buff(f,u,t,'Bonfire cadence','basicTempo',.15,3);}
  }
  if(c.s.name==='Pyre Fang'&&c.pyreBurning){
   if(hit&&has(u,'A06'))heal(f,u,u,Math.min(.04*c.H,.15*hit.damage),'Ravenous Fang');
   if(hit&&has(u,'B06')){const e=pyreBurn(f,u,c.t);if(e&&!e.oiled){e.oiled=true;e.value*=1.25;}}
   if(has(u,'C06'))ward(f,u,f.lowest(u,c.other),.04*c.H,3,'Fang Ward');
  }
 }
});
register('rainram',{
 prepare(f,u){u.kit.condensationAt=f.battle.time+3;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Water'?(has(u,'A01')?.16:.1)*u.maxHp:max;},
 support(f,u,s){if(s.name==='Open the Cistern')return !has(u,'B08');},
 gate(f,u,c){if(c.s.name==='Open the Cistern'){if(has(u,'B08'))return alive(c.t);if(has(u,'A08'))return c.wardGate();}},
 overchargeAllowed(f,u,s){if(s.name==='Open the Cistern'&&(has(u,'A08')||has(u,'B08')))return true;},
 tick(f,u){if(has(u,'A07')&&f.battle.time>=u.kit.condensationAt){u.kit.condensationAt+=3;if(u.shield>0)f.add(u,'Water',.01*u.maxHp,.1*u.maxHp);}},
 shield(f,u,g){if(g.source!==u||g.label!=='Heavy Lid')return;if(g.target===u&&has(u,'A03'))g.duration+=1;if(g.target===f.trainer(u)&&has(u,'C06')){g.amount+=.4*f.stats(u).M;g.duration+=1;}},
 absorbed(f,u,a,t,p,n,d){if(has(u,'A03')&&t===u&&p.source===u.id&&p.label==='Heavy Lid'&&!d.transfer&&!d.debt)f.add(u,'Water',n*.1,.1*u.maxHp);},
 broken(f,u,a,t,p){if(t!==u||p.source!==u.id||p.label!=='Heavy Lid')return;if(has(u,'A05'))f.after(()=>heal(f,u,u,.03*u.maxHp,'Rain Behind Stone'));if(has(u,'B05'))f.after(()=>f.proc(u,a,.4*f.stats(u).M,'magic','Steam Burst'));},
 incoming(f,u,raw,a,t,d){if(t===u&&d.basic&&has(u,'A04')){const p=pool(u,u,'Lidded Jet');if(p&&!p.cushioned){p.cushioned=true;raw*=.8;}}return raw;},
 cast(f,u,c){
  if(c.s.name==='Gutter Jet'){
   c.waterSpent=has(u,'B01')?c.take('Water',.6*c.M):0;const bonus=spend(u,'hissingLid'),amount=(1.2*c.M+c.waterSpent+bonus)*(has(u,'C02')?.75:1);c.hit(amount);c.add('Water',(has(u,'C01')?.5:.25)*c.M,.1*c.H);
   if(has(u,'B02')&&c.waterSpent)c.debuff('Hot Gutter','magicExposure',.06,3);
   if(has(u,'B04')&&c.waterSpent&&c.results[0]?.hit)heal(f,u,u,.2*c.results[0].damage*c.waterSpent/Math.max(1,1.2*c.M+c.waterSpent+bonus),'Boiling Return',.2*c.M);
   if(has(u,'C02')&&c.results[0]?.hit){const t=f.lowest(u);heal(f,u,t,.3*c.M,'Gentle Jet');if(has(u,'C04'))buff(f,u,t,'Mist Guard','flee',15,2);}
   if(has(u,'A02')&&c.r('Water')>=(has(u,'A01')?.08:.05)*c.H)ward(f,u,u,.3*c.M,3,'Lidded Jet');return true;
  }
  if(c.s.name==='Open the Cistern'){
   c.waterSpent=c.take('Water',c.r('Water')*(has(u,'A06')?.75:1));let base=.9*c.M;
   if(has(u,'C07')&&c.low===c.tr&&c.hp(c.tr)<.4&&!u.kit.emergencyRain&&!has(u,'A08')&&!has(u,'B08')){u.kit.emergencyRain=true;base*=1.5;}
   if(has(u,'B08'))c.hit(c.M+Math.min(2*c.M,c.waterSpent));
   else if(has(u,'A08')){const amount=1.25*(base+c.waterSpent);c.shield(c.low,amount,4);ward(f,u,u,.5*amount,4,'Pressure-Sealed Tank');}
   else if(has(u,'C08')){const hurt=c.all.filter(t=>t.hp<t.maxHp);for(const t of c.all)c.heal(t,base+(hurt.includes(t)?c.waterSpent/Math.max(1,hurt.length):0));}
   else{const n=c.heal(c.low,base+c.waterSpent);if(has(u,'C03'))heal(f,u,f.lowest(u,c.all.filter(t=>t!==c.low&&t.hp<t.maxHp)),n*.25,'Split Spout',.75*c.M);}
   if(has(u,'B06'))c.splash(Math.min(.5*c.M,.2*c.waterSpent),18,2,'magic');return true;
  }
 },
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Open the Cistern'&&has(u,'C05')){const c=f.currentCompanionCast,remaining=Math.max(0,.04*u.maxHp-(c?.returnedRain||0)),gain=Math.min(remaining,.5*Math.max(0,o.offered-n));if(c)c.returnedRain=(c.returnedRain||0)+gain;f.add(u,'Water',gain,.1*u.maxHp);}},
 afterCast(f,u,c){if(c.u!==u)return;if(c.s.name==='Heavy Lid'&&has(u,'B03'))u.kit.hissingLid=.5*c.M;if(c.primary?.kind==='damage'&&has(u,'B07'))c.add('Water',.2*c.M,.1*c.H);}
});
function precision(f,u,add=0){u.kit.precisions=(u.kit.precisions||[]).filter(t=>t>f.battle.time);if(add&&u.kit.precisions.length<(has(u,'A07')?2:1))u.kit.precisions.push(f.battle.time+(has(u,'A07')?4:3));return u.kit.precisions;}
function currentStep(f,u,n=1){u.kit.currentSteps=(u.kit.currentSteps||0)+n;if(u.kit.currentSteps>=3){u.kit.currentSteps-=3;precision(f,u,1);}}
function spendPrecision(f,u){if(!precision(f,u).length)return false;u.kit.precisions.shift();if(has(u,'B08'))u.kit.currentHits=Math.max(0,(u.kit.currentHits||0)-1);return true;}
const silver=(f,u)=>f.has(u,'Silver Current aim');
function openRill(f,u,t,extra=0){const keys=Object.values(t.effects||{}).filter(e=>e.source===u.id&&e.key.startsWith('Open Rill:')&&e.until>f.battle.time);if(has(u,'C08')&&keys.length>=3){keys.sort((a,b)=>a.until-b.until);f.remove(t,keys[0].key);}const key='Open Rill:'+u.id+(has(u,'C08')?':'+(++f.sequence):'');f.dot(u,t,key,.12*f.stats(u).A*(4+extra),4+extra,'melee',{ownerRequired:true,label:'Open Rill'});}
const rillWounds=(f,u,t)=>Object.values(t?.effects||{}).filter(e=>e.source===u.id&&e.key.startsWith('Open Rill:')&&e.until>f.battle.time);
register('ripplelynx',{
 cleanCurrent(){return true;},
 beforeCast(f,u,c){if(c.u===u&&c.s.kind==='hit'){c.rillPrecision=spendPrecision(f,u);c.mods.precision=c.rillPrecision;}},
 primary(f,u,amount,c,kind){if(c.u!==u||kind!=='damage')return amount;if(c.rillPrecision)amount+=(.6+(c.s.name==='Fin Carve'&&has(u,'A02')?.25:0)+(c.s.name==='Rill Sever'&&has(u,'A06')?.5:0))*c.A;if(c.s.name==='Rill Sever')amount*=(has(u,'B06')?.85:1)*(has(u,'C08')?.5:1);return amount;},
 outgoing(f,u,amount,a,t,d){
  if(a===u&&d.basic&&has(u,'A08')&&spendPrecision(f,u)){f.after(()=>{f.proc(u,t,.65*f.stats(u).A,'melee','Perfect Stream');currentStep(f,u);if(has(u,'B01'))heal(f,u,u,.35*f.stats(u).A,'Restorative Flow');});}
  if(a===f.trainer(u)&&d.basic&&has(u,'C05')){const e=f.get(a,'Shared Current aim');if(e?.source===u.id&&!e.guided){e.guided=true;charge(f,u,u,'Guided Fin',.25*f.stats(u).A);}}return amount;
 },
 landed(f,u,a,t,r,d){if(a!==u||!d.basic)return;currentStep(f,u);if(has(u,'A05')&&r.critical&&silver(f,u)&&!u.kit.polishedFlow){u.kit.polishedFlow=true;currentStep(f,u);}},
 missed(f,u,a,t,d){if(a===u&&d.basic)u.kit.currentSteps=has(u,'A01')?Math.max(0,(u.kit.currentSteps||0)-1):0;if(t===u&&d.basic&&silver(f,u)&&has(u,'B05')&&!u.kit.turnWake){u.kit.turnWake=true;currentStep(f,u);}},
 damaged(f,u,a,t,n,absorbed,d){if(t===u&&has(u,'B08')&&silver(f,u)&&d.direct!==false&&!d.dot&&n+absorbed>0){u.kit.currentHits=(u.kit.currentHits||0)+1;if(u.kit.currentHits>=2){f.remove(u,'Silver Current aim');f.remove(u,'Silver Current evasion');f.remove(u,'Current Cushion');}}},
 expired(f,u,t,p){if(t===u&&p.source===u.id&&has(u,'B07')&&p.amount>0&&f.ready(u,'calmCuts',3))heal(f,u,u,p.amount*.3,'Calm Between Cuts',.03*u.maxHp);},
 death(f,u,a,t){if(has(u,'C07')&&!t.temporary&&t.side!==u.side&&rillWounds(f,u,t).length&&f.ready(u,'washedAway',3))precision(f,u,1);},
 effect(f,u,g){if(g.source!==u)return;if(g.key.startsWith('Silver Current')&&has(u,'B08'))g.duration=6;if(g.key==='Rill Sever'&&has(u,'C02'))g.value=-.35;},
 afterCast(f,u,c){
  if(c.u!==u)return;const r=c.results.find(r=>r.primary&&r.hit);
  if(c.rillPrecision&&has(u,'B01'))heal(f,u,u,.35*c.A*(c.s.name==='Fin Carve'&&has(u,'B04')?2:1),'Restorative Flow');
  if(c.s.name==='Fin Carve'){
   if(c.rillPrecision&&has(u,'A04'))refund(u,'Silver Current',1);
   if(r&&silver(f,u)&&has(u,'B02'))ward(f,u,u,.3*c.A,3,'Shimmering Carve');
   if(r&&has(u,'C01'))openRill(f,u,c.t,has(u,'C04')&&r.critical?2:0);
  }
  if(c.s.name==='Silver Current'){u.kit.polishedFlow=false;u.kit.turnWake=false;u.kit.currentHits=0;if(has(u,'A03'))currentStep(f,u);if(has(u,'B03'))buff(f,u,u,'Current Cushion','nextActiveDR',.2,has(u,'B08')?6:3,{once:true});if(has(u,'C03')){buff(f,u,c.tr,'Shared Current aim','hit',12.5,has(u,'B08')?6:3);buff(f,u,c.tr,'Shared Current evasion','flee',10,has(u,'B08')?6:3);}}
  if(c.s.name==='Rill Sever'){
   if(c.rillPrecision&&has(u,'B06'))ward(f,u,u,.7*c.A,3,'Measured Sever');
   if(r&&has(u,'C06')&&rillWounds(f,u,c.t).length){for(const t of f.nearby(u,c.t,18,3,c.t).filter(t=>t!==c.t).slice(0,2))openRill(f,u,t);if(!has(u,'C08'))openRill(f,u,c.t);}
   if(r&&has(u,'C08'))openRill(f,u,c.t);
  }
 }
});
function seedSpend(f,u,n){if(n&&has(u,'B01'))ward(f,u,u,.01*u.maxHp*n,3,'Husk Padding');}
function kernels(f,u,t,n){if(alive(t))buff(f,u,t,'Shared Kernels:'+u.id,'kernels',Math.min(3,n),75);}
register('seedhare',{
 packedPod(){return true;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Seeds'?(has(u,'A01')?5:3):max;},
 support(f,u,s){if(s.name==='Splitpod Salvo'&&has(u,'C08'))return true;},
 gate(f,u,c){if(c.s.name==='Splitpod Salvo'&&has(u,'C08'))return c.r('Seeds')>0;},
 effect(f,u,g){if(g.source===u&&g.key==='Pod Aim'&&has(u,'A03')){g.kind='freshAmmunition';g.value=3;}},
 missed(f,u,a,t,d){if(a===u&&d.basic)u.kit.freshShot=false;},
 incoming(f,u,n,a,t,d){return t===u&&d.active&&has(u,'B05')&&pool(u,u,'Refill Shelter')?n*.88:n;},
 outgoing(f,u,n,a,t,d){
  if(!d.basic)return n;
  if(a===u){const spent=has(u,'A08')?0:f.take(u,'Seeds',1);if(spent){if(has(u,'B08'))f.after(()=>{heal(f,u,u,.01*u.maxHp,'Shell Instead of Shot');ward(f,u,u,.02*u.maxHp,3,'Shell Instead of Shot');});else n+=.25*f.stats(u).A;f.after(()=>seedSpend(f,u,spent));}if(u.kit.freshShot){u.kit.freshShot=false;if(has(u,'A05')&&!u.kit.firstHarvest){u.kit.firstHarvest=true;n+=.25*f.stats(u).A;}}}
  if(allies(u,a)&&a!==u){const e=f.get(a,'Shared Kernels:'+u.id);if(e?.value>0){e.value--;if(!e.value)f.remove(a,e.key);f.after(()=>{f.proc(a,t,.15*f.stats(u).A,'melee','Shared Kernel');if(has(u,'C07')&&f.ready(u,'rations:'+a.id,1))heal(f,u,a,.005*u.maxHp,'Sensible Rations');});}}
  return n;
 },
 landed(f,u,a,t,r,d){if(a===f.trainer(u)&&d.basic&&has(u,'C04')){const e=f.get(t,'Tagging Seed');if(e?.source===u.id&&!e.sown){e.sown=true;f.add(u,'Seeds',1,3);}}},
 hitBonus(f,u,n,a,t,d){
  if(a===u&&d.basic&&u.kit.Seeds>0&&has(u,'A03')){const e=f.get(u,'Pod Aim');if(e&&e.value>0){e.value--;if(!e.value)f.remove(u,e.key);u.kit.freshShot=true;n+=25;}}
  if(has(u,'C02')&&allies(u,a)&&f.get(t,'Tagging Seed')?.source===u.id)n+=20;return n;
 },
 damaged(f,u,a,t,n,s,d){if(t===u&&a?.side!==u.side&&n+s>0&&has(u,'B07')&&u.hp<u.maxHp*.4&&!u.kit.lastKernel){u.kit.lastKernel=true;f.add(u,'Seeds',5,3);}},
 cast(f,u,c){
  if(c.s.name==='Seedshot'){
   const empty=!c.r('Seeds'),spent=has(u,'A08')?c.take('Seeds',1):0;c.hit((1.35+(empty&&has(u,'A04')?.4:0)+(spent?.5:0))*c.A);seedSpend(f,u,spent);
   const before=c.r('Seeds');c.add('Seeds',has(u,'A02')?2:1,3);
   if(c.r('Seeds')>before&&has(u,'B02')){heal(f,u,u,.02*c.H,'Restoring Seedshot');if(has(u,'B04'))buff(f,u,u,'Tender Kernel','basicDR',.2,2,{once:true});}
   if(has(u,'C02'))c.debuff('Tagging Seed','seedTag',20,3);return true;
  }
  if(c.s.name==='Pod Refill'){
   const before=c.r('Seeds');c.add('Seeds',3,3);buff(f,u,u,'Pod Aim','nextBasicHit',25,10);u.kit.firstHarvest=false;u.kit.freshShot=false;
   if(has(u,'B03'))ward(f,u,u,Math.min(.08,.02*(c.r('Seeds')-before))*c.H,3,'Refill Shelter');
   if(has(u,'C01'))kernels(f,u,c.tr,2);if(has(u,'C06'))for(const t of c.other.filter(t=>t.slot>0))kernels(f,u,t,2);return true;
  }
  if(c.s.name==='Splitpod Salvo'){
   const spent=c.take('Seeds');if(has(u,'C08')){c.primary={kind:'utility',amount:0,target:u};for(const t of c.other){kernels(f,u,t,spent);ward(f,u,t,.02*c.H,3,'Community Harvest');}}
   else{c.hit((2.4+(has(u,'A08')?.6:.3)*spent*(has(u,'B06')?.5:1))*c.A);if(has(u,'A06'))c.splash(.15*c.A*spent);}
   seedSpend(f,u,spent);if(has(u,'A07')&&spent>=3)c.add('Seeds',1,3);if(has(u,'B06'))heal(f,u,u,.01*c.H*spent,'Measured Salvo');
   if(has(u,'C03')){const t=f.lowest(u,c.other);ward(f,u,t,.01*c.H*spent,3,'Harvest Shield');if(has(u,'C05')&&spent>=3)buff(f,u,t,'Protective Husk','basicTempo',.12,3);}return true;
  }
 }
});
function repairs(f,u,amount,source,primary){
 if(amount<=0)return;u.kit.repairs=(u.kit.repairs||[]).filter(e=>e.at>=f.battle.time-2);u.kit.repairs.push({at:f.battle.time,amount});
 if(u.kit.repairs.reduce((n,e)=>n+e.amount,0)>=.03*u.maxHp&&f.ready(u,'repairedCD',3)){u.kit.repairs=[];u.kit.repairCharges||=[];if(u.kit.repairCharges.length<(has(u,'A07')?2:1))u.kit.repairCharges.push({bonus:has(u,'A01')&&source!==u&&allies(u,source)&&primary?.3:0});}
}
function useRepair(f,u,active=false){const r=u.kit.repairCharges?.shift();if(!r)return 0;const {A,H}=f.stats(u);f.after(()=>{
 if(has(u,'C01'))ward(f,u,f.lowest(u,f.others(u)),.02*H,3,'Good for Everyone');
 if(active)u.kit.healPenalty=true;else{if(has(u,'A04'))u.kit.punchPatch=.25*A;if(has(u,'B08')){ward(f,u,u,.04*H,3,'Better Than New');ward(f,u,f.trainer(u),.04*H,3,'Better Than New');}}
 });return active?A:has(u,'B08')?0:(.45+r.bonus)*A;
}
register('stonehorn',{
 goodAsNew(){return true;},
 gate(f,u,c){if(c.s.name==='Fold and Mend'&&has(u,'C08'))return c.wounded(.65);},
 beforeCast(f,u,c){if(c.u===u){c.repairPrimed=!!u.kit.repairCharges?.length;if(c.s.kind==='hit'&&has(u,'A08'))c.repairBonus=useRepair(f,u,true);}},
 primary(f,u,n,c,kind){if(c.u!==u||kind!=='damage')return n;return n+(c.repairBonus||0)+spend(u,'tightAssembly')+(c.s.name==='Knucklebone'?spend(u,'punchPatch'):0)+(c.s.name==='Rattle Rally'&&c.repairPrimed&&has(u,'A06')?.5*c.A:0);},
 outgoing(f,u,n,a,t,d){return a===u&&d.basic?n+useRepair(f,u):n;},
 effect(f,u,g){if(g.source===u&&g.key==='Fold and Mend'&&has(u,'B01')){g.value=.25;g.duration=3;}},
 healAmount(f,u,n,source,t,o){if(t!==u||!o.primary)return n;if(has(u,'B05')&&pool(u,u,"Trainer's Ribs"))n*=1.15;if(u.kit.healPenalty){u.kit.healPenalty=false;n*=.8;}return n;},
 healed(f,u,source,t,n,label,o){
  if(t===u)repairs(f,u,n,source,o.primary);
  if(source===u&&label==='Fold and Mend'&&has(u,'C08')&&t!==u)repairs(f,u,n,u,true);
  if(t===u&&o.primary&&o.before<.5*u.maxHp&&has(u,'B07')&&f.ready(u,'jointMemory',4))buff(f,u,u,'Joint Memory','basicDR',.2,3,{once:true});
  if(t===u&&source===f.trainer(u)&&n>0&&has(u,'C07')&&f.ready(u,'kindlyRepair',3))heal(f,u,f.lowest(u,f.others(u).filter(t=>t.slot>0)),n*.15,'Kindly Repair',.02*u.maxHp);
  if(source===u&&label==='Knucklebone'&&n===0&&has(u,'B02'))ward(f,u,u,.02*u.maxHp,3,'Knuckle Guard');
 },
 shielded(f,u,source,t,n,label){if(source===u&&label==='Rattle Rally'&&t===f.trainer(u)&&has(u,'B03'))ward(f,u,u,n*.5,3,"Trainer's Ribs");},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Knuckle Guard'&&has(u,'B04'))f.after(()=>heal(f,u,u,.01*u.maxHp,'Sealed Joint'));},
 defenseConsumed(f,u,t,e){if(e.source!==u.id)return;if(e.key==='Fold and Mend'&&has(u,'B06'))f.after(()=>ward(f,u,t,.03*u.maxHp,3,'Unfold Carefully'));if(e.key==='Shared Mending'&&has(u,'C05'))charge(f,u,t,'Mended Morale',.2*f.stats(u).A);},
 hitBonus(f,u,n,a,t){return a===f.trainer(u)&&has(u,'C04')&&f.get(a,'Rattlebeat')?.target===t.id?n+15:n;},
 basicInterval(f,u,n,a){return allies(u,a)&&a!==u&&has(u,'C06')&&pool(f.trainer(u),u,'Rattle Rally')?n*.88:n;},
 cast(f,u,c){
  if(c.s.name==='Knucklebone'){c.hit(1.3*c.A);c.heal(u,(has(u,'A02')?.03:.02)*c.H);if(has(u,'C02')){heal(f,u,c.tr,.01*c.H,'Helpful Knuckle');if(has(u,'C04'))buff(f,u,c.tr,'Rattlebeat','conditionalHit',15,3,{target:c.t?.id});}return true;}
  if(c.s.name==='Fold and Mend'){const t=has(u,'C08')?c.low:u,n=c.heal(t,.07*c.H);c.dr(.15,2,'nextDirectDR',t,true);if(has(u,'A03'))u.kit.tightAssembly=(.4+(has(u,'A05')&&n>=.05*c.H?.25:0))*c.A;if(has(u,'C03'))buff(f,u,f.lowest(u,c.other.filter(v=>v!==t)),'Shared Mending','nextDirectDR',(has(u,'B01')?.25:.15)*.5,has(u,'B01')?3:2,{once:true});return true;}
 }
});
function gusts(f,u,add=false){u.kit.gusts=(u.kit.gusts||[]).filter(at=>at>f.battle.time);if(add&&u.kit.gusts.length<(has(u,'A01')?2:1))u.kit.gusts.push(f.battle.time+(has(u,'A01')?5:3));return u.kit.gusts;}
register('tempestcub',{
 stormShoulders(){return true;},
 gate(f,u,c){if(c.s.name==='Stormcurl'&&has(u,'C08'))return c.wardGate();},
 beforeCast(f,u,c){if(c.u===u&&c.s.kind==='hit')c.spentGust=!!gusts(f,u).shift();},
 primary(f,u,n,c,kind){if(c.u!==u||kind!=='damage')return n;if(c.spentGust&&!has(u,'B08'))n+=.6*c.A;if(c.s.name==='Squall Paw'&&c.spentGust&&has(u,'A02'))n+=.25*c.A;return c.s.name==='Thunderclap Paws'&&has(u,'B06')?n*.8:n;},
 incoming(f,u,n,a,t,d){if(t===u&&d.basic&&has(u,'B04')&&pool(u,u,'Grounded Paw'))n*=.88;if(allies(u,t)&&d.secondary&&d.active&&f.get(t,'Windbreak')?.source===u.id)n*=.8;return n;},
 damaged(f,u,a,t,n,s,d){if(t===u&&!d.transfer&&!d.debt&&a?.side!==u.side&&(n>=.06*u.maxHp||has(u,'B01')&&s>=.06*u.maxHp)&&f.ready(u,'gustCD',3))gusts(f,u,true);},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Stormcurl'&&has(u,'A05'))gusts(f,u,true);},
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Squall Signal')?.source===u.id?n+20:n;},
 landed(f,u,a,t,r,d){
  if(a===u&&d.basic&&has(u,'A07')&&u.kit.talentBasics%3===0&&f.ready(u,'growingWeather',3))gusts(f,u,true);
  if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Squall Signal');if(e?.source===u.id&&(e.extension||0)<2){e.extension=(e.extension||0)+1;e.until+=1;}}
  if(allies(u,a)&&d.basic&&has(u,'C05')){const e=f.get(a,'Encouraging Curl');if(e?.source===u.id&&!e.uplift){e.uplift=true;ward(f,u,a,.02*u.maxHp,3,'Uplift');}}
 },
 cast(f,u,c){
  if(c.s.name==='Stormcurl'){
   if(has(u,'C08'))for(const t of c.other){c.shield(t,.09*c.H,3);buff(f,u,t,'Encouraging Curl','basicTempo',.15,3);}else{const n=c.selfward(.09*c.H);if(has(u,'B03'))ward(f,u,c.tr,n*.5,3,'Sheltering Curl');}
   gusts(f,u,true);return true;
  }
  if(c.s.name==='Thunderclap Paws'){
   if(has(u,'A08')){
    const point={position:{...c.t.position}},factor=has(u,'B06')?.8:1;f.zones.push({owner:u,position:point.position,radius:18,until:f.battle.time+3});
    for(const at of [0,1,2]){const pulse=()=>{const targets=f.nearby(u,point,18,3,c.t);for(let i=0;i<targets.length;i++){const t=targets[i],result=at===0?c.hit(c.A,{target:t,area:true,secondary:i>0,ignoreRange:true}):f.proc(u,t,c.A*factor,'melee','Eye of the Storm',{area:true,secondary:i>0});if(result.hit&&has(u,'C06'))buff(f,u,t,'Crosswind Clap','basicPenalty',.15,3,{harmful:true});}};if(at)f.later(u,null,at,pulse,{ownerRequired:true,label:'Eye of the Storm'});else pulse();}
   }else{c.hit(2.4*c.A,{area:true});c.splash((.45+(c.spentGust&&has(u,'A06')?.35:0))*c.A*(has(u,'B06')?.8:1));}
   return true;
  }
 },
 afterCast(f,u,c){
  if(c.u!==u){if(allies(u,c.u)&&has(u,'C07')){u.kit.allyWind||={};u.kit.allyWind[c.u.id]=f.battle.time;const others=f.others(u);if(others.length>=2&&others.every(t=>(u.kit.allyWind[t.id]??-Infinity)>=f.battle.time-3)&&f.ready(u,'gatheredWind',5))gusts(f,u,true);}return;}
  if(c.spentGust){if(has(u,'B07'))heal(f,u,u,.02*c.H,'Breathe Again');if(has(u,'C01'))charge(f,u,c.tr,'Shared Gust',.25*c.A);if(has(u,'B08')){ward(f,u,u,.06*c.H,3,'Cloud Instead of Claw');ward(f,u,c.tr,.03*c.H,3,'Cloud Instead of Claw');}}
  if(c.s.name==='Squall Paw'){if(c.spentGust&&has(u,'A04'))c.debuff('Ringing Paw','physicalExposure',.06,3);if(c.spentGust&&has(u,'B02'))ward(f,u,u,.03*c.H,3,'Grounded Paw');if(has(u,'C02'))c.debuff('Squall Signal','signal',20,3);}
  if(c.s.name==='Stormcurl'){if(has(u,'A03'))charge(f,u,u,'Charged Curl',.35*c.A);if(has(u,'B05'))buff(f,u,c.tr,'Windbreak','windbreak',.2,3);if(has(u,'C03')&&!has(u,'C08'))for(const t of c.other.filter(t=>t.slot>0))buff(f,u,t,'Encouraging Curl','basicTempo',.15,3);}
  if(c.s.name==='Thunderclap Paws'){if(has(u,'B06'))c.debuff('Weakened active','activeWeakness',.2,3);if(has(u,'C06'))for(const r of c.results.filter(r=>r.hit))buff(f,u,r.target,'Crosswind Clap','basicPenalty',.15,3,{harmful:true});}
 }
});
const effigy=(f,u,t=null)=>f.entities.find(e=>alive(e)&&e.master===u&&e.profile==='stitched-effigy'&&(!t||e.linked===t.id));
function effigyTrigger(f,u,e,t){
 const endless=has(u,'A08');if(!alive(e)||!alive(t)||!endless&&e.triggers>=(e.triggerBudget||6)||!f.ready(e,'triggerCD',endless?1:.75))return true;
 e.triggers++;if(has(u,'C08'))ward(f,u,f.lowest(u),.3*e.snapshot.A,3,'Scapegoat Stitch');else{e.needleGains=(e.needleGains||[]).filter(at=>at>f.battle.time);f.proc(e,t,(endless?.25+(has(u,'A01')?.05:0)+.05*e.needleGains.length:.3)*e.snapshot.A,'melee',e.name);}return true;
}
register('thistlehare',{
 looseThread(){return true;},
 effigyTrigger,
 entityCreated(f,u,e){if(e.profile!=='stitched-effigy')return;if(has(u,'A01'))e.hp=e.maxHp=Math.round(.1*u.maxHp);e.triggerBudget=has(u,'A01')?8:6;if(has(u,'A08'))e.until=1e6;},
 entityTick(f,u,e){if(e.profile==='stitched-effigy'&&has(u,'C07')){const t=f.enemies(u).find(t=>t.id===e.linked);if(t){buff(f,u,t,'Puppet Cover healing','healOutput',-.15,.1,{harmful:true});buff(f,u,t,'Puppet Cover shields','shieldOutput',-.15,.1,{harmful:true});}}},
 effect(f,u,g){if(g.source===u&&g.key==='Stitch'&&has(u,'A02'))g.duration=5;},
 incoming(f,u,n,a,t,d){if(d.direct!==false&&!d.dot){if(t===u&&has(u,'A07')&&effigy(f,u,a))n*=.88;if(t===f.trainer(u)&&has(u,'C02')&&f.get(a,'Stitch')?.source===u.id)n*=.9;}return n;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic&&u.kit.tearingRhythm>0){u.kit.tearingRhythm--;n+=.2*f.stats(u).A;if(!u.kit.tearingRhythm&&has(u,'B05'))refund(u,'Pull the Seam',1);}return n;},
 beforeCast(f,u,c){if(c.u!==u)return;if(c.s.kind==='hit'&&u.kit.snagButton){c.mods.hit=(c.mods.hit||0)+25;u.kit.snagButton=false;}if(c.s.name==='Button Prick')c.buttonHook=f.get(c.t,'Hem Snare')?.source===u.id;},
 primary(f,u,n,c,kind){if(c.u===u&&kind==='damage'&&c.s.name==='Button Prick')n=(n+(has(u,'B02')&&c.buttonHook?.3*c.A:0))*(has(u,'C02')?.75:1);return n;},
 landed(f,u,a,t,r,d){
  if(!allies(u,a)||u.targetId!==t.id)return;const e=f.get(t,'Stitch');if(e?.source!==u.id)return;
  const used=Number(e.used[a.id]||0),max=has(u,'B01')&&a===u?2:1;if(used>=max||e.count>=(has(u,'B01')?4:3))return;
  e.used[a.id]=used+1;e.count++;f.proc(u,t,.2*f.stats(u).A,'melee','Loose Thread');const distinct=Object.keys(e.used).length;
  if(has(u,'C01'))ward(f,u,a,.15*f.stats(u).A*(has(u,'C04')&&distinct===3&&!used?2:1),3,'Protective Stitch');
  const doll=effigy(f,u,t);if(doll&&has(u,'A04')&&!used&&distinct===3&&(doll.needleGrants||0)<2){doll.needleGrants=(doll.needleGrants||0)+1;doll.triggerBudget++;doll.needleGains||=[];doll.needleGains.push(f.battle.time+4);}
 },
 missed(f,u,a,t,d){const e=f.get(a,'Hem Snare');if(has(u,'C05')&&d.basic&&e?.source===u.id&&!e.reprieve){e.reprieve=true;heal(f,u,f.trainer(u),.2*f.stats(u).A,'Threaded Reprieve');}},
 death(f,u,a,t){if(t.side!==u.side&&!t.temporary&&f.get(t,'Stitch')?.source===u.id&&has(u,'B07')&&f.ready(u,'stitchAnother',3)){refund(u,'Button Prick',2);ward(f,u,u,.3*f.stats(u).A,3,'Stitch Another');}},
 cast(f,u,c){
  if(c.s.name==='Pull the Seam'){
   const e=c.mark('Stitch'),count=e?.source===u.id?Math.min(has(u,'B01')?4:3,e.count):0,bonus=(has(u,'B06')?.4:.25)*count*(has(u,'C06')?.5:1),reset=has(u,'B08')&&f.ready(u,'pullEverything',4);
   c.hit((2.6+bonus+(reset&&count===(has(u,'B01')?4:3)?.6:0))*c.A);
   if(reset){f.remove(c.t,'Stitch');refund(u,'Button Prick',1e6);}if(has(u,'C06'))heal(f,u,c.low,.2*c.A*count,'Repair the Doll');return true;
  }
  if(c.s.name==='Stitched Effigy'&&has(u,'A08')){c.primary={kind:'deployment',amount:0,target:u};c.deploy('stitched-effigy',{linked:c.t.id});return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit),e=effigy(f,u,c.t);
  if(c.s.name==='Button Prick'&&hit){if(c.buttonHook&&has(u,'B04'))u.kit.snagButton=true;if(e&&has(u,'A06'))effigyTrigger(f,u,e,c.t);}
  if(c.s.name==='Hem Snare'){
   if(has(u,'B03'))u.kit.tearingRhythm=2;
   if(hit&&e&&has(u,'A03')){ward(f,u,e,.02*c.H,3,'Pinned Shadow');if(has(u,'A05')){if(has(u,'A08'))heal(f,u,e,.01*c.H,'Tight Pins');else if((e.pinExtension||0)<2){e.pinExtension=(e.pinExtension||0)+1;e.until+=1;}}}
   if(hit&&has(u,'C03')){const t=c.b.target(c.t);if(allies(u,t))buff(f,u,t,'Loose Hem','flee',20,3);}
  }
 }
});
const bleeding=(f,t)=>Object.values(t?.effects||{}).some(e=>e.kind==='dot'&&e.category!=='magic'&&e.until>f.battle.time);
function freshWound(f,u,t){f.dot(u,t,'Fresh Wound:'+u.id,.6*f.stats(u).A,4,'melee',{ownerRequired:true,label:'Fresh Wound',afterTick:r=>{if(has(u,'B04'))limited(f,u,'bloodSap',.2*(r?.damage||0),.2*f.stats(u).A,n=>heal(f,u,u,n,'Blood Sap',n));}});}
function loanedThorn(f,u,t,count=1,duration=3){buff(f,u,t,'Loaned Thorn:'+u.id,'loanedThorn',count,duration);}
register('thornstag',{
 bitingThorns(){return true;},
 gate(f,u,c){if(c.s.name==='Thorn Cinch'&&has(u,'C08'))return c.wardGate();},
 effect(f,u,g){if(g.source!==u)return;if(g.key==='Thorn Cinch'&&has(u,'A03'))g.duration+=1;if(g.key==='Briar Bite'&&has(u,'B06')){g.value=-.35;const e=f.get(g.target,'Fresh Wound:'+u.id);g.duration=Math.max(g.duration,4,e?e.until-f.battle.time:0);}},
 incoming(f,u,n,a,t,d){return d.basic&&allies(u,t)&&t!==u&&has(u,'C02')&&f.get(a,'Briar Bite')?.source===u.id?n*.9:n;},
 damaged(f,u,a,t,n,s,d){
  if(a?.side===u.side||d.proc||d.transfer||d.debt||d.dot||d.direct===false)return;
  const {A,H}=f.stats(u);
  if(t===u&&(d.basic||has(u,'A08')&&d.active)&&f.ready(u,'thornCD',.75)){
   let amount=Math.min((has(u,'A01')?.9:.65)*A,.25*A+(has(u,'A01')?.02:.01)*H);if(has(u,'B07')&&bleeding(f,a))amount+=.15*A;if(has(u,'A08'))amount*=.8;
   f.after(()=>{f.proc(u,a,amount,'melee','Biting Thorns');if(has(u,'A08'))heal(f,u,u,.01*H,'Live Hedge');if(has(u,'A04')&&pool(u,u,'Bark Bite')&&f.ready(u,'thornSutures',1))heal(f,u,u,.01*H,'Thorn Sutures');});
   u.kit.thornCount=(u.kit.thornCount||0)+1;if(u.kit.thornCount%3===0){if(has(u,'A07'))buff(f,u,a,'Weakened basic','basicWeakness',.2,3,{harmful:true});if(has(u,'C07'))loanedThorn(f,u,f.trainer(u));}
  }
  const e=f.get(t,'Loaned Thorn:'+u.id);if(allies(u,t)&&d.basic&&e?.value>0&&f.ready(u,'loanedThorn:'+t.id,1)){e.value--;if(!e.value)f.remove(t,e.key);f.after(()=>{f.proc(u,a,.3*A,'melee','Loaned Thorn');if(has(u,'C04'))ward(f,u,t,.02*H,3,'Kindly Barbs');});}
 },
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B08')&&f.has(u,'Maw Unrooted')){const e=f.get(t,'Fresh Wound:'+u.id);if(e)f.extendDot(u,t,e.key,Math.max(0,Math.min(1,4-e.until+f.battle.time)));}},
 healed(f,u,source,t,n,label,o){if(source===u&&t===u&&label==='Rootjaw Clamp'&&has(u,'A06'))ward(f,u,u,Math.min(.06*u.maxHp,o.offered-n),3,'Firm Rootjaw');},
 cast(f,u,c){
  if(c.s.name==='Thorn Cinch'){
   if(has(u,'C08')){for(const t of c.other){loanedThorn(f,u,t,3,4);buff(f,u,t,'Hedge Around Home','basicDR',.2,4);}}
   else if(has(u,'B08'))buff(f,u,u,'Maw Unrooted','basicTempo',.2,4);
   else{c.taunt();c.dr(.15,3,'basicDR');}
   if(has(u,'B03'))for(const t of f.enemies(u).filter(t=>c.b.inRange(t,u)))buff(f,u,t,'Open Cinch','physicalExposure',.06,3,{harmful:true});
   if(has(u,'A05'))buff(f,u,u,'Jaw Shelter','nextActiveDR',.15,3,{once:true});
   if(has(u,'C03')&&!has(u,'C08'))for(const t of c.other)buff(f,u,t,'Shared Cinch','basicDR',.075,3);
   if(has(u,'C05'))ward(f,u,f.lowest(u,c.other),.03*c.H,3,'Woven Guard');c.primary={kind:'utility',amount:0,target:u};return true;
  }
  if(c.s.name==='Rootjaw Clamp'){
   c.hit((2.5+(has(u,'B02')&&bleeding(f,c.t)?.45:0))*c.A);c.heal(u,(has(u,'C06')?.04:.08)*c.H);if(has(u,'C06'))heal(f,u,c.tr,.04*c.H,'Rootjaw Offering');
   if(c.results[0]?.hit&&has(u,'B05')&&f.get(c.t,'Open Cinch')?.source===u.id){f.extendDot(u,c.t,'Fresh Wound:'+u.id,2);if(has(u,'B06')){const e=f.get(c.t,'Briar Bite'),w=f.get(c.t,'Fresh Wound:'+u.id);if(e?.source===u.id&&w)e.until=Math.max(e.until,w.until);}}return true;
  }
 },
 afterCast(f,u,c){if(c.u!==u||c.s.name!=='Briar Bite')return;if(c.results[0]?.hit){if(has(u,'A02')&&c.b.target(c.t)===u)ward(f,u,u,.03*c.H,3,'Bark Bite');if(has(u,'B01'))freshWound(f,u,c.t);}if(has(u,'C01'))loanedThorn(f,u,c.tr);}
});
function postedOmen(f,u,t,duration){buff(f,u,t,'Weakened active','activeWeakness',.12,duration,{harmful:true,omenOwner:u.id});}
function forecastResolve(f,u,c,record){
 if(!alive(u)||f.battle.ended)return;record.done=true;
 if(record.ally){if(alive(record.target))heal(f,u,record.target,1.6*c.M,'Shelter for Tomorrow');return;}
 let t=record.target,scale=1,transferred=false;if(!alive(t)){t=f.battle.target(u);scale=has(u,'A07')?.75:.5;transferred=true;}
 const legal=alive(t)&&f.battle.inRange(u,t),power=record.amount*scale*(has(u,'C08')?.5:1),result=legal?f.direct(u,t,power,c.s.name,{category:'magic',active:true,primary:true}):{hit:false,damage:0};
 const name=c.s.name;if(record.shelter){const p=pool(u,u,record.shelter);if(p)p.until=f.battle.time;f.syncShield(u);}
 if(name==='Folded Forecast'){
  if(has(u,'B05')){const p=pool(u,u,'Folded Forecast');if(p)mendShield(f,u,u,p,Math.max(0,(record.heldCapacity||0)-p.amount));else if(record.heldUntil>f.battle.time)ward(f,u,u,record.heldCapacity,record.heldUntil-f.battle.time,'Folded Forecast');}
  else{ward(f,u,u,.5*c.M,3,'Folded Forecast');if(has(u,'B03'))ward(f,u,c.tr,.25*c.M,3,'Double Fold');}
 }
 if(name==='Amber Dart'&&has(u,'B02')){const ally=f.lowest(u);heal(f,u,ally,.3*c.M,'Gentle Dart');if(has(u,'B04'))buff(f,u,ally,'Softer Landing','flee',15,2);}
 if(name==='Unfurl the Sun'&&has(u,'B06'))ward(f,u,f.lowest(u),.7*c.M,3,'Sunshade');
 if(!result.hit)return;
 if(transferred&&has(u,'B07'))ward(f,u,c.tr,.4*c.M,3,'Promise Kept');
 if(record.countdown&&has(u,'A04'))buff(f,u,u,'Stacked Hour','nextBasic',.25*c.M,75);
 const marked=f.get(t,'Certain Tomorrow');if(has(u,'A05')&&marked?.source===u.id&&!marked.dividend){marked.dividend=true;ward(f,u,u,.25*c.M,3,'Forecast Dividend');}
 if(name==='Amber Dart'&&has(u,'C02'))buff(f,u,t,'Warning Dart','hit',-20,3,{harmful:true});
 if(name==='Folded Forecast'&&has(u,'C03')){buff(f,u,t,'Gilded Forecast','healReceived',-.25,4,{harmful:true});if(has(u,'C05'))buff(f,u,t,'Expensive Future','shieldReceived',-.2,4,{harmful:true});}
 if(name==='Unfurl the Sun'){if(has(u,'A06'))f.dot(u,t,'Solar Appointment:'+u.id,.45*c.M,3,'magic',{ownerRequired:true,label:'Solar Appointment'});if(has(u,'C06'))for(const other of f.nearby(u,t,18,3,t).filter(v=>v!==t).slice(0,2))postedOmen(f,u,other,3);}
 if(has(u,'C08'))f.later(u,t,1,()=>{if(alive(t)){f.proc(u,t,power,'magic','Future Written Twice');postedOmen(f,u,t,3);}},{ownerRequired:true,label:'Future Written Twice'});
}
register('amberkite',{
 support(f,u,s){if(s.name==='Unfurl the Sun'&&has(u,'B08'))return true;},
 gate(f,u,c){if(c.s.name==='Unfurl the Sun'&&has(u,'B08'))return c.wounded(.8);},
 hitBonus(f,u,n,a,t){return allies(u,a)&&has(u,'C04')&&f.get(t,'Warning Dart')?.source===u.id?n+15:n;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.active&&has(u,'A03')&&f.get(t,'Certain Tomorrow')?.source===u.id)d.magicBypassPoints=Math.max(d.magicBypassPoints||0,.06);return n;},
 effectExpired(f,u,t,e){if(e.omenOwner===u.id&&has(u,'C07')&&f.ready(u,'unspentWarning',2))ward(f,u,f.trainer(u),.2*f.stats(u).M,3,'Unspent Warning');},
 cast(f,u,c){
  if(!['Amber Dart','Folded Forecast','Unfurl the Sun'].includes(c.s.name))return;
  const name=c.s.name,instant=has(u,'A08'),delay=instant?0:name==='Amber Dart'?.6:name==='Folded Forecast'?.8:1.2+(has(u,'A01')?.4:0),ally=name==='Unfurl the Sun'&&has(u,'B08');
  u.kit.forecasts=(u.kit.forecasts||[]).filter(r=>!r.done);
  const pending=instant?Object.entries(u.kit.forecastHistory||{}).some(([id,at])=>id!==c.s.id&&at>=f.battle.time-2):u.kit.forecasts.some(r=>!r.ally&&r.target===c.t),countdown=name==='Amber Dart'&&pending&&has(u,'A02');
  let amount=(name==='Amber Dart'?1.5+(countdown?.25:0):name==='Folded Forecast'?1.9:3.2+(has(u,'A01')?.8:0))*c.M;
  amount*=instant?.8:1;if(name==='Amber Dart'&&has(u,'B02'))amount*=.8;
  const record={target:ally?c.low:c.t,amount:0,ally,countdown,done:false};c.primary={kind:ally?'heal':'damage',amount,category:'magic',target:record.target};
  if(!ally){amount=root.BondCombatPassives.primary(f,c,'damage',amount);amount=change(f,'primary',amount,c,'damage');record.amount=amount*c.skillPower*(1+(u.growth?.attack||0));}
  if(ally)ward(f,u,c.low,.8*c.M,delay||.05,'Shelter for Tomorrow');
  else if(has(u,'C01')&&delay)postedOmen(f,u,c.t,delay);
  if(name==='Folded Forecast'){
   if(has(u,'A03'))buff(f,u,c.t,'Certain Tomorrow','certainTomorrow',.06,3,{harmful:true});
   if(has(u,'B05')){ward(f,u,u,.5*c.M,3,'Folded Forecast');const p=pool(u,u,'Folded Forecast');record.heldCapacity=p?.amount||0;record.heldUntil=p?.until||0;if(has(u,'B03'))ward(f,u,c.tr,.25*c.M,3,'Double Fold');}
  }
  if(has(u,'B01')&&delay){record.shelter='Paper Shelter:'+c.s.id+':'+(++f.sequence);ward(f,u,u,.3*c.M,Math.min(3,delay),record.shelter);}
  u.kit.forecasts.push(record);u.kit.forecastHistory||={};u.kit.forecastHistory[c.s.id]=f.battle.time;
  if(delay)f.later(u,record.target,delay,()=>forecastResolve(f,u,c,record),{ownerRequired:true,label:name});else forecastResolve(f,u,c,record);return true;
 }
});
const brace=u=>u.kit.bracedHit=Math.min(30,(u.kit.bracedHit||0)+10);
register('bouldereagle',{
 beforeCast(f,u,c){if(c.u!==u)return;c.bracedAim=u.kit.bracedHit||0;c.quarryDebuffed=f.value(c.t,'flee')<0;if(c.s.kind==='hit'){c.cleanCross=f.remove(u,'Cross and Pierce');if(u.kit.curtainAim){c.mods.hit=(c.mods.hit||0)+25;u.kit.curtainAim=false;}}},
 primary(f,u,n,c,kind){if(c.u!==u||kind!=='damage')return n;if(!has(u,'B08')&&has(u,'A01'))n+=c.bracedAim/10*(c.s.name==='Quarry Beak'&&has(u,'A08')?.3:.15)*c.A;return c.s.name==='Quarry Beak'&&has(u,'C08')?n*.5:n;},
 hitBonus(f,u,n,a,t,d){if(a===u&&f.currentCompanionCast?.s.name==='Knuckle Peck'&&!f.currentCompanionCast.bracedAim&&has(u,'A02'))n+=20;if(allies(u,a)&&has(u,'C01')&&f.get(t,'Quarry Beak')?.source===u.id)n+=20;return n;},
 incoming(f,u,n,a,t,d){
  if(t===u&&d.basic&&has(u,'B01'))n*=1-.05*(u.kit.bracedHit||0)/10;
  if(t===u&&d.active&&d.primary&&d.category==='magic'&&has(u,'B05')){const e=f.get(u,'Stonewing Cross');if(e&&!e.crossedMagic){e.crossedMagic=true;n*=.8;}}
  if(d.active&&d.primary&&f.get(a,'Broken Rhythm')?.source===u.id)n*=.85;return n;
 },
 outgoing(f,u,n,a,t,d){
  if(a===u){if(d.active&&d.primary&&f.currentCompanionCast?.cleanCross)d.penetration=Math.max(d.penetration||0,.08);if(d.basic){if(has(u,'A05')&&f.get(t,'Quarry Beak')?.source===u.id&&f.ready(u,'quarryHabit',1))n+=.15*f.stats(u).A;if(u.kit.longCrossUntil>f.battle.time){u.kit.longCrossUntil=0;if(has(u,'B03'))f.after(()=>heal(f,u,u,.3*f.stats(u).A,'Long Cross'));}}}
  return n;
 },
 attempted(f,u,a,t,d){if(a===f.trainer(u)&&d.basic&&has(u,'C05')){const e=f.remove(a,'Crossing Signal guaranteed');if(e)f.proc(a,t,e.value,'melee','Clean Shot',{guaranteed:true});}},
 missed(f,u,a,t,d){if(a===u&&d.basic&&has(u,'A07')){u.kit.patientMisses=(u.kit.patientMisses||0)+1;if(u.kit.patientMisses%2===0)brace(u);}},
 effect(f,u,g){if(g.source!==u)return;if(g.key==='Quarry Beak'&&has(u,'A03'))g.duration=5;if(g.key==='Stonewing Cross'){if(has(u,'B03'))g.duration=3;if(has(u,'B08'))g.kind='dr';}},
 shield(f,u,g){if(g.source===u&&g.label==='Knuckle Peck'&&has(u,'B02')&&(f.currentCompanionCast?.bracedAim||0)>=20)g.amount+=.02*u.maxHp;},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Knuckle Peck'&&has(u,'B04'))brace(u);},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.beakWarning&&has(u,'C04')&&allies(u,t))f.after(()=>ward(f,u,t,.02*u.maxHp,3,'Warning Feathers'));},
 tick(f,u){if(!has(u,'C08'))return;for(const t of f.enemies(u)){const e=f.get(t,'Quarry aura');if(e?.source!==u.id)continue;for(const v of f.nearby(u,t,18,3,t).filter(v=>v!==t).slice(0,2))buff(f,u,v,'Quarry aura penalty','flee',-25,.1,{harmful:true});}},
 cast(f,u,c){if(c.s.name==='Quarry Beak'&&has(u,'A08')){c.hit(2.7*c.A,{guaranteed:true,noCritical:true});c.debuff('Quarry Beak','flee',-25,3);return true;}},
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.kind==='hit'){
   if(c.bracedAim>=30){if(has(u,'B07'))heal(f,u,u,.03*c.H,'Gravel Recovery');if(has(u,'C07'))for(const t of c.other.filter(t=>t.slot>0))buff(f,u,t,'Nest Signal','hit',20,3);}
   if(has(u,'B08')&&c.bracedAim)ward(f,u,u,.02*c.H*c.bracedAim/10,3,'Closed Wings');
  }
  if(c.s.name==='Knuckle Peck'){
   if(hit&&!c.bracedAim&&has(u,'A04'))brace(u);
   if(hit&&has(u,'C02'))buff(f,u,c.t,'Weakened active','activeWeakness',.12,3,{harmful:true,beakWarning:true});
  }
  if(c.s.name==='Stonewing Cross'){
   u.kit.longCrossUntil=f.battle.time+3;if(has(u,'A06'))buff(f,u,u,'Cross and Pierce','pierceCharge',.08,4);
   if(has(u,'C03')){if(has(u,'C05'))buff(f,u,c.tr,'Crossing Signal guaranteed','crossingSignal',.35*c.A,3);else charge(f,u,c.tr,'Crossing Signal',.35*c.A);}
  }
  if(c.s.name==='Quarry Beak'&&hit){
   if(c.quarryDebuffed&&has(u,'B06'))ward(f,u,u,.6*c.A,3,'Careful Quarry');
   if(has(u,'C06')){const t=f.nearby(u,c.t,18,2,c.t).find(t=>t!==c.t);if(t)buff(f,u,t,'Two Quarries','flee',-12.5,has(u,'A03')?5:3,{harmful:true});}
   if(has(u,'C08')){buff(f,u,c.t,'Broken Rhythm','brokenRhythm',.15,has(u,'A03')?5:3,{harmful:true});buff(f,u,c.t,'Quarry aura','quarryAura',1,3,{harmful:true});}
  }
 }
});
function noteSpend(f,u,c){const n=spend(u,'Note');c.notesSpent=(c.notesSpent||0)+n;return n;}
register('bronzebuck',{
 resonantRim(){return true;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Note'?(has(u,'A01')?3:2):max;},
 support(f,u,s){if(s.name==='Grand Resonance'&&has(u,'B08'))return false;},
 gate(f,u,c){if(c.s.name==='Grand Resonance'&&has(u,'B08'))return alive(c.t);},
 overchargeAllowed(f,u,s){if(s.name==='Grand Resonance'&&has(u,'B08'))return true;},
 primary(f,u,n,c,kind){
  if(c.u===u&&kind==='shield'){
   if(c.s.name==='Sheltering Chime'&&has(u,'C08')){const notes=noteSpend(f,u,c);buff(f,u,c.low,'Gonglet Inspiration:'+u.id,'gongInspiration',notes,75,{power:.25*c.M,replace:true,awardedActor:u.id,awardedCast:u.casts});}
   else if(has(u,'A08'))n+=.2*c.M*(u.kit.Note||0);
   else n+=.3*c.M*noteSpend(f,u,c);
  }
  if(allies(u,c.u)){
   const e=f.get(c.u,'Gonglet Inspiration:'+u.id);if(e?.value>0&&(e.awardedActor!==c.u.id||e.awardedCast!==c.u.casts)&&['damage','heal','shield'].includes(kind)){e.value--;if(!e.value)f.remove(c.u,e.key);n+=e.power;}
   const p=pool(c.u,u,'Sheltering Chime');if(has(u,'C06')&&p&&!p.confident&&['heal','shield'].includes(kind)){p.confident=true;n*=1.15;}
  }
  return n;
 },
 incoming(f,u,n,a,t,d){if(t===u&&d.basic&&has(u,'A04')){const p=pool(u,u,'Thick Toll');if(p&&!p.padded){p.padded=true;n*=.8;}}return n;},
 damaged(f,u,a,t,n,s,d){if(t===u&&a?.side!==u.side&&n>0&&!d.transfer&&!d.debt&&has(u,'A08')&&f.ready(u,'noteLoss',1))f.take(u,'Note',1);},
 absorbed(f,u,a,t,p,n,d){if(p.source===u.id&&p.label==='Sheltering Chime'&&has(u,'B03')&&!p.rung&&!d.transfer&&!d.debt){p.rung=true;u.kit.ringBack=.35*f.stats(u).M;}},
 landed(f,u,a,t,r,d){
  if(a===u&&d.basic&&has(u,'B07')&&u.kit.talentBasics%3===0&&f.ready(u,'resoundingBasics',3))f.add(u,'Note',1,2);
  if(a===f.trainer(u)&&d.active){const e=f.remove(t,'Call the Beat:'+u.id);if(e){f.proc(u,t,.25*f.stats(u).M,'magic','Call the Beat');if(has(u,'C04'))f.add(u,'Note',1,2);}}
 },
 shield(f,u,g){if(g.source!==u||g.options.talent)return;if(g.label==='Sheltering Chime'&&has(u,'A05')&&(f.currentCompanionCast?.notesSpent||0)>=2)g.duration+=1;if(g.label==='Grand Resonance'&&has(u,'A06'))g.amount+=.02*u.maxHp;},
 shielded(f,u,source,t,n,label,p,o){if(source!==u||o.talent||label!=='Sheltering Chime')return;if(has(u,'A03'))ward(f,u,u,.3*n,p.until-f.battle.time,'Rim Padding');if(has(u,'C01'))buff(f,u,t,'Guiding Chime','hit',20,3);},
 cast(f,u,c){
  if(c.s.name==='Little Toll'){
   const spent=has(u,'B01')?c.take('Note',1):0,primer=spend(u,'ringBack');c.notesSpent=spent;c.hit(1.15*c.M+.45*c.M*spent+primer);
   if(primer&&has(u,'B05'))heal(f,u,u,.2*c.M,'Forged in Sound');if(spent&&has(u,'B02'))c.debuff('Cracked Bronze','magicExposure',.06,3);if(spent&&has(u,'B04'))c.splash(.225*c.M,18,1,'magic');
   const before=c.r('Note');c.add('Note',1,2);if(c.r('Note')>before&&has(u,'A02'))ward(f,u,u,.25*c.M+.01*c.H,3,'Thick Toll');if(has(u,'C02'))c.debuff('Call the Beat:'+u.id,'callBeat',1,3);return true;
  }
  if(c.s.name==='Grand Resonance'&&has(u,'B08')){const n=noteSpend(f,u,c);c.hit((2+.35*n)*c.M);c.splash(.6*c.M,18,2,'magic');return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u){if(allies(u,c.u)&&has(u,'C07')){u.kit.ensemble||={};u.kit.ensemble[c.u.id]=f.battle.time;const other=f.others(u);if(other.length>=2&&other.every(t=>(u.kit.ensemble[t.id]??-Infinity)>=f.battle.time-3)&&f.ready(u,'ensembleCD',4))f.add(u,'Note',1,2);}return;}
  if(c.notesSpent&&has(u,'A07'))heal(f,u,u,.01*c.H*c.notesSpent,'Ringing Recovery');
  if(c.s.name==='Grand Resonance'){
   if(has(u,'B06')&&!has(u,'B08')){f.proc(u,c.t,.4*c.M,'magic','Offensive Resonance');for(const t of f.nearby(u,c.t,18,3,c.t).filter(t=>t!==c.t).slice(0,2))f.proc(u,t,.2*c.M,'magic','Offensive Resonance',{area:true,secondary:true});}
   if(has(u,'C03'))for(const t of c.all)buff(f,u,t,'Bright Chorus','basicTempo',.1,3+(has(u,'C05')&&c.notesSpent>=2?2:0));
  }
 }
});
const glassShield=(f,u)=>!!pool(u,u,'Luminous Seams')||has(u,'A08')&&f.has(u,'Glass Cannon');
register('glassphoenix',{
 luminousSeams(){return true;},
 gate(f,u,c){if(c.s.name==='Luminous Seams'&&has(u,'C08'))return c.trainerGate();},
 finalHP(f,u,n,d){
  if(!u.kit.phoenixUsed&&n>=u.hp&&!d.transfer&&!d.debt){u.kit.phoenixUsed=true;const floor=Math.round((has(u,'B01')?.3:.2)*u.maxHp);u.hp=Math.max(u.hp,floor);n=Math.max(0,u.hp-floor);f.battle.emit('prevent',u,u,'Cracked, Not Gone');
   f.after(()=>{if(has(u,'A06'))u.kit.brighterCrack=.8*f.stats(u).M;if(has(u,'B08'))refund(u,'Luminous Seams',1e6);if(has(u,'C07'))for(const t of f.others(u))ward(f,u,t,.6*f.stats(u).M,3,'A Light Remains');});
  }return n;
 },
 healAmount(f,u,n,source,t){return t===u&&has(u,'B08')&&u.kit.phoenixUsed?n*1.25:n;},
 primary(f,u,n,c,kind){
  if(c.u!==u||kind!=='damage')return n;
  if(c.s.name==='Glassflame'){if(glassShield(f,u)&&has(u,'A01'))n+=.3*c.M;const e=f.remove(c.t,'Scored Pane:'+u.id);if(e)n+=.25*c.M;}
  if(c.s.name==='Shatterwing'){if(glassShield(f,u)&&has(u,'A03'))n+=.3*c.M;n+=spend(u,'brighterCrack');}
  if(u.kit.lastRadiance){u.kit.lastRadiance=false;n*=1.2;}return n;
 },
 outgoing(f,u,n,a,t,d){
  if(a===u&&d.category==='magic'&&!has(u,'B03')&&!has(u,'A08')&&pool(u,u,'Luminous Seams'))n*=1.1;
  if(a===u&&d.active&&d.primary&&f.currentCompanionCast?.s.name==='Glassflame'&&has(u,'A02')&&(u.shield>0||glassShield(f,u)))d.magicBypassPoints=Math.max(d.magicBypassPoints||0,.06);
  if(a===f.trainer(u)&&has(u,'C08')&&pool(a,u,'Luminous Seams')){
   if(a.basicCategory==='magic'){if(d.category==='magic'&&!has(u,'B03'))n*=1.1;}
   else if(d.basic&&f.ready(u,'phoenixLantern',1))f.after(()=>f.proc(u,t,.2*f.stats(u).M,'magic','Phoenix Lantern'));
  }return n;
 },
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Gleaming Target')?.source===u.id?n+20:n;},
 landed(f,u,a,t,r,d){
  if(a===u&&d.basic&&has(u,'B07')&&u.hp<u.maxHp*.5&&u.kit.talentBasics%3===0)heal(f,u,u,.02*u.maxHp,'Patient Reforging');
  if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Gleaming Target');if(e?.source===u.id&&!e.beacon){e.beacon=true;heal(f,u,u,.2*f.stats(u).M,'Beacon Hit');}}
 },
 shield(f,u,g){if(g.source===u&&g.label==='Luminous Seams'&&has(u,'B03'))g.amount*=1.3;},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Luminous Seams'&&has(u,'C01'))ward(f,u,f.trainer(u),n*.5,3,'Borrowed Pane');},
 broken(f,u,a,t,p){if(p.source!==u.id||p.label!=='Luminous Seams')return;if(has(u,'A07'))u.kit.lastRadiance=true;if(has(u,'B05'))buff(f,u,t,'Heat-Treated Pane','dr',.2,2);if(has(u,'C06'))buff(f,u,f.trainer(u),'Good Glass','nextActiveDR',.15,3,{once:true});},
 effectExpired(f,u,t,e){if(t===u&&e.key==='Glass Cannon'&&has(u,'A07'))u.kit.lastRadiance=true;},
 cast(f,u,c){
  if(c.s.name==='Luminous Seams'){
   if(has(u,'A08')){buff(f,u,u,'Glass Cannon','magicDamage',.25,3);c.primary={kind:'utility',amount:0,target:u};}
   else{c.shield(has(u,'C08')?c.tr:u,c.M,3);if(!has(u,'B03')&&!has(u,'C08'))buff(f,u,u,'Luminous Seams','shieldMagic',.1,3);}return true;
  }
  if(c.s.name==='Shatterwing'){const pane=glassShield(f,u);c.hit(2.8*c.M,{area:true});if(!(has(u,'B08')&&u.kit.phoenixUsed))c.splash((.5+(pane&&has(u,'A05')?.2:0))*c.M);return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Glassflame'){
   if(hit&&has(u,'A04')&&(u.shield>0||glassShield(f,u)))buff(f,u,c.t,'Scored Pane:'+u.id,'scoredPane',1,3,{harmful:true});
   if(has(u,'B02')&&u.hp<u.maxHp*.7){heal(f,u,u,.25*c.M,'Cooling Flame');if(has(u,'B04')&&u.kit.phoenixUsed)ward(f,u,u,.2*c.M,3,'Cauterized Seam');}
   if(hit&&has(u,'C02'))buff(f,u,c.t,'Gleaming Target','gleamingTarget',20,3,{harmful:true});
  }
  if(c.s.name==='Shatterwing'){
   if(hit&&alive(c.t)&&has(u,'B06'))heal(f,u,u,.5*c.M,'Safe Shatter');
   if(has(u,'C03')){const t=f.lowest(u,c.other),n=ward(f,u,t,.4*c.M,3,'Protective Shards');if(has(u,'C05'))for(const other of c.other.filter(v=>v!==t))ward(f,u,other,n*.5,3,'Pane for Two');}
  }
 }
});
function pristine(u,t){const hp=t.hp/t.maxHp;return hp>(has(u,'A01')||has(u,'A08')?.65:.8)||has(u,'A08')&&hp<.35;}
register('heronveil',{
 pristineOpening(){return true;},
 beforeCast(f,u,c){if(c.u!==u)return;c.pristine=alive(c.t)&&pristine(u,c.t);if(c.s.kind==='hit'){c.veilAim=spend(u,'curtainAim');if(c.veilAim)c.mods.hit=(c.mods.hit||0)+25;}},
 outgoing(f,u,n,a,t,d){
  if(a===u){if(pristine(u,t)&&d.category!=='magic')d.penetration=Math.max(d.penetration||0,.08);if(has(u,'A08')&&!pristine(u,t))n*=.85;}
  else if(allies(u,a)&&has(u,'C01')&&t.id===u.targetId&&pristine(u,t)){if(d.category==='magic')d.magicBypassPoints=Math.max(d.magicBypassPoints||0,.04);else d.penetration=Math.max(d.penetration||0,.04);}
  return n;
 },
 hitBonus(f,u,n,a,t,d){if(a===u&&d.active&&f.currentCompanionCast?.s.name==='Needle Beak'&&u.kit.freshCloth){u.kit.freshCloth=false;n+=25;}return n;},
 primary(f,u,n,c,kind){if(c.u===u&&kind==='damage'&&c.s.name==='Needle Beak'){if(c.pristine&&has(u,'A02'))n+=.3*c.A;n+=spend(u,'slippingNeedle');}return n;},
 incoming(f,u,n,a,t,d){
  if(t===u){const parry=f.get(a,'Revealing Parry:'+u.id);if(d.basic&&parry){f.remove(a,parry.key);n*=.75;if(has(u,'B05'))f.after(()=>ward(f,u,u,.3*f.stats(u).A,3,'Safe Reveal'));}
   if(d.active&&d.primary&&has(u,'B06')){const p=pool(u,u,'Draped Wing');if(p&&!p.curtain){p.curtain=true;n*=.8;}}
  }
  if(t===f.trainer(u)&&d.active&&d.primary&&has(u,'C04')&&f.get(a,'Needle Blind')?.source===u.id)n*=.9;
  if(allies(u,a)&&has(u,'C07')&&t.id===u.targetId){d.veilAbove||={};d.veilAbove[u.id]=t.hp/t.maxHp>(has(u,'A01')||has(u,'A08')?.65:.8);}return n;
 },
 damaged(f,u,a,t,n,s,d){if(d.veilAbove?.[u.id]&&n>0&&t.hp/t.maxHp<=(has(u,'A01')||has(u,'A08')?.65:.8)&&!u.kit['fallingCurtain:'+t.id]){u.kit['fallingCurtain:'+t.id]=true;ward(f,u,f.trainer(u),.3*f.stats(u).A,3,'Falling Curtain');}},
 effect(f,u,g){if(g.source===u&&g.key==='Draped Wing')g.duration=has(u,'B08')?1e6:has(u,'B01')?4:3;},
 shield(f,u,g){if(g.source===u&&g.target===u&&g.label==='Draped Wing'){if(has(u,'B01'))g.amount+=.03*u.maxHp;if(has(u,'B08'))g.amount*=.5;}},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Draped Wing'&&has(u,'C03'))ward(f,u,f.trainer(u),n*.5,3,'Shared Drape');},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Draped Wing'&&has(u,'B07'))f.after(()=>heal(f,u,u,.35*f.stats(u).A,'Mended Veil'));},
 missed(f,u,a,t,d){
  if(!d.basic)return;if(t===u&&has(u,'B04')){const e=f.get(u,'Draped Wing');if(e&&!e.slipping){e.slipping=true;u.kit.slippingNeedle=.3*f.stats(u).A;}}
  if(t===f.trainer(u)&&has(u,'C05')){const e=f.get(t,'Shared Drape');if(e?.source===u.id&&!e.curtainCall){e.curtainCall=true;u.kit.curtainAim=25;}}
 },
 death(f,u,a,t){if(has(u,'A07')&&t.side!==u.side&&!t.temporary&&t.id===u.kit.originalTarget){const next=f.battle.target(u);if(alive(next)&&next!==t){ward(f,u,u,.4*f.stats(u).A,3,'Fresh Cloth');u.kit.freshCloth=true;}}},
 cast(f,u,c){if(c.s.name==='Part the Veil'){const primer=f.remove(u,'Aimed Reveal'),enhanced=c.pristine&&!has(u,'B08')&&!has(u,'C08');c.hit(((enhanced?3.3:2.8)*c.A+(primer?.value||0))*(has(u,'C08')?.5:1));return true;}},
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Draped Wing'){if(has(u,'A03'))buff(f,u,u,'Aimed Reveal','aimedReveal',.4*c.A,has(u,'A05')?1e6:3);if(has(u,'C03'))buff(f,u,c.tr,'Shared Drape','flee',12.5,3);}
  if(c.s.name==='Needle Beak'&&hit){if(c.pristine&&has(u,'A04'))buff(f,u,c.t,'Unmarked Page','healReceived',-.25,3,{harmful:true});if(has(u,'B02')&&pool(u,u,'Draped Wing'))heal(f,u,u,.25*c.A,'Needle Stitch');if(has(u,'C02'))buff(f,u,c.t,'Needle Blind','hit',-20,3,{harmful:true});}
  if(c.s.name==='Part the Veil'&&hit){
   if(has(u,'A06'))f.later(u,c.t,.4,()=>f.proc(u,c.t,.4*c.A,'melee','Second Spear'),{ownerRequired:true,label:'Second Spear'});
   if(has(u,'B03'))buff(f,u,c.t,'Revealing Parry:'+u.id,'revealingParry',.25,3,{harmful:true});
   if(has(u,'C06'))buff(f,u,c.t,'Expose the Stitch','shieldReceived',-.3,4,{harmful:true});
   if(has(u,'C08'))for(const t of f.nearby(u,c.t,18,3,c.t)){buff(f,u,t,'Needle Blind','hit',-20,3,{harmful:true});buff(f,u,t,'Expose the Stitch','shieldReceived',-.3,4,{harmful:true});}
  }
 }
});
function honeyNectar(f,u,t,charges=1,waking=false){buff(f,u,t,'Nectar','honeyNectar',charges,3,{waking,replace:true});}
function consumeNectar(f,u,t,enemy){
 const e=f.get(t,'Nectar');if(!e?.value||e.source!==u.id||e.kind!=='honeyNectar')return false;e.value--;if(!e.value)f.remove(t,e.key);const {M}=f.stats(u);
 if(has(u,'A07'))u.kit.passedMelody=t.id;
 f.after(()=>{if(has(u,'B01'))heal(f,u,t,.2*M,'Soothing Aftertaste');if(has(u,'B08')){heal(f,u,t,.5*M,'Nectar for Survival');buff(f,u,t,'Nectar for Survival','nextDirectDR',.15,2,{once:true});}
  const duet=f.get(t,'Golden Duet');if(has(u,'A05')&&duet?.source===u.id&&(duet.responses||0)<2){duet.responses=(duet.responses||0)+1;ward(f,u,t,.2*M,3,'Duet Response');}
  if(has(u,'C02')&&alive(enemy)&&f.battle.inRange(t,enemy)&&f.ready(u,'throatDart',1))f.proc(u,enemy,(.15+(has(u,'C04')&&f.get(enemy,'Sour Note')?.source===u.id?.1:0))*M,'magic','Throat Dart');
 });return true;
}
register('honeybat',{
 sweetFollow(){return true;},
 support(f,u,s){if(s.name==='Honeychorus'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Honeychorus'&&has(u,'C08'))return alive(c.t);if(c.s.name==='Nectar Note'&&has(u,'A02'))return c.all.length>0;if(c.s.name==='Golden Duet'&&has(u,'A08'))return c.other.length>0;},
 overchargeAllowed(f,u,s){if(s.name==='Honeychorus'&&has(u,'C08')||s.name==='Golden Duet'&&has(u,'A08'))return true;},
 hitBonus(f,u,n,a,t,d){if(allies(u,a)&&d.basic){const e=f.get(a,'Nectar');if(e?.source===u.id&&e.waking&&has(u,'A04')){e.waking=false;n+=25;}}return n;},
 outgoing(f,u,n,a,t,d){if(allies(u,a)&&d.basic&&consumeNectar(f,u,a,t)&&!has(u,'B08'))n*=has(u,'A01')?1.25:1.15;return n;},
 healAmount(f,u,n,source,t,o,label){if(source===u&&o.primary&&u.kit.passedMelody&&u.kit.passedMelody!==t.id){u.kit.passedMelody=null;n+=.2*f.stats(u).M;}if(source===u&&label==='Nectar Note'&&has(u,'B02')&&t.hp<t.maxHp*.5)n+=.25*f.stats(u).M;return n;},
 healed(f,u,source,t,n,label,o){
  if(source===u&&o.primary){
   if(n>0)honeyNectar(f,u,t);
   if(label==='Nectar Note'){if(has(u,'A02'))honeyNectar(f,u,t,1,true);if(has(u,'B04'))ward(f,u,t,Math.min(.4*f.stats(u).M,.4*(o.offered-n)),3,'Sticky Comfort');}
   if(label==='Golden Duet'&&n>0&&has(u,'B05'))heal(f,u,u,.2*n,'Matched Breaths');
   if(t===f.trainer(u)&&o.before<t.maxHp*.35&&has(u,'B07')&&!u.kit.emergencySong){u.kit.emergencySong=true;ward(f,u,t,.8*f.stats(u).M,3,'Emergency Song');}
  }
  const e=f.get(t,'Sour Note');if(t.side!==u.side&&n>0&&has(u,'C07')&&e?.source===u.id&&!e.bitter){e.bitter=true;ward(f,u,u,.3*f.stats(u).M,3,'Bitter Return');}
 },
 landed(f,u,a,t,r,d){if(!allies(u,a)||!has(u,'C03'))return;const e=f.remove(a,'Honey Trap:'+u.id);if(e){buff(f,u,t,'Honey Trap blind','hit',-20,3,{harmful:true});if(has(u,'C05'))buff(f,u,t,'Weakened active','activeWeakness',.12,3,{harmful:true});}},
 cast(f,u,c){
  if(c.s.name==='Golden Duet'){
   const t=has(u,'B03')?c.low:unbuffedBest(f,u);if(has(u,'A08')){c.shield(t,.8*c.M);honeyNectar(f,u,t,3);}else c.heal(t,(.8+(has(u,'B03')?.3:0))*c.M);
   buff(f,u,t,'Golden Duet','basicTempo',.12,has(u,'A03')?5:3);if(has(u,'C03'))buff(f,u,t,'Honey Trap:'+u.id,'honeyTrap',1,3);return true;
  }
  if(c.s.name==='Honeychorus'){
   if(has(u,'C08')){c.hit(1.8*c.M);c.splash(.6*c.M,18,2,'magic');for(const r of c.results.filter(r=>r.hit))buff(f,u,r.target,'Sour Note','healReceived',-.2,3,{harmful:true});}
   else{for(const t of c.all)c.heal(t,(.9+(has(u,'B06')&&t===c.tr&&c.low===c.tr?.4:0))*c.M);}
   for(const t of c.all)honeyNectar(f,u,t,has(u,'A06')?2:1);return true;
  }
 },
 afterCast(f,u,c){if(c.u!==u)return;if(c.s.name==='Nectar Note'&&has(u,'C01'))buff(f,u,c.t,'Sour Note','healReceived',-.2,3,{harmful:true});if(c.s.name==='Honeychorus'&&has(u,'C06')&&!has(u,'C08')){f.proc(u,c.t,.4*c.M,'magic','Stinging Chorus');const t=f.nearby(u,c.t,18,2,c.t).find(t=>t!==c.t);if(t)f.proc(u,t,.2*c.M,'magic','Stinging Chorus',{secondary:true,area:true});}}
});
function maskGrant(f,u){if(f.ready(u,'watchfulCD',2))buff(f,u,u,'Watchful Mask','resource',1,has(u,'A01')?4:2);}
function maskSpend(f,u,a,t,active=false){
 const e=f.remove(u,'Watchful Mask');if(!e)return 0;const {A}=f.stats(u),point=u.kit.pointedFeather===t.id;
 if(point)u.kit.pointedFeather=null;
 const hush=f.get(t,'Weakened active');if(has(u,'B06')&&hush?.source===u.id&&hush.hushFeather&&(hush.extension||0)<2){hush.extension=(hush.extension||0)+1;hush.until+=1;}
 f.after(()=>{if(point&&has(u,'A04'))heal(f,u,u,.2*A,'Late Answer');if(has(u,'C01'))ward(f,u,f.trainer(u),.25*A,3,'Protective Reply');if(has(u,'C08'))ward(f,u,a,.4*A,3,'Owl Behind the Throne');});
 return ((has(u,'C08')?.5:active?.9:.35)+(has(u,'A01')?.2:0)+(point&&has(u,'A02')?.25:0))*A;
}
const silenceResisted=(f,t)=>!!t&&(t.boss&&t.controlImmune?.includes('Silence')||!!f.get(t,'Immunity:Silence'));
register('opalowl',{
 watchfulMask(){return true;},
 beforeCast(f,u,c){if(c.u===u){c.maskStored=f.has(u,'Watchful Mask');if(c.s.kind==='hit'&&has(u,'A08'))c.maskBonus=maskSpend(f,u,u,c.t,true);}},
 primary(f,u,n,c,kind){if(c.u===u&&kind==='damage'){n+=(c.maskBonus||0);if(c.s.name==='Shut the Mask'&&c.maskStored&&has(u,'A03'))n+=.4*c.A;if(c.s.name==='Unspoken Verdict'&&has(u,'B03'))n*=.85;if(c.s.name==='Shut the Mask'&&has(u,'B08'))n*=.5;}return n;},
 outgoing(f,u,n,a,t,d){
  if(a===u){if(d.basic){if(has(u,'A08'))n*=.8;if(!has(u,'C08'))n+=maskSpend(f,u,u,t);}if(d.active&&d.primary&&f.currentCompanionCast?.s.name==='Unspoken Verdict'&&has(u,'A06')&&(u.kit.enemyCasts?.[t.id]??-Infinity)>=f.battle.time-2)d.penetration=Math.max(d.penetration||0,.08);}
  else if(a===f.trainer(u)&&d.basic&&has(u,'C08')){const amount=maskSpend(f,u,a,t);if(amount)f.after(()=>f.proc(a,t,amount,'melee','Owl Behind the Throne'));}return n;
 },
 incoming(f,u,n,a,t,d){return d.active&&d.primary&&f.get(a,'Vow of Silence')?.source===u.id?n*.75:n;},
 damaged(f,u,a,t,n,s,d){if(allies(u,t)&&a?.side!==u.side&&n>0){u.kit.lastVictim||={};u.kit.lastVictim[a.id]=t.id;}},
 offenseConsumed(f,u,a,t,e){if(e.source!==u.id||!e.hushFeather)return;if(has(u,'B04'))buff(f,u,a,'Quiet Punishment','hit',-20,3,{harmful:true});if(has(u,'C04')&&allies(u,t))f.after(()=>heal(f,u,t,.25*f.stats(u).A,'Witnessed Harm'));},
 effectExpired(f,u,t,e){if(t===u&&e.key==='Watchful Mask'&&has(u,'C07'))ward(f,u,f.lowest(u),.2*f.stats(u).A,3,'Remember the Cast');},
 effect(f,u,g){if(g.source!==u)return;if(g.key==='Weakened active'&&f.currentCompanionCast?.s.name==='Hush Feather'){if(has(u,'B01'))g.duration=5;g.extra.hushFeather=true;}if(g.key.startsWith('Unspoken ')&&has(u,'B03'))g.value=-.35;},
 cast(f,u,c){if(c.s.name==='Shut the Mask'){const resist=silenceResisted(f,c.t);c.hit((1.4+(resist&&has(u,'A05')&&!has(u,'B08')?.35:0))*c.A);if(has(u,'B08'))c.debuff('Vow of Silence','vowSilence',.25,4);else{c.control(1,'Silence');if(resist&&has(u,'B07'))ward(f,u,c.tr,.35*c.A,3,'Smooth Mask');}return true;}},
 afterCast(f,u,c){
  if(c.u!==u){if(c.u.side!==u.side){u.kit.enemyCasts||={};u.kit.enemyCasts[c.u.id]=f.battle.time;if(c.u.id===u.targetId)maskGrant(f,u);}return;}
  const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.kind==='hit'){u.kit.watchHands=(u.kit.watchHands||0)+1;if(has(u,'A07')&&u.kit.watchHands%3===0)maskGrant(f,u);}
  if(c.s.name==='Hush Feather'&&hit){if(has(u,'A02'))u.kit.pointedFeather=c.t.id;if(has(u,'B02'))buff(f,u,c.t,'Weakened basic','basicWeakness',.2,3,{harmful:true});if(has(u,'C02')){const t=c.b.target(c.t);if(allies(u,t))ward(f,u,t,.3*c.A,3,'Covering Feather');}}
  if(c.s.name==='Shut the Mask'&&has(u,'C03')){const t=f.lowest(u);buff(f,u,t,'Mask the Weak','flee',20,3);if(has(u,'C05'))charge(f,u,t,'Quiet Courage',.2*c.A);}
  if(c.s.name==='Unspoken Verdict'&&hit){if(has(u,'B05'))buff(f,u,c.t,'No Applause','shieldReceived',-.2,3,{harmful:true});if(has(u,'C06'))ward(f,u,c.all.find(t=>t.id===u.kit.lastVictim?.[c.t.id])||c.tr,.5*c.A,3,'Verdict for the Victim');}
 }
});
const razorWounds=(f,u,t)=>Object.values(t?.effects||{}).filter(e=>e.source===u.id&&e.key.startsWith('Serrated Edge:')&&e.until>f.battle.time);
const razorBleeding=(f,u,t)=>bleeding(f,t)||f.has(t,'Serrated Mark:'+u.id);
function serrate(f,u,t,normal=false){
 if(!alive(t))return;const {A}=f.stats(u);
 if(has(u,'A08')&&!normal){buff(f,u,t,'Serrated Mark:'+u.id,'bleedingMark',1,3,{harmful:true});return;}
 const duration=has(u,'B01')?4:2,stacked=has(u,'B08')&&!normal,wounds=razorWounds(f,u,t);
 if(stacked&&wounds.length>=3){wounds.sort((a,b)=>a.until-b.until);f.remove(t,wounds[0].key);}
 f.dot(u,t,'Serrated Edge:'+u.id+(stacked?':'+(++f.sequence):''),.2*A*duration*(stacked?.6:1),duration,'melee',{label:'Serrated Edge',ownerRequired:true,afterTick:r=>{
  if(has(u,'B03')&&f.has(u,'Blade Poise critical'))limited(f,u,'bloodPoise',.25*(r?.damage||0),.3*A,n=>heal(f,u,u,n,'Blood Poise',n));
  if(has(u,'B07')&&u.hp<u.maxHp*.5&&f.ready(u,'satedBlade',5))ward(f,u,u,.4*A,3,'Sated Blade');
 }});
}
register('razorswift',{
 serratedEdge(){return true;},
 beforeCast(f,u,c){if(c.u!==u)return;c.razorBleeding=razorBleeding(f,u,c.t);c.finishingArc=(u.kit.razorCrits?.[c.t?.id]??-Infinity)>=f.battle.time-2;if(c.s.kind==='hit')c.razorFocus=!!f.remove(u,'Razor Focus');},
 hitBonus(f,u,n,a,t,d){if(a===u){if(d.active&&f.currentCompanionCast?.s.name==='Crescent Slice'&&razorBleeding(f,u,t)&&has(u,'A02'))n+=20;if(d.basic&&f.remove(u,'Blood in Sight'))d.critBonus=(d.critBonus||0)+.15;}if(a===f.trainer(u)&&has(u,'C03')&&f.has(a,'Pack Poise')&&razorBleeding(f,u,t))n+=20;return n;},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(has(u,'B08'))n*=.85;if(d.active&&d.primary&&f.currentCompanionCast?.razorFocus)d.penetration=Math.max(d.penetration||0,.08);if(d.basic&&u.kit.newCut&&u.kit.newCut!==t.id){u.kit.newCut=null;f.after(()=>f.proc(u,t,.4*f.stats(u).A,'melee','New Cut'));}return n;},
 incoming(f,u,n,a,t,d){return t===u&&d.basic&&has(u,'B05')&&f.has(u,'Blade Poise critical')&&f.enemies(u).some(t=>razorWounds(f,u,t).length)?n*.88:n;},
 landed(f,u,a,t,r,d){
  if(a===u&&d.basic&&r.critical){u.kit.razorCrits||={};u.kit.razorCrits[t.id]=f.battle.time;if(has(u,'A08'))f.proc(u,t,.6*f.stats(u).A,'melee','Single Red Line');serrate(f,u,t);}
  if(a===f.trainer(u)&&d.basic&&r.critical&&has(u,'C05')){const e=f.get(a,'Pack Poise');if(e?.source===u.id&&!e.shared){e.shared=true;serrate(f,u,t,true);}}
 },
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.bluntedCrescent&&has(u,'C04')&&allies(u,t))f.after(()=>ward(f,u,t,.25*f.stats(u).A,3,'Thorn Warning'));},
 healed(f,u,source,t,n){if(n>0&&t.side!==u.side&&has(u,'C07')&&razorWounds(f,u,t).length&&f.ready(u,'clippedRecovery',3))ward(f,u,f.trainer(u),.25*f.stats(u).A,3,'Clipped Recovery');},
 death(f,u,a,t){if(has(u,'A07')&&t.side!==u.side&&!t.temporary&&razorBleeding(f,u,t))u.kit.newCut=t.id;},
 cast(f,u,c){
  if(c.s.name==='Crescent Slice'){c.hit((c.razorBleeding?1.6:1.35)*c.A);return true;}
  if(c.s.name==='Red Arc'){
   c.hit((2.7+(has(u,'A03')&&c.finishingArc?.5:0))*c.A*(has(u,'C08')?.5:1));
   if(c.results[0]?.hit&&(c.razorBleeding||has(u,'C08'))){const targets=has(u,'C08')?f.nearby(u,c.t,18,3,c.t):[c.t];for(const t of targets){if(has(u,'C08'))serrate(f,u,t);buff(f,u,t,'Red Arc','healReceived',has(u,'C01')?-.35:-.25,has(u,'C01')?4:3,{harmful:true});if(has(u,'C06')||has(u,'C08'))buff(f,u,t,'Bloodless Repairs','shieldReceived',-.25,has(u,'C01')?4:3,{harmful:true});}}return true;
  }
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.find(r=>r.primary&&r.hit);
  if(c.s.name==='Blade Poise'){u.kit.poiseExtension=0;if(has(u,'A01')&&c.b.inRange(u,c.t))serrate(f,u,c.t);if(has(u,'A06'))buff(f,u,u,'Razor Focus','razorFocus',1,3);if(has(u,'C03'))buff(f,u,c.tr,'Pack Poise','packPoise',20,3);}
  if(c.s.name==='Crescent Slice'&&hit){
   if(c.razorBleeding&&hit.critical&&has(u,'A04')&&(u.kit.poiseExtension||0)<2){u.kit.poiseExtension=(u.kit.poiseExtension||0)+1;for(const key of ['Blade Poise critical','Blade Poise aim']){const e=f.get(u,key);if(e)e.until+=1;}}
   if(has(u,'B02')){const wounds=razorWounds(f,u,c.t);if(has(u,'B04')&&wounds.length){const e=wounds.sort((a,b)=>a.until-b.until)[0];f.extendDot(u,c.t,e.key,Math.max(0,Math.min(2,6-e.until+f.battle.time)));}else serrate(f,u,c.t);}
   if(has(u,'C02')&&razorBleeding(f,u,c.t))buff(f,u,c.t,'Weakened active','activeWeakness',.12,3,{harmful:true,bluntedCrescent:true});
  }
  if(c.s.name==='Red Arc'){if(c.finishingArc&&has(u,'A05'))buff(f,u,u,'Blood in Sight','nextCrit',.15,75);if(hit&&c.razorBleeding&&has(u,'B06'))heal(f,u,u,.5*c.A,'Red Recovery');}
 }
});
function reserveCount(f,u){u.kit.reserveSteps=(u.kit.reserveSteps||0)+1;if(u.kit.reserveSteps<3)return;u.kit.reserveSteps=0;u.kit.cutReserves||=[];const A=f.stats(u).A;if(has(u,'B08')){if(u.kit.cutReserves.length<2)u.kit.cutReserves.push({amount:.35*A});}else if(!u.kit.cutReserves.length||u.kit.cutReserves[0].amount<(has(u,'B01')?.4:.2)*A)u.kit.cutReserves=[{amount:(has(u,'B01')?.4:.2)*A}];}
register('reedwren',{
 wasteNothing(){return true;},
 incoming(f,u,n,a,t,d){return t===f.trainer(u)&&d.basic&&has(u,'C04')&&f.get(a,'Disorienting Cross')?.source===u.id?n*.9:n;},
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Clean Cut')c.cleanLedger=true;},
 primary(f,u,n,c,kind){return c.u===u&&kind==='damage'&&c.s.name==='Clean Cut'&&has(u,'B06')?n*.85:n;},
 outgoing(f,u,n,a,t,d){
  const c=f.currentCompanionCast;if(a===u&&c?.u===u)d.cutSkill=c.s.name;
  const wearer=has(u,'C08')?f.trainer(u):u;if(a!==wearer||!d.primary)return n;const reserve=u.kit.cutReserves?.shift();if(!reserve)return n;
  d.cutOwner=u.id;d.cutSpent=reserve.amount;d.cutBase=n;
  n+=reserve.amount;if(a===u&&c?.s.name==='Crosscut Gust'&&has(u,'A02'))n+=.25*f.stats(u).A;d.cutRatio=reserve.amount/Math.max(1,n);
  f.after(()=>{if(has(u,'C01'))ward(f,u,f.lowest(u,f.others(u)),.4*reserve.amount,3,'Gift of the Cut');if(has(u,'C08'))ward(f,u,a,.5*reserve.amount,3,'Reserve for Another');if(a===u&&has(u,'B05')&&f.has(u,'Sturdy Edge'))heal(f,u,u,.3*f.stats(u).A,'Slip and Mend');});
  if(c?.u===u)c.cutSpent=reserve.amount;return n;
 },
 landed(f,u,a,t,r,d){
  if(a===f.trainer(u)&&d.basic&&has(u,'C05')&&u.kit.guidedSlipTarget===t.id){u.kit.guidedSlipTarget=null;f.proc(a,t,.2*f.stats(u).A,'melee','Shared Edge');}
  if(a!==u||t.temporary)return;const spent=d.cutOwner===u.id,skill=d.cutSkill,A=f.stats(u).A;
  if(!spent&&d.basic)reserveCount(f,u);
  if(alive(t)||has(u,'B08'))return;
  const ledger=skill==='Clean Cut'&&has(u,'A03');if(!spent||ledger){
   const available=Math.max(0,(r.overkill||0)-(spent?(r.damage+(r.overkill||0))*(d.cutRatio||0):0)),amount=Math.min((has(u,'A01')?1.1:.7)*A,available);u.kit.cutReserves||=[];
   if(amount>0&&(!u.kit.cutReserves.length||u.kit.cutReserves[0].amount<amount))u.kit.cutReserves=[{amount,ledger}];
   if(has(u,'A07')&&f.ready(u,'secondCut',3))refund(u,'Crosscut Gust',1);
   if(has(u,'A08')&&amount>0){const next=f.battle.target(u);if(alive(next)&&next!==t&&f.battle.inRange(u,next)){const reserve=u.kit.cutReserves.shift();if(reserve)f.proc(u,next,reserve.amount+.4*A,'melee','Leave Nothing Behind');}}
  }
 },
 missed(f,u,a,t,d){if(a===u&&d.basic)u.kit.reserveSteps=has(u,'B07')?Math.max(0,(u.kit.reserveSteps||0)-1):0;},
 death(f,u,a,t){if(t.side!==u.side&&!t.temporary&&has(u,'C07')&&f.get(t,'Mark the End')?.source===u.id&&f.ready(u,'windBelow',3))ward(f,u,f.trainer(u),.4*f.stats(u).A,3,'Wind from Below');},
 hitBonus(f,u,n,a,t,d){
  const wearer=has(u,'C08')?f.trainer(u):u;if(a===wearer&&d.primary!==false&&u.kit.cutReserves?.[0]?.ledger&&has(u,'A05'))n+=25;
  if(a===f.trainer(u)&&d.basic){const e=f.get(a,'Guided Slip');if(e?.source===u.id){f.remove(a,e.key);n+=25;if(has(u,'C05'))u.kit.guidedSlipTarget=t.id;}}return n;
 },
 attempted(f,u,a,t,d){if(a===f.trainer(u)&&d.basic)u.kit.guidedSlipTarget=null;},
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Crosscut Gust'&&hit){if(!c.cutSpent&&has(u,'B02')){reserveCount(f,u);if(has(u,'B04'))buff(f,u,u,'Count the Lines','nextBasicHit',20,75);}if(c.cutSpent&&has(u,'A04'))buff(f,u,c.t,'Crosswind Scar','physicalExposure',.06,3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Disorienting Cross','hit',-20,3,{harmful:true});}
  if(c.s.name==='Slipstream Edge'){if(has(u,'B03'))buff(f,u,u,'Sturdy Edge','flee',20,3);if(c.cutSpent&&hit&&alive(c.t)&&has(u,'A06'))ward(f,u,u,.3*c.A,3,'Slip the Margin');if(has(u,'C03'))buff(f,u,c.tr,'Guided Slip','guidedSlip',25,3);}
  if(c.s.name==='Clean Cut'){if(c.cutSpent&&has(u,'B06'))ward(f,u,u,.6*c.A,3,'Measured Cut');if(hit&&has(u,'C06'))buff(f,u,c.t,'Mark the End','healReceived',-.25,4,{harmful:true});}
 }
});
register('rillrook',{
 support(f,u,s){if(s.name==='Pebble Promise'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Pebble Promise'&&has(u,'C08'))return alive(c.t);},
 incoming(f,u,n,a,t,d){return t===u&&d.direct!==false&&!d.dot&&has(u,'A05')&&pool(f.trainer(u),u,'Precious Circle')?n*.85:n;},
 effect(f,u,g){if(g.source===u&&g.key==='Precious Circle'){if(has(u,'A03'))g.duration=4;if(has(u,'A08')){g.duration=1e6;g.extra.requiresPool='Precious Circle';}}},
 shield(f,u,g){if(g.source!==u)return;if(g.label==='Held Dear'&&has(u,'A01'))g.amount+=.04*u.maxHp;if(g.label==='Pebble Promise'&&has(u,'A02'))g.duration=5;if(g.label==='Precious Circle'&&has(u,'A08')){g.amount*=.7;g.duration=1e6;}},
 shielded(f,u,source,t,n,label,p,o){
  if(source!==u)return;
  if(label==='Held Dear'){if(has(u,'A07'))refund(u,'Pebble Promise',1e6);if(has(u,'C07'))u.kit.Grief=f.stats(u).M;}
  if(label==='Precious Circle'&&!o.talent&&has(u,'B03'))ward(f,u,f.lowest(u,f.others(u).filter(t=>t.slot>0)),n*.5,has(u,'A08')?1e6:4,'Open Circle');
 },
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(p.label==='Pebble Promise'&&has(u,'A04')||p.label==='Open Circle'&&has(u,'B05'))f.after(()=>heal(f,u,t,.35*f.stats(u).M,'Promise Remembered'));},
 absorbed(f,u,a,t,p,n,d){if(t!==u&&allies(u,t)&&p.source===u.id&&has(u,'C01')&&!d.transfer&&!d.debt)f.add(u,'Grief',n*.2,f.stats(u).M);},
 outgoing(f,u,n,a,t,d){
  if(a!==u)return n;if(d.basic)n+=spend(u,'Grief');const e=f.get(t,'Pointed Promise');if(e?.source===u.id){f.remove(t,e.key);n+=.25*f.stats(u).M;if(has(u,'C04'))f.after(()=>buff(f,u,t,'Remember the Face','magicExposure',.06,3,{harmful:true}));}return has(u,'A08')?n*.5:n;
 },
 healAmount(f,u,n,source,t,o){if(source===u&&t.hp<t.maxHp*.4&&has(u,'B07')&&f.ready(u,'kindReminder',5))n+=.5*f.stats(u).M;return n;},
 healed(f,u,source,t,n,label,o){
  if(source!==u)return;
  if(label==='Pebble Promise'&&n>0&&has(u,'B04'))buff(f,u,t,'Comforted Hands','hit',20,3);
  if(label!=='Remembered Warmth')return;const c=f.currentCompanionCast;
  if(has(u,'B06')){const remaining=Math.max(0,.6*f.stats(u).M-(c?.warmOverflow||0)),amount=Math.min(remaining,.4*(o.offered-n)),actual=ward(f,u,t,amount,3,'Memory Overflow',{maximum:remaining});if(c)c.warmOverflow=(c.warmOverflow||0)+actual;}
  if(n>0&&has(u,'C03')){const target=f.battle.target(u);if(alive(target)&&f.battle.inRange(u,target))f.proc(u,target,.3*f.stats(u).M+(has(u,'C05')?Math.min(.5*f.stats(u).M,.5*n):0),'magic','Painful Memory');}
 },
 cast(f,u,c){
  if(c.s.name==='Remembered Warmth'){const amount=(1.3+(has(u,'B01')||c.low===c.tr?.2:0))*c.M;c.heal(c.low,amount*(has(u,'B08')?.7:1));if(has(u,'B08'))for(const t of c.all.filter(t=>t!==c.low))c.heal(t,amount*.35);if(c.low===c.tr&&has(u,'A06'))ward(f,u,c.tr,.3*c.M,3,'Familiar Warmth');return true;}
  if(c.s.name==='Pebble Promise'&&has(u,'C08')){c.hit(1.4*c.M+spend(u,'Grief'));const r=c.results[0];if(r?.hit)ward(f,u,c.tr,Math.min(c.M,.3*r.damage),3,'Pebble Becomes Spear',{maximum:c.M});return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;
  if(c.s.name==='Pebble Promise'){if(has(u,'B02'))c.heal(c.tr,.25*c.M);if(has(u,'C02')){const t=c.tr&&c.b.target(c.tr);if(alive(t)&&c.b.inRange(c.tr,t))buff(f,u,t,'Pointed Promise','pointedPromise',.25*c.M,3,{harmful:true});}}
  if(c.s.name==='Precious Circle'&&has(u,'C06'))for(const t of f.nearby(u,c.t,18,3,c.t).filter(t=>c.b.inRange(u,t)))f.proc(u,t,.3*c.M,'magic','Stones Cast Out');
 }
});
function gritBank(f,u,add=0){
 u.kit.grits||=[];const old=u.kit.grits.length;u.kit.grits=u.kit.grits.filter(at=>at>f.battle.time);
 if(old>u.kit.grits.length&&has(u,'C07')&&f.ready(u,'worthWait',2))ward(f,u,f.lowest(u),.3*f.stats(u).A,3,'Worth the Wait');
 for(let i=0;i<add&&u.kit.grits.length<(has(u,'A01')?2:1);i++)u.kit.grits.push(f.battle.time+(has(u,'A01')?5:3));return u.kit.grits;
}
function gritGrant(f,u){if(f.ready(u,'gritCD',2))gritBank(f,u,1);}
function gritSpend(f,u,t,active=false){
 if(!gritBank(f,u).shift())return 0;const {A,H}=f.stats(u),primer=spend(u,'heelPrimer');u.kit.gritSpent=true;
 if(primer&&has(u,'A04'))f.after(()=>buff(f,u,t,'Stamped Quarry','physicalExposure',.06,3,{harmful:true}));
 const feet=f.get(u,'Plant the Feet');if(feet&&has(u,'A05')&&(feet.kickRefund||0)<1){feet.kickRefund=(feet.kickRefund||0)+.5;refund(u,'Quarry Kick',.5);}
 f.after(()=>{if(has(u,'B01'))ward(f,u,u,(has(u,'B08')?.06:.03)*H,3,'Heel Guard');if(has(u,'B08')){heal(f,u,u,.03*H,'Grit Is Armor');buff(f,u,u,'Armor aim','nextBasicHit',25,75);}if(has(u,'C01')){const tr=f.trainer(u);buff(f,u,tr,'Shared Grit aim','nextBasicHit',20,75);charge(f,u,tr,'Shared Grit',.2*A);}});
 return has(u,'B08')?0:(active?.9:.4)*A+primer;
}
register('skyrabbit',{
 grit(){return true;},
 support(f,u,s){if(s.name==='Quarry Kick'&&has(u,'C08'))return true;},
 gate(f,u,c){if(c.s.name==='Quarry Kick'&&has(u,'C08'))return c.other.length>0;},
 tick(f,u){gritBank(f,u);},
 basicInterval(f,u,n,a){return a===u&&has(u,'A08')?n*1.15:n;},
 hitBonus(f,u,n,a,t,d){return a===u&&d.basic&&!has(u,'B08')&&gritBank(f,u).length?n+20:n;},
 beforeCast(f,u,c){if(c.u===u&&c.s.kind==='hit'&&has(u,'A08'))c.gritBonus=gritSpend(f,u,c.t,true);},
 primary(f,u,n,c,kind){return c.u===u&&kind==='damage'?n+(c.gritBonus||0):n;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic)n+=gritSpend(f,u,t);if(allies(u,a)&&a!==u&&a.slot>0&&d.primary&&f.get(t,'Demonstration')?.source===u.id)n*=1.1;return n;},
 attempted(f,u,a,t,d){if(a===u&&d.basic&&has(u,'A07')){u.kit.steadyBeat=(u.kit.steadyBeat||0)+1;if(u.kit.steadyBeat%3===0)gritGrant(f,u);}},
 landed(f,u,a,t,r,d){
  if(allies(u,a)&&a!==u&&a.slot>0&&has(u,'C04')){const e=f.get(t,'Demonstration');if(e?.source===u.id&&!e.followed){e.followed=true;gritBank(f,u,1);}}
  if(allies(u,a)&&d.basic&&has(u,'C08')){const e=f.get(a,'Patient Instructor');if(e?.source===u.id&&!e.lesson){e.lesson=true;gritBank(f,u,1);}}
 },
 damaged(f,u,a,t,n,s,d){if(t===u&&d.active&&d.direct!==false&&has(u,'B05')){const e=f.get(u,'Plant the Feet');if(e&&!e.rooted){e.rooted=true;gritBank(f,u,1);}}},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Heel Guard'&&has(u,'B07')&&f.ready(u,'stepBack',2))f.after(()=>heal(f,u,u,.01*u.maxHp,'Step Back In'));},
 cast(f,u,c){
  if(c.s.name==='Plant the Feet'){
   const reduction=has(u,'B03')?.2:.15,duration=has(u,'B03')?4:3;c.dr(reduction,duration);if(!has(u,'B03'))gritBank(f,u,has(u,'A03')?2:1);
   if(has(u,'C03'))buff(f,u,c.tr,'Steady Lesson','dr',reduction*.5,duration);if(has(u,'C05'))ward(f,u,c.tr,.02*c.H,duration,'Footing for Two');c.primary={kind:'utility',amount:0,target:u};return true;
  }
  if(c.s.name==='Quarry Kick'){
   if(has(u,'C08')){for(const t of c.other)buff(f,u,t,'Patient Instructor','basicTempo',.15,4);c.primary={kind:'utility',amount:0,target:u};}
   else{const resisted=c.t.boss&&c.t.controlImmune?.includes('Interrupt')||f.has(c.t,'Immunity:Interrupt');c.hit((2.7+(resisted&&has(u,'A06')?.45:0))*c.A);c.control(.5);}return true;
  }
 },
 afterCast(f,u,c){
  if(c.u!==u){if(c.u.id===u.targetId)gritGrant(f,u);return;}
  const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Heel Hammer'){if(has(u,'A02'))u.kit.heelPrimer=.25*c.A;if(has(u,'B02')&&f.has(u,'Plant the Feet')){heal(f,u,u,.02*c.H,'Grounded Hammer');if(has(u,'B04'))buff(f,u,u,'Low Center','flee',20,2);}if(hit&&has(u,'C02'))buff(f,u,c.t,'Demonstration','demonstration',.1,3,{harmful:true});}
  if(c.s.name==='Quarry Kick'&&hit){if(has(u,'B06'))buff(f,u,c.t,'Weakened basic','basicWeakness',.25,3,{harmful:true});if(has(u,'C06'))buff(f,u,c.t,'Called Quarry','shieldReceived',-.25,3,{harmful:true});}
 }
});
const stormcap=(f,u)=>f.entities.find(e=>alive(e)&&e.master===u&&e.profile==='stormcap');
function pressureSpore(f,u,t,infectious=false){if(!alive(t)||!f.ready(u,'spore:'+t.id,2))return;buff(f,u,t,'Pressure Spore','spore',f.stats(u).M*(has(u,'C08')?.25:.4),has(u,'C08')?4:has(u,'C01')?5:3,{harmful:true,infectious});}
function pressureSpent(f,u,t,e){
 f.proc(u,t,e.value,'magic','Pressure Spore');const cap=stormcap(f,u);
 if(cap&&has(u,'A06')&&alive(t)&&f.battle.distance(cap,t)<=24&&(cap.aftershocks||0)<2&&f.ready(u,'stormAftershock',2)){cap.aftershocks=(cap.aftershocks||0)+1;f.proc(cap,t,.25*cap.snapshot.M,'magic','Storm Aftershock');}
 if(has(u,'B07')&&f.ready(u,'sporeMercy',2))heal(f,u,f.lowest(u),.2*f.stats(u).M,'Spore Mercy');
}
function stormPulse(f,u,e){
 const b=f.battle,first=e.pulseIndex===0,final=e.pulseIndex===2,extra=e.pulseIndex>2,M=e.snapshot.M;
 if(has(u,'B08')){const t=f.lowest(u,f.core(u).filter(t=>t.hp<t.maxHp&&b.distance(e,t)<=24));if(t){heal(f,u,t,.65*M,e.name);ward(f,u,t,.25*M,3,e.name);}}
 else{
  const targets=f.nearby(u,e,24,3,b.target(u)),conducting=e.conducting||0,charge=conducting+(e.pressureHousing||0);e.conducting=0;e.pressureHousing=0;
  for(let i=0;i<targets.length;i++){const amount=(i===0?.75+(final&&has(u,'A01')?.4:0):.25)*M*(extra?.7:1)+(i===0?charge:i===1&&has(u,'A04')?conducting*.5:0);f.proc(e,targets[i],amount,'magic',e.name,{area:true,secondary:i>0});if(first||final&&has(u,'C06'))pressureSpore(f,u,targets[i]);}
 }
 if(first&&has(u,'B06'))ward(f,u,f.lowest(u,f.core(u).filter(t=>b.distance(e,t)<=24)),.6*M,3,'Grounded Shelter');
 b.emit('pulse',u,e,e.name,0,{entity:e.id,profile:e.profile,temporary:true,radius:24});
}
register('stormowl',{
 pressureSpores(){return true;},
 gate(f,u,c){if(c.s.name==='Thunderhead Totem'&&has(u,'A08')&&stormcap(f,u))return stormcap(f,u).hp<stormcap(f,u).maxHp;},
 fits(f,u,c){if(c.s.name==='Thunderhead Totem'&&has(u,'A08')&&stormcap(f,u))return true;},
 entityCreated(f,u,e){if(e.profile!=='stormcap')return;if(has(u,'A01'))e.hp=e.maxHp=Math.round(.12*u.maxHp);if(has(u,'A08')){e.until=1e6;e.extraPulseAt=e.born+6;}},
 entityTick(f,u,e){if(e.profile!=='stormcap')return;f.syncShield(e);if(has(u,'A08')&&e.pulseIndex>=3&&f.battle.time>=e.extraPulseAt){stormPulse(f,u,e);e.pulseIndex++;e.extraPulseAt+=2;}},
 entityPulse(f,u,e){if(e.profile==='stormcap'){stormPulse(f,u,e);return true;}},
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Sporebolt')c.volatile=!!f.get(c.t,'Pressure Spore');},
 primary(f,u,n,c,kind){if(c.u===u&&kind==='damage'&&c.s.name==='Sporebolt')n=(n+(c.volatile&&has(u,'C02')?.25*c.M:0))*(has(u,'B02')?.75:1);return n;},
 incoming(f,u,n,a,t,d){
  if(t===u&&d.category==='magic'&&has(u,'A07')&&stormcap(f,u))n*=.88;
  const canopy=f.get(t,'Stormcap Canopy');if(canopy?.source===u.id&&d.direct!==false&&!d.dot){if(has(u,'B03')&&d.active&&d.category!=='magic'&&!canopy.physicalUsed){canopy.physicalUsed=true;n*=.925;}if(has(u,'B05')&&d.category==='magic'&&!canopy.quiet){canopy.quiet=true;f.after(()=>heal(f,u,t,.2*f.stats(u).M,'Quiet Recovery'));}}
  const sp=f.get(a,'Pressure Spore');if(has(u,'C05')&&sp?.source===u.id&&sp.infectious&&d.active&&d.primary)n*=.88;return n;
 },
 damaged(f,u,a,t,n,s,d){const e=pool(t,u,'Stormcap Canopy');if(has(u,'C03')&&e&&!e.infected&&a?.side!==u.side&&n+s>0&&!d.transfer&&!d.debt&&f.battle.inRange(u,a)){e.infected=true;pressureSpore(f,u,a,true);}},
 absorbed(f,u,a,t,p,n,d){if(p.source===u.id&&p.label==='Pressure Housing'&&has(u,'A05')&&!d.transfer&&!d.debt){const grant=Math.min(n,.3*f.stats(u).M-(p.pressureBank||0));p.pressureBank=(p.pressureBank||0)+grant;t.pressureHousing=Math.min(.3*f.stats(u).M,(t.pressureHousing||0)+grant);}},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Gentle Spore'&&has(u,'B04'))pressureSpore(f,u,a);},
 effect(f,u,g){if(g.source===u&&g.key==='Stormcap Canopy'&&has(u,'B03'))g.duration=3;},
 effectExpired(f,u,t,e){if(e.source===u.id&&e.key==='Pressure Spore'&&has(u,'C07'))f.proc(u,t,e.value*.5,'magic','Unused Pressure');},
 cast(f,u,c){if(c.s.name==='Thunderhead Totem'&&has(u,'A08')){const e=stormcap(f,u);if(e){c.heal(e,.3*e.maxHp);return true;}}},
 afterCast(f,u,c){
  if(c.u!==u){const e=f.get(c.u,'Pressure Spore');if(e?.source===u.id){if(has(u,'C08')){if(f.ready(u,'sporeSentence:'+c.u.id,1))pressureSpent(f,u,c.u,e);}else{f.remove(c.u,e.key);pressureSpent(f,u,c.u,e);}}return;}
  const hit=c.results.find(r=>r.primary&&r.hit),cap=stormcap(f,u);
  if(hit)pressureSpore(f,u,hit.target);
  if(c.s.name==='Sporebolt'&&hit){if(cap&&has(u,'A02')&&f.battle.distance(cap,c.t)<=24)cap.conducting=.25*c.M;if(has(u,'B02'))ward(f,u,f.lowest(u),.3*c.M,3,'Gentle Spore');if(c.volatile&&has(u,'C02')){const e=f.get(c.t,'Pressure Spore');if(e?.source===u.id)e.until=f.battle.time+(has(u,'C08')?4:has(u,'C01')?5:3);if(has(u,'C04'))buff(f,u,c.t,'Shallow Breath','nextBasicDelay',.15,75,{harmful:true});}}
  if(c.s.name==='Stormcap Canopy'){if(cap&&has(u,'A03'))ward(f,u,cap,.4*c.M,3,'Pressure Housing');if(has(u,'B01'))heal(f,u,c.primary.target,.3*c.M,'Warm Canopy');}
 }
});
const wheelMax=u=>has(u,'A01')?4:3;
register('stormstilt',{
 flywheel(){return true;},
 flywheelSwitch(f,u){const p=pool(u,u,'Lock the Axle'),lock=f.get(u,'Locked axle');if(f.has(u,'Locked Forever'))return true;if(p&&lock){f.remove(u,'Locked axle');return true;}u.kit.Flywheel=has(u,'A07')?1:0;return true;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Flywheel'?wheelMax(u):max;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.category!=='magic'&&t.id===u.kit.originalTarget)n*=1+.04*(u.kit.Flywheel||0);if(a===u&&d.basic&&has(u,'A05')){const p=pool(u,u,'Lock the Axle');if(p&&(p.cleanBasics||0)<2){p.cleanBasics=(p.cleanBasics||0)+1;n+=.15*f.stats(u).A;}}return n;},
 hitBonus(f,u,n,a,t){return a===f.trainer(u)&&has(u,'C01')&&t.id===u.targetId?n+5*(u.kit.Flywheel||0):n;},
 incoming(f,u,n,a,t,d){if(t===u){if(d.basic&&has(u,'B01'))n*=1-.03*Math.min(4,u.kit.Flywheel||0);if(d.active&&d.primary&&has(u,'B07')&&(u.kit.Flywheel||0)>=wheelMax(u)&&f.ready(u,'balancedWheel',5))n*=.8;}return n;},
 basicInterval(f,u,n,a){if(a===u&&has(u,'A03')&&pool(u,u,'Lock the Axle'))n*=.85;if(allies(u,a)&&has(u,'C05')&&pool(a,u,'Sheltered Axle'))n*=.88;return n;},
 shield(f,u,g){if(g.source===u&&g.label==='Lock the Axle'){if(has(u,'B03')){g.amount+=.04*u.maxHp;g.duration+=1;}if(has(u,'B08'))g.amount*=.5;}},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Padded Ring'&&has(u,'B04'))f.after(()=>heal(f,u,u,.01*u.maxHp,'Smooth Revolutions'));},
 healAmount(f,u,n,source,t,o){return t===u&&o.primary&&has(u,'B05')&&pool(u,u,'Lock the Axle')?n*1.15:n;},
 landed(f,u,a,t,r,d){
  if(a===u&&d.basic&&t.id===u.kit.originalTarget)f.add(u,'Flywheel',f.has(u,'Redline')?2:1,3);
  if(a===f.trainer(u)&&d.basic){const e=f.get(t,'Hammer Signal');if(e?.source===u.id){f.remove(t,e.key);f.proc(a,t,.25*f.stats(u).A,'melee','Hammer Signal');if(has(u,'C04'))heal(f,u,u,.02*u.maxHp,'Signal Returned');}}
  if(allies(u,a)&&a!==u&&t.id===u.targetId&&has(u,'C07')){u.kit.synchronized||={};u.kit.synchronized[a.id]=f.battle.time;const other=f.others(u);if(other.length>=2&&other.every(t=>(u.kit.synchronized[t.id]??-Infinity)>=f.battle.time-2)&&f.ready(u,'synchronizedSpin',3))f.add(u,'Flywheel',1,3);}
 },
 cast(f,u,c){if(c.s.name==='Full Torque'){c.wheelStacks=c.r('Flywheel');c.hit((2.7+(has(u,'C08')?0:has(u,'A08')?.7:has(u,'A06')?.3:.2)*c.wheelStacks)*c.A*(has(u,'B06')?.85:1));if(has(u,'A08')){c.take('Flywheel');buff(f,u,u,'Redline','redline',1,3);}return true;}},
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Ring Hammer'&&hit){if(has(u,'A02')&&c.t.id===u.kit.originalTarget)c.add('Flywheel',1,3);if(c.r('Flywheel')>=wheelMax(u)){if(has(u,'A04'))buff(f,u,c.t,'Grooved Ring','physicalExposure',.06,3,{harmful:true});if(has(u,'B02'))ward(f,u,u,.02*c.H,3,'Padded Ring');}if(has(u,'C02'))buff(f,u,c.t,'Hammer Signal','hammerSignal',1,3,{harmful:true});}
  if(c.s.name==='Lock the Axle'){if(has(u,'B08'))buff(f,u,u,'Locked Forever','dr',.2,6);if(has(u,'C03'))ward(f,u,f.lowest(u,c.other),.03*c.H,3,'Sheltered Axle');}
  if(c.s.name==='Full Torque'){const stacks=c.wheelStacks||0;if(has(u,'B06'))heal(f,u,u,.015*c.H*stacks,'Slow Torque');if(has(u,'C06'))for(const t of c.other)charge(f,u,t,'Torque Command',.1*c.A*stacks);if(has(u,'C08'))for(const t of c.all)buff(f,u,t,'Three-Ring Machine','basicTempo',.03*stacks*(t===u?.5:1),4);}
 }
});
const shedCount=u=>(u.kit.shedThresholds||[]).length;
register('tempestrook',{
 shedStorm(){return true;},
 damaged(f,u,a,t,n,s,d){
  if(t!==u||a?.side===u.side||n<=0||d.transfer||d.debt)return;u.kit.shedThresholds||=[];
  const hp=(d.hpAfter??u.hp)/u.maxHp;for(const threshold of has(u,'A01')?[.8,.5]:[.7,.4])if(hp<threshold&&!u.kit.shedThresholds.includes(threshold)){
   u.kit.shedThresholds.push(threshold);if(has(u,'B01'))heal(f,u,u,.03*u.maxHp,'Soft Underwing');if(has(u,'B07'))buff(f,u,u,'Safe Shedding','nextActiveDR',.2,3,{once:true});if(has(u,'C07'))charge(f,u,f.trainer(u),'Flock Alarm',.3*f.stats(u).A);
  }
 },
 incoming(f,u,n,a,t,d){if(t===u&&d.direct!==false&&!d.dot&&has(u,'B08'))n*=1-.08*shedCount(u);if(allies(u,t)&&t!==u&&d.basic&&has(u,'C02')&&f.get(a,'Warning Feathers')?.source===u.id)n*=.88;return n;},
 outgoing(f,u,n,a,t,d){if(a===u){if(d.category!=='magic'&&!has(u,'B08'))n*=1+.08*shedCount(u);if(d.basic&&has(u,'A05')){const e=f.get(u,'Storm Focus');if(e&&!e.basicUsed){e.basicUsed=true;n+=.25*f.stats(u).A;}}}return n;},
 beforeCast(f,u,c){if(c.u!==u)return;c.shedCount=shedCount(u);if(c.s.name==='Sixfold Tempest'){c.stormFocus=f.remove(u,'Storm Focus');if(c.stormFocus)c.mods.hit=(c.mods.hit||0)+25;}if(c.s.name==='Triple Pinion')c.warningAlready=f.get(c.t,'Warning Feathers')?.source===u.id;},
 primary(f,u,n,c,kind){
  if(c.u!==u||kind!=='damage')return n;const reserve=spend(u,'shedReserve');n+=reserve;if(reserve&&u.kit.reserveMantle&&has(u,'A07'))refund(u,'Triple Pinion',1);u.kit.reserveMantle=false;
  if(c.s.name==='Triple Pinion'&&has(u,'A02'))n+=.15*c.A*c.shedCount;
  if(c.s.name==='Sixfold Tempest'){if(c.stormFocus)n+=.35*c.A;if(has(u,'A06')&&c.shedCount>=2)n+=.5*c.A;}return n;
 },
 shield(f,u,g){
  if(g.source!==u||g.target!==u||g.options.talent)return;
  if(g.label==='Wing Mantle'&&has(u,'B03')){g.amount+=.03*u.maxHp;g.duration=4;}
  if(has(u,'A08')&&shedCount(u)>=2&&g.options.skill){u.kit.shedReserve=Math.min(1.2*f.stats(u).A,g.amount);u.kit.reserveMantle=g.label==='Wing Mantle';g.amount=0;}
 },
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Wing Mantle'&&has(u,'C03'))ward(f,u,f.trainer(u),n*.5,3,'Shared Mantle');},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(t===u&&p.label==='Wing Mantle'&&has(u,'A07'))refund(u,'Triple Pinion',1);if(p.label==='Shared Mantle'&&has(u,'C05'))buff(f,u,t,'Tailwind Cover','flee',20,2);},
 healAmount(f,u,n,source,t,o){return t===u&&source!==u&&allies(u,source)&&has(u,'B05')&&pool(u,u,'Wing Mantle')?n*1.2:n;},
 cast(f,u,c){
  if(c.s.name==='Sixfold Tempest'){
   if(has(u,'C08')){const targets=f.nearby(u,c.t,18,3,c.t),counts=targets.map((_,i)=>Math.floor(6/targets.length)+(i<6%targets.length?1:0));for(let i=0;i<targets.length;i++)c.hit(.45*c.A*counts[i],{target:targets[i],area:true,secondary:i>0,ignoreRange:i>0});}
   else c.hit(3.1*c.A);
   if(c.hp()<(has(u,'B08')?.7:.4))c.selfward(.05*c.H,2);return true;
  }
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Triple Pinion'){
   if(hit){if(c.shedCount>=2&&has(u,'A04'))buff(f,u,c.t,'Exposed Feather','physicalExposure',.07,3,{harmful:true});if(has(u,'C01'))buff(f,u,c.t,'Warning Feathers','hit',-20,3,{harmful:true});if(c.warningAlready&&has(u,'C04'))buff(f,u,c.t,'Weakened active','activeWeakness',.12,3,{harmful:true});}
   if(has(u,'B02')&&c.hp()<.7){c.selfward(.02*c.H,3);if(has(u,'B04'))buff(f,u,u,'Folding Feathers','basicDR',.2,2,{once:true});}
  }
  if(c.s.name==='Wing Mantle'){if(has(u,'A03'))buff(f,u,u,'Storm Focus','stormFocus',1,75);if(has(u,'C03'))buff(f,u,c.tr,'Shared Mantle aim','hit',15,3);}
  if(c.s.name==='Sixfold Tempest'){
   if(hit&&has(u,'B06')){const landed=has(u,'C08')?c.results.reduce((n,r,i)=>n+(r.hit?Math.floor(6/c.results.length)+(i<6%c.results.length?1:0):0),0):6;heal(f,u,u,.12*c.A*(landed+(has(u,'A06')&&c.shedCount>=2?1:0)),'Measured Tempest');}
   for(const r of c.results.filter(r=>r.hit)){if(has(u,'C06')){buff(f,u,r.target,'Storm Interdiction healing','healOutput',-.2,4,{harmful:true});buff(f,u,r.target,'Storm Interdiction shielding','shieldOutput',-.2,4,{harmful:true});}if(has(u,'C08'))buff(f,u,r.target,'Warning Feathers','hit',-20,3,{harmful:true});}
  }
 }
});
const removableBuffs=(f,t)=>Object.values(t?.effects||{}).filter(e=>e.until>f.battle.time&&e.value>0&&!e.harmful&&!e.unremovable&&!e.permanent&&['physicalPower','magicPower','hit','basicTempo'].includes(e.kind)).sort((a,b)=>['physicalPower','magicPower','hit','basicTempo'].indexOf(a.kind)-['physicalPower','magicPower','hit','basicTempo'].indexOf(b.kind)||a.key.localeCompare(b.key));
function envious(f,u,t,recent=true){return !!t&&(t.shield>0||removableBuffs(f,t).length>0||recent&&has(u,'A01')&&(u.kit.healedEnemies?.[t.id]??-Infinity)>=f.battle.time-2);}
function stolenBuff(f,u,t){const e=removableBuffs(f,t)[0];if(!e)return false;f.remove(t,e.key);u.kit.stoleAt=f.battle.time;if(has(u,'B07')&&f.ready(u,'greedWarm',3))f.cleanse(u,u,'dot');if(has(u,'C07'))buff(f,u,t,'Nothing Personal','personalWeakness',.15,3,{harmful:true,once:true});return true;}
register('zephyrlynx',{
 enviousGrin(){return true;},
 support(f,u,s){if(s.name==='Borrowed Splendor'&&has(u,'B08'))return true;},
 gate(f,u,c){if(c.s.name==='Borrowed Splendor'&&has(u,'B08'))return c.threat()||c.hp()<.8;},
 beforeCast(f,u,c){if(c.u===u){c.envious=envious(f,u,c.t);c.enemyCostume=envious(f,u,c.t,false);}},
 outgoing(f,u,n,a,t,d){if(a===u&&d.category==='magic'&&envious(f,u,t))n*=1.12;return n;},
 incoming(f,u,n,a,t,d){
  if(t===u&&d.direct!==false&&!d.dot){if(has(u,'B01')&&a.id===u.targetId&&envious(f,u,a))n*=.88;const p=pool(u,u,'Borrowed Coat');if(p&&d.active&&d.primary&&has(u,'B05')&&!p.betterFit){p.betterFit=true;n*=.8;}}
  if(d.active&&d.primary){const e=f.get(a,'Nothing Personal');if(e?.source===u.id){f.remove(a,e.key);n*=.85;}}return n;
 },
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Public Prick')?.source===u.id?n+20:n;},
 primary(f,u,n,c,kind){if(c.u===u&&kind==='damage'){if(c.s.name==='Velvet Prick'&&c.envious&&has(u,'A02'))n+=.3*c.M;if(c.s.name==='Curtain Call'&&has(u,'A06')&&(u.kit.stoleAt??-Infinity)>=f.battle.time-3)n+=.5*c.M;}const e=f.get(c.u,'Everyone\'s Costume');if(allies(u,c.u)&&e?.source===u.id&&['damage','heal','shield'].includes(kind))n*=1+e.value;return n;},
 healed(f,u,source,t,n){if(t.side!==u.side&&n>0){u.kit.healedEnemies||={};u.kit.healedEnemies[t.id]=f.battle.time;}},
 shielded(f,u,source,t,n){const e=f.get(t,'Curtain Call');if(t.side!==u.side&&n>0&&has(u,'C05')&&e?.source===u.id&&!e.taxed){e.taxed=true;ward(f,u,f.trainer(u),.4*f.stats(u).M,3,'Curtain Tax');}},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Velvet Padding'&&has(u,'B04'))f.after(()=>heal(f,u,u,.15*f.stats(u).M,'Needle and Thread'));},
 landed(f,u,a,t,r,d){
  if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Public Prick');if(e?.source===u.id&&!e.kindly){e.kindly=true;ward(f,u,a,.25*f.stats(u).M,3,'Kindly Theft');}}
  if(a===f.trainer(u)&&d.basic){const e=f.get(a,'Shared Splendor bolt:'+u.id);if(e){f.remove(a,e.key);f.proc(u,t,e.value,'magic','Shared Splendor');}}
 },
 cast(f,u,c){
  if(c.s.name==='Borrowed Splendor'){
   if(has(u,'B08')){c.selfward(1.2*c.M,3);buff(f,u,u,'Borrowed Splendor','magicPower',.1,3);return true;}
   const stolen=stolenBuff(f,u,c.t);c.splendorStolen=stolen;
   if(!stolen)c.hit(1.45*c.M);else c.primary={kind:'utility',amount:0,target:c.t};
   if(has(u,'C08'))for(const t of c.other)buff(f,u,t,"Everyone's Costume",'costume',stolen?.15:.075,3);
   else if(stolen||has(u,'A07'))buff(f,u,u,'Borrowed Splendor','magicPower',.1,stolen?(has(u,'A03')?5:3):2);
   if(stolen){if(has(u,'A05'))buff(f,u,u,'Splendor Dividend','nextBasic',.35*c.M,75);if(has(u,'C01')){if(c.tr?.basicCategory==='magic')buff(f,u,c.tr,'Shared Splendor','magicPower',.1,has(u,'A03')?5:3);else buff(f,u,c.tr,'Shared Splendor bolt:'+u.id,'splendorBolt',.25*c.M,75);}}
   else if(has(u,'C06'))heal(f,u,c.low,.35*c.M,'Borrowed Courtesy');return true;
  }
  if(c.s.name==='Curtain Call'&&has(u,'A08')){c.hit((2.8+(stolenBuff(f,u,c.t)?.8:0))*c.M);c.debuff('Curtain Call','shieldReceived',-.25,3);return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.s.name==='Velvet Prick'&&hit){if(c.envious&&has(u,'A04'))buff(f,u,c.t,'Stolen Confidence','magicExposure',.06,3,{harmful:true});if(has(u,'B02'))ward(f,u,u,.25*c.M,3,'Velvet Padding');if(has(u,'C02'))buff(f,u,c.t,'Public Prick','publicPrick',20,3,{harmful:true});}
  if(c.s.name==='Borrowed Splendor'&&has(u,'B03'))ward(f,u,u,.6*c.M,3,'Borrowed Coat');
  if(c.s.name==='Curtain Call'){if(c.enemyCostume&&has(u,'B06'))heal(f,u,u,.5*c.M,'Safe Curtain');if(hit&&has(u,'C03'))buff(f,u,c.t,'Hostile Applause','healReceived',-.25,3,{harmful:true});}
 }
});
function bowlWater(f,u,n){const before=u.kit.Water||0,cap=(has(u,'A01')?1.5:.9)*f.stats(u).M;f.add(u,'Water',n,cap);if(before<cap&&u.kit.Water>=cap&&has(u,'A07')&&f.ready(u,'gentleOverflow',4))ward(f,u,f.lowest(u),.3*f.stats(u).M,3,'Gentle Overflow');}
function dewCourage(f,u,t,count=1,festival=false){buff(f,u,t,'Dew of Courage:'+u.id,'dewCourage',Math.min(3,count),festival?4:75,{festival,replace:true});}
register('brooktoad',{
 bowlPlenty(){return true;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Water'?(has(u,'A01')?1.5:.9)*f.stats(u).M:max;},
 support(f,u,s){if(s.name==='Bowlful of Care'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Bowlful of Care'&&has(u,'C08'))return alive(c.t);},
 overchargeAllowed(f,u,s){if(s.name==='Bowlful of Care'&&has(u,'C08'))return true;},
 primary(f,u,n,c,kind){if(allies(u,c.u)&&['heal','shield'].includes(kind)){const e=f.remove(c.u,'Pond Tempo:'+u.id);if(e)n+=e.value;}return n;},
 healed(f,u,source,t,n,label,o){if(source!==u||!o.primary)return;
  if(has(u,'B07')&&f.has(t,'Dew of Courage:'+u.id)&&f.ready(u,'wellWatered',2))ward(f,u,t,.2*f.stats(u).M,3,'Well-Watered');
  if(!o.stored)bowlWater(f,u,Math.max(0,o.offered-n)*.5);
  if(label==='Dew Croak'){
   if(has(u,'A04'))ward(f,u,t,Math.min(.3*f.stats(u).M,.25*(o.offered-n)),3,'Dew Cushion');
   if(n>0&&has(u,'C01')){const target=f.battle.target(u);if(alive(target)&&f.battle.inRange(u,target)){f.proc(u,target,.3*f.stats(u).M,'magic','Bitter Croak');if(has(u,'C04'))buff(f,u,target,'Bile Mark','healReceived',-.2,3,{harmful:true});}}
  }
 },
 landed(f,u,a,t,r,d){
  if(!d.basic)return;const e=f.get(a,'Dew of Courage:'+u.id);if(allies(u,a)&&e?.value>0){e.value--;if(!e.value)f.remove(a,e.key);f.proc(u,t,.2*f.stats(u).M,'magic','Dew of Courage');if(e.festival)bowlWater(f,u,.05*f.stats(u).M);else if(has(u,'B04'))bowlWater(f,u,.1*f.stats(u).M);}
  if(a===u&&has(u,'C06')&&f.get(t,'Bile Mark')?.source===u.id&&f.ready(u,'pressureCroak',1))bowlWater(f,u,.1*f.stats(u).M);
 },
 cast(f,u,c){
  if(c.s.name==='Dew Croak'){if(has(u,'A02'))bowlWater(f,u,.2*c.M);c.heal(c.low,.75*c.M);if(has(u,'B01'))dewCourage(f,u,c.low);if(has(u,'B02'))c.cleanse(c.low,'blind');return true;}
  if(c.s.name==='Bowlful of Care'){
   const spent=c.take('Water',c.r('Water')*(has(u,'A08')?.5:has(u,'A05')?.8:1));c.waterSpent=spent;
   if(has(u,'C08')){c.hit(1.4*c.M+spent);c.debuff('Bile Mark','healReceived',-.2,3);c.debuff('Corrosive Rinse','magicExposure',.06,3);}
   else c.heal(c.low,(has(u,'A08')?.9:1.25)*c.M+spent,{stored:true});
   if(has(u,'A03'))heal(f,u,f.lowest(u,c.all.filter(t=>t!==c.low&&t.hp<t.maxHp)),spent*.25,'Double Ladle');
   if(has(u,'B03')&&spent){buff(f,u,c.low,'Flowing Hands','basicTempo',.12,3);if(has(u,'B05')&&spent>=.6*c.M)buff(f,u,c.low,'Full Bowl Confidence','hit',20,3);}
   if(has(u,'C02')&&spent&&c.b.inRange(u,c.t)){const r=f.proc(u,c.t,Math.min(.5*c.M,spent*.25),'magic','Acid Bowl');if(r.hit&&has(u,'C05'))buff(f,u,c.t,'Corrosive Rinse','magicExposure',.06,3,{harmful:true});if(has(u,'C07'))heal(f,u,u,.2*r.damage,'Clean Drain');}
   if(has(u,'A08'))refund(u,'Bowlful of Care',3);return true;
  }
  if(c.s.name==='Pond Chorus'){for(const t of c.all)c.heal(t,(1+(t===c.low&&has(u,'A06')?.4:0))*c.M*(has(u,'B08')?.5:1));if(has(u,'B08'))for(const t of c.all)dewCourage(f,u,t,3,true);return true;}
 },
 afterCast(f,u,c){if(c.u!==u||c.s.name!=='Pond Chorus')return;if(has(u,'B06'))for(const t of c.other)buff(f,u,t,'Pond Tempo:'+u.id,'pondTempo',.2*c.M,75);if(has(u,'C03'))for(const t of f.nearby(u,c.t,18,3,c.t))buff(f,u,t,'Sour Chorus','hit',-20,3,{harmful:true});}
});
register('embersalam',{
 puffedCheeks(){return true;},
 start(f,u){if(has(u,'A01'))u.kit.Puff=3;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Puff'?(has(u,'A01')?3:2):max;},
 gate(f,u,c){if(c.s.name==='Cheekguard'&&has(u,'C08'))return c.trainerGate();},
 beforeCast(f,u,c){if(c.u===u)c.puffsBefore=c.r('Puff');},
 hitBonus(f,u,n,a,t,d){return a===u&&d.active&&f.currentCompanionCast?.s.name==='Cinder Spit'&&!f.currentCompanionCast.puffsBefore&&has(u,'A04')?n+25:n;},
 incoming(f,u,n,a,t,d){return t===f.trainer(u)&&d.basic&&has(u,'C04')&&f.get(a,'Smoke Spit')?.source===u.id?n*.88:n;},
 outgoing(f,u,n,a,t,d){
  if(a!==u||!d.basic)return n;const {A,H}=f.stats(u),spent=has(u,'A08')?0:f.take(u,'Puff',1),armored=has(u,'B08')&&!!pool(u,u,'Cheekguard');
  if(spent){if(!armored)n+=.3*A;f.after(()=>{if(has(u,'B01'))ward(f,u,u,(armored?.03:.015)*H,2,'Wax Padding');if(!u.kit.Puff){if(has(u,'B07')&&f.ready(u,'cheekRepair',2))heal(f,u,u,.02*H,'Cheek Repair');if(has(u,'C07')&&f.ready(u,'emberMantle',3))for(const t of f.others(u).filter(t=>t.slot>0))buff(f,u,t,'Ember Mantle','flee',20,2);}});}
  if(u.kit.chamberedGuard){n+=spend(u,'chamberedGuard');if(has(u,'A05'))f.after(()=>f.add(u,'Puff',1,2));}return n;
 },
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'A07')&&u.kit.talentBasics%4===0)f.add(u,'Puff',1,2);},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.coveringPops&&has(u,'C05')&&allies(u,t))f.after(()=>ward(f,u,t,.3*f.stats(u).A,3,'Pop Warning'));},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Cheekguard'&&has(u,'B05'))f.add(u,'Puff',1,2);},
 cast(f,u,c){
  if(c.s.name==='Cinder Spit'){
   const spent=has(u,'A08')?c.take('Puff',1):0;c.hit((1.35+.35*spent)*c.A);const before=c.r('Puff');c.add('Puff',has(u,'A02')?2:1,2);
   if(c.r('Puff')>before&&has(u,'B02')){heal(f,u,u,.25*c.A,'Cooling Spit');if(has(u,'B04'))buff(f,u,u,'Soot Dressing','basicDR',.15,2,{once:true});}if(has(u,'C02'))c.debuff('Smoke Spit','hit',-20,3);return true;
  }
  if(c.s.name==='Cheekguard'){
   const count=c.r('Puff'),spent=has(u,'B08')?0:c.take('Puff'),amount=((.6+.3*count)*c.A+(has(u,'B03')?.02*c.H*count:0))*(has(u,'B08')?.7:1),t=has(u,'C08')?c.tr:u,n=c.shield(t,amount,3);
   if(has(u,'A03')&&spent)u.kit.chamberedGuard=.2*c.A*spent;if(has(u,'C01'))ward(f,u,has(u,'C08')?u:c.tr,n*.5,3,'Shared Cheeks');if(has(u,'C06')&&spent)charge(f,u,c.tr,'Puffs for Courage',.15*c.A*spent);if(has(u,'C08'))buff(f,u,c.tr,'Cheeks Around the Candle','basicTempo',.15,3);return true;
  }
  if(c.s.name==='Popgun Barrage'){const spent=has(u,'A08')?c.take('Puff'):0;c.hit((3+(has(u,'A06')?.45:0)+spent*.5)*c.A);if(has(u,'B06'))ward(f,u,u,.03*c.H,3,'Guarded Barrage');if(has(u,'C03'))c.debuff('Weakened active','activeWeakness',.15,3,c.t,{coveringPops:true});return true;}
 },
 afterCast(f,u,c){if(c.u===u&&c.primary?.kind==='damage'&&c.s.cd===12)c.add('Puff',2,2);}
});
const kilnling=(f,u)=>f.entities.find(e=>alive(e)&&e.master===u&&e.profile==='kilnling');
register('magmatoad',{
 recastSlag(){return true;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Slag'?(has(u,'B01')?1.6:1)*f.stats(u).M:max;},
 gate(f,u,c){if(c.s.name==='Cast a Kilnling'&&has(u,'A08')&&kilnling(f,u))return kilnling(f,u).hp<kilnling(f,u).maxHp;},
 fits(f,u,c){if(c.s.name==='Cast a Kilnling'&&has(u,'A08')&&kilnling(f,u))return true;},
 entityCreated(f,u,e){if(e.profile!=='kilnling')return;const {H,M}=f.stats(u);e.hp=e.maxHp=Math.round(Math.min((has(u,'A01')?.12:.08)*H+.6*M+(u.kit.kilnSlag||0),(has(u,'A01')?.22:.18)*H));if(has(u,'A08')){e.until=1e6;e.intercept=.12;}},
 entityLoss(f,u,e,n,d){if(e.profile!=='kilnling'||!d.transfer||!has(u,'A05'))return;e.watchedLoss=(e.watchedLoss||0)+n;if(e.watchedLoss>=.03*u.maxHp&&!e.kilnWatch){e.kilnWatch=true;ward(f,u,f.trainer(u),.02*u.maxHp,3,'Kiln Watch');}},
 entityEnded(f,u,e,reason,hp){if(e.profile==='kilnling'&&reason==='expired'&&hp>0&&has(u,'A07'))f.add(u,'Slag',Math.min(.5*f.stats(u).M,.2*hp),f.stats(u).M);},
 incoming(f,u,n,a,t,d){if(t.temporary&&t.master===u&&t.profile==='kilnling'&&has(u,'A03')&&d.direct!==false&&!d.dot)n*=.8;if(t===f.trainer(u)&&d.basic&&has(u,'C04')&&pool(t,u,'Protective Ladle'))n*=.9;return n;},
 beforeCast(f,u,c){if(c.u===u&&c.s.kind==='hit')c.slagSpent=c.take('Slag',c.r('Slag')*(c.s.name==='Molten Ladle'&&has(u,'A02')?.5:1));},
 primary(f,u,n,c,kind){if(c.u!==u||kind!=='damage')return n;const slag=c.slagSpent||0;n+=slag*(has(u,'B08')?2:1)*(c.s.name==='Crucible Overflow'&&has(u,'B06')?1.5:1);if(c.s.name==='Molten Ladle'&&slag&&has(u,'B02'))n+=.3*c.M;if(c.s.name==='Crucible Overflow'&&has(u,'C06'))n*=.75;return n;},
 shield(f,u,g){if(g.source===u&&g.label==='Molten Ladle'&&has(u,'B08'))g.amount=0;},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Molten Ladle'&&has(u,'C02'))ward(f,u,f.trainer(u),n*.5,2,'Protective Ladle');},
 absorbed(f,u,a,t,p,n,d){if(t===u&&p.source===u.id&&p.label==='Molten Ladle'&&has(u,'B03')&&!p.glowingPlate&&!d.transfer&&!d.debt){p.glowingPlate=true;buff(f,u,u,'Glowing Plate','nextBasic',.25*f.stats(u).M,75);}},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(t===u&&p.label==='Molten Ladle'&&has(u,'B05'))f.after(()=>f.proc(u,a,.25*f.stats(u).M,'magic','Pottery Shards'));if(p.label==='Pour a Protector'&&has(u,'C05'))f.after(()=>heal(f,u,t,.4*f.stats(u).M,'Kiln-Cured Ward'));},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B07')&&u.kit.talentBasics%3===0&&f.ready(u,'furnaceFuel',3))f.add(u,'Slag',.25*f.stats(u).M,f.stats(u).M);},
 cast(f,u,c){
  if(c.s.name==='Pour a Protector'){
   const slag=c.take('Slag',c.r('Slag')*(has(u,'C01')?.5:1)),total=(c.M+.03*c.H)*(has(u,'C08')?1.3:1)+slag,recipients=has(u,'C08')?c.all:[c.low];
   for(const t of recipients){c.shield(t,total/recipients.length,has(u,'C08')?1e6:3);if(has(u,'C03'))heal(f,u,t,.3*c.M,'Warm Ceramic');if(slag>=.5*c.M&&has(u,'C07'))buff(f,u,t,'Safety Glaze','healReceived',.15,3);}
   ward(f,u,u,.03*c.H,2,'Protector splash');return true;
  }
  if(c.s.name==='Cast a Kilnling'){
   const e=kilnling(f,u);if(e&&has(u,'A08')){const slag=c.take('Slag');c.heal(e,Math.min((has(u,'A01')?.22:.18)*c.H,(has(u,'A01')?.12:.08)*c.H+.6*c.M+slag));return true;}
   u.kit.kilnSlag=c.r('Slag');if(c.deploy('kilnling',{extraHP:c.r('Slag')}))c.take('Slag');u.kit.kilnSlag=0;return true;
  }
  if(c.s.name==='Crucible Overflow'){
   c.hit(2.7*c.M);const amount=(has(u,'B06')?.03:.05)*c.H*(has(u,'A06')?.5:1);c.heal(u,amount);if(has(u,'A06'))heal(f,u,kilnling(f,u),.04*c.H,"Master's Overflow");if(has(u,'C06'))heal(f,u,f.lowest(u,c.other),amount,'Overflowing Mercy');return true;
  }
 },
 afterCast(f,u,c){if(c.u!==u||c.s.name!=='Molten Ladle')return;if(has(u,'A04'))heal(f,u,kilnling(f,u),.25*c.M,'Glazed Arms');if(c.slagSpent&&has(u,'B04'))c.debuff('Crucible Scar','magicExposure',.06,3);if(has(u,'B08'))c.add('Slag',.35*c.M,c.M);}
});
function stars(f,u,n=1,shared=false){if(!shared||f.ready(u,'starCD',1))f.add(u,'Star',n,3);}
function guidingLights(f,u,t,n){buff(f,u,t,'Guiding Light:'+u.id,'guidingLight',Math.min(3,n),has(u,'C08')?4:75,{replace:true});}
register('starnewt',{
 pocketConstellation(){return true;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Star'?(has(u,'A01')?4:3):max;},
 beforeCast(f,u,c){if(c.u===u){if(c.s.kind==='hit')c.starsSpent=c.take('Star');if(has(u,'B07')){const other=f.others(u);c.distantShelter=other.length>=2&&other.every(t=>u.kit.distantCasts?.[t.id]);u.kit.distantCasts={};}}},
 primary(f,u,n,c,kind){
  if(c.u!==u||kind!=='damage')return n;const spent=c.starsSpent||0;
  if(!has(u,'B08')&&!(c.s.name==='Bellyful of Stars'&&has(u,'A08')))n+=spent*c.M*(c.s.name==='Bellyful of Stars'?(has(u,'A06')?.4:.3):.2)*(has(u,'C08')?.5:1);
  if(c.s.name==='Star Skip'&&spent>=2&&has(u,'A02'))n+=.25*c.M;return n;
 },
 outgoing(f,u,n,a,t,d){if(a===u){if(d.active&&d.primary&&f.currentCompanionCast?.s.name==='Star Skip'&&f.currentCompanionCast.starsSpent>=2&&has(u,'A04'))d.magicBypassPoints=Math.max(d.magicBypassPoints||0,.06);if(d.basic&&u.kit.alignedGlass){u.kit.alignedGlass=false;n+=.15*f.stats(u).M*(u.kit.Star||0);}}return n;},
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Polaris Skip')?.source===u.id?n+20:n;},
 incoming(f,u,n,a,t,d){return allies(u,t)&&d.basic&&has(u,'C05')&&pool(t,u,'Glass Lantern')?n*.88:n;},
 landed(f,u,a,t,r,d){
  if(a===u&&d.basic&&has(u,'A08')&&f.ready(u,'privateStar',1))stars(f,u);
  if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Polaris Skip');if(e?.source===u.id&&!e.aligned){e.aligned=true;stars(f,u,1,true);}}
  if(allies(u,a)&&d.basic){const e=f.get(a,'Guiding Light:'+u.id);if(e?.value>0){e.value--;if(!e.value)f.remove(a,e.key);f.proc(u,t,(has(u,'C08')?.25:.12)*f.stats(u).M,'magic','Guiding Light');if(!e.value&&has(u,'C07')&&f.ready(u,'astralEncouragement',2))heal(f,u,f.trainer(u),.25*f.stats(u).M,'Astral Encouragement');}}
 },
 shield(f,u,g){if(g.source===u&&g.target===u&&g.label==='Glass Constellation'&&has(u,'B03'))g.amount+=.03*u.maxHp;},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Glass Constellation'&&has(u,'C03'))for(const other of f.others(u).filter(t=>t.slot>0))ward(f,u,other,.5*n,3,'Glass Lantern');},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Glass Constellation'&&has(u,'B05'))stars(f,u);},
 cast(f,u,c){
  if(c.s.name==='Glass Constellation'){c.selfward(.9*c.M);stars(f,u,has(u,'A03')?2:1);if(has(u,'A05'))u.kit.alignedGlass=true;if(has(u,'B03'))buff(f,u,u,'Thicker Constellation','nextActiveDR',.15,3,{once:true});return true;}
  if(c.s.name==='Bellyful of Stars'){c.hit(2.8*c.M*(has(u,'B06')?.8:1));if(has(u,'A08')&&!has(u,'B08')&&c.starsSpent&&c.results[0]?.hit)f.proc(u,c.t,(has(u,'A06')?.4:.3)*c.M*c.starsSpent,'magic','One Private Sky');return true;}
 },
 afterCast(f,u,c){
  if(c.u!==u){if(allies(u,c.u)){u.kit.distantCasts||={};u.kit.distantCasts[c.u.id]=true;if(!has(u,'A08'))stars(f,u,1,true);}return;}
  const spent=c.starsSpent||0;if(c.distantShelter)ward(f,u,u,.4*c.M,3,'Distant Shelter');
  if(spent){
   if(has(u,'A07')&&spent>=3)stars(f,u);if(has(u,'B01')||has(u,'B08'))ward(f,u,u,.15*c.M*spent,3,'Starlit Shell');if(has(u,'B08'))ward(f,u,f.lowest(u),.3*c.M*spent,3,'Keep the Sky');
   if(has(u,'C01'))for(const t of has(u,'C08')?c.other:[c.tr])guidingLights(f,u,t,spent);
  }
  if(c.s.name==='Star Skip'){
   if(spent&&has(u,'B02'))heal(f,u,u,.2*c.M,'Gentle Skip');if(spent>=3&&has(u,'B04'))ward(f,u,c.tr,.3*c.M,3,'Rest Under Stars');if(has(u,'C02'))c.debuff('Polaris Skip','polarisSkip',20,3);
  }
  if(c.s.name==='Bellyful of Stars'){if(has(u,'B06'))heal(f,u,u,.1*c.M*spent*(has(u,'B08')?2:1),'Quiet Belly');if(has(u,'C06'))for(const t of c.other)ward(f,u,t,.15*c.M*spent,3,'Gather the Stars');}
 }
});
register('auroradrake',{
 dawnExchange(){return true;},
 support(f,u,s){if(s.name==='Aurora Sweep'&&has(u,'B08'))return true;},
 gate(f,u,c){if(c.s.name==='Aurora Sweep'&&has(u,'B08'))return c.wounded(.85)||c.wardGate();},
 beforeCast(f,u,c){if(c.u===u){c.brightLash=c.startHP>.6;if(c.s.kind==='hit')c.clearGills=spend(u,'clearGills');}},
 primary(f,u,n,c,kind){if(c.u!==u||kind!=='damage')return n;n+=c.clearGills||0;if(c.s.name==='Dawnlash'){if(c.brightLash&&has(u,'A02'))n+=.25*c.M;if(has(u,'B02'))n*=.8;}if(c.s.name==='Aurora Sweep'&&has(u,'A06')&&(u.kit.dawnTrainerAt??-Infinity)>=f.battle.time-3)n+=.5*c.M;return has(u,'A08')?n*1.15:n;},
 effect(f,u,g){if(g.source===u&&g.key==='Aurora Sweep'&&has(u,'B03'))g.duration=4;},
 incoming(f,u,n,a,t,d){return d.dot&&has(u,'B05')&&f.get(a,'Aurora Sweep')?.source===u.id?n*.8:n;},
 basicInterval(f,u,n,a){return a===f.trainer(u)&&has(u,'C03')&&pool(a,u,'Ribbon Gills')?n*.88:n;},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Gentle Dawn'&&has(u,'B04'))ward(f,u,t,Math.min(.3*f.stats(u).M,.4*(o.offered-n)),3,'Dew Between Gills');},
 landed(f,u,a,t,r,d){
  if(a===u&&d.basic&&has(u,'A07')&&u.kit.talentBasics%4===0)u.kit.newMorning=.2*f.stats(u).M;
  if(a===f.trainer(u)){
   const mark=f.get(t,'Ribbon Mark');if(mark?.source===u.id){f.remove(t,mark.key);f.proc(u,t,.25*f.stats(u).M,'magic','Ribbon Mark');if(has(u,'C04'))heal(f,u,u,.25*f.stats(u).M,'Promise Returned');}
   const p=pool(a,u,'Ribbon Gills');if(d.basic&&p&&has(u,'C05')&&!p.safeBreath){p.safeBreath=true;for(const ally of f.others(u).filter(t=>t.slot>0))ward(f,u,ally,.25*f.stats(u).M,3,'Safe Breathing');}
  }
  if(d.basic&&allies(u,a)){for(const label of ['Kindled Dawn','Dawn as a Gift']){const e=f.get(a,label+':'+u.id);if(e){f.remove(a,e.key);f.proc(u,t,e.value,'magic',label);if(label==='Dawn as a Gift')ward(f,u,a,e.value,3,label);}}}
 },
 cast(f,u,c){if(c.s.name==='Aurora Sweep'&&has(u,'B08')){for(const t of c.all){c.heal(t,c.M);c.shield(t,.3*c.M);}if(c.b.inRange(u,c.t))c.buff(c.t,'Aurora Sweep','damage',-.12,3,{harmful:true});return true;}},
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);
  if(c.primary?.kind==='damage'&&hit){
   const total=c.results.reduce((n,r)=>n+(r.damage||0),0),cap=(has(u,'A08')?1:has(u,'A01')?.7:.45)*c.M,primer=spend(u,'newMorning'),ordinary=Math.min(cap,Math.max(has(u,'B07')?.2*c.M:0,total*(has(u,'A08')?.4:.2)))+primer,t=has(u,'A08')?u:f.lowest(u),low=t&&t.hp<t.maxHp*.5,n=heal(f,u,t,ordinary*(has(u,'C08')?.5:1),'Dawn Exchange',(cap+primer)*(has(u,'C08')?.5:1));
   if(n>0&&t===c.tr)u.kit.dawnTrainerAt=f.battle.time;if(n>0&&has(u,'C01'))buff(f,u,t,'Blessed Recipient','hit',20,3);if(n>0&&low&&has(u,'C07'))buff(f,u,t,'Kindled Dawn:'+u.id,'dawnCharge',.2*c.M,75);if(has(u,'C08'))buff(f,u,t,'Dawn as a Gift:'+u.id,'dawnCharge',ordinary*.5,4);
   if(c.clearGills&&has(u,'A05'))heal(f,u,u,.2*c.M,'Warm Exhalation');
  }
  if(c.s.name==='Dawnlash'){if(hit&&c.brightLash&&has(u,'A04'))buff(f,u,c.t,'Dawn Exposure','magicExposure',.05,3,{harmful:true});if(has(u,'B02'))f.heal(u,f.lowest(u),.3*c.M,'Gentle Dawn',{primary:true,talent:true});if(hit&&has(u,'C02'))buff(f,u,c.t,'Ribbon Mark','ribbonMark',1,3,{harmful:true});}
  if(c.s.name==='Ribbon Gills'){if(has(u,'A03'))u.kit.clearGills=.4*c.M;if(has(u,'B01'))heal(f,u,c.tr,.35*c.M,'Shared Breath');if(has(u,'B06')){c.cleanse(u,'dot');c.cleanse(c.tr,'dot');}}
  if(c.s.name==='Aurora Sweep'&&(hit||has(u,'B08')&&c.b.inRange(u,c.t))&&has(u,'C06'))buff(f,u,c.t,'Sweeping Rebuke','shieldReceived',-.25,has(u,'B03')?4:3,{harmful:true});
 }
});
const ants=(f,u,profile='soldier-ant')=>f.entities.filter(e=>alive(e)&&e.master===u&&e.profile===profile);
function anthillSpawn(f,u,e){const cap=has(u,'A01')?4:3;if(ants(f,u).length>=cap)return;const ant=root.BondCombatEntities.spawn(f,u,'soldier-ant',{brood:true,firstBrood:!e.firstSoldier});if(ant)e.firstSoldier=true;}
register('cindermole',{
 entityCap(f,u,id,cap){return id==='soldier-ant'&&has(u,'A01')?4:cap;},
 gate(f,u,c){if(c.s.name==='Brood Call')return alive(c.t)&&(has(u,'A08')||c.count('soldier-ant')<(has(u,'A01')?4:3));if(c.s.name==='Swarm Screen'&&has(u,'C08')&&ants(f,u,'shield-ant')[0])return ants(f,u,'shield-ant')[0].hp<ants(f,u,'shield-ant')[0].maxHp;},
 fits(f,u,c){if(c.s.name==='Swarm Screen'&&has(u,'C08')&&ants(f,u,'shield-ant').length)return true;if(c.s.name==='Brood Call'&&has(u,'A08'))return !!root.BondCombatEntities.placement(f,u,root.BondCombatEntities.profiles.anthill);},
 entityCreated(f,u,e,o){
  if(e.profile==='soldier-ant'&&o.brood){if(has(u,'A03')){e.hp=e.maxHp=Math.round(.06*u.maxHp);e.until+=2;}if(has(u,'A07')&&o.firstBrood)e.next=f.battle.time+.1;}
  if(e.profile==='shield-ant'){if(has(u,'C01')){e.hp=e.maxHp=Math.round((has(u,'C08')?.18:.17)*u.maxHp);e.until+=1;}if(has(u,'C08')){e.until=1e6;e.intercept=.3;}}
  if(e.profile==='anthill'){e.nextAnt=f.battle.time+1;anthillSpawn(f,u,e);}
 },
 entityTick(f,u,e){if(e.profile==='anthill'&&f.battle.time>=e.nextAnt){e.nextAnt+=1;anthillSpawn(f,u,e);}},
 entityOutgoing(f,u,n,e,t,d){return e.profile==='soldier-ant'&&has(u,'B08')?n*.6:n;},
 entityLanded(f,u,e,t){if(e.profile!=='soldier-ant'||!has(u,'A04'))return;const mark=f.get(t,'Queen mark');if(mark?.source===u.id&&!mark.meal){mark.meal=true;heal(f,u,e,.01*u.maxHp,'Marked Meal');}},
 entityLoss(f,u,e,n,d){if(e.profile!=='shield-ant'||!d.transfer||!has(u,'C05'))return;e.lineLoss=(e.lineLoss||0)+n;if(!e.keptLine&&e.lineLoss>=.03*u.maxHp){e.keptLine=true;ward(f,u,f.trainer(u),.03*u.maxHp,3,'Keep the Line');}},
 incoming(f,u,n,a,t,d){if(t===u&&has(u,'A05')&&d.direct!==false&&!d.dot&&ants(f,u).length>=2)n*=.88;if(t===f.trainer(u)&&d.basic&&has(u,'C02')&&f.get(a,'Queen mark')?.source===u.id)n*=.88;return n;},
 effect(f,u,g){if(g.source===u&&g.key==='Queen mark'&&has(u,'A02'))g.duration=5;},
 beforeCast(f,u,c){if(c.u===u&&c.s.name==="Queen's Sting"){c.oneCrown=!!u.kit.oneCrown;u.kit.oneCrown=false;}},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(d.basic&&has(u,'B06')){const mark=f.get(t,'Queen mark');if(mark?.source===u.id&&!mark.defiance){mark.defiance=true;n+=.3*f.stats(u).A;}}if(d.active&&d.primary&&f.currentCompanionCast?.oneCrown)d.penetration=Math.max(d.penetration||0,.08);return n;},
 primary(f,u,n,c,kind){if(c.u!==u||kind!=='damage')return n;if(c.s.name==="Queen's Sting"&&has(u,'B01'))n+=Math.min(.6,.2*ants(f,u).length)*c.A;return n;},
 landed(f,u,a,t,r,d){
  if(a===u&&d.basic&&has(u,'B07')){u.kit.crownHits=u.kit.crownEnemy===t.id?(u.kit.crownHits||0)+1:1;u.kit.crownEnemy=t.id;if(u.kit.crownHits>=3){u.kit.crownHits=0;u.kit.oneCrown=true;}}
  if(d.basic&&allies(u,a)&&has(u,'C04')){const mark=f.get(t,'Queen mark'),ant=ants(f,u,'shield-ant')[0];if(ant&&mark?.source===u.id&&!mark.nursed){mark.nursed=true;heal(f,u,ant,.01*u.maxHp,'Nurse Mandibles');}}
 },
 missed(f,u,a,t,d){if(a===u&&d.basic)u.kit.crownHits=0;},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Chitin Duelist'&&has(u,'B04'))f.after(()=>heal(f,u,u,.01*u.maxHp,"Queen's Respite"));},
 cast(f,u,c){
  if(c.s.name==='Brood Call'){
   if(has(u,'A08')){for(const e of ants(f,u,'anthill'))f.despawn(e,'rebuilt');c.deploy('anthill');}
   else{let first=true;while(c.count('soldier-ant')<(has(u,'A01')?4:3)){if(!c.deploy('soldier-ant',{brood:true,firstBrood:first}))break;first=false;}}return true;
  }
  if(c.s.name==='Swarm Screen'){
   const e=ants(f,u,'shield-ant')[0];if(e&&has(u,'C08'))c.heal(e,.5*e.maxHp);else c.deploy('shield-ant');if(!has(u,'C08'))c.selfward(.05*c.H);if(has(u,'C03'))buff(f,u,u,'Safe Royalty','nextActiveDR',.15,3,{once:true});return true;
  }
  if(c.s.name==='Royal Mandate'){
   const soldiers=ants(f,u),few=soldiers.length<2;c.hit((2+(few&&has(u,'B03')?.5:0)+(has(u,'B08')?1.5:0))*c.A);
   if(has(u,'B08'))ward(f,u,u,.05*c.H,3,'Queen Is the Army');else for(const e of soldiers.filter(e=>e.targetId===c.t.id&&c.b.inRange(e,c.t)).slice(0,has(u,'A01')?4:3))f.proc(e,c.t,(.25+(has(u,'A06')?.1:0))*e.snapshot.A,'melee','Royal Mandate',{ignoreRange:false});
   if(few&&has(u,'B05'))heal(f,u,u,.03*c.H,'Unsupported Crown');if(has(u,'C06'))ward(f,u,c.tr,.04*c.H,3,'Guarding Mandate');return true;
  }
 },
 afterCast(f,u,c){if(c.u!==u||c.s.name!=="Queen's Sting")return;if(c.results[0]?.hit&&has(u,'B02')&&!pool(u,u,'Chitin Duelist'))ward(f,u,u,.02*c.H,3,'Chitin Duelist');if(has(u,'C07'))heal(f,u,ants(f,u,'shield-ant')[0],.02*c.H,'Waxed Chitin');}
});
function cloverSpent(f,u,n=1,prevented=0){if(!n)return;
 if(has(u,'B01'))u.kit.luckyStrike=.4*f.stats(u).A;if(has(u,'C06'))buff(f,u,f.trainer(u),'Guiding Clover','hit',20,3);
 f.after(()=>{if(has(u,'A05')&&f.has(u,'Clover Fold'))heal(f,u,u,.02*u.maxHp*n,'Good Omen');if(has(u,'C07')&&prevented>=.03*u.maxHp&&f.ready(u,'sparedLuck',3))ward(f,u,f.lowest(u,f.others(u)),.02*u.maxHp,3,'Spared by Luck');});
}
register('cloverbug',{
 luckyLeaf(){return true;},
 start(f,u){if(has(u,'A01'))u.kit.Clover=2;},
 capacity(f,u,max,owner,key){return owner===u&&key==='Clover'?(has(u,'A01')?3:2):max;},
 beforeCast(f,u,c){if(c.u!==u)return;c.luckyStrike=!!u.kit.luckyStrike;if(c.s.kind==='hit'&&has(u,'B08')){c.cloversSpent=c.take('Clover');cloverSpent(f,u,c.cloversSpent);}},
 primary(f,u,n,c,kind){if(c.u!==u||kind!=='damage')return n;n+=.55*c.A*(c.cloversSpent||0);if(c.s.name==='Leafplate Bump'){n+=spend(u,'strikingShelter');if(c.luckyStrike&&has(u,'B02'))n+=.35*c.A;}return n;},
 incoming(f,u,n,a,t,d){
  if(d.direct===false||d.dot||a?.side===u.side)return n;
  if(t===u){d.cloverEmpty=!(u.kit.Clover>0);if(has(u,'A08'))n*=1-.07*Math.min(3,u.kit.Clover||0);else if(!has(u,'B08')&&!has(u,'C08')&&f.take(u,'Clover',1)){cloverSpent(f,u,1,.2*n);n*=.8;}}
  const warning=f.get(a,'Lucky Warning');if(d.basic&&t!==u&&allies(u,t)&&warning?.source===u.id){f.remove(a,warning.key);n*=.85;if(has(u,'C04'))f.after(()=>heal(f,u,t,.02*u.maxHp,'Shared Relief'));}return n;
 },
 beforeHP(f,u,n,a,t,d){if(has(u,'C08')&&t===f.trainer(u)&&a?.side!==u.side&&d.direct!==false&&!d.dot&&n>0&&u.kit.Clover>0&&f.ready(u,'carriedLuck',1)){f.take(u,'Clover',1);cloverSpent(f,u,1,.2*n);return n*.8;}return n;},
 damaged(f,u,a,t,n,s,d){
  if(t!==u||a?.side===u.side||d.direct===false||d.dot||d.transfer||d.debt)return;
  if(has(u,'A08')){u.kit.greenHits=(u.kit.greenHits||0)+1;if(u.kit.greenHits%3===0&&f.take(u,'Clover',1)){cloverSpent(f,u);ward(f,u,u,.03*u.maxHp,3,'Clover Stays Green');}}
  if(d.active&&d.cloverEmpty&&has(u,'A07')&&f.ready(u,'emptyStem',4))f.add(u,'Clover',1,2);
  if(d.basic&&has(u,'B08')&&f.ready(u,'luckTeeth',2))f.add(u,'Clover',1,2);
 },
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){n+=spend(u,'luckyStrike');if(u.kit.foldingBlade>0){u.kit.foldingBlade--;n+=.2*f.stats(u).A;if(!u.kit.foldingBlade&&has(u,'B05'))f.after(()=>heal(f,u,u,.25*f.stats(u).A,'Green Momentum'));}}return n;},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B07')&&u.kit.talentBasics%3===0&&f.ready(u,'fortuneReclaimed',3))f.add(u,'Clover',1,2);},
 missed(f,u,a,t,d){if(!d.basic)return;
  if(t===u&&has(u,'A04')){const e=f.get(u,'Leafplate Bump');if(e&&!e.turned){e.turned=true;ward(f,u,u,.02*u.maxHp,3,'Turned Leaf');}}
  if(t===f.trainer(u)&&has(u,'C05')){const e=f.get(t,'Fold for Two');if(e?.source===u.id&&!e.borrowed){e.borrowed=true;f.add(u,'Clover',1,2);}}
 },
 effect(f,u,g){if(g.source===u&&g.key==='Leafplate Bump'&&has(u,'A02'))g.duration=3;},
 shield(f,u,g){if(g.source===u&&g.label==='Four-Leaf Shelter'&&has(u,'C01'))g.amount+=.03*u.maxHp;},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Clover Fold'&&has(u,'C03'))ward(f,u,f.trainer(u),n*.5,3,'Fold for Two');},
 afterCast(f,u,c){
  if(c.u!==u)return;
  if(c.s.name==='Leafplate Bump'){if(c.luckyStrike&&has(u,'B04'))c.debuff('Bumped Luck','physicalExposure',.06,3);if(has(u,'C02'))c.debuff('Lucky Warning','luckyWarning',.15,3);}
  if(c.s.name==='Clover Fold'){if(has(u,'A03'))c.add('Clover',1,2);if(has(u,'B03'))u.kit.foldingBlade=2;if(has(u,'C03'))buff(f,u,c.tr,'Fold for Two','flee',12.5,3);}
  if(c.s.name==='Four-Leaf Shelter'){if(has(u,'A06'))buff(f,u,c.tr,'Full Shelter','flee',20,3);if(has(u,'B06'))u.kit.strikingShelter=.6*c.A;if(has(u,'C01')){const i=skill(u,'Four-Leaf Shelter');if(i>=0)u.cds[i]+=1;}}
 }
});
function lever(f,u){if(has(u,'A08'))return true;const above=u.hp/u.maxHp>(has(u,'A01')?.4:.6);if(!above&&u.kit.leverAbove&&has(u,'B07'))u.kit.leverUntil=f.battle.time+2;u.kit.leverAbove=above;return above||(u.kit.leverUntil||0)>f.battle.time;}
function removeShieldPower(f,t,amount){f.syncShield(t);let remaining=amount;for(const p of [...t.pools].sort((a,b)=>a.until-b.until||a.key.localeCompare(b.key))){const n=Math.min(remaining,p.amount);p.amount-=n;remaining-=n;if(p.shared){p.shared.remaining=Math.max(0,p.shared.remaining-n);for(const other of f.battle.units)for(const peer of other.pools||[])if(peer.shared===p.shared)peer.amount=Math.min(peer.amount,p.shared.remaining);}if(!remaining)break;}f.syncShield(t);return amount-remaining;}
register('coralimp',{
 longLever(){return true;},
 start(f,u){lever(f,u);},
 tick(f,u){lever(f,u);},
 beforeCast(f,u,c){if(c.u!==u)return;c.longLever=lever(f,u);if(c.s.kind==='hit'&&u.kit.keptStraight){u.kit.keptStraight=false;c.mods.hit=(c.mods.hit||0)+25;}if(c.s.name==='Shellwhite Breaker'){c.breakerShielded=c.t.shield>0;c.tautTendon=spend(u,'tautTendon');}},
 primary(f,u,n,c,kind){if(c.u===u&&kind==='damage'&&c.s.name==='Shellwhite Breaker'){n+=(c.tautTendon||0)+(!c.breakerShielded&&has(u,'A06')?.4*c.A:0);if(has(u,'C08'))n*=.5;}return n;},
 outgoing(f,u,n,a,t,d){
  const on=lever(f,u),rate=(has(u,'A08')?.12:.06)*(has(u,'B08')?.5:1);if(d.category!=='magic'&&on){if(a===u)d.penetration=Math.max(d.penetration||0,rate);else if(allies(u,a)&&a.slot>0&&has(u,'C07')&&t.id===u.targetId)d.penetration=Math.max(d.penetration||0,rate*.5);}
  if(a===u&&d.basic&&has(u,'A05')){const e=f.get(u,'Tendon Lock');if(e&&!e.springloaded){e.springloaded=true;n+=.25*f.stats(u).A;}}return n;
 },
 incoming(f,u,n,a,t,d){if(t===u&&has(u,'B06')&&d.active&&d.primary){const p=pool(u,u,'Tendon Lock');if(p&&!p.firm){p.firm=true;n*=.8;}}return n;},
 shield(f,u,g){
  if(g.source===u&&g.target===u&&g.options.skill){if(g.label==='Tendon Lock'&&has(u,'B01')){g.amount+=.04*u.maxHp;g.duration=4;}if(has(u,'A08'))g.amount*=.6;}
  const e=f.get(g.target,'Splintered Branch');if(e?.source===u.id&&g.amount>0){f.remove(g.target,e.key);g.amount*=.8;}
 },
 shielded(f,u,source,t,n){const e=f.get(t,'Cracked Cover');if(t.side!==u.side&&n>0&&has(u,'C06')&&e?.source===u.id&&!e.taxed){e.taxed=true;ward(f,u,f.trainer(u),.4*f.stats(u).A,3,'Shell Tax');}},
 broken(f,u,a,t,p){
  if(a===u&&t.side!==u.side&&has(u,'A07')&&f.ready(u,'keptStraightCD',3)){u.kit.keptStraight=true;ward(f,u,u,.3*f.stats(u).A,3,'Kept Straight');}
  if(p.source!==u.id)return;if(t===u&&p.label==='Careful Breaker'&&has(u,'B05'))f.after(()=>heal(f,u,u,.02*u.maxHp,'Hard Landing'));if(p.label==='Shared Tendon'&&has(u,'C05'))buff(f,u,a,'Weakened basic','basicWeakness',.2,3,{harmful:true});
 },
 landed(f,u,a,t,r,d){if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Branch Warning');if(e?.source===u.id&&!e.angle){e.angle=true;f.proc(a,t,.25*f.stats(u).A,'melee','Clean Angle');}}},
 cast(f,u,c){if(c.s.name==='Shellwhite Breaker'&&has(u,'C08')){removeShieldPower(f,c.t,c.A);c.hit(2.9*c.A,{shieldBonus:.2});return true;}},
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.find(r=>r.primary&&r.hit);
  if(hit&&c.longLever&&has(u,'B08'))heal(f,u,u,.2*hit.damage,'Leverage into Life',.05*c.H);
  if(c.s.name==='Branchleg Kick'){
   if(hit&&c.longLever&&has(u,'A02')){buff(f,u,c.t,'Branch Fracture','physicalExposure',.05,3,{harmful:true});if(has(u,'A04'))buff(f,u,c.t,'Splintered Branch','splinteredBranch',.2,3,{harmful:true});}
   if(c.longLever&&has(u,'B02')){heal(f,u,u,.3*c.A,'Recovery Kick');if(has(u,'B04'))buff(f,u,u,'Knee Brace','basicDR',.15,2,{once:true});}if(hit&&has(u,'C02'))buff(f,u,c.t,'Branch Warning','hit',-20,3,{harmful:true});
  }
  if(c.s.name==='Tendon Lock'){if(has(u,'A03'))u.kit.tautTendon=.5*c.A;if(has(u,'C03')){buff(f,u,c.tr,'Shared Tendon aim','hit',20,3);ward(f,u,c.tr,.3*c.A,3,'Shared Tendon');}}
  if(c.s.name==='Shellwhite Breaker'&&hit){if(alive(c.t)&&has(u,'B03'))f.shield(u,u,.6*c.A,3,'Careful Breaker',{skill:c.s});if(has(u,'C01'))for(const t of has(u,'C08')?f.nearby(u,c.t,18,3,c.t):[c.t])buff(f,u,t,'Cracked Cover','shieldReceived',-.3,4,{harmful:true});}
 }
});
const emberMark=(f,u,t)=>f.get(t,'Little Embers:'+u.id),emberMax=u=>has(u,'A01')?4:3;
function addEmber(f,u,t,n=1){
 if(!alive(t))return;const old=emberMark(f,u,t),stacks=Math.min(emberMax(u),(old?.stacks||0)+n),duration=has(u,'A08')?6:has(u,'B01')?5:3,M=f.stats(u).M,key='Little Embers:'+u.id;
 if(has(u,'A08'))buff(f,u,t,key,'emberMarks',stacks,duration,{harmful:true,stacks,replace:true});
 else f.dot(u,t,key,stacks*.1*M*duration,duration,'magic',{stacks,replace:true,ownerRequired:true,label:'Little Embers',smolderUntil:old?.smolderUntil||0,tickAmount:e=>e.value*(e.smolderUntil>f.battle.time?2:1),afterTick:r=>{if(has(u,'B04'))limited(f,u,'gentleAsh',.2*(r?.damage||0),.25*M,n=>heal(f,u,u,n,'Gentle Ash',n));}});
}
function takeEmbers(f,u,t){const e=emberMark(f,u,t);if(!e||has(u,'B08'))return 0;const count=Math.min(e.stacks,has(u,'B06')?2:Infinity);e.stacks-=count;if(!e.stacks)f.remove(t,e.key);else e.value=has(u,'A08')?e.stacks:e.stacks*.1*f.stats(u).M;return count;}
register('lavaurchin',{
 littleEmbers(f,u,t){addEmber(f,u,t);return true;},
 support(f,u,s){if(s.name==='Wink Out'&&has(u,'C08'))return true;},
 gate(f,u,c){if(c.s.name==='Wink Out'){const ready=(emberMark(f,u,c.t)?.stacks||0)>=2||f.battle.time-(u.kit.targetSince||0)>=3;return ready&&(!has(u,'C08')||c.b.inRange(u,c.t)&&c.wounded(.9));}},
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Soot Spark')c.emberFull=(emberMark(f,u,c.t)?.stacks||0)>=emberMax(u);},
 primary(f,u,n,c,kind){return c.u===u&&kind==='damage'&&c.s.name==='Soot Spark'&&c.emberFull&&has(u,'A04')?n+.25*c.M:n;},
 incoming(f,u,n,a,t,d){
  if(d.direct!==false&&!d.dot){if(t===u&&a?.id===u.targetId&&has(u,'B07')&&(emberMark(f,u,a)?.stacks||0)>=3)n*=.88;if(d.active&&d.primary&&has(u,'C02')&&(emberMark(f,u,a)?.stacks||0)>=2)n*=.9;}
  if(t===u&&d.basic){const e=f.get(a,'Sooted Skin:'+u.id);if(e){f.remove(a,e.key);n*=.8;}}return n;
 },
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(a,'Ashen Guidance')?.source===u.id&&emberMark(f,u,t)?n+20:n;},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Cup the Cinder'&&has(u,'C03'))ward(f,u,f.trainer(u),n*.5,3,'Shared Cinder');},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(t===u&&p.label==='Cup the Cinder'&&has(u,'B05'))buff(f,u,a,'Thick Smoke','hit',-20,3,{harmful:true});if(p.label==='Shared Cinder'&&has(u,'C05'))f.after(()=>heal(f,u,t,.25*f.stats(u).M,'Cinder Comfort'));},
 landed(f,u,a,t,r,d){if(a===f.trainer(u)&&d.basic&&has(u,'C07')){const e=f.remove(t,'Kindling Another:'+u.id);if(e)addEmber(f,u,t);}},
 cast(f,u,c){
  if(c.s.name==='Soot Spark'){c.hit(1.15*c.M);if(c.results[0]?.hit)addEmber(f,u,c.t,has(u,'A02')?2:1);return true;}
  if(c.s.name==='Cup the Cinder'){if(has(u,'B03'))heal(f,u,u,.3*c.M,'Cooling Cup');c.selfward(.8*c.M);if(c.b.inRange(u,c.t))addEmber(f,u,c.t);if(has(u,'A03'))buff(f,u,u,'Kindled Cup','kindledCup',.4*c.M,has(u,'A05')?1e6:3);return true;}
  if(c.s.name==='Wink Out'){
   const spent=takeEmbers(f,u,c.t),primer=f.remove(u,'Kindled Cup');if(has(u,'C08'))c.heal(c.low,(.5+.35*spent)*c.M);else c.hit(2.2*c.M+(has(u,'A08')?.85:has(u,'A06')?.6:.45)*c.M*spent+(primer?.value||0));
   if(has(u,'B08')){const e=emberMark(f,u,c.t);if(e){e.smolderUntil=f.battle.time+4;addEmber(f,u,c.t,0);}}
   if(has(u,'A07')&&spent>=3)addEmber(f,u,c.t);if(has(u,'C06')&&spent)ward(f,u,f.lowest(u),.15*c.M*spent,3,'Warm Wink');return true;
  }
 },
 afterCast(f,u,c){if(c.u!==u||c.s.name!=='Soot Spark'||!c.results[0]?.hit)return;if(has(u,'B02'))buff(f,u,c.t,'Sooted Skin:'+u.id,'sootedSkin',.2,3,{harmful:true});if(has(u,'C01')){const t=f.lowest(u);ward(f,u,t,.2*c.M,3,'Gentle Flame');if(has(u,'C04'))buff(f,u,t,'Ashen Guidance','ashenGuidance',20,3);}if(has(u,'C07'))buff(f,u,c.t,'Kindling Another:'+u.id,'kindlingAnother',1,3,{harmful:true});}
});
function grantAmbush(f,u,duration=null){if(has(u,'C08')){buff(f,u,f.trainer(u),'Ambush Lesson:'+u.id,'ambushLesson',.2,has(u,'A01')?5:3);u.kit.lessonAmbush=true;}else buff(f,u,u,'Ambush','ambush',1,duration??(has(u,'A08')?4:has(u,'A01')?5:3));}
function spendAmbush(f,u,signature){
 if(has(u,'C08')){if(!signature||!u.kit.lessonAmbush)return false;u.kit.lessonAmbush=false;}
 else {const e=f.get(u,'Ambush');if(!e||!signature&&(has(u,'A01')||has(u,'A08')))return false;e.used=true;if(!has(u,'A08'))f.remove(u,e.key);}
 if(has(u,'C01'))u.kit.sharedAmbush=.25*f.stats(u).A;if(has(u,'B06'))f.after(()=>ward(f,u,u,.3*f.stats(u).A,3,'Leave a Layer'));return true;
}
register('leafmantis',{
 foldedAmbush(){return true;},
 beforeCast(f,u,c){if(c.u===u){c.ambush=has(u,'C08')?!!u.kit.lessonAmbush:f.has(u,'Ambush');if(c.s.name==='Unfurling Cut')c.sharpFold=f.remove(u,'Sharp Fold');}},
 primary(f,u,n,c,kind){
  if(c.u===f.trainer(u)&&kind==='damage'){const e=f.remove(c.u,'Ambush Lesson:'+u.id);if(e)n*=1.2;}
  if(c.u!==u||kind!=='damage')return n;
  if(c.s.name==='Budblade'&&c.ambush&&has(u,'A02'))n+=.3*c.A;if(c.s.name==='Unfurling Cut'){n+=(c.sharpFold?.value||0);if(has(u,'B08'))n*=.8;}return n;
 },
 outgoing(f,u,n,a,t,d){
  if(a===f.trainer(u)&&d.active&&d.primary&&u.kit.sharedAmbush){const amount=spend(u,'sharedAmbush');f.after(()=>f.proc(a,t,amount,'melee','Shared Ambush'));}
  if(a!==u)return n;if(d.basic&&has(u,'A08')&&f.has(u,'Ambush'))n*=.7;
  if(d.primary&&spendAmbush(f,u,d.active)){if(!has(u,'C08'))n*=has(u,'A08')?1.15:1.2;const c=f.currentCompanionCast;if(c?.u===u){c.ambushSpent=true;if(c.s.name==='Budblade'&&has(u,'A04'))d.penetration=Math.max(d.penetration||0,.08);}}
  return n;
 },
 incoming(f,u,n,a,t,d){return allies(u,t)&&t!==u&&d.basic&&has(u,'C04')&&f.get(a,'Leaf Mark')?.source===u.id?n*.9:n;},
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Leaf Mark')?.source===u.id?n+20:n;},
 effect(f,u,g){if(g.source===u&&g.key==='Closed Leaves'&&has(u,'B01'))g.duration=4;},
 effectExpired(f,u,t,e){if(t===u&&e.key==='Ambush'&&!e.used&&has(u,'C07')&&f.ready(u,'undisturbedLesson',3))ward(f,u,f.lowest(u),.3*f.stats(u).A,3,'Undisturbed Lesson');},
 shield(f,u,g){if(g.source===u&&g.label==='Close the Leaves'&&has(u,'B01'))g.amount+=.03*u.maxHp;},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Close the Leaves'&&has(u,'C03'))ward(f,u,f.trainer(u),n*.5,3,'Cover the Trainer');},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Closed Cut'&&has(u,'B05'))buff(f,u,u,'Safe Unfurl','nextActiveDR',.2,3,{once:true});},
 missed(f,u,a,t,d){if(!d.basic)return;if(t===u&&has(u,'B07')){const e=f.get(u,'Closed Leaves');if(e&&!e.repaired){e.repaired=true;heal(f,u,u,.02*u.maxHp,'Repair the Bud');}}if(t===f.trainer(u)&&has(u,'C05')){const e=f.get(t,'Cover the Trainer');if(e?.source===u.id&&!e.camouflaged){e.camouflaged=true;grantAmbush(f,u);}}},
 death(f,u,a,t){if(has(u,'A07')&&t.side!==u.side&&!t.temporary&&t.id===u.kit.originalTarget&&f.ready(u,'freshBud',3))grantAmbush(f,u,3);},
 cast(f,u,c){if(c.s.name==='Unfurling Cut'){
  c.hit(2.8*c.A);if(!has(u,'B08'))c.debuff('Armor exposure','physicalExposure',.06,3);
  else{buff(f,u,u,'Closed Leaves','flee',20,3);const p=u.pools.filter(p=>p.source===u.id&&p.amount>0).sort((a,b)=>b.amount-a.amount)[0];if(p)mendShield(f,u,u,p,.6*c.A);}
  if(c.ambushSpent&&has(u,'A06'))c.splash(.45*c.A,18,1);return true;
 }},
 afterCast(f,u,c){
  if(c.u!==u)return;const hit=c.results.some(r=>r.primary&&r.hit);if(c.primary?.kind!=='damage')grantAmbush(f,u);
  if(c.s.name==='Budblade'){if(has(u,'B02')&&u.shield>0){heal(f,u,u,.25*c.A,'Bud Renewal');if(has(u,'B04'))buff(f,u,u,'Tender Leaf','flee',15,2);}if(hit&&has(u,'C02'))buff(f,u,c.t,'Leaf Mark','leafMark',20,3,{harmful:true});}
  if(c.s.name==='Close the Leaves'){if(has(u,'A03'))buff(f,u,u,'Sharp Fold','sharpFold',.4*c.A,75);if(has(u,'C03'))buff(f,u,c.tr,'Cover the Trainer','flee',10,3);}
  if(c.s.name==='Unfurling Cut'){if(hit&&c.sharpFold&&has(u,'A05'))charge(f,u,u,'Second Blade',.3*c.A);if(c.ambushSpent&&has(u,'B03'))ward(f,u,u,.5*c.A,3,'Closed Cut');if(hit&&!has(u,'B08')&&has(u,'C06'))for(const t of f.nearby(u,c.t,18,3,c.t).filter(t=>t!==c.t).slice(0,2))buff(f,u,t,'Open the Canopy','physicalExposure',.03,3,{harmful:true});}
 }
});
const beacons=(f,u)=>f.entities.filter(e=>alive(e)&&e.master===u&&e.profile==='light-beacon');
function beaconHeal(f,u,e){const t=f.core(u).find(t=>t.id===e.assigned);if(!t||f.battle.distance(e,t)>e.spec.radius)return;heal(f,u,t,.25*e.snapshot.M,'Comforting Beacon');if(has(u,'B08'))buff(f,u,t,'Resting Lights','healReceived',.15,2);}
function beaconShot(f,u,e){if(e.shots>=3)return;const t=f.nearby(u,e,e.spec.radius,1,f.battle.target(u))[0];if(t){e.shots++;f.proc(e,t,.25*e.snapshot.M,'magic','Night-Hunting Lights');}}
register('lumimoth',{
 gate(f,u,c){if(c.s.name==='Two Lanterns'&&has(u,'A08'))return beacons(f,u).length<Math.min(2,c.other.length)||beacons(f,u).some(e=>e.hp<e.maxHp);},
 fits(f,u,c){if(c.s.name==='Two Lanterns'&&has(u,'A08')&&beacons(f,u).length)return true;},
 entityCreated(f,u,e){if(e.profile!=='light-beacon')return;if(has(u,'A01'))e.hp=e.maxHp=Math.round(.08*u.maxHp);if(has(u,'A06'))e.spec.radius=24;if(has(u,'A08'))e.until=1e6;e.comfortTicks=0;e.nextComfort=e.born+2;e.nextHunt=e.born+1.5;if(has(u,'B08'))beaconHeal(f,u,e);if(has(u,'C08'))beaconShot(f,u,e);},
 entityTick(f,u,e){if(e.profile!=='light-beacon')return;if((has(u,'B05')||has(u,'B08'))&&e.comfortTicks<2&&f.battle.time>=e.nextComfort){beaconHeal(f,u,e);e.comfortTicks++;e.nextComfort+=2;}if(has(u,'C08')&&e.shots<3&&f.battle.time>=e.nextHunt){beaconShot(f,u,e);e.nextHunt+=1.5;}},
 entityEnded(f,u,e,reason){if(e.profile==='light-beacon'&&reason==='destroyed'&&has(u,'A07')){const partner=beacons(f,u)[0];if(partner&&!partner.relay){partner.relay=true;const t=f.core(u).find(t=>t.id===partner.assigned);ward(f,u,t,.4*partner.snapshot.M,3,'Lantern Relay');}}},
 beaconAura(f,u,e,t){if(!has(u,'B08')&&!has(u,'C08'))buff(f,u,t,'Beacon light','basicDamage',has(u,'A08')?.08:has(u,'A01')?.15:.1,.1);return true;},
 effect(f,u,g){if(g.source===u&&g.key==='Lantern Dust'&&has(u,'A02'))g.duration=5;},
 shield(f,u,g){if(g.source===u&&g.label==='Light Beacon'&&has(u,'B03'))g.duration=5;},
 healAmount(f,u,n,source,t){return source===u&&has(u,'B07')&&(t.pools.some(p=>p.amount>0&&p.until>f.battle.time&&p.source===u.id)||beacons(f,u).some(e=>f.battle.distance(e,t)<=e.spec.radius))?n*1.12:n;},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Warm Hood'&&has(u,'B06'))ward(f,u,t,Math.min(.4*f.stats(u).M,.4*(o.offered-n)),3,'Hood Stitch');},
 primary(f,u,n,c,kind){return c.u===u&&kind==='damage'&&c.s.name==='Lantern Dust'&&has(u,'B02')?n*.8:n;},
 outgoing(f,u,n,a,t,d){
  if(a===u&&d.basic&&has(u,'C02')){const e=f.get(t,'Lantern Dust');if(e?.source===u.id&&!e.lightburn){e.lightburn=true;n+=.3*f.stats(u).M;if(has(u,'C04'))f.after(()=>buff(f,u,t,'Scorching Glare','healReceived',-.25,3,{harmful:true}));}}
  if(a===f.trainer(u)&&d.active&&d.primary){const e=f.remove(a,'Seen Through:'+u.id);if(e){if(d.category==='magic')d.magicBypassPoints=Math.max(d.magicBypassPoints||0,.06);else d.penetration=Math.max(d.penetration||0,.06);}}return n;
 },
 landed(f,u,a,t,r,d){
  const e=f.get(t,'Lantern Dust');if(e?.source!==u.id)return;
  if(allies(u,a)&&d.basic&&has(u,'A04')&&!e.crosshair){e.crosshair=true;f.proc(u,t,.25*f.stats(u).M,'magic','Shared Crosshair');}
  if(a===u&&has(u,'C07')&&!e.seenThrough){e.seenThrough=true;buff(f,u,f.trainer(u),'Seen Through:'+u.id,'seenThrough',.06,75);}
 },
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Hood of Light'&&has(u,'C06')){buff(f,u,a,'Lantern Dust','flee',-20,3,{harmful:true});buff(f,u,a,'Blinding Dust','hit',-20,3,{harmful:true});}},
 cast(f,u,c){if(c.s.name==='Two Lanterns'&&has(u,'A08')){for(const t of [c.tr,...c.other.filter(t=>t.slot>0)].filter(alive).slice(0,2)){const e=beacons(f,u).find(e=>e.assigned===t.id);if(e)c.heal(e,.5*e.maxHp);else c.deploy('light-beacon',{assigned:t});}return true;}},
 afterCast(f,u,c){
  if(c.u!==u)return;
  if(c.s.name==='Lantern Dust'&&c.results[0]?.hit){if(has(u,'B02')){const t=f.lowest(u);ward(f,u,t,.25*c.M,3,'Gentle Dust');if(has(u,'B04'))buff(f,u,t,'Soft Illumination','nextActiveDR',.12,3,{once:true});}if(has(u,'C01'))buff(f,u,c.t,'Blinding Dust','hit',-20,3,{harmful:true});}
  if(c.s.name==='Hood of Light'){
   const t=c.primary.target;if(has(u,'B01'))f.heal(u,t,.35*c.M,'Warm Hood',{primary:true,talent:true});
   if(has(u,'A03')){const e=f.entities.filter(e=>alive(e)&&e.profile==='light-beacon'&&e.side===u.side&&e.owner===u.owner).sort((a,b)=>f.battle.distance(u,a)-f.battle.distance(u,b)||a.id.localeCompare(b.id))[0];if(e){const n=heal(f,u,e,.02*c.H,'Sheltered Flame');if(n>0&&has(u,'A05'))ward(f,u,c.all.find(t=>t.id===e.assigned),.25*c.M,3,'Kept Alight');}}
  }
  if(c.s.name==='Two Lanterns'&&c.deployments&&has(u,'C03')){const count=beacons(f,u).filter(e=>alive(c.t)&&f.battle.distance(e,c.t)<=e.spec.radius).length;if(count)f.proc(u,c.t,(.35+(count>=2&&has(u,'C05')?.3:0))*c.M,'magic','Hostile Beacon');}
 }
});
function reflectMirror(f,u,a,t,n,s,d){
 const A=f.stats(u).A,amount=Math.min((has(u,'A08')?.6:has(u,'A01')?.85:.6)*A,(has(u,'A08')?.15:has(u,'A01')?.3:.2)*(n+s));
 const r=f.proc(u,a,amount,'melee','False Torso');if(has(u,'A06'))u.kit.storedReflection=Math.min(.4*A,.25*(r?.damage||0));if(has(u,'B01'))u.kit.sharpReflection=.35*A;
 if(has(u,'A04')&&pool(u,u,'Mirror Edge'))buff(f,u,a,'Familiar Face:'+u.id,'familiarFace',.3*A,75,{harmful:true});if(has(u,'C03'))buff(f,u,f.trainer(u),'Reflected Courage','hit',20,3);
}
register('mirrormantis',{
 falseTorso(){return true;},
 beforeCast(f,u,c){if(c.u!==u)return;if(c.s.kind==='hit')c.dangerousAngle=f.remove(u,'Dangerous Angle');if(c.s.name==='Mirror Edge')c.recentEnemyCast=(u.kit.mirrorCasts?.[c.t.id]??-Infinity)>=f.battle.time-2;},
 primary(f,u,n,c,kind){if(c.u!==u||kind!=='damage')return n;n+=c.dangerousAngle?.value||0;if(c.s.name==='Mirror Edge'){n+=spend(u,'sharpReflection');if(c.startShield&&has(u,'B02'))n+=.25*c.A;}return n;},
 effect(f,u,g){if(g.source===u&&g.key==='Perfect Angle'&&has(u,'A03'))g.value=.3;},
 shield(f,u,g){if(g.source===u&&g.target===u&&g.label==='Mirror Edge'&&has(u,'A02')&&f.currentCompanionCast?.recentEnemyCast)g.amount+=.2*f.stats(u).A;},
 shielded(f,u,source,t,n,label,p){if(source!==u||t!==u)return;if(label==='Perfect Angle'){p.angleAt=f.battle.time;if(has(u,'C01'))ward(f,u,f.trainer(u),n*.5,3,'Shared Angle');}},
 incoming(f,u,n,a,t,d){return t===f.trainer(u)&&d.basic&&has(u,'C02')&&f.get(a,'Edge of Cover')?.source===u.id?n*.9:n;},
 damaged(f,u,a,t,n,s,d){
  if(d.proc||d.transfer||d.debt||d.direct===false||d.dot||a?.side===u.side)return;
  const p=pool(u,u,'Perfect Angle');if(t===u&&d.active&&p)p.sawActive=true;
  const wearer=has(u,'C08')?f.trainer(u):u,patient=has(u,'A07')&&d.basic&&p&&!p.sawActive&&!p.patientUsed&&f.battle.time-p.angleAt>=2;
  if(t===wearer&&d.shieldBefore>0&&(d.active||has(u,'A08')||patient)&&f.ready(u,'mirrorCD',has(u,'A08')?1:2)){if(patient)p.patientUsed=true;reflectMirror(f,u,a,t,n,s,d);}
  if(t===f.trainer(u)&&d.basic&&has(u,'C04')){const e=f.get(a,'Edge of Cover');if(e?.source===u.id&&!e.stitched){e.stitched=true;ward(f,u,t,.25*f.stats(u).A,3,'Silver Stitch');}}
 },
 defenseConsumed(f,u,t,e){if(t===u&&e.source===u.id&&e.key==='Perfect Angle'&&has(u,'A05'))f.after(()=>heal(f,u,u,.02*u.maxHp,'Angle Recovery'));},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Perfect Angle'&&has(u,'C07'))buff(f,u,a,'Weakened active','activeWeakness',.15,3,{harmful:true});},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){const e=f.remove(t,'Familiar Face:'+u.id);if(e)n+=e.value;}if(a===f.trainer(u)&&d.basic&&has(u,'C05')){const e=f.get(a,'Reflected Courage');if(e?.source===u.id&&!e.helpful){e.helpful=true;f.after(()=>f.proc(a,t,.2*f.stats(u).A,'melee','Helpful Image'));}}return n;},
 cast(f,u,c){if(c.s.name==='Shattered Reflection'){
  let mirror=0;if(has(u,'B08')){for(const p of u.pools.filter(p=>p.source===u.id&&['Mirror Edge','Perfect Angle'].includes(p.label))){mirror+=p.amount;p.amount=0;}f.syncShield(u);}
  c.hit((2.8*(has(u,'A08')?.8:1)+(c.startShield?(has(u,'B06')?.8:.4):0))*c.A+spend(u,'storedReflection')+Math.min(1.5*c.A,.6*mirror));return true;
 }},
 afterCast(f,u,c){
  if(c.u!==u){if(c.u.side!==u.side){u.kit.mirrorCasts||={};u.kit.mirrorCasts[c.u.id]=f.battle.time;}return;}
  if(c.s.name==='Mirror Edge'&&c.results[0]?.hit){if(c.startShield&&has(u,'B04'))f.dot(u,c.t,'Silver Wound:'+u.id,.3*c.A,3,'melee',{label:'Silver Wound',ownerRequired:true});if(has(u,'C02'))buff(f,u,c.t,'Edge of Cover','edgeCover',.1,3,{harmful:true});}
  if(c.s.name==='Perfect Angle'&&has(u,'B03'))buff(f,u,u,'Dangerous Angle','dangerousAngle',.4*c.A,has(u,'B05')?1e6:3);
  if(c.s.name==='Shattered Reflection'&&c.startShield){if(has(u,'B07'))heal(f,u,u,.3*c.A,'Cut and Mend');if(has(u,'C06'))ward(f,u,f.lowest(u,c.other),.5*c.A,3,'Protective Shatter');}
 }
});
register('prismwasp',{
 spectralAfterimage(){return true;},
 beforeCast(f,u,c){if(c.u===u){c.focusedFacet=u.kit.prismPrevious==='Facet Lance';c.pairedColors=u.kit.prismReceived?.[c.t?.id]==='Refracting Edge';}},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){const e=f.remove(u,'True Point');if(e)d.prismPoint=true;}return n;},
 landed(f,u,a,t,r,d){
  if(a===u&&d.active&&has(u,'A07')&&!t.temporary){u.kit.prismTargets||={};if(!u.kit.prismTargets[t.id]){u.kit.prismTargets[t.id]=true;buff(f,u,u,'True Point','crit',.15,75);}}
  if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Guiding Facet');if(e?.source===u.id&&!e.shared){e.shared=true;f.proc(u,t,.2*f.stats(u).A,'magic','Shared Focus');}}
 },
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(p.label==='Folding Light'&&has(u,'C05'))buff(f,u,a,'Weakened active','activeWeakness',.15,3,{harmful:true});if(p.label==='Prism Ward'&&has(u,'C07')&&f.ready(u,'restoredColor',2))f.after(()=>heal(f,u,t,.1*f.stats(u).A,'Restored Color'));},
 cast(f,u,c){
  let physical=c.s.name==='Facet Lance'?1.4:c.s.name==='Refracting Edge'?1:1.6,magic=c.s.name==='Refracting Edge'?.8:c.s.name==='Spectrum Skewer'?1.5:0,options={category:'melee'};
  if(c.s.name==='Facet Lance'){if(c.focusedFacet&&has(u,'A01'))physical+=.3;if(has(u,'B02')){magic=physical*.3;physical*=.7;if(c.pairedColors&&has(u,'B04'))magic+=.2;}}
  if(c.s.name==='Refracting Edge'&&has(u,'A03')){physical+=.35;magic-=.15;}
  if(c.s.name==='Spectrum Skewer'&&has(u,'A02'))Object.assign(options,{hitBonus:25,penetration:.06});
  if(has(u,'A08')){physical+=magic*.85;magic=0;}
  if(has(u,'B08')){magic+=physical*.9;physical=0;options={category:'magic',noCritical:true};}
  let r;if(physical)r=c.hit(physical*c.A,options);else r=c.hit(magic*c.A,options);
  c.prismPhysical=physical>0&&r.hit;c.prismMagic=physical===0&&r.hit;
  if(magic&&physical&&alive(c.t)){const m=f.proc(u,c.t,magic*c.A,'magic',c.s.name,{magicBypassPoints:c.s.name==='Refracting Edge'&&has(u,'B03')?.08:0});c.prismMagic=m.hit;}
  if(r.hit&&c.s.name==='Facet Lance'){if(c.focusedFacet&&has(u,'A04'))charge(f,u,u,'Deep Facet',.25*c.A);if(has(u,'C02'))buff(f,u,c.t,'Guiding Facet','flee',-20,3,{harmful:true});}
  if(c.s.name==='Refracting Edge'){if(c.prismPhysical&&has(u,'A05'))buff(f,u,c.t,'Cracked Spectrum','physicalExposure',.05,3,{harmful:true});if(c.prismMagic&&has(u,'B05'))for(const t of f.nearby(u,c.t,18,2,c.t).filter(t=>t!==c.t).slice(0,1))f.proc(u,t,.2*c.A,'magic','Split Light');if(has(u,'C03'))ward(f,u,u,.35*c.A,3,'Folding Light');}
  if(c.s.name==='Spectrum Skewer'&&r.hit){if(has(u,'B06'))f.dot(u,c.t,'Spectrum Trail:'+u.id,.3*c.A,3,'magic',{ownerRequired:true,label:'Spectrum Trail'});if(has(u,'C06')&&(c.prismPhysical&&c.prismMagic||has(u,'A08')||has(u,'B08'))){ward(f,u,c.tr,.5*c.A,3,'Spectrum Veil');buff(f,u,c.tr,'Spectrum Veil aim','hit',20,3);}}
  return true;
 },
 afterCast(f,u,c){
  if(c.u!==u)return;const r=c.results.find(r=>r.primary&&r.hit);u.kit.prismPrevious=c.s.name;if(!r)return;u.kit.prismReceived||={};u.kit.prismReceived[r.target.id]=c.s.name;
  if(!f.ready(u,'afterimageCD',1))return;const amount=((has(u,'B01')?.3:.2)+(r.critical&&has(u,'A06')?.15:0))*c.A,t=f.lowest(u);
  if(has(u,'C08')){ward(f,u,t,2*amount,3,'Inward Light');if(has(u,'C01'))ward(f,u,t,Math.min(.2*c.A,.5*amount),3,'Prism Ward');}
  else{const result=f.proc(u,r.target,amount,'magic','Spectral Afterimage'),dealt=result.damage||0;if(has(u,'B07'))heal(f,u,u,.2*dealt,'Glass Feeding');if(has(u,'C01'))ward(f,u,t,Math.min(.2*c.A,.5*dealt),3,'Prism Ward');}
 }
});
const ownedEntity=(f,u,id)=>f.entities.find(e=>alive(e)&&e.master===u&&e.profile===id);
function clinging(f,u,t,duration){const old=f.get(t,'Clinging Resin');buff(f,u,t,'Clinging Resin','basicPenalty',.1,duration,{harmful:true,warned:old?.warned||false});}
register('resinroach',{
 support(f,u,s){if(s.name==='Resin Bastion'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Resin Bastion'){if(has(u,'B08'))return c.threat();if(has(u,'C08'))return alive(c.t);if(has(u,'A08'))return !!root.BondCombatEntities.screenThreat(f,u)&&(!ownedEntity(f,u,'resin-screen')||ownedEntity(f,u,'resin-screen').hp<ownedEntity(f,u,'resin-screen').maxHp);}},
 fits(f,u,c){if(c.s.name==='Resin Bastion'&&(has(u,'B08')||has(u,'C08')||has(u,'A08')&&ownedEntity(f,u,'resin-screen')))return true;},
 entityCreated(f,u,e){if(e.profile==='resin-screen'){if(has(u,'A01')){e.maxHp=e.hp=Math.round(.28*u.maxHp);e.until+=2;}if(has(u,'A08'))e.until=1e6;}},
 screenImpact(f,u,e,a,raw,d){
  if(d.basic&&has(u,'A06')&&!e.fineMesh){e.fineMesh=true;raw*=.75;}
  const absorbed=f.absorb(e,raw,a,{...d,screen:true}),used=Math.min(e.hp,absorbed.remaining);f.loss(a,e,used,'Resin Screen',{screen:true,direct:false});
  e.intercepted=(e.intercepted||0)+used+absorbed.absorbed;if(has(u,'A07')&&!e.collected&&e.intercepted>=.08*u.maxHp){e.collected=true;u.kit.collectedAmber=.5*f.stats(u).A;}if(d.basic)clinging(f,u,a,2);return Math.max(0,absorbed.remaining-used);
 },
 effect(f,u,g){if(g.source===u&&g.key==='Clinging Resin')g.extra={...g.extra,warned:f.get(g.target,g.key)?.warned||false};},
 outgoing(f,u,n,a,t,d){if(d.active&&has(u,'C07')){const e=f.get(a,'Clinging Resin');if(e?.source===u.id&&!e.warned){e.warned=true;n*=.88;}}if(a===u&&d.basic){const e=f.get(u,'Caged Fire');if(e){n+=e.value;if(--e.charges<=0)f.remove(u,e.key);}}return n;},
 shield(f,u,g){if(g.options.primary&&has(u,'C04')&&f.get(g.source,'Resin Blind')?.source===u.id)g.amount*=.8;if(has(u,'C08')&&u.kit.resinZone&&u.kit.resinZone.until>f.battle.time&&g.target.side!==u.side&&f.battle.distance(g.target,u.kit.resinZone)<=24)g.amount*=.75;},
 absorbed(f,u,a,t,p,n){if(t===u&&p.source===u.id&&p.label==='Seal the Cracks'&&has(u,'B03'))u.kit.hammerResin=Math.min(.8*f.stats(u).A,(u.kit.hammerResin||0)+.2*n);},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(t.temporary&&p.label==='Sealed Wall'&&has(u,'A05'))f.after(()=>heal(f,u,u,.02*u.maxHp,'Resin Return'));if(p.label==='Helping Seal'&&has(u,'C05'))f.after(()=>heal(f,u,t,.03*u.maxHp,'Warm Sap'));},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B07')&&f.has(t,'Clinging Resin')){u.kit.sapBasics=(u.kit.sapBasics||0)+1;if(u.kit.sapBasics%3===0&&f.ready(u,'oldSap',3))heal(f,u,u,.02*u.maxHp,'Old Sap');}},
 tick(f,u){const z=u.kit.resinZone;if(z?.until>f.battle.time)for(const t of f.nearby(u,z,24,3))buff(f,u,t,'Amber Prison','basicPenalty',.2,.1,{harmful:true});},
 cast(f,u,c){
  if(c.s.name==='Amber Fist'){
   const resin=c.mark('Clinging Resin'),stored=spend(u,'hammerResin'),r=c.hit(1.2*c.A+(pool(u,u,'Seal the Cracks')&&has(u,'B01')?.4*c.A:0)+stored+spend(u,'collectedAmber'));
   if(r.hit){if(resin||has(u,'C01'))clinging(f,u,c.t,3);if(resin&&has(u,'B02')){buff(f,u,c.t,'Fossil Bite','physicalExposure',.06,3,{harmful:true});if(has(u,'B04'))buff(f,u,c.t,'Buried Joint','nextBasicDelay',.15,75,{harmful:true});}if(has(u,'C02'))buff(f,u,c.t,'Resin Blind','hit',-20,3,{harmful:true});if(stored&&has(u,'B05'))heal(f,u,u,.15*r.damage,'Living Fossil',.04*c.H);const e=ownedEntity(f,u,'resin-screen');if(e&&has(u,'A02')){const n=heal(f,u,e,.02*c.H,'Sticky Fist');if(n&&has(u,'A04'))ward(f,u,c.tr,.02*c.H,3,'Thickened Impact');}}return true;
  }
  if(c.s.name==='Resin Bastion'){
   if(has(u,'B08')){c.selfward(.12*c.H,4);buff(f,u,u,'Rook Leaves the Wall','basicTempo',.2,4);}
   else if(has(u,'C08')){u.kit.resinZone={position:{...c.t.position},until:f.battle.time+4};}
   else{const e=ownedEntity(f,u,'resin-screen');if(e&&has(u,'A08')){heal(f,u,e,.5*e.maxHp,'Permanent Rampart');const tr=c.tr,t=root.BondCombatEntities.screenThreat(f,u);if(t&&tr){const dx=t.position.x-tr.position.x,dy=t.position.y-tr.position.y,len=dx*dx+dy*dy,s=((e.position.x-tr.position.x)*dx+(e.position.y-tr.position.y)*dy)/len,dist=Math.hypot(e.position.x-tr.position.x-s*dx,e.position.y-tr.position.y-s*dy);if(s<=0||s>=1||dist>12){const p=root.BondCombatEntities.placement(f,u,e.spec);if(p)e.position=p;}}}else c.deploy('resin-screen');}
   if(has(u,'B06'))buff(f,u,u,'Caged Fire','cagedFire',.25*c.A,75,{charges:2});if(has(u,'C06'))for(const t of f.nearby(u,c.t,18,3,c.t))clinging(f,u,t,3);return true;
  }
 },
 afterCast(f,u,c){if(c.u===u&&c.s.name==='Seal the Cracks'){const e=ownedEntity(f,u,'resin-screen');if(e&&has(u,'A03'))ward(f,u,e,.04*c.H,3,'Sealed Wall');if(has(u,'C03'))ward(f,u,c.tr,(c.receivers[0]?.actual||0)*.5,3,'Helping Seal');}},
});
function cursedScript(f,u,t){buff(f,u,t,'Cursed Script','cursedScript',-.12,3,{harmful:true});}
function inscriptionRepair(f,u){if(has(u,'B07')&&f.ready(u,'wardRepair',2)){const e=ownedEntity(f,u,'ward-rune');if(e)heal(f,u,e,.01*u.maxHp,'Ward Repair');}}
register('saffronmoth',{
 threefoldInscription(){return true;},
 outgoing(f,u,n,a,t,d){return d.active&&d.primary&&f.get(a,'Cursed Script')?.source===u.id?n*.88:n;},
 gate(f,u,c){if(c.s.name==='Root Rune'&&has(u,'A08')){const e=ownedEntity(f,u,'assault-rune');return e?e.hp<e.maxHp:c.all.some(t=>alive(c.b.target(t)));}},
 fits(f,u,c){if(c.s.name==='Root Rune'&&has(u,'A08')&&ownedEntity(f,u,'assault-rune'))return true;},
 support(f,u,s){if(s.name==='Root Rune'&&has(u,'C08'))return false;},
 entityCreated(f,u,e){if(e.profile==='assault-rune'){if(has(u,'A01')){e.spec.triggers=6;e.until=e.born+6;}if(has(u,'A03')){e.maxHp=e.hp=Math.round(.11*u.maxHp);ward(f,u,u,.25*e.snapshot.M,3,'Reinforced Inscription');}if(has(u,'A08'))e.until=1e6;if(has(u,'C08')){e.spec.pulses=[0,2,4];e.until=e.born+5;}if(has(u,'C03')){const t=f.nearby(u,e,e.spec.radius,1)[0];if(t){f.proc(e,t,.4*e.snapshot.M,'magic','Unwelcome Rune');if(has(u,'C05'))buff(f,u,t,'Sour Ink','healReceived',-.25,4,{harmful:true});}}}},
 runeAura(f,u){return has(u,'C08');},
 runeTrigger(f,u,e,a,t){if(has(u,'C08'))return true;if(e.triggers<(has(u,'A08')?Infinity:e.spec.triggers)&&f.ready(e,'triggerCD',has(u,'A08')?1.5:1)){e.triggers++;f.proc(e,t,(has(u,'A08')?.18:.25)*e.snapshot.M*(has(u,'A06')&&pool(a,u,'Ward Rune')?1.15:1),'magic','Assault Rune');}return true;},
 entityPulse(f,u,e){
  if(e.profile==='assault-rune'&&has(u,'C08')){for(const t of f.nearby(u,e,e.spec.radius,3)){f.proc(e,t,.45*e.snapshot.M,'magic','Rune Beneath the Enemy',{area:true});if(e.pulseIndex===0){cursedScript(f,u,t);buff(f,u,t,'Sour Ink','healReceived',-.25,4,{harmful:true});}}return true;}
  if(e.profile!=='ward-rune')return;const targets=f.core(u).filter(t=>f.battle.distance(e,t)<=e.spec.radius),last=e.pulseIndex===2;
  if(has(u,'B08')&&e.pulseIndex>0){const t=f.lowest(u,targets);if(t){heal(f,u,t,.8*e.snapshot.M,'Garden in Ink');buff(f,u,t,'Garden in Ink recovery','healReceived',.15,2);}}
  else{const pulse={used:false};for(const t of targets)ward(f,u,t,(has(u,'B01')?.55:.4)*e.snapshot.M,2,'Ward Rune',{runePulse:pulse});for(const t of targets){const p=pool(t,u,'Ward Rune');if(p)p.runePulse=pulse;}}
  if(last&&has(u,'B06'))for(const t of targets)heal(f,u,t,.35*e.snapshot.M,'Petal Renewal');return true;
 },
 scriptReading(f,u,a,t,e){f.remove(t,e.key);f.proc(u,t,e.value,'magic','Saffron Script');if(has(u,'A04')&&a===f.trainer(u))buff(f,u,a,'Reading Together','hit',20,3);if(has(u,'B04'))heal(f,u,a,.2*f.stats(u).M,'Scripted Mercy');if(has(u,'C04')){const curse=f.get(t,'Cursed Script');if(curse?.source===u.id)curse.until+=1;}return true;},
 effect(f,u,g){if(g.source===u&&g.key==='Saffron Script'&&has(u,'A02'))g.value=.35*f.stats(u).M;},
 primary(f,u,n,c,kind){return c.u===u&&c.s.name==='Saffron Script'&&kind==='damage'&&has(u,'B02')?n*.8:n;},
 healed(f,u,source,t,n,label){if(source===u&&allies(u,t)&&n>0&&!['Garden in Ink','Petal Renewal'].includes(label))inscriptionRepair(f,u);},
 shielded(f,u,source,t,n,label){if(source===u&&allies(u,t)&&n>0&&label!=='Ward Rune')inscriptionRepair(f,u);},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Ward Rune'&&has(u,'C06')&&p.runePulse&&!p.runePulse.used){p.runePulse.used=true;cursedScript(f,u,a);}},
 cast(f,u,c){if(c.s.name==='Root Rune'){const e=ownedEntity(f,u,'assault-rune');if(has(u,'A08')&&e){heal(f,u,e,.5*e.maxHp,'Permanent Inscription');return true;}if(has(u,'C08')){c.deploy('assault-rune',{anchor:c.t});return true;}}},
 afterCast(f,u,c){
  if(c.u!==u)return;
  if(c.s.name==='Saffron Script'&&c.results[0]?.hit){if(has(u,'B02'))ward(f,u,f.lowest(u),.25*c.M,3,'Gentle Script');const targets=u.kit.badOmen?f.nearby(u,c.t,18,2,c.t):[c.t];u.kit.badOmen=false;for(const t of targets){if(has(u,'C01'))cursedScript(f,u,t);if(has(u,'C02'))buff(f,u,t,'Erased Footnotes','hit',-18,3,{harmful:true});}}
  u.kit.inscriptions||={};u.kit.inscriptions[c.s.cd]=true;if(Object.keys(u.kit.inscriptions).length<3||!f.ready(u,'inscriptionCD',6))return;u.kit.inscriptions={};
  for(const t of c.other){buff(f,u,t,'Inscription','empowerment',.12,4);if(has(u,'B03')){ward(f,u,t,.35*c.M,3,'Safe Letters');if(has(u,'B05'))buff(f,u,t,'Sheltered Casting','nextActiveDR',.15,3,{once:true});}}
  const e=ownedEntity(f,u,'assault-rune');if(e){if(has(u,'A05')&&!e.livingInk){e.livingInk=true;heal(f,u,e,.01*c.H,'Living Ink');}if(has(u,'A07')&&(e.replenished||0)<2){e.replenished=(e.replenished||0)+1;e.triggers=Math.max(0,e.triggers-1);}}if(has(u,'C07'))u.kit.badOmen=true;
 }
});
const enemyDots=(f,u)=>Object.values(u.effects).filter(e=>e.kind==='dot'&&e.until>f.battle.time&&f.battle.units.some(a=>a.id===e.source&&a.side!==u.side));
function sootBite(f,u,t){f.dot(u,t,'Soot Bite:'+u.id,.36*f.stats(u).A,3,'magic',{ownerRequired:true,label:'Soot Bite'});}
register('sootimp',{
 charproof(){return true;},
 support(f,u,s){if(s.name==='Vent the Coals'&&has(u,'B08'))return false;},
 gate(f,u,c){if(c.s.name==='Vent the Coals'&&has(u,'B08'))return alive(c.t);if(c.s.name==='Vent the Coals'&&has(u,'C08'))return c.wounded(.75)||c.all.some(t=>enemyDots(f,t).length);},
 outgoing(f,u,n,a,t,d){
  if(a===u&&!d.proc){if(d.category!=='magic'&&!has(u,'A08')&&(enemyDots(f,u).length||u.kit.cleanFury>f.battle.time||u.kit.noFuel>f.battle.time))n*=1.1;if(d.active&&d.primary&&u.kit.hotVent)n+=spend(u,'hotVent');}
  if(d.basic&&allies(u,t)&&t!==u){const e=f.get(a,'Warning Gnaw:'+u.id);if(e){f.remove(a,e.key);n*=.8;if(has(u,'C04'))f.after(()=>heal(f,u,t,.02*u.maxHp,'Warm Ash'));}}return n;
 },
 incoming(f,u,n,a,t,d){if(t===u&&d.dot&&a?.side!==u.side){const prevented=n*(has(u,'A01')?.4:.25);n-=prevented;u.kit.ashFiltered=(u.kit.ashFiltered||0)+prevented;if(has(u,'C07')&&!u.kit.filterGift&&u.kit.ashFiltered>=.03*u.maxHp){u.kit.filterGift=true;f.after(()=>ward(f,u,f.trainer(u),.04*u.maxHp,3,'Ash Filter'));}}return n;},
 effect(f,u,g){if(g.target===u&&g.kind==='dot'&&g.source.side!==u.side&&u.kit.cleanCoat){g.duration=Math.max(1,g.duration-2);u.kit.cleanCoat=false;}},
 damaged(f,u,a,t,n,s,d){if(t===u&&d.dot&&a?.side!==u.side&&n+s>0&&has(u,'A08')){u.kit.coalTicks=(u.kit.coalTicks||0)+1;if(u.kit.coalTicks%3===0&&f.ready(u,'nothingBurns',2))heal(f,u,u,.02*u.maxHp,'Nothing Burns Forever');}},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B07')&&u.kit.talentBasics%4===0)u.kit.noFuel=f.battle.time+3;},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Coalbelly Slam'&&has(u,'C03')){const tr=f.trainer(u);ward(f,u,tr,n*.5,3,'Coal Blanket');if(has(u,'C05'))buff(f,u,tr,'Safe Ember','dotDR',.25,3,{requiresPool:'Coal Blanket'});}},
 cast(f,u,c){
  if(c.s.name==='Cinder Gnaw'){c.hit(1.35*c.A+(has(u,'B04')&&f.has(c.t,'Soot Bite:'+u.id)?.3*c.A:0));if(c.results[0]?.hit){if(has(u,'A02')&&(enemyDots(f,u).length||u.kit.residualHeat>f.battle.time))heal(f,u,u,.02*c.H,'Ashen Gnaw');if(has(u,'B02'))sootBite(f,u,c.t);if(has(u,'C02'))buff(f,u,c.t,'Warning Gnaw:'+u.id,'warningGnaw',.2,3,{harmful:true});}return true;}
  if(c.s.name==='Vent the Coals'){
   const had=enemyDots(f,u).length,targets=has(u,'C08')?c.all:has(u,'C01')?[u,c.tr]:[u];let removed=0;
   for(const t of targets.filter(alive)){let count=0;for(let i=0;i<(t===u?(has(u,'A03')?2:1):1);i++)if(c.cleanse(t,'dot'))count++;if(t===u)removed=count;if(count&&has(u,'C06'))buff(f,u,t,'Fresh-Air Gift','hit',20,3);}
   if(had&&removed){if(has(u,'A04')&&!enemyDots(f,u).length)u.kit.residualHeat=f.battle.time+3;if(has(u,'B01'))u.kit.cleanFury=f.battle.time+4;}
   if(has(u,'B08')){c.hit((1.6+.3*Math.min(2,removed))*c.A);if(c.results[0]?.hit)sootBite(f,u,c.t);}else if(has(u,'C08'))c.teamheal(.04*c.H);else c.heal(u,.08*c.H);
   buff(f,u,u,'Vent the Coals','hit',15,3);if(has(u,'A03'))ward(f,u,u,.03*c.H,3,'Clear Vents');if(has(u,'A05'))buff(f,u,u,'Breathe Freely','nextActiveDR',.15,3,{once:true});if(has(u,'A07'))u.kit.cleanCoat=true;if(has(u,'B03'))u.kit.hotVent=(.4+(has(u,'B05')?.2*Math.min(2,removed):0))*c.A;return true;
  }
  if(c.s.name==='Coalbelly Slam'){const burning=Object.values(c.t.effects).some(e=>e.kind==='dot'&&/burn|ember|soot bite/i.test(e.key));c.hit(2.7*c.A);c.selfward((.06+(has(u,'A06')&&c.startHP<.5?.03:0))*c.H);if(burning&&has(u,'B06')&&c.results[0]?.hit)c.splash(.4*c.A,18,2,'magic');return true;}
 }
});
const solarLow=u=>has(u,'B01')?.35:.5,solarOutput=u=>!has(u,'A08')&&u.hp/u.maxHp>solarLow(u);
register('sunscarab',{
 solarBalance(){return true;},
 support(f,u,s){if(s.name==='Sunpress'&&has(u,'B08'))return true;if(s.name==='Dawnshell'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Sunpress'&&has(u,'B08'))return c.wounded(.95)||has(u,'A02')&&u.shield<.25*c.M;if(c.s.name==='Dawnshell'&&has(u,'C08'))return alive(c.t);},
 healAmount(f,u,n,source,t){if(source===u&&solarOutput(u))n*=1.15;if(t===u&&!solarOutput(u))n*=1.15;return n;},
 tick(f,u){if(u.hp/u.maxHp<.5)u.kit.dawnAgainArmed=true;if(has(u,'C07')&&!u.kit.afterglowUsed&&!solarOutput(u)){u.kit.afterglowUsed=true;u.kit.afterglow=.6*f.stats(u).M;}},
 healed(f,u,source,t,n,label,o){
  if(t===u&&has(u,'A07')&&n&&u.kit.dawnAgainArmed&&u.hp/u.maxHp>.6&&f.ready(u,'dawnAgain',5)){u.kit.dawnAgainArmed=false;ward(f,u,u,.4*f.stats(u).M,3,'Dawn Again');}
  if(source!==u)return;
  if(label==='Warm Shell'&&has(u,'A05'))ward(f,u,u,Math.min(.05*u.maxHp,o.offered-n),3,'Restored Shell');
  if(o.primary&&has(u,'B07')&&solarOutput(u)&&o.offered>n){const c=f.currentCompanionCast,cap=.4*f.stats(u).M,spent=c?.sunriseShield||0,amount=Math.min(cap-spent,.3*(o.offered-n));if(amount>0){const granted=ward(f,u,t,amount,3,'Stable Sunrise',{maximum:cap-spent});if(c)c.sunriseShield=spent+granted;}}
 },
 incoming(f,u,n,a,t,d){if(t===u&&d.active&&d.category==='magic'){const e=f.remove(u,'Safer Crescent');if(e)n*=.8;}return n;},
 shield(f,u,g){if(g.source===u&&g.target===u&&g.label==='Crescent Carapace'){if(has(u,'A01')&&u.hp/u.maxHp<=.5)g.amount+=.03*u.maxHp;if(has(u,'A08')){g.amount*=.75;g.duration=1e6;}}},
 absorbed(f,u,a,t,p,n){if(t===u&&p.source===u.id&&p.label==='Crescent Carapace'&&has(u,'C05'))u.kit.rayPower=Math.min(.7*f.stats(u).M,(u.kit.rayPower||0)+.2*n);},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(p.label==='Sunpress Shelter'&&has(u,'A04'))buff(f,u,a,'Weakened basic','basicWeakness',.2,3,{harmful:true});if(p.label==='Shared Crescent'&&has(u,'B05'))f.after(()=>heal(f,u,t,.3*f.stats(u).M,'Dawn Stitch'));},
 cast(f,u,c){
  if(c.s.name==='Sunpress'){
   const output=solarOutput(u),marked=f.get(c.t,'Solar Mark')?.source===u.id,bonus=spend(u,'chargedCrescent')+spend(u,'rayPower')+spend(u,'afterglow');
   if(!has(u,'B08')){c.hit((1.15*(has(u,'B02')?.8:1)+(output&&has(u,'C01')?.4:0))*c.M+bonus);if(c.results[0]?.hit){if(output&&marked&&has(u,'C04'))heal(f,u,u,.2*c.M,'Brightest Hour');if(has(u,'C02'))buff(f,u,c.t,'Solar Mark','magicExposure',.06,3,{harmful:true});}}
   const t=c.low,n=c.heal(t,(has(u,'B08')?.9:has(u,'B02')?.6:.3)*c.M);if(n>0&&t!==u&&has(u,'A02'))ward(f,u,u,.25*c.M,3,'Sunpress Shelter');if(has(u,'B04'))buff(f,u,t,'Golden Touch','healReceived',.12,3);if(has(u,'B08'))heal(f,u,f.lowest(u,c.all.filter(v=>v!==t)),.3*c.M,'Dawn Without a Blade');return true;
  }
  if(c.s.name==='Dawnshell'){
   if(has(u,'C08')){const r=c.hit(2.2*c.M);if(r.hit){c.splash(.6*c.M,18,2,'magic');heal(f,u,u,.2*r.damage,'Sun Turns Outward',c.M);}}
   else{c.teamheal(.9*c.M);const extra=(has(u,'A03')?.06:.04)*c.H;f.heal(u,u,extra,'Warm Shell',{primary:true,talent:true});if(has(u,'B06'))heal(f,u,c.tr,extra*.5,'Whole Dawnshell');if(has(u,'C06')&&alive(c.t)&&c.b.inRange(u,c.t))f.proc(u,c.t,.6*c.M,'magic','Dawnshell Flare');}return true;
  }
 },
 afterCast(f,u,c){if(c.u===u&&c.s.name==='Crescent Carapace'){if(has(u,'A06'))buff(f,u,u,'Safer Crescent','saferCrescent',.2,3);if(has(u,'B03'))ward(f,u,c.other.find(t=>t.slot>0),.5*c.M,3,'Shared Crescent');if(has(u,'C03'))u.kit.chargedCrescent=.5*c.M;}}
});
function marchingPulse(f,u){
 const {H,A}=f.stats(u),tr=f.trainer(u);if(!has(u,'C08'))ward(f,u,u,(has(u,'A08')?.015:.03)*H,2,'Marching Beat');
 const extra=has(u,'A07')&&tr?.hp<tr?.maxHp*.5&&f.ready(u,'heardHome',3)?.01:0;
 ward(f,u,tr,(.02+extra)*H,has(u,'A05')&&f.has(tr,'Protective Drumming')?3:2,'Marching Beat');
 if(has(u,'C01')||has(u,'C08'))u.kit.hammerBeat=((has(u,'C01')?.35:0)+(has(u,'C08')?.6:0))*A;
}
function marchingStep(f,u){if(has(u,'A08'))return;u.kit.marchCount=(u.kit.marchCount||0)+1;if(u.kit.marchCount>=(has(u,'A01')?2:3)&&(!has(u,'A01')||f.ready(u,'marchPulse',1))){u.kit.marchCount=0;marchingPulse(f,u);}}
register('thunderbeetle',{
 marchingBeat(){return true;},
 prepare(f,u){u.kit.nextMarch=f.battle.time+2;},
 tick(f,u){if(has(u,'A08')&&f.battle.time>=u.kit.nextMarch){u.kit.nextMarch+=2;marchingPulse(f,u);}const d=u.kit.drumming;if(d&&f.battle.time>=d.until){u.kit.drumming=null;if(has(u,'B07')&&f.others(u).every(t=>d.basics[t.id]))ward(f,u,f.trainer(u),.03*u.maxHp,3,'Final Measure');}},
 gate(f,u,c){if(c.s.name==='Battle Drumming')return c.all.some(t=>alive(c.b.target(t)));},
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Signal Bash')?.source===u.id?n+20:n;},
 outgoing(f,u,n,a,t,d){
  if(a===u&&d.basic){const amount=spend(u,'hammerBeat');if(amount){n+=amount;if(has(u,'C05')&&u.kit.drumming?.until>f.battle.time)f.after(()=>heal(f,u,u,.25*f.stats(u).A,'Driven Beat'));if(has(u,'C07'))f.after(()=>{const other=f.nearby(u,t,18,2,t).find(v=>v!==t);if(other)f.proc(u,other,amount*.5,'melee','Cymbal Burst');});}if(has(u,'C03')&&u.kit.drumming?.until>f.battle.time&&f.ready(u,'warSolo',1))n+=.15*f.stats(u).A;}
  if(a===f.trainer(u)&&d.active&&d.primary&&has(u,'B04')){const e=f.get(t,'Signal Bash');if(e?.source===u.id&&!e.called){e.called=true;f.after(()=>f.proc(u,t,.25*f.stats(u).A,'melee','Call Back'));}}return n;
 },
 landed(f,u,a,t,r,d){if(!d.basic||!allies(u,a))return;if(a===u)marchingStep(f,u);const drum=u.kit.drumming;if(drum?.until>f.battle.time&&a!==u&&!drum.basics[a.id]){drum.basics[a.id]=true;if(has(u,'B05'))marchingStep(f,u);}},
 cast(f,u,c){
  if(c.s.name==='Drumhead Bash'){const cracked=f.get(c.t,'Drumhead Crack')?.source===u.id;c.hit(1.4*c.A);if(c.results[0]?.hit){const p=pool(u,u,'Marching Beat');if(p&&has(u,'A02')){const n=mendShield(f,u,u,p,.02*c.H);if(n&&has(u,'A04'))heal(f,u,u,.01*c.H,'Steady Pulse');}if(has(u,'B02'))buff(f,u,c.t,'Signal Bash','signalBash',20,3,{harmful:true});if(cracked&&has(u,'C04'))marchingStep(f,u);if(has(u,'C02'))buff(f,u,c.t,'Drumhead Crack','physicalExposure',.06,3,{harmful:true});}return true;}
  if(c.s.name==='Battle Drumming'){const duration=has(u,'B03')?5:3;u.kit.drumming={until:f.battle.time+duration,basics:{}};for(const t of has(u,'B08')?c.other:c.all){buff(f,u,t,'Battle Drumming aim','hit',has(u,'B08')?25:15,duration);if(has(u,'B08'))buff(f,u,t,'Battle Drumming tempo','basicTempo',.15,duration);else{buff(f,u,t,'Battle Drumming power','physicalPower',.08,duration);if(has(u,'B01'))buff(f,u,t,'Battle Drumming magic','magicDamage',.08,duration);}if(has(u,'A03'))buff(f,u,t,'Protective Drumming','basicDR',.1,3);}return true;}
  if(c.s.name==='Thunder Drum'){const condition=has(u,'C08')?u.kit.hammerBeat>0:!!pool(u,u,'Marching Beat');c.hit((2.6+(has(u,'C06')&&condition?.5:0))*c.A);c.control(.5);if(has(u,'A06'))ward(f,u,c.tr,.04*c.H,3,'Thunder Shelter');if(has(u,'B06'))for(const t of c.other)charge(f,u,t,'Thundering Cue',.25*c.A);return true;}
 }
});
const sorrowLow=(u,t)=>t.hp/t.maxHp<(has(u,'A01')?.6:.5);
function sorrowMark(f,u,t,duration){buff(f,u,t,'Scent of Sorrow','healReceived',has(u,'C06')?-.25:-.1,duration??(has(u,'C06')?4:2),{harmful:true});}
register('volcanomoth',{
 scentSorrow(){return true;},
 support(f,u,s){if(s.name==='Elegy'&&has(u,'C08'))return true;},
 gate(f,u,c){if(c.s.name==='Elegy'&&has(u,'C08'))return c.wounded(.9)||c.wardGate();},
 beforeCast(f,u,c){if(c.u===u)c.sorrowLow=alive(c.t)&&sorrowLow(u,c.t);},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(sorrowLow(u,t)){if(!has(u,'B08')&&d.category==='magic')n*=has(u,'A08')?1.3:1.15;}else if(has(u,'A08'))n*=.85;return n;},
 incoming(f,u,n,a,t,d){return t===u&&a&&has(u,'B08')&&d.direct!==false&&!d.dot&&sorrowLow(u,a)?n*.8:n;},
 healAmount(f,u,n,source,t){return t===f.trainer(u)&&has(u,'C05')&&pool(t,u,'Borrowed Mantle')?n*1.15:n;},
 shield(f,u,g){if(g.source===u&&g.target===u&&g.label==='Gathered Gloom'&&has(u,'B01')){g.amount+=.4*f.stats(u).M;g.duration=4;}},
 shielded(f,u,source,t,n,label){if(source===u&&label==='Gathered Gloom'&&t===u&&has(u,'C03'))ward(f,u,f.trainer(u),n*.5,3,'Borrowed Mantle');},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Gathered Gloom'&&has(u,'B06'))f.after(()=>heal(f,u,u,.3*f.stats(u).M,'Gloom Aftercare'));},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.key==='Weakened active'&&has(u,'C04')&&allies(u,t))f.after(()=>heal(f,u,t,.25*f.stats(u).M,'Requiem Reply'));},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B08')&&sorrowLow(u,t)&&f.ready(u,'mourningArmor',1))ward(f,u,u,.12*f.stats(u).M,3,'Mourning Is Armor');},
 death(f,u,a,t,d){if(t.temporary||t.side===u.side)return;if(a===u&&d.active&&!d.proc&&has(u,'A07')&&f.ready(u,'verseRemains',3))ward(f,u,u,.4*f.stats(u).M,3,'A Verse Remains');if(has(u,'C07')&&f.get(t,'Scent of Sorrow')?.source===u.id&&f.ready(u,'rememberedCompany',4))for(const ally of f.others(u))ward(f,u,ally,.3*f.stats(u).M,3,'Remembered Company');},
 cast(f,u,c){
  if(c.s.name==='Mantle Thorn'){c.hit((1.35+(c.sorrowLow&&has(u,'A02')?.3:0))*c.M);if(c.results[0]?.hit){if(c.sorrowLow&&has(u,'A04'))buff(f,u,c.t,'Grieving Thorn','basicPenalty',.12,3,{harmful:true});if(pool(u,u,'Gathered Gloom')&&has(u,'B02')){heal(f,u,u,.25*c.M,'Mourning Stitch');if(has(u,'B04'))buff(f,u,u,'Veiled Thorn','basicDR',.15,2,{once:true});}if(has(u,'C02'))buff(f,u,c.t,'Weakened active','activeWeakness',.12,3,{harmful:true});}return true;}
  if(c.s.name==='Elegy'){const prime=f.remove(u,'Gathered Ending'),protect=has(u,'C01')||has(u,'C08')||c.hp(c.t)<.5||has(u,'B05')&&c.startHP<.5;
   if(has(u,'C08')){c.heal(c.low,1.2*c.M);if(alive(c.t)&&c.b.inRange(u,c.t))sorrowMark(f,u,c.t,4);}
   else c.hit(((2.7+(has(u,'A06')&&c.hp(c.t)<.35?.5:0))*c.M+(prime?.value||0))*(has(u,'C01')?.85:1));
   if(protect){c.shield(c.low,.6*c.M);if(has(u,'B03'))ward(f,u,u,.3*c.M,3,'Quiet Elegy');}return true;
  }
 },
 afterCast(f,u,c){if(c.u!==u)return;const r=c.results.find(r=>r.primary&&r.hit);if(r){if(!c.sorrowLow)sorrowMark(f,u,r.target);if(c.sorrowLow&&has(u,'B07'))heal(f,u,u,.1*r.damage,'Sorrow Shared',.4*c.M);}if(c.s.name==='Gathered Gloom'&&has(u,'A03'))buff(f,u,u,'Gathered Ending','gatheredEnding',.4*c.M,has(u,'A05')?1e6:3);}
});
function unbuffedBest(f,u){return [...f.others(u)].sort((a,b)=>{const score=t=>{const s=f.stats(t);return s.P/(1+f.value(t,s.category==='magic'?'magicPower':'physicalPower'));};return score(b)-score(a)||a.id.localeCompare(b.id);})[0]||u;}
register('whistleweasel',{
 capacity(f,u,n,owner,key){return owner===u&&key==='Beat'&&has(u,'A01')?4:n;},
 support(f,u,s){if(s.name==='Marching Whistle'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Marching Whistle'&&has(u,'C08'))return alive(c.t);},
 tick(f,u){const current=u.kit.originalTarget;if(current&&u.kit.rhythmTarget&&current!==u.kit.rhythmTarget&&has(u,'A07')){f.add(u,'Beat',1,3);buff(f,u,u,'Catch the Rhythm','hit',20,2);}u.kit.rhythmTarget=current;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic&&has(u,'A08'))n*=.8;if(d.active&&has(u,'C05')){const e=f.get(a,'Echo of Discord:'+u.id);if(e&&!e.returned){e.returned=true;f.add(u,'Beat',1,3);}}return n;},
 landed(f,u,a,t,r,d){
  if(!d.basic||!allies(u,a))return;
  if(a===u){if(has(u,'B07')&&u.kit.talentBasics%3===0)heal(f,u,u,.2*f.stats(u).M,'Rested Lungs');if(has(u,'C07')&&f.get(t,'Wrong Note')?.source===u.id){u.kit.wrongNotes=(u.kit.wrongNotes||0)+1;if(u.kit.wrongNotes%3===0)u.kit.brokenTempo=true;}}
  const march=f.get(a,'Marching Whistle');if(march?.source===u.id){if(has(u,'A05')&&(march.steps||0)<2){march.steps=(march.steps||0)+1;f.add(u,'Beat',1,3);}if(has(u,'C03')&&!march.discord){march.discord=true;buff(f,u,t,'Echo of Discord:'+u.id,'basicPenalty',.15,3,{harmful:true});}}
  const mark=f.get(t,'Signal Seed');if(a===f.trainer(u)&&mark?.source===u.id&&has(u,'A04')&&!mark.percussive){mark.percussive=true;f.proc(u,t,.25*f.stats(u).A,'melee','Percussive Seed');}
 },
 cast(f,u,c){
  if(c.s.name==='Signal Seed'){const beat=has(u,'C01')?c.take('Beat',1):0,hit=u.kit.brokenTempo?25:0;u.kit.brokenTempo=false;c.hit((1.1*(has(u,'B02')?.75:1)+.45*beat)*c.A,{hitBonus:hit});if(c.results[0]?.hit){buff(f,u,c.t,'Signal Seed','markedHit',20,has(u,'A02')?5:3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Wrong Note','hit',-20,3,{harmful:true});if(beat&&has(u,'C04'))buff(f,u,c.t,'Souring Seed','healReceived',-.25,3,{harmful:true});if(has(u,'B02')){const t=f.lowest(u);heal(f,u,t,.3*c.M,'Gentle Signal');if(has(u,'B04'))c.cleanse(t,'blind');}}return true;}
  if(c.s.name==='Marching Whistle'){const beats=c.take('Beat'),duration=(has(u,'C08')?4:3)+.3*beats;
   if(has(u,'C08')){const targets=f.nearby(u,c.t,18,2,c.t);for(const t of targets){const span=t===c.t?duration:duration*.5;buff(f,u,t,'Echo of Discord:'+u.id,'basicPenalty',.2,span,{harmful:true});buff(f,u,t,'Whistle Against the World','shieldReceived',-.25,span,{harmful:true});}if(has(u,'C03'))buff(f,u,c.t,'Weakened active','activeWeakness',.15,3,{harmful:true});}
   else for(const t of has(u,'A08')?c.other:[unbuffedBest(f,u)]){buff(f,u,t,'Marching Whistle','basicTempo',(has(u,'A03')?.18:.12)*(has(u,'A08')?.75:1),duration);if(beats>=2&&has(u,'B06'))heal(f,u,t,.4*c.M,'Healing March');}return true;
  }
  if(c.s.name==='Healing Refrain'){const beats=c.take('Beat'),t=c.low,mult=1+.1*beats;c.heal(t,1.6*c.M*mult*(has(u,'B08')?.6:1));c.shield(t,.04*c.H+(has(u,'B03')?.15*c.M*beats:0));if(has(u,'A06'))charge(f,u,t,'Refrain of Courage',.2*c.A*beats);if(has(u,'B01'))heal(f,u,u,.3*c.M,'Tender Refrain');if(has(u,'B05')&&beats)f.later(u,t,2,()=>heal(f,u,t,.15*c.M*beats,'Long Aftertone'));if(has(u,'B08'))for(let i=1;i<=3;i++)f.later(u,t,i,()=>heal(f,u,t,.3*c.M*mult,'Song Without a Break'));if(has(u,'C06')&&beats&&alive(c.t)&&c.b.inRange(u,c.t))f.proc(u,c.t,.15*c.A*beats,'melee','Piercing Refrain');return true;}
 }
});
function serratedThread(f,u,t){const M=f.stats(u).M;f.dot(u,t,'Serrated Thread:'+u.id,.45*M,3,'magic',{ownerRequired:true,label:'Serrated Thread',afterTick:r=>{if(has(u,'C07'))limited(f,u,'stolenMoonlight',.2*(r?.damage||0),.2*M,n=>ward(f,u,u,n,3,'Stolen Moonlight',{accumulate:true,maximum:n}));}});}
register('moonweaver',{
 lunarLoom(){return true;},
 gate(f,u,c){if(c.s.name==='Crescent Loom'&&has(u,'A08')){const e=ownedEntity(f,u,'silk-anchor');return e?e.hp<e.maxHp:alive(c.t)&&c.b.inRange(u,c.t);}},
 fits(f,u,c){if(c.s.name==='Crescent Loom'&&has(u,'A08')&&ownedEntity(f,u,'silk-anchor'))return true;},
 entityCreated(f,u,e){if(e.profile==='silk-anchor'){if(has(u,'A01'))e.hp=e.maxHp=Math.round(.12*u.maxHp);if(has(u,'A06'))e.spec.radius=30;if(has(u,'A08')){e.until=1e6;e.nextPersistent=e.born+5;}}},
 entityTick(f,u,e){if(e.profile==='silk-anchor'&&has(u,'A08')&&f.battle.time>=e.nextPersistent){e.nextPersistent+=1;root.BondCombatEntities.pulse(f,e,{persistent:true});}},
 entityPulse(f,u,e,options){if(e.profile!=='silk-anchor')return;const initial=e.pulseIndex===0,amount=options.persistent?.2:initial?1.2:has(u,'A01')?.35:.25,targets=f.nearby(u,e,e.spec.radius,3,f.battle.target(u));for(let i=0;i<targets.length;i++){const t=targets[i];f.proc(e,t,(amount*e.snapshot.M+(i===0?spend(e,'pinnedPattern'):0))*(has(u,'C08')?.5:1),'magic','Crescent Loom',{area:true});buff(f,u,t,'Thread','thread',.12,3,{harmful:true});if(initial&&has(u,'C06'))serratedThread(f,u,t);}if(initial&&has(u,'B06'))ward(f,u,f.lowest(u),.6*e.snapshot.M,3,'Protective Loom');return true;},
 silkAura(f,u,e){if(!has(u,'C08'))return false;for(const t of f.nearby(u,e,e.spec.radius,3).filter(t=>f.get(t,'Thread')?.source===u.id))buff(f,u,t,'Tangle the Spell','shieldReceived',-.3,.1,{harmful:true});return true;},
 effect(f,u,g){if(g.source===u&&g.key==='Thread'){if(has(u,'B01'))g.duration=5;if(has(u,'C02'))buff(f,u,g.target,'Tightened Knot','healReceived',-.2,g.duration,{harmful:true});}},
 incoming(f,u,n,a,t,d){if(allies(u,t)&&d.direct!==false&&!d.dot&&f.get(a,'Thread')?.source===u.id){if(t.shield>0)n*=1-(has(u,'B01')?.15:.12);else if(has(u,'B08'))n*=.92;}return n;},
 outgoing(f,u,n,a,t,d){if(a.side!==u.side&&d.active&&d.primary){const e=ownedEntity(f,u,'silk-anchor');if(e&&f.battle.distance(e,a)<=e.spec.radius){if(has(u,'A07')&&!e.lattice){e.lattice=true;n*=.85;}if(has(u,'C08')&&f.get(a,'Thread')?.source===u.id&&f.nearby(u,e,e.spec.radius,3).includes(a))n*=.8;}}return n;},
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(a,'Reassuring Stitch')?.source===u.id&&f.get(t,'Thread')?.source===u.id?n+20:n;},
 damaged(f,u,a,t,n,s,d){if(allies(u,t)&&d.active&&has(u,'B07')&&pool(t,u,'Silken Canopy')&&f.get(a,'Thread')?.source===u.id&&f.ready(u,'spunSafety',2))buff(f,u,a,'Thread','thread',.12,3,{harmful:true});},
 broken(f,u,a,t,p){if(p.source!==u.id||p.label!=='Silken Canopy')return;if(has(u,'B05'))f.after(()=>ward(f,u,t,.25*f.stats(u).M,3,'Second Layer'));if(has(u,'C03'))serratedThread(f,u,a);if(has(u,'C05'))buff(f,u,a,'Silk Fever','hit',-20,3,{harmful:true});},
 cast(f,u,c){
  if(c.s.name==='Moonthread Needle'){const e=ownedEntity(f,u,'silk-anchor'),inside=e&&f.battle.distance(e,c.t)<=e.spec.radius;c.hit((1.2+(inside&&has(u,'A02')?.25:0)+(has(u,'C04')&&f.has(c.t,'Serrated Thread:'+u.id)?.2:0))*c.M);if(c.results[0]?.hit){buff(f,u,c.t,'Thread','thread',.12,3,{harmful:true});if(inside&&has(u,'A04'))e.kit.pinnedPattern=.25*c.M;if(has(u,'B02')){const t=f.lowest(u);ward(f,u,t,.25*c.M,3,'Needle Stitch');if(has(u,'B04'))buff(f,u,t,'Reassuring Stitch','reassuringStitch',20,3);}if(has(u,'C01'))serratedThread(f,u,c.t);}return true;}
  if(c.s.name==='Crescent Loom'&&has(u,'A08')){const e=ownedEntity(f,u,'silk-anchor');if(e){heal(f,u,e,.5*e.maxHp,'Web That Remains');return true;}}
 },
 afterCast(f,u,c){if(c.u===u&&c.s.name==='Silken Canopy'){const t=c.primary.target;if(has(u,'B03'))heal(f,u,t,.35*c.M,'Mending Canopy');const e=ownedEntity(f,u,'silk-anchor');if(e&&has(u,'A03')&&heal(f,u,e,.02*c.H,'Silk Repair')&&has(u,'A05'))ward(f,u,u,.3*c.M,3,'Covered Spinner');}}
});
const patience=(f,u)=>has(u,'B08')?u.kit.shellCharges||0:Math.round((f.get(u,'Polished Patience')?.value||0)/.04);
function addPatience(f,u,n=1){const count=Math.min(has(u,'B08')||has(u,'A01')?4:3,patience(f,u)+n);if(has(u,'B08'))u.kit.shellCharges=count;else buff(f,u,u,'Polished Patience','crit',count*.04,75,{replace:true});}
function spendPatience(f,u){const n=patience(f,u);f.remove(u,'Polished Patience');u.kit.shellCharges=0;return n;}
register('pearlwyrm',{
 polishedPatience(){return true;},
 criticalRoll(f,u,d){const p=pool(u,u,'Polished Shell');if(d.basic&&has(u,'A05')&&p&&!p.focus){const critical=f.battle.random()<Math.min(1,u.critChance+f.value(u,'crit')+(d.critBonus||0));return {critical,hitBonus:critical?25:0};}},
 beforeCast(f,u,c){if(c.u===u){c.patience=patience(f,u);if(c.s.name==='String of Pearls'&&has(u,'A08')&&c.patience===(has(u,'A01')?4:3)){c.guaranteedPearl=true;spendPatience(f,u);}}},
 outgoing(f,u,n,a,t,d){
  if(a===f.trainer(u)&&d.basic){const e=f.remove(a,'Consolation Pearl');if(e)d.consolation=true;}
  if(a!==u||d.proc)return n;const c=f.currentCompanionCast,spent=d.critical||has(u,'B08')&&d.active?spendPatience(f,u):0;d.patienceSpent=spent||(c?.guaranteedPearl?c.patience:0);if(c?.u===u)c.patienceSpent=d.patienceSpent;
  if(d.critical&&d.basic&&has(u,'A05')){const p=pool(u,u,'Polished Shell');if(p)p.focus=true;}
  if(d.patienceSpent){if(has(u,'B08'))f.after(()=>ward(f,u,u,.02*u.maxHp*d.patienceSpent,3,'Pearls Before Blades'));if(has(u,'B06'))f.after(()=>heal(f,u,u,.01*u.maxHp*d.patienceSpent,'Pearl Memory'));}
  if(c?.s.name==='Pearl Prick'&&d.critical&&d.patienceSpent>=2&&has(u,'A04'))n+=.3*c.A;
  if(c?.s.name==='String of Pearls'&&d.critical&&has(u,'A06'))n+=.15*c.A*d.patienceSpent;return n;
 },
 incoming(f,u,n,a,t,d){const p=pool(u,u,'Polished Shell');if(t===u&&d.basic&&p&&has(u,'B07')&&!p.nacre){p.nacre=true;n*=.75;}return n;},
 shield(f,u,g){if(g.source===u&&g.target===u&&g.label==='Polished Shell'&&has(u,'B01')){g.amount+=.03*u.maxHp;g.duration=4;}},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Polished Shell'&&has(u,'C01')){const tr=f.trainer(u);ward(f,u,tr,n*.5,3,'Shared Luster');buff(f,u,tr,'Shared Luster aim','hit',10,3);}},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Polished Recovery'&&has(u,'B04'))ward(f,u,u,Math.min(.3*f.stats(u).A,o.offered-n),3,'Repaired Point');},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(p.label==='String of Pearls'&&has(u,'B05'))buff(f,u,t,'String Around the Heart','nextActiveDR',.15,3,{once:true});if(p.label==='Shared Luster'&&has(u,'C06'))f.after(()=>heal(f,u,t,.25*f.stats(u).A,'Healing Fracture'));},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&!r.critical)addPatience(f,u);if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Mark of Nacre');if(e?.source===u.id&&!e.tutored){e.tutored=true;addPatience(f,u);}}},
 effect(f,u,g){if(g.source===u&&g.key==='Polished Shell'&&has(u,'A03'))g.value=.15;},
 cast(f,u,c){if(c.s.name==='String of Pearls'){const r=c.hit(2.9*c.A*(has(u,'A08')||has(u,'C08')?.85:1),{critical:c.guaranteedPearl});const shield=(r.critical?.5:has(u,'B03')?.25:0)*c.A;if(shield||has(u,'C08')&&c.patienceSpent)c.shield(has(u,'C08')?c.tr:u,shield+(has(u,'C08')?.01*c.H*(c.patienceSpent||0):0),2);if(has(u,'C03')){const t=f.lowest(u,c.other);ward(f,u,t,(r.critical?.5:.25)*c.A,3,'Kind String');if(has(u,'C05'))charge(f,u,t,'Pearl of Courage',.25*c.A);}if(r.hit&&!r.critical&&has(u,'A07'))addPatience(f,u,2);return true;}},
 afterCast(f,u,c){if(c.u!==u)return;const r=c.results.find(r=>r.primary&&r.hit);if(!r)return;if(c.s.name==='Pearl Prick'){if(!r.critical&&has(u,'A02'))addPatience(f,u);if(r.critical&&has(u,'B02'))heal(f,u,u,.25*c.A,'Polished Recovery');if(has(u,'C02'))buff(f,u,c.t,'Mark of Nacre','hit',-20,3,{harmful:true});}if(!r.critical&&has(u,'C07'))buff(f,u,c.tr,'Consolation Pearl','crit',.05,75);}
});
function entrance(f,u){
 if(!f.ready(u,'entranceCD',has(u,'B08')?4:3))return;
 if(has(u,'A08'))buff(f,u,u,'Cut Before Seen','basicTempo',.2,3);else buff(f,u,has(u,'C08')?f.trainer(u):u,'Shroud','shroud',1,has(u,'B01')?4:2);
 if(has(u,'A01'))u.kit.sharpEntrance=(has(u,'A08')?1:.45)*f.stats(u).A;if(has(u,'C06'))ward(f,u,f.trainer(u),.3*f.stats(u).A,3,'Shared Entrance');
}
const ownShroud=(f,u)=>f.get(has(u,'C08')?f.trainer(u):u,'Shroud')?.source===u.id;
register('siltwyrm',{
 threadedEntrance(){return true;},
 start(f,u){entrance(f,u);u.kit.entranceTarget=u.kit.originalTarget;},
 tick(f,u){if(u.kit.originalTarget&&u.kit.entranceTarget!==u.kit.originalTarget){u.kit.entranceTarget=u.kit.originalTarget;entrance(f,u);}},
 outgoing(f,u,n,a,t,d){if(a===u){if(d.active&&d.primary)n+=spend(u,'sharpEntrance');if(d.basic&&f.has(u,'Silk counter')&&has(u,'A05')){const e=f.get(t,'Severed Stitch');if(e?.source===u.id)e.until+=2;}}return n;},
 primary(f,u,n,c,kind){if(c.u!==u||kind!=='damage')return n;if(c.s.name==='Silkbone Jab'&&ownShroud(f,u)&&has(u,'A02'))n+=.25*c.A;if(c.s.name==='Severed Stitch'&&has(u,'A06')&&c.hp(c.t)<.4)n+=.6*c.A;return n;},
 effect(f,u,g){if(g.source!==u)return;if(g.key==='Silk counter'&&has(u,'A03'))g.value=.65*f.stats(u).A;if(g.key==='Severed Stitch'&&has(u,'B06'))g.value=-30;},
 hitBonus(f,u,n,a,t){return allies(u,a)&&has(u,'C03')&&f.get(t,'Severed Stitch')?.source===u.id?n+20:n;},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.key==='Weakened active'&&has(u,'C04')&&allies(u,t))f.after(()=>ward(f,u,t,.25*f.stats(u).A,3,'Protective Warning'));},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Tight Hem'&&has(u,'B05'))f.after(()=>heal(f,u,u,.2*f.stats(u).A,'Mending Cloth'));},
 missed(f,u,a,t,d){if(d.shroudEvaded?.source===u.id&&has(u,'B07'))u.kit.reknotted=true;},
 effectExpired(f,u,t,e){if(e.key==='Shroud'&&e.source===u.id&&has(u,'C07'))buff(f,u,f.trainer(u),'Loose Gift','flee',20,2);},
 landed(f,u,a,t,r,d){
  if(a===u&&d.basic&&!t.temporary&&has(u,'A07')){if(u.kit.oldThreadTarget!==t.id){u.kit.oldThreadTarget=t.id;u.kit.oldThreadCount=0;}u.kit.oldThreadCount=(u.kit.oldThreadCount||0)+1;if(u.kit.oldThreadCount>=6&&alive(t)&&f.ready(u,'oldThread',8)){u.kit.oldThreadCount=0;entrance(f,u);}}
  if(a===f.trainer(u)&&has(u,'C05')){const e=f.get(t,'Severed Stitch');if(e?.source===u.id&&!e.confidence){e.confidence=true;f.proc(u,t,.25*f.stats(u).A,'melee','Threaded Confidence');}}
 },
 cast(f,u,c){if(c.s.name==='Loose Hem'&&has(u,'B08')){buff(f,u,u,'Loose Hem','flee',25,3);if(f.ready(u,'entranceCD',4))buff(f,u,u,'Shroud','shroud',1,has(u,'B01')?4:2);return true;}},
 afterCast(f,u,c){if(c.u!==u)return;if(c.s.name==='Silkbone Jab'&&c.results[0]?.hit){if(has(u,'A04')&&ownShroud(f,u))buff(f,u,c.t,'Marked Passage','physicalExposure',.06,3,{harmful:true});if(has(u,'B02')&&f.value(c.t,'hit')<0){heal(f,u,u,.25*c.A,'Stitched Jab');if(has(u,'B04'))buff(f,u,u,'Safe Needle','basicDR',.2,2,{once:true});}if(has(u,'C02'))buff(f,u,c.t,'Weakened active','activeWeakness',.12,3,{harmful:true});}if(c.s.name==='Loose Hem'){if(has(u,'B03'))ward(f,u,u,.35*c.A*(u.kit.reknotted?1.4:1),3,'Tight Hem');u.kit.reknotted=false;if(has(u,'C01'))buff(f,u,c.tr,'Borrowed Hem','flee',12.5,3);}if(c.s.name==='Severed Stitch'&&has(u,'B06'))ward(f,u,u,.4*c.A,3,'Protective Sever');}
});
register('briarcrab',{
 helpingHands(){return true;},
 capacity(f,u,n,owner,key){return owner===u&&key==='Sprout'&&has(u,'A01')?3:n;},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(d.active&&d.primary)n+=spend(u,'wildrootSting');if(d.basic&&f.has(u,'Grin Becomes a Bite')&&f.take(u,'Sprout',1)){n+=.35*f.stats(u).A;f.after(()=>heal(f,u,u,.01*u.maxHp,'Grin Becomes a Bite'));}return n;},
 healed(f,u,source,t,n,label,o){if(source!==u)return;if(label==='Medicinal Root'&&has(u,'B04'))ward(f,u,t,Math.min(.3*f.stats(u).M,.35*(o.offered-n)),3,'Gentle Soil');if(o.primary&&n>=.8*f.stats(u).M&&has(u,'B07')&&f.ready(u,'keptGrowing',3))f.after(()=>f.add(u,'Sprout',1,2));},
 incoming(f,u,n,a,t,d){if(t===u&&d.basic&&has(u,'A04')){const p=pool(u,u,'Rooted Guard');if(p&&!p.reassured){p.reassured=true;n*=.8;}}return n;},
 broken(f,u,a,t,p){if(p.source===u.id&&has(u,'C05')&&p.label==='Grinning Guard')f.proc(u,a,.4*f.stats(u).A,'melee','Thorned Guard');},
 cast(f,u,c){
  if(c.s.name==='Rootknuckle'){const spent=has(u,'C01')?c.take('Sprout',1):0,before=c.r('Sprout');c.hit((1.3*(has(u,'B01')?.75:1)+.45*spent)*c.A);if(c.results[0]?.hit){c.add('Sprout',1,2);if(c.r('Sprout')>before&&has(u,'A02'))ward(f,u,u,.02*c.H,3,'Rooted Guard');if(spent&&has(u,'C02')){buff(f,u,c.t,'Cracking Root','physicalExposure',.06,3,{harmful:true});if(has(u,'C04'))heal(f,u,u,.25*c.A,'Sap in the Cracks');}if(has(u,'B01'))f.heal(u,f.lowest(u),.35*c.M,'Medicinal Root',{primary:true,talent:true});}return true;}
  if(c.s.name==='Grinning Guard'){
   const sprouts=c.take('Sprout');if(has(u,'B02'))f.heal(u,c.tr,.4*c.M,'Soft Guard',{primary:true,talent:true});
   if(has(u,'C08')){buff(f,u,u,'Grin Becomes a Bite','basicTempo',.2,4);c.selfward(.4*c.A,4);}
   else{const n=c.shield(c.tr,(.7*c.A+.04*c.H)*(1+(has(u,'A08')?.25:.15)*sprouts));if(has(u,'A03'))ward(f,u,u,n*(has(u,'A08')?.75:.5),3,'Grinning Shelter');if(sprouts>=2&&has(u,'A05'))buff(f,u,c.tr,'Lopsided Shield','nextActiveDR',.15,3,{once:true});}
   if(has(u,'C03'))charge(f,u,u,'Fighting Grin',.2*c.A*sprouts);if(sprouts>=2&&has(u,'A07'))c.add('Sprout',1,2);return true;
  }
  if(c.s.name==='Wildroot Remedy'){
   const sprouts=c.take('Sprout'),t=c.low,mult=1+(has(u,'A08')?0:.15)*sprouts;c.heal(t,1.7*c.M*mult*(has(u,'B08')?.5:1));let removed=c.cleanse(t,'dot');if(has(u,'B03'))removed+=c.cleanse(t,'dot');if(has(u,'B05'))heal(f,u,t,.2*c.M*Math.min(2,removed),'Second Opinion');if(has(u,'A06'))ward(f,u,t,.02*c.H*sprouts,3,'Easy Remedy');if(has(u,'B06'))heal(f,u,f.lowest(u,c.all.filter(v=>v!==t&&v.hp<v.maxHp)),.2*c.M*sprouts,'Open Hands');if(has(u,'B08'))for(let i=1;i<=4;i++)f.later(u,t,i,()=>heal(f,u,t,.35*c.M*mult,'Remedy That Takes Root'));if(has(u,'C06'))u.kit.wildrootSting=.25*c.A*sprouts;return true;
  }
 },
 afterCast(f,u,c){if(c.u===u&&c.primary?.kind==='damage'&&has(u,'C07'))c.add('Sprout',1,2);}
});
const pocketPending=(f,u,t)=>t?.debt?.some(d=>d.kind==='air'&&d.amount>0)||f.get(t,'Pocket Rescue')?.source===u.id;
function repayAir(t,amount){for(const d of t.debt.filter(d=>d.kind==='air').sort((a,b)=>a.due-b.due)){const n=Math.min(d.amount,amount);d.amount-=n;amount-=n;if(amount<=0)break;}t.debt=t.debt.filter(d=>d.amount>0);}
register('cloudfin',{
 airPocket(){return true;},
 support(f,u,s){if(s.name==='Release the Air'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Release the Air'&&has(u,'C08'))return alive(c.t);},
 beforeHP(f,u,n,a,t,d){
  if(!allies(u,t)||a?.side===u.side||d.direct===false||d.dot||n<.1*t.maxHp||u.kit['air:'+t.id])return n;
  u.kit['air:'+t.id]=true;const amount=Math.min(n*.2,(has(u,'A01')?1.2:.8)*f.stats(u).M),delay=has(u,'A08')?3:1.5;
  if(has(u,'B08')){ward(f,u,t,amount,3,'Pocket Rescue');buff(f,u,t,'Pocket Rescue','pocketRescue',1,3);const r=f.absorb(t,n,a,d);n=r.remaining;d.extraAbsorbed=(d.extraAbsorbed||0)+r.absorbed;}
  else{const debt={id:++f.sequence,amount,kind:'air',source:u.id,due:f.battle.time+delay};t.debt.push(debt);n-=amount;f.battle.emit('debt',u,t,'Air Pocket',amount,{due:debt.due});f.later(a,t,delay,()=>{const current=t.debt.find(e=>e.id===debt.id);if(current){t.debt=t.debt.filter(e=>e!==current);f.loss(a,t,current.amount,'Air Pocket',{debt:true,direct:false});}},{label:'Air Pocket'});}
  if(has(u,'A07')){buff(f,u,u,'First Breath','firstBreath',.15*f.stats(u).M,75,{charges:2});buff(f,u,u,'First Breath tempo','basicTempo',.15,3);}if(has(u,'C06'))u.kit.compressedWarning=.5*f.stats(u).M;return n;
 },
 healed(f,u,source,t,n,label,o){if(source!==u||!o.primary||n<=0)return;if(has(u,'A08'))repayAir(t,n*.15);if(label==='Release the Air'&&has(u,'A05'))repayAir(t,n*.2);},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(d.basic){const breath=f.get(u,'First Breath');if(breath){n+=breath.value;if(--breath.charges<=0)f.remove(u,breath.key);}const pressure=spend(u,'squeezedAir');n+=pressure;if(pressure&&has(u,'C05'))f.after(()=>heal(f,u,u,.2*f.stats(u).M,'Pressure Refund'));}n+=spend(u,'compressedWarning');return n;},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(p.label==='Soft Sip'&&has(u,'B04'))f.after(()=>heal(f,u,t,.2*f.stats(u).M,'Bubble Welcome'));if(p.label==='Buoyant Choir'&&has(u,'C07')&&u.kit.choirReprisal!==p.cast){u.kit.choirReprisal=p.cast;f.proc(u,a,.2*f.stats(u).M,'magic','Cushion Reprisal');}},
 expired(f,u,t,p){if(p.source===u.id&&has(u,'B07')&&!p.absorbed&&u.kit.airExpiry!==p.cast){u.kit.airExpiry=p.cast;heal(f,u,t,.2*f.stats(u).M,'Air Kept Back');}},
 cast(f,u,c){
  if(c.s.name==='Bubble Sip'){const t=c.low,pending=pocketPending(f,u,t),n=c.heal(t,(.7+(pending&&has(u,'A02')?.3:0))*c.M);if(pending&&has(u,'A04'))ward(f,u,t,.25*c.M,3,'Sip Before the Fall');if(has(u,'B01'))ward(f,u,t,.25*c.M,3,'Soft Sip');if(has(u,'B02'))c.cleanse(t,'blind');if(n>0&&has(u,'C01')&&alive(c.t)&&c.b.inRange(u,c.t)){f.proc(u,c.t,.3*c.M+spend(u,'compressedWarning'),'magic','Pressurized Sip');if(has(u,'C04'))buff(f,u,c.t,'Thin Air','thinAir',.12,3,{harmful:true});}return true;}
  if(c.s.name==='Release the Air'){const t=f.lowest(u,c.all.filter(t=>pocketPending(f,u,t)))||c.low,pending=pocketPending(f,u,t);if(has(u,'C08')){c.hit((1.6+(pending?.6:0))*c.M);if(pending)c.heal(t,.6*c.M);}else{c.heal(t,(1.25+(pending||has(u,'B06')&&c.hp(t)<.4?has(u,'A03')?.7:.4:0))*c.M);if(has(u,'C02'))u.kit.squeezedAir=.4*c.M;}return true;}
  if(c.s.name==='Buoyant Choir'){for(const t of c.all){const pending=pocketPending(f,u,t);c.heal(t,(.85+(pending&&has(u,'A06')?.3:0))*c.M);c.shield(t,(has(u,'B03')?.65:.4)*c.M);if(has(u,'B05'))buff(f,u,t,'Floating Shelter','nextActiveDR',.15,3,{once:true});}if(has(u,'C03')&&alive(c.t)&&c.b.inRange(u,c.t))for(const t of f.nearby(u,c.t,18,3,c.t))buff(f,u,t,'Clouded Choir','hit',-20,3,{harmful:true});return true;}
 },
 incoming(f,u,n,a,t,d){return d.active&&d.primary&&f.get(a,'Thin Air')?.source===u.id?n*.88:n;}
});
function plateFlat(f,u){return (f.has(u,'Locked facets')?(has(u,'A03')?.4:.3):.2)*f.stats(u).A;}
function storeImpact(f,u,n){u.kit.storedImpact=Math.min(.8*f.stats(u).A,(u.kit.storedImpact||0)+n);}
register('crystalurchin',{
 hexagonalPlates(){return true;},
 incoming(f,u,n,a,t,d){
  if(d.direct===false||d.dot)return n;const physical=d.category!=='magic';
  if(t===f.trainer(u)&&has(u,'C08')&&f.get(t,'Bastion Without Transfer')?.source===u.id&&physical)n-=Math.min(n*(has(u,'A01')?.3:.2),plateFlat(f,u)*.5);
  if(t!==u||has(u,'B08')||!physical&&!has(u,'A08'))return n;
  let flat=plateFlat(f,u)*(physical?1:.6);const locked=f.get(u,'Locked facets');if(physical&&d.active&&locked&&has(u,'A05')&&!locked.symmetry){locked.symmetry=true;flat*=2;}
  const prevented=Math.min(n*(has(u,'A01')?.3:.2),flat);if(prevented>0){if(has(u,'B01'))storeImpact(f,u,prevented);if(physical&&has(u,'A07')){u.kit.plateHits=(u.kit.plateHits||0)+1;if(u.kit.plateHits%4===0&&f.ready(u,'patientPlates',2))f.after(()=>ward(f,u,u,.03*u.maxHp,3,'Patient Plates'));}}return n-prevented;
 },
 outgoing(f,u,n,a,t,d){
  if(a===u){if(has(u,'A08'))n*=.8;if(d.basic){const e=f.get(u,'Spines Out');if(e){n+=e.value+(e.charges===1&&has(u,'B05')?.3*f.stats(u).A:0);if(--e.charges<=0)f.remove(u,e.key);}if(has(u,'B06')&&f.has(u,'Urchin Bastion')&&f.ready(u,'bastionTeeth',1))n+=.2*f.stats(u).A;}}
  if(t===f.trainer(u)&&d.basic){const e=f.remove(a,'Warning Spine:'+u.id);if(e){n*=.75;if(has(u,'C04'))f.after(()=>ward(f,u,t,.02*u.maxHp,3,'Bitter Warning'));}}return n;
 },
 landed(f,u,a,t,r,d){if(a===u&&d.basic){if(has(u,'B08'))storeImpact(f,u,.3*f.stats(u).A);if(has(u,'B07')&&u.kit.talentBasics%3===0)storeImpact(f,u,.2*f.stats(u).A);}},
 effectExpired(f,u,t,e){if(t===u&&e.key==='Urchin Bastion'&&has(u,'C07')&&alive(f.trainer(u)))heal(f,u,u,.03*u.maxHp,'Return to Shape');},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Faceted Strike'&&has(u,'A04'))f.after(()=>heal(f,u,u,.01*u.maxHp,'Hex Stitch'));},
 cast(f,u,c){
  if(c.s.name==='Hexaspine'){const stored=spend(u,'storedImpact'),r=c.hit(1.2*c.A+stored*(has(u,'B08')?2:1));buff(f,u,u,'Hexaspine','hit',15,2);if(r.hit){if(has(u,'A02'))ward(f,u,u,.02*c.H,3,'Faceted Strike');if(stored&&has(u,'B02')){buff(f,u,c.t,'Deep Hexaspine','physicalExposure',.06,3,{harmful:true});if(has(u,'B04'))heal(f,u,u,.15*r.damage,'Salty Edge',.04*c.H);}if(has(u,'C02'))buff(f,u,c.t,'Warning Spine:'+u.id,'warningSpine',.25,3,{harmful:true});}return true;}
  if(c.s.name==='Urchin Bastion'){const duration=has(u,'C01')?4:3;if(has(u,'C08'))buff(f,u,c.tr,'Bastion Without Transfer','dr',.2,4);else c.guard(.25,duration,.45);buff(f,u,u,'Urchin Bastion','magicDR',.15,has(u,'A06')?4:3);if(has(u,'C06'))ward(f,u,u,.05*c.H,3,'Safeguarded Urchin');return true;}
 },
 afterCast(f,u,c){if(c.u===u&&c.s.name==='Lock the Facets'){if(has(u,'B03'))buff(f,u,u,'Spines Out','spinesOut',.2*c.A,75,{charges:3});if(has(u,'C03')){ward(f,u,c.tr,.04*c.H,3,'Shared Facets');if(has(u,'C05'))buff(f,u,c.tr,'Armored Bond','magicDR',.12,3,{requiresPool:'Shared Facets'});}}}
});
function waterWay(f,u,t){const other=f.lowest(u,f.core(u).filter(v=>v!==t));ward(f,u,other,(has(u,'A01')?.5:.35)*f.stats(u).M,has(u,'A01')?3:2,'Water Finds a Way');return other;}
function undertowHit(f,u,t,amount,label){if(!amount)return;const r=f.proc(u,t,amount,'magic',label,{magicBypassPoints:has(u,'C04')?.06:0});if(has(u,'C07'))ward(f,u,f.lowest(u),Math.min(.2*f.stats(u).M,.2*(r.damage||0)),3,'Flow Toward Safety');}
register('dewfin',{
 waterFindsWay(){return true;},
 support(f,u,s){if(s.name==='Return to Source'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Return to Source'&&has(u,'C08'))return alive(c.t);if(c.s.name==='Ring of Return'&&has(u,'B08'))return c.wardGate();},
 incoming(f,u,n,a,t,d){return t===u&&has(u,'B07')&&d.direct!==false&&!d.dot&&f.trainer(u)?.pools.some(p=>p.source===u.id&&p.amount>0)?n*.9:n;},
 absorbed(f,u,a,t,p,n){if(p.source===u.id&&allies(u,t)&&has(u,'C01'))u.kit.undertow=Math.min(.8*f.stats(u).M,(u.kit.undertow||0)+.2*n);},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){const amount=spend(u,'undertow');if(amount)f.after(()=>undertowHit(f,u,t,amount,'Undertow'));n+=spend(u,'sourcePressure');}return n;},
 landed(f,u,a,t){if(a===f.trainer(u)&&has(u,'C02')){const e=f.remove(t,'Pointed Droplet:'+u.id);if(e)f.proc(u,t,.2*f.stats(u).M,'magic','Pointed Droplet');}},
 damaged(f,u,a,t,n,s,d){if(d.direct===false||d.dot||a?.side===u.side)return;const e=f.remove(t,'Ringing Warning:'+u.id);if(e)buff(f,u,a,'Weakened active','activeWeakness',.12,3,{harmful:true,ringWarning:true});},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.ringWarning&&has(u,'C05'))buff(f,u,a,'Warning Ripples','hit',-20,3,{harmful:true});},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(p.label==='Water Finds a Way'&&has(u,'A07'))f.after(()=>heal(f,u,t,.2*f.stats(u).M,'Passing Droplets'));if(p.label==='Shared Source'&&has(u,'B05'))f.after(()=>heal(f,u,t,.35*f.stats(u).M,'Reserve Returned'));},
 cast(f,u,c){
  const t=c.low,M=c.M;if(c.s.name==='Return to Source'&&has(u,'C08')){const r=c.hit(1.9*M+spend(u,'undertow'));heal(f,u,t,.35*(r.damage||0),'Send the River Back',M);return true;}
  if(c.s.name==='Ring of Return'&&has(u,'B08')){const n=c.shield(t,1.6*M,5);if(n>0)waterWay(f,u,t);if(has(u,'B06'))buff(f,u,t,'Transparent Armor','nextActiveDR',.15,3,{once:true});if(has(u,'C03'))buff(f,u,t,'Ringing Warning:'+u.id,'ringWarning',1,5);return true;}
  const offered=(c.s.name==='Droplet Stitch'?.7+(has(u,'A02')&&c.hp(t)<.5?.25:0):c.s.name==='Ring of Return'?1.25:1.9)*M*(has(u,'A08')?.85:1),sourceRecipient=has(u,'B03')&&c.hp(c.tr)<c.hp()?c.tr:u,n=c.heal(t,offered),other=n>0?waterWay(f,u,t):null;
  if(n>0&&has(u,'A08'))for(const ally of c.all.filter(v=>v!==t))heal(f,u,ally,.2*n,'River Through the Party');
  if(c.s.name==='Droplet Stitch'){if(n===0&&has(u,'A04'))ward(f,u,u,.2*M,3,'Stitched Overflow');if(has(u,'B02')){ward(f,u,t,.25*M,3,'Stitch Guard');if(has(u,'B04'))buff(f,u,t,'Quiet Surface','basicDR',.15,2,{once:true});}if(has(u,'C02')&&alive(c.t)&&c.b.inRange(u,c.t))buff(f,u,c.t,'Pointed Droplet:'+u.id,'pointedDroplet',.2*M,3,{harmful:true});}
  if(c.s.name==='Ring of Return'){c.shield(t,(has(u,'B01')?.7:.35)*M);if(has(u,'A03')){let targets=c.all.filter(v=>v!==t&&v.hp<v.maxHp);if(has(u,'A05')&&targets.some(v=>v!==other))targets=targets.filter(v=>v!==other);heal(f,u,f.lowest(u,targets),.3*M,'Two Rings');}if(has(u,'B06'))buff(f,u,t,'Transparent Armor','nextActiveDR',.15,3,{once:true});if(has(u,'C03'))buff(f,u,t,'Ringing Warning:'+u.id,'ringWarning',1,3);}
  if(c.s.name==='Return to Source'){const actualOffer=c.receivers.find(r=>r.primary)?.offered??offered;ward(f,u,sourceRecipient,Math.min(.7*M,.5*Math.max(0,actualOffer-n)),3,'Shared Source');if(has(u,'A06'))heal(f,u,f.lowest(u,c.all.filter(v=>v!==t)),.25*n,'Gentle Source',.6*M);if(has(u,'C06'))u.kit.sourcePressure=.3*M;}return true;
 }
});
function stingingFilm(f,u,t,count=1){const M=f.stats(u).M,cap=has(u,'B08')?3:1;for(let i=0;i<count;i++){const keys=Array.from({length:cap},(_,i)=>'Stinging Film:'+u.id+':'+i),key=keys.find(k=>!f.has(t,k))||keys.sort((a,b)=>f.get(t,a).until-f.get(t,b).until||a.localeCompare(b))[0];f.dot(u,t,key,.45*M,3,'magic',{ownerRequired:true,label:'Stinging Film',extended:0,afterTick:r=>{if(has(u,'B07'))limited(f,u,'smallSip',.2*(r?.damage||0),.25*M,n=>heal(f,u,u,n,'Small Sip',n));}});}}
const poisoned=(f,u,t)=>Object.values(t.effects).some(e=>e.key.startsWith('Stinging Film:'+u.id+':')&&e.until>f.battle.time);
register('driftjelly',{
 effect(f,u,g){if(g.source===u&&g.key==='Numb'){if(has(u,'A01')){g.value=-.15;g.duration=4;}if(has(u,'A08')){g.kind='quietNerves';g.value=has(u,'A01')?.3:.25;}g.extra.extended=0;}},
 incoming(f,u,n,a,t,d){if(d.direct===false||d.dot)return n;const numb=f.get(a,'Numb');if(numb?.source===u.id&&has(u,'A08')){if(d.critical)n*=1-numb.value;else if(d.basic)n*=.88;}const p=pool(t,u,'Jelly Veil');if(p&&p.veilCharges>0){if(d.critical){p.veilCritical=true;p.veilCharges--;n*=.8;}else if(d.active&&!p.veilCritical&&has(u,'A05')){p.veilCharges--;n*=.85;}}return n;},
 outgoing(f,u,n,a,t,d){const e=f.get(a,'Numb');if(e?.source===u.id&&d.critical&&has(u,'A07')&&(e.extended||0)<2){e.until+=1;e.extended=(e.extended||0)+1;}return n;},
 missed(f,u,a,t,d){if(d.basic&&allies(u,t)&&f.get(a,'Numb')?.source===u.id&&has(u,'C07')&&f.ready(u,'quietCurrent',3))heal(f,u,t,.2*f.stats(u).M,'Quiet Current');},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B04'))for(const e of Object.values(t.effects).filter(e=>e.key.startsWith('Stinging Film:'+u.id+':')&&(e.extended||0)<2)){const n=Math.min(.5,2-(e.extended||0));e.extended=(e.extended||0)+n;f.extendDot(u,t,e.key,n);}},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Jelly Veil'&&has(u,'B05'))stingingFilm(f,u,a);},
 tick(f,u){if(has(u,'C04'))for(const t of f.core(u))if(pool(t,u,'Kind Ribbon'))buff(f,u,t,'Safe Drift','flee',15,.1);},
 cast(f,u,c){
  if(c.s.name==='Nettle Ribbon'){c.hit((1.25*(has(u,'C02')?.8:1))*c.M+spend(u,'chargedVeil'));if(c.results[0]?.hit){if(has(u,'A02'))buff(f,u,c.t,'Slack Ribbon','basicPenalty',.12,3,{harmful:true});if(has(u,'A04'))buff(f,u,c.t,'Weakened active','activeWeakness',.1,3,{harmful:true});if(has(u,'B01'))stingingFilm(f,u,c.t);if(has(u,'C02'))ward(f,u,f.lowest(u),.25*c.M,3,'Kind Ribbon');}return true;}
  if(c.s.name==='Jelly Veil'){const targets=has(u,'C08')?c.all:[c.low],amount=.95*c.M*(has(u,'C08')?1.3/targets.length:1);for(const t of targets){c.shield(t,amount);const p=pool(t,u,'Jelly Veil');if(p){p.veilCharges=has(u,'A03')?2:1;p.veilCritical=false;}}if(has(u,'C01'))heal(f,u,c.low,.35*c.M,'Healing Veil');if(has(u,'C06')&&!has(u,'C08')){const n=c.receivers.find(r=>r.kind==='shield')?.actual||0;ward(f,u,f.lowest(u,c.all.filter(t=>t!==c.low)),n*.35,3,'Floating Cover');}if(has(u,'B03'))u.kit.chargedVeil=.3*c.M;return true;}
  if(c.s.name==='Deep Sting'){const numb=f.has(c.t,'Numb');c.hit((2.7*(has(u,'B08')?.5:1)+(poisoned(f,u,c.t)&&has(u,'B02')?.45:0))*c.M);if(c.results[0]?.hit){if(has(u,'B08'))stingingFilm(f,u,c.t,2);else if(numb)buff(f,u,c.t,'Deep Sting','hit',has(u,'A06')?-30:-20,3,{harmful:true});if(numb&&has(u,'B06'))buff(f,u,c.t,'Under the Cap','magicExposure',.06,3,{harmful:true});if(numb&&has(u,'C03')){const t=f.lowest(u);heal(f,u,t,.4*c.M,'Gentler Sting');if(has(u,'C05'))buff(f,u,t,'Shared Numbness','basicDR',.15,2,{once:true});}}return true;}
 }
});
function cockEligible(f,u,d){return has(u,'C08')?d.basic:has(u,'A08')?d.active:d.basic||has(u,'A02')&&f.currentCompanionCast?.s.name==='Prism Snap';}
function consumeCock(f,u,t,d){const e=f.get(u,'Claw Cock');if(!e||!cockEligible(f,u,d))return 0;const amount=e.value;e.spent=(e.spent||0)+1;if(--e.charges<=0)f.remove(u,e.key);if(has(u,'A07'))f.after(()=>ward(f,u,u,.4*f.stats(u).A,3,'Claw Recoil'));if(e.spent===2&&has(u,'B05'))f.after(()=>heal(f,u,u,.25*f.stats(u).A,'Second Click'));if(d.basic&&has(u,'C07')&&f.ready(u,'restClaw',1))f.after(()=>heal(f,u,u,.02*u.maxHp,'Rest the Claw'));return amount;}
register('glassshrimp',{
 oversizedClaw(){return true;},
 basicInterval(f,u,n,a){if(a!==u)return n;return n/1.15*(has(u,'B08')?1-(has(u,'B01')?.25:.2):has(u,'B01')?1.05:1.15);},
 hitBonus(f,u,n,a,t,d){if(a===u&&d.basic&&has(u,'B04')&&f.has(u,'Follow-Up Snap'))n+=25;const e=f.get(a,'Shared Glass');if(allies(u,a)&&e?.source===u.id&&e.target===t.id)n+=20;return n;},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(d.basic){n*=has(u,'B08')?1:1.25;if(has(u,'A08'))n*=.8;const follow=f.remove(u,'Follow-Up Snap');if(follow)n+=follow.value;}const charge=consumeCock(f,u,t,d);n+=charge;if(charge&&f.currentCompanionCast?.s.name==='Prism Snap'){f.currentCompanionCast.crackingSnap=true;if(has(u,'A04'))d.shieldBonus=Math.max(.25,d.shieldBonus||0);}return n;},
 missed(f,u,a,t,d){if(a===u&&!has(u,'A06')&&cockEligible(f,u,d)){const e=f.get(u,'Claw Cock');if(e&&--e.charges<=0)f.remove(u,e.key);}},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B07')&&u.kit.talentBasics%4===0)refund(u,'Prism Snap',1);},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.key==='Weakened basic'&&has(u,'C04')&&alive(t))heal(f,u,u,.2*f.stats(u).A,'Recoil Recovery');},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Claw Shield'&&has(u,'C06'))f.proc(u,a,.3*f.stats(u).A,'melee','Carapace Echo');},
 cast(f,u,c){
  if(c.s.name==='Claw Cock'){buff(f,u,u,'Claw Cock aim','hit',20,3);const charges=has(u,'B03')&&!has(u,'A08')&&!has(u,'C08')?2:1;buff(f,u,u,'Claw Cock','cockCharge',has(u,'C08')?0:(.7+(has(u,'A01')?.4:0)+(has(u,'A08')?.8:0))*c.A/charges,has(u,'A06')?5:3,{charges});if(has(u,'C08')){c.selfward(.9*c.A);c.shield(c.tr,.9*c.A);}if(has(u,'C01'))ward(f,u,u,.5*c.A,3,'Claw Shield');return true;}
  if(c.s.name==='Glass-Cracking Report'){const reduced=f.value(c.t,'physicalExposure')>0;c.hit((3.1+(has(u,'A05')&&reduced?.4:0))*c.A,{hitBonus:has(u,'A03')?30:0});c.debuff('Armor exposure','physicalExposure',.05,3);if(has(u,'B06'))buff(f,u,u,'Repeating Report','basicTempo',.15,3);if(c.results[0]?.hit&&has(u,'C03')){ward(f,u,c.tr,.5*c.A,3,'Covering Report');if(has(u,'C05'))buff(f,u,c.tr,'Shared Glass','sharedGlass',20,3,{target:c.t.id});}return true;}
 },
 afterCast(f,u,c){if(c.u!==u||c.s.name!=='Prism Snap')return;if(has(u,'B02'))buff(f,u,u,'Follow-Up Snap','followSnap',.25*c.A,75);if(c.results[0]?.hit){if(c.crackingSnap&&has(u,'A02'))buff(f,u,c.t,'Cracking Snap','physicalExposure',.06,3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Weakened basic','basicWeakness',.25,3,{harmful:true});}},
});
const hauntCap=(f,u)=>(has(u,'A01')?1.5:.9)*f.stats(u).M;
register('kitejelly',{
 unpaidDebt(){return true;},
 hauntSwitch(f,u){u.kit.Haunt=has(u,'B07')?(u.kit.Haunt||0)*.5:0;u.kit.interestAt=f.battle.time+3;return true;},
 capacity(f,u,n,owner,key){return owner===u&&key==='Haunt'?hauntCap(f,u):n;},
 prepare(f,u){u.kit.interestAt=f.battle.time+3;},
 tick(f,u){if(has(u,'B01')&&f.battle.time>=u.kit.interestAt){u.kit.interestAt+=3;const t=f.battle.units.find(t=>t.id===u.kit.originalTarget);if(alive(t))f.add(u,'Haunt',.15*f.stats(u).M,hauntCap(f,u));}},
 support(f,u,s){if(s.name==='Debt Collector'&&has(u,'C08'))return true;},
 gate(f,u,c){if(c.s.name==='Debt Collector'&&has(u,'C08'))return c.wounded(.9)||c.wardGate();},
 healed(f,u,source,t,n){if(t.side!==u.side&&n>0){u.kit.healedEnemies||={};u.kit.healedEnemies[t.id]=f.battle.time;}},
 healAmount(f,u,n,source,t,o){const fold=f.get(t,'Funeral Fold');if(fold?.source===u.id&&n>0)fold.used=true;const tax=f.get(t,'Collect Before They Heal');if(tax?.source===u.id&&o.primary){f.remove(t,tax.key);const prevented=Math.max(0,Math.min(t.maxHp-t.hp,n)-Math.min(t.maxHp-t.hp,n*.6));f.add(u,'Haunt',prevented*.5,hauntCap(f,u));n*=.6;}return n;},
 shielded(f,u,source,t,n,label,p,o){if(n>0&&t.side!==u.side&&has(u,'A07')&&f.ready(u,'recordedGenerosity',2))f.add(u,'Haunt',n*.15,hauntCap(f,u));const e=f.get(source,'Gracious Fold');if(o.primary&&e?.source===u.id&&has(u,'C05')&&!e.mourned){e.mourned=true;ward(f,u,f.trainer(u),.35*f.stats(u).M,3,'Shared Mourning');}},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Mourning Cloth'&&has(u,'B05'))buff(f,u,u,'Stitch the Shroud','nextActiveDR',.15,3,{once:true});},
 effectExpired(f,u,t,e){if(e.source===u.id&&e.key==='Funeral Fold'&&!e.used&&has(u,'C07'))f.add(u,'Haunt',.1*f.stats(u).M,hauntCap(f,u));},
 landed(f,u,a,t){if(a===f.trainer(u)){const e=f.remove(t,'Public Needle:'+u.id);if(e){f.proc(u,t,.2*f.stats(u).M,'magic','Public Needle');if(has(u,'C04'))f.add(u,'Haunt',.1*f.stats(u).M,hauntCap(f,u));}}},
 cast(f,u,c){
  const collector=c.s.name==='Debt Collector',spent=c.take('Haunt',collector&&has(u,'B06')&&!has(u,'C08')?c.r('Haunt')*.5:Infinity),bonus=spent*(collector?(has(u,'A06')?1.5:1.25):1);
  if(collector&&has(u,'C08')){c.heal(c.low,1.2*c.M+spent);c.shield(c.low,.4*c.M);}
  else{c.hit((c.s.name==='Shroud Needle'?1.35:c.s.name==='Funeral Fold'?1.8:2.9)*c.M+(has(u,'B08')?0:bonus)+(spent&&c.s.name==='Shroud Needle'&&has(u,'A02')?.3*c.M:0));if(c.results[0]?.hit){if(spent&&has(u,'B08'))f.dot(u,c.t,'Compound Haunting:'+u.id,spent*1.2,4,'magic',{ownerRequired:true,label:'Compound Haunting'});if(collector&&has(u,'A08'))buff(f,u,c.t,'Collect Before They Heal','collectDebt',.4,3,{harmful:true});}}
  if(spent&&has(u,'C01'))heal(f,u,f.lowest(u),.3*spent,'Merciful Debt');if(collector&&spent>=.4*c.M&&has(u,'C06'))ward(f,u,c.tr,.4*c.M,3,'Debt for Safety');
  if(c.s.name==='Shroud Needle'){if(spent){if(has(u,'B02'))ward(f,u,u,.25*c.M,3,'Folded Safety');if(has(u,'B04'))heal(f,u,u,.2*c.M,'Needle Repayment');if(c.results[0]?.hit&&has(u,'A04'))buff(f,u,c.t,'Scarred Credit','magicExposure',.06,3,{harmful:true});}if(c.results[0]?.hit&&has(u,'C02'))buff(f,u,c.t,'Public Needle:'+u.id,'publicNeedle',.2*c.M,3,{harmful:true});}
  if(c.s.name==='Funeral Fold'){if(has(u,'B03'))ward(f,u,u,.4*c.M,3,'Mourning Cloth');if(c.results[0]?.hit){buff(f,u,c.t,'Funeral Fold','healReceived',has(u,'A03')?-.35:-.2,has(u,'A03')?2:3,{harmful:true});if(has(u,'A05')&&(u.kit.healedEnemies?.[c.t.id]??-Infinity)>=f.battle.time-2)ward(f,u,u,.3*c.M,3,'Payment Due');if(has(u,'C03'))buff(f,u,c.t,'Gracious Fold','shieldOutput',-.2,3,{harmful:true});}}return true;
 }
});
register('lotusmanta',{
 lotusShelter(){return true;},
 support(f,u,s){if(s.name==='Layered Petals'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Layered Petals'&&has(u,'C08'))return alive(c.t);},
 incoming(f,u,n,a,t,d){
  if(!allies(u,t)||!d.active||!d.secondary||a?.side===u.side)return n;const prevented=n*(has(u,'A01')?.3:.2),key=a.id+':'+a.casts;if(u.kit.lotusCast!==key){u.kit.lotusCast=key;u.kit.lotusPrevented=0;u.kit.lotusRemembered=false;}u.kit.lotusPrevented+=prevented;
  if(has(u,'A07')&&!u.kit.lotusRemembered&&u.kit.lotusPrevented>=.5*f.stats(u).M&&f.ready(u,'petalsRemember',3)){u.kit.lotusRemembered=true;f.after(()=>heal(f,u,u,.3*f.stats(u).M,'Petals Remember'));}if(has(u,'C07')&&f.ready(u,'lotusReprieve',2))u.kit.lotusPrimer=.2*f.stats(u).M;return n-prevented;
 },
 damaged(f,u,a,t,n,s,d){if(has(u,'A05')&&d.active&&d.secondary){const p=pool(t,u,'Layered Petals');if(p&&!p.ripple){p.ripple=true;heal(f,u,t,.25*f.stats(u).M,'Ripple Shelter');}}},
 broken(f,u,a,t,p){if(p.source!==u.id||p.label!=='Layered Petals')return;if(has(u,'B05'))f.after(()=>heal(f,u,t,.3*f.stats(u).M,'After the Shield'));if(has(u,'C03')){f.proc(u,a,.3*f.stats(u).M,'magic','Returning Petals');if(has(u,'C05'))buff(f,u,a,'Woven Edge','magicExposure',.05,3,{harmful:true});}},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Petal Sip'&&o.primary&&o.offered>n&&has(u,'B04'))buff(f,u,t,'Sip in Reserve','healReceived',.15,3);},
 cast(f,u,c){
  if(c.s.name==='Petal Sip'){const t=c.low,n=c.heal(t,(has(u,'B01')?.9:.65)*c.M);heal(f,u,u,.2*c.M,'Petal Sip comfort');if(n&&has(u,'B02'))c.cleanse(t,'blind');if(has(u,'A02'))ward(f,u,t,.25*c.M,3,'Protective Sip');if(has(u,'A04'))buff(f,u,t,'Settled Lotus','dotDR',.2,3);if(n&&has(u,'C01')&&alive(c.t)&&c.b.inRange(u,c.t)){const marked=f.get(c.t,'Saltwater Mark')?.source===u.id;f.proc(u,c.t,(.35+(marked&&has(u,'C04')?.2:0))*c.M+spend(u,'lotusPrimer'),'magic','Sharp Sip');if(has(u,'C02'))buff(f,u,c.t,'Saltwater Mark','healReceived',-.2,3,{harmful:true});}return true;}
  if(c.s.name==='Layered Petals'){
   if(has(u,'C08')){c.hit(1.5*c.M);c.splash(.5*c.M,18,2,'magic');for(const t of f.nearby(u,c.t,18,3,c.t))buff(f,u,t,'Saltwater Mark','healReceived',-.2,3,{harmful:true});if(has(u,'C03'))for(const t of c.other)f.proc(u,c.t,.3*c.M,'magic','Returning Petals');}
   else if(has(u,'A08')){c.sharedShield(c.all,(.75+(has(u,'A03')?.3:0))*c.M*c.other.length,4,{splashCost:.7});if(has(u,'B03'))for(const t of c.all)heal(f,u,t,.25*c.M,'Healing Petals');}
   else for(const t of c.other){c.shield(t,(.75+(has(u,'A03')?.3:0))*c.M);if(has(u,'B03'))heal(f,u,t,.25*c.M,'Healing Petals');}return true;
  }
  if(c.s.name==='Serene Tide'){for(const t of c.all){c.heal(t,.85*c.M*(has(u,'B08')?.5:1));let removed=c.cleanse(t,'dot');if(has(u,'B06'))removed+=c.cleanse(t,'dot');if(has(u,'B07'))heal(f,u,t,.15*c.M*Math.min(2,removed),'Resettling Water');if(has(u,'A06'))ward(f,u,t,.25*c.M,3,'Tide Before the Wave');}if(has(u,'B08'))for(let i=1;i<=3;i++)f.later(u,null,i,()=>{for(const t of f.core(u))heal(f,u,t,.25*c.M,'Quiet Sea');});if(has(u,'C06')&&alive(c.t)&&c.b.inRange(u,c.t))for(const t of f.nearby(u,c.t,18,3,c.t))f.proc(u,t,(t===c.t?.4:.2)*c.M,'magic','Tide of Needles',{area:true,secondary:t!==c.t});return true;}
 }
});
const hollowClosed=(f,u)=>!!pool(u,u,'Close the Hollow')||has(u,'B08')&&f.has(u,'Become the Hammer');
register('mistseal',{
 hollowBody(){return true;},
 incoming(f,u,n,a,t,d){
  if(d.direct===false||d.dot)return n;const closed=hollowClosed(f,u);
  if(t===f.trainer(u)&&has(u,'C01')&&closed&&d.category!=='magic')n*=.9;
  if(t===u){if(d.category==='magic'){if(!has(u,'A08')&&!closed)n*=1.1;if(has(u,'A08')&&pool(u,u,'Close the Hollow'))n*=.8;const p=pool(u,u,'Close the Hollow');if(p&&has(u,'A05')&&d.active&&d.primary&&!p.noCracks){p.noCracks=true;n*=.8;}}else{n*=1-(has(u,'A08')?.08:has(u,'A01')?.18:.12);u.kit.hollowPreventedAt=f.battle.time;}}
  if(d.active&&d.category==='magic'){const e=f.remove(t,'Safe Vapor:'+u.id);if(e)n*=.85;}return n;
 },
 outgoing(f,u,n,a,t,d){return d.active&&d.primary&&has(u,'C06')&&f.get(a,'Condensed Blow')?.source===u.id?n*.925:n;},
 absorbed(f,u,a,t,p,n){if(t===u&&p.source===u.id&&p.label==='Close the Hollow'&&has(u,'B05'))u.kit.hollowPressure=Math.min(.7*f.stats(u).A,(u.kit.hollowPressure||0)+n*.2);},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Close the Hollow'&&has(u,'A07'))buff(f,u,u,'Mist After Rain','healReceived',.15,3);},
 missed(f,u,a,t,d){if(d.basic&&allies(u,t)&&has(u,'C04')){const e=f.get(a,'Obscuring Fist');if(e?.source===u.id&&!e.reprieve){e.reprieve=true;ward(f,u,t,.02*u.maxHp,3,'Fog Reprieve');}}},
 cast(f,u,c){
  if(c.s.name==='Mistfist'){const closed=hollowClosed(f,u),hard=c.startHP>.5,marked=f.get(c.t,'Dense Fist')?.source===u.id;c.hit((1.35+(hard&&has(u,'B01')?.35:0))*c.A);if(c.results[0]?.hit){if(closed&&has(u,'A02')){heal(f,u,u,.02*c.H,'Mending Mist');if(has(u,'A04'))buff(f,u,c.t,'Weakened basic','basicWeakness',.15,3,{harmful:true});}if(hard&&marked&&has(u,'B04'))charge(f,u,u,'Heavy Droplets',.25*c.A);if(has(u,'B02')&&(u.kit.hollowPreventedAt??-Infinity)>=f.battle.time-2)buff(f,u,c.t,'Dense Fist','physicalExposure',.06,3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Obscuring Fist','hit',-20,3,{harmful:true});}return true;}
  if(c.s.name==='Close the Hollow'){if(has(u,'B08')){buff(f,u,u,'Become the Hammer','physicalPower',.25,4);if(has(u,'B05'))u.kit.hollowPressure=.5*c.A;}else c.selfward((.1+(has(u,'A03')?.04:0))*c.H,has(u,'A03')?4:3);if(has(u,'B03'))u.kit.pressurizedHollow=.6*c.A;if(has(u,'C03')){const t=f.lowest(u,c.other);ward(f,u,t,.03*c.H,3,'Misty Ally');if(has(u,'C05'))buff(f,u,t,'Safe Vapor:'+u.id,'safeVapor',.15,3);}if(has(u,'C07')&&c.hp(c.tr)<.5)heal(f,u,c.tr,.02*c.H,'Window of Kindness');return true;}
  if(c.s.name==='Condensed Blow'){const pressure=spend(u,'hollowPressure'),r=c.hit(((2.7+(has(u,'B06')&&hollowClosed(f,u)?.4:0))*c.A+spend(u,'pressurizedHollow')+pressure)*(has(u,'C08')?.5:1));if(r.hit){for(const t of has(u,'C08')?f.nearby(u,c.t,18,3,c.t):[c.t])buff(f,u,t,'Condensed Blow','basicDamage',-.15,3,{harmful:true});if(alive(c.t)&&has(u,'A06'))ward(f,u,u,.04*c.H,3,'Condensed Shelter');if(pressure&&has(u,'B07'))heal(f,u,u,.3*c.A,'Mist Reformed');}if(has(u,'C08'))for(const t of c.other)buff(f,u,t,'Fog Around the Front','flee',25,3);return true;}
 }
});
function protectiveGrip(f,u,t,duration){buff(f,u,t,'Grip','protectiveGrip',.12,duration,{harmful:true});}
function archWeight(f,u,t,duration=3){buff(f,u,t,'Weight of the Arch','basicPenalty',.12,duration,{harmful:true});if(has(u,'C04'))buff(f,u,t,'Slow to Mend','healReceived',-.25,duration,{harmful:true});}
register('runecrab',{
 protectiveGrip(){return true;},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(has(u,'B08')&&d.primary&&d.category!=='magic'&&f.get(t,'Grip')?.source===u.id)n*=1.15;if(d.active&&f.currentCompanionCast?.s.name==='Arch-Arm Clamp')d.clamp=true;if(d.basic){const e=f.get(u,'Hammer Hands');if(e){n+=e.value;if(--e.charges<=0){f.remove(u,e.key);if(has(u,'B05'))f.after(()=>heal(f,u,u,.25*f.stats(u).A,'Hands Refit'));}}}return n;},
 incoming(f,u,n,a,t,d){if(d.direct===false||d.dot||has(u,'B08')||f.get(a,'Grip')?.source!==u.id)return n;if(t===f.trainer(u)||has(u,'C01')&&allies(u,t)&&t!==u)n*=.88;else if(t===u&&has(u,'A08'))n*=.94;return n;},
 hitBonus(f,u,n,a,t){return allies(u,a)&&has(u,'C07')&&f.get(t,'Grip')?.source===u.id&&f.get(t,'Weight of the Arch')?.source===u.id?n+20:n;},
 damaged(f,u,a,t,n,s,d){if(d.active&&d.primary&&has(u,'A07')&&f.get(a,'Grip')?.source===u.id&&f.ready(u,'unyieldingPalm',3))ward(f,u,f.trainer(u),.02*u.maxHp,3,'Unyielding Palm');},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.key==='Weakened active'&&has(u,'C05'))buff(f,u,a,'Shake the Arms','hit',-20,3,{harmful:true});},
 landed(f,u,a,t,r,d){if(a!==u)return;protectiveGrip(f,u,t,d.clamp?(has(u,'A01')?4:3):has(u,'A01')?2.5:1.5);if(d.basic){const taunt=f.get(t,'Taunt');if(taunt?.source===u.id&&has(u,'A05')&&!taunt.breathed){taunt.breathed=true;heal(f,u,u,.02*u.maxHp,'Grip and Breathe');}if(has(u,'B07')&&u.kit.talentBasics%4===0){const e=f.get(t,'Grip');if(e)e.until+=2;u.kit.stoneMomentum=true;}}},
 cast(f,u,c){
  if(c.s.name==='Arch-Arm Clamp'){const gripped=f.get(c.t,'Grip')?.source===u.id;if(has(u,'C08')){for(const t of f.nearby(u,c.t,18,3,c.t)){protectiveGrip(f,u,t,4);if(has(u,'C02'))archWeight(f,u,t,4);}return true;}
   c.hit((1.15+(gripped&&has(u,'B04')?.3:0))*c.A);if(c.results[0]?.hit){if(has(u,'A02'))ward(f,u,u,.03*c.H,3,'Padded Arch');if(gripped&&has(u,'A04'))ward(f,u,c.tr,.02*c.H,3,'Stone Cradle');if(has(u,'B02'))buff(f,u,c.t,'Grinding Arch','physicalExposure',.06,3,{harmful:true});if(has(u,'C02'))archWeight(f,u,c.t);}return true;
  }
  if(c.s.name==='Two-Handed Hold'){c.hit(1.5*c.A);const value=has(u,'A03')?.2:.1;c.dr(value,has(u,'A03')?3:2);if(has(u,'A08'))buff(f,u,c.tr,'Grip Is a Shelter','dr',value,2);else if(c.results[0]?.hit)c.taunt(false);if(has(u,'B03'))buff(f,u,u,'Hammer Hands','hammerHands',.25*c.A,75,{charges:2});if(has(u,'C03')&&c.results[0]?.hit)buff(f,u,c.t,'Weakened active','activeWeakness',.15,3,{harmful:true});return true;}
  if(c.s.name==='Shale Press'){const gripped=f.get(c.t,'Grip')?.source===u.id,hit=u.kit.stoneMomentum?25:0;u.kit.stoneMomentum=false;const r=c.hit(2.4*c.A+Math.min((has(u,'B01')?.04:.02)*c.H,(has(u,'B01')?1.2:.8)*c.A),{hitBonus:hit});if(r.hit){if(gripped&&has(u,'A06'))ward(f,u,u,.04*c.H,3,'Measured Press');if(has(u,'B06'))c.splash(.4*c.A,18,2);if(has(u,'B08'))heal(f,u,u,.2*r.damage,'No Protective Grip',.04*c.H);if(has(u,'C06'))buff(f,u,c.t,'Shale Lock','shieldReceived',-.3,4,{harmful:true});}return true;}
 }
});
register('tideotter',{
 pocketDroplets(){return true;},
 capacity(f,u,n,owner,key){return owner===u&&key==='Droplet'&&has(u,'A01')?3:n;},
 support(f,u,s){if(s.name==='Restorative Current'&&has(u,'A08'))return false;},
 gate(f,u,c){if(c.s.name==='Restorative Current'&&has(u,'A08'))return alive(c.t);},
 hitBonus(f,u,n,a,t,d){return a===u&&d.basic&&f.has(u,'Paddle Rhythm')?n+25:n;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic)f.remove(u,'Paddle Rhythm');return n;},
 incoming(f,u,n,a,t,d){if(d.basic){const e=f.get(t,'Bubble guards:'+u.id);if(e){n*=.8;if(--e.charges<=0)f.remove(t,e.key);}}return n;},
 healed(f,u,source,t,n){if(t===u&&source!==u&&allies(u,source)&&n>=.02*u.maxHp&&has(u,'B07')&&f.ready(u,'dropletExchange',3))f.add(u,'Droplet',1,2);},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Tailbreak Guard'&&has(u,'C03')){buff(f,u,a,'Weakened active','activeWeakness',.15,3,{harmful:true});if(has(u,'C05'))f.proc(u,a,.25*f.stats(u).A,'melee','Paddle Warning');}},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'A05')&&pool(u,u,'Splash Guard')&&f.ready(u,'friendlyWake',1))ward(f,u,f.trainer(u),.01*u.maxHp,3,'Friendly Wake');if(a===f.trainer(u)&&d.basic&&has(u,'C07')){const e=f.get(t,'Slippery Paddle');if(e?.source===u.id&&!e.pocket){e.pocket=true;f.add(u,'Droplet',1,2);}}},
 cast(f,u,c){
  if(c.s.name==='Paddle Combination'){const droplets=has(u,'B02')?0:c.take('Droplet');c.droplets= droplets;c.hit((1.35*(has(u,'B01')?.75:1)+(has(u,'A02')?.35:.2)*droplets)*c.A);if(droplets>=2&&has(u,'A04'))buff(f,u,u,'Paddle Rhythm','paddleRhythm',25,75);if(c.results[0]?.hit){if(has(u,'B01')){const t=f.lowest(u);heal(f,u,t,.3*c.M,'Gentle Paddle');if(has(u,'B04'))buff(f,u,t,'Soft Current','flee',15,2);}if(has(u,'C01')){buff(f,u,c.t,'Slippery Paddle','hit',-20,3,{harmful:true});if(has(u,'C04'))buff(f,u,c.t,'Wet Footing','basicPenalty',.12,3,{harmful:true});}}return true;}
  if(c.s.name==='Tailbreak Guard'){const droplets=has(u,'C08')?c.take('Droplet'):0;if(has(u,'B06'))heal(f,u,c.tr,.35*c.M,'Tender Tail');const n=c.shield(c.tr,.8*c.A+.03*c.H);if(has(u,'A03'))ward(f,u,u,n*.5,3,'Splash Guard');if(droplets)buff(f,u,c.tr,'Bubble guards:'+u.id,'bubbleGuards',.2,4,{charges:Math.min(3,droplets)});return true;}
  if(c.s.name==='Restorative Current'){const droplets=c.take('Droplet');c.droplets=droplets;
   if(has(u,'A08')){c.hit((1.7+.5*droplets)*c.A);c.cleanse(u,'dot');heal(f,u,u,.02*c.H*droplets,'Whole River in a Fist');}
   else{if(has(u,'B08'))for(const t of c.all)c.heal(t,1.6*c.M*1.3/c.all.length+(t===c.low?(has(u,'B03')?.5:.3)*c.M*droplets:0));else c.heal(c.low,(1.6+(has(u,'B03')?.5:.3)*droplets)*c.M);c.cleanse(c.low,'dot');if(droplets>=2&&has(u,'B05'))c.cleanse(c.low,'dot');}
   const t=has(u,'A08')?u:c.low;if(droplets&&has(u,'A06'))buff(f,u,t,'Restorative Tempo','basicTempo',.12,3);if(has(u,'C06'))charge(f,u,t,'Clean Encouragement',.15*c.A*droplets);return true;
  }
 },
 afterCast(f,u,c){if(c.u===u&&c.primary?.kind==='damage'&&c.droplets){if(has(u,'C02'))buff(f,u,c.tr,'Borrowed Splash','hit',20,3);if(has(u,'A07')&&c.droplets===(has(u,'A01')?3:2))c.add('Droplet',1,2);}}
});
function mercyThread(f,u,n=1){const before=u.kit.Thread||0;f.add(u,'Thread',n,2);if(u.kit.Thread>before&&has(u,'C06'))u.kit.charitableFraying=.2*f.stats(u).M;}
register('veilray',{
 frayedMercy(){return true;},
 start(f,u){if(has(u,'A01'))mercyThread(f,u);},
 capacity(f,u,n,owner,key){return owner===u&&key==='Thread'&&has(u,'A01')?3:n;},
 shield(f,u,g){if(g.source===u&&g.target!==u&&g.options.primary&&u.kit.charitableFraying)g.amount+=spend(u,'charitableFraying');},
 healed(f,u,source,t,n,label,o){if(source===u&&o.primary&&n>=.8*f.stats(u).M&&has(u,'B07')&&f.ready(u,'threadKindness',3))f.after(()=>mercyThread(f,u));},
 broken(f,u,a,t,p){
  if((allies(u,t)||has(u,'A07')&&a===u&&t.side!==u.side)&&f.ready(u,'threadCD',2))mercyThread(f,u);
  if(p.source===u.id&&p.label==='Gentle Shroud'){if(has(u,'A05'))u.kit.shroudDebt=.35*f.stats(u).M;if(has(u,'B05'))f.after(()=>heal(f,u,t,.35*f.stats(u).M,'Comfort in Fraying'));}
 },
 expired(f,u,t,p){if(p.source===u.id&&p.label==='Gentle Shroud'&&!p.absorbed&&has(u,'C07'))buff(f,u,t,'Woven Patience','basicTempo',.12,3);},
 defenseConsumed(f,u,t,e){if(e.source===u.id&&e.key==='Protected Mercy'&&has(u,'C05'))buff(f,u,t,'Mercy Answer:'+u.id,'mercyAnswer',.25*f.stats(u).M,75);},
 outgoing(f,u,n,a,t,d){if(d.basic){const e=f.remove(a,'Mercy Answer:'+u.id);if(e)f.after(()=>f.proc(u,t,e.value,'magic',"Mercy's Answer"));}return n;},
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Guiding Needle')?.source===u.id?n+20:n;},
 landed(f,u,a,t){if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Guiding Needle');if(e?.source===u.id&&!e.returned){e.returned=true;ward(f,u,u,.25*f.stats(u).M,3,'Needle Returned');}}},
 cast(f,u,c){
  if(c.s.name==='Gentle Shroud'){
   if(has(u,'C08')){const threads=c.take('Thread');c.sharedShield(c.all,(1.6+.3*threads)*c.M,4);}
   else{const n=c.shield(c.low,1.05*c.M*(has(u,'A03')?.8:1));if(has(u,'C01'))ward(f,u,f.lowest(u,c.all.filter(t=>t!==c.low)),n*.35,3,'Shared Shroud');}
   if(has(u,'A03'))mercyThread(f,u);if(has(u,'B03'))f.heal(u,c.low,.3*c.M,'Mended Shroud',{primary:true,talent:true});return true;
  }
  const threads=c.take('Thread'),needle=c.s.name==='Veil Needle',t=c.low,bonus=has(u,'B08')?0:(needle?(has(u,'A02')?.4:.25):.25+(has(u,'A06')?.2:0))*threads*c.M;
  c.hit(((needle?1.3*(has(u,'B02')?.75:1):2.5*(has(u,'B06')?.85:1)+(has(u,'A08')?1:0))*c.M)+bonus+(needle?spend(u,'shroudDebt'):0),{magicBypassPoints:needle&&threads>=2&&has(u,'A04')?.07:0});
  if(threads&&has(u,'B01'))heal(f,u,t,.15*c.M*threads,'Softened Thread');
  if(needle){if(threads&&has(u,'B02'))ward(f,u,t,(.2+(threads>=2&&has(u,'B04')?.2:0))*c.M,3,'Gentle Needle');if(c.results[0]?.hit&&has(u,'C02'))buff(f,u,c.t,'Guiding Needle','guidingNeedle',20,3,{harmful:true});if(threads&&has(u,'B08'))f.heal(u,t,.45*c.M*threads,'Threads for the Living',{primary:true,talent:true});}
  else if(has(u,'A08')){if(c.results[0]?.hit)buff(f,u,c.t,'Mercy into Spite:'+u.id,'mercySpite',.2*c.M,3,{harmful:true});}
  else{c.heal(t,((has(u,'B06')?1:.65)+(has(u,'B08')?.45*threads:0))*c.M);if(has(u,'C03'))buff(f,u,t,'Protected Mercy','nextActiveDR',.15,3,{once:true});}return true;
 },
 afterCast(f,u,c){if(c.u.side!==u.side){const e=f.get(c.u,'Mercy into Spite:'+u.id);if(e&&f.ready(u,'mercySpite',1))f.proc(u,c.u,e.value,'magic','Mercy into Spite');}}
});
function calcify(f,u,t,duration=3,fixed=false){buff(f,u,t,'Calcify','flee',-20,duration,{harmful:true,fixed});}
register('ashbasilisk',{
 effect(f,u,g){if(g.source!==u||g.key!=='Calcify')return;if(has(u,'A01')&&!g.extra.fixed)g.duration=5;if(has(u,'A08')){g.kind='physicalExposure';g.value=.1;}},
 hitBonus(f,u,n,a,t){const e=f.get(t,'Calcify');if(!e)return n;if(allies(u,a)&&has(u,'B01'))n+=15;if(a===u&&has(u,'A08')&&e.source===u.id)n+=25;return n;},
 healAmount(f,u,n,source,t){return t===u&&has(u,'C08')&&f.has(f.battle.target(u),'Calcify')?n*1.25:n;},
 incoming(f,u,n,a,t,d){if(t===u&&d.basic&&has(u,'C07')&&a?.id===u.targetId&&f.has(a,'Calcify'))n*=.88;const p=pool(u,u,'Defensive Glare');if(t===u&&d.active&&d.primary&&p&&!p.safe&&has(u,'C05')){p.safe=true;n*=.8;}return n;},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(d.basic)f.remove(u,'Fang Behind Stone');if(d.critical&&has(u,'C08'))n*=1.2/1.4;return n;},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Warm Underplates'&&has(u,'C04'))ward(f,u,u,Math.min(.25*f.stats(u).A,o.offered-n),3,'Sun on Basalt');},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.key==='Weakened basic'&&has(u,'B04'))buff(f,u,a,'Cracked Confidence','hit',-20,3,{harmful:true});},
 landed(f,u,a,t,r,d){if(a!==u)return;if(has(u,'C08')&&d.active)calcify(f,u,t);if(r.critical){if(has(u,'C02')&&f.ready(u,'scaleMemory',1))ward(f,u,u,.2*f.stats(u).A,3,'Scale Memory');if(has(u,'A07')){if(u.kit.petrifiedTarget!==t.id){u.kit.petrifiedTarget=t.id;u.kit.petrifiedCrits=0;}u.kit.petrifiedCrits=(u.kit.petrifiedCrits||0)+1;if(u.kit.petrifiedCrits>=3&&f.ready(u,'petrifiedEdge',4)){u.kit.petrifiedCrits=0;u.kit.petrifiedPrimer=true;}}if(has(u,'B07')&&f.has(t,'Calcify')&&f.ready(u,'stoneEcho',3)){const other=f.nearby(u,t,18,2,t).find(v=>v!==t);if(other)calcify(f,u,other,2,true);}}},
 cast(f,u,c){
  const calcified=f.has(c.t,'Calcify');
  if(c.s.name==='Ashfang'){const primer=u.kit.petrifiedPrimer;u.kit.petrifiedPrimer=false;const r=c.hit((1.35+(calcified&&has(u,'A02')?.3:0)+(primer?.35:0))*c.A,{hitBonus:15+(primer?25:0)});if(r.hit&&calcified){if(r.critical&&has(u,'A04'))buff(f,u,u,'Fang Behind Stone','crit',.15,75);if(has(u,'B02'))buff(f,u,c.t,'Weakened basic','basicWeakness',.2,3,{harmful:true});if(has(u,'C01'))heal(f,u,u,.25*c.A,'Warm Underplates');}return true;}
  if(c.s.name==='Stone-Eye Glare'){c.hit(1.5*c.A*(has(u,'B08')?.5:1));if(c.results[0]?.hit){for(const t of has(u,'B08')?f.nearby(u,c.t,18,3,c.t):[c.t]){calcify(f,u,t,has(u,'B08')?4:3,has(u,'B08'));if(has(u,'B03')){buff(f,u,t,'Heavy Eyelids','basicPenalty',.15,has(u,'B08')?4:3,{harmful:true});if(has(u,'B05'))buff(f,u,t,'Unhealing Stone','healReceived',-.25,has(u,'B08')?4:3,{harmful:true});}}if(has(u,'A03'))buff(f,u,c.t,'Glare of Cracks','physicalExposure',.06,3,{harmful:true});if(!has(u,'B08')&&!f.control(u,c.t,'Interrupt',.5)&&has(u,'A05'))u.kit.unyieldingGlare=.4*c.A;}if(has(u,'C03'))ward(f,u,u,.4*c.A,3,'Defensive Glare');return true;}
  if(c.s.name==='Basalt Finish'){c.hit(((calcified?3.25:2.7)+(calcified&&c.hp(c.t)<.5&&has(u,'A06')?.4:0))*c.A*(has(u,'C06')?.85:1)+spend(u,'unyieldingGlare'));if(c.results[0]?.hit){if(calcified&&has(u,'B06'))buff(f,u,c.t,'Seal the Basalt','shieldReceived',-.25,4,{harmful:true});if(alive(c.t)&&has(u,'C06'))heal(f,u,u,.5*c.A,'Patient Finish');}return true;}
 }
});
const charredPool=(f,u)=>pool(has(u,'C08')?f.trainer(u):u,u,'Charred Leaves');
function charredWard(f,u,n){ward(f,u,has(u,'C08')?f.trainer(u):u,n,has(u,'A08')?1e6:3,'Charred Leaves',{accumulate:true,cap:(has(u,'A08')?.1:.05)*u.maxHp});}
register('basalturtle',{
 charredLeaves(){return true;},
 support(f,u,s){if(s.name==='Stone Sap'&&has(u,'B08'))return false;},
 gate(f,u,c){if(c.s.name==='Stone Sap'&&has(u,'B08'))return alive(c.t);},
 incoming(f,u,n,a,t,d){if(t===u&&a?.side!==u.side&&d.dot){const prevented=n*(has(u,'A01')?.4:.25);f.after(()=>charredWard(f,u,prevented*.5));n-=prevented;}return n;},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(has(u,'A08')&&d.primary)n*=.8;if(d.basic){const e=f.get(u,'Sap to Spines');if(e){n+=e.value;if(--e.charges<=0){f.remove(u,e.key);if(has(u,'B05'))f.after(()=>heal(f,u,u,.25*f.stats(u).A,'Thorn Drinking'));}}if(charredPool(f,u)&&has(u,'B07')&&f.ready(u,'burntTips',1))n+=.15*f.stats(u).A;}return n;},
 healAmount(f,u,n,source,t){const received=f.value(t,'healReceived');return has(u,'B02')&&f.has(t,'Sharp Succulent:'+u.id)&&received>-.3?n*.7/(1+received):n;},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Stone Sap'&&has(u,'A05'))ward(f,u,u,Math.min(.05*u.maxHp,.5*(o.offered-n)),3,'Sap Reserve');},
 hitBonus(f,u,n,a,t){return a===f.trainer(u)&&has(u,'C02')&&f.get(t,'Guiding Thorn')?.source===u.id?n+20:n;},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B04')){const e=f.get(t,'Sharp Succulent:'+u.id);if(e&&(e.extended||0)<2){e.extended=(e.extended||0)+.5;f.extendDot(u,t,e.key,.5);}}if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Guiding Thorn');if(e?.source===u.id&&!e.warmed){e.warmed=true;ward(f,u,u,.02*u.maxHp,3,'Warm Root');}}},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(t===u&&p.label==='Leafslab Shelter'&&has(u,'B06'))f.proc(u,a,.5*f.stats(u).A,'melee','Slab Reprisal');if(p.label==='Shared Slab'&&has(u,'C05'))f.after(()=>heal(f,u,t,.02*u.maxHp,'After the Slab'));},
 cast(f,u,c){
  if(c.s.name==='Basalt Thorn'){c.hit(1.15*c.A);if(c.results[0]?.hit){buff(f,u,c.t,'Basalt Thorn','healReceived',-.15,3,{harmful:true});if(charredPool(f,u)&&has(u,'A02')){ward(f,u,u,.02*c.H,3,'Sheltered Thorn');if(has(u,'A04'))buff(f,u,u,'Sooted Edge','basicDR',.15,2,{once:true});}if(has(u,'B01'))f.dot(u,c.t,'Sharp Succulent:'+u.id,.48*c.A,4,'melee',{ownerRequired:true,label:'Sharp Succulent',extended:0});if(has(u,'C02'))buff(f,u,c.t,'Guiding Thorn','guidingThorn',20,3,{harmful:true});}return true;}
  if(c.s.name==='Stone Sap'){if(has(u,'B08')){f.dot(u,c.t,'Sap Becomes Venom:'+u.id,1.5*c.A,5,'magic',{ownerRequired:true,label:'Sap Becomes Venom'});c.selfward(.04*c.H);}else c.heal(u,(.09+(has(u,'A03')&&c.startHP<.5?.03:0))*c.H);if(has(u,'A07')&&!enemyDots(f,u).length)charredWard(f,u,.02*c.H);if(has(u,'B03'))buff(f,u,u,'Sap to Spines','sapSpines',.25*c.A,75,{charges:2});if(has(u,'C01'))heal(f,u,c.tr,.03*c.H,'Sap for Two');if(has(u,'C06')&&charredPool(f,u))c.cleanse(c.tr,'dot');return true;}
  if(c.s.name==='Leafslab Shelter'){c.shield(c.tr,.1*c.H,4);c.selfward((.05+(has(u,'A06')&&enemyDots(f,u).length?.03:0))*c.H);if(has(u,'C03'))ward(f,u,c.other.find(t=>t.slot>0),.04*c.H,3,'Shared Slab');if(has(u,'C07'))buff(f,u,c.tr,'Leaf Filter','dotDR',.25,4,{requiresPool:'Leafslab Shelter'});return true;}
 }
});
const crownFull=(f,u)=>(f.get(u,'Crown Heat')?.value||0)>=(has(u,'A01')?.16:.12)-1e-8;
const hearthInside=(f,u,t=u)=>{const e=ownedEntity(f,u,'imperial-hearth');return e&&f.battle.distance(e,t)<=e.spec.radius;};
register('cinderempress',{
 crownHeat(){return true;},
 entityCreated(f,u,e){if(e.profile==='imperial-hearth'){if(has(u,'A08'))e.spec.radius=18;if(has(u,'C07'))for(const t of f.others(u))ward(f,u,t,.3*e.snapshot.M,3,'Gather at the Hearth');}},
 entityTick(f,u,e){if(e.profile==='imperial-hearth'&&has(u,'A08'))e.position={...u.position};},
 hearthAura(f,u,e){if(has(u,'A08'))return true;const value=has(u,'B08')?.25:.1;if(f.battle.distance(e,u)<=e.spec.radius)buff(f,u,u,'Hearth shelter','dr',value,.1);if(has(u,'C03'))for(const t of f.others(u).filter(t=>f.battle.distance(e,t)<=e.spec.radius))buff(f,u,t,'Court Shelter','dr',value*.5,.1);return true;},
 entityPulse(f,u,e){if(e.profile!=='imperial-hearth')return;const M=e.snapshot.M;
  if(has(u,'C08'))for(const t of f.core(u).filter(t=>f.battle.distance(e,t)<=e.spec.radius)){ward(f,u,t,.35*M,2,'A Court, Not a Pyre');buff(f,u,t,'Court favor','courtFavor',.12,2);}
  else{const targets=f.nearby(u,e,e.spec.radius,3,f.battle.target(u));for(let i=0;i<targets.length;i++)f.proc(e,targets[i],(.6+(i===0&&targets[i].id===u.kit.originalTarget&&has(u,'A06')?.2:0))*M*(has(u,'B08')?.5:1),'magic','Imperial Hearth',{area:true,secondary:i>0});}
  if(hearthInside(f,u)){if(has(u,'B08'))ward(f,u,u,.02*u.maxHp,2,'A Throne of Embers');if(has(u,'B05')&&!e.throneRecovered&&e.pulseIndex===e.spec.pulses.length-1){e.throneRecovered=true;heal(f,u,u,.02*u.maxHp,'Throne Recovery');}}return true;
 },
 primary(f,u,n,c,kind){if(allies(u,c.u)&&f.get(c.u,'Court favor')?.source===u.id)n*=1.12;if(c.u===u&&c.s.name==='Royal Cinder'&&kind==='damage'&&c.crownFull&&has(u,'A02'))n+=.25*c.M;return n;},
 beforeCast(f,u,c){if(c.u===u)c.crownFull=crownFull(f,u);},
 incoming(f,u,n,a,t,d){return t===u&&d.active&&crownFull(f,u)&&has(u,'B07')&&f.ready(u,'crownRestraint',5)?n*.8:n;},
 healAmount(f,u,n,source,t,o){return t===u&&has(u,'B03')&&o.primary&&hearthInside(f,u)?n*1.15:n;},
 shield(f,u,g){if(g.source===u&&g.target===u&&g.label==='Pleated Mantle'&&has(u,'B01')){g.amount+=.04*u.maxHp;g.duration=4;}},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Pleated Mantle'&&has(u,'C02')){const other=f.lowest(u,f.others(u));ward(f,u,other,n*.5,3,'Warm Audience');if(has(u,'C05'))buff(f,u,other,'Granted Favor','hit',20,3);}},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Pleated Mantle'&&has(u,'B06')){const e=f.get(u,'Crown Heat');if(e)e.until+=2;}},
 landed(f,u,a,t){if(a===f.trainer(u)){const e=f.remove(t,'Courtly Cinder:'+u.id);if(e){f.proc(u,t,.25*f.stats(u).M,'magic','Courtly Cinder');if(has(u,'C04'))ward(f,u,u,.25*f.stats(u).M,3,'Audience Returned');}}},
 afterCast(f,u,c){if(c.u!==u)return;if(c.s.name==='Royal Cinder'&&c.results[0]?.hit){if(c.crownFull&&has(u,'A04'))buff(f,u,c.t,'Crown Brand','magicExposure',.06,3,{harmful:true});if(pool(u,u,'Pleated Mantle')&&has(u,'B02')){heal(f,u,u,.25*c.M,'Cooling Crown');if(has(u,'B04'))buff(f,u,u,'Glowing Scales','basicDR',.15,2,{once:true});}if(has(u,'C01'))buff(f,u,c.t,'Courtly Cinder:'+u.id,'courtlyCinder',.25*c.M,3,{harmful:true});if(c.crownFull&&has(u,'C06'))buff(f,u,c.t,'Weakened active','activeWeakness',.12,3,{harmful:true});const e=ownedEntity(f,u,'imperial-hearth');if(e&&hearthInside(f,u)&&has(u,'A07')&&!e.renewed){e.renewed=true;e.until+=1;e.spec.pulses.push(e.spec.pulses.at(-1)+1);}}
  buff(f,u,u,'Crown Heat','magicPower',Math.min(has(u,'A01')?.16:.12,(f.get(u,'Crown Heat')?.value||0)+.04*(c.s.name==='Pleated Mantle'&&has(u,'A03')?2:1)),c.s.name==='Pleated Mantle'&&has(u,'A05')?6:4,{replace:true});}
});
function sparkRefund(f,u,kind){
 if(!f.ready(u,'sparkCD',3))return false;u.kit.Spark=0;const M=f.stats(u).M;
 if(has(u,'C08')){const t=f.lowest(u);heal(f,u,t,.35*M,'Spend Sparks on Shelter');ward(f,u,t,.6*M,3,'Spend Sparks on Shelter');}
 else refund(u,'Ash Arc',kind==='kill'?(has(u,'A08')?3:2):has(u,'A01')?1.5:1);
 if(has(u,'A02'))u.kit.hotArc=true;if(has(u,'A07'))ward(f,u,u,.25*M,3,'Ash Cushion');if(has(u,'C01'))ward(f,u,f.trainer(u),.25*M,3,'Covering Spark');
 if(kind==='casts'&&has(u,'B07'))for(const p of u.pools.filter(p=>p.source===u.id&&p.amount>0&&(p.emberExtension||0)<2)){p.emberExtension=(p.emberExtension||0)+1;p.until+=1;}return true;
}
function scorchExpire(f,u,t,e,burn=false){if(!alive(t)||e.resolved)return;e.resolved=true;if(!burn)f.proc(u,t,(has(u,'B01')?.6:.25)*e.value,'magic','Scorchline');if(has(u,'B04'))u.kit.scorchMemory=.2*e.value;if(has(u,'C07'))ward(f,u,f.others(u).find(t=>t.slot>0),.25*e.value,3,'A Spark for Others');}
register('cindrake',{
 carrySpark(){return true;},
 beforeCast(f,u,c){if(c.u===u&&c.s.name==='Ash Arc'){c.hotArc=!!u.kit.hotArc;u.kit.hotArc=false;}},
 shield(f,u,g){if(g.source===u&&g.target===u&&g.label==='Bladefoot Flare'&&has(u,'B03')){g.amount+=.4*f.stats(u).M;g.duration=3;}},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Bladefoot Flare'&&has(u,'C03'))ward(f,u,f.trainer(u),n*.5,3,'Shared Bladefoot');},
 hitBonus(f,u,n,a,t){return a===f.trainer(u)&&has(u,'C05')&&pool(a,u,'Shared Bladefoot')&&t.id===u.targetId?n+20:n;},
 outgoing(f,u,n,a,t,d){if(t===f.trainer(u)&&d.basic){const e=f.remove(a,'Arc Warning:'+u.id);if(e){n*=.8;if(has(u,'C04'))f.after(()=>heal(f,u,t,.2*f.stats(u).M,'Ash Reprieve'));}}return n;},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Bladefoot Flare'&&has(u,'B05'))f.after(()=>heal(f,u,u,.25*f.stats(u).M,'Heated Shelter'));},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B06')){if(u.kit.stokedTarget!==t.id){u.kit.stokedTarget=t.id;u.kit.stokedBasics=0;}u.kit.stokedBasics=(u.kit.stokedBasics||0)+1;if(u.kit.stokedBasics%4===0)f.add(u,'Spark',1,3);}},
 death(f,u,a,t){if(t.side===u.side||t.temporary)return;const e=f.remove(t,'Scorchline:'+u.id);if(e&&!e.resolved){e.resolved=true;const next=f.battle.target(u);if(alive(next)&&!next.temporary&&f.battle.inRange(u,next))f.proc(u,next,(has(u,'A05')?.75:.5)*e.value,'magic','Scorchline');}sparkRefund(f,u,'kill');},
 cast(f,u,c){
  if(c.s.name==='Ash Arc'){const marked=f.has(c.t,'Scorchline:'+u.id)||f.has(c.t,'Scorch Without an End:'+u.id);c.hit((1.45+(c.hotArc&&has(u,'A02')?.25:0)+(marked&&has(u,'B02')?.2:0))*c.M+spend(u,'chasingFire')+spend(u,'scorchMemory'));if(c.results[0]?.hit&&has(u,'C02'))buff(f,u,c.t,'Arc Warning:'+u.id,'arcWarning',.2,3,{harmful:true});return true;}
  if(c.s.name==='Scorchline'){
   const duration=has(u,'B08')?5:has(u,'A03')?3:2;
   if(has(u,'B08')){const t=c.t;c.primary={kind:'damage',amount:1.75*c.M,target:t};f.dot(u,t,'Scorch Without an End:'+u.id,1.75*c.M,5,'magic',{ownerRequired:true,label:'Scorch Without an End',expire:()=>scorchExpire(f,u,t,{value:c.M},true)});c.statusLanded=!!f.get(t,'Scorch Without an End:'+u.id);}
   else{c.hit(1.7*c.M);if(c.results[0]?.hit&&!c.t.temporary){const t=c.t,e=buff(f,u,t,'Scorchline:'+u.id,'deathMark',c.M,duration+.05,{harmful:true});if(e)f.later(u,t,duration,()=>{if(f.get(t,e.key)===e){f.remove(t,e.key);scorchExpire(f,u,t,e);}},{ownerRequired:true});}}
   if(has(u,'C06')&&(has(u,'B08')||c.results[0]?.hit))buff(f,u,c.t,'Smoke Along the Line','hit',-20,duration,{harmful:true});return true;
  }
 },
 afterCast(f,u,c){if(c.u!==u||!(c.statusLanded&&!c.t.temporary||c.results.some(r=>r.primary&&r.hit&&!r.target.temporary)))return;f.add(u,'Spark',1+(c.hotArc&&has(u,'A04')?1:0)+(c.s.name==='Bladefoot Flare'&&has(u,'A06')?1:0),3);if(u.kit.Spark>=3){if(has(u,'A08')){u.kit.Spark=0;u.kit.chasingFire=.6*c.M;}else sparkRefund(f,u,'casts');}}
});
const ribSheltered=(f,u)=>u.shield>0||has(u,'C08')&&f.others(u).some(t=>!!pool(t,u,'Skull and Rib'));
register('dunecoil',{
 skullRib(){return true;},
 outgoing(f,u,n,a,t,d){if(a!==u||!d.basic)return n;const rib=has(u,'B08')||u.kit.forceRib||(u.kit.ribPhase||0)>=(has(u,'A08')?2:1),M=f.stats(u).M;d.ribCycle=rib;
  if(rib){u.kit.forceRib=false;u.kit.ribPhase=0;n*=has(u,'B08')?1:.85;ward(f,u,has(u,'C08')?f.lowest(u,f.others(u)):u,(has(u,'B01')?.4:.25)*M,2,'Skull and Rib');if(has(u,'C01'))ward(f,u,f.trainer(u),.15*M,2,'Shared Rotation');if(u.kit.cageRefit){u.kit.cageRefit=false;f.after(()=>heal(f,u,u,.02*u.maxHp,'Cage Refit'));}if(u.kit.skullForPair){u.kit.skullForPair=false;u.kit.skeletonPairs=(u.kit.skeletonPairs||0)+1;if(u.kit.skeletonPairs%3===0&&has(u,'C07'))f.after(()=>heal(f,u,f.lowest(u),.5*M,'Patient Skeleton'));}}
  else{u.kit.ribPhase=(u.kit.ribPhase||0)+1;n*=has(u,'A01')?1.3:1.15;const spin=spend(u,'spinalPrimer'),brace=spend(u,'forwardBrace');n+=spin+brace+spend(u,'skullSignal');if(spin&&has(u,'A04'))f.after(()=>buff(f,u,t,'Polished Skull','magicExposure',.06,3,{harmful:true}));if(brace&&has(u,'A05'))f.after(()=>heal(f,u,u,.2*M,'Bone Flywheel'));u.kit.skullCount=(u.kit.skullCount||0)+1;if(u.kit.skullCount%3===0&&has(u,'A07'))ward(f,u,u,.3*M,3,'Third Rotation');u.kit.skullForPair=true;}
  u.kit.lastRib=rib;return n;
 },
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&!d.ribCycle&&has(u,'C08'))heal(f,u,u,.15*f.stats(u).M,'Pass the Wheel');if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Signal Spin');if(e?.source===u.id&&!e.signaled){e.signaled=true;u.kit.skullSignal=.25*f.stats(u).M;}}},
 hitBonus(f,u,n,a,t){return allies(u,a)&&a!==u&&has(u,'C02')&&f.get(t,'Signal Spin')?.source===u.id?n+20:n;},
 incoming(f,u,n,a,t,d){const p=pool(u,u,'Brace the Ribs');if(t===u&&d.active&&d.primary&&p&&!p.joined&&has(u,'B05')){p.joined=true;n*=.8;}return n;},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&has(u,'B07')&&!u.pools.some(p=>p.source===u.id&&p.amount>0)&&f.ready(u,'cageRefitCD',3))u.kit.cageRefit=true;},
 cast(f,u,c){
  if(c.s.name==='Brace the Ribs'){const n=c.selfward(.85*c.M+(.03+(has(u,'B03')?.03:0))*c.H,has(u,'B03')?4:3);u.kit.forceRib=true;if(has(u,'A03'))u.kit.forwardBrace=.35*c.M;if(has(u,'C03')){const t=c.other.find(t=>t.slot>0);ward(f,u,t,n*.35,3,'Helpful Brace');if(has(u,'C05'))buff(f,u,t,"Companion's Frame",'nextActiveDR',.15,3,{once:true});}return true;}
  if(c.s.name==='Rib Cascade'){const sheltered=ribSheltered(f,u);c.hit((has(u,'B08')?2.9:2.7+(sheltered?.4:0)+(u.kit.lastRib===false&&has(u,'A06')?.45:0))*c.M);if(sheltered){if(has(u,'B06'))ward(f,u,c.tr,.4*c.M,3,'Rib Shelter');if(has(u,'C06'))for(const t of c.other)buff(f,u,t,'Cascade for the Crew','basicTempo',.12,3);}return true;}
 },
 afterCast(f,u,c){if(c.u===u&&c.s.name==='Spinal Spin'){if(has(u,'A02'))u.kit.spinalPrimer=.3*c.M;if(u.kit.lastRib&&has(u,'B02')){heal(f,u,u,.25*c.M,'Spinal Guard');if(has(u,'B04'))buff(f,u,u,'Spinal Padding','basicDR',.2,2,{once:true});}if(c.results[0]?.hit&&has(u,'C02'))buff(f,u,c.t,'Signal Spin','signalSpin',20,3,{harmful:true});}}
});
function recoilCharges(f,u){return u.kit.recoils=(u.kit.recoils||[]).filter(e=>e.until>f.battle.time);}
function grantRecoil(f,u){const list=recoilCharges(f,u);if(list.length<(has(u,'A03')?2:1))list.push({born:f.battle.time,until:f.battle.time+10});}
function spendRecoil(f,u){const e=recoilCharges(f,u).shift();if(!e)return null;u.kit.recoilSpentAt=f.battle.time;if(has(u,'B03'))f.after(()=>ward(f,u,u,.3*f.stats(u).A,3,'Safe Recoil'));if(has(u,'B08'))f.after(()=>{heal(f,u,u,.03*u.maxHp,'Recoil into Roots');ward(f,u,u,.04*u.maxHp,3,'Recoil into Roots');});if(has(u,'C06')){const tr=f.trainer(u);charge(f,u,tr,'Spring Advice',.2*f.stats(u).A);buff(f,u,tr,'Spring Advice aim','nextBasicHit',20,75);}return e;}
register('ferncoil',{
 elasticRecoil(){return true;},
 gate(f,u,c){if(c.s.name==='Frond Fence')return c.threat()||recoilCharges(f,u).length===0;},
 tick(f,u){for(const e of recoilCharges(f,u))if(has(u,'C07')&&!e.frond&&f.battle.time-e.born>=2){e.frond=true;ward(f,u,f.trainer(u),.2*f.stats(u).A,3,'Fallen Frond');}},
 beforeCast(f,u,c){if(c.u===u)c.hadRecoil=recoilCharges(f,u).length>0;},
 hitBonus(f,u,n,a,t,d){if(a===u&&recoilCharges(f,u).length&&(d.basic||has(u,'A02')&&f.currentCompanionCast?.s.name==='Coiled Whip'))n+=40;if(allies(u,a)&&f.get(t,'Marking Whip')?.source===u.id)n+=20;return n;},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(d.basic&&has(u,'A08'))n*=.85;if(d.basic||has(u,'A02')&&f.currentCompanionCast?.s.name==='Coiled Whip'){const e=spendRecoil(f,u);if(e){d.recoilSpent=true;if(f.currentCompanionCast?.u===u)f.currentCompanionCast.recoilSpent=true;if(!has(u,'B08'))n+=(has(u,'A08')?.7:has(u,'A01')?.45:.25)*f.stats(u).A;const fence=f.get(has(u,'C08')?f.trainer(u):u,'Frond Fence');if(fence?.source===u.id&&!fence.tensed&&has(u,'A05')){fence.tensed=true;n+=.25*f.stats(u).A;}}}return n;},
 missed(f,u,a,t,d){if(a===u&&d.basic){u.kit.coiledRhythm=0;if(!spendRecoil(f,u)&&!has(u,'A08'))grantRecoil(f,u);}if(d.basic&&has(u,'B07')){const fence=f.get(t,'Frond Fence');if(fence?.source===u.id&&!fence.bent){fence.bent=true;heal(f,u,t,.02*u.maxHp,'Bending Back');}}},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&!d.recoilSpent&&has(u,'A07')){u.kit.coiledRhythm=(u.kit.coiledRhythm||0)+1;if(u.kit.coiledRhythm%3===0)grantRecoil(f,u);}if(a===f.trainer(u)&&has(u,'C04')){const e=f.get(t,'Marking Whip');if(e?.source===u.id&&!e.helped){e.helped=true;grantRecoil(f,u);}}},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Safe Recoil'&&has(u,'B05'))buff(f,u,a,'Weakened basic','basicWeakness',.2,3,{harmful:true});},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.key==='Weakened active'&&has(u,'C05')&&allies(u,t))f.after(()=>ward(f,u,t,.3*f.stats(u).A,3,'Warning Leaf'));},
 cast(f,u,c){if(c.s.name==='Frond Fence'){const t=has(u,'C08')?c.tr:u,n=c.shield(t,.85*c.A+(has(u,'B01')?.03*c.H:0),has(u,'B01')?4:3);buff(f,u,t,'Frond Fence','flee',20,3);grantRecoil(f,u);if(has(u,'C01')){const other=has(u,'C08')?u:c.tr;ward(f,u,other,n*.5,3,'Shared Fence');if(!has(u,'C08'))buff(f,u,other,'Shared Fence flee','flee',10,3);}return true;}if(c.s.name==='Fully Unfurled'){const reduced=f.value(c.t,'hit')<0;c.hit((2.9+(has(u,'A06')&&(u.kit.recoilSpentAt??-Infinity)>=f.battle.time-2?.5:0))*c.A);c.debuff('Fully Unfurled','hit',-20,3);if(reduced&&has(u,'B06'))ward(f,u,u,.5*c.A,3,'Covered Unfurl');if(c.results[0]?.hit&&has(u,'C03'))buff(f,u,c.t,'Weakened active','activeWeakness',.15,3,{harmful:true});return true;}},
 afterCast(f,u,c){if(c.u!==u)return;if(c.s.name==='Coiled Whip'){if(c.hadRecoil&&has(u,'B02')){heal(f,u,u,.25*c.A,'Mending Whip');if(has(u,'B04'))buff(f,u,u,'Stem Stitch','flee',15,2);}if(c.results[0]?.hit){if(c.recoilSpent&&has(u,'A04'))buff(f,u,c.t,'Carved Frond','physicalExposure',.06,3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Marking Whip','markingWhip',20,3,{harmful:true});}}if(c.primary?.kind==='damage'&&has(u,'A08'))grantRecoil(f,u);}
});
register('ironback',{
 tiltedCarapace(){return true;},
 incoming(f,u,n,a,t,d){if(d.direct===false||d.dot||a?.side===u.side||t!==u&&!(has(u,'C08')&&t===f.trainer(u)&&f.get(u,'Interposing Shell')?.target===t.id))return n;if(!f.ready(u,'carapaceCD',has(u,'A01')?2.5:3))return n;const prevented=n*.3;u.kit.carapaceAt=f.battle.time;u.kit.tilts=(u.kit.tilts||0)+1;if(has(u,'B01'))u.kit.storedTilt=Math.min(.8*f.stats(u).A,(u.kit.storedTilt||0)+.3*prevented);if(has(u,'A07')&&u.kit.tilts%2===0)f.after(()=>heal(f,u,u,.02*u.maxHp,'Tilt to Recover'));if(has(u,'C01')&&f.ready(u,'sharedTilt',2))f.after(()=>ward(f,u,f.trainer(u),.02*u.maxHp,3,'Shared Tilt'));return n-prevented;},
 tick(f,u){const e=f.get(u,'Intercept');if(has(u,'A08')&&e?.source===u.id&&u.hp/u.maxHp<.3){f.remove(u,'Intercept');ward(f,u,f.trainer(u),.05*u.maxHp,3,'Never Expose the Trainer');}},
 healAmount(f,u,n,source,t,o){if(t===u&&source!==u&&allies(u,source)&&o.primary&&has(u,'A05')&&(f.has(u,'Intercept')||f.has(u,'Interposing Shell')))n*=1.2;if(t===f.trainer(u)&&has(u,'C07')&&t.pools.some(p=>p.source===u.id&&p.amount>0))n*=1.15;return n;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){const e=f.get(u,'Aggressive Plate');if(e){n+=e.value;if(--e.charges<=0){f.remove(u,e.key);if(has(u,'B05'))f.after(()=>heal(f,u,u,.25*f.stats(u).A,'Plate Rebound'));}}}if(a===f.trainer(u)&&d.active&&d.primary&&has(u,'C05')){const e=f.get(a,'Plate of Resolve');if(e?.source===u.id&&!e.steady){e.steady=true;f.after(()=>ward(f,u,u,.03*u.maxHp,3,'Steady Resolve'));}}return n;},
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Targeted Knuckle')?.source===u.id?n+20:n;},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B07')&&u.kit.talentBasics%4===0)u.kit.carapaceAt=f.battle.time;if(a===f.trainer(u)&&d.basic&&has(u,'C04')){const e=f.get(t,'Targeted Knuckle');if(e?.source===u.id&&!e.impact){e.impact=true;f.proc(u,t,.25*f.stats(u).A,'melee','Marked Impact');}}},
 cast(f,u,c){
  if(c.s.name==='Shellknuckle'){const recent=f.battle.time-(u.kit.carapaceAt??-Infinity)<=2;c.hit((1.2+(recent?(has(u,'B02')?.6:.3):0))*c.A+spend(u,'storedTilt')+spend(u,'heldHammer')+spend(u,'shellStrike'));if(c.results[0]?.hit){if(recent&&has(u,'A02')){ward(f,u,u,.03*c.H,3,'Shell Stitch');if(has(u,'A04'))buff(f,u,u,'Braced Knuckle','basicDR',.2,2,{once:true});}if(recent&&has(u,'B04'))buff(f,u,c.t,'Dented Armor','physicalExposure',.06,3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Targeted Knuckle','targetedKnuckle',20,3,{harmful:true});}return true;}
  if(c.s.name==='Interposing Plate'){const duration=has(u,'A08')?4:3;if(has(u,'C08'))buff(f,u,u,'Interposing Shell','interposingShell',1,duration,{target:c.tr.id});else c.guard(has(u,'A08')?.3:.25,duration,has(u,'A08')?.3:.45);if(has(u,'A03'))ward(f,u,u,.05*c.H,3,'Safer Interposition');if(has(u,'B03'))buff(f,u,u,'Aggressive Plate','aggressivePlate',.25*c.A,75,{charges:2});if(has(u,'C03'))buff(f,u,c.tr,'Plate of Resolve','basicTempo',.12,duration);return true;}
  if(c.s.name==='Hold the Shell'){const n=c.selfward(.18*c.H,4);c.dr(.1,has(u,'A06')?4:2);if(has(u,'B06'))u.kit.heldHammer=.5*c.A;if(has(u,'B08')){const p=pool(u,u,'Hold the Shell'),amount=n*.5;if(p){p.amount=Math.max(0,p.amount-amount);f.syncShield(u);u.kit.shellStrike=Math.min(1.5*c.A,amount);}}if(has(u,'C06'))ward(f,u,c.other.find(t=>t.slot>0),.04*c.H,3,'Held for Two');return true;}
 }
});
function castRings(f,u){return u.kit.castRings=(u.kit.castRings||[]).filter(e=>e.until>f.battle.time);}
function grantRing(f,u,capacity){if(!f.ready(u,'ringCD',2))return;const list=castRings(f,u),entry={capacity,until:f.battle.time+(has(u,'A07')?4:3)};if(list.length<(has(u,'A07')?2:1))list.push(entry);else list[list.length-1]=entry;if(has(u,'C07'))ward(f,u,f.lowest(u,f.others(u)),.25*f.stats(u).A,3,'Ring Around the Ally');}
function ringEligible(f,u,d){return d.basic||!has(u,'B08')&&has(u,'A06')&&f.currentCompanionCast?.s.name==='Molten Constriction';}
register('moltencoil',{
 castOffRing(){return true;},
 criticalRoll(f,u,d){if(!has(u,'B08')&&castRings(f,u).length&&ringEligible(f,u,d))return {critical:true};},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(d.active&&d.primary)n+=spend(u,'sharpShedding');if(ringEligible(f,u,d)&&castRings(f,u).length){const e=castRings(f,u).shift();d.castRing=true;if(has(u,'A01'))n+=.3*f.stats(u).A/(d.critical?1.4:1);if(has(u,'A04'))f.after(()=>buff(f,u,t,'Fractured Scale','physicalExposure',.06,3,{harmful:true}));if(has(u,'B07'))f.after(()=>heal(f,u,u,.3*f.stats(u).A,'Warm Fracture'));if(has(u,'B08'))f.after(()=>{ward(f,u,u,Math.min(.08*u.maxHp,e.capacity),3,'Rings Remember');heal(f,u,u,.02*u.maxHp,'Rings Remember');});}return n;},
 incoming(f,u,n,a,t,d){if(t===u&&d.active&&d.primary&&has(u,'B05')){const p=pool(u,u,'Shed the Slag');if(p&&!p.safeSlag){p.safeSlag=true;n*=.8;}}if(t===f.trainer(u)&&d.active&&d.primary&&has(u,'C04')&&f.get(a,'Ashen Lash')?.source===u.id)n*=.88;return n;},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id)grantRing(f,u,p.capacity);},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Mending Lash'&&has(u,'B04'))ward(f,u,u,Math.min(.2*f.stats(u).A,o.offered-n),3,'Ring Stitch');},
 cast(f,u,c){
  if(c.s.name==='Ringlash'){c.hit((1.3+(has(u,'A02')?.35:0))*c.A);c.selfward((.25*c.A+(has(u,'B01')?.02*c.H:0))*(has(u,'A02')?.6:1),has(u,'B01')?3:2);if(c.startShield&&has(u,'B02'))heal(f,u,u,.2*c.A,'Mending Lash');if(c.results[0]?.hit&&has(u,'C02'))buff(f,u,c.t,'Ashen Lash','hit',-20,3,{harmful:true});return true;}
  if(c.s.name==='Shed the Slag'){let removed=c.cleanse(u,'blind');if(!removed||has(u,'B03'))removed+=c.cleanse(u,'tempo');c.selfward(.9*c.A);if(has(u,'A03'))u.kit.sharpShedding=.4*c.A;if(removed&&has(u,'A05'))grantRing(f,u,.9*c.A);if(has(u,'C03')){const clean=c.cleanse(c.tr,'blind')||c.cleanse(c.tr,'tempo');if(clean&&has(u,'C05'))ward(f,u,c.tr,.35*c.A,3,'Helpful Shed');}return true;}
  if(c.s.name==='Molten Constriction'){const reduced=f.value(c.t,'healReceived')<0;c.hit(2.7*c.A*(has(u,'C08')?.5:1));if(c.results[0]?.hit){for(const t of has(u,'C08')?f.nearby(u,c.t,18,3,c.t):[c.t]){buff(f,u,t,'Molten Constriction','healReceived',has(u,'C01')?-.3:-.2,has(u,'C01')?4:3,{harmful:true});if(has(u,'C06'))buff(f,u,t,'Sealed Wound','shieldReceived',-.25,4,{harmful:true});if(has(u,'C08')&&has(u,'C02'))buff(f,u,t,'Ashen Lash','hit',-20,3,{harmful:true});}if(has(u,'A08')){let amount=0;for(const p of u.pools.filter(p=>p.source===u.id&&['Ringlash','Shed the Slag','Molten Constriction'].includes(p.label))){amount+=p.amount;p.amount=0;}f.syncShield(u);if(amount){f.proc(u,c.t,Math.min(.8*c.A,.5*amount),'melee','Cast Every Ring Aside');grantRing(f,u,amount);}}}if(reduced&&has(u,'B06'))c.selfward(.4*c.A);return true;}
 }
});
function cleanSteam(f,u,t){if(f.ready(u,'steam:'+t.id,2))ward(f,u,t,(has(u,'A01')?.55:.35)*f.stats(u).M,has(u,'A01')?4:3,'Clean Steam');}
const removableHarm=e=>e.harmful!==false&&!e.unremovable&&e.removable!==false&&(e.harmful||e.value<0||['dot','control','basicPenalty'].includes(e.kind));
register('steamaxolotl',{
 cleanSteam(f,u,t){cleanSteam(f,u,t);return true;},
 support(f,u,s){if(s.name==='Gillwash'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Gillwash'&&has(u,'C08'))return alive(c.t);},
 effect(f,u,g){if(!allies(u,g.target)||g.source.side===u.side||g.kind==='control'||!removableHarm({...g.extra,kind:g.kind,value:g.value}))return;const seal=f.get(g.target,'Steam Seal:'+u.id);if(seal){f.remove(g.target,seal.key);g.cancel=true;cleanSteam(f,u,g.target);return;}const bath=f.remove(g.target,'Long Bath:'+u.id);if(bath)g.duration=Math.max(1,g.duration*.7);},
 healed(f,u,source,t,n,label,o){if(source!==u)return;if(label==='Steam Trickle'&&has(u,'B04')&&o.offered>n)buff(f,u,t,'Tender Plume','healReceived',.12,3);if(o.primary&&n>=f.stats(u).M&&has(u,'B07')&&f.ready(u,'savedBreath',3))heal(f,u,u,.3*f.stats(u).M,'Saved Breath');},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Clean Steam'&&has(u,'A07'))buff(f,u,t,'Clean Again:'+u.id,'cleanAgain',.25*f.stats(u).M,75);},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){const amount=spend(u,'washFire');n+=amount;if(amount&&u.kit.washRemoved&&has(u,'C05'))f.after(()=>ward(f,u,u,.25*f.stats(u).M,3,'Recycled Fever'));u.kit.washRemoved=false;}return n;},
 cast(f,u,c){
  if(c.s.name==='Steam Trickle'){const t=c.low,shielded=t.pools.some(p=>p.source===u.id&&p.amount>0);if(has(u,'A02')&&c.cleanse(t,'blind')&&has(u,'A04'))buff(f,u,t,'Fresh Eyes','hit',20,3);const extra=f.remove(t,'Clean Again:'+u.id),n=c.heal(t,(.7+(shielded&&has(u,'B02')?.2:0))*c.M+(extra?.value||0));if(n&&has(u,'C01')&&alive(c.t)&&c.b.inRange(u,c.t)){const sour=f.get(c.t,'Sour Steam')?.source===u.id;f.proc(u,c.t,(.3+(sour&&has(u,'C04')?.2:0))*c.M,'magic','Boiling Trickle');if(has(u,'C02'))buff(f,u,c.t,'Sour Steam','healReceived',-.2,3,{harmful:true});}return true;}
  if(c.s.name==='Gillwash'){let removed=0;
   if(has(u,'C08')){c.hit(1.6*c.M);if(c.results[0]?.hit){const e=removableBuffs(f,c.t)[0];if(e){f.remove(c.t,e.key);removed=1;cleanSteam(f,u,c.tr);}}}
   else{const candidates=c.all.filter(t=>Object.values(t.effects).some(e=>e.until>f.battle.time&&removableHarm(e))),t=candidates.find(t=>t===c.tr&&Object.values(t.effects).some(e=>e.kind==='control'&&removableHarm(e)))||candidates.find(t=>Object.values(t.effects).some(e=>e.kind==='healReceived'&&removableHarm(e)))||f.lowest(u,candidates)||c.low,low=c.hp(t)<.5;removed=c.cleanse(t);if(has(u,'A03'))removed+=c.cleanse(t);c.heal(t,(has(u,'B03')?1.25:1)*c.M);if(has(u,'A05'))heal(f,u,t,.2*c.M*Math.min(2,removed),'Thorough Wash');if(!removed&&has(u,'B01'))ward(f,u,t,.35*c.M,3,'Useful Without Dirt');if(low&&has(u,'B05'))buff(f,u,t,'Washed Respite','nextActiveDR',.15,3,{once:true});if(has(u,'A08'))buff(f,u,t,'Steam Seal:'+u.id,'steamSeal',1,4);}
   u.kit.washRemoved=removed>0;u.kit.washFire=removed&&has(u,'C03')?.2*c.M*Math.min(2,removed):!removed&&has(u,'C07')?.2*c.M:0;return true;
  }
  if(c.s.name==='White-Steam Bath'){for(const t of c.all){const removed=c.cleanse(t);c.heal(t,.8*c.M*(has(u,'B08')?.5:1));if(removed&&has(u,'A06'))buff(f,u,t,'Long Bath:'+u.id,'longBath',.3,3);if(has(u,'B06'))ward(f,u,t,.25*c.M,3,'Warm Bath');if(has(u,'B08'))f.later(u,t,2,()=>heal(f,u,t,.4*c.M,'Long Steam Bath'));}if(has(u,'C06')&&alive(c.t)&&c.b.inRange(u,c.t))for(const t of f.nearby(u,c.t,18,3,c.t))buff(f,u,t,'Sour Steam','healReceived',-.2,3,{harmful:true});return true;}
 }
});
const crownThreshold=u=>has(u,'A01')?.35:.5,crownActive=u=>has(u,'B08')||u.hp/u.maxHp>crownThreshold(u);
register('tidecrown',{
 crownGuard(f,u,t){return !has(u,'A08')&&!has(u,'B08')&&crownActive(u)&&t===f.trainer(u) ? .15 : 0;},
 incoming(f,u,n,a,t,d){return has(u,'A08')&&t===f.trainer(u)&&crownActive(u)&&d.direct!==false&&!d.dot?n*(pool(t,u,'Coronation Tide')?.8:.88):n;},
 gate(f,u,c){if(c.s.name==='Refill the Crown'&&has(u,'C08'))return c.wounded(.85);},
 healed(f,u,source,t,n,label,o){if(t===u&&n&&has(u,'A07')&&o.before/u.maxHp<=crownThreshold(u)&&u.hp/u.maxHp>crownThreshold(u)&&f.ready(u,'clearReign',4))ward(f,u,f.trainer(u),.02*u.maxHp,3,'Clear Reign');if(source===u&&label==='Refill the Crown'&&has(u,'A05'))ward(f,u,u,Math.min(.05*u.maxHp,.5*(o.offered-n)),3,'Full Vessel');},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Coronation Tide'&&t===f.trainer(u)&&has(u,'C07'))f.after(()=>heal(f,u,t,.4*f.stats(u).M,'Royal Aftercare'));},
 cast(f,u,c){
  if(c.s.name==='Royal Spout'){const activeCrown=crownActive(u),marked=f.get(c.t,'Piercing Water')?.source===u.id,primer=f.remove(u,'Refilled Power'),r=c.hit((1.15+(has(u,'B08')?.6:0)+(activeCrown&&has(u,'B01')?.4:0))*c.M+(primer?.value||0));c.heal(u,(has(u,'A02')?.5:.3)*c.M);if(has(u,'A04'))buff(f,u,u,'Water Around the Crown','basicDR',.15,2,{once:true});if(r.hit){if(activeCrown&&marked&&has(u,'B04'))c.splash(.3*c.M,18,1,'magic');if(has(u,'B02'))buff(f,u,c.t,'Piercing Water','magicExposure',.06,3,{harmful:true});if(has(u,'B07'))heal(f,u,u,.15*r.damage,'Storm-fed Life',.4*c.M);if(has(u,'C01')){const n=heal(f,u,c.tr,.25*c.M,'Shared Spout');if(n&&has(u,'C04'))buff(f,u,c.tr,'Clear Command','hit',20,3);}}return true;}
  if(c.s.name==='Refill the Crown'){const t=has(u,'C08')?c.low:u,n=c.heal(t,(.8*c.M+.07*c.H)*(has(u,'B08')?.75:1));if(t!==u&&has(u,'C08'))heal(f,u,u,.3*n,'Water for the Court');if(has(u,'A03'))ward(f,u,u,.04*c.H,3,'Deep Refill');if(has(u,'B03'))buff(f,u,u,'Refilled Power','refilledPower',.5*c.M,has(u,'B05')&&crownActive(u)?1e6:3);if(has(u,'C02')){const other=f.lowest(u,c.other);heal(f,u,other,.4*c.M,'Gentle Refill');if(has(u,'C05'))buff(f,u,other,'Crest of Kindness','healReceived',.15,3);}return true;}
  if(c.s.name==='Coronation Tide'){const n=c.shield(c.tr,1.1*c.M+.04*c.H,4);c.heal(u,.6*c.M);if(has(u,'A06'))ward(f,u,u,.04*c.H,3,'Safe Coronation');if(has(u,'B06')&&alive(c.t)&&c.b.inRange(u,c.t))f.proc(u,c.t,.6*c.M,'magic','Coronation Bolt');if(has(u,'C03'))heal(f,u,c.tr,.4*c.M,'Crown Stitch');if(has(u,'C06'))ward(f,u,c.other.find(t=>t.slot>0),n*.3,3,'Two Crowns');return true;}
 }
});
const wardens=(f,u)=>f.entities.filter(e=>alive(e)&&e.master===u&&e.profile==='sapling-warden');
register('elderroot',{
 entityCap(f,u,id,n){return id==='sapling-warden'&&has(u,'B08')?1:n;},
 gate(f,u,c){if(c.s.name==='Old Forest Stand'&&has(u,'A08'))return wardens(f,u).length<2||wardens(f,u).some(e=>e.hp<e.maxHp);},
 fits(f,u,c){if(c.s.name==='Old Forest Stand'&&has(u,'A08')&&wardens(f,u).length)return true;},
 entityCreated(f,u,e){if(e.profile!=='sapling-warden')return;const great=has(u,'B08');e.hp=e.maxHp=Math.round((has(u,'A01')?.14:.1)*u.maxHp*(great?2:1));if(has(u,'A01'))e.until+=1;if(has(u,'A08')){e.until=1e6;e.intercept=.1;}e.attack=(great?.6:.18)+(has(u,'B01')?.12:0);if(great){e.intercept=0;e.guards=null;e.name='Ironwood Warden';e.art='ironwood-warden';e.visualScale=1.3;}if(has(u,'B06')){const t=f.nearby(e,e,e.entityReach,1,f.battle.target(u))[0];if(t)f.proc(e,t,.25*e.snapshot.A,'melee','Crushing Forest',{ignoreRange:false,reach:e.entityReach});}},
 entityLoss(f,u,e,n,d){if(e.profile==='sapling-warden'&&d.transfer){e.shelterLoss=(e.shelterLoss||0)+n;if(has(u,'A05')&&!e.sapwood&&e.shelterLoss>=.04*u.maxHp){e.sapwood=true;ward(f,u,f.core(u).find(t=>t.id===e.assigned),.02*u.maxHp,3,'Sapwood Shelter');}}},
 entityEnded(f,u,e,reason,remaining){if(e.profile==='sapling-warden'&&reason==='expired'&&remaining>0&&has(u,'A06'))heal(f,u,u,.2*remaining,'Old Forest Memory',.03*u.maxHp);},
 entityOutgoing(f,u,n,e,t){if(e.profile==='sapling-warden'&&f.has(e,'Haven for Battle')){n*=1.15;if(has(u,'B05')&&t.id===u.targetId&&!e.branchCommand){e.branchCommand=true;n+=.15*e.snapshot.A;}}return n;},
 entityLanded(f,u,e,t,r){if(e.profile==='sapling-warden'&&has(u,'B07'))limited(f,u,'ironSap',.1*(r.damage||0),.01*u.maxHp,n=>heal(f,u,u,n,'Iron Sap',n));},
 outgoing(f,u,n,a,t,d){return a===u&&d.primary&&d.category!=='magic'&&f.has(u,'Haven for Battle')?n*1.15:n;},
 healAmount(f,u,n,source,t){return t===f.trainer(u)&&has(u,'C05')&&pool(t,u,'Haven Reserve')?n*1.15:n;},
 shielded(f,u,source,t,n,label){if(source===u&&t===u&&label==='Old Growth'&&has(u,'C03')&&f.currentCompanionCast?.u===u&&f.currentCompanionCast.s.name==='Hollow Haven')ward(f,u,f.trainer(u),n*.5,3,'Haven Reserve');},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Old Growth'&&has(u,'C07')&&f.ready(u,'hollowEcho',3))for(const t of f.others(u))buff(f,u,t,'Hollow Echo','hit',20,3);},
 cast(f,u,c){
  if(c.s.name==='Root-Hand Crush'){c.hit((1.15*c.A+Math.min((has(u,'B02')?.03:.02)*c.H,(has(u,'B02')?.9:.6)*c.A))*(has(u,'C02')?.8:1));if(c.results[0]?.hit){const e=wardens(f,u).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.id.localeCompare(b.id))[0];if(has(u,'A02')){if(e&&e.hp<e.maxHp)heal(f,u,e,.02*c.H,'Root Repair');else if(has(u,'A04'))ward(f,u,u,.02*c.H,3,'Healthy Root');}if(has(u,'B04'))buff(f,u,c.t,'Splintered Root','physicalExposure',.06,3,{harmful:true});if(has(u,'C02')){heal(f,u,c.tr,.02*c.H,'Gentle Root');if(has(u,'C04'))buff(f,u,c.tr,'Living Arch','nextActiveDR',.15,3,{once:true});}}return true;}
  if(c.s.name==='Hollow Haven'){const n=c.heal(u,(has(u,'C08')?.04:.08)*c.H);buff(f,u,c.tr,'Hollow Haven','dr',.1,3);if(has(u,'C01'))ward(f,u,c.tr,n*.3,3,'Shared Old Growth');if(has(u,'C08'))for(const t of c.other){c.heal(t,.04*c.H);buff(f,u,t,'Hollow Haven','dr',.1,3);}else if(has(u,'A03'))buff(f,u,c.other.find(t=>t.slot>0),'Haven Around the Trunk','dr',.05,3);for(const e of wardens(f,u)){if(has(u,'A07'))heal(f,u,e,.02*c.H,'Shelter from Below');if(has(u,'B03')){buff(f,u,e,'Haven for Battle','havenBattle',.15,3);e.branchCommand=false;}}if(has(u,'B03'))buff(f,u,u,'Haven for Battle','havenBattle',.15,3);return true;}
  if(c.s.name==='Old Forest Stand'){const other=c.other.find(t=>t.slot>0),personal=has(u,'C06')&&other?.hp<other?.maxHp*.5?other:u,targets=has(u,'B08')?[u]:[c.tr,personal].filter(alive);for(let i=0;i<targets.length;i++){const e=wardens(f,u).find(e=>e.wardenSlot===i);if(e&&has(u,'A08'))heal(f,u,e,.5*e.maxHp,'Forest That Remains');else if(!e){const made=c.deploy('sapling-warden',{assigned:targets[i]});if(made)made.wardenSlot=i;}}return true;}
 }
});
function orchidPollen(f,u,t,count=1){if(!alive(t))return;const key='Pollen:'+u.id,old=f.get(t,key),stacks=(old?.stacks||0)+count,M=f.stats(u).M,duration=has(u,'C01')?4:2;if(stacks>=3){f.remove(t,key);u.kit.pollenBursts=(u.kit.pollenBursts||0)+1;if(has(u,'C08')){heal(f,u,f.lowest(u),.7*M,'Flower Without Fire');buff(f,u,t,'Weakened active','activeWeakness',.2,3,{harmful:true});}else f.proc(u,t,(has(u,'B01')?.9:.6)*M,'magic','Ignition Pollen');buff(f,u,t,'Pollen denial','healReceived',-.2,duration,{harmful:true});if(has(u,'C06'))buff(f,u,t,'Bitter Bloom','shieldReceived',-.25,duration,{harmful:true});if(has(u,'C07'))heal(f,u,f.lowest(u),.3*M,'Sap of Relief');}else buff(f,u,t,key,'pollen',stacks,has(u,'C01')?8:5,{stacks,harmful:true});}
register('emberorchid',{
 ignitionPollen(f,u,t){orchidPollen(f,u,t);return true;},
 gate(f,u,c){if(c.s.name==='Bloomjaw Turret'){const e=ownedEntity(f,u,has(u,'B08')?'seed-bomb':'seedjaw');return has(u,'A08')&&e?e.hp<e.maxHp:!e&&alive(c.t)&&c.b.inRange(u,c.t);}},
 fits(f,u,c){if(c.s.name==='Bloomjaw Turret'&&has(u,'A08')&&ownedEntity(f,u,'seedjaw'))return true;},
 entityCreated(f,u,e){if(!['seedjaw','seed-bomb'].includes(e.profile))return;if(has(u,'A01'))e.maxHp=e.hp=Math.round(.11*u.maxHp);if(e.profile==='seedjaw'){if(has(u,'B06'))e.spec.maxShots=4;if(has(u,'A08')){e.spec.maxShots=0;e.until=1e6;}}},
 entityOutgoing(f,u,n,e,t,o){if(e.profile==='seed-bomb'){if(!o.secondary&&e.kit.targetPollen){n+=spend(e,'targetPollen');if(has(u,'A04'))o.magicBypassPoints=.06;}return n;}if(e.profile!=='seedjaw')return n;const shot=e.shots;if(has(u,'A08')&&shot>6)n=.3*e.snapshot.M;if(shot===1)n+=((has(u,'A01')?.3:0)+(has(u,'B06')?.5:0))*e.snapshot.M;if(has(u,'A06')&&(shot===3||shot===6))n+=.2*e.snapshot.M;if(e.kit.targetPollen){n+=spend(e,'targetPollen');if(has(u,'A04'))o.magicBypassPoints=.06;}return n;},
 entityPulse(f,u,e){if(e.profile!=='seed-bomb')return;const t=f.nearby(u,e,e.entityReach,1,f.battle.target(u))[0];if(t){f.proc(e,t,(2.4+(has(u,'A01')?.3:0)+(has(u,'B06')?.5:0))*e.snapshot.M,'magic','Seedjaw Bomb',{area:true});for(const other of f.nearby(u,t,18,3,t).filter(v=>v!==t).slice(0,2))f.proc(e,other,.6*e.snapshot.M,'magic','Seedjaw Bomb',{area:true,secondary:true});orchidPollen(f,u,t);}f.despawn(e,'detonated');return true;},
 incoming(f,u,n,a,t,d){if(t===u&&d.basic&&has(u,'A07')&&(ownedEntity(f,u,'seedjaw')||ownedEntity(f,u,'seed-bomb')))n*=.88;if(t===f.trainer(u)&&d.basic&&has(u,'C04')&&f.get(a,'Sooted Orchid')?.source===u.id)n*=.88;return n;},
  broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Kind Petals'&&has(u,'C05'))orchidPollen(f,u,a);},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B07')&&u.kit.talentBasics%3===0&&f.ready(u,'pollinatedRhythm',2))orchidPollen(f,u,t);},
 beforeCast(f,u,c){if(c.u===u){c.emptyPollen=!f.has(c.t,'Pollen:'+u.id);c.pollenBursts=u.kit.pollenBursts||0;}},
 cast(f,u,c){
  if(c.s.name==='Bloomjaw Turret'){const e=ownedEntity(f,u,'seedjaw');if(e&&has(u,'A08'))heal(f,u,e,.5*e.maxHp,'Orchid Takes Root');else c.deploy(has(u,'B08')?'seed-bomb':'seedjaw');return true;}
  if(c.s.name==='Searing Petals'){c.hit((1.45+(has(u,'B03')?.4:0))*c.M,{area:true});c.splash(.35*c.M*(has(u,'B03')?.5:1),18,2);c.selfward(.35*c.M);const e=ownedEntity(f,u,'seedjaw')||ownedEntity(f,u,'seed-bomb');if(e&&has(u,'A03')&&heal(f,u,e,.02*c.H,'Petal Repair')&&has(u,'A05'))ward(f,u,u,.25*c.M,3,'Fresh Blossom');return true;}
 },
 afterCast(f,u,c){if(c.u!==u)return;if(c.s.name==='Orchid Spark'&&c.results[0]?.hit){const e=ownedEntity(f,u,'seedjaw')||ownedEntity(f,u,'seed-bomb');if(e&&(e.targetId===c.t.id||e.profile==='seed-bomb'&&f.battle.inRange(e,c.t))&&has(u,'A02'))e.kit.targetPollen=.25*c.M;if(c.emptyPollen&&has(u,'B02')){orchidPollen(f,u,c.t);if(has(u,'B04'))buff(f,u,u,'Early Bloom','nextBasic',.25*c.M,75);}if(has(u,'C02'))buff(f,u,c.t,'Sooted Orchid','hit',-20,3,{harmful:true});}if(c.s.name==='Searing Petals'){if(has(u,'B05')&&(u.kit.pollenBursts||0)>c.pollenBursts)f.shield(u,u,.75*c.M,3,'Searing Petals',{skill:c.s});if(has(u,'C03'))ward(f,u,c.tr,(pool(u,u,'Searing Petals')?.amount||0)*.5,3,'Kind Petals');}}
});
function capTarget(f,u,e){const targets=f.core(u).filter(t=>f.battle.distance(e,t)<=e.spec.radius),tr=f.trainer(u);return targets.includes(tr)&&tr.hp/tr.maxHp<.55?tr:f.lowest(u,targets);}
register('glowcap',{
 gate(f,u,c){if(c.s.name==='Floating Canopy'){const e=ownedEntity(f,u,'nightlight-cap');if(has(u,'A08'))return e?e.hp<e.maxHp:c.wardGate(.85);if(has(u,'C08'))return !e&&alive(c.t)&&c.b.inRange(u,c.t);}},
 fits(f,u,c){if(c.s.name==='Floating Canopy'&&has(u,'A08')&&ownedEntity(f,u,'nightlight-cap'))return true;},
 entityCreated(f,u,e){if(e.profile!=='nightlight-cap')return;e.hp=e.maxHp=Math.round((has(u,'A01')?.12:.08)*u.maxHp*(has(u,'B08')?.75:1));if(has(u,'A06'))e.spec.radius=30;if(has(u,'B08'))e.spec.radius=18;if(has(u,'C08'))e.spec.initialAreaShield=0;if(has(u,'A08')){e.until=1e6;e.nextPerennial=e.born+6;}},
 entityTick(f,u,e){if(e.profile!=='nightlight-cap')return;if(has(u,'B08')){const t=f.core(u).find(t=>t.id===e.assigned);if(t)e.position={...t.position};}if(has(u,'A08')&&f.battle.time>=e.nextPerennial){e.nextPerennial+=2;root.BondCombatEntities.pulse(f,e,{perennial:true});}},
 entityPulse(f,u,e,o){if(e.profile!=='nightlight-cap')return;const normal=o.heal===undefined,M=e.snapshot.M;if(has(u,'C08')){const t=f.nearby(u,e,e.spec.radius,1,f.battle.target(u))[0];if(t){f.proc(e,t,.7*M,'magic','Glow Beneath the Enemy');buff(f,u,t,'Dimming Seed','hit',-20,3,{harmful:true});}}else{const t=capTarget(f,u,e);if(t)f.heal(e,t,(o.heal??(o.perennial?.35:has(u,'A01')?.55:.4))*M,'Nightlight Cap');}if(normal&&has(u,'C03')){const t=f.nearby(u,e,e.spec.radius,1)[0];if(t){f.proc(e,t,.15*M,'magic','Spore Pulse');if(has(u,'C05'))buff(f,u,t,'Closer to the Flame','basicPenalty',.12,2,{harmful:true});}}return true;},
 entityEnded(f,u,e,reason){if(e.profile==='nightlight-cap'&&reason==='destroyed'){if(has(u,'A07'))heal(f,u,f.lowest(u),.3*f.stats(u).M,'Warm Roots');if(has(u,'C07'))ward(f,u,f.trainer(u),.5*f.stats(u).M,3,'Nightlight Reprieve');}},
 cast(f,u,c){
  if(c.s.name==='Glowseed'){const t=c.low,delay=has(u,'B01')?.5:1,key=u.id+':Glowseed:'+u.casts;let amount=root.BondCombatPassives.primary(f,c,'heal',.7*c.M);amount=root.BondCompanionTalents.change(f,'primary',amount,c,'heal');c.primary={kind:'heal',amount,target:t};c.shield(t,(has(u,'B02')?.4:.25)*c.M,delay+.05,{key});const p=t.pools.find(p=>p.key===key),pending=buff(f,u,t,'Pending Glowseed','pendingHeal',amount,delay+.05);f.later(u,t,delay,()=>{
    if(!alive(t))return;const offered=amount+(p?.absorbed&&has(u,'B04')?.25*c.M:0),receipt={},n=f.heal(u,t,offered,'Glowseed',{primary:true,receipt});if(f.get(t,'Pending Glowseed')===pending)f.remove(t,'Pending Glowseed');if(p){if(has(u,'B07')&&n<receipt.offered&&p.amount>0)p.until=f.battle.time+2;else p.amount=0;f.syncShield(t);}const e=ownedEntity(f,u,'nightlight-cap');if(e&&has(u,'A02')&&f.battle.distance(e,t)<=e.spec.radius&&heal(f,u,e,.02*c.H,'Seed the Cap')&&has(u,'A04'))heal(f,u,t,.2*c.M,'Patient Mycelium');const enemy=f.battle.target(u);if(n&&has(u,'C01')&&alive(enemy)&&f.battle.inRange(u,enemy)){const dim=f.get(enemy,'Dimming Seed')?.source===u.id;f.proc(u,enemy,.25*c.M,'magic','Hostile Nightlight');if(dim&&has(u,'C04'))buff(f,u,enemy,'Poisoned Light','healReceived',-.2,3,{harmful:true});if(has(u,'C02'))buff(f,u,enemy,'Dimming Seed','hit',-20,3,{harmful:true});}
   },{label:'Glowseed'});return true;
  }
  if(c.s.name==='Floating Canopy'){const e=ownedEntity(f,u,'nightlight-cap');if(e&&has(u,'A08'))heal(f,u,e,.5*e.maxHp,'Perennial Cap');else c.deploy('nightlight-cap',has(u,'C08')?{anchor:c.t}:{assigned:c.low});if(has(u,'B06'))ward(f,u,c.tr,.4*c.M,3,'Pocket Canopy');return true;}
  if(c.s.name==='Mushroom Dawn'){c.teamheal(.75*c.M);const t=f.lowest(u);if(has(u,'B03'))heal(f,u,t,.35*c.M,'Steady Dawn');if(has(u,'B05'))ward(f,u,t,.3*c.M,3,"Dawn's Cover");const e=ownedEntity(f,u,'nightlight-cap');if(e){if(has(u,'A03'))heal(f,u,e,.03*c.H,'Dawn Refill');root.BondCombatEntities.pulse(f,e,{heal:.6+(has(u,'A05')?.25:0)});}if(has(u,'C06')&&alive(c.t)&&c.b.inRange(u,c.t))for(const t of f.nearby(u,c.t,18,3,c.t))buff(f,u,t,'Dimming Seed','hit',-20,3,{harmful:true});return true;}
 }
});
const sorrowThreshold=u=>has(u,'A01')||has(u,'B08')?.5:.4;
function thornPower(f,u,n){u.kit.thornPower=Math.min(.9*f.stats(u).M,(u.kit.thornPower||0)+n);}
register('marigoldia',{
 bloomSorrow(){return true;},
 support(f,u,s){if(s.name==='Second Spring'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Second Spring'&&has(u,'C08'))return alive(c.t);},
 healAmount(f,u,n,source,t,o){
  if(source===u&&o.primary){if(has(u,'B08'))n*=1.15;else if(t.hp/t.maxHp<=sorrowThreshold(u))n*=1.25;n+=spend(u,'repeatedKindness');}
  const bitter=f.get(t,'Bitter Mourning');if(bitter?.source===u.id&&o.primary&&has(u,'C05')&&!bitter.rose){bitter.rose=true;thornPower(f,u,.3*f.stats(u).M);}return n;
 },
 healed(f,u,source,t,n,label,o){if(source!==u||!o.primary)return;const low=o.before/t.maxHp<=sorrowThreshold(u),M=f.stats(u).M;
  if(low&&has(u,'A07')&&f.ready(u,'staySpring:'+t.id,3))buff(f,u,t,'Stay for Spring','nextActiveDR',.15,3,{once:true});if(n>0&&has(u,'C01'))thornPower(f,u,n*.2);if(low&&has(u,'C07')&&u.kit.sorrowThornCast!==u.casts){u.kit.sorrowThornCast=u.casts;thornPower(f,u,.2*M);}
  if(label==='Petal Poultice'&&!low&&has(u,'B04'))ward(f,u,t,Math.min(.3*M,.4*(o.offered-n)),3,'Saved Petal');if(n>0&&has(u,'B07')){u.kit.healedChecklist||={};u.kit.healedChecklist[t.id]=true;if(f.core(u).length===3&&f.core(u).every(v=>u.kit.healedChecklist[v.id])){u.kit.healedChecklist={};u.kit.repeatedKindness=.4*M;}}
 },
 beforeHP(f,u,n,a,t,d){const e=f.get(t,'Bloom Before the Fall:'+u.id);if(e&&d.direct!==false&&!d.dot&&a?.side!==u.side&&(t.hp-n)/t.maxHp<sorrowThreshold(u)){f.remove(t,e.key);ward(f,u,t,e.value,3,'Bloom Before the Fall');const r=f.absorb(t,n,a,d);d.extraAbsorbed=(d.extraAbsorbed||0)+r.absorbed;n=r.remaining;}return n;},
 incoming(f,u,n,a,t,d){if(d.dot){const e=f.get(t,'Clean Poultice:'+u.id);if(e){n*=.7;if(--e.charges<=0)f.remove(t,e.key);}}return n;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){n+=spend(u,'thornPower')+spend(u,'springNeedles');const e=f.remove(t,'Rose Poultice:'+u.id);if(e){n+=.25*f.stats(u).M;if(has(u,'C04'))f.after(()=>buff(f,u,t,'Pointed Petal','magicExposure',.06,3,{harmful:true}));}}return n;},
 broken(f,u,a,t,p){if(p.source!==u.id||p.label!=='Mourning Bloom')return;if(has(u,'A05'))f.after(()=>heal(f,u,t,.3*f.stats(u).M,'Last Petal'));if(has(u,'C03'))buff(f,u,a,'Bitter Mourning','healReceived',-.25,3,{harmful:true});},
 cast(f,u,c){
  const t=c.low,low=c.hp(t)<=sorrowThreshold(u);
  if(c.s.name==='Petal Poultice'){c.heal(t,(.65+(low&&has(u,'A02')||!low&&has(u,'B01')?.2:0))*c.M);buff(f,u,t,'Clean Poultice:'+u.id,'cleanPoultice',.3,low&&has(u,'A04')?3:2,{charges:low&&has(u,'A04')?2:1});if(t!==u&&has(u,'B02'))heal(f,u,u,.15*c.M,'Dew in Petals');if(has(u,'C02')&&alive(c.t)&&c.b.inRange(u,c.t))buff(f,u,c.t,'Rose Poultice:'+u.id,'rosePoultice',.25*c.M,3,{harmful:true});return true;}
  if(c.s.name==='Mourning Bloom'){c.heal(t,1.2*c.M);const amount=(.4+(has(u,'A03')?.3:0))*c.M;if(low||has(u,'B03'))c.shield(t,amount*(low?1:.5));if(has(u,'A08'))buff(f,u,t,'Bloom Before the Fall:'+u.id,'bloomBeforeFall',amount*.5,3);if(has(u,'B05'))f.later(u,t,2,()=>heal(f,u,t,.3*c.M,'Gentle Regrowth'));return true;}
  if(c.s.name==='Second Spring'){let removed=0;if(has(u,'C08')){const r=c.hit(2*c.M+spend(u,'thornPower'));if(r.hit)buff(f,u,c.t,'Bitter Mourning','healReceived',-.25,3,{harmful:true});ward(f,u,t,Math.min(c.M,.25*(r.damage||0)),3,'Rose Instead of Remedy');}else{removed=c.cleanse(t,'heal');c.heal(t,(2+(removed&&has(u,'A06')?.4:0))*c.M);if(!removed&&has(u,'B06'))ward(f,u,t,.35*c.M,3,'Spring Without Blight');if(has(u,'B08'))heal(f,u,f.lowest(u,c.all.filter(v=>v!==t&&v.hp<v.maxHp)),.6*c.M,'A Year of Spring');}if(has(u,'C06'))u.kit.springNeedles=(removed?.5:.3)*c.M;return true;}
 }
});
register('mossling',{
 capacity(f,u,n,owner,key){return owner===u&&key==='Seedling'&&has(u,'A01')?4:n;},
 support(f,u,s){if(s.name==='Head Garden'&&has(u,'C08'))return false;},
 gate(f,u,c){if(c.s.name==='Head Garden'&&has(u,'C08'))return alive(c.t);},
 outgoing(f,u,n,a,t,d){return a===u&&has(u,'A08')?n*.8:n;},
 incoming(f,u,n,a,t,d){if(t===u&&d.basic&&has(u,'A04')){const p=pool(u,u,'Rooted Patch');if(p&&!p.knitted){p.knitted=true;n*=.8;}}return n;},
 healed(f,u,source,t,n,label,o){if(t===u&&source!==u&&allies(u,source)&&o.primary&&n>=.03*u.maxHp&&has(u,'B07')&&f.ready(u,'seedlingCare',3))f.add(u,'Seedling',1,3);},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'C07')&&u.kit.talentBasics%4===0&&f.ready(u,'growingFight',3))f.add(u,'Seedling',1,3);},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Moss Patch'&&has(u,'C05'))f.proc(u,a,.4*f.stats(u).A,'melee','Patch Counter');},
 cast(f,u,c){
  if(c.s.name==='Root-Mitten Mash'){const held=c.r('Seedling'),spent=has(u,'C01')?c.take('Seedling',1):0;c.hit((1.1+.45*spent)*c.A);c.heal(u,.02*c.H);if(held&&has(u,'A02'))ward(f,u,u,.02*c.H,3,'Rooted Patch');if(c.results[0]?.hit){if(spent&&has(u,'C02')){buff(f,u,c.t,'Thorny Mash','physicalExposure',.06,3,{harmful:true});if(has(u,'C04'))heal(f,u,u,.2*c.A,'Sap in the Wound');}if(has(u,'B01')){const t=f.lowest(u,c.other),n=heal(f,u,t,.25*c.M,'Medicinal Mash');if(n&&has(u,'B04'))buff(f,u,t,'Tender Mitten','healReceived',.12,3);}}return true;}
  if(c.s.name==='Moss Patch'){const seeds=c.take('Seedling');if(has(u,'B02'))heal(f,u,c.tr,.3*c.M,'Gentle Patch');const n=c.shield(c.tr,(.08+(has(u,'A03')?.03:.02)*seeds)*c.H*(has(u,'A08')?.75:1),has(u,'A08')?1e6:3);if(has(u,'A08'))buff(f,u,c.tr,'Moss That Holds','dotDR',.15,1e6,{requiresPool:'Moss Patch'});if(has(u,'A05'))ward(f,u,u,n*.5,3,'Sap Padding');if(seeds>=3&&has(u,'A07')&&!u.kit.spareSeedling){u.kit.spareSeedling=true;c.add('Seedling',1,3);}if(has(u,'C03'))charge(f,u,u,'Brambled Patch',.2*c.A*seeds);return true;}
  if(c.s.name==='Head Garden'){const seeds=c.take('Seedling'),injured=c.all.filter(t=>t.hp<t.maxHp),budget=(has(u,'B03')?.4:.25)*c.M*seeds;
   if(has(u,'C08')){c.hit((1.6+.5*seeds)*c.A);heal(f,u,u,.02*c.H*seeds,'Bowl of Brambles');}
   else for(const t of c.all){const bonus=has(u,'B08')?(injured.includes(t)?budget*1.5/injured.length:0):t===c.low?budget:0;c.heal(t,.75*c.M+bonus);if(has(u,'B06'))ward(f,u,t,.2*c.M,3,'Sharing the Bowl');}
   if(seeds>=2&&has(u,'B05')&&!has(u,'C08'))c.cleanse(c.low,'dot');if(has(u,'A06'))ward(f,u,u,.02*c.H*seeds,3,'Garden Shell');if(has(u,'C06'))charge(f,u,u,'Harvest in the Head',.2*c.A*seeds);return true;
  }
 }
});
function gainCrosswind(f,u){if(f.ready(u,'crosswindCD',1))f.add(u,'Crosswind',1,2);}
register('skycorolla',{
 crossPollination(){return true;},
 capacity(f,u,n,owner,key){return owner===u&&key==='Crosswind'&&has(u,'A07')?3:n;},
 support(f,u,s){if(s.name==='Four-Petal Cyclone'&&has(u,'B08'))return true;},
 gate(f,u,c){if(c.s.name==='Four-Petal Cyclone'&&has(u,'B08'))return c.wounded(.9)||c.wardGate();},
 healed(f,u,source,t,n,label,o){if(source!==u&&allies(u,source)&&o.primary&&has(u,'B07'))gainCrosswind(f,u);},
 shielded(f,u,source,t,n,label,p,o){if(source!==u&&allies(u,source)&&o.primary&&has(u,'B07'))gainCrosswind(f,u);},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'C01')&&u.kit.talentBasics%3===0)gainCrosswind(f,u);if(a!==u&&allies(u,a)){if(d.category!=='magic'&&has(u,'A04')){const cut=f.get(t,'Cutting Draft');if(cut?.source===u.id&&!cut.refunded){cut.refunded=true;f.add(u,'Crosswind',1,2);}}const mark=f.get(t,'Flagged Seed');if(mark?.source===u.id&&!mark.used[a.id]){mark.used[a.id]=true;f.proc(u,t,.15*f.stats(u).M,'magic','Flagged Seed');if(has(u,'C05')&&!mark.returned&&f.others(u).every(v=>mark.used[v.id])){mark.returned=true;f.add(u,'Crosswind',1,2);}}}},
 incoming(f,u,n,a,t,d){return d.active&&d.primary&&f.get(a,'Pollen Everywhere')?.source===u.id?n*.88:n;},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Seed Shelter'&&has(u,'B05'))buff(f,u,t,'Shelter in Bloom','nextDirectDR',.15,3,{once:true});},
 cast(f,u,c){
  const count=c.take('Crosswind',2),cyclone=c.s.name==='Four-Petal Cyclone',bonus=count*c.M*(cyclone?(has(u,'A06')?.5:.35):(has(u,'A01')?.3:.2));
  if(has(u,'B01')&&count)ward(f,u,u,.2*c.M*count,3,'Windborne Cover',{cap:.6*c.M,accumulate:true});if(count===2&&has(u,'C07'))for(const t of c.other)buff(f,u,t,'Friendly Gust','hit',20,3);
  if(c.s.name==='Petal Slicer'){c.hit(1.3*c.M+bonus,{magicBypassPoints:count&&has(u,'A02')?.05:0});if(c.results[0]?.hit){if(count&&has(u,'A02'))buff(f,u,c.t,'Cutting Draft','healReceived',-.2,3,{harmful:true});if(count&&has(u,'C02'))for(const t of f.nearby(u,c.t,24,3,c.t).filter(t=>t!==c.t).slice(0,2)){f.proc(u,t,.2*c.M,'magic','Widened Slicer',{area:true,secondary:true});if(has(u,'C04'))buff(f,u,t,'Pollen Everywhere','pollenEverywhere',.12,2,{harmful:true});}}if(count&&has(u,'B02')){const t=f.lowest(u);heal(f,u,t,(.2+(t.shield>0&&has(u,'B04')?.15:0))*c.M,'Petal Bandage');}return true;}
  if(c.s.name==='Seedwind'){const own=f.get(c.t,'Magic exposure')?.source===u.id,reduced=f.value(c.t,'magicExposure')>0;c.hit((1.75+(own&&has(u,'A05')?.4:0))*c.M+bonus);if(c.results[0]?.hit){buff(f,u,c.t,'Magic exposure','magicExposure',.05,has(u,'A03')?4:3,{harmful:true});if(has(u,'C03'))buff(f,u,c.t,'Flagged Seed','flaggedSeed',.15*c.M,3,{harmful:true,used:{}});}if(reduced&&has(u,'B03'))ward(f,u,c.tr,.3*c.M,3,'Seed Shelter');return true;}
  if(cyclone){if(has(u,'B08'))for(const t of c.all)c.heal(t,(.65+(t===c.low?.3*count:0))*c.M);
   else{c.hit(2.7*c.M*(has(u,'C08')?.5:1)+bonus*(has(u,'A08')?2:1),{area:true});if(!has(u,'A08'))c.splash((has(u,'C06')?.3:.4)*c.M,24,has(u,'C06')?4:2);if(has(u,'C08')){const position={...c.t.position},zone={owner:u,position,radius:24,until:f.battle.time+3};f.zones.push(zone);for(let i=1;i<=3;i++)f.later(u,null,i,()=>{for(const t of f.nearby(u,zone,24,5))f.proc(u,t,.2*c.M,'magic','Wind Without Borders',{area:true});},{ownerRequired:true});}}
   if(has(u,'B06'))ward(f,u,c.other.find(t=>t.slot>0),.35*c.M*count,3,'Cyclone Umbrella');return true;
  }
 }
});
function fracture(f,u,n){u.kit.storedFracture=Math.min((has(u,'B08')?2:1)*f.stats(u).A,(u.kit.storedFracture||0)+n);}
register('ambercolossus',{
 protectedCore(){return true;},
 beforeHP(f,u,n,a,t,d){if(t!==u||a?.side===u.side||d.direct===false||d.dot||n<=.08*u.maxHp||!f.ready(u,'corePreventCD',3))return n;const prevented=Math.min(n-.08*u.maxHp,(has(u,'A01')?.08:.06)*u.maxHp*(has(u,'B08')?.5:1));if(has(u,'B01'))fracture(f,u,prevented*(has(u,'B08')?1:.35));if(has(u,'A07'))f.after(()=>ward(f,u,u,.03*u.maxHp,3,'Core Reset'));if(has(u,'C03'))f.after(()=>ward(f,u,f.others(u).find(t=>t.slot>0),.02*u.maxHp,3,'Crystalline Pulse'));return n-prevented;},
 healAmount(f,u,n,source,t,o){return has(u,'A05')&&t===f.trainer(u)&&o.primary&&(pool(t,u,'Amber Encasement')||has(u,'A08')&&pool(t,u,'Colossus Stand'))?n*1.2:n;},
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Marked Maul')?.source===u.id?n+20:n;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){const e=f.get(u,'Bright Counterweight');if(e){n+=e.value;if(--e.charges<=0){f.remove(u,e.key);if(has(u,'B05'))f.after(()=>heal(f,u,u,.3*f.stats(u).A,'Paid in Amber'));}}}if(a===f.trainer(u)&&d.active&&d.primary&&has(u,'C04')){const e=f.get(t,'Marked Maul');if(e?.source===u.id&&!e.weight){e.weight=true;f.after(()=>f.proc(u,t,.25*f.stats(u).A,'melee','Shared Weight'));}}return n;},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B07')&&u.kit.talentBasics%3===0)fracture(f,u,.25*f.stats(u).A);},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(p.label==='Core Maul'&&has(u,'A04'))f.after(()=>heal(f,u,u,.02*u.maxHp,'Mended Crystal'));if(p.label==='Crystalline Pulse'&&has(u,'C05'))f.after(()=>heal(f,u,t,.25*f.stats(u).A,'Pulse of Recovery'));},
 expired(f,u,t,p){if(p.source===u.id&&p.label==='Amber Encasement'&&has(u,'C07')){if(p.shared){if(p.shared.remembered)return;p.shared.remembered=true;}ward(f,u,u,.4*(p.shared?.remaining??p.amount),3,'Remember the Shield');}},
 gate(f,u,c){if(c.s.name==='Amber Encasement'&&has(u,'C01'))return c.wardGate();if(c.s.name==='Colossus Stand'&&has(u,'A08'))return c.hp()<.9||c.trainerGate();},
 cast(f,u,c){
  if(c.s.name==='Core Maul'){const stored=spend(u,'storedFracture');c.hit((1.2+(has(u,'B02')?.3:0))*c.A+stored+spend(u,'heavyStand'));c.selfward((.03+(has(u,'A02')?.02:0))*c.H*(has(u,'B02')?.75:1),has(u,'A02')?3:2);if(stored&&has(u,'B08'))ward(f,u,u,.04*c.H,3,'The Core Strikes Back');if(c.results[0]?.hit){if(stored&&has(u,'B04'))buff(f,u,c.t,'Crack the Guard','physicalExposure',.06,3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Marked Maul','markedMaul',20,3,{harmful:true});}return true;}
  if(c.s.name==='Amber Encasement'){const t=has(u,'C01')&&c.hp(c.tr)>=.6?c.low:c.tr;if(has(u,'A03'))heal(f,u,t,.25*c.A,'Gentle Encasement');if(has(u,'C08')){c.sharedShield([t,...c.all.filter(v=>v!==t)],.13*c.H);}else c.shield(t,.11*c.H);if(has(u,'B03'))buff(f,u,u,'Bright Counterweight','brightCounterweight',.2*c.A,75,{charges:2});return true;}
  if(c.s.name==='Colossus Stand'){c.heal(u,.06*c.H);const duration=has(u,'A06')?4:3;if(has(u,'A08'))c.shield(c.tr,.12*c.H,duration);else c.guard(.3,duration,.4);if(has(u,'A06'))buff(f,u,u,'Broad Stand','healReceived',.15,duration);if(has(u,'B06'))u.kit.heavyStand=.5*c.A;if(has(u,'C06'))heal(f,u,f.lowest(u,c.other),.03*c.H,'Gentle Stand');return true;}
 }
});
function emergencyFlower(f,u){if(u.kit.bloom||!alive(u)||!alive(f.trainer(u)))return;u.kit.bloom=true;const others=f.others(u),M=f.stats(u).M,reserve=spend(u,'emergencyReserve');for(const t of others){heal(f,u,t,.8*M+reserve/Math.max(1,others.length),'Emergency Bloom');if(has(u,'C01'))ward(f,u,t,.3*M,3,'Shared Bloom');}heal(f,u,u,(has(u,'C08')?.08:.05)*u.maxHp,'Emergency Bloom');if(has(u,'C01'))ward(f,u,u,.3*M,3,'Shared Bloom');if(has(u,'A07'))buff(f,u,u,'After the Flower','dr',.2,3);const enemy=f.battle.target(u);if(has(u,'B06')&&alive(enemy)&&f.battle.inRange(u,enemy))for(const t of f.nearby(u,enemy,18,3,enemy))f.proc(u,t,(t===enemy?.9:.25)*M,'magic','Flowering Burst',{area:true,secondary:t!==enemy});}
register('bloomslime',{
 emergencyBloom(){return true;},
 support(f,u,s){if(s.name==='Closed Garden'&&has(u,'B08'))return false;},
 gate(f,u,c){if(c.s.name==='Closed Garden'&&has(u,'B08'))return alive(c.t);},
 damaged(f,u,a,t,n,s,d){if(t===u&&!has(u,'C08')&&a?.side!==u.side&&!d.transfer&&!d.debt&&u.hp/u.maxHp<(has(u,'A01')?.65:.5))emergencyFlower(f,u);},
 incoming(f,u,n,a,t,d){return t===f.trainer(u)&&d.active&&d.primary&&has(u,'A05')&&pool(t,u,'Slime Encasement')?n*.88:n;},
 outgoing(f,u,n,a,t,d){if(d.primary&&d.direct!==false&&!d.dot){const e=f.remove(a,'Sweet Pursuit:'+u.id);if(e)n*=1-e.value;}if(a===u&&d.basic){const e=f.get(u,'Garden Teeth');if(e){n+=e.value;if(--e.charges<=0){f.remove(u,e.key);if(has(u,'B05'))f.after(()=>ward(f,u,u,.35*f.stats(u).M,3,'Petal Return'));}}}if(a===f.trainer(u)&&d.active&&d.primary){const e=f.remove(a,'Protective Seed:'+u.id);if(e){f.after(()=>f.proc(u,t,e.value,'magic','Protective Seed'));if(has(u,'C05'))f.after(()=>ward(f,u,a,.25*f.stats(u).M,3,'Seedling Shield'));}}return n;},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Closed Garden'&&has(u,'C06'))u.kit.emergencyReserve=Math.min(.5*f.stats(u).M,(u.kit.emergencyReserve||0)+.25*(o.offered-n));},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Bud Pulse'&&has(u,'A04'))f.after(()=>heal(f,u,u,.2*f.stats(u).M,'Sap Under Skin'));},
 landed(f,u,a,t){if(allies(u,a)&&a!==u){const e=f.remove(t,'Pollen Message:'+u.id);if(e){const n=heal(f,u,a,.3*f.stats(u).M,'Pollen Message');if(has(u,'C04'))heal(f,u,u,.5*n,'Carried Recovery');}}},
 cast(f,u,c){
  if(c.s.name==='Bud Pulse'){const low=c.hp(c.t)<.5,r=c.hit((1.15+(has(u,'B01')?.25:0)+(low&&has(u,'B02')?.25:0))*c.M);c.selfward(.3*c.M+(has(u,'A02')?.02*c.H:0),has(u,'A02')?3:2);if(r.hit){if(has(u,'B01'))heal(f,u,u,.2*r.damage,'Pulsing Petals',.35*c.M);if(low&&has(u,'B04'))buff(f,u,c.t,'Sweet Pursuit:'+u.id,'sweetPursuit',.12,3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Pollen Message:'+u.id,'pollenMessage',.3*c.M,3,{harmful:true});}return true;}
  if(c.s.name==='Slime Encasement'){c.shield(c.tr,(1+(has(u,'A03')?.35:0))*c.M+.03*c.H+(u.kit.bloom&&has(u,'C07')?spend(u,'emergencyReserve'):0),has(u,'A03')?4:3);if(has(u,'C03'))buff(f,u,c.tr,'Protective Seed:'+u.id,'protectiveSeed',.3*c.M,3);return true;}
  if(c.s.name==='Closed Garden'){if(has(u,'B08'))c.hit(1.6*c.M);else c.selfward((has(u,'A06')?.16:.12)*c.H*(has(u,'A08')?.65:1),has(u,'A08')?1e6:4);c.heal(c.low,(1.1+.2*spend(u,'warmBuds'))*c.M);if(has(u,'B03'))buff(f,u,u,'Garden Teeth','gardenTeeth',.25*c.M,75,{charges:2});return true;}
 },
 afterCast(f,u,c){if(c.u!==u)return;if(has(u,'B07')&&c.primary?.kind==='damage'){u.kit.warmSignatures=(u.kit.warmSignatures||0)+1;if(u.kit.warmSignatures%3===0)u.kit.warmBuds=Math.min(2,(u.kit.warmBuds||0)+1);}if(has(u,'C08')&&u.casts>=3)emergencyFlower(f,u);}
});
function noteAllowed(c){return c.primary&&['damage','heal','shield'].includes(c.primary.kind)&&Number.isFinite(c.primary.amount)&&c.primary.amount>0&&!c.primary.echo&&!c.primary.targetPercent&&!c.s.execute&&!c.s.noEcho&&!c.s.targetPercent&&!c.u.temporary&&c.u.type!=='echochime'&&!c.results.some(r=>r.proc);}
function saveNote(f,u,c,key='Remembered Note',duration=null){if(!noteAllowed(c))return;const p=c.primary,record={kind:p.kind,amount:p.amount,category:p.category};if(key==='Remembered Note'&&has(u,'A08')){if(p.kind!=='damage'||(f.get(u,key)?.record.amount||0)>=p.amount)return;duration=1e6;}buff(f,u,u,key,'record',1,duration??(has(u,'A01')?5:3),{record,born:f.battle.time});}
function echoNote(f,u,name){if(name==='Grand Refrain'&&has(u,'C08')&&f.has(u,'Side Note'))return f.get(u,'Side Note');if(has(u,'B08')&&f.has(u,'Gentle Note'))return f.get(u,'Gentle Note');const e=f.get(u,'Remembered Note');if(name==='Second Note'&&has(u,'B07')&&e?.record.kind!=='heal'&&e?.record.kind!=='shield'&&f.core(u).some(t=>t.hp<t.maxHp))return {record:{kind:'heal',amount:.8*f.stats(u).M},fallback:true};return e;}
register('echochime',{
 rememberNote(){return true;},
 support(f,u,s){if(s.name!=='Tuning Tap')return echoNote(f,u,s.name)?.record.kind!=='damage';},
 gate(f,u,c){if(c.s.name==='Tuning Tap')return;const e=echoNote(f,u,c.s.name);return !!e&&(e.record.kind==='damage'?alive(c.t)&&c.b.inRange(u,c.t):e.record.kind==='heal'?c.wounded(.98):c.wardGate(.98));},
 effectExpired(f,u,t,e){if(t===u&&e.key==='Remembered Note'&&has(u,'C07'))u.kit.patientBell=.35*f.stats(u).M;},
 tick(f,u){const e=f.get(u,'Remembered Note');if(e&&e.until>1000&&has(u,'C07')&&f.battle.time-e.born>=4&&f.ready(u,'patientBellCD',4))u.kit.patientBell=.35*f.stats(u).M;},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Tender Tap'&&has(u,'B04'))ward(f,u,t,Math.min(.25*f.stats(u).M,o.offered-n),3,'Tender Overflow');},
 broken(f,u,a,t,p){if(p.source===u.id&&['Second Note','Grand Refrain','Refrain for Two'].includes(p.label)&&has(u,'B05')&&p.echoSupport)f.after(()=>heal(f,u,t,.25*f.stats(u).M,'Echo Shelter'));},
 shielded(f,u,source,t,n,label,p,o){if(source===u&&o.echo)p.echoSupport=true;},
 hitBonus(f,u,n,a,t){return allies(u,a)&&a!==u&&f.get(t,'Tempo Tap')?.source===u.id?n+20:n;},
 landed(f,u,a,t,r,d){if(a===f.trainer(u)&&d.basic&&has(u,'C04')){const e=f.get(t,'Tempo Tap');if(e?.source===u.id&&!e.returned){e.returned=true;heal(f,u,u,.2*f.stats(u).M,'Tempo Return');}}},
 cast(f,u,c){
  if(c.s.name==='Tuning Tap'){const e=f.get(u,'Remembered Note'),damage=e?.record.kind==='damage';c.hit((1.1+(damage&&has(u,'A02')?.25:0))*c.M+spend(u,'patientBell'));if(e)c.selfward(.3*c.M,2);if(e&&!damage&&has(u,'B02'))heal(f,u,f.lowest(u),.25*c.M,'Tender Tap');if(c.results[0]?.hit){if(damage&&has(u,'A04'))buff(f,u,c.t,'Ringing Target','magicExposure',.06,3,{harmful:true});if(e&&has(u,'C01'))buff(f,u,c.t,'Tempo Tap','tempoTap',20,3,{harmful:true});if(!damage&&has(u,'A07')){const record={kind:'damage',amount:c.primary.amount,category:'magic'};buff(f,u,u,'Remembered Note','record',1,has(u,'A08')?1e6:has(u,'A01')?5:3,{record,born:f.battle.time});}}return true;}
  const e=echoNote(f,u,c.s.name);if(!e)return true;const grand=c.s.name==='Grand Refrain',damage=e.record.kind==='damage';let ratio=grand?.7:.45,cap=grand?2:1.3;if(damage){if(!grand&&has(u,'A03')){ratio=.6;cap=1.55;}if(grand&&has(u,'A06')){ratio=.85;cap=2.4;}if(grand&&has(u,'C08')&&e.key==='Side Note'){ratio=.7;cap=2;}if(has(u,'A08')&&has(u,'A01'))cap+=.2;}
  const amount=(e.fallback?e.record.amount:Math.min(cap*c.M,ratio*e.record.amount))+(!damage&&has(u,'B01')?.25*c.M:0),t=damage?u:c.low;
  if(damage)c.hit(amount,{category:'magic',proc:true});else if(e.record.kind==='heal')c.heal(t,amount,{echo:true});else c.shield(t,amount,has(u,'B03')?4:3,{echo:true});
  if(!grand&&has(u,'C02')){if(e.record.kind==='shield')buff(f,u,t,'Balanced Chime aim','hit',20,3);else ward(f,u,t,.25*c.M,3,'Balanced Chime');}
  if(!grand&&damage&&has(u,'A05'))buff(f,u,u,'Residual Note','nextBasic',.25*c.M,75);
  if(grand){ward(f,u,c.tr,.5*c.M,3,'Grand Refrain trainer');if(!damage&&has(u,'B06')){const other=f.lowest(u,c.all.filter(v=>v!==t));if(e.record.kind==='heal')heal(f,u,other,amount*.5,'Refrain for Two');else f.shield(u,other,amount*.5,has(u,'B03')?4:3,'Refrain for Two',{echo:true,talent:true});}}
  if(e.key==='Side Note'){f.remove(u,e.key);if(has(u,'C05'))ward(f,u,c.tr,.3*c.M,3,'Side Resonance');}if(has(u,'C06')&&u.kit.lastEchoKind&&u.kit.lastEchoKind!==e.record.kind)for(const t of c.other)buff(f,u,t,'Alternating Melody','basicTempo',.12,3);u.kit.lastEchoKind=e.record.kind;return true;
 },
 afterCast(f,u,c){if(c.u===u){if(has(u,'C03'))u.kit.sideReady=true;return;}if(!allies(u,c.u)||!noteAllowed(c))return;if(c.u.slot===0){saveNote(f,u,c);if(has(u,'B08')&&c.primary.kind!=='damage')saveNote(f,u,c,'Gentle Note',6);}else if(has(u,'C03')&&u.kit.sideReady){u.kit.sideReady=false;saveNote(f,u,c,'Side Note',3);}}
});
const ownInk=(f,u,t)=>Object.values(t?.effects||{}).some(e=>e.source===u.id&&e.kind==='hit'&&e.value<0&&e.until>f.battle.time);
function doubleAssignment(f,u){if(has(u,'C08')){const tr=f.trainer(u),enemy=f.enemies(u).find(t=>!t.temporary&&t.targetId===tr?.id&&f.battle.inRange(t,tr));if(enemy)return {assigned:tr,linked:enemy.id};}return {linked:f.battle.target(u)?.id};}
register('inksprite',{
 smudgedAdvantage(){return true;},
 fits(f,u,c){if(c.s.name==='Dripping Double')return !!root.BondCombatEntities.placement(f,u,root.BondCombatEntities.profiles['ink-double'],doubleAssignment(f,u));},
 entityCreated(f,u,e){if(e.profile==='ink-double'){if(has(u,'B01')){e.hp=e.maxHp=Math.round(.12*u.maxHp);e.until=e.born+4;}if(has(u,'B08')){e.lureLimit=2;e.lureUntil=e.born+2;}if(has(u,'B02'))heal(f,u,u,.25*f.stats(u).A,'Ink Stitch');if(has(u,'C03'))ward(f,u,f.trainer(u),.35*f.stats(u).A,3,"Trainer's Shadow");}},
 entityLured(f,u,e,a){if(e.profile==='ink-double'&&has(u,'B05'))buff(f,u,a,'Drowning Smile','drowningSmile',.15,2,{harmful:true});},
 entityEnded(f,u,e,reason){if(e.profile!=='ink-double')return;if(reason==='destroyed'&&has(u,'B03'))ward(f,u,u,.4*f.stats(u).A,3,'Splash Shelter');if(reason==='expired'&&has(u,'B07')){heal(f,u,u,.03*u.maxHp,'Spare Paper');u.kit.sparePaper=.25*f.stats(u).A;}},
 tick(f,u){if(has(u,'B06')&&ownedEntity(f,u,'ink-double'))buff(f,u,u,'Living Ink','flee',20,.1);},
 outgoing(f,u,n,a,t,d){if(a!==u)return n;if(d.category!=='magic'&&f.value(t,'hit')<0)n*=has(u,'A01')?1.18:1.12;if(d.basic){const e=f.get(t,'Nothing Left to See:'+u.id);if(e){n*=1.45;if(!e.used){e.used=true;if(has(u,'A03')&&f.value(t,'hit')<0)d.penetration=Math.max(d.penetration||0,.08);if(has(u,'A05')&&t.hp/t.maxHp<.4)n+=.5*f.stats(u).A;}}}return n;},
 incoming(f,u,n,a,t,d){if(d.active&&d.primary){if(f.get(a,'Drowning Smile')?.source===u.id)n*=.85;if(t===f.trainer(u)&&has(u,'C04')&&f.get(a,'Spreading Blot')?.source===u.id)n*=.88;}return n;},
 healAmount(f,u,n,source,t,o){return t===f.trainer(u)&&o.primary&&has(u,'C05')&&pool(t,u,"Trainer's Shadow")?n*1.15:n;},
 healed(f,u,source,t,n,label,o){if(source===u&&label==='Ink Stitch'&&has(u,'B04'))ward(f,u,u,Math.min(.25*f.stats(u).A,o.offered-n),3,'Brush Recovery');},
 hitBonus(f,u,n,a,t){if(!ownInk(f,u,t))return n;if(a===u&&has(u,'A06'))n+=25;if(allies(u,a)&&a!==u&&has(u,'C01'))n+=20;return n;},
 missed(f,u,a,t,d){if(t===f.trainer(u)&&d.basic&&ownInk(f,u,a)&&has(u,'C07')&&f.ready(u,'absentFace',3))heal(f,u,t,.25*f.stats(u).A,'Absent Face');},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&f.value(t,'hit')<0&&has(u,'A07')){u.kit.blackBasics=(u.kit.blackBasics||0)+1;if(u.kit.blackBasics%4===0)u.kit.blackSignature=.4*f.stats(u).A;}},
 cast(f,u,c){
  if(c.s.name==='Blot Flick'){const reduced=f.value(c.t,'hit')<0;c.hit((1.2+(reduced&&has(u,'A04')?.3:0))*c.A+spend(u,'blackSignature')+spend(u,'sparePaper'));if(c.results[0]?.hit){buff(f,u,c.t,'Blot Flick','hit',-15,has(u,'A02')?4:3,{harmful:true});if(has(u,'C02'))for(const t of f.nearby(u,c.t,24,3,c.t).filter(t=>t!==c.t).slice(0,2))buff(f,u,t,'Spreading Blot','hit',-7.5,has(u,'A02')?4:3,{harmful:true});}return true;}
  if(c.s.name==='Dripping Double'){if(!has(u,'B08'))c.hit(.9*c.A);c.deploy('ink-double',doubleAssignment(f,u));return true;}
  if(c.s.name==='Erase the Face'){if(has(u,'A08'))buff(f,u,c.t,'Nothing Left to See:'+u.id,'nothingLeft',.45,4,{harmful:true});else c.hit((2.8+(c.hp(c.t)<.4&&has(u,'A05')?.5:0))*c.A,{penetration:has(u,'A03')&&f.value(c.t,'hit')<0?.08:0});if(has(u,'A08')||c.results[0]?.hit)for(const t of has(u,'C06')?f.nearby(u,c.t,18,3,c.t):[c.t])buff(f,u,t,'Erase the Face','hit',-25,3,{harmful:true});return true;}
 }
});
function watching(f,u,start=false){const tr=f.trainer(u);if(!alive(tr)||!alive(u)||!start&&u.kit.watching)return;if(!start)u.kit.watching=true;ward(f,u,tr,(start?.05:.1)*u.maxHp,4,'Still Watching');buff(f,u,u,'Still Watching','dr',start?.075:.15,3);if(has(u,'B06'))buff(f,u,u,'Watching Fury','basicTempo',.2,4);if(!start&&has(u,'C08')&&has(u,'A07'))heal(f,u,tr,.4*f.stats(u).A,'Guardian of the Last Light');}
register('moongolem',{
 stillWatching(){return true;},
 start(f,u){if(has(u,'A01'))watching(f,u,true);},
 departed(f,u){if(has(u,'C07')&&!u.kit.buriedPromise&&alive(f.trainer(u))){u.kit.buriedPromise=true;ward(f,u,f.trainer(u),.06*u.maxHp,3,'Buried Promise');}},
 death(f,u,a,t){if(!has(u,'C08')&&t!==u&&allies(u,t)&&t.slot>0)watching(f,u);},
 damaged(f,u,a,t,n,s,d){if(a?.side===u.side||d.transfer||d.debt||!alive(t))return;if(has(u,'C08')&&t===f.trainer(u)&&t.hp/t.maxHp<.45)watching(f,u);else if(!has(u,'C08')&&has(u,'A07')&&t!==u&&allies(u,t)&&t.slot>0&&t.hp/t.maxHp<.3)watching(f,u);},
 incoming(f,u,n,a,t,d){return t===f.trainer(u)&&has(u,'C06')&&f.core(u).filter(t=>t.slot>0).length>=2&&d.direct!==false&&!d.dot?n*.94:n;},
 healAmount(f,u,n,source,t,o){return t===f.trainer(u)&&o.primary&&has(u,'A05')&&pool(t,u,'Mortar Memory')?n*1.2:n;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){const e=f.get(u,'Violent Memory');if(e){n+=e.value;if(--e.charges<=0){f.remove(u,e.key);if(has(u,'B05'))f.after(()=>heal(f,u,u,.3*f.stats(u).A,'Memory Feast'));}}}return n;},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(p.label==='Jawbone Check'&&has(u,'A04'))f.after(()=>heal(f,u,u,.02*u.maxHp,'Bone Stitch'));if(p.label==='Holding Hands'&&has(u,'C05'))f.after(()=>heal(f,u,t,.25*f.stats(u).A,'A Hand to Mend'));},
 landed(f,u,a,t){if(allies(u,a)&&a!==u){const e=f.get(t,'Marked Bones');if(e?.source===u.id&&!e.used[a.id]){e.used[a.id]=true;f.proc(u,t,.15*f.stats(u).A,'melee','Marked Bones');if(a===f.trainer(u)&&has(u,'C04'))heal(f,u,u,.2*f.stats(u).A,'Remembered Hit');}}},
 gate(f,u,c){if(c.s.name==='Oath of Bones'&&has(u,'A08'))return c.trainerGate();},
 cast(f,u,c){
  if(c.s.name==='Jawbone Check'){const shielded=c.startShield>0||has(u,'B08')&&(u.kit.recentMemory??-Infinity)>=f.battle.time-3;c.hit((1.15+(shielded&&has(u,'B01')?.3:0)+(has(u,'B08')?.65:0))*c.A+spend(u,'oathStrike'));if(!has(u,'B08'))c.selfward((has(u,'A02')?.06:.04)*c.H,has(u,'A02')?3:2);if(c.results[0]?.hit){if(shielded&&has(u,'B04'))buff(f,u,c.t,'Chipped Enemy','physicalExposure',.06,3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Marked Bones','markedBones',.15*c.A,3,{harmful:true,used:{}});}return true;}
  if(c.s.name==='Mortar Memory'){const other=c.other.find(t=>t.slot>0&&t.hp<t.maxHp),split=has(u,'C01')&&other;c.heal(u,(split?.04:.08)*c.H);if(split)c.heal(other,.04*c.H);c.shield(c.tr,.04*c.H);if(has(u,'A03'))heal(f,u,c.tr,.25*c.A,'Mortar of Mercy');if(has(u,'B02'))buff(f,u,u,'Violent Memory','violentMemory',.25*c.A,75,{charges:2});u.kit.recentMemory=f.battle.time;return true;}
  if(c.s.name==='Oath of Bones'){const duration=has(u,'A06')?4:3;if(has(u,'A08'))c.shield(c.tr,.12*c.H,duration);else c.guard(.3,duration,.45);c.dr(.1,duration,'physicalDR');if(has(u,'A06'))buff(f,u,u,'Held Oath','healReceived',.15,duration);if(has(u,'B03'))u.kit.oathStrike=.4*c.A;if(has(u,'C03'))ward(f,u,c.other.find(t=>t.slot>0),.03*c.H,3,'Holding Hands');u.kit.recentMemory=f.battle.time;return true;}
 },
 afterCast(f,u,c){if(c.u===u&&c.primary?.kind==='damage'&&has(u,'B07')){u.kit.presentAnger=(u.kit.presentAnger||0)+1;if(u.kit.presentAnger%3===0)ward(f,u,u,.4*c.A,3,'Present Anger');}}
});
function liningGrant(f,u){const tr=f.trainer(u),amount=.65*f.stats(u).M*(has(u,'A08')?.7:1);ward(f,u,tr,amount,3,'Soul Lining');if(has(u,'C01'))ward(f,u,f.others(u).find(t=>t.slot>0),amount*.5,3,'Far Lining');if(has(u,'A07'))buff(f,u,u,'A Lining for Blades','physicalDR',.15,3);}
register('ochrewisp',{
 soulLining(){return true;},
 incoming(f,u,n,a,t,d){return t===u&&d.direct!==false&&!d.dot&&d.category==='magic'?n*(has(u,'A01')?.78:.85):n;},
 damaged(f,u,a,t,n,s,d){if(t===u&&a?.side!==u.side&&d.active&&d.category==='magic'&&!d.proc&&!d.transfer&&!d.debt&&(has(u,'A08')?f.ready(u,'liningCD',6):!u.kit.lining)){u.kit.lining=true;liningGrant(f,u);}},
 outgoing(f,u,n,a,t,d){
  if(d.active&&d.primary){const key=(d.category==='magic'?'Hinge Hex:':'Warning Hinge:')+u.id,e=f.remove(a,key);if(e){n*=1-e.value;if(key.startsWith('Hinge Hex:')&&has(u,'A04'))f.after(()=>heal(f,u,u,.25*f.stats(u).M,'Hinge Shelter'));if(has(u,'C04')&&allies(u,t))f.after(()=>ward(f,u,t,.25*f.stats(u).M,3,'Forewarned Friend'));}}
  if(a===u&&d.basic){const e=f.get(u,'Shadow Under the Lid');if(e){n+=e.value;if(--e.charges<=0)f.remove(u,e.key);}if(has(u,'B06')&&u.shield>0&&((u.kit.talentBasics||0)+1)%3===0)n+=.35*f.stats(u).M;}return n;
 },
 healAmount(f,u,n,source,t,o){if(!o.primary)return n;if(t===u&&has(u,'A05')&&pool(u,u,'Close the Lid'))n*=1.2;if(t===f.trainer(u)&&has(u,'C05')&&pool(t,u,'A Lid for Another'))n*=1.15;return n;},
 hitBonus(f,u,n,a){return a===f.trainer(u)&&has(u,'C05')&&pool(a,u,'A Lid for Another')?n+20:n;},
 broken(f,u,a,t,p){if(t===u&&p.source===u.id&&p.label==='Close the Lid'&&has(u,'B05'))f.after(()=>{if(alive(u))f.proc(u,a,.4*f.stats(u).M,'magic','Lid Splinters');});},
 expired(f,u,t,p){if(p.source===u.id&&t===f.trainer(u)&&has(u,'C07')&&t.hp<t.maxHp&&f.ready(u,'kindlyReminder',3))heal(f,u,t,.2*f.stats(u).M,'Kindly Reminder');},
 cast(f,u,c){
  if(c.s.name==='Hinge Hex'){const exposed=f.value(c.t,'magicExposure')>0;c.hit((1.15+(has(u,'B01')?.25:0))*c.M+spend(u,'unfriendlyInterior')+spend(u,'hexBank'));if(c.results[0]?.hit){buff(f,u,c.t,'Hinge Hex:'+u.id,'hingeHex',.12,has(u,'B07')?5:3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Warning Hinge:'+u.id,'warningHinge',.1,3,{harmful:true});if(has(u,'B01'))buff(f,u,c.t,'Heavier Hex','magicExposure',.04,3,{harmful:true});if(exposed&&has(u,'B04'))heal(f,u,u,.25*c.M,'Hinge Hunger');}if(has(u,'A02'))ward(f,u,u,.3*c.M,3,'Padded Hinge');return true;}
  if(c.s.name==='Close the Lid'){const n=c.selfward((.1+(has(u,'A03')?.03:0))*c.H+.6*c.M,has(u,'A03')?4:3);if(has(u,'B08')){const p=pool(u,u,c.s.name);if(p){p.amount=Math.max(0,p.amount-n*.5);u.kit.hexBank=Math.min(1.3*c.M,n*.5);f.syncShield(u);}}if(has(u,'B02'))buff(f,u,u,'Shadow Under the Lid','shadowLid',.25*c.M,75,{charges:2});if(has(u,'C03'))ward(f,u,c.tr,.35*c.M,3,'A Lid for Another');return true;}
  if(c.s.name==='Safe Inside'){const other=c.other.find(t=>t.slot>0),duration=has(u,'A06')?4:3;
   if(has(u,'C08')){c.sharedShield(c.all,(1.8+(has(u,'C06')&&other?.hp>0?.4:0))*c.M+.04*c.H,4);}
   else{c.heal(u,.08*c.H);const amount=(1.2+(has(u,'A06')?.4:0))*c.M,split=has(u,'C06')&&other?.hp<other?.maxHp;c.shield(c.tr,amount*(split?.5:1),duration);if(split)c.shield(other,amount*.5,duration);}if(has(u,'B03'))u.kit.unfriendlyInterior=.45*c.M;return true;
  }
 }
});
function plateMemory(f,u,t,forced=false){const e=f.get(u,'Remembered attacker');if(has(u,'A08')&&!forced&&e&&e.target!==t.id&&e.lockedUntil>f.battle.time)return;buff(f,u,u,'Remembered attacker','memory',1,has(u,'A08')?5:has(u,'A01')?4:2,{target:t.id,lockedUntil:has(u,'A08')?(forced||!e||e.target!==t.id?f.battle.time+5:e.lockedUntil):0});}
register('cindercentipede',{
 overlappingPlates(){return true;},
 incoming(f,u,n,a,t,d){if(t===u&&d.direct!==false&&!d.dot&&a?.side!==u.side&&(f.get(u,'Remembered attacker')?.target===a.id||u.kit.setPlates)){u.kit.setPlates=false;n*=has(u,'A08')?.75:.88;if(has(u,'C07'))u.kit.safetyMemory=Math.min(3,(u.kit.safetyMemory||0)+1);}return n;},
 damaged(f,u,a,t,n,s,d){if(t===u&&a?.side!==u.side&&d.direct!==false&&!d.dot&&!d.transfer&&!d.debt)plateMemory(f,u,a);},
 healAmount(f,u,n,source,t,o){return t===u&&source!==u&&allies(u,source)&&o.primary&&has(u,'A05')&&f.has(u,'Firebrick Curl')?n*1.2:n;},
 expired(f,u,t,p){if(p.source===u.id&&p.label==='Firm Ram'&&has(u,'A04'))heal(f,u,u,.02*u.maxHp,'Ram Stitch');},
 hitBonus(f,u,n,a,t){return allies(u,a)&&f.get(t,'Ringing Order')?.source===u.id?n+20:n;},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){const e=f.get(u,'Bricks for Fists');if(e){n+=e.value;if(--e.charges<=0){f.remove(u,e.key);if(has(u,'B05'))f.after(()=>heal(f,u,u,.3*f.stats(u).A,'Searing Appetite'));}}}if(a===f.trainer(u)&&d.active&&d.primary&&has(u,'C06')){const p=pool(a,u,'Shared Bricks');if(p&&!p.tempered){p.tempered=true;f.after(()=>f.proc(u,t,.25*f.stats(u).A,'melee','Tempered Ally'));}}return n;},
 offenseConsumed(f,u,a,t,e){if(e.source===u.id&&e.key==='Weakened basic'&&has(u,'C04')&&allies(u,t))f.after(()=>ward(f,u,t,.25*f.stats(u).A,3,'Dull Rebound'));},
 missed(f,u,a,t,d){if(a===u&&d.basic)u.kit.memoryBasics=0;},
 landed(f,u,a,t,r,d){if(a===u&&d.basic&&has(u,'B07')){u.kit.memoryBasics=u.kit.memoryTarget===t.id?(u.kit.memoryBasics||0)+1:1;u.kit.memoryTarget=t.id;if(u.kit.memoryBasics>=3){u.kit.memoryBasics=0;plateMemory(f,u,t,true);}}if(a===f.trainer(u)&&d.active&&has(u,'C05')){const e=f.get(t,'Ringing Order');if(e?.source===u.id&&!e.returned){e.returned=true;f.proc(u,t,.25*f.stats(u).A,'melee','Order Returned');}}},
 gate(f,u,c){if(c.s.name==='Firebrick Curl'&&has(u,'C08'))return c.hp(c.tr)<.9||c.threat(c.tr);if(c.s.name==='Firebrick Curl'&&has(u,'B08'))return alive(c.t);},
 cast(f,u,c){
  if(c.s.name==='Kiln Ram'){const memory=f.get(u,'Remembered attacker')?.target===c.t.id,exposed=f.value(c.t,'physicalExposure')>0;c.hit((1.35+(memory?(has(u,'B01')?.5:.25):0)+(memory&&exposed&&has(u,'B04')?.25:0))*c.A+spend(u,'burntFirebricks'));if(c.results[0]?.hit){if(memory&&has(u,'A02'))ward(f,u,u,.3*c.A,3,'Firm Ram');if(has(u,'A08'))plateMemory(f,u,c.t,true);if(has(u,'C02'))buff(f,u,c.t,'Weakened basic','basicWeakness',.2,3,{harmful:true});}return true;}
  if(c.s.name==='Firebrick Curl'){const t=has(u,'C08')?c.tr:u,amount=(.06+(has(u,'A03')?.03:0))*c.H;if(has(u,'B08')){u.kit.burntFirebricks=Math.min(1.2*c.A,amount);buff(f,u,u,'Burn the Firebricks','basicTempo',.15,3);}else c.heal(t,amount);buff(f,u,t,'Firebrick Curl','dr',.15,has(u,'A03')?3:2);if(has(u,'A07'))u.kit.setPlates=true;if(has(u,'B02'))buff(f,u,u,'Bricks for Fists','bricksFists',.25*c.A,75,{charges:2});if(has(u,'C01'))ward(f,u,c.tr,(.04+.01*spend(u,'safetyMemory'))*c.H,3,'Shared Bricks');return true;}
  if(c.s.name==='Kiln-Tail Crush'){const memory=f.get(u,'Remembered attacker')?.target===c.t.id;c.hit(2.7*c.A);c.debuff('Armor exposure','physicalExposure',has(u,'B03')?.09:.06,has(u,'B03')?4:3);if(memory&&has(u,'A06'))ward(f,u,u,.45*c.A,3,'Crushing Brace');if(has(u,'B06')){charge(f,u,u,'Ringing Furnace',.35*c.A);buff(f,u,u,'Ringing Furnace aim','nextBasicHit',25,75);}if(c.results[0]?.hit&&has(u,'C03'))buff(f,u,c.t,'Ringing Order','ringingOrder',20,3,{harmful:true});return true;}
 }
});
const spirits=(f,u)=>f.entities.filter(e=>alive(e)&&e.master===u&&e.capGroup==='detached-spirit');
register('lanternslug',{
 threeVoices(){return true;},
 support(f,u,s){if(s.name==='Three-Voice Verdict'&&has(u,'B08'))return true;},
 gate(f,u,c){if(c.s.name==='Three-Voice Verdict'&&has(u,'B08'))return c.wounded(.9)||c.wardGate();if(['Unmask the Tricksters','False Smile'].includes(c.s.name)&&has(u,'C08'))return c.s.name==='Unmask the Tricksters'?alive(c.t):c.wardGate(.9);if(c.s.name==='False Smile'&&has(u,'B07')&&(u.casts+1)%3===0&&spirits(f,u).some(e=>e.profile==='guardian-spirit'&&e.hp<e.maxHp))return true;},
 fits(f,u,c){if(['Unmask the Tricksters','False Smile'].includes(c.s.name)&&has(u,'C08'))return true;if(c.s.name==='False Smile'&&has(u,'B07')&&spirits(f,u).some(e=>e.profile==='guardian-spirit'))return true;},
 primary(f,u,n,c,kind){return c.u===u&&u.casts%3===0&&['damage','heal','shield'].includes(kind)?n+.4*c.M:n;},
 entityCap(f,u,id,n){return id==='trickster-spirit'&&has(u,'A08')?1:n;},
 entityCreated(f,u,e){
  if(e.profile==='trickster-spirit'){e.hp=e.maxHp=Math.round((.05+(has(u,'A03')?.02:0))*u.maxHp*(has(u,'A08')?2:1));e.attack=has(u,'A01')?.24:.18;if(has(u,'A08')){e.name='Grande Trickster';e.visualScale=1.4;e.spec.interval=.5;e.spec.maxShots=10;e.until=e.born+5.05;}if(u.casts%3===0&&has(u,'A07'))e.voicePrimer=.15*e.snapshot.M;}
  if(e.profile==='guardian-spirit'){e.heal=has(u,'B01')?.3:.2;if(has(u,'B03'))e.spec.initialShield=.65;}
 },
 entityOutgoing(f,u,n,e,t,o){if(e.profile==='trickster-spirit'){if(e.voicePrimer){n+=e.voicePrimer;e.voicePrimer=0;}if(f.get(t,'Mocked Audience')?.source===u.id){o.magicBypassPoints=.05;if(has(u,'A04')&&!e.punchline){e.punchline=true;n+=.15*e.snapshot.M;}}}return n;},
 entityEnded(f,u,e,reason){if(e.profile==='trickster-spirit'&&reason==='destroyed'&&has(u,'A05')){const t=f.enemies(u).find(t=>t.id===e.targetId);if(alive(t)&&f.battle.distance(e,t)<=e.entityReach)f.proc(u,t,.3*e.snapshot.M,'magic','Last Laugh');}},
 incoming(f,u,n,a,t,d){return t.temporary&&t.master===u&&t.profile==='trickster-spirit'&&d.active&&d.secondary&&has(u,'A03')?n*.8:n;},
 entityPulse(f,u,e){if(e.profile!=='guardian-spirit')return;const t=f.core(u).find(t=>t.id===e.assigned);if(t&&f.battle.distance(e,t)<=e.spec.radius){f.heal(e,t,(e.heal+(e.smileReserve?.2:0))*e.snapshot.M,'Guardian Spirit');e.smileReserve=false;}return true;},
 healAmount(f,u,n,source,t,o){return has(u,'B04')&&pool(t,u,'Kind Mockery')&&(source.temporary&&source.master===u&&source.profile==='guardian-spirit'&&source.assigned===t.id||source===u&&o.guardianDelivery)?n*1.2:n;},
 shield(f,u,g){if(g.source===u&&g.label==='Guardian Spirit'&&has(u,'B03'))g.duration=4;},
 broken(f,u,a,t,p){if(p.source!==u.id)return;if(p.label==='Guardian Spirit'&&has(u,'B05')){const e=spirits(f,u).find(e=>e.profile==='guardian-spirit'&&e.assigned===t.id);if(e&&!e.reserveUsed){e.reserveUsed=true;e.smileReserve=true;}const schedule=u.kit.wornGuardians?.find(e=>e.target===t&&!e.reserveUsed);if(schedule){schedule.reserveUsed=true;schedule.reserve=.2*f.stats(u).M;}}if(p.label==='Personal Chorus'&&has(u,'C05'))f.after(()=>heal(f,u,u,.25*f.stats(u).M,'Chorus Mend'));},
 outgoing(f,u,n,a,t,d){if(a===u&&d.basic){const e=f.get(u,'Wear the Tricksters');if(e){n+=e.value;if(--e.charges<=0)f.remove(u,e.key);}}return n;},
 cast(f,u,c){
  if(c.s.name==='Polite Mockery'){const reduced=f.value(c.t,'damage')<0;c.hit((1.2+(has(u,'C01')?.25:0)+(has(u,'C04')&&reduced?.3:0))*c.M);c.debuff('Polite Mockery','damage',-.08,has(u,'C01')?3:2);if(c.results[0]?.hit&&has(u,'A02'))buff(f,u,c.t,'Mocked Audience','mockedAudience',.05,3,{harmful:true});if(has(u,'B02'))ward(f,u,c.low,.25*c.M,3,'Kind Mockery');return true;}
  if(['Unmask the Tricksters','False Smile'].includes(c.s.name)){
   c.primary={kind:'deployment',amount:0,target:u};c.logicalDeployment=true;
   if(c.s.name==='Unmask the Tricksters'){if(has(u,'C08'))buff(f,u,u,'Wear the Tricksters','wearTricksters',.24*c.M,75,{charges:5});else for(let i=0;i<(has(u,'A08')?1:2);i++)c.deploy('trickster-spirit');}
   else if(has(u,'C08')){u.kit.wornGuardians=c.other.map(target=>({target,reserve:0}));for(const entry of u.kit.wornGuardians){const t=entry.target;ward(f,u,t,(has(u,'B03')?.65:.4)*c.M,has(u,'B03')?4:3,'Guardian Spirit');for(const at of [2,4])f.later(u,t,at,()=>{f.heal(u,t,(has(u,'B01')?.3:.2)*c.M+entry.reserve,'Guardian Spirit',{guardianDelivery:true});entry.reserve=0;},{ownerRequired:true});}}
   else{for(const t of c.other)if(!spirits(f,u).some(e=>e.profile==='guardian-spirit'&&e.assigned===t.id))c.deploy('guardian-spirit',{assigned:t});}
   if(has(u,'C03')){buff(f,u,u,'Mask Before Spirits','nextBasic',.2*c.M,75);buff(f,u,u,'Mask Before Spirits tempo','basicTempo',.12,3);}return true;
  }
  if(c.s.name==='Three-Voice Verdict'){if(has(u,'C07'))for(const e of spirits(f,u)){f.despawn(e,'recalled');heal(f,u,u,.2*c.M,'Make Room to Speak');}const list=spirits(f,u),tricksters=list.filter(e=>e.profile==='trickster-spirit').reduce((n,e)=>n+(has(u,'A08')?2:1),0),guardians=list.some(e=>e.profile==='guardian-spirit');if(has(u,'B08'))c.heal(c.low,1.2*c.M);else c.hit((2.45+(has(u,'A06')?.25*Math.min(2,tricksters):0)+(has(u,'C06')&&list.length===0?.6:0))*c.M);c.shield(c.low,(.7+(has(u,'B06')&&guardians?.4:0))*c.M);return true;}
 },
 afterCast(f,u,c){if(c.u!==u||u.casts%3!==0)return;if(c.primary?.kind==='deployment'){ward(f,u,c.tr,(.4+(c.s.name==='False Smile'&&has(u,'B07')?.25:0))*c.M,3,'Three Little Voices');if(c.s.name==='False Smile'&&has(u,'B07'))for(const e of spirits(f,u).filter(e=>e.profile==='guardian-spirit'))heal(f,u,e,.5*c.M,'Three Gentle Voices');}if(has(u,'C02'))ward(f,u,u,.35*c.M,3,'Personal Chorus');}
});
function coils(f,u){return u.kit.coils=(u.kit.coils||[]).filter(e=>e.until>f.battle.time);}
function coilGrant(f,u,cd=true){if(cd&&!f.ready(u,'coilCD',2))return;const list=coils(f,u);if(list.length<(has(u,'B07')?2:1))list.push({born:f.battle.time,until:f.battle.time+(has(u,'B07')?4:3)});}
register('shellsnail',{
 backwardSpiral(){return true;},
 incoming(f,u,n,a,t,d){return t===u&&d.critical&&d.direct!==false&&!d.dot?n*(has(u,'A01')?.7:.8):n;},
 damaged(f,u,a,t,n,s,d){if(t!==u||a?.side===u.side||d.direct===false||d.dot||d.transfer||d.debt)return;if(d.critical)coilGrant(f,u);else if(has(u,'A07')){u.kit.pressureHits=(u.kit.pressureHits||0)+1;if(u.kit.pressureHits%3===0&&f.ready(u,'coilPressure',3))coilGrant(f,u,false);}},
 tick(f,u){for(const e of coils(f,u))if(has(u,'C07')&&!e.patient&&f.battle.time-e.born>=2){e.patient=true;u.kit.spiralPatience=true;}},
 healAmount(f,u,n,source,t,o){return o.primary&&has(u,'A05')&&f.get(t,'Seal the Shell')?.source===u.id?n*1.2:n;},
 broken(f,u,a,t,p){if(p.source===u.id&&p.label==='Fist Behind Shell'&&has(u,'A04'))f.after(()=>heal(f,u,u,.02*u.maxHp,'Coiled Stitch'));},
 hitBonus(f,u,n,a,t){return a!==u&&allies(u,a)&&f.get(t,'Reverse Signal')?.source===u.id?n+20:n;},
 outgoing(f,u,n,a,t,d){const quiet=d.active&&d.primary&&f.remove(a,'Quiet Fist:'+u.id);if(quiet){n*=.88;if(has(u,'C04')&&allies(u,t))f.after(()=>ward(f,u,t,.25*f.stats(u).A,3,'A Quiet Landing'));}if(a===u&&d.basic&&u.kit.sealedAppetite){u.kit.sealedAppetite=false;f.after(()=>{const r=f.proc(u,t,.25*f.stats(u).A,'melee','Sealed Appetite');heal(f,u,u,r.damage||0,'Sealed Appetite',.25*f.stats(u).A);});}return n;},
 landed(f,u,a,t,r,d){if(a===f.trainer(u)&&d.basic&&has(u,'C05')){const e=f.get(t,'Reverse Signal');if(e?.source===u.id&&!e.returned){e.returned=true;f.proc(u,t,.2*f.stats(u).A,'melee','Return to Shelter');}}},
 gate(f,u,c){if(c.s.name==='Seal the Shell'&&has(u,'C08'))return c.hp(c.tr)<=.85;},
 cast(f,u,c){
  if(c.s.name==='Seal the Shell'){const t=has(u,'C08')?c.tr:u;c.heal(t,(has(u,'A03')?.11:.08)*c.H*(has(u,'B08')?.5:1));buff(f,u,t,'Seal the Shell','physicalDR',.15,has(u,'A03')?3:2);if(has(u,'B03'))coilGrant(f,u);if(has(u,'B05'))u.kit.sealedAppetite=true;if(has(u,'C01')){ward(f,u,c.tr,(.03+(u.kit.spiralPatience?.02:0))*c.H,3,'Shared Seal');u.kit.spiralPatience=false;}return true;}
  const fist=c.s.name==='Spiral Fist',list=coils(f,u),spent=list.splice(0,!fist&&has(u,'B08')?list.length:Math.min(1,list.length)).length;
  if(spent&&has(u,'A08')){heal(f,u,u,.04*c.H,'Seal Every Turn');const e=f.get(has(u,'C08')?c.tr:u,'Seal the Shell');if(e)e.until=Math.min(f.battle.time+4,e.until+1);}
  const bonus=(has(u,'A08')?0:has(u,'B01')?.55:.35)*spent*c.A+(!fist&&has(u,'B08')?.35*spent*c.A:0);c.hit((fist?1.35:2.8)*c.A+bonus,{hitBonus:fist&&spent&&has(u,'B02')?25:0});
  if(fist){if(spent&&has(u,'A02'))ward(f,u,u,.3*c.A,3,'Fist Behind Shell');if(c.results[0]?.hit){if(spent&&has(u,'B04'))buff(f,u,c.t,'Spiral Dent','physicalExposure',.06,3,{harmful:true});if(has(u,'C02'))buff(f,u,c.t,'Quiet Fist:'+u.id,'quietFist',.12,3,{harmful:true});}}
  else{if(spent&&c.results[0]?.hit)buff(f,u,c.t,'Armor exposure','physicalExposure',has(u,'B06')?.09:.05,has(u,'B06')?4:3,{harmful:true});if(spent&&has(u,'A06'))ward(f,u,u,.04*c.H,3,'Reverse Cover');if(c.results[0]?.hit&&has(u,'C03'))buff(f,u,c.t,'Reverse Signal','reverseSignal',20,3,{harmful:true});}
  if(spent&&has(u,'C06'))ward(f,u,f.lowest(u,c.other),.25*c.A,3,'Coil for Another');return true;
 }
});
function departed(f,u,a,d){if(f.battle.monsterRules===1&&!u.temporary&&Object.keys(u.talents||{}).length)definitions[u.type]?.departed?.(f,u,a,d);}
for(const type of Object.keys(prefix))if(!definitions[type])throw Error('Missing companion talent handlers: '+type);
root.BondCompanionTalents={definitions,has,each,change,own,departed};
})(globalThis);
