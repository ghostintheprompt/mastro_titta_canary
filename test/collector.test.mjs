import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import http from 'node:http';
import { Store } from '../lib/store.mjs';
import { createApp } from '../server.mjs';
const token = 'synthetic-local-console-token-0123456789';
function folder(t) { const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mastro-test-')); t.after(() => fs.rmSync(directory, { recursive: true, force: true })); return directory; }
async function app(t, options = {}) {
  const directory = folder(t), result = createApp({ directory, adminToken: token, ...options });
  result.server.listen(0, '127.0.0.1'); await once(result.server, 'listening');
  const base = `http://127.0.0.1:${result.server.address().port}`;
  t.after(async () => { result.server.closeAllConnections(); await new Promise(resolve => result.server.close(resolve)); });
  const request = (route, options = {}) => fetch(base + route, { ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers } });
  return { ...result, base, directory, request };
}
test('minimal event schema excludes headers, identity and query values', t => {
  const store = new Store(folder(t)), run = store.create();
  const event = store.record(run.token, 'metadata_page');
  assert.deepEqual(Object.keys(event).sort(), ['run_id','event_id','event_type','observed_at','route_version','test_case'].sort());
  assert.equal(store.report(run.id).unknowns.identity, 'UNKNOWN');
  assert.equal(store.report(run.id).unknowns.providerAction, 'UNKNOWN');
  assert.equal(store.state.runs[0].token, undefined);
});
test('retries are distinct events, never unique people', t => {
  const store = new Store(folder(t)), run = store.create();
  const a = store.record(run.token, 'image_asset'), b = store.record(run.token, 'image_asset');
  assert.notEqual(a.event_id, b.event_id); assert.equal(store.report(run.id).summary.requests, 2); assert.equal(store.report(run.id).uniquePeople, undefined);
});
test('unknown token or route stores no event', t => {
  const store = new Store(folder(t)), run = store.create();
  assert.equal(store.record('not-valid', 'image_asset'), null); assert.equal(store.record(run.token, 'unknown'), null); assert.equal(store.state.events.length, 0);
});
test('stop rejects later collection and purge deletes run/events', t => {
  const store = new Store(folder(t)), run = store.create(); store.record(run.token, 'metadata_page');
  assert.equal(store.stop(run.id), true); assert.equal(store.record(run.token, 'image_asset'), null); assert.equal(store.report(run.id).summary.requests, 1);
  assert.equal(store.purge(run.id), true); assert.equal(store.report(run.id), null); assert.equal(store.state.events.length, 0);
});
test('expiry and retention are exercised with an injected clock and survive reload', t => {
  const directory = folder(t); let now = Date.parse('2026-10-26T12:00:00Z');
  const store = new Store(directory, { now: () => now }), run = store.create({ minutes: 1, retentionHours: 1 });
  store.record(run.token, 'metadata_page'); now += 60000;
  assert.equal(store.record(run.token, 'image_asset'), null); assert.equal(store.list()[0].status, 'expired');
  now += 3600000; const restored = new Store(directory, { now: () => now }); assert.deepEqual(restored.list(), []); assert.equal(restored.state.events.length, 0);
});
test('encrypted persistence omits plaintext and rejects tampering without overwriting', t => {
  const directory = folder(t), store = new Store(directory), run = store.create({ title: 'PRIVATE_SYNTHETIC_TITLE' }); store.record(run.token, 'metadata_page');
  const file = path.join(directory, 'events.enc.json'), bytes = fs.readFileSync(file);
  assert.ok(!bytes.includes(Buffer.from('PRIVATE_SYNTHETIC_TITLE'))); assert.ok(!bytes.includes(Buffer.from(run.token)));
  assert.equal(new Store(directory).report(run.id).summary.requests, 1);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600); assert.equal(fs.statSync(path.join(directory, 'store.key')).mode & 0o777, 0o600);
  const envelope = JSON.parse(bytes); envelope.tag = Buffer.alloc(16).toString('base64'); fs.writeFileSync(file, JSON.stringify(envelope)); const corrupt = fs.readFileSync(file);
  assert.throws(() => new Store(directory)); assert.deepEqual(fs.readFileSync(file), corrupt);
});
test('invalid controls fail and bounded capacity refuses collection', t => {
  const store = new Store(folder(t));
  for (const input of [{ minutes: -1 }, { retentionHours: 337 }, { title: '' }, { minutes: 120, retentionHours: 1 }]) assert.throws(() => store.create(input));
  const run = store.create(); store.state.events = Array(10000).fill({ run_id: run.id }); assert.throws(() => store.record(run.token, 'image_asset'));
});
test('operator records and export require authentication', async t => {
  const { base } = await app(t);
  for (const route of ['/api/runs', '/api/runs/00000000-0000-0000-0000-000000000000/report']) assert.equal((await fetch(base + route)).status, 401);
});
test('unlock has origin checks, HttpOnly scope and mutation CSRF checks', async t => {
  const { base } = await app(t);
  const unlock = options => fetch(base + '/api/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json', ...options }, body: JSON.stringify({ token }) });
  assert.equal((await unlock({ Origin: 'https://example.test' })).status, 403);
  const response = await unlock({ Origin: base }); assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie'); assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/); assert.match(cookie, /Path=\/api/);
  const value = cookie.split(';')[0];
  assert.equal((await fetch(base + '/api/runs', { headers: { Cookie: value } })).status, 200);
  assert.equal((await fetch(base + '/api/runs', { method: 'POST', headers: { Cookie: value, 'Content-Type': 'application/json', Origin: 'https://example.test' }, body: '{}' })).status, 403);
});
test('real routes generate expected origin timeline without sensitive request data', async t => {
  const { request, base } = await app(t);
  const created = await request('/api/runs', { method: 'POST', body: JSON.stringify({ title: 'Controlled HTTP integration' }) }); assert.equal(created.status, 201); const run = await created.json();
  for (const route of [`/r/${run.token}?email=PRIVATE_MARKER`, `/r/${run.token}/image.svg`, `/r/${run.token}/image.svg`, `/r/${run.token}/callback`]) {
    const response = await fetch(base + route, { headers: { 'User-Agent': 'PRIVATE_AGENT', 'X-Forwarded-For': '192.0.2.99' } }); assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  const report = await (await request(`/api/runs/${run.id}/report`)).json(); assert.deepEqual(report.summary, { requests: 4, metadata: 1, images: 2, callbacks: 1 });
  for (const sensitive of ['PRIVATE_MARKER', 'PRIVATE_AGENT', '192.0.2.99', run.token]) assert.ok(!JSON.stringify(report).includes(sensitive));
  assert.equal(report.unknowns.humanView, 'UNKNOWN');
  assert.equal((await fetch(base + `/r/${run.token}/unknown`)).status, 404);
  assert.equal((await fetch(base + `/r/${run.token}`, { method: 'HEAD' })).status, 404);
  assert.equal((await request(`/api/runs/${run.id}/stop`, { method: 'POST', body: '{}' })).status, 200);
  assert.equal((await fetch(base + `/r/${run.token}`)).status, 410);
  assert.equal((await request(`/api/runs/${run.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await request(`/api/runs/${run.id}/report`)).status, 404);
});
test('DNS rebinding host and unsupported mutation fail closed', async t => {
  const { base, request } = await app(t);
  const hostStatus = await new Promise((resolve, reject) => { http.get(base, { headers: { Host: 'attacker.example' } }, response => { response.resume(); resolve(response.statusCode); }).on('error', reject); });
  assert.equal(hostStatus, 421);
  assert.equal((await request('/api/unknown', { method: 'POST', body: '{}' })).status, 404);
});
test('static console uses strict CSP and contains no third-party fetch resources', async t => {
  const { base } = await app(t); const response = await fetch(base); const html = await response.text();
  assert.match(response.headers.get('content-security-policy'), /script-src 'self'/); assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.ok(!/<script[^>]+src="https?:/.test(html)); assert.ok(!/<(?:img|link)[^>]+(?:src|href)="https?:/.test(html));
  const js = await (await fetch(base + '/app.js')).text(); assert.ok(!js.includes('innerHTML')); assert.match(js, /textContent/);
});
test('second server cannot overwrite an active store', async t => {
  const instance = await app(t); assert.throws(() => createApp({ directory: instance.directory, adminToken: token }), /EEXIST/);
});

test('external edits and missing keys preserve existing evidence', t => {
  const directory = folder(t), store = new Store(directory), run = store.create();
  const file = path.join(directory, 'events.enc.json'); fs.writeFileSync(file, 'EXTERNAL_EDIT');
  assert.throws(() => store.record(run.token, 'image_asset'), /changed outside/); assert.equal(fs.readFileSync(file, 'utf8'), 'EXTERNAL_EDIT'); assert.equal(store.state.events.length, 0);
  fs.unlinkSync(path.join(directory, 'store.key')); assert.throws(() => new Store(directory), /key missing/); assert.equal(fs.existsSync(path.join(directory, 'store.key')), false);
});
