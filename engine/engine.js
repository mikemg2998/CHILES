/* GameEngine v2: un director invisible elige una experiencia coherente; los dados solo la revelan. */
import { ACTIONS, ACTION, ZONES, ZONE, METHODS, METHOD, CONDITIONS, CONDITION, LEVELS, LEVEL_BY_KEY, INTENSITY_LABEL } from './catalog.js';
import { Rng } from './rng.js';
import { CompatibilityEngine as CE, CombinationValidator } from './compat.js';
import { combinationIntensity, pairIntensity, IntensityDirector } from './intensity.js';
import { HistoryManager } from './history.js';
import { PreferenceManager } from './prefs.js';
import { NaturalLanguageGenerator as NLG } from './nlg.js';

const near = (v, t, k = 1) => Math.exp(-k * Math.abs(v - t));
const COOL = { action: 3, zone: 4, method: 2, cond: 5 };
const FAM_COOL = { action: 1, zone: 2, cond: 2 }; // la misma familia no vuelve en las rondas siguientes
/* Densidad por nivel: probabilidad de que la ronda intente usar forma y condición.
   Los dados son la mecánica; la frase manda. Relajado va limpio; Atrevido admite más condiciones porque forman parte del picante. */
const DENSITY = { 1: { method: .6, cond: .15, both: .3 }, 2: { method: .65, cond: .35, both: .5 }, 3: { method: .6, cond: .5, both: .6 } };

export class GameEngine {
  constructor({ prefs, seed } = {}) {
    this.rng = new Rng(seed);
    this.prefs = prefs instanceof PreferenceManager ? prefs : new PreferenceManager(prefs);
    this.history = new HistoryManager();
    this.director = new IntensityDirector(this.rng);
    this.state = { round: 0, performer: 0, favorites: [], progressive: { band: 1, calm: 0 } };
    this.stats = { rejected: 0, rejectedReasons: {} };
  }

  /* nivel efectivo: el elegido, o la banda actual en modo progresivo */
  level() {
    if (this.prefs.mode === 'progresivo') return this.state.progressive.band;
    return LEVEL_BY_KEY[this.prefs.mode] || 1;
  }
  categoryOf(a, z, c, intensity) {
    if (intensity >= 8) return 'intensidad';
    if (a.tags.includes('anticipacion') || (c && c.concepts.includes('anticipacion'))) return 'anticipacion';
    if (intensity >= 6.5) return 'provocacion';
    if (intensity >= 4.5) return 'sensualidad';
    if (a.tags.includes('quieto') || (c && ['mirandose', 'respirarJuntos'].includes(c.id))) return 'conexion';
    if (a.id === 'masajear' || a.id === 'apoyarMano') return 'relax';
    return intensity >= 3 ? 'sensualidad' : 'carino';
  }

  /* ---------- API ---------- */
  /* quién recibe en la próxima ronda: decide qué anatomía íntima entra en juego */
  aim(advance) { const next = advance && this.state.round > 0 ? 1 - this.state.performer : this.state.performer; this.prefs.partner = 1 - next; }
  roll() { this.aim(true); return this.round(this.generate({ level: this.level() }), { advanceTurn: true }); }
  pass() { this.state.progressive.calm = 0; const last = this.history.last(); if (last) last.passed = true; return this.roll(); }
  reroll() {
    this.aim(false);
    const last = this.history.last();
    const combo = this.generate({ level: this.level(), target: last ? last.target : null, avoid: last });
    return this.round(combo, { advanceTurn: false, target: last ? last.target : null });
  }
  softer() { return this.variant(-1); }
  harder() { return this.variant(+1); }
  variant(dir) {
    const last = this.history.last(); if (!last) return this.roll();
    this.aim(false);
    if (dir < 0) this.state.progressive.calm = 0;
    const combo = this.getVariant(last, dir);
    if (!combo) return null;
    return this.round(combo, { advanceTurn: false, target: combo.intensity, variant: dir < 0 ? 'softer' : 'harder' });
  }
  repeatFavorite(fav) { this.aim(true); return this.round({ action: fav.action, zone: fav.zone, method: fav.method, cond: fav.cond, alt: fav.alt }, { advanceTurn: true, fromFavorite: true }); }
  inspireFavorite(fav) {
    this.aim(true);
    const keep = this.rng.chance(0.5) ? { action: fav.action } : { zone: fav.zone };
    const combo = this.generate({ level: this.level(), target: fav.intensity, keep, avoid: fav });
    return this.round(combo, { advanceTurn: true, inspired: true });
  }
  addFavorite(r) { if (!this.state.favorites.some(f => f.id === r.id)) this.state.favorites.push(r); }
  removeFavorite(id) { this.state.favorites = this.state.favorites.filter(f => f.id !== id); }
  resetGame() { this.history.reset(); this.state.round = 0; this.state.progressive = { band: 1, calm: 0 }; }

  /* ---------- generación por restricciones ---------- */
  generate({ level, target = null, keep = {}, avoid = null }) {
    const prefs = this.prefs, H = this.history;
    const L = LEVELS[level];
    if (target == null) target = this.director.nextTarget(level, H);
    const lo = level === 3 ? 5.5 : level === 2 ? 3.0 : L.min, hi = L.max;
    let best = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const relax = attempt > 20; // si no encuentra nada, relaja los enfriamientos
      const action = keep.action ? ACTION[keep.action] : this.pickAction(level, target, avoid, relax);
      if (!action) continue;
      const zone = keep.zone ? ZONE[keep.zone] : this.pickZone(action, level, target, avoid, relax);
      if (!zone) continue;
      // estructura de la ronda: qué dados entran. Nunca por obligación.
      const D = DENSITY[level];
      let wantMethod = this.rng.chance(action.manner === 'baja' ? D.method * .45 : D.method);
      let wantCond = this.rng.chance(D.cond);
      if (wantMethod && wantCond && !this.rng.chance(D.both)) { if (this.rng.chance(.5)) wantMethod = false; else wantCond = false; }
      if (keep.method !== undefined) wantMethod = !!keep.method;
      const method = wantMethod ? this.pickMethod(action, zone, level, target, avoid, relax) : null;
      let cond = wantCond ? this.pickCondition(action, zone, method, level, target, avoid, relax) : null;
      let alt = null;
      if (cond && cond.needsAlt) { const alts = CE.altZones(cond, action, zone, level, prefs); if (!alts.length) cond = null; else alt = this.rng.pick(alts).id; }
      const intensity = combinationIntensity(action, zone, method, cond);
      const combo = { action: action.id, zone: zone.id, method: method ? method.id : null, cond: cond ? cond.id : null, alt, intensity, level, target };
      if (intensity < lo || intensity > hi || Math.abs(intensity - target) > 1.3) { this.reject('intensidad fuera de objetivo'); continue; }
      const v = CombinationValidator.validate({ ...combo, phrase: this.previewPhrase(combo), names: prefs.names }, prefs);
      if (v.status !== 'VALID') { this.reject(v.reasons[0]); continue; }
      return combo;
    }
    // red de seguridad: lo más tranquilo del nivel
    const fallback = this.fallback(level);
    return fallback;
  }
  reject(reason) { this.stats.rejected++; const k = String(reason).split(':')[0]; this.stats.rejectedReasons[k] = (this.stats.rejectedReasons[k] || 0) + 1; }
  previewPhrase(combo) { return NLG.phrase(combo, { partner: this.prefs.names[1] || 'tu pareja', performer: this.prefs.names[0] || 'tú' }); }
  pickAction(level, target, avoid, relax) {
    const H = this.history, prefs = this.prefs;
    const items = [];
    for (const a of ACTIONS) {
      if (!a.levels[level] || prefs.actionDisabled(a)) continue;
      if (avoid && avoid.action === a.id) continue;
      if (!relax && (H.cooling('action', a.id, COOL.action) || H.familyCooling('action', a.family, FAM_COOL.action))) continue;
      const zs = CE.zonesFor(a, level, prefs);
      if (!zs.length) continue;
      const d = Math.min(...zs.map(z => Math.abs(pairIntensity(a, z) - target)));
      if (d > 1.6) continue;
      items.push({ item: a, weight: a.levels[level] * near(d, 0, 1.2) * H.novelty('action', a.id, 10, 1.2) * H.familyWeight('action', a.family, { strength: 1 }) });
    }
    return items.length ? this.rng.weighted(items) : null;
  }
  pickZone(action, level, target, avoid, relax) {
    const H = this.history;
    const items = CE.zonesFor(action, level, this.prefs).map(z => {
      if (avoid && avoid.zone === z.id) return null;
      if (!relax && (H.cooling('zone', z.id, COOL.zone) || H.familyCooling('zone', z.family, FAM_COOL.zone))) return null;
      const d = Math.abs(pairIntensity(action, z) - target);
      if (d > 1.6) return null;
      return { item: z, weight: z.levels[level] * near(d, 0, 1.5) * H.novelty('zone', z.id, 10, 1.5) * H.familyWeight('zone', z.family, { strength: 1.5 }) };
    }).filter(Boolean);
    return items.length ? this.rng.weighted(items) : null;
  }
  pickMethod(action, zone, level, target, avoid, relax) {
    const H = this.history, base = pairIntensity(action, zone);
    const items = CE.methodsFor(action, zone, level).map(m => {
      if (avoid && avoid.method === m.id) return null;
      if (!relax && H.cooling('method', m.id, COOL.method)) return null;
      return { item: m, weight: m.levels[level] * near(base + m.mod, target, 1.2) * H.novelty('method', m.id, 10, 1) };
    }).filter(Boolean);
    return items.length ? this.rng.weighted(items) : null;
  }
  pickCondition(action, zone, method, level, target, avoid, relax) {
    const H = this.history, base = pairIntensity(action, zone) + (method ? method.mod : 0);
    const items = CE.conditionsFor(action, zone, method, level).map(c => {
      if (avoid && avoid.cond === c.id) return null;
      if (!relax && (H.cooling('cond', c.id, COOL.cond) || H.familyCooling('cond', c.family, FAM_COOL.cond))) return null;
      return { item: c, weight: c.levels[level] * CE.conditionValue(c, action, zone) * near(base + c.mod, target, 1.2) * H.novelty('cond', c.id, 12, 2) * H.familyWeight('cond', c.family, { strength: 2 }) };
    }).filter(Boolean);
    return items.length ? this.rng.weighted(items) : null;
  }
  fallback(level) {
    const a = level === 1 ? ACTION.acariciar : level === 2 ? ACTION.besar : ACTION.lamer;
    const zs = CE.zonesFor(a, level, this.prefs);
    const z = zs.length ? zs[0] : ZONE.manos;
    return { action: a.id, zone: z.id, method: 'lento', cond: null, alt: null, intensity: combinationIntensity(a, z, METHOD.lento, null), level, target: 0 };
  }

  /* ---------- variantes: misma idea, más suave o más intensa ---------- */
  getVariant(last, dir) {
    const prefs = this.prefs, level = this.level();
    const maxAllowed = LEVELS[level].max; // subir nunca sale del nivel elegido
    const want = dir < 0 ? [last.intensity - 3, last.intensity - 0.8] : [last.intensity + 0.8, Math.min(10, last.intensity + 3)];
    const inRange = v => v >= want[0] && v <= want[1] && v <= maxAllowed;
    const tryZone = (zone, keepAction) => {
      const cands = [];
      const actions = keepAction ? [ACTION[last.action]] : ACTIONS.filter(a => a.zones.includes(zone.id) && !prefs.actionDisabled(a) && (a.levels[level] || (dir < 0 && a.levels[level - 1]) || (dir < 0 && a.levels[1])));
      for (const a of actions) {
        const ms = METHODS.filter(m => CE.methodFits(m, a, zone) && (m.levels[level] || (dir < 0 && Object.keys(m.levels).some(l => l < level))));
        for (const m of [null, ...ms]) {
          const cs = CONDITIONS.filter(c => CE.conditionFits(c, a, zone, m) && !c.needsAlt && (c.levels[level] || (dir < 0 && Object.keys(c.levels).some(l => l < level))));
          for (const c of [null, ...cs]) {
            const v = combinationIntensity(a, zone, m, c);
            if (!inRange(v)) continue;
            const combo = { action: a.id, zone: zone.id, method: m ? m.id : null, cond: c ? c.id : null, alt: null, intensity: v, level, target: v };
            if (CombinationValidator.validate({ ...combo, phrase: this.previewPhrase(combo), names: prefs.names }, prefs).status !== 'VALID') continue;
            if (combo.action === last.action && combo.method === last.method && combo.cond === last.cond) continue;
            const changed = (combo.action !== last.action) + (combo.method !== last.method) + (combo.cond !== last.cond);
            cands.push({ item: combo, weight: near(v, dir < 0 ? last.intensity - 1.5 : last.intensity + 1.5, 1) * (combo.action === last.action ? 1.6 : 1) / (1 + 0.3 * changed) * (m && c ? 0.5 : 1) });
          }
        }
      }
      return cands.length ? this.rng.weighted(cands) : null;
    };
    const z = ZONE[last.zone];
    let combo = tryZone(z, false);
    if (combo) { combo.kept = 'zone'; return combo; }
    // no se puede con la misma zona: busca una zona vecina en la misma dirección, manteniendo la acción si se puede
    const a = ACTION[last.action];
    const zs = ZONES.filter(x => prefs.zoneEnabled(x) && x.id !== z.id && (dir < 0 ? x.intensity < z.intensity : x.intensity > z.intensity)).sort((p, q) => Math.abs(p.intensity - z.intensity) - Math.abs(q.intensity - z.intensity));
    for (const nz of zs) {
      if (!a.zones.includes(nz.id)) continue;
      combo = tryZone(nz, true); if (combo) { combo.kept = 'action'; return combo; }
    }
    for (const nz of zs.slice(0, 8)) { combo = tryZone(nz, false); if (combo) { combo.kept = 'intent'; return combo; } }
    return null;
  }

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
    const level = combo.level || this.level();
    const round = {
      id: `${Date.now().toString(36)}-${Math.floor(this.rng.next() * 1e6).toString(36)}`,
      n: ++this.state.round, level, levelName: LEVELS[level].name, target: opts.target ?? combo.target ?? intensity, intensity, intensityLabel: INTENSITY_LABEL(intensity),
      category: this.categoryOf(a, z, c, intensity),
      action: combo.action, zone: combo.zone, method: combo.method, cond: combo.cond, alt: combo.alt || null,
      seconds: m && m.seconds ? m.seconds : (c && c.id === 'esperar' ? 5 : null),
      performer, performerName, partnerName: partner, phrase, faces: NLG.faces(combo), dice: this.diceFaces(combo, level),
      families: { action: a.family, zone: z.family, cond: c ? c.family : null, method: m ? m.dim : null },
      variant: opts.variant || null, kept: combo.kept || null,
      validation: CombinationValidator.validate({ ...combo, intensity, level: opts.fromFavorite ? null : level, phrase, names }, this.prefs).status,
    };
    this.history.push(round);
    // modo progresivo: si nadie pasa ni baja, la banda puede subir cada 3 rondas
    if (this.prefs.mode === 'progresivo' && opts.advanceTurn) {
      const p = this.state.progressive; p.calm++;
      if (p.calm >= 3 && p.band < 3 && this.rng.chance(0.6)) { p.band++; p.calm = 0; round.bandUp = p.band; }
    }
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
export { CombinationValidator, PreferenceManager, HistoryManager, NLG, combinationIntensity };
