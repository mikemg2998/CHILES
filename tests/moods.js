/* SIMULACIÓN A/B DE MOODS. Mismo nivel, misma anatomía, misma ropa, mismas semillas; solo cambian los moods.
   node tests/moods.js [--out=reporte-moods.md] [--sessions=200] [--cards=20] */
import { writeFileSync } from 'node:fs';
import { CARD } from '../content/index.js';
import { FAMILIES } from '../content/schema.js';
import { GameEngine } from '../engine/engine.js';
import { fullAccess } from '../engine/clothing.js';
import { MOODS, moodProfile, cardTraits } from '../engine/mood.js';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', ''), N = Number(arg('sessions', 200)), R = Number(arg('cards', 20));
export const COMBOS = [['tranquilo', 'tranquilo'], ['cerca', 'cerca'], ['curiosidad', 'curiosidad'], ['abierto', 'abierto'], ['tranquilo', 'cerca'], ['tranquilo', 'curiosidad'], ['cerca', 'curiosidad'], ['curiosidad', 'abierto'], ['tranquilo', 'abierto'], [null, null]];
const name = c => c.map(m => (m ? MOODS[m].descriptor.toUpperCase() : 'SIN MOOD')).join(' + ');
const INT = { LOW: -1, MID: 0, HIGH: 1 };
const inc = (m, k, d = 1) => { m[k] = (m[k] || 0) + d; };
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + ' %' : '—');
const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const f2 = x => (Number.isFinite(x) ? x.toFixed(2) : '—');

export function runCombo(combo, level, { sessions = N, cards = R, seedBase = 0 } = {}) {
  const s = { n: 0, inten: {}, fam: {}, purpose: {}, type: {}, region: {}, group: {}, cards: {}, proximity: 0, calmCards: 0, explore: 0, highIdx: [], halves: [[], []], uniqCards: [], uniqFam: [], uniqReg: [], uniqTargets: [], repeats: 0, intensity: [], moodFactor: [] };
  for (let i = 0; i < sessions; i++) {
    const e = new GameEngine({ prefs: { names: ['Mike', 'Val'], bodyParts: [['pene'], ['vulva', 'senos']] }, seed: seedBase + 1000 * level + i, level });
    if (level === 3) e.clothing = [fullAccess(['pene']), fullAccess(['vulva', 'senos'])];
    e.setMood(0, combo[0]); e.setMood(1, combo[1]);
    const ids = [], fams = new Set(), regs = new Set(), tg = new Set(); let firstHigh = null; const ints = [];
    for (let k = 0; k < cards; k++) {
      if (e.pauseDue()) e.continueGuided();
      const r = e.roll(); if (!r || r.transition) continue;
      const c = CARD[r.cardId]; s.n++;
      inc(s.inten, c.intraLevelIntensity || 'MID'); inc(s.fam, FAMILIES[c.family] || c.family); inc(s.purpose, r.purpose); inc(s.type, c.interactionType); inc(s.region, r.region); if (c.similarityGroup) inc(s.group, c.similarityGroup); inc(s.cards, r.cardId);
      const t = cardTraits(c); if (t.proximity >= 0.6) s.proximity++; if (t.calm >= 0.5) s.calmCards++; if (t.exploration >= 0.5) s.explore++;
      const iv = INT[c.intraLevelIntensity] ?? 0; ints.push(iv); s.intensity.push(iv); s.halves[k < cards / 2 ? 0 : 1].push(iv);
      if (c.intraLevelIntensity === 'HIGH' && firstHigh == null) firstHigh = k + 1;
      if (ids.slice(-5).includes(r.cardId)) s.repeats++; ids.push(r.cardId); fams.add(c.family); regs.add(r.region); for (const p of r.parts) tg.add(p);
      const w = e.lastDebug && e.lastDebug.candidates.find(x => x.id === r.cardId); if (w && w.factors && w.factors.mood != null) s.moodFactor.push(w.factors.mood);
    }
    if (firstHigh != null) s.highIdx.push(firstHigh);
    s.uniqCards.push(new Set(ids).size); s.uniqFam.push(fams.size); s.uniqReg.push(regs.size); s.uniqTargets.push(tg.size);
  }
  s.sessions = sessions;
  return s;
}
export function summary(s) {
  const bt = k => pct(s.type[k] || 0, s.n), bg = k => pct(s.group[k] || 0, s.n);
  return {
    low: pct(s.inten.LOW || 0, s.n), mid: pct(s.inten.MID || 0, s.n), high: pct(s.inten.HIGH || 0, s.n), meanIntensity: f2(avg(s.intensity)),
    proximity: pct(s.proximity, s.n), calm: pct(s.calmCards, s.n), explore: pct(s.explore, s.n),
    b2b: bt('BODY_TO_BODY'), mutual: bt('MUTUAL'), choose: bt('CHOOSE'), guided: bt('GUIDED'), positional: bt('POSITIONAL'), playful: bg('PLAYFUL'),
    uniqCards: f2(avg(s.uniqCards)), uniqFam: f2(avg(s.uniqFam)), uniqReg: f2(avg(s.uniqReg)), uniqTargets: f2(avg(s.uniqTargets)), repeats: f2(s.repeats / s.sessions),
    firstHigh: s.highIdx.length ? f2(avg(s.highIdx)) : '—', sessionsWithHigh: pct(s.highIdx.length, s.sessions), slope: f2(avg(s.halves[1]) - avg(s.halves[0])),
    purposes: Object.entries(s.purpose).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pct(v, s.n)}`).join(' · '),
    families: Object.entries(s.fam).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${pct(v, s.n)}`).join(' · '),
    regions: Object.entries(s.region).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${pct(v, s.n)}`).join(' · '),
    topCards: Object.entries(s.cards).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${pct(v, s.n)}`).join(' · '),
    moodFactor: s.moodFactor.length ? f2(avg(s.moodFactor)) : '—',
  };
}
if (process.argv[1] && process.argv[1].endsWith('moods.js')) {
  const L = [`# Simulación A/B de moods · ${new Date().toISOString().slice(0, 10)}`, '', `${N} sesiones × ${R} cartas por combinación y nivel. Pareja Mike (pene) ↔ Val (vulva + senos); en Intimidad con acceso completo desde el inicio para que la ropa no enmascare el efecto. Mismas semillas en todas las combinaciones: solo cambian los moods.`, '',
    '**Perfiles de intersección** (cercanía · calma · exploración · tolerancia a intensidad · progresión):', ...COMBOS.map(c => { const p = moodProfile(c[0], c[1]); return `- ${name(c)}: ${p.closeness.toFixed(2)} · ${p.calm.toFixed(2)} · ${p.exploration.toFixed(2)} · ${p.intensity.toFixed(2)} · ${p.progression.toFixed(2)}`; })];
  for (const level of [1, 2, 3]) {
    const rows = COMBOS.map(c => [c, summary(runCombo(c, level))]);
    L.push('', `## Nivel ${level} · ${['', 'Conexión', 'Deseo', 'Intimidad'][level]}`, '', '| Moods | LOW | MID | HIGH | Intensidad media (−1…1) | Proximidad | Calma | Exploración | BODY_TO_BODY | MUTUAL | CHOOSE | GUIDED | POSITIONAL | PLAYFUL | Cartas únicas | Familias únicas | Regiones únicas | Targets únicos | Repeticiones (5) | 1.ª HIGH (carta) | Sesiones con HIGH | Pendiente 2.ª mitad − 1.ª | Factor mood medio |', '|' + '---|'.repeat(23));
    for (const [c, s] of rows) L.push(`| ${name(c)} | ${s.low} | ${s.mid} | ${s.high} | ${s.meanIntensity} | ${s.proximity} | ${s.calm} | ${s.explore} | ${s.b2b} | ${s.mutual} | ${s.choose} | ${s.guided} | ${s.positional} | ${s.playful} | ${s.uniqCards} | ${s.uniqFam} | ${s.uniqReg} | ${s.uniqTargets} | ${s.repeats} | ${s.firstHigh} | ${s.sessionsWithHigh} | ${s.slope} | ${s.moodFactor} |`);
    L.push('', '### Propósitos del director', ...rows.map(([c, s]) => `- ${name(c)}: ${s.purposes}`), '', '### Familias (top 8)', ...rows.map(([c, s]) => `- ${name(c)}: ${s.families}`), '', '### Regiones (top 6)', ...rows.map(([c, s]) => `- ${name(c)}: ${s.regions}`), '', '### Cartas más frecuentes (top 6)', ...rows.map(([c, s]) => `- ${name(c)}: ${s.topCards}`));
  }
  const text = L.join('\n'); console.log(text); if (OUT) writeFileSync(OUT, text + '\n');
}
