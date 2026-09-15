/* Echo-aware, stack-based inventory. Only owned items appear as owned. */
(function(root){
'use strict';
const P=BondProfile,W=BondWorld;let category='All',selected='biscuit',inspecting=false;
const atlas=['bondcontract','biscuit','mossbloom','riverstone','amberleaf','moonshard','skyfeather','grovebadge','riverbadge','stormbadge','amberbadge','moonbadge','packbadge','rootbadge'];
function icon(id,large=false){
 const item=W.ITEMS[id];if(!item)return '';
 if(item.category==='Echoes')return '<span class="bag-icon echo-item '+(large?'large':'')+'">'+CharacterRig.art(item.type)+'<i>✧</i></span>';
 const index=atlas.indexOf(id);
 if(index<0)return '<span class="bag-icon symbol-icon '+(large?'large':'')+'" aria-hidden="true">'+item.icon+'</span>';
 return '<span class="bag-icon atlas-icon '+(large?'large':'')+'" style="--col:'+(index%4)+';--row:'+Math.floor(index/4)+'" aria-hidden="true"></span>';
}
function render(){
 const s=P.snapshot(),ids=Object.keys(W.ITEMS).filter(k=>s.inventory[k]>0&&(category==='All'||W.ITEMS[k].category===category));
 const tutorialEcho=s.journey?.early?.introFightWon&&!s.journey.early.firstSummon?'echo:emberfox':null;
 if(!ids.includes(selected))selected=ids[0]||null;
 const item=W.ITEMS[selected],amount=s.inventory[selected]||0;
 let detail='<h3>Room for discoveries.</h3><p>Items you find appear here.</p>';
 if(item){
  detail=icon(selected,true)+'<p class="eyebrow">'+item.category.toUpperCase()+' · '+amount+' OWNED</p><h3>'+item.name+'</h3><p>'+item.description+'</p>';
  if(item.category==='Echoes'){
   const origin=s.echoes[item.type]?.[0];detail+='<p class="item-note">Source: '+(origin?BondAtlas.get(origin.map).name+' · Lv '+origin.level:'saved reward')+'</p><button class="button primary '+(selected===tutorialEcho?'tutorial-target':'')+'" data-summon="'+item.type+'" '+''+'>'+'Summon companion'+'</button>';
  }else if(BondAdventure.items[selected])detail+='<button class="button primary" data-open-recovery="'+selected+'">Choose a target →</button>';
  else if(selected==='biscuit')detail+='<button class="button primary" data-prepare '+(s.prepared?'disabled':'')+'>'+(s.prepared?'Prepared · +80 opening shield':'Prepare one biscuit')+'</button>'+(s.prepared?'<button class="text-button" data-unprepare>Unprepare · keep it</button>':'');
  else if(selected==='trailfood')detail+='<p class="item-note">Choose the individual to receive 120 XP. Other copies do not gain experience.</p><button class="button primary" data-pick-feed '+(!s.companions.length?'disabled':'')+'>Choose companion to feed →</button>';
  else if(selected==='battlefood')detail+='<button class="button primary" data-boost '+(s.boost?'disabled':'')+'>'+(s.boost?'Prepared for next battle':'Prepare · +10% party HP')+'</button>';
  else detail+='<p class="item-note">Keep this item in your collection.</p>';
 }
 return '<div class="satchel-heading"><div><p class="eyebrow">YOUR SATCHEL</p><h3>Collected on the trail</h3><p>Select an item to use it.</p></div><span class="satchel-coins"><b>'+s.coins+'</b> trail coins</span></div><div class="satchel-layout '+(inspecting?'inspecting':'')+'"><aside class="satchel-categories" aria-label="Item categories">'+['All','Echoes','Supplies','Materials','Trophies','Legacy'].map(c=>'<button data-bag-filter="'+c+'" class="'+(category===c?'selected':'')+'" aria-pressed="'+(category===c)+'"><span>'+({All:'◈',Echoes:'✧',Supplies:'✦',Materials:'◇',Trophies:'♛',Legacy:'❧'}[c])+'</span>'+c+'<small>'+Object.keys(W.ITEMS).filter(k=>s.inventory[k]>0&&(c==='All'||W.ITEMS[k].category===c)).length+'</small></button>').join('')+'</aside><section class="satchel-storage"><div class="bag-grid-heading"><b>'+category.toUpperCase()+'</b><small>'+ids.length+' item types</small></div><div class="satchel-grid">'+ids.map(k=>'<button class="satchel-slot inventory-item '+(selected===k?'selected':'')+(k===tutorialEcho?' tutorial-target':'')+'" data-item="'+k+'" aria-pressed="'+(selected===k)+'" aria-label="'+W.ITEMS[k].name+', '+s.inventory[k]+' owned">'+icon(k)+'<b class="stack-count">×'+s.inventory[k]+'</b><strong>'+W.ITEMS[k].name+'</strong><small>'+W.ITEMS[k].category+'</small></button>').join('')+Array.from({length:Math.max(0,8-ids.length)},()=>'<span class="satchel-empty-slot" aria-hidden="true">✧</span>').join('')+'</div>'+(!ids.length?'<p class="bag-empty-message">Nothing in this category yet. Wild kills can leave Soul Echoes; previously earned drops survive later defeats.</p>':'')+'<div class="earned-supplies"><h4>Restock in the village</h4><p>Click the Supply Store trade tent for cheap recovery items. The sanctuary restores everyone for free.</p><button class="button secondary" data-open-recovery>Use recovery items</button></div></section><aside class="satchel-detail item-detail"><button class="text-button bag-back" data-bag-back>← Back to items</button>'+detail+'</aside></div>';
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-bag-back')){inspecting=false;BondMenu.render();document.querySelector('[data-item="'+selected+'"]')?.focus({preventScroll:true});}if(b.dataset.bagFilter){inspecting=false;category=b.dataset.bagFilter;BondMenu.render();document.querySelector('[data-bag-filter="'+category+'"]')?.focus({preventScroll:true});}if(b.hasAttribute('data-pick-feed'))BondPicker.open({title:'Feed one companion · +120 XP',returnSelector:'[data-pick-feed]',onChoose:id=>P.feed(id)});if(b.dataset.buy){P.buy(b.dataset.buy);document.querySelector('[data-buy="'+b.dataset.buy+'"]')?.focus({preventScroll:true});}});
root.BondInventory={render,icon,select(id){inspecting=true;if(W.ITEMS[id]){selected=id;category=W.ITEMS[id].category==='Echoes'?'Echoes':'All';}},openEcho(){const s=P.snapshot(),id=Object.keys(s.inventory).find(k=>k.startsWith('echo:')&&s.inventory[k]>0);if(!id)return;selected=id;category='Echoes';BondApp.switchTab('loadout');BondMenu.open('inventory');}};
})(globalThis);
