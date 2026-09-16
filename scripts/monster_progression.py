"""Validate the supplied CSVs and export inert level/talent data. Never execute cell text."""
import argparse
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ('Huntaria - Mons-by-level.csv', 'Huntaria - mon-skills.csv')
COLUMNS = ('str', 'agi', 'dex', 'int', 'vit', 'hp', 'attack', 'defense')
SOURCE_COLUMNS = ('Str', 'Agi', 'Dex', 'Int', 'Vit', 'Base HP', 'Base ATK', 'Base Def')


def read():
    from combat_workbooks import catalog
    workbook, _ = catalog()
    roster = json.loads((ROOT / 'data/monster-roster.json').read_text(encoding='utf-8'))['rows']
    by_name = {row[1]: row[-1] for row in roster}
    sources = [{'path': 'docs/' + name, 'sha256': hashlib.sha256((ROOT / 'docs' / name).read_bytes()).hexdigest()} for name in FILES]
    with (ROOT / sources[0]['path']).open(encoding='utf-8-sig', newline='') as stream:
        levels = list(csv.DictReader(stream))
    with (ROOT / sources[1]['path']).open(encoding='utf-8-sig', newline='') as stream:
        trees = list(csv.DictReader(stream))
    if len(levels) != 10000 or len(trees) != 100:
        raise ValueError('Expected 100 species, 100 levels and 24 talents per species')
    stats, talents, metadata, seen = {}, {}, {}, set()
    for row in levels:
        if row['Mon'] not in by_name:
            raise ValueError('Unknown monster: ' + row['Mon'])
        species, level = by_name[row['Mon']], int(row['Lvl'])
        basis = {'Strength-based': 'STR', 'Dex-Based': 'DEX', 'Int-Based': 'INT'}
        if basis.get(row['Atk Base']) != workbook['species'][species]['attackBase']:
            raise ValueError('Attack basis differs from the combat kit: ' + row['Mon'])
        if (species, level) in seen or not 1 <= level <= 100:
            raise ValueError('Duplicate or invalid level: ' + row['Mon'])
        seen.add((species, level))
        values = [int(row[k]) for k in SOURCE_COLUMNS]
        if any(v < 0 for v in values) or values[5] < 1 or values[6] < 1 or values[7] > 100:
            raise ValueError('Invalid stat row: ' + row['Mon'])
        if any(v > 99 for v in values[:5]):
            raise ValueError('Intrinsic attributes exceed 99: ' + row['Mon'])
        stats.setdefault(species, [None] * 100)[level - 1] = values
    for row in trees:
        species = by_name.get(row['Monster'])
        if not species or species in talents:
            raise ValueError('Unknown or duplicate talent owner: ' + row['Monster'])
        nodes = [json.loads(row[f'{branch}{index:02}']) for branch in 'ABC' for index in range(1, 9)]
        ids = {n['id'] for n in nodes}
        if len(ids) != 24:
            raise ValueError('Duplicate talent IDs: ' + row['Monster'])
        known = {s['name'] for s in workbook['skills'].values()} | {s['passive']['name'] for s in workbook['species'].values()}
        opened = set()
        for index, node in enumerate(nodes):
            if node['cost'] != 1 or node['max_rank'] != 1 or node['branch'] != 'ABC'[index // 8]:
                raise ValueError('Unexpected talent cost, rank or branch: ' + node['id'])
            req = node['requires']
            if not isinstance(req['branch_points'], int) or not 0 <= req['branch_points'] <= 7:
                raise ValueError('Invalid branch threshold: ' + node['id'])
            if any(ref not in opened for ref in req['all'] + req['any']):
                raise ValueError('Missing, cyclic or out-of-order prerequisite: ' + node['id'])
            if any(ref not in ids or ref == node['id'] for ref in node['exclusive_with']):
                raise ValueError('Invalid exclusive node: ' + node['id'])
            if any(name not in known for name in node['modifies']):
                raise ValueError('Unknown modified ability: ' + node['id'])
            for ref in node['exclusive_with']:
                other = next(n for n in nodes if n['id'] == ref)
                if node['id'] not in other['exclusive_with']:
                    raise ValueError('Asymmetric exclusivity: ' + node['id'])
            opened.add(node['id'])
        meta = nodes[0].pop('tree')
        if meta['max_points'] != 15 or meta['starting_points'] != 1 or meta['level_awards']['levels'] != list(range(5, 61, 5)):
            raise ValueError('Unexpected companion point policy')
        if meta['main_quest_awards'] != {'count': 2, 'points_each': 1} or meta['level_awards']['points_each'] != 1:
            raise ValueError('Unexpected companion awards')
        if meta['base_passive']['name'] != workbook['species'][species]['passive']['name']:
            raise ValueError('Innate identity mismatch: ' + row['Monster'])
        talents[species], metadata[species] = nodes, meta
    if set(stats) != set(by_name.values()) or set(talents) != set(stats) or any(None in rows for rows in stats.values()):
        raise ValueError('Incomplete species or level coverage')
    return {'version': 1, 'sources': sources, 'columns': COLUMNS, 'levels': stats, 'talents': talents, 'metadata': metadata}


def generate(data):
    # Compact arrays keep the 10,000 exact rows small; one line per species is reviewable.
    encode = lambda value: json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    lines = ['/* Generated by scripts/monster_progression.py. Data only; CSV prose is never executable. */',
             '(function(root){"use strict";', 'root.BondMonsterProgression={version:1,sources:' + encode(data['sources']) + ',columns:' + encode(data['columns']) + ',levels:{']
    lines += [encode(key) + ':' + encode(value) + (',' if index < len(data['levels']) - 1 else '') for index, (key, value) in enumerate(data['levels'].items())]
    lines += ['},talents:{']
    lines += [encode(key) + ':' + encode(value) + (',' if index < len(data['talents']) - 1 else '') for index, (key, value) in enumerate(data['talents'].items())]
    lines += ['},policy:{maxPoints:15,startingPoints:1,questPoints:2,levelAwards:' + encode(list(range(5, 61, 5))) + '}};', '})(globalThis);', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data = read()
    output, expected = ROOT / 'monster-progression-data.js', generate(data)
    if args.write:
        output.write_text(expected, encoding='utf-8', newline='\n')
    if args.check and (not output.exists() or output.read_text(encoding='utf-8') != expected):
        raise SystemExit('monster-progression-data.js is stale; run scripts/monster_progression.py --write')
    print('PASS: 100 species, 10,000 level rows, 2,400 talents, prerequisites, exclusions and all ability references')


if __name__ == '__main__':
    main()
