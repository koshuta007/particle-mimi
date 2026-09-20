#!/usr/bin/env python3
"""
Deck health check. Run from the repo root:  python3 src/check.py

Three things go wrong repeatedly, and each one silently turns a question into a
coin toss. This finds all three.

  1. a hint that hands over the answer — its own verb, another card's verb, or
     one of its own accepted alternatives
  2. two cards whose hints are identical, so nothing picks between them
  3. an example too thin to force one answer, on a card that has no better one
"""
import json, re, sys, collections, importlib.util

src = open('src/round.py').read().split("is_dragon =")[0]
ns = {}
exec(src.replace("SIZE = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 30", "SIZE=30")
        .replace("DRAGONS_FIRST = '--dragons' in sys.argv", "DRAGONS_FIRST=False")
        .replace("TODAY = datetime.date.today()", "TODAY=None"), ns)
gap = ns['gap']

d = json.load(open('data/phrasal-verbs-data.json'))
V = d['verbs']
names = {' '.join(v['phrasal'].lower().split()) for v in V}
fail = 0

def leak(v):
    h = ' '.join(v['formal'].lower().split())
    me = ' '.join(v['phrasal'].lower().split())
    if re.search(r'\b' + re.escape(me.split()[0]) + r'\b', h):
        return 'contains its own verb'
    other = [x for x in names if x != me and re.search(r'\b' + re.escape(x) + r'\b', h)]
    if other:
        return 'names another card: ' + other[0]
    for a in (v.get('accepts') or []):
        if re.search(r'\b' + re.escape(a.lower()) + r'\b', h):
            return 'names its own accepted alternative: ' + a
    return None

bad = [(v['phrasal'], v['formal'], leak(v)) for v in V if leak(v)]
print(f"1. hints that hand over the answer: {len(bad)}")
for p, h, w in bad:
    print(f"     {p:<16} ({h})  <- {w}")
fail += len(bad)

g = collections.defaultdict(list)
for v in V:
    g[' '.join(v['formal'].lower().split())].append(v['phrasal'])
dup = {h: ps for h, ps in g.items() if len(ps) > 1}
# an identical hint is fine when the two cards accept each other
acc = {' '.join(v['phrasal'].lower().split()): set(x.lower() for x in (v.get('accepts') or [])) for v in V}
unlinked = {h: ps for h, ps in dup.items()
            if not all(any(o.lower() in acc[p.lower()] for o in ps if o != p) for p in ps)}
print(f"2. identical hints not covered by a synonym link: {len(unlinked)}")
for h, ps in unlinked.items():
    print(f"     {ps} -> ({h})")
fail += len(unlinked)

def words(v, e):
    return len(re.findall(r"[\w']+", (gap(e, v['phrasal'])[0] or e).replace('___', ' ')))

thin = [v for v in V if not v.get('retired')
        and not any(words(v, e) >= 6 for e in (v.get('examples') or [v['example']]))]
soon = [v for v in thin if v.get('phave') or v['box'] >= 1]
print(f"3. cards whose only example is too thin: {len(thin)}  "
      f"({len(soon)} of them due to come up soon)")
for v in sorted(soon, key=lambda v: (v.get('phave', 9999), v['id']))[:10]:
    print(f"     {v['phrasal']:<16} {(v.get('examples') or [v['example']])[0]}")
fail += len(soon)

print("\nOK" if fail == 0 else f"\n{fail} things to fix")
sys.exit(1 if fail else 0)
