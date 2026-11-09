// Liga a app ao Firebase (dados partilhados + entrada com Google) e ao Google Calendar.
// Expõe window.famBackend.use(nome) com as mesmas peças que a app espera:
//   db      → base de dados partilhada (Firestore)
//   user    → quem está a usar
//   mcp     → Google Calendar (list_calendars, list_events, create_event)
//   assets  → fotografias da moldura (guardadas como imagem reduzida no Firestore)
// Sem config.js preenchido a app corre em modo de demonstração (nada é guardado).

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut
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

  // ---------- Google Calendar (Google Identity Services, sem servidor) ----------
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
  let tokenClient = null, token = null, tokenExp = 0;
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  function waitForGis() {
    return new Promise((res, rej) => {
      let n = 0;
      (function check() {
        if (window.google && google.accounts && google.accounts.oauth2) return res();
        if (++n > 100) return rej({ code: 'server_unavailable', message: 'Google Identity não carregou' });
        setTimeout(check, 100);
      })();
    });
  }
  function getToken() {
    if (token && Date.now() < tokenExp - 60000) return Promise.resolve(token);
    // O Google só abre o pedido de autorização a partir de um toque/clique.
    // Só abre o pedido do Google quando a pessoa pediu (abrir "O meu Google", sincronizar, enviar um evento).
    const active = !navigator.userActivation || navigator.userActivation.isActive;
    if (!active || !(backend.interactiveUntil > Date.now())) return Promise.reject({ code: 'approval_required', message: 'precisa de um toque' });
    backend.interactiveUntil = 0;
    if (!tokenClient) {
      if (!(window.google && google.accounts && google.accounts.oauth2)) {
        return Promise.reject({ code: 'server_unavailable', message: 'Google Identity ainda a carregar' });
      }
      tokenClient = google.accounts.oauth2.initTokenClient({ client_id: cfg.googleClientId, scope: SCOPES, callback: () => {} });
    }
    return new Promise((res, rej) => {
      tokenClient.callback = r => {
        if (!r || r.error) return rej({ code: 'approval_required', message: (r && r.error) || 'recusado' });
        // No ecrã de autorização a pessoa tem de marcar as caixas do Google Calendar.
        if (google.accounts.oauth2.hasGrantedAnyScope && !google.accounts.oauth2.hasGrantedAnyScope(r, 'https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events')) {
          return rej({ code: 'scope_missing', message: 'caixas do Google Calendar por marcar' });
        }
        token = r.access_token;
        tokenExp = Date.now() + (Number(r.expires_in) || 3600) * 1000;
        lsSet('fam.gconsent', '1');
        res(token);
      };
      tokenClient.error_callback = e => rej({ code: 'approval_required', message: (e && e.type) || 'fechado' });
      tokenClient.requestAccessToken({
        prompt: lsGet('fam.gconsent') ? '' : 'consent',
        hint: backend.user && backend.user.email || undefined
      });
    });
  }
  async function gapi(path, opts = {}) {
    const t = await getToken();
    const r = await fetch('https://www.googleapis.com/calendar/v3/' + path, {
      ...opts,
      headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }
    });
    if (r.status === 401) { token = null; throw { code: 'approval_required', message: 'token expirado' }; }
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
        calendars: (j.items || []).map(c => ({ id: c.id, summary: c.summaryOverride || c.summary, timeZone: c.timeZone })),
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
      body.reminders = { useDefault: true };
      const j = await gapi('calendars/' + enc(input.calendarId || 'primary') + '/events', { method: 'POST', body: JSON.stringify(body) });
      return { id: j.id, htmlLink: j.htmlLink };
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
    signOut: () => signOut(auth),
    async use(name) {
      await ready;
      if (name === 'db') return db;
      if (name === 'user') return userNs;
      if (name === 'assets') return assetsNs;
      if (name === 'mcp') {
        if (!cfg.googleClientId || String(cfg.googleClientId).startsWith('COLOCA')) return null;
        try { await waitForGis(); } catch (e) { return null; }
        return mcpNs;
      }
      return null;
    }
  };
  window.famBackend = backend;
} else {
  hideLogin();
}
