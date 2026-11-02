/* FAMILIA UNDRESS · Intimidad. Quitarse ropa es una carta más, nunca una obligación ni una meta: sale cuando el estado
   real de ropa lo permite y el ritmo lo pide (UNDRESS → interacción → interacción → quizá otra UNDRESS).
   undress: { who: 'ACTOR' | 'RECEIVER' | 'BOTH'   — quién se queda sin la prenda
              garment: 'top' | 'bottoms' | 'socks' | 'bra' | 'panties' | 'boxers' | 'ANY'
              chooser: 'ACTOR' | 'RECEIVER' | null  — quién elige la prenda cuando garment = ANY
              helper: true   — la otra persona se la quita
              limitation: 'ONE_HAND' | 'NO_HANDS' | null }
   Cuando garment = ANY, la interfaz pregunta qué prenda se quitó y actualiza el estado al momento. Una prenda quitada no
   vuelve a pedirse. Panties / calzoncillos solo con el pantalón fuera; brasier solo con la camiseta fuera. */
import { card } from './schema.js';
const U = o => card({ level: 3, family: 'UNDRESS', interactionType: 'UNDRESS', status: 'APPROVED', source: 'DESIGNER_PROVIDED', intraLevelIntensity: 'MID', tags: ['ropa'], timerMode: 'NO_TIMER', baseWeight: 0.6, ...o });
export const UNDRESS = [
  U({ id: 'U01', undress: { who: 'ACTOR', garment: 'ANY', chooser: 'ACTOR' }, copy: ['Quítate una prenda. Tú eliges cuál.'] }),
  U({ id: 'U02', undress: { who: 'RECEIVER', garment: 'ANY', chooser: 'RECEIVER' }, copy: ['{R} se quita una prenda. {R} elige cuál.'] }),
  U({ id: 'U03', undress: { who: 'BOTH', garment: 'top', chooser: null }, copy: ['Los dos os quitáis la camiseta, a la vez.'] }),
  U({ id: 'U03b', undress: { who: 'BOTH', garment: 'bottoms', chooser: null }, copy: ['Los dos os quitáis el pantalón, a la vez.'] }),
  U({ id: 'U03c', undress: { who: 'BOTH', garment: 'socks', chooser: null }, copy: ['Los dos os quitáis los calcetines.'], baseWeight: 0.4 }),
  U({ id: 'U04', undress: { who: 'RECEIVER', garment: 'ANY', chooser: 'ACTOR' }, copy: ['Decide qué prenda se quita {R}. {R} se la quita.'] }),
  U({ id: 'U05', undress: { who: 'ACTOR', garment: 'ANY', chooser: 'RECEIVER' }, copy: ['{R} decide qué prenda te quitas. Tú te la quitas.'] }),
  U({ id: 'U06', undress: { who: 'RECEIVER', garment: 'ANY', chooser: 'RECEIVER', helper: true }, copy: ['{R} elige una prenda y tú se la quitas.'] }),
  U({ id: 'U07', undress: { who: 'RECEIVER', garment: 'ANY', chooser: 'ACTOR', helper: true, limitation: 'ONE_HAND' }, copy: ['Quítale una prenda a {R} usando solo una mano. Tú eliges cuál.'] }),
  U({ id: 'U08', status: 'UNREVIEWED', undress: { who: 'RECEIVER', garment: 'ANY', chooser: 'ACTOR', helper: true, limitation: 'NO_HANDS' }, copy: ['Quítale una prenda a {R} sin usar las manos.'],
    notes: 'Limitación «sin manos»: el diseñador la propone; falta decidir con qué prendas es realizable (¿solo calcetines?). Sin decisión no sale.' }),
];
