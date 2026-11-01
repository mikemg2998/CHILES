/* Tests obligatorios del motor. Ejecutar: node --test tests/ */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../engine/engine.js';
import { ACTION, ZONE, CONDITION, METHOD, GROUPS, LEVELS } from '../engine/catalog.js';
import { CompatibilityEngine as CE } from '../engine/compat.js';
import { THRESHOLD, FALLBACKS, fallbackFor, criticalCheck } from '../engine/quality.js';
import { PreferenceManager } from '../engine/prefs.js';
import { AVOIDS } from '../engine/session.js';

const ALL = Object.keys(GROUPS);
const mk = (o = {}) => new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva'], ['pene']], enabledGroups: ALL, ...o.prefs }, seed: o.seed ?? 42, level: o.level ?? 1, debug: o.debug });
const rolls = (e, n) => Array.from({ length: n }, () => e.roll());

test('anatomía: ninguna zona íntima incompatible con quien recibe, en ninguna frase', () => {
  const e = mk({ level: 4, seed: 3 });
  for (const r of rolls(e, 400)) {
    const z = ZONE[r.zone], g = GROUPS[z.group];
    if (g.intimate) assert.ok(e.prefs.availableFor(1 - r.performer, z.group), `${r.phrase} → recibe ${e.prefs.bodyParts[1 - r.performer]}`);
    assert.equal(r.validation, 'VALID', r.phrase);
    assert.ok(ACTION[r.action].zones.includes(r.zone), 'zona compatible con la acción');
  }
});
test('anatomía por partes (sin género): dos penes nunca producen zonas de vulva y viceversa; sin indicar, nada íntimo', () => {
  for (const [parts, bad] of [[[['pene'], ['pene']], 'F'], [[['vulva'], ['vulva']], 'M'], [[[], []], 'FM']]) {
    const e = mk({ level: 4, seed: 9, prefs: { bodyParts: parts } });
    for (const r of rolls(e, 200)) { const g = GROUPS[ZONE[r.zone].group]; if (g.intimate) assert.ok(!bad.includes(g.sex), r.phrase); }
  }
  const legacy = new PreferenceManager({ anatomy: ['F', 'M'] }); assert.deepEqual(legacy.bodyParts, [['vulva'], ['pene']]); assert.ok(!JSON.stringify(legacy).includes('anatomy'));
});
test('nivel: cada ronda respeta la banda de su nivel y la anatomía íntima solo aparece en Intimidad', () => {
  for (const L of [1, 2, 3, 4]) {
    const e = mk({ level: L, seed: 10 + L });
    for (const r of rolls(e, 200)) {
      assert.equal(r.level, L);
      assert.ok(r.intensity >= LEVELS[L].lo - 1e-9 && r.intensity <= LEVELS[L].max + 1e-9, `[${L}] ${r.intensity} ${r.phrase}`);
      if (L < 4) assert.ok(!ZONE[r.zone].tags.includes('intimo'), r.phrase);
    }
  }
});
test('condición: solo entra si es compatible y aporta algo; nunca añade una segunda zona', () => {
  const e = mk({ level: 3, seed: 21 });
  for (const r of rolls(e, 300)) {
    if (!r.cond) continue;
    const c = CONDITION[r.cond], a = ACTION[r.action], z = ZONE[r.zone], m = r.method ? METHOD[r.method] : null;
    assert.ok(CE.conditionFits(c, a, z, m), `${r.cond} con ${r.action}/${r.zone}`);
    assert.ok(CE.conditionValue(c, a, z) >= 0.45, `aporta poco: ${r.phrase}`);
    assert.ok(!c.needsAlt && !r.alt, 'sin zona alternativa');
  }
});
test('dados opcionales: forma y condición faltan a menudo y en Conexión casi nunca van las cuatro piezas', () => {
  const e = mk({ level: 1, seed: 5 });
  const rs = rolls(e, 400);
  const four = rs.filter(r => r.method && r.cond).length, noMethod = rs.filter(r => !r.method).length, noCond = rs.filter(r => !r.cond).length;
  assert.ok(four / rs.length < 0.08, `cuatro piezas ${four}`);
  assert.ok(noMethod > 60 && noCond > 250, `sin forma ${noMethod}, sin condición ${noCond}`);
  for (const r of rs) for (const k of ['method', 'cond']) if (!r[k]) assert.equal(r.dice[k][0], '—');
});
test('repetición: ni la misma acción en 3 rondas ni la misma zona en 4 ni la misma condición en 5', () => {
  for (const L of [1, 2, 3]) {
    const e = mk({ level: L, seed: 30 + L });
    const rs = rolls(e, 300); let z4 = 0;
    rs.forEach((r, i) => {
      const w = rs.slice(Math.max(0, i - 4), i);
      assert.ok(!w.slice(-2).some(p => p.action === r.action), `acción repetida: ${r.phrase}`);
      assert.ok(!w.slice(-3).some(p => p.zone === r.zone), `zona repetida: ${r.phrase}`);
      if (w.some(p => p.zone === r.zone)) z4++;
      if (r.cond) assert.ok(!w.some(p => p.cond === r.cond), `condición repetida: ${r.phrase}`);
    });
    assert.ok(z4 / rs.length <= 0.02, `zona repetida a 4 rondas ${z4}`);
  }
});
test('repetición semántica: la misma familia acción·zona no vuelve en las dos rondas siguientes', () => {
  const e = mk({ level: 2, seed: 77 });
  const rs = rolls(e, 400);
  let near = 0;
  rs.forEach((r, i) => { if (rs.slice(Math.max(0, i - 2), i).some(p => p.semanticFamily === r.semanticFamily)) near++; });
  assert.ok(near / rs.length < 0.02, `familia semántica cercana ${near}`);
});
test('feedback ME GUSTA: la siguiente ronda profundiza en la misma familia sin repetir la misma frase', () => {
  let same = 0, identical = 0;
  for (let s = 0; s < 40; s++) {
    const e = mk({ level: 2, seed: 100 + s });
    const r = e.roll(); e.feedback('like'); const n = e.roll();
    assert.equal(n.purpose, 'DEEPEN');
    if (n.families.action === r.families.action || n.families.zone === r.families.zone || n.families.actor === r.families.actor) same++;
    if (n.phrase === r.phrase) identical++;
  }
  assert.ok(same >= 28, `evolución compatible en ${same}/40`);
  assert.equal(identical, 0);
});
test('feedback PASO: la familia descartada deja de salir en las rondas siguientes y no hay mensaje de castigo', () => {
  let hits = 0, total = 0;
  for (let s = 0; s < 30; s++) {
    const e = mk({ level: 2, seed: 200 + s });
    const r = e.roll(); const fam = r.families.action;
    const n = e.pass(); total++;
    assert.ok(n && n.phrase && !/castig|mal|error/i.test(n.phrase));
    for (const x of [n, ...rolls(e, 3)]) if (x.semanticFamily === r.semanticFamily) hits++;
  }
  assert.ok(hits <= 2, `la misma familia semántica volvió ${hits} veces tras PASO`);
  assert.ok(total === 30);
});
test('feedback CAMBIA: la siguiente propuesta cambia de familia semántica', () => {
  for (let s = 0; s < 30; s++) {
    const e = mk({ level: 3, seed: 300 + s });
    const r = e.roll(); e.feedback('cambia'); const n = e.roll();
    assert.notEqual(n.semanticFamily, r.semanticFamily, `${r.phrase} → ${n.phrase}`);
    assert.equal(n.purpose, 'VARIATION');
  }
});
test('progresión manual: 60 rondas con ME GUSTA y MÁS en Conexión siguen en Conexión; el director jamás cambia currentLevel', () => {
  const e = mk({ level: 1, seed: 8 });
  for (let i = 0; i < 60; i++) { const r = e.roll(); assert.equal(r.level, 1); assert.equal(e.level(), 1); e.feedback('like', { more: i % 2 === 0 }); }
  assert.ok(e.session.intraLevelIntensity <= 1 && e.level() === 1);
  // la decisión de la pareja vale en cualquier momento y dirección, sin confirmación
  assert.equal(e.setLevel(3), true); assert.equal(e.level(), 3); assert.equal(e.roll().level, 3);
  assert.equal(e.setLevel(1), true); assert.equal(e.level(), 1);
  assert.equal(e.setLevel(4), true); assert.equal(e.level(), 4); assert.equal(e.session.lastMessage, 'Hasta donde queráis.');
});
test('más suave reduce la intensidad dentro del nivel sin cambiar currentLevel', () => {
  let lowered = 0;
  for (let s = 0; s < 20; s++) {
    const e = mk({ level: 3, seed: 400 + s });
    const r = e.roll(); const before = e.session.intraLevelIntensity;
    const v = e.softer();
    assert.equal(e.level(), 3);
    assert.ok(e.session.intraLevelIntensity < before);
    if (v) { assert.equal(v.level, 3); assert.ok(v.intensity < r.intensity, `${r.intensity} → ${v.intensity}`); lowered++; }
    for (const n of rolls(e, 5)) assert.equal(n.level, 3);
  }
  assert.ok(lowered >= 14, `variante suave en ${lowered}/20`);
});
test('rondas sin escalada: mientras duran, la intensidad no sube; terminan solas', () => {
  const e = mk({ level: 1, seed: 21 });
  let seen = 0;
  for (let i = 0; i < 80; i++) {
    const before = e.history.last() ? e.history.last().intensity : null, calm = e.session.calm();
    const r = e.roll();
    if (calm && before != null) { seen++; assert.ok(r.target <= before + 1e-9, `${before} → ${r.target}`); }
  }
  assert.ok(seen > 0 && !(e.session.calmUntil > e.session.rounds + 3));
});
test('calidad: nada por debajo del umbral ni inválido llega a la interfaz, y hay candidatos descartados', () => {
  const e = mk({ level: 3, seed: 55, debug: true });
  let rejected = 0;
  for (const r of rolls(e, 300)) {
    assert.equal(r.validation, 'VALID', r.phrase);
    if (!r.fallback) assert.ok(r.quality >= THRESHOLD, `${r.quality} ${r.phrase}`);
    const d = e.lastDebug; rejected += d.rejectedCandidates.length;
    assert.ok(d.selectedPurpose && d.selectedFamily && typeof d.finalQualityScore === 'number');
  }
  assert.ok(rejected > 0, 'el filtro debe rechazar algo');
});
test('fallback: con casi todo desactivado no hay bucle infinito y sale una frase validada', () => {
  const e = mk({ level: 1, seed: 6, prefs: { enabledGroups: ['brazos'], bodyParts: [['pene'], ['pene']] } });
  const t = Date.now();
  for (let i = 0; i < 40; i++) { const r = e.roll(); assert.ok(r && r.phrase.length > 8); assert.equal(r.validation, 'VALID'); }
  assert.ok(Date.now() - t < 4000);
  for (const L of [1, 2, 3, 4]) { const f = fallbackFor(L, new PreferenceManager({ enabledGroups: ALL, bodyParts: [['vulva'], ['pene']] }), null); assert.ok(f.action && f.zone); assert.ok(FALLBACKS[L].length >= 4); }
});
test('"hoy no": la restricción de cualquiera de los dos vale para toda la sesión; "quizá" pesa menos y nunca pasa a sí', () => {
  const q = mk({ level: 2, seed: 15 }); q.setPrefs(0, { boca: 'quiza' });
  const withQ = rolls(q, 300).filter(r => ACTION[r.action].contactType === 'boca').length;
  const base = rolls(mk({ level: 2, seed: 15 }), 300).filter(r => ACTION[r.action].contactType === 'boca').length;
  assert.ok(withQ > 0 && withQ < base * 0.6, `quizá: ${withQ} vs ${base}`);
  assert.equal(q.session.pref[0].boca, 'quiza');
  const e = mk({ level: 2, seed: 12 });
  e.setAvoid(1, ['boca', 'ropa']);
  for (const r of rolls(e, 200)) { const a = ACTION[r.action]; assert.notEqual(a.contactType, 'boca', r.phrase); assert.ok(!a.tags.includes('ropa'), r.phrase); }
  const e4 = mk({ level: 4, seed: 13 }); e4.setAvoid(0, ['intimo']);
  for (const r of rolls(e4, 150)) assert.ok(!ZONE[r.zone].tags.includes('intimo'), r.phrase);
  const chk = criticalCheck({ action: 'besar', zone: 'cuello', method: null, cond: null, alt: null, intensity: 4, phrase: 'x' }, { prefs: e.prefs, level: 2, session: e.session, avoids: AVOIDS });
  assert.equal(chk.ok, false);
});
test('cómo llegas hoy: lo común manda y cambia la curva (tranquilo → menos BUILD, más calma)', () => {
  const e = mk({ level: 2, seed: 14 });
  e.setIntents(0, ['tranquilo', 'jugar']); e.setIntents(1, ['tranquilo']);
  assert.deepEqual([...e.session.intentSet()], ['tranquilo']);
  const slow = rolls(e, 200).filter(r => ['COOLDOWN', 'MAINTAIN'].includes(r.purpose)).length;
  const e2 = mk({ level: 2, seed: 14 });
  const base = rolls(e2, 200).filter(r => ['COOLDOWN', 'MAINTAIN'].includes(r.purpose)).length;
  assert.ok(slow > base, `${slow} vs ${base}`);
});
test('privacidad: el estado de sesión no forma parte de lo que se persiste', () => {
  const p = new PreferenceManager({ names: ['A', 'B'], bodyParts: [['vulva'], ['pene']] });
  const json = JSON.stringify(p);
  for (const k of ['intents', 'pref', 'liked', 'skipped', 'feedback', 'familyScore', 'mood']) assert.ok(!json.includes(k));
});
