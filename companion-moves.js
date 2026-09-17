/* Personal move knowledge. Authored enemy kits and frozen encounters stay explicit. */
(function(root){
'use strict';
const C=BondContent,R=BondProgress,catalog=BondCombatCatalog;
const general=Object.values(catalog.skills).filter(s=>!s.number).map(s=>s.id);
const signature=id=>!!catalog.skills[id]?.number;
const signatures=type=>Object.values(catalog.skills).filter(s=>s.owner===type).map(s=>s.id),plans=new Map();
const validID=(type,id)=>C.MONSTERS.includes(type)&&(C.UNITS[type].skills.includes(id)||general.includes(id));
function plan(type){
 if(plans.has(type))return plans.get(type);
 const u=C.UNITS[type],own=signatures(type);if(!own.length)return [];
 const basic=['general-quick-strike',u.basicCategory==='magic'?'general-basic-ward':'general-brace'];
 const lessons=u.role==='Support'?['general-basic-heal','general-rally','general-greater-heal']:u.role==='Tank'?['general-guard','general-fortify','general-focused-attack']:['general-focused-attack','general-battle-rhythm','general-fortify'];
 const levels=own.length===4?[1,16,32,48]:[1,24,48],between=own.length===4?[8,24,40]:[12,36];
 const rows=[...own.map((id,i)=>({id,level:levels[i],signature:true})),...basic.map(id=>({id,level:1,signature:false})),...between.map((level,i)=>({id:lessons[i],level,signature:false}))].sort((a,b)=>a.level-b.level);plans.set(type,rows);return rows;
}
const initial=type=>plan(type).filter(s=>s.level===1).map(s=>s.id);
const level=mon=>Math.max(R.level(mon.xp),Math.min(60,Math.max(1,Number.isInteger(mon.moveLevel)?mon.moveLevel:1,Number.isInteger(mon.treeLevel)?mon.treeLevel:1)));
function learned(mon){
 const retired=mon.movesVersion===1?mon.legacyMoves:mon.skills;
 return [...new Set([...plan(mon.type).filter(s=>s.level<=level(mon)).map(s=>s.id),...(Array.isArray(mon.taughtMoves)?mon.taughtMoves:[]).filter(id=>general.includes(id)),...(Array.isArray(retired)?retired:[]).filter(id=>validID(mon.type,id))])];
}
function clean(mon){
 const legacy=mon.movesVersion===1?mon.legacyMoves:mon.skills;
 mon.moveLevel=level(mon);mon.taughtMoves=[...new Set((Array.isArray(mon.taughtMoves)?mon.taughtMoves:[]).filter(id=>general.includes(id)))];
 mon.legacyMoves=[...new Set((Array.isArray(legacy)?legacy:[]).filter(id=>validID(mon.type,id)))];mon.movesVersion=1;
 const known=learned(mon);mon.skills=[...new Set([...(Array.isArray(mon.skills)?mon.skills:[]).filter(id=>known.includes(id)),...initial(mon.type),...known])].slice(0,3);
 return mon;
}
const validLoadout=(mon,skills)=>Array.isArray(skills)&&skills.length===3&&new Set(skills).size===3&&skills.every(id=>learned(mon).includes(id));
root.BondCompanionMoves={general,signature,signatures,validID,plan,initial,level,learned,clean,validLoadout};
})(globalThis);
