/* Rules v13: explicit damage, deterministic randomness, no DOM or storage. */
(function(root){
'use strict';
const C=root.BondContent, categories=Object.freeze({
 melee:{label:'Melee physical',attribute:'str',short:'STR'},
 ranged:{label:'Ranged physical',attribute:'dex',short:'DEX'},
 magic:{label:'Magic',attribute:'int',short:'INT'}
});
const typed={
 magic:'bramble entangle frost nova hex comet firefan chain gust staticbolt sporemagic snowfall emberbreath fireball scorch stonewave rootbind riptide moonbeam lull',
 melee:'pounce burn pierce slam frostbite icepounce shellbash antler',
 ranged:'boulder snipe spore'
};
for(const [category,ids] of Object.entries(typed))for(const id of ids.split(' '))if(C.SKILLS[id])C.SKILLS[id].category=category;
for(const [id,u] of Object.entries(C.UNITS)){
 u.basicCategory=['druid','mage','cindrake','tideotter','lumimoth'].includes(id)?'magic':['stormowl','bloomslime','hunter'].includes(id)?'ranged':'melee';
}
function rng(seed=1){let x=Number.isInteger(seed)?seed>>>0:1;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
const damaging=s=>['hit','trainer','aoe','frontaoe'].includes(s.kind);
const categoryLabel=c=>categories[c]?categories[c].label+' · '+categories[c].short:'Utility · no damage scaling';
function validate(content=C){
 const errors=[];
 for(const [id,s] of Object.entries(content.SKILLS)){
  if(damaging(s)&&!categories[s.category])errors.push(id+': missing damage category');
  if(!Number.isFinite(s.amount)||s.amount<0||!Number.isFinite(s.cd)||s.cd<=0)errors.push(id+': invalid amount/cooldown');
 }
 for(const [id,u] of Object.entries(content.UNITS)){
  if(!categories[u.basicCategory])errors.push(id+': missing basic category');
  if(u.skills?.length!==5||new Set(u.skills).size!==5||u.skills.some(k=>!content.SKILLS[k]))errors.push(id+': invalid five-skill pool');
  if(u.default?.length!==3||new Set(u.default).size!==3||u.default.some(k=>!u.skills.includes(k)))errors.push(id+': invalid priorities');
  for(const key of ['hp','power','interval','moveSpeed','range'])if(!Number.isFinite(u[key])||u[key]<=0)errors.push(id+': invalid '+key);
  if(u.role!=='Trainer'&&!content.PASSIVES[u.passive])errors.push(id+': missing innate');
 }
 return errors;
}
// Classic physical hit chance: 80 + HIT - FLEE, bounded to 5–95 percent.
const dodgeChance=(defender,attacker,category,defenderLevel=1,attackerLevel=1)=>category==='magic'?0:1-Math.max(.05,Math.min(.95,(80+attackerLevel+Math.floor(attacker?.dex||0)-defenderLevel-Math.floor(defender?.agi||0))/100));
root.BondRules={VERSION:13,categories,categoryLabel,damaging,rng,validate,dodgeChance};
})(globalThis);
