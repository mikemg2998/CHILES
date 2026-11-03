/* Simulación de diversidad en Intimidad (curación 2026-11-03). Juega N sesiones de Intimidad (vestidos al entrar,
   desvistiendo como la interfaz, pausa incluida) con semillas y anatomías fijas, y mide por carta, por región / familia /
   target, repetición, cobertura, progresión de ropa y cartas recién desbloqueadas.
   Uso: node tests/intimacy-sim.js --root=<carpeta del repo> --sessions=10000 --cards=40 [--no-layer] --out=<json>
   --root permite medir otro commit (p. ej. un worktree del motor anterior) con las mismas semillas. */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const ROOT = resolve(arg('root', new URL('..', import.meta.url).pathname));
const N = +arg('sessions', 10000), CARDS_PER = +arg('cards', 40), NO_LAYER = process.argv.includes('--no-layer');
const { GameEngine } = await import(`${ROOT}/engine/engine.js`);
const content = await import(`${ROOT}/content/index.js`);
const L3 = content.APPROVED.filter(c => (content.playableAt ? content.playableAt(c, 3) : c.level === 3) && !c.transition && c.interactionType !== 'UNDRESS').map(c => c.id);
const IS_U = id => content.CARD[id] && content.CARD[id].interactionType === 'UNDRESS';
export const PAIRS = [
  { key: 'vulva+senos → pene', bodyParts: [['vulva', 'senos'], ['pene']] },
  { key: 'pene · pene', bodyParts: [['pene'], ['pene']] },
  { key: 'vulva+senos · vulva+senos', bodyParts: [['vulva', 'senos'], ['vulva', 'senos']] },
  { key: 'vulva → pene+senos', bodyParts: [['vulva'], ['pene', 'senos']] },
];
const DRESSED = () => ({ top: 'ON', bottoms: 'ON', socks: 'ON', bra: 'ON', panties: 'ON', boxers: 'ON' });

const card = {}; for (const id of L3) card[id] = { n: 0, sessions: 0, firstSum: 0, opp: 0, eligibleNeverSessions: 0, eligibleSessions: 0 };
const region = {}, family = {}, target = {}, perPair = {};
let rounds = 0, nonU = 0, undress = 0, transitions = 0, rep10 = 0, sameGroup3 = 0, sameFamily1 = 0, sameRegion1 = 0, relaxed = 0, relaxedSessions = 0;
let coverageSum = 0, uniqueSum = 0, firstUndressSum = 0, firstUndressN = 0, undressBy = { 10: 0, 20: 0, 30: 0, 40: 0 }, nakedTopBySum = 0, nakedTopN = 0;
const changes = { n: 0, withUnlocked: 0, unlockedTotal: 0, unlockedSeenBeforeNext: 0, firstSeenGapSum: 0, firstSeenGapN: 0, inNext6: 0, nonUInNext6: 0, runs3: 0 };
const phase = {}; // distribución por banda de ropa (cuántas prendas fuera en total)
const add = (o, k, v = 1) => { o[k] = (o[k] || 0) + v; };

for (let s = 0; s < N; s++) {
  const pair = PAIRS[s % PAIRS.length];
  const e = new GameEngine({ prefs: { names: ['A', 'B'], bodyParts: pair.bodyParts }, seed: 100000 + s, level: 3, intimacyDiversity: !NO_LAYER });
  e.clothing = [DRESSED(), DRESSED()];
  const seq = [], seen = new Map(), eligibleCount = {}, unlockEvents = [];
  for (let i = 0; i < CARDS_PER; i++) {
    if (e.pauseDue()) e.continueGuided();
    const r = e.roll(); if (!r) break;
    const dbg = e.lastDebug, rej = new Set(dbg.rejected.map(x => x.id));
    for (const id of L3) if (!rej.has(id)) { eligibleCount[id] = (eligibleCount[id] || 0) + 1; card[id].opp++; }
    seq.push(r); rounds++;
    if (r.transition) { transitions++; continue; }
    const off = ['top', 'bottoms', 'socks', 'bra', 'panties', 'boxers'].reduce((a, g) => a + (e.clothing[0][g] === 'OFF') + (e.clothing[1][g] === 'OFF'), 0);
    const band = off === 0 ? '0 prendas fuera' : off <= 2 ? '1–2 fuera' : off <= 5 ? '3–5 fuera' : '6+ fuera';
    phase[band] ||= { n: 0, region: {} }; phase[band].n++; add(phase[band].region, r.region);
    if (r.undress) {
      undress++; if (seq.filter(x => x.undress).length === 1) { firstUndressSum += seq.length; firstUndressN++; }
      const before = e.eligibleIds();
      for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
      const fresh = [...e.eligibleIds()].filter(id => !before.has(id) && !IS_U(id));
      unlockEvents.push({ at: seq.length, ids: fresh });
      continue;
    }
    nonU++;
    const c = content.CARD[r.cardId];
    add(region, r.region); add(family, r.family); for (const p of r.parts) add(target, p);
    if (card[r.cardId]) { card[r.cardId].n++; if (!seen.has(r.cardId)) { seen.set(r.cardId, seq.length); card[r.cardId].sessions++; card[r.cardId].firstSum += seq.length; } }
    const prev = seq.slice(Math.max(0, seq.length - 1 - 10), seq.length - 1).filter(x => !x.transition);
    if (prev.some(x => x.cardId === r.cardId)) rep10++;
    const prevNonU = seq.slice(0, -1).filter(x => !x.undress && !x.transition);
    const last = prevNonU[prevNonU.length - 1];
    if (last && last.family === r.family) sameFamily1++;
    if (last && last.region === r.region) sameRegion1++;
    if (c.similarityGroup && prevNonU.slice(-3).some(x => x.similarityGroup === c.similarityGroup)) sameGroup3++;
  }
  // progresión de ropa
  const ui = seq.map((x, i) => x.undress ? i + 1 : 0).filter(Boolean);
  for (const k of [10, 20, 30, 40]) undressBy[k] += ui.filter(i => i <= k).length;
  // recién desbloqueadas: ¿tienen oportunidad antes de la siguiente capa?
  unlockEvents.forEach((ev, k) => {
    changes.n++; if (!ev.ids.length) return; changes.withUnlocked++; changes.unlockedTotal += ev.ids.length;
    const end = k + 1 < unlockEvents.length ? unlockEvents[k + 1].at : seq.length;
    const window = seq.slice(ev.at, end);
    for (const id of ev.ids) { const j = window.findIndex(x => x.cardId === id); if (j >= 0) { changes.unlockedSeenBeforeNext++; changes.firstSeenGapSum += j + 1; changes.firstSeenGapN++; } }
    const next6 = seq.slice(ev.at, ev.at + 6).filter(x => !x.undress && !x.transition);
    changes.nonUInNext6 += next6.length; changes.inNext6 += next6.filter(x => ev.ids.includes(x.cardId)).length;
    let run = 0, maxRun = 0; for (const x of next6) { run = ev.ids.includes(x.cardId) ? run + 1 : 0; maxRun = Math.max(maxRun, run); } if (maxRun >= 3) changes.runs3++;
  });
  // cobertura: cartas distintas jugadas / cartas que fueron elegibles alguna vez en la sesión
  const eligibleEver = Object.keys(eligibleCount); const played = new Set(seq.filter(x => !x.undress && !x.transition).map(x => x.cardId));
  coverageSum += eligibleEver.length ? eligibleEver.filter(id => played.has(id)).length / eligibleEver.length : 0;
  uniqueSum += played.size;
  for (const id of eligibleEver) { card[id].eligibleSessions++; if (eligibleCount[id] >= 10 && !played.has(id)) card[id].eligibleNeverSessions++; }
  const rel = e.stats.cooldownRelaxed ? e.stats.cooldownRelaxed.length : 0; relaxed += rel; if (rel) relaxedSessions++;
  perPair[pair.key] ||= { sessions: 0, unique: 0, rep10: 0 }; perPair[pair.key].sessions++; perPair[pair.key].unique += played.size;
  { let r10 = 0; seq.forEach((x, i) => { if (!x.undress && !x.transition && seq.slice(Math.max(0, i - 10), i).some(y => y.cardId === x.cardId)) r10++; }); perPair[pair.key].rep10 += r10; }
}
const out = {
  root: ROOT, layer: !NO_LAYER, sessions: N, cardsPerSession: CARDS_PER, rounds, nonUndress: nonU, undress, transitions,
  repeatsWithin10PerSession: rep10 / N, sameGroupWithin3Share: sameGroup3 / nonU, sameFamilyConsecutiveShare: sameFamily1 / nonU, sameRegionConsecutiveShare: sameRegion1 / nonU,
  coverage: coverageSum / N, uniquePerSession: uniqueSum / N, cooldownRelaxations: relaxed, cooldownRelaxedSessions: relaxedSessions,
  undressShare: undress / (rounds - transitions), firstUndressRound: firstUndressSum / Math.max(1, firstUndressN), undressBy: Object.fromEntries(Object.entries(undressBy).map(([k, v]) => [k, v / N])),
  unlocked: { changes: changes.n, withUnlocked: changes.withUnlocked, perChange: changes.unlockedTotal / Math.max(1, changes.withUnlocked), seenBeforeNextLayer: changes.unlockedSeenBeforeNext / Math.max(1, changes.unlockedTotal), meanCardsToFirstSeen: changes.firstSeenGapSum / Math.max(1, changes.firstSeenGapN), shareOfNext6: changes.inNext6 / Math.max(1, changes.nonUInNext6), runsOf3InNext6: changes.runs3 / Math.max(1, changes.withUnlocked) },
  region, family, target, phase, perPair,
  cards: Object.fromEntries(Object.entries(card).map(([id, c]) => [id, { n: c.n, share: c.n / nonU, sessionsPct: c.sessions / N, firstAt: c.sessions ? c.firstSum / c.sessions : null, opportunities: c.opp, perOpportunity: c.opp ? c.n / c.opp : 0, eligibleSessions: c.eligibleSessions, eligibleNeverSessions: c.eligibleNeverSessions }])),
};
const file = arg('out', null);
if (file) writeFileSync(file, JSON.stringify(out, null, 1)); else console.log(JSON.stringify(out, null, 1));
console.error(`✓ ${ROOT} · capa ${!NO_LAYER} · ${N} sesiones · ${rounds} cartas · repes<10: ${out.repeatsWithin10PerSession.toFixed(3)}/sesión · cobertura ${(out.coverage * 100).toFixed(1)} % · relajaciones ${relaxed}`);
