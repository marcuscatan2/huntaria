/* Atlas framing and backdrop isolation for the generated city artwork. */
(function(root){
'use strict';
const sheets=new Map();
function frame(image,x,y,w,h){
 const canvas=document.createElement('canvas');canvas.width=Math.round(w);canvas.height=Math.round(h);
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,x,y,w,h,0,0,canvas.width,canvas.height);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),d=pixels.data,total=canvas.width*canvas.height,seen=new Uint8Array(total),queue=new Int32Array(total);let head=0,tail=0;
 // Generated RGB sheets have a neutral checker backdrop. Only edge-connected
 // neutral pixels are removed; enclosed eyes, books and armor stay intact.
 const visit=n=>{if(n<0||n>=total||seen[n])return;const i=n*4,hi=Math.max(d[i],d[i+1],d[i+2]),lo=Math.min(d[i],d[i+1],d[i+2]);if(hi-lo>16||lo<160)return;seen[n]=1;queue[tail++]=n;};
 for(let x=0;x<canvas.width;x++){visit(x);visit(total-canvas.width+x);}for(let y=0;y<canvas.height;y++){visit(y*canvas.width);visit(y*canvas.width+canvas.width-1);}
 while(head<tail){const n=queue[head++],x=n%canvas.width;visit(n-canvas.width);visit(n+canvas.width);if(x)visit(n-1);if(x<canvas.width-1)visit(n+1);}
 for(let n=0;n<total;n++)if(seen[n])d[n*4+3]=0;ctx.putImageData(pixels,0,0);
 return {url:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height,removed:tail/total};
}
function ensure(kind){
 if(sheets.has(kind))return sheets.get(kind);
 const state={ready:false,error:false,frames:[]},image=new Image();sheets.set(kind,state);
 state.promise=new Promise(resolve=>{image.onload=()=>{
  const cols=kind==='residents'?3:4,rows=kind==='residents'?[0,1/3,2/3,1]:[0,480/887,1];
  for(let row=0;row<rows.length-1;row++)for(let col=0;col<cols;col++)state.frames.push(frame(image,col*image.width/cols,rows[row]*image.height,image.width/cols,(rows[row+1]-rows[row])*image.height));
  state.ready=true;refresh();resolve(true);
 };image.onerror=()=>{state.error=true;resolve(false);};});
 image.src='assets/cities/'+kind+'.png';return state;
}
function refresh(){for(const el of document.querySelectorAll('[data-city-npc]')){const index=BondCities.spriteNames.indexOf(el.dataset.cityNpc),f=sheets.get('residents')?.frames[index];if(f&&!el.src)el.src=f.url;}}
function npc(type){const name=type.replace('npc-',''),index=BondCities.spriteNames.indexOf(name),f=ensure('residents').frames[index];return '<img class="character-sprite civilian-sprite" data-character="'+type+'" data-city-npc="'+name+'" '+(f?'src="'+f.url+'"':'')+' alt="" aria-hidden="true" width="418" height="418" draggable="false">';}
function building(el,index,width){const f=ensure('buildings').frames[index];if(!f)return;el.style.width=width+'px';el.style.height=width*f.height/f.width+'px';el.style.backgroundImage='url("'+f.url+'")';el.style.backgroundSize='100% 100%';el.style.backgroundPosition='0 0';el.style.clipPath='';}
root.BondCityArt={ensure,npc,building,refresh};
})(globalThis);
