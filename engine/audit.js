/* HEURÍSTICAS DE AUDITORÍA · «técnicamente posible, editorialmente pobre». Señalan relaciones acción · herramienta · zona
   que entraron por regla genérica y conviene mirar con ojos humanos. Solo marcan: la decisión (status) es siempre de una
   persona, en engine/data/repertoire.js o en Content Lab. Las usan tools/audit-matrix.js y lab/. */
import { TARGETS, targetHeight } from './data/targets.js';
import { ACTOR_TOOLS } from './data/actorTools.js';
import { ACTIONS } from './data/actions.js';

export const HEURISTICS = [
  { id: 'ANTICIPACION_PLANA', why: 'acción sin contacto (soplar, acercarse) sobre una zona poco sensible o de hueso: no construye anticipación', test: (a, t, z) => a.contactType === 'ninguno' && (z.sensitivity < 3.5 || z.pressureTolerance === 'high') },
  { id: 'BOCA_SOBRE_HUESO', why: 'succión o mordisco sobre una zona poco sensible, de hueso o de alta tolerancia a la presión', test: (a, t, z) => ['SUCK', 'BITE'].includes(a.id) && (z.sensitivity < 3.5 || (z.pressureTolerance === 'high' && z.sensitivity < 5)) },
  { id: 'NARIZ_FORZADA', why: 'la nariz solo tiene sentido en zonas altas o muy sensibles', test: (a, t, z) => t.kind === 'face' && targetHeight(z) !== 'alta' && z.sensitivity < 6 },
  { id: 'PRESION_DONDE_NO_CABE', why: 'masaje, apretón o sujeción sobre una zona de baja tolerancia a la presión', test: (a, t, z) => ['MASSAGE', 'SQUEEZE', 'GRIP'].includes(a.id) && z.pressureTolerance === 'low' && !['hair', 'temples', 'palms'].includes(z.id) },
  { id: 'MANO_QUIETA_RARA', why: 'apoyar la mano en una zona lateral o estrecha: postura rara', test: (a, t, z) => a.id === 'REST' && (z.tags.includes('par') && !['shoulders', 'cheeks', 'outerThighs'].includes(z.id)) },
  { id: 'MENOR_CON_BOCA', why: 'combinación VALID (menor) con la boca: si no es excelente, probablemente no merece salir', test: (a, t, z, status) => status === 'VALID' && t.kind === 'mouth' && !z.tags.includes('intimo') },
  { id: 'INTIMA_GENERICA', why: 'acción genérica de mano sobre anatomía íntima con status menor: revisar la frase que sale', test: (a, t, z, status) => z.anatomy && ['CARESS', 'BRUSH', 'KISS'].includes(a.id) && status === 'VALID' },
  { id: 'HERRAMIENTA_PEQUENA_ZONA_GRANDE', why: 'un solo dedo o la punta de la lengua recorriendo una zona larga: gesto que se diluye', test: (a, t, z) => ['oneFinger', 'tongueTip'].includes(t.id) && z.tags.includes('largo') && z.sensitivity < 4 },
];
export function suspicious(action, tool, target, status) {
  const a = ACTIONS[action], t = ACTOR_TOOLS[tool], z = TARGETS[target];
  return HEURISTICS.filter(h => h.test(a, t, z, status)).map(h => h.id);
}

