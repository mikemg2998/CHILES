/* SignatureComboManager: combinaciones diseñadas a mano, mezcladas con las procedurales. */
import { SIGNATURES, ACTION, ZONE, STYLE, CONDITION } from './catalog.js';
import { CombinationValidator } from './compat.js';
import { computeIntensity } from './intensity.js';

export class SignatureComboManager {
  constructor(rng, probability = 0.07) { this.rng = rng; this.probability = probability; }
  candidates(target, prefs, history, ceiling) {
    return SIGNATURES.filter(sig => {
      if (history.recentSignatures.includes(sig.id)) return false;
      const a = ACTION[sig.action], z = ZONE[sig.zone], s = STYLE[sig.style], c = CONDITION[sig.cond];
      if (!a || !z || !s || !c || !prefs.zoneEnabled(z) || prefs.actionDisabled(a) || a.baseIntensity > ceiling) return false;
      const intensity = computeIntensity(a, z, s, c);
      if (intensity > ceiling || Math.abs(intensity - target) > 1) return false;
      return CombinationValidator.validate({ action: sig.action, zone: sig.zone, style: sig.style, cond: sig.cond, intensity }, prefs, ceiling).status !== 'INVALID';
    });
  }
  maybe(target, prefs, history, ceiling) {
    if (!this.rng.chance(this.probability)) return null;
    const c = this.candidates(target, prefs, history, ceiling);
    if (!c.length) return null;
    const sig = this.rng.pick(c);
    return { action: sig.action, zone: sig.zone, style: sig.style, cond: sig.cond, signature: sig.id, category: sig.category };
  }
}
