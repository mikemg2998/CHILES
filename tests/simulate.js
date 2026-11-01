/* Simulación v3: tiradas por nivel con el Session Director. Falla si hay inválidas, si llega algo por debajo del umbral
   de calidad, si se repite demasiado o si los niveles se parecen. Ejecutar: node tests/simulate.js [rondas] [--sample] */
import { GameEngine, CombinationValidator } from '../engine/engine.js';
import { ACTIONS, ZONES, METHODS, CONDITIONS, GROUPS, LEVELS } from '../engine/catalog.js';
import { CompatibilityEngine as CE } from '../engine/compat.js';
import { combinationIntensity } from '../engine/intensity.js';
import { PreferenceManager } from '../engine/prefs.js';
import { THRESHOLD } from '../engine/quality.js';

const N = Number(process.argv.find(a => /^\d+$/.test(a))) || 1000;
const SAMPLE = process.argv.includes('--sample');
let fail = 0;
const pct = (n, t) => (100 * n / t).toFixed(1) + '%';
const count = (m, k) => { m[k] = (m[k] || 0) + 1; };
const top = (m, n, t) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${pct(v, t)}`).join(' · ');
const ALL = Object.keys(GROUPS);
const BASE = { names: ['Ana', 'Leo'], anatomy: ['F', 'M'], enabledGroups: ALL };

/* 1. Espacio del catálogo por nivel */
console.log('== Catálogo ==');
const prefsAll = new PreferenceManager(BASE);
for (const L of [1, 2, 3, 4]) {
  let valid = 0, invalid = 0, quest = 0; const reasons = {};
  for (const a of ACTIONS.filter(a => a.levels[L])) for (const z of CE.zonesFor(a, L, prefsAll)) {
    for (const m of [null, ...CE.methodsFor(a, z, L)]) for (const c of [null, ...CE.conditionsFor(a, z, m, L)]) {
      if (c && c.needsAlt) continue;
      const intensity = combinationIntensity(a, z, m, c);
      const v = CombinationValidator.validate({ action: a.id, zone: z.id, method: m && m.id, cond: c && c.id, intensity, level: L }, prefsAll);
      if (v.status === 'VALID') valid++; else if (v.status === 'QUESTIONABLE') quest++; else { invalid++; count(reasons, v.reasons[0].split(':')[0]); }
    }
  }
  console.log(`  ${LEVELS[L].name}: ${valid} válidas · ${quest} cuestionables · ${invalid} descartadas por el validador`);
}

/* 2. Sesiones largas por nivel */
const results = {};
const setups = [1, 2, 3, 4].map(L => ({ key: LEVELS[L].key, level: L })).concat([{ key: 'intimidad (sin anatomía indicada)', level: 4, anatomy: ['', ''] }]);
let seed = 11;
for (const s of setups) {
  const eng = new GameEngine({ prefs: { ...BASE, anatomy: s.anatomy || BASE.anatomy }, seed: seed++, level: s.level });
  const st = { struct: {}, invalid: 0, lowQ: 0, fallback: 0, zone: {}, act: {}, meth: {}, cond: {}, purpose: {}, pattern: {}, sum: 0, repZone4: 0, repAct3: 0, repCond3: 0, phrases: new Set(), seq: [], levelDrift: 0 };
  for (let i = 0; i < N; i++) {
    const r = eng.roll();
    if (r.validation === 'INVALID') { st.invalid++; if (st.invalid < 4) console.log('  INVALID', r.phrase); }
    if (!r.fallback && r.quality < THRESHOLD) st.lowQ++;
    if (r.fallback) st.fallback++;
    if (r.level !== s.level) st.levelDrift++;
    count(st.zone, r.zone); count(st.act, r.action); count(st.meth, r.method || '—'); count(st.cond, r.cond || '—'); count(st.purpose, r.purpose); count(st.pattern, r.pattern); count(st.struct, 'A+Z' + (r.method ? '+F' : '') + (r.cond ? '+C' : ''));
    st.sum += r.intensity; st.phrases.add(r.phrase);
    const prev = st.seq.slice(-4);
    if (prev.some(p => p.zone === r.zone)) st.repZone4++;
    if (prev.slice(-3).some(p => p.action === r.action)) st.repAct3++;
    if (prev.slice(-3).some(p => p.cond && p.cond === r.cond)) st.repCond3++;
    st.seq.push(r);
    // feedback simulado: a la pareja le gusta 1 de cada 4, cambia 1 de cada 8, pasa 1 de cada 12
    if (i % 4 === 1) eng.feedback('like'); else if (i % 8 === 3) eng.feedback('cambia'); else if (i % 12 === 5) eng.feedback('paso');
  }
  st.mean = st.sum / N; st.rejected = eng.stats.rejected; st.rejectedReasons = eng.stats.rejectedReasons;
  results[s.key] = st;
  const Z = ZONES.filter(z => eng.prefs.zoneEnabled(z) && z.levels[s.level]);
  console.log(`\n== ${s.key} · ${N} tiradas ==`);
  console.log(`  inválidas ${st.invalid} · por debajo del umbral ${st.lowQ} · fallbacks ${st.fallback} · cambios de nivel sin puerta ${st.levelDrift} · intensidad media ${st.mean.toFixed(2)} · frases distintas ${st.phrases.size}`);
  console.log(`  rechazadas antes de mostrar: ${st.rejected} (${Object.entries(st.rejectedReasons).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} ${v}`).join(', ')})`);
  console.log(`  zona repetida en 4 rondas ${pct(st.repZone4, N)} · acción repetida en 3 ${pct(st.repAct3, N)} · condición repetida en 3 ${pct(st.repCond3, N)}`);
  console.log(`  estructura: ${top(st.struct, 4, N)}`);
  console.log(`  propósitos: ${top(st.purpose, 7, N)}`);
  console.log(`  patrones: ${top(st.pattern, 6, N)}`);
  console.log(`  zonas: ${top(st.zone, 8, N)}`);
  console.log(`  acciones: ${top(st.act, 8, N)}`);
  console.log(`  condiciones: ${top(st.cond, 6, N)}`);
  console.log(`  curva (25 primeras): ${st.seq.slice(0, 25).map(r => r.intensity.toFixed(1)).join(' ')}`);
  console.log(`  nunca: zonas ${Z.filter(z => !st.zone[z.id]).map(z => z.id).join(',') || '—'}`);
  if (st.invalid) { console.log('  ✗ inválidas'); fail++; }
  if (st.lowQ) { console.log('  ✗ llegó algo por debajo del umbral de calidad'); fail++; }
  if (st.levelDrift) { console.log('  ✗ el nivel cambió sin puerta'); fail++; }
  if (st.fallback / N > 0.01) { console.log('  ✗ demasiados fallbacks'); fail++; }
  if (s.level === 1 && ((st.struct['A+Z+F+C'] || 0) / N > 0.08 || ((st.struct['A+Z+C'] || 0) + (st.struct['A+Z+F+C'] || 0)) / N > 0.3)) { console.log('  ✗ Conexión demasiado recargada'); fail++; }
  if (st.repZone4 / N > (Z.length < 18 ? 0.25 : 0.03)) { console.log('  ✗ demasiadas zonas repetidas'); fail++; }
  const topP = Object.entries(st.purpose).sort((a, b) => b[1] - a[1])[0];
  if (topP[1] / N > 0.6) { console.log('  ✗ un solo propósito domina la sesión'); fail++; }
}

/* 3. Separación entre niveles */
function dist(m, t) { const d = {}; for (const k in m) d[k] = m[k] / t; return d; }
function overlap(a, b) { let s = 0; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) s += Math.sqrt((a[k] || 0) * (b[k] || 0)); return s; }
console.log('\n== Separación entre niveles ==');
const R = results, L1 = R.conexion, L2 = R.deseo, L3 = R.exploracion, L4 = R.intimidad;
const pairs = [['Conexión/Deseo', L1, L2, 0.55], ['Deseo/Exploración', L2, L3, 0.6], ['Exploración/Intimidad', L3, L4, 0.9]]; // comparten banda; lo que las separa es la anatomía íntima (se comprueba aparte)
console.log(`  intensidad media: ${[L1, L2, L3, L4].map(x => x.mean.toFixed(2)).join(' · ')}`);
for (const [name, a, b, lim] of pairs) {
  const oz = overlap(dist(a.zone, N), dist(b.zone, N)), oa = overlap(dist(a.act, N), dist(b.act, N));
  console.log(`  ${name}: solapamiento de zonas ${oz.toFixed(2)} · de acciones ${oa.toFixed(2)} (1 = iguales)`);
  if (oz > lim || oa > lim) { console.log(`  ✗ ${name} se parecen demasiado`); fail++; }
}
const intimateShare = Object.entries(L4.zone).filter(([k]) => ZONES.find(z => z.id === k).tags.includes('intimo')).reduce((s, [, v]) => s + v, 0) / N;
console.log(`  anatomía íntima en Intimidad ${pct(intimateShare * N, N)} · en Exploración ${pct(Object.entries(L3.zone).filter(([k]) => ZONES.find(z => z.id === k).tags.includes('intimo')).reduce((s, [, v]) => s + v, 0), N)}`);
if (intimateShare < 0.35) { console.log('  ✗ Intimidad apenas usa anatomía íntima'); fail++; }
if (!(L1.mean < 3.5 && L2.mean > 3.5 && L2.mean < 6.5 && L3.mean > 6 && L4.mean > L3.mean)) { console.log('  ✗ las medias no caen en sus rangos'); fail++; }

/* 3b. Sesiones reales: 40 partidas de 20 tiradas por nivel */
console.log('\n== Sesiones reales (40 partidas × 20 tiradas) ==');
for (const s of setups) {
  const S = 40, Rn = 20; const fam = [], acts = [], famMax = [], condMax = []; let win5Fam = 0, win5Act = 0, condNear = 0, semNear = 0, pairsN = 0;
  for (let k = 0; k < S; k++) {
    const eng = new GameEngine({ prefs: { ...BASE, anatomy: s.anatomy || BASE.anatomy }, seed: 1000 + k, level: s.level });
    const rs = []; for (let i = 0; i < Rn; i++) rs.push(eng.roll());
    const zf = {}, cc = {}; const A = new Set();
    rs.forEach((r, i) => {
      count(zf, r.families.zone); if (r.cond) count(cc, r.cond); A.add(r.action);
      const w = rs.slice(Math.max(0, i - 4), i); pairsN++;
      if (w.filter(p => p.families.zone === r.families.zone).length >= 2) win5Fam++;
      if (w.filter(p => p.families.action === r.families.action).length >= 2) win5Act++;
      if (r.cond && w.some(p => p.cond === r.cond)) condNear++;
      if (w.slice(-2).some(p => p.semanticFamily === r.semanticFamily)) semNear++;
    });
    fam.push(Object.keys(zf).length); acts.push(A.size); famMax.push(Math.max(...Object.values(zf))); condMax.push(Math.max(0, ...Object.values(cc)));
  }
  const med = a => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
  console.log(`  ${s.key}: familias de zona distintas ${med(fam)} (mín ${Math.min(...fam)}) · acciones distintas ${med(acts)} (mín ${Math.min(...acts)}) · familia de zona más repetida ${med(famMax)}/20 · condición más repetida ${Math.max(...condMax)}`);
  console.log(`    misma familia de zona 3 veces en 5 ${pct(win5Fam, pairsN)} · misma familia de acción 3 veces en 5 ${pct(win5Act, pairsN)} · condición repetida en 5 ${pct(condNear, pairsN)} · misma familia semántica en 3 seguidas ${pct(semNear, pairsN)}`);
  const small = s.level === 4;
  if (med(fam) < (small ? 5 : 6) || med(acts) < 9 || Math.max(...condMax) > 3 || condNear / pairsN > 0.005 || win5Fam / pairsN > (small ? 0.08 : 0.03) || semNear / pairsN > 0.02) { console.log('  ✗ la sesión no se siente variada'); fail++; }
}

/* 4. Muestra */
if (SAMPLE) {
  for (const L of [1, 2, 3, 4]) {
    console.log(`\n== Muestra ${LEVELS[L].name} ==`);
    const eng = new GameEngine({ prefs: BASE, seed: 2024 + L, level: L });
    for (let i = 0; i < 10; i++) { const r = eng.roll(); console.log(`  [${r.intensity.toFixed(1)}] ${r.purpose.padEnd(8)} ${r.performerName}: ${r.phrase}`); if (i === 2) eng.feedback('like'); }
  }
  console.log('\n== Suave (misma idea, menos intensidad) ==');
  const eng = new GameEngine({ prefs: BASE, seed: 5, level: 3 });
  for (let i = 0; i < 4; i++) { const r = eng.roll(); console.log(`  [${r.intensity.toFixed(1)}] ${r.phrase}`); const s = eng.softer(); console.log(`    ↓ [${s ? s.intensity.toFixed(1) : '-'}] ${s ? s.phrase : 'sin variante'}`); }
}
console.log(fail ? `\n✗ ${fail} comprobaciones fallidas` : '\n✓ Todo correcto');
process.exit(fail ? 1 : 0);
