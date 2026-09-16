/* City places and proximity rules. Stable hub IDs also own their interiors. */
(function(root){
'use strict';
const themes=[
 {id:'druid',title:'The living grove',hall:'Elderbough Hall',shop:'Fern & Flask',annex:'The Conservatory',people:['herbalist','gardener','bard'],names:['Nessa','Tobin','Wren'],pets:['bloomslime','thornstag','emberfox'],lore:['We grow each new room around the tree. The oldest branch is our ceiling.','The little ones nap under the seedlings. Mind where you water.','Every traveler brings a verse. Stay a while and lend me yours.'],exhibits:['The seed archive','A hundred tiny envelopes hold next spring’s woodland.','The listening tree','Someone has tied a ribbon to every branch, each one a wish for a safe return.']},
 {id:'mage',title:'The river academy',hall:'Starfall Library',shop:'The Blue Retort',annex:'The Observatory',people:['librarian','astronomer','alchemist'],names:['Iona','Orren','Saffi'],pets:['lumimoth','stormowl','tideotter'],lore:['The moths illuminate our reading desks. Please turn the pages gently.','The river reflects the stars even when the clouds hide them.','A patient stir makes a better potion than a louder spell.'],exhibits:['Read the open book','A penciled note in the margin reads: “A spell begins with a good question.”','The brass armillary','Its little moons turn around a blue glass world. One has a tiny library painted on it.']},
 {id:'hunter',title:'The woodland lodge',hall:'Wayfarers’ Lodge',shop:'Trail & Tackle',annex:'The Tracking House',people:['ranger','bard','gardener'],names:['Rowan','Pip','Bram'],pets:['frostfang','emberfox','stormowl'],lore:['A good hunter knows when to leave a trail undisturbed.','The lodge keeps a spare chair for anyone caught in the rain.','My companion finds the path. I carry the lunch.'],exhibits:['The trail table','Carved pegs mark streams, shelters and the places where the owls gather.','Inspect the bow rack','Every bow has a different grip. The smallest belongs to the lodge’s oldest scout.']},
 {id:'swordsman',title:'The moonlit kingdom',hall:'Moonwell Keep',shop:'The Silver Anvil',annex:'Knight Training Hall',people:['captain','smith','astronomer'],names:['Captain Elara','Garrick','Aldus'],pets:['ironback','stonehorn','thornstag'],lore:['A knight’s first duty is to bring everyone home. Even the smallest companion.','Ironback waits beside the forge. He likes the warmth more than the ringing.','The old banners honor those who held the bridge until the last traveler crossed.'],exhibits:['Practice at the wooden dummy','You work through a few careful cuts. The straw knight remains an excellent listener.','The hall of banners','Each blue banner carries the name of a village under the keep’s protection.']}
];
const starters=['clearing-hub','brook-hub','hollow-hub','ruins-hub'];
const masterCities={druid:'clearing-hub',mage:'brook-hub',hunter:'hollow-hub',swordsman:'ruins-hub'};
const roomRoles={druid:{merchant:0,annex:1},mage:{merchant:2,annex:1},hunter:{merchant:0,annex:2},swordsman:{merchant:1,annex:0}};
const exhibitAreas={druid:[[6,24,29,37],[62,25,34,44]],mage:[[5,35,26,22],[69,31,28,34]],hunter:[[30,8,43,27],[5,22,20,38]],swordsman:[[69,28,25,31],[24,6,51,20]]};
const spriteNames=['herbalist','gardener','bard','librarian','astronomer','alchemist','ranger','smith','captain'];
function theme(map){return themes[map.regionIndex<4?map.regionIndex:map.regionIndex===4?2:3];}
const quarters={
 'clearing-hub':{name:'Orchard Green',style:'garden',loop:[[1910,1100],[2280,880],[3000,1100],[3030,1910],[2360,2130],[1910,1750]],homes:[[2190,660],[2880,790],[3080,1480],[900,2450],[1600,2790],[2700,2900]],work:[2250,2770],market:[[2080,1460],[2490,1370],[2920,2190]],green:[2490,1800]},
 'brook-hub':{name:'Lantern Quay',style:'canal',loop:[[2060,1000],[2410,1000],[3030,1000],[3030,2670],[2410,2670],[2060,2670],[2060,1000]],homes:[[2180,700],[3060,720],[2990,1510],[760,2610],[1600,2830],[2990,3000]],work:[2150,3000],market:[[2280,1560],[3030,2180],[1570,2330]],green:[2360,2050]},
 'hollow-hub':{name:'Caravan Market',style:'market',loop:[[1940,1070],[2740,910],[3180,1700],[3020,2310],[2260,2490],[1880,2030],[1940,1070]],homes:[[2090,730],[2810,640],[3110,1280],[800,2540],[1580,2910],[2950,2900]],work:[2080,3020],market:[[2150,1510],[2590,1630],[2730,2170]],green:[2280,2050]},
 'ruins-hub':{name:'Banner Square',style:'square',loop:[[1980,1050],[3110,1050],[3110,2330],[1980,2330],[1980,1050]],homes:[[2170,730],[2910,730],[3100,1500],[780,2540],[1570,2860],[2880,2900]],work:[2270,2660],market:[[2190,1390],[2760,1380],[2760,2200]],green:[2460,1910]},
 'rise-hub':{name:'Highwind Terrace',style:'terrace',loop:[[1950,970],[2570,810],[3130,1180],[2380,1740],[3080,2160],[3000,2800],[2160,2700],[1880,2120],[1950,970]],homes:[[2220,580],[2920,880],[3050,1660],[780,2490],[1580,2830],[2750,3000]],work:[2220,2870],market:[[2100,1330],[2470,2020],[2970,2480]],green:[2450,1480]},
 'ashen-hub':{name:'Ember Ward',style:'forge',loop:[[1990,1050],[2990,950],[3140,1610],[2720,1980],[3090,2670],[2100,2770],[1930,2060],[1990,1050]],homes:[[2160,700],[2930,610],[3120,1320],[810,2560],[1510,2860],[2940,3000]],work:[2210,3030],market:[[2110,1440],[2660,1540],[2920,2360]],green:[2370,2030]}
};
const at=([x,y])=>({x,y});
function layout(m,road){
 const t=theme(m),column=themes.indexOf(t),q=quarters[m.id];m.cityTheme=t.id;m.width=m.height=3600;m.cityQuarter=q.name;
 m.entry={x:1200,y:1600};m.guide={x:1040,y:1390};m.cache={x:1260,y:1920};m.shelter={x:1200,y:1510};
 m.buildings=[
  {id:m.id+':hall',name:t.hall,x:730,y:780,size:580,art:column,room:'hall'},
  {id:m.id+':shop',name:t.shop,x:1680,y:1010,size:460,art:column+4,room:'shop'},
  {id:m.id+':annex',name:t.annex,x:600,y:2050,size:400,art:column,room:'annex'}
 ].map(b=>({...b,door:{x:b.x,y:b.y+135}}));
 m.services={shop:{...m.buildings[1].door}};
 m.teleport=starters.includes(m.id)?{x:1730,y:1740}:null;
 m.hero={id:m.id+':hero',name:t.hall,x:730,y:780,art:14,size:580};
 m.info=t.title+'. '+q.name+'.';
 road(m,'promenade',[{x:180,y:1200},{x:1200,y:1200},{x:2220,y:1200}],260,'paving');
 road(m,'avenue',[{x:1200,y:360},{x:1200,y:1200},{x:1200,y:2220},{x:1200,y:3240}],240,'paving');
 for(const b of m.buildings){
  road(m,'door:'+b.id,[{x:1200,y:b.door.y},b.door],210,'paving');
  m.scenery.push({key:b.id,x:b.x,y:b.y,size:b.size,art:12,cityArt:b.art,solid:95});
 }
 road(m,'square',[m.guide,{x:1200,y:1510},{x:1610,y:1660},{x:1730,y:1810}],220,'paving');
 if(m.teleport)m.scenery.push({key:m.id+':teleport',...m.teleport,art:10,size:255,solid:0});
 m.residents=t.people.map((person,i)=>({id:m.id+':resident:'+i,name:t.names[i],appearance:'npc-'+person,pet:t.pets[i],text:t.lore[i],x:[930,1470,720][i],y:[1040,1440,2250][i]}));
 neighborhood(m,q,column,road);
 m.landmarks=[{...m.hero,kind:'hero'}];
}
function neighborhood(m,q,column,road){
 const ring=[[360,360],[1800,360],[3240,360],[3240,1800],[3240,3240],[1800,3240],[360,3240],[360,1800],[360,360]].map(at);
 road(m,'outer-lane',ring,150,'paving');
 road(m,'quarter-loop',q.loop.map(at),170,'paving');
 road(m,'market-link',[[1200,1200],[1940,1200],q.loop[0]].map(at),190,'paving');
 road(m,'south-lane',[[360,2210],[1200,2210],[1870,2280],[q.loop.at(-2)[0],q.loop.at(-2)[1]]].map(at),175,'paving');
 road(m,'garden-lane',[[360,3000],[1200,3000],[1900,3160],[3240,3160]].map(at),160,'paving');
 if(q.style==='canal'){
  m.water.push({points:[{x:2700,y:380},{x:2700,y:3220}],width:110,kind:'river'});
  road(m,'quay',[[2410,360],[2410,1000],[2410,1900],[2410,2670],[2410,3240]].map(at),140,'paving');
  road(m,'quay-bridge',[[2060,1900],[3030,1900]].map(at),160,'paving');
 }
 const join=p=>{let best=null,d=Infinity;for(const r of m.roads)for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1))),v={x:a.x+dx*t,y:a.y+dy*t},n=Math.hypot(v.x-p.x,v.y-p.y);if(n<d){best=v;d=n;}}return best;};
 const buildings=[...q.homes.map((p,i)=>({id:'home-'+i,name:['Willow House','Juniper House','The Old Bakery','Weavers’ Row','Lantern House','The Wayfarers’ Rest'][i],p,size:330+(i%3)*25,frame:column})),
  {id:'workshop',name:['Seedling Nursery','Bookbinders’ Workshop','Timber Yard','Armorers’ Yard'][column],p:q.work,size:420,frame:column+4},
  ...q.market.map((p,i)=>({id:'stall-'+i,name:['Herb Stall','Scroll Stall','Trail Provisions','Harvest Stall'][column],p,size:240,frame:column+8}))];
 m.cityBuildings=buildings.map(b=>({...b,id:m.id+':'+b.id,...at(b.p),door:{x:b.p[0],y:b.p[1]+b.size*.2+40}}));
 for(const b of m.cityBuildings){road(m,'stoop:'+b.id,[join(b.door),b.door],105,'paving');m.scenery.push({key:b.id,x:b.x,y:b.y,size:b.size,art:12,cityArt:b.frame,citySheet:'neighborhoods',solid:b.size*.2});}
 const green=at(q.green);road(m,'quarter-court',[join(green),green,{x:green.x+60,y:green.y}],290,'paving');
 m.cityGround={style:q.style,center:green,beds:[],benches:[],lamps:[]};
 const trees=[0,1,4,3,2,5][m.regionIndex];
 for(const [i,p] of q.homes.entries()){
  const x=p[0]-190,y=p[1]+20;
  m.cityGround.beds.push({x:x-15,y:y-95,width:85,height:125});
  m.scenery.push({key:m.id+':yard-tree:'+i,x,y:y-95,art:0,sceneryAtlas:'nature',sceneryFrame:trees,size:235,solid:24,sway:true});
 }
 for(const p of [[780,1210],[1740,1330],[790,2150],[1610,2180],[600,3000],[1840,3090]])m.cityGround.lamps.push(at(p));
 m.cityGround.benches.push({x:green.x-190,y:green.y+95},{x:green.x+190,y:green.y+95},{x:920,y:2240});
 // The old courtyard stays clear for saved positions, masters, caches and waystones.
 const names=[
  ['Mara','Ellis','Fen','Lina','Beren','Ada','Cora','Oswin','Milo','Tess','Rook','Syl','Hettie','Dain','Una','Jori'],
  ['Lumi','Soren','Cassia','Merrin','Edwin','Faye','Corin','Elowen','Noll','Mina','Kellan','Vera','Captain Vale','Sable','Nim','Aster'],
  ['Hollis','Bran','Mabel','Quinn','Della','Otto','Sten','Nora','Fennel','Fern','Tanner','Kit','Sergeant Beck','Lark','Annie','Wade'],
  ['Orla','Hugo','Bea','Cedric','Milly','Thea','Wulfric','Alba','Perrin','Nell','Galen','Bess','Sergeant Hale','Viola','Clement','Edda'],
  ['Freya','Tor','Inga','Leif','Sanna','Rune','Bryn','Kestrel','Ivo','Hana','Finn','Oda','Captain Skye','Lyra','Ansel','Moss'],
  ['Sera','Flint','Emmy','Rafe','Opal','Wynn','Baldric','Celia','Marten','Hazel','Coal','Neri','Captain Venn','Brisa','Sol','Tilda']
 ][m.regionIndex];
 const add=(i,p,appearance,activity,text,extra={})=>m.residents.push({id:m.id+':citizen:'+i,name:names[i],...p,appearance:'npc-'+appearance,activity,text,...extra});
 q.market.forEach((p,i)=>{
  add(i,{x:p[0]+95,y:p[1]+90},['herbalist','alchemist','ranger','smith'][column],'selling',['Fresh from the morning harvest.','Mind the blue bottle. It stains.','Bread for the road? Still warm.','The grain wagons made it through.'][column]);
  add(i+3,{x:p[0]-95,y:p[1]+120},['villager','traveler','merchant'][i],'browsing',['I only came for onions. Look at all this.','One more parcel, then I can head home.','The market smells better after the rain.'][i]);
 });
 const w=m.cityBuildings.find(b=>b.id===m.id+':workshop');
 add(6,{x:w.x+125,y:w.y+110},['gardener','librarian','smith','smith'][column],['gardening','reading','working','working'][column],['These seedlings will shade the street one day.','I mend the spines. I leave the stories alone.','A sound wheel gets you farther than a fine saddle.','Hold it steady. The edge is almost ready.'][column]);
 add(7,{x:green.x-190,y:green.y+155},column===1?'librarian':'bard','reading','A quiet corner, a good book. That is enough.');
 add(8,{x:green.x+190,y:green.y+155},'villager','resting','I save this seat for the afternoon sun.');
 add(9,{x:q.homes[3][0]-175,y:q.homes[3][1]+45},'gardener','gardening','The flowers survived another winter.');
 const routes=[
  [[900,2210],[1180,2210],[1180,2730],[1180,3000],[900,3000],[1180,3000],[1180,2210]],
  q.loop.slice(0,3).concat(q.loop.slice(0,2).reverse()),
  [[1800,360],[3240,360],[3240,1800],[3240,3240],[1800,3240],[3240,3240],[3240,1800],[3240,360]],
 ];
 routes.forEach((points,i)=>{const route=points.map(at);add(10+i,route[0],['traveler','merchant','captain'][i],['carrying','carrying','patrolling'][i],['The bakery needs this before sundown.','Taking these up to the market.','All quiet on this side. Enjoy the city.'][i],{route,speed:46+i*7,wait:2+i,routeIndex:1});});
 add(13,{x:870,y:2250},'bard','playing','Stay for the next verse. You might know it.');
 add(14,{x:1010,y:2290},'villager','listening','She plays this one every market day.');
 add(15,{x:2060,y:1200},'traveler','resting','A roof and a warm meal. That is my plan.');
 const furniture=(id,p,frame,size,solid=0)=>m.scenery.push({key:m.id+':street:'+id,...p,art:12,cityArt:frame,citySheet:'street-furniture',size,solid,cityFurniture:true});
 furniture('center',{x:green.x,y:green.y+55},q.style==='garden'?1:0,190,35);
 m.cityGround.beds.forEach((b,i)=>furniture('bed-'+i,{x:b.x+b.width/2,y:b.y+b.height},7,105));
 m.cityGround.benches.forEach((p,i)=>furniture('bench-'+i,{x:p.x,y:p.y+25},2,135));
 m.cityGround.lamps.forEach((p,i)=>furniture('lamp-'+i,p,3,90));
 furniture('cart',{x:w.x-155,y:w.y+100},4,150,25);
 furniture('well',{x:1700,y:2650},5,165,25);
 if(column===3)furniture('practice',{x:1660,y:2420},6,170,25);
}
// Ambient routines are presentation state. The caller supplies time and freezes a selected citizen.
function stepResident(r,dt,held=false){
 r.walking=false;if(held||!r.route?.length||dt<=0)return;
 if(r.wait>0){r.wait=Math.max(0,r.wait-dt);return;}
 const target=r.route[r.routeIndex||0],dx=target.x-r.x,dy=target.y-r.y,d=Math.hypot(dx,dy),n=Math.min(d,(r.speed||50)*dt);
 if(d>.01){r.x+=dx/d*n;r.y+=dy/d*n;r.walking=true;if(Math.abs(dx)>.1)r.facingLeft=dx<0;}
 if(d<=n+.01){r.routeIndex=((r.routeIndex||0)+1)%r.route.length;r.wait=3;}
}
const near=(a,b,r=150)=>!!a&&!!b&&Math.hypot(a.x-b.x,a.y-b.y)<=r;
function destinations(s){const m=BondAtlas.get(s.map);return !s.encounterSave&&near(s.position,m?.teleport)&&s.journey?.early?.mageGate===true?starters.filter(id=>id!==s.map&&BondAtlas.unlocked(s,id)):[];}
function building(s,id){const m=BondAtlas.get(s.map),b=m?.buildings?.find(b=>b.id===id);return !s.encounterSave&&b&&near(s.position,b.door)?b:null;}
root.BondCities={themes,starters,masterCities,roomRoles,exhibitAreas,spriteNames,quarters,theme,layout,stepResident,destinations,building};
})(globalThis);
