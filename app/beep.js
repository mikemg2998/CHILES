/* Aviso sonoro del temporizador: tres pitidos cortos y suaves («pip · pip · pip») con Web Audio, sin archivos de audio.
   - unlockAudio() se llama dentro de un toque del usuario (al empezar el temporizador). Crea o reanuda el AudioContext y
     reproduce un búfer silencioso: es lo que exigen iOS / Safari para que el sonido posterior, que llega sin toque, suene.
   - playBeeps() programa los tres tonos de una vez sobre el reloj del AudioContext (no depende de setTimeout).
   - Nunca toca el volumen del dispositivo ni salta controles del navegador: si el navegador no deja sonar (contexto sin
     desbloquear, modo silencio del iPhone, sin Web Audio), simplemente no suena; el aviso visual sigue funcionando. */
const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
export const BEEP = { count: 3, freq: 660, length: 0.13, gap: 0.17, peak: 0.22, attack: 0.012 };
let ctx = null;

export function unlockAudio() {
  if (!AC) return;
  try {
    if (!ctx) ctx = new AC();
    if (ctx.state !== 'running' && ctx.resume) ctx.resume().catch(() => {});
    const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); // búfer silencioso: desbloqueo en iOS
    s.buffer = b; s.connect(ctx.destination); s.start(0);
  } catch { /* sin audio: el aviso visual basta */ }
}

export function playBeeps() {
  if (!ctx) return false;
  try {
    if (ctx.state !== 'running' && ctx.resume) ctx.resume().catch(() => {});
    const t0 = ctx.currentTime + 0.03;
    for (let i = 0; i < BEEP.count; i++) {
      const at = t0 + i * (BEEP.length + BEEP.gap);
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = BEEP.freq;
      // envolvente suave: subida corta, caída exponencial (sin clics, sin estridencia)
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(BEEP.peak, at + BEEP.attack);
      g.gain.exponentialRampToValueAtTime(0.0001, at + BEEP.length);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(at); osc.stop(at + BEEP.length + 0.02);
    }
    return true;
  } catch { return false; }
}
