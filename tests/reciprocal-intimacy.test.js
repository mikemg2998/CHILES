/* Seis cartas nuevas de Intimidad (diseñador, 2026-11-04):
   I57 / I58 masturbación mirada (se masturba quien tiene el turno / se masturba {R}), I59 / I60 oral muy húmedo (lo hace quien
   tiene el turno / lo hace {R}) e I61 roce vulva-pene con las manos tomadas (la posición la fija la anatomía, nunca el turno); I62 masturbación mutua con los ojos
   cerrados (simultánea, una sola carta). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CARD, regionOf } from '../content/index.js';
import { buildDeck } from '../engine/deck.js';
import { realize } from '../engine/realizer.js';
import { COOLDOWN, cooldownKey, reciprocalKey, applyIntimacyDiversity } from '../engine/diversity.js';
import { mk, play, NAKED, DRESSED } from './helpers.js';

const NEW = ['I57', 'I58', 'I59', 'I60', 'I61', 'I62'];
const PAIRS = { I57: 'I58', I58: 'I57', I59: 'I60', I60: 'I59' };
const deck = (e, actor) => buildDeck(CARDS, e.context(actor));
const ids = (e, actor) => new Set(deck(e, actor).eligible.map(x => x.card.id));
const variantsOf = (e, actor, id) => { const x = deck(e, actor).eligible.find(y => y.card.id === id); return x ? x.variants.map(v => v.id) : null; };
const ANA_LEO = { bodyParts: [['vulva', 'senos'], ['pene']] };
/* solo la ropa interior de abajo fuera (y el pantalón, porque la tapa); camiseta, brasier y calcetines puestos */
const UNDER_OFF = () => ({ ...DRESSED(), bottoms: 'OFF', panties: 'OFF', boxers: 'OFF' });
const PANTS_OFF = () => ({ ...DRESSED(), bottoms: 'OFF' }); // ropa interior todavía puesta
const e3 = (clothing, prefs = ANA_LEO, seed = 1) => mk({ level: 3, seed, prefs, clothing });

test('las seis cartas existen, aprobadas, en Intimidad, con IDs nuevos y su clasificación', () => {
  for (const id of NEW) { assert.equal(CARD[id].status, 'APPROVED', id); assert.equal(CARD[id].level, 3, id); assert.equal(CARD[id].source, 'DESIGNER_PROVIDED', id); assert.equal(CARD[id].baseWeight, 1, id + ' peso base habitual'); }
  assert.equal(CARD.I57.similarityGroup, CARD.I58.similarityGroup); assert.equal(CARD.I57.similarityGroup, 'SELF_TOUCH');
  assert.equal(CARD.I59.similarityGroup, CARD.I60.similarityGroup); assert.equal(CARD.I59.similarityGroup, 'ORAL');
  assert.equal(cooldownKey('I57'), cooldownKey('I58')); assert.equal(cooldownKey('I59'), cooldownKey('I60')); assert.notEqual(cooldownKey('I57'), cooldownKey('I59'));
  assert.equal(CARD.I61.family, 'BODY'); assert.equal(CARD.I61.similarityGroup, 'BODY_CONTACT'); assert.equal(CARD.I61.interactionType, 'POSITIONAL'); assert.equal(CARD.I61.requiredOrientation, 'LYING');
  for (const v of CARD.I61.variants) assert.equal(regionOf(CARD.I61, v), 'INTIMATE');
});

test('masturbación mirada: I57 solo con la ropa interior de quien se masturba fuera; no exige desnudez completa', () => {
  // Leo (pene) tiene el turno → I57 = se masturba Leo
  assert.ok(!ids(e3([DRESSED(), DRESSED()]), 1).has('I57'), 'vestido');
  assert.ok(!ids(e3([DRESSED(), PANTS_OFF()]), 1).has('I57'), 'calzoncillos puestos');
  assert.ok(ids(e3([DRESSED(), UNDER_OFF()]), 1).has('I57'), 'calzoncillos fuera, camiseta y calcetines puestos, Ana vestida');
  assert.deepEqual(variantsOf(e3([DRESSED(), UNDER_OFF()]), 1, 'I57'), ['pene']);
  // Ana (vulva) tiene el turno
  assert.ok(!ids(e3([PANTS_OFF(), DRESSED()]), 0).has('I57'), 'panties puestas');
  assert.ok(ids(e3([UNDER_OFF(), DRESSED()]), 0).has('I57'), 'panties fuera, camiseta y brasier puestos');
  assert.deepEqual(variantsOf(e3([UNDER_OFF(), DRESSED()]), 0, 'I57'), ['vulva']);
  // panties NOT_WORN con el pantalón puesto: los genitales siguen tapados
  assert.ok(!ids(e3([{ ...DRESSED(), panties: 'NOT_WORN' }, DRESSED()]), 0).has('I57'));
  assert.ok(ids(e3([{ ...DRESSED(), bottoms: 'OFF', panties: 'NOT_WORN' }, DRESSED()]), 0).has('I57'));
  // sin vulva ni pene declarados no se ofrece
  assert.ok(!ids(e3([UNDER_OFF(), UNDER_OFF()], { bodyParts: [['senos'], ['pene']] }), 0).has('I57'));
});

test('masturbación mirada: I58 solo con la ropa interior de {R} fuera; quien mira puede ir vestido', () => {
  assert.ok(!ids(e3([PANTS_OFF(), DRESSED()]), 1).has('I58'), 'Ana con panties');
  assert.ok(ids(e3([UNDER_OFF(), DRESSED()]), 1).has('I58'), 'Ana sin panties, Leo vestido');
  assert.deepEqual(variantsOf(e3([UNDER_OFF(), DRESSED()]), 1, 'I58'), ['vulva']);
  assert.ok(ids(e3([DRESSED(), UNDER_OFF()]), 0).has('I58')); assert.deepEqual(variantsOf(e3([DRESSED(), UNDER_OFF()]), 0, 'I58'), ['pene']);
  assert.ok(!ids(e3([DRESSED(), PANTS_OFF()]), 0).has('I58'));
});

test('oral muy húmedo: I59 exige la ropa interior de quien recibe fuera; I60 la de quien tiene el turno', () => {
  assert.ok(!ids(e3([PANTS_OFF(), DRESSED()]), 1).has('I59')); assert.ok(ids(e3([UNDER_OFF(), DRESSED()]), 1).has('I59'));
  assert.deepEqual(variantsOf(e3([UNDER_OFF(), DRESSED()]), 1, 'I59'), ['vulva']);
  assert.ok(ids(e3([DRESSED(), UNDER_OFF()]), 0).has('I59')); assert.deepEqual(variantsOf(e3([DRESSED(), UNDER_OFF()]), 0, 'I59'), ['pene']);
  assert.ok(!ids(e3([DRESSED(), PANTS_OFF()]), 1).has('I60')); assert.ok(ids(e3([DRESSED(), UNDER_OFF()]), 1).has('I60'), 'Leo sin calzoncillos, Ana vestida');
  assert.deepEqual(variantsOf(e3([DRESSED(), UNDER_OFF()]), 1, 'I60'), ['pene']);
  assert.ok(ids(e3([UNDER_OFF(), DRESSED()]), 0).has('I60')); assert.deepEqual(variantsOf(e3([UNDER_OFF(), DRESSED()]), 0, 'I60'), ['vulva']);
  // «Hoy no» de boca las quita
  const e = e3([UNDER_OFF(), UNDER_OFF()]); e.session.pref[0] = { boca: 'no' }; assert.ok(!ids(e, 0).has('I59') && !ids(e, 0).has('I60'));
});

test('oral muy húmedo: la duración se elige entre 45 y 75 s con el temporizador existente y queda fija en la carta', () => {
  assert.deepEqual(CARD.I59.durations, [45, 60, 75]); assert.deepEqual(CARD.I60.durations, [45, 60, 75]); assert.equal(CARD.I59.timerMode, 'WEIGHTED');
  const seen = new Set();
  for (let s = 0; s < 300 && seen.size < 3; s++) {
    const e = e3([NAKED(), NAKED()], ANA_LEO, 500 + s);
    for (const r of play(e, 40)) if (['I59', 'I60'].includes(r.cardId)) {
      assert.ok(r.seconds >= 45 && r.seconds <= 75 && [45, 60, 75].includes(r.seconds), `${r.cardId} ${r.seconds}`);
      const again = e.history.rounds.find(x => x.n === r.n); assert.equal(again.seconds, r.seconds, 'la duración no cambia después de elegirse');
      seen.add(r.seconds);
    }
  }
  assert.deepEqual([...seen].sort((a, b) => a - b), [45, 60, 75], 'salen las tres duraciones');
  assert.deepEqual(CARD.I57.durations, [60]); assert.deepEqual(CARD.I58.durations, [60]); assert.deepEqual(CARD.I61.durations, [45, 60]);
});

test('I61: solo con una persona con pene y otra con vulva, las dos sin ropa interior', () => {
  for (const a of [0, 1]) assert.ok(ids(e3([NAKED(), NAKED()]), a).has('I61'), `turno ${a}`);
  for (const bp of [[['pene'], ['pene']], [['vulva', 'senos'], ['vulva', 'senos']], [['senos'], ['pene']]]) for (const a of [0, 1]) assert.ok(!ids(e3([NAKED(), NAKED()], { bodyParts: bp }), a).has('I61'), JSON.stringify(bp));
  for (const a of [0, 1]) {
    assert.ok(!ids(e3([PANTS_OFF(), UNDER_OFF()]), a).has('I61'), 'Ana con panties');
    assert.ok(!ids(e3([UNDER_OFF(), PANTS_OFF()]), a).has('I61'), 'Leo con calzoncillos');
    assert.ok(ids(e3([UNDER_OFF(), UNDER_OFF()]), a).has('I61'), 'los dos sin ropa interior; camisetas y calcetines puestos');
  }
});

test('I61: la posición no se invierte con el turno — con pene se acuesta, con vulva encima; manos tomadas siempre', () => {
  const e = e3([NAKED(), NAKED()]); const names = ['Ana', 'Leo'];
  const text = actor => { const v = deck(e, actor).eligible.find(y => y.card.id === 'I61').variants; assert.equal(v.length, 1); return { id: v[0].id, text: realize(CARD.I61, { variant: v[0], names: { actor: names[actor], receiver: names[1 - actor] }, rng: { weighted: o => o[0].item } }).text }; };
  const ana = text(0), leo = text(1);
  assert.equal(ana.id, 'encima-quien-juega'); assert.equal(leo.id, 'encima-R');
  assert.equal(ana.text, 'Leo se acuesta. Siéntate sobre Leo y, tomados de las manos, roza tu vulva contra su pene a tu propio ritmo.');
  assert.equal(leo.text, 'Acuéstate. Ana se sienta sobre ti y, tomados de las manos, roza su vulva contra tu pene a su propio ritmo.');
  for (const v of CARD.I61.variants) for (const t of v.copy) assert.match(t, /tomados de las manos/);
  // pareja vulva → pene+senos (la persona con pene es la 1): igual
  const f = e3([NAKED(), NAKED()], { bodyParts: [['vulva'], ['pene', 'senos']] }); assert.deepEqual(variantsOf(f, 0, 'I61'), ['encima-quien-juega']); assert.deepEqual(variantsOf(f, 1, 'I61'), ['encima-R']);
  // en partidas reales, quien se acuesta es siempre quien tiene pene
  let n = 0; for (let s = 0; s < 200; s++) { const g = e3([NAKED(), NAKED()], ANA_LEO, 900 + s); for (const r of play(g, 40)) if (r.cardId === 'I61') { n++; assert.equal(r.variantId, r.actor === 1 ? 'encima-R' : 'encima-quien-juega'); assert.ok(r.phrase.startsWith(r.actor === 1 ? 'Acuéstate. Ana' : 'Leo se acuesta.'), r.phrase); } }
  assert.ok(n > 0, 'I61 sale en partidas reales');
});

test('nunca salen antes de que la ropa lo permita (partidas reales empezando vestidos)', () => {
  const off = s => s.panties !== 'ON' && s.boxers !== 'ON' && s.bottoms !== 'ON';
  let n = 0;
  for (let s = 0; s < 300; s++) {
    const e = e3([DRESSED(), DRESSED()], s % 2 ? ANA_LEO : { bodyParts: [['pene'], ['pene']] }, 3000 + s);
    for (let i = 0; i < 40; i++) {
      const before = e.clothing.map(c => ({ ...c })); const r = e.roll(); if (!r) break;
      if (NEW.includes(r.cardId)) {
        n++; const a = r.actor, b = 1 - a;
        if (['I57', 'I60'].includes(r.cardId)) assert.ok(off(before[a]), `${r.cardId}: quien tiene el turno sin ropa interior`);
        if (['I58', 'I59'].includes(r.cardId)) assert.ok(off(before[b]), `${r.cardId}: {R} sin ropa interior`);
        if (r.cardId === 'I61') assert.ok(off(before[a]) && off(before[b]), 'I61: los dos');
      }
      if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
    }
  }
  assert.ok(n > 0, `salen en partidas que empiezan vestidas (${n})`);
});

test('las dos direcciones son posibles en la misma sesión y nunca a 10 cartas o menos', () => {
  const both = { I57: 0, I59: 0 }; let minGap = { I57: Infinity, I59: Infinity };
  for (let s = 0; s < 300; s++) {
    const e = e3([NAKED(), NAKED()], ANA_LEO, 7000 + s); const rs = play(e, 60).filter(r => r.level === 3 && !r.transition);
    for (const first of ['I57', 'I59']) {
      const pair = [first, PAIRS[first]], pos = rs.map((r, i) => (pair.includes(r.cardId) ? i : -1)).filter(i => i >= 0);
      if (new Set(pos.map(i => rs[i].cardId)).size === 2) both[first]++;
      for (let k = 1; k < pos.length; k++) minGap[first] = Math.min(minGap[first], pos[k] - pos[k - 1]);
    }
  }
  for (const k of ['I57', 'I59']) { assert.ok(both[k] > 0, `${k}/${PAIRS[k]} en la misma sesión: ${both[k]}`); assert.ok(minGap[k] > COOLDOWN, `${k}/${PAIRS[k]} separación mínima ${minGap[k]}`); }
});

test('reciprocidad: quien ya hizo la acción principal pesa ×0,2 para repetir; la otra persona conserva su peso', () => {
  assert.equal(reciprocalKey(CARD.I57, 0), 'WATCHED_SELF_TOUCH:0'); assert.equal(reciprocalKey(CARD.I58, 0), 'WATCHED_SELF_TOUCH:1');
  assert.equal(reciprocalKey(CARD.I59, 0), 'WET_ORAL:1'); assert.equal(reciprocalKey(CARD.I60, 0), 'WET_ORAL:0');
  assert.equal(reciprocalKey(CARD.I61, 0), null, 'I61 no es recíproca: una sola carta para los dos turnos');
  const e = e3([NAKED(), NAKED()], ANA_LEO, 31); play(e, 11);
  for (let i = 0; i < 40; i++) { const before = new Set(e.reciprocal); e.roll(); const a = e.lastDebug.actor;
    for (const c of e.lastDebug.candidates) if (['I57', 'I58', 'I59', 'I60'].includes(c.id)) assert.equal(c.factors.reciprocal, before.has(reciprocalKey(CARD[c.id], a)) ? 0.2 : 1, `${c.id} actor ${a}`); }
});

test('participan en cooldown, no vistas, desbloqueo y oportunidades perdidas, sin pesos inflados', () => {
  const e = e3([NAKED(), NAKED()], ANA_LEO, 77); const seenFactors = {};
  for (let i = 0; i < 40; i++) { e.roll(); for (const c of e.lastDebug.candidates) if (NEW.includes(c.id)) seenFactors[c.id] = c.factors; }
  for (const id of NEW) { const f = seenFactors[id]; assert.ok(f, `${id} estuvo en el sorteo`); for (const k of ['unseen', 'unlockedHold', 'missed']) assert.ok(k in f, `${id} ${k}`); assert.equal(f.base, 1, `${id} peso base 1`); }
  const e2 = e3([NAKED(), NAKED()], ANA_LEO, 78); play(e2, 6); assert.ok(NEW.some(id => (e2.missed.get(id) || 0) > 0), 'acumulan oportunidades perdidas');
  // cooldown compartido: con I57 recién jugada, I58 queda fuera del sorteo aunque sea elegible
  const fake = [{ card: CARD.I58, weight: 1, factors: {} }, { card: CARD.I01, weight: 1, factors: {} }];
  const out = applyIntimacyDiversity(fake, { level: 3, history: { rounds: [{ level: 3, cardId: 'I57' }] }, seen: new Set(), round: 1 });
  assert.deepEqual(out.weighted.map(w => w.card.id), ['I01']);
  // recién desbloqueadas: quitarse los calzoncillos desbloquea I57 para Leo
  const g = e3([NAKED(), { ...NAKED(), bottoms: 'OFF', boxers: 'ON' }], ANA_LEO, 79); g.roll(); g.recordUndress(1, 'boxers'); assert.ok(g.unlocked.has('I57') || g.unlocked.has('I60') || g.unlocked.has('I61'), 'cartas nuevas marcadas como recién desbloqueadas');
});

/* ---------- I62 · masturbación mutua con los ojos cerrados (sexta carta, 2026-11-04) ---------- */
test('I62: simultánea, una sola carta; los dos sin ropa interior; cualquier combinación de vulva / pene', () => {
  assert.equal(CARD.I62.interactionType, 'MUTUAL'); assert.equal(CARD.I62.family, 'MANUAL'); assert.equal(CARD.I62.similarityGroup, 'INTIMATE_TOUCH'); assert.equal(CARD.I62.baseWeight, 1);
  assert.equal(reciprocalKey(CARD.I62, 0), null); assert.equal(cooldownKey('I62'), 'I62');
  for (const v of CARD.I62.variants) { assert.deepEqual(v.copy, ['Cerrad los ojos y masturbaos mutuamente; que cada uno se concentre en la sensación de la mano de su pareja.']); assert.equal(regionOf(CARD.I62, v), 'INTIMATE'); }
  const cases = [[ANA_LEO.bodyParts, ['vulva-pene'], ['pene-vulva']], [[['pene'], ['pene']], ['pene-pene'], ['pene-pene']], [[['vulva', 'senos'], ['vulva', 'senos']], ['vulva-vulva'], ['vulva-vulva']]];
  for (const [bp, v0, v1] of cases) { assert.deepEqual(variantsOf(e3([NAKED(), NAKED()], { bodyParts: bp }), 0, 'I62'), v0, JSON.stringify(bp)); assert.deepEqual(variantsOf(e3([NAKED(), NAKED()], { bodyParts: bp }), 1, 'I62'), v1); }
  assert.ok(!ids(e3([NAKED(), NAKED()], { bodyParts: [['senos'], ['pene']] }), 0).has('I62'), 'sin genitales declarados en una persona no sale');
  for (const a of [0, 1]) {
    assert.ok(!ids(e3([PANTS_OFF(), UNDER_OFF()]), a).has('I62'), `turno ${a}: Ana con panties`);
    assert.ok(!ids(e3([UNDER_OFF(), PANTS_OFF()]), a).has('I62'), `turno ${a}: Leo con calzoncillos`);
    assert.ok(!ids(e3([UNDER_OFF(), DRESSED()]), a).has('I62'), `turno ${a}: Leo con pantalón`);
    assert.ok(ids(e3([UNDER_OFF(), UNDER_OFF()]), a).has('I62'), `turno ${a}: los dos sin ropa interior, camisetas puestas`);
  }
});

test('I62: duración entre 45 y 60 s elegida por el temporizador existente y fija; integrada en el selector', () => {
  assert.deepEqual(CARD.I62.durations, [45, 50, 60]); assert.equal(CARD.I62.timerMode, 'WEIGHTED');
  const secs = new Set(); let n = 0, asCandidate = 0;
  for (let s = 0; s < 300; s++) {
    const e = e3(s % 2 ? [NAKED(), NAKED()] : [DRESSED(), DRESSED()], s % 3 ? ANA_LEO : { bodyParts: [['pene'], ['pene']] }, 11000 + s); // mitad desnudos (para que salga) · mitad vestidos (para comprobar que no sale antes)
    for (let i = 0; i < 40; i++) {
      const before = e.clothing.map(c => ({ ...c })); const r = e.roll(); if (!r) break;
      const cand = e.lastDebug.candidates.find(c => c.id === 'I62'); if (cand) { asCandidate++; for (const k of ['unseen', 'unlockedHold', 'missed']) assert.ok(k in cand.factors, k); assert.equal(cand.factors.base, 1); }
      if (r.cardId === 'I62') {
        n++; assert.ok([45, 50, 60].includes(r.seconds) && r.seconds >= 45 && r.seconds <= 60, String(r.seconds)); secs.add(r.seconds);
        assert.equal(e.history.rounds.find(x => x.n === r.n).seconds, r.seconds, 'la duración queda fija');
        for (const p of [0, 1]) assert.ok(before[p].bottoms !== 'ON' && before[p].panties !== 'ON' && before[p].boxers !== 'ON', 'los dos sin ropa interior al salir');
      }
      if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
    }
  }
  assert.ok(n > 0 && asCandidate > n, `sale (${n}) y compite en el sorteo (${asCandidate})`);
  assert.deepEqual([...secs].sort((a, b) => a - b), [45, 50, 60]);
  // cooldown de 10: nunca se repite a 10 cartas o menos
  for (let s = 0; s < 100; s++) { const rs = play(e3([NAKED(), NAKED()], ANA_LEO, 12000 + s), 60).filter(r => r.level === 3 && !r.transition); const pos = rs.map((r, i) => (r.cardId === 'I62' ? i : -1)).filter(i => i >= 0); for (let k = 1; k < pos.length; k++) assert.ok(pos[k] - pos[k - 1] > COOLDOWN, `I62 repetida a ${pos[k] - pos[k - 1]}`); }
});
