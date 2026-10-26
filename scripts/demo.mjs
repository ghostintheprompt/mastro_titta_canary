import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server.mjs';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mastro-demo-'));
const artifact = path.resolve('artifacts', 'demo-' + crypto.randomUUID()); fs.mkdirSync(artifact, { recursive: true, mode: 0o700 });
const app = createApp({ directory });
app.server.listen(0, '127.0.0.1'); await once(app.server, 'listening');
const base = `http://127.0.0.1:${app.server.address().port}`;
const request = (route, options = {}) => fetch(base + route, { ...options, headers: { Authorization: `Bearer ${app.adminToken}`, 'Content-Type': 'application/json' } });
try {
  const run = await (await request('/api/runs', { method: 'POST', body: JSON.stringify({ title: 'Synthetic local HTTP demonstration', minutes: 5, retentionHours: 1 }) })).json();
  for (const suffix of ['', '/image.svg', '/image.svg', '/callback']) assert.equal((await fetch(`${base}/r/${run.token}${suffix}`)).status, 200);
  await request(`/api/runs/${run.id}/stop`, { method: 'POST', body: '{}' });
  assert.equal((await fetch(`${base}/r/${run.token}`)).status, 410);
  const report = await (await request(`/api/runs/${run.id}/report`)).json();
  assert.deepEqual(report.summary, { requests: 4, metadata: 1, images: 2, callbacks: 1 });
  assert.equal(report.unknowns.identity, 'UNKNOWN'); assert.equal(report.unknowns.providerAction, 'UNKNOWN');
  const serialized = JSON.stringify(report, null, 2); assert.ok(!serialized.includes(run.token));
  fs.writeFileSync(path.join(artifact, 'origin-report.json'), serialized + '\n', { flag: 'wx', mode: 0o600 });
  await request(`/api/runs/${run.id}`, { method: 'DELETE' });
  assert.equal((await request(`/api/runs/${run.id}/report`)).status, 404);
  const acceptance = { evidenceKind: 'synthetic-client-real-loopback-HTTP', passed: true, checkedAt: new Date().toISOString(), routeCounts: report.summary, stopRejectedLaterRequest: true, purgeRemovedRunAndEvents: app.store.state.events.length === 0 && app.store.state.runs.length === 0, identity: 'UNKNOWN', providerAction: 'UNKNOWN', externalMessagingOrVLMIntegration: 'NOT_TESTED' };
  fs.writeFileSync(path.join(artifact, 'acceptance.json'), JSON.stringify(acceptance, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ artifact, ...acceptance }));
} finally { app.server.closeAllConnections(); await new Promise(resolve => app.server.close(resolve)); fs.rmSync(directory, { recursive: true, force: true }); }
