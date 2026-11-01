import { test } from 'node:test';
import assert from 'node:assert/strict';
import { durationRange, durationOptions, pickDuration, formatDuration } from '../engine/duration.js';
import { BASE_RANGE, HUMAN_DURATIONS, LONG_DURATION } from '../engine/data/durations.js';
import { COMBOS } from '../engine/grammar.js';
import { Rng } from '../engine/rng.js';

test('rangos base de las acciones del modelo', () => {
  assert.deepEqual(BASE_RANGE.RUB, [15, 60]); assert.deepEqual(BASE_RANGE.SQUEEZE, [15, 35]); assert.deepEqual(BASE_RANGE.MASSAGE, [15, 120]); assert.deepEqual(BASE_RANGE.LICK, [15, 30]); assert.deepEqual(BASE_RANGE.SUCK, [15, 75]);
  assert.deepEqual(BASE_RANGE.STIMULATE, [15, 120]); assert.deepEqual(BASE_RANGE.TICKLE, [15, 20]); assert.deepEqual(BASE_RANGE.BRUSH, [15, 60]); assert.deepEqual(BASE_RANGE.KISS, [15, 120]); assert.deepEqual(BASE_RANGE.CARESS, [15, 45]);
});
test('toda duración es un valor humano discreto y 180 solo donde se permite', () => {
  const rng = new Rng(3);
  for (const c of COMBOS) for (const L of c.levels) for (const st of [null, ...c.styles]) for (let i = 0; i < 5; i++) {
    const d = pickDuration(c.action, c.target, st, L, rng);
    assert.ok([...HUMAN_DURATIONS, LONG_DURATION].includes(d), `${c.key} ${st} → ${d}`);
    if (d === LONG_DURATION) assert.ok(['MASSAGE', 'HUG', 'HAIR_PLAY'].includes(c.action) && st === 'SLOW', `${c.key} ${st} 180`);
  }
});
test('el estilo mueve la duración: SLOW alarga, FAST acorta, INTERMITTENT necesita tiempo; nunca azar continuo', () => {
  const mean = (a, t, s, L) => { const o = durationOptions(a, t, s, L); const w = o.reduce((x, y) => x + y.weight, 0); return o.reduce((x, y) => x + y.seconds * y.weight, 0) / w; };
  assert.ok(mean('LICK', 'innerThighs', 'SLOW', 3) > mean('LICK', 'innerThighs', null, 3));
  assert.ok(mean('STIMULATE', 'clitoris', 'FAST', 4) < mean('STIMULATE', 'clitoris', null, 4));
  assert.ok(durationRange('CARESS', 'back', 'INTERMITTENT', 1).min >= 20);
  const o = durationOptions('MASSAGE', 'back', null, 1); assert.ok(o.length >= 3); assert.ok(o.every(x => Number.isInteger(x.seconds)));
  const ws = o.map(x => x.weight); assert.ok(Math.max(...ws) / Math.min(...ws) > 1.5, 'pesos no uniformes');
});
test('zonas sensibles acortan: TICKLE 15–20, SUCK pezones ≤ 45; formato mm:ss', () => {
  for (const d of durationOptions('TICKLE', 'flanks', null, 1)) assert.ok(d.seconds <= 20);
  for (const d of durationOptions('SUCK', 'nipples', null, 4)) assert.ok(d.seconds <= 45);
  assert.equal(formatDuration(30), '00:30'); assert.equal(formatDuration(90), '01:30');
});
