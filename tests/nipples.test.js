/* NIPPLES como target independiente de BREASTS (diseñador, 2026-11-03): pezones / tetillas existen en cualquier anatomía;
   cuatro cartas DESIGNER_PROVIDED (I40–I43) de acceso directo; las cartas de senos y de pezones «de senos» siguen igual. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED, regionOf, partsOf } from '../content/index.js';
import { BODY_PARTS } from '../content/body.js';
import { PlayerAnatomy } from '../engine/anatomy.js';
import { buildDeck, weighDeck } from '../engine/deck.js';
import { coverage, DEFAULT_CLOTHING, fullAccess } from '../engine/clothing.js';
import { mk, play, NAKED, DRESSED } from './helpers.js';

const NEW = ['I40', 'I41', 'I42', 'I43'];
const SENOS_NIPPLES = ['I03', 'I09', 'I10', 'I17', 'I21'];
const BREAST_CARDS = APPROVED.filter(c => c.receiverRequirements.some(r => r.part === 'breasts')).map(c => c.id);
/* Mike: pene, sin senos (con pezones, como todo el mundo). Val: vulva + senos. */
const pair = (o = {}) => mk({ prefs: { names: ['Mike', 'Val'], bodyParts: [['pene'], ['vulva', 'senos']], underwear: [['boxers'], ['bra', 'panties']] }, level: 3, ...o });
const eligibleFor = (e, receiver) => new Set(buildDeck(CARDS, e.context(1 - receiver)).eligible.map(x => x.card.id));
const rejectedFor = (e, receiver, id) => buildDeck(CARDS, e.context(1 - receiver)).rejected.find(r => r.id === id);

test('1 · NIPPLES existe como target válido e independiente de BREASTS en el catálogo corporal', () => {
  assert.ok(BODY_PARTS.nipples && BODY_PARTS.breasts); assert.equal(BODY_PARTS.nipples.anatomy, null); assert.equal(BODY_PARTS.breasts.anatomy, 'senos');
  assert.equal(BODY_PARTS.nipples.region, 'CHEST'); assert.equal(BODY_PARTS.chest.region, 'CHEST'); assert.deepEqual(BODY_PARTS.nipples.coveredBy, ['top', 'bra']);
});
test('2 · NIPPLES no depende de BREASTS: una anatomía sin senos tiene pezones y no tiene senos', () => {
  const mike = new PlayerAnatomy(0, ['pene']), val = new PlayerAnatomy(1, ['vulva', 'senos']), nadie = new PlayerAnatomy(2, []);
  assert.ok(mike.hasTarget('nipples') && !mike.hasTarget('breasts')); assert.ok(val.hasTarget('nipples') && val.hasTarget('breasts')); assert.ok(nadie.hasTarget('nipples'));
});
test('3 · un receptor con NIPPLES y sin BREASTS recibe las cuatro cartas con acceso directo (nunca por tener pene)', () => {
  const e = pair({ clothing: [NAKED(), NAKED()] }); const ids = eligibleFor(e, 0);
  for (const id of NEW) assert.ok(ids.has(id), `${id} elegible para Mike`);
  for (const id of BREAST_CARDS) assert.ok(!ids.has(id), `${id} (senos) no es para Mike`);
  for (const id of SENOS_NIPPLES) assert.ok(!ids.has(id), `${id} (pezones de senos) sigue sin ser para Mike`);
  for (const id of NEW) { assert.deepEqual(CARD[id].receiverRequirements, [{ part: 'nipples' }]); assert.equal(CARD[id].status, 'APPROVED'); assert.equal(CARD[id].source, 'DESIGNER_PROVIDED'); assert.deepEqual(CARD[id].clothing.receiver, ['SKIN_ACCESS']); assert.equal(CARD[id].allowedSides, null); }
  // y también para quien declara senos (pezones los tiene todo el mundo): la ampliación no quita nada a nadie
  const v = eligibleFor(e, 1); for (const id of [...NEW, ...BREAST_CARDS.filter(i => CARD[i].clothing.receiver.includes('SKIN_ACCESS')), 'I03', 'I09', 'I10']) assert.ok(v.has(id), `${id} elegible para Val`);
  // el requisito es anatómico, no de género ni de pene: una persona sin ninguna anatomía declarada también los recibe
  const n = mk({ prefs: { names: ['A', 'B'], bodyParts: [[], []] }, level: 3, clothing: [NAKED(), NAKED()] }); for (const id of NEW) assert.ok(eligibleFor(n, 0).has(id));
});
test('4 · sin NIPPLES disponibles no se reciben: el motor rechaza por RECEIVER_ANATOMY', () => {
  const e = pair({ clothing: [NAKED(), NAKED()] }); e.anatomy(0).availableTargets.delete('nipples'); // sin pezones (no existe hoy en Ajustes; se fuerza la disponibilidad)
  for (const id of NEW) { assert.ok(!eligibleFor(e, 0).has(id)); assert.equal(rejectedFor(e, 0, id).reason, 'RECEIVER_ANATOMY'); }
});
test('5 · con la camiseta puesta (acceso directo bloqueado) no aparecen; no se convierten en THROUGH_TOP', () => {
  const e = pair({ clothing: [DRESSED(), DRESSED()] }); assert.equal(coverage('nipples', e.clothing[0]).mode, 'THROUGH_TOP');
  for (const id of NEW) { assert.ok(!eligibleFor(e, 0).has(id)); assert.equal(rejectedFor(e, 0, id).reason, 'CLOTHING:receiver:SKIN_ACCESS'); assert.ok(!CARD[id].clothing.receiver.some(q => q.startsWith('THROUGH'))); }
  const rs = play(e, 60, { undress: false }); assert.ok(!rs.some(r => NEW.includes(r.cardId)), 'vestidos: ninguna en 60 cartas');
});
test('6 · sin brasier, al retirar la camiseta pasan a ser elegibles (TOP → DIRECT); con brasier, TOP → BRA → DIRECT sigue igual', () => {
  const e = pair({ clothing: [DEFAULT_CLOTHING(['pene'], ['boxers']), DEFAULT_CLOTHING(['vulva', 'senos'], ['bra', 'panties'])] }); assert.equal(e.clothing[0].bra, 'NONE', 'Mike no usa brasier'); assert.equal(e.clothing[1].bra, 'ON');
  assert.ok(e.recordUndress(0, 'top')); assert.equal(coverage('nipples', e.clothing[0]).mode, 'DIRECT_SKIN_ACCESS');
  for (const id of NEW) assert.ok(eligibleFor(e, 0).has(id), `${id} tras quitar la camiseta`);
  assert.ok(e.recordUndress(1, 'top')); assert.equal(coverage('nipples', e.clothing[1]).mode, 'THROUGH_BRA'); for (const id of NEW) assert.ok(!eligibleFor(e, 1).has(id), `${id}: Val con brasier`);
  assert.ok(e.recordUndress(1, 'bra')); for (const id of NEW) assert.ok(eligibleFor(e, 1).has(id));
});
test('7 · las cartas BREASTS y las de pezones de senos siguen exactamente igual', () => {
  assert.deepEqual(BREAST_CARDS.sort(), ['I08', 'I25', 'D08'].sort());
  for (const id of SENOS_NIPPLES) assert.deepEqual(CARD[id].receiverRequirements, [{ part: 'nipples', anatomy: 'senos' }]);
  for (const id of [...BREAST_CARDS, ...SENOS_NIPPLES]) assert.equal(CARD[id].status, 'APPROVED');
  assert.equal(CARD.I16.status, 'UNREVIEWED'); // pendiente de texto, sin cambios
  const e = pair({ clothing: [NAKED(), NAKED()] }); const v = eligibleFor(e, 1), m = eligibleFor(e, 0);
  for (const id of ['I03', 'I08', 'I09', 'I10']) { assert.ok(v.has(id), `${id} para Val`); assert.ok(!m.has(id), `${id} nunca para Mike`); assert.equal(rejectedFor(e, 0, id).reason, 'RECEIVER_ANATOMY'); }
  const rs = play(e, 400, { undress: false }); assert.ok(rs.some(r => r.receiver === 1 && r.cardId === 'I03')); assert.ok(!rs.some(r => r.receiver === 0 && [...BREAST_CARDS, ...SENOS_NIPPLES].includes(r.cardId)));
});
test('8 · las cuatro cartas entran en simulaciones, para Mike y para Val, sin dominar', () => {
  const seen = { 0: new Set(), 1: new Set() }; let n = 0, total = 0;
  for (let s = 0; s < 40; s++) { const e = pair({ seed: 900 + s, clothing: [fullAccess(['pene'], ['boxers']), fullAccess(['vulva', 'senos'], ['bra', 'panties'])] }); for (const r of play(e, 30, { undress: false })) { total++; if (NEW.includes(r.cardId)) { n++; seen[r.receiver].add(r.cardId); } } }
  assert.deepEqual([...seen[0]].sort(), NEW, 'Mike recibe las cuatro'); assert.deepEqual([...seen[1]].sort(), NEW, 'Val recibe las cuatro');
  assert.ok(n / total > 0.02 && n / total < 0.25, `proporción natural (${(100 * n / total).toFixed(1)} %)`);
  for (const id of NEW) assert.equal(CARD[id].baseWeight, 1, 'sin boost permanente');
});
test('9 · el historial registra target = nipples (no breasts) y la copia usa el nombre del receptor', () => {
  const e = pair({ seed: 7, clothing: [NAKED(), NAKED()] }); let r = null;
  for (let i = 0; i < 300 && !r; i++) { const x = e.roll(); if (x && NEW.includes(x.cardId) && x.receiver === 0) r = x; }
  assert.ok(r, 'sale una carta NIPPLES para Mike'); assert.deepEqual(r.parts, ['nipples']); assert.ok(!r.parts.includes('breasts')); assert.equal(r.region, 'CHEST'); assert.equal(r.side, null);
  assert.ok(/las tetillas de Mike/.test(r.phrase), r.phrase); assert.equal(e.history.last().parts[0], 'nipples'); assert.ok(e.history.recentTargets.some(p => p.includes('nipples')));
  for (const id of NEW) for (const t of CARD[id].copy) assert.ok(t.includes('{R}') && !/Mike|Val/.test(t), 'sin nombre hardcodeado');
});
test('10 · la diversidad corporal las clasifica en CHEST y las familias separan senos de pezones', () => {
  for (const id of NEW) { assert.equal(regionOf(CARD[id], null), 'CHEST'); assert.deepEqual(partsOf(CARD[id], null), ['nipples']); }
  assert.deepEqual(NEW.map(id => CARD[id].family), ['NIPPLES', 'NIPPLES', 'BITE', 'NIPPLES']); assert.equal(CARD.I08.family, 'BREASTS');
  // tras una carta CHEST reciente, las NIPPLES reciben la misma penalización de región que cualquier otra carta de pecho
  const e = pair({ seed: 3, clothing: [NAKED(), NAKED()] }); e.history.push({ cardId: 'I05', family: 'ABDOMEN', region: 'CHEST', parts: ['chest'], actor: 1, receiver: 0 });
  const w = weighDeck(buildDeck(CARDS, e.context(1)), { history: e.history, session: e.session, director: e.director, purpose: 'MAINTAIN', round: 1, actor: 1, clothing: e.clothing });
  const ws = w.filter(x => NEW.includes(x.card.id)); assert.equal(ws.length, 4); for (const x of ws) assert.ok(x.factors.region < 1, `${x.card.id} región reciente`);
});
