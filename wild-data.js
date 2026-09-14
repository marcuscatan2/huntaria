/* Grass habitats remain discoverable; contracts resolve after victory. */
(function(root){
  'use strict';
  const HABITATS=[
    {area:'clearing',name:'Mosswhisper grass',types:['emberfox','bloomslime']},
    {area:'brook',name:'River reedbed',types:['tideotter','ironback']},
    {area:'hollow',name:'Amber undergrowth',types:['frostfang','thornstag']},
    {area:'ruins',name:'Moonlit grass',types:['lumimoth','stonehorn']},
    {area:'rise',name:'Skyfire grass',types:['stormowl','cindrake']}
  ];
  function encounter(id){
    const parts=typeof id==='string'?id.split(':'):[];
    if(parts.length!==3||parts[0]!=='ritual')return null;
    const [,area,type]=parts,h=HABITATS.find(h=>h.area===area);
    if(!h?.types.includes(type))return null;
    const u=BondContent.UNITS[type];
    return {id,area,type,kind:'wild',catchable:true,level:1,rarity:'Habitat',name:'Wild '+u.name,title:'An unbound spirit',appearance:type,
      enemies:[{type,hp:Math.round(u.hp*.9),power:Math.round(u.power*.75),skills:[...u.default],wild:true}]};
  }
  root.BondWild={HABITATS,encounter,home:type=>HABITATS.find(h=>h.types.includes(type))};
})(globalThis);
