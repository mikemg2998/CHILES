/* Interfaz: solo pinta y manda órdenes al motor. Toda la lógica vive en /engine. */
import { GameEngine } from '../engine/engine.js';
import { GROUPS, MODES, INTENSITY_NAMES } from '../engine/catalog.js';
import { PreferenceManager } from '../engine/prefs.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('pab.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('pab.' + k, JSON.stringify(v)); } catch { } },
};

const prefs = new PreferenceManager(store.get('prefs', {}));
const engine = new GameEngine({ prefs });
engine.state.favorites = store.get('favs', []);
const DICE = [
  { k: 'action', lab: 'Acción', c: 'var(--accion)' }, { k: 'zone', lab: 'Zona', c: 'var(--zona)' },
  { k: 'style', lab: 'Forma', c: 'var(--forma)' }, { k: 'cond', lab: 'Condición', c: 'var(--cond)' },
];
let current = null, timer = null, spins = [0, 0, 0, 0];

/* ---------- pintar ---------- */
function renderModes() {
  $('#modes').innerHTML = Object.entries(MODES).map(([k, m]) => `<button role="tab" data-mode="${k}" class="${prefs.mode === k ? 'on' : ''}">${m.name}</button>`).join('');
}
function renderTurn() {
  const n = prefs.names;
  const p = current ? current.performer : engine.state.performer;
  const a = n[p] || `Jugador ${p + 1}`, b = n[1 - p] || `Jugador ${2 - p}`;
  $('#turn').innerHTML = `<span><b>${esc(a)}</b> <i>→</i> ${esc(b)}</span>`;
}
function renderDice(faces) {
  const size = Math.min(92, Math.floor((Math.min(window.innerWidth, 520) - 32 - 30) / 4));
  $('#dice').innerHTML = DICE.map((d, i) => {
    const f = faces ? faces[d.k] : [d.lab, '?', '?', '?', '?', '?'];
    return `<div class="die ${faces ? '' : 'idle'}" style="--c:${d.c};--s:${size}px" data-i="${i}"><div class="box"><div class="cube">${f.map((t, j) => `<div class="f f${j + 1} ${t === '⭐' ? 'star' : ''}">${esc(t)}</div>`).join('')}</div></div><div class="shadow"></div><div class="lab">${d.lab}</div></div>`;
  }).join('');
}
function spin() {
  document.querySelectorAll('.die').forEach((d, i) => {
    d.classList.add('rolling');
    const cube = d.querySelector('.cube');
    spins[i] += 2 + Math.floor(Math.random() * 2);
    const rx = 360 * spins[i], ry = 360 * (spins[i] + (i % 2));
    cube.style.transitionDelay = (i * 90) + 'ms';
    cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
}
function renderResult(r) {
  const el = $('#result');
  el.classList.remove('enter', 'sig'); void el.offsetWidth;
  const fav = engine.state.favorites.some(f => f.id === r.id);
  let meta = `<span class="dot"></span>${INTENSITY_NAMES[r.intensity]} · ${r.categoryName}`;
  if (r.signature) meta += ` <span class="sig">✦ combinación especial</span>`;
  if (r.wildcard) meta += ` <span class="wild">⭐ ${esc(r.wildcardText || 'comodín')}</span>`;
  const phrase = esc(r.phrase).replace(new RegExp(`\\b(${[r.performerName, r.partnerName].filter(Boolean).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g'), '<b>$1</b>');
  el.innerHTML = `<div class="meta">${meta}</div><p class="phrase">${phrase}</p>
    ${r.seconds ? `<button class="timer" id="timer"><span>⏱</span><b>${r.seconds}</b> s · toca para empezar</button>` : ''}
    <button class="favbtn ${fav ? 'on' : ''}" id="favToggle" aria-label="Guardar favorita">${fav ? '♥' : '♡'}</button>`;
  el.classList.add('enter'); if (r.signature) el.classList.add('sig');
  document.body.dataset.int = r.intensity;
  $('#secondary').hidden = false;
  $('#btnRoll').textContent = 'Siguiente ronda';
}
function show(r) {
  current = r; stopTimer();
  renderDice(r.dice);
  requestAnimationFrame(() => requestAnimationFrame(spin));
  renderTurn();
  $('#btnRoll').disabled = true;
  $('#secondary').hidden = true;
  $('#result').innerHTML = '<p class="intro">…</p>';
  try { navigator.vibrate && navigator.vibrate([20, 40, 30]); } catch { }
  setTimeout(() => { renderResult(r); $('#btnRoll').disabled = false; }, 1450);
}

/* ---------- temporizador ---------- */
function stopTimer() { clearInterval(timer); timer = null; }
function startTimer(btn, secs) {
  stopTimer(); let left = secs; const b = btn.querySelector('b');
  btn.lastChild.textContent = ''; btn.classList.remove('done');
  timer = setInterval(() => { left--; b.textContent = left; if (left <= 0) { stopTimer(); btn.classList.add('done'); btn.lastChild.textContent = ' · ¡tiempo!'; try { navigator.vibrate && navigator.vibrate([80, 60, 80]); } catch { } } }, 1000);
}

/* ---------- ajustes ---------- */
function renderSettings() {
  $('#name0').value = prefs.names[0] || ''; $('#name1').value = prefs.names[1] || '';
  $('#groups').innerHTML = Object.entries(GROUPS).map(([k, g]) => `<label class="${g.intimate ? 'intimate' : ''}"><input type="checkbox" data-group="${k}" ${prefs.enabledGroups.includes(k) ? 'checked' : ''}>${g.name}</label>`).join('');
  $('#maxInt').value = prefs.maxIntensity; $('#maxIntLabel').textContent = `${prefs.maxIntensity} · ${INTENSITY_NAMES[prefs.maxIntensity]}`;
  $('#duration').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === prefs.durationPreference));
}
function savePrefs() { store.set('prefs', prefs.toJSON()); renderModes(); renderTurn(); }

/* ---------- favoritas ---------- */
function renderFavs() {
  const list = engine.state.favorites;
  $('#favList').innerHTML = list.length ? list.slice().reverse().map(f => `<div class="fav"><p>${esc(f.phrase)}</p><div class="row"><button class="btn ghost" data-fav="repeat" data-id="${f.id}">Repetir</button><button class="btn ghost" data-fav="inspire" data-id="${f.id}">Inspirarse</button><button class="btn ghost" data-fav="del" data-id="${f.id}" aria-label="Quitar">✕</button></div></div>`).join('') : '<p class="empty">Toca ♡ en una ronda para guardarla aquí.</p>';
}
function saveFavs() { store.set('favs', engine.state.favorites); }

/* ---------- eventos ---------- */
$('#btnRoll').addEventListener('click', () => show(engine.roll()));
$('#btnPass').addEventListener('click', () => show(engine.pass()));
$('#btnReroll').addEventListener('click', () => show(engine.reroll()));
$('#btnLower').addEventListener('click', () => show(engine.lowerIntensity()));
$('#modes').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (!b) return; prefs.mode = b.dataset.mode; savePrefs(); });
$('#result').addEventListener('click', e => {
  if (e.target.closest('#timer')) { const t = e.target.closest('#timer'); if (!timer) startTimer(t, current.seconds); return; }
  if (e.target.closest('#favToggle') && current) {
    const on = engine.state.favorites.some(f => f.id === current.id);
    if (on) engine.removeFavorite(current.id); else engine.addFavorite(current);
    saveFavs(); const b = $('#favToggle'); b.classList.toggle('on', !on); b.textContent = on ? '♡' : '♥';
  }
});
$('#btnSettings').addEventListener('click', () => { renderSettings(); $('#sheetSettings').hidden = false; });
$('#btnFav').addEventListener('click', () => { renderFavs(); $('#sheetFav').hidden = false; });
document.querySelectorAll('.sheet').forEach(sh => sh.addEventListener('click', e => { if (e.target === sh || e.target.closest('[data-close]')) sh.hidden = true; }));
$('#sheetSettings').addEventListener('input', e => {
  if (e.target.id === 'name0' || e.target.id === 'name1') { prefs.names = [$('#name0').value.trim(), $('#name1').value.trim()]; }
  if (e.target.dataset.group) { prefs.enabledGroups = [...document.querySelectorAll('[data-group]:checked')].map(c => c.dataset.group); if (!prefs.enabledGroups.length) { e.target.checked = true; prefs.enabledGroups = [e.target.dataset.group]; } }
  if (e.target.id === 'maxInt') { prefs.maxIntensity = Number(e.target.value); $('#maxIntLabel').textContent = `${prefs.maxIntensity} · ${INTENSITY_NAMES[prefs.maxIntensity]}`; }
  savePrefs();
});
$('#duration').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; prefs.durationPreference = b.dataset.v; renderSettings(); savePrefs(); });
$('#btnReset').addEventListener('click', () => { engine.resetGame(); current = null; stopTimer(); $('#sheetSettings').hidden = true; renderDice(null); renderTurn(); document.body.dataset.int = 0; $('#secondary').hidden = true; $('#btnRoll').textContent = 'Lanzar dados'; $('#result').innerHTML = '<p class="intro">Partida nueva. Cuando queráis, lanzad.</p>'; });
$('#favList').addEventListener('click', e => {
  const b = e.target.closest('[data-fav]'); if (!b) return;
  const fav = engine.state.favorites.find(f => f.id === b.dataset.id); if (!fav) return;
  if (b.dataset.fav === 'del') { engine.removeFavorite(fav.id); saveFavs(); renderFavs(); return; }
  $('#sheetFav').hidden = true;
  show(b.dataset.fav === 'repeat' ? engine.repeatFavorite(fav) : engine.inspireFavorite(fav));
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.sheet').forEach(s => s.hidden = true); });
window.addEventListener('resize', () => { if (!current) renderDice(null); });

renderModes(); renderTurn(); renderDice(null);
