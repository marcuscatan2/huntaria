(function () {
  'use strict';
  const G = BondGame, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const KEY = BondProfile.BUILD_KEY, guilds = ['Grove', 'Dusk'];
  let build = G.soloBuild(), battle = null, running = false, speed = 1, elapsed = 0, lastFrame = 0, seenEvents = 0, saveAvailable = true;
  const tabs = ['region','loadout','battle'], recordedEncounters = new WeakSet();
  let activeTab = 'region', encounterId = null, committed = false;
  let practiceParties=1;
  try { const saved = JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('bond-bolt-build-v3'+(BondProfile.TEST?'-sandbox':''))||(!BondProfile.TEST&&BondProfile.snapshot().migration&&(localStorage.getItem('bond-bolt-build-v2')||localStorage.getItem('bond-bolt-build-v1')))); build = G.migrateBuild(saved)||build; } catch (_) { saveAvailable = false; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(build)); saveAvailable = true; } catch (_) { saveAvailable = false; } $('#save-status').textContent = saveAvailable ? 'Saved on this device' : 'Session only · storage unavailable'; }
  // Shared illustrated sprites for loadouts, portrait buttons, and battle.
  const art = type => CharacterRig.art(type);
  function ensureOwnedBuild(){
    build[0]=BondProfile.migrateParty(build[0]);
    const used=new Set();
    for(let i=1;i<3;i++){const u=build[0][i];if(u&&used.has(u.instanceId))build[0][i]=null;if(build[0][i])used.add(build[0][i].instanceId);}
  }
  ensureOwnedBuild();
  function renderTeams() { BondMenu.render(); }
  function switchTab(tab) {
    if (!tabs.includes(tab)) return;
    activeTab=tab;
    document.body.classList.toggle('combat-mode', tab === 'battle');
    document.body.classList.toggle('region-mode', tab === 'region');
    if (tab !== 'battle') { if(battle&&encounterId)BondProfile.checkpoint(battle); }
    tabs.forEach(name => { const active=name===tab; $('#tab-'+name).classList.toggle('active',active); $('#tab-'+name).setAttribute('aria-selected',active); $('#tab-'+name).tabIndex=active?0:-1; $('#panel-'+name).hidden=!active; });
    BondLoot.placeLevel();
    if(tab==='region')BondRegion.enter(build);else BondRegion.leave();
    if (tab === 'battle' && !battle) prepareBattle();
    if (tab === 'loadout') renderTeams();
    updateAudio();
  }
  function invalidate() { ensureOwnedBuild();const saved=BondProfile.snapshot().encounterSave;if(battle&&!battle.ended&&(encounterId?saved?.attempt===battle._attemptId:running)){save();renderTeams();return;} battle=null; encounterId=null; running=false; elapsed=0; seenEvents=0; $('#scoreboard').hidden=true;Bonding.reset(); save(); renderTeams(); }
  function changeUnit(side,slot,ref) {
    if (![0,1].includes(side)||![0,1,2].includes(slot))return false;
    if(slot>0&&(ref===null||ref==='')){build[side][slot]=null;invalidate();return true;}
    let next;
    if(!slot){if(side===0&&BondProfile.snapshot().character&&!BondProfile.snapshot().character.legacy)return false;if(!BondContent.CLASSES.includes(ref))return false;next={type:ref,skills:[...G.UNITS[ref].default]};}
    else if(side===0){
      let mon=BondProfile.getCompanion(ref);
      if(!mon){const matches=BondProfile.companions(ref);if(matches.length===1)mon=matches[0];}
      if(!mon)return false;
      next={type:mon.type,instanceId:mon.id,skills:[...mon.skills]};
    }else{if(!G.MONSTERS.includes(ref))return false;next={type:ref,instanceId:'practice:'+slot,skills:[...G.UNITS[ref].default]};}
    const existing=slot?build[side].findIndex((u,i)=>i!==slot&&u?.instanceId&&u.instanceId===next.instanceId):-1;
    if(existing>=0)[build[side][slot],build[side][existing]]=[build[side][existing],build[side][slot]];
    else if(build[side][slot]?.type!==next.type||build[side][slot]?.instanceId!==next.instanceId)build[side][slot]=next;
    invalidate();return true;
  }
  function changeSkills(side,slot,skills) {
    const candidate=JSON.parse(JSON.stringify(build));
    if(!candidate[side]?.[slot])return false;
    candidate[side][slot].skills=skills;
    if(!G.validBuild(candidate))return false;
    if(side===0&&slot>0)return BondProfile.setSkills(candidate[side][slot].instanceId,skills);
    build=candidate;invalidate();return true;
  }
  function autoAssign(instanceId){const open=[1,2].find(i=>!build[0][i]);return open?changeUnit(0,open,instanceId):false;}
  $('#reset-loadouts').onclick=()=>{build=G.soloBuild();invalidate();};
  tabs.forEach(tab=>$('#tab-'+tab).onclick=()=>switchTab(tab));
  $('#edit-build').onclick=()=>switchTab('loadout');
  $('#return-region').onclick=()=>{switchTab('region');$('#region-map').focus({preventScroll:true});};
  $('.brand').onclick=e=>{e.preventDefault();switchTab('region');};
  $$('.tab').forEach(button=>button.addEventListener('keydown', e=>{
    if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
      e.preventDefault();const index=tabs.indexOf(button.id.slice(4));
      const tab=e.key==='Home'?tabs[0]:e.key==='End'?tabs.at(-1):tabs[(index+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];
      switchTab(tab);$('#tab-'+tab).focus();
    }
  }));
  function prepareBattle() {
    const fightBuild=JSON.parse(JSON.stringify(build)),npc=BondProfile.encounter(encounterId),profile=BondProfile.snapshot(),adventure=!!npc&&!npc.practice;
    if(adventure)fightBuild[0]=BondAdventure.deploy(profile,fightBuild[0]);
    if(npc?.team)fightBuild[1]=JSON.parse(JSON.stringify(npc.team));
    guilds[1]=npc?npc.name:'Dusk';
    const options={worldAnchor:BondRegion.anchor(npc),adventure,growth:profile.growth,profile,enemyLevel:npc?.kind==='boss'?(npc.practice?profile.bossLevel:npc.level):typeof npc?.level==='number'?npc.level:1,seed:npc?.seed??1,encounter:npc?.kind?npc:null};
    if(npc?.practice&&npc.kind==='boss'&&practiceParties>1){
      options.groupParties=Array.from({length:practiceParties-1},(_,i)=>{const team=JSON.parse(JSON.stringify(fightBuild[0])),type=i?'druid':'mage';team[0]={type,skills:[...G.UNITS[type].default]};return {team,profile:options.profile,formation:options.profile.formation};});
      const def=BondCampaign.bosses[npc.enemies[0].type];options.encounter=JSON.parse(JSON.stringify(npc));options.encounter.enemies[0].hp=Math.round(npc.enemies[0].hp*def.scale(practiceParties));
      const adds=G.MONSTERS.filter(t=>G.UNITS[t].source==='wild'&&G.UNITS[t].region===G.UNITS[def.type].region).slice(0,3);
      options.encounter.enemies.push(...adds.map(type=>({type,skills:[...G.UNITS[type].default],hp:180,power:10,skillScale:.25,passive:null})));
    }
    battle=BondProfile.restoreBattle(encounterId)||new G.Battle(fightBuild,options);battle._initialOptions=options;
    battle._encounterId=encounterId;battle.ticketId=BondProfile.ticket(encounterId)?.id; committed=!!battle._supplyReceipt; running=false; elapsed=0;seenEvents=battle.events.length;lastFrame=0;
    if(npc?.kind==='boss'){guilds[1]=npc.name+' · Lv '+(npc.practice?BondProfile.snapshot().bossLevel:npc.level);}
    Bonding.reset(battle);
    if(npc&&!npc.kind){battle.trainer(1).appearance=CharacterRig.npcAppearance(npc,encounterId);battle.trainer(1).name=npc.name;}
    const scene=BondWorld.SCENES.find(s=>s.id===(npc?.area||BondProfile.snapshot().area))||BondWorld.SCENES[0];
    $('#arena').classList.toggle('cave-arena',npc?.route==='cave');
    $('#arena').style.setProperty('--battle-scene',"url('"+scene.image+"')");
    $('.scene-label').innerHTML=((npc?.map?BondAtlas.get(npc.map).name:scene.name)+(npc?.route?' · '+npc.route:'' )).toUpperCase()+'<span>Select a companion to inspect its skills</span>';
    $('#dusk-bond-text').parentElement.firstChild.textContent=guilds[1].toUpperCase()+' ';

    mountFighters();
    $('#boss-warning').hidden=true;
    $('#combat-log').innerHTML='<li class="empty-log">Every bond has a beginning.</li>';$('#event-count').textContent='0 EVENTS';$('#scoreboard').hidden=true;$('#battle-effects').innerHTML='';$('#arena').classList.remove('overtime');
    $('#result').className='result-card';$('#result').innerHTML='<p class="eyebrow">THE OBJECTIVE</p><h3>Protect the bond.</h3><p>Monster health is a resource.<br>Your trainer’s health is the game.</p>';
    if(npc?.kind)$('#result').innerHTML='<p class="eyebrow">'+npc.kind.toUpperCase()+' ENCOUNTER</p><h3>Protect your trainer.</h3><p>Defeat '+(npc.kind==='boss'?npc.name:npc.kind==='wild'?npc.name:'every wild creature')+' before 75 seconds. No opposing trainer.</p>';
    if(npc?.kind==='wild')$('#result').innerHTML='<p class="eyebrow">WILD ENCOUNTER</p><h3>'+npc.name+'</h3><p>Defeat the enemy.</p>';
    $('#battle-description').textContent='Your choices do the fighting. Keep an eye on the trainers.';renderBattle();updateControls();
  }
  const fighterMarkup=u=>`<div class="fighter ${u.boss?'boss ':''}${u.side?'enemy':''}" data-id="${u.id}" data-type="${u.type}" role="button" tabindex="0" aria-pressed="false" aria-label="Inspect ${guilds[u.side]} ${u.name}"><div class="status-row"></div><div class="fighter-art">${art(u.appearance||u.type)}</div><div class="fighter-name">${u.slot===0?'<span class="trainer-crown">♛</span> ':''}${u.name}</div><div class="fighter-hp" role="progressbar" aria-label="${guilds[u.side]} ${u.name} health" aria-valuemin="0" aria-valuemax="${u.maxHp}"><div class="hp-fill"></div><div class="shield-fill"></div></div><div class="hp-text"></div><div class="mini-cooldowns">${u.skills.map(id=>`<div class="mini-cd" title="${G.SKILLS[id].name}"><i></i></div>`).join('')}</div></div>`;
  function mountFighters(){
    $('#units').innerHTML=battle.units.map(fighterMarkup).join('');
    CombatView.mount(battle,art);
  }
  function joinWild(spawnId,position){
    if(!running||!battle||battle.ended)return false;
    const unit=BondProfile.joinBattle(battle,spawnId,position);if(!unit)return false;
    $('#units').insertAdjacentHTML('beforeend',fighterMarkup(unit));CombatView.addUnit(unit);
    updateControls();renderBattle();return true;
  }
  function updateControls() {
    const escaping=!!battle?.escape&&!battle.ended;
    $('#run-battle').disabled=!battle||battle.ended||escaping;
    $('#run-battle').textContent=escaping?'Running…':'Run';
    CombatView.setPlaying(running);
    updateAudio();
    $('#start-battle').disabled=running; $('#start-battle').textContent=battle?.ended?'↺ Play again':battle?.time>0?'▶ Resume':'▶ Begin battle';
    $('#pause').disabled=!running;$('#battle-state-label').textContent=battle?.ended?'FINISHED':running?'IN BATTLE':battle?.time>0?'PAUSED':'READY';
    const sealed=!!encounterId&&(battle?.ended&&!!battle?.encounter||!!BondProfile.snapshot().encounterSave);
    $('#restart').disabled=!!sealed;
    if(sealed&&battle?.ended){$('#start-battle').disabled=true;$('#start-battle').textContent='Encounter complete';}
  }
  function start() {
    if(encounterId&&!BondProfile.validEncounter(encounterId)){running=false;updateControls();return false;}
    if(!battle || battle.ended)prepareBattle();
    const injured=battle.adventure&&!BondProfile.snapshot().encounterSave&&BondAdventure.readiness(BondProfile.snapshot(),build[0]);if(injured){$('#battle-description').textContent=injured;return false;}
    if(!BondProfile.reserveBattle(battle,encounterId,battle._initialOptions)){$('#battle-description').textContent='Could not start. Resume the saved fight in Explore, or retry saving.';return false;}
    if(!committed){const receipt=BondProfile.consumePrepared(battle);if(!receipt)return false;committed=true;if(receipt.biscuit)battle.shield(battle.trainer(0),battle.trainer(0),80,10,'Bond Biscuit');if(receipt.ration)for(const u of battle.team(0)){u.hp=Math.round(u.hp*1.1);u.maxHp=Math.round(u.maxHp*1.1);}renderBattle();}
    running=true;lastFrame=0;updateControls();
    return true;
  }
  $('#fight').onclick=()=>{if(BondProfile.snapshot().encounterSave){startRegionBattle(BondProfile.snapshot().encounterSave.id);return;}encounterId=null;prepareBattle();switchTab('battle');$('#panel-battle').scrollIntoView({behavior:'smooth',block:'start'});start();};
  function startRegionBattle(id,options={}) {
    const npc=BondProfile.encounter(id);
    if(!npc||!BondProfile.validEncounter(id))return false;
    const injured=!npc.practice&&!BondProfile.snapshot().encounterSave&&BondAdventure.readiness(BondProfile.snapshot(),build[0]);if(injured){document.querySelector('#region-message').textContent=injured;return false;}
    let levelChanged=false;
    if(npc.kind==='boss'&&npc.practice){
      practiceParties=[1,2,3].includes(options.practiceParties)?options.practiceParties:1;
      const selected=options?.bossLevel??BondProfile.snapshot().bossLevel;
      if(!BondProfile.setBossLevel(selected))return false;
      levelChanged=!!battle&&battle.units.find(u=>u.boss)?.level!==selected;
    }
    if(encounterId!==id||!battle||battle.ended||levelChanged){encounterId=id;prepareBattle();}
    const worldMap=BondAtlas.get(npc.map||BondProfile.snapshot().map),backdrop=window.WorldRenderer?.battleBackdrop(worldMap);if(backdrop)$('#arena').style.backgroundImage='url("'+backdrop+'")';
    switchTab('battle');if(!start())return false;
    $('#battle-description').textContent=npc.name+' · '+npc.title+(npc.kind?' · Defeat every enemy. Your trainer must survive.':' · A fixed NPC team. Your party is from Party & bag.');
    if(npc.kind==='boss')$('#battle-description').textContent=npc.practice?npc.name+' · Test level '+BondProfile.snapshot().bossLevel+' · '+(battle.group?'Simulated allied parties, NOT online players. All allied trainers must fall to lose.':'Your party alone.')+' Reward-free practice: no coins, XP or essence.':npc.name+' · Lv '+npc.level+' · Defeat the guardian. Your trainer must survive.';
    if(npc.kind==='wild')$('#battle-description').textContent=npc.name+' · Lv '+npc.level;
    $('#return-region').focus({preventScroll:true});
    $('#panel-battle').scrollIntoView({block:'start'});
    return true;
  }
  function cancelRegionBattle() {
    const saved=BondProfile.snapshot().encounterSave;
    const current=saved?(battle?._attemptId===saved.attempt?battle:BondProfile.restoreBattle(saved.id)):null;
    if(current?.ended){const receipt=BondProfile.complete(current,saved.id);if(!receipt||receipt.pending)return false;}
    else if(current){BondProfile.settleKills(current,saved.id);if(!BondProfile.checkpoint(current))return false;}
    if(!BondProfile.abandonBattle())return false;
    if(encounterId||saved){battle=null;running=false;elapsed=0;seenEvents=0;$('#scoreboard').hidden=true;updateControls();}
    encounterId=null;
    Bonding.reset();
    return true;
  }
  function runFromBattle() {
    const saved=BondProfile.snapshot().encounterSave;
    if(saved&&battle?._attemptId!==saved.attempt){encounterId=saved.id;prepareBattle();}
    if(!battle)return false;
    if(battle.ended){finish();return true;}
    if(!committed&&!start())return false;
    if(!battle.escape&&!BondProfile.requestEscape(battle)){
      const text=BondProfile.error()||'Could not save the escape attempt. Try again.';
      $('#battle-description').textContent=text;$('#region-message').textContent=text;return false;
    }
    running=true;lastFrame=0;updateControls();renderBattle();return true;
  }
  $('#run-battle').onclick=runFromBattle;
  $('#start-battle').onclick=start;$('#pause').onclick=()=>{running=false;if(battle&&encounterId)BondProfile.checkpoint(battle);updateControls();};$('#restart').onclick=()=>{if(encounterId&&BondProfile.snapshot().encounterSave)return;prepareBattle();start();};
  function setPlaybackSpeed(value){
    const allowed=BondProfile.TEST?[1,2,5]:[1,2];if(!allowed.includes(value))return false;
    speed=value;$$('[data-speed]').forEach(b=>{const selected=+b.dataset.speed===value;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});return true;
  }
  $$('[data-speed]').forEach(button=>button.onclick=()=>setPlaybackSpeed(+button.dataset.speed));
  window.addEventListener('pagehide',()=>{if(battle&&encounterId)BondProfile.checkpoint(battle);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden && running){running=false;if(battle&&encounterId)BondProfile.checkpoint(battle);updateControls();}});
  function updateAudio(){BondAudio.scene(activeTab==='battle'?'combat':activeTab==='loadout'&&BondMenu.current()==='collection'?'innersea':'explore',activeTab==='battle'&&!running&&!battle?.ended);}
  const tone=cue=>BondAudio.impact(cue);
  function flash(event) {
    CombatView.onEvent(event);
    const cue={telegraph:'warning',phase:'phase',dodge:'dodge',shield:'shield',guard:'guard'}[event.kind];
    if(cue)BondAudio.play(cue);
  }
  let lastRenderedTick=-1, lastRenderedBattle=null;
  function renderBattle() {
    if(!battle)return;
    if(encounterId){BondProfile.settleKills(battle,encounterId);if(battle.tick%20===0||battle.ended)BondProfile.checkpoint(battle);}
    if(lastRenderedBattle===battle&&lastRenderedTick===battle.tick&&seenEvents===battle.events.length)return;
    lastRenderedBattle=battle;lastRenderedTick=battle.tick;
    if(battle.escape&&!battle.ended){
      const text='Running… '+Math.max(0,(battle.escape.untilTick-battle.tick)*G.DT).toFixed(1)+'s';
      $('#run-battle').textContent=text;$('#field-withdraw').textContent=text;$('#field-withdraw').disabled=true;
      $('#battle-description').textContent='Running! Enemies can still hit you.';
    }
    $('#clock').innerHTML=`${String(Math.floor(battle.time/60)).padStart(2,'0')}:${String(Math.floor(battle.time%60)).padStart(2,'0')} <small>/ 01:15</small>`;
    $('#overtime-label').textContent=battle.overcharge?'OVERCHARGE · 2× DAMAGE · NO HEALS':'TRAINER FALLS · BOND BREAKS';$('#arena').classList.toggle('overtime',battle.overcharge);
    for(const u of battle.units){const el=$(`.fighter[data-id="${u.id}"]`);el.classList.toggle('dead',u.hp<=0);el.querySelector('.hp-fill').style.width=100*u.hp/u.maxHp+'%';el.querySelector('.shield-fill').style.width=Math.min(100,100*u.shield/u.maxHp)+'%';el.querySelector('.fighter-hp').setAttribute('aria-valuemax',u.maxHp);el.querySelector('.fighter-hp').setAttribute('aria-valuenow',u.hp);el.querySelector('.hp-text').textContent=u.hp>0?`${u.hp} / ${u.maxHp}${u.shield?' · ⬡ '+u.shield:''}`:'DEFEATED';el.querySelector('.status-row').innerHTML=Object.entries(u.status).filter(([s,v])=>v.until>battle.time).map(([s,v])=>`<span class="status-pill ${s}">${s.toUpperCase()} ${Math.ceil(v.until-battle.time)}s</span>`).join('');el.querySelectorAll('.mini-cd>i').forEach((bar,i)=>{bar.style.width=Math.max(0,100*(1-u.cds[i]/G.SKILLS[u.skills[i]].cd))+'%';bar.parentElement.title=`${G.SKILLS[u.skills[i]].name}: ${u.cds[i]>0?u.cds[i].toFixed(1)+'s':'ready'}`;});}
    const events=battle.events.slice(seenEvents);seenEvents=battle.events.length;
    for(const event of events) {flash(event);if(event.kind==='status')continue;const li=document.createElement('li');li.className=event.kind;const time=document.createElement('time');time.textContent=event.time.toFixed(1)+'s';const text=document.createElement('span');text.textContent=event.text;li.append(time,text);$('#combat-log .empty-log')?.remove();$('#combat-log').prepend(li);}
    while($('#combat-log').children.length>65)$('#combat-log').lastChild.remove();$('#event-count').textContent=battle.events.length+' EVENTS';
    CombatView.render(battle);
    Bonding.render(battle);
  }
  function beginOpening(){invalidate();switchTab('region');BondRegion.notice(BondOpening.text);document.querySelector('#region-map').focus({preventScroll:true});}
  const returnedBattles=new WeakSet(),soundedBattles=new WeakSet();
  function finish() {
    if(!battle?.ended)return;
    running=false;updateControls();const winner=battle.winner;
    if(!soundedBattles.has(battle)){soundedBattles.add(battle);BondAudio.play(battle.escaped?'escape':winner===0?'win':'loss');}
    if(encounterId&&battle.ended&&!recordedEncounters.has(battle)){
      const receipt=BondProfile.complete(battle,encounterId);if(receipt?.pending){BondLoot.show(battle,encounterId);return;}recordedEncounters.add(battle);
      if(BondProfile.TEST&&battle.adventure&&!battle.escaped)BondProfile.testing.heal();
      renderBattle();
    }
    if(battle.escaped){
      $('#result').className='result-card';$('#result').innerHTML='<h3>Escaped.</h3>';
      $('#battle-description').textContent='Escaped.';$('#scoreboard').hidden=true;
      if(!returnedBattles.has(battle)){
        returnedBattles.add(battle);
        if(activeTab!=='loadout')switchTab('region');
        BondRegion.escapeGrace();BondRegion.notice('Escaped.');
        const receipt=encounterId&&BondProfile.complete(battle,encounterId);
        if(receipt&&(receipt.kills||receipt.coins))BondLoot.show(battle,encounterId);
      }
      updateControls();return;
    }
    $('#result').className='result-card '+(winner===null?'':winner===0?'win-grove':'win-dusk');
    const loser=winner===null?null:battle.trainer(1-winner),lastHit=loser?[...battle.events].reverse().find(e=>e.kind==='damage'&&e.target===loser.id):null;
    $('#result').innerHTML=`<p class="eyebrow">${battle.time.toFixed(1)} SECONDS · ${battle.reason.toUpperCase()}</p><h3>${winner===null?'An unbroken tie.':guilds[winner]+' Guild wins.'}</h3><p>${lastHit&&battle.reason==='Trainer defeated'?lastHit.text:(battle.encounter?(winner===0?'Every enemy is defeated. Your trainer survived.':'Your trainer fell, or the encounter time limit expired.'):'The trainers’ remaining health decides the result.')}</p><button id="try-build" class="button secondary">Adjust & try again →</button>`;
    $('#try-build').onclick=()=>switchTab('loadout');
    if(encounterId){
      const back=document.createElement('button');back.id='result-region';back.className='button primary return-clearing';
      back.textContent=battle.adventure&&winner!==0?(BondProfile.snapshot().map===BondOpening.start.map?'Recovered · return to forest camp →':'Rescued · return to village →'):'Return to the region →';back.onclick=()=>{switchTab('region');$('#region-map').focus({preventScroll:true});};
      $('#result').append(back);
    }
    $('#battle-description').textContent='A result is a clue. Swap one skill and see what changes.';
    $('#scoreboard').hidden=false;$('#scoreboard').innerHTML=`<h3>Every companion made a difference.</h3><table><thead><tr><th>Unit</th><th>HP left</th><th>Damage</th><th>Healing</th><th>Shielded</th><th>Skills cast</th></tr></thead><tbody>${[0,1].map(side=>`<tr class="team-divider"><td colspan="6">${guilds[side].toUpperCase()} GUILD</td></tr>${battle.units.filter(u=>u.side===side).map(u=>`<tr><td>${u.slot===0?'♛ ':''}${u.name}</td><td>${u.hp}</td><td>${u.damage}</td><td>${u.healing}</td><td>${u.blocked}</td><td>${u.casts}</td></tr>`).join('')}`).join('')}</tbody></table>`;
    if(winner!==0){const hint=document.createElement('p');hint.className='loss-advice';const trainer=battle.trainer(0),bypass=battle.events.some(e=>e.kind==='damage'&&e.target===trainer.id&&e.text.includes('Hex'));hint.textContent=bypass?'A trainer-targeting spell reached you. Try a guard, shield or defensive formation.':build[0].slice(1).filter(Boolean).length===0?'Your trainer is alone. Try the level-2 Brimble in Firstlight Meadow, allocate attributes, and put a shield or heal in your priorities.':'Try moving your trainer back, adding protection, or changing damage elements. Your accepted wild kills and drops are kept.';$('#result').append(hint);}
    if(encounterId)BondJourney.result(battle,encounterId);
    updateControls();
    const encounter=encounterId&&BondProfile.encounter(encounterId);
    if(encounterId&&(winner===0&&(battle.encounter||encounter?.autoReturn)||winner!==0&&battle.adventure)&&recordedEncounters.has(battle)&&!returnedBattles.has(battle)){
      returnedBattles.add(battle);const finished=battle,id=encounterId;
      if(activeTab!=='loadout')switchTab('region');BondLoot.show(finished,id);if(winner!==0)BondRegion.notice(BondProfile.complete(finished,id).campRecovery?'You recover at Forest camp. Your party is fully rested.': 'You wake in '+BondAtlas.get(BondProfile.snapshot().map).name+'. The free sanctuary is close.');
    }
  }
  function frame(now) {
    BondRegion.frame(now);
    if(running&&battle){if(!lastFrame)lastFrame=now;elapsed+=Math.min(.04,(now-lastFrame)/1000)*speed;while(elapsed>=G.DT&&!battle.ended&&running){battle.step();elapsed-=G.DT;if(Bonding.shouldPause(battle)){running=false;elapsed=0;updateControls();}}renderBattle();if(battle.ended)finish();}
    CombatView.draw(now, elapsed);
    lastFrame=now;requestAnimationFrame(frame);
  }
  save();requestAnimationFrame(frame);
  // Small inspectable interface used by the browser tests, also useful for balancing.
  window.BondApp={beginOpening,isRunning:()=>running,getBuild:()=>JSON.parse(JSON.stringify(build)),getBattle:()=>battle,switchTab,prepareBattle,finish,renderBattle,startRegionBattle,cancelRegionBattle,runFromBattle,joinWild,getEncounter:()=>encounterId,getTab:()=>activeTab,changeUnit,changeSkills,autoAssign,setPlaybackSpeed,playbackSpeed:()=>speed,soundImpact:tone,inspectSound:()=>BondAudio.inspect()};

  document.addEventListener('bond-growth',invalidate);
  const patchNotes=$('#patch-notes');$('#open-patch-notes').onclick=()=>patchNotes.showModal();$('#close-patch-notes').onclick=()=>patchNotes.close();
  if(BondCreation.required()){
    document.body.classList.add('region-mode');BondCreation.open();BondBoot.ready();
  }else{
    const trainer=build[0][0]||{type:'druid'};
    CharacterRig.preload(trainer.type,trainer.weapon).finally(()=>{switchTab('region');BondBoot.ready();});
  }
})();
