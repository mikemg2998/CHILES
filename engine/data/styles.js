/* STYLES: cómo se hace. Cinco estilos; cada combinación aprobada admite solo los que tienen sentido para la acción Y la
   zona (intersección). El Text Composer los convierte en lenguaje natural, no en una etiqueta pegada: varias formas
   (adverbio junto al verbo o cláusula al final), elegidas según la plantilla.
   durationBias: hacia dónde empuja la duración (0 neutro, + largo, − corto) · intensityMod: cuánto mueve la intensidad
   · pressure/pace: dimensión que toca (para el feedback «un poco más / menos»). */
export const STYLES_LIST = [
  { id: 'SLOW', label: 'Despacio', durationBias: 0.6, intensityMod: 0.3, dim: 'pace', dir: -1,
    adv: ['despacio', 'lentamente', 'muy despacio', 'sin prisa'], clause: ['sin prisa', 'tomándote tu tiempo', 'muy despacio'] },
  { id: 'FAST', label: 'Rápido', durationBias: -0.6, intensityMod: 0.5, dim: 'pace', dir: 1,
    adv: ['con ritmo'], clause: ['a buen ritmo', 'con ritmo, sin pararte', 'cada vez más rápido'] },
  { id: 'SOFT', label: 'Suave', durationBias: 0.2, intensityMod: -0.4, dim: 'pressure', dir: -1,
    adv: ['suavemente', 'muy suavemente', 'con suavidad'], clause: ['apenas rozando la piel', 'con toda la suavidad que puedas', 'muy suave'] },
  { id: 'FIRM', label: 'Firme', durationBias: -0.2, intensityMod: 0.5, dim: 'pressure', dir: 1,
    adv: [], clause: ['con firmeza', 'apretando un poco', 'sin miedo a apretar', 'con decisión'] },
  { id: 'INTERMITTENT', label: 'A ratos', durationBias: 0.4, intensityMod: 0.4, dim: 'pace', dir: 0,
    adv: [], clause: ['con pequeñas pausas', 'parando y volviendo a empezar', 'a ratos', 'alternando pausas y contacto'] },
];
export const STYLES = Object.fromEntries(STYLES_LIST.map(s => [s.id, s]));
export const STYLE_IDS = STYLES_LIST.map(s => s.id);
