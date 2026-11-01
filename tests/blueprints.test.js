/* Cobertura de blueprints y de condiciones: ningún blueprint muerto, ninguna condición huérfana. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTION, CONDITION, CONDITIONS, LEVELS, GROUPS } from '../engine/catalog.js';
import { BLUEPRINTS, BLUEPRINT, blueprintCompositions, blueprintAllowsCondition, supportsSetupCondition, blueprintFor } from '../engine/blueprints.js';
import { PreferenceManager } from '../engine/prefs.js';
import { PATTERNS } from '../engine/catalog.js';
import { GameEngine } from '../engine/engine.js';
import { THRESHOLD } from '../engine/quality.js';

const prefs = new PreferenceManager({ bodyParts: [['vulva'], ['pene']], enabledGroups: Object.keys(GROUPS) });
test('cada blueprint tiene nivel válido, patrón, familia, acciones existentes, condiciones existentes y al menos una composición válida', () => {
  for (const b of BLUEPRINTS) {
    assert.ok(Object.keys(b.levels).length, b.id + ' sin nivel');
    assert.ok(PATTERNS[b.pattern], b.id + ' patrón');
    assert.ok(b.family, b.id + ' familia');
    for (const a of b.actions) assert.ok(ACTION[a], `${b.id}: acción ${a}`);
    for (const t of ['interaction', 'setup']) for (const c of b.conditions[t]) assert.ok(CONDITION[c], `${b.id}: condición ${c}`);
    if (Array.isArray(b.conditions.light)) for (const c of b.conditions.light) assert.ok(CONDITION[c] && CONDITION[c].tier === 'LIGHT', `${b.id}: light ${c}`);
    for (const c of b.conditions.setup) assert.equal(CONDITION[c].tier, 'SETUP', `${b.id}: ${c} no es SETUP`);
    for (const c of b.conditions.interaction) assert.equal(CONDITION[c].tier, 'INTERACTION', `${b.id}: ${c} no es INTERACTION`);
    if (b.requires) assert.ok(b.conditions.setup.includes(b.requires), b.id + ' exige una condición que no admite');
    const comps = Object.keys(b.levels).map(L => blueprintCompositions(b, Number(L), prefs).length);
    assert.ok(comps.some(n => n > 0), `${b.id}: sin composiciones válidas en sus niveles`);
  }
});
test('cada acción pertenece a algún blueprint y cada condición declara nivel y tiene al menos un blueprint que la admite', () => {
  for (const a of Object.values(ACTION)) assert.ok(blueprintFor(a.id, a.zones[0]), a.id + ' sin blueprint');
  for (const c of CONDITIONS) {
    assert.ok(['LIGHT', 'INTERACTION', 'SETUP'].includes(c.tier), c.id);
    assert.ok(BLUEPRINTS.some(b => blueprintAllowsCondition(b, c)), c.id + ' huérfana');
  }
});
test('calidad base: cada blueprint produce al menos una ronda por encima del umbral cuando se le pide', () => {
  for (const b of BLUEPRINTS) {
    const L = Number(Object.keys(b.levels).sort((x, y) => b.levels[y] - b.levels[x])[0]);
    const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva'], ['pene']], enabledGroups: Object.keys(GROUPS) }, seed: 7, level: L });
    let ok = false;
    for (const a of b.actions) { const combo = e.generate({ keep: { action: a } }); if (combo.blueprint === b.id && !combo.fallback && combo.quality >= THRESHOLD) { ok = true; break; } }
    assert.ok(ok, `${b.id} (nivel ${L}) no produce nada por encima del umbral`);
  }
});
test('una condición SETUP solo la admite un blueprint que la declara: nunca por inferencia', () => {
  const venda = CONDITION.vendados;
  for (const b of BLUEPRINTS) assert.equal(blueprintAllowsCondition(b, venda), b.conditions.setup.includes('vendados'), b.id);
  assert.ok(supportsSetupCondition(BLUEPRINT.aCiegas, venda) && !supportsSetupCondition(BLUEPRINT.cuerpoMovimiento, venda));
});
