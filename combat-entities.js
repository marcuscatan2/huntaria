/* Finite skill-owned entities. Kept outside Battle.units and all encounter/reward ledgers. */
(function(root){
'use strict';
const alive=u=>root.BondCombatEffects.alive(u),R=12;
const profiles={
 'soldier-ant':{name:'Soldier Ant',cap:3,hp:.04,life:6,attack:.12,stat:'A',category:'melee',interval:1,first:.5,reach:R,mobile:true,structure:false},
 'shield-ant':{name:'Shield Ant',cap:1,hp:.12,life:4,intercept:.2,structure:false,trainer:true},
 'stitched-effigy':{name:'Stitched Effigy',cap:1,hp:.06,life:6,link:true,triggers:6},
 stormcap:{name:'Stormcap Totem',cap:1,hp:.08,life:5,pulses:[0,2,4],radius:2*R,attack:.75,splash:.25,category:'magic',stat:'M'},
 kilnling:{name:'Kilnling',cap:1,hp:.08,hpMagic:.6,hpCap:.18,life:5,attack:.2,stat:'M',category:'magic',interval:1.5,first:.5,reach:3*R,intercept:.2,trainer:true,structure:false},
 'light-beacon':{name:'Light Beacon',cap:2,hp:.05,life:5,radius:1.5*R,initialShield:.55},
 'resin-screen':{name:'Resin Screen',cap:1,hp:.2,life:5,screen:true},
 'assault-rune':{name:'Assault Rune',cap:1,hp:.07,life:5,radius:2*R,triggers:4},
 'ward-rune':{name:'Ward Rune',cap:1,hp:.1,life:5,radius:2*R,pulses:[0,2,4],shield:.4},
 'silk-anchor':{name:'Silk Anchor',cap:1,hp:.08,life:5,pulses:[0,1,2,3,4],radius:2*R,attack:.25,initialAttack:1.2,fullSplash:true,category:'magic',stat:'M'},
 'imperial-hearth':{name:'Imperial Hearth',cap:1,hp:0,life:4,pulses:[0,1,2,3],radius:2*R,attack:.6,fullSplash:true,category:'magic',stat:'M',untargetable:true},
 'sapling-warden':{name:'Sapling Warden',cap:2,hp:.1,life:5,attack:.18,stat:'A',category:'melee',interval:1.5,first:.5,reach:R,intercept:.15,structure:false},
 seedjaw:{name:'Seedjaw Turret',cap:1,hp:.07,life:6,attack:.5,stat:'M',category:'magic',interval:1,first:.5,maxShots:6,reach:'owner'},
 'nightlight-cap':{name:'Nightlight Cap',cap:1,hp:.08,life:5,radius:2*R,pulses:[0,2,4],heal:.4,initialAreaShield:.25},
 'ink-double':{name:'Ink Double',cap:1,hp:.08,life:3,lure:true,structure:false},
 'trickster-spirit':{name:'Trickster Spirit',cap:2,capGroup:'detached-spirit',hp:.05,life:5,attack:.18,stat:'M',category:'magic',interval:1,first:.5,maxShots:5,reach:34,mobile:true,structure:false},
 'guardian-spirit':{name:'Guardian Spirit',cap:2,capGroup:'detached-spirit',hp:.05,life:5,initialShield:.4,pulses:[2,4],heal:.2,assignedOnly:true,radius:2*R,structure:false},
 'astral-lens':{name:'Astral Lens',cap:1,hp:.12,life:6,attack:.18,stat:'M',category:'magic',pulses:[1,3,5],reach:'owner'},
 heartwood:{name:'Heartwood',cap:1,hp:.12,life:8,heal:.15,pulses:[1,3,5,7],radius:3*R},
 barkling:{name:'Barkling',cap:1,hp:.08,life:8,attack:.2,stat:'M',category:'magic',interval:2,first:1,reach:R,intercept:.2,structure:false}
};
function legal(f,u,p){
 const field=root.BondGame.FIELD;if(p.x<field.minX+2||p.x>field.maxX-2||p.y<field.minY+2||p.y>field.maxY-2)return false;
 if(f.battle.obstacles.some(o=>Math.hypot(p.x-o.x,p.y-o.y)<o.radius+2))return false;
 return ![...f.battle.units,...f.entities].filter(alive).some(v=>Math.hypot(p.x-v.position.x,p.y-v.position.y)<3);
}
function placement(f,u,p,options={}){
 let anchor=options.assigned?.position||u.position;const enemy=options.anchor;
 if(enemy&&p.radius){const dx=enemy.position.x-u.position.x,dy=enemy.position.y-u.position.y,d=Math.hypot(dx,dy),travel=Math.max(0,Math.min(f.battle.reach(u),d-p.radius*.6));anchor={x:u.position.x+(d?dx/d:0)*travel,y:u.position.y+(d?dy/d:0)*travel};}
 if(p.trainer){const t=f.trainer(u);if(!t)return null;anchor=t.position;}
 if(p.screen){const threat=screenThreat(f,u),t=f.trainer(u);if(!threat||!t)return null;anchor={x:(t.position.x+threat.position.x)/2,y:(t.position.y+threat.position.y)/2};}
 const forward=u.side?-1:1,offsets=p.untargetable?[[0,0]]:[[0,4],[0,-4],[-4*forward,0],[-4*forward,4],[-4*forward,-4],[4*forward,4],[4*forward,-4],[0,8],[0,-8],[-8*forward,0]];
 for(const [dx,dy] of offsets){const point={x:anchor.x+dx,y:anchor.y+dy};if(!p.untargetable&&!legal(f,u,point))continue;
  if(p.lure){const linked=f.enemies(u).find(e=>e.id===options.linked);if(!linked||linked.controlImmune?.includes('lure')||f.battle.distance({position:point},linked)>f.battle.reach(linked))continue;}
  if(enemy&&f.battle.distance({position:point},enemy)>p.radius+.001)continue;
  return point;
 }
 return null;
}
function spawn(f,u,id,options={}){
 const p=profiles[id];if(!p||!alive(u)||f.battle.ended)return null;
 const group=p.capGroup||id,count=f.entities.filter(e=>alive(e)&&e.master===u&&e.capGroup===group).length;
 if(count>=p.cap)return null;
 const position=placement(f,u,p,options);if(!position)return null;
 const stats={...f.stats(u)},hp=Math.max(1,Math.round(Math.min((p.hp||0)*stats.H+(p.hpMagic||0)*stats.M+(options.extraHP||0),p.hpCap?p.hpCap*stats.H:Infinity)*(options.hpMultiplier||1)));
 const b=f.battle,e={id:'entity-'+(++f.sequence),type:u.type,name:p.name,profile:id,capGroup:group,master:u,owner:u.owner,ownerIndex:u.ownerIndex,side:u.side,slot:1000+f.sequence,temporary:true,encounterActor:false,
  snapshot:stats,hp,maxHp:hp,position,previousPosition:{...position},level:u.level,effective:{dex:Math.max(0,stats.hit-u.level),agi:0,vit:0,int:0},
  growth:{armor:0,cooldown:0},statRules:false,structure:p.structure!==false,shield:0,shieldUntil:0,pools:[],effects:{},kit:{},debt:[],status:{},skills:[],cds:[],damage:0,healing:0,blocked:0,
  basicCategory:p.category||u.basicCategory,range:4,entityReach:p.reach==='owner'?b.reach(u):p.reach||R,critChance:0,element:u.element,moveSpeed:u.moveSpeed,
  born:b.time,until:b.time+p.life,next:b.time+(p.first||0),pulseIndex:0,shots:0,triggers:0,untargetable:!!p.untargetable,linked:options.linked||null,assigned:options.assigned?.id||null,
  guards:p.trainer?f.trainer(u)?.id:p.intercept?options.assigned?.id:null,intercept:p.intercept||0,attack:options.attack??p.attack,heal:options.heal??p.heal,parent:options.parent||null,charge:0,contributors:{}};
 if(p.lure)e.lureUntil=b.time+1.5;
 e.targetId=alive(b.target(u))?b.target(u).id:null;f.entities.push(e);
 b.emit('summon',u,e,p.name,0,{entity:e.id,profile:id,temporary:true,until:e.until,position:{...position}});
 if(p.initialShield&&options.assigned)f.shield(u,options.assigned,p.initialShield*stats.M,3,p.name);
 if(p.initialAreaShield)for(const t of covered(f,e))f.shield(u,t,p.initialAreaShield*stats.M,2,p.name);
 if(p.pulses?.[0]===0){pulse(f,e);e.pulseIndex=1;}
 return e;
}
function covered(f,e){const p=profiles[e.profile];return f.core(e.master).filter(u=>!p.radius||f.battle.distance(e,u)<=p.radius+.001);}
function target(f,e){
 const enemies=f.enemies(e),p=profiles[e.profile],ownerTarget=f.battle.target(e.master);
 const legal=enemies.filter(t=>f.battle.distance(e,t)<=e.entityReach+.001);
 // Planted units never chase; mobile summons follow the game's nearest-target rule.
 return legal.find(t=>t===ownerTarget)||legal.sort((a,b)=>f.battle.distance(e,a)-f.battle.distance(e,b)||a.id.localeCompare(b.id))[0]||(p.mobile?[...enemies].sort((a,b)=>f.battle.distance(e,a)-f.battle.distance(e,b)||a.id.localeCompare(b.id))[0]:null);
}
function pulse(f,e,override={}){
 if(!alive(e)||!alive(e.master)||f.battle.ended)return;const p=profiles[e.profile],b=f.battle;
 if(p.attack&&p.radius){
  const enemies=f.nearby(e,e,p.radius,3,b.target(e.master));
  for(let i=0;i<enemies.length;i++){
   const coefficient=i===0||p.fullSplash?(e.pulseIndex===0?p.initialAttack??e.attack:e.attack):p.splash,amount=coefficient*e.snapshot[p.stat||'M'];
   f.proc(e,enemies[i],amount,p.category,e.name,{area:true,secondary:i>0});
   if(e.profile==='stormcap'&&e.pulseIndex===0)root.BondCombatPassives.spore(f,e.master,enemies[i]);
   if(e.profile==='silk-anchor')f.put(e.master,enemies[i],'Thread','thread',.12,3,{harmful:true});
  }
 }else if(p.attack&&p.pulses){
  const t=target(f,e);if(t){const marked=f.get(t,'Lens mark')?.source===e.master.id,markBonus=marked?(e.master.talents?.MA2===2?.4:e.master.talents?.MA2?.25:0):0;
   f.proc(e,t,e.attack*e.snapshot[p.stat||'M']*(1+markBonus)+e.charge,p.category,e.name,{ignoreRange:false,reach:e.entityReach});e.charge=0;e.shots++;}
 }
 const heal=override.heal??e.heal;
 if(heal){const targets=p.assignedOnly?covered(f,e).filter(u=>u.id===e.assigned):covered(f,e),t=f.lowest(e.master,targets.filter(u=>u.hp<u.maxHp));
  if(t){f.heal(e,t,heal*e.snapshot.M+e.charge,e.name);e.charge=0;}
  if(e.profile==='heartwood')root.BondClassTalents?.treePulse(f,e);
 }
 if(p.shield)for(const t of covered(f,e))f.shield(e.master,t,p.shield*e.snapshot.M,2,e.name);
 b.emit('pulse',e.master,e,e.name,0,{entity:e.id,profile:e.profile,temporary:true,radius:p.radius||0});
}
function step(f){
 const b=f.battle;
 for(const e of [...f.entities]){
  if(!alive(e))continue;
  if(!alive(e.master)){f.despawn(e,'owner-death');continue;}
  if(e.parent&&!alive(e.parent)){f.despawn(e,'parent-death');continue;}
  const p=profiles[e.profile];e.previousPosition={...e.position};
  if(p.link){const linked=f.enemies(e).find(u=>u.id===e.linked);if(!linked){f.despawn(e,'link-ended');continue;}f.put(e.master,linked,'Effigy link','healReceived',-.15,.1,{harmful:true});}
  if(e.until<=b.time+1e-8){f.despawn(e,'expired');continue;}
  if(p.radius&&['light-beacon','assault-rune'].includes(e.profile))for(const u of covered(f,e)){
   f.put(e.master,u,e.profile==='light-beacon'?'Beacon aim':'Rune aim','hit',e.profile==='light-beacon'?0:20,.1);
   if(e.profile==='light-beacon')f.put(e.master,u,'Beacon light','basicDamage',.1,.1);
  }
  if(e.profile==='silk-anchor')for(const t of f.nearby(e,e,p.radius,100))f.put(e.master,t,'Crescent Web','basicPenalty',.12,.1,{harmful:true});
  if(e.profile==='imperial-hearth'&&b.distance(e,e.master)<=p.radius)f.put(e.master,e.master,'Hearth shelter','dr',.1,.1);
  if(p.pulses){while(e.pulseIndex<p.pulses.length&&e.born+p.pulses[e.pulseIndex]<=b.time+1e-8&&!b.ended){pulse(f,e);e.pulseIndex++;}continue;}
  if(!p.interval)continue;
  const t=target(f,e);e.targetId=t?.id||null;
  if(p.mobile&&t){const dx=t.position.x-e.position.x,dy=t.position.y-e.position.y,d=Math.hypot(dx,dy);if(d>e.entityReach-.2){const travel=Math.min(d-e.entityReach+.2,e.moveSpeed*8*.05);e.position={x:e.position.x+dx/d*travel,y:e.position.y+dy/d*travel};e.moving=true;}else e.moving=false;}
  if(e.next<=b.time+1e-8){e.next+=p.interval;if(p.maxShots&&e.shots>=p.maxShots)continue;e.shots++;
   if(t&&b.distance(e,t)<=e.entityReach+.001){let amount=e.attack*e.snapshot[p.stat||'M'];let hitBonus=0;
    if(e.profile==='soldier-ant'){if(e.master.targetId===t.id)amount*=1.15;if(f.get(t,'Queen mark')?.source===e.master.id)hitBonus=20;}
    const result=f.proc(e,t,amount,p.category,e.name,{ignoreRange:false,reach:e.entityReach,hitBonus});
    if(e.profile==='seedjaw'&&!e.pollenUsed&&result.hit){e.pollenUsed=true;root.BondCombatPassives.pollen(f,e.master,t);}
   }
  }
 }
 // Presentation retains a short despawn tail; simulation work and memory remain bounded.
 f.entities=f.entities.filter(e=>!e.removed||b.time-e.removedAt<1);
}
function primary(f,u,t,d){
 if(u.temporary||d.proc||!d.primary)return;
 for(const e of f.entities.filter(e=>alive(e)&&e.side===u.side&&e.owner===u.owner)){
  const p=profiles[e.profile];
  if(e.profile==='stitched-effigy'&&e.linked===t.id&&e.triggers<p.triggers&&f.ready(e,'triggerCD',.75)){e.triggers++;f.proc(e,t,.3*e.snapshot.A,'melee','Stitched Effigy');}
  if(e.profile==='assault-rune'&&d.active&&f.battle.distance(e,u)<=p.radius&&e.triggers<p.triggers&&f.ready(e,'triggerCD',1)){e.triggers++;f.proc(e,t,.25*e.snapshot.M,'magic','Assault Rune');}
 }
}
function destroyed(f,e){if(e.profile!=='ink-double')return;for(const t of f.nearby(e,e,1.5*R,3))f.put(e.master,t,'Ink splash','hit',-20,2,{harmful:true});}
function lure(f,actor,target){const e=f.entities.filter(e=>alive(e)&&e.profile==='ink-double'&&e.linked===actor.id&&e.lureUntil>f.battle.time&&e.side!==actor.side&&!e.lureUsed&&f.battle.distance(actor,e)<=f.battle.reach(actor)).sort((a,b)=>a.id.localeCompare(b.id))[0];if(e){e.lureUsed=true;return e;}return target;}
function screenThreat(f,u){const trainer=f.trainer(u);return trainer&&f.enemies(u).find(e=>!e.temporary&&e.delivery==='ranged'&&e.targetId===trainer.id);}
function interceptProjectile(f,actor,target,raw,d){
 if(!d.blockable||d.area||d.arenaWide||d.piercing||d.dot||d.proc||target.temporary)return raw;
 const ax=actor.position.x,ay=actor.position.y,bx=target.position.x,by=target.position.y,dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;
 if(!len2)return raw;
 const screens=f.entities.filter(e=>alive(e)&&e.profile==='resin-screen'&&e.side===target.side&&e.owner===target.owner).map(e=>{const t=((e.position.x-ax)*dx+(e.position.y-ay)*dy)/len2;return {e,t,distance:Math.hypot(e.position.x-ax-t*dx,e.position.y-ay-t*dy)};}).filter(s=>s.t>0&&s.t<1&&s.distance<=R).sort((a,b)=>a.t-b.t||a.e.id.localeCompare(b.e.id));
 if(!screens.length)return raw;const e=screens[0].e,used=Math.min(e.hp,raw);f.loss(actor,e,used,'Resin Screen',{screen:true,direct:false});
 if(d.basic)f.put(e.master,actor,'Clinging Resin','basicPenalty',.1,2,{harmful:true});return Math.max(0,raw-used);
}
root.BondCombatEntities={profiles,spawn,placement,step,pulse,primary,destroyed,lure,screenThreat,interceptProjectile};
})(globalThis);
