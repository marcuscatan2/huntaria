/* In-frame equipment management. Profile commands alone change assignments. */
(function(root){
'use strict';
const P=root.BondProfile,E=root.BondEquipment;
let selectedRef=null,selectedSlot='weapon',selectedItem=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const trainerType=s=>s.progression?.specialization||(s.character?.legacy?root.BondApp.getBuild()[0][0].type:'apprentice');
const labels={weapon:'Weapon',offhand:'Off-hand',head:'Head',body:'Body',feet:'Feet',accessory:'Accessory',held:'Held item'};
const empty={weapon:'⚔',offhand:'◈',head:'♜',body:'♢',feet:'♧',accessory:'◇',held:'✧'};
function icon(id,large=false){const item=E.get(id);return item?'<img class="item-art '+(large?'large':'')+'" src="'+esc(item.icon)+'" alt="" width="96" height="96" loading="lazy" decoding="async">':'';}
function requirements(item){return item.kind==='held'?(item.restriction==='None'?'Any companion':item.restriction):'Lv '+item.level+' · '+(item.classes.includes('apprentice')?'All classes':item.classes.map(t=>root.BondContent.UNITS[t].name).join(' / '));}
function info(item){return '<div class="gear-stat-list">'+Object.entries(item.stats).map(([k,n])=>'<span><b>+'+n+'</b> '+({hp:'Max HP',atk:'ATK',matk:'MATK',def:'DEF',mdef:'MDEF',crit:'CRIT',hit:'HIT',flee:'FLEE'}[k]||k.toUpperCase())+'</span>').join('')+'</div><p class="gear-requirements">'+esc(requirements(item))+'</p>'+(item.effect==='None'?'':'<p class="gear-effect">'+esc(item.effect)+'</p>');}
function open(ref=null,id=null){selectedRef=ref;selectedItem=id;const item=E.get(id);if(item){selectedSlot=item.kind==='held'?'held':item.slot;if(item.kind==='held'&&!P.getCompanion(ref))selectedRef=P.companions().find(m=>E.allowed(item,m.type,1))?.id||P.companions()[0]?.id;}root.BondApp.switchTab('loadout');root.BondMenu.open('equipment');}
function quick(ref){const s=P.snapshot(),mon=P.getCompanion(ref),ids=mon?[mon.heldItem]:E.SLOTS.map(k=>s.equipment?.[k]);return '<button class="gear-quick button secondary" data-open-equipment="'+esc(ref)+'">'+(ids.find(Boolean)?icon(ids.find(Boolean)):'')+(mon?'<span>Held item<strong>'+esc(E.get(mon.heldItem)?.name||'Empty')+'</strong></span>':'Equipment')+'</button>';}
function render(){
 const s=P.snapshot(),type=trainerType(s),mon=s.companions.find(m=>m.id===selectedRef);if(!mon)selectedRef=type;
 const target=mon?.type||type,ref=mon?.id||type,level=mon?root.BondProgress.level(mon.xp):root.BondProgress.trainerLevel(s),name=mon?P.label(mon):s.character?.name||root.BondContent.UNITS[type].name;
 const slots=mon?['held']:E.SLOTS;if(!slots.includes(selectedSlot))selectedSlot=slots[0];
 const current=k=>mon?mon.heldItem:s.equipment?.[k],equipped=current(selectedSlot),available=E.list().filter(i=>s.inventory[i.id]>0&&(mon?i.kind==='held':i.kind==='equipment'&&i.slot===selectedSlot)).sort((a,b)=>b.level-a.level||a.name.localeCompare(b.name));
 if(!available.some(i=>i.id===selectedItem))selectedItem=equipped||available[0]?.id||null;
 const item=E.get(selectedItem),free=item?E.free(s,item.id,mon?.id||selectedSlot):0,allowed=item&&E.allowed(item,target,level),isEquipped=item?.id===equipped;
 let detail='<div class="gear-empty"><h4>No '+(mon?'held items':labels[selectedSlot].toLowerCase()+' equipment')+' yet</h4><p>Find items while hunting monsters.</p></div>';
 if(item)detail='<div class="gear-inspection-heading">'+icon(item.id,true)+'<div><small>'+esc(item.kind==='held'?'Held item':item.subtype)+'</small><h4>'+esc(item.name)+'</h4></div></div>'+info(item)+'<div class="gear-actions"><button class="button primary" data-equip-item="'+esc(item.id)+'" '+(!allowed||!free||isEquipped?'disabled':'')+'>'+(isEquipped?'Equipped':!allowed?'Requirements not met':!free?'All copies equipped':'Equip')+'</button><span>'+free+' available · '+s.inventory[item.id]+' owned</span></div>';
 return '<section class="equipment-view" aria-label="Equipment"><header class="equipment-heading"><div><h3>Equipment</h3><p>'+esc(name)+' · Lv '+level+'</p></div><label>Character<select id="equipment-owner"><option value="'+esc(type)+'" '+(!mon?'selected':'')+'>'+esc(s.character?.name||'Trainer')+'</option>'+s.companions.map(m=>'<option value="'+esc(m.id)+'" '+(mon?.id===m.id?'selected':'')+'>'+esc(P.label(m))+'</option>').join('')+'</select></label></header><div class="equipment-layout"><section class="equipment-loadout"><div class="equipment-portrait">'+root.CharacterRig.art(target)+'</div><div class="equipment-slots '+(mon?'single-slot':'')+'">'+slots.map(k=>'<button class="equipment-slot '+(k===selectedSlot?'selected':'')+'" data-gear-slot="'+k+'" aria-pressed="'+(k===selectedSlot)+'"><span>'+labels[k]+'</span>'+(current(k)?icon(current(k)):'<i aria-hidden="true">'+empty[k]+'</i>')+'<strong>'+esc(E.get(current(k))?.name||'Empty')+'</strong></button>').join('')+'</div>'+(equipped?'<button class="text-button" data-unequip>Unequip '+labels[selectedSlot].toLowerCase()+'</button>':'')+'</section><section class="equipment-storage"><h4>'+labels[selectedSlot]+'</h4><div class="gear-candidates" role="group" aria-label="Owned '+labels[selectedSlot].toLowerCase()+'">'+available.map(i=>'<button class="gear-candidate '+(selectedItem===i.id?'selected':'')+'" data-gear-item="'+esc(i.id)+'" aria-pressed="'+(selectedItem===i.id)+'">'+icon(i.id)+'<span>'+esc(i.name)+'</span><small>'+(equipped===i.id?'Equipped':'×'+s.inventory[i.id])+'</small></button>').join('')+'</div><article class="gear-inspection">'+detail+'</article></section></div></section>';
}
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-open-equipment')){open(b.dataset.openEquipment||null,b.dataset.gearId||null);return;}
 if(root.BondMenu?.section()!=='equipment')return;
 if(b.dataset.gearSlot){selectedSlot=b.dataset.gearSlot;selectedItem=null;root.BondMenu.render();document.querySelector('[data-gear-slot="'+selectedSlot+'"]')?.focus({preventScroll:true});}
 if(b.dataset.gearItem){selectedItem=b.dataset.gearItem;root.BondMenu.render();document.querySelector('[data-gear-item="'+selectedItem+'"]')?.focus({preventScroll:true});}
 if(b.hasAttribute('data-equip-item')||b.hasAttribute('data-unequip')){const id=b.dataset.equipItem||null,ok=P.equip(selectedRef,id,selectedSlot);if(ok){root.BondMenu.render();document.querySelector('[data-gear-slot="'+selectedSlot+'"]')?.focus({preventScroll:true});}}
});
document.addEventListener('change',event=>{if(event.target.id==='equipment-owner'){selectedRef=event.target.value;selectedItem=null;root.BondMenu.render();document.querySelector('#equipment-owner')?.focus({preventScroll:true});}});
root.BondEquipmentView={render,open,quick,icon,info,requirements};
})(globalThis);
