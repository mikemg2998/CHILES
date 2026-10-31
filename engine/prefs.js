/* PreferenceManager: lo que los jugadores han activado. */
import { GROUPS } from './catalog.js';

export class PreferenceManager {
  constructor(data = {}) {
    this.names = data.names || ['', ''];
    this.mode = data.mode || 'sensual';
    this.maxIntensity = data.maxIntensity || 5;
    this.enabledGroups = data.enabledGroups || Object.keys(GROUPS).filter(g => GROUPS[g].default);
    this.disabledZones = data.disabledZones || [];
    this.disabledActions = data.disabledActions || [];
    this.preferredActions = data.preferredActions || [];
    this.preferredCategories = data.preferredCategories || [];
    this.durationPreference = data.durationPreference || 'normal'; // corto | normal | largo
  }
  zoneEnabled(z) { return this.enabledGroups.includes(z.group) && !this.disabledZones.includes(z.id); }
  actionDisabled(a) { return this.disabledActions.includes(a.id); }
  actionPreference(a) {
    let m = 1;
    if (this.preferredActions.includes(a.id)) m *= 1.6;
    if (this.preferredCategories.includes(a.category)) m *= 1.4;
    return m;
  }
  toJSON() {
    const { names, mode, maxIntensity, enabledGroups, disabledZones, disabledActions, preferredActions, preferredCategories, durationPreference } = this;
    return { names, mode, maxIntensity, enabledGroups, disabledZones, disabledActions, preferredActions, preferredCategories, durationPreference };
  }
}
