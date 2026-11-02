/* ESQUEMA DE CONTENIDO. La unidad de contenido es la CuratedInteraction («carta»): una experiencia diseñada por una
   persona, con sus variantes aprobadas, sus requisitos (anatomía · ropa · lado · tipo) y sus tiempos naturales.
   El azar elige ENTRE buenas experiencias; nunca intenta convertir combinaciones aleatorias en buenas experiencias.

   CuratedInteraction {
     id                  'C01' | 'D05' | 'I11' | 'U03' …
     level               1 Conexión · 2 Deseo · 3 Intimidad (solo estos tres)
     family              InteractionFamily (ver FAMILIES): para no repetir la misma idea en cartas seguidas
     intraLevelIntensity 'LOW' | 'MID' | 'HIGH' (opcional; nunca cambia el nivel, solo ordena dentro de él)
     status              'APPROVED' | 'UNREVIEWED' | 'REJECTED' (solo APPROVED entra en producción)
     source              'DESIGNER_PROVIDED' | 'DESIGNER_APPROVED' (seleccionada por el diseñador de una propuesta) | 'MIGRATED_APPROVED'
     similarityGroup     grupo de similitud (ver SIMILARITY_GROUPS): dos cartas del mismo grupo se parecen aunque su familia difiera
     interactionType     'STANDARD' | 'MUTUAL' | 'GUIDED' | 'CHOOSE' | 'PATH' | 'BODY_TO_BODY' | 'UNDRESS' | 'POSITIONAL' | 'SPECIAL'
     actorRequirements   [{ part: id de ACTOR_TOOLS }]      — con qué actúa quien actúa (la anatomía la aporta la parte)
     receiverRequirements[{ part: id de BODY_PARTS }]       — qué recibe quien recibe
     clothing            { actor: ClothingRequirement[], receiver: ClothingRequirement[] } (ver CLOTHING_REQUIREMENTS)
     allowedSides        ['LEFT','RIGHT','BOTH'] solo donde tiene sentido (la copia va por lado: copyBySide)
     copy                ['frase', …]  ·  copyBySide { LEFT: [...], RIGHT: [...], BOTH: [...] }   — tokens {R} quien recibe · {A} quien actúa
     variants            [{ id, status, anatomy?, side?, weight?, copy | copyBySide, notes? }]  — variantes aprobadas (una variante NO es una carta nueva)
     playConstraints     ['FREE', 'NO_HANDS', …] solo donde la carta lo aprueba (FREE siempre entre ellas)
     durations           [45] · [30, 45, 60]   segundos naturales (15 20 25 30 35 40 45 50 60 75 90 120)
     timerMode           'FIXED' | 'WEIGHTED' | 'NO_TIMER'
     choices             CHOOSE: [{ id, label }]      · path: PATH: { from, to }   · undress: UNDRESS: { who, garment, chooser, limitation }
     requiredOrientation POSITIONAL / BODY_TO_BODY: 'FACE' | 'BEHIND' | 'LYING' | 'SEATED' | 'STANDING'
     note                línea breve que ve la pareja debajo de la frase (opcional)
     baseWeight          frecuencia relativa (1 = normal)
     tags · notes        para la sesión («hoy no») y para la revisión humana
   } */
export const LEVELS = { 1: 'CONNECTION', 2: 'DESIRE', 3: 'INTIMACY' };
export const STATUSES = ['APPROVED', 'UNREVIEWED', 'REJECTED'];
export const SOURCES = ['DESIGNER_PROVIDED', 'DESIGNER_APPROVED', 'MIGRATED_APPROVED'];
export const INTERACTION_TYPES = ['STANDARD', 'MUTUAL', 'GUIDED', 'CHOOSE', 'PATH', 'BODY_TO_BODY', 'UNDRESS', 'POSITIONAL', 'SPECIAL'];
export const INTENSITIES = ['LOW', 'MID', 'HIGH'];
export const SIDES = ['LEFT', 'RIGHT', 'BOTH'];
export const SIDE_LABEL = { LEFT: 'izquierdo', RIGHT: 'derecho', BOTH: 'los dos', NONE: '' };
export const TIMER_MODES = ['FIXED', 'WEIGHTED', 'NO_TIMER'];
export const ORIENTATIONS = ['FACE', 'BEHIND', 'LYING', 'SEATED', 'STANDING'];
export const DURATIONS = [15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 120];

/* PlayConstraint: limitación lúdica aprobada carta a carta, nunca global. La copia es la cláusula que se añade a la frase. */
export const PLAY_CONSTRAINTS = ['FREE', 'NO_HANDS', 'ONE_HAND_EACH', 'ACTOR_NO_HANDS', 'RECEIVER_NO_HANDS', 'ONE_HAND_TOTAL'];
export const PLAY_CONSTRAINT_COPY = {
  FREE: '',
  NO_HANDS: 'sin usar las manos',
  ONE_HAND_EACH: 'con una sola mano cada uno',
  ACTOR_NO_HANDS: '{A} sin usar las manos',
  RECEIVER_NO_HANDS: '{R} sin usar las manos',
  ONE_HAND_TOTAL: 'con una sola mano entre los dos',
};

/* Requisitos de ropa (por rol). Se evalúan sobre el estado REAL de ropa de cada jugador (engine/clothing.js):
   ANY            da igual
   CLOTHED        la carta se hace con la ropa puesta: no exige ni cambia nada (regla de Deseo)
   THROUGH_CLOTHING  la parte tiene que estar tapada (se hace por encima de la ropa)
   SKIN_ACCESS    todas las partes que recibe tienen que estar a piel (sus prendas fuera)
   TOP_ACCESS     camiseta fuera · BOTTOM_ACCESS pantalón fuera · UNDERWEAR_ON ropa interior puesta · UNDERWEAR_OFF fuera
   FULL_BODY_ACCESS  camiseta, pantalón y ropa interior fuera */
export const CLOTHING_REQUIREMENTS = ['ANY', 'CLOTHED', 'THROUGH_CLOTHING', 'SKIN_ACCESS', 'TOP_ACCESS', 'BOTTOM_ACCESS', 'UNDERWEAR_ON', 'UNDERWEAR_OFF', 'FULL_BODY_ACCESS', 'THROUGH_BRA', 'THROUGH_PANTIES', 'THROUGH_BOXERS'];
/* THROUGH_GARMENT('bra' | 'panties' | 'boxers'): la prenda interior sigue puesta y la exterior que la cubre está fuera; la carta
   actúa SOBRE la prenda. THROUGH_BRA · THROUGH_PANTIES · THROUGH_BOXERS son alias de lectura. Nunca convierte una carta de
   acceso directo: solo cartas aprobadas específicamente para esa prenda. */
export const THROUGH_GARMENT = g => `THROUGH_${g.toUpperCase()}`;
export const throughGarmentOf = q => (/^THROUGH_(BRA|PANTIES|BOXERS)$/.test(q) ? q.slice(8).toLowerCase() : null);

/* Familias de interacción: la idea que la pareja percibe. El historial penaliza repetir familia en cartas seguidas. */
export const FAMILIES = {
  MASSAGE: 'Masaje', CARESS: 'Caricia', KISS: 'Besos', HUG: 'Abrazo', CLOSENESS: 'Cercanía', HAIR: 'Cabello', HANDS: 'Manos',
  MUSIC: 'Música', EARS: 'Orejas', NECK: 'Cuello', FEET: 'Pies', BUTTOCKS: 'Nalgas', BREASTS: 'Senos', ABDOMEN: 'Abdomen',
  BITE: 'Mordisco', ORAL: 'Boca', MANUAL: 'Manos sobre anatomía íntima', BREATH: 'Aliento', UNDRESS: 'Ropa', BODY: 'Cuerpo con cuerpo', TRANSITION: 'Transición',
  PLAY: 'Juego', WORDS: 'Palabras', BREATHING: 'Respiración', REST: 'Descanso',
};
/* Grupos de similitud (Conexión V2): la idea que la pareja percibe como «otra vez lo mismo» aunque la familia cambie.
   El selector baja temporalmente el peso del grupo reciente; nunca lo bloquea. VERBAL agrupa APPRECIATION y MEMORY. */
export const SIMILARITY_GROUPS = ['EMBRACE', 'MASSAGE', 'HAND_CONTACT', 'FACE_CONTACT', 'LIGHT_KISSING', 'HAIR_TOUCH', 'BODY_REST', 'BREATHING', 'PLAYFUL', 'CHOICE', 'GUIDED', 'APPRECIATION', 'MEMORY', 'MUSIC', 'DANCE', 'SENSORY_TOUCH',
  'BITE', 'ORAL', 'INTIMATE_TOUCH', 'BREATH', 'UNDRESS', 'BODY_CONTACT', 'CLOTHED_TEASE'];
export const VERBAL_GROUPS = ['APPRECIATION', 'MEMORY'];

const DEFAULTS = {
  intraLevelIntensity: null, status: 'UNREVIEWED', source: 'DESIGNER_PROVIDED', interactionType: 'STANDARD',
  actorRequirements: [], receiverRequirements: [], clothing: { actor: ['ANY'], receiver: ['ANY'] }, allowedSides: null,
  copy: null, copyBySide: null, variants: null, playConstraints: null, durations: [30], timerMode: 'FIXED',
  choices: null, path: null, undress: null, requiredOrientation: null, note: null, baseWeight: 1, tags: [], notes: null, transition: false, similarityGroup: null,
};
/* constructor con valores por defecto; el id y el nivel son obligatorios */
export function card(o) {
  const c = { ...DEFAULTS, ...o };
  c.clothing = { actor: ['ANY'], receiver: ['ANY'], ...(o.clothing || {}) };
  if (c.timerMode === 'FIXED' && c.durations && c.durations.length > 1) c.timerMode = 'WEIGHTED';
  if (c.timerMode === 'NO_TIMER') c.durations = [];
  return c;
}
