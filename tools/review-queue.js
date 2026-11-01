/* Genera content-review/unreviewed.md: combinaciones que el modelo podría producir (acción admite la herramienta, zona
   alcanzable, biomecánica posible) y que NO están en el repertorio de la zona ni aprobadas ni rechazadas, más los blueprints
   posicionales pendientes. Nada de esta lista entra en el generador. Ejecutar: node tools/review-queue.js */
import { writeFileSync } from 'node:fs';
import { unreviewedCombinations, unreviewedBlueprints, TARGETS, ACTOR_TOOLS, ACTIONS } from '../engine/grammar.js';
const list = unreviewedCombinations(), bps = unreviewedBlueprints();
const row = u => `| ${u.action} | ${u.tool} (${ACTOR_TOOLS[u.tool].label}) | ${u.target} (${TARGETS[u.target].n}) | ${u.levels.join(' ')} | ${u.styles.join(' ') || '—'} | ${u.duration[0]}–${u.duration[1]} s | — | ${u.intimate ? 'íntima: decide el diseñador' : ''} | UNREVIEWED |`;
const head = '| ACTION | ACTOR TOOL | TARGET | LEVELS | STYLES | DURATION | COMPATIBILITY | NOTES | STATUS |\n|---|---|---|---|---|---|---|---|---|';
const intimate = list.filter(u => u.intimate), rest = list.filter(u => !u.intimate);
const md = `# Cola de revisión de contenido · ${new Date().toISOString().slice(0, 10)}

${list.length} combinaciones generables por el modelo que **no** están en el repertorio de su zona (\`engine/data/repertoire.js\`) y ${bps.length} blueprints posicionales pendientes. Nada de esto entra en el generador.
Para aprobar una combinación: añadirla a \`approvedActions\` de la zona con status EXCELLENT / GOOD / VALID (y niveles o estilos si hace falta), a mano o desde Content Lab (\`lab/\`).
Para rechazarla de forma explícita: \`rejectedActions\` con el motivo (queda documentada y desaparece de esta lista). Volver a generar con \`node tools/review-queue.js\`.

## Blueprints posicionales pendientes (${bps.length}) — decisión del diseñador en Content Lab

| ID | ACTION | QUIEN ACTÚA | QUIEN RECIBE | ORIENTACIÓN | LEVELS | STYLES | DURATION | COPY | STATUS |
|---|---|---|---|---|---|---|---|---|---|
${bps.map(b => `| ${b.id} | ${b.action} | ${b.actorRequirements.map(r => r.part + (r.anatomy ? ' (' + r.anatomy + ')' : '')).join(', ')} | ${b.receiverRequirements.map(r => r.part + (r.anatomy ? ' (' + r.anatomy + ')' : '')).join(', ')} | ${b.requiredOrientation || '—'} | ${b.allowedLevels.join(' ')} | ${b.allowedStyles.join(' ') || '—'} | ${b.durationRange[0]}–${b.durationRange[1]} s | ${b.copyVariants.length ? b.copyVariants.length + ' variantes' : 'SIN COPY (redactar)'} | ${b.status} |`).join('\n')}

## Anatomía íntima (${intimate.length}) — nunca por inferencia

${head}
${intimate.map(row).join('\n')}

## Resto del cuerpo (${rest.length})

${head}
${rest.map(row).join('\n')}
`;
writeFileSync(new URL('../content-review/unreviewed.md', import.meta.url), md);
console.log(`content-review/unreviewed.md · ${list.length} combinaciones sin revisar (${intimate.length} íntimas)`);
