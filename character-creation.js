/* Character creation is UI only; the profile command owns identity and starting items. */
(function(root){
'use strict';
const O=BondOpening,dialog=document.createElement('dialog');
dialog.id='character-creation';dialog.setAttribute('aria-labelledby','creation-title');document.body.append(dialog);
let draft={name:'',weapon:'dagger',look:{...O.defaultLook}};
function preview(){
 BondApprenticePreview.render(dialog.querySelector('#creation-avatar'),draft.look,draft.weapon);
 CharacterRig.preload('apprentice',draft.weapon);
 dialog.querySelector('#creation-weapon-label').textContent=O.weapons[draft.weapon].name;
 for(const b of dialog.querySelectorAll('[data-creation-choice]')){const key=b.dataset.creationChoice,expected=key==='weapon'?draft.weapon:draft.look[key];b.setAttribute('aria-pressed',String(String(expected)===b.dataset.value));}
}
function required(){return BondOpening.needsIdentity(BondProfile.snapshot().character);}
function openLegacy(){
 const trainer=BondApp.getBuild()[0][0]||{type:'apprentice',weapon:'dagger'};CharacterRig.preload(trainer.type,trainer.weapon);
 dialog.dataset.mode='identity';
 dialog.innerHTML='<form id="creation-form" class="creation-shell identity-shell"><section class="creation-scene identity-scene"><span class="creation-mark" aria-hidden="true">✧</span><p class="eyebrow">BOND & BOLT</p><h1 id="creation-title">Your journey.<br>Your name.</h1><div class="identity-emblem" aria-hidden="true">✦</div></section><section class="creation-options identity-options"><p class="eyebrow">YOUR CHARACTER</p><h2>Name your trainer</h2><p>Your adventure is ready.</p><label class="creation-name">Name<input id="character-name" name="name" maxlength="20" minlength="2" required autocomplete="off" spellcheck="false" placeholder="Your name" aria-describedby="creation-error"></label><p id="creation-error" role="alert"></p><button id="create-character" type="submit" class="button primary">Enter the world <span aria-hidden="true">→</span></button></section></form>';
 dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const value=dialog.querySelector('#character-name').value;if(!O.validName(value)||O.name(value).toLocaleLowerCase()==='apprentice'){dialog.querySelector('#creation-error').textContent='Use your own name: 2–20 letters or numbers.';dialog.querySelector('#character-name').focus();return;}if(!BondProfile.nameCharacter(value)){dialog.querySelector('#creation-error').textContent=BondProfile.error()||'Your name could not be saved. Your progress was kept.';return;}dialog.close();BondApp.beginOpening();};
 if(!dialog.open)dialog.showModal();dialog.querySelector('#character-name').focus();return true;
}
function open(){
 const character=BondProfile.snapshot().character;if(character&&!BondOpening.needsIdentity(character))return false;if(character)return openLegacy();
 dialog.dataset.mode='creation';
 draft={name:'',weapon:'dagger',look:{...O.defaultLook}};
 const choices=(key,values)=>values.map(value=>'<button type="button" data-creation-choice="'+key+'" data-value="'+value+'" aria-pressed="false">'+value[0].toUpperCase()+value.slice(1)+'</button>').join('');
 const palette=(key,values)=>values.map((color,i)=>'<button type="button" class="color-choice" data-creation-choice="'+key+'" data-value="'+i+'" aria-label="'+(key==='skinColor'?'Skin tone':'Hair color')+' '+(i+1)+'" aria-pressed="false" style="--swatch:'+color+'"></button>').join('');
 dialog.innerHTML='<form id="creation-form" class="creation-shell"><section class="creation-scene"><span class="creation-mark" aria-hidden="true">✧</span><p class="eyebrow">BOND & BOLT</p><h1 id="creation-title">A stranger.<br>A beginning.</h1><div id="creation-avatar"></div><div class="creation-caption"><strong>Apprentice</strong><span id="creation-weapon-label"></span></div></section>'+
 '<section class="creation-options"><p class="eyebrow">YOUR CHARACTER</p><label class="creation-name">Name<input id="character-name" name="name" maxlength="20" minlength="2" required autocomplete="off" spellcheck="false" placeholder="Your name" aria-describedby="creation-error"></label>'+
 '<fieldset><legend>Hair</legend><div class="creation-choices">'+choices('hair',O.hair)+'</div></fieldset><fieldset><legend>Expression</legend><div class="creation-choices">'+choices('face',O.faces)+'</div></fieldset>'+
 '<fieldset><legend>Hair color</legend><div class="creation-palette">'+palette('hairColor',O.hairColors)+'</div></fieldset><fieldset><legend>Skin color</legend><div class="creation-palette">'+palette('skinColor',O.skinColors)+'</div></fieldset>'+
 '<fieldset><legend>What did you bring?</legend><div class="creation-weapons"><button type="button" data-creation-choice="weapon" data-value="dagger" aria-pressed="true"><span aria-hidden="true">†</span><strong>Worn dagger</strong><small>Close & quick · STR</small></button><button type="button" data-creation-choice="weapon" data-value="bow" aria-pressed="false"><span aria-hidden="true">⌁</span><strong>Weathered bow</strong><small>Keep your distance · DEX</small></button></div></fieldset>'+
 '<p id="creation-error" role="alert"></p><button id="create-character" type="submit" class="button primary">Begin your story <span aria-hidden="true">→</span></button><p class="creation-save-note">Saved on this browser.</p></section></form>';
 dialog.querySelectorAll('[data-creation-choice]').forEach(b=>b.onclick=()=>{const key=b.dataset.creationChoice,value=b.dataset.value;if(key==='weapon')draft.weapon=value;else draft.look[key]=key.endsWith('Color')?Number(value):value;preview();});
 dialog.querySelector('form').onsubmit=e=>{
  e.preventDefault();draft.name=dialog.querySelector('#character-name').value;
  if(!O.validName(draft.name)){dialog.querySelector('#creation-error').textContent='Use 2–20 letters or numbers. Spaces, apostrophes and hyphens are welcome.';dialog.querySelector('#character-name').focus();return;}
  if(!BondProfile.createCharacter(draft)){dialog.querySelector('#creation-error').textContent=BondProfile.error()||'This adventure already has progress. Export it before starting over.';return;}
  dialog.close();BondApp.beginOpening();
 };
 preview();if(!dialog.open)dialog.showModal();dialog.querySelector('#character-name').focus();return true;
}
dialog.addEventListener('cancel',e=>{if(required())e.preventDefault();});
root.BondCreation={open,required};
})(globalThis);
