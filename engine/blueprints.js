/* INTERACTION BLUEPRINTS: la fuente de verdad del generador. Un blueprint es una escena corporal que sabemos de
   antemano que funciona (familia semántica, patrón, acciones, zonas admisibles, formas y condiciones que le sientan
   bien). El azar solo elige DENTRO de ese espacio: estructura diseñada a mano + variación procedural = sensación de
   diseñado a mano. Acción, zona, forma y condición son la representación en dados del resultado, no su origen. */
import { ACTION, ZONE, CONDITION, LEVELS } from './catalog.js';
import { CompatibilityEngine as CE } from './compat.js';
import { mechanicsCheck } from './body.js';

const expand = (levels) => { const out = {}; if (levels[1]) out[1] = levels[1]; if (levels[2]) out[2] = levels[2]; if (levels[3]) { out[3] = levels[3]; out[4] = levels[4] ?? levels[3] * 0.7; } else if (levels[4]) out[4] = levels[4]; return out; };
/* conditions: { light: true | [ids], interaction: [ids], setup: [ids] } · requires: condición SETUP obligatoria (el blueprint existe por ella)
   zones: null (las de la acción) | { tags, notTags, only } · forms: true | false */
const B = (o) => {
  const b = Object.assign({ pattern: 'GIVE', zones: null, forms: true, conditions: { light: true, interaction: [], setup: [] }, requires: null, baseWeight: 1, positionComplexity: 1 }, o);
  b.levels = expand(b.levels);
  b.conditions = Object.assign({ light: true, interaction: [], setup: [] }, b.conditions);
  return b;
};
export const BLUEPRINTS = [
  B({ id: 'caricias', name: 'Caricias', family: 'caricia', pattern: 'GIVE', levels: { 1: 3, 2: 2, 3: 0.8 }, baseWeight: 1.2,
    actions: ['acariciar', 'rozar', 'recorrerDedos', 'dibujar', 'recorrerContorno', 'tamborilear', 'trazarNombre', 'unas'], zones: { notTags: ['intimo'] },
    conditions: { light: true, interaction: ['parejaGuia', 'parejaCambia', 'parejaQuieta', 'manosQuietas', 'adivinarDonde', 'describir', 'parejaCuenta', 'hastaPidaMas', 'parejaRitmo'], setup: ['tumbados', 'detras', 'frenteAFrente', 'luzApagada', 'musica'] } }),
  B({ id: 'masaje', name: 'Masaje', family: 'masaje', pattern: 'GIVE', levels: { 1: 3, 2: 1.2, 3: 0.4 }, baseWeight: 1.1,
    actions: ['masajear', 'pulgares', 'manosCalientes', 'apoyarMano', 'masajeCabeza'],
    conditions: { light: true, interaction: ['parejaGuia', 'parejaCambia', 'describir', 'parejaCuenta'], setup: ['tumbados', 'detras', 'musica', 'luzApagada'] } }),
  B({ id: 'cabello', name: 'Cabello', family: 'cabello', pattern: 'GIVE', levels: { 1: 2 }, positionComplexity: 0,
    actions: ['jugarCabello', 'peinar', 'masajeCabeza'], conditions: { light: true, interaction: ['parejaCuenta'], setup: ['musica'] } }),
  B({ id: 'abrazos', name: 'Abrazos y cercanía', family: 'abrazo', pattern: 'MUTUAL', levels: { 1: 3, 2: 1 }, baseWeight: 1.2, positionComplexity: 0,
    actions: ['abrazar', 'abrazarDetras', 'mecer', 'sujetarManos', 'entrelazar', 'frenteConFrente', 'apoyarCabeza', 'palmasContraPalmas', 'rozarNariz', 'pegarPecho'],
    conditions: { light: true, interaction: ['parejaCuenta'], setup: ['musica', 'luzApagada'] } }),
  B({ id: 'besos', name: 'Besos', family: 'beso', pattern: 'GIVE', levels: { 1: 1, 2: 3, 3: 0.5 }, baseWeight: 1.1,
    actions: ['besar', 'besitos', 'besarPalma', 'besarDetrasOreja'], zones: { notTags: ['intimo'] },
    conditions: { light: true, interaction: ['parejaQuieta', 'manosQuietas', 'parejaCambia', 'hastaPidaMas', 'enVozAlta', 'sinManos'], setup: ['tumbados', 'detras', 'frenteAFrente', 'luzApagada'] } }),
  B({ id: 'anticipacion', name: 'Anticipación', family: 'anticipacion', pattern: 'DISCOVER', levels: { 2: 2.2, 3: 1 }, baseWeight: 1,
    actions: ['acercarse', 'respirarCerca', 'soplar', 'recorrerNariz', 'rozarLabios', 'manoQueSube'], zones: { notTags: ['intimo'] },
    conditions: { light: ['ojosCerrados', 'sinHablar'], interaction: ['esperar', 'contarTres', 'parejaQuieta', 'manosQuietas', 'enVozAlta'], setup: ['luzApagada', 'tumbados'] } }),
  B({ id: 'aCiegas', name: 'A ciegas', family: 'aCiegas', pattern: 'DISCOVER', levels: { 3: 1 }, baseWeight: 0.35, requires: 'vendados',
    actions: ['rozar', 'recorrerDedos', 'respirarCerca', 'soplar', 'rozarLabios', 'recorrerNariz', 'besitos', 'puntaLengua', 'recorrerLengua', 'unas', 'dibujar', 'lamer'], zones: { tags: ['sensible'], notTags: ['intimo'] },
    conditions: { light: ['sinHablar'], interaction: ['esperar', 'enVozAlta', 'parejaQuieta'], setup: ['vendados'] } }),
  B({ id: 'bocaPiel', name: 'La boca sobre la piel', family: 'bocaPiel', pattern: 'GIVE', levels: { 2: 2.2, 3: 1.2 }, baseWeight: 1,
    actions: ['recorrerLabios', 'rozarLabios', 'puntaLengua', 'recorrerLengua', 'besarSuccion'], zones: { notTags: ['intimo'] },
    conditions: { light: ['ojosCerrados', 'sinHablar', 'mirandose'], interaction: ['parejaQuieta', 'manosQuietas', 'parejaCambia', 'hastaPidaMas', 'enVozAlta', 'sinManos'], setup: ['tumbados', 'detras', 'luzApagada'] } }),
  B({ id: 'mordiscos', name: 'Mordiscos', family: 'mordisco', pattern: 'GIVE', levels: { 2: 1.3, 3: 0.9 }, baseWeight: 0.8,
    actions: ['mordisquear', 'atraparLabio', 'besarSuccion'], zones: { notTags: ['intimo'] },
    conditions: { light: ['mirandose'], interaction: ['parejaQuieta', 'hastaPidaMas', 'enVozAlta'], setup: [] } }),
  B({ id: 'bocaABoca', name: 'Boca a boca', family: 'besoBoca', pattern: 'MUTUAL', levels: { 2: 1.5, 3: 1 }, baseWeight: 0.9, positionComplexity: 0,
    actions: ['besoProfundo', 'sujetarNuca', 'atraparLabio'], zones: { only: ['labios', 'nuca'] },
    conditions: { light: ['sinHablar'], interaction: ['sinManos', 'parejaCambia', 'hastaPidaMas'], setup: [] } }),
  B({ id: 'ropa', name: 'La ropa', family: 'ropa', pattern: 'DISCOVER', levels: { 2: 1.5, 3: 0.4 }, baseWeight: 0.9,
    actions: ['apartarRopa', 'manoBajoRopa', 'desabrochar'], forms: false,
    conditions: { light: ['mirandose', 'sinHablar'], interaction: ['parejaQuieta', 'manosQuietas', 'describir'], setup: ['luzApagada'] } }),
  B({ id: 'voz', name: 'Al oído', family: 'voz', pattern: 'GIVE', levels: { 2: 1.2, 3: 0.5 }, baseWeight: 0.7, positionComplexity: 0,
    actions: ['susurrar'], forms: false, conditions: { light: ['ojosCerrados'], interaction: ['parejaQuieta'], setup: ['luzApagada'] } }),
  B({ id: 'cuerpoQuieto', name: 'Cuerpo contra cuerpo', family: 'cuerpo', pattern: 'MUTUAL', levels: { 2: 1.2, 3: 1.2 }, baseWeight: 0.9,
    actions: ['pegarPecho', 'pegarCaderas', 'sentarseEncima', 'pesoEncima', 'rodearConPiernas'], forms: false,
    conditions: { light: ['respirarJuntos', 'mirandose', 'sinHablar'], interaction: ['enVozAlta', 'parejaCuenta'], setup: ['luzApagada', 'musica'] } }),
  B({ id: 'cuerpoMovimiento', name: 'Cuerpos en movimiento', family: 'cuerpo', pattern: 'MUTUAL', levels: { 3: 1.1 }, baseWeight: 0.8,
    actions: ['frotarCaderasDetras', 'frotarCaderasFrente', 'deslizarMuslo', 'frotarPecho'],
    conditions: { light: ['sinHablar', 'mirandose'], interaction: ['parejaRitmo', 'hastaPidaMas', 'enVozAlta'], setup: ['luzApagada'] } }),
  B({ id: 'sujecion', name: 'Sujetar y apretar', family: 'presion', pattern: 'GIVE', levels: { 2: 0.9, 3: 1.4 }, baseWeight: 0.9,
    actions: ['apretar', 'sujetarCaderas', 'sujetarNuca', 'sujetarMunecas', 'nalgada'],
    conditions: { light: ['mirandose'], interaction: ['enVozAlta', 'hastaPidaMas', 'parejaCambia'], setup: [] } }),
  B({ id: 'avance', name: 'Manos que avanzan', family: 'avance', pattern: 'DISCOVER', levels: { 2: 1.2, 3: 1.4 }, baseWeight: 1,
    actions: ['manoQueSube', 'manoEntreMuslos', 'frotarEntrepierna'],
    conditions: { light: ['mirandose', 'ojosCerrados'], interaction: ['esperar', 'contarTres', 'parejaQuieta', 'enVozAlta', 'hastaPidaMas', 'parejaGuia'], setup: ['luzApagada', 'tumbados'] } }),
  B({ id: 'lengua', name: 'La lengua', family: 'lengua', pattern: 'GIVE', levels: { 3: 2 }, baseWeight: 1,
    actions: ['lamer', 'recorrerLengua'], zones: { notTags: ['intimo'] },
    conditions: { light: ['ojosCerrados'], interaction: ['parejaQuieta', 'manosQuietas', 'hastaPidaMas', 'enVozAlta', 'parejaRitmo', 'parejaCambia'], setup: ['tumbados'] } }),
  B({ id: 'bocaIntima', name: 'La boca, íntimo', family: 'bocaIntima', pattern: 'GIVE', levels: { 4: 2.5 }, baseWeight: 1.1,
    actions: ['chupar', 'estimularBoca', 'lamer', 'besar', 'acercarse', 'respirarCerca'], zones: { tags: ['intimo'] },
    conditions: { light: [], interaction: ['parejaRitmo', 'hastaPidaMas', 'enVozAlta', 'manosQuietas', 'parejaCambia', 'esperar'], setup: ['tumbados'] } }),
  B({ id: 'manoIntima', name: 'La mano, íntimo', family: 'manoIntima', pattern: 'GIVE', levels: { 4: 2.5 }, baseWeight: 1.1,
    actions: ['estimularDedos', 'masturbar', 'introducirDedo', 'acariciar', 'rozar'], zones: { tags: ['intimo'] },
    conditions: { light: ['mirandose'], interaction: ['parejaGuia', 'parejaRitmo', 'hastaPidaMas', 'enVozAlta', 'parejaCambia'], setup: ['tumbados'] } }),
];
export const BLUEPRINT = Object.fromEntries(BLUEPRINTS.map(b => [b.id, b]));
export const BLUEPRINTS_OF_ACTION = {};
for (const b of BLUEPRINTS) for (const a of b.actions) (BLUEPRINTS_OF_ACTION[a] ||= []).push(b.id);

/* blueprint «natural» de una acción sobre una zona: el primero que la contiene, admite la zona y no exige preparación */
export function blueprintFor(actionId, zoneId) {
  const a = ACTION[actionId], z = ZONE[zoneId]; if (!a || !z) return null;
  const admits = b => { const f = b.zones || {}; return (!f.only || f.only.includes(z.id)) && (!f.tags || f.tags.some(t => z.tags.includes(t))) && (!f.notTags || !f.notTags.some(t => z.tags.includes(t))); };
  const list = (BLUEPRINTS_OF_ACTION[actionId] || []).map(id => BLUEPRINT[id]);
  return (list.find(b => !b.requires && admits(b)) || list.find(b => admits(b)) || list[0] || null);
}
/* zonas del blueprint para una acción: las de la acción, filtradas por el blueprint, el nivel y la anatomía */
export function blueprintZones(b, a, level, prefs) {
  const f = b.zones || {};
  return CE.zonesFor(a, level, prefs).filter(z => (!f.only || f.only.includes(z.id)) && (!f.tags || f.tags.some(t => z.tags.includes(t))) && (!f.notTags || !f.notTags.some(t => z.tags.includes(t))));
}
/* ¿admite el blueprint esta condición? LIGHT: por defecto cualquiera · INTERACTION y SETUP: solo las declaradas */
export function blueprintAllowsCondition(b, c) {
  if (!c) return true;
  const cs = b.conditions;
  if (c.tier === 'LIGHT') return cs.light === true ? true : Array.isArray(cs.light) && cs.light.includes(c.id);
  if (c.tier === 'INTERACTION') return cs.interaction.includes(c.id);
  return cs.setup.includes(c.id); // SETUP: nunca por inferencia genérica
}
export const supportsSetupCondition = (b, c) => !!c && c.tier === 'SETUP' && b.conditions.setup.includes(c.id);

/* composiciones válidas de un blueprint en un nivel (para cobertura y pruebas) */
export function blueprintCompositions(b, level, prefs) {
  const out = [];
  if (!b.levels[level]) return out;
  for (const id of b.actions) {
    const a = ACTION[id]; if (!a || !a.levels[level]) continue;
    for (const z of blueprintZones(b, a, level, prefs)) {
      const req = b.requires ? CONDITION[b.requires] : null;
      if (req && !CE.conditionFits(req, a, z, null)) continue;
      if (!mechanicsCheck(a, z, req).ok) continue;
      out.push({ action: a.id, zone: z.id });
    }
  }
  return out;
}
export { LEVELS };
