/* V4 · camiseta y brasier como capas dinámicas REALES. La baraja responde a la ropa que la persona lleva ahora: camiseta → piel
   (bra NOT_WORN) o camiseta → brasier → piel son recorridos válidos; el motor los descubre desde el ClothingState real.
   Estados: ON · OFF (se la quitó) · NOT_WORN (entró sin ella) · NONE (no aplica). THROUGH_TOP real: I25 (aprobada por el diseñador,
   Opción A: yemas sobre el pecho por encima de la camiseta, 30 s, con lado). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED } from '../content/index.js';
import { card, THROUGH_GARMENT, throughGarmentOf, CLOTHING_REQUIREMENTS } from '../content/schema.js';
import { GARMENT_STATES, NOT_APPLICABLE } from '../content/body.js';
import { buildDeck, weighDeck } from '../engine/deck.js';
import { coverage, accessMode, chestAccess, removableGarments, normalizeClothing, throughGarment } from '../engine/clothing.js';
import { PreferenceManager } from '../engine/prefs.js';
import { GameEngine } from '../engine/engine.js';
import { mk, NAKED, DRESSED } from './helpers.js';

const WITH_FIX = CARDS; // I25 es la carta THROUGH_TOP real
const CHEST_DIRECT = ['I03', 'I08', 'I09', 'I10']; // I17 además exige a quien actúa desnudo
const chest = o => ({ ...NAKED(), ...o });
const idsFor = (e, actor = 1, cards = WITH_FIX) => new Set(buildDeck(cards, e.context(actor)).eligible.map(x => x.card.id));
const eng = (recv, o = {}) => mk({ level: 3, seed: o.seed ?? 1, clothing: [recv, NAKED()], prefs: { bodyParts: [o.anatomy || ['vulva', 'senos'], ['pene']] } });
const expectChest = (ids, { throughTop, throughBra, direct }, label) => {
  assert.equal(ids.has('I25'), throughTop, `${label}: THROUGH_TOP`);
  assert.equal(ids.has('I21'), throughBra, `${label}: THROUGH_BRA`);
  for (const id of CHEST_DIRECT) assert.equal(ids.has(id), direct, `${label}: ${id} acceso directo`);
};

test('estados: ON · OFF · NOT_WORN · NONE existen y se normalizan sin confundir «no la llevo» con «no aplica»', () => {
  assert.deepEqual(GARMENT_STATES, ['ON', 'OFF', 'NOT_WORN', 'NONE']); assert.equal(NOT_APPLICABLE, 'NONE');
  const s = normalizeClothing({ top: 'ON', bra: 'NOT_WORN', bottoms: 'ON', socks: 'NONE', panties: 'OFF' }, ['vulva', 'senos']);
  assert.deepEqual(s, { top: 'ON', bottoms: 'ON', socks: 'NOT_WORN', bra: 'NOT_WORN', panties: 'OFF', boxers: 'NONE' }); // NONE sobre prenda aplicable = NOT_WORN; calzoncillos no aplican = NONE
  assert.equal(normalizeClothing({ bra: 'NOT_WORN' }, ['pene'], ['boxers']).bra, 'NONE', 'sin brasier en su configuración: no aplica, no «no la llevo»');
  assert.ok(CLOTHING_REQUIREMENTS.includes('THROUGH_TOP')); assert.equal(throughGarmentOf('THROUGH_TOP'), 'top'); assert.equal(THROUGH_GARMENT('top'), 'THROUGH_TOP');
});
test('access mode por capa: THROUGH_TOP · THROUGH_BRA · DIRECT_SKIN_ACCESS desde el estado real', () => {
  assert.equal(accessMode('nipples', chest({ top: 'ON', bra: 'ON' })), 'THROUGH_TOP');
  assert.equal(accessMode('nipples', chest({ top: 'ON', bra: 'NOT_WORN' })), 'THROUGH_TOP');
  assert.equal(accessMode('nipples', chest({ top: 'OFF', bra: 'ON' })), 'THROUGH_BRA');
  assert.equal(accessMode('nipples', chest({ top: 'OFF', bra: 'NOT_WORN' })), 'DIRECT_SKIN_ACCESS');
  assert.equal(accessMode('nipples', chest({ top: 'OFF', bra: 'OFF' })), 'DIRECT_SKIN_ACCESS');
  assert.equal(accessMode('nipples', chest({ top: 'OFF', bra: 'NONE' })), 'DIRECT_SKIN_ACCESS');
  assert.deepEqual(coverage('breasts', chest({ top: 'ON', bra: 'NOT_WORN' })), { access: 'COVERED_BY_OUTER', by: 'top', mode: 'THROUGH_TOP' });
  assert.ok(throughGarment('top', chest({ top: 'ON', bra: 'NOT_WORN' }), ['breasts'])); assert.ok(!throughGarment('top', chest({ top: 'OFF', bra: 'ON' }), ['breasts']));
  assert.ok(!throughGarment('top', chest({ top: 'ON' }), ['hands']), 'THROUGH_TOP solo sobre partes que la camiseta tapa');
  assert.ok(throughGarment('bra', chest({ top: 'OFF', bra: 'ON' }), ['nipples'])); assert.ok(!throughGarment('bra', chest({ top: 'ON', bra: 'ON' }), ['nipples']), 'con la camiseta puesta el brasier no es la capa exterior');
});

test('TEST 1 · senos + TOP ON + BRA NOT_WORN: THROUGH_TOP elegible; THROUGH_BRA y acceso directo bloqueados', () => {
  const e = eng(chest({ top: 'ON', bra: 'NOT_WORN' })); assert.equal(chestAccess(e.clothing[0]), 'COVERED_BY_TOP');
  expectChest(idsFor(e), { throughTop: true, throughBra: false, direct: false }, 'estado C');
  const rej = Object.fromEntries(buildDeck(WITH_FIX, e.context(1)).rejected.map(r => [r.id, r.reason]));
  assert.equal(rej.I21, 'CLOTHING:receiver:THROUGH_BRA'); assert.equal(rej.I03, 'CLOTHING:receiver:SKIN_ACCESS');
});
test('TEST 2 · quitar TOP sin brasier: acceso directo inmediato, sin paso de brasier, sin THROUGH_BRA, sin «quitar brasier»', () => {
  const e = eng(chest({ top: 'ON', bra: 'NOT_WORN' }));
  assert.ok(e.recordUndress(0, 'top')); assert.deepEqual([e.clothing[0].top, e.clothing[0].bra], ['OFF', 'NOT_WORN']);
  assert.equal(accessMode('nipples', e.clothing[0]), 'DIRECT_SKIN_ACCESS');
  expectChest(idsFor(e), { throughTop: false, throughBra: false, direct: true }, 'estado D');
  assert.ok(!removableGarments(e.clothing[0]).includes('bra')); assert.ok(!e.removable(0).includes('bra'));
  const w = weighDeck(buildDeck(CARDS, e.context(1)), { history: e.history, session: e.session, director: null, purpose: 'MAINTAIN', unlocked: e.unlocked, round: e.state.round, actor: 1, clothing: e.clothing });
  for (const id of CHEST_DIRECT) assert.equal(w.find(x => x.card.id === id).factors.unlocked, 1.6, `${id} recién desbloqueada`);
});
test('TEST 3 · senos + TOP ON + BRA ON: THROUGH_TOP elegible; THROUGH_BRA y acceso directo bloqueados (la camiseta sigue siendo la capa exterior)', () => {
  const e = eng(chest({ top: 'ON', bra: 'ON' })); expectChest(idsFor(e), { throughTop: true, throughBra: false, direct: false }, 'estado A');
});
test('TEST 4 · quitar TOP con brasier: THROUGH_BRA elegible, acceso directo bloqueado, THROUGH_TOP fuera', () => {
  const e = eng(chest({ top: 'ON', bra: 'ON' })); assert.ok(e.recordUndress(0, 'top')); assert.deepEqual([e.clothing[0].top, e.clothing[0].bra], ['OFF', 'ON']);
  assert.equal(accessMode('nipples', e.clothing[0]), 'THROUGH_BRA'); expectChest(idsFor(e), { throughTop: false, throughBra: true, direct: false }, 'estado B');
  assert.ok(e.removable(0).includes('bra'), 'ahora sí puede quitarse el brasier');
});
test('TEST 5 · quitar BRA: THROUGH_BRA bloqueado y acceso directo elegible inmediatamente, sin esperar otra ronda', () => {
  const e = eng(chest({ top: 'OFF', bra: 'ON' })); assert.ok(e.recordUndress(0, 'bra')); assert.deepEqual([e.clothing[0].top, e.clothing[0].bra], ['OFF', 'OFF']);
  expectChest(idsFor(e), { throughTop: false, throughBra: false, direct: true }, 'estado E');
  assert.equal(e.unlocked.has('I03'), true); assert.equal(e.unlocked.has('I21'), false);
});
test('TEST 6 · CHOOSE de prenda (U04/U06: la pareja elige) con TOP OFF + BRA ON: las opciones salen del estado real; elegir BRASIER recalcula antes de la siguiente carta', () => {
  const e = eng(chest({ top: 'OFF', bra: 'ON' }));
  const options = e.removable(0); assert.ok(options.includes('bra') && !options.includes('top'), 'opciones desde el estado real');
  const before = e.deck(1).eligible.map(x => x.card.id); assert.ok(before.includes('I21') && !before.includes('I03'));
  // la hoja «¿Qué se quitó?» aplica la elección exactamente así
  assert.ok(e.recordUndress(0, 'bra')); assert.equal(e.clothing[0].bra, 'OFF');
  const after = e.deck(1).eligible.map(x => x.card.id); assert.ok(!after.includes('I21') && after.includes('I03'), 'el candidate set se recalculó, no se reutiliza el anterior');
  const r = e.roll(); assert.ok(r && r.cardId !== 'I21', 'la siguiente carta ya usa el nuevo ClothingState');
});
test('TEST 7 · BRA NOT_WORN: ninguna carta UNDRESS ofrece el brasier en toda la sesión, ni lo convierte en ON', () => {
  const e = eng(chest({ top: 'ON', bra: 'NOT_WORN', bottoms: 'ON', panties: 'ON', socks: 'ON' }), { seed: 3 });
  for (let i = 0; i < 60; i++) {
    assert.ok(!e.removable(0).includes('bra'), `ronda ${i}: brasier ofrecido`);
    for (const a of [0, 1]) for (const x of buildDeck(CARDS, e.context(a)).eligible) if (x.card.interactionType === 'UNDRESS') assert.notEqual(x.card.undress.garment, 'bra');
    assert.equal(e.clothing[0].bra, 'NOT_WORN');
    const r = e.roll(); if (!r) break;
    if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
    if (e.pauseDue()) e.continueGuided();
  }
  assert.equal(e.clothing[0].bra, 'NOT_WORN'); assert.ok(!e.recordUndress(0, 'bra'), 'ni siquiera a la fuerza');
});
test('TEST 8 · sin senos declarados: la ropa se representa igual, pero ninguna carta dirigida a senos/pezones sale en ningún estado', () => {
  for (const st of [chest({ top: 'ON', bra: 'ON' }), chest({ top: 'ON', bra: 'NOT_WORN' }), chest({ top: 'OFF', bra: 'ON' }), chest({ top: 'OFF', bra: 'NOT_WORN' }), chest({ top: 'OFF', bra: 'OFF' })]) {
    const e = eng(st, { anatomy: ['vulva'] }); assert.equal(e.clothing[0].bra, st.bra, 'el brasier sigue en el estado (lo decide la ropa interior configurada, no la anatomía)');
    const ids = idsFor(e); for (const id of ['I25', 'I21', ...CHEST_DIRECT]) assert.ok(!ids.has(id), `${id} con bra=${st.bra} top=${st.top}`);
    const rej = Object.fromEntries(buildDeck(WITH_FIX, e.context(1)).rejected.map(r => [r.id, r.reason])); assert.equal(rej.I21, 'RECEIVER_ANATOMY'); assert.equal(rej.I25, 'RECEIVER_ANATOMY');
  }
});

test('matriz A–E completa en una sola tabla', () => {
  const M = [['A', { top: 'ON', bra: 'ON' }, { throughTop: true, throughBra: false, direct: false }], ['B', { top: 'OFF', bra: 'ON' }, { throughTop: false, throughBra: true, direct: false }],
    ['C', { top: 'ON', bra: 'NOT_WORN' }, { throughTop: true, throughBra: false, direct: false }], ['D', { top: 'OFF', bra: 'NOT_WORN' }, { throughTop: false, throughBra: false, direct: true }],
    ['E', { top: 'OFF', bra: 'OFF' }, { throughTop: false, throughBra: false, direct: true }]];
  for (const [k, st, exp] of M) expectChest(idsFor(eng(chest(st))), exp, `estado ${k}`);
});
test('OFF ≠ NOT_WORN en el historial: quitarse el brasier queda registrado; entrar sin él, no', () => {
  const a = eng(chest({ top: 'OFF', bra: 'ON' })); a.recordUndress(0, 'bra');
  assert.deepEqual(a.history.recentClothingChanges[0].changes, [{ garment: 'bra', from: 'ON', to: 'OFF' }]);
  const b = eng(chest({ top: 'OFF', bra: 'ON' })); b.setClothing(0, { ...b.clothing[0], bra: 'NOT_WORN' });
  assert.deepEqual(b.history.recentClothingChanges[0].changes, [{ garment: 'bra', from: 'ON', to: 'NOT_WORN' }]); assert.equal(b.history.recentClothingChanges[0].manual, true);
  assert.deepEqual(idsFor(a), idsFor(b), 'mismo acceso directo con historias distintas');
});
test('corrección manual recalcula al momento en ambos sentidos: BRA ON → OFF y BRA NOT_WORN → ON', () => {
  const e = eng(chest({ top: 'OFF', bra: 'ON' })); assert.ok(idsFor(e).has('I21'));
  e.setClothing(0, { ...e.clothing[0], bra: 'OFF' }); expectChest(idsFor(e), { throughTop: false, throughBra: false, direct: true }, 'manual ON→OFF');
  e.setClothing(0, { ...e.clothing[0], bra: 'NOT_WORN' }); expectChest(idsFor(e), { throughTop: false, throughBra: false, direct: true }, 'manual OFF→NOT_WORN');
  e.setClothing(0, { ...e.clothing[0], bra: 'ON' }); expectChest(idsFor(e), { throughTop: false, throughBra: true, direct: false }, 'manual NOT_WORN→ON'); assert.ok(e.removable(0).includes('bra'));
});
test('cadena no dominante: tras quitar la camiseta y descubrir el brasier, quitar el brasier pesa poco unas cartas (peso, no veto)', () => {
  const gaps = [];
  for (let seed = 1; seed <= 40; seed++) {
    const e = mk({ level: 3, seed, clothing: [{ ...DRESSED(), socks: 'OFF', bottoms: 'OFF', panties: 'OFF' }, NAKED()] }); let topAt = null;
    for (let i = 0; i < 40 && topAt === null; i++) { const r = e.roll(); if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); } if (e.clothing[0].top === 'OFF') topAt = e.state.round; if (e.pauseDue()) e.continueGuided(); }
    if (topAt === null) continue;
    for (let i = 0; i < 40 && e.clothing[0].bra === 'ON'; i++) { const r = e.roll(); if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); } if (e.pauseDue()) e.continueGuided(); }
    if (e.clothing[0].bra === 'OFF') gaps.push(e.state.round - topAt);
  }
  assert.ok(gaps.length >= 10, `pocas sesiones medibles: ${gaps.length}`);
  assert.ok(gaps.filter(g => g <= 1).length / gaps.length < 0.15, `camiseta→brasier seguidas en ${gaps.filter(g => g <= 1).length}/${gaps.length}`);
  assert.ok(gaps.some(g => g <= 7), 'no es un bloqueo rígido: a veces ocurre pronto'); /* ≤ 7 (antes ≤ 5): con I63/I64 siempre disponibles (2026-11-04) el mazo crece y el hueco mínimo pasa de 5 a 6 con estas semillas, sin tocar UNDRESS */ assert.ok(gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)] <= 15, 'y nunca se eterniza'); // mediana real del motor anterior (d6ae93f, 400 semillas): 13; con 40 semillas oscila 12–14
});
test('la lógica inferior no cambia: pantalón → panties/calzoncillos → acceso directo (I22/I23 THROUGH_*)', () => {
  const lower = o => ({ ...NAKED(), ...o });
  const l = (recv, actor, anatomy) => { const e = mk({ level: 3, seed: 1, clothing: actor === 1 ? [recv, NAKED()] : [NAKED(), recv], prefs: { bodyParts: anatomy } }); return idsFor(e, actor, CARDS); };
  const A = [['vulva', 'senos'], ['pene']];
  assert.ok(!l(lower({ bottoms: 'ON', panties: 'ON' }), 1, A).has('I23') && !l(lower({ bottoms: 'ON', panties: 'ON' }), 1, A).has('I11'));
  assert.ok(l(lower({ bottoms: 'OFF', panties: 'ON' }), 1, A).has('I23') && !l(lower({ bottoms: 'OFF', panties: 'ON' }), 1, A).has('I11'));
  assert.ok(!l(lower({ bottoms: 'OFF', panties: 'OFF' }), 1, A).has('I23') && l(lower({ bottoms: 'OFF', panties: 'OFF' }), 1, A).has('I11'));
  assert.ok(l(lower({ bottoms: 'OFF', boxers: 'ON', panties: 'NONE' }), 0, A).has('I22') && !l(lower({ bottoms: 'OFF', boxers: 'OFF', panties: 'NONE' }), 0, A).has('I22'));
  assert.ok(l(lower({ bottoms: 'OFF', panties: 'NOT_WORN' }), 1, A).has('I11'), 'panties NOT_WORN + pantalón fuera = acceso directo');
});
test('catálogo real: I25 es la única THROUGH_TOP aprobada (Opción A); nada se convirtió; Conexión en 47 tras la curación', () => {
  const tt = APPROVED.filter(c => c.clothing.receiver.includes('THROUGH_TOP')); assert.deepEqual(tt.map(c => c.id), ['I25']);
  assert.equal(CARD.I25.status, 'APPROVED'); assert.equal(CARD.I25.source, 'DESIGNER_APPROVED'); assert.deepEqual(CARD.I25.durations, [30]); assert.deepEqual(CARD.I25.allowedSides, ['LEFT', 'RIGHT', 'BOTH']);
  assert.deepEqual(CARD.I25.actorRequirements, [{ part: 'fingertips' }]); assert.deepEqual(CARD.I25.receiverRequirements, [{ part: 'breasts' }]);
  for (const s of ['LEFT', 'RIGHT', 'BOTH']) for (const t of CARD.I25.copyBySide[s]) assert.match(t, /por encima de la camiseta/i);
  for (const id of CHEST_DIRECT) assert.deepEqual(CARD[id].clothing.receiver, ['SKIN_ACCESS']); assert.deepEqual(CARD.I21.clothing.receiver, ['THROUGH_BRA']);
  assert.equal(APPROVED.filter(c => c.level === 1 && !c.transition).length, 47); assert.equal(CARD.C29.status, 'REJECTED'); assert.equal(CARD.C35.status, 'APPROVED');
});
test('los dos recorridos con el catálogo real, recalculando tras cada prenda', () => {
  const chestIds = e => [...idsFor(e)].filter(id => /^I(03|08|09|10|17|21|25)$/.test(id)).sort();
  const a = eng(chest({ top: 'ON', bra: 'ON' })); assert.deepEqual(chestIds(a), ['I25']);
  a.recordUndress(0, 'top'); assert.deepEqual(chestIds(a), ['I21']);
  a.recordUndress(0, 'bra'); assert.deepEqual(chestIds(a), ['I03', 'I08', 'I09', 'I10', 'I17']);
  const b = eng(chest({ top: 'ON', bra: 'NOT_WORN' })); assert.deepEqual(chestIds(b), ['I25']);
  b.recordUndress(0, 'top'); assert.deepEqual(chestIds(b), ['I03', 'I08', 'I09', 'I10', 'I17']); assert.equal(b.clothing[0].bra, 'NOT_WORN');
  const r = a.roll(); assert.ok(r && r.cardId !== 'I25' && r.cardId !== 'I21', 'la siguiente carta ya usa el nuevo estado');
});
test('I25 sale en la app con su frase real y respeta lado y anatomía', () => {
  const e = eng(chest({ top: 'ON', bra: 'ON' }), { seed: 2 }); let seen = null;
  for (let i = 0; i < 80 && !seen; i++) { const r = e.roll(); if (r.cardId === 'I25') seen = r; if (e.pauseDue()) e.continueGuided(); }
  assert.ok(seen, 'I25 no salió en 80 cartas'); assert.ok(['LEFT', 'RIGHT', 'BOTH'].includes(seen.side)); assert.match(seen.phrase, /por encima de la camiseta/i); assert.equal(seen.seconds, 30); assert.equal(seen.receiver, 0);
});
test('la interfaz y el motor comparten los estados: «No la llevo» = NOT_WORN, y un guardado no cambia nada (la ropa no persiste)', () => {
  const prefs = new PreferenceManager({ names: ['Val', 'Mike'], bodyParts: [['vulva', 'senos'], ['pene']] });
  const e = new GameEngine({ prefs, seed: 1, level: 3 }); e.setClothing(0, { ...e.clothing[0], bra: 'NOT_WORN' });
  assert.equal(e.clothing[0].bra, 'NOT_WORN'); assert.ok(!('clothing' in JSON.parse(JSON.stringify(prefs))));
  const again = new GameEngine({ prefs: new PreferenceManager(JSON.parse(JSON.stringify(prefs))), seed: 1, level: 3 }); assert.equal(again.clothing[0].bra, 'ON', 'cada sesión vuelve a preguntar');
});
