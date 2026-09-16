/* Live dummy results. Reads combat events; never awards or heals saved actors. */
(function(root){
'use strict';
const number=n=>n.toFixed(1),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(b){
 const host=document.querySelector('#training-results');host.hidden=!b?.training;if(!b?.training)return;
 const r=BondTraining.report(b);
 host.innerHTML='<h3>'+(b.ended?'Test complete':'Dummy test')+' <small>'+r.seconds.toFixed(1)+' / 30s</small></h3><div class="training-table"><table><thead><tr><th>Party member</th><th>DPS</th><th>Healing/s</th><th>Shield/s</th></tr></thead><tbody>'+[r.total,...r.rows].map(u=>'<tr data-training-unit="'+u.id+'"><th scope="row">'+escape(u.name)+'</th><td>'+number(u.dps)+'</td><td>'+number(u.hps)+'</td><td>'+number(u.sps)+'</td></tr>').join('')+'</tbody></table></div><p>Healing: HP restored · Shield: protection added</p>';
}
root.BondTrainingView={render};
})(globalThis);
