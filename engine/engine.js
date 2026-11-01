/* GameEngine v6. Interacciones diseñadas por personas → variaciones seguras → lenguaje natural.
   Director de sesión (qué pretende la ronda) → gramática (solo combinaciones aprobadas: acción + herramienta + zona, con
   nivel, estilo y duración derivados) → realizador humano (frase) → filtro de calidad → dados que la representan.
   Los dados representan conceptos; no gobiernan la lógica. */
import { LEVELS, LEVEL_BY_KEY, ACTIONS, ACTIONS_LIST, TARGETS, ACTOR_TOOLS, STYLES, COMBO, COMBOS, combosForLevel, combinationIntensity, INTENSITY_LABEL, GROUPS, LEGACY_TARGET, levelWeight, migrateLevelId } from './grammar.js';
import { Rng } from './rng.js';
import { HistoryManager } from './history.js';
import { PreferenceManager } from './prefs.js';
import { SessionState, SessionDirector, AVOIDS, MOODS, ruleBlocksAction, ruleBlocksTarget } from './session.js';
import { criticalCheck, qualityScore, fallbackFor, THRESHOLD, HUMAN_MIN } from './quality.js';
import { realize, shapesFor } from './realizer.js';
import { pickDuration, durationOptions, formatDuration } from './duration.js';
import { LEGACY_ACTION, LEGACY_STYLE } from './data/legacy.js';

const near = (v, t, k = 1) => Math.exp(-k * Math.abs(v - t));
const COOL = { action: 3, target: 4, style: 2, combo: 12 };
const FAM_COOL = { action: 1, target: 2 };
const MAX_CANDIDATES = 6;
const INTENSITY_TOL = [1.5, 1.9, 2.3]; // distancia al objetivo admitida en cada pasada (la tercera, solo para no caer en fallback)

export class GameEngine {
  constructor({ prefs, seed, level, debug = false } = {}) {
    this.rng = new Rng(seed);
    this.prefs = prefs instanceof PreferenceManager ? prefs : new PreferenceManager(prefs);
    this.history = new HistoryManager();
    this.director = new SessionDirector(this.rng);
    this.session = new SessionState(level || LEVEL_BY_KEY[this.prefs.mode] || 1);
    this.state = { round: 0, performer: 0, favorites: [] };
    this.stats = { rejected: 0, rejectedReasons: {}, fallbacks: 0, recomposed: 0 };
    this.debug = debug; this.lastDebug = null;
  }

  /* ---------- sesión ---------- */
  level() { return this.session.level; }
  levelInfo() { return LEVELS[this.session.level]; }
  /* el nivel lo decide la pareja, en cualquier dirección; el motor nunca lo cambia solo */
  setLevel(level) { this.director.setLevel(this.session, level); return this.session.level === Number(level); }
  setIntents(player, list) { this.session.intents[player] = [...new Set(list.filter(k => MOODS[k]))]; }
  setPrefs(player, map) { const out = {}; for (const k in map) if (AVOIDS[k] && (map[k] === 'quiza' || map[k] === 'no')) out[k] = map[k]; this.session.pref[player] = out; }
  setAvoid(player, list) { const m = { ...this.session.pref[player] }; for (const k in m) if (m[k] === 'no') delete m[k]; for (const k of list) if (AVOIDS[k]) m[k] = 'no'; this.session.pref[player] = m; }
  newSession(level) { this.history.reset(); this.state.round = 0; this.state.performer = 0; this.session = new SessionState(level || this.session.level); this.stats = { rejected: 0, rejectedReasons: {}, fallbacks: 0, recomposed: 0 }; }
  ended() { return this.session.ended; }
  feedback(kind, extra) { this.director.feedback(this.session, this.history.last(), kind, extra); }
  endSession(how) { return this.director.end(this.session, how); }

  /* ---------- API de rondas ---------- */
  aim(advance) { const next = advance && this.state.round > 0 ? 1 - this.state.performer : this.state.performer; this.prefs.partner = 1 - next; }
  roll() { if (this.session.ended) return null; this.aim(true); return this.round(this.generate({}), { advanceTurn: true }); }
  pass() { const last = this.history.last(); if (last && !last.passed) { last.passed = true; this.feedback('paso'); } return this.roll(); }
  reroll() {
    if (this.session.ended) return null;
    this.aim(false);
    const last = this.history.last();
    if (last) this.feedback('cambia');
    const combo = this.generate({ purpose: 'VARIATION', target: last ? last.target : null, avoid: last });
    return this.round(combo, { advanceTurn: false, target: last ? last.target : null });
  }
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
    fav = migrateFavorite(fav); if (!fav) return null;
    const names = this.prefs.names || ['', ''];
    let performer = names.indexOf(fav.performerName); if (performer < 0) performer = fav.performer ?? this.state.performer;
    this.prefs.partner = 1 - performer;
    const c = COMBO[`${fav.action}|${fav.tool}|${fav.target}`];
    if (!c || !this.prefs.targetEnabled(fav.target)) return null;
    const level = this.session.level;
    const combo = this.compose(c, { style: fav.style && c.styles.includes(fav.style) ? fav.style : null, guided: fav.pattern === 'GUIDED' && c.guidable, level, band: level, duration: fav.duration || null, keepText: fav.performerName === names[performer] && fav.partnerName === names[1 - performer] ? fav.phrase : null });
    if (!combo) return null;
    return this.round(combo, { advanceTurn: performer !== this.state.performer, fromFavorite: true });
  }
  inspireFavorite(fav) {
    if (this.session.ended) return null;
    fav = migrateFavorite(fav); if (!fav) return null;
    this.aim(true);
    const keep = this.rng.chance(0.5) ? { action: fav.action } : { target: fav.target };
    const combo = this.generate({ target: fav.intensity, keep, avoid: fav, purpose: 'DEEPEN' });
    return this.round(combo, { advanceTurn: true, inspired: true });
  }
  addFavorite(r) { if (!this.state.favorites.some(f => f.id === r.id)) this.state.favorites.push(r); }
  removeFavorite(id) { this.state.favorites = this.state.favorites.filter(f => f.id !== id); }
  resetGame() { this.newSession(this.session.level); }

  /* ---------- generación ---------- */
  generate({ target = null, keep = {}, avoid = null, purpose = null }) {
    const prefs = this.prefs, H = this.history, S = this.session, level = S.level;
    const P = purpose ? { purpose, reason: 'pedido por la interfaz' } : this.director.purpose(S, H);
    purpose = P.purpose === 'END' ? 'MAINTAIN' : P.purpose;
    if (target == null) target = this.director.target(purpose, S, H);
    // Intimidad sin anatomía íntima disponible para quien recibe: se juega con la banda y el repertorio de Exploración
    const intimateOk = prefs.enabledGroups.some(g => GROUPS[g].intimate) && (prefs.bodyParts[prefs.partner] || []).length > 0;
    const band = level === 3 && !intimateOk ? 2 : level; // Intimidad sin anatomía íntima: se juega con el repertorio alto de Deseo
    if (band !== level || S.maybeSet().has('intimo')) target = Math.min(target, 8.5); // «quizá» íntimo: no se asume; la intensidad se busca en lo demás
    target = Math.min(target, this.reachable(band)); // el objetivo nunca sube más allá de lo que el repertorio disponible puede dar
    const mods = this.director.modifiers(purpose, S, H);
    const dbg = { selectedPurpose: purpose, purposeReason: P.reason, target, level, band, intraLevelIntensity: S.intraLevelIntensity, calm: S.calm(), candidateWeights: {}, rejectedCandidates: [], rejectionReasons: {}, candidates: [], finalQualityScore: null, fallback: false, guidedChance: null };
    const ctx = { prefs, level: band, session: S, history: H, target, purpose };
    const candidates = [];
    const pGuided = mods.guided(); dbg.guidedChance = pGuided;
    for (let batch = 0; batch < 3 && !candidates.length; batch++) for (const c of this.pickCombos(band, target, keep, avoid, mods, dbg, batch)) {
      const a = ACTIONS[c.action];
      const guided = c.guidable && this.rng.chance(pGuided);
      // estilo solo con una razón; si la guía la pareja, el estilo lo pone su mano (salvo que ya haya pedido ajustes)
      const Lb = LEVELS[band], baseOut = c.intensity < Lb.lo || c.intensity > Lb.max; // solo un estilo lo mete en el nivel
      const wantStyle = c.styles.length && (baseOut || (a.styleRate > 0 && (keep.style !== undefined ? !!keep.style : (Math.abs(S.pressure) > 0.2 || Math.abs(S.pace) > 0.2 || (!guided && this.rng.chance(a.styleRate))))));
      const style = wantStyle ? this.pickStyle(c, band, target, mods) : null;
      if (baseOut && !style) { this.reject('LEVEL_OUT_OF_BAND', dbg, { text: c.key }); continue; }
      let v = this.compose(c, { style, guided, level, band });
      if (!v) { this.reject('UNVERBALIZABLE', dbg, { text: c.key }); continue; }
      let chk = criticalCheck(v, ctx);
      if (!chk.ok && chk.reasons.includes('PHRASE_UNNATURAL')) { // recomponer una vez con otra estructura
        const v2 = this.compose(c, { style, guided, level, band, excludeShape: v.shapeId }); this.stats.recomposed++;
        if (v2 && v2.humanLikeness > v.humanLikeness) { v = v2; chk = criticalCheck(v, ctx); }
      }
      if (!chk.ok) { this.reject(chk.reasons[0], dbg, v); continue; }
      if (Math.abs(v.intensity - target) > 1.6 && style && !baseOut) { const v0 = this.compose(c, { style: null, guided, level, band }); if (v0 && criticalCheck(v0, ctx).ok && Math.abs(v0.intensity - target) < Math.abs(v.intensity - target)) v = v0; } // el estilo la alejaba del objetivo: mejor sin él
      if (Math.abs(v.intensity - target) > INTENSITY_TOL[batch] + 0.1) { this.reject('INTENSITY_OFF_TARGET', dbg, v); continue; }
      const q = qualityScore(v, ctx); v.quality = q.score; v.qualityParts = q.parts;
      if (v.quality < THRESHOLD) { this.reject('LOW_QUALITY', dbg, v); continue; }
      candidates.push(v);
    }
    let combo;
    if (candidates.length) {
      combo = this.rng.weighted(candidates.map(c => ({ item: c, weight: Math.exp(8 * c.quality) * mods.combo(COMBO[c.key]) }))); // calidad manda, con un poco de azar curado
    } else {
      const last = H.last();
      const f = fallbackFor(band, prefs, last ? `${last.action}|${last.tool}|${last.target}` : null, c => { if (H.cooling('target', c.target, 3) || H.cooling('action', c.action, 2)) return false; const v = this.compose(COMBO[`${c.action}|${c.tool}|${c.target}`], { style: c.style, guided: false, level, band }); return !!v && criticalCheck(v, ctx).ok; });
      combo = this.compose(COMBO[`${f.action}|${f.tool}|${f.target}`], { style: f.style, guided: false, level, band });
      if (!criticalCheck(combo, ctx).ok) { // último recurso: la combinación aprobada del nivel más cercana al objetivo
        const pool = combosForLevel(band).filter(c => prefs.targetEnabled(c.target) && !prefs.actionDisabled(c.action)).sort((p, q) => Math.abs(p.intensity - target) - Math.abs(q.intensity - target));
        const fresh = pool.filter(c => !H.cooling('target', c.target, 3) && !H.cooling('action', c.action, 2));
        for (const c of [...fresh.slice(0, 12), ...pool.slice(0, 6)]) { const v = this.compose(c, { style: null, guided: false, level, band }); if (v && criticalCheck(v, ctx).ok) { combo = v; break; } }
      }
      combo.fallback = true; combo.quality = 0; this.stats.fallbacks++; dbg.fallback = true;
    }
    combo.purpose = purpose; combo.target_intensity = target;
    dbg.candidates = candidates.map(c => ({ text: c.text, quality: c.quality, human: c.humanLikeness, key: c.key }));
    dbg.finalQualityScore = combo.quality; dbg.selected = combo.key; dbg.pattern = combo.pattern; dbg.shape = combo.shape;
    this.lastDebug = dbg;
    return combo;
  }
  /* techo de intensidad alcanzable con el repertorio habilitado: la décima combinación más intensa del nivel (con su mejor estilo), para que
     cerca del objetivo haya siempre varias opciones aunque la acción o la zona anteriores estén enfriándose */
  reachable(band) {
    const prefs = this.prefs, L = LEVELS[band];
    const sig = `${band}|${prefs.enabledGroups.join(',')}|${(prefs.bodyParts[prefs.partner] || []).join(',')}|${[...(prefs.disabledActions || [])].join(',')}`;
    if (this._reach && this._reach.sig === sig) return this._reach.value;
    const tops = combosForLevel(band).filter(c => prefs.targetEnabled(TARGETS[c.target]) && !prefs.actionDisabled(ACTIONS[c.action]))
      .map(c => Math.max(c.intensity, ...c.styles.map(st => c.intensity + STYLES[st].intensityMod).filter(v => v <= L.max))).sort((a, b) => b - a);
    const value = tops.length ? tops[Math.min(9, tops.length - 1)] : L.max;
    this._reach = { sig, value };
    return value;
  }
  /* combinaciones aprobadas elegibles ahora: nivel, anatomía, «hoy no», enfriamientos, objetivo; muestreo ponderado sin repetición */
  pickCombos(band, target, keep, avoid, mods, dbg, batch = 0) {
    const H = this.history, prefs = this.prefs, rules = [...this.session.avoidSet()].map(k => AVOIDS[k]).filter(Boolean);
    const items = [];
    const relaxes = [0, 1, 2].slice(batch);
    for (const relax of relaxes) {
      for (const c of combosForLevel(band)) {
        const a = ACTIONS[c.action], z = TARGETS[c.target];
        if (keep.action && c.action !== keep.action) continue;
        if (keep.target && c.target !== keep.target) continue;
        if (!prefs.targetEnabled(z) || prefs.actionDisabled(a)) continue;
        if (rules.some(r => ruleBlocksAction(r, a) || ruleBlocksTarget(r, z))) continue;
        if (avoid && avoid.action === c.action && avoid.target === c.target) continue;
        if (H.cooling('action', c.action, COOL.action) && !keep.action) continue; // la misma acción no vuelve en 3 rondas, ni relajando
        if (relax < 2 && H.cooling('key', c.key, COOL.combo)) continue; // la misma combinación exacta no vuelve en un buen rato
        if (!relax && H.recentShapes.length && shapesFor(c.action, c.tool, c.target, null, band, false).every(sh => H.recentShapes.includes(sh.id))) continue; // todas sus frases posibles acaban de salir
        if (H.cooling('target', c.target, relax < 2 ? COOL.target : 3) && !keep.target) continue;
        if (!relax && mods.purpose !== 'DEEPEN' && (H.familyCooling('action', a.semanticFamily, FAM_COOL.action) || H.familyCooling('target', z.family, FAM_COOL.target))) continue;
        if (!relax && mods.purpose !== 'DEEPEN' && H.rounds.slice(0, 2).some(r => r.semanticFamily === `${a.semanticFamily}·${z.family}`)) continue;
        const d = Math.abs(c.intensity - target); if (d > INTENSITY_TOL[relax]) continue;
        const L = LEVELS[band]; const inBand = v => v >= L.lo && v <= L.max;
        if (!inBand(c.intensity) && !c.styles.some(st => inBand(c.intensity + STYLES[st].intensityMod))) continue; // fuera del nivel incluso con estilo
        const seen = H.rounds.filter(r => r.families && r.families.target === z.family).length;
        const diversity = H.rounds.length >= 6 && !seen ? 1.5 : 1;
        const w = c.weight * levelWeight(a.levelWeights, band, target, 0.3) * levelWeight(z.levelWeights, band, target, 0.5) * near(d, 0, 1.1) * H.novelty('action', c.action, 10, 1.2) * H.novelty('target', c.target, 10, 2) * H.familyWeight('action', a.semanticFamily, { strength: mods.purpose === 'DEEPEN' ? 0.2 : 1, soft: mods.purpose === 'DEEPEN' }) * H.familyWeight('target', z.family, { strength: mods.purpose === 'DEEPEN' ? 0.3 : 1.5, soft: mods.purpose === 'DEEPEN' }) * H.familyWeight('tool', ACTOR_TOOLS[c.tool].kind, { strength: 0.5, hunger: 99 }) * (0.6 + 0.4 * c.mechanics.naturalness) * diversity * mods.combo(c);
        if (w > 0) items.push({ item: c, weight: w });
      }
      if (items.length >= 3) break;
    }
    if (this.debug) for (const it of items) dbg.candidateWeights[it.item.key] = Math.round(it.weight * 1000) / 1000;
    const out = [];
    const pool = items.slice();
    while (pool.length && out.length < MAX_CANDIDATES) { const c = this.rng.weighted(pool); out.push(c); pool.splice(pool.findIndex(x => x.item === c), 1); }
    return out;
  }
  pickStyle(c, band, target, mods) {
    const H = this.history;
    const L = LEVELS[band];
    const items = c.styles.map(id => { const st = STYLES[id]; const v = c.intensity + st.intensityMod; if (H.cooling('style', id, COOL.style) || v > L.max || v < L.lo) return null; return { item: id, v, weight: near(v, target, 1.2) * H.novelty('style', id, 8, 1) * mods.style(st) }; }).filter(Boolean);
    const onTarget = items.filter(it => Math.abs(it.v - target) <= 1.6); // si hay estilos que mantienen el objetivo, solo esos
    const pool = onTarget.length ? onTarget : items;
    return pool.length ? this.rng.weighted(pool) : null;
  }
  /* compone un candidato completo: duración derivada + frase realizada */
  compose(c, { style = null, guided = false, level, band, duration = null, keepText = null, excludeShape = null }) {
    if (!c) return null;
    const a = ACTIONS[c.action];
    const pattern = guided ? 'GUIDED' : a.pattern;
    const cand = { key: c.key, action: c.action, tool: c.tool, target: c.target, style, pattern, level, band, tier: c.tier };
    const partner = this.prefs.names[this.prefs.partner] || 'tu pareja';
    const recent = excludeShape ? [excludeShape, excludeShape, ...this.history.recentShapes] : this.history.recentShapes;
    let r = realize(cand, { partner, rng: this.rng, recentShapes: recent });
    if (!r && guided) { cand.pattern = a.pattern; r = realize(cand, { partner, rng: this.rng, recentShapes: recent }); } // sin frase corta donde quepa la guía: sin guía
    if (!r) return null;
    if (style && !r.styleUsed) cand.style = null; // la frase no lo verbaliza: el dado tampoco lo muestra
    cand.intensity = combinationIntensity(c.action, c.target, c.tool, cand.style);
    cand.duration = duration || pickDuration(c.action, c.target, cand.style, band, this.rng);
    cand.text = keepText || r.text; cand.shapeId = r.shapeId; cand.shape = r.shape; cand.humanLikeness = r.humanLikeness; cand.humanFlags = r.humanFlags; cand.guidedAffects = r.guidedAffects;
    return cand;
  }
  reject(reason, dbg, v) {
    this.stats.rejected++; const k = String(reason).split(':')[0]; this.stats.rejectedReasons[k] = (this.stats.rejectedReasons[k] || 0) + 1;
    if (dbg) { dbg.rejectionReasons[k] = (dbg.rejectionReasons[k] || 0) + 1; if (this.debug && v) dbg.rejectedCandidates.push({ text: v.text, reason }); }
  }

  /* ---------- variante más suave: la misma idea con menos intensidad ---------- */
  getVariant(last) {
    const level = this.session.level, prefs = this.prefs, S = this.session;
    const want = v => v >= last.intensity - 3 && v <= last.intensity - 0.8;
    const ctx = { prefs, level, session: S, history: this.history, target: last.intensity - 1.5, purpose: 'COOLDOWN' };
    const tryList = (list, kept) => {
      const cands = [];
      for (const c of list) {
        if (!prefs.targetEnabled(c.target) || prefs.actionDisabled(c.action)) continue;
        const styles = c.styles.length ? [null, ...c.styles.filter(s => STYLES[s].intensityMod <= 0.3)] : [null];
        for (const st of styles) {
          const v = combinationIntensity(c.action, c.target, c.tool, st); if (!want(v)) continue;
          if (c.action === last.action && c.target === last.target && st === last.style) continue;
          const cand = this.compose(c, { style: st, guided: false, level, band: level });
          if (!cand || !criticalCheck(cand, { ...ctx, level }).ok && !criticalCheck(cand, { ...ctx, level: Math.max(1, level - 1) }).ok) continue;
          cands.push({ item: cand, weight: near(v, last.intensity - 1.5, 1) * (c.action === last.action ? 1.6 : 1) * c.weight * (st && ['SOFT', 'SLOW'].includes(st) ? 1.3 : 1) });
        }
      }
      if (!cands.length) return null;
      const combo = this.rng.weighted(cands); combo.kept = kept; combo.purpose = 'COOLDOWN'; return combo;
    };
    const sameTarget = COMBOS.filter(c => c.target === last.target && (c.levels.includes(level) || c.levels.includes(level - 1)));
    let combo = tryList(sameTarget, 'target'); if (combo) return combo;
    const z = TARGETS[last.target];
    const sameAction = COMBOS.filter(c => c.action === last.action && c.target !== last.target && TARGETS[c.target].sensitivity < z.sensitivity && !TARGETS[c.target].tags.includes('intimo') && (c.levels.includes(level) || c.levels.includes(level - 1))).sort((p, q) => Math.abs(TARGETS[p.target].sensitivity - z.sensitivity) - Math.abs(TARGETS[q.target].sensitivity - z.sensitivity));
    combo = tryList(sameAction.slice(0, 10), 'action'); if (combo) return combo;
    const any = COMBOS.filter(c => !TARGETS[c.target].tags.includes('intimo') && (c.levels.includes(level) || c.levels.includes(level - 1)) && c.intensity < last.intensity - 0.8);
    return tryList(this.rng.shuffle(any).slice(0, 24), 'intent');
  }

  /* ---------- cierre de la ronda ---------- */
  round(combo, opts = {}) {
    const a = ACTIONS[combo.action], z = TARGETS[combo.target];
    if (opts.advanceTurn && this.state.round > 0) this.state.performer = 1 - this.state.performer;
    const performer = this.state.performer, names = this.prefs.names || ['', ''];
    const performerName = names[performer] || (performer === 0 ? 'Jugador 1' : 'Jugador 2');
    const partner = names[1 - performer] || 'tu pareja';
    const level = combo.level || this.session.level;
    const round = {
      id: `${Date.now().toString(36)}-${Math.floor(this.rng.next() * 1e6).toString(36)}`,
      n: ++this.state.round, level, band: combo.band || level, levelName: LEVELS[level].name, target_intensity: opts.target ?? combo.target_intensity ?? combo.intensity, intensity: combo.intensity, intensityLabel: INTENSITY_LABEL(combo.intensity),
      purpose: combo.purpose || 'MAINTAIN', pattern: combo.pattern, semanticFamily: `${a.semanticFamily}·${z.family}`,
      key: combo.key, action: combo.action, tool: combo.tool, target: combo.target, style: combo.style || null, duration: combo.duration, seconds: combo.duration, tier: combo.tier,
      shapeId: combo.shapeId, shape: combo.shape, humanLikeness: combo.humanLikeness,
      performer, performerName, partnerName: partner, phrase: combo.text, faces: this.faces(combo), dice: this.diceFaces(combo, level),
      families: { action: a.semanticFamily, tool: ACTOR_TOOLS[combo.tool].kind, target: z.family, style: combo.style ? STYLES[combo.style].dim : null },
      variant: opts.variant || null, kept: combo.kept || null, fallback: !!combo.fallback, quality: combo.quality ?? null, qualityParts: combo.qualityParts || null,
      canMore: !!(combo.style && ['SOFT', 'FIRM', 'SLOW', 'FAST'].includes(combo.style)) || a.tags.includes('presion') || a.styles.length > 0,
      validation: criticalCheck({ ...combo, text: combo.text }, { prefs: this.prefs, level: combo.band || level, session: this.session }).ok ? 'VALID' : 'INVALID',
    };
    this.history.push(round);
    this.director.afterRound(this.session, round);
    return round;
  }
  faces(combo) {
    const a = ACTIONS[combo.action], z = TARGETS[combo.target];
    const zn = z.n.replace(/^(el|la|los|las) /, '').replace(/,.*$/, '');
    return { action: a.name, zone: zn.charAt(0).toUpperCase() + zn.slice(1), style: combo.style ? STYLES[combo.style].label : '—', duration: formatDuration(combo.duration) };
  }
  /* DiceManager: 6 caras por dado; la primera es el resultado, las otras cinco son opciones reales del nivel */
  diceFaces(combo, level) {
    const f = this.faces(combo);
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const others = (list, me) => { const r = this.rng.shuffle([...new Set(list.filter(x => x && x !== me))]).slice(0, 5); while (r.length < 5) r.push(r[r.length % Math.max(1, r.length)] || me); return r; };
    const pool = combosForLevel(level).filter(c => this.prefs.targetEnabled(c.target));
    const zoneNames = pool.map(c => cap(TARGETS[c.target].n.replace(/^(el|la|los|las) /, '').replace(/,.*$/, '')));
    const actNames = pool.map(c => ACTIONS[c.action].name);
    const c = COMBO[combo.key];
    const styleNames = (c && c.styles.length ? c.styles : Object.keys(STYLES)).map(s => STYLES[s].label);
    const durations = durationOptions(combo.action, combo.target, combo.style, level).map(o => formatDuration(o.seconds));
    return { action: [f.action, ...others(actNames, f.action)], zone: [f.zone, ...others(zoneNames, f.zone)], style: [f.style, ...others(styleNames, f.style)], duration: [f.duration, ...others(durations.length > 1 ? durations : ['00:15', '00:20', '00:30', '00:45', '01:00'], f.duration)] };
  }
}
/* favoritas guardadas con el modelo anterior (action/zone/method) → modelo nuevo; null si no se puede */
export function migrateFavorite(fav, schema = 3) {
  if (!fav) return null;
  if (schema < 3 && fav.level != null) { const level = migrateLevelId(fav.level); fav = { ...fav, level, levelName: LEVELS[level].name }; } // 01–04 → 01–03
  if (fav.tool && fav.target && ACTIONS[fav.action]) return fav;
  const m = LEGACY_ACTION[fav.action]; const target = LEGACY_TARGET[fav.zone];
  if (!m || !target) return null;
  const [action, tool] = m;
  if (!COMBO[`${action}|${tool}|${target}`]) return null;
  return { ...fav, action, tool, target, style: LEGACY_STYLE[fav.method] || null, pattern: null, duration: null, legacy: true };
}
export { PreferenceManager, HistoryManager, SessionState, SessionDirector, MOODS, AVOIDS, LEVELS, combinationIntensity };
