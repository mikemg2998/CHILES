/* Validación estructural de los datos del motor. Falla (exit 1) con cualquier error: zona/herramienta/acción inexistente,
   estilo imposible, rango de duración vacío o fuera de rango, combinación sin nivel, anatomía incoherente, acción sin
   realizador, combinación no verbalizable. Ejecutar: node tests/validate.js */
import { validateData, COMBOS, unreviewedCombinations, ACTIONS_LIST, TARGETS_LIST } from '../engine/grammar.js';
const v = validateData();
console.log(`== Validación de datos · ${ACTIONS_LIST.length} acciones · ${TARGETS_LIST.length} zonas · ${COMBOS.length} combinaciones aprobadas · ${unreviewedCombinations().length} sin revisar ==`);
for (const w of v.warn) console.log('  aviso:', w);
for (const e of v.errors) console.log('  ERROR:', e);
console.log(v.ok ? '✓ Datos válidos' : `✗ ${v.errors.length} errores`);
process.exit(v.ok ? 0 : 1);
