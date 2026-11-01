/* Migración a tres niveles: 01 Conexión · 02 Deseo (con rango interno) · 03 Intimidad.
   Exploración deja de existir como nivel de producto; lo guardado con cuatro niveles se migra. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, migrateFavorite } from '../engine/engine.js';
import { LEVELS, LEVEL_IDS, LEVEL_KEYS, LEVEL_BY_KEY, COMBOS, TARGETS, GROUPS, migrateLevelId, desireBand, levelWeight, ACTIONS_LIST, TARGETS_LIST } from '../engine/grammar.js';
import { LEVEL_COPY } from '../engine/session.js';
import { TARGET_BUCKETS } from '../engine/intensity.js';
import { FALLBACKS } from '../engine/quality.js';
import { LEVEL_DURATION } from '../engine/data/durations.js';

const ALL = Object.keys(GROUPS);
const mk = (o = {}) => new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva'], ['pene']], enabledGroups: ALL, ...o.prefs }, seed: o.seed ?? 42, level: o.level ?? 2 });

test('only three levels exist', () => {
  assert.deepEqual(LEVEL_IDS, [1, 2, 3]);
  assert.deepEqual(Object.keys(LEVELS).map(Number), [1, 2, 3]);
  assert.deepEqual(LEVEL_KEYS, ['conexion', 'deseo', 'intimidad']);
  assert.deepEqual(LEVELS[1].name, 'Conexión'); assert.deepEqual(LEVELS[2].name, 'Deseo'); assert.deepEqual(LEVELS[3].name, 'Intimidad');
  for (const o of [TARGET_BUCKETS, FALLBACKS, LEVEL_DURATION, LEVEL_COPY]) assert.deepEqual(Object.keys(o).map(Number), [1, 2, 3]);
  for (const a of ACTIONS_LIST) { for (const L of a.allowedLevels) assert.ok(LEVELS[L], a.id); for (const k of Object.keys(a.levelWeights)) assert.ok(LEVELS[k], a.id); }
  for (const z of TARGETS_LIST) { for (const L of z.allowedLevels) assert.ok(LEVELS[L], z.id); if (z.levelWeights) for (const k of Object.keys(z.levelWeights)) assert.ok(LEVELS[k], z.id); }
  for (const c of COMBOS) for (const L of c.levels) assert.ok(LEVELS[L], c.key);
});

test('EXPLORATION cannot be selected', () => {
  assert.ok(!Object.values(LEVELS).some(L => /explor/i.test(L.key) || /explor/i.test(L.name)));
  const e = mk({ level: 2 });
  assert.ok(!e.setLevel(4)); assert.equal(e.level(), 2); // 4 ya no existe: no se selecciona
  e.setLevel(2); assert.equal(e.level(), 2);
  assert.equal(LEVEL_BY_KEY.exploracion, 2); // la clave antigua apunta a Deseo
});

test('EXPLORATION cannot be generated: every round belongs to one of the three levels and respects its band', () => {
  for (const L of LEVEL_IDS) {
    const e = mk({ level: L, seed: 100 + L });
    for (let i = 0; i < 200; i++) { const r = e.roll(); assert.ok(LEVEL_IDS.includes(r.level)); assert.equal(r.level, L); assert.equal(r.levelName, LEVELS[L].name); assert.ok(r.intensity >= LEVELS[L].lo - 1e-9 && r.intensity <= LEVELS[L].max + 1e-9, `${r.intensity} ${r.phrase}`); }
  }
});

test('legacy EXPLORATION migrates to DESIRE (favorites, saved level keys, numeric ids)', () => {
  assert.equal(migrateLevelId(3), 2); assert.equal(migrateLevelId(4), 3); assert.equal(migrateLevelId(2), 2); assert.equal(migrateLevelId(1), 1);
  const old = { id: 'x', action: 'LICK', tool: 'tongue', target: 'innerThighs', level: 3, levelName: 'Exploración', phrase: 'Lame la parte interna de los muslos de Ana.' };
  const m = migrateFavorite(old, 2);
  assert.equal(m.level, 2); assert.equal(m.levelName, 'Deseo');
  const i4 = migrateFavorite({ ...old, level: 4, levelName: 'Intimidad' }, 2); assert.equal(i4.level, 3); assert.equal(i4.levelName, 'Intimidad');
  const already = migrateFavorite({ ...old, level: 2, levelName: 'Deseo' }, 3); assert.equal(already.level, 2); // esquema actual: no se toca
  for (const k of ['exploracion', 'atrevido']) assert.equal(LEVEL_BY_KEY[k], 2);
  const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva'], ['pene']], enabledGroups: ALL, mode: 'exploracion' } });
  assert.equal(e.level(), 2);
});

test('DESIRE supports intra-level intensity: three internal bands, entry from below, weights profiled per band', () => {
  assert.deepEqual(Object.keys(LEVELS[2].bands), ['low', 'mid', 'high']);
  assert.equal(desireBand(4), 'low'); assert.equal(desireBand(6), 'mid'); assert.equal(desireBand(7.5), 'high');
  assert.ok(COMBOS.some(c => c.levels.includes(2) && desireBand(c.intensity) === 'low') && COMBOS.some(c => c.levels.includes(2) && desireBand(c.intensity) === 'high'));
  // pesos [bajo, alto]: el perfil antiguo de Deseo/Exploración sigue vivo dentro del nivel
  assert.ok(ACTIONS_LIST.some(a => Array.isArray(a.levelWeights[2])));
  assert.ok(levelWeight({ 2: [2, 0.5] }, 2, 4) > levelWeight({ 2: [2, 0.5] }, 2, 8));
  // al subir desde Conexión no se salta a lo más intenso
  const e = mk({ level: 1, seed: 7 }); for (let i = 0; i < 6; i++) e.roll();
  e.setLevel(2); const first = [e.roll(), e.roll(), e.roll()];
  for (const r of first) assert.ok(desireBand(r.intensity) !== 'high', `${r.intensity} ${r.phrase}`);
  assert.equal(e.session.band() === null, false);
  // la banda alta existe y se alcanza con la curva de la sesión
  const f = mk({ level: 2, seed: 11 }); let high = 0; for (let i = 0; i < 150; i++) { const r = f.roll(); if (i % 3 === 0) f.feedback('like'); if (desireBand(r.intensity) === 'high') high++; }
  assert.ok(high > 0);
  // «más suave» / «un poco más» mueven la intensidad dentro del nivel, no el nivel
  const g = mk({ level: 2, seed: 13 }); g.roll(); g.feedback('like', { more: true }); assert.ok(g.session.intraLevelIntensity > 0); assert.equal(g.level(), 2);
  g.softer(); assert.ok(g.session.intraLevelIntensity < 0.3); assert.equal(g.level(), 2);
});

test('DESIRE_HIGH never automatically enters INTIMACY', () => {
  const e = mk({ level: 2, seed: 21 });
  for (let i = 0; i < 300; i++) { const r = e.roll(); e.feedback('like', { more: true }); assert.equal(r.level, 2); assert.ok(!TARGETS[r.target].anatomy, r.phrase); assert.ok(r.intensity <= LEVELS[2].max + 1e-9); }
  assert.equal(e.level(), 2);
  assert.ok(e.session.intraLevelIntensity >= 0.9);
});

test('ME_GUSTA never changes level', () => {
  for (const L of LEVEL_IDS) { const e = mk({ level: L, seed: 30 + L }); for (let i = 0; i < 100; i++) { e.roll(); e.feedback('like'); assert.equal(e.level(), L); } }
});

test('feedback never changes level (like/more/less, cambia, paso, softer)', () => {
  for (const L of LEVEL_IDS) {
    const e = mk({ level: L, seed: 40 + L });
    for (let i = 0; i < 60; i++) {
      e.roll(); e.feedback('like', { more: i % 2 === 0 }); assert.equal(e.level(), L);
      e.reroll(); assert.equal(e.level(), L);
      e.pass(); assert.equal(e.level(), L);
      e.softer(); assert.equal(e.level(), L);
    }
  }
});

test('only explicit user action changes level', () => {
  const e = mk({ level: 1, seed: 50 });
  for (let i = 0; i < 80; i++) { e.roll(); if (i % 2) e.feedback('like', { more: true }); }
  assert.equal(e.level(), 1);
  assert.ok(e.setLevel(3)); assert.equal(e.level(), 3); assert.equal(e.session.lastMessage, LEVEL_COPY[3]);
  assert.ok(e.setLevel(1)); assert.equal(e.level(), 1);
  assert.ok(e.setLevel(2)); assert.equal(e.level(), 2);
});
