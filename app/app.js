/* Interfaz de Pollo a la brasa. El motor (engine/) elige entre cartas curadas; la pareja dirige la sesión.
   QUIÉN · QUÉ · SIGUIENTE: nada técnico llega a la pantalla. Los dados son solo un ritual de azar (revelación);
   no representan nada del contenido.
   Privacidad: en el teléfono solo se guardan nombres, anatomía, «Lo nuestro», vibración y si la configuración inicial
   está hecha. La sesión (ropa, humor, feedback, nivel, historial) vive en memoria y desaparece al cerrar. Sin telemetría. */
import { GameEngine, migrateFavorite } from '../engine/engine.js';
import { PreferenceManager } from '../engine/prefs.js';
import { LEVELS, LEVEL_IDS, LEVEL_KEYS, LEVEL_BY_KEY, LEVEL_COPY } from '../engine/levels.js';
import { formatDuration } from '../engine/duration.js';
import { MOODS, AVOIDS, PREF_STATES, PREF_LABEL } from '../engine/session.js';
import { GARMENT_LABEL, ANATOMY } from '../content/body.js';

const KEY = 'pab.v2';
const SCHEMA = 4; // 4 = cartas curadas (las favoritas del generador anterior se conservan como recuerdos)
const $ = s => document.querySelector(s);
const DICE = ['a', 'b'];
const DEBUG = new URLSearchParams(location.search).has('debug');

/* ---------- estado persistente (solo preferencias) ---------- */
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saved = load();
const prefs = new PreferenceManager(saved.prefs || {});
if (!LEVEL_BY_KEY[prefs.mode]) prefs.mode = 'conexion';
prefs.mode = LEVELS[LEVEL_BY_KEY[prefs.mode]].key; // claves antiguas («exploracion» → Deseo) → actuales
const engine = new GameEngine({ prefs, debug: DEBUG });
const savedSchema = Number(saved.schema) || 2;
engine.state.favorites = (Array.isArray(saved.favorites) ? saved.favorites : []).map(f => migrateFavorite(f)).filter(Boolean);
const ui = { vibrate: saved.vibrate !== false, setupDone: !!saved.setupDone || !!saved.prefs, started: false, moods: [[], []], pref: {}, clothingAsked: false, pauseShownAt: null };
let current = null, busy = false, ctaTimer = 0;
if (DEBUG) window.pab = engine;
if (savedSchema < SCHEMA && (saved.prefs || saved.favorites)) persist();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify({ schema: SCHEMA, prefs: prefs.toJSON(), favorites: engine.state.favorites, vibrate: ui.vibrate, setupDone: ui.setupDone })); } catch { /* sin almacenamiento: la partida sigue */ }
}
const buzz = p => { if (ui.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch { /* nada */ } } };

/* ---------- utilidades ---------- */
const realNames = () => (prefs.names || []).filter(n => n && n.trim());
const nameOf = i => (prefs.names || [])[i] || `Jugador ${i + 1}`;
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
const wait = ms => new Promise(r => setTimeout(r, ms));
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

/* ---------- nivel: lo decide la pareja, sin confirmación ---------- */
const pad = n => String(n).padStart(2, '0');
function renderLevel() {
  const L = LEVELS[engine.level()];
  $('#levelNum').textContent = pad(L.id); $('#levelName').textContent = L.name; $('#tagline').textContent = L.tagline;
  for (const k of LEVEL_IDS) document.body.classList.toggle('level-' + k, k === L.id);
}
function renderLevelList() {
  const list = $('#levelList'); list.innerHTML = '';
  const cur = engine.level();
  for (const key of LEVEL_KEYS) {
    const L = LEVELS[LEVEL_BY_KEY[key]];
    const b = el('button', 'lv' + (L.id === cur ? ' on' : '')); b.type = 'button';
    b.append(el('span', 'num', pad(L.id)), el('b', null, L.name), el('small', null, L.tagline));
    b.setAttribute('aria-pressed', String(L.id === cur));
    b.addEventListener('click', () => chooseLevel(L.id));
    list.appendChild(b);
  }
}
async function chooseLevel(id) {
  closeSheets();
  if (busy || id === engine.level()) return;
  engine.setLevel(id); prefs.mode = LEVELS[id].key; persist();
  engine.session.lastMessage = null;
  renderLevel(); updateControls(); buzz(8);
  await levelFlash(id);
  if (id === 3 && !ui.clothingAsked) openClothing(true); // Intimidad empieza desde la ropa real, no desde la desnudez
}
function levelFlash(id) {
  const f = $('#levelFlash'), L = LEVELS[id];
  $('#flashNum').textContent = pad(id); $('#flashName').textContent = L.name; $('#flashCopy').textContent = LEVEL_COPY[id];
  f.hidden = false; void f.offsetWidth; f.classList.add('show');
  return wait(1500).then(() => { f.classList.remove('show'); return wait(380); }).then(() => { f.hidden = true; });
}
$('#levelBtn').addEventListener('click', () => { if (busy) return; renderLevelList(); open($('#sheetLevel')); });

/* ---------- QUIÉN ---------- */
function renderTurn() {
  let a, b, mutual = false;
  if (current) { a = current.actorName; b = current.receiverName; mutual = current.mutual; }
  else { const p = engine.state.actor; a = nameOf(p); b = nameOf(1 - p); }
  $('#turnA').textContent = a; $('#turnB').textContent = b; $('#turnArrow').textContent = mutual ? '·' : '→';
}

/* ---------- dados: ritual de azar. Caras con puntos; no representan nada del contenido ---------- */
const dieEls = Object.fromEntries(DICE.map(k => [k, document.querySelector(`.die[data-k="${k}"]`)]));
const diceSec = $('#dice');
const RX = -8, RY = 10, REST = `rotateX(${RX}deg) rotateY(${RY}deg)`;
const ro = new ResizeObserver(entries => { for (const e of entries) e.target.style.setProperty('--hs', (e.contentRect.width / 2) + 'px'); });
for (const k of DICE) ro.observe(dieEls[k].querySelector('.cube'));
const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
function paint(faceEl, n) {
  faceEl.innerHTML = '';
  if (!n) { faceEl.classList.add('blank'); return; }
  faceEl.classList.remove('blank');
  for (const p of PIPS[n]) faceEl.appendChild(el('i', 'pip p' + p));
}
function setFaces(k, faces) { for (let i = 0; i < 6; i++) paint(dieEls[k].querySelector('.f' + (i + 1)), faces[i]); }
function idleDice() { for (const k of DICE) setFaces(k, [0, 0, 0, 0, 0, 0]); }
const rollFaces = () => { const r = 1 + Math.floor(Math.random() * 6); const rest = [1, 2, 3, 4, 5, 6].filter(x => x !== r); return [r, ...rest]; };

function throwDice() {
  return new Promise(resolve => {
    const rect = diceSec.getBoundingClientRect();
    const slots = DICE.map(k => { const r = dieEls[k].querySelector('.cube').getBoundingClientRect(); return { x: r.left - rect.left, y: r.top - rect.top, s: r.width }; });
    const size = slots[0].s, W = rect.width, H = Math.max(rect.height, size * 1.7);
    diceSec.classList.add('throwing'); diceSec.style.minHeight = H + 'px';
    const g = 0.0048, now = performance.now();
    const rnd = (a, b) => a + Math.random() * (b - a), sgn = () => (Math.random() < 0.5 ? -1 : 1);
    const bodies = DICE.map((k, i) => {
      setFaces(k, rollFaces());
      const el = dieEls[k], cube = el.querySelector('.cube');
      el.classList.remove('settle'); el.classList.add('rolling');
      return { el, cube, k, x: slots[i].x, y: slots[i].y, z: 0, slot: slots[i],
        vx: (i % 2 ? -1 : 1) * rnd(0.28, 0.5) * (W / 390), vy: rnd(-0.16, 0.16), vz: rnd(0.68, 0.82),
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
        if (b.tween) {
          const p = Math.min(1, (t - b.tween.t0) / b.tween.dur), e = 1 - Math.pow(1 - p, 3);
          b.rx = b.tween.rx0 + (b.tween.rx1 - b.tween.rx0) * e; b.ry = b.tween.ry0 + (b.tween.ry1 - b.tween.ry0) * e; b.rz = b.tween.rz0 + (b.tween.rz1 - b.tween.rz0) * e;
          b.x += b.vx * dt * (1 - e); b.y += b.vy * dt * (1 - e);
          paintBody(b);
          if (p >= 1) { b.done = true; b.el.classList.remove('rolling'); b.el.classList.add('settle'); buzz(5); }
          continue;
        }
        b.z += b.vz * dt; b.vz -= g * dt;
        if (b.z <= 0) { b.z = 0; if (b.vz < -0.1) { b.vz = -b.vz * 0.42; b.vx *= 0.7; b.vy *= 0.7; b.wx *= 0.55; b.wy *= 0.55; b.wz *= 0.6; b.wz += rnd(-0.3, 0.3); } else { b.vz = 0; b.grounded = true; } }
        if (b.grounded) { const f = Math.exp(-0.006 * dt); b.vx *= f; b.vy *= f; b.wx *= Math.exp(-0.004 * dt); b.wy *= Math.exp(-0.004 * dt); b.wz *= Math.exp(-0.005 * dt); }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < 0) { b.x = 0; b.vx = -b.vx * 0.6; b.wz += rnd(-0.4, 0.4); } else if (b.x > W - size) { b.x = W - size; b.vx = -b.vx * 0.6; b.wz += rnd(-0.4, 0.4); }
        if (b.y < 0) { b.y = 0; b.vy = -b.vy * 0.6; } else if (b.y > H - size) { b.y = H - size; b.vy = -b.vy * 0.6; }
        for (const o of bodies) {
          if (o === b || o.done || t < o.t0 || Math.abs(o.z - b.z) > size * 0.6) continue;
          const dx = (o.x - b.x), dy = (o.y - b.y), d = Math.hypot(dx, dy), min = size * 0.92;
          if (d > 0 && d < min) {
            const nx = dx / d, ny = dy / d, push = (min - d) / 2;
            b.x -= nx * push; b.y -= ny * push; o.x += nx * push; o.y += ny * push;
            const rv = (b.vx - o.vx) * nx + (b.vy - o.vy) * ny;
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
async function rollDice(round) { await throwDice(); regroup(round); }
async function regroup(round) {
  await wait(140);
  diceSec.classList.add('regroup');
  for (const k of DICE) { const el = dieEls[k]; el.style.transform = ''; el.querySelector('.cube').style.transform = REST; el.style.setProperty('--lift', '0'); }
  await wait(430);
  diceSec.classList.remove('throwing', 'regroup'); diceSec.style.minHeight = '';
  for (const k of DICE) dieEls[k].style.zIndex = '';
  await wait(700);
  if (!round || current !== round) return;
  diceSec.classList.add('settled');
}
async function wakeDice() { diceSec.classList.remove('settled'); await wait(60); }

/* ---------- QUÉ ---------- */
const roundBox = $('#roundBox'), welcome = $('#welcome'), endingBox = $('#ending');
function showRound(r) {
  current = r;
  welcome.hidden = true; endingBox.hidden = true; roundBox.hidden = false; roundBox.classList.remove('show');
  phraseNode(r.phrase, $('#phrase'));
  $('#phrase').dataset.len = r.phrase.length > 88 ? 'long' : r.phrase.length < 42 ? 'short' : 'medium';
  setTimer(r.seconds);
  const note = $('#note');
  const msg = engine.session.lastMessage; engine.session.lastMessage = null;
  const text = msg || r.note || (r.transition ? 'Ahora mismo no hay otra carta que encaje con cómo estáis. Podéis cambiar la ropa en ••• o de nivel.' : null);
  if (text) { note.hidden = false; note.textContent = text; } else note.hidden = true;
  $('#fbLike').classList.remove('on');
  void roundBox.offsetWidth; roundBox.classList.add('show');
  renderFavBtn(); renderTurn(); renderLevel(); updateControls(); renderDebug();
}
function renderDebug() {
  const el = $('#debug'); if (!DEBUG) { el.hidden = true; return; }
  const d = engine.lastDebug; if (!d) return; el.hidden = false;
  const S = engine.session;
  el.textContent = `purpose ${d.purpose} (${d.reason}) · level ${d.level}${d.band ? ' · ' + d.band : ''} · winner ${d.winner}${d.variant ? ' / ' + d.variant : ''}${d.side ? ' / ' + d.side : ''}${d.playConstraint ? ' / ' + d.playConstraint : ''} · ${d.seconds ?? 'sin tiempo'}${d.fallback ? ' · MAZO VACÍO' : ''}\n` +
    `candidates: ${d.candidates.map(c => `${c.id} ${c.weight}`).join(', ')}\nrejected: ${d.rejected.filter(r => !['LEVEL', 'TRANSITION'].includes(r.reason)).map(r => `${r.id}:${r.reason}`).join(', ')}\n` +
    `session: rounds ${S.rounds} · intimacy ${S.intimacyCardCount}/${S.pauseAt ?? '–'} · soften ${S.soften.toFixed(2)} · clothing ${JSON.stringify(engine.clothing)} · familyScore ${JSON.stringify(S.familyScore)}`;
}
/* ---------- temporizador: un toque para empezar, fácil de ignorar ---------- */
const timerEl = $('#timer'); let timer = null;
function setTimer(seconds) {
  stopTimer();
  if (!seconds) { timerEl.hidden = true; return; }
  timerEl.hidden = false; timerEl.dataset.total = seconds; timerEl.classList.remove('running', 'done');
  timerEl.querySelector('.t').textContent = formatDuration(seconds); timerEl.querySelector('.bar').style.transform = 'scaleX(0)';
  timerEl.setAttribute('aria-label', `Temporizador de ${seconds} segundos. Toca para empezar`);
}
function stopTimer() { if (timer) { cancelAnimationFrame(timer.raf); timer = null; } }
function startTimer() {
  const total = Number(timerEl.dataset.total); if (!total) return;
  stopTimer(); timerEl.classList.remove('done'); timerEl.classList.add('running');
  const t0 = performance.now(); timer = { raf: 0 };
  const tick = now => {
    const left = Math.max(0, total - (now - t0) / 1000);
    timerEl.querySelector('.t').textContent = formatDuration(Math.ceil(left));
    timerEl.querySelector('.bar').style.transform = `scaleX(${(1 - left / total).toFixed(4)})`;
    if (left > 0) timer.raf = requestAnimationFrame(tick);
    else { timer = null; timerEl.classList.remove('running'); timerEl.classList.add('done'); buzz([12, 60, 12]); }
  };
  timer.raf = requestAnimationFrame(tick);
}
timerEl.addEventListener('click', () => { if (timerEl.classList.contains('running')) { stopTimer(); setTimer(Number(timerEl.dataset.total)); } else if (!timerEl.classList.contains('done')) startTimer(); });
function renderFavBtn() { $('#btnFav').classList.toggle('on', !!current && engine.state.favorites.some(f => f.id === current.id)); }
function updateControls() {
  const ended = !!engine.ended(), roll = $('#btnRoll');
  roll.hidden = ended; $('#btnNew').hidden = !ended;
  roll.textContent = engine.state.round === 0 ? 'Empezar' : 'Siguiente';
  clearTimeout(ctaTimer);
  if (engine.state.round > 0 && current && !ended) { roll.classList.add('soft'); ctaTimer = setTimeout(() => roll.classList.remove('soft'), 2000); }
  else roll.classList.remove('soft');
}
function setBusy(v) { busy = v; $('#btnRoll').disabled = v; $('#btnMore').disabled = v; $('#levelBtn').disabled = v; }
async function play(fn, emptyMsg) {
  if (busy) return;
  let r;
  try { r = fn(); } catch (e) { console.error(e); toast('No he podido preparar la siguiente carta.'); return; }
  if (!r) { if (emptyMsg) toast(emptyMsg); updateControls(); return; }
  setBusy(true); buzz(14);
  document.body.classList.remove('idle');
  roundBox.classList.remove('show'); welcome.hidden = true; endingBox.hidden = true;
  await wakeDice();
  current = r;
  await rollDice(r);
  showRound(r);
  setBusy(false);
}
/* SIGUIENTE: la primera vez pide la configuración (una sola vez) y un check-in breve; después, directo.
   Antes de la siguiente carta: si la actual era UNDRESS se registra qué pasó; en Intimidad, la pausa de continuidad. */
function next() {
  if (busy) return;
  if (engine.state.round === 0 && !ui.started) { if (!ui.setupDone) { openSetup(); return; } openStart(); return; }
  if (current && current.undress && !current.undress.applied) { resolveUndress(current, () => next()); return; }
  if (engine.pauseDue() && ui.pauseShownAt !== engine.session.pauseAt) { ui.pauseShownAt = engine.session.pauseAt; openPause(); return; }
  play(() => engine.roll());
}
$('#btnRoll').addEventListener('click', next);
$('#btnNew').addEventListener('click', () => newSession());

/* ---------- ♡ y ••• ---------- */
$('#fbLike').addEventListener('click', () => {
  if (!current || busy) return;
  const b = $('#fbLike');
  if (b.classList.contains('on')) return;
  engine.feedback('like'); b.classList.add('on'); buzz(8);
});
function menuItem(label, hint, fn) {
  const b = el('button', 'mi'); b.type = 'button';
  b.appendChild(el('b', null, label)); if (hint) b.appendChild(el('small', null, hint));
  b.addEventListener('click', () => { closeSheets(); fn(); });
  return b;
}
function openMenu() {
  if (!current || busy) return;
  const list = $('#menuList'); list.innerHTML = '';
  list.appendChild(menuItem('Otra', 'Otra carta para la misma persona', () => play(() => engine.reroll())));
  list.appendChild(menuItem('Más suave', 'Algo más tranquilo, en este mismo nivel', () => play(() => engine.softer())));
  list.appendChild(menuItem('Pasar', 'Esta no; seguimos con otra cosa', () => { if (current && current.undress) current.undress.applied = true; play(() => engine.pass()); }));
  if (engine.level() === 3) list.appendChild(menuItem('Estado de ropa', 'Corregir qué lleva puesto cada uno', () => openClothing(false)));
  if (engine.level() > 1) list.appendChild(menuItem('Bajar de nivel', `A ${LEVELS[engine.level() - 1].name}`, () => chooseLevel(engine.level() - 1)));
  list.appendChild(menuItem('Terminar la sesión', 'Hasta aquí estuvo bien', () => endSession()));
  open($('#sheetMenu'));
}
$('#btnMore').addEventListener('click', openMenu);
function endSession() { engine.endSession('parar'); showEnding(); }

/* ---------- check-in: ¿cómo llegáis hoy? ---------- */
function moodCols(container) {
  container.innerHTML = '';
  for (const p of [0, 1]) {
    const col = el('div', 'col'); col.appendChild(el('h3', null, nameOf(p)));
    for (const [k, v] of Object.entries(MOODS)) {
      const b = el('button', 'chip', v.label); b.type = 'button';
      b.classList.toggle('on', ui.moods[p].includes(k));
      b.addEventListener('click', () => { const i = ui.moods[p].indexOf(k); if (i >= 0) ui.moods[p].splice(i, 1); else ui.moods[p].push(k); b.classList.toggle('on'); buzz(5); });
      col.appendChild(b);
    }
    container.appendChild(col);
  }
}
function prefRows(container) {
  container.innerHTML = '';
  const intimateOn = prefs.bodyParts.some(p => p.includes('vulva') || p.includes('pene'));
  for (const [k, v] of Object.entries(AVOIDS)) {
    if (k === 'intimo' && !intimateOn) continue;
    const row = el('div', 'pref'); row.appendChild(el('span', null, v.label));
    const seg = el('div', 'seg'); seg.setAttribute('role', 'radiogroup'); seg.setAttribute('aria-label', v.label);
    const cur = ui.pref[k] || 'si';
    for (const s of PREF_STATES) {
      const b = el('button', s === cur ? 'on' : '', PREF_LABEL[s]); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(s === cur));
      b.addEventListener('click', () => { if (s === 'si') delete ui.pref[k]; else ui.pref[k] = s; seg.querySelectorAll('button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); }); buzz(5); });
      seg.appendChild(b);
    }
    row.appendChild(seg); container.appendChild(row);
  }
}
function openStart() { moodCols($('#intents')); prefRows($('#prefs')); $('#prefsBox').open = Object.keys(ui.pref).length > 0; open($('#sheetStart')); }
$('#btnStart').addEventListener('click', () => {
  for (const p of [0, 1]) engine.setIntents(p, ui.moods[p]);
  engine.setPrefs(0, ui.pref); engine.setPrefs(1, {});
  ui.started = true; closeSheets();
  if (engine.level() === 3 && !ui.clothingAsked) { setTimeout(() => openClothing(true), 300); return; }
  setTimeout(() => play(() => engine.roll()), 250);
});

/* ---------- estado de ropa (Intimidad): real, por jugador, corregible en cualquier momento ---------- */
const CLOTH_STATE = [['ON', 'Puesta'], ['OFF', 'Fuera'], ['NONE', 'No la llevo']];
function renderClothing() {
  const box = $('#clothingGrid'); box.innerHTML = '';
  for (const p of [0, 1]) {
    const col = el('div', 'col'); col.appendChild(el('h3', null, nameOf(p)));
    for (const g of engine.garments(p)) {
      const row = el('div', 'garment'); row.appendChild(el('span', null, GARMENT_LABEL[g]));
      const seg = el('div', 'seg'); seg.setAttribute('role', 'radiogroup');
      for (const [s, label] of CLOTH_STATE) {
        const b = el('button', engine.clothing[p][g] === s ? 'on' : '', label); b.type = 'button'; b.setAttribute('role', 'radio');
        b.addEventListener('click', () => { engine.setClothing(p, { ...engine.clothing[p], [g]: s }); seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); buzz(5); });
        seg.appendChild(b);
      }
      row.appendChild(seg); col.appendChild(row);
    }
    box.appendChild(col);
  }
}
let clothingThenRoll = false;
function openClothing(first) { clothingThenRoll = first; $('#clothingTitle').textContent = first ? '¿Cómo vais vestidos ahora?' : 'Estado de ropa'; renderClothing(); open($('#sheetClothing')); }
$('#btnClothingDone').addEventListener('click', () => { ui.clothingAsked = true; closeSheets(); if (clothingThenRoll) { clothingThenRoll = false; if (ui.started) setTimeout(() => play(() => engine.roll()), 250); } });

/* tras una carta UNDRESS: qué se quitó cada uno. Prenda concreta → se aplica; «la que elijas» → se pregunta. */
function resolveUndress(round, done) {
  const u = round.undress;
  if (u.garment !== 'ANY') { for (const p of u.players) engine.recordUndress(p, u.garment); u.applied = true; done(); return; }
  const box = $('#undressGrid'); box.innerHTML = '';
  const chosen = {};
  for (const p of u.players) {
    const col = el('div', 'col'); col.appendChild(el('h3', null, nameOf(p)));
    const opts = engine.removable(p);
    for (const g of [...opts, null]) {
      const b = el('button', 'chip', g ? GARMENT_LABEL[g] : 'Nada'); b.type = 'button';
      b.addEventListener('click', () => { chosen[p] = g; col.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); buzz(5); });
      col.appendChild(b);
    }
    box.appendChild(col);
  }
  $('#btnUndressDone').onclick = () => { for (const p of u.players) if (chosen[p]) engine.recordUndress(p, chosen[p]); u.applied = true; closeSheets(); setTimeout(done, 250); };
  open($('#sheetUndress'));
}

/* ---------- pausa de continuidad (Intimidad): ni meta ni consentimiento; seguir conserva todo ---------- */
function openPause() { open($('#sheetPause')); }
$('#btnPauseGame').addEventListener('click', () => { engine.continueGuided(); closeSheets(); setTimeout(() => play(() => engine.roll()), 250); });
$('#btnPauseAlone').addEventListener('click', () => { engine.continueAlone(); closeSheets(); showEnding(); });

/* ---------- cierre y sesión nueva ---------- */
function showEnding() {
  stopTimer(); current = null; roundBox.hidden = true; welcome.hidden = true; endingBox.hidden = false;
  $('#endingText').textContent = engine.session.lastMessage || 'Hasta aquí estuvo bien.';
  document.body.classList.add('idle'); wakeDice(); idleDice(); renderTurn(); updateControls();
}
function newSession() {
  engine.newSession(engine.level()); current = null; ui.started = false; ui.moods = [[], []]; ui.pref = {}; ui.clothingAsked = false; ui.pauseShownAt = null;
  roundBox.hidden = true; roundBox.classList.remove('show'); endingBox.hidden = true; welcome.hidden = false;
  document.body.classList.add('idle'); wakeDice(); idleDice(); renderTurn(); renderLevel(); updateControls();
}

/* ---------- Lo nuestro: lo que os funciona, guardado solo en este teléfono ---------- */
const slim = r => ({ id: r.id, cardId: r.cardId, family: r.family, variantId: r.variantId, side: r.side, playConstraint: r.playConstraint, seconds: r.seconds, level: r.level, levelName: r.levelName, phrase: r.phrase, actor: r.actor, actorName: r.actorName, receiverName: r.receiverName });
$('#btnFav').addEventListener('click', () => {
  if (!current || current.transition) return;
  if (engine.state.favorites.some(f => f.id === current.id)) { engine.removeFavorite(current.id); toast('Quitada de Lo nuestro'); }
  else { engine.addFavorite(slim(current)); toast('Guardada en Lo nuestro'); buzz(10); }
  persist(); renderFavBtn(); renderFavCount();
});
function renderFavCount() { const n = engine.state.favorites.length; const c = $('#favCount'); c.hidden = !n; c.textContent = n; }
function renderFavs() {
  const list = $('#favList'); list.innerHTML = '';
  const favs = [...engine.state.favorites].reverse();
  if (!favs.length) { list.appendChild(el('p', 'empty', 'Aún no hay nada. Cuando algo os funcione, guardadlo con el marcador que hay junto a la frase: el juego se inspirará en ello sin repetirlo tal cual.')); return; }
  for (const f of favs) {
    const card = el('article', 'card');
    const meta = el('div', 'meta'); meta.appendChild(el('span', null, `${f.levelName} · ${f.actorName || f.performerName || ''} → ${f.receiverName || f.partnerName || ''}`));
    const rm = el('button', 'ib'); rm.setAttribute('aria-label', 'Quitar'); rm.innerHTML = '<svg><use href="#i-x"/></svg>';
    rm.addEventListener('click', () => { engine.removeFavorite(f.id); persist(); renderFavs(); renderFavCount(); renderFavBtn(); });
    meta.appendChild(rm); card.appendChild(meta);
    const p = el('p', 'phrase'); phraseNode(f.phrase, p); card.appendChild(p);
    const acts = el('div', 'acts');
    if (f.cardId) {
      const rep = el('button', 'btn gold'); rep.innerHTML = '<svg><use href="#i-repeat"/></svg>Repetir';
      rep.addEventListener('click', () => { closeSheets(); if (!ui.started) ui.started = true; play(() => engine.repeatFavorite(f), 'Ahora mismo no encaja: nivel, anatomía o ropa.'); });
      acts.appendChild(rep);
    } else card.appendChild(el('p', 'hint', 'De una versión anterior del juego: se guarda como recuerdo.'));
    const ins = el('button', 'btn'); ins.innerHTML = '<svg><use href="#i-spark"/></svg>Inspirarse';
    ins.addEventListener('click', () => { closeSheets(); if (!ui.started) ui.started = true; play(() => engine.inspireFavorite(f)); });
    acts.appendChild(ins); card.appendChild(acts);
    list.appendChild(card);
  }
}

/* ---------- hojas ---------- */
const backdrop = $('#backdrop');
let openSheet = null;
function open(sheet) { if (openSheet && openSheet !== sheet) { openSheet.classList.remove('open'); openSheet.setAttribute('aria-hidden', 'true'); } openSheet = sheet; backdrop.hidden = false; void backdrop.offsetWidth; backdrop.classList.add('show'); sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); }
function closeSheets() {
  if (!openSheet) return;
  const was = openSheet;
  was.classList.remove('open'); was.setAttribute('aria-hidden', 'true'); openSheet = null;
  backdrop.classList.remove('show'); setTimeout(() => { if (!openSheet) backdrop.hidden = true; }, 300);
  if (was === $('#sheetSettings') && setupMode) finishSetup();
}
backdrop.addEventListener('click', () => { if (openSheet === $('#sheetPause') || openSheet === $('#sheetUndress')) return; closeSheets(); });
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeSheets()));
$('#btnFavs').addEventListener('click', () => { renderFavs(); open($('#sheetFavs')); });
$('#btnSettings').addEventListener('click', () => { renderSettings(); open($('#sheetSettings')); });

/* ---------- ajustes ---------- */
let setupMode = false;
function openSetup() { setupMode = true; renderSettings(); $('#btnSetupDone').hidden = false; open($('#sheetSettings')); }
function finishSetup() { setupMode = false; $('#btnSetupDone').hidden = true; ui.setupDone = true; persist(); setTimeout(openStart, 320); }
$('#btnSetupDone').addEventListener('click', () => closeSheets());
/* partes del cuerpo, no género: cada jugador marca lo que tiene */
function renderAnatomy() {
  document.querySelectorAll('.anat').forEach(box => {
    const i = Number(box.dataset.p), parts = prefs.bodyParts[i] || [];
    box.innerHTML = '';
    for (const [a, v] of Object.entries(ANATOMY)) {
      const b = el('button', parts.includes(a) ? 'on' : '', v.label); b.type = 'button'; b.setAttribute('aria-pressed', String(parts.includes(a)));
      b.addEventListener('click', () => { const bp = prefs.bodyParts.map(p => [...p]); const cur = bp[i] || []; bp[i] = cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]; prefs.bodyParts = bp; persist(); renderAnatomy(); buzz(6); });
      box.appendChild(b);
    }
  });
}
function renderSettings() {
  $('#name0').value = prefs.names[0] || ''; $('#name1').value = prefs.names[1] || '';
  renderAnatomy();
  $('#swVibe').checked = ui.vibrate;
  $('#btnSetupDone').hidden = !setupMode;
  $('#btnClearFavs').classList.remove('arm'); $('#btnClearFavs').textContent = 'Borrar Lo nuestro';
}
for (const [id, i] of [['#name0', 0], ['#name1', 1]]) {
  $(id).addEventListener('input', e => { const n = [...(prefs.names || ['', ''])]; n[i] = e.target.value.trim(); prefs.names = n; persist(); renderTurn(); });
}
$('#swVibe').addEventListener('change', e => { ui.vibrate = e.target.checked; persist(); if (ui.vibrate) buzz(10); });
$('#btnReset').addEventListener('click', () => { newSession(); closeSheets(); toast('Sesión nueva'); });
$('#btnClearFavs').addEventListener('click', e => {
  const b = e.currentTarget;
  if (!b.classList.contains('arm')) { b.classList.add('arm'); b.textContent = '¿Seguro? Toca otra vez para borrar'; setTimeout(() => { b.classList.remove('arm'); b.textContent = 'Borrar Lo nuestro'; }, 3000); return; }
  engine.state.favorites = []; persist(); renderFavCount(); renderFavBtn(); b.classList.remove('arm'); b.textContent = 'Borrar Lo nuestro'; toast('Lo nuestro borrado');
});

/* ---------- arranque ---------- */
renderLevel(); renderTurn(); idleDice(); renderFavCount(); updateControls();
