/* Presents accepted receipts. Notifications never generate rewards. */
(function(){
'use strict';
const P=BondProfile,host=document.createElement('div'),errorHost=document.createElement('div'),list=document.createElement('div'),levelToast=document.createElement('div');
host.id='loot-notifications';list.id='loot-toasts';list.setAttribute('role','log');list.setAttribute('aria-label','Loot received');list.setAttribute('aria-live','polite');list.setAttribute('aria-relevant','additions');
host.append(list);
errorHost.id='loot-errors';
levelToast.id='level-toast';levelToast.setAttribute('role','status');levelToast.hidden=true;
document.querySelector('#region-map').append(host);
document.body.append(errorHost,levelToast);
let levelTimer=null;
const shown=new WeakSet(),pending=new WeakMap(),queue=[],visible=new Map(),LIFETIME=3000,MAX_VISIBLE=4;
function placeLevel(){
 if(levelToast.hidden)return;
 const frame=!document.querySelector('#panel-region').hidden?document.querySelector('#region-map'):!document.querySelector('#panel-battle').hidden?document.querySelector('#arena'):document.querySelector('#panel-loadout');
 if(frame&&levelToast.parentElement!==frame)frame.append(levelToast);
}
function dismiss(el){
 if(!visible.has(el))return;
 const focused=el.contains(document.activeElement);
 clearTimeout(visible.get(el));visible.delete(el);el.remove();drain();
 if(focused)document.querySelector('.tab.active')?.focus({preventScroll:true});
}
function drain(){
 while(queue.length&&visible.size<MAX_VISIBLE){
  const item=queue.shift(),el=document.createElement('article'),icon=document.createElement('span'),copy=document.createElement('div'),name=document.createElement('strong'),amount=document.createElement('span'),close=document.createElement('button');
  el.className='loot-toast'+(item.echo?' echo-drop':'');el.dataset.item=item.id;
  icon.className='loot-toast-icon';icon.setAttribute('aria-hidden','true');
  if(item.id==='coins'||item.id==='xp')icon.textContent=item.id==='coins'?'◈':'✦';else icon.innerHTML=BondInventory.icon(item.id);
  copy.className='loot-toast-copy';name.textContent=item.name;copy.append(name);
  if(item.echo){
   if(!P.snapshot().tutorial.summons){const note=document.createElement('small');note.className='first-echo-note';note.textContent='Summon from Inventory.';copy.append(note);}
   const action=document.createElement('button');action.className='loot-inventory';action.textContent='Inventory →';
   action.onclick=()=>{dismiss(el);BondInventory.select(item.id);BondApp.switchTab('loadout');BondMenu.open('inventory');};copy.append(action);
  }
  amount.className='loot-quantity';amount.textContent=(item.id==='coins'||item.id==='xp'?'+':'×')+item.quantity;
  close.className='loot-dismiss';close.textContent='×';close.setAttribute('aria-label','Dismiss '+item.name);close.onclick=()=>dismiss(el);
  el.append(icon,copy,amount,close);list.append(el);
  if(item.echo||item.id==='coins')BondAudio.play(item.echo?'echo':'coin');
  // Each displayed item owns its timer. Focus, hover and later loot never reset it.
  visible.set(el,setTimeout(()=>dismiss(el),LIFETIME));
 }
}
function show(b,id){
 if(shown.has(b))return;
 const result=P.complete(b,id);if(!result)return;
 if(result.pending){
  let error=pending.get(b);
  if(!error){
   error=document.createElement('section');error.className='loot-save-error';error.setAttribute('role','alert');
   const message=document.createElement('span'),retry=document.createElement('button');retry.className='loot-retry';retry.textContent='Retry saving';
   error.append(message,retry);errorHost.append(error);pending.set(b,error);
   retry.onclick=()=>{show(b,id);if(shown.has(b))BondApp.finish();};
  }
  error.firstElementChild.textContent=result.error||'Could not save rewards.';return;
 }
 const error=pending.get(b),focused=error?.contains(document.activeElement);
 error?.remove();pending.delete(b);shown.add(b);
 for(const [itemId,quantity] of Object.entries(result.loot||{})){
  const item=BondWorld.ITEMS[itemId];if(item&&quantity>0)queue.push({id:itemId,name:item.name,quantity,echo:itemId.startsWith('echo:')});
 }
 if(result.coins>0)queue.push({id:'coins',name:'Coins',quantity:result.coins});
 if(result.xp>0)queue.push({id:'xp',name:'XP',quantity:result.xp});
 drain();
 if(focused)document.querySelector('.tab.active')?.focus({preventScroll:true});
}
function levels(before,after){
 const R=BondProgress,changes=[];
 const from=R.trainerLevel(before),to=R.trainerLevel(after);
 if(to>from)changes.push({name:after.character?.name||'Trainer',level:to,trainer:true});
 for(const m of after.companions){const old=before.companions.find(x=>x.id===m.id);if(old&&R.level(m.xp)>R.level(old.xp))changes.push({name:BondContent.UNITS[m.type].name,level:R.level(m.xp),id:m.id});}
 if(!changes.length)return;
 BondAudio.play('level');
 levelToast.dataset.trainer=String(changes.some(c=>c.trainer));
 const title=document.createElement('strong'),gains=document.createElement('div'),stars=document.createElement('span');
 title.className='level-kicker';title.textContent='LEVEL UP';
 gains.className='level-gains';
 for(const c of changes){
  const row=document.createElement('div'),name=document.createElement('span'),level=document.createElement('b');
  row.className='level-gain';name.textContent=c.name;level.textContent='LV. '+c.level;row.append(name,level);gains.append(row);
 }
 stars.className='level-stars';stars.setAttribute('aria-hidden','true');stars.textContent='✦  ✧  ✦';
 levelToast.replaceChildren(stars,title,gains);
 levelToast.hidden=false;placeLevel();levelToast.classList.remove('level-burst');void levelToast.offsetWidth;levelToast.classList.add('level-burst');
 for(const c of changes){
  const u=window.BondApp?.getBattle()?.units.find(u=>c.trainer?u.id==='0-0':u.instanceId===c.id);
  for(const el of [u&&document.querySelector('.fighter[data-id="'+u.id+'"]'),c.trainer&&document.querySelector('#region-player')].filter(Boolean)){
   el.classList.add('leveled-up');setTimeout(()=>el.classList.remove('leveled-up'),2200);
  }
 }
 clearTimeout(levelTimer);levelTimer=setTimeout(()=>{levelToast.hidden=true;},4200);
}
let previous=P.snapshot();
document.addEventListener('bond-profile',()=>{const next=P.snapshot();levels(previous,next);previous=next;});
window.BondLoot={levels,show,placeLevel};
})();
