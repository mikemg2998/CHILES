/* Clítoris y vagina como targets con contenido real (diseñador, 2026-11-02) y contenido LATE_SESSION (≥ 35 cartas de Intimidad).
   La pausa 13–17 no reinicia el contador; el contenido tardío nunca sale antes del umbral, puede salir después, no está garantizado,
   no escala la sesión y no se come la diversidad corporal. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED, regionOf, partsOf } from '../content/index.js';
import { BODY_PARTS, ACTOR_TOOLS } from '../content/body.js';
import { PAUSE_WINDOW } from '../engine/session.js';
import { buildDeck, weighDeck } from '../engine/deck.js';
import { mk, play, NAKED, DRESSED } from './helpers.js';

const CLIT = ['I26', 'I27', 'I28', 'I29'], VAG = ['I30', 'I31'], LATE = ['I32', 'I33'];
const ids = (e, actor = 1, cards = CARDS) => new Set(buildDeck(cards, e.context(actor)).eligible.map(x => x.card.id));
const rej = (e, actor = 1) => Object.fromEntries(buildDeck(CARDS, e.context(actor)).rejected.map(r => [r.id, r.reason]));
const naked = (o = {}) => mk({ level: 3, seed: o.seed ?? 1, clothing: [NAKED(), NAKED()] });

test('vulva, clitoris y vagina son targets distintos y las cartas nuevas apuntan exactamente al suyo', () => {
  for (const t of ['vulva', 'clitoris', 'vagina']) { assert.ok(BODY_PARTS[t]); assert.equal(BODY_PARTS[t].anatomy, 'vulva'); assert.equal(BODY_PARTS[t].region, 'INTIMATE'); }
  for (const id of CLIT) assert.deepEqual(CARD[id].receiverRequirements, [{ part: 'clitoris' }], id);
  for (const id of [...VAG, ...LATE]) assert.deepEqual(CARD[id].receiverRequirements, [{ part: 'vagina' }], id);
  assert.equal(APPROVED.filter(c => partsOf(c, null).includes('clitoris')).length, 4); assert.equal(APPROVED.filter(c => partsOf(c, null).includes('vagina')).length, 4);
  assert.ok(ACTOR_TOOLS.twoFingers && ACTOR_TOOLS.threeFingers); assert.deepEqual(CARD.I31.variants.map(v => v.id), ['un-dedo', 'dos-dedos', 'tres-dedos']);
  for (const id of [...CLIT, ...VAG, ...LATE]) { assert.equal(CARD[id].status, 'APPROVED'); assert.equal(CARD[id].source, 'DESIGNER_PROVIDED'); assert.ok(CARD[id].clothing.receiver.includes('SKIN_ACCESS') && !CARD[id].clothing.receiver.some(q => /^THROUGH/.test(q)), id + ' es DIRECT'); }
});
test('acceso directo obligatorio: con pantalón o panties puestas ninguna sale; a piel (OFF o NOT_WORN) salen', () => {
  for (const recv of [{ ...NAKED(), bottoms: 'ON', panties: 'ON' }, { ...NAKED(), panties: 'ON' }]) { const e = mk({ level: 3, seed: 1, clothing: [recv, NAKED()] }); const s = ids(e); for (const id of [...CLIT, ...VAG]) assert.ok(!s.has(id), `${id} con ${JSON.stringify(recv)}`); }
  for (const recv of [NAKED(), { ...NAKED(), panties: 'NOT_WORN' }]) { const e = mk({ level: 3, seed: 1, clothing: [recv, NAKED()] }); const s = ids(e); for (const id of [...CLIT, ...VAG]) assert.ok(s.has(id), id); }
  const e = mk({ level: 3, seed: 1, clothing: [{ ...NAKED(), panties: 'ON' }, NAKED()] }); const r = rej(e); assert.match(r.I26, /SKIN_ACCESS/); assert.match(r.I30, /SKIN_ACCESS/);
});
test('anatomía: clítoris y vagina solo con vulva declarada; I29 además exige pene en quien actúa; Leo con calzoncillos puestos no puede usar el glande', () => {
  const noVulva = mk({ level: 3, seed: 1, clothing: [NAKED(), NAKED()], prefs: { bodyParts: [['senos'], ['pene']] } }); const s = ids(noVulva); for (const id of [...CLIT, ...VAG]) assert.ok(!s.has(id), id);
  const noPene = mk({ level: 3, seed: 1, clothing: [NAKED(), NAKED()], prefs: { bodyParts: [['vulva', 'senos'], ['vulva']] } }); assert.ok(!ids(noPene).has('I29')); assert.ok(ids(noPene).has('I26'));
  const boxers = mk({ level: 3, seed: 1, clothing: [NAKED(), { ...NAKED(), boxers: 'ON' }] }); assert.ok(!ids(boxers).has('I29')); assert.ok(ids(boxers).has('I27'));
});
test('la pausa 13–17 no reinicia el contador: seguir con el juego cuenta 18, 19 … 45', () => {
  const e = naked({ seed: 3 }); let pauses = 0;
  for (let i = 0; i < 45; i++) { if (e.pauseDue()) { pauses++; const before = e.session.intimacyCardCount; e.continueGuided(); assert.equal(e.session.intimacyCardCount, before, 'seguir no reinicia'); assert.ok(e.session.pauseAt >= before + PAUSE_WINDOW[0]); } assert.ok(e.roll()); }
  assert.equal(e.session.intimacyCardCount, 45); assert.ok(pauses >= 2, `pausas: ${pauses}`); assert.equal(e.session.ended, null);
});
test('LATE_SESSION: inelegible antes de 35 aunque todo esté a piel; elegible después con peso bajo y sin empujón de desbloqueo', () => {
  const e = naked({ seed: 5 });
  for (let n = 0; n < 34; n++) { const r = rej(e); for (const id of LATE) assert.equal(r[id], `LATE_SESSION:${e.session.intimacyCardCount}/35`, `${id} en ${e.session.intimacyCardCount}`); if (e.pauseDue()) e.continueGuided(); e.roll(); }
  while (e.session.intimacyCardCount < 35) { if (e.pauseDue()) e.continueGuided(); e.roll(); }
  for (const id of LATE) assert.ok(ids(e).has(id), id); for (const id of LATE) assert.ok(ids(e, 0).has(id) === false, 'Ana no tiene pene: no actúa en ' + id);
  const w = weighDeck(buildDeck(CARDS, e.context(1)), { history: e.history, session: e.session, director: null, purpose: 'MAINTAIN', unlocked: e.unlocked, round: e.state.round, actor: 1, clothing: e.clothing });
  for (const id of LATE) { const x = w.find(y => y.card.id === id); assert.equal(x.factors.base, 0.5); assert.equal(x.factors.unlocked, 1, 'cruzar el umbral no es un desbloqueo de ropa'); }
});
test('sesiones largas (200 × 50, desnudos desde el inicio): el contenido tardío nunca sale antes de 35, sale en algunas, no en todas, y no escala la sesión', () => {
  let sessionsWithLate = 0, lateRounds = [], afterLateIntimate = [], regionsAfter = [];
  for (let seed = 1; seed <= 200; seed++) {
    const e = naked({ seed }); let first = null;
    for (let i = 0; i < 50; i++) { if (e.pauseDue()) e.continueGuided(); const r = e.roll(); if (LATE.includes(r.cardId)) { assert.ok(e.session.intimacyCardCount >= 35, `${r.cardId} en la carta ${e.session.intimacyCardCount}`); if (first === null) { first = r.n; lateRounds.push(r.n); } } }
    if (first !== null) { sessionsWithLate++; const after = e.history.rounds.filter(r => r.n > first); afterLateIntimate.push(after.filter(r => r.region === 'INTIMATE').length / Math.max(1, after.length)); regionsAfter.push(new Set(after.map(r => r.region)).size); }
  }
  assert.ok(sessionsWithLate >= 20, `sale en pocas sesiones: ${sessionsWithLate}`); assert.ok(sessionsWithLate <= 190, `sale en casi todas: ${sessionsWithLate}`);
  const avgAfter = afterLateIntimate.reduce((a, b) => a + b, 0) / afterLateIntimate.length; assert.ok(avgAfter < 0.5, `tras la tardía la sesión se vuelve íntima: ${avgAfter}`);
  const avgRegions = regionsAfter.reduce((a, b) => a + b, 0) / regionsAfter.length; assert.ok(avgRegions >= 3, `pocas regiones tras la tardía: ${avgRegions}`);
});
test('diversidad corporal con el catálogo ampliado (100 sesiones reales): regiones únicas y cuota INTIMATE dentro de lo razonable', () => {
  let regions = 0, intimate = 0, total = 0, streaks = 0;
  for (let seed = 1; seed <= 100; seed++) { const e = mk({ level: 3, seed, clothing: [DRESSED(), DRESSED()] }); const rs = play(e, 30); regions += new Set(rs.map(r => r.region)).size; total += rs.length; intimate += rs.filter(r => r.region === 'INTIMATE').length; for (let i = 2; i < rs.length; i++) if (rs[i].region === 'INTIMATE' && rs[i - 1].region === 'INTIMATE' && rs[i - 2].region === 'INTIMATE') streaks++; }
  assert.ok(regions / 100 >= 7, `regiones únicas ${regions / 100}`); assert.ok(intimate / total < 0.3, `cuota INTIMATE ${intimate / total}`); assert.ok(streaks / 100 < 1, `rachas íntimas de 3: ${streaks / 100} por sesión`);
});
test('I12, I16 e I24 siguen exactamente como estaban', () => {
  assert.equal(CARD.I12.variants.find(v => v.id === 'vulva').status, 'UNREVIEWED'); assert.deepEqual(CARD.I12.clothing.actor, ['ANY']);
  assert.equal(CARD.I16.status, 'UNREVIEWED'); assert.equal(CARD.I24.status, 'UNREVIEWED'); assert.deepEqual(CARD.I24.receiverRequirements, []);
});
