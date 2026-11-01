/* DURATION ENGINE · datos. La duración se deriva, nunca es un azar continuo:
   rango base de la acción → ajuste de la zona → modificador del estilo → modificador del nivel → valor discreto humano.
   Valores humanos (segundos): 15 20 30 45 60 75 90 120; 180 solo donde se permite expresamente (allow180).
   Los pesos favorecen los valores centrales del rango resultante (no uniforme). */
export const HUMAN_DURATIONS = [15, 20, 30, 45, 60, 75, 90, 120];
export const LONG_DURATION = 180;
/* rangos base por acción [min, max] (segundos) */
export const BASE_RANGE = {
  RUB: [15, 60], SQUEEZE: [15, 35], MASSAGE: [15, 120], LICK: [15, 30], SUCK: [15, 75], STIMULATE: [15, 120], TICKLE: [15, 20], BRUSH: [15, 60], KISS: [15, 120], CARESS: [15, 45],
  BITE: [15, 20], HOVER: [15, 30], BLOW: [15, 20], WHISPER: [15, 20], HUG: [20, 90], HOLD_HANDS: [20, 60], BODY_CONTACT: [20, 90], REST: [20, 60], GRIP: [15, 20], SPANK: [15, 15], INSERT: [20, 60], UNCOVER: [15, 15], ADVANCE: [15, 20], HAIR_PLAY: [30, 120],
};
/* acciones que pueden llegar a 180 s (solo con estilo lento y zonas de duración larga) */
export const ALLOW_180 = ['MASSAGE', 'HUG', 'HAIR_PLAY'];
/* ajuste por zona (por sensibilidad de duración): multiplica el máximo del rango; también por zona concreta */
export const TARGET_DURATION = {
  bySensitivity: { short: { max: 0.6 }, normal: { max: 1 }, long: { max: 1.25 } },
  override: { // zona → [min, max] concreto para ciertas acciones
    'MASSAGE:hair': [30, 120], 'MASSAGE:feet': [30, 120], 'MASSAGE:shoulders': [30, 120], 'MASSAGE:back': [30, 120],
    'KISS:lips': [15, 60], 'KISS:forehead': [15, 20], 'KISS:hands': [15, 20], 'KISS:cheeks': [15, 20],
    'SUCK:nipples': [15, 45], 'SUCK:clitoris': [20, 75], 'SUCK:glans': [20, 60], 'SUCK:testicles': [15, 30],
    'STIMULATE:clitoris': [20, 90], 'STIMULATE:glans': [15, 60], 'STIMULATE:nipples': [15, 45],
    'CARESS:hair': [30, 90], 'CARESS:back': [20, 60], 'RUB:groin': [20, 60], 'LICK:nipples': [15, 30], 'BITE:lips': [15, 15],
  },
};
/* el estilo mueve la duración dentro del rango: SLOW hacia medio/largo, FAST hacia corto/medio, INTERMITTENT necesita tiempo */
export const STYLE_DURATION = {
  SLOW: { min: 1.3, max: 1.2, bias: 0.6 }, FAST: { min: 1, max: 0.7, bias: -0.5 }, SOFT: { min: 1, max: 1, bias: 0.1 }, FIRM: { min: 1, max: 0.85, bias: -0.1 }, INTERMITTENT: { min: 1.6, max: 1.1, bias: 0.4 },
};
/* el nivel: Conexión prefiere algo sostenido pero no eterno; Deseo alarga para construir anticipación; Exploración e Intimidad respetan la acción */
export const LEVEL_DURATION = { 1: { max: 1, bias: 0.1 }, 2: { max: 1.1, bias: 0.2 }, 3: { max: 1, bias: -0.1 } };
/* peso por posición relativa en el rango resultante (0 = mínimo, 1 = máximo): campana con sesgo */
export const POSITION_WEIGHT = (pos, bias) => Math.exp(-6 * Math.pow(pos - (0.45 + 0.35 * bias), 2));
