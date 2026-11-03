/* AUDITORÍA DE COBERTURA CORPORAL · Intimidad (2026-11-03). Solo lectura: no toca contenido ni motor.
   (1) inventario de todas las unidades APPROVED de Intimidad (carta o variante) · (2) matriz REGIÓN → TARGET → cartas → acceso →
   anatomía → estado · (3) elegibilidad real por configuración anatómica del receptor y por estado de ropa · (4) duplicados
   semánticos potenciales · (5) simulaciones: 1 000 selecciones con acceso completo, 200 sesiones normales, 200 largas, separadas
   por receptor · (6) cadenas de misma región · (7) LATE_SESSION.   node tests/coverage.js [--out=archivo.md] */
import { writeFileSync } from 'node:fs';
import { CARDS, CARD, APPROVED, regionOf, partsOf, BODY_REGIONS } from '../content/index.js';
import { BODY_PARTS, BODY_PARTS_LIST, ACTOR_TOOLS, GARMENT_LAYERS } from '../content/body.js';
import { FAMILIES } from '../content/schema.js';
import { GameEngine } from '../engine/engine.js';
import { buildDeck } from '../engine/deck.js';
import { coverage, fullAccess, DEFAULT_CLOTHING } from '../engine/clothing.js';

const OUT = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6);
const inc = (m, k, d = 1) => { m[k] = (m[k] || 0) + d; };
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + ' %' : '—');
const avg = a => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : '—');
const sum = m => Object.values(m).reduce((a, b) => a + b, 0);
const sig = d => d.length ? [...d].sort().join('+') : 'sin anatomía';
const GENITAL = ['vulva', 'clitoris', 'vagina', 'penis', 'glans', 'testicles', 'groin', 'hipCrease', 'anus'];

/* ---------- unidades ---------- */
const L3 = APPROVED.filter(c => c.level === 3);
const units = L3.flatMap(c => (c.variants ? c.variants.filter(v => v.status === 'APPROVED').map(v => ({ card: c, v, key: c.id + '·' + v.id })) : [{ card: c, v: null, key: c.id }]));
const tools = u => ((u.v && u.v.actorRequirements) || u.card.actorRequirements).map(r => r.part);
const parts = u => partsOf(u.card, u.v);
const texts = u => { const src = u.v || u.card; return u.card.allowedSides ? Object.values(src.copyBySide || {}).flat() : (src.copy || []); };
const anatomyOfTools = u => [...new Set(tools(u).map(t => ACTOR_TOOLS[t].anatomy).filter(Boolean))];
const anatomyOfParts = u => [...new Set([...(u.v && u.v.anatomy ? [u.v.anatomy] : []), ...parts(u).map(p => BODY_PARTS[p].anatomy).filter(Boolean)])];
const mode = c => c.clothing.receiver.find(q => /^THROUGH_/.test(q)) || (c.clothing.receiver.includes('FULL_BODY_ACCESS') ? 'FULL_BODY_ACCESS' : c.clothing.receiver.includes('SKIN_ACCESS') ? 'DIRECT_SKIN_ACCESS' : c.clothing.receiver.join('+'));
const kind = c => (c.minIntimacyCards != null ? 'LATE_SESSION' : /^THROUGH_/.test(mode(c)) ? 'THROUGH_GARMENT' : c.interactionType === 'UNDRESS' ? 'UNDRESS' : 'DIRECT');

/* ---------- configuraciones anatómicas (nunca género) ---------- */
const RECEIVERS = [['vulva', 'senos'], ['pene'], ['vulva'], ['pene', 'senos']];
const PAIRS = [[['vulva', 'senos'], ['pene']], [['vulva'], ['pene']], [['vulva', 'senos'], ['vulva', 'senos']], [['pene'], ['pene']], [['pene', 'senos'], ['vulva']]];
const mk = (pair, seed) => new GameEngine({ prefs: { names: ['A', 'B'], bodyParts: pair }, seed, level: 3 });
/* estados de ropa del receptor (todas las prendas aplicables) */
const STATES = {
  'todo puesto': s => s,
  'camiseta fuera': s => ({ ...s, top: 'OFF' }),
  'camiseta + brasier fuera': s => ({ ...s, top: 'OFF', bra: s.bra === 'NONE' ? 'NONE' : 'OFF' }),
  'pantalón fuera': s => ({ ...s, bottoms: 'OFF' }),
  'pantalón + ropa interior fuera': s => ({ ...s, bottoms: 'OFF', panties: s.panties === 'NONE' ? 'NONE' : 'OFF', boxers: s.boxers === 'NONE' ? 'NONE' : 'OFF' }),
  'calcetines fuera': s => ({ ...s, socks: 'OFF' }),
  'acceso completo': () => null,
};
/* elegibilidad real de una unidad: receptor con anatomía `recv` en estado `state`; actor con anatomía `act` en acceso completo; umbral tardío cruzado */
function eligible(u, recv, act, stateFn) {
  const e = mk([act, recv], 1); e.session.intimacyCardCount = 40;
  const base = DEFAULT_CLOTHING(recv); e.clothing = [fullAccess(act), stateFn(base) || fullAccess(recv)];
  const d = buildDeck([u.card], e.context(0));
  if (!d.eligible.length) return { ok: false, why: d.rejected[0].reason };
  if (u.v && !d.eligible[0].variants.some(v => v.id === u.v.id)) return { ok: false, why: 'VARIANT' };
  return { ok: true };
}
/* para cada unidad: por receptor, en qué estados sale (con actor compatible: el que tenga la anatomía que exige la herramienta) */
const ACTOR_FOR = u => { const need = anatomyOfTools(u); return need.length ? RECEIVERS.find(r => need.every(a => r.includes(a))) : ['pene']; };
const ELIG = {};
for (const u of units) { ELIG[u.key] = {}; for (const r of RECEIVERS) { ELIG[u.key][sig(r)] = Object.keys(STATES).filter(s => eligible(u, r, ACTOR_FOR(u), STATES[s]).ok); } }

/* ---------- 1 · inventario ---------- */
const L = [`# Auditoría de cobertura corporal · Intimidad · ${new Date().toISOString().slice(0, 10)}`, '',
  `Catálogo real: ${L3.length} cartas APPROVED de Intimidad (${L3.filter(c => c.interactionType !== 'UNDRESS').length} interacciones + ${L3.filter(c => c.interactionType === 'UNDRESS').length} UNDRESS) = ${units.length} unidades jugables (carta o variante aprobada). Las cartas UNREVIEWED (${CARDS.filter(c => c.level === 3 && c.status === 'UNREVIEWED').map(c => c.id).join(', ')}) y REJECTED (${CARDS.filter(c => c.level === 3 && c.status === 'REJECTED').map(c => c.id).join(', ')}) no cuentan.`, '',
  'Receptores analizados (anatomía declarada, nunca género): vulva+senos · pene · vulva · pene+senos. Para cada unidad, quien actúa tiene acceso completo y la anatomía que la herramienta exija; el umbral de cartas tardías se da por cruzado.', ''];
L.push('## 1 · Inventario de unidades APPROVED', '', '| Unidad | Texto | Familia | Tipo | Región | Target(s) | Actúa con | Anatomía actor | Anatomía receptor | Ropa (recibe / actúa) | Access mode | Lado | Duración | Posición | Tardía | Elegible (receptor → estados) |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const u of units) {
  const c = u.card;
  const el = RECEIVERS.map(r => `${sig(r)}: ${ELIG[u.key][sig(r)].length ? ELIG[u.key][sig(r)].join(' / ') : '—'}`).join('<br>');
  L.push(`| ${u.key} | ${texts(u).slice(0, 1).map(x => '«' + x + '»').join('')}${texts(u).length > 1 ? ` (+${texts(u).length - 1})` : ''} | ${FAMILIES[c.family]} | ${c.interactionType} | ${regionOf(c, u.v)} | ${parts(u).join(', ') || (c.undress ? 'prenda: ' + c.undress.garment : '—')} | ${tools(u).join(', ') || '—'} | ${anatomyOfTools(u).join('+') || 'ANY'} | ${anatomyOfParts(u).join('+') || 'ANY'} | ${c.clothing.receiver.join('+')} / ${c.clothing.actor.join('+')} | ${mode(c)} | ${c.allowedSides ? c.allowedSides.join('/') : '—'} | ${c.durations.length ? c.durations.join('/') + ' s' : 'sin tiempo'} | ${c.requiredOrientation || '—'} | ${c.minIntimacyCards ? '≥ ' + c.minIntimacyCards : '—'} | ${el} |`);
}

/* ---------- 2 · matriz región → target ---------- */
const MIKE_TARGETS = [
  ['Labios', 'lips'], ['Nariz', null, 'solo existe como herramienta del actor (nose), no como parte receptora'], ['Orejas', 'ears'], ['Cuello', 'neck'], ['Nuca', 'nape'], ['Frente', 'forehead'], ['Mejillas', 'cheeks'], ['Rostro', 'face'], ['Cabello', 'hair'],
  ['Lengua', null, 'solo herramienta del actor (tongue); no es parte receptora'], ['Hombros', 'shoulders'], ['Clavículas', 'collarbones'],
  ['Brazos', 'upperArms'], ['Antebrazos', 'forearms'], ['Manos', 'hands'], ['Dedos', 'fingers'], ['Palmas', 'palms'], ['Muñecas', 'wrists'], ['Axilas', null, 'no existe en BODY_PARTS'],
  ['Pecho', 'chest'], ['Senos', 'breasts'], ['Pezones', 'nipples'], ['Tetillas', null, '`nipples` exige anatomía senos: una persona sin senos declarados no tiene target de pezón en el modelo'],
  ['Abdomen', 'abdomen'], ['Bajo vientre', 'lowerAbdomen'], ['Cintura', 'waist'], ['Costados', 'flanks'], ['Espalda', 'back'], ['Zona lumbar', 'lowerBack'],
  ['Cadera', 'hips'], ['Nalgas', 'buttocks'], ['Ingle', 'hipCrease'], ['Entrepierna', 'groin'],
  ['Muslos exteriores', 'outerThighs'], ['Muslos internos', 'innerThighs'], ['Piernas', 'legs'], ['Parte de atrás de las piernas', 'backOfLegs'], ['Zona posterior de la rodilla', 'poplitealArea'], ['Gemelos / pantorrillas', 'calves'],
  ['Tobillos', 'ankles'], ['Pies', 'feet'], ['Dedos de los pies', 'toes'],
  ['Vulva', 'vulva'], ['Clítoris', 'clitoris'], ['Vagina', 'vagina'], ['Pene', 'penis'], ['Glande', 'glans'], ['Testículos', 'testicles'], ['Ano', 'anus'], ['Todo el cuerpo', 'wholeBody'],
];
const unitsByPart = {}; for (const u of units) for (const p of parts(u)) (unitsByPart[p] ||= []).push(u);
const cardsByPart = p => [...new Set((unitsByPart[p] || []).map(u => u.card.id))];
const modesByPart = p => [...new Set((unitsByPart[p] || []).map(u => mode(u.card)))];
function statusOfPart(p) {
  if (!p) return 'CONTENT_GAP (no modelado)';
  const us = unitsByPart[p] || [], n = cardsByPart(p).length, part = BODY_PARTS[p];
  if (!us.length) return 'CONTENT_GAP';
  const states = new Set(us.flatMap(u => RECEIVERS.flatMap(r => ELIG[u.key][sig(r)])));
  if (!states.size) return 'UNREACHABLE';
  const onlyLate = us.every(u => u.card.minIntimacyCards != null), onlyThrough = us.every(u => /^THROUGH_/.test(mode(u.card)));
  let s = n >= 3 ? 'WELL_COVERED' : 'LIGHT_COVERAGE';
  if (onlyLate || onlyThrough) s = 'STATE_SPECIFIC' + (n >= 3 ? '' : ' · LIGHT_COVERAGE');
  if (part.anatomy) s += ' · ANATOMY_SPECIFIC (' + part.anatomy + ')';
  return s;
}
L.push('', '## 2 · Matriz BODY REGION → TARGET → cartas APPROVED → access modes → anatomía → estado', '',
  'Regiones del modelo actual (content/body.js): ' + BODY_REGIONS.join(' · ') + '. No existe región SHOULDERS: `shoulders` está mapeado a BACK y `collarbones` a CHEST; `hips` y `hipCrease` a HIPS_GLUTES; `groin` y `anus` a INTIMATE. Se respeta tal cual.', '',
  '| Región | Target (id) | Cartas APPROVED | Unidades | Access modes | Anatomía exigida | Estado |', '|---|---|---|---|---|---|---|');
const regionRows = {};
for (const [label, id, note] of MIKE_TARGETS) {
  const region = id ? BODY_PARTS[id].region : '—';
  const row = `| ${region} | ${label}${id ? ' (`' + id + '`)' : ''} | ${id ? cardsByPart(id).join(' ') || '0' : '—'} | ${id ? (unitsByPart[id] || []).length : '—'} | ${id ? modesByPart(id).join(', ') || '—' : '—'} | ${id ? (BODY_PARTS[id].anatomy || 'ANY') : '—'} | ${statusOfPart(id)}${note ? ' — ' + note : ''} |`;
  (regionRows[region] ||= []).push(row);
}
for (const r of [...BODY_REGIONS, '—']) for (const row of regionRows[r] || []) L.push(row);
/* partes del modelo no listadas por el diseñador */
const listed = new Set(MIKE_TARGETS.map(x => x[1]).filter(Boolean));
const rest = BODY_PARTS_LIST.filter(p => !listed.has(p.id));
if (rest.length) L.push('', 'Otras partes del modelo no listadas: ' + rest.map(p => `${p.id} (${p.region}, ${cardsByPart(p.id).length} cartas)`).join(' · ') + '.');

/* región: resumen */
L.push('', '### Resumen por región (cartas APPROVED que la tocan, con el receptor que más tiene)', '', '| Región | Cartas | Unidades | Targets con cartas / targets del modelo | Estado |', '|---|---|---|---|---|');
const REGION_STATUS = {};
for (const r of BODY_REGIONS) {
  const us = units.filter(u => regionOf(u.card, u.v) === r && u.card.interactionType !== 'UNDRESS');
  const ids = [...new Set(us.map(u => u.card.id))], partsIn = BODY_PARTS_LIST.filter(p => p.region === r), withCards = partsIn.filter(p => cardsByPart(p.id).length);
  const st = !ids.length ? 'CONTENT_GAP' : ids.length >= 4 ? 'WELL_COVERED' : 'LIGHT_COVERAGE';
  REGION_STATUS[r] = st;
  L.push(`| ${r} | ${ids.length}${ids.length ? ' (' + ids.join(' ') + ')' : ''} | ${us.length} | ${withCards.length} / ${partsIn.length} (${withCards.map(p => p.id).join(', ') || '—'}) | ${st} |`);
}

/* ---------- 3 · por receptor ---------- */
L.push('', '## 3 · Opciones reales por receptor (acceso completo, actor compatible, umbral tardío cruzado)', '', '| Receptor | Unidades elegibles | Genitales | No genitales | No genitales a piel (DIRECT) | Regiones disponibles | Targets disponibles | % genital del catálogo elegible | Cartas tardías incluidas |', '|---|---|---|---|---|---|---|---|---|');
const RECV_ELIG = {};
for (const r of RECEIVERS) {
  const k = sig(r), us = units.filter(u => ELIG[u.key][k].includes('acceso completo') && u.card.interactionType !== 'UNDRESS');
  const gen = us.filter(u => parts(u).some(p => GENITAL.includes(p))), non = us.filter(u => !parts(u).some(p => GENITAL.includes(p)));
  const regs = [...new Set(us.map(u => regionOf(u.card, u.v)))], tg = [...new Set(us.flatMap(parts))];
  RECV_ELIG[k] = { us, gen, non, regs, tg };
  L.push(`| ${k} | ${us.length} | ${gen.length} | ${non.length} | ${non.filter(u => mode(u.card) === 'DIRECT_SKIN_ACCESS').length} | ${regs.length}: ${regs.join(', ')} | ${tg.length}: ${tg.join(', ')} | ${pct(gen.length, us.length)} | ${us.filter(u => u.card.minIntimacyCards).map(u => u.key).join(' ') || '—'} |`);
}
L.push('', '### Por receptor y región: unidades elegibles con acceso completo', '', '| Región | ' + RECEIVERS.map(sig).join(' | ') + ' |', '|---|' + RECEIVERS.map(() => '---').join('|') + '|');
for (const rg of BODY_REGIONS) L.push(`| ${rg} | ` + RECEIVERS.map(r => { const us = RECV_ELIG[sig(r)].us.filter(u => regionOf(u.card, u.v) === rg); return us.length ? `${us.length} (${[...new Set(us.map(u => u.card.id))].join(' ')})` : '0'; }).join(' | ') + ' |');
/* por estado de ropa: qué puede jugarse realmente */
L.push('', '### Por receptor y estado de ropa: unidades elegibles (sin UNDRESS) · genitales / no genitales', '', '| Estado del receptor | ' + RECEIVERS.map(sig).join(' | ') + ' |', '|---|' + RECEIVERS.map(() => '---').join('|') + '|');
for (const s of Object.keys(STATES)) L.push(`| ${s} | ` + RECEIVERS.map(r => { const us = units.filter(u => u.card.interactionType !== 'UNDRESS' && ELIG[u.key][sig(r)].includes(s)); const g = us.filter(u => parts(u).some(p => GENITAL.includes(p))).length; return `${us.length} · ${g} / ${us.length - g}`; }).join(' | ') + ' |');
L.push('', 'Lectura: «todo puesto» = cartas que no exigen piel (boca, cuello, THROUGH_TOP). Con camiseta fuera y brasier puesto solo entra I21 (THROUGH_BRA). Las partes tapadas por el pantalón (muslos, nalgas, piernas) solo con el pantalón fuera; las íntimas, solo con la ropa interior fuera (o THROUGH_PANTIES / THROUGH_BOXERS sobre la prenda).');

/* ---------- 4 · duplicados semánticos potenciales ---------- */
L.push('', '## 4 · POTENTIAL_SEMANTIC_DUPLICATE', '', 'Criterio: misma familia de acción (herramienta del actor agrupada: mano/dedos · boca/lengua/labios · dientes · pies · glande/pene · cuerpo), mismo target, mismo access mode y mismo tipo. No se elimina nada; es una lista para revisar.', '');
const toolClass = t => { const k = ACTOR_TOOLS[t]; if (!k) return t; if (['teeth'].includes(t)) return 'dientes'; if (k.kind === 'mouth') return t === 'breath' ? 'aliento' : 'boca'; if (k.kind === 'hand') return 'mano/dedos'; if (t === 'feet') return 'pies'; if (['penis', 'glans'].includes(t)) return 'pene/glande'; return k.kind; };
const groups = {};
for (const u of units) { if (u.card.interactionType === 'UNDRESS') continue; const g = `${[...new Set(tools(u).map(toolClass))].join('+')} → ${parts(u).join('+')} · ${mode(u.card)} · ${u.card.interactionType}`; (groups[g] ||= []).push(u); }
let dups = 0;
for (const [g, us] of Object.entries(groups)) { const ids = new Set(us.map(u => u.card.id)); if (ids.size < 2) continue; dups++; L.push(`- **${g}**: ${us.map(u => `${u.key} «${texts(u)[0]}»`).join(' · ')}`); }
if (!dups) L.push('Ninguno.');
L.push('', 'Pares que comparten target y modo pero con acción distinta (no duplicados, se listan por transparencia): ' + Object.entries(units.filter(u => u.card.interactionType !== 'UNDRESS').reduce((m, u) => { const k = parts(u).join('+') + ' · ' + mode(u.card); (m[k] ||= new Set()).add(u.card.id); return m; }, {})).filter(([, s]) => s.size >= 2).map(([k, s]) => `${k} (${[...s].join(' ')})`).join(' · ') + '.');

/* ---------- 5 · simulaciones ---------- */
const regionOfRound = r => (r.interactionType === 'UNDRESS' ? 'UNDRESS' : r.region), partsOfRound = r => r.parts || [];
const accessLabel = (e, p) => { const s = e.clothing[p]; const full = s.top !== 'ON' && s.bottoms !== 'ON' && s.bra !== 'ON' && s.panties !== 'ON' && s.boxers !== 'ON'; const any = s.top !== 'ON' || s.bottoms !== 'ON' || s.socks !== 'ON'; return full ? 'acceso completo' : any ? 'parcial' : 'vestido'; };
function newStats() { return { n: 0, nInter: 0, region: {}, target: {}, intimate: 0, cards: {}, byAccess: { vestido: { n: 0, intimate: 0, region: {} }, parcial: { n: 0, intimate: 0, region: {} }, 'acceso completo': { n: 0, intimate: 0, region: {} } }, uniqueRegions: [], uniqueTargets: [], repeats5: 0, seq2: 0, seq3: 0, seq2Intimate: 0, seq3Intimate: 0, first: {}, sessions: 0 }; }
function record(S, e, r, ids, run) {
  const recv = r.receiver, k = sig(e.anatomy(recv).declared); const s = S[k];
  if (r.transition) return; s.n++; if (r.interactionType !== 'UNDRESS') s.nInter++;
  const reg = regionOfRound(r); inc(s.region, reg); for (const p of partsOfRound(r)) inc(s.target, p); if (reg === 'INTIMATE') s.intimate++; inc(s.cards, r.cardId + (r.variantId ? '·' + r.variantId : ''));
  const acc = accessLabel(e, recv); s.byAccess[acc].n++; if (reg === 'INTIMATE') s.byAccess[acc].intimate++; inc(s.byAccess[acc].region, reg);
  if (ids.length >= 5 && ids.slice(-5).includes(r.cardId)) s.repeats5++;
}
function simulate({ sessions, cards, naked, label, seedBase, pairs = PAIRS, only = null }) {
  const S = Object.fromEntries(RECEIVERS.map(r => [sig(r), newStats()]));
  const glob = { seq2: 0, seq3: 0, seq2I: 0, seq3I: 0 };
  const perSession = Object.fromEntries(RECEIVERS.map(r => [sig(r), { regions: [], targets: [], seq2: 0, seq3: 0, seq2I: 0, seq3I: 0, first: {}, n: 0 }]));
  let late = { before35: 0, hits: 0, sessionsWith: 0, pos: [] };
  for (let s = 0; s < sessions; s++) {
    const pair = pairs[s % pairs.length], e = mk(pair, seedBase + s);
    if (naked) e.clothing = [fullAccess(pair[0]), fullAccess(pair[1])];
    const ids = [], per = {}; let lateHit = false, gLast = null, gRun = 0;
    for (const p of [0, 1]) per[p] = { regions: new Set(), targets: new Set(), last: null, run: 0, first: {}, n: 0 };
    for (let i = 0; i < cards; i++) {
      if (e.pauseDue()) e.continueGuided();
      const r = e.roll(); if (!r) break;
      record(S, e, r, ids, null); ids.push(r.cardId);
      if (!r.transition && r.interactionType !== 'UNDRESS') { if (r.region === gLast) { gRun++; if (gRun === 2) { glob.seq2++; if (r.region === 'INTIMATE') glob.seq2I++; } if (gRun >= 3) { glob.seq3++; if (r.region === 'INTIMATE') glob.seq3I++; } } else gRun = 1; gLast = r.region; }
      if (!r.transition) {
        const q = per[r.receiver]; q.n++; const reg = r.region; q.regions.add(reg); for (const p of r.parts) q.targets.add(p);
        if (!(reg in q.first)) q.first[reg] = q.n;
        if (reg === q.last && r.interactionType !== 'UNDRESS') { q.run++; if (q.run === 2) { q.seq2 = (q.seq2 || 0) + 1; if (reg === 'INTIMATE') q.seq2I = (q.seq2I || 0) + 1; } if (q.run >= 3) { q.seq3 = (q.seq3 || 0) + 1; if (reg === 'INTIMATE') q.seq3I = (q.seq3I || 0) + 1; } } else q.run = 1;
        q.last = r.interactionType === 'UNDRESS' ? q.last : reg;
        if (['I32', 'I33'].includes(r.cardId)) { late.hits++; if (e.session.intimacyCardCount < 35) late.before35++; if (!lateHit) { lateHit = true; late.sessionsWith++; late.pos.push(r.n); } }
      }
      if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
    }
    for (const p of [0, 1]) { const k = sig(e.anatomy(p).declared), q = per[p], ps = perSession[k]; ps.n++; ps.regions.push(q.regions.size); ps.targets.push(q.targets.size); ps.seq2 += q.seq2 || 0; ps.seq3 += q.seq3 || 0; ps.seq2I += q.seq2I || 0; ps.seq3I += q.seq3I || 0; for (const [reg, n] of Object.entries(q.first)) (ps.first[reg] ||= []).push(n); }
  }
  L.push('', `## ${label}`, '', `${sessions} sesiones × ${cards} cartas, parejas rotando entre ${pairs.length} configuraciones (${pairs.map(p => sig(p[0]) + ' ↔ ' + sig(p[1])).join(' · ')}). Cada carta se atribuye a su RECEPTOR. Las UNDRESS se cuentan aparte de FULL_BODY.`, '', `Secuencias globales de la sesión (tal como las ve el motor, sin UNDRESS, cualquier receptor): dos cartas seguidas de la misma región ${glob.seq2} (${glob.seq2I} INTIMATE) · tres o más seguidas ${glob.seq3} (${glob.seq3I} INTIMATE).`);
  for (const r of RECEIVERS) {
    const k = sig(r), s = S[k], ps = perSession[k]; if (!s.n || (only && k !== only)) continue;
    L.push('', `### Receptor ${k} · ${s.n} cartas en ${ps.n} sesiones`, '', '| Región | Cartas | % |', '|---|---|---|');
    for (const rg of [...BODY_REGIONS, 'UNDRESS']) if (s.region[rg]) L.push(`| ${rg} | ${s.region[rg]} | ${pct(s.region[rg], s.n)} |`);
    L.push('', `INTIMATE: ${pct(s.intimate, s.n)} de todas las cartas · ${pct(s.intimate, s.nInter)} de las interacciones (sin UNDRESS) · regiones únicas por sesión: ${avg(ps.regions)} · targets únicos por sesión: ${avg(ps.targets)} · repeticiones de carta dentro de las 5 anteriores: ${s.repeats5} · dos cartas seguidas de la misma región (mismo receptor): ${ps.seq2} (${ps.seq2I} INTIMATE) · tres o más seguidas: ${ps.seq3} (${ps.seq3I} INTIMATE).`);
    L.push('', 'Targets: ' + Object.entries(s.target).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(' · '));
    L.push('', 'Primera aparición media de cada región (carta nº, sesiones en que aparece): ' + BODY_REGIONS.filter(rg => ps.first[rg]).map(rg => `${rg} ${avg(ps.first[rg])} (${ps.first[rg].length}/${ps.n})`).join(' · '));
    if (!naked) L.push('', 'Antes / después de quitar prendas (estado del receptor en el momento de la carta): ' + Object.entries(s.byAccess).filter(([, v]) => v.n).map(([a, v]) => `${a}: ${v.n} cartas, INTIMATE ${pct(v.intimate, v.n)}, regiones ${Object.entries(v.region).sort((x, y) => y[1] - x[1]).map(([rg, n]) => rg + ' ' + pct(n, v.n)).join(', ')}`).join(' · '));
    L.push('', 'Cartas: ' + Object.entries(s.cards).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${n}`).join(' · '));
  }
  return { S, late };
}
/* 1 000 selecciones con acceso completo: 5 parejas × 200 cartas */
L.push('', '## 5 · 1 000 selecciones con acceso completo por receptor', '', 'Para cada receptor, 8 sesiones × 250 cartas con una pareja complementaria (quien tiene vulva juega con quien tiene pene y viceversa) y acceso completo desde el inicio; se cuentan solo las cartas que ese receptor recibe (≈ 1 000 por receptor).');
const PARTNER = { 'senos+vulva': ['pene'], pene: ['senos+vulva'], vulva: ['pene'], 'pene+senos': ['vulva'] };
const EXPAND = { 'senos+vulva': ['vulva', 'senos'], pene: ['pene'], vulva: ['vulva'], 'pene+senos': ['pene', 'senos'] };
for (const r of RECEIVERS) { const k = sig(r); simulate({ sessions: 8, cards: 250, naked: true, label: `5.${RECEIVERS.indexOf(r) + 1} · Receptor ${k} (acceso completo)`, seedBase: 100 + 10 * RECEIVERS.indexOf(r), pairs: [[r, EXPAND[PARTNER[k][0]]]], only: k }); }
const normal = simulate({ sessions: 200, cards: 30, naked: false, label: '6 · 200 sesiones normales (30 cartas, empiezan vestidos, UNDRESS aplicada como en la app)', seedBase: 1000 });
const long = simulate({ sessions: 200, cards: 50, naked: true, label: '7 · 200 sesiones largas (50 cartas, acceso completo desde el inicio)', seedBase: 5000 });
/* LATE_SESSION */
L.push('', '## 8 · Cartas tardías (I32 · I33)', '', `- Sesiones normales (30 cartas): apariciones ${normal.late.hits}, antes de la carta 35: ${normal.late.before35}.`, `- Sesiones largas (50 cartas): apariciones ${long.late.hits} en ${long.late.sessionsWith} de 200 sesiones (${pct(long.late.sessionsWith, 200)}); antes de la carta 35: ${long.late.before35}; primera aparición media en la carta ${avg(long.late.pos)}${long.late.pos.length ? ` (mín ${Math.min(...long.late.pos)}, máx ${Math.max(...long.late.pos)})` : ''}.`, '- La pausa 13–17 no reinicia el contador (continueGuided conserva intimacyCardCount).');
/* cadenas íntimas por target */
{ let chains = { 'pene→glande→testículos': 0, 'vulva→clítoris→vagina': 0, 'tres íntimas seguidas (cualquier orden)': 0, 'dos íntimas seguidas': 0 }; let recvCards = 0;
  const G = { penis: 'P', glans: 'G', testicles: 'T', vulva: 'V', clitoris: 'C', vagina: 'N' };
  for (let s = 0; s < 200; s++) { const pair = PAIRS[s % PAIRS.length], e = mk(pair, 9000 + s); e.clothing = [fullAccess(pair[0]), fullAccess(pair[1])]; const seqs = { 0: [], 1: [] };
    for (let i = 0; i < 50; i++) { if (e.pauseDue()) e.continueGuided(); const r = e.roll(); if (r.transition || r.interactionType === 'UNDRESS') continue; recvCards++; const g = r.parts.map(p => G[p]).filter(Boolean)[0] || '-'; seqs[r.receiver].push(g); }
    for (const p of [0, 1]) { const q = seqs[p].join(''); chains['pene→glande→testículos'] += (q.match(/PGT/g) || []).length; chains['vulva→clítoris→vagina'] += (q.match(/VCN/g) || []).length; chains['tres íntimas seguidas (cualquier orden)'] += (q.match(/(?=[PGTVCN]{3})/g) || []).length; chains['dos íntimas seguidas'] += (q.match(/(?=[PGTVCN]{2})/g) || []).length; } }
  L.push('', '## 9 · Secuencias íntimas (200 sesiones largas, acceso completo, por receptor)', '', `${recvCards} cartas de interacción.`, ...Object.entries(chains).map(([k, v]) => `- ${k}: ${v}`)); }

/* ---------- 10 · resumen ---------- */
const partLabel = Object.fromEntries(MIKE_TARGETS.filter(x => x[1]).map(x => [x[1], x[0]]));
L.push('', '## 10 · Resumen', '', '### COBERTURA FUERTE');
for (const [p, us] of Object.entries(unitsByPart)) if (cardsByPart(p).length >= 3) L.push(`- ${BODY_PARTS[p].region} → ${partLabel[p] || p}: ${cardsByPart(p).length} cartas (${cardsByPart(p).join(' ')}) · ${modesByPart(p).join(', ')}${BODY_PARTS[p].anatomy ? ' · exige ' + BODY_PARTS[p].anatomy : ''}`);
L.push('', '### COBERTURA LIGERA');
for (const [p] of Object.entries(unitsByPart)) if (cardsByPart(p).length < 3) L.push(`- ${BODY_PARTS[p].region} → ${partLabel[p] || p}: ${cardsByPart(p).length} (${cardsByPart(p).join(' ')}) · ${modesByPart(p).join(', ')}${BODY_PARTS[p].anatomy ? ' · exige ' + BODY_PARTS[p].anatomy : ''}`);
L.push('', '### CONTENT GAPS (targets del modelo sin ninguna carta APPROVED en Intimidad)');
for (const r of BODY_REGIONS) { const empty = BODY_PARTS_LIST.filter(p => p.region === r && !cardsByPart(p.id).length); if (empty.length) L.push(`- ${r}${REGION_STATUS[r] === 'CONTENT_GAP' ? ' (región entera a 0)' : ''}: ${empty.map(p => (partLabel[p.id] || p.id) + ' 0').join(' · ')}`); }
L.push('', 'Targets pedidos que no existen en el modelo (ni como parte receptora): ' + MIKE_TARGETS.filter(x => !x[1]).map(x => `${x[0]} — ${x[2]}`).join(' · ') + '.');
const text = L.join('\n'); console.log(text); if (OUT) writeFileSync(OUT, text + '\n');
