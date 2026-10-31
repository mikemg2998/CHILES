/* Simulación v2: 1.000 tiradas por nivel. Falla si hay inválidas, si se repite demasiado
   o si Sensual y Atrevido se parecen demasiado. Ejecutar: node tests/simulate.js [rondas] [--sample] */
import { GameEngine, CombinationValidator } from '../engine/engine.js';
import { ACTIONS, ZONES, ZONE, METHODS, CONDITIONS, GROUPS, LEVELS } from '../engine/catalog.js';
import { CompatibilityEngine as CE } from '../engine/compat.js';
import { combinationIntensity } from '../engine/intensity.js';
import { PreferenceManager } from '../engine/prefs.js';

const N = Number(process.argv.find(a => /^\d+$/.test(a))) || 1000;
const SAMPLE = process.argv.includes('--sample');
let fail = 0;
const pct = (n, t) => (100 * n / t).toFixed(1) + '%';
const count = (m, k) => { m[k] = (m[k] || 0) + 1; };
const top = (m, n, t) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${pct(v, t)}`).join(' · ');
const ALL = Object.keys(GROUPS);

/* 1. Espacio del catálogo por nivel */
console.log('== Catálogo ==');
const prefsAll = new PreferenceManager({ enabledGroups: ALL });
for (const L of [1, 2, 3]) {
  let valid = 0, invalid = 0, quest = 0; const reasons = {};
  for (const a of ACTIONS.filter(a => a.levels[L])) for (const z of CE.zonesFor(a, L, prefsAll)) {
    for (const m of [null, ...CE.methodsFor(a, z, L)]) for (const c of [null, ...CE.conditionsFor(a, z, m, L)]) {
      if (c && c.needsAlt) continue;
      const intensity = combinationIntensity(a, z, m, c);
      const v = CombinationValidator.validate({ action: a.id, zone: z.id, method: m && m.id, cond: c && c.id, intensity, level: L }, prefsAll);
      if (v.status === 'VALID') valid++; else if (v.status === 'QUESTIONABLE') quest++; else { invalid++; count(reasons, v.reasons[0].split(':')[0]); }
    }
  }
  console.log(`  ${LEVELS[L].name}: ${valid} válidas · ${quest} cuestionables · ${invalid} descartadas por el validador (${Object.entries(reasons).map(([k, v]) => `${k} ${v}`).join(', ')})`);
}

/* 2. Partidas simuladas */
const results = {};
const setups = [
  { key: 'relajado', mode: 'relajado', groups: ALL.filter(g => GROUPS[g].default) },
  { key: 'sensual', mode: 'sensual', groups: ALL.filter(g => GROUPS[g].default) },
  { key: 'atrevido', mode: 'atrevido', groups: ALL },
  { key: 'atrevido (sin anatomía íntima)', mode: 'atrevido', groups: ALL.filter(g => GROUPS[g].default) },
  { key: 'progresivo', mode: 'progresivo', groups: ALL },
];
let seed = 11;
for (const s of setups) {
  const eng = new GameEngine({ prefs: { names: ['Ana', 'Leo'], mode: s.mode, enabledGroups: s.groups }, seed: seed++ });
  const st = { n: N, invalid: 0, quest: 0, zone: {}, act: {}, meth: {}, cond: {}, cat: {}, lvl: {}, sum: 0, repZone4: 0, repAct3: 0, repCond3: 0, phrases: new Set(), seq: [], samples: [] };
  for (let i = 0; i < N; i++) {
    const r = eng.roll();
    if (r.validation === 'INVALID') { st.invalid++; if (st.invalid < 4) console.log('  INVALID', r.phrase); }
    if (r.validation === 'QUESTIONABLE') st.quest++;
    count(st.zone, r.zone); count(st.act, r.action); count(st.meth, r.method || '—'); count(st.cond, r.cond || '—'); count(st.cat, r.category); count(st.lvl, r.level);
    st.sum += r.intensity; st.phrases.add(r.phrase);
    const prev = st.seq.slice(-4);
    if (prev.some(p => p.zone === r.zone)) st.repZone4++;
    if (prev.slice(-3).some(p => p.action === r.action)) st.repAct3++;
    if (prev.slice(-3).some(p => p.cond && p.cond === r.cond)) st.repCond3++;
    st.seq.push(r); if (i < 12) st.samples.push(r);
  }
  st.mean = st.sum / N; st.rejected = eng.stats.rejected; st.rejectedReasons = eng.stats.rejectedReasons;
  results[s.key] = st;
  const Z = ZONES.filter(z => eng.prefs.zoneEnabled(z));
  console.log(`\n== ${s.key} · ${N} tiradas ==`);
  console.log(`  inválidas ${st.invalid} · cuestionables ${st.quest} · intensidad media ${st.mean.toFixed(2)} · frases distintas ${st.phrases.size}`);
  console.log(`  rechazadas por el validador antes de mostrar: ${st.rejected} (${Object.entries(st.rejectedReasons).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} ${v}`).join(', ')})`);
  console.log(`  zona repetida en 4 rondas ${pct(st.repZone4, N)} · acción repetida en 3 ${pct(st.repAct3, N)} · condición repetida en 3 ${pct(st.repCond3, N)}`);
  console.log(`  zonas: ${top(st.zone, 8, N)}`);
  console.log(`  acciones: ${top(st.act, 8, N)}`);
  console.log(`  formas: ${top(st.meth, 6, N)}`);
  console.log(`  condiciones: ${top(st.cond, 6, N)}`);
  console.log(`  categorías: ${top(st.cat, 8, N)}`);
  if (s.mode === 'progresivo') console.log(`  nivel por ronda: ${Object.entries(st.lvl).map(([k, v]) => `${LEVELS[k].name} ${pct(v, N)}`).join(' · ')}`);
  console.log(`  curva (25 primeras): ${st.seq.slice(0, 25).map(r => r.intensity.toFixed(1)).join(' ')}`);
  console.log(`  nunca: zonas ${Z.filter(z => !st.zone[z.id] && Object.keys(z.levels).some(l => s.mode === 'progresivo' || l == { relajado: 1, sensual: 2, atrevido: 3 }[s.mode])).map(z => z.id).join(',') || '—'}`);
  if (st.invalid) fail++;
  const poolZ = Z.filter(z => Object.keys(z.levels).some(l => s.mode === 'progresivo' || l == { relajado: 1, sensual: 2, atrevido: 3 }[s.mode])).length;
  if (st.repZone4 / N > (poolZ < 16 ? 0.25 : 0.03)) { console.log('  ⚠ demasiadas zonas repetidas'); fail++; }
}

/* 3. Test de separación entre niveles */
function dist(m, t) { const d = {}; for (const k in m) d[k] = m[k] / t; return d; }
function overlap(a, b) { let s = 0; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) s += Math.sqrt((a[k] || 0) * (b[k] || 0)); return s; } // Bhattacharyya: 1 = iguales
console.log('\n== Separación entre niveles ==');
const R = results, S = R.sensual, A = R.atrevido, Rl = R.relajado;
const ozSA = overlap(dist(S.zone, N), dist(A.zone, N)), oaSA = overlap(dist(S.act, N), dist(A.act, N));
const ozRS = overlap(dist(Rl.zone, N), dist(S.zone, N)), oaRS = overlap(dist(Rl.act, N), dist(S.act, N));
console.log(`  intensidad media: Relajado ${Rl.mean.toFixed(2)} · Sensual ${S.mean.toFixed(2)} · Atrevido ${A.mean.toFixed(2)}`);
console.log(`  solapamiento de zonas Relajado/Sensual ${ozRS.toFixed(2)} · Sensual/Atrevido ${ozSA.toFixed(2)} (1 = iguales, 0 = nada en común)`);
console.log(`  solapamiento de acciones Relajado/Sensual ${oaRS.toFixed(2)} · Sensual/Atrevido ${oaSA.toFixed(2)}`);
const topA = Object.entries(A.zone).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
console.log(`  5 zonas más frecuentes en Atrevido: ${topA.join(', ')}`);
if (ozSA > 0.55 || oaSA > 0.55) { console.log('  ✗ Sensual y Atrevido se parecen demasiado'); fail++; }
if (ozRS > 0.55 || oaRS > 0.6) { console.log('  ✗ Relajado y Sensual se parecen demasiado'); fail++; }
if (topA.some(z => ['cuello', 'nuca', 'orejas'].includes(z))) { console.log('  ✗ cuello/nuca/orejas entre las zonas principales de Atrevido'); fail++; }
if (!(Rl.mean < 3.5 && S.mean > 3.5 && S.mean < 6.5 && A.mean > 6.5)) { console.log('  ✗ las medias no caen en sus rangos'); fail++; }

/* 4. Muestra */
if (SAMPLE) {
  for (const key of ['relajado', 'sensual', 'atrevido']) {
    console.log(`\n== Muestra ${key} ==`);
    const eng = new GameEngine({ prefs: { names: ['Ana', 'Leo'], mode: key, enabledGroups: ALL }, seed: 2024 + key.length });
    for (let i = 0; i < 10; i++) { const r = eng.roll(); console.log(`  [${r.intensity.toFixed(1)}] ${r.performerName}: ${r.phrase}`); }
  }
  console.log('\n== Bajar / subir intensidad (misma idea) ==');
  const eng = new GameEngine({ prefs: { names: ['Ana', 'Leo'], mode: 'atrevido', enabledGroups: ALL }, seed: 5 });
  for (let i = 0; i < 4; i++) { const r = eng.roll(); console.log(`  [${r.intensity.toFixed(1)}] ${r.phrase}`); const s = eng.softer(); console.log(`    ↓ [${s ? s.intensity.toFixed(1) : '-'}] ${s ? s.phrase : 'sin variante'}`); const h = eng.harder(); console.log(`    ↑ [${h ? h.intensity.toFixed(1) : '-'}] ${h ? h.phrase : 'sin variante'}`); }
  console.log('\n== Volver a lanzar (cambian ≥3 componentes) ==');
  let same = 0; for (let i = 0; i < 300; i++) { const r = eng.roll(); const q = eng.reroll(); const k = (r.action === q.action) + (r.zone === q.zone) + (r.method === q.method) + (r.cond === q.cond); if (k > 1) same++; }
  console.log(`  tiradas donde cambiaron menos de 3 componentes: ${same}/300`);
}
console.log(fail ? `\n✗ ${fail} comprobaciones fallidas` : '\n✓ Todo correcto');
process.exit(fail ? 1 : 0);
