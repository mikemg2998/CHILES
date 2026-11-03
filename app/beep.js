/* Aviso sonoro del temporizador: tres pitidos cortos y suaves («pip · pip · pip») con Web Audio, sin archivos de audio.
   - unlockAudio() se llama en el toque real que arranca el temporizador, antes de que haga falta el sonido.
     Prepara el sistema y no reproduce nada: pide la sesión de audio «playback» si el navegador la ofrece, crea el
     AudioContext y lo reanuda dentro del gesto, que es lo que exige iOS / Safari para poder sonar después sin toque.
   - SESIÓN DE AUDIO (iOS / Safari 16.4+): por defecto Safari trata el Web Audio como sonido «ambiente», que el interruptor
     de silencio del iPhone apaga. navigator.audioSession.type = 'playback' lo declara como reproducción, que suena aunque
     el interruptor esté en silencio. Donde navigator.audioSession no existe (Chrome, Android, Firefox, iOS antiguo) no se
     toca nada y todo sigue como antes.
   - Mientras no hay temporizador en marcha el audio queda suspendido y la sesión vuelve a «auto» (releaseAudio): así la
     sesión «playback», que en iOS interrumpe la música de otras apps, solo está activa desde que se toca el temporizador
     hasta justo después de los pitidos, o hasta que se cancela.
   - playBeeps() programa los tres tonos de una vez sobre el reloj del AudioContext (no depende de setTimeout).
   - Nunca cambia el volumen del dispositivo: si el navegador no deja sonar, no suena y el aviso visual sigue ahí. */
const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
export const BEEP = { count: 3, freq: 660, length: 0.13, gap: 0.17, peak: 0.22, attack: 0.012 };
let ctx = null, gen = 0;

/* sesión de audio de reproducción (iOS): solo si existe; nunca lanza */
export function preferPlaybackSession() {
  try {
    const s = typeof navigator !== 'undefined' ? navigator.audioSession : null;
    if (s && s.type !== 'playback') s.type = 'playback';
    return !!s;
  } catch { return false; }
}

export function unlockAudio() {
  if (!AC) return;
  gen++;
  try {
    preferPlaybackSession();
    if (!ctx) ctx = new AC();
    if (ctx.state !== 'running' && ctx.resume) ctx.resume().catch(() => {});
  } catch { /* sin audio: el aviso visual basta */ }
}
/* suelta el audio: suspende el contexto y devuelve la sesión a «auto». Solo si nadie lo ha vuelto a pedir desde entonces */
export function releaseAudio(after = 0) {
  const g = gen;
  const go = () => {
    if (g !== gen || !ctx) return;
    try { if (ctx.state === 'running' && ctx.suspend) ctx.suspend().catch(() => {}); } catch { /* nada */ }
    try { const s = navigator.audioSession; if (s && s.type === 'playback') s.type = 'auto'; } catch { /* nada */ }
  };
  if (after > 0) setTimeout(go, after); else go();
}
export const audioReady = () => !!ctx && ctx.state === 'running';

export function playBeeps() {
  if (!ctx) return false;
  try {
    preferPlaybackSession();
    if (ctx.state !== 'running' && ctx.resume) ctx.resume().catch(() => {}); // p. ej. «interrupted» tras bloquear el iPhone
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
    releaseAudio(Math.ceil((0.03 + BEEP.count * (BEEP.length + BEEP.gap)) * 1000) + 400);
    return true;
  } catch { return false; }
}
