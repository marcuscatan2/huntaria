/* Isolated QA shortcuts. Profile commands own every saved mutation. */
(function(){
'use strict';
const P=BondProfile;
if(!P.TEST||!P.testing)return;
const bar=document.createElement('aside');
bar.className='test-controls';bar.setAttribute('aria-label','Test controls');
bar.innerHTML='<div><strong>TEST MODE</strong><span>3× travel · auto-heal after combat · normal adventure separate</span></div><div class="test-controls-actions"><button id="qa-new-character" class="button secondary">Restart progress</button><button id="qa-heal" class="button primary">Heal party</button></div><p id="test-controls-status" role="status" aria-live="polite"></p>';
document.querySelector('.workspace-bar').before(bar);
const restart=bar.querySelector('#qa-new-character'),heal=bar.querySelector('#qa-heal'),status=bar.querySelector('#test-controls-status');
const fast=document.createElement('button');fast.id='qa-speed-5';fast.dataset.speed='5';fast.setAttribute('aria-pressed','false');fast.textContent='5×';document.querySelector('.speed-control').append(fast);fast.onclick=()=>BondApp.setPlaybackSpeed(5);
function refresh(){const s=P.snapshot();heal.disabled=!s.character||!!s.encounterSave;heal.title=s.encounterSave?'Finish the battle or escape before healing.':'Restore your trainer and all companions, including fallen ones. Free, between encounters.';}
restart.onclick=()=>{
 if(!confirm('Restart this TEST adventure from character creation? This permanently clears its character, monsters, levels, coins, inventory and current encounter. Your normal adventure is untouched.'))return;
 if(!P.testing.restart()){status.textContent=P.error()||'Restart failed. Your test progress was kept.';return;}
 BondApp.switchTab('region');BondCreation.open();status.textContent='Test progress restarted. Create a new character to begin again.';
};
heal.onclick=()=>{status.textContent=P.testing.heal()?'Fully healed: trainer and all companions. No coins or items used.':P.error()||'Finish the battle or escape before healing.';refresh();};
document.addEventListener('bond-profile',refresh);refresh();
})();
