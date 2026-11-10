// Liga a app ao Firebase (dados partilhados + entrada com Google) e ao Google Calendar.
// Expõe window.famBackend.use(nome) com as mesmas peças que a app espera:
//   db      → base de dados partilhada (Firestore)
//   user    → quem está a usar
//   mcp     → Google Calendar (list_calendars, list_events, create_event, update_event, delete_event)
//   assets  → fotografias da moldura (guardadas como imagem reduzida no Firestore)
// Sem config.js preenchido a app corre em modo de demonstração (nada é guardado).

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut,
  sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, onSnapshot, setDoc, deleteDoc, getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const cfg = window.QUADRO_CONFIG || {};
const fb = cfg.firebase || {};
const configured = !!(fb.apiKey && fb.projectId && !String(fb.apiKey).startsWith('COLOCA'));

const loginEl = document.getElementById('login');
const loginMsg = document.getElementById('loginMsg');
const loginBtn = document.getElementById('loginBtn');

function showLogin(msg) {
  if (!loginEl) return;
  loginEl.hidden = false;
  if (loginMsg) loginMsg.textContent = msg || '';
}
function hideLogin() { if (loginEl) loginEl.hidden = true; }

if (configured) {
  const app = initializeApp(fb);
  const auth = getAuth(app);
  let fs;
  try {
    fs = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      ignoreUndefinedProperties: true
    });
  } catch (e) {
    fs = initializeFirestore(app, { ignoreUndefinedProperties: true });
  }

  let resolveReady;
  const ready = new Promise(r => { resolveReady = r; });
  let deniedShown = false;

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  if (loginBtn) loginBtn.addEventListener('click', async () => {
    loginBtn.disabled = true;
    showLogin('A abrir a janela do Google…');
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
        await signInWithRedirect(auth, provider);
        return;
      }
      showLogin(e && e.code === 'auth/popup-closed-by-user'
        ? 'A janela foi fechada antes de terminar. Tenta de novo.'
        : e && e.code === 'auth/unauthorized-domain'
          ? 'Este endereço não está autorizado no Firebase. Vê o passo 3 do README.'
          : 'Não foi possível entrar. Tenta de novo.');
    } finally { loginBtn.disabled = false; }
  });

  // ---------- Entrar com link por email (para TV e browsers onde o Google não deixa entrar) ----------
  // A TV pede um link para o email; abre-se o email no telemóvel; o telemóvel passa o link à TV
  // através de um documento secreto (tvlinks/<id aleatório>) e a TV entra com esse link.
  const HOME = location.origin + location.pathname.replace(/index\.html$/, '');
  const qs = new URLSearchParams(location.search);
  const rnd = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), x => x.toString(16).padStart(2, '0')).join('');
  const relayMsg = (t, ok) => { showLogin(''); if (loginMsg) loginMsg.innerHTML = t; const c = document.querySelector('#login .login-card'); if (c && ok) c.classList.add('relay-ok'); };
  if (isSignInWithEmailLink(auth, location.href)) {
    const tvl = qs.get('tvl');
    if (tvl) {
      // Este aparelho só serve de ponte: entrega o link à TV e não entra.
      setDoc(doc(fs, 'tvlinks/' + tvl), { link: location.href, at: Date.now() }, { merge: true })
        .then(() => relayMsg('✅ <b>Pronto!</b> A TV vai entrar no Quadro dentro de segundos. Podes fechar esta página.', true))
        .catch(() => relayMsg('Não foi possível ligar a TV. Pede um link novo na TV.'));
      history.replaceState(null, '', HOME);
    } else {
      let em = lsGet('fam.linkEmail') || prompt('Confirma o teu email para entrar:') || '';
      signInWithEmailLink(auth, em.trim(), location.href).then(() => history.replaceState(null, '', HOME))
        .catch(() => showLogin('Este link já não é válido. Pede um novo.'));
    }
  }
  const linkForm = document.getElementById('linkForm');
  if (linkForm) linkForm.addEventListener('submit', async ev => {
    ev.preventDefault();
    const em = (document.getElementById('linkEmail').value || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showLogin('Escreve o teu email.'); return; }
    const id = rnd();
    try {
      if (loginMsg) loginMsg.textContent = 'A enviar…';
      await sendSignInLinkToEmail(auth, em, { url: HOME + '?tvl=' + id, handleCodeInApp: true });
      setDoc(doc(fs, 'tvlinks/' + id), { email: em, at: Date.now() }).catch(e => console.warn('tvlinks', e));
      lsSet('fam.linkEmail', em);
      showLogin('');
      if (loginMsg) loginMsg.innerHTML = `📧 Enviámos um email para <b>${em}</b>.<br>Abre-o no <b>telemóvel</b> e toca no link <b>“Sign in to …”</b>. Esta TV entra sozinha. O link vale 1 hora.`;
      const stop = onSnapshot(doc(fs, 'tvlinks/' + id), s => {
        const d = s.exists() ? s.data() : null;
        if (d && d.link) { stop(); if (loginMsg) loginMsg.textContent = 'A entrar…';
          signInWithEmailLink(auth, em, d.link).then(() => deleteDoc(doc(fs, 'tvlinks/' + id)).catch(() => {}))
            .catch(e => showLogin('O link expirou ou já foi usado. Pede um novo.')); }
      }, () => showLogin('Ainda não consigo esperar pelo link (falta ativar esta opção no Firebase).'));
    } catch (e) {
      console.warn('Link por email', e);
      const code = (e && e.code) || '';
      showLogin((code === 'auth/operation-not-allowed' ? 'A entrada por email ainda não está ativada no Firebase.'
        : code === 'permission-denied' ? 'As regras do Firebase ainda não permitem esta entrada.'
        : code === 'auth/unauthorized-continue-uri' || code === 'auth/invalid-continue-uri' ? 'O endereço do Quadro não está autorizado no Firebase.'
        : code === 'auth/quota-exceeded' ? 'Foram pedidos demasiados emails hoje. Tenta amanhã.'
        : 'Não foi possível enviar o email.') + (code ? ' (' + code + ')' : ''));
    }
  });

  onAuthStateChanged(auth, (u) => {
    if (u) {
      backend.user = { uid: u.uid, email: u.email, name: u.displayName };
      hideLogin();
      resolveReady(u);
    } else {
      if (backend.user) { location.reload(); return; }
      showLogin('');
    }
  });

  function denied() {
    if (deniedShown) return;
    deniedShown = true;
    const email = backend.user && backend.user.email;
    showLogin(`A conta ${email || ''} não tem acesso a este Quadro. Pede para adicionarem o teu email às regras do Firebase, ou entra com outra conta.`);
    const again = document.getElementById('loginOut');
    if (again) { again.hidden = false; again.onclick = () => signOut(auth); }
  }
  function mapErr(e) {
    if (e && e.code === 'permission-denied') { denied(); return { code: 'invalid_argument', message: e.message }; }
    if (e && e.code === 'resource-exhausted') return { code: 'quota_exceeded', message: e.message };
    return { code: 'unavailable', message: (e && e.message) || String(e) };
  }
  const wrap = p => p.catch(e => { throw mapErr(e); });

  function docRef(path) {
    const ref = doc(fs, path);
    return {
      id: ref.id, path,
      set: data => wrap(setDoc(ref, data)),
      update: data => wrap(setDoc(ref, data, { merge: true })),
      delete: () => wrap(deleteDoc(ref)),
      get: () => wrap(getDoc(ref).then(s => ({ id: s.id, exists: s.exists(), data: () => s.data() }))),
      onSnapshot: (next, err) => onSnapshot(ref,
        s => next({ id: s.id, exists: s.exists(), data: () => s.data() }),
        e => { const m = mapErr(e); if (err) err(m); })
    };
  }
  function colRef(path) {
    return {
      path,
      doc: id => docRef(path + '/' + (id || Math.random().toString(36).slice(2) + Date.now().toString(36))),
      onSnapshot: (next, err) => onSnapshot(collection(fs, path),
        snap => next({ docs: snap.docs.map(d => ({ id: d.id, exists: true, data: () => d.data() })), size: snap.size, empty: snap.empty }),
        e => { const m = mapErr(e); if (err) err(m); })
    };
  }
  const db = { doc: docRef, collection: colRef };

  const userNs = {
    id: async () => (await ready).uid,
    me: async () => backend.user,
    isOwner: () => false,
    canEdit: () => true,
    can: async () => true
  };

  // ---------- Google Calendar (autorização por redirecionamento, sem servidor) ----------
  // A página vai ao Google e volta com um token (válido ~1 hora), guardado neste aparelho.
  // Mais fiável do que a janela pop-up, que alguns browsers isolam da página.
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const lsDel = k => { try { localStorage.removeItem(k); } catch (e) {} };
  const REDIRECT = location.origin + location.pathname.replace(/index\.html$/, '');
  let token = null, tokenExp = 0, retAuth = '', retErr = null;
  try { const t = JSON.parse(lsGet('fam.gtoken') || 'null'); if (t && t.exp > Date.now()) { token = t.t; tokenExp = t.exp; } } catch (e) {}

  // Regresso do Google: #access_token=...&expires_in=...&state=...
  (function readReturn() {
    if (!location.hash || location.hash.length < 2) return;
    const h = new URLSearchParams(location.hash.slice(1));
    if (!h.get('access_token') && !h.get('error')) return;
    const okState = h.get('state') && h.get('state') === lsGet('fam.gstate');
    history.replaceState(null, '', location.pathname + location.search + (lsGet('fam.ghash') || ''));
    lsDel('fam.gstate');
    if (!okState) return;
    if (h.get('access_token')) {
      const granted = (h.get('scope') || '').split(' ');
      if (!granted.some(x => x.includes('calendar'))) { retErr = { code: 'scope_missing', message: 'sem acesso ao calendário' }; return; }
      token = h.get('access_token');
      tokenExp = Date.now() + (Number(h.get('expires_in')) || 3600) * 1000;
      lsSet('fam.gtoken', JSON.stringify({ t: token, exp: tokenExp }));
      lsSet('fam.gconsent', '1');
      retAuth = lsGet('fam.afterAuth') || 'sync';
    } else {
      retErr = { code: 'approval_required', message: h.get('error') };
    }
    lsDel('fam.afterAuth');
  })();

  function goAuthorize() {
    const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
    lsSet('fam.gstate', state);
    lsSet('fam.ghash', location.hash && !location.hash.includes('access_token') ? location.hash : '');
    if (backend.afterAuth) lsSet('fam.afterAuth', backend.afterAuth);
    const q = new URLSearchParams({
      client_id: cfg.googleClientId, redirect_uri: REDIRECT, response_type: 'token',
      scope: SCOPES, include_granted_scopes: 'true', state
    });
    if (backend.user && backend.user.email) q.set('login_hint', backend.user.email);
    if (!lsGet('fam.gconsent')) q.set('prompt', 'consent');
    location.assign('https://accounts.google.com/o/oauth2/v2/auth?' + q);
  }
  function getToken() {
    if (token && Date.now() < tokenExp - 60000) return Promise.resolve(token);
    // Só vai ao Google quando a pessoa pediu (abrir "O meu Google", sincronizar, enviar um evento).
    if (!(backend.interactiveUntil > Date.now())) return Promise.reject({ code: 'approval_required', message: 'precisa de um toque' });
    backend.interactiveUntil = 0;
    goAuthorize();
    return new Promise(() => {}); // a página vai mudar para o Google
  }
  async function gapi(path, opts = {}) {
    const t = await getToken();
    const r = await fetch('https://www.googleapis.com/calendar/v3/' + path, {
      ...opts,
      headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }
    });
    if (r.status === 401) { token = null; lsDel('fam.gtoken'); throw { code: 'approval_required', message: 'token expirado' }; }
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw { code: r.status >= 500 ? 'server_unavailable' : 'tool_error', message: (j.error && j.error.message) || r.statusText };
    }
    return r.status === 204 ? {} : r.json();
  }
  const toRfc = local => new Date(local).toISOString();
  const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon';
  const enc = encodeURIComponent;

  const tools = {
    async list_calendars(input = {}) {
      const q = new URLSearchParams({ maxResults: String(input.pageSize || 250) });
      if (input.pageToken) q.set('pageToken', input.pageToken);
      const j = await gapi('users/me/calendarList?' + q);
      return {
        calendars: (j.items || []).map(c => ({ id: c.id, summary: c.summaryOverride || c.summary, timeZone: c.timeZone, accessRole: c.accessRole, primary: !!c.primary })),
        nextPageToken: j.nextPageToken
      };
    },
    async list_events(input = {}) {
      const q = new URLSearchParams({ singleEvents: 'true', orderBy: 'startTime', maxResults: String(input.pageSize || 250) });
      if (input.startTime) q.set('timeMin', toRfc(input.startTime));
      if (input.endTime) q.set('timeMax', toRfc(input.endTime));
      if (input.pageToken) q.set('pageToken', input.pageToken);
      const j = await gapi('calendars/' + enc(input.calendarId || 'primary') + '/events?' + q);
      return { events: j.items || [], nextPageToken: j.nextPageToken, summary: j.summary };
    },
    async create_event(input = {}) {
      const body = { summary: input.summary, description: input.description, location: input.location };
      if (input.allDay) {
        body.start = { date: input.startTime.slice(0, 10) };
        body.end = { date: input.endTime.slice(0, 10) };
      } else {
        body.start = { dateTime: input.startTime, timeZone: TZ };
        body.end = { dateTime: input.endTime, timeZone: TZ };
      }
      if (input.recurrenceData) body.recurrence = input.recurrenceData;
      body.reminders = input.noReminders ? { useDefault: false, overrides: [] } : { useDefault: true };
      if (input.props) body.extendedProperties = { private: input.props };
      const j = await gapi('calendars/' + enc(input.calendarId || 'primary') + '/events', { method: 'POST', body: JSON.stringify(body) });
      return { id: j.id, htmlLink: j.htmlLink };
    },
    async update_event(input = {}) {
      const body = {};
      if (input.summary != null) body.summary = input.summary;
      if (input.location != null) body.location = input.location;
      if (input.description != null) body.description = input.description;
      if (input.startTime) {
        if (input.allDay) { body.start = { date: input.startTime.slice(0, 10) }; body.end = { date: input.endTime.slice(0, 10) }; }
        else { body.start = { dateTime: input.startTime, timeZone: TZ }; body.end = { dateTime: input.endTime, timeZone: TZ }; }
      }
      if (input.props) body.extendedProperties = { private: input.props };
      const j = await gapi('calendars/' + enc(input.calendarId || 'primary') + '/events/' + enc(input.eventId), { method: 'PATCH', body: JSON.stringify(body) });
      return { id: j.id };
    },
    async delete_event(input = {}) {
      await gapi('calendars/' + enc(input.calendarId || 'primary') + '/events/' + enc(input.eventId), { method: 'DELETE' });
      return { ok: true };
    }
  };
  const mcpNs = {
    async callTool(server, tool, input) {
      if (!tools[tool]) throw { code: 'not_in_manifest', message: tool };
      const payload = await tools[tool](input || {});
      return { content: [], payload };
    }
  };

  // ---------- fotografias: guardadas como imagem reduzida (data URL) ----------
  const assetsNs = {
    upload: blob => new Promise((res, rej) => {
      if (blob.size > 700000) return rej({ code: 'too_big', message: 'imagem demasiado grande' });
      const fr = new FileReader();
      fr.onload = () => res({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), url: fr.result, sizeBytes: blob.size, contentType: blob.type });
      fr.onerror = () => rej({ code: 'unavailable', message: 'leitura falhou' });
      fr.readAsDataURL(blob);
    }),
    delete: async () => {}
  };

  const backend = {
    user: null,
    interactiveUntil: 0,
    afterAuth: '',
    justAuthorized: retAuth,
    authError: retErr,
    signOut: () => signOut(auth),
    async use(name) {
      await ready;
      if (name === 'db') return db;
      if (name === 'user') return userNs;
      if (name === 'assets') return assetsNs;
      if (name === 'mcp') {
        if (!cfg.googleClientId || String(cfg.googleClientId).startsWith('COLOCA')) return null;
        return mcpNs;
      }
      return null;
    }
  };
  window.famBackend = backend;
} else {
  hideLogin();
}
