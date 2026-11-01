/* Serialización de los ficheros de datos curados (repertoire.js y positional.js). La usan Content Lab (lab/) para exportar
   lo editado y las herramientas de tools/. Produce exactamente el formato de engine/data/*.js: nada entra al motor sin pasar
   por el fichero y por node tests/validate.js. */
import { TARGETS_LIST } from './data/targets.js';
import { REVIEWED_AT, GUIDABLE_ACTIONS, STATUS_WEIGHT } from './data/repertoire.js';

const Q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const J = v => JSON.stringify(v).replace(/"/g, "'").replace(/,/g, ', ').replace(/:/g, ': ').replace(/'([A-Za-z_]+)': /g, '$1: ').replace(/\{/g, '{ ').replace(/\}/g, ' }');
const ORDER = ['EXCELLENT', 'GOOD', 'VALID', 'UNREVIEWED', 'REJECTED'];
const asEntry = v => typeof v === 'string' ? { status: v } : { ...v };

/* REPERTOIRE (objeto en memoria, posiblemente editado) → texto de engine/data/repertoire.js */
export function serializeRepertoire(rep, { reviewedAt = new Date().toISOString().slice(0, 10), summary = '' } = {}) {
  let out = `/* REPERTORIO POR ZONA · fuente de verdad de la compatibilidad ACTION × ACTOR TOOL × TARGET.
   Cada zona tiene un repertorio deliberado: alguien revisó cada relación y existe una razón para que salga.
   Pregunta que responde cada entrada: «¿esta acción merece aparecer aquí?» (no «¿es físicamente posible?»).
   status: EXCELLENT (lo que un amante haría sin pensar) · GOOD · VALID (correcta pero menor; pesa poco) · REJECTED (posible,
   pero editorialmente pobre: documentado con motivo, nunca sale) · UNREVIEWED (todo lo que no está aquí: nunca sale).
   Solo EXCELLENT / GOOD / VALID entran al generador. Nada se promociona por inferencia.
   Forma: 'ACTION|tool': 'STATUS' o { status, levels (recorta allowedLevels acción ∩ zona), styles (recorta), notes }.
   preferredStyles: estilos que pesan más cuando hay razón para poner estilo · durationOverrides: ACTION → [min, max] s.
   Las interacciones cuerpo con cuerpo (pecho contra espalda, caderas, frente con frente…) NO están aquí: son blueprints
   posicionales diseñados a mano en positional.js. Edición: a mano o con Content Lab (lab/), que exporta este fichero.
   ${summary || `Última exportación ${reviewedAt}.`} */
export const REVIEWED_AT = ${Q(reviewedAt)};
export const REPERTOIRE = {
`;
  for (const t of TARGETS_LIST) {
    const r = rep[t.id] || { approvedActions: {} };
    const approved = r.approvedActions || {};
    const keys = Object.keys(approved).sort((a, b) => ORDER.indexOf(asEntry(approved[a]).status) - ORDER.indexOf(asEntry(approved[b]).status) || a.localeCompare(b));
    out += `  // ${t.n}${t.anatomy ? ' · anatomía ' + t.anatomy : ''}${t.tags.includes('intimo') ? ' · solo Intimidad' : ''}\n  ${t.id}: {\n`;
    if (r.preferredStyles && r.preferredStyles.length) out += `    preferredStyles: ${J(r.preferredStyles)},\n`;
    if (r.durationOverrides && Object.keys(r.durationOverrides).length) out += `    durationOverrides: ${J(r.durationOverrides)},\n`;
    if (r.notes) out += `    notes: ${Q(r.notes)},\n`;
    out += `    approvedActions: {\n`;
    for (const k of keys) { const e = asEntry(approved[k]); const o = { status: e.status }; if (e.levels && e.levels.length) o.levels = e.levels; if (e.styles) o.styles = e.styles; const notes = e.notes; delete o.notes; out += `      ${Q(k)}: ${Object.keys(o).length === 1 && !notes ? Q(e.status) : J(o).replace(/ \}$/, notes ? `, notes: ${Q(notes)} }` : ' }')},\n`; }
    out += `    },\n`;
    const rej = r.rejectedActions || {};
    if (Object.keys(rej).length) { out += `    rejectedActions: {\n`; for (const k of Object.keys(rej).sort()) out += `      ${Q(k)}: ${Q(typeof rej[k] === 'string' ? rej[k] : (rej[k] && rej[k].notes) || 'rechazada')},\n`; out += `    },\n`; }
    out += `  },\n`;
  }
  out += `};
/* ¿puede guiarse con la mano de quien recibe? Patrón GUIDED: solo acciones de mano que se dejan guiar sin perder sentido. */
export const GUIDABLE_ACTIONS = ${J(GUIDABLE_ACTIONS)};
/* peso de cada clasificación en la elección (REJECTED y UNREVIEWED no existen para el generador) */
export const STATUS_WEIGHT = ${J(STATUS_WEIGHT)};
export const APPROVED_STATUSES = ['EXCELLENT', 'GOOD', 'VALID'];
export const ALL_STATUSES = ['EXCELLENT', 'GOOD', 'VALID', 'REJECTED', 'UNREVIEWED'];
`;
  return out;
}

/* POSITIONAL (lista en memoria, posiblemente editada) → texto de engine/data/positional.js */
export function serializePositional(list, { exportedAt = new Date().toISOString().slice(0, 10) } = {}) {
  const req = rs => `[${(rs || []).map(r => `{ part: ${Q(r.part)}${r.anatomy ? `, anatomy: ${Q(r.anatomy)}` : ''} }`).join(', ')}]`;
  let out = `/* POSITIONAL INTERACTION BLUEPRINTS · interacciones cuerpo con cuerpo cuya calidad depende de una configuración concreta
   de los dos cuerpos (pecho contra espalda, caderas contra glúteos, frente con frente, sentarse sobre los muslos…).
   NUNCA se generan por producto cartesiano acción × herramienta × zona: cada una está diseñada y curada a mano, con su
   copy propio. Si una interacción necesita que dos partes del cuerpo estén colocadas de forma específica, tiene que ser
   un blueprint aprobado; si no está aquí, no existe.
   Modelo PositionalInteractionBlueprint:
     id · status APPROVED | UNREVIEWED | REJECTED (solo APPROVED entra al generador) · type 'POSITIONAL'
     action: acción del dado y familia de la acción (BODY_CONTACT · HUG · RUB) · semanticFamily: BODY_TO_BODY
     actorRequirements: BodyRequirement[] ({ part: id de actorTools, anatomy?: 'pene' | 'vulva' }) — quien actúa
     receiverRequirements: BodyRequirement[] ({ part: id de targets, anatomy?: 'pene' | 'vulva' }) — quien recibe
     requiredOrientation?: FACE | BEHIND | LYING | SEATED | STANDING
     allowedLevels · allowedStyles (∩ estilos de la acción; [] = la frase ya lleva su manera) · durationRange [min, max] s
     copyVariants: frases con tokens {P} pareja · {T} zona («la espalda de Ana» / «su espalda») · {T:poss} · {T:bare} · {S} estilo
     weight: multiplicador de frecuencia (1 = normal) · tier EXCELLENT | GOOD | VALID (calidad editorial) · intensity (1–10, opcional)
     notes: para la revisión humana.
   Edición: a mano o con Content Lab (lab/), que exporta este fichero. Una entrada UNREVIEWED nunca se promociona sola.
   Última exportación ${exportedAt}. */
const B = (o) => Object.assign({ status: 'UNREVIEWED', type: 'POSITIONAL', semanticFamily: 'BODY_TO_BODY', requiredOrientation: null, allowedStyles: [], weight: 1, tier: null, intensity: null, copyVariants: [], notes: null }, o);
export const POSITIONAL = [
`;
  for (const b of list) {
    out += `  B({ id: ${Q(b.id)}, status: ${Q(b.status)}, action: ${Q(b.action)}, tier: ${b.tier ? Q(b.tier) : 'null'},\n`;
    out += `    actorRequirements: ${req(b.actorRequirements)}, receiverRequirements: ${req(b.receiverRequirements)}, requiredOrientation: ${b.requiredOrientation ? Q(b.requiredOrientation) : 'null'}, allowedLevels: ${J(b.allowedLevels || [])}${b.allowedStyles && b.allowedStyles.length ? `, allowedStyles: ${J(b.allowedStyles)}` : ''}, durationRange: ${J(b.durationRange || [20, 60])}${b.weight != null && b.weight !== 1 ? `, weight: ${b.weight}` : ''}${b.intensity != null ? `, intensity: ${b.intensity}` : ''},\n`;
    out += `    copyVariants: [${(b.copyVariants || []).map(Q).join(', ')}]${b.notes ? `,\n    notes: ${Q(b.notes)}` : ''} }),${(b.copyVariants || []).length ? '' : ' // SIN COPY: redactar antes de aprobar'}\n`;
  }
  out += `];
export const POSITIONAL_BY_ID = Object.fromEntries(POSITIONAL.map(b => [b.id, b]));
export const BLUEPRINT_STATUSES = ['APPROVED', 'UNREVIEWED', 'REJECTED'];
export const ORIENTATIONS = ['FACE', 'BEHIND', 'LYING', 'SEATED', 'STANDING'];
`;
  return out;
}
