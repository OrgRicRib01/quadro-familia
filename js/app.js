var MEALT=[['pequeno','Pequeno-almoço','☕'],['almoco','Almoço','🍽'],['lanche','Lanche','🥪'],['jantar','Jantar','🌙']];
var WXC={0:['☀️','Céu limpo'],1:['🌤️','Pouco nublado'],2:['⛅','Parcialmente nublado'],3:['☁️','Nublado'],45:['🌫️','Nevoeiro'],48:['🌫️','Nevoeiro'],
  51:['🌦️','Chuvisco fraco'],53:['🌦️','Chuvisco'],55:['🌧️','Chuvisco forte'],56:['🌧️','Chuvisco gelado'],57:['🌧️','Chuvisco gelado'],61:['🌦️','Chuva fraca'],63:['🌧️','Chuva'],65:['🌧️','Chuva forte'],
  66:['🌧️','Chuva gelada'],67:['🌧️','Chuva gelada'],71:['🌨️','Neve fraca'],73:['🌨️','Neve'],75:['❄️','Neve forte'],77:['🌨️','Granizo fino'],80:['🌦️','Aguaceiros'],81:['🌧️','Aguaceiros'],82:['⛈️','Aguaceiros fortes'],
  85:['🌨️','Aguaceiros de neve'],86:['🌨️','Aguaceiros de neve'],95:['⛈️','Trovoada'],96:['⛈️','Trovoada com granizo'],99:['⛈️','Trovoada com granizo']};
var FW=[['clock','Relógio e data','A hora grande e a data'],['wx','Tempo','Temperatura, chuva, nascer e pôr do sol'],['radio','Rádio','A primeira das tuas rádios'],['votd','Versículo do dia','YouVersion'],['spotify','Spotify','Playlists, álbuns e podcasts']];
var SH={st:null,at:0,busy:false,err:'',poll:null};
var IC_GATE='<svg class="ic-gate" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5v15M21 5v15M3 8h18M3 17h18" stroke-width="2"/><path d="M6.5 8v9M10 8v9M13.5 8v9M17 8v9" stroke-width="1.6"/><path d="M6.5 8l1-2.5 1 2.5M10 8l1-2.5 1 2.5M13.5 8l1-2.5 1 2.5" stroke-width="1.3"/></svg>';
var IC_GARAGE='<svg class="ic-gate" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10l9-6 9 6v10H3z" stroke-width="2"/><path d="M6.5 20v-8h11v8M6.5 14.5h11M6.5 17h11" stroke-width="1.6"/></svg>';
var SH_ZONES=[['','Automático'],['rc','Rés-do-chão'],['andar1','1.º andar'],['garagem','Garagem'],['portao','Portão da rua'],['exterior','Jardim / exterior']];
var GBD=null,gbdBusy=false;
var SPL={el:null,src:'',raf:0};
var TKIND={teste:['📝','Teste'],exame:['🎓','Exame'],trabalho:['📂','Trabalho'],apresentacao:['🎤','Apresentação']};
var GEAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
// Estado do leitor de vídeo/rádio (declarado no início para estar pronto no primeiro desenho do ecrã).
var stations=null,stationsBusy=false,audioEl=null,hls=null,radioTry=0;
var NOS_URL='https://nostv.pt/inicio/L3YxL215dHYvcm9vdD9jb250ZXh0PW90dF9tb2JpbGVfd2ViX3Yx';
const TABS=[
 {id:'agenda',label:'Agenda',icon:'<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'},
 {id:'lembretes',label:'Lembretes',icon:'<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>'},
 {id:'tarefas',label:'Tarefas',icon:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>'},
 {id:'compras',label:'Compras',icon:'<path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'},
 {id:'almocos',label:'Refeições',icon:'<path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 21V3c-2 1-3 4-3 7h3"/>'}
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
  wall:lsGet('fam.wall')==='1'||location.hash==='#mural', wallView:lsGet('fam.wallView')||'inicio', frameMode:(lsGet('fam.frameMode')||'galeria').replace(/^tv$/,'galeria'), wallDate:TODAY, lastHM:'', rotPart:null, prize:null, assets:null, wallSel:[], media:{videos:[],radios:[],sites:[],hidden:[]}
};
const GSERVER='Google Calendar';

/* ---------- store layer: shared db when available, in-memory otherwise ---------- */
const COLS=['events','reminders','tasks','recipes','meals','birthdays','vacations','photos','shopHistory','schoolBreaks','tests','edu','shopArchive'];
S.schoolBreaks=[];S.shopArchive=[];S.tests=[];S.edu=[];S.birthdays=[];S.vacations=[];S.photos=[];S.shopHistory=[];S.shopLists=[];S.shopList=lsGet('fam.shopList')||'';S.agView='cal';
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
    db.doc('data/users/'+S.uid+'/profile').onSnapshot(s=>{S.me=s.exists?s.data():null;S.meLoaded=true;maybeAutoSync();render();ensureMe()},()=>{});
  }
  db.collection('gcal').onSnapshot(snap=>{S.gcal={};snap.docs.forEach(d=>S.gcal[d.id]=d.data());render()},()=>{});
  famBackend.use('mcp').then(m=>{S.mcp=m;maybeAutoSync()}).catch(()=>{});
  famBackend.use('assets').then(a=>{S.assets=a}).catch(()=>{});
  db.doc('config/shopLists').onSnapshot(s=>{const l=s.exists&&s.data().lists;S.shopLists=Array.isArray(l)?l:[];render()},()=>{});
  db.doc('config/media').onSnapshot(s=>{const d=s.exists?s.data():{};S.media={videos:Array.isArray(d.videos)?d.videos:[],radios:Array.isArray(d.radios)?d.radios:[],sites:Array.isArray(d.sites)?d.sites:[],hidden:Array.isArray(d.hidden)?d.hidden:[],order:Array.isArray(d.order)?d.order:[]};if(overlay.querySelector('[data-mediasheet]'))mediaSheet()},()=>{});
  db.doc('config/clock').onSnapshot(s=>{const d=s.exists?s.data():{};S.clock={alarms:Array.isArray(d.alarms)?d.alarms:[]};if(S.wall&&S.wallView==='relogio'&&!overlay.innerHTML)renderWall()},()=>{});
  db.doc('config/weather').onSnapshot(s=>{const d=s.exists?s.data():null;if(d&&typeof d.lat==='number'){const ch=!S.wxPlace||S.wxPlace.lat!==d.lat||S.wxPlace.lon!==d.lon;S.wxPlace=d;if(ch){WX=null;wxLoad(true)}}},()=>{});
  db.doc('config/gonly').onSnapshot(s=>{const d=s.exists?s.data():{};S.gOnly=!!d.on;S.famCal=d.famCal||'';render()},()=>{});
  db.doc('config/youversion').onSnapshot(s=>{S.yv=s.exists?s.data():{};votdLoad(false)},()=>{});
  db.doc('config/frame').onSnapshot(s=>{S.fw=s.exists?s.data():{};if(S.wall)renderWall()},()=>{});
  db.doc('config/spotify').onSnapshot(s=>{S.spotify=s.exists?s.data():{items:[]};if(S.wall&&!overlay.innerHTML)renderWall()},()=>{});
  db.doc('config/shelly').onSnapshot(s=>{S.shelly=s.exists?s.data():{};if(S.wall&&S.wallView==='casa')renderWall()},()=>{});
  db.doc('config/prize').onSnapshot(s=>{S.prize=s.exists?s.data():null;render()},()=>{});
  db.doc('config/family').onSnapshot(s=>{
    const m=s.exists&&s.data().members;
    S.members=Array.isArray(m)&&m.length?m.map((x,i)=>({...x,name:x.name||'Pessoa '+(i+1),color:x.color||'p'+((i%8)+1)})):DEFAULT_MEMBERS;S.famLoaded=s.exists;render();ensureMe();
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
  const xp=e.extendedProperties&&e.extendedProperties.private||{};
  const dm=/(?:^|\n)\s*(?:Aluno|Aluna|Para|Pessoa)\s*:\s*([^\n<]+)/i.exec(String(e.description||''));
  return {w:dm?dm[1].trim().slice(0,40):'',q:String(xp.quadro||''),i:String(e.id||''),r:e.recurringEventId?String(e.recurringEventId):'',t:busy?'Ocupado':String(e.summary||'(sem título)').slice(0,120),d,e:ed,h,he:busy?'':he,p:busy?'':String(e.location||'').slice(0,80),c:busy?'':String(cname||'').slice(0,40)};
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
        (p.events||[]).forEach(e=>{const x=toEv(e,mode,names[cid]||p.summary);if(x){x.m=owner;x.ci=cid;out.push(x)}});
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
// Férias: a pessoa (ou toda a família) está de férias neste dia?
function isVacG(x){return x.q==='ferias'||/^\s*✈/.test(x.t||'')}
function onVacation(m,d){
  if((S.vacations||[]).some(v=>v.start&&d>=v.start&&d<=(v.end||v.start)&&(whoList(v.who).includes('all')||whoList(v.who).includes(m))))return true;
  return Object.entries(S.gcal||{}).some(([mid,doc])=>(doc.events||[]).some(x=>{if(!isVacG(x)||d<x.d||d>x.e)return false;const wm=x.w&&memberByName(x.w);const o=wm?wm.id:(x.m||mid);return o==='all'||o===m}))}
function gcalOn(d){
  const out=[],seen=new Set();const vac={};
  Object.entries(S.gcal).forEach(([mid,doc])=>{
    (doc.events||[]).forEach(x=>{
      const wm=x.w&&memberByName(x.w);const m=wm?wm.id:(x.m||mid);if(m!=='all'&&!member(m))return;
      if(!gOK(m,x.c))return;
      if(m!=='all'&&srcOf(m)==='quadro')return;
      if(gOnly()&&m!=='all'&&isSchoolG(x,m)&&schoolOff(m,d))return;
      if(d<x.d||d>x.e)return;
      if(x.c&&/feriad/i.test(x.c)&&holidayOn(d))return;
      // em férias, as atividades que se repetem (trabalho, aulas, treinos…) dessa pessoa não aparecem
      if(x.r&&!isVacG(x)){const ids=m==='all'?[]:[m];if(ids.length&&(vac[m]!==undefined?vac[m]:(vac[m]=onVacation(m,d))))return}
      const k=m+'|'+x.t+'|'+x.d+'|'+x.h;if(seen.has(k))return;seen.add(k);
      if(!gOnly()&&x.h&&x.d===d&&localAt(d).some(e=>e.time===x.h&&whoList(e.who).includes(m)))return;
      out.push({...x,mid:m,src:mid});
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
    <div class="field"><span>Adicionar calendário</span><div class="row" style="gap:8px;flex-wrap:wrap"><input id="g-addid" placeholder="Email ou ID do calendário (ex.: tiago…@gmail.com)" inputmode="email" style="flex:2;min-width:220px"><input id="g-addn" placeholder="Nome (opcional)" style="flex:1;min-width:140px"><button type="button" class="addbtn" id="g-add">Adicionar</button></div>
      <p class="muted small" style="margin:4px 0 0">Para calendários partilhados contigo que não aparecem na lista. A pessoa tem de o partilhar com a tua conta Google.</p></div>
    <div id="g-hidden"></div>
    <p class="muted small" style="margin:0">Os teus eventos atualizam sempre que abres o Quadro (de 15 em 15 minutos, no máximo).</p>`,
  {saveLabel:'Guardar e sincronizar',onSave:f=>{
    const memberId=val(f,'member');if(!memberId){toast('Escolhe quem és.');return false}
    const cals={},calNames={};
    f.querySelectorAll('[data-cal]').forEach(s=>{cals[s.dataset.cal]=s.value;calNames[s.dataset.cal]=s.dataset.name});
    const calMember={};f.querySelectorAll('[data-calm]').forEach(s=>{if(s.value)calMember[s.dataset.calm]=s.value});
    const prof={memberId,cals,calNames,calMember,extra:gx.extra,hidden:gx.hidden};
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
  const gx={extra:[...(me.extra||[])],hidden:[...(me.hidden||[])],fetched:[]};
  const draw=()=>{
    const keep={};box.querySelectorAll('[data-cal]').forEach(s=>keep[s.dataset.cal]=s.value);const keepM={};box.querySelectorAll('[data-calm]').forEach(s=>keepM[s.dataset.calm]=s.value);
    const all=[...gx.fetched,...gx.extra.filter(x=>!gx.fetched.some(c=>c.id===x.id)).map(x=>({id:x.id,summary:x.name,extra:true}))].filter(c=>!gx.hidden.includes(c.id));
    S.myCals=all;
    box.innerHTML=all.map((c,i)=>{const mode=keep[c.id]||(me.cals||{})[c.id]||(c.extra?'show':'off');const cm=keepM[c.id]!==undefined?keepM[c.id]:((me.calMember||{})[c.id]||'');
      return `<div class="item" style="flex-wrap:wrap;align-items:center;gap:8px"><span class="body" style="flex:1;min-width:60%"><div class="t">${esc(c.summary||c.id)}</div>${c.extra?`<div class="small muted">${esc(c.id)}</div>`:''}</span>
        <button type="button" class="edit" data-gremove="${esc(c.id)}" aria-label="Remover ${esc(c.summary||c.id)}">Remover</button>
        <span style="flex-basis:100%;display:flex;gap:8px;flex-wrap:wrap"><select data-cal="${esc(c.id)}" data-name="${esc(c.summary||'')}" class="gsel" aria-label="Mostrar">
          <option value="off" ${mode==='off'?'selected':''}>Não mostrar</option>
          <option value="show" ${mode==='show'?'selected':''}>Mostrar</option>
          <option value="busy" ${mode==='busy'?'selected':''}>Só "Ocupado"</option></select>
        <select data-calm="${esc(c.id)}" class="gsel" aria-label="De quem é"><option value="">É meu</option><option value="all" ${cm==='all'?'selected':''}>É da família (todos)</option>${S.members.map(m=>`<option value="${m.id}" ${cm===m.id?'selected':''}>É de ${esc(m.name)}</option>`).join('')}</select></span></div>`}).join('')||'<div class="empty">Nenhum calendário. Adiciona um em baixo.</div>';
    const hb=f.querySelector('#g-hidden');const hid=gx.hidden.map(id=>{const c=gx.fetched.find(x=>x.id===id);return {id,n:c?c.summary:id}}).filter(x=>gx.fetched.some(c=>c.id===x.id));
    hb.innerHTML=hid.length?`<p class="muted small" style="margin:0">Removidos: ${hid.map(h=>`${esc(h.n)} <button type="button" class="edit" data-grestore="${esc(h.id)}">Repor</button>`).join(' · ')}</p>`:'';
  };
  f.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.gremove){const id=b.dataset.gremove;gx.extra=gx.extra.filter(x=>x.id!==id);if(gx.fetched.some(c=>c.id===id)&&!gx.hidden.includes(id))gx.hidden.push(id);draw();toast('Removido. Carrega em Guardar para confirmar.');return}
    if(b.dataset.grestore){gx.hidden=gx.hidden.filter(x=>x!==b.dataset.grestore);draw();return}
    if(b.id==='g-add'){const id=f.querySelector('#g-addid').value.trim(),nm=f.querySelector('#g-addn').value.trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)){toast('Escreve o email ou o ID do calendário');return}
      gx.hidden=gx.hidden.filter(x=>x!==id);if(!gx.fetched.some(c=>c.id===id)&&!gx.extra.some(x=>x.id===id))gx.extra.push({id,name:nm||id.split('@')[0]});
      f.querySelector('#g-addid').value='';f.querySelector('#g-addn').value='';draw();toast('Calendário adicionado. Escolhe de quem é e carrega em Guardar.')}});
  if(!S.mcp){box.innerHTML=`<div class="empty">O Google Calendar não está configurado nesta instalação (ver README).</div>`;return}
  try{
    gx.fetched=await fetchCals();draw();
  }catch(e){draw();box.insertAdjacentHTML('afterbegin',`<div class="empty">${esc(gErr(e))}</div>`)}
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
  if(gOnly())return [];
  const dd=parse(d);
  return S.events.filter(e=>{
    if(!e.date||!matches(e))return false;
    if(!localShown(e))return false;
    if(e.school&&whoList(e.who).every(m=>schoolOff(m,d)))return false;
    if(e.date===d)return true;
    if(e.date>d)return false;
    if(e.repeat==='yearly')return e.date.slice(5)===d.slice(5);
    if(e.repeat==='weekly')return dowMon(parse(e.date))===dowMon(dd);
    if(e.repeat==='monthly')return e.date.slice(8)===d.slice(8);
    return false;
  }).concat(testsOn(d),eduOn(d)).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
}
function testsOn(d){return (S.tests||[]).filter(t=>t.date===d&&matches(t)).map(t=>({id:'test:'+t.id,title:tkind(t)[0]+' '+tkind(t)[1]+' de '+t.subject,date:d,time:t.time||'',who:t.who,place:'',note:t.note||'',test:true}))}
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
  if(gOnly())return [];
  const md=d.slice(5);const leap=new Date(+d.slice(0,4),1,29).getMonth()===1;
  return S.birthdays.filter(b=>b.md===md||(!leap&&b.md==='02-29'&&md==='02-28'));
}
const vacationsOn=d=>gOnly()?[]:S.vacations.filter(v=>v.start&&d>=v.start&&d<=(v.end||v.start)&&matches(v));
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
  try{if(!WX||Date.now()-WX.at>30*60000)wxLoad(false)}catch(e){}
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
  const seg=`<div class="seg" role="group" aria-label="Agenda"><button data-ag="cal" aria-pressed="${S.agView==='cal'}">Calendário</button><button data-ag="aniv" aria-pressed="${S.agView==='aniv'}">Aniversários</button><button data-ag="ferias" aria-pressed="${S.agView==='ferias'}">Férias</button><button data-ag="escola" aria-pressed="${S.agView==='escola'}">Férias escolares</button><button data-ag="edu" aria-pressed="${S.agView==='edu'||S.agView==='testes'}">Educação</button></div>`;
  if(S.agView==='aniv')return viewBirthdays(seg);
  if(S.agView==='escola')return viewSchoolBreaks(seg);
  if(S.agView==='testes'||S.agView==='edu')return viewEdu(seg);
  if(S.agView==='ferias')return viewVacations(seg);
  return viewCalendar(seg);
}
const SCHOOL_PRESET_2627=[
  {title:'Natal',start:'2026-12-16',end:'2027-01-03'},
  {title:'Carnaval',start:'2027-02-08',end:'2027-02-10'},
  {title:'Páscoa',start:'2027-03-22',end:'2027-04-02'}];
function schoolMembers(){const st=S.members.filter(m=>m.student).map(m=>m.id);if(st.length)return st;return [...new Set(S.events.filter(e=>e.school).flatMap(e=>whoList(e.who)).filter(m=>m!=='all'&&member(m)))]}
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
  const rows=allBdays().map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n);
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
  {const w=wxDay(S.sel);if(w)items+=`<button class="item wx-item" data-wxinfo><span class="time" style="font-size:1.4rem">${wxIc(w.c)}</span><span class="body"><span class="kind">Tempo · ${esc(wxPlace().name)}</span><div class="t">${esc(wxTxt(w.c))} · ${w.mx}° / ${w.mn}°</div><div class="sub">${w.pp!=null?'Chuva '+w.pp+'%'+(w.ps?' ('+w.ps+' mm)':'')+' · ':''}Nascer do sol ${w.sr} · Pôr do sol ${w.ss}</div></span></button>`}
  items+=birthdaysOn(S.sel).map(b=>{const a=ageOn(b,S.sel);return `<button class="item" data-edit-bday="${b.id}"><span class="time">🎂︎</span><span class="body"><span class="kind">Aniversário</span><div class="t">${esc(b.name)}${a!==null&&a>0?' · '+a+' anos':''}</div></span></button>`}).join('');
  if(holidayOn(S.sel))items+=`<div class="item"><span class="time">Dia</span><span class="body"><span class="kind" style="color:var(--danger)">Feriado nacional</span><div class="t">${esc(holidayOn(S.sel))}</div></span></div>`;
  items+=breaksOn(S.sel).filter(b=>matches(b)).map(b=>`<button class="item" data-edit-break="${b.id}"><span class="time">Dia</span><span class="body"><span class="kind">Sem aulas</span><div class="t">${esc(b.title)}</div><div class="people">${peopleTags(b.who)}</div></span></button>`).join('');
  items+=vacationsOn(S.sel).map(v=>`<button class="item" data-edit-vac="${v.id}"><span class="time">✈︎</span><span class="body"><span class="kind">Férias${v.place?' · '+esc(v.place):''}</span><div class="t">${esc(v.title)}</div><div class="sub">Até ${niceDate(v.end||v.start)}</div><div class="people">${peopleTags(v.who)}</div></span></button>`).join('');
  items+=mealsOn(S.sel).map(meal=>{const [k,l,ic]=mealT(meal);return `<button class="item" data-open-meal="${S.sel}|${k}|${esc(meal.id)}"><span class="time">${ic}</span><span class="body"><span class="kind">${l}</span><div class="t">${esc(meal.title)}</div>${meal.cook&&member(meal.cook)?`<div class="sub">Cozinha: ${esc(member(meal.cook).name)}</div>`:''}</span></button>`}).join('');
  items+=ev.map(e=>`<button class="item" data-edit-event="${e.id}"><span class="time">${e.time?esc(e.time):'Dia'}</span><span class="body">
      <span class="kind">${e.repeat==='yearly'?'Evento anual':'Evento'}</span><div class="t">${esc(e.title)}</div>
      ${e.place||e.note?`<div class="sub">${esc([e.place,e.note].filter(Boolean).join(' · '))}</div>`:''}
      <div class="people">${peopleTags(e.who)}</div></span></button>`).join('');
  items+=gcalOn(S.sel).sort((a,b)=>(a.h||'').localeCompare(b.h||'')).map(g=>{
    const multi=g.d!==g.e,showT=g.h&&g.d===S.sel;
    return `<button class="item" data-gev="${esc(g.src+'|'+g.i+'|'+g.d)}"><span class="time">${showT?esc(g.h):'Dia'}</span><span class="body">
      <span class="kind">Google${g.c?' · '+esc(g.c):''}</span><div class="t">${esc(g.t)}</div>
      ${g.p||(showT&&g.he&&!multi)?`<div class="sub">${esc([showT&&g.he&&!multi?'até '+g.he:'',g.p].filter(Boolean).join(' · '))}</div>`:''}
      <div class="people"><span class="ptag" style="--c:${colorOf(g.mid)}">${esc(gName(g.mid))}</span></div></span></button>`}).join('');
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
    if(since>Math.max(120,(avg||30)*4))return null; // já não se compra há muito tempo
    return avg&&avg>0?{h,score:since/avg,why:`costuma ser a cada ${dd(Math.max(1,Math.round(avg)))} · última há ${dd(since)}`}
                     :(h.count||0)>=2||since<=60?{h,score:since/21,why:`comprado há ${dd(since)}`}:null;
  }).filter(x=>x&&x.score>=0.85).sort((a,b)=>b.score-a.score||(b.h.count||0)-(a.h.count||0)).slice(0,10);
}
// fotografia do artigo (catálogo Auchan)
function shopImg(h,size){if(!h||!h.img)return '';const s=size||96;const u=/^https?:/.test(h.img)?h.img:'https://www.auchan.pt/dw/image/v2/BFRC_PRD/on/demandware.static/-/Sites-auchan-pt-master-catalog/default/images/hi-res/'+h.img+'.jpg?sw='+s+'&sh='+s+'&sm=fit&bgcolor=FFFFFF';
  return `<img class="shop-img" src="${esc(u)}" alt="" loading="lazy" onerror="this.remove()">`}
function shopHistOf(text){const id=slugify(text);return S.shopHistory.find(x=>x.id===id)}
function recordPurchase(t){const id=slugify(t.text);if(!id)return;const h=S.shopHistory.find(x=>x.id===id)||{};
  const dates=[...new Set([...(h.dates||[]),TODAY])].sort().slice(-12);
  const {id:_x,...hh}=h;save('shopHistory',id,{...hh,name:h.name||t.text,count:(h.count||0)+1,last:TODAY,dates,store:h.store||storeOf(t)})}
function saveShopLists(lists){if(S.db)S.db.doc('config/shopLists').set({lists}).catch(handleWriteError);else{S.shopLists=lists;render()}}
function addShopItem(text,store){save('tasks',null,{text,list:'Compras',store:store||curShop(),due:'',who:['all'],done:false,doneAt:'',repeat:'',part:'',doneDates:[]})}
function shopBody(big){
  const store=curShop(),it=shopItems(store);
  const open=it.filter(t=>!t.done).sort((a,b)=>(a.text||'').localeCompare(b.text||'','pt')),got=it.filter(t=>t.done);
  const lists=`<div class="${big?'w-who':'who'}" role="group" aria-label="Listas de compras">${shopLists().map(l=>{const n=shopItems(l).filter(x=>!x.done).length;
      return `<button class="chip" data-shoplist="${esc(l)}" aria-pressed="${l===store}">${esc(l)}${n?` <b>${n}</b>`:''}</button>`}).join('')}
    ${S.readOnly?'':'<button class="chip" data-shopnew>+ Lista</button>'}<button class="chip" data-shopmenu aria-label="Enviar, arquivar ou apagar a lista ${esc(store)}">⋯ Lista</button><button class="chip" data-shophist aria-pressed="${!!S.shopShowHist}">Histórico</button></div>`;
  const dl=`<datalist id="shophist">${S.shopHistory.map(h=>`<option value="${esc(h.name)}"></option>`).join('')}</datalist>`;
  const sug=S.readOnly?[]:shopSuggestions(store);
  const sugHtml=sug.length?`<div class="field"><span>Sugestões pelo histórico</span><div class="sugs">${sug.map(x=>`<button class="sug${x.h.img?' has-img':''}" data-shopsug="${esc(x.h.id)}">${shopImg(x.h,80)}<span><b>+ ${esc(x.h.name)}</b><small>${esc(x.why)}</small></span></button>`).join('')}</div></div>`:'';
  const nline=t=>`<div class="item ${t.done?'done':''}"><button class="check" role="checkbox" aria-checked="${!!t.done}" data-toggle-task="${t.id}" aria-label="Comprado"></button>
    ${shopImg(shopHistOf(t.text),80)}<span class="body"><div class="t">${esc(t.text)}</div>${whoList(t.who).includes('all')?'':`<div class="people">${peopleTags(t.who)}</div>`}</span>
    <button class="edit" data-edit-task="${t.id}">Editar</button></div>`;
  const wline=t=>`<button class="w-rtask w-shopit${t.done?' ok':''}" data-toggle-task="${t.id}" role="checkbox" aria-checked="${!!t.done}" style="--c:var(--accent)"><span class="box">${t.done?'✓':''}</span>${shopImg(shopHistOf(t.text),80)}<span class="tt">${esc(t.text)}</span></button>`;
  const wrapOpen=big?`<div class="w-shop">${open.map(wline).join('')||'<div class="empty">Nada em falta nesta lista. Escreve acima o que acabar.</div>'}</div>`
                   :`<div class="list">${open.map(nline).join('')||'<div class="empty">A lista está vazia.<br>Escreve acima o que falta. Podes pôr vários de uma vez, separados por vírgulas.</div>'}</div>`;
  const wrapGot=got.length?`<div class="row" style="margin-top:6px"><span class="kind">No carrinho (${got.length})</span><span class="spacer"></span><button class="edit" data-clearshop>Limpar comprados</button></div>
    ${big?`<div class="w-shop">${got.map(wline).join('')}</div>`:`<div class="list">${got.slice(0,40).map(nline).join('')}</div>`}`:'';
  let hist='';
  if(S.shopShowHist){
    const all=S.shopHistory.filter(h=>(h.store||DEF_SHOP)===store);
    const cats=[...new Set(all.map(h=>h.cat).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt'));
    const q=slugify(S.shopQ||''),cf=cats.includes(S.shopCat)?S.shopCat:'';
    const hs=all.filter(h=>(!cf||h.cat===cf)&&(!q||h.id.includes(q))).sort((a,b)=>(b.count||0)-(a.count||0)||(b.last||'').localeCompare(a.last||''));
    const lim=S.shopHistAll?hs.length:60;
    hist=`<div class="field"><span>Os meus artigos · ${esc(store)} (${all.length})</span>
      <input type="search" id="shop-hq" value="${esc(S.shopQ||'')}" placeholder="Procurar nos artigos (ex.: leite, queijo)" autocomplete="off" aria-label="Procurar nos artigos">
      ${cats.length?`<div class="who sh-cats" style="flex-wrap:wrap;margin-top:6px"><button class="chip" data-shopcat="" aria-pressed="${!cf}">Todos</button>${cats.map(x=>`<button class="chip" data-shopcat="${esc(x)}" aria-pressed="${cf===x}">${esc(x)}</button>`).join('')}</div>`:''}
      <div class="list">${hs.slice(0,lim).map(h=>{const {since,avg}=shopStats(h);
      return `<div class="item">${shopImg(h,96)}<span class="body"><div class="t">${esc(h.name)}</div><div class="sub">${h.cat?esc(h.cat)+' · ':''}${h.count||0} ${h.count===1?'vez':'vezes'} · última ${since===0?'hoje':'há '+since+' dias'}${avg?` · a cada ~${Math.max(1,Math.round(avg))} dias`:''}${h.price?' · '+esc(h.price):''}</div></span>
      ${S.readOnly?'':`<button class="edit" data-shopsug="${esc(h.id)}">Adicionar</button>`}</div>`}).join('')||(all.length?'<div class="empty">Nenhum artigo encontrado.</div>':'<div class="empty">Ainda sem histórico. Fica registado cada vez que marcas um artigo como comprado.</div>')}
      ${hs.length>lim?`<button class="ghost" data-shophall>Mostrar todos (${hs.length})</button>`:''}</div></div>`;
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
  for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(ws.getDate()+i);const ds=iso(d);const ms=mealsOn(ds);
    days+=`<div class="meal mealday ${ds===TODAY?'today':''}"><div class="d"><span>${DOW[i]}</span><b>${d.getDate()}</b></div>
      <div class="body">${ms.length?mealRows(ds):`<button type="button" class="plate none" data-open-meal="${ds}">Por decidir</button>`}</div>
      <button type="button" class="meal-add" data-open-meal="${ds}" aria-label="Adicionar refeição a ${DOW[i]} ${d.getDate()}">＋</button></div>`;}
  return `<section class="panel">${seg}
    <div class="row"><h2>${ws.getDate()} ${MONTHS[ws.getMonth()].slice(0,3)} – ${end.getDate()} ${MONTHS[end.getMonth()].slice(0,3)}</h2><span class="spacer"></span>
      <button class="iconbtn" data-week="-1" aria-label="Semana anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>
      <button class="iconbtn" data-week="1" aria-label="Semana seguinte"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button></div>
    <div class="week">${days}</div>
    <p class="muted small" style="margin:0">Toca em ＋ para juntar uma refeição (pequeno-almoço, almoço, lanche ou jantar).</p>
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
    ${S.mcp&&!e.gId&&!e.id?`<div class="two"><label class="field"><span>Guardar em</span><select id="f-dest" name="dest">
      <option value="quadro">Só na agenda do Quadro</option><option value="ambos">Agenda do Quadro + Google</option><option value="google">Só no Google Calendar</option></select></label>
      <label class="field" data-gcalbox hidden><span>Calendário Google</span><select id="f-gcal" name="gcal"><option value="primary">Principal</option>
      ${(S.myCals||[]).filter(c=>!/holiday|#/.test(c.id)).map(c=>`<option value="${esc(c.id)}">${esc(c.summary||c.id)}</option>`).join('')}
    </select></label></div>`:S.mcp&&!e.gId?`<label class="field"><span>Também no meu Google Calendar</span><select id="f-gcal" name="gcal">
      <option value="">Não</option><option value="primary">Sim, no calendário principal</option>
      ${(S.myCals||[]).filter(c=>!/holiday|#/.test(c.id)).map(c=>`<option value="${esc(c.id)}">Sim, em ${esc(c.summary||c.id)}</option>`).join('')}
    </select></label>`:e.gId?`<p class="muted small" style="margin:0">Já enviado para o Google Calendar. Alterações aqui não mudam o evento no Google.</p>`:''}`,
  {onSave:f=>{const title=val(f,'title');if(!title){toast('Escreve o nome do evento.');return false}
      const id=e.id||uid();const dest=f.elements.dest?val(f,'dest'):(val(f,'gcal')?'ambos':'quadro');const gc=dest==='quadro'?'':(val(f,'gcal')||'primary');if(gc)allowGooglePrompt();
      const body={title,date:val(f,'date')||S.sel,time:val(f,'time'),place:val(f,'place'),repeat:val(f,'repeat'),note:val(f,'note'),who:readWho(f),gId:e.gId||''};
      (async()=>{
        if(dest==='google'){const gid=await pushToGoogle(body,gc==='primary'?'':gc);if(gid){toast('Criado no Google Calendar');setTimeout(()=>{S.gbusy=0;syncGoogle(S.me,false)},1500)}return}
        await save('events',id,body);
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
function mealForm(arg){
  const [d,t0,id0]=String(arg).split('|');
  const m=(id0&&S.meals[id0])||(t0?S.meals[mealId(d,t0)]:null)||{};
  let tipo=m.title?mealTipo(m):(t0||mealGuess(d));
  const rs=[...S.recipes].sort((a,b)=>(a.name||'').localeCompare(b.name||'','pt'));
  const f=sheet((m.title?'Editar refeição':'Nova refeição')+' · '+niceDate(d),`
    <div class="field"><span>Refeição</span><div class="seg meal-seg" role="group" aria-label="Tipo de refeição">${MEALT.map(([k,l,ic])=>`<button type="button" data-mt="${k}" aria-pressed="${tipo===k}">${ic} ${l}</button>`).join('')}</div></div>
    ${rs.length?`<label class="field"><span>Do livro de receitas</span><select id="m-recipe" name="recipe"><option value="">Escolher…</option>${rs.map(r=>`<option value="${r.id}" ${m.recipeId===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label>`:''}
    <label class="field"><span>${rs.length?'Ou escreve o prato':'Prato'}</span><input id="m-title" name="title" value="${esc(m.title)}" placeholder="Ex.: Sopa e bacalhau à Brás"></label>
    <label class="field"><span>Quem cozinha</span><select id="m-cook" name="cook"><option value="">—</option>${S.members.map(p=>`<option value="${p.id}" ${m.cook===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label>
    ${m.recipeId&&S.recipes.find(r=>r.id===m.recipeId)?`<button type="button" class="ghost" data-seer>Ver receita</button>`:''}`,
  {onSave:async f=>{const rid=val(f,'recipe');const rec=S.recipes.find(r=>r.id===rid);
      const title=val(f,'title')||(rec&&rec.name)||'';const nid=mealId(d,tipo);
      if(!title){if(m.title)remove('meals',m.id);return}
      let recipeId=rec&&(!val(f,'title')||val(f,'title')===rec.name)?rid:(m.recipeId&&title===m.title?m.recipeId:'');
      if(m.id&&m.id!==nid)remove('meals',m.id);
      save('meals',nid,{title,recipeId,cook:val(f,'cook'),date:d,tipo,img:title===m.title?m.img||'':''})},
   onDelete:m.title&&!S.readOnly?()=>remove('meals',m.id):null});
  f.querySelectorAll('[data-mt]').forEach(b=>b.addEventListener('click',()=>{tipo=b.dataset.mt;f.querySelectorAll('[data-mt]').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
  const sel=f.querySelector('[name=recipe]');
  sel?.addEventListener('change',()=>{const rec=S.recipes.find(r=>r.id===sel.value);if(rec)f.elements.title.value=rec.name});
  f.querySelector('[data-seer]')?.addEventListener('click',()=>{const r=S.recipes.find(x=>x.id===m.recipeId);if(r){closeSheet();recipeView(r)}});
}
function familyForm(){
  const u=window.famBackend&&window.famBackend.user;
  const f=sheet('A família',`<p class="muted small" style="margin:0">O perfil de cada pessoa. A cor acompanha-a em toda a app.</p>
    ${S.members.map((m,i)=>`<div class="prof"><div class="mem"><label class="prof-ph" title="Mudar fotografia" data-phm="${m.id}" style="--c:var(--${m.color})${m.photo?`;background-image:url('${m.photo}')`:''}">${m.photo?'':esc((m.name||'?').trim().charAt(0).toUpperCase())}<input type="file" accept="image/*" hidden data-phin="${m.id}"><span class="prof-cam" aria-hidden="true">📷︎</span></label><span class="field" style="flex:1"><input id="mem-${i}" name="m${i}" value="${esc(m.name)}" aria-label="Nome ${i+1}"></span></div>
      <div class="prof-row"><input type="email" name="em${i}" value="${esc(m.email||'')}" placeholder="Email da conta Google de ${esc(m.name)}" inputmode="email" style="flex:2;min-width:220px" aria-label="Email de ${esc(m.name)}">
        <label class="prof-chk" title="Conta principal: gere a família e os dados"><input type="radio" name="admin" value="${m.id}" ${adminId()===m.id?'checked':''}> Conta principal</label></div>
      <div class="prof-row"><select name="k${i}" aria-label="Adulto ou criança">${[['adulto','Adulto'],['crianca','Criança']].map(([k,l])=>`<option value="${k}" ${(m.kind||'adulto')===k?'selected':''}>${l}</option>`).join('')}</select>
        <label class="prof-chk"><input type="checkbox" name="st${i}" ${m.student?'checked':''}> Estudante</label>
        ${isAdmin()&&adminId()!==m.id?`<button type="button" class="edit" data-memdel="${m.id}">Remover</button>`:''}
        <select name="src${i}" aria-label="O que mostrar na agenda">${[['ambos','Agenda: Quadro + Google'],['quadro','Agenda: só Quadro'],['google','Agenda: só Google']].map(([k,l])=>`<option value="${k}" ${(m.src||'ambos')===k?'selected':''}>${l}</option>`).join('')}</select></div>
      <div class="prof-row prof-cal"><span class="small muted" style="flex-basis:100%">Calendários Google: ${memberCals(m.id).map(x=>`<span class="ptag" style="--c:var(--${m.color})">${esc(x.n)} <button type="button" class="edit" data-calunlink="${esc(x.id)}" aria-label="Desligar ${esc(x.n)}">×</button></span>`).join(' ')||'nenhum'}</span>
        <input data-calin="${m.id}" placeholder="Email do Google Calendar de ${esc(m.name)}" inputmode="email" style="flex:1;min-width:200px"><button type="button" class="ghost" data-callink="${m.id}">Ligar calendário</button></div></div>`).join('')}
    <button type="button" class="addbtn" data-memadd>+ Adicionar pessoa</button>
    <p class="muted small" style="margin:0">Toca no círculo de cada pessoa para pôr uma <b>fotografia</b>. ${S.members.some(m=>m.photo)?'<button type="button" class="edit" data-phclear>Tirar fotografias</button>':''}</p>
    <p class="muted small" style="margin:0"><b>Email:</b> cada pessoa entra no Quadro com esta conta Google e o Quadro sabe logo quem é. <b>Conta principal:</b> pode remover pessoas e importar dados.</p>
    <p class="muted small" style="margin:0"><b>Estudante:</b> recebe as férias escolares. <b>Criança:</b> entra no quadro das estrelas. <b>Agenda:</b> mostrar os eventos do Quadro, do Google ou ambos.</p>
    <div class="field"><span>Dados</span><div class="row" style="flex-wrap:wrap">
      <button type="button" class="ghost" id="btnExport">Exportar cópia</button>
      ${S.readOnly||!S.db?'':'<label class="ghost" style="cursor:pointer">Importar cópia<input id="impFile" type="file" accept="application/json,.json" hidden></label>'}
      ${u?`<button type="button" class="ghost" id="btnOut">Sair (${esc(u.email||'')})</button>`:''}
    </div></div>`,
  {onSave:f=>{saveMembers(S.members.map((m,i)=>({...m,photo:f._ph&&m.id in f._ph?f._ph[m.id]:(m.photo||''),email:(val(f,'em'+i)||'').toLowerCase(),admin:(f.querySelector('input[name=admin]:checked')||{}).value===m.id,name:val(f,'m'+i)||m.name,kind:val(f,'k'+i)||'adulto',student:!!(f.elements['st'+i]&&f.elements['st'+i].checked),src:val(f,'src'+i)||'ambos'})))}});
  f._ph={};
  f.addEventListener('change',async e=>{const inp=e.target.closest('[data-phin]');if(!inp||!inp.files[0])return;
    try{const url=await avatarData(inp.files[0]);f._ph[inp.dataset.phin]=url;const l=inp.closest('.prof-ph');l.style.backgroundImage=`url('${url}')`;l.firstChild.nodeType===3&&(l.firstChild.textContent='');toast('Fotografia pronta. Carrega em Guardar.')}catch(err){toast('Não foi possível usar essa imagem.')}});
  f.addEventListener('click',e=>{if(e.target.closest('[data-phclear]')){S.members.forEach(m=>f._ph[m.id]='');f.querySelectorAll('.prof-ph').forEach(l=>l.style.backgroundImage='');toast('Carrega em Guardar para tirar as fotografias.')}});
  f.querySelector('#btnExport').addEventListener('click',exportData);
  const imp=f.querySelector('#impFile');
  if(imp)imp.addEventListener('change',async()=>{const file=imp.files[0];if(!file)return;
    let j;try{j=JSON.parse(await file.text())}catch(e){toast('Esse ficheiro não é uma cópia do Quadro.');return}
    closeSheet();importData(j)});
  const out=f.querySelector('#btnOut');if(out)out.addEventListener('click',()=>window.famBackend.signOut());
}
function exportData(){
  const out={app:'quadro-familia',version:1,exportedAt:new Date().toISOString(),config:{family:{members:S.members},prize:S.prize||null},profile:S.me||null};
  ['events','reminders','tasks','recipes','birthdays','vacations','shopHistory','schoolBreaks','tests','edu'].forEach(c=>{out[c]=S[c]});out.config.shopLists=S.shopLists||[];
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
  for(const c of ['events','reminders','tasks','recipes','birthdays','vacations','meals','shopHistory','schoolBreaks','tests','edu']){
    for(const row of (Array.isArray(j[c])?j[c]:[])){
      if(!row||!row.id)continue;let {id,...data}=row;
      // artigos de compras: junta ao histórico que já existe em vez de o substituir
      if(c==='shopHistory'){const h=S.shopHistory.find(x=>x.id===id);if(h){const ds=[...new Set([...(h.dates||[]),...(data.dates||[])])].sort().slice(-12);
        data={...h,...data,count:h.src&&h.src===data.src?Math.max(h.count||0,data.count||0):(h.count||0)+(data.count||0),dates:ds,last:[h.last||'',data.last||''].sort().pop()};delete data.id}}
      await put(c+'/'+String(id).replace(/\//g,'_'),data);
    }
  }
  if(j.config&&j.config.family&&Array.isArray(j.config.family.members)){
    // junta aos dados atuais (não apaga fotografias nem outros campos)
    const cur=S.members||[],inc=j.config.family.members,ids=new Set(cur.map(m=>m.id));
    const merged=cur.map(m=>{const x=inc.find(y=>y.id===m.id);return x?{...m,...x}:m}).concat(inc.filter(x=>!ids.has(x.id)));
    await put('config/family',{members:merged})}
  if(j.config&&j.config.gonly){let cur={};try{const s=await S.db.doc('config/gonly').get();cur=s.exists?s.data():{}}catch(e){}await put('config/gonly',{...cur,...j.config.gonly})}
  if(j.config&&j.config.prize)await put('config/prize',j.config.prize);
  if(j.config&&Array.isArray(j.config.shopLists)&&j.config.shopLists.length)await put('config/shopLists',{lists:[...new Set([...shopLists(),...j.config.shopLists])]});
  if(j.profile&&S.uid){const me=S.me||{},p=j.profile;
    const ex=[...(me.extra||[]).filter(x=>!(p.extra||[]).some(y=>y.id===x.id)),...(p.extra||[])];
    await put('data/users/'+S.uid+'/profile',{...me,...p,cals:{...(me.cals||{}),...(p.cals||{})},calMember:{...(me.calMember||{}),...(p.calMember||{})},calNames:{...(me.calNames||{}),...(p.calNames||{})},extra:ex,hidden:(me.hidden||[]).filter(x=>!(p.cals&&p.cals[x]))});S.autoSynced=false}
  toast(fail?n+' itens importados, '+fail+' falharam.':n+' itens importados.');
}

/* ---------- wall / touch display ---------- */
function schoolEnd(e){const m=/até (\d\d:\d\d)/.exec(e.note||'');return m?m[1]:''}
function nowHM(){const n=new Date();return pad(n.getHours())+':'+pad(n.getMinutes())}
const isAll=x=>whoList(x.who).includes('all');
const forM=(x,m)=>!isAll(x)&&whoList(x.who).includes(m);
function wallData(d,raw){
  const f=S.filter;S.filter=wFilter();
  const r={ev:eventsOn(d),rm:remindersOn(d),vac:vacationsOn(d),g:raw?gcalOn(d):groupSchoolG(gcalOn(d),d),bd:birthdaysOn(d),meal:mealNext(d),meals:mealsOn(d)};
  S.filter=f;return r;
}
function colItems(m,D,d){
  const its=[];
  D.vac.filter(v=>forM(v,m)).forEach(v=>its.push({k:'',t:'Férias · '+v.title,s:'até '+niceDate(v.end||v.start),a:`data-edit-vac="${v.id}"`}));
  D.ev.filter(e=>forM(e,m)).forEach(e=>its.push({k:e.time||'',end:schoolEnd(e),t:e.title,s:e.place||'',a:`data-edit-event="${e.id}"`}));
  D.g.filter(g=>g.mid===m||g.mid==='all').forEach(g=>{const st=!!g.h&&g.d===d;its.push({k:st?g.h:'',end:st&&g.d===g.e?g.he:'',t:g.t,s:[g.c,g.p].filter(Boolean).join(' · '),a:(g.i?`data-gev="${esc(g.src+'|'+g.i+'|'+g.d)}"`:g.t==='Escola'?`data-wday="${g.d}"`:'')})});
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
  if(m.photo)return `<span class="av ph${small?' sm':''}" style="--c:var(--${m.color});background-image:url('${m.photo}')" aria-hidden="true"></span>`;
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
  casa:['#F59E0B','<path d="M4 11.5 12 5l8 6.5V20H4z"/><path d="M12 13.5a2 2 0 1 1 0 .01M12 16v2"/>'],
  educacao:['#0EA5E9','<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11M21.5 9v5"/>'],
  relogio:['#F43F5E','<circle cx="12" cy="13" r="7"/><path d="M12 9.5V13l2.5 1.5M5 4 2.5 6.5M19 4l2.5 2.5"/>'],
  moldura:['#10B981','<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 16l5-5 4 4 2-2 5 5"/><circle cx="15.5" cy="9" r="1.5"/>']};
function navBar(){
  return `<nav class="fd-nav" aria-label="Vistas"><div class="fd-nav-in">${LAYOUTS.map(([k,l])=>{const ic=NAV_ICONS[k]||['#888',''];
    return `<button data-wv="${k}" aria-pressed="${S.wallView===k}"><span class="ic" style="--ic:${ic[0]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ic[1]}</svg></span><span class="lb">${l}</span></button>`}).join('')}
    <button data-wset><span class="ic" style="--ic:#64748B">${GEAR}</span><span class="lb">Configuração</span></button>
    <button data-wexit><span class="ic" style="--ic:#78716C"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/></svg></span><span class="lb">Sair</span></button></div></nav>`}
const LAYOUTS=[['inicio','Início'],['semana','Semana'],['hoje','Pessoas'],['linha','Linha'],['mes','Mês'],['rotinas','Rotinas'],['compras','Compras'],['avisos','Avisos'],['casa','Casa'],['educacao','Educação'],['relogio','Alarmes'],['moldura','Moldura']];
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
  const nav=!['rotinas','compras','avisos','inicio','relogio','educacao','casa'].includes(S.wallView);
  const cal=['semana','mes','hoje','linha','pessoas'].includes(S.wallView);
  const n=new Date();
  const lbl=S.wallView==='inicio'?'Família '+esc(familyName())+'<small>Início</small>':wallLabel();
  const off=cal&&S.wallDate&&!wallShows(TODAY);
  // hora, dia de hoje e tempo empilhados à esquerda; seleção de pessoas e calendários em cima; a vista e a data de hoje junto ao calendário
  return `<div class="fd-top fd-top2"><div class="fd-now"><div class="fd-clock" id="wClock">${nowHM()}</div><div class="fd-today">${esc(DOW[dowMon(n)]+', '+n.getDate()+' '+MONTHS[n.getMonth()])}</div>${wxNow()}</div>
    <div class="fd-main"><div class="fd-row1">${whoBar()}</div>
    <div class="fd-row2"><div class="fd-date fd-view"><b>${lbl.replace(/<small>[\s\S]*$/,'')}</b>${(lbl.match(/<small>[\s\S]*$/)||[''])[0]}</div>
      ${cal?`<button class="fd-todaypill${off?' off':''}" data-wtoday title="Voltar a hoje"><span>Hoje</span><b>${esc(DOW[dowMon(n)]+' '+n.getDate()+' '+MONTHS[n.getMonth()].slice(0,3))}</b>${off?'<em>voltar</em>':''}</button>`:''}
      <span class="fd-sp"></span>${nav?`<div class="fd-ctl"><button class="fd-btn" data-wshift="-1" aria-label="Anterior">‹</button>${S.wallDate!==TODAY&&!cal?'<button class="fd-btn" data-wtoday>Hoje</button>':''}<button class="fd-btn" data-wshift="1" aria-label="Seguinte">›</button></div>`:''}
      <div class="fd-ctl">${clockChip()}<button class="fd-btn urg-top" data-urgent aria-label="Mensagem urgente">⚠</button><button class="fd-btn" data-wgoogle>Google</button><button class="fd-btn fd-gear" data-wset aria-label="Configuração">${GEAR}</button><button class="fd-btn" data-wfs aria-label="Ecrã inteiro">⛶</button></div></div></div></div>`;
}
// a vista atual inclui o dia de hoje?
function wallShows(d){const v=S.wallView,w=S.wallDate||TODAY;
  if(v==='semana')return weekStartOf(w)===weekStartOf(d);
  if(v==='mes')return w.slice(0,7)===d.slice(0,7);
  return w===d}
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
  D.g.forEach(g=>{const h=g.h&&g.d===d?g.h:'';its.push({k:h,end:h?(g.he||addMin(h,60)):'',t:g.t,s:g.p||g.c||'',m:g.mid,a:(g.i?`data-gev="${esc(g.src+'|'+g.i+'|'+g.d)}"`:g.t==='Escola'?`data-wday="${g.d}"`:'')})});
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
  const kids=S.members.filter(m=>m.kind==='crianca');const stars=(kids.length?kids:S.members).map(m=>({m,n:starsFor(m.id)}));const mx=Math.max(1,...stars.map(x=>x.n));
  const board=`<div class="fd-bars">${stars.map(x=>`<div class="fd-bcol"><b>${x.n}</b><span class="fd-b" style="height:${Math.max(4,Math.round(x.n/mx*86))}px;background:var(--${x.m.color})"></span><small>${esc(x.m.name)}</small></div>`).join('')}</div>`;
  const meal=mealNext(TODAY),nx=[1,2].map(k=>{const x=parse(TODAY);x.setDate(x.getDate()+k);const ds=iso(x);const ms=mealsOn(ds);return `<div class="fd-mrow"><span>${DOW[dowMon(x)]}</span>${ms.length?ms.map(m=>mealT(m)[2]+' '+esc(m.title)).join(' · '):'<i>por decidir</i>'}</div>`}).join('');
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
      <div class="fd-card">${head('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 21V3c-2 1-3 4-3 7h3"/></svg>','Refeições',meal?mealT(meal)[1]+(mealsOn(TODAY).length>1?' · +'+(mealsOn(TODAY).length-1):''):'Hoje','data-open-meal="'+TODAY+'"')}
        <div class="fd-cb"><div class="fd-meal">${meal?mealT(meal)[2]+' '+esc(meal.title):'Por decidir'}</div>${meal&&meal.cook&&member(meal.cook)?`<small class="muted">Cozinha: ${esc(member(meal.cook).name)}</small>`:''}${nx}
        <button class="fd-chip" data-wv="compras">Compras · ${shopN}</button></div></div>
      <div class="fd-card">${head(IC('rotinas'),'Tarefas',todos.length+' por fazer','data-wv="avisos"')}<div class="fd-cb">${todos.slice(0,4).map(t=>`<div class="fd-todo"><button class="check" role="checkbox" aria-checked="false" data-toggle-task="${t.id}" aria-label="Feita"></button><span><b>${esc(t.text)}</b><small>${esc(t.list||'')}${t.due?' · até '+esc(rel(t.due)):''}</small></span><span class="dot" style="--c:${dotsFor(t.who)[0]}"></span></div>`).join('')||'<div class="muted small">Tudo feito!</div>'}</div></div>
    </div></div>`;
}
function railMeal(d){return mealCard(d)}
function mealCard(d){const ms=mealsOn(d);
  return `<div class="w-card"><h4>Refeições${d===TODAY?' de hoje':''}</h4>${ms.map(m=>{const [k,l,ic]=mealT(m);return `<button class="w-it" data-open-meal="${d}|${k}|${esc(m.id)}"><span class="tm">${ic}</span><span style="flex:1;min-width:0"><div class="tt">${esc(m.title)}</div><div class="ss">${l}${m.cook&&member(m.cook)?' · '+esc(member(m.cook).name):''}</div></span></button>`}).join('')}<button class="w-it" data-open-meal="${d}"><span class="tm">＋</span><span style="flex:1;min-width:0"><div class="tt">${ms.length?'Juntar refeição':'Por decidir'}</div><div class="ss">Tocar para escolher</div></span></button></div>`}
function railReminders(d){
  const pend=S.reminders.filter(r=>!r.done&&r.date&&r.date<=d&&wMatch(r)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))).slice(0,5);
  return `<div class="w-card"><h4>Lembretes</h4>${pend.map(r=>`<div class="w-it"><button class="check" role="checkbox" aria-checked="false" data-toggle-rem="${r.id}" aria-label="Marcar como feito"></button><span style="flex:1;min-width:0"><div class="tt">${esc(r.text)}</div><div class="ss"${r.date<TODAY?' style="color:var(--danger)"':''}>${rel(r.date)}${r.time?' · '+esc(r.time):''}</div></span></div>`).join('')||'<div class="empty">Sem lembretes pendentes</div>'}</div>`}
function railBirthdays(){
  const up=allBdays().map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n).slice(0,3);
  return `<div class="w-card"><h4>Próximos aniversários</h4>${up.map(b=>`<button class="w-it" data-edit-bday="${b.id}"><span class="tm">${+b.md.slice(3)}/${+b.md.slice(0,2)}</span><span style="flex:1;min-width:0"><div class="tt">${esc(b.name)}</div><div class="ss">${b.n===0?'Hoje!':b.n===1?'Amanhã':'Daqui a '+b.n+' dias'}</div></span></button>`).join('')||'<div class="empty">Sem aniversários registados</div>'}</div>`}
function wallDay(d){
  const D=wallData(d,true);
  const band=[
    ...D.bd.map(b=>{const a=ageOn(b,d);return `<button class="w-pill" data-edit-bday="${b.id}">🎂︎ <b>${esc(b.name)}</b>${a>0?' faz '+a+' anos':''}</button>`}),
    ...D.vac.filter(isAll).map(v=>`<button class="w-pill" data-edit-vac="${v.id}">Férias · <b>${esc(v.title)}</b></button>`),
    ...(wxDay(d)?[`<button class="w-pill" data-wxinfo>${wxLine(d,true)}</button>`]:[]),
    ...(holidayOn(d)?[`<span class="w-pill" style="background:color-mix(in srgb,var(--danger) 16%,var(--surface))">Feriado · <b>${esc(holidayOn(d))}</b></span>`]:[]),
    ...breaksOn(d).map(b=>`<button class="w-pill" data-edit-break="${b.id}">Sem aulas · <b>${esc(b.title)}</b></button>`),
    ...D.ev.filter(isAll).map(e=>`<button class="w-pill" data-edit-event="${e.id}"><b>${e.time?esc(e.time):'Dia'}</b> ${esc(e.title)}</button>`)
  ];
  const cols=wallMembers().map(m=>{const its=colItems(m.id,D,d);
    return `<div class="w-col" style="--c:var(--${m.color})"><h3><span class="dot" style="--c:var(--${m.color})"></span>${esc(m.name)}<span class="spacer"></span><span class="small muted">${its.length||''}</span></h3>
      ${its.map(x=>wItem(x,d)).join('')||'<div class="empty">Dia livre</div>'}</div>`}).join('');
  const pend=S.reminders.filter(r=>!r.done&&r.date&&r.date<=d&&wMatch(r)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))).slice(0,8);
  const tasks=S.tasks.filter(t=>!isDone(t)&&taskActive(t,TODAY)&&wMatch(t)).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')).slice(0,8);
  const up=allBdays().map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n).slice(0,3);
  const dots=who=>dotsFor(who).map(c=>`<span class="dot" style="--c:${c}"></span>`).join('');
  const meal=D.meal;
  return `${band.length?`<div class="w-band">${band.join('')}</div>`:''}
    <div class="w-body"><div class="w-cols" style="--n:${wallMembers().length}" data-swipe="wall">${cols}</div>
    <aside class="w-rail">
      ${mealCard(d)}
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
    D.vac.forEach(v=>its.push({k:'',c:dotsFor(v.who)[0],t:'Férias · '+v.title,a:`data-edit-vac="${v.id}"`,ms:whoList(v.who)}));
    const school={};
    D.ev.forEach(e=>{
      if(e.school){const en=schoolEnd(e);whoList(e.who).forEach(m=>{const s=school[m]||(school[m]={k:e.time,end:en});if(e.time<s.k)s.k=e.time;if(en>s.end)s.end=en})}
      else{const w=whoList(e.who);its.push({k:e.time||'',c:dotsFor(e.who)[0],t:e.title,s:w.includes('all')?'Todos':w.map(id=>member(id)&&member(id).name).filter(Boolean).join(', '),a:`data-edit-event="${e.id}"`,ms:w})}
    });
    Object.entries(school).forEach(([m,s])=>its.push({k:s.k,c:colorOf(m),t:'Escola'+(member(m)?' · '+member(m).name:''),s:s.end?'até '+s.end:'',a:`data-wday="${d}"`,ms:[m]}));
    D.g.forEach(g=>its.push({ms:[g.mid],k:g.h&&g.d===d?g.h:'',c:colorOf(g.mid),t:g.t,s:gName(g.mid),a:(g.i?`data-gev="${esc(g.src+'|'+g.i+'|'+g.d)}"`:g.t==='Escola'?`data-wday="${g.d}"`:'')}));
    its.sort((p,q)=>(p.k||'').localeCompare(q.k||''));
    cols+=`<div class="w-day${d===TODAY?' today':''}"><button class="w-dh" data-wday="${d}"><span class="kind">${DOW[i]}</span><b>${x.getDate()}</b>${wxLine(d)}</button>
      ${its.map(z=>{const tag=z.a?'button':'div';const ms=(z.ms||[]).filter(id=>id==='all'||member(id));const av=ms.length?`<span class="w-av">${(ms.includes('all')?['all']:ms.slice(0,3)).map(id=>avatar(id,true)).join('')}</span>`:'';return `<${tag} class="w-wi${av?' has-av':''}" style="--c:${z.c}" ${z.a||''}>${av}${z.k?`<span class="tm">${esc(z.k)}</span>`:''}<span class="tt">${esc(z.t)}</span>${z.s?`<span class="ss">${esc(z.s)}</span>`:''}</${tag}>`}).join('')}
      ${(D.meals||[]).map(m=>{const [k,l,ic]=mealT(m);return `<button class="w-wi meal" data-open-meal="${d}|${k}|${esc(m.id)}" style="--c:var(--line)"><span class="ss">${ic} ${l}</span><span class="tt">${esc(m.title)}</span></button>`}).join('')}</div>`;
  }
  return `<div class="w-week" data-swipe="wall">${cols}</div>${syncLine()}`;
}
function renderWall(){
  S.lastHM=nowHM();const v=S.wallView;document.body.dataset.v=v;
  const body={inicio:wallHome,hoje:()=>wallDay(S.wallDate),semana:wallWeek,mes:wallMonth,linha:wallLine,rotinas:wallRoutines,compras:wallShopping,avisos:wallAlerts,relogio:wallClock,educacao:()=>viewEdu('',true),casa:wallCasa}[v]||(()=>wallDay(S.wallDate));
  const fab=S.readOnly?'':`<button class="w-fab" data-quickadd aria-label="Adicionar">+</button>`;
  const ytFocus=document.activeElement&&['yt-q','r-q','tm-name'].includes(document.activeElement.id)&&document.activeElement.id;
  let html;
  // cada parte é desenhada à parte: se uma falhar, o resto do ecrã continua a funcionar e o erro fica visível
  const safe=(f,name)=>{try{return f()}catch(e){console.error('Ecrã de parede · '+name,e);const msg=(e&&(e.message||e.code))||String(e);
    return `<div class="w-card w-err" style="margin:12px 0;padding:14px 16px"><b>Não foi possível mostrar ${esc(name)}.</b><div class="small muted" style="overflow-wrap:anywhere">${esc(msg)} · ${esc(((e&&e.stack)||'').split('\n').slice(0,2).join(' | ').slice(0,220))}</div><div class="row" style="gap:8px;margin-top:8px"><button class="ghost" data-wv="inicio">Início</button><button class="ghost" data-wexit>Sair do ecrã de parede</button></div></div>`}};
  const navSafe=()=>safe(navBar,'o menu');
  html=(v==='moldura'?safe(wallFrame,'a Moldura'):safe(wallHead,'o topo')+safe(body,'esta vista')+fab)+navSafe();
  document.getElementById('wall').innerHTML=html;
  refocus();dockVideo();initSort();spSync();if(v==='casa')shInitSort();if(ytFocus){const q=document.getElementById(ytFocus);if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length)}}if(v==='moldura'&&S.frameMode==='radio')loadStations(false);
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
  return `<div class="row" style="flex-wrap:wrap;margin-bottom:12px">${S.readOnly?'':'<button class="addbtn" data-new="reminder">+ Novo aviso</button><button class="addbtn" data-new="test">📝 + Teste</button><button class="addbtn urg-btn" data-urgent>⚠ Mensagem urgente</button>'}
      <button class="ghost" data-alarmtest>Testar som</button>${canNotify?'<button class="ghost" data-notif>Ativar notificações</button>':''}
      <span class="small muted">O alarme toca à hora marcada neste aparelho enquanto o Quadro estiver aberto.</span></div>
    <div class="w-grid3">${card('Agora e em atraso',late,'Nada em atraso',' w-late')}${card('Mais logo',today,'Nada mais para hoje')}${card('Próximos 7 dias',next,'Sem avisos marcados')}</div>${wallTests()}`;
}
function wallTests(){const ts=(S.tests||[]).filter(t=>t.date>=TODAY&&wMatch(t)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
  return `<div class="w-card" style="margin-top:14px"><div class="row" style="align-items:center"><h3 style="margin:0;flex:1">📝 Próximos testes</h3>${S.readOnly?'':'<button class="ghost" data-new="test">+ Marcar teste</button>'}</div>
    ${ts.length?ts.map(t=>{const n=daysTo(t.date);return `<button class="w-it" data-edit-test="${t.id}" style="width:100%;text-align:left;border:0;background:transparent"><span class="tm">${n===0?'Hoje':n===1?'Amanhã':n+' dias'}</span><span style="flex:1;min-width:0"><div class="tt">${esc(t.subject)}${t.note?' · '+esc(t.note):''}</div><div class="small muted">${niceDate(t.date)}${t.time?' · '+esc(t.time):''}</div></span>${avatar(whoList(t.who)[0],true)}</button>`}).join(''):'<p class="muted">Sem testes marcados.</p>'}</div>`}
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
    cells+=`<button class="w-mc${c.getMonth()!==mo?' out':''}${d===TODAY?' today':''}" data-wday="${d}" aria-label="${niceDate(d)}"><span class="n">${c.getDate()}</span>${(()=>{const w=wxDay(d);return w?`<span class="w-mwx">${wxIc(w.c)} ${w.mx}°</span>`:''})()}${ch.slice(0,3).map(z=>`<span class="w-chip" style="--c:${z.c}">${esc(z.t)}</span>`).join('')}${ch.length>3?`<span class="w-more">+${ch.length-3}</span>`:''}</button>`;
  }
  const tl=dayChips(TODAY,wallData(TODAY));
  return `<div class="w-mwrap"><div data-swipe="wall"><div class="w-mg">${DOW.map(d=>`<div class="w-mdow">${d}</div>`).join('')}</div>
      <div class="w-mg" style="grid-auto-rows:minmax(104px,auto)">${cells}</div></div>
    <aside class="w-rail"><div class="w-card"><h4>Hoje · ${niceDate(TODAY)}</h4>${tl.map(z=>`<div class="w-it" style="min-height:48px"><span class="dot" style="--c:${z.c};margin-top:8px"></span><span class="tt" style="flex:1;min-width:0">${esc(z.t)}</span></div>`).join('')||'<div class="empty">Nada marcado</div>'}</div>${railMeal(TODAY)}</aside></div>${syncLine()}`;
}
function wallLine(){
  const d=S.wallDate,D=wallData(d,true),H0=7,H1=23;
  const pos=hm=>{const[h,m]=hm.split(':').map(Number);return Math.max(0,Math.min(100,((h+m/60)-H0)/(H1-H0)*100))};
  const now=d===TODAY?nowHM():null;
  const blk=(a,b,t,c,act)=>{const l=pos(a),w=Math.max(pos(b)-l,2.5),past=now&&b<=now,tag=act?'button':'div';
    return `<${tag} class="w-blk${past?' past':''}" style="left:${l.toFixed(2)}%;width:calc(${w.toFixed(2)}% - 3px);--c:${c}" ${act||''}><b>${esc(t)}</b><span>${a}–${b}</span></${tag}>`};
  const lanes=[{id:'all',name:'Família',c:'var(--accent)'},...wallMembers().map(m=>({id:m.id,name:m.name,c:`var(--${m.color})`}))].map(L=>{
    const isF=L.id==='all',bl=[],allDay=[];
    D.ev.filter(e=>isF?isAll(e):forM(e,L.id)).forEach(e=>{if(e.time)bl.push(blk(e.time,schoolEnd(e)||addMin(e.time,60),e.title,L.c,`data-edit-event="${e.id}"`));else allDay.push(e.title)});
    D.g.filter(g=>isF?g.mid==='all':g.mid===L.id).forEach(g=>{if(g.h&&g.d===d&&g.d===g.e)bl.push(blk(g.h,g.he&&g.he>g.h?g.he:addMin(g.h,60),g.t,L.c,g.i?`data-gev="${esc(g.src+'|'+g.i+'|'+g.d)}"`:''));else allDay.push(g.t)});
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
  const meal=mealNext(TODAY),pend=S.reminders.filter(r=>!r.done&&r.date&&r.date<=TODAY&&wMatch(r)).length;
  const up=allBdays().map(b=>({...b,...daysUntil(b.md)})).sort((a,b)=>a.n-b.n)[0];
  const today=frameList(wallData(TODAY),TODAY),tomorrow=frameList(wallData(td),td).slice(0,5);
  const fm=S.frameMode||'galeria';
  const tabs=`<div class="fm-tabs" role="group" aria-label="Moldura">${[['galeria','Galeria'],['video','Vídeo'],['radio','Rádio'],['tv','NOS TV ↗']].map(([k,l])=>`<button data-fmode="${k}" aria-pressed="${fm===k}">${l}</button>`).join('')}</div>`;
  if(fm!=='galeria')return `<div class="w-frame"><div class="w-photo fm-${fm}">${tabs}${fm==='video'?frameVideo():fm==='tv'?frameTV():frameRadio()}</div>${frameSide(today,tomorrow,row,up,pend)}</div>`;
  return `<div class="w-frame"><div class="w-photo${p?' has':''}"${p?` style="background-image:url('${photoUrl(p)}')"`:''}>
      ${tabs}${p?'':'<button class="w-btn" data-wset style="position:absolute;top:24px;right:24px">Adicionar fotografias</button>'}${fw('wx')?dragBox('wx',frameWx(true)):''}${fw('radio')?dragBox('radio',galleryRadio()):''}${fw('votd')?dragBox('votd',votdWidget()):''}${fw('spotify')?dragBox('sp',spotifyWidget()):''}${fw('spotify')?dragBox('sp',spotifyWidget()):''}
      <div class="ov"${fw('clock')?'':' hidden'}><div class="big" id="wClock">${now}</div><div style="font-family:var(--display);font-weight:600;font-size:1.6rem">${niceDate(TODAY)}</div>
      ${meal?`<div class="w-chipb">${mealT(meal)[1]}: ${esc(meal.title)}</div>`:''}</div>
      </div>
    ${frameSide(today,tomorrow,row,up,pend)}</div>`;
}
function frameSide(today,tomorrow,row,up,pend){
  return `<div class="w-side">${S.frameMode&&S.frameMode!=='galeria'?(fw('wx')?frameWx(false):'')+(fw('votd')?votdWidget():''):''}<h4 class="w-sh">Hoje</h4>${today.map(x=>row(x,true)).join('')||'<div class="muted">Nada marcado</div>'}
      <h4 class="w-sh" style="color:var(--muted)">Amanhã</h4>${tomorrow.map(x=>row(x,false)).join('')||'<div class="muted">Nada marcado</div>'}
      <div class="row" style="gap:10px;margin-top:auto;align-items:stretch;padding-top:12px">
        ${up?`<div class="w-mini"><small>Aniversário</small><b>${esc(up.name)}</b><span class="small muted">${up.n===0?'Hoje!':up.n===1?'Amanhã':'daqui a '+up.n+' dias'}</span></div>`:''}
        <div class="w-mini"><small>Lembretes</small><b>${pend} por fazer</b></div>
        ${S.readOnly?'':'<button class="w-btn" data-quickadd aria-label="Adicionar" style="font-size:1.8rem;background:var(--accent);color:var(--accent-ink);border:0">+</button>'}
      </div>
      <div class="row" style="gap:8px;justify-content:flex-end"><button class="edit" data-wgoogle>Google</button><button class="edit" data-wset>Configuração</button><button class="edit" data-wfs>Ecrã inteiro</button><button class="edit" data-wexit>Sair</button></div>
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
  const f=sheet('Ecrã de parede e moldura',`
    <label class="field"><span>Após 2 minutos sem toques, mostrar</span><select id="w-rest" name="rest"><option value="">A vista atual (só volta a hoje)</option>${LAYOUTS.map(([k,l])=>`<option value="${k}" ${rest===k?'selected':''}>${l}</option>`).join('')}</select></label>
    <div class="field"><span>Fotografias da moldura (${S.photos.length})</span>
      ${S.photos.length?`<div class="ph-grid">${S.photos.map(p=>`<figure style="background-image:url('${photoUrl(p)}')"><button type="button" class="ph-del" data-delphoto="${p.id}" aria-label="Apagar fotografia">×</button></figure>`).join('')}</div>`:''}
      ${S.assets&&!S.readOnly?'<label class="uplabel">+ Adicionar fotografias<input id="w-ph" type="file" accept="image/*" multiple hidden></label>':`<p class="muted small" style="margin:0">${S.live?'Só quem pode editar o Quadro consegue adicionar fotografias.':'Configura o Firebase para adicionar fotografias.'}</p>`}
    </div>
    <div class="field"><span>Widgets da galeria (tempo e rádio)</span><button type="button" class="ghost" data-wposreset>Repor no sítio original</button></div>
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
    <button type="button" data-open-meal="${S.sel}">Refeição<small>${S.sel===TODAY?'de hoje':niceDate(S.sel)}</small></button>
    <button type="button" data-new="vacation">Férias<small>período</small></button>
    <button type="button" data-new="birthday">Aniversário<small>todos os anos</small></button>
    <button type="button" data-new="test">Teste<small>estudantes</small></button>
    <button type="button" data-urgent class="qa-urg">⚠ Urgente<small>email à família</small></button>
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
  if(S.dragAt&&Date.now()-S.dragAt<350&&e.target.closest('[data-sortable]'))return;
  const t=e.target.closest('button,[data-scrim]');if(!t)return;
  const d=t.dataset;
  if(t.matches('[data-scrim]')){if(e.target===t)closeSheet();return}
  if(d.cancel!==undefined){closeSheet();return}
  if(t.id==='btnWall'){enterWall();return}
  if(t.id==='btnGoogle'){googleSheet();return}
  if(d.wv){closeSheet();S.wallView=d.wv;lsSet('fam.wallView',d.wv);S.rotPart=null;renderWall();window.scrollTo(0,0);return}
  if(d.wshift){wallStep(+d.wshift);return}
  if(d.rpart){S.rotPart=d.rpart;renderWall();return}
  if(d.wset!==undefined){configHub();return}
  if(d.urgent!==undefined){urgentSheet();return}
  if(d.wposreset!==undefined){lsSet('fam.wpos','{}');toast('Widgets repostos');if(S.wall)renderWall();return}
  if(d.wxinfo!==undefined){wxSheet();return}
  if(d.gev){gEventSheet(d.gev);return}
  if(d.gedit){gEditForm(d.gedit);return}
  if(d.migrate!==undefined){migrateSheet();return}
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
  if(d.framefree!==undefined){return}
  if(d.ck!==undefined||d.ckTab||d.ckNew!==undefined||d.ckEdit||d.ckToggle||d.tmAdd||d.tmGo||d.tmPause||d.tmReset||d.tmDel||d.swGo!==undefined||d.swLap!==undefined||d.swReset!==undefined||d.ringStop!==undefined||d.ringSnooze!==undefined||d.tmStep||d.tmNew!==undefined||d.tmBell||d.tmRen){clockClick(t,d);return}
  if(d.rfold!==undefined){lsSet('fam.sugMin',lsGet('fam.sugMin')==='1'?'0':'1');renderWall();return}
  if(d.radd!==undefined){radioAddSheet();return}
  if(d.raddst){const st=(stations||[]).find(s=>s.u===d.raddst);saveMedia({radios:[...S.media.radios.filter(r=>r.u!==d.raddst),{n:d.rname||'Rádio',u:d.raddst,...(d.ralt?{a:d.ralt}:{}),...(st&&st.i?{i:st.i}:{})}],hidden:(S.media.hidden||[]).filter(x=>x!==d.raddst)});closeSheet();toast((d.rname||'Rádio')+' adicionada');return}
  if(d.rdel){if(S.radioNow&&S.radioNow.k===d.rdel)stopMedia('radio',true);saveMedia({radios:S.media.radios.filter(r=>r.u!==d.rdel)});toast('Rádio eliminada das tuas');return}
  if(d.rhide){if(S.radioNow&&S.radioNow.k===d.rhide)stopMedia('radio',true);saveMedia({hidden:[...new Set([...(S.media.hidden||[]),d.rhide])]});toast('Sugestão escondida');return}
  if(d.runhide!==undefined){saveMedia({hidden:[]});return}
  if(d.siteopen!==undefined){const v=document.querySelector('#mediaLayer .ml-video');if(!v)return;if(v.dataset.kind==='tv')openNosApp();else window.open(v.dataset.u,'_blank','noopener');return}
  if(d.site){stopMedia('radio',true);window.open(d.site,'_blank','noopener');return}
  if(d.sitedel){saveMedia({sites:(S.media.sites||[]).filter(s=>s.u!==d.sitedel)});return}
  if(d.siteadd!==undefined){const box=t.closest('.fm-add'),n=box.querySelector('#s-n').value.trim(),u0=box.querySelector('#s-u').value.trim();
    const u=/^https?:\/\//.test(u0)?u0:(u0?'https://'+u0:'');if(!/^https:\/\/[^\s]+\.[^\s]+/.test(u)){toast('Escreve o endereço do site (https://…)');return}
    let nm=n;if(!nm){try{nm=new URL(u).pathname.split('/').filter(Boolean).pop()||new URL(u).hostname}catch(e){nm='Rádio'}nm=nm.replace(/-/g,' ').replace(/^./,x=>x.toUpperCase())}
    saveMedia({sites:[...(S.media.sites||[]).filter(s=>s.u!==u),{n:nm,u}]});toast('Site adicionado');return}
  if(d.tvurl!==undefined){const u=prompt('Endereço da NOS TV',lsGet('fam.tvUrl')||NOS_URL);if(u&&/^https:\/\//.test(u.trim())){lsSet('fam.tvUrl',u.trim());playTV();renderWall()}return}
  if(d.fmode==='tv'){openNosApp();return}
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
  if(d.editBday){if(d.editBday.startsWith('g:')){gBdaySheet(d.editBday);return}birthdayForm(S.birthdays.find(x=>x.id===d.editBday));return}
  if(d.editVac){vacationForm(S.vacations.find(x=>x.id===d.editVac));return}
  if(d.editBreak){breakForm(S.schoolBreaks.find(x=>x.id===d.editBreak));return}
  if(d.schoolpreset!==undefined){if(S.readOnly)return;const who=schoolMembers().length?schoolMembers():['all'];
    SCHOOL_PRESET_2627.filter(p=>!S.schoolBreaks.some(b=>b.start===p.start)).forEach(p=>save('schoolBreaks',null,{...p,who}));
    toast('Férias escolares 2026/27 adicionadas');return}
  if(d.tlist){S.taskList=d.tlist;render();return}
  if(t.id==='btnFamily'){configHub();return}
  if(S.readOnly&&(d.new||d.toggleRem||d.toggleTask||d.clear)){toast('Estás em modo de leitura.');return}
  if(d.new&&gOnly()&&['event','birthday','vacation'].includes(d.new)){closeSheet();gEventForm({kind:{event:'evento',birthday:'aniv',vacation:'ferias'}[d.new]});return}
  if(d.new){({event:eventForm,reminder:reminderForm,task:taskForm,recipe:recipeForm,birthday:birthdayForm,vacation:vacationForm,break:breakForm,test:testForm})[d.new]();return}
  if(d.editEvent){if(d.editEvent.startsWith('test:')){testForm(S.tests.find(x=>x.id===d.editEvent.slice(5)));return}if(d.editEvent.startsWith('edu:')){const x=S.edu.find(y=>y.id===d.editEvent.slice(4));if(x)eduForm(x.type,x);return}eventForm(S.events.find(x=>x.id===d.editEvent));return}
  if(d.editTest){testForm(S.tests.find(x=>x.id===d.editTest));return}
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
  if(d.shopcat!==undefined){S.shopCat=d.shopcat;S.shopHistAll=false;if(S.wall)renderWall();else render();return}
  if(d.shophall!==undefined){S.shopHistAll=true;if(S.wall)renderWall();else render();return}
  if(d.shopsug){if(S.readOnly)return;const h=S.shopHistory.find(x=>x.id===d.shopsug);if(h){addShopItem(h.name);toast(h.name+' adicionado a '+curShop())}return}
  if(d.shopmenu!==undefined){shopMenu(curShop());return}
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
  if(S.wall&&nowHM()!==S.lastHM&&!S.dragging){if(!overlay.innerHTML)renderWall();else{S.lastHM=nowHM();const c=document.getElementById('wClock');if(c)c.textContent=S.lastHM}}
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
    else if(/(^|\.)youtube(-nocookie)?\.com$/.test(h)){const ch=/^\/channel\/UC([\w-]{20,})/.exec(x.pathname);if(ch)return {id:null,list:'UU'+ch[1]};id=x.searchParams.get('v');const m=/^\/(embed|shorts|live|v)\/([\w-]{6,})/.exec(x.pathname);if(m&&m[2]!=='videoseries')id=m[2]}
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

function refreshFrame(){if(S.dragging)return;if(S.wall&&S.wallView==='moldura'&&!overlay.innerHTML)renderWall()}
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
  const now=S.radioNow,favU=new Set(S.media.radios.map(r=>r.u)),hid=new Set(S.media.hidden||[]),bad=brokenSet();
  const sites=S.media.sites||[];
  const x=(attr,v,lbl)=>`<button class="fm-x" ${attr}="${esc(v)}" aria-label="${lbl}">×</button>`;
  const tile=(r,fav)=>`<div class="fm-tw${fav?'':' fm-sug'}" data-key="${esc(r.u)}"><button class="fm-tile${now&&now.k===r.u?' on':''}" data-radio="${esc(r.u)}" data-ralt="${esc(r.a||'')}" data-rname="${esc(r.n)}">${r.i?`<img src="${esc(r.i)}" alt="" loading="lazy" onerror="this.remove()">`:'<span class="fm-ti">📻︎</span>'}<b>${esc(r.n)}</b></button>${x(fav?'data-rdel':'data-rhide',r.u,(fav?'Eliminar ':'Esconder ')+r.n)}${fav?'':`<button class="fm-plus" data-raddst="${esc(r.u)}" data-ralt="${esc(r.a||'')}" data-rname="${esc(r.n)}" aria-label="Adicionar ${esc(r.n)} às minhas rádios">＋ Minhas</button>`}</div>`;
  const stile=s=>`<div class="fm-tw" data-key="${esc(s.u)}"><button class="fm-tile" data-site="${esc(s.u)}" data-sname="${esc(s.n)}"><span class="fm-ti">🌐︎</span><b>${esc(s.n)}</b></button>${x('data-sitedel',s.u,'Eliminar '+s.n)}</div>`;
  const ord=S.media.order||[],pos=u=>{const i=ord.indexOf(u);return i<0?1e6:i},byOrd=a=>a.map((x,i)=>[x,i]).sort((p,q)=>pos(p[0].u)-pos(q[0].u)||p[1]-q[1]).map(x=>x[0]);
  const sugMin=lsGet('fam.sugMin')==='1';
  const rq=(S.radioQ||'').trim().toLowerCase(),norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const more=rq?(stations||[]).filter(s=>!favU.has(s.u)&&norm(s.n).includes(norm(rq))).slice(0,30):(stations||[]).filter(s=>!favU.has(s.u)&&!bad.has(s.u)&&!hid.has(s.u)).slice(0,12);
  const ours=myRadios();
  const add='<button class="fm-tile fm-addt" data-radd><span class="fm-ti">＋</span><b>Adicionar rádio</b></button>';
  return `<div class="fm-panel">${now?`<div class="fm-now"><span class="ml-eq big" aria-hidden="true"><i></i><i></i><i></i></span><span><small>A ouvir</small><b>${esc(now.n)}</b></span><button class="ghost" data-mstop="radio" style="margin-left:auto">Parar</button></div>`:''}
    <h4 class="fm-h">As minhas rádios</h4>
    <div class="fm-tiles" data-sortable="ours">${ours.map(r=>tile(r,true)).join('')}${add}</div>
    ${ours.length>1?'<p class="muted small" style="margin:0">Para mudar a ordem, carrega numa rádio sem largar e arrasta-a.</p>':ours.length?'':'<p class="muted small" style="margin:0">Ainda não há rádios tuas. Usa <b>＋ Minhas</b> numa sugestão ou <b>Adicionar rádio</b>.</p>'}
    <div class="row fm-sh" style="gap:10px;align-items:center;margin-top:6px"><button class="fm-fold" data-rfold aria-expanded="${!sugMin}"><span aria-hidden="true">${sugMin?'▸':'▾'}</span> Sugestões</button>${sugMin?'<span style="flex:1"></span>':`<input id="r-q" type="search" placeholder="Procurar rádio por nome" value="${esc(S.radioQ||'')}" enterkeyhint="search" style="max-width:280px;flex:1;margin-left:auto">`}<button class="ghost" data-rfold>${sugMin?'Mostrar':'Minimizar'}</button></div>
    ${sugMin?'':more.length?`<div class="fm-tiles">${more.map(r=>tile(r,false)).join('')}</div>`:stations===null?'<p class="muted">A carregar sugestões…</p>':rq?`<p class="muted">Nenhuma rádio com “${esc(S.radioQ)}”.</p>`:''}
    ${hid.size?`<p class="muted small" style="margin:0">${hid.size} ${hid.size===1?'sugestão escondida':'sugestões escondidas'} · <button class="edit" data-runhide>Mostrar de novo</button></p>`:''}</div>`}
function radioAddSheet(){
  const favU=new Set(S.media.radios.map(r=>r.u));
  const f=sheet('Adicionar rádio',`
        <div class="field"><span>Escolhe uma rádio portuguesa</span><input id="ra-q" type="search" placeholder="Procurar (ex.: Antena, RFM, Renascença)">
      <div class="m-list m-scroll" id="ra-list"></div></div>
    <details class="m-more"><summary>Outra rádio (endereço direto do stream)</summary>
      <label class="field"><span>Nome</span><input id="ra-n" placeholder="Ex.: Rádio Comercial"></label>
      <label class="field"><span>Endereço do stream</span><input id="ra-u" placeholder="https://…mp3 / .aac / .m3u8" inputmode="url"></label></details>`,{onSave:f=>{
    const n=val(f,'ra-n')||f.querySelector('#ra-n').value.trim(),u0=f.querySelector('#ra-u').value.trim();
    const u=/^https?:\/\//.test(u0)?u0:(u0?'https://'+u0:'');
    if(!/^https:\/\/\S+\.\S+/.test(u)){toast('Escolhe uma rádio da lista ou escreve o endereço do stream (https://…)');return false}
    let nm=n;if(!nm){try{nm=new URL(u).pathname.split('/').filter(Boolean).pop()||new URL(u).hostname}catch(e){nm='Rádio'}nm=nm.replace(/[-_]/g,' ').replace(/\.\w+$/,'').replace(/^./,x=>x.toUpperCase())}
    saveMedia({radios:[...S.media.radios.filter(r=>r.u!==u),{n:nm,u}]});
    toast(nm+' adicionada');},saveLabel:'Adicionar'});
  const box=f.querySelector('#ra-list'),q=f.querySelector('#ra-q');
  const draw=()=>{const t=q.value.trim().toLowerCase();const l=(stations||[]).filter(s=>!favU.has(s.u)&&(!t||s.n.toLowerCase().includes(t))).slice(0,40);
    box.innerHTML=stations===null?'<p class="muted small">A carregar…</p>':l.map(s=>`<div class="m-st"><button type="button" class="m-play" data-raddst="${esc(s.u)}" data-ralt="${esc(s.a||'')}" data-rname="${esc(s.n)}">${s.i?`<img src="${esc(s.i)}" alt="" loading="lazy" onerror="this.remove()">`:'<span class="m-ri">📻︎</span>'}<span>${esc(s.n)}</span></button><span class="m-fav" aria-hidden="true">＋</span></div>`).join('')||'<p class="muted small">Nenhuma rádio encontrada.</p>'};
  q.addEventListener('input',draw);draw();if(stations===null)loadStations(false).then(draw);
}
function tvUrl(){return lsGet('fam.tvUrl')||NOS_URL}
function playTV(){playSite(tvUrl(),'NOS TV','tv')}
function playSite(u,title,kind){const L=mediaLayer();L.classList.remove('mini');
  let v=L.querySelector('.ml-video');if(!v){v=document.createElement('div');v.className='ml-video';L.appendChild(v)}
  v.dataset.kind=kind;v.dataset.u=u;
  v.innerHTML=`<div class="ml-bar"><b>${esc(title)}</b><span class="spacer"></span>${kind==='site'?'<button class="fd-btn" data-mstop="video">Rádios</button>':''}<button class="fd-btn" data-siteopen>Abrir fora</button><button class="fd-btn" data-mfull>Ecrã inteiro</button><button class="fd-btn" data-mmin>Minimizar</button><button class="fd-btn" data-mstop="video">Fechar</button></div>
    <iframe src="${esc(u)}" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowfullscreen ${lsGet('fam.frameFree')==='1'?'':'sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-modals allow-storage-access-by-user-activation"'}></iframe>`;
  stopMedia('radio',true)}
function openNosApp(){const u=tvUrl();
  if(/Android/i.test(navigator.userAgent)){location.href='intent://'+u.replace(/^https:\/\//,'')+'#Intent;scheme=https;package=pt.nos.iris.online;S.browser_fallback_url='+encodeURIComponent(u)+';end';return}
  window.open(u,'_blank','noopener')}
function frameTV(){const on=!!document.querySelector('#mediaLayer .ml-video[data-kind="tv"]');
  if(on)return '<div class="fm-slot"></div>';
  return `<div class="fm-panel"><h3>NOS TV</h3>
    <p class="muted" style="margin:0">Abre o site da NOS TV aqui na moldura. Entra com a tua conta NOS na primeira vez.</p>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="addbtn" data-tvstart>Ver NOS TV aqui</button><button class="ghost" data-tvopen>Abrir na app / noutra janela</button><button class="ghost" data-tvurl>Mudar endereço</button></div>
    <label class="row" style="gap:10px;align-items:center;margin:0"><input type="checkbox" data-framefree ${lsGet('fam.frameFree')==='1'?'checked':''} style="width:22px;height:22px;min-height:0"><span>Deixar o site abrir outras janelas <span class="muted small">(só se a entrada na conta não funcionar)</span></span></label>
    <p class="muted small" style="margin:0">Se a moldura ficar em branco ou com erro, é a NOS a bloquear o site dentro de outras páginas. Nesse caso usa <b>Abrir na app</b>: no tablet Android abre a app NOS TV; fechas a app e voltas ao Quadro.</p></div>`}

function photoSec(){const s=+lsGet('fam.photoSec');return s>=3?s:30}
function photoSlot(){return Math.floor(Date.now()/(photoSec()*1000))}
setInterval(()=>{if(S.wall&&!S.dragging&&!overlay.innerHTML&&S.wallView==='moldura'&&(S.frameMode||'galeria')==='galeria'&&S.photos.length>1&&photoSlot()!==S.lastSlot)renderWall()},1000);

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
document.addEventListener('input',e=>{if(e.target.id==='yt-q')S.ytQ=e.target.value;if(e.target.id==='r-q'){S.radioQ=e.target.value;clearTimeout(S.rqT);S.rqT=setTimeout(()=>{if(S.wall&&S.wallView==='moldura')renderWall()},200)}});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-ytsearch]');if(!f)return;e.preventDefault();const q=f.querySelector('#yt-q').value.trim();if(!q)return;S.ytQ=q;S.ytRes=null;ytLoad(q);refreshFrame()});

document.addEventListener('change',e=>{if(e.target.matches('[data-framefree]'))lsSet('fam.frameFree',e.target.checked?'1':'0')});

var sortLib=null;
function loadSortable(){if(window.Sortable)return Promise.resolve(window.Sortable);if(sortLib)return sortLib;
  sortLib=new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js';s.onload=()=>ok(window.Sortable);s.onerror=e=>{sortLib=null;ko(e)};document.head.appendChild(s)});return sortLib}
function initSort(){const els=[...document.querySelectorAll('[data-sortable]')];if(!els.length)return;
  loadSortable().then(Sortable=>els.forEach(el=>{if(!el.isConnected||el._sort)return;
    el._sort=Sortable.create(el,{animation:180,delay:250,delayOnTouchOnly:false,touchStartThreshold:6,draggable:'.fm-tw',filter:'.fm-x,.fm-addt',preventOnFilter:false,ghostClass:'fm-ghost',chosenClass:'fm-chosen',
      onStart:()=>{S.dragging=true},
      onEnd:()=>{S.dragging=false;S.dragAt=Date.now();
        const keys=[...document.querySelectorAll('[data-sortable] .fm-tw[data-key]')].map(x=>x.dataset.key);
        const rest=(S.media.order||[]).filter(k=>!keys.includes(k));saveMedia({order:[...keys,...rest].slice(0,300)})}})})).catch(()=>{})}

/* ---------- Alarmes, temporizadores e cronómetro ---------- */
const WD=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
function clockCfg(){return S.clock||{alarms:[]}}
function saveClock(alarms){S.clock={alarms};if(S.db)S.db.doc('config/clock').set({alarms}).catch(handleWriteError);if(S.wall&&S.wallView==='relogio'&&!overlay.innerHTML)renderWall()}
function fmtDur(ms,cs){ms=Math.max(0,ms);const t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;
  const base=(h?h+':'+pad(m):pad(m))+':'+pad(s);return cs?base+'<small>,'+pad(Math.floor(ms%1000/10))+'</small>':base}
function timers(){return lsJSON('fam.timers',[])}
function saveTimers(a){lsSet('fam.timers',JSON.stringify(a))}
function tmLeft(t){return t.endAt?t.endAt-Date.now():t.remain}
function swState(){return lsJSON('fam.sw',{acc:0,start:0,laps:[]})}
function swMs(s){return s.acc+(s.start?Date.now()-s.start:0)}
function nextRing(a){if(!a.on)return null;const n=new Date();for(let i=0;i<8;i++){const d=new Date(n);d.setDate(n.getDate()+i);const[h,m]=a.h.split(':').map(Number);d.setHours(h,m,0,0);
  if(d<=n)continue;if(a.days&&a.days.length&&!a.days.includes(dowMon(d)))continue;return d}return null}
function untilTxt(d){if(!d)return '';const m=Math.round((d-Date.now())/60000),h=Math.floor(m/60);return 'Toca daqui a '+(h?h+' h ':'')+(m%60)+' min'}
function clockChip(){const run=timers().filter(t=>t.endAt);const s=swState();
  if(!run.length&&!s.start)return '';
  const t=run.sort((a,b)=>a.endAt-b.endAt)[0];
  return `<button class="fd-btn fd-tchip" data-wv="relogio">${t?'⏳ <span data-tick="tm" data-id="'+t.id+'">'+fmtDur(tmLeft(t))+'</span>':'⏱ <span data-tick="sw">'+fmtDur(swMs(s))+'</span>'}</button>`}
function wallClock(){
  const tab=S.ckTab||'alarmes';
  const seg=`<div class="seg ck-seg" role="group" aria-label="Relógio">${[['alarmes','Alarmes'],['temporizador','Temporizador'],['cronometro','Cronómetro']].map(([k,l])=>`<button data-ck-tab="${k}" aria-pressed="${tab===k}">${l}</button>`).join('')}</div>`;
  let body='';
  if(tab==='alarmes'){
    const al=[...clockCfg().alarms].sort((a,b)=>a.h.localeCompare(b.h));
    body=`<div class="ck-grid">${al.map(a=>{const nx=nextRing(a);return `<div class="ck-card${a.on?'':' off'}">
      <button class="ck-main" data-ck-edit="${a.id}"><span class="ck-time">${esc(a.h)}</span><span class="ck-lbl">${esc(a.label||'Alarme')}</span>
        <span class="ck-days">${a.days&&a.days.length?(a.days.length===7?'Todos os dias':a.days.length===5&&[0,1,2,3,4].every(x=>a.days.includes(x))?'Dias úteis':a.days.map(x=>WD[x]).join(' · ')):'Uma vez'}${a.on&&nx?' · '+untilTxt(nx):''}</span></button>
      <button class="ck-sw" role="switch" aria-checked="${!!a.on}" data-ck-toggle="${a.id}" aria-label="Ligar ou desligar"><i></i></button></div>`}).join('')}
      <button class="ck-card ck-add" data-ck-new><span class="ck-plus">＋</span><b>Novo alarme</b></button></div>
      <p class="muted small" style="margin:8px 0 0">Os alarmes tocam no ecrã de parede. O som funciona depois de alguém tocar uma vez no ecrã.</p>`}
  else if(tab==='temporizador'){
    const ts=timers();
    body=`<div class="ck-tmopts row" style="gap:10px;flex-wrap:wrap;align-items:center"><input id="tm-name" placeholder="Título (ex.: Massa, TPC, Forno)" value="${esc(S.tmName||'')}" style="flex:1;min-width:220px;max-width:420px">
        <label class="prof-chk"><input type="checkbox" id="tm-alarm" ${S.tmAlarm===false?'':'checked'}> Tocar alarme no fim</label></div>
      <div class="ck-presets">${[1,3,5,10,15,20,30,45,60].map(m=>`<button class="fd-btn" data-tm-add="${m*60}">${m<60?m+' min':'1 h'}</button>`).join('')}<button class="fd-btn" data-tm-new>Outro…</button></div>
      <div class="ck-grid">${ts.map(t=>{const left=tmLeft(t),pct=t.total?Math.max(0,Math.min(1,left/t.total)):0;
        return `<div class="ck-card ck-tm${left<=0?' done':''}"><div class="ck-ring" style="--p:${(pct*360).toFixed(1)}deg"><span data-tick="tm" data-id="${t.id}">${fmtDur(left)}</span></div>
          <div class="ck-tmr"><button class="ck-tmt" data-tm-ren="${t.id}"><b>${esc(t.label||'Temporizador')}</b> <span aria-hidden="true">✎</span></button><span class="muted small">${fmtDur(t.total)} · <button class="edit" data-tm-bell="${t.id}" aria-pressed="${t.alarm!==false}">${t.alarm!==false?'🔔 Com alarme':'🔕 Sem alarme'}</button></span>
          <div class="row" style="gap:6px;flex-wrap:wrap">${t.endAt?`<button class="fd-btn" data-tm-pause="${t.id}">Pausa</button>`:left>0?`<button class="addbtn" data-tm-go="${t.id}">${left<t.total?'Continuar':'Começar'}</button>`:''}
            <button class="fd-btn" data-tm-step="${t.id}|60">+1 min</button><button class="fd-btn" data-tm-reset="${t.id}">Repor</button><button class="fd-btn" data-tm-del="${t.id}" aria-label="Apagar">✕</button></div></div></div>`}).join('')||'<p class="muted">Escolhe um tempo acima para começar uma contagem decrescente.</p>'}</div>`}
  else{
    const s=swState();
    body=`<div class="ck-sw-big"><div class="ck-swt" data-tick="sw" data-cs="1">${fmtDur(swMs(s),true)}</div>
      <div class="row" style="gap:10px;justify-content:center;flex-wrap:wrap">${s.start?`<button class="fd-btn ck-xl" data-sw-go>Pausa</button><button class="fd-btn ck-xl" data-sw-lap>Volta</button>`:`<button class="addbtn ck-xl" data-sw-go>${swMs(s)?'Continuar':'Começar'}</button>${swMs(s)?'<button class="fd-btn ck-xl" data-sw-reset>Repor</button>':''}`}</div>
      ${s.laps.length?`<ol class="ck-laps" reversed>${[...s.laps].reverse().map((l,i)=>`<li><span>Volta ${s.laps.length-i}</span><b>${fmtDur(l,true)}</b></li>`).join('')}</ol>`:''}</div>`}
  return `<section class="ck">${seg}${body}</section>`;
}
function alarmSheet(a){
  const isNew=!a;a=a||{id:uid(),h:'07:30',label:'',days:[0,1,2,3,4],on:true,sound:'despertador',snooze:10};
  const snd=[['despertador','Despertador'],['bip','Bip'],['suave','Suave']],rad=S.media.radios.map(r=>['radio:'+r.u,r.n]),yts=S.media.videos.map(v=>['yt:'+v.u,v.t]);
  const cur=a.sound||'despertador',curYt=cur.startsWith('yt:')&&!yts.some(x=>x[0]===cur)?cur.slice(3):'';
  const opt=([k,l])=>`<option value="${esc(k)}" ${cur===k?'selected':''}>${esc(l)}</option>`;
  const f=sheet(isNew?'Novo alarme':'Alarme',`
    <label class="field"><span>Hora</span><input type="time" name="h" value="${esc(a.h)}" required style="font-size:2rem;font-weight:700"></label>
    <label class="field"><span>Nome</span><input name="label" value="${esc(a.label||'')}" placeholder="Ex.: Acordar, Escola, Medicamento"></label>
    <div class="field"><span>Repetir</span><div class="who" style="flex-wrap:wrap" data-ckdays>${WD.map((w,i)=>`<button type="button" class="chip" data-day="${i}" aria-pressed="${(a.days||[]).includes(i)}">${w}</button>`).join('')}</div>
      <div class="row" style="gap:8px;margin-top:6px"><button type="button" class="edit" data-dayset="0,1,2,3,4">Dias úteis</button><button type="button" class="edit" data-dayset="5,6">Fim de semana</button><button type="button" class="edit" data-dayset="0,1,2,3,4,5,6">Todos</button><button type="button" class="edit" data-dayset="">Só uma vez</button></div></div>
    <div class="two"><label class="field"><span>Ao tocar</span><select name="sound" data-sndsel><optgroup label="Som">${snd.map(opt).join('')}</optgroup>${rad.length?`<optgroup label="Iniciar uma rádio">${rad.map(opt).join('')}</optgroup>`:''}<optgroup label="Abrir YouTube">${yts.map(opt).join('')}<option value="yt:" ${curYt?'selected':''}>Outro vídeo, playlist ou canal…</option></optgroup></select></label>
    <label class="field"><span>Adiar (minutos)</span><input type="number" name="snooze" min="1" max="60" value="${esc(a.snooze||10)}"></label></div>
    <label class="field" data-ytbox ${cur==='yt:'||curYt?'':'hidden'}><span>Link do YouTube</span><input name="yturl" value="${esc(curYt)}" placeholder="Vídeo, playlist ou canal (youtube.com/@nome)" inputmode="url"></label>
    <button type="button" class="ghost" data-sndtest>▶ Experimentar</button>`,
  {onSave:f=>{const h=val(f,'h');if(!/^\d\d:\d\d$/.test(h)){toast('Escolhe a hora');return false}
    let sound=val(f,'sound')||'despertador';
    if(sound==='yt:'){const u=val(f,'yturl');if(!u){toast('Cola o link do YouTube');return false}
      if(!ytParse(u)){ytResolve(u).then(r=>{if(!r){toast('Não reconheci esse link do YouTube');return}finishAlarm(f,a,h,'yt:'+r)});return}
      sound='yt:'+u}
    finishAlarm(f,a,h,sound)},
   onDelete:isNew?null:()=>saveClock(clockCfg().alarms.filter(x=>x.id!==a.id)),saveLabel:'Guardar'});
  f.querySelector('[data-sndsel]').addEventListener('change',e=>{f.querySelector('[data-ytbox]').hidden=e.target.value!=='yt:'});
  f.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.day!==undefined){b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));return}
    if(b.dataset.dayset!==undefined){const s=b.dataset.dayset.split(',').filter(Boolean).map(Number);f.querySelectorAll('[data-day]').forEach(x=>x.setAttribute('aria-pressed',String(s.includes(+x.dataset.day))));return}
    if(b.dataset.sndtest!==undefined){unlockAudio();const s=val(f,'sound');playSound(s==='yt:'?'yt:'+val(f,'yturl'):s,true)}});
}
function timerSheet(){
  const f=sheet('Temporizador',`<div class="two"><label class="field"><span>Horas</span><input type="number" name="th" min="0" max="23" value="0"></label><label class="field"><span>Minutos</span><input type="number" name="tm" min="0" max="59" value="10"></label></div>
    <label class="field"><span>Segundos</span><input type="number" name="ts" min="0" max="59" value="0"></label>
    <label class="field"><span>Título</span><input name="tl" placeholder="Ex.: Massa, TPC, Forno" value="${esc(S.tmName||'')}"></label>
    <label class="prof-chk"><input type="checkbox" name="ta" ${S.tmAlarm===false?'':'checked'}> Tocar alarme no fim</label>`,
  {onSave:f=>{const s=(+val(f,'th')||0)*3600+(+val(f,'tm')||0)*60+(+val(f,'ts')||0);if(s<1){toast('Escolhe um tempo');return false}addTimer(s,val(f,'tl'),!!f.elements.ta.checked)},saveLabel:'Começar'});
}
function addTimer(sec,label,alarm){unlockAudio();if(alarm===undefined)alarm=S.tmAlarm!==false;if(label===undefined||label==='')label=S.tmName||'';S.tmName='';
  const t={id:uid(),label:label||'',alarm,total:sec*1000,remain:sec*1000,endAt:Date.now()+sec*1000};saveTimers([...timers(),t]);renderWall()}
function clockClick(t,d){
  unlockAudio();
  if(d.ckTab){S.ckTab=d.ckTab;renderWall();return}
  if(d.ckNew!==undefined){alarmSheet();return}
  if(d.ckEdit){alarmSheet(clockCfg().alarms.find(a=>a.id===d.ckEdit));return}
  if(d.ckToggle){saveClock(clockCfg().alarms.map(a=>a.id===d.ckToggle?{...a,on:!a.on}:a));return}
  const ts=timers(),upd=(id,fn)=>{saveTimers(ts.map(x=>x.id===id?fn(x):x));renderWall()};
  if(d.tmAdd){addTimer(+d.tmAdd);return}
  if(d.tmBell){upd(d.tmBell,x=>({...x,alarm:x.alarm===false}));return}
  if(d.tmRen){const x=ts.find(y=>y.id===d.tmRen);const n=prompt('Título do temporizador',x&&x.label||'');if(n!==null)upd(d.tmRen,y=>({...y,label:n.trim()}));return}
  if(d.tmNew!==undefined){timerSheet();return}
  if(d.tmGo){upd(d.tmGo,x=>({...x,endAt:Date.now()+x.remain}));return}
  if(d.tmPause){upd(d.tmPause,x=>({...x,remain:x.endAt-Date.now(),endAt:null}));return}
  if(d.tmReset){upd(d.tmReset,x=>({...x,remain:x.total,endAt:null}));return}
  if(d.tmStep){const[id,s]=d.tmStep.split('|');upd(id,x=>x.endAt?{...x,endAt:Math.max(Date.now(),x.endAt)+s*1000,total:x.total+s*1000}:{...x,remain:Math.max(0,x.remain)+s*1000,total:x.total+s*1000});return}
  if(d.tmDel){saveTimers(ts.filter(x=>x.id!==d.tmDel));renderWall();return}
  const s=swState();
  if(d.swGo!==undefined){lsSet('fam.sw',JSON.stringify(s.start?{...s,acc:swMs(s),start:0}:{...s,start:Date.now()}));renderWall();return}
  if(d.swLap!==undefined){lsSet('fam.sw',JSON.stringify({...s,laps:[...s.laps,swMs(s)]}));renderWall();return}
  if(d.swReset!==undefined){lsSet('fam.sw',JSON.stringify({acc:0,start:0,laps:[]}));renderWall();return}
  if(d.ringStop!==undefined){stopRing(false);return}
  if(d.ringSnooze!==undefined){stopRing(true);return}
}
/* sons */
let ringT=null,ringItem=null,ringStopT=null;
function tone(seq,type){if(!actx)return;try{const t0=actx.currentTime;seq.forEach(([d,f,len,vol])=>{const o=actx.createOscillator(),g=actx.createGain();o.type=type||'sine';o.frequency.value=f;
  g.gain.setValueAtTime(0.0001,t0+d);g.gain.exponentialRampToValueAtTime(vol||0.5,t0+d+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+d+len);o.connect(g).connect(actx.destination);o.start(t0+d);o.stop(t0+d+len+0.05)})}catch(e){}}
const SOUNDS={bip:()=>beep(),
  suave:()=>tone([[0,523,0.9,0.35],[0.35,659,0.9,0.35],[0.7,784,1.2,0.35]]),
  despertador:()=>tone([0,0.12,0.24,0.36,0.6,0.72,0.84,0.96].map(d=>[d,d<0.5?988:1319,0.09,0.55]),'square')};
function playSound(k,once){if(k&&k.startsWith('yt:')){const u=k.slice(3),v=S.media.videos.find(x=>x.u===u);if(once){if(ytParse(u))toast('Vai abrir no YouTube: '+(v?v.t:'o link escolhido'));else toast('Link do YouTube ainda por confirmar');return}
    playVideo(u,v?v.t:'Alarme');const L=document.getElementById('mediaLayer');if(L)L.classList.remove('mini');return 'radio'}
  if(k&&k.startsWith('radio:')){const u=k.slice(6),r=S.media.radios.find(x=>x.u===u);if(once){toast('Vai tocar a rádio '+(r?r.n:''));return}playRadio(u,r?r.n:'Rádio',r&&r.a);return 'radio'}
  (SOUNDS[k]||SOUNDS.despertador)();}
function ring(item){ringItem=item;clearInterval(ringT);clearTimeout(ringStopT);
  const mode=playSound(item.sound);if(mode!=='radio')ringT=setInterval(()=>playSound(item.sound),item.sound==='suave'?2200:1500);
  ringStopT=setTimeout(()=>stopRing(false),10*60000);
  try{navigator.vibrate&&navigator.vibrate([400,200,400,200,400])}catch(e){}
  try{if('Notification' in window&&Notification.permission==='granted'&&document.hidden)new Notification('Quadro da Família',{body:item.title,tag:'quadro-relogio'})}catch(e){}
  let el=document.getElementById('ckRing');if(!el){el=document.createElement('div');el.id='ckRing';el.className='alarm ck-ringing';el.setAttribute('role','alertdialog');document.body.appendChild(el)}
  el.innerHTML=`<div class="alarm-card"><div class="alarm-clock">${nowHM()}</div><div class="alarm-row"><div class="alarm-txt"><b>${esc(item.title)}</b><span>${esc(item.sub||'')}</span></div>
    <div class="alarm-btns"><button data-ring-stop>Parar</button>${item.snooze?`<button data-ring-snooze>Adiar ${item.snooze} min</button>`:''}</div></div></div>`;
  if(S.wall&&S.wallView==='relogio'&&!overlay.innerHTML)renderWall()}
function stopRing(snooze){clearInterval(ringT);clearTimeout(ringStopT);
  if(ringItem&&ringItem.sound&&ringItem.sound.startsWith('radio:'))stopMedia('radio');
  if(ringItem&&ringItem.sound&&ringItem.sound.startsWith('yt:')&&!snooze){/* o vídeo continua a dar; fecha-se no próprio leitor */}
  if(ringItem&&ringItem.sound&&ringItem.sound.startsWith('yt:')&&snooze)stopMedia('video');
  if(snooze&&ringItem){const sn=lsJSON('fam.ckSnooze',[]);sn.push({at:Date.now()+ringItem.snooze*60000,item:ringItem});lsSet('fam.ckSnooze',JSON.stringify(sn))}
  ringItem=null;const el=document.getElementById('ckRing');if(el)el.remove();if(S.wall&&!overlay.innerHTML)renderWall()}
function clockTick(){
  // contadores no ecrã
  document.querySelectorAll('[data-tick]').forEach(el=>{if(el.dataset.tick==='sw')el.innerHTML=fmtDur(swMs(swState()),!!el.dataset.cs);
    else{const t=timers().find(x=>x.id===el.dataset.id);if(t){el.textContent=fmtDur(tmLeft(t));const r=el.closest('.ck-ring');if(r&&t.total)r.style.setProperty('--p',(Math.max(0,Math.min(1,tmLeft(t)/t.total))*360).toFixed(1)+'deg')}}});
  if(ringItem)return;
  // temporizadores terminados (tocam no aparelho onde foram criados)
  const ts=timers(),done=ts.find(t=>t.endAt&&t.endAt<=Date.now());
  if(done){saveTimers(ts.map(t=>t.id===done.id?{...t,endAt:null,remain:0}:t));if(done.alarm===false){toast((done.label||'Temporizador')+' terminou');if(S.wall&&!overlay.innerHTML)renderWall();return}ring({title:(done.label||'Temporizador')+' terminou',sub:fmtDur(done.total),sound:'despertador',snooze:0});return}
  // adiados
  const sn=lsJSON('fam.ckSnooze',[]),due=sn.find(x=>x.at<=Date.now());
  if(due){lsSet('fam.ckSnooze',JSON.stringify(sn.filter(x=>x!==due)));ring(due.item);return}
  // alarmes (só no ecrã de parede)
  if(!S.wall)return;
  const n=new Date(),hm=nowHM(),fired=lsJSON('fam.ckFired',{});
  for(const a of clockCfg().alarms){
    if(!a.on||a.h!==hm)continue;if(a.days&&a.days.length&&!a.days.includes(dowMon(n)))continue;
    const k=a.id+'|'+TODAY+'|'+a.h;if(fired[k])continue;
    fired[k]=1;const keep={};Object.keys(fired).filter(x=>x.includes('|'+TODAY+'|')).forEach(x=>keep[x]=1);lsSet('fam.ckFired',JSON.stringify(keep));
    if(!a.days||!a.days.length)saveClock(clockCfg().alarms.map(x=>x.id===a.id?{...x,on:false}:x));
    ring({title:a.label||'Alarme',sub:a.h,sound:a.sound,snooze:a.snooze||10});return}
}
setInterval(clockTick,250);

function srcOf(id){const m=member(id);return (m&&m.src)||'ambos'}
function localShown(e){const w=whoList(e.who);if(w.includes('all'))return true;return !w.length||w.some(id=>srcOf(id)!=='google')}

function galleryRadio(){const now=S.radioNow,rs=myRadios().slice(0,1);
  if(!now&&!rs.length)return '';
  return `<div class="g-radio">${now?`<span class="ml-eq big" aria-hidden="true"><i></i><i></i><i></i></span><span class="g-rn"><small>A ouvir</small><b>${esc(now.n)}</b></span><button class="g-rb" data-mstop="radio">Parar</button>`
    :`<span class="g-rn"><small>Rádio</small></span>${rs.map(r=>`<button class="g-rb" data-radio="${esc(r.u)}" data-ralt="${esc(r.a||'')}" data-rname="${esc(r.n)}">▶ ${esc(r.n)}</button>`).join('')}`}</div>`}

function finishAlarm(f,a,h,sound){
  const days=[...f.querySelectorAll('[data-day][aria-pressed="true"]')].map(b=>+b.dataset.day);
  const na={...a,h,label:val(f,'label'),days,sound,snooze:Math.max(1,Math.min(60,+val(f,'snooze')||10)),on:true};
  saveClock([...clockCfg().alarms.filter(x=>x.id!==a.id),na]);unlockAudio();closeSheet();toast(untilTxt(nextRing(na))||'Alarme guardado')}
async function ytResolve(u){const m=/youtube\.com\/(@[\w.\-]+)/i.exec(u)||/^(@[\w.\-]+)$/.exec(u.trim());if(!m)return null;
  try{const r=await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(m[1])}&key=${ytKey()}`),j=await r.json();
    const id=j.items&&j.items[0]&&j.items[0].id;return id?'https://www.youtube.com/channel/'+id:null}catch(e){return null}}

document.addEventListener('input',e=>{if(e.target.id==='tm-name')S.tmName=e.target.value});
document.addEventListener('change',e=>{if(e.target.id==='tm-alarm')S.tmAlarm=e.target.checked});

document.addEventListener('change',e=>{if(e.target.id==='f-dest'){const b=document.querySelector('[data-gcalbox]');if(b)b.hidden=e.target.value==='quadro'}});
/* ---------- eventos do Google: ver e apagar ---------- */
function findGev(key){const [src,i,d]=key.split('|');const doc=S.gcal[src];if(!doc)return null;const x=(doc.events||[]).find(y=>y.i===i&&y.d===d)||(doc.events||[]).find(y=>y.i===i);return x?{src,x}:null}
function gEventSheet(key){const f0=findGev(key);if(!f0){toast('Evento não encontrado. Sincroniza de novo.');return}
  const {src,x}=f0,m=x.m||src,mine=!!(S.mcp&&x.i&&x.ci);
  const when=(x.d===x.e?niceDate(x.d):niceDate(x.d)+' – '+niceDate(x.e))+(x.h?' · '+x.h+(x.he?'–'+x.he:''):'');
  const f=sheet('Evento do Google',`<div class="item" style="cursor:default"><span class="body"><span class="kind">Google${x.c?' · '+esc(x.c):''}</span><div class="t">${esc(x.t)}</div><div class="sub">${esc(when)}${x.p?' · '+esc(x.p):''}</div>
      <div class="people"><span class="ptag" style="--c:${colorOf(m)}">${esc(gName(x.w&&memberByName(x.w)?memberByName(x.w).id:m))}</span></div></span></div>
    ${x.i&&x.ci&&mine?`<label class="field"><span>De quem é${x.r?' (toda a série)':''}</span><select data-gowner><option value="">Do calendário (${esc(gName(m))})</option><option value="all">Todos</option>${S.members.map(p=>`<option value="${p.id}" ${x.w&&memberByName(x.w)&&memberByName(x.w).id===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label>`:''}
    ${x.i&&x.ci?(mine?`<button type="button" class="ghost" data-gedit="${esc(key)}">Editar</button><div class="field"><span>Apagar no Google Calendar</span><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="del" data-gdel="one">Apagar este evento</button>${x.r?'<button type="button" class="del" data-gdel="all">Apagar toda a série</button>':''}</div>
      <p class="muted small" style="margin:4px 0 0">Apaga mesmo no Google, também no telemóvel. Não dá para desfazer.</p></div>`
      :`<p class="muted small" style="margin:0">Este evento vem do Google de ${esc(member(src)?member(src).name:'outra pessoa')}. Só quem sincronizou este calendário o pode apagar a partir do Quadro.</p>`):'<p class="muted small" style="margin:0">Sincroniza o Google de novo para poder apagar este evento a partir do Quadro.</p>'}`);
  const so=f.querySelector('[data-gowner]');if(so)so.addEventListener('change',async()=>{if(needGoogle())return;const v=so.value;
    const nm=v==='all'?'Todos':v?member(v).name:'';try{await S.mcp.callTool(GSERVER,'update_event',{calendarId:x.ci,eventId:x.r||x.i,description:nm?'Para: '+nm:''});toast(nm?'Agora é de '+nm:'Volta a ser do calendário');resyncSoon()}catch(e){toast(gErr(e))}});
  f.addEventListener('click',async ev=>{const b=ev.target.closest('[data-gdel]');if(!b)return;
    if(!b.dataset.armed){b.dataset.armed='1';b.textContent='Toca de novo para apagar';return}
    allowGooglePrompt();
    try{await S.mcp.callTool(GSERVER,'delete_event',{calendarId:x.ci,eventId:b.dataset.gdel==='all'&&x.r?x.r:x.i});
      const doc=S.gcal[src],evs=(doc.events||[]).filter(y=>b.dataset.gdel==='all'&&x.r?y.r!==x.r:!(y.i===x.i));
      await S.db.doc('gcal/'+src).set({...doc,events:evs});closeSheet();toast('Apagado no Google Calendar')}
    catch(e){toast(gErr(e))}});
}
/* ---------- Configuração ---------- */
function configHub(){
  const u=window.famBackend&&window.famBackend.user;
  const it=(attr,ic,t,s)=>`<button type="button" class="cfg-it" ${attr}><span class="cfg-ic">${ic}</span><span style="flex:1;min-width:0"><b>${t}</b><small>${s}</small></span><span class="fd-chev">›</span></button>`;
  const mm=S.me&&member(S.me.memberId);
  const f=sheet('Configuração',`${u?`<p class="muted small" style="margin:0 0 6px">Entraste como <b>${esc(mm?mm.name:'?')}</b> · ${esc(u.email||'')}${isAdmin()?' · conta principal':''} <button type="button" class="edit" data-whoami>Mudar</button></p>`:''}<div class="cfg">
    ${it('data-cfg="pessoas"','👪︎','A família','Pessoas, fotografias, adulto/criança, estudante, calendários Google')}
    ${it('data-cfg="google"','📅︎','O meu Google Calendar','Ligar, adicionar e remover calendários')}
    ${it('data-cfg="ecra"','🖼︎','Ecrã de parede e moldura','Ecrã em repouso, fotografias, tempo entre fotografias, prémio')}
    ${it('data-cfg="tempo"','⛅','Tempo','Localidade da previsão: '+esc(wxPlace().name))}
    ${it('data-shcfg','🏠','Casa (Shelly)','Luzes, tomadas, estores e sensores'+(shCfg().key?' · ligado':''))}
    ${it('data-cfg="moldura"','🖼︎','Moldura','Ligar e desligar widgets, fotografias, versículo do dia')}
    ${it('data-cfg="escola"','🎒︎','Férias escolares','Períodos sem aulas')}
    ${it('data-migrate','🔄','Só calendários do Google',gOnly()?'Ativo · calendário Família e de cada pessoa':'Passar tudo do Quadro para o Google')}
    ${it('data-cfg="dados"','💾︎','Dados','Exportar ou importar uma cópia')}
    ${u?it('data-cfg="sair"','↩︎','Sair da conta',esc(u.email||'')):''}</div>`);
  f.addEventListener('click',e=>{const b=e.target.closest('[data-cfg]');if(!b)return;const k=b.dataset.cfg;
    if(k==='pessoas')familyForm();else if(k==='google')googleSheet();else if(k==='ecra')wallSettings();
    else if(k==='escola'){closeSheet();if(S.wall)exitWall();S.tab='agenda';render();setTimeout(()=>{const x=document.querySelector('[data-ag="escola"]');if(x)x.click()},60)}
    else if(k==='dados'){if(!isAdmin()){toast('Só a conta principal pode importar ou exportar os dados.');return}dataSheet()}else if(k==='tempo')wxSheet();else if(k==='votd')yvSheet();else if(k==='moldura')frameSheet();else if(k==='sair')window.famBackend.signOut()});
}
function dataSheet(){
  const f=sheet('Dados',`<p class="muted small" style="margin:0">Uma cópia guarda tudo num ficheiro: agenda, lembretes, tarefas, receitas, listas de compras e configuração.</p>
    <div class="row" style="flex-wrap:wrap;gap:8px"><button type="button" class="ghost" id="btnExport">Exportar cópia</button>
    ${S.readOnly||!S.db?'':'<label class="ghost" style="cursor:pointer">Importar cópia<input id="impFile2" type="file" accept="application/json,.json" hidden></label>'}</div>`);
  f.querySelector('#btnExport').addEventListener('click',exportData);
  const imp=f.querySelector('#impFile2');
  if(imp)imp.addEventListener('change',async()=>{const file=imp.files[0];if(!file)return;let j;try{j=JSON.parse(await file.text())}catch(e){toast('Esse ficheiro não é uma cópia do Quadro.');return}closeSheet();importData(j)});
}

function myRadios(){const ord=S.media.order||[],pos=u=>{const i=ord.indexOf(u);return i<0?1e6:i};return S.media.radios.map((x,i)=>[x,i]).sort((p,q)=>pos(p[0].u)-pos(q[0].u)||p[1]-q[1]).map(x=>x[0])}

/* ---------- Testes (estudantes) ---------- */
function students(){const st=S.members.filter(m=>m.student);return st.length?st:S.members.filter(m=>schoolMembers().includes(m.id))}
function subjectsOf(m){const set=new Set();S.events.filter(e=>e.school&&whoList(e.who).includes(m)).forEach(e=>set.add(String(e.title||'').replace(/^Escola\s*·\s*/,'').trim()));
  (S.tests||[]).filter(t=>whoList(t.who).includes(m)).forEach(t=>set.add(t.subject));return [...set].filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt'))}
function daysTo(d){return Math.round((parse(d)-parse(TODAY))/864e5)}
function viewTests(seg){
  const all=[...(S.tests||[])].filter(t=>matches(t)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
  const up=all.filter(t=>t.date>=TODAY),past=all.filter(t=>t.date<TODAY).reverse();
  const line=t=>{const n=daysTo(t.date);return `<button class="item" data-edit-test="${t.id}"><span class="time">${n===0?'Hoje':n===1?'Amanhã':n>0?n+' dias':''}</span><span class="body">
    <span class="kind">Teste · ${niceDate(t.date)}${t.time?' · '+esc(t.time):''}</span><div class="t">${esc(t.subject)}</div>${t.note?`<div class="sub">${esc(t.note)}</div>`:''}
    <div class="people">${peopleTags(t.who)}</div></span></button>`};
  return `<section class="panel">${seg}
    <div class="row"><h2>Testes</h2><span class="spacer"></span>${S.readOnly?'':'<button class="addbtn" data-new="test">+ Teste</button>'}</div>
    <p class="muted small" style="margin:0">Cada teste cria avisos para estudar nos dias antes e um aviso na véspera. Os avisos aparecem em Avisos e tocam como alarme.</p>
    <div class="list">${up.map(line).join('')||'<div class="empty">Sem testes marcados.</div>'}</div>
    ${past.length?`<span class="kind">Já feitos</span><div class="list">${past.slice(0,15).map(line).join('')}</div>`:''}</section>`}
function testForm(t){
  const st=students(),def=st[0]?st[0].id:(S.members[0]&&S.members[0].id);
  const isNew=!t;t=t||{who:[S.filter!=='all'&&typeof S.filter==='string'&&member(S.filter)?S.filter:def],subject:'',date:(()=>{if(S.sel&&S.sel>TODAY)return S.sel;const x=parse(TODAY);x.setDate(x.getDate()+7);return iso(x)})(),time:'',note:'',study:[3,1],studyTime:'18:00',eve:true,eveTime:'20:00',alarm:true};
  const who=whoList(t.who)[0]||def;
  const f=sheet(isNew?'Novo teste ou exame':tkind(t)[1],`
    <label class="field"><span>Tipo</span><select name="kind">${Object.entries(TKIND).map(([k,v])=>`<option value="${k}" ${(t.kind||'teste')===k?'selected':''}>${v[0]} ${v[1]}</option>`).join('')}</select></label>
    <label class="field"><span>Aluno</span><select name="who" id="t-who">${(st.length?st:S.members).map(m=>`<option value="${m.id}" ${who===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label>
    <label class="field"><span>Disciplina</span><input name="subject" id="t-subj" list="t-subjects" value="${esc(t.subject)}" placeholder="Ex.: Matemática" required><datalist id="t-subjects">${subjectsOf(who).map(s=>`<option value="${esc(s)}">`).join('')}</datalist></label>
    <div class="two"><label class="field"><span>Dia do teste</span><input type="date" name="date" value="${esc(t.date)}"></label>
    <label class="field"><span>Hora (opcional)</span><input type="time" name="time" value="${esc(t.time||'')}"></label></div>
    <label class="field"><span>Matéria</span><input name="note" value="${esc(t.note||'')}" placeholder="Ex.: Frações e percentagens, págs. 40–62"></label>
    <div class="field"><span>Avisos para estudar</span><div class="who" style="flex-wrap:wrap" data-studydays>${[7,5,4,3,2,1].map(n=>`<button type="button" class="chip" data-sd="${n}" aria-pressed="${(t.study||[]).includes(n)}">${n===1?'1 dia antes':n+' dias antes'}</button>`).join('')}</div></div>
    <div class="two"><label class="field"><span>Hora do aviso de estudo</span><input type="time" name="studyTime" value="${esc(t.studyTime||'18:00')}"></label>
    <label class="field"><span>Aviso na véspera</span><span class="row" style="gap:8px;align-items:center"><input type="checkbox" name="eve" ${t.eve!==false?'checked':''} style="width:22px;height:22px;min-height:0"><input type="time" name="eveTime" value="${esc(t.eveTime||'20:00')}" style="flex:1"></span></label></div>
    <label class="prof-chk"><input type="checkbox" name="alarm" ${t.alarm!==false?'checked':''}> Os avisos tocam como alarme</label>`,
  {saveLabel:'Guardar',onSave:f=>{const subject=val(f,'subject');if(!subject){toast('Escreve a disciplina');return false}
    const date=val(f,'date');if(!date){toast('Escolhe o dia do teste');return false}
    const study=[...f.querySelectorAll('[data-sd][aria-pressed="true"]')].map(b=>+b.dataset.sd);
    const id=t.id||uid();
    const nt={kind:val(f,'kind')||'teste',who:[val(f,'who')],subject,date,time:val(f,'time'),note:val(f,'note'),study,studyTime:val(f,'studyTime')||'18:00',eve:!!f.elements.eve.checked,eveTime:val(f,'eveTime')||'20:00',alarm:!!f.elements.alarm.checked};
    const prevT=(S.tests||[]).find(x=>x.id===id)||{};const nt2={...nt,gId:prevT.gId||'',gCal:prevT.gCal||''};save('tests',id,nt2);syncTestReminders(id,nt);mirrorG('tests',id,nt2,testEv(nt2));toast(tkind(nt)[1]+' de '+subject+' marcado')},
   onDelete:isNew||S.readOnly?null:()=>{unmirrorG(t);remove('tests',t.id);syncTestReminders(t.id,null)}});
  f.addEventListener('click',e=>{const b=e.target.closest('[data-sd]');if(b)b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'))});
  f.querySelector('#t-who').addEventListener('change',e=>{f.querySelector('#t-subjects').innerHTML=subjectsOf(e.target.value).map(s=>`<option value="${esc(s)}">`).join('')});
}
function syncTestReminders(id,t){
  S.reminders.filter(r=>r.testId===id).forEach(r=>remove('reminders',r.id));
  if(!t)return;
  const nm=member(t.who[0])?member(t.who[0]).name:'',dd=parse(t.date),when=`${DOW[dowMon(dd)].toLowerCase()}, ${dd.getDate()}/${dd.getMonth()+1}`;
  const add=(rid,date,time,text)=>{if(date<TODAY)return;save('reminders',rid,{text,date,time,who:t.who,alarm:t.alarm!==false,testId:id,done:false})};
  [...new Set(t.study||[])].filter(n=>n>1||!t.eve).forEach(n=>{const x=parse(t.date);x.setDate(x.getDate()-n);add(id+'-s'+n,iso(x),t.studyTime,`${nm}: estudar ${t.subject} — teste ${n===1?'amanhã':'daqui a '+n+' dias'} (${when})${t.note?' · '+t.note:''}`)});
  if(t.eve){const x=parse(t.date);x.setDate(x.getDate()-1);add(id+'-eve',iso(x),t.eveTime,`${nm}: amanhã há teste de ${t.subject}${t.time?' às '+t.time:''} — rever a matéria e preparar a mochila${t.note?' · '+t.note:''}`)}
}

function avatarData(file){return new Promise((ok,ko)=>{const img=new Image(),u=URL.createObjectURL(file);
  img.onload=()=>{const s=Math.min(img.width,img.height),cv=document.createElement('canvas');cv.width=cv.height=240;
    cv.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,240,240);URL.revokeObjectURL(u);ok(cv.toDataURL('image/jpeg',0.82))};
  img.onerror=ko;img.src=u})}

/* ---------- Tempo (Open-Meteo, sem chave) ---------- */
var WX=null,wxBusy=false;

function wxPlace(){return S.wxPlace||{name:'Lisboa',lat:38.7223,lon:-9.1393}}
function wxLoad(force){const pl=wxPlace(),key=pl.lat.toFixed(2)+','+pl.lon.toFixed(2);
  if(!WX){const c=lsJSON('fam.wx',null);if(c&&c.key===key)WX=c}
  if(wxBusy||(!force&&WX&&WX.key===key&&Date.now()-WX.at<30*60000))return;
  wxBusy=true;
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pl.lat}&longitude=${pl.lon}&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset&timezone=auto&forecast_days=16`)
    .then(r=>r.json()).then(j=>{if(!j.daily)throw 0;const dd={};j.daily.time.forEach((d,i)=>dd[d]={c:j.daily.weather_code[i],mx:Math.round(j.daily.temperature_2m_max[i]),mn:Math.round(j.daily.temperature_2m_min[i]),pp:j.daily.precipitation_probability_max?j.daily.precipitation_probability_max[i]:null,ps:j.daily.precipitation_sum?j.daily.precipitation_sum[i]:null,sr:(j.daily.sunrise[i]||'').slice(11,16),ss:(j.daily.sunset[i]||'').slice(11,16)});
      WX={key,at:Date.now(),cur:j.current?{t:Math.round(j.current.temperature_2m),c:j.current.weather_code,day:j.current.is_day}:null,days:dd};lsSet('fam.wx',JSON.stringify(WX));wxBusy=false;render()})
    .catch(()=>{wxBusy=false})}
function wxDay(d){return WX&&WX.days&&WX.days[d]||null}
function wxIc(c,night){if(night&&(c===0||c===1))return '🌙';return (WXC[c]||['🌡️'])[0]}
function wxTxt(c){return (WXC[c]||['','—'])[1]}
function wxRain(w){return w&&w.pp!=null&&w.pp>=10?`💧${w.pp}%`:''}
function wxLine(d,full){const w=wxDay(d);if(!w)return '';
  return `<span class="wx-line" title="${esc(wxTxt(w.c))}"><span class="wx-ic">${wxIc(w.c)}</span><span class="wx-mx">${w.mx}°</span><span class="wx-mn">${w.mn}°</span>${wxRain(w)?`<span class="wx-r">${wxRain(w)}</span>`:''}${full?`<span class="wx-sun">↑${w.sr} ↓${w.ss}</span>`:''}</span>`}
function wxNow(){if(!WX||!WX.cur)return '';const w=wxDay(TODAY);
  return `<button class="fd-wx" data-wxinfo title="${esc(wxTxt(WX.cur.c))}"><span class="wx-ic">${wxIc(WX.cur.c,!WX.cur.day)}</span><b>${WX.cur.t}°</b>${w?`<small>${w.mx}° / ${w.mn}°${wxRain(w)?' · '+wxRain(w):''}<br>↑${w.sr} ↓${w.ss}</small>`:''}</button>`}
function wxSheet(){const pl=wxPlace();const days=WX?Object.keys(WX.days).slice(0,10):[];
  const f=sheet('Tempo · '+pl.name,`${days.length?`<div class="wx-list">${days.map(d=>{const w=WX.days[d],dt=parse(d);return `<div class="wx-row"><span class="wx-d">${d===TODAY?'Hoje':DOW[dowMon(dt)]+' '+dt.getDate()}</span><span class="wx-ic">${wxIc(w.c)}</span><span class="wx-t">${esc(wxTxt(w.c))}</span><b>${w.mx}°</b><span class="muted">${w.mn}°</span><span class="wx-r">${w.pp!=null?'💧'+w.pp+'%':''}${w.ps?' · '+w.ps+' mm':''}</span><span class="muted small">↑${w.sr} ↓${w.ss}</span></div>`}).join('')}</div>`:'<p class="muted">A carregar a previsão…</p>'}
    <div class="field"><span>Localidade</span><div class="row" style="gap:8px"><input id="wx-q" placeholder="Ex.: Lisboa, Porto, Sintra" style="flex:1"><button type="button" class="addbtn" id="wx-go">Procurar</button><button type="button" class="ghost" id="wx-here">📍 Aqui</button></div><div id="wx-res" class="m-list"></div></div>
    <p class="muted small" style="margin:0">Previsão de <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>.</p>`);
  const res=f.querySelector('#wx-res');
  const setPl=p=>{S.wxPlace=p;if(S.db)S.db.doc('config/weather').set(p).catch(handleWriteError);WX=null;lsSet('fam.wx','');wxLoad(true);closeSheet();toast('Tempo para '+p.name)};
  f.querySelector('#wx-go').addEventListener('click',async()=>{const q=f.querySelector('#wx-q').value.trim();if(!q)return;res.innerHTML='<p class="muted small">A procurar…</p>';
    try{const j=await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=pt&format=json`)).json();
      res.innerHTML=(j.results||[]).map((r,i)=>`<div class="m-st"><button type="button" class="m-play" data-wxi="${i}"><span>${esc(r.name)}${r.admin1?', '+esc(r.admin1):''}${r.country?' · '+esc(r.country):''}</span></button></div>`).join('')||'<p class="muted small">Nada encontrado.</p>';
      res.querySelectorAll('[data-wxi]').forEach(b=>b.addEventListener('click',()=>{const r=j.results[+b.dataset.wxi];setPl({name:r.name,lat:r.latitude,lon:r.longitude})}))}catch(e){res.innerHTML='<p class="muted small">Não foi possível procurar agora.</p>'}});
  f.querySelector('#wx-here').addEventListener('click',()=>{if(!navigator.geolocation){toast('Este aparelho não dá a localização.');return}
    navigator.geolocation.getCurrentPosition(p=>setPl({name:'Aqui',lat:+p.coords.latitude.toFixed(3),lon:+p.coords.longitude.toFixed(3)}),()=>toast('Sem acesso à localização.'),{timeout:10000})});
}
setInterval(()=>wxLoad(false),10*60000);

function frameWx(big){const w=wxDay(TODAY),cur=WX&&WX.cur;if(!w&&!cur)return '';
  const ic=cur?wxIc(cur.c,!cur.day):wxIc(w.c),t=cur?cur.t:w.mx;
  return `<button class="fr-wx${big?' fr-big':''}" data-wxinfo><span class="wx-ic">${ic}</span><span class="fr-wt">${t}°</span><span class="fr-wd"><b>${esc(wxTxt(cur?cur.c:w.c))}</b>${w?`<span>${w.mx}° / ${w.mn}°${w.pp!=null?' · 💧'+w.pp+'%':''}</span><span>☀︎ ↑${w.sr} · ↓${w.ss}</span>`:''}</span></button>`}

function memberCals(mid){const me=S.me||{},out=[];const cals=me.cals||{},cm=me.calMember||{},nm=me.calNames||{};
  Object.keys(cals).filter(id=>cals[id]!=='off'&&((cm[id]||me.memberId)===mid)).forEach(id=>out.push({id,n:nm[id]||((me.extra||[]).find(x=>x.id===id)||{}).name||id.split('@')[0]}));return out}
async function saveMyProfile(p){S.me=p;if(S.db&&S.uid){try{await S.db.doc('data/users/'+S.uid+'/profile').set(p)}catch(e){toast('Não foi possível guardar.');return false}}return true}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-memadd],[data-memdel],[data-callink],[data-calunlink]');if(!b)return;
  if(b.dataset.memadd!==undefined){const n=S.members.reduce((a,m)=>Math.max(a,+String(m.id).replace(/\D/g,'')||0),0)+1;const cols=['p1','p2','p3','p4','p5','p6','p7','p8'];
    const used=new Set(S.members.map(m=>m.color));const color=cols.find(x=>!used.has(x))||cols[n%cols.length];
    await saveMembers([...S.members,{id:'m'+n,name:'Pessoa '+n,color,kind:'adulto',student:false,src:'ambos'}]);setTimeout(familyForm,150);toast('Pessoa adicionada. Escreve o nome e carrega em Guardar.');return}
  if(b.dataset.memdel){if(S.members.length<=1)return;if(!b.dataset.armed){b.dataset.armed='1';b.textContent='Toca de novo';return}
    await saveMembers(S.members.filter(m=>m.id!==b.dataset.memdel));setTimeout(familyForm,150);toast('Pessoa removida');return}
  if(b.dataset.callink){const mid=b.dataset.callink,inp=document.querySelector(`[data-calin="${mid}"]`),id=(inp&&inp.value||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)){toast('Escreve o email do calendário Google');return}
    const me=S.me||{};if(!me.memberId){toast('Primeiro escolhe quem és em O meu Google Calendar.');googleSheet();return}
    const p={...me,cals:{...(me.cals||{}),[id]:'show'},calMember:{...(me.calMember||{}),[id]:mid},calNames:{...(me.calNames||{}),[id]:member(mid).name},extra:[...(me.extra||[]).filter(x=>x.id!==id),{id,name:member(mid).name}],hidden:(me.hidden||[]).filter(x=>x!==id)};
    if(await saveMyProfile(p)){toast('Calendário ligado a '+member(mid).name+'. A sincronizar…');allowGooglePrompt();S.gbusy=0;syncGoogle(p,true);setTimeout(familyForm,150)}return}
  if(b.dataset.calunlink){const id=b.dataset.calunlink,me=S.me||{};const p={...me,cals:{...(me.cals||{}),[id]:'off'}};
    if(await saveMyProfile(p)){toast('Calendário desligado');S.gbusy=0;syncGoogle(p,false);setTimeout(familyForm,150)}return}
});

/* widgets que se podem mover na galeria */
function wPos(){return lsJSON('fam.wpos',{})}
function dragBox(k,html){if(!html)return '';const p=wPos()[k];
  const st=p?`left:${(p.x*100).toFixed(2)}%;top:${(p.y*100).toFixed(2)}%;right:auto;bottom:auto`:'';
  return `<div class="fr-drag fr-${k}" data-dragbox="${k}" style="${st}"><span class="fr-hd" data-handle title="Arrastar para mudar de sítio" aria-label="Mover">⠿</span>${html}</div>`}
(function(){let dr=null;
  document.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-handle]');if(!h)return;const box=h.closest('[data-dragbox]'),ph=box&&box.closest('.w-photo');if(!ph)return;
    e.preventDefault();const r=box.getBoundingClientRect(),pr=ph.getBoundingClientRect();
    dr={box,ph,dx:e.clientX-r.left,dy:e.clientY-r.top,pr};S.dragging=true;box.classList.add('moving');try{h.setPointerCapture(e.pointerId)}catch(_){}});
  document.addEventListener('pointermove',e=>{if(!dr)return;const {box,pr}=dr,bw=box.offsetWidth,bh=box.offsetHeight;
    const x=Math.max(0,Math.min(pr.width-bw,e.clientX-pr.left-dr.dx)),y=Math.max(0,Math.min(pr.height-bh,e.clientY-pr.top-dr.dy));
    Object.assign(box.style,{left:x+'px',top:y+'px',right:'auto',bottom:'auto'})});
  const end=()=>{if(!dr)return;const {box,pr}=dr;const p=wPos();p[box.dataset.dragbox]={x:box.offsetLeft/pr.width,y:box.offsetTop/pr.height};lsSet('fam.wpos',JSON.stringify(p));
    box.classList.remove('moving');dr=null;S.dragging=false};
  document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);})();

/* ---------- cada pessoa entra com a sua conta Google ---------- */
function normMail(e){return String(e||'').trim().toLowerCase().replace('@googlemail.com','@gmail.com')}
function myEmail(){const u=window.famBackend&&window.famBackend.user;return normMail(u&&u.email)}
function adminId(){const a=S.members.find(m=>m.admin);return a?a.id:(S.members[0]&&S.members[0].id)}
function isAdmin(){const me=myEmail(),a=S.members.find(m=>m.id===adminId());if(!S.live)return true;return !!me&&(!a||!a.email||normMail(a.email)===me)}
function meMember(){const e=myEmail();return S.members.find(m=>m.email&&normMail(m.email)===e)}
let askedWho=false;
async function ensureMe(){
  if(!S.live||!S.db||!S.uid||!S.meLoaded||!S.famLoaded)return;
  if(S.me&&S.me.memberId&&member(S.me.memberId)){const m=member(S.me.memberId),e=myEmail();
    if(e&&!m.email&&!S.members.some(x=>normMail(x.email)===e))saveMembers(S.members.map(x=>x.id===m.id?{...x,email:e}:x));return}
  const m=meMember();
  if(m){await saveMyProfile({...(S.me||{}),memberId:m.id});return}
  if(askedWho||overlay.innerHTML)return;askedWho=true;
  const f=sheet('Quem és tu?',`<p class="muted" style="margin:0">Entraste com <b>${esc(myEmail())}</b>. Escolhe quem és na família; o Quadro lembra-se nas próximas vezes.</p>
    <div class="who-pick">${S.members.map(x=>`<button type="button" class="who-btn" data-iam="${x.id}">${avatar(x.id)}<b>${esc(x.name)}</b>${x.email?`<small>${esc(x.email)}</small>`:''}</button>`).join('')}</div>`);
  f.addEventListener('click',async e=>{const b=e.target.closest('[data-iam]');if(!b)return;const id=b.dataset.iam,em=myEmail();
    await saveMyProfile({...(S.me||{}),memberId:id});
    if(em&&!member(id).email)await saveMembers(S.members.map(x=>x.id===id?{...x,email:em}:x));
    closeSheet();toast('Olá, '+member(id).name+'!')});
}

document.addEventListener('click',e=>{if(e.target.closest('[data-whoami]')){askedWho=false;const p={...(S.me||{})};delete p.memberId;S.me=p;closeSheet();ensureMe()}});

/* ---------- Mensagem urgente por email ---------- */
function urgentSheet(){
  const withMail=S.members.filter(m=>m.email),me=S.me&&S.me.memberId;
  const f=sheet('Mensagem urgente',`
    <div class="field"><span>Para quem</span><div class="who" style="flex-wrap:wrap" data-urgto>${S.members.map(m=>`<button type="button" class="chip" data-to="${m.id}" aria-pressed="${!!m.email&&m.id!==me}" ${m.email?'':'disabled title="Sem email em Configuração → A família"'}><span class="dot" style="--c:var(--${m.color})"></span>${esc(m.name)}</button>`).join('')}
      <button type="button" class="edit" data-toall>Todos</button></div>
      ${withMail.length<S.members.length?`<p class="muted small" style="margin:4px 0 0">Para enviar a quem está a cinzento, põe o email dessa pessoa em Configuração → A família.</p>`:''}</div>
    <label class="field"><span>Assunto</span><input name="subj" value="URGENTE — Família"></label>
    <label class="field"><span>Mensagem</span><textarea name="msg" rows="5" placeholder="Escreve aqui a mensagem…" style="min-height:120px"></textarea></label>
    <label class="prof-chk"><input type="checkbox" name="board" checked> Mostrar também no Quadro como alarme para essas pessoas</label>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="addbtn urg-btn" data-urgsend="gmail">✉ Enviar pelo Gmail</button><button type="button" class="ghost" data-urgsend="mail">Abrir na app de email</button></div>
    <p class="muted small" style="margin:0">O email abre já preenchido; só tens de carregar em Enviar.</p>`);
  f.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.to){b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));return}
    if(b.dataset.toall!==undefined){f.querySelectorAll('[data-to]:not([disabled])').forEach(x=>x.setAttribute('aria-pressed','true'));return}
    if(b.dataset.urgsend){const ids=[...f.querySelectorAll('[data-to][aria-pressed="true"]')].map(x=>x.dataset.to);
      const to=ids.map(id=>member(id)).filter(m=>m&&m.email).map(m=>m.email);
      const subj=val(f,'subj')||'URGENTE — Família',msg=(f.elements.msg.value||'').trim();
      if(!to.length){toast('Escolhe pelo menos uma pessoa com email');return}if(!msg){toast('Escreve a mensagem');return}
      const sender=S.me&&member(S.me.memberId)?member(S.me.memberId).name:'';
      const body=msg+(sender?'\n\n— '+sender:'')+'\n\n(enviado pelo Quadro da Família)';
      if(f.elements.board.checked){const n=new Date();save('reminders',null,{text:'⚠ URGENTE'+(sender?' ('+sender+')':'')+': '+msg.slice(0,200),date:TODAY,time:pad(n.getHours())+':'+pad(n.getMinutes()),who:ids,alarm:true,done:false,urgent:true})}
      const url=b.dataset.urgsend==='gmail'?`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to.join(','))}&su=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
        :`mailto:${to.map(encodeURIComponent).join(',')}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
      if(b.dataset.urgsend==='gmail')window.open(url,'_blank','noopener');else location.href=url;
      closeSheet();toast('Email preparado para '+ids.map(id=>member(id).name).join(', '))}});
}

/* ---------- Educação (só estudantes) ---------- */
function tkind(t){return TKIND[t.kind||'teste']||TKIND.teste}
function eduOn(d){const out=[];(S.edu||[]).filter(x=>matches(x)).forEach(x=>{
  if(x.type==='estudo'&&x.date===d)out.push({id:'edu:'+x.id,title:'✏️ Estudar '+(x.subject||x.title||''),date:d,time:x.time||'',who:x.who,place:'',note:x.dur?x.dur+' min':'',edu:true});
  if(x.type==='evento'&&x.date===d)out.push({id:'edu:'+x.id,title:'⭐ '+x.title,date:d,time:x.time||'',who:x.who,place:x.place||'',note:x.note||'',edu:true});
  if(x.type==='livro'&&x.due===d)out.push({id:'edu:'+x.id,title:'📚 Acabar o livro '+x.title,date:d,time:'',who:x.who,place:'',note:x.author||'',edu:true})});return out}
function eduStudent(){const st=students();const f=S.eduWho&&st.find(m=>m.id===S.eduWho);return f?f.id:'all'}
function eduMine(x){const w=eduStudent();return w==='all'?true:whoList(x.who).includes(w)}
function eduProposals(){
  const dis=new Set(lsJSON('fam.eduDis',[])),out=[],lim=parse(TODAY);lim.setDate(lim.getDate()+21);const L=iso(lim);
  const has=(who,subj,d)=>(S.edu||[]).some(x=>x.type==='estudo'&&x.date===d&&whoList(x.who).includes(who)&&(x.subject||'').toLowerCase()===subj.toLowerCase());
  (S.tests||[]).filter(t=>t.date>TODAY&&t.date<=L&&eduMine(t)).forEach(t=>{const who=whoList(t.who)[0],n=t.kind==='exame'?5:t.kind==='trabalho'?3:3,dur=t.kind==='exame'?60:45;
    let k=0;for(let i=1;i<=n*2&&k<n;i++){const x=parse(t.date);x.setDate(x.getDate()-i);const d=iso(x);if(d<TODAY)break;if(dowMon(x)===6&&i>1)continue;
      const key='p|'+t.id+'|'+d;k++;if(dis.has(key)||has(who,t.subject,d))continue;
      out.push({key,who,subject:t.subject,date:d,time:t.studyTime||'18:00',dur,why:`${tkind(t)[1]} de ${t.subject}: ${niceDate(t.date)}`})}});
  (S.edu||[]).filter(b=>b.type==='livro'&&b.due&&b.due>TODAY&&eduMine(b)&&(+b.pages||0)>(+b.read||0)).forEach(b=>{const days=daysTo(b.due),left=(+b.pages)-(+b.read||0),per=Math.ceil(left/Math.max(1,days));
    const key='l|'+b.id+'|'+TODAY;if(dis.has(key))return;out.push({key,book:b.id,who:whoList(b.who)[0],subject:'Leitura · '+b.title,date:TODAY,time:'21:00',dur:20,per,days:Math.min(days,14),why:`Faltam ${left} páginas em ${days} dias: ${per} págs por dia`})});
  return out.sort((a,b)=>a.date.localeCompare(b.date))}
function acceptProposal(p){
  if(p.book){for(let i=0;i<p.days;i++){const x=parse(TODAY);x.setDate(x.getDate()+i);addStudy({who:[p.who],subject:p.subject,date:iso(x),time:p.time,dur:p.dur,note:p.per+' páginas'})}}
  else addStudy({who:[p.who],subject:p.subject,date:p.date,time:p.time,dur:p.dur,note:p.why});
  dismissProposal(p.key)}
function dismissProposal(k){const d=lsJSON('fam.eduDis',[]);d.push(k);lsSet('fam.eduDis',JSON.stringify(d.slice(-500)))}
function addStudy(o){const id=uid();const rec={type:'estudo',done:false,...o};save('edu',id,rec);mirrorG('edu',id,rec,eduEv(rec));
  if(o.time&&o.date>=TODAY)save('reminders',id+'-r',{text:(member(o.who[0])?member(o.who[0]).name+': ':'')+'estudar '+o.subject+(o.dur?' ('+o.dur+' min)':'')+(o.note?' · '+o.note:''),date:o.date,time:o.time,who:o.who,alarm:true,eduId:id,done:false})}
function removeEdu(id){unmirrorG((S.edu||[]).find(x=>x.id===id));remove('edu',id);S.reminders.filter(r=>r.eduId===id).forEach(r=>remove('reminders',r.id))}
function viewEdu(seg,wall){
  const st=students(),w=eduStudent();
  const chips=`<div class="who" style="flex-wrap:wrap">${st.length>1?`<button class="chip" data-eduwho="all" aria-pressed="${w==='all'}">Todos</button>`:''}${st.map(m=>`<button class="chip" data-eduwho="${m.id}" aria-pressed="${w===m.id||st.length===1}"><span class="dot" style="--c:var(--${m.color})"></span>${esc(m.name)}</button>`).join('')}</div>`;
  if(!st.length)return `<section class="panel">${seg||''}<h2>Educação</h2><div class="empty">Ainda não há estudantes. Em Configuração → A família, marca quem é <b>Estudante</b>.</div></section>`;
  const tests=(S.tests||[]).filter(t=>t.date>=TODAY&&eduMine(t)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
  const lim=parse(TODAY);lim.setDate(lim.getDate()+14);const L=iso(lim);
  const study=(S.edu||[]).filter(x=>x.type==='estudo'&&x.date>=TODAY&&x.date<=L&&eduMine(x)).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
  const books=(S.edu||[]).filter(x=>x.type==='livro'&&!x.finished&&eduMine(x));
  const evs=(S.edu||[]).filter(x=>x.type==='evento'&&x.date>=TODAY&&eduMine(x)).sort((a,b)=>a.date.localeCompare(b.date));
  const props=eduProposals();S._props=props;
  const when=(d,t)=>{const n=daysTo(d);return (n===0?'Hoje':n===1?'Amanhã':niceDate(d))+(t?' · '+t:'')};
  const card=(title,add,body)=>`<div class="edu-card"><div class="row" style="align-items:center"><h3>${title}</h3><span class="spacer"></span>${S.readOnly?'':add}</div>${body}</div>`;
  return `<section class="panel edu">${seg||''}
    <div class="row" style="align-items:center;flex-wrap:wrap;gap:10px"><h2 style="margin:0">Educação</h2><span class="spacer"></span>${chips}</div>
    ${props.length?card(`💡 Propostas <small class="muted">(${props.length})</small>`,'<button class="ghost" data-propall>Aceitar todas</button>',`<div class="list">${props.slice(0,8).map((p,i)=>`<div class="item"><span class="time">${esc(p.time)}</span><span class="body"><span class="kind">${when(p.date)} · ${p.dur} min</span><div class="t">${p.book?'Ler '+p.per+' págs por dia':'Estudar '+esc(p.subject)}</div><div class="sub">${esc(p.why)}</div><div class="people">${peopleTags([p.who])}</div></span>
      <span class="row" style="gap:6px"><button class="addbtn" data-propok="${i}">Pôr no calendário</button><button class="edit" data-propno="${i}" aria-label="Ignorar">✕</button></span></div>`).join('')}</div>`):''}
    <div class="edu-grid">
    ${card('📝 Testes e exames','<button class="addbtn" data-new="test">+ Marcar</button>',`<div class="list">${tests.map(t=>`<button class="item" data-edit-test="${t.id}"><span class="time">${daysTo(t.date)===0?'Hoje':daysTo(t.date)===1?'Amanhã':daysTo(t.date)+' dias'}</span><span class="body"><span class="kind">${tkind(t)[0]} ${tkind(t)[1]} · ${when(t.date,t.time)}</span><div class="t">${esc(t.subject)}</div>${t.note?`<div class="sub">${esc(t.note)}</div>`:''}<div class="people">${peopleTags(t.who)}</div></span></button>`).join('')||'<div class="empty">Sem testes nem exames marcados.</div>'}</div>`)}
    ${card('✏️ Estudo (próximas 2 semanas)','<button class="addbtn" data-edunew="estudo">+ Sessão</button>',`<div class="list">${study.map(x=>`<div class="item ${x.done?'done':''}"><button class="check" role="checkbox" aria-checked="${!!x.done}" data-edudone="${x.id}" aria-label="Feito"></button><span class="body"><span class="kind">${when(x.date,x.time)}${x.dur?' · '+x.dur+' min':''}</span><div class="t">${esc(x.subject||x.title||'')}</div>${x.note?`<div class="sub">${esc(x.note)}</div>`:''}<div class="people">${peopleTags(x.who)}</div></span><button class="edit" data-eduedit="${x.id}">Editar</button></div>`).join('')||'<div class="empty">Sem sessões de estudo. Usa as propostas ou + Sessão.</div>'}</div>`)}
    ${card('📚 Livros','<button class="addbtn" data-edunew="livro">+ Livro</button>',`<div class="list">${books.map(b=>{const pct=b.pages?Math.min(100,Math.round((+b.read||0)/(+b.pages)*100)):0;return `<div class="item"><span class="body"><span class="kind">${b.due?'Acabar até '+niceDate(b.due):'Sem prazo'}${b.author?' · '+esc(b.author):''}</span><div class="t">${esc(b.title)}</div>
      ${b.pages?`<div class="edu-bar"><i style="width:${pct}%"></i></div><div class="sub">${+b.read||0} de ${b.pages} páginas (${pct}%)</div>`:''}<div class="people">${peopleTags(b.who)}</div></span>
      <span class="row" style="gap:6px;flex-wrap:wrap">${b.pages?`<button class="ghost" data-edupg="${b.id}|10">+10 págs</button>`:''}<button class="edit" data-eduedit="${b.id}">Editar</button></span></div>`}).join('')||'<div class="empty">Sem livros para ler.</div>'}</div>`)}
    ${card('⭐ Eventos especiais','<button class="addbtn" data-edunew="evento">+ Evento</button>',`<div class="list">${evs.map(x=>`<button class="item" data-eduedit="${x.id}"><span class="time">${daysTo(x.date)===0?'Hoje':daysTo(x.date)===1?'Amanhã':daysTo(x.date)+' dias'}</span><span class="body"><span class="kind">${when(x.date,x.time)}${x.place?' · '+esc(x.place):''}</span><div class="t">${esc(x.title)}</div>${x.note?`<div class="sub">${esc(x.note)}</div>`:''}<div class="people">${peopleTags(x.who)}</div></span></button>`).join('')||'<div class="empty">Visitas de estudo, apresentações, reuniões de pais, festas da escola…</div>'}</div>`)}
    </div></section>`}
function eduForm(type,x){
  const st=students(),w=eduStudent(),def=w!=='all'?w:(st[0]&&st[0].id);
  x=x||{type,who:[def],date:TODAY,time:type==='estudo'?'18:00':'',dur:45};type=x.type;
  const who=whoList(x.who)[0]||def;
  const sel=`<label class="field"><span>Aluno</span><select name="who" id="e-who">${st.map(m=>`<option value="${m.id}" ${who===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label>`;
  const titles={estudo:'Sessão de estudo',livro:'Livro',evento:'Evento especial'};
  let inner=sel;
  if(type==='estudo')inner+=`<label class="field"><span>Disciplina</span><input name="subject" list="e-subj" value="${esc(x.subject||'')}" placeholder="Ex.: Matemática"><datalist id="e-subj">${subjectsOf(who).map(s=>`<option value="${esc(s)}">`).join('')}</datalist></label>
    <div class="two"><label class="field"><span>Dia</span><input type="date" name="date" value="${esc(x.date||TODAY)}"></label><label class="field"><span>Hora</span><input type="time" name="time" value="${esc(x.time||'18:00')}"></label></div>
    <div class="two"><label class="field"><span>Duração (min)</span><input type="number" name="dur" min="5" max="240" value="${esc(x.dur||45)}"></label><label class="field"><span>Notas</span><input name="note" value="${esc(x.note||'')}" placeholder="Ex.: exercícios págs. 40–45"></label></div>`;
  if(type==='livro')inner+=`<label class="field"><span>Título</span><input name="title" value="${esc(x.title||'')}" placeholder="Ex.: O Principezinho"></label>
    <label class="field"><span>Autor</span><input name="author" value="${esc(x.author||'')}"></label>
    <div class="two"><label class="field"><span>Acabar até</span><input type="date" name="due" value="${esc(x.due||'')}"></label><label class="field"><span>Páginas</span><input type="number" name="pages" min="0" value="${esc(x.pages||'')}"></label></div>
    <div class="two"><label class="field"><span>Páginas lidas</span><input type="number" name="read" min="0" value="${esc(x.read||0)}"></label><label class="prof-chk"><input type="checkbox" name="finished" ${x.finished?'checked':''}> Já acabou</label></div>`;
  if(type==='evento')inner+=`<label class="field"><span>O quê</span><input name="title" value="${esc(x.title||'')}" placeholder="Ex.: Visita de estudo ao Oceanário"></label>
    <div class="two"><label class="field"><span>Dia</span><input type="date" name="date" value="${esc(x.date||TODAY)}"></label><label class="field"><span>Hora</span><input type="time" name="time" value="${esc(x.time||'')}"></label></div>
    <label class="field"><span>Onde</span><input name="place" value="${esc(x.place||'')}"></label>
    <label class="field"><span>Levar / notas</span><input name="note" value="${esc(x.note||'')}" placeholder="Ex.: lanche, autorização assinada, 5 €"></label>
    <label class="prof-chk"><input type="checkbox" name="eve" ${x.eve!==false?'checked':''}> Aviso na véspera às 20:00</label>`;
  sheet(x.id?titles[type]:'Novo: '+titles[type].toLowerCase(),inner,{onSave:f=>{
    const o={type,who:[val(f,'who')]};
    if(type==='estudo'){o.subject=val(f,'subject');if(!o.subject){toast('Escreve a disciplina');return false}Object.assign(o,{date:val(f,'date')||TODAY,time:val(f,'time'),dur:+val(f,'dur')||45,note:val(f,'note'),done:!!x.done})}
    if(type==='livro'){o.title=val(f,'title');if(!o.title){toast('Escreve o título');return false}Object.assign(o,{author:val(f,'author'),due:val(f,'due'),pages:+val(f,'pages')||0,read:+val(f,'read')||0,finished:!!f.elements.finished.checked})}
    if(type==='evento'){o.title=val(f,'title');if(!o.title){toast('Escreve o evento');return false}Object.assign(o,{date:val(f,'date')||TODAY,time:val(f,'time'),place:val(f,'place'),note:val(f,'note'),eve:!!f.elements.eve.checked})}
    if(x.id){o.gId=x.gId||'';o.gCal=x.gCal||'';save('edu',x.id,o);S.reminders.filter(r=>r.eduId===x.id).forEach(r=>remove('reminders',r.id))}
    const id=x.id||uid();if(!x.id)save('edu',id,o);if(eduEv(o))mirrorG('edu',id,o,eduEv(o));
    const nm=member(o.who[0])?member(o.who[0]).name+': ':'';
    if(type==='estudo'&&o.time&&o.date>=TODAY)save('reminders',id+'-r',{text:nm+'estudar '+o.subject+' ('+o.dur+' min)'+(o.note?' · '+o.note:''),date:o.date,time:o.time,who:o.who,alarm:true,eduId:id,done:false});
    if(type==='evento'&&o.eve){const v=parse(o.date);v.setDate(v.getDate()-1);if(iso(v)>=TODAY)save('reminders',id+'-eve',{text:nm+'amanhã: '+o.title+(o.place?' ('+o.place+')':'')+(o.note?' · levar: '+o.note:''),date:iso(v),time:'20:00',who:o.who,alarm:true,eduId:id,done:false})}
    toast('Guardado')},onDelete:x.id&&!S.readOnly?()=>removeEdu(x.id):null});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-eduwho],[data-edunew],[data-eduedit],[data-edudone],[data-edupg],[data-propok],[data-propno],[data-propall]');if(!b)return;const d=b.dataset;
  const rr=()=>{S.wall?renderWall():render()};
  if(d.eduwho){S.eduWho=d.eduwho;rr();return}
  if(d.edunew){eduForm(d.edunew);return}
  if(d.eduedit){const x=(S.edu||[]).find(y=>y.id===d.eduedit);if(x)eduForm(x.type,x);return}
  if(d.edudone){const x=(S.edu||[]).find(y=>y.id===d.edudone);if(x){const{id,...r}=x;save('edu',id,{...r,done:!x.done})}return}
  if(d.edupg){const[id,n]=d.edupg.split('|'),x=(S.edu||[]).find(y=>y.id===id);if(x){const{id:_,...r}=x;const read=Math.min(+x.pages||1e9,(+x.read||0)+(+n));save('edu',id,{...r,read,finished:x.pages&&read>=x.pages});if(x.pages&&read>=x.pages)toast('Livro acabado! 🎉')}return}
  if(d.propok){const p=(S._props||[])[+d.propok];if(p){acceptProposal(p);toast('Posto no calendário');setTimeout(rr,300)}return}
  if(d.propno){const p=(S._props||[])[+d.propno];if(p){dismissProposal(p.key);rr()}return}
  if(d.propall!==undefined){(S._props||[]).forEach(acceptProposal);toast('Propostas postas no calendário');setTimeout(rr,300);return}
});

/* ---------- Só calendários do Google ---------- */
function gOnly(){return !!S.gOnly}
function famCal(){return S.famCal||''}
function memCal(id){const m=member(id);return m?(m.gcal||m.email||''):''}
function calFor(who){const w=whoList(who).filter(x=>x!=='all'&&member(x));if(whoList(who).includes('all')||w.length!==1)return famCal()||'primary';return memCal(w[0])||famCal()||'primary'}
function addMinutes(hm,n){const[h,m]=hm.split(':').map(Number);const t=h*60+m+n;return pad(Math.floor(t/60)%24)+':'+pad(t%60)}
function gInput(o){const allDay=!o.time;const inp={summary:o.title,calendarId:o.cal||'primary',allDay,description:o.desc||''};
  if(allDay){const e=parse(o.endDate||o.date);e.setDate(e.getDate()+1);inp.startTime=o.date+'T00:00:00';inp.endTime=iso(e)+'T00:00:00'}
  else{const end=o.end&&o.end>o.time?o.end:addMinutes(o.time,o.dur||60);inp.startTime=o.date+'T'+o.time+':00';inp.endTime=(o.endDate||o.date)+'T'+end+':00'}
  if(o.place)inp.location=o.place;if(o.rrule)inp.recurrenceData=[o.rrule];if(o.noRem)inp.noReminders=true;if(o.props)inp.props=o.props;return inp}
// Eventos em calendários partilhados (Família, calendário de outra pessoa…) ficam sempre sem notificações.
// Só o calendário principal de quem está a usar o Quadro mantém as notificações normais.
function gShared(cal){if(!cal||cal==='primary')return false;const me=myEmail();return !(me&&normMail(cal)===me)}
async function gCreate(o){if(gShared(o.cal))o={...o,noRem:true};const r=await S.mcp.callTool(GSERVER,'create_event',gInput(o));const p=r.payload||{};return p.id||''}
async function gCreateSafe(o,who){ // tenta no calendário da pessoa; se não tiver acesso, usa o calendário Família
  {const w=whoList(who).filter(x=>member(x));if(o.cal===famCal()&&w.length===1&&!whoList(who).includes('all'))o={...o,desc:'Para: '+member(w[0]).name+(o.desc?'\n'+o.desc:'')}}
  try{return {id:await gCreate(o),cal:o.cal}}catch(e){const fc=famCal();if(!fc||fc===o.cal)throw e;
    const names=whoList(who).filter(x=>member(x)).map(x=>member(x).name).join(', ');
    const w1=whoList(who).filter(x=>member(x));const id=await gCreate({...o,cal:fc,desc:(w1.length===1?'Para: '+member(w1[0]).name+'\n':'')+(o.desc||''),title:o.title+(names&&w1.length!==1?' ('+names+')':'')});return {id,cal:fc,fallback:true}}}
async function gUpdate(cal,id,o){const inp=gInput({...o,cal});inp.eventId=id;delete inp.recurrenceData;delete inp.noReminders;return S.mcp.callTool(GSERVER,'update_event',inp)}
async function gDelete(cal,id){return S.mcp.callTool(GSERVER,'delete_event',{calendarId:cal,eventId:id})}
async function ensureSynced(cal,who){if(!cal||cal==='primary'||!S.me||!S.me.memberId)return;const me=S.me;if((me.cals||{})[cal]&&me.cals[cal]!=='off')return;
  const w=whoList(who).filter(x=>member(x));const owner=whoList(who).includes('all')||w.length!==1||cal===famCal()?'all':w[0];
  await saveMyProfile({...me,cals:{...(me.cals||{}),[cal]:'show'},calMember:{...(me.calMember||{}),[cal]:owner===me.memberId?'':owner},calNames:{...(me.calNames||{}),[cal]:cal===famCal()?'Família':(member(owner)?member(owner).name:cal)},extra:[...(me.extra||[]).filter(x=>x.id!==cal),{id:cal,name:cal===famCal()?'Família':(member(owner)?member(owner).name:cal)}]})}
function resyncSoon(){setTimeout(()=>{S.gbusy=0;syncGoogle(S.me,false)},1500)}
function needGoogle(){if(!S.mcp){toast('O Google Calendar não está ligado neste Quadro.');return true}allowGooglePrompt();return false}
function isSchoolG(x,m){if(x.q==='school')return true;const mm=member(m);return !!(mm&&mm.student&&x.r&&x.h&&x.h>='07:00'&&x.h<='19:00'&&x.ci&&(x.ci===mm.email||x.ci===mm.gcal))}

/* formulário de evento (vai direto para o Google) */
function gEventForm(pre){
  pre=pre||{};const t=pre.kind||'evento';
  const e={title:'',date:S.sel||TODAY,time:'',end:'',endDate:'',place:'',note:'',repeat:'none',who:S.filter==='all'||typeof S.filter!=='string'?['all']:[S.filter],...pre};
  const titles={evento:'Novo evento',aniv:'Novo aniversário',ferias:'Novas férias'};
  sheet(titles[t]||'Novo evento',`
    <label class="field"><span>${t==='aniv'?'De quem é o aniversário':'O quê'}</span><input id="g-title" name="title" value="${esc(e.title)}" placeholder="${t==='aniv'?'Ex.: Avó Rosa':t==='ferias'?'Ex.: Férias no Algarve':'Ex.: Consulta no dentista'}"></label>
    <div class="two"><label class="field"><span>${t==='ferias'?'Início':'Dia'}</span><input type="date" name="date" value="${esc(e.date)}"></label>
    ${t==='ferias'?`<label class="field"><span>Fim</span><input type="date" name="endDate" value="${esc(e.endDate||e.date)}"></label>`:t==='aniv'?`<label class="field"><span>Ano de nascimento (opcional)</span><input type="number" name="year" min="1900" max="2100"></label>`:`<label class="field"><span>Hora (vazio = dia todo)</span><input type="time" name="time" value="${esc(e.time)}"></label>`}</div>
    ${t==='evento'?`<div class="two"><label class="field"><span>Até às</span><input type="time" name="end" value="${esc(e.end)}"></label>
      <label class="field"><span>Repete</span><select name="repeat">${[['none','Não'],['weekly','Todas as semanas'],['monthly','Todos os meses'],['yearly','Todos os anos']].map(([v,l])=>`<option value="${v}" ${e.repeat===v?'selected':''}>${l}</option>`).join('')}</select></label></div>
      <label class="field"><span>Onde</span><input name="place" value="${esc(e.place)}"></label>`:''}
    ${whoField(e.who)}
    <label class="field"><span>Notas</span><input name="note" value="${esc(e.note)}"></label>
    <p class="muted small" style="margin:0">Fica no Google Calendar ${'da pessoa escolhida'}; se for para várias pessoas ou para todos, fica no calendário Família.</p>`,
  {saveLabel:'Guardar no Google',onSave:f=>{const title=val(f,'title');if(!title){toast('Escreve o nome.');return false}if(needGoogle())return false;
    const who=readWho(f),date=val(f,'date')||TODAY;let o={title,date,place:val(f,'place'),desc:val(f,'note'),cal:calFor(who)};
    if(t==='evento'){o.time=val(f,'time');o.end=val(f,'end');const rr={weekly:'RRULE:FREQ=WEEKLY',monthly:'RRULE:FREQ=MONTHLY',yearly:'RRULE:FREQ=YEARLY'}[val(f,'repeat')];if(rr)o.rrule=rr}
    if(t==='ferias'){o.endDate=val(f,'endDate')||date;o.title='✈ '+title;o.props={quadro:'ferias'}}
    if(t==='aniv'){const y=val(f,'year');o.title='🎂 '+title+(y?' ('+y+')':'');o.rrule='RRULE:FREQ=YEARLY';o.props={quadro:'aniv'};o.cal=famCal()||o.cal}
    (async()=>{try{const r=await gCreateSafe(o,who);await ensureSynced(r.cal,who);toast(r.fallback?'Guardado no calendário Família (sem acesso ao calendário da pessoa)':'Guardado no Google Calendar');resyncSoon()}catch(err){toast(gErr(err))}})();
    S.sel=date;S.month=date.slice(0,7)}});
}
/* editar evento do Google */
function gEditForm(key){const f0=findGev(key);if(!f0)return;const {src,x}=f0;
  sheet('Editar no Google',`<label class="field"><span>O quê</span><input name="title" value="${esc(x.t)}"></label>
    <div class="two"><label class="field"><span>Dia</span><input type="date" name="date" value="${esc(x.d)}"></label><label class="field"><span>Hora (vazio = dia todo)</span><input type="time" name="time" value="${esc(x.h||'')}"></label></div>
    <div class="two"><label class="field"><span>Até às</span><input type="time" name="end" value="${esc(x.he||'')}"></label><label class="field"><span>Onde</span><input name="place" value="${esc(x.p||'')}"></label></div>
    ${x.r?'<p class="muted small" style="margin:0">É um evento que se repete: a alteração vale só para este dia.</p>':''}`,
  {saveLabel:'Guardar no Google',onSave:f=>{if(needGoogle())return false;const o={title:val(f,'title')||x.t,date:val(f,'date')||x.d,time:val(f,'time'),end:val(f,'end'),place:val(f,'place')};
    if(!o.time&&x.e&&x.e!==x.d)o.endDate=x.e;
    (async()=>{try{await gUpdate(x.ci,x.i,o);toast('Alterado no Google Calendar');resyncSoon()}catch(err){toast(gErr(err))}})()}});
}
/* espelhar testes e Educação no Google */
async function mirrorG(col,id,o,ev){if(!gOnly()||!S.mcp)return;
  try{const cal=o.gCal||calFor(o.who);
    if(o.gId){await gUpdate(cal,o.gId,ev);}
    else{const r=await gCreateSafe({...ev,cal,noRem:true},o.who);await save(col,id,{...o,gId:r.id,gCal:r.cal});await ensureSynced(r.cal,o.who)}
    resyncSoon()}catch(e){console.warn('Google',e);toast('Não foi possível pôr no Google: '+gErr(e))}}
async function unmirrorG(o){if(o&&o.gId&&S.mcp){try{await gDelete(o.gCal||calFor(o.who),o.gId);resyncSoon()}catch(e){}}}
function testEv(t){return {title:tkind(t)[0]+' '+tkind(t)[1]+' de '+t.subject,date:t.date,time:t.time||'',dur:60,desc:t.note||'',props:{quadro:'teste'}}}
function eduEv(x){if(x.type==='estudo')return {title:'✏️ Estudar '+(x.subject||''),date:x.date,time:x.time||'',dur:x.dur||45,desc:x.note||'',props:{quadro:'estudo'}};
  if(x.type==='evento')return {title:'⭐ '+x.title,date:x.date,time:x.time||'',place:x.place||'',desc:x.note||'',props:{quadro:'evento'}};
  if(x.type==='livro'&&x.due)return {title:'📚 Acabar o livro '+x.title,date:x.due,time:'',props:{quadro:'livro'}};return null}

/* migração: passar tudo do Quadro para o Google */
async function migrateSheet(){
  if(!S.mcp){toast('Liga primeiro o Google Calendar.');return}
  allowGooglePrompt();
  let cals=[];try{cals=(await fetchCals()).filter(c=>c.accessRole==='owner'||c.accessRole==='writer')}catch(e){toast(gErr(e));return}
  const fams=cals.filter(c=>/fam[ií]lia/i.test(c.summary||''));
  const fc=famCal()||(fams[0]&&fams[0].id)||'';
  const opt=(sel,extra)=>`${extra||''}${cals.map(c=>`<option value="${esc(c.id)}" ${sel===c.id?'selected':''}>${esc(c.summary||c.id)}${c.primary?' (principal)':''}</option>`).join('')}`;
  const plan=migPlan();
  const f=sheet('Passar tudo para o Google',`
    <p class="muted small" style="margin:0">Os eventos, aniversários, férias, testes e a Educação passam a ser eventos no Google Calendar. Lembretes, tarefas, compras e rotinas ficam no Quadro. No fim, o Quadro mostra só os calendários do Google.</p>
    <div class="field"><span>A passar</span><p style="margin:0"><b>${plan.events.length}</b> eventos (${plan.dups} já existem no Google e não se repetem) · <b>${plan.bdays.length}</b> aniversários · <b>${plan.vacs.length}</b> férias · <b>${plan.tests.length}</b> testes · <b>${plan.edu.length}</b> de Educação</p></div>
    <label class="field"><span>Calendário Família (eventos de todos, aniversários e férias)</span><select name="fam">${opt(fc,'<option value="">Escolher…</option>')}</select></label>
    <div class="field"><span>Calendário de cada pessoa</span>${S.members.map(m=>{const cur=m.gcal||(cals.find(c=>c.id===m.email)?m.email:'');return `<label class="row" style="gap:8px;align-items:center;margin:4px 0"><span style="width:110px;font-weight:600">${esc(m.name)}</span><select name="mc_${m.id}" style="flex:1">${opt(cur,'<option value="">Calendário Família</option>')}</select></label>`}).join('')}
      <p class="muted small" style="margin:4px 0 0">Só aparecem calendários onde podes escrever. Para usar o calendário de outra pessoa, ela tem de o partilhar contigo com "Fazer alterações a eventos".</p></div>
    <div id="mig-log" class="small muted"></div>`,{saveLabel:'Passar agora',onSave:f=>{const famId=val(f,'fam');if(!famId){toast('Escolhe o calendário Família');return false}
      const mc={};S.members.forEach(m=>mc[m.id]=val(f,'mc_'+m.id));runMigration(famId,mc);}});
}
function migPlan(){
  const g=Object.values(S.gcal||{}).flatMap(d=>(d.events||[]).map(x=>({...x})));
  const wd=d=>dowMon(parse(d));
  const dup=e=>{const w=whoList(e.who).filter(x=>member(x));if(!e.time)return false;
    return g.some(x=>x.h===e.time&&(w.includes(x.m)||!w.length)&&(e.repeat==='weekly'?wd(x.d)===wd(e.date)&&x.d>=e.date:x.d===e.date))};
  const evs=S.events.filter(e=>e.date),dupL=evs.filter(dup);
  return {events:evs.filter(e=>!dup(e)),dupList:dupL,dups:dupL.length,bdays:S.birthdays,vacs:S.vacations,tests:(S.tests||[]).filter(t=>!t.gId&&t.date>=TODAY),edu:(S.edu||[]).filter(x=>!x.gId&&eduEv(x)&&(x.date||x.due||'')>=TODAY)}
}
async function runMigration(famId,mc){
  S.famCal=famId;const fam=S.members.map(m=>({...m,gcal:mc[m.id]||''}));await saveMembers(fam);S.members=fam;
  try{await S.db.doc('config/gonly').set({famCal:famId,on:false,at:new Date().toISOString()})}catch(e){}
  const plan=migPlan();let ok=0,fail=[],n=0;const total=plan.events.length+plan.bdays.length+plan.vacs.length+plan.tests.length+plan.edu.length;
  const prog=()=>toast(`A passar para o Google… ${n} de ${total}`);
  const yEnd=d=>{const y=+d.slice(0,4)+(+d.slice(5,7)>=7?1:0);return y+'0630T235959Z'};
  // ver o que já existe nos calendários de destino, para não duplicar (ex.: o horário do Tiago)
  const exist=new Set(),[from,to]=syncWindow();toast('A verificar o que já está no Google…');
  for(const cal of new Set([famId,...Object.values(mc).filter(Boolean)])){try{let tok,k=0;do{const r=await S.mcp.callTool(GSERVER,'list_events',{calendarId:cal,startTime:from,endTime:to,pageSize:250,...(tok?{pageToken:tok}:{})},{cache:false});const p=r.payload||{};
    (p.events||[]).forEach(ev=>{const x=toEv(ev,'show','');if(x&&x.h){exist.add(cal+'|w'+dowMon(parse(x.d))+'|'+x.h);exist.add(cal+'|'+x.d+'|'+x.h)}});tok=p.nextPageToken;k++}while(tok&&k<6)}catch(e){}}
  let dupG=0;
  for(const e of plan.events){n++;if(n%5===0)prog();
    {const cal=calFor(e.who);if(e.time&&(e.repeat==='weekly'?exist.has(cal+'|w'+dowMon(parse(e.date))+'|'+e.time):exist.has(cal+'|'+e.date+'|'+e.time))){await remove('events',e.id);dupG++;continue}}
    const school=!!e.school,end=schoolEnd(e);
    const rr={weekly:'RRULE:FREQ=WEEKLY'+(school?';UNTIL='+yEnd(e.date):''),monthly:'RRULE:FREQ=MONTHLY',yearly:'RRULE:FREQ=YEARLY'}[e.repeat];
    const o={title:e.title,date:e.date,time:e.time||'',end:end||'',place:e.place||'',desc:school?'':(e.note||''),rrule:rr,noRem:school,props:school?{quadro:'school'}:{quadro:'evento'},cal:calFor(e.who)};
    try{await gCreateSafe(o,e.who);await remove('events',e.id);ok++}catch(err){fail.push(e.title+': '+gErr(err))}}
  for(const e of plan.dupList)await remove('events',e.id);
  for(const b of plan.bdays){n++;const y=new Date().getFullYear();let d=y+'-'+b.md;if(d<TODAY)d=(y+1)+'-'+b.md;
    try{await gCreate({title:'🎂 '+b.name+(b.year?' ('+b.year+')':''),date:d,time:'',rrule:'RRULE:FREQ=YEARLY',props:{quadro:'aniv'},cal:famId});await remove('birthdays',b.id);ok++}catch(err){fail.push(b.name+': '+gErr(err))}}
  for(const v of plan.vacs){n++;
    try{await gCreateSafe({title:'✈ '+v.title,date:v.start,endDate:v.end||v.start,time:'',place:v.place||'',props:{quadro:'ferias'},cal:calFor(v.who)},v.who);await remove('vacations',v.id);ok++}catch(err){fail.push(v.title+': '+gErr(err))}}
  for(const t of plan.tests){n++;try{const r=await gCreateSafe({...testEv(t),cal:calFor(t.who),noRem:true},t.who);await save('tests',t.id,{...t,gId:r.id,gCal:r.cal});ok++}catch(err){fail.push(t.subject+': '+gErr(err))}}
  for(const x of plan.edu){n++;try{const r=await gCreateSafe({...eduEv(x),cal:calFor(x.who),noRem:true},x.who);await save('edu',x.id,{...x,gId:r.id,gCal:r.cal});ok++}catch(err){fail.push((x.title||x.subject)+': '+gErr(err))}}
  // garantir que os calendários usados sincronizam
  const used=new Set([famId,...Object.values(mc).filter(Boolean)]);
  for(const c of used){const mid=Object.keys(mc).find(k=>mc[k]===c);await ensureSynced(c,mid?[mid]:['all'])}
  const done=!fail.length;
  try{await S.db.doc('config/gonly').set({famCal:famId,on:done||ok>0,at:new Date().toISOString()})}catch(e){}
  S.gOnly=done||ok>0;resyncSoon();render();
  sheet('Resultado',`<p><b>${ok}</b> de ${total} passaram para o Google${plan.dups+dupG?` · ${plan.dups+dupG} já existiam no Google e foram só apagados do Quadro`:''}.</p>${fail.length?`<p class="muted small">Não passaram (ficam no Quadro; podes tentar outra vez):</p><ul class="small">${fail.slice(0,30).map(x=>'<li>'+esc(x)+'</li>').join('')}</ul>`:'<p>O Quadro mostra agora só os calendários do Google.</p>'}`);
}

function groupSchoolG(gs,d){if(!gOnly())return gs;const sc={},rest=[];
  gs.forEach(g=>{if(g.mid!=='all'&&g.h&&g.d===d&&isSchoolG(g,g.mid)){const s=sc[g.mid]||(sc[g.mid]={h:g.h,he:g.he||g.h});if(g.h<s.h)s.h=g.h;if((g.he||'')>s.he)s.he=g.he}else rest.push(g)});
  return [...Object.entries(sc).map(([m,s])=>({t:'Escola',d,e:d,h:s.h,he:s.he,mid:m,src:m,i:'',c:'Escola',p:''})),...rest]}

function memberByName(n){n=String(n||'').trim().toLowerCase();if(!n)return null;if(n==='todos'||n==='família'||n==='familia')return {id:'all'};return S.members.find(m=>(m.name||'').trim().toLowerCase()===n)||S.members.find(m=>(m.name||'').toLowerCase().split(/\s+/)[0]===n.split(/\s+/)[0])||null}

/* marca com "Google" o que vai ficar no Google Calendar */
var GBADGE='<span class="gbadge" title="Fica no Google Calendar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>Google</span>';
function gMark(){if(!gOnly())return;
  document.querySelectorAll('[data-new="event"],[data-new="birthday"],[data-new="vacation"],[data-new="test"],[data-edunew],[data-propok],[data-propall]').forEach(b=>{if(!b.querySelector('.gbadge'))b.insertAdjacentHTML('beforeend',GBADGE)});
  const h=document.querySelector('#overlay .sheet h2');
  if(h&&!h.querySelector('.gbadge')&&/^(Novo evento|Novo aniversário|Novas férias|Novo teste|Novo: |Teste|Exame|Trabalho|Apresentação|Sessão de estudo|Livro|Evento especial|Editar no Google|Evento do Google)/.test(h.textContent))h.insertAdjacentHTML('beforeend',' '+GBADGE)}
(function(){let t=null;new MutationObserver(()=>{if(t)return;t=requestAnimationFrame(()=>{t=null;try{gMark()}catch(e){}})}).observe(document.body,{childList:true,subtree:true})})();

/* ---------- Versículo do dia (YouVersion Platform) ---------- */
var YV_BASE='https://api.youversion.com/v1',VOTD=null,votdBusy=false;
function yvCfg(){return S.yv||{}}
function dayOfYear(d){const x=parse(d),s=new Date(x.getFullYear(),0,0);return Math.round((x-s)/864e5)}
async function yvGet(path){const k=yvCfg().key;if(!k)throw new Error('sem chave');const r=await fetch(YV_BASE+path,{headers:{'X-YVP-App-Key':k}});
  if(!r.ok){let m='';try{const j=await r.json();m=(j&&(j.message||j.error||j.detail))||''}catch(e){}const er=new Error(m||('erro '+r.status));er.status=r.status;throw er}return r.json()}
function stripHtml(h){const t=document.createElement('div');t.innerHTML=String(h||'');return (t.textContent||'').replace(/\s+/g,' ').trim()}
async function votdLoad(force){const c=yvCfg();if(!c.key||!c.bible||c.off)return;
  const key=TODAY+'|'+c.bible;if(!VOTD){const s=lsJSON('fam.votd',null);if(s&&s.key===key)VOTD=s}
  if(votdBusy||(!force&&VOTD&&VOTD.key===key))return;votdBusy=true;
  try{const v=await yvGet('/verse_of_the_days/'+dayOfYear(TODAY));const ref=v.passage_id||(v.passage&&v.passage.id)||v.reference||'';if(!ref)throw new Error('sem referência');
    const p=await yvGet('/bibles/'+encodeURIComponent(c.bible)+'/passages/'+encodeURIComponent(ref)+'?format=text');
    VOTD={key,ref:p.reference||ref,text:stripHtml(p.content||p.text||''),bible:c.bibleName||'',at:Date.now()};lsSet('fam.votd',JSON.stringify(VOTD));S.yvErr=''}
  catch(e){console.warn('YouVersion',e);S.yvErr=e.status===401||e.status===403?'A chave da YouVersion não foi aceite.':(e instanceof TypeError?'A YouVersion não respondeu (rede ou bloqueio do browser).':'Versículo indisponível: '+e.message)}
  votdBusy=false;if(S.wall&&S.wallView==='moldura'&&!overlay.innerHTML&&!S.dragging)renderWall()}
function votdWidget(){const c=yvCfg();if(!c.key||!c.bible||c.off)return '';votdLoad(false);
  if(!VOTD||VOTD.key!==TODAY+'|'+c.bible)return S.yvErr?`<div class="votd"><small>Versículo do dia</small><span class="muted">${esc(S.yvErr)}</span></div>`:'';
  return `<button class="votd" data-votd><small>📖 Versículo do dia</small><span class="votd-t">“${esc(VOTD.text)}”</span><b>${esc(VOTD.ref)}${VOTD.bible?' · '+esc(VOTD.bible):''}</b></button>`}
function yvSheet(){const c=yvCfg();
  const f=sheet('Versículo do dia (YouVersion)',`
    <p class="muted small" style="margin:0">Cria uma conta de programador gratuita em <a href="https://platform.youversion.com" target="_blank" rel="noopener">platform.youversion.com</a>, cria uma aplicação e copia a <b>App Key</b>. Uso não comercial.</p>
    <label class="field"><span>App Key</span><input name="key" value="${esc(c.key||'')}" placeholder="Cola aqui a chave" autocomplete="off" spellcheck="false"></label>
    <div class="field"><span>Bíblia em português</span><div class="row" style="gap:8px;flex-wrap:wrap"><select name="bible" style="flex:1;min-width:200px">${c.bible?`<option value="${esc(c.bible)}" selected>${esc(c.bibleName||c.bible)}</option>`:'<option value="">— procura primeiro —</option>'}</select><button type="button" class="ghost" data-yvfind>Procurar Bíblias</button></div>
      <label class="prof-chk"><input type="checkbox" name="all"> Incluir todas as versões do catálogo</label></div>
    <label class="prof-chk"><input type="checkbox" name="off" ${c.off?'checked':''}> Esconder o widget</label>
    <div id="yv-msg" class="small muted"></div>`,
  {saveLabel:'Guardar',onSave:f=>{const sel=f.elements.bible;const nc={key:val(f,'key'),bible:val(f,'bible'),bibleName:sel.selectedOptions[0]?sel.selectedOptions[0].textContent:'',off:!!f.elements.off.checked};
    S.yv=nc;VOTD=null;lsSet('fam.votd','');if(S.db)S.db.doc('config/youversion').set(nc).catch(handleWriteError);votdLoad(true);toast('Guardado')}});
  f.querySelector('[data-yvfind]').addEventListener('click',async()=>{const msg=f.querySelector('#yv-msg');const k=val(f,'key');if(!k){msg.textContent='Cola primeiro a App Key.';return}
    msg.textContent='A procurar…';const old=S.yv;S.yv={...(S.yv||{}),key:k};
    try{const j=await yvGet('/bibles?language_ranges[]=por'+(f.elements.all.checked?'&all_available=true':''));const arr=Array.isArray(j)?j:(j.data||j.bibles||j.items||[]);
      if(!arr.length){msg.textContent='Nenhuma Bíblia em português ativa para esta chave. Ativa uma no painel da YouVersion ou marca "Incluir todas".';return}
      f.elements.bible.innerHTML=arr.map(b=>{const nm=[b.abbreviation||b.local_abbreviation,b.title||b.local_title||b.name].filter(Boolean).join(' — ');return `<option value="${esc(b.id)}">${esc(nm||b.id)}</option>`}).join('');
      msg.textContent=arr.length+' versões encontradas. Escolhe uma e carrega em Guardar.'}
    catch(e){msg.textContent=e.status===401||e.status===403?'A chave não foi aceite.':e instanceof TypeError?'A YouVersion não respondeu ao browser (pode estar a bloquear pedidos diretos).':'Erro: '+e.message}
    finally{S.yv=old}});
}
document.addEventListener('click',e=>{if(e.target.closest('[data-votd]')){if(VOTD)sheet(VOTD.ref,`<p style="font-size:1.25rem;line-height:1.5;margin:0">“${esc(VOTD.text)}”</p><p class="muted">${esc(VOTD.bible||'')} · YouVersion</p>`)}});

/* ---------- Configuração da Moldura ---------- */

function fw(k){const v=(S.fw||{})[k];return v!==false}
function frameSheet(){
  const f=sheet('Moldura',`<div class="field"><span>Widgets</span>
    ${FW.map(([k,l,s])=>`<label class="cfg-tog"><span><b>${l}</b><small>${s}${k==='votd'&&!yvCfg().key?' · ainda não configurado':''}</small></span><input type="checkbox" role="switch" name="fw_${k}" ${fw(k)?'checked':''}></label>`).join('')}</div>
    <div class="cfg">
      <button type="button" class="cfg-it" data-fcfg="votd"><span class="cfg-ic">📖</span><span style="flex:1;min-width:0"><b>Versículo do dia</b><small>Chave da YouVersion e versão da Bíblia${yvCfg().key?' · ligado':''}</small></span><span class="fd-chev">›</span></button>
      <button type="button" class="cfg-it" data-fcfg="spotify"><span class="cfg-ic">♫</span><span style="flex:1;min-width:0"><b>Spotify</b><small>${(spCfg().items||[]).length?(spCfg().items.length)+' guardados':'Juntar playlists, álbuns ou podcasts'}</small></span><span class="fd-chev">›</span></button>
      <button type="button" class="cfg-it" data-fcfg="fotos"><span class="cfg-ic">🖼︎</span><span style="flex:1;min-width:0"><b>Fotografias e tempo entre fotografias</b><small>${S.photos.length} fotografias · ${photoSec()} s</small></span><span class="fd-chev">›</span></button>
      <button type="button" class="cfg-it" data-fcfg="tempo"><span class="cfg-ic">⛅</span><span style="flex:1;min-width:0"><b>Localidade do tempo</b><small>${esc(wxPlace().name)}</small></span><span class="fd-chev">›</span></button>
      <button type="button" class="cfg-it" data-fcfg="pos"><span class="cfg-ic">↺</span><span style="flex:1;min-width:0"><b>Repor a posição dos widgets</b><small>Voltam ao sítio original neste ecrã</small></span></button>
    </div>`,{saveLabel:'Guardar',onSave:f=>{const o={};FW.forEach(([k])=>o[k]=!!f.elements['fw_'+k].checked);S.fw=o;if(S.db)S.db.doc('config/frame').set(o).catch(handleWriteError);if(S.wall)renderWall();toast('Moldura atualizada')}});
  f.addEventListener('click',e=>{const b=e.target.closest('[data-fcfg]');if(!b)return;const k=b.dataset.fcfg;
    if(k==='votd')yvSheet();else if(k==='spotify')spSheet();else if(k==='fotos')wallSettings();else if(k==='tempo')wxSheet();else if(k==='pos'){lsSet('fam.wpos','{}');toast('Widgets repostos');if(S.wall)renderWall()}});
}

/* ---------- Casa: Shelly Cloud ---------- */

function shCfg(){return S.shelly||{}}
function shHost(){let h=(shCfg().host||'').trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'');return h}
async function shPost(path,params){const c=shCfg();if(!c.key||!shHost())throw new Error('Falta configurar a Shelly Cloud');
  const body=new URLSearchParams({...params,auth_key:c.key});
  let r;try{r=await fetch('https://'+shHost()+path,{method:'POST',body})}catch(e){const er=new Error('A Shelly Cloud não respondeu a este browser.');er.net=true;throw er}
  let j=null;try{j=await r.json()}catch(e){}
  if(!r.ok||(j&&j.isok===false)){const m=j&&j.errors?Object.values(j.errors).join(', '):('erro '+r.status);throw new Error(m)}
  return j&&j.data!==undefined?j.data:j}
async function shRefresh(force){if(SH.busy||(!force&&Date.now()-SH.at<8000))return;SH.busy=true;
  try{const d=await shPost('/device/all_status',{});const nw=(d&&d.devices_status)||{};const now=Date.now();Object.keys(SH.hold||{}).forEach(id=>{if(SH.hold[id]>now&&SH.st&&SH.st[id])nw[id]=SH.st[id]});SH.st=nw;SH.at=now;SH.err=''}catch(e){SH.err=e.message}
  SH.busy=false;if(S.wall&&S.wallView==='casa'&&!overlay.innerHTML)renderWall();else if(!S.wall&&S.tab==='casa')render()}
// lê o estado de um canal (Gen1 e Gen2)
function shState(dev){const s=SH.st&&SH.st[dev.id];if(!s)return null;const ch=+dev.channel||0;const o={online:s._dev_info?s._dev_info.online!==false:true};
  if(dev.type==='switch'){const g2=s['switch:'+ch];if(g2){o.on=!!g2.output;o.w=g2.apower}else if(s.relays&&s.relays[ch]){o.on=!!s.relays[ch].ison;o.w=s.meters&&s.meters[ch]?s.meters[ch].power:undefined}}
  if(dev.type==='cover'){const g2=s['cover:'+ch];if(g2){o.state=g2.state;o.pos=g2.current_pos}else if(s.rollers&&s.rollers[ch]){o.state=s.rollers[ch].state;o.pos=s.rollers[ch].current_pos}}
  if(dev.type==='sensor'){const t=s['temperature:0']||s.tmp||(s.temperature!=null?{tC:s.temperature}:null);if(t)o.t=t.tC!=null?t.tC:t.value;
    const h=s['humidity:0']||s.hum;if(h)o.h=h.rh!=null?h.rh:h.value;
    const dw=s['window:0']||s.sensor;if(dw)o.open=dw.open!=null?dw.open:(dw.state==='open');
    const b=s['devicepower:0']||s.bat;if(b)o.bat=b.battery?b.battery.percent:b.value;
    const em=s['em:0']||s['em1:0']||s['pm1:0'];if(em)o.w=em.total_act_power!=null?em.total_act_power:em.act_power!=null?em.act_power:em.apower}
  return o}
function shDiscover(st){const out=[];Object.entries(st||{}).forEach(([id,s])=>{
  const sw=Object.keys(s).filter(k=>/^switch:\d+$/.test(k));sw.forEach(k=>out.push({id,channel:+k.split(':')[1],type:'switch'}));
  if(!sw.length&&Array.isArray(s.relays)&&!(Array.isArray(s.rollers)&&s.rollers.length&&s.mode==='roller'))s.relays.forEach((r,i)=>out.push({id,channel:i,type:'switch'}));
  Object.keys(s).filter(k=>/^cover:\d+$/.test(k)).forEach(k=>out.push({id,channel:+k.split(':')[1],type:'cover'}));
  if(Array.isArray(s.rollers)&&(s.mode==='roller'||!s.relays))s.rollers.forEach((r,i)=>out.push({id,channel:i,type:'cover'}));
  if(s['temperature:0']||s.tmp||s['humidity:0']||s.hum||s['window:0']||(s.sensor&&s.sensor.state!=null)||s['em:0']||s['em1:0'])out.push({id,channel:0,type:'sensor'});
});return out}
function shOpt(dev,f){const s=SH.st&&SH.st[dev.id];if(!s)return;(SH.hold=SH.hold||{})[dev.id]=Date.now()+5000;try{f(s,+dev.channel||0)}catch(e){}if(S.wall&&S.wallView==='casa'&&!overlay.innerHTML)renderWall()}
async function shSwitch(dev,on){shOpt(dev,(s,ch)=>{if(s['switch:'+ch])s['switch:'+ch].output=on;else if(s.relays&&s.relays[ch])s.relays[ch].ison=on});try{await shPost('/device/relay/control',{id:dev.id,channel:String(+dev.channel||0),turn:on?'on':'off'});setTimeout(()=>shRefresh(true),900)}catch(e){toast(e.message)}}
async function shCover(dev,dir,pos){const tgt=pos!=null?pos:dir==='open'?100:dir==='close'?0:null;
  if(tgt!=null)shOpt(dev,(s,ch)=>{const r=s['cover:'+ch]||(s.rollers&&s.rollers[ch]);if(r)r.current_pos=tgt});try{if(pos!=null)await shPost('/device/relay/roller/settings/topos',{id:dev.id,channel:String(+dev.channel||0),pos:String(pos)});else await shPost('/device/relay/roller/control',{id:dev.id,channel:String(+dev.channel||0),direction:dir});setTimeout(()=>shRefresh(true),1500)}catch(e){toast(e.message)}}
// nomes e divisões tal como estão na app Shelly (melhor esforço: a Shelly Cloud não documenta isto oficialmente)
async function shNames(st){const out={};
  try{const d=await shPost('/interface/device/get_all_lists',{});const rooms=(d&&d.rooms)||{};const devs=(d&&d.devices)||{};
    Object.entries(devs).forEach(([k,v])=>{const id=String(v.id||k).replace(/_\d+$/,'');const ch=+(v.channel||(String(k).match(/_(\d+)$/)||[])[1]||0);const r=rooms[v.room_id];
      out[id+'|'+ch]={name:v.name||'',room:r&&r.name||''};if(!out[id+'|0'])out[id+'|0']=out[id+'|'+ch]})}catch(e){}
  try{const d=await shPost('/device/all_status',{show_info:'true'});Object.entries((d&&d.devices_status)||{}).forEach(([id,s])=>{const i=s._dev_info||{};
    if(i.name&&!(out[id+'|0']&&out[id+'|0'].name))out[id+'|0']={name:i.name,room:i.room_name||''}});if(d&&d.devices_status)Object.assign(st,d.devices_status)}catch(e){}
  return out}
// vários comandos seguidos respeitando o limite da Shelly Cloud (1 pedido por segundo)
async function shBatch(devs,fn){if(!devs.length)return;toast('A enviar para '+devs.length+(devs.length===1?' dispositivo':' dispositivos')+'…');
  for(let i=0;i<devs.length;i++){try{await fn(devs[i])}catch(e){toast(e.message)}if(i<devs.length-1)await new Promise(r=>setTimeout(r,1100))}setTimeout(()=>shRefresh(true),1200)}
function shKey(d){return d.id+'|'+d.type+'|'+(+d.channel||0)}
function wallCasa(){
  const c=shCfg(),all=(c.devices||[]).filter(d=>d.on!==false);
  if(!c.key||!shHost())return `<section class="casa"><div class="sh-empty"><span class="sh-empty-ic">🏠</span><h3>Casa</h3><p>Liga a tua conta Shelly para controlar luzes, tomadas e estores e ver os sensores.</p><button class="addbtn" data-shcfg>Ligar Shelly Cloud</button></div></section>`;
  if(!SH.poll){SH.poll=setInterval(()=>{if((S.wall&&S.wallView==='casa')||(!S.wall&&S.tab==='casa'))shRefresh(false);else{clearInterval(SH.poll);SH.poll=null}},10000)}
  if(!SH.st&&!SH.busy&&!SH.err)shRefresh(true);
  if(!SH.namesTried&&all.some(d=>!d.name||!d.room)){SH.namesTried=true;shNames({}).then(n=>{SH.names=n;if(Object.keys(n).length&&S.wall&&S.wallView==='casa'&&!overlay.innerHTML)renderWall()})}
  const nmOf=d=>(SH.names&&(SH.names[d.id+'|'+(+d.channel||0)]||SH.names[d.id+'|0']))||{};
  const roomOf=d=>d.room||nmOf(d).room||'Casa';
  const roomNames=[...new Set(all.map(roomOf))];
  const mode=S.shMode||(S.shMode=lsGet('fam.shMode')||'cards');
  const fr=S.shRoom&&roomNames.includes(S.shRoom)?S.shRoom:'';
  const devs=fr?all.filter(d=>roomOf(d)===fr):all;
  // resumo
  const st=all.map(d=>[d,shState(d)]);
  const lightsOn=st.filter(([d,s])=>d.type==='switch'&&!shImpulse(d,shZone(d,roomOf(d)))&&s&&s.on).length;
  const watts=st.reduce((a,[d,s])=>a+(s&&s.w>0?s.w:0),0);
  const temps=st.filter(([d,s])=>s&&s.t!=null).map(([d,s])=>s.t);
  const openW=st.filter(([d,s])=>s&&s.open===true).length;
  const coversOpen=st.filter(([d,s])=>d.type==='cover'&&s&&s.pos>0).length;
  const chip=(ic,v,l,cls='')=>`<div class="sh-sum${cls}"><span>${ic}</span><b>${v}</b><small>${l}</small></div>`;
  const summary=`<div class="sh-top">
    <div class="sh-sums">${chip('💡',lightsOn,lightsOn===1?'ligado':'ligados',lightsOn?' hot':'')}${chip('⚡',Math.round(watts)+' W','agora')}${temps.length?chip('🌡️',(Math.round(temps.reduce((a,b)=>a+b,0)/temps.length*10)/10).toLocaleString('pt-PT')+'°','média'):''}${chip('🪟',coversOpen,'estores abertos')}${openW?chip('🚪',openW,openW===1?'aberto':'abertos',' warn'):''}</div>
    <div class="sh-acts">
      ${lightsOn?`<button class="sh-act" data-shall="off">⏻ Desligar tudo</button>`:''}
      ${st.some(([d])=>d.type==='cover')?`<button class="sh-act" data-shallcv="open">▲ Abrir estores</button><button class="sh-act" data-shallcv="close">▼ Fechar estores</button>`:''}
      <div class="sh-mode" role="group" aria-label="Vista"><button data-shmode="cards" aria-pressed="${mode==='cards'}">▦ Cartões</button><button data-shmode="house" aria-pressed="${mode==='house'}">🏡 Casa</button></div>
      ${mode==='cards'?`<button class="sh-act${S.shEdit?' on':''}" data-shedit aria-pressed="${!!S.shEdit}">${S.shEdit?'✓ Concluído':'✥ Organizar'}</button>`:''}
      <button class="sh-act ic" data-shcfg aria-label="Configurar">${GEAR}</button>
    </div></div>
    ${mode==='cards'&&roomNames.length>1?`<div class="sh-rooms" role="group" aria-label="Divisões"><button data-shroom="" aria-pressed="${!fr}">Todas</button>${roomNames.map(r=>`<button data-shroom="${esc(r)}" aria-pressed="${fr===r}">${esc(r)}</button>`).join('')}</div>`:''}`;
  const sub=(s,off,txt)=>!s?'<span class="sh-dim">a carregar…</span>':off?'<span class="sh-off">Sem ligação</span>':txt;
  const tile=d=>{const s=shState(d),k=esc(shKey(d)),nm=esc(d.name||nmOf(d).name||d.id),off=s&&s.online===false;
    const head=(ic,cls='')=>`<div class="sh-h"><span class="sh-ic${cls}">${ic}</span><span class="sh-nm"><b>${nm}</b><small>${shImpulse(d,shZone(d,roomOf(d)))?'Comando':d.type==='switch'?'Luz / tomada':d.type==='cover'?'Estore':'Sensor'}</small></span></div>`;
    const zn=shZone(d,roomOf(d));
    if(shImpulse(d,zn)){const armed=S.shArm===shKey(d);
      return `<div class="sh-tile sh-gate${armed?' armed':''}${off?' offline':''}" data-k="${k}">${head(zn==='portao'?IC_GATE:IC_GARAGE)}
        <div class="sh-ft"><span class="sh-st">${sub(s,off,armed?'Toca de novo para confirmar':zn==='portao'?'Portão':'Garagem')}</span></div>
        <button class="sh-pulse" data-shpulse="${k}">${armed?'Confirmar':'Abrir / fechar'}</button></div>`}
    if(d.type==='switch'){const on=!!(s&&s.on);
      return `<div class="sh-tile sh-sw${on?' on':''}${off?' offline':''}" data-k="${k}"><button class="sh-hit" data-shsw="${k}" aria-pressed="${on}" aria-label="${nm}: ${on?'desligar':'ligar'}"></button>
        ${head(on?'💡':'💡',on?' lit':'')}
        <div class="sh-ft"><span class="sh-st">${sub(s,off,on?'Ligado':'Desligado')}${on&&s.w>0?`<em>${Math.round(s.w)} W</em>`:''}</span><span class="sh-tg" aria-hidden="true"><i></i></span></div></div>`}
    if(d.type==='cover'){const pos=s&&s.pos!=null?s.pos:null,mv=s&&(s.state==='open'||s.state==='opening')?'up':s&&(s.state==='close'||s.state==='closing')?'down':'';
      const closed=pos==null?50:100-pos;
      return `<div class="sh-tile sh-cv${off?' offline':''}" data-k="${k}">
        ${head('🪟')}
        <div class="sh-cvb">
          <div class="sh-win${mv?' mv-'+mv:''}" aria-hidden="true"><div class="sh-sky"></div><div class="sh-slats" style="height:${closed}%"></div></div>
          <div class="sh-cvc">
            <div class="sh-st big">${sub(s,off,mv==='up'?'A abrir…':mv==='down'?'A fechar…':pos===0?'Fechado':pos===100?'Aberto':pos!=null?pos+'% aberto':'Parado')}</div>
            <div class="sh-btns"><button data-shcv="${k}|open" aria-label="Abrir">▲<small>Abrir</small></button><button data-shcv="${k}|stop" aria-label="Parar">■<small>Parar</small></button><button data-shcv="${k}|close" aria-label="Fechar">▼<small>Fechar</small></button></div>
            ${pos!=null?`<div class="sh-pre">${[0,25,50,75,100].map(p=>`<button data-shpre="${k}|${p}" aria-pressed="${Math.abs(pos-p)<5}">${p}%</button>`).join('')}</div>`:''}
          </div></div></div>`}
    // sensores
    if(s&&s.open!=null&&s.t==null)return `<div class="sh-tile sh-sn sh-door ${s.open?'open':'shut'}${off?' offline':''}" data-k="${k}">${head(s.open?'🚪':'🔒')}
      <div class="sh-big">${off?'—':s.open?'Aberto':'Fechado'}</div>${s.bat!=null?`<div class="sh-mini">🔋 ${s.bat}%</div>`:''}</div>`;
    if(s&&s.t==null&&s.w!=null)return `<div class="sh-tile sh-sn${off?' offline':''}" data-k="${k}">${head('⚡')}<div class="sh-big">${Math.round(s.w)}<span>W</span></div></div>`;
    return `<div class="sh-tile sh-sn${off?' offline':''}" data-k="${k}">${head('🌡️')}
      <div class="sh-big">${s&&s.t!=null?(Math.round(s.t*10)/10).toLocaleString('pt-PT')+'<span>°C</span>':sub(s,off,'—')}</div>
      <div class="sh-mini">${s&&s.h!=null?`<span>💧 ${Math.round(s.h)}%</span>`:''}${s&&s.bat!=null?`<span>🔋 ${s.bat}%</span>`:''}${s&&s.open!=null?`<span>${s.open?'🚪 Aberto':'🔒 Fechado'}</span>`:''}</div></div>`};
  const groups={};devs.forEach(d=>{const r=roomOf(d);(groups[r]=groups[r]||[]).push(d)});
  const body=devs.length?Object.entries(groups).map(([r,ds])=>`${fr?'':`<h3 class="sh-room">${esc(r)}<small>${ds.length}</small></h3>`}<div class="sh-grid${S.shEdit?' editing':''}" data-shgrid="${esc(r)}">${ds.map(tile).join('')}</div>`).join('')
    :'<div class="sh-empty"><p>Ainda não escolheste dispositivos.</p><button class="addbtn" data-shcfg>Escolher dispositivos</button></div>';
  return `<section class="casa">${summary}${SH.err?`<div class="w-card w-err" style="padding:12px 16px;margin:0 0 12px">${esc(SH.err)} <button class="ghost" data-shre>Tentar de novo</button></div>`:''}
    ${mode==='house'?wallCasaHouse(all,roomOf,nmOf)+'<p class="small muted sh-upd">Cada aparelho aparece no andar da sua divisão. Para mudar, vai a Configurar → Zona na casa.</p>':''}
    ${mode==='cards'&&S.shEdit?'<p class="sh-hint">Arrasta os cartões para os reorganizar. Larga-os noutra divisão para os mudar de divisão.</p>':''}
    ${mode==='cards'?body:''}<p class="small muted sh-upd">${SH.at?'Atualizado às '+new Date(SH.at).toTimeString().slice(0,5):''}</p></section>`}
function shSaveOrder(){const c=shCfg();const devs=[...(c.devices||[])];const byK={};devs.forEach(d=>byK[shKey(d)]=d);
  const seen=new Set(),out=[];
  document.querySelectorAll('[data-shgrid]').forEach(g=>{const room=g.dataset.shgrid;g.querySelectorAll('.sh-tile[data-k]').forEach(t=>{const d=byK[t.dataset.k];if(!d||seen.has(t.dataset.k))return;seen.add(t.dataset.k);
    out.push(S.shRoom?d:{...d,room:room==='Casa'&&!d.room?d.room:room})})});
  devs.forEach(d=>{if(!seen.has(shKey(d)))out.push(d)});
  // com filtro de divisão ativo, manter a posição relativa das outras divisões
  const nc={...c,devices:out};S.shelly=nc;if(S.db)S.db.doc('config/shelly').set(nc).catch(handleWriteError)}
function shInitSort(){if(!S.shEdit)return;const gs=[...document.querySelectorAll('[data-shgrid]')];if(!gs.length)return;
  loadSortable().then(Sortable=>gs.forEach(g=>{if(!g.isConnected||g._sort)return;
    g._sort=Sortable.create(g,{group:'shelly',animation:200,draggable:'.sh-tile',ghostClass:'sh-ghost',chosenClass:'sh-chosen',
      onStart:()=>{S.dragging=true},onEnd:()=>{S.dragging=false;S.dragAt=Date.now();shSaveOrder();setTimeout(()=>{if(S.wall&&S.wallView==='casa'&&!overlay.innerHTML)renderWall()},250)}})})).catch(()=>{})}
function shSheet(){const c=shCfg();let found=null;
  let names={};const devRows=list=>list.map((d,i)=>{const nm=names[d.id+'|'+(+d.channel||0)]||names[d.id+'|0']||{};const cur0=(c.devices||[]).find(x=>shKey(x)===shKey(d))||{};const cur={...cur0,name:cur0.name||nm.name||'',room:cur0.room||nm.room||''};return `<div class="sh-row"><label class="prof-chk"><input type="checkbox" name="on_${i}" ${cur0.id?(cur0.on!==false?'checked':''):'checked'}></label>
    <span class="sh-ty">${d.type==='switch'?'💡':d.type==='cover'?'🪟':'🌡️'}</span><input name="nm_${i}" value="${esc(cur.name||'')}" placeholder="${esc(d.id)}${d.channel?' · canal '+d.channel:''}" style="flex:2;min-width:120px"><input name="rm_${i}" value="${esc(cur.room||'')}" placeholder="Divisão" list="sh-rooms" style="flex:1;min-width:90px"><select name="zn_${i}" aria-label="Zona na casa" style="flex:1;min-width:110px">${SH_ZONES.map(([v,l])=>`<option value="${v}"${(cur0.zone||'')===v?' selected':''}>${v?l:'Zona: automática'}</option>`).join('')}</select></div>`}).join('');
  const f=sheet('Casa · Shelly Cloud',`
    <p class="muted small" style="margin:0">Na app <b>Shelly Smart Control</b>: <b>Definições do utilizador → Chave de autorização na cloud</b> → <b>Obter chave</b>. Copia o <b>servidor</b> (ex.: shelly-123-eu.shelly.cloud) e a <b>chave</b>.</p>
    <label class="field"><span>Servidor</span><input name="host" value="${esc(c.host||'')}" placeholder="shelly-123-eu.shelly.cloud" spellcheck="false"></label>
    <label class="field"><span>Chave de autorização</span><input name="key" value="${esc(c.key||'')}" placeholder="Cola aqui a chave" autocomplete="off" spellcheck="false"></label>
    <div class="field"><span>Dispositivos</span><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="ghost" data-shfind style="flex:1">Procurar dispositivos</button><button type="button" class="ghost" data-shclear style="flex:1">Limpar todos</button></div><div id="sh-list" class="sh-list">${c.devices&&c.devices.length?devRows(c.devices):''}</div>
      <datalist id="sh-rooms">${['Sala','Cozinha','Quarto','Escritório','Casa de banho','Entrada','Garagem','Jardim','Exterior'].map(x=>`<option value="${x}">`).join('')}</datalist></div>
    <div id="sh-msg" class="small muted"></div>`,
  {saveLabel:'Guardar',onSave:f=>{const list=found||c.devices||[];const devices=list.map((d,i)=>({id:d.id,channel:+d.channel||0,type:d.type,name:val(f,'nm_'+i),room:val(f,'rm_'+i),zone:val(f,'zn_'+i),on:!!(f.elements['on_'+i]&&f.elements['on_'+i].checked)}));
    const nc={host:val(f,'host').replace(/^https?:\/\//,'').replace(/\/.*$/,''),key:val(f,'key'),devices};S.shelly=nc;SH.st=null;SH.err='';if(S.db)S.db.doc('config/shelly').set(nc).catch(handleWriteError);toast('Casa configurada');if(S.wall){S.wallView='casa';lsSet('fam.wallView','casa');renderWall()}}});
  f.querySelector('[data-shclear]').addEventListener('click',()=>{c.devices=[];found=[];names={};SH.names=null;SH.namesTried=false;
    const nc={...c,devices:[]};S.shelly=nc;if(S.db)S.db.doc('config/shelly').set(nc).catch(handleWriteError);
    f.querySelector('#sh-list').innerHTML='';f.querySelector('#sh-msg').textContent='Lista limpa. Carrega em Procurar dispositivos para os carregar de novo com os nomes da app Shelly.'});
  f.querySelector('[data-shfind]').addEventListener('click',async()=>{const msg=f.querySelector('#sh-msg');const old=S.shelly;S.shelly={...(old||{}),host:val(f,'host'),key:val(f,'key')};msg.textContent='A procurar…';
    try{const d=await shPost('/device/all_status',{});SH.st=d.devices_status||{};msg.textContent='A ler os nomes e divisões da app Shelly…';names=await shNames(SH.st);found=shDiscover(SH.st);
      f.querySelector('#sh-list').innerHTML=found.length?devRows(found):'<p class="muted small">Não encontrei dispositivos nesta conta.</p>';
      msg.textContent=found.length+' encontrados'+(Object.keys(names).length?', com os nomes e divisões da app Shelly. Corrige o que quiseres e carrega em Guardar.':'. A Shelly não enviou os nomes: escreve um nome e uma divisão em cada um e carrega em Guardar.')}
    catch(e){msg.textContent=e.net?'A Shelly Cloud não respondeu ao browser. Confirma o servidor; se estiver certo, ela pode estar a bloquear pedidos de páginas web — diz-me e eu monto um intermediário.':'Erro: '+e.message}
    finally{S.shelly=old}});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-shcfg],[data-shre],[data-shsw],[data-shcv],[data-shpre],[data-shedit],[data-shroom],[data-shall],[data-shallcv],[data-shmode],[data-shpulse],[data-shcvsheet]');if(!b)return;const d=b.dataset;
  if(S.shEdit&&(d.shsw||d.shcv||d.shpre||d.shpulse))return;
  const rw=()=>{if(S.wall)renderWall();else render()};
  const find=k=>(shCfg().devices||[]).find(x=>shKey(x)===k);
  if(d.shmode){S.shMode=d.shmode;S.shEdit=false;lsSet('fam.shMode',d.shmode);rw();return}
  if(d.shpulse){const dev=find(d.shpulse);if(!dev)return;
    if(S.shArm!==d.shpulse){S.shArm=d.shpulse;clearTimeout(SH.armT);SH.armT=setTimeout(()=>{S.shArm=null;rw()},4000);rw();return}
    S.shArm=null;clearTimeout(SH.armT);shPost('/device/relay/control',{id:dev.id,channel:String(+dev.channel||0),turn:'on'}).then(()=>{toast('Enviado');setTimeout(()=>shRefresh(true),1500)}).catch(er=>toast(er.message));rw();return}
  if(d.shcvsheet){const dev=find(d.shcvsheet);if(!dev)return;const k=esc(d.shcvsheet);const s=shState(dev)||{};
    sheet(esc(dev.name||dev.id),`<div class="sh-btns" style="margin-bottom:12px"><button type="button" data-shcv="${k}|open">▲<small>Abrir</small></button><button type="button" data-shcv="${k}|stop">■<small>Parar</small></button><button type="button" data-shcv="${k}|close">▼<small>Fechar</small></button></div>
      ${s.pos!=null?`<div class="sh-pre">${[0,25,50,75,100].map(p=>`<button type="button" data-shpre="${k}|${p}" aria-pressed="${Math.abs(s.pos-p)<5}">${p}%</button>`).join('')}</div>`:''}`,{});return}
  if(d.shedit!==undefined){S.shEdit=!S.shEdit;rw();return}
  if(d.shroom!==undefined){S.shRoom=d.shroom;rw();return}
  if(d.shall){const devs=(shCfg().devices||[]).filter(x=>x.on!==false&&x.type==='switch'&&!shImpulse(x,shZone(x,x.room))&&(shState(x)||{}).on);shBatch(devs,x=>shPost('/device/relay/control',{id:x.id,channel:String(+x.channel||0),turn:'off'}));return}
  if(d.shallcv){const devs=(shCfg().devices||[]).filter(x=>x.on!==false&&x.type==='cover');shBatch(devs,x=>shPost('/device/relay/roller/control',{id:x.id,channel:String(+x.channel||0),direction:d.shallcv}));return}
  if(d.shpre){const p=d.shpre.split('|'),pos=+p.pop(),dev=(shCfg().devices||[]).find(x=>shKey(x)===p.join('|'));if(dev)shCover(dev,null,pos);return}
  if(d.shcfg!==undefined){shSheet();return}
  if(d.shre!==undefined){shRefresh(true);return}
  if(d.shsw){const dev=find(d.shsw);if(!dev)return;const s=shState(dev);const on=!(s&&s.on);const t=b.closest('.sh-tile');if(t)t.classList.toggle('on',on);shSwitch(dev,on);return}
  if(d.shcv){const p=d.shcv.split('|'),dir=p.pop(),dev=find(p.join('|'));if(dev)shCover(dev,dir);return}
});
document.addEventListener('change',e=>{const r=e.target.closest('[data-shpos]');if(!r)return;const dev=(shCfg().devices||[]).find(x=>shKey(x)===r.dataset.shpos);if(dev)shCover(dev,null,+r.value)});

/* ---------- Casa: vista ilustrada (moradia de dois andares, portão e garagem) ---------- */



function shZone(d,room){if(d.zone)return d.zone;const r=(room||'').toLowerCase();
  if(/garag/.test(r))return 'garagem';if(/port[ãa]o|rua|gate/.test(r))return 'portao';if(/jardim|exterior|quintal|terra[çc]o|piscina|varanda|alpendre/.test(r))return 'exterior';
  if(/quarto|suite|suíte|escrit|wc|banho|1\.?º|primeiro|andar|sót[ãa]o|cima/.test(r))return 'andar1';return 'rc'}
function shImpulse(d,zone){return d.type==='switch'&&(zone==='portao'||zone==='garagem')}
function wallCasaHouse(all,roomOf,nmOf){
  const items=all.map(d=>{const room=roomOf(d);return {d,s:shState(d),room,zone:shZone(d,room),nm:d.name||nmOf(d).name||d.id}});
  const z=k=>items.filter(x=>x.zone===k);
  const h=new Date().getHours();const cur=(typeof WX!=='undefined'&&WX&&WX.cur)||null;
  const night=cur?!cur.day:(h<7||h>=20);const code=cur?cur.c:0;
  const rain=[51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code),cloudy=rain||[2,3,45,48].includes(code);
  // janelas: cada divisão de um andar fica com uma janela
  const floorRooms=k=>[...new Set(z(k).map(x=>x.room))];
  const winsRc=[[350,395],[470,395]],winsUp=[[340,215],[470,215],[640,215]];
  const winData=(k,slots)=>{const rooms=floorRooms(k);return slots.map((p,i)=>{const rs=rooms.filter((r,j)=>j===i||(i===slots.length-1&&j>i));
    const its=z(k).filter(x=>rs.includes(x.room));const lit=its.some(x=>x.d.type==='switch'&&x.s&&x.s.on);
    const cv=its.find(x=>x.d.type==='cover'&&x.s&&x.s.pos!=null);const open=its.some(x=>x.s&&x.s.open===true);
    return {x:p[0],y:p[1],rooms:rs,lit,closed:cv?100-cv.s.pos:0,open,its}})};
  const W=[...winData('rc',winsRc),...winData('andar1',winsUp)];
  const P=SH.prev||{},N={};const ch=(k,v)=>{N[k]=v;return k in P&&P[k]!==v};
  const anyOn=k=>z(k).some(x=>x.d.type==='switch'&&!shImpulse(x.d,k)&&x.s&&x.s.on);
  const garCv=z('garagem').find(x=>x.d.type==='cover'&&x.s&&x.s.pos!=null);
  const garOpen=garCv?garCv.s.pos:(z('garagem').some(x=>x.s&&x.s.open===true)?100:0);
  const gateOpen=z('portao').some(x=>(x.s&&x.s.open===true)||(x.d.type==='cover'&&x.s&&x.s.pos>0));
  const extLit=anyOn('exterior')||anyOn('portao');
  const win=(w,i)=>{const cl=ch('w'+i,w.lit),cs=ch('s'+i,w.closed);const p0=((P['s'+i]!=null?P['s'+i]:w.closed)/100).toFixed(2);
    return `<g class="hs-win${w.lit?' lit':''}${cl?(w.lit?' anim-on':' anim-off'):''}">
      <rect x="${w.x}" y="${w.y}" width="90" height="80" rx="4" class="hs-glass"/>
      ${w.lit?`<rect x="${w.x-30}" y="${w.y-25}" width="150" height="130" class="hs-halo" />`:''}
      <rect x="${w.x}" y="${w.y}" width="90" height="80" class="hs-shut${cs?' anim':''}" style="transform:scaleY(${(w.closed/100).toFixed(2)});--p0:${p0}"/>
      <path d="M${w.x+45} ${w.y}v80M${w.x} ${w.y+40}h90" class="hs-mull"/>
      <rect x="${w.x}" y="${w.y}" width="90" height="80" rx="4" class="hs-frame"/>
      <rect x="${w.x-6}" y="${w.y+80}" width="102" height="7" rx="2" class="hs-sill"/>
      ${w.rooms.length?`<text x="${w.x+45}" y="${w.y+104}" class="hs-lbl">${esc(w.rooms.join(' · ')).slice(0,40)}</text>`:''}
      ${w.open?`<text x="${w.x+82}" y="${w.y+14}" class="hs-warn">!</text>`:''}</g>`};
  const drops=rain?Array.from({length:40},(_,i)=>`<line x1="${(i*53)%1000}" y1="${(i*97)%300}" x2="${(i*53)%1000-6}" y2="${(i*97)%300+18}" class="hs-drop" style="animation-delay:${(i%10)/10}s"/>`).join(''):'';
  const stars=night&&!cloudy?Array.from({length:24},(_,i)=>`<circle cx="${(i*137)%1000}" cy="${(i*71)%200+10}" r="${i%3?1.2:2}" class="hs-star"/>`).join(''):'';
  const svg=`<svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMax slice" class="hs-svg${night?' night':''}${rain?' rain':''}" role="img" aria-label="Casa: ${W.filter(w=>w.lit).length} janelas com luz, portão ${gateOpen?'aberto':'fechado'}, garagem ${garOpen>0?'aberta':'fechada'}">
    <defs><linearGradient id="hsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="hs-sky1"/><stop offset="1" class="hs-sky2"/></linearGradient>
      <radialGradient id="hsGlow"><stop offset="0" stop-color="#FDBA4D" stop-opacity=".55"/><stop offset="1" stop-color="#FDBA4D" stop-opacity="0"/></radialGradient></defs>
    <rect width="1000" height="620" fill="url(#hsSky)"/>${stars}
    ${night?'<circle cx="860" cy="80" r="30" class="hs-moon"/><circle cx="874" cy="70" r="26" class="hs-moonc"/>':cloudy?'':'<circle cx="860" cy="85" r="36" class="hs-sun"/>'}
    ${cloudy?'<g class="hs-cloud"><ellipse cx="200" cy="90" rx="70" ry="26"/><ellipse cx="250" cy="74" rx="50" ry="30"/><ellipse cx="700" cy="70" rx="80" ry="26"/><ellipse cx="760" cy="56" rx="46" ry="26"/></g>':''}
    <rect y="520" width="1000" height="100" class="hs-ground"/><rect y="555" width="1000" height="65" class="hs-street"/><path d="M0 588h1000" class="hs-lane"/>
    <!-- árvore e jardim -->
    <rect x="120" y="390" width="14" height="130" class="hs-trunk"/><circle cx="127" cy="370" r="58" class="hs-tree"/><circle cx="95" cy="400" r="38" class="hs-tree"/>
    ${extLit?'<circle cx="250" cy="430" r="80" fill="url(#hsGlow)"/>':''}<rect x="246" y="430" width="8" height="90" class="hs-post"/><circle cx="250" cy="430" r="11" class="hs-lamp${extLit?' on':''}${ch('ext',extLit)&&extLit?' anim-on':''}"/>
    <!-- muro e portão -->
    <rect x="0" y="500" width="40" height="40" class="hs-wall"/><rect x="200" y="500" width="100" height="40" class="hs-wall"/>
    <g class="hs-gate${gateOpen?' open':''}${ch('gate',gateOpen)?(gateOpen?' anim-open':' anim-close'):''}"><path d="M40 505h160v35H40z" class="hs-gatebg"/>${Array.from({length:9},(_,i)=>`<rect x="${44+i*18}" y="505" width="6" height="35" class="hs-bar"/>`).join('')}<path d="M40 505h160M40 522h160" class="hs-rail"/></g>
    <!-- casa -->
    <path d="M290 175 L550 40 L810 175 Z" class="hs-roof"/><rect x="700" y="70" width="34" height="70" class="hs-chim"/>
    <rect x="300" y="170" width="500" height="350" class="hs-house"/><path d="M300 345h500" class="hs-floor"/>
    ${anyOn('andar1')?'':''}
    ${W.map(win).join('')}
    <rect x="590" y="395" width="74" height="125" rx="6" class="hs-door"/><circle cx="650" cy="460" r="4" class="hs-knob"/>
    ${extLit?'<circle cx="627" cy="385" r="50" fill="url(#hsGlow)"/>':''}<rect x="620" y="378" width="14" height="10" rx="3" class="hs-lamp${extLit?' on':''}"/>
    <!-- garagem -->
    <path d="M800 330 L880 300 L960 330 Z" class="hs-roof"/><rect x="800" y="328" width="160" height="192" class="hs-house"/>
    <rect x="815" y="380" width="130" height="140" class="hs-garin"/>
    ${anyOn('garagem')?`<rect x="815" y="380" width="130" height="140" class="hs-garlit${ch('garl',true)?' anim-on':''}"/>`:(ch('garl',false),'')}
    <g class="hs-gar${ch('gar',garOpen)?' anim':''}" style="transform:scaleY(${((100-garOpen)/100).toFixed(2)});--p0:${(((100-(P.gar!=null?P.gar:garOpen)))/100).toFixed(2)}"><rect x="815" y="380" width="130" height="140" class="hs-gardoor"/>${Array.from({length:7},(_,i)=>`<path d="M815 ${400+i*20}h130" class="hs-garline"/>`).join('')}</g>
    ${drops}
  </svg>`;
  // chips por zona
  const zl={andar1:'1.º andar',rc:'Rés-do-chão',garagem:'Garagem',portao:'Portão',exterior:'Jardim'};
  const chip=x=>{const k=esc(shKey(x.d)),s=x.s,off=s&&s.online===false;let st='…',cls='';
    if(s&&!off){if(x.d.type==='switch'){st=shImpulse(x.d,x.zone)?(S.shArm===shKey(x.d)?'Toca de novo':'Acionar'):(s.on?'Ligado':'Desligado');cls=s.on&&!shImpulse(x.d,x.zone)?' on':''}
      else if(x.d.type==='cover')st=s.pos!=null?s.pos+'%':'—';else st=s.t!=null?(Math.round(s.t*10)/10).toLocaleString('pt-PT')+'°'+(s.h!=null?' · '+Math.round(s.h)+'%':''):s.open!=null?(s.open?'Aberto':'Fechado'):s.w!=null?Math.round(s.w)+' W':'—';
      if(s.open===true)cls=' warn'}else if(off)st='Sem ligação';
    const ic=x.d.type==='cover'?'🪟':x.d.type==='switch'?(shImpulse(x.d,x.zone)?(x.zone==='portao'?IC_GATE:IC_GARAGE):'💡'):(s&&s.open!=null?'🚪':'🌡️');
    const act=x.d.type==='switch'?(shImpulse(x.d,x.zone)?`data-shpulse="${k}"`:`data-shsw="${k}"`):x.d.type==='cover'?`data-shcvsheet="${k}"`:'';
    return `<button class="hs-chip${cls}${S.shArm===shKey(x.d)?' armed':''}" ${act} ${act?'':'disabled'}><span>${ic}</span><b>${esc(x.nm)}</b><small>${st}</small></button>`};
  SH.prev=N;
  const order=['andar1','rc','garagem','portao','exterior'];
  const zones=order.filter(k=>z(k).length).map(k=>`<div class="hs-zone"><span class="hs-zl">${zl[k]}</span>${z(k).map(chip).join('')}</div>`).join('');
  return `<div class="hs-wrap"><div class="hs-pic">${svg}</div><div class="hs-side">${zones}</div></div>`}

/* ---------- Aniversários guardados no Google (modo só Google) ---------- */

function allBdays(){if(!gOnly())return S.birthdays;if(!GBD){try{GBD=JSON.parse(localStorage.getItem('fam.gbd')||'null')}catch(e){GBD=null}}setTimeout(()=>gbdLoad(false),0);return [...S.birthdays,...((GBD&&GBD.list)||[])]}
async function gbdLoad(force){const cal=famCal();if(!S.mcp||!cal||gbdBusy)return;if(!force&&GBD&&GBD.cal===cal&&Date.now()-GBD.at<6*3600000)return;gbdBusy=true;
  try{const t=new Date(),e=new Date(t.getFullYear()+1,t.getMonth(),t.getDate()+1);const seen={},list=[];let tok,n=0;
    do{const r=await S.mcp.callTool(GSERVER,'list_events',{calendarId:cal,startTime:iso(t)+'T00:00:00',endTime:iso(e)+'T00:00:00',pageSize:250,...(tok?{pageToken:tok}:{})},{cache:false});const pl=r.payload||{};
      (pl.events||[]).forEach(ev=>{const s=ev.summary||'';const isB=/^\s*🎂/.test(s)||((ev.extendedProperties||{}).private||{}).quadro==='aniv';if(!isB||ev.status==='cancelled')return;
        const d=(ev.start&&(ev.start.date||(ev.start.dateTime||'').slice(0,10)))||'';if(!d)return;const sid=ev.recurringEventId||ev.id;if(seen[sid])return;seen[sid]=1;
        const m=s.replace(/^\s*🎂\uFE0F?\s*/,'').match(/^(.*?)(?:\s*\((\d{4})\))?\s*$/);
        list.push({id:'g:'+cal+'|'+sid,name:(m&&m[1])||s,year:(m&&m[2])||'',md:d.slice(5),note:'',g:1})});
      tok=pl.nextPageToken;n++}while(tok&&n<6);
    GBD={cal,at:Date.now(),list};try{localStorage.setItem('fam.gbd',JSON.stringify(GBD))}catch(e){}
    if(S.wall){if(!overlay.innerHTML)renderWall()}else render()}catch(e){console.warn('Aniversários Google',e)}finally{gbdBusy=false}}
function gBdaySheet(id){const b=allBdays().find(x=>x.id===id);if(!b)return;const [cal,eid]=id.slice(2).split('|');
  const f=sheet('🎂 '+esc(b.name),`<p style="margin:0">${+b.md.slice(3)} de ${MONTHS[+b.md.slice(0,2)-1]}${b.year?' · nasceu em '+esc(b.year):''}</p>
    <p class="muted small">Guardado no calendário Família do Google. Repete todos os anos.</p>`,
  {onDelete:S.readOnly?null:async()=>{try{await S.mcp.callTool(GSERVER,'delete_event',{calendarId:cal,eventId:eid},{cache:false});GBD.list=GBD.list.filter(x=>x.id!==id);try{localStorage.setItem('fam.gbd',JSON.stringify(GBD))}catch(e){}toast('Aniversário apagado');S.gbusy=0;syncGoogle(null,false);if(S.wall)renderWall();else render()}catch(e){toast(gErr(e))}}})}

/* ---------- Refeições (pequeno-almoço, almoço, lanche, jantar) ---------- */
function mealTipo(m){return (m&&m.tipo)||'almoco'}
function mealId(d,t){return t==='almoco'?d:d+'_'+t}
function mealT(m){return MEALT.find(x=>x[0]===mealTipo(m))||MEALT[1]}
function mealsOn(d){const o=k=>MEALT.findIndex(x=>x[0]===k);return Object.values(S.meals||{}).filter(m=>m&&m.title&&(m.date||m.id)===d).sort((a,b)=>o(mealTipo(a))-o(mealTipo(b)))}
function mealGuess(d){if(d!==TODAY)return 'almoco';const h=new Date().getHours();return h<10?'pequeno':h<15?'almoco':h<18?'lanche':'jantar'}
function mealNext(d){const ms=mealsOn(d);if(!ms.length)return null;if(d!==TODAY)return ms[0];const h=new Date().getHours(),lim={pequeno:10,almoco:15,lanche:18,jantar:24};return ms.find(m=>h<lim[mealTipo(m)])||ms[ms.length-1]}
function mealRows(d,cls){const ms=mealsOn(d);return ms.length?ms.map(m=>{const [k,l,ic]=mealT(m);return `<button type="button" class="${cls||'ml-row'}" data-open-meal="${d}|${k}|${esc(m.id)}"><span class="ml-ic">${ic}</span><span class="ml-tx"><small>${l}</small><b>${esc(m.title)}</b></span></button>`}).join(''):''}


document.addEventListener('input',e=>{if(e.target.id!=='shop-hq')return;S.shopQ=e.target.value;S.shopHistAll=false;S.refocusId='shop-hq';S.refocusUntil=Date.now()+1500;clearTimeout(S.shopQT);S.shopQT=setTimeout(()=>{if(S.wall)renderWall();else render();const el=document.getElementById('shop-hq');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}},250)});

/* ---------- Gerir uma lista de compras: email, arquivo, apagar ---------- */
function shopListText(store){const it=shopItems(store);const open=it.filter(t=>!t.done).sort((a,b)=>(a.text||'').localeCompare(b.text||'','pt')),got=it.filter(t=>t.done);
  return `Lista de compras · ${store} · ${niceDate(TODAY)}\n\n`+(open.length?open.map(t=>'☐ '+t.text).join('\n'):'(nada por comprar)')+(got.length?'\n\nJá no carrinho:\n'+got.map(t=>'✓ '+t.text).join('\n'):'')+'\n\n— enviado pelo Quadro da Família'}
function shopMenu(store){
  const it=shopItems(store),arch=(S.shopArchive||[]).filter(a=>a.store===store).sort((a,b)=>(b.at||'').localeCompare(a.at||''));
  const mails=S.members.filter(m=>m.email);
  const f=sheet('Lista · '+esc(store),`
    <p class="muted small" style="margin:0">${it.filter(x=>!x.done).length} por comprar · ${it.filter(x=>x.done).length} no carrinho</p>
    <div class="field"><span>Enviar por email</span>
      ${mails.length?`<div class="who" style="flex-wrap:wrap" data-slto>${mails.map(m=>`<button type="button" class="chip" data-to="${esc(m.email)}" aria-pressed="false"><span class="dot" style="--c:var(--${m.color})"></span>${esc(m.name)}</button>`).join('')}</div>`:''}
      <input id="sl-extra" type="email" placeholder="Outro email (opcional)" autocomplete="off" inputmode="email" style="margin-top:6px">
      <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button type="button" class="addbtn" data-slsend="gmail">Enviar pelo Gmail</button><button type="button" class="ghost" data-slsend="mail">App de email</button><button type="button" class="ghost" data-slcopy>Copiar</button></div></div>
    <div class="field"><span>Arquivar</span><p class="muted small" style="margin:0 0 6px">Guarda uma cópia desta lista no arquivo e esvazia-a para a próxima compra.</p>
      <button type="button" class="ghost" data-slarch ${it.length?'':'disabled'}>Arquivar e esvaziar</button></div>
    ${arch.length?`<div class="field"><span>Arquivo (${arch.length})</span><div class="list">${arch.slice(0,30).map(a=>`<div class="item"><span class="body"><div class="t">${esc(niceDate(a.date||TODAY))}</div><div class="sub">${(a.items||[]).length} artigos${a.by?' · '+esc(a.by):''}</div></span><button type="button" class="edit" data-slview="${esc(a.id)}">Ver</button></div>`).join('')}</div></div>`:''}
    ${S.readOnly?'':`<div class="field"><span>Apagar lista</span><p class="muted small" style="margin:0 0 6px">${shopLists().length>1?'Apaga a lista e os artigos que tem. O histórico de artigos fica guardado.':'Esta é a única lista: podes esvaziá-la, mas não apagá-la.'}</p>
      <button type="button" class="ghost danger" data-sldel ${shopLists().length>1?'':'disabled'}>Apagar a lista ${esc(store)}</button></div>`}`,{});
  const picked=()=>[...f.querySelectorAll('[data-slto] [aria-pressed="true"]')].map(b=>b.dataset.to).concat((f.querySelector('#sl-extra').value||'').split(/[,;\s]+/).filter(x=>/@/.test(x)));
  f.querySelectorAll('[data-slto] .chip').forEach(b=>b.addEventListener('click',()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true')));
  f.querySelectorAll('[data-slsend]').forEach(b=>b.addEventListener('click',()=>{const to=picked();const subj='Lista de compras · '+store,body=shopListText(store);
    const url=b.dataset.slsend==='gmail'?`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to.join(','))}&su=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
      :`mailto:${to.map(encodeURIComponent).join(',')}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    window.open(url,'_blank','noopener')}));
  f.querySelector('[data-slcopy]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shopListText(store));toast('Lista copiada')}catch(e){toast('Não foi possível copiar')}});
  f.querySelector('[data-slarch]')?.addEventListener('click',e=>{const b=e.currentTarget;if(!b.dataset.armed){b.dataset.armed='1';b.textContent='Toca de novo para arquivar';return}
    const items=shopItems(store).map(t=>({text:t.text,done:!!t.done}));const me=S.me&&member(S.me.memberId);
    save('shopArchive',null,{store,date:TODAY,at:new Date().toISOString(),items,by:me?me.name:''});
    shopItems(store).forEach(t=>remove('tasks',t.id));toast('Lista arquivada');closeSheet()});
  f.querySelector('[data-sldel]')?.addEventListener('click',e=>{const b=e.currentTarget;if(!b.dataset.armed){b.dataset.armed='1';b.textContent='Toca de novo para apagar '+store;return}
    shopItems(store).forEach(t=>remove('tasks',t.id));const rest=shopLists().filter(l=>l!==store);saveShopLists(rest);S.shopList=rest[0];lsSet('fam.shopList',rest[0]);toast('Lista apagada');closeSheet()});
  f.querySelectorAll('[data-slview]').forEach(b=>b.addEventListener('click',()=>{const a=arch.find(x=>x.id===b.dataset.slview);if(a){closeSheet();shopArchView(a)}}));
}
function shopArchView(a){
  const f=sheet('Arquivo · '+esc(a.store)+' · '+esc(niceDate(a.date||TODAY)),`<div class="list">${(a.items||[]).map(x=>`<div class="item ${x.done?'done':''}"><span class="body"><div class="t">${x.done?'✓ ':'☐ '}${esc(x.text)}</div></span></div>`).join('')||'<div class="empty">Vazia.</div>'}</div>
    ${S.readOnly?'':`<div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button type="button" class="addbtn" data-sarest>Voltar a pôr na lista</button><button type="button" class="ghost danger" data-sadel>Apagar do arquivo</button></div>`}`,{});
  f.querySelector('[data-sarest]')?.addEventListener('click',()=>{const have=new Set(shopItems(a.store).filter(t=>!t.done).map(t=>slugify(t.text)));let n=0;
    (a.items||[]).forEach(x=>{if(!have.has(slugify(x.text))){addShopItem(x.text,a.store);n++}});if(!shopLists().includes(a.store))saveShopLists([...shopLists(),a.store]);
    S.shopList=a.store;lsSet('fam.shopList',a.store);toast(n+' artigos repostos em '+a.store);closeSheet()});
  f.querySelector('[data-sadel]')?.addEventListener('click',e=>{const b=e.currentTarget;if(!b.dataset.armed){b.dataset.armed='1';b.textContent='Toca de novo para apagar';return}remove('shopArchive',a.id);toast('Apagado do arquivo');closeSheet()});
}

/* ---------- Spotify na Moldura ---------- */
// O leitor do Spotify fica numa camada fixa fora do ecrã de parede, para a música não parar quando o ecrã se redesenha.
function spCfg(){return S.spotify||{items:[]}}
function spParse(u){u=String(u||'').trim();let m=u.match(/^spotify:(playlist|album|artist|track|show|episode):([A-Za-z0-9]+)/);
  if(!m)m=u.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|album|artist|track|show|episode)\/([A-Za-z0-9]+)/);
  return m?{t:m[1],id:m[2]}:null}
function spCur(){const c=spCfg(),it=c.items||[];return it.find(x=>x.id===c.cur)||it[0]||null}
function spotifyWidget(){const c=spCfg(),it=c.items||[];if(!it.length)return '';const cur=spCur();
  return `<div class="sp-w"><div class="sp-bar"><span class="sp-logo">♫ Spotify</span>${it.length>1?`<div class="sp-tabs">${it.map(x=>`<button class="sp-tab${x.id===cur.id?' on':''}" data-sppick="${esc(x.id)}">${esc(x.n||x.t)}</button>`).join('')}</div>`:`<span class="sp-name">${esc(cur.n||'')}</span>`}</div>
    <div class="sp-slot${c.big?' big':''}" id="spSlot"></div></div>`}

function spSync(){const slot=document.getElementById('spSlot');const cur=spCur();
  if(!slot||!cur||!S.wall){if(SPL.el)SPL.el.style.display='none';return}
  if(!SPL.el){SPL.el=document.createElement('div');SPL.el.id='spLayer';document.body.appendChild(SPL.el)}
  const src='https://open.spotify.com/embed/'+cur.t+'/'+cur.id+'?utm_source=generator&theme=0';
  if(SPL.src!==src){SPL.src=src;SPL.el.innerHTML=`<iframe src="${esc(src)}" title="Spotify" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`}
  const r=slot.getBoundingClientRect(),vis=(overlay&&overlay.innerHTML)?'hidden':'visible',k=[r.left,r.top,r.width,r.height,vis].join(',');
  if(SPL.k!==k||SPL.el.style.display!=='block'){SPL.k=k;Object.assign(SPL.el.style,{display:'block',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',visibility:vis})}
  if(!SPL.raf){const loop=()=>{SPL.raf=0;if(document.getElementById('spSlot')){spSync()}else if(SPL.el)SPL.el.style.display='none'};SPL.raf=requestAnimationFrame(loop)}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-sppick]');if(!b)return;const c={...spCfg(),cur:b.dataset.sppick};S.spotify=c;if(S.db)S.db.doc('config/spotify').set(c).catch(handleWriteError);if(S.wall)renderWall()});
function spSheet(){const c=spCfg();let items=[...(c.items||[])];
  const rows=()=>items.map((x,i)=>`<div class="item"><span class="body"><div class="t">${esc(x.n||'Sem nome')}</div><div class="sub">${esc({playlist:'Playlist',album:'Álbum',artist:'Artista',track:'Música',show:'Podcast',episode:'Episódio'}[x.t]||x.t)}</div></span><button type="button" class="edit" data-spdel="${i}">Remover</button></div>`).join('')||'<div class="empty">Ainda sem nada. Cola em baixo um link do Spotify.</div>';
  const f=sheet('Spotify na Moldura',`<p class="muted small" style="margin:0">No Spotify, abre uma playlist, álbum, artista ou podcast → <b>Partilhar → Copiar link</b> e cola-o aqui. Para ouvir as músicas completas, entra na tua conta Spotify neste aparelho (sem conta o Spotify só deixa ouvir 30 segundos).</p>
    <div class="field"><span>Guardados</span><div class="list" id="sp-list">${rows()}</div></div>
    <label class="field"><span>Link do Spotify</span><input id="sp-url" placeholder="https://open.spotify.com/playlist/…" autocomplete="off" spellcheck="false"></label>
    <label class="field"><span>Nome (opcional)</span><input id="sp-name" placeholder="Ex.: Louvor da manhã" autocomplete="off"></label>
    <button type="button" class="ghost" data-spadd>Adicionar</button>
    <label class="cfg-tog" style="margin-top:10px"><span><b>Leitor grande</b><small>Mostra a lista de músicas</small></span><input type="checkbox" role="switch" name="big" ${c.big?'checked':''}></label>`,
  {saveLabel:'Guardar',onSave:f=>{const nc={items,cur:items.some(x=>x.id===c.cur)?c.cur:(items[0]&&items[0].id)||'',big:!!f.elements.big.checked};S.spotify=nc;if(S.db)S.db.doc('config/spotify').set(nc).catch(handleWriteError);toast('Spotify guardado');if(S.wall)renderWall()}});
  f.querySelector('[data-spadd]').addEventListener('click',()=>{const u=f.querySelector('#sp-url').value,p=spParse(u);if(!p){toast('Esse link não parece ser do Spotify.');return}
    if(items.some(x=>x.id===p.id)){toast('Já está na lista.');return}items.push({...p,n:f.querySelector('#sp-name').value.trim()});f.querySelector('#sp-url').value='';f.querySelector('#sp-name').value='';f.querySelector('#sp-list').innerHTML=rows()});
  f.querySelector('#sp-list').addEventListener('click',e=>{const b=e.target.closest('[data-spdel]');if(!b)return;items.splice(+b.dataset.spdel,1);f.querySelector('#sp-list').innerHTML=rows()});
}
window.addEventListener('resize',()=>spSync());
