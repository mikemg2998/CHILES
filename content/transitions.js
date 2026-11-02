/* TRANSICIONES NEUTRAS · solo para un mazo vacío (§69). Nunca entran en la selección normal (baseWeight 0, transition: true).
   No relajan anatomía ni ropa: proponen algo que siempre es posible y devuelven la decisión a la pareja. */
import { card } from './schema.js';
const T = (level, copy) => card({ id: `T0${level}`, level, family: 'TRANSITION', interactionType: 'SPECIAL', status: 'APPROVED', source: 'DESIGNER_PROVIDED', transition: true, baseWeight: 0, timerMode: 'NO_TIMER', copy: [copy], actorRequirements: [{ part: 'body' }], receiverRequirements: [{ part: 'wholeBody' }] });
export const TRANSITIONS = [
  T(1, 'Abrazaos un momento y decidid juntos qué os apetece ahora.'),
  T(2, 'Abrazaos un momento y decidid juntos qué os apetece ahora.'),
  T(3, 'Abrazaos un momento, tal como estáis, y decidid juntos qué os apetece ahora.'),
];
