/* HistoryManager: memoria de sesión. Enfriamientos duros + penalización suave. */
export class HistoryManager {
  constructor() { this.rounds = []; this.recentIntensity = []; }
  push(round) { this.rounds.unshift(round); if (this.rounds.length > 40) this.rounds.pop(); this.recentIntensity.unshift(round.intensity); if (this.recentIntensity.length > 12) this.recentIntensity.pop(); }
  last() { return this.rounds[0] || null; }
  recent(key, n) { return this.rounds.slice(0, n).map(r => r[key]).filter(Boolean); }
  /* true si el elemento salió en las últimas n rondas */
  cooling(key, id, n) { return this.recent(key, n).includes(id); }
  /* 1 si es nuevo; cae con cada aparición reciente (las más recientes pesan más). */
  novelty(key, id, n = 10, strength = 1) {
    let s = 0; this.rounds.slice(0, n).forEach((r, i) => { if (r[key] === id) s += (n - i) / n; });
    return 1 / (1 + 2 * strength * s);
  }
  reset() { this.rounds = []; this.recentIntensity = []; }
}
