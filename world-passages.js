/* Destination-aware passage dressing over existing roads; no collision or save changes. */
(function(root){
'use strict';
const A=BondAtlas,cache=new Map(),outward={north:{x:0,y:-1},east:{x:1,y:0},south:{x:0,y:1},west:{x:-1,y:0}};
function kind(m){
 if(m.kind==='cave')return 'cave';
 if(m.kind==='hub')return 'city';
 if(m.cemetery)return 'cemetery';
 if(m.kind==='boss')return 'domain';
 if(m.kind==='forest')return 'forest';
 if(m.id==='rise-2')return 'mountain';
 if(m.region==='ruins'||m.id==='ashen-2')return 'ruins';
 return 'meadow';
}
const names={cave:'Cave entrance',city:'City gate',cemetery:'Cemetery approach',domain:'Sanctuary approach',forest:'Woodland trail',mountain:'Mountain pass',ruins:'Ruined gateway',meadow:'Open trail'};
function point(p,side,depth){return {x:p.gate.x+p.side.x*side+p.inward.x*depth,y:p.gate.y+p.side.y*side+p.inward.y*depth};}
function forMap(m){
 if(cache.has(m.id))return cache.get(m.id);
 const passages=m.neighbors.filter(g=>g.kind!=='stairs').map(g=>{
  const to=A.get(g.to),type=kind(to),profile=BondScenery.profiles[to.id],normal=outward[g.direction];
  const road=m.roads.find(r=>r.id==='gate:'+to.id),approach=road?.points.slice(0,-1).filter(p=>Math.hypot(p.x-g.x,p.y-g.y)>1)||[];
  const from=approach.at(-1)||m.roads[0].points.filter(p=>Math.hypot(p.x-g.x,p.y-g.y)>1).sort((a,b)=>Math.hypot(a.x-g.x,a.y-g.y)-Math.hypot(b.x-g.x,b.y-g.y))[0];
  const dx=from?from.x-g.x:-normal.x,dy=from?from.y-g.y:-normal.y,len=Math.hypot(dx,dy)||1;
  const p={gate:g,to,type,title:names[type],inward:{x:dx/len,y:dy/len},side:{x:dy/len,y:-dx/len},props:[],stone:['city','cemetery','domain','ruins'].includes(type)};
  const add=(side,depth,atlas,frame,size)=>p.props.push({key:g.id+':passage:'+p.props.length,...point(p,side,depth),art:4,sceneryAtlas:atlas,sceneryFrame:frame,size,passage:true,sway:false});
  for(const sign of [-1,1]){
   if(type==='city'){
    add(sign*265,150,'ruins',1,245);add(sign*340,400,'ruins',3,240);
    add(sign*360,640,'nature',profile.trees[0]??profile.rock,290);
   }else if(type==='cemetery'||type==='domain'||type==='ruins'){
    add(sign*235,120,'ruins',11,180);add(sign*330,330,'ruins',3,260);
    add(sign*380,600,'nature',type==='cemetery'?3:profile.trees[0]??profile.rock,340);
   }else if(type==='cave'||type==='mountain'){
    for(let row=0;row<3;row++)add(sign*(255+row*35),90+row*240,'nature',row&&[8,10].includes(profile.rock)?6:profile.rock,360-row*25);
   }else{
    for(let row=0;row<3;row++)add(sign*(290+row*35),120+row*250,'nature',profile.trees[row%profile.trees.length]??profile.rock,type==='forest'?370-row*20:300-row*30);
    if(type==='meadow')add(sign*215,340,'nature',profile.rock,145);
   }
  }
  p.label=point(p,0,360);p.center=point(p,0,260);
  return p;
 });
 cache.set(m.id,passages);return passages;
}
root.BondPassages={forMap,point,kind};
})(globalThis);
