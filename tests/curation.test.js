/* CURACIÓN MANUAL + DIVERSIDAD REAL EN INTIMIDAD (diseñador, 2026-11-03).
   1) Solo cambian las cartas que el diseñador listó; el resto es idéntico, campo por campo, a la instantánea previa
      (cards-before-curation.json). 2) Selector de Intimidad: cooldown por ID de 10 cartas con relajación mínima, no vistas
      primero, recién desbloqueadas por ropa con prioridad temporal, UNDRESS con la misma probabilidad que antes. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CARDS, CARD, APPROVED, playableAt } from '../content/index.js';
import { buildDeck, weighDeck } from '../engine/deck.js';
import { applyIntimacyDiversity, COOLDOWN, UNSEEN, UNLOCKED_HOLD, UNLOCKED_ROUNDS } from '../engine/diversity.js';
import { mk, play, NAKED, DRESSED } from './helpers.js';

const BEFORE = JSON.parse(readFileSync(new URL('./cards-before-curation.json', import.meta.url), 'utf8'));
const MODIFIED = ['C01', 'C10', 'C13', 'C16', 'C31', 'C38', 'D05'];
const DELETED = ['C21', 'C28', 'C30', 'C49', 'I16'];
const REACTIVATED = ['C35', 'I24'];
const TOUCHED = [...MODIFIED, ...DELETED, ...REACTIVATED];

/* ---------- curación ---------- */
test('las cartas no listadas por el diseñador no han cambiado en nada (texto, variantes, anatomía, ropa, peso, familia, región)', () => {
  assert.ok(Object.keys(BEFORE).length >= 130);
  for (const [id, before] of Object.entries(BEFORE)) if (!TOUCHED.includes(id)) assert.deepEqual(JSON.parse(JSON.stringify(CARD[id])), before, `${id} cambió`);
  const ADDED_LATER = ['I55', 'I56', 'I57', 'I58', 'I59', 'I60', 'I61', 'I62', 'I63', 'I64', 'I65', 'I66']; // experiencia recíproca «acostado y admirado» (diseñador, 2026-11-03, tarea posterior)
  for (const c of CARDS) assert.ok(BEFORE[c.id] || ADDED_LATER.includes(c.id), `${c.id} es nueva: la curación no añade cartas`);
  for (const id of TOUCHED) assert.notDeepEqual(JSON.parse(JSON.stringify(CARD[id])), BEFORE[id], `${id} debía cambiar`);
});
test('eliminadas sin sustituta: C21 C28 C30 C49 I16 REJECTED, sin copia, nunca elegibles', () => {
  for (const id of DELETED) { assert.equal(CARD[id].status, 'REJECTED', id); assert.deepEqual(CARD[id].copy, []); assert.ok(!APPROVED.some(c => c.id === id)); }
  const e = mk({ level: 3, seed: 3, clothing: [NAKED(), NAKED()] }); const seen = new Set(play(e, 300).map(r => r.cardId)); for (const id of DELETED) assert.ok(!seen.has(id));
});
test('reactivadas: C35 (de pie, ojos cerrados, {R} rodea admirando) e I24 (pene entre los senos) APPROVED y jugables', () => {
  for (const id of REACTIVATED) assert.equal(CARD[id].status, 'APPROVED', id);
  assert.equal(CARD.C35.requiredOrientation, 'STANDING'); assert.match(CARD.C35.copy[0], /de pie.*Cierra los ojos.*\{R\} camina despacio a tu alrededor.*admirando tu rostro y tu cuerpo/);
  const seen = new Set(); for (let s = 0; s < 30; s++) for (const r of play(mk({ level: 1, seed: 500 + s }), 20)) seen.add(r.cardId); assert.ok(seen.has('C35'), 'C35 sale en Conexión');
  let i24 = 0; for (let s = 0; s < 40; s++) i24 += play(mk({ level: 3, seed: 700 + s, clothing: [NAKED(), NAKED()] }), 30).filter(r => r.cardId === 'I24').length; assert.ok(i24 > 0, 'I24 sale en Intimidad');
});
test('textos curados: C01 por zonas, C10 baile, C13 ojos cerrados, C16 y C31 sin guía, C38 adivinanza, D05 yemas', () => {
  assert.deepEqual(CARD.C01.variants.map(v => v.copy[0]), ['Masajea despacio la espalda alta de {R}.', 'Masajea despacio la mitad de la espalda de {R}.', 'Masajea despacio la parte baja de la espalda de {R}.']);
  assert.deepEqual(CARD.C01.variants[2].receiverRequirements, [{ part: 'lowerBack' }]); assert.deepEqual(CARD.C01.levels, [1, 3]); assert.deepEqual(CARD.C01.durations, [45]);
  assert.match(CARD.C10.copy[0], /canción lenta.*entera o, si lo preferís, hasta que os apetezca/); assert.equal(CARD.C10.timerMode, 'NO_TIMER');
  for (const t of CARD.C13.copy) assert.match(t, /\{R\}.*(acueste|acuesta) con los ojos cerrados.*juega(s)? con su cabello/);
  assert.deepEqual(CARD.C16.copy, ['Acaricia el rostro de {R} a un ritmo lento.']); assert.deepEqual(CARD.C16.receiverRequirements, [{ part: 'face' }]);
  assert.deepEqual(CARD.C31.copy, ['Acaricia suavemente a {R} desde las manos, subiendo por los brazos hasta llegar al rostro.']);
  for (const id of ['C16', 'C31']) { assert.equal(CARD[id].interactionType, 'STANDARD'); assert.notEqual(CARD[id].similarityGroup, 'GUIDED'); assert.ok(!CARD[id].tags.includes('guia')); }
  assert.match(CARD.C38.copy[0], /en secreto dónde vas a besar a \{R\}.*adivina al menos uno.*penitencia/); assert.match(CARD.C38.note, /cambiad los papeles/); assert.equal(CARD.C38.timerMode, 'NO_TIMER');
  assert.match(CARD.D05.copy[0], /cierra los ojos.*yemas de los dedos.*sentirlo/); assert.ok(!CARD.D05.allowedSides); assert.ok(!CARD.D05.tags.includes('guia'));
  assert.deepEqual(CARD.D05.clothing, { actor: ['CLOTHED'], receiver: ['CLOTHED'] });
});

/* ---------- selector ---------- */
const sessions = (n, o = {}) => { const out = []; for (let s = 0; s < n; s++) { const e = mk({ level: 3, seed: (o.seed || 9000) + s, clothing: o.clothing ? o.clothing() : undefined, prefs: o.prefs }); out.push({ e, rs: play(e, o.cards || 40) }); } return out; };
test('cooldown por ID: ninguna carta (no UNDRESS) se repite dentro de 10 cartas de Intimidad salvo relajación registrada', () => {
  let checked = 0;
  for (const { e, rs } of sessions(120, { clothing: () => [NAKED(), NAKED()] })) {
    const relaxed = new Set(e.stats.cooldownRelaxed.map(x => x.round));
    rs.forEach((r, i) => { if (r.transition || r.undress) return; const prev = rs.slice(Math.max(0, i - COOLDOWN), i).map(x => x.cardId); if (prev.includes(r.cardId)) assert.ok(relaxed.has(r.n), `${r.cardId} repetida en la carta ${r.n} sin relajación`); checked++; });
  }
  assert.ok(checked > 3000);
});
test('nunca se queda sin carta: con solo 3 cartas elegibles el cooldown se relaja lo justo y lo registra', () => {
  const keep = new Set(['I01', 'I02', 'I45']), saved = CARDS.map(c => [c, c.status]);
  for (const c of CARDS) if (playableAt(c, 3) && !keep.has(c.id)) c.status = 'REJECTED';
  try {
    const e = mk({ level: 3, seed: 1, clothing: [DRESSED(), DRESSED()] }); const rs = play(e, 30, { undress: false });
    assert.equal(rs.length, 30); assert.ok(rs.every(r => !r.transition && keep.has(r.cardId)), 'siempre hay carta');
    assert.ok(e.stats.cooldownRelaxed.length > 0); assert.ok(e.stats.cooldownRelaxed.every(x => x.window < COOLDOWN && x.window >= 1), 'relaja de forma mínima');
    for (let i = 1; i < rs.length; i++) assert.notEqual(rs[i].cardId, rs[i - 1].cardId, 'ni siquiera relajando sale la misma dos veces seguidas');
  } finally { for (const [c, s] of saved) c.status = s; }
});
test('no vistas primero: las cartas que no han salido pesan ×3; las ya vistas conservan su peso', () => {
  const e = mk({ level: 3, seed: 5, clothing: [NAKED(), NAKED()] }); play(e, 12); const seen = new Set(e.seen[3]); e.roll();
  const cands = e.lastDebug.candidates.filter(c => CARD[c.id].interactionType !== 'UNDRESS');
  assert.ok(cands.length > 10); for (const c of cands) assert.ok(!e.history.rounds.slice(1, 11).some(r => r.cardId === c.id), `${c.id} en cooldown`);
  for (const c of cands) assert.equal(c.factors.unseen, seen.has(c.id) ? 1 : UNSEEN, c.id);
  // efecto: en 30 cartas la cobertura de cartas distintas es alta
  let uniq = 0; for (const { rs } of sessions(60, { clothing: () => [NAKED(), NAKED()], cards: 30 })) uniq += new Set(rs.filter(r => !r.undress).map(r => r.cardId)).size / rs.filter(r => !r.undress).length;
  assert.ok(uniq / 60 > 0.9, `cartas distintas / cartas jugadas ${uniq / 60}`);
});
test('UNDRESS conserva exactamente su probabilidad por ronda (la capa solo reparte lo que no es UNDRESS)', () => {
  for (let s = 0; s < 40; s++) {
    const e = mk({ level: 3, seed: 300 + s, clothing: [DRESSED(), DRESSED()] }); play(e, s % 15);
    const actor = e.nextActor(), deck = buildDeck(CARDS, e.context(actor));
    const w = weighDeck(deck, { history: e.history, session: e.session, director: e.director, purpose: 'MAINTAIN', unlocked: e.unlocked, round: e.state.round, actor, clothing: e.clothing });
    const share = l => { const t = l.reduce((a, x) => a + x.weight, 0), u = l.filter(x => x.card.interactionType === 'UNDRESS').reduce((a, x) => a + x.weight, 0); return t ? u / t : 0; };
    const after = applyIntimacyDiversity(w, { level: 3, history: e.history, seen: e.seen[3], unlocked: e.unlocked, round: e.state.round }).weighted;
    assert.ok(Math.abs(share(w) - share(after)) < 1e-9, `semilla ${s}: ${share(w)} → ${share(after)}`);
    for (const x of after.filter(x => x.card.interactionType === 'UNDRESS')) assert.equal(x.weight, w.find(y => y.card.id === x.card.id).weight, 'peso UNDRESS intacto');
  }
});
test('ninguna carta sale antes de que la ropa lo permita (la diversidad nunca rescata una carta no elegible)', () => {
  for (const { e } of sessions(30, { clothing: () => [DRESSED(), DRESSED()], cards: 0 })) {
    for (let i = 0; i < 40; i++) { const before = new Set(e.deck(e.nextActor()).eligible.map(x => x.card.id)); const r = e.roll(); assert.ok(!e.lastDebug.rejected.some(x => x.id === r.cardId), `${r.cardId} rechazada y aun así salió`); if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); } void before; }
  }
});
test('recién desbloqueadas por ropa: prioridad temporal (×1,5 durante 6 cartas mientras no han salido), sin acapararlo todo', () => {
  const e = mk({ level: 3, seed: 2, clothing: [DRESSED(), DRESSED()] }); play(e, 4, { undress: false });
  e.recordUndress(1, 'top'); const unlocked = [...e.unlocked.keys()]; assert.ok(unlocked.length >= 2, 'quitar la camiseta desbloquea cartas');
  e.roll(); const f = Object.fromEntries(e.lastDebug.candidates.map(c => [c.id, c.factors]));
  for (const id of unlocked) if (f[id] && CARD[id].interactionType !== 'UNDRESS' && !e.seen[3].has(id)) assert.equal(f[id].unlockedHold, UNLOCKED_HOLD, id);
  for (let i = 0; i < UNLOCKED_ROUNDS; i++) e.roll();
  e.roll(); for (const c of e.lastDebug.candidates) assert.equal(c.factors.unlockedHold ?? 1, 1, `${c.id}: el empujón expira`);
  // en sesiones reales: tras cada cambio de ropa, las desbloqueadas no ocupan todas las cartas siguientes
  let runs = 0, changes = 0;
  for (const { e: x, rs } of sessions(80, { clothing: () => [DRESSED(), DRESSED()], cards: 40 })) {
    rs.forEach((r, i) => { if (!r.undress) return; changes++; const next = rs.slice(i + 1, i + 5).filter(y => !y.undress); if (next.length === 4 && next.every(y => y.region === next[0].region)) runs++; }); void x;
  }
  assert.ok(changes > 100); assert.ok(runs / changes < 0.03, `4 cartas seguidas de la misma región tras desvestir: ${runs}/${changes}`);
});
test('similarityGroup sigue siendo penalización, no veto de 10 cartas', () => {
  let sameGroupWithin10 = 0;
  for (const { rs } of sessions(60, { clothing: () => [NAKED(), NAKED()], cards: 30 })) rs.forEach((r, i) => { if (r.similarityGroup && rs.slice(Math.max(0, i - 10), i).some(x => x.similarityGroup === r.similarityGroup && x.cardId !== r.cardId)) sameGroupWithin10++; });
  assert.ok(sameGroupWithin10 > 0, 'el mismo grupo puede volver dentro de 10 cartas con otra carta');
});
test('Conexión y Deseo no cambian: la capa solo actúa en Intimidad', () => {
  for (const L of [1, 2]) { const e = mk({ level: L, seed: 4 }); play(e, 10); const actor = e.nextActor(); const w = weighDeck(buildDeck(CARDS, e.context(actor)), { history: e.history, session: e.session, director: e.director, purpose: 'MAINTAIN', round: e.state.round, actor, clothing: e.clothing });
    assert.equal(applyIntimacyDiversity(w, { level: L, history: e.history, seen: e.seen[L], round: e.state.round }).weighted, w); }
});
