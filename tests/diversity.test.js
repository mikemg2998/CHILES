/* Corrección V3 · diversidad corporal: regiones, starvation, desbloqueo temporal, íntimo sin prioridad automática, prendas */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED, regionOf } from '../content/index.js';
import { BODY_PARTS, BODY_REGIONS, garmentsFor } from '../content/body.js';
import { buildDeck, weighDeck } from '../engine/deck.js';
import { History } from '../engine/history.js';
import { fullAccess } from '../engine/clothing.js';
import { mk, play, DRESSED, NAKED } from './helpers.js';
import { GameEngine } from '../engine/engine.js';

test('every body part has a BodyRegion and every card resolves to one', () => {
  for (const [id, p] of Object.entries(BODY_PARTS)) assert.ok(BODY_REGIONS.includes(p.region), `${id} → ${p.region}`);
  for (const c of CARDS) assert.ok(BODY_REGIONS.includes(regionOf(c, null)), c.id);
});

test('weighting factors are independent: region, target, starvation and unlock are separate multipliers, never one score', () => {
  const e = mk({ level: 3, seed: 1, clothing: [NAKED(), NAKED()] });
  const deck = buildDeck(CARDS, e.context(1)); const H = new History(); // Leo actúa, Ana (vulva · senos) recibe
  const w0 = weighDeck(deck, { history: H, session: e.session, director: null, purpose: 'EXPLORE' });
  for (const x of w0) { for (const k of ['base', 'cardRecency', 'family', 'region', 'starvation', 'target', 'type', 'unlocked', 'purpose', 'favor']) assert.ok(k in x.factors, `${x.card.id} ${k}`); assert.equal(x.factors.region, 1); assert.equal(x.factors.target, 1); }
  // la región de la última carta pesa menos; la carta anterior nunca repite
  const last = w0.find(x => regionOf(x.card, null) === 'CHEST');
  H.push({ cardId: last.card.id, family: last.card.family, region: 'CHEST', parts: ['nipples'], actor: 1, receiver: 0 });
  const w1 = weighDeck(deck, { history: H, session: e.session, director: null, purpose: 'EXPLORE' });
  for (const x of w1) { if (x.card.id === last.card.id) assert.equal(x.factors.cardRecency, 0); else if (regionOf(x.card, null) === 'CHEST') assert.ok(x.factors.region < 1, x.card.id); else assert.equal(x.factors.region, 1, x.card.id); if (x.card.receiverRequirements.some(r => r.part === 'nipples') && x.card.id !== last.card.id) assert.ok(x.factors.target < 1, x.card.id); }
});

test('bodyRegionStarvation: a region with eligible cards that has not appeared for long gets a moderate boost, never a guarantee', () => {
  const e = mk({ level: 3, seed: 2, clothing: [NAKED(), NAKED()] });
  const deck = buildDeck(CARDS, e.context(0)); const H = new History();
  for (let i = 0; i < 10; i++) H.push({ cardId: `X${i}`, family: 'Boca', region: i % 2 ? 'NECK' : 'FACE', parts: ['neck'], actor: 0, receiver: 1 });
  const w = weighDeck(deck, { history: H, session: e.session, director: null, purpose: 'EXPLORE' });
  const starved = w.filter(x => !['NECK', 'FACE', 'FULL_BODY'].includes(regionOf(x.card, null)) && x.card.interactionType !== 'UNDRESS');
  assert.ok(starved.length > 5);
  for (const x of starved) { assert.equal(x.factors.starvation, 1.5, x.card.id); assert.equal(x.factors.region, 1.25, x.card.id); }
  for (const x of w.filter(x => ['NECK', 'FACE'].includes(regionOf(x.card, null)))) assert.equal(x.factors.starvation, 1, x.card.id);
  const total = w.reduce((a, b) => a + b.weight, 0), sv = starved.reduce((a, b) => a + b.weight, 0);
  assert.ok(sv / total < 0.98, 'una región hambrienta no monopoliza el mazo');
});

test('INTIMATE has no automatic priority: with full access, intimate cards weigh like the rest per card', () => {
  const e = mk({ level: 3, seed: 3, clothing: [NAKED(), NAKED()] });
  const w = weighDeck(buildDeck(CARDS, e.context(0)), { history: new History(), session: e.session, director: null, purpose: 'EXPLORE' });
  const avg = xs => xs.reduce((a, b) => a + b.weight, 0) / xs.length;
  const intimate = w.filter(x => regionOf(x.card, null) === 'INTIMATE'), rest = w.filter(x => regionOf(x.card, null) !== 'INTIMATE' && x.card.interactionType !== 'UNDRESS');
  assert.ok(intimate.length && rest.length); assert.ok(avg(intimate) <= avg(rest) * 1.05, `íntimo ${avg(intimate)} vs resto ${avg(rest)}`);
  for (const x of intimate) assert.equal(x.factors.purpose, 1);
});

test('newlyUnlockedWeightBoost: cards unlocked by a clothing change get a moderate boost that expires after a few draws', () => {
  const e = mk({ level: 3, seed: 4 });
  assert.equal(e.unlocked.size, 0);
  const before = e.eligibleIds();
  e.recordUndress(0, 'top'); e.recordUndress(0, 'bra'); // Ana (senos): se desbloquean las cartas de senos y pezones
  const now = new Set([...e.eligibleIds()].filter(id => !before.has(id)));
  assert.ok(now.size >= 3, `desbloqueadas ${[...now]}`);
  for (const id of now) assert.equal(e.unlocked.get(id), e.state.round + 3);
  const deck = buildDeck(CARDS, e.context(1));
  const w = weighDeck(deck, { history: e.history, session: e.session, director: null, purpose: 'EXPLORE', unlocked: e.unlocked, round: e.state.round });
  for (const x of w) assert.equal(x.factors.unlocked, now.has(x.card.id) ? 1.6 : 1, x.card.id);
  const later = weighDeck(deck, { history: e.history, session: e.session, director: null, purpose: 'EXPLORE', unlocked: e.unlocked, round: e.state.round + 3 });
  for (const x of later) assert.equal(x.factors.unlocked, 1, x.card.id);
  // el empujón no garantiza nada: en 20 sesiones la primera carta tras desbloquear no es siempre una desbloqueada
  let first = 0; for (let s = 0; s < 20; s++) { const f = mk({ level: 3, seed: 200 + s }); const b = f.eligibleIds(); f.recordUndress(0, 'top'); f.recordUndress(0, 'bra'); const n = new Set([...f.eligibleIds()].filter(id => !b.has(id))); const r1 = f.roll(), r2 = f.roll(); if (n.has(r1.cardId) || n.has(r2.cardId)) first++; } // la primera tirada puede ser de Ana (actúa), así que miramos dos
  assert.ok(first > 0 && first < 20, `desbloqueada primero ${first}/20`);
});

test('fullAccess ≠ more explicit: with full access the intimate region does not dominate Intimidad', () => {
  const counts = {}; let n = 0;
  for (let s = 0; s < 8; s++) { const e = mk({ level: 3, seed: 300 + s, clothing: [NAKED(), NAKED()] }); for (const r of play(e, 60, { undress: false })) { n++; const g = regionOf(CARD[r.cardId], r.variantId ? CARD[r.cardId].variants.find(v => v.id === r.variantId) : null); counts[g] = (counts[g] || 0) + 1; } }
  assert.ok(counts.INTIMATE / n < 0.33, `INTIMATE ${counts.INTIMATE}/${n}`);
  for (const g of ['CHEST', 'ABDOMEN', 'NECK', 'HIPS_GLUTES', 'THIGHS_LEGS']) assert.ok((counts[g] || 0) / n > 0.05, `${g} ${counts[g]}/${n}`);
});

test('garments follow anatomy or the player\'s own choice, never gender', () => {
  assert.deepEqual(garmentsFor(['vulva', 'senos']), ['top', 'bottoms', 'socks', 'bra', 'panties']);
  assert.deepEqual(garmentsFor(['pene']), ['top', 'bottoms', 'socks', 'boxers']);
  assert.deepEqual(garmentsFor(['pene', 'senos']), ['top', 'bottoms', 'socks', 'bra', 'boxers']);
  assert.deepEqual(garmentsFor(['vulva']), ['top', 'bottoms', 'socks', 'bra', 'panties']); // vulva sin marcar senos: el brasier se ofrece igualmente (se puede quitar en Ajustes)
  assert.deepEqual(garmentsFor(['vulva'], ['panties']), ['top', 'bottoms', 'socks', 'panties']); assert.deepEqual(garmentsFor(['pene'], ['bra', 'boxers']), ['top', 'bottoms', 'socks', 'bra', 'boxers']);
  const fa = fullAccess(['pene']); assert.equal(fa.bra, 'NONE'); assert.equal(fa.panties, 'NONE'); assert.equal(fa.boxers, 'OFF');
  const e = mk({ level: 3, seed: 5 }); assert.deepEqual(e.garments(0), ['top', 'bottoms', 'socks', 'bra', 'panties']); assert.deepEqual(e.garments(1), ['top', 'bottoms', 'socks', 'boxers']);
});

test('designer cards for hands, abdomen, back, arms, breasts, neck and legs are APPROVED and eligible where their region allows', () => {
  const must = { D07: 'ARMS_HANDS', I05: 'ABDOMEN', I02: 'NECK', I03: 'CHEST', I08: 'CHEST', I09: 'CHEST', I10: 'CHEST', I04: 'THIGHS_LEGS', I07: 'THIGHS_LEGS', I06: 'HIPS_GLUTES', I19: 'HIPS_GLUTES', I13: 'INTIMATE' };
  for (const [id, region] of Object.entries(must)) { assert.ok(CARD[id], id); assert.equal(CARD[id].status, 'APPROVED', id); assert.equal(regionOf(CARD[id], null), region, id); }
  const e = mk({ level: 3, seed: 6, clothing: [NAKED(), NAKED()] }); const ids = e.eligibleIds(); // elegibles con cualquiera de los dos actuando
  for (const id of Object.keys(must).filter(i => i[0] === 'I')) assert.ok(ids.has(id), `${id} no elegible`);
  const d = mk({ level: 2, seed: 6 }); assert.ok(buildDeck(APPROVED, d.context(0)).eligible.some(x => x.card.id === 'D07'));
});

test('anatomy declared after the engine exists: garments that become applicable start ON, never as «no la llevo»', () => {
  const e = new GameEngine({ prefs: { names: ['A', 'B'], bodyParts: [[], []] }, seed: 1, level: 3 });
  assert.equal(e.clothing[0].bra, 'NONE'); assert.equal(e.clothing[1].boxers, 'NONE');
  e.prefs.bodyParts = [['vulva', 'senos'], ['pene']];
  assert.deepEqual(e.garments(0), ['top', 'bottoms', 'socks', 'bra', 'panties']); e.syncClothing();
  assert.equal(e.clothing[0].bra, 'ON'); assert.equal(e.clothing[0].panties, 'ON'); assert.equal(e.clothing[1].boxers, 'ON'); assert.equal(e.clothing[1].panties, 'NONE');
  e.setClothing(0, { ...e.clothing[0], socks: 'NONE' }); e.syncClothing(); assert.equal(e.clothing[0].socks, 'NONE', 'lo que eligió la pareja se respeta');
});
