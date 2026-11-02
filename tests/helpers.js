import { GameEngine } from '../engine/engine.js';
export const DRESSED = () => ({ top: 'ON', bottoms: 'ON', socks: 'ON', underwear: 'ON' });
export const NAKED = () => ({ top: 'OFF', bottoms: 'OFF', socks: 'OFF', underwear: 'OFF' });
export const mk = (o = {}) => { const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']], ...(o.prefs || {}) }, seed: o.seed ?? 42, level: o.level ?? 1 }); if (o.clothing) e.clothing = o.clothing.map(s => ({ ...s })); return e; };
/* juega n cartas aplicando UNDRESS como lo haría la interfaz (primera prenda posible) */
export function play(e, n, { undress = true } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    if (e.pauseDue()) e.continueGuided();
    const r = e.roll(); if (!r) break; out.push(r);
    if (undress && r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
  }
  return out;
}
