/* DECK BUILDER · el selector. Primero FILTRA (aprobada ∩ nivel ∩ anatomía de quien actúa ∩ anatomía de quien recibe ∩
   ropa de cada uno ∩ disponibilidad corporal ∩ físicamente posible ∩ sesión), después PONDERA (historial, familias,
   feedback, propósito) y por último ELIGE. Nunca repara una carta incompatible: si no cabe, no sale.
   Cada rechazo lleva su razón, para el depurador y para el Content Lab. */
import { BODY_PARTS, ACTOR_TOOLS } from '../content/body.js';
import { AVOIDS } from './session.js';
import { clothingFailure, partAccessible, undressPossible } from './clothing.js';
import { copyOptions } from './realizer.js';

const INTIMATE = p => BODY_PARTS[p] && ['vulva', 'pene'].includes(BODY_PARTS[p].anatomy);

/* evalúa una unidad (carta sola o carta + variante). Devuelve null si cabe o la razón del rechazo. */
function unitFailure(card, variant, ctx) {
  const tools = ((variant && variant.actorRequirements) || card.actorRequirements).map(r => r.part);
  const parts = ((variant && variant.receiverRequirements) || card.receiverRequirements).map(r => r.part);
  if (variant && variant.anatomy && !ctx.receiver.has(variant.anatomy)) return 'RECEIVER_ANATOMY';
  for (const t of tools) if (!ACTOR_TOOLS[t]) return 'OWNERSHIP:tool'; else if (!ctx.actor.hasTool(t)) return 'ACTOR_ANATOMY';
  for (const p of parts) if (!BODY_PARTS[p]) return 'OWNERSHIP:part'; else if (!ctx.receiver.hasTarget(p)) return 'RECEIVER_ANATOMY';
  const fr = clothingFailure(card.clothing.receiver, ctx.receiverClothing, parts, { role: 'receiver' }); if (fr) return `CLOTHING:receiver:${fr}`;
  const fa = clothingFailure(card.clothing.actor, ctx.actorClothing, tools, { role: 'actor' }); if (fa) return `CLOTHING:actor:${fa}`;
  // PARTE QUE EXISTE ≠ ACCESIBLE: anatomía íntima siempre a piel, declare lo que declare la carta
  if (parts.some(p => INTIMATE(p) && !partAccessible(p, ctx.receiverClothing))) return 'BODY_NOT_AVAILABLE';
  if (tools.some(t => ACTOR_TOOLS[t].anatomy && ['vulva', 'pene'].includes(ACTOR_TOOLS[t].anatomy) && !ACTOR_TOOLS[t].coveredBy.every(g => ctx.actorClothing[g] !== 'ON'))) return 'BODY_NOT_AVAILABLE:actor';
  if (card.interactionType === 'UNDRESS' && !undressPossible(card.undress, ctx.actorClothing, ctx.receiverClothing)) return 'UNDRESS_IMPOSSIBLE';
  const sides = card.allowedSides || [null];
  if (!sides.some(s => copyOptions(card, variant, s).length)) return 'NO_COPY';
  return null;
}

/* ctx: { level, actor, receiver (PlayerAnatomy), actorClothing, receiverClothing, session, avoidIds?: [] } */
export function buildDeck(cards, ctx) {
  const eligible = [], rejected = [];
  const avoid = ctx.session ? [...ctx.session.avoidSet()].map(k => AVOIDS[k].tag) : [];
  for (const card of cards) {
    const rej = r => rejected.push({ id: card.id, reason: r });
    if (card.transition) { rej('TRANSITION'); continue; }
    if (card.status !== 'APPROVED') { rej(`STATUS:${card.status}`); continue; }
    if (card.level !== ctx.level) { rej('LEVEL'); continue; }
    if (avoid.some(t => card.tags.includes(t))) { rej('SESSION:hoy-no'); continue; }
    if (ctx.avoidIds && ctx.avoidIds.includes(card.id)) { rej('SESSION:avoid'); continue; }
    if (card.variants) {
      const ok = [], why = [];
      for (const v of card.variants) { if (v.status !== 'APPROVED') { why.push(`${v.id}:STATUS`); continue; } const f = unitFailure(card, v, ctx); if (f) why.push(`${v.id}:${f}`); else ok.push(v); }
      if (!ok.length) { rej('VARIANTS:' + why.join(',')); continue; }
      eligible.push({ card, variants: ok });
    } else {
      const f = unitFailure(card, null, ctx);
      if (f) { rej(f); continue; }
      eligible.push({ card, variants: null });
    }
  }
  return { eligible, rejected };
}

/* ---------- ponderación y elección ---------- */
export function weighDeck(deck, { history, session, director, purpose, favorFamily = null }) {
  return deck.eligible.map(e => {
    const c = e.card;
    let w = c.baseWeight * history.novelty('cardId', c.id, 14, 1.6) * history.familyWeight(c.family);
    const since = history.sinceCard(c.id); if (since === 0) w = 0; else if (since <= 2) w *= 0.05; // la carta anterior nunca vuelve seguida; las dos últimas, casi nunca
    if (director) w *= director.weight(purpose, session, history, c);
    if (favorFamily && c.family === favorFamily) w *= 2.5;
    // tipos de carta poco frecuentes no se amontonan
    if (['CHOOSE', 'GUIDED', 'PATH', 'POSITIONAL'].includes(c.interactionType) && history.sinceType(c.interactionType) <= 1) w *= 0.3;
    if (history.rounds.length >= 6 && !history.rounds.some(r => r.family === c.family)) w *= 1.3; // diversidad
    return { ...e, weight: Math.max(0, w) };
  });
}
export function pickVariant(entry, history, rng) {
  if (!entry.variants) return null;
  return rng.weighted(entry.variants.map(v => ({ item: v, weight: (v.weight || 1) * history.novelty('variantId', v.id, 8, 1.5) })));
}
/* lateralidad: memoria por carta y por parte del cuerpo, como peso (nunca determinista) */
export function pickSide(card, variant, history, rng) {
  if (!card.allowedSides) return null;
  const parts = ((variant && variant.receiverRequirements) || card.receiverRequirements).map(r => r.part);
  const byCard = history.recentSidesByInteraction(card.id), byPart = history.recentSidesByBodyPart(parts);
  const items = card.allowedSides.filter(s => copyOptions(card, variant, s).length).map(s => {
    let w = 1;
    const i = byCard.indexOf(s); if (i === 0) w *= 0.2; else if (i === 1) w *= 0.55;
    const j = byPart.indexOf(s); if (j === 0) w *= 0.45; else if (j === 1) w *= 0.75;
    if (s === 'BOTH' && card.allowedSides.length > 1) w *= 0.8;
    return { item: s, weight: w };
  });
  return items.length ? rng.weighted(items) : null;
}
/* PlayConstraint: solo si la carta las aprueba; FREE sigue saliendo; la reciente pesa poco */
export function pickConstraint(card, history, rng) {
  if (!card.playConstraints) return null;
  const recentCard = history.rounds.filter(r => r.cardId === card.id).slice(0, 3).map(r => r.playConstraint);
  const recentAny = history.recentPlayConstraints.slice(0, 3);
  return rng.weighted(card.playConstraints.map(c => { let w = c === 'FREE' ? 1.4 : 1; if (recentCard[0] === c) w *= 0.15; else if (recentCard.includes(c)) w *= 0.5; if (recentAny.includes(c) && c !== 'FREE') w *= 0.6; return { item: c, weight: w }; }));
}
