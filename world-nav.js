/* Bounded A* over world units. Rendering/camera scale never changes navigation. */
(function(root){
'use strict';const A=BondAtlas,L=BondWorldLayout,CELL=96;
const edgeCaches=new Map();
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),key=(x,y)=>x+','+y;
function clear(id,a,b,radius=20){const n=Math.max(1,Math.ceil(distance(a,b)/32));for(let i=0;i<=n;i++)if(A.collision(id,{x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},radius))return false;return true;}
function find(id,start,target){
 const m=A.get(id);if(!m)return {ok:false,path:[],reason:'Unknown map'};
 const end=A.safePoint(id,target);if(distance(end,target)>250)return {ok:false,path:[],reason:'That point is beyond walkable ground. Choose a nearby path.'};
 if(clear(id,start,end))return {ok:true,path:[end],distance:distance(start,end),visited:0};
 let edges=edgeCaches.get(id);if(!edges){edges=new Map();edgeCaches.set(id,edges);while(edgeCaches.size>4)edgeCaches.delete(edgeCaches.keys().next().value);}
 const cols=Math.ceil(m.width/CELL),rows=Math.ceil(m.height/CELL),heap=[],seen=new Map(),point=(x,y)=>({x:x*CELL+CELL/2,y:y*CELL+CELL/2});
 function push(n){heap.push(n);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p;}heap[i]=n;}
 function pop(){const best=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return best;}
 function nearby(p){const base={x:Math.floor(p.x/CELL),y:Math.floor(p.y/CELL)},candidates=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const x=base.x+dx,y=base.y+dy,q=point(x,y);if(x>=0&&y>=0&&x<cols&&y<rows&&clear(id,p,q))candidates.push({x,y,p:q,d:distance(p,q)});}return candidates.sort((a,b)=>a.d-b.d)[0];}
 const first=nearby(start),last=nearby(end);if(!first||!last)return {ok:false,path:[],reason:'No safe route from this position.'};
 const initial={...first,g:0,f:distance(first.p,end),parent:null};push(initial);seen.set(key(first.x,first.y),initial);
 let visited=0,final=null;
 while(heap.length&&visited<18000){
  const current=pop();if(current.closed)continue;current.closed=true;visited++;
  if(current.x===last.x&&current.y===last.y){final=current;break;}
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;
   const x=current.x+dx,y=current.y+dy;if(x<0||y<0||x>=cols||y>=rows)continue;
   const k=key(x,y),old=seen.get(k);if(old?.closed)continue;const p=point(x,y);
   const aIndex=current.y*cols+current.x,bIndex=y*cols+x,edge=Math.min(aIndex,bIndex)*(cols*rows)+Math.max(aIndex,bIndex);
   let allowed=edges.get(edge);if(allowed===undefined){allowed=clear(id,current.p,p);edges.set(edge,allowed);}if(!allowed)continue;
   const g=current.g+distance(current.p,p);if(old&&old.g<=g)continue;
   const next={x,y,p,g,f:g+distance(p,end),parent:current};seen.set(k,next);push(next);
  }
 }
 if(!final)return {ok:false,path:[],reason:'No safe route found. Try a nearer trail junction.',visited};
 const raw=[end];for(let n=final;n;n=n.parent)raw.push(n.p);raw.reverse();
 const out=[];let from=start;
 for(let i=0;i<raw.length;){let j=Math.min(raw.length-1,i+25);while(j>i&&!clear(id,from,raw[j]))j--;out.push(raw[j]);from=raw[j];i=j+1;}
 return {ok:true,path:out,distance:out.reduce((n,p,i)=>n+distance(i?out[i-1]:start,p),0),visited};
}
root.BondNav={find,clear,CELL,inspect:()=>({cachedMaps:edgeCaches.size,cachedEdges:[...edgeCaches.values()].reduce((n,m)=>n+m.size,0)})};
})(globalThis);
