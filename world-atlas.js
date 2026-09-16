/* Cartesian atlas. Selecting a square plans travel through physical gates. */
(function(root){
'use strict';
const A=BondAtlas,P=BondProfile,SIZE=144,PAD=38,EXTENT=940;
const cell=m=>m.interior?A.get(m.parentMap):m;
const point=m=>({x:PAD+(cell(m).grid.x+.5)*SIZE,y:PAD+(cell(m).grid.y+.5)*SIZE});
const average=i=>{const levels=A.maps.filter(m=>m.regionIndex===i).flatMap(m=>m.habitats.map(h=>h.level));return Math.round(levels.reduce((n,v)=>n+v,0)/Math.max(1,levels.length));};
const threat=(level,trainer)=>level<=trainer?'safe':level<=trainer+5?'caution':'danger';
const threatLabel=band=>({safe:'Within your level',caution:'A challenging reach',danger:'Dangerous territory'})[band];
const kindLabel=m=>m.kind==='hub'?'CITY':m.kind==='boss'?'BOSS DOMAIN':m.kind.toUpperCase();
let selected=null,host=null;
function roadsMarkup(){const seen=new Set(),roads=[];for(const m of A.maps.filter(m=>!m.interior))for(const g of m.neighbors.filter(g=>!A.get(g.to).interior)){const key=[m.id,g.to].sort().join('|');if(seen.has(key))continue;seen.add(key);const a=point(m),b=point(A.get(g.to));roads.push('<path data-atlas-road="'+key+'" d="M'+a.x+' '+a.y+'L'+b.x+' '+b.y+'"/>');}return roads.join('');}
function render(container){
 host=container;const s=P.snapshot(),trainer=BondProgress.trainerLevel(s),focused=document.activeElement?.dataset?.atlasSelect;
 selected=selected&&A.get(selected)?selected:s.map;
 const regions=A.REGIONS.map((r,i)=>{const avg=average(i),band=threat(avg,trainer);return '<button class="atlas-land threat-'+band+'" data-atlas-region="'+r.id+'" data-atlas-average="'+avg+'" data-atlas-center="'+r.id+'"><span class="atlas-region-name">'+r.name+'</span><span class="atlas-region-info"><span>AVG LV. '+avg+'</span><small>'+threatLabel(band)+'</small></span></button>';}).join('');
 const places=A.maps.filter(m=>!m.interior).map(m=>{const p=point(m),here=m.id===cell(A.get(s.map)).id,visited=s.visited.includes(m.id),locked=!A.unlocked(s,m.id);return '<button class="atlas-place '+m.kind+' '+(here?'here ':'')+(visited?'visited ':'')+(locked?'locked ':'')+'" data-atlas-select="'+m.id+'" data-kind="'+m.kind+'" style="left:'+(p.x/EXTENT*100)+'%;top:'+(p.y/EXTENT*100)+'%;--cell-color:'+m.colors[0]+'" aria-pressed="'+(m.id===selected)+'" aria-label="'+m.name+', '+(here?'you are here':visited?'visited':'unexplored')+'"><small>'+kindLabel(m)+'</small><strong>'+m.name+'</strong><span>'+(here?'You are here':locked?'Road closed':m.kind==='hub'?BondCities.theme(m).title:visited?'Visited':'Unexplored')+'</span><i class="atlas-cell-coordinate">'+String.fromCharCode(65+cell(m).grid.x)+(cell(m).grid.y+1)+'</i></button>';}).join('');
 container.innerHTML='<div class="atlas-key"><span>Each square is one map</span><span>Roads cross shared borders</span><span>Glowing border · You are here</span></div><nav class="atlas-reaches" aria-label="Regions">'+regions+'</nav><p class="atlas-pan-help">Select a square, then choose Walk here. City waystones connect the four starting cities.</p><div class="atlas-scroll" tabindex="0" aria-label="Square world map"><div class="atlas-sheet cartesian-sheet"><svg viewBox="0 0 '+EXTENT+' '+EXTENT+'" aria-hidden="true"><g class="atlas-grid-labels">'+Array.from({length:6},(_,i)=>'<text x="'+(PAD+(i+.5)*SIZE)+'" y="22">'+String.fromCharCode(65+i)+'</text><text x="18" y="'+(PAD+(i+.5)*SIZE)+'">'+(i+1)+'</text>').join('')+'</g><g class="atlas-grid-roads">'+roadsMarkup()+'</g></svg>'+places+'</div></div><div class="atlas-destination" aria-live="polite"></div>';
 container.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.atlasSelect)select(b.dataset.atlasSelect);if(b.dataset.atlasCenter){select(b.dataset.atlasCenter+'-hub');center(selected);}};
 select(selected);if(focused)container.querySelector('[data-atlas-select="'+focused+'"]')?.focus({preventScroll:true});
}
function select(id){
 const m=A.get(id);if(!m||!host)return;selected=id;const s=P.snapshot(),locked=!A.unlocked(s,id),levels=m.habitats.map(h=>h.level);
 host.querySelectorAll('[data-atlas-select]').forEach(b=>{b.classList.toggle('selected',b.dataset.atlasSelect===id);b.setAttribute('aria-pressed',b.dataset.atlasSelect===id);});
 const description=m.kind==='hub'?BondCities.theme(m).title+' · Arrival restores your party'+(m.teleport?' · City waystone':''):m.kind==='boss'?'Training grounds':'Wildlife Lv '+Math.min(...levels)+'–'+Math.max(...levels);
 host.querySelector('.atlas-destination').innerHTML='<div><p class="eyebrow">'+A.REGIONS[m.regionIndex].name+' · '+String.fromCharCode(65+cell(m).grid.x)+(cell(m).grid.y+1)+'</p><h3>'+m.name+'</h3><p>'+description+'</p><small>'+(locked?'The Forest Mage guards the road.':id===s.map?'Your current location.':s.encounterSave?'Finish your encounter before traveling.':'Follow the border portals. WASD or Escape cancels the walk.')+'</small></div><button class="button primary" data-world-travel="'+id+'" '+(locked||id===s.map||s.encounterSave?'disabled':'')+'>'+(locked?'Unavailable':id===s.map?'You are here':'Walk here →')+'</button>';
}
function center(id){if(!host||!A.get(id))return;const el=host.querySelector('.atlas-scroll'),p=point(A.get(id)),sheet=host.querySelector('.atlas-sheet');el.scrollLeft=p.x/EXTENT*sheet.clientWidth-el.clientWidth/2;el.scrollTop=p.y/EXTENT*sheet.clientHeight-el.clientHeight/2;}
root.BondWorldMap={render,center,point,average,threat};
})(globalThis);
