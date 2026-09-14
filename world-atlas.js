/* Geographic atlas, drawn from the actual map graph. Its routes still walk gates. */
(function(root){
'use strict';
const A=BondAtlas,P=BondProfile;
const centers=[[185,505],[495,505],[805,505],[805,200],[495,200],[185,200]];
const offsets=[[-76,67],[-85,-65],[85,-65],[79,67],[0,0],[0,116]];
const islandPaths=[
 'M-126 30C-142-24-113-91-55-112C-2-132 69-113 108-72C142-36 136 25 112 72C83 127 18 130-38 116C-96 102-140 77-126 30Z',
 'M-132 14C-132-42-91-99-39-116C18-135 84-102 119-58C151-17 127 45 101 86C68 136 1 124-55 111C-112 98-145 63-132 14Z',
 'M-122 43C-148-9-116-80-64-109C-14-137 55-117 103-83C143-54 140 6 120 59C100 112 42 134-18 120C-80 106-110 89-122 43Z',
 'M-135 5C-126-55-92-108-31-120C28-131 95-98 121-51C147-4 127 56 91 94C54 134-11 128-66 105C-121 82-145 48-135 5Z',
 'M-120 48C-149 3-122-68-74-103C-24-139 40-119 91-91C137-66 146-13 123 43C100 99 48 130-15 121C-78 112-101 88-120 48Z',
 'M-130 25C-140-31-102-96-46-114C10-132 74-111 112-68C147-29 134 30 106 77C75 128 13 133-47 112C-107 91-140 68-130 25Z'
];
const point=m=>({x:centers[m.regionIndex][0]+offsets[m.index][0],y:centers[m.regionIndex][1]+offsets[m.index][1]});
const icon=m=>({hub:'⌂',forest:'♠',field:'❧',cave:'△',boss:'✦'})[m.kind];
const average=i=>{const levels=A.maps.filter(m=>m.regionIndex===i).flatMap(m=>m.habitats.map(h=>h.level));return Math.round(levels.reduce((n,v)=>n+v,0)/Math.max(1,levels.length));};
const threat=(level,trainer)=>level<=trainer?'safe':level<=trainer+5?'caution':'danger';
const threatLabel=band=>({safe:'Within your level',caution:'A challenging reach',danger:'Dangerous territory'})[band];
let selected=null,host=null;

function definitions(){
 const gradients=A.REGIONS.map((r,i)=>'<linearGradient id="atlas-land-'+i+'" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="'+r.colors[2]+'"/><stop offset=".58" stop-color="'+r.colors[1]+'"/><stop offset="1" stop-color="'+r.colors[0]+'"/></linearGradient>').join('');
 return '<defs>'+gradients+
  '<linearGradient id="atlas-ocean" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#376f75"/><stop offset=".5" stop-color="#183f4c"/><stop offset="1" stop-color="#102d3a"/></linearGradient>'+
  '<radialGradient id="atlas-vignette"><stop offset=".55" stop-color="#0a263000"/><stop offset="1" stop-color="#071f2a99"/></radialGradient>'+
  '<pattern id="atlas-waves" width="54" height="28" patternUnits="userSpaceOnUse"><path d="M2 17q11 7 22 0t22 0" fill="none" stroke="#b8d7cb" stroke-width="1.2" opacity=".16"/></pattern>'+
  '<pattern id="atlas-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0v50" fill="none" stroke="#d5e1c9" stroke-width=".5" opacity=".06"/></pattern>'+
  '<filter id="atlas-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#061c25" flood-opacity=".58"/></filter>'+
  '<filter id="atlas-glow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ffe4a1" flood-opacity=".8"/></filter>'+
  '</defs>';
}

function terrain(i){
 const marks=[[-82,49],[-48,75],[-6,88],[38,76],[75,48],[-72,10],[68,5]];
 return marks.map(([x,y],n)=>n%3===i%3
  ?'<path class="atlas-mountain" d="M'+(x-9)+' '+(y+7)+'l9-19 9 19m-13-3 5-10 5 10"/>'
  :'<path class="atlas-tree" d="M'+x+' '+(y-12)+'l-8 14h5l-6 10h18l-6-10h5Z"/>').join('');
}

function landMarkup(s){
 const trainer=BondProgress.trainerLevel(s);
 return A.REGIONS.map((r,i)=>{
  const [x,y]=centers[i],avg=average(i),band=threat(avg,trainer);
  return '<g class="atlas-land threat-'+band+'" data-atlas-region="'+r.id+'" data-atlas-average="'+avg+'" tabindex="0" role="group" aria-label="'+r.name+', average wildlife level '+avg+', '+threatLabel(band)+'" transform="translate('+x+' '+y+')">'+
   '<title>'+r.name+' — average wildlife level '+avg+'. '+threatLabel(band)+'.</title>'+
   '<path class="atlas-coast-shadow" d="'+islandPaths[i]+'"/>'+
   '<path class="atlas-coast" fill="url(#atlas-land-'+i+')" d="'+islandPaths[i]+'"/>'+
   '<path class="atlas-contour" d="M-96 30C-110-18-77-76-30-89C22-104 76-73 93-32C110 9 90 55 55 77C15 103-51 93-82 62"/>'+
   '<path class="atlas-river" d="M-34-104C-12-68-28-32 1-7C25 14 18 51 48 92"/>'+terrain(i)+
   '<text y="-136" class="atlas-region-name">'+r.name.toUpperCase()+'</text>'+
   '<g class="atlas-region-info"><rect x="-73" y="-119" width="146" height="38" rx="18"/><text y="-102" class="atlas-region-level">AVG LV. '+avg+'</text><text y="-89" class="atlas-region-risk">'+threatLabel(band).toUpperCase()+'</text></g>'+
   '</g>';
 }).join('');
}

function roadsMarkup(s){
 const edges=[],seen=new Set();
 for(const m of A.maps)for(const g of m.neighbors){
  const key=[m.id,g.to].sort().join('|');if(seen.has(key))continue;seen.add(key);
  const a=point(m),b=point(A.get(g.to));
  edges.push('<path data-atlas-road="'+key+'" class="atlas-road-shadow" d="M'+a.x+' '+a.y+' Q'+((a.x+b.x)/2+12)+' '+((a.y+b.y)/2-12)+' '+b.x+' '+b.y+'"/><path class="atlas-road" d="M'+a.x+' '+a.y+' Q'+((a.x+b.x)/2+12)+' '+((a.y+b.y)/2-12)+' '+b.x+' '+b.y+'"/>');
 }
 return edges.join('');
}

function placesMarkup(s){
 return A.maps.map(m=>{
  const p=point(m),current=m.id===s.map,visited=s.visited.includes(m.id);
  return '<button class="atlas-place '+m.kind+' '+(current?'here ':'')+(m.id===selected?'selected':'')+'" style="left:'+p.x/10+'%;top:'+p.y/7+'%" data-kind="'+m.kind+'" data-atlas-select="'+m.id+'" aria-pressed="'+(m.id===selected)+'" aria-label="'+m.name+', '+(current?'you are here, ':visited?'visited':'unexplored')+'"><span class="atlas-pin">'+(current?'◉':icon(m))+'</span><strong>'+(visited?'✓ ':'◇ ')+m.name+'</strong></button>';
 }).join('');
}

function render(container){
 host=container;const s=P.snapshot(),trainer=BondProgress.trainerLevel(s);
 selected=selected&&A.get(selected)?selected:s.map;
 const focused=document.activeElement?.dataset?.atlasSelect;
 const regionButtons=A.REGIONS.map((r,i)=>{const avg=average(i),band=threat(avg,trainer);return '<button data-atlas-center="'+r.id+'"><i class="threat-'+band+'"></i>'+r.name+'<small>Lv '+avg+'</small></button>';}).join('');
 container.innerHTML='<div class="atlas-key"><div class="atlas-legend"><span>◉ You are here</span><span>✓ Visited</span><span>◇ Unexplored</span><span>✦ Boss domain</span></div><div class="atlas-danger-key"><span><i class="threat-safe"></i>At/below you</span><span><i class="threat-caution"></i>Up to +5</span><span><i class="threat-danger"></i>Above +5</span></div></div>'+
  '<nav class="atlas-reaches" aria-label="Center the map on a reach">'+regionButtons+'</nav>'+
  '<p class="atlas-pan-help">Hover or focus a reach for its average wildlife level. Select a place, then choose Walk here.</p>'+
  '<div class="atlas-scroll" tabindex="0" role="region" aria-label="World map, horizontally scrollable on small screens"><div class="atlas-sheet">'+
  '<svg viewBox="0 0 1000 700" role="img" aria-label="The Six Reaches, connected by physical roads">'+definitions()+
  '<rect width="1000" height="700" rx="28" fill="url(#atlas-ocean)"/><rect width="1000" height="700" rx="28" fill="url(#atlas-grid)"/><rect width="1000" height="700" rx="28" fill="url(#atlas-waves)"/>'+
  '<path class="atlas-current" d="M50 340C180 293 268 390 390 342S596 291 711 335S865 395 957 338"/>'+
  '<g class="atlas-islets"><circle cx="44" cy="105" r="7"/><circle cx="68" cy="88" r="4"/><circle cx="936" cy="596" r="8"/><circle cx="956" cy="575" r="4"/><circle cx="497" cy="353" r="5"/></g>'+
  landMarkup(s)+roadsMarkup(s)+
  '<g class="atlas-compass" transform="translate(500 350)"><circle r="42"/><path d="M0-34 8-8 34 0 8 8 0 34-8 8-34 0-8-8Z"/><path class="atlas-compass-north" d="M0-34 8-8 0 0-8-8Z"/><text y="-48">N</text></g>'+
  '<text class="atlas-sea-name" x="500" y="670">THE INNER TIDES</text><rect width="1000" height="700" rx="28" fill="url(#atlas-vignette)" pointer-events="none"/></svg>'+placesMarkup(s)+'</div></div><div class="atlas-destination" aria-live="polite"></div>';
 for(const land of container.querySelectorAll('.atlas-land')){
  land.onmouseenter=land.onfocus=()=>land.classList.add('show-level');
  land.onmouseleave=land.onblur=()=>land.classList.remove('show-level');
 }
 container.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.atlasSelect)select(b.dataset.atlasSelect);if(b.dataset.atlasCenter){select(b.dataset.atlasCenter+'-hub');center(selected);}};
 select(selected);if(focused)container.querySelector('[data-atlas-select="'+focused+'"]').focus({preventScroll:true});
}

function select(id){
 selected=id;const s=P.snapshot(),m=A.get(id),locked=!A.unlocked(s,id),levels=m.habitats.map(h=>h.level);
 host.querySelectorAll('[data-atlas-select]').forEach(b=>{b.classList.toggle('selected',b.dataset.atlasSelect===id);b.setAttribute('aria-pressed',b.dataset.atlasSelect===id);});
 const description=m.kind==='hub'?'Free sanctuary recovery · Supply Store · Town Keeper':m.kind==='boss'?'Reward-free group boss practice · level selectable on entry':'Wildlife Lv '+Math.min(...levels)+'–'+Math.max(...levels)+' · '+m.habitats.map(h=>BondContent.UNITS[h.type].name).join(', ');
 host.querySelector('.atlas-destination').innerHTML='<div><p class="eyebrow">'+A.REGIONS[m.regionIndex].name+' · '+m.kind+'</p><h3>'+m.name+'</h3><p>'+description+'</p><small>'+(locked?'This route is unavailable.':id===s.map?'Your current location.':s.encounterSave?'Finish or abandon your reserved encounter before leaving this map.':'Walks through connected gates. WASD or Escape cancels. No teleporting.')+'</small></div><button class="button primary" data-world-travel="'+id+'" '+(locked||id===s.map||s.encounterSave?'disabled':'')+'>'+(locked?'Unavailable':id===s.map?'You are here':'Walk here →')+'</button>';
}
function center(id){if(!host)return;const el=host.querySelector('.atlas-scroll'),p=point(A.get(id)),sheet=host.querySelector('.atlas-sheet');el.scrollLeft=p.x/1000*sheet.clientWidth-el.clientWidth/2;el.scrollTop=p.y/700*sheet.clientHeight-el.clientHeight/2;}
root.BondWorldMap={render,center,point,average,threat};
})(globalThis);
