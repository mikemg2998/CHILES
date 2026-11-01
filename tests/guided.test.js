/* Patrón GUIDED: quien recibe guía con su mano a quien actúa. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../engine/engine.js';
import { COMBOS, COMBO, guidable, TARGETS, ACTOR_TOOLS, GROUPS, ACTIONS, LEVEL_IDS } from '../engine/grammar.js';
import { GUIDABLE_ACTIONS } from '../engine/data/compatibility.js';
import { realize, humanLikeness } from '../engine/realizer.js';
import { criticalCheck } from '../engine/quality.js';
import { Rng } from '../engine/rng.js';

const ALL = Object.keys(GROUPS);
const mk = (o = {}) => new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva'], ['pene']], enabledGroups: ALL, ...o.prefs }, seed: o.seed ?? 42, level: o.level ?? 2, debug: true });

test('solo acciones que se dejan guiar, hechas con la mano, sobre zonas al alcance de la mano de quien recibe', () => {
  for (const c of COMBOS.filter(c => c.guidable)) {
    assert.ok(GUIDABLE_ACTIONS.includes(c.action), c.key);
    assert.equal(ACTOR_TOOLS[c.tool].kind, 'hand', c.key); // la mano de quien recibe se posa sobre la mano de quien actúa
    assert.ok(TARGETS[c.target].tags.includes('frontal'), c.key); // la posición lo permite: quien recibe llega con su mano
    assert.notEqual(TARGETS[c.target].family, 'brazos', c.key); // guiar una mano sobre la propia mano sería redundante
  }
  assert.equal(guidable('KISS', 'lips', 'neck'), false); assert.equal(guidable('CARESS', 'oneHand', 'back'), false); assert.equal(guidable('CARESS', 'oneHand', 'hands'), false);
  assert.equal(guidable('CARESS', 'oneHand', 'abdomen'), true); assert.equal(guidable('STIMULATE', 'fingers', 'clitoris'), true);
  assert.equal(criticalCheck({ action: 'KISS', tool: 'lips', target: 'neck', pattern: 'GUIDED', text: 'x', duration: 20, intensity: 4 }, { prefs: mk().prefs, level: 2 }).reasons.includes('GUIDED_NOT_SUPPORTED'), true);
});
test('el texto guiado suena humano: una sola idea de guía, sin redundancias ni nombre repetido', () => {
  const rng = new Rng(7); let ok = 0, all = 0;
  for (const c of COMBOS.filter(c => c.guidable)) for (let i = 0; i < 4; i++) {
    const r = realize({ action: c.action, tool: c.tool, target: c.target, style: null, level: c.levels[0], pattern: 'GUIDED' }, { partner: 'Ana', rng, recentShapes: [] });
    all++; if (!r) continue; ok++; // sin una frase base corta donde quepa la guía, el motor la hace sin guía
    assert.ok(/mano/.test(r.text), r.text);
    assert.ok(!/mano guíe tu mano|tu mano mientras su mano/.test(r.text), r.text);
    assert.ok((r.text.split('Ana').length - 1) <= 1, 'nombre repetido: ' + r.text);
    assert.ok(!r.humanFlags.some(f => f.startsWith('REPEATED_WORD')), r.text);
    assert.ok(r.humanLikeness >= 0.6, `${r.humanLikeness} ${r.text}`);
    assert.ok(['pace', 'pressure', 'movement'].includes(r.guidedAffects));
  }
  assert.ok(ok / all > 0.7, `guiables verbalizadas ${ok}/${all}`);
  // varias estructuras
  const seen = new Set(); for (let i = 0; i < 30; i++) seen.add(realize({ action: 'CARESS', tool: 'oneHand', target: 'abdomen', style: null, level: 2, pattern: 'GUIDED' }, { partner: 'Ana', rng, recentShapes: [] }).text.replace(/^[^,;.]+/, ''));
  assert.ok(seen.size >= 4);
});
test('en sesión: GUIDED aparece con razón (no al azar sobre cualquier cosa), en ambas direcciones, sin tocar el nivel', () => {
  for (const L of [2, 3]) {
    const e = mk({ level: L, seed: 70 + L });
    const rs = []; for (let i = 0; i < 300; i++) { rs.push(e.roll()); if (i % 3 === 0) e.feedback('like'); }
    const g = rs.filter(r => r.pattern === 'GUIDED');
    assert.ok(g.length >= 6 && g.length <= 90, `nivel ${L}: ${g.length}`);
    for (const r of g) { assert.ok(COMBO[`${r.action}|${r.tool}|${r.target}`].guidable, r.phrase); assert.equal(r.level, L); assert.equal(r.validation, 'VALID'); assert.ok(e.prefs.availableFor(1 - r.performer, r.target)); }
    assert.ok(g.some(r => r.performer === 0) && g.some(r => r.performer === 1), 'ambas direcciones');
    rs.forEach((r, i) => { if (i && r.pattern === 'GUIDED') assert.ok(!(rs[i - 1].pattern === 'GUIDED'), 'guiados encadenados'); });
    assert.equal(e.level(), L);
  }
});
test('«hoy no: guiar con la mano» lo aparta; ME GUSTA en una guiada no cambia de nivel', () => {
  const e = mk({ level: 2, seed: 5 }); e.setPrefs(0, { guia: 'no' });
  for (let i = 0; i < 200; i++) assert.notEqual(e.roll().pattern, 'GUIDED');
  const f = mk({ level: 2, seed: 8 }); let r; do { r = f.roll(); } while (r.pattern !== 'GUIDED');
  f.feedback('like'); f.roll(); assert.equal(f.level(), 2);
});
