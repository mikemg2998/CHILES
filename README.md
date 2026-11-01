# Pollo a la brasa

Juego privado de dados para parejas adultas. Cuatro dados (acción, zona, forma, condición) representan lo que decide un
**director de sesión**: cada ronda tiene un propósito, la pareja da feedback y el nivel solo cambia cuando los dos lo
deciden en privado. La sesión está completa en cualquier nivel.

## Niveles

Conexión · Deseo · Exploración · Intimidad. Subir pasa siempre por una puerta: cada uno elige en privado
(Parar · Quedarnos aquí · Seguir · Subir) y vale la opción más baja; nunca se dice quién eligió qué.

## Arquitectura (`engine/`, sin dependencias ni build)

- `catalog.js` — base de contenido: zonas, acciones (con parte del cuerpo que actúa, patrón y familia), formas, condiciones.
- `meta.js` — metadatos multidimensionales derivados (intensidad física, explicitud, vulnerabilidad, proximidad, reciprocidad, control, duración) y familia semántica.
- `session.js` — estado de sesión, director (CONNECT · BUILD · EXPLORE · DEEPEN · MAINTAIN · COOLDOWN · END), feedback (me gusta / cambia / paso, más / menos), intención «esta noche quiero…», «hoy no…», puertas y finales.
- `compat.js` — compatibilidad entre piezas y validador de la combinación.
- `quality.js` — comprobaciones críticas (anatomía, física, semántica, nivel, estado), puntuación de calidad, umbral y fallback validado a mano.
- `engine.js` — generación: director → candidatos (azar ponderado) → se construye con y sin condición → filtro de calidad → frase.
- `history.js`, `intensity.js`, `nlg.js`, `prefs.js`, `rng.js` — memoria de sesión, intensidad, compositor de texto, preferencias, azar con semilla.

`app/` solo muestra y anima (dados con física, hojas de inicio y de puerta, feedback). No toca el motor.

## Privacidad

En el teléfono se guardan únicamente nombres, anatomía, zonas activas, favoritas y la vibración (`localStorage`).
La sesión (intención, «hoy no», feedback, puertas) vive en memoria y desaparece al cerrar. No hay telemetría ni nada remoto.

## Pruebas

```
node --test tests/          # tests obligatorios del motor
node tests/simulate.js 1000 --sample   # simulación por nivel; debe terminar en «✓ Todo correcto»
```

Modo debug para desarrollo: abrir la app con `?debug` muestra propósito, familia, pesos, rechazos y puntuación de cada ronda.

Se publica en GitHub Pages desde `main`.
