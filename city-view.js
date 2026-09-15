/* Enterable city rooms, civilian conversations and physical waystone choices. */
(function(root){
'use strict';
const P=BondProfile,A=BondAtlas,dialog=document.createElement('dialog');dialog.id='city-dialog';dialog.setAttribute('aria-labelledby','city-title');document.body.append(dialog);
let returnFocus=null,room=null;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function show(){returnFocus=document.activeElement;if(!dialog.open)dialog.showModal();dialog.querySelector('h2').focus({preventScroll:true});BondCityArt.refresh();}
function header(eyebrow,title){return '<header class="city-dialog-header"><div><p class="eyebrow">'+escape(eyebrow)+'</p><h2 id="city-title" tabindex="-1">'+escape(title)+'</h2></div><button class="button secondary" data-city-leave>Back outside</button></header>';}
function enter(id){
 const s=P.snapshot(),b=BondCities.building(s,id);if(!b)return false;room={map:s.map,id};
 const m=A.get(s.map),t=BondCities.theme(m),i=BondCities.themes.indexOf(t),roles=BondCities.roomRoles[t.id],resident=m.residents[b.room==='shop'?roles.merchant:b.room==='annex'?roles.annex:0];
 dialog.innerHTML=header(m.name,b.name)+'<div class="city-room" data-city-theme="'+t.id+'" style="background-position:'+(i%2?100:0)+'% '+(i>1?100:0)+'%" aria-label="Inside '+escape(b.name)+'"><button class="city-room-person" data-city-person="'+resident.id+'" style="left:53%;top:44%">'+CharacterRig.art(resident.appearance)+'<span>'+escape(resident.name)+'</span></button><div class="city-room-pet" style="left:65%;top:56%">'+CharacterRig.art(resident.pet)+'</div><button class="city-room-object city-room-exhibit" data-city-exhibit="0" style="left:8%;top:28%;width:25%;height:28%" aria-label="'+escape(t.exhibits[0])+'"><span>'+escape(t.exhibits[0])+'</span></button><button class="city-room-object" data-city-exhibit="1" style="left:77%;top:30%;width:20%;height:30%" aria-label="'+escape(t.exhibits[2])+'"><span>'+escape(t.exhibits[2])+'</span></button><div class="city-room-player" style="left:49%;top:79%">'+CharacterRig.art(root.BondApp?.getBuild()[0][0]?.type||'druid')+'</div><button class="city-room-exit" data-city-leave aria-label="Exit to '+escape(m.name)+'">Outside ↓</button></div><div class="city-room-footer"><p class="city-room-message" role="status">'+escape(b.room==='shop'?'Welcome in. Speak to the shopkeeper for supplies.':'Come in. Meet the residents and look around.')+'</p>'+(b.room==='shop'?'<button class="button primary" data-city-supplies>Browse supplies</button>':'')+'</div>';
 if(b.room==='shop')dialog.querySelector('[data-city-person]').dataset.citySupplies='true';
 dialog.querySelectorAll('[data-city-exhibit]').forEach((el,n)=>{const [x,y,w,h]=BondCities.exhibitAreas[t.id][n];Object.assign(el.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});});
 show();return true;
}
function resident(id){const s=P.snapshot(),m=A.get(s.map),r=m?.residents?.find(r=>r.id===id);if(!r||s.encounterSave||Math.hypot(s.position.x-r.x,s.position.y-r.y)>150)return false;room=null;const t=BondCities.theme(m);dialog.innerHTML=header(m.name,r.name)+'<div class="city-conversation"><div>'+CharacterRig.art(r.appearance)+'</div><blockquote>'+escape(r.text)+'</blockquote><div>'+CharacterRig.art(r.pet)+'<small>'+escape(BondContent.UNITS[r.pet].name)+'</small></div></div><p>'+escape(t.title)+'</p>';show();return true;}
function teleport(){
 const s=P.snapshot(),destinations=BondCities.destinations(s);if(!destinations.length)return false;room=null;
 dialog.innerHTML=header(A.get(s.map).name,'City waystone')+'<p>Choose a city. The waystone carries your whole party.</p><div class="city-destinations">'+destinations.map(id=>{const m=A.get(id);return '<button data-city-teleport="'+id+'"><strong>'+m.name+'</strong><span>'+BondCities.theme(m).title+'</span></button>';}).join('')+'</div><p class="city-room-message" role="status"></p>';show();return true;
}
dialog.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-city-leave')){dialog.close();return;}
 if(b.dataset.cityTeleport){if(P.teleport(b.dataset.cityTeleport)){dialog.close();BondApp.switchTab('region');BondRegion.notice('Welcome to '+A.get(P.snapshot().map).name+'. Your party is fully recovered.');}else dialog.querySelector('.city-room-message').textContent=P.error()||'Walk up to the waystone to travel.';return;}
 if(!room||!BondCities.building(P.snapshot(),room.id)){dialog.close();return;}
 if(b.hasAttribute('data-city-supplies')){BondRecovery.open('shop');return;}
 const m=A.get(room.map),t=BondCities.theme(m);
 if(b.dataset.cityExhibit!==undefined)dialog.querySelector('.city-room-message').textContent=t.exhibits[Number(b.dataset.cityExhibit)*2+1];
 if(b.dataset.cityPerson){const r=m.residents.find(r=>r.id===b.dataset.cityPerson);if(r)dialog.querySelector('.city-room-message').textContent=r.name+': “'+r.text+'”';}
});
dialog.addEventListener('close',()=>{room=null;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else document.querySelector('#region-map')?.focus({preventScroll:true});});
root.BondCityView={enter,resident,teleport};
})(globalThis);
