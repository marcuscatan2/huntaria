/* Early progression, persistent story and optional recognition. */
(function(){
'use strict';
const P=BondProfile,C=BondCampaign,A=BondAtlas,dialog=document.createElement('dialog'),button=document.createElement('button');
dialog.id='campaign-dialog';dialog.setAttribute('aria-labelledby','campaign-title');button.id='open-campaign';button.className='button secondary';button.textContent='Journey';
document.querySelector('.world-settings').append(button);document.body.append(dialog);
let opener=button;
function earlyCards(s){const e=s.journey.early,l=BondProgress.trainerLevel(s),spec=s.progression?.specialization,echoesDelivered=['briefing','ghost','report','complete'].includes(BondRelicQuest.state(s).stage);return [
 ['A first bond',e.firstSummon&&e.secondSummon,(e.firstSummon?1:0)+(e.secondSummon?1:0),2],
 ['Classes in action',e.demonstrations.length===4,e.demonstrations.length,4],
 ['Willowbrook guardian',e.tidecrown,e.tidecrown?1:0,1],
 ['Choose a class',!!spec,spec?BondContent.UNITS[spec].name:'Player Lv '+l+' / 20',''],
 ['Defend the courtyard',!['raid'].includes(BondRelicQuest.state(s).stage),BondRelicQuest.state(s).stage==='raid'?0:1,1],
 ['Gather the raid Echoes',echoesDelivered,echoesDelivered?5:BondRelicQuest.HUNTS.reduce((n,h)=>n+Math.min(h.count,(s.echoes[h.type]||[]).length),0),5],
 ['Speak to Tully',['report','complete'].includes(BondRelicQuest.state(s).stage),['report','complete'].includes(BondRelicQuest.state(s).stage)?1:0,1],
 ['The class weapon',BondRelicQuest.state(s).stage==='complete',BondRelicQuest.state(s).stage==='complete'?1:0,1]

 ];}
function specTitle(s){return BondRelicQuest.state(s).stage==='complete'?'The sacred treasures - complete':s.progression?.specialization?'The sacred treasures':'The Apprentice road';}
function render(){const s=P.snapshot(),early=C.earlyNext(s),storyNext=C.chapters.flatMap(c=>c.steps).find(o=>!s.journey?.steps.includes(o.id))||null,chapter=C.chapters.find(c=>c.steps.some(o=>o.id===storyNext?.id)),cards=earlyCards(s);
 dialog.innerHTML='<p class="eyebrow">YOUR JOURNEY</p><h2 id="campaign-title">'+(specTitle(s))+'</h2><p>'+(early?.complete?'Your class weapon is in the Bag. The main quest ends here for now.':'One useful objective at a time. Roads stay open if you want to explore ahead.')+'</p>'+
 (s.encounterSave?'<section class="campaign-resume"><h3>Unfinished: '+s.encounterSave.encounter.name+'</h3><button id="campaign-resume" class="button primary">Resume encounter</button><button id="campaign-abandon" class="text-button" '+(BondRaidRules.applies(s.encounterSave?.encounter)?'disabled':'')+'>Run from encounter</button></section>':'')+
 (early&&!early.complete?'<section class="early-next"><small>CURRENT</small><h3>'+early.label+'</h3><p>'+A.get(early.map).name+' · Player Lv '+BondProgress.trainerLevel(s)+'</p><button class="button primary" data-early-map="'+early.map+'">'+(early.id==='ep:farm'?'Open Inner Sea →':'Show the route →')+'</button></section>':'')+
 '<div class="early-progress">'+cards.map(([label,done,value,max])=>'<article class="'+(done?'complete':'')+'"><span>'+(done?'✓':'○')+'</span><div><strong>'+label+'</strong><small>'+value+(max?' / '+max:'')+'</small></div></article>').join('')+'</div>'+
 '<details class="later-story"><summary>Optional regional stories - The Six Beacons</summary><p>Explore the regional stories and training challenges at your own pace.</p>'+C.chapters.map((c,i)=>'<details class="campaign-chapter" '+(c===chapter?'open':'')+'><summary>Chapter '+(i+1)+' · '+c.title+(s.journey.chapters.includes(c.id)?' ✓':'')+'</summary><p>'+c.intro+'</p><ol>'+c.steps.map(step=>{const done=s.journey.steps.includes(step.id),current=step===storyNext;return '<li class="'+(done?'complete':current?'current':'')+'"><span>'+(done?'✓ ':current?'→ ':'○ ')+step.label+' <small>'+Math.min(step.count,C.facts(s,step))+'/'+step.count+'</small></span><button class="text-button" data-story-map="'+step.map+'" '+(!A.unlocked(s,step.map)?'disabled':'')+'>Walk to '+A.get(step.map).name+'</button></li>';}).join('')+'</ol><p>Chapter reward: '+c.coins+' coins and '+c.xp+' trainer and companion XP, once. '+(s.journey.chapters.includes(c.id)?c.ending:'')+'</p></details>').join('')+'</details>'+
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
