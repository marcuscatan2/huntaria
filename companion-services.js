/* City lessons and Echo-funded talent resets. Profile commands own all changes. */
(function(root){
'use strict';
const P=BondProfile,M=BondCompanionMoves,dialog=document.createElement('dialog');
dialog.id='companion-service-dialog';dialog.setAttribute('aria-labelledby','companion-service-title');document.body.append(dialog);
let npc=null,selected=null,returnFocus=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(message=''){
 const s=P.snapshot(),service=BondCities.service(s,npc);if(!service){dialog.close();return;}
 const teaching=service.service==='moves',active=P.activeCompanions(),mons=s.companions.filter(m=>!teaching||active.includes(m.id));
 if(!mons.some(m=>m.id===selected))selected=mons[0]?.id||null;
 const mon=mons.find(m=>m.id===selected),known=mon?M.learned(mon):[],used=mon?BondGrowth.used(mon.growth):0,echoes=mon?s.echoes[mon.type]?.length||0:0;
 dialog.innerHTML='<header class="city-dialog-header"><h2 id="companion-service-title" tabindex="-1">'+service.name+'</h2><button class="button secondary" data-service-close>Leave</button></header><div class="companion-service-body">'+
 '<div class="service-companions" aria-label="Choose companion">'+mons.map(m=>'<button class="service-companion '+(m.id===selected?'selected':'')+'" data-service-companion="'+m.id+'" aria-pressed="'+(m.id===selected)+'">'+CharacterRig.art(m.type)+'<strong>'+esc(P.label(m))+'</strong></button>').join('')+'</div>'+
 (!mon?'<p>'+(teaching?'Add a companion to your party first.':'Summon a companion first.')+'</p>':teaching?'<div class="service-moves">'+M.general.map(id=>{const move=BondGame.SKILLS[id];return '<article><div><strong>'+esc(move.name)+'</strong><p>'+esc(move.description)+'</p></div><button class="button secondary" data-teach-move="'+id+'" '+(known.includes(id)?'disabled':'')+'>'+(known.includes(id)?'Learned':'Learn')+'</button></article>';}).join('')+'</div>':'<section class="service-reset"><h3>'+esc(P.label(mon))+'</h3><p>Reset talents for one '+esc(BondContent.UNITS[mon.type].name)+' Echo.</p><p>'+used+' points invested · '+echoes+' Echo'+(echoes===1?'':'es')+' owned</p><button class="button primary" data-service-reset '+(!used||!echoes?'disabled':'')+'>Reset talents · 1 Echo</button></section>')+'<p class="service-status" role="status" aria-live="polite">'+esc(message)+'</p></div>';
}
function open(id){if(!BondCities.service(P.snapshot(),id))return false;npc=id;selected=null;returnFocus=document.activeElement;render();dialog.showModal();dialog.querySelector('h2').focus({preventScroll:true});return true;}
dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.hasAttribute('data-service-close')){dialog.close();return;}
 if(b.dataset.serviceCompanion){selected=b.dataset.serviceCompanion;render();dialog.querySelector('[data-service-companion="'+selected+'"]')?.focus({preventScroll:true});}
 if(b.dataset.teachMove){const id=b.dataset.teachMove,ok=P.teachMove(npc,selected,id);render(ok?BondGame.SKILLS[id].name+' learned.':P.error()||'This lesson is unavailable.');dialog.querySelector('[data-service-companion="'+selected+'"]')?.focus({preventScroll:true});}
 if(b.hasAttribute('data-service-reset')){const result=P.resetCompanionTalents(npc,selected);render(result?.ok?'Talent points returned.':P.error()||'A matching Echo is required.');dialog.querySelector('[data-service-companion="'+selected+'"]')?.focus({preventScroll:true});}
});
dialog.addEventListener('close',()=>{npc=null;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else document.querySelector('#region-map')?.focus({preventScroll:true});});
root.BondCompanionServices={open};
})(globalThis);
