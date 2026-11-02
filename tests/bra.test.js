/* Brasier como prenda real: camiseta ≠ brasier, THROUGH_BRA, transición BRA ON → OFF, UNDRESS nunca vuelve a ofrecerlo */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED } from '../content/index.js';
import { buildDeck } from '../engine/deck.js';
import { chestAccess, removableGarments, clothingFailure } from '../engine/clothing.js';
import { mk, play, DRESSED, NAKED } from './helpers.js';

const CHEST_DIRECT = APPROVED.filter(c => c.level === 3 && c.receiverRequirements.some(r => ['breasts', 'nipples'].includes(r.part)) && c.clothing.receiver.includes('SKIN_ACCESS')).map(c => c.id);
const THROUGH_BRA = APPROVED.filter(c => c.clothing.receiver.includes('THROUGH_BRA')).map(c => c.id);
const st = (top, bra) => ({ top, bottoms: 'ON', socks: 'ON', bra, panties: 'ON', boxers: 'ON' });
const eligible = (recv) => { const e = mk({ level: 3, seed: 1, clothing: [recv, NAKED()] }); return new Set(buildDeck(CARDS, e.context(1)).eligible.map(x => x.card.id)); }; // Leo actúa, Ana (vulva · senos) recibe

test('catalog: direct-access chest cards and THROUGH_BRA cards exist and are distinct', () => {
  assert.deepEqual(CHEST_DIRECT.sort(), ['I03', 'I08', 'I09', 'I10', 'I17']); assert.deepEqual(THROUGH_BRA, ['I21']);
  assert.equal(CARD.I21.status, 'APPROVED'); assert.deepEqual(CARD.I21.allowedSides, ['LEFT', 'RIGHT', 'BOTH']);
  for (const c of APPROVED.filter(c => c.receiverRequirements.some(r => ['breasts', 'nipples'].includes(r.part)))) assert.ok(c.clothing.receiver.includes('SKIN_ACCESS') || c.clothing.receiver.includes('THROUGH_BRA') || c.clothing.receiver.includes('THROUGH_CLOTHING') || c.clothing.receiver.includes('CLOTHED') || c.clothing.receiver.includes('ANY'), c.id);
});
test('A · top ON + bra ON: no direct chest access, no THROUGH_BRA', () => {
  assert.equal(chestAccess(st('ON', 'ON')), 'COVERED_BY_TOP'); const ids = eligible(st('ON', 'ON'));
  for (const id of [...CHEST_DIRECT, ...THROUGH_BRA]) assert.ok(!ids.has(id), id);
});
test('B · top OFF + bra ON: THROUGH_BRA appears, direct access does not', () => {
  assert.equal(chestAccess(st('OFF', 'ON')), 'COVERED_BY_BRA'); const ids = eligible(st('OFF', 'ON'));
  for (const id of THROUGH_BRA) assert.ok(ids.has(id), id); for (const id of CHEST_DIRECT) assert.ok(!ids.has(id), id);
  const e = mk({ level: 3, seed: 2, clothing: [st('OFF', 'ON'), NAKED()] }); const rs = play(e, 300, { undress: false });
  assert.ok(rs.some(r => r.cardId === 'I21')); assert.ok(!rs.some(r => CHEST_DIRECT.includes(r.cardId)));
  for (const r of rs.filter(r => r.cardId === 'I21')) { assert.ok(/por encima del brasier/i.test(r.phrase)); assert.ok(['LEFT', 'RIGHT', 'BOTH'].includes(r.side)); }
  assert.deepEqual([...new Set(rs.filter(r => r.cardId === 'I21').map(r => r.side))].sort(), ['BOTH', 'LEFT', 'RIGHT']);
});
test('C · top OFF + bra OFF: THROUGH_BRA disappears, direct access appears', () => {
  assert.equal(chestAccess(st('OFF', 'OFF')), 'DIRECT'); const ids = eligible(st('OFF', 'OFF'));
  for (const id of THROUGH_BRA) assert.ok(!ids.has(id), id); for (const id of CHEST_DIRECT) assert.ok(ids.has(id), id);
});
test('D · top ON + bra OFF: the top still covers the chest', () => {
  assert.equal(chestAccess(st('ON', 'OFF')), 'COVERED_BY_TOP'); const ids = eligible(st('ON', 'OFF'));
  for (const id of [...CHEST_DIRECT, ...THROUGH_BRA]) assert.ok(!ids.has(id), id);
  assert.equal(clothingFailure(['THROUGH_BRA'], st('ON', 'ON'), ['nipples'], { role: 'receiver' }), 'THROUGH_BRA');
});
test('E · bra OFF: UNDRESS never offers the bra again; bra is only removable once the top is off', () => {
  assert.ok(!removableGarments(st('ON', 'ON')).includes('bra')); assert.ok(removableGarments(st('OFF', 'ON')).includes('bra')); assert.ok(!removableGarments(st('OFF', 'OFF')).includes('bra'));
  const e = mk({ level: 3, seed: 3, clothing: [st('OFF', 'ON'), DRESSED()] });
  assert.ok(e.removable(0).includes('bra')); assert.ok(e.recordUndress(0, 'bra')); assert.equal(e.clothing[0].bra, 'OFF');
  assert.ok(!e.removable(0).includes('bra')); assert.equal(e.recordUndress(0, 'bra'), false);
  for (const r of play(e, 200)) if (r.undress && r.undress.players.includes(0) && r.undress.garment !== 'ANY') assert.notEqual(r.undress.garment, 'bra');
});
test('transition BRA ON → OFF rebuilds the deck at once and boosts the unlocked chest cards without forcing them', () => {
  const e = mk({ level: 3, seed: 4, clothing: [st('OFF', 'ON'), NAKED()] });
  const before = e.eligibleIds(); assert.ok(before.has('I21')); for (const id of CHEST_DIRECT) assert.ok(!before.has(id));
  e.recordUndress(0, 'bra'); const after = e.eligibleIds();
  assert.ok(!after.has('I21')); for (const id of CHEST_DIRECT) { assert.ok(after.has(id), id); assert.equal(e.unlocked.get(id), e.state.round + 3); }
  let chestFirst = 0; for (let s = 0; s < 30; s++) { const f = mk({ level: 3, seed: 500 + s, clothing: [st('OFF', 'ON'), NAKED()] }); f.state.actor = 1; f.recordUndress(0, 'bra'); const r = f.roll(); if (CHEST_DIRECT.includes(r.cardId)) chestFirst++; }
  assert.ok(chestFirst > 0 && chestFirst < 30, `pecho primero ${chestFirst}/30`);
});
test('panties and boxers are independent of the trousers', () => {
  const s = { top: 'OFF', bottoms: 'OFF', socks: 'OFF', bra: 'OFF', panties: 'ON', boxers: 'NONE' };
  const e = mk({ level: 3, seed: 5, clothing: [s, NAKED()] }); const ids = new Set(buildDeck(CARDS, e.context(1)).eligible.map(x => x.card.id));
  for (const id of ['I11', 'I13', 'I15', 'I18', 'I06', 'I19']) assert.ok(!ids.has(id), `${id} con panties puestas`);
  for (const id of ['I03', 'I08', 'I09', 'I10', 'I05', 'I02']) assert.ok(ids.has(id), id);
});
