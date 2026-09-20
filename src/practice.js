/* ═══════════════════════════════════════════════════════════════════════
   PRACTICE — the round runs on this page, so a phone with no laptop will do.

   Three exercise shapes, mixed at random with weights that follow the box:
   the low boxes lean on recognition (four verbs, or the particle alone), the
   high boxes on recall (typing), and the last step into Box 5 is always
   typed — a verb that was only ever recognised must not retire as mastered.
   Every shape asks for the verb; none shows the verb and asks for its meaning.

   Inlined BEFORE logic.js by build.py: logic.js ends with init(), which
   renders the first view, and the constants below would not exist yet if
   this file came after it (function declarations hoist, const does not).
   Everything from logic.js is only touched inside functions, at call time.
   ═══════════════════════════════════════════════════════════════════════ */
const PROG=["box","lastReview","nextReview","correctCount","wrongCount","consecutiveMisses","retired","exampleUses"];
const TYPES={mcq:"Избери глагола",particle:"Коя частица?",type:"Напиши глагола"};
const PR={summary:null};                       /* the last round's summary — this visit only */
const escRe=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const baseOf=v=>v.phrasal.split(" ")[0];
const tailOf=v=>v.phrasal.split(" ").slice(1).join(" ");
const isDragon=v=>(v.wrongCount||0)>=2||(v.consecutiveMisses||0)>=2;
const rankOr=v=>v.phave||9999;
const addDays=(d,n)=>iso(new Date(d.getTime()+n*DAY));

/* blank the verb out of its sentence; a split verb keeps its object between
   two blanks — "___ the children ___" — the port of round.py's gap() */
function gapSentence(text,phrasal){
  const p=phrasal.split(" ");
  const tail=p.slice(1).map(escRe).join("\\s+");
  const rx=new RegExp("\\b("+verbForms(p[0]).map(escRe).join("|")+")\\b((?:\\s+[\\w']+){0,3}?)\\s+("+tail+")\\b","i");
  const m=rx.exec(text);
  if(!m)return null;
  return {before:text.slice(0,m.index),verb:m[1],mid:(m[2]||"").trim(),tail:m[3],after:text.slice(m.index+m[0].length)};
}
const ctxWords=g=>((g.before+" "+g.mid+" "+g.after).match(/[\w']+/g)||[]).length;

/* rotate through the card's sentences — the richest, least-used one first, so
   a repeat is not asked on the sentence it was learned from */
function pickExample(v){
  const exs=(v.examples&&v.examples.length)?v.examples:[v.example];
  const uses=v.exampleUses||[];
  const c=exs.map((e,i)=>({i,e,g:gapSentence(e,v.phrasal),u:uses[i]||0})).filter(x=>x.g);
  if(!c.length)return {i:0,e:exs[0],g:null,u:0};
  const rich=c.filter(x=>ctxWords(x.g)>=6);
  return (rich.length?rich:c).sort((a,b)=>a.u-b.u||b.e.length-a.e.length)[0];
}

/* the same verb in any inflection, an object allowed between the two halves
   and a trailing preposition forgiven — grade.py's same() */
function sameVerb(given,phrasal){
  const g=norm(given);if(!g)return false;
  if(g===norm(phrasal))return true;
  const p=phrasal.split(" ");
  const tail=p.slice(1).map(escRe).join("\\s+");
  const rx=new RegExp("^("+verbForms(p[0]).map(escRe).join("|")+")\\b((?:\\s+[\\w']+){0,3}?)\\s+"+tail+"(\\s+the|\\s+a|\\s+on|\\s+to|\\s+with|\\s+of|\\s+for|\\s+from)?$");
  return rx.test(g);
}

/* "starts with p" when the deck holds a real synonym, so a typed question is
   not a coin toss — round.py's cue() */
function cue(v){
  const alts=(v.accepts||[]).filter(a=>a.split(" ").length>1);
  if(!alts.length)return "";
  const first=baseOf(v).toLowerCase(),rivals=alts.map(a=>a.split(" ")[0].toLowerCase());
  let n=1;
  while(n<=first.length&&rivals.some(r=>r.slice(0,n)===first.slice(0,n)))n++;
  return n<=first.length?" · starts with “"+first.slice(0,n)+"”":"";
}

function chooseType(v){
  const b=v.box;
  const w=!v.lastReview?{mcq:65,particle:35,type:0}
    :b===0?{mcq:55,particle:30,type:15}
    :b===1?{mcq:55,particle:20,type:25}
    :b===2?{mcq:40,particle:10,type:50}
    :b===3?{mcq:25,particle:0,type:75}
    :{mcq:0,particle:0,type:100};
  let r=Math.random()*100;
  for(const k in w){r-=w[k];if(r<0)return k;}
  return "type";
}

/* three wrong answers that are hard to wave away: the same verb with another
   particle first, then the same particle on another verb, then anything.
   A twin or an accepted synonym is a right answer, so it is never offered. */
function distractors(v,kind){
  const others=S.verbs.filter(o=>o.id!==v.id);
  const rel=new Set([v.phrasal,...(v.twins||[]),...(v.accepts||[]),...(v.sharedPrompt||[])].map(norm));
  const out=[],seen=new Set();
  const take=(list,key,bad)=>shuffle(list.slice()).forEach(o=>{
    if(out.length>=3)return;
    const k=key(o);if(!k)return;
    const nk=norm(k);if(!nk||seen.has(nk)||(bad&&bad(k)))return;
    seen.add(nk);out.push(k);
  });
  if(kind==="mcq"){
    const bad=k=>rel.has(norm(k));
    take(others.filter(o=>baseOf(o)===baseOf(v)),o=>o.phrasal,bad);
    take(others.filter(o=>tailOf(o)===tailOf(v)),o=>o.phrasal,bad);
    take(others,o=>o.phrasal,bad);
  }else{
    seen.add(norm(tailOf(v)));
    const bad=k=>rel.has(norm(baseOf(v)+" "+k));
    take(others.filter(o=>baseOf(o)===baseOf(v)),o=>tailOf(o),bad);
    take(others,o=>tailOf(o),bad);
  }
  return out;
}

/* ten dragons lead, then due reviews, then relearning, then the most frequent
   unseen verbs — round.py's order */
function pickRound(size){
  const t=today();
  const due=S.verbs.filter(v=>isDue(v,t));
  const dragons=due.filter(isDragon).sort((a,b)=>(b.wrongCount||0)-(a.wrongCount||0)||rankOr(a)-rankOr(b)).slice(0,10);
  const pool=due.filter(v=>!isDragon(v));
  const reviews=pool.filter(v=>v.box>=1).sort((a,b)=>(a.nextReview<b.nextReview?-1:a.nextReview>b.nextReview?1:0)||rankOr(a)-rankOr(b));
  const relearn=pool.filter(v=>v.box===0).sort((a,b)=>rankOr(a)-rankOr(b));
  const unseen=S.verbs.filter(v=>!v.lastReview&&!v.retired).sort((a,b)=>rankOr(a)-rankOr(b)||a.id-b.id);
  const lead=new Set(dragons.map(v=>v.id));
  const rest=[...reviews,...relearn,...unseen].filter(v=>!lead.has(v.id));
  return [...dragons,...rest].slice(0,size).map(v=>v.id);
}

function makeQuestion(v){
  const ex=pickExample(v);
  let type=chooseType(v);
  if(!ex.g&&type==="particle")type="mcq";
  const q={id:v.id,type,exIdx:ex.i,ex:ex.e,answered:false};
  if(type!=="type"){
    q.right=type==="mcq"?v.phrasal:tailOf(v);
    q.options=shuffle([q.right,...distractors(v,type)]);
  }
  return q;
}

/* right moves up one box, wrong moves down one, a synonym moves nothing —
   apply.py's rule, including Box 5 as the finish line */
function applyVerdict(v,verdict,exIdx){
  if(exIdx!=null){const u=v.exampleUses||(v.exampleUses=[]);while(u.length<=exIdx)u.push(0);u[exIdx]++;}
  if(verdict==="syn")return null;
  const from=v.box,ok=verdict==="ok";
  v.lastReview=iso(today());
  if(ok){v.box=Math.min(5,v.box+1);v.correctCount=(v.correctCount||0)+1;v.consecutiveMisses=0;}
  else{v.box=Math.max(0,v.box-1);v.wrongCount=(v.wrongCount||0)+1;v.consecutiveMisses=(v.consecutiveMisses||0)+1;delete v.retired;}
  if(ok&&v.box===5&&finalAt5()){v.retired=true;v.nextReview=null;}
  else v.nextReview=addDays(today(),IV()[v.box]);
  return {from,to:v.box,retired:!!v.retired};
}

function startRound(){
  const ids=pickRound(S.prefs.roundSize||15);
  if(!ids.length){toast("Нищо за днес — всички глаголи са усвоени");return;}
  PR.summary=null;
  S.round={ids,i:0,results:[],q:null,started:iso(today())};
  save();renderPractice();
}

function answerQ(given){
  const R=S.round,q=R.q,v=byId(q.id);
  let verdict="no",matched=null;
  if(q.type==="type"){
    const opts=String(given||"").split("/").map(s=>s.trim()).filter(Boolean);
    const hit=list=>list.find(t=>opts.some(o=>sameVerb(o,t)))||null;
    if(opts.some(o=>sameVerb(o,v.phrasal)))verdict="ok";
    else if((matched=hit(v.twins||[])))verdict="ok";
    else if((matched=hit([...(v.accepts||[]),...(v.sharedPrompt||[])])))verdict=S.prefs.acceptSyn!==false?"syn":"no";
  }else verdict=given===q.right?"ok":"no";
  Object.assign(q,{answered:true,given:given||"",verdict,matched});
  q.move=applyVerdict(v,verdict,q.exIdx);
  R.results.push({id:v.id,type:q.type,verdict,given:q.given,matched,move:q.move,ex:q.ex});
  S.drilled=true;save();refreshChrome();renderPractice();
}

function nextQ(){
  const R=S.round;R.i++;R.q=null;
  if(R.i>=R.ids.length)finishRound();
  save();renderPractice();
}

/* the log entry and the running counters, the way apply.py writes them */
function finishRound(){
  const R=S.round,res=R.results,n=res.length;
  if(!n){S.round=null;return;}
  const st=S.stats||{};
  const correct=res.filter(r=>r.verdict==="ok").length,neutral=res.filter(r=>r.verdict==="syn").length;
  const dec=n-neutral,t=iso(today()),rnd=(st.totalSessions||0)+1;
  const missed=res.filter(r=>r.verdict==="no").map(r=>byId(r.id).phrasal);
  const note="S"+rnd+". "+n+"-verb round on the page. "+correct+" exact"
    +(neutral?" + "+neutral+" synonym (boxes untouched)":"")
    +(missed.length?". Missed: "+missed.join(", ")+".":". Clean round.");
  S.sessionHistory=S.sessionHistory||[];
  S.sessionHistory.push({session:rnd,date:t,questions:dec,correct,pct:dec?Math.round(correct/dec*100):0,note});
  const h=S.sessionHistory,prev=h.length>1?h[h.length-2].date:null;
  if(prev===t){}else if(prev===addDays(today(),-1))S.currentStreak=(S.currentStreak||0)+1;else S.currentStreak=1;
  const c=boxCounts(),box={};c.forEach((k,b)=>box[String(b)]=k);
  S.stats=Object.assign({},st,{totalSessions:rnd,currentStreak:S.currentStreak,
    totalQuestions:(st.totalQuestions||0)+dec,totalCorrect:(st.totalCorrect||0)+correct,
    lastSession:t,totalVerbs:S.verbs.length,mastered:c[5],inProgress:c[1]+c[2]+c[3]+c[4],notStarted:c[0],
    boxDistribution:box,bestStreak:Math.max(st.bestStreak||0,S.currentStreak),sessionsLogged:h.length});
  S.boxDistribution=box;S.lastUpdated=t;S.drilled=true;
  PR.summary={rnd,n,correct,neutral,dec,pct:dec?Math.round(correct/dec*100):0,results:res.slice(),
    finished:res.filter(r=>r.move&&r.move.retired).map(r=>byId(r.id).phrasal),mastered:c[5]};
  S.round=null;
}

function stopRound(){
  const R=S.round;if(!R)return;
  if(R.i<R.ids.length&&!confirm("Да спра рунда дотук? Отговореното се брои, останалото чака за друг път."))return;
  finishRound();save();refreshChrome();renderPractice();
}

/* Settings → Import: the two files Export wrote, on this or another device */
function importFiles(e){
  const files=[...e.target.files];if(!files.length)return;
  Promise.all(files.map(f=>f.text().then(t=>JSON.parse(t)))).then(objs=>{
    let n=0,hist=false;
    objs.forEach(o=>{
      if(!o||typeof o!=="object")return;
      if(Array.isArray(o.verbs)){
        const mine={};o.verbs.forEach(v=>{if(v&&v.id!=null)mine[v.id]=v;});
        S.verbs.forEach(v=>{const m=mine[v.id];if(!m)return;PROG.forEach(k=>{if(k in m)v[k]=m[k];else delete v[k];});n++;});
        if(o.stats)S.stats=Object.assign({},S.stats,o.stats);
        if(o.currentStreak!=null)S.currentStreak=o.currentStreak;
      }
      if(Array.isArray(o.sessionHistory)){S.sessionHistory=o.sessionHistory;hist=true;}
    });
    if(!n&&!hist)throw new Error("not an export");
    S.drilled=true;S.round=null;PR.summary=null;save();refreshChrome();renderView();
    toast("Прогресът е възстановен"+(n?" · "+n+" карти":""));
  }).catch(()=>toast("Това не са файловете от Export"));
  e.target.value="";
}

/* what her answer means, when it is a verb the deck knows — the "hold up
   means delay" half of the chat explanation. A chosen option always is; a
   typed answer only sometimes. */
function meaningOf(q,v){
  if(!q.given)return null;
  const g=q.type==="particle"?baseOf(v)+" "+q.given:q.given;
  const hit=S.verbs.find(o=>o.id!==v.id&&(norm(o.phrasal)===norm(g)||(q.type==="type"&&sameVerb(g,o.phrasal))));
  return hit?{label:hit.phrasal,formal:hit.formal}:null;
}
const youHTML=(q,v)=>{
  if(!q.given)return "";
  const m=meaningOf(q,v);
  return 'Ти: <b>'+esc(m?m.label:q.given)+'</b>'+(m?' — '+esc(m.formal):'')+'. ';
};

/* ---- rendering ---- */
const gapHTML=t=>'<span class="gap'+(t?' filled':'')+'">'+(t?esc(t):'&nbsp;')+'</span>';
function sentenceHTML(text,v,mode){        /* mode: gap | particle | full */
  const g=gapSentence(text,v.phrasal);
  if(!g){
    const i=text.toLowerCase().indexOf(v.phrasal.toLowerCase());
    if(i<0)return esc(text);
    const a=esc(text.slice(0,i)),b=esc(text.slice(i,i+v.phrasal.length)),c=esc(text.slice(i+v.phrasal.length));
    return mode==="full"?a+"<b>"+b+"</b>"+c:a+gapHTML("")+c;
  }
  const mid=g.mid?" "+esc(g.mid)+" ":" ";
  if(mode==="full")return esc(g.before)+"<b>"+esc(g.verb)+mid+esc(g.tail)+"</b>"+esc(g.after);
  if(mode==="particle")return esc(g.before)+esc(g.verb)+mid+gapHTML("")+esc(g.after);
  return esc(g.before)+gapHTML("")+(g.mid?" "+esc(g.mid)+" "+gapHTML(""):"")+esc(g.after);
}
function optionsHTML(q){
  return '<div class="opts">'+q.options.map((o,k)=>{
    const cls=!q.answered?"":o===q.right?" ok":o===q.given?" no":" dim";
    return '<button class="opt'+cls+'" data-k="'+k+'"'+(q.answered?' disabled':'')+'><span class="key">'+(k+1)+'</span><span>'
      +(q.type==="mcq"?pvHTML({phrasal:o}):esc(o))+'</span></button>';
  }).join("")+'</div>';
}
function moveHTML(m){
  if(!m||m.to===m.from)return "";           /* "0 → 0" says nothing */
  return '<span class="movement">'+(m.to>m.from?"▲":m.to<m.from?"▼":"•")+' кутия '+m.from+' → '+m.to+(m.retired?' · усвоен':'')+'</span>';
}
function questionHTML(R){
  const q=R.q,v=byId(q.id),n=R.ids.length,i=R.i;
  const label='<div class="prompt-label">'+TYPES[q.type]+'</div>';
  const hint='<div class="hint">'+esc(v.formal)+(q.type==="type"?esc(cue(v)):"")+'</div>';
  const mode=q.answered?"full":q.type==="particle"?"particle":"gap";
  const sent='<div class="sentence">'+sentenceHTML(q.ex,v,mode)+'</div>';
  const need=q.answered&&q.verdict==="no"&&(S.prefs.sideDrill||0)>0&&!q.drilled;
  let ctl="";
  if(!q.answered){
    ctl=q.type==="type"
      ?'<input class="answer" id="ans" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="глаголът">'
       +'<div class="drill-actions"><button class="btn btn-primary" id="checkBtn">Провери</button><button class="btn" id="skipBtn">Не знам</button></div>'
      :optionsHTML(q);
  }else{
    if(q.options)ctl+=optionsHTML(q);
    if(q.verdict==="ok")ctl+='<div class="verdict verdict-ok">'+ico("check",16)+'<span>Вярно.</span>'+moveHTML(q.move)+'</div>';
    else if(q.verdict==="syn")ctl+='<div class="verdict verdict-syn">'+ico("target",16)+'<span><b>'+esc(q.matched)+'</b> също пасва тук — но картата е за <b>'+esc(v.phrasal)+'</b>. Нищо не мърда.</span></div>';
    else{
      ctl+='<div class="verdict verdict-no">'+ico("x",16)+'<span>'+youHTML(q,v)+'Търсеше се <b>'+esc(v.phrasal)+'</b> — '+esc(v.formal)+'.</span>'+moveHTML(q.move)+'</div>';
      const more=(v.examples||[v.example]).filter(e=>e!==q.ex).slice(0,3);
      if(more.length)ctl+='<div class="mis-ex" style="max-width:520px;margin:0 auto;width:100%;text-align:left">'+more.map(e=>'<div>'+sentenceHTML(e,v,"full")+'</div>').join("")+'</div>';
      if(need)ctl+='<div class="prompt-label" style="margin-top:4px">Напиши го веднъж, за да остане</div>'
        +'<input class="answer" id="drill" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="'+esc(v.phrasal)+'">'
        +'<button class="btn" id="drillSkip" style="border:none;color:var(--ink-3);font-size:12px">пропусни</button>';
    }
    ctl+='<div class="drill-actions"><button class="btn btn-primary" id="nextBtn"'+(need?' disabled':'')+'>'+(i+1>=n?"Край на рунда":"Нататък")+'</button></div>';
  }
  return '<div class="card session-bar"><div class="progress-track"><div class="progress-fill" style="width:'+Math.round(i/n*100)+'%"></div></div>'
    +'<span class="session-count">'+(i+1)+' / '+n+'</span><button class="btn btn-icon" id="stopBtn" aria-label="Спри рунда" title="Спри рунда">'+ico("x",15)+'</button></div>'
    +'<div class="card drill"><div class="drill-face">'+label+hint+sent+'</div>'+ctl+'</div>'
    +'<div class="session-foot"><kbd>1</kbd>–<kbd>4</kbd> избира · <kbd>Enter</kbd> проверява и продължава</div>';
}
function summaryHTML(s){
  const rows=s.results.map((r,k)=>{
    const v=byId(r.id),ic=r.verdict==="ok"?"✅":r.verdict==="syn"?"🟰":"❌";
    return '<div class="mis"><div class="mis-n">'+(k+1)+'</div><div class="mis-body"><div class="mis-head">'+ic+' '+pvHTML(v)
      +' <span style="font-weight:400;color:var(--ink-3);font-size:12.5px">'+esc(v.formal)+'</span></div>'
      +(r.verdict!=="ok"?'<div class="mis-you">'+(r.given?youHTML(r,v).replace(/^Ти/,"ти").replace(/\. $/,""):"ти: празно")+(r.matched?' — '+esc(r.matched)+' е синоним, картата не мърда':"")+'</div>':"")
      +(r.verdict==="no"?'<div class="mis-ex">'+sentenceHTML(r.ex,v,"full")+'</div>':"")+'</div></div>';
  }).join("");
  return '<div class="card drill" style="min-height:0"><div class="drill-face" style="gap:10px"><div class="prompt-label">Рунд '+s.rnd+'</div>'
    +'<div class="prompt-word">'+s.correct+'/'+s.dec+' = '+s.pct+'%</div>'
    +'<div class="sentence">'+(s.neutral?s.neutral+' синоним'+(s.neutral>1?"а":"")+' — не се брои · ':"")
    +(s.finished.length?'усвоени сега: <b>'+s.finished.map(esc).join(", ")+'</b> · ':"")+'общо усвоени '+s.mastered+'</div></div></div>'
    +'<div class="card"><div class="mistakes">'+rows+'</div></div>';
}
function startHTML(){
  const due=dueList(),dr=due.filter(isDragon),fresh=neverSeen().filter(v=>!v.retired);
  const size=S.prefs.roundSize||15,n=Math.min(size,due.length+fresh.length),s=PR.summary;
  return (s?summaryHTML(s):"")
    +'<div class="card drill"><div class="drill-face"><div class="prompt-label">'+(s?"Още?":"Днес")+'</div>'
    +'<div class="prompt-word">'+n+' '+(n===1?"глагол":"глагола")+'</div>'
    +'<div class="sentence">'+(due.length?due.length+' за повторение':'нищо за повторение')
    +(dr.length?' · '+dr.length+' '+(dr.length===1?"дракон":"дракона"):"")+' · '+fresh.length+' нови чакат</div></div>'
    +'<div class="drill-actions"><button class="btn btn-primary" id="startBtn"'+(n?"":" disabled")+'>'+ico("play",14)+'Започни рунд</button></div>'
    +'<div class="session-foot">Верен отговор качва картата с една кутия, грешен я сваля с една. Кутия 5 е край.</div></div>';
}
function renderPractice(){
  const el=$("#practice");if(!el)return;
  let R=S.round;
  if(R&&R.i>=R.ids.length){finishRound();save();R=null;}
  if(!R){
    el.innerHTML=startHTML();
    const b=$("#startBtn");if(b)b.addEventListener("click",startRound);
    return;
  }
  if(!R.q){
    const v=byId(R.ids[R.i]);
    if(!v){R.i++;save();return renderPractice();}     /* a card that left the deck */
    R.q=makeQuestion(v);save();
  }
  el.innerHTML=questionHTML(R);
  bindQuestion(R);
}
function bindQuestion(R){
  const q=R.q,v=byId(q.id);
  $("#stopBtn").addEventListener("click",stopRound);
  if(!q.answered){
    if(q.type==="type"){
      const inp=$("#ans");inp.focus();
      $("#checkBtn").addEventListener("click",()=>answerQ(inp.value));
      $("#skipBtn").addEventListener("click",()=>answerQ(""));
    }else $$(".opt").forEach(b=>b.addEventListener("click",()=>answerQ(q.options[+b.dataset.k])));
    return;
  }
  const next=$("#nextBtn");next.addEventListener("click",nextQ);
  const d=$("#drill");
  if(d){
    d.focus();
    d.addEventListener("input",()=>{if(sameVerb(d.value,v.phrasal)){q.drilled=true;save();d.classList.add("ok");next.disabled=false;}});
    $("#drillSkip").addEventListener("click",()=>{q.drilled=true;save();next.disabled=false;next.focus();});
  }else next.focus();
}
/* keys: 1–4 pick an option, Enter checks or moves on */
function practiceKeys(e){
  if(current!=="practice"||!S.round||!S.round.q)return;
  const q=S.round.q,id=e.target&&e.target.id;
  if(id==="ans"){if(e.key==="Enter")$("#checkBtn").click();return;}
  if(id==="drill"){if(e.key==="Enter"){const n=$("#nextBtn");if(n&&!n.disabled)n.click();}return;}
  if(!q.answered&&q.options&&/^[1-4]$/.test(e.key)){const b=$$(".opt")[+e.key-1];if(b)b.click();e.preventDefault();}
  else if(q.answered&&e.key==="Enter"){const n=$("#nextBtn");if(n&&!n.disabled)n.click();}
}
