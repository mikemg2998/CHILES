/* Guiar con la mano (diseñador, 2026-11-04): dos experiencias, cada una en sus dos direcciones.
   Guiar las caricias: I63 (acaricia quien tiene el turno, guía {R}) · I64 (acaricia {R}, guía quien tiene el turno).
   Guiar la estimulación íntima: I65 (estimula quien tiene el turno, guía {R}) · I66 (estimula {R}, guía quien tiene el turno).
   Regla: quien guía es SIEMPRE quien recibe, tenga o no el turno. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, regionOf, APPROVED } from '../content/index.js';
import { buildDeck, weighDeck } from '../engine/deck.js';
import { realize } from '../engine/realizer.js';
import { COOLDOWN, cooldownKey, reciprocalKey } from '../engine/diversity.js';
import { mk, play, NAKED, DRESSED } from './helpers.js';

const GUIDE = ['I63', 'I64', 'I65', 'I66'];
const NAMES = ['Ana', 'Leo'];
const ANA_LEO = { bodyParts: [['vulva', 'senos'], ['pene']] };
const UNDER_OFF = () => ({ ...DRESSED(), bottoms: 'OFF', panties: 'OFF', boxers: 'OFF' });
const PANTS_OFF = () => ({ ...DRESSED(), bottoms: 'OFF' });
const e3 = (clothing, prefs = ANA_LEO, seed = 1) => mk({ level: 3, seed, prefs, clothing });
const eligible = (e, actor, id) => buildDeck(CARDS, e.context(actor)).eligible.find(x => x.card.id === id) || null;
/* quién guía (= quien recibe) y quién hace, para una carta jugada con un turno */
const guideOf = (id, actor) => (CARD[id].reciprocalSubject === 'RECEIVER' ? 1 - actor : actor);
const text = (e, actor, id) => { const x = eligible(e, actor, id); assert.ok(x, `${id} elegible con turno de ${NAMES[actor]}`); return realize(CARD[id], { variant: x.variants ? x.variants[0] : null, names: { actor: NAMES[actor], receiver: NAMES[1 - actor] }, rng: { weighted: o => o[0].item } }).text; };
/* las dos formas de que «doer» actúe sobre «guide»: la carta directa con el turno de quien hace, o la inversa con el turno de quien guía */
const ways = (pair, doer) => [{ id: pair[0], actor: doer }, { id: pair[1], actor: 1 - doer }];

test('cuatro cartas nuevas, aprobadas, en Intimidad, con su clasificación y peso base 1', () => {
  for (const id of GUIDE) {
    const c = CARD[id]; assert.equal(c.status, 'APPROVED'); assert.equal(c.level, 3); assert.equal(c.baseWeight, 1, id);
    assert.equal(c.interactionType, 'GUIDED'); assert.equal(c.similarityGroup, 'GUIDED'); assert.ok(c.tags.includes('guia'), id + ' responde al «Hoy no · Guiar con la mano»');
  }
  assert.equal(cooldownKey('I63'), cooldownKey('I64')); assert.equal(cooldownKey('I65'), cooldownKey('I66')); assert.notEqual(cooldownKey('I63'), cooldownKey('I65'));
  assert.equal(CARD.I63.family, 'CARESS'); assert.equal(CARD.I65.family, 'MANUAL');
  assert.deepEqual(CARD.I63.durations, [45, 60]); assert.deepEqual(CARD.I65.durations, [45, 60, 75]);
  assert.equal(regionOf(CARD.I63, null), 'FULL_BODY'); for (const v of CARD.I65.variants) assert.equal(regionOf(CARD.I65, v), 'INTIMATE');
  assert.equal(APPROVED.filter(c => c.interactionType === 'GUIDED').length, 4, 'las únicas GUIDED del juego');
  assert.equal(CARD.I11.variants[0].copy[1], 'Con la mano sobre la vulva de {R}, muévela despacio; que la mano de {R} te corrija si quiere.', 'I11 intacta');
});

for (const [label, doer] of [['A → B (Ana acaricia, Leo guía)', 0], ['B → A (Leo acaricia, Ana guía)', 1]]) {
  test(`caricias ${label}: con la ropa puesta, y guía siempre quien recibe`, () => {
    const guide = 1 - doer;
    for (const { id, actor } of ways(['I63', 'I64'], doer)) {
      const e = e3([DRESSED(), DRESSED()]);
      assert.equal(guideOf(id, actor), guide, `${id} turno ${NAMES[actor]}`);
      const t = text(e, actor, id);
      if (id === 'I63') assert.equal(t, `Acaricia lentamente el cuerpo de ${NAMES[guide]}. ${NAMES[guide]} puede poner su mano sobre la tuya para llevarla a las zonas que prefiera y marcar el ritmo.`);
      else assert.equal(t, `${NAMES[doer]} acaricia lentamente tu cuerpo. Puedes poner tu mano sobre la suya para llevarla a las zonas que prefieras y marcar el ritmo.`);
      assert.equal(reciprocalKey(CARD[id], actor), `GUIDED_CARESS:${guide}`, 'la reciprocidad sigue a quien guía');
    }
  });
}

for (const [label, doer] of [['A → B (Ana estimula, Leo recibe y guía)', 0], ['B → A (Leo estimula, Ana recibe y guía)', 1]]) {
  test(`estimulación íntima ${label}: solo con la ropa interior de quien recibe fuera; guía quien recibe`, () => {
    const guide = 1 - doer, organ = guide === 0 ? 'vulva' : 'pene';
    const cl = (g, d) => { const c = [null, null]; c[guide] = g; c[doer] = d; return c; };
    for (const { id, actor } of ways(['I65', 'I66'], doer)) {
      assert.equal(guideOf(id, actor), guide, `${id} turno ${NAMES[actor]}`);
      assert.ok(!eligible(e3(cl(DRESSED(), NAKED())), actor, id), `${id}: quien recibe vestido`);
      assert.ok(!eligible(e3(cl(PANTS_OFF(), NAKED())), actor, id), `${id}: quien recibe con la ropa interior puesta`);
      const e = e3(cl(UNDER_OFF(), DRESSED())); // quien estimula puede seguir vestido; quien recibe, camiseta puesta
      assert.deepEqual(eligible(e, actor, id).variants.map(v => v.id), [organ]);
      const t = text(e, actor, id);
      if (id === 'I65') assert.equal(t, `Estimula con la mano ${organ === 'vulva' ? 'la vulva' : 'el pene'} de ${NAMES[guide]}. ${NAMES[guide]} guía tu mano para marcarte el ritmo y los movimientos que prefiere.`);
      else assert.equal(t, `${NAMES[doer]} estimula tu ${organ} con la mano y tú guías la suya para marcar el ritmo y los movimientos que prefieres.`);
      assert.equal(reciprocalKey(CARD[id], actor), `GUIDED_INTIMATE:${guide}`);
    }
  });
}

test('anatomía: la estimulación íntima exige vulva o pene en quien recibe; las caricias no exigen nada', () => {
  const e = e3([NAKED(), NAKED()], { bodyParts: [['senos'], ['pene']] });
  assert.ok(!eligible(e, 1, 'I65'), 'Ana sin vulva ni pene declarados no recibe I65'); assert.ok(!eligible(e, 0, 'I66'), 'ni I66 con su turno');
  assert.ok(eligible(e, 1, 'I63') && eligible(e, 0, 'I64'));
  const p = e3([NAKED(), NAKED()], { bodyParts: [['pene'], ['pene']] }); assert.deepEqual(eligible(p, 0, 'I65').variants.map(v => v.id), ['pene']); assert.deepEqual(eligible(p, 0, 'I66').variants.map(v => v.id), ['pene']);
  const hoyNo = e3([NAKED(), NAKED()]); hoyNo.session.pref[1] = { guia: 'no' }; for (const id of GUIDE) assert.ok(!eligible(hoyNo, 0, id), `«Hoy no» quita ${id}`);
});

test('en partidas reales vestidas: las caricias salen antes de quitarse nada; la íntima nunca antes de tiempo', () => {
  let caressDressed = 0, intimate = 0;
  for (let s = 0; s < 300; s++) {
    const e = e3([DRESSED(), DRESSED()], ANA_LEO, 20000 + s);
    for (let i = 0; i < 40; i++) {
      if (e.pauseDue()) e.continueGuided();
      const before = e.clothing.map(c => ({ ...c })); const r = e.roll(); if (!r) break;
      const allOn = before.every(c => ['top', 'bottoms'].every(g => c[g] === 'ON'));
      if (['I63', 'I64'].includes(r.cardId) && allOn) caressDressed++;
      if (['I65', 'I66'].includes(r.cardId)) { intimate++; const g = before[guideOf(r.cardId, r.actor)]; assert.ok(g.bottoms !== 'ON' && g.panties !== 'ON' && g.boxers !== 'ON', `${r.cardId} con quien recibe sin ropa interior`); }
      if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
    }
  }
  assert.ok(caressDressed > 0, `caricias guiadas con los dos vestidos: ${caressDressed}`); assert.ok(intimate > 0, `íntima guiada: ${intimate}`);
});

test('las dos direcciones de cada experiencia en una sesión, nunca a 10 cartas o menos; las cuatro no se acumulan seguidas', () => {
  const both = { caress: 0, intimate: 0 }; let minGap = Infinity, consecutive = 0, guidedRounds = 0;
  for (let s = 0; s < 300; s++) {
    const rs = play(e3([NAKED(), NAKED()], ANA_LEO, 21000 + s), 60).filter(r => r.level === 3 && !r.transition);
    for (const [k, pair, key] of [['caress', ['I63', 'I64'], 'GUIDED_CARESS'], ['intimate', ['I65', 'I66'], 'GUIDED_INTIMATE']]) {
      const pos = rs.map((r, i) => (pair.includes(r.cardId) ? i : -1)).filter(i => i >= 0);
      if (new Set(pos.map(i => guideOf(rs[i].cardId, rs[i].actor))).size === 2) both[k]++;
      for (let j = 1; j < pos.length; j++) minGap = Math.min(minGap, pos[j] - pos[j - 1]);
    }
    rs.forEach((r, i) => { if (GUIDE.includes(r.cardId)) { guidedRounds++; if (i > 0 && GUIDE.includes(rs[i - 1].cardId)) consecutive++; } });
  }
  assert.ok(both.caress > 0 && both.intimate > 0, `las dos personas guían en la misma sesión: ${JSON.stringify(both)}`);
  assert.ok(minGap > COOLDOWN, `separación mínima ${minGap}`);
  assert.ok(consecutive / guidedRounds < 0.05, `guiadas seguidas: ${consecutive} de ${guidedRounds}`);
});

test('selector: participan en no vistas, desbloqueo, oportunidades perdidas y reciprocidad; penalización de grupo y tipo tras otra guiada', () => {
  const e = e3([NAKED(), NAKED()], ANA_LEO, 41); const f = {};
  for (let i = 0; i < 40; i++) { if (e.pauseDue()) e.continueGuided(); const before = new Set(e.reciprocal); e.roll(); const a = e.lastDebug.actor;
    for (const c of e.lastDebug.candidates) if (GUIDE.includes(c.id)) { f[c.id] = c.factors; assert.equal(c.factors.reciprocal, before.has(reciprocalKey(CARD[c.id], a)) ? 0.2 : 1, `${c.id} reciprocidad`); } }
  for (const id of GUIDE) { assert.ok(f[id], `${id} en el sorteo`); for (const k of ['unseen', 'unlockedHold', 'missed']) assert.ok(k in f[id], `${id} ${k}`); assert.equal(f[id].base, 1); }
  // justo después de una guiada, las otras tres pesan menos (similarityGroup GUIDED y tipo GUIDED)
  const g = e3([NAKED(), NAKED()], ANA_LEO, 42);
  for (let i = 0; i < 200 && !(g.history.rounds[0] && GUIDE.includes(g.history.rounds[0].cardId)); i++) { if (g.pauseDue()) g.continueGuided(); g.roll(); }
  assert.ok(GUIDE.includes(g.history.rounds[0].cardId), 'sale una guiada');
  const w = weighDeck(buildDeck(CARDS, g.context(g.state.actor)), { history: g.history, session: g.session, director: null, purpose: 'MAINTAIN', unlocked: g.unlocked, round: g.state.round, actor: g.state.actor, clothing: g.clothing });
  const others = w.filter(x => GUIDE.includes(x.card.id) && cooldownKey(x.card.id) !== cooldownKey(g.history.rounds[0].cardId));
  assert.ok(others.length > 0); for (const x of others) assert.ok(x.factors.similarity < 1 && x.factors.type < 1, `${x.card.id} ${JSON.stringify(x.factors)}`);
});
