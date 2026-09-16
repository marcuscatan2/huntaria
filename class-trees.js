/* Class-specific prerequisites and point accounting, separate from companion mastery. */
(function(root){
'use strict';
const active=true;
const catalog=root.BondCombatCatalog.talents,all=Object.values(catalog);
function nodes(type){return all.filter(n=>n.type===type).map(n=>({...n,parent:n.id.endsWith('1')?null:n.id.slice(0,-1)+(n.id.endsWith('5')?'4':'1'),icon:{mage:'✧',druid:'✿',swordsman:'⬡',hunter:'➶'}[type],requirement:n.id.endsWith('5')?'7 branch points and Advanced rank 2':n.id.endsWith('4')?'4 branch points and a completed fork':'Opening rank 2',label:n.ranks[0],stat:null,value:0,effect:'talent'}));}
const used=r=>Object.values(r||{}).reduce((n,v)=>n+(Number.isInteger(v)&&v>0?v:0),0);
function gate(type,id,r){
 const node=catalog[id];if(!node||node.type!==type)return false;const prefix=id.slice(0,-1),index=Number(id.slice(-1)),rank=i=>r?.[prefix+i]||0;
 if(index===1)return true;if(index===2||index===3)return rank(1)===2;
 if(index===4)return rank(1)+rank(2)+rank(3)>=4&&(rank(2)===2||rank(3)===2)&&rank(1)===2;
 return rank(1)+rank(2)+rank(3)+rank(4)>=7&&rank(4)===2&&rank(1)===2;
}
function clean(type,raw,points=15){const out={};for(const node of nodes(type)){const rank=raw&&Number.isInteger(raw[node.id])?Math.max(0,Math.min(node.max,raw[node.id],points-used(out))):0;if(rank&&gate(type,node.id,out))out[node.id]=rank;}return out;}
function budget(level){return level<20?0:Math.min(15,2+Math.floor((level-20)/3));}
root.BondClassTrees={active,nodes,gate,clean,budget};
})(globalThis);
