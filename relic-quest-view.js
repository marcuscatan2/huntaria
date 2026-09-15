/* Story dialogue presents profile-owned actions and their saved results. */
(function(root){
'use strict';
const P=BondProfile,Q=BondRelicQuest,dialog=document.createElement('dialog');
dialog.id='relic-dialog';dialog.className='relic-dialog';dialog.setAttribute('aria-labelledby','relic-speaker');document.body.append(dialog);
function open(id){
 const s=P.snapshot(),party=BondApp.getBuild()[0],d=Q.dialogue(s,id,party);
 if(!d)return false;
 const npc=BondWorld.NPCS[id];dialog.classList.toggle('ghost-speaker',id===Q.TULLY);let page=0;
 const render=()=>{
  dialog.replaceChildren();
  const portrait=document.createElement('div');portrait.className='relic-portrait';portrait.innerHTML=CharacterRig.art(npc.masterClass||CharacterRig.npcAppearance(npc,id));
  const title=document.createElement('h2');title.id='relic-speaker';title.textContent=npc.name;
  const line=document.createElement('p');line.className='relic-line';line.textContent=d.lines[page];line.setAttribute('aria-live','polite');
  dialog.append(portrait,title,line);
  if(page===d.lines.length-1&&d.list){const list=document.createElement('ul');for(const h of d.list){const item=document.createElement('li');item.textContent=BondContent.UNITS[h.type].name+' — '+h.count+' Echo'+(h.count===1?'':'es')+' · '+BondAtlas.get(h.map).name;list.append(item);}dialog.append(list);}
  if(d.hint){const hint=document.createElement('p');hint.textContent=d.hint;dialog.append(hint);}
  const controls=document.createElement('div');controls.className='relic-actions';
  const close=document.createElement('button');close.className='button secondary';close.textContent='Leave';close.onclick=()=>dialog.close();controls.append(close);
  if(page<d.lines.length-1||d.action){
   const next=document.createElement('button');next.id='relic-next';next.className='button primary';next.textContent=page<d.lines.length-1?'Continue':d.button||'Continue';
   next.onclick=()=>{
    if(page<d.lines.length-1){page++;render();return;}
    if(d.action==='raid'){dialog.close();BondApp.startRegionBattle(Q.raidId(P.snapshot()));return;}
    const result=P.relicAction(id,d.action,BondApp.getBuild()[0]);
    if(!result){line.textContent=P.error()||'Come closer and check your party and Echoes, then try again.';return;}
    if(result.item){dialog.replaceChildren();const heading=document.createElement('h2');heading.textContent='You received '+BondWorld.ITEMS[result.item].name;const text=document.createElement('p');text.textContent='Your weapon is in the Bag. The main quest is complete for now.';const done=document.createElement('button');done.className='button primary';done.id='relic-done';done.textContent='Return to the world';done.onclick=()=>dialog.close();dialog.append(heading,text,done);return;}
    dialog.close();if(d.action==='deliver')open(id);
   };controls.append(next);
  }
  dialog.append(controls);
 };
 render();if(!dialog.open)dialog.showModal();return true;
}
root.BondRelicView={open};
})(globalThis);
