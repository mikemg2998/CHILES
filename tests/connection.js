/* Conexión V2 · simulación: 100 sesiones × 20 cartas. Frecuencia por carta, familias, grupos de similitud, tipos, regiones,
   actor/receptor, rachas, y detección de secuencias monótonas. node tests/connection.js [--out=archivo.md] [sesiones] */
import { CARDS, CARD, APPROVED, regionOf } from '../content/index.js';
import { FAMILIES } from '../content/schema.js';
import { GameEngine } from '../engine/engine.js';
import { writeFileSync } from 'node:fs';
const out = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6);
const N = Number(process.argv.find(a => /^\d+$/.test(a)) || 100), LEN = 20;
const active = APPROVED.filter(c => c.level === 1 && !c.transition);
const count = (m, k) => { m[k] = (m[k] || 0) + 1; };
const byCard = {}, byFamily = {}, byGroup = {}, byType = {}, byRegion = {}, byActor = {}, byReceiver = {};
let total = 0, longestFamily = 0, longestGroup = 0, massage3 = 0, embrace3 = 0, verbal2 = 0, choose2 = 0, nearRepeat = 0, lenMax = 0;
const VERBAL = ['APPRECIATION', 'MEMORY'];
for (let s = 0; s < N; s++) {
  const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']] }, seed: 1000 + s, level: 1 });
  const rs = []; for (let i = 0; i < LEN; i++) { const r = e.roll(); if (!r || r.transition) break; rs.push(r); }
  let fs = 1, gs = 1;
  rs.forEach((r, i) => {
    total++; count(byCard, r.cardId); count(byFamily, r.family); count(byGroup, r.similarityGroup); count(byType, r.interactionType); count(byRegion, r.region); count(byActor, r.actorName); count(byReceiver, r.receiverName);
    if (i > 0) { fs = r.family === rs[i - 1].family ? fs + 1 : 1; gs = r.similarityGroup === rs[i - 1].similarityGroup ? gs + 1 : 1; longestFamily = Math.max(longestFamily, fs); longestGroup = Math.max(longestGroup, gs); }
    if (i >= 2 && [r, rs[i - 1], rs[i - 2]].every(x => x.similarityGroup === 'MASSAGE')) massage3++;
    if (i >= 2 && [r, rs[i - 1], rs[i - 2]].every(x => x.similarityGroup === 'EMBRACE')) embrace3++;
    if (i >= 1 && VERBAL.includes(r.similarityGroup) && VERBAL.includes(rs[i - 1].similarityGroup)) verbal2++;
    if (i >= 1 && r.interactionType === 'CHOOSE' && rs[i - 1].interactionType === 'CHOOSE') choose2++;
    if (i >= 1 && rs.slice(Math.max(0, i - 4), i).some(x => x.cardId === r.cardId)) nearRepeat++;
  });
}
const pct = n => (100 * n / total).toFixed(1) + ' %';
const table = (title, m, label = k => k) => ['', `### ${title}`, '', ...Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${label(k)} | ${v} | ${pct(v)} |`)];
const L = [`# Conexión V2 · simulación ${N} sesiones × ${LEN} cartas (${new Date().toISOString().slice(0, 10)})`, '', `Cartas activas: ${active.length} (${CARDS.filter(c => c.level === 1 && c.status === 'REJECTED').map(c => c.id).join(', ')} REJECTED). Cartas jugadas: ${total}. Esperado por carta si fuera uniforme: ${(total / active.length).toFixed(1)}.`];
const never = active.filter(c => !byCard[c.id]).map(c => c.id);
const sorted = active.map(c => [c.id, byCard[c.id] || 0]).sort((a, b) => b[1] - a[1]);
const mean = total / active.length;
L.push('', `## Alcanzables: ${active.length - never.length} de ${active.length}${never.length ? ' · nunca salieron: ' + never.join(' ') : ''}`, '', `Más frecuentes: ${sorted.slice(0, 5).map(([id, v]) => `${id} ${v}`).join(' · ')} · menos frecuentes: ${sorted.slice(-5).map(([id, v]) => `${id} ${v}`).join(' · ')}`, '', `Demasiado frecuentes (> 1,8× la media): ${sorted.filter(([, v]) => v > 1.8 * mean).map(([id, v]) => `${id} ${v}`).join(' ') || 'ninguna'} · prácticamente invisibles (< 0,4× la media): ${sorted.filter(([, v]) => v < 0.4 * mean).map(([id, v]) => `${id} ${v}`).join(' ') || 'ninguna'}`);
L.push('', '## Secuencias monótonas', '', `| Racha más larga de la misma familia | ${longestFamily} |`, `| Racha más larga del mismo grupo de similitud | ${longestGroup} |`, `| 3 MASSAGE seguidos | ${massage3} |`, `| 3 EMBRACE seguidos | ${embrace3} |`, `| 2+ VERBAL seguidos | ${verbal2} |`, `| 2+ CHOOSE seguidos | ${choose2} |`, `| Repetición exacta dentro de 4 cartas | ${nearRepeat} (${pct(nearRepeat)}) |`);
L.push(...table('selectionFrequencyByCard', byCard), ...table('family', byFamily, k => FAMILIES[k] || k), ...table('similarityGroup', byGroup), ...table('interactionType', byType), ...table('bodyRegion', byRegion), ...table('actor', byActor), ...table('receiver', byReceiver));
const text = L.join('\n'); console.log(text); if (out) writeFileSync(out, text + '\n');
