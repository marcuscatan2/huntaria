/* Trainer ledger, route board and encounter reward summaries. */
(function(root){
'use strict';
const P=BondProfile,R=BondProgress,W=BondWorld,$=s=>document.querySelector(s);
const descriptions={str:'Melee physical damage · +1% per point',agi:'Ready-action Speed +0.8%; up to 5% tiny physical dodge',vit:'HP +1%; armor +0.05%; regeneration +0.002% max HP/s',int:'Magic damage and healing · +1% per point',dex:'Ranged physical +1%; cooldown −0.667% per effective point; accuracy offsets dodge · 50% total cooldown cap',leadership:'Share 0.5% of the other five raw attributes per point'};
function trainer(){
 const s=P.snapshot(),l=R.trainerLevel(s),a=R.attributes(s),left=R.statBudget(l)-R.spent(a),build=BondApp.getBuild(),type=build[0][0].type;
 const atCap=l===R.PLAYER_LEVEL_CAP,into=s.trainerXP-R.threshold(l),need=atCap?1:R.threshold(l+1)-R.threshold(l);
 return '<section class="trainer-ledger"><div class="ledger-heading"><div>'+CharacterRig.art(type)+'</div><section><p class="eyebrow">THE SUMMONER</p><h3>Level '+l+' '+BondContent.UNITS[type].name+'</h3><p>Your trainer and every companion earn experience independently. Training one never sets another character’s level.</p><progress max="'+need+'" value="'+(atCap?need:into)+'" aria-label="Trainer level progress"></progress><small>'+(atCap?'Launch cap reached':into+' / '+need+' XP to level '+(l+1))+'</small><p class="level-cap-note"><strong>Launch level cap: 60.</strong> The progression curve is prepared through Lv 100, but player-owned companions and trainers stop at 60 in this release.</p><strong id="attribute-points">'+left+' attribute points available</strong><p>48 starting points. Increasing allocation costs; attributes cap at 99. Free respec while prototyping.</p></section></div><div class="attribute-grid">'+R.ATTRS.map(k=>'<article><div><small>'+k.toUpperCase()+'</small><b>'+a[k]+'</b><p>'+descriptions[k]+'</p></div><button class="button secondary" data-stat="'+k+'" '+(a[k]>=99||left<R.cost(a[k])?'disabled':'')+'>+1 · '+R.cost(a[k])+' pts</button></article>').join('')+'</div><button data-stat-reset class="text-button">Reset attributes · free</button><div class="leadership-preview"><h4>Leadership · '+(a.leadership*.5).toFixed(1)+'% shared</h4><p>Each active companion receives '+R.ATTRS.slice(0,5).map(k=>'+'+(a[k]*a.leadership*.005).toFixed(2)+' '+k.toUpperCase()).join(' · ')+'. No recursive sharing, account mastery or Leadership transfer.</p></div><h4>Companion experience</h4><div class="xp-list">'+s.companions.map(mon=>{const t=mon.type,xp=mon.xp,n=R.monLevel(s,mon.id),atCap=n===R.PLAYER_LEVEL_CAP,into=xp-R.threshold(n),need=atCap?1:R.threshold(n+1)-R.threshold(n);return '<article><span>'+CharacterRig.art(t)+'</span><div><strong>'+P.label(mon)+' · Lv '+n+'</strong><small>'+(atCap?'Launch cap reached':into+' / '+need+' XP to level '+(n+1))+'</small><progress max="'+need+'" value="'+(atCap?need:into)+'" aria-label="'+BondContent.UNITS[t].name+' level progress"></progress></div></article>';}).join('')+'</div><h4>Four elements</h4><p>Water → Fire → Earth → Wind → Water. Advantage ×1.2, disadvantage ×0.8; same and opposite neutral. Damage uses the attacker’s element; heals and shields are neutral. Rarity never increases combat stats.</p><div class="element-table"><table><caption>Damage multiplier · rows attack, columns defend</caption><thead><tr><th scope="col">Element</th>'+R.ELEMENTS.map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr></thead><tbody>'+R.ELEMENTS.map(a=>'<tr><th scope="row">'+a+'</th>'+R.ELEMENTS.map(d=>'<td>×'+R.multiplier(a,d).toFixed(1)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></section>';
}
function result(b,id){
 const r=P.complete(b,id);if(!r)return;
 if(r.pending){const p=document.createElement('p');p.className='reward-summary';p.textContent=r.error+' Rewards are NOT confirmed saved.';const retry=document.createElement('button');retry.className='button primary';retry.textContent='Retry reward save';retry.onclick=()=>BondApp.finish();$('#result').append(p,retry);return;}
 const note=document.createElement('p');note.className='reward-summary';
 const parts=[r.coins+' coins'];if(r.trainerXP)parts.push(r.trainerXP+' trainer XP');if(r.xp)parts.push(r.xp+' companion XP');const echoKey=Object.keys(r.loot).find(k=>k.startsWith('echo:'));
 note.textContent=parts.join(' · ')+(echoKey?' · '+W.ITEMS[echoKey].name:'');
 $('#result').append(note);
 if(r.echo){const btn=document.createElement('button');btn.className='button primary';btn.id='result-summon';btn.textContent='Open Inventory →';btn.onclick=()=>{BondApp.switchTab('loadout');BondMenu.open('inventory');};$('#result').append(btn);}
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.stat){P.allocate(b.dataset.stat);document.querySelector('[data-stat="'+b.dataset.stat+'"]')?.focus({preventScroll:true});}
 if(b.hasAttribute('data-stat-reset')){P.resetAttributes();document.querySelector('[data-stat-reset]')?.focus({preventScroll:true});}
 if(b.hasAttribute('data-feed')){const select=$('#feed-companion');if(select){P.feed(select.value);BondMenu.render();}}
 if(b.hasAttribute('data-boost'))P.prepareBoost();
});
root.BondJourney={trainer,result,boardRender(){},resume(){}};
})(globalThis);
