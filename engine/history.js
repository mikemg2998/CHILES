/* HISTORY. Memoria de la sesión (solo en memoria): qué cartas, familias, variantes, lados, limitaciones, actores y
   receptores han salido, y en Intimidad qué cambios de ropa, cartas UNDRESS y posicionales. Todo son PESOS, no vetos:
   lo reciente pesa menos, lo que lleva mucho sin salir pesa un poco más. */
export class History {
  constructor() { this.reset(); }
  reset() { this.rounds = []; this.recentClothingChanges = []; }
  push(round) { this.rounds.unshift(round); if (this.rounds.length > 60) this.rounds.pop(); }
  last() { return this.rounds[0] || null; }
  get recentInteractionIds() { return this.rounds.map(r => r.cardId); }
  get recentFamilies() { return this.rounds.map(r => r.family); }
  get recentVariants() { return this.rounds.map(r => r.variantId).filter(Boolean); }
  get recentSides() { return this.rounds.map(r => r.side).filter(Boolean); }
  get recentPlayConstraints() { return this.rounds.map(r => r.playConstraint).filter(Boolean); }
  get recentActors() { return this.rounds.map(r => r.actor); }
  get recentReceivers() { return this.rounds.map(r => r.receiver); }
  get recentUndressCards() { return this.rounds.filter(r => r.interactionType === 'UNDRESS'); }
  get recentPositionalCards() { return this.rounds.filter(r => r.interactionType === 'POSITIONAL'); }
  recordClothingChange(change) { this.recentClothingChanges.unshift(change); if (this.recentClothingChanges.length > 20) this.recentClothingChanges.pop(); }
  /* lados recientes para esta carta y para estas partes del cuerpo (independientemente de la carta) */
  recentSidesByInteraction(cardId, n = 6) { return this.rounds.filter(r => r.cardId === cardId && r.side).slice(0, n).map(r => r.side); }
  recentSidesByBodyPart(parts, n = 6) { return this.rounds.filter(r => r.side && r.parts && r.parts.some(p => parts.includes(p))).slice(0, n).map(r => r.side); }
  /* 1 si es nuevo; cae con cada aparición reciente (las más recientes pesan más) */
  novelty(key, id, n = 12, strength = 1) { let s = 0; this.rounds.slice(0, n).forEach((r, i) => { if (r[key] === id) s += (n - i) / n; }); return 1 / (1 + 2 * strength * s); }
  /* familia: la última pesa casi nada; una que lleva muchas cartas sin salir recibe un empujón */
  familyWeight(family, { n = 10, strength = 1.2, hunger = 8 } = {}) {
    let s = 0, lastSeen = -1;
    this.rounds.slice(0, n).forEach((r, i) => { if (r.family === family) { s += ((n - i) / n) ** 2; if (lastSeen < 0) lastSeen = i; } });
    let w = 1 / (1 + 3 * strength * s);
    if (lastSeen === 0) w *= 0.12; else if (lastSeen === 1) w *= 0.4;
    if (lastSeen < 0 && this.rounds.length >= hunger) w *= 1.5;
    return w;
  }
  sinceCard(cardId) { const i = this.rounds.findIndex(r => r.cardId === cardId); return i < 0 ? Infinity : i; }
  sinceType(type) { const i = this.rounds.findIndex(r => r.interactionType === type); return i < 0 ? Infinity : i; }
}
