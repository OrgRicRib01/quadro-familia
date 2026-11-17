// Servidor do forno (Samsung SmartThings) para o Quadro da Família.
// Guarda a autorização da Samsung cifrada e renova-a sozinho. O token da Samsung nunca chega ao browser.
//
// Variáveis de ambiente (Vercel → Settings → Environment Variables):
//   ST_KEY          chave de cifra (32 bytes em base64)                — obrigatória
//   FAMILY_EMAILS   emails da família separados por vírgulas            — obrigatória
//   FIREBASE_PROJECT_ID  ex.: quadro-familia-9cb10                      — obrigatória
//   ALLOWED_ORIGIN  ex.: https://orgricrib01.github.io                   — obrigatória
//   RETURN_URL      página do Quadro para onde voltar depois da Samsung — ex.: https://orgricrib01.github.io/quadro-familia/
import { createRemoteJWKSet, jwtVerify } from 'jose';
import crypto from 'node:crypto';

const ST = 'https://api.smartthings.com/v1';
const PID = process.env.FIREBASE_PROJECT_ID;
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const SCOPES = ['r:devices:*', 'x:devices:*', 'r:locations:*'];
// Só se deixam enviar comandos destas capacidades (e só as que o forno declara).
const CMD_OK = /^(samsungce\.)?(ovenOperatingState|ovenMode|ovenSetpoint|lamp|kidsLock|doorLock)$|^switch$|^samsungce\.(lamp|ovenOperatingState|ovenMode|meatProbe)$/;

// (substituível nos testes)
export const _t = { verify: t => jwtVerify(t, JWKS, { issuer: 'https://securetoken.google.com/' + PID, audience: PID }) };
const norm = e => String(e || '').trim().toLowerCase().replace('@googlemail.com', '@gmail.com');
const FAMILY = new Set(String(process.env.FAMILY_EMAILS || '').split(',').map(norm).filter(Boolean));

// ---------- cifra (AES-256-GCM) ----------
function key() { const k = Buffer.from(process.env.ST_KEY || '', 'base64'); if (k.length !== 32) throw httpErr(500, 'ST_KEY em falta ou inválida'); return k; }
function enc(obj) { const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const ct = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]); return Buffer.concat([iv, c.getAuthTag(), ct]).toString('base64url'); }
function dec(s) { const b = Buffer.from(String(s || ''), 'base64url'); const d = crypto.createDecipheriv('aes-256-gcm', key(), b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28)); return JSON.parse(Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8')); }

function httpErr(status, msg, extra) { const e = new Error(msg); e.status = status; Object.assign(e, extra || {}); return e; }

// ---------- quem está a pedir ----------
async function family(idToken) {
  if (!idToken) throw httpErr(401, 'Sem sessão');
  const { payload } = await _t.verify(idToken).catch(() => { throw httpErr(401, 'Sessão inválida'); });
  if (!payload.email_verified || !FAMILY.has(norm(payload.email))) throw httpErr(403, 'Esta conta não é da família');
  return payload;
}

// ---------- cofre no Firestore (documento secure/smartthings, conteúdo cifrado) ----------
const DOC = () => `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)/documents/secure/smartthings`;
async function vaultGet(idToken) {
  const r = await fetch(DOC(), { headers: { Authorization: 'Bearer ' + idToken } });
  if (r.status === 404) return { data: null, updateTime: null };
  if (!r.ok) throw httpErr(502, 'Não consegui ler o cofre (' + r.status + ')');
  const j = await r.json(); const blob = j.fields && j.fields.blob && j.fields.blob.stringValue;
  return { data: blob ? dec(blob) : null, updateTime: j.updateTime };
}
async function vaultPut(idToken, data, updateTime) {
  const q = updateTime ? '?currentDocument.updateTime=' + encodeURIComponent(updateTime) : '';
  const r = await fetch(DOC() + q, { method: 'PATCH', headers: { Authorization: 'Bearer ' + idToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { blob: { stringValue: enc(data) }, updatedAt: { timestampValue: new Date().toISOString() } } }) });
  if (r.status === 400 || r.status === 409 || r.status === 412) return false; // outro aparelho atualizou ao mesmo tempo
  if (!r.ok) throw httpErr(502, 'Não consegui guardar no cofre (' + r.status + ')');
  return true;
}
async function vaultDel(idToken) { await fetch(DOC(), { method: 'DELETE', headers: { Authorization: 'Bearer ' + idToken } }); }

// ---------- SmartThings ----------
function basic(v) { return 'Basic ' + Buffer.from(v.cid + ':' + v.csec).toString('base64'); }
async function tokenReq(v, params) {
  const r = await fetch(ST + '/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', Authorization: basic(v) },
    body: new URLSearchParams({ ...params, client_id: v.cid }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw httpErr(r.status === 400 || r.status === 401 ? 409 : 502, 'A Samsung recusou a autorização. Volta a ligar o forno.', { reauth: true });
  return { at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 86000) * 1000 };
}
// devolve um token de acesso válido, renovando se faltar pouco para expirar
async function access(idToken) {
  for (let i = 0; i < 3; i++) {
    const { data: v, updateTime } = await vaultGet(idToken);
    // modo token pessoal: a Samsung só o deixa válido 24 horas
    if (v && v.mode === 'pat') { if (Date.now() < v.patExp) return v.pat; throw httpErr(409, 'O token da Samsung expirou. Cola um novo.', { patExpired: true }); }
    if (!v || !v.cid) throw httpErr(409, 'O forno ainda não está ligado', { setup: true });
    if (!v.rt) throw httpErr(409, 'Falta autorizar na Samsung', { reauth: true });
    if (v.exp - Date.now() > 10 * 60 * 1000) return v.at;
    const t = await tokenReq(v, { grant_type: 'refresh_token', refresh_token: v.rt });
    if (await vaultPut(idToken, { ...v, ...t }, updateTime)) return t.at;
  }
  throw httpErr(503, 'Tenta de novo daqui a pouco');
}
async function st(at, path, opt) {
  const r = await fetch(ST + path, { ...(opt || {}), headers: { Authorization: 'Bearer ' + at, Accept: 'application/json', ...(opt && opt.body ? { 'Content-Type': 'application/json' } : {}) } });
  const j = await r.json().catch(() => ({}));
  if (r.status === 429) throw httpErr(429, 'A Samsung pediu para esperar um pouco');
  if (r.status === 401) throw httpErr(409, 'A autorização da Samsung expirou. Volta a ligar o forno.', { reauth: true });
  if (!r.ok) throw httpErr(r.status === 404 ? 404 : 502, (j.error && (j.error.message || j.error.code)) || ('SmartThings ' + r.status));
  return j;
}
const callback = req => 'https://' + req.headers.host + '/api/st?a=cb';
function authUrl(req, v, idToken) {
  const state = enc({ idt: idToken, t: Date.now() });
  return ST + '/oauth/authorize?' + new URLSearchParams({ client_id: v.cid, response_type: 'code', redirect_uri: callback(req), scope: SCOPES.join(' '), state });
}
const isOven = d => (d.components || []).some(c => (c.capabilities || []).some(x => /oven/i.test(x.id)));
const caps = d => (d.components || []).map(c => ({ id: c.id, label: c.label || '', capabilities: (c.capabilities || []).map(x => x.id) }));

// ---------- pedidos ----------
export default async function handler(req, res) {
  const origin = process.env.ALLOWED_ORIGIN || '';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const a = String((req.query && req.query.a) || '');
  try {
    // regresso da Samsung depois de autorizar
    if (a === 'hook') return res.status(200).json({ ok: true });
    if (a === 'cb') {
      const back = (process.env.RETURN_URL || '/') + '#forno=';
      if (req.query.error) return res.redirect(302, back + 'recusado');
      let s; try { s = dec(req.query.state); } catch (e) { return res.redirect(302, back + 'erro'); }
      if (!s || Date.now() - s.t > 20 * 60 * 1000) return res.redirect(302, back + 'expirou');
      const { data: v, updateTime } = await vaultGet(s.idt);
      if (!v || !v.cid) return res.redirect(302, back + 'erro');
      const t = await tokenReq(v, { grant_type: 'authorization_code', code: String(req.query.code || ''), redirect_uri: callback(req) });
      await vaultPut(s.idt, { ...v, ...t, since: Date.now() }, updateTime);
      return res.redirect(302, back + 'ok');
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Usa POST' });
    const idToken = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    await family(idToken);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (a === 'ping') { const { data: v } = await vaultGet(idToken);
      if (v && v.mode === 'pat') return res.json({ ok: true, mode: 'pat', linked: Date.now() < v.patExp, patExp: v.patExp });
      return res.json({ ok: true, setup: !!(v && v.cid), linked: !!(v && v.rt) }); }

    // alternativa sem app: guarda o token pessoal (cifrado) e usa-o enquanto for válido (24 h)
    if (a === 'usepat') {
      const pat = String(body.pat || '').trim(); if (!/^[0-9a-f-]{30,}$/i.test(pat)) throw httpErr(400, 'Esse token não parece válido');
      const r = await fetch(ST + '/devices', { headers: { Authorization: 'Bearer ' + pat, Accept: 'application/json' } });
      if (!r.ok) throw httpErr(400, 'A Samsung recusou o token (' + r.status + ').');
      const { updateTime } = await vaultGet(idToken);
      const exp = Date.now() + 23.5 * 3600 * 1000;
      await vaultPut(idToken, { mode: 'pat', pat, patExp: exp }, updateTime);
      return res.json({ ok: true, patExp: exp });
    }

    // 1.ª vez: cria a app "Quadro da Família" na conta Samsung com um token pessoal (usado só aqui e descartado)
    if (a === 'setup') {
      const pat = String(body.pat || '').trim(); if (!pat) throw httpErr(400, 'Falta o token pessoal da Samsung');
      const base = { appName: 'quadro-familia-' + crypto.randomBytes(4).toString('hex'), displayName: 'Quadro da Familia', description: 'Painel da familia (forno)',
        singleInstance: true, appType: 'API_ONLY', classifications: ['CONNECTED_SERVICE'],
        oauth: { clientName: 'Quadro da Familia', scope: SCOPES, redirectUris: [callback(req)] } };
      // algumas contas pedem o bloco apiOnly, outras recusam-no vazio: tenta as duas formas
      // a forma usada pela SmartThings CLI (sem parâmetros) primeiro; depois variantes
      const variants = [['', base], ['', { ...base, apiOnly: {} }], ['?signatureType=ST_PADLOCK&requireConfirmation=false', base],
        ['', { ...base, apiOnly: { targetUrl: 'https://' + req.headers.host + '/api/st?a=hook' } }]];
      let r, j, why = [];
      for (const [qs, appBody] of variants) {
        r = await fetch(ST + '/apps' + qs, { method: 'POST',
          headers: { Authorization: 'Bearer ' + pat, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(appBody) });
        j = await r.json().catch(() => ({}));
        if (r.ok && j.oauthClientId) break;
        const det = j.error ? [j.error.code, j.error.message, ...((j.error.details || []).map(d => (d.target ? d.target + ': ' : '') + (d.message || d.code)))].filter(Boolean).join(' · ') : '';
        why.push(r.status + (det ? ' ' + det : ''));
        console.warn('forno setup: SmartThings respondeu', r.status, det.slice(0, 400));
        if (r.status === 401) break; // token inválido: não vale a pena tentar outras formas
      }
      if (!r.ok || !j.oauthClientId) throw httpErr(r.status === 401 || r.status === 403 ? 400 : 502,
        'A Samsung não aceitou criar a ligação (' + why.join(' | ').slice(0, 300) + ').' + (r.status === 401 || r.status === 403 ? ' O token não tem permissão para criar apps.' : ''));
      const v = { cid: j.oauthClientId, csec: j.oauthClientSecret, appId: j.app && j.app.appId };
      const cur = await vaultGet(idToken);
      await vaultPut(idToken, v, cur.updateTime);
      return res.json({ ok: true, authUrl: authUrl(req, v, idToken) });
    }
    if (a === 'authurl') { const { data: v } = await vaultGet(idToken); if (!v || !v.cid) throw httpErr(409, 'O forno ainda não está ligado', { setup: true });
      return res.json({ authUrl: authUrl(req, v, idToken) }); }
    if (a === 'disconnect') { await vaultDel(idToken); return res.json({ ok: true }); }

    const at = await access(idToken);
    if (a === 'devices') {
      const j = await st(at, '/devices');
      const all = (j.items || []).map(d => ({ id: d.deviceId, label: d.label || d.name, name: d.name, oven: isOven(d), components: caps(d) }));
      return res.json({ devices: all });
    }
    if (a === 'status') {
      const id = String(body.id || ''); if (!/^[0-9a-f-]{20,}$/i.test(id)) throw httpErr(400, 'Dispositivo inválido');
      const [s, h] = await Promise.all([st(at, '/devices/' + id + '/status'), st(at, '/devices/' + id + '/health').catch(() => null)]);
      return res.json({ status: s, health: h && h.state ? h.state : null, at: Date.now() });
    }
    if (a === 'cmd') {
      const id = String(body.id || ''); if (!/^[0-9a-f-]{20,}$/i.test(id)) throw httpErr(400, 'Dispositivo inválido');
      const { component = 'main', capability, command } = body; const args = Array.isArray(body.args) ? body.args : [];
      if (!CMD_OK.test(String(capability))) throw httpErr(403, 'Este comando não é permitido no Quadro');
      const d = await st(at, '/devices/' + id);
      const comp = (d.components || []).find(c => c.id === component);
      if (!comp || !(comp.capabilities || []).some(x => x.id === capability)) throw httpErr(400, 'O forno não tem essa função');
      const h = await st(at, '/devices/' + id + '/health').catch(() => null);
      if (h && h.state === 'OFFLINE') throw httpErr(409, 'O forno está sem ligação');
      const r = await st(at, '/devices/' + id + '/commands', { method: 'POST', body: JSON.stringify({ commands: [{ component, capability, command: String(command), arguments: args }] }) });
      return res.json({ ok: true, results: r.results || [] });
    }
    return res.status(404).json({ error: 'Ação desconhecida' });
  } catch (e) {
    const status = e.status || 500;
    console.warn('forno', a, status, e.message);
    return res.status(status).json({ error: e.message || 'Erro', setup: !!e.setup, reauth: !!e.reauth, patExpired: !!e.patExpired });
  }
}
