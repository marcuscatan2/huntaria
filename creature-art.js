/* Original code-native vector portraits, with anatomy authored by species family.
   No borrowed raster assets, remote requests, or recolor-only species. */
(function(root){
'use strict';
const C=root.BondContent,cache=new Map(),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function svg(type){
 const u=C.UNITS[type];if(!u?.artSpec)return '';
 const a=u.artSpec,n=a.index,base=u.color,light=a.accent,dark='#303e4c',shape=a.shape;
 const path=(d,fill=base,stroke=dark,w=5)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
 const ellipse=(x,y,rx,ry,fill=base)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+dark+'" stroke-width="5"/>';
 const eyes=(x=113,y=159,gap=53)=>ellipse(x,y,12,17,'#fff9dc')+ellipse(x+gap,y,12,17,'#fff9dc')+ellipse(x+3,y+2,5,9,dark)+ellipse(x+gap+3,y+2,5,9,dark)+'<circle cx="'+(x+5)+'" cy="'+(y-4)+'" r="3" fill="white"/><circle cx="'+(x+gap+5)+'" cy="'+(y-4)+'" r="3" fill="white"/>';
 const joint=(content,x,y)=>'<g data-joint="'+x+','+y+'">'+content+'</g>';
 let art='',faceX=113,faceY=159,gap=53;
 const quad=['rabbit','hound','fox','cat','boar','badger','marten','yak','tapir','ram','deer','bear','rhino','otter','seal','mole','porcupine'];
 if(quad.includes(shape)){
  const lift=(n%4)*5,tailX=250+(n%3)*10;
  art+=joint(path('M225 214 Q300 '+(116-lift)+' '+tailX+' 242 Q230 258 220 231',light),225,214);
  if(['fox','cat','marten'].includes(shape))art+=path('M230 227 Q313 214 288 131 Q260 161 250 214',light);
  if(shape==='porcupine')for(let i=0;i<9;i++)art+=path('M'+(147+i*13)+' 201 l-9 -'+(48+i%3*15)+' l25 42',light);
  art+=ellipse(180,215,80+(n%3)*5,52);
  if(shape==='mole')art+=path('M93 241 l-20 30 l17 -7 l-4 16 l20 -10 l4 11 l20 -34',light);
  [123,173,225].forEach((x,i)=>{art+=joint(path('M'+x+' 237 L'+(x-6)+' 274 Q'+(x+13)+' 286 '+(x+25)+' 271 L'+(x+20)+' 239',i===1?light:base),x+10,237);});
  if(shape==='rabbit')art+=ellipse(103,86,18,65)+ellipse(153,83,17,66)+path('M100 70 L100 120 M152 65 L150 118', 'none',light,8);
  else if(['deer','ram','yak','rhino'].includes(shape)){
   if(shape==='ram')art+=path('M84 131 C21 87 72 35 103 75 C121 109 67 115 79 80',light)+path('M155 118 C208 51 239 98 204 131',light);
   else art+=path('M90 127 L77 67 L51 54 M78 77 L104 50 M166 120 L178 68 L211 43 M178 78 L156 45','none',light,12);
  }else if(['bear','seal','otter'].includes(shape))art+=ellipse(85,123,25,25)+ellipse(170,122,24,24);
  else art+=path('M75 143 L68 '+(67-lift)+' L118 113',base)+path('M141 112 L188 '+(69+lift)+' L187 154',base);
  art+=ellipse(127,164,59,57)+ellipse(127,193,40,23,light)+path('M121 185 Q128 192 136 185',dark);
  if(shape==='boar')art+=path('M86 194 Q58 166 76 215 Q94 228 103 206',light)+path('M154 201 Q181 160 169 212',light);
  if(shape==='tapir')art+=path('M110 185 Q63 192 83 232 Q109 244 117 224 L130 204',light);
  if(shape==='cat'||shape==='fox')art+=path('M88 181 L46 172 M88 190 L43 198 M161 183 L206 173 M160 193 L202 204','none',light,3);
  if(shape==='badger')art+=path('M105 120 L117 178 L126 152 L137 178 L154 126',light,'none');
  if(shape==='yak'||shape==='bear')art+=path('M79 134 L92 113 L96 136 L111 102 L123 134 L140 106 L148 138 L171 121 L177 148',light);
  if(shape==='hound')art+=path('M81 119 Q34 125 63 188 Q79 195 88 157',light);
  faceX=99;faceY=163;gap=49;
 }else if(shape==='frog'){
  // Two broad folded hind legs, two front arms, webbed feet and raised eye sockets.
  for(const sign of [-1,1])art+=joint(ellipse(160+sign*76,231,43,39)+path('M'+(160+sign*81)+' 250 l'+(sign*35)+' 20 l'+(-sign*24)+' 1 l'+(sign*6)+' 13 l'+(-sign*39)+' -8 l'+(-sign*6)+' -24',light),160+sign*55,217);
  art+=ellipse(160,213,68,60)+ellipse(160,237,49,28,light)+ellipse(160,158,76,46);
  for(const x of [109,211])art+=ellipse(x,133,30,32);
  for(const sign of [-1,1])art+=joint(path('M'+(160+sign*44)+' 204 l'+(sign*9)+' 49 l'+(sign*17)+' 11 l'+(-sign*29)+' 8 l'+(-sign*14)+' -19 l'+(-sign*1)+' -33',base),160+sign*44,204);
  art+=path('M126 179 Q160 194 195 179','none',dark,4)+ellipse(114,207,7,5,light)+ellipse(202,209,9,6,light);
  faceX=109;faceY=132;gap=102;
 }else if(['bird','eagle','owl','heron','moth','bat'].includes(shape)){
  const wide=['eagle','moth','bat'].includes(shape);
  art+=joint(path('M133 185 Q'+(wide?9:39)+' 72 30 187 Q44 247 129 234',light),133,185)+joint(path('M181 181 Q'+(wide?320:286)+' 55 297 187 Q277 247 184 238',light),181,181);
  art+=ellipse(160,214,53,61);
  if(shape==='moth')art+=ellipse(163,145,35,38)+path('M146 115 Q104 57 88 90 M175 114 Q219 51 238 82','none',base,10)+ellipse(74,166,19,25,base)+ellipse(250,163,19,24,base);
  else art+=ellipse(156,146,55,52)+path('M143 179 L174 174 L158 200',light);
  if(shape==='heron')art+=path('M159 176 L254 188 L169 200',light)+path('M142 257 L129 293 M173 254 L187 293','none',dark,6);
  else art+=path('M131 263 L117 285 L148 278 M177 263 L201 283 L168 280',light);
  if(shape==='owl'||shape==='bat')art+=path('M104 131 L108 71 L142 108 M173 109 L211 70 L213 139',base);
  if(shape==='eagle'||shape==='bird')art+=path('M126 99 L132 66 L157 96 L183 61 L184 108',light);
  if(shape==='bat')art+=path('M139 186 L132 206 L149 196 M174 184 L182 203 L166 196',light);
  faceX=135;faceY=149;gap=43;
 }else if(['snake','wyrm','serpent','dragon','lizard','axolotl','centipede','shrimp'].includes(shape)){
  art+=joint(path('M117 203 C230 151 241 261 277 241 C309 222 283 209 274 204 C335 211 302 299 229 266 C184 244 172 264 119 240',base),117,203);
  if(shape==='dragon')art+=path('M157 195 L191 82 L210 145 L271 116 L238 184 L212 239',light);
  if(shape==='centipede'||shape==='shrimp')for(let i=0;i<7;i++)art+=path('M'+(145+i*15)+' '+(226+i%2*12)+' l15 35 l14 -4 M'+(151+i*15)+' '+(211+i%2*12)+' l10 -25 l16 -4','none',light,7);
  else art+=path('M137 229 L121 266 L152 274 M204 237 L216 269 L238 267',base);
  if(shape==='dragon')art+=path('M85 127 L72 61 L120 103 M154 117 L184 70 L181 152',light);
  if(shape==='axolotl')for(const [x,sgn] of [[90,-1],[181,1]])for(let j=0;j<3;j++)art+=path('M'+x+' 153 l'+(sgn*40)+' '+(-45+j*40),'none',light,11);
  art+=ellipse(128,173,68,48)+ellipse(115,207,41,20,light);
  if(shape==='snake'||shape==='serpent')art+=path('M89 130 L116 83 L150 129',light);
  if(shape==='lizard')art+=path('M110 128 L91 92 L139 106 L165 87 L173 151',light);
  faceX=96;faceY=174;gap=52;
 }else if(['ant','cicada','firefly','grasshopper'].includes(shape)){
  for(let i=0;i<3;i++)for(const sign of [-1,1])art+=joint(path('M'+(160+sign*33)+' '+(173+i*24)+' l'+(sign*(39+i*4))+' '+(-23+i*6)+' l'+(sign*19)+' '+(44-i*2),'none',base,9),160+sign*33,173+i*24);
  if(shape==='cicada'||shape==='firefly')for(const sign of [-1,1])art+=joint(path('M160 156 Q'+(160+sign*117)+' 78 '+(160+sign*111)+' 231 Q'+(160+sign*70)+' 280 160 215',shape==='cicada'?'#daececc9':light),160,156);
  if(shape==='grasshopper')for(const sign of [-1,1])art+=joint(path('M'+(160+sign*30)+' 228 l'+(sign*56)+' -81 l'+(sign*27)+' 134 l'+(-sign*31)+' -4','none',light,12),160+sign*30,228);
  art+=ellipse(160,239,shape==='ant'?48:40,48,shape==='firefly'?light:base)+ellipse(160,185,33,38)+ellipse(160,131,45,37);
  art+=path('M140 102 Q121 55 94 65 M180 102 Q200 53 229 61','none',base,7);
  if(shape==='ant')art+=path('M136 151 L123 180 L148 166 M183 151 L197 180 L173 166',light);
  if(shape==='cicada')for(let i=0;i<3;i++)art+=path('M139 '+(178+i*12)+' L181 '+(178+i*12),'none',light,4);
  faceX=141;faceY=128;gap=38;
 }else if(['beetle','crab','spider','mantis','wasp','urchin','turtle'].includes(shape)){
  if(shape==='urchin')for(let i=0;i<13;i++){const t=i*Math.PI*2/13,x=160+Math.cos(t)*74,y=195+Math.sin(t)*66;art+=path('M'+x+' '+y+' L'+(160+Math.cos(t)*(105+n%4*7))+' '+(195+Math.sin(t)*108)+' L'+(x+12)+' '+(y+9),light);}
  else for(let i=0;i<(shape==='spider'?4:shape==='turtle'?2:3);i++){const y=171+i*28;art+=joint(path('M102 '+y+' L'+(55-i*7)+' '+(y-16)+' L'+(32+i*6)+' '+(y+24)+' M216 '+y+' L'+(267+i*6)+' '+(y-16)+' L'+(290-i*6)+' '+(y+24),'none',base,12),160,y);}
  art+=ellipse(160,204,75,68,shape==='turtle'?light:base)+path('M163 145 L163 257 M108 174 L155 186 L211 174 M103 220 L157 204 L218 224','none',light,5);
  if(shape==='crab'||shape==='mantis')art+=path('M97 184 Q32 126 59 86 L80 113 L89 80 Q117 116 107 149',light)+path('M221 183 Q286 128 267 85 L246 112 L234 83 Q210 118 221 148',light);
  if(shape==='wasp')art+=ellipse(104,127,31,63,'#daecec')+ellipse(216,127,31,63,'#daecec')+path('M150 257 L169 300 L183 257',light);
  if(shape==='turtle')art+=ellipse(157,146,42,39,base);
  if(type==='sootimp')art+=path('M146 202 Q123 242 162 262 L170 253 Q146 238 166 210',light);
  if(shape==='beetle')art+=path('M130 146 L120 91 L100 82 M190 146 L206 97 L226 79','none',light,8);
  faceX=135;faceY=187;gap=49;
 }else if(['fish','manta','jelly','seal'].includes(shape)){
  if(shape==='manta')art+=path('M144 145 Q65 86 20 221 Q86 193 144 249 Q163 287 185 245 Q240 192 303 221 Q266 92 178 144 Z',base)+path('M166 229 Q125 307 212 301','none',light,10);
  else if(shape==='fish')art+=path('M105 158 L66 93 L151 139 M220 171 L304 115 L276 209 L306 260 L222 225',light)+ellipse(158,204,83,62)+path('M136 232 L128 275 L191 242',light);
  else{
   for(let i=0;i<5;i++)art+=joint(path('M'+(104+i*27)+' 215 q-30 44 5 66','none',light,11),104+i*27,215);
   art+=path('M68 208 Q75 99 159 100 Q241 103 252 208 Q211 253 163 225 Q121 251 68 208',base);
  }
  faceX=125;faceY=188;gap=52;
 }else if(['mushroom','flower','sprout','treant','golem','bell','wisp','snail','slug','imp'].includes(shape)){
  if(shape==='mushroom'){
   art+=path('M123 190 L106 276 Q160 299 214 273 L196 188',light)+joint(path('M41 179 Q83 72 159 81 Q234 84 285 179 Q194 235 41 179',base),160,195);
   art+=ellipse(109,135,19,13,light)+ellipse(203,143,25,16,light);faceX=141;faceY=244;gap=30;
  }else if(shape==='flower'||shape==='sprout'){
   for(let i=0;i<7;i++){const t=i*Math.PI*2/7;art+=joint(ellipse(160+Math.cos(t)*59,167+Math.sin(t)*58,34,43,light),160,167);}
   art+=path('M150 218 L143 280 L174 280 L171 220',base)+path('M150 261 Q64 197 101 274 L149 280 M175 262 Q243 210 226 278 L176 280',base)+ellipse(160,167,50,48,base);faceX=138;faceY=165;gap=43;
  }else if(shape==='snail'||shape==='slug'){
   if(shape==='snail')art+=ellipse(191,177,74,75,light)+path('M205 215 C117 203 163 98 211 139 C249 188 174 205 182 158','none',base,11);
   art+=path('M78 183 Q66 114 110 153 L124 222 Q190 250 270 264 Q211 299 70 273 Q37 252 78 183',base)+path('M82 173 L64 107 M109 168 L128 105','none',base,12);faceX=73;faceY=199;gap=31;
  }else if(shape==='golem'||shape==='treant'){
   art+=joint(path('M115 164 L84 198 L79 252 L110 250 M205 166 L239 201 L248 251 L216 248',base),160,165)+path('M103 171 L217 163 L231 257 L200 283 L173 267 L138 282 L105 263 Z',base)+path('M102 166 L90 100 L154 72 L211 111 L218 168 Z',light);
   if(shape==='treant')art+=path('M111 105 L80 69 L83 31 M83 58 L51 52 M190 115 L230 69 L225 35 M228 65 L265 44','none',base,14);
   faceX=132;faceY=141;gap=48;
  }else if(shape==='bell')art+=path('M104 233 L75 249 L243 249 L216 229 L205 135 Q158 71 111 135 Z',base)+ellipse(157,267,20,20,light)+path('M146 109 Q126 60 164 63 Q190 64 173 110','none',light,8);
  else if(shape==='imp')art+=path('M133 221 L103 276 L138 270 L156 246 L187 273 L221 275 L191 219 M113 201 L63 225 L72 196 M200 196 L254 216 L244 185',base)+ellipse(158,195,57,59)+path('M110 158 L103 68 L144 137 M171 139 L218 67 L209 163',light);
  else art+=path('M109 112 Q153 62 209 117 Q267 187 184 257 L149 291 L122 251 Q57 188 109 112',base)+ellipse(160,188,50,51,light);
 }else{art+=ellipse(160,200,75,64)+ellipse(151,149,55,49,light);}
 art+=eyes(faceX,faceY,gap);
 // Each authored species also has an anatomical crest, shoulder plates or fins.
 const crest=75+(n%7)*19;
 art+=path('M'+crest+' 229 l'+(-10-n%8)+' '+(-23-n%9)+' l25 8 l9 19 Z',light);
 if(a.crest===1)art+=path('M154 116 L148 70 L172 110',light);
 if(a.crest===2)art+=ellipse(191,212,12+(n%4)*3,7,light);
 if(a.crest===3)art+=path('M185 212 L215 185 L227 223',light);
 if(a.crest===4)art+=path('M117 237 Q159 210 201 242','none',light,8);
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><title>'+esc(u.name)+'</title><defs><filter id="shadow"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#172e30" flood-opacity=".22"/></filter></defs><ellipse cx="162" cy="288" rx="90" ry="13" fill="#253933" opacity=".16"/><g filter="url(#shadow)">'+art+'</g></svg>';
}
function url(type){if(!cache.has(type))cache.set(type,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(type)));return cache.get(type);}
root.BondCreatureArt={svg,url,clear:()=>cache.clear()};
})(globalThis);
