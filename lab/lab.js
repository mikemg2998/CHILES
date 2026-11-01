/* CONTENT LAB · herramienta de curación real. Edita en memoria los mismos datos que valida la gramática (REPERTOIRE y
   POSITIONAL), guarda el borrador solo en este navegador (localStorage «pab.lab») y exporta los ficheros de datos tal cual
   van en engine/data/. Nada de lo que se hace aquí llega al motor hasta que el fichero exportado se guarda en el repo y pasa
   node tests/validate.js. Nunca promociona nada solo: cada status lo elige una persona. */
import { REPERTOIRE, POSITIONAL, TARGETS, TARGETS_LIST, GROUPS, ACTIONS, ACTIONS_LIST, ACTOR_TOOLS, STYLES, STYLE_IDS, LEVELS, LEVEL_IDS, COMBO, possibleCombinations, validateData, ALL_STATUSES, APPROVED_STATUSES, BLUEPRINT_STATUSES, ORIENTATIONS, isBodyTool } from '../engine/grammar.js';
import { ACTOR_TOOLS_LIST } from '../engine/data/actorTools.js';
import { realize } from '../engine/realizer.js';
import { Rng } from '../engine/rng.js';
import { serializeRepertoire, serializePositional } from '../engine/repertoireIO.js';
import { suspicious } from '../engine/audit.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'pab.lab';
const rng = new Rng(Date.now() % 100000);
const PARTNER = 'Ana';
const STATUS_LABEL = { EXCELLENT: 'EXCELLENT', GOOD: 'GOOD', VALID: 'VALID', REJECTED: 'REJECTED', UNREVIEWED: 'UNREVIEWED' };

/* ---------- estado: pristine (lo que hay en el repo) + borrador (localStorage) aplicado en memoria ---------- */
const snapshot = () => JSON.stringify({ rep: REPERTOIRE, pos: POSITIONAL });
const pristine = JSON.parse(snapshot());
function applyDraft(d) {
  if (!d) return;
  for (const t of Object.keys(REPERTOIRE)) { const src = d.rep && d.rep[t]; if (!src) continue; for (const k of Object.keys(REPERTOIRE[t])) delete REPERTOIRE[t][k]; Object.assign(REPERTOIRE[t], src); }
  if (d.pos) { POSITIONAL.length = 0; for (const b of d.pos) POSITIONAL.push(b); }
}
try { applyDraft(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch { /* sin borrador */ }
function persist() { try { localStorage.setItem(KEY, snapshot()); } catch { /* sin almacenamiento: se trabaja en memoria */ } refreshChrome(); }
function changeCount() {
  let n = 0;
  for (const t of Object.keys(REPERTOIRE)) if (JSON.stringify(REPERTOIRE[t]) !== JSON.stringify(pristine.rep[t])) n++;
  const pa = JSON.stringify(POSITIONAL), pb = JSON.stringify(pristine.pos); if (pa !== pb) n += Math.max(1, Math.abs(POSITIONAL.length - pristine.pos.length) || POSITIONAL.filter((b, i) => JSON.stringify(b) !== JSON.stringify(pristine.pos[i])).length);
  return n;
}

/* ---------- repertorio en vivo ---------- */
const rep = t => (REPERTOIRE[t] ||= { approvedActions: {} });
const entryOf = v => typeof v === 'string' ? { status: v } : { ...v };
function liveStatus(action, tool, target) {
  const r = rep(target), k = `${action}|${tool}`;
  if (r.approvedActions && r.approvedActions[k]) return entryOf(r.approvedActions[k]).status;
  if (r.rejectedActions && r.rejectedActions[k]) return 'REJECTED';
  return 'UNREVIEWED';
}
function liveEntry(action, tool, target) { const r = rep(target), k = `${action}|${tool}`; return r.approvedActions && r.approvedActions[k] ? entryOf(r.approvedActions[k]) : null; }
function setStatus(target, action, tool, status, note) {
  const r = rep(target), k = `${action}|${tool}`; r.approvedActions ||= {}; r.rejectedActions ||= {};
  const prev = liveEntry(action, tool, target);
  if (APPROVED_STATUSES.includes(status) || status === 'UNREVIEWED') {
    delete r.rejectedActions[k];
    if (status === 'UNREVIEWED') { delete r.approvedActions[k]; }
    else { const e = prev || {}; e.status = status; if (note !== undefined) { if (note) e.notes = note; else delete e.notes; } r.approvedActions[k] = Object.keys(e).length === 1 ? status : e; }
  } else if (status === 'REJECTED') {
    delete r.approvedActions[k];
    r.rejectedActions[k] = note || (r.rejectedActions[k] && typeof r.rejectedActions[k] === 'string' ? r.rejectedActions[k] : 'rechazada en Content Lab: no merece aparecer aquí');
  }
  if (!Object.keys(r.rejectedActions).length) delete r.rejectedActions;
  persist();
}
function setLevels(target, action, tool, levels) {
  const r = rep(target), k = `${action}|${tool}`; const e = liveEntry(action, tool, target); if (!e) return;
  const a = ACTIONS[action], z = TARGETS[target]; const natural = a.allowedLevels.filter(L => z.allowedLevels.includes(L));
  if (!levels.length || levels.length === natural.length && natural.every(L => levels.includes(L))) delete e.levels; else e.levels = levels.slice().sort();
  r.approvedActions[k] = Object.keys(e).length === 1 ? e.status : e; persist();
}
function setNote(target, action, tool, note) {
  const r = rep(target), k = `${action}|${tool}`;
  if (r.rejectedActions && r.rejectedActions[k] !== undefined) { r.rejectedActions[k] = note || 'rechazada en Content Lab'; persist(); return; }
  const e = liveEntry(action, tool, target); if (!e) return; if (note) e.notes = note; else delete e.notes; r.approvedActions[k] = Object.keys(e).length === 1 ? e.status : e; persist();
}
const UNIVERSE = possibleCombinations(); // acción admite herramienta + biomecánica posible (independiente del status)
function rowsFor(target) {
  const seen = new Set(), rows = [];
  for (const u of UNIVERSE) if (u.target === target) { seen.add(`${u.action}|${u.tool}`); rows.push({ action: u.action, tool: u.tool }); }
  const r = rep(target); for (const k of [...Object.keys(r.approvedActions || {}), ...Object.keys(r.rejectedActions || {})]) if (!seen.has(k)) { const [action, tool] = k.split('|'); if (ACTIONS[action] && ACTOR_TOOLS[tool]) { seen.add(k); rows.push({ action, tool, outside: true }); } }
  for (const x of rows) x.status = liveStatus(x.action, x.tool, target);
  const order = { EXCELLENT: 0, GOOD: 1, VALID: 2, REJECTED: 3, UNREVIEWED: 4 };
  return rows.sort((p, q) => order[p.status] - order[q.status] || ACTIONS[p.action].name.localeCompare(ACTIONS[q.action].name) || p.tool.localeCompare(q.tool));
}
function sample(action, tool, target) {
  const a = ACTIONS[action], z = TARGETS[target]; const levels = a.allowedLevels.filter(L => z.allowedLevels.includes(L)); const level = levels[0] || 2;
  const r = realize({ key: `${action}|${tool}|${target}`, action, tool, target, style: null, level, pattern: a.pattern }, { partner: PARTNER, rng, recentShapes: [] });
  return r ? r.text : '— (sin plantilla para esta combinación)';
}

/* ---------- UI: cabecera, validación, pestañas ---------- */
function refreshChrome() {
  const n = changeCount(); const pill = $('#changes'); pill.textContent = n ? `${n} ${n === 1 ? 'cambio' : 'cambios'} sin exportar` : 'sin cambios'; pill.classList.toggle('dirty', n > 0);
  const v = validateData(); const el = $('#validation');
  const mine = v.errors.filter(e => /^repertorio|^blueprint|^duración/.test(e));
  if (mine.length) { el.hidden = false; el.className = 'validation'; el.textContent = `${mine.length} ${mine.length === 1 ? 'error' : 'errores'} de validación (el fichero exportado no pasaría node tests/validate.js):\n` + mine.slice(0, 12).map(e => '· ' + e).join('\n') + (mine.length > 12 ? `\n… y ${mine.length - 12} más` : ''); }
  else if (n) { el.hidden = false; el.className = 'validation ok'; el.textContent = '✓ El borrador pasa la validación estructural. Exporta y guarda el fichero en engine/data/ para que entre al motor.'; }
  else el.hidden = true;
}
for (const b of document.querySelectorAll('.tab')) b.onclick = () => { for (const x of document.querySelectorAll('.tab')) x.classList.toggle('on', x === b); for (const p of document.querySelectorAll('.panel')) p.hidden = p.id !== `tab-${b.dataset.tab}`; if (b.dataset.tab === 'auditoria') renderAudit(); if (b.dataset.tab === 'posicionales') renderBlueprints(); };
$('#discard').onclick = () => { if (!changeCount() || confirm('¿Descartar todos los cambios no exportados de este navegador?')) { localStorage.removeItem(KEY); location.reload(); } };

/* ---------- zonas ---------- */
let current = null, filter = 'ALL';
function counts(t) { const c = { EXCELLENT: 0, GOOD: 0, VALID: 0, REJECTED: 0, UNREVIEWED: 0 }; for (const r of rowsFor(t)) c[r.status]++; return c; }
function renderTargets() {
  const q = ($('#search').value || '').toLowerCase(); let html = '';
  for (const [gid, g] of Object.entries(GROUPS)) {
    const list = TARGETS_LIST.filter(t => t.group === gid && (!q || t.n.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)));
    if (!list.length) continue;
    html += `<div class="group">${esc(g.name)}</div>`;
    for (const t of list) { const c = counts(t.id); html += `<button class="tItem ${current === t.id ? 'on' : ''}" data-t="${t.id}"><span>${esc(t.n.replace(/^(el|la|los|las) /, ''))}</span><span class="counts" title="excelentes · buenas · válidas · rechazadas · sin revisar"><span class="ex">${c.EXCELLENT}</span><span>${c.GOOD}</span><span>${c.VALID}</span><span class="rj">${c.REJECTED}</span><span class="un">${c.UNREVIEWED}</span></span></button>`; }
  }
  $('#targets').innerHTML = html;
  for (const b of document.querySelectorAll('.tItem')) b.onclick = () => { current = b.dataset.t; renderTargets(); renderZone(); };
}
$('#search').oninput = renderTargets;
function renderZone() {
  const t = TARGETS[current]; const el = $('#zone'); if (!t) { el.innerHTML = '<p class="empty">Elige una zona.</p>'; return; }
  const r = rep(t.id); const rows = rowsFor(t.id).filter(x => filter === 'ALL' || (filter === 'APPROVED' ? APPROVED_STATUSES.includes(x.status) : x.status === filter));
  const c = counts(t.id);
  let html = `<div class="head"><h2>${esc(t.n)}</h2><span class="meta">${t.id} · ${esc(GROUPS[t.group].name)} · sensibilidad ${t.sensitivity} · presión ${t.pressureTolerance} · niveles ${t.allowedLevels.join(' ')}${t.anatomy ? ' · anatomía ' + t.anatomy : ''}</span></div>`;
  html += `<div class="card"><h3>Repertorio de la zona</h3><div class="row">` +
    `<span class="pill">estilos preferidos:</span>` + STYLE_IDS.map(s => `<label class="chip ${(r.preferredStyles || []).includes(s) ? 'on' : ''} ${t.allowedStyles.includes(s) ? '' : 'off'}"><input type="checkbox" data-pref="${s}" ${(r.preferredStyles || []).includes(s) ? 'checked' : ''} ${t.allowedStyles.includes(s) ? '' : 'disabled'}>${esc(STYLES[s].label)}</label>`).join('') + `</div>` +
    `<div class="row" style="margin-top:8px"><span class="pill">duraciones por acción (s):</span>` + Object.entries(r.durationOverrides || {}).map(([a, d]) => `<span class="dur">${esc(ACTIONS[a] ? ACTIONS[a].name : a)} <input type="number" min="15" step="5" value="${d[0]}" data-dur="${a}" data-i="0"> – <input type="number" min="15" step="5" value="${d[1]}" data-dur="${a}" data-i="1"> <button class="btn small ghost" data-deldur="${a}">×</button></span>`).join('') +
    `<select id="addDur" class="status"><option value="">+ acción…</option>${[...new Set(rows.filter(x => APPROVED_STATUSES.includes(x.status)).map(x => x.action))].filter(a => !(r.durationOverrides || {})[a]).map(a => `<option value="${a}">${esc(ACTIONS[a].name)}</option>`).join('')}</select></div>` +
    `<div class="row" style="margin-top:8px"><input class="note" id="zoneNote" placeholder="Nota editorial de la zona (opcional)" value="${esc(r.notes || '')}"></div></div>`;
  html += `<div class="filters">${[['ALL', `Todas ${c.EXCELLENT + c.GOOD + c.VALID + c.REJECTED + c.UNREVIEWED}`], ['APPROVED', `Aprobadas ${c.EXCELLENT + c.GOOD + c.VALID}`], ['REJECTED', `Rechazadas ${c.REJECTED}`], ['UNREVIEWED', `Sin revisar ${c.UNREVIEWED}`]].map(([k, l]) => `<button class="chip ${filter === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>`;
  html += `<table><thead><tr><th>Acción · herramienta</th><th>Status</th><th>Niveles</th><th>Motivo / nota</th><th>Frase que sale</th></tr></thead><tbody>`;
  for (const x of rows) {
    const a = ACTIONS[x.action], tool = ACTOR_TOOLS[x.tool], e = liveEntry(x.action, x.tool, t.id);
    const natural = a.allowedLevels.filter(L => t.allowedLevels.includes(L)); const lv = e && e.levels ? e.levels : natural;
    const flags = APPROVED_STATUSES.includes(x.status) ? suspicious(x.action, x.tool, t.id, x.status) : [];
    const note = x.status === 'REJECTED' ? (typeof r.rejectedActions[`${x.action}|${x.tool}`] === 'string' ? r.rejectedActions[`${x.action}|${x.tool}`] : '') : (e && e.notes) || '';
    html += `<tr class="${x.status}" data-k="${x.action}|${x.tool}"><td><span class="combo">${esc(a.name)} · ${esc(tool.label)}<small>${x.action} · ${x.tool}${x.outside ? ' · fuera del universo técnico' : ''}</small></span>${flags.length ? `<div class="flags">⚠ ${flags.join(', ')}</div>` : ''}</td>` +
      `<td><select class="status ${x.status}" data-status>${ALL_STATUSES.map(s => `<option value="${s}" ${s === x.status ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}</select></td>` +
      `<td><div class="levels">${LEVEL_IDS.map(L => `<button class="lv ${lv.includes(L) ? 'on' : ''}" data-lv="${L}" ${!natural.includes(L) || !APPROVED_STATUSES.includes(x.status) ? 'disabled' : ''} title="${esc(LEVELS[L].name)}">0${L}</button>`).join('')}</div></td>` +
      `<td><input class="note" data-note value="${esc(note)}" placeholder="${x.status === 'REJECTED' ? 'motivo del rechazo' : 'nota (opcional)'}"></td>` +
      `<td class="phrase"><span data-sample>${esc(sample(x.action, x.tool, t.id))}</span><button data-again title="otra frase">↻</button></td></tr>`;
  }
  html += `</tbody></table>`;
  el.innerHTML = html;
  for (const b of el.querySelectorAll('[data-f]')) b.onclick = () => { filter = b.dataset.f; renderZone(); };
  for (const i of el.querySelectorAll('[data-pref]')) i.onchange = () => { const list = [...el.querySelectorAll('[data-pref]:checked')].map(x => x.dataset.pref); if (list.length) r.preferredStyles = list; else delete r.preferredStyles; persist(); renderZone(); };
  for (const i of el.querySelectorAll('[data-dur]')) i.onchange = () => { const d = r.durationOverrides[i.dataset.dur]; d[Number(i.dataset.i)] = Number(i.value) || 15; persist(); };
  for (const b of el.querySelectorAll('[data-deldur]')) b.onclick = () => { delete r.durationOverrides[b.dataset.deldur]; if (!Object.keys(r.durationOverrides).length) delete r.durationOverrides; persist(); renderZone(); };
  $('#addDur', el).onchange = ev => { const a = ev.target.value; if (!a) return; (r.durationOverrides ||= {})[a] = [15, 60]; persist(); renderZone(); };
  $('#zoneNote', el).onchange = ev => { if (ev.target.value.trim()) r.notes = ev.target.value.trim(); else delete r.notes; persist(); };
  for (const tr of el.querySelectorAll('tbody tr')) {
    const [action, tool] = tr.dataset.k.split('|');
    $('[data-status]', tr).onchange = ev => { const s = ev.target.value; const note = s === 'REJECTED' ? (prompt('Motivo del rechazo (queda documentado en el fichero):', $('[data-note]', tr).value || '') || undefined) : undefined; if (s === 'REJECTED' && note === undefined) { renderZone(); return; } setStatus(t.id, action, tool, s, note); renderTargets(); renderZone(); };
    for (const b of tr.querySelectorAll('[data-lv]')) b.onclick = () => { const on = [...tr.querySelectorAll('[data-lv].on')].map(x => Number(x.dataset.lv)); const L = Number(b.dataset.lv); const next = on.includes(L) ? on.filter(x => x !== L) : [...on, L]; if (!next.length) return; setLevels(t.id, action, tool, next); renderZone(); };
    $('[data-note]', tr).onchange = ev => setNote(t.id, action, tool, ev.target.value.trim());
    $('[data-again]', tr).onclick = () => { $('[data-sample]', tr).textContent = sample(action, tool, t.id); };
  }
}

/* ---------- blueprints posicionales ---------- */
const BODY_TOOLS = ACTOR_TOOLS_LIST.filter(t => isBodyTool(t.id) || ['penis', 'vulva', 'nipples', 'feet', 'toes'].includes(t.id));
function previewCopy(b, text) {
  const z = TARGETS[b.receiverRequirements[0] && b.receiverRequirements[0].part] || { n: 'la zona', np: 'su zona' };
  const st = b.allowedStyles && b.allowedStyles.length ? STYLES[b.allowedStyles[0]].adv[0] || '' : '';
  let s = text.replace(/\{T:poss\}/g, z.np).replace(/\{T:bare\}/g, z.n).replace(/\{T:pron\}/g, /^(el|un) /.test(z.n) ? 'lo' : /^(los|unos) /.test(z.n) ? 'los' : /^(las|unas) /.test(z.n) ? 'las' : 'la');
  let first = true; s = s.replace(/\{T\}/g, () => { const r = first && !text.includes('{P}') ? `${z.n} de ${PARTNER}` : z.np; first = false; return r; });
  s = s.replace(/\{P\}/g, PARTNER).replace(/\s?\{S\}/g, st ? ' ' + st : '').replace(/\{TOOL!?\}/g, b.actorRequirements[0] && ACTOR_TOOLS[b.actorRequirements[0].part] ? ACTOR_TOOLS[b.actorRequirements[0].part].phrase : '');
  s = s.replace(/\s+/g, ' ').replace(/\s+([,;:.])/g, '$1').replace(/\ba el\b/g, 'al').replace(/\bde el\b/g, 'del').trim();
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/[.;,]*$/, '') + '.';
}
function renderBlueprints() {
  const el = $('#blueprints'); let html = '';
  POSITIONAL.forEach((b, i) => {
    const a = ACTIONS[b.action];
    html += `<article class="bp ${b.status}" data-i="${i}"><div class="id"><input data-f="id" value="${esc(b.id)}" spellcheck="false"><select class="status ${b.status}" data-f="status">${BLUEPRINT_STATUSES.map(s => `<option ${s === b.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div>` +
      `<div class="grid3"><label>acción<select data-f="action">${ACTIONS_LIST.filter(x => ['BODY_CONTACT', 'HUG', 'RUB'].includes(x.id) || x.id === b.action).map(x => `<option value="${x.id}" ${x.id === b.action ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>` +
      `<label>tier (calidad)<select data-f="tier"><option value="" ${!b.tier ? 'selected' : ''}>— sin tier</option>${APPROVED_STATUSES.map(s => `<option ${s === b.tier ? 'selected' : ''}>${s}</option>`).join('')}</select></label>` +
      `<label>orientación<select data-f="requiredOrientation"><option value="" ${!b.requiredOrientation ? 'selected' : ''}>— libre</option>${ORIENTATIONS.map(o => `<option ${o === b.requiredOrientation ? 'selected' : ''}>${o}</option>`).join('')}</select></label></div>` +
      `<div class="grid2"><label>quien actúa (parte · anatomía)<div class="row"><select data-req="actor" data-k="part">${BODY_TOOLS.map(t => `<option value="${t.id}" ${b.actorRequirements[0] && b.actorRequirements[0].part === t.id ? 'selected' : ''}>${esc(t.label)}</option>`).join('')}</select><select data-req="actor" data-k="anatomy"><option value="" ${!(b.actorRequirements[0] && b.actorRequirements[0].anatomy) ? 'selected' : ''}>cualquiera</option><option ${b.actorRequirements[0] && b.actorRequirements[0].anatomy === 'pene' ? 'selected' : ''}>pene</option><option ${b.actorRequirements[0] && b.actorRequirements[0].anatomy === 'vulva' ? 'selected' : ''}>vulva</option></select></div></label>` +
      `<label>quien recibe (zona · anatomía)<div class="row"><select data-req="receiver" data-k="part">${TARGETS_LIST.map(t => `<option value="${t.id}" ${b.receiverRequirements[0] && b.receiverRequirements[0].part === t.id ? 'selected' : ''}>${esc(t.n)}</option>`).join('')}</select><select data-req="receiver" data-k="anatomy"><option value="" ${!(b.receiverRequirements[0] && b.receiverRequirements[0].anatomy) ? 'selected' : ''}>la de la zona</option><option ${b.receiverRequirements[0] && b.receiverRequirements[0].anatomy === 'pene' ? 'selected' : ''}>pene</option><option ${b.receiverRequirements[0] && b.receiverRequirements[0].anatomy === 'vulva' ? 'selected' : ''}>vulva</option></select></div></label></div>` +
      `<div class="grid3"><label>niveles<div class="levels">${LEVEL_IDS.map(L => `<button class="lv ${(b.allowedLevels || []).includes(L) ? 'on' : ''}" data-lv="${L}" title="${esc(LEVELS[L].name)}">0${L}</button>`).join('')}</div></label>` +
      `<label>estilos<div class="row">${(a ? a.styles : STYLE_IDS).map(s => `<label class="chip ${(b.allowedStyles || []).includes(s) ? 'on' : ''}"><input type="checkbox" data-style="${s}" ${(b.allowedStyles || []).includes(s) ? 'checked' : ''}>${esc(STYLES[s].label)}</label>`).join('') || '<span class="meta">la acción no admite estilo</span>'}</div></label>` +
      `<label>duración (s) · peso<div class="row"><span class="dur"><input type="number" min="15" step="5" data-f="dur0" value="${b.durationRange ? b.durationRange[0] : 20}"> – <input type="number" min="15" step="5" data-f="dur1" value="${b.durationRange ? b.durationRange[1] : 60}"></span><input type="number" min="0" max="3" step="0.1" data-f="weight" value="${b.weight ?? 1}" style="width:60px"></div></label></div>` +
      `<label>copy (una frase por línea · {P} pareja · {T} zona · {T:poss} · {T:bare} · {S} estilo)<textarea class="note" data-f="copy" rows="${Math.max(2, (b.copyVariants || []).length + 1)}" spellcheck="false">${esc((b.copyVariants || []).join('\n'))}</textarea></label>` +
      `<div>${(b.copyVariants || []).length ? b.copyVariants.map(v => `<p class="preview">${esc(previewCopy(b, v))}</p>`).join('') : '<p class="preview missing">Sin copy: redacta las frases antes de aprobar. No se inventa nada automáticamente.</p>'}</div>` +
      `<label>notas<textarea class="note" data-f="notes" rows="2">${esc(b.notes || '')}</textarea></label>` +
      `<div class="row" style="justify-content:space-between"><span class="meta">${b.status === 'APPROVED' ? '✓ entra al generador tras exportar y validar' : b.status === 'UNREVIEWED' ? 'pendiente de decisión humana · no sale' : 'rechazado · no sale'}</span><button class="btn small ghost" data-del>Eliminar</button></div></article>`;
  });
  el.innerHTML = html || '<p class="empty">Sin blueprints.</p>';
  for (const card of el.querySelectorAll('.bp')) {
    const b = POSITIONAL[Number(card.dataset.i)];
    const upd = () => { persist(); renderBlueprints(); };
    for (const inp of card.querySelectorAll('[data-f]')) inp.onchange = () => {
      const f = inp.dataset.f, v = inp.value;
      if (f === 'id') b.id = v.trim().replace(/\s+/g, '-').toLowerCase() || b.id;
      else if (f === 'status') b.status = v; else if (f === 'action') b.action = v; else if (f === 'tier') b.tier = v || null; else if (f === 'requiredOrientation') b.requiredOrientation = v || null;
      else if (f === 'dur0') { b.durationRange = b.durationRange || [20, 60]; b.durationRange[0] = Number(v) || 15; } else if (f === 'dur1') { b.durationRange = b.durationRange || [20, 60]; b.durationRange[1] = Number(v) || 60; }
      else if (f === 'weight') b.weight = Math.max(0, Math.min(3, Number(v) || 0));
      else if (f === 'copy') b.copyVariants = v.split('\n').map(s => s.trim()).filter(Boolean);
      else if (f === 'notes') b.notes = v.trim() || null;
      upd();
    };
    for (const sel of card.querySelectorAll('[data-req]')) sel.onchange = () => { const list = sel.dataset.req === 'actor' ? b.actorRequirements : b.receiverRequirements; list[0] ||= {}; if (sel.dataset.k === 'part') list[0].part = sel.value; else { if (sel.value) list[0].anatomy = sel.value; else delete list[0].anatomy; } upd(); };
    for (const l of card.querySelectorAll('[data-lv]')) l.onclick = () => { const L = Number(l.dataset.lv); b.allowedLevels = (b.allowedLevels || []).includes(L) ? b.allowedLevels.filter(x => x !== L) : [...(b.allowedLevels || []), L].sort(); upd(); };
    for (const s of card.querySelectorAll('[data-style]')) s.onchange = () => { b.allowedStyles = [...card.querySelectorAll('[data-style]:checked')].map(x => x.dataset.style); upd(); };
    $('[data-del]', card).onclick = () => { if (confirm(`¿Eliminar el blueprint «${b.id}»?`)) { POSITIONAL.splice(POSITIONAL.indexOf(b), 1); upd(); } };
  }
}
$('#newBp').onclick = () => {
  POSITIONAL.push({ id: `nuevo-${Date.now().toString(36)}`, status: 'UNREVIEWED', type: 'POSITIONAL', action: 'BODY_CONTACT', semanticFamily: 'BODY_TO_BODY', actorRequirements: [{ part: 'chest' }], receiverRequirements: [{ part: 'back' }], requiredOrientation: null, allowedLevels: [2], allowedStyles: [], durationRange: [20, 60], copyVariants: [], weight: 1, tier: null, intensity: null, notes: 'Propuesta nueva: redactar copy, fijar nivel y decidir.' });
  persist(); renderBlueprints(); window.scrollTo(0, document.body.scrollHeight);
};

/* ---------- auditoría ---------- */
function renderAudit() {
  const flagged = [], valid = []; let unreviewed = 0;
  for (const u of UNIVERSE) { const s = liveStatus(u.action, u.tool, u.target); if (s === 'UNREVIEWED') unreviewed++; if (!APPROVED_STATUSES.includes(s)) continue; const f = suspicious(u.action, u.tool, u.target, s); if (f.length) flagged.push({ ...u, status: s, flags: f }); if (s === 'VALID') valid.push({ ...u, status: s }); }
  const row = x => `<tr class="${x.status}" data-go="${x.target}"><td><span class="combo">${esc(TARGETS[x.target].n)}</span></td><td>${esc(ACTIONS[x.action].name)} · ${esc(ACTOR_TOOLS[x.tool].label)}</td><td>${x.status}</td><td class="flags">${(x.flags || []).join(', ')}</td><td class="phrase">${esc(sample(x.action, x.tool, x.target))}</td></tr>`;
  $('#audit').innerHTML = `<div class="card"><h3>Resumen</h3><div class="row"><span class="pill">universo técnico ${UNIVERSE.length}</span><span class="pill">aprobadas ${UNIVERSE.filter(u => APPROVED_STATUSES.includes(liveStatus(u.action, u.tool, u.target))).length}</span><span class="pill">rechazadas ${UNIVERSE.filter(u => liveStatus(u.action, u.tool, u.target) === 'REJECTED').length}</span><span class="pill">sin revisar ${unreviewed}</span><span class="pill">blueprints ${POSITIONAL.filter(b => b.status === 'APPROVED').length} aprobados · ${POSITIONAL.filter(b => b.status === 'UNREVIEWED').length} pendientes</span></div></div>` +
    `<div class="card"><h3>Aprobadas que las heurísticas señalan (${flagged.length}) · clic para ir a la zona</h3><table><thead><tr><th>Zona</th><th>Acción · herramienta</th><th>Status</th><th>Heurísticas</th><th>Frase</th></tr></thead><tbody>${flagged.map(row).join('')}</tbody></table></div>` +
    `<div class="card"><h3>VALID (menores) para decidir si suben o se rechazan (${valid.length})</h3><table><thead><tr><th>Zona</th><th>Acción · herramienta</th><th>Status</th><th></th><th>Frase</th></tr></thead><tbody>${valid.map(row).join('')}</tbody></table></div>`;
  for (const tr of $('#audit').querySelectorAll('[data-go]')) tr.onclick = () => { current = tr.dataset.go; filter = 'ALL'; $('.tab[data-tab="zonas"]').click(); renderTargets(); renderZone(); window.scrollTo(0, 0); };
}

/* ---------- exportar ---------- */
let exportName = '';
function openExport(name, text, hint) { exportName = name; $('#exportTitle').textContent = `Exportar ${name}`; $('#exportHint').textContent = hint; $('#exportText').value = text; $('#exportDlg').showModal(); }
$('#exportRep').onclick = () => openExport('repertoire.js', serializeRepertoire(REPERTOIRE, { summary: `Exportado desde Content Lab el ${new Date().toISOString().slice(0, 10)}.` }), 'Guarda este contenido como engine/data/repertoire.js y ejecuta node tests/validate.js y node --test. Solo así entra al motor.');
$('#exportPos').onclick = () => openExport('positional.js', serializePositional(POSITIONAL), 'Guarda este contenido como engine/data/positional.js y ejecuta node tests/validate.js y node --test. Un blueprint UNREVIEWED sigue sin salir aunque se exporte.');
$('#closeExport').onclick = () => $('#exportDlg').close();
$('#copyExport').onclick = async () => { try { await navigator.clipboard.writeText($('#exportText').value); $('#copyExport').textContent = 'Copiado'; setTimeout(() => $('#copyExport').textContent = 'Copiar', 1200); } catch { $('#exportText').select(); } };
$('#downloadExport').onclick = () => { const blob = new Blob([$('#exportText').value], { type: 'text/javascript' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = exportName; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };

renderTargets(); refreshChrome();
current = 'collarbones'; renderTargets(); renderZone();
