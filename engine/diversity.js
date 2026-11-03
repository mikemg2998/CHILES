/* DIVERSIDAD REAL EN INTIMIDAD (diseñador, 2026-11-03). Capa que actúa DESPUÉS de los filtros duros (anatomía, ropa,
   restricciones) y de la ponderación existente (weighDeck), y ANTES de la elección. Solo en Intimidad (nivel 3).
   Barajado dinámico, nunca una lista lineal precalculada: en cada carta se recalcula sobre lo elegible en ese momento.

   1. COOLDOWN POR ID: una carta jugada en las últimas 10 cartas de Intimidad no puede volver a salir mientras quede alguna
      alternativa elegible. Si no queda ninguna, la ventana se relaja de una en una (9, 8, …) solo lo necesario y se anota en
      engine.stats.cooldownRelaxed. El juego nunca se queda sin carta.
   2. NO VISTAS PRIMERO: una carta que todavía no ha salido en esta sesión pesa ×UNSEEN; las vistas conservan su peso.
   3. RECIÉN DESBLOQUEADAS POR ROPA: además del empujón existente (×1,6 durante 3 cartas, en weighDeck), una carta
      desbloqueada que aún no ha salido pesa ×UNLOCKED_HOLD durante UNLOCKED_ROUNDS cartas desde el cambio de ropa, para
      que tenga una oportunidad real antes de la siguiente capa. La diversidad por región / familia / target ya aplicada
      en weighDeck impide que salgan todas seguidas o que una región domine.
   4. UNDRESS NO CAMBIA: la probabilidad total de las cartas de desvestir en cada ronda es exactamente la del selector
      anterior. La capa solo reparte de otra forma la masa de las cartas que no son UNDRESS (se renormaliza a su total).
      Las cartas UNDRESS tampoco entran en el cooldown: el ritmo de desvestido es el de siempre.
   5. PRIORIDAD PROGRESIVA POR OPORTUNIDADES PERDIDAS (diseñador, 2026-11-03): engine.missed guarda, por ID y por sesión,
      cuántas veces una carta no-UNDRESS estuvo en el sorteo (elegible por las reglas duras y fuera del cooldown) y no salió.
      Factor = min(MISSED_MAX, 1 + MISSED_STEP · n): sube ×0,05 por oportunidad perdida hasta ×2,5 (a las 30). Se suma al
      ×3 de no vista; la carta elegida vuelve a 0. Nunca rescata una carta bloqueada ni salta el cooldown.
   similarityGroup sigue siendo una penalización semántica (weighDeck), no un veto de 10 cartas. Pesos base intactos.
   RECIPROCIDAD: en un grupo con `reciprocalSubject` (I55 = se acuesta quien recibe · I56 = se acuesta quien actúa), si la persona
   que se acostaría ya la recibió en esta sesión la carta pesa ×RECIPROCAL_REPEAT (peso, no veto), para favorecer a la otra persona.
   COOLDOWN POR GRUPO: una carta con `cooldownGroup` comparte el cooldown con las demás de su grupo (I55 / I56: misma experiencia
   con los papeles cambiados), para que las dos direcciones nunca salgan a menos de 10 cartas. */
import { CARD } from '../content/index.js';
export const COOLDOWN = 10;
export const UNSEEN = 3;
export const UNLOCKED_HOLD = 1.5;
export const UNLOCKED_ROUNDS = 6;
export const RECIPROCAL_REPEAT = 0.2;
export const reciprocalKey = (card, actor) => card.cooldownGroup && card.reciprocalSubject ? `${card.cooldownGroup}:${card.reciprocalSubject === 'ACTOR' ? actor : 1 - actor}` : null;
export const MISSED_STEP = 0.05;
export const MISSED_MAX = 2.5;
export const missedFactor = n => Math.min(MISSED_MAX, 1 + MISSED_STEP * Math.max(0, n || 0));
const UNLOCK_BOOST_ROUNDS = 3; // engine.markUnlocked guarda round + 3 como expiración del empujón existente

/* ids de las últimas n cartas de Intimidad (más reciente primero) */
export function recentIntimacyIds(history, n = COOLDOWN) {
  return history.rounds.filter(r => r.level === 3 && !r.transition).slice(0, n).map(r => r.cardId);
}
/* clave de cooldown: el ID, o el grupo si la carta lo declara */
export const cooldownKey = id => (CARD[id] && CARD[id].cooldownGroup) || id;

/* weighted: salida de weighDeck. Devuelve { weighted, relaxed } con relaxed = null o { window, eligible } */
export function applyIntimacyDiversity(weighted, { level, history, seen, unlocked = null, round = 0, missed = null, actor = 0, reciprocal = null }) {
  if (level !== 3 || !weighted.length) return { weighted, relaxed: null };
  const isU = w => w.card.interactionType === 'UNDRESS';
  const others = weighted.filter(w => !isU(w)), undress = weighted.filter(isU);
  if (!others.length) return { weighted, relaxed: null };
  const massOthers = others.reduce((a, w) => a + w.weight, 0);
  // 1 · cooldown con relajación mínima
  const recent = recentIntimacyIds(history, COOLDOWN).map(cooldownKey);
  let window = COOLDOWN, allowed = others.filter(w => !recent.includes(cooldownKey(w.card.id)));
  while (!allowed.length && window > 0) { window--; const r = recent.slice(0, window); allowed = others.filter(w => !r.includes(cooldownKey(w.card.id))); }
  const relaxed = window < COOLDOWN ? { window, eligible: others.length } : null;
  // 2 · no vistas · 3 · recién desbloqueadas que aún no han salido
  const boosted = allowed.map(w => {
    const id = w.card.id, unseen = !(seen && seen.has(id));
    const exp = unlocked && unlocked.get(id);
    const hold = unseen && exp != null && round < exp - UNLOCK_BOOST_ROUNDS + UNLOCKED_ROUNDS ? UNLOCKED_HOLD : 1;
    const rk = reciprocal && reciprocalKey(w.card, actor);
    const f = { ...w.factors, unseen: unseen ? UNSEEN : 1, unlockedHold: hold, missed: missed ? missedFactor(missed.get(id)) : 1 };
    if (rk) f.reciprocal = reciprocal.has(rk) ? RECIPROCAL_REPEAT : 1;
    return { ...w, factors: f, weight: w.weight * f.unseen * f.unlockedHold * f.missed * (f.reciprocal ?? 1) };
  });
  // 4 · renormalizar: lo que no es UNDRESS conserva su masa total; UNDRESS conserva su probabilidad exacta
  let sum = boosted.reduce((a, w) => a + w.weight, 0);
  let out;
  if (massOthers <= 0) out = boosted.map(w => ({ ...w, weight: 0 })); // antes ninguna podía salir: sigue igual
  else if (sum <= 0) out = boosted.map(w => ({ ...w, weight: massOthers / boosted.length })); // todo a cero tras el cooldown: azar plano entre lo permitido
  else out = boosted.map(w => ({ ...w, weight: w.weight * massOthers / sum }));
  return { weighted: [...out, ...undress], relaxed };
}
/* tras la elección: las no-UNDRESS que estaban en el sorteo y no salieron suman una oportunidad perdida; la elegida vuelve a 0 */
export function recordMissed(missed, candidates, chosenId) {
  for (const w of candidates) { if (w.card.interactionType === 'UNDRESS') continue; const id = w.card.id; missed.set(id, id === chosenId ? 0 : (missed.get(id) || 0) + 1); }
  if (chosenId && missed.has(chosenId)) missed.set(chosenId, 0);
}
