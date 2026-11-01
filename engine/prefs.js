/* PreferenceManager: lo que los jugadores han activado. Anatomía ≠ género: cada jugador indica qué partes del cuerpo
   tiene disponibles (bodyParts); el motor solo pregunta «¿puede recibir esta zona quien recibe ahora?». */
import { GROUPS, TARGETS } from './data/targets.js';

/* partes íntimas que una zona puede requerir; el resto del cuerpo se da por disponible para todos */
export const BODY_PARTS = { vulva: { label: 'Vulva', group: 'intimaF' }, pene: { label: 'Pene', group: 'intimaM' } };
const fromLegacy = an => an === 'FM' ? ['vulva', 'pene'] : an === 'F' ? ['vulva'] : an === 'M' ? ['pene'] : [];

export class PreferenceManager {
  constructor(data = {}) {
    this.names = data.names || ['', ''];
    this.mode = data.mode || 'conexion';
    this.enabledGroups = data.enabledGroups || Object.keys(GROUPS).filter(g => GROUPS[g].default);
    this.disabledZones = data.disabledZones || [];
    this.disabledActions = data.disabledActions || [];
    this.bodyParts = data.bodyParts || (data.anatomy || ['', '']).map(fromLegacy); // por jugador: ['vulva'] | ['pene'] | ambos | [] (sin indicar: no entra anatomía íntima)
    this.partner = 0; // índice de quien recibe en la ronda que se está generando (lo fija el motor)
  }
  get anatomy() { return this.bodyParts.map(p => (p.includes('vulva') ? 'F' : '') + (p.includes('pene') ? 'M' : '')); }
  set anatomy(v) { this.bodyParts = (v || ['', '']).map(fromLegacy); }
  /* ¿tiene el jugador la anatomía que exige la zona? (zonas no íntimas: siempre) */
  availableFor(player, target) { const z = typeof target === 'string' ? TARGETS[target] : target; if (!z || !z.anatomy) return true; return (this.bodyParts[player] || []).includes(z.anatomy); }
  targetEnabled(z) {
    if (typeof z === 'string') z = TARGETS[z];
    if (!z || !this.enabledGroups.includes(z.group) || this.disabledZones.includes(z.id)) return false;
    return this.availableFor(this.partner, z);
  }
  zoneEnabled(z) { return this.targetEnabled(z); }
  actionDisabled(a) { return this.disabledActions.includes(typeof a === 'string' ? a : a.id); }
  toJSON() { const { names, mode, enabledGroups, disabledZones, disabledActions, bodyParts } = this; return { names, mode, enabledGroups, disabledZones, disabledActions, bodyParts }; }
}
