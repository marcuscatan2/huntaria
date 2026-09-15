/* Accessible selectors and an illustrated deployment preview, no drag required. */
(function(root){
'use strict';
const F=BondFormation,P=BondProfile,host=document.querySelector('#teams');
const label=r=>r[0].toUpperCase()+r.slice(1);
function render(){
 const build=BondApp.getBuild()[0],ranks=P.snapshot().formation;
 return '<section class="formation-panel"><div class="library-heading"><div><p class="eyebrow">YOUR OPENING POSITIONS</p><h3>Choose who leads the charge.</h3><p>Choose Front, Middle or Back for each party member. Members can share a row.</p></div></div><div class="formation-direction"><span>Your side</span><strong>Approaching enemies →</strong></div><div class="formation-preview">'+['back','middle','front'].map(rank=>{
 const members=build.map((u,slot)=>({u,slot})).filter(({u,slot})=>u&&ranks[slot]===rank);
 return '<article class="formation-place" data-formation-place="'+rank+'"><small>'+label(rank)+'</small><div class="formation-members">'+(members.length?members.map(({u,slot})=>'<div class="formation-member" data-member-slot="'+slot+'">'+CharacterRig.art(u.type)+'<strong>'+(P.getCompanion(u.instanceId)?P.label(P.getCompanion(u.instanceId)):BondGame.UNITS[u.type].name)+'</strong></div>').join(''):'<span class="empty-slot-symbol">'+String.fromCodePoint(0x2727)+'</span>')+'</div></article>';
 }).join('')+'</div><div class="formation-controls">'+build.map((u,slot)=>'<label><span>'+(u?(P.getCompanion(u.instanceId)?P.label(P.getCompanion(u.instanceId)):BondGame.UNITS[u.type].name):'Empty slot')+' <small>'+(slot?'Companion '+(slot===1?'I':'II'):'Trainer')+'</small></span><select data-formation-slot="'+slot+'" aria-label="'+(u?(P.getCompanion(u.instanceId)?P.label(P.getCompanion(u.instanceId)):BondGame.UNITS[u.type].name):'Empty slot')+' formation position">'+F.RANKS.map(rank=>'<option value="'+rank+'" '+(ranks[slot]===rank?'selected':'')+'>'+label(rank)+'</option>').join('')+'</select></label>').join('')+'</div><p class="formation-help">Enemies aim for the closest party member. Put your knight at the front to meet them first. Skills can choose a different target.</p><p class="tree-warning">Your formation sets the starting positions for the next fight. Each party slot keeps its row when you change companions.</p></section>';
}
host.addEventListener('change',e=>{const slot=e.target.dataset.formationSlot;if(slot===undefined)return;P.setFormation(Number(slot),e.target.value);host.querySelector('[data-formation-slot="'+slot+'"]')?.focus({preventScroll:true});});
root.BondFormationView={render};
})(globalThis);
