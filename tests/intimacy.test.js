/* §67 · pruebas de Intimidad */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD } from '../content/index.js';
import { PAUSE_WINDOW } from '../engine/session.js';
import { mk, play, DRESSED, NAKED } from './helpers.js';

test('UNDRESS cards do not dominate and change ClothingState; availability is recalculated', () => {
  let und = 0, total = 0;
  for (let s = 0; s < 20; s++) { const e = mk({ level: 3, seed: 100 + s }); const rs = play(e, 40); total += rs.length; und += rs.filter(r => r.interactionType === 'UNDRESS').length; for (let i = 1; i < rs.length; i++) assert.ok(!(rs[i].interactionType === 'UNDRESS' && rs[i - 1].interactionType === 'UNDRESS' && rs[i].cardId === rs[i - 1].cardId)); assert.ok(e.clothing.some(c => Object.values(c).includes('OFF'))); }
  assert.ok(und / total < 0.4, `UNDRESS ${und}/${total}`); assert.ok(und / total > 0.1);
});
test('POSITIONAL cards keep their requirements', () => {
  for (const c of CARDS.filter(c => c.interactionType === 'POSITIONAL')) assert.ok(c.requiredOrientation && c.actorRequirements.length && c.receiverRequirements.length, c.id);
  const e = mk({ level: 3, seed: 7, clothing: [NAKED(), NAKED()] }); const rs = play(e, 300, { undress: false }).filter(r => r.cardId === 'I17');
  assert.ok(rs.length); for (const r of rs) { assert.equal(r.actor, 1); assert.ok(['LEFT', 'RIGHT'].includes(r.side)); }
  const f = mk({ level: 3, seed: 7, prefs: { bodyParts: [['pene'], ['pene']] }, clothing: [NAKED(), NAKED()] }); assert.ok(!play(f, 200, { undress: false }).some(r => r.cardId === 'I17'));
});
test('BODY_TO_BODY keeps structure; intimate content respects anatomy and clothing', () => {
  const e = mk({ level: 3, seed: 8, clothing: [NAKED(), NAKED()] });
  for (const r of play(e, 300, { undress: false })) { const c = CARD[r.cardId]; if (c.interactionType === 'BODY_TO_BODY') assert.ok(r.mutual); if (c.tags.includes('intimo')) { const rec = e.anatomy(r.receiver); assert.ok(r.parts.every(p => rec.hasTarget(p))); } }
  const d = mk({ level: 3, seed: 8, clothing: [DRESSED(), DRESSED()] }); for (const r of play(d, 100, { undress: false })) assert.ok(!CARD[r.cardId].tags.includes('intimo') && !CARD[r.cardId].clothing.receiver.includes('SKIN_ACCESS'));
});
test('laterality and history work in Intimidad; nothing unapproved appears', () => {
  const e = mk({ level: 3, seed: 9, clothing: [NAKED(), NAKED()] }); const rs = play(e, 400, { undress: false });
  // con el catálogo ampliado I19 sale menos por sesión: los tres lados se comprueban sobre tres semillas
  const i19 = [9, 10, 11].flatMap(seed => play(mk({ level: 3, seed, clothing: [NAKED(), NAKED()] }), 400, { undress: false })).filter(r => r.cardId === 'I19'); assert.equal(new Set(i19.map(r => r.side)).size, 3);
  for (let i = 1; i < rs.length; i++) assert.notEqual(rs[i].cardId, rs[i - 1].cardId);
  for (const r of rs) { assert.equal(CARD[r.cardId].status, 'APPROVED'); assert.ok(!['I14', 'I16', 'U08', 'D07'].includes(r.cardId)); }
  const ids = new Set(rs.map(r => r.cardId)); assert.ok(ids.size >= 15, `variedad ${ids.size}`);
});
test('the continuity pause falls in the 13–17 window, not always at 15', () => {
  const at = new Set();
  for (let s = 0; s < 30; s++) { const e = mk({ level: 3, seed: 200 + s }); let n = 0; while (!e.pauseDue()) { const r = e.roll(); if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); } n++; assert.ok(n < 30); } assert.ok(n >= PAUSE_WINDOW[0] && n <= PAUSE_WINDOW[1], String(n)); at.add(n); }
  assert.ok(at.size >= 3);
});
test('continuing with the game preserves EXACTLY all state; own way closes without victory', () => {
  const e = mk({ level: 3, seed: 31 }); play(e, 14); e.feedback('like'); while (!e.pauseDue()) play(e, 1);
  const snap = JSON.stringify({ c: e.clothing, h: e.history.rounds.map(r => r.cardId), f: e.session.familyScore, l: e.session.liked, a: e.state.actor, n: e.state.round, lvl: e.session.level, bp: e.prefs.bodyParts });
  e.continueGuided();
  assert.equal(JSON.stringify({ c: e.clothing, h: e.history.rounds.map(r => r.cardId), f: e.session.familyScore, l: e.session.liked, a: e.state.actor, n: e.state.round, lvl: e.session.level, bp: e.prefs.bodyParts }), snap);
  assert.ok(!e.pauseDue()); let k = 0; while (!e.pauseDue() && k < 40) { play(e, 1); k++; } assert.ok(k >= PAUSE_WINDOW[0] - 1, `volvió a preguntar pronto: ${k}`);
  const msg = e.continueAlone(); assert.equal(e.ended(), 'solos'); assert.ok(!/ganaste|victoria|completado|final|objetivo/i.test(msg)); assert.equal(e.roll(), null);
  const f = mk({ level: 3 }); assert.ok(!/ganaste|victoria|completado|final boss|objetivo/i.test(f.endSession('parar')));
});
test('empty deck never blocks and never relaxes anything: neutral transition + log for the designer', () => {
  // desde la expansión corporal V1, vestidos + sin boca + sin quitarse ropa ya NO deja Intimidad vacía: siguen los masajes y el abrazo reutilizados
  const v = mk({ level: 3, seed: 1, clothing: [DRESSED(), DRESSED()] }); v.setPrefs(0, { boca: 'no', ropa: 'no' });
  const rv = v.roll(); assert.ok(!rv.transition, 'hay carta'); assert.ok(['C01', 'C06', 'C08', 'C15', 'C51', 'D10', 'I25', 'I54'].includes(rv.cardId), rv.cardId);
  // el mecanismo de mazo vacío sigue intacto: sin esas cartas reutilizadas ni el abrazo I54, el mismo escenario cae en la transición neutra
  const reused = ['C01', 'C06', 'C08', 'C15', 'C51', 'D10'].map(id => [CARD[id], CARD[id].levels]); const hug = CARD.I54.status;
  try {
    for (const [c] of reused) c.levels = null; CARD.I54.status = 'UNREVIEWED';
    const e = mk({ level: 3, seed: 1, clothing: [DRESSED(), DRESSED()] }); e.setPrefs(0, { boca: 'no', ropa: 'no' });
    const r = e.roll(); assert.ok(r.transition); assert.equal(r.cardId, 'T03'); assert.equal(e.stats.emptyDecks.length, 1); assert.ok(e.stats.emptyDecks[0].rejected.length);
    assert.ok(e.roll());
  } finally { for (const [c, l] of reused) c.levels = l; CARD.I54.status = hug; }
});
