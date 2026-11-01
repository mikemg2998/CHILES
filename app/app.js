/* Interfaz de Pollo a la brasa. El motor (engine/) dirige la sesión; aquí solo se muestra, se pregunta y se anima.
   Privacidad: en el teléfono solo se guardan nombres, anatomía, zonas activas, favoritas y vibración. La sesión
   (intención, "hoy no", feedback, puertas) vive en memoria y desaparece al cerrar. No hay telemetría. */
import { GameEngine } from '../engine/engine.js';
import { PreferenceManager } from '../engine/prefs.js';
import { GROUPS, LEVELS, LEVEL_KEYS, LEVEL_BY_KEY, CATEGORIES, ZONE } from '../engine/catalog.js';
import { INTENTS, AVOIDS, GATE_LABEL, PURPOSE_LABEL } from '../engine/session.js';

const KEY = 'pab.v2';
const $ = s => document.querySelector(s);
const DICE = ['action', 'zone', 'method', 'cond'];
const IDLE_FACE = { action: 'Acción', zone: 'Zona', method: 'Forma', cond: 'Condición' };
const DEBUG = new URLSearchParams(location.search).has('debug');

/* ---------- estado persistente (solo preferencias) ---------- */
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saved = load();
const prefs = new PreferenceManager(saved.prefs || {});
if (!LEVEL_BY_KEY[prefs.mode]) prefs.mode = 'conexion';
prefs.mode = LEVELS[LEVEL_BY_KEY[prefs.mode]].key; // claves antiguas → nuevas
const engine = new GameEngine({ prefs, debug: DEBUG });
engine.state.favorites = Array.isArray(saved.favorites) ? saved.favorites : [];
const ui = { vibrate: saved.vibrate !== false, started: false, intents: [[], []], avoid: [[], []] };
let current = null, busy = false;
if (DEBUG) window.pab = engine;

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify({ prefs: prefs.toJSON(), favorites: engine.state.favorites, vibrate: ui.vibrate })); } catch { /* sin almacenamiento: la partida sigue */ }
}
const buzz = p => { if (ui.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch { /* nada */ } } };

/* ---------- utilidades de texto ---------- */
const realNames = () => (prefs.names || []).filter(n => n && n.trim());
const nameOf = i => (prefs.names || [])[i] || `Jugador ${i + 1}`;
/* frase con los nombres destacados, construida con nodos (sin HTML) */
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
  const cur = engine.level();
  for (const key of LEVEL_KEYS) {
    const L = LEVELS[LEVEL_BY_KEY[key]];
    const b = document.createElement('button'); b.type = 'button'; b.role = 'tab'; b.textContent = L.name;
    if (cur === L.id) { b.classList.add('on'); b.setAttribute('aria-selected', 'true'); }
    b.addEventListener('click', () => chooseLevel(L.id));
    levelsEl.appendChild(b);
  }
  $('#tagline').textContent = LEVELS[cur].tagline;
}
/* antes de empezar se elige libremente; en mitad de la sesión bajar es inmediato y subir pasa por la puerta */
function chooseLevel(id) {
  if (busy || id === engine.level()) return;
  if (engine.state.round === 0) { engine.setLevel(id); prefs.mode = LEVELS[id].key; persist(); renderLevels(); buzz(6); return; }
  if (id < engine.level()) { const msg = engine.lowerLevel(); while (engine.level() > id) engine.lowerLevel(); renderLevels(); toast(msg || `Bajamos a ${LEVELS[id].name}.`); updateControls(); return; }
  if (engine.canOpenGate()) openGate('Subir es cosa de los dos.'); else toast('Para subir, antes una ronda.');
}

/* ---------- turno ---------- */
function renderTurn() {
  let a, b;
  if (current) { a = current.performerName; b = current.partnerName; }
  else { const p = engine.state.performer; a = nameOf(p); b = nameOf(1 - p); }
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
const roundBox = $('#roundBox'), welcome = $('#welcome'), endingBox = $('#ending');
function showRound(r) {
  current = r;
  welcome.hidden = true; endingBox.hidden = true; roundBox.hidden = false; roundBox.classList.remove('show');
  const extra = r.variant === 'softer' ? ' · más suave' : '';
  $('#metaText').textContent = `${LEVELS[r.level].name} · ${CATEGORIES[r.category] || PURPOSE_LABEL[r.purpose] || ''}${extra}`;
  phraseNode(r.phrase, $('#phrase'));
  const note = $('#note');
  const msg = engine.session.lastMessage; engine.session.lastMessage = null;
  if (msg) { note.hidden = false; note.textContent = msg; } else if (r.gateDue) { note.hidden = false; note.textContent = 'Cuando terminéis, una pregunta rápida para los dos.'; } else note.hidden = true;
  renderFeedback(r);
  void roundBox.offsetWidth; roundBox.classList.add('show');
  renderFavBtn(); renderTurn(); renderLevels(); updateControls(); renderDebug();
}
function renderFeedback(r) {
  $('#fbLike').classList.remove('on'); $('#fbLike').disabled = false;
  $('#fbMore').hidden = true; $('#fbLess').hidden = true; $('#fbMore').classList.remove('on'); $('#fbLess').classList.remove('on');
  $('#feedback').hidden = !r;
}
function renderDebug() {
  const el = $('#debug'); if (!DEBUG) { el.hidden = true; return; }
  const d = engine.lastDebug; if (!d) return; el.hidden = false;
  const topW = Object.entries(d.weights).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} ${v}`).join(', ');
  el.textContent = `purpose ${d.selectedPurpose} (${d.purposeReason}) · target ${d.target} · family ${d.selectedFamily} · quality ${d.finalQualityScore}${d.fallback ? ' · FALLBACK' : ''}\n` +
    `weights: ${topW}\nrejected: ${JSON.stringify(d.rejectionReasons)}\ncandidates: ${d.candidates.map(c => `${c.quality} ${c.phrase}`).join(' | ')}\n` +
    `session: level ${engine.session.level} · rounds ${engine.session.rounds} · pressure ${engine.session.pressure.toFixed(2)} · pace ${engine.session.pace.toFixed(2)} · readiness ${engine.session.readiness().toFixed(2)} · familyScore ${JSON.stringify(engine.session.familyScore)}`;
}
function renderFavBtn() { $('#btnFav').classList.toggle('on', !!current && engine.state.favorites.some(f => f.id === current.id)); }
/* SUAVE solo cuando el motor tiene una variante con la misma idea; SUBIR solo abre la puerta */
function updateControls() {
  const ended = !!engine.ended();
  $('#btnRoll').hidden = ended; $('#btnNew').hidden = !ended;
  $('#btnRoll').textContent = engine.state.round === 0 ? 'Lanzar los dados' : current && current.gateDue ? 'Decidir juntos' : 'Seguir';
  const can = () => { if (!current) return false; try { return !!engine.getVariant(current); } catch { return false; } };
  $('#btnSofter').disabled = ended || !can();
  $('#btnHarder').disabled = ended || !engine.canOpenGate() || engine.level() === 4;
  $('#btnPass').disabled = ended; $('#btnReroll').disabled = ended;
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
  if (!r) { if (emptyMsg) toast(emptyMsg); updateControls(); return; }
  setBusy(true); buzz(14);
  document.body.classList.remove('idle');
  roundBox.classList.remove('show'); welcome.hidden = true; endingBox.hidden = true;
  await rollDice(r);
  showRound(r);
  setBusy(false);
}
/* LANZAR / SEGUIR: la primera vez pregunta la intención; cuando toca puerta, la abre */
function next() {
  if (busy) return;
  if (engine.state.round === 0 && !ui.started) { openStart(); return; }
  if (current && current.gateDue) { openGate(); return; }
  play(() => engine.roll());
}
$('#btnRoll').addEventListener('click', next);
$('#btnPass').addEventListener('click', () => play(() => engine.pass()));
$('#btnReroll').addEventListener('click', () => play(() => engine.reroll()));
$('#btnSofter').addEventListener('click', () => play(() => engine.softer(), 'No hay una versión más suave de esta misma idea.'));
$('#btnHarder').addEventListener('click', () => { if (engine.canOpenGate()) openGate('Subir es cosa de los dos.'); });
$('#btnNew').addEventListener('click', () => newSession());

/* ---------- feedback ---------- */
$('#fbLike').addEventListener('click', () => {
  if (!current || $('#fbLike').classList.contains('on')) return;
  engine.feedback('like'); $('#fbLike').classList.add('on'); buzz(8);
  if (current.canMore) { $('#fbMore').hidden = false; $('#fbLess').hidden = false; }
});
for (const [id, more] of [['#fbMore', true], ['#fbLess', false]]) {
  $(id).addEventListener('click', () => {
    if (!current || $(id).classList.contains('on')) return;
    engine.feedback('like', { more }); $('#fbMore').classList.toggle('on', more); $('#fbLess').classList.toggle('on', !more); buzz(6);
  });
}

/* ---------- inicio de sesión: intención y "hoy no" ---------- */
function chipCols(container, catalog, store) {
  container.innerHTML = '';
  for (const p of [0, 1]) {
    const col = document.createElement('div'); col.className = 'col';
    const h = document.createElement('h3'); h.textContent = nameOf(p); col.appendChild(h);
    for (const [k, v] of Object.entries(catalog)) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = v.label;
      b.classList.toggle('on', store[p].includes(k));
      b.addEventListener('click', () => { const i = store[p].indexOf(k); if (i >= 0) store[p].splice(i, 1); else store[p].push(k); b.classList.toggle('on'); buzz(5); });
      col.appendChild(b);
    }
    container.appendChild(col);
  }
}
function openStart() { chipCols($('#intents'), INTENTS, ui.intents); chipCols($('#avoids'), AVOIDS, ui.avoid); open($('#sheetStart')); }
$('#btnStart').addEventListener('click', () => {
  for (const p of [0, 1]) { engine.setIntents(p, ui.intents[p]); engine.setAvoid(p, ui.avoid[p]); }
  ui.started = true; closeSheets(); setTimeout(() => play(() => engine.roll()), 250);
});

/* ---------- puerta: decisión privada de los dos ---------- */
const gate = { step: 0, title: null };
function openGate(title) {
  if (!engine.canOpenGate()) return;
  engine.openGate(); gate.step = 0;
  $('#gateTitle').textContent = title || 'Un momento para los dos';
  $('#gateStep').hidden = false; $('#gateResult').hidden = true;
  renderGateStep(); open($('#sheetGate'), true);
}
const GATE_HINT = { PARAR: 'cerramos la sesión', QUEDARNOS: 'seguimos en este nivel, sin subir', SEGUIR: 'seguimos como hasta ahora', SUBIR: 'pasamos al siguiente nivel', SOLOS: 'el juego deja de dirigir' };
function renderGateStep() {
  const who = $('#gateWho'); who.textContent = ''; who.appendChild(document.createTextNode('Pásale el móvil a ')); const b = document.createElement('b'); b.textContent = nameOf(gate.step); who.appendChild(b); who.appendChild(document.createTextNode('.'));
  const opts = $('#gateOpts'); opts.innerHTML = '';
  for (const o of engine.session.gate.options) {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn';
    btn.appendChild(document.createTextNode(GATE_LABEL[o])); const sm = document.createElement('small'); sm.textContent = GATE_HINT[o]; btn.appendChild(sm);
    btn.addEventListener('click', () => vote(o));
    opts.appendChild(btn);
  }
}
function vote(o) {
  const res = engine.vote(gate.step, o); buzz(6);
  if (!res) { gate.step = 1; renderGateStep(); return; }
  $('#gateStep').hidden = true; $('#gateResult').hidden = false;
  $('#gateMsg').textContent = res.message;
  $('#btnGateGo').textContent = res.ended ? 'Cerrar' : 'Seguir';
  renderLevels();
}
$('#btnGateGo').addEventListener('click', () => {
  closeSheets(true);
  if (engine.ended()) { showEnding(); return; }
  if (current) current.gateDue = false;
  const msg = engine.session.lastMessage;
  setTimeout(() => play(() => engine.roll()), 250);
  if (msg) toast(msg);
});
function showEnding() {
  current = null; roundBox.hidden = true; welcome.hidden = true; endingBox.hidden = false;
  $('#endingText').textContent = engine.session.lastMessage || 'Hasta aquí estuvo bien.';
  document.body.classList.add('idle'); idleDice(); renderTurn(); updateControls();
}
function newSession() {
  engine.newSession(engine.level()); current = null; ui.started = false; ui.intents = [[], []]; ui.avoid = [[], []];
  roundBox.hidden = true; roundBox.classList.remove('show'); endingBox.hidden = true; welcome.hidden = false;
  document.body.classList.add('idle'); idleDice(); renderTurn(); renderLevels(); updateControls();
}

/* ---------- favoritas ---------- */
const slim = r => ({ id: r.id, performer: r.performer, action: r.action, zone: r.zone, method: r.method, cond: r.cond, alt: r.alt, intensity: r.intensity, level: r.level, levelName: r.levelName, phrase: r.phrase, performerName: r.performerName, partnerName: r.partnerName, category: r.category });
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
      closeSheets(); play(() => engine.repeatFavorite(f), 'Esa zona no cuadra con la anatomía o está desactivada en ajustes.');
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
let sheetLocked = false; // la puerta no se cierra tocando fuera: hay que responder
function open(sheet, locked = false) { sheetLocked = locked; openSheet = sheet; backdrop.hidden = false; void backdrop.offsetWidth; backdrop.classList.add('show'); sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); }
function closeSheets(force = false) {
  if (!openSheet || (sheetLocked && !force)) return;
  sheetLocked = false;
  openSheet.classList.remove('open'); openSheet.setAttribute('aria-hidden', 'true'); openSheet = null;
  backdrop.classList.remove('show'); setTimeout(() => { if (!openSheet) backdrop.hidden = true; }, 300);
}
backdrop.addEventListener('click', closeSheets);
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeSheets()));
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
    prefs.enabledGroups = [...set]; persist(); updateControls();
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
  prefs.anatomy = an; persist(); renderAnatomy(); updateControls(); buzz(6);
}));
function renderSettings() {
  $('#name0').value = prefs.names[0] || ''; $('#name1').value = prefs.names[1] || '';
  renderAnatomy();
  const g1 = $('#groups'), g2 = $('#groupsIntimate'); g1.innerHTML = ''; g2.innerHTML = '';
  for (const g of Object.keys(GROUPS)) if (!GROUPS[g].intimate) g1.appendChild(groupSwitch(g));
  // un solo interruptor: la anatomía de cada jugador decide qué entra
  const l = document.createElement('label'); l.className = 'sw';
  const sp = document.createElement('span'); sp.textContent = 'Anatomía íntima en Intimidad';
  const inp = document.createElement('input'); inp.type = 'checkbox'; inp.checked = prefs.enabledGroups.some(g => GROUPS[g].intimate);
  inp.addEventListener('change', () => { const base = prefs.enabledGroups.filter(g => !GROUPS[g].intimate); prefs.enabledGroups = inp.checked ? [...base, 'intimaF', 'intimaM'] : base; persist(); updateControls(); });
  l.append(sp, inp, document.createElement('i')); g2.appendChild(l);
  $('#swVibe').checked = ui.vibrate;
  $('#btnClearFavs').classList.remove('arm'); $('#btnClearFavs').textContent = 'Borrar favoritas';
}
for (const [id, i] of [['#name0', 0], ['#name1', 1]]) {
  $(id).addEventListener('input', e => { const n = [...(prefs.names || ['', ''])]; n[i] = e.target.value.trim(); prefs.names = n; persist(); renderTurn(); });
}
$('#swVibe').addEventListener('change', e => { ui.vibrate = e.target.checked; persist(); if (ui.vibrate) buzz(10); });
$('#btnReset').addEventListener('click', () => { newSession(); closeSheets(); toast('Sesión nueva'); });
$('#btnClearFavs').addEventListener('click', e => {
  const b = e.currentTarget;
  if (!b.classList.contains('arm')) { b.classList.add('arm'); b.textContent = '¿Seguro? Toca otra vez para borrar'; setTimeout(() => { b.classList.remove('arm'); b.textContent = 'Borrar favoritas'; }, 3000); return; }
  engine.state.favorites = []; persist(); renderFavCount(); renderFavBtn(); b.classList.remove('arm'); b.textContent = 'Borrar favoritas'; toast('Favoritas borradas');
});

/* ---------- arranque ---------- */
renderLevels(); renderTurn(); idleDice(); renderFavCount(); updateControls(); $('#feedback').hidden = true;
