/* Decisiones del diseñador sobre los pendientes: I14 rechazada; U08 aprobada solo para calcetines (2026-11-02);
   I16 eliminada e I24 reactivada como «pene entre los senos» (2026-11-03). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED, partsOf } from '../content/index.js';
import { buildDeck } from '../engine/deck.js';
import { clothingFailure, undressPossible } from '../engine/clothing.js';
import { mk, NAKED, DRESSED } from './helpers.js';

const ids = (e, actor) => new Set(buildDeck(CARDS, e.context(actor)).eligible.map(x => x.card.id));

test('I14 REJECTED: no sale, no se reemplaza', () => {
  assert.equal(CARD.I14.status, 'REJECTED'); assert.ok(!APPROVED.some(c => c.id === 'I14'));
  assert.equal(APPROVED.filter(c => c.level === 3 && c.family === 'BITE' && !partsOf(c, null).includes('glans')).map(c => c.id).sort().join(), 'I04,I10,I19,I42,I48,I49'); // I42 tetillas · I48 pie · I49 cadera (diseñador 2026-11-03)
});
test('I16 eliminada por el diseñador (2026-11-03): REJECTED, sin copia, no se reemplaza', () => {
  const c = CARD.I16; assert.equal(c.status, 'REJECTED'); assert.deepEqual(c.copy, []); assert.ok(!APPROVED.some(x => x.id === 'I16'));
  const e = mk({ level: 3, seed: 1, clothing: [NAKED(), NAKED()] }); assert.equal(buildDeck([c], e.context(1)).rejected[0].reason, 'STATUS:REJECTED');
});
test('I24 reactivada (2026-11-03): pene entre los senos, solo si es físicamente posible', () => {
  const c = CARD.I24; assert.equal(c.status, 'APPROVED'); assert.equal(c.interactionType, 'POSITIONAL'); assert.deepEqual(c.actorRequirements, [{ part: 'penis' }]); assert.deepEqual(c.receiverRequirements, [{ part: 'breasts' }]);
  assert.deepEqual(c.copy, ['Coloca el pene entre los senos de {R} y muévelo despacio.']); assert.ok(!c.variants);
  const parts = ['breasts'];
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), top: 'ON', bra: 'ON' }, parts), 'SKIN_ACCESS', 'camiseta puesta: no');
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), top: 'OFF', bra: 'ON' }, parts), 'SKIN_ACCESS', 'brasier puesto: no');
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), top: 'OFF', bra: 'NOT_WORN' }, parts), null);
  const at = (prefs, clothing, actor) => { const e = mk({ level: 3, seed: 1, prefs: { bodyParts: prefs }, clothing }); return buildDeck([c], e.context(actor)); };
  // Leo (pene) actúa, Ana (vulva · senos) recibe
  assert.equal(at([['pene'], ['vulva', 'senos']], [NAKED(), NAKED()], 0).eligible.length, 1, 'pene a piel + senos a piel: sí');
  assert.match(at([['pene'], ['vulva', 'senos']], [{ ...NAKED(), boxers: 'ON' }, NAKED()], 0).rejected[0].reason, /actor|BODY_NOT_AVAILABLE/, 'calzoncillos puestos: no');
  assert.equal(at([['pene'], ['vulva', 'senos']], [NAKED(), { ...NAKED(), bra: 'ON' }], 0).rejected[0].reason, 'CLOTHING:receiver:SKIN_ACCESS');
  assert.equal(at([['vulva', 'senos'], ['pene']], [NAKED(), NAKED()], 0).rejected[0].reason, 'ACTOR_ANATOMY', 'sin pene no actúa');
  assert.equal(at([['pene'], ['pene']], [NAKED(), NAKED()], 0).rejected[0].reason, 'RECEIVER_ANATOMY', 'sin senos no recibe');
});
test('U08 APPROVED solo calcetines: sale únicamente con socks ON de quien recibe, nunca otra prenda; al aplicarla socks OFF y baraja recalculada', () => {
  const c = CARD.U08; assert.equal(c.status, 'APPROVED'); assert.equal(c.undress.garment, 'socks'); assert.equal(c.undress.who, 'RECEIVER'); assert.equal(c.undress.limitation, 'NO_HANDS'); assert.match(c.copy[0], /calcetines/);
  for (const g of ['top', 'bra', 'bottoms', 'panties', 'boxers']) assert.ok(!undressPossible(c.undress, NAKED(), { ...NAKED(), [g]: 'ON' }), `${g} puesta sin calcetines: no`);
  assert.ok(undressPossible(c.undress, NAKED(), { ...NAKED(), socks: 'ON' })); assert.ok(!undressPossible(c.undress, NAKED(), { ...NAKED(), socks: 'NOT_WORN' }));
  const e = mk({ level: 3, seed: 1, clothing: [{ ...NAKED(), socks: 'ON' }, NAKED()] });
  assert.ok(ids(e, 1).has('U08'), 'Ana con calcetines: elegible cuando Leo actúa'); assert.ok(!ids(e, 0).has('U08'), 'Leo descalzo: no');
  assert.ok(e.recordUndress(0, 'socks')); assert.equal(e.clothing[0].socks, 'OFF'); assert.ok(!ids(e, 1).has('U08'), 'recalculada al momento');
  const seen = new Set(); for (let s = 1; s <= 30; s++) { const x = mk({ level: 3, seed: s, clothing: [DRESSED(), DRESSED()] }); for (let i = 0; i < 30; i++) { const r = x.roll(); if (r.cardId === 'U08') { seen.add(r.undress.garment); assert.equal(r.undress.garment, 'socks'); } if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? x.removable(p)[0] : r.undress.garment; if (g) x.recordUndress(p, g); } if (x.pauseDue()) x.continueGuided(); } }
  assert.deepEqual([...seen], ['socks']);
});
