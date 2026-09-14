/* Painted character-creation preview. Profile data remains owned by BondProfile. */
(function(root){
'use strict';
const atlases=new Map(),COLS=3,ROWS=3;

function stripNeutralBackdrop(image){
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data,total=canvas.width*canvas.height;
 let transparent=0;for(let n=0;n<total;n++)if(data[n*4+3]<240)transparent++;
 if(transparent>total*.02)return {canvas,removed:0,nativeAlpha:true};
 const seen=new Uint8Array(total),queue=new Int32Array(total);let head=0,tail=0;
 const backdrop=n=>{const i=n*4,r=data[i],g=data[i+1],b=data[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b),light=(r+g+b)/3;return hi-lo<=26&&light>=88;};
 const add=n=>{if(n>=0&&n<total&&!seen[n]&&backdrop(n)){seen[n]=1;queue[tail++]=n;}};
 for(let x=0;x<canvas.width;x++){add(x);add((canvas.height-1)*canvas.width+x);}
 for(let y=0;y<canvas.height;y++){add(y*canvas.width);add(y*canvas.width+canvas.width-1);}
 while(head<tail){const n=queue[head++],x=n%canvas.width;add(n-canvas.width);add(n+canvas.width);if(x)add(n-1);if(x<canvas.width-1)add(n+1);}
 if(tail<total*.45)throw Error('Creation portrait backdrop could not be isolated safely.');
 let removed=0;
 for(let n=0;n<total;n++){
  const i=n*4,r=data[i],g=data[i+1],b=data[i+2],neutral=Math.max(r,g,b)-Math.min(r,g,b)<=18&&(r+g+b)/3>=88;
  // The generated bow encloses a few checker cells. Exact neutral keying clears
  // those islands; warm tunic/skin pixels remain outside this narrow threshold.
  if(seen[n]||neutral){data[i+3]=0;removed++;}
 }
 ctx.putImageData(pixels,0,0);return {canvas,removed:removed/total,nativeAlpha:false};
}

function removeDetachedPieces(source){
 const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data,total=canvas.width*canvas.height;
 const labels=new Int32Array(total),queue=new Int32Array(total);let label=0,removed=0;
 const xs=Array.from({length:COLS+1},(_,i)=>Math.round(i*canvas.width/COLS));
 const ys=Array.from({length:ROWS+1},(_,i)=>Math.round(i*canvas.height/ROWS));
 for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
  const components=[];
  for(let y=ys[row];y<ys[row+1];y++)for(let x=xs[col];x<xs[col+1];x++){
   const start=y*canvas.width+x;if(labels[start]||data[start*4+3]<16)continue;
   label++;let head=0,tail=0;labels[start]=label;queue[tail++]=start;
   while(head<tail){const n=queue[head++],nx=n%canvas.width,ny=Math.floor(n/canvas.width);
    const visit=near=>{if(near>=0&&!labels[near]&&data[near*4+3]>=16){labels[near]=label;queue[tail++]=near;}};
    if(nx>xs[col])visit(n-1);if(nx<xs[col+1]-1)visit(n+1);if(ny>ys[row])visit(n-canvas.width);if(ny<ys[row+1]-1)visit(n+canvas.width);
   }
   components.push({label,size:tail});
  }
  const keep=components.sort((a,b)=>b.size-a.size)[0]?.label||0;
  for(let y=ys[row];y<ys[row+1];y++)for(let x=xs[col];x<xs[col+1];x++){const n=y*canvas.width+x;if(data[n*4+3]&&labels[n]!==keep){data[n*4+3]=0;removed++;}}
 }
 ctx.putImageData(pixels,0,0);return {canvas,removed:removed/total};
}

function load(weapon){
 const key=weapon==='bow'?'bow':'dagger';
 if(atlases.has(key))return atlases.get(key);
 const image=new Image(),entry={weapon:key,image,render:null,ready:false,error:false,removed:0,nativeAlpha:false};
 entry.promise=new Promise(resolve=>{
  image.onload=()=>{try{const clean=stripNeutralBackdrop(image),isolated=removeDetachedPieces(clean.canvas);entry.render=isolated.canvas;entry.removed=clean.removed;entry.specks=isolated.removed;entry.nativeAlpha=clean.nativeAlpha;entry.ready=true;resolve(entry);document.dispatchEvent(new CustomEvent('bond-creation-art-ready'));}catch(error){entry.error=true;entry.message=error.message;resolve(entry);}};
  image.onerror=()=>{entry.error=true;entry.message='Creation portrait failed to load.';resolve(entry);};
 });
 image.src='assets/art-v22/apprentice-'+key+'-creation.png';atlases.set(key,entry);return entry;
}

function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function candidateHair(r,g,b,x,y){return (y<.45||(x<.43&&y<.64))&&r>=38&&r<=210&&r-g>=9&&g-b>=4&&Math.max(r,g,b)-Math.min(r,g,b)>=22;}
function candidateSkin(r,g,b){return r>=148&&r-g>=10&&g-b>=4&&r-b>=28&&Math.max(r,g,b)-Math.min(r,g,b)>=25;}
function connectedMask(data,w,h,candidate,seed){
 const mask=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const n=y*w+x,i=n*4;if(!seed(x/w,y/h)||data[i+3]<24||!candidate(data[i],data[i+1],data[i+2],x/w,y/h))continue;
  mask[n]=1;queue[tail++]=n;
 }
 const visit=n=>{if(n<0||n>=w*h||mask[n])return;const i=n*4,x=n%w,y=Math.floor(n/w);if(data[i+3]<24||!candidate(data[i],data[i+1],data[i+2],x/w,y/h))return;mask[n]=1;queue[tail++]=n;};
 while(head<tail){const n=queue[head++],x=n%w,y=Math.floor(n/w);if(x)visit(n-1);if(x<w-1)visit(n+1);if(y)visit(n-w);if(y<h-1)visit(n+w);}
 return mask;
}
function tint(r,g,b,target,reference,min,max){
 const source=.2126*r+.7152*g+.0722*b,shade=Math.max(min,Math.min(max,source/reference));
 return target.map(channel=>Math.max(0,Math.min(255,Math.round(channel*shade))));
}
function applyLook(ctx,w,h,raw){
 const O=root.BondOpening,look=O.look(raw),pixels=ctx.getImageData(0,0,w,h),data=pixels.data;
 const hair=connectedMask(data,w,h,candidateHair,(x,y)=>x>.12&&x<.88&&y<.27);
 const skin=connectedMask(data,w,h,candidateSkin,(x,y)=>x>.2&&x<.8&&y>.12&&y<.48);
 const hairTarget=rgb(O.hairColors[look.hairColor]),skinTarget=rgb(O.skinColors[look.skinColor]);
 for(let n=0;n<w*h;n++){
  const i=n*4;if(data[i+3]<24)continue;let out=null;
  if(hair[n])out=tint(data[i],data[i+1],data[i+2],hairTarget,103,.42,1.85);
  else if(skin[n])out=tint(data[i],data[i+1],data[i+2],skinTarget,198,.56,1.24);
  if(out){data[i]=out[0];data[i+1]=out[1];data[i+2]=out[2];}
 }
 ctx.putImageData(pixels,0,0);
}

function paint(canvas,entry,raw){
 const O=root.BondOpening,look=O.look(raw),col=O.faces.indexOf(look.face),row=O.hair.indexOf(look.hair),source=entry.render;
 const x0=Math.round(col*source.width/COLS),x1=Math.round((col+1)*source.width/COLS),y0=Math.round(row*source.height/ROWS),y1=Math.round((row+1)*source.height/ROWS);
 const work=document.createElement('canvas');work.width=x1-x0;work.height=y1-y0;const wctx=work.getContext('2d',{willReadFrequently:true});wctx.drawImage(source,x0,y0,work.width,work.height,0,0,work.width,work.height);applyLook(wctx,work.width,work.height,look);
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const scale=Math.min(canvas.width/work.width,canvas.height/work.height),dw=work.width*scale,dh=work.height*scale;
 ctx.drawImage(work,(canvas.width-dw)/2,(canvas.height-dh)/2,dw,dh);
}

function paintCanvas(canvas,raw,weapon='dagger'){
 if(!canvas)return Promise.resolve(false);
 const token=String((Number(canvas.dataset.artToken)||0)+1),look=root.BondOpening.look(raw),key=weapon==='bow'?'bow':'dagger';
 canvas.dataset.artToken=token;canvas.dataset.previewState='loading';
 return load(key).promise.then(result=>{
  if(canvas.dataset.artToken!==token)return false;
  if(result.error){canvas.dataset.previewState='error';canvas.title=result.message;return false;}
  paint(canvas,result,look);canvas.dataset.previewState='ready';canvas.removeAttribute('title');
  if(canvas.dataset.artSuperseded!=='true')canvas.hidden=false;
  return true;
 });
}

function markup(raw,weapon='dagger'){
 const key=weapon==='bow'?'bow':'dagger';
 return '<canvas class="character-sprite apprentice-sprite painted-apprentice-static" data-character="apprentice" data-weapon="'+key+'" data-apprentice-preview width="420" height="420" aria-hidden="true"></canvas>';
}

function current(){const c=root.BondProfile?.snapshot().character;return {look:c?.look||root.BondOpening.defaultLook,weapon:c?.weapon||'dagger'};}
function hydrate(scope=document,force=false){
 const own=scope instanceof Element&&scope.matches('canvas[data-apprentice-preview]')?[scope]:[],nodes=[...own,...(scope.querySelectorAll?.('canvas[data-apprentice-preview]')||[])],appearance=current();
 for(const canvas of nodes){const signature=JSON.stringify([appearance.look,canvas.dataset.weapon||appearance.weapon]);if(!force&&canvas.dataset.artSignature===signature)continue;canvas.dataset.artSignature=signature;paintCanvas(canvas,appearance.look,canvas.dataset.weapon||appearance.weapon);}
 return nodes.length;
}

function source(raw,weapon='dagger'){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=420;
 return paintCanvas(canvas,raw,weapon).then(ok=>{if(!ok)throw Error(canvas.title||'Apprentice portrait unavailable.');return canvas;});
}

function render(host,raw,weapon='dagger'){
 if(!host)return Promise.resolve(false);
 const token=String((Number(host.dataset.previewToken)||0)+1);host.dataset.previewToken=token;host.dataset.previewState='loading';
 let canvas=host.querySelector('canvas');if(!canvas){host.replaceChildren();canvas=document.createElement('canvas');canvas.width=canvas.height=420;canvas.className='painted-apprentice-preview';canvas.setAttribute('role','img');host.append(canvas);}
 const look=root.BondOpening.look(raw),key=weapon==='bow'?'bow':'dagger';canvas.setAttribute('aria-label','Apprentice with '+look.hair+' hair, '+look.face+' expression and '+root.BondOpening.weapons[key].name.toLowerCase());
 const entry=load(key);return entry.promise.then(result=>{
  if(host.dataset.previewToken!==token)return false;
  if(result.error){host.dataset.previewState='error';canvas.hidden=true;host.title=result.message;return false;}
  paint(canvas,result,look);canvas.hidden=false;host.dataset.previewState='ready';host.removeAttribute('title');return true;
 });
}

const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof Element)hydrate(node);});
observer.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('bond-profile',()=>hydrate(document,true));
root.BondApprenticePreview={render,paintCanvas,markup,hydrate,source,ready:()=>Promise.all([...atlases.values()].map(entry=>entry.promise)),inspect:()=>[...atlases.values()].map(entry=>({weapon:entry.weapon,ready:entry.ready,error:entry.error,removed:entry.removed,specks:entry.specks||0,nativeAlpha:entry.nativeAlpha,message:entry.message||''}))};
})(globalThis);
