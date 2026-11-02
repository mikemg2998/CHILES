/* PreferenceManager: lo que se guarda en el teléfono. Anatomía ≠ género: cada jugador marca las partes que tiene
   (vulva · pene · senos). Lo demás (sesión, ropa, feedback) vive en memoria y desaparece al cerrar. */
import { ANATOMY_IDS, UNDERWEAR_GARMENTS, defaultUnderwear } from '../content/body.js';
const fromLegacy = an => an === 'FM' ? ['vulva', 'pene'] : an === 'F' ? ['vulva'] : an === 'M' ? ['pene'] : [];
export class PreferenceManager {
  constructor(data = {}) {
    this.names = Array.isArray(data.names) ? data.names : ['', ''];
    this.mode = data.mode || 'conexion';
    this.bodyParts = (data.bodyParts || (data.anatomy || ['', '']).map(fromLegacy)).map(p => (p || []).filter(a => ANATOMY_IDS.includes(a)));
    while (this.bodyParts.length < 2) this.bodyParts.push([]);
    /* prendas interiores elegidas por cada jugador; null = no lo ha indicado (datos antiguos o primer uso) → se deriva de su
       configuración corporal. Un campo ausente en un guardado antiguo NUNCA significa «no la llevo». */
    this.underwear = (Array.isArray(data.underwear) ? data.underwear : []).map(u => (Array.isArray(u) ? u.filter(g => UNDERWEAR_GARMENTS.includes(g)) : null));
    while (this.underwear.length < 2) this.underwear.push(null);
  }
  underwearFor(i) { return this.underwear[i] || defaultUnderwear(this.bodyParts[i] || []); }
  toJSON() { const { names, mode, bodyParts, underwear } = this; return { names, mode, bodyParts, underwear }; }
}
