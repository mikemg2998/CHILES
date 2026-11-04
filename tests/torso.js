/* Simulación de los dos recorridos del torso con el catálogo real: CAMISETA → PIEL (bra NOT_WORN) y CAMISETA → BRASIER → PIEL.
   I25 (THROUGH_TOP, aprobada) · I21 (THROUGH_BRA) · I03 I08 I09 I10 I17 (acceso directo).   node tests/torso.js [--out=archivo.md] */
import { CARDS, CARD, APPROVED } from '../content/index.js';
import { buildDeck } from '../engine/deck.js';
import { accessMode } from '../engine/clothing.js';
import { GameEngine } from '../engine/engine.js';
import { writeFileSync } from 'node:fs';
const out = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6);
const ALL = CARDS;
const NAKED = { top: 'OFF', bottoms: 'OFF', socks: 'OFF', bra: 'OFF', panties: 'OFF', boxers: 'OFF' };
const isChest = c => c.receiverRequirements.some(r => ['breasts', 'nipples'].includes(r.part));
const L = [`# Simulación de capas del torso · ${new Date().toISOString().slice(0, 10)}`, '', 'Leo actúa, Ana (vulva · senos) recibe. Pantalón, panties y calcetines fuera para aislar camiseta y brasier.', ''];
L.push('## Matriz de estados (Leo → Ana)', '', '| Estado | top | bra | access mode | THROUGH_TOP | THROUGH_BRA | Acceso directo (pecho) | Bloqueadas de pecho |', '|---|---|---|---|---|---|---|---|');
const M = [['A', 'ON', 'ON'], ['B', 'OFF', 'ON'], ['C', 'ON', 'NOT_WORN'], ['D', 'OFF', 'NOT_WORN'], ['E', 'OFF', 'OFF']];
for (const [k, top, bra] of M) {
  const st = { ...NAKED, top, bra }; const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']] }, seed: 1, level: 3 }); e.clothing = [st, { ...NAKED }];
  const d = buildDeck(ALL, e.context(1)); const el = d.eligible.map(x => x.card).filter(isChest);
  const tt = el.filter(c => c.clothing.receiver.includes('THROUGH_TOP')).map(c => c.id).join(' ') || '—', tb = el.filter(c => c.clothing.receiver.includes('THROUGH_BRA')).map(c => c.id).join(' ') || '—';
  const direct = el.filter(c => c.clothing.receiver.includes('SKIN_ACCESS')).map(c => c.id).join(' ') || '—';
  const blocked = d.rejected.filter(r => CARD[r.id].level === 3 && isChest(CARD[r.id]) && !r.reason.startsWith('STATUS')).map(r => `${r.id} (${r.reason.replace('CLOTHING:receiver:', '')})`).join(', ');
  L.push(`| ${k} | ${top} | ${bra} | ${accessMode('nipples', st)} | ${tt} | ${tb} | ${direct} | ${blocked} |`);
}
function run(title, start, seed) {
  const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']] }, seed, level: 3 }); e.clothing = [{ ...start }, { ...NAKED }];
  L.push('', `## ${title} (semilla ${seed})`, '', `Inicio: top ${start.top} · bra ${start.bra} → ${accessMode('nipples', e.clothing[0])}`, '');
  const chestNow = () => buildDeck(ALL, e.context(1)).eligible.map(x => x.card).filter(isChest).map(c => c.id).join(' ') || 'ninguna';
  L.push(`Cartas de pecho elegibles ahora: ${chestNow()} · brasier quitable: ${e.removable(0).includes('bra') ? 'sí' : 'no'}`);
  for (let i = 0; i < 60; i++) {
    const r = e.roll(); if (!r) break; 
    let note = r.cardId === 'I25' || r.cardId === 'I21' ? ` «${r.phrase}» (${r.seconds} s)` : '';
    if (r.undress) for (const p of r.undress.players) { const opts = e.removable(p); const g = r.undress.garment === 'ANY' ? opts[0] : r.undress.garment; if (g && e.recordUndress(p, g)) note = ` → ${['Ana', 'Leo'][p]} se quita ${g} (opciones ofrecidas: ${opts.join(' ') || 'ninguna'}). Ahora ${accessMode('nipples', e.clothing[0])}; pecho elegible: ${chestNow()}; brasier quitable: ${e.removable(0).includes('bra') ? 'sí' : 'no'}`; }
    L.push(`${String(r.n).padStart(2)}. ${r.actorName} → ${r.cardId}${note}`);
    if (e.clothing[0].top !== 'ON' && e.clothing[0].bra !== 'ON' && i > 3 && !note) { const k = L.length; if (L.slice(k - 4, k).every(x => !x.includes('→ Ana se quita'))) break; }
  }
  L.push('', `Estado final: top ${e.clothing[0].top} · bra ${e.clothing[0].bra} · ${accessMode('nipples', e.clothing[0])}`);
}
run('Recorrido 1 · CAMISETA → PIEL (Ana entró sin brasier)', { ...NAKED, top: 'ON', bra: 'NOT_WORN' }, 7);
run('Recorrido 2 · CAMISETA → BRASIER → PIEL', { ...NAKED, top: 'ON', bra: 'ON' }, 7);
const text = L.join('\n'); console.log(text); if (out) writeFileSync(out, text + '\n');
