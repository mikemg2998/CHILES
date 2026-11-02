/* TEXT REALIZER. De una carta elegida (variante, lado, limitación) a una frase que se entiende al instante.
   Varía entre las estructuras aprobadas por el diseñador; nunca cambia el significado ni inventa gestos. */
import { PLAY_CONSTRAINT_COPY } from '../content/schema.js';
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fill = (t, names) => t.replace(/\{R\}/g, names.receiver).replace(/\{A\}/g, names.actor);
/* frases candidatas para la unidad (carta o variante) y el lado */
export function copyOptions(card, variant, side) {
  const unit = variant || card;
  const list = card.allowedSides ? ((unit.copyBySide || card.copyBySide || {})[side] || []) : (unit.copy || card.copy || []);
  return list.map((t, i) => ({ text: t, id: `${card.id}${variant ? ':' + variant.id : ''}${side ? ':' + side : ''}#${i}` }));
}
export function realize(card, { variant = null, side = null, playConstraint = null, names, rng, recentCopy = [] }) {
  const opts = copyOptions(card, variant, side);
  if (!opts.length) return null;
  const pick = rng.weighted(opts.map(o => ({ item: o, weight: recentCopy.includes(o.id) ? 0.15 : 1 })));
  let text = fill(pick.text, names).trim().replace(/[.;,]+$/, '');
  if (playConstraint && playConstraint !== 'FREE') {
    const clause = fill(PLAY_CONSTRAINT_COPY[playConstraint] || '', names);
    if (clause) text = `${text}, ${clause}`;
  }
  return { text: cap(text) + '.', copyId: pick.id };
}
