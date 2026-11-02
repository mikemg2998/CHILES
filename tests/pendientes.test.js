/* Decisiones del diseñador del 2026-11-02 sobre los pendientes: I14 rechazada; I16 y I24 con requisitos cerrados (solo falta su texto,
   nunca inventado); U08 aprobada solo para calcetines. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED, partsOf } from '../content/index.js';
import { buildDeck } from '../engine/deck.js';
import { clothingFailure, undressPossible } from '../engine/clothing.js';
import { mk, NAKED, DRESSED } from './helpers.js';

const ids = (e, actor) => new Set(buildDeck(CARDS, e.context(actor)).eligible.map(x => x.card.id));

test('I14 REJECTED: no sale, no se reemplaza', () => {
  assert.equal(CARD.I14.status, 'REJECTED'); assert.ok(!APPROVED.some(c => c.id === 'I14'));
  assert.equal(APPROVED.filter(c => c.level === 3 && c.family === 'BITE' && !partsOf(c, null).includes('glans')).map(c => c.id).sort().join(), 'I04,I10,I19');
});
test('I16: requisitos cerrados (pene a piel; senos a piel: top ≠ ON y bra ≠ ON), POSITIONAL tumbados, sin variantes; solo falta la escena', () => {
  const c = CARD.I16; assert.equal(c.interactionType, 'POSITIONAL'); assert.equal(c.requiredOrientation, 'LYING'); assert.equal(c.source, 'DESIGNER_PROVIDED'); assert.ok(!c.variants);
  assert.deepEqual(c.clothing, { actor: ['FULL_BODY_ACCESS'], receiver: ['SKIN_ACCESS'] });
  const parts = ['breasts'];
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), top: 'ON', bra: 'ON' }, parts), 'SKIN_ACCESS', 'camiseta puesta: no');
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), top: 'ON', bra: 'NOT_WORN' }, parts), 'SKIN_ACCESS', 'camiseta puesta sin brasier: no');
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), top: 'OFF', bra: 'ON' }, parts), 'SKIN_ACCESS', 'brasier puesto: no');
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), top: 'OFF', bra: 'NOT_WORN' }, parts), null, 'sin brasier y camiseta fuera: sí');
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), top: 'OFF', bra: 'OFF' }, parts), null);
  assert.equal(clothingFailure(c.clothing.actor, { ...NAKED(), boxers: 'ON' }, ['penis'], { role: 'actor' }), 'FULL_BODY_ACCESS');
  // sigue sin copia → UNREVIEWED → rechazada por STATUS, nunca por otra razón
  assert.equal(c.status, 'UNREVIEWED'); assert.deepEqual(c.copy, []);
  const e = mk({ level: 3, seed: 1, clothing: [NAKED(), NAKED()] }); assert.equal(buildDeck([c], e.context(1)).rejected[0].reason, 'STATUS:UNREVIEWED');
});
test('I24: concepto THROUGH_PANTIES con requisitos cerrados; faltan zonas y texto, no se inventan', () => {
  const c = CARD.I24; assert.deepEqual(c.clothing.receiver, ['THROUGH_PANTIES']); assert.deepEqual(c.actorRequirements, [{ part: 'lips' }]); assert.deepEqual(c.receiverRequirements, []); assert.deepEqual(c.copy, []); assert.equal(c.status, 'UNREVIEWED');
  const parts = ['vulva']; // cualquier zona bajo las panties se evaluaría así
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), bottoms: 'ON', panties: 'ON' }, parts), 'THROUGH_PANTIES', 'pantalón puesto: no');
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), bottoms: 'OFF', panties: 'ON' }, parts), null, 'pantalón fuera + panties: sí');
  assert.equal(clothingFailure(c.clothing.receiver, { ...NAKED(), bottoms: 'OFF', panties: 'OFF' }, parts), 'THROUGH_PANTIES', 'panties fuera: deja de ser elegible');
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
