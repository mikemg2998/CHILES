/* Auditoría de VULVA y CLÍTORIS (y vagina, por completitud): existen como targets, qué cartas los usan, con qué access mode, en qué
   estados de ropa pasan el filtro y con qué frecuencia salen en sesiones simuladas.   node tests/vulva.js [--out=archivo.md] */
import { CARDS, CARD, APPROVED } from '../content/index.js';
import { BODY_PARTS, GARMENT_LABEL } from '../content/body.js';
import { FAMILIES } from '../content/schema.js';
import { buildDeck } from '../engine/deck.js';
import { accessMode } from '../engine/clothing.js';
import { GameEngine } from '../engine/engine.js';
import { writeFileSync } from 'node:fs';
const out = (process.argv.find(a => a.startsWith('--out=')) || '').slice(6);
const TARGETS = ['vulva', 'clitoris', 'vagina'];
const NAKED = { top: 'OFF', bottoms: 'OFF', socks: 'OFF', bra: 'OFF', panties: 'OFF', boxers: 'OFF' };
const L = [`# Auditoría VULVA · CLÍTORIS · ${new Date().toISOString().slice(0, 10)}`, ''];
const units = c => (c.variants ? c.variants.map(v => ({ card: c, v })) : [{ card: c, v: null }]);
const parts = u => ((u.v && u.v.receiverRequirements) || u.card.receiverRequirements).map(r => r.part);
const texts = u => { const src = u.v || u.card; return u.card.allowedSides ? Object.values(src.copyBySide || {}).flat() : (src.copy || []); };
const modeOf = q => q.some(x => /^THROUGH_/.test(x)) ? q.find(x => /^THROUGH_/.test(x)) : q.includes('SKIN_ACCESS') ? 'DIRECT_SKIN_ACCESS' : q.join('+');
L.push('## 1 · Targets', '', '| Target | Existe en BODY_PARTS | Anatomía | Tapado por | Región |', '|---|---|---|---|---|');
for (const t of TARGETS) { const p = BODY_PARTS[t]; L.push(`| ${t} | ${p ? 'sí (' + p.label + ')' : 'NO'} | ${p ? p.anatomy : '—'} | ${p ? p.coveredBy.join(' + ') : '—'} | ${p ? p.region : '—'} |`); }
// estados de ropa de quien recibe (Ana: vulva · senos), torso fuera para aislar la parte inferior
const STATES = [['pantalón ON + panties ON', { ...NAKED, bottoms: 'ON', panties: 'ON' }], ['pantalón OFF + panties ON', { ...NAKED, panties: 'ON' }], ['pantalón OFF + panties OFF', { ...NAKED }], ['pantalón OFF + panties NOT_WORN', { ...NAKED, panties: 'NOT_WORN' }], ['pantalón ON + panties NOT_WORN', { ...NAKED, bottoms: 'ON', panties: 'NOT_WORN' }]];
const engFor = (recv, actorClothing = NAKED) => { const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']] }, seed: 1, level: 3 }); e.clothing = [{ ...recv }, { ...actorClothing }]; return e; };
for (const t of TARGETS) {
  const all = CARDS.filter(c => units(c).some(u => parts(u).includes(t)));
  L.push('', `## ${t.toUpperCase()} · cartas que lo usan: ${all.length ? all.map(c => c.id + (c.status !== 'APPROVED' ? ' (' + c.status + ')' : '')).join(', ') : 'NINGUNA → CONTENT_GAP'}`);
  for (const c of all) for (const u of units(c).filter(u => parts(u).includes(t))) {
    const st = u.v ? `${c.status} / variante ${u.v.id} ${u.v.status}` : c.status;
    L.push('', `### ${c.id}${u.v ? ' · variante ' + u.v.id : ''} — ${st}`, '',
      `- Texto: ${texts(u).length ? texts(u).map(x => `«${x}»`).join(' · ') : 'SIN COPIA'}`,
      `- Nivel ${c.level} · ${c.interactionType} · familia ${FAMILIES[c.family]} · intensidad ${c.intraLevelIntensity || '—'}`,
      `- Actúa con: ${c.actorRequirements.map(r => r.part).join(', ') || '—'} · Recibe en: ${parts(u).join(', ')}`,
      `- Anatomía: recibe ${u.v && u.v.anatomy ? u.v.anatomy : BODY_PARTS[t].anatomy}${c.actorRequirements.some(r => ['penis', 'glans', 'breasts'].includes(r.part)) ? ' · actúa con anatomía propia' : ''}`,
      `- Access mode requerido: ${modeOf(c.clothing.receiver)} · Ropa (recibe): ${c.clothing.receiver.join(' + ')} · Ropa (actúa): ${c.clothing.actor.join(' + ')}`,
      `- Duración: ${c.timerMode === 'NO_TIMER' ? 'sin temporizador' : c.durations.join(' / ') + ' s'}${c.allowedSides ? ' · lados ' + c.allowedSides.join('/') : ''}`);
    if (c.status === 'APPROVED' && (!u.v || u.v.status === 'APPROVED')) {
      const rows = STATES.map(([name, recv]) => { const d = buildDeck([c], engFor(recv).context(1)); const ok = d.eligible.length && (!u.v || d.eligible[0].variants.some(v => v.id === u.v.id)); const why = ok ? '' : (d.rejected[0] ? d.rejected[0].reason : 'variante bloqueada'); return `${name}: ${ok ? 'SÍ' : 'no (' + why.replace('CLOTHING:receiver:', '') + ')'}`; });
      L.push(`- Pasa el filtro (Leo desnudo → Ana): ${rows.join(' · ')}`);
      L.push(`- Access mode de la vulva en cada estado: ${STATES.map(([n, r]) => accessMode('vulva', r)).join(' · ')}`);
    } else L.push('- No pasa el filtro: ' + st + ' (rechazo STATUS). No sale en ninguna sesión.');
  }
}
// frecuencia en 200 sesiones reales (empezando vestidos, UNDRESS aplicadas como la interfaz, 30 cartas)
const N = 200, ROUNDS = 30, count = {}, byTarget = { vulva: 0, clitoris: 0, vagina: 0, penis: 0 }, firstVulva = []; let total = 0, sessionsWithVulva = 0;
for (let seed = 1; seed <= N; seed++) {
  const e = new GameEngine({ prefs: { names: ['Ana', 'Leo'], bodyParts: [['vulva', 'senos'], ['pene']] }, seed, level: 3 }); let hit = false;
  for (let i = 0; i < ROUNDS; i++) {
    const r = e.roll(); if (!r) break; total++; 
    for (const p of r.parts) if (p in byTarget) { byTarget[p]++; if (p === 'vulva') { count[r.cardId + (r.variantId ? '·' + r.variantId : '')] = (count[r.cardId + (r.variantId ? '·' + r.variantId : '')] || 0) + 1; if (!hit) { hit = true; sessionsWithVulva++; firstVulva.push(r.n); } } }
    if (r.undress) for (const p of r.undress.players) { const g = r.undress.garment === 'ANY' ? e.removable(p)[0] : r.undress.garment; if (g) e.recordUndress(p, g); }
  }
}
L.push('', `## Frecuencia en ${N} sesiones de ${ROUNDS} cartas (empezando vestidos; UNDRESS aplicadas como en la app)`, '',
  `- Cartas totales: ${total}. Con target vulva: ${byTarget.vulva} (${(100 * byTarget.vulva / total).toFixed(1)} %) · clítoris: ${byTarget.clitoris} · vagina: ${byTarget.vagina} · pene (comparación): ${byTarget.penis} (${(100 * byTarget.penis / total).toFixed(1)} %).`,
  `- Sesiones en las que sale al menos una carta de vulva: ${sessionsWithVulva} de ${N}. Primera carta de vulva, de media, en la ronda ${firstVulva.length ? (firstVulva.reduce((a, b) => a + b, 0) / firstVulva.length).toFixed(1) : '—'}.`,
  `- Por carta: ${Object.entries(count).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ') || 'ninguna'}.`);
const text = L.join('\n'); console.log(text); if (out) writeFileSync(out, text + '\n');
