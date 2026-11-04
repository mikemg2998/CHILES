/* SESSION DIRECTOR. La pareja controla la dirección (nivel, seguir, otra, más suave, pasar, parar). El director solo
   controla la calidad: continuidad, variedad, ritmo, y en Intimidad el ritmo de las cartas UNDRESS. Nunca cambia el
   nivel (nextLevel = USER_DECISION), nunca decide que la pareja «está lista», nunca convierte ME GUSTA en subir.
   Todo este estado vive en memoria. */
import { LEVELS, LEVEL_COPY } from './levels.js';
import { MOODS, moodProfile, moodPurposeBias } from './mood.js';
export { LEVEL_COPY, MOODS };

export const PURPOSES = ['CONNECT', 'BUILD', 'EXPLORE', 'DEEPEN', 'MAINTAIN', 'VARIATION', 'SOFTEN', 'COOLDOWN', 'END'];
export const PURPOSE_LABEL = { CONNECT: 'Conectar', BUILD: 'Construir', EXPLORE: 'Explorar', DEEPEN: 'Profundizar', MAINTAIN: 'Mantener', VARIATION: 'Variar', SOFTEN: 'Suavizar', COOLDOWN: 'Bajar el ritmo', END: 'Cerrar' };

/* «¿Cómo llegáis hoy?»: cuatro moods por persona (engine/mood.js). Cada persona elige el suyo; el perfil de sesión es la
   intersección (lo cauteloso manda). Es información del Session Director y del weighting, nunca de la elegibilidad. */
/* sí (por defecto) · quizá (puede salir poco; nunca pasa a sí solo) · hoy no (fuera). El «hoy no» de cualquiera vale para los dos. */
export const PREF_STATES = ['si', 'quiza', 'no'];
export const PREF_LABEL = { si: 'Sí', quiza: 'Quizá', no: 'Hoy no' };
export const AVOIDS = {
  boca: { label: 'Boca y besos', tag: 'boca' },
  presion: { label: 'Mordiscos y presión', tag: 'presion' },
  ropa: { label: 'Quitarse ropa', tag: 'ropa' },
  guia: { label: 'Guiar con la mano', tag: 'guia' },
  intimo: { label: 'Anatomía íntima', tag: 'intimo' },
};

export class SessionState {
  constructor(level = 1) {
    this.level = level; this.startLevel = level;
    this.intents = [[], []]; this.pref = [{}, {}];
    this.rounds = 0; this.roundsInLevel = 0; this.purposes = [];
    this.soften = 0; // 0…1: la pareja pidió «más suave»; decae sola
    this.feedback = []; this.liked = []; this.familyScore = {}; this.typeScore = {}; this.lastFeedback = null;
    this.intimacyCardCount = 0; // cartas jugadas en Intimidad (LATE_SESSION); sin pausa de continuidad desde 2026-11-04
    this.ended = null; this.lastMessage = null;
  }
  intentSet() { const [a, b] = this.intents; if (!a.length) return new Set(b); if (!b.length) return new Set(a); const inter = a.filter(x => b.includes(x)); return new Set(inter.length ? inter : [...a, ...b]); }
  /* mood de cada jugador (uno por persona; si eligió varios en un guardado antiguo, el primero) y perfil de intersección */
  moodOf(player) { return (this.intents[player] || [])[0] || null; }
  moodProfile() { return moodProfile(this.moodOf(0), this.moodOf(1)); }
  avoidSet() { const out = new Set(); for (const p of this.pref) for (const k in p) if (p[k] === 'no') out.add(k); return out; }
  maybeSet() { const out = new Set(); for (const p of this.pref) for (const k in p) if (p[k] === 'quiza') out.add(k); for (const k of this.avoidSet()) out.delete(k); return out; }
}

const bump = (map, k, d) => { if (k) map[k] = (map[k] || 0) + d; };
export const softScore = (map, k, base = 1.25, lo = 0.5, hi = 1.8) => k && map[k] ? Math.max(lo, Math.min(hi, Math.pow(base, map[k]))) : 1;

export class SessionDirector {
  constructor(rng) { this.rng = rng; }

  /* ---- propósito de la carta: un sesgo suave sobre familias y tipos; nunca sobre el nivel ---- */
  purpose(S, history) {
    if (S.ended) return { purpose: 'END', reason: 'sesión cerrada' };
    const last = history.last(), fb = S.lastFeedback;
    if (S.soften > 0.3) return { purpose: 'SOFTEN', reason: 'la pareja pidió más suave' };
    if (fb && last && fb.round === last.n && fb.kind === 'like' && this.rng.chance(0.5)) return { purpose: 'DEEPEN', reason: 'me gusta: algo cercano, sin repetir' }; // el feedback manda sobre el mood inicial
    if (S.roundsInLevel < 2) return { purpose: S.level === 1 ? 'CONNECT' : 'BUILD', reason: 'primeras cartas del nivel' };
    const profile = S.moodProfile();
    const w = moodPurposeBias({ BUILD: 0.3, EXPLORE: 0.25, MAINTAIN: 0.2, VARIATION: 0.15, COOLDOWN: 0.1, CONNECT: S.level === 1 ? 0.3 : 0.05 }, profile);
    const p = this.rng.weighted(Object.entries(w).map(([k, v]) => ({ item: k, weight: v })));
    return { purpose: p, reason: 'curva de la sesión' };
  }

  /* ---- multiplicador por propósito, humor y feedback para un candidato (carta) ---- */
  weight(purpose, S, history, card) {
    const last = history.last();
    let w = 1;
    const soft = ['MASSAGE', 'HUG', 'CLOSENESS', 'HAIR', 'HANDS', 'MUSIC', 'CARESS'].includes(card.family);
    const inten = card.intraLevelIntensity;
    switch (purpose) {
      case 'CONNECT': case 'COOLDOWN': w *= soft ? 1.6 : 0.7; if (inten === 'HIGH') w *= 0.5; break;
      case 'SOFTEN': w *= soft ? 1.8 : 0.6; w *= inten === 'HIGH' ? 0.25 : inten === 'LOW' ? 1.5 : 1; break;
      case 'BUILD': w *= inten === 'HIGH' ? 0.8 : 1; if (['KISS', 'NECK', 'ABDOMEN'].includes(card.family)) w *= 1.3; break;
      case 'DEEPEN': if (last) w *= card.family === last.family ? 2.2 : 0.8; break; // cerca de lo que gustó, sin repetir la carta (eso lo hace el historial)
      case 'MAINTAIN': case 'VARIATION': if (last && card.family === last.family) w *= 0.3; break;
      case 'EXPLORE': { const seen = history.rounds.filter(r => r.family === card.family).length; w *= 1 / (1 + 0.5 * seen); break; }
      default: break;
    }
    /* el mood ya no vive aquí: moodWeight (engine/mood.js) se aplica en weighDeck después del propósito y antes del historial */
    /* Intimidad: el director puede favorecer oportunidades, nunca decidir que la pareja está lista */
    if (S.level === 3) {
      const t = card.interactionType;
      if (t === 'UNDRESS') { const since = history.sinceType('UNDRESS'); w *= since === 0 ? 0.08 : since === 1 ? 0.35 : since >= 3 ? 1.6 : 1; }
      if (['BODY_TO_BODY', 'GUIDED', 'POSITIONAL'].includes(t) && history.sinceType(t) >= 4) w *= 1.3;
    }
    /* «quizá»: puede salir, pero no se asume */
    for (const k of S.maybeSet()) if (card.tags.includes(AVOIDS[k].tag)) w *= 0.08;
    return w * softScore(S.familyScore, card.family) * softScore(S.typeScore, card.interactionType, 1.15, 0.7, 1.4);
  }

  afterRound(S, round) {
    S.rounds++; S.roundsInLevel++;
    S.purposes.unshift(round.purpose); if (S.purposes.length > 12) S.purposes.pop();
    S.soften = Math.max(0, S.soften - 0.25);
    if (S.level === 3 && !round.transition) S.intimacyCardCount++;
  }
  /* Sin pausa de continuidad (diseñador, 2026-11-04): el juego nunca pregunta si la pareja quiere terminar; solo termina cuando ella decide. */

  /* ---- feedback: ME GUSTA favorece familias afines de forma suave. Nunca repite la carta, nunca sube intensidad ni nivel. ---- */
  feedback(S, round, kind) {
    if (!round) return;
    S.feedback.push({ round: round.n, kind }); S.lastFeedback = { round: round.n, kind };
    if (kind === 'like') { S.liked.push(round.id); bump(S.familyScore, round.family, 1); bump(S.typeScore, round.interactionType, 0.5); }
    else if (kind === 'cambia') { bump(S.familyScore, round.family, -0.4); }
    else if (kind === 'paso') { bump(S.familyScore, round.family, -0.6); bump(S.typeScore, round.interactionType, -0.3); }
  }
  setLevel(S, level) {
    level = Number(level);
    if (!LEVELS[level] || level === S.level) return null;
    S.level = level; S.roundsInLevel = 0; S.soften = 0;
    S.lastMessage = LEVEL_COPY[level];
    return S.lastMessage;
  }
  softer(S) { S.soften = Math.min(1, S.soften + 0.6); }
  /* cierre sin victoria, sin objetivo, sin nivel completado */
  end(S, how = 'parar') { S.ended = how; S.lastMessage = 'Hasta aquí estuvo bien.'; return S.lastMessage; }
}
