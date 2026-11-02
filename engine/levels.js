/* Tres niveles. La pareja decide cuándo cambiar y en qué dirección; el motor nunca lo hace solo (nextLevel = USER_DECISION).
   Lo guardado con cuatro niveles (01 Conexión · 02 Deseo · 03 Exploración · 04 Intimidad) se migra: Exploración → Deseo. */
export const LEVELS = {
  1: { id: 1, key: 'conexion', name: 'Conexión', tagline: 'No tenemos que llegar a ningún sitio.' },
  2: { id: 2, key: 'deseo', name: 'Deseo', tagline: 'Con la ropa puesta. Hasta donde queramos.' },
  3: { id: 3, key: 'intimidad', name: 'Intimidad', tagline: 'Nosotros decidimos hasta dónde.' },
};
export const LEVEL_IDS = [1, 2, 3];
export const LEVEL_KEYS = ['conexion', 'deseo', 'intimidad'];
export const LEVEL_BY_KEY = { conexion: 1, deseo: 2, intimidad: 3, exploracion: 2, atrevido: 2, suave: 1, intenso: 3 };
export const migrateLevelId = id => ({ 1: 1, 2: 2, 3: 2, 4: 3 }[Number(id)] || 1);
export const LEVEL_COPY = { 1: 'Acercarnos.', 2: 'Un poco más cerca.', 3: 'Hasta donde queramos.' };
