/* CompatibilityEngine: cada paso solo ofrece opciones compatibles con las anteriores.
   CombinationValidator: última barrera. Detecta redundancia, contradicción, duración absurda,
   condición irrelevante, fuera de nivel y frase robótica. */
import { ZONE, ACTION, METHOD, CONDITION, METHODS, CONDITIONS, CONFLICTS, LEVELS } from './catalog.js';

const has = (arr, t) => arr.includes(t);

export const CompatibilityEngine = {
  /* Zonas compatibles con la acción, activadas y presentes en el nivel. */
  zonesFor(action, level, prefs) {
    return action.zones.map(id => ZONE[id]).filter(z => z && z.levels[level] && prefs.zoneEnabled(z));
  },
  methodFits(m, action, zone) {
    if (action.denyMethods.includes(m.id)) return false;
    if (m.needs.length && !m.needs.every(t => has(action.tags, t))) return false;
    if (m.deny.some(t => has(action.tags, t))) return false;
    if (m.denyContact.includes(action.contactType)) return false;
    if (m.zoneNeeds.length && !m.zoneNeeds.every(t => has(zone.tags, t))) return false;
    if (m.needsDuration && action.durationType !== m.needsDuration) return false;
    if (m.dim === 'duracion' && action.durationType === 'breve' && ['buenRato', 's30'].includes(m.id)) return false;
    if (m.id === 'circulos' && ['labios', 'dedos', 'manos', 'cabello'].includes(zone.id)) return false;
    if (m.pos === 'adv' && !action.frame.includes('{M}')) return false;
    return true;
  },
  methodsFor(action, zone, level) {
    return METHODS.filter(m => m.levels[level] && this.methodFits(m, action, zone));
  },
  conditionFits(c, action, zone, method) {
    if (action.denyConditions.includes(c.id)) return false;
    if (c.needsZoneTags.length && !c.needsZoneTags.every(t => has(zone.tags, t))) return false;
    if (c.denyZoneTags.some(t => has(zone.tags, t))) return false;
    if (c.needsActionTags.length && !c.needsActionTags.some(t => has(action.tags, t))) return false;
    if (c.denyActionTags.some(t => has(action.tags, t))) return false;
    if (c.denyContact.includes(action.contactType)) return false;
    if (c.needsContact && !c.needsContact.includes(action.contactType)) return false;
    if (c.needsDuration && !c.needsDuration.includes(action.durationType)) return false;
    if (method && c.denyDims.includes(method.dim)) return false;
    if (c.id === 'detras' && ['abrazar', 'entrelazar', 'pegarCuerpo', 'frotar'].includes(action.id)) return false;
    if (c.id === 'frenteAFrente' && ['abrazar', 'pegarCuerpo', 'frotar', 'acercarse', 'respirarCerca'].includes(action.id)) return false;
    if (c.id === 'tumbados' && ['abrazar', 'entrelazar', 'pegarCuerpo', 'frotar', 'jugarCabello'].includes(action.id)) return false;
    if (c.id === 'mirandose' && action.contactType === 'ninguno' && zone.id !== 'labios' && zone.id !== 'rostro') return false;
    return true;
  },
  conditionsFor(action, zone, method, level) {
    return CONDITIONS.filter(c => c.levels[level] && this.conditionFits(c, action, zone, method));
  },
  /* zona alternativa para condiciones que la necesitan */
  altZones(c, action, zone, level, prefs) {
    const pool = this.zonesFor(action, level, prefs).filter(z => z.id !== zone.id);
    if (Array.isArray(c.needsAlt)) return pool.filter(z => c.needsAlt.includes(z.id) && z.intensity < zone.intensity);
    return pool.filter(z => Math.abs(z.intensity - zone.intensity) <= 2 && z.group === zone.group || Math.abs(z.intensity - zone.intensity) <= 1);
  },
};

export function conceptsOf(combo) {
  const a = ACTION[combo.action], m = METHOD[combo.method], c = CONDITION[combo.cond];
  const all = [];
  if (a) all.push(...a.concepts.map(x => ['action', x]));
  if (m) all.push(...m.concepts.map(x => ['method', x]));
  if (c) all.push(...c.concepts.map(x => ['cond', x]));
  if (m && m.dim === 'ritmo') all.push(['method', 'ritmo']);
  return all;
}

export const CombinationValidator = {
  /* combo: {action, zone, method, cond, alt, intensity, level, phrase?} → {status, reasons} */
  validate(combo, prefs) {
    const reasons = [];
    const a = ACTION[combo.action], z = ZONE[combo.zone], m = combo.method ? METHOD[combo.method] : null, c = combo.cond ? CONDITION[combo.cond] : null;
    if (!a || !z) return { status: 'INVALID', reasons: ['elemento desconocido'] };
    if (!a.zones.includes(z.id)) reasons.push(`zona ${z.id} no compatible con ${a.id}`);
    if (prefs && !prefs.zoneEnabled(z)) reasons.push(`zona ${z.id} desactivada`);
    if (m && !CompatibilityEngine.methodFits(m, a, z)) reasons.push(`forma ${m.id} no compatible`);
    if (c && !CompatibilityEngine.conditionFits(c, a, z, m)) reasons.push(`condición ${c.id} no compatible`);
    if (c && c.needsAlt && !combo.alt) reasons.push('condición sin zona alternativa');
    // redundancia: el mismo concepto en dos elementos distintos
    const cs = conceptsOf(combo);
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      if (cs[i][0] !== cs[j][0] && cs[i][1] === cs[j][1]) reasons.push(`redundante: ${cs[i][1]} (${cs[i][0]} y ${cs[j][0]})`);
    }
    // contradicción
    for (const [x, y] of CONFLICTS) {
      const hx = cs.filter(k => k[1] === x), hy = cs.filter(k => k[1] === y);
      if (x === y) continue;
      if (hx.length && hy.length && hx.some(p => hy.some(q => p[0] !== q[0]))) reasons.push(`contradicción: ${x} vs ${y}`);
    }
    // duración absurda
    if (m && m.dim === 'duracion' && a.durationType === 'breve' && m.mod > 0.2) reasons.push('duración absurda para una acción breve');
    // nivel
    if (combo.level && combo.intensity != null) {
      const L = LEVELS[combo.level];
      const lo = combo.level === 3 ? 5.5 : combo.level === 2 ? 3.0 : L.min; // margen de transición por abajo
      if (combo.intensity > L.max + 1e-9 || combo.intensity < lo) reasons.push(`intensidad ${combo.intensity} fuera del nivel ${L.name}`);
    }
    if (reasons.length) return { status: 'INVALID', reasons };
    // frase robótica
    if (combo.phrase) {
      const words = combo.phrase.split(/\s+/).length;
      if (words > 30) return { status: 'QUESTIONABLE', reasons: ['frase demasiado larga'] };
      const names = (combo.names || []).filter(Boolean);
      for (const n of names) { const k = combo.phrase.split(n).length - 1; if (k > 2) return { status: 'QUESTIONABLE', reasons: ['nombre repetido'] }; }
    }
    if (z.intensity >= 8.5 && a.intensity <= 2.5) return { status: 'QUESTIONABLE', reasons: ['acción muy suave en zona íntima'] };
    return { status: 'VALID', reasons: [] };
  },
};
