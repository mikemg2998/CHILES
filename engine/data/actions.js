/* ACTION DEFINITIONS. Pocas acciones, cada una con su propia identidad; no hay sinónimos cercanos como acciones
   distintas (la variación de «rozar / recorrer / dibujar» la da la herramienta, el estilo y la plantilla de frase).
   id · name (cara del dado) · semanticFamily · pattern GIVE|MUTUAL|DISCOVER · allowedActorTools · styles (los que la
   acción admite; la zona recorta) · allowedLevels · levelWeights · intensity base 1–10 e intensityRange · movementType
   none|hold|slide|press|tap|grip|rub · pressureProfile light|medium|firm|variable · requiresMovement · biomechanicalRules
   (postura que la propia frase ya aporta, orientación) · contactType mano|boca|cuerpo|ninguno (preferencias «hoy no») ·
   tags (presion, ropa, voz, anticipacion, quieto…) · implicitTools: herramientas que no se nombran porque son obvias
   · styleRate: con qué frecuencia la acción pide estilo (0 = nunca: la frase ya lleva su manera).
   allowedTargets se deriva de la matriz de compatibilidad (grammar.js). baseDurationRange vive en durations.js. */
const stemOf = name => name.toLowerCase().replace(/(ar|er|ir)$/, '').slice(0, 6);
const D = (o) => Object.assign({ pattern: 'GIVE', styles: [], allowedLevels: [1, 2, 3], levelWeights: { 1: 1, 2: 1, 3: 1 }, intensity: 3, intensityRange: [1, 10], movementType: 'slide', pressureProfile: 'light', requiresMovement: true, biomechanicalRules: {}, contactType: 'mano', tags: [], implicitTools: [], styleRate: 0.55 }, o, { stems: [stemOf(o.name), ...(o.stems || [])] }); // raíces del verbo, para que el estilo no lo repita
export const ACTIONS_LIST = [
  D({ id: 'CARESS', name: 'Acariciar', semanticFamily: 'caricia', allowedActorTools: ['oneHand', 'bothHands', 'fingertips', 'palm'], styles: ['SLOW', 'SOFT', 'INTERMITTENT'],
    levelWeights: { 1: 3, 2: [2, 0.8], 3: 0.6 }, intensity: 2.5, movementType: 'slide', pressureProfile: 'light', implicitTools: ['oneHand'] }),
  D({ id: 'BRUSH', name: 'Rozar', semanticFamily: 'caricia', allowedActorTools: ['fingertips', 'fingers', 'oneFinger', 'nails', 'lips', 'nose'], styles: ['SLOW', 'SOFT', 'INTERMITTENT'],
    levelWeights: { 1: 2.5, 2: [2.5, 0.8], 3: 0.5 }, intensity: 3, movementType: 'slide', pressureProfile: 'light' }),
  D({ id: 'MASSAGE', name: 'Masajear', semanticFamily: 'masaje', allowedActorTools: ['bothHands', 'thumbs', 'fingertips'], styles: ['SLOW', 'FIRM', 'SOFT'],
    levelWeights: { 1: 3, 2: [1.2, 0.4], 3: 0.3 }, intensity: 2.5, movementType: 'press', pressureProfile: 'variable', tags: ['presion'], implicitTools: ['bothHands'] }),
  D({ id: 'REST', name: 'Apoyar la mano', semanticFamily: 'masaje', allowedActorTools: ['oneHand', 'bothHands'], styles: [], styleRate: 0,
    levelWeights: { 1: 2.5, 2: [1, 0.2] }, allowedLevels: [1, 2], intensity: 1.5, movementType: 'none', pressureProfile: 'light', requiresMovement: false, tags: ['quieto'], implicitTools: ['oneHand', 'bothHands'] }),
  D({ id: 'KISS', name: 'Besar', semanticFamily: 'beso', allowedActorTools: ['lips'], styles: ['SLOW', 'SOFT', 'INTERMITTENT'],
    levelWeights: { 1: 1, 2: [3, 0.6], 3: 0.5 }, intensity: 4.5, movementType: 'tap', pressureProfile: 'light', contactType: 'boca', implicitTools: ['lips'] }),
  D({ id: 'SUCK', name: 'Chupar', semanticFamily: 'boca', allowedActorTools: ['mouth'], styles: ['SLOW', 'SOFT', 'FIRM', 'INTERMITTENT'],
    levelWeights: { 2: [0.8, 1], 3: 2.5 }, allowedLevels: [2, 3], intensity: 7, intensityRange: [5, 10], movementType: 'press', pressureProfile: 'variable', contactType: 'boca', implicitTools: ['mouth'] }),
  D({ id: 'LICK', name: 'Lamer', semanticFamily: 'boca', allowedActorTools: ['tongue', 'tongueTip'], styles: ['SLOW', 'FAST', 'SOFT', 'INTERMITTENT'],
    levelWeights: { 2: [1, 2.5], 3: 2.5 }, allowedLevels: [2, 3], intensity: 6.5, intensityRange: [4, 10], movementType: 'slide', pressureProfile: 'light', contactType: 'boca', implicitTools: ['tongue'] }),
  D({ id: 'BITE', name: 'Mordisquear', semanticFamily: 'boca', allowedActorTools: ['teeth', 'lips'], styles: ['SOFT', 'INTERMITTENT'],
    levelWeights: { 2: [1.5, 0.9], 3: 0.4 }, allowedLevels: [2, 3], intensity: 5.5, movementType: 'tap', pressureProfile: 'light', contactType: 'boca', tags: ['presion'], implicitTools: ['teeth'] }),
  D({ id: 'HOVER', name: 'Acercarse sin tocar', semanticFamily: 'anticipacion', pattern: 'DISCOVER', allowedActorTools: ['lips', 'breath'], styles: [], styleRate: 0,
    levelWeights: { 2: [1.8, 1], 3: 0.6 }, allowedLevels: [2, 3], intensity: 3.5, movementType: 'none', pressureProfile: 'light', requiresMovement: false, contactType: 'ninguno', tags: ['anticipacion'] }),
  D({ id: 'BLOW', name: 'Soplar', semanticFamily: 'anticipacion', pattern: 'DISCOVER', allowedActorTools: ['breath'], styles: ['SLOW', 'SOFT'], styleRate: 0.3,
    levelWeights: { 2: [2, 0.6], 3: 0.3 }, allowedLevels: [2, 3], intensity: 3.5, movementType: 'none', pressureProfile: 'light', requiresMovement: false, contactType: 'ninguno', tags: ['anticipacion'], implicitTools: ['breath'] }),
  D({ id: 'WHISPER', name: 'Susurrar', semanticFamily: 'voz', allowedActorTools: ['voice'], styles: [], styleRate: 0,
    levelWeights: { 2: [1.5, 0.5], 3: 0.3 }, allowedLevels: [2, 3], intensity: 4, movementType: 'none', pressureProfile: 'light', requiresMovement: false, contactType: 'ninguno', tags: ['voz'], implicitTools: ['voice'] }),
  D({ id: 'HUG', name: 'Abrazar', semanticFamily: 'cercania', pattern: 'MUTUAL', allowedActorTools: ['arms', 'body'], styles: [], styleRate: 0,
    levelWeights: { 1: 2.5, 2: [0.8, 0.2] }, allowedLevels: [1, 2], intensity: 1.5, movementType: 'none', pressureProfile: 'medium', requiresMovement: false, contactType: 'cuerpo', tags: ['quieto'], implicitTools: ['arms', 'body'] }),
  D({ id: 'HOLD_HANDS', name: 'Tomar la mano', semanticFamily: 'cercania', pattern: 'MUTUAL', allowedActorTools: ['bothHands', 'fingers', 'lips'], styles: [], styleRate: 0,
    levelWeights: { 1: 2.5, 2: 0.4 }, allowedLevels: [1, 2], intensity: 1, movementType: 'none', pressureProfile: 'light', requiresMovement: false, contactType: 'mano', tags: ['quieto'], implicitTools: ['bothHands', 'fingers', 'lips'] }),
  D({ id: 'BODY_CONTACT', name: 'Cuerpo con cuerpo', semanticFamily: 'cercania', pattern: 'MUTUAL', allowedActorTools: ['chest', 'hips', 'body', 'legs', 'forehead', 'head'], styles: [], styleRate: 0,
    levelWeights: { 1: 2, 2: [1.4, 1], 3: 0.5 }, intensity: 3, intensityRange: [1, 8], movementType: 'none', pressureProfile: 'medium', requiresMovement: false, contactType: 'cuerpo', tags: ['quieto'], implicitTools: ['chest', 'hips', 'body', 'legs', 'forehead', 'head'] }),
  D({ id: 'RUB', name: 'Frotar', semanticFamily: 'cuerpo', pattern: 'MUTUAL', allowedActorTools: ['hips', 'thigh', 'chest', 'palm'], styles: ['SLOW', 'FIRM', 'FAST'],
    levelWeights: { 2: [0.3, 1.4], 3: 1 }, allowedLevels: [2, 3], intensity: 7, intensityRange: [5, 10], movementType: 'rub', pressureProfile: 'medium', contactType: 'cuerpo', biomechanicalRules: { posture: { hips: 'LYING', thigh: 'FACE', chest: 'LYING' } } }),
  D({ id: 'SQUEEZE', name: 'Apretar', stems: ['apriet'], semanticFamily: 'presion', allowedActorTools: ['oneHand', 'bothHands'], styles: ['SOFT', 'FIRM', 'INTERMITTENT'],
    levelWeights: { 2: [0.6, 1.5], 3: 0.8 }, allowedLevels: [2, 3], intensity: 6, movementType: 'grip', pressureProfile: 'firm', contactType: 'mano', tags: ['presion'], implicitTools: ['oneHand'] }),
  D({ id: 'GRIP', name: 'Sujetar', semanticFamily: 'presion', allowedActorTools: ['oneHand', 'bothHands'], styles: [], styleRate: 0,
    levelWeights: { 2: [1.2, 1.3], 3: 0.6 }, allowedLevels: [2, 3], intensity: 5.5, movementType: 'grip', pressureProfile: 'firm', requiresMovement: false, contactType: 'mano', tags: ['presion'], implicitTools: ['oneHand', 'bothHands'] }),
  D({ id: 'SPANK', name: 'Nalgada', semanticFamily: 'presion', allowedActorTools: ['oneHand'], styles: [], styleRate: 0,
    levelWeights: { 2: 1, 3: 0.6 }, allowedLevels: [2, 3], intensity: 7, movementType: 'tap', pressureProfile: 'firm', contactType: 'mano', tags: ['presion'], implicitTools: ['oneHand'] }),
  D({ id: 'TICKLE', name: 'Cosquillear', semanticFamily: 'juego', allowedActorTools: ['fingers', 'fingertips'], styles: ['SOFT', 'INTERMITTENT', 'FAST'],
    levelWeights: { 1: 1.5, 2: [1, 0.3] }, allowedLevels: [1, 2], intensity: 2.5, movementType: 'tap', pressureProfile: 'light', contactType: 'mano', tags: ['juego'], implicitTools: ['fingers'] }),
  D({ id: 'HAIR_PLAY', name: 'Cabello', semanticFamily: 'juego', allowedActorTools: ['fingers'], styles: ['SLOW', 'SOFT'],
    levelWeights: { 1: 2.5, 2: 0.4 }, allowedLevels: [1, 2], intensity: 1.5, movementType: 'slide', pressureProfile: 'light', contactType: 'mano', implicitTools: ['fingers'] }),
  D({ id: 'STIMULATE', name: 'Estimular', semanticFamily: 'intimo', allowedActorTools: ['fingers', 'oneHand', 'mouth', 'tongue'], styles: ['SLOW', 'FAST', 'SOFT', 'FIRM', 'INTERMITTENT'],
    levelWeights: { 3: 3 }, allowedLevels: [3], intensity: 8.5, intensityRange: [7, 10], movementType: 'slide', pressureProfile: 'variable', contactType: 'mano' }),
  D({ id: 'INSERT', name: 'Introducir', semanticFamily: 'intimo', allowedActorTools: ['oneFinger'], styles: ['SLOW', 'SOFT'],
    levelWeights: { 3: 1.5 }, allowedLevels: [3], intensity: 9.5, intensityRange: [8, 10], movementType: 'slide', pressureProfile: 'light', contactType: 'mano', implicitTools: ['oneFinger'] }),
  D({ id: 'UNCOVER', name: 'La ropa', semanticFamily: 'ropa', pattern: 'DISCOVER', allowedActorTools: ['oneHand', 'bothHands'], styles: [], styleRate: 0,
    levelWeights: { 2: [1.5, 0.5] }, allowedLevels: [2], intensity: 5, movementType: 'slide', pressureProfile: 'light', requiresMovement: false, contactType: 'mano', tags: ['ropa', 'anticipacion'], implicitTools: ['oneHand', 'bothHands'] }),
  D({ id: 'ADVANCE', name: 'Mano que avanza', semanticFamily: 'anticipacion', pattern: 'DISCOVER', allowedActorTools: ['oneHand'], styles: [], styleRate: 0,
    levelWeights: { 2: [1.6, 1], 3: 0.5 }, allowedLevels: [2, 3], intensity: 5.5, movementType: 'slide', pressureProfile: 'light', requiresMovement: false, contactType: 'mano', tags: ['anticipacion'], implicitTools: ['oneHand'] }),
];
export const ACTIONS = Object.fromEntries(ACTIONS_LIST.map(a => [a.id, a]));
/* acciones base del modelo (RUB SQUEEZE MASSAGE LICK SUCK STIMULATE TICKLE BRUSH KISS CARESS) + gestos propios del juego */
export const BASE_ACTIONS = ['RUB', 'SQUEEZE', 'MASSAGE', 'LICK', 'SUCK', 'STIMULATE', 'TICKLE', 'BRUSH', 'KISS', 'CARESS'];
