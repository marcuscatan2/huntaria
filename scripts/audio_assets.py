"""Render three original, deterministic loop assets. Standard library only."""
import argparse, hashlib, json, math, struct, wave
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
RATE=22050
# Original note sequences, not transcriptions of existing recordings.
SCORES={
 'explore': ([60,64,67,71,69,67,64,62,60,64,69,67,64,62,59,62], [48,53,45,55]),
 'combat': ([57,64,60,64,59,65,62,65,57,64,60,67,62,65,59,64], [45,50,41,52]),
 'innersea': ([72,76,79,83,81,79,76,74,72,76,81,79,76,74,71,74], [48,45,53,55])}

def render(name):
    notes,bass=SCORES[name];duration=16;size=RATE*duration;values=[0.0]*size
    def note(midi,start,length,amplitude):
        hz=440*2**((midi-69)/12)
        for j in range(int(length*RATE)):
            t=j/RATE;attack=min(1,t/.035);release=min(1,(length-t)/.22)
            env=attack*max(0,release)*math.exp(-t*1.8/length)
            tone=math.sin(2*math.pi*hz*t)+.2*math.sin(4*math.pi*hz*t)
            values[(int(start*RATE)+j)%size]+=amplitude*env*tone
    for i,n in enumerate(notes):note(n,i,1.65,.12 if name!='combat' else .16)
    for i,n in enumerate(bass):
        note(n,i*4,4.6,.1);note(n+7,i*4,4.6,.04)
    if name=='combat':
        for i in range(32):note(33,i*.5,.2,.12 if i%4==0 else .045)
    # Circular tails overlap the start; no hard envelope reset at the seam.
    return b''.join(struct.pack('<h',round(max(-.95,min(.95,v))*32767)) for v in values)

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--check',action='store_true');a=p.parse_args()
    folder=ROOT/'assets/audio';folder.mkdir(exist_ok=True)
    rows=[]
    for name in SCORES:
        path=folder/(name+'.wav');pcm=render(name)
        if a.check:
            with wave.open(str(path),'rb') as source:
                assert source.getframerate()==RATE and source.getnchannels()==1
                assert source.readframes(source.getnframes())==pcm,name+' differs from its score'
        else:
            with wave.open(str(path),'wb') as target:
                target.setparams((1,2,RATE,0,'NONE','not compressed'));target.writeframes(pcm)
        rows.append({'path':path.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'seconds':16,'bytes':path.stat().st_size})
    print(json.dumps({'origin':'Original procedural scores in scripts/audio_assets.py; no samples or third-party recordings.','loops':rows},indent=2))
if __name__=='__main__':main()
