/* Prerequisite diagrams and inspectors. Profile remains the allocation authority. */
(function(root){
'use strict';
const selections={},branches={},positions=[[50,48],[24,174],[76,174],[50,302],[50,438]];
const paths=[[1,2],[1,3],[2,4],[3,4],[4,5]];
const esc=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy=text=>esc(String(text).replace(/([0-9]+(?:\.[0-9]+)?%?)\s*A\b/g,'$1 ATK').replace(/\bM\b/g,'MATK').replace(/\bH\b/g,'max HP').replace(/\bP\b/g,'primary ATK').replace(/\bcore (ally|allies|monster|monsters|party)\b/g,'$1').replace(/([\d.]+)R\b/g,'$1× melee reach').replace(/\blowest-HP% ally\b/g,'most wounded ally').replace(/\bpercentage points\b/g,'points'));
function icon(type,index){const companion=BondGrowth.companionTree(type),columns=BondGrowth.apprenticeTree(type)?2:5,atlas=companion?({Tank:'swordsman',Support:'druid',Ranged:'hunter'}[BondContent.UNITS[type].role]||(BondContent.UNITS[type].basicCategory==='magic'?'mage':'hunter')):type;index=companion?index%15:index;return '<span class="talent-icon" aria-hidden="true" style="--icon-size:'+(columns*100)+'% 300%;--icon-x:'+(index%columns*100/(columns-1))+'%;--icon-y:'+(Math.floor(index/columns)*50)+'%;--icon-atlas:url(assets/talents/'+atlas+'.png)"></span>';}
function requirements(node,nodes,ranks){
 if(node.type==='apprentice')return node.parent?[{label:nodes.find(n=>n.id===node.parent).name+' · rank 3',met:ranks[node.parent]===3}]:[];
 if(node.requires){const name=id=>nodes.find(n=>n.id===id)?.name||id,req=node.requires,out=req.all.map(id=>({label:name(id),met:ranks[id]===1}));
  if(req.any.length)out.push({label:req.any.map(name).join(' or '),met:req.any.some(id=>ranks[id]===1)});
  if(req.branch_points)out.push({label:req.branch_points+' points in this branch',met:nodes.filter(n=>n.branch===node.branch&&n.id!==node.id).reduce((sum,n)=>sum+(ranks[n.id]||0),0)>=req.branch_points});
  if(node.exclusive_with.length)out.push({label:'One final talent per companion',met:!node.exclusive_with.some(id=>ranks[id]===1)});
  return out;
 }
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
 const action=!owned||!unlocked?BondGrowth.companionTree(type)?'Summon this companion first':'Choose this class first':rank===node.max?'Max rank':!gate?'Requirements not met':used>=points?'No points available':rank?'Improve · 1 point':'Learn · 1 point';
 const req=requirements(node,nodes,ranks);
 return '<div class="talent-detail-heading">'+icon(type,nodes.indexOf(node))+'<div><p>'+esc(node.branch)+'</p><h3>'+esc(node.name)+'</h3><span>Rank '+rank+' / '+node.max+'</span></div></div>'+
  '<div class="talent-rank-descriptions">'+node.ranks.map((text,i)=>'<section class="'+(rank>i?'invested':'')+'"><h4>Rank '+(i+1)+(rank>i?' <span aria-label="Learned">✓</span>':'')+'</h4><p>'+copy(text)+'</p></section>').join('')+'</div>'+
  (req.length?'<div class="talent-requirements"><h4>Requires</h4><ul>'+req.map(r=>'<li class="'+(r.met?'met':'')+'"><span aria-label="'+(r.met?'Met':'Unmet')+'">'+(r.met?'✓':'◇')+'</span>'+esc(r.label)+'</li>').join('')+'</ul></div>':'')+
  '<div class="talent-detail-action"><button class="button primary" data-talent-learn="'+node.id+'" '+(!canLearn?'disabled':'')+'>'+action+'</button></div>';
}
function render(ctx){
 const {type,nodes,ranks,points,used,owned,unlocked,classPicker,name}=ctx;
 const apprentice=BondGrowth.apprenticeTree(type),companion=BondGrowth.companionTree(type),layout=apprentice?[[50,65],[50,255]]:companion?[[50,48],[24,172],[76,172],[24,296],[76,296],[50,448],[50,584],[50,740]]:positions,height=apprentice?340:companion?814:508;
 if(!nodes.some(n=>n.id===selections[type]))selections[type]=nodes[0].id;
 if(!Number.isInteger(branches[type]))branches[type]=0;
 const selected=nodes.find(n=>n.id===selections[type]),groups=[...new Set(nodes.map(n=>n.branch))];
 const groupMarkup=groups.map((branch,bi)=>{
  const group=nodes.filter(n=>n.branch===branch),spent=group.reduce((sum,n)=>sum+(ranks[n.id]||0),0);
  const links=apprentice?[[1,2]]:companion?group.flatMap((n,i)=>[...n.requires.all,...n.requires.any].map(id=>[group.findIndex(v=>v.id===id)+1,i+1])):paths;
  const edges=links.map(([from,to])=>{
   const a=group[from-1],b=group[to-1],[ax,ay]=layout[from-1],[bx,by]=layout[to-1],ready=(ranks[a.id]||0)===a.max;
   return '<path data-from="'+a.id+'" data-to="'+b.id+'" class="talent-edge '+(ready?(ranks[b.id]?'learned':'ready'):'')+'" d="M '+ax*2.4+' '+ay+' L '+bx*2.4+' '+by+'"/>';
  }).join('');
  const buttons=group.map((n,i)=>{
   const rank=ranks[n.id]||0,locked=!BondGrowth.gate(type,n.id,ranks),state=rank?'learned':locked?'locked':'available',[x,y]=layout[i];
   return '<button class="talent-node '+state+(i===group.length-1?' capstone':'')+(rank===n.max?' mastered':'')+'" data-talent-node="'+n.id+'" aria-pressed="'+(n.id===selected.id)+'" aria-label="'+esc(n.name)+', rank '+rank+' of '+n.max+(locked?', locked':'')+'" aria-haspopup="dialog" style="--node-x:'+x+'%;--node-y:'+y+'px">'+icon(type,nodes.indexOf(n))+'<span class="talent-rank">'+(rank===n.max?'✓ ':'')+rank+'/'+n.max+'</span><span class="talent-name">'+esc(n.name)+'</span>'+(locked?'<span class="talent-lock" aria-hidden="true">◆</span>':'')+'</button>';
  }).join('');
  return '<section class="class-talent-branch '+(branches[type]===bi?'current':'')+'" id="talent-branch-'+bi+'" aria-label="'+esc(branch)+'"><header><h4>'+esc(branch)+'</h4><span>'+spent+' / '+group.reduce((sum,n)=>sum+n.max,0)+'</span></header><div class="talent-map"><svg class="talent-lines" viewBox="0 0 240 '+height+'" preserveAspectRatio="none" aria-hidden="true">'+edges+'</svg>'+buttons+(apprentice?'':'<span class="talent-threshold fork-threshold">Either path · 4 points</span><span class="talent-threshold cap-threshold">7 branch points</span>')+'</div></section>';
 }).join('');
 return '<section class="talent-screen '+(apprentice?'apprentice-talents':companion?'companion-talents':'')+'" data-talent-class="'+type+'" data-talent-ref="'+esc(ctx.ref||type)+'"><header class="talent-toolbar"><div class="talent-class-name"><h3>'+esc(name)+'</h3>'+(apprentice?'<p class="apprentice-duration">Apprentice only · Max at Lv&nbsp;18</p>':'')+(classPicker?'<div class="talent-class-picker">'+classPicker+'</div>':'')+'</div><p id="tree-points" aria-live="polite"><b>'+Math.max(0,points-used)+'</b> points available <small>'+used+' / '+points+' invested</small></p>'+(companion?'':'<button class="button secondary" data-respec '+(!used||!owned||!unlocked?'disabled':'')+' title="Refund all talent points for free">Reset tree</button>')+'</header>'+
  '<div class="talent-layout"><div class="talent-board"><nav class="talent-branch-tabs" aria-label="Talent branches">'+groups.map((branch,i)=>'<button data-talent-branch="'+i+'" aria-pressed="'+(branches[type]===i)+'" aria-controls="talent-branch-'+i+'">'+esc(branch)+'</button>').join('')+'</nav><div class="class-branches">'+groupMarkup+'</div><div class="talent-legend" aria-label="Node states"><span><i class="locked"></i>Locked</span><span><i class="available"></i>Available</span><span><i class="learned"></i>Learned</span></div></div>'+
  '<aside class="talent-inspector" aria-label="Selected skill">'+inspector(ctx,selected)+'</aside></div>'+
  '<dialog class="talent-dialog" aria-label="'+esc(selected.name)+'"><button class="talent-detail-close" data-talent-close aria-label="Close skill details">×</button>'+inspector(ctx,selected)+'</dialog></section>';
}
function choose(type,id){const nodes=BondGrowth.nodes(type),node=nodes.find(n=>n.id===id);if(node){selections[type]=id;branches[type]=[...new Set(nodes.map(n=>n.branch))].indexOf(node.branch);}}
function branch(type,index){const nodes=BondGrowth.nodes(type),name=[...new Set(nodes.map(n=>n.branch))][index];if(name){branches[type]=index;selections[type]=nodes.find(n=>n.branch===name).id;}}
function inspect(){
 if(matchMedia('(max-width:1000px)').matches){const dialog=document.querySelector('.talent-dialog');if(dialog&&!dialog.open)dialog.showModal();}
}
function focusNode(){const screen=document.querySelector('.talent-screen'),id=selections[screen?.dataset.talentClass];document.querySelector('[data-talent-node="'+id+'"]')?.focus({preventScroll:true});}
function close(){document.querySelector('.talent-dialog')?.close();focusNode();}
root.BondTalentView={render,choose,branch,inspect,close,focusNode};
})(window);
