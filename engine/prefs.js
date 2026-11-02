/* PreferenceManager: lo que se guarda en el teléfono. Anatomía ≠ género: cada jugador marca las partes que tiene
   (vulva · pene · senos). Lo demás (sesión, ropa, feedback) vive en memoria y desaparece al cerrar. */
import { ANATOMY_IDS } from '../content/body.js';
const fromLegacy = an => an === 'FM' ? ['vulva', 'pene'] : an === 'F' ? ['vulva'] : an === 'M' ? ['pene'] : [];
export class PreferenceManager {
  constructor(data = {}) {
    this.names = Array.isArray(data.names) ? data.names : ['', ''];
    this.mode = data.mode || 'conexion';
    this.bodyParts = (data.bodyParts || (data.anatomy || ['', '']).map(fromLegacy)).map(p => (p || []).filter(a => ANATOMY_IDS.includes(a)));
    while (this.bodyParts.length < 2) this.bodyParts.push([]);
  }
  toJSON() { const { names, mode, bodyParts } = this; return { names, mode, bodyParts }; }
}
