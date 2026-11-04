import { GameEngine } from '../engine/engine.js';
/* estados con todas las prendas; el motor deja en NONE las que no aplican a la anatomía del jugador */
export const DRESSED = () => ({ top: 'ON', bottoms: 'ON', socks: 'ON', bra: 'ON', panties: 'ON', boxers: 'ON' });
export const NAKED = () => ({ top: 'OFF', bottoms: 'OFF', socks: 'OFF', bra: 'OFF', panties: 'OFF', boxers: 'OFF' });
export const mk = (o = {}) => { const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']], ...(o.prefs || {}) }, seed: o.seed ?? 42, level: o.level ?? 1 }); if (o.clothing) e.clothing = o.clothing.map(s => ({ ...s })); return e; };
/* juega n cartas aplicando UNDRESS como lo haría la interfaz (primera prenda posible) */
export function play(e, n, { undress = true } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = e.roll(); if (!r) break; out.push(r);
    if (undress && r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
  }
  return out;
}
