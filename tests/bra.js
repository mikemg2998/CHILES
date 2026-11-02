/* Simulación de los tres estados de pecho (Leo actúa, Ana vulva · senos recibe), con el resto de la ropa fuera para aislar el pecho.
   node tests/bra.js [--out=archivo.md] */
import { CARDS, CARD, APPROVED } from '../content/index.js';
import { buildDeck } from '../engine/deck.js';
import { chestAccess } from '../engine/clothing.js';
import { GameEngine } from '../engine/engine.js';
import { writeFileSync } from 'node:fs';
const out = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6);
const NAKED = { top: 'OFF', bottoms: 'OFF', socks: 'OFF', bra: 'OFF', panties: 'OFF', boxers: 'OFF' };
const states = [['TOP ON + BRA ON', { ...NAKED, top: 'ON', bra: 'ON' }], ['TOP OFF + BRA ON', { ...NAKED, bra: 'ON' }], ['TOP OFF + BRA OFF', { ...NAKED }]];
const isChest = c => c.receiverRequirements.some(r => ['breasts', 'nipples'].includes(r.part));
const isNipple = c => c.receiverRequirements.some(r => r.part === 'nipples');
const L = [`# Simulación de estados de pecho · ${new Date().toISOString().slice(0, 10)}`, '', 'Leo actúa, Ana (vulva · senos) recibe. Pantalón, panties y calcetines fuera para aislar el efecto de camiseta y brasier. 500 cartas por estado en las que Leo actúa sobre Ana, sin UNDRESS.', ''];
L.push('## Catálogo de pecho (Intimidad, APPROVED)', '', '| Carta | Target | Ropa (recibe) | Lados | Familia |', '|---|---|---|---|---|');
for (const c of APPROVED.filter(c => c.level === 3 && isChest(c))) L.push(`| ${c.id} | ${c.receiverRequirements.map(r => r.part).join(', ')} | ${c.clothing.receiver.join(' · ')} | ${(c.allowedSides || ['—']).join('/')} | ${c.family} |`);
for (const [name, recv] of states) {
  const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']] }, seed: 11, level: 3 });
  e.clothing = [{ ...recv }, { ...NAKED }];
  const d = buildDeck(CARDS, e.context(1));
  const el = d.eligible.map(x => x.card), rj = d.rejected.filter(r => CARD[r.id].level === 3 && CARD[r.id].status === 'APPROVED');
  L.push('', `## ${name} · acceso al pecho: ${chestAccess(recv)}`, '', `Elegibles (${el.length}): ${el.map(c => c.id).join(' ')}`, '', `Bloqueadas (${rj.length}): ${rj.map(r => `${r.id} ${r.reason}`).join(' · ')}`, '',
    `Cartas CHEST elegibles: ${el.filter(isChest).map(c => c.id).join(' ') || 'ninguna'} · NIPPLE: ${el.filter(isNipple).map(c => c.id).join(' ') || 'ninguna'} · THROUGH_BRA: ${el.filter(c => c.clothing.receiver.includes('THROUGH_BRA')).map(c => c.id).join(' ') || 'ninguna'}`);
  const counts = {}, sides = {}; let n = 0;
  for (let i = 0; n < 500 && i < 3000; i++) { const r = e.roll(); if (!r || r.transition || r.actor !== 1) continue; n++; // solo las cartas en las que Leo actúa sobre Ana
    counts[r.cardId] = (counts[r.cardId] || 0) + 1; if (r.side && isChest(CARD[r.cardId])) sides[r.side] = (sides[r.side] || 0) + 1; }
  const chest = Object.entries(counts).filter(([id]) => isChest(CARD[id])).sort((a, b) => b[1] - a[1]);
  L.push('', `Frecuencia observada (${n} cartas): pecho ${chest.reduce((a, [, v]) => a + v, 0)} (${(100 * chest.reduce((a, [, v]) => a + v, 0) / n).toFixed(1)} %) → ${chest.map(([id, v]) => `${id} ${v}`).join(' · ') || 'ninguna'}`, `Lados en cartas de pecho: ${Object.entries(sides).map(([s, v]) => `${s} ${v}`).join(' · ') || '—'}`,
    `Todas: ${Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([id, v]) => `${id} ${v}`).join(' · ')}`);
}
const text = L.join('\n'); console.log(text); if (out) writeFileSync(out, text + '\n');
