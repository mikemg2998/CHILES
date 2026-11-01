/* TARGET DEFINITIONS (zonas que reciben). Identificadores internos normalizados en inglés; el texto que ve la pareja
   es natural y en español («detrás de la rodilla», no «zona poplítea»). Metadatos de DISEÑO, no médicos:
   sensitivity 1–10 (cuánto sube la intensidad de una interacción sobre la zona) · pressureTolerance low|medium|high ·
   allowedStyles (estilos que tienen sentido sobre la zona) · durationSensitivity short|normal|long (cuánto aguanta la
   zona la misma acción) · allowedLevels · levelWeights (peso relativo en cada nivel) · anatomy: parte íntima que exige
   (vulva | pene | null) · group: grupo que la pareja activa en ajustes · family: familia anatómica para no repetir la
   misma idea en tiradas seguidas · tags: frontal (se puede mirar a los ojos) · detras (se trabaja desde atrás) ·
   tumbado (mejor tumbados) · largo (se puede recorrer) · par (izquierda/derecha) · intimo.
   allowedActions y allowedActorTools se derivan de la matriz de compatibilidad al cargar (grammar.js): una sola fuente de verdad. */
export const GROUPS = {
  cabeza: { name: 'Cabeza, rostro y cuello', default: true },
  torso: { name: 'Torso y espalda', default: true },
  senos: { name: 'Senos', default: true },
  brazos: { name: 'Brazos y manos', default: true },
  piernas: { name: 'Piernas y pies', default: true },
  gluteos: { name: 'Glúteos y entrepierna', default: true },
  intimaF: { name: 'Anatomía íntima femenina', default: true, intimate: true, anatomy: 'vulva' },
  intimaM: { name: 'Anatomía íntima masculina', default: true, intimate: true, anatomy: 'pene' },
};
const ALL_STYLES = ['SLOW', 'FAST', 'SOFT', 'FIRM', 'INTERMITTENT'];
const T = (id, n, o) => {
  const t = Object.assign({ id, n, np: null, group: 'torso', family: null, anatomy: null, sensitivity: 3, pressureTolerance: 'medium', allowedStyles: ALL_STYLES, durationSensitivity: 'normal', allowedLevels: [1, 2, 3], levelWeights: null, tags: [], legacy: [] }, o);
  t.np = t.np || n.replace(/^(el|la) /, 'su ').replace(/^(los|las) /, 'sus ');
  if (t.anatomy) t.tags = [...new Set([...t.tags, 'intimo'])];
  if (t.tags.includes('intimo')) t.allowedLevels = [3];
  return t;
};
const NO_FIRM = ['SLOW', 'FAST', 'SOFT', 'INTERMITTENT'], GENTLE = ['SLOW', 'SOFT', 'INTERMITTENT'], STEADY = ['SLOW', 'SOFT', 'FIRM'];
export const TARGETS_LIST = [
  // cabeza y cuello
  T('hair', 'el cabello', { group: 'cabeza', family: 'rostro', sensitivity: 1.5, pressureTolerance: 'medium', allowedStyles: STEADY, durationSensitivity: 'long', allowedLevels: [1, 2], levelWeights: { 1: 3, 2: 0.6 }, tags: ['detras'], legacy: ['cabello'] }),
  T('forehead', 'la frente', { group: 'cabeza', family: 'rostro', sensitivity: 1, allowedStyles: GENTLE, allowedLevels: [1, 2], levelWeights: { 1: 1.2, 2: 0.3 }, tags: ['frontal'], legacy: ['frente'] }),
  T('temples', 'las sienes', { group: 'cabeza', family: 'rostro', sensitivity: 1.5, pressureTolerance: 'low', allowedStyles: GENTLE, allowedLevels: [1, 2], levelWeights: { 1: 1.5, 2: 0.3 }, tags: ['frontal', 'par'], legacy: ['sienes'] }),
  T('cheeks', 'las mejillas', { group: 'cabeza', family: 'rostro', sensitivity: 2, pressureTolerance: 'low', allowedStyles: GENTLE, allowedLevels: [1, 2], levelWeights: { 1: 2, 2: 0.5 }, tags: ['frontal', 'par'], legacy: ['mejillas'] }),
  T('face', 'el rostro', { group: 'cabeza', family: 'rostro', sensitivity: 2, pressureTolerance: 'low', allowedStyles: GENTLE, allowedLevels: [1, 2], levelWeights: { 1: 2, 2: 0.5 }, tags: ['frontal'], legacy: ['rostro'] }),
  T('nose', 'la nariz', { group: 'cabeza', family: 'rostro', sensitivity: 1.5, pressureTolerance: 'low', allowedStyles: ['SLOW', 'SOFT'], allowedLevels: [1], levelWeights: { 1: 1.5 }, tags: ['frontal'], legacy: [] }),
  T('ears', 'las orejas', { group: 'cabeza', family: 'cuello', sensitivity: 3.5, pressureTolerance: 'low', allowedStyles: GENTLE, durationSensitivity: 'short', allowedLevels: [1, 2], levelWeights: { 1: 0.8, 2: [1, 0.5] }, tags: ['par'], legacy: ['orejas'] }),
  T('lips', 'los labios', { group: 'cabeza', family: 'boca', sensitivity: 4.5, pressureTolerance: 'low', allowedStyles: GENTLE, allowedLevels: [2, 3], levelWeights: { 2: [3, 0.8], 3: 0.5 }, tags: ['frontal'], legacy: ['labios'] }),
  T('neck', 'el cuello', { group: 'cabeza', family: 'cuello', sensitivity: 3.5, pressureTolerance: 'low', allowedStyles: NO_FIRM, allowedLevels: [1, 2, 3], levelWeights: { 1: 1.5, 2: [2, 0.4], 3: 0.3 }, tags: ['frontal', 'largo'], legacy: ['cuello'] }),
  T('nape', 'la nuca', { group: 'cabeza', family: 'cuello', sensitivity: 3, pressureTolerance: 'medium', allowedStyles: ALL_STYLES, allowedLevels: [1, 2], levelWeights: { 1: 1.5, 2: [1, 0.3] }, tags: ['detras'], legacy: ['nuca'] }),
  // torso y espalda
  T('shoulders', 'los hombros', { group: 'torso', family: 'espalda', sensitivity: 1.5, pressureTolerance: 'high', allowedStyles: ALL_STYLES, durationSensitivity: 'long', allowedLevels: [1, 2], levelWeights: { 1: 3, 2: [0.5, 0.2] }, tags: ['frontal', 'detras', 'par'], legacy: ['hombros'] }),
  T('collarbones', 'las clavículas', { group: 'torso', family: 'cuello', sensitivity: 3, pressureTolerance: 'low', allowedStyles: GENTLE, allowedLevels: [1, 2], levelWeights: { 1: 1.2, 2: [1.6, 0.5] }, tags: ['frontal', 'par'], legacy: ['clavicula'] }),
  T('back', 'la espalda', { group: 'torso', family: 'espalda', sensitivity: 2.5, pressureTolerance: 'high', allowedStyles: ALL_STYLES, durationSensitivity: 'long', allowedLevels: [1, 2], levelWeights: { 1: 3, 2: [1, 0.4] }, tags: ['largo', 'detras', 'tumbado'], legacy: ['espalda'] }),
  T('lowerBack', 'la zona lumbar', { np: 'su zona lumbar', group: 'torso', family: 'espalda', sensitivity: 4.5, pressureTolerance: 'high', allowedStyles: ALL_STYLES, durationSensitivity: 'long', allowedLevels: [2, 3], levelWeights: { 2: [2, 0.8], 3: 0.4 }, tags: ['detras', 'tumbado'], legacy: ['lumbar'] }),
  T('chest', 'el pecho', { group: 'torso', family: 'torso', sensitivity: 5, pressureTolerance: 'medium', allowedStyles: ALL_STYLES, allowedLevels: [2, 3], levelWeights: { 2: [2, 1], 3: 0.5 }, tags: ['frontal', 'largo', 'tumbado'], legacy: ['pecho'] }),
  T('abdomen', 'el abdomen', { group: 'torso', family: 'torso', sensitivity: 4.5, pressureTolerance: 'low', allowedStyles: NO_FIRM, allowedLevels: [2, 3], levelWeights: { 2: [2, 1], 3: 0.5 }, tags: ['frontal', 'largo', 'tumbado'], legacy: ['abdomen'] }),
  T('lowerAbdomen', 'el bajo vientre', { np: 'su bajo vientre', group: 'torso', family: 'vientre', sensitivity: 6.5, pressureTolerance: 'low', allowedStyles: GENTLE, allowedLevels: [2, 3], levelWeights: { 2: [1, 1.8], 3: 1.2 }, tags: ['frontal', 'tumbado'], legacy: ['abdomenBajo'] }),
  T('waist', 'la cintura', { group: 'torso', family: 'torso', sensitivity: 3.5, pressureTolerance: 'medium', allowedStyles: ALL_STYLES, allowedLevels: [1, 2], levelWeights: { 1: 1.2, 2: [2, 0.4] }, tags: ['frontal'], legacy: ['cintura'] }),
  T('flanks', 'los costados', { group: 'torso', family: 'torso', sensitivity: 4.5, pressureTolerance: 'low', allowedStyles: GENTLE, allowedLevels: [2, 3], levelWeights: { 2: [1.8, 0.8], 3: 0.4 }, tags: ['frontal', 'largo', 'tumbado', 'par'], legacy: ['costados'] }),
  T('hips', 'las caderas', { group: 'torso', family: 'vientre', sensitivity: 5, pressureTolerance: 'high', allowedStyles: ALL_STYLES, allowedLevels: [2, 3], levelWeights: { 2: [2, 1.6], 3: 0.8 }, tags: ['frontal', 'par'], legacy: ['caderas'] }),
  T('breasts', 'los senos', { group: 'senos', family: 'senos', sensitivity: 6.5, pressureTolerance: 'medium', allowedStyles: ALL_STYLES, allowedLevels: [2, 3], levelWeights: { 2: [2, 1.4], 3: 1 }, tags: ['frontal', 'tumbado', 'par'], legacy: ['senos'] }),
  T('nipples', 'los pezones', { group: 'senos', family: 'senos', sensitivity: 8, pressureTolerance: 'low', allowedStyles: NO_FIRM, durationSensitivity: 'short', allowedLevels: [2, 3], levelWeights: { 2: 1.6, 3: 1.2 }, tags: ['frontal', 'tumbado', 'par'], legacy: ['pezones'] }),
  // brazos y manos
  T('upperArms', 'los brazos', { group: 'brazos', family: 'brazos', sensitivity: 1, pressureTolerance: 'high', allowedStyles: ALL_STYLES, durationSensitivity: 'long', allowedLevels: [1, 2], levelWeights: { 1: 3, 2: 0.4 }, tags: ['frontal', 'largo', 'par'], legacy: ['brazos'] }),
  T('forearms', 'los antebrazos', { group: 'brazos', family: 'brazos', sensitivity: 1.5, pressureTolerance: 'high', allowedStyles: ALL_STYLES, allowedLevels: [1, 2], levelWeights: { 1: 1.5, 2: 0.3 }, tags: ['frontal', 'largo', 'par'], legacy: [] }),
  T('hands', 'las manos', { group: 'brazos', family: 'brazos', sensitivity: 1, pressureTolerance: 'high', allowedStyles: STEADY, durationSensitivity: 'long', allowedLevels: [1, 2], levelWeights: { 1: 3, 2: 0.3 }, tags: ['frontal', 'par'], legacy: ['manos'] }),
  T('palms', 'las palmas de las manos', { np: 'las palmas de sus manos', group: 'brazos', family: 'brazos', sensitivity: 1.5, pressureTolerance: 'high', allowedStyles: GENTLE, allowedLevels: [1, 2], levelWeights: { 1: 2, 2: 0.3 }, tags: ['frontal', 'par'], legacy: ['palmas'] }),
  T('fingers', 'los dedos', { group: 'brazos', family: 'brazos', sensitivity: 1.5, pressureTolerance: 'medium', allowedStyles: ['SLOW', 'SOFT'], allowedLevels: [1, 2], levelWeights: { 1: 1.5, 2: 0.3 }, tags: ['frontal', 'par'], legacy: ['dedos'] }),
  T('wrists', 'las muñecas', { group: 'brazos', family: 'brazos', sensitivity: 2, pressureTolerance: 'medium', allowedStyles: GENTLE, allowedLevels: [1, 2], levelWeights: { 1: 2, 2: [1, 0.3] }, tags: ['frontal', 'par'], legacy: ['munecas'] }),
  T('armpits', 'las axilas', { group: 'brazos', family: 'brazos', sensitivity: 4, pressureTolerance: 'low', allowedStyles: ['SOFT', 'INTERMITTENT'], durationSensitivity: 'short', allowedLevels: [2], levelWeights: { 2: 0.3 }, tags: ['frontal', 'tumbado', 'par'], legacy: [] }),
  // piernas y pies
  T('outerThighs', 'los muslos', { group: 'piernas', family: 'muslos', sensitivity: 5, pressureTolerance: 'high', allowedStyles: ALL_STYLES, durationSensitivity: 'long', allowedLevels: [2, 3], levelWeights: { 2: [2, 1], 3: 0.5 }, tags: ['frontal', 'largo', 'tumbado', 'par'], legacy: ['muslos'] }),
  T('innerThighs', 'la parte interna de los muslos', { np: 'la parte interna de sus muslos', group: 'piernas', family: 'muslos', sensitivity: 6.5, pressureTolerance: 'low', allowedStyles: NO_FIRM, allowedLevels: [2, 3], levelWeights: { 2: 2, 3: 1.4 }, tags: ['frontal', 'largo', 'tumbado', 'par'], legacy: ['muslosInt'] }),
  T('legs', 'las piernas', { group: 'piernas', family: 'piernas', sensitivity: 2, pressureTolerance: 'high', allowedStyles: ALL_STYLES, durationSensitivity: 'long', allowedLevels: [1, 2], levelWeights: { 1: 2, 2: 0.4 }, tags: ['largo', 'tumbado', 'par'], legacy: ['piernas'] }),
  T('poplitealArea', 'la parte de atrás de las rodillas', { np: 'la parte de atrás de sus rodillas', group: 'piernas', family: 'piernas', sensitivity: 4, pressureTolerance: 'low', allowedStyles: GENTLE, durationSensitivity: 'short', allowedLevels: [2], levelWeights: { 2: [1.2, 0.4] }, tags: ['tumbado', 'detras', 'par'], legacy: ['rodillas'] }),
  T('calves', 'las pantorrillas', { group: 'piernas', family: 'piernas', sensitivity: 1.5, pressureTolerance: 'high', allowedStyles: STEADY, durationSensitivity: 'long', allowedLevels: [1, 2], levelWeights: { 1: 1.5, 2: 0.3 }, tags: ['tumbado', 'par'], legacy: ['pantorrillas'] }),
  T('ankles', 'los tobillos', { group: 'piernas', family: 'piernas', sensitivity: 2, pressureTolerance: 'medium', allowedStyles: ['SLOW', 'SOFT'], allowedLevels: [1, 2], levelWeights: { 1: 1.5, 2: 0.5 }, tags: ['tumbado', 'par'], legacy: ['tobillos'] }),
  T('feet', 'los pies', { group: 'piernas', family: 'piernas', sensitivity: 2, pressureTolerance: 'high', allowedStyles: STEADY, durationSensitivity: 'long', allowedLevels: [1, 2], levelWeights: { 1: 2, 2: 0.4 }, tags: ['tumbado', 'par'], legacy: ['pies'] }),
  T('toes', 'los dedos de los pies', { np: 'los dedos de sus pies', group: 'piernas', family: 'piernas', sensitivity: 2, pressureTolerance: 'medium', allowedStyles: ['SLOW', 'SOFT'], allowedLevels: [1, 2], levelWeights: { 1: 0.6, 2: 0.2 }, tags: ['tumbado', 'par'], legacy: [] }),
  // glúteos y entrepierna
  T('buttocks', 'los glúteos', { group: 'gluteos', family: 'gluteos', sensitivity: 6.5, pressureTolerance: 'high', allowedStyles: ALL_STYLES, allowedLevels: [2, 3], levelWeights: { 2: [1, 1.8], 3: 1.2 }, tags: ['detras', 'tumbado', 'par'], legacy: ['gluteos'] }),
  T('hipCrease', 'las ingles', { group: 'gluteos', family: 'entrepierna', sensitivity: 7, pressureTolerance: 'low', allowedStyles: GENTLE, allowedLevels: [2, 3], levelWeights: { 2: 1.5, 3: 1 }, tags: ['frontal', 'tumbado', 'par'], legacy: ['ingles'] }),
  T('groin', 'la entrepierna', { group: 'gluteos', family: 'entrepierna', sensitivity: 7.5, pressureTolerance: 'medium', allowedStyles: ALL_STYLES, allowedLevels: [2, 3], levelWeights: { 2: 1.5, 3: 1 }, tags: ['frontal', 'tumbado'], legacy: ['entrepierna'] }),
  // anatomía íntima (solo en Intimidad y solo si quien recibe la tiene)
  T('vulva', 'la vulva', { group: 'intimaF', family: 'intimaF', anatomy: 'vulva', sensitivity: 9, pressureTolerance: 'low', allowedStyles: NO_FIRM, levelWeights: { 3: 2.5 }, tags: ['frontal', 'tumbado'], legacy: ['vulva', 'labiosMayores', 'labiosMenores'] }),
  T('clitoris', 'el clítoris', { group: 'intimaF', family: 'intimaF', anatomy: 'vulva', sensitivity: 9.5, pressureTolerance: 'low', allowedStyles: NO_FIRM, durationSensitivity: 'short', levelWeights: { 3: 2.5 }, tags: ['frontal', 'tumbado'], legacy: ['clitoris'] }),
  T('vagina', 'la vagina', { group: 'intimaF', family: 'intimaF', anatomy: 'vulva', sensitivity: 9.5, pressureTolerance: 'low', allowedStyles: ['SLOW', 'SOFT'], levelWeights: { 3: 1.5 }, tags: ['tumbado'], legacy: ['vagina'] }),
  T('penis', 'el pene', { group: 'intimaM', family: 'intimaM', anatomy: 'pene', sensitivity: 9, pressureTolerance: 'medium', allowedStyles: ALL_STYLES, levelWeights: { 3: 2.5 }, tags: ['frontal', 'tumbado'], legacy: ['pene'] }),
  T('glans', 'el glande', { group: 'intimaM', family: 'intimaM', anatomy: 'pene', sensitivity: 9.5, pressureTolerance: 'low', allowedStyles: NO_FIRM, durationSensitivity: 'short', levelWeights: { 3: 2 }, tags: ['frontal', 'tumbado'], legacy: ['glande'] }),
  T('testicles', 'los testículos', { group: 'intimaM', family: 'intimaM', anatomy: 'pene', sensitivity: 8.5, pressureTolerance: 'low', allowedStyles: ['SLOW', 'SOFT', 'INTERMITTENT'], levelWeights: { 3: 1.5 }, tags: ['tumbado', 'par'], legacy: ['testiculos'] }),
  T('anus', 'el ano', { group: 'gluteos', family: 'gluteos', sensitivity: 9, pressureTolerance: 'low', allowedStyles: ['SLOW', 'SOFT'], allowedLevels: [3], levelWeights: { 3: 0.5 }, tags: ['intimo', 'tumbado', 'detras'], legacy: [] }), // sin combinaciones aprobadas: solo existe como id (cola de revisión)
];
export const TARGETS = Object.fromEntries(TARGETS_LIST.map(t => [t.id, t]));
/* ids antiguos de zona (favoritas guardadas, pruebas) → target */
export const LEGACY_TARGET = {};
for (const t of TARGETS_LIST) for (const l of t.legacy) LEGACY_TARGET[l] = t.id;
/* altura de la zona (para la boca: cuánto hay que bajar) y lado (orientación) */
const LOW = new Set(['outerThighs', 'innerThighs', 'legs', 'buttocks', 'groin', 'hipCrease', 'vulva', 'clitoris', 'vagina', 'penis', 'glans', 'testicles', 'poplitealArea', 'anus']);
const VERY_LOW = new Set(['feet', 'ankles', 'calves', 'toes']);
const HIGH = new Set(['hair', 'forehead', 'cheeks', 'face', 'ears', 'lips', 'neck', 'nape', 'shoulders', 'temples', 'collarbones', 'hands', 'fingers', 'palms', 'wrists', 'upperArms', 'forearms', 'nose']);
export const targetHeight = t => VERY_LOW.has(t.id) ? 'suelo' : LOW.has(t.id) ? 'baja' : HIGH.has(t.id) ? 'alta' : 'media';
export const targetSide = t => { const f = t.tags.includes('frontal'), d = t.tags.includes('detras'); return f && !d ? 'frente' : d && !f ? 'detras' : 'ambos'; };
