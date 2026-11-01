# Pollo a la brasa

Juego privado de dados para parejas adultas. **La pareja controla la dirección; el director de sesión controla la
calidad.** Cuatro dados (acción, zona, estilo, tiempo) muestran lo que el director propone: cada ronda tiene un
propósito, la pareja responde con ♡ o con el menú •••, y el nivel solo lo cambia la pareja desde el indicador, en
cualquier dirección y sin confirmaciones. El motor nunca sube ni baja el nivel por su cuenta. La sesión está completa en
cualquier nivel.

## Niveles

01 Conexión · 02 Deseo · 03 Intimidad. Tres, no cuatro: Deseo absorbe la antigua Exploración y tiene un rango interno
(low · mid · high) que la pareja nunca ve; se entra por abajo y la banda alta llega con la curva de la sesión. Intimidad
es el rango de mayor intimidad disponible, no una meta: la sesión está completa en cualquier nivel. «Me gusta» no es
querer más intensidad: favorece continuaciones compatibles dentro del nivel. «Más suave» y «un poco más / menos»
mueven la intensidad dentro del nivel; cambiar de nivel es siempre una decisión explícita de la pareja. Lo guardado con
cuatro niveles (modo y favoritos) se migra solo al cargar (`schema` 3 en `pab.v2`).

## Interfaz v7

Negro profundo + rojo picante + General Sans (servida por Fontshare, su distribuidor oficial, con licencia gratuita de
uso web). Tokens en `app/styles.css`: color, tipografía (DISPLAY · TITLE · BODY · LABEL · MICRO · BUTTON), espacio
(4 · 8 · 12 · 16 · 24 · 32 · 48 · 64), radios, bordes, movimiento y calor por nivel. El rojo solo va en lo que tiene
energía: CTA, nivel activo, flecha entre jugadores, nombre de quien recibe, línea del temporizador, selección. Tres masas
en pantalla: contexto (nivel, jugadores, dados) · interacción (frase, tiempo, feedback) · siguiente. Cuanta más intimidad,
menos interfaz.

## Arquitectura v6 (`engine/`, sin dependencias ni build)

El motor no combina piezas al azar: modela **interacciones diseñadas por personas** y las varía solo donde es seguro.
Una frase solo puede existir si la combinación acción · herramienta · zona está en la matriz de compatibilidad con
estado APPROVED.

Datos editables, en `engine/data/`:

- `targets.js` — 47 zonas con id en inglés y nombre natural en español, grupo, familia, anatomía (vulva / pene), sensibilidad, tolerancia a la presión, estilos admitidos, niveles admitidos y pesos por nivel.
- `actorTools.js` — 29 partes del cuerpo que actúan (una mano, las dos manos, un dedo, labios, boca, lengua, aliento, caderas, muslo, cuerpo…), con su tipo y alcance.
- `actions.js` — 24 acciones con metadatos (familia semántica, patrón, herramientas admitidas, estilos, niveles, intensidad, movimiento, presión, reglas biomecánicas). Las diez de base: FROTAR, APRETAR, MASAJEAR, LAMER, CHUPAR, ESTIMULAR, COSQUILLEAR, ROZAR, BESAR, ACARICIAR. Sin acciones casi sinónimas.
- `styles.js` — estilos LENTO, RÁPIDO, SUAVE, FIRME, A RATOS: cambio de intensidad, dimensión (ritmo / presión) y cómo se dicen (adverbio o coletilla).
- `durations.js` — rangos base por acción, modificadores por zona, estilo y nivel, duraciones humanas discretas (15, 20, 30, 45, 60, 75, 90, 120; 180 solo donde tiene sentido), sin azar continuo.
- `repertoire.js` — **el repertorio por zona**: cada zona lista las relaciones `acción · herramienta` que merecen aparecer en ella (`approvedActions` con status EXCELLENT / GOOD / VALID, niveles y estilos recortados, notas), las rechazadas con motivo (`rejectedActions`: técnicamente posibles, editorialmente pobres), sus estilos preferidos y sus duraciones por acción. La pregunta no es «¿es posible?» sino «¿esta acción merece aparecer aquí?». Lo que no está es UNREVIEWED y nunca sale; nada se promociona por inferencia.
- `positional.js` — **blueprints posicionales**: interacciones cuerpo con cuerpo (pecho contra espalda, caderas, frente con frente, sentarse sobre los muslos…) cuya calidad depende de una configuración concreta de los dos cuerpos. Cada una está diseñada a mano con status APPROVED / UNREVIEWED / REJECTED, requisitos de quien actúa y de quien recibe (parte y anatomía), orientación, niveles, estilos, rango de duración, copy propio, peso y tier. Nunca se generan por producto cartesiano; un UNREVIEWED no entra hasta que alguien le escribe el copy y lo aprueba.
- `shapes.js` — estructuras de frase por acción (varias por acción, con huecos para la zona, la herramienta cuando no es obvia y el estilo) y las estructuras del patrón GUIADO.
- `legacy.js` — mapa de ids antiguos (favoritos guardados) a los nuevos.

Motor:

- `grammar.js` — compila y valida los datos, calcula las combinaciones elegibles (`COMBOS`: las cartesianas aprobadas del repertorio más los blueprints posicionales APPROVED, con clave `POS:id`), la intensidad de cada una, las que se pueden guiar, los niveles (con `levelWeight`, que en Deseo interpola el perfil [bajo, alto] de cada acción y zona), el status de cualquier relación (`statusOf`), el universo técnico (`possibleCombinations`), los requisitos corporales de un blueprint (`blueprintAvailable`) y las listas de lo que falta por revisar.
- `audit.js` — heurísticas de sospecha («técnicamente posible, editorialmente pobre»); solo señalan.
- `repertoireIO.js` — serializa el repertorio y los blueprints al formato exacto de `engine/data/` (lo usa Content Lab).
- `duration.js` — motor de duraciones: rango → opciones discretas → elección ponderada.
- `realizer.js` — convierte la interacción en una frase que suena escrita por una persona: elige estructura evitando las recientes, omite la herramienta obvia, coloca el estilo como adverbio o coletilla (nunca repite el verbo ni cuelga una segunda coletilla), añade la guía de la pareja, y puntúa `humanLikeness` (longitud, comas, palabras repetidas, nombre repetido, complementos encadenados).
- `quality.js` — comprobaciones críticas con código de rechazo (anatomía, «hoy no», nivel, estilo, guía, duración, frase poco natural…), `qualityScore` (orden: anatomía > seguridad > biomecánica > calidad humana > nivel > sesión > novedad > diversidad), umbral y fallbacks validados a mano.
- `engine.js` — generación: propósito del director → objetivo de intensidad (acotado a lo que el repertorio alcanza) → candidatas aprobadas en el nivel (enfriamientos por acción, zona, familia, frase) → estilo solo con razón → guía de la pareja solo si la acción lo admite → frase → comprobaciones → calidad → elección.
- `session.js` — estado de sesión, director (CONNECT · BUILD · EXPLORE · DEEPEN · MAINTAIN · VARIATION · COOLDOWN · END; nunca cambia el nivel), feedback (solo mueve pesos, no hay perfiles), check-in y preferencias sí / quizá / hoy no.
- `history.js`, `intensity.js`, `prefs.js`, `rng.js` — memoria de sesión, objetivos de intensidad, preferencias (partes del cuerpo por jugador, no género), azar con semilla.

`app/` solo muestra y anima: dados, temporizador minimalista (toca para empezar, discreto al acabar), indicador de nivel, ♡ y •••, check-in, «Lo nuestro». No toca el motor.

### Patrón GUIADO

Una variante de cualquier acción manual: la pareja que recibe guía con su mano la mano de quien actúa (ritmo, presión,
movimiento o posición). No es un dado ni una condición: el director lo propone cuando ayuda (descubrir, continuar tras
un «me gusta», variar sin subir intensidad). Solo en acciones con mano libre, zonas frontales y frases cortas; no cambia
el nivel.

## Revisión de contenido

Cada relación acción · herramienta · zona tiene exactamente un status: EXCELLENT · GOOD · VALID · REJECTED · UNREVIEWED.
Solo los tres primeros entran al generador. El principio: **alguien revisó esta relación y existe una razón para que salga.**
Caso de partida del pase editorial (2026-11-01): «Sopla sobre las clavículas…» era técnicamente posible y editorialmente
pobre; ahora SOPLAR + CLAVÍCULAS es REJECTED con motivo, igual que otras 18 combinaciones que entraban por regla genérica, y
hay un test que lo garantiza (`tests/strict.test.js`).

- **Content Lab** (`lab/index.html`, también publicado en `/lab/`): herramienta de curación real. Abre una zona (por ejemplo
  CLAVÍCULAS) y ve cada acción · herramienta con su status, niveles, motivo y la frase que saldría; cambia la clasificación,
  los estilos preferidos y las duraciones; edita los blueprints posicionales (copy, status, tier, duración, estilos, peso,
  requisitos) o crea uno nuevo; mira la auditoría; y exporta `repertoire.js` y `positional.js` listos para `engine/data/`. El
  borrador vive solo en ese navegador (`localStorage` `pab.lab`); nada entra al motor hasta guardar el fichero y pasar la validación.
- `node tools/audit-matrix.js` → `content-review/auditoria-matriz.md` (matriz completa zona × acción × herramienta con status y
  motivo, más las aprobadas que las heurísticas señalan), `revision-valid.md` (todas las VALID) y `revision-unreviewed.md`
  (todo lo UNREVIEWED y los blueprints pendientes). Solo lee: nunca promociona nada.
- `node tools/review-queue.js` → `content-review/unreviewed.md`, la cola corta.
- `content-review/reclasificacion-3-niveles.md` documenta la reclasificación de cuatro niveles a tres.

## Privacidad

En el teléfono se guardan únicamente nombres, partes del cuerpo, zonas activas, el último nivel, «Lo nuestro», la vibración
y si la configuración inicial está hecha (`localStorage`, clave `pab.v2`). La sesión (cómo llegáis hoy, sí / quizá / hoy no,
feedback, intensidad) vive en memoria y desaparece al cerrar. No hay telemetría ni nada remoto.

## Pruebas

```
node tests/validate.js                 # validación estructural de los datos (falla si hay errores)
node --test 'tests/*.test.js'          # tests de datos, duraciones, realizador, guiado, motor, tres niveles y compatibilidad estricta
node tests/simulate.js 1000 --sample   # simulación por nivel y anatomía; debe terminar en «✓ Todo correcto»
node tests/stress.js 10000 --audit=auditoria.txt --session=sesion.txt   # 10.000 tiradas: frecuencias, rechazos, auditoría de 200 y sesión de 50
node tools/review-queue.js             # regenera content-review/unreviewed.md
node tools/audit-matrix.js             # auditoría de la matriz + exportación de VALID y UNREVIEWED (solo lectura)
```

Regla de oro: no se arreglan frases, se arregla el sistema que las permitió. Una interacción mala durante una prueba real se convierte en un test sobre la propiedad que falló, nunca en una lista negra.

Modo debug para desarrollo: abrir la app con `?debug` muestra propósito, patrón, pesos, rechazos y puntuación de cada ronda (`window.pab` es el motor).

Se publica en GitHub Pages desde `main`.
