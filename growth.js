/* Trainer and companion trees keep separate point policies and legacy replay. */
(function(root){
'use strict';
const TYPES=Object.keys(BondContent.UNITS);
const classTree=type=>root.BondClassTrees?.active&&BondContent.CLASSES.includes(type);
const companionTree=type=>!!root.BondCompanionTrees?.has(type);
const apprenticeTree=type=>type==='apprentice';
const data=[
 ['bond',null,'Growing bond','hp',.02,10,'♥'],
 ['might','bond','Strength','attack',.025,5,'✦'],['might2','might','Instinct','attack',.025,3,'✦'],
 ['guard','bond','Tough hide','armor',.008,5,'⬡'],['guard2','guard','Resilience','armor',.01,3,'⬡'],
 ['stride','bond','Light step','move',.02,5,'➶'],['stride2','stride','Trail runner','move',.02,3,'➶'],
 ['focus','bond','Focus','cooldown',.008,5,'◇'],['focus2','focus','Flow','cooldown',.01,3,'◇'],
 ['vigor','bond','Vitality','hp',.015,10,'♥'],['heart','vigor','Steadfast heart','hp',.03,3,'♥'],
 ['tempo','stride','Quickening','speed',.02,5,'ϟ'],['tempo2','tempo','Perfect rhythm','speed',.025,3,'ϟ'],
 ['care','focus','Restoration','healing',.02,5,'✿'],['care2','care','Nurturing bond','healing',.03,3,'✿'],
 ['resolve','guard2','Lasting resolve','armor',.005,10,'⬡'],
 ['mastery','might2','Practiced force','attack',.015,10,'✦'],
 ['signature','heart','Soul affinity','hp',.03,3,'✧']
];
const NODES=data.map(([id,parent,name,stat,value,max,icon])=>({id,parent,name,stat,value,max,icon,label:'+'+(value*100).toFixed(1).replace('.0','')+'% '+({hp:'maximum HP',attack:'strike damage',armor:'damage reduction',move:'movement',cooldown:'cooldown reduction',speed:'Speed',healing:'healing'}[stat])+' / rank'}));
const used=r=>Array.isArray(r)?new Set(r.filter(k=>NODES.some(n=>n.id===k))).size:Object.values(r||{}).reduce((n,v)=>n+(Number.isInteger(v)&&v>0?v:0),0);
const budget=(s,type='druid')=>apprenticeTree(type)?BondApprenticeTree.budget(BondProgress.trainerLevel(s)):classTree(type)?BondClassTrees.budget(BondProgress.trainerLevel(s)):companionTree(BondProgress.instance(s,type)?.type||type)?BondCompanionTrees.budget(s,type):0;
function clean(type,raw,points=999,legacyClass=false,legacyMonster=false,legacyApprentice=false){
 if(apprenticeTree(type)&&!legacyApprentice)return BondApprenticeTree.clean(raw,points);
 if(classTree(type)&&!legacyClass)return BondClassTrees.clean(type,raw,Math.min(15,points));
 if(companionTree(type)&&!legacyMonster)return BondCompanionTrees.clean(type,raw,points);
 const out={};if(!TYPES.includes(type))return out;
 if(Array.isArray(raw))raw=Object.fromEntries(raw.map(k=>[k,1]));
 if(!raw||typeof raw!=='object')return out;
 for(const n of NODES){const rank=Number.isInteger(raw[n.id])?Math.max(0,Math.min(n.max,raw[n.id],points-used(out))):0;if(rank&&(!n.parent||out[n.parent]))out[n.id]=rank;}
 return out;
}
const labels={hp:'maximum HP',attack:'strike damage',armor:'damage reduction',move:'movement',cooldown:'cooldown reduction',speed:'Speed',healing:'healing'};
function nodes(type,legacyClass=false,legacyMonster=false,legacyApprentice=false){
 if(apprenticeTree(type)&&!legacyApprentice)return BondApprenticeTree.nodes;
 if(classTree(type)&&!legacyClass)return BondClassTrees.nodes(type);
 if(companionTree(type)&&!legacyMonster)return BondCompanionTrees.nodes(type);
 const u=BondContent.UNITS[type],healer=u&&u.skills.some(k=>['heal','teamheal','selfheal','cleanse'].includes(BondContent.SKILLS[k].kind))||u?.passive==='cinder';
 const species=u&&u.role!=='Trainer',identity=species?{
  might:{name:BondContent.SKILLS[u.skills[0]].name+' practice',skill:u.skills[0],effect:'skillPower',value:.02},
  guard:{name:BondContent.SKILLS[u.skills[1]].name+' practice',skill:u.skills[1],effect:'skillPower',value:.02},
  stride:{name:BondContent.SKILLS[u.skills[2]].name+' rhythm',skill:u.skills[2],effect:'skillCooldown',value:.01},
  focus:{name:BondContent.SKILLS[u.skills[3]].name+' practice',skill:u.skills[3],effect:'skillPower',value:.02},
  care:{name:BondContent.SKILLS[u.skills[4]].name+' rhythm',skill:u.skills[4],effect:'skillCooldown',value:.01},
  signature:{name:(BondContent.PASSIVES[u.passive]?.name||u.name+' affinity')+' mastery'}
 }:{};
 return NODES.map(n=>{
  let stat=n.stat,name=n.name;
  if(stat==='healing'&&!healer){stat='attack';name=n.id==='care'?'Precise strikes':'Finishing force';}
  if(n.id==='signature'){stat=u?.role==='Support'||type==='druid'?'healing':u?.role==='Tank'?'hp':'attack';name=(u?.name||type)+' affinity';}
  const specific=identity[n.id];if(specific){name=specific.name||name;const value=specific.value??n.value;
   return {...n,name,value,stat:specific.effect?null:stat,effect:specific.effect||null,skill:specific.skill||null,
    label:specific.effect==='skillPower'?'+'+(value*100).toFixed(0)+'% '+BondContent.SKILLS[specific.skill].name+' effect / rank':specific.effect==='skillCooldown'?'-'+(value*100).toFixed(0)+'% '+BondContent.SKILLS[specific.skill].name+' cooldown / rank':'+'+(value*100).toFixed(1).replace('.0','')+'% '+labels[stat]+' / rank'};}
  return {...n,stat,name,label:'+'+(n.value*100).toFixed(1).replace('.0','')+'% '+labels[stat]+' / rank'};
 });
}
function typedStats(type,ranks,legacyClass=false,legacyMonster=false,legacyApprentice=false){
 const out={hp:0,attack:0,armor:0,move:0,cooldown:0,speed:0,healing:0,skillPower:{},skillCooldown:{}},byId=Object.fromEntries(nodes(type,legacyClass,legacyMonster,legacyApprentice).map(n=>[n.id,n]));
 if(apprenticeTree(type)&&!legacyApprentice)return {...out,...BondApprenticeTree.bonuses(ranks)};
 if(classTree(type)&&!legacyClass||companionTree(type)&&!legacyMonster)return out;
 for(const [id,rank] of Object.entries(clean(type,ranks,999,legacyClass,legacyMonster,legacyApprentice))){const n=byId[id];if(n.effect==='skillPower')out.skillPower[n.skill]=(out.skillPower[n.skill]||0)+n.value*rank;else if(n.effect==='skillCooldown')out.skillCooldown[n.skill]=(out.skillCooldown[n.skill]||0)+n.value*rank;else out[n.stat]+=n.value*rank;const legacy=BondContent.UNITS[type]?.legacySkills?.[BondContent.UNITS[type].skills.indexOf(n.skill)];if(legacy&&legacy!==n.skill&&['skillPower','skillCooldown'].includes(n.effect))out[n.effect][legacy]=(out[n.effect][legacy]||0)+n.value*rank;}
 out.armor=Math.min(.5,out.armor);out.cooldown=Math.min(.4,out.cooldown);return out;
}
function unlocked(s,ref){
 const mon=root.BondProgress?.instance(s||{},ref),type=mon?.type||ref;
 if(mon)return true;
 if(type==='apprentice')return !!s?.character&&!s.character.legacy&&!s.progression?.specialization;
 return s?.character?.legacy===true||s?.progression?.specialization===type;
}
function gate(type,id,r){if(apprenticeTree(type))return BondApprenticeTree.gate(id,r);if(classTree(type))return BondClassTrees.gate(type,id,r);if(companionTree(type))return BondCompanionTrees.gate(type,id,r);const node=nodes(type).find(n=>n.id===id);return !!node&&(!node.parent||!!r[node.parent]);}
root.BondGrowth={TYPES,NODES,nodes,budget,used,clean,stats:typedStats,unlocked,gate,classTree,companionTree,apprenticeTree};
})(globalThis);
