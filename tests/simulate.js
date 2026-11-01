/* Simulación rápida: tiradas por nivel con el Session Director. Falla si hay inválidas, algo por debajo del umbral,
   frases poco humanas, repetición excesiva o si los niveles se parecen. Ejecutar: node tests/simulate.js [rondas] [--sample] */
import { GameEngine } from '../engine/engine.js';
import { GROUPS, LEVELS, COMBOS, combosForLevel } from '../engine/grammar.js';
import { THRESHOLD, HUMAN_MIN } from '../engine/quality.js';

const N = Number(process.argv.find(a => /^\d+$/.test(a))) || 1000;
const SAMPLE = process.argv.includes('--sample');
let fail = 0;
const pct = (n, t) => (100 * n / t).toFixed(1) + '%';
const count = (m, k) => { m[k] = (m[k] || 0) + 1; };
const top = (m, n, t) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${pct(v, t)}`).join(' · ');
const ALL = Object.keys(GROUPS);
const BASE = { names: ['Ana', 'Leo'], bodyParts: [['vulva'], ['pene']], enabledGroups: ALL };
console.log('== Espacio de combinaciones aprobadas ==');
for (const L of [1, 2, 3, 4]) { const cs = combosForLevel(L); console.log(`  ${LEVELS[L].name}: ${cs.length} combinaciones · ${cs.reduce((s, c) => s + 1 + c.styles.length, 0)} con estilo · ${cs.filter(c => c.guidable).length} guiables`); }
const setups = [1, 2, 3, 4].map(L => ({ key: LEVELS[L].key, level: L })).concat([{ key: 'intimidad (dos penes)', level: 4, bodyParts: [['pene'], ['pene']] }]);
let seed = 11; const means = {};
for (const s of setups) {
  const eng = new GameEngine({ prefs: { ...BASE, bodyParts: s.bodyParts || BASE.bodyParts }, seed: seed++, level: s.level });
  const st = { invalid: 0, lowQ: 0, lowH: 0, fallback: 0, target: {}, act: {}, style: {}, pattern: {}, purpose: {}, sum: 0, repZone4: 0, repAct3: 0, semNear: 0, repPhrase10: 0, phrases: new Set(), seq: [], drift: 0, guided: 0 };
  for (let i = 0; i < N; i++) {
    const r = eng.roll();
    if (r.validation === 'INVALID') { st.invalid++; if (st.invalid < 4) console.log('  INVALID', r.phrase); }
    if (!r.fallback && r.quality < THRESHOLD) st.lowQ++; if (r.humanLikeness < HUMAN_MIN) st.lowH++; if (r.fallback) st.fallback++; if (r.level !== s.level) st.drift++; if (r.pattern === 'GUIDED') st.guided++;
    count(st.target, r.target); count(st.act, r.action); count(st.style, r.style || '—'); count(st.pattern, r.pattern); count(st.purpose, r.purpose);
    st.sum += r.intensity; st.phrases.add(r.phrase);
    const prev = st.seq.slice(-10);
    if (prev.slice(-3).some(p => p.target === r.target)) st.repZone4++;
    if (prev.slice(-2).some(p => p.action === r.action)) st.repAct3++;
    if (prev.slice(-2).some(p => p.semanticFamily === r.semanticFamily) && r.purpose !== 'DEEPEN') st.semNear++;
    if (prev.some(p => p.phrase === r.phrase)) st.repPhrase10++;
    st.seq.push(r);
    if (i % 4 === 1) eng.feedback('like'); else if (i % 8 === 3) eng.feedback('cambia'); else if (i % 12 === 5) eng.feedback('paso');
  }
  st.mean = st.sum / N; means[s.key] = st.mean;
  console.log(`\n== ${s.key} · ${N} rondas · intensidad media ${st.mean.toFixed(2)} · ${st.phrases.size} frases distintas · rechazadas ${eng.stats.rejected} ${JSON.stringify(eng.stats.rejectedReasons)} ==`);
  console.log(`  inválidas ${st.invalid} · bajo umbral ${st.lowQ} · poco humanas ${st.lowH} · fallbacks ${st.fallback} · nivel movido solo ${st.drift} · guiadas ${pct(st.guided, N)}`);
  console.log(`  zona repetida ≤3 ${st.repZone4} · acción repetida ≤2 ${st.repAct3} · familia cercana ${st.semNear} · frase repetida ≤10 ${st.repPhrase10}`);
  console.log(`  zonas (${Object.keys(st.target).length}): ${top(st.target, 10, N)}`); console.log(`  acciones (${Object.keys(st.act).length}): ${top(st.act, 10, N)}`); console.log(`  estilos: ${top(st.style, 6, N)} · patrones: ${top(st.pattern, 4, N)} · propósitos: ${top(st.purpose, 8, N)}`);
  if (st.invalid || st.lowQ || st.lowH || st.drift || st.repZone4 || st.repAct3 || st.semNear / N > (s.level === 4 ? 0.04 : 0.02) || st.repPhrase10 / N > 0.005 || st.fallback / N > 0.005 || st.phrases.size / N < 0.25) { fail++; console.log('  ✗ FALLO en este nivel'); }
  if (SAMPLE) { console.log('  muestra:'); for (const r of st.seq.slice(0, 12)) console.log(`   · [${r.action}·${r.tool}→${r.target} ${r.style || '—'} ${r.seconds}s ${r.pattern}] ${r.phrase}`); }
}
if (!(means.conexion < means.deseo && means.deseo < means.exploracion && means.exploracion < means.intimidad)) { fail++; console.log('\n✗ Los niveles no se ordenan por intensidad'); }
console.log(fail ? `\n✗ ${fail} fallos` : '\n✓ Todo correcto');
process.exit(fail ? 1 : 0);
