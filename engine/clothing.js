/* CLOTHING STATE. PlayerClothingState { top, bottoms, socks, bra, panties, boxers } con ON (puesta) · OFF (quitada) ·
   NONE (hoy no la lleva o no aplica a su configuración). Las prendas son independientes: camiseta ≠ brasier, pantalón ≠
   panties / calzoncillos. PARTE QUE EXISTE ≠ PARTE ACCESIBLE: una parte está a piel cuando todas las prendas que la tapan
   están OFF o NONE. El estado es real (lo declara la pareja o lo actualiza una carta UNDRESS), nunca un desbloqueo. */
import { BODY_PARTS, ACTOR_TOOLS, GARMENTS, garmentsFor } from '../content/body.js';

const ALL_ON = () => Object.fromEntries(GARMENTS.map(g => [g, 'ON']));
/* estado inicial (todo puesto) para una anatomía; las prendas que no aplican quedan NONE */
export const DEFAULT_CLOTHING = (declared = []) => normalizeClothing(ALL_ON(), declared);
export const fullAccess = (declared = []) => normalizeClothing(Object.fromEntries(GARMENTS.map(g => [g, 'OFF'])), declared);
export function normalizeClothing(s, declared = []) {
  const applicable = garmentsFor(declared), out = {};
  for (const g of GARMENTS) out[g] = !applicable.includes(g) ? 'NONE' : (s && ['ON', 'OFF', 'NONE'].includes(s[g]) ? s[g] : (s && g === 'panties' && s.underwear) || (s && g === 'boxers' && s.underwear) || 'ON'); // `underwear` antiguo → prenda real
  return out;
}
export const applicableGarments = declared => garmentsFor(declared);
const off = (state, g) => g === 'underwear' ? state.panties !== 'ON' && state.boxers !== 'ON' : state[g] !== 'ON';
/* ¿está a piel esta parte (de quien recibe) o esta herramienta (de quien actúa)? */
export const partAccessible = (partId, state) => { const p = BODY_PARTS[partId]; return !!p && p.coveredBy.every(g => off(state, g)); };
export const toolAccessible = (toolId, state) => { const t = ACTOR_TOOLS[toolId]; return !!t && t.coveredBy.every(g => off(state, g)); };
/* ¿puede quitarse esta prenda ahora? Brasier solo con la camiseta fuera; panties / calzoncillos solo con el pantalón fuera. */
export const removable = (state, g) => state[g] === 'ON' && (g === 'bra' ? off(state, 'top') : (g === 'panties' || g === 'boxers') ? off(state, 'bottoms') : true);
export const removableGarments = state => GARMENTS.filter(g => removable(state, g));
export const applyRemoval = (state, g) => (state[g] === 'ON' ? { ...state, [g]: 'OFF' } : { ...state });
/* banda interna informativa (nunca un nivel): I-A vestidos · I-B acceso parcial · I-C acceso completo */
export const band = (a, b) => { const full = s => off(s, 'top') && off(s, 'bottoms') && off(s, 'underwear') && off(s, 'bra'); const partial = s => off(s, 'top') || off(s, 'bottoms'); if (full(a) && full(b)) return 'I-C'; if (partial(a) || partial(b) || off(a, 'underwear') || off(b, 'underwear')) return 'I-B'; return 'I-A'; };

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
