/* SESSION DIRECTOR. La pareja controla la dirección (empezar, seguir, pasar, otra, más suave, subir, bajar, terminar).
   El director controla la calidad: qué proponer, continuidad, variedad, anti-repetición, intensidad DENTRO del nivel.
   El nivel es siempre una decisión de la pareja: nextLevel = USER_DECISION. Nunca sube solo.
   Todo este estado vive en memoria: nunca se guarda ni se envía a ningún sitio. */
import { LEVELS, ACTIONS, TARGETS } from './grammar.js';
import { TARGET_BUCKETS } from './intensity.js';

export const PURPOSES = ['CONNECT', 'BUILD', 'EXPLORE', 'DEEPEN', 'MAINTAIN', 'VARIATION', 'COOLDOWN', 'END'];
export const PURPOSE_LABEL = { CONNECT: 'Conectar', BUILD: 'Construir', EXPLORE: 'Explorar', DEEPEN: 'Profundizar', MAINTAIN: 'Mantener', VARIATION: 'Variar', COOLDOWN: 'Bajar el ritmo', END: 'Cerrar' };
/* copy breve al cambiar de nivel (decisión de la pareja, sin confirmación) */
export const LEVEL_COPY = { 1: 'No tenemos que llegar a ningún sitio.', 2: 'Un poco más cerca.', 3: 'Esto nos está gustando.', 4: 'Hasta donde queráis.' };

/* "¿Cómo llegas hoy?": estado de disponibilidad, no una declaración sobre sexo. Por jugador; se usa lo común, si no, la unión. */
export const MOODS = {
  cerca: { label: 'Quiero sentirme cerca' },
  cuidar: { label: 'Me apetece que me cuiden' },
  curiosidad: { label: 'Tengo curiosidad' },
  jugar: { label: 'Quiero jugar' },
  abierto: { label: 'Abro la puerta a ver qué surge' },
  tranquilo: { label: 'Hoy, algo tranquilo' },
};
export const INTENTS = MOODS; // compatibilidad
/* Preferencias de la sesión con tres estados: sí (por defecto) · quizá (no se asume; pesa menos y nunca pasa a sí solo) · hoy no (fuera).
   El «hoy no» de cualquiera de los dos vale para toda la sesión. */
export const PREF_STATES = ['si', 'quiza', 'no'];
export const PREF_LABEL = { si: 'Sí', quiza: 'Quizá', no: 'Hoy no' };
export const AVOIDS = {
  boca: { label: 'Boca y besos', contact: ['boca'] },
  presion: { label: 'Presión y mordiscos', actionTags: ['presion'], actions: ['BITE', 'SPANK', 'GRIP', 'SQUEEZE'] },
  ropa: { label: 'Apartar ropa', actionTags: ['ropa'] },
  voz: { label: 'Hablar en voz alta', actionTags: ['voz'] },
  guia: { label: 'Guiar con la mano', patterns: ['GUIDED'] },
  intimo: { label: 'Anatomía íntima', groups: ['intimaF', 'intimaM'] },
};
/* ¿la regla «hoy no» aparta esta acción / zona / patrón? */
export const ruleBlocksAction = (r, a) => !!((r.contact && r.contact.includes(a.contactType)) || (r.actionTags && r.actionTags.some(t => a.tags.includes(t))) || (r.actions && r.actions.includes(a.id)));
export const ruleBlocksTarget = (r, z) => !!(r.groups && r.groups.includes(z.group));
export const ruleBlocksPattern = (r, p) => !!(r.patterns && r.patterns.includes(p));

export class SessionState {
  constructor(level = 1) {
    this.level = level; this.startLevel = level;
    this.intents = [[], []]; this.pref = [{}, {}]; // pref[player][key] = 'quiza' | 'no' (sí = ausente)
    this.intraLevelIntensity = 0; // -1 … 1: más suave / más / menos, siempre dentro del nivel
    this.calmUntil = 0; this.lastCalm = -99; // rondas sin escalada
    this.rounds = 0; this.roundsInLevel = 0;
    this.intensityHistory = []; this.purposes = [];
    this.feedback = []; // {round, kind, more}
    this.liked = []; this.changed = []; this.skipped = [];
    this.familyScore = {}; this.zoneScore = {}; this.semanticScore = {}; this.actorScore = {}; this.patternScore = {}; this.comboScore = {};
    this.pressure = 0; this.pace = 0; // -1 … 1 preferencias aprendidas (MÁS / MENOS)
    this.lastFeedback = null; this.deepenStreak = 0;
    this.ended = null; this.lastMessage = null;
  }
  get avoid() { return this.pref.map(p => Object.keys(p).filter(k => p[k] === 'no')); }
  maybeSet() { const out = new Set(); for (const p of this.pref) for (const k in p) if (p[k] === 'quiza') out.add(k); for (const k of this.avoidSet()) out.delete(k); return out; }
  intentSet() {
    const [a, b] = this.intents; if (!a.length) return new Set(b); if (!b.length) return new Set(a);
    const inter = a.filter(x => b.includes(x)); return new Set(inter.length ? inter : [...a, ...b]);
  }
  avoidSet() { const [a, b] = this.avoid; return new Set([...a, ...b]); }
  calm() { return this.rounds < this.calmUntil; }
}

const bump = (map, k, d) => { if (k) map[k] = (map[k] || 0) + d; };
const scoreMul = (map, k, base = 1.3, lo = 0.25, hi = 2.5) => k && map[k] ? Math.max(lo, Math.min(hi, Math.pow(base, map[k]))) : 1;

export class SessionDirector {
  constructor(rng) { this.rng = rng; }

  /* ---- propósito de la ronda ---- */
  purpose(S, history) {
    if (S.ended) return { purpose: 'END', reason: 'sesión cerrada' };
    const L = LEVELS[S.level], last = history.last(), fb = S.lastFeedback;
    if (fb && last && fb.round === last.n) {
      if (fb.kind === 'like' && S.deepenStreak < 2) return { purpose: 'DEEPEN', reason: 'me gusta: evolución compatible' };
      if (fb.kind === 'cambia') return { purpose: 'VARIATION', reason: 'cambia: otra experiencia' };
      if (fb.kind === 'paso') return { purpose: 'MAINTAIN', reason: 'paso: se descarta sin castigo' };
    }
    if (S.roundsInLevel < 2) return { purpose: S.level === 1 ? 'CONNECT' : 'BUILD', reason: 'primeras rondas del nivel' };
    const intents = S.intentSet();
    // rondas sin escalada: de vez en cuando (sobre todo en Conexión) el director se compromete a no subir durante unas tiradas
    if (!S.calm() && S.rounds - S.lastCalm >= 7 && this.rng.chance(S.level === 1 ? 0.3 : 0.12)) { S.calmUntil = S.rounds + 3; S.lastCalm = S.rounds; }
    if (S.calm()) return { purpose: this.rng.pick(['MAINTAIN', 'MAINTAIN', 'COOLDOWN', S.level === 1 ? 'CONNECT' : 'VARIATION']), reason: 'ronda sin escalada' };
    const rec = S.intensityHistory;
    const peak = rec.length && rec[0] >= L.max - 0.6;
    const rising = rec.length >= 2 && rec[0] > rec[1] + 0.3;
    if ((peak || (rising && rec.length >= 3 && rec[1] > rec[2] + 0.3)) && this.rng.chance(0.7)) return { purpose: 'COOLDOWN', reason: 'después de un pico, descanso' };
    const w = { BUILD: 0.35, EXPLORE: 0.25, MAINTAIN: 0.2, VARIATION: 0.1, COOLDOWN: 0.1, CONNECT: S.level === 1 ? 0.3 : 0 };
    if (intents.has('tranquilo')) { w.BUILD *= 0.6; w.COOLDOWN *= 1.8; w.MAINTAIN *= 1.4; }
    if (intents.has('curiosidad') || intents.has('abierto')) { w.EXPLORE *= 1.6; w.VARIATION *= 1.3; }
    if (intents.has('cerca')) { w.CONNECT *= 2; w.COOLDOWN *= 1.3; }
    if (intents.has('cuidar')) { w.COOLDOWN *= 1.5; w.CONNECT *= 1.6; w.BUILD *= 0.7; }
    if (S.intraLevelIntensity < -0.3) { w.BUILD *= 0.6; w.MAINTAIN *= 1.3; }
    const p = this.rng.weighted(Object.entries(w).map(([k, v]) => ({ item: k, weight: v })));
    return { purpose: p, reason: 'curva de la sesión' };
  }

  /* ---- objetivo de intensidad según propósito (siempre dentro del nivel) ---- */
  target(purpose, S, history) {
    const L = LEVELS[S.level], B = TARGET_BUCKETS[S.level].map(b => ({ lo: b[0], hi: b[1], w: b[2] }));
    const last = history.last(), li = last ? last.intensity : null;
    const pick = () => { const b = this.rng.weighted(B.map(x => ({ item: x, weight: x.w }))); return b.lo + this.rng.next() * (b.hi - b.lo); };
    let t;
    switch (purpose) {
      case 'CONNECT': case 'COOLDOWN': t = B[0].lo + this.rng.next() * (B[Math.min(1, B.length - 1)].lo - B[0].lo + 0.5); break;
      case 'BUILD': t = li != null ? li + 0.4 + this.rng.next() * 0.9 : pick(); break;
      case 'DEEPEN': t = li != null ? li + (this.rng.next() - 0.3) * 0.8 : pick(); break;
      case 'MAINTAIN': case 'VARIATION': t = li != null ? li + (this.rng.next() - 0.5) * 0.8 : pick(); break;
      default: t = pick();
    }
    if (S.calm() && li != null) t = Math.min(t, li); // sin escalada: nunca por encima de la última
    t += S.intraLevelIntensity * (L.max - L.lo) * 0.35; // más suave / más / menos, dentro del nivel
    return Math.round(Math.max(L.lo, Math.min(L.max - (S.level === 4 ? 0 : 0.5), t)) * 10) / 10;
  }

  /* ---- multiplicadores por propósito, intención y feedback ---- */
  modifiers(purpose, S, history) {
    const intents = S.intentSet(), last = history.last();
    const lastA = last ? ACTIONS[last.action] : null, lastZ = last ? TARGETS[last.target] : null;
    const famCount = {}; for (const r of history.rounds) bump(famCount, r.families && r.families.action, 1);
    const P = {
      CONNECT: { fam: { masaje: 1.6, cercania: 1.7, caricia: 1.3, juego: 1.2, anticipacion: 0.4, boca: 0.3, presion: 0.4, ropa: 0.4 }, pattern: { MUTUAL: 1.5 } },
      BUILD: { fam: { anticipacion: 1.5, beso: 1.3, ropa: 1.3, boca: 1.1 }, pattern: { DISCOVER: 1.4 } },
      EXPLORE: { fam: {}, pattern: { GUIDED: 1.3 } },
      DEEPEN: { fam: {}, pattern: { GUIDED: 1.3 } },
      MAINTAIN: { fam: {}, pattern: {} },
      VARIATION: { fam: {}, pattern: { GUIDED: 1.4, DISCOVER: 1.3, MUTUAL: 1.2 } },
      COOLDOWN: { fam: { masaje: 1.6, cercania: 1.6, caricia: 1.3, presion: 0.4, boca: 0.4, intimo: 0.6 }, pattern: { MUTUAL: 1.3 } },
      END: { fam: {}, pattern: {} },
    }[purpose] || { fam: {}, pattern: {} };
    const F = S.familyScore, Zs = S.zoneScore, Sem = S.semanticScore, maybe = S.maybeSet();
    const MAYBE = 0.05; // «quizá»: puede salir, pero no se asume
    const maybeAction = a => [...maybe].some(k => ruleBlocksAction(AVOIDS[k], a)) ? MAYBE : 1;
    const maybeTarget = z => [...maybe].some(k => ruleBlocksTarget(AVOIDS[k], z)) ? MAYBE : 1;
    return {
      purpose, maybeAction, maybeTarget,
      /* combinación completa: familia y patrón según el propósito, continuidad o variación respecto a la última, humor de hoy y feedback */
      combo: c => {
        const a = ACTIONS[c.action], z = TARGETS[c.target];
        let w = (P.fam[a.semanticFamily] || 1) * (P.pattern[a.pattern] || 1) * maybeAction(a) * maybeTarget(z);
        if (purpose === 'DEEPEN' && lastA) w *= a.semanticFamily === lastA.semanticFamily ? 4 : a.id === lastA.id ? 3 : 0.5;
        if (purpose === 'DEEPEN' && lastZ) w *= z.family === lastZ.family ? 3 : z.group === lastZ.group ? 1.5 : 0.6;
        if ((purpose === 'MAINTAIN' || purpose === 'VARIATION') && lastA && a.semanticFamily === lastA.semanticFamily) w *= 0.3;
        if ((purpose === 'MAINTAIN' || purpose === 'VARIATION') && lastZ && z.family === lastZ.family) w *= 0.4;
        if (purpose === 'EXPLORE') { w *= 1 / (1 + 0.5 * (famCount[a.semanticFamily] || 0)); const seen = history.rounds.filter(r => r.families && r.families.target === z.family).length; w *= 1 / (1 + 0.4 * seen); }
        if (intents.has('cuidar') && ['masaje', 'cercania', 'juego'].includes(a.semanticFamily)) w *= 1.6;
        if (intents.has('cerca') && a.pattern === 'MUTUAL') w *= 1.4;
        if (intents.has('curiosidad') && a.pattern === 'DISCOVER') w *= 1.4;
        if (intents.has('jugar') && (a.semanticFamily === 'juego' || ['BITE', 'BLOW', 'BRUSH'].includes(a.id))) w *= 1.4;
        if (intents.has('tranquilo') && ['cuerpo', 'presion', 'boca'].includes(a.semanticFamily)) w *= 0.5;
        return w * scoreMul(F, a.semanticFamily) * scoreMul(Zs, z.family) * scoreMul(Sem, `${a.semanticFamily}·${z.family}`, 1.4) * scoreMul(S.comboScore, c.key, 1.5, 0.15, 3);
      },
      /* estilo: lo que la pareja pidió con «un poco más / menos» y el humor de hoy */
      style: st => {
        let w = 1;
        if (st.dim === 'pressure') w *= st.dir > 0 ? 1 + 0.8 * S.pressure : 1 - 0.8 * S.pressure;
        if (st.dim === 'pace') w *= st.dir > 0 ? 1 + 0.8 * S.pace : st.dir < 0 ? 1 - 0.5 * S.pace : 1;
        if (intents.has('tranquilo')) w *= st.id === 'SLOW' || st.id === 'SOFT' ? 1.6 : st.id === 'FAST' ? 0.4 : 1;
        if (purpose === 'COOLDOWN') w *= st.intensityMod <= 0 ? 1.5 : 0.6;
        return Math.max(0.05, w);
      },
      /* GUIDED: ¿hay una razón para que quien recibe guíe con la mano? Nunca al azar sobre cualquier cosa. */
      guided: () => {
        if ([...S.avoidSet()].some(k => ruleBlocksPattern(AVOIDS[k], 'GUIDED'))) return 0;
        const fb = S.lastFeedback, likedLast = fb && last && fb.round === last.n && fb.kind === 'like';
        let p = { DEEPEN: likedLast ? 0.5 : 0.22, EXPLORE: 0.35, VARIATION: 0.4, BUILD: 0.18, MAINTAIN: 0.18, CONNECT: 0.1, COOLDOWN: 0.12 }[purpose] || 0.12;
        if (last && last.pattern === 'GUIDED') return 0; // nunca dos guiadas seguidas
        if (history.rounds.slice(0, 3).some(r => r.pattern === 'GUIDED')) p *= 0.3; // ni casi
        if (intents.has('cuidar') || intents.has('curiosidad')) p *= 1.4;
        if (S.pressure !== 0 || S.pace !== 0) p *= 1.3; // la pareja ya ha pedido ajustes: que los marque con la mano
        if ([...maybe].some(k => ruleBlocksPattern(AVOIDS[k], 'GUIDED'))) p *= MAYBE;
        return Math.min(0.6, p * scoreMul(S.patternScore, 'GUIDED'));
      },
    };
  }

  /* ---- ronda registrada ---- */
  afterRound(S, round) {
    S.rounds++; S.roundsInLevel++;
    S.intensityHistory.unshift(round.intensity); if (S.intensityHistory.length > 12) S.intensityHistory.pop();
    S.purposes.unshift(round.purpose); if (S.purposes.length > 12) S.purposes.pop();
    S.deepenStreak = round.purpose === 'DEEPEN' ? S.deepenStreak + 1 : 0;
  }

  /* ---- feedback: ME GUSTA / CAMBIA / PASO (+ MÁS / MENOS). Señales suaves sobre pesos, nunca un perfil. ---- */
  feedback(S, round, kind, extra = {}) {
    if (!round) return;
    const a = ACTIONS[round.action], z = TARGETS[round.target];
    const sem = `${a.semanticFamily}·${z.family}`, key = `${round.action}|${round.tool}|${round.target}`;
    S.feedback.push({ round: round.n, kind, more: extra.more ?? null });
    S.lastFeedback = { round: round.n, kind };
    if (kind === 'like') {
      S.liked.push(round.id); bump(S.familyScore, a.semanticFamily, 1); bump(S.zoneScore, z.family, 0.8); bump(S.semanticScore, sem, 0.5); bump(S.actorScore, round.tool, 0.5); bump(S.comboScore, key, 0.6);
      if (round.pattern === 'GUIDED') bump(S.patternScore, 'GUIDED', 0.8);
      const pressureLike = round.style ? ['SOFT', 'FIRM'].includes(round.style) : a.tags.includes('presion');
      if (extra.more === true) { if (pressureLike) S.pressure = Math.min(1, S.pressure + 0.35); else S.pace = Math.min(1, S.pace + 0.35); S.intraLevelIntensity = Math.min(1, S.intraLevelIntensity + 0.3); }
      if (extra.more === false) { if (pressureLike) S.pressure = Math.max(-1, S.pressure - 0.35); else S.pace = Math.max(-1, S.pace - 0.35); S.intraLevelIntensity = Math.max(-1, S.intraLevelIntensity - 0.3); }
    } else if (kind === 'cambia') {
      S.changed.push(round.id); bump(S.semanticScore, sem, -1.2); bump(S.familyScore, a.semanticFamily, -0.3); bump(S.comboScore, key, -1);
      if (round.pattern === 'GUIDED') bump(S.patternScore, 'GUIDED', -0.5);
    } else if (kind === 'paso') { // «esta no, ahora»: no se infiere una preferencia íntima de un solo evento
      S.skipped.push(round.id); bump(S.familyScore, a.semanticFamily, -0.5); bump(S.semanticScore, sem, -1.5); bump(S.comboScore, key, -1.2);
      if (round.pattern === 'GUIDED') bump(S.patternScore, 'GUIDED', -0.6);
    }
  }

  /* ---- nivel: siempre decisión de la pareja, en cualquier dirección, sin confirmación ---- */
  setLevel(S, level) {
    level = Math.max(1, Math.min(4, Number(level) || 1));
    if (level === S.level) return null;
    S.level = level; S.roundsInLevel = 0; S.intraLevelIntensity = 0; S.calmUntil = 0;
    S.lastMessage = LEVEL_COPY[level];
    return S.lastMessage;
  }
  /* más suave: la misma dirección con menos intensidad, dentro del nivel */
  softer(S) { S.intraLevelIntensity = Math.max(-1, S.intraLevelIntensity - 0.4); }
  end(S, how = 'parar') { S.ended = how; S.lastMessage = how === 'solos' ? 'A partir de aquí, vosotros decidís.' : 'Hasta aquí estuvo bien.'; return S.lastMessage; }
}
