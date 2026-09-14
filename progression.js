/* Rules v13. Pure formulas; allocation and category scaling are independent. */
(function(root){
'use strict';
const C=root.BondContent, ATTRS=['str','agi','vit','int','dex','leadership'];
const ENGINE_LEVEL_CAP=100,PLAYER_LEVEL_CAP=60;
const DEX_COOLDOWN_RATE=.00667,MAX_COOLDOWN_REDUCTION=.5;
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
function derived(type,s,base=C.UNITS[type],enemyLevel=null){
 const trainer=base.role==='Trainer',l=enemyLevel??(trainer?trainerLevel(s):monLevel(s,base.instanceId||type));
 const source=attributes(s),a=Object.fromEntries(ATTRS.slice(0,5).map(k=>[k,enemyLevel!==null?0:trainer?source[k]-1:source[k]*source.leadership*.005]));
 const hpScale=(1+.04*(l-1))*(1+a.vit*.01),levelOffense=1+.025*(l-1);
 const factors={melee:levelOffense*(1+a.str*.01),ranged:levelOffense*(1+a.dex*.01),magic:levelOffense*(1+a.int*.01)};
 const offense=factors[base.basicCategory],hp=Math.round(base.hp*hpScale);
 return {level:l,element:ELEMENT[type],hp,power:Math.round(base.power*offense),offense,factors,effective:a,
  healing:levelOffense*(1+a.int*.01),speed:100/base.interval*(1+a.agi*.008),
  armor:Math.min(.1,a.vit*.0005),cooldown:Math.min(MAX_COOLDOWN_REDUCTION,a.dex*DEX_COOLDOWN_RATE),regenPerSecond:hp*a.vit*.00002,shared:trainer?null:a};
}
for(const [id,u] of Object.entries(C.UNITS)){u.speed=100/u.interval;u.element=ELEMENT[id];}
root.BondProgress={instance,ATTRS,ELEMENT,ELEMENTS,DEX_COOLDOWN_RATE,MAX_COOLDOWN_REDUCTION,ENGINE_LEVEL_CAP,PLAYER_LEVEL_CAP,ENGINE_MAX_XP,PLAYER_MAX_XP,multiplier,clampXP,clampPlayerXP,threshold,engineLevel,level,monLevel,trainerLevel,statBudget,cost,spent,cleanAttributes,validAttributes,attributes,derived};
})(globalThis);
