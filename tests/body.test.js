/* Tests de mecánica corporal: lo que el azar ya no puede inventar. node --test 'tests/*.test.js' */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTION, ZONE, CONDITION, ACTIONS } from '../engine/catalog.js';
import { mechanicsCheck, bodyRelation, mechanicsScores, auditCatalog, orientConflict } from '../engine/body.js';
import { CompatibilityEngine as CE } from '../engine/compat.js';

test('movimiento imposible: un gesto que exige frotar no entra donde la relación corporal no deja moverse', () => {
  const rel = bodyRelation(ACTION.frotarPecho, ZONE.pecho); // tumbados: la frase aporta la postura y libera el movimiento
  assert.ok(rel.ok && rel.freedom >= rel.minFreedom);
  const sinPostura = { ...ACTION.frotarPecho, id: 'x', tags: ['movimiento'], mechanics: { movement: 'rub' } }; // misma acción sin postura en la frase
  const r2 = mechanicsCheck(sinPostura, ZONE.senos);
  assert.ok(!r2.ok && r2.reasons.includes('INSUFFICIENT_MOVEMENT_FREEDOM'), r2.reasons.join());
});
test('posición demasiado compleja: la boca en zonas del suelo o tras las rodillas se rechaza sin blueprint que la coloque', () => {
  for (const z of ['pies', 'tobillos', 'rodillas']) { const m = mechanicsCheck(ACTION.besar, ZONE[z]); assert.ok(!m.ok && m.reasons.includes('POSITION_TOO_COMPLEX'), z); }
  assert.ok(mechanicsCheck(ACTION.masajear, ZONE.pies).ok, 'las manos sí llegan a los pies');
});
test('parte que actúa incorrecta: el torso, la pelvis y las piernas solo entran por relaciones declaradas', () => {
  const caderasEnCuello = { ...ACTION.pegarCaderas, id: 'y' };
  const m = mechanicsCheck(caderasEnCuello, ZONE.cuello);
  assert.ok(!m.ok && m.reasons[0] === 'BIOMECHANICS_UNNATURAL');
  const pelvisQueDesliza = { ...ACTION.pegarCaderas, id: 'z', tags: ['movimiento'] }; // deslizar no es un movimiento de la pelvis
  assert.equal(mechanicsCheck(pelvisQueDesliza, ZONE.gluteos).reasons[0], 'ACTION_BODY_PART_INCOMPATIBLE');
});
test('target incorrecto: el rostro no actúa sobre anatomía íntima', () => {
  const m = mechanicsCheck({ ...ACTION.recorrerNariz, id: 'n' }, ZONE.vulva);
  assert.ok(!m.ok);
});
test('orientación incompatible: «desde atrás» no cabe en un gesto frente a frente ni «tumbados» en uno de pie', () => {
  assert.ok(orientConflict('BEHIND', 'FACE') && orientConflict('LYING', 'STANDING') && !orientConflict('BEHIND', 'BEHIND'));
  assert.ok(!mechanicsCheck(ACTION.frenteConFrente, ZONE.frente, CONDITION.detras).ok);
  assert.ok(!mechanicsCheck(ACTION.mecer, ZONE.cintura, CONDITION.tumbados).ok);
  assert.ok(!CE.conditionFits(CONDITION.detras, ACTION.rodearConPiernas, ZONE.cintura, null));
  assert.ok(mechanicsCheck(ACTION.masajear, ZONE.espalda, CONDITION.detras).ok, 'un masaje en la espalda desde atrás es natural');
});
test('falta de libertad de movimiento penaliza y la postura en la frase la recupera', () => {
  const s1 = mechanicsScores(bodyRelation(ACTION.acariciar, ZONE.espalda)), s2 = mechanicsScores(bodyRelation(ACTION.frotarCaderasDetras, ZONE.gluteos));
  assert.ok(s1.movementNaturalness === 1 && s1.positionSimplicity === 1);
  assert.ok(s2.movementNaturalness > 0 && s2.movementNaturalness < 1 && s2.positionSimplicity < 1);
});
test('el catálogo entero es biomecánicamente válido (no hay pares acción·zona muertos)', () => {
  const bad = auditCatalog();
  assert.deepEqual(bad, [], JSON.stringify(bad));
  for (const a of ACTIONS) assert.ok(a.zones.length, a.id);
});
