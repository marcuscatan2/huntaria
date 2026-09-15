/* Map-wide population leases, distinct from species loot rolls. */
(function(root){
'use strict';
const A=BondAtlas,REVISION=21,distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const connectedGround=new Map();
function connected(m,p){
 let anchors=connectedGround.get(m.id);
 if(!anchors){anchors=[m.entry];connectedGround.set(m.id,anchors);while(connectedGround.size>4)connectedGround.delete(connectedGround.keys().next().value);}
 // Every cached anchor has a proven route to the entry. Short visible connections
 // reuse that proof, avoiding a full-map A* search for every replacement creature.
 const near=[...anchors].sort((a,b)=>distance(a,p)-distance(b,p)).slice(0,12);
 const direct=near.some(a=>BondNav.clear(m.id,a,p,35));
 const route=direct?{ok:true,path:[p]}:BondNav.find(m.id,m.entry,p);
 if(route.ok)for(const q of route.path)if(anchors.length<192&&!anchors.some(a=>distance(a,q)<160))anchors.push(q);
 return route.ok;
}
const keys=h=>Array.from({length:Math.max(3,h.count)},(_,i)=>h.id+':'+i);
function selected(h,spawns,reserved=[]){
 const ids=keys(h),held=new Set(reserved.map(e=>e.spawnId));
 // A saved encounter keeps its exact identity even if it used an old surplus slot.
 const rank=id=>held.has(id)?0:spawns[id]?.activeSlot?1:spawns[id]?.present&&spawns[id]?.locationRevision!==REVISION?2:3;
 return ids.sort((a,b)=>rank(a)-rank(b)||Number(a.split(':').at(-1))-Number(b.split(':').at(-1))).slice(0,h.count);
}
function position(m,id,seed,occupied=[],previous=null,first=false){
 let value=(seed^A.hash(id+':position'))>>>0;
 const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
 const protectedPoints=[...m.neighbors,m.guide,m.cache,m.hero,...Object.values(BondWorld.NPCS).filter(e=>e.map===m.id)].filter(Boolean);
 const valid=p=>BondOpening.groundAllowed(m.id,id,p)&&!A.collision(m.id,p,55)&&!BondWorldLayout.waterAt(m,p)&&
  !protectedPoints.some(q=>distance(p,q)<170)&&!occupied.some(q=>distance(p,q)<180)&&
  (!previous||distance(p,previous)>=900);
 // One reachable introductory resident is guaranteed inside the starter ring.
 // Other starter species reject this ring through their authored difficulty band.
 if(first){
  const phase=value/4294967296*Math.PI*2,golden=2.399963229728653;
  for(let n=0;n<112;n++){
   const radius=430+(n%8)*20,angle=phase+n*golden;
   const p={x:Math.round(BondOpening.start.position.x+Math.cos(angle)*radius),y:Math.round(BondOpening.start.position.y+Math.sin(angle)*radius)};
   if(valid(p)&&connected(m,p))return p;
  }
 }
 // Replacements and species outside the opening band sample the whole map.
 for(let n=0;n<500;n++){
  const p={x:Math.round(200+random()*(m.width-400)),y:Math.round(200+random()*(m.height-400))};
  if(valid(p)&&connected(m,p))return p;
 }
 // Finite fallback over connected authored roads, never spawn inside a wall.
 for(const p of m.roads.flatMap(r=>r.points))if(valid(p)&&connected(m,p))return {...p};
 return null;
}
root.BondPopulation={REVISION,keys,selected,position,total:m=>m.habitats.reduce((n,h)=>n+h.count,0)};
})(globalThis);
