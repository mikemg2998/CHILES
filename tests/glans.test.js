/* Glande y testículos como targets con contenido real (diseñador, 2026-11-02): separados de pene, DIRECT, sin duplicados. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, APPROVED, partsOf } from '../content/index.js';
import { BODY_PARTS } from '../content/body.js';
import { buildDeck } from '../engine/deck.js';
import { mk, NAKED } from './helpers.js';
const GL = ['I34', 'I35', 'I36'], TE = ['I37', 'I38', 'I39'];
const ids = (e, actor = 0) => new Set(buildDeck(CARDS, e.context(actor)).eligible.map(x => x.card.id));

test('pene, glande y testículos son targets separados; cada carta nueva apunta al suyo y no existe duplicado', () => {
  for (const t of ['penis', 'glans', 'testicles']) { assert.ok(BODY_PARTS[t]); assert.equal(BODY_PARTS[t].anatomy, 'pene'); }
  for (const id of GL) assert.deepEqual(CARD[id].receiverRequirements, [{ part: 'glans' }], id);
  for (const id of TE) assert.deepEqual(CARD[id].receiverRequirements, [{ part: 'testicles' }], id);
  assert.deepEqual(APPROVED.filter(c => partsOf(c, null).includes('glans')).map(c => c.id), GL); assert.deepEqual(APPROVED.filter(c => partsOf(c, null).includes('testicles')).map(c => c.id), TE);
  const oral = APPROVED.filter(c => partsOf(c, null).includes('testicles') && c.family === 'ORAL'); assert.equal(oral.length, 1, 'chupar testículos existe una sola vez');
  for (const id of [...GL, ...TE]) { assert.equal(CARD[id].source, 'DESIGNER_PROVIDED'); assert.deepEqual(CARD[id].clothing.receiver, ['SKIN_ACCESS', 'UNDERWEAR_OFF']); }
});
test('acceso directo: bloqueadas con pantalón o calzoncillos puestos; elegibles a piel; solo con pene declarado', () => {
  for (const recv of [{ ...NAKED(), bottoms: 'ON', boxers: 'ON' }, { ...NAKED(), boxers: 'ON' }]) { const e = mk({ level: 3, seed: 1, clothing: [NAKED(), recv] }); for (const id of [...GL, ...TE]) assert.ok(!ids(e).has(id), id); }
  const e = mk({ level: 3, seed: 1, clothing: [NAKED(), NAKED()] }); for (const id of [...GL, ...TE]) assert.ok(ids(e).has(id), id);
  const noPene = mk({ level: 3, seed: 1, clothing: [NAKED(), NAKED()], prefs: { bodyParts: [['vulva', 'senos'], ['vulva']] } }); for (const id of [...GL, ...TE]) assert.ok(!ids(noPene).has(id), id);
  assert.ok(!ids(e, 1).has('I34'), 'Ana no tiene glande: nadie actúa sobre ella con estas cartas');
});
test('diversidad: con acceso directo, el lado de Leo no se encadena pene → glande → testículos', () => {
  let chains3 = 0, intimate = 0, cards = 0;
  for (let seed = 1; seed <= 100; seed++) { const e = mk({ level: 3, seed, clothing: [NAKED(), NAKED()] }); let run = 0; for (let i = 0; i < 40; i++) { const r = e.roll(); if (r.actor === 0) { cards++; if (r.parts.some(p => ['penis', 'glans', 'testicles'].includes(p))) { intimate++; run++; if (run >= 3) chains3++; } else run = 0; } else run = 0; } }
  assert.ok(intimate / cards < 0.45, `cuota íntima en Leo ${intimate / cards}`); assert.ok(chains3 / 100 < 0.5, `cadenas de 3: ${chains3 / 100} por sesión`);
});
