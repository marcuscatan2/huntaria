/* Measured source frames; native sprite alpha and room proportions stay intact. */
(function(root){
'use strict';
const sheets=new Map(),grids={
 residents:{cols:3,rows:[0,414/1254,812/1254,1]},
 buildings:{cols:4,rows:[0,.5,1]},
 interiors:{cols:2,rows:[0,580/1254,1]}
};
function frame(image,x,y,w,h){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,x,y,w,h,0,0,w,h);
 const data=ctx.getImageData(0,0,w,h).data;let clear=0;
 for(let i=3;i<data.length;i+=4)if(data[i]<16)clear++;
 return {url:canvas.toDataURL('image/png'),width:w,height:h,transparent:clear/(w*h)};
}
function ensure(kind){
 if(sheets.has(kind))return sheets.get(kind);
 const state={ready:false,error:false,frames:[]},image=new Image();sheets.set(kind,state);
 state.promise=new Promise(resolve=>{image.onload=()=>{
  const {cols,rows}=grids[kind];
  for(let row=0;row<rows.length-1;row++)for(let col=0;col<cols;col++){
   const x=Math.round(col*image.width/cols),y=Math.round(rows[row]*image.height);
   state.frames.push(frame(image,x,y,Math.round((col+1)*image.width/cols)-x,Math.round(rows[row+1]*image.height)-y));
  }
  state.ready=true;refresh();resolve(true);
 };image.onerror=()=>{state.error=true;resolve(false);};});
 image.src='assets/cities/'+kind+'.png';return state;
}
function refresh(){for(const el of document.querySelectorAll('[data-city-npc]')){const index=BondCities.spriteNames.indexOf(el.dataset.cityNpc),f=sheets.get('residents')?.frames[index];if(f&&!el.src)el.src=f.url;}}
function npc(type){const name=type.replace('npc-',''),index=BondCities.spriteNames.indexOf(name),f=ensure('residents').frames[index];return '<img class="character-sprite civilian-sprite" data-character="'+type+'" data-city-npc="'+name+'" '+(f?'src="'+f.url+'"':'')+' alt="" aria-hidden="true" width="418" height="418" draggable="false">';}
function building(el,index,width){const f=ensure('buildings').frames[index];if(!f)return;el.style.width=width+'px';el.style.height=width*f.height/f.width+'px';el.style.backgroundImage='url("'+f.url+'")';el.style.backgroundSize='100% 100%';el.style.backgroundPosition='0 0';el.style.clipPath='';}
function room(el,index){
 const state=ensure('interiors');
 const paint=()=>{if(!el.isConnected)return;const f=state.frames[index];if(!f)return;el.style.backgroundImage='url("'+f.url+'")';el.style.setProperty('--city-room-ratio',f.width/f.height);el.dataset.cityRoomReady='true';};
 if(state.ready)paint();else state.promise.then(paint);
}
root.BondCityArt={ensure,npc,building,room,refresh};
})(globalThis);
