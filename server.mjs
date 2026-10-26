import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Store } from './lib/store.mjs';
const root = path.dirname(fileURLToPath(import.meta.url));
const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); };
const equal = (a, b) => { const x = crypto.createHash('sha256').update(a).digest(), y = crypto.createHash('sha256').update(b).digest(); return crypto.timingSafeEqual(x, y); };
const asset = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="#eee7d8"/><circle cx="400" cy="230" r="115" fill="#b49249"/><path d="M310 260 Q400 110 490 260 Q400 330 310 260" fill="#313832"/><text x="400" y="410" text-anchor="middle" font-family="serif" font-size="24" fill="#313832">CONTROLLED CANARY TEST</text></svg>';
export function createApp({ directory, adminToken = crypto.randomBytes(32).toString('base64url'), key, now } = {}) {
  if (typeof adminToken !== 'string' || adminToken.length < 24) throw new Error('Console token must contain at least 24 characters');
  const stateDirectory = directory || path.join(root, '.mastro-state');
  fs.mkdirSync(stateDirectory, { recursive: true, mode: 0o700 });
  const lock = path.join(stateDirectory, 'server.lock');
  const lockFD = fs.openSync(lock, 'wx', 0o600); fs.writeFileSync(lockFD, String(process.pid)); fs.closeSync(lockFD);
  let store;
  try { store = new Store(stateDirectory, { key, now }); }
  catch (error) { fs.unlinkSync(lock); throw error; }
  const sessions = new Map(); let failures = [];
  const maintenance = setInterval(() => { try { store.prune(); } catch { /* retain unreadable evidence; request handlers report failure */ } }, 60000); maintenance.unref();
  const server = http.createServer(async (req, res) => {
    const port = server.address().port, origin = `http://127.0.0.1:${port}`;
    for (const [header, value] of Object.entries({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" })) res.setHeader(header, value);
    if (req.headers.host !== `127.0.0.1:${port}`) { json(res, 421, { error: 'Use the printed loopback address' }); return; }
    try {
      const url = new URL(req.url, origin), pathname = url.pathname;
      const bearer = req.headers.authorization?.startsWith('Bearer ') && equal(req.headers.authorization.slice(7), adminToken);
      const cookie = /(?:^|;\s*)mastro_session=([A-Za-z0-9_-]+)/.exec(req.headers.cookie || '')?.[1];
      const sessionValid = cookie && (sessions.get(cookie) || 0) > Date.now();
      const body = async () => { if (req.headers['content-type'] !== 'application/json') throw new Error('JSON required'); let bytes = 0, data = ''; for await (const part of req) { bytes += part.length; if (bytes > 8192) throw new Error('Body too large'); data += part; } return JSON.parse(data || '{}'); };
      if (pathname === '/api/unlock' && req.method === 'POST') {
        if (req.headers.origin !== origin) { json(res, 403, { error: 'Origin refused' }); return; }
        failures = failures.filter(at => Date.now() - at < 60000);
        if (failures.length >= 10) { json(res, 429, { error: 'Pause before another unlock attempt' }); return; }
        const value = await body();
        if (typeof value.token !== 'string' || !equal(value.token, adminToken)) { failures.push(Date.now()); json(res, 401, { error: 'Console token not accepted' }); return; }
        const session = crypto.randomBytes(32).toString('base64url'); sessions.set(session, Date.now() + 3600000);
        for (const [token, expiry] of sessions) if (expiry <= Date.now()) sessions.delete(token);
        if (sessions.size > 50) sessions.delete(sessions.keys().next().value);
        res.setHeader('Set-Cookie', `mastro_session=${session}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=3600`); json(res, 200, { ok: true }); return;
      }
      if (pathname.startsWith('/api/')) {
        if (!bearer && !sessionValid) { json(res, 401, { error: 'Unlock the operator console' }); return; }
        if (!['GET', 'HEAD'].includes(req.method) && !bearer && req.headers.origin !== origin) { json(res, 403, { error: 'Origin refused' }); return; }
        if (pathname === '/api/runs' && req.method === 'GET') { json(res, 200, { runs: store.list() }); return; }
        if (pathname === '/api/runs' && req.method === 'POST') { json(res, 201, store.create(await body())); return; }
        const match = /^\/api\/runs\/([a-f0-9-]{36})(?:\/(report|stop))?$/.exec(pathname);
        if (match && match[2] === 'report' && req.method === 'GET') { const report = store.report(match[1]); json(res, report ? 200 : 404, report || { error: 'Run unavailable' }); return; }
        if (match && match[2] === 'stop' && req.method === 'POST') { json(res, store.stop(match[1]) ? 200 : 404, { state: 'stopped' }); return; }
        if (match && !match[2] && req.method === 'DELETE') { json(res, store.purge(match[1]) ? 200 : 404, { state: 'purged' }); return; }
        json(res, 404, { error: 'Unknown operation' }); return;
      }
      const route = /^\/r\/([A-Za-z0-9_-]{43})(?:\/(image.svg|callback))?$/.exec(pathname);
      if (route && req.method === 'GET') {
        const type = route[2] === 'image.svg' ? 'image_asset' : route[2] === 'callback' ? 'vlm_callback' : 'metadata_page';
        if (!store.record(route[1], type)) { json(res, 410, { error: 'Test run inactive or unavailable' }); return; }
        if (type === 'vlm_callback') { json(res, 200, { received: true, inference: 'UNKNOWN' }); return; }
        if (type === 'image_asset') { res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); res.end(asset); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta property="og:title" content="Controlled canary test"><meta property="og:image" content="${origin}/r/${route[1]}/image.svg"><title>Controlled canary test</title><link rel="stylesheet" href="/style.css"><main class="test-page"><p class="eyebrow">MASTRO TITTA / CONTROLLED TEST</p><h1>A request reached this route.</h1><p>This page and its image can produce separate origin events. Neither establishes a human view or identity.</p><img src="/r/${route[1]}/image.svg" alt="Inert controlled canary test image"></main></html>`); return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') { json(res, 405, { error: 'Method unavailable' }); return; }
      const files = { '/': ['public/index.html', 'text/html'], '/app.js': ['public/app.js', 'text/javascript'], '/style.css': ['public/style.css', 'text/css'], '/icon.png': ['icon-v2.png', 'image/png'] };
      if (!files[pathname]) { json(res, 404, { error: 'Route unavailable' }); return; }
      const [file, type] = files[pathname]; res.writeHead(200, { 'Content-Type': type + (type.startsWith('text/') ? '; charset=utf-8' : '') }); res.end(req.method === 'HEAD' ? undefined : fs.readFileSync(path.join(root, file)));
    } catch (error) { json(res, /Invalid run|JSON required|Body too large|JSON/.test(error.message) ? 400 : 503, { error: 'Request could not be completed; no success is assumed' }); }
  });
  server.on('close', () => { clearInterval(maintenance); if (fs.existsSync(lock)) fs.unlinkSync(lock); });
  return { server, store, adminToken };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const keyText = process.env.MASTRO_STORE_KEY;
  const app = createApp({ directory: process.env.MASTRO_STATE_DIR, adminToken: process.env.MASTRO_ADMIN_TOKEN || undefined, key: keyText ? Buffer.from(keyText, 'base64') : undefined });
  app.server.listen(Number(process.env.PORT || 0), '127.0.0.1', () => { console.log(`Mastro Titta prototype: http://127.0.0.1:${app.server.address().port}\nConsole token: ${app.adminToken}\nLocal only. A request is not a person. No Google report is sent.`); });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => app.server.close(() => process.exit(0)));
}
