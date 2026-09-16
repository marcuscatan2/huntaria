/* Shared supplied sprites, legacy portraits and trainer poses. Gameplay never depends on art. */
(function(){
  'use strict';
  const legacy=new Set(['druid','mage','emberfox','stonehorn','stormowl','bloomslime']);
  const types=new Set([...legacy,'frostfang','cindrake','ironback','thornstag','tideotter','lumimoth','mira','orin','vesper','lark','selene','elderroot']);
  const painted=new Set(['hunter','swordsman']),people=['npc-keeper','npc-villager','npc-merchant','npc-traveler',...BondCities.spriteNames.map(n=>'npc-'+n)];
  const animated=new Set(['druid','mage','apprentice',...painted]),sheets=new Map();
  let portraitSerial=0;
  const supplied=type=>BondMonsterSprites.get(type);
  document.addEventListener('error',event=>{
    const img=event.target;if(!(img instanceof HTMLImageElement)||!img.classList.contains('character-sprite')||img.dataset.artFallback)return;
    img.dataset.artFallback=img.src;img.title='Artwork unavailable · use Retry artwork';
    const color=BondContent.UNITS[img.dataset.character]?.color||'#8aab94';
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><ellipse cx="160" cy="285" rx="70" ry="12" fill="#183c3655"/><path d="M88 240Q55 100 112 94L124 55L150 96Q175 80 194 100L220 58L226 119Q278 180 232 243Z" fill="'+color+'" stroke="#304b44" stroke-width="8"/><circle cx="128" cy="172" r="10" fill="#fff5d8"/><circle cx="198" cy="172" r="10" fill="#fff5d8"/><text x="160" y="226" text-anchor="middle" fill="#173c33" font-size="24">ART</text></svg>';
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  },true);
  function rootlessArt(type){return !!window.BondCreatureArt&&!!BondContent.UNITS[type]?.artSpec&&type!=='elderroot';}
  const nativeFacing=type=>['rabbit','hound','fox','cat','boar','badger','marten','yak','tapir','ram','deer','bear','rhino','otter','seal','mole','porcupine','snake','wyrm','serpent','dragon','lizard','axolotl','centipede','shrimp','fish','snail','slug'].includes(BondContent.UNITS[type]?.artSpec?.shape)?-1:1;
  function npcAppearance(npc,id=''){
    if(npc.masterClass)return npc.masterClass;
    if(npc.storyOnly&&npc.appearance)return npc.appearance;
    if(npc.kind==='pack')return npc.enemies[0].type;
    if(npc.kind&&npc.kind!=='guide')return npc.type||npc.appearance||id;
    if(npc.role==='keeper'||npc.kind==='guide'||npc.id==='early:forest-mage'||id==='early:forest-mage')return 'npc-keeper';
    if(npc.role==='merchant')return 'npc-merchant';
    const key=npc.id||id||npc.name||'villager';let hash=0;
    for(const ch of key)hash=(Math.imul(hash,31)+ch.charCodeAt(0))>>>0;
    return people[hash%people.length];
  }
  function art(type){
    if(type==='training-dummy')return '<svg class="character-sprite training-dummy" data-character="training-dummy" viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="80" cy="166" rx="52" ry="10" fill="#18352e55"/><path d="M68 163L74 68H88L96 163M25 69H137" stroke="#704423" stroke-width="14" stroke-linecap="round"/><path d="M53 166H111" stroke="#543723" stroke-width="10" stroke-linecap="round"/><path d="M48 65L61 49H100L114 65L104 119L54 119Z" fill="#c7a46b" stroke="#765c3c" stroke-width="4"/><circle cx="80" cy="31" r="22" fill="#dec391" stroke="#765c3c" stroke-width="4"/><path d="M61 22L98 39M59 37L98 23M51 75L109 107M51 103L108 74" stroke="#a98250" stroke-width="3"/><circle cx="80" cy="87" r="19" fill="#963d37"/><circle cx="80" cy="87" r="11" fill="#eedac1"/><circle cx="80" cy="87" r="4" fill="#963d37"/></svg>';
    if(BondCities.spriteNames.includes(type.replace('npc-','')))return BondCityArt.npc(type);
    if(painted.has(type)){
      const config=BondAnimationData[type],[l,t,r,b]=config.frames[13].rect,clip='class-portrait-'+(++portraitSerial);
      return '<svg class="character-sprite" data-painted-portrait="true" style="overflow:hidden" data-character="'+type+'" xmlns="http://www.w3.org/2000/svg" viewBox="'+[l,t,r-l,b-t].join(' ')+'" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs><clipPath id="'+clip+'"><rect x="'+l+'" y="'+t+'" width="'+(r-l)+'" height="'+(b-t)+'"/></clipPath></defs><image clip-path="url(#'+clip+')" href="assets/characters/'+type+'-sheet.png" width="'+config.width+'" height="'+config.height+'"/></svg>';
    }
    if(people.includes(type))return '<img class="character-sprite civilian-sprite" data-character="'+type+'" src="assets/characters/'+type+'.png" alt="" aria-hidden="true" width="1254" height="1254" decoding="async" draggable="false">';
    if(type==='apprentice'){const c=window.BondProfile?.snapshot().character;return BondApprenticePreview.markup(c?.look,c?.weapon);}
    const entry=supplied(type);
    if(entry)return '<img class="character-sprite supplied-monster" style="--sprite-native:'+entry.nativeFacing+'" data-character="'+type+'" src="'+entry.src+'" alt="" aria-hidden="true" width="1280" height="1280" decoding="async" draggable="false">';
    if(rootlessArt(type))return '<img class="character-sprite vector-creature" style="--sprite-native:'+nativeFacing(type)+'" data-character="'+type+'" src="'+BondCreatureArt.url(type)+'" alt="" aria-hidden="true" width="320" height="320" decoding="async" draggable="false">';
    if(!types.has(type))throw Error('Unknown character artwork: '+type);
    return '<img class="character-sprite" data-character="'+type+'" src="assets/'+(legacy.has(type)?'art-v6':['lark','selene','elderroot'].includes(type)?'art-v9':'art-v8')+'/'+type+'.png" alt="" aria-hidden="true" width="1280" height="1280" decoding="async" draggable="false">';
  }
  function removeNeutralBackdrop(image){
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data,total=canvas.width*canvas.height;
    const seen=new Uint8Array(total),queue=new Int32Array(total);let head=0,tail=0;
    const backdrop=n=>{const i=n*4,r=data[i],g=data[i+1],b=data[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b),light=(r+g+b)/3;return hi-lo<=34&&light>=92&&light<=226;};
    const add=n=>{if(n>=0&&n<total&&!seen[n]&&backdrop(n)){seen[n]=1;queue[tail++]=n;}};
    for(let x=0;x<canvas.width;x++){add(x);add((canvas.height-1)*canvas.width+x);}
    for(let y=0;y<canvas.height;y++){add(y*canvas.width);add(y*canvas.width+canvas.width-1);}
    while(head<tail){const n=queue[head++],x=n%canvas.width;add(n-canvas.width);add(n+canvas.width);if(x)add(n-1);if(x<canvas.width-1)add(n+1);}
    for(let n=0;n<total;n++)if(seen[n])data[n*4+3]=0;
    if(tail<total*.45)throw Error('Generated Apprentice backdrop could not be isolated safely.');
    ctx.putImageData(pixels,0,0);return {canvas,removed:tail/total};
  }
  function removeDetachedPieces(source,columns=4){
    const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data,total=canvas.width*canvas.height;
    const labels=new Int32Array(total),queue=new Int32Array(Math.ceil(total/(columns*columns)));let label=0,removed=0;
    const xs=Array.from({length:columns+1},(_,i)=>Math.round(canvas.width*i/columns));
    const ys=Array.from({length:columns+1},(_,i)=>Math.round(canvas.height*i/columns));
    for(let row=0;row<columns;row++)for(let col=0;col<columns;col++){
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
  function sheet(type,weapon='dagger'){
    const key=type==='apprentice'?'apprentice-'+(weapon==='bow'?'bow':'dagger'):type;
    if(!sheets.has(key)){
      const image=new Image(),entry={key,image,render:image,ready:false,error:false,removed:0};
      entry.promise=new Promise(resolve=>{image.onload=()=>{try{if(key.startsWith('apprentice-')){const cleaned=removeNeutralBackdrop(image),isolated=removeDetachedPieces(cleaned.canvas);entry.render=isolated.canvas;entry.removed=cleaned.removed;entry.specks=isolated.removed;}else if(key==='mage'||key==='swordsman-walk'){const isolated=removeDetachedPieces(image,key==='swordsman-walk'?2:4);entry.render=isolated.canvas;entry.specks=isolated.removed;}entry.ready=true;resolve(true);document.dispatchEvent(new CustomEvent('bond-art-ready'));}catch(_){entry.error=true;resolve(false);}};image.onerror=()=>{entry.error=true;resolve(false);};});
      image.src=key==='swordsman-walk'?'assets/characters/swordsman-walk.png':painted.has(key)?'assets/characters/'+key+'-sheet.png':key==='druid'?'assets/art-v10/druid-sheet.png':'assets/art-v21/'+key+'-sheet.png';sheets.set(key,entry);
    }
    return sheets.get(key);
  }
  function mount(node,type,options={}){
    const sprite=node.querySelector('.character-sprite'),weapon=type==='apprentice'?(sprite?.dataset.weapon||window.BondProfile?.snapshot().character?.weapon||'dagger'):null;
    const rig={type,weapon,configKey:type==='apprentice'?'apprentice-'+(weapon==='bow'?'bow':'dagger'):type,sprite,frame:-1,action:null,mode:'idle',animated:animated.has(type)};
    if((supplied(type)||people.includes(type))&&rig.sprite){rig.raster=true;rig.animated=true;rig.sprite.style.transformOrigin='50% 88%';return rig;}
    if(rootlessArt(type)&&rig.sprite){
      const container=document.createElement('div');container.innerHTML=BondCreatureArt.svg(type);const svg=container.firstElementChild;
      svg.classList.add('character-sprite','joint-creature');svg.setAttribute('aria-hidden','true');svg.dataset.character=type;
      svg.style.setProperty('--sprite-native',nativeFacing(type));
      rig.sprite.replaceWith(svg);rig.sprite=svg;rig.vector=true;rig.joints=[...svg.querySelectorAll('[data-joint]')];rig.animated=rig.joints.length>0;return rig;
    }
    if(!rig.animated||!rig.sprite)return rig;
    if(type==='apprentice')BondApprenticePreview.hydrate(node);
    rig.sheet=options.lazy?null:sheet(type,weapon);if(type==='swordsman'&&!options.lazy)sheet('swordsman-walk');rig.original=rig.sprite;
    const canvas=document.createElement('canvas');canvas.width=canvas.height=320;
    canvas.className='character-sprite animated-sprite';canvas.dataset.character=type;canvas.setAttribute('aria-hidden','true');canvas.hidden=true;
    if(type==='druid'){canvas.style.setProperty('--sprite-size','1.15');canvas.style.transformOrigin='50% 93.75%';}
    rig.sprite.after(canvas);rig.canvas=canvas;rig.ctx=canvas.getContext('2d');rig.sprite=canvas;
    if(type==='apprentice'&&rig.sheet&&!rig.sheet.error){
      // Creator portraits are for creator/menu presentation only. In an animated
      // scene, never flash that visibly different figure while the action sheet
      // loads. The boot/creator paths preload this sheet before world entry.
      canvas.hidden=false;rig.original.toggleAttribute('hidden',true);rig.original.dataset.artSuperseded='true';
      rig.sheet.promise.then(ok=>{if(!ok){canvas.hidden=true;rig.original.toggleAttribute('hidden',false);delete rig.original.dataset.artSuperseded;}});
    }
    return rig;
  }
  function trigger(rig,action,time,duration=.6){
    if(!rig?.animated)return;
    // A direct damage event from a skill must not replace its cast pose.
    if(action==='attack'&&rig.action?.kind==='cast'&&time<=rig.action.born+.02)return;
    rig.action={kind:action,born:time,duration};
  }
  function pose(rig,s){
    if(!rig?.sprite)return;
    if(rig.raster){
      const age=rig.action?s.time-rig.action.born:Infinity,acting=age>=0&&age<rig.action?.duration;
      const mode=s.fallen>0?'defeated':s.victory?'victory':acting?rig.action.kind:s.walking?'walk':s.windup>.1?'windup':'idle';
      rig.mode=mode;rig.sprite.dataset.pose=mode;
      const pulse=acting?Math.sin(Math.min(1,age/rig.action.duration)*Math.PI):0;
      let lift=0,tilt=0,sx=1,sy=1;
      if(!s.reduced){
        const step=Math.sin(s.time*9*(s.rate||1));
        if(mode==='walk'){lift=-Math.abs(step)*2.4;tilt=step*2;sx=1+Math.abs(step)*.012;sy=1-Math.abs(step)*.015;}
        else if(mode==='attack'){tilt=pulse*9;sx=1+pulse*.07;sy=1-pulse*.04;}
        else if(mode==='cast'){lift=-pulse*3;sy=1+pulse*.045;}
        else if(mode==='hit'){tilt=-pulse*6;sx=1+pulse*.035;sy=1-pulse*.065;}
        else if(mode==='windup'){sy=.96;sx=1.02;}
        else if(mode==='victory'){lift=-Math.abs(Math.sin(s.time*4))*3;}
        else if(mode==='idle'){sy=1+Math.sin(s.time*2.4)*.008;}
      }
      if(mode==='defeated'){tilt=12;sy=.82;}
      rig.sprite.style.transform='translateY('+lift.toFixed(2)+'px) rotate('+tilt.toFixed(2)+'deg) scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';
      return;
    }
    if(rig.vector){
      const age=rig.action?s.time-rig.action.born:Infinity,acting=age>=0&&age<rig.action?.duration;
      const mode=s.fallen>0?'defeated':s.victory?'victory':acting?rig.action.kind:s.walking?'walk':s.windup>.1?'windup':'idle';
      rig.mode=mode;rig.sprite.dataset.pose=mode;
      const pulse=acting?Math.sin(Math.min(1,age/rig.action.duration)*Math.PI):0;
      rig.joints.forEach((joint,i)=>{const [x,y]=joint.dataset.joint.split(',').map(Number),sign=i%2?1:-1;
        const angle=s.reduced?0:mode==='defeated'?sign*12:mode==='walk'?Math.sin(s.time*9+i*Math.PI)*9:mode==='attack'?sign*pulse*23:mode==='cast'?sign*pulse*16:mode==='hit'?sign*pulse*-10:mode==='victory'?Math.sin(s.time*5+i)*10:Math.sin(s.time*2+i)*2;
        joint.setAttribute('transform','rotate('+angle.toFixed(2)+' '+x+' '+y+')');
      });return;
    }
    if(!rig.animated){
      rig.sprite.style.transform='scaleY('+(1+(s.reduced?0:Math.sin(s.time*2.4)*.006)).toFixed(4)+')';return;
    }
    if(!rig.sheet){
      if(!s.walking&&!s.channeling&&!s.victory&&!s.fallen&&!rig.action)return;
      rig.sheet=sheet(rig.type,rig.weapon);
    }
    if(!rig.sheet.ready){if(rig.sheet.error){rig.canvas.hidden=true;rig.original.toggleAttribute('hidden',false);delete rig.original.dataset.artSuperseded;}return;}
    rig.canvas.hidden=false;rig.original.toggleAttribute('hidden',true);rig.original.dataset.artSuperseded='true';
    let frame=13,mode='idle';
    const action=rig.action,age=action?s.time-action.born:Infinity;
    if(s.fallen>0){frame=14;mode='defeated';}
    else if(s.victory){frame=15;mode='victory';}
    else if(s.channeling){frame=10;mode='ritual';}
    else if(!s.reduced&&age>=0&&age<action?.duration){
      mode=action.kind;
      if(mode==='hit')frame=age<.12?12:13;
      else if(mode==='cast')frame=8+(age<.10?0:age<.20?1:age<.40?2:3);
      else frame=4+(age<.10?0:age<.26?1:age<.37?2:3);
    }else if(!s.reduced&&s.walking){frame=Math.floor(s.time*(rig.type==='stonehorn'?5:7)*(s.rate||1))%4;mode='walk';}
    else if(!s.reduced&&s.windup>.1){frame=4;mode='windup';}
    rig.mode=mode;rig.sprite.dataset.pose=mode;
    const sourceKey=rig.type==='swordsman'&&mode==='walk'?'swordsman-walk':rig.configKey;
    const source=sourceKey===rig.configKey?rig.sheet:sheet(sourceKey);
    if(!source.ready)return;
    if(frame===rig.frame&&sourceKey===rig.sourceKey)return;rig.sourceKey=sourceKey;
    rig.frame=frame;rig.sprite.dataset.frame=frame;
    const im=source.render,config=BondAnimationData[sourceKey],data=config.frames[frame];
    const [left,top,right,bottom]=data.rect,w=right-left,h=bottom-top,k=config.scale;
    rig.ctx.clearRect(0,0,320,320);rig.ctx.imageSmoothingEnabled=true;rig.ctx.imageSmoothingQuality='high';
    // Measured rectangles prevent a neighboring staff or horn bleeding into a pose.
    // One scale per character and a fixed foot anchor, not per-frame auto-sizing.
    rig.ctx.drawImage(im,left,top,w,h,160-w*k*data.pivot,300-h*k,w*k,h*k);
  }
  async function portraitSource(type){
    if(!painted.has(type))throw Error('No painted class portrait: '+type);
    const entry=sheet(type);if(!await entry.promise)throw Error('Portrait could not load');
    if(!entry.portrait){
      const canvas=document.createElement('canvas');canvas.width=canvas.height=320;
      const [l,t,r,b]=BondAnimationData[type].frames[13].rect,w=r-l,h=b-t,k=280/Math.max(w,h);
      canvas.getContext('2d').drawImage(entry.render,l,t,w,h,160-w*k/2,300-h*k,w*k,h*k);entry.portrait=canvas;
    }
    return entry.portrait;
  }
  function retry(){for(const img of document.querySelectorAll('img[data-art-fallback]')){const url=img.dataset.artFallback;delete img.dataset.artFallback;img.src=url;}for(const s of sheets.values())if(s.error){s.error=false;s.image.src=s.image.src;}}
  function preload(type,weapon='dagger'){return type==='swordsman'?Promise.all([sheet(type).promise,sheet('swordsman-walk').promise]).then(r=>r.every(Boolean)):animated.has(type)?sheet(type,weapon).promise:Promise.resolve(true);}
  window.CharacterRig={art,npcAppearance,portraitSource,mount,pose,trigger,retry,preload,ready:()=>Promise.all([...sheets.values()].map(s=>s.promise)),
    inspect:()=>[...sheets].map(([type,s])=>({type,ready:s.ready,error:s.error,removed:s.removed,specks:s.specks||0}))};
})();
