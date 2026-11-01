/* HUMAN QUALITY FILTER. Orden de prioridad: ANATOMÍA > SEGURIDAD/COMODIDAD > BIOMECÁNICA > CALIDAD HUMANA > ENCAJE DE
   NIVEL > ENCAJE DE SESIÓN > NOVEDAD > DIVERSIDAD. Primero lo crítico (si falla, el candidato no existe); después una
   puntuación 0–1 para comparar candidatos. La diversidad nunca pasa por encima de la calidad humana. */
import { ACTIONS, TARGETS, ACTOR_TOOLS, STYLES, LEVELS, COMBO, TIER_WEIGHT, combinationIntensity } from './grammar.js';
import { durationValid } from './duration.js';
import { AVOIDS, ruleBlocksAction, ruleBlocksTarget, ruleBlocksPattern } from './session.js';
import { HUMAN_DURATIONS, LONG_DURATION } from './data/durations.js';

export const THRESHOLD = 0.55;
export const HUMAN_MIN = 0.6; // por debajo, la frase se recompone o se rechaza
const near = (v, t, k = 1) => Math.exp(-k * Math.abs(v - t));

/* cand: {action, tool, target, style, duration, pattern, level, intensity, text, humanLikeness} · ctx: {prefs, level, session} */
export function criticalCheck(cand, ctx) {
  const reasons = [];
  if (ctx.session && ctx.session.ended) reasons.push('SESSION_ENDED');
  const a = ACTIONS[cand.action], z = TARGETS[cand.target], t = ACTOR_TOOLS[cand.tool];
  if (!a || !z || !t) return { ok: false, reasons: ['UNKNOWN_ELEMENT'] };
  const c = COMBO[`${cand.action}|${cand.tool}|${cand.target}`];
  // 1. anatomía
  if (!ctx.prefs.targetEnabled(z)) reasons.push('ANATOMY_INCOMPATIBLE');
  if (z.tags.includes('intimo') && ctx.level < 4) reasons.push('INTIMATE_OUTSIDE_L4');
  // 2. seguridad / comodidad: «hoy no» de la sesión
  const av = ctx.session ? ctx.session.avoidSet() : new Set();
  for (const k of av) { const r = AVOIDS[k]; if (r && (ruleBlocksAction(r, a) || ruleBlocksTarget(r, z) || ruleBlocksPattern(r, cand.pattern))) reasons.push('AVOID_TODAY'); }
  if (ctx.prefs.actionDisabled(a)) reasons.push('ACTION_DISABLED');
  // 3. compatibilidad explícita (lista blanca) y biomecánica
  if (!c) reasons.push('TARGET_INCOMPATIBLE');
  else {
    if (!c.mechanics.ok) reasons.push(c.mechanics.code);
    if (!c.levels.includes(ctx.level)) reasons.push('LEVEL_OUT_OF_BAND');
    if (cand.style && !c.styles.includes(cand.style)) reasons.push('STYLE_INCOMPATIBLE');
    if (cand.pattern === 'GUIDED' && !c.guidable) reasons.push('GUIDED_NOT_SUPPORTED');
  }
  if (!a.allowedActorTools.includes(cand.tool)) reasons.push('ACTION_BODY_PART_INCOMPATIBLE');
  if (cand.style && !STYLES[cand.style]) reasons.push('STYLE_INCOMPATIBLE');
  // 4. duración humana dentro del rango derivado
  if (cand.duration != null && (![...HUMAN_DURATIONS, LONG_DURATION].includes(cand.duration) || !durationValid(cand.action, cand.target, cand.style || null, ctx.level, cand.duration))) reasons.push('DURATION_OUT_OF_RANGE');
  // 5. nivel: la intensidad de la combinación cae dentro del nivel
  if (cand.intensity != null) { const L = LEVELS[ctx.level]; if (cand.intensity > L.max + 1e-9 || cand.intensity < L.lo) reasons.push('LEVEL_OUT_OF_BAND'); }
  // 6. calidad humana del texto
  if (cand.text == null) reasons.push('UNVERBALIZABLE');
  else if (cand.humanLikeness != null && cand.humanLikeness < HUMAN_MIN) reasons.push('PHRASE_UNNATURAL');
  const uniq = [...new Set(reasons)];
  return { ok: !uniq.length, reasons: uniq, mechanics: c ? c.mechanics : null };
}

/* Puntuación 0–1. ctx: {history, session, target, purpose, level} */
export function qualityScore(cand, ctx) {
  const a = ACTIONS[cand.action], z = TARGETS[cand.target], c = COMBO[`${cand.action}|${cand.tool}|${cand.target}`];
  const H = ctx.history, S = ctx.session;
  const parts = {};
  parts.humanQuality = cand.humanLikeness ?? 0.8;
  parts.compatibilityTier = c ? Math.min(1, TIER_WEIGHT[c.tier] / TIER_WEIGHT.EXCELLENT + 0.25) : 0;
  parts.bodyNaturalness = c ? c.mechanics.naturalness * (1 - 0.25 * c.mechanics.complexity) : 0;
  parts.levelFit = near(cand.intensity, ctx.target, 0.9);
  // sesión: continuidad según el propósito
  const last = H.last(); let cont = 0.7;
  if (last) {
    const sameFam = last.families && last.families.action === a.semanticFamily, sameZ = last.families && last.families.target === z.family;
    if (ctx.purpose === 'DEEPEN') cont = sameFam || sameZ ? 1 : 0.4;
    else if (ctx.purpose === 'EXPLORE' || ctx.purpose === 'MAINTAIN') cont = sameFam && sameZ ? 0.2 : sameFam || sameZ ? 0.6 : 1;
    else cont = sameFam && sameZ ? 0.35 : 0.8;
  }
  parts.sessionFit = cont;
  let fb = 0.7; if (S) { const f = S.familyScore[a.semanticFamily] || 0, s = S.semanticScore[`${a.semanticFamily}·${z.family}`] || 0; fb = Math.max(0, Math.min(1, 0.7 + 0.1 * f + 0.08 * s)); }
  parts.feedbackFit = fb;
  // novedad: elementos y familia semántica recientes; forma de frase reciente
  const nov = H.novelty('action', a.id, 10, 1) * 0.35 + H.novelty('target', z.id, 10, 1.5) * 0.35 + H.novelty('tool', cand.tool, 8, 0.6) * 0.1 + (cand.style ? H.novelty('style', cand.style, 8, 0.8) : 1) * 0.1 + H.novelty('shapeId', cand.shapeId, 6, 1.2) * 0.1;
  let semRec = 1; H.rounds.slice(0, 8).forEach((r, i) => { if (r.semanticFamily === `${a.semanticFamily}·${z.family}`) semRec *= ctx.purpose === 'DEEPEN' ? 0.85 : (0.35 + 0.06 * i); });
  parts.novelty = Math.max(0, Math.min(1, nov * semRec));
  // diversidad: familias de acción y zona poco usadas
  const cf = H.rounds.filter(r => r.families && r.families.action === a.semanticFamily).length, cz = H.rounds.filter(r => r.families && r.families.target === z.family).length;
  parts.diversity = Math.max(0.2, 1 - 0.07 * cf - 0.06 * cz);
  // placer ≠ intensidad: un estilo o una guía con razón suman un poco, un añadido sin razón no
  parts.composition = (cand.style ? (S && (S.pressure !== 0 || S.pace !== 0) ? 0.95 : 0.85) : 0.9) * (cand.pattern === 'GUIDED' ? 0.95 : 1);
  const W = { humanQuality: 0.22, compatibilityTier: 0.15, bodyNaturalness: 0.08, levelFit: 0.13, sessionFit: 0.1, feedbackFit: 0.07, novelty: 0.12, diversity: 0.07, composition: 0.06 };
  let score = 0; for (const k in W) score += W[k] * parts[k];
  parts.overall = Math.round(score * 1000) / 1000;
  return { score: parts.overall, parts };
}

/* Red de seguridad: interacciones validadas a mano por nivel. Solo si la generación no encuentra nada. */
export const FALLBACKS = {
  1: [{ action: 'MASSAGE', tool: 'bothHands', target: 'shoulders', style: 'SLOW' }, { action: 'CARESS', tool: 'oneHand', target: 'back', style: 'SOFT' }, { action: 'HOLD_HANDS', tool: 'fingers', target: 'hands' }, { action: 'HAIR_PLAY', tool: 'fingers', target: 'hair' }],
  2: [{ action: 'KISS', tool: 'lips', target: 'neck', style: 'SLOW' }, { action: 'BRUSH', tool: 'lips', target: 'shoulders' }, { action: 'HOVER', tool: 'breath', target: 'neck' }, { action: 'BRUSH', tool: 'fingertips', target: 'waist', style: 'SOFT' }],
  3: [{ action: 'LICK', tool: 'tongue', target: 'innerThighs', style: 'SLOW' }, { action: 'LICK', tool: 'tongueTip', target: 'lowerAbdomen' }, { action: 'SQUEEZE', tool: 'oneHand', target: 'buttocks' }, { action: 'KISS', tool: 'lips', target: 'groin' }],
  4: [{ action: 'LICK', tool: 'tongue', target: 'innerThighs', style: 'SLOW' }, { action: 'CARESS', tool: 'oneHand', target: 'vulva', style: 'SOFT' }, { action: 'CARESS', tool: 'oneHand', target: 'penis', style: 'SLOW' }, { action: 'STIMULATE', tool: 'mouth', target: 'clitoris' }, { action: 'SUCK', tool: 'mouth', target: 'glans' }],
};
export function fallbackFor(level, prefs, avoidKey, accept = () => true) {
  for (let L = level; L >= 1; L--) for (const f of FALLBACKS[L]) {
    const c = COMBO[`${f.action}|${f.tool}|${f.target}`]; if (!c || !prefs.targetEnabled(f.target) || prefs.actionDisabled(f.action) || !c.levels.includes(level)) continue;
    if (avoidKey && avoidKey === c.key) continue;
    const cand = { ...f, style: f.style && c.styles.includes(f.style) ? f.style : null, intensity: combinationIntensity(f.action, f.target, f.tool, f.style && c.styles.includes(f.style) ? f.style : null) };
    if (!accept(cand)) continue;
    return cand;
  }
  return { action: 'CARESS', tool: 'oneHand', target: 'hands', style: null, intensity: combinationIntensity('CARESS', 'hands', 'oneHand', null) };
}

/* calidad de una sesión (para pruebas y stress test): repetición, curva de intensidad, cobertura corporal y de familias */
export function sessionQuality(rounds) {
  const n = rounds.length; if (!n) return null;
  const rep = (key, win) => { let k = 0; for (let i = 0; i < n; i++) for (let j = Math.max(0, i - win); j < i; j++) if (rounds[i][key] && rounds[i][key] === rounds[j][key]) { k++; break; } return k / n; };
  const fam = {}, zones = new Set(), fams = new Set(); for (const r of rounds) { fam[r.semanticFamily] = (fam[r.semanticFamily] || 0) + 1; zones.add(r.target); fams.add(r.families.action); }
  let jumps = 0; for (let i = 1; i < n; i++) if (Math.abs(rounds[i].intensity - rounds[i - 1].intensity) > 3) jumps++;
  return { targetRepetition4: rep('target', 4), actionRepetition3: rep('action', 3), toolRepetition2: rep('tool', 2), semanticRepetition3: rep('semanticFamily', 3), shapeRepetition3: rep('shapeId', 3), phraseRepetition: rep('phrase', n), intensityJumps: jumps / Math.max(1, n - 1), bodyCoverage: zones.size, familyCoverage: fams.size, distinctPhrases: new Set(rounds.map(r => r.phrase)).size / n };
}
