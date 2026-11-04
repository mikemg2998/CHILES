/* Reporte por target íntimo (VULVA · CLITORIS · VAGINA · PENE): catálogo aprobado por access mode, filtro, frecuencia en sesiones
   reales, primera aparición, frecuencia con acceso directo, inalcanzables e invisibles; y sesiones largas para LATE_SESSION.
   node tests/targets.js [--out=archivo.md] */
import { CARDS, CARD, APPROVED, partsOf } from '../content/index.js';
import { FAMILIES } from '../content/schema.js';
import { buildDeck } from '../engine/deck.js';
import { GameEngine } from '../engine/engine.js';
import { writeFileSync } from 'node:fs';
const out = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6);
const TARGETS = { vulva: 'VULVA', clitoris: 'CLITORIS', vagina: 'VAGINA', penis: 'PENE', glans: 'GLANDE', testicles: 'TESTICULOS' };
const NAKED = { top: 'OFF', bottoms: 'OFF', socks: 'OFF', bra: 'OFF', panties: 'OFF', boxers: 'OFF' };
const units = c => (c.variants ? c.variants.filter(v => v.status === 'APPROVED').map(v => ({ card: c, v })) : [{ card: c, v: null }]);
const parts = u => partsOf(u.card, u.v);
const texts = u => { const src = u.v || u.card; return u.card.allowedSides ? Object.values(src.copyBySide || {}).flat() : (src.copy || []); };
const mode = c => c.clothing.receiver.find(q => /^THROUGH_/.test(q)) || (c.clothing.receiver.includes('SKIN_ACCESS') ? 'DIRECT_SKIN_ACCESS' : c.clothing.receiver.join('+'));
const kind = c => (c.minIntimacyCards != null ? 'LATE_SESSION' : c.interactionType === 'POSITIONAL' ? 'POSITIONAL' : /^THROUGH_/.test(mode(c)) ? 'THROUGH_GARMENT' : 'DIRECT');
const mkE = (seed, clothing) => { const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']] }, seed, level: 3 }); if (clothing) e.clothing = clothing.map(s => ({ ...s })); return e; };
const L = [`# Reporte por target íntimo · ${new Date().toISOString().slice(0, 10)}`, '', 'Ana (vulva · senos) y Leo (pene). Sesiones reales: empiezan vestidos, las UNDRESS se aplican como en la app (primera prenda posible). Sesiones largas: desnudos desde el inicio, 50 cartas.', ''];
// catálogo por target
const cat = {};
for (const t in TARGETS) cat[t] = APPROVED.flatMap(units).filter(u => parts(u).includes(t));
L.push('## 1 · Catálogo APPROVED por target', '', '| Target | Cartas (unidades) | DIRECT | THROUGH_GARMENT | POSITIONAL | LATE_SESSION |', '|---|---|---|---|---|---|');
for (const t in TARGETS) { const us = cat[t]; const by = k => us.filter(u => kind(u.card) === k).map(u => u.card.id + (u.v ? '·' + u.v.id : '')).join(' ') || '—'; L.push(`| ${TARGETS[t]} | ${us.length} | ${by('DIRECT')} | ${by('THROUGH_GARMENT')} | ${by('POSITIONAL')} | ${by('LATE_SESSION')} |`); }
for (const t in TARGETS) {
  L.push('', `### ${TARGETS[t]} · detalle`, '', '| Carta | Texto | Actúa con → recibe | Access mode | Ropa (recibe / actúa) | Duración | Tipo |', '|---|---|---|---|---|---|---|');
  for (const u of cat[t]) L.push(`| ${u.card.id}${u.v ? ' · ' + u.v.id : ''} | ${texts(u).map(x => '«' + x + '»').join(' ')} | ${((u.v && u.v.actorRequirements) || u.card.actorRequirements).map(r => r.part).join(', ')} → ${parts(u).join(', ')} | ${mode(u.card)} | ${u.card.clothing.receiver.join('+')} / ${u.card.clothing.actor.join('+')} | ${u.card.durations.join('/')} s | ${kind(u.card)}${u.card.requiredOrientation ? ' (' + u.card.requiredOrientation + ')' : ''}${u.card.minIntimacyCards ? ' ≥' + u.card.minIntimacyCards : ''} |`);
}
// filtro: estados mínimos en que cada unidad pasa (Leo desnudo → Ana, Ana desnuda → Leo), y umbral tardío ya cruzado
L.push('', '## 2 · Filtro de candidatos y alcanzabilidad', '');
const states = [['todo puesto', { ...NAKED, top: 'ON', bottoms: 'ON', panties: 'ON', boxers: 'ON', bra: 'ON', socks: 'ON' }], ['pantalón fuera + ropa interior puesta', { ...NAKED, panties: 'ON', boxers: 'ON' }], ['a piel', NAKED]];
const unreachable = [];
for (const t in TARGETS) for (const u of cat[t]) {
  const actor = ['penis', 'glans', 'testicles'].includes(t) ? 0 : 1, rows = [];
  for (const [name, recv] of states) { const e = mkE(1, actor === 1 ? [recv, NAKED] : [NAKED, recv]); e.session.intimacyCardCount = 40; const d = buildDeck([u.card], e.context(actor)); const ok = d.eligible.length && (!u.v || d.eligible[0].variants.some(v => v.id === u.v.id)); rows.push(`${name}: ${ok ? 'SÍ' : 'no'}`); }
  const e0 = mkE(1, actor === 1 ? [NAKED, NAKED] : [NAKED, NAKED]); const d0 = buildDeck([u.card], e0.context(actor)); const atStart = d0.eligible.length ? 'sí' : 'no (' + d0.rejected[0].reason + ')';
  if (!rows.some(r => r.endsWith('SÍ'))) unreachable.push(u.card.id);
  L.push(`- ${u.card.id}${u.v ? '·' + u.v.id : ''}: ${rows.join(' · ')} · a piel en la carta 0: ${atStart}`);
}
L.push('', `Cartas inalcanzables en cualquier estado (con el umbral cruzado): ${unreachable.length ? unreachable.join(' ') : 'ninguna'}.`);
// sesiones reales
function simulate(N, R, start, label) {
  const count = {}, firstEligible = {}, firstSeen = {}, directRounds = {}, directHits = {}; let total = 0; const perSession = {};
  for (const t in TARGETS) { firstEligible[t] = []; firstSeen[t] = []; directRounds[t] = 0; directHits[t] = 0; perSession[t] = 0; }
  for (let seed = 1; seed <= N; seed++) {
    const e = mkE(seed, start); const fe = {}, fs = {};
    for (let i = 0; i < R; i++) {
      for (const t in TARGETS) { const actor = ['penis', 'glans', 'testicles'].includes(t) ? 0 : 1; if (!(t in fe) && buildDeck(CARDS, e.context(actor)).eligible.some(x => x.variants ? x.variants.some(v => partsOf(x.card, v).includes(t)) : partsOf(x.card, null).includes(t))) fe[t] = e.session.intimacyCardCount + 1; }
      const direct = { vulva: e.clothing[0].bottoms !== 'ON' && e.clothing[0].panties !== 'ON', penis: e.clothing[1].bottoms !== 'ON' && e.clothing[1].boxers !== 'ON' }; direct.clitoris = direct.vulva; direct.vagina = direct.vulva; direct.glans = direct.penis; direct.testicles = direct.penis;
      const r = e.roll(); if (!r) break; total++;
      for (const t in TARGETS) if (direct[t]) directRounds[t]++;
      for (const p of r.parts) if (p in TARGETS) { const k = r.cardId + (r.variantId ? '·' + r.variantId : ''); count[k] = (count[k] || 0) + 1; if (direct[p]) directHits[p]++; if (!(p in fs)) { fs[p] = r.n; perSession[p]++; } }
      if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
    }
    for (const t in TARGETS) { if (t in fe) firstEligible[t].push(fe[t]); if (t in fs) firstSeen[t].push(fs[t]); }
  }
  const avg = a => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '—');
  L.push('', `## ${label}`, '', `${N} sesiones × ${R} cartas = ${total} cartas.`, '', '| Target | Cartas con el target | % de todas | Sesiones con ≥1 | Primera carta en que PUEDE salir (media) | Primera en que SALE (media) | % de las cartas con acceso directo |', '|---|---|---|---|---|---|---|');
  for (const t in TARGETS) { const n = Object.entries(count).filter(([k]) => cat[t].some(u => k === u.card.id + (u.v ? '·' + u.v.id : ''))).reduce((a, [, v]) => a + v, 0); L.push(`| ${TARGETS[t]} | ${n} | ${(100 * n / total).toFixed(1)} % | ${perSession[t]} / ${N} | ${avg(firstEligible[t])} | ${avg(firstSeen[t])} | ${directRounds[t] ? (100 * directHits[t] / directRounds[t]).toFixed(1) + ' %' : '—'} |`); }
  L.push('', 'Por carta: ' + Object.entries(count).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
  return count;
}
const c1 = simulate(200, 30, null, '3 · Sesiones reales (vestidos, 30 cartas)');
const c2 = simulate(200, 50, [NAKED, NAKED], '4 · Sesiones largas (desnudos desde el inicio, 50 cartas)');
// invisibles: unidades aprobadas y alcanzables con < 0,1 % sumando sesiones reales y largas (las LATE_SESSION se juzgan aparte, en §5)
const invisible = Object.values(cat).flat().filter(u => u.card.minIntimacyCards == null).map(u => u.card.id + (u.v ? '·' + u.v.id : '')).filter(k => !unreachable.includes(k.split('·')[0]) && ((c1[k] || 0) + (c2[k] || 0)) / 16000 < 0.001);
L.push('', `Cartas prácticamente invisibles (< 0,1 % en 16 000 cartas de sesiones reales + largas): ${invisible.length ? invisible.map(k => `${k} (${(c1[k] || 0) + (c2[k] || 0)})`).join(' · ') : 'ninguna'}.`);
// LATE_SESSION: posición de aparición
let before = 0, sessionsLate = 0, positions = []; for (let seed = 1; seed <= 200; seed++) { const e = mkE(seed, [NAKED, NAKED]); let hit = false; for (let i = 0; i < 50; i++) { const r = e.roll(); if (['I32', 'I33'].includes(r.cardId)) { if (e.session.intimacyCardCount < 35) before++; if (!hit) { hit = true; sessionsLate++; positions.push(r.n); } } } }
L.push('', '## 5 · LATE_SESSION (I32 · I33) en las sesiones largas', '', `- Apariciones antes de la carta 35: ${before}.`, `- Sesiones (de 200) en las que sale al menos una: ${sessionsLate}; primera aparición media en la carta ${positions.length ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1) : '—'} (mín ${Math.min(...positions)}, máx ${Math.max(...positions)}).`, `- Peso base 0,5 sin empujón; la sesión puede acabar antes sin que salgan.`);
// cadenas íntimas: ¿PENE → GLANDE → TESTÍCULOS seguidas solo porque hay acceso directo?
{ let chains3 = 0, chains2 = 0, sessions = 200, leoIntimate = 0, leoCards = 0; const LEO = ['penis', 'glans', 'testicles'];
  for (let seed = 1; seed <= sessions; seed++) { const e = mkE(seed, [NAKED, NAKED]); let run = 0; for (let i = 0; i < 50; i++) { const r = e.roll(); if (r.actor === 0) { leoCards++; const hit = r.parts.some(p => LEO.includes(p)); if (hit) { leoIntimate++; run++; if (run === 2) chains2++; if (run >= 3) chains3++; } else run = 0; } else run = 0; } }
  L.push('', '## 6 · Cadenas íntimas en el lado de Leo (sesiones largas, desnudos)', '', `- Cartas en las que Ana actúa sobre Leo: ${leoCards}; de ellas con target pene / glande / testículos: ${leoIntimate} (${(100 * leoIntimate / leoCards).toFixed(1)} %).`, `- Dos cartas íntimas de Leo seguidas (sin otra carta en medio): ${chains2} veces en ${sessions} sesiones; tres o más seguidas: ${chains3}.`); }
const text = L.join('\n'); console.log(text); if (out) writeFileSync(out, text + '\n');
