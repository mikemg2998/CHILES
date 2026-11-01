/* STRESS TEST del motor v6: miles de tiradas sin interfaz. Informe de frecuencias (acción, zona, herramienta, estilo,
   duración, nivel, pares acción·zona y herramienta·zona, tripletas, formas de frase, razones de rechazo), auditoría humana
   (50 por nivel) y una sesión simulada de 50 tiradas con sessionQuality. Solo desarrollo.
   node tests/stress.js [tiradas=10000] [--audit=ruta.txt] [--session=ruta.txt] */
import { writeFileSync } from 'node:fs';
import { GameEngine } from '../engine/engine.js';
import { ACTIONS, TARGETS, ACTOR_TOOLS, STYLES, GROUPS, LEVELS, COMBO, LEVEL_IDS } from '../engine/grammar.js';
import { THRESHOLD, HUMAN_MIN, sessionQuality } from '../engine/quality.js';
import { HUMAN_DURATIONS, LONG_DURATION } from '../engine/data/durations.js';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const N = Number(process.argv.find(a => /^\d+$/.test(a))) || 10000;
const AUDIT = arg('audit', null), SESSION = arg('session', null);
const count = (m, k) => { m[k] = (m[k] || 0) + 1; };
const pct = (n, t) => (100 * n / t).toFixed(1) + '%';
const top = (m, n = 8) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);
const ALL = Object.keys(GROUPS);
const setups = [{ name: 'vulva+pene', bodyParts: [['vulva'], ['pene']] }, { name: 'pene+pene', bodyParts: [['pene'], ['pene']] }, { name: 'vulva+vulva', bodyParts: [['vulva'], ['vulva']] }, { name: 'sin anatomía íntima', bodyParts: [[], []] }];
const R = { accepted: 0, rejected: 0, rejectionReasons: {}, action: {}, target: {}, tool: {}, style: {}, duration: {}, level: {}, pattern: {}, tier: {}, purpose: {}, actionTarget: {}, toolTarget: {}, triple: {}, shape: {}, family: {}, structure: {}, quality: [], human: [], fallbacks: 0, invalid: 0, lowQuality: 0, lowHuman: 0, badDuration: 0, unapproved: 0, intimateOutside: 0, guidedBad: 0, phrases: new Set(), recomposed: 0 };
const byLevel = { 1: [], 2: [], 3: [] };
let seed = 100; const perLevel = Math.ceil(N / 3);
for (const L of LEVEL_IDS) {
  let done = 0;
  while (done < perLevel) {
    const setup = setups[seed % setups.length];
    const eng = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: setup.bodyParts, enabledGroups: ALL }, seed: seed++, level: L, debug: true });
    const len = Math.min(30, perLevel - done);
    for (let i = 0; i < len; i++) {
      const r = eng.roll(); done++;
      R.accepted++;
      count(R.action, r.action); count(R.target, r.target); count(R.tool, r.tool); count(R.style, r.style || '—'); count(R.duration, r.seconds + ' s'); count(R.level, LEVELS[r.level].name); count(R.pattern, r.pattern); count(R.tier, r.tier); count(R.purpose, r.purpose);
      count(R.actionTarget, `${r.action}→${r.target}`); count(R.toolTarget, `${r.tool}→${r.target}`); count(R.triple, `${r.action}·${r.tool}→${r.target}`); count(R.shape, r.shape); count(R.family, r.semanticFamily);
      count(R.structure, 'A+T+Z' + (r.style ? '+S' : '') + (r.pattern === 'GUIDED' ? '+G' : ''));
      R.quality.push(r.quality); R.human.push(r.humanLikeness); R.phrases.add(r.phrase);
      const c = COMBO[r.key];
      if (r.fallback) R.fallbacks++; if (r.validation !== 'VALID') R.invalid++; if (!r.fallback && r.quality < THRESHOLD) R.lowQuality++; if (r.humanLikeness < HUMAN_MIN) R.lowHuman++;
      if (![...HUMAN_DURATIONS, LONG_DURATION].includes(r.seconds)) R.badDuration++;
      if (!c || !c.levels.includes(r.band || L)) R.unapproved++; // en Intimidad sin anatomía íntima se juega con el repertorio alto de Deseo
      if (TARGETS[r.target].tags.includes('intimo') && L < 3) R.intimateOutside++;
      if (r.pattern === 'GUIDED' && !(c && c.guidable)) R.guidedBad++;
      byLevel[L].push({ finalText: r.phrase, duration: r.seconds, action: r.action, actorTool: r.tool, target: r.target, style: r.style || '—', level: LEVELS[L].name, pattern: r.pattern, compatibilityTier: r.tier, qualityScore: r.quality, humanLikenessScore: r.humanLikeness, shape: r.shape, setup: setup.name });
      if (i % 4 === 1) eng.feedback('like'); else if (i % 8 === 3) eng.feedback('cambia'); else if (i % 12 === 5) eng.feedback('paso');
    }
    R.rejected += eng.stats.rejected; R.recomposed += eng.stats.recomposed;
    for (const [k, v] of Object.entries(eng.stats.rejectedReasons)) R.rejectionReasons[k] = (R.rejectionReasons[k] || 0) + v;
  }
}
const qs = [...R.quality].sort((a, b) => a - b), q = p => qs[Math.floor(p * (qs.length - 1))];
const hs = [...R.human].sort((a, b) => a - b), h = p => hs[Math.floor(p * (hs.length - 1))];
console.log(`== Stress test · ${R.accepted} tiradas aceptadas (${R.accepted + R.rejected} candidatas evaluadas, ${R.rejected} rechazadas antes de la interfaz, ${R.recomposed} recompuestas) ==`);
console.log(`  inválidas ${R.invalid} · no aprobadas ${R.unapproved} · íntimas fuera de Intimidad ${R.intimateOutside} · bajo umbral ${R.lowQuality} · frase poco humana ${R.lowHuman} · duración no humana ${R.badDuration} · guiadas sin soporte ${R.guidedBad} · fallbacks ${R.fallbacks} · frases distintas ${R.phrases.size}`);
console.log(`  calidad: mediana ${q(.5).toFixed(3)} · p10 ${q(.1).toFixed(3)} · mín ${qs[0].toFixed(3)} · humanLikeness: mediana ${h(.5)} · p10 ${h(.1)} · mín ${hs[0]}`);
const show = (title, m, n = 10, t = R.accepted) => console.log(`  ${title}: ${top(m, n).map(([k, v]) => `${k} ${pct(v, t)}`).join(' · ')}`);
show('razones de rechazo', R.rejectionReasons, 12, R.rejected);
show('niveles', R.level, 3); show('propósitos', R.purpose, 8); show('patrones', R.pattern, 4); show('tiers', R.tier, 3); show('estructura', R.structure, 4);
show('acciones', R.action, 24); show('zonas', R.target, 20); show('herramientas', R.tool, 14); show('estilos', R.style, 6); show('duraciones', R.duration, 9);
show('pares acción→zona', R.actionTarget, 14); show('pares herramienta→zona', R.toolTarget, 12); show('tripletas acción·herramienta→zona', R.triple, 12);
show('formas de frase', R.shape, 14); show('familias semánticas', R.family, 12);
console.log(`  formas de frase distintas: ${Object.keys(R.shape).length} · tripletas distintas: ${Object.keys(R.triple).length} de ${Object.keys(COMBO).length} aprobadas`);
// auditoría humana: 50 por nivel, al azar reproducible
let s = 7; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
const audit = LEVEL_IDS.flatMap(L => [...byLevel[L]].sort(() => rnd() - 0.5).slice(0, 67));
const lines = [`AUDITORÍA HUMANA · 200 interacciones (50 por nivel) al azar entre ${R.accepted} aceptadas · ${new Date().toISOString().slice(0, 10)}`, 'nivel · acción · herramienta → zona · estilo · duración · patrón · tier · calidad · humanLikeness · forma · anatomía', ''];
for (const x of audit) lines.push(`[${x.level} · ${x.action} · ${x.actorTool} → ${x.target} · ${x.style} · ${x.duration}s · ${x.pattern} · ${x.compatibilityTier} · q${x.qualityScore.toFixed(2)} · h${x.humanLikenessScore} · ${x.shape} · ${x.setup}]`, `  ${x.finalText}`, '');
if (AUDIT) { writeFileSync(AUDIT, lines.join('\n')); console.log(`\n  auditoría escrita en ${AUDIT}`); }
// sesión simulada de 50 tiradas: empieza en Conexión, la pareja sube a Deseo en la 12 y a Exploración en la 30
const eng = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva'], ['pene']], enabledGroups: ALL }, seed: 777, level: 1 });
const seq = [], sl = ['SESIÓN SIMULADA · 50 tiradas · Conexión → Deseo (12) → Exploración (30) · feedback: me gusta 1/4, cambia 1/8, paso 1/12', ''];
for (let i = 0; i < 50; i++) {
  if (i === 12) eng.setLevel(2); if (i === 30) eng.setLevel(3);
  const r = eng.roll(); seq.push(r);
  sl.push(`${String(i + 1).padStart(2)}. [L${r.level} · ${r.purpose} · ${r.action}·${r.tool}→${r.target} · ${r.style || '—'} · ${r.seconds}s · ${r.pattern} · i${r.intensity} · q${(r.quality || 0).toFixed(2)}] ${r.phrase}`);
  if (i % 4 === 1) eng.feedback('like'); else if (i % 8 === 3) eng.feedback('cambia'); else if (i % 12 === 5) eng.feedback('paso');
}
const sq = sessionQuality(seq);
sl.push('', `sessionQuality: ${JSON.stringify(sq)}`);
if (SESSION) { writeFileSync(SESSION, sl.join('\n')); console.log(`  sesión escrita en ${SESSION}`); }
console.log(`  sesión simulada: ${JSON.stringify(sq)}`);
const bad = R.invalid + R.unapproved + R.intimateOutside + R.lowQuality + R.lowHuman + R.badDuration + R.guidedBad + (R.fallbacks > R.accepted * 0.005 ? 1 : 0) + (sq.phraseRepetition > 0.02 ? 1 : 0);
console.log(bad ? `\n✗ ${bad} problemas estructurales` : '\n✓ Sin problemas estructurales');
process.exit(bad ? 1 : 0);
