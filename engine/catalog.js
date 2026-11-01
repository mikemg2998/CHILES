/* Catálogo v2. Intensidad interna 1–10. Niveles: RELAJADO 1–3.5 · SENSUAL 3.5–6.5 · ATREVIDO 6.5–10.
   Cada elemento dice en qué niveles entra (levels: {1:peso,2:peso,3:peso}) y con qué es compatible.
   Regla de oro: antes de añadir algo, preguntarse con qué combina bien. */

export const LEVELS = {
  1: { id: 1, key: 'relajado', name: 'Relajado', min: 1, max: 3.5 },
  2: { id: 2, key: 'sensual', name: 'Sensual', min: 3.5, max: 6.5 },
  3: { id: 3, key: 'atrevido', name: 'Atrevido', min: 6.5, max: 10 },
};
export const LEVEL_BY_KEY = { relajado: 1, sensual: 2, atrevido: 3, progresivo: 1 };

export const GROUPS = {
  cabeza: { name: 'Cabeza, rostro y cuello', default: true },
  torso: { name: 'Torso y espalda', default: true },
  senos: { name: 'Senos', default: true },
  brazos: { name: 'Brazos y manos', default: true },
  piernas: { name: 'Piernas y pies', default: true },
  gluteos: { name: 'Glúteos y entrepierna', default: true },
  intimaF: { name: 'Anatomía íntima femenina', default: false, intimate: true, sex: 'F' },
  intimaM: { name: 'Anatomía íntima masculina', default: false, intimate: true, sex: 'M' },
};

/* ZONAS. n: nombre con artículo · np: forma con posesivo (su/sus) · intensity 1–10
   tags: frontal (se puede mirar a los ojos) · largo (se puede recorrer) · detras (se trabaja desde atrás)
         tumbado (mejor tumbados) · sensible · intimo */
/* family: familia anatómica para el balanceo (no repetir la misma idea en tiradas cercanas) */
const ZONE_FAMILY = {"cabello": "rostro", "frente": "rostro", "mejillas": "rostro", "rostro": "rostro", "orejas": "cuello", "labios": "boca", "cuello": "cuello", "nuca": "cuello", "hombros": "espalda", "espalda": "espalda", "lumbar": "espalda", "pecho": "torso", "abdomen": "torso", "abdomenBajo": "vientre", "cintura": "torso", "caderas": "vientre", "senos": "senos", "pezones": "senos", "brazos": "brazos", "manos": "brazos", "dedos": "brazos", "muslos": "muslos", "muslosInt": "muslos", "piernas": "piernas", "pantorrillas": "piernas", "pies": "piernas", "gluteos": "gluteos", "entrepierna": "entrepierna", "vulva": "intimaF", "labiosMayores": "intimaF", "labiosMenores": "intimaF", "clitoris": "intimaF", "vagina": "intimaF", "pene": "intimaM", "glande": "intimaM", "testiculos": "intimaM"};
const Z = (id, n, group, intensity, tags, levels, np) => ({ id, n, np: np || n.replace(/^(el|la) /, 'su ').replace(/^(los|las) /, 'sus '), group, family: ZONE_FAMILY[id], intensity, tags, levels });
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
const A = (o) => Object.assign({ tags: [], concepts: [], denyConditions: [], denyMethods: [] }, o);
export const ACTIONS = [
  // --- base (nivel 1, también en 2 y 3 con sus zonas) ---
  A({ id: 'acariciar', family: 'caricia', name: 'Acariciar', verb: 'Acaricia', frame: '{V} {M} {ZONE}', intensity: 2.5, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 3, 2: 2, 3: 0.8 }, tags: ['movimiento', 'circular', 'ligero'],
    zones: ['cabello', 'frente', 'mejillas', 'rostro', 'cuello', 'nuca', 'hombros', 'espalda', 'lumbar', 'pecho', 'abdomen', 'abdomenBajo', 'cintura', 'caderas', 'senos', 'brazos', 'manos', 'dedos', 'muslos', 'muslosInt', 'piernas', 'pies', 'gluteos', 'entrepierna', 'pezones', 'vulva', 'labiosMayores', 'clitoris', 'pene', 'testiculos'] }),
  A({ id: 'masajear', family: 'masaje', name: 'Masajear', verb: 'Masajea', frame: '{V} {M} {ZONE}', intensity: 2.5, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 3, 2: 1.2, 3: 0.4 }, tags: ['movimiento', 'circular', 'presion'],
    zones: ['hombros', 'nuca', 'cuello', 'espalda', 'lumbar', 'brazos', 'manos', 'dedos', 'muslos', 'piernas', 'pantorrillas', 'pies', 'caderas', 'gluteos', 'pecho'] }),
  A({ id: 'abrazar', family: 'abrazo', manner: 'baja', name: 'Abrazar', verb: 'Abraza', frame: '{V} {M} a {P} rodeando {ZONE:bare}', frameP: 'Abrázale {M} rodeando {ZONE:bare}', intensity: 1.5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 1: 2.5, 2: 0.8 }, tags: ['quieto'], concepts: ['contacto'],
    zones: ['cintura', 'hombros', 'espalda'] }),
  A({ id: 'apoyarMano', family: 'masaje', manner: 'baja', name: 'Apoyar la mano', verb: 'Apoya', frame: '{V} {M} la mano sobre {ZONE}, sin moverla', intensity: 1.5, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2.5, 2: 1 }, tags: ['quieto'], concepts: ['contacto', 'quieto'],
    zones: ['mejillas', 'pecho', 'espalda', 'nuca', 'hombros', 'abdomen', 'muslos', 'cuello', 'lumbar', 'cintura'] }),
  A({ id: 'rozar', family: 'caricia', name: 'Rozar con los dedos', verb: 'Roza', frame: '{V} {M} {ZONE} con la yema de los dedos', intensity: 3, contactType: 'mano', durationType: 'normal',
    levels: { 1: 2.5, 2: 2, 3: 0.8 }, tags: ['movimiento', 'circular', 'ligero'], concepts: ['ligero'],
    zones: ['mejillas', 'rostro', 'cuello', 'nuca', 'orejas', 'hombros', 'espalda', 'lumbar', 'brazos', 'manos', 'cintura', 'abdomen', 'abdomenBajo', 'pecho', 'senos', 'muslos', 'muslosInt', 'piernas', 'caderas', 'pezones', 'entrepierna', 'vulva', 'clitoris', 'pene', 'testiculos', 'labiosMayores'] }),
  A({ id: 'jugarCabello', family: 'cabello', manner: 'baja', name: 'Jugar con el cabello', verb: 'Juega', frame: '{V} {M} con {ZONE}', intensity: 2, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2.5 }, tags: ['movimiento'], zones: ['cabello'] }),
  A({ id: 'recorrerDedos', family: 'caricia', name: 'Recorrer con los dedos', verb: 'Recorre', frame: '{V} {M} {ZONE} con la punta de los dedos', intensity: 3, contactType: 'mano', durationType: 'normal',
    levels: { 1: 2.5, 2: 2, 3: 0.8 }, tags: ['movimiento', 'ligero'],
    zones: ['brazos', 'espalda', 'cuello', 'piernas', 'muslos', 'muslosInt', 'abdomen', 'pecho', 'lumbar', 'cintura', 'caderas', 'senos', 'abdomenBajo', 'entrepierna'] }),
  A({ id: 'acercarse', family: 'anticipacion', manner: 'baja', name: 'Acercarse sin tocar', verb: 'Acércate', frame: '{V} {M} a {ZONE} sin llegar a tocar', intensity: 2.5, contactType: 'ninguno', durationType: 'breve',
    levels: { 1: 2, 2: 2, 3: 1 }, tags: ['anticipacion'], concepts: ['anticipacion', 'cerca'],
    zones: ['rostro', 'labios', 'cuello', 'nuca', 'orejas', 'abdomen', 'senos', 'muslosInt', 'caderas', 'lumbar', 'abdomenBajo', 'entrepierna', 'vulva', 'pene', 'pezones', 'gluteos'] }),
  A({ id: 'respirarCerca', family: 'anticipacion', manner: 'baja', name: 'Respirar cerca', verb: 'Respira', frame: '{V} {M} muy cerca de {ZONE}, sin tocar', intensity: 3, contactType: 'ninguno', durationType: 'breve',
    levels: { 1: 1.5, 2: 2, 3: 1 }, tags: ['anticipacion'], concepts: ['anticipacion', 'cerca', 'aliento'],
    zones: ['cuello', 'nuca', 'orejas', 'hombros', 'espalda', 'abdomen', 'senos', 'muslosInt', 'lumbar', 'labios', 'abdomenBajo', 'vulva', 'pene', 'entrepierna', 'pezones'] }),
  A({ id: 'entrelazar', family: 'abrazo', manner: 'baja', name: 'Entrelazar los dedos', verb: 'Entrelaza', frame: '{V} {M} tus dedos con los de {P}', frameP: '{V} {M} tus dedos con los suyos', intensity: 1, contactType: 'mano', durationType: 'sostenible',
    levels: { 1: 2 }, tags: ['quieto'], concepts: ['contacto'], zones: ['manos'], denyMethods: ['muySuave', 'suave', 'moderada'] }),
  A({ id: 'besar', family: 'beso', name: 'Besar', verb: 'Besa', frame: '{V} {M} {ZONE}', intensity: 4.5, contactType: 'boca', durationType: 'normal',
    levels: { 1: 1, 2: 3, 3: 0.35 }, tags: ['movimiento', 'repetido'],
    zones: ['frente', 'mejillas', 'manos', 'hombros', 'labios', 'cuello', 'nuca', 'orejas', 'pecho', 'senos', 'abdomen', 'abdomenBajo', 'cintura', 'caderas', 'muslos', 'muslosInt', 'lumbar', 'espalda', 'pezones', 'gluteos', 'entrepierna', 'vulva', 'clitoris', 'pene', 'testiculos'] }),
  // --- nivel 2 ---
  A({ id: 'besitos', family: 'beso', manner: 'baja', name: 'Pequeños besos', verb: 'Da', frame: '{V} pequeños besos en {ZONE}', intensity: 4, contactType: 'boca', durationType: 'normal',
    levels: { 2: 2.5, 3: 0.4 }, tags: ['movimiento', 'repetido'],
    zones: ['rostro', 'cuello', 'hombros', 'espalda', 'abdomen', 'abdomenBajo', 'muslosInt', 'senos', 'pecho', 'cintura', 'caderas', 'lumbar', 'gluteos', 'entrepierna'] }),
  A({ id: 'recorrerLabios', family: 'beso', name: 'Recorrer con los labios', verb: 'Recorre', frame: '{V} {M} {ZONE} con los labios', intensity: 5.5, contactType: 'boca', durationType: 'normal',
    levels: { 2: 2.5, 3: 0.6 }, tags: ['movimiento', 'ligero'],
    zones: ['cuello', 'hombros', 'espalda', 'lumbar', 'abdomen', 'pecho', 'cintura', 'caderas', 'muslos', 'muslosInt', 'senos', 'abdomenBajo', 'entrepierna', 'gluteos'] }),
  A({ id: 'mordisquear', family: 'mordisco', name: 'Mordisquear', verb: 'Mordisquea', frame: '{V} {M} {ZONE}', intensity: 5.5, contactType: 'boca', durationType: 'breve', denyMethods: ['lento', 'muyLento', 'recorrido', 'constante'],
    levels: { 2: 1.5, 3: 0.8 }, tags: ['movimiento', 'repetido'],
    zones: ['labios', 'cuello', 'orejas', 'hombros', 'nuca', 'cintura', 'caderas', 'muslosInt', 'senos', 'pezones', 'gluteos'] }),
  A({ id: 'apartarRopa', family: 'ropa', manner: 'baja', name: 'Apartar la ropa', verb: 'Aparta', frame: '{V} {M} la ropa de {ZONE} y descubre la piel', intensity: 5, contactType: 'mano', durationType: 'breve',
    levels: { 2: 1.2 }, tags: ['anticipacion', 'ropa'], concepts: ['anticipacion'], denyMethods: ['unosSegundos', 's20', 's30', 'hastaCambiar', 'buenRato'],
    zones: ['hombros', 'espalda', 'abdomen', 'cintura', 'caderas', 'pecho', 'senos', 'muslos', 'lumbar', 'gluteos', 'abdomenBajo'] }),
  A({ id: 'susurrar', family: 'voz', manner: 'baja', name: 'Susurrar', verb: 'Susurra', frame: '{V} {M} algo a {P} al oído', frameP: 'Susúrrale {M} algo al oído', intensity: 4, contactType: 'ninguno', durationType: 'breve',
    levels: { 2: 1.5, 3: 0.5 }, tags: ['voz'], concepts: ['voz', 'cerca'], zones: ['orejas'] }),
  A({ id: 'pegarCuerpo', family: 'cuerpo', manner: 'baja', name: 'Pegar el cuerpo', verb: 'Pega', frame: '{V} {M} tu cuerpo al de {P} por {ZONE:bare}', frameP: '{V} {M} tu cuerpo al suyo por {ZONE:bare}', intensity: 5, contactType: 'cuerpo', durationType: 'sostenible',
    levels: { 2: 1.4, 3: 0.5 }, tags: ['quieto'], concepts: ['contacto', 'cerca'],
    zones: ['espalda', 'pecho', 'caderas', 'abdomen'] }),
  A({ id: 'unas', family: 'caricia', name: 'Pasar las uñas', verb: 'Pasa', frame: '{V} {M} las uñas por {ZONE}', intensity: 4.5, contactType: 'mano', durationType: 'normal',
    levels: { 2: 2, 3: 0.5 }, tags: ['movimiento', 'ligero'],
    zones: ['espalda', 'lumbar', 'muslos', 'muslosInt', 'brazos', 'abdomen', 'cuello', 'nuca', 'cabello', 'gluteos', 'pecho'] }),
  A({ id: 'rozarLabios', family: 'beso', name: 'Rozar con los labios', verb: 'Roza', frame: '{V} {M} {ZONE} con los labios, apenas tocando', intensity: 5, contactType: 'boca', durationType: 'breve',
    levels: { 2: 2.5, 3: 0.5 }, tags: ['movimiento', 'ligero', 'anticipacion'], concepts: ['ligero', 'anticipacion'],
    zones: ['cuello', 'orejas', 'labios', 'hombros', 'abdomen', 'senos', 'muslosInt', 'lumbar', 'cintura', 'pezones', 'entrepierna', 'abdomenBajo'] }),
  // --- nivel 3 ---
  A({ id: 'lamer', family: 'lengua', name: 'Lamer', verb: 'Lame', frame: '{V} {M} {ZONE}', intensity: 7.5, contactType: 'boca', durationType: 'normal',
    levels: { 3: 3 }, tags: ['movimiento', 'circular', 'ligero'],
    zones: ['senos', 'pezones', 'abdomenBajo', 'muslosInt', 'entrepierna', 'gluteos', ...INTIMA.filter(z => z !== 'vagina')] }),
  A({ id: 'chupar', family: 'bocaIntima', name: 'Chupar', verb: 'Chupa', frame: '{V} {M} {ZONE}', intensity: 8.5, contactType: 'boca', durationType: 'normal',
    levels: { 3: 2.5 }, tags: ['movimiento'],
    zones: ['pezones', 'clitoris', 'pene', 'glande', 'testiculos', 'labiosMayores'] }),
  A({ id: 'estimularDedos', family: 'manoIntima', name: 'Estimular con los dedos', verb: 'Estimula', frame: '{V} {M} {ZONE} con los dedos', intensity: 8.5, contactType: 'mano', durationType: 'normal',
    levels: { 3: 3 }, tags: ['movimiento', 'circular'],
    zones: ['vulva', 'clitoris', 'labiosMayores', 'labiosMenores', 'vagina', 'pene', 'glande', 'testiculos', 'pezones', 'entrepierna'] }),
  A({ id: 'estimularBoca', family: 'bocaIntima', name: 'Estimular con la boca', verb: 'Estimula', frame: '{V} {M} {ZONE} con la boca', intensity: 9, contactType: 'boca', durationType: 'normal',
    levels: { 3: 2.5 }, tags: ['movimiento'],
    zones: ['vulva', 'clitoris', 'labiosMenores', 'pene', 'glande', 'testiculos', 'pezones'] }),
  A({ id: 'masturbar', family: 'manoIntima', name: 'Masturbar', verb: 'Masturba', frame: '{V} {M} a {P}, centrándote en {ZONE:bare}', frameP: 'Mastúrbale {M}, centrándote en {ZONE:bare}', intensity: 9, contactType: 'mano', durationType: 'normal',
    levels: { 3: 2.5 }, tags: ['movimiento'],
    zones: ['pene', 'vulva', 'clitoris', 'glande'] }),
  A({ id: 'introducirDedo', family: 'manoIntima', name: 'Introducir un dedo', verb: 'Introduce', frame: '{V} {M} un dedo en {ZONE}', intensity: 9.5, contactType: 'mano', durationType: 'normal',
    levels: { 3: 1.5 }, tags: ['movimiento'], zones: ['vagina'],
    denyMethods: ['firme', 'moderada', 'impredecible', 'circulos', 'recorrido', 'pequenos'] }),
  A({ id: 'frotar', family: 'cuerpo', name: 'Frotar el cuerpo', verb: 'Frota', frame: '{V} {M} tu cuerpo contra {ZONE}', intensity: 7, contactType: 'cuerpo', durationType: 'normal',
    levels: { 3: 0.8 }, tags: ['movimiento'], concepts: ['contacto'],
    zones: ['gluteos', 'caderas', 'entrepierna', 'muslosInt', 'espalda'] }),
  A({ id: 'apretar', family: 'presion', name: 'Apretar', verb: 'Aprieta', frame: '{V} {M} {ZONE} con la mano', intensity: 6, contactType: 'mano', durationType: 'breve',
    levels: { 2: 0.6, 3: 1.5 }, tags: ['presion', 'repetido'],
    zones: ['gluteos', 'senos', 'caderas', 'muslos', 'muslosInt'] }),
  A({ id: 'nalgada', family: 'presion', manner: 'baja', name: 'Nalgada', verb: 'Da', frame: '{V} {M} una nalgada en {ZONE}', intensity: 7, contactType: 'mano', durationType: 'breve',
    levels: { 3: 1.5 }, tags: ['presion', 'repetido'], zones: ['gluteos'],
    denyMethods: ['lento', 'muyLento', 'pausado', 'constante', 'variable', 'circulos', 'recorrido', 'pequenos', 'buenRato', 's20', 's30', 'hastaCambiar', 'gradual', 'pausaContacto', 'impredecible', 'empezarSuave', 'unosSegundos', 'muySuave', 'suave', 'moderada'] }),
];
export const ACTION = Object.fromEntries(ACTIONS.map(a => [a.id, a]));

/* FORMAS (el tercer dado). Internamente cinco dimensiones; el dado elige UNA forma apropiada para la acción.
   pos: adv (junto al verbo) · phrase (después de la zona) · end (al final de la frase)
   needs / deny: tags de la acción · zoneNeeds: tags de la zona · concepts: para redundancias */
const M = (o) => Object.assign({ needs: [], deny: [], zoneNeeds: [], concepts: [], denyContact: [] }, o);
export const METHODS = [
  // ritmo
  M({ id: 'lento', dim: 'ritmo', text: 'lentamente', pos: 'adv', mod: 0.3, levels: { 1: 3, 2: 3, 3: 2 }, needs: ['movimiento'], concepts: ['lento'] }),
  M({ id: 'muyLento', dim: 'ritmo', text: 'muy lentamente', pos: 'adv', mod: 0.5, levels: { 2: 2, 3: 2 }, needs: ['movimiento'], concepts: ['lento'] }),
  M({ id: 'pausado', dim: 'ritmo', text: 'con pequeñas pausas', pos: 'phrase', mod: 0.3, levels: { 1: 2, 2: 2, 3: 1 }, needs: ['movimiento'], concepts: ['pausa'] }),
  M({ id: 'constante', dim: 'ritmo', text: 'a un ritmo constante', pos: 'phrase', mod: 0, levels: { 1: 1, 2: 2, 3: 2 }, needs: ['movimiento'], deny: ['repetido', 'anticipacion'] }),
  M({ id: 'variable', dim: 'ritmo', text: 'variando el ritmo', pos: 'phrase', mod: 0.6, levels: { 2: 1.5, 3: 2.5 }, needs: ['movimiento'], deny: ['anticipacion'], concepts: ['variable'] }),
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
];
export const METHOD = Object.fromEntries(METHODS.map(m => [m.id, m]));

/* CONDICIONES (el cuarto dado). slot decide la estructura de la frase:
   tail (al final) · intro (abre la frase) · prep (preparación: postura, pausa) · antic (acercarse primero)
   after (frase posterior) · choice (elección) · path (empezar por otra zona) · swap (cambia quién lo hace)
   needsZoneTags / denyActionTags / needsActionTags / denyContact / denyDims (dimensiones de forma incompatibles)
   role: interaccion (cambia la dinámica entre los dos) · escena (postura o preparación) · conexion · atmosfera (decorativa)
   aporta: cuánto aporta la condición a ESTA acción/zona. base × multiplicadores por tag de acción, tag de zona, tipo de contacto
   y duración (zoneElse se aplica si ningún tag de zona coincide). Por debajo de 0.45 la condición no entra: sería relleno. */
const C = (o) => Object.assign({ needsZoneTags: [], denyZoneTags: [], denyActionTags: [], needsActionTags: [], denyContact: [], denyDims: [], concepts: [], mod: 0 }, o);
export const CONDITIONS = [
  C({ id: 'mirandose', family: 'vista', role: 'conexion', aporta: { base: .9, contact: { mano: .6, boca: .9 }, action: { quieto: 1.3, movimiento: .7, ligero: .8, repetido: .6 }, zone: { sensible: 1 } }, short: 'Mirándoos', slot: 'tail', text: 'mirándoos a los ojos', textBoca: 'sin dejar de mirarle a los ojos', intro: 'Mirándoos a los ojos,', mod: 0.4, levels: { 1: 2.5, 2: 2, 3: 1.8 }, needsZoneTags: ['frontal'], denyZoneTags: ['detras'], concepts: ['mirada'] }),
  C({ id: 'ojosCerrados', family: 'vista', role: 'atmosfera', aporta: { base: .65, action: { ligero: 1.2, anticipacion: 1.2, movimiento: .8, quieto: .4, presion: .5 }, zone: { sensible: 1.2 }, zoneElse: .5, contact: { cuerpo: .4 } }, short: 'Ojos cerrados', slot: 'tail', text: 'mientras {P} mantiene los ojos cerrados', intro: 'Con los ojos cerrados de {P},', mod: 0.3, levels: { 1: 1, 2: 1.2, 3: 0.8 }, concepts: ['ojos'] }),
  C({ id: 'sinHablar', family: 'voz', role: 'atmosfera', aporta: { base: .5, contact: { cuerpo: 1.2, mano: .7, boca: .5 }, action: { quieto: 1.3, movimiento: .6 }, duration: { sostenible: 1.2, breve: .6 } }, short: 'Sin hablar', slot: 'intro', text: 'Sin hablar,', mod: 0.2, levels: { 1: 1.5, 2: 2.5, 3: 1.5 }, denyActionTags: ['voz'], concepts: ['voz'] }),
  C({ id: 'respirarJuntos', family: 'cercania', role: 'conexion', aporta: { base: .9, contact: { cuerpo: 1.2, mano: .8 }, action: { quieto: 1.3, movimiento: .4 } }, short: 'Respirar juntos', slot: 'tail', text: 'respirando los dos al mismo ritmo', mod: 0.2, levels: { 1: 2.5, 2: 1 }, needsDuration: ['sostenible'], denyContact: ['ninguno'], concepts: ['aliento'] }),
  C({ id: 'detras', family: 'postura', role: 'escena', aporta: { base: .8, contact: { boca: .9 } }, short: 'Desde atrás', slot: 'prep', text: 'Ponte detrás de {P} y', mod: 0, levels: { 1: 2, 2: 1.5, 3: 1 }, needsZoneTags: ['detras'], concepts: ['postura'] }),
  C({ id: 'tumbados', family: 'postura', role: 'escena', aporta: { base: .8, duration: { breve: .5 }, contact: { ninguno: .7 } }, short: 'Tumbados', slot: 'prep', text: 'Pide a {P} que se tumbe y', mod: 0.1, levels: { 1: 1.5, 2: 2, 3: 2 }, needsZoneTags: ['tumbado'], concepts: ['postura'] }),
  C({ id: 'frenteAFrente', family: 'postura', role: 'escena', aporta: { base: .7, action: { quieto: 1.3, movimiento: .8 }, contact: { boca: .6 } }, short: 'Frente a frente', slot: 'prep', text: 'Sentaos frente a frente y', mod: 0, levels: { 1: 2, 2: 1.5 }, needsZoneTags: ['frontal'], denyZoneTags: ['intimo'], concepts: ['postura'] }),
  C({ id: 'parejaCambia', family: 'control', role: 'interaccion', aporta: { base: .8, duration: { breve: 0, sostenible: 1.1 }, action: { repetido: .7 } }, short: 'Pareja decide', slot: 'end', text: 'hasta que {P} decida que cambies', mod: 0.4, levels: { 2: 2, 3: 2 }, denyDims: ['duracion'], denyContact: ['ninguno'], concepts: ['control', 'duracion'] }),
  C({ id: 'parejaQuieta', family: 'quietud', role: 'interaccion', aporta: { base: .8, zone: { sensible: 1.2, intimo: 1.2 }, zoneElse: .3, action: { ligero: 1.2, anticipacion: 1.1, presion: .3 }, contact: { boca: 1.1, mano: .7 } }, short: 'Pareja quieta', slot: 'tail', text: 'sin que {P} se mueva', mod: 0.3, levels: { 2: 1, 3: 2 }, denyActionTags: ['quieto'], concepts: ['quietoP'] }),
  C({ id: 'vendados', family: 'vista', role: 'interaccion', aporta: { base: .9, action: { ligero: 1.1, anticipacion: 1.1, quieto: .4 }, zone: { sensible: 1.1 }, zoneElse: .7 }, short: 'Ojos vendados', slot: 'tail', text: 'mientras {P} tiene los ojos vendados', intro: 'Con los ojos vendados de {P},', mod: 0.5, levels: { 3: 2 }, concepts: ['ojos'] }),
  C({ id: 'manosQuietas', family: 'quietud', role: 'interaccion', aporta: { base: .8, zone: { sensible: 1.1, intimo: 1.2 }, zoneElse: .3, contact: { boca: 1.1, mano: .5, ninguno: .5 }, action: { quieto: .3, presion: .3 } }, short: 'Manos quietas', slot: 'tail', text: 'mientras {P} mantiene las manos quietas', mod: 0.3, levels: { 2: 1, 3: 2 }, concepts: ['quietoP'] }),
  C({ id: 'parejaRitmo', family: 'control', role: 'interaccion', aporta: { base: .85, duration: { breve: 0 }, action: { presion: .7 } }, short: 'Pareja marca ritmo', slot: 'tail', text: 'dejando que {P} marque el ritmo', mod: 0.4, levels: { 2: 1, 3: 2 }, denyDims: ['ritmo', 'dinamica', 'duracion'], denyActionTags: ['quieto', 'anticipacion', 'repetido'], concepts: ['control'] }),
  C({ id: 'hastaPidaMas', family: 'control', role: 'interaccion', aporta: { base: .9, duration: { breve: 0 } }, short: 'Hasta pedir más', slot: 'end', text: 'hasta que {P} pida más', mod: 0.9, levels: { 3: 2.5 }, denyDims: ['duracion'], denyContact: ['ninguno'], denyActionTags: ['repetido'], concepts: ['control', 'duracion'] }),
  C({ id: 'enVozAlta', family: 'voz', role: 'interaccion', aporta: { base: .9, zone: { sensible: 1.2 }, zoneElse: .6, action: { quieto: .5 } }, short: 'Decir lo que siente', slot: 'tail', text: 'mientras {P} dice en voz alta lo que siente', mod: 0.6, levels: { 3: 2 }, denyActionTags: ['voz'], concepts: ['voz'] }),
  C({ id: 'empezarPor', family: 'recorrido', role: 'interaccion', aporta: { base: .85 }, short: 'Empezar por otra zona', slot: 'path', text: 'Empieza por {ALT} de {P} y ve bajando; al llegar,', mod: 0.5, levels: { 3: 2.5 }, needsZoneTags: ['sensible'], needsActionTags: ['movimiento'], denyActionTags: ['repetido', 'ropa'], needsAlt: ['abdomenBajo', 'muslosInt', 'abdomen', 'senos', 'caderas'], concepts: ['recorrido', 'gradual', 'anticipacion'] }),
  C({ id: 'elige', family: 'control', role: 'interaccion', aporta: { base: .75, duration: { breve: .5 } }, short: 'Pareja elige', slot: 'choice', text: 'y deja que {P} elija si sigues ahí o pasas a {ALT}', mod: 0.2, levels: { 2: 1.5, 3: 1.5 }, needsAlt: 'same', needsActionTags: ['movimiento'], denyActionTags: ['voz'], concepts: ['control'] }),
  C({ id: 'esperar', family: 'pausa', role: 'escena', aporta: { base: .9, contact: { ninguno: 1.1, mano: .8, boca: .9 }, action: { ropa: .7 } }, short: 'Espera 5 s', slot: 'after', text: 'Quédate así cinco segundos antes de continuar.', mod: 0.4, levels: { 1: 1, 2: 2, 3: 2 }, needsActionTags: ['anticipacion'], denyDims: ['duracion'], concepts: ['espera', 'duracion'] }),
  C({ id: 'cambioTurno', family: 'turno', role: 'interaccion', aporta: { base: .45 }, denyZoneTags: ['intimo'], short: 'Cambio de turno', slot: 'swap', text: 'Cambio de turno: esta ronda la hace {PF}.', mod: 0, levels: { 2: 0.5, 3: 0.5 }, concepts: ['turno'] }),
];
export const CONDITION = Object.fromEntries(CONDITIONS.map(c => [c.id, c]));

/* Conceptos que no pueden coexistir en una misma combinación (contradicción). */
export const CONFLICTS = [
  ['quieto', 'circulos'], ['quieto', 'recorrido'], ['quieto', 'variable'], ['quieto', 'gradual'],
  ['lento', 'variable'], ['pausa', 'variable'], ['voz', 'voz'], ['ligero', 'firme'],
  ['anticipacion', 'contacto'], ['duracion', 'duracion'], ['control', 'control'],
];

export const CATEGORIES = { relax: 'Relax', conexion: 'Conexión', carino: 'Cariño', anticipacion: 'Anticipación', sensualidad: 'Sensualidad', provocacion: 'Provocación', intensidad: 'Intensidad' };
export const INTENSITY_LABEL = v => v < 2.5 ? 'Relajante' : v < 3.5 ? 'Cariñoso' : v < 5 ? 'Cercano' : v < 6.5 ? 'Sensual' : v < 8 ? 'Provocador' : 'Muy intenso';
