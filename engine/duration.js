/* Tiempos naturales por contenido: cada carta trae los suyos (FIXED · WEIGHTED · NO_TIMER). Nunca random(15, 120). */
export function pickDuration(card, rng) {
  if (card.timerMode === 'NO_TIMER' || !card.durations.length) return null;
  if (card.durations.length === 1) return card.durations[0];
  const n = card.durations.length; // campana suave sobre los valores aprobados: el centro sale más
  return rng.weighted(card.durations.map((d, i) => ({ item: d, weight: Math.exp(-2 * Math.pow((i - (n - 1) / 2) / Math.max(1, n - 1), 2)) })));
}
export const formatDuration = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
export const durationLabel = s => s >= 60 ? (s % 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s / 60} min`) : `${s} s`;
