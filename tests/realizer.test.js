import { test } from 'node:test';
import assert from 'node:assert/strict';
import { realize, humanLikeness, shapesFor } from '../engine/realizer.js';
import { COMBOS, ACTIONS } from '../engine/grammar.js';
import { Rng } from '../engine/rng.js';

const rz = (c, o = {}) => realize({ key: c.key, action: c.action, tool: c.tool, target: c.target, style: o.style || null, level: o.level || c.levels[0], pattern: o.guided ? 'GUIDED' : ACTIONS[c.action].pattern }, { partner: 'Ana', rng: new Rng(o.seed || 1), recentShapes: o.recent || [] });

test('toda combinación aprobada se verbaliza, con y sin estilo, y la frase es corta y limpia', () => {
  for (const c of COMBOS) for (const st of [null, ...c.styles]) {
    const r = rz(c, { style: st });
    assert.ok(r && r.text.length > 8, c.key);
    assert.ok(/^[A-ZÁÉÍÓÚ]/.test(r.text) && /\.$/.test(r.text), r.text);
    assert.ok(!/\{|\}/.test(r.text), 'tokens sin rellenar: ' + r.text);
    assert.ok(!/  |,,|, \.| \./.test(r.text), r.text);
    assert.ok(r.text.split(/\s+/).length <= 24, r.text);
  }
});
test('la herramienta no se nombra cuando es obvia (la lengua al lamer, las manos al masajear, los labios al besar)', () => {
  assert.ok(!/lengua/.test(rz(COMBOS.find(c => c.key === 'LICK|tongue|innerThighs')).text));
  assert.ok(!/manos/.test(rz(COMBOS.find(c => c.key === 'MASSAGE|bothHands|shoulders'), { seed: 2 }).text));
  assert.ok(!/labios/.test(rz(COMBOS.find(c => c.key === 'KISS|lips|neck')).text));
  assert.ok(/uñas/.test(rz(COMBOS.find(c => c.key === 'BRUSH|nails|back')).text));
});
test('el estilo se expresa como lenguaje (adverbio o cláusula), no como etiqueta, y nunca se repiten palabras', () => {
  const r = rz(COMBOS.find(c => c.key === 'CARESS|oneHand|back'), { style: 'SLOW' });
  assert.ok(/despacio|lentamente|sin prisa|tu tiempo/.test(r.text), r.text);
  assert.ok(!/SLOW|SOFT|FIRM/.test(r.text));
  for (const c of COMBOS) { const r = rz(c, { style: c.styles[0] || null, seed: 5 }); assert.ok(!r.humanFlags.some(f => f.startsWith('REPEATED_WORD')), r.text); }
});
test('variedad real: una acción frecuente tiene varias estructuras y las recientes se evitan', () => {
  const c = COMBOS.find(c => c.key === 'KISS|lips|neck');
  assert.ok(shapesFor('KISS', 'lips', 'neck', null, 2, false).length >= 3);
  const seen = new Set(); let recent = [];
  for (let i = 0; i < 12; i++) { const r = rz(c, { seed: 100 + i, recent }); seen.add(r.shapeId); recent = [r.shapeId, ...recent].slice(0, 6); }
  assert.ok(seen.size >= 3, [...seen].join());
});
test('humanLikenessScore castiga la concatenación mecánica y acepta la frase natural', () => {
  assert.ok(humanLikeness('Acaricia despacio la espalda de Ana.', { partner: 'Ana' }).score >= 0.95);
  const bad = humanLikeness('Haz cosquillas suavemente en la parte interna de los muslos de Ana con la yema de los dedos, con pequeñas pausas, dejando que la mano de Ana marque el ritmo.', { partner: 'Ana', styleUsed: true, guided: true });
  assert.ok(bad.score < 0.6, String(bad.score));
  assert.ok(humanLikeness('Roza los labios de Ana con los labios.', { partner: 'Ana' }).flags.some(f => f.startsWith('REPEATED_WORD')));
});
test('el estilo nunca repite el verbo de la acción ni cuelga una segunda coletilla a una frase que ya trae la suya', () => {
  for (const c of COMBOS) for (const st of c.styles) for (let seed = 0; seed < 4; seed++) {
    const r = rz(c, { style: st, seed });
    const a = ACTIONS[c.action];
    if (r.styleUsed) {
      const words = r.text.toLowerCase().replace(/[.,]/g, '').split(/\s+/);
      const verbWords = words.filter(w => w.length >= 4 && a.stems.some(s => w.startsWith(s)));
      assert.ok(verbWords.length <= 1, `${r.text} (${verbWords.join(' ')})`);
    }
    assert.ok((r.text.match(/,/g) || []).length <= 2, r.text);
  }
});
test('la frase no encadena dos «con» («con ritmo con los dedos») sin que el filtro lo marque', () => {
  assert.ok(humanLikeness('Tamborilea con ritmo con los dedos sobre los brazos de Ana.', { partner: 'Ana', styleUsed: true }).flags.includes('REPEATED_CON'));
  for (const c of COMBOS) for (const st of c.styles) { const r = rz(c, { style: st, seed: 3 }); assert.ok(!/\bcon \S+ con\b/.test(r.text), r.text); }
});
