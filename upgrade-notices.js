/* Read-only upgrade routes. Spending remains owned by BondProfile. */
(function(root){
'use strict';
const R=BondProgress,G=BondGrowth;
function tree(s,ref){
 const mon=R.instance(s,ref),type=mon?.type||ref,ranks=mon?.growth||s.growth?.[type]||{};
 const points=Math.max(0,G.budget(s,ref)-G.used(ranks));
 const nodes=points&&G.unlocked(s,ref)?G.nodes(type).filter(n=>(ranks[n.id]||0)<n.max&&G.gate(type,n.id,ranks)):[];
 return {points,nodes:new Set(nodes.map(n=>n.id)),branches:new Set(nodes.map(n=>n.branch)),available:!!nodes.length};
}
function read(s,type=s.progression?.specialization||'apprentice'){
 const attributes=R.attributes(s),left=Math.max(0,R.statBudget(R.trainerLevel(s))-R.spent(attributes));
 const stats=new Set(s.character?R.ATTRS.filter(k=>attributes[k]<99&&left>=R.cost(attributes[k])):[]);
 const trainer=tree(s,type),companions=new Map((s.companions||[]).map(m=>[m.id,tree(s,m.id)]));
 const held=new Set((s.companions||[]).filter(m=>!m.heldItem&&BondEquipment.list().some(item=>item.kind==='held'&&BondEquipment.allowed(item,m.type,R.level(m.xp))&&BondEquipment.free(s,item.id,m.id)>0)).map(m=>m.id));
 const inner=!!stats.size||trainer.available||held.size>0||[...companions.values()].some(t=>t.available);
 return {stats,attributePoints:left,trainer,companions,held,inner,any:inner};
}
function mark(button,active,description='Upgrade points available'){
 if(!button)return;
 const on=!!active&&!button.disabled;
 button.classList.toggle('has-upgrade',on);
 let dot=button.querySelector(':scope > .upgrade-dot');
 if(on&&!dot){dot=document.createElement('span');dot.className='upgrade-dot';dot.setAttribute('aria-hidden','true');button.append(dot);}
 if(!on&&dot)dot.remove();
 if(on)button.setAttribute('aria-description',description);
 else button.removeAttribute('aria-description');
}
function refresh(){
 const s=BondProfile.snapshot(),type=s.progression?.specialization||root.BondApp?.getBuild()?.[0]?.[0]?.type||'apprentice',state=read(s,type);
 const companionUpgrade=id=>state.companions.get(id)?.available||state.held.has(id),party=[...state.companions.keys()].some(companionUpgrade);
 const route=name=>name==='collection'?state.inner:name==='trees'?state.trainer.available:name==='trainer'?!!state.stats.size:name==='companions'?party:false;
 for(const button of document.querySelectorAll('[data-world-menu],[data-frame-menu],[data-menu],[data-collection-mode]'))mark(button,route(button.dataset.worldMenu||button.dataset.frameMenu||button.dataset.menu||button.dataset.collectionMode));
 for(const button of document.querySelectorAll('[data-sea-tab]'))mark(button,button.dataset.seaTab==='trainer'?state.trainer.available||state.stats.size:button.dataset.seaTab==='party'&&party);
 for(const button of document.querySelectorAll('[data-instance]'))mark(button,companionUpgrade(button.dataset.instance));
 for(const button of document.querySelectorAll('[data-open-equipment]'))mark(button,state.held.has(button.dataset.openEquipment),'Compatible held item available');
 for(const button of document.querySelectorAll('[data-open-tree]'))mark(button,state.companions.get(button.dataset.openTree)?.available||(button.dataset.openTree===type&&state.trainer.available));
 for(const button of document.querySelectorAll('[data-stat]'))mark(button,state.stats.has(button.dataset.stat));
 const screen=document.querySelector('.talent-screen'),ref=screen?.dataset.talentRef||screen?.dataset.talentClass;
 if(ref){const current=tree(s,ref);for(const button of screen.querySelectorAll('[data-talent-node],[data-talent-learn]'))mark(button,current.nodes.has(button.dataset.talentNode||button.dataset.talentLearn));
  const branches=[...new Set(G.nodes(R.instance(s,ref)?.type||ref).map(n=>n.branch))];for(const button of screen.querySelectorAll('[data-talent-branch]'))mark(button,current.branches.has(branches[Number(button.dataset.talentBranch)]));}
 const cards=[...document.querySelectorAll('[data-instance]')],companions=(s.companions||[]).filter(m=>{const query=document.querySelector('#collection-search')?.value.toLowerCase()||'';return !query||(BondProfile.label(m)+' '+BondContent.UNITS[m.type].element).toLowerCase().includes(query);});
 if(cards.length){const first=companions.findIndex(m=>m.id===cards[0].dataset.instance),last=companions.findIndex(m=>m.id===cards.at(-1).dataset.instance);for(const button of document.querySelectorAll('[data-page]'))mark(button,(Number(button.dataset.page)<0?companions.slice(0,first):companions.slice(last+1)).some(m=>companionUpgrade(m.id)));}
}
root.BondUpgradeNotices={read,refresh};
})(window);
