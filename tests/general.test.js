/* §65 · pruebas generales */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED, validateContent } from '../content/index.js';
import { LEVELS, LEVEL_IDS, LEVEL_KEYS, LEVEL_BY_KEY, migrateLevelId } from '../engine/levels.js';
import { BODY_PARTS, ACTOR_TOOLS } from '../content/body.js';
import { GameEngine, migrateFavorite } from '../engine/engine.js';
import { buildDeck } from '../engine/deck.js';
import { mk, play, DRESSED, NAKED } from './helpers.js';

test('content is structurally valid', () => { assert.deepEqual(validateContent(), []); });

test('only three levels exist', () => {
  assert.deepEqual(LEVEL_IDS, [1, 2, 3]); assert.deepEqual(LEVEL_KEYS, ['conexion', 'deseo', 'intimidad']);
  assert.ok(!Object.values(LEVELS).some(L => /explor/i.test(L.key + L.name)));
  for (const c of CARDS) assert.ok([1, 2, 3].includes(c.level), c.id);
  const e = mk(); assert.ok(!e.setLevel(4)); assert.equal(e.level(), 1);
});
test('legacy EXPLORACIÓN maps to DESEO', () => { assert.equal(migrateLevelId(3), 2); assert.equal(migrateLevelId(4), 3); assert.equal(LEVEL_BY_KEY.exploracion, 2); const e = new GameEngine({ prefs: { mode: 'exploracion' } }); assert.equal(e.level(), 2); });

test('the director never changes the level; feedback never changes the level', () => {
  for (const L of LEVEL_IDS) {
    const e = mk({ level: L, seed: 3 + L });
    for (let i = 0; i < 80; i++) { const r = e.roll(); assert.equal(r.level, L); assert.equal(e.level(), L); if (i % 3 === 0) e.feedback('like'); if (i % 7 === 0) e.softer(); if (i % 5 === 0) e.reroll(); if (e.pauseDue()) e.continueGuided(); }
    assert.equal(e.level(), L);
  }
});
test('REJECTED and UNREVIEWED never appear; every round is an APPROVED card', () => {
  const ids = new Set(APPROVED.map(c => c.id));
  for (const L of LEVEL_IDS) { const e = mk({ level: L, seed: 11 + L, clothing: [NAKED(), NAKED()] }); for (const r of play(e, 150)) { assert.ok(ids.has(r.cardId) || r.transition, r.cardId); if (r.variantId) assert.equal(CARD[r.cardId].variants.find(v => v.id === r.variantId).status, 'APPROVED'); } }
  assert.ok(CARDS.some(c => c.status !== 'APPROVED')); // hay rechazadas en el catálogo y ninguna sale
});
test('target belongs to receiver, actor tool belongs to actor, anatomies never mix', () => {
  const combos = [[['vulva', 'senos'], ['pene']], [['pene'], ['vulva', 'senos']], [['vulva'], ['vulva']], [['pene'], ['pene']], [[], []], [['vulva', 'pene', 'senos'], []]];
  for (const [a, b] of combos) {
    const e = mk({ level: 3, seed: 5, prefs: { bodyParts: [a, b] }, clothing: [NAKED(), NAKED()] });
    for (const r of play(e, 120)) {
      if (r.transition) continue;
      const rec = e.anatomy(r.receiver), act = e.anatomy(r.actor);
      for (const p of r.parts) assert.ok(rec.hasTarget(p), `${r.cardId}: ${p} no existe en quien recibe`);
      const c = CARD[r.cardId], v = r.variantId ? c.variants.find(x => x.id === r.variantId) : null;
      for (const t of ((v && v.actorRequirements) || c.actorRequirements).map(x => x.part)) assert.ok(act.hasTool(t), `${r.cardId}: ${t} no existe en quien actúa`);
      if (v && v.anatomy) assert.ok(rec.has(v.anatomy));
    }
  }
});
test('Conexión works on its own, with any anatomy and any clothing', () => {
  const e = mk({ level: 1, seed: 9, prefs: { bodyParts: [[], []] } });
  const rs = play(e, 60); assert.equal(rs.length, 60); assert.ok(rs.every(r => !r.transition)); assert.ok(new Set(rs.map(r => r.cardId)).size >= 14);
});
test('Deseo keeps clothes on: no card requires or changes clothing', () => {
  for (const c of CARDS.filter(c => c.level === 2)) { assert.notEqual(c.interactionType, 'UNDRESS'); for (const q of [...c.clothing.actor, ...c.clothing.receiver]) assert.ok(['ANY', 'CLOTHED'].includes(q), c.id); }
  const e = mk({ level: 2, seed: 4 }); for (const r of play(e, 80)) assert.ok(!r.undress && !r.transition);
  for (const st of e.clothing) assert.ok(!Object.values(st).includes('OFF'), JSON.stringify(st));
});
test('PlayConstraints only where approved; FREE keeps appearing; the recent constraint is penalized', () => {
  const e = mk({ level: 2, seed: 8 });
  const rs = play(e, 600); const d01 = rs.filter(r => r.cardId === 'D01');
  assert.ok(d01.length > 20, `D01 ${d01.length}`); assert.ok(d01.some(r => r.playConstraint === 'FREE')); assert.ok(d01.some(r => r.playConstraint && r.playConstraint !== 'FREE'));
  for (const r of rs) if (r.cardId !== 'D01') assert.equal(r.playConstraint, null);
  let same = 0; for (let i = 1; i < d01.length; i++) if (d01[i].playConstraint === d01[i - 1].playConstraint && d01[i].playConstraint !== 'FREE') same++;
  assert.ok(same / d01.length < 0.15, `repeticiones ${same}/${d01.length}`);
});
test('laterality works: sides only on lateral parts, all sides appear, consecutive same side is rare', () => {
  for (const c of CARDS) if (c.allowedSides) assert.ok(c.receiverRequirements.some(r => BODY_PARTS[r.part].lateral) || c.actorRequirements.some(r => ACTOR_TOOLS[r.part].lateral), c.id);
  const e = mk({ level: 2, seed: 21 }); const rs = play(e, 500).filter(r => r.cardId === 'D02'); // D05 dejó de ser lateral (curación 2026-11-03)
  const seen = new Set(rs.map(r => r.side)); assert.deepEqual([...seen].sort(), ['BOTH', 'LEFT', 'RIGHT']);
  let rep = 0; for (let i = 1; i < rs.length; i++) if (rs[i].side === rs[i - 1].side) rep++;
  assert.ok(rep / rs.length < 0.25, `mismo lado seguido ${rep}/${rs.length}`);
  for (const r of play(mk({ level: 1, seed: 2 }), 100)) if (!CARD[r.cardId].allowedSides) assert.equal(r.side, null);
});
test('history penalizes repetition: no card repeats back to back, and short windows are varied', () => {
  for (const L of [1, 2]) {
    const rs = play(mk({ level: L, seed: 30 + L }), 300);
    for (let i = 1; i < rs.length; i++) assert.notEqual(rs[i].cardId, rs[i - 1].cardId);
    for (let i = 5; i < rs.length; i++) assert.ok(new Set(rs.slice(i - 5, i).map(r => r.cardId)).size >= 4, `ventana poco variada en ${i}`);
  }
});
test('CHOOSE keeps its designed options', () => { const c = CARD.C15; assert.equal(c.interactionType, 'CHOOSE'); assert.deepEqual(c.choices.map(x => x.id), ['back', 'shoulders', 'hands']); const rs = play(mk({ level: 1, seed: 12 }), 200).filter(r => r.cardId === 'C15'); assert.ok(rs.length); assert.ok(rs.every(r => /espalda, hombros o manos/.test(r.phrase))); });
test('C16 y C31 ya no son guiadas (curación 2026-11-03): el actor acaricia, nadie guía', () => { for (const id of ['C16', 'C31']) { assert.equal(CARD[id].interactionType, 'STANDARD'); assert.ok(!CARD[id].tags.includes('guia')); } const rs = play(mk({ level: 1, seed: 13 }), 300).filter(r => ['C16', 'C31'].includes(r.cardId)); assert.ok(rs.length); for (const r of rs) { assert.ok(!/guía/.test(r.phrase)); assert.ok(!r.phrase.includes(r.actorName)); } });
test('PATH keeps its path', () => { const c = CARD.D11; assert.equal(c.interactionType, 'PATH'); assert.deepEqual(c.path, { from: 'arriba', to: 'abajo' }); for (const r of play(mk({ level: 2, seed: 14 }), 200).filter(r => r.cardId === 'D11')) assert.ok(r.phrase.includes('de arriba abajo')); });
test('BODY_TO_BODY keeps its structure as one unit', () => { for (const c of CARDS.filter(c => c.interactionType === 'BODY_TO_BODY')) { assert.ok(c.requiredOrientation); assert.ok(!c.variants); } const rs = play(mk({ level: 2, seed: 15 }), 200).filter(r => r.cardId === 'D14'); assert.ok(rs.length); assert.ok(rs.every(r => r.mutual && /abraza a .* y acaricia sus nalgas/.test(r.phrase))); });
test('NO_TIMER works and durations are natural', () => {
  const rs = play(mk({ level: 1, seed: 16 }), 200);
  assert.ok(rs.some(r => r.cardId === 'C10' && r.seconds === null)); assert.ok(rs.some(r => r.cardId === 'C17' && r.seconds === null));
  for (const r of rs) if (r.seconds != null) { assert.ok(CARD[r.cardId].durations.includes(r.seconds)); assert.ok([15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 120].includes(r.seconds)); }
});
test('an incompatible card never reaches the UI: every round passes the filter again', () => {
  const e = mk({ level: 3, seed: 17, clothing: [NAKED(), { top: 'OFF', bottoms: 'ON', socks: 'ON', bra: 'ON', panties: 'ON', boxers: 'ON' }] });
  for (const r of play(e, 100, { undress: false })) { if (r.transition) continue; const d = buildDeck([CARD[r.cardId]], e.context(r.actor)); assert.equal(d.eligible.length, 1, `${r.cardId} ${JSON.stringify(d.rejected)}`); }
});
test('actors alternate reasonably: neither strict 50/50 nor three in a row', () => {
  const rs = play(mk({ level: 1, seed: 18 }), 400); let three = 0, alt = 0;
  for (let i = 2; i < rs.length; i++) if (rs[i].actor === rs[i - 1].actor && rs[i].actor === rs[i - 2].actor) three++;
  for (let i = 1; i < rs.length; i++) if (rs[i].actor !== rs[i - 1].actor) alt++;
  assert.equal(three, 0); assert.ok(alt / rs.length > 0.6 && alt / rs.length < 0.95);
});
test('favorites: repeat keeps who did what to whom; legacy favorites survive as memories', () => {
  const e = mk({ level: 1, seed: 19 }); const r = e.roll();
  const fav = { id: r.id, cardId: r.cardId, variantId: r.variantId, side: r.side, playConstraint: r.playConstraint, seconds: r.seconds, actor: r.actor, actorName: r.actorName, receiverName: r.receiverName };
  const again = e.repeatFavorite(fav); assert.equal(again.cardId, r.cardId); assert.equal(again.actor, r.actor); assert.equal(again.side, r.side);
  const old = migrateFavorite({ id: 'x', action: 'KISS', tool: 'lips', target: 'neck', phrase: 'Besa el cuello de Ana.' }); assert.ok(old.legacy); assert.equal(old.cardId, null); assert.equal(e.repeatFavorite(old), null);
});
