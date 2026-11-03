/* BEFORE / AFTER de la expansión corporal V1. Mismas semillas; BEFORE = catálogo sin las cartas nuevas y sin la reutilización
   multinivel (se desactivan en memoria), AFTER = catálogo actual. node tests/expansion.js [--out=fichero.md] [--sessions=200] */
import { writeFileSync } from 'node:fs';
import { CARD, APPROVED, playableAt, partsOf, regionOf } from '../content/index.js';
import { BODY_PARTS } from '../content/body.js';
import { GameEngine } from '../engine/engine.js';
import { fullAccess, DEFAULT_CLOTHING } from '../engine/clothing.js';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = arg('out', ''), N = Number(arg('sessions', 200));
export const NEW = ['I44', 'I45', 'I46', 'I47', 'I48', 'I49', 'I50', 'I51', 'I52', 'I53', 'I54'];
export const REUSED = ['C01', 'C06', 'C08', 'C15', 'C51', 'D10'];
const GENITAL = p => BODY_PARTS[p] && ['vulva', 'pene'].includes(BODY_PARTS[p].anatomy);
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + ' %' : '—');
const avg = a => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : '—');
const inc = (m, k) => { m[k] = (m[k] || 0) + 1; };
const PAIR = { names: ['Mike', 'Val'], bodyParts: [['pene'], ['vulva', 'senos']] };

function withBefore(fn) {
  const saved = [...NEW.map(id => [id, 'status', CARD[id].status]), ...REUSED.map(id => [id, 'levels', CARD[id].levels])];
  try { for (const id of NEW) CARD[id].status = 'UNREVIEWED'; for (const id of REUSED) CARD[id].levels = null; return fn(); }
  finally { for (const [id, k, v] of saved) CARD[id][k] = v; }
}
function catalog() {
  const L3 = APPROVED.filter(c => c.status === 'APPROVED' && playableAt(c, 3)), inter = L3.filter(c => c.interactionType !== 'UNDRESS');
  const gen = inter.filter(c => partsOf(c, null).some(GENITAL)), non = inter.filter(c => !partsOf(c, null).some(GENITAL));
  const skin = non.filter(c => c.clothing.receiver.includes('SKIN_ACCESS') || c.clothing.receiver.includes('FULL_BODY_ACCESS'));
  const byRegion = {}; for (const c of inter) inc(byRegion, regionOf(c, null));
  return { total: L3.length, inter: inter.length, gen: gen.length, non: non.length, skin: skin.length, b2b: inter.filter(c => c.interactionType === 'BODY_TO_BODY').length, massage: inter.filter(c => c.family === 'MASSAGE').length, byRegion };
}
function run({ sessions, cards, dressed }) {
  const s = { n: 0, region: {}, target: {}, type: {}, fam: {}, uniqReg: [], fullSessions: 0, b2bSessions: 0, firstFull: [], byReceiver: [{ n: 0, gen: 0 }, { n: 0, gen: 0 }] };
  for (let i = 0; i < sessions; i++) {
    const e = new GameEngine({ prefs: PAIR, seed: 4000 + i, level: 3 });
    e.clothing = dressed ? [DEFAULT_CLOTHING(['pene']), DEFAULT_CLOTHING(['vulva', 'senos'])] : [fullAccess(['pene']), fullAccess(['vulva', 'senos'])];
    const regs = new Set(); let full = null, b2b = false;
    for (let k = 0; k < cards; k++) {
      if (e.pauseDue()) e.continueGuided();
      const r = e.roll(); if (!r) break; if (r.transition) continue;
      if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
      const c = CARD[r.cardId]; if (c.interactionType === 'UNDRESS') { inc(s.type, 'UNDRESS'); continue; }
      s.n++; inc(s.region, r.region); for (const p of r.parts) inc(s.target, p); inc(s.type, c.interactionType); inc(s.fam, c.family); regs.add(r.region);
      if (r.region === 'FULL_BODY' && full == null) full = k + 1; if (c.interactionType === 'BODY_TO_BODY') b2b = true;
      const rv = s.byReceiver[r.receiver]; rv.n++; if (r.parts.some(GENITAL)) rv.gen++;
    }
    s.uniqReg.push(regs.size); if (full != null) { s.fullSessions++; s.firstFull.push(full); } if (b2b) s.b2bSessions++;
  }
  s.sessions = sessions; return s;
}
const REGIONS = ['INTIMATE', 'CHEST', 'FULL_BODY', 'BACK', 'ARMS_HANDS', 'FEET', 'HIPS_GLUTES', 'THIGHS_LEGS', 'ABDOMEN', 'FACE', 'NECK'];
if (process.argv[1] && process.argv[1].endsWith('expansion.js')) {
  const before = withBefore(() => ({ cat: catalog(), long: run({ sessions: N, cards: 50, dressed: false }), normal: run({ sessions: N, cards: 30, dressed: true }) }));
  const after = { cat: catalog(), long: run({ sessions: N, cards: 50, dressed: false }), normal: run({ sessions: N, cards: 30, dressed: true }) };
  const L = [`# Expansión corporal de Intimidad V1 · BEFORE / AFTER · ${new Date().toISOString().slice(0, 10)}`, '',
    `Pareja Mike (pene) ↔ Val (vulva + senos), mismas semillas. **Largas**: ${N} sesiones × 50 cartas con acceso completo desde el inicio. **Normales**: ${N} sesiones × 30 cartas empezando vestidos, con las cartas UNDRESS aplicadas como en la app. Porcentajes sobre cartas de interacción (sin UNDRESS).`, '',
    '## Catálogo jugable en Intimidad (APPROVED)', '', '| | BEFORE | AFTER |', '|---|---|---|',
    ...[['Total (con UNDRESS)', 'total'], ['Interacciones', 'inter'], ['Genitales', 'gen'], ['No genitales', 'non'], ['No genitales a piel (DIRECT / FULL_BODY_ACCESS)', 'skin'], ['BODY_TO_BODY', 'b2b'], ['Masajes', 'massage']].map(([l, k]) => `| ${l} | ${before.cat[k]} | ${after.cat[k]} |`),
    '', '| Región (cartas) | BEFORE | AFTER |', '|---|---|---|', ...REGIONS.map(g => `| ${g} | ${before.cat.byRegion[g] || 0} | ${after.cat.byRegion[g] || 0} |`)];
  for (const [title, k] of [['Sesiones largas (acceso completo)', 'long'], ['Sesiones normales (empiezan vestidos)', 'normal']]) {
    const b = before[k], a = after[k];
    L.push('', `## ${title}`, '', '| Métrica | BEFORE | AFTER |', '|---|---|---|',
      ...REGIONS.map(g => `| ${g} | ${pct(b.region[g] || 0, b.n)} | ${pct(a.region[g] || 0, a.n)} |`),
      `| GROIN (ingles / entrepierna) | ${pct((b.target.hipCrease || 0) + (b.target.groin || 0), b.n)} | ${pct((a.target.hipCrease || 0) + (a.target.groin || 0), a.n)} |`,
      `| BODY_TO_BODY | ${pct(b.type.BODY_TO_BODY || 0, b.n)} | ${pct(a.type.BODY_TO_BODY || 0, a.n)} |`,
      `| Masajes (familia) | ${pct(b.fam.MASSAGE || 0, b.n)} | ${pct(a.fam.MASSAGE || 0, a.n)} |`,
      `| Genital recibido por Mike | ${pct(b.byReceiver[0].gen, b.byReceiver[0].n)} | ${pct(a.byReceiver[0].gen, a.byReceiver[0].n)} |`,
      `| Genital recibido por Val | ${pct(b.byReceiver[1].gen, b.byReceiver[1].n)} | ${pct(a.byReceiver[1].gen, a.byReceiver[1].n)} |`,
      `| Regiones únicas por sesión | ${avg(b.uniqReg)} | ${avg(a.uniqReg)} |`,
      `| Sesiones con FULL_BODY | ${pct(b.fullSessions, b.sessions)} | ${pct(a.fullSessions, a.sessions)} |`,
      `| Sesiones con BODY_TO_BODY | ${pct(b.b2bSessions, b.sessions)} | ${pct(a.b2bSessions, a.sessions)} |`,
      `| 1.ª carta FULL_BODY (media) | ${avg(b.firstFull)} | ${avg(a.firstFull)} |`,
      '', `Targets AFTER (top 20): ${Object.entries(a.target).sort((x, y) => y[1] - x[1]).slice(0, 20).map(([t, v]) => `${t} ${pct(v, a.n)}`).join(' · ')}`,
      '', `Targets BEFORE (top 20): ${Object.entries(b.target).sort((x, y) => y[1] - x[1]).slice(0, 20).map(([t, v]) => `${t} ${pct(v, b.n)}`).join(' · ')}`);
  }
  const text = L.join('\n'); console.log(text); if (OUT) writeFileSync(OUT, text + '\n');
}
