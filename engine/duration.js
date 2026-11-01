/* DURATION ENGINE. Duración humana derivada, nunca azar continuo:
   rango base (acción) → ajuste de zona → estilo → nivel → valores discretos (15 20 30 45 60 75 90 120; 180 solo donde se permite) con pesos. */
import { BASE_RANGE, TARGET_DURATION, STYLE_DURATION, LEVEL_DURATION, HUMAN_DURATIONS, LONG_DURATION, ALLOW_180, POSITION_WEIGHT } from './data/durations.js';
import { TARGETS } from './data/targets.js';
import { POSITIONAL_BY_ID } from './data/positional.js';

/* rango efectivo [min, max] y sesgo para la combinación */
export function durationRange(action, target, style, level) {
  const bp = typeof action === 'string' && action.startsWith('POS:') ? POSITIONAL_BY_ID[action.slice(4)] : null; // blueprint posicional: su propio rango
  const z = TARGETS[target];
  let [min, max] = bp ? bp.durationRange : (TARGET_DURATION.override[`${action}:${target}`] || BASE_RANGE[action] || [15, 30]);
  const sens = bp ? { max: 1 } : (TARGET_DURATION.bySensitivity[z ? z.durationSensitivity : 'normal'] || { max: 1 });
  max = max * sens.max;
  let bias = 0;
  if (style && STYLE_DURATION[style]) { const s = STYLE_DURATION[style]; min *= s.min; max *= s.max; bias += s.bias; }
  if (level && LEVEL_DURATION[level]) { max *= LEVEL_DURATION[level].max; bias += LEVEL_DURATION[level].bias; }
  min = Math.max(HUMAN_DURATIONS[0], Math.round(min)); max = Math.max(min, Math.round(max));
  const cap = ALLOW_180.includes(action) && style === 'SLOW' && z && z.durationSensitivity === 'long' ? LONG_DURATION : HUMAN_DURATIONS[HUMAN_DURATIONS.length - 1];
  max = Math.min(max, cap);
  return { min, max, bias: Math.max(-1, Math.min(1, bias)) };
}
/* opciones discretas con peso */
export function durationOptions(action, target, style, level) {
  const { min, max, bias } = durationRange(action, target, style, level);
  const values = [...HUMAN_DURATIONS, LONG_DURATION].filter(v => v >= min && v <= max);
  if (!values.length) { const mid = (min + max) / 2; const nearest = HUMAN_DURATIONS.reduce((b, v) => Math.abs(v - mid) < Math.abs(b - mid) ? v : b); return [{ seconds: nearest, weight: 1 }]; }
  if (values.length === 1) return [{ seconds: values[0], weight: 1 }];
  const span = Math.log(values[values.length - 1]) - Math.log(values[0]);
  return values.map(v => ({ seconds: v, weight: POSITION_WEIGHT(span ? (Math.log(v) - Math.log(values[0])) / span : 0.5, bias) }));
}
export function pickDuration(action, target, style, level, rng) {
  const opts = durationOptions(action, target, style, level);
  return rng.weighted(opts.map(o => ({ item: o.seconds, weight: o.weight })));
}
export const formatDuration = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
export const durationLabel = s => s >= 60 ? (s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s / 60} min`) : `${s} s`;
/* ¿es esta duración una de las que el motor derivaría para la combinación? */
export const durationValid = (action, target, style, level, seconds) => durationOptions(action, target, style, level).some(o => o.seconds === seconds);
