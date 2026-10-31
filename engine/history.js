/* HistoryManager: memoria de la partida y multiplicador de novedad. */
export class HistoryManager {
  constructor(size = 8) {
    this.size = size;
    this.recentActions = []; this.recentZones = []; this.recentStyles = []; this.recentConditions = [];
    this.recentIntensity = []; this.recentCategories = []; this.recentSignatures = []; this.rounds = [];
  }
  push(round) {
    const add = (arr, v) => { if (v != null) { arr.unshift(v); if (arr.length > this.size) arr.pop(); } };
    add(this.recentActions, round.action); add(this.recentZones, round.zone); add(this.recentStyles, round.style);
    add(this.recentConditions, round.cond); add(this.recentIntensity, round.intensity); add(this.recentCategories, round.category);
    if (round.signature) add(this.recentSignatures, round.signature);
    this.rounds.unshift(round); if (this.rounds.length > 30) this.rounds.pop();
  }
  /* 1 si no ha salido; baja con cada aparición reciente (las más recientes pesan más). Nunca llega a 0. */
  novelty(list, id, strength = 1) {
    let n = 0;
    list.forEach((v, i) => { if (v === id) n += (this.size - i) / this.size; });
    return 1 / (1 + 1.6 * strength * n);
  }
  last() { return this.rounds[0] || null; }
  reset() { this.constructor.call(this, this.size); }
}
