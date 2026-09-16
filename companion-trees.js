/* Individual companion talent requirements. CSV cells are inert design data. */
(function(root){
'use strict';
const data=root.BondMonsterProgression;
const has=type=>Object.hasOwn(data.talents,type);
const used=r=>Object.values(r||{}).reduce((sum,v)=>sum+(v===1?1:0),0);
function nodes(type){return (data.talents[type]||[]).map(n=>({...n,max:n.max_rank,ranks:[n.effect],label:n.effect,branch:n.path,branchId:n.branch,stat:null,value:0,effect:'talent',icon:'✧'}));}
function gate(type,id,r={}){
 const node=data.talents[type]?.find(n=>n.id===id);if(!node)return false;
 const req=node.requires;
 return req.all.every(k=>r[k]===1)&&(!req.any.length||req.any.some(k=>r[k]===1))&&
  !node.exclusive_with.some(k=>r[k]===1)&&
  data.talents[type].filter(n=>n.branch===node.branch&&n.id!==id).reduce((sum,n)=>sum+(r[n.id]===1?1:0),0)>=req.branch_points;
}
function clean(type,raw,points=15){
 const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
 const pending=[...(data.talents[type]||[])];
 // A branch threshold can depend on a later sibling in source order.
 for(let pass=0;pass<8;pass++){let changed=false;for(const n of pending)if(!out[n.id]&&raw[n.id]===1&&used(out)<Math.min(15,points)&&gate(type,n.id,out)){out[n.id]=1;changed=true;}if(!changed)break;}
 return out;
}
function budget(s,ref){
 const mon=root.BondProgress.instance(s,ref),level=Math.max(root.BondProgress.monLevel(s,ref),mon?.treeLevel||1);
 return Math.min(15,1+Math.floor(Math.min(60,level)/5)+(s.journey?.early?.tidecrown===true?1:0)+(s.journey?.relic?.stage==='complete'?1:0));
}
root.BondCompanionTrees={has,nodes,gate,clean,budget};
})(globalThis);
