/* Technical coverage, not production-art approval. Missing states are explicit. */
(function(root){
'use strict';
const states=['idle','walk','attack','cast','hit','defeated','victory'];
function manifest(){return Object.keys(BondContent.UNITS).map(type=>({type,states:[...states],mode:BondMonsterSprites.get(type)?'supplied-raster':type==='apprentice'?'painted-16-pose-painted-creator':['druid','mage'].includes(type)?'painted-16-pose':BondContent.UNITS[type].artSpec&&type!=='elderroot'?(BondCreatureArt.svg(type).includes('data-joint')?'vector-joints':'vector-fallback'):'portrait-fallback',approved:false,boss:BondContent.UNITS[type].source==='boss'}));}
root.BondAnimationCoverage={states,manifest};
})(globalThis);
