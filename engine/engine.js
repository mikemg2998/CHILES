/* GameEngine v3: el Session Director decide qué pretende la ronda; el motor de generación propone candidatos
   compatibles; el filtro de calidad puntúa y descarta; el compositor escribe la frase; los dados solo la representan.
   Orden de prioridad: compatibilidad > calidad > progresión > variedad. */
import { ACTIONS, ACTION, ZONES, ZONE, METHODS, METHOD, CONDITIONS, CONDITION, LEVELS, LEVEL_BY_KEY, INTENSITY_LABEL, GROUPS } from './catalog.js';
import { Rng } from './rng.js';
import { CompatibilityEngine as CE, CombinationValidator } from './compat.js';
import { combinationIntensity, pairIntensity } from './intensity.js';
import { HistoryManager } from './history.js';
import { PreferenceManager } from './prefs.js';
import { NaturalLanguageGenerator as NLG } from './nlg.js';
import { interactionMeta } from './meta.js';
import { SessionState, SessionDirector, AVOIDS, MOODS } from './session.js';
import { criticalCheck, qualityScore, fallbackFor, THRESHOLD } from './quality.js';
import { mechanicsCheck } from './body.js';
import { BLUEPRINTS, BLUEPRINT, BLUEPRINTS_OF_ACTION, blueprintZones, blueprintAllowsCondition, blueprintFor } from './blueprints.js';

const near = (v, t, k = 1) => Math.exp(-k * Math.abs(v - t));
const COOL = { action: 3, zone: 4, method: 2, cond: 5 };
const FAM_COOL = { action: 1, zone: 2, cond: 2 };
/* probabilidad de que la ronda intente llevar forma y de que pruebe una condición; la condición solo se queda si la frase mejora */
const DENSITY = { 1: { method: .6, cond: .35 }, 2: { method: .65, cond: .6 }, 3: { method: .6, cond: .7 }, 4: { method: .6, cond: .7 } };
const MAX_ATTEMPTS = 34, MAX_CANDIDATES = 6;
/* un añadido (forma, condición) solo se queda si mejora la frase al menos esto respecto a la misma frase sin él */
const MARGIN = { form: 0.015, cond: 0.01 };

export class GameEngine {
  constructor({ prefs, seed, level, debug = false } = {}) {
    this.rng = new Rng(seed);
    this.prefs = prefs instanceof PreferenceManager ? prefs : new PreferenceManager(prefs);
    this.history = new HistoryManager();
    this.director = new SessionDirector(this.rng);
    this.session = new SessionState(level || LEVEL_BY_KEY[this.prefs.mode] || 1);
    this.state = { round: 0, performer: 0, favorites: [] };
    this.stats = { rejected: 0, rejectedReasons: {}, fallbacks: 0 };
    this.debug = debug; this.lastDebug = null;
  }

  /* ---------- sesión ---------- */
  level() { return this.session.level; }
  levelInfo() { return LEVELS[this.session.level]; }
  /* el nivel lo decide la pareja, en cualquier dirección y en cualquier momento; el motor nunca lo cambia solo */
  setLevel(level) { this.director.setLevel(this.session, level); return this.session.level === Math.max(1, Math.min(4, Number(level) || 1)); }
  setIntents(player, list) { this.session.intents[player] = [...new Set(list.filter(k => MOODS[k]))]; }
  /* preferencias de sesión: {clave: 'si' | 'quiza' | 'no'} */
  setPrefs(player, map) { const out = {}; for (const k in map) if (AVOIDS[k] && (map[k] === 'quiza' || map[k] === 'no')) out[k] = map[k]; this.session.pref[player] = out; }
  setAvoid(player, list) { const m = { ...this.session.pref[player] }; for (const k in m) if (m[k] === 'no') delete m[k]; for (const k of list) if (AVOIDS[k]) m[k] = 'no'; this.session.pref[player] = m; }
  newSession(level) { this.history.reset(); this.state.round = 0; this.state.performer = 0; this.session = new SessionState(level || this.session.level); this.stats = { rejected: 0, rejectedReasons: {}, fallbacks: 0 }; }
  ended() { return this.session.ended; }
  feedback(kind, extra) { this.director.feedback(this.session, this.history.last(), kind, extra); }
  endSession(how) { return this.director.end(this.session, how); }

  /* ---------- API de rondas ---------- */
  aim(advance) { const next = advance && this.state.round > 0 ? 1 - this.state.performer : this.state.performer; this.prefs.partner = 1 - next; }
  roll() { if (this.session.ended) return null; this.aim(true); return this.round(this.generate({}), { advanceTurn: true }); }
  /* PASAR: se descarta sin castigo visible y se sigue con otra cosa */
  pass() { const last = this.history.last(); if (last && !last.passed) { last.passed = true; this.feedback('paso'); } return this.roll(); }
  /* OTRA: misma persona, otra propuesta; cuenta como "cambia" */
  reroll() {
    if (this.session.ended) return null;
    this.aim(false);
    const last = this.history.last();
    if (last) this.feedback('cambia');
    const combo = this.generate({ purpose: 'VARIATION', target: last ? last.target : null, avoid: last });
    return this.round(combo, { advanceTurn: false, target: last ? last.target : null });
  }
  /* MÁS SUAVE: la misma idea con menos intensidad, sin cambiar de persona ni de nivel; además baja la intensidad del nivel para lo que venga */
  softer() {
    const last = this.history.last(); if (!last || this.session.ended) return null;
    this.aim(false);
    this.director.softer(this.session);
    const combo = this.getVariant(last);
    if (!combo) return null;
    return this.round(combo, { advanceTurn: false, target: combo.intensity, variant: 'softer' });
  }
  /* repetir una favorita conserva quién la hacía a quién: la anatomía de quien recibe tiene que seguir cuadrando */
  repeatFavorite(fav) {
    if (this.session.ended) return null;
    const names = this.prefs.names || ['', ''];
    let performer = names.indexOf(fav.performerName); if (performer < 0) performer = fav.performer ?? this.state.performer;
    this.prefs.partner = 1 - performer;
    if (!this.prefs.zoneEnabled(ZONE[fav.zone]) || !mechanicsCheck(ACTION[fav.action], ZONE[fav.zone]).ok) return null;
    const advance = performer !== this.state.performer;
    return this.round({ blueprint: fav.blueprint || (blueprintFor(fav.action, fav.zone) || {}).id || null, action: fav.action, zone: fav.zone, method: fav.method, cond: fav.cond, alt: fav.alt }, { advanceTurn: advance, fromFavorite: true });
  }
  inspireFavorite(fav) {
    if (this.session.ended) return null;
    this.aim(true);
    const keep = this.rng.chance(0.5) ? { action: fav.action } : { zone: fav.zone };
    const combo = this.generate({ target: fav.intensity, keep, avoid: fav, purpose: 'DEEPEN' });
    return this.round(combo, { advanceTurn: true, inspired: true });
  }
  addFavorite(r) { if (!this.state.favorites.some(f => f.id === r.id)) this.state.favorites.push(r); }
  removeFavorite(id) { this.state.favorites = this.state.favorites.filter(f => f.id !== id); }
  resetGame() { this.newSession(this.session.level); }

  /* ---------- generación: director → blueprint → acción · zona (biomecánica) → forma/condición solo si aportan → filtro ---------- */
  generate({ target = null, keep = {}, avoid = null, purpose = null }) {
    const prefs = this.prefs, H = this.history, S = this.session, level = S.level;
    const P = purpose ? { purpose, reason: 'pedido por la interfaz' } : this.director.purpose(S, H);
    purpose = P.purpose === 'END' ? 'MAINTAIN' : P.purpose;
    if (target == null) target = this.director.target(purpose, S, H);
    // Intimidad sin anatomía íntima disponible para quien recibe: se juega con la banda y el repertorio de Exploración
    const intimateOk = prefs.enabledGroups.some(g => GROUPS[g].intimate) && (prefs.bodyParts[prefs.partner] || []).length > 0;
    const band = level === 4 && !intimateOk ? 3 : level;
    if (band !== level) target = Math.min(target, 8);
    const mods = this.director.modifiers(purpose, S, H);
    const dbg = { selectedPurpose: purpose, purposeReason: P.reason, selectedPattern: null, selectedBlueprint: null, target, level, intraLevelIntensity: S.intraLevelIntensity, calm: S.calm(), selectedFamily: null, blueprintWeights: {}, candidateWeights: {}, recencyPenalty: {}, diversityBoost: {}, feedbackModifier: {}, intensityModifier: {}, anatomyModifier: {}, rejectedCandidates: [], rejectionReasons: {}, candidates: [], finalQualityScore: null, positionComplexity: null, fallback: false };
    const candidates = [];
    const ctxBase = { prefs, level: band, session: S, avoids: AVOIDS, history: H, target, purpose };
    const D = DENSITY[band];
    for (let attempt = 0; attempt < MAX_ATTEMPTS && candidates.length < MAX_CANDIDATES; attempt++) {
      const relax = candidates.length ? 0 : attempt > 27 ? 2 : attempt > 16 ? 1 : 0; // sin candidatos: primero cae el enfriamiento por familia, después el de elemento
      const bp = this.pickBlueprint(band, target, keep, avoid, relax, mods, dbg);
      if (!bp) continue;
      const action = keep.action ? ACTION[keep.action] : this.pickAction(bp, band, target, avoid, relax, mods, dbg);
      if (!action) continue;
      const zone = keep.zone ? ZONE[keep.zone] : this.pickZone(bp, action, band, target, avoid, relax, mods, dbg);
      if (!zone) continue;
      const req = bp.requires ? CONDITION[bp.requires] : null;
      const mech = mechanicsCheck(action, zone, req);
      if (!mech.ok) { this.reject(`${mech.reasons[0]}: ${action.actor} → ${zone.id}`, dbg, { phrase: `${action.id} · ${zone.id}` }); continue; }
      // forma: solo con una razón (la acción no lleva su manera implícita y hay algo que ajustar o el nivel lo pide)
      const wantMethod = bp.forms !== false && (keep.method !== undefined ? !!keep.method : action.manner !== 'baja' && (Math.abs(S.pressure) > 0.2 || Math.abs(S.pace) > 0.2 || this.rng.chance(D.method)));
      const method = wantMethod ? this.pickMethod(action, zone, band, target, avoid, relax, mods) : null;
      // condición: primero una razón de contexto, después una compatible dentro del blueprint; la ausencia es un buen resultado
      const want = req ? { tiers: ['SETUP'], only: req.id } : this.conditionReason(bp, purpose, S, H, band);
      const cond = want ? this.pickCondition(bp, want, action, zone, method, band, target, avoid, relax, mods) : null;
      if (req && (!cond || cond.id !== req.id)) { this.reject(`SETUP_CONDITION_UNSUPPORTED: ${bp.id} sin ${req.id}`, dbg, { phrase: `${action.id} · ${zone.id}` }); continue; }
      // REMOVE-EACH-COMPONENT: cada añadido solo se queda si la frase mejora de verdad respecto a la misma frase sin él
      const score = v => {
        const chk = criticalCheck(v, ctxBase);
        if (!chk.ok) { this.reject(chk.reasons[0], dbg, v); return null; }
        if (Math.abs(v.intensity - target) > (relax ? 2.2 : 1.4)) { this.reject(`INTENSITY_OFF_TARGET: ${v.intensity} vs ${target}`, dbg, v); return null; }
        const q = qualityScore(v, { ...ctxBase, phrase: v.phrase, dims: v.meta.dims, semanticFamily: v.meta.semanticFamily, mechanics: chk.mechanics });
        v.quality = q.score; v.qualityParts = q.parts; v.mechanics = chk.mechanics;
        return v;
      };
      let best = score(this.build(bp, action, zone, null, req ? cond : null, band, target));
      if (!best) continue;
      if (method) { const v = score(this.build(bp, action, zone, method, req ? cond : null, band, target)); if (v && v.quality >= best.quality + MARGIN.form) best = v; else if (v) this.reject('FORM_NO_VALUE', dbg, v); }
      if (cond && !req) { const v = score(this.build(bp, action, zone, best.method ? method : null, cond, band, target)); if (v && v.quality >= best.quality + MARGIN.cond) best = v; else if (v) this.reject('CONDITION_NO_VALUE', dbg, v); }
      if (best.quality < THRESHOLD) { this.reject(`LOW_QUALITY: ${best.quality}`, dbg, best); continue; }
      candidates.push(best);
    }
    let combo;
    if (candidates.length) {
      combo = this.rng.weighted(candidates.map(c => ({ item: c, weight: Math.exp(8 * c.quality) * (purpose === 'DEEPEN' ? c.qualityParts.continuity ** 2 : 1) * mods.maybe(ACTION[c.action], ZONE[c.zone], c.cond ? CONDITION[c.cond] : null) }))); // calidad manda, con un poco de azar
    } else {
      const f = fallbackFor(band, prefs, H.last() ? H.last().action + ':' + H.last().zone : null, c => criticalCheck({ ...c, phrase: '' }, ctxBase).ok);
      combo = this.build(BLUEPRINT[f.blueprint] || null, ACTION[f.action], ZONE[f.zone], f.method ? METHOD[f.method] : null, null, band, target);
      combo.fallback = true; combo.quality = 0; this.stats.fallbacks++; dbg.fallback = true;
    }
    combo.purpose = purpose; combo.band = band; combo.level = level;
    dbg.candidates = candidates.map(c => ({ phrase: c.phrase, quality: c.quality, blueprint: c.blueprint }));
    dbg.selectedFamily = combo.meta.semanticFamily; dbg.selectedPattern = combo.meta.pattern; dbg.selectedBlueprint = combo.blueprint; dbg.finalQualityScore = combo.quality;
    dbg.positionComplexity = combo.mechanics ? combo.mechanics.complexity : null;
    this.lastDebug = dbg;
    return combo;
  }
  build(bp, action, zone, method, cond, level, target) {
    const intensity = combinationIntensity(action, zone, method, cond);
    const combo = { blueprint: bp ? bp.id : null, action: action.id, zone: zone.id, method: method ? method.id : null, cond: cond ? cond.id : null, alt: null, intensity, level, target };
    combo.phrase = this.previewPhrase(combo);
    combo.meta = interactionMeta(combo);
    return combo;
  }
  reject(reason, dbg, v) {
    this.stats.rejected++; const k = String(reason).split(':')[0]; this.stats.rejectedReasons[k] = (this.stats.rejectedReasons[k] || 0) + 1;
    if (dbg) { dbg.rejectionReasons[k] = (dbg.rejectionReasons[k] || 0) + 1; if (this.debug && v) dbg.rejectedCandidates.push({ phrase: v.phrase, reason }); }
  }
  previewPhrase(combo) { return NLG.phrase(combo, { partner: this.prefs.names[1] || 'tu pareja', performer: this.prefs.names[0] || 'tú' }); }

  /* ¿Hay una razón para que esta ronda lleve condición? Nunca por probabilidad fija sin contexto. */
  conditionReason(bp, purpose, S, H, level) {
    const recent = H.rounds.slice(0, 3).filter(r => r.cond).length;
    const setupRecent = H.rounds.slice(0, 6).some(r => r.condTier === 'SETUP');
    let p = 0, tiers = [];
    if (level >= 2 && ['EXPLORE', 'VARIATION', 'BUILD', 'DEEPEN'].includes(purpose)) { p = 0.5; tiers = ['INTERACTION', 'LIGHT']; } // la dinámica entre los dos es lo que varía
    else if (purpose === 'CONNECT' || purpose === 'COOLDOWN') { p = level === 1 ? 0.25 : 0.35; tiers = ['LIGHT']; } // solo un matiz
    else { p = 0.3; tiers = ['LIGHT', 'INTERACTION']; }
    if (!recent && H.rounds.length >= 3) p += 0.2; // llevamos varias rondas sin ninguna: una cambia el aire
    if (recent >= 2) p -= 0.25; // no encadenar condiciones
    if (S.intentSet().has('tranquilo')) p -= 0.1;
    if (level >= 2 && bp.conditions.setup.length && !setupRecent && this.rng.chance(0.3)) tiers.push('SETUP'); // preparación: pocas veces y solo donde está diseñada
    if (!this.rng.chance(Math.max(0, p))) return null;
    return { tiers, reason: purpose };
  }

  /* finalWeight = base × nivel × anatomía × propósito × recencia × recenciaSemántica × diversidad × progresión × feedback */
  /* "hoy no": lo que cualquiera de los dos ha apartado no entra ni en la selección */
  avoidRules() { const S = this.session; return [...S.avoidSet()].map(k => AVOIDS[k]).filter(Boolean); }
  actionAllowed(a, rules) { return !rules.some(r => (r.contact && r.contact.includes(a.contactType)) || (r.actionTags && r.actionTags.some(t => a.tags.includes(t))) || (r.families && r.families.includes(a.family))); }
  zoneAllowed(z, rules) { return !rules.some(r => r.groups && r.groups.includes(z.group)); }
  condAllowed(c, rules) { return !rules.some(r => r.condFamilies && r.condFamilies.includes(c.family)); }
  /* el par acción·zona tiene que poder caer dentro del nivel (forma y condición mueven como mucho ±0.9) */
  inBand(a, z, level) { const v = pairIntensity(a, z), L = LEVELS[level]; return v >= L.lo - 0.9 && v <= L.max + 0.5; }
  /* acciones del blueprint con alguna zona disponible ahora mismo (anatomía, nivel, enfriamiento, «hoy no», objetivo) */
  usableActions(bp, level, target, avoid, relax, mods) {
    const H = this.history, prefs = this.prefs, rules = this.avoidRules(), out = [];
    for (const id of bp.actions) {
      const a = ACTION[id];
      if (!a || !a.levels[level] || prefs.actionDisabled(a) || !this.actionAllowed(a, rules)) continue;
      if (avoid && avoid.action === a.id) continue;
      if (relax < 2 && H.cooling('action', a.id, COOL.action)) continue;
      if (!relax && mods.purpose !== 'DEEPEN' && H.familyCooling('action', a.family, FAM_COOL.action)) continue;
      const zs = blueprintZones(bp, a, level, prefs).filter(z => this.zoneAllowed(z, rules) && this.inBand(a, z, level) && !(avoid && avoid.zone === z.id) && !H.cooling('zone', z.id, relax < 2 ? COOL.zone : 3) && mechanicsCheck(a, z, bp.requires ? CONDITION[bp.requires] : null).ok);
      if (!zs.length) continue;
      const d = Math.min(...zs.map(z => Math.abs(pairIntensity(a, z) - target)));
      if (d > (relax ? 2.4 : 1.6)) continue;
      out.push({ a, zs, d });
    }
    return out;
  }
  pickBlueprint(level, target, keep, avoid, relax, mods, dbg) {
    const H = this.history, items = [];
    for (const bp of BLUEPRINTS) {
      if (!bp.levels[level]) continue;
      if (keep.action && !bp.actions.includes(keep.action)) continue;
      if (keep.zone && !bp.actions.some(id => ACTION[id].zones.includes(keep.zone))) continue;
      if (bp.requires && !keep.action && H.rounds.slice(0, 10).some(r => r.condTier === 'SETUP')) continue; // una preparación cada bastante tiempo
      const usable = this.usableActions(bp, level, target, avoid, relax, mods);
      if (!usable.length) continue;
      const d = Math.min(...usable.map(u => u.d));
      const recency = H.familyWeight('blueprint', bp.id, { strength: mods.purpose === 'DEEPEN' ? 0.2 : 1, soft: mods.purpose === 'DEEPEN' });
      const maybe = Math.max(...usable.map(u => mods.maybeAction(u.a))); // «quizá»: si todo el blueprint está en duda, apenas sale
      const w = bp.baseWeight * bp.levels[level] * near(d, 0, 1) * recency * mods.blueprint(bp) * maybe * Math.min(1, usable.length / 3 + 0.4);
      if (this.debug) dbg.blueprintWeights[bp.id] = Math.round(w * 1000) / 1000;
      items.push({ item: bp, weight: w });
    }
    return items.length ? this.rng.weighted(items) : null;
  }
  pickAction(bp, level, target, avoid, relax, mods, dbg) {
    const H = this.history, items = [];
    for (const { a, zs, d } of this.usableActions(bp, level, target, avoid, relax, mods)) {
      const recency = H.novelty('action', a.id, 10, 1.2) * H.familyWeight('action', a.family, { strength: mods.purpose === 'DEEPEN' ? 0.2 : 1, soft: mods.purpose === 'DEEPEN' }) * H.familyWeight('actor', a.actor, { strength: 0.6, hunger: 99 });
      const prog = near(d, 0, 1.2), pm = mods.action(a);
      const w = a.levels[level] * prog * recency * pm;
      if (this.debug) { dbg.candidateWeights[a.id] = Math.round(w * 1000) / 1000; dbg.recencyPenalty[a.id] = Math.round(recency * 100) / 100; dbg.intensityModifier[a.id] = Math.round(prog * 100) / 100; dbg.feedbackModifier[a.id] = Math.round(pm * 100) / 100; dbg.anatomyModifier[a.id] = zs.length / Math.max(1, a.zones.length); }
      items.push({ item: a, weight: w });
    }
    return items.length ? this.rng.weighted(items) : null;
  }
  pickZone(bp, action, level, target, avoid, relax, mods, dbg) {
    const H = this.history, rules = this.avoidRules(), req = bp.requires ? CONDITION[bp.requires] : null;
    const items = blueprintZones(bp, action, level, this.prefs).map(z => {
      if (avoid && avoid.zone === z.id) return null;
      if (!this.zoneAllowed(z, rules)) return null;
      if (H.cooling('zone', z.id, relax < 2 ? COOL.zone : 3)) return null; // ni relajando vuelve la zona de las 3 últimas rondas
      if (!relax && mods.purpose !== 'DEEPEN' && H.familyCooling('zone', z.family, FAM_COOL.zone)) return null;
      const d = Math.abs(pairIntensity(action, z) - target);
      if (d > (relax ? 2.4 : 1.6)) return null;
      if (!relax && mods.purpose !== 'DEEPEN' && H.rounds.slice(0, 2).some(r => r.semanticFamily === `${action.family}·${z.family}`)) return null; // la misma idea seguida solo al profundizar
      const m = mechanicsCheck(action, z, req); if (!m.ok) return null;
      const seen = H.rounds.filter(r => r.families && r.families.zone === z.family).length;
      const diversity = H.rounds.length >= 6 && !seen ? 1.5 : 1; // cobertura corporal: lo que aún no ha salido empuja
      if (this.debug) dbg.diversityBoost[z.id] = diversity;
      return { item: z, weight: z.levels[level] * near(d, 0, 1.5) * H.novelty('zone', z.id, 10, 2) * H.familyWeight('zone', z.family, { strength: mods.purpose === 'DEEPEN' ? 0.3 : 1.5, soft: mods.purpose === 'DEEPEN' }) * diversity * mods.zone(z, action) * (0.6 + 0.4 * m.rel.naturalness) };
    }).filter(Boolean);
    return items.length ? this.rng.weighted(items) : null;
  }
  pickMethod(action, zone, level, target, avoid, relax, mods) {
    const H = this.history, base = pairIntensity(action, zone);
    const items = CE.methodsFor(action, zone, level).map(m => {
      if (avoid && avoid.method === m.id) return null;
      if (relax < 2 && H.cooling('method', m.id, COOL.method)) return null;
      return { item: m, weight: m.levels[level] * near(base + m.mod, target, 1.2) * H.novelty('method', m.id, 10, 1) * mods.method(m) };
    }).filter(Boolean);
    return items.length ? this.rng.weighted(items) : null;
  }
  pickCondition(bp, want, action, zone, method, level, target, avoid, relax, mods) {
    const H = this.history, base = pairIntensity(action, zone) + (method ? method.mod : 0);
    const rules = this.avoidRules();
    const items = CE.conditionsFor(action, zone, method, level).map(c => {
      if (want.only && c.id !== want.only) return null;
      if (!want.tiers.includes(c.tier) || !blueprintAllowsCondition(bp, c)) return null;
      if (c.needsAlt || !this.condAllowed(c, rules)) return null;
      if (avoid && avoid.cond === c.id) return null;
      if (relax < 2 && H.cooling('cond', c.id, COOL.cond)) return null;
      if (!relax && H.familyCooling('cond', c.family, FAM_COOL.cond)) return null;
      return { item: c, weight: c.levels[level] * CE.conditionValue(c, action, zone) * near(base + c.mod, target, 1.2) * H.novelty('cond', c.id, 12, 2) * H.familyWeight('cond', c.family, { strength: 2 }) * mods.cond(c) * (c.tier === 'SETUP' ? 0.6 : 1) };
    }).filter(Boolean);
    return items.length ? this.rng.weighted(items) : null;
  }

  /* ---------- variante más suave: la misma idea con menos intensidad ---------- */
  getVariant(last) {
    const prefs = this.prefs, level = this.session.level;
    const want = [last.intensity - 3, last.intensity - 0.8];
    const inRange = v => v >= want[0] && v <= want[1];
    const ctx = { prefs, level: Math.max(1, level - 1), session: this.session, avoids: AVOIDS };
    const tryZone = (zone, keepAction) => {
      const cands = [];
      const actions = keepAction ? [ACTION[last.action]] : ACTIONS.filter(a => a.zones.includes(zone.id) && !prefs.actionDisabled(a) && (a.levels[level] || a.levels[level - 1] || a.levels[1]));
      for (const a of actions) {
        const ms = METHODS.filter(m => CE.methodFits(m, a, zone) && (m.levels[level] || Object.keys(m.levels).some(l => l < level)));
        for (const m of [null, ...ms]) {
          const bps = (BLUEPRINTS_OF_ACTION[a.id] || []).map(id => BLUEPRINT[id]);
          if (!bps.length || !mechanicsCheck(a, zone).ok) continue;
          const cs = CONDITIONS.filter(c => c.tier !== 'SETUP' && bps.some(b => blueprintAllowsCondition(b, c)) && CE.conditionFits(c, a, zone, m) && !c.needsAlt && (c.levels[level] || Object.keys(c.levels).some(l => l < level)));
          for (const c of [null, ...cs]) {
            const v = combinationIntensity(a, zone, m, c);
            if (!inRange(v)) continue;
            const combo = { blueprint: (blueprintFor(a.id, zone.id) || bps[0]).id, action: a.id, zone: zone.id, method: m ? m.id : null, cond: c ? c.id : null, alt: null, intensity: v, level, target: v };
            if (combo.action === last.action && combo.method === last.method && combo.cond === last.cond) continue;
            combo.phrase = this.previewPhrase(combo);
            if (CombinationValidator.validate({ ...combo, level: null, names: prefs.names }, prefs).status !== 'VALID') continue; // bajar puede salir del nivel por abajo
            const chk = criticalCheck(combo, ctx); if (!chk.ok && !chk.reasons.every(r => r.startsWith('intensidad'))) continue;
            const changed = (combo.action !== last.action) + (combo.method !== last.method) + (combo.cond !== last.cond);
            cands.push({ item: combo, weight: near(v, last.intensity - 1.5, 1) * (combo.action === last.action ? 1.6 : 1) / (1 + 0.3 * changed) * (m && c ? 0.5 : 1) });
          }
        }
      }
      return cands.length ? this.rng.weighted(cands) : null;
    };
    const z = ZONE[last.zone];
    let combo = tryZone(z, false);
    if (combo) { combo.kept = 'zone'; return this.finishVariant(combo); }
    const a = ACTION[last.action];
    const zs = ZONES.filter(x => prefs.zoneEnabled(x) && x.id !== z.id && x.intensity < z.intensity && !x.tags.includes('intimo')).sort((p, q) => Math.abs(p.intensity - z.intensity) - Math.abs(q.intensity - z.intensity));
    for (const nz of zs) { if (!a.zones.includes(nz.id)) continue; combo = tryZone(nz, true); if (combo) { combo.kept = 'action'; return this.finishVariant(combo); } }
    for (const nz of zs.slice(0, 8)) { combo = tryZone(nz, false); if (combo) { combo.kept = 'intent'; return this.finishVariant(combo); } }
    return null;
  }
  finishVariant(combo) { combo.meta = interactionMeta(combo); combo.purpose = 'COOLDOWN'; return combo; }

  /* ---------- cierre de la ronda ---------- */
  round(combo, opts = {}) {
    const a = ACTION[combo.action], z = ZONE[combo.zone], m = combo.method ? METHOD[combo.method] : null, c = combo.cond ? CONDITION[combo.cond] : null;
    const intensity = combo.intensity != null ? combo.intensity : combinationIntensity(a, z, m, c);
    if (opts.advanceTurn && this.state.round > 0) this.state.performer = 1 - this.state.performer;
    if (c && c.slot === 'swap') this.state.performer = 1 - this.state.performer;
    const performer = this.state.performer, names = this.prefs.names || ['', ''];
    const performerName = names[performer] || (performer === 0 ? 'Jugador 1' : 'Jugador 2');
    const partner = names[1 - performer] || 'tu pareja';
    const phrase = NLG.phrase(combo, { partner, performer: performerName });
    const level = combo.level || this.session.level;
    const meta = combo.meta || interactionMeta(combo);
    const round = {
      id: `${Date.now().toString(36)}-${Math.floor(this.rng.next() * 1e6).toString(36)}`,
      n: ++this.state.round, level, levelName: LEVELS[level].name, target: opts.target ?? combo.target ?? intensity, intensity, intensityLabel: INTENSITY_LABEL(intensity),
      purpose: combo.purpose || 'MAINTAIN', pattern: meta.pattern, semanticFamily: meta.semanticFamily, dims: meta.dims, blueprint: combo.blueprint || null,
      condTier: c ? c.tier : null, mechanics: combo.mechanics || mechanicsCheck(a, z, c).rel,
      action: combo.action, zone: combo.zone, method: combo.method, cond: combo.cond, alt: combo.alt || null,
      seconds: m && m.seconds ? m.seconds : (c && c.id === 'esperar' ? 5 : null),
      performer, performerName, partnerName: partner, phrase, faces: NLG.faces(combo), dice: this.diceFaces(combo, level),
      families: { action: a.family, actor: a.actor || null, zone: z.family, cond: c ? c.family : null, method: m ? m.dim : null, blueprint: combo.blueprint || null },
      variant: opts.variant || null, kept: combo.kept || null, fallback: !!combo.fallback, quality: combo.quality ?? null,
      canMore: !!(m && ['presion', 'ritmo', 'dinamica'].includes(m.dim)) || a.tags.includes('presion'),
      validation: CombinationValidator.validate({ ...combo, intensity, level: opts.fromFavorite ? null : (combo.band || level), phrase, names }, this.prefs).status,
    };
    this.history.push(round);
    this.director.afterRound(this.session, round);
    return round;
  }

  /* DiceManager: 6 caras por dado; la primera es el resultado, las otras cinco son opciones reales del nivel. */
  diceFaces(combo, level) {
    const a = ACTION[combo.action], z = ZONE[combo.zone];
    const f = NLG.faces(combo);
    const others = (list, me) => { const r = this.rng.shuffle([...new Set(list.filter(x => x !== me))]).slice(0, 5); while (r.length < 5) r.push(r[r.length % Math.max(1, r.length)] || me); return r; };
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const zoneNames = CE.zonesFor(a, level, this.prefs).map(x => cap(x.n.replace(/^(el|la|los|las) /, '').replace(/,.*$/, '')));
    const actNames = ACTIONS.filter(x => x.levels[level] && !this.prefs.actionDisabled(x)).map(x => x.name);
    const methodNames = CE.methodsFor(a, z, level).map(x => NLG.faces({ ...combo, method: x.id }).method);
    const condNames = CE.conditionsFor(a, z, combo.method ? METHOD[combo.method] : null, level).map(x => x.short);
    return { action: [f.action, ...others(actNames, f.action)], zone: [f.zone, ...others(zoneNames, f.zone)], method: [f.method, ...others(methodNames, f.method)], cond: [f.cond, ...others(condNames, f.cond)] };
  }
}
export { CombinationValidator, PreferenceManager, HistoryManager, NLG, combinationIntensity, SessionState, SessionDirector, MOODS, AVOIDS };
