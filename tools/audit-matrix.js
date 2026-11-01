/* AUDITORÍA AUTOMÁTICA DE LA MATRIZ TARGET × ACTION × ACTOR TOOL. Solo lee: nunca modifica engine/data ni promociona nada.
   Genera content-review/auditoria-matriz.md (matriz completa por zona con su status, combinaciones sospechosas con el motivo
   y la decisión vigente), content-review/revision-valid.md (todas las VALID, para decidir si suben o se rechazan) y
   content-review/revision-unreviewed.md (todo lo UNREVIEWED generable + blueprints pendientes). Ejecutar: node tools/audit-matrix.js */
import { writeFileSync } from 'node:fs';
import { COMBOS, COMBO, REJECTED_COMBOS, REJECTED_REASON, possibleCombinations, unreviewedCombinations, unreviewedBlueprints, TARGETS, TARGETS_LIST, ACTOR_TOOLS, ACTIONS, ACTIONS_LIST, statusOf, REPERTOIRE } from '../engine/grammar.js';
import { HEURISTICS, suspicious } from '../engine/audit.js';
import { realize } from '../engine/realizer.js';
import { Rng } from '../engine/rng.js';

const rng = new Rng(2026);
const sample = c => { const r = realize({ key: c.key, action: c.action, tool: c.tool, target: c.target, style: null, level: c.levels[0], pattern: ACTIONS[c.action].pattern }, { partner: 'Ana', rng, recentShapes: [] }); return r ? r.text : '—'; };
const label = (a, t, z) => `${ACTIONS[a].name} · ${ACTOR_TOOLS[t].label} → ${TARGETS[z].n}`;

const date = new Date().toISOString().slice(0, 10);
const universe = possibleCombinations(); // acción admite herramienta + biomecánica posible (sin cuerpo con cuerpo)
const approved = COMBOS.filter(c => c.kind === 'CARTESIAN');
const flagged = approved.map(c => ({ c, flags: suspicious(c.action, c.tool, c.target, c.status) })).filter(x => x.flags.length);
const rejectedFlagged = [...REJECTED_COMBOS].map(k => { const [a, t, z] = k.split('|'); return { k, a, t, z, flags: ACTIONS[a] && TARGETS[z] ? suspicious(a, t, z, 'REJECTED') : [] }; });
const counts = {}; for (const u of universe) counts[u.status] = (counts[u.status] || 0) + 1;

let md = `# Auditoría automática de la matriz · ${date}

Pregunta: **¿esta acción merece aparecer aquí?** Esta herramienta solo señala; la decisión es humana y vive en
\`engine/data/repertoire.js\` (zonas) y \`engine/data/positional.js\` (cuerpo con cuerpo). Nada se promociona automáticamente:
UNREVIEWED → APPROVED solo lo hace una persona, editando el fichero o desde Content Lab (\`lab/\`).

Universo técnico (acción admite la herramienta y la biomecánica lo permite): **${universe.length}** relaciones acción · herramienta · zona.
EXCELLENT ${counts.EXCELLENT || 0} · GOOD ${counts.GOOD || 0} · VALID ${counts.VALID || 0} · REJECTED ${counts.REJECTED || 0} · UNREVIEWED ${counts.UNREVIEWED || 0}.
Blueprints posicionales: ${COMBOS.filter(c => c.kind === 'POSITIONAL').length} APPROVED · ${unreviewedBlueprints().length} UNREVIEWED.

## Heurísticas de sospecha

| ID | Qué señala |
|---|---|
${HEURISTICS.map(h => `| ${h.id} | ${h.why} |`).join('\n')}

## Combinaciones aprobadas que las heurísticas señalan (${flagged.length}) — decidir: mantener con motivo o rechazar

| Zona | Acción · herramienta | Status | Heurísticas | Frase que sale |
|---|---|---|---|---|
${flagged.sort((p, q) => p.c.target.localeCompare(q.c.target)).map(({ c, flags }) => `| ${TARGETS[c.target].n} | ${ACTIONS[c.action].name} · ${ACTOR_TOOLS[c.tool].label} | ${c.status} | ${flags.join(', ')} | ${sample(c)} |`).join('\n')}

## Rechazadas con motivo (${REJECTED_COMBOS.size})

| Zona | Acción · herramienta | Motivo | Heurísticas que lo habrían señalado |
|---|---|---|---|
${rejectedFlagged.sort((p, q) => p.z.localeCompare(q.z)).map(({ k, a, t, z, flags }) => `| ${TARGETS[z] ? TARGETS[z].n : z} | ${ACTIONS[a] ? ACTIONS[a].name : a} · ${ACTOR_TOOLS[t] ? ACTOR_TOOLS[t].label : t} | ${REJECTED_REASON[k]} | ${flags.join(', ') || '— (criterio editorial)'} |`).join('\n')}

## Matriz completa por zona

Cada zona lista su repertorio: lo aprobado con status, lo rechazado con motivo y lo que el modelo podría producir y nadie ha revisado.
`;
for (const z of TARGETS_LIST) {
  const rows = universe.filter(u => u.target === z.id);
  const rep = REPERTOIRE[z.id] || {};
  md += `\n### ${z.n} (\`${z.id}\`)${z.anatomy ? ' · anatomía ' + z.anatomy : ''} · sensibilidad ${z.sensitivity} · presión ${z.pressureTolerance} · niveles ${z.allowedLevels.join(' ')}${rep.preferredStyles ? ' · estilos preferidos ' + rep.preferredStyles.join(' ') : ''}\n\n| Acción · herramienta | Status | Niveles | Motivo / nota | Frase |\n|---|---|---|---|---|\n`;
  const order = { EXCELLENT: 0, GOOD: 1, VALID: 2, REJECTED: 3, UNREVIEWED: 4 };
  for (const u of rows.sort((p, q) => order[p.status] - order[q.status] || p.action.localeCompare(q.action))) {
    const k = `${u.action}|${u.tool}|${u.target}`; const c = COMBO[k];
    md += `| ${ACTIONS[u.action].name} · ${ACTOR_TOOLS[u.tool].label} | ${u.status} | ${c ? c.levels.join(' ') : '—'} | ${u.status === 'REJECTED' ? REJECTED_REASON[k] : (c && c.notes) || ''} | ${c ? sample(c) : '—'} |\n`;
  }
}
writeFileSync(new URL('../content-review/auditoria-matriz.md', import.meta.url), md);

/* exportaciones para revisión humana */
const valid = approved.filter(c => c.status === 'VALID').sort((p, q) => p.target.localeCompare(q.target));
writeFileSync(new URL('../content-review/revision-valid.md', import.meta.url), `# Revisión humana · combinaciones VALID (${valid.length}) · ${date}

VALID = correcta pero menor: pesa poco en la elección. Para cada una, decidir: subir a GOOD, dejar en VALID (con nota) o pasar a \`rejectedActions\` con motivo.
Solo señala; no cambia nada. Editar en \`engine/data/repertoire.js\` o en Content Lab.

| Zona | Acción · herramienta | Niveles | Heurísticas | Frase | Decisión |
|---|---|---|---|---|---|
${valid.map(c => `| ${TARGETS[c.target].n} | ${ACTIONS[c.action].name} · ${ACTOR_TOOLS[c.tool].label} | ${c.levels.join(' ')} | ${suspicious(c.action, c.tool, c.target, c.status).join(', ')} | ${sample(c)} | |`).join('\n')}
`);
const un = unreviewedCombinations(), bps = unreviewedBlueprints();
writeFileSync(new URL('../content-review/revision-unreviewed.md', import.meta.url), `# Revisión humana · UNREVIEWED (${un.length} combinaciones · ${bps.length} blueprints) · ${date}

Nada de esta lista entra en el generador. Aprobar = añadir a \`approvedActions\` de la zona con status (EXCELLENT / GOOD / VALID); rechazar = \`rejectedActions\` con motivo.
Un blueprint posicional se aprueba en \`engine/data/positional.js\` (status APPROVED, tier, copy) o desde Content Lab.

## Blueprints posicionales pendientes

| ID | Acción | Quien actúa | Quien recibe | Orientación | Niveles | Copy | Notas |
|---|---|---|---|---|---|---|---|
${bps.map(b => `| ${b.id} | ${b.action} | ${b.actorRequirements.map(r => r.part + (r.anatomy ? ' (' + r.anatomy + ')' : '')).join(', ')} | ${b.receiverRequirements.map(r => r.part + (r.anatomy ? ' (' + r.anatomy + ')' : '')).join(', ')} | ${b.requiredOrientation || '—'} | ${b.allowedLevels.join(' ')} | ${b.copyVariants.length || 'SIN COPY'} | ${b.notes || ''} |`).join('\n')}

## Combinaciones (acción admite la herramienta, biomecánica posible, nadie ha decidido)

| Zona | Acción · herramienta | Niveles posibles | Íntima | Heurísticas |
|---|---|---|---|---|
${un.sort((p, q) => p.target.localeCompare(q.target)).map(u => `| ${TARGETS[u.target].n} | ${ACTIONS[u.action].name} · ${ACTOR_TOOLS[u.tool].label} | ${u.levels.join(' ')} | ${u.intimate ? 'sí: decide el diseñador' : ''} | ${suspicious(u.action, u.tool, u.target, 'UNREVIEWED').join(', ')} |`).join('\n')}
`);
console.log(`auditoría: ${universe.length} relaciones · aprobadas ${approved.length} (señaladas ${flagged.length}) · rechazadas ${REJECTED_COMBOS.size} · VALID exportadas ${valid.length} · UNREVIEWED exportadas ${un.length} + ${bps.length} blueprints`);
console.log('  content-review/auditoria-matriz.md · revision-valid.md · revision-unreviewed.md (solo lectura: nada se promociona)');
