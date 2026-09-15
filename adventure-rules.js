/* Pass18 prototype tuning. Release economy is deliberately not rebalanced here. */
(function(root){
'use strict';
const C=BondContent,TEST_ECHO_OVERRIDE=true,FULL=10000;
for(const type of C.MONSTERS){const u=C.UNITS[type];u.releaseEchoBP=u.echoBP;if(TEST_ECHO_OVERRIDE)u.echoBP=1500;u.starter=type==='emberfox';}
const items={
 leafdraught:{name:'Leaf Draught',icon:'♧',category:'Supplies',price:3,recovery:4500,description:'Between encounters: restore HP to one living trainer or companion, improved by VIT. Cannot revive. No use at full health.'},
 revivalsalve:{name:'Revival Salve',icon:'✚',category:'Supplies',price:6,revive:5000,description:'Between encounters: revive one fallen trainer or companion at 50% maximum HP. Only usable on a fallen target.'}
};
const prices={leafdraught:3,revivalsalve:6,biscuit:15,trailfood:30,battlefood:20};
const bp=n=>Number.isInteger(n)&&n>=0&&n<=FULL?n:FULL;
function health(s,id='trainer'){return bp(id==='trainer'?s.vitality?.trainer:s.vitality?.companions?.[id]);}
function clean(s,raw){return {trainer:bp(raw?.trainer),companions:Object.fromEntries((s.companions||[]).map(m=>[m.id,bp(raw?.companions?.[m.id])]))};}
function setHealth(s,id,value){s.vitality=clean(s,s.vitality);if(id==='trainer')s.vitality.trainer=bp(value);else s.vitality.companions[id]=bp(value);}
function record(s,b){if(!b?.adventure)return;for(const u of b.units.filter(u=>u.side===0&&u.ownerIndex===0)){const id=u.slot===0?'trainer':u.instanceId;if(id&&(id==='trainer'||s.companions.some(m=>m.id===id)))setHealth(s,id,u.hp<=0?0:Math.max(1,Math.min(FULL,Math.round(u.hp/u.maxHp*FULL))));}}
function readiness(s){return !health(s)?'Your trainer has fallen. Enter a city, rest at camp or use a Revival Salve.':'';}
// Fallen companions stay selected in the saved loadout, but are benched until
// revived. This keeps party editing stable while preventing a corpse from
// blocking trainer-only encounters or increasing wild-party scaling.
function deploy(s,team){return team.map((u,slot)=>slot===0||!u||health(s,u.instanceId)>0?u:null);}
function level(m,type,n,regionLevel){if(m.id==='clearing-0')return {emberfox:2,bloomslime:3,stonehorn:5}[type];const source=C.UNITS[type]?.sourceWildLevel;if(Number.isInteger(source))return Math.min(100,source);const base=m.regionIndex===0?4:regionLevel;return Math.min(100,base+m.index*4+n*2);}
function wild(type){const u=C.UNITS[type];return type==='emberfox'?{hp:430,power:32,skillScale:.65,passive:null}:{hp:u.hp,power:u.power,skillScale:1,passive:u.passive};}
// One wild creature must withstand a trainer party without invalidating the
// trainer-only opening. Durability carries most of the modifier so danger rises
// without turning every hit into an abrupt trainer deletion.
function wildScale(partySize){const n=Math.max(1,Math.min(3,Number.isFinite(partySize)?Math.trunc(partySize):1));return {partySize:n,hp:1+(n-1)*.8,power:1+(n-1)*.15};}
function service(map,kind){if(map?.id===BondOpening.start.map&&kind==='sanctuary')return {...BondOpening.camp};if(map?.kind!=='hub')return null;return map.services?.[kind]?{...map.services[kind]}:null;}
function recovery(s,id,item){
 const raw=BondProgress.attributes(s),vit=id==='trainer'?raw.vit:Math.floor(raw.vit*raw.leadership*.005);
 return Math.round(item.recovery*(1+vit*.02));
}
root.BondAdventure={recovery,TEST_ECHO_OVERRIDE,ECHO_BP:1500,FULL,items,prices,health,clean,setHealth,record,readiness,deploy,level,wild,wildScale,xp:level=>300+100*level,service};
})(globalThis);
