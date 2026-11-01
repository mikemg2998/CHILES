/* SESSION DIRECTOR. La pareja controla la dirección (empezar, seguir, pasar, otra, más suave, subir, bajar, terminar).
   El director controla la calidad: qué proponer, continuidad, variedad, anti-repetición, intensidad DENTRO del nivel.
   El nivel es siempre una decisión de la pareja: nextLevel = USER_DECISION. Nunca sube solo.
   Todo este estado vive en memoria: nunca se guarda ni se envía a ningún sitio. */
import { LEVELS, ACTION, ZONE } from './catalog.js';
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
  presion: { label: 'Presión y mordiscos', actionTags: ['presion'], families: ['mordisco'] },
  ropa: { label: 'Apartar ropa', actionTags: ['ropa'] },
  vista: { label: 'Vendas y ojos cerrados', condFamilies: ['vista'] },
  voz: { label: 'Hablar en voz alta', condFamilies: ['voz'], actionTags: ['voz'] },
  intimo: { label: 'Anatomía íntima', groups: ['intimaF', 'intimaM'] },
};

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
    this.familyScore = {}; this.zoneScore = {}; this.semanticScore = {}; this.actorScore = {}; this.blueprintScore = {};
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
    const lastA = last ? ACTION[last.action] : null, lastZ = last ? ZONE[last.zone] : null;
    const famCount = {}; for (const r of history.rounds) bump(famCount, r.families && r.families.action, 1);
    const P = {
      CONNECT: { fam: { masaje: 1.6, abrazo: 1.7, caricia: 1.3, cabello: 1.4, anticipacion: 0.4, mordisco: 0.3, presion: 0.5, ropa: 0.4 }, pattern: { MUTUAL: 1.5 }, condRole: { conexion: 1.4, interaccion: 0.7 } },
      BUILD: { fam: { anticipacion: 1.5, beso: 1.3, ropa: 1.3, lengua: 1.2 }, pattern: { DISCOVER: 1.4 }, condRole: { interaccion: 1.2 } },
      EXPLORE: { fam: {}, pattern: {}, condRole: { interaccion: 1.3, escena: 1.1 } },
      DEEPEN: { fam: {}, pattern: {}, condRole: { interaccion: 1.2 } },
      MAINTAIN: { fam: {}, pattern: {}, condRole: {} },
      VARIATION: { fam: {}, pattern: { CHOOSE: 1.3, GUIDE: 1.3, DISCOVER: 1.3, MUTUAL: 1.2 }, condRole: { interaccion: 1.4 } },
      COOLDOWN: { fam: { masaje: 1.6, abrazo: 1.6, caricia: 1.3, presion: 0.4, mordisco: 0.3, bocaIntima: 0.6, manoIntima: 0.6 }, pattern: { MUTUAL: 1.3 }, condRole: { conexion: 1.3, interaccion: 0.6 } },
      END: { fam: {}, pattern: {}, condRole: {} },
    }[purpose] || { fam: {}, pattern: {}, condRole: {} };
    const F = S.familyScore, Zs = S.zoneScore, Sem = S.semanticScore, maybe = S.maybeSet();
    const MAYBE = 0.15; // «quizá»: puede salir, pero no se asume
    const maybeAction = a => [...maybe].some(k => { const r = AVOIDS[k]; return (r.contact && r.contact.includes(a.contactType)) || (r.actionTags && r.actionTags.some(t => a.tags.includes(t))) || (r.families && r.families.includes(a.family)); }) ? MAYBE : 1;
    const bpCount = {}; for (const r of history.rounds) bump(bpCount, r.blueprint, 1);
    return {
      purpose, maybeAction,
      /* blueprint: familia y patrón según el propósito, continuidad o variación respecto al último, humor de hoy y feedback */
      blueprint: b => {
        let w = (P.fam[b.family] || 1) * (P.pattern[b.pattern] || 1);
        if (purpose === 'DEEPEN' && last) w *= b.id === last.blueprint ? 4 : 0.5;
        if ((purpose === 'MAINTAIN' || purpose === 'VARIATION') && last && b.id === last.blueprint) w *= 0.3;
        if (purpose === 'EXPLORE') w *= 1 / (1 + 0.5 * (bpCount[b.id] || 0));
        if (intents.has('cuidar') && ['masaje', 'abrazo', 'cabello'].includes(b.family)) w *= 1.6;
        if (intents.has('cerca') && b.pattern === 'MUTUAL') w *= 1.4;
        if (intents.has('curiosidad') && b.pattern === 'DISCOVER') w *= 1.4;
        if (intents.has('jugar') && ['caricia', 'aCiegas', 'mordisco'].includes(b.family)) w *= 1.3;
        if (intents.has('tranquilo') && ['cuerpo', 'presion', 'mordisco'].includes(b.family)) w *= 0.5;
        return w * scoreMul(S.blueprintScore, b.id);
      },
      /* factor «quizá» de una combinación completa (acción, zona, condición): también pesa al elegir entre candidatos */
      maybe: (a, z, c) => maybeAction(a) * (maybe.has('intimo') && z.tags.includes('intimo') ? MAYBE : 1) * (c && [...maybe].some(k => AVOIDS[k].condFamilies && AVOIDS[k].condFamilies.includes(c.family)) ? MAYBE : 1),
      action: a => {
        let w = (P.fam[a.family] || 1) * (P.pattern[a.pattern] || 1) * maybeAction(a);
        if (purpose === 'DEEPEN' && lastA) w *= a.family === lastA.family ? 5 : a.actor === lastA.actor ? 2 : 0.45;
        if (purpose === 'EXPLORE') w *= 1 / (1 + 0.5 * (famCount[a.family] || 0)); // lo que menos ha salido
        if ((purpose === 'MAINTAIN' || purpose === 'VARIATION') && lastA && a.family === lastA.family) w *= 0.3;
        if (purpose === 'VARIATION' && lastA && a.pattern === lastA.pattern) w *= 0.6;
        if (intents.has('jugar') && (a.concepts.includes('juego') || ['dibujar', 'tamborilear', 'soplar', 'trazarNombre', 'mordisquear', 'besitos'].includes(a.id))) w *= 1.6;
        if (intents.has('cerca') && a.pattern === 'MUTUAL') w *= 1.4;
        if (intents.has('cuidar') && ['masaje', 'abrazo', 'cabello'].includes(a.family)) w *= 1.6;
        if (intents.has('curiosidad') && a.pattern === 'DISCOVER') w *= 1.4;
        return w * scoreMul(F, a.family) * scoreMul(S.actorScore, a.actor, 1.15);
      },
      zone: (z, a) => {
        let w = 1;
        if (purpose === 'DEEPEN' && lastZ) w *= z.family === lastZ.family ? 4 : z.group === lastZ.group ? 1.6 : 0.6;
        if ((purpose === 'MAINTAIN' || purpose === 'VARIATION') && lastZ && z.family === lastZ.family) w *= 0.4;
        if (maybe.has('intimo') && z.tags.includes('intimo')) w *= MAYBE;
        if (purpose === 'EXPLORE') { const seen = history.rounds.filter(r => r.families && r.families.zone === z.family).length; w *= 1 / (1 + 0.4 * seen); }
        return w * scoreMul(Zs, z.family) * scoreMul(Sem, `${a.family}·${z.family}`, 1.4);
      },
      method: m => {
        let w = 1;
        if (m.dim === 'presion') w *= m.mod > 0 ? 1 + 0.8 * S.pressure : 1 - 0.8 * S.pressure;
        if (m.dim === 'ritmo' || m.dim === 'dinamica') w *= m.mod > 0.3 ? 1 + 0.8 * S.pace : 1 - 0.5 * S.pace;
        if (intents.has('tranquilo')) w *= m.concepts.includes('lento') || m.id === 'pausado' ? 1.6 : m.concepts.includes('variable') ? 0.5 : 1;
        if (purpose === 'COOLDOWN') w *= m.mod <= 0 ? 1.5 : 0.6;
        return Math.max(0.05, w);
      },
      cond: c => {
        let w = P.condRole[c.role] || 1;
        if ([...maybe].some(k => AVOIDS[k].condFamilies && AVOIDS[k].condFamilies.includes(c.family))) w *= MAYBE;
        if (intents.has('cuidar') && ['GUIDE', 'CHOOSE'].includes(c.pattern)) w *= 1.5;
        if (intents.has('cerca') && c.family === 'vista' && c.id === 'mirandose') w *= 1.4;
        if (intents.has('tranquilo') && c.family === 'pausa') w *= 1.3;
        return w * scoreMul(S.familyScore, 'cond:' + c.family);
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

  /* ---- feedback: ME GUSTA / CAMBIA / PASO (+ MÁS / MENOS) ---- */
  feedback(S, round, kind, extra = {}) {
    if (!round) return;
    const a = ACTION[round.action], z = ZONE[round.zone];
    const sem = `${a.family}·${z.family}`;
    S.feedback.push({ round: round.n, kind, more: extra.more ?? null });
    S.lastFeedback = { round: round.n, kind };
    if (kind === 'like') {
      S.liked.push(round.id); bump(S.familyScore, a.family, 1); bump(S.zoneScore, z.family, 0.8); bump(S.semanticScore, sem, 0.5); bump(S.actorScore, a.actor, 0.5); bump(S.blueprintScore, round.blueprint, 1);
      if (round.cond) bump(S.familyScore, 'cond:' + round.families.cond, 0.6);
      if (extra.more === true) { if (a.tags.includes('presion') || (round.families.method === 'presion')) S.pressure = Math.min(1, S.pressure + 0.35); else S.pace = Math.min(1, S.pace + 0.35); S.intraLevelIntensity = Math.min(1, S.intraLevelIntensity + 0.3); }
      if (extra.more === false) { if (a.tags.includes('presion') || (round.families.method === 'presion')) S.pressure = Math.max(-1, S.pressure - 0.35); else S.pace = Math.max(-1, S.pace - 0.35); S.intraLevelIntensity = Math.max(-1, S.intraLevelIntensity - 0.3); }
    } else if (kind === 'cambia') {
      S.changed.push(round.id); bump(S.semanticScore, sem, -1.2); bump(S.familyScore, a.family, -0.3); bump(S.blueprintScore, round.blueprint, -1);
      if (round.cond) bump(S.familyScore, 'cond:' + round.families.cond, -0.5);
    } else if (kind === 'paso') { // «esta no, ahora»: no se infiere una preferencia íntima de un solo evento
      S.skipped.push(round.id); bump(S.familyScore, a.family, -0.5); bump(S.semanticScore, sem, -1.5); bump(S.blueprintScore, round.blueprint, -0.6);
      if (round.cond) bump(S.familyScore, 'cond:' + round.families.cond, -0.6);
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
