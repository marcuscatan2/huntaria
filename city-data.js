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
function layout(m,road){
 const t=theme(m),column=themes.indexOf(t);m.cityTheme=t.id;m.width=m.height=2400;
 m.entry={x:1200,y:1600};m.guide={x:1040,y:1390};m.cache={x:1610,y:1660};m.shelter={x:1200,y:1510};
 m.buildings=[
  {id:m.id+':hall',name:t.hall,x:730,y:780,size:580,art:column,room:'hall'},
  {id:m.id+':shop',name:t.shop,x:1680,y:1010,size:460,art:column+4,room:'shop'},
  {id:m.id+':annex',name:t.annex,x:600,y:1740,size:400,art:column,room:'annex'}
 ].map(b=>({...b,door:{x:b.x,y:b.y+135}}));
 m.services={shop:{...m.buildings[1].door}};
 m.teleport=starters.includes(m.id)?{x:1730,y:1740}:null;
 m.hero={id:m.id+':hero',name:t.hall,x:730,y:780,art:14,size:580};
 m.info=t.title+'. Enter the buildings, meet the residents and follow the border portals. Arriving restores your trainer and companions.';
 road(m,'promenade',[{x:180,y:1200},{x:1200,y:1200},{x:2220,y:1200}],260,'paving');
 road(m,'avenue',[{x:1200,y:180},{x:1200,y:1200},{x:1200,y:2220}],260,'paving');
 for(const b of m.buildings){
  road(m,'door:'+b.id,[{x:1200,y:b.door.y},b.door],210,'paving');
  m.scenery.push({key:b.id,x:b.x,y:b.y,size:b.size,art:12,cityArt:b.art,solid:95});
 }
 road(m,'square',[m.guide,{x:1200,y:1510},m.cache,{x:1730,y:1810}],220,'paving');
 if(m.teleport)m.scenery.push({key:m.id+':teleport',...m.teleport,art:10,size:255,solid:0});
 m.residents=t.people.map((person,i)=>({id:m.id+':resident:'+i,name:t.names[i],appearance:'npc-'+person,pet:t.pets[i],text:t.lore[i],x:[930,1470,720][i],y:[1040,1440,1930][i]}));
 m.landmarks=[{...m.hero,kind:'hero'}];
}
const near=(a,b,r=150)=>!!a&&!!b&&Math.hypot(a.x-b.x,a.y-b.y)<=r;
function destinations(s){const m=BondAtlas.get(s.map);return !s.encounterSave&&near(s.position,m?.teleport)&&s.journey?.early?.mageGate===true?starters.filter(id=>id!==s.map&&BondAtlas.unlocked(s,id)):[];}
function building(s,id){const m=BondAtlas.get(s.map),b=m?.buildings?.find(b=>b.id===id);return !s.encounterSave&&b&&near(s.position,b.door)?b:null;}
root.BondCities={themes,starters,masterCities,roomRoles,exhibitAreas,spriteNames,theme,layout,destinations,building};
})(globalThis);
