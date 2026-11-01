/* PreferenceManager: lo que los jugadores han activado. */
import { GROUPS } from './catalog.js';

export class PreferenceManager {
  constructor(data = {}) {
    this.names = data.names || ['', ''];
    this.mode = data.mode || 'relajado'; // relajado | sensual | atrevido | progresivo
    this.enabledGroups = data.enabledGroups || Object.keys(GROUPS).filter(g => GROUPS[g].default);
    this.disabledZones = data.disabledZones || [];
    this.disabledActions = data.disabledActions || [];
    this.anatomy = data.anatomy || ['', '']; // por jugador: 'F', 'M', 'FM' o '' (sin especificar: manda solo el interruptor de grupo)
    this.partner = 0; // índice de quien recibe en la ronda que se está generando (lo fija el motor)
  }
  zoneEnabled(z) {
    if (!this.enabledGroups.includes(z.group) || this.disabledZones.includes(z.id)) return false;
    const g = GROUPS[z.group];
    if (g.intimate) { const an = this.anatomy[this.partner] || ''; if (an && !an.includes(g.sex)) return false; }
    return true;
  }
  actionDisabled(a) { return this.disabledActions.includes(a.id); }
  toJSON() { const { names, mode, enabledGroups, disabledZones, disabledActions, anatomy } = this; return { names, mode, enabledGroups, disabledZones, disabledActions, anatomy }; }
}
