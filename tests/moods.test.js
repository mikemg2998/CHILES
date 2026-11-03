/* Moods de llegada: cuatro por persona, dimensiones, intersección cautelosa, solo ponderación (nunca elegibilidad),
   el feedback posterior manda, la sesión nueva vuelve a preguntar. Y una comprobación A/B corta por nivel. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED } from '../content/index.js';
import { GameEngine } from '../engine/engine.js';
import { buildDeck, weighDeck } from '../engine/deck.js';
import { fullAccess } from '../engine/clothing.js';
import { MOODS, MOOD_IDS, moodProfile, moodWeight, cardTraits } from '../engine/mood.js';
import { runCombo } from './moods.js';

const mk = (level = 1, seed = 1) => { const e = new GameEngine({ prefs: { names: ['Mike', 'Val'], bodyParts: [['pene'], ['vulva', 'senos']] }, seed, level }); if (level === 3) e.clothing = [fullAccess(['pene']), fullAccess(['vulva', 'senos'])]; return e; };
const byInt = (level, inten) => APPROVED.find(c => c.level === level && c.intraLevelIntensity === inten && c.interactionType === 'STANDARD');
const prox = () => APPROVED.find(c => c.level === 1 && c.interactionType === 'BODY_TO_BODY');
const choose = () => APPROVED.find(c => c.level === 1 && c.interactionType === 'CHOOSE');

test('solo existen cuatro moods, con copy y descriptor', () => {
  assert.deepEqual(MOOD_IDS, ['cerca', 'curiosidad', 'abierto', 'tranquilo']);
  for (const m of Object.values(MOODS)) { assert.ok(m.label && m.descriptor && m.dims); }
  assert.ok(!MOODS.cuidar && !MOODS.jugar);
});
test('cada persona elige el suyo de forma independiente y se conservan las dos señales', () => {
  const e = mk(); e.setMood(0, 'tranquilo'); e.setMood(1, 'curiosidad');
  assert.equal(e.session.moodOf(0), 'tranquilo'); assert.equal(e.session.moodOf(1), 'curiosidad');
  assert.deepEqual(e.moodProfile().moods, ['tranquilo', 'curiosidad']);
  e.setMood(1, 'nope'); assert.equal(e.session.moodOf(1), null); // un valor desconocido no entra
});
test('el mood nunca cambia la elegibilidad: mismas cartas elegibles y rechazadas con cualquier combinación', () => {
  for (const level of [1, 2, 3]) {
    const base = mk(level); const ids0 = buildDeck(CARDS, base.context(0)).eligible.map(x => x.card.id).join();
    for (const a of [null, ...MOOD_IDS]) for (const b of [null, ...MOOD_IDS]) { const e = mk(level); e.setMood(0, a); e.setMood(1, b); assert.equal(buildDeck(CARDS, e.context(0)).eligible.map(x => x.card.id).join(), ids0, `${level} ${a}+${b}`); }
    // y ninguna carta elegible queda con peso cero por el mood (ponderación, no filtro)
    const e = mk(level); e.setMood(0, 'tranquilo'); e.setMood(1, 'tranquilo');
    const w = weighDeck(buildDeck(CARDS, e.context(0)), { history: e.history, session: e.session, director: e.director, purpose: 'MAINTAIN', round: 0, actor: 0, clothing: e.clothing });
    assert.ok(w.every(x => x.factors.mood >= 0.2 && x.factors.mood <= 3), 'factor mood acotado'); assert.ok(w.every(x => x.weight > 0));
  }
});
test('TRANQUILO penaliza la intensidad alta y favorece la baja; nunca a cero', () => {
  const p = moodProfile('tranquilo', 'tranquilo'), hi = byInt(3, 'HIGH'), lo = byInt(3, 'LOW');
  assert.ok(moodWeight(hi, p) < 0.6 && moodWeight(hi, p) >= 0.2, `HIGH ${moodWeight(hi, p)}`); assert.ok(moodWeight(lo, p) > 1.3, `LOW ${moodWeight(lo, p)}`);
  const pos = APPROVED.find(c => c.level === 3 && c.interactionType === 'POSITIONAL'); assert.ok(moodWeight(pos, p) < moodWeight(byInt(3, 'MID'), p), 'posicional por debajo de una MID estándar');
});
test('CERCA favorece proximidad (BODY_TO_BODY, abrazos, contacto sostenido) y baja un poco lo no próximo', () => {
  const p = moodProfile('cerca', 'cerca'); assert.ok(cardTraits(prox()).proximity >= 0.8);
  assert.ok(moodWeight(prox(), p) > 2, `${moodWeight(prox(), p)}`);
  const far = APPROVED.find(c => c.level === 1 && cardTraits(c).proximity === 0); assert.ok(moodWeight(far, p) < 1);
});
test('CURIOSIDAD favorece CHOOSE / GUIDED / juego y los targets que aún no han salido', () => {
  const p = moodProfile('curiosidad', 'curiosidad'); const e = mk();
  assert.ok(moodWeight(choose(), p, e.history, e.session) > 1.8);
  for (let i = 0; i < 6; i++) e.roll();
  const seenPart = e.history.rounds[0].parts[0]; const seen = APPROVED.find(c => c.level === 1 && c.receiverRequirements.some(r => r.part === seenPart) && c.interactionType === 'STANDARD');
  const fresh = APPROVED.find(c => c.level === 1 && c.interactionType === 'STANDARD' && c.receiverRequirements.length && !e.history.rounds.some(r => r.parts.some(x => c.receiverRequirements.some(q => q.part === x))) && !e.history.rounds.some(r => r.family === c.family));
  if (seen && fresh) assert.ok(moodWeight(fresh, p, e.history, e.session) > moodWeight(seen, p, e.history, e.session), 'target nuevo pesa más que target reciente');
});
test('ABIERTO abre la intensidad de forma progresiva: HIGH pesa menos al empezar y más cuando la sesión lleva cartas', () => {
  const p = moodProfile('abierto', 'abierto'), hi = byInt(3, 'HIGH'); const e = mk(3);
  const w0 = moodWeight(hi, p, e.history, e.session); e.session.roundsInLevel = 10; const w10 = moodWeight(hi, p, e.history, e.session);
  assert.ok(w0 < 1 && w10 > 1.2, `${w0} → ${w10}`);
  assert.ok(p.intensity > moodProfile('curiosidad', 'curiosidad').intensity && p.progression > 0.5);
});
test('la combinación considera a los dos: cercanía y exploración suman, la calma y la cautela mandan', () => {
  const tc = moodProfile('tranquilo', 'cerca'), ca = moodProfile('curiosidad', 'abierto'), ta = moodProfile('tranquilo', 'abierto');
  assert.equal(tc.calm, 1); assert.equal(tc.closeness, (1 + 0.3) / 2); assert.equal(tc.intensity, -1);
  assert.ok(ca.exploration > tc.exploration && ca.intensity > 0 && ca.progression > 0);
  // el mood cauteloso no se borra: TRANQUILO + ABIERTO sigue limitando como TRANQUILO, con algo más de exploración
  assert.equal(ta.intensity, -1); assert.equal(ta.calm, 1); assert.equal(ta.progression, -0.8); assert.ok(ta.exploration > 0 && ta.exploration < 0.5);
  const hi = byInt(3, 'HIGH'); assert.ok(moodWeight(hi, ta) < 0.6 && Math.abs(moodWeight(hi, ta) - moodWeight(hi, moodProfile('tranquilo', 'tranquilo'))) < 0.05);
  assert.ok(Math.abs(moodWeight(hi, ta) - moodWeight(hi, moodProfile('abierto', 'abierto'))) > 0.3, 'no es un promedio');
  // con un solo mood elegido, el perfil es el de esa persona
  assert.deepEqual(moodProfile('cerca', null).moods, ['cerca']); assert.equal(moodProfile(null, null).moods.length, 0);
});
test('el feedback posterior sigue mandando: «más suave» impone SOFTEN aunque los dos hayan elegido CURIOSIDAD; «pasar» baja la familia', () => {
  const e = mk(2, 7); e.setMood(0, 'curiosidad'); e.setMood(1, 'curiosidad');
  e.roll(); e.roll(); const r = e.softer(); assert.equal(r.purpose, 'SOFTEN');
  const fam = e.history.last().family; const before = e.session.familyScore[fam] || 0; e.pass(); assert.ok((e.session.familyScore[fam] || 0) < before);
  const e2 = mk(1, 3); e2.setMood(0, 'tranquilo'); e2.setMood(1, 'tranquilo'); e2.roll(); e2.feedback('like'); assert.equal(e2.session.lastFeedback.kind, 'like'); assert.ok(e2.session.familyScore[e2.history.last().family] > 0);
});
test('el mood es de la sesión: una sesión nueva empieza sin mood y puede elegir otro', () => {
  const e = mk(); e.setMood(0, 'cerca'); e.setMood(1, 'cerca'); e.roll(); e.newSession(1);
  assert.deepEqual(e.session.intents, [[], []]); assert.equal(e.moodProfile().moods.length, 0);
  e.setMood(0, 'abierto'); assert.equal(e.session.moodOf(0), 'abierto');
});
test('A/B corto: los moods cambian la distribución de forma medible y no determinista', () => {
  const opts = { sessions: 60, cards: 16, seedBase: 50 };
  const n1 = runCombo([null, null], 1, opts), cerca = runCombo(['cerca', 'cerca'], 1, opts), curio = runCombo(['curiosidad', 'curiosidad'], 1, opts);
  assert.ok(cerca.proximity / cerca.n > n1.proximity / n1.n * 1.12, `cerca ${cerca.proximity / cerca.n} vs ${n1.proximity / n1.n}`);
  assert.ok((curio.type.CHOOSE + curio.type.GUIDED) / curio.n > (n1.type.CHOOSE + n1.type.GUIDED) / n1.n * 1.15, 'curiosidad: más CHOOSE/GUIDED');
  const n3 = runCombo([null, null], 3, opts), calm = runCombo(['tranquilo', 'tranquilo'], 3, opts), calmOpen = runCombo(['tranquilo', 'abierto'], 3, opts), open = runCombo(['abierto', 'abierto'], 3, opts);
  const high = s => (s.inten.HIGH || 0) / s.n;
  assert.ok(high(calm) < high(n3) * 0.6, `tranquilo HIGH ${high(calm)} vs ${high(n3)}`);
  assert.ok(high(calmOpen) < high(n3) * 0.6 && Math.abs(high(calmOpen) - high(calm)) < 0.05, 'TRANQUILO + ABIERTO queda del lado de la calma');
  assert.ok(high(open) >= high(n3) * 0.9, 'ABIERTO no recorta el rango');
  assert.ok(Object.keys(calm.cards).length >= 20, 'TRANQUILO + TRANQUILO no es una lista fija'); assert.ok(Object.keys(curio.cards).length >= 30);
  assert.ok(calm.repeats / calm.sessions < 1.5, 'sin repeticiones sistemáticas');
});
