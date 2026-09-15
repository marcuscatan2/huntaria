/* Short territorial pursuit. World movement never grants or rerolls an encounter. */
(function(root){
'use strict';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function policy(map,type,actor=null,trainerLevel=1){
 if(map==='clearing-0')return null;
 return {notice:320,speed:150,leash:760,warning:.85};
}
function step(actor,player,dt,{enabled=true,trainerLevel=1,clear=()=>true,move=p=>p}={}){
 const aggressive=policy(actor.habitat?.map,actor.type,actor,trainerLevel);
 const p=aggressive||{notice:320,speed:150,leash:760,warning:.85};enabled=enabled&&!!aggressive;
 dt=Math.max(0,Math.min(.05,dt));actor.mode||='idle';actor.warning||=0;
 const home={x:actor.homeX,y:actor.homeY},range=distance(actor,player);
 if(actor.mode==='idle'&&enabled&&range<p.notice&&clear(actor,player)){actor.mode='alert';actor.warning=p.warning;}
 if(actor.mode==='alert'){actor.warning-=dt;if(!enabled||range>p.notice+120)actor.mode='return';else if(actor.warning<=0)actor.mode='chase';}
 if(actor.mode==='chase'&&(!enabled||distance(actor,home)>p.leash||range>p.leash))actor.mode='return';
 const goal=actor.mode==='chase'?player:actor.mode==='return'?home:null;
 if(goal){const d=distance(actor,goal),k=Math.min(d,p.speed*dt)/(d||1),q=move({x:actor.x+(goal.x-actor.x)*k,y:actor.y+(goal.y-actor.y)*k},actor);
  if(Math.abs(q.x-actor.x)>.001)actor.facingLeft=q.x<actor.x;
  actor.x=q.x;actor.y=q.y;if(actor.mode==='return'&&distance(actor,home)<8){actor.mode='idle';actor.warning=0;}
 }
 return enabled&&actor.mode==='chase'&&distance(actor,player)<58&&clear(actor,player);
}
root.BondWildBehavior={policy,step};
})(globalThis);
