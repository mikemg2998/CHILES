/* El brasier en la experiencia real: prendas aplicables por jugador (Ajustes o configuración corporal), migración de guardados
   antiguos sin `underwear`, y acceso al pecho por estado. Una sola fuente de verdad: engine.garments(p). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS } from '../content/index.js';
import { PreferenceManager } from '../engine/prefs.js';
import { GameEngine } from '../engine/engine.js';
import { buildDeck } from '../engine/deck.js';
import { chestAccess } from '../engine/clothing.js';

const CHEST_DIRECT = ['I03', 'I08', 'I09', 'I10', 'I17'];
const eng = (data, level = 3) => new GameEngine({ prefs: new PreferenceManager(data), seed: 1, level });
const eligibleFor = (e, actor) => new Set(buildDeck(CARDS, e.context(actor)).eligible.map(x => x.card.id));

test('A · a player with bra applicable gets Brasier in the garment list from the start (vulva + senos, and vulva alone)', () => {
  for (const bp of [['vulva', 'senos'], ['vulva'], ['pene', 'senos']]) { const e = eng({ names: ['Val', 'Mike'], bodyParts: [bp, ['pene']] }); assert.ok(e.garments(0).includes('bra'), bp.join()); assert.equal(e.clothing[0].bra, 'ON', bp.join()); }
  const e = eng({ names: ['Val', 'Mike'], bodyParts: [['vulva', 'senos'], ['pene']] });
  assert.deepEqual(e.garments(0), ['top', 'bottoms', 'socks', 'bra', 'panties']); assert.deepEqual(e.garments(1), ['top', 'bottoms', 'socks', 'boxers']);
});
test('B · TOP ON + BRA ON: no direct chest access', () => {
  const e = eng({ names: ['Val', 'Mike'], bodyParts: [['vulva'], ['pene']] }); assert.equal(chestAccess(e.clothing[0]), 'COVERED_BY_TOP');
  const ids = eligibleFor(e, 1); for (const id of [...CHEST_DIRECT, 'I21']) assert.ok(!ids.has(id), id);
});
test('C · TOP OFF + BRA ON: THROUGH_BRA eligible, direct chest access blocked', () => {
  const e = eng({ names: ['Val', 'Mike'], bodyParts: [['vulva', 'senos'], ['pene']] }); e.setClothing(0, { ...e.clothing[0], top: 'OFF' });
  assert.equal(e.clothing[0].bra, 'ON', 'quitar la camiseta nunca quita el brasier'); assert.equal(chestAccess(e.clothing[0]), 'COVERED_BY_BRA');
  const ids = eligibleFor(e, 1); assert.ok(ids.has('I21')); for (const id of CHEST_DIRECT) assert.ok(!ids.has(id), id);
});
test('D · TOP OFF + BRA OFF: THROUGH_BRA blocked, direct chest access eligible', () => {
  const e = eng({ names: ['Val', 'Mike'], bodyParts: [['vulva', 'senos'], ['pene']] }); e.setClothing(0, { ...e.clothing[0], top: 'OFF', bra: 'OFF' });
  assert.equal(chestAccess(e.clothing[0]), 'DIRECT'); const ids = eligibleFor(e, 1); assert.ok(!ids.has('I21')); for (const id of CHEST_DIRECT) if (id !== 'I17') assert.ok(ids.has(id), id); // I17 además necesita a Mike desnudo (glande)
});
test('E · old saved prefs without `underwear` (schema 4, or legacy anatomy F/M) migrate: bra applicable, never read as «no la llevo»', () => {
  const old4 = new PreferenceManager({ names: ['Val', 'Mike'], mode: 'intimidad', bodyParts: [['vulva'], ['pene']] });
  assert.deepEqual(old4.underwear, [null, null]); assert.deepEqual(old4.underwearFor(0), ['bra', 'panties']); assert.deepEqual(old4.underwearFor(1), ['boxers']);
  const e = new GameEngine({ prefs: old4, seed: 1, level: 3 }); assert.equal(e.clothing[0].bra, 'ON'); assert.ok(e.garments(0).includes('bra'));
  const legacy = new PreferenceManager({ names: ['Val', 'Mike'], anatomy: ['F', 'M'] }); assert.deepEqual(legacy.underwearFor(0), ['bra', 'panties']); assert.deepEqual(legacy.underwearFor(1), ['boxers']);
  const saved = JSON.parse(JSON.stringify(old4)); assert.ok('underwear' in saved); const again = new PreferenceManager(saved); assert.deepEqual(again.underwearFor(0), ['bra', 'panties']);
  const explicit = new PreferenceManager({ bodyParts: [['vulva'], ['pene']], underwear: [['panties'], ['boxers']] }); assert.deepEqual(explicit.underwearFor(0), ['panties'], 'lo que el jugador quitó en Ajustes se respeta');
});
test('F · a player without bra applicable never shows Brasier; choosing it in Ajustes adds it regardless of anatomy', () => {
  const e = eng({ names: ['Val', 'Mike'], bodyParts: [['vulva', 'senos'], ['pene']] }); assert.ok(!e.garments(1).includes('bra')); assert.equal(e.clothing[1].bra, 'NONE');
  e.prefs.underwear = [null, ['bra', 'boxers']]; e.syncClothing(); assert.ok(e.garments(1).includes('bra')); assert.equal(e.clothing[1].bra, 'ON', 'al volverse aplicable empieza puesta');
  e.prefs.underwear = [['panties'], null]; e.syncClothing(); assert.ok(!e.garments(0).includes('bra')); assert.equal(e.clothing[0].bra, 'NONE');
});
test('UNDRESS never skips the top to remove the bra; with the top off the bra is offered', () => {
  const e = eng({ names: ['Val', 'Mike'], bodyParts: [['vulva'], ['pene']] });
  assert.ok(!e.removable(0).includes('bra')); e.recordUndress(0, 'top'); assert.ok(e.removable(0).includes('bra')); assert.equal(e.clothing[0].bra, 'ON');
});
