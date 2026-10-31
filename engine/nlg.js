/* NaturalLanguageGenerator: convierte una tirada en una instrucción natural, con varias plantillas. */
import { ACTION, ZONE, STYLE, CONDITION } from './catalog.js';

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const clean = s => s.replace(/\ba el\b/g, 'al').replace(/\bde el\b/g, 'del').replace(/\s+/g, ' ').replace(/\s+,/g, ',').replace(/,\s*,/g, ',').replace(/\s+\./g, '.').replace(/,\s*\./g, '.').trim();

function fill(t, ctx) {
  return t.replace(/\{P\}/g, ctx.partner).replace(/\{ZONE\}/g, ctx.zone).replace(/\{ALT\}/g, ctx.alt || '').replace(/\{V\}/g, ctx.verb);
}

/* Construye el núcleo "acción + estilo + zona" respetando dónde va cada tipo de estilo. */
function core(action, zone, style, ctx) {
  let frame = action.frame;
  let adv = '', tailStyle = '';
  if (style) {
    const txt = fill(style.text, ctx);
    if (frame.trim().endsWith('{STYLE}')) adv = txt; // hueco al final: cualquier estilo va dentro
    else if (style.kind === 'adv' && frame.includes('{STYLE}')) adv = txt;
    else tailStyle = txt; // phrase y tail van después, separados por coma
  }
  let s = fill(frame, ctx).replace('{STYLE}', adv);
  if (tailStyle) s += ', ' + tailStyle;
  return clean(s);
}

export const NaturalLanguageGenerator = {
  /* combo: {action, zone, style, cond, alt, wildcard}; opts: {partner, rng, template} */
  phrase(combo, opts) {
    const a = ACTION[combo.action], z = ZONE[combo.zone], s = STYLE[combo.style], c = CONDITION[combo.cond];
    const partner = opts.partner || 'tu pareja';
    const ctx = { partner, zone: z ? z.n : '', alt: combo.alt ? ZONE[combo.alt].n : '', verb: a ? a.verb : '' };
    const rng = opts.rng;
    const templates = [];
    if (combo.wildcard === 'freeAction') {
      // sin acción: "Tú eliges qué hacer en X, estilo, condición"
      let s1 = `Tú eliges qué hacer en ${ctx.zone} de ${partner}`;
      if (s) s1 += (s.kind === 'adv' ? ', ' : ', ') + fill(s.text, ctx);
      if (c) s1 += ', ' + fill(c.tail, ctx);
      return cap(clean(s1)) + '.';
    }
    if (combo.wildcard === 'freeZone') {
      let s1 = `${a.verb || 'Haz lo que quieras'} donde tú elijas` + (a.verb ? ` a ${partner}` : '');
      if (a.id === 'parejaElige') s1 = `Pregúntale a ${partner} qué quiere, en la zona que tú elijas`;
      if (s) s1 += ', ' + fill(s.text, ctx);
      if (c) s1 += ', ' + fill(c.tail, ctx);
      return cap(clean(s1)) + '.';
    }
    const base = core(a, z, s, ctx);
    if (!c) return cap(base) + '.';
    // Plantilla A: núcleo + condición al final
    templates.push(() => cap(base) + (c.tail.startsWith('y ') || c.tail.startsWith('o,') ? ' ' : ', ') + fill(c.tail, ctx) + '.');
    // Plantilla B: condición como apertura
    if (c.intro) templates.push(() => cap(fill(c.intro, ctx)) + ' ' + base.charAt(0).toLowerCase() + base.slice(1) + '.');
    // Plantilla C: dos frases
    if (c.sentence) templates.push(() => cap(base) + '. ' + cap(fill(c.sentence, ctx)));
    const idx = opts.template != null ? opts.template % templates.length : Math.floor((rng ? rng.next() : Math.random()) * templates.length);
    return clean(templates[idx]());
  },
  /* etiqueta corta de cada dado */
  faces(combo) {
    const a = ACTION[combo.action], z = ZONE[combo.zone], s = STYLE[combo.style], c = CONDITION[combo.cond];
    return {
      action: combo.wildcard === 'freeAction' ? '⭐' : (a ? a.name : '—'),
      zone: combo.wildcard === 'freeZone' ? '⭐' : (z ? cap(z.n.replace(/^(el|la|los|las) /, '')) : '—'),
      style: s ? s.short : '—',
      cond: c ? c.short : '—',
    };
  },
};
