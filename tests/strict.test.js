/* ACTION × ACTOR TOOL × TARGET estricto: repertorio deliberado por zona, REJECTED / UNREVIEWED nunca salen, cuerpo con cuerpo
   solo por blueprint posicional aprobado. Caso de partida (prueba real): «Sopla sobre las clavículas de Val, muy cerca de la piel». */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../engine/engine.js';
import { COMBOS, COMBO, REJECTED_COMBOS, REJECTED_REASON, statusOf, possibleCombinations, unreviewedCombinations, unreviewedBlueprints, blueprintAvailable, isBodyTool, validateData, TARGETS, ACTOR_TOOLS, ACTIONS, GROUPS, LEVEL_IDS, APPROVED_STATUSES, ALL_STATUSES, REPERTOIRE, POSITIONAL, BLUEPRINTS } from '../engine/grammar.js';
import { criticalCheck } from '../engine/quality.js';
import { PreferenceManager } from '../engine/prefs.js';
import { realize } from '../engine/realizer.js';
import { Rng } from '../engine/rng.js';
import { serializeRepertoire, serializePositional } from '../engine/repertoireIO.js';

const ALL = Object.keys(GROUPS);
const mk = (o = {}) => new GameEngine({ prefs: { names: ['Val', 'Leo'], bodyParts: [['vulva'], ['pene']], enabledGroups: ALL, ...o.prefs }, seed: o.seed ?? 42, level: o.level ?? 2 });
const rolls = (e, n) => Array.from({ length: n }, () => e.roll());

test('SOPLAR + CLAVÍCULAS es REJECTED con motivo y nunca sale', () => {
  assert.equal(statusOf('BLOW', 'breath', 'collarbones'), 'REJECTED');
  assert.ok(REJECTED_REASON['BLOW|breath|collarbones']);
  assert.equal(COMBO['BLOW|breath|collarbones'], undefined);
  for (const L of LEVEL_IDS) for (const r of rolls(mk({ level: L, seed: 100 + L }), 600)) assert.ok(!(r.action === 'BLOW' && r.target === 'collarbones'), r.phrase);
  const chk = criticalCheck({ action: 'BLOW', tool: 'breath', target: 'collarbones', text: 'x', duration: 15, intensity: 3.5 }, { prefs: mk().prefs, level: 2 });
  assert.ok(chk.reasons.includes('TARGET_INCOMPATIBLE'));
});
test('las clavículas tienen un repertorio explícito: solo las familias aprobadas a mano, nada por regla genérica', () => {
  const approved = COMBOS.filter(c => c.target === 'collarbones').map(c => `${c.action}|${c.tool}`).sort();
  assert.deepEqual(approved, ['BITE|teeth', 'BRUSH|fingers', 'BRUSH|fingertips', 'BRUSH|lips', 'BRUSH|nose', 'BRUSH|oneFinger', 'CARESS|oneHand', 'HOVER|breath', 'HOVER|lips', 'KISS|lips', 'LICK|tongueTip']);
  assert.deepEqual(Object.keys(REPERTOIRE.collarbones.rejectedActions).sort(), ['BLOW|breath', 'SUCK|mouth']);
  for (const u of possibleCombinations().filter(u => u.target === 'collarbones')) assert.ok(['EXCELLENT', 'GOOD', 'VALID', 'REJECTED', 'UNREVIEWED'].includes(u.status));
});
test('cada relación acción · herramienta · zona tiene exactamente un status y solo EXCELLENT / GOOD / VALID compilan', () => {
  assert.deepEqual(ALL_STATUSES, ['EXCELLENT', 'GOOD', 'VALID', 'REJECTED', 'UNREVIEWED']);
  for (const c of COMBOS) assert.ok(APPROVED_STATUSES.includes(c.status), c.key);
  for (const k of REJECTED_COMBOS) { assert.equal(COMBO[k], undefined, k); assert.ok(REJECTED_REASON[k] && REJECTED_REASON[k].length > 3, `motivo en ${k}`); }
  for (const u of unreviewedCombinations()) { const k = `${u.action}|${u.tool}|${u.target}`; assert.equal(statusOf(u.action, u.tool, u.target), 'UNREVIEWED'); assert.equal(COMBO[k], undefined); }
  // nada fuera del repertorio sale: 3 niveles × muchas rondas, toda ronda tiene status aprobado
  for (const L of LEVEL_IDS) for (const r of rolls(mk({ level: L, seed: 7 + L }), 400)) { assert.ok(APPROVED_STATUSES.includes(r.status), r.phrase); assert.equal(statusOf(r.action, r.tool, r.target) === 'REJECTED', false); if (r.kind === 'CARTESIAN') assert.ok(APPROVED_STATUSES.includes(statusOf(r.action, r.tool, r.target)), r.key); }
});
test('el pase editorial dejó fuera lo técnicamente posible pero editorialmente pobre', () => {
  for (const k of ['BLOW|breath|back', 'BLOW|breath|abdomen', 'BLOW|breath|flanks', 'SUCK|mouth|shoulders', 'SUCK|mouth|flanks', 'BITE|teeth|waist', 'BITE|teeth|hips', 'TICKLE|fingers|shoulders', 'BRUSH|nose|abdomen', 'REST|oneHand|flanks', 'SQUEEZE|oneHand|flanks', 'CARESS|oneHand|ankles']) { assert.ok(REJECTED_COMBOS.has(k), k); assert.equal(COMBO[k], undefined, k); }
  // la frase genérica «Pasa la mano por…» no puede caer sobre anatomía íntima
  const rng = new Rng(3);
  for (let i = 0; i < 60; i++) for (const z of ['clitoris', 'vulva', 'penis']) { const r = realize({ key: `CARESS|oneHand|${z}`, action: 'CARESS', tool: 'oneHand', target: z, style: null, level: 3, pattern: 'GIVE' }, { partner: 'Val', rng, recentShapes: [] }); assert.ok(!/Pasa la mano/.test(r.text), r.text); }
});
test('cuerpo con cuerpo solo existe como blueprint posicional APPROVED; nunca por producto cartesiano', () => {
  for (const c of COMBOS) { if (isBodyTool(c.tool)) assert.equal(c.kind, 'POSITIONAL', c.key); if (c.kind === 'POSITIONAL') { assert.ok(c.key.startsWith('POS:')); assert.equal(c.blueprint.status, 'APPROVED'); assert.equal(c.blueprint.semanticFamily, 'BODY_TO_BODY'); assert.ok(c.blueprint.copyVariants.length >= 1); } }
  for (const [tid, rep] of Object.entries(REPERTOIRE)) for (const at of Object.keys(rep.approvedActions)) assert.ok(!isBodyTool(at.split('|')[1]), `${tid}: ${at}`);
  assert.ok(BLUEPRINTS.length >= 20);
  // el motor las genera de verdad, con copy propio, y la ficha de la ronda las identifica
  let seen = 0; for (const L of LEVEL_IDS) for (const r of rolls(mk({ level: L, seed: 20 + L }), 500)) if (r.kind === 'POSITIONAL') { seen++; assert.ok(r.key.startsWith('POS:') && r.blueprintId, r.phrase); assert.equal(r.validation, 'VALID', r.phrase); assert.ok(!/\{|\}/.test(r.phrase)); }
  assert.ok(seen > 20, `posicionales generadas ${seen}`);
});
test('un blueprint UNREVIEWED no entra: la propuesta del diseñador (anatomía con pene → senos, Intimidad) existe en la cola y no en el generador', () => {
  const b = POSITIONAL.find(x => x.id === 'penis-between-breasts');
  assert.ok(b); assert.equal(b.status, 'UNREVIEWED'); assert.equal(b.type, 'POSITIONAL'); assert.equal(b.semanticFamily, 'BODY_TO_BODY'); assert.deepEqual(b.allowedLevels, [3]);
  assert.deepEqual(b.actorRequirements, [{ part: 'penis', anatomy: 'pene' }]); assert.deepEqual(b.receiverRequirements, [{ part: 'breasts' }]);
  assert.deepEqual(b.copyVariants, [], 'el copy explícito no se inventa: lo redacta el diseñador');
  assert.equal(COMBO['POS:penis-between-breasts'], undefined);
  assert.ok(unreviewedBlueprints().some(x => x.id === b.id));
  for (const r of rolls(mk({ level: 3, seed: 5 }), 800)) assert.notEqual(r.blueprintId, 'penis-between-breasts');
  // un blueprint APPROVED sin copy o sin tier no pasa la validación
  const bad = { ...b, status: 'APPROVED' }; POSITIONAL.push(bad); const v = validateData(); POSITIONAL.pop();
  assert.ok(v.errors.some(e => /APPROVED sin copy/.test(e)) && v.errors.some(e => /sin tier/.test(e)));
});
test('los requisitos corporales de un blueprint se comprueban en los dos cuerpos', () => {
  const b = POSITIONAL.find(x => x.id === 'penis-between-breasts');
  const p = new PreferenceManager({ bodyParts: [['pene'], ['vulva']], enabledGroups: ALL }); p.partner = 1; // actúa 0 (pene) sobre 1 (senos activos)
  assert.equal(blueprintAvailable(b, p), true);
  p.partner = 0; assert.equal(blueprintAvailable(b, p), false); // ahora actúa quien no tiene pene
  const q = new PreferenceManager({ bodyParts: [['pene'], ['vulva']], enabledGroups: ALL.filter(g => g !== 'senos') }); q.partner = 1;
  assert.equal(blueprintAvailable(b, q), false); // senos desactivados
  const c = COMBO['POS:rub-chest-breasts']; const r = new PreferenceManager({ bodyParts: [[], []], enabledGroups: ALL.filter(g => g !== 'senos') }); r.partner = 1;
  assert.ok(criticalCheck({ key: c.key, action: c.action, tool: c.tool, target: c.target, text: 'x', duration: 20, intensity: 6, level: 2 }, { prefs: r, level: 2 }).reasons.includes('ANATOMY_INCOMPATIBLE'));
});
test('los estilos preferidos de la zona pesan más y las duraciones por zona viven en el repertorio', () => {
  assert.deepEqual(REPERTOIRE.collarbones.preferredStyles, ['SLOW', 'SOFT']);
  assert.deepEqual(REPERTOIRE.lips.durationOverrides.KISS, [15, 60]);
  const e = mk({ level: 2, seed: 9 }); const c = COMBO['KISS|lips|collarbones']; assert.deepEqual(c.styles, ['SLOW', 'SOFT', 'INTERMITTENT']);
  const mods = e.director.modifiers('MAINTAIN', e.session, e.history); let pref = 0;
  for (let i = 0; i < 300; i++) { const st = e.pickStyle(c, 2, c.intensity + 0.3, mods); if (['SLOW', 'SOFT'].includes(st)) pref++; }
  assert.ok(pref / 300 > 0.72, `preferidos ${pref}/300 (sin preferencia serían ~2/3)`);
});
test('exportar y volver a cargar el repertorio y los blueprints no cambia nada (Content Lab escribe el mismo formato)', async () => {
  const { writeFileSync, mkdtempSync } = await import('node:fs'); const { tmpdir } = await import('node:os'); const { join } = await import('node:path');
  const dir = mkdtempSync(join(tmpdir(), 'pab-'));
  writeFileSync(join(dir, 'r.js'), serializeRepertoire(REPERTOIRE, { reviewedAt: '2026-11-01' })); writeFileSync(join(dir, 'p.js'), serializePositional(POSITIONAL));
  const r2 = (await import('file://' + join(dir, 'r.js'))).REPERTOIRE, p2 = (await import('file://' + join(dir, 'p.js'))).POSITIONAL;
  const canon = rep => JSON.stringify(Object.fromEntries(Object.entries(rep).map(([t, r]) => [t, { ...r, approvedActions: Object.fromEntries(Object.entries(r.approvedActions).sort().map(([k, v]) => [k, typeof v === 'string' ? { status: v } : v])), rejectedActions: Object.fromEntries(Object.entries(r.rejectedActions || {}).sort()) }])));
  assert.equal(canon(r2), canon(REPERTOIRE)); assert.equal(JSON.stringify(p2), JSON.stringify(POSITIONAL));
});
test('la auditoría solo lee: el universo técnico cubre todo, UNREVIEWED nunca se promociona', () => {
  const u = possibleCombinations(); assert.ok(u.length > 1500);
  const before = COMBOS.length; unreviewedCombinations(); unreviewedBlueprints(); assert.equal(COMBOS.length, before);
  for (const x of u) assert.equal(x.status, statusOf(x.action, x.tool, x.target));
});
