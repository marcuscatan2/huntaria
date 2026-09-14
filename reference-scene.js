/* Isolated reference build. Explicit test grants; cannot touch normal saves. */
(function(){
'use strict';
if(!BondProfile.TEST)return;
const panel=document.createElement('details');panel.className='qa-panel';panel.innerHTML='<summary>ART REFERENCE · isolated test tools</summary><p>Seed 16. Druid, Brimble and Rattlebit against Mage. Resets this test save only. Owner review is still required.</p><button id="reference-fight" class="button secondary">Play reference encounter</button><button id="reference-echo" class="button secondary">Test guaranteed summon sequence</button>';
document.querySelector('#panel-region').prepend(panel);
const P=BondProfile,G=BondGame;
function setup(){BondApp.cancelRegionBattle();P.reset();for(const type of ['emberfox','stonehorn'])P.summon(type,'druid',P.testing.grantEcho(type,1));BondApp.changeUnit(0,0,'druid');P.companions().forEach((m,i)=>BondApp.changeUnit(0,i+1,m.id));}
panel.querySelector('#reference-fight').onclick=()=>{
 setup();const id='reference:16';BondWorld.NPCS[id]={id,appearance:'mage',name:'Reference Mage',title:'Art reference · seed 16 · no rewards',practice:true,map:'clearing-0',area:'clearing',seed:16,level:1,team:G.defaultBuild()[1]};BondApp.startRegionBattle(id);
};
panel.querySelector('#reference-echo').onclick=()=>{const echo=P.testing.grantEcho('emberfox',1);BondApp.switchTab('loadout');BondMenu.open('inventory');panel.dataset.referenceEcho=echo;};
window.BondReference={setup,play:()=>panel.querySelector('#reference-fight').click(),echo:()=>panel.querySelector('#reference-echo').click()};
if(new URLSearchParams(location.search).has('reference'))panel.open=true;
})();
