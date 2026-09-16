/* Deterministic dummy encounter and event-based party throughput. */
(function(root){
'use strict';
const DURATION=30;
function attach(b){
 const source=b.units.find(u=>u.side===1),position={x:76,y:56};
 const dummy={...source,id:'1-1',slot:1,type:'stonehorn',appearance:'training-dummy',name:'Training Dummy',role:'Dummy',
  hp:1e9,maxHp:1e9,power:0,skills:[],cds:[],passive:null,status:{},shield:0,shieldUntil:0,
  growth:{armor:0,cooldown:0},statRules:false,element:'Neutral',level:1,regenPerSecond:0,
  actionRemaining:9999,moveSpeed:0,position,previousPosition:{...position},moving:false};
 b.units=b.units.filter(u=>u.side===0).concat(dummy);
 b.encounter={kind:'dummy'};
 b.trainingPressure=b.spawnOptions.trainingPressure!==false;
 b.refreshTargets();
}
function step(b){
 if(b.trainingPressure&&b.tick%40===0&&b.time<DURATION){
  const dummy=b.units.find(u=>u.side===1);
  for(const u of b.team(0))b.damage(dummy,u,Math.max(30,Math.round(u.maxHp*.12)),'Training pulse',false,{arenaWide:true});
 }
 if(b.time>=DURATION){b.ended=true;b.winner=null;b.reason='Test complete';b.emit('end',null,null,'Test complete.');}
}
function report(b){
 const seconds=Math.max(0,b.time),rows=b.units.filter(u=>u.side===0).map(u=>({id:u.id,name:u.name,damage:0,healing:0,shield:0}));
 const byId=new Map(rows.map(u=>[u.id,u]));
 for(const e of b.events){const row=byId.get(e.creditActor||e.actor)||byId.get(b.effects?.entities.find(u=>u.id===e.actor)?.master?.id);if(!row)continue;
  if(e.kind==='damage')row.damage+=e.amount||0;
  if(e.kind==='heal')row.healing+=e.amount||0;
  if(e.kind==='shield')row.shield+=e.granted??e.amount??0;
 }
 const total={id:'party',name:'Whole party',damage:0,healing:0,shield:0};
 for(const r of rows)for(const k of ['damage','healing','shield'])total[k]+=r[k];
 for(const r of [total,...rows]){r.dps=seconds?r.damage/seconds:0;r.hps=seconds?r.healing/seconds:0;r.sps=seconds?r.shield/seconds:0;}
 return {seconds,total,rows};
}
root.BondTraining={DURATION,attach,step,report};
})(globalThis);
