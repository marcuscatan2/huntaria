/* Original, deterministic canvas spell choreography. No textures or libraries. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const themes = {
    fire: {color:'#ffab63',core:'#fff2bf',dark:'#e25e40'}, frost: {color:'#91e6ff',core:'#f4ffff',dark:'#55aedc'},
    lightning: {color:'#b9c5ff',core:'#ffffff',dark:'#8793f1'}, nature: {color:'#bde884',core:'#f2ffd0',dark:'#6bab73'},
    stone: {color:'#dfc58d',core:'#fff0bf',dark:'#8e9571'}, arcane: {color:'#d6aaff',core:'#fff0ff',dark:'#9c72e0'},
    wind: {color:'#adf3ec',core:'#efffff',dark:'#75bac5'}, guard: {color:'#f6da87',core:'#fff7d1',dark:'#a9c589'}
  };
  function theme(event, actor) {
    const text = event.skillName || event.text;
    if (/Guard|Bondguard|Barkskin|Fortify/.test(text) || event.kind === 'shield' || event.kind === 'guard') return 'guard';
    if (/Frost/.test(text)) return 'frost';
    if (/Headwind|Springstep/.test(text)) return 'wind';
    if (/Chain|Skyneedle/.test(text)) return 'lightning';
    if (/Cinder|Burn|Pounce|Lunge/.test(text)) return 'fire';
    if (/Slam/.test(text)) return 'stone';
    if (/Mend|Bloom|Bramble|Fresh Start/.test(text) || event.kind === 'heal') return 'nature';
    return {druid:'nature',mage:'arcane',emberfox:'fire',stonehorn:'stone',stormowl:'lightning',bloomslime:'nature',frostfang:'frost',cindrake:'fire',ironback:'stone',thornstag:'nature',tideotter:'frost',lumimoth:'arcane'}[actor?.type] || {Fire:'fire',Water:'frost',Earth:'stone',Wind:'wind'}[actor?.element] || 'arcane';
  }
  const random = (seed, i) => { const n = Math.sin(seed * 17.17 + i * 73.73) * 43758.5453; return n - Math.floor(n); };
  function ellipse(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU); }
  function diamond(ctx, x, y, size, angle) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.4,0);ctx.lineTo(0,size);ctx.lineTo(-size*.4,0);ctx.closePath();ctx.fill();ctx.restore();
  }
  function glow(ctx, x, y, radius, color, alpha) {
    if (radius < .1) return;
    const gradient = ctx.createRadialGradient(x,y,0,x,y,radius);
    gradient.addColorStop(0,color);gradient.addColorStop(1,color+'00');
    ctx.globalAlpha = alpha;ctx.fillStyle=gradient;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  function sigil(ctx, x, y, radius, rotation, color, alpha) {
    ctx.save();ctx.translate(x,y);ctx.scale(1,.35);ctx.rotate(rotation);ctx.strokeStyle=color;ctx.globalAlpha=alpha;
    ctx.lineWidth=1.4;ellipse(ctx,0,0,radius,radius);ctx.stroke();ellipse(ctx,0,0,radius*.78,radius*.78);ctx.stroke();
    for(let i=0;i<6;i++){const a=i*TAU/6;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.62,Math.sin(a)*radius*.62);ctx.lineTo(Math.cos(a+.17)*radius*.96,Math.sin(a+.17)*radius*.96);ctx.stroke();}
    ctx.beginPath();for(let i=0;i<=3;i++){const a=i*TAU/3;ctx.lineTo(Math.cos(a)*radius*.64,Math.sin(a)*radius*.64);}ctx.stroke();ctx.restore();
  }
  function draw(ctx, effect, time, positions, width, quiet) {
    const age = time - effect.born; if(age<0||age>=effect.life)return;
    const p=age/effect.life, source=positions.get(effect.source), target=positions.get(effect.target), scale=width<500?.72:1;
    const colors=themes[effect.theme]||themes.arcane, fade=Math.min(1,(1-p)*3), seed=effect.serial+1;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    if(effect.type==='sigil' && target){
      const radius=(effect.radius||42)*scale*(.8+Math.sin(p*Math.PI)*.2);
      sigil(ctx,target.x,target.foot,radius,p*.8,colors.color,fade*.6);
      if(!quiet){
        glow(ctx,target.x,target.foot-20*scale,48*scale,colors.color,Math.sin(p*Math.PI)*.13);
        ctx.fillStyle=colors.core;ctx.globalAlpha=fade*.9;
        for(let i=0;i<5;i++){const a=i*TAU/5+p*3;diamond(ctx,target.x+Math.cos(a)*radius*.7,target.foot+Math.sin(a)*radius*.23-p*36,3*scale,a);}
      }
    }else if(effect.type==='projectile' && source && target){
      const progress=Math.min(1,p), sx=source.x,sy=source.y-8*scale,tx=target.x,ty=target.y;
      const arc=effect.healing?35:effect.theme==='fire'?12:8;
      const point=q=>({x:sx+(tx-sx)*q,y:sy+(ty-sy)*q-Math.sin(q*Math.PI)*arc*scale});
      const head=point(progress), angle=Math.atan2(ty-sy,tx-sx);
      if(effect.theme==='lightning'){
        ctx.globalAlpha=.75;ctx.strokeStyle=colors.dark;ctx.lineWidth=7*scale;ctx.beginPath();ctx.moveTo(sx,sy);
        for(let i=1;i<=9;i++){const q=progress*i/9,pos=point(q),off=i===9?0:Math.sin(i*9+Math.floor(age*35))*8*scale;ctx.lineTo(pos.x-Math.sin(angle)*off,pos.y+Math.cos(angle)*off);}
        ctx.stroke();ctx.strokeStyle=colors.core;ctx.lineWidth=2*scale;ctx.stroke();
      }else{
        for(let i=quiet?2:6;i>0;i--){const tail=point(Math.max(0,progress-i*.035)),end=point(Math.max(0,progress-(i-1)*.035));ctx.globalAlpha=(1-i/8)*.8;ctx.strokeStyle=colors.color;ctx.lineWidth=(8-i)*scale;ctx.beginPath();ctx.moveTo(tail.x,tail.y);ctx.lineTo(end.x,end.y);ctx.stroke();}
      }
      if(!quiet)glow(ctx,head.x,head.y,19*scale,colors.color,.5);
      ctx.globalAlpha=1;ctx.fillStyle=colors.core;
      if(effect.theme==='frost'){
        diamond(ctx,head.x,head.y,13*scale,angle+Math.PI/2);ctx.fillStyle=colors.color;diamond(ctx,head.x-3*scale,head.y+3*scale,8*scale,angle+Math.PI/2);
      }else if(effect.theme==='nature'){
        for(let i=0;i<3;i++){const a=age*15+i*TAU/3;ctx.fillStyle=i%2?colors.color:colors.core;diamond(ctx,head.x+Math.cos(a)*6*scale,head.y+Math.sin(a)*6*scale,5*scale,a);}
      }else if(effect.theme==='wind'){
        ctx.strokeStyle=colors.core;ctx.lineWidth=3*scale;ctx.beginPath();ctx.arc(head.x,head.y,12*scale,angle-1.8,angle+1.8);ctx.stroke();
      }else{ellipse(ctx,head.x,head.y,5*scale,5*scale);ctx.fill();}
    }else if(effect.type==='burst' && target){
      const radius=(effect.heavy?58:34)*scale, power=effect.power||1;
      if(!quiet)glow(ctx,target.x,target.y,radius*(.6+p),colors.color,Math.max(0,.48-p)*power);
      if(p<.4){ctx.globalAlpha=(1-p/.4)*.95;ctx.strokeStyle=colors.core;ctx.lineWidth=(4-8*p)*scale;ctx.beginPath();ctx.moveTo(target.x-15*scale,target.y);ctx.lineTo(target.x+15*scale,target.y);ctx.moveTo(target.x,target.y-20*scale);ctx.lineTo(target.x,target.y+20*scale);ctx.stroke();}
      const count=quiet?4:effect.heavy?16:10;
      for(let i=0;i<count;i++){
        const a=i*TAU/count+random(seed,i)*.5, speed=.4+random(seed,i+25)*.8;
        const distance=radius*(.15+Math.sin(p*Math.PI/2)*speed), x=target.x+Math.cos(a)*distance, y=target.y+Math.sin(a)*distance*.65-p*15+(effect.theme==='stone'?p*p*40:0);
        ctx.globalAlpha=fade*(1-p)*.95;ctx.fillStyle=i%3===0?colors.core:colors.color;
        if(['frost','stone','arcane'].includes(effect.theme))diamond(ctx,x,y,(3+random(seed,i+45)*6)*scale*(1-p*.7),a+p*2);
        else if(effect.theme==='nature'){ctx.save();ctx.translate(x,y);ctx.rotate(a+p*3);ellipse(ctx,0,0,5*scale*(1-p),2*scale*(1-p));ctx.fill();ctx.restore();}
        else{ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=2*scale;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(a)*9*scale*(1-p),y-Math.sin(a)*7*scale*(1-p));ctx.stroke();}
      }
    }else if(effect.type==='slash' && target){
      ctx.translate(target.x,target.y);ctx.rotate(effect.reverse?.55:-.65);ctx.scale(scale,scale);
      const radius=22+p*30;ctx.globalAlpha=fade;
      for(let i=0;i<2;i++){ctx.strokeStyle=i?colors.core:colors.color;ctx.lineWidth=i?3:11*(1-p)+2;ctx.beginPath();ctx.ellipse(0,0,radius,radius*.43,0,-1.1+p*.5,2.3+p*.5);ctx.stroke();}
      if(!quiet){ctx.globalAlpha=fade*.35;ctx.lineWidth=2;ctx.strokeStyle=colors.color;ctx.beginPath();ctx.ellipse(-8,3,radius*.9,radius*.5,0,-1,2);ctx.stroke();}
    }else if(effect.type==='shockwave' && target){
      const radius=(18+p*65)*scale;ctx.strokeStyle=colors.core;ctx.globalAlpha=fade*.7;ctx.lineWidth=(3-p*2)*scale;
      ellipse(ctx,target.x,target.foot,radius,radius*.35);ctx.stroke();
      ctx.globalAlpha=fade*.3;ctx.lineWidth=5*scale;ctx.strokeStyle=colors.dark;ellipse(ctx,target.x,target.foot,radius*.85,radius*.25);ctx.stroke();
      if(!quiet)for(let i=0;i<7;i++){
        const a=i*TAU/7;ctx.strokeStyle=colors.dark;ctx.globalAlpha=fade*.65;ctx.lineWidth=1.8*scale;
        ctx.beginPath();ctx.moveTo(target.x+Math.cos(a)*8,target.foot+Math.sin(a)*3);ctx.lineTo(target.x+Math.cos(a+.1)*radius*.6,target.foot+Math.sin(a+.1)*radius*.22);ctx.lineTo(target.x+Math.cos(a)*radius,target.foot+Math.sin(a)*radius*.33);ctx.stroke();
      }
    }else if(effect.type==='nova' && target){
      const radius=(20+Math.sin(p*Math.PI/2)*100)*scale;
      if(!quiet)glow(ctx,target.x,target.foot,radius,colors.color,(1-p)*.16);
      ctx.strokeStyle=colors.color;ctx.globalAlpha=fade*.65;ctx.lineWidth=3*(1-p)+1;ellipse(ctx,target.x,target.foot,radius,radius*.4);ctx.stroke();
      sigil(ctx,target.x,target.foot,radius*.78,-p,colors.core,fade*.35);
    }else if(effect.type==='heal' && target){
      sigil(ctx,target.x,target.foot,38*scale,p*.45,colors.color,fade*.7);
      const count=quiet?3:7;ctx.fillStyle=colors.core;
      for(let i=0;i<count;i++){const a=i*TAU/count+p*2,x=target.x+Math.cos(a)*26*scale,y=target.foot+Math.sin(a)*9*scale-p*58*scale;ctx.globalAlpha=fade*(.4+Math.sin(p*Math.PI)*.6);diamond(ctx,x,y,4*scale,a);}
    }else if(effect.type==='vines' && target){
      const growth=Math.sin(Math.min(1,p*3)*Math.PI/2);
      for(let i=0;i<3;i++){
        const x=target.x+(i-1)*18*scale,y=target.foot;
        ctx.globalAlpha=fade*.85;ctx.strokeStyle=i%2?colors.core:colors.dark;ctx.lineWidth=3*scale;
        ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-12*scale,y-20*scale*growth,x+17*scale,y-31*scale*growth,x+5*scale,y-52*scale*growth);ctx.stroke();
        ctx.fillStyle=colors.color;diamond(ctx,x-4*scale,y-23*scale*growth,6*scale,-.7);diamond(ctx,x+10*scale,y-35*scale*growth,5*scale,.8);
      }
    }else if(effect.type==='ward' && target){
      const radius=36*scale, angle=p*TAU*.3;
      ctx.globalAlpha=fade*.7;ctx.strokeStyle=colors.core;ctx.lineWidth=1.8*scale;ctx.beginPath();
      for(let i=0;i<=6;i++){const a=i*TAU/6-Math.PI/2;ctx.lineTo(target.x+Math.cos(a)*radius,target.y+Math.sin(a)*radius*1.2);}ctx.stroke();
      sigil(ctx,target.x,target.foot,radius,angle,colors.color,fade*.65);
    }else if(effect.type==='dust' && target && !quiet){
      for(let i=0;i<4;i++){ctx.globalAlpha=(1-p)*.15;ctx.fillStyle='#ded1a1';ellipse(ctx,target.x+(random(seed,i)-.5)*22*scale,target.foot-p*8, (3+p*8)*scale,(2+p*4)*scale);ctx.fill();}
    }else if(effect.type==='defeat' && target){
      const count=quiet?4:12;
      for(let i=0;i<count;i++){const a=i*TAU/count;ctx.fillStyle=colors.core;ctx.globalAlpha=fade*.7;diamond(ctx,target.x+Math.cos(a)*(12+p*34)*scale,target.y+Math.sin(a)*15*scale-p*45*scale,3*scale*(1-p),p+i);}
      sigil(ctx,target.x,target.foot,40*scale*(1+p*.3),0,colors.color,fade*.3);
    }
    ctx.restore();
  }
  window.CombatVFX = {theme, themes, draw};
})();
