/* DECK BUILDER · el selector. Primero FILTRA (aprobada ∩ nivel ∩ anatomía de quien actúa ∩ anatomía de quien recibe ∩
   ropa de cada uno ∩ disponibilidad corporal ∩ físicamente posible ∩ sesión), después PONDERA (historial, familias,
   feedback, propósito) y por último ELIGE. Nunca repara una carta incompatible: si no cabe, no sale.
   Cada rechazo lleva su razón, para el depurador y para el Content Lab. */
import { BODY_PARTS, ACTOR_TOOLS, GARMENT_LAYERS } from '../content/body.js';
import { AVOIDS } from './session.js';
import { clothingFailure, partAccessible, undressPossible, removableGarments, coverage } from './clothing.js';
import { throughGarmentOf, VERBAL_GROUPS } from '../content/schema.js';
import { copyOptions } from './realizer.js';
import { regionOf, partsOf } from '../content/index.js';

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
  // …salvo que la carta esté aprobada específicamente SOBRE la prenda interior que la tapa (THROUGH_GARMENT)
  const through = card.clothing.receiver.map(throughGarmentOf).filter(Boolean);
  if (parts.some(p => INTIMATE(p) && !partAccessible(p, ctx.receiverClothing) && !through.includes(coverage(p, ctx.receiverClothing).by))) return 'BODY_NOT_AVAILABLE';
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

/* ---------- ponderación: factores independientes, nunca un «intensity score» ----------
   Los filtros duros ya pasaron (anatomía, ropa, propiedad, físico, status). Aquí solo pesos blandos:
   baseWeight · cardRecency · familyDiversity · bodyRegionDiversity · regionStarvation · targetDiversity · typeSpacing ·
   newlyUnlockedBoost · sessionPurpose (+ feedbackAffinity) · favorFamily. Ninguna región gana peso por ser íntima. */
/* sameRegionUndressCooldown: acaba de salir una prenda exterior de una zona → quitar la interior de esa misma zona pesa poco durante
   unas cartas, para que la fase intermedia (THROUGH_BRA · THROUGH_PANTIES · THROUGH_BOXERS) tenga tiempo real. Peso, no veto. */
export function undressCooldown(card, { history, round, actor, clothing }) {
  if (card.interactionType !== 'UNDRESS' || !history || !clothing) return 1;
  const u = card.undress, players = u.who === 'BOTH' ? [actor, 1 - actor] : [u.who === 'ACTOR' ? actor : 1 - actor];
  let f = 1;
  for (const p of players) {
    const options = u.garment === 'ANY' ? removableGarments(clothing[p]) : [u.garment];
    const inner = options.filter(g => GARMENT_LAYERS[g] && GARMENT_LAYERS[g].layer === 'UNDERWEAR');
    if (!inner.length || inner.length < options.length) continue; // hay alternativas exteriores: no se penaliza
    const since = Math.min(...inner.map(g => history.sinceOuterRemoved(p, GARMENT_LAYERS[g].zone, round, GARMENT_LAYERS)));
    f *= since <= 1 ? 0.15 : since <= 3 ? 0.35 : since <= 5 ? 0.7 : 1;
  }
  return f;
}
export function weighDeck(deck, { history, session, director, purpose, favorFamily = null, unlocked = null, round = 0, actor = 0, clothing = null }) {
  const regions = history.recentRegions, targets = history.recentTargets;
  const eligibleRegions = new Set(deck.eligible.map(e => regionOf(e.card, null)));
  const starving = new Set([...eligibleRegions].filter(r => history.sinceRegion(r) >= 8 && history.rounds.length >= 8)); // región con cartas elegibles que lleva mucho sin salir
  return deck.eligible.map(e => {
    const c = e.card, region = regionOf(c, null), parts = partsOf(c, null);
    const f = { base: c.baseWeight, cardRecency: 1, family: 1, similarity: 1, region: 1, starvation: 1, target: 1, type: 1, unlocked: 1, undressCooldown: 1, purpose: 1, favor: 1 };
    f.cardRecency = history.novelty('cardId', c.id, 14, 1.6);
    const since = history.sinceCard(c.id); if (since === 0) f.cardRecency = 0; else if (since <= 2) f.cardRecency *= 0.05; else if (since <= 4) f.cardRecency *= 0.4; // la anterior nunca vuelve seguida
    f.family = history.familyWeight(c.family);
    if (c.similarityGroup) { // similarityDiversity: «otra vez lo mismo» aunque cambie la familia (abrazo·abrazo·abrazo, masaje×3, verbal×2). Peso, no veto.
      const g = history.recentGroups, verbal = x => VERBAL_GROUPS.includes(x);
      if (g[0] === c.similarityGroup) f.similarity *= 0.3; else if (g[1] === c.similarityGroup) f.similarity *= 0.6;
      if (g.slice(0, 4).filter(x => x === c.similarityGroup).length >= 2) f.similarity *= 0.5;
      if (verbal(c.similarityGroup) && verbal(g[0])) f.similarity *= 0.25; // dos verbales seguidas, casi nunca
    }
    if (c.interactionType !== 'UNDRESS') { // diversidad corporal: la región de la última carta pesa poco; dos de las tres últimas, menos aún
      if (regions[0] === region) f.region *= 0.35; if (regions.slice(0, 3).filter(r => r === region).length >= 2) f.region *= 0.5;
      if (history.rounds.length >= 6 && !regions.slice(0, 6).includes(region)) f.region *= 1.25;
      if (starving.has(region)) f.starvation = 1.5;
      if (parts.some(pt => targets[0] && targets[0].includes(pt))) f.target *= 0.5; if (parts.some(pt => (targets[1] || []).includes(pt))) f.target *= 0.75;
    }
    if (['CHOOSE', 'GUIDED', 'PATH', 'POSITIONAL'].includes(c.interactionType) && history.sinceType(c.interactionType) <= 1) f.type = 0.3;
    if (unlocked && unlocked.has(c.id) && unlocked.get(c.id) > round) f.unlocked = 1.6; // recién desbloqueada por un cambio de ropa: pequeño empujón que expira
    f.undressCooldown = undressCooldown(c, { history, round, actor, clothing });
    if (director) f.purpose = director.weight(purpose, session, history, c);
    if (favorFamily && c.family === favorFamily) f.favor = 2.5;
    const weight = Object.values(f).reduce((a, b) => a * b, 1);
    return { ...e, weight: Math.max(0, weight), factors: f };
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
