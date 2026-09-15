/* Thirty-six spatial maps; world distances never depend on screen pixels. */
(function(root){
'use strict';
const C=root.BondContent,BASE_SPEED=210;
const REGIONS=[
 {id:'clearing',name:'Mosslight',hub:'Mosslight Village',level:1,colors:['#527960','#78955f','#b4b184'],maps:['Firstlight Meadow','Fernpath Woods','Elderroot Glade','Rootveil Cave']},
 {id:'brook',name:'Willowbrook',hub:'Willowbrook Town',level:8,colors:['#487f7a','#74a79b','#bcbd97'],maps:['Brookside Fields','Rainwillow Forest','Reedwatch Banks','Springwater Cave']},
 {id:'hollow',name:'Amber Hollow',hub:'Amber Crossing',level:20,colors:['#8c7654','#b59a66','#d0b984'],maps:['Amber Heath','Copperleaf Forest','Sunfall Basin','Emberglass Cave']},
 {id:'ruins',name:'Moonwell',hub:'Moonwell Sanctuary',level:40,colors:['#526175','#869098','#b2afbc'],maps:['Moonlit Gardens','Whisperwood','Fallen Observatory','Moonstone Cave']},
 {id:'rise',name:'Windstep',hub:'Windstep Outpost',level:60,colors:['#657d8b','#9eac98','#cecaaf'],maps:['Windstep Prairie','Skybough Forest','Highwind Escarpment','Thunderhollow Cave']},
 {id:'ashen',name:'Ashen Reach',hub:'Ashenwatch',level:80,colors:['#6c605f','#928077','#ba9d7d'],maps:['Ashgrass Expanse','Cinderwood','Obsidian Approach','Deepember Cave']}
];
const MAPS={},maps=[],hash=text=>[...text].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
for(const [r,region] of REGIONS.entries()){
 const types=C.MONSTERS.filter(id=>C.UNITS[id].region===r&&C.UNITS[id].source==='wild');
 const bossType=C.MONSTERS.find(id=>C.UNITS[id].region===r&&C.UNITS[id].source==='boss');
 for(let i=0;i<4;i++){
  const id=region.id+'-'+i,width=10500+i*420+r*80,height=10080+i*210;
  const starters=['emberfox','bloomslime','stonehorn'],remaining=r===0?types.filter(type=>!starters.includes(type)):types;
  const population=r===0?(i===0?starters.filter(type=>types.includes(type)):remaining.filter((_type,n)=>n%3===i-1)):remaining.filter((_type,n)=>Math.floor(n/4)===i);
  const m={id,name:region.maps[i],region:region.id,regionIndex:r,kind:i===3?'cave':i===1?'forest':'field',index:i,
   width,height,level:Math.min(100,region.level+i*2),entry:{x:190,y:height/2},colors:region.colors,
   neighbors:[],habitats:[],obstacles:[],landmarks:[],seed:hash(id)};
  const spots=[[540,height/2+125],[width*.35,height*.31],[width*.64,height*.68],[width*.82,height*.35]];
  population.forEach((type,n)=>{
   const u=C.UNITS[type],spot=spots[n]||[width*.52,height*.76];
   // Retain Tideotter's spawn prefix so existing individuals/encounters survive relocation.
   const habitatId=type==='tideotter'?'clearing-0:tideotter':id+':'+type;
   m.habitats.push({id:habitatId,type,map:id,x:spot[0],y:spot[1],radius:170,level:BondAdventure.level(m,type,n,region.level),
    rarity:u.rarity,echoBP:u.echoBP,count:id==='clearing-0'?{emberfox:144,bloomslime:96,stonehorn:48}[type]:u.rarity==='Common'?24:u.rarity==='Uncommon'?15:3,
    respawnSeconds:['Rare','Very rare'].includes(u.rarity)?60:0,spawnBP:10000});
  });
  // Offset copses/rock islands leave clear opposite-edge X and Y corridors.
  for(let n=0;n<20;n++){
   const x=1050+(n%5)*(width-2000)/5+(i%2)*120,y=900+Math.floor(n/5)*(height-1800)/4;
   if(Math.abs(x-width/2)<450||Math.abs(y-height/2)<450)continue;
   m.obstacles.push({id:id+':rock'+n,x,y,radius:70+(n*13+r*11+i*17)%70,kind:i===3?'crystal':n%3?'tree':'rock'});
  }
  // Authored trail-edge framing and seeded copses leave the shortest axes clear.
  for(const [x,offset,radius] of [[130,-330,100],[540,-315,105],[960,-275,95],[200,355,120],[930,330,100]])m.obstacles.push({x,y:height/2+offset,radius,kind:i===3?'crystal':'tree'});
  for(let cy=0;cy<9;cy++)for(let cx=0;cx<9;cx++){
   const x=750+cx*(width-1500)/8,y=650+cy*(height-1300)/8;
   if(Math.abs(x-width/2)<450||Math.abs(y-height/2)<440||m.habitats.some(h=>Math.hypot(h.x-x,h.y-y)<480))continue;
   const kind=i===3?'crystal':(cx+cy)%4?'tree':'rock';
   m.obstacles.push({x,y,radius:75+(cx*17+cy*11)%45,kind});
  }
  m.landmarks=[{x:260,y:height/2-220,name:'Wayfarer lantern',kind:'lantern'},
   {x:width*.35,y:height*.31-240,name:i===3?'Echoing chamber':'Old keeper shrine',kind:'shrine'},
   {x:width/2,y:height/2-250,name:region.name+' crossroads',kind:'sign'},
   {x:width*.64,y:height*.68+210,name:i===3?'Crystal basin':'Quiet spring',kind:'spring'},
   {x:width*.82,y:height*.35-210,name:i===1?'Canopy lookout':'Weathered arch',kind:'arch'}];
  m.crossings={horizontal:width-160,vertical:height-160,minSeconds:Math.min(width-160,height-160)/BASE_SPEED};
  MAPS[id]=m;maps.push(m);
 }
 const id=region.id+'-hub';
 const m={id,name:region.hub,region:region.id,regionIndex:r,kind:'hub',index:4,width:1800,height:1300,level:region.level,entry:{x:900,y:760},colors:region.colors,
  neighbors:[],habitats:[],obstacles:[{x:390,y:290,radius:125,kind:'house'},{x:1340,y:300,radius:140,kind:'house'}],
  landmarks:[{x:850,y:380,name:'Inner Sea sanctuary',kind:'sanctuary'},{x:1160,y:790,name:'Provisioner',kind:'shop'},{x:520,y:820,name:'Keeper',kind:'keeper'}],seed:hash(id)};
 MAPS[id]=m;maps.push(m);

 const bossId=region.id+'-boss';
 const bossMap={id:bossId,name:(bossType?C.UNITS[bossType].name:region.name)+' Domain',region:region.id,regionIndex:r,kind:'boss',index:5,
  width:5200,height:4400,level:Math.min(100,region.level+10),entry:{x:190,y:2200},colors:region.colors,boss:bossType,
  neighbors:[],habitats:[],obstacles:[],landmarks:[],seed:hash(bossId)};
 MAPS[bossId]=bossMap;maps.push(bossMap);
}
// One occupied Cartesian cell per place. Coordinates increase east and south.
const GRID_EDGES=[];
for(const [r,region] of REGIONS.entries()){
 const x=(r%2)*3,y=4-Math.floor(r/2)*2;
 const cells={'hub':[0,1],0:[1,1],1:[2,1],2:[2,0],3:[1,0],boss:[0,0]};
 for(const [suffix,[dx,dy]] of Object.entries(cells))MAPS[region.id+'-'+suffix].grid={x:x+dx,y:y+dy};
 for(const [a,b] of [['hub',0],[0,1],[0,3],[1,2],[3,2],[3,'boss']])GRID_EDGES.push([region.id+'-'+a,region.id+'-'+b]);
 if(r%2)GRID_EDGES.push([REGIONS[r-1].id+'-1',region.id+'-hub']);
 if(r>=2)for(const [a,b] of [[3,0],[2,1]])GRID_EDGES.push([REGIONS[r-2].id+'-'+a,region.id+'-'+b]);
}
const get=id=>MAPS[id]||null;
const home=type=>maps.flatMap(m=>m.habitats).find(h=>h.type===type)||null;
const clamp=(id,p)=>{const m=get(id)||maps[0];return {x:Math.max(55,Math.min(m.width-55,Number.isFinite(p?.x)?p.x:m.entry.x)),y:Math.max(55,Math.min(m.height-55,Number.isFinite(p?.y)?p.y:m.entry.y))};};
// The opening meadow is deliberately enclosed until the Forest Mage's trial.
// After that authored gate, level bands communicate danger rather than locking roads.
const unlocked=(state,id)=>!!get(id)&&(id==='clearing-0'||state?.map===id||state?.journey?.early?.mageGate===true);
function collision(id,p,radius=20){const m=get(id);return !m||p.x<55||p.y<55||p.x>m.width-55||p.y>m.height-55||m.obstacles.some(o=>Math.hypot(p.x-o.x,p.y-o.y)<o.radius+radius);}
function validate(){
 const errors=[];
 if(maps.filter(m=>!['hub','boss'].includes(m.kind)).length!==24||maps.filter(m=>m.kind==='hub').length!==6||maps.filter(m=>m.kind==='boss').length!==6)errors.push('World count');
 for(const m of maps){if(!['hub','boss'].includes(m.kind)&&m.crossings.minSeconds<30)errors.push(m.id+' too small');for(const g of m.neighbors)if(!get(g.to)||!Number.isFinite(g.x)||!Number.isFinite(g.y)||collision(g.to,g.arrival))errors.push(m.id+' bad gate '+g.to);}
 const reached=new Set(),queue=[maps[0].id];while(queue.length){const id=queue.shift();if(reached.has(id))continue;reached.add(id);for(const g of get(id).neighbors)if(!reached.has(g.to))queue.push(g.to);}
 if(reached.size!==maps.length)errors.push('World graph disconnected');
 for(const type of C.MONSTERS)if(C.UNITS[type].source==='wild'&&!home(type))errors.push('Missing habitat '+type);
 return errors;
}
root.BondAtlas={BASE_SPEED,REGIONS,MAPS,maps,GRID_EDGES,get,home,clamp,unlocked,collision,validate,hash};
})(globalThis);
