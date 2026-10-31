/* Catálogo del motor. Cada elemento lleva metadatos de compatibilidad e intensidad.
   Regla de oro: antes de añadir algo, preguntarse con qué se combina bien.

   Intensidad base: 1 relajante · 2 cariñoso · 3 sensual · 4 provocador · 5 muy intenso
   Intimidad de zona: 1 neutral · 2 cercanía · 3 sensual · 4 íntimo
*/

export const GROUPS = {
  cabeza:   { name: 'Cabeza y rostro', default: true },
  torso:    { name: 'Torso', default: true },
  senos:    { name: 'Senos', default: true },
  brazos:   { name: 'Brazos y manos', default: true },
  piernas:  { name: 'Piernas y pies', default: true },
  gluteos:  { name: 'Glúteos', default: true },
  intimaF:  { name: 'Anatomía íntima femenina', default: false, intimate: true },
  intimaM:  { name: 'Anatomía íntima masculina', default: false, intimate: true },
};

/* n: nombre con artículo · g: género/número para concordancia · tags:
   frontal = se puede hacer mirándose a los ojos · largo = se puede recorrer
   sensible = reacciona a estímulos ligeros · intimo = anatomía íntima */
const Z = (id, n, group, intimacy, tags = []) => ({ id, n, group, intimacy, baseIntensity: intimacy === 4 ? 4.5 : intimacy, tags });
export const ZONES = [
  Z('cabello', 'el cabello', 'cabeza', 1, ['frontal']),
  Z('frente', 'la frente', 'cabeza', 1, ['frontal']),
  Z('mejillas', 'las mejillas', 'cabeza', 2, ['frontal']),
  Z('rostro', 'el rostro', 'cabeza', 2, ['frontal']),
  Z('orejas', 'las orejas', 'cabeza', 2, ['sensible']),
  Z('labios', 'los labios', 'cabeza', 3, ['frontal', 'sensible']),
  Z('cuello', 'el cuello', 'cabeza', 2, ['frontal', 'largo', 'sensible']),
  Z('nuca', 'la nuca', 'cabeza', 2, ['sensible']),

  Z('hombros', 'los hombros', 'torso', 1, ['frontal']),
  Z('pecho', 'el pecho', 'torso', 3, ['frontal', 'largo']),
  Z('espalda', 'la espalda', 'torso', 2, ['largo']),
  Z('lumbar', 'la zona lumbar', 'torso', 2, ['sensible']),
  Z('abdomen', 'el abdomen', 'torso', 2, ['frontal', 'largo', 'sensible']),
  Z('cintura', 'la cintura', 'torso', 3, ['frontal', 'sensible']),
  Z('caderas', 'las caderas', 'torso', 3, ['frontal', 'sensible']),
  Z('senos', 'los senos', 'senos', 3, ['frontal', 'sensible']),

  Z('brazos', 'los brazos', 'brazos', 1, ['frontal', 'largo']),
  Z('antebrazos', 'los antebrazos', 'brazos', 1, ['frontal', 'largo']),
  Z('manos', 'las manos', 'brazos', 1, ['frontal']),
  Z('dedos', 'los dedos', 'brazos', 1, ['frontal']),

  Z('muslos', 'los muslos', 'piernas', 3, ['frontal', 'largo']),
  Z('muslosInt', 'la parte interna de los muslos', 'piernas', 3, ['frontal', 'largo', 'sensible']),
  Z('rodillas', 'las rodillas', 'piernas', 1, ['frontal']),
  Z('piernas', 'las piernas', 'piernas', 1, ['frontal', 'largo']),
  Z('pantorrillas', 'las pantorrillas', 'piernas', 1, ['largo']),
  Z('tobillos', 'los tobillos', 'piernas', 1, []),
  Z('pies', 'los pies', 'piernas', 1, ['sensible']),

  Z('gluteos', 'los glúteos', 'gluteos', 3, ['sensible']),

  Z('vulva', 'la vulva', 'intimaF', 4, ['intimo', 'sensible']),
  Z('labiosMayores', 'los labios mayores', 'intimaF', 4, ['intimo', 'sensible']),
  Z('labiosMenores', 'los labios menores', 'intimaF', 4, ['intimo', 'sensible']),
  Z('clitoris', 'el clítoris', 'intimaF', 4, ['intimo', 'sensible']),
  Z('vagina', 'la vagina', 'intimaF', 4, ['intimo', 'sensible']),
  Z('pene', 'el pene', 'intimaM', 4, ['intimo', 'sensible']),
  Z('glande', 'el glande', 'intimaM', 4, ['intimo', 'sensible']),
  Z('testiculos', 'los testículos', 'intimaM', 4, ['intimo', 'sensible']),
];
export const ZONE = Object.fromEntries(ZONES.map(z => [z.id, z]));

const byGroup = (...gs) => ZONES.filter(z => gs.includes(z.group)).map(z => z.id);
const not = (list, ...ids) => list.filter(z => !ids.includes(z));
const NO_INTIMA = ZONES.filter(z => z.intimacy < 4).map(z => z.id);
const INTIMA = byGroup('intimaF', 'intimaM');

/* Acciones.
   frame: plantilla de frase. {V} verbo, {STYLE} hueco del adverbio, {ZONE} zona, {P} pareja.
   tags: mano / boca / cuerpo / voz / sinContacto / quieto / libre / ropa
         movimiento = hay desplazamiento (admite ritmo) · ligero = contacto ligero (admite "apenas rozando")
         circular = admite "haciendo círculos" · repetido = gesto que se repite
   styles: lista blanca de ids de estilo. conds: lista negra de ids de condición. */
const A = (o) => Object.assign({ tags: [], conds: [], questionable: [] }, o);
export const ACTIONS = [
  A({ id: 'acariciar', name: 'Acariciar', frame: '{V} {STYLE} {ZONE} de {P}', verb: 'Acaricia', baseIntensity: 2, category: 'carino',
    zones: ZONES.map(z => z.id), tags: ['mano', 'movimiento', 'ligero', 'circular'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'firmeza', 'pausas', 'constante', 'subiendo', 'bajando', 'alternando', 'pocosSegundos', 'masTiempo', 'hastaCambiar', 'impredecible', 'circulos', 'apenas'] }),
  A({ id: 'besar', name: 'Besar', frame: '{V} {STYLE} {ZONE} de {P}', verb: 'Besa', baseIntensity: 2, category: 'carino',
    zones: [...not(NO_INTIMA, 'cabello', 'tobillos', 'pantorrillas'), 'vulva', 'clitoris', 'pene', 'glande', 'testiculos'], tags: ['boca', 'movimiento', 'ligero', 'repetido'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'subiendo', 'alternando', 'pocosSegundos', 'masTiempo', 'hastaCambiar', 'impredecible', 'apenas'] }),
  A({ id: 'besitos', name: 'Pequeños besos', frame: '{V} {STYLE} en {ZONE} de {P}', verb: 'Da pequeños besos', baseIntensity: 2, category: 'carino',
    zones: not(NO_INTIMA, 'cabello', 'tobillos', 'pantorrillas', 'rodillas', 'frente', 'antebrazos'), tags: ['boca', 'movimiento', 'repetido'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'constante', 'subiendo', 'alternando', 'pocosSegundos', 'masTiempo', 'hastaCambiar', 'impredecible'] }),
  A({ id: 'masajear', name: 'Masajear', frame: '{V} {STYLE} {ZONE} de {P}', verb: 'Masajea', baseIntensity: 2, category: 'relax',
    zones: ['cabello', 'hombros', 'cuello', 'nuca', 'espalda', 'lumbar', 'pecho', 'abdomen', 'caderas', 'senos', 'brazos', 'antebrazos', 'manos', 'dedos', 'muslos', 'piernas', 'pantorrillas', 'pies', 'gluteos'],
    tags: ['mano', 'movimiento', 'circular', 'presion'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'firmeza', 'pausas', 'constante', 'subiendo', 'bajando', 'alternando', 'masTiempo', 'hastaCambiar', 'circulos'] }),
  A({ id: 'rozar', name: 'Rozar con los dedos', frame: '{V} {STYLE} {ZONE} de {P} con la yema de los dedos', verb: 'Roza', baseIntensity: 2, category: 'sensualidad',
    zones: [...not(NO_INTIMA, 'cabello'), 'vulva', 'labiosMayores', 'clitoris', 'pene', 'glande', 'testiculos'], tags: ['mano', 'movimiento', 'ligero', 'circular'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'constante', 'subiendo', 'alternando', 'pocosSegundos', 'masTiempo', 'hastaCambiar', 'impredecible', 'circulos', 'apenas'] }),
  A({ id: 'abrazar', name: 'Abrazar', frame: '{V} {STYLE} a {P} rodeando {ZONE}', verb: 'Abraza', baseIntensity: 1, category: 'conexion',
    zones: ['cintura', 'hombros', 'espalda', 'caderas', 'cuello'], tags: ['cuerpo', 'quieto'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'firmeza', 'pocosSegundos', 'masTiempo', 'hastaCambiar'],
    conds: ['unaMano', 'recibeRitmo', 'daRitmo', 'manosQuietas'] }),
  A({ id: 'susurrar', name: 'Susurrar', frame: '{V} {STYLE} algo a {P} muy cerca de {ZONE}', verb: 'Susurra', baseIntensity: 2, category: 'conexion',
    zones: ['orejas', 'cuello', 'nuca'], tags: ['voz', 'sinContacto'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'masTiempo'],
    conds: ['sinHablar', 'vozBaja', 'unaMano', 'recibeRitmo', 'daRitmo'] }),
  A({ id: 'mordisquear', name: 'Mordisquear', frame: '{V} {STYLE} {ZONE} de {P}', verb: 'Mordisquea', baseIntensity: 3, category: 'provocacion',
    zones: ['orejas', 'labios', 'cuello', 'hombros', 'nuca', 'cintura', 'caderas', 'senos', 'dedos', 'muslosInt', 'gluteos'], tags: ['boca', 'movimiento', 'repetido'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'alternando', 'pocosSegundos', 'hastaCambiar', 'impredecible'] }),
  A({ id: 'cosquillas', name: 'Cosquillas', frame: '{V} {STYLE} en {ZONE} de {P}', verb: 'Haz cosquillas', baseIntensity: 1, category: 'juego',
    zones: ['cuello', 'abdomen', 'cintura', 'espalda', 'brazos', 'antebrazos', 'muslos', 'rodillas', 'pantorrillas', 'pies'], tags: ['mano', 'movimiento', 'ligero'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'subiendo', 'alternando', 'pocosSegundos', 'impredecible', 'apenas'] }),
  A({ id: 'recorrer', name: 'Recorrer con los dedos', frame: '{V} {STYLE} {ZONE} de {P} con la punta de los dedos', verb: 'Recorre', baseIntensity: 2, category: 'sensualidad',
    zones: ZONES.filter(z => z.tags.includes('largo')).map(z => z.id).concat(['lumbar', 'cintura', 'caderas', 'senos']), tags: ['mano', 'movimiento', 'ligero', 'circular'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'constante', 'subiendo', 'bajando', 'alternando', 'masTiempo', 'hastaCambiar', 'impredecible', 'apenas'] }),
  A({ id: 'recorrerLabios', name: 'Recorrer con los labios', frame: '{V} {STYLE} {ZONE} de {P} con los labios', verb: 'Recorre', baseIntensity: 3, category: 'sensualidad',
    zones: ['cuello', 'hombros', 'espalda', 'lumbar', 'abdomen', 'pecho', 'cintura', 'caderas', 'senos', 'brazos', 'muslos', 'muslosInt'], tags: ['boca', 'movimiento', 'ligero'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'constante', 'subiendo', 'alternando', 'masTiempo', 'hastaCambiar', 'apenas'] }),
  A({ id: 'unas', name: 'Pasar las uñas', frame: '{V} {STYLE} las uñas por {ZONE} de {P}', verb: 'Pasa', baseIntensity: 3, category: 'sensualidad',
    zones: ['cabello', 'cuello', 'nuca', 'espalda', 'lumbar', 'pecho', 'abdomen', 'brazos', 'muslos', 'muslosInt', 'piernas', 'pantorrillas', 'gluteos'], tags: ['mano', 'movimiento', 'ligero', 'circular'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'constante', 'subiendo', 'alternando', 'masTiempo', 'hastaCambiar', 'impredecible', 'circulos', 'apenas'] }),
  A({ id: 'presionar', name: 'Presionar con las palmas', frame: '{V} {STYLE} {ZONE} de {P} con las palmas', verb: 'Presiona', baseIntensity: 2, category: 'relax',
    zones: ['hombros', 'nuca', 'espalda', 'lumbar', 'caderas', 'manos', 'muslos', 'pantorrillas', 'pies', 'gluteos'], tags: ['mano', 'movimiento', 'presion', 'circular'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'firmeza', 'pausas', 'constante', 'subiendo', 'bajando', 'masTiempo', 'hastaCambiar', 'circulos'] }),
  A({ id: 'contacto', name: 'Mantener el contacto', frame: '{V} {STYLE} tu mano sobre {ZONE} de {P} y mantén el contacto sin moverla', verb: 'Apoya', baseIntensity: 1, category: 'conexion',
    zones: ['mejillas', 'cuello', 'nuca', 'hombros', 'pecho', 'espalda', 'lumbar', 'abdomen', 'caderas', 'senos', 'manos', 'muslos', 'rodillas'], tags: ['mano', 'quieto'],
    styles: ['suave', 'delicadeza', 'firmeza', 'pocosSegundos', 'masTiempo', 'hastaCambiar'],
    conds: ['recibeRitmo', 'daRitmo', 'manosQuietas'] }),
  A({ id: 'acercarse', name: 'Acercarse sin tocar', frame: '{V} {STYLE} a {ZONE} de {P} sin llegar a tocar', verb: 'Acércate', baseIntensity: 2, category: 'anticipacion',
    zones: ['labios', 'cuello', 'orejas', 'nuca', 'pecho', 'abdomen', 'senos', 'caderas', 'muslosInt', 'gluteos', 'vulva', 'pene'], tags: ['sinContacto', 'anticipacion'],
    styles: ['extremoLento', 'lento', 'pausas', 'masTiempo', 'hastaCambiar'],
    conds: ['unaMano', 'recibeRitmo', 'daRitmo', 'manosQuietas'] }),
  A({ id: 'respirar', name: 'Respirar sobre la piel', frame: '{V} {STYLE} sobre {ZONE} de {P}, sin tocar', verb: 'Respira', baseIntensity: 2, category: 'anticipacion',
    zones: ['labios', 'cuello', 'orejas', 'nuca', 'espalda', 'lumbar', 'pecho', 'abdomen', 'senos', 'muslosInt', 'vulva', 'pene'], tags: ['sinContacto', 'anticipacion'],
    styles: ['extremoLento', 'lento', 'suave', 'pausas', 'pocosSegundos', 'masTiempo', 'hastaCambiar'],
    conds: ['unaMano', 'recibeRitmo', 'daRitmo', 'manosQuietas', 'vozBaja'] }),
  A({ id: 'cercania', name: 'Mantener la cercanía', frame: '{V} a un centímetro de {ZONE} de {P}, sin tocar', verb: 'Quédate', baseIntensity: 2, category: 'anticipacion',
    zones: ['labios', 'cuello', 'orejas', 'abdomen', 'senos', 'muslosInt', 'vulva', 'pene'], tags: ['sinContacto', 'anticipacion', 'quieto'],
    styles: ['pocosSegundos', 'masTiempo', 'hastaCambiar'],
    conds: ['unaMano', 'recibeRitmo', 'daRitmo', 'manosQuietas'] }),
  A({ id: 'soplar', name: 'Soplar', frame: '{V} {STYLE} sobre {ZONE} de {P}', verb: 'Sopla', baseIntensity: 2, category: 'anticipacion',
    zones: ['labios', 'cuello', 'orejas', 'nuca', 'espalda', 'lumbar', 'pecho', 'abdomen', 'senos', 'muslosInt', 'manos', 'vulva', 'pene'], tags: ['sinContacto', 'anticipacion'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'constante', 'pocosSegundos', 'masTiempo', 'hastaCambiar'],
    conds: ['unaMano', 'recibeRitmo', 'daRitmo', 'manosQuietas', 'vozBaja'] }),
  A({ id: 'sorprender', name: 'Sorprender', frame: '{V} a {P} con algo inesperado en {ZONE}', verb: 'Sorprende', baseIntensity: 3, category: 'juego',
    zones: ['labios', 'cuello', 'orejas', 'nuca', 'espalda', 'abdomen', 'cintura', 'caderas', 'senos', 'muslos', 'gluteos', 'pies'], tags: ['libre'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pocosSegundos', 'masTiempo', 'impredecible'],
    conds: ['recibeRitmo', 'daRitmo'] }),
  A({ id: 'parejaElige', name: 'La pareja elige', frame: 'Pregúntale a {P} qué quiere que hagas en {ZONE}, y hazlo {STYLE}', verb: '', baseIntensity: 2, category: 'juego',
    zones: ZONES.map(z => z.id), tags: ['libre'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'firmeza', 'pausas', 'masTiempo', 'hastaCambiar'],
    conds: ['sinHablar', 'elige2', 'recibeCambio'] }),
  A({ id: 'lamer', name: 'Recorrer con la lengua', frame: '{V} {STYLE} {ZONE} de {P} con la lengua', verb: 'Recorre', baseIntensity: 4, category: 'provocacion',
    zones: ['labios', 'cuello', 'orejas', 'abdomen', 'cintura', 'caderas', 'senos', 'dedos', 'muslosInt', 'gluteos', ...INTIMA.filter(z => z !== 'vagina')], tags: ['boca', 'movimiento', 'ligero', 'circular'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'constante', 'subiendo', 'alternando', 'masTiempo', 'hastaCambiar', 'impredecible', 'circulos', 'apenas'] }),
  A({ id: 'apretar', name: 'Apretar suavemente', frame: '{V} {STYLE} {ZONE} de {P} con la mano', verb: 'Aprieta', baseIntensity: 3, category: 'provocacion',
    zones: ['cintura', 'caderas', 'senos', 'manos', 'brazos', 'muslos', 'gluteos'], tags: ['mano', 'presion', 'repetido'],
    styles: ['lento', 'suave', 'delicadeza', 'firmeza', 'pausas', 'alternando', 'pocosSegundos', 'hastaCambiar', 'impredecible'] }),
  A({ id: 'descubrir', name: 'Descubrir la piel', frame: '{V} {STYLE} {ZONE} de {P} apartando la ropa', verb: 'Descubre', baseIntensity: 3, category: 'anticipacion',
    zones: ['hombros', 'cuello', 'espalda', 'lumbar', 'pecho', 'abdomen', 'cintura', 'caderas', 'senos', 'muslos', 'piernas', 'gluteos'], tags: ['ropa', 'movimiento', 'anticipacion'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'impredecible'],
    conds: ['recibeRitmo', 'daRitmo', 'unaMano'] }),
  A({ id: 'frotar', name: 'Frotar el cuerpo', frame: '{V} {STYLE} tu cuerpo contra {ZONE} de {P}', verb: 'Frota', baseIntensity: 4, category: 'intensidad',
    zones: ['espalda', 'pecho', 'caderas', 'muslos', 'gluteos'], tags: ['cuerpo', 'movimiento'],
    styles: ['extremoLento', 'lento', 'firmeza', 'pausas', 'constante', 'subiendo', 'alternando', 'masTiempo', 'hastaCambiar', 'impredecible'],
    conds: ['unaMano', 'manosQuietas'] }),
  A({ id: 'estimular', name: 'Estimular con la mano', frame: '{V} {STYLE} {ZONE} de {P} con la mano', verb: 'Estimula', baseIntensity: 5, category: 'intensidad',
    zones: [...INTIMA, 'senos'], tags: ['mano', 'movimiento', 'circular', 'intimo'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'firmeza', 'pausas', 'constante', 'subiendo', 'bajando', 'alternando', 'masTiempo', 'hastaCambiar', 'impredecible', 'circulos', 'apenas'] }),
  A({ id: 'chupar', name: 'Chupar', frame: '{V} {STYLE} {ZONE} de {P}', verb: 'Chupa', baseIntensity: 5, category: 'intensidad',
    zones: ['senos', 'dedos', 'clitoris', 'pene', 'glande', 'testiculos', 'labiosMayores'], tags: ['boca', 'movimiento', 'intimo'],
    styles: ['extremoLento', 'lento', 'suave', 'delicadeza', 'pausas', 'constante', 'subiendo', 'bajando', 'alternando', 'masTiempo', 'hastaCambiar', 'impredecible'] }),
];
export const ACTION = Object.fromEntries(ACTIONS.map(a => [a.id, a]));

/* Estilos. kind: adv (va junto al verbo) · phrase (va después de la zona) · tail (al final)
   tags: tempo, gentle, presion, ritmo, duration, juego, recorrido */
const S = (id, text, kind, intensityMod, tags, short) => ({ id, text, kind, intensityMod, tags, short });
export const STYLES = [
  S('extremoLento', 'extremadamente despacio', 'adv', 0.4, ['tempo'], 'Muy lento'),
  S('lento', 'lentamente', 'adv', 0.1, ['tempo'], 'Lento'),
  S('suave', 'suavemente', 'adv', -0.3, ['gentle'], 'Suave'),
  S('delicadeza', 'con delicadeza', 'phrase', -0.3, ['gentle'], 'Delicado'),
  S('firmeza', 'con firmeza moderada', 'phrase', 0.3, ['presion'], 'Firme'),
  S('pausas', 'con pequeñas pausas', 'phrase', 0.2, ['ritmo'], 'Con pausas'),
  S('constante', 'manteniendo un ritmo constante', 'phrase', 0, ['ritmo'], 'Constante'),
  S('subiendo', 'aumentando poco a poco el ritmo', 'phrase', 0.5, ['ritmo', 'tempo'], 'Subiendo'),
  S('bajando', 'bajando poco a poco el ritmo', 'phrase', -0.2, ['ritmo', 'tempo'], 'Bajando'),
  S('alternando', 'alternando el ritmo', 'phrase', 0.3, ['ritmo'], 'Alternando'),
  S('pocosSegundos', 'solo durante unos segundos', 'tail', -0.2, ['duration'], 'Unos segundos'),
  S('masTiempo', 'durante un buen rato', 'tail', 0.3, ['duration'], 'Un buen rato'),
  S('hastaCambiar', 'hasta que {P} te pida cambiar', 'tail', 0.3, ['duration', 'control'], 'Hasta que pida'),
  S('impredecible', 'de manera impredecible', 'phrase', 0.3, ['juego'], 'Impredecible'),
  S('circulos', 'haciendo pequeños círculos', 'phrase', 0.2, ['recorrido'], 'En círculos'),
  S('apenas', 'apenas rozando la piel', 'phrase', 0.2, ['gentle', 'ligero'], 'Apenas rozando'),
];
export const STYLE = Object.fromEntries(STYLES.map(s => [s.id, s]));

/* Condiciones. tail: se añade al final · intro: puede abrir la frase · sentence: frase aparte
   needsZoneTags / denyZoneTags · denyActionTags · onlyActionTags · denyStyleTags */
const C = (o) => Object.assign({ tags: [], denyActionTags: [], onlyActionTags: null, denyStyleTags: [], denyZoneTags: [], needsZoneTags: [], intensityMod: 0 }, o);
export const CONDITIONS = [
  C({ id: 'ojosCerrados', short: 'Ojos cerrados', tail: 'mientras {P} mantiene los ojos cerrados', intro: 'Con los ojos cerrados de {P},', sentence: '{P} mantiene los ojos cerrados todo el tiempo.', intensityMod: 0.2, tags: ['sensorial'] }),
  C({ id: 'sinHablar', short: 'Sin hablar', tail: 'sin que ninguno de los dos diga nada', intro: 'Sin decir ni una palabra,', sentence: 'Ninguno de los dos habla hasta terminar.', intensityMod: 0.1, tags: ['silencio'], denyActionTags: ['voz', 'libre'] }),
  C({ id: 'mirada', short: 'Mirándose', tail: 'mirándoos a los ojos', intro: 'Mirándoos a los ojos,', sentence: 'No dejéis de miraros a los ojos.', intensityMod: 0.2, tags: ['visual'], needsZoneTags: ['frontal'], denyActionTags: ['boca'] }),
  C({ id: 'unaMano', short: 'Una mano', tail: 'usando solo una mano', intro: 'Con una sola mano,', sentence: 'Solo puedes usar una mano.', intensityMod: 0, tags: ['limite'], onlyActionTags: ['mano'] }),
  C({ id: 's10', short: '10 segundos', tail: 'durante 10 segundos', intro: 'Durante 10 segundos,', sentence: 'Tienes 10 segundos.', intensityMod: -0.2, tags: ['duration'], seconds: 10, denyStyleTags: ['duration'] }),
  C({ id: 's20', short: '20 segundos', tail: 'durante 20 segundos', intro: 'Durante 20 segundos,', sentence: 'Mantenlo durante 20 segundos.', intensityMod: 0, tags: ['duration'], seconds: 20, denyStyleTags: ['duration'] }),
  C({ id: 's30', short: '30 segundos', tail: 'durante 30 segundos', intro: 'Durante 30 segundos,', sentence: 'Mantenlo durante 30 segundos.', intensityMod: 0.2, tags: ['duration'], seconds: 30, denyStyleTags: ['duration'] }),
  C({ id: 's45', short: '45 segundos', tail: 'durante 45 segundos', intro: 'Durante 45 segundos,', sentence: 'Mantenlo durante 45 segundos, sin prisa.', intensityMod: 0.3, tags: ['duration'], seconds: 45, denyStyleTags: ['duration'] }),
  C({ id: 'recibeRitmo', short: 'Recibe el ritmo', tail: 'dejando que {P} marque el ritmo', sentence: '{P} marca el ritmo en todo momento.', intensityMod: 0.1, tags: ['control'], denyStyleTags: ['ritmo', 'tempo'], denyActionTags: ['quieto', 'sinContacto'] }),
  C({ id: 'recibeCambio', short: 'Recibe decide', tail: 'hasta que {P} decida cambiar', sentence: '{P} decide cuándo cambiar.', intensityMod: 0.2, tags: ['control', 'duration'], denyStyleTags: ['duration'], denyActionTags: ['libre'] }),
  C({ id: 'daRitmo', short: 'Tú el ritmo', tail: 'marcando tú el ritmo que quieras', sentence: 'El ritmo lo decides tú.', intensityMod: 0.1, tags: ['control'], denyStyleTags: ['ritmo', 'tempo'], denyActionTags: ['quieto', 'sinContacto'] }),
  C({ id: 'cambiarPosicion', short: 'Cambio de posición', tail: 'después de cambiar de posición', intro: 'Cambiad de posición y, entonces,', sentence: 'Antes de empezar, cambiad de posición.', intensityMod: 0.1, tags: ['posicion'] }),
  C({ id: 'elige2', short: 'Pareja elige', tail: 'o, si {P} lo prefiere, en {ALT}', sentence: '{P} elige: {ZONE} o {ALT}.', intensityMod: 0, tags: ['eleccion'], denyActionTags: ['libre'], needsAlt: true }),
  C({ id: 'vozBaja', short: 'Voz baja', tail: 'hablándole en voz baja mientras tanto', intro: 'Hablándole en voz baja,', sentence: 'Mientras tanto, háblale en voz baja.', intensityMod: 0.2, tags: ['voz'], denyActionTags: ['voz', 'boca'] }),
  C({ id: 'esperar', short: 'Espera 5 s', tail: 'y quédate así cinco segundos antes de continuar', sentence: 'Quédate así cinco segundos antes de continuar.', intensityMod: 0.3, tags: ['anticipacion', 'duration'], onlyActionTags: ['anticipacion'], denyStyleTags: ['duration'] }),
  C({ id: 'manosQuietas', short: 'Manos quietas', tail: 'mientras {P} mantiene las manos quietas', intro: 'Con las manos quietas de {P},', sentence: '{P} no puede mover las manos.', intensityMod: 0.2, tags: ['limite'] }),
];
export const CONDITION = Object.fromEntries(CONDITIONS.map(c => [c.id, c]));

/* Comodines ⭐ */
export const WILDCARDS = [
  { id: 'tuAccion', short: 'Tú eliges', text: 'Tú eliges qué hacer', kind: 'freeAction', weight: 3 },
  { id: 'tuZona', short: 'Tú eliges', text: 'Tú eliges dónde', kind: 'freeZone', weight: 3 },
  { id: 'parejaTodo', short: 'Pareja elige', text: '{P} elige la ronda', kind: 'partnerAll', weight: 2 },
  { id: 'repiteUna', short: 'Repite', text: 'Repite cambiando una cosa', kind: 'repeatOne', weight: 2 },
  { id: 'sube', short: 'Sube', text: 'Sube la intensidad', kind: 'up', weight: 2 },
  { id: 'baja', short: 'Baja', text: 'Baja la intensidad', kind: 'down', weight: 2 },
  { id: 'cambio', short: 'Cambio', text: 'Cambiad quién lo hace', kind: 'swap', weight: 2 },
];

/* Signature Combos: combinaciones diseñadas a mano. phrase opcional (si no, la genera el NLG). */
export const SIGNATURES = [
  { id: 'sig1', action: 'acercarse', zone: 'cuello', style: 'extremoLento', cond: 'esperar', category: 'anticipacion' },
  { id: 'sig2', action: 'besar', zone: 'hombros', style: 'suave', cond: 's20', category: 'carino' },
  { id: 'sig3', action: 'recorrer', zone: 'espalda', style: 'apenas', cond: 'ojosCerrados', category: 'sensualidad' },
  { id: 'sig4', action: 'contacto', zone: 'pecho', style: 'hastaCambiar', cond: 'mirada', category: 'conexion' },
  { id: 'sig5', action: 'respirar', zone: 'nuca', style: 'lento', cond: 'manosQuietas', category: 'anticipacion' },
  { id: 'sig6', action: 'masajear', zone: 'pies', style: 'firmeza', cond: 'sinHablar', category: 'relax' },
  { id: 'sig7', action: 'recorrerLabios', zone: 'muslosInt', style: 'extremoLento', cond: 'recibeCambio', category: 'provocacion' },
  { id: 'sig8', action: 'mordisquear', zone: 'orejas', style: 'suave', cond: 'vozBaja', category: 'provocacion' },
  { id: 'sig9', action: 'unas', zone: 'lumbar', style: 'apenas', cond: 'ojosCerrados', category: 'sensualidad' },
  { id: 'sig10', action: 'descubrir', zone: 'hombros', style: 'extremoLento', cond: 'mirada', category: 'anticipacion' },
  { id: 'sig11', action: 'acariciar', zone: 'cabello', style: 'lento', cond: 's45', category: 'relax' },
  { id: 'sig12', action: 'soplar', zone: 'abdomen', style: 'suave', cond: 'esperar', category: 'anticipacion' },
  { id: 'sig13', action: 'estimular', zone: 'clitoris', style: 'extremoLento', cond: 'recibeRitmo', category: 'intensidad' },
  { id: 'sig14', action: 'lamer', zone: 'pene', style: 'subiendo', cond: 'ojosCerrados', category: 'intensidad' },
  { id: 'sig15', action: 'besitos', zone: 'manos', style: 'lento', cond: 'mirada', category: 'carino' },
  { id: 'sig16', action: 'frotar', zone: 'gluteos', style: 'alternando', cond: 'manosQuietas', category: 'intensidad' },
];

export const CATEGORIES = {
  relax: 'Relax', conexion: 'Conexión', carino: 'Cariño', juego: 'Juego',
  anticipacion: 'Anticipación', sensualidad: 'Sensualidad', provocacion: 'Provocación', intensidad: 'Intensidad',
};
export const INTENSITY_NAMES = { 1: 'Relajante', 2: 'Cariñoso', 3: 'Sensual', 4: 'Provocador', 5: 'Muy intenso' };
export const MODES = {
  relajado: { name: 'Relajado', ceiling: 3, base: { 1: 0.38, 2: 0.44, 3: 0.18 } },
  sensual: { name: 'Sensual', ceiling: 4, base: { 1: 0.1, 2: 0.3, 3: 0.36, 4: 0.24 } },
  atrevido: { name: 'Atrevido', ceiling: 5, base: { 1: 0.08, 2: 0.2, 3: 0.28, 4: 0.26, 5: 0.18 } },
};
