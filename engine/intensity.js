/* Cálculo de intensidad + IntensityDirector (el ritmo emocional de la partida). */
import { MODES } from './catalog.js';

export function computeIntensity(action, zone, style, cond) {
  const a = action.baseIntensity, z = zone.baseIntensity;
  // la zona y la acción se mezclan sin que una domine; acciones sin contacto no suben por la zona
  let base = 0.55 * Math.max(a, z) + 0.45 * Math.min(a, z);
  if (action.tags.includes('sinContacto')) base = Math.min(base, Math.max(a, 3));
  if (zone.intimacy === 4) base = Math.max(base, 4);
  let v = base + (style ? style.intensityMod : 0) + (cond ? cond.intensityMod : 0);
  v = Math.max(1, Math.min(5, Math.round(v)));
  if (action.tags.includes('sinContacto')) v = Math.min(v, 4); // sin contacto nunca es "muy intenso"
  return v;
}
export function estimateIntensity(action, zone) { return computeIntensity(action, zone, null, null); }

export class IntensityDirector {
  constructor(rng) { this.rng = rng; this.cool = 0; this.lastTarget = null; }
  ceiling(prefs) {
    let c = Math.min(MODES[prefs.mode].ceiling, prefs.maxIntensity || 5);
    // sin anatomía íntima activada no hay rondas de nivel 5
    if (c === 5 && !prefs.enabledGroups.some(g => g === 'intimaF' || g === 'intimaM')) c = 4;
    return c;
  }
  /* "Bajar intensidad": aplica un techo temporal durante unas rondas. */
  lower(history) {
    const last = history.recentIntensity[0] || 2;
    this.cool = 3; this.coolCap = Math.max(1, last - 1);
  }
  nextTarget(prefs, history) {
    const mode = MODES[prefs.mode];
    let ceiling = this.ceiling(prefs);
    if (this.cool > 0) { ceiling = Math.min(ceiling, this.coolCap); this.cool--; }
    const w = {};
    for (let l = 1; l <= ceiling; l++) w[l] = (mode.base[l] || 0.05);
    const rec = history.recentIntensity; // más reciente primero
    const last = rec[0];
    if (last != null) {
      // tras un pico, es probable un descanso
      if (last >= ceiling) { for (let l = 1; l <= ceiling; l++) w[l] *= l <= last - 2 ? 2.6 : l === last ? 0.3 : l === last - 1 ? 1.1 : 1; }
      else if (last === ceiling - 1 && ceiling > 2) { for (let l = 1; l <= ceiling; l++) w[l] *= l <= last - 1 ? 1.5 : 1; }
      // varias rondas tranquilas → sube la probabilidad de subir
      let calm = 0; for (const v of rec) { if (v <= Math.max(2, ceiling - 2)) calm++; else break; }
      if (calm >= 2) { for (let l = 1; l <= ceiling; l++) if (l >= Math.min(ceiling, last + 2)) w[l] *= 1 + 0.6 * calm; }
      // evitar tres rondas iguales seguidas
      if (rec.length >= 2 && rec[0] === rec[1]) w[last] *= 0.35;
      // saltos muy bruscos hacia arriba son raros (anticipación antes del pico)
      for (let l = last + 3; l <= ceiling; l++) w[l] *= 0.45;
    }
    const items = Object.keys(w).map(l => ({ item: Number(l), weight: w[l] }));
    const t = this.rng.weighted(items);
    this.lastTarget = t;
    return t;
  }
}
