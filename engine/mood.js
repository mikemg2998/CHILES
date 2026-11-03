/* MOODS DE LLEGADA («¿Cómo llegáis hoy?»). Cuatro estados por persona, cada uno con DIMENSIONES, no un preset por combinación.
   El perfil de la sesión se obtiene por INTERSECCIÓN de los dos moods: lo que cada uno desea suma (cercanía, exploración) y lo
   cauteloso manda (calma = máximo, tolerancia a la intensidad y velocidad de progresión = mínimo): la apertura de una persona
   nunca borra la calma de la otra. El mood solo PONDERA cartas ya elegibles (después de anatomía, ropa, nivel, tardías,
   posición y propósito): jamás rescata una carta incompatible ni cambia el nivel. Es estado de la sesión actual, no una
   preferencia permanente. El feedback posterior (me gusta · más suave · otra · pasar) sigue mandando sobre el rumbo. */

export const MOODS = {
  cerca: { label: 'Quiero sentirte cerca', descriptor: 'Cercanía', meaning: 'proximidad, contacto sostenido, presencia', dims: { closeness: 1, calm: 0.35, exploration: 0, intensity: 0, progression: 0 } },
  curiosidad: { label: 'Tengo curiosidad', descriptor: 'Explorar', meaning: 'variedad, descubrir, targets menos usados', dims: { closeness: 0, calm: 0, exploration: 1, intensity: 0.35, progression: 0.3 } },
  abierto: { label: 'A ver qué surge', descriptor: 'Abierto', meaning: 'apertura, rango amplio, libertad de evolución', dims: { closeness: 0, calm: 0, exploration: 0.5, intensity: 0.6, progression: 0.8 } },
  tranquilo: { label: 'Hoy, algo tranquilo', descriptor: 'Calma', meaning: 'lento, cómodo, baja presión', dims: { closeness: 0.3, calm: 1, exploration: 0, intensity: -1, progression: -0.8 } },
};
export const MOOD_IDS = Object.keys(MOODS);
export const NEUTRAL = { closeness: 0, calm: 0, exploration: 0, intensity: 0, progression: 0 };

/* perfil de la sesión a partir de los moods de cada persona (null / undefined = no eligió) */
export function moodProfile(a, b) {
  const A = MOODS[a] && MOODS[a].dims, B = MOODS[b] && MOODS[b].dims;
  if (!A && !B) return { ...NEUTRAL, moods: [] };
  if (!A || !B) return { ...(A || B), moods: [a || b].filter(Boolean) };
  return {
    closeness: (A.closeness + B.closeness) / 2,          // cada deseo de cercanía suma
    exploration: (A.exploration + B.exploration) / 2,    // cada deseo de explorar suma
    calm: Math.max(A.calm, B.calm),                      // la calma de uno vale para los dos
    intensity: Math.min(A.intensity, B.intensity),       // el más cauteloso limita la intensidad
    progression: Math.min(A.progression, B.progression), // y la velocidad de escalada
    moods: [a, b],
  };
}

/* rasgos de una carta derivados de su metadata (sin editar cartas). Cada rasgo en 0…1 (calm en −1…1). */
const PROX_FAMILY = { HUG: 0.8, CLOSENESS: 0.8, BODY: 0.8, REST: 0.6, BREATHING: 0.6, MASSAGE: 0.3, CARESS: 0.3 };
const PROX_GROUPS = ['EMBRACE', 'BODY_CONTACT', 'BODY_REST', 'BREATHING'];
const CALM_FAMILIES = ['MASSAGE', 'HUG', 'CARESS', 'REST', 'BREATHING', 'HAIR', 'MUSIC', 'CLOSENESS', 'HANDS', 'WORDS'];
const EXPLORE_TYPES = ['CHOOSE', 'GUIDED', 'PATH'];
const EXPLORE_GROUPS = ['PLAYFUL', 'CHOICE', 'GUIDED', 'DANCE', 'CLOTHED_TEASE'];
export function cardTraits(c) {
  const proximity = Math.min(1, (c.interactionType === 'BODY_TO_BODY' ? 1 : c.interactionType === 'MUTUAL' ? 0.7 : 0) + (PROX_FAMILY[c.family] || 0) + (PROX_GROUPS.includes(c.similarityGroup) ? 0.3 : 0) + (c.durations.some(d => d >= 45) ? 0.15 : 0));
  const calm = Math.max(-1, Math.min(1, (c.intraLevelIntensity === 'LOW' ? 0.5 : c.intraLevelIntensity === 'HIGH' ? -1 : 0) + (CALM_FAMILIES.includes(c.family) ? 0.5 : 0) - (c.family === 'BITE' || c.tags.includes('presion') ? 0.7 : 0) - (c.interactionType === 'POSITIONAL' ? 0.5 : 0) - (c.family === 'PLAY' ? 0.3 : 0) - (c.interactionType === 'CHOOSE' ? 0.2 : 0)));
  const exploration = Math.min(1, (EXPLORE_TYPES.includes(c.interactionType) ? 1 : 0) + (EXPLORE_GROUPS.includes(c.similarityGroup) ? 0.5 : 0) + (c.playConstraints ? 0.3 : 0) + (c.variants && c.variants.length > 1 ? 0.2 : 0) + (c.family === 'PLAY' ? 0.5 : 0) + (c.family === 'MUSIC' ? 0.3 : 0));
  const intensity = c.intraLevelIntensity === 'HIGH' ? 1 : c.intraLevelIntensity === 'LOW' ? -1 : 0;
  return { proximity, calm, exploration, intensity };
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
/* multiplicador moderado y explicable (0,2 … 3). history: «targets menos usados» (curiosidad); session: escalada progresiva (abierto). */
export function moodWeight(card, profile, history = null, session = null) {
  if (!profile || !profile.moods || !profile.moods.length || card.interactionType === 'UNDRESS') return 1;
  const t = cardTraits(card), f = {};
  // CERCANÍA: lo próximo sube con fuerza; lo no próximo baja un poco (nunca desaparece)
  f.closeness = t.proximity >= 0.3 ? 1 + 2 * profile.closeness * t.proximity : 1 - 0.5 * profile.closeness;
  // CALMA: lo lento sube, lo intenso / mordiscos / posicionales / juego bajan
  f.calm = 1 + profile.calm * t.calm;
  // INTENSIDAD: la tolerancia más cautelosa manda. Negativa: HIGH baja fuerte y LOW sube. Positiva: HIGH se abre de forma PROGRESIVA
  // (al principio de la sesión pesa menos, después más), LOW baja un poco: la sesión evoluciona sin cambiar de nivel.
  if (profile.intensity < 0) f.intensity = t.intensity > 0 ? 1 + 0.75 * profile.intensity : t.intensity < 0 ? 1 - 0.5 * profile.intensity : 1;
  else {
    const ramp = Math.min(1, ((session && session.roundsInLevel) || 0) / 8), p = profile.progression > 0 ? profile.progression : 0;
    f.intensity = t.intensity > 0 ? (1 - 0.4 * p) + (0.4 * p + 0.6 * profile.intensity) * ramp : t.intensity < 0 ? 1 + 0.2 * p - 0.35 * profile.intensity * ramp : 1;
  }
  // EXPLORACIÓN: tipos y grupos exploratorios suben; targets que no han salido suben; familias ya vistas bajan
  f.exploration = 1 + 1.8 * profile.exploration * t.exploration;
  if (history && profile.exploration > 0) {
    const recent = history.rounds.slice(0, 8), parts = card.receiverRequirements.map(r => r.part);
    const fresh = parts.length && !recent.some(r => (r.parts || []).some(p => parts.includes(p)));
    if (fresh) f.exploration *= 1 + 0.5 * profile.exploration;
    const seen = history.rounds.filter(r => r.family === card.family).length; f.exploration *= 1 / (1 + 0.3 * profile.exploration * seen);
  }
  return clamp(f.closeness * f.calm * f.intensity * f.exploration, 0.2, 3);
}
/* sesgo del perfil sobre los pesos de PROPÓSITO del director (velocidad de progresión y calma); nunca sobre el nivel */
export function moodPurposeBias(w, profile) {
  if (!profile || !profile.moods || !profile.moods.length) return w;
  const o = { ...w };
  if (profile.calm > 0) { o.COOLDOWN *= 1 + 1.2 * profile.calm; o.MAINTAIN *= 1 + 0.6 * profile.calm; o.BUILD *= 1 - 0.5 * profile.calm; }
  if (profile.closeness > 0) { o.CONNECT *= 1 + 1.5 * profile.closeness; o.COOLDOWN *= 1 + 0.4 * profile.closeness; }
  if (profile.exploration > 0) { o.EXPLORE *= 1 + 0.9 * profile.exploration; o.VARIATION *= 1 + 0.6 * profile.exploration; }
  if (profile.progression > 0) { o.BUILD *= 1 + 0.5 * profile.progression; o.EXPLORE *= 1 + 0.4 * profile.progression; }
  else if (profile.progression < 0) { o.BUILD *= 1 + 0.5 * profile.progression; o.EXPLORE *= 1 + 0.3 * profile.progression; }
  return o;
}
