/* Map identity and deterministic scenery placement. No browser or save access. */
(function(root){
'use strict';
// Measured silhouettes, in the 1448 x 1086 source sheets; not nominal grid cells.
const FRAMES={
 nature:[[0,0,354,364],[366,0,718,364],[744,0,1144,364],[1197,0,1448,365],
  [0,368,377,710],[399,373,692,711],[722,376,1092,710],[1094,375,1448,712],
  [0,714,365,1086],[380,721,729,1086],[730,717,1102,1086],[1111,715,1448,1086]],
 ruins:[[0,0,388,337],[392,0,721,355],[722,0,1073,351],[1073,0,1448,341],
  [0,338,364,716],[365,358,730,710],[757,348,1014,715],[1014,351,1448,703],
  [0,716,334,1086],[338,720,724,1086],[724,714,1110,1086],[1110,703,1448,1086]]
};
// identity, canopies, rock formation, settlement remnants, ground cover, hero art.
const rows={
 'clearing-0':['Birch meadows and the old farm',[0,0,2],6,[4,3],'flowers',null],
 'clearing-1':['The overgrown forest gateway',[0,2,2],6,[0,3],'ferns',0],
 'clearing-2':['The standing-stone grove',[3,0,3],6,[10,6],'moss',10],
 'clearing-3':['Buried root galleries',[],10,[0,10],'roots',null],
 'clearing-hub':['The birch village green',[0],6,[4,3],'flowers',null],
 'clearing-boss':['The elder stone circle',[3,0],10,[10,0],'moss',10],
 'brook-0':['The abandoned riverside mill',[1,0],6,[5,2],'reeds',5],
 'brook-1':['The drowned willow road',[1,1,3],10,[3,0],'reeds',null],
 'brook-2':['The river watch and levee',[1,0],6,[1,2],'reeds',1],
 'brook-3':['The ancient springworks',[],6,[2,5],'mineral',null],
 'brook-hub':['The willow water gardens',[1],6,[5,6],'reeds',null],
 'brook-boss':['The sunken river sanctuary',[1,3],6,[2,6],'mosaic',2],
 'hollow-0':['The amber quarry terraces',[4,0],7,[9,11],'heath',null],
 'hollow-1':['The copperleaf pottery works',[4,4,0],7,[9,3],'leaves',9],
 'hollow-2':['The cypress cemetery',[3,3,5],7,[6,11],'moss',null],
 'hollow-3':['The glass-fault kilns',[],7,[9,3],'mineral',null],
 'hollow-hub':['The potters market gardens',[4],7,[9,3],'leaves',null],
 'hollow-boss':['The sandstone monument court',[4],7,[11,9],'heath',11],
 'ruins-0':['The moonlit sculpture gardens',[3,0],6,[6,3],'mosaic',8],
 'ruins-1':['The library beneath the trees',[3,1],6,[7,0],'moss',7],
 'ruins-2':['The fallen celestial observatory',[3],8,[8,11],'mosaic',8],
 'ruins-3':['The buried moonstone vault',[],11,[11,7],'mineral',null],
 'ruins-hub':['The sanctuary cloisters',[3],6,[6,0],'mosaic',null],
 'ruins-boss':['The moonweaver star court',[3],11,[8,11],'mosaic',8],
 'rise-0':['The windmill grasslands',[2,0],8,[4,3],'heath',null],
 'rise-1':['The pine ridge viaduct',[2,2,0],6,[2,0],'ferns',2],
 'rise-2':['The high mountain watch',[2],8,[1,11],'heath',1],
 'rise-3':['The storm-carved chambers',[],9,[11,1],'mineral',null],
 'rise-hub':['The highland signal post',[2],8,[1,4],'heath',null],
 'rise-boss':['The shattered summit shrine',[2],8,[11,1],'heath',11],
 'ashen-0':['The cooled basalt spring',[5,2],9,[9,2],'ash',null],
 'ashen-1':['The orchard returning from ash',[5,5,4],9,[3,9],'ash',null],
 'ashen-2':['The obsidian citadel road',[5],9,[1,3],'ash',1],
 'ashen-3':['The buried thermal works',[],9,[2,9],'mineral',null],
 'ashen-hub':['The reclaimed ash courtyard',[5,4],9,[9,3],'ash',null],
 'ashen-boss':['The broken basalt throne',[5],9,[11,1],'ash',11],
 'ghost-tower-1':['The memorial gallery',[],10,[6,0],'mosaic',6],
 'ghost-tower-2':['The abandoned mortuary library',[],11,[7,3],'mosaic',7],
 'ghost-tower-3':['The astronomers belfry',[],11,[8,11],'mosaic',8],
 'ghost-tower-4':['The rooftop cypress memorial',[3],8,[6,11],'moss',6]
};
const profiles=Object.fromEntries(Object.entries(rows).map(([id,r])=>[id,{identity:r[0],trees:r[1],rock:r[2],ruins:r[3],cover:r[4],hero:r[5]}]));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function appearance(p,atlas,frame,size){Object.assign(p,{sceneryAtlas:atlas,sceneryFrame:frame,size,sway:atlas==='nature'&&frame<6});}
function dress(m,geometry){
 const A=BondAtlas,profile=profiles[m.id];m.landscape=profile;m.scenerySites=[];
 // Preserve existing solid footprints, service IDs and hand-authored opening props.
 for(const p of m.scenery){
  if(p.towerWall||p.cityArt!==undefined)continue;
  const seed=A.hash(p.key+':landscape');
  if(p.key===m.hero.id&&profile.hero!==null){appearance(p,'ruins',profile.hero,m.interior?450:570);continue;}
  if(!/:prop\d|:edge\d|:wall:\d/.test(p.key))continue;
  if(m.interior&&m.towerFloor!==4){
   appearance(p,'nature',profile.rock,145+seed%60);
   continue;
  }
  if(p.art<2||p.key.includes(':edge')){
   const frame=profile.trees.length?profile.trees[seed%profile.trees.length]:profile.rock;
   appearance(p,'nature',frame,(frame<6?350:240)+seed%95);
  }else if(p.art===4||p.art===5||m.kind==='cave')appearance(p,'nature',profile.rock,190+seed%100);
  // Low plants remain small and retain the regional atlas's native palette.
 }
 const allowed=(p,r)=>p.x>r+70&&p.y>r+70&&p.x<m.width-r-70&&p.y<m.height-r-70&&distance(p,m.hero)>600&&!geometry.safeClear(m,p,r)&&!geometry.waterAt(m,p)&&geometry.onFloor(m,p)&&!m.scenery.some(s=>s.solid&&distance(s,p)<s.solid+r+45);
 const place=(anchor,index,group)=>{
  // Search both verges; preserve road mouths, habitats and all service approaches.
  for(const [dx,dy] of [[-350,-50],[350,-50],[-420,220],[420,220],[-450,-240],[450,-240],[-600,80],[600,80]]){
   const p={x:anchor.x+dx,y:anchor.y+dy},frame=profile.ruins[index%profile.ruins.length],radius=group==='ridge'?90:80;
   if(!allowed(p,radius))continue;
   const key=m.id+':landscape:'+group+':'+index;
   m.scenery.push({key,...p,art:4,sceneryAtlas:group==='ridge'?'nature':'ruins',sceneryFrame:group==='ridge'?profile.rock:frame,size:group==='ridge'?510:470,solid:radius,sway:false});
   if(group!=='ridge')m.scenerySites.push({...p,radius:260,seed:A.hash(key)});
   return;
  }
 };
 if(m.kind==='hub'){
  // Building yards and thresholds stay empty; dress only the outer green.
  [{x:370,y:340},{x:m.width-370,y:m.height-420}].forEach((p,i)=>place(p,i,'yard'));
 }else{
  const route=m.roads.find(r=>r.id==='main');
  if(route)for(let i=1;i<route.points.length;i++){
   const a=route.points[i-1],b=route.points[i],length=distance(a,b),count=Math.max(1,Math.floor(length/1200));
   for(let j=0;j<count;j++){const t=(j+.5)/count,anchor={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};place(anchor,i*7+j,(i+j)%3===0?'ridge':'road');}
  }
  place({x:m.hero.x-180,y:m.hero.y+230},0,'court');
  place({x:m.hero.x+200,y:m.hero.y+150},1,'ridge');
 }
 if(profile.hero!==null)m.scenerySites.push({x:m.hero.x,y:m.hero.y,radius:m.interior?300:410,seed:A.hash(m.hero.id)});
 if(m.cemetery||m.towerFloor===4){
  const graveY=m.interior?1050:m.hero.y;
  for(const side of [-1,1])for(const [i,offset] of [[0,420],[1,850]]){
   const p={x:m.hero.x+side*offset,y:graveY+540};
   if(m.roads.some(r=>geometry.pathDistance(p,r.points)<r.width/2+60)||geometry.waterAt(m,p)||m.towerWalls?.some(w=>geometry.segment(p,w.a,w.b)<160))continue;
   m.scenery.push({key:m.id+':memorial-cypress:'+side+':'+i,...p,art:0,sceneryAtlas:'nature',sceneryFrame:3,size:260,solid:32,sway:true});
  }
 }
 // Broken paving belongs to the structure, not to an interaction marker.
 m.theme={...m.theme};
 if(profile.cover==='leaves')Object.assign(m.theme,{ground:'#a39868',shade:'#6f704a',leaf:'#cc803e'});
 if(profile.cover==='moss')Object.assign(m.theme,{ground:m.regionIndex===3?'#647c79':'#789476',light:'#abc29c'});
 if(m.towerFloor)Object.assign(m.theme,[{}, {ground:'#68717b',soil:'#a2a99f'}, {ground:'#66647a',soil:'#aaa09b'}, {ground:'#4c6577',soil:'#9aafb3'}, {ground:'#6d827c',soil:'#b1b8ab'}][m.towerFloor]);
}
function groundPatches(id,left,top,right,bottom){
 const patches=[],step=256,halo=400;
 for(let gy=Math.floor((top-halo)/step);gy<=Math.floor((bottom+halo)/step);gy++)for(let gx=Math.floor((left-halo)/step);gx<=Math.floor((right+halo)/step);gx++){
  const seed=BondAtlas.hash(id+':soil:'+gx+':'+gy),x=gx*step+(seed%step),y=gy*step+((seed>>>9)%step),radius=180+(seed>>>18)%220;
  if(x+radius<left||x-radius>right||y+radius<top||y-radius>bottom)continue;
  patches.push({x,y,radius,seed});
 }return patches;
}
root.BondScenery={FRAMES,profiles,dress,groundPatches};
})(globalThis);
