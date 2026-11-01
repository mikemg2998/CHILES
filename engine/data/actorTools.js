/* ACTOR TOOLS: con qué parte del cuerpo se actúa. No toda herramienta puede hacer toda acción (lo dice cada
   ActionDefinition) ni llegar a toda zona (matriz de compatibilidad + biomecánica).
   kind: hand | mouth | face | voice | head | arms | torso | pelvis | leg | body
   phrase: cómo se nombra cuando hace falta nombrarla («con la yema de los dedos»); el realizador la omite cuando es
   obvia para la acción (implicitFor) o cuando la plantilla ya la lleva.
   movements: movimientos que la parte produce · reach: hasta dónde llega sin cambiar de postura. */
const A = (id, kind, phrase, o = {}) => Object.assign({ id, kind, phrase, label: phrase.replace(/^con (la |las |los |el |un |una )?/, ''), movements: ['none', 'slide'], reach: 'any' }, o);
export const ACTOR_TOOLS_LIST = [
  A('oneHand', 'hand', 'con la mano', { movements: ['none', 'slide', 'press', 'grip', 'rub', 'tap'] }),
  A('bothHands', 'hand', 'con las dos manos', { movements: ['none', 'slide', 'press', 'grip', 'rub'] }),
  A('oneFinger', 'hand', 'con un solo dedo', { movements: ['none', 'slide', 'tap'] }),
  A('fingers', 'hand', 'con los dedos', { movements: ['none', 'slide', 'press', 'tap', 'rub'] }),
  A('fingertips', 'hand', 'con la yema de los dedos', { movements: ['none', 'slide', 'press', 'tap'] }),
  A('thumbs', 'hand', 'con los pulgares', { movements: ['press', 'slide'] }),
  A('nails', 'hand', 'con las uñas', { movements: ['slide'] }),
  A('palm', 'hand', 'con la palma de la mano', { movements: ['none', 'slide', 'rub', 'press'] }),
  A('lips', 'mouth', 'con los labios', { movements: ['none', 'slide', 'press', 'tap'], reach: 'head' }),
  A('mouth', 'mouth', 'con la boca', { movements: ['none', 'slide', 'press'], reach: 'head' }),
  A('tongue', 'mouth', 'con la lengua', { movements: ['slide', 'press'], reach: 'head' }),
  A('tongueTip', 'mouth', 'con la punta de la lengua', { movements: ['slide', 'tap'], reach: 'head' }),
  A('teeth', 'mouth', 'con los dientes', { movements: ['tap', 'press'], reach: 'head' }),
  A('breath', 'mouth', 'con el aliento', { movements: ['none'], reach: 'head' }),
  A('nose', 'face', 'con la punta de la nariz', { movements: ['none', 'slide'], reach: 'head' }),
  A('forehead', 'face', 'con la frente', { movements: ['none'], reach: 'head' }),
  A('head', 'head', 'con la cabeza', { movements: ['none'], reach: 'table' }),
  A('voice', 'voice', 'con la voz', { movements: ['none'], reach: 'ear' }),
  A('arms', 'arms', 'con los brazos', { movements: ['none', 'press'], reach: 'table' }),
  A('chest', 'torso', 'con el pecho', { movements: ['none', 'rub'], reach: 'table' }),
  A('hips', 'pelvis', 'con las caderas', { movements: ['none', 'rub'], reach: 'table' }),
  A('thigh', 'leg', 'con el muslo', { movements: ['none', 'slide', 'rub'], reach: 'table' }),
  A('legs', 'leg', 'con las piernas', { movements: ['none'], reach: 'table' }),
  A('body', 'body', 'con el cuerpo', { movements: ['none', 'rub'], reach: 'table' }),
  // herramientas previstas por el modelo sin contenido aprobado todavía (solo cola de revisión)
  A('penis', 'pelvis', 'con el pene', { movements: ['none', 'rub'], reach: 'table' }),
  A('vulva', 'pelvis', 'con la vulva', { movements: ['none', 'rub'], reach: 'table' }),
  A('nipples', 'torso', 'con los pezones', { movements: ['none', 'slide'], reach: 'table' }),
  A('feet', 'leg', 'con los pies', { movements: ['none', 'slide', 'press'], reach: 'table' }),
  A('toes', 'leg', 'con los dedos de los pies', { movements: ['none', 'slide'], reach: 'table' }),
];
export const ACTOR_TOOLS = Object.fromEntries(ACTOR_TOOLS_LIST.map(t => [t.id, t]));
/* capacidades por tipo de parte */
export const KIND_CAPABILITIES = {
  hand: { reach: 'any' }, mouth: { reach: 'head' }, face: { reach: 'head' }, voice: { reach: 'ear' }, head: { reach: 'table' },
  arms: { reach: 'table' }, torso: { reach: 'table' }, pelvis: { reach: 'table' }, leg: { reach: 'table' }, body: { reach: 'table' },
};
