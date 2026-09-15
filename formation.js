/* Combat deployment is separate from party identity and active-skill order. */
(function(root){
'use strict';
const RANKS=Object.freeze(['front','middle','back']);
const DEFAULT=Object.freeze(['back','middle','front']); // trainer, companion I, companion II
const POSITIONS=Object.freeze({front:Object.freeze({x:38,y:56}),middle:Object.freeze({x:27,y:41}),back:Object.freeze({x:16,y:72})});
const valid=v=>Array.isArray(v)&&v.length===3&&v.every(r=>RANKS.includes(r));
const clean=v=>valid(v)?[...v]:[...DEFAULT];
function assign(value,slot,rank){
 if(!Number.isInteger(slot)||slot<0||slot>2||!RANKS.includes(rank))return null;
 const next=clean(value);next[slot]=rank;return next;
}
function position(value,slot){
 const ranks=clean(value),rank=ranks[slot],members=ranks.map((r,i)=>r===rank?i:-1).filter(i=>i>=0);
 return {...POSITIONS[rank],...(members.length>1?{y:members.length===2?42+members.indexOf(slot)*28:36+members.indexOf(slot)*19}:{})};
}
root.BondFormation={RANKS,DEFAULT,POSITIONS,valid,clean,assign,position};
})(globalThis);
