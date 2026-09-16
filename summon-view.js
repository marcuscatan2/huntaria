/* Small decoded sprites and combat overlays; reads simulation state only. */
(function(root){
'use strict';
const cache=new Map(),SIZE=160,palettes={stormcap:'#8abfff','silk-anchor':'#c0b7ff','imperial-hearth':'#ffa369','nightlight-cap':'#d9e791',heartwood:'#98dca1','ward-rune':'#a8eee0','assault-rune':'#ffd88a','light-beacon':'#fff1ac'};
function ensure(id){
 if(cache.has(id))return cache.get(id);
 const state={ready:false,failed:false,canvas:null},image=new Image();cache.set(id,state);
 state.promise=new Promise(resolve=>{
  image.onload=()=>{
   const c=document.createElement('canvas');c.width=SIZE;c.height=SIZE;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,SIZE,SIZE);
   const pixels=ctx.getImageData(0,0,SIZE,SIZE),data=pixels.data,bg=[data[0],data[1],data[2]];
   for(let i=0;i<data.length;i+=4){
    const distance=Math.hypot(data[i]-bg[0],data[i+1]-bg[1],data[i+2]-bg[2]);
    if(data[i]>150&&data[i+2]>150&&data[i+1]<120){const alpha=Math.max(0,Math.min(1,(distance-22)/60));if(alpha<1){data[i+3]*=alpha;if(alpha>.01){data[i]=Math.max(0,Math.min(255,(data[i]-bg[0]*(1-alpha))/alpha));data[i+1]=Math.max(0,Math.min(255,(data[i+1]-bg[1]*(1-alpha))/alpha));data[i+2]=Math.max(0,Math.min(255,(data[i+2]-bg[2]*(1-alpha))/alpha));}}}
   }
   ctx.putImageData(pixels,0,0);state.canvas=c;state.ready=true;image.onload=null;image.onerror=null;image.src='';document.dispatchEvent(new CustomEvent('bond-art-ready'));resolve(true);
  };
  image.onerror=()=>{state.failed=true;resolve(false);};
 });image.src='assets/summons/'+id+'.png';return state;
}
function ring(ctx,x,y,rx,ry,color,alpha=.25){ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=alpha*.17;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=alpha;ctx.lineWidth=1.4;ctx.stroke();ctx.globalAlpha=1;}
function draw(b,ctx,project,width,height,time,positions,reduced){
 if(!b.effects)return;const scale=width<500?.7:1;
 for(const z of b.effects.zones||[]){if(z.until<=b.time||z.owner.hp<=0)continue;const p=project(z.position),owner=positions.get(z.owner.id),foot=p.y+(owner?owner.foot-project(z.owner.position).y:34*scale);ctx.save();ring(ctx,p.x,foot,z.radius*width/100,z.radius/46*height*.42,'#edb96e',.55);ctx.strokeStyle='#edb96e';ctx.globalAlpha=.55;for(const a of [-1,1]){ctx.beginPath();ctx.moveTo(p.x-9*scale,foot-a*5*scale);ctx.lineTo(p.x+9*scale,foot+a*5*scale);ctx.stroke();}ctx.restore();}
 const units=b.effects.entities.filter(e=>e.hp>0&&!e.removed).sort((a,b)=>a.position.y-b.position.y||a.id.localeCompare(b.id));
 for(const e of units){
  const p=project(e.position),master=positions.get(e.master.id),offset=master?master.foot-project(e.master.position).y:34*scale,foot=p.y+offset,size=(e.untargetable?74:e.profile==='resin-screen'?84:52)*scale*(e.visualScale||1);
  positions.set(e.id,{x:p.x,y:foot-size*.5,foot,centerY:p.y});
  const profile=e.spec||BondCombatEntities.profiles[e.profile],color=palettes[e.profile]||'#dacba1';ctx.save();
  if(profile.radius)ring(ctx,p.x,foot,profile.radius*width/100,profile.radius/46*height*.42,color,.38);
  if(e.guards){const t=positions.get(e.guards);if(t){ctx.strokeStyle='#eedc9a';ctx.globalAlpha=.45;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(p.x,foot);ctx.lineTo(t.x,t.foot);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}}
  if(e.linked){const t=positions.get(e.linked);if(t){ctx.strokeStyle=e.profile==='stitched-effigy'?'#f197a0':'#b7b7ee';ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(p.x,foot-size*.5);ctx.quadraticCurveTo((p.x+t.x)/2,Math.min(foot,t.foot)-40*scale,t.x,t.y);ctx.stroke();ctx.globalAlpha=1;}}
  const state=ensure(e.art||e.profile),appear=Math.max(0,Math.min(1,(b.time-e.born+.05)/.22)),bob=reduced?0:/spirit|beacon|lens/.test(e.profile)?Math.sin(time*3+e.slot)*2*scale:e.moving?Math.sin(time*13+e.slot)*1.5*scale:0;
  ctx.translate(p.x,foot+bob);ctx.globalAlpha=appear;ctx.scale(e.side?-1:1,1);
  if(state.ready)ctx.drawImage(state.canvas,-size/2,-size,size,size);
  else{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(0,-size*.25,size*.22,size*.18,0,0,Math.PI*2);ctx.fill();}
  ctx.restore();
  if(!e.untargetable){ctx.save();ctx.fillStyle='#151e25df';ctx.fillRect(p.x-17*scale,foot+2*scale,34*scale,4*scale);ctx.fillStyle=e.side?'#ec9993':'#b6e58d';ctx.fillRect(p.x-16*scale,foot+3*scale,32*scale*e.hp/e.maxHp,2*scale);ctx.fillStyle='#eeeecc55';ctx.fillRect(p.x-16*scale,foot+7*scale,32*scale*Math.max(0,(e.until-b.time)/(e.until-e.born)),1*scale);ctx.restore();}
 }
 for(const u of b.units){const p=positions.get(u.id);if(!p||u.hp<=0)continue;const debt=(u.debt||[]).reduce((n,e)=>n+e.amount,0),record=u.effects?.['Remembered Note'];ctx.save();
  if(debt>0){ctx.fillStyle='#473440';ctx.fillRect(p.x-25*scale,p.foot+13*scale,50*scale,5*scale);ctx.fillStyle='#e3a0b0';ctx.fillRect(p.x-25*scale,p.foot+13*scale,50*scale*Math.min(1,debt/(u.maxHp*.2)),5*scale);ctx.font='600 '+Math.round(10*scale)+'px sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe0e8';ctx.fillText(Math.ceil(debt)+' pending',p.x,p.foot+30*scale);}
  if(record&&record.until>b.time){ctx.fillStyle='#cfb7ff';ctx.font='600 '+Math.round(11*scale)+'px sans-serif';ctx.textAlign='center';ctx.fillText(record.record.kind==='damage'?'♪ Strike':record.record.kind==='heal'?'♪ Heal':'♪ Ward',p.x,p.foot+14*scale);}
  ctx.restore();
 }
}
root.BondSummonView={ensure,draw,cacheInfo:()=>({decoded:cache.size,bytes:[...cache.values()].filter(e=>e.ready).length*SIZE*SIZE*4,failed:[...cache].filter(([,e])=>e.failed).map(([id])=>id)})};
})(globalThis);
