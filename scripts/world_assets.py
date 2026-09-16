"""Lossless scenery runtime exports. Original PNGs and decoded pixels are preserved."""
import argparse,hashlib,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--check',action='store_true');args=p.parse_args()
    out=ROOT/'assets/world-runtime';out.mkdir(exist_ok=True);rows=[]
    sources=sorted((ROOT/'assets/world-v15').glob('*.png'))+[ROOT/'assets/world-v17/timber-bridge.png']+sorted((ROOT/'assets/landscapes').glob('*.png'))
    for src in sources:
        target=out/(src.stem+'.webp')
        with Image.open(src) as original:
            rgba=original.convert('RGBA')
            if not args.check:rgba.save(target,format='WEBP',lossless=True,exact=True,method=6)
            with Image.open(target) as exported:
                if rgba.size!=exported.size or rgba.tobytes()!=exported.convert('RGBA').tobytes():raise ValueError('Decoded pixel mismatch: '+src.name)
        rows.append({'source':src.relative_to(ROOT).as_posix(),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'runtime':target.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'source_bytes':src.stat().st_size,'runtime_bytes':target.stat().st_size})
    manifest={'format':'Lossless WebP with exact RGBA equality; Pillow 12.1.0','assets':rows}
    path=out/'manifest.json'
    if args.check:
        if json.loads(path.read_text(encoding='utf-8'))!=manifest:raise ValueError('Runtime manifest differs')
    else:path.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'files':len(rows),'source_bytes':sum(r['source_bytes'] for r in rows),'runtime_bytes':sum(r['runtime_bytes'] for r in rows),'pixel_identical':True}))
if __name__=='__main__':main()
