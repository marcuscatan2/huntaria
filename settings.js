/* Device preferences only. Never changes a build, combat tick or reward. */
(function(root){
'use strict';
const test=new URLSearchParams(location.search).get('test')==='1';
const KEY='bond-bolt-settings-v1'+(test?'-sandbox':'');
const defaults=Object.freeze({muted:true,master:70,music:35,effects:65,quiet:false,reduced:false,shake:true,flashes:true});
const media=matchMedia('(prefers-reduced-motion: reduce)');
function clean(raw){const out={...defaults};for(const k of Object.keys(out)){const v=raw?.[k];if(typeof out[k]==='boolean'){if(typeof v==='boolean')out[k]=v;}else if(Number.isFinite(v))out[k]=Math.round(Math.max(0,Math.min(100,v)));}return out;}
let state={...defaults},persistent=true;
try{state=clean(JSON.parse(localStorage.getItem(KEY)));}catch(_){persistent=false;}
const snapshot=()=>({...state}),reduced=()=>state.reduced||media.matches;
function apply(){document.documentElement.classList.toggle('reduce-motion',reduced());document.documentElement.classList.toggle('no-flashes',!state.flashes);document.documentElement.classList.toggle('no-shake',!state.shake);document.dispatchEvent(new CustomEvent('bond-settings'));}
function set(changes){state=clean({...state,...changes});try{localStorage.setItem(KEY,JSON.stringify(state));persistent=true;}catch(_){persistent=false;}apply();return persistent;}
const dialog=document.createElement('dialog');dialog.id='settings-dialog';dialog.setAttribute('aria-labelledby','settings-title');
dialog.innerHTML='<div class="settings-heading"><h2 id="settings-title">Settings</h2><button class="button secondary" id="settings-close">Close</button></div><fieldset><legend>Audio</legend><label class="setting-check"><input type="checkbox" data-setting="muted"> Mute all sound</label>'+['master','music','effects'].map(k=>'<label class="setting-range" for="setting-'+k+'"><span>'+k[0].toUpperCase()+k.slice(1)+' <output id="value-'+k+'"></output></span><input id="setting-'+k+'" data-setting="'+k+'" type="range" min="0" max="100" step="1"></label>').join('')+'<p id="audio-status" role="status"></p></fieldset><fieldset><legend>Visuals</legend>'+[['quiet','Quiet effects'],['reduced','Reduce motion'],['shake','Camera shake'],['flashes','Impact flashes']].map(([id,label])=>'<label class="setting-check"><input type="checkbox" data-setting="'+id+'"> '+label+'</label>').join('')+'<p>Device reduced-motion preferences are also respected.</p></fieldset><fieldset><legend>Local progress</legend><button id="settings-export" class="button secondary">Download save backup</button><p>This browser’s progress only. Keep the file private.</p></fieldset><p id="settings-status" role="status"></p>';
document.body.append(dialog);
let returnFocus=null;
function refresh(){for(const input of dialog.querySelectorAll('[data-setting]')){const k=input.dataset.setting;if(input.type==='checkbox')input.checked=state[k];else{input.value=state[k];dialog.querySelector('#value-'+k).textContent=state[k]+'%';}}document.querySelector('#sound').checked=!state.muted;dialog.querySelector('#settings-status').textContent=persistent?'':'Settings apply for this session; browser storage is unavailable.';}
function open(){returnFocus=document.activeElement;refresh();if(!dialog.open)dialog.showModal();dialog.querySelector('#settings-close').focus();}
dialog.querySelector('#settings-close').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
dialog.addEventListener('input',e=>{const k=e.target.dataset.setting;if(!Object.hasOwn(defaults,k))return;set({[k]:e.target.type==='checkbox'?e.target.checked:Number(e.target.value)});refresh();});
dialog.querySelector('#settings-export').onclick=()=>{try{const saved=root.BondProfile.export();download(new Blob([saved],{type:'application/json'}),'bond-and-bolt-local-save.json');dialog.querySelector('#settings-status').textContent='Save backup downloaded.';}catch(_){dialog.querySelector('#settings-status').textContent='Could not export the save. Try again.';}};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
document.querySelector('#open-settings').onclick=open;
document.addEventListener('bond-settings',refresh);media.addEventListener('change',apply);
root.BondSettings={KEY,defaults,snapshot,set,reduced,open,download,clean};apply();refresh();
})(globalThis);
