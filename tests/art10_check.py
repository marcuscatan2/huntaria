"""Read-only PNG audit: alpha, provenance and actual frame bounds. Never edits images."""
from collections import deque
import hashlib
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]

def components(im):
    w,h=im.size
    pixels=im.getchannel('A').tobytes()
    seen=bytearray(w*h)
    found=[]
    for start,alpha in enumerate(pixels):
        if alpha<32 or seen[start]:continue
        seen[start]=1;queue=deque([start]);count=0
        left=right=start%w;top=bottom=start//w
        while queue:
            n=queue.popleft();x=n%w;y=n//w;count+=1
            left=min(left,x);right=max(right,x);top=min(top,y);bottom=max(bottom,y)
            for near in (n-1 if x else -1,n+1 if x<w-1 else -1,n-w if y else -1,n+w if y<h-1 else -1):
                if near>=0 and not seen[near] and pixels[near]>=32:
                    seen[near]=1;queue.append(near)
        if count>2000:found.append(dict(bounds=[left,top,right+1,bottom+1],pixels=count))
    # Row assignment by bottom edge is robust to staff tips extending above a row.
    found.sort(key=lambda c:(round((c['bounds'][3]/h-.23)/.25),c['bounds'][0]))
    return found

def run():
    report={}
    manifest=json.loads((ROOT/'assets/art-v10/prompts.json').read_text(encoding='utf-8'))
    for p in (ROOT/'assets/art-v10').glob('*.png'):
        im=Image.open(p)
        info=dict(mode=im.mode,size=im.size,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest())
        record=next(m for m in manifest if Path(m['bundledPath']).name==p.name)
        source=Path(record['sourcePath'])
        info['originalVerified']=source.exists() and hashlib.sha256(source.read_bytes()).hexdigest()==info['sha256']
        if source.exists():assert info['originalVerified'],f'{p.name}: bundled image differs from original'
        if p.name!='inner-haven.png':
            assert im.mode=='RGBA', f'{p.name}: missing real alpha'
            assert im.getchannel('A').getextrema()==(0,255)
        if 'sheet' in p.name:
            info['frames']=components(im)
            assert len(info['frames'])==16,f"{p.name}: {len(info['frames'])} connected character poses"
        report[p.name]=info
    print(json.dumps(report,indent=2))
    (ROOT/'tests/artifacts/art-v10-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')

if __name__=='__main__':run()
