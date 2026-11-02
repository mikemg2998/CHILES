/* V4 · capas de ropa: exterior → interior → piel. Pantalón para ambos; panties / calzoncillos solo se quitan con el pantalón fuera;
   THROUGH_GARMENT; coverage por prenda; cooldown de la siguiente capa; cada capa cambia la baraja.
   Las cartas reales son I22 (THROUGH_BOXERS) e I23 (THROUGH_PANTIES); el mecanismo se prueba además con dos cartas FICTICIAS que
   solo existen en este archivo y nunca entran en la app. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED } from '../content/index.js';
import { card, THROUGH_GARMENT, throughGarmentOf } from '../content/schema.js';
import { GARMENTS, GARMENT_LAYERS, UNDERWEAR_GARMENTS, garmentsFor } from '../content/body.js';
import { buildDeck, weighDeck, undressCooldown } from '../engine/deck.js';
import { coverage, removableGarments, clothingFailure, throughGarment } from '../engine/clothing.js';
import { History } from '../engine/history.js';
import { mk, play, NAKED, DRESSED } from './helpers.js';

const FIX_PANTIES = card({ id: 'FIX_TP', level: 3, status: 'APPROVED', family: 'MANUAL', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'vulva' }], clothing: { receiver: [THROUGH_GARMENT('panties')] }, durations: [30], copy: ['(ficticia de test) {R} panties'] });
const FIX_BOXERS = card({ id: 'FIX_TB', level: 3, status: 'APPROVED', family: 'MANUAL', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'penis' }], clothing: { receiver: [THROUGH_GARMENT('boxers')] }, durations: [30], copy: ['(ficticia de test) {R} calzoncillos'] });
const WITH_FIX = [...CARDS, FIX_PANTIES, FIX_BOXERS];
const DIRECT_LOWER = APPROVED.filter(c => c.level === 3 && c.receiverRequirements.some(r => ['vulva', 'penis', 'buttocks'].includes(r.part)) && !c.clothing.receiver.some(q => throughGarmentOf(q))).map(c => c.id);
const st = o => ({ top: 'OFF', bottoms: 'ON', socks: 'OFF', bra: 'OFF', panties: 'ON', boxers: 'ON', ...o });
const ids = (recv, actor, cards = WITH_FIX) => { const e = mk({ level: 3, seed: 1, clothing: actor === 1 ? [recv, NAKED()] : [NAKED(), recv] }); return new Set(buildDeck(cards, e.context(actor)).eligible.map(x => x.card.id)); };
const undressFor = (recv, actor) => { const e = mk({ level: 3, seed: 1, clothing: actor === 1 ? [recv, NAKED()] : [NAKED(), recv] }); return new Set(buildDeck(CARDS, e.context(actor)).eligible.filter(x => x.card.interactionType === 'UNDRESS').map(x => x.card.id)); };

test('PANTALÓN exists for both players, and every garment has a layer', () => {
  for (const d of [['vulva', 'senos'], ['pene'], ['vulva'], ['pene', 'senos'], []]) assert.ok(garmentsFor(d).includes('bottoms') && garmentsFor(d).includes('top') && garmentsFor(d).includes('socks'), d.join());
  for (const g of GARMENTS) { assert.ok(GARMENT_LAYERS[g], g); assert.ok(['OUTER', 'UNDERWEAR'].includes(GARMENT_LAYERS[g].layer)); if (GARMENT_LAYERS[g].layer === 'UNDERWEAR') assert.ok(GARMENT_LAYERS[g].under && GARMENT_LAYERS[g].requiresOuterRemovedForUndress, g); }
  assert.deepEqual(UNDERWEAR_GARMENTS, ['bra', 'panties', 'boxers']); assert.equal(GARMENT_LAYERS.panties.under, 'bottoms'); assert.equal(GARMENT_LAYERS.boxers.under, 'bottoms'); assert.equal(GARMENT_LAYERS.bra.under, 'top');
  const e = mk({ level: 3, seed: 1 }); assert.ok(e.garments(0).includes('bottoms') && e.garments(1).includes('bottoms'));
});
test('coverage knows the layer and the garment responsible', () => {
  assert.deepEqual(coverage('vulva', st({ bottoms: 'ON', panties: 'ON' })), { access: 'COVERED_BY_OUTER', by: 'bottoms' });
  assert.deepEqual(coverage('vulva', st({ bottoms: 'OFF', panties: 'ON', boxers: 'NONE' })), { access: 'THROUGH_UNDERWEAR', by: 'panties' });
  assert.deepEqual(coverage('penis', st({ bottoms: 'OFF', boxers: 'ON', panties: 'NONE' })), { access: 'THROUGH_UNDERWEAR', by: 'boxers' });
  assert.deepEqual(coverage('vulva', st({ bottoms: 'OFF', panties: 'OFF', boxers: 'NONE' })), { access: 'DIRECT', by: null });
  assert.deepEqual(coverage('nipples', { ...NAKED(), top: 'OFF', bra: 'ON' }), { access: 'THROUGH_UNDERWEAR', by: 'bra' });
  assert.deepEqual(coverage('nipples', { ...NAKED(), top: 'ON', bra: 'OFF' }), { access: 'COVERED_BY_OUTER', by: 'top' });
  assert.deepEqual(coverage('abdomen', { ...NAKED(), top: 'OFF' }), { access: 'DIRECT', by: null });
});
test('THROUGH_GARMENT requirement: underwear on and its outer layer off; aliases resolve', () => {
  assert.equal(THROUGH_GARMENT('panties'), 'THROUGH_PANTIES'); assert.equal(throughGarmentOf('THROUGH_BOXERS'), 'boxers'); assert.equal(throughGarmentOf('SKIN_ACCESS'), null);
  assert.ok(throughGarment('panties', st({ bottoms: 'OFF' }))); assert.ok(!throughGarment('panties', st({ bottoms: 'ON' }))); assert.ok(!throughGarment('panties', st({ bottoms: 'OFF', panties: 'OFF' })));
  assert.equal(clothingFailure(['THROUGH_PANTIES'], st({ bottoms: 'ON' }), ['vulva'], { role: 'receiver' }), 'THROUGH_PANTIES');
  assert.equal(clothingFailure(['THROUGH_PANTIES'], st({ bottoms: 'OFF' }), ['vulva'], { role: 'receiver' }), null);
});
test('A · PANTALÓN ON + PANTIES ON: remove trousers eligible, remove panties not, THROUGH_PANTIES not', () => {
  const s = st({ bottoms: 'ON', panties: 'ON', boxers: 'NONE' });
  assert.ok(removableGarments(s).includes('bottoms')); assert.ok(!removableGarments(s).includes('panties'));
  const e = ids(s, 1); assert.ok(!e.has('FIX_TP')); for (const id of DIRECT_LOWER) assert.ok(!e.has(id), id);
  assert.ok(undressFor(s, 1).has('U02') && undressFor(s, 1).has('U04'), 'quitar una prenda (el pantalón es la única opción de abajo) es elegible');
});
test('B · PANTALÓN OFF + PANTIES ON: THROUGH_PANTIES eligible, remove panties possible, direct access blocked', () => {
  const s = st({ bottoms: 'OFF', panties: 'ON', boxers: 'NONE' });
  assert.ok(removableGarments(s).includes('panties'));
  const e = ids(s, 1); assert.ok(e.has('FIX_TP')); assert.ok(e.has('I23'), 'I23 real'); for (const id of DIRECT_LOWER) assert.ok(!e.has(id), id);
});
test('C · PANTALÓN OFF + PANTIES OFF: THROUGH_PANTIES gone, direct access appears', () => {
  const s = st({ bottoms: 'OFF', panties: 'OFF', boxers: 'NONE' });
  const e = ids(s, 1); assert.ok(!e.has('FIX_TP') && !e.has('I23')); for (const id of ['I11', 'I13', 'I15', 'I18', 'I06', 'I19']) assert.ok(e.has(id), id);
});
test('D · PANTALÓN ON + CALZONCILLOS ON: remove trousers eligible, remove boxers blocked', () => {
  const s = st({ bottoms: 'ON', boxers: 'ON', panties: 'NONE' });
  assert.ok(removableGarments(s).includes('bottoms')); assert.ok(!removableGarments(s).includes('boxers'));
  const e = ids(s, 0); assert.ok(!e.has('FIX_TB')); for (const id of ['I11', 'I12', 'I13', 'I15', 'I06', 'I19']) assert.ok(!e.has(id), id);
});
test('E · PANTALÓN OFF + CALZONCILLOS ON: THROUGH_BOXERS eligible, direct access blocked', () => {
  const s = st({ bottoms: 'OFF', boxers: 'ON', panties: 'NONE' });
  const e = ids(s, 0); assert.ok(e.has('FIX_TB')); assert.ok(e.has('I22'), 'I22 real'); for (const id of ['I11', 'I12', 'I13', 'I15', 'I06', 'I19']) assert.ok(!e.has(id), id);
});
test('F · PANTALÓN OFF + CALZONCILLOS OFF: THROUGH_BOXERS gone, direct access appears', () => {
  const s = st({ bottoms: 'OFF', boxers: 'OFF', panties: 'NONE' });
  const e = ids(s, 0); assert.ok(!e.has('FIX_TB') && !e.has('I22')); for (const id of ['I11', 'I12', 'I13', 'I15', 'I06', 'I19']) assert.ok(e.has(id), id);
});
test('G · H · I · torso: top ON + bra ON → nothing; top OFF + bra ON → THROUGH_BRA only; top OFF + bra OFF → direct only', () => {
  const chest = ['I03', 'I08', 'I09', 'I10', 'I17'];
  const g = ids({ ...NAKED(), top: 'ON', bra: 'ON' }, 1, CARDS); assert.ok(!g.has('I21')); for (const id of chest) assert.ok(!g.has(id), id);
  const h = ids({ ...NAKED(), top: 'OFF', bra: 'ON' }, 1, CARDS); assert.ok(h.has('I21')); for (const id of chest) assert.ok(!h.has(id), id);
  const i = ids({ ...NAKED(), top: 'OFF', bra: 'OFF' }, 1, CARDS); assert.ok(!i.has('I21')); for (const id of chest) assert.ok(i.has(id), id);
});
test('a normal UNDRESS never removes underwear still covered, nor two layers at once', () => {
  for (let s = 0; s < 10; s++) {
    const e = mk({ level: 3, seed: 700 + s }); let prev = e.clothing.map(c => ({ ...c }));
    for (let i = 0; i < 40; i++) {
      if (e.pauseDue()) e.continueGuided();
      const r = e.roll(); if (!r) break;
      if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
      for (const p of [0, 1]) { const now = e.clothing[p], changed = GARMENTS.filter(g => prev[p][g] !== now[g]); assert.ok(changed.length <= 1, `dos capas a la vez: ${changed}`); for (const g of changed) { assert.equal(now[g], 'OFF'); if (GARMENT_LAYERS[g].under) assert.equal(prev[p][GARMENT_LAYERS[g].under], 'OFF', `${g} se quitó con ${GARMENT_LAYERS[g].under} puesto`); } }
      prev = e.clothing.map(c => ({ ...c }));
    }
  }
});
test('three different decks: trousers on + panties on ≠ trousers off + panties on ≠ trousers off + panties off (same for boxers)', () => {
  const key = s => [...ids(s, 1)].sort().join(' ');
  const a = key(st({ bottoms: 'ON', panties: 'ON', boxers: 'NONE' })), b = key(st({ bottoms: 'OFF', panties: 'ON', boxers: 'NONE' })), c = key(st({ bottoms: 'OFF', panties: 'OFF', boxers: 'NONE' }));
  assert.notEqual(a, b); assert.notEqual(b, c); assert.notEqual(a, c);
  const k0 = s => [...ids(s, 0)].sort().join(' ');
  const d = k0(st({ bottoms: 'ON', boxers: 'ON', panties: 'NONE' })), e = k0(st({ bottoms: 'OFF', boxers: 'ON', panties: 'NONE' })), f = k0(st({ bottoms: 'OFF', boxers: 'OFF', panties: 'NONE' }));
  assert.notEqual(d, e); assert.notEqual(e, f); assert.notEqual(d, f);
});
test('sameRegionUndressCooldown: right after the trousers come off, removing the panties weighs little; it recovers with time; outer options are never penalized', () => {
  const H = new History(); const clothing = [st({ bottoms: 'OFF', panties: 'ON', boxers: 'NONE', top: 'ON', bra: 'ON' }), NAKED()];
  H.recordClothingChange({ player: 0, garment: 'bottoms', round: 10 });
  const u = (id, round) => undressCooldown(CARD[id], { history: H, round, actor: 1, clothing });
  assert.equal(u('U02', 11), 1, 'U02 (quien recibe se quita una prenda) tiene alternativas exteriores (camiseta) → sin penalización'); // top ON → removable = [top, panties]
  const onlyInner = [st({ bottoms: 'OFF', panties: 'ON', boxers: 'NONE', top: 'OFF', bra: 'NONE', socks: 'OFF' }), NAKED()];
  const v = (id, round) => undressCooldown(CARD[id], { history: H, round, actor: 1, clothing: onlyInner });
  assert.equal(v('U02', 11), 0.15); assert.equal(v('U02', 13), 0.35); assert.equal(v('U02', 15), 0.7); assert.equal(v('U02', 17), 1);
  assert.equal(v('I05', 11), 1, 'solo afecta a UNDRESS');
  assert.equal(undressCooldown(CARD.U02, { history: H, round: 11, actor: 1, clothing: [st({ bottoms: 'OFF', panties: 'ON', boxers: 'NONE', top: 'ON', bra: 'ON' }), NAKED()] }), 1, 'con la camiseta aún puesta hay una prenda exterior que quitar: sin cooldown');
});
test('intermediate phase really exists: after the trousers come off, the underwear stays on for a while (weighting, not a fixed count)', () => {
  let gaps = [], immediate = 0, n = 0;
  for (let s = 0; s < 60; s++) {
    const e = mk({ level: 3, seed: 900 + s }); const rs = play(e, 40); const log = e.history.recentClothingChanges.slice().reverse();
    for (const p of [0, 1]) { const b = log.find(c => c.player === p && c.garment === 'bottoms'), u = log.find(c => c.player === p && ['panties', 'boxers'].includes(c.garment)); if (b && u) { n++; const gap = u.round - b.round; gaps.push(gap); if (gap <= 1) immediate++; } }
  }
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  assert.ok(n > 30, `casos ${n}`); assert.ok(avg >= 3, `media de cartas entre pantalón y ropa interior ${avg.toFixed(2)}`); assert.ok(immediate / n < 0.2, `inmediato ${immediate}/${n}`);
});
test('newlyUnlockedWeightBoost applies to THROUGH_GARMENT cards unlocked by removing the outer layer', () => {
  const e = mk({ level: 3, seed: 5, clothing: [st({ bottoms: 'ON', panties: 'ON', boxers: 'NONE' }), NAKED()] });
  const before = new Set(buildDeck(WITH_FIX, e.context(1)).eligible.map(x => x.card.id)); assert.ok(!before.has('FIX_TP'));
  e.recordUndress(0, 'bottoms'); e.unlocked.set('FIX_TP', e.state.round + 3); // el motor marca lo desbloqueado del catálogo real; la ficticia se marca a mano
  const w = weighDeck(buildDeck(WITH_FIX, e.context(1)), { history: e.history, session: e.session, director: null, purpose: 'EXPLORE', unlocked: e.unlocked, round: e.state.round, actor: 1, clothing: e.clothing });
  assert.equal(w.find(x => x.card.id === 'FIX_TP').factors.unlocked, 1.6); assert.equal(w.find(x => x.card.id === 'I05').factors.unlocked, 1);
});
