/* V4 · simulación de secuencias por capas. Muestra una sesión real de Intimidad (empezando vestidos) y, en cada cambio de ropa, qué
   cartas había y qué cartas hay. Primero con el catálogo real; después con dos cartas FICTICIAS THROUGH_PANTIES / THROUGH_BOXERS
   (solo para demostrar el mecanismo: no existen en la app, son CONTENT_GAP del diseñador).
   node tests/layers.js [--out=archivo.md] */
import { CARDS, CARD } from '../content/index.js';
import { card, THROUGH_GARMENT, throughGarmentOf } from '../content/schema.js';
import { GARMENT_LABEL, GARMENT_LAYERS } from '../content/body.js';
import { buildDeck } from '../engine/deck.js';
import { coverage } from '../engine/clothing.js';
import { GameEngine } from '../engine/engine.js';
import { writeFileSync } from 'node:fs';
const out = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6);
const FIX = [
  card({ id: 'FIX_TP', level: 3, status: 'APPROVED', family: 'MANUAL', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'vulva' }], clothing: { receiver: [THROUGH_GARMENT('panties')] }, durations: [30], copy: ['(FICTICIA · THROUGH_PANTIES · sin copia del diseñador)'] }),
  card({ id: 'FIX_TB', level: 3, status: 'APPROVED', family: 'MANUAL', actorRequirements: [{ part: 'fingertips' }], receiverRequirements: [{ part: 'penis' }], clothing: { receiver: [THROUGH_GARMENT('boxers')] }, durations: [30], copy: ['(FICTICIA · THROUGH_BOXERS · sin copia del diseñador)'] }),
];
const L = [`# Simulación de capas de ropa · ${new Date().toISOString().slice(0, 10)}`, ''];
const isThrough = c => c.clothing.receiver.some(q => throughGarmentOf(q));
const isDirect = c => c.clothing.receiver.includes('SKIN_ACCESS') || c.clothing.receiver.includes('UNDERWEAR_OFF') || c.clothing.receiver.includes('FULL_BODY_ACCESS');
const lower = c => c.receiverRequirements.some(r => ['vulva', 'penis', 'buttocks', 'glans', 'groin'].includes(r.part));
const chest = c => c.receiverRequirements.some(r => ['breasts', 'nipples'].includes(r.part));
const dress = s => ['top', 'bottoms', 'socks', 'bra', 'panties', 'boxers'].filter(g => s[g] === 'ON').map(g => GARMENT_LABEL[g]).join(' · ') || 'nada';
function run(cards, seed, title) {
  const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']] }, seed, level: 3 });
  const elig = p => { const a = 1 - p; return buildDeck(cards, e.context(a)).eligible.map(x => x.card); }; // cartas en las que p recibe
  const summary = p => { const el = elig(p); return `elegibles ${el.length} · THROUGH ${el.filter(isThrough).map(c => c.id).join(' ') || '—'} · acceso directo ${el.filter(c => isDirect(c) && (lower(c) || chest(c))).map(c => c.id).join(' ') || '—'}`; };
  L.push(`## ${title} (semilla ${seed})`, '', '| # | Quién | Carta | Frase | Ana lleva | Leo lleva |', '|---|---|---|---|---|---|');
  for (let i = 0; i < 40; i++) {
    if (e.pauseDue()) e.continueGuided();
    const r = e.roll(); if (!r) break;
    L.push(`| ${i + 1} | ${r.actorName}→${r.receiverName} | ${r.cardId} | ${r.phrase.replace(/\|/g, '/')} | ${dress(e.clothing[0])} | ${dress(e.clothing[1])} |`);
    if (r.undress) for (const p of r.undress.players) {
      const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (!g) continue;
      const before = summary(p); e.recordUndress(p, g); const nm = e.prefs.names[p];
      const cov = ['nipples', 'vulva', 'penis'].filter(pt => e.anatomy(p).hasTarget(pt)).map(pt => `${pt}: ${coverage(pt, e.clothing[p]).access}${coverage(pt, e.clothing[p]).by ? ' (' + GARMENT_LABEL[coverage(pt, e.clothing[p]).by] + ')' : ''}`).join(', ');
      L.push(`| | | | **${nm} se quita ${GARMENT_LABEL[g]}** (${GARMENT_LAYERS[g].layer}) → ${cov} | | |`, `| | | | antes: ${before} | | |`, `| | | | después: ${summary(p)} | | |`);
    }
  }
  L.push('');
}
/* elige semillas donde Ana se quita el pantalón y luego las panties, y la camiseta y luego el brasier */
function pick(cards, want) { for (let s = 1; s < 400; s++) { const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']] }, seed: s, level: 3 }); for (let i = 0; i < 40; i++) { if (e.pauseDue()) e.continueGuided(); const r = e.roll(); if (!r) break; if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); } } const log = e.history.recentClothingChanges.slice().reverse().filter(c => c.garment).map(c => `${c.player}:${c.garment}`); if (want.every(w => log.includes(w))) return s; } return 1; }
run(CARDS, pick(CARDS, ['1:bottoms', '1:boxers', '0:bottoms', '0:panties']), 'Secuencia 1 · catálogo real: pantalón → ropa interior → acceso directo');
run(CARDS, pick(CARDS, ['0:top', '0:bra']), 'Secuencia 2 · catálogo real: camiseta → brasier (THROUGH_BRA) → acceso directo al pecho');
run([...CARDS, ...FIX], pick([...CARDS, ...FIX], ['1:bottoms', '1:boxers', '0:bottoms', '0:panties']), 'Secuencia 3 · con dos cartas FICTICIAS THROUGH_PANTIES / THROUGH_BOXERS (no están en la app)');
const text = L.join('\n'); console.log(text); if (out) writeFileSync(out, text + '\n');
