/* GameEngine · cartas dinámicas curadas. CARTA CURADA → VARIANTES APROBADAS → COMPATIBILIDAD DE SESIÓN → SELECCIÓN
   PONDERADA → FRASE → TIEMPO → PANTALLA. El azar elige entre buenas experiencias; la pareja decide la dirección. */
import { CARDS, CARD, TRANSITIONS_BY_LEVEL, regionOf } from '../content/index.js';
import { Rng } from './rng.js';
import { History } from './history.js';
import { PreferenceManager } from './prefs.js';
import { anatomyOf } from './anatomy.js';
import { DEFAULT_CLOTHING, normalizeClothing, applyRemoval, removableGarments, applicableGarments, band } from './clothing.js';
import { SessionState, SessionDirector, MOODS, AVOIDS } from './session.js';
import { buildDeck, weighDeck, pickVariant, pickSide, pickConstraint } from './deck.js';
import { realize } from './realizer.js';
import { pickDuration } from './duration.js';
import { LEVELS, LEVEL_BY_KEY } from './levels.js';

export class GameEngine {
  constructor({ prefs, seed, level, debug = false } = {}) {
    this.rng = new Rng(seed);
    this.prefs = prefs instanceof PreferenceManager ? prefs : new PreferenceManager(prefs);
    this.history = new History();
    this.director = new SessionDirector(this.rng);
    this.session = new SessionState(level || LEVEL_BY_KEY[this.prefs.mode] || 1);
    this.clothing = [DEFAULT_CLOTHING(this.anatomy(0).declared), DEFAULT_CLOTHING(this.anatomy(1).declared)];
    this.applicable = [applicableGarments(this.anatomy(0).declared), applicableGarments(this.anatomy(1).declared)];
    this.unlocked = new Map(); // cartas recién desbloqueadas por un cambio de ropa → ronda en la que expira su empujón
    this.state = { round: 0, actor: 0, favorites: [] };
    this.stats = { emptyDecks: [], rejectedReasons: {} };
    this.debug = debug; this.lastDebug = null;
  }

  /* ---------- sesión ---------- */
  level() { return this.session.level; }
  levelInfo() { return LEVELS[this.session.level]; }
  setLevel(level) { this.director.setLevel(this.session, level); return this.session.level === Number(level); }
  setIntents(player, list) { this.session.intents[player] = [...new Set(list.filter(k => MOODS[k]))]; }
  setPrefs(player, map) { const out = {}; for (const k in map) if (AVOIDS[k] && (map[k] === 'quiza' || map[k] === 'no')) out[k] = map[k]; this.session.pref[player] = out; }
  newSession(level) { this.history.reset(); this.state.round = 0; this.state.actor = 0; this.session = new SessionState(level || this.session.level); this.clothing = [DEFAULT_CLOTHING(this.anatomy(0).declared), DEFAULT_CLOTHING(this.anatomy(1).declared)]; this.unlocked = new Map(); this.stats = { emptyDecks: [], rejectedReasons: {} }; }
  ended() { return this.session.ended; }
  feedback(kind) { this.director.feedback(this.session, this.history.last(), kind); }
  endSession(how) { return this.director.end(this.session, how); }
  /* pausa de continuidad en Intimidad: ni consentimiento ni cambio de nivel; seguir conserva TODO el estado */
  pauseDue() { return !this.session.ended && this.director.pauseDue(this.session); }
  continueGuided() { this.director.continueGuided(this.session); }
  continueAlone() { return this.endSession('solos'); }

  /* ---------- anatomía y ropa ---------- */
  anatomy(player) { const sig = JSON.stringify(this.prefs.bodyParts[player] || []); this._an ||= [null, null]; if (!this._an[player] || this._an[player].sig !== sig) this._an[player] = { sig, value: anatomyOf(player, this.prefs.bodyParts) }; return this._an[player].value; }
  /* las prendas que aplican dependen de la anatomía declarada; un estado antiguo (`underwear`) se traduce a la prenda real */
  /* la anatomía puede cambiar después de crear el motor (ajustes): una prenda que ACABA de volverse aplicable empieza puesta;
     «No la llevo» solo sobrevive cuando la prenda ya aplicaba antes (lo eligió la pareja) */
  syncClothing() {
    this.applicable = this.applicable || [null, null];
    for (const p of [0, 1]) {
      const now = applicableGarments(this.anatomy(p).declared), was = this.applicable[p];
      const s = { ...this.clothing[p] }; if (was) for (const g of now) if (!was.includes(g)) s[g] = 'ON';
      this.clothing[p] = normalizeClothing(s, this.anatomy(p).declared); this.applicable[p] = now;
    }
  }
  garments(player) { return applicableGarments(this.anatomy(player).declared); }
  setClothing(player, state) { const before = this.eligibleIds(); this.clothing[player] = normalizeClothing(state, this.anatomy(player).declared); this.history.recordClothingChange({ player, state: { ...this.clothing[player] }, manual: true, round: this.state.round }); this.markUnlocked(before); }
  eligibleIds() { this.syncClothing(); const out = new Set(); for (const a of [0, 1]) for (const e of buildDeck(CARDS, this.context(a)).eligible) out.add(e.card.id); return out; }
  /* NEWLY UNLOCKED: lo que un cambio de ropa acaba de hacer posible recibe un pequeño empujón durante 3 cartas; después compite igual */
  markUnlocked(before) { for (const id of this.eligibleIds()) if (!before.has(id)) this.unlocked.set(id, this.state.round + 3); }
  /* lo que realmente pasó en una carta UNDRESS: actualiza el estado al momento */
  recordUndress(player, garment) {
    this.syncClothing();
    if (!removableGarments(this.clothing[player]).includes(garment)) return false;
    const before = this.eligibleIds();
    this.clothing[player] = applyRemoval(this.clothing[player], garment);
    this.markUnlocked(before);
    this.history.recordClothingChange({ player, garment, round: this.state.round });
    const last = this.history.last(); if (last && last.undress) last.undress.applied = true;
    return true;
  }
  removable(player) { this.syncClothing(); return removableGarments(this.clothing[player]); }
  clothingBand() { return band(this.clothing[0], this.clothing[1]); }

  /* ---------- API de rondas ---------- */
  nextActor() {
    if (this.state.round === 0) return this.state.actor;
    const rec = this.history.recentActors;
    if (rec[0] === rec[1] && rec[0] === this.state.actor) return 1 - this.state.actor; // nunca tres seguidas
    return this.rng.chance(0.72) ? 1 - this.state.actor : this.state.actor; // alternancia razonable, no 50/50 estricto
  }
  roll() { if (this.session.ended) return null; const actor = this.nextActor(); return this.round(this.generate({ actor }), { actor }); }
  pass() { const last = this.history.last(); if (last && !last.passed) { last.passed = true; this.feedback('paso'); } return this.roll(); }
  reroll() {
    if (this.session.ended) return null;
    const last = this.history.last(); if (last) this.feedback('cambia');
    const actor = last ? last.actor : this.state.actor;
    return this.round(this.generate({ actor, purpose: 'VARIATION', avoidIds: last ? [last.cardId] : [] }), { actor });
  }
  softer() { if (this.session.ended) return null; this.director.softer(this.session); const last = this.history.last(); const actor = last ? last.actor : this.state.actor; return this.round(this.generate({ actor, purpose: 'SOFTEN', avoidIds: last ? [last.cardId] : [] }), { actor }); }
  /* repetir una de «Lo nuestro» conserva quién la hacía a quién; tiene que caber ahora (anatomía, ropa, nivel) */
  repeatFavorite(fav) {
    if (this.session.ended || !fav || !fav.cardId || !CARD[fav.cardId]) return null;
    const card = CARD[fav.cardId]; if (card.level !== this.session.level) return null;
    let actor = (this.prefs.names || []).indexOf(fav.actorName); if (actor < 0) actor = fav.actor ?? this.state.actor;
    const ctx = this.context(actor);
    const deck = buildDeck([card], ctx);
    if (!deck.eligible.length) return null;
    const e = deck.eligible[0];
    const variant = e.variants ? (e.variants.find(v => v.id === fav.variantId) || pickVariant(e, this.history, this.rng)) : null;
    const side = card.allowedSides ? (card.allowedSides.includes(fav.side) ? fav.side : pickSide(card, variant, this.history, this.rng)) : null;
    const playConstraint = card.playConstraints ? (card.playConstraints.includes(fav.playConstraint) ? fav.playConstraint : 'FREE') : null;
    const sel = this.compose(card, { variant, side, playConstraint, actor, seconds: fav.seconds, purpose: 'MAINTAIN' });
    return sel ? this.round(sel, { actor, fromFavorite: true }) : null;
  }
  inspireFavorite(fav) { if (this.session.ended || !fav) return null; const actor = this.nextActor(); const fam = fav.cardId && CARD[fav.cardId] ? CARD[fav.cardId].family : fav.family || null; return this.round(this.generate({ actor, purpose: 'DEEPEN', favorFamily: fam, avoidIds: fav.cardId ? [fav.cardId] : [] }), { actor, inspired: true }); }
  addFavorite(r) { if (!this.state.favorites.some(f => f.id === r.id)) this.state.favorites.push(r); }
  removeFavorite(id) { this.state.favorites = this.state.favorites.filter(f => f.id !== id); }

  /* ---------- contexto de compatibilidad para una dirección actor → receptor ---------- */
  context(actor) {
    this.syncClothing();
    const receiver = 1 - actor;
    return { level: this.session.level, actor: this.anatomy(actor), receiver: this.anatomy(receiver), actorClothing: this.clothing[actor], receiverClothing: this.clothing[receiver], session: this.session, actorId: actor, receiverId: receiver };
  }
  deck(actor = this.state.actor) { return buildDeck(CARDS, this.context(actor)); }

  /* ---------- generación: filtrar → ponderar → elegir → variante → lado → limitación → tiempo → frase ---------- */
  generate({ actor, purpose = null, avoidIds = [], favorFamily = null }) {
    const S = this.session, H = this.history;
    const P = purpose ? { purpose, reason: 'pedido por la interfaz' } : this.director.purpose(S, H);
    purpose = P.purpose === 'END' ? 'MAINTAIN' : P.purpose;
    const ctx = { ...this.context(actor), avoidIds };
    const deck = buildDeck(CARDS, ctx);
    for (const r of deck.rejected) { const k = r.reason.split(':')[0]; this.stats.rejectedReasons[k] = (this.stats.rejectedReasons[k] || 0) + 1; }
    let weighted = weighDeck(deck, { history: H, session: S, director: this.director, purpose, favorFamily, unlocked: this.unlocked, round: this.state.round, actor, clothing: this.clothing });
    if (!weighted.some(w => w.weight > 0) && weighted.length) weighted = weighted.map(w => ({ ...w, weight: 1 })); // todo pesa cero: azar plano entre lo elegible
    const dbg = { purpose, reason: P.reason, actor, level: S.level, band: S.level === 3 ? this.clothingBand() : null, candidates: weighted.map(w => ({ id: w.card.id, weight: Math.round(w.weight * 1000) / 1000, factors: Object.fromEntries(Object.entries(w.factors).map(([k, v]) => [k, Math.round(v * 100) / 100])) })), rejected: deck.rejected, winner: null, variant: null, side: null, playConstraint: null, seconds: null, fallback: false };
    let sel = null;
    if (weighted.length) {
      const e = this.rng.weighted(weighted.map(w => ({ item: w, weight: w.weight })));
      const variant = pickVariant(e, H, this.rng);
      const side = pickSide(e.card, variant, H, this.rng);
      const playConstraint = pickConstraint(e.card, H, this.rng);
      sel = this.compose(e.card, { variant, side, playConstraint, actor, purpose });
    }
    if (!sel) { // mazo vacío (§69): nunca bloquea, nunca relaja nada; transición neutra y aviso para el diseñador
      this.stats.emptyDecks.push({ round: this.state.round + 1, level: S.level, actor, clothing: [{ ...this.clothing[0] }, { ...this.clothing[1] }], anatomy: [this.anatomy(0).declared, this.anatomy(1).declared], rejected: deck.rejected.map(r => `${r.id}:${r.reason}`) });
      sel = this.compose(TRANSITIONS_BY_LEVEL[S.level], { variant: null, side: null, playConstraint: null, actor, purpose: 'MAINTAIN' });
      sel.transition = true; dbg.fallback = true;
    }
    Object.assign(dbg, { winner: sel.card.id, variant: sel.variant && sel.variant.id, side: sel.side, playConstraint: sel.playConstraint, seconds: sel.seconds });
    this.lastDebug = dbg; sel.debug = dbg;
    return sel;
  }
  compose(card, { variant, side, playConstraint, actor, seconds = null, purpose }) {
    const names = { actor: this.prefs.names[actor] || `Jugador ${actor + 1}`, receiver: this.prefs.names[1 - actor] || `Jugador ${2 - actor}` };
    const r = realize(card, { variant, side, playConstraint, names, rng: this.rng, recentCopy: this.history.rounds.slice(0, 10).map(x => x.copyId) });
    if (!r) return null;
    return { card, variant, side, playConstraint, actor, purpose, text: r.text, copyId: r.copyId, seconds: seconds ?? pickDuration(card, this.rng), note: card.note };
  }

  /* ---------- cierre de la ronda ---------- */
  round(sel, opts = {}) {
    if (!sel) return null;
    const actor = sel.actor, receiver = 1 - actor, names = this.prefs.names || ['', ''];
    this.state.actor = actor;
    const c = sel.card, level = this.session.level;
    const parts = ((sel.variant && sel.variant.receiverRequirements) || c.receiverRequirements).map(r => r.part);
    const undress = c.interactionType === 'UNDRESS' ? { players: c.undress.who === 'BOTH' ? [actor, receiver] : [c.undress.who === 'ACTOR' ? actor : receiver], garment: c.undress.garment, chooser: c.undress.chooser === 'ACTOR' ? actor : c.undress.chooser === 'RECEIVER' ? receiver : null, applied: false } : null;
    const round = {
      id: `${Date.now().toString(36)}-${Math.floor(this.rng.next() * 1e6).toString(36)}`,
      n: ++this.state.round, level, levelName: LEVELS[level].name,
      cardId: c.id, family: c.family, interactionType: c.interactionType, region: regionOf(c, sel.variant), variantId: sel.variant ? sel.variant.id : null, side: sel.side, parts, playConstraint: sel.playConstraint,
      seconds: sel.seconds, timerMode: c.timerMode, phrase: sel.text, note: sel.note, copyId: sel.copyId, choices: c.choices, undress, transition: !!sel.transition,
      actor, receiver, actorName: names[actor] || `Jugador ${actor + 1}`, receiverName: names[receiver] || `Jugador ${receiver + 1}`, mutual: ['MUTUAL', 'BODY_TO_BODY'].includes(c.interactionType) && c.interactionType !== 'UNDRESS',
      purpose: sel.purpose || 'MAINTAIN', fromFavorite: !!opts.fromFavorite, inspired: !!opts.inspired,
    };
    this.history.push(round);
    this.director.afterRound(this.session, round);
    return round;
  }
}
/* favorita guardada con un modelo anterior: se conserva como recuerdo (frase) aunque ya no se pueda repetir */
export function migrateFavorite(fav) { if (!fav) return null; if (fav.cardId) return fav; return { ...fav, cardId: null, legacy: true }; }
export { PreferenceManager, History, SessionState, SessionDirector, MOODS, AVOIDS, LEVELS };
