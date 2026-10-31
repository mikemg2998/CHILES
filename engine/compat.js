/* CompatibilityEngine + CombinationValidator.
   La compatibilidad se declara explícitamente en el catálogo; aquí solo se consulta. */
import { ZONE, ACTION, STYLE, CONDITION, STYLES, CONDITIONS } from './catalog.js';

/* Pares acción+zona que son válidos pero conviene revisar a mano. */
const QUESTIONABLE_PAIRS = new Set([
  'cosquillas:espalda', 'mordisquear:dedos', 'besar:pies', 'apretar:manos', 'presionar:manos',
]);

export const CompatibilityEngine = {
  zonesFor(action, prefs) {
    return action.zones.map(id => ZONE[id]).filter(z => z && prefs.zoneEnabled(z));
  },
  stylesFor(action, zone) {
    return action.styles.map(id => STYLE[id]).filter(s => s && this.styleFits(s, action, zone));
  },
  styleFits(style, action, zone) {
    if (!action.styles.includes(style.id)) return false;
    if (style.tags.includes('ritmo') && !action.tags.includes('movimiento')) return false;
    if (style.id === 'circulos' && !action.tags.includes('circular')) return false;
    if (style.id === 'apenas' && !action.tags.includes('ligero')) return false;
    if (style.tags.includes('presion') && action.tags.includes('sinContacto')) return false;
    if (style.id === 'circulos' && zone && ['labios', 'dedos', 'manos', 'cabello'].includes(zone.id)) return false;
    return true;
  },
  conditionsFor(action, zone, style) {
    return CONDITIONS.filter(c => this.conditionFits(c, action, zone, style));
  },
  conditionFits(c, action, zone, style) {
    if (action.conds.includes(c.id)) return false;
    if (c.onlyActionTags && !c.onlyActionTags.some(t => action.tags.includes(t))) return false;
    if (c.denyActionTags.some(t => action.tags.includes(t))) return false;
    if (zone) {
      if (c.needsZoneTags.length && !c.needsZoneTags.every(t => zone.tags.includes(t))) return false;
      if (c.denyZoneTags.some(t => zone.tags.includes(t))) return false;
      if (c.needsAlt && action.zones.length < 2) return false;
    }
    if (style && c.denyStyleTags.some(t => style.tags.includes(t))) return false;
    if (style && c.tags.includes('control') && style.tags.includes('control')) return false;
    return true;
  },
};

export const CombinationValidator = {
  /* Devuelve {status: 'VALID'|'QUESTIONABLE'|'INVALID', reasons: []} */
  validate(combo, prefs, ceiling) {
    const reasons = [];
    const a = ACTION[combo.action], z = ZONE[combo.zone], s = STYLE[combo.style], c = CONDITION[combo.cond];
    if (!a) reasons.push('acción desconocida');
    if (!z) reasons.push('zona desconocida');
    if (!s) reasons.push('estilo desconocido');
    if (!c) reasons.push('condición desconocida');
    if (reasons.length) return { status: 'INVALID', reasons };
    if (!a.zones.includes(z.id)) reasons.push(`zona ${z.id} no compatible con ${a.id}`);
    if (prefs && !prefs.zoneEnabled(z)) reasons.push(`zona ${z.id} desactivada`);
    if (prefs && prefs.actionDisabled(a)) reasons.push(`acción ${a.id} desactivada`);
    if (!CompatibilityEngine.styleFits(s, a, z)) reasons.push(`estilo ${s.id} no compatible con ${a.id}`);
    if (!CompatibilityEngine.conditionFits(c, a, z, s)) reasons.push(`condición ${c.id} no compatible`);
    if (combo.alt && (combo.alt === z.id || !a.zones.includes(combo.alt))) reasons.push('alternativa inválida');
    if (ceiling && combo.intensity > ceiling) reasons.push(`intensidad ${combo.intensity} supera el techo ${ceiling}`);
    if (reasons.length) return { status: 'INVALID', reasons };
    if (QUESTIONABLE_PAIRS.has(`${a.id}:${z.id}`)) return { status: 'QUESTIONABLE', reasons: ['par acción/zona marcado para revisión'] };
    if (z.intimacy === 4 && a.baseIntensity <= 1) return { status: 'QUESTIONABLE', reasons: ['acción muy suave en zona íntima'] };
    return { status: 'VALID', reasons: [] };
  },
};
