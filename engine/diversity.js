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
   similarityGroup sigue siendo una penalización semántica (weighDeck), no un veto de 10 cartas. Pesos base intactos. */
export const COOLDOWN = 10;
export const UNSEEN = 3;
export const UNLOCKED_HOLD = 1.5;
export const UNLOCKED_ROUNDS = 6;
const UNLOCK_BOOST_ROUNDS = 3; // engine.markUnlocked guarda round + 3 como expiración del empujón existente

/* ids de las últimas n cartas de Intimidad (más reciente primero) */
export function recentIntimacyIds(history, n = COOLDOWN) {
  return history.rounds.filter(r => r.level === 3 && !r.transition).slice(0, n).map(r => r.cardId);
}

/* weighted: salida de weighDeck. Devuelve { weighted, relaxed } con relaxed = null o { window, eligible } */
export function applyIntimacyDiversity(weighted, { level, history, seen, unlocked = null, round = 0 }) {
  if (level !== 3 || !weighted.length) return { weighted, relaxed: null };
  const isU = w => w.card.interactionType === 'UNDRESS';
  const others = weighted.filter(w => !isU(w)), undress = weighted.filter(isU);
  if (!others.length) return { weighted, relaxed: null };
  const massOthers = others.reduce((a, w) => a + w.weight, 0);
  // 1 · cooldown con relajación mínima
  const recent = recentIntimacyIds(history, COOLDOWN);
  let window = COOLDOWN, allowed = others.filter(w => !recent.includes(w.card.id));
  while (!allowed.length && window > 0) { window--; const r = recent.slice(0, window); allowed = others.filter(w => !r.includes(w.card.id)); }
  const relaxed = window < COOLDOWN ? { window, eligible: others.length } : null;
  // 2 · no vistas · 3 · recién desbloqueadas que aún no han salido
  const boosted = allowed.map(w => {
    const id = w.card.id, unseen = !(seen && seen.has(id));
    const exp = unlocked && unlocked.get(id);
    const hold = unseen && exp != null && round < exp - UNLOCK_BOOST_ROUNDS + UNLOCKED_ROUNDS ? UNLOCKED_HOLD : 1;
    const f = { ...w.factors, unseen: unseen ? UNSEEN : 1, unlockedHold: hold };
    return { ...w, factors: f, weight: w.weight * f.unseen * f.unlockedHold };
  });
  // 4 · renormalizar: lo que no es UNDRESS conserva su masa total; UNDRESS conserva su probabilidad exacta
  let sum = boosted.reduce((a, w) => a + w.weight, 0);
  let out;
  if (massOthers <= 0) out = boosted.map(w => ({ ...w, weight: 0 })); // antes ninguna podía salir: sigue igual
  else if (sum <= 0) out = boosted.map(w => ({ ...w, weight: massOthers / boosted.length })); // todo a cero tras el cooldown: azar plano entre lo permitido
  else out = boosted.map(w => ({ ...w, weight: w.weight * massOthers / sum }));
  return { weighted: [...out, ...undress], relaxed };
}
