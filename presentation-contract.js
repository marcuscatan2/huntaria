/* Explicit visual assignment coverage. All deadlines are logical battle seconds. */
(function(root){
'use strict';
const C=BondContent,IMPACT_DELAY=.26;
function category(s){return ['heal','teamheal','selfheal','cleanse'].includes(s.kind)?'heal':['shield','selfshield','teamshield','guard'].includes(s.kind)?'ward':['haste','selfhaste'].includes(s.kind)?'status':['aoe','frontaoe'].includes(s.kind)?'area':s.category==='melee'?'physical':s.category==='ranged'?'projectile':'element';}
const assignments=Object.entries(C.UNITS).flatMap(([type,u])=>u.skills.map(id=>({id:type+':'+id,type,skill:id,category:category(C.SKILLS[id]),element:u.element,impactDelay:IMPACT_DELAY}))),innates=Object.entries(C.UNITS).filter(([,u])=>u.passive).map(([type,u])=>({type,passive:u.passive,category:['granite','shell','lastgrove','moonward'].includes(u.passive)?'ward':'status'}));
function timing(event,reduced=false){const periodic=event.kind==='regen'||/: Burn|Guard intercept/.test(event.text);return {start:event.time,impact:event.time+(reduced?0:IMPACT_DELAY),delay:reduced?0:IMPACT_DELAY,periodic};}
function validate(){const errors=[];if(assignments.length!==Object.values(C.UNITS).reduce((n,u)=>n+u.skills.length,0)||new Set(assignments.map(a=>a.id)).size!==assignments.length)errors.push('Every active unit skill needs one distinct assignment');for(const a of assignments)if(!a.category||!a.element)errors.push(a.id);return errors;}
root.BondPresentation={VERSION:16,IMPACT_DELAY,assignments,innates,timing,validate};
})(globalThis);
