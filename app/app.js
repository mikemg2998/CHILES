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
const diceSec = $('#dice');
const RX = -8, RY = 10, REST = `rotateX(${RX}deg) rotateY(${RY}deg)`;
/* tamaño real del cubo → profundidad de las caras */
const ro = new ResizeObserver(entries => { for (const e of entries) e.target.style.setProperty('--hs', (e.contentRect.width / 2) + 'px'); });
for (const k of DICE) ro.observe(dieEls[k].querySelector('.cube'));
function paint(faceEl, text) {
  const blank = !text || text === '—';
  faceEl.classList.toggle('blank', blank);
  faceEl.innerHTML = ''; if (!blank) { const sp = document.createElement('span'); sp.textContent = text; faceEl.appendChild(sp); }
}
function setFaces(k, faces) { for (let i = 0; i < 6; i++) paint(dieEls[k].querySelector('.f' + (i + 1)), faces[i]); }
function idleDice() { for (const k of DICE) setFaces(k, [IDLE_FACE[k], '', '', '', '', '']); }
const wait = ms => new Promise(r => setTimeout(r, ms));

/* Cuatro dados lanzados sobre una mesa invisible: impulso, gravedad, rebotes, fricción, giro independiente en X/Y/Z,
   desaceleración y asentamiento en la cara del resultado. Cada dado con parámetros distintos; nunca sincronizados. */
function throwDice(round) {
  return new Promise(resolve => {
    const rect = diceSec.getBoundingClientRect();
    const slots = DICE.map(k => { const r = dieEls[k].querySelector('.cube').getBoundingClientRect(); return { x: r.left - rect.left, y: r.top - rect.top, s: r.width }; });
    const size = slots[0].s, W = rect.width, H = Math.max(rect.height, size * 1.7);
    diceSec.classList.add('throwing'); diceSec.style.minHeight = H + 'px';
    const g = 0.0048, now = performance.now();
    const rnd = (a, b) => a + Math.random() * (b - a), sgn = () => (Math.random() < 0.5 ? -1 : 1);
    const bodies = DICE.map((k, i) => {
      setFaces(k, round.dice[k]);
      const el = dieEls[k], cube = el.querySelector('.cube');
      el.classList.remove('settle'); el.classList.add('rolling');
      return { el, cube, k, x: slots[i].x, y: slots[i].y, z: 0, slot: slots[i],
        vx: (i < 2 ? 1 : -1) * rnd(0.28, 0.5) * (W / 390), vy: rnd(-0.16, 0.16), vz: rnd(0.68, 0.82),
        rx: RX, ry: RY, rz: 0, wx: rnd(1.6, 2.6) * sgn(), wy: rnd(1.2, 2.4) * sgn(), wz: rnd(-0.9, 0.9),
        t0: now + i * rnd(30, 70), grounded: false, tween: null, done: false };
    });
    let last = now;
    const paintBody = b => {
      b.el.style.transform = `translate3d(${b.x - b.slot.x}px,${b.y - b.slot.y}px,0)`;
      b.el.style.zIndex = String(10 + Math.round(b.y));
      b.el.style.setProperty('--lift', Math.min(1, b.z / 70).toFixed(3));
      b.cube.style.transform = `translateY(${-b.z}px) rotateX(${b.rx}deg) rotateY(${b.ry}deg) rotateZ(${b.rz}deg)`;
    };
    const step = t => {
      const dt = Math.min(32, t - last); last = t;
      let allDone = true;
      for (const b of bodies) {
        if (b.done) continue; allDone = false;
        if (t < b.t0) continue;
        if (b.tween) { // asentamiento: la rotación frena hasta la cara del resultado
          const p = Math.min(1, (t - b.tween.t0) / b.tween.dur), e = 1 - Math.pow(1 - p, 3);
          b.rx = b.tween.rx0 + (b.tween.rx1 - b.tween.rx0) * e; b.ry = b.tween.ry0 + (b.tween.ry1 - b.tween.ry0) * e; b.rz = b.tween.rz0 + (b.tween.rz1 - b.tween.rz0) * e;
          b.x += b.vx * dt * (1 - e); b.y += b.vy * dt * (1 - e);
          paintBody(b);
          if (p >= 1) { b.done = true; b.el.classList.remove('rolling'); b.el.classList.add('settle'); buzz(5); }
          continue;
        }
        // vuelo y rebotes
        b.z += b.vz * dt; b.vz -= g * dt;
        if (b.z <= 0) {
          b.z = 0;
          if (b.vz < -0.1) { b.vz = -b.vz * 0.42; b.vx *= 0.7; b.vy *= 0.7; b.wx *= 0.55; b.wy *= 0.55; b.wz *= 0.6; b.wz += rnd(-0.3, 0.3); }
          else { b.vz = 0; b.grounded = true; }
        }
        if (b.grounded) { const f = Math.exp(-0.006 * dt); b.vx *= f; b.vy *= f; b.wx *= Math.exp(-0.004 * dt); b.wy *= Math.exp(-0.004 * dt); b.wz *= Math.exp(-0.005 * dt); }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < 0) { b.x = 0; b.vx = -b.vx * 0.6; b.wz += rnd(-0.4, 0.4); } else if (b.x > W - size) { b.x = W - size; b.vx = -b.vx * 0.6; b.wz += rnd(-0.4, 0.4); }
        if (b.y < 0) { b.y = 0; b.vy = -b.vy * 0.6; } else if (b.y > H - size) { b.y = H - size; b.vy = -b.vy * 0.6; }
        // choque con otros dados que estén a la misma altura
        for (const o of bodies) {
          if (o === b || o.done || t < o.t0 || Math.abs(o.z - b.z) > size * 0.6) continue;
          const dx = (o.x - b.x), dy = (o.y - b.y), d = Math.hypot(dx, dy), min = size * 0.92;
          if (d > 0 && d < min) {
            const nx = dx / d, ny = dy / d, push = (min - d) / 2;
            b.x -= nx * push; b.y -= ny * push; o.x += nx * push; o.y += ny * push;
            const rv = (b.vx - o.vx) * nx + (b.vy - o.vy) * ny; // velocidad relativa en la normal
            if (rv > 0) { const j = rv * 0.75; b.vx -= j * nx; b.vy -= j * ny; o.vx += j * nx; o.vy += j * ny; b.wz += rnd(-0.5, 0.5); o.wz += rnd(-0.5, 0.5); }
          }
        }
        b.rx += b.wx * dt; b.ry += b.wy * dt; b.rz += b.wz * dt;
        const speed = Math.hypot(b.vx, b.vy), spin = Math.abs(b.wx) + Math.abs(b.wy) + Math.abs(b.wz);
        const age = t - b.t0;
        if ((b.grounded && speed < 0.06 && spin < 0.9 && age > 480) || age > 900) {
          const snap = (v, rest, w) => { const base = v - rest, k = Math.ceil(base / 360 + (w >= 0 ? 0.25 : -0.25)); return rest + (w >= 0 ? Math.max(k, Math.floor(base / 360) + 1) : Math.min(k, Math.ceil(base / 360) - 1)) * 360; };
          b.tween = { t0: t, dur: rnd(220, 300), rx0: b.rx, ry0: b.ry, rz0: b.rz, rx1: snap(b.rx, RX, b.wx), ry1: snap(b.ry, RY, b.wy), rz1: Math.round(b.rz / 360) * 360 };
        }
        paintBody(b);
      }
      if (allDone) resolve(); else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
/* tras asentarse, vuelven con suavidad a su sitio para que ACCIÓN · ZONA · FORMA · CONDICIÓN se lean en orden */
async function rollDice(round) {
  await throwDice(round);
  regroup(); // la frase aparece ya; los dados vuelven a su sitio mientras tanto
}
async function regroup() {
  await wait(140);
  diceSec.classList.add('regroup');
  for (const k of DICE) { const el = dieEls[k]; el.style.transform = ''; el.querySelector('.cube').style.transform = REST; el.style.setProperty('--lift', '0'); }
  await wait(430);
  diceSec.classList.remove('throwing', 'regroup'); diceSec.style.minHeight = '';
  for (const k of DICE) dieEls[k].style.zIndex = '';
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
function renderAnatomy() {
  document.querySelectorAll('.anat').forEach(box => {
    const i = Number(box.dataset.p), an = prefs.anatomy[i] || '';
    box.querySelectorAll('button').forEach(b => b.classList.toggle('on', an.includes(b.dataset.a)));
  });
}
document.querySelectorAll('.anat button').forEach(b => b.addEventListener('click', () => {
  const i = Number(b.closest('.anat').dataset.p), a = b.dataset.a; const an = [...(prefs.anatomy || ['', ''])];
  const cur = an[i] || ''; an[i] = cur.includes(a) ? cur.replace(a, '') : (cur + a).split('').sort().join('');
  prefs.anatomy = an; persist(); renderAnatomy(); updateVariants(); buzz(6);
}));
function renderSettings() {
  $('#name0').value = prefs.names[0] || ''; $('#name1').value = prefs.names[1] || '';
  renderAnatomy();
  const g1 = $('#groups'), g2 = $('#groupsIntimate'); g1.innerHTML = ''; g2.innerHTML = '';
  for (const g of Object.keys(GROUPS)) if (!GROUPS[g].intimate) g1.appendChild(groupSwitch(g));
  // un solo interruptor: la anatomía de cada jugador decide qué entra
  const l = document.createElement('label'); l.className = 'sw';
  const sp = document.createElement('span'); sp.textContent = 'Anatomía íntima en Atrevido';
  const inp = document.createElement('input'); inp.type = 'checkbox'; inp.checked = prefs.enabledGroups.some(g => GROUPS[g].intimate);
  inp.addEventListener('change', () => { const base = prefs.enabledGroups.filter(g => !GROUPS[g].intimate); prefs.enabledGroups = inp.checked ? [...base, 'intimaF', 'intimaM'] : base; persist(); updateVariants(); });
  l.append(sp, inp, document.createElement('i')); g2.appendChild(l);
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
