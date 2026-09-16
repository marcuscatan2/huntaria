/* Presentation only: never writes to the combat model or changes action timing. */
(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const stage = $('#arena'), canvas = $('#combat-canvas'), ctx = canvas.getContext('2d');
  const reducedMotion = {get matches(){return BondSettings.reduced();}};
  let model = null, makeArt = null, selected = '0-0', nodes = new Map(), positions = new Map();
  let effects = [], motions = new Map(), hits = new Map(), width = 0, height = 0;
  let casts = new Map(), displayPositions = new Map(), focusId = null;
  const rigs = new Map(), health = new Map(), deaths = new Map(), lastDust = new Map();
  let quietFX = BondSettings.snapshot().quiet, shake = {born:-10, life:.22, power:0};
  const geometry = new Map();
  let lastNow = 0, endTail = 0, lastHud = -1, sequence = 0;
  let lastDrawTime = -1, needsPaint = true, geometryDirty = true;
  let impactAudit=[];
  $('#fx-mode').addEventListener('click', () => {
    BondSettings.set({quiet:!quietFX});
  });
  function settingsChanged(){
    quietFX=BondSettings.snapshot().quiet; needsPaint=true;
    $('#fx-mode').textContent = quietFX ? 'FX: Quiet' : 'FX: Full';
    $('#fx-mode').setAttribute('aria-pressed', String(quietFX));
  }
  document.addEventListener('bond-settings',settingsChanged);settingsChanged();
  document.addEventListener('bond-art-ready',()=>{needsPaint=true;resize();});

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    needsPaint = true;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    if (width !== w || height !== h || canvas.width !== Math.round(w * ratio)) {
      width = w; height = h;
      canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    for (const [id, node] of nodes) {
      const art = node.querySelector('.fighter-art');
      geometry.set(id, {height: node.offsetHeight, artTop: art.offsetTop, artHeight: art.offsetHeight});
    }
    geometryDirty = false;
  }
  function project(p) { return {x: p.x / 100 * width, y: height * (.37 + (p.y - 32) / 46 * .42)}; }
  function place(alpha) {
    for (const [id, node] of nodes) {
      const u = unit(id), g = geometry.get(id); if (!g) continue;
      const previous = u.previousPosition || u.position;
      const p = project({x: previous.x + (u.position.x - previous.x) * alpha, y: previous.y + (u.position.y - previous.y) * alpha});
      node.style.left = p.x.toFixed(2) + 'px'; node.style.top = p.y.toFixed(2) + 'px';
      positions.set(id, {x:p.x, y:p.y - g.height / 2 + g.artTop + g.artHeight * .56, foot:p.y - g.height / 2 + g.artTop + g.artHeight, centerY:p.y});
    }
  }
  new ResizeObserver(resize).observe(stage);
  function unit(id) { return model?.units.find(u => u.id === id); }
  function bonded(u){return model?.ritual?.state==='complete'&&u.side===1;}
  function guild(u) { return model?.group?(u.side?'Enemy':u.owner):u.side?'Opponent':'Your party'; }
  function rate(u) { return (model.has(u, 'slow') ? .6 : 1) * (model.has(u, 'haste') ? 1.3 : 1); }

  function select(id) {
    const u = unit(id); if (!u) return;
    selected = id;
    for (const [key, node] of nodes) {
      node.classList.toggle('selected', key === id);
      node.setAttribute('aria-pressed', String(key === id));
    }
    document.querySelectorAll('.initiative-unit').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.unit === id)));
    $('#combat-dock').innerHTML = '<div class="selected-unit"><div class="dock-portrait">' + makeArt(u.appearance||u.type) + '</div><div><strong>' + u.name + '</strong><small id="selected-description"></small><small id="selected-target"></small><small id="selected-movement"></small><div class="action-track" title="Progress toward the next action; a ready attack waits for range"><i id="selected-action"></i></div></div></div><div class="dock-skills">' + u.skills.map((id, i) => {
      const skill = BondGame.SKILLS[id];
      return '<div class="dock-skill" data-index="' + i + '" title="' + skill.description+' '+BondRules.categoryLabel(skill.category) + '"><i class="cooldown-shade"></i><strong>' + skill.icon + ' ' + skill.name + (skill.category?' <em>'+BondRules.categories[skill.category].short+'</em>':'') + '</strong><small></small></div>';
    }).join('') + '</div>';
    lastHud = -1; needsPaint = true; render(model);
  }
  $('#units').addEventListener('click', event => {
    const fighter = event.target.closest('.fighter'); if (fighter) select(fighter.dataset.id);
  });
  $('#units').addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.fighter')) {
      event.preventDefault(); select(event.target.dataset.id);
    }
  });
  $('#initiative').addEventListener('click', event => {
    const button = event.target.closest('[data-unit]'); if (button) select(button.dataset.unit);
  });

  function mount(battle, art) {
    model = battle; makeArt = art; effects = []; motions.clear(); hits.clear(); positions.clear();
    casts.clear(); displayPositions.clear(); geometry.clear(); geometryDirty = true; focusId = null;
    rigs.clear(); health.clear(); deaths.clear(); lastDust.clear(); shake = {born:-10,life:.22,power:0};
    endTail = 0; lastNow = 0; lastHud = -1; sequence = 0; lastDrawTime = -1; needsPaint = true;impactAudit=[];
    nodes = new Map([...document.querySelectorAll('.fighter')].map(node => [node.dataset.id, node]));
    for (const [id, node] of nodes) {
      rigs.set(id, CharacterRig.mount(node.querySelector('.fighter-art'), unit(id).appearance||unit(id).type));
      health.set(id, {shown:unit(id).hp, logical:unit(id).hp, version:0, displayed:0, queue:[]});
    }
    $('#initiative').innerHTML = '<span class="initiative-label">ACTION METERS</span>' + battle.units.map(u => '<button type="button" class="initiative-unit ' + (u.side ? 'enemy' : '') + '" data-unit="' + u.id + '" aria-pressed="false">' + art(u.appearance||u.type) + '</button>').join('');
    select('0-0'); resize(); draw(0);
  }
  function addUnit(u){
    const node=document.querySelector('.fighter[data-id="'+u.id+'"]');if(!node||!model||nodes.has(u.id))return;
    nodes.set(u.id,node);rigs.set(u.id,CharacterRig.mount(node.querySelector('.fighter-art'),u.appearance||u.type));
    health.set(u.id,{shown:u.hp,logical:u.hp,version:0,displayed:0,queue:[]});
    $('#initiative').insertAdjacentHTML('beforeend','<button type="button" class="initiative-unit enemy" data-unit="'+u.id+'" aria-pressed="false">'+makeArt(u.appearance||u.type)+'</button>');
    // A join does not resize the arena. Measure its actor before projection,
    // or defer until the battle view is visible; keep all live rigs and cues.
    geometryDirty=true;resize();
    lastHud=-1;needsPaint=true;
  }
  function render(battle) {
    if (!battle || !model) return;
    if (lastHud === battle.time) return;
    lastHud = battle.time;
    for (const side of [0, 1]) {
      const trainer = battle.objective(side), prefix = side ? '#dusk' : '#grove';
      $(prefix + '-bond-text').textContent = trainer.label + ' ' + trainer.hp + '/' + trainer.maxHp;
      $(prefix + '-bond-fill').style.width = 100 * trainer.hp / trainer.maxHp + '%';
      if(battle.training&&side===1)$(prefix+'-bond-text').textContent='Training Dummy';
      if(side===1&&battle.ritual?.state==='complete'){$(prefix+'-bond-text').textContent='BONDED · INNER HAVEN';$(prefix+'-bond-fill').style.width='100%';}
    }
    const order = [...battle.units].sort((a, b) => (a.hp > 0 ? a.actionRemaining / rate(a) : Infinity) - (b.hp > 0 ? b.actionRemaining / rate(b) : Infinity) || a.id.localeCompare(b.id));
    order.forEach((u, index) => {
      const icon = $('#initiative [data-unit="' + u.id + '"]');
      icon.style.order = index + 1;
      icon.classList.toggle('next', index === 0 && u.hp > 0 && !battle.ended);
      icon.classList.toggle('fallen', u.hp <= 0);
      const description = guild(u) + ' ' + u.name + (u.hp > 0 ? ' — meter ready in ~' + Math.max(0, u.actionRemaining / rate(u)).toFixed(1) + 's; attacks also require range' : ' — defeated');
      icon.title = description; icon.setAttribute('aria-label', description);
      if(bonded(u)){icon.title=u.name+' · Bonded · Inner Haven';icon.setAttribute('aria-label',icon.title);}
    });
    const u = unit(selected);
    const focus = !battle.ended && u.hp > 0 ? battle.target(u) : null;
    focusId = focus?.id || null;
    $('#selected-target').textContent = focus ? 'Target: ' + focus.name : '';
    $('#selected-target').title = '';
    for (const [id, node] of nodes) node.classList.toggle('targeted', id === focusId);
    const intent = battle.intent(u), moving = u.hp > 0 && !battle.ended && u.moving;
    const attackRange = battle.reach(u, battle.offensive(intent.skill) ? intent.skill : null);
    $('#selected-description').textContent = guild(u) + ' · ' + (u.hp > 0 ? u.hp + ' HP · ' + (battle.ended ? 'finished' : moving ? 'moving' : 'holding') : 'defeated');
    if(bonded(u))$('#selected-description').textContent='Inner Haven · bonded';
    $('#selected-movement').textContent = battle.training&&u.side===1?'':'Atk: '+(BondRules.categories[u.basicCategory]?.short||'STR')+' Based';
    $('#selected-movement').title = '';
    if (!battle.ended && u.hp > 0 && intent.skill?.kind === 'trainer') {
      $('#selected-target').textContent = (moving ? 'Pursue → ' : 'Strike → ') + (intent.target?.name||'No target');
      $('#selected-target').title = intent.skill.name + ' targets the trainer directly. Normal focus: ' + battle.target(u).name + '.';
      focusId = intent.target.id;
      for (const [id, node] of nodes) node.classList.toggle('targeted', id === focusId);
    }
    $('#selected-action').style.width = (u.hp > 0 ? Math.max(0, Math.min(100, 100 * (1 - u.actionRemaining / u.interval))) : 0) + '%';
    document.querySelectorAll('.dock-skill').forEach((slot, i) => {
      const skill = BondGame.SKILLS[u.skills[i]], ready = u.cds[i] <= .001 && u.hp > 0;
      slot.classList.toggle('ready', ready);
      slot.querySelector('.cooldown-shade').style.transform = 'scaleY(' + Math.min(1, u.cds[i] / skill.cd) + ')';
      const target = skill.kind === 'trainer' ? battle.priorityTarget(u) : battle.target(u);
      const needsRange = battle.offensive(skill) && !battle.inRange(u, target, skill);
      slot.querySelector('small').textContent = u.hp <= 0 ? 'DEFEATED' : 'P' + (i + 1) + ' · ' + (ready ? needsRange ? 'NEED RANGE' : 'READY' : u.cds[i].toFixed(1) + 's');
    });
    const warning=$('#boss-warning');warning.hidden=!battle.bossCharge||battle.ended;
    if(!warning.hidden)warning.textContent='⚠ '+(battle.bossCharge.name||'BRAMBLEQUAKE').toUpperCase()+' · '+Math.max(0,battle.bossCharge.until-battle.time).toFixed(1)+'s · '+(battle.bossCharge.hint||'BRACE');
    for (const actor of battle.units) {
      const node = nodes.get(actor.id);
      node.classList.toggle('charging',!!actor.boss&&!!battle.bossCharge&&!battle.ended);
      node.classList.toggle('boss-marked',!!battle.bossCharge?.targets?.includes(actor.id));
      node.classList.toggle('shielded', actor.shield > 0);
      node.classList.toggle('eliminated',!!actor.eliminated);
      node.classList.toggle('guarding', battle.has(actor, 'guard'));
      node.classList.toggle('is-moving', actor.hp > 0 && !battle.ended && actor.moving);
    }
  }
  function add(effect) {
    // Keep cast labels separate from damage and retain at most two readable
    // numeric popups per unit. Simultaneous hits must not look like one big number.
    if (effect.type === 'text') {
      const matching = effects.filter(e => e.type === 'text' && e.target === effect.target && !!e.label === !!effect.label);
      const keep = effect.label ? 0 : 1;
      for (const old of matching.slice(0, Math.max(0, matching.length - keep))) effects.splice(effects.indexOf(old), 1);
    }
    effects.push({...effect, born: (effect.born ?? model.time) + (effect.delay || 0), serial: sequence++});
    if (effects.length > 160) effects.splice(0, effects.length - 160);
  }
  function onEvent(event) {
    if (!model) return;
    needsPaint = true;
    const actor = unit(event.actor), target = unit(event.target), theme = CombatVFX.theme(event, actor);
    const color = CombatVFX.themes[theme].color, at = event.time;
    const spawn = effect => add({theme, born:at, ...effect});
    if (event.kind === 'cast' && actor) {
      CharacterRig.trigger(rigs.get(actor.id),['hit','trainer','frontaoe'].includes(event.skillKind)?'attack':'cast',at,.62);
      if (!reducedMotion.matches) casts.set(actor.id, {born:at, life:.62, theme, name:event.skillName});
      spawn({type:'sigil', target:actor.id, life:.58, radius:actor.type === 'stonehorn' ? 44 : 35});
      // Full skill names live in the dock/journal. Only the inspected unit
      // announces casts over the arena, keeping six simultaneous actors readable.
      if (actor.id === selected) spawn({type:'text', target:actor.id, color, text:event.skillName, life:.9, label:true});
      if (event.skillKind === 'aoe') spawn({type:'nova', target:actor.id, life:.65, delay:.16});
      if (event.bypass && target) {
        effects = effects.filter(e => e.type !== 'bypass');
        spawn({type:'bypass', text:event.skillName + ' → ' + target.name, color:'#ffe8ab', life:1.15});
        spawn({type:'retarget', source:actor.id, target:target.id, color:'#ffd898', life:.65});
      }
    }
    if (event.kind === 'retarget' && actor && target) spawn({type:'retarget', source:actor.id, target:target.id, color:'#def0ac', life:.7});
    if ((event.kind === 'shield' || event.kind === 'guard') && target) spawn({type:'ward', target:target.id, life:.65});
    if(event.kind==='dodge'&&target)spawn({type:'text',target:target.id,color:'#d4ebf9',text:'DODGE',life:.8});
    if (event.kind === 'damage' || event.kind === 'heal' || event.kind === 'regen') {
      if (!target) return;
      const healing = event.kind === 'heal'||event.kind==='regen', periodic = event.kind==='regen'||/: Burn|Guard intercept/.test(event.text);
      const melee = !healing && !periodic && !event.arenaWide && actor?.range === 1, heavy = actor?.role === 'Tank';
      const travel = window.BondPresentation?BondPresentation.timing(event,reducedMotion.matches).delay:reducedMotion.matches?0:.26;
      if(!healing&&!periodic&&!event.arenaWide&&actor)CharacterRig.trigger(rigs.get(actor.id),'attack',at,heavy?.72:.5);
      if(!healing&&event.amount>0)CharacterRig.trigger(rigs.get(target.id),'hit',at+travel,.22);
      if (actor && actor.id !== target.id && !periodic) {
        if (melee && !reducedMotion.matches) motions.set(actor.id, {target:target.id, born:at, life:heavy?.72:.5, heavy, contact:travel});
        else if (!reducedMotion.matches&&!event.arenaWide) spawn({type:'projectile', source:actor.id, target:target.id, healing, life:travel-.04, delay:.04});
      }
      if (!periodic) {
        spawn({type:healing?'heal':melee&&!heavy?'slash':'burst', target:target.id, life:healing?.7:.5, delay:travel, heavy, power:event.amount > 90 ? 1.2 : .7});
        if (melee) spawn({type:heavy?'shockwave':'burst', target:target.id, life:heavy?.65:.42, delay:travel, heavy});
        if (/Bramble/.test(event.text)) spawn({type:'vines',target:target.id,life:.8,delay:travel});
      }
      if (event.amount > 0 || target.id === selected) spawn({type:'text', target:target.id, color:healing?'#d4ffb1':event.amount===0?'#e9dfa4':'#fff4d5', text:event.amount===0?'BLOCK':(healing?'+':'−')+event.amount, life:.85, delay:travel, damage:!healing});
      const state = health.get(target.id);
      if (state) {
        state.logical = Math.max(0, Math.min(target.maxHp, state.logical + (healing ? event.amount : -event.amount)));
        state.queue.push({at:at+travel, value:state.logical, version:++state.version, cue:{theme,healing,heavy,amount:event.amount}});
      }
      if (!healing && !reducedMotion.matches) {
        hits.set(target.id, {born:at+travel, life:.25, power:Math.min(1,event.amount/100)});
        if (!quietFX && heavy && !periodic) shake = {born:at+travel, life:.2, power:width<500?1.1:2.2};
      }
    }
    if (event.kind === 'defeat' && target) {
      motions.delete(target.id); casts.delete(target.id);
      const born = Math.max(at, hits.get(target.id)?.born || at);
      deaths.set(target.id, {born, life:.85});
      add({type:'defeat', theme, target:target.id, born, life:.9});
    }
    if(event.kind==='phase')spawn({type:'banner',text:'THE GUARDIAN AWAKENS',color:'#ffe5a1',life:1.5});
    if(event.kind==='quake'){spawn({type:'nova',target:actor.id,life:.8,theme:'stone'});if(!quietFX&&!reducedMotion.matches)shake={born:at,life:.3,power:2.8};}
    if (event.kind === 'overcharge') spawn({type:'banner', text:'OVERCHARGE', color:'#ffdd8e', life:1.7});
  }
  function updateHealth(time) {
    for (const [id, state] of health) {
      state.queue.sort((a,b)=>a.at-b.at||a.version-b.version);
      for (const item of state.queue.filter(item=>item.at<=time)) {
        if (item.version > state.displayed) { state.shown=item.value; state.displayed=item.version; window.BondApp?.soundImpact(item.cue);impactAudit.push({target:id,deadline:item.at,presented:time,hp:item.value,lateMs:Math.max(0,(time-item.at)*1000)});if(impactAudit.length>1000)impactAudit.shift(); }
      }
      state.queue=state.queue.filter(item=>item.at>time);
      const actor=unit(id), node=nodes.get(id), fallen=state.shown<=0;
      node.classList.toggle('dead', fallen);
      node.querySelector('.hp-fill').style.width=100*state.shown/actor.maxHp+'%';
      node.querySelector('.fighter-hp').setAttribute('aria-valuenow',state.shown);
      node.querySelector('.hp-text').textContent=fallen?'DEFEATED':state.shown+' / '+actor.maxHp;
      if (!actor.slot) {
        const prefix=actor.side?'#dusk':'#grove';
        $(prefix+'-bond-text').textContent=actor.name+' '+state.shown+'/'+actor.maxHp;
        $(prefix+'-bond-fill').style.width=100*state.shown/actor.maxHp+'%';
      }
    }
    if(model?.group){const trainers=model.units.filter(u=>u.side===0&&u.slot===0),hp=trainers.reduce((n,u)=>n+(health.get(u.id)?.shown??u.hp),0),max=trainers.reduce((n,u)=>n+u.maxHp,0);$('#grove-bond-text').textContent='ALLIED TRAINERS '+hp+'/'+max;$('#grove-bond-fill').style.width=100*hp/max+'%';}
  }
  function circle(x, y, radius, color, alpha = 1) {
    ctx.globalAlpha = alpha; ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, Math.max(0, radius), 0, Math.PI * 2); ctx.fill();
  }
  function drawEffect(effect, time) {
    const age=time-effect.born; if(age<0||age>=effect.life)return;
    const p=age/effect.life, target=displayPositions.get(effect.target), source=displayPositions.get(effect.source);
    const opacity=Math.min(1,(1-p)*3), quiet=quietFX||reducedMotion.matches;
    if (!['text','retarget','bypass','banner'].includes(effect.type)) {
      if (!reducedMotion.matches) CombatVFX.draw(ctx,effect,time,displayPositions,width,quiet);
      return;
    }
    ctx.save();ctx.globalAlpha=opacity;ctx.lineCap='round';ctx.lineJoin='round';
    if(effect.type==='text' && target){
      const size=effect.label?(width<500?9:11):(width<500?15:20);
      const stack=effect.label?0:effects.filter(e=>e.type==='text'&&!e.label&&e.target===effect.target&&e.born<=time&&time-e.born<e.life).sort((a,b)=>b.serial-a.serial).indexOf(effect);
      const shift=reducedMotion.matches?0:p*22, pop=reducedMotion.matches?1:1+Math.sin(Math.min(1,p*5)*Math.PI)*.12;
      const x=target.labelX??target.x,y=effect.label?target.foot+49:target.y-(width<500?28:40)-Math.max(0,stack)*(size+3)-shift;
      ctx.font='800 '+size+'px "Segoe UI", sans-serif';ctx.textAlign='center';
      const half=ctx.measureText(effect.text).width/2+4;
      ctx.translate(Math.max(half,Math.min(width-half,x)),y);ctx.scale(pop,pop);
      ctx.lineWidth=3.5;ctx.strokeStyle='#1e342d';ctx.strokeText(effect.text,0,0);
      ctx.fillStyle=effect.color;ctx.fillText(effect.text,0,0);
    }else if(effect.type==='retarget' && target && source){
      ctx.globalAlpha=opacity*.5;ctx.strokeStyle=effect.color;ctx.lineWidth=1.3;ctx.setLineDash([4,7]);
      ctx.beginPath();ctx.moveTo(source.x,source.foot);ctx.quadraticCurveTo((source.x+target.x)/2,Math.min(source.foot,target.foot)-18,target.x,target.foot);ctx.stroke();
    }else if(effect.type==='bypass'){
      const size=width<500?10:12,y=width<500?130:150;
      ctx.font='800 '+size+'px "Segoe UI", sans-serif';ctx.textAlign='center';
      const text='TRAINER STRIKE · '+effect.text,w=Math.min(width-20,ctx.measureText(text).width+28);
      ctx.fillStyle='#302739';ctx.globalAlpha=opacity*.92;ctx.fillRect((width-w)/2,y-17,w,27);
      ctx.strokeStyle='#efcf8477';ctx.lineWidth=1;ctx.strokeRect((width-w)/2,y-17,w,27);
      ctx.globalAlpha=opacity;ctx.fillStyle=effect.color;ctx.fillText(text,width/2,y,width-32);
    }else if(effect.type==='banner'){
      ctx.font='800 '+(width<500?22:34)+'px Georgia';ctx.textAlign='center';ctx.strokeStyle='#493a26';ctx.lineWidth=6;
      ctx.strokeText(effect.text,width/2,height*.57);ctx.fillStyle=effect.color;ctx.fillText(effect.text,width/2,height*.57);
    }
    ctx.restore();
  }
  function drawNameplates() {
    const mobile=width<500, barWidth=mobile?49:70;
    for(const [id,p] of displayPositions){
      const actor=unit(id), hp=health.get(id)?.shown??actor.hp, isSelected=id===selected;
      if(bonded(actor)||actor.eliminated||(hp<=0&&!isSelected))continue;
      const x=p.labelX??p.x,y=p.foot+12;
      ctx.save();ctx.textAlign='center';ctx.font='700 '+(mobile?8:10)+'px "Segoe UI", sans-serif';
      ctx.lineWidth=3;ctx.strokeStyle='#253d32';ctx.fillStyle=isSelected?'#fff0b2':'#f4f2dd';
      const name=(actor.slot?'':'♛ ')+actor.name+(model.group&&!actor.side?' · P'+(actor.ownerIndex+1):'');
      ctx.strokeText(name,x,y);ctx.fillText(name,x,y);
      if(model.training&&actor.side===1){ctx.restore();continue;}
      ctx.fillStyle='#162e28';ctx.fillRect(x-barWidth/2-1,y+5,barWidth+2,7);
      ctx.fillStyle=actor.side?'#d4a7d6':'#cae69a';ctx.fillRect(x-barWidth/2,y+6,barWidth*hp/actor.maxHp,4);
      if(actor.shield>0){ctx.fillStyle='#ffe7a0';ctx.fillRect(x-barWidth/2,y+6,barWidth*Math.min(1,actor.shield/actor.maxHp),1.5);}
      if(isSelected||!mobile){
        ctx.font=(mobile?7:8)+'px "Segoe UI", sans-serif';ctx.fillStyle='#e9efd4';
        ctx.strokeText(hp>0?hp+' / '+actor.maxHp:'DEFEATED',x,y+22);ctx.fillText(hp>0?hp+' / '+actor.maxHp:'DEFEATED',x,y+22);
      }
      ctx.restore();
    }
  }
  function draw(now, phase = 0) {
    if (!model || !stage.clientWidth || $('#panel-battle').hidden) return;
    if (geometryDirty || stage.clientWidth !== width || stage.clientHeight !== height) resize();
    const delta = lastNow ? Math.min(.1, Math.max(0, (now - lastNow) / 1000)) : 0; lastNow = now;
    if (model.ended) endTail = Math.min(2, endTail + delta);
    // Interpolate within the fixed simulation tick for smooth 60Hz presentation.
    // The accumulator is frozen by Pause and never feeds back into combat rules.
    const time = model.time + (model.ended ? endTail : Math.max(0, Math.min(BondGame.DT, phase)));
    // Paused and settled result screens do not need repeated canvas/DOM work.
    // Resizing still invalidates the frame, including while paused.
    if (time === lastDrawTime && !needsPaint) return;
    lastDrawTime = time; needsPaint = false;
    updateHealth(time);
    ctx.clearRect(0, 0, width, height);
    place(model.ended ? 1 : Math.max(0, Math.min(1, phase / BondGame.DT)));
    const inspected = unit(selected), anchor = positions.get(selected);
    if (anchor && inspected.hp > 0 && !model.ended) {
      const intent = model.intent(inspected), reach = model.reach(inspected, model.offensive(intent.skill) ? intent.skill : null);
      ctx.save(); ctx.strokeStyle = '#f1e5a6'; ctx.globalAlpha = .24; ctx.lineWidth = 1;
      ctx.setLineDash([4, 7]); ctx.beginPath(); ctx.ellipse(anchor.x, anchor.foot, reach / 100 * width, reach / 46 * height * .42, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      const guardedTrainer = positions.get(inspected.side + '-0');
      if (model.has(inspected, 'guard') && guardedTrainer) {
        ctx.save(); ctx.strokeStyle = '#f8d981'; ctx.globalAlpha = .4; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.moveTo(anchor.x, anchor.foot); ctx.lineTo(guardedTrainer.x, guardedTrainer.foot); ctx.stroke(); ctx.restore();
      }
    }
    // Quiet ambient motes. Their time also freezes when combat is paused.
    if (!reducedMotion.matches) {
      for (let i = 0; i < 13; i++) {
        const x = (i * 173 + Math.sin(time * .25 + i) * 12) % width;
        const y = height * .24 + ((i * 61 - time * (2 + i % 3)) % (height * .72) + height * .72) % (height * .72);
        circle(x, y, i % 3 === 0 ? 1.7 : .9, '#f7f1ac', .15 + .2 * Math.abs(Math.sin(i + time * .6)));
      }
      ctx.globalAlpha = 1;
    }
    if(model.bossCharge&&!model.ended) {
      const charge=Math.min(1,(model.time-model.bossCharge.started)/(model.bossCharge.until-model.bossCharge.started));
      ctx.save();ctx.strokeStyle='#ffc777';ctx.fillStyle='#efab4220';ctx.lineWidth=3;ctx.globalAlpha=.35+charge*.4;
      ctx.beginPath();ctx.ellipse(width*.5,height*.60,width*.46,height*.25,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#ffe7a3';ctx.beginPath();ctx.ellipse(width*.5,height*.60,width*.46*charge,height*.25*charge,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    displayPositions.clear();
    for (const [id, node] of nodes) {
      const actor = unit(id), motion = motions.get(id), hit = hits.get(id), start = positions.get(id);
      let dx = 0, dy = 0, tilt = 0, squash = 1, lift = 0;
      let attackPose = 0, castPose = 0, hitPose = 0;
      if (motion && start) {
        const age = time - motion.born, target = positions.get(motion.target);
        if (age >= motion.life) motions.delete(id);
        else if (age >= 0 && target) {
          const contact = motion.contact, hold = contact + .055;
          let reach = 0;
          if(age<contact*.25)reach=-.18*Math.sin(age/(contact*.25)*Math.PI*.5);
          else if (age < contact) {const q=(age-contact*.25)/(contact*.75);reach=-.18+1.18*(1-(1-q)**3);}
          else if (age < hold) reach = 1;
          else { const q = (age - hold) / (motion.life - hold); reach = 1 - q * q * (3 - 2 * q); }
          const distance = Math.hypot(target.x - start.x, target.y - start.y) || 1;
          // Actual travel belongs to the simulator. This is only a short jab
          // from an already-in-range position, never a cross-arena teleport.
          const amount = reach * Math.min(width < 500 ? 10 : 22, distance * .22);
          dx = (target.x - start.x) / distance * amount; dy = (target.y - start.y) / distance * amount;
          lift = motion.heavy ? -Math.sin(Math.max(0, reach) * Math.PI) * 3 : -Math.sin(Math.max(0, reach) * Math.PI) * 17;
          tilt = (target.x > start.x ? 1 : -1) * (motion.heavy ? 10 : 14) * Math.max(0, reach);
          squash = age >= contact && age < hold ? .94 : 1;
          attackPose = Math.max(0,reach);
        }
      }
      const cast = casts.get(id);
      if (cast) {
        const p = (time - cast.born) / cast.life;
        if (p >= 1) casts.delete(id);
        else if (p >= 0 && !motion) { castPose=Math.sin(p*Math.PI); lift=-castPose*4; squash=1+castPose*.025; }
      }
      if (hit) {
        const p = (time - hit.born) / hit.life;
        if (p >= 1) hits.delete(id);
        else if (p >= 0) { hitPose=Math.sin(p*Math.PI)*hit.power; dx+=Math.sin(p*Math.PI*4)*3*(1-p); }
      }
      const art = node.querySelector('.fighter-art');
      const walking = actor.hp > 0 && !model.ended && actor.moving && !motions.has(id) && !casts.has(id);
      if (walking) {
        const stride = time * (actor.role === 'Tank' ? 10 : 16) + actor.slot*1.7 + actor.side * rate(actor);
        lift -= Math.abs(Math.sin(stride)) * (actor.role === 'Tank' ? 2 : ['stormowl','lumimoth','cindrake'].includes(actor.type) ? 4 : 3);
        tilt += Math.sin(stride) * (actor.role === 'Tank' ? 2 : 4);
        squash += Math.sin(stride * 2) * .025;
        const step=Math.floor(time/(actor.type==='stonehorn'?.42:.28));
        if(!quietFX&&!reducedMotion.matches&&actor.type!=='stormowl'&&lastDust.get(id)!==step){lastDust.set(id,step);add({type:'dust',target:id,theme:'stone',life:.38});}
      }
      const death=deaths.get(id), fallen=death?Math.max(0,Math.min(1,(time-death.born)/death.life)):0;
      const isDead=(health.get(id)?.shown??actor.hp)<=0;
      if(isDead){tilt+=fallen*23;lift+=fallen*8;squash*=1-fallen*.16;}
      const intent=model.intent(actor), pending=Math.max(0,actor.actionRemaining-phase*rate(actor));
      const windup=!model.ended&&actor.hp>0&&!motion&&!cast&&model.inRange(actor,intent.target,intent.skill)&&pending>0&&pending<.22?1-pending/.22:0;
      if(windup&&!reducedMotion.matches){squash*=1-windup*.05;tilt-=windup*4;}
      const facing = positions.get(actor.moveTargetId || actor.targetId);
      if(rigs.get(id)?.animated){tilt*=.25;lift*=.4;squash=1+(squash-1)*.3;}
        if(model.fleeing(actor)&&!model.ended)node.classList.add('facing-left');
        else if (facing && start && Math.abs(facing.x - start.x) > 2) node.classList.toggle('facing-left', facing.x < start.x);
      if (reducedMotion.matches) { dx = 0; dy = 0; lift = 0; tilt = 0; squash = 1; }
      node.style.transform = 'translate(-50%, -50%) translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px)';
      art.style.transform = 'translateY(' + lift.toFixed(2) + 'px) rotate(' + tilt.toFixed(2) + 'deg) scaleY(' + squash.toFixed(3) + ')';
      art.style.filter=hitPose>.05&&!reducedMotion.matches&&BondSettings.snapshot().flashes?'brightness('+ (1+hitPose*.9).toFixed(2)+') drop-shadow(0 4px 2px #17392b44)':'';
      node.style.opacity=actor.eliminated?'.25':isDead?(1-fallen*.72).toFixed(2):'1';
      node.dataset.motion=isDead?'defeated':model.ended&&model.winner===actor.side?'victory':motion?'attack':cast?'cast':walking?'walk':windup?'windup':hitPose?'hit':'idle';
      CharacterRig.pose(rigs.get(id),{time,walking,rate:rate(actor),attack:attackPose,casting:castPose,windup,hit:hitPose,fallen,channeling:model.channeling(actor),victory:model.ended&&actor.hp>0&&model.winner===actor.side,reduced:reducedMotion.matches});
      if(model.ritual?.state==='complete'&&actor.side===1){
        const home=positions.get('0-0'),q=reducedMotion.matches?1:Math.min(1,endTail/1.2);
        if(home&&start)node.style.transform='translate(-50%,-50%) translate('+((home.x-start.x)*q)+'px,'+((home.y-start.y)*q-30*Math.sin(q*Math.PI))+'px) scale('+(1-q*.85)+')';
        node.style.opacity=String(1-q);node.dataset.motion='bound';
      }
      node.classList.toggle('is-acting', motions.has(id) || casts.has(id));
      node.style.zIndex = actor.hp <= 0 ? 2 : motions.has(id) ? 9 : Math.round((start?.centerY || 0) / height * 5) + 3;
      if (start) displayPositions.set(id, {...start, x:start.x + dx, y:start.y + dy + lift, foot:start.foot + dy});
    }
    // Small label separation keeps two combatants' health from reading as one
    // number on phones. Only nameplates shift; sprites and combat positions do not.
    const plates = [...displayPositions].filter(([id]) => !bonded(unit(id))&&(unit(id).hp > 0 || id === selected)).map(([id,p]) => ({id, x:p.x, origin:p.x, y:p.foot}));
    const gap = width < 500 ? 59 : 88;
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < plates.length; i++) for (let j = i + 1; j < plates.length; j++) {
        const a = plates[i], b = plates[j], dx = b.x - a.x;
        if (Math.abs(a.y - b.y) > 29 || Math.abs(dx) >= gap) continue;
        const push = (gap - Math.abs(dx)) * .5, sign = dx >= 0 ? 1 : -1;
        a.x -= sign * push; b.x += sign * push;
      }
      for (const p of plates) p.x = Math.max(gap / 2, Math.min(width - gap / 2, Math.max(p.origin - 25, Math.min(p.origin + 25, p.x))));
    }
    for (const [id, node] of nodes) {
      const plate = plates.find(p => p.id === id);
      node.style.setProperty('--vitals-x', plate ? (plate.x - plate.origin).toFixed(2) + 'px' : '0px');
      if (plate) displayPositions.get(id).labelX = plate.x;
    }
    effects = effects.filter(effect => time - effect.born < effect.life);
    // Ground magic is rendered before projectiles/impacts; names and health are
    // last, above every character and spell. No body can hide another unit's HP.
    const ground = new Set(['sigil','shockwave','heal','nova','dust']);
    for (const effect of effects.filter(e=>ground.has(e.type))) drawEffect(effect,time);
    for (const effect of effects.filter(e=>!ground.has(e.type))) drawEffect(effect,time);
    drawRitual(time);
    drawNameplates();
    const shakeAge=time-shake.born, power=!quietFX&&!reducedMotion.matches&&BondSettings.snapshot().shake&&shakeAge>=0&&shakeAge<shake.life?shake.power*(1-shakeAge/shake.life):0;
    $('#battle-world').style.transform='translate('+ (Math.sin(shakeAge*91)*power).toFixed(2)+'px,'+(Math.cos(shakeAge*73)*power*.5).toFixed(2)+'px)';
  }
  function setPlaying(playing) { stage.classList.toggle('paused', !playing); }
  function drawRitual(time){
    const r=model.ritual;if(!r||!['channeling','complete'].includes(r.state))return;
    const a=displayPositions.get('0-0'),b=displayPositions.get(r.targetId);if(!a||!b)return;
    const tail=r.state==='complete'?Math.max(0,1-endTail/1.8):1;if(!tail)return;
    const pulse=reducedMotion.matches?0:Math.sin((time-r.started)*Math.PI*2)*.08;
    ctx.save();ctx.globalAlpha=(.7+pulse)*tail;ctx.strokeStyle='#d9eeb0';ctx.lineWidth=2;
    ctx.setLineDash([5,7]);ctx.lineDashOffset=reducedMotion.matches?0:-time*16;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2,Math.min(a.y,b.y)-55,b.x,b.y);ctx.stroke();ctx.setLineDash([]);
    for(const p of [a,b]){
      ctx.fillStyle='#82d0a31c';ctx.strokeStyle='#d5e9a7';ctx.beginPath();ctx.ellipse(p.x,p.foot,36,13,0,0,Math.PI*2);ctx.fill();ctx.stroke();
      for(let i=0;i<4;i++){const angle=i*Math.PI/2+(reducedMotion.matches?0:time*.55);const x=p.x+Math.cos(angle)*37,y=p.foot+Math.sin(angle)*13;
        ctx.fillStyle=i<r.pulses?'#f3e6a2':'#88bfa4';ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-3,-3,6,6);ctx.restore();}
    }
    ctx.fillStyle='#fcf0b9';ctx.strokeStyle='#264c3c';ctx.lineWidth=4;ctx.font='bold 12px Georgia';ctx.textAlign='center';
    const label=r.state==='complete'?'WELCOME HOME':'BONDING · '+r.pulses+' / 4';
    ctx.strokeText(label,(a.x+b.x)/2,Math.min(a.y,b.y)-45);ctx.fillText(label,(a.x+b.x)/2,Math.min(a.y,b.y)-45);ctx.restore();
  }
  window.CombatView = {mount, addUnit, render, onEvent, draw, setPlaying, select,impactAudit:()=>impactAudit.map(x=>({...x})),
    inspect: () => ({selected, focus:focusId, effects:effects.length, motions:motions.size, casts:casts.size, rigs:rigs.size, animation:[...rigs].map(([id,r])=>({id,type:r.type,animated:r.animated,frame:r.frame,mode:r.mode,ready:r.sheet?.ready||false})), quietFX, health:[...health].map(([id,h])=>({id,shown:h.shown,pending:h.queue.length})), walking:model?.units.filter(u=>u.hp>0&&u.moving&&!model.ended).map(u=>u.id), effectTypes:effects.map(e=>e.type), themes:[...new Set(effects.map(e=>e.theme).filter(Boolean))], visualTime:lastDrawTime, positions:[...displayPositions].map(([id,p])=>({id,...p})), width, height})};
})();
