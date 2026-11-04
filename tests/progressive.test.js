/* PRIORIDAD PROGRESIVA POR OPORTUNIDADES PERDIDAS + EXPERIENCIA RECÍPROCA «ACOSTADO Y ADMIRADO» (I55 / I56) · diseñador, 2026-11-03 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, playableAt } from '../content/index.js';
import { buildDeck, weighDeck } from '../engine/deck.js';
import { applyIntimacyDiversity, missedFactor, cooldownKey, COOLDOWN, MISSED_MAX, MISSED_STEP, UNSEEN, UNLOCKED_HOLD } from '../engine/diversity.js';
import { Rng } from '../engine/rng.js';
import { mk, play, NAKED, DRESSED } from './helpers.js';

const isU = id => CARD[id].interactionType === 'UNDRESS';
const nonU = cands => cands.filter(c => !isU(c.id));
const PAIRS = [[['vulva', 'senos'], ['pene']], [['pene'], ['pene']], [['vulva', 'senos'], ['vulva', 'senos']], [['vulva'], ['pene', 'senos']]];

/* ---------- PARTE 1 · prioridad progresiva ---------- */
test('1 · una carta bloqueada por la ropa no acumula oportunidades', () => {
  const e = mk({ level: 3, seed: 3, clothing: [DRESSED(), DRESSED()] }); play(e, 20, { undress: false });
  for (const id of ['I46', 'I47', 'I48', 'I08', 'I18', 'I55', 'I56', 'I20']) assert.equal(e.missed.get(id), undefined, id);
});
test('2 · una carta bloqueada por la anatomía no acumula oportunidades', () => {
  const e = mk({ level: 3, seed: 4, prefs: { bodyParts: [['pene'], ['pene']] }, clothing: [NAKED(), NAKED()] }); play(e, 40);
  for (const id of ['I08', 'I03', 'I18', 'I24', 'I25']) assert.equal(e.missed.get(id), undefined, id);
  assert.ok(e.missed.size > 10, 'las elegibles sí acumulan');
});
test('3 · al desbloquearse por la ropa empieza a acumular desde ese momento, sin retroactivo', () => {
  const e = mk({ level: 3, seed: 5, clothing: [DRESSED(), DRESSED()] }); play(e, 8, { undress: false });
  assert.equal(e.missed.get('I47'), undefined);
  e.recordUndress(0, 'socks'); e.recordUndress(1, 'socks'); assert.ok(e.unlocked.has('I47'));
  e.roll(); const v = e.missed.get('I47'); assert.ok(v === 0 || v === 1, `I47 tras una carta: ${v}`);
  e.roll(); assert.ok(e.missed.get('I47') <= 2);
});
test('4 · 5 · una elegible no elegida suma 1; la elegida vuelve a 0', () => {
  const e = mk({ level: 3, seed: 6, clothing: [NAKED(), NAKED()] }); play(e, 6);
  const before = new Map(e.missed); const r = e.roll();
  const cands = nonU(e.lastDebug.candidates).map(c => c.id); assert.ok(cands.length > 10);
  for (const id of cands) if (id !== r.cardId) assert.equal(e.missed.get(id), (before.get(id) || 0) + 1, id);
  if (!isU(r.cardId)) assert.equal(e.missed.get(r.cardId), 0);
  // las que no estaban en el sorteo (cooldown) no cambian
  for (const [id, n] of before) if (!cands.includes(id)) assert.equal(e.missed.get(id), n, `${id} fuera del sorteo`);
});
test('6 · newSession() reinicia los contadores', () => {
  const e = mk({ level: 3, seed: 7, clothing: [NAKED(), NAKED()] }); play(e, 15); assert.ok(e.missed.size > 0);
  e.newSession(3); assert.equal(e.missed.size, 0);
});
test('7 · UNDRESS no recibe el bonus ni acumula', () => {
  for (let s = 0; s < 20; s++) {
    const e = mk({ level: 3, seed: 40 + s, clothing: [DRESSED(), DRESSED()] }); const rs = play(e, 30);
    for (const id of e.missed.keys()) assert.ok(!isU(id), id);
    assert.ok(rs.some(r => r.undress));
    for (const c of e.lastDebug.candidates) if (isU(c.id)) assert.equal(c.factors.missed, undefined, c.id);
  }
});
test('8 · el cooldown de 10 sigue funcionando (por ID, y por grupo para I55/I56)', () => {
  let checked = 0;
  for (let s = 0; s < 120; s++) {
    const pair = PAIRS[s % 4]; const e = mk({ level: 3, seed: 2000 + s, prefs: { bodyParts: pair }, clothing: [NAKED(), NAKED()] }); const rs = play(e, 40);
    const relaxed = new Set(e.stats.cooldownRelaxed.map(x => x.round));
    rs.forEach((r, i) => { if (r.undress || r.transition) return; const prev = rs.slice(Math.max(0, i - COOLDOWN), i).map(x => cooldownKey(x.cardId)); if (prev.includes(cooldownKey(r.cardId))) assert.ok(relaxed.has(r.n), `${r.cardId} en ${r.n}`); checked++; });
  }
  assert.ok(checked > 3000);
});
test('9 · el bonus no puede saltarse requisitos duros', () => {
  const e = mk({ level: 3, seed: 8, prefs: { bodyParts: [['pene'], ['pene']] }, clothing: [{ ...NAKED(), socks: 'ON' }, { ...NAKED(), socks: 'ON' }] });
  for (const id of ['I08', 'I46', 'I47', 'I48']) e.missed.set(id, 100000);
  const rs = play(e, 60, { undress: false }); for (const r of rs) assert.ok(!['I08', 'I46', 'I47', 'I48'].includes(r.cardId), r.cardId);
});
test('10 · pools pequeños: sin bloqueo con 3 cartas elegibles', () => {
  const keep = new Set(['I01', 'I02', 'I45']), saved = CARDS.map(c => [c, c.status]);
  for (const c of CARDS) if (playableAt(c, 3) && !keep.has(c.id)) c.status = 'REJECTED';
  try { const e = mk({ level: 3, seed: 1, clothing: [DRESSED(), DRESSED()] }); const rs = play(e, 40, { undress: false }); assert.equal(rs.length, 40); assert.ok(rs.every(r => !r.transition && keep.has(r.cardId))); for (const id of keep) assert.ok(e.missed.get(id) <= 3, `${id}: ${e.missed.get(id)}`); }
  finally { for (const [c, s] of saved) c.status = s; }
});
test('11 · con todo lo demás igual, una carta con muchas oportunidades perdidas sale más que con contador 0', () => {
  const e = mk({ level: 3, seed: 9, clothing: [NAKED(), NAKED()] }); play(e, 12);
  const actor = e.nextActor(), base = weighDeck(buildDeck(CARDS, e.context(actor)), { history: e.history, session: e.session, director: e.director, purpose: 'MAINTAIN', unlocked: e.unlocked, round: e.state.round, actor, clothing: e.clothing });
  const opts = m => ({ level: 3, history: e.history, seen: e.seen[3], unlocked: e.unlocked, round: e.state.round, missed: m });
  const ref = applyIntimacyDiversity(base, opts(new Map())).weighted; const target = nonU(ref.map(w => ({ id: w.card.id }))).find(x => x.id !== 'I55').id;
  const others = new Map(ref.filter(w => !isU(w.card.id)).map(w => [w.card.id, 10]));
  const lo = applyIntimacyDiversity(base, opts(new Map([...others, [target, 0]]))).weighted, hi = applyIntimacyDiversity(base, opts(new Map([...others, [target, 40]]))).weighted;
  const draw = list => { const rng = new Rng(77); let n = 0; for (let i = 0; i < 20000; i++) if (rng.weighted(list.map(w => ({ item: w.card.id, weight: w.weight }))) === target) n++; return n; };
  const nLo = draw(lo), nHi = draw(hi); assert.ok(nHi > nLo * 1.4, `${target}: ${nLo} → ${nHi}`);
  assert.ok(nHi < 20000 * 0.5, 'no se vuelve obligatoria');
});
test('12 · el multiplicador es monótono y nunca supera el techo', () => {
  let prev = 0; for (let n = 0; n <= 10000; n++) { const f = missedFactor(n); assert.ok(f >= prev && f <= MISSED_MAX); prev = f; }
  assert.equal(missedFactor(0), 1); assert.equal(missedFactor(10), 1 + 10 * MISSED_STEP); assert.equal(missedFactor(1e9), MISSED_MAX);
  for (let s = 0; s < 10; s++) { const e = mk({ level: 3, seed: 90 + s, clothing: [NAKED(), NAKED()] }); for (let i = 0; i < 40; i++) { e.roll(); for (const c of e.lastDebug.candidates) assert.ok((c.factors.missed ?? 1) <= MISSED_MAX); } }
});
test('Conexión y Deseo no acumulan oportunidades', () => {
  for (const L of [1, 2]) { const e = mk({ level: L, seed: 11 }); play(e, 30); assert.equal(e.missed.size, 0); }
});

/* ---------- PARTE 2 · I55 / I56 ---------- */
const lying = (prefs, lie, clothing, card) => { // ¿es elegible `card` con el jugador `lie` acostado?
  const e = mk({ level: 3, seed: 1, prefs: { bodyParts: prefs }, clothing });
  const actor = card === 'I55' ? 1 - lie : lie; return buildDeck([CARD[card]], e.context(actor));
};
const V = [['vulva', 'senos'], ['pene']]; // jugador 0: camiseta · pantalón · calcetines · brasier · panties; jugador 1: camiseta · pantalón · calcetines · calzoncillos
test('1–6 · el que se acuesta necesita camiseta, pantalón, brasier y ropa interior fuera; los calcetines no bloquean', () => {
  for (const card of ['I55', 'I56']) {
    const ok = (lie, st) => lying(V, lie, lie === 0 ? [st, NAKED()] : [NAKED(), st], card).eligible.length === 1;
    for (const g of ['top', 'bottoms', 'bra', 'panties']) assert.ok(!ok(0, { ...NAKED(), [g]: 'ON' }), `${card}: ${g} puesta`);
    for (const g of ['top', 'bottoms', 'boxers']) assert.ok(!ok(1, { ...NAKED(), [g]: 'ON' }), `${card}: ${g} puesta`);
    assert.ok(ok(0, { ...NAKED(), socks: 'ON' }), `${card}: calcetines no bloquean`); assert.ok(ok(1, { ...NAKED(), socks: 'ON' }));
    assert.ok(ok(0, { ...NAKED(), bra: 'NOT_WORN' }), `${card}: sin brasier de entrada vale`);
    // la otra persona puede ir vestida
    assert.equal(lying(V, 0, [NAKED(), DRESSED()], card).eligible.length, 1, `${card}: quien admira puede ir vestido`);
  }
});
test('7 · quitar la última prenda necesaria las hace elegibles y cuentan como recién desbloqueadas', () => {
  const e = mk({ level: 3, seed: 2, clothing: [{ ...NAKED(), socks: 'ON', panties: 'ON' }, DRESSED()] });
  assert.ok(!e.eligibleIds().has('I55') && !e.eligibleIds().has('I56'));
  e.recordUndress(0, 'panties'); const ids = e.eligibleIds(); assert.ok(ids.has('I55') && ids.has('I56'));
  assert.ok(e.unlocked.has('I55') && e.unlocked.has('I56'));
  e.roll(); const f = Object.fromEntries(e.lastDebug.candidates.map(c => [c.id, c.factors]));
  for (const id of ['I55', 'I56']) if (f[id]) { assert.equal(f[id].unlocked, 1.6); assert.equal(f[id].unlockedHold, UNLOCKED_HOLD); assert.equal(f[id].unseen, UNSEEN); }
});
test('8 · funcionan con todas las configuraciones de anatomía soportadas', () => {
  for (const p of PAIRS) for (const lie of [0, 1]) for (const card of ['I55', 'I56']) assert.equal(lying(p, lie, [NAKED(), NAKED()], card).eligible.length, 1, `${JSON.stringify(p)} ${lie} ${card}`);
});
const sessionsWith = (n, cards = 40) => { const out = []; for (let s = 0; s < n; s++) { const e = mk({ level: 3, seed: 5000 + s, prefs: { bodyParts: PAIRS[s % 4] }, clothing: [NAKED(), NAKED()] }); out.push(play(e, cards)); } return out; };
const lier = r => r.cardId === 'I55' ? r.receiver : r.actor;
test('9 · 10 · las dos personas pueden recibirla en la misma sesión, nunca a menos de 10 cartas', () => {
  let both = 0, minGap = Infinity;
  for (const rs of sessionsWith(300)) {
    const hits = rs.map((r, i) => ({ r, i })).filter(x => ['I55', 'I56'].includes(x.r.cardId));
    if (new Set(hits.map(x => lier(x.r))).size === 2) both++;
    for (let k = 1; k < hits.length; k++) minGap = Math.min(minGap, hits[k].i - hits[k - 1].i);
  }
  assert.ok(both > 0, 'ninguna sesión con las dos direcciones'); assert.ok(minGap > COOLDOWN, `distancia mínima ${minGap}`);
});
test('11 · duración exacta de 120 segundos', () => {
  for (const id of ['I55', 'I56']) { assert.deepEqual(CARD[id].durations, [120]); assert.equal(CARD[id].timerMode, 'FIXED'); }
  const rs = sessionsWith(60).flat().filter(r => ['I55', 'I56'].includes(r.cardId)); assert.ok(rs.length); for (const r of rs) assert.equal(r.seconds, 120);
});
test('12 · participan en cooldown, no vistas, desbloqueo y prioridad progresiva; nada de peso extra', () => {
  for (const id of ['I55', 'I56']) { const c = CARD[id]; assert.equal(c.status, 'APPROVED'); assert.equal(c.level, 3); assert.equal(c.baseWeight, 1); assert.equal(c.similarityGroup, 'GAZE'); assert.equal(c.cooldownGroup, 'ADMIRE_LYING'); }
  assert.equal(cooldownKey('I55'), cooldownKey('I56'));
  const e = mk({ level: 3, seed: 12, clothing: [NAKED(), NAKED()] });
  let at = -1; for (let i = 0; i < 80 && at < 0; i++) { const r = e.roll(); if (['I55', 'I56'].includes(r.cardId)) at = i; else if (nonU(e.lastDebug.candidates).some(c => c.id === 'I55')) { assert.equal(e.lastDebug.candidates.find(c => c.id === 'I55').factors.unseen, UNSEEN); } }
  assert.ok(at >= 0, 'sale en 80 cartas');
  for (let k = 0; k < COOLDOWN - 1; k++) { e.roll(); assert.ok(!e.lastDebug.candidates.some(c => ['I55', 'I56'].includes(c.id)), `la pareja vuelve a ${k + 1} cartas`); }
  const e2 = mk({ level: 3, seed: 13, clothing: [NAKED(), NAKED()] }); play(e2, 5); assert.ok((e2.missed.get('I55') || 0) + (e2.missed.get('I56') || 0) > 0, 'acumulan oportunidades');
});
test('reciprocidad: quien ya se acostó pesa ×0,2 para repetir; la otra persona conserva su peso', async () => {
  const { RECIPROCAL_REPEAT, reciprocalKey } = await import('../engine/diversity.js');
  assert.equal(CARD.I55.reciprocalSubject, 'RECEIVER'); assert.equal(CARD.I56.reciprocalSubject, 'ACTOR');
  assert.equal(reciprocalKey(CARD.I55, 0), 'ADMIRE_LYING:1'); assert.equal(reciprocalKey(CARD.I56, 0), 'ADMIRE_LYING:0'); assert.equal(reciprocalKey(CARD.I01, 0), null);
  const e = mk({ level: 3, seed: 21, clothing: [NAKED(), NAKED()] }); e.reciprocal.add('ADMIRE_LYING:0'); // el jugador 0 ya se acostó
  play(e, 11); // pasa cualquier cooldown
  for (let i = 0; i < 30; i++) { const before = new Set(e.reciprocal); e.roll(); const a = e.lastDebug.actor;
    for (const c of e.lastDebug.candidates) if (['I55', 'I56'].includes(c.id)) { const lier = c.id === 'I55' ? 1 - a : a; assert.equal(c.factors.reciprocal, before.has(`ADMIRE_LYING:${lier}`) ? RECIPROCAL_REPEAT : 1, `${c.id} actor ${a}`); } } // el peso sigue al estado real antes de la carta: quien ya se acostó en la sesión
  let same = 0, both = 0; for (let s = 0; s < 400; s++) { const x = mk({ level: 3, seed: 8000 + s, clothing: [NAKED(), NAKED()] }); const rs = play(x, 40).filter(r => ['I55', 'I56'].includes(r.cardId)); const l = rs.map(lier); for (let k = 1; k < l.length; k++) if (l[k] === l[k - 1]) same++; if (new Set(l).size === 2) both++; }
  assert.ok(both > same, `ambas direcciones ${both} · misma persona seguida ${same}`);
  e.newSession(3); assert.equal(e.reciprocal.size, 0);
});
