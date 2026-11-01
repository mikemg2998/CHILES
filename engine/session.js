/* SESSION DIRECTOR. La sesión no es una lista de tiradas: tiene un propósito en cada ronda, aprende del feedback
   de la pareja y decide cuándo ofrecer una puerta. La intensidad respira; el nivel solo cambia cuando los dos
   lo deciden en privado. Todo este estado vive en memoria: nunca se guarda ni se envía a ningún sitio. */
import { LEVELS, ACTION, ZONE } from './catalog.js';
import { TARGET_BUCKETS } from './intensity.js';

export const PURPOSES = ['CONNECT', 'BUILD', 'EXPLORE', 'DEEPEN', 'MAINTAIN', 'COOLDOWN', 'END'];
export const PURPOSE_LABEL = { CONNECT: 'Conectar', BUILD: 'Construir', EXPLORE: 'Explorar', DEEPEN: 'Profundizar', MAINTAIN: 'Mantener', COOLDOWN: 'Bajar el ritmo', END: 'Cerrar' };

/* "Esta noche quiero…" (intención ligera, por jugador). Se usa la intersección de los dos; si está vacía, la unión. */
export const INTENTS = {
  cerca: { label: 'Sentirme cerca' },
  desconectar: { label: 'Desconectar' },
  jugar: { label: 'Jugar' },
  despacio: { label: 'Ir despacio' },
  sorprender: { label: 'Sorprenderme' },
  llevar: { label: 'Dejarme llevar' },
};
/* "Hoy no…" (configuración discreta). El no de cualquiera de los dos vale para la sesión entera. */
export const AVOIDS = {
  boca: { label: 'Nada con la boca', contact: ['boca'] },
  presion: { label: 'Nada de presión ni mordiscos', actionTags: ['presion'], families: ['mordisco'] },
  ropa: { label: 'La ropa se queda donde está', actionTags: ['ropa'] },
  vista: { label: 'Sin vendas ni ojos cerrados', condFamilies: ['vista'] },
  voz: { label: 'Sin hablar en voz alta', condFamilies: ['voz'], actionTags: ['voz'] },
  intimo: { label: 'Sin anatomía íntima', groups: ['intimaF', 'intimaM'] },
};
/* opciones de la puerta, de menor a mayor. El resultado es la menor de las dos; nunca se dice quién eligió qué. */
export const GATE_OPTIONS = ['PARAR', 'QUEDARNOS', 'SEGUIR', 'SUBIR'];
export const GATE_LABEL = { PARAR: 'Parar', QUEDARNOS: 'Quedarnos aquí', SEGUIR: 'Seguir', SUBIR: 'Subir', SOLOS: 'Seguir sin el juego' };

export class SessionState {
  constructor(level = 1) {
    this.level = level; this.startLevel = level;
    this.intents = [[], []]; this.avoid = [[], []];
    this.rounds = 0; this.roundsInLevel = 0; this.sinceGate = 0; this.gatesOffered = 0;
    this.intensityHistory = []; this.purposes = [];
    this.feedback = []; // {round, kind, more}
    this.liked = []; this.changed = []; this.skipped = [];
    this.familyScore = {}; this.zoneScore = {}; this.semanticScore = {}; this.actorScore = {};
    this.pressure = 0; this.pace = 0; // -1 … 1 preferencias aprendidas (MÁS / MENOS)
    this.lastFeedback = null; this.deepenStreak = 0; this.stayHere = false;
    this.gate = null; this.gateResults = []; this.ended = null; this.lastMessage = null;
  }
  intentSet() {
    const [a, b] = this.intents; if (!a.length) return new Set(b); if (!b.length) return new Set(a);
    const inter = a.filter(x => b.includes(x)); return new Set(inter.length ? inter : [...a, ...b]);
  }
  avoidSet() { return new Set([...this.avoid[0], ...this.avoid[1]]); }
  readiness() { // -1 … 1: cuánto está funcionando el nivel actual
    const n = Math.max(1, this.roundsInLevel); let s = 0;
    for (const f of this.feedback.slice(-n)) s += f.kind === 'like' ? 1 : f.kind === 'paso' ? -1 : -0.3;
    return Math.max(-1, Math.min(1, s / n));
  }
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
      if (fb.kind === 'cambia') return { purpose: 'EXPLORE', reason: 'cambia: otra familia' };
      if (fb.kind === 'paso') return { purpose: 'MAINTAIN', reason: 'paso: se descarta sin castigo' };
    }
    if (S.roundsInLevel < 2) return { purpose: S.level === 1 ? 'CONNECT' : 'BUILD', reason: 'primeras rondas del nivel' };
    const rec = S.intensityHistory;
    const peak = rec.length && rec[0] >= L.max - 0.6;
    const rising = rec.length >= 2 && rec[0] > rec[1] + 0.3;
    if ((peak || (rising && rec.length >= 3 && rec[1] > rec[2] + 0.3)) && this.rng.chance(0.7)) return { purpose: 'COOLDOWN', reason: 'después de un pico, descanso' };
    const intents = S.intentSet();
    const w = { BUILD: 0.4, EXPLORE: 0.3, MAINTAIN: 0.2, COOLDOWN: 0.1, CONNECT: S.level === 1 ? 0.3 : 0 };
    if (S.stayHere) { w.MAINTAIN *= 2; w.BUILD *= 0.5; }
    if (intents.has('despacio')) { w.BUILD *= 0.6; w.COOLDOWN *= 1.8; w.MAINTAIN *= 1.4; }
    if (intents.has('sorprender')) { w.EXPLORE *= 1.8; }
    if (intents.has('cerca')) { w.CONNECT *= 2; w.COOLDOWN *= 1.3; }
    if (intents.has('desconectar')) { w.COOLDOWN *= 1.6; w.CONNECT *= 1.6; }
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
      case 'MAINTAIN': t = li != null ? li + (this.rng.next() - 0.5) * 0.8 : pick(); break;
      default: t = pick();
    }
    if (S.stayHere) t = Math.min(t, L.lo + (L.max - L.lo) * 0.7);
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
      COOLDOWN: { fam: { masaje: 1.6, abrazo: 1.6, caricia: 1.3, presion: 0.4, mordisco: 0.3, bocaIntima: 0.6, manoIntima: 0.6 }, pattern: { MUTUAL: 1.3 }, condRole: { conexion: 1.3, interaccion: 0.6 } },
      END: { fam: {}, pattern: {}, condRole: {} },
    }[purpose] || { fam: {}, pattern: {}, condRole: {} };
    const F = S.familyScore, Zs = S.zoneScore, Sem = S.semanticScore;
    return {
      purpose,
      action: a => {
        let w = (P.fam[a.family] || 1) * (P.pattern[a.pattern] || 1);
        if (purpose === 'DEEPEN' && lastA) w *= a.family === lastA.family ? 5 : a.actor === lastA.actor ? 2 : 0.45;
        if (purpose === 'EXPLORE') w *= 1 / (1 + 0.5 * (famCount[a.family] || 0)); // lo que menos ha salido
        if (purpose === 'MAINTAIN' && lastA && a.family === lastA.family) w *= 0.4;
        if (intents.has('jugar') && (a.concepts.includes('juego') || ['dibujar', 'tamborilear', 'soplar', 'trazarNombre', 'mordisquear', 'besitos'].includes(a.id))) w *= 1.6;
        if (intents.has('cerca') && a.pattern === 'MUTUAL') w *= 1.4;
        if (intents.has('desconectar') && ['masaje', 'abrazo'].includes(a.family)) w *= 1.5;
        if (intents.has('llevar') && a.tags.includes('presion')) w *= 1.3;
        return w * scoreMul(F, a.family) * scoreMul(S.actorScore, a.actor, 1.15);
      },
      zone: (z, a) => {
        let w = 1;
        if (purpose === 'DEEPEN' && lastZ) w *= z.family === lastZ.family ? 4 : z.group === lastZ.group ? 1.6 : 0.6;
        if (purpose === 'MAINTAIN' && lastZ && z.family === lastZ.family) w *= 0.4;
        if (purpose === 'EXPLORE') { const seen = history.rounds.filter(r => r.families && r.families.zone === z.family).length; w *= 1 / (1 + 0.4 * seen); }
        return w * scoreMul(Zs, z.family) * scoreMul(Sem, `${a.family}·${z.family}`, 1.4);
      },
      method: m => {
        let w = 1;
        if (m.dim === 'presion') w *= m.mod > 0 ? 1 + 0.8 * S.pressure : 1 - 0.8 * S.pressure;
        if (m.dim === 'ritmo' || m.dim === 'dinamica') w *= m.mod > 0.3 ? 1 + 0.8 * S.pace : 1 - 0.5 * S.pace;
        if (intents.has('despacio')) w *= m.concepts.includes('lento') || m.id === 'pausado' ? 1.6 : m.concepts.includes('variable') ? 0.5 : 1;
        if (purpose === 'COOLDOWN') w *= m.mod <= 0 ? 1.5 : 0.6;
        return Math.max(0.05, w);
      },
      cond: c => {
        let w = P.condRole[c.role] || 1;
        if (intents.has('llevar') && ['GUIDE', 'CHOOSE'].includes(c.pattern)) w *= 1.6;
        if (intents.has('cerca') && c.family === 'vista' && c.id === 'mirandose') w *= 1.4;
        if (intents.has('despacio') && c.family === 'pausa') w *= 1.3;
        return w * scoreMul(S.familyScore, 'cond:' + c.family);
      },
    };
  }

  /* ---- ronda registrada ---- */
  afterRound(S, round) {
    S.rounds++; S.roundsInLevel++; S.sinceGate++;
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
      S.liked.push(round.id); bump(S.familyScore, a.family, 1); bump(S.zoneScore, z.family, 0.8); bump(S.semanticScore, sem, 0.5); bump(S.actorScore, a.actor, 0.5);
      if (round.cond) bump(S.familyScore, 'cond:' + round.families.cond, 0.6);
      if (extra.more === true) { if (a.tags.includes('presion') || (round.families.method === 'presion')) S.pressure = Math.min(1, S.pressure + 0.35); else S.pace = Math.min(1, S.pace + 0.35); }
      if (extra.more === false) { if (a.tags.includes('presion') || (round.families.method === 'presion')) S.pressure = Math.max(-1, S.pressure - 0.35); else S.pace = Math.max(-1, S.pace - 0.35); }
    } else if (kind === 'cambia') {
      S.changed.push(round.id); bump(S.semanticScore, sem, -1.2); bump(S.familyScore, a.family, -0.3);
      if (round.cond) bump(S.familyScore, 'cond:' + round.families.cond, -0.5);
    } else if (kind === 'paso') {
      S.skipped.push(round.id); bump(S.familyScore, a.family, -1.5); bump(S.semanticScore, sem, -2.5); bump(S.zoneScore, z.family, -0.5);
      if (round.cond) bump(S.familyScore, 'cond:' + round.families.cond, -1);
    }
  }

  /* ---- puertas ---- */
  gateDue(S) {
    if (S.ended || S.gate) return false;
    const r = S.readiness();
    const every = r > 0.4 ? 3 : r < -0.3 ? 6 : 4;
    return S.roundsInLevel >= every && S.sinceGate >= every;
  }
  canOpenGate(S) { return !S.ended && !S.gate && S.rounds >= 1; }
  openGate(S) {
    const options = GATE_OPTIONS.slice(0, 3);
    options.push(S.level < 4 ? 'SUBIR' : 'SOLOS');
    S.gate = { options, votes: [null, null] };
    S.gatesOffered++;
    return S.gate;
  }
  vote(S, player, choice) {
    if (!S.gate || !S.gate.options.includes(choice)) return null;
    S.gate.votes[player] = choice;
    return S.gate.votes.every(v => v) ? this.resolveGate(S) : null;
  }
  /* regla del mínimo común: PARAR < QUEDARNOS < SEGUIR < SUBIR/SOLOS. El mensaje habla siempre en plural. */
  resolveGate(S) {
    const g = S.gate; if (!g) return null;
    const rank = v => g.options.indexOf(v);
    const result = g.votes.reduce((m, v) => rank(v) < rank(m) ? v : m, g.votes[0]);
    S.gate = null; S.sinceGate = 0; S.gateResults.push(result);
    let message, levelChange = 0;
    switch (result) {
      case 'PARAR': S.ended = 'parar'; message = 'Hasta aquí estuvo bien.'; break;
      case 'QUEDARNOS': S.stayHere = true; message = 'Nos quedamos aquí.'; break;
      case 'SEGUIR': S.stayHere = false; message = 'Seguimos.'; break;
      case 'SUBIR': S.level = Math.min(4, S.level + 1); S.roundsInLevel = 0; S.stayHere = false; levelChange = 1; message = `Subimos a ${LEVELS[S.level].name}.`; break;
      case 'SOLOS': S.ended = 'solos'; message = 'A partir de aquí, vosotros decidís.'; break;
    }
    S.lastMessage = message;
    return { result, message, levelChange, level: S.level, ended: S.ended };
  }
  /* bajar siempre se puede, sin puerta */
  lower(S) { if (S.level > 1) { S.level--; S.roundsInLevel = 0; S.stayHere = false; S.lastMessage = `Bajamos a ${LEVELS[S.level].name}.`; return S.lastMessage; } return null; }
  end(S, how = 'parar') { S.ended = how; S.lastMessage = how === 'solos' ? 'A partir de aquí, vosotros decidís.' : 'Hasta aquí estuvo bien.'; return S.lastMessage; }
}
