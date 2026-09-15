/* Deterministic choreography for the class master's rescue. */
(function(root){
'use strict';
const SCENARIO='class-master-rescue',FALL_TICK=160,FINISH_TICK=280;
function applies(e){return e?.scenario===SCENARIO&&BondContent.CLASSES.includes(e.allyClass)&&[3,7].includes(e.enemies?.length);}
function attach(b){
 const type=b.encounter.allyClass,base=BondContent.UNITS[type],template=b.trainer(0);
 b.units.push({...template,...base,id:'0-master',type,instanceId:null,weapon:undefined,side:0,slot:0,owner:'class-master',ownerIndex:1,
  storyMaster:true,name:base.name+' Master',level:100,hp:base.hp,maxHp:base.hp,healthScale:4,skillScale:2,position:{x:28,y:56},previousPosition:{x:28,y:56},
  skills:[...base.default],cds:[0,0,0],status:{},shield:0,shieldUntil:0,actionRemaining:.5,growth:{},damage:0,healing:0,blocked:0,casts:0});
}
function floor(b,u){
 if(u.storyMaster)return Math.max(1,Math.round(u.maxHp*.4));
 if(u.side===1&&u.boss&&b.tick<FALL_TICK)return 1;
 return 0;
}
function step(b){
 const master=b.units.find(u=>u.storyMaster),boss=b.units.find(u=>u.boss&&u.side===1);
 if(b.tick===80)b.emit('telegraph',boss,null,'The raid leader gathers a ruinous howl. Stay behind me!',0,{warning:4});
 if(b.tick===FALL_TICK){
  for(const u of b.units.filter(u=>u.side===0&&!u.storyMaster&&u.hp>0))b.damage(boss,u,1e9,'Ruinous Howl',false);
  b.emit('phase',master,null,master.name+': Hold on! I will finish this.');
 }
 if(b.tick===FINISH_TICK){
  const label={druid:'Ancient Grove',mage:'Sovereign Flame',hunter:'Hawkeye Volley',swordsman:'Oathkeeper Sweep'}[master.type];
  for(const enemy of b.team(1))b.damage(master,enemy,1e9,label,false);
 }
}
root.BondRaidRules={SCENARIO,FALL_TICK,FINISH_TICK,applies,attach,floor,step};
})(globalThis);
