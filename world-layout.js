/* Pass 15 authored world: geometry/art/ecology are separate from spawn rewards. */
(function(root){
'use strict';
const A=BondAtlas,C=BondContent;
const THEMES=[
 {id:'mosslight',ground:'#8eaa69',light:'#c4cf8a',shade:'#638851',soil:'#c4af7c',stone:'#9b9e85',water:'#669d99',deep:'#3a7175',accent:'#f4dc98',sky:'#d4dca7',leaf:'#e4ce80'},
 {id:'willowbrook',ground:'#709b83',light:'#aad0ad',shade:'#527b6f',soil:'#c0b79a',stone:'#8ea6a0',water:'#619fa8',deep:'#3b737f',accent:'#d5edcf',sky:'#c2dad0',leaf:'#a6d5cf'},
 {id:'amber',ground:'#b5a16e',light:'#dbbf83',shade:'#8c8355',soil:'#d3b482',stone:'#b19374',water:'#83a29b',deep:'#536d73',accent:'#ffe0a0',sky:'#e3cbb0',leaf:'#dd995a'},
 {id:'moonwell',ground:'#617d86',light:'#93b2ac',shade:'#465f72',soil:'#a6b5ad',stone:'#8997ad',water:'#618daa',deep:'#394c77',accent:'#c3e6ee',sky:'#959fbc',leaf:'#b2c7df'},
 {id:'windstep',ground:'#9ba785',light:'#d9d7a8',shade:'#7e947e',soil:'#d0c6a1',stone:'#adb6b2',water:'#79abb7',deep:'#557687',accent:'#efeed0',sky:'#c2dbe0',leaf:'#e5d48e'},
 {id:'ashen',ground:'#807770',light:'#a39882',shade:'#5a6060',soil:'#afa18c',stone:'#6c7076',water:'#73aaa8',deep:'#427579',accent:'#e5c99e',sky:'#b2a59b',leaf:'#d0aa8e'}
];
const rows=[
 ['Hollow Oak','A curved farm road, two creek crossings and a garden of first bonds.',[[0,.5],[.18,.47],[.35,.52],[.49,.46],[.66,.51],[.85,.48],[1,.5]],[[.071,.506],[.25,.39],[.5,.605],[.67,.44]],'creek'],
 ['The Fallen Gate','A figure-eight trail beneath split wood and two openings in the canopy.',[[0,.5],[.17,.48],[.3,.34],[.5,.48],[.69,.64],[.86,.5],[1,.5]],[[.13,.43],[.33,.29],[.66,.69],[.85,.45]],'pond'],
 ['Root Cathedral','A crescent of great roots surrounds the ancient reflecting pool.',[[0,.5],[.18,.52],[.35,.65],[.56,.67],[.76,.56],[.88,.48],[1,.5]],[[.12,.46],[.34,.70],[.69,.63],[.85,.4]],'basin'],
 ['Daylight Sinkhole','Root galleries connect a skylit sinkhole and a returning stream path.',[[0,.5],[.16,.48],[.32,.34],[.49,.4],[.67,.62],[.83,.55],[1,.5]],[[.12,.47],[.32,.31],[.67,.65],[.86,.49]],'cave'],
 ['Old Waterwheel','Braided riverbanks meet at a working mill and two timber bridges.',[[0,.5],[.16,.52],[.29,.42],[.47,.46],[.64,.6],[.83,.52],[1,.5]],[[.11,.48],[.29,.37],[.62,.66],[.85,.47]],'creek'],
 ['Willow Tunnel','Follow the river fork under a willow canopy, then loop along the dry bank.',[[0,.5],[.16,.45],[.35,.31],[.54,.39],[.7,.58],[.86,.6],[1,.5]],[[.11,.4],[.34,.28],[.67,.64],[.86,.54]],'creek'],
 ['Reedwatch','A long raised levee branches into reed pockets and exposed river burrows.',[[0,.5],[.18,.43],[.37,.43],[.52,.54],[.7,.45],[.87,.45],[1,.5]],[[.12,.48],[.34,.37],[.65,.4],[.85,.5]],'pond'],
 ['Twin Springs','Two spring chambers share a broad dry gallery and an underground watercourse.',[[0,.5],[.2,.5],[.38,.35],[.54,.35],[.72,.6],[.88,.59],[1,.5]],[[.14,.48],[.38,.30],[.71,.65],[.86,.54]],'cave'],
 ['Amber Ridge','Terraced bends frame a luminous mineral ridge and an optional nesting rise.',[[0,.5],[.18,.49],[.32,.62],[.51,.61],[.67,.39],[.86,.42],[1,.5]],[[.13,.46],[.31,.68],[.68,.33],[.84,.46]],'terrace'],
 ['The Quiet Kiln','A horseshoe trail winds around the kiln and its copperleaf crown.',[[0,.5],[.2,.44],[.3,.29],[.56,.29],[.72,.43],[.82,.55],[1,.5]],[[.12,.43],[.3,.24],[.69,.37],[.84,.60]],'pond'],
 ['Resin Aqueduct','The basin rim leads past a broken aqueduct, thorn island and resin pools.',[[0,.5],[.16,.49],[.31,.66],[.51,.71],[.73,.63],[.87,.48],[1,.5]],[[.12,.44],[.32,.71],[.7,.69],[.86,.43]],'basin'],
 ['Glass Fissure','Two warm chambers connect to a bright sun fissure and a shaded dry gallery.',[[0,.5],[.17,.49],[.32,.63],[.55,.61],[.73,.35],[.87,.41],[1,.5]],[[.12,.46],[.3,.68],[.69,.30],[.86,.46]],'cave'],
 ['Broken Moon Dial','A formal moonlit avenue opens into asymmetrical garden circuits.',[[0,.5],[.21,.5],[.35,.43],[.51,.5],[.68,.43],[.86,.5],[1,.5]],[[.12,.44],[.34,.37],[.64,.38],[.84,.56]],'pond'],
 ['The Lost Library','A bent trail circles the mist basin and its half-swallowed library.',[[0,.5],[.18,.55],[.34,.69],[.54,.65],[.68,.43],[.85,.36],[1,.5]],[[.12,.50],[.32,.75],[.68,.38],[.86,.31]],'basin'],
 ['Fallen Armillary','Concentric stone arcs meet in the court of a tilted observatory.',[[0,.5],[.2,.42],[.37,.33],[.6,.33],[.78,.44],[.87,.55],[1,.5]],[[.13,.37],[.38,.28],[.73,.37],[.86,.62]],'basin'],
 ['The Bell Vault','An asymmetric double loop joins the underground stream and echoing vault.',[[0,.5],[.17,.45],[.34,.34],[.53,.54],[.71,.66],[.86,.6],[1,.5]],[[.11,.4],[.31,.28],[.68,.72],[.86,.54]],'cave'],
 ['The Wind Harp','Broad diagonal grass paths follow the sound of an enormous anchored harp.',[[0,.5],[.18,.54],[.33,.62],[.55,.49],[.73,.35],[.87,.43],[1,.5]],[[.13,.5],[.31,.69],[.69,.3],[.85,.38]],'terrace'],
 ['Skybough Span','Two grounded routes skirt a ravine beneath wind-bent trees.',[[0,.5],[.17,.43],[.31,.32],[.5,.36],[.7,.53],[.86,.6],[1,.5]],[[.11,.38],[.33,.27],[.69,.6],[.86,.66]],'creek'],
 ['The Signal Mast','Broad switchbacks and a sheltered shelf wind toward the summit signal.',[[0,.5],[.16,.47],[.31,.31],[.49,.31],[.62,.61],[.83,.61],[1,.5]],[[.1,.43],[.31,.26],[.62,.66],[.84,.66]],'terrace'],
 ['Daylight Chimney','A ring of mineral sails circles an open shaft and a high-air garden.',[[0,.5],[.18,.54],[.35,.67],[.52,.57],[.67,.33],[.86,.39],[1,.5]],[[.12,.5],[.32,.72],[.66,.28]],'cave'],
 ['The Cool Oasis','Safe braided ridges cross cooled lava toward a living spring garden.',[[0,.5],[.18,.51],[.35,.40],[.53,.39],[.72,.56],[.85,.55],[1,.5]],[[.12,.46],[.32,.34],[.67,.61],[.86,.60]],'creek'],
 ['The Returning Orchard','Fresh shoots mark branching paths between the charred old trunks.',[[0,.5],[.2,.44],[.35,.61],[.53,.68],[.7,.46],[.85,.38],[1,.5]],[[.12,.39],[.32,.66],[.67,.4],[.85,.32]],'pond'],
 ['Cooling Tower','Broken terraces step around a vent basin below the last road warning.',[[0,.5],[.15,.57],[.32,.69],[.54,.70],[.73,.53],[.84,.4],[1,.5]],[[.1,.52],[.31,.75],[.69,.59],[.85,.35]],'terrace'],
 ['The Glass Caldera','A cold-water fault divides two vast chambers at the thermal boundary.',[[0,.5],[.17,.48],[.35,.32],[.53,.38],[.7,.64],[.86,.58],[1,.5]],[[.12,.43],[.31,.27],[.69,.7]],'cave']
];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function segment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function pathDistance(p,points){let d=Infinity;for(let i=1;i<points.length;i++)d=Math.min(d,segment(p,points[i-1],points[i]));return d;}
const length=points=>points.slice(1).reduce((n,p,i)=>n+distance(p,points[i]),0);
const point=(m,x,y)=>({x:x*m.width,y:y*m.height});
function closest(p,points){return points.reduce((a,b)=>distance(p,a)<distance(p,b)?a:b);}
function road(m,id,points,width=190,style='trail'){const out={id,points,width,style};m.roads.push(out);return out;}
const specs={};let revision=22;
for(const m of A.maps){
 m.theme=THEMES[m.regionIndex];m.roads=[];m.water=[];m.rooms=[];m.scenery=[];m.obstacles=[];m.landmarks=[];m.bridges=[];m.neighbors=[];m.layoutRevision=revision;
 if(m.interior){BondGhostTower.layout(m,road);continue;}
 if(m.kind==='hub'){
  BondCities.layout(m,road);
  continue;
 }
 if(m.kind==='boss'){
  const cx=m.width*.56,cy=m.height*.5,radius=920;
  m.info='A compact boss domain reached through the nearby cave. The altar starts a reward-free local group-combat practice.';
  m.layoutKind='domain';m.hero={id:m.id+':hero',name:C.UNITS[m.boss].name+' altar',x:cx,y:cy-220,art:11,size:620};
  m.shelter={x:520,y:cy+360};m.cache={x:520,y:cy+520};m.guide={x:430,y:cy-300};
  const approach=road(m,'main',[{x:80,y:cy},{x:1150,y:cy},{x:cx-radius,y:cy},{x:cx,y:cy}],240,'boss-trail');
  const ring=[];for(let i=0;i<=12;i++){const a=i*Math.PI*2/12;ring.push({x:cx+Math.cos(a)*radius,y:cy+Math.sin(a)*radius*.72});}
  road(m,'arena-ring',ring,260,'boss-ring');road(m,'arena-cross',[{x:cx-radius,y:cy},{x:cx+radius,y:cy}],220,'boss-ring');
  m.axisRoutes={horizontal:approach.points,vertical:[{x:cx,y:cy-radius*.72},{x:cx,y:cy+radius*.72}]};
  m.crossings={horizontal:length(approach.points),vertical:radius*1.44,minSeconds:length(approach.points)/A.BASE_SPEED};
  m.scenery.push({...m.hero,key:m.hero.id,solid:105});m.landmarks=[];
  continue;
 }
 const row=rows[m.regionIndex*4+m.index],[heroName,info,waypoints,spots,kind]=row;
 specs[m.id]={heroName,info,kind};m.info=info;m.layoutKind=kind;
 const main=road(m,'main',waypoints.map(([x,y])=>point(m,Math.max(80/m.width,Math.min(1-80/m.width,x)),y)),210);
 const heroBase=main.points[3];m.hero={id:m.id+':hero',name:heroName,x:heroBase.x,y:heroBase.y-260,art:8+m.index,size:580};
 // Two explicit loops with authored anchoring; no random encounter-page transitions.
 const p1=main.points[1],p2=main.points[3],p3=main.points[5];
 const upper=[p1,point(m,.24,.22+m.index*.027),point(m,.44,.22+m.index*.035),p2];
 const lower=[p2,point(m,.60,.77-m.index*.022),point(m,.80,.77-m.index*.027),p3];
 road(m,'safe-loop',upper,155);road(m,'habitat-loop',lower,155);
 road(m,'north-axis',[point(m,.5,80/m.height),point(m,.48,.22),p2],185);
 road(m,'south-axis',[p2,point(m,.53,.79),point(m,.5,1-80/m.height)],185);
 m.axisRoutes={horizontal:main.points,vertical:[...m.roads[3].points,...m.roads[4].points.slice(1)]};
 m.crossings={horizontal:length(m.axisRoutes.horizontal),vertical:length(m.axisRoutes.vertical),minSeconds:Math.min(length(m.axisRoutes.horizontal),length(m.axisRoutes.vertical))/A.BASE_SPEED};
 m.habitats.forEach((h,i)=>{const q=point(m,...(spots[i]||[.52,.76]));h.x=q.x;h.y=q.y;h.radius=200;road(m,'habitat:'+h.type,[closest(q,main.points),q],140);});
 if(m.id==='clearing-0'){
  const exact=[[750,5100],[2650,3900],[5200,6100],[7000,4400]];
  m.habitats.forEach((h,i)=>{h.x=exact[i][0];h.y=exact[i][1];m.roads.find(r=>r.id==='habitat:'+h.type).points=[closest(h,main.points),{x:h.x,y:h.y}];});
  m.hero.x=4900;m.hero.y=4600;m.hero.size=670;
 }
 m.shelter={x:p1.x+100,y:p1.y+180};m.cache={x:p1.x+150,y:p1.y+80};m.guide={x:main.points[0].x+340,y:main.points[0].y+130};
 road(m,'rest',[p1,m.shelter],150);road(m,'guide',[main.points[0],m.guide],140);
 m.scenery.push({...m.hero,key:m.hero.id,solid:110},
 {key:m.id+':rest',...m.shelter,art:15,size:170,solid:20});
 m.landmarks=[{...m.hero,kind:'hero'},{id:m.id+':lookout',x:p3.x,y:p3.y-180,name:'Trail lookout',kind:'lookout'},
 {id:m.id+':spring',x:p1.x,y:p1.y+310,name:'Sheltered spring',kind:'spring'}];
 for(const l of m.landmarks.slice(1))m.scenery.push({...l,key:l.id,art:l.kind==='spring'?5:15,size:l.kind==='spring'?210:170,solid:0});
 if(m.id==='clearing-0'){
  m.info='Sunlight falls through an old forest. A worn path winds past a deserted camp, a hollow oak and the creek.';
  m.scenery.push(
   {key:m.id+':waking-canopy-a',x:335,y:4700,art:0,size:440,solid:35,sway:true},
   {key:m.id+':waking-canopy-b',x:900,y:4750,art:1,size:410,solid:35,sway:true},
   {key:m.id+':waking-ferns',x:700,y:5350,art:3,size:280,solid:0,sway:true},
   {key:m.id+':old-camp',x:1680,y:4960,art:13,size:250,solid:35},
   {key:m.id+':fallen-stones',x:2120,y:5150,art:4,size:190,solid:32},
   {key:m.id+':young-oak',x:1250,y:5450,art:0,size:330,solid:35,sway:true});
 }
 if(kind==='cave'){
  for(const p of [...main.points.slice(1,-1),...m.habitats,m.hero,m.shelter])m.rooms.push({x:p.x,y:p.y,rx:650,ry:560});
  m.water.push({x:m.width*.53,y:m.height*.48,rx:420,ry:250,kind:'pool'});
 }else if(kind==='basin'){
  m.water.push({x:m.width*.50,y:m.height*.47,rx:m.width*.115,ry:m.height*.08,kind:'pool'});
 }else if(kind==='creek'){
  // A river across the entire map; explicit road crossings become bridges.
  m.water.push({points:[point(m,.41,0),point(m,.45,.25),point(m,.43,.5),point(m,.49,.76),point(m,.45,1)],width:190,kind:'river'});
 }else{
  m.water.push({x:m.width*(.47+m.index*.02),y:m.height*.52,rx:330+m.index*45,ry:200,kind:'pool'});
 }

}
// Every gate lies on the shared border of two adjacent atlas cells.
const ports={west:m=>({x:80,y:m.height/2}),east:m=>({x:m.width-80,y:m.height/2}),north:m=>({x:m.width/2,y:80}),south:m=>({x:m.width/2,y:m.height-80})};
function addGate(m,to,p,arrival,direction){
 m.neighbors.push({id:m.id+'>'+to.id,to:to.id,...p,arrival,direction,label:to.name,kind:to.kind==='hub'?'town':to.kind==='boss'?'boss':to.kind==='cave'?'cave':to.kind==='forest'?'forest':'gate'});
 road(m,'gate:'+to.id,[closest(p,m.roads[0].points),p],200);
}
for(const [aId,bId] of A.GRID_EDGES){
 const a=A.get(aId),b=A.get(bId),dx=b.grid.x-a.grid.x,dy=b.grid.y-a.grid.y;
 if(Math.abs(dx)+Math.abs(dy)!==1)throw Error('Nonadjacent world cells: '+aId+' / '+bId);
 const direction=dx===1?'east':dx===-1?'west':dy===1?'south':'north',opposite={east:'west',west:'east',north:'south',south:'north'}[direction];
 const p=ports[direction](a),q=ports[opposite](b);
 const arrival=(m,v)=>A.clamp(m.id,{x:v.x+(v.x<200?120:v.x>m.width-200?-120:0),y:v.y+(v.y<200?120:v.y>m.height-200?-120:0)});
 addGate(a,b,p,arrival(b,q),direction);addGate(b,a,q,arrival(a,p),opposite);
}
BondGhostTower.connect(road);
function waterAt(m,p){return m.water.some(w=>w.points?pathDistance(p,w.points)<w.width/2:((p.x-w.x)/w.rx)**2+((p.y-w.y)/w.ry)**2<1);}
function bridgeAt(m,p){return m.bridges.some(b=>segment(p,b.a,b.b)<b.width*.46);}
function onFloor(m,p,margin=0){return m.kind!=='cave'||m.rooms.some(r=>((p.x-r.x)/(r.rx-margin))**2+((p.y-r.y)/(r.ry-margin))**2<1)||m.roads.some(r=>pathDistance(p,r.points)<r.width/2-margin);}
function safeClear(m,p,r=80){if(m.towerWalls?.some(w=>segment(p,w.a,w.b)<180+r))return true;if((m.cemetery||m.towerFloor===4)&&Math.abs(p.x-m.hero.x)<1150&&Math.abs(p.y-m.hero.y)<1250)return true;return m.roads.some(q=>pathDistance(p,q.points)<q.width/2+r)||m.habitats.some(h=>distance(h,p)<310)||distance(p,m.entry)<320||distance(p,m.guide)<180||distance(p,m.cache)<130||m.neighbors.some(g=>distance(p,g)<240);}
for(const m of A.maps){
 // Landmark approaches join before dressing/collision, so their paths stay clear.
 m.landmarks.forEach(l=>{if(!m.roads.some(r=>pathDistance(l,r.points)<100))road(m,'landmark:'+l.id,[closest(l,m.roads[0].points),{x:l.x,y:l.y+150}],170);});
 for(const r of m.roads)for(let i=1;i<r.points.length;i++){
  const a=r.points[i-1],b=r.points[i],n=Math.ceil(distance(a,b)/70);
  let start=null;
  for(let j=0;j<=n;j++){const p={x:a.x+(b.x-a.x)*j/n,y:a.y+(b.y-a.y)*j/n},wet=m.water.some(w=>w.points?pathDistance(p,w.points)<w.width*.6:((p.x-w.x)/w.rx)**2+((p.y-w.y)/w.ry)**2<1.1);
   if(wet&&!start)start=p;
   if(start&&(!wet||j===n)){const center={x:(start.x+p.x)/2,y:(start.y+p.y)/2};if(!m.bridges.some(q=>distance(q.a,start)<30&&distance(q.b,p)<30))m.bridges.push({...center,key:m.id+':bridge'+m.bridges.length,a:{x:start.x-(b.x-a.x)/n,y:start.y-(b.y-a.y)/n},b:{x:p.x+(b.x-a.x)/n,y:p.y+(b.y-a.y)/n},width:r.width+45,art:6,size:270});start=null;}
  }
 }
 // Keep openings at every gate and spawn, and add a village green around services.
 if(m.kind==='cave')for(const g of m.neighbors)m.rooms.push({x:g.x,y:g.y,rx:300,ry:300});
 const step=m.kind==='hub'?270:330,count=Math.ceil(m.width/step);
 for(let y=160;y<m.height-100;y+=step)for(let x=130;x<m.width-100;x+=step){
  const seed=A.hash(m.id+':dress:'+x+':'+y),p={x:x+(seed%150)-75,y:y+((seed>>>9)%150)-75};
  if(m.kind==='hub'&&(p.x>320&&p.x<m.width-320&&p.y>300&&p.y<m.height-250)||safeClear(m,p,90)||waterAt(m,p)||!onFloor(m,p))continue;
  const art=(m.kind==='cave'||m.interior)?(seed%3===0?5:4):seed%9<5?seed%4:seed%9===5?4:5;
  m.scenery.push({key:m.id+':prop'+m.scenery.length,...p,art,size:art<2?270+seed%100:art===3?245:art===2?165:140+seed%65,solid:art<2?36:art===4?40:0,sway:art<4});
 }
 // Close-to-path framing without empty roadside gaps.
 for(const r of m.roads.filter(r=>m.kind!=='hub'&&!r.id.startsWith('gate'))){
  for(let j=1;j<r.points.length;j++){const a=r.points[j-1],b=r.points[j],len=distance(a,b),n=Math.floor(len/520);for(let k=1;k<=n;k++){
   const t=k/(n+1),seed=A.hash(m.id+r.id+j+':'+k),sign=k%2?1:-1,p={x:a.x+(b.x-a.x)*t-(b.y-a.y)/len*(r.width/2+180)*sign,y:a.y+(b.y-a.y)*t+(b.x-a.x)/len*(r.width/2+180)*sign};
   if(p.x<90||p.y<90||p.x>m.width-90||p.y>m.height-90||safeClear(m,p,40)||waterAt(m,p)||!onFloor(m,p))continue;
   m.scenery.push({key:m.id+':edge'+m.scenery.length,...p,art:(m.kind==='cave'||m.interior)?4:seed%4,size:m.kind==='cave'?180:230+seed%130,solid:28,sway:m.kind!=='cave'});
  }}
 }
 // Visible rock rims explain cave boundaries without obstructing corridor mouths.
 if(m.kind==='cave')for(const [ri,r]of m.rooms.entries())for(let j=0;j<22;j++){
  const angle=j*Math.PI*2/22,p={x:r.x+Math.cos(angle)*(r.rx+65),y:r.y+Math.sin(angle)*(r.ry+65)};
  if(onFloor(m,p, -28)||p.x<70||p.y<70||p.x>m.width-70||p.y>m.height-70)continue;
  m.scenery.push({key:m.id+':wall:'+ri+':'+j,...p,art:4,size:180+(j%3)*30,solid:0});
 }
 BondScenery.dress(m,{safeClear,waterAt,onFloor,pathDistance,segment});
 // Exact compact collision footprints, not full illustration rectangles.
 m.obstacles=m.scenery.filter(s=>s.solid).filter(s=>!m.habitats.some(h=>distance(h,s)<280)&&!m.neighbors.some(g=>distance(g,s)<180)).map(s=>({id:s.key,x:s.x,y:s.y,radius:s.solid,kind:s.art<4?'tree':'rock'}));
 m.collisionBuckets=new Map();for(const o of m.obstacles){const key=Math.floor(o.x/384)+','+Math.floor(o.y/384);if(!m.collisionBuckets.has(key))m.collisionBuckets.set(key,[]);m.collisionBuckets.get(key).push(o);}
 if(m.kind!=='hub'&&!m.interior)m.entry={x:190,y:m.height/2};
}
function collision(id,p,radius=20){
 const m=A.get(id);if(!m||p.x<55||p.y<55||p.x>m.width-55||p.y>m.height-55||!onFloor(m,p,radius))return true;
 // Every water crossing requires a visible bridge generated from the same road geometry.
 if(waterAt(m,p)&&!bridgeAt(m,p))return true;
 const bx=Math.floor(p.x/384),by=Math.floor(p.y/384);
 for(let y=by-1;y<=by+1;y++)for(let x=bx-1;x<=bx+1;x++)for(const o of m.collisionBuckets.get(x+','+y)||[])if(distance(o,p)<o.radius+radius)return true;
 return false;
}
function safePoint(id,p){
 const m=A.get(id);p=A.clamp(id,p);if(!collision(id,p))return p;
 for(let r=40;r<=1200;r+=40)for(let a=0;a<24;a++){const q=A.clamp(id,{x:p.x+Math.cos(a*Math.PI/12)*r,y:p.y+Math.sin(a*Math.PI/12)*r});if(!collision(id,q))return q;}
 return {...m.entry};
}
const baseValidate=A.validate;
A.validate=()=>[...baseValidate(),...A.maps.flatMap(m=>m.neighbors.filter(g=>collision(m.id,g)||collision(g.to,g.arrival)).map(g=>m.id+' blocked gate '+g.to))];
A.collision=collision;A.safePoint=safePoint;A.LAYOUT_REVISION=revision;
root.BondWorldLayout={THEMES,specs,segment,pathDistance,length,waterAt,bridgeAt,onFloor,safePoint};
})(globalThis);
