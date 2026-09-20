#!/usr/bin/env python3
"""
Builds the trainer from the template.

  index.html          dist/particle-verbs.html

practice.js is inlined before logic.js on purpose: logic.js ends by rendering
the first view, and the practice constants must already exist by then.

dist/ is the same page with the document wrapper stripped, for publishing.
Run from the folder root:  python3 src/build.py
"""
import json, re, os

LINKS = json.load(open('data/links.json')) if os.path.exists('data/links.json') else {}

def theme_mirror(html):
    """The dark palette is written once against [data-theme="dark"]. Mirror it
    into a prefers-color-scheme block so the page is right before scripts run
    and a host that stamps the attribute still wins both ways."""
    m = re.search(r'\[data-theme="dark"\]\{(.*?)\n\}', html, re.S)
    if not m:
        raise SystemExit('could not find the dark token block')
    return (html[:m.end()]
            + '\n@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){'
            + m.group(1) + '\n}}\n' + html[m.end():])

def emit(seed, out_html, out_artifact, other_url, title):
    data = json.dumps(seed, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    html = open('src/template.html', encoding='utf-8').read()
    html = html.replace('/*__DATA__*/null/*__END__*/', data) \
               .replace('/*__LOGIC__*/', open('src/practice.js', encoding='utf-8').read()
                                        + '\n' + open('src/logic.js', encoding='utf-8').read()) \
               .replace('__OTHER_URL__', other_url or '')
    # the publishing host reads the static <title>, not what the script sets later
    html = re.sub(r'<title>.*?</title>', '<title>' + title + '</title>', html, count=1, flags=re.S)
    assert '__DATA__' not in html and '__LOGIC__' not in html
    html = theme_mirror(html)
    open(out_html, 'w', encoding='utf-8').write(html)

    title = re.search(r'<title>(.*?)</title>', html, re.S).group(1)
    style = re.search(r'<style>.*?</style>', html, re.S).group(0)
    body  = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
    os.makedirs('dist', exist_ok=True)
    open(out_artifact, 'w', encoding='utf-8').write(f'<title>{title}</title>\n{style}\n{body}\n')
    return len(html)

# ── deck 1: phrasal verbs ────────────────────────────────────────────────
pv = json.load(open('data/phrasal-verbs-data.json'))
pr = json.load(open('data/progress-data.json'))
for v in pv['verbs']:
    v.pop('source', None)
    # the page runs the rounds now, so it carries every sentence: the practice
    # view rotates through them the way round.py does
seed_verbs = {"kind": "verbs", "lastUpdated": pv["lastUpdated"], "settings": pv["settings"],
              "verbs": pv["verbs"], "stats": pv["stats"],
              "boxDistribution": pv["boxDistribution"],
              "currentStreak": pv.get("currentStreak", 0),
              "sessionHistory": pr["sessionHistory"]}

a = emit(seed_verbs, 'index.html', 'dist/particle-verbs.html', '',
         'Particle — phrasal verbs on Leitner boxes')
print(f"index.html    {a//1024:>4}KB · {len(seed_verbs['verbs'])} verbs · snapshot {seed_verbs['lastUpdated']}")
