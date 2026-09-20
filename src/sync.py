#!/usr/bin/env python3
"""
Качва прогреса в GitHub след рунд.

    python3 src/sync.py                 # съобщението е последният рунд
    python3 src/sync.py "какво смених"  # или свое съобщение

GitHub е единственото място, където прогресът живее. Лаптопът и облакът не
се виждат помежду си — и двата минават оттам: `git pull --ff-only` преди
рунда, `sync.py` след него. Пропусне ли се, изведнъж има две копия и никой
не знае кое е по-новото.

Качва винаги в `main`, откъдето и да е пуснат: облачната сесия работи в свой
клон, а прогресът трябва да стигне там, откъдето лаптопът дърпа.
"""
import json, subprocess, sys


def git(*args, check=True):
    r = subprocess.run(['git', *args], capture_output=True, text=True)
    if check and r.returncode:
        sys.exit(f"git {' '.join(args)} се провали:\n{r.stderr.strip()}")
    return r


# без име и поща git отказва да комитва, а в облака не са зададени
ident = []
if not git('config', 'user.email', check=False).stdout.strip():
    ident = ['-c', 'user.name=koshuta007',
             '-c', 'user.email=koshuta007@users.noreply.github.com']

git('add', '-A')
if git('status', '--porcelain').stdout.strip():
    if len(sys.argv) > 1 and sys.argv[1].strip():
        msg = sys.argv[1]
    else:
        hist = json.load(open('data/progress-data.json'))['sessionHistory']
        last = hist[-1] if hist else None
        msg = (f"Рунд {last['session']} — {last['correct']}/{last['questions']} = {last['pct']}%"
               if last else "Промени по тестето")
    git(*ident, 'commit', '-q', '-m', msg)

# комит без качване (предишен провал на мрежата) също трябва да замине
ahead = int(git('rev-list', '--count', 'origin/main..HEAD').stdout.strip() or 0)
if not ahead:
    print('нищо за качване — GitHub вече има всичко')
    sys.exit(0)

r = git('push', '-q', 'origin', 'HEAD:main', check=False)
if r.returncode:
    if not any(k in r.stderr for k in ('rejected', 'fetch first', 'non-fast-forward')):
        branch = git('rev-parse', '--abbrev-ref', 'HEAD').stdout.strip()
        if branch in ('main', 'HEAD'):
            sys.exit(f"git push се провали:\n{r.stderr.strip()}")
        # облакът може да откаже директно качване в main — тогава поне клонът
        # на сесията да замине, за да не се загуби рундът с изтичането на машината
        git('push', '-q', '-u', 'origin', branch)
        sys.exit(f"main отказа качването:\n{r.stderr.strip()}\n\n"
                 f"Рундът е качен в клона `{branch}` вместо в main. Кажи на Клод на\n"
                 f"лаптопа да го слее — дотогава телефонът и лаптопът са разминати.")
    # другото устройство е качило междувременно — вземи неговото, сложи
    # своето отгоре и пробвай пак
    r = git('pull', '--rebase', '-q', 'origin', 'main', check=False)
    if r.returncode:
        ab = git('rebase', '--abort', check=False)
        if ab.returncode == 0:
            sys.exit("КОНФЛИКТ: същите данни са променени и на друго място.\n"
                     "Рундът е записан локално, но не е качен. Не пипай данните —\n"
                     "кажи на Клод какво виждаш, за да се реши кое копие е вярното.")
        sys.exit(f"git pull --rebase се провали:\n{r.stderr.strip()}")
    git('push', '-q', 'origin', 'HEAD:main')

subj = git('log', '-1', '--format=%s').stdout.strip()
print(f"качено в GitHub (main): {subj}")
