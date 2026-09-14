/* Illustrated 2.5D world renderer. No rewards, saves or combat simulation here. */
(function(root){
'use strict';const A=BondAtlas,L=BondWorldLayout,CHUNK=1024,RES=512,MAX_CHUNKS=28;
const bounds={mosslight:[0,.286,.498,.738,1],willowbrook:[0,.26,.476,.735,1],amber:[0,.252,.478,.731,1],moonwell:[0,.258,.486,.733,1],windstep:[0,.252,.476,.748,1],ashen:[0,.26,.479,.722,1]};
// Measured foliage silhouettes in the original 1254px atlases. The artwork
// is NOT an even grid: a wide canopy spills into its neighbor's nominal cell.
// Coordinates isolate each prop in both CSS scenery and canvas backdrops.
const foliage={
 mosslight:[[[0,0],[355,0],[355,359],[0,359]],[[356,0],[605,0],[605,358],[356,358]],[[617,80],[943,80],[943,359],[617,359]],[[944,0],[1254,0],[1254,359],[944,359]]],
 willowbrook:[[[8,0],[357,0],[357,334],[8,334]],[[360,0],[655,0],[655,327],[360,327]],[[673,30],[944,30],[944,315],[673,315]],[[960,44],[1254,44],[1254,317],[960,317]]],
 amber:[[[0,0],[337,0],[337,130],[329,153],[337,190],[337,315],[0,315]],[[338,0],[644,0],[644,312],[338,312],[338,190],[330,153],[338,130]],[[646,45],[951,45],[951,314],[646,314]],[[954,46],[1254,46],[1254,314],[954,314]]],
 moonwell:[[[0,0],[333,0],[333,331],[0,331]],[[349,0],[604,0],[604,325],[349,325]],[[633,40],[948,40],[948,315],[633,315]],[[960,86],[1254,86],[1254,308],[960,308]]],
 windstep:[[[17,0],[345,0],[345,314],[17,314]],[[350,29],[698,29],[698,154],[668,181],[638,199],[638,313],[350,313]],[[674,61],[953,61],[953,313],[660,313],[660,199],[670,181],[700,154],[694,100]],[[964,69],[1254,69],[1254,310],[964,310]]],
 ashen:[[[8,0],[331,0],[331,325],[8,325]],[[358,9],[624,9],[624,325],[358,325]],[[646,74],[952,74],[952,328],[646,328]],[[958,36],[1254,36],[1254,324],[958,324]]]
};
const sheets=new Map(),chunks=new Map(),nodes=new Map(),backdrops=new Map();
const terrainImage=new Image(),materials=[];let terrainReady=false,terrainError=false;
terrainImage.onload=()=>{for(let i=0;i<9;i++){const c=document.createElement('canvas');c.width=c.height=384;const g=c.getContext('2d');g.drawImage(terrainImage,(i%3)*terrainImage.width/3,Math.floor(i/3)*terrainImage.height/3,terrainImage.width/3,terrainImage.height/3,0,0,384,384);materials[i]=c;}terrainReady=true;terrainError=false;for(const c of chunks.values())c.width=c.height=1;chunks.clear();backdrops.clear();};
terrainImage.onerror=()=>{terrainError=true;};terrainImage.src='assets/world-runtime/terrain-atlas.webp';
const bridgeImage=new Image();let bridgeReady=false,bridgeError=false,bridgeRequested=false;
bridgeImage.onload=()=>{bridgeReady=true;bridgeError=false;for(const c of chunks.values())c.width=c.height=1;chunks.clear();};
bridgeImage.onerror=()=>{bridgeError=true;};
const material=(ctx,index,fallback)=>terrainReady?ctx.createPattern(materials[index],'repeat'):fallback;
let parent=null,current=null,mode='standard',stats={frames:0,renderMs:[],chunksBuilt:0,peakChunks:0,visibleProps:0,assetErrors:[]},lastTexture=0;
const rand=seed=>{let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};
function sheet(id){
 if(sheets.has(id)){const s=sheets.get(id);s.last=performance.now();return s;}
 const image=new Image(),s={image,ready:false,error:false,last:performance.now(),url:'assets/world-runtime/'+id+'-atlas.webp'};
 if(sheets.size>=2){const candidates=[...sheets.entries()].filter(([k])=>k!==current?.theme.id).sort((a,b)=>a[1].last-b[1].last);if(candidates.length)sheets.delete(candidates[0][0]);}
 sheets.set(id,s);image.onload=()=>{s.ready=true;s.error=false;};image.onerror=()=>{s.error=true;stats.assetErrors.push(id);};image.src=s.url;
 return s;
}
function frameRect(id,index){
 const s=sheet(id),outline=foliage[id]?.[index];
 if(outline){const points=outline.map(([x,y])=>[x*s.image.width/1254,y*s.image.height/1254]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);return {x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y,points};}
 const rows=bounds[id],row=Math.floor(index/4),col=index%4,pad=s.image.width/4*.035;return {x:col*s.image.width/4+pad,y:rows[row]*s.image.height,w:s.image.width/4-pad*2,h:(rows[row+1]-rows[row])*s.image.height};
}
function path(ctx,points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));}
const caveFloors=new Map();
function caveFloor(m){
 if(caveFloors.has(m.id))return caveFloors.get(m.id);
 const p=new Path2D(),circle=(x,y,rx,ry=rx)=>{p.moveTo(x+rx,y);p.ellipse(x,y,rx,ry,0,0,Math.PI*2);p.closePath();};
 for(const r of m.rooms)circle(r.x,r.y,r.rx,r.ry);
 for(const r of m.roads){const w=r.width/2;for(const v of r.points)circle(v.x,v.y,w);for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],n=Math.hypot(b.x-a.x,b.y-a.y)||1,dx=-(b.y-a.y)/n*w,dy=(b.x-a.x)/n*w;p.moveTo(a.x+dx,a.y+dy);p.lineTo(a.x-dx,a.y-dy);p.lineTo(b.x-dx,b.y-dy);p.lineTo(b.x+dx,b.y+dy);p.closePath();}}
 caveFloors.set(m.id,p);return p;
}
function floor(ctx,m){
 const t=m.theme;
 ctx.fillStyle=material(ctx,m.kind==='cave'?8:m.regionIndex,m.kind==='cave'?'#2c353d':t.ground);ctx.fillRect(0,0,m.width,m.height);
 ctx.fillStyle=m.kind==='cave'?'#101d29cc':t.ground+'38';ctx.fillRect(0,0,m.width,m.height);
 if(m.kind==='cave'){const p=caveFloor(m);ctx.save();ctx.shadowBlur=24;ctx.shadowColor='#102131';ctx.fillStyle=material(ctx,8,t.stone);ctx.fill(p);ctx.restore();ctx.fillStyle=t.stone+'24';ctx.fill(p);}
}
function makeChunk(m,cx,cy){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=RES;const ctx=canvas.getContext('2d',{alpha:false}),t=m.theme;
 ctx.scale(RES/CHUNK,RES/CHUNK);ctx.translate(-cx*CHUNK,-cy*CHUNK);floor(ctx,m);
 const r=rand(A.hash(m.id+':ground:'+cx+':'+cy));
 // Soft material patches, fine brush flecks and gentle path-edge blends.
 for(let i=0;i<45;i++){const x=(cx+r())*CHUNK,y=(cy+r())*CHUNK,rad=70+r()*230;
  if(m.kind==='cave'&&!L.onFloor(m,{x,y}))continue;
  const g=ctx.createRadialGradient(x,y,1,x,y,rad);g.addColorStop(0,(m.kind==='cave'?'#89969c':i%2?t.light:t.shade)+'24');g.addColorStop(1,(m.kind==='cave'?'#89969c':i%2?t.light:t.shade)+'00');ctx.fillStyle=g;ctx.fillRect(x-rad,y-rad,rad*2,rad*2);
 }
 for(let i=0;i<550;i++){const x=(cx+r())*CHUNK,y=(cy+r())*CHUNK;
  if(m.kind==='cave'&&!L.onFloor(m,{x,y}))continue;
  ctx.globalAlpha=.12+r()*.15;ctx.fillStyle=i%3?t.light:t.shade;ctx.beginPath();ctx.ellipse(x,y,1+r()*4,1+r()*2,r()*3,0,Math.PI*2);ctx.fill();
 }ctx.globalAlpha=1;
 for(const road of m.roads){
  if(m.kind==='cave')continue;
  ctx.lineJoin='round';ctx.lineCap='round';path(ctx,road.points);for(let edge=4;edge>=1;edge--){ctx.strokeStyle=t.soil+'16';ctx.lineWidth=road.width+edge*12;ctx.stroke();}
  ctx.strokeStyle=material(ctx,m.kind==='hub'?7:m.kind==='cave'?8:6,m.kind==='hub'?t.stone:t.soil);ctx.lineWidth=road.width;ctx.stroke();
  ctx.strokeStyle=t.soil+'24';ctx.lineWidth=road.width*.88;ctx.stroke();
  
 }
 for(const w of m.water){
  ctx.fillStyle=t.deep;ctx.strokeStyle=t.shade;ctx.lineWidth=18;
  if(w.points){path(ctx,w.points);ctx.lineWidth=w.width+24;ctx.stroke();ctx.strokeStyle=t.water;ctx.lineWidth=w.width;ctx.stroke();ctx.strokeStyle=t.deep+'70';ctx.lineWidth=w.width*.48;ctx.stroke();}
  else{ctx.beginPath();ctx.ellipse(w.x,w.y,w.rx+16,w.ry+16,0,0,Math.PI*2);ctx.fillStyle=t.soil;ctx.fill();ctx.beginPath();ctx.ellipse(w.x,w.y,w.rx,w.ry,0,0,Math.PI*2);ctx.fillStyle=t.water;ctx.fill();ctx.beginPath();ctx.ellipse(w.x,w.y,w.rx*.78,w.ry*.70,0,0,Math.PI*2);ctx.fillStyle=t.deep+'65';ctx.fill();}
 }
 for(const b of m.bridges){
  const pad=b.width+30;
  if(Math.max(b.a.x,b.b.x)+pad<cx*CHUNK||Math.min(b.a.x,b.b.x)-pad>(cx+1)*CHUNK||Math.max(b.a.y,b.b.y)+pad<cy*CHUNK||Math.min(b.a.y,b.b.y)-pad>(cy+1)*CHUNK)continue;
  if(!bridgeRequested){bridgeRequested=true;bridgeImage.src='assets/world-runtime/timber-bridge.webp';}
  if(bridgeReady){
   const dx=b.b.x-b.a.x,dy=b.b.y-b.a.y,length=Math.hypot(dx,dy)+24;
   ctx.save();ctx.translate((b.a.x+b.b.x)/2,(b.a.y+b.b.y)/2);ctx.rotate(Math.atan2(dy,dx));
   ctx.shadowColor='#1e302b88';ctx.shadowBlur=10;ctx.shadowOffsetY=8;
   // Painted rails lie outside the collision-approved central walking strip.
   ctx.drawImage(bridgeImage,-length/2,-b.width*.65,length,b.width*1.3);
   ctx.restore();stats.bridgesPainted=(stats.bridgesPainted||0)+1;continue;
  }
  path(ctx,[b.a,b.b]);ctx.lineWidth=b.width+18;ctx.strokeStyle='#434d4380';ctx.stroke();
  ctx.lineWidth=b.width;ctx.strokeStyle=m.regionIndex>1?t.stone:'#b6a47b';ctx.stroke();
  ctx.setLineDash([5,18]);ctx.strokeStyle='#56625366';ctx.stroke();ctx.setLineDash([]);
  const dx=b.b.x-b.a.x,dy=b.b.y-b.a.y,n=Math.hypot(dx,dy)||1;
  for(const sign of [-1,1]){ctx.lineWidth=7;ctx.strokeStyle='#e3d8b7';path(ctx,[{x:b.a.x-dy/n*b.width*.48*sign,y:b.a.y+dx/n*b.width*.48*sign},{x:b.b.x-dy/n*b.width*.48*sign,y:b.b.y+dx/n*b.width*.48*sign}]);ctx.stroke();}
 }
 ctx.strokeStyle='#243f4380';ctx.lineWidth=40;ctx.strokeRect(0,0,m.width,m.height);
 stats.chunksBuilt++;return canvas;
}
function cached(m,x,y){const k=m.id+':'+x+':'+y;if(chunks.has(k)){const v=chunks.get(k);chunks.delete(k);chunks.set(k,v);return v;}const v=makeChunk(m,x,y);chunks.set(k,v);while(chunks.size>MAX_CHUNKS){const k=chunks.keys().next().value;const old=chunks.get(k);old.width=old.height=1;chunks.delete(k);}stats.peakChunks=Math.max(stats.peakChunks,chunks.size);return v;}
function spriteStyle(el,id,index,width){
 const s=sheet(id);if(!s.ready){el.style.backgroundImage='none';return;}
 const q=frameRect(id,index),factor=width/q.w;el.style.width=width+'px';el.style.height=q.h*factor+'px';el.style.backgroundImage='url("'+s.url+'")';el.style.backgroundSize=s.image.width*factor+'px '+s.image.height*factor+'px';el.style.backgroundPosition=-q.x*factor+'px '+(-q.y*factor)+'px';
 el.style.clipPath=q.points?'polygon('+q.points.map(([x,y])=>((x-q.x)/q.w*100)+'% '+((y-q.y)/q.h*100)+'%').join(',')+')':'';
}
function mount(layer,map){dispose();parent=layer;current=map;sheet(map.theme.id);document.body.dataset.worldBiome=map.theme.id;}
function dispose(){for(const el of nodes.values())el.remove();nodes.clear();parent=null;}
function draw(ctx,m,camera,scale,width,height,now,player,options={}){
 const began=performance.now();mode=options.mode||'standard';const reduced=!!options.reduced,t=m.theme,vertical=options.vertical||.78;
 ctx.save();ctx.scale(scale,scale*vertical);ctx.translate(-camera.x,-camera.y);
 const minX=Math.max(0,Math.floor(camera.x/CHUNK)),maxX=Math.min(Math.ceil(m.width/CHUNK)-1,Math.floor((camera.x+width/scale)/CHUNK)),minY=Math.max(0,Math.floor(camera.y/CHUNK)),maxY=Math.min(Math.ceil(m.height/CHUNK)-1,Math.floor((camera.y+height/(scale*vertical))/CHUNK));
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)ctx.drawImage(cached(m,x,y),x*CHUNK,y*CHUNK,CHUNK,CHUNK);
 // One-ring chunk prefetch, limited to one chunk per idle visual interval.
 if(now-lastTexture>120){outer:for(let y=Math.max(0,minY-1);y<=Math.min(Math.ceil(m.height/CHUNK)-1,maxY+1);y++)for(let x=Math.max(0,minX-1);x<=Math.min(Math.ceil(m.width/CHUNK)-1,maxX+1);x++)if(!chunks.has(m.id+':'+x+':'+y)){cached(m,x,y);lastTexture=now;break outer;}}
 if(!reduced&&mode!=='low'){
  for(let i=0;i<24;i++){const x=camera.x+(i*173+now*.012)%(width/scale+160),y=camera.y+(i*239+Math.sin(now/1700+i)*30)%(height/(scale*vertical)+140);
   ctx.fillStyle=t.leaf+'85';ctx.beginPath();ctx.ellipse(x,y,2.5,1.1,now/5000+i,0,Math.PI*2);ctx.fill();}
  for(const w of m.water)if(!w.points){ctx.strokeStyle='#ecfff322';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(w.x,w.y,w.rx*(.45+i*.15+Math.sin(now/1300+i)*.025),w.ry*(.4+i*.17),0,0,Math.PI*2);ctx.stroke();}}
 }
 if(options.route?.length){ctx.setLineDash([10,15]);ctx.lineWidth=3;ctx.strokeStyle=t.accent+'95';path(ctx,[player,...options.route]);ctx.stroke();ctx.setLineDash([]);const last=options.route.at(-1);ctx.strokeStyle=t.accent;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(last.x,last.y,16,11,0,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
 if(parent){
  const visible=new Set(),margin=650;
  for(const p of m.scenery){
   const x=(p.x-camera.x)*scale,y=(p.y-camera.y)*scale*vertical;
   if(x<-margin||y<-80||x>width+margin||y>height+margin)continue;
   if(mode==='low'&&p.size<180&&![13,14,15].includes(p.art))continue;
   visible.add(p.key);let el=nodes.get(p.key);
   if(!el){el=document.createElement('div');el.className='world-prop';el.setAttribute('aria-hidden','true');parent.append(el);nodes.set(p.key,el);}
   spriteStyle(el,t.id,p.art,p.size*scale);
   el.style.left=x+'px';el.style.top=y+'px';el.style.zIndex=String(Math.round(y+300));
   const overlap=[player,options.focus].filter(Boolean).some(subject=>subject.y<p.y&&p.y-subject.y<(p.art<4?250:130)&&Math.abs(subject.x-p.x)<p.size*.30);
   el.style.opacity=overlap?'.34':'1';
   const sway=p.sway&&!reduced&&mode!=='low'?Math.sin(now/3400+A.hash(p.key)%13)*.55:0;
   el.style.transform='translate(-50%,-94%) rotate('+sway+'deg)';
  }
  for(const [key,el]of nodes)if(!visible.has(key)){el.remove();nodes.delete(key);}
  stats.visibleProps=nodes.size;
 }
 const loading=sheet(t.id);stats.loading=!loading.ready&&!loading.error;stats.fallback=loading.error;
 const time=performance.now()-began;stats.frames++;stats.renderMs.push(time);if(stats.renderMs.length>600)stats.renderMs.shift();
}
function mini(ctx,m,width=160,height=120){
 const t=m.theme;ctx.fillStyle=m.kind==='cave'?'#303d48':t.ground;ctx.fillRect(0,0,width,height);ctx.save();ctx.scale(width/m.width,height/m.height);
 for(const road of m.roads){ctx.strokeStyle=t.soil;ctx.lineWidth=140;path(ctx,road.points);ctx.stroke();}
 for(const w of m.water){ctx.fillStyle=t.deep;ctx.strokeStyle=t.deep;ctx.lineWidth=w.width||100;if(w.points){path(ctx,w.points);ctx.stroke();}else{ctx.beginPath();ctx.ellipse(w.x,w.y,w.rx,w.ry,0,0,Math.PI*2);ctx.fill();}}
 ctx.restore();
}
function drawFrame(ctx,m,index,x,y,size){const s=sheet(m.theme.id);if(!s.ready)return;const q=frameRect(m.theme.id,index),left=x-size/2,top=y-size*q.h/q.w*.94,factor=size/q.w;ctx.save();if(q.points){path(ctx,q.points.map(([px,py])=>({x:left+(px-q.x)*factor,y:top+(py-q.y)*factor})));ctx.closePath();ctx.clip();}ctx.drawImage(s.image,q.x,q.y,q.w,q.h,left,top,size,size*q.h/q.w);ctx.restore();}
function battleBackdrop(m){
 if(!sheet(m.theme.id).ready)return null;
 const key=m.theme.id+':'+m.kind;if(backdrops.has(key))return backdrops.get(key);
 const c=document.createElement('canvas');c.width=1200;c.height=650;const ctx=c.getContext('2d'),t=m.theme;
 ctx.fillStyle=material(ctx,m.kind==='cave'?8:m.regionIndex,t.ground);ctx.fillRect(0,0,1200,650);
 const g=ctx.createRadialGradient(600,410,50,600,400,660);g.addColorStop(0,t.light+'60');g.addColorStop(1,m.kind==='cave'?'#17273fe8':t.shade+'cc');ctx.fillStyle=g;ctx.fillRect(0,0,1200,650);
 ctx.fillStyle=t.soil+'85';ctx.beginPath();ctx.ellipse(600,500,500,260,0,0,Math.PI*2);ctx.fill();
 drawFrame(ctx,m,m.kind==='cave'?4:0,90,280,360);drawFrame(ctx,m,m.kind==='cave'?7:1,1110,275,340);drawFrame(ctx,m,8+m.index,640,210,260);drawFrame(ctx,m,2,70,660,220);drawFrame(ctx,m,4,1140,640,220);
 const url=c.toDataURL('image/webp',.82);backdrops.set(key,url);return url;
}
root.WorldRenderer={bounds(key){const e=nodes.get(key);return e?{x:parseFloat(e.style.left),y:parseFloat(e.style.top),width:parseFloat(e.style.width),height:parseFloat(e.style.height)}:null;},mount,dispose,draw,mini,spriteStyle,battleBackdrop,prefetch:id=>sheet(A.get(id)?.theme.id||id),retry(){if(bridgeError){bridgeError=false;bridgeImage.src='assets/world-runtime/timber-bridge.webp?retry='+Date.now();}if(terrainError){terrainError=false;terrainImage.src='assets/world-runtime/terrain-atlas.webp?retry='+Date.now();}const id=current?.theme.id;if(id){sheets.delete(id);sheet(id);}},inspect(){const times=[...stats.renderMs].sort((a,b)=>a-b);return {...stats,bridgeReady,bridgeError,bridgeAsset:'assets/world-runtime/timber-bridge.webp',terrainReady,terrainError,estimatedMaterialBytes:materials.length*384*384*4+(terrainReady?terrainImage.width*terrainImage.height*4:0),loading:current?!sheet(current.theme.id).ready&&!sheet(current.theme.id).error:false,fallback:current?sheet(current.theme.id).error:false,renderMs:undefined,p95RenderMs:times[Math.floor(times.length*.95)]||0,chunkCount:chunks.size,estimatedChunkBytes:chunks.size*RES*RES*4,sheetCount:sheets.size,decodedSheetBytes:[...sheets.values()].reduce((n,s)=>n+(s.ready?s.image.width*s.image.height*4:0),0)};}};
})(globalThis);
