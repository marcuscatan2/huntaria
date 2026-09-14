"""Read-only generated-asset verification. Does not transform any image."""
import hashlib
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'assets/art-v9/prompts.json').read_text(encoding='utf8'))
results=[]
for item in manifest:
    path=root/item['bundledPath'];payload=path.read_bytes()
    with Image.open(path) as im:
        alpha=list(im.getchannel('A').getextrema()) if 'A' in im.getbands() else None
        assert alpha==[0,255] and im.width>=1024 and im.height>=1024
        result=dict(key=item['key'],size=list(im.size),mode=im.mode,alpha=alpha,bytes=len(payload),sha256=hashlib.sha256(payload).hexdigest())
    source=Path(item['sourcePath'])
    result['sourceUnchanged']=hashlib.sha256(source.read_bytes()).hexdigest()==result['sha256'] if source.exists() else None
    assert result['sourceUnchanged'] is not False
    results.append(result)
report=dict(count=len(results),assets=results,totalBytes=sum(i['bytes'] for i in results))
(root/'tests/artifacts/art-v9-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report),flush=True)
