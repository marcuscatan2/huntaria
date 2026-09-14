/* Short territorial pursuit. World movement never grants or rerolls an encounter. */
(function(root){
'use strict';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function policy(map,type,actor=null){
 if(actor?.introHostile)return {notice:420,speed:150,leash:760,warning:1.1};
 return map==='clearing-0'&&type==='stonehorn'?{notice:290,speed:135,leash:700,warning:.85}:
  map==='clearing-1'&&type==='tideotter'?{notice:320,speed:175,leash:780,warning:.85}:null;
}
function step(actor,player,dt,{enabled=true,clear=()=>true,move=p=>p}={}){
 const p=policy(actor.habitat?.map,actor.type,actor);if(!p)return false;
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
