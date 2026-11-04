/* RELOJ INTERNO DE INTIMIDAD + SIN PAUSA DE CONTINUIDAD (2026-11-04).
   Tiempo simulado: el reloj recibe un now() falso, así que 50 minutos se prueban en milisegundos.
   El «arnés» reproduce lo que hace la interfaz: activo = nivel 3 · sesión empezada · no terminada.
   La parte de pantalla (sin tiempo visible, sin modal, temporizadores de carta, capturas) está en tests/ui.browser.js. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { IntimacyClock, heatAt, GAP_CAP_MS, HEAT_START_MIN, HEAT_FULL_MIN } from '../app/intimacy-clock.js';
import { CARDS, APPROVED } from '../content/index.js';
import { mk, play, NAKED, DRESSED } from './helpers.js';

const MIN = 60 * 1000;
/* la interfaz llama a sync() en cada cambio de nivel, inicio, carta, fin, nueva sesión, visibilidad y cada 10 s */
function harness(level = 1, seed = 7) {
  let t = 1_700_000_000_000; const now = () => t;
  const e = mk({ level, seed }); const clock = new IntimacyClock(now); const ui = { started: false };
  const sync = () => clock.setActive(e.level() === 3 && ui.started && !e.session.ended);
  /* avanza el tiempo como lo vería la app: un tick cada 10 s */
  const advance = ms => { const end = t + ms; while (t < end) { t = Math.min(end, t + 10_000); sync(); } };
  const start = () => { ui.started = true; sync(); };
  const newSession = () => { e.newSession(e.level()); clock.reset(); ui.started = false; sync(); };
  return { e, clock, ui, sync, advance, start, newSession, jump: ms => { t += ms; } };
}
const mins = c => c.elapsedMs() / MIN;

/* ---------------- reloj ---------------- */
test('1 · Conexión no inicia ni acumula el reloj', () => {
  const h = harness(1); h.start(); h.advance(30 * MIN); play(h.e, 20);
  assert.equal(h.clock.elapsedMs(), 0); assert.equal(h.clock.startedAt, null); assert.equal(h.clock.running, false);
});
test('2 · Deseo no inicia ni acumula el reloj', () => {
  const h = harness(2); h.start(); h.advance(30 * MIN); play(h.e, 20);
  assert.equal(h.clock.elapsedMs(), 0); assert.equal(h.clock.startedAt, null);
});
test('3 · entrar en Intimidad inicia el reloj; salir lo congela y volver lo reanuda con lo acumulado (el tiempo en otros niveles no cuenta)', () => {
  const h = harness(1); h.start(); h.advance(10 * MIN);
  h.e.setLevel(3); h.sync(); assert.ok(h.clock.running); assert.equal(h.clock.elapsedMs(), 0);
  h.advance(12 * MIN); assert.equal(mins(h.clock), 12);
  h.e.setLevel(2); h.sync(); h.advance(20 * MIN); assert.equal(mins(h.clock), 12, 'Deseo no suma');
  h.e.setLevel(3); h.sync(); h.advance(3 * MIN); assert.equal(mins(h.clock), 15, 'reanuda desde 12');
});
test('4 · cambiar de carta no reinicia el reloj', () => {
  const h = harness(3); h.e.clothing = [NAKED(), NAKED()]; h.start();
  for (let i = 0; i < 30; i++) { h.advance(MIN); assert.ok(h.e.roll()); h.sync(); }
  assert.equal(mins(h.clock), 30);
});
test('5 · cambiar la ropa (UNDRESS o corrección manual), «más suave» y feedback no reinician el reloj', () => {
  const h = harness(3, 11); h.e.clothing = [DRESSED(), DRESSED()]; h.start();
  h.advance(5 * MIN); h.e.recordUndress(0, 'top'); h.sync();
  h.advance(5 * MIN); h.e.clothing[1] = { ...h.e.clothing[1], bottoms: 'OFF' }; h.sync();
  h.advance(5 * MIN); h.e.roll(); h.e.feedback('like'); h.e.softer(); h.sync();
  h.advance(5 * MIN); assert.equal(mins(h.clock), 20);
});
test('6 · cambios de pantalla y renders repetidos no duplican tiempo: sincronizar mil veces en el mismo instante suma 0', () => {
  const h = harness(3); h.start(); h.advance(7 * MIN);
  const before = h.clock.elapsedMs(); for (let i = 0; i < 1000; i++) { h.sync(); h.clock.setActive(true); h.clock.heat(); }
  assert.equal(h.clock.elapsedMs(), before);
  // abrir la ropa / el menú / un sheet y volver: misma regla, ningún contador paralelo
  h.advance(MIN); assert.equal(mins(h.clock), 8);
});
test('7 · una sesión nueva reinicia el reloj a cero', () => {
  const h = harness(3); h.start(); h.advance(45 * MIN); assert.equal(heatAt(h.clock.elapsedMs()), 1);
  h.newSession(); assert.equal(h.clock.elapsedMs(), 0); assert.equal(h.clock.running, false, 'no corre hasta empezar');
  h.start(); h.advance(MIN); assert.equal(mins(h.clock), 1);
});
test('8–12 · atmósfera: 34 min normal · 35 empieza · 37 intermedio · 40 final · 50 no sube más', () => {
  assert.equal(HEAT_START_MIN, 35); assert.equal(HEAT_FULL_MIN, 40);
  const h = harness(3); h.start();
  h.advance(34 * MIN); assert.equal(h.clock.heat(), 0, '34 min: sin cambio');
  h.advance(1 * MIN); assert.equal(h.clock.heat(), 0, '35 min: punto de partida, todavía 0');
  h.advance(10_000); assert.ok(h.clock.heat() > 0 && h.clock.heat() < 0.05, '35 min 10 s: empieza muy poco a poco');
  h.advance(2 * MIN - 10_000); assert.ok(Math.abs(h.clock.heat() - 0.4) < 1e-9, `37 min: ${h.clock.heat()}`);
  h.advance(3 * MIN); assert.equal(h.clock.heat(), 1, '40 min: estado final');
  h.advance(10 * MIN); assert.equal(h.clock.heat(), 1, '50 min: igual');
  h.advance(120 * MIN); assert.equal(h.clock.heat(), 1, '170 min: igual');
  // la curva es continua y monótona, sin saltos
  let prev = 0; for (let s = 34 * 60; s <= 41 * 60; s++) { const v = heatAt(s * 1000); assert.ok(v >= prev && v - prev <= 1 / 300 + 1e-12); prev = v; }
});
test('un fin real congela el reloj: después de «Terminar la sesión» no suma nada', () => {
  const h = harness(3); h.start(); h.advance(20 * MIN);
  h.e.endSession('parar'); h.sync(); h.advance(60 * MIN); assert.equal(mins(h.clock), 20);
});
test('ausencias: pantalla bloqueada unos minutos cuenta; una ausencia larga suma como máximo 5 min y no provoca una transición engañosa', () => {
  assert.equal(GAP_CAP_MS, 5 * MIN);
  const h = harness(3); h.start(); h.advance(30 * MIN);
  h.jump(3 * MIN); h.sync(); assert.equal(mins(h.clock), 33, 'teléfono bloqueado 3 min durante una carta');
  h.jump(2 * 60 * MIN); h.sync(); assert.equal(mins(h.clock), 38, '2 h fuera: solo 5 min');
  assert.ok(h.clock.heat() < 1, 'no salta al estado final por la ausencia');
  // reloj del sistema hacia atrás: no resta
  h.jump(-10 * MIN); h.sync(); assert.equal(mins(h.clock), 38);
});
test('15 · el reloj no modifica elegibilidad ni pesos: misma semilla → mismas cartas, mismos candidatos y mismos pesos con o sin 50 min', () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const a = mk({ level: 3, seed }), h = harness(3, seed); h.start();
    for (let i = 0; i < 40; i++) {
      h.advance(75_000); // 40 cartas × 75 s = 50 min
      const ra = a.roll(), rb = h.e.roll(); h.sync();
      assert.equal(rb.cardId, ra.cardId); assert.equal(rb.variantId, ra.variantId);
      assert.deepEqual(h.e.lastDebug?.candidates?.map(c => [c.id ?? c.cardId, c.weight]), a.lastDebug?.candidates?.map(c => [c.id ?? c.cardId, c.weight]));
      for (const e of [a, h.e]) if (e === a ? ra.undress : rb.undress) { const r = e === a ? ra : rb; for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); } }
    }
    assert.equal(h.clock.heat(), 1);
  }
  // ningún archivo del motor ni del contenido conoce el reloj
  for (const dir of ['engine', 'content']) for (const f of readdirSync(new URL(`../${dir}/`, import.meta.url))) {
    const src = readFileSync(new URL(`../${dir}/${f}`, import.meta.url), 'utf8');
    assert.ok(!/intimacy-clock|IntimacyClock|heatAt|--heat/.test(src), `${dir}/${f}`);
  }
});

/* ---------------- sin pausa de continuidad ---------------- */
test('sin pausa A · el motor ya no tiene pausa: ni pauseDue, ni continueGuided, ni continueAlone, ni PAUSE_WINDOW', async () => {
  const e = mk({ level: 3 }); for (const k of ['pauseDue', 'continueGuided', 'continueAlone']) assert.equal(typeof e[k], 'undefined', k);
  for (const k of ['pauseDue', 'continueGuided']) assert.equal(typeof e.director[k], 'undefined', k);
  const S = await import('../engine/session.js'); assert.equal(S.PAUSE_WINDOW, undefined);
  assert.ok(!('pauseAt' in e.session) && !('pausesShown' in e.session));
});
test('sin pausa B · 13–17, 30, 40 y 60 cartas seguidas en Intimidad: nunca se interrumpe ni termina sola', () => {
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const e = mk({ level: 3, seed });
    for (const n of [13, 14, 15, 16, 17, 30, 40, 60]) { while (e.session.intimacyCardCount < n) { const r = play(e, 1); assert.equal(r.length, 1, `carta ${e.session.intimacyCardCount + 1}`); } assert.equal(e.ended(), null); }
  }
});
test('sin pausa C · ninguna ruta reactiva la pausa: ni la interfaz, ni los estilos, ni el HTML la contienen', () => {
  const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
  const all = ['index.html', 'app/app.js', 'app/styles.css', 'engine/engine.js', 'engine/session.js'].map(read).join('\n');
  for (const re of [/sheetPause/, /btnPause/, /pauseDue/, /continueGuided/, /continueAlone/, /Seguir por nuestra cuenta/i, /Seguir con el juego/i, /Queréis seguir por vuestra cuenta/i, /'solos'/])
    assert.ok(!re.test(all), String(re));
});
test('sin pausa D · terminar es voluntario y sin victoria; pasadas 50 cartas el juego sigue igual (historial y ropa intactos)', () => {
  const e = mk({ level: 3, seed: 21 }); play(e, 50);
  const ids = e.history.rounds.map(r => r.cardId), cloth = JSON.stringify(e.clothing);
  const r = e.roll(); assert.ok(r); assert.equal(e.ended(), null);
  assert.deepEqual(e.history.rounds.slice(1).map(x => x.cardId), ids, 'la carta nueva se suma sin borrar el historial');
  if (!r.undress) assert.equal(JSON.stringify(e.clothing), cloth, 'la ropa no cambia sola');
  const msg = e.endSession('parar'); assert.equal(msg, 'Hasta aquí estuvo bien.'); assert.ok(!/ganaste|victoria|completado|objetivo/i.test(msg)); assert.equal(e.roll(), null);
});

/* ---------------- catálogo intacto ---------------- */
test('catálogo: las 145 cartas (138 APPROVED) son idénticas campo a campo a las de antes del reloj', () => {
  const before = JSON.parse(readFileSync(new URL('./cards-before-clock.json', import.meta.url), 'utf8'));
  const now = JSON.parse(JSON.stringify(CARDS));
  assert.equal(now.length, before.length);
  const byId = Object.fromEntries(now.map(c => [c.id, c]));
  for (const c of before) assert.deepEqual(byId[c.id], c, c.id);
  const ap = l => l.filter(c => c.status === 'APPROVED').map(c => c.id).sort();
  assert.deepEqual(ap(now), ap(before)); assert.equal(ap(before).length, 138);
  for (const c of APPROVED) assert.deepEqual(JSON.parse(JSON.stringify(c)), before.find(b => b.id === c.id), c.id);
});
