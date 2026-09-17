/* Shared deterministic event boundary for companion talents and item rules. */
(function(root){
'use strict';
function each(f,event,...args){root.BondCompanionTalents?.each(f,event,...args);root.BondEquipmentEffects?.each(f,event,...args);}
function change(f,event,amount,...args){amount=root.BondCompanionTalents?.change(f,event,amount,...args)??amount;return root.BondEquipmentEffects?.change(f,event,amount,...args)??amount;}
root.BondCombatHooks={each,change};
})(globalThis);
