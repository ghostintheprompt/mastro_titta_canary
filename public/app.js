const $ = id => document.getElementById(id);
let selected, report, capability;
const status = text => { $('status').textContent = text; };
async function api(route, options = {}) {
  const response = await fetch(route, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Request failed'); return result;
}
const safe = action => async event => { event?.preventDefault(); try { await action(); } catch (error) { status(error.message); } };
function text(tag, value, className) { const element = document.createElement(tag); element.textContent = value; if (className) element.className = className; return element; }
async function list() {
  const { runs } = await api('/api/runs'); $('unlock').hidden = true; $('workspace').hidden = false;
  $('runs').replaceChildren();
  if (!runs.length) $('runs').append(text('p', 'No retained runs. Create a controlled test above.', 'note'));
  for (const run of runs.toReversed()) {
    const card = document.createElement('article'); card.className = 'run';
    card.append(text('span', run.status, 'badge'), text('h3', run.title), text('p', `Window ends ${new Date(run.expiresAt).toISOString()}`), text('p', `Delete by ${new Date(run.retentionUntil).toISOString()}`));
    const button = text('button', 'Review evidence'); button.className = 'secondary'; button.addEventListener('click', safe(() => detail(run.id))); card.append(button); $('runs').append(card);
  }
}
async function detail(id) {
  selected = id; report = await api(`/api/runs/${id}/report`); $('detail').hidden = false; $('detail-title').textContent = report.run.title;
  $('stats').replaceChildren(); for (const [label, count] of Object.entries(report.summary)) { const stat = document.createElement('div'); stat.className = 'stat'; stat.append(text('strong', String(count)), text('span', label)); $('stats').append(stat); }
  $('events').replaceChildren(); for (const event of report.events) { const row = document.createElement('tr'); for (const value of [event.observed_at, event.event_type, event.test_case, event.event_id]) row.append(text('td', value)); $('events').append(row); }
  if (!report.events.length) { const row = document.createElement('tr'), cell = text('td', 'No requests recorded at this handler.'); cell.colSpan = 4; row.append(cell); $('events').append(row); }
  $('stop').disabled = report.run.status !== 'active'; $('purge-confirm').checked = false; $('purge').disabled = true; status('Evidence refreshed. Identity and provider action remain unknown.');
}
$('unlock-form').addEventListener('submit', safe(async () => { await api('/api/unlock', { method: 'POST', body: JSON.stringify({ token: $('token').value }) }); $('token').value = ''; await list(); status('Local console unlocked for one hour.'); }));
$('run-form').addEventListener('submit', safe(async () => {
  const run = await api('/api/runs', { method: 'POST', body: JSON.stringify({ title: $('title').value, minutes: Number($('minutes').value), retentionHours: Number($('retention').value) }) });
  capability = `/r/${run.token}`; $('run-link').textContent = location.origin + capability; $('new-link').hidden = false; await list(); await detail(run.id); status('Run created. Save the private capability with your test plan; it is shown only in this session.');
}));
$('open-test').addEventListener('click', () => { if (capability) window.open(capability, '_blank', 'noopener,noreferrer'); });
$('dismiss-link').addEventListener('click', () => { capability = undefined; $('run-link').textContent = ''; $('new-link').hidden = true; });
$('refresh').addEventListener('click', safe(async () => { await list(); if (selected) await detail(selected); }));
$('stop').addEventListener('click', safe(async () => { await api(`/api/runs/${selected}/stop`, { method: 'POST', body: '{}' }); await list(); await detail(selected); status('Collection stopped. Retained evidence remains available until purge or retention expiry.'); }));
$('purge-confirm').addEventListener('change', () => { $('purge').disabled = !$('purge-confirm').checked; });
$('purge').addEventListener('click', safe(async () => { if (!$('purge-confirm').checked) return; await api(`/api/runs/${selected}`, { method: 'DELETE' }); selected = undefined; report = undefined; capability = undefined; $('detail').hidden = true; $('new-link').hidden = true; $('run-link').textContent = ''; await list(); status('Run and application events purged. Earlier exports and host/provider logs are outside this control.'); }));
$('download').addEventListener('click', () => { if (!report) return; const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = `mastro-titta-${report.run.id}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
list().catch(() => { $('unlock').hidden = false; });
