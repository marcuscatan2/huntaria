/* Original procedural audio. Owns playback only, never combat timing. */
(function(root){
'use strict';
const S=BondSettings;
const cues=Object.freeze({
 ui:[660,.06,'sine'],open:[440,.1,'sine'],close:[330,.09,'sine'],error:[145,.16,'triangle'],
 melee:[155,.12,'triangle'],ranged:[510,.1,'triangle'],fire:[230,.15,'sawtooth'],water:[860,.17,'sine'],
 earth:[105,.19,'triangle'],wind:[650,.13,'triangle'],arcane:[350,.17,'sine'],lightning:[470,.11,'sawtooth'],
 heal:[740,.23,'sine'],shield:[280,.2,'sine'],guard:[180,.15,'triangle'],dodge:[920,.09,'sine'],
 warning:[196,.3,'triangle'],phase:[130,.3,'triangle'],win:[523,.4,'sine'],loss:[174,.45,'sine'],
 escape:[392,.25,'sine'],coin:[1046,.1,'sine'],echo:[880,.4,'sine'],summon:[659,.6,'sine'],level:[784,.4,'sine']
});
const loops={explore:'assets/audio/explore.wav',combat:'assets/audio/combat.wav',innersea:'assets/audio/innersea.wav'};
let ctx=null,master=null,music=null,fx=null,current=null,desired='explore',paused=false,count=0,lastCue=-Infinity,error='',generation=0;
const cache=new Map(),loading=new Map(),voices=new Set(),beds=new Set();
const volume=()=>{if(!ctx)return;const s=S.snapshot(),t=ctx.currentTime;master.gain.setTargetAtTime(s.muted?0:s.master/100,t,.025);music.gain.setTargetAtTime(s.music/100,t,.025);fx.gain.setTargetAtTime(s.effects/100,t,.025);};
function report(){const node=document.querySelector('#audio-status');if(node)node.textContent=error;}
async function unlock(){if(S.snapshot().muted)return false;try{if(!ctx){ctx=new (root.AudioContext||root.webkitAudioContext)();master=ctx.createGain();music=ctx.createGain();fx=ctx.createGain();music.connect(master);fx.connect(master);master.connect(ctx.destination);volume();}if(!document.hidden&&!paused)await ctx.resume();error='';report();reconcile();return true;}catch(_){error='Audio unavailable. Try enabling sound again.';report();return false;}}
function dispose(node){voices.delete(node);beds.delete(node);try{node.source.disconnect();node.gain.disconnect();}catch(_){}if(current===node)current=null;}
function stop(node,fade=0){if(!node||node.stopping)return;node.stopping=true;const now=ctx.currentTime;try{node.gain.gain.cancelScheduledValues(now);node.gain.gain.setValueAtTime(node.gain.gain.value,now);node.gain.gain.linearRampToValueAtTime(0,now+fade);node.source.stop(now+fade+.01);}catch(_){dispose(node);}}
function silence(){generation++;for(const n of [...voices,...beds]){stop(n);dispose(n);}current=null;}
async function buffer(scene){if(cache.has(scene))return cache.get(scene);if(loading.has(scene))return loading.get(scene);const task=(async()=>{const response=await fetch(loops[scene]);if(!response.ok)throw Error('missing loop');const audio=await ctx.decodeAudioData(await response.arrayBuffer());cache.set(scene,audio);return audio;})();loading.set(scene,task);try{return await task;}finally{loading.delete(scene);}}
async function reconcile(){if(!ctx)return;volume();if(S.snapshot().muted||document.hidden||paused){silence();await ctx.suspend().catch(()=>{});return;}if(ctx.state!=='running')return;if(current?.scene===desired&&!current.stopping)return;const version=++generation,scene=desired;try{const data=await buffer(scene);if(version!==generation||document.hidden||paused||S.snapshot().muted)return;const source=ctx.createBufferSource(),gain=ctx.createGain(),node={source,gain,scene,stopping:false};source.buffer=data;source.loop=true;source.connect(gain);gain.connect(music);gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(.5,ctx.currentTime+.7);source.onended=()=>dispose(node);for(const old of beds)stop(old,.7);beds.add(node);current=node;source.start();error='';report();}catch(_){if(version===generation){error='Music could not load. Sound effects remain available.';report();}}}
function scene(name,isPaused=false){desired=Object.hasOwn(loops,name)?name:'explore';paused=!!isPaused;if(ctx&&!paused&&!document.hidden&&!S.snapshot().muted)ctx.resume().then(reconcile).catch(()=>{});else reconcile();}
function play(id){if(!Object.hasOwn(cues,id)||!ctx||ctx.state!=='running'||S.snapshot().muted||paused||document.hidden||!S.snapshot().effects)return false;const now=ctx.currentTime;if(now-lastCue<.04||voices.size>=8)return false;lastCue=now;count++;const [hz,duration,type]=cues[id],source=ctx.createOscillator(),gain=ctx.createGain(),node={source,gain,stopping:false};source.type=type;source.frequency.setValueAtTime(hz,now);source.frequency.exponentialRampToValueAtTime(hz*(['heal','win','echo','summon','level'].includes(id)?1.5:.5),now+duration);gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(type==='sawtooth'?.025:.055,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);source.connect(gain);gain.connect(fx);source.onended=()=>dispose(node);voices.add(node);source.start();source.stop(now+duration+.02);return true;}
function impact(cue){return cue&&play(cue.healing?'heal':({stone:'earth',frost:'water',nature:'heal',guard:'guard'}[cue.theme]||cue.theme||'melee'));}
document.querySelector('#sound').onchange=e=>{S.set({muted:!e.target.checked});if(e.target.checked)unlock();};
document.addEventListener('bond-settings',()=>{volume();if(!S.snapshot().muted)unlock();else reconcile();});
document.addEventListener('pointerdown',e=>{if(e.isTrusted)unlock();},{capture:true});
document.addEventListener('keydown',e=>{if(e.isTrusted)unlock();},{capture:true});
document.addEventListener('click',e=>{if(e.target.closest('[data-setting],#sound'))unlock();else if(e.target.closest('button'))play('ui');});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!paused&&!S.snapshot().muted&&ctx)ctx.resume().then(reconcile).catch(()=>{});else reconcile();});
root.addEventListener('pagehide',silence);
root.BondAudio={unlock,scene,play,impact,cues,loops,inspect:()=>({state:ctx?.state||'uninitialized',count,voices:voices.size,loops:beds.size,scene:current?.scene||null,desired,error})};
})(globalThis);
