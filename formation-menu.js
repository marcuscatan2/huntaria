/* Accessible selectors and an illustrated deployment preview, no drag required. */
(function(root){
'use strict';
const F=BondFormation,P=BondProfile,host=document.querySelector('#teams');
const label=r=>r[0].toUpperCase()+r.slice(1);
function render(){
 const build=BondApp.getBuild()[0],ranks=P.snapshot().formation;
 return '<section class="formation-panel"><div class="library-heading"><div><p class="eyebrow">YOUR OPENING POSITIONS</p><h3>Choose who leads the charge.</h3><p>Zero to two companions. Empty positions are allowed. Choosing an occupied position swaps the two members.</p></div></div><div class="formation-direction"><span>Your side</span><strong>Approaching enemies →</strong></div><div class="formation-preview">'+['back','middle','front'].map(rank=>{
 const slot=ranks.indexOf(rank),u=build[slot];
 return '<article class="formation-place" data-formation-place="'+rank+'"><small>'+label(rank)+'</small><div>'+(u?CharacterRig.art(u.type):'<span class="empty-slot-symbol">✧</span>')+'</div><strong>'+(u?(u?(P.getCompanion(u.instanceId)?P.label(P.getCompanion(u.instanceId)):BondGame.UNITS[u.type].name):'Empty slot'):'Empty slot')+'</strong><span>'+(slot?'Companion '+(slot===1?'I':'II'):'Trainer')+'</span></article>';
 }).join('')+'</div><div class="formation-controls">'+build.map((u,slot)=>'<label><span>'+(u?(P.getCompanion(u.instanceId)?P.label(P.getCompanion(u.instanceId)):BondGame.UNITS[u.type].name):'Empty slot')+' <small>'+(slot?'Companion '+(slot===1?'I':'II'):'Trainer')+'</small></span><select data-formation-slot="'+slot+'" aria-label="'+(u?(P.getCompanion(u.instanceId)?P.label(P.getCompanion(u.instanceId)):BondGame.UNITS[u.type].name):'Empty slot')+' formation position">'+F.RANKS.map(rank=>'<option value="'+rank+'" '+(ranks[slot]===rank?'selected':'')+'>'+label(rank)+'</option>').join('')+'</select></label>').join('')+'</div><p class="formation-help">These are starting positions, not fixed lanes or bonus stats. Units still move into range and monsters still target enemy monsters first. Putting your trainer at the front does not change that rule; trainer-targeting skills remain exceptions.</p><p class="tree-warning">Formation applies to your party in practice, wild, NPC and boss practice fights. Editing it discards paused combat, but keeps saved spawn identities and drops. Party slots retain their positions when you replace a companion.</p></section>';
}
host.addEventListener('change',e=>{const slot=e.target.dataset.formationSlot;if(slot===undefined)return;P.setFormation(Number(slot),e.target.value);host.querySelector('[data-formation-slot="'+slot+'"]')?.focus({preventScroll:true});});
root.BondFormationView={render};
})(globalThis);
