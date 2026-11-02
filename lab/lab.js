/* CONTENT LAB · inspector de cartas y depurador del mazo. Lee los mismos datos que el motor (content/) y usa el mismo
   selector (engine/deck.js). No edita nada: aprobar o rechazar es cambiar `status` en content/ y pasar la validación.
   Lo que muestra por carta: ID · NIVEL · FAMILIA · TIPO · STATUS · ORIGEN · quien actúa · quien recibe · anatomía · ropa ·
   disponibilidad · lado · variantes · PlayConstraints · tiempos · peso · elegibilidad en el escenario elegido.
   Por selección: candidatas, rechazadas con motivo, pesos, ganadora, variante, lado, duración, propósito. */
import { CARDS, validateContent } from '../content/index.js';
import { BODY_PARTS, ACTOR_TOOLS, GARMENTS, GARMENT_LABEL, ANATOMY } from '../content/body.js';
import { FAMILIES } from '../content/schema.js';
import { GameEngine } from '../engine/engine.js';
import { LEVELS } from '../engine/levels.js';
import { buildDeck } from '../engine/deck.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const errors = validateContent();
const val = $('#validation'); if (errors.length) { val.hidden = false; val.textContent = errors.join('\n'); }
const real = CARDS.filter(c => !c.transition);
$('#counts').textContent = `${real.length} cartas · ${real.filter(c => c.status === 'APPROVED').length} aprobadas · ${real.filter(c => c.status === 'UNREVIEWED').length} sin revisar`;

/* ---------- escenario (compartido por las dos pestañas) ---------- */
const scn = { level: 3, actor: 0, names: ['Ana', 'Leo'], anatomy: [['vulva', 'senos'], ['pene']], clothing: [{ top: 'ON', bottoms: 'ON', socks: 'ON', underwear: 'ON' }, { top: 'ON', bottoms: 'ON', socks: 'ON', underwear: 'ON' }] };
let engine = mkEngine();
function mkEngine() { const e = new GameEngine({ prefs: { names: scn.names, bodyParts: scn.anatomy }, level: scn.level }); e.clothing = scn.clothing.map(s => ({ ...s })); return e; }
function ctx(actor = scn.actor) { engine.prefs.bodyParts = scn.anatomy; engine.session.level = scn.level; engine.clothing = scn.clothing.map(s => ({ ...s })); engine._an = null; return engine.context(actor); }
function renderScenario() {
  const box = $('#scenario');
  box.innerHTML = `<div class="group"><b>Nivel</b> ${[1, 2, 3].map(l => `<button class="chip ${scn.level === l ? 'on' : ''}" data-level="${l}">${l} ${LEVELS[l].name}</button>`).join('')}</div>
  <div class="group"><b>Actúa</b> ${[0, 1].map(p => `<button class="chip ${scn.actor === p ? 'on' : ''}" data-actor="${p}">${scn.names[p]}</button>`).join('')}</div>` +
  [0, 1].map(p => `<div class="group"><b>${scn.names[p]}</b> · anatomía ${Object.keys(ANATOMY).map(a => `<button class="chip ${scn.anatomy[p].includes(a) ? 'on' : ''}" data-an="${p}:${a}">${ANATOMY[a].label}</button>`).join('')}<br>` +
    GARMENTS.map(g => `<span class="row">${GARMENT_LABEL[g]} ${['ON', 'OFF', 'NONE'].map(s => `<button class="chip small ${scn.clothing[p][g] === s ? 'on' : ''}" data-cl="${p}:${g}:${s}">${s}</button>`).join('')}</span>`).join('') + '</div>').join('');
  box.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.level) scn.level = Number(b.dataset.level);
    if (b.dataset.actor) scn.actor = Number(b.dataset.actor);
    if (b.dataset.an) { const [p, a] = b.dataset.an.split(':'); const l = scn.anatomy[p]; scn.anatomy[p] = l.includes(a) ? l.filter(x => x !== a) : [...l, a]; }
    if (b.dataset.cl) { const [p, g, s] = b.dataset.cl.split(':'); scn.clothing[p][g] = s; }
    renderScenario(); renderDeck(); if (currentId) renderCard(currentId);
  };
}

/* ---------- cartas ---------- */
let currentId = null, filter = 'all', q = '';
function renderFilters() { $('#filters').innerHTML = [['all', 'Todas'], ['1', 'Conexión'], ['2', 'Deseo'], ['3', 'Intimidad'], ['UNREVIEWED', 'Sin revisar']].map(([k, l]) => `<button class="chip ${filter === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join(''); }
$('#filters').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.f; renderFilters(); renderList(); });
$('#search').addEventListener('input', e => { q = e.target.value.toLowerCase(); renderList(); });
function renderList() {
  const list = real.filter(c => (filter === 'all' || String(c.level) === filter || c.status === filter) && (!q || c.id.toLowerCase().includes(q) || FAMILIES[c.family].toLowerCase().includes(q) || JSON.stringify(c.copy || c.copyBySide || c.variants).toLowerCase().includes(q)));
  $('#cardList').innerHTML = list.map(c => `<button class="tItem ${c.id === currentId ? 'on' : ''} st-${c.status}" data-id="${c.id}"><b>${c.id}</b> <span>${esc(FAMILIES[c.family])} · ${c.interactionType}</span><em>${c.status}</em></button>`).join('') || '<p class="empty">Nada.</p>';
}
$('#cardList').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (!b) return; currentId = b.dataset.id; renderList(); renderCard(currentId); });
const req = (list, map) => list.length ? list.map(r => `<span class="pill">${esc(map[r.part] ? map[r.part].label : r.part)}${map[r.part] && map[r.part].anatomy ? ' · ' + map[r.part].anatomy : ''}</span>`).join(' ') : '<span class="pill">—</span>';
function renderCard(id) {
  const c = CARDS.find(x => x.id === id); if (!c) return;
  const deck = buildDeck([c], ctx());
  const elig = deck.eligible.length ? `<span class="ok">ELEGIBLE ahora (${scn.names[scn.actor]} → ${scn.names[1 - scn.actor]}, nivel ${scn.level})</span>` : `<span class="bad">NO elegible: ${esc(deck.rejected[0].reason)}</span>`;
  const copies = c.allowedSides ? Object.entries(c.copyBySide || {}).map(([s, l]) => `<b>${s}</b><ul>${l.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`).join('') : `<ul>${(c.copy || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  const variants = c.variants ? c.variants.map(v => `<div class="card"><div class="row"><b>${v.id}</b> <span class="pill st-${v.status}">${v.status}</span> ${v.anatomy ? `<span class="pill">anatomía ${v.anatomy}</span>` : ''} ${v.receiverRequirements ? req(v.receiverRequirements, BODY_PARTS) : ''}</div>${v.copyBySide ? Object.entries(v.copyBySide).map(([s, l]) => `<b>${s}</b><ul>${l.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`).join('') : `<ul>${(v.copy || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`}${v.notes ? `<p class="hint">${esc(v.notes)}</p>` : ''}</div>`).join('') : '';
  $('#card').innerHTML = `<h2>${c.id} <span class="pill st-${c.status}">${c.status}</span> <span class="pill">${c.source}</span></h2>
  <p class="hint">${elig}</p>
  <div class="grid">
    <div><b>Nivel</b> ${c.level} ${LEVELS[c.level].name}</div><div><b>Familia</b> ${esc(FAMILIES[c.family])}</div><div><b>Tipo</b> ${c.interactionType}</div><div><b>Intensidad</b> ${c.intraLevelIntensity || '—'}</div>
    <div><b>Actúa con</b> ${req(c.actorRequirements, ACTOR_TOOLS)}</div><div><b>Recibe en</b> ${req(c.receiverRequirements, BODY_PARTS)}</div>
    <div><b>Ropa (actúa)</b> ${c.clothing.actor.join(' · ')}</div><div><b>Ropa (recibe)</b> ${c.clothing.receiver.join(' · ')}</div>
    <div><b>Lados</b> ${c.allowedSides ? c.allowedSides.join(' · ') : 'sin lado'}</div><div><b>PlayConstraints</b> ${c.playConstraints ? c.playConstraints.join(' · ') : '—'}</div>
    <div><b>Tiempo</b> ${c.timerMode}${c.durations.length ? ' · ' + c.durations.join(' / ') + ' s' : ''}</div><div><b>Peso</b> ${c.baseWeight}</div>
    ${c.requiredOrientation ? `<div><b>Orientación</b> ${c.requiredOrientation}</div>` : ''}${c.choices ? `<div><b>Elección</b> ${c.choices.map(x => x.label).join(' / ')}</div>` : ''}${c.path ? `<div><b>Trayecto</b> ${c.path.from} → ${c.path.to}</div>` : ''}${c.undress ? `<div><b>UNDRESS</b> ${esc(JSON.stringify(c.undress))}</div>` : ''}
    <div><b>Etiquetas</b> ${c.tags.join(' · ') || '—'}</div>${c.note ? `<div><b>Nota en pantalla</b> ${esc(c.note)}</div>` : ''}
  </div>
  <h3>Copia</h3>${copies}${variants ? '<h3>Variantes</h3>' + variants : ''}
  ${c.notes ? `<h3>Notas de revisión</h3><p class="hint">${esc(c.notes)}</p>` : ''}`;
}

/* ---------- mazo en vivo ---------- */
function renderDeck() {
  const deck = buildDeck(CARDS, ctx());
  const rej = deck.rejected.filter(r => !['LEVEL', 'TRANSITION'].includes(r.reason));
  $('#deck').innerHTML = `<h2>${scn.names[scn.actor]} → ${scn.names[1 - scn.actor]} · nivel ${scn.level} · banda ${engine.clothingBand()}</h2>
  <h3>Elegibles (${deck.eligible.length})</h3><p>${deck.eligible.map(e => `<span class="pill ok" data-id="${e.card.id}">${e.card.id}${e.variants ? ' (' + e.variants.map(v => v.id).join(', ') + ')' : ''}</span>`).join(' ') || '<span class="bad">MAZO VACÍO: saldría la transición neutra y se registra para el diseñador.</span>'}</p>
  <h3>Rechazadas (${rej.length})</h3><table><tbody>${rej.map(r => `<tr><td><b>${r.id}</b></td><td>${esc(r.reason)}</td></tr>`).join('')}</tbody></table>
  `;
}
$('#draw').addEventListener('click', () => {
  engine.prefs.bodyParts = scn.anatomy; engine.session.level = scn.level; engine.clothing = scn.clothing.map(s => ({ ...s })); engine._an = null;
  const r = engine.round(engine.generate({ actor: scn.actor }), { actor: scn.actor });
  const d = r.debug || engine.lastDebug;
  if (r.undress) { for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? engine.removable(p)[0] : r.undress.garment; if (g) { engine.recordUndress(p, g); scn.clothing[p] = { ...engine.clothing[p] }; } } renderScenario(); }
  const box = $('#draws'); const div = document.createElement('div'); div.className = 'card';
  div.innerHTML = `<p class="phrase">${esc(r.phrase)}</p><p class="hint">${r.actorName} → ${r.receiverName} · <b>${r.cardId}</b>${r.variantId ? ' / ' + r.variantId : ''}${r.side ? ' / ' + r.side : ''}${r.playConstraint ? ' / ' + r.playConstraint : ''} · ${r.seconds ?? 'sin tiempo'} s · propósito ${d.purpose} (${esc(d.reason)})${d.fallback ? ' · MAZO VACÍO' : ''}</p>
  <p class="hint">pesos: ${d.candidates.map(c => `${c.id} ${c.weight}`).join(' · ')}</p>`;
  box.prepend(div);
  if (r.undress) renderDeck();
});
$('#reset').addEventListener('click', () => { engine = mkEngine(); renderDeck(); });

/* ---------- pestañas ---------- */
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === t)); document.querySelectorAll('.panel').forEach(p => p.hidden = p.id !== 'tab-' + t.dataset.tab); if (t.dataset.tab === 'mazo') renderDeck(); }));
renderFilters(); renderList(); renderScenario(); renderDeck();
