#!/usr/bin/env python3
"""
Applies a graded round to the data and logs it.

  python3 src/apply.py /tmp/graded130.json "note text"

Exact target -> box + 1 (Box 5 finishes the verb: retired, never asked again)
Synonym      -> nothing moves. Naming a different verb does NOT advance this
                card: the goal is to know both of them, and a card that climbs
                on an answer its own verb never got would retire as "mastered"
                while that verb was never once produced. It also does not cost
                anything, because the question failed to single one out.
Miss         -> box - 1, never below 0

That last rule is the point. If the hint and the sentence fit more than one real
phrasal verb, the question cannot single one out, and answering it with a
different correct verb is a fault in the question, not in the answer. It does
not earn the box and it does not cost it; the distinction gets explained
instead. Scored accuracy counts exact targets over the questions that were
actually decidable.
"""
import json, sys, datetime, collections

graded = json.load(open(sys.argv[1]))
note_extra = sys.argv[2] if len(sys.argv) > 2 else ""
TODAY = datetime.date.today()
today = str(TODAY)

d = json.load(open('data/phrasal-verbs-data.json'))
pr = json.load(open('data/progress-data.json'))
by_id = {v['id']: v for v in d['verbs']}
IV = d['settings']['boxIntervals']
FINAL = d['settings'].get('masteredIsFinal', True)

moves, neutral = [], []
for r in graded:
    v = by_id[r['id']]
    if r.get('exampleIdx') is not None:          # remember which sentence was asked
        u = v.setdefault('exampleUses', [0] * len(v.get('examples', [v['example']])))
        while len(u) <= r['exampleIdx']: u.append(0)
        u[r['exampleIdx']] += 1
    ok = r['verdict'] == 'exact'
    if r['verdict'] == 'synonym':
        neutral.append(v['phrasal'])          # the question could not decide; leave the card alone
        continue
    frm = v['box']
    v['lastReview'] = today
    if ok:
        v['box'] = min(5, v['box'] + 1)
        v['correctCount'] = v.get('correctCount', 0) + 1
        v['consecutiveMisses'] = 0
    else:
        v['box'] = max(0, v['box'] - 1)
        v['wrongCount'] = v.get('wrongCount', 0) + 1
        v['consecutiveMisses'] = (v.get('consecutiveMisses') or 0) + 1
        v.pop('retired', None)
    if ok and v['box'] == 5 and FINAL:
        v['retired'] = True
        v['nextReview'] = None
    else:
        v['nextReview'] = str(TODAY + datetime.timedelta(days=IV[v['box']]))
    moves.append((v['phrasal'], frm, v['box'], ok, bool(v.get('retired'))))

correct = sum(1 for r in graded if r['verdict'] == 'exact')
n = len(graded)
decidable = n - len(neutral)
rnd = (d['stats'].get('totalSessions') or 0) + 1
missed = [r['phrasal'] for r in graded if r['verdict'] not in ('exact', 'synonym')]
note = (f"S{rnd}. {n}-verb round, all due reviews. {correct} exact-target"
        + (f" + {len(neutral)} valid-synonym (not scored, boxes untouched)" if neutral else "")
        + (". Missed: " + ", ".join(missed) + "." if missed else ". Clean round.")
        + (" " + note_extra if note_extra else ""))

pr['sessionHistory'].append({"session": rnd, "date": today, "questions": decidable,
                             "correct": correct, "pct": round(correct / decidable * 100) if decidable else 0,
                             "note": note})
pr['totalSessions'] = rnd
pr['lastUpdated'] = today + "T00:00"
tq = sum(x.get('questions', 0) for x in pr['sessionHistory'])
tc = sum(x.get('correct', 0) for x in pr['sessionHistory'])
pr['stats'] = {"totalQuestions": tq, "overallAccuracy": round(tc / tq * 100), "currentStreak": d.get('currentStreak', 0)}
pr['boxes'] = {"0": [v['phrasal'] for v in d['verbs'] if v['box'] == 0],
               "5": [v['phrasal'] for v in d['verbs'] if v['box'] == 5]}

# streak: consecutive calendar days with a round
prev = pr['sessionHistory'][-2]['date'] if len(pr['sessionHistory']) > 1 else None
if prev == today:
    pass
elif prev == str(TODAY - datetime.timedelta(days=1)):
    d['currentStreak'] = (d.get('currentStreak') or 0) + 1
else:
    d['currentStreak'] = 1

dist = collections.Counter(v['box'] for v in d['verbs'])
box = {str(b): dist.get(b, 0) for b in range(6)}
st = d['stats']
st.update({"totalSessions": rnd, "currentStreak": d['currentStreak'],
           "totalQuestions": st.get('totalQuestions', 0) + decidable,
           "totalCorrect": st.get('totalCorrect', 0) + correct,
           "lastSession": today, "totalVerbs": len(d['verbs']),
           "mastered": dist.get(5, 0), "inProgress": sum(dist.get(b, 0) for b in (1, 2, 3, 4)),
           "notStarted": dist.get(0, 0), "boxDistribution": box,
           "bestStreak": max(st.get('bestStreak', 0), d['currentStreak']),
           "sessionsLogged": len(pr['sessionHistory']),
           "questionsFromLog": tq, "correctFromLog": tc})
d['boxDistribution'] = box
d['lastUpdated'] = today

json.dump(d, open('data/phrasal-verbs-data.json', 'w'), ensure_ascii=False, indent=2)
json.dump(pr, open('data/progress-data.json', 'w'), ensure_ascii=False, indent=2)

print(f"round {rnd}: {correct}/{decidable} = {round(correct/decidable*100) if decidable else 0}%"
      + (f"   ({len(neutral)} of {n} could not be decided by the question)" if neutral else ""))
print("\nup:")
for p, a, b, ok, ret in moves:
    if ok: print(f"   {p:<16} box {a} → {b}" + ("   FINISHED" if ret else ""))
print("down:")
for p, a, b, ok, ret in moves:
    if not ok: print(f"   {p:<16} box {a} → {b}")
if neutral:
    print("unchanged — the question fit more than one verb:")
    for p in neutral: print(f"   {p}")
print(f"\nboxes now {box} · due tomorrow onwards recalculated · streak {d['currentStreak']}")
