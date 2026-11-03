/* CAPA DE CONTENIDO · única fuente de verdad del juego. Añadir una carta = añadirla a su fichero de nivel; el selector
   no cambia. Aquí se juntan los mazos, se derivan las etiquetas que la sesión usa («hoy no») y se valida la estructura. */
import { CONNECTION } from './connection.js';
import { DESIRE } from './desire.js';
import { INTIMACY } from './intimacy.js';
import { UNDRESS } from './undress.js';
import { TRANSITIONS } from './transitions.js';
import { BODY_PARTS, ACTOR_TOOLS, MOUTH_TOOLS, GARMENTS, ANATOMY_IDS, BODY_REGIONS } from './body.js';
import { STATUSES, SOURCES, INTERACTION_TYPES, INTENSITIES, SIDES, TIMER_MODES, ORIENTATIONS, DURATIONS, PLAY_CONSTRAINTS, CLOTHING_REQUIREMENTS, FAMILIES, SIMILARITY_GROUPS } from './schema.js';

export const CARDS = [...CONNECTION, ...DESIRE, ...INTIMACY, ...UNDRESS, ...TRANSITIONS];
export const CARD = Object.fromEntries(CARDS.map(c => [c.id, c]));
export const APPROVED = CARDS.filter(c => c.status === 'APPROVED' && !c.transition);
export const byLevel = (level, { approvedOnly = true } = {}) => CARDS.filter(c => c.level === level && !c.transition && (!approvedOnly || c.status === 'APPROVED'));
/* niveles en los que una carta es elegible: el suyo y, si lo declara, los de `levels` (reutilización curada entre niveles) */
export const levelsOf = c => (c.levels && c.levels.length ? c.levels : [c.level]);
export const playableAt = (c, level) => levelsOf(c).includes(level);
export const playableAtLevel = (level, { approvedOnly = true } = {}) => CARDS.filter(c => playableAt(c, level) && !c.transition && (!approvedOnly || c.status === 'APPROVED'));

/* etiquetas derivadas (para «hoy no» y para el depurador): boca · presion · ropa · guia · intimo */
for (const c of CARDS) {
  const tags = new Set(c.tags);
  const tools = [...c.actorRequirements.map(r => r.part), ...(c.variants || []).flatMap(v => (v.actorRequirements || []).map(r => r.part))];
  const parts = [...c.receiverRequirements.map(r => r.part), ...(c.variants || []).flatMap(v => (v.receiverRequirements || []).map(r => r.part))];
  if (tools.some(t => MOUTH_TOOLS.includes(t))) tags.add('boca');
  if (c.interactionType === 'UNDRESS') tags.add('ropa');
  if (c.interactionType === 'GUIDED') tags.add('guia');
  if (parts.some(p => BODY_PARTS[p] && ['vulva', 'pene'].includes(BODY_PARTS[p].anatomy))) tags.add('intimo');
  c.tags = [...tags];
  /* región corporal de la carta: la de su primera parte receptora (las variantes pueden cambiarla: regionOf) */
  c.region = c.interactionType === 'UNDRESS' ? 'FULL_BODY' : (parts.length && BODY_PARTS[parts[0]] ? BODY_PARTS[parts[0]].region : 'FULL_BODY');
  /* variantes heredan lo que no redefinen */
  if (c.variants) for (const v of c.variants) { v.status ||= 'APPROVED'; v.weight ??= 1; v.actorRequirements ||= null; v.receiverRequirements ||= null; }
}

/* ---------- validación estructural: una carta mal formada no llega al motor ---------- */
export function validateContent(cards = CARDS) {
  const errors = [], ids = new Set();
  const hasCopy = (o, sides) => sides ? !!o.copyBySide && sides.every(s => Array.isArray(o.copyBySide[s]) && o.copyBySide[s].length) : Array.isArray(o.copy) && o.copy.length > 0;
  for (const c of cards) {
    const e = m => errors.push(`${c.id}: ${m}`);
    if (!c.id) errors.push('carta sin id'); if (ids.has(c.id)) e('id repetido'); ids.add(c.id);
    if (![1, 2, 3].includes(c.level)) e(`nivel inválido ${c.level}`);
    if (c.levels != null && (!Array.isArray(c.levels) || !c.levels.length || !c.levels.includes(c.level) || c.levels.some(l => ![1, 2, 3].includes(l)))) e('levels: lista de niveles válidos que incluye el propio');
    if (!FAMILIES[c.family]) e(`familia desconocida ${c.family}`);
    if (!STATUSES.includes(c.status)) e(`status inválido ${c.status}`);
    if (!SOURCES.includes(c.source)) e(`source inválido ${c.source}`);
    if (c.similarityGroup && !SIMILARITY_GROUPS.includes(c.similarityGroup)) e(`similarityGroup inválido ${c.similarityGroup}`);
    if (c.level === 1 && c.status === 'APPROVED' && !c.transition && !c.similarityGroup) e('Conexión: falta similarityGroup');
    if (!INTERACTION_TYPES.includes(c.interactionType)) e(`tipo inválido ${c.interactionType}`);
    if (c.intraLevelIntensity && !INTENSITIES.includes(c.intraLevelIntensity)) e('intraLevelIntensity inválida');
    if (!TIMER_MODES.includes(c.timerMode)) e('timerMode inválido');
    if (c.timerMode !== 'NO_TIMER') { if (!c.durations.length) e('sin duraciones'); for (const d of c.durations) if (!DURATIONS.includes(d)) e(`duración no natural ${d}`); }
    if (c.timerMode === 'FIXED' && c.durations.length !== 1) e('FIXED con varias duraciones');
    for (const r of c.actorRequirements) if (!ACTOR_TOOLS[r.part]) e(`herramienta desconocida ${r.part}`);
    for (const r of c.receiverRequirements) if (!BODY_PARTS[r.part]) e(`parte desconocida ${r.part}`);
    for (const role of ['actor', 'receiver']) for (const q of c.clothing[role]) if (!CLOTHING_REQUIREMENTS.includes(q)) e(`requisito de ropa inválido ${q}`);
    if (c.allowedSides) {
      for (const s of c.allowedSides) if (!SIDES.includes(s)) e(`lado inválido ${s}`);
      const lateralParts = c.receiverRequirements.filter(r => BODY_PARTS[r.part].lateral);
      if (!lateralParts.length && !c.actorRequirements.some(r => ACTOR_TOOLS[r.part].lateral)) e('lados declarados sobre partes sin lado');
    }
    if (c.playConstraints) { for (const p of c.playConstraints) if (!PLAY_CONSTRAINTS.includes(p)) e(`PlayConstraint inválida ${p}`); if (!c.playConstraints.includes('FREE')) e('PlayConstraints sin FREE'); }
    if (c.requiredOrientation && !ORIENTATIONS.includes(c.requiredOrientation)) e('orientación inválida');
    if (c.minIntimacyCards != null && (!Number.isInteger(c.minIntimacyCards) || c.minIntimacyCards < 1 || c.level !== 3)) e('minIntimacyCards solo en Intimidad y entero positivo');
    if (c.interactionType === 'CHOOSE' && !(c.choices && c.choices.length >= 2)) e('CHOOSE sin opciones');
    if (c.interactionType === 'PATH' && !c.path) e('PATH sin trayecto');
    if (c.interactionType === 'UNDRESS') { const u = c.undress; if (!u || !['ACTOR', 'RECEIVER', 'BOTH'].includes(u.who) || !(u.garment === 'ANY' || GARMENTS.includes(u.garment))) e('UNDRESS mal definida'); if (u && u.garment === 'ANY' && !u.chooser) e('UNDRESS ANY sin quien elige'); }
    if ((c.interactionType === 'POSITIONAL' || c.interactionType === 'BODY_TO_BODY') && !c.requiredOrientation) e(`${c.interactionType} sin orientación`);
    /* copia: solo se exige a lo aprobado (lo UNREVIEWED puede estar vacío a propósito) */
    const units = c.variants ? c.variants : [c];
    for (const v of units) {
      if (v !== c) { if (!STATUSES.includes(v.status)) e(`variante ${v.id} status inválido`); if (v.anatomy && !ANATOMY_IDS.includes(v.anatomy)) e(`variante ${v.id} anatomía desconocida`); for (const r of v.receiverRequirements || []) if (!BODY_PARTS[r.part]) e(`variante ${v.id} parte desconocida ${r.part}`); }
      const approved = c.status === 'APPROVED' && v.status === 'APPROVED';
      if (approved && !hasCopy(v, c.allowedSides)) e(`${v === c ? 'carta' : 'variante ' + v.id} aprobada sin copia${c.allowedSides ? ' para todos sus lados' : ''}`);
      const texts = c.allowedSides ? Object.values(v.copyBySide || {}).flat() : (v.copy || []);
      for (const t of texts) { if (/\{(?!R\}|A\})/.test(t)) e(`token desconocido en «${t}»`); if (t.length > 160) e(`copia demasiado larga: «${t.slice(0, 40)}…»`); }
    }
    if (c.variants && c.status === 'APPROVED' && !c.variants.some(v => v.status === 'APPROVED')) e('carta aprobada sin ninguna variante aprobada');
    if (c.level === 2 && (c.clothing.receiver.some(q => q !== 'CLOTHED' && q !== 'ANY') || c.interactionType === 'UNDRESS')) e('Deseo se juega con ropa: la carta exige ropa fuera');
    if (c.level === 1 && c.clothing.receiver.some(q => q !== 'ANY')) e('Conexión no declara ropa');
    if (c.level !== 3 && c.tags.includes('intimo')) e('anatomía íntima fuera de Intimidad');
  }
  return errors;
}
export const TRANSITIONS_BY_LEVEL = Object.fromEntries(TRANSITIONS.map(t => [t.level, t]));
/* región efectiva de una selección (carta + variante) y partes receptoras */
export const partsOf = (card, variant) => ((variant && variant.receiverRequirements) || card.receiverRequirements).map(r => r.part);
export const regionOf = (card, variant) => { if (card.interactionType === 'UNDRESS') return 'FULL_BODY'; const p = partsOf(card, variant)[0]; return p && BODY_PARTS[p] ? BODY_PARTS[p].region : 'FULL_BODY'; };
export { BODY_REGIONS };
