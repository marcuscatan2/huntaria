/* Trainer talent diagram and inspector. Profile remains the allocation authority. */
(function(root){
'use strict';
const selections={},branches={},positions=[[50,48],[24,174],[76,174],[50,302],[50,438]];
const paths=[[1,2],[1,3],[2,4],[3,4],[4,5]];
const esc=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy=text=>esc(String(text).replace(/([0-9]+(?:\.[0-9]+)?%?)\s*A\b/g,'$1 ATK').replace(/\bM\b/g,'MATK').replace(/\bH\b/g,'max HP').replace(/\bP\b/g,'primary ATK'));
function icon(type,index){return '<span class="talent-icon" aria-hidden="true" style="--icon-x:'+(index%5*25)+'%;--icon-y:'+(Math.floor(index/5)*50)+'%;--icon-atlas:url(assets/talents/'+type+'.png)"></span>';}
function requirements(node,nodes,ranks){
 const index=Number(node.id.slice(-1)),prefix=node.id.slice(0,-1),rank=i=>ranks[prefix+i]||0,name=i=>nodes.find(n=>n.id===prefix+i).name;
 if(index===1)return [];
 const out=[{label:name(1)+' · rank 2',met:rank(1)===2}];
 if(index===2||index===3)return out;
 if(index===4){out.push({label:name(2)+' or '+name(3)+' · rank 2',met:rank(2)===2||rank(3)===2},{label:'4 points in this branch',met:rank(1)+rank(2)+rank(3)>=4});}
 else out.push({label:name(4)+' · rank 2',met:rank(4)===2},{label:'7 points in this branch',met:rank(1)+rank(2)+rank(3)+rank(4)>=7});
 return out;
}
function inspector(ctx,node){
 const {type,nodes,ranks,owned,unlocked,points,used}=ctx,rank=ranks[node.id]||0,gate=BondGrowth.gate(type,node.id,ranks);
 const canLearn=owned&&unlocked&&gate&&rank<node.max&&used<points;
 const action=!owned||!unlocked?'Choose this class first':rank===node.max?'Max rank':!gate?'Requirements not met':used>=points?'No points available':rank?'Improve · 1 point':'Learn · 1 point';
 const req=requirements(node,nodes,ranks);
 return '<div class="talent-detail-heading">'+icon(type,nodes.indexOf(node))+'<div><p>'+esc(node.branch)+'</p><h3>'+esc(node.name)+'</h3><span>Rank '+rank+' / '+node.max+'</span></div></div>'+
  '<div class="talent-rank-descriptions">'+node.ranks.map((text,i)=>'<section class="'+(rank>i?'invested':'')+'"><h4>Rank '+(i+1)+(rank>i?' <span aria-label="Learned">✓</span>':'')+'</h4><p>'+copy(text)+'</p></section>').join('')+'</div>'+
  (req.length?'<div class="talent-requirements"><h4>Requires</h4><ul>'+req.map(r=>'<li class="'+(r.met?'met':'')+'"><span aria-label="'+(r.met?'Met':'Unmet')+'">'+(r.met?'✓':'◇')+'</span>'+esc(r.label)+'</li>').join('')+'</ul></div>':'')+
  '<div class="talent-detail-action"><button class="button primary" data-talent-learn="'+node.id+'" '+(!canLearn?'disabled':'')+'>'+action+'</button></div>';
}
function render(ctx){
 const {type,nodes,ranks,points,used,owned,unlocked,classPicker,name}=ctx;
 if(!nodes.some(n=>n.id===selections[type]))selections[type]=nodes[0].id;
 if(!Number.isInteger(branches[type]))branches[type]=0;
 const selected=nodes.find(n=>n.id===selections[type]),groups=[...new Set(nodes.map(n=>n.branch))];
 const groupMarkup=groups.map((branch,bi)=>{
  const group=nodes.filter(n=>n.branch===branch),spent=group.reduce((sum,n)=>sum+(ranks[n.id]||0),0);
  const edges=paths.map(([from,to])=>{
   const a=group[from-1],b=group[to-1],[ax,ay]=positions[from-1],[bx,by]=positions[to-1],ready=(ranks[a.id]||0)===a.max;
   return '<path data-from="'+a.id+'" data-to="'+b.id+'" class="talent-edge '+(ready?(ranks[b.id]?'learned':'ready'):'')+'" d="M '+ax*2.4+' '+ay+' L '+bx*2.4+' '+by+'"/>';
  }).join('');
  const buttons=group.map((n,i)=>{
   const rank=ranks[n.id]||0,locked=!BondGrowth.gate(type,n.id,ranks),state=rank?'learned':locked?'locked':'available',[x,y]=positions[i];
   return '<button class="talent-node '+state+(i===4?' capstone':'')+(rank===n.max?' mastered':'')+'" data-talent-node="'+n.id+'" aria-pressed="'+(n.id===selected.id)+'" aria-label="'+esc(n.name)+', rank '+rank+' of '+n.max+(locked?', locked':'')+'" aria-haspopup="dialog" style="--node-x:'+x+'%;--node-y:'+y+'px">'+icon(type,nodes.indexOf(n))+'<span class="talent-rank">'+(rank===n.max?'✓ ':'')+rank+'/'+n.max+'</span><span class="talent-name">'+esc(n.name)+'</span>'+(locked?'<span class="talent-lock" aria-hidden="true">◆</span>':'')+'</button>';
  }).join('');
  return '<section class="class-talent-branch '+(branches[type]===bi?'current':'')+'" id="talent-branch-'+bi+'" aria-label="'+esc(branch)+'"><header><h4>'+esc(branch)+'</h4><span>'+spent+' / 9</span></header><div class="talent-map"><svg class="talent-lines" viewBox="0 0 240 508" preserveAspectRatio="none" aria-hidden="true">'+edges+'</svg>'+buttons+'<span class="talent-threshold fork-threshold">Either path · 4 points</span><span class="talent-threshold cap-threshold">7 branch points</span></div></section>';
 }).join('');
 return '<section class="talent-screen" data-talent-class="'+type+'"><header class="talent-toolbar"><div class="talent-class-name"><h3>'+esc(name)+'</h3>'+(classPicker?'<div class="talent-class-picker">'+classPicker+'</div>':'')+'</div><p id="tree-points" aria-live="polite"><b>'+Math.max(0,points-used)+'</b> points available <small>'+used+' / '+points+' invested</small></p><button class="button secondary" data-respec '+(!used||!owned||!unlocked?'disabled':'')+' title="Refund all class talent points for free">Reset tree</button></header>'+
  '<div class="talent-layout"><div class="talent-board"><nav class="talent-branch-tabs" aria-label="Talent branches">'+groups.map((branch,i)=>'<button data-talent-branch="'+i+'" aria-pressed="'+(branches[type]===i)+'" aria-controls="talent-branch-'+i+'">'+esc(branch)+'</button>').join('')+'</nav><div class="class-branches">'+groupMarkup+'</div><div class="talent-legend" aria-label="Node states"><span><i class="locked"></i>Locked</span><span><i class="available"></i>Available</span><span><i class="learned"></i>Learned</span></div></div>'+
  '<aside class="talent-inspector" aria-label="Selected skill">'+inspector(ctx,selected)+'</aside></div>'+
  '<dialog class="talent-dialog" aria-label="'+esc(selected.name)+'"><button class="talent-detail-close" data-talent-close aria-label="Close skill details">×</button>'+inspector(ctx,selected)+'</dialog></section>';
}
function choose(type,id){selections[type]=id;const nodes=BondClassTrees.nodes(type),index=nodes.findIndex(n=>n.id===id);if(index>=0)branches[type]=Math.floor(index/5);}
function branch(type,index){branches[type]=index;selections[type]=BondClassTrees.nodes(type)[index*5]?.id;}
function inspect(){
 if(matchMedia('(max-width:1000px)').matches){const dialog=document.querySelector('.talent-dialog');if(dialog&&!dialog.open)dialog.showModal();}
}
function focusNode(){const screen=document.querySelector('.talent-screen'),id=selections[screen?.dataset.talentClass];document.querySelector('[data-talent-node="'+id+'"]')?.focus({preventScroll:true});}
function close(){document.querySelector('.talent-dialog')?.close();focusNode();}
root.BondTalentView={render,choose,branch,inspect,close,focusNode};
})(window);
