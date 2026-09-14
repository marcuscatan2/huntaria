/* Quiet opening rules. No UI, storage, clocks or unseeded randomness. */
(function(root){
'use strict';
const C=root.BondContent;
const hair=['crop','sweep','braid'],faces=['calm','bright','focused'];
const hairColors=['#403329','#96613e','#dbc88e','#a24637','#879bad','#3b5550'];
const skinColors=['#f0c8a0','#dca77e','#b97c56','#935b41','#683e32','#482c27'];
const weapons={
 dagger:{name:'Worn dagger',category:'melee',power:38,interval:1.45,range:1,moveSpeed:1.3,skills:['trailcut','trailguard','trailbreath']},
 bow:{name:'Weathered bow',category:'ranged',power:34,interval:1.7,range:4,moveSpeed:1.1,skills:['trailshot','trailaim','trailbreath']}
};
const defaultLook={hair:'sweep',face:'calm',hairColor:0,skinColor:1};
const start={map:'clearing-0',position:{x:1680,y:5140}},camp={x:1680,y:5070};
function zone(p){return Math.hypot(p.x-camp.x,p.y-camp.y)<500?'Forest camp · safe rest':p.x<3000?C.UNITS.emberfox.name+' meadow · Lv2':p.x<6500?'Bloomgrove · Lv3':'Deepwood · '+C.UNITS.stonehorn.name+' Lv5';}
function groundAllowed(map,id,p){if(map!=='clearing-0')return true;if(Math.hypot(p.x-camp.x,p.y-camp.y)<400)return false;return id.includes(':stonehorn:')?p.x>=6500:id.includes(':bloomslime:')?p.x>=3200&&p.x<6400:id.includes(':emberfox:')?p.x>=500&&p.x<4000:true;}
function look(raw={}){return {hair:hair.includes(raw.hair)?raw.hair:'sweep',face:faces.includes(raw.face)?raw.face:'calm',hairColor:Number.isInteger(raw.hairColor)&&hairColors[raw.hairColor]?raw.hairColor:0,skinColor:Number.isInteger(raw.skinColor)&&skinColors[raw.skinColor]?raw.skinColor:1};}
function name(value){return typeof value==='string'?value.normalize('NFKC').trim().replace(/\s+/g,' '):'';}
function validName(value){const n=name(value);return n.length>=2&&n.length<=20&&/^[\p{L}\p{N}][\p{L}\p{N} '’-]*$/u.test(n);}
function needsIdentity(raw){return !raw||!validName(raw.name)||name(raw.name).toLocaleLowerCase()==='apprentice';}
function character(raw){
 if(raw?.legacy===true){const saved=name(raw.name);return needsIdentity(raw)?{legacy:true}:{legacy:true,name:saved};}
 if(!raw||!validName(raw.name)||!Object.hasOwn(weapons,raw.weapon))return null;
 return {version:1,name:name(raw.name),weapon:raw.weapon,look:look(raw.look)};
}
function build(raw,specialization=null){if(BondContent.CLASSES.includes(specialization))return {type:specialization,skills:[...C.UNITS[specialization].default]};const weapon=Object.hasOwn(weapons,raw?.weapon)?raw.weapon:'dagger';return {type:'apprentice',weapon,skills:[...weapons[weapon].skills]};}
function base(weapon='dagger'){const w=weapons[weapon]||weapons.dagger;return {...C.UNITS.apprentice,...w,basicCategory:w.category,name:'Apprentice',skills:[...w.skills],default:[...w.skills]};}
function attributes(weapon){return {str:weapon==='dagger'?12:1,agi:5,vit:9,int:1,dex:weapon==='bow'?12:1,leadership:1};}
const drops={
 emberfox:[{id:'leafdraught',bp:3500}],
 stonehorn:[{id:'leafdraught',bp:4500},{id:'revivalsalve',bp:1000}],
 bloomslime:[{id:'leafdraught',bp:6000}],
 tideotter:[{id:'leafdraught',bp:5000},{id:'trailfood',bp:1500}]
};
function loot(type,map,seed){
 if(map!=='clearing-0')return {};
 let mixed=(seed^0x51ea7e)>>>0;mixed=Math.imul(mixed^(mixed>>>16),0x7feb352d);mixed=Math.imul(mixed^(mixed>>>15),0x846ca68b);mixed=(mixed^(mixed>>>16))>>>0;
 const random=root.BondRules.rng(mixed),out={};
 for(const item of drops[type]||[])if(Math.floor(random()*10000)<item.bp)out[item.id]=1;
 return out;
}
root.BondOpening={VERSION:1,hair,faces,hairColors,skinColors,weapons,defaultLook,look,name,validName,needsIdentity,character,build,base,attributes,drops,loot,
 start,camp,zone,groundAllowed,text:'You wake up feeling lost. Where am I?'};
})(globalThis);
