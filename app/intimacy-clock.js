/* RELOJ INTERNO DE INTIMIDAD (2026-11-04). Nunca se muestra: solo alimenta la atmósfera visual.
   - Cuenta tiempo real de experiencia mientras la sesión está activa en Intimidad (nivel 3, sesión empezada, no terminada).
     Conexión y Deseo no lo inician ni lo acumulan; salir de Intimidad lo congela y volver lo reanuda con lo acumulado.
   - Por marcas de tiempo (now() − desde), no sumando ticks: un render, un cambio de pantalla o un intervalo que no
     dispara no pierde ni duplica tiempo.
   - Ausencias largas: cada hueco entre dos lecturas suma como máximo GAP_CAP_MS (5 min). Teléfono bloqueado durante una
     carta o pantalla apagada unos minutos cuentan; una ausencia de una hora no produce, al volver, una transición engañosa.
   - Solo `reset()` (sesión completamente nueva) lo pone a cero. Cambios de carta, ropa, posición, feedback o director no lo tocan.
   - Módulo puro: sin DOM ni motor. El motor de cartas no lo importa, así que el tiempo no entra en elegibilidad ni pesos. */
export const HEAT_START_MIN = 35; // hasta aquí, sin cambio visual
export const HEAT_FULL_MIN = 40;  // desde aquí, estado final estable
export const GAP_CAP_MS = 5 * 60 * 1000;
const MIN = 60 * 1000;

/* 0 … 1: 0 hasta el minuto 35, lineal hasta 1 en el 40, y 1 para siempre después */
export function heatAt(ms) {
  const m = ms / MIN;
  if (!(m > HEAT_START_MIN)) return 0;
  if (m >= HEAT_FULL_MIN) return 1;
  return (m - HEAT_START_MIN) / (HEAT_FULL_MIN - HEAT_START_MIN);
}

export class IntimacyClock {
  constructor(now = () => Date.now()) { this.now = now; this.reset(); }
  /* sesión completamente nueva */
  reset() { this.elapsed = 0; this.since = null; this.startedAt = null; }
  get running() { return this.since != null; }
  /* suma el tramo desde la última lectura (como máximo GAP_CAP_MS) y deja la marca en «ahora» */
  settle() {
    if (this.since == null) return this.elapsed;
    const t = this.now(), gap = t - this.since;
    if (gap > 0) this.elapsed += Math.min(gap, GAP_CAP_MS); // un reloj del sistema que retrocede no resta
    this.since = t;
    return this.elapsed;
  }
  /* activo = la pareja está en Intimidad con la sesión en marcha. Cada llamada es una lectura (suma el tramo con tope);
     llamarlo mil veces en el mismo instante no suma nada. */
  setActive(on) {
    if (on) { if (this.since == null) { this.since = this.now(); if (this.startedAt == null) this.startedAt = this.since; } else this.settle(); }
    else if (this.since != null) { this.settle(); this.since = null; }
    return this.elapsed;
  }
  elapsedMs() { return this.settle(); }
  heat() { return heatAt(this.settle()); }
}
