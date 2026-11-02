/* §66 · pruebas de estado de ropa */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD } from '../content/index.js';
import { buildDeck } from '../engine/deck.js';
import { partAccessible, clothingFailure, removableGarments, band } from '../engine/clothing.js';
import { mk, play, DRESSED, NAKED } from './helpers.js';

const UND = () => ({ top: 'OFF', bottoms: 'OFF', socks: 'OFF', underwear: 'ON' });
const NOTOP = () => ({ top: 'OFF', bottoms: 'ON', socks: 'ON', underwear: 'ON' });
const ids = (e, actor = 1) => buildDeck(CARDS, e.context(actor)).eligible.map(x => x.card.id);
const needsSkin = CARDS.filter(c => c.level === 3 && c.clothing.receiver.includes('SKIN_ACCESS')).map(c => c.id);

test('both dressed: only clothing-free cards and UNDRESS are eligible in Intimidad', () => {
  const e = mk({ level: 3, clothing: [DRESSED(), DRESSED()] }); const l = ids(e);
  assert.ok(l.includes('I01') && l.includes('I02') && l.includes('U01')); for (const id of needsSkin) assert.ok(!l.includes(id), id); assert.ok(!l.includes('I11') && !l.includes('I20'));
});
test('A without top, B dressed: top-access cards toward A appear; toward B they do not', () => {
  const e = mk({ level: 3, clothing: [NOTOP(), DRESSED()] });
  assert.ok(ids(e, 1).includes('I03') && ids(e, 1).includes('I05')); assert.ok(!ids(e, 0).includes('I05') && !ids(e, 0).includes('I04'));
});
test('both without top: both directions open the same top-access cards', () => { const e = mk({ level: 3, clothing: [NOTOP(), NOTOP()] }); assert.ok(ids(e, 0).includes('I05') && ids(e, 1).includes('I05')); assert.ok(!ids(e, 1).includes('I04')); });
test('A in underwear: thighs and legs yes; buttocks (under the underwear) and intimate anatomy no', () => { const e = mk({ level: 3, clothing: [UND(), DRESSED()] }); const l = ids(e, 1); assert.ok(l.includes('I04') && l.includes('I07')); assert.ok(!l.includes('I06') && !l.includes('I19')); assert.ok(!l.includes('I11') && !l.includes('I13') && !l.includes('I18')); });
test('both in underwear: symmetric; naked hug not yet', () => { const e = mk({ level: 3, clothing: [UND(), UND()] }); assert.ok(ids(e, 0).includes('I04') && ids(e, 1).includes('I04')); assert.ok(!ids(e, 0).includes('I20')); });
test('A without underwear, B with: intimate cards toward A only; naked hug needs both', () => { const e = mk({ level: 3, clothing: [NAKED(), UND()] }); assert.ok(ids(e, 1).includes('I11') && ids(e, 1).includes('I13')); assert.ok(!ids(e, 0).includes('I11')); assert.ok(!ids(e, 0).includes('I20') && !ids(e, 1).includes('I20')); });
test('both without underwear: full access both ways, naked hug available', () => { const e = mk({ level: 3, clothing: [NAKED(), NAKED()] }); assert.ok(ids(e, 0).includes('I11') && ids(e, 1).includes('I11') && ids(e, 0).includes('I20') && ids(e, 1).includes('I17')); });
test('removed garments never come back: UNDRESS for a removed garment is not eligible and state only moves ON → OFF', () => {
  const e = mk({ level: 3, seed: 5 }); let prev = [DRESSED(), DRESSED()];
  for (const r of play(e, 120)) { for (const p of [0, 1]) for (const g of Object.keys(prev[p])) assert.ok(!(prev[p][g] !== 'ON' && e.clothing[p][g] === 'ON'), `${g} volvió`); prev = e.clothing.map(s => ({ ...s })); if (r.undress && r.undress.garment !== 'ANY') for (const p of r.undress.players) assert.equal(e.clothing[p][r.undress.garment], 'OFF'); }
  const f = mk({ level: 3, clothing: [{ top: 'OFF', bottoms: 'ON', socks: 'ON', underwear: 'ON' }, DRESSED()] }); assert.ok(!ids(f, 1).includes('U03'));
});
test('manual selection updates state immediately; underwear only after bottoms', () => {
  const e = mk({ level: 3 }); assert.deepEqual(removableGarments(e.clothing[0]), ['top', 'bottoms', 'socks']);
  assert.equal(e.recordUndress(0, 'underwear'), false); assert.ok(e.recordUndress(0, 'bottoms')); assert.ok(e.recordUndress(0, 'underwear')); assert.equal(e.clothing[0].underwear, 'OFF'); assert.equal(e.recordUndress(0, 'bottoms'), false);
});
test('manual correction (••• → Estado de ropa) recalculates candidates', () => {
  const e = mk({ level: 3 }); assert.ok(!ids(e, 1).includes('I05'));
  e.setClothing(0, { top: 'OFF', bottoms: 'ON', socks: 'NONE', underwear: 'ON' }); assert.ok(ids(e, 1).includes('I05')); assert.ok(!ids(e, 1).includes('U03c'));
  e.setClothing(0, DRESSED()); assert.ok(!ids(e, 1).includes('I05'));
});
test('SKIN_ACCESS and UNDERWEAR_OFF block when due; THROUGH_CLOTHING works', () => {
  assert.equal(clothingFailure(['SKIN_ACCESS'], DRESSED(), ['back']), 'SKIN_ACCESS'); assert.equal(clothingFailure(['SKIN_ACCESS'], NOTOP(), ['back']), null);
  assert.equal(clothingFailure(['UNDERWEAR_OFF'], UND(), ['vulva']), 'UNDERWEAR_OFF'); assert.equal(clothingFailure(['UNDERWEAR_OFF'], NAKED(), ['vulva']), null);
  assert.equal(clothingFailure(['THROUGH_CLOTHING'], NAKED(), ['vulva']), 'THROUGH_CLOTHING'); assert.equal(clothingFailure(['THROUGH_CLOTHING'], UND(), ['vulva']), null);
  assert.ok(!partAccessible('vulva', UND()) && partAccessible('vulva', NAKED()) && partAccessible('feet', { ...DRESSED(), socks: 'NONE' }));
});
test('asymmetric states are supported in both directions', () => {
  const e = mk({ level: 3, clothing: [NAKED(), DRESSED()] });
  assert.ok(ids(e, 1).includes('I11') && !ids(e, 0).includes('I04')); assert.ok(ids(e, 0).includes('U02') && !ids(e, 1).includes('U02')); assert.equal(band(NAKED(), DRESSED()), 'I-B');
});
test('body part exists ≠ accessible: an intimate card without explicit requirement would still be blocked', () => {
  const c = { ...CARD.I18, clothing: { actor: ['ANY'], receiver: ['ANY'] } };
  const e = mk({ level: 3, clothing: [UND(), DRESSED()] }); const d = buildDeck([c], e.context(1)); assert.equal(d.eligible.length, 0); assert.equal(d.rejected[0].reason, 'BODY_NOT_AVAILABLE');
});
