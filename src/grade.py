#!/usr/bin/env python3
"""
Marks a round against its plan.

    python3 src/grade.py <round-number> <answers.json>

answers.json is {"1": "gone down", "2": "got out", ...}; an empty string is a
blank. A slash lets him offer alternatives — "showed up / turned up" — and any
one of them counts.

Three verdicts, and the middle one is the important one:

  exact    the target verb, in any inflection, object allowed between the halves
  synonym  a different real phrasal verb that fits. Scores nothing and MOVES
           nothing: no credit, because this card's verb was not produced; no
           penalty, because the question failed to single it out. Add it to the
           target's accepts list afterwards so it is recognised next time.
  wrong    a miss

Accuracy is exact over decidable — synonyms are excluded from the denominator
rather than counted against him.
"""
import json, re, sys, importlib.util

spec = importlib.util.spec_from_file_location("rnd", "src/round.py")
src = open('src/round.py').read().split("is_dragon =")[0]
ns = {}
exec(src.replace('SIZE = int(sys.argv[1]) if len(sys.argv) > 1 else 30', 'SIZE=30')
        .replace("TODAY = datetime.date.today()", "TODAY=None"), ns)
forms = ns['forms']

rnd = sys.argv[1]
answers = json.load(open(sys.argv[2]))
plan = json.load(open(f'/tmp/round{rnd}.json'))
Q = {q['n']: q for q in plan['questions']}
d = json.load(open('data/phrasal-verbs-data.json'))
byid = {v['id']: v for v in d['verbs']}

def norm(s):
    return re.sub(r'\s+', ' ', re.sub(r"[^a-z\s']", ' ', s.lower())).strip()

def same(given, phrasal):
    """same verb, any inflection, an object allowed between the two halves,
    and a trailing article forgiven"""
    g = norm(given)
    p = phrasal.split()
    if not g:
        return False
    if g == norm(phrasal):
        return True
    tail = r"\s+".join(re.escape(x) for x in p[1:])
    # a trailing preposition is the same verb — "followed up ON her interview"
    rx = re.compile(r"^(" + "|".join(forms(p[0])) + r")\b((?:\s+[\w']+){0,3}?)\s+" + tail
                    + r"(\s+the|\s+a|\s+on|\s+to|\s+with|\s+of|\s+for|\s+from)?$")
    return bool(rx.match(g))

rows = []
for n in sorted(Q):
    q = Q[n]
    v = byid[q['id']]
    raw = answers.get(str(n), answers.get(n, "")) or ""
    opts = [o.strip() for o in raw.split('/') if o.strip()]
    verdict, matched = 'wrong', None
    if not opts:
        verdict = 'blank'
    else:
        for o in opts:
            if same(o, v['phrasal']):
                verdict, matched = 'exact', o
                break
        # a twin is fully interchangeable in this sense — producing it is the
        # skill the card teaches, so it scores and the card advances
        if verdict == 'wrong':
            for o in opts:
                for tw in (v.get('twins') or []):
                    if same(o, tw):
                        verdict, matched = 'exact', tw
                        break
                if matched:
                    break
        if verdict == 'wrong':
            for o in opts:
                for alt in (v.get('accepts', []) + v.get('sharedPrompt', [])):
                    if same(o, alt):
                        verdict, matched = 'synonym', alt
                        break
                if matched:
                    break
    rows.append({"n": n, "id": v['id'], "phrasal": v['phrasal'], "formal": v['formal'],
                 "verdict": verdict, "answer": raw, "matched": matched,
                 "exampleIdx": q.get('exampleIdx'), "example": q.get('example')})

ex = [r for r in rows if r['verdict'] == 'exact']
sy = [r for r in rows if r['verdict'] == 'synonym']
wr = [r for r in rows if r['verdict'] in ('wrong', 'blank')]
dec = len(ex) + len(wr)
print(f"exact {len(ex)} · synonym {len(sy)} (no movement) · miss {len(wr)}"
      f"  →  {len(ex)}/{dec} = {round(len(ex)/dec*100) if dec else 0}%\n")
if sy:
    print("could not be decided by the question:")
    for r in sy:
        print(f"  {r['n']:>2}. {r['answer']:<22} target {r['phrasal']}")
if wr:
    print("misses:")
    for r in wr:
        print(f"  {r['n']:>2}. {r['answer'] or 'nothing':<22} target {r['phrasal']:<14} ({r['formal']})")

out = f'/tmp/graded{rnd}.json'
json.dump(rows, open(out, 'w'), indent=1)
print(f"\nsaved {out}")
