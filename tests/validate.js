/* Validación estructural del contenido: una carta mal formada no llega al motor. */
import { validateContent, CARDS } from '../content/index.js';
const errors = validateContent();
if (errors.length) { console.error('✗ Contenido inválido:\n' + errors.map(e => '  · ' + e).join('\n')); process.exit(1); }
console.log(`✓ Contenido válido: ${CARDS.filter(c => !c.transition).length} cartas, ${CARDS.filter(c => c.status === 'APPROVED' && !c.transition).length} aprobadas`);
