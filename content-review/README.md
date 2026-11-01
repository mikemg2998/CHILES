# content-review

Cola de curación humana del motor de dados. La fuente de verdad del generador es `engine/data/repertoire.js` (repertorio
deliberado por zona) y `engine/data/positional.js` (blueprints cuerpo con cuerpo). Solo lo que está ahí con status
EXCELLENT / GOOD / VALID (o APPROVED en los blueprints) puede salir en una tirada. REJECTED y UNREVIEWED no existen para el motor.

- `auditoria-matriz.md`, `revision-valid.md`, `revision-unreviewed.md`: generados por `node tools/audit-matrix.js`. Matriz completa
  zona × acción × herramienta con status y motivo, aprobadas que las heurísticas señalan, todas las VALID (decidir si suben o se
  rechazan) y todo lo UNREVIEWED más los blueprints pendientes. Solo lectura: **nunca** se promociona nada automáticamente.
- `unreviewed.md`: generado por `node tools/review-queue.js`. La cola corta de lo que el modelo podría producir y nadie ha revisado.
- Para decidir: Content Lab (`lab/index.html`) o editar los ficheros a mano. Aprobar = `approvedActions` con status; rechazar =
  `rejectedActions` con motivo. Después, `node tests/validate.js` y `node --test 'tests/*.test.js'`.
- `reclasificacion-3-niveles.md`: cómo se reclasificó cada combinación al pasar de cuatro niveles a tres.

Principio: alguien revisó esta relación y existe una razón para que salga. Una combinación íntima jamás se aprueba por inferencia.
