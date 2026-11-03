/* Interfaz de Pollo a la brasa. El motor (engine/) elige entre cartas curadas; la pareja dirige la sesión.
   QUIÉN · QUÉ · SIGUIENTE: nada técnico llega a la pantalla. Sin dados: al pedir la siguiente carta, la frase se
   «baraja» (una microanimación breve, sin azar visual) y entra la nueva.
   Privacidad: en el teléfono solo se guardan nombres, anatomía, «Lo nuestro», vibración y si la configuración inicial
   está hecha. La sesión (ropa, humor, feedback, nivel, historial) vive en memoria y desaparece al cerrar. Sin telemetría. */
import { GameEngine, migrateFavorite } from '../engine/engine.js';
import { PreferenceManager } from '../engine/prefs.js';
import { LEVELS, LEVEL_IDS, LEVEL_KEYS, LEVEL_BY_KEY, LEVEL_COPY } from '../engine/levels.js';
import { formatDuration } from '../engine/duration.js';
import { unlockAudio, playBeeps, releaseAudio } from './beep.js';
import { AVOIDS, PREF_STATES, PREF_LABEL } from '../engine/session.js';
import { MOODS } from '../engine/mood.js';
import { GARMENT_LABEL, ANATOMY, UNDERWEAR_GARMENTS } from '../content/body.js';

const KEY = 'pab.v2';
const SCHEMA = 5; // 4 = cartas curadas · 5 = prendas interiores por jugador (un guardado antiguo sin `underwear` se deriva de la configuración corporal, nunca se lee como «no la llevo»)
const $ = s => document.querySelector(s);
const DEBUG = new URLSearchParams(location.search).has('debug');
/* prueba del aviso (desarrollo): con ?aviso en la dirección, todo temporizador dura 3 s para oír los pitidos sin esperar */
const TEST_ALERT = new URLSearchParams(location.search).has('aviso');

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
/* vibración: solo donde el navegador la ofrece (Android / Chrome). Safari en iPhone no implementa navigator.vibrate, así que
   allí no se ofrece el ajuste ni se promete; el aviso es sonido + visual. */
const CAN_VIBRATE = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
const buzz = p => { if (ui.vibrate && CAN_VIBRATE) { try { navigator.vibrate(p); } catch { /* nada */ } } };

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
  const pill = $('#levelBtn'); pill.classList.remove('changed'); void pill.offsetWidth; pill.classList.add('changed');
  f.hidden = false; void f.offsetWidth; f.classList.add('show');
  const hold = REDUCED.matches ? 900 : 1300, out = REDUCED.matches ? 20 : 300;
  return wait(hold).then(() => { f.classList.remove('show'); return wait(out); }).then(() => { f.hidden = true; });
}
$('#levelBtn').addEventListener('click', () => { if (busy) return; renderLevelList(); open($('#sheetLevel')); });

/* ---------- QUIÉN ---------- */
function renderTurn() {
  let a, b, mutual = false;
  if (current) { a = current.actorName; b = current.receiverName; mutual = current.mutual; }
  else { const p = engine.state.actor; a = nameOf(p); b = nameOf(1 - p); }
  $('#turnA').textContent = a; $('#turnB').textContent = b; $('#turnArrow').textContent = mutual ? '·' : '→';
}

/* ---------- barajar: tres fases al pedir la siguiente carta (~600 ms): RETIRAR la carta actual (140 ms) → BARAJAR tres capas
   abstractas (260 ms) → REVELAR la nueva (200 ms, en showRound). Sin azar visual, sin dados. La vibración, si está activa, va
   con el reveal. Con «reducir movimiento» no se espera nada: fundido rápido. ---------- */
const stage = $('#stage');
const REDUCED = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const SHUFFLE = { retire: 140, mix: 300, reveal: 200 };
async function shuffle() {
  if (roundBox.hidden || REDUCED.matches) return;
  stage.classList.add('retiring'); await wait(SHUFFLE.retire);
  stage.classList.remove('retiring'); stage.classList.add('shuffling'); await wait(SHUFFLE.mix);
  stage.classList.remove('shuffling');
}

/* ---------- QUÉ ---------- */
const roundBox = $('#roundBox'), welcome = $('#welcome'), endingBox = $('#ending');
function showRound(r) {
  current = r;
  welcome.hidden = true; endingBox.hidden = true; roundBox.hidden = false; roundBox.classList.remove('show'); stage.classList.add('live');
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
  if (TEST_ALERT) seconds = 3;
  timerEl.hidden = false; timerEl.dataset.total = seconds; timerEl.classList.remove('running', 'done');
  timerEl.querySelector('.t').textContent = formatDuration(seconds); timerEl.querySelector('.hint').textContent = 'toca para empezar'; timerEl.querySelector('.bar').style.transform = 'scaleX(0)';
  timerEl.setAttribute('aria-label', `Temporizador de ${seconds} segundos. Toca para empezar`);
}
function stopTimer() { if (timer) { cancelAnimationFrame(timer.raf); timer.cancelled = true; timer = null; releaseAudio(); } }
/* Cada arranque es una ejecución propia: solo la ejecución vigente puede terminar, y termina una sola vez. Parar, cambiar
   de carta, «Otra», «Más suave», «Pasar» o SIGUIENTE la cancelan antes de 00:00, y entonces no suena nada. */
function startTimer() {
  const total = Number(timerEl.dataset.total); if (!total) return;
  stopTimer(); timerEl.classList.remove('done'); timerEl.classList.add('running');
  const t0 = performance.now(); const run = { raf: 0, cancelled: false, finished: false }; timer = run;
  const tick = now => {
    if (run.cancelled || run.finished || timer !== run) return;
    const left = Math.max(0, total - (now - t0) / 1000);
    timerEl.querySelector('.t').textContent = formatDuration(Math.ceil(left));
    timerEl.querySelector('.bar').style.transform = `scaleX(${(1 - left / total).toFixed(4)})`;
    if (left > 0) { run.raf = requestAnimationFrame(tick); return; }
    run.finished = true; timer = null; timerEl.classList.remove('running'); timerEl.classList.add('done');
    timerEl.querySelector('.hint').textContent = 'tiempo'; timerEl.setAttribute('aria-label', 'Tiempo terminado');
    playBeeps(); buzz([12, 60, 12]);
  };
  run.raf = requestAnimationFrame(tick);
}
timerEl.addEventListener('click', () => { if (timerEl.classList.contains('running')) { stopTimer(); setTimer(Number(timerEl.dataset.total)); } else if (!timerEl.classList.contains('done')) { unlockAudio(); startTimer(); } });
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
  stopTimer(); // la carta cambia: un temporizador en marcha se cancela ya, no al terminar el barajado
  setBusy(true);
  document.body.classList.remove('idle', 'home');
  welcome.hidden = true; endingBox.hidden = true;
  await shuffle();
  roundBox.classList.remove('show');
  current = r;
  showRound(r); buzz(12); // háptico corto, sincronizado con el reveal
  if (!REDUCED.matches) await wait(SHUFFLE.reveal); // SIGUIENTE vuelve cuando la carta ya está entera
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
    const block = el('div', 'who'); block.appendChild(el('h3', null, nameOf(p)));
    const grid = el('div', 'mood-grid'); grid.setAttribute('role', 'radiogroup'); grid.setAttribute('aria-label', `Cómo llega ${nameOf(p)}`);
    for (const [k, v] of Object.entries(MOODS)) {
      const b = el('button', 'mood'); b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.mood = k;
      b.append(el('b', null, v.label), el('small', null, v.descriptor));
      const on = ui.moods[p][0] === k; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on));
      b.addEventListener('click', () => { ui.moods[p] = ui.moods[p][0] === k ? [] : [k]; grid.querySelectorAll('.mood').forEach(x => { const sel = x === b && ui.moods[p][0] === k; x.classList.toggle('on', sel); x.setAttribute('aria-checked', String(sel)); }); buzz(5); });
      grid.appendChild(b);
    }
    block.appendChild(grid); container.appendChild(block);
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
const CLOTH_STATE = [['ON', 'Puesta'], ['OFF', 'Fuera'], ['NOT_WORN', 'No la llevo']]; // NOT_WORN ≠ OFF: entró sin ella / se la quitó
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
  document.body.classList.add('idle'); stage.classList.remove('live'); renderTurn(); updateControls();
}
function newSession() {
  engine.newSession(engine.level()); current = null; ui.started = false; ui.moods = [[], []]; ui.pref = {}; ui.clothingAsked = false; ui.pauseShownAt = null;
  roundBox.hidden = true; roundBox.classList.remove('show'); endingBox.hidden = true; welcome.hidden = false;
  document.body.classList.add('idle', 'home'); stage.classList.remove('live'); renderTurn(); renderLevel(); updateControls();
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
  /* prendas interiores: misma fuente de verdad que Estado de ropa, UNDRESS y el selector (engine.garments) */
  document.querySelectorAll('.uw').forEach(box => {
    const i = Number(box.dataset.p), chosen = prefs.underwearFor(i);
    box.innerHTML = '';
    for (const g of UNDERWEAR_GARMENTS) {
      const b = el('button', chosen.includes(g) ? 'on' : '', GARMENT_LABEL[g]); b.type = 'button'; b.setAttribute('aria-pressed', String(chosen.includes(g)));
      b.addEventListener('click', () => { const uw = prefs.underwear.map(u => (u ? [...u] : null)); const cur = prefs.underwearFor(i); uw[i] = cur.includes(g) ? cur.filter(x => x !== g) : [...cur, g]; prefs.underwear = uw; persist(); engine.syncClothing(); renderAnatomy(); buzz(6); });
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
if (!CAN_VIBRATE) $('#swVibe').closest('.list').hidden = true; // iPhone: sin vibración web, no se ofrece el ajuste
if (TEST_ALERT) toast('Prueba del aviso: temporizadores de 3 s');
renderLevel(); renderTurn(); renderFavCount(); updateControls();
