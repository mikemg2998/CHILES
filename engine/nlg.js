/* NaturalLanguageGenerator: una instrucción que parece escrita por una persona.
   La estructura la decide la condición (slot) y la posición de la forma (pos). */
import { ACTION, ZONE, METHOD, CONDITION } from './catalog.js';

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const low = s => s.charAt(0).toLowerCase() + s.slice(1);
const clean = s => s.replace(/\ba el\b/g, 'al').replace(/\by (h?i)/gi, 'e $1').replace(/\bde el\b/g, 'del').replace(/\s+/g, ' ').replace(/\s+([,;:.])/g, '$1').replace(/,\s*,/g, ',').replace(/:\s*,/g, ':').replace(/,\s*\./g, '.').trim();

function fill(t, ctx) {
  return t.replace(/\{P\}/g, ctx.partner).replace(/\{PF\}/g, ctx.performer).replace(/\{ALT\}/g, ctx.alt).replace(/\{V\}/g, ctx.verb);
}
/* "{ZONE}" = "el cuello de Ana" o "su cuello" si la pareja ya se nombró; "{ZONE:bare}" = "el cuello" */
function zoneText(frame, ctx, poss) {
  return frame.replace(/\{ZONE:bare\}/g, ctx.zoneBare).replace(/\{ZONE\}/g, poss ? ctx.zonePoss : `${ctx.zoneBare} de ${ctx.partner}`);
}
/* núcleo: verbo + forma + zona */
function core(a, m, ctx, poss) {
  let f = zoneText(poss && a.frameP ? a.frameP : a.frame, ctx, poss);
  let adv = '', tail = '', end = '';
  if (m) {
    const t = fill(m.text, ctx);
    if (m.pos === 'adv') adv = t; else if (m.pos === 'phrase') tail = t; else end = t;
  }
  let s = fill(f, ctx).replace('{M}', adv);
  if (tail) s += ', ' + tail;
  if (end) s += ', ' + end;
  return clean(s);
}

export const NaturalLanguageGenerator = {
  /* combo {action, zone, method, cond, alt}; opts {partner, performer} → {phrase, swap} */
  phrase(combo, opts = {}) {
    const a = ACTION[combo.action], z = ZONE[combo.zone], m = combo.method ? METHOD[combo.method] : null, c = combo.cond ? CONDITION[combo.cond] : null;
    const partner = opts.partner || 'tu pareja', performer = opts.performer || 'tú';
    const ctx = { partner, performer, verb: a.verb, zoneBare: z.n, zonePoss: z.np, alt: combo.alt ? ZONE[combo.alt].n : '' };
    if (!c) return cap(core(a, m, ctx, false)) + '.';
    const ct = fill(a.contactType === 'boca' && c.textBoca ? c.textBoca : c.text, ctx).replace(/\{ZONE\}/g, ctx.zoneBare);
    switch (c.slot) {
      case 'intro': return clean(cap(ct) + ' ' + low(core(a, m, ctx, false)) + '.');
      case 'prep': // la preparación ya nombra a la pareja → posesivo después
      case 'antic':
      case 'path': return clean(cap(ct) + ' ' + low(core(a, m, ctx, true)) + '.');
      case 'after': return clean(cap(core(a, m, ctx, false)) + '. ' + ct);
      case 'choice': return clean(cap(core(a, m, ctx, false)) + ', ' + ct + '.');
      case 'end': return clean(cap(core(a, m, ctx, false)) + ', ' + ct + '.');
      case 'swap': return clean(cap(ct) + ' ' + cap(core(a, m, ctx, false)) + '.');
      default: { // tail; si la frase ya nombra a la pareja dos veces, usa la forma intro cuando exista
        let base = core(a, m, ctx, false);
        const mentions = (base.split(partner).length - 1) + (ct.split(partner).length - 1);
        if (mentions >= 2 && c.intro) return clean(cap(fill(c.intro, ctx)) + ' ' + low(core(a, m, ctx, true)) + '.');
        return clean(cap(base) + ', ' + ct + '.');
      }
    }
  },
  faces(combo) {
    const a = ACTION[combo.action], z = ZONE[combo.zone], m = combo.method ? METHOD[combo.method] : null, c = combo.cond ? CONDITION[combo.cond] : null;
    const zn = z.n.replace(/^(el|la|los|las) /, '').replace(/,.*$/, '');
    return { action: a.name, zone: cap(zn), method: m ? cap(m.text.replace(/\{P\}/g, 'pareja').replace(/^(solo |durante |con |de |a |en |empezando )/, '')) : '—', cond: c ? c.short : '—' };
  },
};
