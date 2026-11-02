/* SIMULADOR (§68). node tests/simulate.js [sesiones] [--out=fichero.md]
   ≥100 sesiones solo Conexión · 100 Conexión→Deseo · 100 Conexión→Deseo→Intimidad · sesiones largas (≥50 cartas) en
   Intimidad con anatomías y estados asimétricos. Audita repetición, familias, lateralidad, actores, PlayConstraints,
   ropa, UNDRESS, disponibilidad, mazos vacíos, anatomía, propiedad, duración, variantes, cartas bloqueadas y pausa. */
import { writeFileSync } from 'node:fs';
import { CARDS, CARD, APPROVED } from '../content/index.js';
import { GameEngine } from '../engine/engine.js';
import { buildDeck } from '../engine/deck.js';
import { FAMILIES } from '../content/schema.js';

const N = Number(process.argv.find(a => /^\d+$/.test(a)) || 100);
const OUT = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6);
const ANATOMIES = [[['vulva', 'senos'], ['pene']], [['pene'], ['vulva', 'senos']], [['vulva', 'senos'], ['vulva', 'senos']], [['pene'], ['pene']], [['vulva'], ['pene', 'senos']], [[], []]];
const CLOTH = [{ top: 'ON', bottoms: 'ON', socks: 'ON', bra: 'ON', panties: 'ON', boxers: 'ON' }, { top: 'ON', bottoms: 'ON', socks: 'NONE', bra: 'ON', panties: 'ON', boxers: 'ON' }, { top: 'OFF', bottoms: 'ON', socks: 'ON', bra: 'ON', panties: 'ON', boxers: 'ON' }, { top: 'OFF', bottoms: 'OFF', socks: 'OFF', bra: 'OFF', panties: 'ON', boxers: 'ON' }];
const problems = [], stats = { sessions: 0, cards: 0, backToBack: 0, within5: 0, byLevel: {}, family: {}, side: {}, constraint: {}, variant: {}, duration: {}, actors: [0, 0], undress: 0, intimacy: 0, empty: 0, transitions: 0, pauses: [], clothingChanges: 0, asymmetricRounds: 0, neverSeen: new Set(APPROVED.map(c => c.id)), typeCount: {}, bands: {}, directionEmpty: {} };
const inc = (m, k) => { m[k] = (m[k] || 0) + 1; };

function check(e, r) {
  if (r.transition) { stats.transitions++; return; }
  const c = CARD[r.cardId];
  if (!c || c.status !== 'APPROVED') problems.push(`carta no aprobada ${r.cardId}`);
  const rec = e.anatomy(r.receiver), act = e.anatomy(r.actor);
  for (const p of r.parts) if (!rec.hasTarget(p)) problems.push(`${r.cardId}: ${p} no existe en quien recibe`);
  const v = r.variantId ? c.variants.find(x => x.id === r.variantId) : null;
  for (const t of ((v && v.actorRequirements) || c.actorRequirements).map(x => x.part)) if (!act.hasTool(t)) problems.push(`${r.cardId}: ${t} no existe en quien actúa`);
  if (v && v.status !== 'APPROVED') problems.push(`${r.cardId}: variante ${v.id} no aprobada`);
  if (r.side && !(c.allowedSides || []).includes(r.side)) problems.push(`${r.cardId}: lado ${r.side} no permitido`);
  if (!r.side && c.allowedSides) problems.push(`${r.cardId}: sin lado`);
  if (r.playConstraint && !(c.playConstraints || []).includes(r.playConstraint)) problems.push(`${r.cardId}: limitación ${r.playConstraint} no aprobada`);
  if (r.seconds != null && !c.durations.includes(r.seconds)) problems.push(`${r.cardId}: duración ${r.seconds}`);
  if (r.seconds == null && c.timerMode !== 'NO_TIMER') problems.push(`${r.cardId}: sin tiempo`);
  if (!r.phrase || /\{[RA]\}/.test(r.phrase)) problems.push(`${r.cardId}: frase sin realizar`);
  if (r.level === 2 && (r.undress || c.clothing.receiver.includes('SKIN_ACCESS'))) problems.push(`${r.cardId}: Deseo con ropa fuera`);
  if (r.level !== c.level) problems.push(`${r.cardId}: nivel ${r.level} ≠ ${c.level}`);
  const again = buildDeck([c], e.context(r.actor)); if (!again.eligible.length) problems.push(`${r.cardId}: no pasa el filtro tras salir (${again.rejected[0].reason})`);
}
function session(levels, { anatomy, clothing, seed, undressPolicy = 'first' }) {
  const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: anatomy }, seed, level: levels[0][0] });
  if (clothing) e.clothing = clothing.map(s => ({ ...s }));
  const rounds = []; stats.sessions++;
  for (const [L, n] of levels) {
    if (L !== e.level()) { e.setLevel(L); }
    for (let i = 0; i < n; i++) {
      if (e.pauseDue()) { stats.pauses.push(e.session.intimacyCardCount); e.continueGuided(); }
      const r = e.roll(); if (!r) { problems.push('roll devolvió null'); break; }
      if (i % 9 === 4) e.feedback('like');
      check(e, r); rounds.push(r); stats.cards++; inc(stats.byLevel, r.level); inc(stats.family, FAMILIES[r.family]); inc(stats.typeCount, r.interactionType);
      if (r.side) inc(stats.side, r.side); if (r.playConstraint) inc(stats.constraint, r.playConstraint); if (r.variantId) inc(stats.variant, `${r.cardId}/${r.variantId}`); inc(stats.duration, r.seconds ?? 'sin tiempo');
      stats.actors[r.actor]++; stats.neverSeen.delete(r.cardId);
      if (r.level === 3) { stats.intimacy++; inc(stats.bands, e.clothingBand()); if (JSON.stringify(e.clothing[0]) !== JSON.stringify(e.clothing[1])) stats.asymmetricRounds++; }
      if (r.undress) { stats.undress++; for (const p of r.undress.players) { const opts = e.removable(p); const g = r.undress.garment === 'ANY' ? (undressPolicy === 'first' ? opts[0] : opts[opts.length - 1]) : r.undress.garment; if (g && e.recordUndress(p, g)) stats.clothingChanges++; } }
      if (r.transition) { stats.empty++; const k = `${L} · ${JSON.stringify(anatomy)} · ${JSON.stringify(e.clothing)}`; inc(stats.directionEmpty, k); }
    }
  }
  for (let i = 1; i < rounds.length; i++) { if (rounds[i].cardId === rounds[i - 1].cardId && !rounds[i].transition) stats.backToBack++; if (rounds.slice(Math.max(0, i - 5), i).some(x => x.cardId === rounds[i].cardId) && !rounds[i].transition) stats.within5++; }
  return rounds;
}
let seed = 1;
for (let s = 0; s < N; s++) session([[1, 20]], { anatomy: ANATOMIES[s % ANATOMIES.length], seed: seed++ });
for (let s = 0; s < N; s++) session([[1, 8], [2, 16]], { anatomy: ANATOMIES[s % ANATOMIES.length], seed: seed++ });
for (let s = 0; s < N; s++) session([[1, 6], [2, 8], [3, 22]], { anatomy: ANATOMIES[s % ANATOMIES.length], clothing: [CLOTH[s % 4], CLOTH[(s * 3) % 4]], seed: seed++, undressPolicy: s % 2 ? 'first' : 'last' });
for (let s = 0; s < Math.max(10, N / 5); s++) session([[1, 5], [2, 10], [3, 50]], { anatomy: ANATOMIES[s % ANATOMIES.length], seed: seed++ });

const pct = (a, b) => b ? (100 * a / b).toFixed(1) + ' %' : '–';
const table = m => Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} | ${pct(v, Object.values(m).reduce((x, y) => x + y, 0))} |`).join('\n');
const unreviewed = CARDS.filter(c => c.status !== 'APPROVED' && !c.transition).map(c => c.id);
const pauseHist = {}; for (const p of stats.pauses) inc(pauseHist, p);
const md = `# Simulación · cartas curadas (${new Date().toISOString().slice(0, 10)})

Sesiones: ${stats.sessions} (${N} solo Conexión · ${N} Conexión→Deseo · ${N} Conexión→Deseo→Intimidad · ${Math.max(10, N / 5)} largas de 65 cartas) · cartas jugadas: ${stats.cards}
Anatomías rotadas: ${ANATOMIES.map(a => JSON.stringify(a)).join(' · ')} · estados de ropa iniciales rotados: 4 (incluidos asimétricos).

## Resultado
${problems.length ? '✗ PROBLEMAS: ' + problems.length + '\n' + [...new Set(problems)].slice(0, 40).map(p => '- ' + p).join('\n') : '✓ Sin problemas estructurales: anatomía, propiedad, ropa, lado, limitación, duración, nivel, variante y filtro posterior correctos en todas las cartas.'}

## Repetición
| Métrica | Valor |
|---|---|
| Misma carta seguida | ${stats.backToBack} (${pct(stats.backToBack, stats.cards)}) |
| Misma carta en las 5 anteriores | ${stats.within5} (${pct(stats.within5, stats.cards)}) |
| Mazo vacío (transición neutra) | ${stats.empty} (${pct(stats.empty, stats.cards)}) |

## Por nivel
${table(stats.byLevel)}

## Familias
| Familia | Cartas | % |
|---|---|---|
${table(stats.family)}

## Tipos
${table(stats.typeCount)}

## Lateralidad
${table(stats.side)}

## Actores
Jugador 1: ${stats.actors[0]} · Jugador 2: ${stats.actors[1]} (${pct(stats.actors[0], stats.cards)} / ${pct(stats.actors[1], stats.cards)})

## PlayConstraints (D01)
${table(stats.constraint)}

## Variantes
${table(stats.variant)}

## Duraciones
${table(stats.duration)}

## Intimidad
- Cartas en Intimidad: ${stats.intimacy} · UNDRESS: ${stats.undress} (${pct(stats.undress, stats.intimacy)}) · cambios de ropa aplicados: ${stats.clothingChanges}
- Rondas con estados de ropa asimétricos: ${stats.asymmetricRounds} (${pct(stats.asymmetricRounds, stats.intimacy)})
- Bandas internas (consecuencia del estado real): ${Object.entries(stats.bands).map(([k, v]) => `${k} ${v}`).join(' · ')}
- Pausa de continuidad: ${stats.pauses.length} pausas; en la carta ${Object.entries(pauseHist).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k} (${v})`).join(', ')}

## Mazos vacíos por situación
${Object.keys(stats.directionEmpty).length ? Object.entries(stats.directionEmpty).map(([k, v]) => `- ${v} × ${k}`).join('\n') : '- ninguno'}

## Cartas aprobadas que nunca salieron
${[...stats.neverSeen].length ? [...stats.neverSeen].map(id => `- ${id}`).join('\n') : '- ninguna'}

## Cartas fuera de producción (UNREVIEWED)
${unreviewed.map(id => `- ${id}: ${CARD[id].notes || ''}`).join('\n')}
`;
console.log(md);
if (OUT) writeFileSync(OUT, md);
if (problems.length) process.exit(1);
