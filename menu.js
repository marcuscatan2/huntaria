/* Preparation and Inner Sea collection. Empty companion slots are intentional. */
(function(){
'use strict';
const G=BondGame,P=BondProfile,A=BondAtlas,E=BondEchoes,host=document.querySelector('#teams'),art=t=>CharacterRig.art(t);
let tab='collection',side=0,slot=0,priority=0,filter='All',selected='emberfox',query='',page=0,collectionMode='farm',selectedInstance=null;
const dummyControls=document.querySelector('#panel-loadout>.play-strip');
const role=u=>u.role==='Trainer'?'CLASS':(u.designRole||(u.role==='Tank'?'Tank':u.role==='Support'?'Supp':'DPS')).toUpperCase();
const roleMatch=(u,wanted)=>wanted==='All'||wanted==='Owned'||wanted==='Damage'&&/(DPS|Fighter)/.test(u.designRole||u.role)||wanted==='Tank'&&(u.designRole||u.role).includes('Tank')||wanted==='Support'&&/(Supp|Support)/.test(u.designRole||u.role);
function source(type){const u=G.UNITS[type],h=A.home(type);return u.source==='boss'?'Group boss · '+A.REGIONS[u.region].name+'':h?A.get(h.map).name+'':'Trainer class';}
function typeSelect(type){
 if(!slot&&P.snapshot().character&&!P.snapshot().character.legacy)return '';
 return '<button class="button secondary visual-pick-button" data-replace-unit>Substitute '+(slot?'Companion':'Class')+'</button>';
}
function openPartyPicker(targetSlot){
 slot=targetSlot;priority=0;
 if(!side&&!slot&&P.snapshot().character&&!P.snapshot().character.legacy){render();host.querySelector('#menu-notice').textContent='Meet a class master to choose your class.';return;}
 const u=BondApp.getBuild()[side][slot];
 BondPicker.open({title:slot?'Choose companion for slot '+slot:'Choose trainer class',practice:!!side&&slot>0,classes:slot===0,allowEmpty:slot>0,selected:slot===0?u?.type:side?u?.type:u?.instanceId,returnSelector:'[data-slot="'+slot+'"]',onChoose:ref=>BondApp.changeUnit(side,slot,ref)});
}
function detail(type,entry=null,instanceId=null){
 if(!type)return '<section class="empty-companion"><span>✧</span><h3>Empty slot</h3><p>Summon a companion from a Soul Echo.</p>'+typeSelect(null)+'</section>';
 const state=P.snapshot(),mon=P.getCompanion(entry?.instanceId||instanceId),base={...(type==='apprentice'?BondOpening.base(state.character?.weapon):G.UNITS[type]),instanceId:mon?.id},preview=!!(entry&&side)||(!entry&&!mon&&base.role!=='Trainer'),bonus=BondGrowth.stats(type,preview?{}:mon?mon.growth:state.growth[type]);
 const editing=entry||(mon?{type,instanceId:mon.id,skills:[...mon.skills]}:null),displayName=mon?P.label(mon):entry&&!side&&!slot&&state.character?.name?state.character.name:type==='apprentice'&&!side?state.character?.name||base.name:base.name;
 const u={...base,...BondProgress.derived(type,state,base,preview?1:null)},passive=G.PASSIVES[u.passive],echoCount=state.inventory[E.key(type)]||0;
 u.hp=Math.round(u.hp*(1+bonus.hp));u.power=Math.round(u.power*(1+bonus.attack));u.speed*=1+bonus.speed;u.interval=100/u.speed;u.moveSpeed*=1+bonus.move;
 const category=BondRules.categoryLabel(base.basicCategory),supply=source(type);
 return '<div class="companion-detail"><div class="companion-profile" style="--unit-accent:'+u.color+'"><p class="eyebrow">'+(entry?(side?'PRACTICE OPPONENT':'YOUR PARTY'):mon?'INNER SEA':'SPECIES')+' / '+role(u)+'</p><div class="hero-creature">'+art(type)+'</div><h3>'+displayName+'</h3><span class="element-badge">Lv '+u.level+' · '+u.element+'</span><p class="creature-subtitle">'+u.subtitle+'</p>'+((u.visualFamily||u.family)?'<span class="element-badge">'+(u.visualFamily||u.family)+'</span>':'')+'<div class="stat-ribbon"><span><b>'+u.hp+'</b>MAX HP</span><span><b>'+u.power+'</b>ATK</span><span title="'+u.interval.toFixed(2)+' seconds per ready action"><b>'+u.speed.toFixed(1)+'</b>SPEED</span><span><b>'+(u.moveSpeed*8).toFixed(1)+'</b>MOVE</span></div><p class="reach-note">'+'Atk: '+({melee:'STR',ranged:'DEX',magic:'INT'}[base.basicCategory]||'STR')+' Based'+'</p>'+(!preview?'<button class="text-button" data-open-recovery>Recovery items</button>':'')+(passive?'<div class="passive-card"><small>INNATE</small><strong>'+passive.name+'</strong><p>'+passive.description+'</p></div>':'')+
 (entry?typeSelect(type):'<p class="habitat-source"><b>Source</b><br>'+supply+'</p><div class="collection-equip"><button class="button primary" data-add="1" '+(mon?'':'disabled')+'>Companion I</button><button class="button secondary" data-add="2" '+(mon?'':'disabled')+'>Companion II</button></div><button class="button primary summon-button" data-summon="'+type+'" '+(!echoCount?'disabled':'')+'>'+(echoCount?'Summon · '+echoCount+' Echo'+(echoCount>1?'es':'')+' owned':'No Soul Echo yet')+'</button>')+
 '<button class="button secondary open-tree-button" data-open-tree="'+(mon?.id||type)+'">Mastery tree</button></div><div class="ability-panel"><div class="ability-heading"><div><h3>Combat Skills</h3></div>'+(editing?'<button class="text-button" data-rotate>Rotate order</button>':'')+'</div>'+
 (editing?'<div class="priority-slots">'+editing.skills.map((id,i)=>'<button data-priority="'+i+'" class="priority-slot '+(priority===i?'selected':'')+'" aria-pressed="'+(priority===i)+'"><small>PRIORITY 0'+(i+1)+'</small><strong>'+G.SKILLS[id].icon+' '+G.SKILLS[id].name+'</strong></button>').join('')+'</div><p class="ability-help">Select a slot, then a skill.</p>':'<p class="ability-help"></p>')+
 '<div class="ability-pool">'+base.skills.map(id=>{const s=G.SKILLS[id],index=editing?.skills.indexOf(id)??-1,cd=s.cd*(1-Math.min(.5,u.cooldown+bonus.cooldown+(bonus.skillCooldown?.[id]||0))),power=bonus.skillPower?.[id]||0;return '<button class="ability-choice '+(index>=0?'equipped':'')+'" data-skill="'+id+'" '+(editing?'aria-pressed="'+(index>=0)+'"':'disabled')+'><span class="ability-icon">'+s.icon+'</span><span><strong>'+s.name+'</strong><small>'+s.tag+' · '+cd.toFixed(2)+'s cooldown'+(power?' · +'+Math.round(power*100)+'% tree effect':'')+' · '+BondRules.categoryLabel(s.category).replace(' · no damage scaling','')+'</small><p>'+s.description+(s.kind.includes('heal')||s.kind==='cleanse'?' Healing scales with INT.':'')+'</p></span><b class="ability-order">'+(index>=0?index+1:editing?'+':'')+'</b></button>';}).join('')+'</div></div></div>';
}
function partyView(build){
 side=0;
 return '<div class="party-toolbar"><strong>Party</strong></div><div class="party-lineup">'+build[side].map((u,i)=>'<button class="party-member '+(slot===i?'selected':'')+'" data-slot="'+i+'" aria-pressed="'+(slot===i)+'" style="--unit-accent:'+(u?G.UNITS[u.type].color:'#afbaab')+'"><span class="party-mini-art">'+(u?art(u.type):'<span class="empty-slot-symbol">✧</span>')+'</span><span><small>'+(i?'COMPANION 0'+i:'TRAINER')+'</small><strong>'+(u?(P.getCompanion(u.instanceId)?P.label(P.getCompanion(u.instanceId)):!side&&!i&&P.snapshot().character?.name?P.snapshot().character.name:u.type==='apprentice'&&!side?'Apprentice':G.UNITS[u.type].name):'Empty slot')+'</strong><em>'+(u?role(G.UNITS[u.type]):'Choose companion')+'</em></span></button>').join('')+'</div>'+(!side?'<button class="button secondary party-formation-button" data-menu="formation">Formation</button>':'')+detail(build[side][slot]?.type,build[side][slot]);
}
function catalogView(build){
 const ids=G.MONSTERS.filter(k=>(filter==='Owned'?P.owns(k):roleMatch(G.UNITS[k],filter))&&(!query||(G.UNITS[k].name+' '+G.UNITS[k].element+' '+(G.UNITS[k].designRole||'')+' '+(G.UNITS[k].visualFamily||G.UNITS[k].family)+' '+source(k)).toLowerCase().includes(query.toLowerCase())));
 if(ids.length&&!ids.includes(selected))selected=ids[0];
 const pages=Math.max(1,Math.ceil(ids.length/20));page=Math.min(page,pages-1);const shown=ids.slice(page*20,page*20+20),state=P.snapshot();
 return '<div class="haven-banner"><div><h3>Species guide</h3><span>'+state.owned.length+' / '+G.MONSTERS.length+' species summoned</span></div><div class="inner-sea-orbit" aria-hidden="true">✧</div></div><div class="library-heading"><div></div><div class="menu-filters">'+['All','Owned','Damage','Tank','Support'].map(f=>'<button data-filter="'+f+'" aria-pressed="'+(filter===f)+'" class="'+(filter===f?'selected':'')+'">'+f+'</button>').join('')+'</div></div><label class="collection-search">Search species, family, element or map<input id="collection-search" type="search" value="'+query.replace(/[&<>"]/g,'')+'" placeholder="e.g. Beast, Construct or Mosslight" autocomplete="off"></label><div class="collection-grid">'+shown.map(k=>'<button data-collection="'+k+'" class="collection-card '+(!P.owns(k)?'unbound ':'')+(selected===k?'selected':'')+'" aria-pressed="'+(selected===k)+'" style="--unit-accent:'+G.UNITS[k].color+'"><small>'+role(G.UNITS[k])+' · '+G.UNITS[k].element+' · '+(G.UNITS[k].visualFamily||G.UNITS[k].family)+'</small><div>'+art(k)+'</div><strong>'+G.UNITS[k].name+'</strong><span>'+(build[0].some(u=>u?.type===k)?'IN YOUR PARTY':P.owns(k)?'AT HOME':'UNDISCOVERED')+'</span></button>').join('')+'</div>'+(!ids.length?'<p>No species match these filters.</p>':'')+'<div class="collection-pages"><button class="button secondary" data-page="-1" '+(!page?'disabled':'')+'>← Previous</button><span>'+ids.length+' species · Page '+(page+1)+' / '+pages+'</span><button class="button secondary" data-page="1" '+(page>=pages-1?'disabled':'')+'>Next →</button></div>'+detail(selected);
}
function collectionView(build){
 const switcher='<nav class="collection-mode" aria-label="Inner Sea areas">'+[['farm','Homestead'],['party','Party'],['formation','Formation'],['trainer','Attributes'],['companions','My companions'],['catalog','Species guide']].map(([id,name])=>'<button '+(['party','formation','trainer'].includes(id)?'data-menu="'+id+'" ':'')+'data-collection-mode="'+id+'" aria-pressed="'+(collectionMode===id)+'" class="button secondary '+(collectionMode===id?'selected':'')+'">'+name+'</button>').join('')+'</nav>';
 if(collectionMode==='party')return switcher+partyView(build);
 if(collectionMode==='formation')return switcher+BondFormationView.render();
 if(collectionMode==='trainer')return switcher+BondJourney.trainer();
 if(collectionMode==='mastery')return switcher+BondTree.render('companion');
 if(collectionMode==='farm')return switcher+BondInnerSea.markup();
 if(collectionMode==='catalog')return switcher+catalogView(build);
 const all=P.companions(),ids=all.filter(mon=>!query||(P.label(mon)+' '+G.UNITS[mon.type].element).toLowerCase().includes(query.toLowerCase())),pages=Math.max(1,Math.ceil(ids.length/20));page=Math.min(page,pages-1);
 if(!all.some(x=>x.id===selectedInstance))selectedInstance=all[0]?.id||null;
 const chosen=P.getCompanion(selectedInstance);
 return switcher+'<div class="library-heading"><div><h3>My companions</h3><p>'+all.length+' companions · '+P.snapshot().owned.length+' / 100 species.</p></div></div><label class="collection-search">Search companions<input id="collection-search" type="search" value="'+query.replace(/[&<>"]/g,'')+'" placeholder="e.g. Brimble #2"></label><div class="collection-grid">'+ids.slice(page*20,page*20+20).map(mon=>'<button class="collection-card '+(mon.id===selectedInstance?'selected':'')+'" data-instance="'+mon.id+'" aria-pressed="'+(mon.id===selectedInstance)+'" style="--unit-accent:'+G.UNITS[mon.type].color+'"><small>'+role(G.UNITS[mon.type])+' · '+G.UNITS[mon.type].element+'</small><div>'+art(mon.type)+'</div><strong>'+P.label(mon)+'</strong><span>Lv '+BondProgress.level(mon.xp)+' · '+(build[0].some(u=>u?.instanceId===mon.id)?'IN PARTY':'AT HOME')+'</span></button>').join('')+'</div>'+
 (!ids.length?'<div class="empty-companion"><h3>'+(all.length?'No matches':'Your first companion is still out there.')+'</h3><p>Summon a companion from a Soul Echo.</p><button class="button secondary" data-collection-mode="catalog">Browse species →</button></div>':'')+
 '<div class="collection-pages"><button class="button secondary" data-page="-1" '+(!page?'disabled':'')+'>Previous</button><span>Page '+(page+1)+' / '+pages+'</span><button class="button secondary" data-page="1" '+(page>=pages-1?'disabled':'')+'>Next</button></div>'+
 (chosen?detail(chosen.type,null,chosen.id):'');
}
function render(){
 if(!window.BondApp||BondApp.getTab()!=='loadout')return;
 const state=P.snapshot(),build=BondApp.getBuild();
 const names={collection:'Inner Sea',inventory:'Inventory',trees:'Class Skill Tree'};
 dummyControls.remove();
 const scroll=host.querySelector('.menu-content')?.scrollTop||0,farmScroll=host.querySelector('#farm-panel')?.scrollTop||0;
 const same=host.dataset.screen===tab&&host.dataset.section===collectionMode;host.dataset.screen=tab;host.dataset.section=collectionMode;
 host.innerHTML='<header class="game-menu-heading"><span class="frame-sigil" aria-hidden="true">'+(tab==='collection'?'☽':tab==='inventory'?'◇':'✦')+'</span><div><h2>'+names[tab]+'</h2></div><span class="frame-coins" aria-label="'+state.coins+' trail coins"><i aria-hidden="true">●</i> '+state.coins+'<small>TRAIL COINS</small></span><button class="frame-close" data-menu-close aria-label="Close '+names[tab]+' and return to exploration" title="Return to exploration (Esc)">×</button></header><nav class="menu-nav" aria-label="Party and inventory"><div>'+Object.entries(names).map(([id,name])=>'<button data-menu="'+id+'" aria-pressed="'+(tab===id)+'" class="'+(tab===id?'selected':'')+'">'+name+'</button>').join('')+'</div></nav><div class="menu-content" tabindex="-1">'+(tab==='collection'?collectionView(build):tab==='trees'?BondTree.render('class'):BondInventory.render())+'</div><p id="menu-notice" role="status" aria-live="polite">'+(P.error()||'')+'</p><nav class="frame-destinations" aria-label="Game destinations"><button data-menu-close><span aria-hidden="true">⌁</span> Explore</button><button data-frame-menu="inventory" aria-pressed="'+(tab==='inventory')+'"><span aria-hidden="true">◇</span> Bag</button><button data-frame-menu="collection" aria-pressed="'+(tab==='collection')+'"><span aria-hidden="true">☽</span> Inner Sea</button></nav>';
 document.querySelector('#panel-loadout').dataset.screen=tab;
 if(same){host.querySelector('.menu-content').scrollTop=scroll;const farm=host.querySelector('#farm-panel');if(farm)farm.scrollTop=farmScroll;}
 if(tab==='collection'&&collectionMode==='party'){host.querySelector('.menu-content').append(dummyControls);dummyControls.querySelector('#fight').disabled=!!state.encounterSave;}
 if(tab==='collection')BondInnerSea.refresh();
 if(BondApp.getTab()==='loadout')BondAudio.scene(tab==='collection'?'innersea':'explore');
}
const rerender=focus=>{render();if(focus)host.querySelector(focus)?.focus({preventScroll:true});};
const summonDialog=document.createElement('dialog');summonDialog.id='summon-dialog';summonDialog.setAttribute('aria-labelledby','summon-title');document.body.append(summonDialog);
let returnFocus=null;
function summon(type){
 const s=P.snapshot(),echo=s.echoes[type]?.[0];if(!echo)return;
 returnFocus=document.activeElement;
 summonDialog.innerHTML='<div class="summon-portrait">'+art(type)+'</div><p class="eyebrow">SUMMON COMPANION</p><h2 id="summon-title">Welcome '+G.UNITS[type].name+'?</h2><p>Use one Soul Echo to summon this level '+echo.level+' companion.</p><div class="npc-actions"><button id="confirm-summon" class="button primary">Summon companion</button><button id="cancel-summon" class="button secondary">Keep the Echo</button></div><p id="summon-status" role="status"></p>';
 summonDialog.querySelector('#cancel-summon').onclick=()=>summonDialog.close();
 summonDialog.querySelector('#confirm-summon').onclick=()=>{
  const result=P.summon(type,BondApp.getBuild()[0][0].type,echo.id);
  if(!result){summonDialog.querySelector('#summon-status').textContent=P.error()||'This Echo is no longer available.';return;}
  const assigned=BondApp.autoAssign(result.instanceId);BondAudio.play('summon');summonDialog.close();selected=type;selectedInstance=result.instanceId;collectionMode='companions';tab='collection';query='';filter='All';page=Math.floor(P.companions().findIndex(x=>x.id===result.instanceId)/20);render();
  host.querySelector('#menu-notice').textContent=G.UNITS[type].name+(assigned?' joined your party.':' was summoned. Choose a companion slot to add it to your party.');host.querySelector('[data-instance="'+result.instanceId+'"]')?.focus({preventScroll:true});
 };
 summonDialog.showModal();
}
summonDialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
host.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-menu-close')){close();return;}
 if(b.dataset.frameMenu){BondMenu.open(b.dataset.frameMenu);return;}
 if(b.dataset.menu){open(b.dataset.menu);}
 else if(b.hasAttribute('data-side-toggle')){side=1-side;slot=0;priority=0;rerender('[data-side-toggle]');}
 else if(b.dataset.slot!==undefined){slot=+b.dataset.slot;priority=0;rerender('[data-slot="'+slot+'"]');if(slot||P.snapshot().character?.legacy)openPartyPicker(slot);}
 else if(b.hasAttribute('data-replace-unit'))openPartyPicker(slot);
 else if(b.dataset.collectionMode){collectionMode=b.dataset.collectionMode;query='';page=0;render();host.querySelector('.menu-content').scrollTop=0;host.querySelector('[data-collection-mode="'+collectionMode+'"]')?.focus({preventScroll:true});}
 else if(b.dataset.instance){selectedInstance=b.dataset.instance;priority=0;rerender('[data-instance="'+selectedInstance+'"]');}
 else if(b.dataset.priority!==undefined){priority=+b.dataset.priority;rerender('[data-priority="'+priority+'"]');}
 else if(b.dataset.skill){const mon=tab==='collection'&&collectionMode==='companions'?P.getCompanion(selectedInstance):null,u=mon||BondApp.getBuild()[side][slot];if(!u)return;const i=u.skills.indexOf(b.dataset.skill);if(i>=0)[u.skills[i],u.skills[priority]]=[u.skills[priority],u.skills[i]];else u.skills[priority]=b.dataset.skill;if(mon)P.setSkills(mon.id,u.skills);else BondApp.changeSkills(side,slot,u.skills);host.querySelector('[data-skill="'+b.dataset.skill+'"]')?.focus({preventScroll:true});}
 else if(b.hasAttribute('data-rotate')){const mon=tab==='collection'&&collectionMode==='companions'?P.getCompanion(selectedInstance):null,u=mon||BondApp.getBuild()[side][slot];if(u){u.skills.push(u.skills.shift());if(mon)P.setSkills(mon.id,u.skills);else BondApp.changeSkills(side,slot,u.skills);}}
 else if(b.dataset.filter){filter=b.dataset.filter;page=0;rerender('[data-filter="'+filter+'"]');}
 else if(b.dataset.collection){selected=b.dataset.collection;rerender('[data-collection="'+selected+'"]');}
 else if(b.dataset.page){page=Math.max(0,page+Number(b.dataset.page));rerender('[data-page="'+b.dataset.page+'"]');}
 else if(b.dataset.add){side=0;slot=+b.dataset.add;priority=0;const id=selectedInstance;if(!P.getCompanion(id))return;tab='collection';collectionMode='party';BondApp.changeUnit(0,slot,id);host.querySelector('[data-slot="'+slot+'"]')?.focus({preventScroll:true});}
 else if(b.dataset.summon)summon(b.dataset.summon);
 else if(b.dataset.item){BondInventory.select(b.dataset.item);rerender(matchMedia('(max-width:850px)').matches?'[data-bag-back]':'[data-item="'+b.dataset.item+'"]');}
 else if(b.hasAttribute('data-prepare'))P.prepare();
 else if(b.hasAttribute('data-unprepare'))P.unprepare();
});
host.addEventListener('change',e=>{if(e.target.id==='party-type'){BondApp.changeUnit(side,slot,e.target.value);host.querySelector('#party-type')?.focus({preventScroll:true});}});
host.addEventListener('input',e=>{if(e.target.id==='collection-search'){const pos=e.target.selectionStart;query=e.target.value;page=0;render();const input=host.querySelector('#collection-search');input?.focus();try{input?.setSelectionRange(pos,pos);}catch(_){}}});
function close(){BondApp.switchTab('region');document.querySelector('[data-world-menu="'+(tab==='inventory'?'inventory':tab==='collection'?'collection':'region')+'"]')?.focus({preventScroll:true});}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&window.BondApp?.getTab()==='loadout'&&!document.querySelector('dialog[open]')){e.preventDefault();close();}});
document.addEventListener('bond-profile',render);
function open(name){
 if(!['party','collection','inventory','trees','trainer','formation','mastery'].includes(name))return;
 if(['party','trainer','formation','mastery'].includes(name)){tab='collection';collectionMode=name;}else{tab=name;if(name==='collection')collectionMode='farm';}
 filter='All';page=0;rerender('[data-menu="'+name+'"]');
}
window.BondMenu={render,summon,detail,current:()=>tab,section:()=>tab==='collection'?collectionMode:tab,open,selectCollection(type){if(!G.MONSTERS.includes(type))return;selected=type;selectedInstance=null;collectionMode='catalog';tab='collection';filter='All';query='';page=Math.floor(G.MONSTERS.indexOf(type)/20);render();},source};
})();
