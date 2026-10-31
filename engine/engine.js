/* GameEngine: orquesta todo. Se puede usar sin interfaz (ver tests/simulate.js). */
import { ACTIONS, ACTION, ZONE, ZONES, STYLE, STYLES, CONDITION, CONDITIONS, WILDCARDS, CATEGORIES } from './catalog.js';
import { Rng } from './rng.js';
import { CompatibilityEngine as CE, CombinationValidator } from './compat.js';
import { computeIntensity, estimateIntensity, IntensityDirector } from './intensity.js';
import { HistoryManager } from './history.js';
import { PreferenceManager } from './prefs.js';
import { NaturalLanguageGenerator as NLG } from './nlg.js';
import { SignatureComboManager } from './signature.js';

const fit = (v, target, k = 0.9) => Math.exp(-k * Math.abs(v - target));

export class GameEngine {
  constructor({ prefs, seed, wildcardChance = 0.08, signatureChance = 0.07 } = {}) {
    this.rng = new Rng(seed);
    this.prefs = prefs instanceof PreferenceManager ? prefs : new PreferenceManager(prefs);
    this.history = new HistoryManager();
    this.director = new IntensityDirector(this.rng);
    this.signatures = new SignatureComboManager(this.rng, signatureChance);
    this.wildcardChance = wildcardChance;
    this.state = { round: 0, performer: 0, favorites: [] };
  }

  /* ---------- API pública ---------- */
  roll(opts = {}) {
    const ceiling = this.director.ceiling(this.prefs);
    let target = opts.target || this.director.nextTarget(this.prefs, this.history);
    target = Math.min(target, ceiling);
    let combo = null, wildcard = null;
    if (!opts.noWildcard && this.rng.chance(this.wildcardChance)) wildcard = this.rng.weighted(WILDCARDS.map(w => ({ item: w, weight: w.weight })));
    if (wildcard) combo = this.applyWildcard(wildcard, target, ceiling, opts);
    if (!combo) combo = this.signatures.maybe(target, this.prefs, this.history, ceiling);
    if (!combo) combo = this.generate(target, ceiling, opts);
    return this.finish(combo, target, ceiling, opts);
  }
  pass() { const last = this.history.last(); if (last) last.passed = true; return this.roll(); }
  reroll() { const last = this.history.last(); return this.roll({ target: last ? last.target : undefined }); }
  lowerIntensity() { this.director.lower(this.history); return this.roll(); }
  repeatFavorite(fav) {
    const combo = { action: fav.action, zone: fav.zone, style: fav.style, cond: fav.cond, alt: fav.alt, wildcard: fav.wildcard };
    const ceiling = 5;
    return this.finish(combo, fav.intensity, ceiling, { noTurn: false, fromFavorite: true });
  }
  inspireFavorite(fav) {
    const ceiling = this.director.ceiling(this.prefs);
    const keep = this.rng.chance(0.5) ? { action: fav.action } : { zone: fav.zone };
    const combo = this.generate(Math.min(fav.intensity, ceiling), ceiling, { keep });
    return this.finish(combo, fav.intensity, ceiling, { inspired: true });
  }
  addFavorite(round) { if (!this.state.favorites.some(f => f.id === round.id)) this.state.favorites.push(round); }
  removeFavorite(id) { this.state.favorites = this.state.favorites.filter(f => f.id !== id); }
  resetGame() { this.history = new HistoryManager(); this.director = new IntensityDirector(this.rng); this.state.round = 0; }

  /* ---------- generación procedural ---------- */
  generate(target, ceiling, opts = {}) {
    const keep = opts.keep || {};
    const prefs = this.prefs, H = this.history;
    for (let attempt = 0; attempt < 6; attempt++) {
      const action = keep.action ? ACTION[keep.action] : this.pickAction(target, ceiling);
      if (!action) break;
      let zone = keep.zone ? ZONE[keep.zone] : this.pickZone(action, target, ceiling);
      if (!zone) { if (keep.zone) { keep.zone = null; continue; } continue; }
      let style = this.pickStyle(action, zone, target);
      let cond = this.pickCondition(action, zone, style, target, ceiling);
      let intensity = computeIntensity(action, zone, style, cond);
      // si se pasa de lejos, sustituir solo lo que sobra
      for (let fix = 0; fix < 3 && (Math.abs(intensity - target) > 1 || intensity > ceiling); fix++) {
        if (fix === 0) style = this.pickStyle(action, zone, target, intensity > target ? -1 : 1);
        else if (fix === 1) cond = this.pickCondition(action, zone, style, target, ceiling, intensity > target ? -1 : 1);
        else if (!keep.zone) zone = this.pickZone(action, target, ceiling) || zone;
        intensity = computeIntensity(action, zone, style, cond);
      }
      if (intensity > ceiling) continue;
      const combo = { action: action.id, zone: zone.id, style: style ? style.id : null, cond: cond ? cond.id : null };
      if (cond && cond.needsAlt) combo.alt = this.pickAlt(action, zone);
      const v = CombinationValidator.validate({ ...combo, intensity }, prefs, ceiling);
      if (v.status === 'INVALID') continue;
      return combo;
    }
    // red de seguridad: la combinación más tranquila posible
    const a = ACTION.acariciar, z = CE.zonesFor(a, prefs)[0] || ZONE.manos;
    return { action: a.id, zone: z.id, style: 'lento', cond: 'ojosCerrados' };
  }
  pickAction(target, ceiling) {
    const prefs = this.prefs, H = this.history;
    const items = [];
    for (const a of ACTIONS) {
      if (prefs.actionDisabled(a) || a.baseIntensity > ceiling) continue;
      const zs = CE.zonesFor(a, prefs).filter(z => estimateIntensity(a, z) <= ceiling);
      if (!zs.length) continue;
      const best = Math.min(...zs.map(z => Math.abs(estimateIntensity(a, z) - target)));
      let w = fit(best, 0, 1.2) * fit(a.baseIntensity, target, 0.5);
      w *= H.novelty(H.recentActions, a.id, 1.2);
      w *= 1 / (1 + 0.6 * H.recentCategories.slice(0, 3).filter(c => c === a.category).length);
      w *= prefs.actionPreference(a);
      if (a.tags.includes('anticipacion') && target >= 3) w *= 1.3; // la anticipación crea contraste antes del pico
      items.push({ item: a, weight: w });
    }
    return items.length ? this.rng.weighted(items) : null;
  }
  pickZone(action, target, ceiling) {
    const prefs = this.prefs, H = this.history;
    const items = CE.zonesFor(action, prefs).filter(z => estimateIntensity(action, z) <= ceiling).map(z => {
      let w = fit(estimateIntensity(action, z), target, 1.1) * H.novelty(H.recentZones, z.id, 1.4);
      if (z.intimacy === 4 && target < 4) w *= 0.05;
      return { item: z, weight: w };
    });
    return items.length ? this.rng.weighted(items) : null;
  }
  pickStyle(action, zone, target, direction = 0) {
    const H = this.history;
    const est = estimateIntensity(action, zone);
    const items = CE.stylesFor(action, zone).map(s => {
      let w = H.novelty(H.recentStyles, s.id, 1.0) * fit(est + s.intensityMod, target, 0.8);
      if (direction) w *= Math.sign(s.intensityMod) === direction ? 2.5 : (s.intensityMod === 0 ? 1 : 0.4);
      if (this.prefs.durationPreference === 'corto' && s.id === 'masTiempo') w *= 0.4;
      if (this.prefs.durationPreference === 'largo' && s.id === 'pocosSegundos') w *= 0.4;
      return { item: s, weight: w };
    });
    return items.length ? this.rng.weighted(items) : null;
  }
  pickCondition(action, zone, style, target, ceiling, direction = 0) {
    const H = this.history;
    const est = estimateIntensity(action, zone) + (style ? style.intensityMod : 0);
    const items = CE.conditionsFor(action, zone, style).map(c => {
      let w = H.novelty(H.recentConditions, c.id, 1.0) * fit(est + c.intensityMod, target, 0.8);
      if (direction) w *= Math.sign(c.intensityMod) === direction ? 2 : (c.intensityMod === 0 ? 1 : 0.5);
      if (c.tags.includes('duration')) w *= this.prefs.durationPreference === 'largo' && c.seconds && c.seconds < 20 ? 0.4 : 1;
      if (c.id === 'elige2') w *= 0.6;
      return { item: c, weight: w };
    });
    return items.length ? this.rng.weighted(items) : null;
  }
  pickAlt(action, zone) {
    const zs = CE.zonesFor(action, this.prefs).filter(z => z.id !== zone.id && Math.abs(z.intimacy - zone.intimacy) <= 1);
    return zs.length ? this.rng.pick(zs).id : null;
  }

  /* ---------- comodines ---------- */
  applyWildcard(w, target, ceiling, opts) {
    const last = this.history.last();
    switch (w.kind) {
      case 'up': { const c = this.generate(Math.min(ceiling, target + 1), ceiling, opts); c.wildcard = 'up'; c.wildcardText = w.text; return c; }
      case 'down': { const c = this.generate(Math.max(1, target - 1), ceiling, opts); c.wildcard = 'down'; c.wildcardText = w.text; return c; }
      case 'swap': { this.state.performer = 1 - this.state.performer; const c = this.generate(target, ceiling, opts); c.wildcard = 'swap'; c.wildcardText = w.text; return c; }
      case 'freeAction': { const c = this.generate(target, ceiling, opts); c.action = null; c.wildcard = 'freeAction'; c.wildcardText = w.text; return c; }
      case 'freeZone': { const c = this.generate(target, ceiling, opts); if (['abrazar', 'susurrar', 'cercania', 'contacto', 'sorprender'].includes(c.action)) return null; c.zone = null; c.wildcard = 'freeZone'; c.wildcardText = w.text; return c; }
      case 'partnerAll': { const c = this.generate(target, ceiling, opts); c.wildcard = 'partnerAll'; c.wildcardText = w.text; return c; }
      case 'repeatOne': {
        if (!last || last.wildcard || !last.action || !last.zone) return null;
        const a = ACTION[last.action], z = ZONE[last.zone];
        const which = this.rng.pick(['style', 'zone', 'cond']);
        const c = { action: last.action, zone: last.zone, style: last.style, cond: last.cond, alt: last.alt };
        if (which === 'zone') { const nz = this.pickZone(a, last.intensity, ceiling); if (!nz || nz.id === z.id) return null; c.zone = nz.id; }
        else if (which === 'style') { const ns = this.pickStyle(a, z, last.intensity); if (!ns || ns.id === last.style) return null; c.style = ns.id; }
        else { const nc = this.pickCondition(a, z, STYLE[c.style], last.intensity, ceiling); if (!nc || nc.id === last.cond) return null; c.cond = nc.id; if (nc.needsAlt) c.alt = this.pickAlt(a, z); }
        const nz = ZONE[c.zone], ns = c.style ? STYLE[c.style] : null;
        if (!ns || !CE.styleFits(ns, a, nz) || !c.cond || !CE.conditionFits(CONDITION[c.cond], a, nz, ns)) return null;
        if (computeIntensity(a, nz, ns, CONDITION[c.cond]) > ceiling) return null;
        c.wildcard = 'repeatOne'; c.wildcardText = w.text; c.changed = which;
        return c;
      }
    }
    return null;
  }

  /* ---------- cierre de la ronda ---------- */
  finish(combo, target, ceiling, opts = {}) {
    const a = combo.action ? ACTION[combo.action] : null, z = combo.zone ? ZONE[combo.zone] : null;
    const s = combo.style ? STYLE[combo.style] : null, c = combo.cond ? CONDITION[combo.cond] : null;
    let intensity;
    if (a && z) intensity = computeIntensity(a, z, s, c);
    else if (z) intensity = Math.max(1, Math.min(5, Math.round(z.baseIntensity + (s ? s.intensityMod : 0) + (c ? c.intensityMod : 0) + 0.3)));
    else intensity = Math.max(1, Math.min(5, Math.round(a.baseIntensity + 0.5 + (s ? s.intensityMod : 0))));
    intensity = Math.min(intensity, ceiling);
    const category = combo.category || this.categorize(a, z, c, intensity);
    if (!opts.noTurn && !opts.fromFavorite) { /* el turno alterna en cada ronda nueva (no en "volver a lanzar") */ }
    if (!opts.target && !opts.fromFavorite && !opts.inspired && this.state.round > 0 && combo.wildcard !== 'swap') this.state.performer = 1 - this.state.performer;
    const performer = this.state.performer;
    const names = this.prefs.names || ['', ''];
    const partner = names[1 - performer] || 'tu pareja';
    let phrase = NLG.phrase(combo, { partner, rng: this.rng });
    if (combo.wildcard === 'partnerAll') phrase = `${partner} manda esta ronda. Si no se le ocurre nada: ` + phrase.charAt(0).toLowerCase() + phrase.slice(1);
    if (combo.wildcard === 'repeatOne') phrase = `Repetid la ronda anterior, pero cambiando ${combo.changed === 'zone' ? 'la zona' : combo.changed === 'style' ? 'la forma' : 'la condición'}: ` + phrase.charAt(0).toLowerCase() + phrase.slice(1);
    const round = {
      id: `${Date.now().toString(36)}-${Math.floor(this.rng.next() * 1e6).toString(36)}`,
      n: ++this.state.round, target, intensity, category, categoryName: CATEGORIES[category],
      action: combo.action, zone: combo.zone, style: combo.style, cond: combo.cond, alt: combo.alt || null,
      wildcard: combo.wildcard || null, wildcardText: combo.wildcardText || null, signature: combo.signature || null,
      seconds: c && c.seconds ? c.seconds : (c && c.id === 'esperar' ? 5 : null),
      performer, performerName: names[performer] || (performer === 0 ? 'Jugador 1' : 'Jugador 2'), partnerName: partner,
      phrase, faces: NLG.faces(combo),
      dice: this.diceFaces(combo, ceiling),
      validation: a && z && s && c ? CombinationValidator.validate({ ...combo, intensity }, this.prefs, ceiling).status : 'VALID',
    };
    this.history.push(round);
    return round;
  }
  categorize(a, z, c, intensity) {
    if (!a) return z && z.intimacy >= 3 ? 'provocacion' : 'juego';
    if (intensity >= 5) return 'intensidad';
    if (a.tags.includes('anticipacion') || (c && c.tags.includes('anticipacion'))) return 'anticipacion';
    if (['carino', 'relax', 'conexion'].includes(a.category) && z && z.intimacy >= 3) return intensity >= 4 ? 'provocacion' : 'sensualidad';
    return a.category;
  }

  /* DiceManager: carga 6 caras por dado; la primera es el resultado, el resto opciones válidas del catálogo. */
  diceFaces(combo, ceiling) {
    const a = combo.action ? ACTION[combo.action] : null, z = combo.zone ? ZONE[combo.zone] : null;
    const f = NLG.faces(combo);
    const others = (list, me) => this.rng.shuffle(list.filter(x => x !== me)).slice(0, 5);
    const pad = (arr, v) => { while (arr.length < 5) arr.push(arr.length ? arr[arr.length % Math.max(1, arr.length)] : v); return arr; };
    const actNames = ACTIONS.filter(x => x.baseIntensity <= ceiling && !this.prefs.actionDisabled(x)).map(x => x.name);
    const zoneNames = (a ? CE.zonesFor(a, this.prefs) : ZONES.filter(x => this.prefs.zoneEnabled(x))).filter(x => estimateIntensity(a || ACTION.acariciar, x) <= ceiling).map(x => f.zone === '⭐' ? x.n : x.n).map(n => n.replace(/^(el|la|los|las) /, '')).map(n => n.charAt(0).toUpperCase() + n.slice(1));
    const styleNames = (a ? CE.stylesFor(a, z) : STYLES).map(x => x.short);
    const condNames = (a ? CE.conditionsFor(a, z, combo.style ? STYLE[combo.style] : null) : CONDITIONS).map(x => x.short);
    return {
      action: [f.action, ...pad(others(actNames, f.action), f.action)],
      zone: [f.zone, ...pad(others(zoneNames, f.zone), f.zone)],
      style: [f.style, ...pad(others(styleNames, f.style), f.style)],
      cond: [f.cond, ...pad(others(condNames, f.cond), f.cond)],
    };
  }
}

export { CombinationValidator, computeIntensity, PreferenceManager, HistoryManager, NLG };
