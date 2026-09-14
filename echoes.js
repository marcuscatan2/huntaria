/* One persisted roll per life; summoning never rolls. */
(function(root){
'use strict';
const qualifies=(roll,bp)=>Number.isInteger(roll)&&roll>=0&&roll<10000&&Number.isInteger(bp)&&bp>=0&&bp<=10000&&roll<bp;
function roll(){
 const a=new Uint32Array(1);
 if(root.crypto?.getRandomValues){do{root.crypto.getRandomValues(a);}while(a[0]>=4294960000);return a[0]%10000;}
 return Math.floor(Math.random()*10000); // Local/offline fallback, not a production RNG.
}
const key=type=>'echo:'+type,rate=bp=>bp===1000?'10%':(bp/100).toFixed(bp<100?2:0)+'%';
function item(type){
 const u=root.BondContent.UNITS[type];if(!u||u.role==='Trainer')return null;
 return {id:key(type),type,name:u.name+(u.source==='boss'?' Essence':' Soul Echo'),category:'Echoes',icon:'✧',
 description:'Summon '+u.name+' as an independent companion.'};
}
root.BondEchoes={qualifies,roll,key,rate,item};
})(globalThis);
