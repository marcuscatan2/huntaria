/* Pure ownership, slot eligibility and frozen combat equipment. No rewards or storage. */
(function(root){
'use strict';
const C=root.BondItemCatalog,SLOTS=['weapon','offhand','head','body','feet','accessory'];
const ITEMS={...C.items,...C.questItems},list=()=>Object.values(ITEMS),get=id=>ITEMS[id]||null;
function allowed(item,type,level){return !!item&&(item.kind==='held'?(!item.allowedSpecies.length||item.allowedSpecies.includes(type)):item.level<=level&&item.classes.includes(type));}
function assignments(s){return {...Object.fromEntries(SLOTS.map(k=>[k,s.equipment?.[k]||null])),...Object.fromEntries((s.companions||[]).map(m=>[m.id,m.heldItem||null]))};}
function used(s,id,except=null){return Object.entries(assignments(s)).filter(([slot,item])=>slot!==except&&item===id).length;}
function free(s,id,except=null){return Math.max(0,(s.inventory?.[id]||0)-used(s,id,except));}
function clean(s,raw){
 const counts={},take=id=>{if(!get(id)||!(s.inventory?.[id]>=(counts[id]||0)+1))return null;counts[id]=(counts[id]||0)+1;return id;};
 s.equipment=Object.fromEntries(SLOTS.map(slot=>{const id=raw?.equipment?.[slot];return [slot,get(id)?.kind==='equipment'&&get(id).slot===slot?take(id):null];}));
 for(const m of s.companions||[]){const id=m.heldItem;m.heldItem=get(id)?.kind==='held'&&allowed(get(id),m.type,1)?take(id):null;}
 return s;
}
function command(s,ref,id,slot){
 const mon=(s.companions||[]).find(m=>m.id===ref),item=id?get(id):null;
 if(id&&!item)return false;
 if(mon){if(item&&(item.kind!=='held'||!allowed(item,mon.type,1)||!free(s,id,mon.id)))return false;if(mon.heldItem===id)return false;mon.heldItem=id||null;return true;}
 const type=s.progression?.specialization||(s.character?.legacy?ref:'apprentice');
 if(!s.character||ref!==type||!SLOTS.includes(slot))return false;
 if(item&&(item.kind!=='equipment'||item.slot!==slot||!allowed(item,type,root.BondProgress.trainerLevel(s))||!free(s,id,slot)))return false;
 s.equipment||={};if(s.equipment[slot]===id)return false;s.equipment[slot]=id||null;return true;
}
function equipped(s,ref,type,level){
 const mon=(s.companions||[]).find(m=>m.id===ref);
 const ids=mon?[mon.heldItem]:SLOTS.map(k=>s.equipment?.[k]);
 return ids.filter(id=>get(id)&&allowed(get(id),type,level)&&s.inventory?.[id]>0);
}
function bonuses(s,type,level){const out={};for(const id of equipped(s,null,type,level))for(const [stat,n] of Object.entries(get(id).stats))out[stat]=(out[stat]||0)+n;return out;}
function loot(type,seed){const loot={};for(const id of C.drops[type]||[]){let hash=2166136261;for(const char of String(seed)+':'+id)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;const roll=Math.floor(root.BondRules.rng(hash)()*10000);if(roll<get(id).dropChanceBP)loot[id]=1;}return loot;}
function install(world){for(const item of list())world.ITEMS[item.id]={name:item.name,description:item.effect==='None'?'':item.effect,category:item.kind==='equipment'?'Equipment':'Held items',icon:'✧',equipment:true};}
root.BondEquipment={SLOTS,get,list,allowed,assignments,used,free,clean,command,equipped,bonuses,loot,install};
})(globalThis);
