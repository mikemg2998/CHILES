/* Catálogo v3. Intensidad interna 1–10. Cuatro niveles:
   1 CONEXIÓN 1–3.5 · 2 DESEO 3.5–6.5 · 3 EXPLORACIÓN 5.5–8.5 (claramente sexual, sin anatomía íntima)
   4 INTIMIDAD 7–10 (anatomía íntima; el juego sabe cuándo dejar de dirigir).
   El contenido se escribe en tres bandas (levels: {1,2,3}) y se expande a cuatro niveles al cargar:
   la banda 3 alimenta Exploración e Intimidad; las zonas íntimas solo existen en Intimidad.
   Regla de oro: antes de añadir algo, preguntarse con qué combina bien. */

export const LEVELS = {
  1: { id: 1, key: 'conexion', name: 'Conexión', min: 1, lo: 1, max: 3.5, tagline: 'No tenemos que llegar a ningún sitio.' },
  2: { id: 2, key: 'deseo', name: 'Deseo', min: 3.5, lo: 3, max: 6.5, tagline: 'Descubrir qué nos enciende.' },
  3: { id: 3, key: 'exploracion', name: 'Exploración', min: 6, lo: 5.5, max: 8.5, tagline: 'Sin prisa, con las manos y la boca.' },
  4: { id: 4, key: 'intimidad', name: 'Intimidad', min: 7, lo: 6.5, max: 10, tagline: 'Elegimos juntos hasta dónde queremos llegar.' },
};
/* claves antiguas (partidas guardadas) → nivel */
export const LEVEL_BY_KEY = { conexion: 1, deseo: 2, exploracion: 3, intimidad: 4, relajado: 1, sensual: 2, atrevido: 3, progresivo: 1 };
export const LEVEL_KEYS = ['conexion', 'deseo', 'exploracion', 'intimidad'];
/* banda 3 → niveles 3 y 4. intimate: la zona solo existe en Intimidad. hot: en Intimidad pesa igual que en Exploración; si no, la mitad */
const expand = (levels, { intimate = false, hot = true } = {}) => {
  const out = {};
  if (intimate) { if (levels[3]) out[4] = levels[3]; return out; }
  if (levels[1]) out[1] = levels[1];
  if (levels[2]) out[2] = levels[2];
  if (levels[3]) { out[3] = levels[3]; out[4] = hot ? levels[3] * 0.7 : levels[3] * 0.35; }
  if (levels[4]) out[4] = levels[4];
  return out;
};

export const GROUPS = {
  cabeza: { name: 'Cabeza, rostro y cuello', default: true },
  torso: { name: 'Torso y espalda', default: true },
  senos: { name: 'Senos', default: true },
  brazos: { name: 'Brazos y manos', default: true },
  piernas: { name: 'Piernas y pies', default: true },
  gluteos: { name: 'Glúteos y entrepierna', default: true },
  intimaF: { name: 'Anatomía íntima femenina', default: true, intimate: true, sex: 'F' },
  intimaM: { name: 'Anatomía íntima masculina', default: true, intimate: true, sex: 'M' },
};

/* ZONAS. n: nombre con artículo · np: forma con posesivo (su/sus) · intensity 1–10
   tags: frontal (se puede mirar a los ojos) · largo (se puede recorrer) · detras (se trabaja desde atrás)
         tumbado (mejor tumbados) · sensible · intimo */
/* family: familia anatómica para el balanceo (no repetir la misma idea en tiradas cercanas) */
const ZONE_FAMILY = {"cabello": "rostro", "frente": "rostro", "mejillas": "rostro", "rostro": "rostro", "orejas": "cuello", "labios": "boca", "cuello": "cuello", "nuca": "cuello", "hombros": "espalda", "espalda": "espalda", "lumbar": "espalda", "pecho": "torso", "abdomen": "torso", "abdomenBajo": "vientre", "cintura": "torso", "caderas": "vientre", "senos": "senos", "pezones": "senos", "brazos": "brazos", "manos": "brazos", "dedos": "brazos", "muslos": "muslos", "muslosInt": "muslos", "piernas": "piernas", "pantorrillas": "piernas", "pies": "piernas", "gluteos": "gluteos", "entrepierna": "entrepierna", "vulva": "intimaF", "labiosMayores": "intimaF", "labiosMenores": "intimaF", "clitoris": "intimaF", "vagina": "intimaF", "pene": "intimaM", "glande": "intimaM", "testiculos": "intimaM", "clavicula": "cuello", "sienes": "rostro", "munecas": "brazos", "palmas": "brazos", "costados": "torso", "rodillas": "piernas", "tobillos": "piernas", "ingles": "entrepierna"};
const Z = (id, n, group, intensity, tags, levels, np) => ({ id, n, np: np || n.replace(/^(el|la) /, 'su ').replace(/^(los|las) /, 'sus '), group, family: ZONE_FAMILY[id], intensity, tags, levels: expand(levels, { intimate: tags.includes('intimo'), hot: intensity >= 6.5 }) });
export const ZONES = [
  Z('cabello', 'el cabello', 'cabeza', 1.5, ['detras'], { 1: 3 }),
  Z('frente', 'la frente', 'cabeza', 1, ['frontal'], { 1: 1.2 }),
  Z('mejillas', 'las mejillas', 'cabeza', 2, ['frontal'], { 1: 2 }),
  Z('rostro', 'el rostro', 'cabeza', 2, ['frontal'], { 1: 2 }),
  Z('orejas', 'las orejas', 'cabeza', 3.5, ['sensible'], { 1: 0.8, 2: 1 }),
  Z('labios', 'los labios', 'cabeza', 4.5, ['frontal', 'sensible'], { 2: 3, 3: 0.8 }),
  Z('cuello', 'el cuello', 'cabeza', 3.5, ['frontal', 'largo', 'sensible'], { 1: 1.5, 2: 2, 3: 0.4 }),
  Z('nuca', 'la nuca', 'cabeza', 3, ['sensible', 'detras'], { 1: 1.5, 2: 1 }),

  Z('hombros', 'los hombros', 'torso', 1.5, ['frontal', 'detras'], { 1: 3, 2: 0.5 }),
  Z('espalda', 'la espalda', 'torso', 2.5, ['largo', 'detras', 'tumbado'], { 1: 3, 2: 1 }),
  Z('lumbar', 'la zona lumbar', 'torso', 4.5, ['sensible', 'detras', 'tumbado'], { 2: 2, 3: 0.8 }, 'su zona lumbar'),
  Z('pecho', 'el pecho', 'torso', 5, ['frontal', 'largo', 'tumbado'], { 2: 2, 3: 1 }),
  Z('abdomen', 'el abdomen', 'torso', 4.5, ['frontal', 'largo', 'sensible', 'tumbado'], { 2: 2, 3: 1 }),
  Z('abdomenBajo', 'el bajo vientre', 'torso', 6.5, ['frontal', 'sensible', 'tumbado'], { 2: 1, 3: 1.8 }, 'su bajo vientre'),
  Z('cintura', 'la cintura', 'torso', 3.5, ['frontal'], { 1: 1.2, 2: 2 }),
  Z('caderas', 'las caderas', 'torso', 5, ['frontal', 'sensible'], { 2: 2, 3: 1.6 }),
  Z('senos', 'los senos', 'senos', 6.5, ['frontal', 'sensible', 'tumbado'], { 2: 2, 3: 1.4 }),
  Z('pezones', 'los pezones', 'senos', 8, ['frontal', 'sensible', 'tumbado'], { 3: 1.6 }),

  Z('brazos', 'los brazos', 'brazos', 1, ['frontal', 'largo'], { 1: 3 }),
  Z('manos', 'las manos', 'brazos', 1, ['frontal'], { 1: 3 }),
  Z('dedos', 'los dedos', 'brazos', 1.5, ['frontal'], { 1: 1.5 }),

  Z('muslos', 'los muslos', 'piernas', 5, ['frontal', 'largo', 'tumbado'], { 2: 2, 3: 1 }),
  Z('muslosInt', 'la parte interna de los muslos', 'piernas', 6.5, ['frontal', 'largo', 'sensible', 'tumbado'], { 2: 2, 3: 2 }, 'la parte interna de sus muslos'),
  Z('piernas', 'las piernas', 'piernas', 2, ['largo', 'tumbado'], { 1: 2 }),
  Z('pantorrillas', 'las pantorrillas', 'piernas', 1.5, ['tumbado'], { 1: 1.5 }),
  Z('pies', 'los pies', 'piernas', 2, ['sensible', 'tumbado'], { 1: 2 }),

  // --- zonas menos obvias: dan variedad sin inventar anatomía ---
  Z('sienes', 'las sienes', 'cabeza', 1.5, ['frontal'], { 1: 1.5 }),
  Z('clavicula', 'las clavículas', 'torso', 3, ['frontal', 'sensible'], { 1: 1.2, 2: 1.6 }),
  Z('munecas', 'las muñecas', 'brazos', 2, ['frontal', 'sensible'], { 1: 2, 2: 1 }),
  Z('palmas', 'las palmas de las manos', 'brazos', 1.5, ['frontal'], { 1: 2 }, 'las palmas de sus manos'),
  Z('costados', 'los costados', 'torso', 4.5, ['frontal', 'largo', 'sensible', 'tumbado'], { 2: 1.8, 3: 0.8 }),
  Z('rodillas', 'la parte de atrás de las rodillas', 'piernas', 4, ['sensible', 'tumbado', 'detras'], { 2: 1.2, 3: 0.4 }, 'la parte de atrás de sus rodillas'),
  Z('tobillos', 'los tobillos', 'piernas', 2, ['tumbado'], { 1: 1.5, 2: 0.5 }),
  Z('ingles', 'las ingles', 'gluteos', 7, ['frontal', 'sensible', 'tumbado'], { 3: 1.5 }),
  Z('gluteos', 'los glúteos', 'gluteos', 6.5, ['sensible', 'detras', 'tumbado'], { 2: 1, 3: 1.8 }),
  Z('entrepierna', 'la entrepierna', 'gluteos', 7.5, ['sensible', 'tumbado', 'frontal'], { 3: 1.5 }),

  Z('vulva', 'la vulva', 'intimaF', 9, ['intimo', 'sensible', 'tumbado', 'frontal'], { 3: 2.5 }),
  Z('labiosMayores', 'los labios mayores', 'intimaF', 8.5, ['intimo', 'sensible', 'tumbado'], { 3: 1.2 }),
  Z('labiosMenores', 'los labios menores', 'intimaF', 9, ['intimo', 'sensible', 'tumbado'], { 3: 1.2 }),
  Z('clitoris', 'el clítoris', 'intimaF', 9.5, ['intimo', 'sensible', 'tumbado', 'frontal'], { 3: 2.5 }),
  Z('vagina', 'la vagina', 'intimaF', 9.5, ['intimo', 'sensible', 'tumbado'], { 3: 1.5 }),
  Z('pene', 'el pene', 'intimaM', 9, ['intimo', 'sensible', 'tumbado', 'frontal'], { 3: 2.5 }),
  Z('glande', 'el glande', 'intimaM', 9.5, ['intimo', 'sensible', 'tumbado', 'frontal'], { 3: 2 }),
  Z('testiculos', 'los testículos', 'intimaM', 8.5, ['intimo', 'sensible', 'tumbado'], { 3: 1.5 }),
];
export const ZONE = Object.fromEntries(ZONES.map(z => [z.id, z]));
/* zonas que vienen en pareja (izquierda/derecha): permiten la forma «alternando un lado y otro» */
['mejillas', 'orejas', 'hombros', 'senos', 'pezones', 'brazos', 'manos', 'dedos', 'muslos', 'muslosInt', 'piernas', 'pantorrillas', 'pies', 'gluteos', 'caderas', 'clavicula', 'munecas', 'palmas', 'costados', 'rodillas', 'tobillos', 'ingles', 'testiculos', 'labiosMayores', 'labiosMenores', 'sienes'].forEach(id => ZONE[id].tags.push('par'));
const zonesByTag = tag => ZONES.filter(z => z.tags.includes(tag)).map(z => z.id);
const INTIMA_F = ['vulva', 'labiosMayores', 'labiosMenores', 'clitoris', 'vagina'];
const INTIMA_M = ['pene', 'glande', 'testiculos'];
const INTIMA = [...INTIMA_F, ...INTIMA_M];

/* ACCIONES. Concretas: dicen qué ocurre físicamente.
   frame: {V} verbo · {M} hueco del adverbio · {ZONE} zona (con "de {P}" si va) · {P} pareja
   contactType: mano | boca | cuerpo | ninguno · durationType: breve | normal | sostenible
   tags: movimiento · quieto · circular · ligero · presion · repetido · anticipacion · voz · ropa
   concepts: ideas semánticas para detectar redundancias (ligero, quieto, cerca, aliento, voz, anticipacion)
   manner: 'baja' si la acción ya lleva su manera implícita y una forma añadida suele sobrar */
const A = (o) => { const a = Object.assign({ tags: [], concepts: [], denyConditions: [], denyMethods: [], pattern: 'GIVE' }, o); a.levels = expand(a.levels); if (a.tags.includes('anticipacion') && a.pattern === 'GIVE') a.pattern = 'DISCOVER'; return a; };
export const ACTIONS = [
  // --- base (nivel 1, también en 2 y 3 con sus zonas) ---
  A({ id: 'acariciar', actor: 'mano', family: 'caricia', name: 'Acariciar', verb: 'Acaricia', frame: '{V} {M} {ZONE}', intensity: 2.5, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 3, 2: 2, 3: 0.8 }, tags: ['movimiento', 'circular', 'ligero'],
    zones: ['cabello', 'frente', 'mejillas', 'rostro', 'cuello', 'nuca', 'hombros', 'espalda', 'lumbar', 'pecho', 'abdomen', 'abdomenBajo', 'cintura', 'caderas', 'senos', 'brazos', 'manos', 'dedos', 'muslos', 'muslosInt', 'piernas', 'pies', 'gluteos', 'entrepierna', 'pezones', 'vulva', 'labiosMayores', 'clitoris', 'pene', 'testiculos'] }),
  A({ id: 'masajear', actor: 'manos', family: 'masaje', name: 'Masajear', verb: 'Masajea', frame: '{V} {M} {ZONE}', intensity: 2.5, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 3, 2: 1.2, 3: 0.4 }, tags: ['movimiento', 'circular', 'presion'],
    zones: ['hombros', 'nuca', 'cuello', 'espalda', 'lumbar', 'brazos', 'manos', 'dedos', 'muslos', 'piernas', 'pantorrillas', 'pies', 'caderas', 'gluteos', 'pecho'] }),
  A({ id: 'abrazar', pattern: 'MUTUAL', actor: 'brazos', family: 'abrazo', manner: 'baja', name: 'Abrazar', verb: 'Abraza', frame: '{V} {M} a {P} rodeando {ZONE:bare}', frameP: 'Abrázale {M} rodeando {ZONE:bare}', intensity: 1.5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 1: 2.5, 2: 0.8 }, tags: ['quieto'], concepts: ['contacto'],
    zones: ['cintura', 'hombros', 'espalda'] }),
  A({ id: 'apoyarMano', actor: 'mano', family: 'masaje', manner: 'baja', name: 'Apoyar la mano', verb: 'Apoya', frame: '{V} {M} la mano sobre {ZONE}, sin moverla', intensity: 1.5, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2.5, 2: 1 }, tags: ['quieto'], concepts: ['contacto', 'quieto'],
    zones: ['mejillas', 'pecho', 'espalda', 'nuca', 'hombros', 'abdomen', 'muslos', 'cuello', 'lumbar', 'cintura'] }),
  A({ id: 'rozar', actor: 'yemas', family: 'caricia', name: 'Rozar con los dedos', verb: 'Roza', frame: '{V} {M} {ZONE} con la yema de los dedos', intensity: 3, contactType: 'mano', durationType: 'normal',
    levels: { 1: 2.5, 2: 2, 3: 0.8 }, tags: ['movimiento', 'circular', 'ligero'], concepts: ['ligero'],
    zones: ['mejillas', 'rostro', 'cuello', 'nuca', 'orejas', 'hombros', 'espalda', 'lumbar', 'brazos', 'manos', 'cintura', 'abdomen', 'abdomenBajo', 'pecho', 'senos', 'muslos', 'muslosInt', 'piernas', 'caderas', 'pezones', 'entrepierna', 'vulva', 'clitoris', 'pene', 'testiculos', 'labiosMayores'] }),
  A({ id: 'jugarCabello', actor: 'dedos', family: 'cabello', manner: 'baja', name: 'Jugar con el cabello', verb: 'Juega', frame: '{V} {M} con {ZONE}', intensity: 2, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 1.5 }, tags: ['movimiento'], zones: ['cabello'] }),
  A({ id: 'recorrerDedos', actor: 'dedos', family: 'caricia', name: 'Recorrer con los dedos', verb: 'Recorre', frame: '{V} {M} {ZONE} con la punta de los dedos', intensity: 3, contactType: 'mano', durationType: 'normal',
    levels: { 1: 2.5, 2: 2, 3: 0.8 }, tags: ['movimiento', 'ligero'],
    zones: ['brazos', 'espalda', 'cuello', 'piernas', 'muslos', 'muslosInt', 'abdomen', 'pecho', 'lumbar', 'cintura', 'caderas', 'senos', 'abdomenBajo', 'entrepierna'] }),
  A({ id: 'acercarse', actor: 'labios', manner: 'baja', family: 'anticipacion', name: 'Acercarse sin tocar', verb: 'Acércate', frame: '{V} {M} a {ZONE} hasta casi rozar, y quédate ahí un momento', intensity: 3.5, contactType: 'ninguno', durationType: 'breve',
    levels: { 2: 1.5, 3: 1 }, tags: ['anticipacion'], concepts: ['anticipacion', 'cerca', 'espera'],
    zones: ['labios', 'cuello', 'nuca', 'orejas', 'senos', 'muslosInt', 'abdomenBajo', 'entrepierna', 'vulva', 'pene', 'pezones'] }),
  A({ id: 'respirarCerca', actor: 'aliento', manner: 'baja', family: 'anticipacion', name: 'Respirar cerca', verb: 'Respira', frame: '{V} {M} muy cerca de {ZONE}, sin tocar', intensity: 3.5, contactType: 'ninguno', durationType: 'breve',
    levels: { 2: 1.8, 3: 1 }, tags: ['anticipacion'], concepts: ['anticipacion', 'cerca', 'aliento'],
    zones: ['cuello', 'nuca', 'orejas', 'senos', 'muslosInt', 'labios', 'abdomenBajo', 'vulva', 'pene', 'entrepierna', 'pezones'] }),
  A({ id: 'entrelazar', pattern: 'MUTUAL', actor: 'dedos', family: 'abrazo', manner: 'baja', name: 'Entrelazar los dedos', verb: 'Entrelaza', frame: '{V} {M} tus dedos con los de {P}', frameP: '{V} {M} tus dedos con los suyos', intensity: 1, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2 }, tags: ['quieto'], concepts: ['contacto'], zones: ['manos'], denyMethods: ['muySuave', 'suave', 'moderada'] }),
  A({ id: 'besar', actor: 'labios', family: 'beso', name: 'Besar', verb: 'Besa', frame: '{V} {M} {ZONE}', intensity: 4.5, contactType: 'boca', durationType: 'normal',
    levels: { 1: 1, 2: 3, 3: 0.35 }, tags: ['movimiento', 'repetido'],
    zones: ['frente', 'mejillas', 'manos', 'hombros', 'labios', 'cuello', 'nuca', 'orejas', 'pecho', 'senos', 'abdomen', 'abdomenBajo', 'cintura', 'caderas', 'muslos', 'muslosInt', 'lumbar', 'espalda', 'pezones', 'gluteos', 'entrepierna', 'vulva', 'clitoris', 'pene', 'testiculos'] }),
  // --- nivel 2 ---
  A({ id: 'besitos', actor: 'labios', family: 'beso', manner: 'baja', name: 'Pequeños besos', verb: 'Da', frame: '{V} pequeños besos en {ZONE}', intensity: 4, contactType: 'boca', durationType: 'normal',
    levels: { 2: 2.5, 3: 0.4 }, tags: ['movimiento', 'repetido'],
    zones: ['rostro', 'cuello', 'hombros', 'espalda', 'abdomen', 'abdomenBajo', 'muslosInt', 'senos', 'pecho', 'cintura', 'caderas', 'lumbar', 'gluteos', 'entrepierna'] }),
  A({ id: 'recorrerLabios', actor: 'labios', family: 'beso', name: 'Recorrer con los labios', verb: 'Recorre', frame: '{V} {M} {ZONE} con los labios', intensity: 5.5, contactType: 'boca', durationType: 'normal',
    levels: { 2: 2.5, 3: 0.6 }, tags: ['movimiento', 'ligero'],
    zones: ['cuello', 'hombros', 'espalda', 'lumbar', 'abdomen', 'pecho', 'cintura', 'caderas', 'muslos', 'muslosInt', 'senos', 'abdomenBajo', 'entrepierna', 'gluteos'] }),
  A({ id: 'mordisquear', actor: 'dientes', family: 'mordisco', name: 'Mordisquear', verb: 'Mordisquea', frame: '{V} {M} {ZONE}', intensity: 5.5, contactType: 'boca', durationType: 'breve', denyMethods: ['lento', 'muyLento', 'recorrido', 'constante', 'variable', 'impredecible', 'pausaContacto', 'acelerando', 'gradual', 'alCompas'],
    levels: { 2: 1.5, 3: 0.8 }, tags: ['movimiento', 'repetido'],
    zones: ['labios', 'cuello', 'orejas', 'hombros', 'nuca', 'cintura', 'caderas', 'muslosInt', 'senos', 'pezones', 'gluteos'] }),
  A({ id: 'apartarRopa', actor: 'manos', family: 'ropa', manner: 'baja', name: 'Apartar la ropa', verb: 'Aparta', frame: '{V} {M} la ropa de {ZONE} y descubre la piel', intensity: 5, contactType: 'mano', durationType: 'breve',
    levels: { 2: 1.2 }, tags: ['anticipacion', 'ropa'], concepts: ['anticipacion'], denyMethods: ['unosSegundos', 's20', 's30', 'hastaCambiar', 'buenRato'],
    zones: ['hombros', 'espalda', 'abdomen', 'cintura', 'caderas', 'pecho', 'senos', 'muslos', 'lumbar', 'gluteos', 'abdomenBajo'] }),
  A({ id: 'susurrar', actor: 'voz', family: 'voz', manner: 'baja', name: 'Susurrar', verb: 'Susurra', frame: '{V} {M} algo a {P} al oído', frameP: 'Susúrrale {M} algo al oído', intensity: 4, contactType: 'ninguno', durationType: 'breve',
    levels: { 2: 1.5, 3: 0.5 }, tags: ['voz'], concepts: ['voz', 'cerca'], zones: ['orejas'] }),
  A({ id: 'pegarPecho', pattern: 'MUTUAL', actor: 'pecho', manner: 'baja', family: 'cuerpo', name: 'Pegar el pecho', verb: 'Pega', frame: '{V} {M} tu pecho a {ZONE}', intensity: 5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 2: 1.4, 3: 0.5 }, tags: ['quieto'], concepts: ['contacto', 'cerca'], zones: ['espalda', 'pecho'] }),
  A({ id: 'pegarCaderas', pattern: 'MUTUAL', actor: 'caderas', manner: 'baja', family: 'cuerpo', name: 'Pegar las caderas', verb: 'Pega', frame: 'Ponte detrás de {P} y pega {M} tus caderas a {ZONE:poss}', frameP: 'Ponte detrás y pega {M} tus caderas a {ZONE:poss}', intensity: 6, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 2: 0.8, 3: 1 }, tags: ['quieto'], concepts: ['contacto', 'cerca'], zones: ['gluteos'] }),
  A({ id: 'unas', actor: 'uñas', family: 'caricia', name: 'Pasar las uñas', verb: 'Pasa', frame: '{V} {M} las uñas por {ZONE}', intensity: 4.5, contactType: 'mano', durationType: 'normal',
    levels: { 2: 2, 3: 0.5 }, tags: ['movimiento', 'ligero'],
    zones: ['espalda', 'lumbar', 'muslos', 'muslosInt', 'brazos', 'abdomen', 'cuello', 'nuca', 'cabello', 'gluteos', 'pecho'] }),
  A({ id: 'rozarLabios', actor: 'labios', family: 'beso', name: 'Rozar con los labios', verb: 'Roza', frame: '{V} {M} {ZONE} con los labios, apenas tocando', intensity: 5, contactType: 'boca', durationType: 'breve',
    levels: { 2: 2.5, 3: 0.5 }, tags: ['movimiento', 'ligero', 'anticipacion'], concepts: ['ligero', 'anticipacion'],
    zones: ['cuello', 'orejas', 'labios', 'hombros', 'abdomen', 'senos', 'muslosInt', 'lumbar', 'cintura', 'pezones', 'entrepierna', 'abdomenBajo'] }),
  // --- nivel 3 ---
  A({ id: 'lamer', actor: 'lengua', family: 'lengua', name: 'Lamer', verb: 'Lame', frame: '{V} {M} {ZONE}', intensity: 7.5, contactType: 'boca', durationType: 'normal',
    levels: { 3: 3 }, tags: ['movimiento', 'circular', 'ligero'],
    zones: ['senos', 'pezones', 'abdomenBajo', 'muslosInt', 'entrepierna', 'gluteos', ...INTIMA.filter(z => z !== 'vagina')] }),
  A({ id: 'chupar', actor: 'boca', family: 'bocaIntima', name: 'Chupar', verb: 'Chupa', frame: '{V} {M} {ZONE}', intensity: 8.5, contactType: 'boca', durationType: 'normal',
    levels: { 3: 2.5 }, tags: ['movimiento'],
    zones: ['pezones', 'clitoris', 'pene', 'glande', 'testiculos', 'labiosMayores'] }),
  A({ id: 'estimularDedos', actor: 'dedos', family: 'manoIntima', name: 'Estimular con los dedos', verb: 'Estimula', frame: '{V} {M} {ZONE} con los dedos', intensity: 8.5, contactType: 'mano', durationType: 'normal',
    levels: { 3: 3 }, tags: ['movimiento', 'circular'],
    zones: ['vulva', 'clitoris', 'labiosMayores', 'labiosMenores', 'vagina', 'pene', 'glande', 'testiculos', 'pezones', 'entrepierna'] }),
  A({ id: 'estimularBoca', actor: 'boca', family: 'bocaIntima', name: 'Estimular con la boca', verb: 'Estimula', frame: '{V} {M} {ZONE} con la boca', intensity: 9, contactType: 'boca', durationType: 'normal',
    levels: { 3: 2.5 }, tags: ['movimiento'],
    zones: ['vulva', 'clitoris', 'labiosMenores', 'pene', 'glande', 'testiculos', 'pezones'] }),
  A({ id: 'masturbar', actor: 'mano', family: 'manoIntima', name: 'Masturbar', verb: 'Masturba', frame: '{V} {M} a {P}, centrándote en {ZONE:bare}', frameP: 'Mastúrbale {M}, centrándote en {ZONE:bare}', intensity: 9, contactType: 'mano', durationType: 'normal',
    levels: { 3: 2.5 }, tags: ['movimiento'],
    zones: ['pene', 'vulva', 'clitoris', 'glande'] }),
  A({ id: 'introducirDedo', actor: 'dedo', family: 'manoIntima', name: 'Introducir un dedo', verb: 'Introduce', frame: '{V} {M} un dedo en {ZONE}', intensity: 9.5, contactType: 'mano', durationType: 'normal',
    levels: { 3: 1.5 }, tags: ['movimiento'], zones: ['vagina'],
    denyMethods: ['firme', 'moderada', 'impredecible', 'circulos', 'recorrido', 'pequenos'] }),
  A({ id: 'frotarCaderasDetras', pattern: 'MUTUAL', actor: 'caderas', family: 'cuerpo', name: 'Mover las caderas', verb: 'Mueve', frame: 'Pégate a la espalda de {P} y mueve {M} tus caderas contra {ZONE:poss}', frameP: 'Pégate a su espalda y mueve {M} tus caderas contra {ZONE:poss}', intensity: 7.5, contactType: 'cuerpo', durationType: 'normal',
    levels: { 3: 1 }, tags: ['movimiento'], concepts: ['contacto', 'postura'], zones: ['gluteos'] }),
  A({ id: 'frotarCaderasFrente', pattern: 'MUTUAL', actor: 'caderas', family: 'cuerpo', name: 'Frotar las caderas', verb: 'Frota', frame: 'Tumbados de frente, frota {M} tus caderas contra {ZONE}', intensity: 7.5, contactType: 'cuerpo', durationType: 'normal',
    levels: { 3: 1 }, tags: ['movimiento'], concepts: ['contacto', 'postura'], zones: ['entrepierna'] }),
  A({ id: 'deslizarMuslo', pattern: 'MUTUAL', actor: 'muslo', family: 'cuerpo', name: 'Deslizar el muslo', verb: 'Desliza', frame: '{V} {M} tu muslo contra {ZONE}', intensity: 7, contactType: 'cuerpo', durationType: 'normal',
    levels: { 3: 0.9 }, tags: ['movimiento'], concepts: ['contacto'], zones: ['entrepierna', 'muslosInt'] }),
  A({ id: 'frotarPecho', pattern: 'MUTUAL', actor: 'pecho', family: 'cuerpo', name: 'Frotar el pecho', verb: 'Frota', frame: 'Tumbados de frente, frota {M} tu pecho contra {ZONE}', intensity: 6.5, contactType: 'cuerpo', durationType: 'normal',
    levels: { 3: 0.7 }, tags: ['movimiento'], concepts: ['contacto', 'postura'], zones: ['pecho', 'senos'] }),
  A({ id: 'apretar', actor: 'mano', family: 'presion', name: 'Apretar', verb: 'Aprieta', frame: '{V} {M} {ZONE} con la mano', intensity: 6, contactType: 'mano', durationType: 'breve',
    levels: { 2: 0.6, 3: 1.5 }, tags: ['presion', 'repetido'],
    zones: ['gluteos', 'senos', 'caderas', 'muslos', 'muslosInt'] }),
  A({ id: 'nalgada', actor: 'mano', family: 'presion', manner: 'baja', name: 'Nalgada', verb: 'Da', frame: '{V} {M} una nalgada en {ZONE}', intensity: 7, contactType: 'mano', durationType: 'breve',
    levels: { 3: 1.5 }, tags: ['presion', 'repetido'], zones: ['gluteos'],
    denyMethods: ['lento', 'muyLento', 'pausado', 'constante', 'variable', 'circulos', 'recorrido', 'pequenos', 'buenRato', 's20', 's30', 'hastaCambiar', 'gradual', 'pausaContacto', 'impredecible', 'empezarSuave', 'unosSegundos', 'muySuave', 'suave', 'moderada'] }),
  // --- gestos concretos: cercanía, cariño, juego (Relajado) y tensión (Sensual) ---
  A({ id: 'dibujar', actor: 'dedo', family: 'caricia', name: 'Dibujar con el dedo', verb: 'Dibuja', frame: '{V} {M} formas con un dedo sobre {ZONE}', intensity: 2.5, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2.5, 2: 1.2 }, tags: ['movimiento', 'ligero'], concepts: ['ligero'], denyMethods: ['circulos', 'pequenos', 'recorrido'],
    zones: ['espalda', 'brazos', 'manos', 'muslos', 'abdomen', 'pecho', 'hombros', 'lumbar', 'cintura'] }),
  A({ id: 'peinar', actor: 'dedos', manner: 'baja', family: 'cabello', name: 'Peinar con los dedos', verb: 'Peina', frame: '{V} {M} el cabello de {P} con los dedos', frameP: 'Péinale {M} el cabello con los dedos', intensity: 1.5, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2.5 }, tags: ['movimiento', 'ligero'], zones: ['cabello'] }),
  A({ id: 'masajeCabeza', actor: 'yemas', family: 'masaje', name: 'Masajear la cabeza', verb: 'Masajea', frame: '{V} {M} el cuero cabelludo de {P} con las yemas', frameP: 'Masajéale {M} el cuero cabelludo con las yemas', intensity: 2, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2 }, tags: ['movimiento', 'circular', 'presion'], zones: ['cabello'] }),
  A({ id: 'frenteConFrente', pattern: 'MUTUAL', actor: 'frente', manner: 'baja', family: 'abrazo', name: 'Frente con frente', verb: 'Apoya', frame: '{V} {M} tu frente en la de {P} y respirad un momento así', frameP: '{V} {M} tu frente en la suya y respirad un momento así', intensity: 1.5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 1: 2.5, 2: 0.8 }, tags: ['quieto'], concepts: ['contacto', 'cerca', 'aliento', 'quieto'], zones: ['frente'], denyMethods: ['muySuave', 'suave', 'moderada', 'quieto', 'unosSegundos', 's20', 's30'] }),
  A({ id: 'besarPalma', actor: 'labios', manner: 'baja', family: 'beso', name: 'Besar la palma', verb: 'Besa', frame: '{V} {M} la palma de la mano de {P} y ciérrale los dedos sobre el beso', frameP: 'Bésale {M} la palma de la mano y ciérrale los dedos sobre el beso', intensity: 2, contactType: 'boca', durationType: 'breve',
    levels: { 1: 2 }, tags: ['quieto'], concepts: ['contacto'], zones: ['manos'] }),
  A({ id: 'rozarNariz', pattern: 'MUTUAL', actor: 'nariz', manner: 'baja', family: 'caricia', name: 'Rozar la nariz', verb: 'Roza', frame: '{V} {M} la nariz de {P} con la tuya', frameP: 'Rózale {M} la nariz con la tuya', intensity: 2, contactType: 'cuerpo', durationType: 'breve',
    levels: { 1: 2 }, tags: ['movimiento', 'ligero'], concepts: ['ligero', 'cerca'], zones: ['rostro'] }),
  A({ id: 'abrazarDetras', pattern: 'MUTUAL', actor: 'pecho', manner: 'baja', family: 'abrazo', name: 'Abrazar por detrás', verb: 'Abraza', frame: '{V} {M} a {P} por detrás, con tu pecho pegado a su espalda', frameP: 'Abrázale {M} por detrás, con tu pecho pegado a su espalda', intensity: 2.5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 1: 2, 2: 1.2 }, tags: ['quieto'], concepts: ['contacto', 'postura', 'cerca'], zones: ['espalda'] }),
  A({ id: 'manosCalientes', actor: 'manos', manner: 'baja', family: 'masaje', name: 'Manos calientes', verb: 'Frota', frame: '{V} tus manos hasta calentarlas y apóyalas {M} sobre {ZONE}', intensity: 2, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2.5, 2: 0.6 }, tags: ['quieto'], concepts: ['contacto', 'quieto'], zones: ['espalda', 'abdomen', 'lumbar', 'cuello', 'muslos', 'pecho'] }),
  A({ id: 'pulgares', actor: 'pulgares', family: 'masaje', name: 'Presionar con los pulgares', verb: 'Presiona', frame: '{V} {M} {ZONE} con los pulgares', intensity: 2.5, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2.5, 2: 0.8 }, tags: ['movimiento', 'presion', 'circular'], zones: ['hombros', 'nuca', 'lumbar', 'pies', 'manos', 'muslos'] }),
  A({ id: 'soplar', actor: 'aliento', manner: 'baja', family: 'anticipacion', name: 'Soplar', verb: 'Sopla', frame: '{V} {M} sobre {ZONE}, muy cerca de la piel', intensity: 3.5, contactType: 'ninguno', durationType: 'breve',
    levels: { 2: 2, 3: 0.6 }, tags: ['anticipacion'], concepts: ['anticipacion', 'aliento'], zones: ['cuello', 'nuca', 'orejas', 'espalda', 'abdomen', 'abdomenBajo', 'senos', 'muslosInt'] }),
  A({ id: 'recorrerLengua', actor: 'lengua', family: 'lengua', name: 'Recorrer con la lengua', verb: 'Recorre', frame: '{V} {M} {ZONE} con la punta de la lengua', intensity: 6, contactType: 'boca', durationType: 'normal',
    levels: { 2: 1.2, 3: 1.5 }, tags: ['movimiento', 'ligero'], zones: ['cuello', 'orejas', 'abdomen', 'abdomenBajo', 'pecho', 'lumbar', 'senos', 'muslosInt', 'pezones'] }),
  A({ id: 'sujetarCaderas', actor: 'manos', manner: 'baja', family: 'presion', name: 'Sujetar las caderas', verb: 'Sujeta', frame: '{V} {M} las caderas de {P} con las dos manos y acércalas a ti', frameP: 'Sujétale {M} las caderas con las dos manos y acércalas a ti', intensity: 5.5, contactType: 'mano', durationType: 'breve',
    levels: { 2: 1.5, 3: 1.2 }, tags: ['presion'], zones: ['caderas'] }),
  A({ id: 'sujetarNuca', actor: 'mano', manner: 'baja', family: 'presion', name: 'Sujetar desde la nuca', verb: 'Sujeta', frame: '{V} {M} el cabello de {P} desde la nuca y acerca su boca a la tuya', frameP: 'Sujétale {M} el cabello desde la nuca y acerca su boca a la tuya', intensity: 6, contactType: 'mano', durationType: 'breve',
    levels: { 2: 1, 3: 1.2 }, tags: ['presion'], zones: ['nuca'] }),
  A({ id: 'manoBajoRopa', actor: 'mano', family: 'ropa', name: 'Mano bajo la ropa', verb: 'Desliza', frame: '{V} {M} la mano por debajo de la ropa hasta llegar a {ZONE}', intensity: 5, contactType: 'mano', durationType: 'normal',
    levels: { 2: 1.5 }, tags: ['movimiento', 'ropa'], concepts: ['anticipacion'], denyMethods: ['unosSegundos', 's20', 's30', 'hastaCambiar', 'buenRato', 'circulos', 'recorrido', 'pequenos'],
    zones: ['abdomen', 'lumbar', 'espalda', 'cintura', 'caderas', 'pecho', 'muslos'] }),
  // --- ampliación: gestos cotidianos de cercanía (Relajado) ---
  A({ id: 'sujetarManos', pattern: 'MUTUAL', actor: 'manos', manner: 'baja', family: 'abrazo', name: 'Sujetar las manos', verb: 'Toma', frame: '{V} {M} las dos manos de {P} entre las tuyas y quédate así un momento', frameP: 'Tómale {M} las dos manos entre las tuyas y quédate así un momento', intensity: 1, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2.5 }, tags: ['quieto'], concepts: ['contacto', 'quieto'], zones: ['manos'], denyMethods: ['muySuave', 'suave', 'moderada', 'quieto', 'unosSegundos', 's10', 's20', 's30'] }),
  A({ id: 'apoyarCabeza', pattern: 'MUTUAL', actor: 'cabeza', manner: 'baja', family: 'abrazo', name: 'Apoyar la cabeza', verb: 'Apoya', frame: '{V} {M} tu cabeza sobre {ZONE} y quédate ahí un momento', intensity: 1.5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 1: 2.5, 2: 0.5 }, tags: ['quieto'], concepts: ['contacto', 'quieto'], zones: ['hombros', 'pecho', 'muslos'], denyMethods: ['muySuave', 'suave', 'moderada', 'quieto', 'unosSegundos'] }),
  A({ id: 'palmasContraPalmas', pattern: 'MUTUAL', actor: 'manos', manner: 'baja', family: 'abrazo', name: 'Palma contra palma', verb: 'Pon', frame: '{V} {M} tus palmas contra las de {P} y empujad un poco, notando la fuerza del otro', frameP: '{V} {M} tus palmas contra las suyas y empujad un poco, notando la fuerza del otro', intensity: 1.5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 1: 2 }, tags: ['quieto', 'presion'], concepts: ['contacto'], zones: ['palmas'], denyMethods: ['muySuave', 'suave', 'moderada', 'firme', 'quieto', 'unosSegundos', 's10'] }),
  A({ id: 'mecer', pattern: 'MUTUAL', actor: 'cuerpo', manner: 'baja', family: 'abrazo', name: 'Mecerse', verb: 'Abraza', frame: '{V} {M} a {P} y meceos de lado a lado, de pie', frameP: 'Abrázale {M} y meceos de lado a lado, de pie', intensity: 1.5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 1: 2 }, tags: ['movimiento'], concepts: ['contacto', 'postura'], zones: ['cintura', 'espalda'], denyMethods: ['circulos', 'recorrido', 'pequenos', 'firme', 'moderada', 'muySuave', 'suave', 'constante', 'variable', 'impredecible', 'gradual', 'empezarSuave', 'pausaContacto', 'acelerando', 'unSoloDedo', 'conLaPalma', 'dorsoMano', 'apenasRozando', 'alternandoLados'] }),
  A({ id: 'tamborilear', actor: 'dedos', family: 'caricia', name: 'Tamborilear', verb: 'Tamborilea', frame: '{V} {M} con los dedos sobre {ZONE}, como si tocaras el piano', intensity: 2.5, contactType: 'mano', durationType: 'normal',
    levels: { 1: 2, 2: 0.6 }, tags: ['movimiento', 'ligero', 'repetido', 'dedos'], denyMethods: ['recorrido', 'circulos', 'quieto'],
    zones: ['espalda', 'brazos', 'muslos', 'abdomen', 'pecho', 'hombros', 'manos', 'lumbar'] }),
  A({ id: 'trazarNombre', actor: 'dedo', family: 'caricia', name: 'Escribir con el dedo', verb: 'Escribe', frame: '{V} {M} tu nombre con un dedo sobre {ZONE} y que {P} lo adivine', frameP: '{V} {M} tu nombre con un dedo sobre {ZONE} y que lo adivine', intensity: 2.5, contactType: 'mano', durationType: 'normal',
    levels: { 1: 2.5, 2: 1 }, tags: ['movimiento', 'ligero', 'dedos'], concepts: ['ligero', 'juego'], denyMethods: ['circulos', 'pequenos', 'recorrido', 'quieto', 'constante', 'variable', 's10', 's20', 's30', 'buenRato', 'unosSegundos', 'hastaCambiar', 'contandoDiez', 'tresVeces', 'alCompas', 'pausado', 'acelerando', 'gradual', 'impredecible', 'pausaContacto'],
    zones: ['espalda', 'brazos', 'muslos', 'abdomen', 'palmas', 'pecho', 'lumbar'] }),
  A({ id: 'recorrerContorno', actor: 'dedo', family: 'caricia', name: 'Recorrer el contorno', verb: 'Recorre', frame: '{V} {M} el contorno de {ZONE} con un solo dedo', intensity: 3, contactType: 'mano', durationType: 'normal',
    levels: { 1: 1.5, 2: 2, 3: 0.5 }, tags: ['movimiento', 'ligero', 'dedos'], concepts: ['ligero'], denyMethods: ['circulos', 'pequenos', 'recorrido', 'constante', 'variable', 'impredecible', 'acelerando'],
    zones: ['rostro', 'labios', 'orejas', 'manos', 'hombros', 'cintura', 'caderas', 'senos', 'muslos', 'clavicula', 'munecas'] }),
  A({ id: 'besarDetrasOreja', actor: 'labios', manner: 'baja', family: 'beso', name: 'Besar detrás de la oreja', verb: 'Besa', frame: '{V} {M} a {P} justo detrás de la oreja', frameP: 'Bésale {M} justo detrás de la oreja', intensity: 4, contactType: 'boca', durationType: 'breve',
    levels: { 1: 0.6, 2: 2, 3: 0.4 }, tags: ['repetido'], zones: ['orejas'], denyMethods: ['lento', 'muyLento', 'recorrido', 'constante', 'circulos', 'pequenos', 'buenRato', 's20', 's30', 'hastaCambiar'] }),
  A({ id: 'recorrerNariz', actor: 'nariz', family: 'anticipacion', name: 'Recorrer con la nariz', verb: 'Recorre', frame: '{V} {M} {ZONE} con la punta de la nariz, apenas tocando', intensity: 4.5, contactType: 'cuerpo', durationType: 'normal',
    levels: { 2: 1.8, 3: 0.4 }, tags: ['movimiento', 'ligero'], concepts: ['ligero', 'cerca'], denyMethods: ['circulos', 'pequenos', 'firme', 'moderada'],
    zones: ['cuello', 'nuca', 'hombros', 'clavicula', 'abdomen', 'espalda', 'muslosInt', 'senos', 'costados'] }),
  // --- ampliación: tensión (Sensual) ---
  A({ id: 'manoQueSube', actor: 'mano', manner: 'baja', family: 'anticipacion', name: 'Mano que sube', verb: 'Apoya', frame: '{V} la mano sobre {ZONE} y súbela unos centímetros, muy despacio', intensity: 5.5, contactType: 'mano', durationType: 'breve',
    levels: { 2: 2, 3: 0.8 }, tags: ['anticipacion'], concepts: ['anticipacion', 'lento'], zones: ['muslos', 'muslosInt', 'abdomen', 'abdomenBajo'],
    denyMethods: ['lento', 'muyLento', 'pausado', 'constante', 'variable', 'circulos', 'recorrido', 'pequenos', 'unosSegundos', 's10', 's20', 's30', 'hastaCambiar', 'buenRato', 'impredecible', 'gradual', 'empezarSuave', 'pausaContacto', 'acelerando', 'alternandoLados', 'cadaVezMasCerca'] }),
  A({ id: 'atraparLabio', actor: 'labios', manner: 'baja', family: 'mordisco', name: 'Atrapar el labio', verb: 'Atrapa', frame: '{V} {M} el labio inferior de {P} entre los tuyos', frameP: 'Atrápale {M} el labio inferior entre los tuyos', intensity: 5.5, contactType: 'boca', durationType: 'breve',
    levels: { 2: 1.5, 3: 0.6 }, tags: ['repetido'], zones: ['labios'], denyMethods: ['lento', 'muyLento', 'recorrido', 'constante', 'circulos', 'pequenos', 'buenRato', 's20', 's30', 'hastaCambiar', 'variable', 'impredecible', 'gradual', 'acelerando', 'pausaContacto'] }),
  A({ id: 'besoProfundo', actor: 'labios', manner: 'baja', family: 'beso', name: 'Beso profundo', verb: 'Besa', frame: '{V} {M} a {P} en la boca, despacio y profundo', frameP: 'Bésale {M} en la boca, despacio y profundo', intensity: 6, contactType: 'boca', durationType: 'normal',
    levels: { 2: 1.5, 3: 1 }, tags: ['movimiento'], concepts: ['lento'], zones: ['labios'], denyMethods: ['lento', 'muyLento', 'recorrido', 'circulos', 'pequenos', 'constante', 'alternandoLados', 'unSoloDedo', 'conLaPalma', 'dorsoMano', 'apenasRozando', 'muySuave', 'suave'] }),
  A({ id: 'puntaLengua', actor: 'lengua', family: 'lengua', name: 'Rozar con la lengua', verb: 'Roza', frame: '{V} {M} {ZONE} con la punta de la lengua', intensity: 6, contactType: 'boca', durationType: 'breve',
    levels: { 2: 1, 3: 1 }, tags: ['movimiento', 'ligero'], concepts: ['ligero'], zones: ['labios', 'orejas', 'cuello', 'pezones', 'clavicula'], denyMethods: ['recorrido', 'buenRato', 's20', 's30', 'hastaCambiar'] }),
  A({ id: 'besarSuccion', actor: 'labios', family: 'beso', name: 'Besar succionando', verb: 'Besa', frame: '{V} {M} {ZONE} succionando un poco la piel', intensity: 6, contactType: 'boca', durationType: 'breve',
    levels: { 2: 1.2, 3: 1 }, tags: ['repetido', 'presion'], denyMethods: ['recorrido', 'circulos', 'pequenos', 'lento', 'muyLento', 'constante', 'buenRato', 's20', 's30'],
    zones: ['cuello', 'hombros', 'clavicula', 'pecho', 'senos', 'muslosInt', 'abdomenBajo', 'costados'] }),
  A({ id: 'desabrochar', actor: 'manos', manner: 'baja', family: 'ropa', name: 'Desabrochar', verb: 'Desabrocha', frame: '{V} {M} un botón o baja un poco la ropa de {ZONE}, sin llegar a quitarla', intensity: 5.5, contactType: 'mano', durationType: 'breve',
    levels: { 2: 1.2, 3: 0.5 }, tags: ['anticipacion', 'ropa'], concepts: ['anticipacion'], denyMethods: ['unosSegundos', 's10', 's20', 's30', 'hastaCambiar', 'buenRato', 'circulos', 'recorrido', 'pequenos', 'gradual', 'acelerando', 'alternandoLados', 'conLaPalma', 'dorsoMano', 'unSoloDedo'],
    zones: ['pecho', 'senos', 'abdomen', 'caderas', 'cintura', 'muslos'] }),
  A({ id: 'sentarseEncima', pattern: 'MUTUAL', actor: 'cuerpo', manner: 'baja', family: 'cuerpo', name: 'Sentarse encima', verb: 'Siéntate', frame: '{V} {M} sobre {ZONE}, de frente', intensity: 6, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 2: 1, 3: 1 }, tags: ['quieto'], concepts: ['contacto', 'postura'], zones: ['muslos'], denyMethods: ['muySuave', 'suave', 'moderada', 'firme', 'quieto', 'unosSegundos', 's10'] }),
  // --- ampliación: Atrevido ---
  A({ id: 'sujetarMunecas', actor: 'mano', manner: 'baja', family: 'presion', name: 'Sujetar las muñecas', verb: 'Sujeta', frame: '{V} {M} las muñecas de {P} con una mano y mantenlas quietas un momento', frameP: 'Sujétale {M} las muñecas con una mano y mantenlas quietas un momento', intensity: 6.5, contactType: 'mano', durationType: 'breve',
    levels: { 2: 0.5, 3: 1.5 }, tags: ['presion'], concepts: ['quietoP'], zones: ['munecas'], denyMethods: ['lento', 'muyLento', 'pausado', 'constante', 'variable', 'circulos', 'recorrido', 'pequenos', 'quieto', 'buenRato', 's20', 's30', 'hastaCambiar', 'gradual', 'acelerando', 'pausaContacto', 'impredecible', 'empezarSuave', 'muySuave', 'suave', 'alternandoLados', 'conLaPalma', 'dorsoMano', 'unSoloDedo', 'apenasRozando'] }),
  A({ id: 'manoEntreMuslos', actor: 'mano', manner: 'baja', family: 'anticipacion', name: 'Mano entre los muslos', verb: 'Desliza', frame: '{V} {M} la mano entre los muslos de {P} y déjala quieta ahí', frameP: '{V} {M} la mano entre sus muslos y déjala quieta ahí', intensity: 7, contactType: 'mano', durationType: 'breve',
    levels: { 2: 0.4, 3: 1 }, tags: ['anticipacion'], concepts: ['anticipacion', 'quieto'], zones: ['muslosInt'],
    denyMethods: ['quieto', 'unosSegundos', 's10', 's20', 's30', 'hastaCambiar', 'buenRato', 'circulos', 'recorrido', 'pequenos', 'constante', 'variable', 'gradual', 'acelerando', 'pausaContacto', 'impredecible', 'empezarSuave', 'alternandoLados', 'conLaPalma', 'dorsoMano', 'unSoloDedo', 'apenasRozando', 'cadaVezMasCerca'] }),
  A({ id: 'frotarEntrepierna', actor: 'palma', family: 'manoIntima', name: 'Frotar con la palma', verb: 'Frota', frame: '{V} {M} {ZONE} con la palma de la mano, por encima de la ropa', intensity: 7, contactType: 'mano', durationType: 'normal',
    levels: { 2: 0.3, 3: 1.5 }, tags: ['movimiento', 'presion', 'ropa'], zones: ['entrepierna'], denyMethods: ['unSoloDedo', 'conLaPalma', 'dorsoMano', 'apenasRozando', 'pequenos', 'alternandoLados'] }),
  A({ id: 'rodearConPiernas', pattern: 'MUTUAL', actor: 'piernas', manner: 'baja', family: 'cuerpo', name: 'Rodear con las piernas', verb: 'Rodea', frame: '{V} {M} la cintura de {P} con tus piernas y acércale a ti', frameP: 'Rodéale {M} la cintura con tus piernas y acércale a ti', intensity: 6.5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 2: 0.5, 3: 1.2 }, tags: ['quieto'], concepts: ['contacto', 'postura'], zones: ['cintura'], denyMethods: ['muySuave', 'suave', 'moderada', 'firme', 'quieto', 'unosSegundos', 's10'] }),
  A({ id: 'pesoEncima', pattern: 'MUTUAL', actor: 'cuerpo', manner: 'baja', family: 'cuerpo', name: 'Apoyar el peso', verb: 'Apoya', frame: '{V} {M} todo tu peso sobre {ZONE}, tumbados, y quédate así un momento', intensity: 6, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 2: 0.8, 3: 1.2 }, tags: ['quieto'], concepts: ['contacto', 'postura', 'quieto'], zones: ['pecho', 'espalda'], denyMethods: ['muySuave', 'suave', 'moderada', 'firme', 'quieto', 'unosSegundos', 's10'] }),
];
export const ACTION = Object.fromEntries(ACTIONS.map(a => [a.id, a]));
/* zonas nuevas que entran en acciones existentes (solo donde el gesto tiene sentido físico) */
const EXTRA_ZONES = {
  acariciar: ['clavicula', 'sienes', 'munecas', 'palmas', 'costados', 'rodillas', 'tobillos', 'ingles'],
  masajear: ['palmas', 'tobillos', 'costados', 'munecas'],
  rozar: ['clavicula', 'munecas', 'costados', 'rodillas', 'ingles', 'sienes'],
  recorrerDedos: ['clavicula', 'costados', 'munecas', 'ingles', 'rodillas'],
  besar: ['clavicula', 'munecas', 'costados', 'ingles', 'sienes'],
  besitos: ['clavicula', 'costados', 'ingles'],
  recorrerLabios: ['clavicula', 'costados', 'ingles'],
  rozarLabios: ['clavicula', 'munecas', 'ingles'],
  lamer: ['ingles'],
  mordisquear: ['clavicula', 'ingles'],
  soplar: ['clavicula', 'costados'],
  unas: ['costados'],
  dibujar: ['palmas'],
  apoyarMano: ['costados'],
  recorrerLengua: ['clavicula', 'costados', 'ingles'],
  pulgares: ['palmas', 'tobillos', 'sienes'],
  manosCalientes: ['costados'],
  apretar: ['cintura', 'costados'],
  acercarse: ['ingles', 'clavicula'],
  respirarCerca: ['ingles', 'clavicula'],
};
for (const [id, zs] of Object.entries(EXTRA_ZONES)) ACTION[id].zones.push(...zs);
/* acciones cuya frase ya nombra los dedos: no admiten formas que digan con qué parte de la mano */
['rozar', 'recorrerDedos', 'dibujar', 'unas', 'pulgares', 'estimularDedos', 'introducirDedo', 'peinar', 'masajeCabeza', 'jugarCabello', 'masturbar'].forEach(id => ACTION[id].tags.push('dedos'));
/* «apenas rozando la piel» no cabe en gestos de boca intensa, de presión ni en el cabello */
['chupar', 'estimularBoca', 'estimularDedos', 'masturbar', 'introducirDedo', 'frotarCaderasDetras', 'frotarCaderasFrente', 'frotarPecho', 'deslizarMuslo', 'jugarCabello', 'peinar', 'masajeCabeza', 'masajear', 'pulgares', 'apretar', 'lamer', 'mordisquear', 'besarSuccion', 'nalgada', 'atraparLabio', 'besoProfundo', 'sujetarCaderas', 'sujetarNuca', 'sujetarMunecas'].forEach(id => ACTION[id].denyMethods.push('apenasRozando'));
/* «solo durante unos segundos» no cabe en estimulación íntima: corta lo que debería continuar */
['chupar', 'estimularBoca', 'estimularDedos', 'masturbar', 'introducirDedo', 'lamer'].forEach(id => ACTION[id].denyMethods.push('unosSegundos', 's10'));

/* FORMAS (el tercer dado). Internamente cinco dimensiones; el dado elige UNA forma apropiada para la acción.
   pos: adv (junto al verbo) · phrase (después de la zona) · end (al final de la frase)
   needs / deny: tags de la acción · zoneNeeds: tags de la zona · concepts: para redundancias */
const M = (o) => { const m = Object.assign({ needs: [], deny: [], zoneNeeds: [], concepts: [], denyContact: [] }, o); m.levels = expand(m.levels); return m; };
export const METHODS = [
  // ritmo
  M({ id: 'lento', dim: 'ritmo', text: 'lentamente', pos: 'adv', mod: 0.3, levels: { 1: 3, 2: 3, 3: 2 }, needs: ['movimiento'], concepts: ['lento'] }),
  M({ id: 'muyLento', dim: 'ritmo', text: 'muy lentamente', pos: 'adv', mod: 0.5, levels: { 2: 2, 3: 2 }, needs: ['movimiento'], concepts: ['lento'] }),
  M({ id: 'pausado', dim: 'ritmo', text: 'con pequeñas pausas', pos: 'phrase', mod: 0.3, levels: { 1: 2, 2: 2, 3: 1 }, needs: ['movimiento'], deny: ['ropa'], concepts: ['pausa'] }),
  M({ id: 'constante', dim: 'ritmo', text: 'a un ritmo constante', pos: 'phrase', mod: 0, levels: { 1: 1, 2: 2, 3: 2 }, needs: ['movimiento'], deny: ['repetido', 'anticipacion', 'ropa'] }),
  M({ id: 'variable', dim: 'ritmo', text: 'variando el ritmo', pos: 'phrase', mod: 0.6, levels: { 2: 1.5, 3: 2.5 }, needs: ['movimiento'], deny: ['anticipacion', 'ropa'], concepts: ['variable'] }),
  // presión
  M({ id: 'muySuave', dim: 'presion', text: 'muy suavemente', pos: 'adv', mod: -0.5, levels: { 1: 3, 2: 2, 3: 1 }, denyContact: ['ninguno'], deny: ['anticipacion'], concepts: ['ligero'] }),
  M({ id: 'suave', dim: 'presion', text: 'suavemente', pos: 'adv', mod: -0.3, levels: { 1: 3, 2: 2, 3: 1.2 }, denyContact: ['ninguno'], deny: ['anticipacion'], concepts: ['ligero'] }),
  M({ id: 'moderada', dim: 'presion', text: 'con una presión moderada', pos: 'phrase', mod: 0.3, levels: { 1: 2, 2: 1.5, 3: 1 }, needs: ['presion'] }),
  M({ id: 'firme', dim: 'presion', text: 'con firmeza', pos: 'phrase', mod: 0.6, levels: { 2: 1, 3: 2 }, needs: ['presion'] }),
  // movimiento
  M({ id: 'circulos', dim: 'movimiento', text: 'en pequeños círculos', pos: 'phrase', mod: 0.3, levels: { 1: 2, 2: 2, 3: 2 }, needs: ['circular'], concepts: ['circulos'] }),
  M({ id: 'recorrido', dim: 'movimiento', text: 'de arriba abajo, sin prisa', pos: 'phrase', mod: 0.3, levels: { 1: 2, 2: 2, 3: 1.5 }, needs: ['movimiento'], deny: ['repetido', 'anticipacion'], zoneNeeds: ['largo'], concepts: ['lento', 'recorrido'] }),
  M({ id: 'quieto', dim: 'movimiento', text: 'sin moverte', pos: 'phrase', mod: 0, levels: { 1: 2, 2: 1.5, 3: 0.5 }, needs: ['quieto'], concepts: ['quieto'] }),
  M({ id: 'pequenos', dim: 'movimiento', text: 'con movimientos muy pequeños', pos: 'phrase', mod: 0.2, levels: { 1: 2, 2: 2, 3: 1.5 }, needs: ['movimiento'], deny: ['repetido', 'anticipacion', 'ropa'] }),
  // duración
  M({ id: 'unosSegundos', dim: 'duracion', text: 'solo durante unos segundos', pos: 'end', mod: -0.5, levels: { 1: 2, 2: 1.5, 3: 0.8 }, concepts: ['duracion'] }),
  M({ id: 's20', dim: 'duracion', text: 'durante 20 segundos', pos: 'end', mod: 0, levels: { 1: 2, 2: 2, 3: 1 }, seconds: 20, concepts: ['duracion'] }),
  M({ id: 's30', dim: 'duracion', text: 'durante 30 segundos', pos: 'end', mod: 0.3, levels: { 1: 1.5, 2: 2, 3: 1.5 }, seconds: 30, concepts: ['duracion'] }),
  M({ id: 'hastaCambiar', dim: 'duracion', text: 'hasta que {P} te pida cambiar', pos: 'end', mod: 0.7, levels: { 2: 2, 3: 2.5 }, concepts: ['duracion', 'control'] }),
  M({ id: 'buenRato', dim: 'duracion', text: 'durante un buen rato', pos: 'end', mod: 0.5, levels: { 1: 2, 2: 1.5, 3: 1 }, needsDuration: 'sostenible', concepts: ['duracion'] }),
  // dinámica
  M({ id: 'impredecible', dim: 'dinamica', text: 'de forma impredecible', pos: 'phrase', mod: 0.6, levels: { 2: 1, 3: 2 }, needs: ['movimiento'], deny: ['anticipacion', 'ropa'], concepts: ['variable'] }),
  M({ id: 'gradual', dim: 'dinamica', text: 'empezando apenas y aumentando poco a poco', pos: 'phrase', mod: 0.7, levels: { 2: 1.5, 3: 2.5 }, needs: ['movimiento'], deny: ['anticipacion', 'repetido', 'ropa'], concepts: ['gradual'] }),
  M({ id: 'empezarSuave', dim: 'dinamica', text: 'empezando muy suave', pos: 'phrase', mod: 0.2, levels: { 1: 1, 2: 1.5, 3: 1 }, needs: ['movimiento'], deny: ['ligero', 'anticipacion', 'ropa'], concepts: ['gradual', 'ligero'] }),
  M({ id: 'pausaContacto', dim: 'dinamica', text: 'alternando pausas y contacto', pos: 'phrase', mod: 0.5, levels: { 2: 1.5, 3: 1.5 }, needs: ['movimiento'], deny: ['anticipacion', 'ropa'], concepts: ['pausa'] }),
  // --- ampliación ---
  M({ id: 'acelerando', dim: 'dinamica', text: 'empezando despacio y acelerando poco a poco', pos: 'phrase', mod: 0.7, levels: { 2: 0.8, 3: 2 }, needs: ['movimiento'], deny: ['anticipacion', 'repetido', 'ropa', 'quieto'], concepts: ['gradual', 'variable', 'lento'] }),
  M({ id: 'cadaVezMasCerca', dim: 'dinamica', text: 'acercándote un poco más cada vez', pos: 'phrase', mod: 0.4, levels: { 2: 1.5, 3: 1.2 }, needs: ['anticipacion'], deny: ['ropa'], concepts: ['gradual'] }),
  M({ id: 'alCompas', dim: 'ritmo', text: 'al ritmo de vuestra respiración', pos: 'phrase', mod: 0.2, levels: { 1: 1.5, 2: 1.5, 3: 0.6 }, needs: ['movimiento'], deny: ['repetido', 'anticipacion', 'ropa'], concepts: ['aliento', 'lento'] }),
  M({ id: 'apenasRozando', dim: 'presion', text: 'apenas rozando la piel', pos: 'phrase', mod: -0.4, levels: { 1: 2, 2: 2, 3: 1 }, needs: ['movimiento'], deny: ['ligero', 'presion', 'anticipacion', 'ropa'], denyContact: ['ninguno'], concepts: ['ligero'] }),
  M({ id: 'conLaPalma', dim: 'movimiento', text: 'con la palma abierta', pos: 'phrase', mod: 0, levels: { 1: 2, 2: 1.5, 3: 1 }, needs: ['movimiento'], deny: ['dedos', 'anticipacion', 'ropa', 'repetido'], denyContact: ['boca', 'ninguno', 'cuerpo'], concepts: ['palma'] }),
  M({ id: 'dorsoMano', dim: 'movimiento', text: 'con el dorso de la mano', pos: 'phrase', mod: -0.2, levels: { 1: 2, 2: 1.5, 3: 0.5 }, needs: ['movimiento'], deny: ['dedos', 'anticipacion', 'ropa', 'presion', 'repetido'], denyContact: ['boca', 'ninguno', 'cuerpo'], concepts: ['palma'] }),
  M({ id: 'unSoloDedo', dim: 'movimiento', text: 'con un solo dedo', pos: 'phrase', mod: 0.1, levels: { 1: 1.5, 2: 2, 3: 1 }, needs: ['movimiento', 'ligero'], deny: ['dedos', 'presion', 'ropa', 'anticipacion', 'repetido'], denyContact: ['boca', 'ninguno', 'cuerpo'], concepts: ['palma'] }),
  M({ id: 'alternandoLados', dim: 'movimiento', text: 'alternando un lado y otro', pos: 'phrase', mod: 0.2, levels: { 1: 1, 2: 1.5, 3: 1 }, needs: ['movimiento'], deny: ['anticipacion', 'ropa', 'quieto'], zoneNeeds: ['par'], concepts: ['lados'] }),
  M({ id: 's10', dim: 'duracion', text: 'durante 10 segundos', pos: 'end', mod: -0.2, levels: { 1: 2, 2: 1.5, 3: 1 }, seconds: 10, concepts: ['duracion'] }),
  M({ id: 'tresVeces', dim: 'duracion', text: 'tres veces seguidas', pos: 'end', mod: 0, levels: { 1: 1.5, 2: 1.5, 3: 1 }, needs: ['repetido'], concepts: ['duracion'] }),
  M({ id: 'contandoDiez', dim: 'duracion', text: 'contando hasta diez en voz baja', pos: 'end', mod: 0, levels: { 1: 1.5, 2: 1 }, deny: ['voz'], denyContact: ['boca'], concepts: ['duracion', 'voz'] }),
];
export const METHOD = Object.fromEntries(METHODS.map(m => [m.id, m]));

/* CONDICIONES (el cuarto dado). slot decide la estructura de la frase:
   tail (al final) · intro (abre la frase) · prep (preparación: postura, pausa) · antic (acercarse primero)
   after (frase posterior) · choice (elección) · path (empezar por otra zona) · swap (cambia quién lo hace)
   needsZoneTags / denyActionTags / needsActionTags / denyContact / denyDims (dimensiones de forma incompatibles)
   role: interaccion (cambia la dinámica entre los dos) · escena (postura o preparación) · conexion · atmosfera (decorativa)
   aporta: cuánto aporta la condición a ESTA acción/zona. base × multiplicadores por tag de acción, tag de zona, tipo de contacto
   y duración (zoneElse se aplica si ningún tag de zona coincide). Por debajo de 0.45 la condición no entra: sería relleno. */
const C = (o) => { const c = Object.assign({ needsZoneTags: [], denyZoneTags: [], denyActionTags: [], needsActionTags: [], denyContact: [], denyDims: [], concepts: [], mod: 0 }, o); c.levels = expand(c.levels); if (!c.pattern) c.pattern = c.family === 'control' ? 'CHOOSE' : c.role === 'interaccion' ? 'GUIDE' : null; return c; };
export const CONDITIONS = [
  C({ id: 'mirandose', family: 'vista', role: 'conexion', aporta: { base: 1.1, contact: { mano: .6, boca: .9 }, action: { quieto: 1.3, movimiento: .7, ligero: .8, repetido: .6 }, zone: { sensible: 1 } }, short: 'Mirándoos', slot: 'tail', text: 'mirándoos a los ojos', textBoca: 'sin dejar de mirarle a los ojos', intro: 'Mirándoos a los ojos,', mod: 0.4, levels: { 1: 2.5, 2: 2, 3: 1.8 }, needsZoneTags: ['frontal'], denyZoneTags: ['detras'], concepts: ['mirada'] }),
  C({ id: 'ojosCerrados', family: 'vista', role: 'atmosfera', aporta: { base: .8, action: { ligero: 1.2, anticipacion: 1.2, movimiento: .8, quieto: .4, presion: .5 }, zone: { sensible: 1.2 }, zoneElse: .5, contact: { cuerpo: .4 } }, short: 'Ojos cerrados', slot: 'tail', text: 'mientras {P} mantiene los ojos cerrados', intro: 'Con los ojos cerrados de {P},', mod: 0.3, levels: { 1: 1, 2: 1.2, 3: 0.8 }, concepts: ['ojos'] }),
  C({ id: 'sinHablar', family: 'voz', role: 'atmosfera', aporta: { base: .7, contact: { cuerpo: 1.2, mano: .7, boca: .5 }, action: { quieto: 1.3, movimiento: .6 }, duration: { sostenible: 1.2, breve: .6 } }, short: 'Sin hablar', slot: 'intro', text: 'Sin hablar,', mod: 0.2, levels: { 1: 1.5, 2: 2.5, 3: 1.5 }, denyActionTags: ['voz'], concepts: ['voz'] }),
  C({ id: 'respirarJuntos', family: 'cercania', role: 'conexion', aporta: { base: .9, contact: { cuerpo: 1.2, mano: .8 }, action: { quieto: 1.3, movimiento: .4 } }, short: 'Respirar juntos', slot: 'tail', text: 'respirando los dos al mismo ritmo', mod: 0.2, levels: { 1: 2.5, 2: 1 }, needsDuration: ['sostenible'], denyContact: ['ninguno'], concepts: ['aliento'] }),
  C({ id: 'detras', family: 'postura', role: 'escena', aporta: { base: .95, contact: { boca: .9 } }, short: 'Desde atrás', slot: 'prep', text: 'Ponte detrás de {P} y', mod: 0, levels: { 1: 2, 2: 1.5, 3: 1 }, needsZoneTags: ['detras'], concepts: ['postura'] }),
  C({ id: 'tumbados', family: 'postura', role: 'escena', aporta: { base: 1, duration: { breve: .5 }, contact: { ninguno: .7 } }, short: 'Tumbados', slot: 'prep', text: 'Pide a {P} que se tumbe y', mod: 0.1, levels: { 1: 1.5, 2: 2, 3: 2 }, needsZoneTags: ['tumbado'], concepts: ['postura'] }),
  C({ id: 'frenteAFrente', family: 'postura', role: 'escena', aporta: { base: .85, action: { quieto: 1.3, movimiento: .8 }, contact: { boca: .6 } }, short: 'Frente a frente', slot: 'prep', text: 'Sentaos frente a frente y', mod: 0, levels: { 1: 2, 2: 1.5 }, needsZoneTags: ['frontal'], denyZoneTags: ['intimo'], concepts: ['postura'] }),
  C({ id: 'parejaCambia', family: 'control', role: 'interaccion', aporta: { base: .8, duration: { breve: 0, sostenible: 1.1 }, action: { repetido: .7 } }, short: 'Pareja decide', slot: 'end', text: 'hasta que {P} decida que cambies', mod: 0.4, levels: { 2: 2, 3: 2 }, denyDims: ['duracion'], denyContact: ['ninguno'], concepts: ['control', 'duracion'] }),
  C({ id: 'parejaQuieta', family: 'quietud', role: 'interaccion', aporta: { base: .8, zone: { sensible: 1.2, intimo: 1.2 }, zoneElse: .3, action: { ligero: 1.2, anticipacion: 1.1, presion: .3 }, contact: { boca: 1.1, mano: .7 } }, short: 'Pareja quieta', slot: 'tail', text: 'sin que {P} se mueva', intro: 'Sin que {P} se mueva,', mod: 0.3, levels: { 2: 1, 3: 2 }, denyActionTags: ['quieto'], concepts: ['quietoP'] }),
  C({ id: 'vendados', family: 'vista', role: 'interaccion', aporta: { base: .9, action: { ligero: 1.1, anticipacion: 1.1, quieto: .4 }, zone: { sensible: 1.1 }, zoneElse: .7 }, short: 'Ojos vendados', slot: 'tail', text: 'mientras {P} tiene los ojos vendados', intro: 'Con los ojos vendados de {P},', mod: 0.5, levels: { 3: 2 }, concepts: ['ojos'] }),
  C({ id: 'manosQuietas', family: 'quietud', role: 'interaccion', aporta: { base: .8, zone: { sensible: 1.1, intimo: 1.2 }, zoneElse: .3, contact: { boca: 1.1, mano: .5, ninguno: .5 }, action: { quieto: .3, presion: .3 } }, short: 'Manos quietas', slot: 'tail', text: 'mientras {P} mantiene las manos quietas', intro: 'Con las manos de {P} quietas,', mod: 0.3, levels: { 2: 1, 3: 2 }, concepts: ['quietoP'] }),
  C({ id: 'parejaRitmo', family: 'control', role: 'interaccion', aporta: { base: .85, duration: { breve: 0 }, action: { presion: .7 } }, short: 'Pareja marca ritmo', slot: 'tail', text: 'dejando que {P} marque el ritmo', intro: 'Dejando que {P} marque el ritmo,', mod: 0.4, levels: { 2: 1, 3: 2 }, denyDims: ['ritmo', 'dinamica', 'duracion'], denyActionTags: ['quieto', 'anticipacion', 'repetido'], concepts: ['control'] }),
  C({ id: 'hastaPidaMas', family: 'control', role: 'interaccion', aporta: { base: .9, duration: { breve: 0 } }, short: 'Hasta pedir más', slot: 'end', text: 'hasta que {P} pida más', mod: 0.9, levels: { 3: 2.5 }, denyDims: ['duracion'], denyContact: ['ninguno'], denyActionTags: ['repetido'], concepts: ['control', 'duracion'] }),
  C({ id: 'enVozAlta', family: 'voz', role: 'interaccion', aporta: { base: .9, zone: { sensible: 1.2 }, zoneElse: .6, action: { quieto: .5 } }, short: 'Decir lo que siente', slot: 'tail', text: 'mientras {P} dice en voz alta lo que siente', intro: 'Mientras {P} dice en voz alta lo que siente,', mod: 0.6, levels: { 3: 2 }, denyActionTags: ['voz'], concepts: ['voz'] }),
  C({ id: 'esperar', family: 'pausa', role: 'escena', aporta: { base: .8, contact: { ninguno: 1.1, mano: .8, boca: .9 }, action: { ropa: .7 } }, short: 'Espera 5 s', slot: 'after', text: 'Quédate así cinco segundos antes de continuar.', mod: 0.4, levels: { 2: 1.5, 3: 1.5 }, needsActionTags: ['anticipacion'], denyDims: ['duracion'], concepts: ['espera', 'duracion'] }),
  // --- ampliación: ambiente, juego y voz. (Las condiciones que añadían una segunda zona se retiraron: la condición modifica la acción, no abre otra.) ---
  C({ id: 'musica', family: 'ambiente', role: 'atmosfera', aporta: { base: .75, duration: { sostenible: 1.3, breve: .5 }, contact: { ninguno: .6 } }, short: 'Con música', slot: 'intro', text: 'Con una canción que elija {P} de fondo,', mod: 0.1, levels: { 1: 1.2, 2: 1.2, 3: 0.6 }, concepts: ['musica'] }),
  C({ id: 'luzApagada', family: 'vista', role: 'atmosfera', aporta: { base: .8, action: { ligero: 1.2, anticipacion: 1.2, quieto: .6, presion: .7 }, zone: { sensible: 1.2 }, zoneElse: .7 }, short: 'A oscuras', slot: 'intro', text: 'Con la luz apagada,', mod: 0.3, levels: { 1: 0.8, 2: 1.5, 3: 1.2 }, concepts: ['ojos'] }),
  C({ id: 'adivinarDonde', family: 'juego', role: 'interaccion', aporta: { base: .75, zone: { largo: 1.3 }, zoneElse: .6, action: { quieto: .4, movimiento: 1.1, anticipacion: .5 } }, short: 'Adivinar dónde', slot: 'after', text: 'Con los ojos cerrados, {P} tiene que decir en qué punto exacto has empezado.', mod: 0.3, levels: { 1: 1.5, 2: 1.5, 3: 0.8 }, denyContact: ['ninguno'], denyActionTags: ['voz', 'ropa', 'anticipacion', 'quieto'], concepts: ['ojos', 'juego'] }),
  C({ id: 'contarTres', family: 'pausa', role: 'escena', aporta: { base: .7, duration: { breve: 1.2, sostenible: .6 } }, short: 'Cuenta hasta tres', slot: 'prep', text: 'Cuenta hasta tres en voz alta y', mod: 0.2, levels: { 2: 1.5, 3: 1.2 }, needsActionTags: ['anticipacion', 'presion'], denyActionTags: ['voz'], concepts: ['espera', 'voz'] }),
  C({ id: 'parejaGuia', family: 'control', role: 'interaccion', aporta: { base: .85, action: { presion: .6, repetido: .6 } }, short: 'Pareja guía', slot: 'tail', text: 'dejando que la mano de {P} guíe la tuya', intro: 'Dejando que la mano de {P} guíe la tuya,', mod: 0.3, levels: { 1: 1, 2: 2, 3: 1.2 }, needsContact: ['mano'], denyActionTags: ['quieto', 'anticipacion', 'ropa'], concepts: ['control'] }),
  C({ id: 'sinManos', family: 'quietud', role: 'interaccion', aporta: { base: .8, action: { quieto: .5 } }, short: 'Sin usar las manos', slot: 'tail', text: 'sin usar las manos', mod: 0.3, levels: { 2: 1.5, 3: 1.5 }, needsContact: ['boca', 'cuerpo'], concepts: ['manos'] }),
  C({ id: 'describir', family: 'voz', role: 'interaccion', aporta: { base: .85, action: { quieto: 1.1 }, duration: { breve: .5 } }, short: 'Decir lo que viene', slot: 'tail', text: 'mientras le describes en voz baja lo que vas a hacer después', mod: 0.5, levels: { 2: 1.2, 3: 1.8 }, denyActionTags: ['voz'], denyContact: ['boca'], concepts: ['voz'] }),
  C({ id: 'parejaCuenta', family: 'voz', role: 'interaccion', aporta: { base: .7, duration: { breve: .4 } }, short: 'Pareja cuenta', slot: 'tail', text: 'mientras {P} cuenta en voz alta hasta veinte', mod: 0.1, levels: { 1: 1.5, 2: 1 }, denyDims: ['duracion'], denyActionTags: ['voz'], concepts: ['duracion', 'voz'] }),
];
/* Niveles de condición. LIGHT: matiz pequeño que no altera la escena · INTERACTION: cambia cómo se hace ·
   SETUP: necesita preparación, accesorio, postura o cambio de contexto; solo entra en blueprints diseñados para ella. */
const COND_TIER = {
  mirandose: 'LIGHT', ojosCerrados: 'LIGHT', sinHablar: 'LIGHT', respirarJuntos: 'LIGHT',
  parejaCambia: 'INTERACTION', parejaQuieta: 'INTERACTION', manosQuietas: 'INTERACTION', parejaRitmo: 'INTERACTION', hastaPidaMas: 'INTERACTION', enVozAlta: 'INTERACTION',
  esperar: 'INTERACTION', contarTres: 'INTERACTION', parejaGuia: 'INTERACTION', sinManos: 'INTERACTION', describir: 'INTERACTION', parejaCuenta: 'INTERACTION', adivinarDonde: 'INTERACTION',
  vendados: 'SETUP', musica: 'SETUP', luzApagada: 'SETUP', tumbados: 'SETUP', detras: 'SETUP', frenteAFrente: 'SETUP',
};
const COND_ORIENT = { detras: 'BEHIND', frenteAFrente: 'SEATED', tumbados: 'LYING' };
for (const c of CONDITIONS) { c.tier = COND_TIER[c.id] || 'INTERACTION'; c.orient = COND_ORIENT[c.id] || null; }
export const CONDITION = Object.fromEntries(CONDITIONS.map(c => [c.id, c]));

/* Conceptos que no pueden coexistir en una misma combinación (contradicción). */
export const CONFLICTS = [
  ['quieto', 'circulos'], ['quieto', 'recorrido'], ['quieto', 'variable'], ['quieto', 'gradual'],
  ['lento', 'variable'], ['pausa', 'variable'], ['voz', 'voz'], ['ligero', 'firme'],
  ['anticipacion', 'contacto'], ['duracion', 'duracion'], ['control', 'control'],
];

export const CATEGORIES = { relax: 'Relax', conexion: 'Conexión', carino: 'Cariño', anticipacion: 'Anticipación', sensualidad: 'Sensualidad', provocacion: 'Provocación', intensidad: 'Intensidad' };
export const PATTERNS = { GIVE: 'Dar', RECEIVE: 'Recibir', MUTUAL: 'A la vez', CHOOSE: 'Elige quien recibe', GUIDE: 'Guiar', DISCOVER: 'Descubrir', CONTINUE: 'Continuar' };
export const INTENSITY_LABEL = v => v < 2.5 ? 'Relajante' : v < 3.5 ? 'Cariñoso' : v < 5 ? 'Cercano' : v < 6.5 ? 'Sensual' : v < 8 ? 'Provocador' : 'Muy intenso';
