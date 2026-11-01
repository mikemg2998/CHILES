/* BODY MECHANICS ENGINE. Que dos partes del cuerpo puedan tocarse no convierte un gesto en una buena interacción.
   Cuatro capas distintas: anatómicamente posible ≠ físicamente posible ≠ biomecánicamente natural ≠ buena interacción.
   Aquí se responde a la tercera: «¿es natural que ESTA parte haga ESTA acción sobre ESTA zona en una postura razonable?»
   No hay un mapa «parte puede tocar parte»: la unidad es acción + parte que actúa + zona + orientación + movimiento.
   Las manos llegan a casi todo; la boca necesita acercar la cabeza; el torso, la pelvis y las piernas solo
   entran por relaciones declaradas (lista blanca), nunca inventadas por el azar. */
import { ACTION, ZONE } from './catalog.js';

/* qué es cada parte que actúa */
export const ACTOR_KIND = {
  mano: 'hand', manos: 'hand', dedos: 'hand', dedo: 'hand', yemas: 'hand', 'uñas': 'hand', pulgares: 'hand', palma: 'hand',
  labios: 'mouth', lengua: 'mouth', dientes: 'mouth', boca: 'mouth', aliento: 'mouth',
  nariz: 'face', rostro: 'face', frente: 'face', cabeza: 'head', voz: 'voice',
  pecho: 'torso', caderas: 'pelvis', muslo: 'leg', piernas: 'leg', cuerpo: 'body', brazos: 'arms',
};
/* capacidades por tipo de parte: qué movimientos produce y a qué llega */
export const PART_CAPABILITIES = {
  hand: { canAct: true, movements: ['none', 'slide', 'press', 'tap', 'grip', 'rub'], reach: 'any' },
  mouth: { canAct: true, movements: ['none', 'slide', 'press', 'tap'], reach: 'head' },
  face: { canAct: true, movements: ['none', 'slide'], reach: 'head' },
  head: { canAct: true, movements: ['none'], reach: 'table' },
  voice: { canAct: true, movements: ['none'], reach: 'ear' },
  torso: { canAct: true, movements: ['none', 'rub'], reach: 'table' },
  pelvis: { canAct: true, movements: ['none', 'rub'], reach: 'table' },
  leg: { canAct: true, movements: ['none', 'slide', 'rub'], reach: 'table' },
  body: { canAct: true, movements: ['none', 'rub'], reach: 'table' },
  arms: { canAct: true, movements: ['none', 'press'], reach: 'table' },
};

/* dónde está cada zona: altura (para la boca) y lado (para la orientación) */
const LOW = new Set(['muslos', 'muslosInt', 'piernas', 'gluteos', 'entrepierna', 'ingles', 'vulva', 'labiosMayores', 'labiosMenores', 'clitoris', 'vagina', 'pene', 'glande', 'testiculos', 'rodillas']);
const VERY_LOW = new Set(['pies', 'tobillos', 'pantorrillas']);
const HIGH = new Set(['cabello', 'frente', 'mejillas', 'rostro', 'orejas', 'labios', 'cuello', 'nuca', 'hombros', 'sienes', 'clavicula', 'manos', 'dedos', 'palmas', 'munecas', 'brazos']);
export function zoneHeight(z) { return VERY_LOW.has(z.id) ? 'suelo' : LOW.has(z.id) ? 'baja' : HIGH.has(z.id) ? 'alta' : 'media'; }
export function zoneSide(z) { const f = z.tags.includes('frontal'), d = z.tags.includes('detras'); return f && !d ? 'frente' : d && !f ? 'detras' : 'ambos'; }

/* relaciones corporales de cuerpo entero: lista blanca. naturalness 0–1 · complexity 0 inmediata · 1 natural · 2 específica · 3 torpe
   freedom: libertad de movimiento en esa relación · balance: exigencia de equilibrio o peso · orient: orientación que implica */
const R = (naturalness, complexity, freedom, orient, balance = 0) => ({ naturalness, complexity, freedom, orient, balance });
export const BODY_RELATIONS = {
  'pecho>espalda': R(.95, 1, .5, 'BEHIND'), 'pecho>pecho': R(.95, 0, .5, 'FACE'), 'pecho>senos': R(.85, 1, .5, 'FACE'),
  'caderas>gluteos': R(.8, 2, .45, 'BEHIND'), 'caderas>entrepierna': R(.75, 2, .45, 'LYING'),
  'muslo>entrepierna': R(.8, 1, .6, 'FACE'), 'muslo>muslosInt': R(.8, 1, .6, 'FACE'),
  'brazos>cintura': R(1, 0, .3, null), 'brazos>hombros': R(1, 0, .3, null), 'brazos>espalda': R(1, 0, .3, null),
  'cuerpo>muslos': R(.9, 1, .3, 'FACE', .3), 'cuerpo>pecho': R(.9, 1, .3, 'LYING', .2), 'cuerpo>espalda': R(.9, 1, .3, 'LYING', .2), 'cuerpo>cintura': R(.95, 0, .4, 'STANDING'),
  'piernas>cintura': R(.85, 1, .3, 'FACE', .4),
  'cabeza>hombros': R(.95, 0, .1, null), 'cabeza>pecho': R(.95, 0, .1, null), 'cabeza>muslos': R(.9, 1, .1, null),
  'frente>frente': R(1, 0, .2, 'FACE'), 'voz>orejas': R(1, 0, 1, null),
};
/* la acción «mecer» abraza por la cintura o la espalda de pie: misma relación que cuerpo>cintura */
BODY_RELATIONS['cuerpo>espalda:mecer'] = R(.95, 0, .4, 'STANDING');

/* mecánica de cada acción: movimiento que exige y postura que su propia frase ya aporta (contexto incluido) */
const MOVEMENT_MIN = { none: 0, hold: .1, press: .35, tap: .4, slide: .5, grip: .35, rub: .6 };
export const ACTION_MECHANICS = {
  abrazar: { movement: 'none' }, abrazarDetras: { movement: 'none', posture: 'BEHIND' }, mecer: { movement: 'none', posture: 'STANDING' },
  pegarPecho: { movement: 'none' }, pegarCaderas: { movement: 'none', posture: 'BEHIND' }, sentarseEncima: { movement: 'none', posture: 'SEATED' },
  pesoEncima: { movement: 'none', posture: 'LYING' }, rodearConPiernas: { movement: 'none', posture: 'FACE' }, palmasContraPalmas: { movement: 'press', posture: 'FACE' },
  frenteConFrente: { movement: 'none', posture: 'FACE' }, apoyarCabeza: { movement: 'none' }, sujetarManos: { movement: 'none' }, entrelazar: { movement: 'none' },
  frotarCaderasDetras: { movement: 'rub', posture: 'BEHIND' }, frotarCaderasFrente: { movement: 'rub', posture: 'LYING' },
  deslizarMuslo: { movement: 'rub', posture: 'FACE' }, frotarPecho: { movement: 'rub', posture: 'LYING' },
  apretar: { movement: 'grip' }, sujetarCaderas: { movement: 'grip' }, sujetarNuca: { movement: 'grip' }, sujetarMunecas: { movement: 'grip' }, nalgada: { movement: 'tap' },
  pulgares: { movement: 'press' }, masajear: { movement: 'press' }, masajeCabeza: { movement: 'press' }, apoyarMano: { movement: 'none' }, manosCalientes: { movement: 'none' },
  tamborilear: { movement: 'tap' }, besitos: { movement: 'tap' }, mordisquear: { movement: 'tap' }, besarSuccion: { movement: 'press' }, atraparLabio: { movement: 'press' },
  susurrar: { movement: 'none' }, acercarse: { movement: 'none' }, respirarCerca: { movement: 'none' }, soplar: { movement: 'none' }, manoEntreMuslos: { movement: 'none' },
  frotarEntrepierna: { movement: 'rub' }, chupar: { movement: 'press' }, estimularBoca: { movement: 'slide' }, estimularDedos: { movement: 'slide' }, masturbar: { movement: 'slide' }, introducirDedo: { movement: 'slide' },
};
export function actionMechanics(a) {
  const o = ACTION_MECHANICS[a.id] || a.mechanics || {};
  const movement = o.movement || (a.tags.includes('quieto') ? 'none' : a.tags.includes('presion') && !a.tags.includes('movimiento') ? 'press' : 'slide');
  return { movement, minFreedom: MOVEMENT_MIN[movement] ?? .5, posture: o.posture || null, kind: ACTOR_KIND[a.actor] || 'hand' };
}

/* orientaciones que no pueden darse a la vez */
const ORIENT_CONFLICT = { BEHIND: ['FACE', 'SEATED'], FACE: ['BEHIND'], LYING: ['STANDING', 'SEATED'], STANDING: ['LYING', 'SEATED'], SEATED: ['LYING', 'STANDING', 'BEHIND'] };
export const orientConflict = (a, b) => !!(a && b && a !== b && (ORIENT_CONFLICT[a] || []).includes(b));

/* ¿Es natural que esta parte haga esta acción sobre esta zona? → relación corporal evaluada */
export function bodyRelation(a, z) {
  const mech = actionMechanics(a), kind = mech.kind;
  const caps = PART_CAPABILITIES[kind];
  if (!caps || !caps.movements.includes(mech.movement)) return { ok: false, code: 'ACTION_BODY_PART_INCOMPATIBLE', naturalness: 0, complexity: 3, freedom: 0, balance: 0, orient: null };
  let rel;
  if (kind === 'hand') rel = R(1, 0, 1, null);
  else if (kind === 'mouth' || kind === 'face') {
    const h = zoneHeight(z), side = zoneSide(z);
    const complexity = h === 'alta' ? 0 : h === 'suelo' ? 2 : z.id === 'rodillas' ? 2 : 1;
    const naturalness = h === 'alta' ? 1 : h === 'media' ? .95 : h === 'baja' ? .85 : .5;
    rel = R(naturalness, complexity, .85, side === 'detras' ? 'BEHIND' : null);
    if (kind === 'face' && z.tags.includes('intimo')) rel = R(0, 3, 0, null);
  } else {
    rel = BODY_RELATIONS[`${a.actor}>${z.id}:${a.id}`] || BODY_RELATIONS[`${a.actor}>${z.id}`];
    if (!rel) return { ok: false, code: 'BIOMECHANICS_UNNATURAL', naturalness: 0, complexity: 3, freedom: 0, balance: 0, orient: null };
    rel = { ...rel };
  }
  // la propia frase ya coloca a la pareja: la posición deja de ser un problema que resolver
  if (mech.posture) { rel.complexity = Math.max(0, rel.complexity - 1); rel.freedom = Math.min(1, rel.freedom + .2); rel.orient = rel.orient || mech.posture; }
  return { ok: true, code: null, ...rel, movement: mech.movement, minFreedom: mech.minFreedom, posture: mech.posture };
}

/* Validación biomecánica completa de acción + zona (+ condición de postura). Devuelve códigos de rechazo, nunca «INVALID». */
export const NATURALNESS_MIN = 0.6; // LOW se rechaza; MEDIUM (0.6–0.8) solo pesa si el resto lo justifica
export function mechanicsCheck(a, z, c = null) {
  const rel = bodyRelation(a, z);
  const reasons = [];
  if (!rel.ok) reasons.push(rel.code);
  else {
    if (rel.naturalness < NATURALNESS_MIN) reasons.push('BIOMECHANICS_UNNATURAL');
    if (rel.complexity >= 2) reasons.push('POSITION_TOO_COMPLEX'); // 2 solo cabe con contexto en la frase (posture), que ya la ha bajado a 1
    if (rel.freedom < rel.minFreedom) reasons.push('INSUFFICIENT_MOVEMENT_FREEDOM');
    if (c && c.orient && orientConflict(rel.orient, c.orient)) reasons.push('ORIENTATION_INCOMPATIBLE');
    if (c && c.orient === 'LYING' && !z.tags.includes('tumbado')) reasons.push('ORIENTATION_INCOMPATIBLE');
  }
  return { ok: !reasons.length, reasons, rel };
}
/* puntuaciones 0–1 para el filtro de calidad */
export function mechanicsScores(rel) {
  if (!rel || !rel.ok) return { bodyNaturalness: 0, positionSimplicity: 0, movementNaturalness: 0 };
  const bodyNaturalness = rel.naturalness;
  const positionSimplicity = Math.max(0, 1 - 0.3 * rel.complexity - 0.5 * rel.balance);
  const movementNaturalness = rel.movement === 'none' ? 1 : rel.freedom >= rel.minFreedom ? 0.6 + 0.4 * rel.freedom : 0;
  return { bodyNaturalness, positionSimplicity, movementNaturalness };
}
/* herramienta de desarrollo: lista de pares acción·zona que la mecánica rechaza */
export function auditCatalog() {
  const out = [];
  for (const a of Object.values(ACTION)) for (const zid of a.zones) { const z = ZONE[zid]; if (!z) continue; const m = mechanicsCheck(a, z); if (!m.ok) out.push({ action: a.id, zone: zid, reasons: m.reasons }); }
  return out;
}
