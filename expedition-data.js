/* Region + route pools. Rarity describes availability, never a power multiplier. */
(function(root){
'use strict';
const TIERS=['Common','Uncommon','Rare','Very rare','Epic','Legendary'],WEIGHTS=[80,10,5,2.5,2,.5];
const definitions={
 clearing:{forest:['emberfox','bloomslime','thornstag','tideotter','lumimoth','cindrake'],cave:['stonehorn','ironback','emberfox','frostfang','cindrake','stormowl']},
 brook:{forest:['tideotter','bloomslime','frostfang','thornstag','lumimoth','stormowl'],cave:['ironback','stonehorn','tideotter','cindrake','frostfang','lumimoth']},
 hollow:{forest:['thornstag','emberfox','bloomslime','frostfang','stormowl','lumimoth'],cave:['frostfang','stonehorn','ironback','emberfox','lumimoth','cindrake']},
 ruins:{forest:['bloomslime','thornstag','lumimoth','tideotter','stormowl','cindrake'],cave:['stonehorn','ironback','lumimoth','frostfang','cindrake','stormowl']},
 rise:{forest:['stormowl','emberfox','thornstag','bloomslime','cindrake','lumimoth'],cave:['cindrake','stonehorn','ironback','stormowl','frostfang','lumimoth']}
};
const POOLS={};
for(const [area,routes] of Object.entries(definitions))for(const [route,ids] of Object.entries(routes)){
 const region=BondWorld.SCENES.findIndex(s=>s.id===area);
 POOLS[area+':'+route]={area,route,tiers:ids.map((type,i)=>({name:TIERS[i],weight:WEIGHTS[i],types:[type]})),coins:[12+region*3+(route==='cave'?3:0),22+region*4+(route==='cave'?5:0)],food:.2,rare:.05,keepsake:.02};
}
function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function pick(pool,rng){
 const tiers=pool.tiers.filter(t=>t.weight>0&&t.types.length),total=tiers.reduce((n,t)=>n+t.weight,0);
 if(!total)throw Error('Empty encounter pool');
 let n=rng()*total;const tier=tiers.find(t=>(n-=t.weight)<0)||tiers.at(-1);
 return {type:tier.types[Math.floor(rng()*tier.types.length)],rarity:tier.name};
}
function make(area,route,seed,level=1,serial=1){
 const pool=POOLS[area+':'+route];if(!pool)return null;
 const rng=random(seed),steps=[];
 // Route always contains one wild and one faction encounter, plus a 60% wild roll.
 const kinds=rng()<.5?['wild','faction',rng()<.6?'wild':'faction']:['faction','wild',rng()<.6?'wild':'faction'];
 for(let i=0;i<3;i++){
  const choice=pick(pool,rng),u=BondContent.UNITS[choice.type],kind=kinds[i];
  const coins=pool.coins[0]+Math.floor(rng()*(pool.coins[1]-pool.coins[0]+1));
  const loot={};if(kind==='faction'){if(rng()<pool.food)loot[rng()<.5?'trailfood':'battlefood']=1;if(rng()<pool.rare)loot.rarecontract=1;if(rng()<pool.keepsake)loot.starseed=1;}
  const e={id:'exp:'+serial+':'+i,area,route,level,rarity:choice.rarity,type:choice.type,title:kind==='wild'?'Catchable wild encounter':'Hollow Seal faction · not catchable',name:kind==='wild'?'Wild '+u.name:'Hollow Seal '+(route==='cave'?'delver':'poacher'),captureRoll:rng(),coins,loot,xp:kind==='wild'?80:120};
  if(kind==='wild')Object.assign(e,{kind:'wild',catchable:true,enemies:[{type:choice.type,hp:Math.round(u.hp*.95),power:Math.round(u.power*.8),skills:[...u.default]}]});
  else{const second=pick(pool,rng).type,trainer=route==='cave'?'mage':'druid';e.team=[trainer,choice.type,second===choice.type?(choice.type==='emberfox'?'stonehorn':'emberfox'):second].map(type=>({type,skills:[...BondContent.UNITS[type].default]}));}
  steps.push(e);
 }
 return {id:serial,area,route,seed:seed>>>0,level,index:0,steps,complete:false};
}
root.BondExpeditionData={POOLS,TIERS,WEIGHTS,random,pick,make};
})(globalThis);
