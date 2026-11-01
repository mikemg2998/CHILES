/* Genera content-review/unreviewed.md: combinaciones que el modelo podría producir (acción admite la herramienta, zona
   alcanzable, biomecánica posible) y que NO están en la matriz ni aprobadas ni rechazadas. Nada de esta lista entra en el
   generador. Ejecutar: node tools/review-queue.js */
import { writeFileSync } from 'node:fs';
import { unreviewedCombinations, TARGETS, ACTOR_TOOLS, ACTIONS } from '../engine/grammar.js';
const list = unreviewedCombinations();
const row = u => `| ${u.action} | ${u.tool} (${ACTOR_TOOLS[u.tool].label}) | ${u.target} (${TARGETS[u.target].n}) | ${u.levels.join(' ')} | ${u.styles.join(' ') || '—'} | ${u.duration[0]}–${u.duration[1]} s | — | ${u.intimate ? 'íntima: decide el diseñador' : ''} | UNREVIEWED |`;
const head = '| ACTION | ACTOR TOOL | TARGET | LEVELS | STYLES | DURATION | COMPATIBILITY | NOTES | STATUS |\n|---|---|---|---|---|---|---|---|---|';
const intimate = list.filter(u => u.intimate), rest = list.filter(u => !u.intimate);
const md = `# Cola de revisión de contenido · ${new Date().toISOString().slice(0, 10)}

${list.length} combinaciones generables por el modelo que **no** están en \`engine/data/compatibility.js\`. Ninguna entra en el generador.
Para aprobar una: añadir la zona a la entrada de su acción·herramienta con un tier (EXCELLENT / GOOD / VALID) y, si hace falta, niveles o estilos.
Para rechazarla de forma explícita: tier \`INVALID\` (queda documentada y desaparece de esta lista). Volver a generar con \`node tools/review-queue.js\`.

## Anatomía íntima (${intimate.length}) — nunca por inferencia

${head}
${intimate.map(row).join('\n')}

## Resto del cuerpo (${rest.length})

${head}
${rest.map(row).join('\n')}
`;
writeFileSync(new URL('../content-review/unreviewed.md', import.meta.url), md);
console.log(`content-review/unreviewed.md · ${list.length} combinaciones sin revisar (${intimate.length} íntimas)`);
