/* WeightedRandomSelector: azar con pesos y semilla opcional (para pruebas reproducibles). */
export class Rng {
  constructor(seed) { this.seed = seed == null ? null : seed >>> 0; }
  next() {
    if (this.seed == null) return Math.random();
    // mulberry32
    let t = (this.seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  /* items: [{item, weight}] */
  weighted(items) {
    const total = items.reduce((s, x) => s + Math.max(0, x.weight), 0);
    if (total <= 0) return items.length ? items[Math.floor(this.next() * items.length)].item : null;
    let r = this.next() * total;
    for (const x of items) { r -= Math.max(0, x.weight); if (r <= 0) return x.item; }
    return items[items.length - 1].item;
  }
}
