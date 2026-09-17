"""Original compact SVG item artwork. Rebuild/check without a bitmap dependency."""
import argparse,hashlib,html,json
from pathlib import Path
from equipment_catalog import catalog,ROOT

PALETTES={'Earth':('#799258','#c8d89a','#785f3e'),'Fire':('#b86644','#f0bc75','#754239'),
          'Water':('#498e96','#b3e1d5','#406778'),'Wind':('#718ba7','#d3e4e2','#696185')}
# Source-ordered silhouettes identify each held object's material and purpose.
HELD='token wax knot tooth valve pearl brush ember mitten spool shard rib flower pillow stone hinge stone mane plug scale seed ribbon gust button thorn scroll beak mallet feather brooch lozenge feather filament chevron stone spur bottle gear pinion thimble reed sachet patch lens ribbon crown clover spur drop leaf dust mirror pin doorstop thread husk flake rattle ribbon seed thread knot wrap clasp bladder salt braid ribbon pincer slate lining core wedge band needle lens leaf ash disk gear hook shell ring gills shell chip seed spore petal patch vane splint bud bell stamp jawbone latch rivet mask spiral'.split()
assert len(HELD)==100
def paths(kind):
    # Every object has a purposeful silhouette; fill URLs share one local palette.
    shapes={
      'Sword':'<path d="m24 69 8-15 36-39 9 2 2 9-40 36-15 8Z" fill="url(#metal)"/><path d="m38 57 11 11-5 5-11-12-11-6 5-5Z" fill="url(#gold)"/><path d="m33 67-12 14-7-7 14-12Z" fill="url(#wood)"/><path d="m41 52 29-28" class="shine"/>',
      'Bow':'<path d="M29 12c47 9 48 63 0 72l8-14c31-14 31-29 0-44Z" fill="url(#wood)"/><path d="m29 12 6 36-6 36M13 48h66m-8-7 9 7-9 7" fill="none" stroke="var(--gold)"/><path d="m15 43 9 5-9 5" fill="var(--light)"/>',
      'Crossbow':'<path d="m19 17 15 6 43 48-9 11-47-46Z" fill="url(#wood)"/><path d="M22 71c-13-27 8-51 35-49l16 11-19-3c-17 2-22 13-22 28l4 19Z" fill="url(#metal)"/><path d="m23 71 39-39M22 65l46-46m-8 1 12-5-5 12" class="shine"/>',
      'Staff':'<path d="m29 86 18-59 7 1-16 60Z" fill="url(#wood)"/><path d="M50 36c-31-14-5-39 17-23l6 14-13-10-14 4 2 10 14 5Z" fill="url(#gold)"/><ellipse cx="52" cy="22" rx="9" ry="12" fill="url(#gem)"/>',
      'Wand':'<path d="m21 82 36-54 7 5-32 53Z" fill="url(#wood)"/><path d="m57 12 8 5 14-2-3 14 4 11-13 1-11 8-4-13-9-9 12-4Z" fill="url(#gold)"/><path d="m63 20 8 9-9 12-9-9Z" fill="url(#gem)"/>',
      'Rod':'<path d="m27 84 21-52 10 3-21 53Z" fill="url(#wood)"/><path d="m43 43 3-18 10-15 13 4 5 21-11 17Z" fill="url(#metal)"/><path d="m50 25 9-8 7 14-9 13Z" fill="url(#gem)"/>',
      'Hammer':'<path d="m25 86 24-49 10 4-22 49Z" fill="url(#wood)"/><path d="m30 13 47 22-10 28-49-22Z" fill="url(#metal)"/><path d="m48 20 16 8-12 30-16-8Z" fill="url(#gold)"/><path d="m24 26 12 5m30 18 7 3" class="shine"/>',
      'Cudgel':'<path d="m22 81 18-32 6-30 16-10 14 14-14 23-16 15-14 27Z" fill="url(#wood)"/><path d="m42 38 22 10m-18-20 23 9m-40 36 10 6" fill="none" stroke="var(--gold)"/>',
      'Shield':'<path d="m48 9 30 14-4 37Q68 76 48 87 25 76 21 59l-4-36Z" fill="url(#gold)"/><path d="m48 17 23 12-4 28Q61 72 48 79 33 70 28 57l-3-28Z" fill="url(#body)"/><path d="M48 23v48M31 43h34" fill="none" stroke="var(--light)"/><circle cx="48" cy="44" r="10" fill="url(#metal)"/>',
      'Focus':'<path d="m26 66 4 14h36l4-14-22-9Z" fill="url(#gold)"/><path d="m48 10 23 17-6 34-17 14-17-14-6-34Z" fill="url(#gem)"/><path d="m48 14-8 27 8 26 9-26Z" fill="var(--light)" opacity=".5"/>',
      'Totem':'<path d="m33 83 3-57 24-1 5 58Z" fill="url(#wood)"/><path d="m20 28 11-13 17 8 19-8 10 13-12 24-17 6-19-8Z" fill="url(#body)"/><path d="m33 32 8 8m14 0 8-8M38 68h20" class="shine"/>',
      'Quiver':'<path d="m30 28 33 6-6 50-16 5-16-9Z" fill="url(#wood)"/><path d="m28 28 38 7-2 11-37-7Z" fill="url(#gold)"/><path d="m35 30 5-18m6 20 6-23m3 26 7-20" stroke="var(--light)"/><path d="m35 9 5 6 7-6m1-2 5 6 7-6m-3 6 5 6 7-6" fill="var(--light)"/>',
      'Helm':'<path d="M20 62V41C17 8 76 8 77 41v22L60 80l-8-23-10 1-8 22Z" fill="url(#metal)"/><path d="m20 48 21 6m12 0 24-6M48 18v25" stroke="var(--dark)" fill="none"/><path d="m38 14 9-8 10 8-8 34Z" fill="url(#gold)"/>',
      'Circlet':'<path d="M15 32 32 44 48 20 65 44l16-12-7 33-25 11-28-11Z" fill="url(#gold)"/><path d="m48 36 11 15-11 15-11-15Z" fill="url(#gem)"/><path d="m23 51 8 4m33 0 9-4" class="shine"/>',
      'Hat':'<path d="m25 63 13-45 30-9-5 22 13 39Z" fill="url(#body)"/><path d="M8 68c18-20 61-13 79 3-15 15-60 19-79-3Z" fill="url(#body)"/><path d="m29 53 39 8-2 10-40-9Z" fill="url(#gold)"/>',
      'Hood':'<path d="M12 77 25 27C46-7 80 21 82 70L65 84 42 79Z" fill="url(#body)"/><path d="M31 61 37 31q23-18 28 18l4 17-19 5Z" fill="var(--dark)"/><path d="m25 69 23 9 25-7" class="shine"/>',
      'Mask':'<path d="m13 21 18 10 17-9 18 9 17-10-7 43-27 24-29-24Z" fill="url(#metal)"/><path d="m25 43 15 5-10 7Zm31 5 15-5-5 12Z" fill="var(--dark)"/><path d="m48 43 6 18-8 3" fill="url(#gold)"/>',
      'Veil':'<path d="m20 22 27-12 30 14-5 60-24-12-26 11Z" fill="url(#body)"/><path d="m22 30 25-9 27 11M31 37l-3 37m20-42v31m17-25 3 33" class="shine"/>',
      'Plate':'<path d="m29 15 18 7 20-7 18 16-13 15-3 30-20 12-23-12-3-31L11 32Z" fill="url(#metal)"/><path d="m31 20 17 16 17-16m-39 41 22 10 24-10M48 36v35" fill="none" stroke="var(--gold)"/>',
      'Robe':'<path d="m31 13 17 9 17-9 17 28-15 12-3-12 13 43H19l13-43-4 12-15-12Z" fill="url(#body)"/><path d="m32 14 16 18 16-18M48 33v51M29 52h38" fill="none" stroke="var(--gold)"/><path d="m26 77 7-19m30 0 7 19" class="shine"/>',
      'Cloak':'<path d="m32 14 16 9 17-9 7 21 14 44-23 8-16-10-18 10-18-8 14-44Z" fill="url(#body)"/><path d="m32 17 15 17 18-17-16 25Z" fill="url(#gold)"/><path d="m43 43-8 32m18-31 10 30" class="shine"/>',
      'Boots':'<path d="m23 16 25 2-5 35 7 19-6 9H12l-2-12 16-14Zm34 1 23 2-5 37 11 14-3 11H56l-7-11 10-16Z" fill="url(#wood)"/><path d="m22 27 24 2m10-1 22 2M15 70h27m15 0h24" fill="none" stroke="var(--gold)"/>',
      'Greaves':'<path d="m23 12 23 4-4 41 6 20-9 8H13l-3-12 17-17Zm35 2 22 1-4 42 10 15-7 13H56l-8-14 11-16Z" fill="url(#metal)"/><path d="m25 29 17 2m17-1 18 1m-48 6-1 18m36-16-1 17" fill="none" stroke="var(--gold)"/>',
      'Ring':'<ellipse cx="48" cy="57" rx="25" ry="24" fill="none" stroke="url(#gold)" stroke-width="10"/><path d="m48 13 17 16-8 18H39l-8-18Z" fill="url(#gem)"/><path d="m38 28 10-9 8 9" class="shine"/>',
      'Bell':'<path d="M23 63c8-13 4-38 24-40 23 0 19 26 26 40l6 8H18Z" fill="url(#gold)"/><circle cx="48" cy="77" r="8" fill="url(#metal)"/><path d="M40 22V12h16v10M31 59l4-17" fill="none" stroke="var(--light)"/>',
      'Instrument':'<path d="m25 79 32-64 16 7-31 65Z" fill="url(#wood)"/><path d="m50 29 16 8m-36 31 17 8" fill="none" stroke="var(--gold)"/><circle cx="52" cy="46" r="3"/><circle cx="47" cy="56" r="3"/><circle cx="42" cy="66" r="3"/>',
      'Charm':'<path d="M32 11q16 33 32 0M48 26v16" fill="none" stroke="var(--gold)"/><path d="m48 34 23 16-7 30-32 1-9-29Z" fill="url(#metal)"/><path d="m48 46 12 14-12 12-12-12Z" fill="url(#gem)"/>',
      'Locket':'<path d="M26 12q24 46 44 0" fill="none" stroke="var(--gold)"/><ellipse cx="48" cy="59" rx="24" ry="28" fill="url(#gold)"/><ellipse cx="48" cy="59" rx="17" ry="21" fill="url(#body)"/>',
      'Brooch':'<path d="m14 36 24 1 10-22 12 22h23L65 54l6 27-23-14-23 14 6-27Z" fill="url(#gold)"/><ellipse cx="48" cy="48" rx="12" ry="16" fill="url(#gem)"/>'
    }
    for alias,original in {'Armor':'Plate','Coat':'Robe','Mantle':'Cloak','Pendant':'Locket','Mask Charm':'Mask'}.items():shapes[alias]=shapes[original]
    return shapes.get(kind)
def held_shape(kind):
    groups={
      'token button coin disk core':'<circle cx="48" cy="48" r="29" fill="url(#gold)"/><circle cx="48" cy="48" r="22" fill="url(#body)"/>',
      'wax ember ash drop':'<path d="M49 8c-1 21 29 26 23 51C66 83 31 90 22 62c-4-15 5-23 11-30l4 17c9-14-4-19 12-41Z" fill="url(#gem)"/><path d="M46 43c-1 10 12 10 9 22-7 15-21 0-9-22Z" fill="var(--light)"/>',
      'knot thread filament braid spool':'<path d="M18 25c25-24 70 9 44 30-31 24-35-34-2-27 40 7-3 65-31 39-21-19 7-46 31-8" fill="none" stroke="url(#gold)" stroke-width="9"/><path d="m29 67-6 19m38-27 14 21" fill="none" stroke="var(--light)"/>',
      'tooth beak shard chevron wedge chip splint':'<path d="m29 16 30-5 17 27-37 47-9-36-12-8Z" fill="url(#metal)"/><path d="m37 22 15 16-8 34 21-34-8-19Z" fill="var(--light)" opacity=".6"/>',
      'pearl lens mirror brooch pin lozenge flake':'<path d="m25 20 42 1 12 25-15 30-32 8-19-30Z" fill="url(#gold)"/><ellipse cx="48" cy="48" rx="22" ry="25" fill="url(#gem)"/><ellipse cx="41" cy="36" rx="7" ry="9" fill="var(--light)" opacity=".7"/>',
      'brush reed needle mallet spur hook':'<path d="m21 84 32-48 8 5-28 46Z" fill="url(#wood)"/><path d="m49 47-3-18 14-17 19 8-5 19-15 10Z" fill="url(#metal)"/><path d="m49 35 20 8m-6-26-9 14" fill="none" stroke="var(--light)"/>',
      'mitten pillow ribbon wrap sachet patch thimble lining band':'<path d="m23 22 23 7 26-9 7 24-6 32-26-7-25 10-8-28Z" fill="url(#body)"/><path d="m22 27 7 21-4 24m40-45 7 22-5 23M32 45l27 9m-18-15 4 26" fill="none" stroke="var(--gold)"/>',
      'rib jawbone':'<path d="M20 25c7-13 22-6 20 4l14 9c15-5 29 8 18 21l-9 2-21-15C18 57 7 39 20 25Z" fill="url(#metal)"/><path d="m40 36 20 14" class="shine"/>',
      'flower clover bud petal spore':'<path d="M48 57C8 76 9 30 33 34 15 2 55 3 55 28 83 5 95 45 66 49 85 76 43 91 48 57Z" fill="url(#body)"/><circle cx="48" cy="44" r="12" fill="url(#gold)"/><path d="m46 59-5 27" stroke="var(--wood)"/>',
      'leaf mane feather pinion vane gills scale':'<path d="M17 80 29 34C35 9 66 14 81 9 87 28 71 65 51 66Z" fill="url(#body)"/><path d="m19 83 49-60m-25 9 1 20m11-31-1 20m-22 7 1 17m-2 0 22-2m-9-12 24-4" fill="none" stroke="var(--light)"/>',
      'stone husk shell spiral':'<path d="M18 65C0 37 31 8 59 15 89 18 92 55 71 72L38 83Z" fill="url(#body)"/><path d="M31 67C14 42 49 21 66 39 79 57 51 69 43 51c-5-11 12-17 14-8" fill="none" stroke="var(--gold)" stroke-width="5"/>',
      'hinge valve plug gear latch rivet clasp pincer':'<path d="m38 11 22 2 1 11 11 7 10-3 6 22-12 5-5 12 3 11-21 7-7-10-12-1-9 7-12-19 8-7-2-15-10-5 11-18 13 5Z" fill="url(#metal)"/><circle cx="48" cy="48" r="16" fill="url(#wood)"/><circle cx="48" cy="48" r="8" fill="var(--dark)"/>',
      'seed':'<path d="M22 66C6 32 45 10 75 19 87 54 65 84 35 80Z" fill="url(#wood)"/><path d="M26 64c4-20 24-34 40-35M37 66c4-10 12-17 21-22" class="shine"/><path d="m62 21 3-13 15 5-11 16Z" fill="url(#body)"/>',
      'gust dust salt':'<path d="M19 67 28 36l38-8 14 33-16 21-33-2Z" fill="url(#gem)"/><path d="m32 29-8-10m27 5 6-13m15 23 13-11m-48 41 8-10 12 9m-25-18 4-9" class="shine"/>',
      'scroll slate doorstop':'<path d="m24 18 51 4-10 59-49-6Z" fill="url(#wood)"/><path d="m30 22 34 4-7 44-32-3Z" fill="url(#metal)"/><path d="m34 36 20 3m-21 8 15 3m-18 8 20 3" stroke="var(--dark)"/>',
      'bottle bladder':'<path d="m34 12 28 1-2 17 17 22-7 26-38 5-16-25 20-29Z" fill="url(#gem)"/><path d="m33 10 30 1 1 13-31-1Z" fill="url(#wood)"/><path d="m26 54 43-1-8 20H35Z" fill="var(--body)"/><path d="m35 39-6 11" class="shine"/>',
      'crown':paths('Circlet'),'bell rattle':paths('Bell'),'mask stamp':paths('Mask'),'ring':paths('Ring'),
      'thorn':'<path d="m18 78 12-22-9-21 18 6 1-24 15 20 25-23-13 33 13 19-24-4-19 22Z" fill="url(#wood)"/><path d="m31 64 31-29" class="shine"/>'
    }
    return next((value for words,value in groups.items() if kind in words.split()),None)
def icon(item):
    body,light,wood=PALETTES[item['element']];gold='#dcb876';dark='#3e3931'
    tier=1+sum(item['level']>=n for n in (20,30,40)) if item['kind']=='equipment' else 1+item['number']//30
    shape=paths(item['subtype']) if item['kind']=='equipment' else held_shape(HELD[item['number']-1]);assert shape,item
    # A small source motif varies by item identity while preserving recognizable item shape.
    n=item['number'];motifs=[f'<path d="m48 39 6 9-6 9-6-9Z" fill="url(#gem)"/>',
        '<path d="M48 39c-12 4-11 18 0 18 11 0 12-14 0-18Z" fill="url(#gem)"/>',
        '<path d="m48 38 3 7 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="url(#gold)"/>',
        '<path d="M52 39c-16-5-20 19-2 18-9-4-8-12 2-18Z" fill="url(#gold)"/>']
    detail=''
    if tier>=2:detail+='<circle cx="20" cy="19" r="2" fill="var(--gold)" stroke="none"/>'
    if tier>=3:detail+='<path d="m77 70 2 5 6 2-6 2-2 6-2-6-5-2 5-2Z" fill="var(--light)" stroke="none"/>'
    if tier>=4:detail+='<path d="m17 20 2-7 8-2m47 65-2 8-8 2" fill="none" stroke="var(--gold)"/>'
    motif=motifs[n%len(motifs)] if item['kind']=='equipment' or HELD[n-1] in ['token','stone','patch','scroll','slate','gear','pillow','button','core'] else ''
    gradients=''.join(f'<linearGradient id="{name}" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="{a}"/><stop offset=".52" stop-color="{b}"/><stop offset="1" stop-color="{c}"/></linearGradient>' for name,a,b,c in [
        ('body',light,body,wood),('metal','#ede5d0','#a9b8af','#64777b'),('gold','#ffdfa0',gold,'#957044'),('wood','#c39b6a',wood,'#594138'),('gem',light,body,'#344e60')])
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" style="--body:{body};--light:{light};--wood:{wood};--gold:{gold};--dark:{dark}"><title>{html.escape(item["name"])}</title><defs>{gradients}</defs><style>.shine{{fill:none;stroke:{light};stroke-width:2.5;stroke-linecap:round}}</style><ellipse cx="48" cy="86" rx="30" ry="4" fill="#20392d" opacity=".14"/><g stroke="{dark}" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round">{shape}{motif}{detail}</g></svg>\n'
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args();data=catalog();items={**data['items'],**data['questItems']};folder=ROOT/'assets/items';folder.mkdir(exist_ok=True)
    rows=[]
    for item in items.values():
        text=icon(item);path=ROOT/item['icon']
        if args.check:assert path.read_text(encoding='utf-8')==text,'Stale item icon '+item['id']
        else:path.write_text(text,encoding='utf-8',newline='\n')
        rows.append({'id':item['id'],'path':item['icon'],'sha256':hashlib.sha256(text.encode()).hexdigest(),'bytes':len(text.encode())})
    manifest={'version':1,'method':'Original code-authored SVG; scripts/item_icons.py','viewBox':[0,0,96,96],'icons':rows,'totalBytes':sum(r['bytes'] for r in rows)}
    target=folder/'manifest.json';text=json.dumps(manifest,indent=2,ensure_ascii=False)+'\n'
    if args.check:assert target.read_text(encoding='utf-8')==text,'Stale item asset manifest'
    else:target.write_text(text,encoding='utf-8',newline='\n')
    print(f'PASS: {len(rows)} original item icons, {manifest["totalBytes"]:,} bytes combined')
if __name__=='__main__':main()
