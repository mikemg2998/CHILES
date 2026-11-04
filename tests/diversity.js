/* AUDITORÍA DE DIVERSIDAD CORPORAL (corrección V3). node tests/diversity.js [--out=fichero.md]
   (a) catálogo: cartas APPROVED por región y elegibles con acceso completo · (b) 1 000 selecciones de Intimidad con acceso
   máximo compatible con cada configuración · (c) 100 sesiones reales de Intimidad empezando vestidos. */
import { writeFileSync } from 'node:fs';
import { CARDS, CARD, APPROVED, regionOf, partsOf, BODY_REGIONS } from '../content/index.js';
import { BODY_PARTS } from '../content/body.js';
import { FAMILIES } from '../content/schema.js';
import { GameEngine } from '../engine/engine.js';
import { buildDeck } from '../engine/deck.js';
import { fullAccess } from '../engine/clothing.js';

const OUT = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6);
const inc = (m, k, d = 1) => { m[k] = (m[k] || 0) + d; };
const pct = (a, b) => b ? (100 * a / b).toFixed(1) + ' %' : '–';
const table = (m, total = Object.values(m).reduce((x, y) => x + y, 0)) => Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} | ${pct(v, total)} |`).join('\n');
const CONFIGS = [[['vulva', 'senos'], ['pene']], [['pene'], ['vulva', 'senos']], [['vulva', 'senos'], ['vulva', 'senos']], [['pene'], ['pene']]];
const mk = (anatomy, seed, level = 3) => new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: anatomy }, seed, level });

/* (a) catálogo */
const approvedByRegion = {}, eligibleByRegion = {};
for (const c of APPROVED.filter(c => c.level === 3)) inc(approvedByRegion, c.region);
{ const e = mk(CONFIGS[0], 1); e.clothing = [fullAccess(e.anatomy(0).declared), fullAccess(e.anatomy(1).declared)];
  const seen = new Set(); for (const a of [0, 1]) for (const x of buildDeck(CARDS, e.context(a)).eligible) seen.add(x.card.id);
  for (const id of seen) inc(eligibleByRegion, CARD[id].region); }

/* (b) 1 000 selecciones con acceso máximo */
const sel = { region: {}, target: {}, family: {}, actor: {}, receiver: {}, side: {}, card: {}, n: 0 };
for (let i = 0; i < CONFIGS.length; i++) {
  const e = mk(CONFIGS[i], 100 + i); e.clothing = [fullAccess(e.anatomy(0).declared), fullAccess(e.anatomy(1).declared)];
  for (let k = 0; k < 250; k++) { const r = e.roll(); if (r.transition) continue; sel.n++; const c = CARD[r.cardId], v = r.variantId ? c.variants.find(x => x.id === r.variantId) : null; inc(sel.region, regionOf(c, v)); for (const p of partsOf(c, v)) inc(sel.target, p); inc(sel.family, FAMILIES[c.family]); inc(sel.actor, r.actorName); inc(sel.receiver, r.receiverName); if (r.side) inc(sel.side, r.side); inc(sel.card, r.cardId); }
}

/* (c) 100 sesiones reales */
const ses = { uniqueRegions: [], uniqueTargets: [], uniqueFamilies: [], streak: [], intimateShare: [], unlockDelay: [], repeats5: 0, cards: 0, region: {}, unlockRounds: [] };
for (let s = 0; s < 100; s++) {
  const e = mk(CONFIGS[s % CONFIGS.length], 1000 + s);
  const regions = new Set(), targets = new Set(), fams = new Set(); let streak = 0, best = 0, lastR = null, intimate = 0, n = 0; const ids = [];
  const pending = []; // {ids: Set, round}
  for (let k = 0; k < 40; k++) {
    const r = e.roll(); if (r.transition) continue; n++; ids.push(r.cardId);
    const c = CARD[r.cardId], v = r.variantId ? c.variants.find(x => x.id === r.variantId) : null, reg = regionOf(c, v);
    regions.add(reg); for (const p of partsOf(c, v)) targets.add(p); fams.add(c.family); if (reg === 'INTIMATE') intimate++; inc(ses.region, reg);
    if (reg === lastR) streak++; else streak = 1; lastR = reg; best = Math.max(best, streak);
    for (const pnd of pending) if (pnd.ids.has(r.cardId) && pnd.hit == null) pnd.hit = n - pnd.round;
    if (ids.length > 5 && ids.slice(-6, -1).includes(r.cardId)) ses.repeats5++;
    if (r.undress) { const before = new Set([0, 1].flatMap(a => buildDeck(CARDS, e.context(a)).eligible.map(x => x.card.id)));
      for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
      const after = new Set([0, 1].flatMap(a => buildDeck(CARDS, e.context(a)).eligible.map(x => x.card.id)));
      const fresh = new Set([...after].filter(x => !before.has(x))); if (fresh.size) { pending.push({ ids: fresh, round: n, hit: null }); ses.unlockRounds.push(n); } }
  }
  ses.cards += n; ses.uniqueRegions.push(regions.size); ses.uniqueTargets.push(targets.size); ses.uniqueFamilies.push(fams.size); ses.streak.push(best); ses.intimateShare.push(intimate / n);
  for (const p of pending) if (p.hit != null) ses.unlockDelay.push(p.hit);
}
const avg = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : '–';
const gap = r => { const ap = approvedByRegion[r] || 0, el = eligibleByRegion[r] || 0, ob = sel.region[r] || 0; return ap < 3 || el < 2 ? 'CONTENT_GAP' : ob / sel.n < 0.03 ? 'WEIGHTING' : 'ok'; };
const md = `# Auditoría de diversidad corporal · Intimidad (${new Date().toISOString().slice(0, 10)})

## Catálogo: cartas APPROVED de Intimidad por región
| Región | APPROVED | Elegibles con acceso completo | Frecuencia observada (1 000 selecciones) | ¿Hueco? |
|---|---|---|---|---|
${BODY_REGIONS.map(r => `| ${r} | ${approvedByRegion[r] || 0} | ${eligibleByRegion[r] || 0} | ${pct(sel.region[r] || 0, sel.n)} | ${gap(r)} |`).join('\n')}

## 1 000 selecciones con acceso corporal máximo (4 configuraciones × 250)
### Región
${table(sel.region, sel.n)}
### Target (una carta puede tocar varios)
${table(sel.target)}
### Familia
${table(sel.family, sel.n)}
### Carta
${table(sel.card, sel.n)}
### Actor / receptor
${table(sel.actor, sel.n)}
${table(sel.receiver, sel.n)}
### Lado
${table(sel.side)}

## 100 sesiones reales de Intimidad (40 cartas, empezando vestidos, UNDRESS aplicada)
| Métrica | Media |
|---|---|
| Regiones únicas por sesión (de ${BODY_REGIONS.length}) | ${avg(ses.uniqueRegions)} |
| Targets únicos por sesión | ${avg(ses.uniqueTargets)} |
| Familias únicas por sesión | ${avg(ses.uniqueFamilies)} |
| Racha más larga en la misma región | ${avg(ses.streak)} |
| Cuota de cartas INTIMATE | ${(100 * ses.intimateShare.reduce((a, b) => a + b, 0) / ses.intimateShare.length).toFixed(1)} % |
| Cartas recién desbloqueadas: tardan en aparecer (cartas) | ${avg(ses.unlockDelay)} (${ses.unlockDelay.length} desbloqueos con aparición) |
| Primer desbloqueo en la carta | ${avg(ses.unlockRounds.filter((x, i, a) => i === 0 || a[i - 1] > x))} |
| Repetición de carta dentro de 5 | ${pct(ses.repeats5, ses.cards)} |

### Región (sesiones reales)
${table(ses.region, ses.cards)}
`;
console.log(md); if (OUT) writeFileSync(OUT, md);
