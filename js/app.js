const TABS=[
 {id:'agenda',label:'Agenda',icon:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'},
 {id:'lembretes',label:'Lembretes',icon:'<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>'},
 {id:'tarefas',label:'Tarefas',icon:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>'},
 {id:'almocos',label:'Almoços',icon:'<path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 21V3c-2 1-3 4-3 7h3"/>'}
];
const LISTS=['Casa','Compras','Escola','Outros'];
const DEFAULT_MEMBERS=[1,2,3,4,5].map(i=>({id:'m'+i,name:'Pessoa '+i,color:'p'+i}));
const DOW=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
const MONTHS=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const dowMon=d=>(d.getDay()+6)%7;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let TODAY=iso(new Date());
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};

const S={
  members:DEFAULT_MEMBERS, events:[], reminders:[], tasks:[], recipes:[], meals:{},
  tab:(()=>{const h=location.hash.slice(1);return TABS.some(t=>t.id===h)?h:(lsGet('fam.tab')||'agenda')})(),
  sel:TODAY, month:TODAY.slice(0,7), filter:lsGet('fam.filter')||'all',
  weekStart:(()=>{const d=new Date();d.setDate(d.getDate()-dowMon(d));return iso(d)})(),
  almView:'semana', taskList:'Todas', db:null, live:false, readOnly:false,
  uid:null, me:null, gcal:{}, mcp:null, autoSynced:false, gbusy:false,
  wall:lsGet('fam.wall')==='1'||location.hash==='#mural', wallView:lsGet('fam.wallView')||'hoje', wallDate:TODAY, lastHM:'', rotPart:null, prize:null, assets:null
};
const GSERVER='Google Calendar';

/* ---------- store layer: shared db when available, in-memory otherwise ---------- */
const COLS=['events','reminders','tasks','recipes','meals','birthdays','vacations','photos'];
S.birthdays=[];S.vacations=[];S.photos=[];S.agView='cal';
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
async function save(col,id,data){
  id=id||uid();
  if(S.db){
    try{await S.db.collection(col).doc(id).set(data)}
    catch(e){handleWriteError(e);return}
  }else{
    if(col==='meals'){S.meals[id]={id,...data}}
    else{const arr=S[col];const i=arr.findIndex(x=>x.id===id);const row={id,...data};i>=0?arr[i]=row:arr.push(row)}
    render();
  }
}
async function remove(col,id){
  if(S.db){try{await S.db.collection(col).doc(id).delete()}catch(e){handleWriteError(e);return}}
  else{if(col==='meals')delete S.meals[id];else S[col]=S[col].filter(x=>x.id!==id);render()}
}
async function saveMembers(members){
  if(S.db){try{await S.db.doc('config/family').set({members})}catch(e){handleWriteError(e);return}}
  else{S.members=members;render()}
}
function handleWriteError(e){
  if(e&&e.code==='invalid_argument'){S.readOnly=true;toast('Esta conta não tem acesso ao Quadro. Pede para adicionarem o teu email.');renderBanner()}
  else if(e&&e.code==='quota_exceeded'){toast('Espaço cheio. Apaga itens antigos para continuar.')}
  else toast('Não foi possível guardar. Tenta de novo.');
}

(async function connect(){
  if(!window.famBackend){S.checked=true;renderBanner();return}
  const db=await famBackend.use('db');
  S.checked=true;
  if(!db){renderBanner();return}
  S.db=db;S.live=true;
  try{const user=await famBackend.use('user');
    if(user){if(user.can&&(await user.can('data.write'))===false)S.readOnly=true;S.uid=await user.id()}}catch(e){}
  renderBanner();
  if(S.uid){
    db.doc('data/users/'+S.uid+'/profile').onSnapshot(s=>{S.me=s.exists?s.data():null;maybeAutoSync();render()},()=>{});
  }
  db.collection('gcal').onSnapshot(snap=>{S.gcal={};snap.docs.forEach(d=>S.gcal[d.id]=d.data());render()},()=>{});
  famBackend.use('mcp').then(m=>{S.mcp=m;maybeAutoSync()}).catch(()=>{});
  famBackend.use('assets').then(a=>{S.assets=a}).catch(()=>{});
  db.doc('config/prize').onSnapshot(s=>{S.prize=s.exists?s.data():null;render()},()=>{});
  db.doc('config/family').onSnapshot(s=>{
    const m=s.exists&&s.data().members;
    S.members=Array.isArray(m)&&m.length?m:DEFAULT_MEMBERS;render();
  },()=>{});
  COLS.forEach(col=>{
    db.collection(col).onSnapshot(snap=>{
      const rows=snap.docs.map(d=>({id:d.id,...d.data()}));
      if(col==='meals'){S.meals={};rows.forEach(r=>S.meals[r.id]=r)}else S[col]=rows;
      render();
    },()=>{});
  });
})();

/* ---------- Google Calendar ---------- */
function gErr(e){
  const c=e&&e.code;
  if(c==='server_not_connected')return 'O Google Calendar não está configurado nesta instalação (ver README).';
  if(c==='needs_reauth')return 'A autorização do Google expirou. Toca em Agenda → O meu Google para voltar a autorizar.';
  if(c==='selection_required')return 'Escolhe a conta Google no pedido que aparece.';
  if(c==='not_in_manifest'||c==='approval_required'||c==='consent_required')return 'Falta autorizar o Google Calendar. Tenta de novo e aceita o pedido do Google.';
  if(c==='blocked_by_policy')return 'A tua organização não permite esta ligação ao Google.';
  if(c==='server_unavailable'||c==='upstream_error')return 'O Google não respondeu. Tenta daqui a pouco.';
  if(c==='tool_error')return 'O Google recusou o pedido: '+String(e.message||'').slice(0,140);
  if(c==='invalid_argument')return 'Não tens permissão para guardar no Quadro.';
  if(c==='not_granted'||c==='capability_disabled'||c==='capability_removed')return 'O Google Calendar não está configurado nesta instalação (ver README).';
  return 'Não foi possível falar com o Google.';
}
async function fetchCals(){
  let token,all=[],n=0;
  do{const r=await S.mcp.callTool(GSERVER,'list_calendars',{pageSize:250,...(token?{pageToken:token}:{})});
    const p=r.payload||{};all=all.concat(p.calendars||[]);token=p.nextPageToken;n++}while(token&&n<3);
  return all;
}
function localParts(dt){const x=new Date(dt);if(isNaN(x))return null;return {d:iso(x),h:pad(x.getHours())+':'+pad(x.getMinutes())}}
function toEv(e,mode,cname){
  if(!e||e.status==='cancelled')return null;
  const s=e.start||{},en=e.end||{};let d,h='',ed,he='';
  if(s.dateTime){const a=localParts(s.dateTime);if(!a)return null;d=a.d;h=a.h;const b=localParts(en.dateTime||s.dateTime)||a;ed=b.d;he=b.h}
  else if(s.date){d=s.date;if(en.date){const x=parse(en.date);x.setDate(x.getDate()-1);ed=iso(x)}else ed=d}
  else return null;
  if(ed<d)ed=d;
  const busy=mode==='busy';
  return {t:busy?'Ocupado':String(e.summary||'(sem título)').slice(0,120),d,e:ed,h,he:busy?'':he,p:busy?'':String(e.location||'').slice(0,80),c:busy?'':String(cname||'').slice(0,40)};
}
function syncWindow(){const n=new Date();const a=new Date(n.getFullYear(),n.getMonth()-1,1);const b=new Date(n.getFullYear(),n.getMonth()+4,1);return [iso(a)+'T00:00:00',iso(b)+'T00:00:00']}
async function syncGoogle(prof,manual){
  prof=prof||S.me;
  if(!S.mcp){if(manual)toast('O Google Calendar não está configurado nesta instalação (ver README).');return}
  if(!prof||!prof.memberId)return;
  const chosen=Object.entries(prof.cals||{}).filter(([,v])=>v==='show'||v==='busy');
  if(S.gbusy)return;S.gbusy=true;if(manual)toast('A sincronizar com o Google…');
  try{
    const names={};(prof.calNames?Object.entries(prof.calNames):[]).forEach(([k,v])=>names[k]=v);
    const [from,to]=syncWindow();const out=[];
    for(const [cid,mode] of chosen){
      let token,n=0;
      do{
        const r=await S.mcp.callTool(GSERVER,'list_events',{calendarId:cid,startTime:from,endTime:to,pageSize:250,...(token?{pageToken:token}:{})},{cache:false});
        const p=r.payload||{};
        const owner=(prof.calMember||{})[cid]||prof.memberId;
        (p.events||[]).forEach(e=>{const x=toEv(e,mode,names[cid]||p.summary);if(x){x.m=owner;out.push(x)}});
        token=p.nextPageToken;n++;
      }while(token&&n<4);
    }
    out.sort((a,b)=>(a.d+a.h).localeCompare(b.d+b.h));
    await S.db.doc('gcal/'+prof.memberId).set({events:out.slice(0,800),updatedAt:new Date().toISOString()});
    if(manual)toast(out.length+' eventos do Google sincronizados');
  }catch(e){if(e&&e.code==='approval_required'&&!manual)S.needTap=true;else toast(gErr(e))}
  S.gbusy=false;
}
function maybeAutoSync(){
  if(S.mcp&&S.me&&S.me.memberId&&!S.calsLoaded){S.calsLoaded=true;fetchCals().then(c=>{S.myCals=c}).catch(()=>{})}
  if(S.autoSynced||!S.mcp||!S.db||!S.me||!S.me.memberId)return;
  const last=S.gcal[S.me.memberId]&&S.gcal[S.me.memberId].updatedAt;
  if(last&&Date.now()-Date.parse(last)<15*60*1000){S.autoSynced=true;return}
  S.autoSynced=true;syncGoogle(S.me,false);
}
function gcalOn(d){
  const out=[],seen=new Set();
  Object.entries(S.gcal).forEach(([mid,doc])=>{
    (doc.events||[]).forEach(x=>{
      const m=x.m||mid;if(!member(m))return;
      if(S.filter!=='all'&&S.filter!==m)return;
      if(d<x.d||d>x.e)return;
      const k=m+'|'+x.t+'|'+x.d+'|'+x.h;if(seen.has(k))return;seen.add(k);
      out.push({...x,mid:m});
    });
  });
  return out;
}
function ago(isoStr){const m=Math.round((Date.now()-Date.parse(isoStr))/60000);if(m<1)return 'agora';if(m<60)return 'há '+m+' min';const h=Math.round(m/60);if(h<24)return 'há '+h+' h';return 'há '+Math.round(h/24)+' dias'}

function allowGooglePrompt(){if(window.famBackend)window.famBackend.interactiveUntil=Date.now()+4000}
async function googleSheet(){
  allowGooglePrompt();
  if(!S.live){toast('Configura o Firebase para ligar o Google (ver README).');return}
  if(!S.uid){toast('Entra com a tua conta Google primeiro.');return}
  const me=S.me||{};
  const f=sheet('O meu Google Calendar',`
    <p class="muted small" style="margin:0">Escolhe quem és e que calendários teus aparecem na Agenda. A família vê os eventos dos calendários que marcares. Usa <b>Só "Ocupado"</b> para o calendário do trabalho.</p>
    <p class="muted small" style="margin:0">Se outra pessoa partilhou o calendário dela contigo no Google, escolhe <b>É de…</b> e os eventos aparecem com a cor dela. Assim o ecrã de parede mostra toda a família sem cada um ter de abrir o Quadro.</p>
    <label class="field"><span>Quem és tu</span><select id="g-member" name="member"><option value="">Escolher…</option>${S.members.map(m=>`<option value="${m.id}" ${me.memberId===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label>
    <div class="field"><span>Os meus calendários</span><div id="gcals" class="list"><div class="empty">A carregar calendários…</div></div></div>
    <p class="muted small" style="margin:0">Os teus eventos atualizam sempre que abres o Quadro (de 15 em 15 minutos, no máximo).</p>`,
  {saveLabel:'Guardar e sincronizar',onSave:f=>{
    const memberId=val(f,'member');if(!memberId){toast('Escolhe quem és.');return false}
    const cals={},calNames={};
    f.querySelectorAll('[data-cal]').forEach(s=>{cals[s.dataset.cal]=s.value;calNames[s.dataset.cal]=s.dataset.name});
    const calMember={};f.querySelectorAll('[data-calm]').forEach(s=>{if(s.value)calMember[s.dataset.calm]=s.value});
    const prof={memberId,cals,calNames,calMember};
    const prev=S.me&&S.me.memberId;
    (async()=>{
      try{await S.db.doc('data/users/'+S.uid+'/profile').set(prof)}catch(e){toast('Não foi possível guardar as tuas escolhas.');return}
      S.me=prof;
      if(prev&&prev!==memberId){try{await S.db.doc('gcal/'+prev).delete()}catch(e){}}
      if(!Object.values(cals).some(v=>v!=='off')){try{await S.db.doc('gcal/'+memberId).delete()}catch(e){};toast('Nenhum calendário a mostrar.');return}
      allowGooglePrompt();syncGoogle(prof,true);
    })();
  }});
  const box=f.querySelector('#gcals');
  if(!S.mcp){box.innerHTML=`<div class="empty">O Google Calendar não está configurado nesta instalação (ver README).</div>`;return}
  try{
    const cals=await fetchCals();
    if(!cals.length){box.innerHTML=`<div class="empty">Não encontrei calendários nesta conta Google.</div>`;return}
    S.myCals=cals;
    box.innerHTML=cals.map((c,i)=>{const mode=(me.cals||{})[c.id]||'off';const cm=(me.calMember||{})[c.id]||'';
      return `<div class="item" style="flex-wrap:wrap;align-items:center;gap:8px"><span class="body" style="flex-basis:100%"><div class="t">${esc(c.summary||c.id)}</div></span>
        <select id="gc-${i}" data-cal="${esc(c.id)}" data-name="${esc(c.summary||'')}" class="gsel" aria-label="Mostrar">
          <option value="off" ${mode==='off'?'selected':''}>Não mostrar</option>
          <option value="show" ${mode==='show'?'selected':''}>Mostrar</option>
          <option value="busy" ${mode==='busy'?'selected':''}>Só "Ocupado"</option></select>
        <select id="gm-${i}" data-calm="${esc(c.id)}" class="gsel" aria-label="De quem é"><option value="">É meu</option>${S.members.map(m=>`<option value="${m.id}" ${cm===m.id?'selected':''}>É de ${esc(m.name)}</option>`).join('')}</select></div>`}).join('');
  }catch(e){box.innerHTML=`<div class="empty">${esc(gErr(e))}</div>`}
}
async function pushToGoogle(ev,calendarId){
  if(!S.mcp){toast('O Google Calendar não está configurado nesta instalação (ver README).');return null}
  const allDay=!ev.time;
  const start=ev.date+'T'+(allDay?'00:00':ev.time)+':00';
  let endD=parse(ev.date),endT;
  if(allDay){endD.setDate(endD.getDate()+1);endT='00:00'}
  else{const [h,m]=ev.time.split(':').map(Number);const x=new Date(endD);x.setHours(h+1,m);endD=x;endT=pad(x.getHours())+':'+pad(x.getMinutes())}
  const input={summary:ev.title,startTime:start,endTime:iso(endD)+'T'+endT+':00',allDay,useDefaultReminders:true,description:'Do Quadro da Família'+(ev.note?'\n'+ev.note:'')};
  if(ev.place)input.location=ev.place;
  if(calendarId)input.calendarId=calendarId;
  const rr={weekly:'RRULE:FREQ=WEEKLY',monthly:'RRULE:FREQ=MONTHLY',yearly:'RRULE:FREQ=YEARLY'}[ev.repeat];
  if(rr)input.recurrenceData=[rr];
  try{const r=await S.mcp.callTool(GSERVER,'create_event',input);toast('Adicionado ao teu Google Calendar');const p=r.payload||{};return p.id||(p.event&&p.event.id)||'sim'}
  catch(e){toast(e&&(e.code==='server_unavailable'||e.code==='upstream_error')?'O Google não confirmou. Vê no teu calendário antes de tentar de novo.':gErr(e));return null}
}

/* ---------- helpers ---------- */
const member=id=>S.members.find(m=>m.id===id);
const colorOf=id=>`var(--${(member(id)||{}).color||'muted'})`;
function whoList(who){return (!who||!who.length||who.includes('all'))?['all']:who}
function matches(item){const w=whoList(item.who);return S.filter==='all'||w.includes('all')||w.includes(S.filter)}
function peopleTags(who){
  const w=whoList(who);
  if(w.includes('all'))return `<span class="ptag" style="--c:var(--accent)">Todos</span>`;
  return w.map(id=>member(id)?`<span class="ptag" style="--c:${colorOf(id)}">${esc(member(id).name)}</span>`:'').join('');
}
function dotsFor(who){const w=whoList(who);return w.includes('all')?['var(--accent)']:w.map(colorOf)}
function eventsOn(d){
  const dd=parse(d);
  return S.events.filter(e=>{
    if(!e.date||!matches(e))return false;
    if(e.date===d)return true;
    if(e.date>d)return false;
    if(e.repeat==='yearly')return e.date.slice(5)===d.slice(5);
    if(e.repeat==='weekly')return dowMon(parse(e.date))===dowMon(dd);
    if(e.repeat==='monthly')return e.date.slice(8)===d.slice(8);
    return false;
  }).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
}
const remindersOn=d=>S.reminders.filter(r=>r.date===d&&matches(r));
function birthdaysOn(d){
  const md=d.slice(5);const leap=new Date(+d.slice(0,4),1,29).getMonth()===1;
  return S.birthdays.filter(b=>b.md===md||(!leap&&b.md==='02-29'&&md==='02-28'));
}
const vacationsOn=d=>S.vacations.filter(v=>v.start&&d>=v.start&&d<=(v.end||v.start)&&matches(v));
function ageOn(b,d){return b.year?(+d.slice(0,4))-(+b.year):null}
function daysUntil(md){
  const t=parse(TODAY);let x=new Date(t.getFullYear(),+md.slice(0,2)-1,+md.slice(3));
  if(x<t)x=new Date(t.getFullYear()+1,+md.slice(0,2)-1,+md.slice(3));
  return {n:Math.round((x-t)/864e5),date:iso(x)};
}
function niceDate(d){const x=parse(d);return DOW[dowMon(x)]+', '+x.getDate()+' '+MONTHS[x.getMonth()]}
function rel(d){if(d===TODAY)return 'Hoje';const t=parse(TODAY);t.setDate(t.getDate()+1);if(d===iso(t))return 'Amanhã';return niceDate(d)}

/* ---------- render ---------- */
function render(){
  document.body.classList.toggle('wall-mode',S.wall);
  document.getElementById('wall').hidden=!S.wall;
  if(S.wall){renderWall();return}
  document.body.dataset.v='';
  renderWho();renderTabs();renderMain();
}
function renderBanner(){
  const b=document.getElementById('banner');
  if(!S.checked)b.innerHTML='';
  else if(!S.live)b.innerHTML=`<div class="banner">Modo de demonstração: o que adicionares aqui não fica guardado. Para usar a sério, configura o Firebase (ver README).</div>`;
  else if(S.readOnly)b.innerHTML=`<div class="banner">Esta conta não tem acesso ao Quadro. Pede a quem gere o Quadro para adicionar o teu email.</div>`;
  else b.innerHTML='';
}
function renderWho(){
  const el=document.getElementById('who');
  el.innerHTML=`<button class="chip" data-f="all" aria-pressed="${S.filter==='all'}">Todos</button>`+
    S.members.map(m=>`<button class="chip" data-f="${m.id}" aria-pressed="${S.filter===m.id}"><span class="dot" style="--c:var(--${m.color})"></span>${esc(m.name)}</button>`).join('');
}
function renderTabs(){
  const pendingToday=S.reminders.filter(r=>!r.done&&r.date&&r.date<=TODAY&&matches(r)).length;
  document.getElementById('tabs').innerHTML=TABS.map(t=>`<button data-tab="${t.id}" ${S.tab===t.id?'aria-current="page"':''}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>${t.label}
    ${t.id==='lembretes'&&pendingToday?`<span class="badge">${pendingToday}</span>`:''}</button>`).join('');
}
function renderMain(){
  const m=document.getElementById('main');
  m.innerHTML=({agenda:viewAgenda,lembretes:viewReminders,tarefas:viewTasks,almocos:viewLunch})[S.tab]();
}

function viewAgenda(){
  const seg=`<div class="seg" role="group" aria-label="Agenda"><button data-ag="cal" aria-pressed="${S.agView==='cal'}">Calendário</button><button data-ag="aniv" aria-pressed="${S.agView==='aniv'}">Aniversários</button><button data-ag="ferias" aria-pressed="${S.agView==='ferias'}">Férias</button></div>`;
  if(S.agView==='aniv')return viewBirthdays(seg);
  if(S.agView==='ferias')return viewVacations(seg);
  return viewCalendar(seg);
}
function viewBirthdays(seg){
  const rows=S.birthdays.map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n);
  return `<section class="panel">${seg}
    <div class="row"><h2>Aniversários</h2><span class="spacer"></span><button class="addbtn" data-new="birthday">+ Aniversário</button></div>
    <div class="list">${rows.map(b=>{const age=ageOn(b,b.date);
      return `<button class="item" data-edit-bday="${b.id}"><span class="time" style="min-width:56px">${+b.md.slice(3)} ${MONTHS[+b.md.slice(0,2)-1].slice(0,3)}</span>
        <span class="body"><div class="t">${esc(b.name)}</div><div class="sub">${b.n===0?'<b style="color:var(--accent)">Hoje!</b>':b.n===1?'Amanhã':'Daqui a '+b.n+' dias'}${age!==null?' · faz '+age+' anos':''}${b.note?' · '+esc(b.note):''}</div></span></button>`}).join('')
      ||`<div class="empty">Ainda sem aniversários.<br>Adiciona os da família, avós, primos e amigos. Aparecem no calendário todos os anos.</div>`}</div>
  </section>`;
}
function viewVacations(seg){
  const rows=S.vacations.filter(matches).sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  const up=rows.filter(v=>(v.end||v.start)>=TODAY),past=rows.filter(v=>(v.end||v.start)<TODAY).reverse();
  const nights=v=>Math.round((parse(v.end||v.start)-parse(v.start))/864e5)+1;
  const line=v=>`<button class="item" data-edit-vac="${v.id}"><span class="body">
      <div class="t">${esc(v.title)}</div>
      <div class="sub">${niceDate(v.start)}${v.end&&v.end!==v.start?' → '+niceDate(v.end):''} · ${nights(v)} ${nights(v)===1?'dia':'dias'}${v.place?' · '+esc(v.place):''}</div>
      <div class="people">${peopleTags(v.who)}</div></span>
      ${v.start<=TODAY&&TODAY<=(v.end||v.start)?'<span class="ptag" style="--c:var(--accent)">A decorrer</span>':''}</button>`;
  return `<section class="panel">${seg}
    <div class="row"><h2>Férias</h2><span class="spacer"></span><button class="addbtn" data-new="vacation">+ Férias</button></div>
    <div class="list">${up.map(line).join('')||`<div class="empty">Sem férias marcadas.<br>Regista as férias de cada um ou da família toda. Aparecem no calendário em todos os dias do período.</div>`}</div>
    ${past.length?`<span class="kind">Anteriores</span><div class="list">${past.slice(0,10).map(line).join('')}</div>`:''}
  </section>`;
}
function viewCalendar(seg){
  const [y,mo]=S.month.split('-').map(Number);
  const first=new Date(y,mo-1,1);const start=new Date(first);start.setDate(1-dowMon(first));
  let cells='';
  for(let i=0;i<42;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);const ds=iso(d);
    if(i===35&&d.getMonth()!==mo-1)break;
    const ev=eventsOn(ds);const rm=remindersOn(ds);
    const dots=[...new Set([
      ...vacationsOn(ds).flatMap(v=>dotsFor(v.who)),
      ...ev.flatMap(e=>dotsFor(e.who)),
      ...gcalOn(ds).map(g=>colorOf(g.mid)),
      ...(birthdaysOn(ds).length?['var(--accent)']:[])
    ])].slice(0,4);
    if(rm.length&&dots.length<4)dots.push('var(--muted)');
    cells+=`<button class="day ${d.getMonth()!==mo-1?'out':''} ${ds===TODAY?'today':''} ${ds===S.sel?'sel':''}" data-day="${ds}" aria-label="${niceDate(ds)}${ev.length?', '+ev.length+' eventos':''}">
      <span class="n">${d.getDate()}</span><span class="ds">${dots.map(c=>`<i style="--c:${c}"></i>`).join('')}</span></button>`;
  }
  const ev=eventsOn(S.sel),rm=remindersOn(S.sel),meal=S.meals[S.sel];
  let items='';
  items+=birthdaysOn(S.sel).map(b=>{const a=ageOn(b,S.sel);return `<button class="item" data-edit-bday="${b.id}"><span class="time">🎂︎</span><span class="body"><span class="kind">Aniversário</span><div class="t">${esc(b.name)}${a!==null&&a>0?' · '+a+' anos':''}</div></span></button>`}).join('');
  items+=vacationsOn(S.sel).map(v=>`<button class="item" data-edit-vac="${v.id}"><span class="time">✈︎</span><span class="body"><span class="kind">Férias${v.place?' · '+esc(v.place):''}</span><div class="t">${esc(v.title)}</div><div class="sub">Até ${niceDate(v.end||v.start)}</div><div class="people">${peopleTags(v.who)}</div></span></button>`).join('');
  if(meal)items+=`<button class="item" data-open-meal="${S.sel}"><span class="time">🍽︎</span><span class="body"><span class="kind">Almoço</span><div class="t">${esc(meal.title)}</div>${meal.cook&&member(meal.cook)?`<div class="sub">Cozinha: ${esc(member(meal.cook).name)}</div>`:''}</span></button>`;
  items+=ev.map(e=>`<button class="item" data-edit-event="${e.id}"><span class="time">${e.time?esc(e.time):'Dia'}</span><span class="body">
      <span class="kind">${e.repeat==='yearly'?'Evento anual':'Evento'}</span><div class="t">${esc(e.title)}</div>
      ${e.place||e.note?`<div class="sub">${esc([e.place,e.note].filter(Boolean).join(' · '))}</div>`:''}
      <div class="people">${peopleTags(e.who)}</div></span></button>`).join('');
  items+=gcalOn(S.sel).sort((a,b)=>(a.h||'').localeCompare(b.h||'')).map(g=>{
    const multi=g.d!==g.e,showT=g.h&&g.d===S.sel;
    return `<div class="item"><span class="time">${showT?esc(g.h):'Dia'}</span><span class="body">
      <span class="kind">Google${g.c?' · '+esc(g.c):''}</span><div class="t">${esc(g.t)}</div>
      ${g.p||(showT&&g.he&&!multi)?`<div class="sub">${esc([showT&&g.he&&!multi?'até '+g.he:'',g.p].filter(Boolean).join(' · '))}</div>`:''}
      <div class="people"><span class="ptag" style="--c:${colorOf(g.mid)}">${esc(member(g.mid).name)}</span></div></span></div>`}).join('');
  items+=rm.map(r=>`<div class="item ${r.done?'done':''}"><button class="check" role="checkbox" aria-checked="${!!r.done}" data-toggle-rem="${r.id}" aria-label="Feito"></button>
      <span class="body"><span class="kind">Lembrete${r.time?' · '+esc(r.time):''}</span><div class="t">${esc(r.text)}</div><div class="people">${peopleTags(r.who)}</div></span>
      <button class="edit" data-edit-rem="${r.id}">Editar</button></div>`).join('');
  const synced=Object.entries(S.gcal).filter(([mid,d])=>member(mid)&&d.updatedAt).map(([mid,d])=>`${esc(member(mid).name)} ${ago(d.updatedAt)}`);
  const gline=`<div class="row small muted" style="flex-wrap:wrap"><span>${synced.length?'Google atualizado: '+synced.join(' · '):'Nenhum Google Calendar ligado ainda.'}</span><span class="spacer"></span><button class="edit" data-gsetup>${S.me&&S.me.memberId?'O meu Google':'Ligar o meu Google'}</button></div>`;
  return `<section class="panel">${seg}
    <div class="cal" data-swipe="month">
      <div class="calhead"><h2>${MONTHS[mo-1]} ${y}</h2>
        <button class="iconbtn" data-month="-1" aria-label="Mês anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>
        <button class="iconbtn" data-month="0" aria-label="Hoje" style="width:auto;padding:0 12px;font-size:.85rem">Hoje</button>
        <button class="iconbtn" data-month="1" aria-label="Mês seguinte"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button></div>
      <div class="grid">${DOW.map(d=>`<div class="dow">${d}</div>`).join('')}${cells}</div>
    </div>
    <div class="row"><h2>${rel(S.sel)}</h2><span class="spacer"></span><button class="addbtn" data-new="event">+ Evento</button></div>
    <div class="list">${items||`<div class="empty">Nada marcado para este dia.<br>Toca em <b>+ Evento</b> para adicionar uma consulta ou um treino.</div>`}</div>
    ${gline}
  </section>`;
}

function viewReminders(){
  const rows=S.reminders.filter(matches).sort((a,b)=>(a.done-b.done)||((a.date||'9')+(a.time||'')).localeCompare((b.date||'9')+(b.time||'')));
  const open=rows.filter(r=>!r.done),done=rows.filter(r=>r.done);
  const line=r=>{const late=!r.done&&r.date&&r.date<TODAY;
    return `<div class="item ${r.done?'done':''}"><button class="check" role="checkbox" aria-checked="${!!r.done}" data-toggle-rem="${r.id}" aria-label="Feito"></button>
    <span class="body"><div class="t">${esc(r.text)}</div><div class="sub" ${late?'style="color:var(--danger)"':''}>${r.date?rel(r.date):'Sem data'}${r.time?' · '+esc(r.time):''}${late?' · atrasado':''}</div><div class="people">${peopleTags(r.who)}</div></span>
    <button class="edit" data-edit-rem="${r.id}">Editar</button></div>`};
  return `<section class="panel">
    <div class="row"><h2>Lembretes</h2><span class="spacer"></span><button class="addbtn" data-new="reminder">+ Lembrete</button></div>
    <div class="list">${open.map(line).join('')||`<div class="empty">Sem lembretes pendentes.<br>Ex.: pagar a cantina, levar a bata, renovar o cartão.</div>`}</div>
    ${done.length?`<div class="row"><span class="kind">Feitos (${done.length})</span><span class="spacer"></span><button class="edit" data-clear="reminders">Limpar feitos</button></div><div class="list">${done.slice(0,15).map(line).join('')}</div>`:''}
  </section>`;
}

function viewTasks(){
  const rows=S.tasks.filter(matches).filter(t=>S.taskList==='Todas'||t.list===S.taskList).sort((a,b)=>(isDone(a)-isDone(b))||(a.due||'9').localeCompare(b.due||'9'));
  const open=rows.filter(t=>!isDone(t)),done=rows.filter(t=>isDone(t));
  const line=t=>{const ok=isDone(t);return `<div class="item ${ok?'done':''}"><button class="check" role="checkbox" aria-checked="${ok}" data-toggle-task="${t.id}" aria-label="Concluída"></button>
    <span class="body"><div class="t">${esc(t.text)}</div><div class="sub">${esc(t.list||'Outros')}${t.repeat?' · '+(t.repeat==='daily'?'todos os dias':'dias úteis'):''}${t.due?' · até '+rel(t.due):''}</div><div class="people">${peopleTags(t.who)}</div></span>
    <button class="edit" data-edit-task="${t.id}">Editar</button></div>`};
  return `<section class="panel">
    <div class="row"><h2>Tarefas</h2><span class="spacer"></span><button class="addbtn" data-new="task">+ Tarefa</button></div>
    <div class="seg" role="group" aria-label="Lista">${['Todas',...LISTS].map(l=>`<button data-tlist="${l}" aria-pressed="${S.taskList===l}">${l}</button>`).join('')}</div>
    <div class="list">${open.map(line).join('')||`<div class="empty">Tudo feito por aqui.<br>Adiciona tarefas da casa, compras ou escola e atribui a quem as faz.</div>`}</div>
    ${done.length?`<div class="row"><span class="kind">Concluídas (${done.length})</span><span class="spacer"></span><button class="edit" data-clear="tasks">Limpar concluídas</button></div><div class="list">${done.slice(0,15).map(line).join('')}</div>`:''}
  </section>`;
}

function viewLunch(){
  const seg=`<div class="seg" role="group"><button data-alm="semana" aria-pressed="${S.almView==='semana'}">Plano da semana</button><button data-alm="receitas" aria-pressed="${S.almView==='receitas'}">Receitas (${S.recipes.length})</button></div>`;
  if(S.almView==='receitas'){
    const rs=[...S.recipes].sort((a,b)=>(a.name||'').localeCompare(b.name||'','pt'));
    return `<section class="panel">${seg}
      <div class="row"><h2>Livro de receitas</h2><span class="spacer"></span><button class="addbtn" data-new="recipe">+ Receita</button></div>
      ${rs.length?`<div class="recipes">${rs.map(r=>`<button class="rcard" data-view-recipe="${r.id}"><h3>${esc(r.name)}</h3>
        <div class="sub muted small">${[r.mins?r.mins+' min':'',r.serves?r.serves+' pessoas':'',r.tag].filter(Boolean).map(esc).join(' · ')||'&nbsp;'}</div></button>`).join('')}</div>`
      :`<div class="list"><div class="empty">Ainda sem receitas.<br>Guarda aqui os pratos que a família gosta e depois escolhe-os no plano da semana.</div></div>`}
    </section>`;
  }
  const ws=parse(S.weekStart);const end=new Date(ws);end.setDate(ws.getDate()+6);
  let days='';
  for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);const ds=iso(d);const m=S.meals[ds];
    days+=`<button class="meal ${ds===TODAY?'today':''}" data-open-meal="${ds}"><div class="d"><span>${DOW[i]}</span><b>${d.getDate()}</b></div>
      <div class="body"><div class="plate ${m?'':'none'}">${m?esc(m.title):'Por decidir'}</div>
      ${m&&m.cook&&member(m.cook)?`<div class="sub muted small"><span class="dot" style="--c:${colorOf(m.cook)};display:inline-block;margin-right:5px"></span>Cozinha: ${esc(member(m.cook).name)}</div>`:''}</div></button>`;}
  return `<section class="panel">${seg}
    <div class="row"><h2>${ws.getDate()} ${MONTHS[ws.getMonth()].slice(0,3)} – ${end.getDate()} ${MONTHS[end.getMonth()].slice(0,3)}</h2><span class="spacer"></span>
      <button class="iconbtn" data-week="-1" aria-label="Semana anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>
      <button class="iconbtn" data-week="1" aria-label="Semana seguinte"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button></div>
    <div class="week">${days}</div>
    <p class="muted small" style="margin:0">Toca num dia para escolher o almoço do livro de receitas ou escrever outro prato.</p>
  </section>`;
}

/* ---------- forms ---------- */
const overlay=document.getElementById('overlay');
function closeSheet(){overlay.innerHTML=''}
function whoField(sel){
  const w=whoList(sel);
  return `<div class="field"><span>Para quem</span><div class="who" data-whofield style="flex-wrap:wrap">
    <button type="button" class="chip" data-w="all" aria-pressed="${w.includes('all')}">Todos</button>
    ${S.members.map(m=>`<button type="button" class="chip" data-w="${m.id}" aria-pressed="${!w.includes('all')&&w.includes(m.id)}"><span class="dot" style="--c:var(--${m.color})"></span>${esc(m.name)}</button>`).join('')}
  </div></div>`;
}
function readWho(form){
  const on=[...form.querySelectorAll('[data-whofield] [aria-pressed="true"]')].map(b=>b.dataset.w);
  return !on.length||on.includes('all')?['all']:on;
}
function sheet(title,inner,{onSave,onDelete,saveLabel='Guardar'}={}){
  overlay.innerHTML=`<div class="scrim" data-scrim><form class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}" novalidate>
    <h2>${esc(title)}</h2>${inner}
    <div class="actions">${onDelete?`<button type="button" class="del" data-del>Apagar</button>`:''}<span class="spacer"></span>
      <button type="button" class="ghost" data-cancel>Cancelar</button>${onSave&&!S.readOnly?`<button class="addbtn" type="submit">${saveLabel}</button>`:''}</div>
  </form></div>`;
  const f=overlay.querySelector('form');
  f.addEventListener('submit',e=>{e.preventDefault();if(onSave&&onSave(f)!==false)closeSheet()});
  const del=f.querySelector('[data-del]');
  if(del)del.addEventListener('click',()=>{
    if(del.dataset.armed){onDelete();closeSheet()}else{del.dataset.armed='1';del.textContent='Toca de novo para apagar'}
  });
  const first=f.querySelector('input,textarea,select');if(first&&window.innerWidth>640)first.focus();
  return f;
}
const val=(f,n)=>(f.elements[n]?.value||'').trim();

function eventForm(e){
  e=e||{date:S.sel,who:S.filter==='all'?['all']:[S.filter]};
  sheet(e.id?'Editar evento':'Novo evento',`
    <label class="field"><span>O quê</span><input id="f-title" name="title" required value="${esc(e.title)}" placeholder="Ex.: Consulta no dentista"></label>
    <div class="two"><label class="field"><span>Dia</span><input id="f-date" type="date" name="date" value="${esc(e.date)}"></label>
    <label class="field"><span>Hora</span><input id="f-time" type="time" name="time" value="${esc(e.time)}"></label></div>
    <div class="two"><label class="field"><span>Onde</span><input id="f-place" name="place" value="${esc(e.place)}"></label>
    <label class="field"><span>Repete</span><select id="f-repeat" name="repeat">${[['none','Não'],['weekly','Todas as semanas'],['monthly','Todos os meses'],['yearly','Todos os anos']].map(([v,l])=>`<option value="${v}" ${e.repeat===v?'selected':''}>${l}</option>`).join('')}</select></label></div>
    ${whoField(e.who)}
    <label class="field"><span>Notas</span><input id="f-note" name="note" value="${esc(e.note)}"></label>
    ${S.mcp&&!e.gId?`<label class="field"><span>Também no meu Google Calendar</span><select id="f-gcal" name="gcal">
      <option value="">Não</option><option value="primary">Sim, no calendário principal</option>
      ${(S.myCals||[]).filter(c=>!/holiday|#/.test(c.id)).map(c=>`<option value="${esc(c.id)}">Sim, em ${esc(c.summary||c.id)}</option>`).join('')}
    </select></label>`:e.gId?`<p class="muted small" style="margin:0">Já enviado para o Google Calendar. Alterações aqui não mudam o evento no Google.</p>`:''}`,
  {onSave:f=>{const title=val(f,'title');if(!title){toast('Escreve o nome do evento.');return false}
      const id=e.id||uid();const gc=val(f,'gcal');if(gc)allowGooglePrompt();
      const body={title,date:val(f,'date')||S.sel,time:val(f,'time'),place:val(f,'place'),repeat:val(f,'repeat'),note:val(f,'note'),who:readWho(f),gId:e.gId||''};
      (async()=>{await save('events',id,body);
        if(gc){const gid=await pushToGoogle(body,gc==='primary'?'':gc);if(gid)await save('events',id,{...body,gId:String(gid)})}})();
      S.sel=body.date;S.month=S.sel.slice(0,7)},
   onDelete:e.id&&!S.readOnly?()=>remove('events',e.id):null});
}
function reminderForm(r){
  r=r||{date:S.tab==='agenda'?S.sel:TODAY,who:S.filter==='all'?['all']:[S.filter]};
  sheet(r.id?'Editar lembrete':'Novo lembrete',`
    <label class="field"><span>Lembrar de</span><input id="r-text" name="text" value="${esc(r.text)}" placeholder="Ex.: Levar autorização da visita de estudo"></label>
    <div class="two"><label class="field"><span>Dia</span><input id="r-date" type="date" name="date" value="${esc(r.date)}"></label>
    <label class="field"><span>Hora</span><input id="r-time" type="time" name="time" value="${esc(r.time)}"></label></div>
    ${whoField(r.who)}`,
  {onSave:f=>{const text=val(f,'text');if(!text){toast('Escreve o lembrete.');return false}
      save('reminders',r.id,{text,date:val(f,'date'),time:val(f,'time'),who:readWho(f),done:!!r.done})},
   onDelete:r.id&&!S.readOnly?()=>remove('reminders',r.id):null});
}
function taskForm(t){
  t=t||{list:S.taskList==='Todas'?'Casa':S.taskList,who:S.filter==='all'?['all']:[S.filter]};
  sheet(t.id?'Editar tarefa':'Nova tarefa',`
    <label class="field"><span>Tarefa</span><input id="t-text" name="text" value="${esc(t.text)}" placeholder="Ex.: Pôr a roupa a lavar"></label>
    <div class="two"><label class="field"><span>Lista</span><select id="t-list" name="list">${LISTS.map(l=>`<option ${t.list===l?'selected':''}>${l}</option>`).join('')}</select></label>
    <label class="field"><span>Até</span><input id="t-due" type="date" name="due" value="${esc(t.due)}"></label></div>
    <div class="two"><label class="field"><span>Repete</span><select id="t-rep" name="repeat">${[['','Não'],['daily','Todos os dias'],['weekdays','Dias úteis']].map(([v,l])=>`<option value="${v}" ${(t.repeat||'')===v?'selected':''}>${l}</option>`).join('')}</select></label>
    <label class="field"><span>Parte do dia (rotinas)</span><select id="t-part" name="part">${[['','Qualquer'],['manha','Manhã'],['tarde','Tarde'],['noite','Noite']].map(([v,l])=>`<option value="${v}" ${(t.part||'')===v?'selected':''}>${l}</option>`).join('')}</select></label></div>
    ${whoField(t.who)}`,
  {onSave:f=>{const text=val(f,'text');if(!text){toast('Escreve a tarefa.');return false}
      save('tasks',t.id,{text,list:val(f,'list'),due:val(f,'due'),who:readWho(f),repeat:val(f,'repeat'),part:val(f,'part'),done:!!t.done,doneAt:t.doneAt||'',doneDates:t.doneDates||[]})},
   onDelete:t.id&&!S.readOnly?()=>remove('tasks',t.id):null});
}
function recipeForm(r){
  r=r||{};
  sheet(r.id?'Editar receita':'Nova receita',`
    <label class="field"><span>Nome do prato</span><input id="c-name" name="name" value="${esc(r.name)}" placeholder="Ex.: Arroz de pato"></label>
    <div class="two"><label class="field"><span>Tempo (min)</span><input id="c-mins" type="number" min="0" name="mins" value="${esc(r.mins)}"></label>
    <label class="field"><span>Pessoas</span><input id="c-serves" type="number" min="1" name="serves" value="${esc(r.serves||5)}"></label></div>
    <label class="field"><span>Tipo</span><select id="c-tag" name="tag">${['','Carne','Peixe','Vegetariano','Massa','Sopa','Rápido'].map(x=>`<option ${r.tag===x?'selected':''}>${x}</option>`).join('')}</select></label>
    <label class="field"><span>Ingredientes (um por linha)</span><textarea id="c-ing" name="ingredients">${esc(r.ingredients)}</textarea></label>
    <label class="field"><span>Preparação</span><textarea id="c-steps" name="steps">${esc(r.steps)}</textarea></label>`,
  {onSave:f=>{const name=val(f,'name');if(!name){toast('Dá um nome à receita.');return false}
      save('recipes',r.id,{name,mins:val(f,'mins'),serves:val(f,'serves'),tag:val(f,'tag'),ingredients:val(f,'ingredients'),steps:val(f,'steps')})},
   onDelete:r.id&&!S.readOnly?()=>remove('recipes',r.id):null});
}
function birthdayForm(b){
  b=b||{};
  const day=b.md?+b.md.slice(3):'',mon=b.md?+b.md.slice(0,2):'';
  sheet(b.id?'Editar aniversário':'Novo aniversário',`
    <label class="field"><span>Nome</span><input id="b-name" name="name" value="${esc(b.name)}" placeholder="Ex.: Avó Rosa"></label>
    <div class="two"><label class="field"><span>Dia</span><input id="b-day" type="number" min="1" max="31" name="day" value="${day}"></label>
    <label class="field"><span>Mês</span><select id="b-mon" name="mon"><option value="">—</option>${MONTHS.map((m,i)=>`<option value="${i+1}" ${mon===i+1?'selected':''}>${m}</option>`).join('')}</select></label></div>
    <label class="field"><span>Ano de nascimento (opcional, para mostrar a idade)</span><input id="b-year" type="number" min="1900" max="2100" name="year" value="${esc(b.year)}"></label>
    <label class="field"><span>Notas</span><input id="b-note" name="note" value="${esc(b.note)}" placeholder="Ex.: gosta de chocolate"></label>`,
  {onSave:f=>{const name=val(f,'name'),d=+val(f,'day'),m=+val(f,'mon');
      if(!name||!d||!m){toast('Preenche o nome, o dia e o mês.');return false}
      if(d>new Date(2024,m,0).getDate()){toast('Esse dia não existe nesse mês.');return false}
      save('birthdays',b.id,{name,md:pad(m)+'-'+pad(d),year:val(f,'year'),note:val(f,'note')})},
   onDelete:b.id&&!S.readOnly?()=>remove('birthdays',b.id):null});
}
function vacationForm(v){
  v=v||{start:S.sel,end:S.sel,who:['all']};
  sheet(v.id?'Editar férias':'Novas férias',`
    <label class="field"><span>Nome</span><input id="v-title" name="title" value="${esc(v.title)}" placeholder="Ex.: Férias de verão no Algarve"></label>
    <div class="two"><label class="field"><span>De</span><input id="v-start" type="date" name="start" value="${esc(v.start)}"></label>
    <label class="field"><span>Até</span><input id="v-end" type="date" name="end" value="${esc(v.end)}"></label></div>
    <label class="field"><span>Onde</span><input id="v-place" name="place" value="${esc(v.place)}"></label>
    ${whoField(v.who)}
    <label class="field"><span>Notas</span><input id="v-note" name="note" value="${esc(v.note)}" placeholder="Ex.: reserva, voo, quem fica com o cão"></label>`,
  {onSave:f=>{const title=val(f,'title'),start=val(f,'start');let end=val(f,'end')||start;
      if(!title||!start){toast('Preenche o nome e a data de início.');return false}
      if(end<start){toast('A data de fim é antes do início.');return false}
      save('vacations',v.id,{title,start,end,place:val(f,'place'),note:val(f,'note'),who:readWho(f)})},
   onDelete:v.id&&!S.readOnly?()=>remove('vacations',v.id):null});
}
function recipeView(r){
  const ing=(r.ingredients||'').split('\n').map(s=>s.trim()).filter(Boolean);
  const f=sheet(r.name,`<div class="recipe-view" style="display:flex;flex-direction:column;gap:12px">
    <div class="muted small">${[r.mins?r.mins+' min':'',r.serves?r.serves+' pessoas':'',r.tag].filter(Boolean).map(esc).join(' · ')}</div>
    ${ing.length?`<div class="field"><span>Ingredientes</span><pre>${ing.map(i=>'• '+esc(i)).join('\n')}</pre></div>`:''}
    ${r.steps?`<div class="field"><span>Preparação</span><pre>${esc(r.steps)}</pre></div>`:''}
    <div class="actions">${S.readOnly?'':`<button type="button" class="ghost" data-editr>Editar</button>`}${ing.length&&!S.readOnly?`<button type="button" class="ghost" data-shop>Ingredientes → Compras</button>`:''}</div>
  </div>`);
  f.querySelector('[data-editr]')?.addEventListener('click',()=>recipeForm(r));
  f.querySelector('[data-shop]')?.addEventListener('click',async()=>{
    for(const i of ing)await save('tasks',null,{text:i,list:'Compras',due:'',who:['all'],done:false});
    closeSheet();toast(ing.length+' ingredientes adicionados às Compras');
  });
}
function mealForm(d){
  const m=S.meals[d]||{};
  const rs=[...S.recipes].sort((a,b)=>(a.name||'').localeCompare(b.name||'','pt'));
  const f=sheet('Almoço · '+niceDate(d),`
    ${rs.length?`<label class="field"><span>Do livro de receitas</span><select id="m-recipe" name="recipe"><option value="">Escolher…</option>${rs.map(r=>`<option value="${r.id}" ${m.recipeId===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label>`:''}
    <label class="field"><span>${rs.length?'Ou escreve o prato':'Prato'}</span><input id="m-title" name="title" value="${esc(m.title)}" placeholder="Ex.: Sopa e bacalhau à Brás"></label>
    <label class="field"><span>Quem cozinha</span><select id="m-cook" name="cook"><option value="">—</option>${S.members.map(p=>`<option value="${p.id}" ${m.cook===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label>
    ${m.recipeId&&S.recipes.find(r=>r.id===m.recipeId)?`<button type="button" class="ghost" data-seer>Ver receita</button>`:''}`,
  {onSave:f=>{const rid=val(f,'recipe');const rec=S.recipes.find(r=>r.id===rid);
      const title=val(f,'title')||(rec&&rec.name)||'';
      if(!title){if(m.title)remove('meals',d);return}
      save('meals',d,{title,recipeId:rec&&(!val(f,'title')||val(f,'title')===rec.name)?rid:(m.recipeId&&title===m.title?m.recipeId:''),cook:val(f,'cook'),date:d})},
   onDelete:m.title&&!S.readOnly?()=>remove('meals',d):null});
  const sel=f.querySelector('[name=recipe]');
  sel?.addEventListener('change',()=>{const rec=S.recipes.find(r=>r.id===sel.value);if(rec)f.elements.title.value=rec.name});
  f.querySelector('[data-seer]')?.addEventListener('click',()=>recipeView(S.recipes.find(r=>r.id===m.recipeId)));
}
function familyForm(){
  const u=window.famBackend&&window.famBackend.user;
  const f=sheet('A família',`<p class="muted small" style="margin:0">Escreve o nome de cada pessoa. A cor acompanha-a em toda a app.</p>
    ${S.members.map((m,i)=>`<label class="mem"><span class="dot" style="--c:var(--${m.color})"></span><span class="field" style="flex:1"><input id="mem-${i}" name="m${i}" value="${esc(m.name)}" aria-label="Nome ${i+1}"></span></label>`).join('')}
    <div class="field"><span>Dados</span><div class="row" style="flex-wrap:wrap">
      <button type="button" class="ghost" id="btnExport">Exportar cópia</button>
      ${S.readOnly||!S.db?'':'<label class="ghost" style="cursor:pointer">Importar cópia<input id="impFile" type="file" accept="application/json,.json" hidden></label>'}
      ${u?`<button type="button" class="ghost" id="btnOut">Sair (${esc(u.email||'')})</button>`:''}
    </div></div>`,
  {onSave:f=>{saveMembers(S.members.map((m,i)=>({...m,name:val(f,'m'+i)||m.name})))}});
  f.querySelector('#btnExport').addEventListener('click',exportData);
  const imp=f.querySelector('#impFile');
  if(imp)imp.addEventListener('change',async()=>{const file=imp.files[0];if(!file)return;
    let j;try{j=JSON.parse(await file.text())}catch(e){toast('Esse ficheiro não é uma cópia do Quadro.');return}
    closeSheet();importData(j)});
  const out=f.querySelector('#btnOut');if(out)out.addEventListener('click',()=>window.famBackend.signOut());
}
function exportData(){
  const out={app:'quadro-familia',version:1,exportedAt:new Date().toISOString(),config:{family:{members:S.members},prize:S.prize||null},profile:S.me||null};
  ['events','reminders','tasks','recipes','birthdays','vacations'].forEach(c=>{out[c]=S[c]});
  out.meals=Object.values(S.meals);
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='quadro-familia-'+TODAY+'.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
}
async function importData(j){
  if(!j||j.app!=='quadro-familia'){toast('Esse ficheiro não é uma cópia do Quadro.');return}
  if(!S.db){toast('Configura o Firebase antes de importar.');return}
  toast('A importar…');let n=0,fail=0;
  const put=async(path,data)=>{try{await S.db.doc(path).set(data);n++}catch(e){fail++}};
  for(const c of ['events','reminders','tasks','recipes','birthdays','vacations','meals']){
    for(const row of (Array.isArray(j[c])?j[c]:[])){
      if(!row||!row.id)continue;const {id,...data}=row;
      await put(c+'/'+String(id).replace(/\//g,'_'),data);
    }
  }
  if(j.config&&j.config.family&&Array.isArray(j.config.family.members))await put('config/family',{members:j.config.family.members});
  if(j.config&&j.config.prize)await put('config/prize',j.config.prize);
  if(j.profile&&S.uid)await put('data/users/'+S.uid+'/profile',j.profile);
  toast(fail?n+' itens importados, '+fail+' falharam.':n+' itens importados.');
}

/* ---------- wall / touch display ---------- */
function schoolEnd(e){const m=/até (\d\d:\d\d)/.exec(e.note||'');return m?m[1]:''}
function nowHM(){const n=new Date();return pad(n.getHours())+':'+pad(n.getMinutes())}
const isAll=x=>whoList(x.who).includes('all');
const forM=(x,m)=>!isAll(x)&&whoList(x.who).includes(m);
function wallData(d){
  const f=S.filter;S.filter='all';
  const r={ev:eventsOn(d),rm:remindersOn(d),vac:vacationsOn(d),g:gcalOn(d),bd:birthdaysOn(d),meal:S.meals[d]};
  S.filter=f;return r;
}
function colItems(m,D,d){
  const its=[];
  D.vac.filter(v=>forM(v,m)).forEach(v=>its.push({k:'',t:'Férias · '+v.title,s:'até '+niceDate(v.end||v.start),a:`data-edit-vac="${v.id}"`}));
  D.ev.filter(e=>forM(e,m)).forEach(e=>its.push({k:e.time||'',end:schoolEnd(e),t:e.title,s:e.place||'',a:`data-edit-event="${e.id}"`}));
  D.g.filter(g=>g.mid===m).forEach(g=>{const st=!!g.h&&g.d===d;its.push({k:st?g.h:'',end:st&&g.d===g.e?g.he:'',t:g.t,s:[g.c,g.p].filter(Boolean).join(' · ')})});
  D.rm.filter(r=>forM(r,m)&&!r.done).forEach(r=>its.push({k:r.time||'',t:r.text,s:'Lembrete',chk:`data-toggle-rem="${r.id}"`}));
  return its.sort((a,b)=>(a.k||'').localeCompare(b.k||''));
}
function wItem(x,d){
  const now=d===TODAY?nowHM():null;
  const past=!!(now&&x.k&&x.end&&x.end<=now),cur=!!(now&&x.k&&x.end&&x.k<=now&&now<x.end);
  const sub=[x.end?'até '+x.end:'',x.s].filter(Boolean).join(' · ');
  const inner=`<span style="flex:1;min-width:0"><div class="tt">${esc(x.t)}</div>${sub?`<div class="ss">${esc(sub)}</div>`:''}</span>`;
  if(x.chk)return `<div class="w-it"><button class="check" role="checkbox" aria-checked="false" ${x.chk} aria-label="Marcar como feito"></button>${x.k?`<span class="tm">${esc(x.k)}</span>`:''}${inner}</div>`;
  const tag=x.a?'button':'div';
  return `<${tag} class="w-it${past?' past':''}${cur?' now':''}" ${x.a||''}><span class="tm">${x.k?esc(x.k):'Dia'}</span>${inner}</${tag}>`;
}
function syncLine(){
  const s=Object.entries(S.gcal).filter(([m,d])=>member(m)&&d.updatedAt).map(([m,d])=>esc(member(m).name)+' '+ago(d.updatedAt));
  return `<p class="small muted" style="margin:12px 0 0">${s.length?'Google atualizado: '+s.join(' · '):'Google Calendar ainda não sincronizado neste Quadro.'}</p>`;
}
const LAYOUTS=[['hoje','Pessoas'],['linha','Linha do tempo'],['semana','Semana'],['mes','Mês'],['rotinas','Rotinas'],['moldura','Moldura']];
const PARTS=[['manha','Manhã'],['tarde','Tarde'],['noite','Noite'],['tudo','Tudo']];
function curPart(){const h=new Date().getHours();return h<12?'manha':h<19?'tarde':'noite'}
function addMin(hm,n){const[h,m]=hm.split(':').map(Number);const t=Math.min(23*60+59,h*60+m+n);return pad(Math.floor(t/60))+':'+pad(t%60)}
function taskActive(t,d){return t.repeat!=='weekdays'||dowMon(parse(d))<5}
function isDone(t,d){d=d||TODAY;return t.repeat?(t.doneDates||[]).includes(d):!!t.done}
function weekStartOf(d){const x=parse(d);x.setDate(x.getDate()-dowMon(x));return iso(x)}
function starsFor(m){const ws=weekStartOf(TODAY);let n=0;
  S.tasks.forEach(t=>{if(!forM(t,m))return;if(t.repeat)n+=(t.doneDates||[]).filter(x=>x>=ws&&x<=TODAY).length;else if(t.done&&t.doneAt&&t.doneAt>=ws)n++});return n}
function photoUrl(p){return String(p.url||('/_blob/'+p.asset)).replace(/["'()\\\s]/g,'')}
function layoutBar(){return `<div class="w-lay" role="group" aria-label="Vista">${LAYOUTS.map(([k,l])=>`<button data-wv="${k}" aria-pressed="${S.wallView===k}">${l}</button>`).join('')}</div>`}
function wallStep(n){const v=S.wallView,x=parse(S.wallDate);
  if(v==='mes')S.wallDate=iso(new Date(x.getFullYear(),x.getMonth()+n,1));
  else{x.setDate(x.getDate()+(v==='semana'?7:1)*n);S.wallDate=iso(x)}
  renderWall()}
function wallLabel(){
  const d=S.wallDate,v=S.wallView;
  if(v==='semana'){const b=parse(weekStartOf(d));const e=new Date(b);e.setDate(b.getDate()+6);
    return `Semana<small>${b.getDate()} ${MONTHS[b.getMonth()].slice(0,3)} – ${e.getDate()} ${MONTHS[e.getMonth()].slice(0,3)}</small>`}
  if(v==='mes'){const x=parse(d);return `<span style="text-transform:capitalize">${MONTHS[x.getMonth()]}</span> ${x.getFullYear()}<small>${niceDate(TODAY)}</small>`}
  if(v==='linha'&&d===TODAY){const nx=nextUp();return `${rel(d)}<small>${nx?`A seguir: <span class="w-next">${esc(nx.t)}</span> às ${nx.k}`:niceDate(d)}</small>`}
  if(v==='rotinas'){const p=S.rotPart||curPart();return `${p==='tudo'?'Rotinas de hoje':'Rotina da '+PARTS.find(x=>x[0]===p)[1].toLowerCase()}<small>${niceDate(TODAY)}</small>`}
  return `${rel(d)}<small>${d===TODAY?niceDate(d):'Toca em Hoje para voltar'}</small>`;
}
function wallHead(){
  const nav=S.wallView!=='rotinas';
  return `<div class="w-top"><div class="w-clock" id="wClock">${nowHM()}</div><div class="w-date">${wallLabel()}</div>
    <div class="w-ctl">${nav?`<button class="w-btn arrow" data-wshift="-1" aria-label="Anterior">‹</button>${S.wallDate!==TODAY?'<button class="w-btn" data-wtoday>Hoje</button>':''}<button class="w-btn arrow" data-wshift="1" aria-label="Seguinte">›</button>`:''}
      <button class="w-btn" data-wset>Ajustes</button><button class="w-btn" data-wfs aria-label="Ecrã inteiro">⛶</button><button class="w-btn" data-wexit>Sair</button></div></div>${layoutBar()}`;
}
function railMeal(d){const meal=S.meals[d];
  return `<div class="w-card"><h4>Almoço${d===TODAY?' de hoje':''}</h4><button class="w-it" data-open-meal="${d}"><span style="flex:1;min-width:0"><div class="tt">${meal?esc(meal.title):'Por decidir'}</div><div class="ss">${meal&&meal.cook&&member(meal.cook)?'Cozinha: '+esc(member(meal.cook).name):'Tocar para escolher'}</div></span></button></div>`}
function railReminders(d){
  const pend=S.reminders.filter(r=>!r.done&&r.date&&r.date<=d).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))).slice(0,5);
  return `<div class="w-card"><h4>Lembretes</h4>${pend.map(r=>`<div class="w-it"><button class="check" role="checkbox" aria-checked="false" data-toggle-rem="${r.id}" aria-label="Marcar como feito"></button><span style="flex:1;min-width:0"><div class="tt">${esc(r.text)}</div><div class="ss"${r.date<TODAY?' style="color:var(--danger)"':''}>${rel(r.date)}${r.time?' · '+esc(r.time):''}</div></span></div>`).join('')||'<div class="empty">Sem lembretes pendentes</div>'}</div>`}
function railBirthdays(){
  const up=S.birthdays.map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n).slice(0,3);
  return `<div class="w-card"><h4>Próximos aniversários</h4>${up.map(b=>`<button class="w-it" data-edit-bday="${b.id}"><span class="tm">${+b.md.slice(3)}/${+b.md.slice(0,2)}</span><span style="flex:1;min-width:0"><div class="tt">${esc(b.name)}</div><div class="ss">${b.n===0?'Hoje!':b.n===1?'Amanhã':'Daqui a '+b.n+' dias'}</div></span></button>`).join('')||'<div class="empty">Sem aniversários registados</div>'}</div>`}
function wallDay(d){
  const D=wallData(d);
  const band=[
    ...D.bd.map(b=>{const a=ageOn(b,d);return `<button class="w-pill" data-edit-bday="${b.id}">🎂︎ <b>${esc(b.name)}</b>${a>0?' faz '+a+' anos':''}</button>`}),
    ...D.vac.filter(isAll).map(v=>`<button class="w-pill" data-edit-vac="${v.id}">Férias · <b>${esc(v.title)}</b></button>`),
    ...D.ev.filter(isAll).map(e=>`<button class="w-pill" data-edit-event="${e.id}"><b>${e.time?esc(e.time):'Dia'}</b> ${esc(e.title)}</button>`)
  ];
  const cols=S.members.map(m=>{const its=colItems(m.id,D,d);
    return `<div class="w-col" style="--c:var(--${m.color})"><h3><span class="dot" style="--c:var(--${m.color})"></span>${esc(m.name)}<span class="spacer"></span><span class="small muted">${its.length||''}</span></h3>
      ${its.map(x=>wItem(x,d)).join('')||'<div class="empty">Dia livre</div>'}</div>`}).join('');
  const pend=S.reminders.filter(r=>!r.done&&r.date&&r.date<=d).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))).slice(0,8);
  const tasks=S.tasks.filter(t=>!isDone(t)&&taskActive(t,TODAY)).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')).slice(0,8);
  const up=S.birthdays.map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n).slice(0,3);
  const dots=who=>dotsFor(who).map(c=>`<span class="dot" style="--c:${c}"></span>`).join('');
  const meal=D.meal;
  return `${band.length?`<div class="w-band">${band.join('')}</div>`:''}
    <div class="w-body"><div class="w-cols" style="--n:${S.members.length}" data-swipe="wall">${cols}</div>
    <aside class="w-rail">
      <div class="w-card"><h4>Almoço${d===TODAY?' de hoje':''}</h4><button class="w-it" data-open-meal="${d}"><span style="flex:1;min-width:0"><div class="tt">${meal?esc(meal.title):'Por decidir'}</div><div class="ss">${meal&&meal.cook&&member(meal.cook)?'Cozinha: '+esc(member(meal.cook).name):'Tocar para escolher'}</div></span></button></div>
      <div class="w-card"><h4>Lembretes</h4>${pend.map(r=>`<div class="w-it"><button class="check" role="checkbox" aria-checked="false" data-toggle-rem="${r.id}" aria-label="Marcar como feito"></button><span style="flex:1;min-width:0"><div class="tt">${esc(r.text)}</div><div class="ss"${r.date<TODAY?' style="color:var(--danger)"':''}>${rel(r.date)}${r.time?' · '+esc(r.time):''}</div></span><span class="row" style="gap:3px;padding-top:6px">${dots(r.who)}</span></div>`).join('')||'<div class="empty">Sem lembretes pendentes</div>'}</div>
      <div class="w-card"><h4>Tarefas</h4>${tasks.map(t=>`<div class="w-it"><button class="check" role="checkbox" aria-checked="false" data-toggle-task="${t.id}" aria-label="Marcar como feita"></button><span style="flex:1;min-width:0"><div class="tt">${esc(t.text)}</div><div class="ss">${esc(t.list||'')}${t.due?' · até '+rel(t.due):''}</div></span><span class="row" style="gap:3px;padding-top:6px">${dots(t.who)}</span></div>`).join('')||'<div class="empty">Sem tarefas</div>'}</div>
      ${up.length?`<div class="w-card"><h4>Próximos aniversários</h4>${up.map(b=>`<button class="w-it" data-edit-bday="${b.id}"><span class="tm">${+b.md.slice(3)}/${+b.md.slice(0,2)}</span><span style="flex:1;min-width:0"><div class="tt">${esc(b.name)}</div><div class="ss">${b.n===0?'Hoje!':b.n===1?'Amanhã':'Daqui a '+b.n+' dias'}</div></span></button>`).join('')}</div>`:''}
    </aside></div>${syncLine()}`;
}
function wallWeek(){
  const b=parse(S.wallDate);b.setDate(b.getDate()-dowMon(b));let cols='';
  for(let i=0;i<7;i++){
    const x=new Date(b);x.setDate(b.getDate()+i);const d=iso(x);const D=wallData(d);const its=[];
    D.bd.forEach(z=>its.push({k:'',c:'var(--accent)',t:'🎂︎ '+z.name,a:`data-edit-bday="${z.id}"`}));
    D.vac.forEach(v=>its.push({k:'',c:dotsFor(v.who)[0],t:'Férias · '+v.title,a:`data-edit-vac="${v.id}"`}));
    const school={};
    D.ev.forEach(e=>{
      if(e.school){const en=schoolEnd(e);whoList(e.who).forEach(m=>{const s=school[m]||(school[m]={k:e.time,end:en});if(e.time<s.k)s.k=e.time;if(en>s.end)s.end=en})}
      else its.push({k:e.time||'',c:dotsFor(e.who)[0],t:e.title,a:`data-edit-event="${e.id}"`});
    });
    Object.entries(school).forEach(([m,s])=>its.push({k:s.k,c:colorOf(m),t:'Escola'+(member(m)?' · '+member(m).name:''),s:s.end?'até '+s.end:'',a:`data-wday="${d}"`}));
    D.g.forEach(g=>its.push({k:g.h&&g.d===d?g.h:'',c:colorOf(g.mid),t:g.t}));
    its.sort((p,q)=>(p.k||'').localeCompare(q.k||''));
    cols+=`<div class="w-day${d===TODAY?' today':''}"><button class="w-dh" data-wday="${d}"><span class="kind">${DOW[i]}</span><b>${x.getDate()}</b></button>
      ${its.map(z=>{const tag=z.a?'button':'div';return `<${tag} class="w-wi" style="--c:${z.c}" ${z.a||''}>${z.k?`<span class="tm">${esc(z.k)}</span>`:''}<span class="tt">${esc(z.t)}</span>${z.s?`<span class="ss">${esc(z.s)}</span>`:''}</${tag}>`}).join('')}
      ${D.meal?`<button class="w-wi meal" data-open-meal="${d}" style="--c:var(--line)"><span class="ss">Almoço</span><span class="tt">${esc(D.meal.title)}</span></button>`:''}</div>`;
  }
  return `<div class="w-week" data-swipe="wall">${cols}</div>${syncLine()}`;
}
function renderWall(){
  S.lastHM=nowHM();const v=S.wallView;document.body.dataset.v=v;
  const body={hoje:()=>wallDay(S.wallDate),semana:wallWeek,mes:wallMonth,linha:wallLine,rotinas:wallRoutines}[v]||(()=>wallDay(S.wallDate));
  const fab=S.readOnly?'':`<button class="w-fab" data-quickadd aria-label="Adicionar">+</button>`;
  document.getElementById('wall').innerHTML=v==='moldura'?wallFrame():wallHead()+body()+fab;
}
function dayChips(d,D){
  const ch=[],school={};
  D.bd.forEach(b=>ch.push({k:'',c:'var(--accent)',t:'🎂︎ '+b.name}));
  D.vac.forEach(v=>ch.push({k:'',c:dotsFor(v.who)[0],t:'Férias · '+v.title}));
  D.ev.forEach(e=>{if(e.school)whoList(e.who).forEach(m=>{school[m]=1});else ch.push({k:e.time||'',c:dotsFor(e.who)[0],t:(e.time?e.time+' ':'')+e.title})});
  Object.keys(school).forEach(m=>{if(member(m))ch.push({k:'00',c:colorOf(m),t:'Escola · '+member(m).name})});
  D.g.forEach(g=>{const h=g.h&&g.d===d?g.h:'';ch.push({k:h,c:colorOf(g.mid),t:(h?h+' ':'')+g.t})});
  return ch.sort((a,b)=>(a.k||'').localeCompare(b.k||''));
}
function wallMonth(){
  const x=parse(S.wallDate),y=x.getFullYear(),mo=x.getMonth(),first=new Date(y,mo,1);
  const weeks=Math.ceil((dowMon(first)+new Date(y,mo+1,0).getDate())/7);
  const start=new Date(first);start.setDate(1-dowMon(first));let cells='';
  for(let i=0;i<weeks*7;i++){
    const c=new Date(start);c.setDate(start.getDate()+i);const d=iso(c);const ch=dayChips(d,wallData(d));
    cells+=`<button class="w-mc${c.getMonth()!==mo?' out':''}${d===TODAY?' today':''}" data-wday="${d}" aria-label="${niceDate(d)}"><span class="n">${c.getDate()}</span>${ch.slice(0,3).map(z=>`<span class="w-chip" style="--c:${z.c}">${esc(z.t)}</span>`).join('')}${ch.length>3?`<span class="w-more">+${ch.length-3}</span>`:''}</button>`;
  }
  const tl=dayChips(TODAY,wallData(TODAY));
  return `<div class="w-mwrap"><div data-swipe="wall"><div class="w-mg">${DOW.map(d=>`<div class="w-mdow">${d}</div>`).join('')}</div>
      <div class="w-mg" style="grid-auto-rows:minmax(104px,auto)">${cells}</div></div>
    <aside class="w-rail"><div class="w-card"><h4>Hoje · ${niceDate(TODAY)}</h4>${tl.map(z=>`<div class="w-it" style="min-height:48px"><span class="dot" style="--c:${z.c};margin-top:8px"></span><span class="tt" style="flex:1;min-width:0">${esc(z.t)}</span></div>`).join('')||'<div class="empty">Nada marcado</div>'}</div>${railMeal(TODAY)}</aside></div>${syncLine()}`;
}
function wallLine(){
  const d=S.wallDate,D=wallData(d),H0=7,H1=23;
  const pos=hm=>{const[h,m]=hm.split(':').map(Number);return Math.max(0,Math.min(100,((h+m/60)-H0)/(H1-H0)*100))};
  const now=d===TODAY?nowHM():null;
  const blk=(a,b,t,c,act)=>{const l=pos(a),w=Math.max(pos(b)-l,2.5),past=now&&b<=now,tag=act?'button':'div';
    return `<${tag} class="w-blk${past?' past':''}" style="left:${l.toFixed(2)}%;width:calc(${w.toFixed(2)}% - 3px);--c:${c}" ${act||''}><b>${esc(t)}</b><span>${a}–${b}</span></${tag}>`};
  const lanes=[{id:'all',name:'Família',c:'var(--accent)'},...S.members.map(m=>({id:m.id,name:m.name,c:`var(--${m.color})`}))].map(L=>{
    const isF=L.id==='all',bl=[],allDay=[];
    D.ev.filter(e=>isF?isAll(e):forM(e,L.id)).forEach(e=>{if(e.time)bl.push(blk(e.time,schoolEnd(e)||addMin(e.time,60),e.title,L.c,`data-edit-event="${e.id}"`));else allDay.push(e.title)});
    if(!isF)D.g.filter(g=>g.mid===L.id).forEach(g=>{if(g.h&&g.d===d&&g.d===g.e)bl.push(blk(g.h,g.he&&g.he>g.h?g.he:addMin(g.h,60),g.t,L.c));else allDay.push(g.t)});
    D.vac.filter(v=>isF?isAll(v):forM(v,L.id)).forEach(v=>allDay.push('Férias · '+v.title));
    if(isF)D.bd.forEach(b=>allDay.push('Aniversário · '+b.name));
    return `<div class="w-lane"><div class="lab"><span class="row" style="gap:8px"><span class="dot" style="--c:${L.c}"></span>${esc(L.name)}</span>${allDay.length?`<small>${esc(allDay.join(' · '))}</small>`:''}</div>
      <div class="w-track">${bl.join('')}${now?`<i class="w-now" style="left:${pos(now).toFixed(2)}%"></i>`:''}</div></div>`}).join('');
  const hrs=[];for(let h=H0;h<=H1;h+=2)hrs.push(`<span class="w-hr" style="left:${((h-H0)/(H1-H0)*100).toFixed(2)}%${h===H0?';transform:none':h===H1?';transform:translateX(-100%)':''}">${pad(h)}h</span>`);
  return `<div class="w-tl" data-swipe="wall"><div class="w-tlh"><div class="lab"></div><div class="w-track" style="height:20px">${hrs.join('')}</div></div>${lanes}</div>
    <div class="w-grid3">${railMeal(d)}${railReminders(d)}${railBirthdays()}</div>${syncLine()}`;
}
function frameList(D,d){
  const its=[],sc={};
  D.bd.forEach(b=>its.push({k:'',c:'var(--accent)',t:'Aniversário · '+b.name}));
  D.vac.forEach(v=>its.push({k:'',c:dotsFor(v.who)[0],t:'Férias · '+v.title}));
  D.ev.forEach(e=>{
    if(e.school){const en=schoolEnd(e);whoList(e.who).forEach(m=>{const s=sc[m]||(sc[m]={k:e.time,end:en});if(e.time<s.k)s.k=e.time;if(en>s.end)s.end=en})}
    else{const who=isAll(e)?'':whoList(e.who).map(id=>member(id)&&member(id).name).filter(Boolean).join(', ');its.push({k:e.time||'',c:dotsFor(e.who)[0],t:e.title+(who?' · '+who:''),end:e.time?addMin(e.time,60):''})}
  });
  Object.entries(sc).forEach(([m,s])=>{if(member(m))its.push({k:s.k,c:colorOf(m),t:'Escola · '+member(m).name+(s.end?' (até '+s.end+')':''),end:s.end})});
  D.g.forEach(g=>{const h=g.h&&g.d===d?g.h:'';its.push({k:h,c:colorOf(g.mid),t:g.t+' · '+member(g.mid).name,end:h?g.he:''})});
  return its.sort((a,b)=>(a.k||'').localeCompare(b.k||''));
}
function nextUp(){const now=nowHM();return frameList(wallData(TODAY),TODAY).find(x=>x.k&&x.k>now)||null}
function wallFrame(){
  const n=S.photos.length,p=n?S.photos[Math.floor(Date.now()/30000)%n]:null;
  const tmr=parse(TODAY);tmr.setDate(tmr.getDate()+1);const td=iso(tmr);
  const now=nowHM();
  const row=(x,today)=>`<div class="w-fr${today&&x.end&&x.end<=now?' past':''}"><span class="tm">${x.k||'Dia'}</span><span class="dot" style="--c:${x.c}"></span><span class="tt" style="min-width:0">${esc(x.t)}</span></div>`;
  const meal=S.meals[TODAY],pend=S.reminders.filter(r=>!r.done&&r.date&&r.date<=TODAY).length;
  const up=S.birthdays.map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n)[0];
  const today=frameList(wallData(TODAY),TODAY),tomorrow=frameList(wallData(td),td).slice(0,5);
  return `${layoutBar()}<div class="w-frame"><div class="w-photo${p?' has':''}"${p?` style="background-image:url('${photoUrl(p)}')"`:''}>
      ${p?'':'<button class="w-btn" data-wset style="position:absolute;top:24px;right:24px">Adicionar fotografias</button>'}
      <div class="ov"><div class="big" id="wClock">${now}</div><div style="font-family:var(--display);font-weight:600;font-size:1.6rem">${niceDate(TODAY)}</div>
      ${meal?`<div class="w-chipb">Almoço: ${esc(meal.title)}</div>`:''}</div></div>
    <div class="w-side"><h4 class="w-sh">Hoje</h4>${today.map(x=>row(x,true)).join('')||'<div class="muted">Nada marcado</div>'}
      <h4 class="w-sh" style="color:var(--muted)">Amanhã</h4>${tomorrow.map(x=>row(x,false)).join('')||'<div class="muted">Nada marcado</div>'}
      <div class="row" style="gap:10px;margin-top:auto;align-items:stretch;padding-top:12px">
        ${up?`<div class="w-mini"><small>Aniversário</small><b>${esc(up.name)}</b><span class="small muted">${up.n===0?'Hoje!':up.n===1?'Amanhã':'daqui a '+up.n+' dias'}</span></div>`:''}
        <div class="w-mini"><small>Lembretes</small><b>${pend} por fazer</b></div>
        ${S.readOnly?'':'<button class="w-btn" data-quickadd aria-label="Adicionar" style="font-size:1.8rem;background:var(--accent);color:var(--accent-ink);border:0">+</button>'}
      </div>
      <div class="row" style="gap:8px;justify-content:flex-end"><button class="edit" data-wset>Ajustes</button><button class="edit" data-wfs>Ecrã inteiro</button><button class="edit" data-wexit>Sair</button></div>
    </div></div>`;
}
function wallRoutines(){
  const part=S.rotPart||curPart();let total=0;
  const tabs=`<div class="seg" role="group" aria-label="Parte do dia" style="max-width:560px;margin-bottom:12px">${PARTS.map(([k,l])=>`<button data-rpart="${k}" aria-pressed="${part===k}">${l}</button>`).join('')}</div>`;
  const partName=part==='tudo'?'hoje':'para a '+PARTS.find(x=>x[0]===part)[1].toLowerCase();
  const cards=S.members.map(m=>{
    const ts=S.tasks.filter(t=>forM(t,m.id)&&taskActive(t,TODAY)&&(part==='tudo'||!t.part||t.part===part)&&(t.repeat||!t.done||t.doneAt===TODAY)).sort((a,b)=>isDone(a)-isDone(b));
    const done=ts.filter(t=>isDone(t)).length,st=starsFor(m.id);total+=st;
    const deg=ts.length?Math.round(done/ts.length*360):0;
    return `<div class="w-rc" style="--c:var(--${m.color})"><div class="w-rh"><div class="w-ring" style="background:conic-gradient(var(--c) ${deg}deg,var(--sunk) 0)"><span>${done}/${ts.length}</span></div>
      <div style="min-width:0"><div style="font-family:var(--display);font-weight:600;font-size:1.25rem">${esc(m.name)}</div><div class="small">★ ${st} ${st===1?'estrela':'estrelas'} esta semana</div></div></div>
      ${ts.map(t=>{const ok=isDone(t);return `<button class="w-rtask${ok?' ok':''}" data-toggle-task="${t.id}" role="checkbox" aria-checked="${ok}"><span class="box">${ok?'✓':''}</span><span style="min-width:0"><div class="tt">${esc(t.text)}</div><div class="ss">${esc([t.repeat==='daily'?'Todos os dias':t.repeat==='weekdays'?'Dias úteis':'',t.due?'até '+rel(t.due):''].filter(Boolean).join(' · '))}</div></span></button>`}).join('')||`<div class="empty">Sem tarefas ${partName}</div>`}</div>`}).join('');
  const goal=+(S.prize&&S.prize.goal)||50,title=(S.prize&&S.prize.title)||'';
  return `${tabs}<div class="w-rt" style="--n:${S.members.length}">${cards}</div>
    <div class="w-prize"><b>Prémio da semana</b><div class="w-bar"><i style="width:${Math.min(100,total/goal*100).toFixed(0)}%"></i></div><span class="muted">${total} de ${goal} estrelas${title?' · '+esc(title):''}</span>${title?'':'<button class="edit" data-wset>Definir prémio</button>'}</div>
    <p class="small muted" style="margin:10px 0 0">Cada tarefa feita dá uma estrela. Para criar uma rotina, adiciona uma tarefa para uma pessoa com "Repete: todos os dias" e escolhe a parte do dia.</p>`;
}
async function shrink(file){
  const bmp=await createImageBitmap(file);
  for(const [max,q] of [[1600,0.8],[1400,0.7],[1200,0.6],[1000,0.55]]){
    const k=Math.min(1,max/Math.max(bmp.width,bmp.height));
    const c=document.createElement('canvas');c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);
    c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
    const b=await new Promise(res=>c.toBlob(res,'image/jpeg',q));
    if(b&&b.size<650000)return b;
  }
  throw new Error('too_big');
}
function wallSettings(){
  const rest=lsGet('fam.rest')||'';
  const f=sheet('Ajustes do ecrã',`
    <label class="field"><span>Após 2 minutos sem toques, mostrar</span><select id="w-rest" name="rest"><option value="">A vista atual (só volta a hoje)</option>${LAYOUTS.map(([k,l])=>`<option value="${k}" ${rest===k?'selected':''}>${l}</option>`).join('')}</select></label>
    <div class="field"><span>Fotografias da moldura (${S.photos.length})</span>
      ${S.photos.length?`<div class="ph-grid">${S.photos.map(p=>`<figure style="background-image:url('${photoUrl(p)}')"><button type="button" class="ph-del" data-delphoto="${p.id}" aria-label="Apagar fotografia">×</button></figure>`).join('')}</div>`:''}
      ${S.assets&&!S.readOnly?'<label class="uplabel">+ Adicionar fotografias<input id="w-ph" type="file" accept="image/*" multiple hidden></label>':`<p class="muted small" style="margin:0">${S.live?'Só quem pode editar o Quadro consegue adicionar fotografias.':'Configura o Firebase para adicionar fotografias.'}</p>`}
    </div>
    <div class="two"><label class="field"><span>Prémio da semana</span><input id="w-prize" name="prize" value="${esc(S.prize&&S.prize.title)}" placeholder="Ex.: Noite de cinema"></label>
    <label class="field"><span>Estrelas necessárias</span><input id="w-goal" type="number" min="1" name="goal" value="${esc((S.prize&&S.prize.goal)||50)}"></label></div>`,
  {onSave:f=>{
    lsSet('fam.rest',val(f,'rest'));
    const title=val(f,'prize'),goal=+val(f,'goal')||50;
    if(title!==((S.prize&&S.prize.title)||'')||goal!==(+(S.prize&&S.prize.goal)||50)){
      if(S.db)S.db.doc('config/prize').set({title,goal}).catch(handleWriteError);else{S.prize={title,goal};renderWall()}}
    toast('Ajustes guardados')}});
  const inp=f.querySelector('#w-ph');
  if(inp)inp.addEventListener('change',async()=>{
    const files=[...inp.files];if(!files.length)return;
    closeSheet();toast('A enviar '+files.length+(files.length===1?' fotografia…':' fotografias…'));
    let ok=0;
    for(const file of files){try{const blob=await shrink(file);const r=await S.assets.upload(blob);await save('photos',null,{asset:r.id,url:r.url||'',at:new Date().toISOString()});ok++}catch(e){}}
    toast(ok===files.length?(ok===1?'Fotografia adicionada':ok+' fotografias adicionadas'):'Só '+ok+' de '+files.length+' fotografias foram enviadas. Tenta as outras de novo.');
  });
}
function quickAdd(){
  S.sel=S.wallDate||TODAY;
  sheet('Adicionar',`<div class="qa">
    <button type="button" data-new="event">Evento<small>consulta, treino</small></button>
    <button type="button" data-new="reminder">Lembrete<small>não esquecer</small></button>
    <button type="button" data-new="task">Tarefa<small>casa, compras</small></button>
    <button type="button" data-open-meal="${S.sel}">Almoço<small>${S.sel===TODAY?'de hoje':niceDate(S.sel)}</small></button>
    <button type="button" data-new="vacation">Férias<small>período</small></button>
    <button type="button" data-new="birthday">Aniversário<small>todos os anos</small></button></div>`);
}
let wl=null,idleT=null;
async function keepAwake(){if(!S.wall||document.hidden)return;try{if(navigator.wakeLock)wl=await navigator.wakeLock.request('screen')}catch(e){}}
function enterWall(){S.wall=true;S.wallDate=TODAY;S.wallView=lsGet('fam.wallView')||'hoje';lsSet('fam.wall','1');keepAwake();render();bumpIdle();window.scrollTo(0,0)}
function exitWall(){S.wall=false;lsSet('fam.wall','0');try{wl&&wl.release()}catch(e){}wl=null;
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});render()}
function bumpIdle(){clearTimeout(idleT);if(!S.wall)return;
  idleT=setTimeout(()=>{closeSheet();S.wallView=lsGet('fam.rest')||S.wallView;S.rotPart=null;S.wallDate=TODAY;render();window.scrollTo(0,0)},120000)}
function toggleFS(){
  try{if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});return}
    const p=document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();
    if(p&&p.catch)p.catch(()=>toast('Ecrã inteiro não disponível aqui. Usa o ecrã inteiro do browser ou do tablet.'));
    else if(!p)toast('Ecrã inteiro não disponível aqui. Usa o ecrã inteiro do browser ou do tablet.');
  }catch(e){toast('Ecrã inteiro não disponível aqui.')}
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button,[data-scrim]');if(!t)return;
  const d=t.dataset;
  if(t.matches('[data-scrim]')){if(e.target===t)closeSheet();return}
  if(d.cancel!==undefined){closeSheet();return}
  if(t.id==='btnWall'){enterWall();return}
  if(d.wv){S.wallView=d.wv;lsSet('fam.wallView',d.wv);S.rotPart=null;renderWall();window.scrollTo(0,0);return}
  if(d.wshift){wallStep(+d.wshift);return}
  if(d.rpart){S.rotPart=d.rpart;renderWall();return}
  if(d.wset!==undefined){wallSettings();return}
  if(d.delphoto){if(S.readOnly)return;const p=S.photos.find(x=>x.id===d.delphoto);
    if(!t.dataset.armed){t.dataset.armed='1';t.textContent='✓';t.setAttribute('aria-label','Toca de novo para apagar');return}
    if(p){remove('photos',p.id);if(S.assets&&p.asset)S.assets.delete(p.asset).catch(()=>{})}
    const fig=t.closest('figure');if(fig)fig.remove();return}
  if(d.wtoday!==undefined){S.wallDate=TODAY;renderWall();return}
  if(d.wday){S.wallDate=d.wday;S.wallView='hoje';renderWall();return}
  if(d.wfs!==undefined){toggleFS();return}
  if(d.wexit!==undefined){exitWall();return}
  if(d.quickadd!==undefined){if(S.readOnly){toast('Estás em modo de leitura.');return}quickAdd();return}
  if(d.w){const box=t.closest('[data-whofield]');
    if(d.w==='all'){box.querySelectorAll('[data-w]').forEach(b=>b.setAttribute('aria-pressed',b===t?'true':'false'))}
    else{t.setAttribute('aria-pressed',t.getAttribute('aria-pressed')==='true'?'false':'true');
      const any=box.querySelector('[data-w]:not([data-w="all"])[aria-pressed="true"]');
      box.querySelector('[data-w="all"]').setAttribute('aria-pressed',any?'false':'true')}
    return}
  if(d.f){S.filter=d.f;lsSet('fam.filter',d.f);render();return}
  if(d.tab){S.tab=d.tab;lsSet('fam.tab',d.tab);render();window.scrollTo(0,0);return}
  if(d.day){S.sel=d.day;if(d.day.slice(0,7)!==S.month)S.month=d.day.slice(0,7);render();return}
  if(d.month!==undefined){const n=+d.month;if(n===0){S.month=TODAY.slice(0,7);S.sel=TODAY}else{const[y,m]=S.month.split('-').map(Number);const x=new Date(y,m-1+n,1);S.month=iso(x).slice(0,7)}render();return}
  if(d.week){const x=parse(S.weekStart);x.setDate(x.getDate()+7*+d.week);S.weekStart=iso(x);render();return}
  if(d.alm){S.almView=d.alm;render();return}
  if(d.ag){S.agView=d.ag;render();return}
  if(d.gsetup!==undefined){googleSheet();return}
  if(d.editBday){birthdayForm(S.birthdays.find(x=>x.id===d.editBday));return}
  if(d.editVac){vacationForm(S.vacations.find(x=>x.id===d.editVac));return}
  if(d.tlist){S.taskList=d.tlist;render();return}
  if(t.id==='btnFamily'){familyForm();return}
  if(S.readOnly&&(d.new||d.toggleRem||d.toggleTask||d.clear)){toast('Estás em modo de leitura.');return}
  if(d.new){({event:eventForm,reminder:reminderForm,task:taskForm,recipe:recipeForm,birthday:birthdayForm,vacation:vacationForm})[d.new]();return}
  if(d.editEvent){eventForm(S.events.find(x=>x.id===d.editEvent));return}
  if(d.editRem){reminderForm(S.reminders.find(x=>x.id===d.editRem));return}
  if(d.editTask){taskForm(S.tasks.find(x=>x.id===d.editTask));return}
  if(d.viewRecipe){recipeView(S.recipes.find(x=>x.id===d.viewRecipe));return}
  if(d.openMeal){mealForm(d.openMeal);return}
  if(d.toggleRem){const r=S.reminders.find(x=>x.id===d.toggleRem);if(r){const{id,...rest}=r;save('reminders',id,{...rest,done:!r.done})}return}
  if(d.toggleTask){const r=S.tasks.find(x=>x.id===d.toggleTask);if(r){const{id,...rest}=r;
    if(r.repeat){const dd=new Set(r.doneDates||[]);dd.has(TODAY)?dd.delete(TODAY):dd.add(TODAY);
      const cut=parse(TODAY);cut.setDate(cut.getDate()-35);const c=iso(cut);
      save('tasks',id,{...rest,doneDates:[...dd].filter(x=>x>=c).sort()})}
    else save('tasks',id,{...rest,done:!r.done,doneAt:!r.done?TODAY:''})}return}
  if(d.clear){
    if(!t.dataset.armed){t.dataset.armed='1';t.textContent='Toca de novo para confirmar';return}
    S[d.clear].filter(x=>x.done&&matches(x)).forEach(x=>remove(d.clear,x.id));return}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
let tt;function toast(msg){clearTimeout(tt);document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=msg;document.body.appendChild(el);tt=setTimeout(()=>el.remove(),2600)}

document.getElementById('todayLabel').textContent=niceDate(TODAY);
document.addEventListener('pointerdown',bumpIdle,{passive:true});
document.addEventListener('click',()=>{if(S.needTap&&S.mcp&&S.wall&&lsGet('fam.gconsent')){S.needTap=false;S.autoSynced=false;allowGooglePrompt();maybeAutoSync()}},true);
document.addEventListener('visibilitychange',keepAwake);
let sw=null;
document.addEventListener('pointerdown',e=>{const z=e.target.closest('[data-swipe]');sw=z&&!overlay.innerHTML?{x:e.clientX,y:e.clientY,k:z.dataset.swipe}:null},{passive:true});
document.addEventListener('pointerup',e=>{
  if(!sw)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y,k=sw.k;sw=null;
  if(Math.abs(dx)<70||Math.abs(dy)>Math.abs(dx)*.7)return;const n=dx<0?1:-1;
  if(k==='month'){const[y,m]=S.month.split('-').map(Number);S.month=iso(new Date(y,m-1+n,1)).slice(0,7);render()}
  else if(k==='wall')wallStep(n);
},{passive:true});
setInterval(()=>{
  const t=iso(new Date());
  if(t!==TODAY){const old=TODAY;TODAY=t;if(S.sel===old){S.sel=t;S.month=t.slice(0,7)}if(S.wallDate===old)S.wallDate=t;
    document.getElementById('todayLabel').textContent=niceDate(t);render();return}
  if(S.wall&&!overlay.innerHTML&&S.wallView==='moldura'&&S.photos.length>1){renderWall();return}
  if(S.wall&&nowHM()!==S.lastHM){if(!overlay.innerHTML)renderWall();else{S.lastHM=nowHM();const c=document.getElementById('wClock');if(c)c.textContent=S.lastHM}}
},15000);
setInterval(()=>{if(!S.needTap){S.autoSynced=false;maybeAutoSync()}},15*60*1000);

renderBanner();render();
if(S.wall)keepAwake();
