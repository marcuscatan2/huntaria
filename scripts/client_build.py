"""Reproducible immutable local-preview bundles. Never deploys or edits sources."""
from __future__ import annotations
import argparse, hashlib, json, re
from pathlib import Path
from html.parser import HTMLParser

ROOT=Path(__file__).resolve().parents[1]
def sha(data):return hashlib.sha256(data).hexdigest()
def encoded(value):return json.dumps(value,sort_keys=True,separators=(',',':')).encode('utf-8')
class Entry(HTMLParser):
    def __init__(self,source):
        super().__init__();self.paths=[];self.feed(source)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='script' and a.get('src'):self.paths.append(a['src'])
        if tag=='link' and a.get('rel')=='stylesheet':self.paths.append(a['href'])
def source_file(root,name):
    path=root/name
    if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(root.resolve()):raise ValueError('Unsafe/missing input: '+name)
    return path.read_bytes()
def assemble(root=ROOT):
    config=json.loads(source_file(root,'data/client-build.json'))
    if config['schema']!=1 or config['mode']!='local-preview':raise ValueError('Unsupported build mode')
    html=source_file(root,'index.html').decode('utf-8-sig')
    for name in config['exclude_scripts']:
        html=re.sub(r'\s*<script src="'+re.escape(name)+r'" defer></script>','',html)
    paths=set(Entry(html).paths)|set(config.get('static_files',[]))
    for pattern in config['asset_patterns']:
        found=list(root.glob(pattern))
        if not found:raise ValueError('Empty asset pattern: '+pattern)
        paths.update(p.relative_to(root).as_posix() for p in found)
    # Allowlisted runtime and binary media only; never recursive workspace copy.
    for name in paths:
        if name.startswith(('tests/','docs/','scripts/','.')) or Path(name).suffix.lower() not in ('.js','.css','.png','.wav','.svg','.webp'):
            raise ValueError('Non-runtime input: '+name)
    files={name:source_file(root,name) for name in sorted(paths)}
    hashes={name:sha(data) for name,data in files.items()}
    rules=sha(encoded({name:sha(source_file(root,name)) for name in config['rules']}))
    build=sha(encoded({'files':hashes,'entry':sha(html.encode()),'config':config}))[:20]
    info={'id':build,'mode':'local-preview','profileSchema':config['profile_schema'],'rules':rules}
    files['build-info.js']=b'globalThis.BondBuild=Object.freeze('+encoded(info)+b');\n'
    html=html.replace('<head>','<head>\n  <script src="build-info.js" defer></script>')
    files['index.html']=html.encode('utf-8')
    rows={name:{'sha256':sha(data),'bytes':len(data)} for name,data in sorted(files.items())}
    manifest={'schema':1,'build':info,'files':rows,'cachePolicy':{'index.html':'no-cache','build-manifest.json':'no-cache','immutableBuildDirectory':'public, max-age=31536000, immutable'},'limitations':['Local editable progress only; not a production/economy server.','No service worker or offline-play promise.','Physical-device, rights and online acceptance pending.']}
    files['build-manifest.json']=json.dumps(manifest,indent=2,sort_keys=True).encode()+b'\n'
    return build,files,manifest
def verify(folder):
    manifest=json.loads((folder/'build-manifest.json').read_text(encoding='utf-8'))
    expected=set(manifest['files'])|{'build-manifest.json'}
    actual={p.relative_to(folder).as_posix() for p in folder.rglob('*') if p.is_file()}
    if actual!=expected:raise ValueError('Bundle file set differs from manifest')
    for name,row in manifest['files'].items():
        data=source_file(folder,name)
        if len(data)!=row['bytes'] or sha(data)!=row['sha256']:raise ValueError('Bundle hash mismatch: '+name)
    return manifest
def build_to(root=ROOT,parent=None):
    build,files,manifest=assemble(root);folder=(parent or root/'dist')/build
    if folder.exists():
        verify(folder)
        if any(source_file(folder,n)!=v for n,v in files.items()):raise ValueError('Existing immutable build differs')
    else:
        folder.mkdir(parents=True,exist_ok=False)
        for name,data in files.items():
            target=folder/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
        verify(folder)
    return folder,manifest
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--verify',type=Path);a=p.parse_args()
    if a.verify:
        m=verify(a.verify);folder=a.verify
    else:folder,m=build_to()
    print(json.dumps({'folder':str(folder),'build':m['build'],'files':len(m['files']),'totalBytes':sum(x['bytes'] for x in m['files'].values()),'published':False},indent=2))
if __name__=='__main__':main()
