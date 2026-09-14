"""Read-only asset integrity / alpha inspection; never transforms image files."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'assets/art-v8/prompts.json').read_text(encoding='utf8'))
results=[]
for asset in manifest['assets']:
    path=root/asset['bundledPath']
    payload=path.read_bytes()
    with Image.open(path) as im:
        alpha=list(im.getchannel('A').getextrema()) if 'A' in im.getbands() else None
        result={'key':asset['key'],'size':list(im.size),'mode':im.mode,'alpha':alpha,'bytes':len(payload),'sha256':hashlib.sha256(payload).hexdigest()}
        assert im.width>=1024 and im.height>=1024
        if asset['kind']=='sprite':
            assert alpha==[0,255],f"{path.name} lacks genuine transparent and opaque pixels"
        else:
            assert alpha is None or alpha==[255,255],f"{path.name} has unexpected scene transparency"
    # The source location is machine-specific; verify it when still available.
    source=Path(asset['sourcePath'])
    result['sourceUnchanged']=hashlib.sha256(source.read_bytes()).hexdigest()==result['sha256'] if source.exists() else None
    assert result['sourceUnchanged'] is not False
    results.append(result)
report={'assets':results,'count':len(results),'totalBytes':sum(a['bytes'] for a in results)}
(root/'tests/artifacts/art-v8-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report),flush=True)
