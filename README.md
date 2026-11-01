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

- `catalog.js` — base de contenido: zonas, acciones (con parte del cuerpo que actúa, patrón y familia), formas, condiciones (con nivel LIGHT / INTERACTION / SETUP y orientación).
- `blueprints.js` — **fuente de verdad del generador**: escenas corporales que sabemos que funcionan (familia semántica, patrón, acciones, zonas admisibles, formas y condiciones que les sientan bien). El azar solo varía dentro de un blueprint; acción / zona / forma / condición son la representación en dados del resultado.
- `body.js` — **motor de mecánica corporal**: capacidades de cada parte que actúa, relaciones de cuerpo entero en lista blanca (torso, pelvis, piernas nunca se inventan), altura y lado de cada zona, movimiento que exige cada acción, orientación, complejidad de posición (0 inmediata · 1 natural · 2 específica · 3 torpe), libertad de movimiento y equilibrio. Anatómicamente posible ≠ físicamente posible ≠ biomecánicamente natural ≠ buena interacción.
- `meta.js` — metadatos multidimensionales derivados (intensidad física, explicitud, vulnerabilidad, proximidad, reciprocidad, control, duración) y familia semántica.
- `session.js` — estado de sesión (nivel, intensidad dentro del nivel, rondas sin escalada, feedback), director (CONNECT · BUILD · EXPLORE · DEEPEN · MAINTAIN · VARIATION · COOLDOWN · END; nunca cambia el nivel), feedback (me gusta / cambia / paso, más / menos), check-in «¿cómo llegáis hoy?», preferencias sí / quizá / hoy no, cambio de nivel manual y cierres.
- `compat.js` — compatibilidad entre piezas y validador de la combinación.
- `quality.js` — comprobaciones críticas con código de rechazo (anatomía, física, biomecánica, movimiento, semántica, nivel, estado, SETUP sin blueprint), puntuación de calidad (lenguaje, novedad, valor, continuidad, naturalidad corporal, sencillez de posición, naturalidad del movimiento, valor de forma y de condición), umbral y fallback validado a mano.
- `engine.js` — generación: director (propósito) → blueprint → acción y zona dentro del blueprint (validadas por biomecánica) → forma solo con razón → condición solo con razón de contexto y dentro del nivel que admite el blueprint → cada añadido se queda únicamente si la frase mejora sin él (remove-each-component) → filtro de calidad → frase. Las condiciones SETUP (venda, música, luz, posturas) solo salen en blueprints diseñados para ellas.
- `history.js`, `intensity.js`, `nlg.js`, `prefs.js`, `rng.js` — memoria de sesión (anti-repetición por id y por familia semántica), intensidad, compositor de texto, preferencias (partes del cuerpo por jugador, no género), azar con semilla.

`app/` solo muestra y anima: dados con física que pasan a segundo plano tras el resultado, indicador de nivel, ♡ y •••, check-in, «Lo nuestro». No toca el motor.

## Privacidad

En el teléfono se guardan únicamente nombres, partes del cuerpo, zonas activas, el último nivel, «Lo nuestro», la vibración
y si la configuración inicial está hecha (`localStorage`, clave `pab.v2`). La sesión (cómo llegáis hoy, sí / quizá / hoy no,
feedback, intensidad) vive en memoria y desaparece al cerrar. No hay telemetría ni nada remoto.

## Pruebas

```
node --test 'tests/*.test.js'   # tests del motor, de mecánica corporal, de cobertura de blueprints y regresiones estructurales
node tests/simulate.js 1000 --sample   # simulación por nivel; debe terminar en «✓ Todo correcto»
node tests/stress.js 10000 --sample=100 --out=muestra.txt   # stress test: distribución, razones de rechazo y muestra legible para auditar a mano
```

Regla de oro: no se arreglan frases, se arregla el sistema que las permitió. Una interacción mala durante una prueba real se convierte en un test sobre la propiedad que falló, nunca en una lista negra.

Modo debug para desarrollo: abrir la app con `?debug` muestra propósito, patrón, familia, pesos, rechazos, intensidad dentro del nivel y puntuación de cada ronda (`window.pab` es el motor).

Se publica en GitHub Pages desde `main`.
