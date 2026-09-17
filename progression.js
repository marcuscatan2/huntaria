/* Classic stat formulas, separate from authored class bases and Leadership. */
(function(root){
'use strict';
const C=root.BondContent, ATTRS=['str','agi','vit','int','dex','leadership'];
const ENGINE_LEVEL_CAP=100,PLAYER_LEVEL_CAP=60;
const MAX_COOLDOWN_REDUCTION=.5;
const ELEMENTS=['Water','Fire','Earth','Wind'];
const ELEMENT=Object.fromEntries(Object.entries(C.UNITS).map(([id,u])=>[id,u.element||(id==='druid'?'Earth':id==='mage'?'Fire':'Earth')]));
const threshold=l=>{const n=Math.max(1,Math.min(ENGINE_LEVEL_CAP,l));return 50*(n-1)*n;};
const ENGINE_MAX_XP=threshold(ENGINE_LEVEL_CAP),PLAYER_MAX_XP=threshold(PLAYER_LEVEL_CAP);
const clampXP=x=>Number.isSafeInteger(x)&&x>0?Math.min(ENGINE_MAX_XP,x):0;
const clampPlayerXP=x=>Math.min(PLAYER_MAX_XP,clampXP(x));
const engineLevel=x=>Math.min(ENGINE_LEVEL_CAP,Math.floor((1+Math.sqrt(1+4*clampXP(x)/50))/2));
const level=x=>Math.min(PLAYER_LEVEL_CAP,engineLevel(x));
const instance=(s,id)=>(s.companions||[]).find(m=>m.id===id)||null;
const monLevel=(s,ref)=>{
 if(Array.isArray(s.companions)){const mon=instance(s,ref);if(mon)return level(mon.xp);return Math.max(1,...s.companions.filter(m=>m.type===ref).map(m=>level(m.xp)));}
 return level(s.xp?.[ref]||0);
};
// Trainer and companion progression deliberately share a curve, not a level.
// Normalized profiles always carry trainerXP; missing values are an unmigrated
// level-one input and must never inherit a companion's progress.
const trainerLevel=s=>level(s?.trainerXP||0);
function statBudget(l){let n=48;for(let i=2;i<=Math.min(PLAYER_LEVEL_CAP,l);i++)n+=3+Math.floor(i/5);return n;}
const cost=n=>2+Math.floor((n-1)/10);
function spent(a){let n=0;for(const k of ATTRS)for(let i=1;i<(a[k]||1);i++)n+=cost(i);return n;}
function cleanAttributes(raw,l){const a=Object.fromEntries(ATTRS.map(k=>[k,1]));let left=statBudget(l);for(const k of ATTRS){const v=Number.isInteger(raw?.[k])?Math.max(1,Math.min(99,raw[k])):1;while(a[k]<v&&left>=cost(a[k])){left-=cost(a[k]);a[k]++;}}return a;}
function validAttributes(raw,l){return !!raw&&ATTRS.every(k=>Number.isInteger(raw[k])&&raw[k]>=1&&raw[k]<=99)&&spent(raw)<=statBudget(l);}
const attributes=s=>cleanAttributes(s.attributes,trainerLevel(s));
const multiplier=(attack,defend)=>!ELEMENTS.includes(attack)||!ELEMENTS.includes(defend)?1:ELEMENTS[(ELEMENTS.indexOf(attack)+1)%4]===defend?1.2:ELEMENTS[(ELEMENTS.indexOf(defend)+1)%4]===attack?.8:1;
const stat=n=>Math.max(0,Math.floor(n||0));
function classic(a,level=1){
 const str=stat(a.str),agi=stat(a.agi),vit=stat(a.vit),int=stat(a.int),dex=stat(a.dex);
 return {melee:str+Math.floor(str/10)**2+Math.floor(dex/5),ranged:dex+Math.floor(dex/10)**2+Math.floor(str/5),
  magicMin:int+Math.floor(int/7)**2,magicMax:int+Math.floor(int/5)**2,
  hit:level+dex,flee:level+agi,magicDefense:int+Math.floor(vit/2),hpMultiplier:1+vit/100,
  delayMultiplier:Math.max(.1,1-(4*agi+dex)/1000),castMultiplier:Math.max(0,1-dex/150),healingItemMultiplier:1+vit*.02};
}
function physicalDefense(vit,roll=0){const v=stat(vit);return Math.floor(v*.3)+Math.floor(v*.5)+Math.floor(Math.max(0,Math.min(.999999999,roll))*(Math.max(0,Math.floor(v*v/150)-Math.floor(v*.3)-1)+1));}
const hpRecovery=(hp,vit)=>Math.floor(stat(vit)/5)+Math.max(1,Math.floor(hp/200));
const castTime=(seconds,dex)=>Math.max(0,seconds)*Math.max(0,1-stat(dex)/150);
function derived(type,s,base=C.UNITS[type],enemyLevel=null,legacyMonster=false){
 const trainer=base.role==='Trainer',l=enemyLevel??(trainer?trainerLevel(s):monLevel(s,base.instanceId||type));
 const row=!trainer&&!legacyMonster?root.BondMonsterProgression?.levels[type]?.[Math.max(1,Math.min(100,Math.floor(l)))-1]:null;
 if(row){
  const intrinsic=Object.fromEntries(ATTRS.slice(0,5).map(k=>[k,row[root.BondMonsterProgression.columns.indexOf(k)]]));
  const source=attributes(s),shared=Object.fromEntries(ATTRS.slice(0,5).map(k=>[k,enemyLevel!==null?0:source[k]*source.leadership*.005]));
  const a=Object.fromEntries(ATTRS.slice(0,5).map(k=>[k,intrinsic[k]+shared[k]])),stats=classic(a,l),original=classic(intrinsic,l);
  const powerScale=base.power/C.UNITS[type].power,hpScale=base.hp/C.UNITS[type].hp;
  const melee=(row[6]+stats.melee-original.melee)*powerScale,ranged=(row[6]+stats.ranged-original.ranged)*powerScale;
  const magicRange=[stats.magicMin*powerScale,stats.magicMax*powerScale],factors={melee:melee/base.power,ranged:ranged/base.power,magic:(magicRange[0]+magicRange[1])/2/base.power};
  const farmHP=enemyLevel===null?(root.BondFarm?.bonuses(s).hp||0):0,hp=Math.round(row[5]*hpScale*stats.hpMultiplier/original.hpMultiplier*(1+farmHP)),offense=factors[base.basicCategory];
  return {level:l,element:ELEMENT[type],hp,power:Math.round(base.power*offense),offense,factors,effective:a,intrinsic,stats,magicRange,shared,
   healing:1+stat(a.int)*.01,speed:100/Math.max(.2,base.interval*stats.delayMultiplier),hardDefense:row[7]/100,
   armor:0,cooldown:0,regenPerSecond:hpRecovery(hp,a.vit)/6};
 }
 const source=attributes(s),gear=trainer&&enemyLevel===null&&base.equipment!==false?(root.BondEquipment?.bonuses(s,type,l)||{}):{},a=Object.fromEntries(ATTRS.slice(0,5).map(k=>[k,enemyLevel!==null?0:trainer?source[k]+(gear[k]||0):source[k]*source.leadership*.005])),stats=classic(a,l);
 const hpScale=(1+.04*(l-1))*stats.hpMultiplier,levelOffense=1+.025*(l-1),innate=base.power*levelOffense;
 const magicRange=[innate+stats.magicMin+(gear.matk||0),innate+stats.magicMax+(gear.matk||0)];
 const factors={melee:(innate+stats.melee+(gear.atk||0))/base.power,ranged:(innate+stats.ranged+(gear.atk||0))/base.power,magic:(magicRange[0]+magicRange[1])/2/base.power};
 const offense=factors[base.basicCategory],farmHP=enemyLevel===null?(root.BondFarm?.bonuses(s).hp||0):0,hp=Math.max(1,Math.round(base.hp*hpScale*(1+farmHP)+(gear.hp||0)));
 return {level:l,element:ELEMENT[type],hp,power:Math.round(base.power*offense),offense,factors,effective:a,stats,magicRange,
  healing:levelOffense*(1+stat(a.int)*.01),speed:100/(Math.max(.2,base.interval*stats.delayMultiplier)),
  itemStats:gear,hardDefense:Math.min(.95,(gear.def||0)/100),hardMagicDefense:Math.min(.95,(gear.mdef||0)/100),armor:0,cooldown:0,regenPerSecond:hpRecovery(hp,a.vit)/6,shared:trainer?null:a};
}
for(const [id,u] of Object.entries(C.UNITS)){u.speed=100/u.interval;u.element=ELEMENT[id];}
root.BondProgress={classic,physicalDefense,hpRecovery,castTime,instance,ATTRS,ELEMENT,ELEMENTS,MAX_COOLDOWN_REDUCTION,ENGINE_LEVEL_CAP,PLAYER_LEVEL_CAP,ENGINE_MAX_XP,PLAYER_MAX_XP,multiplier,clampXP,clampPlayerXP,threshold,engineLevel,level,monLevel,trainerLevel,statBudget,cost,spent,cleanAttributes,validAttributes,attributes,derived};
})(globalThis);
