/* INTERACTION GRAMMAR. Compila los datos editables (targets, actorTools, actions, styles, compatibility) en el espacio de
   combinaciones elegibles y los valida estructuralmente. Es la ÚNICA puerta por la que una combinación llega al generador:
   si no hay una relación explícita y aprobada entre ACCIÓN, HERRAMIENTA, ZONA, ESTILO, DURACIÓN y NIVEL, no existe. */
import { TARGETS, TARGETS_LIST, LEGACY_TARGET, targetHeight, targetSide, GROUPS } from './data/targets.js';
import { ACTOR_TOOLS, KIND_CAPABILITIES } from './data/actorTools.js';
import { ACTIONS, ACTIONS_LIST } from './data/actions.js';
import { STYLES, STYLE_IDS } from './data/styles.js';
import { COMPATIBILITY, GUIDABLE_ACTIONS, TIER_WEIGHT } from './data/compatibility.js';
import { BASE_RANGE, TARGET_DURATION, HUMAN_DURATIONS } from './data/durations.js';
import { SHAPES } from './data/shapes.js';

export const LEVELS = {
  1: { id: 1, key: 'conexion', name: 'Conexión', min: 1, lo: 1, max: 3.5, tagline: 'No tenemos que llegar a ningún sitio.' },
  2: { id: 2, key: 'deseo', name: 'Deseo', min: 3.5, lo: 3, max: 6.5, tagline: 'Descubrir qué nos enciende.' },
  3: { id: 3, key: 'exploracion', name: 'Exploración', min: 6, lo: 5.5, max: 8.5, tagline: 'Sin prisa, con las manos y la boca.' },
  4: { id: 4, key: 'intimidad', name: 'Intimidad', min: 7, lo: 6.5, max: 10, tagline: 'Elegimos juntos hasta dónde queremos llegar.' },
};
export const LEVEL_BY_KEY = { conexion: 1, deseo: 2, exploracion: 3, intimidad: 4, relajado: 1, sensual: 2, atrevido: 3, progresivo: 1 };
export const LEVEL_KEYS = ['conexion', 'deseo', 'exploracion', 'intimidad'];
export const PATTERNS = { GIVE: 'Dar', MUTUAL: 'A la vez', DISCOVER: 'Descubrir', GUIDED: 'Guiado por la pareja' };
export const INTENSITY_LABEL = v => v < 2.5 ? 'Relajante' : v < 3.5 ? 'Cariñoso' : v < 5 ? 'Cercano' : v < 6.5 ? 'Sensual' : v < 8 ? 'Provocador' : 'Muy intenso';

/* ---------- biomecánica mínima: ¿llega la herramienta a la zona en una postura sencilla? ---------- */
const ORIENT_CONFLICT = { BEHIND: ['FACE', 'SEATED'], FACE: ['BEHIND'], LYING: ['STANDING', 'SEATED'], STANDING: ['LYING', 'SEATED'], SEATED: ['LYING', 'STANDING', 'BEHIND'] };
export const orientConflict = (a, b) => !!(a && b && a !== b && (ORIENT_CONFLICT[a] || []).includes(b));
export function mechanics(action, tool, target) {
  const t = ACTOR_TOOLS[tool], z = TARGETS[target], a = ACTIONS[action];
  if (!t || !z || !a) return { ok: false, code: 'UNKNOWN', complexity: 3, naturalness: 0 };
  if (!t.movements.includes(a.movementType)) return { ok: false, code: 'ACTION_BODY_PART_INCOMPATIBLE', complexity: 3, naturalness: 0 };
  const h = targetHeight(z), side = targetSide(z);
  let complexity = 0, naturalness = 1, orient = side === 'detras' ? 'BEHIND' : null;
  if (t.kind === 'mouth' || t.kind === 'face') { complexity = h === 'alta' ? 0 : h === 'suelo' || z.id === 'poplitealArea' ? 2 : 1; naturalness = h === 'alta' ? 1 : h === 'media' ? 0.95 : h === 'baja' ? 0.85 : 0.5; if (t.kind === 'face' && z.tags.includes('intimo')) return { ok: false, code: 'BIOMECHANICS_UNNATURAL', complexity: 3, naturalness: 0 }; }
  else if (t.kind !== 'hand' && t.kind !== 'voice') { complexity = 1; naturalness = 0.9; }
  const posture = a.biomechanicalRules && a.biomechanicalRules.posture ? (a.biomechanicalRules.posture[tool] || a.biomechanicalRules.posture.any || null) : null;
  if (posture) { complexity = Math.max(0, complexity - 1); orient = orient || posture; }
  if (complexity >= 2) return { ok: false, code: 'POSITION_TOO_COMPLEX', complexity, naturalness, orient };
  if (naturalness < 0.6) return { ok: false, code: 'BIOMECHANICS_UNNATURAL', complexity, naturalness, orient };
  return { ok: true, code: null, complexity, naturalness, orient, posture };
}
/* GUIDED: quien recibe guía con su mano la de quien actúa. Solo acciones de mano, zonas al alcance de la mano de quien
   recibe (frontales o laterales, no la espalda ni la nuca) y nunca sobre sus propias manos (sería redundante). */
export function guidable(action, tool, target) {
  const a = ACTIONS[action], t = ACTOR_TOOLS[tool], z = TARGETS[target];
  if (!a || !t || !z || !GUIDABLE_ACTIONS.includes(action) || t.kind !== 'hand') return false;
  if (!z.tags.includes('frontal') || z.family === 'brazos') return false;
  return true;
}

/* ---------- compilación ---------- */
const tierOf = v => typeof v === 'string' ? v : v.tier;
export const COMBOS = []; // { key, action, tool, target, tier, weight, levels, styles, guidable, intensity }
export const COMBO = {};
const entries = {}; // action|tool|target → merged entry (INVALID gana)
for (const e of COMPATIBILITY) {
  if (e.status !== 'APPROVED') continue;
  for (const [tid, v] of Object.entries(e.targets)) {
    const k = `${e.action}|${e.tool}|${tid}`;
    const cur = entries[k];
    const tier = tierOf(v);
    if (cur && (cur.tier === 'INVALID' || tier !== 'INVALID')) { if (cur.tier !== 'INVALID' && tier !== 'INVALID') cur.dup = true; continue; }
    entries[k] = { action: e.action, tool: e.tool, target: tid, tier, levels: typeof v === 'object' && v.levels ? v.levels.slice() : null, styles: typeof v === 'object' && v.styles ? v.styles.slice() : null, notes: typeof v === 'object' ? v.notes : null };
  }
}
export const INVALID_COMBOS = new Set();
export function pairIntensity(action, target, tool) {
  const a = ACTIONS[action], z = TARGETS[target], t = ACTOR_TOOLS[tool];
  let v = 0.5 * a.intensity + 0.5 * z.sensitivity;
  if (a.contactType === 'ninguno') v = Math.min(v, 0.5 * a.intensity + 0.5 * Math.min(z.sensitivity, 7.5));
  if (t && (t.kind === 'mouth') && a.semanticFamily !== 'beso' && a.semanticFamily !== 'anticipacion') v += 0.3;
  return Math.round(Math.max(a.intensityRange[0], Math.min(a.intensityRange[1], Math.max(1, Math.min(10, v)))) * 10) / 10;
}
export function combinationIntensity(action, target, tool, style) {
  let v = pairIntensity(action, target, tool) + (style ? STYLES[style].intensityMod : 0);
  return Math.round(Math.max(1, Math.min(10, v)) * 10) / 10;
}
for (const e of Object.values(entries)) {
  const a = ACTIONS[e.action], z = TARGETS[e.target];
  if (e.tier === 'INVALID') { INVALID_COMBOS.add(`${e.action}|${e.tool}|${e.target}`); continue; }
  if (!a || !z) continue;
  const levels = (e.levels || a.allowedLevels.filter(L => z.allowedLevels.includes(L))).filter(L => a.allowedLevels.includes(L) && z.allowedLevels.includes(L));
  const styles = (e.styles || a.styles).filter(s => a.styles.includes(s) && z.allowedStyles.includes(s));
  const c = { key: `${e.action}|${e.tool}|${e.target}`, action: e.action, tool: e.tool, target: e.target, tier: e.tier, weight: TIER_WEIGHT[e.tier], levels, styles, guidable: guidable(e.action, e.tool, e.target), intensity: pairIntensity(e.action, e.target, e.tool), mechanics: mechanics(e.action, e.tool, e.target), notes: e.notes, dup: !!e.dup };
  COMBOS.push(c); COMBO[c.key] = c;
}
/* allowedTargets / allowedActions / allowedActorTools derivados (una sola fuente de verdad) */
for (const a of ACTIONS_LIST) { a.allowedTargets = [...new Set(COMBOS.filter(c => c.action === a.id).map(c => c.target))]; }
for (const t of TARGETS_LIST) { t.allowedActions = [...new Set(COMBOS.filter(c => c.target === t.id).map(c => c.action))]; t.allowedActorTools = [...new Set(COMBOS.filter(c => c.target === t.id).map(c => c.tool))]; }
export const combosForLevel = L => COMBOS.filter(c => c.levels.includes(L));

/* ---------- validación estructural: cualquier error aquí hace fallar los tests ---------- */
export function validateData() {
  const errors = [], warn = [];
  const tools = new Set(Object.keys(ACTOR_TOOLS));
  for (const a of ACTIONS_LIST) {
    for (const t of a.allowedActorTools) if (!tools.has(t)) errors.push(`acción ${a.id}: herramienta inexistente ${t}`);
    for (const s of a.styles) if (!STYLE_IDS.includes(s)) errors.push(`acción ${a.id}: estilo inexistente ${s}`);
    if (!BASE_RANGE[a.id]) errors.push(`acción ${a.id}: sin rango base de duración`);
    else if (BASE_RANGE[a.id][0] > BASE_RANGE[a.id][1] || BASE_RANGE[a.id][0] < 15) errors.push(`acción ${a.id}: rango de duración vacío o fuera de rango`);
    for (const t of a.implicitTools) if (!a.allowedActorTools.includes(t)) errors.push(`acción ${a.id}: implicitTool ${t} no está en allowedActorTools`);
    if (!SHAPES[a.id] || !SHAPES[a.id].length) errors.push(`acción ${a.id}: sin realizador (shapes)`);
    if (!a.allowedTargets.length) warn.push(`acción ${a.id}: sin combinaciones aprobadas`);
  }
  for (const z of TARGETS_LIST) {
    for (const s of z.allowedStyles) if (!STYLE_IDS.includes(s)) errors.push(`zona ${z.id}: estilo inexistente ${s}`);
    if (!GROUPS[z.group]) errors.push(`zona ${z.id}: grupo inexistente ${z.group}`);
    if (z.anatomy && !['vulva', 'pene'].includes(z.anatomy)) errors.push(`zona ${z.id}: anatomía inexistente`);
    if (z.tags.includes('intimo') && z.allowedLevels.some(L => L < 4)) errors.push(`zona ${z.id}: íntima fuera de Intimidad`);
    if (z.anatomy && !z.tags.includes('intimo')) errors.push(`zona ${z.id}: exige anatomía pero no es íntima`);
  }
  for (const e of COMPATIBILITY) {
    if (!ACTIONS[e.action]) errors.push(`matriz: acción inexistente ${e.action}`);
    if (!tools.has(e.tool)) errors.push(`matriz: herramienta inexistente ${e.tool}`);
    if (ACTIONS[e.action] && !ACTIONS[e.action].allowedActorTools.includes(e.tool)) errors.push(`matriz: ${e.action} no admite la herramienta ${e.tool}`);
    for (const [tid, v] of Object.entries(e.targets)) {
      if (!TARGETS[tid]) { errors.push(`matriz: zona inexistente ${tid} en ${e.action}·${e.tool}`); continue; }
      if (!TIER_WEIGHT.hasOwnProperty(tierOf(v))) errors.push(`matriz: tier desconocido en ${e.action}·${e.tool}·${tid}`);
      if (typeof v === 'object' && v.levels) for (const L of v.levels) { if (!LEVELS[L]) errors.push(`matriz: nivel ${L} inexistente en ${e.action}·${e.tool}·${tid}`); if (TARGETS[tid].tags.includes('intimo') && L < 4) errors.push(`matriz: ${e.action}·${e.tool}·${tid} íntima en nivel ${L}`); }
      if (typeof v === 'object' && v.styles) for (const s of v.styles) if (!STYLE_IDS.includes(s)) errors.push(`matriz: estilo inexistente ${s} en ${e.action}·${e.tool}·${tid}`);
    }
  }
  for (const c of COMBOS) {
    if (c.dup) errors.push(`matriz: ${c.key} declarada dos veces`);
    if (!c.levels.length) errors.push(`combinación ${c.key} sin nivel`);
    if (!c.mechanics.ok) errors.push(`combinación ${c.key} imposible: ${c.mechanics.code}`);
    const a = ACTIONS[c.action];
    if (a.styles.length && !c.styles.length && a.styleRate > 0) warn.push(`combinación ${c.key} sin ningún estilo compatible`);
    if (!realizable(c)) errors.push(`combinación ${c.key} no verbalizable (sin plantilla)`);
    const z = TARGETS[c.target];
    if (z.anatomy && !c.levels.every(L => L === 4)) errors.push(`combinación ${c.key} con anatomía íntima fuera de Intimidad`);
  }
  for (const [k, r] of Object.entries(TARGET_DURATION.override)) { const [a, t] = k.split(':'); if (!ACTIONS[a] || !TARGETS[t]) errors.push(`duración: override para ${k} inexistente`); if (r[0] > r[1] || r[0] < HUMAN_DURATIONS[0]) errors.push(`duración: rango inválido en ${k}`); }
  return { ok: !errors.length, errors, warn };
}
/* ¿hay alguna plantilla que pueda verbalizar esta combinación? */
export function realizable(c) {
  const list = SHAPES[c.action] || [];
  return list.some(s => shapeFits(s, c.tool, c.target, null, null));
}
export function shapeFits(s, tool, target, style, level) {
  const z = TARGETS[target];
  if (s.tools && !s.tools.includes(tool)) return false;
  if (s.notTools && s.notTools.includes(tool)) return false;
  if (s.targets && !s.targets.includes(target)) return false;
  if (s.notTargets && s.notTargets.includes(target)) return false;
  if (s.tags && !s.tags.some(t => z.tags.includes(t))) return false;
  if (s.notTags && s.notTags.some(t => z.tags.includes(t))) return false;
  if (s.levels && level && !s.levels.includes(level)) return false;
  if (s.styles && style !== undefined) { if (s.styles === 'none' ? style : !s.styles.includes(style)) return false; }
  return true;
}

/* ---------- cola de revisión: lo que el modelo podría producir y no está aprobado ni rechazado ---------- */
export function unreviewedCombinations() {
  const out = [];
  for (const a of ACTIONS_LIST) {
    const targetsOfAction = new Set(COMBOS.filter(c => c.action === a.id).map(c => c.target));
    const candidateTargets = new Set([...targetsOfAction]);
    // zonas íntimas y herramientas íntimas previstas por el modelo: entran en la cola si hay alguna relación parcial
    if (a.semanticFamily === 'intimo' || ['LICK', 'SUCK', 'KISS', 'CARESS', 'BRUSH', 'RUB'].includes(a.id)) for (const z of TARGETS_LIST) if (z.tags.includes('intimo')) candidateTargets.add(z.id);
    for (const tool of a.allowedActorTools) for (const tid of candidateTargets) {
      const k = `${a.id}|${tool}|${tid}`;
      if (COMBO[k] || INVALID_COMBOS.has(k)) continue;
      if (!mechanics(a.id, tool, tid).ok) continue; // lo imposible no se revisa: no es contenido
      const z = TARGETS[tid];
      out.push({ action: a.id, tool, target: tid, levels: a.allowedLevels.filter(L => z.allowedLevels.includes(L)), styles: a.styles.filter(s => z.allowedStyles.includes(s)), duration: BASE_RANGE[a.id], intimate: z.tags.includes('intimo') });
    }
  }
  return out;
}
export { TARGETS, TARGETS_LIST, LEGACY_TARGET, GROUPS, ACTOR_TOOLS, ACTIONS, ACTIONS_LIST, STYLES, STYLE_IDS, COMPATIBILITY, TIER_WEIGHT, BASE_RANGE, KIND_CAPABILITIES, SHAPES };
