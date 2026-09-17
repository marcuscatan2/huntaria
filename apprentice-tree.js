/* Simple personal training, available only before choosing a class. */
(function(root){
'use strict';
const rows=[
 ['practice','Power','Practice Strikes','attack',.02,null],
 ['force','Power','Heavy Blows','attack',.02,'practice'],
 ['health','Vitality','Healthy Start','hp',.03,null],
 ['endurance','Vitality','Endurance','hp',.03,'health'],
 ['footwork','Agility','Light Feet','agi',1,null],
 ['reflexes','Agility','Quick Reflexes','agi',1,'footwork']
];
const nodes=rows.map(([key,branch,name,stat,value,parent])=>({id:'apprentice:'+key,type:'apprentice',branch,name,stat,value,max:3,parent:parent?'apprentice:'+parent:null,
 ranks:[1,2,3].map(rank=>'+'+(stat==='agi'?value*rank:Math.round(value*rank*100))+(stat==='agi'?' AGI.':stat==='hp'?'% maximum HP.':'% damage.'))}));
const used=r=>Object.values(r||{}).reduce((n,v)=>n+(Number.isInteger(v)&&v>0?v:0),0);
const budget=level=>Math.max(0,Math.min(18,Math.floor(level||0)));
function gate(id,ranks){const node=nodes.find(n=>n.id===id);return !!node&&(!node.parent||ranks?.[node.parent]===3);}
function clean(raw,points=18){const out={};for(const node of nodes){const rank=Number.isInteger(raw?.[node.id])?Math.max(0,Math.min(node.max,raw[node.id],budget(points)-used(out))):0;if(rank&&gate(node.id,out))out[node.id]=rank;}return out;}
function bonuses(raw){const out={hp:0,attack:0,agi:0};for(const [id,rank] of Object.entries(clean(raw))){const node=nodes.find(n=>n.id===id);out[node.stat]+=node.value*rank;}return out;}
root.BondApprenticeTree={nodes,budget,gate,clean,bonuses};
})(globalThis);
