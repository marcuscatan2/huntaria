/* Echo-aware, stack-based inventory. Only owned items appear as owned. */
(function(root){
'use strict';
const P=BondProfile,W=BondWorld;let category='All',selected='biscuit',inspecting=false;
const atlas=['bondcontract','biscuit','mossbloom','riverstone','amberleaf','moonshard','skyfeather','grovebadge','riverbadge','stormbadge','amberbadge','moonbadge','packbadge','rootbadge'];
function icon(id,large=false){
 const item=W.ITEMS[id];if(!item)return '';
 if(item.category==='Echoes')return '<span class="bag-icon echo-item '+(large?'large':'')+'">'+CharacterRig.art(item.type)+'<i>✧</i></span>';
 if(BondEquipment.get(id))return BondEquipmentView.icon(id,large);
 const index=atlas.indexOf(id);
 if(index<0)return '<span class="bag-icon symbol-icon '+(large?'large':'')+'" aria-hidden="true">'+item.icon+'</span>';
 return '<span class="bag-icon atlas-icon '+(large?'large':'')+'" style="--col:'+(index%4)+';--row:'+Math.floor(index/4)+'" aria-hidden="true"></span>';
}
function render(){
 const s=P.snapshot(),ids=Object.keys(W.ITEMS).filter(k=>s.inventory[k]>0&&(category==='All'||W.ITEMS[k].category===category));
 const tutorialEcho=s.journey?.early?.introFightWon&&!s.journey.early.firstSummon?'echo:emberfox':null;
 if(!ids.includes(selected))selected=ids[0]||null;
 const item=W.ITEMS[selected],amount=s.inventory[selected]||0;
 let detail='<p>Inventory is empty.</p>';
 if(item){
  detail=icon(selected,true)+'<p class="eyebrow">'+item.category.toUpperCase()+' · '+amount+' OWNED</p><h3>'+item.name+'</h3><p>'+item.description+'</p>';
  if(BondEquipment.get(selected)){const gear=BondEquipment.get(selected);detail=icon(selected,true)+'<h3>'+gear.name+'</h3>'+BondEquipmentView.info(gear)+'<p>'+amount+' owned · '+BondEquipment.used(s,selected)+' equipped</p><button class="button primary" data-open-equipment="" data-gear-id="'+selected+'">Manage equipment</button>';}else if(item.category==='Echoes'){
   detail+='<button class="button primary '+(selected===tutorialEcho?'tutorial-target':'')+'" data-summon="'+item.type+'" '+(P.owns(item.type)?'disabled':'')+'>'+(P.owns(item.type)?'Companion acquired':'Summon companion')+'</button>';
  }else if(BondAdventure.items[selected])detail+='<button class="button primary" data-open-recovery="'+selected+'">Choose a target →</button>';
  else if(selected==='biscuit')detail+='<button class="button primary" data-prepare '+(s.prepared?'disabled':'')+'>'+(s.prepared?'Prepared · +80 opening shield':'Prepare one biscuit')+'</button>'+(s.prepared?'<button class="text-button" data-unprepare>Unprepare · keep it</button>':'');
  else if(selected==='trailfood')detail+='<button class="button primary" data-pick-feed '+(!s.companions.length?'disabled':'')+'>Feed companion</button>';
  else if(selected==='battlefood')detail+='<button class="button primary" data-boost '+(s.boost?'disabled':'')+'>'+(s.boost?'Prepared for next battle':'Prepare · +10% party HP')+'</button>';
 }
 return '<div class="satchel-heading"><div><h3>Items</h3></div><span class="satchel-coins"><b>'+s.coins+'</b> trail coins</span></div><div class="satchel-layout '+(inspecting?'inspecting':'')+'"><aside class="satchel-categories" aria-label="Item categories">'+['All','Equipment','Held items','Echoes','Supplies','Materials','Trophies','Legacy'].map(c=>'<button data-bag-filter="'+c+'" class="'+(category===c?'selected':'')+'" aria-pressed="'+(category===c)+'"><span>'+({Equipment:'◇','Held items':'✧',Weapons:'⚔',All:'◈',Echoes:'✧',Supplies:'✦',Materials:'◇',Trophies:'♛',Legacy:'❧'}[c])+'</span>'+c+'<small>'+Object.keys(W.ITEMS).filter(k=>s.inventory[k]>0&&(c==='All'||W.ITEMS[k].category===c)).length+'</small></button>').join('')+'</aside><section class="satchel-storage"><div class="bag-grid-heading"><b>'+category.toUpperCase()+'</b><small>'+ids.length+' item types</small></div><div class="satchel-grid">'+ids.map(k=>'<button class="satchel-slot inventory-item '+(selected===k?'selected':'')+(k===tutorialEcho?' tutorial-target':'')+'" data-item="'+k+'" aria-pressed="'+(selected===k)+'" aria-label="'+W.ITEMS[k].name+', '+s.inventory[k]+' owned">'+icon(k)+'<b class="stack-count">×'+s.inventory[k]+'</b><strong>'+W.ITEMS[k].name+'</strong><small>'+W.ITEMS[k].category+'</small></button>').join('')+Array.from({length:Math.max(0,8-ids.length)},()=>'<span class="satchel-empty-slot" aria-hidden="true">✧</span>').join('')+'</div>'+(!ids.length?'<p class="bag-empty-message">No items here.</p>':'')+'<div class="earned-supplies"><button class="button secondary" data-open-recovery>Recovery items</button></div></section><aside class="satchel-detail item-detail"><button class="text-button bag-back" data-bag-back>← Back to items</button>'+detail+'</aside></div>';
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-bag-back')){inspecting=false;BondMenu.render();document.querySelector('[data-item="'+selected+'"]')?.focus({preventScroll:true});}if(b.dataset.bagFilter){inspecting=false;category=b.dataset.bagFilter;BondMenu.render();document.querySelector('[data-bag-filter="'+category+'"]')?.focus({preventScroll:true});}if(b.hasAttribute('data-pick-feed'))BondPicker.open({title:'Feed one companion · +120 XP',returnSelector:'[data-pick-feed]',onChoose:id=>P.feed(id)});if(b.dataset.buy){P.buy(b.dataset.buy);document.querySelector('[data-buy="'+b.dataset.buy+'"]')?.focus({preventScroll:true});}});
root.BondInventory={render,icon,select(id){inspecting=true;if(W.ITEMS[id]){selected=id;category=W.ITEMS[id].category==='Echoes'?'Echoes':'All';}},openEcho(){const s=P.snapshot(),id=Object.keys(s.inventory).find(k=>k.startsWith('echo:')&&s.inventory[k]>0);if(!id)return;selected=id;category='Echoes';BondApp.switchTab('loadout');BondMenu.open('inventory');}};
})(globalThis);
