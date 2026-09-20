/* ============================================================
   Particle — 431 phrasal verbs on your Leitner boxes.
   Data shape is identical to knowledge-quest's phrasal-verbs-data.json,
   so anything drilled here exports straight back to it.
   ============================================================ */
const FILLED = new Set(["play"]);
const ICONS = {
  grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
  bolt:'<path d="M13 2.6 4.8 13.8H11l-1 7.6 8.4-11.4H12l1-7.4Z"/>',
  flame:'<path d="M12 21.4c3.2 0 5.8-2.5 5.8-5.7 0-4.1-3.2-5.3-3.2-9.4 0 0-3 1.6-3 5.2 0-1.6-1.1-2.7-1.1-2.7-2.1 1.7-4.3 3.3-4.3 6.9 0 3.2 2.6 5.7 5.8 5.7Z"/>',
  book:'<path d="M4.5 5.8A2.6 2.6 0 0 1 7.1 3.2H20v14.4H7.1a2.6 2.6 0 0 0-2.6 2.6Z"/><path d="M4.5 20.2a2.6 2.6 0 0 1 2.6-2.6H20v3.2H7.1a2.6 2.6 0 0 1-2.6-2.6Z"/>',
  clock:'<circle cx="12" cy="12" r="8.6"/><path d="M12 6.9v5.3l3.3 2"/>',
  dot:'<circle cx="12" cy="12" r="3"/>',
  trophy:'<path d="M7.4 4.2h9.2v4.6a4.6 4.6 0 1 1-9.2 0V4.2Z"/><path d="M7.4 5.8H5a1.8 1.8 0 0 0 0 3.6h2.4M16.6 5.8H19a1.8 1.8 0 0 1 0 3.6h-2.4"/><path d="M12 13.4v3.6M8.6 20.4h6.8l-.7-3.4H9.3l-.7 3.4Z"/>',
  chart:'<path d="M4.5 20.5V11"/><path d="M11 20.5V4.5"/><path d="M17.5 20.5v-6"/><path d="M2.5 20.5h19"/>',
  cog:'<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.5a1.7 1.7 0 0 0 .35 1.87l.06.07a2 2 0 1 1-2.83 2.83l-.06-.07a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.35l-.07.06a2 2 0 1 1-2.83-2.83l.07-.06a1.7 1.7 0 0 0 .34-1.88 1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.35-1.87l-.06-.07a2 2 0 1 1 2.83-2.83l.06.07a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.07a2 2 0 1 1 2.83 2.83l-.06.07a1.7 1.7 0 0 0-.35 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.4 9.3a2.7 2.7 0 0 1 5.25.9c0 1.8-2.65 2.3-2.65 4.05"/><path d="M12 17.6h.01"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  moon:'<path d="M20.5 14.6A8.7 8.7 0 0 1 9.4 3.5a8.7 8.7 0 1 0 11.1 11.1Z"/>',
  sun:'<circle cx="12" cy="12" r="4.1"/><path d="M12 2.4v2.1M12 19.5v2.1M4.4 4.4l1.5 1.5M18.1 18.1l1.5 1.5M2.4 12h2.1M19.5 12h2.1M4.4 19.6l1.5-1.5M18.1 5.9l1.5-1.5"/>',
  play:'<path d="M7.5 4.8v14.4L19.5 12 7.5 4.8Z"/>',
  export:'<path d="M12 15.4V3.2"/><path d="m8 7.2 4-4 4 4"/><path d="M4.5 15v3.3a2.7 2.7 0 0 0 2.7 2.7h9.6a2.7 2.7 0 0 0 2.7-2.7V15"/>',
  import:'<path d="M12 3.2v12.2"/><path d="m8 11.4 4 4 4-4"/><path d="M4.5 15v3.3a2.7 2.7 0 0 0 2.7 2.7h9.6a2.7 2.7 0 0 0 2.7-2.7V15"/>',
  trash:'<path d="M4 6.8h16"/><path d="M10 11v6.2M14 11v6.2"/><path d="m6.2 6.8 1 12.1a2.1 2.1 0 0 0 2.1 1.9h5.4a2.1 2.1 0 0 0 2.1-1.9l1-12.1"/><path d="M9.2 6.8V5.1a2 2 0 0 1 2-2h1.6a2 2 0 0 1 2 2v1.7"/>',
  search:'<circle cx="10.8" cy="10.8" r="6.6"/><path d="m20 20-4.5-4.5"/>',
  check:'<path d="m5.2 12.6 4.6 4.6L19 7.6"/>',
  x:'<path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8"/>',
  arrow:'<path d="M4.6 12h14.2"/><path d="m13 6.2 6 5.8-6 5.8"/>',
  layers:'<path d="m12 3.2 8.6 4.6L12 12.4 3.4 7.8 12 3.2Z"/><path d="m3.4 12.4 8.6 4.6 8.6-4.6"/><path d="m3.4 16.8 8.6 4.6 8.6-4.6"/>',
  seed:'<path d="M12 20.8V9.6"/><path d="M12 12.6c-3.4 0-5.6-2.1-5.6-5.6 3.4 0 5.6 2.1 5.6 5.6Z"/><path d="M12 15.4c3.4 0 5.6-2.1 5.6-5.6-3.4 0-5.6 2.1-5.6 5.6Z"/>',
  target:'<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  up:'<path d="M12 18.8V5.6"/><path d="m6.4 11.2 5.6-5.6 5.6 5.6"/>'
};
function ico(n,s){s=s||18;const f=FILLED.has(n);return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" aria-hidden="true" '+(f?'fill="currentColor" stroke="none"':'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"')+'>'+(ICONS[n]||'')+'</svg>';}

const KIND=(SEED&&SEED.kind)||"verbs";           // "verbs" or "phrases"
const IS_PHRASES=KIND==="phrases";
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const DAY=86400000;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const C=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const pct=(a,b)=>b>0?Math.round(a/b*100):0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const norm=s=>String(s).toLowerCase().replace(/[^a-z\s']/g," ").replace(/\s+/g," ").trim();
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d;};
const shortDate=s=>{const d=new Date(s+"T00:00:00");return d.getDate()+" "+MON[d.getMonth()];};
function fmtGap(ms){const d=ms/DAY;if(d<1)return"today";if(d<2)return"tomorrow";if(d<14)return Math.round(d)+" days";if(d<70)return Math.round(d/7)+" weeks";return Math.round(d/30)+" months";}

/* ---- the signature mark ---- */
function pvHTML(v){
  const t=v.phrasal||v.term||"";
  if(IS_PHRASES){
    /* a formulaic expression has no particle to separate; the last word carries
       the accent so the shape of the phrase still reads at a glance */
    const w=t.split(" ");
    if(w.length<2) return '<span class="pv"><span class="stem">'+esc(t)+'</span></span>';
    return '<span class="pv"><span class="stem">'+esc(w.slice(0,-1).join(" "))+'</span> <span class="part">'+esc(w[w.length-1])+'</span></span>';
  }
  const p=t.split(" ");
  return '<span class="pv"><span class="stem">'+esc(p[0])+'</span> <span class="part">'+esc(p.slice(1).join(" "))+'</span></span>';
}
/* the same table round.py and grade.py use — a form missing here is a sentence the page cannot blank */
const IRREG={"beat":["beat","beats","beating","beaten"],"bite":["bite","bites","biting","bit","bitten"],"fight":["fight","fights","fighting","fought"],"have":["have","has","having","had"],"lie":["lie","lies","lying","lay","lain"],"light":["light","lights","lighting","lit","lighted"],"sneak":["sneak","sneaks","sneaking","snuck","sneaked"],"tear":["tear","tears","tearing","tore","torn"],"lead":["lead","leads","leading","led"],"wind":["wind","winds","winding","wound"],"go":["go","goes","going","went","gone"],"come":["come","comes","coming","came"],"take":["take","takes","taking","took","taken"],"give":["give","gives","giving","gave","given"],"get":["get","gets","getting","got","gotten"],"make":["make","makes","making","made"],"put":["put","puts","putting"],"find":["find","finds","finding","found"],"bring":["bring","brings","bringing","brought"],"break":["break","breaks","breaking","broke","broken"],"hold":["hold","holds","holding","held"],"run":["run","runs","running","ran"],"sit":["sit","sits","sitting","sat"],"stand":["stand","stands","standing","stood"],"wake":["wake","wakes","waking","woke","woken"],"hang":["hang","hangs","hanging","hung"],"cut":["cut","cuts","cutting"],"let":["let","lets","letting"],"keep":["keep","keeps","keeping","kept"],"pay":["pay","pays","paying","paid"],"set":["set","sets","setting"],"throw":["throw","throws","throwing","threw","thrown"],"grow":["grow","grows","growing","grew","grown"],"lay":["lay","lays","laying","laid"],"leave":["leave","leaves","leaving","left"],"think":["think","thinks","thinking","thought"],"write":["write","writes","writing","wrote","written"],"fall":["fall","falls","falling","fell","fallen"],"eat":["eat","eats","eating","ate","eaten"],"catch":["catch","catches","catching","caught"],"deal":["deal","deals","dealing","dealt"],"draw":["draw","draws","drawing","drew","drawn"],"blow":["blow","blows","blowing","blew","blown"],"build":["build","builds","building","built"],"buy":["buy","buys","buying","bought"],"feel":["feel","feels","feeling","felt"],"hear":["hear","hears","hearing","heard"],"lose":["lose","loses","losing","lost"],"meet":["meet","meets","meeting","met"],"read":["read","reads","reading"],"sell":["sell","sells","selling","sold"],"send":["send","sends","sending","sent"],"speak":["speak","speaks","speaking","spoke","spoken"],"spend":["spend","spends","spending","spent"],"stick":["stick","sticks","sticking","stuck"],"tell":["tell","tells","telling","told"],"wear":["wear","wears","wearing","wore","worn"],"win":["win","wins","winning","won"],"do":["do","does","doing","did","done"],"see":["see","sees","seeing","saw","seen"],"know":["know","knows","knowing","knew","known"],"drink":["drink","drinks","drinking","drank","drunk"],"drive":["drive","drives","driving","drove","driven"],"ride":["ride","rides","riding","rode","ridden"],"rise":["rise","rises","rising","rose","risen"],"shake":["shake","shakes","shaking","shook","shaken"],"sing":["sing","sings","singing","sang","sung"],"sleep":["sleep","sleeps","sleeping","slept"],"swear":["swear","swears","swearing","swore","sworn"],"teach":["teach","teaches","teaching","taught"],"understand":["understand","understands","understanding","understood"],"freeze":["freeze","freezes","freezing","froze","frozen"],"choose":["choose","chooses","choosing","chose","chosen"],"forget":["forget","forgets","forgetting","forgot","forgotten"],"hide":["hide","hides","hiding","hid","hidden"],"strike":["strike","strikes","striking","struck"],"swing":["swing","swings","swinging","swung"],"dig":["dig","digs","digging","dug"],"feed":["feed","feeds","feeding","fed"],"flee":["flee","flees","fleeing","fled"],"shoot":["shoot","shoots","shooting","shot"],"shut":["shut","shuts","shutting"],"split":["split","splits","splitting"],"spread":["spread","spreads","spreading"],"quit":["quit","quits","quitting"],"burst":["burst","bursts","bursting"],"stumble":["stumble","stumbles","stumbling","stumbled"]};
function verbForms(v){
  let out;
  if(IRREG[v]) out=IRREG[v].slice();
  else{
    /* -s becomes -es after a sibilant, so "piss" gives "pisses", not "pisss" */
    out=[v,/(s|sh|ch|x|z|o)$/.test(v)?v+"es":v+"s",v+"ed"];
    if(/e$/.test(v)) out.push(v.slice(0,-1)+"ing",v+"d");
    else if(/[^aeiou]y$/.test(v)) out.push(v.slice(0,-1)+"ied",v.slice(0,-1)+"ies",v+"ing");
    else out.push(v+"ing",v+v.slice(-1)+"ing",v+v.slice(-1)+"ed");
  }
  return out.sort((a,b)=>b.length-a.length);
}
/* locate the phrasal verb inside its example sentence */
function locate(text,v){
  const parts=v.phrasal.split(" ");
  const forms=verbForms(parts[0]);
  const tail=parts.slice(1).map(w=>w.replace(/[^a-z]/gi,"")).join("\\s+");
  const re=new RegExp("\\b("+forms.join("|")+")\\b((?:\\s+[\\w']+){0,3}?)\\s+("+tail+")\\b","i");
  const m=String(text).match(re);
  if(!m) return null;
  return {whole:m[0],index:text.indexOf(m[0]),stem:m[1],mid:m[2]||"",tail:m[3]};
}
function markExample(text,v){
  const f=locate(text,v);
  if(!f) return esc(text);
  return esc(text.slice(0,f.index))
    +'<span class="pv"><span class="stem">'+esc(f.stem)+'</span>'+esc(f.mid)+' <span class="part">'+esc(f.tail)+'</span></span>'
    +esc(text.slice(f.index+f.whole.length));
}

/* ============================================================
   STATE — mirrors phrasal-verbs-data.json
   ============================================================ */
const KEY="particle."+KIND+".v1";   /* the two decks must not share a slot */
let storageOK=true;
function freshFromSeed(){return JSON.parse(JSON.stringify(SEED));}
/* Progress lives in THIS browser once a round has been answered here — the
   page is the trainer now, not a read surface. The published data still
   supplies the cards (sentences, meanings, synonyms), so a republished deck
   updates every card without touching the boxes. Until the first answer the
   published progress wins, so a fresh phone starts where the snapshot stands. */
function load(){
  const fresh=freshFromSeed();
  try{
    const raw=localStorage.getItem(KEY);
    if(raw){
      const s=JSON.parse(raw)||{};
      if(s.prefs) fresh.prefs=Object.assign(fresh.prefs||{},s.prefs);
      const keep=["masteredIsFinal","masteredRecheckDays"];
      if(s.settings) keep.forEach(k=>{ if(s.settings[k]!==undefined) fresh.settings[k]=s.settings[k]; });
      if(s.drilled){
        const mine={};(s.verbs||[]).forEach(v=>mine[v.id]=v);
        fresh.verbs.forEach(v=>{const m=mine[v.id];if(!m)return;PROG.forEach(k=>{if(k in m)v[k]=m[k];else delete v[k];});});
        fresh.sessionHistory=s.sessionHistory||fresh.sessionHistory;
        fresh.stats=Object.assign({},fresh.stats,s.stats||{});
        fresh.currentStreak=s.currentStreak||0;
        if(s.lastUpdated)fresh.lastUpdated=s.lastUpdated;
        fresh.round=s.round||null;
        fresh.drilled=true;
      }
    }
  }catch(e){ storageOK=false; }
  return fresh;
}
function save(){
  if(!storageOK)return;
  try{ localStorage.setItem(KEY,JSON.stringify(S)); }
  catch(e){ storageOK=false; toast("This browser is blocking storage — your settings will not be remembered"); }
}
let S=load();
S.prefs=Object.assign({roundSize:15,sideDrill:1,acceptSyn:true,theme:null},S.prefs||{});
if(S.settings.masteredIsFinal===undefined)S.settings.masteredIsFinal=true;
if(S.settings.masteredRecheckDays===undefined)S.settings.masteredRecheckDays=0;
/* anything already sitting in Box 5 is finished under this rule, including
   verbs imported from an older file that still carry a review date */
if(S.settings.masteredIsFinal)S.verbs.forEach(v=>{
  if(v.box===5&&!v.retired){v.retired=true;v.nextReview=null;}
});
const IV=()=>S.settings.boxIntervals;
const BOXNAMES=["Not started","1 day","3 days","7 days","14 days","Mastered"];

const byId=id=>S.verbs.find(v=>v.id===id);
function isDue(v,t){return !!v.nextReview && !v.retired && v.nextReview.slice(0,10)<=iso(t||today());}
function dueList(){const t=today();return S.verbs.filter(v=>isDue(v,t)).sort((a,b)=>a.nextReview<b.nextReview?-1:1);}
function neverSeen(){return S.verbs.filter(v=>!v.lastReview);}
function dragons(){return S.verbs.filter(v=>(v.wrongCount||0)>=2||(v.consecutiveMisses||0)>=2).sort((a,b)=>(b.wrongCount||0)-(a.wrongCount||0));}
function boxCounts(){const c=[0,0,0,0,0,0];S.verbs.forEach(v=>c[v.box]++);return c;}
/* the 150 most frequent phrasal verbs in COCA (Garnier & Schmitt). Finishing
   these is the point; the other 300-odd are the long tail. */
/* the part of the deck that carries the weight: for verbs the corpus top 150,
   for the phrase list the 100 most frequent expressions in it */
/* Two nested measures, and they were being reported separately without saying
   so: the top 100 sits INSIDE the core 150. The 100 is the goal — it covers
   more than half of all phrasal verb use — and the 150 is the full core. */
const rankOf=v=>IS_PHRASES?v.pos:v.phave;
const core=()=>S.verbs.filter(v=>rankOf(v));
const top100=()=>S.verbs.filter(v=>rankOf(v)&&rankOf(v)<=100);
const coreDone=()=>core().filter(v=>v.box===5).length;
const top100Done=()=>top100().filter(v=>v.box===5).length;

/* Leitner, as Ivaylo actually runs it: right moves up one box, wrong moves
   down one — not back to the floor. Verified against 13 demotions in the
   nightly backups (1→0, 2→1, 3→2, 4→3), every one a single step, and every
   new review date matching the new box's interval. */
const finalAt5=()=>S.settings.masteredIsFinal!==false;


/* switching the rule reshapes every verb already sitting in Box 5, not just
   the ones mastered from now on */
function applyMasteryRule(isFinal,days){
  S.settings.masteredIsFinal=isFinal;
  if(days!=null)S.settings.masteredRecheckDays=days;
  const cycle=S.settings.masteredRecheckDays||0;
  S.verbs.forEach(v=>{
    if(v.box!==5)return;
    if(isFinal){v.retired=true;v.nextReview=null;}
    else{
      delete v.retired;
      v.nextReview=(cycle>0&&v.lastReview)
        ?iso(new Date(new Date(v.lastReview+"T00:00:00").getTime()+cycle*DAY)):null;
    }
  });
  save();
}
const retiredList=()=>S.verbs.filter(v=>v.retired);

/* ============================================================
   CHARTS
   ============================================================ */
function topRound(x,y,w,h,r){r=Math.min(r,h,w/2);if(h<=0.5)return"";return "M"+x+" "+(y+h)+" L"+x+" "+(y+r)+" Q"+x+" "+y+" "+(x+r)+" "+y+" L"+(x+w-r)+" "+y+" Q"+(x+w)+" "+y+" "+(x+w)+" "+(y+r)+" L"+(x+w)+" "+(y+h)+" Z";}
function ticks(peak,divs){divs=divs||3;const need=Math.max(1,peak)/divs;const pow=Math.pow(10,Math.floor(Math.log10(need)));const c=[1,2,2.5,5,10];let step=pow*10;for(const k of c)if(k*pow>=need){step=k*pow;break;}return{max:step*divs,step,divs};}
function smooth(pts,t){if(pts.length<2)return"";t=t===undefined?0.3:t;let d="M"+pts[0][0]+" "+pts[0][1];for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;d+=" C"+(p1[0]+(p2[0]-p0[0])*t/2).toFixed(1)+" "+(p1[1]+(p2[1]-p0[1])*t/2).toFixed(1)+","+(p2[0]-(p3[0]-p1[0])*t/2).toFixed(1)+" "+(p2[1]-(p3[1]-p1[1])*t/2).toFixed(1)+","+p2[0].toFixed(1)+" "+p2[1].toFixed(1);}return d;}
function svgW(el){return Math.max(280,Math.round(el.getBoundingClientRect().width||el.parentNode.getBoundingClientRect().width-20));}
function tipOn(t,x,y,h){t.innerHTML=h;t.style.left=x+"px";t.style.top=(y-12)+"px";t.classList.add("on");}
function tipOff(t){t.classList.remove("on");}
function emptyNote(w,txt){const o=w.querySelector(".chart-empty");if(o)o.remove();if(!txt)return;const e=document.createElement("div");e.className="chart-empty";e.innerHTML='<span>'+esc(txt)+'</span>';w.appendChild(e);}

function renderBars(){
  const svg=$("#barChart"),wrap=$("#barWrap"),tip=$("#barTip");
  const hist=(S.sessionHistory||[]).slice(-20);
  const W=svgW(svg),H=214,pad={t:14,r:12,b:26,l:34};
  const tk=ticks(Math.max(5,Math.max(0,...hist.map(h=>h.questions||0))*1.1),3),max=tk.max;
  const pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  const band=pw/Math.max(1,hist.length),bw=Math.min(26,band*0.56);
  const good=C("--c-good"),bad=C("--c-bad"),bd=C("--border"),ink3=C("--ink-3");
  const Y=v=>pad.t+ph-(v/max)*ph;
  let g='<defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="'+bad+'" opacity="0.28"/><line x1="0" y1="0" x2="0" y2="5" stroke="'+bad+'" stroke-width="2.6"/></pattern></defs>';
  for(let t=0;t<=tk.divs;t++){const v=tk.step*t,y=Y(v);
    g+='<line x1="'+pad.l+'" y1="'+y.toFixed(1)+'" x2="'+(W-pad.r)+'" y2="'+y.toFixed(1)+'" stroke="'+bd+'" stroke-width="1"/>';
    g+='<text x="'+(pad.l-8)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="end" font-size="10.5" font-family="'+C("--font-mono")+'" fill="'+ink3+'">'+Math.round(v)+'</text>';}
  hist.forEach((h,k)=>{
    const x=pad.l+band*k+(band-bw)/2,base=pad.t+ph;
    const c=h.correct||0,w=(h.questions||0)-c;
    const hc=(c/max)*ph,hw=(w/max)*ph;
    if(c>0)g+='<path d="'+topRound(x,base-hc,bw,hc,w>0?0:4)+'" fill="'+good+'"/>';
    if(w>0)g+='<path d="'+topRound(x,base-hc-hw-(c>0?2:0),bw,hw,4)+'" fill="url(#hatch)" stroke="'+bad+'" stroke-width="1"/>';
    if(k%3===0||k===hist.length-1)g+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" font-family="'+C("--font-mono")+'" fill="'+ink3+'">'+shortDate(h.date)+'</text>';
    g+='<rect x="'+(pad.l+band*k)+'" y="'+pad.t+'" width="'+band+'" height="'+ph+'" fill="transparent" class="bh" data-k="'+k+'"/>';
  });
  svg.setAttribute("viewBox","0 0 "+W+" "+H);svg.setAttribute("height",H);svg.innerHTML=g;
  emptyNote(wrap,hist.length?"":"No rounds logged yet");
  $$(".bh",svg).forEach(el=>{
    el.addEventListener("mouseenter",()=>{const h=hist[+el.dataset.k],r=svg.getBoundingClientRect();
      tipOn(tip,(+el.getAttribute("x")+band/2)*(r.width/W),Y(h.questions||0)*(r.height/H),
        '<div class="tip-title">Round '+h.session+' · '+shortDate(h.date)+'</div>'
        +'<div class="tip-row"><span class="dot" style="background:'+good+'"></span>Correct<b>'+(h.correct||0)+'</b></div>'
        +'<div class="tip-row"><span class="dot" style="background:'+bad+'"></span>Missed<b>'+((h.questions||0)-(h.correct||0))+'</b></div>'
        +'<div class="tip-row" style="border-top:1px solid '+bd+';margin-top:5px;padding-top:5px">Accuracy<b>'+(h.pct!=null?h.pct:pct(h.correct||0,h.questions||0))+'%</b></div>');});
    el.addEventListener("mouseleave",()=>tipOff(tip));
  });
}
function renderAcc(){
  const svg=$("#accChart"),wrap=$("#accWrap"),tip=$("#accTip");
  if(!svg)return;
  const hist=(S.sessionHistory||[]);
  const W=svgW(svg),H=250,pad={t:16,r:16,b:26,l:42};
  const pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  const X=k=>pad.l+(hist.length<2?pw/2:k*pw/(hist.length-1));
  const Y=v=>pad.t+ph-(v/100)*ph;
  const series=C("--c-series"),bd=C("--border"),ink3=C("--ink-3");
  let g='<defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+series+'" stop-opacity="0.2"/><stop offset="100%" stop-color="'+series+'" stop-opacity="0"/></linearGradient></defs>';
  [0,25,50,75,100].forEach(v=>{const y=Y(v);
    g+='<line x1="'+pad.l+'" y1="'+y.toFixed(1)+'" x2="'+(W-pad.r)+'" y2="'+y.toFixed(1)+'" stroke="'+bd+'" stroke-width="1"/>';
    g+='<text x="'+(pad.l-9)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="end" font-size="10.5" font-family="'+C("--font-mono")+'" fill="'+ink3+'">'+v+'%</text>';});
  if(hist.length){
    const pts=hist.map((h,k)=>[X(k),Y(h.pct!=null?h.pct:pct(h.correct||0,h.questions||1))]);
    if(pts.length>1){
      const d=smooth(pts);
      g+='<path d="'+d+' L'+pts[pts.length-1][0]+' '+(pad.t+ph)+' L'+pts[0][0]+' '+(pad.t+ph)+' Z" fill="url(#ag)"/>';
      g+='<path d="'+d+'" fill="none" stroke="'+series+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }else{
      /* one round is a point, not a curve — smooth() has nothing to draw yet */
      g+='<circle cx="'+pts[0][0]+'" cy="'+pts[0][1]+'" r="5" fill="'+series+'"/>';
    }
    g+='<rect x="'+pad.l+'" y="'+pad.t+'" width="'+pw+'" height="'+ph+'" fill="transparent" id="ah"/>';
    g+='<g id="ahov" opacity="0"><line y1="'+pad.t+'" y2="'+(pad.t+ph)+'" stroke="'+ink3+'" stroke-width="1" stroke-dasharray="3 3"/><circle r="5" fill="'+series+'" stroke="'+C("--surface")+'" stroke-width="2"/></g>';
  }
  const step=Math.max(1,Math.round(hist.length/6));
  hist.forEach((h,k)=>{if((hist.length-1-k)%step===0)g+='<text x="'+X(k).toFixed(1)+'" y="'+(H-6)+'" text-anchor="middle" font-size="10" font-family="'+C("--font-mono")+'" fill="'+ink3+'">'+shortDate(h.date)+'</text>';});
  svg.setAttribute("viewBox","0 0 "+W+" "+H);svg.setAttribute("height",H);svg.innerHTML=g;
  emptyNote(wrap,hist.length?"":"No rounds logged yet");
  const hit=svg.querySelector("#ah"),hov=svg.querySelector("#ahov");
  if(hit)hit.addEventListener("mousemove",ev=>{
    const r=svg.getBoundingClientRect(),sx=(ev.clientX-r.left)*(W/r.width);
    const k=clamp(Math.round((sx-pad.l)/(pw/Math.max(1,hist.length-1))),0,hist.length-1);
    const h=hist[k],px=X(k),py=Y(h.pct!=null?h.pct:pct(h.correct||0,h.questions||1));
    hov.setAttribute("opacity","1");
    hov.querySelector("line").setAttribute("x1",px);hov.querySelector("line").setAttribute("x2",px);
    hov.querySelector("circle").setAttribute("cx",px);hov.querySelector("circle").setAttribute("cy",py);
    tipOn(tip,px*(r.width/W)+8,py*(r.height/H)+6,
      '<div class="tip-title">Round '+h.session+' · '+shortDate(h.date)+'</div>'
      +'<div class="tip-row">Accuracy<b>'+(h.pct!=null?h.pct:pct(h.correct||0,h.questions||1))+'%</b></div>'
      +'<div class="tip-row">Questions<b>'+(h.questions||0)+'</b></div>');
  });
  if(hit)hit.addEventListener("mouseleave",()=>{hov.setAttribute("opacity","0");tipOff(tip);});
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function kpi(o){
  return '<div class="kpi"><div class="kpi-top"><span class="kpi-label">'+esc(o.label)+'</span>'
    +'<span class="kpi-chip" style="background:'+o.bg+';color:'+o.fg+'">'+ico(o.icon,15)+'</span></div>'
    +'<div class="kpi-value">'+o.value+'</div><div class="kpi-foot">'+esc(o.foot)+'</div></div>';
}
function renderDash(){
  const c=boxCounts(),due=dueList(),st=S.stats||{};
  const hist=S.sessionHistory||[];
  const last=hist.length?hist[hist.length-1]:null;
  $("#stamp").textContent=(S.drilled?"Progress saved in this browser":S.lastUpdated?"Snapshot of "+shortDate(S.lastUpdated):"No snapshot date")
    +(last?" · after round "+last.session+" on "+shortDate(last.date):"")
    +(S.settings.masteredIsFinal?" · Box 5 is the finish line":"");
  const q=hist.reduce((a,h)=>a+(h.questions||0),0),ok=hist.reduce((a,h)=>a+(h.correct||0),0);
  $("#kpis").innerHTML=
     kpi({label:"Top 100",icon:"target",bg:C("--accent-soft"),fg:C("--accent-ink"),
        value:top100Done()+"/100",
        foot:"the goal — over half of everything you hear"})
    +kpi({label:IS_PHRASES?"Full list":"Core 150",icon:"layers",bg:C("--info-soft"),fg:C("--info"),
        value:coreDone()+"/"+core().length,
        foot:"the top 100 sits inside this"})
    +kpi({label:"Due now",icon:"clock",bg:C("--warn-soft"),fg:C("--warn"),value:due.length,foot:due.length?"oldest waiting since "+shortDate(due[0].nextReview.slice(0,10)):"all caught up"})
    +kpi({label:"Mastered",icon:"trophy",bg:C("--good-soft"),fg:C("--c-good"),value:c[5],foot:pct(c[5],S.verbs.length)+"% of the deck"})
    +kpi({label:"Accuracy",icon:"target",bg:C("--info-soft"),fg:C("--info"),value:q?pct(ok,q)+"%":"—",foot:q?ok+" right of "+q+" logged":"no rounds logged"})
    +kpi({label:"Rounds",icon:"chart",bg:C("--surface-3"),fg:C("--ink-2"),value:st.totalSessions||hist.length,foot:hist.length+" of them logged"})
    +kpi({label:"Streak",icon:"flame",bg:C("--bad-soft"),fg:C("--c-bad"),value:S.currentStreak||0,foot:st.bestStreak?"best run "+st.bestStreak+" days":"—"});

  const total=S.verbs.length;
  $("#mastery").innerHTML=c.map((n,b)=>n?'<span style="flex:'+n+';background:var(--b'+b+')" title="Box '+b+': '+n+'">'+(n/total>0.045?n:"")+'</span>':"").join("");
  $("#masteryLegend").innerHTML=c.map((n,b)=>'<span class="leg"><span class="dot" style="background:var(--b'+b+')"></span>Box '+b+': '+BOXNAMES[b]+' · '+n+'</span>').join("");
  $("#mastSub").textContent=c[0]+" not started · "+(total-c[0]-c[5])+" in flight · "+c[5]+" mastered"
    +"  ·  top 100: "+top100Done()+" done  ·  core "+core().length+": "+coreDone()+" done";
  $("#mastBadge").textContent=pct(c[5],total)+"% mastered";

  $("#boxes").innerHTML=c.map((n,b)=>{
    const list=S.verbs.filter(v=>v.box===b);
    const show=list.slice(0,b===0?14:18);
    return '<div class="boxcard"><h4><span class="dot" style="background:var(--b'+b+')"></span>Box '+b+'<span class="n">'+n+'</span></h4>'
      +'<div class="iv">'+(b===0?"New or missed — comes straight back"
          :b===5?(finalAt5()?"Finished — never asked again"
                            :(S.settings.masteredRecheckDays>0?"Re-checked after "+S.settings.masteredRecheckDays+" days":"Not being checked"))
          :"Review after "+IV()[b]+" day"+(IV()[b]===1?"":"s"))+'</div>'
      +'<div class="chips">'+show.map(v=>'<span class="chip-v">'+esc(v.phrasal)+'</span>').join("")
      +(list.length>show.length?'<span class="chip-v chip-more" data-box="'+b+'">+'+(list.length-show.length)+' more</span>':'')+'</div></div>';
  }).join("");
  $$(".chip-more").forEach(el=>el.addEventListener("click",()=>{LIB.filter=el.dataset.box;LIB.q="";go("library",el.dataset.box);}));

  const preview=[];
  const d=due.slice(0,5);
  d.forEach(v=>preview.push({v,tag:"Due",cls:"badge-warn"}));
  if(preview.length<5)neverSeen().slice(0,5-preview.length).forEach(v=>preview.push({v,tag:"New",cls:"badge-info"}));
  $("#queueSub").textContent=due.length?due.length+" due · round of "+Math.min(S.prefs.roundSize,Math.max(due.length,S.prefs.roundSize)):"nothing due — the round will be new verbs";
  $("#queue").innerHTML=preview.length?preview.map(p=>
     '<div style="display:flex;align-items:center;gap:11px;padding:10px 9px;border-radius:10px">'
    +'<span class="dot" style="width:8px;height:8px;background:var(--b'+p.v.box+')"></span>'
    +'<span style="flex:1;min-width:0"><span style="font-size:13.5px;font-weight:500">'+pvHTML(p.v)+'</span>'
    +'<span style="display:block;font-size:11.5px;color:var(--ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(p.v.formal)+'</span></span>'
    +'<span class="badge '+p.cls+'">'+p.tag+'</span></div>').join("")
    :'<div class="empty" style="padding:26px 16px"><div class="empty-mark">'+ico("check",20)+'</div><h3>All caught up</h3><p>Nothing is due.</p></div>';

  renderBars();
}

/* ============================================================
   OTHER VIEWS
   ============================================================ */
const LIB={filter:"all",q:"",open:null};
function libMatch(v){
  const f=LIB.filter;
  if(f==="due"&&!isDue(v))return false;
  if(f==="mid"&&(v.box===0||v.box===5))return false;
  if(f==="amb"&&!(v.sharedPrompt||[]).length)return false;
  if(f==="done"&&!v.retired)return false;
  if(f==="core"&&!(IS_PHRASES?v.pos<=100:v.phave))return false;
  if(/^[0-5]$/.test(f)&&v.box!==+f)return false;
  if(LIB.q&&!((v.phrasal+" "+v.formal).toLowerCase().includes(LIB.q)))return false;
  return true;
}
function renderLibrary(){
  const rows=S.verbs.filter(libMatch);
  $("#libBody").innerHTML=rows.length?rows.map(v=>{
    const due=isDue(v);
    const nxt=v.nextReview?(due?'<span style="color:var(--c-bad)">due now</span>':"in "+fmtGap(new Date(v.nextReview+"T00:00:00")-today())):"—";
    let det="";
    if(LIB.open===v.id){
      det='<tr class="detail"><td colspan="6"><div class="detail-inner">'
        +'<div class="detail-ex">'+markExample(v.example,v)+'</div>'
        +((v.sharedPrompt||[]).length?'<div class="side-note">'+ico("layers",13)+'“'+esc(v.formal)+'” also fits: '+v.sharedPrompt.map(esc).join(", ")+'</div>':'')
        +((v.alsoKnownAs||[]).length?'<div class="side-note">'+ico("check",13)+'Also accepted: '+v.alsoKnownAs.map(esc).join(", ")+'</div>':'')
        +'</div></td></tr>';
    }
    return '<tr class="clickable" data-id="'+v.id+'">'
      +'<td style="white-space:nowrap">'+pvHTML(v)+'</td>'
      +'<td style="color:var(--ink-2)">'+esc(v.formal)
      +(IS_PHRASES
          ?(v.pos<=100?' <span class="badge badge-accent" style="font-size:10px" title="position in the list">#'+v.pos+'</span>':'')
          :(v.phave?' <span class="badge badge-accent" style="font-size:10px" title="rank in the 150 most frequent">#'+v.phave+'</span>':''))
      +((v.sharedPrompt||[]).length?' <span class="badge" style="font-size:10px">shared</span>':'')+'</td>'
      +'<td><span class="badge" style="background:var(--b'+v.box+');color:'+(v.box===0?'var(--ink-2)':'#fff')+'">Box '+v.box+'</span></td>'
      +'<td class="num">'+(v.correctCount||0)+'</td>'
      +'<td class="num">'+(v.wrongCount||0)+'</td>'
      +'<td style="font-size:12.5px;color:var(--ink-3);white-space:nowrap">'+nxt+'</td></tr>'+det;
  }).join(""):'<tr><td colspan="6"><div class="empty" style="padding:36px 18px"><div class="empty-mark">'+ico("search",20)+'</div><h3>Nothing matches</h3><p>Try another search or clear the filter.</p></div></td></tr>';
  $$("#libBody tr.clickable").forEach(tr=>tr.addEventListener("click",()=>{const id=+tr.dataset.id;LIB.open=LIB.open===id?null:id;renderLibrary();}));
}
function renderDragons(){
  const d=dragons();
  $("#dragBody").innerHTML=d.length?d.map(v=>
     '<tr><td style="white-space:nowrap">'+pvHTML(v)+'</td><td style="color:var(--ink-2)">'+esc(v.formal)+'</td>'
    +'<td class="num" style="color:var(--c-bad);font-weight:600">'+(v.wrongCount||0)+'</td>'
    +'<td class="num">'+(v.correctCount||0)+'</td>'
    +'<td><span class="badge" style="background:var(--b'+v.box+');color:'+(v.box===0?'var(--ink-2)':'#fff')+'">Box '+v.box+'</span></td>'
    +'<td style="font-size:12.5px;color:var(--ink-3)">'+(v.nextReview?(isDue(v)?"due now":"in "+fmtGap(new Date(v.nextReview+"T00:00:00")-today())):"—")+'</td></tr>').join("")
    :'<tr><td colspan="6"><div class="empty" style="padding:36px 18px"><div class="empty-mark">'+ico("check",20)+'</div><h3>No dragons</h3><p>A verb lands here after you miss it twice.</p></div></td></tr>';
}
function renderSessions(){
  const h=S.sessionHistory||[],st=S.stats||{};
  const q=h.reduce((a,x)=>a+(x.questions||0),0),ok=h.reduce((a,x)=>a+(x.correct||0),0);
  const miss=st.sessionsMissingFromLog||[];
  $("#sessKpis").innerHTML=
     kpi({label:"Rounds run",icon:"chart",bg:C("--accent-soft"),fg:C("--accent-ink"),value:st.totalSessions||h.length,foot:h.length+" written to the log"})
    +kpi({label:"Questions",icon:"layers",bg:C("--info-soft"),fg:C("--info"),value:q,foot:st.totalQuestions&&st.totalQuestions!==q?"the running counter says "+st.totalQuestions:"summed from the log"})
    +kpi({label:"Accuracy",icon:"target",bg:C("--good-soft"),fg:C("--c-good"),value:q?pct(ok,q)+"%":"—",foot:ok+" right"})
    +kpi({label:"Best round",icon:"trophy",bg:C("--warn-soft"),fg:C("--warn"),value:h.length?Math.max(...h.map(x=>x.pct!=null?x.pct:0))+"%":"—",foot:"single round high"})
    +kpi({label:"Missing",icon:"x",bg:C("--bad-soft"),fg:C("--c-bad"),value:miss.length,foot:miss.length?"rounds "+miss.join(", ")+" were never logged":"nothing unaccounted for"})
    +kpi({label:"Streak",icon:"flame",bg:C("--surface-3"),fg:C("--ink-2"),value:S.currentStreak||0,foot:st.bestStreak?"best "+st.bestStreak:"—"});
  $("#logSub").textContent=h.length+" rounds recorded"+(miss.length?" · "+miss.length+" missing and unrecoverable":"");
  $("#logBody").innerHTML=h.slice().reverse().map(x=>
     '<tr><td class="num">'+x.session+'</td><td style="white-space:nowrap">'+shortDate(x.date)+'</td>'
    +'<td class="num">'+(x.questions||0)+'</td><td class="num">'+(x.correct||0)+'</td>'
    +'<td class="num" style="color:'+((x.pct||0)>=75?'var(--c-good)':(x.pct||0)>=60?'var(--warn)':'var(--c-bad)')+';font-weight:600">'+(x.pct!=null?x.pct+"%":"—")+'</td>'
    +'<td style="font-size:12px;color:var(--ink-3);max-width:420px">'+esc(x.note||"")+'</td></tr>').join("");
  renderAcc();
}
function renderSettings(){
  $("#setLen").value=S.prefs.roundSize;
  $("#setSide").value=S.prefs.sideDrill;
  $("#setSyn").checked=!!S.prefs.acceptSyn;
  const b5=S.verbs.filter(v=>v.box===5),fin=finalAt5();
  $("#setFinal").checked=fin;
  $("#setFinalSub").textContent=fin
    ? "On. Reaching Box 5 is mastery — the verb leaves the deck and is never asked again. "
      +retiredList().length+" verbs are finished."
    : "Off. Box 5 verbs keep coming back on the cycle below. "
      +b5.filter(v=>isDue(v)).length+" of "+b5.length+" are waiting right now.";
  $("#setB5").value=S.settings.masteredRecheckDays||0;
  $("#setB5").disabled=fin;
  $("#setB5Sub").textContent=fin
    ? "Not in use while mastered verbs are finished for good."
    : "Days before a Box 5 verb comes back to be re-proved. 0 means it is never checked.";
}

/* ============================================================
   EXPORT — the exact shape knowledge-quest reads
   ============================================================ */
function download(name,obj){
  const b=new Blob([JSON.stringify(obj,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
function exportAll(){
  const c=boxCounts();
  const box={};c.forEach((n,b)=>box[String(b)]=n);
  const hist=S.sessionHistory||[];
  const out={
    lastUpdated:iso(today()),
    settings:S.settings,
    verbs:S.verbs,
    stats:Object.assign({},S.stats,{
      totalVerbs:S.verbs.length,mastered:c[5],inProgress:c[1]+c[2]+c[3]+c[4],notStarted:c[0],
      boxDistribution:box,sessionsLogged:hist.length,
      questionsFromLog:hist.reduce((a,h)=>a+(h.questions||0),0),
      correctFromLog:hist.reduce((a,h)=>a+(h.correct||0),0)
    }),
    boxDistribution:box,
    currentStreak:S.currentStreak||0
  };
  download("phrasal-verbs-data.json",out);
  download("progress-data.json",{totalSessions:out.stats.totalSessions,lastUpdated:iso(today()),
    stats:{totalQuestions:out.stats.questionsFromLog,overallAccuracy:pct(out.stats.correctFromLog,out.stats.questionsFromLog),currentStreak:S.currentStreak||0},
    sessionHistory:hist,boxes:{"0":S.verbs.filter(v=>v.box===0).map(v=>v.phrasal),"5":S.verbs.filter(v=>v.box===5).map(v=>v.phrasal)}});
  toast("Два файла са свалени — пази ги; Import ги връща");
}

/* ============================================================
   CHROME
   ============================================================ */
let current="dash";
const VIEWS={practice:{t:"Practice",i:"target"},dash:{t:"Dashboard",i:"grid"},dragons:{t:"Dragons",i:"flame"},library:{t:"Verb library",i:"book"},sessions:{t:"Sessions",i:"chart"},settings:{t:"Settings",i:"cog"},help:{t:"How this works",i:"help"}};
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("on"),2600);}
function refreshChrome(){
  const c=boxCounts(),due=dueList();
  $("#navDue2").textContent=due.length;
  $("#navAll").textContent=S.verbs.length;
  $("#navNew").textContent=c[0];
  $("#navMast").textContent=c[5];
  $("#navDrag").textContent=dragons().length;
  const p=pct(c[5],S.verbs.length);
  $("#mePct").textContent=p+"%";
  const ranks=[[0,"Getting started"],[10,"Early days"],[25,"Building up"],[45,"Getting there"],[65,"Strong"],[85,"Near fluent"]];
  let rank=ranks[0][1];ranks.forEach(r=>{if(p>=r[0])rank=r[1];});
  $("#meRank").textContent=rank;
  $("#meSub").textContent=c[5]+" of "+S.verbs.length+(IS_PHRASES?" expressions":" verbs")+" mastered";
}
function setTheme(m){
  document.documentElement.setAttribute("data-theme",m);
  S.prefs.theme=m;save();
  $("#themeBtn").innerHTML=ico(m==="dark"?"sun":"moon",16);
  const d=$("#missDot");
  if(d)d.style.background="repeating-linear-gradient(45deg,"+C("--c-bad")+" 0 2px,transparent 2px 4.6px),"+C("--bad-soft");
}
function renderView(){
  if(current==="practice")renderPractice();
  else if(current==="dash")renderDash();
  else if(current==="dragons")renderDragons();
  else if(current==="library")renderLibrary();
  else if(current==="sessions")renderSessions();
  else if(current==="settings")renderSettings();
}
function go(view,filter){
  if(!VIEWS[view])view="dash";
  current=view;
  if(view==="library"&&filter){LIB.filter=filter;LIB.open=null;
    $$(".chip[data-lib]").forEach(ch=>ch.setAttribute("aria-pressed",String(ch.dataset.lib===filter)));}
  Object.keys(VIEWS).forEach(v=>{const el=$("#view-"+v);if(el)el.hidden=v!==view;});
  $$(".nav-item").forEach(b=>{
    const on=b.dataset.view===view&&(!b.dataset.filter||b.dataset.filter===LIB.filter);
    on?b.setAttribute("aria-current","page"):b.removeAttribute("aria-current");});
  $("#pageTitle").textContent=VIEWS[view].t;
  $("#pageIcon").innerHTML=ico(VIEWS[view].i,16);
  if(location.hash!=="#/"+view)history.replaceState(null,"","#/"+view);
  $("#sidebar").classList.remove("open");
  const sc=$(".scrim");if(sc)sc.remove();
  renderView();window.scrollTo(0,0);
}

(function init(){
  const bs=$("#brandSub"); if(bs) bs.textContent = IS_PHRASES ? "Everyday expressions" : "Phrasal verb trainer";
  const od=$("#otherDeckName"); if(od) od.textContent = IS_PHRASES ? "Phrasal verbs" : "Everyday expressions";
  const al=$("#navAllLabel"); if(al) al.textContent = IS_PHRASES ? "All expressions" : "All verbs";
  if(IS_PHRASES){
    VIEWS.library.t="Expression library";
    const th=document.querySelector('#view-library thead th'); if(th) th.textContent="Expression";
    const th2=document.querySelectorAll('#view-library thead th')[1]; if(th2) th2.textContent="In use";
  }
  const ol=$("#otherDeck");
  if(ol && (!ol.getAttribute("href") || ol.getAttribute("href").indexOf("__OTHER")===0)) ol.style.display="none";

  $$("[data-ico]").forEach(el=>el.innerHTML=ico(el.dataset.ico,el.closest(".nav-item")?17:16));
  setTheme(S.prefs.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));

  $$(".nav-item").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view,b.dataset.filter)));
  $("#themeBtn").addEventListener("click",()=>{setTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark");renderView();});
  $("#exportBtn").addEventListener("click",exportAll);
  $("#exportBtn2").addEventListener("click",exportAll);
  $("#importBtn").addEventListener("click",()=>$("#importFile").click());
  $("#importFile").addEventListener("change",importFiles);
  document.addEventListener("keydown",practiceKeys);
  $("#menuBtn").addEventListener("click",()=>{
    const sb=$("#sidebar");sb.classList.toggle("open");
    if(sb.classList.contains("open")){const s=document.createElement("div");s.className="scrim";
      s.addEventListener("click",()=>{sb.classList.remove("open");s.remove();});document.body.appendChild(s);}
    else{const s=$(".scrim");if(s)s.remove();}});
  if(IS_PHRASES)$("#libSearch").placeholder="Search an expression";
  $("#libSearch").addEventListener("input",e=>{LIB.q=e.target.value.trim().toLowerCase();LIB.open=null;renderLibrary();});
  $$(".chip[data-lib]").forEach(ch=>ch.addEventListener("click",()=>{
    LIB.filter=ch.dataset.lib;LIB.open=null;
    $$(".chip[data-lib]").forEach(o=>o.setAttribute("aria-pressed",String(o===ch)));renderLibrary();}));

  const bind=(sel,key,lo,hi)=>$(sel).addEventListener("change",()=>{
    S.prefs[key]=clamp(parseInt($(sel).value,10)||lo,lo,hi);$(sel).value=S.prefs[key];save();refreshChrome();toast("Saved");});
  bind("#setLen","roundSize",5,60);bind("#setSide","sideDrill",0,5);
  $("#setSyn").addEventListener("change",()=>{S.prefs.acceptSyn=$("#setSyn").checked;save();toast("Saved");});
  $("#setFinal").addEventListener("change",()=>{
    const on=$("#setFinal").checked;
    applyMasteryRule(on,null);renderSettings();refreshChrome();
    toast(on?"Box 5 is the finish line — mastered verbs will not be asked again"
            :"Mastered verbs are back in circulation");});
  $("#setB5").addEventListener("change",()=>{
    const d=clamp(parseInt($("#setB5").value,10)||0,0,365);
    applyMasteryRule(false,d);renderSettings();refreshChrome();
    toast(d===0?"Mastered verbs will not be checked":"Mastered verbs now return every "+d+" days");});
  $("#resetBtn").addEventListener("click",()=>{
    if(!confirm("Да изтрия ли всичко упражнявано в този браузър и да започна от нулата?"))return;
    const prefs=S.prefs;S=freshFromSeed();S.prefs=prefs;PR.summary=null;save();refreshChrome();renderView();toast("От нулата");});

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){go("dash");return;}
  });
  let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{
    if(current==="dash")renderBars();if(current==="sessions")renderAcc();},140);});

  if(!storageOK)setTimeout(()=>toast("This browser blocks saving for local files — export before you close it"),900);
  refreshChrome();
  go((location.hash||"").replace("#/","")||"practice");
})();
