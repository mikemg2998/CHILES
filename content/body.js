/* CATÁLOGO CORPORAL. Partes que reciben (BODY_PARTS) y partes con las que se actúa (ACTOR_TOOLS). Son datos de
   diseño, no un modelo médico. Cada parte sabe tres cosas que el motor necesita para decidir si una carta puede salir:
     anatomy   → qué anatomía tiene que haber declarado el jugador para que la parte exista (vulva · pene · senos · null)
     lateral   → si tiene lado (izquierdo / derecho / los dos): solo donde tiene sentido
     coveredBy → qué prendas la tapan; la parte es accesible a piel cuando todas esas prendas están fuera (ver engine/clothing.js)
   El texto que ve la pareja vive en la copia de cada carta, no aquí: estas etiquetas son para el Content Lab y el depurador. */
export const ANATOMY = {
  vulva: { label: 'Vulva' },
  pene: { label: 'Pene' },
  senos: { label: 'Senos' },
};
export const ANATOMY_IDS = Object.keys(ANATOMY);

export const GARMENTS = ['top', 'bottoms', 'socks', 'underwear'];
export const GARMENT_LABEL = { top: 'Camiseta', bottoms: 'Pantalón', socks: 'Calcetines', underwear: 'Ropa interior' };
export const GARMENT_STATES = ['ON', 'OFF', 'NONE']; // puesta · quitada · no la lleva hoy

const P = (id, label, o = {}) => Object.assign({ id, label, anatomy: null, lateral: false, coveredBy: [] }, o);
export const BODY_PARTS_LIST = [
  // cabeza y cuello
  P('hair', 'el cabello'), P('forehead', 'la frente'), P('face', 'el rostro'), P('cheeks', 'las mejillas', { lateral: true }),
  P('ears', 'las orejas', { lateral: true }), P('lips', 'los labios'), P('neck', 'el cuello', { lateral: true }), P('nape', 'la nuca'),
  // torso y espalda
  P('shoulders', 'los hombros', { lateral: true }), P('collarbones', 'las clavículas', { lateral: true }),
  P('back', 'la espalda', { coveredBy: ['top'] }), P('lowerBack', 'la zona lumbar', { coveredBy: ['top'] }),
  P('chest', 'el pecho', { coveredBy: ['top'] }), P('abdomen', 'el abdomen', { coveredBy: ['top'] }), P('lowerAbdomen', 'el bajo vientre', { coveredBy: ['top'] }),
  P('waist', 'la cintura', { coveredBy: ['top'] }), P('flanks', 'los costados', { lateral: true, coveredBy: ['top'] }), P('hips', 'las caderas', { lateral: true, coveredBy: ['bottoms'] }),
  P('breasts', 'los senos', { anatomy: 'senos', lateral: true, coveredBy: ['top'] }), P('nipples', 'los pezones', { anatomy: 'senos', lateral: true, coveredBy: ['top'] }),
  // brazos y manos
  P('upperArms', 'los brazos', { lateral: true }), P('forearms', 'los antebrazos', { lateral: true }), P('hands', 'las manos', { lateral: true }),
  P('fingers', 'los dedos', { lateral: true }), P('palms', 'las palmas', { lateral: true }), P('wrists', 'las muñecas', { lateral: true }),
  // piernas y pies
  P('outerThighs', 'los muslos', { lateral: true, coveredBy: ['bottoms'] }), P('innerThighs', 'la parte interna de los muslos', { lateral: true, coveredBy: ['bottoms'] }),
  P('legs', 'las piernas', { lateral: true, coveredBy: ['bottoms'] }), P('backOfLegs', 'la parte de atrás de las piernas', { lateral: true, coveredBy: ['bottoms'] }),
  P('poplitealArea', 'la parte de atrás de las rodillas', { lateral: true, coveredBy: ['bottoms'] }), P('calves', 'las pantorrillas', { lateral: true, coveredBy: ['bottoms'] }),
  P('ankles', 'los tobillos', { lateral: true, coveredBy: ['socks'] }), P('feet', 'los pies', { lateral: true, coveredBy: ['socks'] }), P('toes', 'los dedos de los pies', { lateral: true, coveredBy: ['socks'] }),
  // glúteos y entrepierna
  P('buttocks', 'las nalgas', { lateral: true, coveredBy: ['bottoms', 'underwear'] }), P('hipCrease', 'las ingles', { lateral: true, coveredBy: ['bottoms', 'underwear'] }),
  P('groin', 'la entrepierna', { coveredBy: ['bottoms', 'underwear'] }),
  // anatomía íntima: solo existe si el jugador la ha declarado
  P('vulva', 'la vulva', { anatomy: 'vulva', coveredBy: ['bottoms', 'underwear'] }), P('clitoris', 'el clítoris', { anatomy: 'vulva', coveredBy: ['bottoms', 'underwear'] }),
  P('vagina', 'la vagina', { anatomy: 'vulva', coveredBy: ['bottoms', 'underwear'] }),
  P('penis', 'el pene', { anatomy: 'pene', coveredBy: ['bottoms', 'underwear'] }), P('glans', 'el glande', { anatomy: 'pene', coveredBy: ['bottoms', 'underwear'] }),
  P('testicles', 'los testículos', { anatomy: 'pene', lateral: true, coveredBy: ['bottoms', 'underwear'] }),
  P('anus', 'el ano', { coveredBy: ['bottoms', 'underwear'] }),
  P('wholeBody', 'todo el cuerpo', { coveredBy: ['top', 'bottoms', 'underwear'] }), // solo para cartas de cuerpo entero (abrazo desnudos)
];
export const BODY_PARTS = Object.fromEntries(BODY_PARTS_LIST.map(p => [p.id, p]));

const A = (id, label, o = {}) => Object.assign({ id, label, kind: 'hand', anatomy: null, lateral: false, coveredBy: [] }, o);
export const ACTOR_TOOLS_LIST = [
  A('oneHand', 'una mano', { lateral: true }), A('bothHands', 'las dos manos'), A('fingers', 'los dedos', { lateral: true }), A('fingertips', 'las yemas de los dedos', { lateral: true }),
  A('oneFinger', 'un dedo'), A('thumbs', 'los pulgares'), A('nails', 'las uñas'), A('palm', 'la palma'),
  A('lips', 'los labios', { kind: 'mouth' }), A('mouth', 'la boca', { kind: 'mouth' }), A('tongue', 'la lengua', { kind: 'mouth' }), A('teeth', 'los dientes', { kind: 'mouth' }), A('breath', 'el aliento', { kind: 'mouth' }),
  A('nose', 'la nariz', { kind: 'face' }), A('forehead', 'la frente', { kind: 'face' }), A('head', 'la cabeza', { kind: 'head' }),
  A('arms', 'los brazos', { kind: 'arms' }), A('chest', 'el pecho', { kind: 'torso', coveredBy: ['top'] }), A('hips', 'las caderas', { kind: 'pelvis' }),
  A('thigh', 'el muslo', { kind: 'leg', lateral: true }), A('legs', 'las piernas', { kind: 'leg' }), A('feet', 'los pies', { kind: 'leg', lateral: true, coveredBy: ['socks'] }),
  A('body', 'el cuerpo', { kind: 'body' }),
  A('penis', 'el pene', { kind: 'pelvis', anatomy: 'pene', coveredBy: ['bottoms', 'underwear'] }), A('glans', 'el glande', { kind: 'pelvis', anatomy: 'pene', coveredBy: ['bottoms', 'underwear'] }),
  A('breasts', 'los senos', { kind: 'torso', anatomy: 'senos', coveredBy: ['top'] }),
];
export const ACTOR_TOOLS = Object.fromEntries(ACTOR_TOOLS_LIST.map(t => [t.id, t]));
export const MOUTH_TOOLS = ACTOR_TOOLS_LIST.filter(t => t.kind === 'mouth').map(t => t.id);
