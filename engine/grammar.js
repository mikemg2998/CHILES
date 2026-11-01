/* INTERACTION GRAMMAR. Compila los datos editables (targets, actorTools, actions, styles, repertorio por zona, blueprints
   posicionales) en el espacio de combinaciones elegibles y los valida estructuralmente. Es la ÚNICA puerta por la que una
   combinación llega al generador: si no hay una relación explícita y aprobada (EXCELLENT / GOOD / VALID) entre ACCIÓN,
   HERRAMIENTA, ZONA, ESTILO, DURACIÓN y NIVEL, no existe. REJECTED y UNREVIEWED no existen para el generador.
   Las interacciones cuerpo con cuerpo solo existen como blueprints posicionales APPROVED (nunca por producto cartesiano). */
import { TARGETS, TARGETS_LIST, LEGACY_TARGET, targetHeight, targetSide, GROUPS } from './data/targets.js';
import { ACTOR_TOOLS, KIND_CAPABILITIES } from './data/actorTools.js';
import { ACTIONS, ACTIONS_LIST } from './data/actions.js';
import { STYLES, STYLE_IDS } from './data/styles.js';
import { REPERTOIRE, GUIDABLE_ACTIONS, STATUS_WEIGHT, APPROVED_STATUSES, ALL_STATUSES } from './data/repertoire.js';
import { POSITIONAL, POSITIONAL_BY_ID, BLUEPRINT_STATUSES, ORIENTATIONS } from './data/positional.js';
import { BASE_RANGE, TARGET_DURATION, HUMAN_DURATIONS } from './data/durations.js';
import { SHAPES } from './data/shapes.js';

/* Tres niveles. La pareja decide cuándo cambiar; el motor solo hace que cada nivel sea excelente.
   Deseo tiene un rango interno (low · mid · high) que nunca se muestra: el director se mueve dentro de él. */
export const LEVELS = {
  1: { id: 1, key: 'conexion', name: 'Conexión', min: 1, lo: 1, max: 3.5, tagline: 'No tenemos que llegar a ningún sitio.' },
  2: { id: 2, key: 'deseo', name: 'Deseo', min: 3.5, lo: 3, max: 8.5, tagline: 'Explorar qué nos apetece.', bands: { low: [3, 5], mid: [5, 6.8], high: [6.8, 8.5] } },
  3: { id: 3, key: 'intimidad', name: 'Intimidad', min: 7, lo: 6.5, max: 10, tagline: 'Nosotros decidimos hasta dónde.' },
};
export const LEVEL_IDS = [1, 2, 3];
/* claves guardadas en el teléfono (incluidas las de versiones anteriores: «exploracion» pasa a Deseo) */
export const LEVEL_BY_KEY = { conexion: 1, deseo: 2, exploracion: 2, intimidad: 3, relajado: 1, sensual: 2, atrevido: 2, progresivo: 1 };
export const LEVEL_KEYS = ['conexion', 'deseo', 'intimidad'];
/* nivel guardado con la numeración anterior (01–04) → numeración actual */
export const migrateLevelId = id => ({ 1: 1, 2: 2, 3: 2, 4: 3 }[Number(id)] || 1);
/* banda interna de Deseo para una intensidad (solo informativa: nunca se muestra como nivel) */
export const desireBand = v => v < LEVELS[2].bands.mid[0] ? 'low' : v < LEVELS[2].bands.high[0] ? 'mid' : 'high';
/* peso de una acción o zona en un nivel. En Deseo el peso puede ser [bajo, alto]: perfil dentro del nivel, interpolado
   según el objetivo de intensidad de la ronda (así una zona que antes era de Exploración sigue pesando poco en un Deseo suave) */
export function levelWeight(weights, level, target, fallback = 1) {
  if (!weights) return fallback;
  const w = weights[level]; if (w == null) return fallback;
  if (!Array.isArray(w)) return w;
  const t = Math.max(0, Math.min(1, ((target ?? 5.5) - 4.5) / 2.5));
  return w[0] * (1 - t) + w[1] * t;
}
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
/* herramientas que son «cuerpo»: nunca entran por el repertorio cartesiano, solo por blueprint posicional */
export const BODY_TOOL_KINDS = ['torso', 'pelvis', 'leg', 'body', 'head', 'arms'];
export const isBodyTool = tool => { const t = ACTOR_TOOLS[tool]; return !!t && (BODY_TOOL_KINDS.includes(t.kind) || tool === 'forehead'); };
export const COMBOS = []; // { key, kind, action, tool, target, status, tier, weight, levels, styles, guidable, intensity, mechanics }
export const COMBO = {};
export const REJECTED_COMBOS = new Set(); // 'ACTION|tool|target' rechazadas con motivo
export const REJECTED_REASON = {};
export const UNREVIEWED_EXPLICIT = new Set(); // parqueadas a mano con status UNREVIEWED
const entries = {}; // action|tool|target → entry
const asEntry = v => typeof v === 'string' ? { status: v } : v;
for (const [tid, rep] of Object.entries(REPERTOIRE)) {
  for (const [at, v] of Object.entries(rep.approvedActions || {})) {
    const [action, tool] = at.split('|'); const k = `${at}|${tid}`; const e = asEntry(v);
    if (entries[k]) { entries[k].dup = true; continue; }
    if (e.status === 'UNREVIEWED') { UNREVIEWED_EXPLICIT.add(k); continue; }
    if (e.status === 'REJECTED') { REJECTED_COMBOS.add(k); REJECTED_REASON[k] = e.notes || 'rechazada'; continue; }
    entries[k] = { action, tool, target: tid, status: e.status, levels: e.levels ? e.levels.slice() : null, styles: e.styles ? e.styles.slice() : null, notes: e.notes || null };
  }
  for (const [at, why] of Object.entries(rep.rejectedActions || {})) { const k = `${at}|${tid}`; REJECTED_COMBOS.add(k); REJECTED_REASON[k] = typeof why === 'string' ? why : (why && why.notes) || 'rechazada'; if (entries[k]) entries[k].conflict = true; }
}
export function pairIntensity(action, target, tool) {
  const a = ACTIONS[action], z = TARGETS[target], t = ACTOR_TOOLS[tool];
  let v = 0.5 * a.intensity + 0.5 * z.sensitivity;
  if (a.contactType === 'ninguno') v = Math.min(v, 0.5 * a.intensity + 0.5 * Math.min(z.sensitivity, 7.5));
  if (t && (t.kind === 'mouth') && a.semanticFamily !== 'beso' && a.semanticFamily !== 'anticipacion') v += 0.3;
  return Math.round(Math.max(a.intensityRange[0], Math.min(a.intensityRange[1], Math.max(1, Math.min(10, v)))) * 10) / 10;
}
export function combinationIntensity(action, target, tool, style) {
  const c = COMBO[`${action}|${tool}|${target}`];
  let v = (c && c.kind === 'POSITIONAL' ? c.intensity : pairIntensity(action, target, tool)) + (style ? STYLES[style].intensityMod : 0);
  return Math.round(Math.max(1, Math.min(10, v)) * 10) / 10;
}
for (const e of Object.values(entries)) {
  const a = ACTIONS[e.action], z = TARGETS[e.target];
  if (!a || !z || !APPROVED_STATUSES.includes(e.status)) continue;
  const levels = (e.levels || a.allowedLevels.filter(L => z.allowedLevels.includes(L))).filter(L => a.allowedLevels.includes(L) && z.allowedLevels.includes(L));
  const styles = (e.styles || a.styles).filter(s => a.styles.includes(s) && z.allowedStyles.includes(s));
  const c = { key: `${e.action}|${e.tool}|${e.target}`, kind: 'CARTESIAN', action: e.action, tool: e.tool, target: e.target, status: e.status, tier: e.status, weight: STATUS_WEIGHT[e.status], levels, styles, guidable: guidable(e.action, e.tool, e.target), intensity: pairIntensity(e.action, e.target, e.tool), mechanics: mechanics(e.action, e.tool, e.target), notes: e.notes, dup: !!e.dup, conflict: !!e.conflict };
  COMBOS.push(c); COMBO[c.key] = c;
}
/* blueprints posicionales APPROVED → combinaciones de tipo POSITIONAL (clave POS:id; nunca la clave cartesiana) */
export const BLUEPRINTS = [];
for (const b of POSITIONAL) {
  if (b.status !== 'APPROVED') continue;
  const a = ACTIONS[b.action]; if (!a) continue;
  const tool = b.actorRequirements[0] && b.actorRequirements[0].part, target = b.receiverRequirements[0] && b.receiverRequirements[0].part;
  const z = TARGETS[target]; if (!z || !ACTOR_TOOLS[tool]) continue;
  const styles = (b.allowedStyles || []).filter(s => a.styles.includes(s) && z.allowedStyles.includes(s));
  const intensity = b.intensity != null ? b.intensity : Math.round(Math.max(a.intensityRange[0], Math.min(a.intensityRange[1], 0.5 * a.intensity + 0.5 * z.sensitivity)) * 10) / 10;
  const c = { key: `POS:${b.id}`, kind: 'POSITIONAL', blueprint: b, action: b.action, tool, target, status: b.tier, tier: b.tier, weight: STATUS_WEIGHT[b.tier] * (b.weight ?? 1), levels: (b.allowedLevels || []).filter(L => a.allowedLevels.includes(L) && z.allowedLevels.includes(L)), styles, guidable: false, intensity, mechanics: { ok: true, code: null, complexity: 0, naturalness: 0.95, orient: b.requiredOrientation, posture: b.requiredOrientation }, notes: b.notes };
  COMBOS.push(c); COMBO[c.key] = c; BLUEPRINTS.push(c);
}
/* ¿puede jugarse este blueprint con quien actúa y quien recibe ahora? (anatomía de los dos, grupos activos) */
export function blueprintAvailable(b, prefs) {
  if (!b || !prefs) return false;
  const actor = 1 - prefs.partner;
  for (const r of b.receiverRequirements || []) { if (TARGETS[r.part] && !prefs.targetEnabled(r.part)) return false; if (r.anatomy && !(prefs.bodyParts[prefs.partner] || []).includes(r.anatomy)) return false; }
  for (const r of b.actorRequirements || []) { const need = r.anatomy || (r.part === 'penis' ? 'pene' : r.part === 'vulva' ? 'vulva' : null); if (need && !(prefs.bodyParts[actor] || []).includes(need)) return false; }
  return true;
}
/* clasificación de una relación acción · herramienta · zona (para Content Lab y auditoría) */
export function statusOf(action, tool, target) {
  const k = `${action}|${tool}|${target}`;
  if (COMBO[k]) return COMBO[k].status;
  if (REJECTED_COMBOS.has(k)) return 'REJECTED';
  return 'UNREVIEWED';
}
/* universo técnico: toda relación acción · herramienta · zona que el modelo podría producir (acción admite herramienta, biomecánica posible) */
export function possibleCombinations() {
  const out = [];
  for (const a of ACTIONS_LIST) for (const tool of a.allowedActorTools) { if (isBodyTool(tool)) continue; for (const z of TARGETS_LIST) { const m = mechanics(a.id, tool, z.id); if (!m.ok) continue; out.push({ action: a.id, tool, target: z.id, status: statusOf(a.id, tool, z.id), mechanics: m }); } }
  return out;
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
    if (!(SHAPES[a.id] && SHAPES[a.id].length) && !POSITIONAL.some(b => b.action === a.id)) errors.push(`acción ${a.id}: sin realizador (shapes) ni blueprint posicional`);
    if (!a.allowedTargets.length) warn.push(`acción ${a.id}: sin combinaciones aprobadas`);
  }
  for (const z of TARGETS_LIST) {
    for (const s of z.allowedStyles) if (!STYLE_IDS.includes(s)) errors.push(`zona ${z.id}: estilo inexistente ${s}`);
    if (!GROUPS[z.group]) errors.push(`zona ${z.id}: grupo inexistente ${z.group}`);
    if (z.anatomy && !['vulva', 'pene'].includes(z.anatomy)) errors.push(`zona ${z.id}: anatomía inexistente`);
    if (z.tags.includes('intimo') && z.allowedLevels.some(L => L < 3)) errors.push(`zona ${z.id}: íntima fuera de Intimidad`);
    if (z.anatomy && !z.tags.includes('intimo')) errors.push(`zona ${z.id}: exige anatomía pero no es íntima`);
  }
  const toolOk = (a, tool) => ACTIONS[a] && ACTIONS[a].allowedActorTools.includes(tool);
  for (const [tid, rep] of Object.entries(REPERTOIRE)) {
    if (!TARGETS[tid]) { errors.push(`repertorio: zona inexistente ${tid}`); continue; }
    for (const s of rep.preferredStyles || []) if (!STYLE_IDS.includes(s)) errors.push(`repertorio ${tid}: estilo preferido inexistente ${s}`);
    for (const [a, r] of Object.entries(rep.durationOverrides || {})) { if (!ACTIONS[a]) errors.push(`repertorio ${tid}: duración para acción inexistente ${a}`); if (!Array.isArray(r) || r[0] > r[1] || r[0] < HUMAN_DURATIONS[0]) errors.push(`repertorio ${tid}: rango de duración inválido en ${a}`); }
    for (const [at, v] of Object.entries(rep.approvedActions || {})) {
      const [a, tool] = at.split('|'); const e = asEntry(v);
      if (!ACTIONS[a]) errors.push(`repertorio ${tid}: acción inexistente ${a}`);
      if (!tools.has(tool)) errors.push(`repertorio ${tid}: herramienta inexistente ${tool}`);
      if (ACTIONS[a] && tools.has(tool) && !toolOk(a, tool)) errors.push(`repertorio ${tid}: ${a} no admite la herramienta ${tool}`);
      if (isBodyTool(tool)) errors.push(`repertorio ${tid}: ${at} es cuerpo con cuerpo y tiene que ser un blueprint posicional, no una entrada cartesiana`);
      if (!ALL_STATUSES.includes(e.status)) errors.push(`repertorio ${tid}: status desconocido en ${at}`);
      if (e.levels) for (const L of e.levels) { if (!LEVELS[L]) errors.push(`repertorio ${tid}: nivel ${L} inexistente en ${at}`); if (TARGETS[tid].tags.includes('intimo') && L < 3) errors.push(`repertorio ${tid}: ${at} íntima en nivel ${L}`); }
      if (e.styles) for (const s of e.styles) if (!STYLE_IDS.includes(s)) errors.push(`repertorio ${tid}: estilo inexistente ${s} en ${at}`);
      if (rep.rejectedActions && rep.rejectedActions[at] && e.status !== 'REJECTED') errors.push(`repertorio ${tid}: ${at} está a la vez en approvedActions y rejectedActions`);
    }
    for (const at of Object.keys(rep.rejectedActions || {})) { const [a, tool] = at.split('|'); if (!ACTIONS[a]) errors.push(`repertorio ${tid}: rechazo de acción inexistente ${a}`); if (!tools.has(tool)) errors.push(`repertorio ${tid}: rechazo con herramienta inexistente ${tool}`); }
  }
  const ids = new Set();
  for (const b of POSITIONAL) {
    const where = `blueprint ${b.id}`;
    if (ids.has(b.id)) errors.push(`${where}: id repetido`); ids.add(b.id);
    if (b.type !== 'POSITIONAL') errors.push(`${where}: type debe ser POSITIONAL`);
    if (!BLUEPRINT_STATUSES.includes(b.status)) errors.push(`${where}: status desconocido ${b.status}`);
    if (!ACTIONS[b.action]) errors.push(`${where}: acción inexistente ${b.action}`);
    if (b.semanticFamily !== 'BODY_TO_BODY') errors.push(`${where}: semanticFamily debe ser BODY_TO_BODY`);
    if (!b.actorRequirements || !b.actorRequirements.length) errors.push(`${where}: sin actorRequirements`);
    if (!b.receiverRequirements || !b.receiverRequirements.length) errors.push(`${where}: sin receiverRequirements`);
    for (const r of b.actorRequirements || []) { if (!ACTOR_TOOLS[r.part]) errors.push(`${where}: parte de quien actúa inexistente ${r.part}`); if (r.anatomy && !['pene', 'vulva'].includes(r.anatomy)) errors.push(`${where}: anatomía inexistente`); }
    for (const r of b.receiverRequirements || []) { if (!TARGETS[r.part]) errors.push(`${where}: zona de quien recibe inexistente ${r.part}`); if (r.anatomy && !['pene', 'vulva'].includes(r.anatomy)) errors.push(`${where}: anatomía inexistente`); }
    if (b.requiredOrientation && !ORIENTATIONS.includes(b.requiredOrientation)) errors.push(`${where}: orientación desconocida`);
    if (!Array.isArray(b.allowedLevels) || !b.allowedLevels.length) errors.push(`${where}: sin niveles`); else for (const L of b.allowedLevels) if (!LEVELS[L]) errors.push(`${where}: nivel ${L} inexistente`);
    const intimateReq = [...(b.actorRequirements || []), ...(b.receiverRequirements || [])].some(r => r.anatomy || (TARGETS[r.part] && TARGETS[r.part].tags.includes('intimo')) || ['penis', 'vulva'].includes(r.part));
    if (intimateReq && (b.allowedLevels || []).some(L => L < 3)) errors.push(`${where}: exige anatomía íntima y sale fuera de Intimidad`);
    for (const s of b.allowedStyles || []) if (!STYLE_IDS.includes(s)) errors.push(`${where}: estilo inexistente ${s}`);
    if (!Array.isArray(b.durationRange) || b.durationRange[0] > b.durationRange[1] || b.durationRange[0] < HUMAN_DURATIONS[0]) errors.push(`${where}: rango de duración inválido`);
    if (b.weight != null && !(b.weight >= 0 && b.weight <= 3)) errors.push(`${where}: weight fuera de 0–3`);
    for (const v of b.copyVariants || []) { if (!/\{P\}|\{T(:\w+)?\}/.test(v)) errors.push(`${where}: la frase «${v}» no nombra a la pareja ni la zona`); if (/\{(?!P\}|T\}|T:poss\}|T:bare\}|T:pron\}|S\}|TOOL!?\})/.test(v)) errors.push(`${where}: token desconocido en «${v}»`); }
    if (b.status === 'APPROVED') {
      if (!(b.copyVariants || []).length) errors.push(`${where}: APPROVED sin copy`);
      if (!APPROVED_STATUSES.includes(b.tier)) errors.push(`${where}: APPROVED sin tier EXCELLENT / GOOD / VALID`);
      for (const r of b.receiverRequirements || []) if (TARGETS[r.part] && TARGETS[r.part].tags.includes('intimo') && !r.anatomy && !TARGETS[r.part].anatomy) errors.push(`${where}: zona íntima sin anatomía declarada`);
    }
  }
  for (const c of COMBOS) {
    if (c.dup) errors.push(`repertorio: ${c.key} declarada dos veces`);
    if (c.conflict) errors.push(`repertorio: ${c.key} aprobada y rechazada a la vez`);
    if (!c.levels.length) errors.push(`combinación ${c.key} sin nivel`);
    if (!c.mechanics.ok) errors.push(`combinación ${c.key} imposible: ${c.mechanics.code}`);
    const a = ACTIONS[c.action];
    if (a.styles.length && !c.styles.length && a.styleRate > 0) warn.push(`combinación ${c.key} sin ningún estilo compatible`);
    if (!realizable(c)) errors.push(`combinación ${c.key} no verbalizable (sin plantilla)`);
    const z = TARGETS[c.target];
    if (z.anatomy && !c.levels.every(L => L === 3)) errors.push(`combinación ${c.key} con anatomía íntima fuera de Intimidad`);
  }
  for (const [k, r] of Object.entries(TARGET_DURATION.override)) { const [a, t] = k.split(':'); if (!ACTIONS[a] || !TARGETS[t]) errors.push(`duración: override para ${k} inexistente`); if (r[0] > r[1] || r[0] < HUMAN_DURATIONS[0]) errors.push(`duración: rango inválido en ${k}`); }
  return { ok: !errors.length, errors, warn };
}
/* ¿hay alguna plantilla que pueda verbalizar esta combinación? */
export function realizable(c) {
  if (c.kind === 'POSITIONAL') return (c.blueprint.copyVariants || []).length > 0;
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
      if (isBodyTool(tool)) continue; // cuerpo con cuerpo: solo blueprints (unreviewedBlueprints)
      if (COMBO[k] || REJECTED_COMBOS.has(k)) continue;
      if (!mechanics(a.id, tool, tid).ok) continue; // lo imposible no se revisa: no es contenido
      const z = TARGETS[tid];
      out.push({ action: a.id, tool, target: tid, levels: a.allowedLevels.filter(L => z.allowedLevels.includes(L)), styles: a.styles.filter(s => z.allowedStyles.includes(s)), duration: BASE_RANGE[a.id], intimate: z.tags.includes('intimo') });
    }
  }
  for (const k of UNREVIEWED_EXPLICIT) { const [action, tool, tid] = k.split('|'); if (!out.some(u => u.action === action && u.tool === tool && u.target === tid)) { const a = ACTIONS[action], z = TARGETS[tid]; if (a && z) out.push({ action, tool, target: tid, levels: a.allowedLevels.filter(L => z.allowedLevels.includes(L)), styles: a.styles.filter(s => z.allowedStyles.includes(s)), duration: BASE_RANGE[action], intimate: z.tags.includes('intimo'), explicit: true }); } }
  return out;
}
/* blueprints posicionales pendientes de decisión humana (nunca entran solos) */
export const unreviewedBlueprints = () => POSITIONAL.filter(b => b.status === 'UNREVIEWED');
export const TIER_WEIGHT = STATUS_WEIGHT; // alias histórico
export { TARGETS, TARGETS_LIST, LEGACY_TARGET, GROUPS, ACTOR_TOOLS, ACTIONS, ACTIONS_LIST, STYLES, STYLE_IDS, REPERTOIRE, POSITIONAL, POSITIONAL_BY_ID, STATUS_WEIGHT, APPROVED_STATUSES, ALL_STATUSES, BLUEPRINT_STATUSES, ORIENTATIONS, GUIDABLE_ACTIONS, BASE_RANGE, KIND_CAPABILITIES, SHAPES };
