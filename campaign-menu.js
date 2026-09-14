/* Early progression, persistent story and optional recognition. */
(function(){
'use strict';
const P=BondProfile,C=BondCampaign,A=BondAtlas,dialog=document.createElement('dialog'),button=document.createElement('button');
dialog.id='campaign-dialog';dialog.setAttribute('aria-labelledby','campaign-title');button.id='open-campaign';button.className='button secondary';button.textContent='Journey';
document.querySelector('.world-settings').append(button);document.body.append(dialog);
let opener=button;
function earlyCards(s){const e=s.journey.early,l=BondProgress.trainerLevel(s),spec=s.progression?.specialization;return [
 ['A first bond',e.firstSummon&&e.secondSummon,(e.firstSummon?1:0)+(e.secondSummon?1:0),2],
 ['Classes in action',e.demonstrations.length===4,e.demonstrations.length,4],
 ['Willowbrook guardian',e.tidecrown,e.tidecrown?1:0,1],
 ['Choose a class',!!spec,spec?BondContent.UNITS[spec].name:'Player Lv '+l+' / 20',''],
 ['Adapt the party',e.resolution,(e.application?1:0)+(e.counter?1:0)+(e.ability?1:0)+(e.resolution?1:0),4],
 ['Establish the Inner Sea',s.farm.owned,s.farm.owned?1:0,1],
 ['Amber guardian',e.amberBoss,e.amberBoss?1:0,1],
 ['Monster tree proof',e.treeProof,e.treeProof?1:0,1]
 ];}
function render(){const s=P.snapshot(),early=C.earlyNext(s),storyNext=C.chapters.flatMap(c=>c.steps).find(o=>!s.journey?.steps.includes(o.id))||null,chapter=C.chapters.find(c=>c.steps.some(o=>o.id===storyNext?.id)),cards=earlyCards(s);
 dialog.innerHTML='<p class="eyebrow">YOUR JOURNEY</p><h2 id="campaign-title">'+(early?'The Apprentice road':'The early path is complete')+'</h2><p>'+(early?'One useful objective at a time. Roads stay open if you want to explore ahead.':'Your class, party and first monster-tree lesson are established.')+'</p>'+ 
 (s.encounterSave?'<section class="campaign-resume"><h3>Unfinished: '+s.encounterSave.encounter.name+'</h3><button id="campaign-resume" class="button primary">Resume encounter</button><button id="campaign-abandon" class="text-button">Run from encounter</button></section>':'')+
 (early?'<section class="early-next"><small>CURRENT</small><h3>'+early.label+'</h3><p>'+A.get(early.map).name+' · Player Lv '+BondProgress.trainerLevel(s)+'</p><button class="button primary" data-early-map="'+early.map+'">'+(early.id==='ep:farm'?'Open Inner Sea →':'Show the route →')+'</button></section>':'')+
 '<div class="early-progress">'+cards.map(([label,done,value,max])=>'<article class="'+(done?'complete':'')+'"><span>'+(done?'✓':'○')+'</span><div><strong>'+label+'</strong><small>'+value+(max?' / '+max:'')+'</small></div></article>').join('')+'</div>'+ 
 '<details class="later-story"><summary>The Six Beacons · continuing adventure</summary><p>After the opening path, ordinary encounters and regional objectives continue across the open world.</p>'+C.chapters.map((c,i)=>'<details class="campaign-chapter" '+(c===chapter?'open':'')+'><summary>Chapter '+(i+1)+' · '+c.title+(s.journey.chapters.includes(c.id)?' ✓':'')+'</summary><p>'+c.intro+'</p><ol>'+c.steps.map(step=>{const done=s.journey.steps.includes(step.id),current=step===storyNext;return '<li class="'+(done?'complete':current?'current':'')+'"><span>'+(done?'✓ ':current?'→ ':'○ ')+step.label+' <small>'+Math.min(step.count,C.facts(s,step))+'/'+step.count+'</small></span><button class="text-button" data-story-map="'+step.map+'" '+(!A.unlocked(s,step.map)?'disabled':'')+'>Walk to '+A.get(step.map).name+'</button></li>';}).join('')+'</ol><p>Chapter reward: '+c.coins+' coins and '+c.xp+' trainer and companion XP, once. '+(s.journey.chapters.includes(c.id)?c.ending:'')+'</p></details>').join('')+'</details>'+ 
 '<h3>Optional regional recognition</h3><p>No daily expiry. No hidden account stats. No additional rare-drop rolls.</p><div class="challenge-grid">'+C.challenges.map(c=>{const n=C.challengeCount(s,c),done=s.journey.challenges.includes(c.id);return '<article><small>'+A.REGIONS.find(r=>r.id===c.region).name+' · '+c.scope+'</small><h4>'+c.label+'</h4><p>'+Math.min(n,c.count)+' / '+c.count+' · '+c.coins+' coins + decorative ribbon</p><button class="button secondary" data-challenge="'+c.id+'" '+(done||n<c.count?'disabled':'')+'>'+(done?'Claimed':'Claim recognition')+'</button></article>';}).join('')+'</div><p>Online groups and live boss essence are not enabled in this local prototype. Practice altars remain reward-free.</p><button id="campaign-close" class="button primary">Back to the world</button>';
 dialog.querySelector('#campaign-close').onclick=()=>dialog.close();
 dialog.querySelector('[data-early-map]')?.addEventListener('click',e=>{dialog.close();if(early.id==='ep:farm'){BondApp.switchTab('loadout');BondMenu.open('collection');}else BondRegion.travelTo(e.currentTarget.dataset.earlyMap);});
 dialog.querySelectorAll('[data-story-map]').forEach(b=>b.onclick=()=>{dialog.close();BondRegion.travelTo(b.dataset.storyMap);});
 dialog.querySelectorAll('[data-challenge]').forEach(b=>b.onclick=()=>{P.claimChallenge(b.dataset.challenge);render();});
 const resume=dialog.querySelector('#campaign-resume');if(resume)resume.onclick=()=>{const id=P.snapshot().encounterSave?.id;dialog.close();if(id)BondApp.startRegionBattle(id);};
 const abandon=dialog.querySelector('#campaign-abandon');if(abandon)abandon.onclick=()=>{dialog.close();BondApp.runFromBattle();};
}
button.onclick=()=>{opener=document.activeElement;render();dialog.showModal();};dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
const hint=document.createElement('p');hint.className='campaign-next';document.querySelector('#region-objectives').after(hint);
function update(){const s=P.snapshot(),n=C.earlyNext(s);hint.textContent=n?'NEXT → '+n.label+' · '+A.get(n.map).name:'EARLY PATH COMPLETE · Continue into the Six Beacons.';}
document.addEventListener('bond-profile',update);update();
window.BondCampaignMenu={open:()=>button.click(),render};
})();
