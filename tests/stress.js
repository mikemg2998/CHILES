/* STRESS TEST del generador: miles de tiradas sin interfaz, con informe de distribución y calidad estructural y una
   muestra legible para auditar a mano. Solo desarrollo.
   node tests/stress.js [tiradas=10000] [--sample=100] [--out=ruta]  → imprime el informe y escribe la muestra en --out (o en stdout) */
import { writeFileSync } from 'node:fs';
import { GameEngine } from '../engine/engine.js';
import { ACTION, ZONE, CONDITION, GROUPS, LEVELS } from '../engine/catalog.js';
import { BLUEPRINT } from '../engine/blueprints.js';
import { THRESHOLD } from '../engine/quality.js';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const N = Number(process.argv.find(a => /^\d+$/.test(a))) || 10000;
const SAMPLE = Number(arg('sample', 100)), OUT = arg('out', null);
const count = (m, k) => { m[k] = (m[k] || 0) + 1; };
const pct = (n, t) => (100 * n / t).toFixed(1) + '%';
const top = (m, n = 8) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);
const ALL = Object.keys(GROUPS);
const setups = [
  { name: 'vulva+pene', bodyParts: [['vulva'], ['pene']] }, { name: 'pene+pene', bodyParts: [['pene'], ['pene']] }, { name: 'vulva+vulva', bodyParts: [['vulva'], ['vulva']] }, { name: 'sin anatomía íntima', bodyParts: [[], []] },
];
const R = { totalGenerated: 0, totalAccepted: 0, totalRejected: 0, rejectionReasons: {}, actionFrequency: {}, familyFrequency: {}, blueprintFrequency: {}, actorBodyPartFrequency: {}, targetBodyPartFrequency: {}, actorTargetPairs: {}, conditionFrequency: {}, conditionTierFrequency: {}, formFrequency: {}, setupConditionFrequency: {}, positionComplexityDistribution: {}, semanticFamilyDistribution: {}, levelDistribution: {}, patternDistribution: {}, purposeDistribution: {}, structure: {}, quality: [], fallbacks: 0, invalid: 0, lowQuality: 0, setupOutsideBlueprint: 0, complexityTooHigh: 0, phrases: new Set() };
const accepted = [];
let seed = 100;
const perLevel = Math.ceil(N / 4);
for (const L of [1, 2, 3, 4]) {
  let done = 0;
  while (done < perLevel) {
    const setup = setups[seed % setups.length];
    const eng = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: setup.bodyParts, enabledGroups: ALL }, seed: seed++, level: L, debug: true });
    const len = Math.min(30, perLevel - done);
    for (let i = 0; i < len; i++) {
      const r = eng.roll(); done++;
      const a = ACTION[r.action], z = ZONE[r.zone], c = r.cond ? CONDITION[r.cond] : null, bp = r.blueprint ? BLUEPRINT[r.blueprint] : null;
      R.totalAccepted++;
      count(R.actionFrequency, r.action); count(R.familyFrequency, a.family); count(R.blueprintFrequency, r.blueprint || '—'); count(R.actorBodyPartFrequency, a.actor); count(R.targetBodyPartFrequency, r.zone); count(R.actorTargetPairs, `${a.actor}→${r.zone}`);
      count(R.conditionFrequency, r.cond || '—'); count(R.conditionTierFrequency, r.condTier || '—'); count(R.formFrequency, r.method || '—'); if (c && c.tier === 'SETUP') count(R.setupConditionFrequency, c.id);
      count(R.positionComplexityDistribution, r.mechanics ? r.mechanics.complexity : '?'); count(R.semanticFamilyDistribution, r.semanticFamily); count(R.levelDistribution, LEVELS[r.level].name); count(R.patternDistribution, r.pattern); count(R.purposeDistribution, r.purpose);
      count(R.structure, 'A+Z' + (r.method ? '+F' : '') + (r.cond ? '+C' : ''));
      R.quality.push(r.quality); R.phrases.add(r.phrase);
      if (r.fallback) R.fallbacks++; if (r.validation !== 'VALID') R.invalid++; if (!r.fallback && r.quality < THRESHOLD) R.lowQuality++;
      if (c && c.tier === 'SETUP' && !(bp && bp.conditions.setup.includes(c.id))) R.setupOutsideBlueprint++;
      if (r.mechanics && r.mechanics.complexity >= 2) R.complexityTooHigh++;
      accepted.push({ level: LEVELS[r.level].name, purpose: r.purpose, pattern: r.pattern, family: r.semanticFamily, blueprint: r.blueprint, actorBodyPart: a.actor, targetBodyPart: r.zone, form: r.method || '—', condition: r.cond || '—', positionComplexity: r.mechanics ? r.mechanics.complexity : '?', qualityScore: r.quality, finalText: r.phrase, setup: setup.name });
      if (i % 4 === 1) eng.feedback('like'); else if (i % 8 === 3) eng.feedback('cambia'); else if (i % 12 === 5) eng.feedback('paso');
    }
    R.totalRejected += eng.stats.rejected;
    for (const [k, v] of Object.entries(eng.stats.rejectedReasons)) R.rejectionReasons[k] = (R.rejectionReasons[k] || 0) + v;
  }
}
R.totalGenerated = R.totalAccepted + R.totalRejected;
const qs = R.quality.sort((a, b) => a - b), q = p => qs[Math.floor(p * (qs.length - 1))];
console.log(`== Stress test · ${R.totalAccepted} tiradas aceptadas (${R.totalGenerated} candidatas evaluadas, ${R.totalRejected} rechazadas antes de llegar a la interfaz) ==`);
console.log(`  inválidas ${R.invalid} · por debajo del umbral ${R.lowQuality} · fallbacks ${R.fallbacks} · SETUP fuera de blueprint ${R.setupOutsideBlueprint} · posición compleja (≥2) ${R.complexityTooHigh} · frases distintas ${R.phrases.size}`);
console.log(`  calidad: mediana ${q(.5).toFixed(3)} · p10 ${q(.1).toFixed(3)} · mín ${qs[0].toFixed(3)}`);
const show = (title, m, n = 10, t = R.totalAccepted) => console.log(`  ${title}: ${top(m, n).map(([k, v]) => `${k} ${pct(v, t)}`).join(' · ')}`);
show('razones de rechazo', R.rejectionReasons, 12, R.totalRejected);
show('niveles', R.levelDistribution, 4); show('propósitos', R.purposeDistribution, 8); show('patrones', R.patternDistribution, 7);
show('blueprints', R.blueprintFrequency, 20); show('familias semánticas', R.semanticFamilyDistribution, 12); show('familias de acción', R.familyFrequency, 14);
show('acciones', R.actionFrequency, 14); show('parte que actúa', R.actorBodyPartFrequency, 12); show('zona que recibe', R.targetBodyPartFrequency, 14); show('pares parte→zona', R.actorTargetPairs, 12);
show('estructura', R.structure, 4); show('formas', R.formFrequency, 10); show('condiciones', R.conditionFrequency, 12); show('nivel de condición', R.conditionTierFrequency, 4); show('condiciones SETUP', R.setupConditionFrequency, 6);
show('complejidad de posición', R.positionComplexityDistribution, 4);
// muestra aleatoria legible (semilla fija para que sea reproducible)
let s = 7; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
const sample = [...accepted].sort(() => rnd() - 0.5).slice(0, SAMPLE).sort((a, b) => a.level.localeCompare(b.level));
const lines = [`MUESTRA DE AUDITORÍA · ${SAMPLE} interacciones aceptadas al azar entre ${R.totalAccepted} (${new Date().toISOString().slice(0, 10)})`, 'nivel · propósito · patrón · familia · blueprint · parte→zona · forma · condición · complejidad · calidad', ''];
for (const x of sample) lines.push(`[${x.level} · ${x.purpose} · ${x.pattern} · ${x.family} · ${x.blueprint} · ${x.actorBodyPart}→${x.targetBodyPart} · ${x.form} · ${x.condition} · c${x.positionComplexity} · ${x.qualityScore.toFixed(2)} · ${x.setup}]`, `  ${x.finalText}`, '');
if (OUT) { writeFileSync(OUT, lines.join('\n')); console.log(`\n  muestra escrita en ${OUT}`); } else console.log('\n' + lines.join('\n'));
const bad = R.invalid + R.lowQuality + R.setupOutsideBlueprint + R.complexityTooHigh + (R.fallbacks > R.totalAccepted * 0.005 ? 1 : 0);
console.log(bad ? `\n✗ ${bad} problemas estructurales` : '\n✓ Sin problemas estructurales');
process.exit(bad ? 1 : 0);
