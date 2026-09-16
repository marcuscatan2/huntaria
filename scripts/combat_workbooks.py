"""Read the two design workbooks as data; never execute formulas or external links.

--write generates the runtime catalog. --check rejects source/catalog drift.
--audit prints the complete structural audit without changing any files.
Runtime mechanics are deliberately authored separately in combat-kits.js.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ('Huntaria_Combat_Design_v2.xlsx', 'Huntaria_Trainer_Passive_Trees.xlsx')
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
REL = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'
CLASSES = {'Mage': 'mage', 'Druid': 'druid', 'Knight': 'swordsman', 'Hunter': 'hunter'}


def read(path: Path) -> dict:
    with zipfile.ZipFile(path) as z:
        if sum(i.file_size for i in z.infolist()) > 30_000_000:
            raise ValueError('Workbook exceeds the import budget')
        shared = []
        if 'xl/sharedStrings.xml' in z.namelist():
            shared = [''.join(n.itertext()) for n in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        relationships = {n.attrib['Id']: n.attrib['Target'] for n in ET.fromstring(z.read('xl/_rels/workbook.xml.rels')) if n.attrib.get('TargetMode') != 'External'}
        sheets = {}
        for s in ET.fromstring(z.read('xl/workbook.xml')).findall('m:sheets/m:sheet', NS):
            target = relationships[s.attrib[REL]].lstrip('/')
            if not target.startswith('xl/'):
                target = 'xl/' + target
            rows = []
            for r in ET.fromstring(z.read(target)).findall('m:sheetData/m:row', NS):
                row = {'_row': int(r.attrib['r'])}
                for c in r.findall('m:c', NS):
                    key = re.sub(r'\d', '', c.attrib['r'])
                    v = c.find('m:v', NS)
                    value = v.text if v is not None else ''
                    if c.attrib.get('t') == 's':
                        value = shared[int(value)]
                    elif c.attrib.get('t') == 'inlineStr':
                        value = ''.join(t.text or '' for t in c.findall('.//m:t', NS))
                    f = c.find('m:f', NS)
                    row[key] = {'formula': f.text, 'cached': value} if f is not None else value
                if len(row) > 1:
                    rows.append(row)
            sheets[s.attrib['name']] = rows
    return {'file': 'docs/' + path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'sheets': sheets}


def data_rows(book, sheet, start):
    return [r for r in book['sheets'][sheet] if r['_row'] >= start]


def catalog():
    books = [read(ROOT / 'docs' / f) for f in FILES]
    roster = json.loads((ROOT / 'data/monster-roster.json').read_text(encoding='utf-8'))
    by_number = {int(r[0]): r for r in roster['rows']}
    bases = {sid: ('INT' if base.lower().startswith('int') else 'DEX' if base.lower().startswith('dex') else 'STR') for base, ids in roster['attackBaseGroups'].items() for sid in ids}
    species = {}
    for r in data_rows(books[0], 'Species', 6):
        number = int(r['A'])
        original = by_number[number]
        sid = original[17]
        assert r['B'] == original[1], (number, 'species identity mismatch')
        base = 'INT' if r['D'].lower().startswith('int') else 'DEX' if r['D'].lower().startswith('dex') else 'STR'
        assert bases[sid] == base, (sid, 'attack base mismatch')
        species[sid] = {'number': number, 'name': r['B'], 'attackBase': base, 'delivery': r['E'], 'identity': r['F'],
                        'passive': {'id': 'innate-' + sid, 'name': r['G'], 'description': r['H']}, 'hybrid': r['I'] == 'Yes', 'sourceRow': r['_row']}
    assert len(species) == 100
    skills = {}
    counts = Counter()
    names = set()
    for r in data_rows(books[0], 'Signature Moves', 6):
        sid = by_number[int(r['A'])][17]
        assert r['B'] == species[sid]['name']
        key = 'sig-' + sid + '-' + re.sub(r'[^a-z0-9]+', '-', r['D'].lower()).strip('-')
        assert key not in skills and r['D'] not in names
        names.add(r['D'])
        counts[sid] += 1
        skills[key] = {'id': key, 'owner': sid, 'number': species[sid]['number'], 'name': r['D'], 'cd': int(r['C']), 'proposal': r['E'], 'condition': r['F'], 'sourceRow': r['_row']}
    assert len(skills) == 304 and sorted(counts.values()) == [3] * 96 + [4] * 4
    general = data_rows(books[0], 'General Moves', 6)
    general_names = {r['B'] for r in general}
    for r in general:
        key = 'general-' + re.sub(r'[^a-z0-9]+', '-', r['B'].lower()).strip('-')
        skills[key] = {'id': key, 'owner': None, 'number': 0, 'name': r['B'], 'cd': int(r['A']), 'proposal': r['C'], 'condition': r['D'], 'sourceRow': r['_row']}
    builds = []
    for r in data_rows(books[0], 'Tactical Builds', 6):
        sid = by_number[int(r['A'])][17]
        selected = [r[k] for k in ('F', 'G', 'H')]
        legal = {s['name'] for s in skills.values() if s['owner'] == sid} | general_names
        assert len(set(selected)) == 3 and all(s in legal for s in selected), (sid, selected, legal)
        builds.append({'owner': sid, 'name': r['C'], 'skills': selected})
    assert len(builds) == 200 and all(n == 2 for n in Counter(b['owner'] for b in builds).values())
    talents = {}
    for r in data_rows(books[1], 'Talent Data', 5):
        talents[r['A']] = {'id': r['A'], 'type': CLASSES[r['B']], 'branch': r['C'], 'tier': r['D'], 'name': r['E'], 'max': int(r['F']), 'ranks': [r['G']] + ([r['H']] if r.get('H') else []), 'limits': r['I'], 'sourceRow': r['_row']}
    assert len(talents) == 60 and all(n == 15 for n in Counter(t['type'] for t in talents.values()).values())
    allocations = []
    for r in data_rows(books[1], 'Allocations', 5):
        rank = [int(r[chr(c)]) for c in range(ord('C'), ord('Q') + 1)]
        assert sum(rank) == 15
        for i in (0, 5, 10):
            a, b, c, d, e = rank[i:i + 5]
            assert all(0 <= n <= 2 for n in (a, b, c, d)) and e in (0, 1)
            assert not (b or c) or a == 2
            assert not d or a + b + c >= 4 and (b == 2 or c == 2)
            assert not e or a + b + c + d >= 7 and d == 2
        allocations.append({'type': CLASSES[r['A']], 'name': r['B'], 'ranks': rank})
    assert len(allocations) == 12
    source = [{k: b[k] for k in ('file', 'sha256')} for b in books]
    return {'version': 1, 'source': source, 'species': species, 'skills': skills, 'talents': talents, 'builds': builds, 'allocations': allocations}, books


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--write', action='store_true')
    p.add_argument('--check', action='store_true')
    p.add_argument('--audit', action='store_true')
    args = p.parse_args()
    data, books = catalog()
    # Raw prose remains provenance, not executable instructions. Browser code never evaluates it.
    payload = '/* Generated by scripts/combat_workbooks.py. Mechanics: combat-kits.js. */\n' + 'globalThis.BondCombatCatalog = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
    dest = ROOT / 'combat-catalog.js'
    if args.write:
        dest.write_text(payload, encoding='utf-8', newline='\n')
    if args.check:
        assert dest.read_text(encoding='utf-8') == payload, 'Stale combat-catalog.js; regenerate explicitly'
    if args.audit:
        print(json.dumps({'source': data['source'], 'sheets': {b['file']: {k: len(v) for k, v in b['sheets'].items()} for b in books}, 'species': len(data['species']), 'signatures': sum(bool(s['number']) for s in data['skills'].values()), 'generalMoves': sum(not s['number'] for s in data['skills'].values()), 'talents': len(data['talents']), 'validatedMonsterBuilds': len(data['builds']), 'recomputedClassAllocations': len(data['allocations'])}, indent=2))
    else:
        print('Workbook contract: 100 species, 304 signatures, 200 loadouts, 60 talents, 12 recomputed allocations.')


if __name__ == '__main__':
    main()
