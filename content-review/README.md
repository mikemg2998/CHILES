# content-review

Cola de curación humana del motor de dados. La fuente de verdad del generador es `engine/data/compatibility.js`: solo lo que
está allí con `status: 'APPROVED'` y un tier distinto de `INVALID` puede salir en una tirada.

- `unreviewed.md`: generado por `node tools/review-queue.js`. Combinaciones acción · herramienta · zona que el modelo podría
  producir y que nadie ha revisado. **Nunca** se hacen elegibles solas; una combinación íntima jamás se aprueba por inferencia.
- Para aprobar: edita `compatibility.js` (añade la zona con su tier, niveles y estilos) y vuelve a correr
  `node tests/validate.js` y `node --test 'tests/*.test.js'`.
- Para rechazar y que deje de aparecer: tier `INVALID` en una entrada de la misma acción · herramienta.

Formato de cada fila: ACTION · ACTOR TOOL · TARGET · LEVELS · STYLES · DURATION · COMPATIBILITY · NOTES · STATUS (APPROVED / REJECTED / UNREVIEWED).
