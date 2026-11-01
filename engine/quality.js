/* QUALITY FILTER. Primero lo crítico (anatomía, física, semántica, nivel, estado de la sesión): si falla, el
   candidato no existe. Después una puntuación 0–1 con la que el motor compara candidatos y decide si una
   condición o una forma mejoran la frase o la estorban. Nada por debajo del umbral llega a la interfaz. */
import { ACTION, ZONE, METHOD, CONDITION, LEVELS } from './catalog.js';
import { CompatibilityEngine as CE, CombinationValidator } from './compat.js';
import { combinationIntensity } from './intensity.js';
import { mechanicsCheck, mechanicsScores } from './body.js';
import { BLUEPRINT, BLUEPRINTS_OF_ACTION, blueprintAllowsCondition, blueprintFor } from './blueprints.js';

export const THRESHOLD = 0.52;
/* razones de rechazo con código: en desarrollo se ven; en producción solo cuentan */
const CODE_OF = [[/^zona .* no compatible/, 'TARGET_INCOMPATIBLE'], [/desactivada|anatomía/, 'ANATOMY_INCOMPATIBLE'], [/^forma /, 'FORM_INCOMPATIBLE'], [/^condición /, 'CONDITION_INCOMPATIBLE'], [/^redundante/, 'SEMANTIC_REDUNDANCY'], [/^contradicción|duración absurda/, 'SEMANTIC_CONTRADICTION'], [/^intensidad/, 'LEVEL_OUT_OF_BAND'], [/frase|nombre repetido|coletillas|añadidos|decorativa|muy suave/, 'PHRASE_UNNATURAL']];
const code = r => { for (const [re, c] of CODE_OF) if (re.test(r)) return `${c}: ${r}`; return `INVALID: ${r}`; };
const near = (v, t, k = 1) => Math.exp(-k * Math.abs(v - t));
const STOP = new Set(['de', 'la', 'el', 'los', 'las', 'con', 'en', 'a', 'y', 'e', 'que', 'su', 'sus', 'un', 'una', 'tu', 'tus', 'sin', 'al', 'del', 'por', 'se', 'lo', 'le', 'te', 'muy', 'más', 'o']);

/* Comprobaciones críticas. ctx: {prefs, level, session} */
export function criticalCheck(cand, ctx) {
  const reasons = [];
  if (ctx.session && ctx.session.ended) reasons.push('SESSION_ENDED: sesión cerrada: no se dirige nada');
  const a = ACTION[cand.action], z = ZONE[cand.zone];
  if (!a || !z) return { ok: false, reasons: ['elemento desconocido'] };
  const c = cand.cond ? CONDITION[cand.cond] : null;
  const v = CombinationValidator.validate({ ...cand, level: ctx.level, names: ctx.prefs.names }, ctx.prefs);
  if (v.status !== 'VALID') reasons.push(...v.reasons.map(code));
  // anatomía: la frase entera debe ser posible para quien recibe
  if (!ctx.prefs.zoneEnabled(z)) reasons.push('ANATOMY_INCOMPATIBLE: zona fuera de la anatomía o desactivada');
  if (cand.alt && !ctx.prefs.zoneEnabled(ZONE[cand.alt])) reasons.push('ANATOMY_INCOMPATIBLE: zona alternativa imposible');
  // biomecánica: natural, posición sencilla, libertad de movimiento, orientación compatible con la condición
  const mech = mechanicsCheck(a, z, c);
  if (!mech.ok) reasons.push(...mech.reasons.map(r => `${r}: ${a.actor} → ${z.id}`));
  // la condición solo entra por un blueprint que la admita; SETUP nunca por inferencia
  const bp = cand.blueprint ? BLUEPRINT[cand.blueprint] : null;
  if (c) {
    const allowed = bp ? blueprintAllowsCondition(bp, c) : (BLUEPRINTS_OF_ACTION[a.id] || []).some(id => blueprintAllowsCondition(BLUEPRINT[id], c));
    if (!allowed) reasons.push(`${c.tier === 'SETUP' ? 'SETUP_CONDITION_UNSUPPORTED' : 'CONDITION_NOT_IN_BLUEPRINT'}: ${c.id}`);
  }
  if (bp && bp.requires && cand.cond !== bp.requires) reasons.push(`SETUP_CONDITION_UNSUPPORTED: ${bp.id} exige ${bp.requires}`);
  // "hoy no": restricciones de la sesión
  const av = ctx.session ? ctx.session.avoidSet() : new Set();
  if (av.size) {
    const c = cand.cond ? CONDITION[cand.cond] : null;
    for (const k of av) {
      const r = ctx.avoids && ctx.avoids[k]; if (!r) continue;
      if (r.contact && r.contact.includes(a.contactType)) reasons.push(`AVOID_TODAY: hoy no: ${k}`);
      if (r.actionTags && r.actionTags.some(t => a.tags.includes(t))) reasons.push(`AVOID_TODAY: hoy no: ${k}`);
      if (r.families && r.families.includes(a.family)) reasons.push(`AVOID_TODAY: hoy no: ${k}`);
      if (r.condFamilies && c && r.condFamilies.includes(c.family)) reasons.push(`AVOID_TODAY: hoy no: ${k}`);
      if (r.groups && r.groups.includes(z.group)) reasons.push(`AVOID_TODAY: hoy no: ${k}`);
    }
  }
  // nivel: la explicitud no se cuela por debajo
  if (z.tags.includes('intimo') && ctx.level < 4) reasons.push('INTIMATE_OUTSIDE_L4: anatomía íntima fuera de Intimidad');
  const has = p => reasons.some(r => r.startsWith(p));
  const critical = { anatomyValid: !has('ANATOMY') && !has('INTIMATE'), physicallyPossible: !has('TARGET') && !has('ACTION_BODY'), biomechanicsValid: !has('BIOMECHANICS') && !has('POSITION') && !has('ORIENTATION'), movementValid: !has('INSUFFICIENT'), semanticallyValid: !has('SEMANTIC') && !has('PHRASE') && !has('CONDITION') && !has('FORM') && !has('SETUP'), levelValid: !has('LEVEL'), sessionStateValid: !has('SESSION') && !has('AVOID') };
  return { ok: !reasons.length, reasons, critical, mechanics: mech.rel };
}

/* Puntuación. ctx: {history, session, target, purpose, level, phrase, dims, semanticFamily} */
export function qualityScore(cand, ctx) {
  const a = ACTION[cand.action], z = ZONE[cand.zone], m = cand.method ? METHOD[cand.method] : null, c = cand.cond ? CONDITION[cand.cond] : null;
  const H = ctx.history, S = ctx.session, L = LEVELS[ctx.level];
  const parts = {};
  // lenguaje natural: corta, sin palabras repetidas, sin encadenar coletillas
  const words = ctx.phrase.toLowerCase().replace(/[.,:;]/g, '').split(/\s+/);
  const n = words.length;
  let nl = n <= 12 ? 1 : n <= 18 ? 0.9 : n <= 24 ? 0.7 : n <= 30 ? 0.45 : 0.2;
  const seen = {}; let rep = 0; for (const w of words) { if (STOP.has(w) || w.length < 4) continue; if (seen[w]) rep++; seen[w] = 1; }
  nl -= 0.18 * rep;
  if (m && c) nl -= 0.08;
  parts.naturalLanguage = Math.max(0, nl);
  // novedad: elementos y familia semántica recientes
  const nov = H.novelty('action', a.id, 10, 1) * 0.4 + H.novelty('zone', z.id, 10, 1.5) * 0.4 + (m ? H.novelty('method', m.id, 8, 1) : 1) * 0.1 + (c ? H.novelty('cond', c.id, 10, 2) : 1) * 0.1;
  let semRec = 1; H.rounds.slice(0, 8).forEach((r, i) => { if (r.semanticFamily === ctx.semanticFamily) semRec *= ctx.purpose === 'DEEPEN' ? 0.85 : (0.35 + 0.06 * i); });
  parts.novelty = Math.max(0, Math.min(1, nov * semRec));
  // valor de la interacción: contacto real, patrón con sentido para el nivel
  let iv = 0.78;
  if (c && c.role === 'interaccion') iv += 0.1; if (c && c.role === 'atmosfera') iv -= 0.1;
  if (ctx.mechanics && ctx.mechanics.naturalness < 0.8) iv -= 0.15; // MEDIUM solo si el resto lo justifica
  if (ctx.dims.reciprocity >= 7 && ctx.level <= 2) iv += 0.1;
  if (a.contactType === 'ninguno' && ctx.level === 1) iv -= 0.3;
  parts.interactionValue = Math.max(0, Math.min(1, iv));
  // encaje con el objetivo del director
  parts.progressionFit = near(cand.intensity, ctx.target, 0.9);
  // la condición: cuánto aporta a esta acción y zona (sin condición: neutro)
  const req = cand.blueprint && BLUEPRINT[cand.blueprint] && BLUEPRINT[cand.blueprint].requires === (c && c.id);
  parts.conditionValue = !c ? 0.6 : Math.max(0, Math.min(1, (CE.conditionValue(c, a, z) - 0.5) / 0.6)) * (c.tier === 'SETUP' && !req ? 0.85 : 1); // sin condición es un resultado perfectamente bueno; solo una condición que aporta de verdad lo supera
  // la forma: aporta si la acción no lleva ya su manera implícita
  parts.formValue = !m ? 0.72 : a.manner === 'baja' ? 0.45 : m.pos === 'adv' ? 0.85 : 0.8;
  // continuidad: en DEEPEN, mantener familia; en MAINTAIN/EXPLORE, cambiar
  const last = H.last();
  let cont = 0.7;
  if (last) {
    const sameFam = last.families && last.families.action === a.family, sameZ = last.families && last.families.zone === z.family;
    if (ctx.purpose === 'DEEPEN') cont = sameFam || sameZ ? 1 : 0.4;
    else if (ctx.purpose === 'EXPLORE' || ctx.purpose === 'MAINTAIN') cont = sameFam && sameZ ? 0.2 : sameFam || sameZ ? 0.6 : 1;
    else cont = sameFam && sameZ ? 0.35 : 0.8;
  }
  parts.continuity = cont;
  // diversidad de la sesión: familias de acción y zona poco usadas
  const cf = H.rounds.filter(r => r.families && r.families.action === a.family).length, cz = H.rounds.filter(r => r.families && r.families.zone === z.family).length;
  parts.diversity = Math.max(0.2, 1 - 0.07 * cf - 0.06 * cz);
  // feedback de la sesión
  let fb = 0.7;
  if (S) { const f = S.familyScore[a.family] || 0, s = S.semanticScore[ctx.semanticFamily] || 0; fb = Math.max(0, Math.min(1, 0.7 + 0.1 * f + 0.08 * s)); }
  parts.feedbackFit = fb;
  // biomecánica: naturalidad corporal, sencillez de la posición, naturalidad del movimiento
  Object.assign(parts, mechanicsScores(ctx.mechanics || mechanicsCheck(a, z, c).rel));
  const W = { naturalLanguage: 0.15, novelty: 0.12, interactionValue: 0.1, progressionFit: 0.12, conditionValue: 0.08, formValue: 0.05, continuity: 0.08, diversity: 0.07, feedbackFit: 0.07, bodyNaturalness: 0.06, positionSimplicity: 0.05, movementNaturalness: 0.05 };
  let score = 0; for (const k in W) score += W[k] * parts[k];
  if (ctx.level === 1 && cand.intensity > L.max) score = 0;
  parts.overallExperience = Math.round(score * 1000) / 1000;
  return { score: parts.overallExperience, parts };
}

/* Red de seguridad: interacciones validadas a mano por nivel. Solo se usan si la generación no encuentra nada. */
export const FALLBACKS = {
  1: [{ action: 'masajear', zone: 'hombros', method: 'lento' }, { action: 'acariciar', zone: 'espalda', method: 'suave' }, { action: 'entrelazar', zone: 'manos' }, { action: 'peinar', zone: 'cabello' }, { action: 'abrazarDetras', zone: 'espalda' }],
  2: [{ action: 'besar', zone: 'cuello', method: 'lento' }, { action: 'recorrerLabios', zone: 'hombros' }, { action: 'respirarCerca', zone: 'cuello' }, { action: 'besitos', zone: 'abdomen' }, { action: 'rozar', zone: 'cintura', method: 'muySuave' }],
  3: [{ action: 'lamer', zone: 'muslosInt', method: 'lento' }, { action: 'recorrerLengua', zone: 'abdomenBajo' }, { action: 'apretar', zone: 'gluteos' }, { action: 'besar', zone: 'entrepierna' }, { action: 'mordisquear', zone: 'muslosInt' }],
  4: [{ action: 'lamer', zone: 'muslosInt', method: 'lento' }, { action: 'besar', zone: 'entrepierna' }, { action: 'acariciar', zone: 'vulva', method: 'muySuave' }, { action: 'acariciar', zone: 'pene', method: 'lento' }, { action: 'estimularBoca', zone: 'clitoris' }, { action: 'chupar', zone: 'glande' }],
};
export function fallbackFor(level, prefs, avoidId, accept = () => true) {
  const mk = (a, z, m) => ({ action: a.id, zone: z.id, method: m ? m.id : null, cond: null, alt: null, blueprint: (blueprintFor(a.id, z.id) || {}).id || null, intensity: combinationIntensity(a, z, m, null), level, target: 0, fallback: true });
  for (let L = level; L >= 1; L--) for (const f of FALLBACKS[L]) { // de más a menos nivel; nunca repite la última idea
    const a = ACTION[f.action], z = ZONE[f.zone], m = f.method ? METHOD[f.method] : null;
    if (!a || !z || !prefs.zoneEnabled(z) || prefs.actionDisabled(a)) continue;
    if (avoidId && avoidId === a.id + ':' + z.id) continue;
    const c = mk(a, z, m); if (!accept(c)) continue;
    return c;
  }
  // último recurso: contacto de manos, siempre posible
  return mk(ACTION.acariciar, ZONE.manos, null);
}
