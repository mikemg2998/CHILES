/* Simulación: miles de tiradas en cada modo, con y sin anatomía íntima. Analiza coherencia y variedad.
   Ejecutar: node tests/simulate.js [rondas] */
import { GameEngine, CombinationValidator } from '../engine/engine.js';
import { ACTIONS, ZONES, STYLES, CONDITIONS, GROUPS } from '../engine/catalog.js';
import { CompatibilityEngine as CE } from '../engine/compat.js';
import { computeIntensity } from '../engine/intensity.js';
import { PreferenceManager } from '../engine/prefs.js';

const N = Number(process.argv[2]) || 3000;
let fail = 0;
const count = (m, k) => { m[k] = (m[k] || 0) + 1; };
const pct = (n, t) => (100 * n / t).toFixed(1) + '%';

/* 1. Espacio de combinaciones válidas del catálogo */
{
  const prefs = new PreferenceManager({ enabledGroups: Object.keys(GROUPS) });
  let valid = 0, questionable = 0, invalid = 0;
  for (const a of ACTIONS) for (const zid of a.zones) {
    const z = ZONES.find(x => x.id === zid);
    for (const s of CE.stylesFor(a, z)) for (const c of CE.conditionsFor(a, z, s)) {
      const v = CombinationValidator.validate({ action: a.id, zone: z.id, style: s.id, cond: c.id, intensity: computeIntensity(a, z, s, c) }, prefs, 5);
      if (v.status === 'VALID') valid++; else if (v.status === 'QUESTIONABLE') questionable++; else { invalid++; if (invalid < 5) console.log('INVALID en catálogo:', a.id, z.id, s.id, c.id, v.reasons); }
    }
  }
  console.log(`Catálogo: ${valid} combinaciones válidas, ${questionable} cuestionables, ${invalid} inválidas (acción+zona+forma+condición)`);
  if (invalid) fail++;
}

/* 2. Partidas simuladas */
const setups = [
  { mode: 'relajado', enabledGroups: Object.keys(GROUPS).filter(g => GROUPS[g].default) },
  { mode: 'sensual', enabledGroups: Object.keys(GROUPS).filter(g => GROUPS[g].default) },
  { mode: 'atrevido', enabledGroups: Object.keys(GROUPS).filter(g => GROUPS[g].default) },
  { mode: 'atrevido', enabledGroups: Object.keys(GROUPS).filter(g => g !== 'intimaM') },
  { mode: 'atrevido', enabledGroups: Object.keys(GROUPS) },
  { mode: 'sensual', enabledGroups: ['cabeza', 'torso', 'brazos'], maxIntensity: 3 },
];
let seed = 7;
for (const setup of setups) {
  const eng = new GameEngine({ prefs: { names: ['Ana', 'Leo'], ...setup }, seed: seed++ });
  const stats = { invalid: 0, questionable: 0, disabledZone: 0, overCeiling: 0, repeatAction: 0, repeatZone: 0, sameIntensity3: 0, sig: 0, wild: 0, intensity: {}, cat: {}, act: {}, zone: {}, style: {}, cond: {}, phrases: new Set() };
  const seq = [];
  for (let i = 0; i < N; i++) {
    const r = eng.roll();
    const ceiling = Math.min({ relajado: 3, sensual: 4, atrevido: 5 }[setup.mode], setup.maxIntensity || 5);
    if (r.validation === 'INVALID') { stats.invalid++; if (stats.invalid < 4) console.log('  INVALID:', r.phrase, r); }
    if (r.validation === 'QUESTIONABLE') stats.questionable++;
    if (r.zone && !eng.prefs.zoneEnabled(ZONES.find(z => z.id === r.zone))) stats.disabledZone++;
    if (r.intensity > ceiling) stats.overCeiling++;
    if (r.signature) stats.sig++;
    if (r.wildcard) stats.wild++;
    count(stats.intensity, r.intensity); count(stats.cat, r.category);
    if (r.action) count(stats.act, r.action); if (r.zone) count(stats.zone, r.zone); if (r.style) count(stats.style, r.style); if (r.cond) count(stats.cond, r.cond);
    stats.phrases.add(r.phrase.replace(/Ana|Leo/g, 'X'));
    const prev = seq[seq.length - 1];
    if (prev && prev.action && prev.action === r.action) stats.repeatAction++;
    if (prev && prev.zone && prev.zone === r.zone) stats.repeatZone++;
    if (seq.length >= 2 && seq[seq.length - 1].intensity === r.intensity && seq[seq.length - 2].intensity === r.intensity) stats.sameIntensity3++;
    seq.push(r);
  }
  const groups = setup.enabledGroups.length === Object.keys(GROUPS).length ? 'todo' : setup.enabledGroups.length <= 3 ? 'solo ' + setup.enabledGroups.join('+') : setup.enabledGroups.includes('intimaF') ? 'sin íntima masc.' : 'sin íntimas';
  console.log(`\n== ${setup.mode} (${groups}${setup.maxIntensity ? ', máx ' + setup.maxIntensity : ''}) · ${N} tiradas ==`);
  console.log(`  inválidas ${stats.invalid} · cuestionables ${stats.questionable} · zona desactivada ${stats.disabledZone} · sobre el techo ${stats.overCeiling}`);
  console.log(`  repite acción ${pct(stats.repeatAction, N)} · repite zona ${pct(stats.repeatZone, N)} · misma intensidad 3 veces ${pct(stats.sameIntensity3, N)}`);
  console.log(`  signature ${pct(stats.sig, N)} · comodín ${pct(stats.wild, N)} · frases distintas ${stats.phrases.size}`);
  console.log('  intensidad:', Object.entries(stats.intensity).sort().map(([k, v]) => `${k}:${pct(v, N)}`).join(' '));
  console.log('  categorías:', Object.entries(stats.cat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${pct(v, N)}`).join(' '));
  const top = (m, n = 6) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k}:${pct(v, N)}`).join(' ');
  const low = (m, all) => all.filter(x => !m[x.id]).map(x => x.id);
  console.log('  acciones más frecuentes:', top(stats.act), '· nunca:', low(stats.act, ACTIONS).join(',') || '—');
  console.log('  zonas más frecuentes:', top(stats.zone), '· nunca:', low(stats.zone, ZONES.filter(z => eng.prefs.zoneEnabled(z))).join(',') || '—');
  console.log('  formas nunca:', low(stats.style, STYLES).join(',') || '—', '· condiciones nunca:', low(stats.cond, CONDITIONS).join(',') || '—');
  console.log('  curva (20 primeras):', seq.slice(0, 20).map(r => r.intensity).join('→'));
  if (stats.invalid || stats.disabledZone || stats.overCeiling) fail++;
  if (stats.repeatAction / N > 0.12 || stats.repeatZone / N > 0.12) { console.log('  ⚠ demasiadas repeticiones'); fail++; }
}

/* 3. Muestra de frases */
{
  const eng = new GameEngine({ prefs: { names: ['Ana', 'Leo'], mode: 'atrevido', enabledGroups: Object.keys(GROUPS) }, seed: 99 });
  console.log('\n== Muestra de frases ==');
  for (let i = 0; i < 24; i++) { const r = eng.roll(); console.log(`  [${r.intensity} ${r.categoryName}${r.wildcard ? ' ⭐' : ''}${r.signature ? ' ✦' : ''}] ${r.performerName}: ${r.phrase}`); }
}

console.log(fail ? `\n✗ ${fail} comprobaciones fallidas` : '\n✓ Todo correcto');
process.exit(fail ? 1 : 0);
