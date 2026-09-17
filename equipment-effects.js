/* Item event vocabulary. Authored equipment/held handlers register explicitly. */
(function(root){
'use strict';
const definitions={},alive=u=>root.BondCombatEffects.alive(u),time=f=>f.battle.time;
// Existing authored status IDs, including talent variants; no elemental inference.
const DOT_KINDS={burn:new Set(['burn','Little Embers','Mane Burn','Burning Knuckleprints','Scorch Without an End','Solar Appointment','Soot Bite']),bleed:new Set(['Serrated Bleed','Serrated Edge','Serrated Thread','Fresh Wound','Silver Wound','Open Wound','Sharp Succulent']),poison:new Set(['Sap Becomes Venom','Slow Digestion','Stinging Film'])};
function dotKind(key,label){const name=label||String(key).split(':')[0];return Object.keys(DOT_KINDS).find(kind=>DOT_KINDS[kind].has(name))||'other';}
const core=(f,u)=>f.battle.units.filter(v=>v.owner===u.owner&&v.side===u.side&&!v.temporary&&!v.storyMaster&&v.slot<3&&!f.battle.defense);
const allies=(f,u,v)=>!!v&&core(f,u).includes(v),others=(f,u)=>core(f,u).filter(v=>v!==u&&alive(v)),mons=(f,u)=>core(f,u).filter(v=>v.slot>0&&alive(v));
const trainer=(f,u)=>core(f,u).find(v=>v.slot===0),otherMon=(f,u)=>mons(f,u).find(v=>v!==u);
const primary=d=>!!d?.primary&&!d.proc&&!d.item&&!d.transfer&&!d.debt;
const direct=d=>d?.direct!==false&&!d?.dot&&!d?.transfer&&!d?.debt;
const physical=d=>d.category!=='magic',normal=(f,u)=>f.battle.units.find(v=>v.id===u.gear?.normal);
const cast=f=>f.currentCompanionCast||f.currentCast;
const key=(item,suffix='')=>'Item: '+item.name+(suffix?' · '+suffix:'');
function isolated(f,fn){f.itemDepth=(f.itemDepth||0)+1;try{return fn();}finally{f.itemDepth--;}}
function ready(f,g,k,seconds){if((g[k]??-Infinity)>time(f)+1e-8)return false;g[k]=time(f)+seconds;return true;}
function charge(f,g,k,seconds=75,extra={}){return g[k]={until:time(f)+seconds,...extra};}
function peek(f,g,k){return g[k]?.until>time(f)?g[k]:null;}
function take(f,g,k){const e=peek(f,g,k);if(e)delete g[k];return e;}
function put(f,u,t,item,kind,value,seconds,extra={}){
 if(!alive(t))return null;
 const label=key(item,extra.suffix||kind),old=f.get(t,label);
 // Equal named effects have one ledger entry, including copies on different allies.
 if(old&&Math.abs(old.value)>Math.abs(value)){old.until=Math.max(old.until,time(f)+seconds);return old;}
 return isolated(f,()=>f.put(u,t,label,kind,value,seconds,{item:true,...extra}));
}
function ward(f,u,t,amount,seconds,item,extra={}){return isolated(f,()=>f.shield(u,t,amount,seconds,item.name,{item:true,proc:true,key:key(item),...extra}));}
function heal(f,u,t,amount,item,extra={}){return isolated(f,()=>f.heal(u,t,amount,item.name,{item:true,proc:true,...extra}));}
function bonus(f,u,t,amount,category,item,extra={}){if(!alive(t)||amount<=0)return;return isolated(f,()=>f.proc(u,t,amount,category,item.name,{item:true,noCritical:true,guaranteed:true,...extra}));}
function splash(f,u,t,amount,category,item,count=1){for(const v of f.nearby(u,t,12,count+1,t).filter(v=>v!==t).slice(0,count))bonus(f,u,v,amount,category,item,{secondary:true,area:true});}
function buff(f,u,t,item,kind,value,seconds,extra={}){return put(f,u,t,item,kind,value,seconds,{harmful:value<0,...extra});}
function rate(f,u,t,item,value,seconds,extra={}){return buff(f,u,t,item,'itemRate',value,seconds,extra);}
function refund(u,longest,seconds){const list=u.skills.map((id,i)=>({i,cd:root.BondContent.SKILLS[id].cd})).sort((a,b)=>(longest?b.cd-a.cd:a.cd-b.cd)||a.i-b.i);if(list.length)u.cds[list[0].i]=Math.max(0,u.cds[list[0].i]-seconds);}
function slot(c){return c.u.skills.indexOf(c.s.id);}
function slots(g,c,k='slots'){const index=slot(c);if(index<0)return false;g[k]||=[];if(!g[k].includes(index))g[k].push(index);if(g[k].length<3)return false;g[k]=[];return true;}
const damaging=c=>c.s.kind==='hit',support=c=>!damaging(c),defensive=c=>c.receivers.some(r=>r.kind==='heal'||r.kind==='shield')||c.taunted||['guard','cleanse'].includes(c.s.kind);
const healActive=o=>!!o?.active&&!o.item&&!o.talent&&!o.proc;
const ownShield=(u,p)=>p.source===u.id&&!p.item;
const basic=(u,s,d)=>s===u&&primary(d)&&d.basic,active=(u,s,d)=>s===u&&primary(d)&&d.active;
const enemy=(u,s,t,d)=>t===u&&s&&s.side!==u.side&&!d.item&&!d.transfer&&!d.debt;
const hp=u=>u.hp/u.maxHp,stats=(f,u)=>f.stats(u),low=(f,u,except=null)=>f.lowest(u,core(f,u).filter(v=>v!==except));
const personal=u=>(u.pools||[]).filter(p=>p.source===u.id&&p.amount>0);
const dots=(f,t)=>[...Object.values(t.effects||{}),...(t.status?.burn?.until>time(f)?[{...t.status.burn,key:'burn',kind:'dot',dotKind:'burn',category:'magic',value:12,legacyStatus:'burn'}]:[])].filter(e=>e.kind==='dot'&&e.until>time(f));
const hasDot=(f,t,kind)=>dots(f,t).some(e=>(e.dotKind||e.label||e.key).toLowerCase().includes(kind));
const zone=(f,u,t)=>f.zones.some(z=>z.owner===u&&z.until>time(f)&&f.battle.distance({position:z.position||z},t)<=(z.radius||18))||f.entities.some(e=>alive(e)&&e.master===u&&e.structure&&e.spec.radius&&f.battle.distance(e,t)<=e.spec.radius);
function watch(f,u,t,item,suffix,seconds,handlers){return put(f,u,t,item,'itemWatch',0,seconds,{suffix,handlers});}
function enhance(c,item,options){c.itemMods||=[];const mod={item,...options};c.itemMods.push(mod);return mod;}
function prepare(f,u,g,item,c,k,options){if(c.u!==u||!damaging(c))return;const q=take(f,g,k);if(q)return enhance(c,item,typeof options==='function'?options(q):options);}
function onBasic(f,u,t,item,seconds,fn,suffix='next basic'){watch(f,u,t,item,suffix,seconds,{landed:(f,e,s,v,r,d)=>{if(basic(t,s,d)){f.remove(t,e.key);fn(s,v,r,d);}}});}
function nextActive(f,u,t,item,amount,seconds=3,category=null){watch(f,u,t,item,'next active',seconds,{beforeCast:(f,e,c)=>{if(c.u===t&&damaging(c)){f.remove(t,e.key);enhance(c,item,{damage:amount,category});}}});}
function itemDot(f,u,t,item,total,seconds,kind='burn',count=1){
 return isolated(f,()=>{let label=key(item,kind);if(count>1){const list=Object.values(t.effects).filter(e=>e.item&&e.key.startsWith(label)&&e.until>time(f));const index=list.length<count?Array.from({length:count},(_,i)=>i).find(i=>!list.some(e=>e.key===label+i)):null;label=index===null?list.sort((a,b)=>(a.applied||0)-(b.applied||0))[0].key:label+index;}
 return f.dot(u,t,label,total,seconds,'melee',{item:true,harmful:true,dotKind:kind,applied:time(f)});});
}
function sameCast(actor,d){return d.castId||actor.id+':'+(d.basic?'b'+actor.basics:'a'+actor.casts);}
function onceCycle(g,k,actor,d){const id=sameCast(actor,d);g[k]||=[];if(g[k].includes(id))return false;g[k].push(id);return true;}
function register(kind,n,handlers){const id=kind+n;if(definitions[id])throw Error('Duplicate item handler '+id);definitions[id]=handlers;}
function init(f,u){
 u.gear={items:[],normal:null,since:time(f)};
 if(!f.battle.equipmentRules||u.side!==0||u.storyMaster||u.temporary)return;
 const p=f.battle.ownerProfiles[u.ownerIndex]||{},ids=root.BondEquipment.equipped(p,u.instanceId,u.type,u.level);
 u.gear.items=ids.map(id=>{const item=root.BondEquipment.get(id);return {item,state:{},rules:definitions[(item.kind==='held'?'h':'e')+item.number]||{}};});
 if(u.gear.items.length){f.itemUsers||=[];f.itemUsers.push(u);}
}
function own(f,event,u,...args){if(!alive(u)||!u.gear?.items.length||f.itemDepth)return;for(const {item,state,rules} of u.gear.items)rules[event]?.(f,u,state,item,...args);}
function updateNormal(f,u){
 if(!u.gear)return;const old=normal(f,u);if(alive(old))return;
 const next=f.battle.units.filter(v=>alive(v)&&v.side!==u.side&&!v.temporary).sort((a,b)=>f.battle.distance(u,a)-f.battle.distance(u,b)||a.slot-b.slot||a.id.localeCompare(b.id))[0];
 if(next){u.gear.normal=next.id;u.gear.since=time(f);if(old)own(f,'targetChanged',u,old,next);}
}
function start(f,u){if(!f.itemUsers?.length)return;updateNormal(f,u);own(f,'start',u);}
function tick(f,u){if(!f.itemUsers?.length)return;updateNormal(f,u);own(f,'tick',u);}
function watches(f,event,args,amount){for(const t of [...f.battle.units,...f.entities])if(alive(t))for(const e of Object.values(t.effects||{}))if(e.kind==='itemWatch'&&e.until>time(f)){const fn=e.handlers?.[event];if(fn){const result=fn(f,e,...(amount===undefined?args:[amount,...args]));if(amount!==undefined&&result!==undefined)amount=result;}}return amount;}
function each(f,event,...args){
 if(!f.battle.equipmentRules||!f.itemUsers?.length||f.itemDepth||args.some(a=>a?.item===true||a?.options?.item||a?.extra?.item))return;
 if(event==='beforeCast'){const c=args[0];c.itemMods=[];f.itemCasts||={};f.itemCastSlots||={};f.itemCasts[c.itemCastId]=c.itemMods;f.itemCastSlots[c.itemCastId]=slot(c);c.u.itemLastCast=time(f);}
 watches(f,event,args);
 for(const u of f.itemUsers)own(f,event,u,...args);
 if(event==='landed'){const [s,t,r,d]=args;if(d.active&&primary(d))for(const m of f.itemCasts?.[d.castId]||[])if(!m.used){m.used=true;if(m.bonus)bonus(f,s,t,m.bonus,m.bonusCategory||d.category,m.item);if(m.splash)splash(f,s,t,Math.min(d.preMitigation*m.splash,m.cap??Infinity),d.category,m.item,m.count||1);}}
}
function change(f,event,amount,...args){
 if(!f.battle.equipmentRules||!f.itemUsers?.length||f.itemDepth||args.some(a=>a?.item===true||a?.options?.item))return amount;
 amount=watches(f,event,args,amount);
 if(event==='primary'){const [c,kind]=args;if(['heal','shield'].includes(kind))for(const m of c.itemMods||[])amount*=1+(m[kind]||0);}
 if(['outgoing','hitBonus'].includes(event)){const [s,t,d]=args;if(primary(d)&&d.active)for(const m of f.itemCasts?.[d.castId]||[]){if(event==='hitBonus')amount+=m.hit||0;else if(!m.category||m.category===d.category||m.category==='physical'&&physical(d))amount*=1+(m.damage||0);}}
 if(event==='outgoing'){const [s,t,d]=args;if(d.secondary&&d.active&&(f.itemCasts?.[d.castId]||[]).some(m=>m.noSplash)){d.itemSuppressed=true;return 0;}}
 for(const u of f.itemUsers)if(alive(u))for(const {item,state,rules} of u.gear.items)amount=rules[event]?.(f,u,state,item,amount,...args)??amount;return amount;
}
function interval(f,u,base){if(!f.itemUsers?.length)return base;let rate=1;for(const {item,state,rules} of u.gear?.items||[])rate*=rules.rate?.(f,u,state,item)??1;for(const e of Object.values(u.effects||{}))if(e.kind==='itemRate'&&e.until>time(f))rate*=Math.max(.05,1+e.value);return base/Math.max(.05,rate);}
root.BondEquipmentEffects={definitions,register,init,start,tick,each,change,interval,dotKind,
 H:{alive,time,core,allies,others,mons,trainer,otherMon,primary,direct,physical,normal,cast,key,isolated,ready,charge,peek,take,put,ward,heal,bonus,splash,buff,rate,refund,slot,slots,damaging,support,defensive,healActive,ownShield,sameCast,onceCycle,basic,active,enemy,hp,stats,low,personal,dots,hasDot,zone,watch,enhance,prepare,onBasic,nextActive,itemDot}};
})(globalThis);
