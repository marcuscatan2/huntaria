/* Recoverable startup failure. Does not clear storage or mutate progression. */
(function(root){
'use strict';
const panel=document.querySelector('#boot-status'),message=panel.querySelector('p');
let done=false;
const timer=setTimeout(()=>{if(!done)message.textContent='The game could not finish loading. Check your connection and reload.';},8000);
root.BondBoot={ready(){done=true;clearTimeout(timer);panel.hidden=true;},inspect:()=>({ready:done})};
})(globalThis);
