/* Class trees and individual companion trees; species catalog is read-only. */
(function(){
'use strict';
const G=BondGrowth,P=BondProfile;let ref='druid';
function render(){
 const s=P.snapshot(),spec=s.progression?.specialization;if(s.character&&!s.character.legacy&&['druid','mage','apprentice'].includes(ref))ref=spec||'apprentice';const mon=P.getCompanion(ref),type=mon?.type||ref,u=BondGame.UNITS[type]||BondGame.UNITS.druid;
 const owned=!!mon||s.character?.legacy&&['druid','mage'].includes(ref)||spec===ref,r=mon?mon.growth:s.growth[type]||{},points=G.budget(s,ref),stats=G.stats(type,r),nodes=G.nodes(type),used=G.used(r),unlocked=G.unlocked(s,ref);
 const classButton=s.character&&!s.character.legacy?'<button class="button secondary" data-class-tree="'+(spec||'apprentice')+'">'+BondGame.UNITS[spec||'apprentice'].name+'</button>':'<button class="button secondary" data-class-tree="druid">Druid</button><button class="button secondary" data-class-tree="mage">Mage</button>';
 const bonuses=Object.entries(stats).filter(([,v])=>typeof v==='number').map(([k,v])=>'<span>'+k+' '+Math.round(v*100)+'%</span>').join('');
 return '<div class="library-heading"><div><p class="eyebrow">18 PASSIVE NODES · INDIVIDUAL BUILDS</p><h3>'+ (mon?P.label(mon):u.name)+'</h3><p>'+(!owned?'Summon this individual before investing points.':unlocked?'Changes affect this individual only (or this trainer class).':mon?'Monster skill trees unlock at player Lv 30.':'Choose a specialization at player Lv 20 to unlock its class tree.')+'</p></div></div><div class="tree-pickers">'+classButton+'<button class="button secondary" id="pick-tree-companion">Choose a companion →</button></div><section class="mastery-panel '+(!unlocked?'tree-locked':'')+'"><div class="mastery-heading"><div><h3>'+u.role+' mastery</h3><p id="tree-points">'+(points-used)+' / '+points+' points available · '+used+' invested</p></div><button class="button secondary" data-respec '+(!used||!owned||!unlocked?'disabled':'')+'>Reset tree · free</button></div><div class="tree-bonuses">'+bonuses+'</div><div class="ranked-tree">'+nodes.map(n=>{
 const rank=r[n.id]||0,locked=n.parent&&!r[n.parent],parent=nodes.find(x=>x.id===n.parent);
 return '<button class="tree-node '+(rank?'learned':locked?'locked':'available')+'" data-learn="'+n.id+'" '+(!owned||!unlocked||locked||rank>=n.max||used>=points?'disabled':'')+'><span>'+n.icon+'</span><strong>'+n.name+'</strong><small>'+n.label+'</small><b>Rank '+rank+' / '+n.max+'</b><em>'+(!owned?'SUMMON TO TRAIN':!unlocked?mon?'UNLOCKS AT PLAYER LV 30':'SPECIALIZE FIRST':locked?'Requires '+parent.name:rank>=n.max?'MAX RANK':used>=points?'No points available':'Improve · 1 point')+'</em></button>';
 }).join('')+'</div><p class="tree-explanation">Monster trees unlock at player level 30. Their points follow this individual’s level, not its species or a stronger copy. Skill-linked nodes are specific to this species. Free reset affects only the selected tree.</p></section>';
}
document.querySelector('#teams').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.classTree){ref=b.dataset.classTree;BondMenu.render();}
 if(b.id==='pick-tree-companion')BondPicker.open({title:'Choose an individual skill tree',selected:ref,returnSelector:'#pick-tree-companion',onChoose:id=>{ref=id;BondMenu.render();}});
 if(b.dataset.learn){P.learn(ref,b.dataset.learn);document.querySelector('[data-learn="'+b.dataset.learn+'"]')?.focus({preventScroll:true});}
 if(b.hasAttribute('data-respec'))P.respec(ref);
 if(b.dataset.openTree){ref=b.dataset.openTree;BondMenu.open('trees');}
});
window.BondTree={render,select(id){ref=id;BondMenu.open('trees');}};
})();
