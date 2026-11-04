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

/* Prendas reales e independientes. Camiseta ≠ brasier; pantalón ≠ panties / calzoncillos. Qué prendas existen para un
   jugador depende de su configuración corporal (no de un género): brasier si declaró senos; calzoncillos si declaró pene;
   panties en el resto de casos. En coveredBy, 'underwear' significa «la prenda interior de abajo que lleve ese jugador». */
export const GARMENTS = ['top', 'bottoms', 'socks', 'bra', 'panties', 'boxers'];
export const GARMENT_LABEL = { top: 'Camiseta', bottoms: 'Pantalón', socks: 'Calcetines', bra: 'Brasier', panties: 'Panties', boxers: 'Calzoncillos' };
/* Estados de una prenda. Dos ausencias distintas, porque son historias distintas:
     ON        puesta ahora
     OFF       la llevaba y ya se la quitó en esta sesión
     NOT_WORN  entró a esta sesión sin ella («No la llevo»): nunca se ofrece quitarla ni se asume que apareció después
     NONE      no aplica a su configuración (NOT_APPLICABLE): no existe para ese jugador
   OFF, NOT_WORN y NONE dejan pasar al acceso directo igual; se distinguen para el historial, UNDRESS, la interfaz y el depurador. */
export const GARMENT_STATES = ['ON', 'OFF', 'NOT_WORN', 'NONE'];
export const NOT_APPLICABLE = 'NONE';
/* CAPAS DE ROPA. Cada prenda tiene capa (OUTER · UNDERWEAR), zona (TORSO · LOWER · FEET) y, si es interior, la prenda exterior
   que la cubre (`under`): solo puede quitarse normalmente cuando esa exterior está fuera. Lo que tapa cada prenda lo dicen las
   partes del cuerpo (coveredBy). Las tres columnas: CAPA EXTERIOR → CAPA INTERIOR → ACCESO DIRECTO. */
export const GARMENT_LAYERS = {
  top: { layer: 'OUTER', zone: 'TORSO', under: null },
  bra: { layer: 'UNDERWEAR', zone: 'TORSO', under: 'top', requiresOuterRemovedForUndress: true },
  bottoms: { layer: 'OUTER', zone: 'LOWER', under: null },
  panties: { layer: 'UNDERWEAR', zone: 'LOWER', under: 'bottoms', requiresOuterRemovedForUndress: true },
  boxers: { layer: 'UNDERWEAR', zone: 'LOWER', under: 'bottoms', requiresOuterRemovedForUndress: true },
  socks: { layer: 'OUTER', zone: 'FEET', under: null },
};
export const UNDERWEAR_GARMENTS = GARMENTS.filter(g => GARMENT_LAYERS[g].layer === 'UNDERWEAR');
/* Prendas interiores de un jugador: lo que indique en Ajustes (`underwear`) o, si no lo ha indicado, lo que sugiere su
   configuración corporal. Nunca un género: brasier si declara senos o vulva; panties si declara vulva o no declara pene;
   calzoncillos si declara pene sin vulva. Cualquier combinación se puede corregir a mano. */
export const UNDERWEAR_DEFAULT = { bra: d => d.includes('senos') || d.includes('vulva'), panties: d => d.includes('vulva') || !d.includes('pene'), boxers: d => d.includes('pene') && !d.includes('vulva') };
export const defaultUnderwear = (declared = []) => ['bra', 'panties', 'boxers'].filter(g => UNDERWEAR_DEFAULT[g](declared));
export const garmentsFor = (declared = [], underwear = null) => { const u = Array.isArray(underwear) ? underwear : defaultUnderwear(declared); return ['top', 'bottoms', 'socks', ...['bra', 'panties', 'boxers'].filter(g => u.includes(g))]; };

/* regiones corporales (para medir y ponderar diversidad; nunca para filtrar) */
export const BODY_REGIONS = ['FACE', 'NECK', 'ARMS_HANDS', 'CHEST', 'ABDOMEN', 'BACK', 'HIPS_GLUTES', 'THIGHS_LEGS', 'FEET', 'INTIMATE', 'FULL_BODY'];
const REGION_OF = { hair: 'FACE', forehead: 'FACE', face: 'FACE', cheeks: 'FACE', ears: 'FACE', lips: 'FACE', neck: 'NECK', nape: 'NECK', shoulders: 'BACK', collarbones: 'CHEST', back: 'BACK', lowerBack: 'BACK', chest: 'CHEST', abdomen: 'ABDOMEN', lowerAbdomen: 'ABDOMEN', waist: 'ABDOMEN', flanks: 'ABDOMEN', hips: 'HIPS_GLUTES', breasts: 'CHEST', nipples: 'CHEST', upperArms: 'ARMS_HANDS', forearms: 'ARMS_HANDS', hands: 'ARMS_HANDS', fingers: 'ARMS_HANDS', palms: 'ARMS_HANDS', wrists: 'ARMS_HANDS', outerThighs: 'THIGHS_LEGS', innerThighs: 'THIGHS_LEGS', legs: 'THIGHS_LEGS', backOfLegs: 'THIGHS_LEGS', poplitealArea: 'THIGHS_LEGS', calves: 'THIGHS_LEGS', ankles: 'FEET', feet: 'FEET', toes: 'FEET', buttocks: 'HIPS_GLUTES', hipCrease: 'HIPS_GLUTES', groin: 'INTIMATE', vulva: 'INTIMATE', clitoris: 'INTIMATE', vagina: 'INTIMATE', penis: 'INTIMATE', glans: 'INTIMATE', testicles: 'INTIMATE', anus: 'INTIMATE', wholeBody: 'FULL_BODY' };
const P = (id, label, o = {}) => Object.assign({ id, label, anatomy: null, lateral: false, coveredBy: [], region: REGION_OF[id] }, o);
export const BODY_PARTS_LIST = [
  // cabeza y cuello
  P('hair', 'el cabello'), P('forehead', 'la frente'), P('face', 'el rostro'), P('cheeks', 'las mejillas', { lateral: true }),
  P('ears', 'las orejas', { lateral: true }), P('lips', 'los labios'), P('neck', 'el cuello', { lateral: true }), P('nape', 'la nuca'),
  // torso y espalda
  P('shoulders', 'los hombros', { lateral: true }), P('collarbones', 'las clavículas', { lateral: true }),
  P('back', 'la espalda', { coveredBy: ['top'] }), P('lowerBack', 'la zona lumbar', { coveredBy: ['top'] }),
  P('chest', 'el pecho', { coveredBy: ['top'] }), P('abdomen', 'el abdomen', { coveredBy: ['top'] }), P('lowerAbdomen', 'el bajo vientre', { coveredBy: ['top'] }),
  P('waist', 'la cintura', { coveredBy: ['top'] }), P('flanks', 'los costados', { lateral: true, coveredBy: ['top'] }), P('hips', 'las caderas', { lateral: true, coveredBy: ['bottoms'] }),
  P('breasts', 'los senos', { anatomy: 'senos', lateral: true, coveredBy: ['top', 'bra'] }),
  /* NIPPLES es un target INDEPENDIENTE de BREASTS (2026-11-03): existe en cualquier anatomía (anatomy: null). Quien declara senos
     tiene senos Y pezones; quien no los declara tiene pezones igualmente. Tapado por camiseta y, si la lleva, brasier (sin brasier: camiseta → piel).
     Una carta que necesite pezones «de senos» lo dice en su requisito ({ part: 'nipples', anatomy: 'senos' }); nunca se infiere. */
  P('nipples', 'los pezones', { lateral: true, coveredBy: ['top', 'bra'] }),
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
  P('wholeBody', 'todo el cuerpo', { coveredBy: ['top', 'bottoms', 'underwear', 'bra'] }), // solo para cartas de cuerpo entero (abrazo desnudos)
];
export const BODY_PARTS = Object.fromEntries(BODY_PARTS_LIST.map(p => [p.id, p]));

const A = (id, label, o = {}) => Object.assign({ id, label, kind: 'hand', anatomy: null, lateral: false, coveredBy: [] }, o);
/* 2026-11-04: `vulva` como herramienta de quien tiene el turno (I57, I60, I61, I62, I66), igual que `penis`. */
export const ACTOR_TOOLS_LIST = [
  A('oneHand', 'una mano', { lateral: true }), A('bothHands', 'las dos manos'), A('fingers', 'los dedos', { lateral: true }), A('fingertips', 'las yemas de los dedos', { lateral: true }),
  A('oneFinger', 'un dedo'), A('twoFingers', 'dos dedos'), A('threeFingers', 'tres dedos'), A('thumbs', 'los pulgares'), A('nails', 'las uñas'), A('palm', 'la palma'),
  A('lips', 'los labios', { kind: 'mouth' }), A('mouth', 'la boca', { kind: 'mouth' }), A('tongue', 'la lengua', { kind: 'mouth' }), A('teeth', 'los dientes', { kind: 'mouth' }), A('breath', 'el aliento', { kind: 'mouth' }),
  A('nose', 'la nariz', { kind: 'face' }), A('forehead', 'la frente', { kind: 'face' }), A('head', 'la cabeza', { kind: 'head' }),
  A('arms', 'los brazos', { kind: 'arms' }), A('chest', 'el pecho', { kind: 'torso', coveredBy: ['top'] }), A('hips', 'las caderas', { kind: 'pelvis' }),
  A('thigh', 'el muslo', { kind: 'leg', lateral: true }), A('legs', 'las piernas', { kind: 'leg' }), A('feet', 'los pies', { kind: 'leg', lateral: true, coveredBy: ['socks'] }),
  A('body', 'el cuerpo', { kind: 'body' }),
  A('penis', 'el pene', { kind: 'pelvis', anatomy: 'pene', coveredBy: ['bottoms', 'underwear'] }), A('vulva', 'la vulva', { kind: 'pelvis', anatomy: 'vulva', coveredBy: ['bottoms', 'underwear'] }), A('glans', 'el glande', { kind: 'pelvis', anatomy: 'pene', coveredBy: ['bottoms', 'underwear'] }),
  A('breasts', 'los senos', { kind: 'torso', anatomy: 'senos', coveredBy: ['top', 'bra'] }),
];
export const ACTOR_TOOLS = Object.fromEntries(ACTOR_TOOLS_LIST.map(t => [t.id, t]));
export const MOUTH_TOOLS = ACTOR_TOOLS_LIST.filter(t => t.kind === 'mouth').map(t => t.id);
