// Estado do leitor de vídeo/rádio (declarado no início para estar pronto no primeiro desenho do ecrã).
var stations=null,stationsBusy=false,audioEl=null,hls=null,radioTry=0;
var NOS_URL='https://nostv.pt/inicio/L3YxL215dHYvcm9vdD9jb250ZXh0PW90dF9tb2JpbGVfd2ViX3Yx';
const TABS=[
 {id:'agenda',label:'Agenda',icon:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'},
 {id:'lembretes',label:'Lembretes',icon:'<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>'},
 {id:'tarefas',label:'Tarefas',icon:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>'},
 {id:'compras',label:'Compras',icon:'<path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'},
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
  wall:lsGet('fam.wall')==='1'||location.hash==='#mural', wallView:lsGet('fam.wallView')||'inicio', frameMode:lsGet('fam.frameMode')||'galeria', wallDate:TODAY, lastHM:'', rotPart:null, prize:null, assets:null, wallSel:[], media:{videos:[],radios:[],sites:[]}
};
const GSERVER='Google Calendar';

/* ---------- store layer: shared db when available, in-memory otherwise ---------- */
const COLS=['events','reminders','tasks','recipes','meals','birthdays','vacations','photos','shopHistory','schoolBreaks'];
S.schoolBreaks=[];S.birthdays=[];S.vacations=[];S.photos=[];S.shopHistory=[];S.shopLists=[];S.shopList=lsGet('fam.shopList')||'';S.agView='cal';
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
    db.doc('data/users/'+S.uid+'/profile').onSnapshot(s=>{S.me=s.exists?s.data():null;S.meLoaded=true;maybeAutoSync();render()},()=>{});
  }
  db.collection('gcal').onSnapshot(snap=>{S.gcal={};snap.docs.forEach(d=>S.gcal[d.id]=d.data());render()},()=>{});
  famBackend.use('mcp').then(m=>{S.mcp=m;maybeAutoSync()}).catch(()=>{});
  famBackend.use('assets').then(a=>{S.assets=a}).catch(()=>{});
  db.doc('config/shopLists').onSnapshot(s=>{const l=s.exists&&s.data().lists;S.shopLists=Array.isArray(l)?l:[];render()},()=>{});
  db.doc('config/media').onSnapshot(s=>{const d=s.exists?s.data():{};S.media={videos:Array.isArray(d.videos)?d.videos:[],radios:Array.isArray(d.radios)?d.radios:[],sites:Array.isArray(d.sites)?d.sites:[]};if(overlay.querySelector('[data-mediasheet]'))mediaSheet()},()=>{});
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
  if(c==='scope_missing')return 'Na janela do Google, marca as caixas do Google Calendar (ver e editar eventos) antes de carregar em Continuar.';
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
  if(S.gbusy&&Date.now()-S.gbusy<90000)return;S.gbusy=Date.now();if(manual)toast('A sincronizar com o Google…');
  if(!chosen.length){S.gbusy=false;if(manual){toast('Ainda não escolheste calendários. Abre O meu Google.');googleSheet()}return}
  try{
    const names={};(prof.calNames?Object.entries(prof.calNames):[]).forEach(([k,v])=>names[k]=v);
    const [from,to]=syncWindow();const out=[];
    const failed=[];let firstErr=null;
    for(const [cid,mode] of chosen){
      let token,n=0;
      try{
      do{
        const r=await S.mcp.callTool(GSERVER,'list_events',{calendarId:cid,startTime:from,endTime:to,pageSize:250,...(token?{pageToken:token}:{})},{cache:false});
        const p=r.payload||{};
        const owner=(prof.calMember||{})[cid]||prof.memberId;
        (p.events||[]).forEach(e=>{const x=toEv(e,mode,names[cid]||p.summary);if(x){x.m=owner;out.push(x)}});
        token=p.nextPageToken;n++;
      }while(token&&n<4);
      }catch(e){
        // Sem autorização não vale a pena tentar os outros calendários.
        if(e&&(e.code==='approval_required'||e.code==='scope_missing'))throw e;
        failed.push(names[cid]||cid);firstErr=firstErr||e;console.warn('Google Calendar',cid,e);
      }
    }
    if(failed.length===chosen.length&&firstErr)throw firstErr;
    out.sort((a,b)=>(a.d+a.h).localeCompare(b.d+b.h));
    await S.db.doc('gcal/'+prof.memberId).set({events:out.slice(0,1500),updatedAt:new Date().toISOString()});
    S.gerr='';
    if(manual)toast(out.length+' eventos do Google sincronizados'+(failed.length?' (não deu: '+failed.join(', ')+')':''));
  }catch(e){
    console.warn('Sincronização Google',e);
    if(e&&e.code==='approval_required'&&!manual)S.needTap=true;
    else{S.gerr=gErr(e);toast(S.gerr)}
  }
  S.gbusy=false;render();
}
function maybeAutoSync(){
  if(S.mcp&&S.me&&S.me.memberId&&!S.calsLoaded){S.calsLoaded=true;fetchCals().then(c=>{S.myCals=c}).catch(()=>{})}
  const fb=window.famBackend;
  if(fb&&fb.authError&&S.mcp){S.gerr=gErr(fb.authError);fb.authError=null;toast(S.gerr)}
  if(fb&&fb.justAuthorized&&S.mcp&&S.db&&S.uid&&S.meLoaded){const what=fb.justAuthorized;fb.justAuthorized='';
    if(what==='sheet'||!S.me||!S.me.memberId){googleSheet();return}
    S.autoSynced=true;syncGoogle(S.me,true);return}
  if(S.autoSynced||!S.mcp||!S.db||!S.me||!S.me.memberId)return;
  const last=S.gcal[S.me.memberId]&&S.gcal[S.me.memberId].updatedAt;
  if(last&&Date.now()-Date.parse(last)<15*60*1000){S.autoSynced=true;return}
  S.autoSynced=true;syncGoogle(S.me,false);
}
// Evita mostrar duas vezes a mesma aula: se o Quadro já tem um evento da pessoa à mesma hora, o do Google é omitido.
let _localCache={};
function localAt(d){const k=d+'|'+S.events.length+'|'+(S.events[0]&&S.events[0].id);if(_localCache.k!==k){_localCache={k,v:S.events.filter(e=>e.time&&(e.date===d||(e.repeat==='weekly'&&e.date<=d&&dowMon(parse(e.date))===dowMon(parse(d)))))}}return _localCache.v}
function gcalOn(d){
  const out=[],seen=new Set();
  Object.entries(S.gcal).forEach(([mid,doc])=>{
    (doc.events||[]).forEach(x=>{
      const m=x.m||mid;if(m!=='all'&&!member(m))return;
      if(!gOK(m,x.c))return;
      if(d<x.d||d>x.e)return;
      if(x.c&&/feriad/i.test(x.c)&&holidayOn(d))return;
      const k=m+'|'+x.t+'|'+x.d+'|'+x.h;if(seen.has(k))return;seen.add(k);
      if(x.h&&x.d===d&&localAt(d).some(e=>e.time===x.h&&whoList(e.who).includes(m)))return;
      out.push({...x,mid:m});
    });
  });
  return out;
}
function ago(isoStr){const m=Math.round((Date.now()-Date.parse(isoStr))/60000);if(m<1)return 'agora';if(m<60)return 'há '+m+' min';const h=Math.round(m/60);if(h<24)return 'há '+h+' h';return 'há '+Math.round(h/24)+' dias'}

function allowGooglePrompt(after){if(window.famBackend){window.famBackend.interactiveUntil=Date.now()+4000;window.famBackend.afterAuth=after||'sync'}}
async function googleSheet(){
  allowGooglePrompt('sheet');
  if(!S.live){toast('Configura o Firebase para ligar o Google (ver README).');return}
  if(!S.uid){toast('Entra com a tua conta Google primeiro.');return}
  const me=S.me||{};
  const f=sheet('O meu Google Calendar',`
    <p class="muted small" style="margin:0">Escolhe quem és e que calendários teus aparecem na Agenda. A família vê os eventos dos calendários que marcares. Usa <b>Só "Ocupado"</b> para o calendário do trabalho.</p>
    <p class="muted small" style="margin:0">Se outra pessoa partilhou o calendário dela contigo no Google, escolhe <b>É de…</b> e os eventos aparecem com a cor dela. Um calendário partilhado, como o "Família", fica em <b>É da família</b> e aparece para todos. Assim o ecrã de parede mostra toda a família sem cada um ter de abrir o Quadro.</p>
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
        <select id="gm-${i}" data-calm="${esc(c.id)}" class="gsel" aria-label="De quem é"><option value="">É meu</option><option value="all" ${cm==='all'?'selected':''}>É da família (todos)</option>${S.members.map(m=>`<option value="${m.id}" ${cm===m.id?'selected':''}>É de ${esc(m.name)}</option>`).join('')}</select></div>`}).join('');
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
const colorOf=id=>id==='all'?'var(--accent)':`var(--${(member(id)||{}).color||'muted'})`;
const gName=id=>member(id)?member(id).name:'Família';
function whoList(who){return (!who||!who.length||who.includes('all'))?['all']:who}
function matches(item){const w=whoList(item.who),f=S.filter;if(f==='all')return true;
  if(typeof f==='object')return f.m.length>0&&(w.includes('all')||w.some(x=>f.m.includes(x)));
  return w.includes('all')||w.includes(f)}
function gOK(m,c){const f=S.filter;if(f==='all')return true;if(typeof f==='object')return (m==='all'?f.m.length>0:f.m.includes(m))||(!!c&&f.c.includes(c));return m==='all'||f===m}
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
    if(e.school&&whoList(e.who).every(m=>schoolOff(m,d)))return false;
    if(e.date===d)return true;
    if(e.date>d)return false;
    if(e.repeat==='yearly')return e.date.slice(5)===d.slice(5);
    if(e.repeat==='weekly')return dowMon(parse(e.date))===dowMon(dd);
    if(e.repeat==='monthly')return e.date.slice(8)===d.slice(8);
    return false;
  }).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
}
function breaksOn(d){return S.schoolBreaks.filter(b=>b.start&&d>=b.start&&d<=(b.end||b.start))}
// Feriados nacionais de Portugal (fixos + móveis calculados a partir da Páscoa).
function easterOf(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
  h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
  mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
const _hol={};
function holidaysOf(y){
  if(_hol[y])return _hol[y];const r={},add=(dt,n)=>{r[iso(dt)]=n};
  [[1,1,'Ano Novo'],[4,25,'Dia da Liberdade'],[5,1,'Dia do Trabalhador'],[6,10,'Dia de Portugal'],[8,15,'Assunção de Nossa Senhora'],
   [10,5,'Implantação da República'],[11,1,'Dia de Todos os Santos'],[12,1,'Restauração da Independência'],[12,8,'Imaculada Conceição'],[12,25,'Natal']]
   .forEach(([m,d,n])=>add(new Date(y,m-1,d),n));
  const e=easterOf(y),sh=n=>{const x=new Date(e);x.setDate(x.getDate()+n);return x};
  add(sh(-2),'Sexta-feira Santa');add(sh(0),'Páscoa');add(sh(60),'Corpo de Deus');
  return _hol[y]=r;
}
function holidayOn(d){return holidaysOf(+d.slice(0,4))[d]||''}
function schoolOff(m,d){return breaksOn(d).some(b=>{const w=whoList(b.who);return w.includes('all')||w.includes(m)})||!!holidayOn(d)}
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
    ${t.id==='compras'&&shopItems().filter(x=>!x.done).length?`<span class="badge" style="background:var(--accent)">${shopItems().filter(x=>!x.done).length}</span>`:''}${t.id==='lembretes'&&pendingToday?`<span class="badge">${pendingToday}</span>`:''}</button>`).join('');
}
function renderMain(){
  const m=document.getElementById('main');
  m.innerHTML=({agenda:viewAgenda,lembretes:viewReminders,tarefas:viewTasks,compras:viewShopping,almocos:viewLunch})[S.tab]();
  refocus();
}

function viewAgenda(){
  const seg=`<div class="seg" role="group" aria-label="Agenda"><button data-ag="cal" aria-pressed="${S.agView==='cal'}">Calendário</button><button data-ag="aniv" aria-pressed="${S.agView==='aniv'}">Aniversários</button><button data-ag="ferias" aria-pressed="${S.agView==='ferias'}">Férias</button><button data-ag="escola" aria-pressed="${S.agView==='escola'}">Férias escolares</button></div>`;
  if(S.agView==='aniv')return viewBirthdays(seg);
  if(S.agView==='escola')return viewSchoolBreaks(seg);
  if(S.agView==='ferias')return viewVacations(seg);
  return viewCalendar(seg);
}
const SCHOOL_PRESET_2627=[
  {title:'Natal',start:'2026-12-16',end:'2027-01-03'},
  {title:'Carnaval',start:'2027-02-08',end:'2027-02-10'},
  {title:'Páscoa',start:'2027-03-22',end:'2027-04-02'}];
function schoolMembers(){return [...new Set(S.events.filter(e=>e.school).flatMap(e=>whoList(e.who)).filter(m=>m!=='all'&&member(m)))]}
function viewSchoolBreaks(seg){
  const rows=[...S.schoolBreaks].sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  const up=rows.filter(b=>(b.end||b.start)>=TODAY),past=rows.filter(b=>(b.end||b.start)<TODAY).reverse();
  const days=b=>Math.round((parse(b.end||b.start)-parse(b.start))/864e5)+1;
  const line=b=>`<button class="item" data-edit-break="${b.id}"><span class="body"><div class="t">${esc(b.title)}</div>
    <div class="sub">${niceDate(b.start)}${b.end&&b.end!==b.start?' → '+niceDate(b.end):''} · ${days(b)} ${days(b)===1?'dia':'dias'} sem aulas</div>
    <div class="people">${peopleTags(b.who)}</div></span>${b.start<=TODAY&&TODAY<=(b.end||b.start)?'<span class="ptag" style="--c:var(--accent)">A decorrer</span>':''}</button>`;
  const missing=SCHOOL_PRESET_2627.filter(p=>!S.schoolBreaks.some(b=>b.start===p.start));
  return `<section class="panel">${seg}
    <div class="row"><h2>Férias escolares</h2><span class="spacer"></span>${S.readOnly?'':'<button class="addbtn" data-new="break">+ Período</button>'}</div>
    <p class="muted small" style="margin:0">Nestes dias as aulas das pessoas escolhidas deixam de aparecer no Quadro, incluindo as que vêm do Google. Nos feriados nacionais também não há aulas.</p>
    ${missing.length&&!S.readOnly?`<div class="banner row" style="flex-wrap:wrap"><span style="flex:1;min-width:200px">Calendário escolar 2026/27 (continente): Natal 16/12–3/1, Carnaval 8–10/2, Páscoa 22/3–2/4.</span><button class="addbtn" data-schoolpreset>Adicionar para ${schoolMembers().map(m=>esc(member(m).name)).join(' e ')||'todos'}</button></div>`:''}
    <div class="list">${up.map(line).join('')||'<div class="empty">Sem férias escolares marcadas.<br>Acrescenta um período e escolhe quem fica sem aulas.</div>'}</div>
    ${past.length?`<span class="kind">Anteriores</span><div class="list">${past.slice(0,10).map(line).join('')}</div>`:''}
  </section>`;
}
function breakForm(b){
  b=b||{start:S.sel,end:S.sel,who:schoolMembers().length?schoolMembers():['all']};
  sheet(b.id?'Editar férias escolares':'Novas férias escolares',`
    <label class="field"><span>Nome</span><input id="sb-title" name="title" value="${esc(b.title)}" placeholder="Ex.: Férias da Páscoa, Ponte, Greve"></label>
    <div class="two"><label class="field"><span>De</span><input id="sb-start" type="date" name="start" value="${esc(b.start)}"></label>
    <label class="field"><span>Até</span><input id="sb-end" type="date" name="end" value="${esc(b.end)}"></label></div>
    ${whoField(b.who)}`,
  {onSave:f=>{const title=val(f,'title'),start=val(f,'start'),end=val(f,'end')||start;
      if(!title||!start){toast('Preenche o nome e a data de início.');return false}
      if(end<start){toast('A data de fim é antes do início.');return false}
      save('schoolBreaks',b.id,{title,start,end,who:readWho(f)})},
   onDelete:b.id&&!S.readOnly?()=>remove('schoolBreaks',b.id):null});
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
      ...(holidayOn(ds)?['var(--danger)']:[]),
      ...(birthdaysOn(ds).length?['var(--accent)']:[])
    ])].slice(0,4);
    if(rm.length&&dots.length<4)dots.push('var(--muted)');
    cells+=`<button class="day ${d.getMonth()!==mo-1?'out':''} ${ds===TODAY?'today':''} ${ds===S.sel?'sel':''}" data-day="${ds}" aria-label="${niceDate(ds)}${ev.length?', '+ev.length+' eventos':''}">
      <span class="n">${d.getDate()}</span><span class="ds">${dots.map(c=>`<i style="--c:${c}"></i>`).join('')}</span></button>`;
  }
  const ev=eventsOn(S.sel),rm=remindersOn(S.sel),meal=S.meals[S.sel];
  let items='';
  items+=birthdaysOn(S.sel).map(b=>{const a=ageOn(b,S.sel);return `<button class="item" data-edit-bday="${b.id}"><span class="time">🎂︎</span><span class="body"><span class="kind">Aniversário</span><div class="t">${esc(b.name)}${a!==null&&a>0?' · '+a+' anos':''}</div></span></button>`}).join('');
  if(holidayOn(S.sel))items+=`<div class="item"><span class="time">Dia</span><span class="body"><span class="kind" style="color:var(--danger)">Feriado nacional</span><div class="t">${esc(holidayOn(S.sel))}</div></span></div>`;
  items+=breaksOn(S.sel).filter(b=>matches(b)).map(b=>`<button class="item" data-edit-break="${b.id}"><span class="time">Dia</span><span class="body"><span class="kind">Sem aulas</span><div class="t">${esc(b.title)}</div><div class="people">${peopleTags(b.who)}</div></span></button>`).join('');
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
      <div class="people"><span class="ptag" style="--c:${colorOf(g.mid)}">${esc(gName(g.mid))}</span></div></span></div>`}).join('');
  items+=rm.map(r=>`<div class="item ${r.done?'done':''}"><button class="check" role="checkbox" aria-checked="${!!r.done}" data-toggle-rem="${r.id}" aria-label="Feito"></button>
      <span class="body"><span class="kind">Lembrete${r.time?' · '+esc(r.time):''}</span><div class="t">${esc(r.text)}</div><div class="people">${peopleTags(r.who)}</div></span>
      <button class="edit" data-edit-rem="${r.id}">Editar</button></div>`).join('');
  const synced=Object.entries(S.gcal).filter(([mid,d])=>member(mid)&&d.updatedAt).map(([mid,d])=>`${esc(member(mid).name)} ${ago(d.updatedAt)}`);
  const gline=`<div class="row small muted" style="flex-wrap:wrap"><span>${synced.length?'Google atualizado: '+synced.join(' · '):'Google ainda não sincronizado.'}${S.gerr?` <span style="color:var(--danger)">${esc(S.gerr)}</span>`:''}</span><span class="spacer"></span>${S.mcp&&S.me&&S.me.memberId?'<button class="edit" data-gsync>Sincronizar agora</button>':''}<button class="edit" data-gsetup>${S.me&&S.me.memberId?'O meu Google':'Ligar o meu Google'}</button></div>`;
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

const DEF_SHOP='Supermercado';
function shopLists(){return S.shopLists&&S.shopLists.length?S.shopLists:[DEF_SHOP]}
function curShop(){const l=shopLists();return l.includes(S.shopList)?S.shopList:l[0]}
const storeOf=t=>t.store||DEF_SHOP;
function shopItems(store){return S.tasks.filter(t=>t.list==='Compras'&&(!store||storeOf(t)===store))}
function slugify(x){return String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)}
const daysBetween=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
function shopStats(h){const ds=[...new Set(h.dates||[])].sort();const since=h.last?daysBetween(h.last,TODAY):null;
  const avg=ds.length>=2?daysBetween(ds[0],ds[ds.length-1])/(ds.length-1):null;return {since,avg}}
function shopSuggestions(store){
  const open=new Set(shopItems().filter(t=>!t.done).map(t=>slugify(t.text)));
  return S.shopHistory.filter(h=>!open.has(h.id)&&(h.store||DEF_SHOP)===store).map(h=>{
    const {since,avg}=shopStats(h);if(since===null)return null;
    const dd=n=>n+' '+(n===1?'dia':'dias');
    return avg&&avg>0?{h,score:since/avg,why:`costuma ser a cada ${dd(Math.max(1,Math.round(avg)))} · última há ${dd(since)}`}
                     :{h,score:since/21,why:`comprado há ${dd(since)}`};
  }).filter(x=>x&&x.score>=0.85).sort((a,b)=>b.score-a.score||(b.h.count||0)-(a.h.count||0)).slice(0,10);
}
function recordPurchase(t){const id=slugify(t.text);if(!id)return;const h=S.shopHistory.find(x=>x.id===id)||{};
  const dates=[...new Set([...(h.dates||[]),TODAY])].sort().slice(-12);
  save('shopHistory',id,{name:t.text,count:(h.count||0)+1,last:TODAY,dates,store:storeOf(t)})}
function saveShopLists(lists){if(S.db)S.db.doc('config/shopLists').set({lists}).catch(handleWriteError);else{S.shopLists=lists;render()}}
function addShopItem(text,store){save('tasks',null,{text,list:'Compras',store:store||curShop(),due:'',who:['all'],done:false,doneAt:'',repeat:'',part:'',doneDates:[]})}
function shopBody(big){
  const store=curShop(),it=shopItems(store);
  const open=it.filter(t=>!t.done).sort((a,b)=>(a.text||'').localeCompare(b.text||'','pt')),got=it.filter(t=>t.done);
  const lists=`<div class="${big?'w-who':'who'}" role="group" aria-label="Listas de compras">${shopLists().map(l=>{const n=shopItems(l).filter(x=>!x.done).length;
      return `<button class="chip" data-shoplist="${esc(l)}" aria-pressed="${l===store}">${esc(l)}${n?` <b>${n}</b>`:''}</button>`}).join('')}
    ${S.readOnly?'':'<button class="chip" data-shopnew>+ Lista</button>'}<button class="chip" data-shophist aria-pressed="${!!S.shopShowHist}">Histórico</button></div>`;
  const dl=`<datalist id="shophist">${S.shopHistory.map(h=>`<option value="${esc(h.name)}"></option>`).join('')}</datalist>`;
  const sug=S.readOnly?[]:shopSuggestions(store);
  const sugHtml=sug.length?`<div class="field"><span>Sugestões pelo histórico</span><div class="sugs">${sug.map(x=>`<button class="sug" data-shopsug="${esc(x.h.id)}"><b>+ ${esc(x.h.name)}</b><small>${esc(x.why)}</small></button>`).join('')}</div></div>`:'';
  const nline=t=>`<div class="item ${t.done?'done':''}"><button class="check" role="checkbox" aria-checked="${!!t.done}" data-toggle-task="${t.id}" aria-label="Comprado"></button>
    <span class="body"><div class="t">${esc(t.text)}</div>${whoList(t.who).includes('all')?'':`<div class="people">${peopleTags(t.who)}</div>`}</span>
    <button class="edit" data-edit-task="${t.id}">Editar</button></div>`;
  const wline=t=>`<button class="w-rtask w-shopit${t.done?' ok':''}" data-toggle-task="${t.id}" role="checkbox" aria-checked="${!!t.done}" style="--c:var(--accent)"><span class="box">${t.done?'✓':''}</span><span class="tt">${esc(t.text)}</span></button>`;
  const wrapOpen=big?`<div class="w-shop">${open.map(wline).join('')||'<div class="empty">Nada em falta nesta lista. Escreve acima o que acabar.</div>'}</div>`
                   :`<div class="list">${open.map(nline).join('')||'<div class="empty">A lista está vazia.<br>Escreve acima o que falta. Podes pôr vários de uma vez, separados por vírgulas.</div>'}</div>`;
  const wrapGot=got.length?`<div class="row" style="margin-top:6px"><span class="kind">No carrinho (${got.length})</span><span class="spacer"></span><button class="edit" data-clearshop>Limpar comprados</button></div>
    ${big?`<div class="w-shop">${got.map(wline).join('')}</div>`:`<div class="list">${got.slice(0,40).map(nline).join('')}</div>`}`:'';
  let hist='';
  if(S.shopShowHist){
    const hs=S.shopHistory.filter(h=>(h.store||DEF_SHOP)===store).sort((a,b)=>(b.last||'').localeCompare(a.last||''));
    hist=`<div class="field"><span>Histórico · ${esc(store)}</span><div class="list">${hs.map(h=>{const {since,avg}=shopStats(h);
      return `<div class="item"><span class="body"><div class="t">${esc(h.name)}</div><div class="sub">${h.count||0} ${h.count===1?'vez':'vezes'} · última ${since===0?'hoje':'há '+since+' dias'}${avg?` · a cada ~${Math.max(1,Math.round(avg))} dias`:''}</div></span>
      ${S.readOnly?'':`<button class="edit" data-shopsug="${esc(h.id)}">Adicionar</button>`}</div>`}).join('')||'<div class="empty">Ainda sem histórico. Fica registado cada vez que marcas um artigo como comprado.</div>'}</div></div>`;
  }
  return `${lists}${S.readOnly?'':shopAddForm(big)}${dl}${sugHtml}${wrapOpen}${wrapGot}${hist}`;
}
function shopAddForm(big){return `<form class="shopadd${big?' big':''}" data-shopform><input id="${big?'shop-new-w':'shop-new'}" name="item" list="shophist" placeholder="Acrescentar à lista… (ex.: leite, pão, ovos)" autocomplete="off" aria-label="Novo artigo para comprar"><button class="addbtn" type="submit">Adicionar</button></form>`}
function refocus(){if(S.refocusId&&Date.now()<S.refocusUntil){const el=document.getElementById(S.refocusId);if(el)el.focus()}}
function viewShopping(){
  return `<section class="panel"><div class="row"><h2>Compras</h2><span class="spacer"></span><span class="muted small">${shopItems(curShop()).filter(x=>!x.done).length} por comprar em ${esc(curShop())}</span></div>${shopBody(false)}</section>`;
}

function shopListsSheet(){
  sheet('Listas de compras',`<p class="muted small" style="margin:0">Cria uma lista para cada sítio onde compras, por exemplo Farmácia, Talho ou Bricolage.</p>
    <label class="field"><span>Nova lista</span><input id="sl-new" name="name" placeholder="Ex.: Farmácia" autocomplete="off"></label>
    <div class="field"><span>Listas atuais</span><div class="list">${shopLists().map(l=>`<div class="item"><span class="body"><div class="t">${esc(l)}</div><div class="sub">${shopItems(l).filter(x=>!x.done).length} por comprar</div></span>${shopLists().length>1?`<button type="button" class="edit" data-dellist="${esc(l)}">Apagar</button>`:''}</div>`).join('')}</div></div>`,
  {saveLabel:'Criar lista',onSave:f=>{const n=val(f,'name');if(!n){toast('Escreve o nome da lista.');return false}
    if(shopLists().some(l=>l.toLowerCase()===n.toLowerCase())){toast('Já existe uma lista com esse nome.');return false}
    saveShopLists([...shopLists(),n]);S.shopList=n;lsSet('fam.shopList',n)}});
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
    <label class="row" style="gap:10px"><input type="checkbox" id="r-alarm" name="alarm" ${r.alarm===false?'':'checked'} style="width:22px;height:22px;accent-color:var(--accent)"><span>Tocar alarme à hora marcada <span class="muted small">(no ecrã da parede e nos aparelhos com o Quadro aberto)</span></span></label>
    ${whoField(r.who)}`,
  {onSave:f=>{const text=val(f,'text');if(!text){toast('Escreve o lembrete.');return false}
      save('reminders',r.id,{text,date:val(f,'date'),time:val(f,'time'),who:readWho(f),done:!!r.done,alarm:!!(f.elements.alarm&&f.elements.alarm.checked)})},
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
  ['events','reminders','tasks','recipes','birthdays','vacations','shopHistory','schoolBreaks'].forEach(c=>{out[c]=S[c]});out.config.shopLists=S.shopLists||[];
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
  for(const c of ['events','reminders','tasks','recipes','birthdays','vacations','meals','shopHistory','schoolBreaks']){
    for(const row of (Array.isArray(j[c])?j[c]:[])){
      if(!row||!row.id)continue;const {id,...data}=row;
      await put(c+'/'+String(id).replace(/\//g,'_'),data);
    }
  }
  if(j.config&&j.config.family&&Array.isArray(j.config.family.members))await put('config/family',{members:j.config.family.members});
  if(j.config&&j.config.prize)await put('config/prize',j.config.prize);
  if(j.config&&Array.isArray(j.config.shopLists)&&j.config.shopLists.length)await put('config/shopLists',{lists:j.config.shopLists});
  if(j.profile&&S.uid)await put('data/users/'+S.uid+'/profile',j.profile);
  toast(fail?n+' itens importados, '+fail+' falharam.':n+' itens importados.');
}

/* ---------- wall / touch display ---------- */
function schoolEnd(e){const m=/até (\d\d:\d\d)/.exec(e.note||'');return m?m[1]:''}
function nowHM(){const n=new Date();return pad(n.getHours())+':'+pad(n.getMinutes())}
const isAll=x=>whoList(x.who).includes('all');
const forM=(x,m)=>!isAll(x)&&whoList(x.who).includes(m);
function wallData(d){
  const f=S.filter;S.filter=wFilter();
  const r={ev:eventsOn(d),rm:remindersOn(d),vac:vacationsOn(d),g:gcalOn(d),bd:birthdaysOn(d),meal:S.meals[d]};
  S.filter=f;return r;
}
function colItems(m,D,d){
  const its=[];
  D.vac.filter(v=>forM(v,m)).forEach(v=>its.push({k:'',t:'Férias · '+v.title,s:'até '+niceDate(v.end||v.start),a:`data-edit-vac="${v.id}"`}));
  D.ev.filter(e=>forM(e,m)).forEach(e=>its.push({k:e.time||'',end:schoolEnd(e),t:e.title,s:e.place||'',a:`data-edit-event="${e.id}"`}));
  D.g.filter(g=>g.mid===m||g.mid==='all').forEach(g=>{const st=!!g.h&&g.d===d;its.push({k:st?g.h:'',end:st&&g.d===g.e?g.he:'',t:g.t,s:[g.c,g.p].filter(Boolean).join(' · ')})});
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
  return `<p class="small muted row" style="margin:12px 0 0;flex-wrap:wrap">${s.length?'Google atualizado: '+s.join(' · '):'Google Calendar ainda não sincronizado neste Quadro.'}${S.gerr?` <span style="color:var(--danger)">${esc(S.gerr)}</span>`:''}${S.mcp?' <button class="edit" data-gsync>Sincronizar agora</button>':''}</p>`;
}
function wSel(){const s=S.wallSel||[];return {m:s.filter(x=>member(x)),c:s.filter(x=>x.startsWith('cal:')).map(x=>x.slice(4))}}
function wFilter(){const f=wSel();return f.m.length||f.c.length?f:'all'}
function gcalCals(){const map=new Map();Object.entries(S.gcal).forEach(([mid,doc])=>(doc.events||[]).forEach(x=>{const m=x.m||mid;if(!x.c||(m!=='all'&&!member(m)))return;if(!map.has(x.c))map.set(x.c,new Set());map.get(x.c).add(m)}));
  return [...map].map(([c,ms])=>({c,ms:[...ms]})).sort((a,b)=>a.ms[0].localeCompare(b.ms[0])||a.c.localeCompare(b.c))}
function wallMembers(){const f=wSel();if(f.m.length)return S.members.filter(m=>f.m.includes(m.id));
  if(f.c.length){const own=new Set(gcalCals().filter(x=>f.c.includes(x.c)).flatMap(x=>x.ms));return S.members.filter(m=>own.has(m.id))}
  return S.members}
function wMatch(x){const sv=S.filter;S.filter=wFilter();const r=matches(x);S.filter=sv;return r}
function toggleSel(k){const s=new Set(S.wallSel||[]);s.has(k)?s.delete(k):s.add(k);S.wallSel=[...s]}
const CAL_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>';
function whoBar(){const f=wSel(),none=!f.m.length&&!f.c.length,cals=gcalCals();
  return `<div class="fd-people" role="group" aria-label="Filtrar por pessoa (podes escolher várias)"><button class="fd-p fd-all" data-wf="all" aria-pressed="${none}"><span class="av av-all"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><circle cx="17.5" cy="9" r="2.4"/><path d="M16 14.2c2.6-.3 4.6 1.3 5 4.3"/></svg></span>Todos</button>${S.members.map(m=>`<button class="fd-p" data-wf="${m.id}" aria-pressed="${f.m.includes(m.id)}">${avatar(m.id)}<span class="fd-pn">${esc(m.name)}</span></button>`).join('')}${cals.length?`<button class="fd-p" data-wcals aria-pressed="${f.c.length>0}"><span class="av av-all">${CAL_SVG}</span><span class="fd-pn">Calendários${f.c.length?' · '+f.c.length:''}</span></button>`:''}</div>`}
function calSheet(){
  const f=wSel(),cals=gcalCals();
  sheet('Calendários',`<p class="muted small" style="margin:0 0 4px">Escolhe pessoas e calendários do Google. Podes juntar vários: o Quadro mostra tudo o que pertence a qualquer um deles.</p>
    <div class="field"><span>Pessoas</span><div class="who" style="flex-wrap:wrap">${S.members.map(m=>`<button type="button" class="chip" data-selk="${m.id}" aria-pressed="${f.m.includes(m.id)}"><span class="dot" style="--c:var(--${m.color})"></span>${esc(m.name)}</button>`).join('')}</div></div>
    <div class="field"><span>Calendários do Google</span><div class="who" style="flex-wrap:wrap">${cals.map(x=>`<button type="button" class="chip" data-selk="cal:${esc(x.c)}" aria-pressed="${f.c.includes(x.c)}">${x.ms.map(m=>`<span class="dot" style="--c:${colorOf(m)}"></span>`).join('')}${esc(x.c)}</button>`).join('')||'<span class="muted small">Ainda não há calendários sincronizados.</span>'}</div></div>
    <button type="button" class="ghost" data-selclear>Mostrar todos</button>`);
  overlay.querySelector('form').dataset.calsheet='1';
}
function avatar(id,small){const m=member(id);if(!m)return `<span class="av av-all${small?' sm':''}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><circle cx="17.5" cy="9" r="2.4"/></svg></span>`;
  return `<span class="av${small?' sm':''}" style="--c:var(--${m.color})" aria-hidden="true">${esc((m.name||'?').trim().charAt(0).toUpperCase())}</span>`}
const NAV_ICONS={
  inicio:['#44403C','<path d="M4 11.5 12 5l8 6.5V20H4z"/><path d="M10 20v-5h4v5"/>'],
  semana:['#3B82F6','<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>'],
  hoje:['#0D9488','<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c.5-3 2.5-4.5 5-4.5s4.5 1.5 5 4.5M11 19c.5-3 2.5-4.5 5-4.5s4.5 1.5 5 4.5"/>'],
  linha:['#6366F1','<path d="M4 7h10M4 12h16M4 17h7"/>'],
  mes:['#0EA5E9','<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2"/>'],
  rotinas:['#A855F7','<path d="M5 7l2 2 3-3M5 14l2 2 3-3M13 8h6M13 15h6"/>'],
  compras:['#F97316','<path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'],
  avisos:['#EF4444','<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>'],
  moldura:['#10B981','<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 16l5-5 4 4 2-2 5 5"/><circle cx="15.5" cy="9" r="1.5"/>']};
function navBar(){
  return `<nav class="fd-nav" aria-label="Vistas"><div class="fd-nav-in">${LAYOUTS.map(([k,l])=>{const ic=NAV_ICONS[k]||['#888',''];
    return `<button data-wv="${k}" aria-pressed="${S.wallView===k}"><span class="ic" style="--ic:${ic[0]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ic[1]}</svg></span><span class="lb">${l}</span></button>`}).join('')}
    <button data-wset><span class="ic" style="--ic:#A3A3A3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg></span><span class="lb">Ajustes</span></button>
    <button data-wexit><span class="ic" style="--ic:#78716C"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/></svg></span><span class="lb">Sair</span></button></div></nav>`}
const LAYOUTS=[['inicio','Início'],['semana','Semana'],['hoje','Pessoas'],['linha','Linha'],['mes','Mês'],['rotinas','Rotinas'],['compras','Compras'],['avisos','Avisos'],['moldura','Moldura']];
const PARTS=[['manha','Manhã'],['tarde','Tarde'],['noite','Noite'],['tudo','Tudo']];
function curPart(){const h=new Date().getHours();return h<12?'manha':h<19?'tarde':'noite'}
function addMin(hm,n){const[h,m]=hm.split(':').map(Number);const t=Math.min(23*60+59,h*60+m+n);return pad(Math.floor(t/60))+':'+pad(t%60)}
function taskActive(t,d){return t.repeat!=='weekdays'||dowMon(parse(d))<5}
function isDone(t,d){d=d||TODAY;return t.repeat?(t.doneDates||[]).includes(d):!!t.done}
function weekStartOf(d){const x=parse(d);x.setDate(x.getDate()-dowMon(x));return iso(x)}
function starsFor(m){const ws=weekStartOf(TODAY);let n=0;
  S.tasks.forEach(t=>{if(!forM(t,m))return;if(t.repeat)n+=(t.doneDates||[]).filter(x=>x>=ws&&x<=TODAY).length;else if(t.done&&t.doneAt&&t.doneAt>=ws)n++});return n}
function photoUrl(p){return String(p.url||('/_blob/'+p.asset)).replace(/["'()\\\s]/g,'')}
function layoutBar(){return '';return `<div class="w-lay" role="group" aria-label="Vista">${LAYOUTS.map(([k,l])=>`<button data-wv="${k}" aria-pressed="${S.wallView===k}">${l}</button>`).join('')}</div>`}
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
  if(v==='compras')return `${esc(curShop())}<small>${shopItems(curShop()).filter(x=>!x.done).length} por comprar · listas de compras</small>`;
  if(v==='avisos')return `Avisos e alarmes<small>${niceDate(TODAY)}</small>`;
  if(v==='rotinas'){const p=S.rotPart||curPart();return `${p==='tudo'?'Rotinas de hoje':'Rotina da '+PARTS.find(x=>x[0]===p)[1].toLowerCase()}<small>${niceDate(TODAY)}</small>`}
  return `${rel(d)}<small>${d===TODAY?niceDate(d):'Toca em Hoje para voltar'}</small>`;
}
function wallHead(){
  const nav=!['rotinas','compras','avisos','inicio'].includes(S.wallView);
  const n=new Date();
  return `<div class="fd-top"><div class="fd-clock" id="wClock">${nowHM()}</div>
    <div class="fd-date"><b>${esc(DOW[dowMon(n)]+', '+n.getDate()+' '+MONTHS[n.getMonth()])}</b><small>${S.wallView==='inicio'?'Família '+esc(familyName()):wallLabel().replace(/<small>.*$/,'')}</small></div>
    ${whoBar()}
    <div class="fd-ctl">${nav?`<button class="fd-btn" data-wshift="-1" aria-label="Anterior">‹</button>${S.wallDate!==TODAY?'<button class="fd-btn" data-wtoday>Hoje</button>':''}<button class="fd-btn" data-wshift="1" aria-label="Seguinte">›</button>`:''}
      <button class="fd-btn" data-wgoogle>Google</button><button class="fd-btn" data-wfs aria-label="Ecrã inteiro">⛶</button></div></div>`;
}
function familyName(){const last=S.members.map(m=>(m.name||'').trim().split(/\s+/).slice(-1)[0]).filter(x=>x&&x.length>2);return S.familyName||'Ribeiro'}
function homeItems(d){
  const D=wallData(d),its=[],sc={};
  if(holidayOn(d))its.push({k:'',t:holidayOn(d),s:'Feriado nacional',m:'all'});
  D.bd.forEach(b=>its.push({k:'',t:'Aniversário · '+b.name,m:'all',a:`data-edit-bday="${b.id}"`}));
  D.vac.forEach(v=>{const w=whoList(v.who);its.push({k:'',t:'Férias · '+v.title,m:w.includes('all')||w.length>1?'all':w[0],a:`data-edit-vac="${v.id}"`})});
  D.ev.forEach(e=>{const w=whoList(e.who);
    if(e.school){const en=schoolEnd(e);w.forEach(m=>{const x=sc[m]||(sc[m]={k:e.time,end:en});if(e.time<x.k)x.k=e.time;if(en>x.end)x.end=en})}
    else its.push({k:e.time||'',end:e.time?(schoolEnd(e)||addMin(e.time,60)):'',t:e.title,s:e.place||'',m:w.includes('all')||w.length>1?'all':w[0],a:`data-edit-event="${e.id}"`})});
  Object.entries(sc).forEach(([m,x])=>{if(member(m))its.push({k:x.k,end:x.end,t:'Escola',s:member(m).name,m})});
  D.g.forEach(g=>{const h=g.h&&g.d===d?g.h:'';its.push({k:h,end:h?(g.he||addMin(h,60)):'',t:g.t,s:g.p||g.c||'',m:g.mid})});
  D.rm.filter(r=>!r.done&&r.time).forEach(r=>{const w=whoList(r.who);its.push({k:r.time,end:r.time,t:r.text,s:'Lembrete',m:w.includes('all')||w.length>1?'all':w[0],a:`data-edit-rem="${r.id}"`})});
  return its.sort((a,b)=>(a.k||'').localeCompare(b.k||''));
}
function wallHome(){
  const now=nowHM(),its=homeItems(TODAY),timed=its.filter(x=>x.k);
  const cur=timed.find(x=>x.k<=now&&x.end&&now<x.end),next=timed.find(x=>x.k>now);
  const main=cur||next,after=main?timed.find(x=>x.k>main.k&&x!==main):null;
  const mins=x=>toMin(x.k)-toMin(now);
  const col=m=>m&&m!=='all'&&member(m)?`var(--${member(m).color})`:'var(--accent)';
  const up=main?`<div class="fd-card fd-next" style="--c:${col(main.m)}"><div class="fd-next-main"><span class="fd-eyebrow">${cur?'AGORA':'A SEGUIR'}</span>
      <div class="fd-next-t">${esc(main.t)}</div><div class="fd-next-s">${esc(main.k)}${cur?' · até '+esc(main.end):' · <b>daqui a '+(mins(main)>=60?Math.floor(mins(main)/60)+' h '+(mins(main)%60?mins(main)%60+' min':''):mins(main)+' min')+'</b>'}${main.s?' · '+esc(main.s):''}</div></div>
      ${after?`<div class="fd-then"><span>depois</span><b>${esc(after.t)}</b><span>${esc(after.k)}</span></div>`:''}</div>`
    :`<div class="fd-card fd-next" style="--c:var(--accent)"><div class="fd-next-main"><span class="fd-eyebrow">A SEGUIR</span><div class="fd-next-t">Nada mais para hoje</div><div class="fd-next-s">Bom descanso!</div></div></div>`;
  const row=x=>{const past=x.k&&x.end&&x.end<=now,tag=x.a?'button':'div';
    return `<${tag} class="fd-row${past?' past':''}" style="--c:${col(x.m)}" ${x.a||''}><span class="fd-bar"></span><span class="fd-rt"><b>${esc(x.t)}</b><small>${x.k?esc(x.k)+(x.end&&x.end!==x.k?' – '+esc(x.end):''):'Dia todo'}${x.s?' · '+esc(x.s):''}</small></span>${avatar(x.m,true)}</${tag}>`};
  const tmr=parse(TODAY);tmr.setDate(tmr.getDate()+1);const ti=homeItems(iso(tmr)).filter(x=>x.k);
  const tline=ti.length?`<button class="fd-tomorrow" data-wday="${iso(tmr)}"><b>Amanhã:</b> ${esc(ti[0].t)} ${esc(ti[0].k)}${ti.length>1?' · +'+(ti.length-1)+' mais':''}<span>›</span></button>`:'';
  // right column
  const part=curPart(),members=wallMembers();
  const rout=members.map(m=>{const ts=S.tasks.filter(t=>forM(t,m.id)&&t.repeat&&taskActive(t,TODAY)&&(!t.part||t.part===part));const dn=ts.filter(t=>isDone(t)).length;
    return `<div class="fd-rrow">${avatar(m.id)}<span class="fd-rn">${esc(m.name)}</span><span class="fd-rc">${dn}/${ts.length}</span><span class="fd-prog"><i style="width:${ts.length?Math.round(dn/ts.length*100):0}%;background:var(--${m.color})"></i></span></div>`}).join('');
  const stars=S.members.map(m=>({m,n:starsFor(m.id)}));const mx=Math.max(1,...stars.map(x=>x.n));
  const board=`<div class="fd-bars">${stars.map(x=>`<div class="fd-bcol"><b>${x.n}</b><span class="fd-b" style="height:${Math.max(4,Math.round(x.n/mx*86))}px;background:var(--${x.m.color})"></span><small>${esc(x.m.name)}</small></div>`).join('')}</div>`;
  const meal=S.meals[TODAY],nx=[1,2].map(k=>{const x=parse(TODAY);x.setDate(x.getDate()+k);const ds=iso(x);return `<div class="fd-mrow"><span>${DOW[dowMon(x)]}</span>${S.meals[ds]?esc(S.meals[ds].title):'<i>por decidir</i>'}</div>`}).join('');
  const shopN=shopItems().filter(x=>!x.done).length;
  const todos=S.tasks.filter(t=>t.list!=='Compras'&&!t.repeat&&!t.done&&wMatch(t)).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9'));
  const head=(ic,t,sub,v)=>`<button class="fd-ch" ${v}><span class="fd-ci">${ic}</span><span><b>${t}</b><small>${sub}</small></span><span class="fd-chev">›</span></button>`;
  const IC=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${NAV_ICONS[k][1]}</svg>`;
  return `<div class="fd-home">
    <div class="fd-left">${up}
      <div class="fd-card fd-today"><div class="fd-eyebrow" style="padding:18px 20px 6px">HOJE</div>
        <div class="fd-list">${its.map(row).join('')||'<div class="empty">Nada marcado para hoje.</div>'}</div>${tline}</div></div>
    <div class="fd-right">
      <div class="fd-card">${head(IC('rotinas'),'Rotinas',PARTS.find(x=>x[0]===part)[1],'data-wv="rotinas"')}<div class="fd-cb">${rout}</div></div>
      <div class="fd-card">${head('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6"/></svg>','Estrelas','Esta semana'+(S.prize&&S.prize.title?' · '+esc(S.prize.title):''),'data-wv="rotinas"')}<div class="fd-cb">${board}</div></div>
      <div class="fd-card">${head('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 21V3c-2 1-3 4-3 7h3"/></svg>','Almoço','Hoje','data-open-meal="'+TODAY+'"')}
        <div class="fd-cb"><div class="fd-meal">${meal?esc(meal.title):'Por decidir'}</div>${meal&&meal.cook&&member(meal.cook)?`<small class="muted">Cozinha: ${esc(member(meal.cook).name)}</small>`:''}${nx}
        <button class="fd-chip" data-wv="compras">Compras · ${shopN}</button></div></div>
      <div class="fd-card">${head(IC('rotinas'),'Tarefas',todos.length+' por fazer','data-wv="avisos"')}<div class="fd-cb">${todos.slice(0,4).map(t=>`<div class="fd-todo"><button class="check" role="checkbox" aria-checked="false" data-toggle-task="${t.id}" aria-label="Feita"></button><span><b>${esc(t.text)}</b><small>${esc(t.list||'')}${t.due?' · até '+esc(rel(t.due)):''}</small></span><span class="dot" style="--c:${dotsFor(t.who)[0]}"></span></div>`).join('')||'<div class="muted small">Tudo feito!</div>'}</div></div>
    </div></div>`;
}
function railMeal(d){const meal=S.meals[d];
  return `<div class="w-card"><h4>Almoço${d===TODAY?' de hoje':''}</h4><button class="w-it" data-open-meal="${d}"><span style="flex:1;min-width:0"><div class="tt">${meal?esc(meal.title):'Por decidir'}</div><div class="ss">${meal&&meal.cook&&member(meal.cook)?'Cozinha: '+esc(member(meal.cook).name):'Tocar para escolher'}</div></span></button></div>`}
function railReminders(d){
  const pend=S.reminders.filter(r=>!r.done&&r.date&&r.date<=d&&wMatch(r)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))).slice(0,5);
  return `<div class="w-card"><h4>Lembretes</h4>${pend.map(r=>`<div class="w-it"><button class="check" role="checkbox" aria-checked="false" data-toggle-rem="${r.id}" aria-label="Marcar como feito"></button><span style="flex:1;min-width:0"><div class="tt">${esc(r.text)}</div><div class="ss"${r.date<TODAY?' style="color:var(--danger)"':''}>${rel(r.date)}${r.time?' · '+esc(r.time):''}</div></span></div>`).join('')||'<div class="empty">Sem lembretes pendentes</div>'}</div>`}
function railBirthdays(){
  const up=S.birthdays.map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n).slice(0,3);
  return `<div class="w-card"><h4>Próximos aniversários</h4>${up.map(b=>`<button class="w-it" data-edit-bday="${b.id}"><span class="tm">${+b.md.slice(3)}/${+b.md.slice(0,2)}</span><span style="flex:1;min-width:0"><div class="tt">${esc(b.name)}</div><div class="ss">${b.n===0?'Hoje!':b.n===1?'Amanhã':'Daqui a '+b.n+' dias'}</div></span></button>`).join('')||'<div class="empty">Sem aniversários registados</div>'}</div>`}
function wallDay(d){
  const D=wallData(d);
  const band=[
    ...D.bd.map(b=>{const a=ageOn(b,d);return `<button class="w-pill" data-edit-bday="${b.id}">🎂︎ <b>${esc(b.name)}</b>${a>0?' faz '+a+' anos':''}</button>`}),
    ...D.vac.filter(isAll).map(v=>`<button class="w-pill" data-edit-vac="${v.id}">Férias · <b>${esc(v.title)}</b></button>`),
    ...(holidayOn(d)?[`<span class="w-pill" style="background:color-mix(in srgb,var(--danger) 16%,var(--surface))">Feriado · <b>${esc(holidayOn(d))}</b></span>`]:[]),
    ...breaksOn(d).map(b=>`<button class="w-pill" data-edit-break="${b.id}">Sem aulas · <b>${esc(b.title)}</b></button>`),
    ...D.ev.filter(isAll).map(e=>`<button class="w-pill" data-edit-event="${e.id}"><b>${e.time?esc(e.time):'Dia'}</b> ${esc(e.title)}</button>`)
  ];
  const cols=wallMembers().map(m=>{const its=colItems(m.id,D,d);
    return `<div class="w-col" style="--c:var(--${m.color})"><h3><span class="dot" style="--c:var(--${m.color})"></span>${esc(m.name)}<span class="spacer"></span><span class="small muted">${its.length||''}</span></h3>
      ${its.map(x=>wItem(x,d)).join('')||'<div class="empty">Dia livre</div>'}</div>`}).join('');
  const pend=S.reminders.filter(r=>!r.done&&r.date&&r.date<=d&&wMatch(r)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))).slice(0,8);
  const tasks=S.tasks.filter(t=>!isDone(t)&&taskActive(t,TODAY)&&wMatch(t)).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')).slice(0,8);
  const up=S.birthdays.map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n).slice(0,3);
  const dots=who=>dotsFor(who).map(c=>`<span class="dot" style="--c:${c}"></span>`).join('');
  const meal=D.meal;
  return `${band.length?`<div class="w-band">${band.join('')}</div>`:''}
    <div class="w-body"><div class="w-cols" style="--n:${wallMembers().length}" data-swipe="wall">${cols}</div>
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
      else{const w=whoList(e.who);its.push({k:e.time||'',c:dotsFor(e.who)[0],t:e.title,s:w.includes('all')?'Todos':w.map(id=>member(id)&&member(id).name).filter(Boolean).join(', '),a:`data-edit-event="${e.id}"`})}
    });
    Object.entries(school).forEach(([m,s])=>its.push({k:s.k,c:colorOf(m),t:'Escola'+(member(m)?' · '+member(m).name:''),s:s.end?'até '+s.end:'',a:`data-wday="${d}"`}));
    D.g.forEach(g=>its.push({k:g.h&&g.d===d?g.h:'',c:colorOf(g.mid),t:g.t,s:gName(g.mid)}));
    its.sort((p,q)=>(p.k||'').localeCompare(q.k||''));
    cols+=`<div class="w-day${d===TODAY?' today':''}"><button class="w-dh" data-wday="${d}"><span class="kind">${DOW[i]}</span><b>${x.getDate()}</b></button>
      ${its.map(z=>{const tag=z.a?'button':'div';return `<${tag} class="w-wi" style="--c:${z.c}" ${z.a||''}>${z.k?`<span class="tm">${esc(z.k)}</span>`:''}<span class="tt">${esc(z.t)}</span>${z.s?`<span class="ss">${esc(z.s)}</span>`:''}</${tag}>`}).join('')}
      ${D.meal?`<button class="w-wi meal" data-open-meal="${d}" style="--c:var(--line)"><span class="ss">Almoço</span><span class="tt">${esc(D.meal.title)}</span></button>`:''}</div>`;
  }
  return `<div class="w-week" data-swipe="wall">${cols}</div>${syncLine()}`;
}
function renderWall(){
  S.lastHM=nowHM();const v=S.wallView;document.body.dataset.v=v;
  const body={inicio:wallHome,hoje:()=>wallDay(S.wallDate),semana:wallWeek,mes:wallMonth,linha:wallLine,rotinas:wallRoutines,compras:wallShopping,avisos:wallAlerts}[v]||(()=>wallDay(S.wallDate));
  const fab=S.readOnly?'':`<button class="w-fab" data-quickadd aria-label="Adicionar">+</button>`;
  const ytFocus=document.activeElement&&document.activeElement.id==='yt-q';
  let html;
  try{html=(v==='moldura'?wallFrame():wallHead()+body()+fab)+navBar()}
  catch(e){console.error('Ecrã de parede',e);S.frameMode='galeria';lsSet('fam.frameMode','galeria');if(v!=='inicio'){S.wallView='inicio';lsSet('fam.wallView','inicio')}
    try{html=(S.wallView==='moldura'?wallFrame():wallHead()+wallHome()+fab)+navBar()}catch(e2){html=`<div style="padding:40px"><h2>Houve um problema a mostrar este ecrã.</h2><button class="addbtn" data-wexit>Voltar ao Quadro</button></div>`}}
  document.getElementById('wall').innerHTML=html;
  refocus();dockVideo();if(ytFocus){const q=document.getElementById('yt-q');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length)}}if(v==='moldura'&&S.frameMode==='radio')loadStations(false);
}
function wallShopping(){return shopBody(true)}
function toMin(hm){const[h,m]=String(hm).split(':').map(Number);return h*60+(m||0)}
function wallAlerts(){
  const now=nowHM(),rs=S.reminders.filter(r=>!r.done&&r.date&&wMatch(r));
  const key=r=>r.date+(r.time||'99');
  const late=rs.filter(r=>r.date<TODAY||(r.date===TODAY&&r.time&&r.time<=now)).sort((a,b)=>key(a).localeCompare(key(b)));
  const today=rs.filter(r=>r.date===TODAY&&!(r.time&&r.time<=now)).sort((a,b)=>key(a).localeCompare(key(b)));
  const lim=parse(TODAY);lim.setDate(lim.getDate()+7);const L=iso(lim);
  const next=rs.filter(r=>r.date>TODAY&&r.date<=L).sort((a,b)=>key(a).localeCompare(key(b)));
  const row=r=>`<div class="w-it"><button class="check" role="checkbox" aria-checked="false" data-toggle-rem="${r.id}" aria-label="Marcar como feito"></button>
    <span class="tm">${r.time?esc(r.time):'Dia'}</span><span style="flex:1;min-width:0"><div class="tt">${esc(r.text)}</div>
    <div class="ss">${r.date!==TODAY?esc(rel(r.date))+' · ':''}${r.time&&r.alarm!==false?'Com alarme':'Sem alarme'}</div><div class="people">${peopleTags(r.who)}</div></span>
    <button class="edit" data-edit-rem="${r.id}">Editar</button></div>`;
  const card=(title,list,empty,cls)=>`<div class="w-card${cls||''}"><h4>${title}</h4>${list.map(row).join('')||`<div class="empty">${empty}</div>`}</div>`;
  const canNotify='Notification' in window&&Notification.permission!=='granted'&&Notification.permission!=='denied';
  return `<div class="row" style="flex-wrap:wrap;margin-bottom:12px">${S.readOnly?'':'<button class="addbtn" data-new="reminder">+ Novo aviso</button>'}
      <button class="ghost" data-alarmtest>Testar som</button>${canNotify?'<button class="ghost" data-notif>Ativar notificações</button>':''}
      <span class="small muted">O alarme toca à hora marcada neste aparelho enquanto o Quadro estiver aberto.</span></div>
    <div class="w-grid3">${card('Agora e em atraso',late,'Nada em atraso',' w-late')}${card('Mais logo',today,'Nada mais para hoje')}${card('Próximos 7 dias',next,'Sem avisos marcados')}</div>`;
}
function dayChips(d,D){
  const ch=[],school={};
  D.bd.forEach(b=>ch.push({k:'',c:'var(--accent)',t:'🎂︎ '+b.name}));
  D.vac.forEach(v=>ch.push({k:'',c:dotsFor(v.who)[0],t:'Férias · '+v.title}));
  if(holidayOn(d))ch.unshift({k:'',c:'var(--danger)',t:'Feriado · '+holidayOn(d)});
  breaksOn(d).forEach(b=>ch.push({k:'',c:'var(--muted)',t:'Sem aulas · '+b.title}));
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
  const lanes=[{id:'all',name:'Família',c:'var(--accent)'},...wallMembers().map(m=>({id:m.id,name:m.name,c:`var(--${m.color})`}))].map(L=>{
    const isF=L.id==='all',bl=[],allDay=[];
    D.ev.filter(e=>isF?isAll(e):forM(e,L.id)).forEach(e=>{if(e.time)bl.push(blk(e.time,schoolEnd(e)||addMin(e.time,60),e.title,L.c,`data-edit-event="${e.id}"`));else allDay.push(e.title)});
    D.g.filter(g=>isF?g.mid==='all':g.mid===L.id).forEach(g=>{if(g.h&&g.d===d&&g.d===g.e)bl.push(blk(g.h,g.he&&g.he>g.h?g.he:addMin(g.h,60),g.t,L.c));else allDay.push(g.t)});
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
  if(holidayOn(d))its.push({k:'',c:'var(--danger)',t:'Feriado · '+holidayOn(d)});
  D.bd.forEach(b=>its.push({k:'',c:'var(--accent)',t:'Aniversário · '+b.name}));
  D.vac.forEach(v=>its.push({k:'',c:dotsFor(v.who)[0],t:'Férias · '+v.title}));
  D.ev.forEach(e=>{
    if(e.school){const en=schoolEnd(e);whoList(e.who).forEach(m=>{const s=sc[m]||(sc[m]={k:e.time,end:en});if(e.time<s.k)s.k=e.time;if(en>s.end)s.end=en})}
    else{const who=isAll(e)?'':whoList(e.who).map(id=>member(id)&&member(id).name).filter(Boolean).join(', ');its.push({k:e.time||'',c:dotsFor(e.who)[0],t:e.title+(who?' · '+who:''),end:e.time?addMin(e.time,60):''})}
  });
  Object.entries(sc).forEach(([m,s])=>{if(member(m))its.push({k:s.k,c:colorOf(m),t:'Escola · '+member(m).name+(s.end?' (até '+s.end+')':''),end:s.end})});
  D.g.forEach(g=>{const h=g.h&&g.d===d?g.h:'';its.push({k:h,c:colorOf(g.mid),t:g.t+' · '+gName(g.mid),end:h?g.he:''})});
  return its.sort((a,b)=>(a.k||'').localeCompare(b.k||''));
}
function nextUp(){const now=nowHM();return frameList(wallData(TODAY),TODAY).find(x=>x.k&&x.k>now)||null}
function wallFrame(){
  const n=S.photos.length,p=n?S.photos[photoSlot()%n]:null;S.lastSlot=photoSlot();
  const tmr=parse(TODAY);tmr.setDate(tmr.getDate()+1);const td=iso(tmr);
  const now=nowHM();
  const row=(x,today)=>`<div class="w-fr${today&&x.end&&x.end<=now?' past':''}"><span class="tm">${x.k||'Dia'}</span><span class="dot" style="--c:${x.c}"></span><span class="tt" style="min-width:0">${esc(x.t)}</span></div>`;
  const meal=S.meals[TODAY],pend=S.reminders.filter(r=>!r.done&&r.date&&r.date<=TODAY&&wMatch(r)).length;
  const up=S.birthdays.map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n)[0];
  const today=frameList(wallData(TODAY),TODAY),tomorrow=frameList(wallData(td),td).slice(0,5);
  const fm=S.frameMode||'galeria';
  const tabs=`<div class="fm-tabs" role="group" aria-label="Moldura">${[['galeria','Galeria'],['video','Vídeo'],['tv','NOS TV'],['radio','Rádio']].map(([k,l])=>`<button data-fmode="${k}" aria-pressed="${fm===k}">${l}</button>`).join('')}</div>`;
  if(fm!=='galeria')return `<div class="w-frame"><div class="w-photo fm-${fm}">${tabs}${fm==='video'?frameVideo():fm==='tv'?frameTV():frameRadio()}</div>${frameSide(today,tomorrow,row,up,pend)}</div>`;
  return `<div class="w-frame"><div class="w-photo${p?' has':''}"${p?` style="background-image:url('${photoUrl(p)}')"`:''}>
      ${tabs}${p?'':'<button class="w-btn" data-wset style="position:absolute;top:24px;right:24px">Adicionar fotografias</button>'}
      <div class="ov"><div class="big" id="wClock">${now}</div><div style="font-family:var(--display);font-weight:600;font-size:1.6rem">${niceDate(TODAY)}</div>
      ${meal?`<div class="w-chipb">Almoço: ${esc(meal.title)}</div>`:''}</div>
      </div>
    ${frameSide(today,tomorrow,row,up,pend)}</div>`;
}
function frameSide(today,tomorrow,row,up,pend){
  return `<div class="w-side"><h4 class="w-sh">Hoje</h4>${today.map(x=>row(x,true)).join('')||'<div class="muted">Nada marcado</div>'}
      <h4 class="w-sh" style="color:var(--muted)">Amanhã</h4>${tomorrow.map(x=>row(x,false)).join('')||'<div class="muted">Nada marcado</div>'}
      <div class="row" style="gap:10px;margin-top:auto;align-items:stretch;padding-top:12px">
        ${up?`<div class="w-mini"><small>Aniversário</small><b>${esc(up.name)}</b><span class="small muted">${up.n===0?'Hoje!':up.n===1?'Amanhã':'daqui a '+up.n+' dias'}</span></div>`:''}
        <div class="w-mini"><small>Lembretes</small><b>${pend} por fazer</b></div>
        ${S.readOnly?'':'<button class="w-btn" data-quickadd aria-label="Adicionar" style="font-size:1.8rem;background:var(--accent);color:var(--accent-ink);border:0">+</button>'}
      </div>
      <div class="row" style="gap:8px;justify-content:flex-end"><button class="edit" data-wgoogle>Google</button><button class="edit" data-wset>Ajustes</button><button class="edit" data-wfs>Ecrã inteiro</button><button class="edit" data-wexit>Sair</button></div>
    </div>`;
}
function wallRoutines(){
  const part=S.rotPart||curPart();let total=0;
  const tabs=`<div class="seg" role="group" aria-label="Parte do dia" style="max-width:560px;margin-bottom:12px">${PARTS.map(([k,l])=>`<button data-rpart="${k}" aria-pressed="${part===k}">${l}</button>`).join('')}</div>`;
  const partName=part==='tudo'?'hoje':'para a '+PARTS.find(x=>x[0]===part)[1].toLowerCase();
  const cards=wallMembers().map(m=>{
    const ts=S.tasks.filter(t=>forM(t,m.id)&&taskActive(t,TODAY)&&(part==='tudo'||!t.part||t.part===part)&&(t.repeat||!t.done||t.doneAt===TODAY)).sort((a,b)=>isDone(a)-isDone(b));
    const done=ts.filter(t=>isDone(t)).length,st=starsFor(m.id);total+=st;
    const deg=ts.length?Math.round(done/ts.length*360):0;
    return `<div class="w-rc" style="--c:var(--${m.color})"><div class="w-rh"><div class="w-ring" style="background:conic-gradient(var(--c) ${deg}deg,var(--sunk) 0)"><span>${done}/${ts.length}</span></div>
      <div style="min-width:0"><div style="font-family:var(--display);font-weight:600;font-size:1.25rem">${esc(m.name)}</div><div class="small">★ ${st} ${st===1?'estrela':'estrelas'} esta semana</div></div></div>
      ${ts.map(t=>{const ok=isDone(t);return `<button class="w-rtask${ok?' ok':''}" data-toggle-task="${t.id}" role="checkbox" aria-checked="${ok}"><span class="box">${ok?'✓':''}</span><span style="min-width:0"><div class="tt">${esc(t.text)}</div><div class="ss">${esc([t.repeat==='daily'?'Todos os dias':t.repeat==='weekdays'?'Dias úteis':'',t.due?'até '+rel(t.due):''].filter(Boolean).join(' · '))}</div></span></button>`}).join('')||`<div class="empty">Sem tarefas ${partName}</div>`}</div>`}).join('');
  total=S.members.reduce((a,m)=>a+starsFor(m.id),0);
  const goal=+(S.prize&&S.prize.goal)||50,title=(S.prize&&S.prize.title)||'';
  return `${tabs}<div class="w-rt" style="--n:${wallMembers().length}">${cards}</div>
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
    <label class="field"><span>Tempo de cada fotografia na moldura (segundos)</span><input id="w-psec" type="number" min="3" max="3600" step="1" name="psec" value="${photoSec()}"></label>
    <div class="field"><span>Google Calendar</span><button type="button" class="ghost" data-wgoogle>Ligar e escolher calendários</button></div>
    <div class="two"><label class="field"><span>Prémio da semana</span><input id="w-prize" name="prize" value="${esc(S.prize&&S.prize.title)}" placeholder="Ex.: Noite de cinema"></label>
    <label class="field"><span>Estrelas necessárias</span><input id="w-goal" type="number" min="1" name="goal" value="${esc((S.prize&&S.prize.goal)||50)}"></label></div>`,
  {onSave:f=>{
    lsSet('fam.rest',val(f,'rest'));const ps=Math.round(+val(f,'psec'));if(ps>=3&&ps<=3600)lsSet('fam.photoSec',String(ps));
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
    <button type="button" data-new="birthday">Aniversário<small>todos os anos</small></button>
    <button type="button" data-wv="compras">Compras<small>lista partilhada</small></button></div>`);
}
let wl=null,idleT=null;
async function keepAwake(){if(!S.wall||document.hidden)return;try{if(navigator.wakeLock)wl=await navigator.wakeLock.request('screen')}catch(e){}}
function enterWall(){S.wall=true;S.wallDate=TODAY;S.wallView=lsGet('fam.wallView')||'inicio';lsSet('fam.wall','1');keepAwake();render();bumpIdle();window.scrollTo(0,0)}
function exitWall(){S.wall=false;lsSet('fam.wall','0');try{wl&&wl.release()}catch(e){}wl=null;
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});render()}
function bumpIdle(){clearTimeout(idleT);if(!S.wall)return;
  idleT=setTimeout(()=>{closeSheet();S.wallView=lsGet('fam.rest')||S.wallView;S.rotPart=null;S.wallSel=[];S.wallDate=TODAY;render();window.scrollTo(0,0)},120000)}
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
  if(t.id==='btnGoogle'){googleSheet();return}
  if(d.wv){closeSheet();S.wallView=d.wv;lsSet('fam.wallView',d.wv);S.rotPart=null;renderWall();window.scrollTo(0,0);return}
  if(d.wshift){wallStep(+d.wshift);return}
  if(d.rpart){S.rotPart=d.rpart;renderWall();return}
  if(d.wset!==undefined){wallSettings();return}
  if(d.wf){if(d.wf==='all')S.wallSel=[];else toggleSel(d.wf);renderWall();return}
  if(d.wcals!==undefined){calSheet();return}
  if(d.selk){toggleSel(d.selk);calSheet();renderWall();return}
  if(d.selclear!==undefined){S.wallSel=[];closeSheet();renderWall();return}
  if(d.media!==undefined){mediaSheet();return}
  if(d.ytopen!==undefined){openYouTube();return}
  if(d.yttab){S.ytTab=d.yttab;S.ytRes=null;S.ytErr='';renderWall();return}
  if(d.ytsavequick){const ex=S.media.videos.some(v=>v.u===d.ytsavequick);saveMedia({videos:ex?S.media.videos.filter(v=>v.u!==d.ytsavequick):[...S.media.videos,{t:d.yttitle||'Vídeo',u:d.ytsavequick}]});toast(ex?'Tirado dos favoritos':'Guardado nos favoritos');return}
  if(d.ytlist!==undefined){const v=document.querySelector('#mediaLayer .ml-video');if(v)v.remove();S.frameMode='video';lsSet('fam.frameMode','video');if(S.wall&&S.wallView==='moldura')renderWall();else mediaSheet();return}
  if(d.ytfav!==undefined){const v=document.querySelector('#mediaLayer .ml-video[data-kind="yt"]');if(!v)return;const u=v.dataset.u,ex=S.media.videos.some(x=>x.u===u);
    let title=v.dataset.t;if(!ex&&!title){title=prompt('Nome para guardar',ytParse(u)&&ytParse(u).list?'Playlist':'Vídeo')||'';if(!title)return}
    saveMedia({videos:ex?S.media.videos.filter(x=>x.u!==u):[...S.media.videos,{t:title,u}]});v.dataset.t=title;
    t.textContent=ex?'☆':'★';t.setAttribute('aria-pressed',String(!ex));toast(ex?'Tirado dos favoritos':'Guardado nos favoritos');return}
  if(d.tvstart!==undefined){playTV();renderWall();return}
  if(d.tvopen!==undefined){openNosApp();return}
  if(d.siteopen!==undefined){const v=document.querySelector('#mediaLayer .ml-video');if(!v)return;if(v.dataset.kind==='tv')openNosApp();else window.open(v.dataset.u,'_blank','noopener');return}
  if(d.site){stopMedia('radio',true);playSite(d.site,d.sname||'Rádio','site');renderWall();return}
  if(d.sitedel){saveMedia({sites:(S.media.sites||[]).filter(s=>s.u!==d.sitedel)});return}
  if(d.siteadd!==undefined){const box=t.closest('.fm-add'),n=box.querySelector('#s-n').value.trim(),u0=box.querySelector('#s-u').value.trim();
    const u=/^https?:\/\//.test(u0)?u0:(u0?'https://'+u0:'');if(!/^https:\/\/[^\s]+\.[^\s]+/.test(u)){toast('Escreve o endereço do site (https://…)');return}
    let nm=n;if(!nm){try{nm=new URL(u).pathname.split('/').filter(Boolean).pop()||new URL(u).hostname}catch(e){nm='Rádio'}nm=nm.replace(/-/g,' ').replace(/^./,x=>x.toUpperCase())}
    saveMedia({sites:[...(S.media.sites||[]).filter(s=>s.u!==u),{n:nm,u}]});toast('Site adicionado');return}
  if(d.tvurl!==undefined){const u=prompt('Endereço da NOS TV',lsGet('fam.tvUrl')||NOS_URL);if(u&&/^https:\/\//.test(u.trim())){lsSet('fam.tvUrl',u.trim());playTV();renderWall()}return}
  if(d.fmode){S.frameMode=d.fmode;lsSet('fam.frameMode',d.fmode);if(d.fmode!=='video'){const v=document.querySelector('#mediaLayer .ml-video');if(v)mediaLayer().classList.add('mini')}renderWall();return}
  if(d.mfull!==undefined){const v=document.querySelector('#mediaLayer .ml-video');if(v){v.classList.toggle('full');dockVideo()}return}
  if(d.ytplay){playVideo(d.ytplay,d.yttitle||'');closeSheet();if(S.wall&&S.wallView==='moldura')renderWall();return}
  if(d.ytsave!==undefined){const f=t.closest('form,.fm-panel'),u=f.querySelector('#m-yt').value.trim(),id=ytParse(u);if(!id){toast('Link do YouTube não reconhecido');return}
    const title=f.querySelector('#m-ytt').value.trim()||'Vídeo';saveMedia({videos:[...S.media.videos.filter(v=>v.u!==u),{t:title,u}]});toast('Guardado na lista');if(S.wall&&S.wallView==='moldura')renderWall();return}
  if(d.ytgo!==undefined){const f=t.closest('form,.fm-panel'),u=f.querySelector('#m-yt').value.trim();if(!ytParse(u)){toast('Cola um link do YouTube (vídeo, direto ou lista)');return}playVideo(u,f.querySelector('#m-ytt').value.trim());closeSheet();if(S.wall&&S.wallView==='moldura')renderWall();return}
  if(d.ytdel){saveMedia({videos:S.media.videos.filter(v=>v.u!==d.ytdel)});if(S.wall&&S.wallView==='moldura')renderWall();return}
  if(d.radio){playRadio(d.radio,d.rname||'Rádio',d.ralt);return}
  if(d.rfav){const ex=S.media.radios.some(r=>r.u===d.rfav);const st0=(stations||[]).find(s=>s.u===d.rfav);saveMedia({radios:ex?S.media.radios.filter(r=>r.u!==d.rfav):[...S.media.radios,{n:d.rname||'Rádio',u:d.rfav,...(st0&&st0.a?{a:st0.a}:{})}]});return}
  if(d.rcustom!==undefined){const f=t.closest('form'),u=f.querySelector('#m-ru').value.trim();if(!/^https:\/\//.test(u)){toast('O endereço da rádio tem de começar por https://');return}playRadio(u,f.querySelector('#m-rn').value.trim()||'Rádio')
    ;saveMedia({radios:[...S.media.radios.filter(r=>r.u!==u),{n:f.querySelector('#m-rn').value.trim()||'Rádio',u}]});return}
  if(d.rsearch!==undefined){loadStations(true);return}
  if(d.mstop!==undefined){stopMedia(d.mstop);if(S.wall&&S.wallView==='moldura')renderWall();return}
  if(d.mmin!==undefined){const L=mediaLayer();L.classList.toggle('mini');dockVideo();return}
  if(d.wgoogle!==undefined){googleSheet();return}
  if(d.gsync!==undefined){if(!S.me||!S.me.memberId){googleSheet();return}S.needTap=false;allowGooglePrompt();syncGoogle(S.me,true);return}
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
  if(d.editBreak){breakForm(S.schoolBreaks.find(x=>x.id===d.editBreak));return}
  if(d.schoolpreset!==undefined){if(S.readOnly)return;const who=schoolMembers().length?schoolMembers():['all'];
    SCHOOL_PRESET_2627.filter(p=>!S.schoolBreaks.some(b=>b.start===p.start)).forEach(p=>save('schoolBreaks',null,{...p,who}));
    toast('Férias escolares 2026/27 adicionadas');return}
  if(d.tlist){S.taskList=d.tlist;render();return}
  if(t.id==='btnFamily'){familyForm();return}
  if(S.readOnly&&(d.new||d.toggleRem||d.toggleTask||d.clear)){toast('Estás em modo de leitura.');return}
  if(d.new){({event:eventForm,reminder:reminderForm,task:taskForm,recipe:recipeForm,birthday:birthdayForm,vacation:vacationForm,break:breakForm})[d.new]();return}
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
    else{save('tasks',id,{...rest,done:!r.done,doneAt:!r.done?TODAY:''});if(r.list==='Compras'&&!r.done)recordPurchase(r)}}return}
  if(d.shoplist){S.shopList=d.shoplist;lsSet('fam.shopList',d.shoplist);render();return}
  if(d.shophist!==undefined){S.shopShowHist=!S.shopShowHist;render();return}
  if(d.shopsug){if(S.readOnly)return;const h=S.shopHistory.find(x=>x.id===d.shopsug);if(h){addShopItem(h.name);toast(h.name+' adicionado a '+curShop())}return}
  if(d.shopnew!==undefined){if(S.readOnly)return;shopListsSheet();return}
  if(d.dellist){if(S.readOnly)return;if(shopItems(d.dellist).length){toast('Essa lista ainda tem artigos. Limpa-a primeiro.');return}
    if(!t.dataset.armed){t.dataset.armed='1';t.textContent='Toca de novo para apagar';return}
    saveShopLists(shopLists().filter(l=>l!==d.dellist));closeSheet();return}
  if(d.clearshop!==undefined){if(S.readOnly)return;
    if(!t.dataset.armed){t.dataset.armed='1';t.textContent='Toca de novo para confirmar';return}
    shopItems(curShop()).filter(x=>x.done).forEach(x=>remove('tasks',x.id));return}
  if(d.alarmtest!==undefined){unlockAudio();beep();toast('Se não ouviste, aumenta o volume deste aparelho.');return}
  if(d.notif!==undefined){if('Notification' in window)Notification.requestPermission().then(p=>{toast(p==='granted'?'Notificações ativadas neste aparelho.':'As notificações não foram autorizadas.');render()});return}
  if(d.alDone||d.alSnooze||d.alOk){alarmAction(t);return}
  if(d.clear){
    if(!t.dataset.armed){t.dataset.armed='1';t.textContent='Toca de novo para confirmar';return}
    S[d.clear].filter(x=>x.done&&matches(x)).forEach(x=>remove(d.clear,x.id));return}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
let tt;function toast(msg){clearTimeout(tt);document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=msg;document.body.appendChild(el);tt=setTimeout(()=>el.remove(),2600)}

document.getElementById('todayLabel').textContent=niceDate(TODAY);
document.addEventListener('pointerdown',bumpIdle,{passive:true});
document.addEventListener('click',()=>{if(S.needTap&&S.mcp&&lsGet('fam.gconsent')){S.needTap=false;S.autoSynced=false;allowGooglePrompt();maybeAutoSync()}},true);
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
  checkAlarms();
  const t=iso(new Date());
  if(t!==TODAY){const old=TODAY;TODAY=t;if(S.sel===old){S.sel=t;S.month=t.slice(0,7)}if(S.wallDate===old)S.wallDate=t;
    document.getElementById('todayLabel').textContent=niceDate(t);render();return}
  if(S.wall&&nowHM()!==S.lastHM){if(!overlay.innerHTML)renderWall();else{S.lastHM=nowHM();const c=document.getElementById('wClock');if(c)c.textContent=S.lastHM}}
},15000);
setInterval(()=>{if(!S.needTap){S.autoSynced=false;maybeAutoSync()}},15*60*1000);

/* ---------- shopping quick add ---------- */
document.addEventListener('submit',e=>{
  const f=e.target.closest&&e.target.closest('[data-shopform]');if(!f)return;
  e.preventDefault();if(S.readOnly){toast('Estás em modo de leitura.');return}
  const inp=f.querySelector('input');const items=inp.value.split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean);if(!items.length)return;
  S.refocusId=inp.id;S.refocusUntil=Date.now()+2500;
  const have=new Set(shopItems(curShop()).filter(x=>!x.done).map(x=>(x.text||'').toLowerCase()));
  items.forEach(text=>{if(!have.has(text.toLowerCase()))addShopItem(text)});
  inp.value='';S.refocusId=inp.id;S.refocusUntil=Date.now()+2500;
});

/* ---------- alarms ---------- */
let actx=null,beepT=null,firing=[];
function unlockAudio(){try{if(!actx){const C=window.AudioContext||window.webkitAudioContext;if(C)actx=new C()}if(actx&&actx.state==='suspended')actx.resume()}catch(e){}}
document.addEventListener('pointerdown',unlockAudio,{passive:true});
function beep(){if(!actx)return;try{const t0=actx.currentTime;[0,0.28,0.56].forEach((d,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=i===2?1175:880;g.gain.setValueAtTime(0.0001,t0+d);g.gain.exponentialRampToValueAtTime(0.5,t0+d+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+d+0.22);o.connect(g).connect(actx.destination);o.start(t0+d);o.stop(t0+d+0.25)})}catch(e){}}
const lsJSON=(k,d)=>{try{return JSON.parse(lsGet(k)||'null')||d}catch(e){return d}};
const alarmKey=r=>r.id+'|'+r.date+'|'+r.time;
function checkAlarms(){
  const now=nowHM(),acks=lsJSON('fam.acks',{}),snz=lsJSON('fam.snooze',{}),t=Date.now();
  const due=S.reminders.filter(r=>!r.done&&r.alarm!==false&&r.time&&r.date===TODAY&&r.time<=now&&toMin(now)-toMin(r.time)<=60&&!acks[alarmKey(r)]&&!(snz[alarmKey(r)]>t));
  const ids=due.map(r=>r.id).join(),cur=firing.map(r=>r.id).join();
  if(ids&&ids!==cur){const fresh=due.some(r=>!firing.find(x=>x.id===r.id));firing=due;showAlarm(fresh)}
  else if(!ids&&firing.length){firing=[];hideAlarm()}
}
function showAlarm(fresh){
  let el=document.getElementById('alarm');
  if(!el){el=document.createElement('div');el.id='alarm';el.className='alarm';el.setAttribute('role','alertdialog');el.setAttribute('aria-label','Alarme');document.body.appendChild(el)}
  el.innerHTML=`<div class="alarm-card"><div class="alarm-clock">${nowHM()}</div>
    ${firing.map(r=>`<div class="alarm-row"><div class="alarm-txt"><b>${esc(r.text)}</b><span>${esc(r.time)} · ${whoList(r.who).includes('all')?'Todos':whoList(r.who).map(id=>member(id)?member(id).name:'').filter(Boolean).join(', ')}</span></div>
      <div class="alarm-btns"><button data-al-done="${r.id}">Feito</button><button data-al-snooze="${r.id}">Adiar 10 min</button><button data-al-ok="${r.id}">Fechar</button></div></div>`).join('')}</div>`;
  if(fresh){
    clearInterval(beepT);let n=0;beep();beepT=setInterval(()=>{beep();if(++n>=20)clearInterval(beepT)},2500);
    try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}
    try{if('Notification' in window&&Notification.permission==='granted'&&document.hidden)new Notification('Quadro da Família',{body:firing.map(r=>r.time+' · '+r.text).join('\n'),tag:'quadro-alarme'})}catch(e){}
  }
}
function hideAlarm(){clearInterval(beepT);const el=document.getElementById('alarm');if(el)el.remove()}
function alarmAction(btn){
  const d=btn.dataset,id=d.alDone||d.alSnooze||d.alOk,r=S.reminders.find(x=>x.id===id);
  if(r){const k=alarmKey(r);
    if(d.alSnooze){const snz=lsJSON('fam.snooze',{});snz[k]=Date.now()+10*60000;lsSet('fam.snooze',JSON.stringify(snz))}
    else{const acks=lsJSON('fam.acks',{});Object.keys(acks).forEach(x=>{if(x.split('|')[1]<TODAY)delete acks[x]});acks[k]=1;lsSet('fam.acks',JSON.stringify(acks))}
    if(d.alDone&&!S.readOnly){const{id:_,...rest}=r;save('reminders',r.id,{...rest,done:true})}
  }
  firing=firing.filter(x=>x.id!==id);clearInterval(beepT);
  if(firing.length)showAlarm(false);else hideAlarm();
}
setTimeout(checkAlarms,4000);

renderBanner();render();
if(S.wall)keepAwake();

/* ---------- vídeo (YouTube) e rádio ---------- */
function saveMedia(patch){S.media={...S.media,...patch};if(S.db)S.db.doc('config/media').set(S.media).catch(handleWriteError);if(overlay.querySelector('[data-mediasheet]'))mediaSheet();refreshFrame()}
function ytParse(u){u=String(u||'').trim();if(!u)return null;let id=null,list=null;
  try{const x=new URL(u.startsWith('http')?u:'https://'+u);const h=x.hostname.replace(/^www\.|^m\./,'');
    list=x.searchParams.get('list');
    if(h==='youtu.be')id=x.pathname.slice(1).split('/')[0];
    else if(/(^|\.)youtube(-nocookie)?\.com$/.test(h)){id=x.searchParams.get('v');const m=/^\/(embed|shorts|live|v)\/([\w-]{6,})/.exec(x.pathname);if(m&&m[2]!=='videoseries')id=m[2]}
    else return null}catch(e){if(/^[\w-]{11}$/.test(u))id=u;else return null}
  if(id&&!/^[\w-]{6,}$/.test(id))id=null;if(list&&!/^[\w-]+$/.test(list))list=null;
  return id||list?{id,list}:null}
function ytEmbed(p){const q='autoplay=1&rel=0&playsinline=1&modestbranding=1';
  return p.id?`https://www.youtube-nocookie.com/embed/${p.id}?${q}${p.list?'&list='+p.list:''}`:`https://www.youtube-nocookie.com/embed/videoseries?list=${p.list}&${q}`}
function mediaLayer(){let L=document.getElementById('mediaLayer');if(!L){L=document.createElement('div');L.id='mediaLayer';document.body.appendChild(L)}return L}
function playVideo(u,title){const p=ytParse(u);if(!p)return;const L=mediaLayer();L.classList.remove('mini');
  let v=L.querySelector('.ml-video');if(!v){v=document.createElement('div');v.className='ml-video';L.appendChild(v)}
  v.dataset.kind='yt';v.dataset.u=u;v.dataset.t=title||'';const fav=S.media.videos.some(x=>x.u===u);
  v.innerHTML=`<div class="ml-bar"><b>${esc(title||'YouTube')}</b><span class="spacer"></span><button class="fd-btn" data-ytfav aria-pressed="${fav}" aria-label="${fav?'Tirar dos favoritos':'Guardar nos favoritos'}">${fav?'★':'☆'}</button><button class="fd-btn" data-ytlist>Favoritos</button><button class="fd-btn" data-ytopen>YouTube</button><button class="fd-btn" data-mfull>Ecrã inteiro</button><button class="fd-btn" data-mmin>Minimizar</button><button class="fd-btn" data-mstop="video">Fechar</button></div>
    <iframe src="${ytEmbed(p)}" title="${esc(title||'Vídeo do YouTube')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  stopMedia('radio',true)}
function loadHls(){if(window.Hls)return Promise.resolve(window.Hls);
  return new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';s.onload=()=>ok(window.Hls);s.onerror=ko;document.head.appendChild(s)})}
function radioBar(name,state){const L=mediaLayer();let r=L.querySelector('.ml-radio');if(!r){r=document.createElement('div');r.className='ml-radio';L.appendChild(r)}
  r.classList.toggle('wait',state!=='on');
  r.innerHTML=`<span class="ml-eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="ml-rn"><small>${state==='on'?'A ouvir':'A ligar…'}</small><b>${esc(name)}</b></span><button class="fd-btn" data-media aria-label="Mudar de rádio">Mudar</button><button class="fd-btn" data-mstop="radio">Parar</button>`}
async function startStream(u){
  if(hls){try{hls.destroy()}catch(e){}hls=null}
  const isH=/\.m3u8(\?|$)/i.test(u);
  if(isH&&!audioEl.canPlayType('application/vnd.apple.mpegurl')){
    const H=await loadHls();if(!H||!H.isSupported())throw new Error('hls');
    try{await new Promise((ok,ko)=>{hls=new H({enableWorker:true});hls.on(H.Events.ERROR,(e,d)=>{if(d.fatal)ko(new Error('hls '+d.details))});hls.on(H.Events.MANIFEST_PARSED,ok);hls.loadSource(u);hls.attachMedia(audioEl)});
      return await audioEl.play()}
    catch(e){try{hls.destroy()}catch(_){}hls=null;audioEl.src=u;return audioEl.play()}}
  audioEl.src=u;return audioEl.play()}
async function playRadio(u,name,alt){
  if(!audioEl){audioEl=new Audio();audioEl.preload='none'}
  stopMedia('video',true);const my=++radioTry;audioEl.onerror=null;audioEl.onplaying=null;
  radioBar(name,'wait');
  const urls=[u,alt].filter((x,i,a)=>x&&/^https:\/\//.test(x)&&a.indexOf(x)===i);
  for(const x of urls){
    try{await Promise.race([startStream(x),new Promise((_,ko)=>setTimeout(()=>ko(new Error('timeout')),15000))]);
      if(my!==radioTry)return;markBroken(u,false);radioBar(name,'on');S.radioNow={u:x,k:u,n:name};
      audioEl.onerror=()=>{if(my===radioTry){toast('A rádio '+name+' deixou de responder.');stopMedia('radio')}};
      if(overlay.querySelector('[data-mediasheet]'))mediaSheet();refreshFrame();return}
    catch(e){console.warn('Rádio',name,x,e);if(my!==radioTry)return}
  }
  markBroken(u,true);stopMedia('radio');refreshFrame();toast('A '+name+' não deixa ser ouvida fora do site dela. Passou para o fim da lista; escolhe outra.')}
function brokenSet(){try{return new Set(JSON.parse(lsGet('fam.radioBad')||'[]'))}catch(e){return new Set()}}
function markBroken(u,bad){const s=brokenSet();bad?s.add(u):s.delete(u);lsSet('fam.radioBad',JSON.stringify([...s].slice(-200)))}
function stopMedia(k,quiet){const L=document.getElementById('mediaLayer');if(!L)return;
  if(k==='video'||k==='all'){const v=L.querySelector('.ml-video');if(v)v.remove()}
  if(k==='radio'||k==='all'){S.radioNow=null;if(hls){try{hls.destroy()}catch(e){}hls=null}if(audioEl){audioEl.onerror=null;audioEl.pause();audioEl.removeAttribute('src');audioEl.load()}const r=L.querySelector('.ml-radio');if(r)r.remove()}
  if(!quiet&&overlay.querySelector('[data-mediasheet]'))mediaSheet()}
async function loadStations(force){if(stationsBusy||(stations&&!force))return;stationsBusy=true;
  for(const h of ['de1','de2','fi1','all']){
    try{const r=await fetch(`https://${h}.api.radio-browser.info/json/stations/search?countrycode=PT&order=votes&reverse=true&hidebroken=true&limit=120`);if(!r.ok)continue;
      const j=await r.json(),seen=new Set();
      stations=j.filter(s=>s.name&&(/^https:\/\//.test(s.url_resolved||'')||/^https:\/\//.test(s.url||''))).map(s=>({n:s.name.trim(),u:/^https:/.test(s.url_resolved||'')?s.url_resolved:s.url,a:s.url,c:s.codec||'',i:/^https:/.test(s.favicon||'')?s.favicon:''})).filter(s=>{const k=s.n.toLowerCase();if(seen.has(k))return false;seen.add(k);return true}).slice(0,60);
      break}catch(e){}}
  if(!stations)stations=[];stationsBusy=false;if(overlay.querySelector('[data-mediasheet]'))mediaSheet();refreshFrame()}
function mediaSheet(){
  const cur=S.radioNow?S.radioNow.k:'';
  const st=(r,fav)=>`<div class="m-st${cur===r.u?' on':''}"><button type="button" class="m-play" data-radio="${esc(r.u)}" data-ralt="${esc(r.a||'')}" data-rname="${esc(r.n)}">${r.i?`<img src="${esc(r.i)}" alt="" loading="lazy" onerror="this.remove()">`:'<span class="m-ri">📻︎</span>'}<span>${esc(r.n)}</span></button><button type="button" class="m-fav" data-rfav="${esc(r.u)}" data-rname="${esc(r.n)}" aria-label="${fav?'Tirar dos favoritos':'Juntar aos favoritos'}" aria-pressed="${fav}">${fav?'★':'☆'}</button></div>`;
  const favU=new Set(S.media.radios.map(r=>r.u));
  const keep=document.activeElement&&document.activeElement.id,vals={};
  const was=overlay.querySelector('[data-mediasheet]'),opn=was?[...was.querySelectorAll('details.m-more')].map(x=>x.open):null,sc=was?was.scrollTop:0;
  if(was)['m-yt','m-ytt','m-ru','m-rn'].forEach(i=>{const e=overlay.querySelector('#'+i);if(e)vals[i]=e.value});
  sheet('Vídeo e rádio',`
    <div class="field"><span>YouTube</span>
      <input id="m-yt" placeholder="Cola aqui o link de um vídeo, direto ou lista" inputmode="url" value="${esc(vals['m-yt']||'')}">
      <div class="row" style="gap:8px;margin-top:8px"><input id="m-ytt" placeholder="Nome (opcional)" style="flex:1" value="${esc(vals['m-ytt']||'')}"><button type="button" class="addbtn" data-ytgo>Ver</button><button type="button" class="ghost" data-ytsave>Guardar</button></div>
      ${S.media.videos.length?`<div class="m-list">${S.media.videos.map(v=>`<div class="m-st"><button type="button" class="m-play" data-ytplay="${esc(v.u)}" data-yttitle="${esc(v.t)}"><span class="m-ri">▶︎</span><span>${esc(v.t)}</span></button><button type="button" class="m-fav" data-ytdel="${esc(v.u)}" aria-label="Tirar da lista">×</button></div>`).join('')}</div>`:''}
    </div>
    <div class="field"><span>Rádio${cur?' · <button type="button" class="edit" data-mstop="radio">Parar</button>':''}</span>
      ${S.media.radios.length?`<div class="m-list">${S.media.radios.map(r=>st(r,true)).join('')}</div>`:''}
      <details class="m-more" ${S.media.radios.length?'':'open'}><summary>Rádios portuguesas</summary>
        ${stations===null?'<p class="muted small">A carregar…</p>':stations.length?`<div class="m-list m-scroll">${(()=>{const bad=brokenSet();return stations.filter(s=>!favU.has(s.u)).sort((a,b)=>bad.has(a.u)-bad.has(b.u)).map(r=>st(r,false)).join('')})()}</div>`:'<p class="muted small">Não foi possível carregar a lista. <button type="button" class="edit" data-rsearch>Tentar de novo</button></p>'}
      </details>
      <details class="m-more"><summary>Outra rádio (endereço do stream)</summary>
        <div class="row" style="gap:8px;margin-top:8px"><input id="m-rn" placeholder="Nome" style="flex:1" value="${esc(vals['m-rn']||'')}"><input id="m-ru" placeholder="https://…" inputmode="url" style="flex:2" value="${esc(vals['m-ru']||'')}"><button type="button" class="addbtn" data-rcustom>Ouvir</button></div>
      </details>
    </div>`,{saveLabel:''});
  const nf=overlay.querySelector('form');nf.setAttribute('data-mediasheet','1');
  if(opn)nf.querySelectorAll('details.m-more').forEach((x,i)=>{if(i in opn)x.open=opn[i]});if(sc)nf.scrollTop=sc;
  if(was)nf.style.animation='none';
  if(keep){const e=overlay.querySelector('#'+keep);if(e)e.focus()}
  loadStations(false);
}

function refreshFrame(){if(S.wall&&S.wallView==='moldura'&&S.frameMode!=='galeria'&&!overlay.innerHTML)renderWall()}
function dockVideo(){const v=document.querySelector('#mediaLayer .ml-video');if(!v)return;
  const want={tv:'tv',site:'radio'}[v.dataset.kind]||'video';
  const slot=S.wall&&S.wallView==='moldura'&&S.frameMode===want&&!v.classList.contains('full')&&document.querySelector('.fm-'+want);
  if(!slot&&S.wall&&S.wallView==='moldura'&&!v.classList.contains('full'))mediaLayer().classList.add('mini');
  if(slot){mediaLayer().classList.remove('mini');const r=slot.getBoundingClientRect();v.classList.add('docked');Object.assign(v.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'})}
  else{v.classList.remove('docked');v.style.left=v.style.top=v.style.width=v.style.height=''}}
addEventListener('resize',()=>dockVideo());
function frameVideo(){const playing=!!document.querySelector('#mediaLayer .ml-video[data-kind="yt"]');
  if(playing)return '<div class="fm-slot"></div>';
  const isPl=u=>{const p=ytParse(u);return !!(p&&p.list)};
  const pls=S.media.videos.filter(v=>isPl(v.u)),vids=S.media.videos.filter(v=>!isPl(v.u));
  const tiles=a=>`<div class="fm-tiles">${a.map(v=>`<div class="fm-tw"><button class="fm-tile" data-ytplay="${esc(v.u)}" data-yttitle="${esc(v.t)}"><span class="fm-ti">${isPl(v.u)?'☰':'▶︎'}</span><b>${esc(v.t)}</b></button><button class="fm-x" data-ytdel="${esc(v.u)}" aria-label="Tirar dos favoritos">×</button></div>`).join('')}</div>`;
  const tab=S.ytTab||'fav';if(tab!=='fav'&&!S.ytRes&&!S.ytBusy&&!S.ytErr&&!(tab==='busca'&&!S.ytQ))ytLoad(tab==='busca'?S.ytQ:'');
  const yseg=`<div class="fm-seg" role="group" aria-label="YouTube">${[['fav','Favoritos'],['top','Em destaque'],['busca','Procurar']].map(([k,l])=>`<button data-yttab="${k}" aria-pressed="${tab===k}">${l}</button>`).join('')}</div>`;
  const head=`<div class="row" style="gap:10px;align-items:center;flex-wrap:wrap"><h3 style="margin-right:auto">YouTube</h3>${yseg}<button class="ghost" data-ytopen aria-label="Abrir a app do YouTube">App</button></div>`;
  if(tab!=='fav')return `<div class="fm-panel">${head}
    ${tab==='busca'?`<form class="row fm-search" data-ytsearch style="gap:8px"><input id="yt-q" type="search" placeholder="Procurar vídeos e playlists" value="${esc(S.ytQ||'')}" style="flex:1" enterkeyhint="search"><button class="addbtn" type="submit">Procurar</button></form>`:''}
    ${S.ytBusy?'<p class="muted">A carregar…</p>':S.ytErr?`<div class="fm-err">${S.ytErr}</div>`:(S.ytRes||[]).length?`<div class="fm-grid">${S.ytRes.map(r=>`<div class="fm-tw"><button class="fm-vid" data-ytplay="${esc(r.u)}" data-yttitle="${esc(r.t)}"><span class="fm-th" style="background-image:url('${esc(r.img)}')">${r.pl?'<i>☰ Playlist</i>':''}</span><b>${esc(r.t)}</b><small>${esc(r.ch)}</small></button><button class="fm-x fm-star" data-ytsavequick="${esc(r.u)}" data-yttitle="${esc(r.t)}" aria-label="Guardar nos favoritos">${S.media.videos.some(v=>v.u===r.u)?'★':'☆'}</button></div>`).join('')}</div>`:tab==='busca'?'<p class="muted">Escreve o que procuras e toca em Procurar.</p>':''}</div>`;
  return `<div class="fm-panel">${head}
    <div class="row" style="gap:8px"><input id="m-yt" placeholder="Cola aqui o link de um vídeo, direto ou lista" inputmode="url" style="flex:1"><button class="addbtn" data-ytgo>Ver</button></div>
    <div class="row" style="gap:8px;margin-top:8px"><input id="m-ytt" placeholder="Nome (ex.: Louvor da manhã)" style="flex:1"><button class="ghost" data-ytsave>Guardar</button></div>
    ${pls.length?`<h4 class="fm-h">Playlists favoritas</h4>${tiles(pls)}`:''}
    ${vids.length?`<h4 class="fm-h">Vídeos favoritos</h4>${tiles(vids)}`:''}
    ${S.media.videos.length?'':'<p class="muted">Para guardar uma playlist: no YouTube, abre a playlist, toca em Partilhar → Copiar link e cola aqui em cima. Também podes guardar com ☆ o que estiver a dar.</p>'}</div>`}
function openYouTube(){const u='https://www.youtube.com/';
  if(/Android/i.test(navigator.userAgent)){location.href='intent://www.youtube.com/#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url='+encodeURIComponent(u)+';end';return}
  window.open(u,'_blank','noopener')}
function frameRadio(){if(document.querySelector('#mediaLayer .ml-video[data-kind="site"]'))return '<div class="fm-slot"></div>';
  const now=S.radioNow,favU=new Set(S.media.radios.map(r=>r.u));
  const sites=S.media.sites||[];
  const tile=r=>`<button class="fm-tile${now&&now.k===r.u?' on':''}" data-radio="${esc(r.u)}" data-ralt="${esc(r.a||'')}" data-rname="${esc(r.n)}">${r.i?`<img src="${esc(r.i)}" alt="" loading="lazy" onerror="this.remove()">`:'<span class="fm-ti">📻︎</span>'}<b>${esc(r.n)}</b></button>`;
  const bad=brokenSet();const list=[...S.media.radios,...(stations||[]).filter(s=>!favU.has(s.u)&&!bad.has(s.u)).slice(0,Math.max(0,18-S.media.radios.length))];
  return `<div class="fm-panel"><div class="fm-now">${now?`<span class="ml-eq big" aria-hidden="true"><i></i><i></i><i></i></span><span><small>A ouvir</small><b>${esc(now.n)}</b></span><button class="ghost" data-mstop="radio">Parar</button>`:'<span class="muted">Toca numa rádio para ouvir</span>'}<button class="ghost" data-media style="margin-left:auto">Favoritas e mais</button></div>
    ${sites.length?`<h4 class="fm-h">Sites de rádio</h4><div class="fm-tiles">${sites.map(s=>`<div class="fm-tw"><button class="fm-tile" data-site="${esc(s.u)}" data-sname="${esc(s.n)}"><span class="fm-ti">🌐︎</span><b>${esc(s.n)}</b></button><button class="fm-x" data-sitedel="${esc(s.u)}" aria-label="Tirar">×</button></div>`).join('')}</div>`:''}
    <details class="m-more fm-add"${sites.length?'':' open'}><summary>+ Adicionar site de rádio (abre aqui na moldura)</summary>
      <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><input id="s-n" placeholder="Nome (ex.: Rádio Comercial)" style="flex:1;min-width:160px"><input id="s-u" placeholder="https://rayo.pt/radio-comercial" inputmode="url" style="flex:2;min-width:200px"><button class="addbtn" data-siteadd>Adicionar</button></div></details>
    ${list.length?`<h4 class="fm-h">Rádios</h4><div class="fm-tiles">${list.map(tile).join('')}</div>`:`<p class="muted">${stations===null?'A carregar rádios…':'Não foi possível carregar a lista de rádios.'}</p>`}</div>`}

function tvUrl(){return lsGet('fam.tvUrl')||NOS_URL}
function playTV(){playSite(tvUrl(),'NOS TV','tv')}
function playSite(u,title,kind){const L=mediaLayer();L.classList.remove('mini');
  let v=L.querySelector('.ml-video');if(!v){v=document.createElement('div');v.className='ml-video';L.appendChild(v)}
  v.dataset.kind=kind;v.dataset.u=u;
  v.innerHTML=`<div class="ml-bar"><b>${esc(title)}</b><span class="spacer"></span>${kind==='site'?'<button class="fd-btn" data-mstop="video">Rádios</button>':''}<button class="fd-btn" data-siteopen>Abrir fora</button><button class="fd-btn" data-mfull>Ecrã inteiro</button><button class="fd-btn" data-mmin>Minimizar</button><button class="fd-btn" data-mstop="video">Fechar</button></div>
    <iframe src="${esc(u)}" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowfullscreen></iframe>`;
  stopMedia('radio',true)}
function openNosApp(){const u=tvUrl();
  if(/Android/i.test(navigator.userAgent)){location.href='intent://'+u.replace(/^https:\/\//,'')+'#Intent;scheme=https;package=pt.nos.iris.online;S.browser_fallback_url='+encodeURIComponent(u)+';end';return}
  window.open(u,'_blank','noopener')}
function frameTV(){const on=!!document.querySelector('#mediaLayer .ml-video[data-kind="tv"]');
  if(on)return '<div class="fm-slot"></div>';
  return `<div class="fm-panel"><h3>NOS TV</h3>
    <p class="muted" style="margin:0">Abre o site da NOS TV aqui na moldura. Entra com a tua conta NOS na primeira vez.</p>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="addbtn" data-tvstart>Ver NOS TV aqui</button><button class="ghost" data-tvopen>Abrir na app / noutra janela</button><button class="ghost" data-tvurl>Mudar endereço</button></div>
    <p class="muted small" style="margin:0">Se a moldura ficar em branco ou com erro, é a NOS a bloquear o site dentro de outras páginas. Nesse caso usa <b>Abrir na app</b>: no tablet Android abre a app NOS TV; fechas a app e voltas ao Quadro.</p></div>`}

function photoSec(){const s=+lsGet('fam.photoSec');return s>=3?s:30}
function photoSlot(){return Math.floor(Date.now()/(photoSec()*1000))}
setInterval(()=>{if(S.wall&&!overlay.innerHTML&&S.wallView==='moldura'&&(S.frameMode||'galeria')==='galeria'&&S.photos.length>1&&photoSlot()!==S.lastSlot)renderWall()},1000);

function ytKey(){const C=window.QUADRO_CONFIG||{};return C.youtubeApiKey||(C.firebase&&C.firebase.apiKey)||''}
async function ytLoad(q){
  S.ytBusy=true;S.ytErr='';const key=ytKey();
  try{
    let url;
    if(q)url=`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video,playlist&maxResults=24&safeSearch=moderate&regionCode=PT&relevanceLanguage=pt&q=${encodeURIComponent(q)}&key=${key}`;
    else url=`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=PT&maxResults=24&key=${key}`;
    const r=await fetch(url),j=await r.json();
    if(!r.ok||j.error){const reason=(j.error&&j.error.errors&&j.error.errors[0]&&j.error.errors[0].reason)||'';const e=new Error(reason||(j.error&&j.error.message)||r.status);e.reason=reason;e.msg=j.error&&j.error.message;throw e}
    S.ytRes=(j.items||[]).map(it=>{const sn=it.snippet||{},id=typeof it.id==='string'?{videoId:it.id}:it.id||{};const th=sn.thumbnails||{};
      const pl=!!id.playlistId;return {t:decodeHtml(sn.title||''),ch:sn.channelTitle||'',img:(th.medium||th.high||th.default||{}).url||'',pl,u:pl?'https://www.youtube.com/playlist?list='+id.playlistId:'https://youtu.be/'+id.videoId}}).filter(x=>/list=|youtu\.be\/[\w-]+$/.test(x.u));
  }catch(e){console.warn('YouTube',e);S.ytRes=null;
    const proj=((window.QUADRO_CONFIG||{}).firebase||{}).projectId||'';
    S.ytErr=/accessNotConfigured|SERVICE_DISABLED/i.test(e.reason+' '+e.msg)?`Falta ativar a <b>YouTube Data API v3</b> no projeto Google do Quadro. Abre <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com?project=${esc(proj)}" target="_blank" rel="noopener">esta página</a>, carrega em <b>Ativar</b> e volta a tentar.`
      :/blocked|API_KEY_SERVICE_BLOCKED|forbidden/i.test(e.reason+' '+e.msg)?`A chave do Quadro não tem acesso ao YouTube. Na consola Google → <b>APIs e serviços → Credenciais</b>, abre a chave do browser e junta a <b>YouTube Data API v3</b> às APIs permitidas.`
      :/quota/i.test(e.reason+' '+e.msg)?'O limite diário de pesquisas do YouTube foi atingido. Amanhã volta a funcionar; até lá usa os favoritos.'
      :'Não foi possível falar com o YouTube agora. <button class="ghost" data-yttab="'+(S.ytTab||'top')+'">Tentar de novo</button>'}
  S.ytBusy=false;refreshFrame()}
function decodeHtml(s){const t=document.createElement('textarea');t.innerHTML=s;return t.value}
document.addEventListener('input',e=>{if(e.target.id==='yt-q')S.ytQ=e.target.value});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-ytsearch]');if(!f)return;e.preventDefault();const q=f.querySelector('#yt-q').value.trim();if(!q)return;S.ytQ=q;S.ytRes=null;ytLoad(q);refreshFrame()});
