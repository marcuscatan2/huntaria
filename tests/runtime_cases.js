/* Shared generated corpus for browser/Node comparison. Not shipped to players. */
(function(root){
'use strict';
function fixture(i){
 const C=BondContent,G=BondGame,R=BondProgress,level=[1,5,20,60,100][i%5],types=C.MONSTERS;
 const team=side=>[(i+side)%2?'mage':'druid',types[(i*7+side*3)%100],types[(i*11+side*13+1)%100]].map((type,slot)=>({type,instanceId:slot?'fixture:'+side+':'+slot:undefined,skills:[...C.UNITS[type].skills].slice((i+slot)%3,(i+slot)%3+3)}));
 const build=[team(0),team(1)];if(i%7===0)build[0][2]=null;if(i%11===0)build[0][1]=null;
 const companions=build[0].slice(1).filter(Boolean).map((u,j)=>({id:u.instanceId,type:u.type,ordinal:j+1,xp:R.threshold(level),growth:{},skills:u.skills}));
 const profile={companions,attributes:{str:7,agi:9,vit:8,int:11,dex:6,leadership:5},growth:{},formation:['front','middle','back']};
 const options={profile,seed:103+i*37,enemyLevel:level,elements:true};
 if(i%10===0){const boss=Object.keys(BondCampaign.bosses)[i%6];options.encounter={kind:'boss',enemies:[{type:boss,skills:[...C.UNITS[boss].default],hp:1800,boss:true},...types.slice(0,3).map(type=>({type,skills:[...C.UNITS[type].default],hp:200}))]};
  const party=G.defaultBuild()[0].map((u,j)=>({...u,instanceId:j?'group:'+j:undefined}));
  // Nine allies plus four enemies; separate owned builds and Leadership shares.
  build[0]=party.map(u=>({...u}));profile.companions=party.slice(1).map((u,j)=>({id:u.instanceId,type:u.type,ordinal:1,xp:R.threshold(level),growth:{},skills:u.skills}));
  options.groupParties=[0,1].map(()=>({team:party,profile}));
 }else if(i%3===0)options.encounter={kind:i%2?'wild':'pack',enemies:Array.from({length:i%2?1:5},(_,j)=>{const type=types[(i+j)%100];return {type,skills:[...C.UNITS[type].default]};})};
 return {build,options,escape:i%13===0?35:null};
}
function run(i){const f=fixture(i),b=new BondGame.Battle(f.build,f.options);while(!b.ended){if(b.tick===f.escape)b.requestEscape();b.step();}return {tick:b.tick,winner:b.winner,reason:b.reason,escaped:!!b.escaped,units:b.units,events:b.events};}
function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);}
root.BondRuntimeFixtures={fixture,run,canonical};
})(globalThis);
