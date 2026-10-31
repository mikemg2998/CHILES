/* PreferenceManager: lo que los jugadores han activado. */
import { GROUPS } from './catalog.js';

export class PreferenceManager {
  constructor(data = {}) {
    this.names = data.names || ['', ''];
    this.mode = data.mode || 'relajado'; // relajado | sensual | atrevido | progresivo
    this.enabledGroups = data.enabledGroups || Object.keys(GROUPS).filter(g => GROUPS[g].default);
    this.disabledZones = data.disabledZones || [];
    this.disabledActions = data.disabledActions || [];
  }
  zoneEnabled(z) { return this.enabledGroups.includes(z.group) && !this.disabledZones.includes(z.id); }
  actionDisabled(a) { return this.disabledActions.includes(a.id); }
  toJSON() { const { names, mode, enabledGroups, disabledZones, disabledActions } = this; return { names, mode, enabledGroups, disabledZones, disabledActions }; }
}
