#!/usr/bin/env python3
"""
Builds the next round from data/phrasal-verbs-data.json, in Ivaylo's order:

  1. ten dragons (missed twice or more) lead every round
  2. then due reviews — a box that actually expired
  3. then Box 0 to fill the round up
  4. never only Box 0

Writes the plan to /tmp/round<N>.json and prints it.

    python3 src/round.py [size]
"""
import json, re, sys, datetime

SIZE = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 30
TODAY = datetime.date.today()
d = json.load(open('data/phrasal-verbs-data.json'))

IRREG = {"beat":["beat","beats","beating","beaten"],"bite":["bite","bites","biting","bit","bitten"],"fight":["fight","fights","fighting","fought"],"have":["have","has","having","had"],"lie":["lie","lies","lying","lay","lain"],"light":["light","lights","lighting","lit","lighted"],"sneak":["sneak","sneaks","sneaking","snuck","sneaked"],"tear":["tear","tears","tearing","tore","torn"],"lead":["lead","leads","leading","led"],"wind":["wind","winds","winding","wound"],"go":["go","goes","going","went","gone"],"come":["come","comes","coming","came"],
"take":["take","takes","taking","took","taken"],"give":["give","gives","giving","gave","given"],
"get":["get","gets","getting","got","gotten"],"make":["make","makes","making","made"],
"put":["put","puts","putting"],"find":["find","finds","finding","found"],
"bring":["bring","brings","bringing","brought"],"break":["break","breaks","breaking","broke","broken"],
"hold":["hold","holds","holding","held"],"run":["run","runs","running","ran"],
"sit":["sit","sits","sitting","sat"],"stand":["stand","stands","standing","stood"],
"wake":["wake","wakes","waking","woke","woken"],"hang":["hang","hangs","hanging","hung"],
"cut":["cut","cuts","cutting"],"let":["let","lets","letting"],"keep":["keep","keeps","keeping","kept"],
"pay":["pay","pays","paying","paid"],"set":["set","sets","setting"],
"throw":["throw","throws","throwing","threw","thrown"],"grow":["grow","grows","growing","grew","grown"],
"lay":["lay","lays","laying","laid"],"leave":["leave","leaves","leaving","left"],
"think":["think","thinks","thinking","thought"],"write":["write","writes","writing","wrote","written"],
"fall":["fall","falls","falling","fell","fallen"],"eat":["eat","eats","eating","ate","eaten"],
"catch":["catch","catches","catching","caught"],"deal":["deal","deals","dealing","dealt"],
"draw":["draw","draws","drawing","drew","drawn"],"blow":["blow","blows","blowing","blew","blown"],
"build":["build","builds","building","built"],"buy":["buy","buys","buying","bought"],
"feel":["feel","feels","feeling","felt"],"hear":["hear","hears","hearing","heard"],
"lose":["lose","loses","losing","lost"],"meet":["meet","meets","meeting","met"],
"read":["read","reads","reading"],"sell":["sell","sells","selling","sold"],
"send":["send","sends","sending","sent"],"speak":["speak","speaks","speaking","spoke","spoken"],
"spend":["spend","spends","spending","spent"],"stick":["stick","sticks","sticking","stuck"],
"tell":["tell","tells","telling","told"],"wear":["wear","wears","wearing","wore","worn"],
"win":["win","wins","winning","won"],"do":["do","does","doing","did","done"],
"see":["see","sees","seeing","saw","seen"],"know":["know","knows","knowing","knew","known"],"drink":["drink","drinks","drinking","drank","drunk"],"drive":["drive","drives","driving","drove","driven"],"ride":["ride","rides","riding","rode","ridden"],"rise":["rise","rises","rising","rose","risen"],"shake":["shake","shakes","shaking","shook","shaken"],"sing":["sing","sings","singing","sang","sung"],"sleep":["sleep","sleeps","sleeping","slept"],"swear":["swear","swears","swearing","swore","sworn"],"teach":["teach","teaches","teaching","taught"],"tear":["tear","tears","tearing","tore","torn"],"understand":["understand","understands","understanding","understood"],"freeze":["freeze","freezes","freezing","froze","frozen"],"choose":["choose","chooses","choosing","chose","chosen"],"forget":["forget","forgets","forgetting","forgot","forgotten"],"hide":["hide","hides","hiding","hid","hidden"],"strike":["strike","strikes","striking","struck"],"swing":["swing","swings","swinging","swung"],"dig":["dig","digs","digging","dug"],"feed":["feed","feeds","feeding","fed"],"flee":["flee","flees","fleeing","fled"],"shoot":["shoot","shoots","shooting","shot"],"shut":["shut","shuts","shutting"],"split":["split","splits","splitting"],"spread":["spread","spreads","spreading"],"quit":["quit","quits","quitting"],"burst":["burst","bursts","bursting"],"stumble":["stumble","stumbles","stumbling","stumbled"]}

def forms(v):
    if v in IRREG:
        out = list(IRREG[v])
    else:
        # -s becomes -es after a sibilant, so "piss" gives "pisses", not "pisss"
        third = v+"es" if re.search(r'(s|sh|ch|x|z|o)$', v) else v+"s"
        out = [v, third, v+"ed"]
        if v.endswith("e"):
            out += [v[:-1]+"ing", v+"d"]
        elif re.search(r'[^aeiou]y$', v):
            out += [v[:-1]+"ied", v[:-1]+"ies", v+"ing"]
        else:
            out += [v+"ing", v+v[-1]+"ing", v+v[-1]+"ed"]
    return sorted(set(out), key=len, reverse=True)

def gap(text, phrasal):
    """Blank the verb out of its example. A split verb keeps its object between
    two blanks — 'run this idea by you' becomes '___ this idea ___ you' — so the
    sentence still reads and the word order is part of the question."""
    parts = phrasal.split()
    tail = r"\s+".join(re.escape(p) for p in parts[1:])
    rx = re.compile(r"\b(" + "|".join(forms(parts[0])) + r")\b((?:\s+[\w']+){0,3}?)\s+(" + tail + r")\b", re.I)
    m = rx.search(text)
    if not m:
        return None, False
    mid = (m.group(2) or "").strip()
    rep = "___ " + mid + " ___" if mid else "___"
    return text[:m.start()] + rep + text[m.end():], bool(mid)

is_dragon = lambda v: v.get('wrongCount', 0) >= 2 or (v.get('consecutiveMisses') or 0) >= 2
# a verb's corpus rank in the 150 most frequent phrasal verbs; everything else
# sorts behind them. This is what points the effort at sounding native rather
# than at whatever happens to be oldest.
rank = lambda v: v.get('phave', 9999)

due = [v for v in d['verbs']
       if v.get('nextReview') and not v.get('retired')
       and datetime.date.fromisoformat(v['nextReview'][:10]) <= TODAY]
dragons = [v for v in due if is_dragon(v)]
pool = [v for v in due if not is_dragon(v)]
reviews = sorted([v for v in pool if v['box'] >= 1], key=lambda v: (v['nextReview'], rank(v)))
relearn = sorted([v for v in pool if v['box'] == 0], key=lambda v: (rank(v), v['nextReview']))
# never touched at all — these carry no review date, so they were unreachable
# before. Introduced most-frequent-first.
unseen = sorted([v for v in d['verbs'] if not v.get('lastReview') and not v.get('retired')],
                key=lambda v: (rank(v), v['id']))

# Ivaylo, 13.09.2026: dragons are no longer held back for a round of their own.
# That rule froze 87 verbs — 27 of them in the corpus top 150 — and starved the
# ordinary rounds, which were coming out with one core verb in thirty. Ten
# dragons now lead every round and the usual queue fills the rest.
DRAGON_SHARE = 10
lead = sorted(dragons, key=lambda v: (-v.get('wrongCount', 0), rank(v)))[:DRAGON_SHARE]
seen = {id(x) for x in lead}
rest = [v for v in (reviews + relearn + unseen) if id(v) not in seen]
# if fewer than ten dragons are due, the ordinary queue simply takes the room
main = (lead + rest)[:SIZE]
if all(v['box'] == 0 for v in main) and reviews:
    raise SystemExit('rule 4 violated: the round is all Box 0 while reviews are waiting')

rnd = (d['stats'].get('totalSessions') or 0) + 1
def context_words(v, e):
    g = gap(e, v['phrasal'])[0] or e
    return len(re.findall(r"[\w']+", g.replace('___', ' ')))

def pick_example(v):
    """Rotate through a verb's sentences so a repeat is never asked on the
    sentence it was learned from — otherwise you recognise the sentence
    instead of recalling the verb.

    Prefer sentences with enough context to force one answer. The deck's
    original examples are mostly four or five words ("___ the car"), which fit
    half a dozen verbs; a card that has a proper sentence should never be asked
    on the thin one."""
    exs = v.get('examples') or [v['example']]
    # a sentence the blanker cannot handle — an object longer than the regex
    # window — would be printed whole, verb and all. Never offer one.
    ok = [i for i, e in enumerate(exs) if gap(e, v['phrasal'])[0] is not None]
    if ok and len(ok) < len(exs):
        exs = [exs[i] for i in ok]
        v = dict(v, exampleUses=[(v.get('exampleUses') or [0] * len(ok))[i]
                                 if i < len(v.get('exampleUses') or []) else 0 for i in ok])
    uses = (v.get('exampleUses') or [0] * len(exs))[:]
    while len(uses) < len(exs):
        uses.append(0)
    rich = [i for i, e in enumerate(exs) if context_words(v, e) >= 6]
    pool = rich or list(range(len(exs)))
    idx = min(pool, key=lambda i: (uses[i], -len(exs[i])))
    return idx, exs[idx]

deck_names = {' '.join(x['phrasal'].lower().split()) for x in d['verbs']}

def cue(v):
    """When a card has a real synonym in the deck, the meaning alone cannot pick
    one of them — so say which one is wanted. Both verbs still have to be learned
    separately, which is the point; the cue only stops the question being a
    coin toss."""
    # every accepted alternative can turn the question into a coin toss, whether
    # or not it is a card of its own — "clog up" is not in the deck but it is a
    # perfectly good answer, and without a cue "plug up" could never advance.
    # twins do not need a cue: either answer is correct, so there is nothing to
    # single out. Only a merely-acceptable alternative — one that would score
    # nothing — makes the question a coin toss worth breaking.
    alts = [a for a in (v.get('accepts') or []) if len(a.split()) > 1]
    if not alts:
        return ''
    first = v['phrasal'].split()[0]
    # one letter only discriminates if no linked synonym shares it — "starts
    # with b" cannot choose between blow off and brush off. Widen the cue until
    # it actually excludes them.
    rivals = [a.split()[0] for a in alts]
    n = 1
    while n <= len(first) and any(r[:n].lower() == first[:n].lower() for r in rivals):
        n += 1
    # a rival with the SAME first verb — pick out against pick up — cannot be
    # excluded by any prefix short of the particle itself, and naming the
    # particle names the answer. Say nothing: the synonym rule already means a
    # rival answer costs him nothing.
    return f" · starts with “{first[:n]}”" if n <= len(first) else ''

qs = []
for i, v in enumerate(main, 1):
    idx, ex = pick_example(v)
    g, split = gap(ex, v['phrasal'])
    if g is None:
        g, split = ex.replace(v['phrasal'], '___'), False
    qs.append({"n": i, "id": v['id'], "phrasal": v['phrasal'], "formal": v['formal'] + cue(v),
               "gap": g, "box": v['box'], "split": split, "exampleIdx": idx, "example": ex,
               "shared": v.get('sharedPrompt', []), "wrong": v.get('wrongCount', 0)})

plan = {"date": str(TODAY), "round": rnd, "questions": qs,
        "dragons": [{"id": x['id'], "phrasal": x['phrasal'], "formal": x['formal'],
                     "gap": (gap(x['example'], x['phrasal'])[0] or x['example']),
                     "wrong": x.get('wrongCount', 0), "box": x['box']} for x in dragons]}
# a round already handed to Ivaylo must not be quietly replaced under him —
# regenerating overwrote round 162 while he was answering it
import os as _os
if _os.path.exists(f'rounds/round{rnd}.json') and '--force' not in sys.argv:
    raise SystemExit(f'round {rnd} already exists in rounds/ — it has been sent. '
                     f'Apply it first, or pass --force to rebuild it deliberately.')

path = f'/tmp/round{rnd}.json'
json.dump(plan, open(path, 'w'), ensure_ascii=False, indent=1)
# /tmp gets swept, and a swept round is a round whose sentences can silently
# come back. Keep a copy in the repo so the history is permanent.
import os
os.makedirs('rounds', exist_ok=True)
json.dump(plan, open(f'rounds/round{rnd}.json', 'w'), ensure_ascii=False, indent=1)

# a sentence already used is a sentence he may recognise instead of recall —
# say so loudly rather than letting it pass
# a four-word frame — "___ his word" — fits a dozen verbs. round.py already
# prefers a richer sentence when the card has one; this says out loud when the
# card has nothing better.
thin = [(q['n'], q['phrasal']) for q in qs
        if len(re.findall(r"[\w']+", q['gap'].replace('___', ' '))) < 7]
if thin:
    print('TOO THIN TO DECIDE — the card has no proper sentence: '
          + ', '.join(f"{n} {p}" for n, p in thin) + '\n')

# a sentence that still contains the verb's own stem hands over the answer —
# "Con artists ___ my neighbour ___ his savings" answers itself
leaks = [(q['n'], q['phrasal']) for q in qs
         if re.search(r'\b(' + '|'.join(forms(q['phrasal'].split()[0])) + r')\b',
                      q['gap'], re.I)]
if leaks:
    print('THE SENTENCE GIVES THE VERB AWAY: '
          + ', '.join(f"{n} {p}" for n, p in leaks) + '\n')

recycled = [(q['n'], q['phrasal']) for q, v in zip(qs, main)
            if (v.get('exampleUses') or [0])[q['exampleIdx']:q['exampleIdx']+1] not in ([0], [])]
if recycled:
    print('RECYCLED SENTENCES — write a fresh one for each: '
          + ', '.join(f"{n} {p}" for n, p in recycled) + '\n')

nrev = sum(1 for v in main if v['box'] >= 1)
ncore = sum(1 for v in main if v.get('phave'))
print(f"round {rnd} · {len(due)} due · {len(unseen)} never seen · "
      + f"{len(dragons)} dragons due, {len(lead)} leading this round")
print(f"{len(main)} questions: {nrev} reviews + {len(main)-nrev} from Box 0 · "
      f"{ncore} are in the corpus top 150\n")
# the sentence first, the hint in brackets after it — the way Ivaylo reads them
for q in qs:
    print(f"{q['n']}. {q['gap']}  ({q['formal']})")
print(f"\nsaved {path}")
