# Pollo a la brasa

Juego privado de dados para parejas adultas. **La pareja controla la dirección; el director de sesión controla la
calidad.** Cuatro dados (acción, zona, forma, condición) muestran lo que el director propone: cada ronda tiene un
propósito, la pareja responde con ♡ o con el menú •••, y el nivel solo lo cambia la pareja desde el indicador, en
cualquier dirección y sin confirmaciones. El motor nunca sube ni baja el nivel por su cuenta. La sesión está completa en
cualquier nivel.

## Niveles

01 Conexión · 02 Deseo · 03 Exploración · 04 Intimidad. Cada uno con su repertorio, su intensidad y su identidad visual
(cuanto más íntimo, más rojo profundo y menos interfaz). «Me gusta» no es querer más intensidad: favorece
continuaciones compatibles dentro del nivel. «Más suave» baja la intensidad dentro del nivel; «Bajar de nivel» es otra cosa.

## Arquitectura (`engine/`, sin dependencias ni build)

- `catalog.js` — base de contenido: zonas, acciones (con parte del cuerpo que actúa, patrón y familia), formas, condiciones.
- `meta.js` — metadatos multidimensionales derivados (intensidad física, explicitud, vulnerabilidad, proximidad, reciprocidad, control, duración) y familia semántica.
- `session.js` — estado de sesión (nivel, intensidad dentro del nivel, rondas sin escalada, feedback), director (CONNECT · BUILD · EXPLORE · DEEPEN · MAINTAIN · VARIATION · COOLDOWN · END; nunca cambia el nivel), feedback (me gusta / cambia / paso, más / menos), check-in «¿cómo llegáis hoy?», preferencias sí / quizá / hoy no, cambio de nivel manual y cierres.
- `compat.js` — compatibilidad entre piezas y validador de la combinación.
- `quality.js` — comprobaciones críticas (anatomía, física, semántica, nivel, estado), puntuación de calidad, umbral y fallback validado a mano.
- `engine.js` — generación: director → candidatos (azar ponderado) → se construye con y sin condición → filtro de calidad → frase.
- `history.js`, `intensity.js`, `nlg.js`, `prefs.js`, `rng.js` — memoria de sesión (anti-repetición por id y por familia semántica), intensidad, compositor de texto, preferencias (partes del cuerpo por jugador, no género), azar con semilla.

`app/` solo muestra y anima: dados con física que pasan a segundo plano tras el resultado, indicador de nivel, ♡ y •••, check-in, «Lo nuestro». No toca el motor.

## Privacidad

En el teléfono se guardan únicamente nombres, partes del cuerpo, zonas activas, el último nivel, «Lo nuestro», la vibración
y si la configuración inicial está hecha (`localStorage`, clave `pab.v2`). La sesión (cómo llegáis hoy, sí / quizá / hoy no,
feedback, intensidad) vive en memoria y desaparece al cerrar. No hay telemetría ni nada remoto.

## Pruebas

```
node --test 'tests/*.test.js'   # tests obligatorios del motor
node tests/simulate.js 1000 --sample   # simulación por nivel; debe terminar en «✓ Todo correcto»
```

Modo debug para desarrollo: abrir la app con `?debug` muestra propósito, patrón, familia, pesos, rechazos, intensidad dentro del nivel y puntuación de cada ronda (`window.pab` es el motor).

Se publica en GitHub Pages desde `main`.
