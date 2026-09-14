/* Local decorative layout rules. No currency, stats, paid grants or randomness. */
(function(root){
'use strict';
const decorations=Object.freeze({
 cairn:{name:'Trail cairn',source:'Win your first wild hunt',earned:s=>s.tutorial?.kills>=1},
 lantern:{name:'Echo lantern',source:'Summon your first companion',earned:s=>s.tutorial?.summons>=1},
 bloom:{name:'Traveler’s bloom',source:'Discover three landmarks',earned:s=>(s.sights?.length||0)>=3}
});
const styles=Object.freeze({dawn:{name:'Dawn',sky:'#cbecda',water:'#66a8a3',deep:'#345e6c'},dusk:{name:'Dusk',sky:'#424d79',water:'#647a9c',deep:'#283c5b'}});
const fresh=()=>({version:1,style:'dawn',slots:[null,null,null],companions:[null,null]});
function available(s){return Object.keys(decorations).filter(k=>decorations[k].earned(s));}
function clean(raw,s){const out=fresh(),owned=available(s),seen=new Set();if(Object.hasOwn(styles,raw?.style||''))out.style=raw.style;out.slots=out.slots.map((_,i)=>owned.includes(raw?.slots?.[i])?raw.slots[i]:null);out.companions=out.companions.map((_,i)=>{const id=raw?.companions?.[i];if(!s.companions.some(m=>m.id===id)||seen.has(id))return null;seen.add(id);return id;});return out;}
function valid(raw,s){return !!raw&&raw.version===1&&Object.hasOwn(styles,raw.style)&&Array.isArray(raw.slots)&&raw.slots.length===3&&Array.isArray(raw.companions)&&raw.companions.length===2&&JSON.stringify(clean(raw,s))===JSON.stringify({version:raw.version,style:raw.style,slots:raw.slots,companions:raw.companions});}
root.BondHaven={decorations,styles,fresh,clean,valid,available};
})(globalThis);
