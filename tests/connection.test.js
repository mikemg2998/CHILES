/* Conexión V2 · 50 cartas activas, C29/C35 rechazadas, grupos de similitud, anti-monotonía, nivel nunca cambia solo */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED } from '../content/index.js';
import { SIMILARITY_GROUPS, VERBAL_GROUPS } from '../content/schema.js';
import { buildDeck } from '../engine/deck.js';
import { mk, play } from './helpers.js';

const ACTIVE = APPROVED.filter(c => c.level === 1 && !c.transition);
test('exactly 50 active Conexión cards, C01–C52, C29 and C35 REJECTED, no C53+', () => {
  assert.equal(ACTIVE.length, 50);
  for (let i = 1; i <= 52; i++) assert.ok(CARD[`C${String(i).padStart(2, '0')}`], `C${i}`);
  assert.equal(CARD.C29.status, 'REJECTED'); assert.equal(CARD.C35.status, 'REJECTED'); assert.ok(!CARD.C53);
  for (const c of CARDS.filter(c => c.level === 1 && c.status === 'REJECTED')) assert.deepEqual(c.copy, []);
  for (const c of ACTIVE) { assert.ok(SIMILARITY_GROUPS.includes(c.similarityGroup), c.id); assert.ok(['DESIGNER_PROVIDED', 'DESIGNER_APPROVED'].includes(c.source), c.id); }
  for (let i = 1; i <= 17; i++) assert.equal(CARD[`C${String(i).padStart(2, '0')}`].source, 'DESIGNER_PROVIDED');
  for (let i = 18; i <= 52; i++) if (![29, 35].includes(i)) assert.equal(CARD[`C${i}`].source, 'DESIGNER_APPROVED', `C${i}`);
});
test('all 50 are eligible for both directions with clothes on and any anatomy; C29/C35 never play', () => {
  for (const bp of [[['vulva', 'senos'], ['pene']], [['pene'], ['pene']], [[], []]]) {
    const e = mk({ level: 1, seed: 1, prefs: { bodyParts: bp } });
    for (const a of [0, 1]) { const d = buildDeck(CARDS, e.context(a)); const ids = new Set(d.eligible.map(x => x.card.id)); for (const c of ACTIVE) assert.ok(ids.has(c.id), `${c.id} ${JSON.stringify(d.rejected.find(r => r.id === c.id))}`); assert.ok(!ids.has('C29') && !ids.has('C35')); }
  }
  const seen = new Set(); for (let s = 0; s < 40; s++) for (const r of play(mk({ level: 1, seed: 2000 + s }), 20)) seen.add(r.cardId);
  for (const c of ACTIVE) assert.ok(seen.has(c.id), `${c.id} nunca sale en 800 cartas`); assert.ok(!seen.has('C29') && !seen.has('C35'));
});
test('anti-monotony: no three of the same similarity group, no two verbal, no two CHOOSE in a row (100 × 20)', () => {
  let g3 = 0, v2 = 0, ch2 = 0, f3 = 0, n = 0;
  for (let s = 0; s < 100; s++) {
    const rs = play(mk({ level: 1, seed: 3000 + s }), 20); n += rs.length;
    for (let i = 1; i < rs.length; i++) {
      if (VERBAL_GROUPS.includes(rs[i].similarityGroup) && VERBAL_GROUPS.includes(rs[i - 1].similarityGroup)) v2++;
      if (rs[i].interactionType === 'CHOOSE' && rs[i - 1].interactionType === 'CHOOSE') ch2++;
      if (i >= 2 && rs[i].similarityGroup === rs[i - 1].similarityGroup && rs[i].similarityGroup === rs[i - 2].similarityGroup) g3++;
      if (i >= 2 && rs[i].family === rs[i - 1].family && rs[i].family === rs[i - 2].family) f3++;
    }
  }
  assert.equal(g3, 0, `tres del mismo grupo seguidas ${g3}`); assert.equal(f3, 0, `tres de la misma familia seguidas ${f3}`);
  assert.ok(v2 / n < 0.01, `verbal×2 ${v2}/${n}`); assert.ok(ch2 / n < 0.01, `choose×2 ${ch2}/${n}`);
});
test('eyes closed / no talking are properties of specific cards, never a global modifier; laterality only on lateral parts', () => {
  const closed = ACTIVE.filter(c => JSON.stringify(c.copy || c.copyBySide).includes('ojos')).map(c => c.id);
  assert.ok(closed.length >= 6 && closed.length <= 14, closed.join(' '));
  for (const c of ACTIVE) if (c.allowedSides) assert.ok(['C04', 'C08', 'C11', 'C25', 'C27', 'C51'].includes(c.id), c.id);
  const rs = play(mk({ level: 1, seed: 9 }), 400).filter(r => r.cardId === 'C51'); assert.deepEqual([...new Set(rs.map(r => r.side))].sort(), ['BOTH', 'LEFT', 'RIGHT']);
});
test('Conexión never changes level by itself: like, more, pass keep level 1', () => {
  const e = mk({ level: 1, seed: 4 }); e.roll(); e.feedback('gusta'); e.roll(); e.feedback('mas'); e.pass(); e.roll();
  assert.equal(e.level(), 1); for (const r of play(e, 60)) assert.equal(r.level, 1);
});
