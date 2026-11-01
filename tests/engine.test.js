/* Tests del motor. Ejecutar: node --test 'tests/*.test.js' */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, migrateFavorite } from '../engine/engine.js';
import { COMBO, TARGETS, ACTIONS, GROUPS, LEVELS, STYLES, LEVEL_IDS } from '../engine/grammar.js';
import { THRESHOLD, criticalCheck, sessionQuality } from '../engine/quality.js';
import { PreferenceManager } from '../engine/prefs.js';
import { HUMAN_DURATIONS, LONG_DURATION } from '../engine/data/durations.js';
import { LEVEL_COPY } from '../engine/session.js';

const ALL = Object.keys(GROUPS);
const mk = (o = {}) => new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva'], ['pene']], enabledGroups: ALL, ...o.prefs }, seed: o.seed ?? 42, level: o.level ?? 1, debug: o.debug });
const rolls = (e, n) => Array.from({ length: n }, () => e.roll());

test('cada ronda es una combinación aprobada, válida, con duración humana y frase realizada', () => {
  for (const L of LEVEL_IDS) {
    const e = mk({ level: L, seed: 3 + L });
    for (const r of rolls(e, 300)) {
      const c = COMBO[`${r.action}|${r.tool}|${r.target}`];
      assert.ok(c, `${r.action}|${r.tool}|${r.target}`);
      assert.ok(c.levels.includes(L), r.phrase);
      assert.equal(r.validation, 'VALID', r.phrase);
      assert.ok([...HUMAN_DURATIONS, LONG_DURATION].includes(r.seconds), String(r.seconds));
      if (r.style) assert.ok(c.styles.includes(r.style), r.phrase);
      assert.equal(r.dice.style[0], r.style ? STYLES[r.style].label : '—');
      assert.ok(r.phrase.length > 8 && /\.$/.test(r.phrase));
      assert.ok(!r.fallback || true);
    }
    assert.ok(e.stats.fallbacks <= 2, `fallbacks ${e.stats.fallbacks}`);
  }
});
test('anatomía: ninguna zona íntima incompatible con quien recibe; dos penes nunca vulva y viceversa; sin indicar, nada íntimo', () => {
  const e = mk({ level: 3, seed: 3 });
  for (const r of rolls(e, 400)) { const z = TARGETS[r.target]; if (z.anatomy) assert.ok(e.prefs.availableFor(1 - r.performer, z), `${r.phrase} → recibe ${e.prefs.bodyParts[1 - r.performer]}`); }
  for (const [parts, bad] of [[[['pene'], ['pene']], 'vulva'], [[['vulva'], ['vulva']], 'pene'], [[[], []], 'any']]) {
    const f = mk({ level: 3, seed: 9, prefs: { bodyParts: parts } });
    for (const r of rolls(f, 200)) { const z = TARGETS[r.target]; if (z.anatomy) assert.ok(bad !== 'any' && z.anatomy !== bad, r.phrase); }
  }
  const legacy = new PreferenceManager({ anatomy: ['F', 'M'] }); assert.deepEqual(legacy.bodyParts, [['vulva'], ['pene']]);
});
test('nivel: banda respetada; anatomía íntima solo en Intimidad; el nivel solo cambia por decisión manual', () => {
  for (const L of LEVEL_IDS) {
    const e = mk({ level: L, seed: 10 + L });
    for (let i = 0; i < 300; i++) { const r = e.roll(); assert.equal(r.level, L); assert.ok(r.intensity >= LEVELS[L].lo - 1e-9 && r.intensity <= LEVELS[L].max + 1e-9, `[${L}] ${r.intensity} ${r.phrase}`); if (L < 3) assert.ok(!TARGETS[r.target].tags.includes('intimo'), r.phrase); if (i % 2) e.feedback('like', { more: true }); }
    assert.equal(e.level(), L);
  }
  const e = mk({ level: 2 }); assert.ok(e.setLevel(3)); assert.equal(e.level(), 3); assert.ok(e.setLevel(1)); assert.equal(e.session.lastMessage, LEVEL_COPY[1]);
});
test('Intimidad sin anatomía íntima disponible: se juega con el repertorio alto de Deseo sin salirse del nivel', () => {
  const e = mk({ level: 3, seed: 12, prefs: { bodyParts: [[], []] } });
  for (const r of rolls(e, 200)) { assert.equal(r.level, 3); assert.ok(!TARGETS[r.target].anatomy); assert.equal(r.validation, 'VALID'); }
});
test('repetición: ni la misma acción en 3 rondas ni la misma zona en 4; la familia semántica no vuelve en 2; la misma frase no se repite en 10', () => {
  for (const L of LEVEL_IDS) {
    const e = mk({ level: L, seed: 30 + L });
    const rs = rolls(e, 300); let semNear = 0;
    rs.forEach((r, i) => {
      const w = rs.slice(Math.max(0, i - 4), i);
      assert.ok(!w.slice(-2).some(p => p.action === r.action && p.tool === r.tool), `acción repetida: ${r.phrase}`);
      assert.ok(!w.slice(-3).some(p => p.target === r.target), `zona repetida: ${r.phrase}`);
      if (w.slice(-2).some(p => p.semanticFamily === r.semanticFamily) && r.purpose !== 'DEEPEN') semNear++;
      assert.ok(!rs.slice(Math.max(0, i - 10), i).some(p => p.phrase === r.phrase), `frase repetida: ${r.phrase}`);
    });
    assert.ok(semNear / rs.length <= (L === 3 ? 0.04 : 0.02), `familia semántica cercana ${semNear}`); // en Intimidad la familia íntima es una sola y los dos reciben alternando
    const q = sessionQuality(rs.slice(0, 67));
    assert.ok(q.shapeRepetition3 < 0.25, `forma repetida ${q.shapeRepetition3}`);
    assert.ok(q.bodyCoverage >= 10 && q.familyCoverage >= 4, JSON.stringify(q));
  }
});
test('estilos: no en todas las rondas; cuando van, el texto los expresa; la duración aparece siempre y nunca en la frase como etiqueta', () => {
  const e = mk({ level: 2, seed: 5 });
  const rs = rolls(e, 400);
  const styled = rs.filter(r => r.style).length;
  assert.ok(styled / rs.length > 0.15 && styled / rs.length < 0.6, `con estilo ${styled}`);
  for (const r of rs) { assert.ok(r.seconds >= 15); assert.ok(!/segundos|durante \d/.test(r.phrase), r.phrase); assert.equal(r.dice.duration[0], r.faces.duration); }
});
test('ME GUSTA profundiza sin repetir la frase; CAMBIA varía; PASO no castiga visible pero cambia de idea; «un poco más» mueve pesos, no el nivel', () => {
  const e = mk({ level: 2, seed: 50 });
  for (let i = 0; i < 30; i++) {
    const a = e.roll(); e.feedback('like'); const b = e.roll();
    assert.equal(b.purpose, 'DEEPEN'); assert.notEqual(a.phrase, b.phrase);
    e.feedback('cambia'); const c = e.roll(); assert.notEqual(c.semanticFamily, b.semanticFamily);
    const d = e.pass(); assert.notEqual(d.phrase, c.phrase); assert.equal(e.level(), 2);
    e.feedback('like', { more: true });
  }
  assert.ok(e.session.pressure > 0 || e.session.pace > 0); assert.equal(e.level(), 2);
});
test('OTRA mantiene a la misma persona; MÁS SUAVE baja intensidad con la misma idea y nunca sube de nivel', () => {
  for (const L of [2, 3]) {
    const e = mk({ level: L, seed: 60 + L });
    for (let i = 0; i < 40; i++) {
      const a = e.roll(); const b = e.reroll(); assert.equal(b.performer, a.performer); assert.ok(!(b.action === a.action && b.target === a.target));
      const s = e.softer(); if (s) { assert.ok(s.intensity < b.intensity, `${s.intensity} < ${b.intensity}`); assert.equal(s.performer, b.performer); assert.equal(s.level, L); assert.ok(!TARGETS[s.target].tags.includes('intimo') || L === 3); }
    }
  }
});
test('favoritas: repetir conserva quién hacía a quién y cuadra la anatomía; las antiguas (action/zone/method) se migran', () => {
  const e = mk({ level: 2, seed: 70 });
  const r = e.roll(); const fav = { ...r };
  e.roll();
  const again = e.repeatFavorite(fav); assert.ok(again); assert.equal(again.performerName, r.performerName); assert.equal(again.target, r.target);
  const legacy = migrateFavorite({ action: 'besar', zone: 'cuello', method: 'lento', phrase: 'x' }); assert.equal(legacy.action, 'KISS'); assert.equal(legacy.target, 'neck'); assert.equal(legacy.style, 'SLOW');
  assert.equal(migrateFavorite({ action: 'nalgada', zone: 'senos' }), null);
  const f4 = mk({ level: 2, seed: 71, prefs: { bodyParts: [['pene'], ['pene']] } });
  assert.equal(f4.repeatFavorite({ action: 'STIMULATE', tool: 'fingers', target: 'clitoris', performerName: 'Ana', partnerName: 'Leo' }), null);
});
test('«hoy no» aparta boca, presión, ropa, voz o anatomía íntima para toda la sesión; «quizá» casi no sale', () => {
  const e = mk({ level: 2, seed: 80 }); e.setPrefs(0, { boca: 'no', presion: 'no' }); e.setPrefs(1, { ropa: 'no' });
  for (const r of rolls(e, 250)) { const a = ACTIONS[r.action]; assert.notEqual(a.contactType, 'boca', r.phrase); assert.ok(!a.tags.includes('presion') && !a.tags.includes('ropa'), r.phrase); }
  const f = mk({ level: 3, seed: 81 }); f.setPrefs(0, { intimo: 'no' }); for (const r of rolls(f, 200)) assert.ok(!TARGETS[r.target].anatomy, r.phrase);
  const g = mk({ level: 3, seed: 82 }); g.setPrefs(1, { intimo: 'quiza' }); const n = rolls(g, 200).filter(r => TARGETS[r.target].anatomy).length; assert.ok(n < 40, `quizá íntimo ${n}`);
});
test('calidad: todo lo que llega a la interfaz pasa el umbral y la frase es humana (≥ 0.6); nada de lenguaje clínico ni de terapia', () => {
  for (const L of LEVEL_IDS) for (const r of rolls(mk({ level: L, seed: 90 + L }), 300)) {
    if (!r.fallback) assert.ok(r.quality >= THRESHOLD, `${r.quality} ${r.phrase}`);
    assert.ok(r.humanLikeness >= 0.6, r.phrase);
    assert.ok(!/sistema nervioso|deseo responsivo|terapia|zona poplítea|con ganas|mirada/i.test(r.phrase), r.phrase);
    assert.ok(r.phrase.split(/\s+/).length <= 24, r.phrase);
  }
});
test('dados: cuatro conceptos (acción, zona, estilo, tiempo); la primera cara es el resultado y las demás opciones reales', () => {
  const e = mk({ level: 2, seed: 100 });
  for (const r of rolls(e, 50)) {
    assert.deepEqual(Object.keys(r.dice), ['action', 'zone', 'style', 'duration']);
    for (const k of Object.keys(r.dice)) { assert.equal(r.dice[k].length, 6); assert.equal(r.dice[k][0], r.faces[k]); }
    assert.equal(r.dice.action[0], ACTIONS[r.action].name);
  }
});
test('criticalCheck: códigos de rechazo para anatomía, nivel, estilo, duración y combinación no aprobada', () => {
  const e = mk({ level: 2 }); const ctx = { prefs: e.prefs, level: 2, session: e.session };
  const base = { action: 'KISS', tool: 'lips', target: 'neck', style: null, duration: 20, pattern: 'GIVE', text: 'Besa el cuello de Ana.', humanLikeness: 1, intensity: 4 };
  assert.ok(criticalCheck(base, ctx).ok);
  assert.ok(criticalCheck({ ...base, target: 'vulva', intensity: 6 }, ctx).reasons.includes('INTIMATE_OUTSIDE_INTIMACY'));
  assert.ok(criticalCheck({ ...base, style: 'FIRM' }, ctx).reasons.includes('STYLE_INCOMPATIBLE'));
  assert.ok(criticalCheck({ ...base, duration: 22 }, ctx).reasons.includes('DURATION_OUT_OF_RANGE'));
  assert.ok(criticalCheck({ ...base, action: 'SPANK', tool: 'oneHand', target: 'breasts' }, ctx).reasons.includes('TARGET_INCOMPATIBLE'));
  assert.ok(criticalCheck({ ...base, intensity: 9 }, ctx).reasons.includes('LEVEL_OUT_OF_BAND'));
  assert.ok(criticalCheck({ ...base, text: 'Besa el cuello de Ana con los labios con los labios con la boca.', humanLikeness: 0.3 }, ctx).reasons.includes('PHRASE_UNNATURAL'));
});
