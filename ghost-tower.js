/* Cemetery entrance and four connected interiors, attached to one atlas square. */
(function(root){
'use strict';
const A=BondAtlas,ENTRANCE='hollow-2',species=['ochrewisp','ashporcupine','thistlehare','echochime'];
const originals=Object.fromEntries(species.map(type=>[type,{...A.home(type)}]));
for(const m of A.maps)m.habitats=m.habitats.filter(h=>!species.includes(h.type));
const entrance=A.get(ENTRANCE);entrance.name='Ghost Tower Entrance';entrance.cemetery=true;
A.REGIONS[2].maps[2]=entrance.name;
for(let floor=1;floor<=4;floor++){
 const id='ghost-tower-'+floor,m={id,name:'Ghost Tower · Floor '+floor+(floor===4?' · Rooftop Cemetery':''),region:'hollow',regionIndex:2,index:floor-1,
  kind:'tower',interior:true,parentMap:ENTRANCE,towerFloor:floor,width:3600,height:3600,level:22+floor*2,entry:{x:420,y:1800},colors:['#50556f','#85879d','#b6c5c3'],
  neighbors:[],habitats:[],obstacles:[],landmarks:[],seed:A.hash(id)};
 A.MAPS[id]=m;A.maps.push(m);
}
const placements=[['ochrewisp',ENTRANCE,22],['ashporcupine','ghost-tower-1',24],['thistlehare','ghost-tower-2',26],['echochime','ghost-tower-3',28],
 ['ochrewisp','ghost-tower-1',23],['ochrewisp','ghost-tower-2',25],['ashporcupine','ghost-tower-3',27],['ochrewisp','ghost-tower-4',28],['ashporcupine','ghost-tower-4',29]];
const used=new Set();
for(const [type,map,level] of placements){
 const source=originals[type],id=used.has(type)?map+':'+type:source.id;used.add(type);
 A.get(map).habitats.push({...source,id,map,level,x:900+A.get(map).habitats.length*1000,y:2300});
}
function layout(m,road){
 m.layoutKind='tower';m.info=m.towerFloor===4?'The rooftop cemetery overlooks Amber Hollow. Tully keeps his silent watch.':'Climb the haunted halls toward the rooftop cemetery.';
 m.theme={...towerTheme(),id:'moonwell'};
 m.hero={id:m.id+':hero',name:m.towerFloor===4?"Tully's memorial":'Hall of the departed',x:1800,y:620,art:8,size:480};
 m.guide={x:480,y:1460};m.cache={x:560,y:2050};m.shelter={x:480,y:2200};
 road(m,'main',[{x:300,y:1800},{x:1800,y:1800},{x:3300,y:1800}],240,'stone');
 road(m,'memorial',[{x:1800,y:1800},{x:1800,y:780}],260,'stone');
 road(m,'circuit',[{x:900,y:1800},{x:900,y:2800},{x:2700,y:2800},{x:2700,y:1800}],220,'stone');
 m.habitats.forEach((h,i)=>{h.x=1000+i*1300;h.y=2500;h.radius=200;road(m,'habitat:'+h.type,[{x:h.x,y:1800},h],180,'stone');});
 m.axisRoutes={horizontal:m.roads[0].points,vertical:[{x:1800,y:300},{x:1800,y:3300}]};
 m.crossings={horizontal:3000,vertical:3000,minSeconds:3000/A.BASE_SPEED};
 m.scenery.push({...m.hero,key:m.hero.id,solid:95});
}
function towerTheme(){return {ground:'#555c70',light:'#a8b9bd',shade:'#34394e',soil:'#8c91a2',stone:'#8997ad',water:'#618daa',deep:'#394c77',accent:'#c3e6ee',sky:'#959fbc',leaf:'#b2c7df'};}
function connect(road){
 const e=A.get(ENTRANCE);e.info='An old cemetery surrounds a four-floor ghost tower. Spirits gather among the memorials.';
 e.hero.name='Ghost Tower';e.hero.art=10;e.hero.size=720;e.cemetery=true;
 const hero=e.scenery.find(p=>p.key===e.hero.id);if(hero)Object.assign(hero,{name:e.hero.name,art:10,cityArt:3,size:720});
 const landmark=e.landmarks.find(l=>l.id===e.hero.id);if(landmark)landmark.name=e.hero.name;
 const link=(a,b,p,q)=>{
  a.neighbors.push({id:a.id+'>'+b.id,to:b.id,...p,arrival:{x:q.x+150,y:q.y},direction:'up',label:b.name,kind:'stairs'});
  b.neighbors.push({id:b.id+'>'+a.id,to:a.id,...q,arrival:{x:p.x-150,y:p.y},direction:'down',label:a.name,kind:'stairs'});
  for(const [m,point] of [[a,p],[b,q]])road(m,'stairs:'+a.id+':'+b.id,[m.roads[0].points[1],point],240,'stone');
 };
 link(e,A.get('ghost-tower-1'),{x:e.hero.x,y:e.hero.y+270},{x:300,y:1800});
 for(let i=1;i<4;i++)link(A.get('ghost-tower-'+i),A.get('ghost-tower-'+(i+1)),{x:3300,y:1800},{x:300,y:1800});
}
root.BondGhostTower={ENTRANCE,species,layout,connect};
})(globalThis);
