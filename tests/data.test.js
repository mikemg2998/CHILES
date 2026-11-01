/* Validación estructural de los datos editables: cualquier error aquí es un fallo de la build. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateData, COMBOS, COMBO, REJECTED_COMBOS, unreviewedCombinations, ACTIONS_LIST, TARGETS_LIST, ACTOR_TOOLS, STYLE_IDS, LEVELS, mechanics, statusOf, APPROVED_STATUSES } from '../engine/grammar.js';
import { REPERTOIRE } from '../engine/data/repertoire.js';
import { BASE_ACTIONS } from '../engine/data/actions.js';
import { SHAPES } from '../engine/data/shapes.js';

test('los datos pasan la validación estructural (zonas, herramientas, acciones, estilos, rangos, niveles, realizador)', () => {
  const v = validateData();
  assert.deepEqual(v.errors, []);
  assert.ok(v.ok);
});
test('ids de zona normalizados: los del modelo existen y las zonas íntimas están diferenciadas', () => {
  const ids = new Set(TARGETS_LIST.map(t => t.id));
  for (const id of ['lips', 'nose', 'ears', 'neck', 'forehead', 'cheeks', 'shoulders', 'upperArms', 'forearms', 'hands', 'fingers', 'armpits', 'chest', 'breasts', 'nipples', 'collarbones', 'abdomen', 'groin', 'innerThighs', 'outerThighs', 'buttocks', 'vagina', 'vulva', 'clitoris', 'penis', 'glans', 'testicles', 'calves', 'feet', 'toes', 'poplitealArea', 'hips', 'waist', 'back', 'anus']) assert.ok(ids.has(id), id);
  for (const t of TARGETS_LIST) { assert.ok(/^[a-z][A-Za-z]*$/.test(t.id), t.id); assert.ok(t.n && !/poplít|clínic/i.test(t.n), 'nombre natural'); }
  assert.notEqual(COMBO['CARESS|oneHand|vulva'], undefined); assert.equal(COMBO['CARESS|oneHand|vagina'], undefined);
});
test('solo las combinaciones EXCELLENT / GOOD / VALID entran; REJECTED nunca; lo no revisado no es elegible', () => {
  for (const c of COMBOS.filter(c => c.kind === 'CARTESIAN')) { const v = REPERTOIRE[c.target].approvedActions[`${c.action}|${c.tool}`]; assert.ok(v, c.key); assert.ok(APPROVED_STATUSES.includes(typeof v === 'string' ? v : v.status), c.key); assert.equal(statusOf(c.action, c.tool, c.target), c.status); }
  for (const k of REJECTED_COMBOS) { assert.equal(COMBO[k], undefined, k); const [a, t, z] = k.split('|'); assert.equal(statusOf(a, t, z), 'REJECTED'); }
  const un = unreviewedCombinations();
  assert.ok(un.length > 0);
  for (const u of un) assert.equal(COMBO[`${u.action}|${u.tool}|${u.target}`], undefined);
  // ninguna combinación íntima fue inventada: todas las aprobadas con anatomía íntima proceden del catálogo migrado (nivel 4, acciones de la lista)
  for (const c of COMBOS.filter(c => TARGETS_LIST.find(t => t.id === c.target).anatomy)) { assert.deepEqual(c.levels, [3], c.key); assert.ok(['CARESS', 'BRUSH', 'KISS', 'SUCK', 'LICK', 'HOVER', 'STIMULATE', 'INSERT'].includes(c.action), c.key); }
  assert.equal(COMBOS.filter(c => c.target === 'anus').length, 0);
});
test('las diez acciones base existen con metadatos propios y cada acción tiene realizador', () => {
  for (const id of BASE_ACTIONS) { const a = ACTIONS_LIST.find(x => x.id === id); assert.ok(a, id); assert.ok(a.allowedActorTools.length && a.semanticFamily && a.movementType && a.pressureProfile); assert.ok(SHAPES[id].length >= 2, `${id} necesita varias formas`); }
  for (const a of ACTIONS_LIST) for (const t of a.allowedActorTools) assert.ok(ACTOR_TOOLS[t], t);
  const names = ACTIONS_LIST.map(a => a.name.toLowerCase()); assert.equal(new Set(names).size, names.length, 'sin nombres repetidos');
});
test('estilos: intersección acción ∩ zona; nada FIRM sobre zonas de baja tolerancia a la presión', () => {
  for (const c of COMBOS) { const a = ACTIONS_LIST.find(x => x.id === c.action), z = TARGETS_LIST.find(t => t.id === c.target); for (const s of c.styles) { assert.ok(a.styles.includes(s) && z.allowedStyles.includes(s), `${c.key} ${s}`); assert.ok(STYLE_IDS.includes(s)); } if (z.pressureTolerance === 'low') assert.ok(!c.styles.includes('FIRM'), c.key); }
});
test('biomecánica: ninguna combinación aprobada exige una posición compleja ni una herramienta que no puede hacer la acción', () => {
  for (const c of COMBOS.filter(c => c.kind === 'CARTESIAN')) { const m = mechanics(c.action, c.tool, c.target); assert.ok(m.ok, `${c.key}: ${m.code}`); assert.ok(m.complexity < 2); }
  assert.equal(mechanics('LICK', 'tongue', 'feet').ok, false);
  assert.equal(mechanics('BITE', 'teeth', 'toes').ok, false);
  assert.equal(mechanics('MASSAGE', 'nose', 'back').ok, false);
});
test('niveles: toda combinación tiene al menos un nivel y las íntimas solo Intimidad', () => {
  for (const c of COMBOS) { assert.ok(c.levels.length, c.key); for (const L of c.levels) assert.ok(LEVELS[L]); }
});
