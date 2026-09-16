/* Class trees and individual companion trees; species catalog is read-only. */
(function(){
'use strict';
const G=BondGrowth,P=BondProfile;let ref='druid';
const escape=text=>String(text).replace(/([0-9]+(?:\.[0-9]+)?%?)\s*A\b/g,'$1 ATK').replace(/\bM\b/g,'MATK').replace(/\bH\b/g,'max HP').replace(/\bP\b/g,'primary ATK').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(scope='class'){
 if(scope==='class'&&!BondContent.TRAINERS.includes(ref))ref=P.snapshot().progression?.specialization||BondApp.getBuild()[0][0].type;
 const s=P.snapshot(),spec=s.progression?.specialization;if(s.character&&!s.character.legacy&&BondContent.TRAINERS.includes(ref))ref=spec||'apprentice';const mon=P.getCompanion(ref),type=mon?.type||ref,u=BondGame.UNITS[type]||BondGame.UNITS.druid;
 const owned=!!mon||s.character?.legacy&&BondContent.CLASSES.includes(ref)||spec===ref,r=mon?mon.growth:s.growth[type]||{},points=G.budget(s,ref),stats=G.stats(type,r),nodes=G.nodes(type),used=G.used(r),unlocked=G.unlocked(s,ref);
 const classButton=s.character&&!s.character.legacy?'<button class="button secondary" data-class-tree="'+(spec||'apprentice')+'">'+BondGame.UNITS[spec||'apprentice'].name+'</button>':BondContent.CLASSES.map(type=>'<button class="button secondary" data-class-tree="'+type+'">'+BondContent.UNITS[type].name+'</button>').join('');
 const bonuses=Object.entries(G.classTree(type)?{}:stats).filter(([,v])=>typeof v==='number').map(([k,v])=>'<span>'+k+' '+Math.round(v*100)+'%</span>').join('');
 const nodeMarkup=n=>{
  const rank=r[n.id]||0,locked=!G.gate(type,n.id,r),parent=nodes.find(x=>x.id===n.parent);
  const description=n.ranks?escape(n.ranks[0])+(n.ranks[1]?'<small>Rank 2: '+escape(n.ranks[1])+'</small>':''):escape(n.label);
  const action=!owned?(scope==='class'?'SPECIALIZE FIRST':'SUMMON TO TRAIN'):!unlocked?mon?'UNLOCKS AT PLAYER LV 30':'SPECIALIZE FIRST':locked?(n.requirement||'Requires '+parent.name):rank>=n.max?'MAX RANK':used>=points?'No points available':'Improve (1 point)';
  return '<button class="tree-node '+(rank?'learned':locked?'locked':'available')+'" data-learn="'+n.id+'" '+(!owned||!unlocked||locked||rank>=n.max||used>=points?'disabled':'')+'><span>'+n.icon+'</span><strong>'+escape(n.name)+'</strong><small>'+description+'</small><b>Rank '+rank+' / '+n.max+'</b><em>'+escape(action)+'</em></button>';
 };
 const tree=G.classTree(type)?'<div class="class-branches">'+[...new Set(nodes.map(n=>n.branch))].map(branch=>'<section class="class-talent-branch"><h4>'+escape(branch)+'</h4><div class="ranked-tree">'+nodes.filter(n=>n.branch===branch).map(nodeMarkup).join('')+'</div></section>').join('')+'</div>':'<div class="ranked-tree">'+nodes.map(nodeMarkup).join('')+'</div>';
 return '<div class="library-heading"><div><h3>'+ (mon?P.label(mon):u.name)+'</h3><p>'+(!owned?(scope==='class'?'Choose a class at Lv 20.':'Summon this companion to unlock its tree.'):unlocked?'':mon?'Unlocks at Lv 30.':'Choose a class at Lv 20.')+'</p></div></div><div class="tree-pickers">'+(scope==='class'?classButton:'<button class="button secondary" data-collection-mode="companions">Back to companions</button>')+'</div><section class="mastery-panel '+(!unlocked?'tree-locked':'')+'"><div class="mastery-heading"><div><h3>'+(G.classTree(type)?'Class talents':u.role+' mastery')+'</h3><p id="tree-points">'+(points-used)+' / '+points+' points available, '+used+' invested</p></div><button class="button secondary" data-respec '+(!used||!owned||!unlocked?'disabled':'')+'>Reset tree (free)</button></div>'+(bonuses?'<div class="tree-bonuses">'+bonuses+'</div>':'')+tree+'</section>';
}
document.querySelector('#teams').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.classTree){ref=b.dataset.classTree;BondMenu.render();}
 if(b.dataset.learn){P.learn(ref,b.dataset.learn);document.querySelector('[data-learn="'+b.dataset.learn+'"]')?.focus({preventScroll:true});}
 if(b.hasAttribute('data-respec'))P.respec(ref);
 if(b.dataset.openTree)select(b.dataset.openTree);
});
function select(id){ref=id;BondMenu.open(P.getCompanion(id)||BondContent.MONSTERS.includes(id)?'mastery':'trees');}
window.BondTree={render,select};
})();
