import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const routes = new Set(['metadata_page', 'image_asset', 'vlm_callback']);
export class Store {
  constructor(directory, { key, now = () => Date.now() } = {}) {
    this.directory = directory; this.now = now;
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    this.file = path.join(directory, 'events.enc.json');
    const keyFile = path.join(directory, 'store.key');
    if (!key) {
      if (!fs.existsSync(keyFile)) { if (fs.existsSync(this.file)) throw new Error('Store key missing; existing ciphertext preserved'); fs.writeFileSync(keyFile, crypto.randomBytes(32), { flag: 'wx', mode: 0o600 }); }
      if (!fs.lstatSync(keyFile).isFile() || fs.lstatSync(keyFile).isSymbolicLink() || fs.statSync(keyFile).size !== 32) throw new Error('Invalid private key file');
      key = fs.readFileSync(keyFile);
    }
    if (!Buffer.isBuffer(key) || key.length !== 32) throw new Error('Store key must contain 32 bytes');
    this.key = key;
    this.state = { schemaVersion: 1, runs: [], events: [] };
    this.diskHash = null;
    if (fs.existsSync(this.file)) {
      if (fs.lstatSync(this.file).isSymbolicLink() || fs.statSync(this.file).size > 8 * 1024 * 1024) throw new Error('Invalid store file');
      const stored = fs.readFileSync(this.file);
      this.diskHash = hash(stored);
      const envelope = JSON.parse(stored);
      if (envelope.version !== 1) throw new Error('Unsupported encrypted store');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'));
      decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
      const state = JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]));
      if (state.schemaVersion !== 1 || !Array.isArray(state.runs) || !Array.isArray(state.events)) throw new Error('Invalid decrypted state');
      this.state = state;
    }
    this.prune();
  }
  save(next) {
    if (fs.existsSync(this.file)) {
      if (fs.lstatSync(this.file).isSymbolicLink() || fs.statSync(this.file).size > 8 * 1024 * 1024 || hash(fs.readFileSync(this.file)) !== this.diskHash) throw new Error('Store changed outside this process; original evidence preserved');
    } else if (this.diskHash !== null) throw new Error('Store disappeared; evidence was not recreated');
    const bytes = Buffer.from(JSON.stringify(next));
    if (bytes.length > 4 * 1024 * 1024) throw new Error('Store capacity exceeded; export and purge before collecting more');
    const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
    const envelope = JSON.stringify({ version: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') });
    const temporary = this.file + '.' + crypto.randomUUID() + '.tmp';
    try { fs.writeFileSync(temporary, envelope, { flag: 'wx', mode: 0o600 }); fs.renameSync(temporary, this.file); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
    this.diskHash = hash(envelope);
    this.state = next;
  }
  prune() {
    const runs = this.state.runs.filter(run => Date.parse(run.retentionUntil) > this.now());
    const ids = new Set(runs.map(run => run.id));
    const events = this.state.events.filter(event => ids.has(event.run_id));
    if (runs.length !== this.state.runs.length || events.length !== this.state.events.length) this.save({ ...this.state, runs, events });
  }
  create({ title = 'Controlled request-path test', minutes = 30, retentionHours = 24 } = {}) {
    if (typeof title !== 'string' || !title.trim() || title.length > 100 || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440 || !Number.isInteger(retentionHours) || retentionHours < 1 || retentionHours > 336 || retentionHours * 60 < minutes) throw new Error('Invalid run title, window or retention');
    this.prune();
    if (this.state.runs.length >= 100) throw new Error('Run limit reached');
    const token = crypto.randomBytes(32).toString('base64url');
    const run = { id: crypto.randomUUID(), title: title.trim(), createdAt: new Date(this.now()).toISOString(), expiresAt: new Date(this.now() + minutes * 60000).toISOString(), retentionUntil: new Date(this.now() + retentionHours * 3600000).toISOString(), status: 'active', tokenSHA256: hash(token) };
    this.save({ ...this.state, runs: [...this.state.runs, run] });
    return { ...this.publicRun(run), token };
  }
  publicRun(run) { const { tokenSHA256, ...rest } = run; return { ...rest, status: run.status === 'active' && Date.parse(run.expiresAt) <= this.now() ? 'expired' : run.status }; }
  list() { this.prune(); return this.state.runs.map(run => this.publicRun(run)); }
  record(token, type) {
    this.prune();
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token) || !routes.has(type)) return null;
    const run = this.state.runs.find(run => run.tokenSHA256 === hash(token));
    if (!run || run.status !== 'active' || Date.parse(run.expiresAt) <= this.now()) return null;
    if (this.state.events.length >= 10000) throw new Error('Event limit reached');
    const event = { run_id: run.id, event_id: crypto.randomUUID(), event_type: type, observed_at: new Date(this.now()).toISOString(), route_version: '1', test_case: { metadata_page: 'metadata-fetch', image_asset: 'image-fetch', vlm_callback: 'controlled-callback' }[type] };
    this.save({ ...this.state, events: [...this.state.events, event] });
    return event;
  }
  stop(id) { this.prune(); if (!this.state.runs.some(run => run.id === id)) return false; this.save({ ...this.state, runs: this.state.runs.map(run => run.id === id ? { ...run, status: 'stopped' } : run) }); return true; }
  purge(id) { this.prune(); const exists = this.state.runs.some(run => run.id === id); if (exists) this.save({ ...this.state, runs: this.state.runs.filter(run => run.id !== id), events: this.state.events.filter(event => event.run_id !== id) }); return exists; }
  report(id) {
    this.prune(); const run = this.state.runs.find(run => run.id === id); if (!run) return null;
    const events = this.state.events.filter(event => event.run_id === id);
    return { schemaVersion: 'mastro-titta-report/v1', exportedAt: new Date(this.now()).toISOString(), evidenceKind: 'origin-handler-observations', run: this.publicRun(run), events, summary: { requests: events.length, metadata: events.filter(e => e.event_type === 'metadata_page').length, images: events.filter(e => e.event_type === 'image_asset').length, callbacks: events.filter(e => e.event_type === 'vlm_callback').length }, unknowns: { humanView: 'UNKNOWN', identity: 'UNKNOWN', attribution: 'UNKNOWN', providerAction: 'UNKNOWN', victimOutcome: 'UNKNOWN' }, coverage: 'Only requests reaching this handler. A callback does not establish that a VLM caused it. No platform integration or identity inference.' };
  }
}
