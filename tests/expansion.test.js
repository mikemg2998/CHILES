/* EXPANSIÓN CORPORAL DE INTIMIDAD V1 (diseñador, 2026-11-03). Aditiva: el conjunto APPROVED anterior se guarda en
   approved-before-expansion.json y este test FALLA si alguna de esas cartas desaparece o deja de estar aprobada. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CARDS, CARD, APPROVED, regionOf, partsOf, playableAt, levelsOf } from '../content/index.js';
import { BODY_PARTS } from '../content/body.js';
import { buildDeck, weighDeck } from '../engine/deck.js';
import { coverage } from '../engine/clothing.js';
import { moodProfile, moodWeight } from '../engine/mood.js';
import { mk, play, NAKED, DRESSED } from './helpers.js';

const BEFORE = JSON.parse(readFileSync(new URL('./approved-before-expansion.json', import.meta.url), 'utf8'));
const NEW = { I44: ['fingers', 'ARMS_HANDS'], I45: ['hands', 'ARMS_HANDS'], I46: ['toes', 'FEET'], I47: ['feet', 'FEET'], I48: ['feet', 'FEET'], I49: ['hips', 'HIPS_GLUTES'], I51: ['back', 'BACK'], I52: ['wholeBody', 'FULL_BODY'], I53: ['wholeBody', 'FULL_BODY'], I50: ['hipCrease', 'HIPS_GLUTES'], I54: ['wholeBody', 'FULL_BODY'] };
const REUSED = ['C01', 'C06', 'C08', 'C15', 'C51', 'D10'];
const ids = (e, actor) => new Set(buildDeck(CARDS, e.context(actor)).eligible.map(x => x.card.id));
const both = e => new Set([...ids(e, 0), ...ids(e, 1)]);
const st = o => ({ ...DRESSED(), ...o });

test('regresión: ninguna carta APPROVED anterior desaparece ni cambia de estado', () => {
  assert.ok(BEFORE.length >= 113, `instantánea ${BEFORE.length}`);
  const CURATED_OUT = ['C21', 'C28', 'C30', 'C49']; // eliminadas explícitamente por el diseñador (curación 2026-11-03)
  for (const id of BEFORE) { assert.ok(CARD[id], `${id} ha desaparecido`); assert.equal(CARD[id].status, CURATED_OUT.includes(id) ? 'REJECTED' : 'APPROVED', `${id} cambió de estado`); }
  const L3before = BEFORE.filter(id => CARD[id].level === 3).length, L3now = APPROVED.filter(c => c.level === 3).length;
  assert.equal(L3now, L3before + Object.keys(NEW).length + 1 + 2 + 6 + 4, 'newTotal = previousApprovedTotal + nuevas + I24 reactivada + I55/I56 + I57–I62 + I63–I66');
  assert.equal(CARD.I20.durations.join(), '60'); assert.deepEqual(CARD.I20.clothing.receiver, ['FULL_BODY_ACCESS']); // I20 intacta
  assert.equal(CARD.I50.interactionType, 'MUTUAL'); assert.equal(CARD.I54.durations.join(), '30'); assert.deepEqual(CARD.I54.clothing.receiver, ['ANY']);
});
test('nuevas cartas: DESIGNER_PROVIDED, target y región correctos, targets separados (manos ≠ dedos, pies ≠ dedos, caderas ≠ nalgas, ingles ≠ genitales)', () => {
  for (const [id, [part, region]] of Object.entries(NEW)) {
    const c = CARD[id]; assert.equal(c.level, 3); assert.equal(c.status, 'APPROVED'); assert.equal(c.source, 'DESIGNER_PROVIDED'); assert.equal(c.baseWeight, 1, 'sin boost');
    assert.ok(partsOf(c, null).includes(part), `${id} → ${part}`); assert.equal(regionOf(c, null), region, `${id} región`);
    assert.ok(!c.clothing.receiver.some(q => q.startsWith('THROUGH')), `${id}: sin variantes sobre ropa`);
  }
  assert.equal(BODY_PARTS.hips.region, 'HIPS_GLUTES'); assert.notEqual('hips', 'buttocks'); assert.equal(BODY_PARTS.hipCrease.anatomy, null); assert.ok(!['vulva', 'pene'].includes(BODY_PARTS.groin.anatomy));
  assert.deepEqual(partsOf(CARD.I50, null), ['hipCrease']);
  assert.ok(!APPROVED.filter(c => Object.keys(NEW).includes(c.id)).some(c => c.intraLevelIntensity === 'HIGH'), 'nada es HIGH por estar en Intimidad');
});
test('FULL_BODY no es INTIMATE: I20 I52 I53 son BODY_TO_BODY de pie, mutuos, región FULL_BODY; I54 también, sin requisito de ropa', () => {
  { const c = CARD.I54; assert.equal(c.interactionType, 'BODY_TO_BODY'); assert.equal(c.requiredOrientation, 'STANDING'); assert.equal(regionOf(c, null), 'FULL_BODY'); }
  for (const id of ['I20', 'I52', 'I53']) { const c = CARD[id]; assert.equal(c.interactionType, 'BODY_TO_BODY'); assert.equal(c.requiredOrientation, 'STANDING'); assert.equal(regionOf(c, null), 'FULL_BODY'); assert.ok(!c.tags.includes('intimo')); assert.deepEqual(c.clothing.receiver, ['FULL_BODY_ACCESS']); assert.deepEqual(c.clothing.actor, ['FULL_BODY_ACCESS']); }
});
test('ClothingState: entrar a Intimidad no es estar desnudos', () => {
  const dressed = both(mk({ level: 3, clothing: [DRESSED(), DRESSED()] }));
  for (const id of ['I46', 'I47', 'I48', 'I49', 'I51', 'I52', 'I53', 'I20']) assert.ok(!dressed.has(id), `${id} vestidos`);
  for (const id of ['I44', 'I45', 'I54', ...REUSED]) assert.ok(dressed.has(id), `${id} se juega vestidos`); assert.ok(!dressed.has('I50'));
  const socks = both(mk({ level: 3, clothing: [st({ socks: 'OFF' }), st({ socks: 'OFF' })] })); for (const id of ['I46', 'I47', 'I48']) assert.ok(socks.has(id), `${id} sin calcetines`);
  const top = both(mk({ level: 3, clothing: [st({ top: 'OFF', bra: 'OFF' }), st({ top: 'OFF' })] })); assert.ok(top.has('I51')); assert.ok(!top.has('I49'));
  const pants = both(mk({ level: 3, clothing: [st({ bottoms: 'OFF' }), st({ bottoms: 'OFF' })] })); assert.ok(pants.has('I49'), 'caderas con el pantalón fuera, ropa interior puesta'); assert.ok(!pants.has('I52'));
  const one = both(mk({ level: 3, clothing: [NAKED(), DRESSED()] })); for (const id of ['I20', 'I52', 'I53', 'I50']) assert.ok(!one.has(id), `${id}: exige acceso de los DOS`);
  const underOff = st({ bottoms: 'OFF', panties: 'OFF', boxers: 'OFF' }); assert.ok(both(mk({ level: 3, clothing: [underOff, underOff] })).has('I50'), 'I50 con las ingles a piel de los dos');
  const naked = both(mk({ level: 3, clothing: [NAKED(), NAKED()] })); for (const id of [...Object.keys(NEW), ...REUSED, 'I20']) assert.ok(naked.has(id), `${id} desnudos`);
  assert.equal(coverage('hips', st({ bottoms: 'OFF' })).mode, 'DIRECT_SKIN_ACCESS');
});
test('reutilización multinivel: los masajes y el abrazo vestido siguen en su nivel y además en Intimidad, sin copias', () => {
  for (const id of REUSED) { assert.ok(playableAt(CARD[id], 3)); assert.ok(playableAt(CARD[id], CARD[id].level)); assert.deepEqual(levelsOf(CARD[id]), [CARD[id].level, 3]); }
  assert.ok(!playableAt(CARD.C02, 3), 'no se copia todo Conexión'); assert.ok(!playableAt(CARD.D14, 3));
  const c1 = ids(mk({ level: 1 }), 0); for (const id of ['C01', 'C06', 'C08', 'C15', 'C51']) assert.ok(c1.has(id), `${id} sigue en Conexión`);
  const d2 = ids(mk({ level: 2 }), 0); assert.ok(d2.has('D10'), 'D10 sigue en Deseo');
  const texts = new Set(APPROVED.flatMap(c => c.copy || [])); assert.equal(texts.size, APPROVED.flatMap(c => c.copy || []).length, 'sin frases duplicadas');
});
test('historial y diversidad: registra target y región reales; las cartas nuevas reciben la penalización de región como cualquiera', () => {
  const e = mk({ level: 3, seed: 11, clothing: [NAKED(), NAKED()] }); const seen = new Map();
  for (const r of play(e, 300, { undress: false })) if (NEW[r.cardId] || r.cardId === 'I20') seen.set(r.cardId, r);
  for (const id of [...Object.keys(NEW), 'I20']) { const r = seen.get(id); assert.ok(r, `${id} sale en 300 cartas`); assert.equal(r.region, id === 'I20' ? 'FULL_BODY' : NEW[id][1]); }
  assert.ok(seen.get('I52').mutual && seen.get('I53').mutual, 'BODY_TO_BODY = mutua');
  const f = mk({ level: 3, seed: 3, clothing: [NAKED(), NAKED()] }); f.history.push({ cardId: 'I47', family: 'FEET', region: 'FEET', parts: ['feet'], actor: 0, receiver: 1 });
  const w = weighDeck(buildDeck(CARDS, f.context(0)), { history: f.history, session: f.session, director: f.director, purpose: 'MAINTAIN', round: 1, actor: 0, clothing: f.clothing });
  for (const x of w.filter(x => ['I46', 'I48'].includes(x.card.id))) assert.ok(x.factors.region < 1, `${x.card.id} región reciente`);
});
test('moods: CERCA favorece cuerpo con cuerpo, TRANQUILO los masajes; ninguno cambia la elegibilidad', () => {
  const cerca = moodProfile('cerca', 'cerca'), calma = moodProfile('tranquilo', 'tranquilo');
  for (const id of ['I52', 'I53', 'I20']) assert.ok(moodWeight(CARD[id], cerca) > 1.5, id);
  for (const id of ['C01', 'I51', 'I45']) assert.ok(moodWeight(CARD[id], calma) > 1.3, id);
  const base = mk({ level: 3, clothing: [NAKED(), NAKED()] }), m = mk({ level: 3, clothing: [NAKED(), NAKED()] }); m.setMood(0, 'tranquilo'); m.setMood(1, 'cerca');
  assert.deepEqual([...ids(m, 0)].sort(), [...ids(base, 0)].sort());
});
test('sesiones largas: FULL_BODY / BODY_TO_BODY aparece cuando es elegible, y la sesión respira (no solo sube)', () => {
  let withFull = 0, sessions = 0, soft = 0, drops = 0, n = 0;
  for (let s = 0; s < 40; s++) {
    const e = mk({ level: 3, seed: 700 + s, clothing: [NAKED(), NAKED()] }); sessions++; let full = false, prev = null;
    for (const r of play(e, 40, { undress: false })) { n++; const c = CARD[r.cardId]; if (r.region === 'FULL_BODY') full = true; if (c.intraLevelIntensity === 'LOW') soft++; const v = { LOW: 0, MID: 1, HIGH: 2 }[c.intraLevelIntensity] ?? 1; if (prev != null && v < prev) drops++; prev = v; }
    if (full) withFull++;
  }
  assert.ok(withFull / sessions > 0.9, `FULL_BODY en ${withFull}/${sessions} sesiones`); assert.ok(soft / n > 0.15, `LOW ${soft}/${n}`); assert.ok(drops / n > 0.15, 'la intensidad baja a ratos');
});
