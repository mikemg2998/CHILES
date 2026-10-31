/* Intensidad 1–10 y el director que decide el objetivo de cada ronda. */
import { LEVELS } from './catalog.js';

export function combinationIntensity(action, zone, method, cond) {
  let v = 0.5 * action.intensity + 0.5 * zone.intensity;
  if (action.contactType === 'ninguno') v = Math.min(v, 0.5 * action.intensity + 0.5 * Math.min(zone.intensity, 7.5)); // sin contacto no llega al máximo
  v += (method ? method.mod : 0) + (cond ? cond.mod : 0);
  return Math.round(Math.max(1, Math.min(10, v)) * 10) / 10;
}
export const pairIntensity = (a, z) => combinationIntensity(a, z, null, null);

/* Distribución objetivo de cada nivel: tramos [min,max,probabilidad]. */
export const TARGET_BUCKETS = {
  1: [[1, 3, 0.8], [3, 3.5, 0.2]],
  2: [[3.5, 4.5, 0.2], [4.5, 5.5, 0.6], [5.5, 6.5, 0.2]],
  3: [[5.5, 6.5, 0.15], [6.5, 7.5, 0.3], [7.5, 10, 0.55]],
};

export class IntensityDirector {
  constructor(rng) { this.rng = rng; }
  /* Elige el objetivo de la ronda dentro del nivel, respirando con el historial. */
  nextTarget(level, history) {
    const buckets = TARGET_BUCKETS[level].map(b => ({ lo: b[0], hi: b[1], w: b[2] }));
    const rec = history.recentIntensity;
    if (rec.length) {
      const last = rec[0];
      const idx = buckets.findIndex(b => last >= b.lo && last < b.hi + 1e-9);
      const top = buckets.length - 1;
      if (idx === top) { buckets.forEach((b, i) => { b.w *= i === top ? 0.45 : 1.6; }); } // tras un pico, descanso probable
      let calm = 0; for (const v of rec) { if (v < buckets[top].lo) calm++; else break; }
      if (calm >= 2) buckets[top].w *= 1 + 0.5 * calm; // tras varias tranquilas, sube
      if (rec.length >= 2 && Math.abs(rec[0] - rec[1]) < 0.6) { const i2 = buckets.findIndex(b => rec[0] >= b.lo && rec[0] < b.hi + 1e-9); if (i2 >= 0) buckets[i2].w *= 0.5; }
    }
    const b = this.rng.weighted(buckets.map(x => ({ item: x, weight: x.w })));
    return Math.round((b.lo + this.rng.next() * (b.hi - b.lo)) * 10) / 10;
  }
  static levelOf(intensity) { return intensity <= 3.5 ? 1 : intensity <= 6.5 ? 2 : 3; }
}
export { LEVELS };
