/* Isolated QA shortcuts. Profile commands own every saved mutation. */
(function(){
'use strict';
const P=BondProfile;
const modeURL=new URL(location.href);modeURL.hash='';
if(P.TEST)modeURL.searchParams.delete('test');else modeURL.searchParams.set('test','1');
const mode=document.createElement('fieldset');mode.id='test-mode-settings';
mode.innerHTML='<legend>Test mode'+(P.TEST?' · On':'')+'</legend><p>3× movement speed, automatic healing after fights and a 5× combat speed button.</p><a id="test-mode-switch" class="button '+(P.TEST?'secondary':'primary')+'">'+(P.TEST?'Return to normal mode':'Enable test mode')+'</a><p>Normal and test adventures have separate saves. Switching resumes the selected adventure.</p>';
mode.querySelector('a').href=modeURL.href;
document.querySelector('#settings-dialog .settings-heading').after(mode);
if(!P.TEST||!P.testing)return;
const bar=document.createElement('aside');
bar.className='test-controls';bar.setAttribute('aria-label','Test controls');
bar.innerHTML='<div><strong>TEST MODE</strong><span>3× travel · auto-heal after combat · normal adventure separate</span></div><div class="test-controls-actions"><button id="qa-new-character" class="button secondary">Restart progress</button><button id="qa-heal" class="button primary">Heal party</button><a id="test-mode-exit" class="button secondary">Normal mode</a></div><p id="test-controls-status" role="status" aria-live="polite"></p>';
bar.querySelector('#test-mode-exit').href=modeURL.href;
document.querySelector('.workspace-bar').before(bar);
const restart=bar.querySelector('#qa-new-character'),heal=bar.querySelector('#qa-heal'),status=bar.querySelector('#test-controls-status');
const samples=document.createElement('button');samples.id='qa-equipment';samples.className='button secondary';samples.textContent='Equipment samples';bar.querySelector('.test-controls-actions').append(samples);
samples.onclick=()=>{if(P.testing.equipmentSamples()){status.textContent='Equipment samples added to your test Bag.';BondEquipmentView.open();}else status.textContent=P.error()||'Create a test character first.';};
const fast=document.createElement('button');fast.id='qa-speed-5';fast.dataset.speed='5';fast.setAttribute('aria-pressed','false');fast.textContent='5×';document.querySelector('.speed-control').append(fast);fast.onclick=()=>BondApp.setPlaybackSpeed(5);
function refresh(){const s=P.snapshot();samples.disabled=!s.character;heal.disabled=!s.character||!!s.encounterSave;heal.title=s.encounterSave?'Finish the battle or escape before healing.':'Restore your trainer and all companions, including fallen ones. Free, between encounters.';}
restart.onclick=()=>{
 if(!confirm('Restart this TEST adventure from character creation? This permanently clears its character, monsters, levels, coins, inventory and current encounter. Your normal adventure is untouched.'))return;
 if(!P.testing.restart()){status.textContent=P.error()||'Restart failed. Your test progress was kept.';return;}
 BondApp.switchTab('region');BondCreation.open();status.textContent='Test progress restarted. Create a new character to begin again.';
};
heal.onclick=()=>{status.textContent=P.testing.heal()?'Fully healed: trainer and all companions. No coins or items used.':P.error()||'Finish the battle or escape before healing.';refresh();};
document.addEventListener('bond-profile',refresh);refresh();
})();
