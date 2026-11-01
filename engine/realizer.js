/* HUMAN TEXT REALIZER. De una combinación validada (acción, herramienta, zona, estilo, nivel, patrón) a una frase que
   parezca escrita por una persona: elige una estructura entre varias, no nombra la herramienta cuando es obvia, no
   verbaliza todos los elementos, convierte el estilo en lenguaje y penaliza las estructuras repetidas recientemente.
   Devuelve también humanLikenessScore (heurísticas de frase mecánica) para que el filtro de calidad rechace o recomponga. */
import { SHAPES, GUIDED_SHAPES } from './data/shapes.js';
import { TARGETS } from './data/targets.js';
import { ACTOR_TOOLS } from './data/actorTools.js';
import { ACTIONS } from './data/actions.js';
import { STYLES } from './data/styles.js';
import { shapeFits, COMBO } from './grammar.js';

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const low = s => s.charAt(0).toLowerCase() + s.slice(1);
const clean = s => s.replace(/\ba el\b/g, 'al').replace(/\bde el\b/g, 'del').replace(/\by (h?i)/gi, 'e $1').replace(/\s+/g, ' ').replace(/\s+([,;:.])/g, '$1').replace(/,\s*,/g, ',').replace(/:\s*,/g, ':').replace(/,\s*\./g, '.').replace(/;\s*,/g, ';').trim();
const pron = n => /^(el|un) /.test(n) ? 'lo' : /^(los|unos) /.test(n) ? 'los' : /^(las|unas) /.test(n) ? 'las' : 'la';
const STOP = new Set(['de', 'la', 'el', 'los', 'las', 'con', 'en', 'a', 'y', 'e', 'que', 'su', 'sus', 'un', 'una', 'tu', 'tus', 'sin', 'al', 'del', 'por', 'se', 'lo', 'le', 'te', 'muy', 'más', 'o', 'sobre', 'hasta', 'para', 'como', 'si', 'ahí', 'así']);

/* estructuras candidatas para una combinación compilada (cartesiana o blueprint posicional) */
export function shapesForCombo(c, style, level, guided) {
  if (c && c.kind === 'POSITIONAL') { if (guided) return []; const b = c.blueprint; return (b.copyVariants || []).map((t, i) => ({ t, w: 1, fixed: !t.includes('{S}'), stylePos: t.includes('{S}') ? 'adv' : 'none', id: `${c.key}#${i}` })).filter(s => !style || s.t.includes('{S}') || style === null); }
  return shapesFor(c.action, c.tool, c.target, style, level, guided);
}
/* estructuras candidatas para la combinación cartesiana */
export function shapesFor(action, tool, target, style, level, guided) {
  const z = TARGETS[target], t = ACTOR_TOOLS[tool], a = ACTIONS[action];
  // longitud estimada de la frase base: una guía solo cabe en una frase corta
  const est = s => s.t.replace(/\{S(:clause)?\}/g, '').replace(/\{TOOL!?\}/g, (m) => (m === '{TOOL!}' || !a.implicitTools.includes(tool)) ? t.phrase : '').replace(/\{T(:\w+)?\}/g, z.n + ' de X').trim().split(/\s+/).length;
  return (SHAPES[action] || []).map((s, i) => ({ ...s, id: `${action}#${i}` })).filter(s => shapeFits(s, tool, target, style, level) && !(guided && (s.fixed || est(s) > 12)));
}

/* elige estructura (penalizando las recientes) y compone. ctx: { partner, rng, recentShapes: [ids], style, level, guided } */
export function realize(combo, ctx) {
  const a = ACTIONS[combo.action], z = TARGETS[combo.target], t = ACTOR_TOOLS[combo.tool];
  const rng = ctx.rng, partner = ctx.partner || 'tu pareja', style = combo.style ? STYLES[combo.style] : null, recent = ctx.recentShapes || [];
  const compiled = (combo.key && COMBO[combo.key]) || COMBO[`${combo.action}|${combo.tool}|${combo.target}`];
  let cands = compiled && compiled.kind === 'POSITIONAL' ? shapesForCombo(compiled, combo.style || null, combo.level, combo.pattern === 'GUIDED') : shapesFor(combo.action, combo.tool, combo.target, combo.style || null, combo.level, combo.pattern === 'GUIDED');
  if (!cands.length) return null;
  const pick = rng.weighted(cands.map(s => ({ item: s, weight: s.w * shapePenalty(s.id, recent) })));
  const cc = { a, z, t, partner, style, rng, guided: combo.pattern === 'GUIDED', level: combo.level };
  const text = compose(pick, cc);
  const styleUsed = !!cc.styleUsed;
  const structure = sentenceShape(pick, styleUsed, combo.pattern === 'GUIDED');
  const human = humanLikeness(text, { partner, styleUsed, guided: combo.pattern === 'GUIDED', toolMentioned: text.includes(t.phrase) });
  return { text, shapeId: pick.id, shape: structure, styleUsed, guidedAffects: cc.guidedAffects || null, humanLikeness: human.score, humanFlags: human.flags, shapeCandidates: cands.length };
}
export function shapePenalty(id, recent) { const i = recent.indexOf(id); return i < 0 ? 1 : i < 2 ? 0.12 : i < 5 ? 0.45 : 0.8; }
/* firma de la estructura: plantilla + dónde fue el estilo + guía (para el historial de formas y las estadísticas) */
export const sentenceShape = (shape, styled, guided) => `${shape.id}${styled ? (shape.t.includes('{S}') ? '+adv' : '+clause') : ''}${guided ? '+guided' : ''}`;

function compose(shape, c) {
  const { a, z, t, partner, style, rng, guided } = c;
  let s = shape.t;
  const named = s.includes('{P}');
  const toolText = a.implicitTools.includes(t.id) ? '' : t.phrase;
  s = s.replace(/\{TOOL!\}/g, t.phrase).replace(/\{TOOL\}/g, toolText);
  const zoneBare = z.n, zonePoss = z.np;
  s = s.replace(/\{T:pron\}/g, pron(z.n)).replace(/\{T:poss\}/g, zonePoss).replace(/\{T:bare\}/g, zoneBare);
  // la zona: «de {P}» la primera vez si la pareja no se nombra; posesivo si ya aparece
  let first = true;
  s = s.replace(/\{T\}/g, () => { const r = first && !named ? `${zoneBare} de ${partner}` : zonePoss; first = false; return r; });
  s = s.replace(/\{P\}/g, partner);
  // estilo
  c.styleUsed = false;
  if (style && shape.stylePos !== 'none') {
    // una realización del estilo no puede repetir el verbo de la acción («aprieta…, apretando un poco»)
    const fresh = list => list.filter(r => !r.split(/\s+/).some(w => w.length >= 4 && a.stems.some(st => w.toLowerCase().startsWith(st))));
    const nearCon = /\bcon \{S\}|\{S\} con\b/.test(s);
    const adv = fresh(style.adv).filter(r => !(nearCon && /^con\b/.test(r))), clause = fresh(style.clause);
    if (s.includes('{S:clause}') && clause.length) { s = s.replace('{S:clause}', rng.pick(clause)); c.styleUsed = true; }
    else if (s.includes('{S}') && adv.length) { s = s.replace('{S}', rng.pick(adv)); c.styleUsed = true; }
    else if (!shape.t.includes(',') && clause.length) { s = s.replace('{S}', ''); s = s + ', ' + rng.pick(clause); c.styleUsed = true; } // la frase ya trae su propia coletilla: no se le cuelga otra
  }
  s = s.replace(/\s?\{S:clause\}/g, '').replace(/\s?\{S\}/g, '');
  s = clean(s);
  if (guided) {
    const hasY = / y /.test(s), hasComma = s.includes(',');
    const coreWords = s.split(/\s+/).length, wordsOf = g => g.t.replace('{CORE}', '').trim().split(/\s+/).length - 1;
    let opts = GUIDED_SHAPES.filter(g => !(hasY && / y /.test(g.t.replace('{CORE}', ''))) && !(hasComma && g.t.startsWith('{CORE},')));
    const short = opts.filter(g => coreWords + wordsOf(g) <= 18); // la guía no puede convertir una frase corta en una larga
    if (short.length) opts = short; else opts = [opts.length ? opts : GUIDED_SHAPES].flat().sort((a, b) => wordsOf(a) - wordsOf(b)).slice(0, 2);
    const g = rng.pick(opts);
    const alreadyNamed = s.includes(partner), hand = /\bmanos?\b/.test(s);
    const gt = (alreadyNamed ? (hand ? g.tph : g.tp) : (hand ? g.th : g.t)).replace(/\{P\}/g, partner);
    s = clean(gt.replace('{CORE}', s.replace(/\.$/, '')));
    c.guidedAffects = g.affects;
  }
  return cap(s).replace(/[.;,]*$/, '') + '.';
}

/* HEURÍSTICAS DE FRASE HUMANA. 1 = natural; penaliza lo mecánico. */
export function humanLikeness(text, o = {}) {
  const flags = [];
  let score = 1;
  const words = text.replace(/[.,;:]/g, '').split(/\s+/);
  if (words.length > 16) { score -= Math.min(0.6, 0.06 * (words.length - 16)); flags.push('LONG'); }
  const commas = (text.match(/[,;]/g) || []).length;
  if (commas >= 3) { score -= 0.15 * (commas - 2); flags.push('TOO_MANY_CLAUSES'); }
  const idiomFree = text.replace(/\b(\w+) (a|y|tras|por|contra|con) \1\b/gi, '$1'); // «de lado a lado», «poco a poco»: giros, no repeticiones
  const seen = new Set(); for (const w of idiomFree.replace(/[.,;:]/g, '').split(/\s+/).map(x => x.toLowerCase())) { if (STOP.has(w) || w.length < 4 || (o.partner && w === o.partner.toLowerCase())) continue; if (seen.has(w)) { score -= 0.22; flags.push('REPEATED_WORD:' + w); } seen.add(w); }
  if (o.partner) { const k = text.split(o.partner).length - 1; if (k >= 2) { score -= 0.12 * (k - 1); flags.push('NAME_REPEATED'); } }
  const cons = (text.match(/\bcon (la|las|los|el|un|una) /g) || []).length; if (cons >= 2) { score -= 0.15; flags.push('TOO_MANY_COMPLEMENTS'); }
  const allCons = (text.match(/\bcon\b/g) || []).length; if (allCons >= 2 && cons < 2) { score -= 0.12; flags.push('REPEATED_CON'); } // «con ritmo … con los dedos»: dos complementos con la misma preposición
  if (o.styleUsed && o.guided && words.length > 14) { score -= 0.1; flags.push('OVERLOADED'); }
  if (/\b(\w{4,}) \1\b/i.test(text)) { score -= 0.3; flags.push('DOUBLED'); }
  if (/ (muy|más) (muy|más) /.test(text) || / y y /.test(text) || /,\s*y\b.*,\s*y\b/.test(text)) { score -= 0.25; flags.push('ODD_ORDER'); }
  return { score: Math.max(0, Math.min(1, Math.round(score * 1000) / 1000)), flags };
}
