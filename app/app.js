/* Interfaz de Pollo a la brasa. El motor (engine/) decide; aquí solo se muestra y se anima. */
import { GameEngine } from '../engine/engine.js';
import { PreferenceManager } from '../engine/prefs.js';
import { GROUPS, LEVELS, CATEGORIES, ZONE } from '../engine/catalog.js';

const KEY = 'pab.v2';
const $ = s => document.querySelector(s);
const MODES = [['relajado', 'Relajado'], ['sensual', 'Sensual'], ['atrevido', 'Atrevido'], ['progresivo', 'Progresivo']];
const DICE = ['action', 'zone', 'method', 'cond'];
const IDLE_FACE = { action: 'Acción', zone: 'Zona', method: 'Forma', cond: 'Condición' };

/* ---------- estado persistente ---------- */
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saved = load();
const prefs = new PreferenceManager(saved.prefs || {});
if (!MODES.some(m => m[0] === prefs.mode)) prefs.mode = 'relajado';
const engine = new GameEngine({ prefs });
engine.state.favorites = Array.isArray(saved.favorites) ? saved.favorites : [];
const ui = { vibrate: saved.vibrate !== false };
let current = null, busy = false;

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify({ prefs: prefs.toJSON(), favorites: engine.state.favorites, vibrate: ui.vibrate })); } catch { /* sin almacenamiento: la partida sigue */ }
}
const buzz = p => { if (ui.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch { /* nada */ } } };

/* ---------- utilidades de texto ---------- */
const realNames = () => (prefs.names || []).filter(n => n && n.trim());
/* frase con los nombres en dorado, construida con nodos (sin HTML) */
function phraseNode(text, el) {
  el.textContent = '';
  const names = realNames();
  if (!names.length) { el.textContent = text; return; }
  const re = new RegExp(`(${names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  for (const part of text.split(re)) {
    if (!part) continue;
    if (names.includes(part)) { const b = document.createElement('b'); b.textContent = part; el.appendChild(b); } else el.appendChild(document.createTextNode(part));
  }
}
const toastEl = $('#toast'); let toastT = 0;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1900); }

/* ---------- nivel ---------- */
const levelsEl = $('#levels');
function renderLevels() {
  levelsEl.innerHTML = '';
  for (const [key, name] of MODES) {
    const b = document.createElement('button'); b.type = 'button'; b.role = 'tab'; b.textContent = name;
    if (prefs.mode === key) { b.classList.add('on'); b.setAttribute('aria-selected', 'true'); }
    b.addEventListener('click', () => setMode(key));
    levelsEl.appendChild(b);
  }
  renderPath();
}
function setMode(key) {
  if (busy || key === prefs.mode) return;
  prefs.mode = key;
  if (key === 'progresivo') engine.state.progressive = { band: 1, calm: 0 };
  persist(); renderLevels(); updateVariants(); buzz(6);
}
const pathEl = $('#path');
function renderPath() {
  pathEl.hidden = prefs.mode !== 'progresivo';
  const band = engine.state.progressive.band;
  pathEl.querySelectorAll('span').forEach(s => { const b = Number(s.dataset.b); s.classList.toggle('on', b === band); s.classList.toggle('done', b < band); });
}

/* ---------- turno ---------- */
function renderTurn() {
  const names = prefs.names || ['', ''];
  let a, b;
  if (current) { a = current.performerName; b = current.partnerName; }
  else { const p = engine.state.performer; a = names[p] || `Jugador ${p + 1}`; b = names[1 - p] || `Jugador ${2 - p}`; }
  $('#turnA').textContent = a; $('#turnB').textContent = b;
}

/* ---------- dados ---------- */
const dieEls = Object.fromEntries(DICE.map(k => [k, document.querySelector(`.die[data-k="${k}"]`)]));
const REST = 'rotateX(-12deg) rotateY(16deg)';
const RX = -12, RY = 16;
/* tamaño real del cubo → profundidad de las caras */
const ro = new ResizeObserver(entries => { for (const e of entries) e.target.style.setProperty('--hs', (e.contentRect.width / 2) + 'px'); });
for (const k of DICE) ro.observe(dieEls[k].querySelector('.cube'));
function paint(faceEl, text) {
  const blank = !text || text === '—';
  faceEl.classList.toggle('blank', blank);
  faceEl.innerHTML = ''; if (!blank) { const sp = document.createElement('span'); sp.textContent = text; faceEl.appendChild(sp); }
}
function setFace(k, text) { paint(dieEls[k].querySelector('.f1'), text); }
function setFaces(k, faces) { for (let i = 0; i < 6; i++) paint(dieEls[k].querySelector('.f' + (i + 1)), faces[i]); }
function idleDice() { for (const k of DICE) setFaces(k, [IDLE_FACE[k], '', '', '', '', '']); }
const wait = ms => new Promise(r => setTimeout(r, ms));
/* ~1 s: el cubo se eleva, gira sobre dos ejes con las seis caras reales del nivel y frena hasta posarse en el resultado (cara frontal) */
async function animateDie(k, faces, delay) {
  await wait(delay);
  const el = dieEls[k], cube = el.querySelector('.cube');
  setFaces(k, faces);
  el.classList.remove('settle'); el.classList.add('rolling');
  const sx = Math.random() < 0.5 ? 1 : -1, sy = Math.random() < 0.5 ? 1 : -1;
  const tx = 720 * sx + (Math.random() < 0.5 ? 0 : 360 * sx), ty = 360 * sy + (Math.random() < 0.5 ? 0 : 360 * sy);
  const lift = 14 + (cube.clientWidth || 80) * 0.18;
  const frames = [
    { transform: `translateY(0px) ${REST}` },
    { transform: `translateY(${-lift}px) rotateX(${RX + tx * 0.35}deg) rotateY(${RY + ty * 0.3}deg)`, offset: 0.32 },
    { transform: `translateY(${-lift * 0.35}px) rotateX(${RX + tx * 0.78}deg) rotateY(${RY + ty * 0.76}deg)`, offset: 0.72 },
    { transform: `translateY(0px) rotateX(${RX + tx}deg) rotateY(${RY + ty}deg)` },
  ];
  const a = cube.animate(frames, { duration: 1000, easing: 'cubic-bezier(.22,.7,.18,1)', fill: 'forwards' });
  await a.finished.catch(() => {});
  cube.style.transform = REST; a.cancel();
  el.classList.remove('rolling'); el.classList.add('settle'); buzz(6);
}
async function rollDice(round) {
  await Promise.all(DICE.map((k, i) => animateDie(k, round.dice[k], i * 60)));
  await wait(80);
}

/* ---------- ronda ---------- */
const roundBox = $('#roundBox'), welcome = $('#welcome');
function showRound(r) {
  current = r;
  welcome.hidden = true; roundBox.hidden = false; roundBox.classList.remove('show');
  const extra = r.variant === 'softer' ? ' · más suave' : r.variant === 'harder' ? ' · más intenso' : '';
  $('#metaText').textContent = `${LEVELS[r.level].name} · ${CATEGORIES[r.category] || ''}${extra}`;
  phraseNode(r.phrase, $('#phrase'));
  const note = $('#note');
  if (r.bandUp) { note.hidden = false; note.textContent = `La siguiente ronda sube a ${LEVELS[r.bandUp].name}.`; }
  else note.hidden = true;
  void roundBox.offsetWidth; roundBox.classList.add('show');
  renderFavBtn(); renderTurn(); renderPath(); updateVariants();
}
function renderFavBtn() { $('#btnFav').classList.toggle('on', !!current && engine.state.favorites.some(f => f.id === current.id)); }
/* Bajar/Subir solo cuando el motor tiene una variante con la misma idea */
function updateVariants() {
  const can = dir => { if (!current) return false; try { return !!engine.getVariant(current, dir); } catch { return false; } };
  $('#btnSofter').disabled = !can(-1); $('#btnHarder').disabled = !can(+1);
}
function setBusy(v) {
  busy = v;
  for (const id of ['btnRoll', 'btnPass', 'btnReroll']) $(`#${id}`).disabled = v;
  if (v) { $('#btnSofter').disabled = true; $('#btnHarder').disabled = true; }
}
async function play(fn, emptyMsg) {
  if (busy) return;
  let r;
  try { r = fn(); } catch (e) { console.error(e); toast('No he encontrado una combinación válida. Revisa las zonas activas en ajustes.'); return; }
  if (!r) { if (emptyMsg) toast(emptyMsg); return; }
  setBusy(true); buzz(14);
  document.body.classList.remove('idle');
  roundBox.classList.remove('show'); welcome.hidden = true;
  await rollDice(r);
  showRound(r);
  setBusy(false);
}

$('#btnRoll').addEventListener('click', () => play(() => engine.roll()));
$('#btnPass').addEventListener('click', () => play(() => engine.pass()));
$('#btnReroll').addEventListener('click', () => play(() => engine.reroll()));
$('#btnSofter').addEventListener('click', () => play(() => engine.softer(), 'No hay una versión más suave de esta misma idea.'));
$('#btnHarder').addEventListener('click', () => play(() => engine.harder(), 'No hay una versión más intensa de esta misma idea.'));

/* ---------- favoritas ---------- */
const slim = r => ({ id: r.id, action: r.action, zone: r.zone, method: r.method, cond: r.cond, alt: r.alt, intensity: r.intensity, level: r.level, levelName: r.levelName, phrase: r.phrase, performerName: r.performerName, partnerName: r.partnerName, category: r.category });
$('#btnFav').addEventListener('click', () => {
  if (!current) return;
  if (engine.state.favorites.some(f => f.id === current.id)) { engine.removeFavorite(current.id); toast('Quitada de favoritas'); }
  else { engine.addFavorite(slim(current)); toast('Guardada en favoritas'); buzz(10); }
  persist(); renderFavBtn(); renderFavCount();
});
function renderFavCount() { const n = engine.state.favorites.length; const c = $('#favCount'); c.hidden = !n; c.textContent = n; }
function renderFavs() {
  const list = $('#favList'); list.innerHTML = '';
  const favs = [...engine.state.favorites].reverse();
  if (!favs.length) { const e = document.createElement('p'); e.className = 'empty'; e.textContent = 'Aún no hay favoritas. Guarda una ronda con el marcador que hay junto a la frase.'; list.appendChild(e); return; }
  for (const f of favs) {
    const card = document.createElement('article'); card.className = 'card';
    const meta = document.createElement('div'); meta.className = 'meta';
    const ms = document.createElement('span'); ms.textContent = `${f.levelName} · ${f.performerName} → ${f.partnerName}`; meta.appendChild(ms);
    const rm = document.createElement('button'); rm.className = 'ib'; rm.setAttribute('aria-label', 'Quitar'); rm.innerHTML = '<svg><use href="#i-x"/></svg>';
    rm.addEventListener('click', () => { engine.removeFavorite(f.id); persist(); renderFavs(); renderFavCount(); renderFavBtn(); });
    meta.appendChild(rm); card.appendChild(meta);
    const p = document.createElement('p'); p.className = 'phrase'; phraseNode(f.phrase, p); card.appendChild(p);
    const acts = document.createElement('div'); acts.className = 'acts';
    const rep = document.createElement('button'); rep.className = 'btn gold'; rep.innerHTML = '<svg><use href="#i-repeat"/></svg>Repetir';
    rep.addEventListener('click', () => {
      if (!prefs.zoneEnabled(ZONE[f.zone])) { toast('Esa zona está desactivada en ajustes.'); return; }
      closeSheets(); play(() => engine.repeatFavorite(f));
    });
    const ins = document.createElement('button'); ins.className = 'btn'; ins.innerHTML = '<svg><use href="#i-spark"/></svg>Inspirarse';
    ins.addEventListener('click', () => { closeSheets(); play(() => engine.inspireFavorite(f)); });
    acts.append(rep, ins); card.appendChild(acts);
    list.appendChild(card);
  }
}

/* ---------- hojas ---------- */
const backdrop = $('#backdrop');
let openSheet = null;
function open(sheet) { openSheet = sheet; backdrop.hidden = false; void backdrop.offsetWidth; backdrop.classList.add('show'); sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); }
function closeSheets() {
  if (!openSheet) return;
  openSheet.classList.remove('open'); openSheet.setAttribute('aria-hidden', 'true'); openSheet = null;
  backdrop.classList.remove('show'); setTimeout(() => { if (!openSheet) backdrop.hidden = true; }, 300);
}
backdrop.addEventListener('click', closeSheets);
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeSheets));
$('#btnFavs').addEventListener('click', () => { renderFavs(); open($('#sheetFavs')); });
$('#btnSettings').addEventListener('click', () => { renderSettings(); open($('#sheetSettings')); });

/* ---------- ajustes ---------- */
function groupSwitch(g) {
  const l = document.createElement('label'); l.className = 'sw';
  const s = document.createElement('span'); s.textContent = GROUPS[g].name;
  const i = document.createElement('input'); i.type = 'checkbox'; i.checked = prefs.enabledGroups.includes(g);
  i.addEventListener('change', () => {
    const set = new Set(prefs.enabledGroups);
    if (i.checked) set.add(g); else set.delete(g);
    if (!set.size) { i.checked = true; toast('Deja al menos una zona activa.'); return; }
    prefs.enabledGroups = [...set]; persist(); updateVariants();
  });
  l.append(s, i, document.createElement('i'));
  return l;
}
function renderSettings() {
  $('#name0').value = prefs.names[0] || ''; $('#name1').value = prefs.names[1] || '';
  const g1 = $('#groups'), g2 = $('#groupsIntimate'); g1.innerHTML = ''; g2.innerHTML = '';
  for (const g of Object.keys(GROUPS)) (GROUPS[g].intimate ? g2 : g1).appendChild(groupSwitch(g));
  $('#swVibe').checked = ui.vibrate;
  $('#btnClearFavs').classList.remove('arm'); $('#btnClearFavs').textContent = 'Borrar favoritas';
}
for (const [id, i] of [['#name0', 0], ['#name1', 1]]) {
  $(id).addEventListener('input', e => { const n = [...(prefs.names || ['', ''])]; n[i] = e.target.value.trim(); prefs.names = n; persist(); renderTurn(); });
}
$('#swVibe').addEventListener('change', e => { ui.vibrate = e.target.checked; persist(); if (ui.vibrate) buzz(10); });
$('#btnReset').addEventListener('click', () => {
  engine.resetGame(); engine.state.performer = 0; current = null;
  roundBox.hidden = true; roundBox.classList.remove('show'); welcome.hidden = false;
  document.body.classList.add('idle'); idleDice(); renderTurn(); renderPath(); updateVariants();
  closeSheets(); toast('Partida nueva');
});
$('#btnClearFavs').addEventListener('click', e => {
  const b = e.currentTarget;
  if (!b.classList.contains('arm')) { b.classList.add('arm'); b.textContent = '¿Seguro? Toca otra vez para borrar'; setTimeout(() => { b.classList.remove('arm'); b.textContent = 'Borrar favoritas'; }, 3000); return; }
  engine.state.favorites = []; persist(); renderFavCount(); renderFavBtn(); b.classList.remove('arm'); b.textContent = 'Borrar favoritas'; toast('Favoritas borradas');
});

/* ---------- arranque ---------- */
renderLevels(); renderTurn(); idleDice(); renderFavCount(); updateVariants();
