/* CLOTHING STATE. PlayerClothingState { top, bottoms, socks, bra, panties, boxers } con ON (puesta) · OFF (la llevaba y se la
   quitó) · NOT_WORN (entró sin ella) · NONE (no aplica a su configuración). La ropa no es una serie fija de pasos: define qué
   capa está físicamente disponible AHORA (camiseta → piel, o camiseta → brasier → piel; ambos recorridos valen). Las prendas son independientes: camiseta ≠ brasier, pantalón ≠
   panties / calzoncillos. PARTE QUE EXISTE ≠ PARTE ACCESIBLE: una parte está a piel cuando todas las prendas que la tapan
   están OFF o NONE. El estado es real (lo declara la pareja o lo actualiza una carta UNDRESS), nunca un desbloqueo. */
import { BODY_PARTS, ACTOR_TOOLS, GARMENTS, GARMENT_LAYERS, garmentsFor } from '../content/body.js';
import { throughGarmentOf } from '../content/schema.js';

const ALL_ON = () => Object.fromEntries(GARMENTS.map(g => [g, 'ON']));
/* estado inicial (todo puesto) para una anatomía; las prendas que no aplican quedan NONE */
export const DEFAULT_CLOTHING = (declared = [], underwear = null) => normalizeClothing(ALL_ON(), declared, underwear);
export const fullAccess = (declared = [], underwear = null) => normalizeClothing(Object.fromEntries(GARMENTS.map(g => [g, 'OFF'])), declared, underwear);
export function normalizeClothing(s, declared = [], underwear = null) {
  const applicable = garmentsFor(declared, underwear), out = {};
  for (const g of GARMENTS) out[g] = !applicable.includes(g) ? 'NONE' : (s && ['ON', 'OFF', 'NOT_WORN'].includes(s[g]) ? s[g] : (s && s[g] === 'NONE') ? 'NOT_WORN' : (s && g === 'panties' && s.underwear) || (s && g === 'boxers' && s.underwear) || 'ON'); // `underwear` antiguo → prenda real; NONE sobre una prenda que sí aplica = «no la llevo»
  return out;
}
export const applicableGarments = (declared, underwear = null) => garmentsFor(declared, underwear);
const off = (state, g) => g === 'underwear' ? state.panties !== 'ON' && state.boxers !== 'ON' : state[g] !== 'ON';
/* ¿está a piel esta parte (de quien recibe) o esta herramienta (de quien actúa)? */
export const partAccessible = (partId, state) => { const p = BODY_PARTS[partId]; return !!p && p.coveredBy.every(g => off(state, g)); };
export const toolAccessible = (toolId, state) => { const t = ACTOR_TOOLS[toolId]; return !!t && t.coveredBy.every(g => off(state, g)); };
/* ¿puede quitarse esta prenda ahora? Solo si está puesta (nunca NOT_WORN ni NONE). Brasier solo con la camiseta fuera; panties / calzoncillos solo con el pantalón fuera. */
export const removable = (state, g) => state[g] === 'ON' && (!GARMENT_LAYERS[g].under || off(state, GARMENT_LAYERS[g].under));
export const removableGarments = state => GARMENTS.filter(g => removable(state, g));
export const applyRemoval = (state, g) => (state[g] === 'ON' ? { ...state, [g]: 'OFF' } : { ...state });
/* banda interna informativa (nunca un nivel): I-A vestidos · I-B acceso parcial · I-C acceso completo */
export const band = (a, b) => { const full = s => off(s, 'top') && off(s, 'bottoms') && off(s, 'underwear') && off(s, 'bra'); const partial = s => off(s, 'top') || off(s, 'bottoms'); if (full(a) && full(b)) return 'I-C'; if (partial(a) || partial(b) || off(a, 'underwear') || off(b, 'underwear')) return 'I-B'; return 'I-A'; };

/* BODY AVAILABILITY POR CAPAS: para una parte, qué la cubre ahora y con qué prenda concreta. Se calcula desde el estado REAL,
   sin asumir que todas las personas llevan todas las capas (bra NOT_WORN + top OFF = piel).
   { access: 'COVERED_BY_OUTER' | 'THROUGH_UNDERWEAR' | 'DIRECT', by: prenda | null, mode: ACCESS MODE }
   mode = THROUGH_TOP · THROUGH_BRA · THROUGH_PANTIES · THROUGH_BOXERS · THROUGH_BOTTOMS · THROUGH_SOCKS · DIRECT_SKIN_ACCESS */
export const accessModeOf = by => (by ? `THROUGH_${by.toUpperCase()}` : 'DIRECT_SKIN_ACCESS');
export function coverage(partId, state) {
  const p = BODY_PARTS[partId]; if (!p) return { access: 'DIRECT', by: null, mode: 'DIRECT_SKIN_ACCESS' };
  const real = g => (g === 'underwear' ? (state.panties === 'ON' ? 'panties' : state.boxers === 'ON' ? 'boxers' : null) : state[g] === 'ON' ? g : null);
  const on = p.coveredBy.map(real).filter(Boolean);
  const outer = on.find(g => GARMENT_LAYERS[g].layer === 'OUTER'); if (outer) return { access: 'COVERED_BY_OUTER', by: outer, mode: accessModeOf(outer) };
  const under = on.find(g => GARMENT_LAYERS[g].layer === 'UNDERWEAR'); if (under) return { access: 'THROUGH_UNDERWEAR', by: under, mode: accessModeOf(under) };
  return { access: 'DIRECT', by: null, mode: 'DIRECT_SKIN_ACCESS' };
}
export const accessMode = (partId, state) => coverage(partId, state).mode;
/* Acceso al pecho, conceptualmente: la camiseta tapa, el brasier tapa a su manera, o acceso directo. */
export const chestAccess = state => { const c = coverage('nipples', state); return c.access === 'COVERED_BY_OUTER' ? 'COVERED_BY_TOP' : c.access === 'THROUGH_UNDERWEAR' ? 'COVERED_BY_BRA' : 'DIRECT'; };
/* THROUGH_GARMENT: la prenda es ahora la capa más exterior sobre las partes que recibe la carta (camiseta puesta; brasier con la
   camiseta fuera; panties / calzoncillos con el pantalón fuera). Sin partes, se evalúa la prenda sola. */
export const throughGarment = (g, state, parts = []) => (parts.length ? parts.every(p => coverage(p, state).by === g) : state[g] === 'ON' && (!GARMENT_LAYERS[g].under || off(state, GARMENT_LAYERS[g].under)));

/* Requisitos de una carta para un rol, evaluados sobre el estado real. Devuelve null si cumple o el requisito que falla. */
export function clothingFailure(requirements, state, parts, { role } = {}) {
  const accessible = role === 'actor' ? toolAccessible : partAccessible;
  for (const q of requirements) {
    switch (q) {
      case 'ANY': case 'CLOTHED': break;
      case 'THROUGH_CLOTHING': if (parts.some(p => accessible(p, state))) return q; break;
      case 'SKIN_ACCESS': if (!parts.every(p => accessible(p, state))) return q; break;
      case 'TOP_ACCESS': if (!off(state, 'top')) return q; break;
      case 'BOTTOM_ACCESS': if (!off(state, 'bottoms')) return q; break;
      case 'UNDERWEAR_ON': if (off(state, 'underwear') || !off(state, 'bottoms')) return q; break;
      case 'UNDERWEAR_OFF': if (!off(state, 'underwear')) return q; break;
      case 'THROUGH_TOP': case 'THROUGH_BRA': case 'THROUGH_PANTIES': case 'THROUGH_BOXERS': if (!throughGarment(throughGarmentOf(q), state, role === 'actor' ? [] : parts)) return q; break; // esa prenda es la capa exterior ahora: la prenda es el target
      case 'FULL_BODY_ACCESS': if (!(off(state, 'top') && off(state, 'bottoms') && off(state, 'underwear') && off(state, 'bra'))) return q; break;
      default: return q;
    }
  }
  return null;
}
/* ¿es elegible una carta UNDRESS con estos dos estados? */
export function undressPossible(u, actorState, receiverState) {
  const who = u.who === 'BOTH' ? [actorState, receiverState] : [u.who === 'ACTOR' ? actorState : receiverState];
  if (u.garment === 'ANY') return who.every(s => removableGarments(s).length > 0);
  return who.every(s => removable(s, u.garment));
}
