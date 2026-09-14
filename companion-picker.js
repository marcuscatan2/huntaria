/* Reusable portrait picker. IDs select individuals, never an ambiguous species. */
(function(){
'use strict';
const P=BondProfile,C=BondContent,dialog=document.createElement('dialog');
dialog.id='companion-picker';dialog.setAttribute('aria-labelledby','picker-title');document.body.append(dialog);
let options={},query='',role='All',page=0,returnFocus=null;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function entries(){
 const source=options.practice?C.MONSTERS.map(type=>({id:type,type,ordinal:null,xp:0,skills:C.UNITS[type].default})):options.classes?['druid','mage'].map(type=>({id:type,type,xp:0,skills:C.UNITS[type].default})):P.companions();
 return source.filter(m=>{const u=C.UNITS[m.type],design=u.designRole||u.role,match=role==='All'||role==='Damage'&&/(DPS|Fighter)/.test(design)||role==='Tank'&&design.includes('Tank')||role==='Support'&&/(Supp|Support)/.test(design);return (!options.species||m.type===options.species)&&match&&(!query||(label(m)+' '+u.element+' '+design).toLowerCase().includes(query.toLowerCase()));});
}
const label=m=>m.ordinal?P.label(m):C.UNITS[m.type].name;
function draw(focusSearch=false){
 const list=entries(),pages=Math.max(1,Math.ceil(list.length/20));page=Math.min(page,pages-1);
 const build=window.BondApp?.getBuild()[0]||[],shown=list.slice(page*20,page*20+20);
 dialog.innerHTML='<header><div><p class="eyebrow">CHOOSE AN INDIVIDUAL</p><h2 id="picker-title">'+escape(options.title||'Choose your companion')+'</h2><p>Click a portrait to choose. Each copy has its own level, skills and tree.</p></div><button id="picker-close" class="text-button" aria-label="Close companion picker">✕</button></header><label class="picker-search">Search name, number or element<input id="picker-search" type="search" autocomplete="off" value="'+query.replace(/[&<>"]/g,'')+'" placeholder="e.g. Brimble #2"></label><div class="picker-filters">'+['All','Damage','Tank','Support'].map(r=>'<button data-picker-role="'+r+'" class="button secondary '+(role===r?'selected':'')+'" aria-pressed="'+(role===r)+'">'+r+'</button>').join('')+'</div><div class="picker-grid">'+(options.allowEmpty&&page===0&&!query?'<button class="picker-card picker-empty" data-pick=""><span>✧</span><strong>Empty this slot</strong><small>Travel with fewer companions</small></button>':'')+shown.map(m=>{
 const assigned=build.findIndex(u=>u?.instanceId===m.id),current=options.selected===m.id;
 return '<button class="picker-card '+(current?'selected':'')+'" data-pick="'+escape(m.id)+'" aria-pressed="'+current+'">'+CharacterRig.art(m.type)+'<strong>'+label(m)+'</strong><small>Lv '+(options.classes?BondProgress.trainerLevel(P.snapshot()):BondProgress.level(m.xp))+' · '+C.UNITS[m.type].element+' · '+(C.UNITS[m.type].designRole||C.UNITS[m.type].role)+'</small><em>'+(current?'SELECTED':assigned>0?'IN SLOT '+assigned+' · SWAP':'AVAILABLE')+'</em><span class="picker-kit">'+m.skills.map(k=>C.SKILLS[k].name).join(' · ')+'</span></button>';
 }).join('')+'</div>'+(!list.length?'<p class="picker-empty-message">'+(P.companions().length?'No companions match these filters.':'No companions summoned yet. Obtain an Echo and summon it from Inventory or Inner Sea.')+'</p>':'')+'<p id="picker-feedback" role="status"></p><footer><button class="button secondary" data-picker-page="-1" '+(!page?'disabled':'')+'>Previous</button><span>'+list.length+' available · '+(page+1)+' / '+pages+'</span><button class="button secondary" data-picker-page="1" '+(page===pages-1?'disabled':'')+'>Next</button></footer>';
 if(focusSearch){const input=dialog.querySelector('#picker-search');input.focus();try{input.setSelectionRange(query.length,query.length);}catch(_){}}
}
dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.id==='picker-close'){dialog.close();return;}
 if(b.hasAttribute('data-pick')){const id=b.dataset.pick;if(id&&!entries().some(m=>m.id===id))return;const chosen=options.onChoose;if(chosen&&chosen(id||null)===false){dialog.querySelector('#picker-feedback').textContent=P.error()||'This action is unavailable. Check your item quantity and the current Lv 60 companion cap.';return;}dialog.close();}
 if(b.dataset.pickerRole){role=b.dataset.pickerRole;page=0;draw();dialog.querySelector('[data-picker-role="'+role+'"]')?.focus();}
 if(b.dataset.pickerPage){page+=Number(b.dataset.pickerPage);draw();}
});
dialog.addEventListener('input',e=>{if(e.target.id==='picker-search'){query=e.target.value;page=0;draw(true);}});
dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else if(options.returnSelector)document.querySelector(options.returnSelector)?.focus({preventScroll:true});});
window.BondPicker={open(config){if(dialog.open)dialog.close();returnFocus=document.activeElement;options=config;query='';role='All';page=0;draw();dialog.showModal();dialog.querySelector('#picker-search').focus();},close:()=>dialog.close()};
})();
