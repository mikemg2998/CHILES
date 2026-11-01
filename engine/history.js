/* HistoryManager: memoria de sesión (solo en memoria). Enfriamientos duros + penalización suave + formas de frase recientes. */
export class HistoryManager {
  constructor() { this.rounds = []; this.recentIntensity = []; this.recentShapes = []; }
  push(round) {
    this.rounds.unshift(round); if (this.rounds.length > 40) this.rounds.pop();
    this.recentIntensity.unshift(round.intensity); if (this.recentIntensity.length > 12) this.recentIntensity.pop();
    if (round.shapeId) { this.recentShapes.unshift(round.shapeId); if (this.recentShapes.length > 12) this.recentShapes.pop(); }
  }
  last() { return this.rounds[0] || null; }
  recent(key, n) { return this.rounds.slice(0, n).map(r => r[key]).filter(Boolean); }
  cooling(key, id, n) { return this.recent(key, n).includes(id); }
  /* 1 si es nuevo; cae con cada aparición reciente (las más recientes pesan más). */
  novelty(key, id, n = 10, strength = 1) {
    let s = 0; this.rounds.slice(0, n).forEach((r, i) => { if (r[key] === id) s += (n - i) / n; });
    return 1 / (1 + 2 * strength * s);
  }
  /* azar curado por familias: la última familia pesa casi nada; una familia que lleva muchas rondas sin salir recibe un empujón */
  familyWeight(key, family, { n = 12, strength = 1.5, hunger = 8, soft = false } = {}) {
    if (!family) return 1;
    let s = 0, lastSeen = -1;
    this.rounds.slice(0, n).forEach((r, i) => { if (r.families && r.families[key] === family) { s += ((n - i) / n) ** 2; if (lastSeen < 0) lastSeen = i; } });
    let w = 1 / (1 + 3 * strength * s);
    if (!soft) { if (lastSeen === 0) w *= 0.15; else if (lastSeen === 1) w *= 0.45; }
    if (lastSeen < 0 && this.rounds.length >= hunger) w *= 1.6;
    return w;
  }
  familyCooling(key, family, n) { return !!family && this.rounds.slice(0, n).some(r => r.families && r.families[key] === family); }
  reset() { this.rounds = []; this.recentIntensity = []; this.recentShapes = []; }
}
